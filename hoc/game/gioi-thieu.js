var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   gioi-thieu.js — "Robot Chấn Hưng": GIỚI THIỆU LẦN ĐẦU CHƠI (window.GioiThieu).
   Ba trang mẹo chơi trong một hộp (viết lệnh + Chạy · gom sao · mở bộ phận mới), có chấm trang, Bỏ qua / Tiếp.
   Chiếu ngay sau phim mở đầu (mo-dau.js): phim kể vì sao, ba trang này chỉ cách chơi.
   Cách chơi chi tiết của từng màn vẫn do hướng dẫn trong màn lo (huong-dan-man.js).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var TRANG = [2, 3, 4];                // mã trang trong chu.js (gt.2 … gt.4); trang 1 cũ nay là phim mở đầu

  function huyHieu(ma) {
    var co = window.HuyHieu && HuyHieu.DS && HuyHieu.DS.indexOf(ma) >= 0;
    return co ? Ve.mk(HuyHieu.ve(ma, 'mo'), 2) : Ve.ico('box', 3, { fill: BM.vang, line: BM.vienDam });
  }
  /** Hình minh họa của trang i (2..4). */
  function hinh(i) {
    var w = h('div', 'gt-hinh chalk gt-h' + i);
    if (i === 2) {
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

  /** Mở từ trang mẹo đầu tiên; xong (Bắt đầu / Bỏ qua) thì ghi cờ, đóng hộp, gọi khiXong. */
  function mo(khiXong) {
    var hop = TP.Hop.mo(t('gt.' + TRANG[0] + '.td'), 'hop-gioi-thieu');
    hop.hop.setAttribute('data-hop', 'gioi-thieu');
    var td = hop.hop.querySelector('.hop-td');
    var khung = h('div', 'gt-khung'); hop.than.appendChild(khung);
    var cham = h('div', 'gt-cham'); for (var i = 0; i < TRANG.length; i++) cham.appendChild(h('i'));
    hop.than.appendChild(cham);
    var hang = h('div', 'hop-hang');
    var boQua = TP.Hop.nut('g-wd', t('gt.boQua'), function () { xong(); }, 'gt-bo-qua');
    var tiep = TP.Hop.nut('g-gr', t('gt.tiep'), function () { if (trang < TRANG.length) ve(trang + 1); else xong(); }, 'gt-tiep');
    hang.appendChild(boQua); hang.appendChild(tiep);
    hop.than.appendChild(hang);

    var trang = 1;
    function ve(n) {                         // n: thứ tự trong TRANG (1..3)
      trang = n;
      var ma = TRANG[n - 1];
      td.textContent = t('gt.' + ma + '.td');
      khung.innerHTML = '';
      khung.appendChild(hinh(ma));
      khung.appendChild(TP.vanBan(h('div', 'hop-chu gt-chu'), t('gt.' + ma + '.chu')));
      Array.prototype.forEach.call(cham.children, function (c, i) { c.classList.toggle('on', i === n - 1); });
      tiep.textContent = n < TRANG.length ? t('gt.tiep') : t('gt.batDau');
      boQua.style.visibility = n < TRANG.length ? '' : 'hidden';
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
