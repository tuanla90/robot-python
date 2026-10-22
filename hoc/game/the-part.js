/* ============================================================================
   the-part.js — "Đường học": HỘP GIỚI THIỆU BỘ PHẬN (window.ThePart). Dữ liệu ở hoc/gioi-thieu-part.js (window.GioiThieuPart).

   ThePart.choMan(m, khiXong)   vào màn m: bộ phận nào của robot người chơi chưa gặp thì hiện thẻ đầy đủ; đã gặp mà màn mở thêm lệnh của nó thì hiện thẻ
                                "lệnh mới" (chỉ phần mới). Nhiều thẻ thì lần lượt (Tiếp 1/2…). Không có thẻ nào thì gọi khiXong ngay. Đóng thẻ cuối → khiXong.
                                Cờ đã xem ở Luu: 'part:<mã>' (đã gặp bộ phận), 'part-lenh:<mã>:<lệnh>' (đã giới thiệu lệnh đó).
   ThePart.mo(ma, khiDong)      mở thẻ đầy đủ của một bộ phận với mọi lệnh đã giới thiệu (Sổ lệnh, trang "Bộ phận").
   ThePart.daGap()              [mã] các bộ phận người chơi đã gặp, theo GioiThieuPart.THU_TU.
   ThePart.hinh(ma, tiLe)       canvas hình bộ phận gắn trên thân mẫu (thân: chính nó; tay, cảm biến: trên xe hai bánh; camera bụng: trên drone).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  function G() { return window.GioiThieuPart; }
  function moTaGoc() {
    var kq = {};
    ((window.SoLenh && SoLenh.lenhGoc) || []).forEach(function (l) { kq[l.ten] = l.moTa; });
    return kq;
  }
  function coLuu() { return !!(window.Luu && Luu.daXem && Luu.datDaXem); }
  function daXem(k) { return coLuu() && Luu.daXem(k); }
  function datXem(k) { if (coLuu()) Luu.datDaXem(k); }

  /** Cấu hình robot mẫu để vẽ một bộ phận. */
  function cauHinhMau(ma) {
    var d = G().DS[ma]; if (!d) return null;
    if (d.khe === 'than') return { than: ma, tay: null, camBien: [] };
    if (d.khe === 'tay') return { than: 'hai-banh', tay: ma, camBien: [] };
    if (ma === 'camera-bay') return { than: 'drone', tay: null, camBien: [{ ma: 'camera-bay', o: 'bung' }] };
    if (ma === 'camera') return { than: 'hai-banh', tay: null, camBien: [{ ma: 'camera', o: 'tren' }] };
    return { than: 'hai-banh', tay: null, camBien: [{ ma: ma === 'tu' ? 'khoang-cach' : ma, o: 'hong' }] };
  }
  /** Cắt bỏ lề trong suốt quanh hình (ảnh part có lề rộng để tâm thân nằm giữa). */
  function catLe(cv) {
    try {
      var g = cv.getContext('2d'), w = cv.width, hh = cv.height, d = g.getImageData(0, 0, w, hh).data;
      var x0 = w, y0 = hh, x1 = -1, y1 = -1;
      for (var y = 0; y < hh; y++) for (var x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) return cv;
      var c = document.createElement('canvas'); c.width = x1 - x0 + 1; c.height = y1 - y0 + 1;
      var g2 = c.getContext('2d'); g2.imageSmoothingEnabled = false; g2.drawImage(cv, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
      c.laPart = cv.laPart;
      return c;
    } catch (e) { return cv; }
  }
  function hinh(ma, tiLe) {
    var cfg = cauHinhMau(ma), cv = null;
    try { cv = VeRobot.ve(cfg, { tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }, 0, tiLe || 2); } catch (e) { cv = null; }
    if (!cv) return h('div', 'tp-hinh-trong');
    var c = Ve.mk(catLe(cv), cv.laPart ? 1 : 3); c.classList.add('tp-hinh-cv');
    return c;
  }
  /** Câu chữ có tên lệnh: phần `ten()`, True / False, "chuỗi" vẽ bằng phông code (phông Handjet vẽ "()" như "[]"). */
  var RE_CODE = /([A-Za-z_…]+\((?:n|path|d)?\)|\bTrue\b|\bFalse\b|"[a-zA-Z]+")/;
  function chuCode(lop, s) {
    var el = h('span', lop);
    String(s).split(RE_CODE).forEach(function (p, i) {
      if (!p) return;
      el.appendChild(i % 2 ? h('span', 'tp-code nho', p) : document.createTextNode(p));
    });
    return el;
  }

  /** Các lệnh của bộ phận ma đã được giới thiệu (cho Sổ lệnh). */
  function lenhDaXem(ma) { return G().DS[ma].lenh.filter(function (l) { return daXem('part-lenh:' + ma + ':' + l); }); }
  function daGap() { return G().THU_TU.filter(function (ma) { return daXem('part:' + ma); }); }

  function code(ten) { return h('span', 'tp-code', ten + '()'); }
  function muc(the, tieuDe, ds, lop) {
    if (!ds.length) return;
    var k = h('div', 'tp-muc ' + (lop || ''));
    k.appendChild(h('div', 'tp-muc-td', tieuDe));
    ds.forEach(function (x) { k.appendChild(x); });
    the.appendChild(k);
  }
  function dongChu(chu, dau) {
    var d = h('div', 'tp-dong');
    if (dau) d.appendChild(h('span', 'tp-dau', dau));
    d.appendChild(chuCode('tp-chu', chu));
    return d;
  }

  /** Dựng nội dung thẻ (nd = GioiThieuPart.noiDung(...)) vào phần tử than. */
  function dungThe(than, nd) {
    var dau = h('div', 'tp-dau-the');
    var khung = h('div', 'tp-hinh'); khung.appendChild(hinh(nd.ma, 3)); dau.appendChild(khung);
    var ben = h('div', 'tp-ben');
    ben.appendChild(h('div', 'tp-khe', nd.tenKhe));
    ben.appendChild(h('div', 'tp-ten', nd.ten));
    dau.appendChild(ben);
    than.appendChild(dau);
    var cuon = h('div', 'tp-cuon');
    if (nd.moTa) { var mt = chuCode('tp-mota', nd.moTa); mt.style.display = 'block'; cuon.appendChild(mt); }
    muc(cuon, t(nd.laMoi ? 'part.lenhMoi' : 'part.lenh'), nd.lenh.map(function (l) {
      var d = h('div', 'tp-lenh'); d.setAttribute('data-lenh', l.ten);
      d.appendChild(code(l.ten)); d.appendChild(chuCode('tp-chu', l.moTa));
      return d;
    }), 'lenh');
    muc(cuon, t('part.ghep'), nd.ghep.map(function (g) {
      var d = h('div', 'tp-ghep');
      var c = h('div', 'tp-ghep-code'); g.lenh.forEach(function (l) { c.appendChild(code(l)); }); d.appendChild(c);
      d.appendChild(chuCode('tp-ghep-ra', '→ ' + g.ra));
      return d;
    }), 'ghep');
    muc(cuon, t('part.gioi'), nd.gioi.map(function (x) { return dongChu(x, '✓'); }), 'gioi');
    muc(cuon, t('part.khong'), nd.khong.map(function (x) { return dongChu(x, '✗'); }), 'khong');
    muc(cuon, t('part.luuY'), nd.luuY.map(function (x) { return dongChu(x, '•'); }), 'luu');
    than.appendChild(cuon);
    if (window.ThanhCuon) ThanhCuon.gan(cuon);
  }

  /** Mở một hộp thẻ. nut: chữ của nút; xong: bấm nút. */
  function moHop(nd, nut, xong, tieuDe) {
    var hop = TP.Hop.mo(tieuDe || t(nd.laMoi ? 'part.tieuDeMoi' : 'part.tieuDe'), 'hop-part');
    hop.hop.setAttribute('data-hop', 'the-part'); hop.hop.setAttribute('data-part', nd.ma);
    dungThe(hop.than, nd);
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-gr', nut, function () { TP.Hop.dong(); if (xong) xong(); }, 'part-xong'));
    hop.than.appendChild(hang);
    return hop;
  }

  /** Các thẻ cần hiện khi vào màn m (đã đánh dấu đã xem). */
  function theCuaMan(m) {
    if (!G() || !window.VeRobot) return [];
    var cfg = VeRobot.cauHinhCua(m), goc = m.hamGoc || [], mt = moTaGoc(), kq = [];
    G().boPhanCua(cfg, goc).forEach(function (b) {
      var moi = !daXem('part:' + b.ma), lenhMoi = b.lenh.filter(function (l) { return !daXem('part-lenh:' + b.ma + ':' + l); });
      if (!moi && !lenhMoi.length) return;
      var nd = G().noiDung(b.ma, b.lenh, moi ? null : lenhMoi, cfg.than, mt);
      if (!nd || (!moi && !nd.lenh.length)) return;
      kq.push(nd);
    });
    return kq;
  }
  function danhDau(m) {
    var cfg = VeRobot.cauHinhCua(m);
    G().boPhanCua(cfg, m.hamGoc || []).forEach(function (b) {
      datXem('part:' + b.ma);
      b.lenh.forEach(function (l) { datXem('part-lenh:' + b.ma + ':' + l); });
    });
  }

  function choMan(m, khiXong) {
    var ds = [];
    try { ds = theCuaMan(m); danhDau(m); } catch (e) { ds = []; }
    var i = 0;
    function tiep() {
      if (i >= ds.length) { if (khiXong) khiXong(); return; }
      var nd = ds[i++];
      moHop(nd, i < ds.length ? t('part.tiep', { i: i, n: ds.length }) : t('part.hieu'), tiep);
    }
    tiep();
    return ds.length;
  }

  function mo(ma, khiDong) {
    if (!G() || !G().DS[ma]) return;
    var than = ma === 'nam-cham' && daXem('part:drone') ? 'drone' : null;           // dòng "nam châm treo dưới drone" chỉ hiện khi đã gặp drone
    var nd = G().noiDung(ma, lenhDaXem(ma), null, than, moTaGoc());
    moHop(nd, t('chung.dong'), khiDong, t('part.tieuDeSo'));
  }

  window.ThePart = { choMan: choMan, mo: mo, daGap: daGap, hinh: hinh, theCuaMan: theCuaMan };
})();
