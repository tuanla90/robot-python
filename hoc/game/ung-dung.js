/* ============================================================================
   ung-dung.js — "Đường học": KHỞI ĐỘNG, CO GIÃN KHUNG 360×640, ĐỊNH TUYẾN, MỞ KHÓA (window.App).
   ========================================================================== */
(function () {
  'use strict';

  var App = {
    chuong: null,        // mã chương đang xem ở màn chọn (xem ManHoc.chuong())
    moHet: !!(window.GoLoi && GoLoi.docMoHet()),   // chế độ thử: mở hết (bật / tắt trong bảng Gỡ lỗi, go-loi.js; giữ ở localStorage nên tải lại vẫn còn)
    man: null            // màn đang chơi
  };

  /* ---------------------------------------------------------------- dữ liệu */
  // Chương và thứ tự chương do lõi giữ (thu-tu-chuong.js → ManHoc.chuong()). Tiến độ lưu theo m.ma, không theo m.id.
  function chuongCua(m) { return m.chuong; }
  function sttCua(m) { return m.so; }
  App.chuongCua = chuongCua; App.sttCua = sttCua;
  App.dsChuong = function () { return ManHoc.chuong(); };
  App.chiSoChuong = function (ma) {
    var ds = ManHoc.chuong();
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return i;
    return -1;
  };
  App.dsMan = function (ma) { return ManHoc.danhSach.filter(function (m) { return m.chuong === ma; }); };
  App.trum = function (ma) { return App.dsMan(ma).filter(function (m) { return m.hang === 'trum'; })[0] || null; };
  App.dsHang = function (ma, hang) { return App.dsMan(ma).filter(function (m) { return m.hang === hang; }); };

  /** Tên chương (cho lời nhắc): theo danh sách chương của lõi, rồi bảng tên của thu-tu-chuong.js. */
  App.tenChuong = function (ma) {
    var ds = App.dsChuong();
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i].ten;
    return (window.ThuTuChuong && ThuTuChuong.ten && ThuTuChuong.ten[ma]) || ma;
  };
  /** Chương thuộc ĐỢT 2 (bộ phận mới, mở cùng lúc khi thắng trùm của chương cổng)? Lõi chưa khai ThuTuChuong.dot2 thì không chương nào là đợt 2. */
  App.laDot2 = function (ma) {
    var d = window.ThuTuChuong && ThuTuChuong.dot2;
    return !!(d && d.indexOf(ma) >= 0);
  };
  App.congDot2 = function () { return (window.ThuTuChuong && ThuTuChuong.congDot2) || null; };

  /**
   * Mở khóa:
   *  - hàng "Làm quen" chơi lần lượt; xong cả hàng thì mở hàng "Luyện" và "Biến thể";
   *  - trùm mở khi qua đủ 9 màn; chương kế đợt 1 (theo thứ tự trong thu-tu-chuong.js) mở khi thắng trùm của chương ngay trước nó;
   *  - chương ĐỢT 2 (ThuTuChuong.dot2) mở CÙNG LÚC khi thắng trùm của chương cổng (ThuTuChuong.congDot2), không cần chương đợt 2 đứng trước.
   * Trả về { mo, lyDo } với lyDo: 'chuoi' (kèm chuoi = số chương trước) | 'dot2' (kèm cong = mã chương cổng) | 'can-ham' (đợt 2: kèm canChuong, ham — xem chuongCanTruoc) | 'hang1' | 'hang23' | 'trum'.
   */
  /**
   * Chương phải xong trước (đợt 2): các chương KHÁC nơi lần đầu chế (taoHam) một hàm mà màn trong chương này cần (hamCuaEmCan).
   * Đợt 2 mở cùng lúc, nhưng vd. omni cần forward() của tham-so, drone cần go() / walk() của nhện: chưa xong chương đó thì chưa mở.
   * Trả về [{ chuong, ham }] (mỗi chương một lần, kèm một tên hàm để nói lý do).
   */
  App.chuongCanTruoc = function (ma) {
    var noiTao = {};
    ManHoc.danhSach.forEach(function (x) { (x.taoHam || []).forEach(function (t) { if (!noiTao[t]) noiTao[t] = x.chuong; }); });
    var kq = [], da = {};
    App.dsMan(ma).forEach(function (x) {
      (x.hamCuaEmCan || []).forEach(function (t) {
        var c = noiTao[t];
        if (c && c !== ma && !da[c]) { da[c] = true; kq.push({ chuong: c, ham: t }); }
      });
    });
    return kq;
  };
  App.trangThai = function (m) {
    if (App.moHet) return { mo: true };
    var n = m.chuong, dsc = App.dsChuong(), vt = App.chiSoChuong(n);
    if (App.laDot2(n)) {
      var cong = App.congDot2(), trCong = cong && App.trum(cong);
      if (!trCong || !Luu.daQua(trCong.ma)) return { mo: false, lyDo: 'dot2', cong: cong };
      var can = App.chuongCanTruoc(n);
      for (var c = 0; c < can.length; c++) {
        var trc = App.trum(can[c].chuong);
        if (trc && !Luu.daQua(trc.ma)) return { mo: false, lyDo: 'can-ham', canChuong: can[c].chuong, ham: can[c].ham };
      }
    } else if (vt > 0) {
      var tr = App.trum(dsc[vt - 1].ma);
      if (tr && !Luu.daQua(tr.ma)) return { mo: false, lyDo: 'chuoi', chuoi: dsc[vt - 1].so };
    }
    var h1 = App.dsHang(n, 'lam-quen');
    if (m.hang === 'lam-quen') {
      var i = h1.indexOf(m);
      return i <= 0 || Luu.daQua(h1[i - 1].ma) ? { mo: true } : { mo: false, lyDo: 'hang1' };
    }
    var xongH1 = h1.every(function (x) { return Luu.daQua(x.ma); });
    if (m.hang === 'trum') {
      var chin = App.dsMan(n).filter(function (x) { return x.hang !== 'trum'; });
      return chin.every(function (x) { return Luu.daQua(x.ma); }) ? { mo: true } : { mo: false, lyDo: 'trum' };
    }
    return xongH1 ? { mo: true } : { mo: false, lyDo: 'hang23' };
  };
  /** Chương đã mở chưa (màn đầu chương mở)? Chương chưa có màn nào thì chưa mở. */
  App.chuongMo = function (ma) {
    var ds = App.dsMan(ma);
    if (!ds.length) return false;
    var dau = App.dsHang(ma, 'lam-quen')[0] || ds[0];
    return !!App.trangThai(dau).mo;
  };
  /**
   * Thắng trùm chương cổng LẦN ĐẦU: hiện bảng "Mở khóa bộ phận mới!" (bang-mo-khoa.js) một lần duy nhất (cờ 'mo-khoa-dot2' trong Luu), rồi gọi khiXong.
   * Không có gì để hiện (đã xem, chưa thắng trùm, lõi chưa khai đợt 2, chưa nạp bảng) thì gọi khiXong ngay. Trả về true nếu đã mở bảng.
   */
  App.moKhoaDot2 = function (khiXong) {
    var cong = App.congDot2(), tr = cong && App.trum(cong), ds = (window.ThuTuChuong && ThuTuChuong.dot2) || [];
    if (!tr || !Luu.daQua(tr.ma) || !ds.length || Luu.daXem('mo-khoa-dot2') || !window.MoKhoa) { if (khiXong) khiXong(); return false; }
    Luu.datDaXem('mo-khoa-dot2');
    MoKhoa.mo(function () { if (khiXong) khiXong(); });
    return true;
  };
  /** Màn kế tiếp đã mở (theo thứ tự trong danh sách; hết chương thì sang màn đầu chương kế), hoặc null. */
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
    if (ten === 'chon') { Chon.ve(); App.moKhoaDot2(); }          // an toàn: bảng mở khóa chưa kịp hiện (vd. mở lại game sau khi đã thắng trùm cổng) thì hiện ở màn chọn
  };
  /** Vào màn theo mã cố định (vd 'vong-lap.4'); nhận cả id hiển thị ('3.4') cho tiện thử. */
  App.vaoMan = function (ma) {
    var m = ManHoc.timMa(ma) || ManHoc.tim(ma); if (!m) return;
    App.man = m; App.chuong = m.chuong;
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
    // hàm theo cốt truyện (tên nằm trong taoHam của một màn nào đó): kho khóa tên, không cho đổi tên / xóa
    KhoHam.datTenCoDinh([].concat.apply([], ManHoc.danhSach.map(function (m) { return m.taoHam || []; })));
    var r = Luu.docKho();
    var kb = document.getElementById('sc-chon'), kc = document.getElementById('sc-choi');
    Chon.dung(kb);
    Choi.dung(kc);
    Ve.khungGo(kb.querySelector(".deco"));
    Ve.khungGo(kc.querySelector(".deco"));
    // chương mở ban đầu: chương của màn tiếp theo cần chơi
    var ds = ManHoc.danhSach, dau = null;
    for (var i = 0; i < ds.length; i++) { if (App.trangThai(ds[i]).mo && !Luu.daQua(ds[i].ma)) { dau = ds[i]; break; } }
    App.chuong = dau ? dau.chuong : App.dsChuong()[App.dsChuong().length - 1].ma;
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
