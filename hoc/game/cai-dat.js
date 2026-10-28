var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   cai-dat.js — "Robot Chấn Hưng": BẢNG CÀI ĐẶT (window.CaiDat).
   Mở từ nút bánh răng ở màn khởi đầu (man-dau.js) và từ menu ☰ trong màn chơi (man-choi.js).
     · Hiệu ứng / Nhạc nền: mức 0..4 (0 = tắt), bấm − / +; đổi là nghe ngay (AmThanh.dat), lưu ở Luu.
     · Biểu cảm mắt: bật / tắt mắt LED chuyển động. (Hàng "Kiểu vẽ" V5a và "Màu sơn R1" đã bỏ ở V7c1: game luôn vector, R1 màu đội.)
     · Xem lại phim mở đầu (mo-dau.js) · Thông tin game (phiên bản, quyền riêng tư, giấy phép chữ)
     · Xóa tiến độ: hỏi lại, xóa sạch dữ liệu chơi (Luu.xoaHet, giữ cài đặt) rồi tải lại trang.
   ========================================================================== */
(function () {
  'use strict';

  var PHIEN_BAN = '0.9.0';
  var h = TP.h;

  /** Một hàng âm lượng: icon + tên · − · vạch mức · +. */
  function hangAm(khoa, icon, chu) {
    var d = h('div', 'cd-dong'); d.setAttribute('data-cd', khoa);
    var ten = h('div', 'cd-ten');
    var ic = h('span'); ic.setAttribute('data-i', icon); ic.setAttribute('data-s', '2'); ic.setAttribute('data-f', BM.vang); ic.setAttribute('data-l', BM.vienDam);
    ten.appendChild(ic); ten.appendChild(h('span', null, chu));
    var bot = h('button', 'bt g-wd cd-nut', '−'); bot.setAttribute('data-nut', khoa + '-bot');
    var vach = h('div', 'cd-vach');
    for (var i = 0; i < AmThanh.MUC; i++) vach.appendChild(h('i'));
    var muc = h('div', 'cd-muc');
    var them = h('button', 'bt g-gr cd-nut', '+'); them.setAttribute('data-nut', khoa + '-them');
    function ve() {
      var n = AmThanh.caiDat()[khoa];
      Array.prototype.forEach.call(vach.children, function (v, i) { v.classList.toggle('on', i < n); });
      muc.textContent = n === 0 ? t('caiDat.tat') : String(n);
      d.classList.toggle('tat', n === 0);
      bot.disabled = n === 0; them.disabled = n === AmThanh.MUC;
    }
    function doi(buoc) {
      var c = {}; c[khoa] = AmThanh.caiDat()[khoa] + buoc;
      AmThanh.dat(c); ve();
      if (khoa === 'hieuUng') AmThanh.phat('kep');     // nghe thử mức mới
    }
    bot.addEventListener('click', function () { doi(-1); });
    them.addEventListener('click', function () { doi(1); });
    [ten, bot, vach, muc, them].forEach(function (e) { d.appendChild(e); });
    ve();
    return d;
  }

  /* V7c1 (28/10): hàng 'Màu sơn R1' (sơn mở khoá theo sao, bảng sơn của part/ pixel) đã bỏ: R1 cố định màu đội (vecDoiR1). */

  /** Hàng bật / tắt Biểu cảm mắt (mắt LED chuyển động trên kính robot; có thể tắt bất cứ lúc nào). */
  function hangMat() {
    var d = h('div', 'cd-dong'); d.setAttribute('data-cd', 'mat');
    var ten = h('div', 'cd-ten');
    var ic = h('span'); ic.setAttribute('data-i', 'denCam'); ic.setAttribute('data-s', '2'); ic.setAttribute('data-f', BM.xanhLoSang2); ic.setAttribute('data-l', BM.vienDam);
    ten.appendChild(ic); ten.appendChild(h('span', null, t('caiDat.mat')));
    var sw = h('button', 'bt cd-sw'); sw.setAttribute('data-nut', 'cd-mat');
    function dangBat() {
      if (window.SanVe && SanVe.coMatDong) return SanVe.coMatDong();
      return !(window.Luu && Luu.docCaiDat && Luu.docCaiDat().mat === false);
    }
    function ve() {
      var on = dangBat();
      sw.className = 'bt cd-sw ' + (on ? 'g-gr bat' : 'g-wd');
      sw.textContent = t(on ? 'caiDat.bat' : 'caiDat.tat');
      sw.setAttribute('aria-pressed', on ? 'true' : 'false');
      d.classList.toggle('tat', !on);
    }
    sw.addEventListener('click', function () {
      var moi = !dangBat();
      if (window.SanVe) SanVe.dungMat = true;
      if (window.Luu && Luu.ghiCaiDat) Luu.ghiCaiDat({ mat: moi });
      if (window.AmThanh) AmThanh.phat('lat');
      ve();
      if (window.App && App.veLai) App.veLai();
    });
    d.appendChild(ten); d.appendChild(sw);
    ve();
    return d;
  }

  /* V7c1 (28/10): hàng "Kiểu vẽ" (Nét mới / Điểm ảnh, gói V5a) đã bỏ: game luôn vector. */

  /** Mở bảng cài đặt; đóng thì gọi khiDong (nếu có). */
  function mo(khiDong) {
    var hop = TP.Hop.mo(t('caiDat.tieuDe'), 'hop-cai-dat');
    hop.hop.setAttribute('data-hop', 'cai-dat');
    if (window.AmThanh) {
      hop.than.appendChild(hangAm('hieuUng', 'loa', t('caiDat.hieuUng')));
      hop.than.appendChild(hangAm('nhac', 'nhac', t('caiDat.nhac')));
    }
    hop.than.appendChild(hangMat());
    var cot = h('div', 'cd-cot');
    if (window.MoDau) cot.appendChild(TP.Hop.nut('g-cy', t('caiDat.gioiThieu'), function () { TP.Hop.dong(); MoDau.mo(function () { if (window.GioiThieu) GioiThieu.mo(function () { mo(khiDong); }); else mo(khiDong); }); }, 'cd-mo-dau'));
    if (window.PhimGoi && window.App && App.dsGoi) cot.appendChild(TP.Hop.nut('g-cy', t('caiDat.phimGoi'), function () { phimGoi(khiDong); }, 'cd-phim-goi'));
    cot.appendChild(TP.Hop.nut('g-wd', t('caiDat.thongTin'), function () { thongTin(khiDong); }, 'cd-thong-tin'));
    cot.appendChild(TP.Hop.nut('g-rd', t('caiDat.xoa'), function () { xoa(khiDong); }, 'cd-xoa'));
    cot.appendChild(TP.Hop.nut('g-gr', t('chung.dong'), function () { TP.Hop.dong(); if (khiDong) khiDong(); }, 'cd-dong'));
    hop.than.appendChild(cot);
    hop.than.appendChild(h('div', 'cd-ban', t('caiDat.phienBan', { v: PHIEN_BAN })));
    Ve.hydrate(hop.than);
  }

  /** "Xem lại phim các gói": danh sách gói đã mở có phim (phim-goi.js); xem xong một phim thì về lại danh sách. */
  function phimGoi(khiDong) {
    var m = TP.Hop.mo(t('caiDat.phimGoi'), 'hop-nho');
    m.hop.setAttribute('data-hop', 'phim-goi-ds');
    var ds = h('div', 'cd-phim');
    var goi = App.dsGoi().filter(function (g) { return !g.sapCo && App.goiMo(g) && PhimGoi.co(g.ma); });
    if (!goi.length) ds.appendChild(h('div', 'cd-phim-rong', t('caiDat.phimGoiRong')));
    goi.forEach(function (g) {
      ds.appendChild(TP.Hop.nut('g-wd', g.ten, function () {
        TP.Hop.dong();
        PhimGoi.mo(g.ma, function () { phimGoi(khiDong); }, { nutCuoi: 'pg.xong' });
      }, 'cd-phim-' + g.ma));
    });
    m.than.appendChild(ds);
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-gr', t('chung.dong'), function () { mo(khiDong); }, 'dong'));
    m.than.appendChild(hang);
  }

  function thongTin(khiDong) {
    var m = TP.Hop.mo(t('caiDat.thongTin'), 'hop-nho');
    m.than.appendChild(TP.vanBan(h('div', 'hop-chu'), t('caiDat.thongTinChu')));
    m.than.appendChild(h('div', 'cd-ban', t('caiDat.phienBan', { v: PHIEN_BAN })));
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-gr', t('chung.dong'), function () { mo(khiDong); }, 'dong'));
    m.than.appendChild(hang);
  }

  function xoa(khiDong) {
    TP.Hop.xacNhan({ tieuDe: t('caiDat.xoa'), noiDung: t('caiDat.xoaHoi'), canhBao: t('caiDat.xoaCanh'), co: t('caiDat.xoaCo') }).then(function (ok) {
      if (!ok) { mo(khiDong); return; }
      Luu.xoaHet();
      location.reload();
    });
  }

  window.CaiDat = { mo: mo, PHIEN_BAN: PHIEN_BAN };
})();
