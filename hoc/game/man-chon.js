var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-chon.js — "Robot Chấn Hưng": BẢN ĐỒ MÀN CỦA MỘT GÓI (window.Chon).
   Thanh trên: ◀ (về chọn gói) · "GÓI n" · nút Sổ lệnh. Dải bìa: huy hiệu gói · tên gói · sao của gói · thanh tiến độ (mỗi màn một vạch).
   Dưới bìa (3/11): bản đồ cuộn dọc = ảnh dài 9 nơi chốn của phim CLB (dai-9.webp) lặp vô hạn; các màn là chấm tròn nằm trên con đường,
   đi từ trên xuống, bắt đầu ở nơi chốn của mùa. Đầu mỗi chương một biển "Chương 4 · Tay gắp  7/10"; chấm 10 = thử thách (huy hiệu chương).
   Chấm: số màn + sao / ổ khóa / cờ "CHƠI!" (màn nên chơi). Chạm chấm khóa thì rung + báo lý do (luật ở game/mo-goi.js).
   Giữ lâu tiêu đề 2 giây = mở bảng Gỡ lỗi (go-loi.js); địa chỉ có ?debug=1 / #debug thì thêm nút 🐞 trên thanh trên.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var GIU_LAU_MS = 2000;

  /* Bản đồ: ảnh 720×10477 vẽ rộng 360 (K = 0.5), lặp dọc (choi.css .c-bd). DUONG = hoành độ giữa đường (px ảnh) mỗi 16px dọc,
     dò bằng tools/do-duong-ban-do.py. Đường bắt đầu dưới cổng CLB (DAU_DUONG), hết ở vòng xuyến trong hang (CUOI_DUONG): qua đó thì nhảy sang tấm ảnh kế. */
  var AW = 720, AH = 10477, K = 360 / AW, BUOC_DUONG = 16, DAU_DUONG = 340, CUOI_DUONG = 10150;
  var VUNG = 1724 * AW / 1080;        // mỗi nơi chốn cao 1724 px ảnh gốc 1080: CLB, kho, nhà máy, bãi tái chế, cảng, bến sông, nông trại, mỏ đá, hang
  var KHOANG = 172;                   // giữa hai chấm (px ảnh) = 86px màn hình
  var THEM_DUOI = 280;                // px màn hình dư dưới chấm cuối; cuộn gần đáy thì nối thêm một tấm ảnh
  var DUONG = [
    362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,365,370,376,382,385,385,385,385,380,374,367,361,358,
    358,358,358,361,367,374,380,385,387,387,387,387,383,378,373,367,363,358,357,357,357,357,358,359,360,360,360,361,361,361,361,362,368,374,380,385,389,391,391,391,391,
    389,385,381,375,375,375,364,362,359,357,355,352,350,350,350,350,351,352,356,360,361,366,371,372,376,376,376,376,376,376,375,374,373,372,371,367,366,365,364,363,362,
    362,362,362,363,364,365,366,367,372,373,374,379,380,381,382,383,384,385,385,385,385,385,384,383,382,381,380,378,378,378,378,378,378,378,378,378,378,378,378,378,378,
    376,374,372,370,367,365,363,361,359,357,357,356,356,356,356,356,357,358,360,363,366,369,371,373,374,375,375,375,374,373,372,372,370,368,368,368,368,367,367,367,367,
    367,369,369,369,371,371,371,371,371,371,371,371,371,370,368,366,366,364,364,364,364,364,367,370,373,376,377,377,377,377,377,375,373,371,369,366,364,362,360,358,358,
    357,357,357,357,358,359,361,364,367,370,373,376,379,383,386,389,391,394,395,396,396,396,396,396,396,396,394,392,390,388,385,383,381,379,377,375,373,371,369,367,365,
    365,365,365,365,363,363,363,361,361,361,361,361,362,363,365,367,369,373,377,381,386,391,395,398,401,401,401,401,401,398,394,389,384,379,374,369,366,362,361,360,360,
    360,360,360,362,366,369,373,375,378,379,379,379,379,377,375,374,372,370,369,367,366,364,363,362,362,362,362,361,361,361,361,361,361,361,361,360,360,359,359,359,359,
    359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,360,360,360,360,360,360,360,360,361,
    362,362,364,366,368,372,376,381,387,394,401,407,409,409,409,409,408,406,405,404,404,404,403,403,403,403,403,403,403,403,402,402,402,402,402,401,401,399,397,393,389,
    385,384,382,381,381,381,381,382,383,387,388,388,388,388,388,387,386,382,381,377,373,372,371,369,368,367,366,366,366,367,367,368,369,373,376,380,384,387,391,394,395,
    396,397,397,397,397,397,397,396,395,394,394,394,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,390,387,383,379,374,370,367,363,361,
    361,361,361,362,363,366,368,372,376,381,385,389,393,393,393,393,393,393,391,388,384,380,377,374,374,374,374,375,378,382,385,388,391,393,393,393,393,393,392,390,387,
    385,383,380,377,376,374,373,372,372,372,375,379,390,395,397,397,397,397,397,397,397,390,378,365,353,350,350,350,350,350,352,358,369,383,396,396,396,396,396,394,387,
    374,361,352,345,341,341,341,341,341,347,353,353,353,353,353,353,353,353,353,353,353,339,334,334,334,342,342,342,342,342,342,342,342,342,342,342,342,342,342,342
  ];

  function duongX(y) {
    var yy = ((y % AH) + AH) % AH, i = yy / BUOC_DUONG, a = Math.floor(i), b = Math.min(a + 1, DUONG.length - 1);
    a = Math.min(a, DUONG.length - 1);
    return DUONG[a] + (DUONG[b] - DUONG[a]) * (i - Math.floor(i));
  }
  /** Chỗ y (px ảnh, có thể quá một tấm) nằm ngoài con đường thì dời xuống đầu đường của tấm kế (hoặc cùng tấm). */
  function trenDuong(y) {
    var yy = ((y % AH) + AH) % AH;
    if (yy > CUOI_DUONG) return y - yy + AH + DAU_DUONG;
    if (yy < DAU_DUONG) return y - yy + DAU_DUONG;
    return y;
  }
  /** Mùa → nơi chốn trên ảnh: mua-1 kho … mua-8 hang; mua-9 (về CLB) và mùa khác ở cổng CLB. */
  function dauMua(mua) {
    var n = +(/^mua-(\d)$/.exec(mua || '') || [])[1];
    return n >= 1 && n <= 8 ? n * VUNG + 110 : DAU_DUONG;
  }

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
    el.bd = h('div', 'c-bd'); el.than.appendChild(el.bd);
    el.than.addEventListener('scroll', noiThem, { passive: true });
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

    // bản đồ: đặt biển chương và chấm màn dọc con đường (px ảnh), rồi đổi sang px màn hình tính từ mép trên bản đồ
    var y = trenDuong(dauMua(g.mua)), goc = y - 130, dsc = App.dsChuong(), cuoiY = 0, curY = null;
    function dat(y0) { var yy = trenDuong(y0); return { y: yy, sx: duongX(yy) * K, sy: (yy - goc) * K }; }
    el.bd.innerHTML = '';
    el.bd.style.backgroundPosition = '0 ' + (-goc * K) + 'px';
    g.chuong.forEach(function (c, ci) {
      var cc = dsc.filter(function (x) { return x.ma === c; })[0];
      var ds = App.dsMan(c).slice().sort(function (a, b) { return a.so - b.so; });
      var xong = ds.filter(function (m) { return Luu.daQua(m.ma); }).length;
      if (ci > 0) y += KHOANG * 0.2;
      var p = dat(y); y = p.y;
      var bien = h('div', 'c-ch'); bien.setAttribute('data-chuong', c);
      bien.style.top = p.sy + 'px';
      var hd = h('div', 'c-ch-hd');
      hd.appendChild(document.createTextNode(t('chon.chuoi', { n: '' })));
      hd.appendChild(h('span', 'd', cc ? cc.so : ''));
      hd.appendChild(document.createTextNode(' · '));
      hd.appendChild(h('em', null, App.tenChuong(c)));
      hd.appendChild(h('span', 'c-ch-dem', t('chon.tienDo', { n: xong, tong: ds.length })));
      bien.appendChild(hd);
      el.bd.appendChild(bien);
      y += KHOANG;
      ds.forEach(function (m) {
        var q = dat(y); y = q.y + KHOANG;
        var b = oMan(m, m === cur);
        b.style.left = Math.max(34, Math.min(326, q.sx)) + 'px'; b.style.top = q.sy + 'px';
        el.bd.appendChild(b);
        cuoiY = q.sy;
        if (m === cur) curY = q.sy;
      });
    });
    el.bd.style.height = Math.max(cuoiY + THEM_DUOI, el.than.clientHeight + 1) + 'px';
    // cuộn tới màn nên chơi (chưa có thì màn cuối đã qua / đầu bản đồ)
    var den = curY != null ? curY : 0;
    el.than.scrollTop = Math.max(0, den - el.than.clientHeight * 0.55);
    noiThem();
  }

  /** Cuộn vô hạn: gần đáy bản đồ thì cao thêm một tấm ảnh (ảnh lặp dọc nên nối liền). */
  function noiThem() {
    var t0 = el.than, cao = el.bd.offsetHeight;
    if (t0.scrollTop + t0.clientHeight > cao - 600) el.bd.style.height = (cao + Math.round(AH * K)) + 'px';
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
