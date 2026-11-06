/* ============================================================================
   man-co-so.js — diem10code-python: SỔ MÀN / SỔ CHƯƠNG dùng chung (window.ManHoc).

   Tách ra từ man-chuoi-1.js của bản gốc (doi-robot-chan-hung): đây là CƠ CHẾ
   (khung đăng ký màn, tính id hiển thị, kho hàm cốt truyện…), KHÔNG kèm màn nào.
   Mỗi tệp man-*.js của dự án này tự định nghĩa màn và gọi ManHoc.them(...).

   Nạp tệp này SAU thu-tu-chuong.js, TRƯỚC mọi tệp man-demo-*.js.
   Chạy được trong Node (module.exports) và trình duyệt (window.ManHoc).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ThuTu = laNode ? require('./thu-tu-chuong.js') : window.ThuTuChuong;

  /** Điền các trường mặc định (hàm của màn rỗng, hàm của em rỗng…) cho dữ liệu viết gọn. */
  function chuanHoaMan(m) {
    if (m.lapRap || m.chonDoi) { var LR = laNode ? require('./lap-rap.js') : window.LapRap; if (LR) LR.macDinh(m); }
    if (!m.cauTruc) m.cauTruc = [];
    m.khung = Object.assign({}, m.khung, { cauTruc: m.cauTruc.slice() });
    function bai(b) { if (!b.hamCuaMan) b.hamCuaMan = []; return b; }
    bai(m.maMau);
    bai(m.loiGiai);
    if (!m.loiGiai.hamCuaEmMoi) m.loiGiai.hamCuaEmMoi = [];
    if (m.loiGiaiKhac) {
      bai(m.loiGiaiKhac.baiLam);
      if (!m.loiGiaiKhac.hamCuaEmMoi) m.loiGiaiKhac.hamCuaEmMoi = [];
    }
    (m.loiSai || []).forEach(function (ls) {
      bai(ls.baiLam);
      if (!ls.hamCuaEmMoi) ls.hamCuaEmMoi = [];
    });
    if (!m.loiSai) m.loiSai = [];
    if (!m.goiY) m.goiY = [];
    if (!m.hamCuaEmCan) m.hamCuaEmCan = [];
    if (!m.taoHam) m.taoHam = [];
    return m;
  }

  var ManHoc = (typeof window !== 'undefined' && window.ManHoc) || { danhSach: [] };
  ManHoc.danhSach = ManHoc.danhSach || [];

  /** Tính lại id hiển thị và xếp lại danhSach (tại chỗ) theo thứ tự chương rồi theo `so`. */
  ManHoc.tinhLai = function () {
    var tt = ThuTu.thuTu;
    ManHoc.danhSach.forEach(function (m) {
      if (tt.indexOf(m.chuong) < 0) throw new Error('Màn "' + m.ma + '": chương "' + m.chuong + '" không có trong thu-tu-chuong.js.');
    });
    ManHoc.danhSach.sort(function (a, b) { return (tt.indexOf(a.chuong) - tt.indexOf(b.chuong)) || (a.so - b.so); });
    ManHoc.danhSach.forEach(function (m) { m.id = (tt.indexOf(m.chuong) + 1) + '.' + m.so; });
    return ManHoc.danhSach;
  };
  ManHoc.them = function (ds) {
    ds.forEach(function (m) {
      if (typeof m.chuong !== 'string' || !m.chuong) throw new Error('Màn thiếu `chuong`.');
      if (!(m.so >= 1) || m.so !== Math.floor(m.so)) throw new Error('Màn của chương "' + m.chuong + '" thiếu `so` (số nguyên từ 1).');
      if (ThuTu.thuTu.indexOf(m.chuong) < 0) throw new Error('Chương "' + m.chuong + '" không có trong thu-tu-chuong.js.');
      m.ma = m.chuong + '.' + m.so;
      if (ManHoc.timMa(m.ma)) throw new Error('Trùng mã màn: ' + m.ma);
      ManHoc.danhSach.push(m);
    });
    ManHoc.tinhLai();
  };
  /** Tìm theo id hiển thị ("3.4"). Id đổi khi đổi thứ tự chương. */
  ManHoc.tim = function (id) { return ManHoc.danhSach.filter(function (m) { return m.id === id; })[0] || null; };
  /** Tìm theo mã cố định ("vong-lap.4"). */
  ManHoc.timMa = function (ma) { return ManHoc.danhSach.filter(function (m) { return m.ma === ma; })[0] || null; };
  /** Các chương CÓ MÀN, theo thứ tự: [{ ma, ten, so (số chương hiển thị, từ 1), soMan }]. */
  ManHoc.chuong = function () {
    var kq = [];
    ThuTu.thuTu.forEach(function (ma, i) {
      var n = ManHoc.danhSach.filter(function (m) { return m.chuong === ma; }).length;
      if (n) kq.push({ ma: ma, ten: ThuTu.ten[ma] || ma, so: i + 1, soMan: n });
    });
    return kq;
  };
  ManHoc.chuanHoa = chuanHoaMan;

  /** KHUÔN 8 HÀNG (hoc/KE-HOACH-4-MUA-COT-LOI.md): mọi cột của mọi mùa dùng cùng 8 dạng bài, theo đúng thứ tự này (màn số `so` = hàng `so`). */
  ManHoc.DANG_BAI = ['chi-xem', 'du-doan', 'dien', 'sap-xep', 'sua-loi', 'viet', 'viet-ham', 'tu-luc'];
  /** Điền phần riêng của dạng bài cho màn ở hàng `so` (1..8). Các hàng 1–7 mở lần lượt; hàng 8 là thử thách của cột (`trum`, mở khi qua đủ 7 hàng trên).
   *  Cờ riêng: chiChay (hàng 1, 2: chạy đúng code mẫu), chiSapXep (hàng 4: chỉ kéo đổi chỗ dòng), canHamTuDat (hàng 7: phải gọi hàm của em, tên tự đặt),
   *  hamTuDat (hàng 7, 8: tên hàm trong lời giải chỉ là ví dụ, không đưa vào kho tham chiếu). Hàng 6–8 mặc định màn trống. */
  ManHoc.khuon = function (so, m) {
    m.so = so;
    m.dangBai = ManHoc.DANG_BAI[so - 1];
    m.hang = so === 8 ? 'trum' : 'lam-quen';
    var lg = m.loiGiai, hamMan = lg.hamCuaMan || [];
    function banSao(ds) { return ds.map(function (f) { return { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: f.than.slice() }; }); }
    if (so <= 2) {
      m.chiChay = true;
      m.maMau = { chinh: lg.chinh.slice(), hamCuaMan: banSao(hamMan) };
    }
    if (so === 4) m.chiSapXep = true;
    if (so <= 2 || so === 4) {
      m.moXuong = false;
      m.khoaHamMan = hamMan.map(function (f) { return f.ten; });
    }
    if (so >= 6 && !m.maMau) m.maMau = { chinh: [], hamCuaMan: banSao(hamMan) };
    if (so >= 3 && m.maMau && !m.maMau.hamCuaMan) m.maMau.hamCuaMan = banSao(hamMan);
    if (so === 7 && !m.canHamTuDat) m.canHamTuDat = 1;
    if (so >= 7) { m.moXuong = true; m.hamTuDat = true; }
    if (so === 8) m.goiY = [];
    return m;
  };

  /** Hàm tự đặt chỉ DEMO một ý tưởng ở đúng màn tạo ra nó (xem bản gốc man-chuoi-1.js):
   *  dự án này đang bắt đầu lại nên danh sách rỗng, điền dần khi viết màn mới. */
  var HAM_DEMO_MOT_LAN = [];
  ManHoc.hamDemoMotLan = function () { return HAM_DEMO_MOT_LAN.slice(); };

  /** Tên mọi hàm cốt truyện: gộp `taoHam` của mọi màn (theo thứ tự màn), trừ hamDemoMotLan. */
  ManHoc.hamCotTruyen = function () {
    var kq = [];
    ManHoc.danhSach.forEach(function (m) { (m.taoHam || []).forEach(function (n) { if (kq.indexOf(n) < 0 && HAM_DEMO_MOT_LAN.indexOf(n) < 0) kq.push(n); }); });
    return kq;
  };
  /** Tên các hàm cốt truyện màn `m` cho SỬA: `m.taoHam` và mọi hàm có trong `hamCuaEmMoi` của lời giải. */
  ManHoc.hamSuaDuoc = function (m) {
    var kq = [];
    function them(n) { if (typeof n === 'string' && kq.indexOf(n) < 0) kq.push(n); }
    function tuDs(ds) { (Array.isArray(ds) ? ds : []).forEach(function (f) { if (f) them(f.ten); }); }
    function tuCt(c) { (Array.isArray(c) ? c : [c]).forEach(function (x) { if (x) tuDs(x.hamCuaEmMoi); }); }
    if (!m) return kq;
    (m.taoHam || []).forEach(them);
    tuCt(m.loiGiai); tuCt(m.loiGiaiKhac); tuCt(m.congThucKhac);
    return kq;
  };
  /** KHO THAM CHIẾU lúc tới màn m: [{ ten, thamSo, than }] như người chơi đã qua MỌI màn đứng trước m. */
  ManHoc.khoThamChieu = function (m) {
    var ds = [], chi = {}, tao = (m && m.taoHam) || [], ma = m && (m.manGoc || m).ma;
    for (var i = 0; i < ManHoc.danhSach.length; i++) {
      var x = ManHoc.danhSach[i];
      if (x.ma === ma) break;
      if (x.hamTuDat) continue;                                  // hàm tên tự đặt: bản trong lời giải chỉ là ví dụ, người chơi không có hàm mang tên đó
      ((x.loiGiai && x.loiGiai.hamCuaEmMoi) || []).forEach(function (f) {
        var h = { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: (f.than || []).slice() }, k = chi[f.ten];
        if (k === undefined) { chi[f.ten] = ds.length; ds.push(h); }
        else if (x.tietKiemNhip !== true) ds[k] = h;
      });
    }
    return ds.filter(function (f) { return tao.indexOf(f.ten) < 0; });
  };
  /** Hàm của em tên `ten` có bị KHÓA ở màn `m` (chỉ xem) không. */
  ManHoc.hamEmKhoa = function (m, ten) {
    return ManHoc.hamCotTruyen().indexOf(ten) >= 0 && ManHoc.hamSuaDuoc(m).indexOf(ten) < 0;
  };

  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
