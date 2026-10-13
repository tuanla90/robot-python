/* ============================================================================
   ung-dung.js — "Đường học": KHỞI ĐỘNG, CO GIÃN KHUNG 360×640, ĐỊNH TUYẾN, MỞ KHÓA (window.App).
   ========================================================================== */
(function () {
  'use strict';

  var App = {
    chuoi: 1,            // chuỗi đang xem ở màn chọn
    moHet: false,        // chế độ thử: mở hết (giữ lâu tiêu đề 2 giây ở màn chọn)
    man: null            // màn đang chơi
  };

  /* ---------------------------------------------------------------- dữ liệu */
  function chuoiCua(m) { return +String(m.id).split('.')[0]; }
  function sttCua(m) { return +String(m.id).split('.')[1]; }
  App.chuoiCua = chuoiCua; App.sttCua = sttCua;
  App.soChuoi = function () {
    var max = 1; ManHoc.danhSach.forEach(function (m) { if (chuoiCua(m) > max) max = chuoiCua(m); });
    return max;
  };
  App.dsChuoi = function (n) { return ManHoc.danhSach.filter(function (m) { return chuoiCua(m) === n; }); };
  App.trum = function (n) { return App.dsChuoi(n).filter(function (m) { return m.hang === 'trum'; })[0] || null; };
  App.dsHang = function (n, hang) { return App.dsChuoi(n).filter(function (m) { return m.hang === hang; }); };

  /**
   * Mở khóa:
   *  - hàng "Làm quen" chơi lần lượt; xong cả hàng thì mở hàng "Luyện" và "Biến thể";
   *  - trùm mở khi qua đủ 9 màn; chuỗi n+1 mở khi thắng trùm chuỗi n.
   * Trả về { mo, lyDo } với lyDo: 'chuoi' | 'hang1' | 'hang23' | 'trum'.
   */
  App.trangThai = function (m) {
    if (App.moHet) return { mo: true };
    var n = chuoiCua(m);
    if (n > 1) {
      var tr = App.trum(n - 1);
      if (tr && !Luu.daQua(tr.id)) return { mo: false, lyDo: 'chuoi', chuoi: n - 1 };
    }
    var h1 = App.dsHang(n, 'lam-quen');
    if (m.hang === 'lam-quen') {
      var i = h1.indexOf(m);
      return i <= 0 || Luu.daQua(h1[i - 1].id) ? { mo: true } : { mo: false, lyDo: 'hang1' };
    }
    var xongH1 = h1.every(function (x) { return Luu.daQua(x.id); });
    if (m.hang === 'trum') {
      var chin = App.dsChuoi(n).filter(function (x) { return x.hang !== 'trum'; });
      return chin.every(function (x) { return Luu.daQua(x.id); }) ? { mo: true } : { mo: false, lyDo: 'trum' };
    }
    return xongH1 ? { mo: true } : { mo: false, lyDo: 'hang23' };
  };
  /** Màn kế tiếp đã mở (theo thứ tự trong danh sách), hoặc null. */
  App.manTiep = function (m) {
    var ds = ManHoc.danhSach, i = ds.indexOf(m);
    if (i < 0 || i + 1 >= ds.length) return null;
    var k = ds[i + 1];
    return App.trangThai(k).mo ? k : null;
  };

  /* ---------------------------------------------------------------- màn hình */
  App.hien = function (ten) {
    TP.Chan.giu(400);                                  // cú bấm đến muộn không rơi xuống màn mới
    document.getElementById('sc-chon').classList.toggle('hidden', ten !== 'chon');
    document.getElementById('sc-choi').classList.toggle('hidden', ten !== 'choi');
    if (ten === 'chon') Chon.ve();
  };
  App.vaoMan = function (id) {
    var m = ManHoc.tim(id); if (!m) return;
    App.man = m; App.chuoi = chuoiCua(m);
    App.hien('choi');
    Choi.vao(m);
  };
  App.veChon = function () {
    TP.Hop.dong();
    Choi.roi && Choi.roi();
    App.hien('chon');
  };

  /* --------------------------------------------------------- co giãn khung */
  function vua() {
    var st = document.getElementById('stage');
    var vv = window.visualViewport;
    var w = vv ? vv.width : window.innerWidth, hh = vv ? vv.height : window.innerHeight;
    var doc = w <= 520 && hh > w;                      // điện thoại cầm dọc: lấp đầy màn hình
    var sh = 640, s = Math.min(w / 360, hh / 640);
    if (doc) { s = w / 360; sh = Math.max(640, Math.min(900, hh / s)); s = Math.min(s, hh / sh); }
    st.style.setProperty('--sh', sh + 'px');
    st.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    document.body.classList.toggle('dien-thoai', doc);
  }

  /* ------------------------------------------------------------------ khởi động */
  function boot() {
    document.title = t('chung.tenGame');
    Ve.datChatLieu();
    var r = Luu.docKho();
    var kb = document.getElementById('sc-chon'), kc = document.getElementById('sc-choi');
    Chon.dung(kb);
    Choi.dung(kc);
    Ve.khungGo(kb.querySelector(".deco"));
    Ve.khungGo(kc.querySelector(".deco"));
    // chuỗi mở ban đầu: chuỗi của màn tiếp theo cần chơi
    var ds = ManHoc.danhSach, dau = null;
    for (var i = 0; i < ds.length; i++) { if (App.trangThai(ds[i]).mo && !Luu.daQua(ds[i].id)) { dau = ds[i]; break; } }
    App.chuoi = dau ? chuoiCua(dau) : App.soChuoi();
    App.hien('chon');
    if (!r.ok) App.baoKho = r;
    vua();
    window.addEventListener('resize', vua);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', vua);
    document.body.classList.add('san-sang');
    if (App.baoKho) Chon.thongBao(t('tb.khoDoc', { loi: App.baoKho.loi }));
    else if (Luu.laBoNho) Chon.thongBao(t('choi.loiLuu'));
    phongDuPhong();
  }

  /** Không tải được phông Google (không mạng): đánh dấu body.fb để CSS thu nhỏ chữ cho vừa khung. */
  function phongDuPhong() {
    var fb = function () { document.body.classList.add('fb'); };
    try {
      if (!document.fonts || !document.fonts.load) { fb(); return; }
      var hen = setTimeout(fb, 3000);
      Promise.all([document.fonts.load('600 16px "Handjet"', t('choi.chay') + ' ạịợữỳĐ'), document.fonts.load('400 16px "VT323"', 'turn_right()')]).then(function (r) {
        clearTimeout(hen);
        if (!r[0].length || !r[1].length) fb(); else document.body.classList.remove('fb');
      }).catch(function () { clearTimeout(hen); fb(); });
    } catch (e) { fb(); }
  }

  window.App = App;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
