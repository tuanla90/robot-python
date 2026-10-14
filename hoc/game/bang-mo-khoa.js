/* ============================================================================
   bang-mo-khoa.js — "Đường học": BẢNG "MỞ KHÓA BỘ PHẬN MỚI!" (window.MoKhoa).
   Hiện đúng một lần, khi người chơi vừa thắng trùm của chương cổng (ThuTuChuong.congDot2): liệt kê các chương đợt 2 (ThuTuChuong.dot2)
   vừa mở cùng lúc, mỗi chương một huy hiệu (HuyHieu.ve, vẽ bằng chính hình part của chương) + tên chương.
   App.moKhoaDot2() (ung-dung.js) lo chuyện "chỉ một lần" (cờ 'mo-khoa-dot2' ở Luu) rồi gọi MoKhoa.mo(khiXong).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;

  /** Hình của một chương: huy hiệu của chương nếu có, không thì dấu + để giữ chỗ. */
  function hinhChuong(ma) {
    var co = window.HuyHieu && HuyHieu.DS && HuyHieu.DS.indexOf(ma) >= 0;
    return co ? Ve.mk(HuyHieu.ve(ma, 'mo'), 2) : Ve.ico('plus', 4, { fill: '#ffd95a', line: '#1b120a' });
  }

  /** Mở bảng; bấm "Tuyệt!" thì đóng và gọi khiXong (nếu có). */
  function mo(khiXong) {
    var ds = (window.ThuTuChuong && ThuTuChuong.dot2) || [];
    var hop = TP.Hop.mo(t('moKhoa.tieuDe'), 'hop-mo-khoa');
    hop.hop.setAttribute('data-hop', 'mo-khoa');
    hop.than.appendChild(h('div', 'mk-loi', t('moKhoa.loi')));
    var luoi = h('div', 'mk-luoi');
    ds.forEach(function (ma, i) {
      var o = h('div', 'mk-o'); o.setAttribute('data-chuong', ma); o.style.animationDelay = (0.12 + i * 0.07) + 's';
      var hinh = h('div', 'mk-hinh'); hinh.appendChild(hinhChuong(ma)); o.appendChild(hinh);
      o.appendChild(h('div', 'mk-ten', window.App ? App.tenChuong(ma) : ma));
      luoi.appendChild(o);
    });
    hop.than.appendChild(luoi);
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-gr', t('moKhoa.nut'), function () { TP.Hop.dong(); if (khiXong) khiXong(); }, 'mo-khoa-xong'));
    hop.than.appendChild(hang);
  }

  window.MoKhoa = { mo: mo };
})();
