/* ============================================================================
   cai-dat.js — "Đường học": BẢNG CÀI ĐẶT (window.CaiDat).
   Mở từ nút bánh răng ở màn khởi đầu (man-dau.js) và từ menu ☰ trong màn chơi (man-choi.js).
     · Hiệu ứng / Nhạc nền: mức 0..4 (0 = tắt), bấm − / +; đổi là nghe ngay (AmThanh.dat), lưu ở Luu.
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
    var ic = h('span'); ic.setAttribute('data-i', icon); ic.setAttribute('data-s', '2'); ic.setAttribute('data-f', '#ffd95a'); ic.setAttribute('data-l', '#1b120a');
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

  /** Mở bảng cài đặt; đóng thì gọi khiDong (nếu có). */
  function mo(khiDong) {
    var hop = TP.Hop.mo(t('caiDat.tieuDe'), 'hop-cai-dat');
    hop.hop.setAttribute('data-hop', 'cai-dat');
    if (window.AmThanh) {
      hop.than.appendChild(hangAm('hieuUng', 'loa', t('caiDat.hieuUng')));
      hop.than.appendChild(hangAm('nhac', 'nhac', t('caiDat.nhac')));
    }
    var cot = h('div', 'cd-cot');
    if (window.MoDau) cot.appendChild(TP.Hop.nut('g-cy', t('caiDat.gioiThieu'), function () { TP.Hop.dong(); MoDau.mo(function () { if (window.GioiThieu) GioiThieu.mo(function () { mo(khiDong); }); else mo(khiDong); }); }, 'cd-mo-dau'));
    cot.appendChild(TP.Hop.nut('g-wd', t('caiDat.thongTin'), function () { thongTin(khiDong); }, 'cd-thong-tin'));
    cot.appendChild(TP.Hop.nut('g-rd', t('caiDat.xoa'), function () { xoa(khiDong); }, 'cd-xoa'));
    cot.appendChild(TP.Hop.nut('g-gr', t('chung.dong'), function () { TP.Hop.dong(); if (khiDong) khiDong(); }, 'cd-dong'));
    hop.than.appendChild(cot);
    hop.than.appendChild(h('div', 'cd-ban', t('caiDat.phienBan', { v: PHIEN_BAN })));
    Ve.hydrate(hop.than);
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
