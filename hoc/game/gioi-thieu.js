/* ============================================================================
   gioi-thieu.js — "Đường học": GIỚI THIỆU LẦN ĐẦU CHƠI (window.GioiThieu).
   Bốn trang ngắn trong một hộp (robot · viết lệnh + Chạy · gom sao · mở bộ phận mới), có chấm trang, Bỏ qua / Tiếp.
   ung-dung.js mở khi chưa có cờ 'gioi-thieu' (Luu.daXem); Cài đặt có nút "Xem lại giới thiệu".
   Cách chơi chi tiết của từng màn vẫn do hướng dẫn trong màn lo (huong-dan-man.js).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var ROBOT = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };   // như robot ở màn khởi đầu
  var SO_TRANG = 4;

  function hinhRobot(cauHinh, tiLe) {
    if (!window.VeRobot) return h('div');
    try { return VeRobot.ve(cauHinh, { wl: 0, wr: 0, ph: 0, tay: { tuThe: 'tren', kep: false } }, 1, tiLe); } catch (e) { return h('div'); }
  }
  function huyHieu(ma) {
    var co = window.HuyHieu && HuyHieu.DS && HuyHieu.DS.indexOf(ma) >= 0;
    return co ? Ve.mk(HuyHieu.ve(ma, 'mo'), 2) : Ve.ico('box', 3, { fill: '#ffd95a', line: '#1b120a' });
  }
  /** Hình minh họa của trang i (1..4). */
  function hinh(i) {
    var w = h('div', 'gt-hinh chalk gt-h' + i);
    if (i === 1) { var c = hinhRobot(ROBOT, 3); c.className = 'pxi'; w.appendChild(c); }
    else if (i === 2) {
      var code = h('div', 'gt-code');
      ['left_move()', 'right_move()', 'wait()'].forEach(function (s, k) { var d = h('div', 'gt-dong'); d.appendChild(h('span', 'so', String(k + 1))); d.appendChild(h('span', 'kc', s)); code.appendChild(d); });
      w.appendChild(code);
      var chay = h('div', 'bt g-gr gt-chay'); chay.appendChild(Ve.ico('play', 2)); chay.appendChild(h('span', null, t('choi.chay')));
      w.appendChild(chay);
    } else if (i === 3) {
      for (var k = 0; k < 3; k++) { var s = h('span', 'gt-sao'); s.style.animationDelay = (0.1 + k * 0.18) + 's'; s.appendChild(Ve.sao(true, 4)); w.appendChild(s); }
    } else {
      ['tay-gap', 'khoang-cach', 'drone'].forEach(function (ma) { var o = h('span', 'gt-hh'); o.appendChild(huyHieu(ma)); w.appendChild(o); });
    }
    return w;
  }

  /** Mở giới thiệu từ trang 1; xong (Bắt đầu / Bỏ qua) thì ghi cờ, đóng hộp, gọi khiXong. */
  function mo(khiXong) {
    var hop = TP.Hop.mo(t('gt.1.td'), 'hop-gioi-thieu');
    hop.hop.setAttribute('data-hop', 'gioi-thieu');
    var td = hop.hop.querySelector('.hop-td');
    var khung = h('div', 'gt-khung'); hop.than.appendChild(khung);
    var cham = h('div', 'gt-cham'); for (var i = 0; i < SO_TRANG; i++) cham.appendChild(h('i'));
    hop.than.appendChild(cham);
    var hang = h('div', 'hop-hang');
    var boQua = TP.Hop.nut('g-wd', t('gt.boQua'), function () { xong(); }, 'gt-bo-qua');
    var tiep = TP.Hop.nut('g-gr', t('gt.tiep'), function () { if (trang < SO_TRANG) ve(trang + 1); else xong(); }, 'gt-tiep');
    hang.appendChild(boQua); hang.appendChild(tiep);
    hop.than.appendChild(hang);

    var trang = 1;
    function ve(n) {
      trang = n;
      td.textContent = t('gt.' + n + '.td');
      khung.innerHTML = '';
      khung.appendChild(hinh(n));
      khung.appendChild(TP.vanBan(h('div', 'hop-chu gt-chu'), t('gt.' + n + '.chu')));
      Array.prototype.forEach.call(cham.children, function (c, i) { c.classList.toggle('on', i === n - 1); });
      tiep.textContent = n < SO_TRANG ? t('gt.tiep') : t('gt.batDau');
      boQua.style.visibility = n < SO_TRANG ? '' : 'hidden';
      if (n > 1 && window.AmThanh) AmThanh.phat('lat');
    }
    function xong() {
      Luu.datDaXem('gioi-thieu');
      TP.Hop.dong();
      if (khiXong) khiXong();
    }
    ve(1);
  }

  window.GioiThieu = { mo: mo };
})();
