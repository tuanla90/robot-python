/* ============================================================================
   man-chon-tam.js — MÀN CHỌN MÀN TẠM (window.ChonTam): thay cho ba màn bản đồ mùa, đường gói, lưới gói (man-mua.js, man-goi.js, man-chon.js)
   trong khi chưa có ảnh nền của dự án này. Một màn duy nhất: hàng tab mùa + lưới đúng khuôn của kế hoạch (cột = gói, hàng = dạng bài).
   Có tệp này thì App.hien('mua' | 'goi' | 'chon') đều mở màn tạm (ung-dung.js). Bỏ thẻ script ở choi.html là về luồng cũ.
   Luật khoá vẫn của mo-goi.js qua App.trangThai, lời báo khoá dùng chung với man-chon.js.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var GIU_LAU_MS = 2000;

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    var dau = h('div', 'c-dau');
    var ve = h('button', 'bt g-pu nav'); ve.setAttribute('aria-label', t('goi.ve')); ve.setAttribute('data-nut', 've-dau');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); ve.appendChild(ic);
    var td = h('div', 'c-td'); td.setAttribute('data-nut', 'tieu-de-tam'); td.appendChild(document.createTextNode('CHỌN MÀN'));
    el.phai = h('div', 'c-phai');
    el.sao = h('div', 'g-tong'); el.sao.setAttribute('data-nut', 'tieu-de');
    el.phai.appendChild(el.sao);
    dau.appendChild(ve); dau.appendChild(td); dau.appendChild(el.phai);
    host.appendChild(dau);

    el.tab = h('div', 't-tab'); host.appendChild(el.tab);
    el.than = h('div', 't-than'); host.appendChild(el.than);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);

    ve.addEventListener('click', function () { App.veDau(); });

    // giữ lâu ô sao 2 giây: bảng Gỡ lỗi (như các màn chọn cũ)
    var hen = null;
    el.sao.addEventListener('pointerdown', function () { clearTimeout(hen); hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) { el.sao.addEventListener(s, function () { clearTimeout(hen); hen = null; }); });
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu; el.tb.classList.add('hien');
    clearTimeout(tbHen); tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2600);
  }

  function muaDangXem() {
    return App.dsMua().filter(function (x) { return x.ma === App.mua; })[0] || App.dsMua()[0];
  }

  function ve() {
    var mu = muaDangXem(); if (!mu) return;
    App.mua = mu.ma;

    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));
    Array.prototype.slice.call(el.phai.children).forEach(function (c) { if (c !== el.sao) c.remove(); });
    if (window.SoLenh && window.SoLenhMan) {
      var bs = h('button', 'bt g-cy c-so'); bs.setAttribute('data-nut', 'so-lenh'); bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span'); ib.setAttribute('data-i', 'book'); ib.setAttribute('data-s', '2'); bs.appendChild(ib);
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.phai.insertBefore(bs, el.sao);
    }
    if (window.GoLoi) GoLoi.nutBug(el.phai);
    Ve.hydrate(el.phai);

    el.tab.innerHTML = '';
    App.dsMua().forEach(function (x, i) {
      var b = h('button', 'bt ' + (x === mu ? 'g-gr on' : 'g-wd') + ' t-mua'); b.setAttribute('data-mua', x.ma);
      b.appendChild(h('span', 't-mua-so', t('goi.muaSo', { n: i + 1 })));
      b.appendChild(h('span', 't-mua-ten', x.ten));
      b.addEventListener('click', function () { App.mua = x.ma; ve(); el.than.scrollTop = 0; });
      el.tab.appendChild(b);
    });

    veLuoi(mu);
  }

  /** Lưới một mùa: cột là các gói có màn, hàng là số màn trong gói; ô đầu mỗi hàng ghi dạng bài (hàng 1–8 của khuôn). */
  function veLuoi(mu) {
    var dsGoi = mu.goi.filter(function (g) { return !g.sapCo && g.man.length; });
    var soHang = dsGoi.reduce(function (s, g) { return Math.max(s, g.man.length); }, 0), soCot = Math.max(4, dsGoi.length);
    var cur = null;
    dsGoi.forEach(function (g) { g.man.forEach(function (m) { if (!cur && App.trangThai(m).mo && !Luu.daQua(m.ma)) cur = m; }); });

    el.than.innerHTML = '';
    var luoi = h('div', 't-luoi');
    luoi.style.gridTemplateColumns = '38px repeat(' + soCot + ',minmax(0,1fr))';
    luoi.style.gridTemplateRows = 'auto repeat(' + soHang + ',' + (soHang > 4 ? 'minmax(44px,1fr)' : '56px') + ')';   // mùa ít màn (demo): ô giữ cỡ thường, không giãn hết màn

    luoi.appendChild(h('div'));
    dsGoi.forEach(function (g) { luoi.appendChild(dauCot(g)); });
    for (var k = dsGoi.length; k < soCot; k++) luoi.appendChild(h('div'));

    function manO(g, r) { return g.man.slice().sort(function (a, b) { return a.so - b.so; })[r] || null; }
    for (var r = 0; r < soHang; r++) {
      var mau = dsGoi.map(function (g) { return manO(g, r); }).filter(Boolean)[0];
      luoi.appendChild(h('div', 't-hang', mau && mau.dangBai ? t('dang.' + mau.dangBai) : ''));
      for (var c = 0; c < soCot; c++) {
        var m = dsGoi[c] ? manO(dsGoi[c], r) : null;
        luoi.appendChild(m ? oMan(m, m === cur) : h('div'));
      }
    }
    el.than.appendChild(luoi);
    Ve.hydrate(el.than);
  }

  function dauCot(g) {
    var d = h('div', 't-cot'); d.setAttribute('data-goi', g.ma);
    var mo = App.goiMo(g);
    if (window.HuyHieu && HuyHieu.DS.indexOf(g.hinh) >= 0) d.appendChild(HuyHieu.mk(g.hinh, !mo ? 'khoa' : App.soQua(g) === g.man.length ? 'xong' : 'mo', 1.5));
    d.appendChild(h('div', 't-cot-ten', g.ten));
    return d;
  }

  function oMan(m, laCur) {
    var tt = App.trangThai(m), sao = Luu.saoTot(m.ma);
    var b = h('button', 'bt c-man ' + (!tt.mo ? 'lock' : sao > 0 ? 'done' : laCur ? 'cur' : 'open') + (m.hang === 'trum' ? ' trum-tam' : ''));
    b.setAttribute('data-man', m.ma); b.setAttribute('aria-label', m.id + ' ' + m.ten); b.setAttribute('title', m.ten);
    b.appendChild(h('div', 'num', m.id));
    if (!tt.mo) { var lk = h('div', 'lk'); lk.appendChild(Ve.khoa(1)); b.appendChild(lk); }
    else {
      var ss = h('div', 'stars');
      for (var i = 0; i < 3; i++) ss.appendChild(Ve.sao(i < sao, 1));
      b.appendChild(ss);
    }
    b.addEventListener('click', function () {
      if (!tt.mo) {
        b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
        thongBao(Chon.lyDo(tt));
        return;
      }
      App.vaoMan(m.ma);
    });
    return b;
  }

  window.ChonTam = { dung: dung, ve: ve, thongBao: thongBao };
})();
