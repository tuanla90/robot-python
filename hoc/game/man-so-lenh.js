/* ============================================================================
   man-so-lenh.js — "Đường học": SỔ LỆNH (window.SoLenhMan).
   Mở từ nút "Sổ lệnh" (quyển sách) ở màn khởi đầu, màn chọn gói và thanh trên của lưới màn; trang "Hàm của em" là thư viện hàm của người chơi. Dữ liệu do lõi giữ ở window.SoLenh (robotics/hoc/so-lenh.js):
     SoLenh.ds        = [{ ten, nhom, moTa, chuong }]   hàm theo cốt truyện người chơi tự chế (nhom: 'xe' | 'tay' | 'lap' | 'cam-bien' …)
     SoLenh.tenNhom   = { nhom: 'tên hiển thị' }        (hoặc hàm nhom → tên)
     SoLenh.lenhGoc   = [{ ten, nguoc, moTa }]          cặp lệnh gốc và lệnh ngược của nó
   Trang theo NHÓM: hàm đã có trong kho (KhoHam) hiện tên + thân hàm bằng font code; chưa có thì "???" + mô tả + "Chế ở chương …".
   Chỉ hiện thẻ của nhóm đã mở (+ "Lệnh gốc", "Hàm của em"); các nhóm chưa mở gộp thành một dòng mờ "Còn N nhóm chưa mở". Thêm trang "Lệnh gốc" (cặp lệnh ngược) và trang "Hàm của em"
   (hàm trong kho không thuộc sổ). Vừa khung 360×640: danh sách cuộn BÊN TRONG hộp sổ, màn chọn vẫn không cuộn.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var TRANG_GOC = '@goc', TRANG_EM = '@em';
  var S = { trang: null, dsEl: null, tabs: null, hop: null };

  /* ------------------------------------------------------------ dữ liệu */
  function dsLenh() { return (window.SoLenh && Array.isArray(SoLenh.ds)) ? SoLenh.ds : []; }
  function dsGoc() { return (window.SoLenh && Array.isArray(SoLenh.lenhGoc)) ? SoLenh.lenhGoc : []; }
  function tenChuong(ma) { return window.App ? App.tenChuong(ma) : ma; }
  function chuongMo(ma) { return !!(window.App && App.chuongMo(ma)); }
  function thuTuChuong(ma) {
    var tt = window.ThuTuChuong && ThuTuChuong.thuTu, i = tt ? tt.indexOf(ma) : -1;
    return i < 0 ? 999 : i;
  }
  function tenNhom(nh) {
    var tn = window.SoLenh && SoLenh.tenNhom;
    if (typeof tn === 'function') { var r = tn(nh); if (r) return r; }
    else if (tn && typeof tn === 'object' && tn[nh]) return tn[nh];
    var x = t('so.nhom.' + nh);
    return x === 'so.nhom.' + nh ? nh : x;
  }
  /** Các nhóm có ít nhất một lệnh, theo thứ tự khai trong SoLenh.tenNhom (nếu là bảng) rồi thứ tự xuất hiện trong SoLenh.ds. */
  function dsNhom() {
    var thu = [], thay = {}, co = {};
    dsLenh().forEach(function (c) { co[c.nhom] = true; });
    var tn = window.SoLenh && SoLenh.tenNhom;
    if (tn && typeof tn === 'object' && !Array.isArray(tn)) Object.keys(tn).forEach(function (k) { if (co[k] && !thay[k]) { thay[k] = 1; thu.push(k); } });
    dsLenh().forEach(function (c) { if (!thay[c.nhom]) { thay[c.nhom] = 1; thu.push(c.nhom); } });
    return thu;
  }
  function lenhCuaNhom(nh) { return dsLenh().filter(function (c) { return c.nhom === nh; }); }
  /** Nhóm xem được khi có ít nhất một chương của nó đã mở. */
  function nhomMo(nh) { return lenhCuaNhom(nh).some(function (c) { return chuongMo(c.chuong); }); }
  /** Chương sớm nhất trong thứ tự chương của nhóm (nơi nhóm mở ra). */
  function chuongMoNhom(nh) {
    var kq = null;
    lenhCuaNhom(nh).forEach(function (c) { if (kq === null || thuTuChuong(c.chuong) < thuTuChuong(kq)) kq = c.chuong; });
    return kq;
  }
  /** Lệnh gốc người chơi đã gặp: có trên khay của một màn đã mở. */
  function lenhDaBiet() {
    var biet = {};
    (window.ManHoc ? ManHoc.danhSach : []).forEach(function (m) {
      if (window.App && App.trangThai(m).mo) (m.hamGoc || []).forEach(function (n) { biet[n] = true; });
    });
    return biet;
  }

  /* -------------------------------------------------------------- vẽ thẻ */
  function dongDef(f) { return 'def ' + f.ten + '(' + (f.thamSo || []).join(', ') + '):'; }
  function thanHam(f) {
    var dong = [dongDef(f)];
    var than = (f.than || []).filter(function (s) { return String(s).trim() !== ''; });
    if (!than.length) dong.push('    ' + t('so.hamTrong'));
    else than.forEach(function (s) { dong.push('    ' + s); });
    return dong.join('\n');
  }
  function theHam(ten, moTa, chuong) {
    var f = KhoHam.tim(ten), the = h('div', 'so-the ' + (f ? 'co' : 'chua'));
    the.setAttribute('data-ham', ten);
    var hd = h('div', 'so-hd');
    hd.appendChild(h('span', 'so-ten', f ? ten + '(' + (f.thamSo || []).join(', ') + ')' : t('so.chuaBiet')));
    if (f) { var ok = h('span', 'so-ok'); ok.appendChild(Ve.ico('check', 1, { fill: '#7cff86', line: '#0e2a14' })); hd.appendChild(ok); }
    else hd.appendChild(h('span', 'so-nhan', t('so.chuaChe')));
    the.appendChild(hd);
    if (moTa) the.appendChild(h('div', 'so-mota', moTa));
    if (f) the.appendChild(h('pre', 'so-than', thanHam(f)));
    else if (chuong) the.appendChild(h('div', 'so-che', t('so.cheO', { chuong: tenChuong(chuong) })));
    return the;
  }
  function theNhomKhoa(nh) {
    var the = h('div', 'so-the khoa');
    the.setAttribute('data-nhom-khoa', nh);
    var ic = h('span', 'so-khoa-ic'); ic.appendChild(Ve.khoa(1, true));
    the.appendChild(ic);
    the.appendChild(h('span', 'so-khoa-chu', t('so.nhomKhoa', { chuong: tenChuong(chuongMoNhom(nh)) })));
    return the;
  }
  function tenLenhGoc(ten, biet) { return ten && biet[ten] ? ten + '()' : t('so.chuaBiet'); }
  function theGoc(c, biet) {
    var the = h('div', 'so-the goc'); the.setAttribute('data-goc', c.ten);
    var hd = h('div', 'so-hd goc');
    hd.appendChild(h('span', 'so-ten' + (biet[c.ten] ? '' : ' mo'), tenLenhGoc(c.ten, biet)));
    if (c.nguoc) {
      var mt = h('span', 'so-cap'); mt.appendChild(Ve.ico('back', 1, { fill: '#ffd95a', line: '#1b120a' })); mt.appendChild(Ve.ico('next', 1, { fill: '#ffd95a', line: '#1b120a' }));
      hd.appendChild(mt);
      hd.appendChild(h('span', 'so-ten' + (biet[c.nguoc] ? '' : ' mo'), tenLenhGoc(c.nguoc, biet)));
    }
    the.appendChild(hd);
    if (c.moTa) the.appendChild(h('div', 'so-mota', c.moTa));
    if (!c.nguoc) the.appendChild(h('div', 'so-che xam', t('so.khongNguoc')));
    return the;
  }

  /* ------------------------------------------------------------ trang */
  function veTrang() {
    var el = S.dsEl; el.innerHTML = ''; el.scrollTop = 0;
    if (S.trang === TRANG_GOC) {
      var biet = lenhDaBiet(), g = dsGoc();
      if (!g.length) el.appendChild(h('div', 'so-rong', t('so.nhomRong')));
      g.forEach(function (c) { el.appendChild(theGoc(c, biet)); });
    } else if (S.trang === TRANG_EM) {
      var trongSo = {}; dsLenh().forEach(function (c) { trongSo[c.ten] = true; });
      var em = KhoHam.ds().filter(function (f) { return !trongSo[f.ten]; });
      if (!em.length) el.appendChild(h('div', 'so-rong', t('so.hamEmGoiY')));
      em.forEach(function (f) { el.appendChild(theHam(f.ten, '', null)); });
    } else if (!nhomMo(S.trang)) {
      el.appendChild(theNhomKhoa(S.trang));
    } else {
      var ds = lenhCuaNhom(S.trang);
      if (!ds.length) el.appendChild(h('div', 'so-rong', t('so.nhomRong')));
      ds.forEach(function (c) { el.appendChild(theHam(c.ten, c.moTa, c.chuong)); });
    }
    Array.prototype.forEach.call(S.tabs.children, function (b) { b.classList.toggle('on', b.getAttribute('data-trang') === S.trang); });
  }
  function dungTab() {
    S.tabs.innerHTML = '';
    function them(ma, chu, khoa) {
      var b = h('button', 'bt so-tab ' + (khoa ? 'g-wd khoa' : 'g-cy')); b.setAttribute('data-nut', 'so-tab'); b.setAttribute('data-trang', ma);
      if (khoa) { var ic = h('span', 'so-tab-khoa'); ic.appendChild(Ve.khoa(1, true)); b.appendChild(ic); }
      b.appendChild(h('span', 'so-tab-chu', chu));
      b.addEventListener('click', function () { S.trang = ma; veTrang(); });
      S.tabs.appendChild(b);
    }
    var conKhoa = 0;
    dsNhom().forEach(function (nh) { if (nhomMo(nh)) them(nh, tenNhom(nh), false); else conKhoa++; });      // chỉ thẻ của nhóm đã mở; nhóm chưa mở gộp thành một dòng mờ
    them(TRANG_GOC, t('so.lenhGoc'), false);
    them(TRANG_EM, t('so.hamEm'), false);
    if (conKhoa > 0) {
      var dong = h('div', 'so-con-khoa'); dong.setAttribute('data-con-khoa', conKhoa);
      var ic = h('span', 'so-tab-khoa'); ic.appendChild(Ve.khoa(1, true)); dong.appendChild(ic);
      dong.appendChild(h('span', 'so-con-khoa-chu', t('so.conKhoa', { n: conKhoa })));
      S.tabs.appendChild(dong);
    }
  }

  /** Mở sổ lệnh. trang (tùy chọn): mã nhóm cần mở sẵn. */
  function mo(trang) {
    if (!window.SoLenh) return;
    var hop = TP.Hop.mo(t('so.tieuDe'), 'hop-so');
    S.hop = hop;
    S.tabs = h('div', 'so-tabs'); S.dsEl = h('div', 'so-ds');
    hop.than.appendChild(S.tabs); hop.than.appendChild(S.dsEl);
    var nhom = dsNhom();
    var dau = trang || (nhom.filter(nhomMo)[0]) || TRANG_GOC;                                   // chưa mở nhóm nào thì mở trang "Lệnh gốc"
    S.trang = dau;
    dungTab(); veTrang();
    var hang = h('div', 'hop-hang so-chan');
    hang.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); S.hop = null; }, 'so-dong'));
    hop.than.appendChild(hang);
  }

  window.SoLenhMan = { mo: mo, dsNhom: dsNhom, nhomMo: nhomMo };
})();
