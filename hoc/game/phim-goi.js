/* ============================================================================
   phim-goi.js — "Robot Chấn Hưng": PHIM NGẮN MỞ MỖI GÓI (window.PhimGoi). Kế hoạch: hoc/KE-HOACH-PHIM-GOI.md.
   Bộ máy chiếu DÙNG CHUNG cho mọi mùa: phim là dữ liệu (một mảng hàm vẽ khung cho mỗi mã gói) ở game/phim-mua-1.js, phim-mua-2.js…,
   mỗi tệp gọi PhimGoi.them({ '<mã gói>': [khung1, khung2, …] }). Mỗi hàm khung nhận (k, c): k = khung tranh 320×220 (rỗng),
   c = bộ dựng hình bên dưới (c.xe, c.ico, c.o, c.san, c.code, c.sau, c.keu…).
   Chép phong cách và lớp CSS của phim mở đầu (mo-dau.js, khối .md-* trong choi.css); mo-dau.js KHÔNG đổi, phim mở đầu chạy y như cũ.

   Chiếu:  PhimGoi.mo(maGoi, khiXong, tuyChon)  — gói có phim thì chiếu từ khung 1, xong (nút cuối / Bỏ qua) thì ghi cờ 'phim-goi:<mã gói>'
           (Luu.datDaXem), gỡ lớp phim rồi gọi khiXong; gói không có phim thì gọi khiXong ngay.
           tuyChon.nutCuoi = khóa chữ của nút ở khung cuối (mặc định 'pg.vaoGoi' = "Vào gói"; Cài đặt dùng 'pg.xong').
   Hỏi:    PhimGoi.co(maGoi) (gói có phim?), PhimGoi.daXem(maGoi), PhimGoi.CO(maGoi) (tên cờ), PhimGoi.soKhung(maGoi).
   Chữ:    lời khung n của gói g ở chu.js khóa 'pg.<g>.<n>'; nút: 'pg.boQua', 'pg.tiep', 'pg.vaoGoi', 'pg.xong'.
   Máy kiểm: hoc/kiem-phim-goi.mjs (số khung, khóa chữ, độ dài câu, mã gói có thật).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var VANG = '#ffd95a', MUC = '#1b120a';
  var PHIM = {};                                  // mã gói → mảng hàm khung

  function CO(ma) { return 'phim-goi:' + ma; }
  function co(ma) { return !!(PHIM[ma] && PHIM[ma].length); }
  function daXem(ma) { return !!(window.Luu && Luu.daXem(CO(ma))); }
  function soKhung(ma) { return co(ma) ? PHIM[ma].length : 0; }
  function them(bang) { Object.keys(bang || {}).forEach(function (ma) { PHIM[ma] = bang[ma]; }); }

  var hen = [];                                   // hẹn giờ của khung đang chiếu (đổi khung thì hủy)
  function sau(ms, f) { hen.push(setTimeout(f, ms)); }
  function huyHen() { hen.forEach(clearTimeout); hen = []; }
  function keu(ten) { if (window.AmThanh) AmThanh.phat(ten); }

  /* ------------------------------------------------------------- bộ dựng hình (c) */
  /** Đặt phần tử e ở (x, y) (góc trên trái) trong khung tranh, thêm lớp cls. */
  function dat(e, x, y, cls) {
    e.classList.add('md-a');
    if (cls) cls.split(' ').forEach(function (c) { if (c) e.classList.add(c); });
    e.style.left = x + 'px'; e.style.top = y + 'px';
    return e;
  }
  function ico(ten, s, mau) { var c = Ve.ico(ten, s, { fill: mau || VANG, line: MUC }); c.classList.add('pxi'); return c; }
  /** Ô gạch của sân (Ve.tiles()): 'wall', 'crate', 'thung', 'pad'… ; ten = 'rug' lấy ô cỏ thứ i. */
  function o(ten, s, i) { var tl = Ve.tiles(), cv = ten === 'rug' ? tl.rug[(i || 0) & 3] : tl[ten]; var c = Ve.mk(cv, s); c.classList.add('pxi'); return c; }
  function coDich(s) { var c = Ve.mk(Ve.tiles().flags[0], s); c.classList.add('pxi', 'md-co'); return c; }
  function nutDe(bat, s) { var c = Ve.mk(Ve.makeNutDe(!!bat), s); c.classList.add('pxi'); return c; }
  /** Cửa (Ve.veCua) cạnh 14·s: mo = 0 (đóng) .. 1 (mở); doc = false: đi qua theo chiều ngang. */
  function cua(mo, s, doc) {
    var cv = document.createElement('canvas'); cv.width = Ve.T; cv.height = Ve.T;
    var g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(Ve.tiles().rug[0], 0, 0);
    try { Ve.veCua(g, 0, 0, mo, { doc: doc !== false }); } catch (e) { g.fillStyle = '#9aa3b6'; g.fillRect(0, 0, Ve.T, Ve.T); }
    var c = Ve.mk(cv, s); c.classList.add('pxi'); return c;
  }
  function chu(cls, s) { return h('div', 'md-a ' + cls, s); }
  function nen(k, cls) { k.appendChild(h('div', cls)); }
  function sao(s) { var c = Ve.sao(true, s); c.classList.add('pxi'); return c; }

  /**
   * Robot vẽ bằng VeRobot.ve, đặt theo TÂM THÂN (cx, cy). cauHinh như VeRobot (than, tay, camBien, son); thiếu than = 'hai-banh'.
   * Trả về phần tử .md-a có thêm hàm: .ve(trangThai, huong) vẽ lại tại chỗ; .toi(cx, cy) dời tâm (có chuyển động nếu lớp pg-truot).
   */
  function xe(cauHinh, trangThai, huong, tiLe, cx, cy, cls) {
    var cfg = { than: cauHinh.than || 'hai-banh', tay: cauHinh.tay || null, camBien: cauHinh.camBien || [], son: cauHinh.son };
    var bao = h('div', 'md-a pg-xe' + (cls ? ' ' + cls : ''));
    var tt = trangThai || {}, hg = huong === undefined ? 1 : huong;
    bao.ve = function (t2, h2) {
      if (t2) tt = t2; if (h2 !== undefined) hg = h2;
      var cv;
      try { cv = Ve.mk(VeRobot.ve(cfg, tt, hg, tiLe || 3), 1); }
      catch (e) { cv = h('div'); }
      cv.classList.add('pxi');
      var w = cv.width || 0, hh = cv.height || 0;
      cv.style.position = 'absolute'; cv.style.left = (-w / 2) + 'px'; cv.style.top = (-hh / 2) + 'px';
      bao.innerHTML = ''; bao.appendChild(cv);
      return bao;
    };
    bao.toi = function (x, y) { bao.style.left = x + 'px'; bao.style.top = y + 'px'; return bao; };
    bao.toi(cx, cy).ve();
    return bao;
  }

  /**
   * Sân mini nhìn từ trên xuống: rows = mảng chuỗi, mỗi ký tự một ô cạnh 14·s, góc trên trái (x0, y0).
   *   '.' cỏ · '#' tường · 'o' thùng gỗ · 'M' nút đè · 'C' cửa đóng · 'c' cửa mở · 'F' cờ · '*' ô đích khung vàng
   * Trả về { o(x, y) → tâm ô {x, y} (pixel khung), cua: { 'x,y': phần tử cửa } (cửa có hàm .dat(mo)), nut: { 'x,y': nút } (.dat(bat)), vat: { 'x,y': thùng } }.
   */
  function san(k, rows, s, x0, y0) {
    var c = 14 * s, kq = { cua: {}, nut: {}, vat: {} };
    kq.o = function (x, y) { return { x: x0 + x * c + c / 2, y: y0 + y * c + c / 2 }; };
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) {
        var ch = r[x], px = x0 + x * c, py = y0 + y * c, khoa = x + ',' + y;
        if (ch === '#') { k.appendChild(dat(o('wall', s), px, py)); continue; }
        k.appendChild(dat(o('rug', s, x + y * 2), px, py));
        if (ch === 'o') k.appendChild(kq.vat[khoa] = dat(o('crate', s), px, py));
        else if (ch === 'M') {
          var n = dat(h('div'), px, py); n.dat = (function (n) { return function (bat) { n.innerHTML = ''; n.appendChild(nutDe(bat, s)); }; })(n); n.dat(false);
          k.appendChild(kq.nut[khoa] = n);
        } else if (ch === 'C' || ch === 'c') {
          var d = dat(h('div'), px, py); d.dat = (function (d) { return function (mo) { d.innerHTML = ''; d.appendChild(cua(mo ? 1 : 0, s, false)); }; })(d); d.dat(ch === 'c');
          k.appendChild(kq.cua[khoa] = d);
        } else if (ch === 'F') k.appendChild(dat(coDich(s), px + c / 2 - 6 * s, py + c / 2 - 7 * s));
        else if (ch === '*') { var dv = dat(h('div', 'pg-dich'), px + 2, py + 2); dv.style.width = dv.style.height = (c - 4) + 'px'; k.appendChild(dv); }
      }
    });
    return kq;
  }

  /** Bảng code hiện từng dòng (như khung 6 phim mở đầu) ở (x, y); dòng thụt lề giữ khoảng trắng đầu dòng. */
  function code(k, dong, x, y, tre) {
    var bang = h('div', 'md-a md-code pg-code'); bang.style.left = x + 'px'; bang.style.top = y + 'px';
    dong.forEach(function (s, i) {
      var d = h('div', 'md-dong'); d.style.animationDelay = ((tre || 0.2) + i * 0.3) + 's';
      d.appendChild(h('span', 'so', String(i + 1)));
      d.appendChild(h('span', 'kc', s.replace(/^ +/, function (m) { return m.replace(/ /g, ' '); })));
      bang.appendChild(d);
    });
    k.appendChild(bang);
    return bang;
  }

  /** Bọc phần tử e (đã đặt chỗ) trong một lớp hiện từ giây t (trước đó ẩn); an = true: ngược lại, ẩn từ giây t.
   *  Bọc ngoài để không đè hoạt cảnh riêng của e (md-vx, md-lac…). */
  function tu(e, t, an) {
    var w = h('div', 'md-a pg-nhom ' + (an ? 'pg-an' : 'pg-hien')); w.style.left = '0px'; w.style.top = '0px'; w.style.setProperty('--t', t + 's');
    w.appendChild(e); return w;
  }

  var C = { h: h, dat: dat, ico: ico, o: o, co: coDich, nutDe: nutDe, cua: cua, chu: chu, nen: nen, sao: sao, xe: xe, san: san, code: code, tu: tu, sau: sau, keu: keu, VANG: VANG, MUC: MUC };

  /* ------------------------------------------------------------- chiếu phim */
  function mo(ma, khiXong, tuyChon) {
    tuyChon = tuyChon || {};
    var KHUNG = PHIM[ma], stage = document.getElementById('stage');
    if (!co(ma) || !stage) { if (khiXong) khiXong(); return; }
    var SO = KHUNG.length;
    var cu = stage.querySelector('.md'); if (cu) cu.remove();
    huyHen();
    var lop = h('div', 'md pg'); lop.setAttribute('data-hop', 'phim-goi'); lop.setAttribute('data-goi', ma);
    var boQua = h('button', 'bt g-wd md-bo-qua', t('pg.boQua')); boQua.setAttribute('data-nut', 'pg-bo-qua');
    var khung = h('div', 'md-khung chalk'); khung.setAttribute('data-nut', 'pg-khung');
    var loi = h('div', 'md-loi'); loi.setAttribute('aria-live', 'polite');
    var cham = h('div', 'md-cham'); for (var i = 0; i < SO; i++) cham.appendChild(h('i'));
    var tiep = h('button', 'bt g-gr md-tiep'); tiep.setAttribute('data-nut', 'pg-tiep');
    [boQua, khung, loi, cham, tiep].forEach(function (e) { lop.appendChild(e); });
    stage.appendChild(lop);

    var so = 0, daXong = false;
    function ve(n) {
      huyHen(); so = n;
      khung.innerHTML = '';
      try { KHUNG[n - 1](khung, C); } catch (e) { if (window.console && console.warn) console.warn('PhimGoi ' + ma + ' khung ' + n + ': ' + e.message); }
      loi.textContent = t('pg.' + ma + '.' + n);
      Array.prototype.forEach.call(cham.children, function (c, i) { c.classList.toggle('on', i === n - 1); });
      tiep.textContent = n < SO ? t('pg.tiep') : t(tuyChon.nutCuoi || 'pg.vaoGoi');
    }
    function sang() { if (so < SO) ve(so + 1); else xong(); }
    function xong() {
      if (daXong) return; daXong = true;
      huyHen();
      if (window.Luu) Luu.datDaXem(CO(ma));
      lop.remove();
      if (khiXong) khiXong();
    }
    tiep.addEventListener('click', sang);
    khung.addEventListener('click', function () { if (so < SO) sang(); });
    boQua.addEventListener('click', xong);
    ve(1);
  }

  window.PhimGoi = { mo: mo, co: co, daXem: daXem, CO: CO, soKhung: soKhung, them: them, ds: function () { return Object.keys(PHIM); }, C: C };
})();
