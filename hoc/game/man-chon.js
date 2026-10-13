/* ============================================================================
   man-chon.js — "Đường học": MÀN CHỌN MÀN (window.Chon).
   ‹ › đổi chương (theo ManHoc.chuong()) · lưới 3×3 + nút TRÙM · hàng "Hàm của em" ở đáy.
   Giữ lâu tiêu đề 2 giây = bật/tắt "Mở hết" (cho người thử).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var HANG = ['lam-quen', 'luyen', 'bien-the'];
  var GIU_LAU_MS = 2000;

  function dung(host) {
    host.innerHTML = '';
    var deco = h('div', 'deco'); host.appendChild(deco);

    var dau = h('div', 'c-dau');
    var r1 = h('div', 'c-r1');
    el.truoc = h('button', 'bt g-pu nav'); el.truoc.setAttribute('aria-label', t('chon.truoc')); el.truoc.setAttribute('data-nut', 'truoc');
    var ic1 = h('span'); ic1.setAttribute('data-i', 'back'); ic1.setAttribute('data-s', '2'); el.truoc.appendChild(ic1);
    el.tieuDe = h('div', 'c-td'); el.tieuDe.setAttribute('data-nut', 'tieu-de');
    el.sau = h('button', 'bt g-pu nav'); el.sau.setAttribute('aria-label', t('chon.sau')); el.sau.setAttribute('data-nut', 'sau');
    var ic2 = h('span'); ic2.setAttribute('data-i', 'next'); ic2.setAttribute('data-s', '2'); el.sau.appendChild(ic2);
    r1.appendChild(el.truoc); r1.appendChild(el.tieuDe); r1.appendChild(el.sau);
    var r2 = h('div', 'c-r2');
    el.bar = h('div', 'c-bar'); el.pl = h('div', 'c-pl');
    r2.appendChild(el.bar); r2.appendChild(el.pl);
    dau.appendChild(r1); dau.appendChild(r2);
    host.appendChild(dau);

    el.luoi = h('div', 'c-luoi'); host.appendChild(el.luoi);
    el.trum = h('button', 'bt c-trum'); el.trum.setAttribute('data-nut', 'trum'); host.appendChild(el.trum);
    el.thu = h('div', 'c-thu chalk'); host.appendChild(el.thu);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);

    el.truoc.addEventListener('click', function () { doiChuoi(-1); });
    el.sau.addEventListener('click', function () { doiChuoi(1); });

    // giữ lâu tiêu đề: bật/tắt "Mở hết"
    var hen = null;
    function bat() {
      clearTimeout(hen);
      hen = setTimeout(function () {
        hen = null;
        App.moHet = !App.moHet;
        thongBao(t(App.moHet ? 'chon.moHet.bat' : 'chon.moHet.tat'));
        ve();
      }, GIU_LAU_MS);
    }
    function thoi() { clearTimeout(hen); hen = null; }
    el.tieuDe.addEventListener('pointerdown', bat);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) { el.tieuDe.addEventListener(s, thoi); });
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu; el.tb.classList.add('hien');
    clearTimeout(tbHen); tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2400);
  }

  function doiChuoi(d) {
    var dsc = App.dsChuong(), i = App.chiSoChuong(App.chuong) + d;
    if (i < 0 || i >= dsc.length) return;
    App.chuong = dsc[i].ma; ve();
  }

  function lyDoChu(tt) {
    if (tt.lyDo === 'chuoi') return t('chon.khoaChuoi', { n: tt.chuoi });
    if (tt.lyDo === 'hang1') return t('chon.khoaHang1');
    if (tt.lyDo === 'hang23') return t('chon.khoaHang23');
    if (tt.lyDo === 'trum') return t('chon.trumKhoa');
    return t('chon.khoaMan');
  }

  function saoHang(n, s) {
    var d = h('div', 'stars');
    for (var i = 0; i < 3; i++) d.appendChild(Ve.sao(i < n, s || 2));
    return d;
  }

  function ve() {
    var n = App.chuong, dsc = App.dsChuong(), vt = App.chiSoChuong(n), cc = dsc[vt];
    el.tieuDe.innerHTML = '';
    el.tieuDe.appendChild(document.createTextNode(t('chon.chuoi', { n: '' })));
    el.tieuDe.appendChild(h('span', 'd', cc.so));
    el.tieuDe.appendChild(document.createTextNode(' · '));
    el.tieuDe.appendChild(h('em', null, cc.ten));
    el.truoc.classList.toggle('mo-mo', vt <= 0); el.sau.classList.toggle('mo-mo', vt >= dsc.length - 1);
    if (App.moHet) el.tieuDe.appendChild(h('span', 'c-mh', t('chon.moHetNhan')));

    var ds = App.dsMan(n), xong = ds.filter(function (m) { return Luu.daQua(m.ma); }).length;
    el.bar.innerHTML = '';
    for (var i = 0; i < ds.length; i++) el.bar.appendChild(h('div', 'seg' + (i < xong ? ' on' : '')));
    el.pl.textContent = t('chon.tienDo', { n: xong, tong: ds.length });

    // màn "hiện tại" = màn mở đầu tiên chưa qua
    var cur = null;
    ds.forEach(function (m) { if (!cur && m.hang !== 'trum' && App.trangThai(m).mo && !Luu.daQua(m.ma)) cur = m; });

    el.luoi.innerHTML = '';
    HANG.forEach(function (hang) {
      var row = h('div', 'c-hang');
      row.appendChild(h('div', 'c-nhan', t('chon.hang.' + hang)));
      var cells = h('div', 'c-o');
      App.dsHang(n, hang).forEach(function (m) { cells.appendChild(oMan(m, m === cur)); });
      row.appendChild(cells); el.luoi.appendChild(row);
    });

    veTrum(App.trum(n));
    veHam();
  }

  function oMan(m, laCur) {
    var tt = App.trangThai(m), sao = Luu.saoTot(m.ma);
    var b = h('button', 'bt c-man ' + (!tt.mo ? 'lock' : sao > 0 ? 'done' : laCur ? 'cur' : 'open'));
    b.setAttribute('data-man', m.ma); b.setAttribute('data-id', m.id);
    b.setAttribute('aria-label', m.id + ' ' + m.ten);
    b.appendChild(h('div', 'num', App.sttCua(m)));
    if (!tt.mo) {
      var lk = h('div', 'lk'); lk.appendChild(Ve.khoa(3)); b.appendChild(lk);
    } else if (sao > 0 || !laCur) {
      b.appendChild(saoHang(sao, 2));
    } else {
      b.appendChild(h('div', 'go', t('chon.choi')));
    }
    b.addEventListener('click', function () {
      if (!tt.mo) {
        b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
        thongBao(lyDoChu(tt));
        return;
      }
      b.classList.add('pr'); setTimeout(function () { b.classList.remove('pr'); }, 120);
      App.vaoMan(m.ma);
    });
    return b;
  }

  function veTrum(m) {
    el.trum.innerHTML = '';
    if (!m) { el.trum.style.display = 'none'; return; }
    el.trum.style.display = '';
    var tt = App.trangThai(m), sao = Luu.saoTot(m.ma), xong = sao > 0;
    el.trum.className = 'bt c-trum ' + (xong ? 'done' : tt.mo ? 'open' : 'lock');
    el.trum.setAttribute('data-man', m.ma); el.trum.setAttribute('data-id', m.id);
    el.trum.appendChild(h('div', 'hz'));
    var bs = h('div', 'bs'); bs.setAttribute('data-i', xong && m.huyHieu ? 'huyhieu' : 'trum'); bs.setAttribute('data-s', '3'); bs.setAttribute('data-on', tt.mo || xong ? '1' : '0'); el.trum.appendChild(bs);
    var bx = h('div', 'bx');
    var bt = h('div', 'bt2'); bt.appendChild(h('em', null, t('chon.trum'))); bt.appendChild(document.createTextNode(' · ' + m.ten)); bx.appendChild(bt);
    if (m.huyHieu) {
      bx.appendChild(h('div', 'rw', m.huyHieu.ten));
    }
    bx.appendChild(h('div', 'why', xong ? t('chon.trumXong') : tt.mo ? t('chon.trumMo') : t('chon.trumKhoa')));
    el.trum.appendChild(bx);
    var bl = h('div', 'bl');
    if (!tt.mo) bl.appendChild(Ve.khoa(3));
    else bl.appendChild(saoHang(sao, 2));
    el.trum.appendChild(bl);
    Ve.hydrate(el.trum);
    el.trum.onclick = function () {
      if (!tt.mo) {
        el.trum.classList.remove('nope'); void el.trum.offsetWidth; el.trum.classList.add('nope');
        thongBao(lyDoChu(tt)); return;
      }
      App.vaoMan(m.ma);
    };
  }

  function veHam() {
    var ds = KhoHam.ds();
    el.thu.innerHTML = '';
    el.thu.appendChild(h('div', 'c-thu-td', t('chon.hamCuaEm')));
    var pills = h('div', 'c-pills'); el.thu.appendChild(pills);
    if (!ds.length) {
      pills.appendChild(h('div', 'pill ghost', t('chon.hamRong')));
    } else {
      ds.forEach(function (f) { var p = h('div', 'pill', f.ten + '()'); p.setAttribute('data-ham', f.ten); pills.appendChild(p); });
    }
    el.thu.appendChild(h('div', 'c-thu-goi', ds.length ? t('chon.hamGoiYCo') : t('chon.hamGoiY')));
    // không bao giờ tràn: bớt viên thuốc cuối cho tới khi vừa, thêm "+n"
    var bo = 0, them = null;
    while (pills.scrollHeight > pills.clientHeight + 1) {
      var ham = pills.querySelectorAll('.pill[data-ham]');
      if (ham.length <= 1) break;
      pills.removeChild(ham[ham.length - 1]); bo++;
      if (!them) them = h('div', 'pill them'); them.textContent = '+' + bo;
      pills.appendChild(them);
    }
  }

  window.Chon = { dung: dung, ve: ve, thongBao: thongBao };
})();
