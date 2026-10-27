var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-dau.js — "Robot Chấn Hưng": MÀN KHỞI ĐẦU (window.Dau), kiểu màn tiêu đề của Cut the Rope.
   Logo · robot hoàn thiện chạy qua lại trên tấm bảng · tổng sao · nút CHƠI (→ chọn gói) · "Chơi tiếp · 4.3" (vào thẳng màn kế) · Sổ lệnh · bánh răng Cài đặt (cai-dat.js).
   Giữ logo 2 giây = mở bảng Gỡ lỗi (go-loi.js); dùng được cả trên link Artifact (không thêm ?debug=1 vào địa chỉ được).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var GIU_LAU_MS = 2000;
  var ROBOT = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };   // robot hoàn thiện (chương Robot hoàn thiện)
  var TI_LE = 3, NHIP_MS = 110, BUOC = 4, NGHI = 6;
  var S = { hen: null, x: 0, huong: 1, ph: 0, nghi: 0 };

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    el.logo = h('div', 'd-logo'); el.logo.setAttribute('data-nut', 'logo');
    el.logo.appendChild(h('div', 'd-ten', t('chung.tenGame')));
    el.logo.appendChild(h('div', 'd-phu', t('dau.phuDe')));
    host.appendChild(el.logo);

    el.san = h('div', 'd-san chalk');
    el.robot = h('canvas', 'd-robot pxi');
    el.san.appendChild(el.robot);
    host.appendChild(el.san);

    el.sao = h('div', 'd-sao'); host.appendChild(el.sao);

    var nut = h('div', 'd-nut');
    el.choi = h('button', 'bt g-gr d-choi'); el.choi.setAttribute('data-nut', 'choi-dau');
    var ip = h('span'); ip.setAttribute('data-i', 'play'); ip.setAttribute('data-s', '3'); el.choi.appendChild(ip);
    el.choi.appendChild(h('span', 'd-choi-chu', t('dau.choi')));
    el.tiep = h('button', 'bt g-yl d-tiep'); el.tiep.setAttribute('data-nut', 'choi-tiep');
    nut.appendChild(el.choi); nut.appendChild(el.tiep);
    host.appendChild(nut);

    el.hang = h('div', 'd-hang'); host.appendChild(el.hang);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);

    el.choi.addEventListener('click', function () { App.veGoi(); });
    el.tiep.addEventListener('click', function () { var m = App.manTiepTheo(); if (m) App.vaoMan(m.ma); });

    // giữ logo 2 giây: bảng Gỡ lỗi
    var hen = null;
    el.logo.addEventListener('pointerdown', function () { clearTimeout(hen); hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) { el.logo.addEventListener(s, function () { clearTimeout(hen); hen = null; }); });
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu; el.tb.classList.add('hien');
    clearTimeout(tbHen); tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2400);
  }

  function ve() {
    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));
    var m = App.manTiepTheo();
    el.tiep.innerHTML = '';
    el.tiep.classList.toggle('het', !m);
    el.tiep.disabled = !m;
    el.tiep.appendChild(h('span', null, m ? t('dau.tiep', { id: m.id }) : t('dau.xongHet')));
    if (m) el.tiep.appendChild(h('span', 'd-tiep-ten', m.ten));
    el.hang.innerHTML = '';
    if (window.SoLenh && window.SoLenhMan) {
      var bs = h('button', 'bt g-cy d-so'); bs.setAttribute('data-nut', 'so-lenh'); bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span'); ib.setAttribute('data-i', 'book'); ib.setAttribute('data-s', '2'); ib.setAttribute('data-l', BM.xanhLo); bs.appendChild(ib);
      bs.appendChild(h('span', null, t('chon.soLenh')));
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.hang.appendChild(bs);
    }
    if (window.CaiDat) {
      var bc = h('button', 'bt g-wd d-cai'); bc.setAttribute('data-nut', 'cai-dat'); bc.setAttribute('aria-label', t('caiDat.nut'));
      var ic = h('span'); ic.setAttribute('data-i', 'gear'); ic.setAttribute('data-s', '2'); ic.setAttribute('data-l', BM.goToiV1); bc.appendChild(ic);
      bc.addEventListener('click', function () { CaiDat.mo(); });
      el.hang.appendChild(bc);
    }
    if (window.GoLoi) GoLoi.nutBug(el.hang);                         // 🐞 chỉ khi địa chỉ có ?debug=1 / #debug
    Ve.hydrate(el.hang);
    veRobot();
  }

  /* ---------------------------------------------------------------- robot chạy qua lại */
  function hinh() {
    if (!window.VeRobot) return null;
    try { return VeRobot.veCo(ROBOT, { wl: S.nghi ? 0 : 2, wr: S.nghi ? 0 : 2, ph: S.ph, tay: { tuThe: 'tren', kep: false } }, S.huong, TI_LE * VeRobot.PX_O_PART); } catch (e) { return null; }      // cỡ ô hiển thị (VeRobot.veCo): pixel = bội số TI_LE như cũ
  }
  function veRobot() {
    var cv = hinh(); if (!cv) return;
    var c = el.robot;
    var hs = VeRobot.heSoCss(cv);
    if (c.width !== cv.width || c.height !== cv.height) { c.width = cv.width; c.height = cv.height; c.style.width = cv.width * hs + 'px'; c.style.height = cv.height * hs + 'px'; }
    var g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false; g.drawImage(cv, 0, 0);
    if (cv.laPart && !cv.laVector && window.SanVe && SanVe.coMatDong && SanVe.coMatDong()) SanVe.veMatTam(g, c.width / 2, c.height / 2, TI_LE, ROBOT, { chay: !S.nghi }, S.huong, performance.now());
    c.style.transform = 'translate(' + S.x + 'px,-50%)';
  }
  function nhip() {
    var rong = el.san.clientWidth, w = el.robot.width || 0, le = -Math.round(w * 0.22), max = rong - w - le;   // hình có lề trong suốt: cho thân sát mép tấm bảng
    if (S.nghi > 0) { S.nghi--; if (!S.nghi) S.huong = S.huong === 1 ? 3 : 1; }
    else {
      S.x += S.huong === 1 ? BUOC : -BUOC; S.ph = 1 - S.ph;
      if (S.x >= max) { S.x = max; S.nghi = NGHI; }
      if (S.x <= le) { S.x = le; S.nghi = NGHI; }
    }
    veRobot();
  }
  /** Bật / tắt hoạt hình (chỉ chạy khi màn khởi đầu đang hiện). */
  function chay(bat) {
    clearInterval(S.hen); S.hen = null;
    if (bat) S.hen = setInterval(nhip, NHIP_MS);
  }

  window.Dau = { dung: dung, ve: ve, chay: chay, thongBao: thongBao };
})();
