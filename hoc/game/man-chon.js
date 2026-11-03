var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-chon.js — "Robot Chấn Hưng": LƯỚI MÀN CỦA MỘT GÓI (window.Chon), kiểu lưới màn trong hộp của Cut the Rope.
   Thanh trên: ◀ (về chọn gói) · "GÓI n" · nút Sổ lệnh. Dải bìa: huy hiệu gói · tên gói · sao của gói · thanh tiến độ (mỗi màn một vạch).
   Mỗi chương của gói một khối: dòng "Chương 4 · Tay gắp   7/10" + lưới 5×2 ô màn (ô 10 = thử thách, vẽ bằng huy hiệu của chương).
   Ô: số màn + sao / ổ khóa / "CHƠI!" (màn nên chơi). Chạm ô khóa thì rung + báo lý do (luật ở game/mo-goi.js).
   Giữ lâu tiêu đề 2 giây = mở bảng Gỡ lỗi (go-loi.js); địa chỉ có ?debug=1 / #debug thì thêm nút 🐞 trên thanh trên.
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
    el.ve = h('button', 'bt g-pu nav'); el.ve.setAttribute('aria-label', t('chon.veGoi')); el.ve.setAttribute('data-nut', 've-goi');
    var ic1 = h('span'); ic1.setAttribute('data-i', 'back'); ic1.setAttribute('data-s', '2'); el.ve.appendChild(ic1);
    el.tieuDe = h('div', 'c-td'); el.tieuDe.setAttribute('data-nut', 'tieu-de');
    el.phai = h('div', 'c-phai');
    dau.appendChild(el.ve); dau.appendChild(el.tieuDe); dau.appendChild(el.phai);
    host.appendChild(dau);

    el.bia = h('div', 'c-bia'); host.appendChild(el.bia);
    el.than = h('div', 'c-than'); host.appendChild(el.than);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(vuaTieuDe);

    el.ve.addEventListener('click', function () { App.veGoi(); });

    // giữ lâu tiêu đề 2 giây: mở bảng Gỡ lỗi (go-loi.js: chọn màn bất kỳ, "Mở hết", nạp hàm chuẩn, xóa tiến độ)
    var hen = null;
    el.tieuDe.addEventListener('pointerdown', function () {
      clearTimeout(hen);
      hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) { el.tieuDe.addEventListener(s, function () { clearTimeout(hen); hen = null; }); });
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu; el.tb.classList.add('hien');
    clearTimeout(tbHen); tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2600);
  }

  function lyDoChu(tt) {
    if (tt.lyDo === 'chua-mua') { var mb = App.dsMua().filter(function (x) { return x.ma === tt.mua; })[0]; return t('chon.khoaChuaMua', { ten: mb ? mb.ten : tt.mua }); }
    if (tt.lyDo === 'mua') return window.ChonGoi && ChonGoi.loiMua ? ChonGoi.loiMua(App.dsMua().filter(function (x) { return x.ma === tt.mua; })[0]) : t('chon.khoaMua');
    if (tt.lyDo === 'sao') return t('chon.khoaSao', { can: tt.can, co: tt.co });
    if (tt.lyDo === 'chuoi') return t('chon.khoaChuoi', { n: tt.chuoi });
    if (tt.lyDo === 'can-ham') { var cm = ManHoc.timMa(tt.canMan); return t('chon.khoaCanHam', { ham: tt.ham, id: cm ? cm.id : tt.canMan, ten: App.tenChuong(tt.canChuong) }); }
    if (tt.lyDo === 'mat-ham') { var mm = ManHoc.timMa(tt.canMan); return t('chon.khoaMatHam', { ham: tt.ham, id: mm ? mm.id : tt.canMan }); }
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

  /** Tiêu đề dài ("Gói 5 · Cảm biến khoảng cách") thì co chữ (hệ số --ts) cho vừa chỗ, không đè lên nút. */
  function vuaTieuDe() {
    var td = el.tieuDe; if (!td) return;
    td.style.removeProperty('--ts');
    if (!td.clientWidth) return;
    var ts = 1;
    while (td.scrollWidth > td.clientWidth + 1 && ts > 0.5) { ts = Math.round((ts - 0.04) * 100) / 100; td.style.setProperty('--ts', ts); }
  }

  function goiDangXem() {
    var g = App.goiTheoMa(App.goi) || App.goiCua(App.chuong);
    if (!g || g.sapCo) g = App.dsGoi().filter(function (x) { return !x.sapCo; })[0];
    return g;
  }

  function ve() {
    var g = goiDangXem(); if (!g) return;
    App.goi = g.ma;
    el.tieuDe.innerHTML = '';
    el.tieuDe.appendChild(document.createTextNode(t('goi.so', { n: '' })));
    el.tieuDe.appendChild(h('span', 'd', g.so));
    if (App.moHet) el.tieuDe.appendChild(h('span', 'c-mh', t('chon.moHetNhan')));

    // dải bìa gói
    el.bia.innerHTML = '';
    var hinh = h('div', 'c-bia-hinh'), coHinh = window.HuyHieu && HuyHieu.DS.indexOf(g.hinh) >= 0, quaHet = App.soQua(g) === g.man.length;
    hinh.appendChild(coHinh ? HuyHieu.mk(g.hinh, quaHet ? 'xong' : 'mo', 2) : Ve.ico('plus', 4, { fill: BM.vang, line: BM.vienDam }));
    el.bia.appendChild(hinh);
    var bx = h('div', 'c-bia-bx');
    bx.appendChild(h('div', 'c-bia-ten', g.ten));
    var sg = h('div', 'c-saog'); sg.appendChild(Ve.sao(true, 2)); sg.appendChild(h('span', null, App.saoGoi(g) + '/' + g.saoToiDa)); bx.appendChild(sg);
    var vach = h('div', 'c-bar');
    g.man.forEach(function (m) { vach.appendChild(h('div', 'seg' + (Luu.daQua(m.ma) ? ' on' : ''))); });
    bx.appendChild(vach);
    el.bia.appendChild(bx);

    el.phai.innerHTML = '';
    if (window.SoLenh && window.SoLenhMan) {                                         // Sổ lệnh (thư viện hàm): một nút nhỏ, bấm mới mở
      var bs = h('button', 'bt g-cy c-so'); bs.setAttribute('data-nut', 'so-lenh'); bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span'); ib.setAttribute('data-i', 'book'); ib.setAttribute('data-s', '2'); ib.setAttribute('data-l', BM.xanhLo); bs.appendChild(ib);
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.phai.appendChild(bs);
    }
    if (window.GoLoi) GoLoi.nutBug(el.phai);                                         // 🐞: chỉ có khi địa chỉ có ?debug=1 hoặc #debug
    Ve.hydrate(el.phai);
    vuaTieuDe();

    // màn "hiện tại" = màn mở đầu tiên chưa qua (trong gói)
    var cur = null;
    g.man.forEach(function (m) { if (!cur && App.trangThai(m).mo && !Luu.daQua(m.ma)) cur = m; });

    el.than.innerHTML = '';
    el.than.classList.toggle('mot', g.chuong.length === 1);
    var dsc = App.dsChuong();
    g.chuong.forEach(function (c) {
      var cc = dsc.filter(function (x) { return x.ma === c; })[0];
      var ds = App.dsMan(c).slice().sort(function (a, b) { return a.so - b.so; });
      var xong = ds.filter(function (m) { return Luu.daQua(m.ma); }).length;
      var khoi = h('div', 'c-ch'); khoi.setAttribute('data-chuong', c);
      var hd = h('div', 'c-ch-hd');
      hd.appendChild(document.createTextNode(t('chon.chuoi', { n: '' })));
      hd.appendChild(h('span', 'd', cc ? cc.so : ''));
      hd.appendChild(document.createTextNode(' · '));
      hd.appendChild(h('em', null, App.tenChuong(c)));
      hd.appendChild(h('span', 'c-ch-dem', t('chon.tienDo', { n: xong, tong: ds.length })));
      khoi.appendChild(hd);
      var luoi = h('div', 'c-l5');
      ds.forEach(function (m) { luoi.appendChild(oMan(m, m === cur)); });
      khoi.appendChild(luoi);
      el.than.appendChild(khoi);
    });
  }

  function oMan(m, laCur) {
    var tt = App.trangThai(m), sao = Luu.saoTot(m.ma), trum = m.hang === 'trum';
    var b = h('button', 'bt c-man ' + (!tt.mo ? 'lock' : sao > 0 ? 'done' : laCur ? 'cur' : 'open') + (trum ? ' trum' : ''));
    b.setAttribute('data-man', m.ma); b.setAttribute('data-id', m.id);
    b.setAttribute('aria-label', m.id + ' ' + m.ten);
    if (trum) {
      var bs = h('div', 'bs'); bs.setAttribute('data-i', 'huyhieu'); bs.setAttribute('data-s', '1');
      bs.setAttribute('data-ma', (m.huyHieu && m.huyHieu.ma) || m.chuong); bs.setAttribute('data-tt', sao > 0 ? 'xong' : tt.mo ? 'mo' : 'khoa');
      b.appendChild(bs);
      if (tt.mo) b.appendChild(saoHang(sao, 1.5));
      Ve.hydrate(b);
    } else {
      b.appendChild(h('div', 'num', App.sttCua(m)));
      if (!tt.mo) { var lk = h('div', 'lk'); lk.appendChild(Ve.khoa(2)); b.appendChild(lk); }
      else if (sao > 0 || !laCur) b.appendChild(saoHang(sao, 1.5));
      else b.appendChild(h('div', 'go', t('chon.choi')));
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

  window.Chon = { dung: dung, ve: ve, thongBao: thongBao };
})();
