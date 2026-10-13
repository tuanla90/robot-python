/* ============================================================================
   thanh-phan.js — "Đường học": THÀNH PHẦN GIAO DIỆN DÙNG CHUNG (window.TP).
   h() dựng DOM · Editor (khung 10 ô) · Palette (kho khối chia 3 nhóm) · Hop (hộp thoại).
   Mọi chữ lấy qua t('khoa') trong chu.js.
   ========================================================================== */
(function () {
  'use strict';

  function h(tag, cls, noi) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (noi !== undefined && noi !== null) e.textContent = noi;
    return e;
  }
  /**
   * Điền văn bản vào el; các lời gọi như `wait()`, `move()` và mọi dấu ngoặc tròn được tách ra, hiện bằng phông code (VT323)
   * vì ở Handjet dấu ngoặc tròn trông giống ngoặc vuông. textContent vẫn đúng như chuỗi gốc.
   */
  function vanBan(el, s) {
    s = String(s === undefined || s === null ? '' : s);
    el.textContent = '';
    var re = /[A-Za-z_][A-Za-z0-9_]*\(\)|[()]/g, i = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > i) el.appendChild(document.createTextNode(s.slice(i, m.index)));
      var k = document.createElement('span'); k.className = 'kc'; k.textContent = m[0]; el.appendChild(k);
      i = m.index + m[0].length;
    }
    if (i < s.length) el.appendChild(document.createTextNode(s.slice(i)));
    return el;
  }
  function hv(tag, cls, noi) { return vanBan(h(tag, cls), noi); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function lopMau(ten) {
    if (ten === 'left_move' || ten === 'right_move' || ten === 'left_back' || ten === 'right_back') return 'cy';
    if (ten === 'wait') return 'yl';
    if (/^go_/.test(ten)) return 'pu';
    return 'gr';
  }
  /** Tô màu một dòng code (ngôn ngữ giữ nguyên tiếng Anh). */
  function mauDong(text) {
    if (/^\s*#/.test(text)) return '<span class="cm">' + esc(text) + '</span>';
    var m = /^(\s*)([A-Za-z_]\w*)\((.*)\)\s*$/.exec(text);
    if (!m) return esc(text);
    var cls = m[2] === 'left_move' || m[2] === 'right_move' || m[2] === 'left_back' || m[2] === 'right_back' ? 'mv'
      : m[2] === 'wait' ? 'wt' : /^go_/.test(m[2]) ? 'mv' : 'fn';
    return esc(m[1]) + '<span class="' + cls + '">' + esc(m[2]) + '</span><span class="pu">(</span>' +
      (m[3] ? '<span class="ar">' + esc(m[3]) + '</span>' : '') + '<span class="pu">)</span>';
  }

  /* ------------------------------------------------------------- Editor */
  /**
   * Khung 10 ô. tuyChon: { tong: 10, dung: số ô dùng được, lay: () => mảng dòng (sửa tại chỗ),
   *   bang: phần tử panel (để nháy đỏ + chứa thông báo "Đã xóa · Hoàn tác"), dem: phần tử đếm, khiDoi: fn, khiKhoa: fn,
   *   khiBam: fn(i) khi chạm một ô, dangChay: () => bool (đang chạy / phát lại thì tắt xóa nhanh),
   *   nutXoaHet: nút thùng rác ở tiêu đề (Editor tự làm mờ khi không có gì để xóa),
   *   tt / ttDay / ttNgan: phần tử tiêu đề + chữ đầy đủ + chữ rút gọn (dùng khi tiêu đề không vừa) }
   * Xóa một dòng: chuột rê lên dòng có code thì ô số thứ tự đổi thành ✕ (bấm để xóa);
   * cảm ứng chạm HAI lần liên tiếp (≤ 350 ms) vào dòng có code. Mọi lần xóa đều hiện "Đã xóa · Hoàn tác" ~3 giây.
   */
  function Editor(host, tuyChon) {
    var tong = tuyChon.tong || 10, dung = tuyChon.dung === undefined ? tong : tuyChon.dung;
    var lay = tuyChon.lay, sel = 0, runIdx = -1, loiSet = {}, ed = this;
    var rows = [], strips = [], xt = null, viTri = null;
    var hov = -1, kieuCuoi = 'mouse', cham = null, hoan = null, hoanHen = null, hoanEl = null;
    this.host = host; this.tong = tong;
    host.innerHTML = '';
    function dangChay() { return !!(tuyChon.dangChay && tuyChon.dangChay()); }
    function choXoa() { return !xt && !dangChay() && !Chan.dang(); }
    function veXx() {
      var n = lay().length, ok = choXoa();
      for (var i = 0; i < tong; i++) rows[i].classList.toggle('xx', ok && i === hov && i < dung && i < n);
    }
    for (var i = 0; i < tong; i++) {
      var r = h('div', 'row'), tb = h('div', 'tab'), s = h('div', 'strip empty');
      tb.appendChild(h('span', 'tn', i + 1));
      var xi = Ve.ico('x5', 2, { fill: '#fff', line: '#5a0e0c' }); xi.className += ' tx'; tb.appendChild(xi);
      r.appendChild(tb); r.appendChild(s); host.appendChild(r); rows.push(r); strips.push(s);
      (function (i) {
        r.addEventListener('click', function (ev) {
          var arr = lay(), kieu = ev.pointerType || kieuCuoi;
          if (i < dung && i < arr.length && choXoa()) {
            if (kieu === 'mouse') {
              if (rows[i].classList.contains('xx') && ev.target.closest && ev.target.closest('.tab')) { ev.stopPropagation(); ed.xoaTai(i); return; }
            } else {
              var bay = Date.now();
              if (cham && cham.i === i && bay - cham.t <= 350) { cham = null; ed.xoaTai(i); return; }
              cham = { i: i, t: bay };
            }
          } else cham = null;
          tuyChon.khiBam && tuyChon.khiBam(i);
          if (i >= dung) { tuyChon.khiKhoa && tuyChon.khiKhoa(); return; }
          sel = i; ed.render();
        });
      })(i);
    }
    host.addEventListener('pointerdown', function (ev) {
      kieuCuoi = ev.pointerType || 'mouse';
      if (kieuCuoi !== 'mouse' && hov !== -1) { hov = -1; veXx(); }
    }, true);
    host.addEventListener('pointermove', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      var row = ev.target.closest && ev.target.closest('.row'), k = row ? rows.indexOf(row) : -1;
      if (k !== hov) { hov = k; veXx(); }
    });
    host.addEventListener('pointerleave', function () { if (hov !== -1) { hov = -1; veXx(); } });
    sel = Math.min(lay().length, dung - 1);
    if (sel < 0) sel = 0;

    this.render = function () {
      var arr = lay();
      for (var i = 0; i < tong; i++) {
        var it = xt ? xt[i] : arr[i], khoa = i >= dung;
        var slot = !!(xt && it && it.slot), t = xt ? (it && !it.slot ? it.t : undefined) : it;
        strips[i].className = 'strip' + (khoa ? ' lock' : (slot ? ' slot' : (t === undefined ? ' empty' : ''))) +
          (!xt && runIdx === i ? ' on' : '') + (!xt && loiSet[i] ? ' err' : '');
        strips[i].innerHTML = '';
        if (khoa) strips[i].appendChild(Ve.khoa(2, true));
        else if (t !== undefined) strips[i].innerHTML = mauDong(t);
        rows[i].classList.toggle('sel', !xt && i === sel && !khoa);
        rows[i].classList.toggle('run', !xt && runIdx === i);
      }
      if (tuyChon.dem) tuyChon.dem.textContent = arr.length + '/' + dung;
      if (tuyChon.nutXoaHet) tuyChon.nutXoaHet.disabled = !arr.length;
      veXx();
    };
    /** Tiêu đề đầy đủ nếu vừa, không vừa thì dùng chữ rút gọn. */
    this.vuaTieuDe = function () {
      var el = tuyChon.tt; if (!el) return;
      el.textContent = tuyChon.ttDay;
      if (el.clientWidth && el.scrollWidth > el.clientWidth) el.textContent = tuyChon.ttNgan;
    };
    this.nhay = function () {
      var p = tuyChon.bang; if (!p) return;
      p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash');
    };

    /* ---- hoàn tác sau khi xóa */
    function luuHoan(arr, selSau) { hoan = { arr: arr.slice(), sel: selSau }; }
    function hienHoan() {
      var pan = tuyChon.bang; if (!pan) return;
      if (!hoanEl) {
        hoanEl = h('div', 'hoan-tac'); hoanEl.setAttribute('data-nut', 'da-xoa');
        hoanEl.appendChild(h('span', 'ht', t('choi.daXoa')));
        var b = h('button', 'bt g-bl hoan-nut', t('choi.hoanTac')); b.setAttribute('data-nut', 'hoan-tac');
        b.addEventListener('click', function (ev) { ev.stopPropagation(); ed.hoanTac(); });
        hoanEl.appendChild(b); pan.appendChild(hoanEl);
      }
      hoanEl.classList.add('show');
      clearTimeout(hoanHen); hoanHen = setTimeout(function () { ed.anHoan(); }, 3000);
    }
    this.anHoan = function () {
      clearTimeout(hoanHen); hoan = null;
      if (hoanEl) hoanEl.classList.remove('show');
    };
    this.hoanTac = function () {
      if (!hoan || dangChay()) return;
      var s = hoan, arr = lay(); this.anHoan();
      arr.length = 0; Array.prototype.push.apply(arr, s.arr);
      sel = Math.max(0, Math.min(s.sel, dung - 1));
      this.render(); this.hieuUng(Math.min(s.sel, arr.length - 1)); tuyChon.khiDoi && tuyChon.khiDoi();
    };

    this.chen = function (txt) { return this.chenTai(txt, Math.min(sel, lay().length)); };
    /** Chèn vào vị trí at (0..số dòng). Đầy khung thì nháy đỏ, không chèn. */
    this.chenTai = function (txt, at) {
      var arr = lay();
      if (arr.length >= dung) { this.nhay(); return false; }
      this.anHoan();
      at = Math.max(0, Math.min(at, arr.length));
      arr.splice(at, 0, txt);
      sel = Math.min(at + 1, dung - 1);
      this.render(); this.hieuUng(at); tuyChon.khiDoi && tuyChon.khiDoi();
      return true;
    };
    /** Đổi dòng tu sang vị trí den (tính trong danh sách sau khi đã bỏ dòng tu). */
    this.doiCho = function (tu, den) {
      var arr = lay(); if (tu < 0 || tu >= arr.length) return;
      den = Math.max(0, Math.min(den, arr.length - 1));
      if (tu !== den) this.anHoan();
      var x = arr.splice(tu, 1)[0]; arr.splice(den, 0, x);
      sel = den; this.render(); this.hieuUng(den);
      if (tu !== den) tuyChon.khiDoi && tuyChon.khiDoi();
    };
    this.xoaTai = function (i) {
      var arr = lay(); if (i < 0 || i >= arr.length) return;
      luuHoan(arr, i);
      arr.splice(i, 1); sel = Math.min(i, dung - 1);
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi(); hienHoan();
    };
    this.chon = function (i) { if (i >= 0 && i < dung) { sel = i; this.render(); } };
    this.xoaHet = function () {
      var arr = lay(); if (!arr.length) return;
      luuHoan(arr, 0);
      arr.length = 0; sel = 0; this.render(); tuyChon.khiDoi && tuyChon.khiDoi(); hienHoan();
    };
    this.datChay = function (idx) { runIdx = idx === null || idx === undefined ? -1 : idx; this.render(); };
    this.datLoi = function (ds) { loiSet = {}; (ds || []).forEach(function (i) { loiSet[i] = true; }); this.render(); };
    this.nap = function (layMoi, dungMoi) {
      this.anHoan();
      lay = layMoi; if (dungMoi !== undefined) dung = dungMoi;
      runIdx = -1; loiSet = {}; xt = null; viTri = null; sel = Math.min(lay().length, Math.max(0, dung - 1)); this.render();
      this.vuaTieuDe();
    };
    this.dung = function () { return dung; };
    this.mang = function () { return lay(); };
    /** Phần tử của ô thứ i (để vẽ mũi tên chỉ tới). */
    this.hangEl = function (i) { return rows[i] || null; };
    this.chiSo = function (row) { return rows.indexOf(row); };
    this.hinhHoc = function () { return rows.map(function (r) { return r.getBoundingClientRect(); }); };
    /**
     * Xem trước khi kéo: list = mảng { t, id } (dòng đang có, id = chỉ số cũ) hoặc { slot: true } (chỗ sẽ thả); null = bỏ xem trước.
     * Các dòng đổi chỗ thì trượt nhẹ từ chỗ cũ sang chỗ mới.
     */
    this.xemTruoc = function (list) {
      var cu = viTri;
      if (list && !cu) { cu = {}; lay().forEach(function (_, k) { cu[k] = k; }); }
      xt = list; this.render();
      if (!list) { viTri = null; return; }
      var moi = {}, pitch = rows.length > 1 ? rows[1].offsetTop - rows[0].offsetTop : 0;
      list.forEach(function (it, k) {
        if (!it || it.slot) return;
        moi[it.id] = k;
        if (cu && cu[it.id] !== undefined && cu[it.id] !== k && pitch && strips[k].animate) {
          try { strips[k].animate([{ transform: 'translateY(' + ((cu[it.id] - k) * pitch) + 'px)' }, { transform: 'translateY(0)' }], { duration: 130, easing: 'steps(3,end)' }); } catch (e) { /* bỏ qua */ }
        }
      });
      viTri = moi;
    };
    /** Hiệu ứng khối "cắm" vào khe ở ô i. */
    this.hieuUng = function (i) {
      var e = strips[i]; if (!e) return;
      e.classList.remove('cam'); void e.offsetWidth; e.classList.add('cam');
      setTimeout(function () { e.classList.remove('cam'); }, 420);
    };
    this.render();
    this.vuaTieuDe();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ed.vuaTieuDe(); });
  }

  /* ------------------------------------------------------------ Palette */
  /**
   * Kho khối chia 3 nhóm. cb: { khiChen(text), khiSua(loai, ten), khiMoi() }.
   * dung({ goc: [tên], em: [{ten,thamSo}] | null, man: [{ten,thamSo}], coNutMoi, boQua }).
   * em === null → ẩn cả nhóm "hàm của em". Nhóm rỗng thì ẩn (trừ "hàm của em" có nút Hàm mới).
   */
  function Palette(host, cb) {
    this.host = host;
    var bricks = {}, lastSpec = null;
    function nhan(chu, cls) { var g = h('div', 'gl ' + cls); g.appendChild(document.createTextNode(chu)); host.appendChild(g); return g; }
    function gach(ten, lop, loai, hamTS) {
      var d = h('div', 'brick ' + lop); d.setAttribute('role', 'button');
      var goi = ten + '(' + (hamTS && hamTS.length ? hamTS.map(function () { return '1'; }).join(', ') : '') + ')';
      d.setAttribute('data-ten', ten); d.setAttribute('data-loai', loai); d.setAttribute('data-goi', goi);
      var sp = h('span', 'tx');
      if (loai === 'goc') sp.textContent = ten;
      else { sp.appendChild(document.createTextNode(ten)); sp.appendChild(h('span', 'pn', goi.slice(ten.length))); }
      d.appendChild(sp);
      if (loai !== 'goc') {
        var e = h('span', 'ed'); e.setAttribute('role', 'button'); e.setAttribute('aria-label', t('choi.suaHam', { ten: ten }));
        e.setAttribute('data-sua', ten);
        e.appendChild(Ve.ico('edit', 2, { line: '#0e3a12' }));
        e.addEventListener('click', function (ev) { ev.stopPropagation(); cb.khiSua && cb.khiSua(loai, ten); });
        d.appendChild(e);
      }
      d.addEventListener('click', function () { cb.khiChen(goi); });
      host.appendChild(d); bricks[loai + ':' + ten] = d;
    }
    this.dung = function (spec) {
      lastSpec = spec; host.innerHTML = ''; bricks = {};
      host.classList.remove('d1', 'd2', 'd3');
      var boQua = spec.boQua || null;
      if (spec.goc && spec.goc.length) {
        nhan(t('choi.nhom.goc'), 'g1');
        spec.goc.forEach(function (n) { gach(n, lopMau(n) === 'gr' ? 'pu' : lopMau(n), 'goc'); });
      }
      if (spec.em) {
        var g2 = nhan(t('choi.nhom.em'), 'g2 g-em');
        if (spec.coNutMoi && cb.khiMoi) {
          var nb = h('button', 'nb'); nb.setAttribute('data-nut', 'ham-moi');
          nb.appendChild(Ve.ico('plus', 1, { line: '#0e3a12', fill: '#e8ffe0' }));
          nb.appendChild(document.createTextNode(t('choi.hamMoi')));
          nb.addEventListener('click', function () { cb.khiMoi(); });
          g2.appendChild(nb);
        }
        spec.em.forEach(function (f) { if (f.ten !== boQua) gach(f.ten, 'gr', 'em', f.thamSo); });
      }
      if (spec.man && spec.man.length) {
        var list = spec.man.filter(function (f) { return f.ten !== boQua; });
        if (list.length) {
          var g3 = nhan(t('choi.nhom.man'), 'g3 g-ma');
          g3.appendChild(h('span', 'tg', t('choi.nhom.chiMan')));
          list.forEach(function (f) { gach(f.ten, 'or', 'man', f.thamSo); });
        }
      }
      this.vua();
    };
    /** Co khối lại cho vừa khung (không bao giờ có thanh cuộn). */
    this.vua = function () {
      if (!host.clientHeight) return;
      ['d1', 'd2', 'd3'].forEach(function (c) { host.classList.remove(c); });
      var bac = ['d1', 'd2', 'd3'];
      for (var i = 0; i < bac.length && host.scrollHeight > host.clientHeight + 1; i++) {
        if (i) host.classList.remove(bac[i - 1]);
        host.classList.add(bac[i]);
      }
    };
    this.datSang = function (loai, ten) {
      Object.keys(bricks).forEach(function (k) { bricks[k].classList.toggle('lit', !!loai && k === loai + ':' + ten); });
    };
    this.datLoi = function (ds) {
      var set = {}; (ds || []).forEach(function (k) { set[k] = true; });
      Object.keys(bricks).forEach(function (k) { bricks[k].classList.toggle('err', !!set[k]); });
    };
    this.lai = function () { if (lastSpec) this.dung(lastSpec); };
  }

  /* ------------------------------------------------- chặn bấm khi chuyển cảnh */
  /**
   * Trong lúc có hiệu ứng chuyển (Xưởng trượt, hộp mở/đóng, đổi màn) và một lúc sau đó,
   * phủ một lớp trong suốt để cú bấm "đến muộn" không rơi xuống lớp bên dưới.
   */
  var Chan = (function () {
    var el = null, hen = null, den = 0;
    function lopChan() {
      if (!el) { el = document.createElement('div'); el.id = 'lop-chan'; (document.getElementById('stage') || document.body).appendChild(el); }
      return el;
    }
    function giu(ms) {
      var e = lopChan(), t1 = Date.now() + ms;
      if (t1 > den) den = t1;
      e.classList.add('on');
      clearTimeout(hen);
      hen = setTimeout(function () { e.classList.remove('on'); }, Math.max(0, den - Date.now()));
    }
    function dang() { return Date.now() < den; }
    document.addEventListener('click', function (ev) {
      if (dang()) { ev.stopPropagation(); ev.preventDefault(); }
    }, true);
    return { giu: giu, dang: dang };
  })();
  var CHAN_MS = 300;       // thời gian chặn thêm sau hiệu ứng
  var XUONG_MS = 300;      // Xưởng trượt .3s

  /* ------------------------------------------------------------ Kéo thả */
  /**
   * Kéo thả bằng Pointer Events (chuột + cảm ứng) cho MỘT cặp khung code + kho khối.
   *   Keo.gan({ ed: Editor, pal: Palette, dangChay: () => bool, khiDay: fn, khiKhoa: fn })
   * - Nhấn giữ một dòng ~250 ms (hoặc kéo chuột quá 6px): dòng nổi lên, kéo để đổi chỗ; kéo sang cột KHỐI LỆNH
   *   (hiện thùng rác) rồi thả thì xóa; thả ngoài khung thì về chỗ cũ.
   * - Kéo một khối ở kho vào khung: chèn đúng chỗ thả (đầy khung thì nháy đỏ, ô khóa không thả vào được).
   * - Chạm nhanh vẫn là chọn ô / chèn như cũ (click). Đang chạy / đang chuyển cảnh (Chan) thì tắt kéo thả.
   */
  var Keo = (function () {
    var HOLD_MS = 250, NGUONG_CHUOT = 6, NGUONG_CHAM = 10;
    var cur = null, chanClick = false, henClick = null;

    // Sau khi thả, trình duyệt có thể bắn thêm một click: nuốt nó để không chọn / chèn nhầm.
    document.addEventListener('click', function (ev) {
      if (chanClick) { ev.stopPropagation(); ev.preventDefault(); }
    }, true);
    function nuotClick() { chanClick = true; clearTimeout(henClick); henClick = setTimeout(function () { chanClick = false; }, 60); }

    function trong(r, x, y) { return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
    /** Chỉ số hàng chứa y (ngoài khung thì kẹp về hàng đầu / cuối). */
    function hangGan(hh, y) {
      if (y <= hh[0].top) return 0;
      for (var i = 0; i < hh.length; i++) if (y < hh[i].bottom + 1) return i;
      return hh.length - 1;
    }
    function lap(arr, bo, slotAt) {
      var ds = [];
      arr.forEach(function (t, i) { if (i !== bo) ds.push({ t: t, id: i }); });
      if (slotAt !== null) ds.splice(slotAt, 0, { slot: true });
      return ds;
    }

    function gan(cfg) {
      var ed = cfg.ed, pal = cfg.pal;
      var panP = ed.host.closest('.pan'), panK = pal.host.closest('.pan');
      var thung = h('div', 'thung');
      var ic = h('div', 'thung-ic'); ic.appendChild(Ve.ico('trash', 7, { line: '#3a0806', fill: '#fff0ec', shade: '#e0b0aa' }));
      thung.appendChild(ic); thung.appendChild(h('div', 'thung-chu', t('keo.thung')));
      panK.appendChild(thung);
      [ed.host, pal.host].forEach(function (el) {
        el.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
      });

      function bat(ev, loai, idx, el, txt) {
        if (cur || !ev.isPrimary || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        if (Chan.dang() || (cfg.dangChay && cfg.dangChay())) return;
        chanClick = false;
        var r = el.getBoundingClientRect();
        cur = {
          ed: ed, pal: pal, loai: loai, tu: idx, txt: txt, el: el, id: ev.pointerId, kieu: ev.pointerType || 'mouse',
          sx: ev.clientX, sy: ev.clientY, x: ev.clientX, y: ev.clientY, gx: ev.clientX - r.left, gy: ev.clientY - r.top, rect: r,
          started: false, key: null, slot: null, vung: null, loi: null, ghost: null, timer: null, cfg: cfg, panP: panP, panK: panK, thung: thung
        };
        // dòng code: giữ ~250 ms là bắt đầu kéo; khối ở kho: chỉ cần kéo (để chạm vẫn là chèn ngay)
        if (loai === 'doi') cur.timer = setTimeout(function () { if (cur && !cur.started) batDau(); }, HOLD_MS);
        window.addEventListener('pointermove', dichuyen, { passive: false });
        window.addEventListener('pointerup', nha, true);
        window.addEventListener('pointercancel', huy, true);
        window.addEventListener('keydown', phim, true);
        window.addEventListener('blur', huy);
      }
      ed.host.addEventListener('pointerdown', function (ev) {
        var row = ev.target.closest && ev.target.closest('.row'); if (!row) return;
        var i = ed.chiSo(row), arr = ed.mang();
        if (i < 0 || i >= ed.dung() || i >= arr.length) return;       // chỉ dòng code thật mới kéo được
        bat(ev, 'doi', i, row.querySelector('.strip') || row, arr[i]);
      });
      pal.host.addEventListener('pointerdown', function (ev) {
        var b = ev.target.closest && ev.target.closest('.brick'); if (!b || ev.target.closest('.ed')) return;
        bat(ev, 'chen', -1, b, b.getAttribute('data-goi'));
      });
    }

    function stageInfo() {
      var st = document.getElementById('stage'), r = st.getBoundingClientRect();
      return { st: st, left: r.left, top: r.top, k: st.offsetWidth ? r.width / st.offsetWidth : 1 };
    }
    function datGhost() {
      var c = cur, si = stageInfo(), g;
      if (c.loai === 'doi') {
        g = h('div', 'keo-bong keo-dong'); g.innerHTML = mauDong(c.txt);
      } else {
        g = c.el.cloneNode(true); g.className += ' keo-bong';
        var ned = g.querySelector('.ed'); if (ned) ned.parentNode.removeChild(ned);
        g.removeAttribute('data-nut'); g.style.fontSize = getComputedStyle(c.el).fontSize;
      }
      g.style.width = (c.rect.width / si.k) + 'px'; g.style.height = (c.rect.height / si.k) + 'px';
      g.style.transformOrigin = (c.gx / si.k) + 'px ' + (c.gy / si.k) + 'px';
      si.st.appendChild(g); c.ghost = g;
    }
    function viTriGhost() {
      var c = cur, si = stageInfo();
      // nổi lên: hơi lệch lên trên và sang phải để chỗ trống sáng bên dưới vẫn thấy
      c.ghost.style.left = ((c.x - c.gx - si.left) / si.k + 4) + 'px';
      c.ghost.style.top = ((c.y - c.gy - si.top) / si.k - 7) + 'px';
    }
    function batDau() {
      var c = cur; if (!c || c.started) return;
      if ((c.cfg.dangChay && c.cfg.dangChay()) || Chan.dang()) { ketThuc(); return; }
      clearTimeout(c.timer); c.started = true;
      try { c.el.setPointerCapture(c.id); } catch (e) { /* bỏ qua */ }
      datGhost(); viTriGhost();
      document.body.classList.add('dang-keo');
      c.panP.classList.add('keo-dich');
      if (c.loai === 'doi') { if (c.cfg.khiKeoDong) c.cfg.khiKeoDong(); c.panK.classList.add('keo-thung'); }
      capNhat(true);
    }
    /** Tính chỗ thả theo vị trí con trỏ rồi vẽ xem trước. */
    function capNhat(ep) {
      var c = cur, ed = c.ed, arr = ed.mang(), n = arr.length, dung = ed.dung();
      var rp = c.panP.getBoundingClientRect(), rk = c.panK.getBoundingClientRect();
      var vung = null, slot = null, loi = null, xem;
      if (c.loai === 'doi' && trong(rk, c.x, c.y)) vung = 'thung';
      else if (trong(rp, c.x, c.y)) vung = 'khung';
      if (vung === 'thung') xem = lap(arr, c.tu, null);
      else if (vung === 'khung') {
        var idx = hangGan(ed.hinhHoc(), c.y);
        if (idx >= dung) { loi = 'khoa'; xem = c.loai === 'doi' ? lap(arr, c.tu, c.tu) : lap(arr, -1, null); }
        else if (c.loai === 'doi') { slot = Math.min(idx, n - 1); xem = lap(arr, c.tu, slot); }
        else if (n >= dung) { loi = 'day'; xem = lap(arr, -1, null); }
        else { slot = Math.min(idx, n); xem = lap(arr, -1, slot); }
      } else xem = c.loai === 'doi' ? lap(arr, c.tu, c.tu) : lap(arr, -1, null);
      var key = vung + '|' + slot + '|' + loi;
      c.vung = vung; c.slot = slot; c.loi = loi;
      var g = c.ghost.classList;
      g.toggle('bad', !!loi); g.toggle('vao-thung', vung === 'thung');
      c.thung.classList.toggle('on', vung === 'thung');
      c.panP.classList.toggle('keo-co-cho', slot !== null);
      if (ep || key !== c.key) { c.key = key; ed.xemTruoc(xem); }
    }
    function dichuyen(ev) {
      var c = cur; if (!c || ev.pointerId !== c.id) return;
      c.x = ev.clientX; c.y = ev.clientY;
      if (!c.started) {
        var d = Math.sqrt(Math.pow(c.x - c.sx, 2) + Math.pow(c.y - c.sy, 2));
        var ng = c.kieu === 'mouse' ? NGUONG_CHUOT : NGUONG_CHAM;
        if (d <= ng) return;
        if (c.loai === 'doi' && c.kieu !== 'mouse') { nuotClick(); ketThuc(); return; }   // vuốt nhanh trên dòng (cảm ứng) khi chưa giữ đủ lâu: bỏ
        batDau(); if (!c.started) return;
      }
      ev.preventDefault();
      viTriGhost(); capNhat(false);
    }
    function nha(ev) {
      var c = cur; if (!c || ev.pointerId !== c.id) return;
      if (ev.clientX !== undefined) { c.x = ev.clientX; c.y = ev.clientY; }
      if (!c.started) { ketThuc(); return; }                 // chạm nhanh: để click xử lý như cũ
      ev.preventDefault();
      capNhat(false);
      var ed = c.ed, vung = c.vung, slot = c.slot, loi = c.loi, loai = c.loai, tu = c.tu, txt = c.txt, cf = c.cfg;
      nuotClick(); ketThuc();
      if (vung === 'thung') ed.xoaTai(tu);
      else if (loai === 'doi') { if (slot !== null) ed.doiCho(tu, slot); }
      else if (loi === 'day') { ed.nhay(); cf.khiDay && cf.khiDay(); }
      else if (loi === 'khoa') cf.khiKhoa && cf.khiKhoa();
      else if (slot !== null) ed.chenTai(txt, slot);
    }
    function huy() { if (cur) { nuotClick(); ketThuc(); } }
    function phim(ev) { if (ev.key === 'Escape' && cur) { ev.preventDefault(); huy(); } }
    function ketThuc() {
      var c = cur; if (!c) return;
      cur = null; clearTimeout(c.timer);
      window.removeEventListener('pointermove', dichuyen, { passive: false });
      window.removeEventListener('pointerup', nha, true);
      window.removeEventListener('pointercancel', huy, true);
      window.removeEventListener('keydown', phim, true);
      window.removeEventListener('blur', huy);
      if (c.started) {
        try { c.el.releasePointerCapture(c.id); } catch (e) { /* bỏ qua */ }
        if (c.ghost && c.ghost.parentNode) c.ghost.parentNode.removeChild(c.ghost);
        document.body.classList.remove('dang-keo');
        c.panP.classList.remove('keo-dich', 'keo-co-cho'); c.panK.classList.remove('keo-thung'); c.thung.classList.remove('on');
        c.ed.xemTruoc(null);
      }
    }
    return { gan: gan, dang: function () { return !!(cur && cur.started); } };
  })();

  /* ------------------------------------------------------------ Bong bóng */
  /** Co cỡ chữ (đơn vị gốc, nhân với hệ số --kp của phông) cho vừa khung el, không xuống dưới min. */
  function vuaChu(el, max, min) {
    var k = parseFloat(getComputedStyle(document.body).getPropertyValue('--kp')) || 1;
    var s = max; el.style.fontSize = (s * k) + 'px';
    while (el.scrollHeight > el.clientHeight + 1 && s > min) { s -= 1; el.style.fontSize = (s * k) + 'px'; }
  }
  /** Vẽ nội dung bong bóng b. o: { kieu: 'de'|'goi'|'loi'|'tin', tieuDe, chu, phu, ma, pager: {i,n,truoc,sau} }. */
  function bongVe(b, o) {
    var duoi = b.classList.contains('duoi');
    b.innerHTML = ''; b.className = 'bong ' + (duoi ? 'duoi ' : '') + 'show ' + o.kieu;
    var pan = b.closest('.pan'); if (pan) pan.classList.add('co-bong');
    b.appendChild(h('div', 'bg-td', o.tieuDe));
    var nd = hv('div', 'bg-nd', o.chu); b.appendChild(nd);
    if (o.phu) nd.appendChild(hv('div', 'bg-phu', o.phu));      // dòng phụ (chữ nghiêng, nhạt hơn) cùng co cỡ với thân
    if (o.ma) b.setAttribute('data-ma', o.ma); else b.removeAttribute('data-ma');
    // nút X đỏ ở góc trên phải: cách DUY NHẤT để ẩn bong bóng bằng cách chạm vào bong bóng (chạm thân thì không ẩn)
    var nx = h('button', 'bt g-rd bg-x'); nx.setAttribute('data-nut', 'bong-x'); nx.setAttribute('aria-label', t('choi.anBong'));
    nx.appendChild(Ve.ico('close', 2, { line: '#4a0e0c' }));
    nx.addEventListener('click', function (ev) { ev.stopPropagation(); bongAn(b); });
    b.appendChild(nx);
    var ch = h('div', 'bg-ch');
    if (o.pager) {
      var tr = h('button', 'bt g-wd pg', '‹'); tr.setAttribute('data-nut', 'cd-truoc'); tr.setAttribute('aria-label', t('choi.truoc'));
      var sa = h('button', 'bt g-wd pg', '›'); sa.setAttribute('data-nut', 'cd-sau'); sa.setAttribute('aria-label', t('choi.tiep'));
      tr.addEventListener('click', function (ev) { ev.stopPropagation(); o.pager.truoc(); });
      sa.addEventListener('click', function (ev) { ev.stopPropagation(); o.pager.sau(); });
      ch.appendChild(tr); ch.appendChild(h('span', 'so', t('choi.chanDoanSo', { i: o.pager.i, n: o.pager.n }))); ch.appendChild(sa);
    }
    if (o.pager) b.appendChild(ch);
    vuaChu(nd, 13, 9);
    return b;
  }
  function bongAn(b) {
    b.className = b.classList.contains('duoi') ? 'bong duoi' : 'bong';
    b.innerHTML = ''; b.removeAttribute('data-ma'); b.removeAttribute('data-ca');
    var pan = b.closest('.pan'); if (pan) pan.classList.remove('co-bong');
  }
  /** Mũi tên từ bong bóng (nằm ở cột phải) sang ô code hangEl ở cột trái. Không có ô thì không vẽ. */
  function bongMui(b, hangEl) {
    var cu = b.querySelector('.bg-mui'); if (cu) b.removeChild(cu);
    if (!hangEl || !b.classList.contains('show')) return;
    var m = Ve.mui(b.classList.contains('tin') ? '#4aa0ff' : '#ff5a4a', 2);
    m.className += ' bg-mui';
    b.appendChild(m);
    var rb = b.getBoundingClientRect(), rh = hangEl.getBoundingClientRect();
    var k = b.offsetHeight ? rb.height / b.offsetHeight : 1;
    var y = (rh.top + rh.height / 2 - rb.top) / k - m.offsetHeight / 2;
    y = Math.max(2, Math.min(b.offsetHeight - m.offsetHeight - 2, y));
    m.style.top = Math.round(y) + 'px';
  }

  /* -------------------------------------------------------------- Hộp */
  var lop = null;
  function goc() { return lop || (lop = document.getElementById('lop-hop')); }
  function dong() {
    var g = goc();
    if (g.classList.contains('mo')) Chan.giu(CHAN_MS);
    g.innerHTML = ''; g.classList.remove('mo');
  }
  /** Mở một hộp: dựng nội dung trong khung gỗ. Trả về phần tử thân hộp. */
  function mo(tieuDe, cls) {
    var g = goc(); g.innerHTML = ''; g.classList.add('mo'); Chan.giu(CHAN_MS);
    var hop = h('div', 'hop chalk-box ' + (cls || ''));
    hop.appendChild(h('div', 'hop-td', tieuDe));
    var than = h('div', 'hop-than'); hop.appendChild(than);
    g.appendChild(hop);
    for (var i = 0; i < 4; i++) hop.appendChild(h('i', 'rv ' + 'abcd'.charAt(i)));
    return { hop: hop, than: than, nut: null };
  }
  function nut(mau, chu, khiBam, ten) {
    var b = h('button', 'bt ' + mau + ' hop-nut', chu);
    if (ten) b.setAttribute('data-nut', ten);
    b.addEventListener('click', khiBam);
    return b;
  }
  /** Hỏi lại có/không. Trả về Promise<boolean>. */
  function xacNhan(o) {
    return new Promise(function (xong) {
      var m = mo(o.tieuDe || t('chung.xacNhan'), 'hop-nho');
      m.than.appendChild(hv('div', 'hop-chu', o.noiDung));
      if (o.canhBao) m.than.appendChild(hv('div', 'hop-chu canh', o.canhBao));
      var hang = h('div', 'hop-hang');
      hang.appendChild(nut('g-wd', t('chung.huy'), function () { dong(); xong(false); }, 'huy'));
      hang.appendChild(nut(o.mau || 'g-rd', o.co || t('chung.dongY'), function () { dong(); xong(true); }, 'co'));
      m.than.appendChild(hang);
    });
  }
  /** Hộp chỉ đọc một đoạn chữ dài. */
  function doc(tieuDe, noiDung) {
    var m = mo(tieuDe, 'hop-nho');
    m.than.appendChild(hv('div', 'hop-chu', noiDung));
    var hang = h('div', 'hop-hang');
    hang.appendChild(nut('g-gr', t('chung.dong'), function () { dong(); }, 'dong'));
    m.than.appendChild(hang);
  }

  window.TP = { h: h, esc: esc, vanBan: vanBan, mauDong: mauDong, lopMau: lopMau, Editor: Editor, Palette: Palette, Chan: Chan, Keo: Keo, XUONG_MS: XUONG_MS,
    bongVe: bongVe, bongAn: bongAn, bongMui: bongMui, vuaChu: vuaChu, Hop: { mo: mo, dong: dong, nut: nut, xacNhan: xacNhan, doc: doc } };
})();
