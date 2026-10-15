/* ============================================================================
   man-goi.js — "Đường học": MÀN CHỌN GÓI (window.ChonGoi), kiểu chọn hộp của Cut the Rope.
   Một dải hộp lướt ngang (vuốt, hay bấm ◀ ▶, hay chạm hộp bên cạnh); hộp giữa to, hai hộp hai bên ló ra một mép.
   Hộp: "GÓI n" · huy hiệu · tên · "2 chương · 20 màn" · sao đã lấy / tối đa. Gói chưa đủ sao: xám + ổ khóa + "Cần 45 ★"; gói chưa có màn: "SẮP CÓ".
   Chạm hộp giữa đã mở → lưới màn của gói (App.vaoGoi). Gói và luật mở ở game/mo-goi.js.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var BUOC = 236, RONG_THE = 212, GIU_LAU_MS = 2000;
  var S = { i: 0, ds: [], keo: null, vuaKeo: 0 };

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    var dau = h('div', 'g-dau');
    el.ve = h('button', 'bt g-pu nav'); el.ve.setAttribute('aria-label', t('goi.ve')); el.ve.setAttribute('data-nut', 've-dau');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); el.ve.appendChild(ic);
    el.td = h('div', 'g-td', t('goi.tieuDe')); el.td.setAttribute('data-nut', 'tieu-de');
    el.sao = h('div', 'g-tong');
    dau.appendChild(el.ve); dau.appendChild(el.td); dau.appendChild(el.sao);
    host.appendChild(dau);

    el.khung = h('div', 'g-khung'); el.day = h('div', 'g-day'); el.khung.appendChild(el.day);
    host.appendChild(el.khung);

    var nav = h('div', 'g-nav');
    el.truoc = h('button', 'bt g-pu nav'); el.truoc.setAttribute('aria-label', t('goi.truoc')); el.truoc.setAttribute('data-nut', 'goi-truoc');
    var i1 = h('span'); i1.setAttribute('data-i', 'back'); i1.setAttribute('data-s', '2'); el.truoc.appendChild(i1);
    el.cham = h('div', 'g-cham');
    el.sau = h('button', 'bt g-pu nav'); el.sau.setAttribute('aria-label', t('goi.sau')); el.sau.setAttribute('data-nut', 'goi-sau');
    var i2 = h('span'); i2.setAttribute('data-i', 'next'); i2.setAttribute('data-s', '2'); el.sau.appendChild(i2);
    nav.appendChild(el.truoc); nav.appendChild(el.cham); nav.appendChild(el.sau);
    host.appendChild(nav);

    el.duoi = h('div', 'g-duoi'); host.appendChild(el.duoi);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);

    el.ve.addEventListener('click', function () { App.veDau(); });
    el.truoc.addEventListener('click', function () { dat(S.i - 1, true); });
    el.sau.addEventListener('click', function () { dat(S.i + 1, true); });

    // vuốt ngang để lướt hộp
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

    var hen = null;
    el.td.addEventListener('pointerdown', function () { clearTimeout(hen); hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) { el.td.addEventListener(s, function () { clearTimeout(hen); hen = null; }); });
  }
  /** Tỉ lệ khung (stage bị co giãn bằng transform): px màn hình trên mỗi px khung 360. */
  function kTiLe() { var r = el.khung.getBoundingClientRect(); return el.khung.offsetWidth ? r.width / el.khung.offsetWidth : 1; }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu; el.tb.classList.add('hien');
    clearTimeout(tbHen); tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2600);
  }

  /** Vẽ lại; ma (tùy chọn): gói cần đưa ra giữa (mặc định App.goi). */
  function ve(ma) {
    S.ds = App.dsGoi();
    var dich = ma || App.goi, i = 0;
    S.ds.forEach(function (g, k) { if (g.ma === dich) i = k; });
    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));

    el.day.innerHTML = '';
    S.ds.forEach(function (g, k) { el.day.appendChild(the(g, k)); });
    el.cham.innerHTML = '';
    S.ds.forEach(function (g, k) {
      var d = h('button', 'g-ch ' + (g.sapCo ? 'sap' : App.goiMo(g) ? 'mo' : 'khoa')); d.setAttribute('aria-label', g.ten);
      d.addEventListener('click', function () { dat(k, true); });
      el.cham.appendChild(d);
    });
    el.duoi.innerHTML = '';
    if (window.SoLenh && window.SoLenhMan) {
      var bs = h('button', 'bt g-cy d-so'); bs.setAttribute('data-nut', 'so-lenh'); bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span'); ib.setAttribute('data-i', 'book'); ib.setAttribute('data-s', '2'); ib.setAttribute('data-l', '#07303a'); bs.appendChild(ib);
      bs.appendChild(h('span', null, t('chon.soLenh')));
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.duoi.appendChild(bs);
    }
    if (window.GoLoi) GoLoi.nutBug(el.duoi);
    Ve.hydrate(el.duoi);
    dat(i, false);
  }

  function the(g, k) {
    var mo = App.goiMo(g), xong = mo && App.soQua(g) === g.man.length;
    var b = h('div', 'g-the bt ' + (g.sapCo ? 'sap' : !mo ? 'khoa' : xong ? 'xong' : 'mo') + (g.dot === 2 ? ' dot2' : ''));
    b.setAttribute('data-goi', g.ma); b.setAttribute('role', 'button'); b.setAttribute('aria-label', t('goi.so', { n: g.so }) + ' ' + g.ten);
    b.style.left = (k * BUOC) + 'px';
    b.appendChild(h('div', 'g-so', t('goi.so', { n: g.so })));
    var mat = h('div', 'g-mat chalk');
    var co = window.HuyHieu && HuyHieu.DS.indexOf(g.hinh) >= 0;
    mat.appendChild(co ? Ve.mk(HuyHieu.ve(g.hinh, g.sapCo || !mo ? 'khoa' : xong ? 'xong' : 'mo'), 3) : Ve.ico('plus', 5, { fill: '#ffd95a', line: '#1b120a' }));
    b.appendChild(mat);
    b.appendChild(h('div', 'g-ten', g.ten));
    if (g.sapCo) {
      b.appendChild(h('div', 'g-mota', ''));
      b.appendChild(h('div', 'g-dong g-sapco', t('goi.sapCo')));
    } else {
      b.appendChild(h('div', 'g-mota', g.chuong.length > 1 ? t('goi.moTa', { c: g.chuong.length, m: g.man.length }) : t('goi.moTa1', { m: g.man.length })));
      var dong = h('div', 'g-dong');
      dong.appendChild(Ve.sao(true, 2));
      if (mo) dong.appendChild(h('span', null, App.saoGoi(g) + '/' + g.saoToiDa));
      else dong.appendChild(h('span', 'g-can', t('goi.canSao', { n: g.saoCan })));
      b.appendChild(dong);
      if (xong) b.appendChild(h('div', 'g-xong', t('goi.xong')));
    }
    b.addEventListener('click', function () {
      if (S.vuaKeo && Date.now() - S.vuaKeo < 250) return;                // vừa vuốt xong: không tính là chạm
      if (k !== S.i) { dat(k, true); return; }                            // chạm hộp bên cạnh: đưa ra giữa
      if (g.sapCo) { lac(b); thongBao(t('goi.sapCoTb')); return; }
      if (!App.goiMo(g)) { lac(b); thongBao(t('goi.khoa', { can: g.saoCan, co: App.tongSao() })); return; }
      App.vaoGoi(g.ma);
    });
    return b;
  }
  function lac(b) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); }

  /** Dời dải hộp: hộp S.i ra giữa, cộng thêm dx (đang vuốt). */
  function viTri(dx) {
    var giua = (el.khung.offsetWidth - RONG_THE) / 2;
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
    el.truoc.classList.toggle('mo-mo', S.i <= 0); el.sau.classList.toggle('mo-mo', S.i >= S.ds.length - 1);
    var g = S.ds[S.i]; if (g && !g.sapCo) App.goi = g.ma;
  }

  window.ChonGoi = { dung: dung, ve: ve, thongBao: thongBao };
})();
