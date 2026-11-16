var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-goi.js — "Mật Lệnh Robot": MÀN CHỌN GÓI (window.ChonGoi), HỘP GÓI LƯỚT NGANG KIỂU CUT THE ROPE.
   Nền toàn màn hình là tranh môi trường dọc của mùa đang xem (nen-doc/mua-*.webp).
   Giữa màn hình là dải hộp gói (.g-day / .g-the): hộp giữa nổi khối 3D to rõ, hai hộp hai bên ló mép để vuốt / chạm chuyển.
   Thanh trên nổi: ◀ (về bản đồ mùa) · Biển "MÙA n · Tên" · Sổ lệnh · Tổng sao.
   Thanh dưới nổi: ◀ · 10 chấm tiến độ gói · ▶.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var BUOC = 238, RONG_THE = 216, GIU_LAU_MS = 2000;
  var S = { i: 0, ds: [], muaTruoc: null, keo: null, vuaKeo: 0 };

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    el.nen = h('div', 'gg-nen');
    host.appendChild(el.nen);

    var dau = h('div', 'c-dau gg-dau');
    el.ve = h('button', 'bt g-pu nav');
    el.ve.setAttribute('aria-label', t('goi.veMua'));
    el.ve.setAttribute('data-nut', 've-mua');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); el.ve.appendChild(ic);

    el.tieuDe = h('div', 'c-td gg-td');
    el.tieuDe.setAttribute('data-nut', 'tieu-de-goi');

    el.phai = h('div', 'c-phai gg-phai');
    el.sao = h('div', 'g-tong');
    el.sao.setAttribute('data-nut', 'tieu-de');
    el.sao.setAttribute('aria-label', t('goi.tieuDe'));
    el.phai.appendChild(el.sao);

    dau.appendChild(el.ve);
    dau.appendChild(el.tieuDe);
    dau.appendChild(el.phai);
    host.appendChild(dau);

    el.khung = h('div', 'gg-khung');
    el.day = h('div', 'g-day');
    el.khung.appendChild(el.day);
    host.appendChild(el.khung);

    el.ban = h('div', 'g-ban gg-ban');
    host.appendChild(el.ban);

    var nav = h('div', 'g-nav gg-nav');
    el.truoc = h('button', 'bt g-pu nav');
    el.truoc.setAttribute('aria-label', t('goi.truoc'));
    el.truoc.setAttribute('data-nut', 'goi-truoc');
    var i1 = h('span'); i1.setAttribute('data-i', 'back'); i1.setAttribute('data-s', '2'); el.truoc.appendChild(i1);

    el.cham = h('div', 'g-cham gg-cham');

    el.sau = h('button', 'bt g-pu nav');
    el.sau.setAttribute('aria-label', t('goi.sau'));
    el.sau.setAttribute('data-nut', 'goi-sau');
    var i2 = h('span'); i2.setAttribute('data-i', 'next'); i2.setAttribute('data-s', '2'); el.sau.appendChild(i2);

    nav.appendChild(el.truoc);
    nav.appendChild(el.cham);
    nav.appendChild(el.sau);
    host.appendChild(nav);

    el.tb = h('div', 'c-tb');
    host.appendChild(el.tb);
    Ve.hydrate(host);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(vuaTieuDe);

    el.ve.addEventListener('click', function () { App.veMua(); });
    el.truoc.addEventListener('click', function () { dat(S.i - 1, true); });
    el.sau.addEventListener('click', function () { dat(S.i + 1, true); });

    // Vuốt ngang để lướt hộp gói
    el.khung.addEventListener('pointerdown', function (ev) {
      if (ev.button !== undefined && ev.button > 0) return;
      S.keo = { x0: ev.clientX, dx: 0, keo: false, k: kTiLe() };
      el.day.classList.add('dang-keo');
    });
    window.addEventListener('pointermove', function (ev) {
      if (!S.keo) return;
      S.keo.dx = (ev.clientX - S.keo.x0) / S.keo.k;
      if (Math.abs(S.keo.dx) > 8) S.keo.keo = true;
      if (S.keo.keo) viTri(S.keo.dx);
    });
    function tha() {
      if (!S.keo) return;
      var k = S.keo; S.keo = null;
      el.day.classList.remove('dang-keo');
      if (!k.keo) { viTri(0); return; }
      S.vuaKeo = Date.now();
      var nhay = k.dx < -BUOC / 5 ? 1 : k.dx > BUOC / 5 ? -1 : 0;
      dat(S.i + nhay, true);
    }
    window.addEventListener('pointerup', tha);
    window.addEventListener('pointercancel', tha);
    window.addEventListener('resize', function () {
      if (window.App && App.manHinh === 'goi') viTri(0);
    });
    window.addEventListener('keydown', function (ev) {
      if (!window.App || App.manHinh !== 'goi') return;
      var lop = document.getElementById('lop-hop');
      if (lop && lop.classList.contains('mo')) return;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); dat(S.i - 1, true); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); dat(S.i + 1, true); }
    });

    // Giữ lâu 2 giây vào ô sao / tiêu đề mở bảng Gỡ lỗi
    var hen = null;
    function batGiu(nut) {
      nut.addEventListener('pointerdown', function () {
        clearTimeout(hen);
        hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) {
        nut.addEventListener(s, function () { clearTimeout(hen); hen = null; });
      });
    }
    batGiu(el.sao);
    batGiu(el.tieuDe);
  }

  function kTiLe() {
    var r = el.khung.getBoundingClientRect();
    return el.khung.offsetWidth ? r.width / el.khung.offsetWidth : 1;
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu;
    el.tb.classList.add('hien');
    clearTimeout(tbHen);
    tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2600);
  }
  function lac(b) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); }

  function vuaTieuDe() {
    var td = el.tieuDe; if (!td) return;
    td.style.removeProperty('--ts');
    if (!td.clientWidth) return;
    var ts = 1;
    while (td.scrollWidth > td.clientWidth + 1 && ts > 0.52) {
      ts = Math.round((ts - 0.04) * 100) / 100;
      td.style.setProperty('--ts', ts);
    }
  }

  /** Lời báo mùa chưa mở (dùng lại ở man-mua.js & man-chon.js). */
  function loiMua(mu) {
    if (!mu) return t('chon.khoaMua');
    var c = mu.mo || {};
    if (typeof c.sao === 'number') {
      var mt = App.dsMua().filter(function (x) { return x.ma === (c.mua || App.dsMua()[0].ma); })[0];
      return t('goi.khoaMuaSao', { sao: c.sao, mua: mt ? mt.ten : '', ten: mu.ten });
    }
    if (c.goi) {
      var g = App.goiTheoMa(c.goi);
      return t('goi.khoaMuaGoi', { goi: g ? g.ten : c.goi, ten: mu.ten });
    }
    return t('goi.khoaMua', { ten: mu.ten });
  }

  /** Bảng mua một mùa bán riêng (mua thử: chưa nối thanh toán). */
  function moMua(mu) {
    var soMan = mu.goi.reduce(function (s, g) { return s + g.man.length; }, 0);
    var m = TP.Hop.mo(t('mua.tieuDe', { ten: mu.ten }), 'hop-nho hop-mua');
    m.hop.setAttribute('data-hop', 'mua');
    m.than.appendChild(h('div', 'hop-chu', t('mua.noiDung', { ten: mu.ten, goi: mu.goi.filter(function (g) { return !g.sapCo; }).length, man: soMan })));
    m.than.appendChild(h('div', 'hop-chu canh', t('mua.thu')));
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-wd', t('mua.deSau'), function () { TP.Hop.dong(); }, 'de-sau'));
    hang.appendChild(TP.Hop.nut('g-gr', t('mua.nut', { gia: mu.ban.gia }), function () { TP.Hop.dong(); App.muaThu(mu.ma); }, 'mua-thu'));
    m.than.appendChild(hang);
  }

  function muaDangXem() {
    return App.dsMua().filter(function (x) { return x.ma === App.mua; })[0] || App.dsMua()[0];
  }

  function veBan(mu) {
    el.ban.innerHTML = '';
    var can = !!(mu && App.chuaMua(mu));
    el.ban.style.display = can ? '' : 'none';
    if (!can) return;
    var b = h('button', 'bt g-gr g-ban-nut', t('mua.nutBan', { ten: mu.ten, gia: mu.ban.gia }));
    b.setAttribute('data-nut', 'mua-mua');
    b.addEventListener('click', function () { moMua(mu); });
    el.ban.appendChild(b);
  }

  /** Vẽ lại màn chọn gói; ma (tuỳ chọn): mã gói cần đưa ra chính giữa. */
  function ve(ma) {
    if (ma) {
      var gm = App.goiTheoMa(ma);
      if (gm) App.mua = gm.mua;
    }
    var mu = muaDangXem(); if (!mu) return;
    App.mua = mu.ma;
    el.nen.setAttribute('data-nen-mua', mu.ma);

    var so = /^mua-(\d)$/.exec(mu.ma);
    el.tieuDe.innerHTML = '';
    if (so) {
      el.tieuDe.appendChild(document.createTextNode(t('goi.muaSo', { n: '' })));
      el.tieuDe.appendChild(h('span', 'd', so[1]));
      el.tieuDe.appendChild(document.createTextNode(' · '));
    }
    el.tieuDe.appendChild(document.createTextNode(mu.ten));

    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));
    vuaTieuDe();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(vuaTieuDe);

    if (el.phai.firstChild !== el.sao) el.phai.insertBefore(el.sao, el.phai.firstChild);
    Array.prototype.slice.call(el.phai.children).forEach(function (c) { if (c !== el.sao) c.remove(); });
    if (window.SoLenh && window.SoLenhMan) {
      var bs = h('button', 'bt g-cy c-so gg-so');
      bs.setAttribute('data-nut', 'so-lenh');
      bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span'); ib.setAttribute('data-i', 'book'); ib.setAttribute('data-s', '2'); ib.setAttribute('data-l', BM.xanhLo); bs.appendChild(ib);
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.phai.insertBefore(bs, el.sao);
    }
    if (window.GoLoi) GoLoi.nutBug(el.phai);
    Ve.hydrate(el.phai);

    S.ds = mu.goi.slice();
    veBan(mu);

    // Gói khuyến nghị chơi tiếp của mùa
    var cur = null;
    S.ds.forEach(function (g) { if (!cur && !g.sapCo && App.goiMo(g) && App.soQua(g) < g.man.length) cur = g; });

    // Xác định hộp đưa ra giữa: ưu tiên tham số ma, hoặc App.goi nếu cùng mùa, không thì nhảy tới gói cur
    var iChon = -1;
    var dich = ma || (S.muaTruoc === mu.ma ? App.goi : null);
    if (dich) S.ds.forEach(function (g, k) { if (g.ma === dich) iChon = k; });
    if (iChon < 0 && App.goi) S.ds.forEach(function (g, k) { if (g.ma === App.goi && g.mua === mu.ma) iChon = k; });
    if (iChon < 0 && cur) S.ds.forEach(function (g, k) { if (g === cur) iChon = k; });
    if (iChon < 0) iChon = 0;
    S.muaTruoc = mu.ma;

    el.day.innerHTML = '';
    S.ds.forEach(function (g, k) { el.day.appendChild(the(g, k, mu, g === cur)); });

    el.cham.innerHTML = '';
    S.ds.forEach(function (g, k) {
      var mo = !g.sapCo && App.goiMo(g);
      var xong = mo && g.man.length > 0 && App.soQua(g) === g.man.length;
      var d = h('button', 'g-ch ' + (g.sapCo ? 'sap' : !mo ? 'khoa' : xong ? 'xong' : 'mo') + (g.loai === 'thu-thach' ? ' tt' : ''));
      d.setAttribute('aria-label', g.ten);
      d.addEventListener('click', function () { dat(k, true); });
      el.cham.appendChild(d);
    });

    dat(iChon, false);
    requestAnimationFrame(function () { viTri(0); vuaTieuDe(); });
  }

  /** Dựng một hộp gói kiểu Cut the Rope nâng cấp đậm chất game. */
  function the(g, k, muG, laCur) {
    var mo = App.goiMo(g), xong = mo && g.man.length > 0 && App.soQua(g) === g.man.length;
    var tt = g.loai === 'thu-thach';
    var loaiChu = tt ? t('goi.loai.thu-thach') : g.loai === 'bo-phan' ? t('goi.loai.bo-phan') : t('goi.loai.khai-niem');
    var b = h('div', 'g-the bt ' + (g.sapCo ? 'sap' : !mo ? 'khoa' : xong ? 'xong' : 'mo') + (laCur ? ' cur' : '') + (g.dot === 2 ? ' dot2' : '') + (tt ? ' thu-thach' : ''));
    b.setAttribute('data-goi', g.ma);
    b.setAttribute('role', 'button');
    b.setAttribute('aria-label', t('goi.so', { n: k + 1 }) + ' ' + g.ten);
    b.style.left = (k * BUOC) + 'px';

    b.appendChild(h('div', 'g-so', tt ? t('goi.thuThach') : t('goi.so', { n: k + 1 })));

    var mat = h('div', 'g-mat chalk');
    var co = window.HuyHieu && HuyHieu.DS.indexOf(g.hinh) >= 0;
    mat.appendChild(co ? HuyHieu.mk(g.hinh, g.sapCo || !mo ? 'khoa' : xong ? 'xong' : 'mo', 3) : Ve.ico('plus', 5, { fill: BM.vang, line: BM.vienDam }));
    if (!g.sapCo) mat.appendChild(h('span', 'g-loai', loaiChu));
    b.appendChild(mat);

    b.appendChild(h('div', 'g-ten', g.ten));

    if (g.sapCo) {
      b.appendChild(h('div', 'g-mota', ''));
      b.appendChild(h('div', 'g-dong g-sapco', t('goi.sapCo')));
    } else {
      b.appendChild(h('div', 'g-mota', g.chuong.length > 1 ? t('goi.moTa', { c: g.chuong.length, m: g.man.length }) : t('goi.moTa1', { m: g.man.length })));

      var chan = h('div', 'g-chan');
      var dong = h('div', 'g-dong');
      dong.appendChild(Ve.sao(true, 1.8));
      if (mo) {
        var saoDat = App.saoGoi(g);
        dong.appendChild(h('span', null, saoDat + '/' + g.saoToiDa));
        chan.appendChild(dong);
        if (g.saoToiDa > 0) {
          var bar = h('div', 'g-bar');
          var fill = h('div', 'g-bar-fill');
          fill.style.width = Math.min(100, Math.round(saoDat * 100 / g.saoToiDa)) + '%';
          bar.appendChild(fill);
          chan.appendChild(bar);
        }
        var cta = h('div', 'g-cta');
        cta.appendChild(Ve.ico('play', 1.3));
        cta.appendChild(h('span', null, laCur ? t('chon.choi') : t('goi.vaoGoi')));
        chan.appendChild(cta);
      } else {
        if (App.chuaMua(muG)) {
          dong.appendChild(h('span', 'g-can', t('goi.chuaMua')));
          chan.appendChild(dong);
        } else if (App.muaMo(muG) && g.saoCan > 0) {
          var saoCo = App.saoMua(g.mua);
          dong.appendChild(h('span', 'g-can', t('goi.tienDoMo', { co: saoCo, can: g.saoCan })));
          chan.appendChild(dong);
          var barK = h('div', 'g-bar');
          var fillK = h('div', 'g-bar-fill');
          fillK.style.width = Math.min(100, Math.round(saoCo * 100 / g.saoCan)) + '%';
          barK.appendChild(fillK);
          chan.appendChild(barK);
          var ctaK = h('div', 'g-cta g-cta-khoa');
          ctaK.appendChild(Ve.khoa(1.2));
          ctaK.appendChild(h('span', null, t('goi.canSao', { n: g.saoCan })));
          chan.appendChild(ctaK);
        } else {
          dong.appendChild(h('span', 'g-can', App.muaMo(muG) ? t('goi.canSao', { n: g.saoCan }) : t('chon.khoaMua')));
          chan.appendChild(dong);
        }
      }
      b.appendChild(chan);

      if (xong) b.appendChild(h('div', 'g-xong', t('goi.xong')));

      var moDauGoi = g.ma === 'xe' && window.MoDau && window.Luu && Luu.daXem(MoDau.CO)
        && !(window.PhimGoi && PhimGoi.co(g.ma));
      if (mo && (moDauGoi || (window.PhimGoi && PhimGoi.co(g.ma) && (App.moHet || PhimGoi.daXem(g.ma))))) {
        var xl = h('button', 'bt g-cy g-phim');
        xl.setAttribute('data-nut', 'xem-phim');
        xl.setAttribute('aria-label', t('pg.xemLai'));
        xl.setAttribute('title', t('pg.xemLai'));
        var ip = h('span'); ip.setAttribute('data-i', 'play'); ip.setAttribute('data-s', '1'); ip.setAttribute('data-l', BM.xanhLo); ip.setAttribute('data-f', BM.trangV2); xl.appendChild(ip);
        Ve.hydrate(xl);
        xl.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
        xl.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (k !== S.i) { dat(k, true); return; }
          if (moDauGoi) MoDau.mo(function () { App.vaoGoi(g.ma); });
          else PhimGoi.mo(g.ma, function () { App.vaoGoi(g.ma); });
        });
        b.appendChild(xl);
      }
    }

    b.addEventListener('click', function () {
      if (S.vuaKeo && Date.now() - S.vuaKeo < 250) return;
      if (k !== S.i) { dat(k, true); return; }
      if (g.sapCo) { lac(b); thongBao(t('goi.sapCoTb')); return; }
      if (!App.goiMo(g)) {
        var mu = App.dsMua().filter(function (x) { return x.ma === g.mua; })[0];
        if (App.chuaMua(mu)) { moMua(mu); return; }
        lac(b); thongBao(App.muaMo(mu) ? t('goi.khoa', { can: g.saoCan, co: App.saoMua(g.mua) }) : loiMua(mu));
        return;
      }
      App.goi = g.ma; App.mua = g.mua;
      if (window.PhimGoi && PhimGoi.co(g.ma) && !PhimGoi.daXem(g.ma)) { PhimGoi.mo(g.ma, function () { App.vaoGoi(g.ma); }); return; }
      App.vaoGoi(g.ma);
    });
    return b;
  }

  function viTri(dx) {
    var w = el.khung ? (el.khung.offsetWidth || 360) : 360;
    var giua = (w - RONG_THE) / 2;
    el.day.style.transform = 'translateX(' + (giua - S.i * BUOC + (dx || 0)) + 'px)';
  }

  function dat(i, hoat) {
    if (!S.ds.length) return;
    S.i = Math.max(0, Math.min(S.ds.length - 1, i));
    el.day.classList.toggle('tuc', !hoat);
    viTri(0);
    var cs = el.cham.children, ts = el.day.children;
    for (var k = 0; k < cs.length; k++) cs[k].classList.toggle('on', k === S.i);
    for (var j = 0; j < ts.length; j++) ts[j].classList.toggle('giua', j === S.i);
    el.truoc.classList.toggle('mo-mo', S.i <= 0);
    el.sau.classList.toggle('mo-mo', S.i >= S.ds.length - 1);
    var g = S.ds[S.i];
    if (g && !g.sapCo) App.goi = g.ma;
  }

  window.ChonGoi = { dung: dung, ve: ve, thongBao: thongBao, loiMua: loiMua, moMua: moMua };
})();
