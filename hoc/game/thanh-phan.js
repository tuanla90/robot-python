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
   *   bang: phần tử panel (để nháy đỏ), dem: phần tử đếm, khiDoi: fn, khiKhoa: fn, khiBam: fn(i) khi chạm một ô }
   */
  function Editor(host, tuyChon) {
    var tong = tuyChon.tong || 10, dung = tuyChon.dung === undefined ? tong : tuyChon.dung;
    var lay = tuyChon.lay, sel = 0, runIdx = -1, loiSet = {}, ed = this;
    var rows = [], strips = [];
    host.innerHTML = '';
    for (var i = 0; i < tong; i++) {
      var r = h('div', 'row'), tb = h('div', 'tab', i + 1), s = h('div', 'strip empty');
      r.appendChild(tb); r.appendChild(s); host.appendChild(r); rows.push(r); strips.push(s);
      (function (i) {
        r.addEventListener('click', function () {
          tuyChon.khiBam && tuyChon.khiBam(i);
          if (i >= dung) { tuyChon.khiKhoa && tuyChon.khiKhoa(); return; }
          sel = i; ed.render();
        });
      })(i);
    }
    sel = Math.min(lay().length, dung - 1);
    if (sel < 0) sel = 0;

    this.render = function () {
      var arr = lay();
      for (var i = 0; i < tong; i++) {
        var t = arr[i], khoa = i >= dung;
        strips[i].className = 'strip' + (khoa ? ' lock' : (t === undefined ? ' empty' : '')) + (runIdx === i ? ' on' : '') + (loiSet[i] ? ' err' : '');
        strips[i].innerHTML = '';
        if (khoa) strips[i].appendChild(Ve.khoa(2, true));
        else if (t !== undefined) strips[i].innerHTML = mauDong(t);
        rows[i].classList.toggle('sel', i === sel && !khoa);
        rows[i].classList.toggle('run', runIdx === i);
      }
      if (tuyChon.dem) tuyChon.dem.textContent = arr.length + '/' + dung;
    };
    this.nhay = function () {
      var p = tuyChon.bang; if (!p) return;
      p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash');
    };
    this.chen = function (txt) {
      var arr = lay();
      if (arr.length >= dung) { this.nhay(); return false; }
      var at = Math.min(sel, arr.length);
      arr.splice(at, 0, txt);
      sel = Math.min(at + 1, dung - 1);
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
      return true;
    };
    this.xoaDong = function () {
      var arr = lay(); if (!arr.length) return;
      if (sel < arr.length) arr.splice(sel, 1); else { arr.pop(); sel = arr.length; }
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
    };
    this.xoaHet = function () {
      var arr = lay(); if (!arr.length) return;
      arr.length = 0; sel = 0; this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
    };
    this.datChay = function (idx) { runIdx = idx === null || idx === undefined ? -1 : idx; this.render(); };
    this.datLoi = function (ds) { loiSet = {}; (ds || []).forEach(function (i) { loiSet[i] = true; }); this.render(); };
    this.nap = function (layMoi, dungMoi) {
      lay = layMoi; if (dungMoi !== undefined) dung = dungMoi;
      runIdx = -1; loiSet = {}; sel = Math.min(lay().length, Math.max(0, dung - 1)); this.render();
    };
    this.dung = function () { return dung; };
    /** Phần tử của ô thứ i (để vẽ mũi tên chỉ tới). */
    this.hangEl = function (i) { return rows[i] || null; };
    this.render();
  }

  /* ------------------------------------------------------------ Palette */
  /**
   * Kho khối chia 3 nhóm. cb: { khiChen(text), khiSua(loai, ten), khiMoi() }.
   * dung({ goc: [tên], em: [{ten,thamSo}] | null, man: [{ten,thamSo}], coNutMoi, boQua }).
   * em === null → ẩn cả nhóm "hàm của em". Nhóm rỗng thì ẩn (trừ "hàm của em" có nút Hàm mới).
   */
  function Palette(host, cb) {
    var bricks = {}, lastSpec = null;
    function nhan(chu, cls) { var g = h('div', 'gl ' + cls); g.appendChild(document.createTextNode(chu)); host.appendChild(g); return g; }
    function gach(ten, lop, loai, hamTS) {
      var d = h('div', 'brick ' + lop); d.setAttribute('role', 'button');
      var goi = ten + '(' + (hamTS && hamTS.length ? hamTS.map(function () { return '1'; }).join(', ') : '') + ')';
      d.setAttribute('data-ten', ten); d.setAttribute('data-loai', loai);
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

  /* ------------------------------------------------------------ Bong bóng */
  /** Co cỡ chữ (đơn vị gốc, nhân với hệ số --kp của phông) cho vừa khung el, không xuống dưới min. */
  function vuaChu(el, max, min) {
    var k = parseFloat(getComputedStyle(document.body).getPropertyValue('--kp')) || 1;
    var s = max; el.style.fontSize = (s * k) + 'px';
    while (el.scrollHeight > el.clientHeight + 1 && s > min) { s -= 1; el.style.fontSize = (s * k) + 'px'; }
  }
  /** Vẽ nội dung bong bóng b. o: { kieu: 'de'|'goi'|'loi'|'tin', tieuDe, chu, ma, pager: {i,n,truoc,sau} }. */
  function bongVe(b, o) {
    var duoi = b.classList.contains('duoi');
    b.innerHTML = ''; b.className = 'bong ' + (duoi ? 'duoi ' : '') + 'show ' + o.kieu;
    b.appendChild(h('div', 'bg-td', o.tieuDe));
    var nd = hv('div', 'bg-nd', o.chu); b.appendChild(nd);
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

  window.TP = { h: h, esc: esc, vanBan: vanBan, mauDong: mauDong, lopMau: lopMau, Editor: Editor, Palette: Palette, Chan: Chan, XUONG_MS: XUONG_MS,
    bongVe: bongVe, bongAn: bongAn, bongMui: bongMui, vuaChu: vuaChu, Hop: { mo: mo, dong: dong, nut: nut, xacNhan: xacNhan, doc: doc } };
})();
