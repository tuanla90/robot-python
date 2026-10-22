/* ============================================================================
   ung-dung.js — "Đường học": KHỞI ĐỘNG, CO GIÃN KHUNG 360×640, ĐỊNH TUYẾN, MỞ KHÓA (window.App).
   Bốn màn hình (kiểu Cut the Rope, 15/10): 'dau' khởi đầu (man-dau.js) → 'goi' chọn gói (man-goi.js) → 'chon' lưới màn của gói (man-chon.js) → 'choi' màn chơi.
   Thêm màn 'lap' (17/10, chế độ lắp ráp, man-lap.js): màn có man.lapRap thì App.vaoMan mở màn Lắp robot TRƯỚC, "Lắp xong" mới vào 'choi' (Choi.vao(m, cachLap)); trong màn chơi App.lapLai quay về đó đổi part.
   Luật mở khóa (gói mở bằng tổng sao, chương / hàng / thử thách trong gói) ở game/mo-goi.js; App chỉ gọi qua.
   ========================================================================== */
(function () {
  'use strict';

  var App = {
    goi: null,           // mã gói đang xem (ThuTuChuong.goi, xem MoGoi.dsGoi())
    chuong: null,        // mã chương đang xem / vừa chơi (xem ManHoc.chuong())
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

  /** Hàm cốt truyện màn m cho SỬA (m.taoHam + hàm có trong hamCuaEmMoi của lời giải); xem ManHoc.hamSuaDuoc. Bảng Gỡ lỗi "Mở hết" không mở khóa cái này. */
  App.hamSuaDuoc = function (m) { return ManHoc.hamSuaDuoc(m); };
  /** Tên các hàm của em đang BỊ KHÓA ở màn m (hàm cốt truyện mà màn không cho sửa: mở ở Xưởng chỉ xem, khay có ổ khóa). Mặc định xét mọi hàm trong kho. */
  App.hamEmKhoa = function (m, ds) {
    var coTruyen = ManHoc.hamCotTruyen(), sua = ManHoc.hamSuaDuoc(m);
    return (ds || KhoHam.ds()).map(function (f) { return f.ten; }).filter(function (n) { return coTruyen.indexOf(n) >= 0 && sua.indexOf(n) < 0; });
  };

  /* ---------------------------------------------------------------- gói + mở khóa (game/mo-goi.js) */
  App.dsGoi = function () { return MoGoi.dsGoi(); };
  App.goiCua = function (maChuong) { return MoGoi.goiCua(maChuong); };
  App.goiTheoMa = function (ma) { return MoGoi.goiTheoMa(ma); };
  App.tongSao = function () { return MoGoi.tongSao(Luu); };
  App.saoGoi = function (g) { return MoGoi.saoGoi(g, Luu); };
  App.soQua = function (g) { return MoGoi.soQua(g, Luu); };
  App.goiMo = function (g) { return MoGoi.goiMo(g, Luu, App.moHet); };
  /** Hàm em chương ma cần mà chế ở chương khác: [{ chuong, ham }] (giữ dạng cũ cho chỗ khác gọi). */
  App.chuongCanTruoc = function (ma) { return MoGoi.canHam(ma).map(function (x) { return { chuong: x.man.chuong, ham: x.ham }; }); };
  /** { mo } hoặc { mo: false, lyDo: 'sao' | 'chuoi' | 'can-ham' | 'hang1' | 'hang23' | 'trum', … } — xem mo-goi.js. */
  App.trangThai = function (m) { return MoGoi.trangThai(m, Luu, App.moHet); };
  /** Màn nên chơi tiếp (màn mở đầu tiên chưa qua), hoặc null. */
  App.manTiepTheo = function () { return MoGoi.manTiepTheo(Luu, App.moHet); };
  /** Chương đã mở chưa (màn đầu chương mở)? Chương chưa có màn nào thì chưa mở. */
  App.chuongMo = function (ma) {
    var ds = App.dsMan(ma);
    if (!ds.length) return false;
    var dau = App.dsHang(ma, 'lam-quen')[0] || ds[0];
    return !!App.trangThai(dau).mo;
  };
  /**
   * Gói vừa đủ sao để mở (chưa báo lần nào: cờ 'goi-mo:<mã>' trong Luu): hiện bảng "Mở gói mới!" (bang-mo-khoa.js) rồi gọi khiXong.
   * Không có gì để báo thì gọi khiXong ngay. Trả về true nếu đã mở bảng. Gọi sau khi thắng một màn và khi về màn chọn gói / lưới màn.
   */
  App.baoGoiMoi = function (khiXong) {
    var moi = App.dsGoi().filter(function (g) { return !g.sapCo && g.saoCan > 0 && MoGoi.goiMo(g, Luu) && !Luu.daXem('goi-mo:' + g.ma); });
    if (!moi.length || !window.MoKhoa) { if (khiXong) khiXong(); return false; }
    moi.forEach(function (g) { Luu.datDaXem('goi-mo:' + g.ma); });
    MoKhoa.mo(moi, function () { if (App.manHinh === 'goi' && window.ChonGoi) ChonGoi.ve(moi[0].ma); if (khiXong) khiXong(); });
    return true;
  };
  App.moKhoaDot2 = App.baoGoiMoi;                                     // tên cũ (man-choi.js gọi sau khi thắng màn)
  /** Lần đầu chạy bản có gói: các gói đã mở sẵn (tiến độ cũ) coi như đã báo, khỏi bảng "Mở gói mới!" dài một lần. */
  function ghiGoiDaMo() {
    if (Luu.daXem('goi-khoi-tao')) return;
    App.dsGoi().forEach(function (g) { if (!g.sapCo && MoGoi.goiMo(g, Luu)) Luu.datDaXem('goi-mo:' + g.ma); });
    Luu.datDaXem('goi-khoi-tao');
  }
  /** Màn kế tiếp đã mở (theo thứ tự trong danh sách; hết chương thì sang màn đầu chương kế), hoặc null. */
  App.manTiep = function (m) {
    m = (m && m.manGoc) || m;                          // màn lắp ráp đang chơi là bản đã gắn robot: tìm theo màn gốc
    var ds = ManHoc.danhSach, i = ds.indexOf(m);
    if (i < 0 || i + 1 >= ds.length) return null;
    var k = ds[i + 1];
    return App.trangThai(k).mo ? k : null;
  };

  /* ---------------------------------------------------------------- màn hình */
  var MAN_HINH = { dau: 'sc-dau', goi: 'sc-goi', chon: 'sc-chon', choi: 'sc-choi', lap: 'sc-lap' };
  App.manHinh = null;
  /** Hiện một màn hình: 'dau' (khởi đầu) | 'goi' (chọn gói) | 'chon' (lưới màn của gói App.goi) | 'choi' | 'lap' (Lắp robot, màn lắp ráp). */
  App.hien = function (ten) {
    TP.Chan.giu(400);                                  // cú bấm đến muộn không rơi xuống màn mới
    Object.keys(MAN_HINH).forEach(function (k) { var e = document.getElementById(MAN_HINH[k]); if (e) e.classList.toggle('hidden', k !== ten); });
    App.manHinh = ten;
    if (window.Dau) Dau.chay(ten === 'dau');           // robot ở màn khởi đầu chỉ chạy hoạt hình khi đang thấy
    if (ten === 'dau') Dau.ve();
    else if (ten === 'goi') { ChonGoi.ve(); App.baoGoiMoi(); }
    else if (ten === 'chon') { Chon.ve(); App.baoGoiMoi(); }   // an toàn: bảng "Mở gói mới!" chưa kịp hiện (vd mở lại game) thì hiện ở đây
  };
  /** Vẽ lại màn hình đang thấy (sau khi bảng Gỡ lỗi đổi tiến độ / "Mở hết"). */
  App.veLai = function () {
    if (App.manHinh === 'dau') Dau.ve();
    else if (App.manHinh === 'goi') ChonGoi.ve();
    else if (App.manHinh === 'chon') Chon.ve();
  };
  /** Báo nhanh (dải vàng) trên màn hình đang thấy. */
  App.thongBao = function (chu) {
    var m = App.manHinh === 'dau' ? window.Dau : App.manHinh === 'goi' ? window.ChonGoi : window.Chon;
    if (m && m.thongBao) m.thongBao(chu);
  };
  /** Vào màn theo mã cố định (vd 'vong-lap.4'); nhận cả id hiển thị ('3.4') cho tiện thử. */
  App.vaoMan = function (ma) {
    var m = ManHoc.timMa(ma) || ManHoc.tim(ma); if (!m) return;
    if (App.moHet && window.GoLoi && GoLoi.napKhiMoHet) GoLoi.napKhiMoHet(m);   // "Mở hết" (gỡ lỗi): nhảy cóc vẫn có hàm cốt truyện các màn trước
    App.man = m; App.chuong = m.chuong;
    var g = App.goiCua(m.chuong); if (g) App.goi = g.ma;
    if (m.lapRap && window.LapRobot) {                 // màn lắp ráp (lap-rap.js): chọn part trước, "Lắp xong" mới vào màn chơi; ◀ về lưới màn
      App.hien('lap');
      LapRobot.vao(m, { cach: Luu.docLap(m.ma), khiVe: function () { App.veChon(); }, khiXong: function (cach) { App.hien('choi'); Choi.vao(m, cach); } });
      return;
    }
    App.hien('choi');
    Choi.vao(m);
  };
  /** Màn lắp ráp đang chơi: quay về màn Lắp robot để đổi part. "Lắp xong" → vào lại màn chơi với robot mới (chương trình đang viết được giữ, dòng gọi lệnh part đã tháo bị tô đỏ);
   *  ◀ → về màn chơi, không đổi gì. */
  App.lapLai = function () {
    var c = window.Choi && Choi.trangThai(), m = c && c.man;
    if (!m || !m.lapRap || !window.LapRobot) return;
    var goc = m.manGoc || m;
    TP.Hop.dong(); Choi.roi && Choi.roi();
    App.hien('lap');
    LapRobot.vao(goc, { cach: m.cachLapDaChon, khiVe: function () { App.hien('choi'); }, khiXong: function (cach) { App.hien('choi'); Choi.vao(goc, cach); } });
  };
  /** Mở lưới màn của gói ma (chương xem = chương đầu của gói, trừ khi chương đang xem nằm trong gói). */
  App.vaoGoi = function (ma) {
    var g = App.goiTheoMa(ma); if (!g || g.sapCo) return;
    App.goi = g.ma;
    if (g.chuong.indexOf(App.chuong) < 0) App.chuong = g.chuong[0];
    App.hien('chon');
  };
  /** Từ màn chơi về lưới màn của gói đang chơi. */
  App.veChon = function () {
    TP.Hop.dong();
    Choi.roi && Choi.roi();
    App.hien('chon');
  };
  App.veGoi = function () { App.hien('goi'); };
  App.veDau = function () { App.hien('dau'); };

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
    var kd = document.getElementById('sc-dau'), kg = document.getElementById('sc-goi'), kb = document.getElementById('sc-chon'), kc = document.getElementById('sc-choi'), kl = document.getElementById('sc-lap');
    Dau.dung(kd);
    ChonGoi.dung(kg);
    Chon.dung(kb);
    Choi.dung(kc);
    if (kl && window.LapRobot) LapRobot.dung(kl);
    [kd, kg, kb, kc, kl].forEach(function (k) { if (k) Ve.khungGo(k.querySelector('.deco')); });
    ghiGoiDaMo();
    // gói / chương mở ban đầu: của màn tiếp theo cần chơi
    var dau = App.manTiepTheo(), dsc = App.dsChuong();
    App.chuong = dau ? dau.chuong : dsc[dsc.length - 1].ma;
    App.goi = (App.goiCua(App.chuong) || App.dsGoi()[0]).ma;
    App.hien('dau');
    if (!r.ok) App.baoKho = r;
    vua();
    window.addEventListener('resize', vua);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', vua);
    document.body.classList.add('san-sang');
    chanNhanGiu();
    if (App.baoKho) App.thongBao(t('tb.khoDoc', { loi: App.baoKho.loi }));
    else if (Luu.laBoNho) App.thongBao(t('choi.loiLuu'));
    phongDuPhong();
    if (window.AmThanh) AmThanh.ganNut(document);
    if (window.MoDau && !Luu.daXem(MoDau.CO)) MoDau.mo(function () { if (window.GioiThieu) GioiThieu.mo(); });   // lần đầu chơi: phim mở đầu (mo-dau.js) rồi ba trang mẹo (gioi-thieu.js)
    dangKySW();
  }

  /** Chơi không cần mạng: đăng ký sw.js (chỉ khi trang có manifest, tức là chạy từ máy chủ; bản gói Artifact không có). */
  function dangKySW() {
    if (!('serviceWorker' in navigator) || !document.querySelector('link[rel="manifest"]') || !/^https?:$/.test(location.protocol)) return;
    var dk = function () { navigator.serviceWorker.register('sw.js').catch(function () { /* không đăng ký được thì chơi có mạng như cũ */ }); };
    if (document.readyState === 'complete') dk(); else window.addEventListener('load', dk);
  }

  /** Nhấn giữ trên điện thoại / chuột phải: không hiện menu của trình duyệt, không bôi đen chữ, không kéo ảnh ra ngoài (trừ ô gõ chữ). */
  function chanNhanGiu() {
    function oGo(ev) { return ev.target && ev.target.closest && ev.target.closest('input, textarea'); }
    ['contextmenu', 'selectstart', 'dragstart'].forEach(function (su) {
      document.addEventListener(su, function (ev) { if (!oGo(ev)) ev.preventDefault(); });
    });
  }

  /** Không tải được phông (font/font.css; bản Artifact vẫn lấy từ Google): đánh dấu body.fb để CSS thu nhỏ chữ cho vừa khung. */
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
