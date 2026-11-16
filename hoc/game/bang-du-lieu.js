/* =====================================================================
   bang-du-lieu.js — BẢNG DỮ LIỆU (window.BangDuLieu): nhập dữ liệu có cấu trúc bằng một bảng to mở từ đáy màn hình,
   thay cho việc chạm từng ô nhỏ trên dòng code. Dòng code vẫn là Python thật: bảng chỉ là cách NHẬP.
   Mọi bảng chung một khung: tiêu đề + nút Xong · dòng code cỡ to (ô đang chọn tô đậm) · hình của dữ liệu · lời nhắc · bàn phím · nút thêm / bớt.
   Bấm Xong / chạm ra ngoài / Enter mới ghi vào dòng; Esc bỏ.

   LIST LỒNG   g = [[2, 1], [2, 2]] · run_grid([[2, 1], [1, 2]])   → lưới hàng × cột, + / − hàng, + / − cột.
               t = g[0][1] (g gán bằng lưới ở phía trên)           → chạm ô cần đọc, dòng thành g[hàng][cột].
   TUPLE       a, b = (2, 3) · p = (2, 3) · max((2, 1), (2, 3))    → dãy ô KHOÁ số lượng: đổi số được, không thêm / bỏ ô.
   DICT        d = {"a": 3, "b": 2} · d = {3: 4} · d = {}           → bảng khoá → giá trị, + / − cặp.
   SET         s = {1, 2, 1, 3} · s = {"a", "b"} · s = set()        → túi thẻ; thẻ trùng bị gạch, đếm len(s) ngay trên bảng.
               s.add("a")                                          → bảng chọn chuỗi (cách cũ không chọn được chuỗi).
   Không nhận (trả false, editor mở bảng chọn cũ): ô có biến / phép tính, g[i][j] có chỉ số là biến, g là tham số hàm hay giá trị cảm biến.

   Nối với editor (thanh-phan.js): moBT gọi chan() (dòng biểu thức: list lồng, tuple) · moTD gọi chanTD() (dòng từ điển / tập hợp).
   ===================================================================== */
(function () {
  'use strict';

  var HANG_MAX = 6, COT_MAX = 5, CAP_MAX = 5, PT_MAX = 6;
  var cur = null;                                                       // bảng đang mở: { nen, phim }

  function h(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }
  function chuoi(s) { return s === undefined || s === null ? '' : String(s); }
  var RE_SO = /^-?\d+$/, RE_CHU = /^"[^"]*"$/;

  /* ------------------------------------------------------------- cây biểu thức (nút của TP.phanTichBT) */
  function laSoNguyen(n) { return !!n && n.t === 'la' && /^\d+$/.test(n.v); }
  function laSo(n) { return laSoNguyen(n) || (!!n && n.t === 'am' && laSoNguyen(n.a)); }
  /** Danh sách mà mọi phần tử là một danh sách số không rỗng. */
  function laLuoi(n) {
    return !!n && n.t === 'ds' && n.e.length > 0 && n.e.every(function (r) { return r.t === 'ds' && r.e.length > 0 && r.e.every(laSo); });
  }
  /** Bộ cố định (2, 3) chỉ gồm số. */
  function laBoSo(n) { return !!n && n.t === 'bo' && n.e.length > 0 && n.e.every(laSo); }
  function giaTri(n) { return n.t === 'am' ? -(+n.a.v) : +n.v; }
  function nutSo(v) { return v < 0 ? { t: 'am', a: { t: 'la', v: String(-v) } } : { t: 'la', v: String(v) }; }
  function conCua(n) {
    if (n.t === 'goi') return n.a;
    if (n.t === 'ds' || n.t === 'bo') return n.e;
    if (n.t === 'chi') return [n.o, n.i];
    if (n.t === 'am' || n.t === 'not') return [n.a];
    if (n.l && n.r) return [n.l, n.r];
    return [];
  }
  /** Nút đầu tiên (từ gốc xuống) thoả fn. */
  function tim(n, fn) {
    if (!n || typeof n !== 'object') return null;
    if (fn(n)) return n;
    var con = conCua(n);
    for (var i = 0; i < con.length; i++) { var k = tim(con[i], fn); if (k) return k; }
    return null;
  }
  function chua(n, x) { return !!tim(n, function (y) { return y === x; }); }
  function timTrongDong(d, fn) {
    for (var i = 0; i < d.e.length; i++) { var k = tim(d.e[i], fn); if (k) return k; }
    return null;
  }
  function luoiTuNut(n) { return n.e.map(function (r) { return r.e.map(giaTri); }); }
  function inLuoi(luoi) { return '[' + luoi.map(function (r) { return '[' + r.join(', ') + ']'; }).join(', ') + ']'; }

  /** Lưới đặt thẳng gán cho `ten` ở dòng gần nhất phía trên dòng i (null nếu không có). */
  function luoiCuaTen(arr, i, ten) {
    var re = new RegExp('^\\s*' + ten + '\\s*=(?!=)\\s*(\\[.*\\])\\s*(?:#.*)?$');
    for (var j = Math.min(i, arr.length) - 1; j >= 0; j--) {
      var m = re.exec(chuoi(arr[j]));
      if (!m) continue;
      var n = window.TP.phanTichBT(m[1]);
      return laLuoi(n) ? luoiTuNut(n) : null;
    }
    return null;
  }
  /** Mọi chuỗi "…" có trong các dòng (theo thứ tự gặp). */
  function chuTrongDong(arr) {
    var kq = [], re = /"[^"]*"/g, m;
    (arr || []).forEach(function (s) { s = chuoi(s); re.lastIndex = 0; while ((m = re.exec(s))) if (kq.indexOf(m[0]) < 0) kq.push(m[0]); });
    return kq;
  }

  /* ------------------------------------------------------------- nối với editor: dòng biểu thức */
  /**
   * Editor chạm ô kk của dòng biểu thức d (dòng thứ i). Trả true nếu bảng dữ liệu nhận ô này (editor không mở bảng chọn cũ nữa).
   * o: { lay: () => mảng dòng, dat: fn(dòng mới), soMax: số lớn nhất của bàn số, choAm: bool (màn có số âm) }.
   */
  function chan(i, d, kk, o) {
    if (!window.TP || !d || !d.o || !d.e) return false;
    var cho = d.o[kk], nut = cho && cho.nut;
    if (!nut) return false;
    function inLai() { o.dat(d.ghep(d.ds0)); }                           // không ô nào đổi chữ: ghep chỉ in lại dòng từ cây vừa sửa

    var gl = timTrongDong(d, function (n) { return laLuoi(n) && chua(n, nut); });
    if (gl) {
      var luoi = luoiTuNut(gl), r0 = 0, c0 = 0;
      gl.e.forEach(function (hang, r) { hang.e.forEach(function (x, c) { if (x === nut || chua(x, nut)) { r0 = r; c0 = c; } }); });
      moLuoi({
        kieu: 'sua', ten: d.kieu === 'gan' && d.e.length === 1 && d.e[0] === gl ? d.dich[0] : '', luoi: luoi, r: r0, c: c0, soMax: o.soMax,
        choAm: !!o.choAm || luoi.some(function (hg) { return hg.some(function (v) { return v < 0; }); }),
        khiXong: function (moi) {
          if (inLuoi(moi) === inLuoi(luoi)) return;
          gl.e = moi.map(function (hg) { return { t: 'ds', e: hg.map(nutSo) }; });
          inLai();
        }
      });
      return true;
    }

    var bo = timTrongDong(d, function (n) { return laBoSo(n) && chua(n, nut); });
    if (bo) {
      var gt = bo.e.map(giaTri), c1 = 0, laGan = d.kieu === 'gan' && d.e.length === 1 && d.e[0] === bo, nhan, tien = '';
      bo.e.forEach(function (x, c) { if (x === nut || chua(x, nut)) c1 = c; });
      if (laGan && d.dich.length === gt.length && gt.length > 1) nhan = d.dich.slice();                     // a, b = (2, 3): mỗi ô rơi vào một tên
      else if (laGan && d.dich.length === 1) nhan = gt.map(function (v, k) { return d.dich[0] + '[' + k + ']'; });
      else nhan = gt.map(function (v, k) { return '[' + k + ']'; });
      if (laGan) tien = d.dich.join(', ') + ' = ';
      moBo({
        nhan: nhan, tien: tien, gt: gt, c: c1, soMax: o.soMax, tach: laGan && d.dich.length === gt.length && gt.length > 1,
        choAm: !!o.choAm || gt.some(function (v) { return v < 0; }),
        khiXong: function (moi) {
          if (moi.join() === gt.join()) return;
          bo.e = moi.map(nutSo);
          inLai();
        }
      });
      return true;
    }

    var chi = timTrongDong(d, function (n) {
      return n.t === 'chi' && n.o.t === 'chi' && n.o.o.t === 'la' && /^[A-Za-z_]\w*$/.test(n.o.o.v) && laSoNguyen(n.i) && laSoNguyen(n.o.i) &&
        (nut === n.i || nut === n.o.i || nut === n.o.o);
    });
    if (chi) {
      var tenG = chi.o.o.v, lg = luoiCuaTen(o.lay(), i, tenG);
      if (!lg) return false;
      var kr = -1, kc = -1;
      d.o.forEach(function (x, k) { if (x && x.nut === chi.o.i) kr = k; if (x && x.nut === chi.i) kc = k; });
      if (kr < 0 || kc < 0) return false;
      moLuoi({
        kieu: 'chon', ten: tenG, luoi: lg, r: +chi.o.i.v, c: +chi.i.v,
        khiChon: function (r, c) {
          if (r === +chi.o.i.v && c === +chi.i.v) return;
          d.doi(kr, String(r));
          o.dat(d.doi(kc, String(c)));
        }
      });
      return true;
    }
    return false;
  }

  /** Lời giải của màn đang chơi giữ `ten = set()` rỗng (bài dạy s.add): tập hợp phải bắt đầu rỗng, bảng không cho bỏ thẻ thẳng vào. */
  function rongTheoLoiGiai(ten) {
    try {
      var tt = window.Choi && window.Choi.trangThai && window.Choi.trangThai(), man = tt && tt.man, lg = man && (man.manGoc || man).loiGiai;
      if (!lg) return false;
      var dong = [].concat(lg.chinh || []);
      [].concat(lg.hamCuaMan || [], lg.hamCuaEmMoi || []).forEach(function (f) { dong = dong.concat(f.than || []); });
      var re = new RegExp('^\\s*' + ten + '\\s*=\\s*set\\(\\)\\s*$');
      return dong.some(function (x) { return re.test(chuoi(x)); });
    } catch (e) { return false; }
  }

  /* ------------------------------------------------------------- nối với editor: dòng từ điển / tập hợp */
  /**
   * Editor chạm ô kk (phần tử `so`) của dòng từ điển / tập hợp d (TP.tachTD). Trả true nếu bảng dữ liệu nhận.
   * o: { lay: () => mảng dòng, dat: fn(dòng mới), khoa: [khoá chữ của màn, không nháy] }.
   */
  function chanTD(so, i, d, kk, o) {
    if (!window.TP || !d || d.loai !== 'td') return false;
    var vai = d.vt[kk], ten = d.ds[0], arr = o.lay() || [];
    function don(v) { return RE_SO.test(v) || RE_CHU.test(v); }
    var khoaChu = (o.khoa || []).map(function (k) { return '"' + k + '"'; });

    if (d.kieu === 'ganDict') {
      if (vai === 'ten') return false;
      var cap = [], sel = { i: 0, phan: 'v' };
      for (var k = 1; k + 1 < d.ds.length; k += 2) {
        cap.push([d.ds[k], d.ds[k + 1]]);
        if (kk === k) sel = { i: cap.length - 1, phan: 'k' };
        if (kk === k + 1) sel = { i: cap.length - 1, phan: 'v' };
      }
      if (!cap.every(function (c) { return don(c[0]) && don(c[1]); })) return false;
      var goc = JSON.stringify(cap);
      var giaChu = cap.map(function (c) { return c[1]; }).filter(function (v) { return RE_CHU.test(v); });
      chuTrongDong(arr).forEach(function (s) { if (khoaChu.indexOf(s) < 0 && giaChu.indexOf(s) < 0) giaChu.push(s); });
      cap.forEach(function (c) { if (RE_CHU.test(c[0]) && khoaChu.indexOf(c[0]) < 0) khoaChu.push(c[0]); });
      moTuDien({
        ten: ten, cap: cap, sel: sel, khoaChu: khoaChu, giaChu: giaChu,
        khiXong: function (moi) {
          if (JSON.stringify(moi) === goc) return;
          var x = [ten]; moi.forEach(function (c) { x.push(c[0], c[1]); });
          o.dat(d.ghep(x));
        }
      });
      return true;
    }

    if (d.kieu === 'ganSet') {
      if (vai === 'ten') return false;
      var pt = d.ds.slice(1).filter(function (v, k) { return d.vt[k + 1] !== 'them'; });
      if (!pt.every(don)) return false;
      var chu = khoaChu.slice();
      chuTrongDong(arr).forEach(function (s) { if (chu.indexOf(s) < 0) chu.push(s); });
      var dungChu = pt.length ? RE_CHU.test(pt[0]) : arr.some(function (s) { return new RegExp('\\b' + ten + '\\.add\\(\\s*"').test(chuoi(s)); });
      moTapHop({
        ten: ten, pt: pt, c: Math.max(0, kk - 1), chu: chu, dungChu: dungChu, khoaRong: !pt.length && rongTheoLoiGiai(ten),
        khiXong: function (moi) {
          if (moi.join() === pt.join()) return;
          o.dat(d.ghep([ten].concat(moi)));
        }
      });
      return true;
    }

    if (d.kieu === 'add' && kk === 1 && RE_CHU.test(d.ds[1]) && window.TP.chonChuoi) {                      // s.add("a"): chọn chuỗi khác
      var ds = khoaChu.slice();
      chuTrongDong(arr).forEach(function (s) { if (ds.indexOf(s) < 0) ds.push(s); });
      if (ds.length < 2) return false;
      window.TP.chonChuoi({ neo: so, kieu: 'bien', gia: '', hien: d.ds[1], bien: ds, khiChon: function (x) { var y = d.ds.slice(); y[1] = x; o.dat(d.ghep(y)); } });
      return true;
    }
    return false;
  }

  /* ------------------------------------------------------------- khung bảng dùng chung */
  function dong() {
    if (!cur) return;
    window.removeEventListener('keydown', cur.phim, true);
    if (cur.nen.parentNode) cur.nen.parentNode.removeChild(cur.nen);
    cur = null;
  }

  /** Dựng khung. o: { lop, td, nut: chữ nút (mặc định 'Xong'), nhan: aria-label, khiXong() }. Trả { code, than, nhac, ban, thao, hien() }. */
  function vo(o) {
    dong();
    if (window.TP && window.TP.dongChonSo) window.TP.dongChonSo();
    var nen = h('div', 'bdl-nen'); nen.setAttribute('data-nut', 'bang-du-lieu');
    var bang = h('div', 'bdl ' + o.lop); bang.setAttribute('role', 'dialog'); bang.setAttribute('aria-modal', 'true'); bang.setAttribute('aria-label', o.nhan || o.td);
    nen.appendChild(bang);
    var dau = h('div', 'bdl-dau'), nutXong = h('button', 'bdl-xong', o.nut || 'Xong'); nutXong.setAttribute('data-nut', 'bdl-xong');
    dau.appendChild(h('div', 'bdl-td', o.td)); dau.appendChild(nutXong); bang.appendChild(dau);
    var k = { code: h('div', 'bdl-code'), than: h('div', 'bdl-than'), nhac: h('div', 'bdl-nhac'), ban: h('div', 'bdl-ban'), thao: h('div', 'bdl-thao') };
    k.code.setAttribute('data-nut', 'bdl-code'); k.ban.setAttribute('data-nut', 'bdl-ban');
    [k.code, k.than, k.nhac, k.ban, k.thao].forEach(function (e) { bang.appendChild(e); });
    function xong() { dong(); if (o.khiXong) o.khiXong(); }
    nutXong.addEventListener('click', xong);
    nen.addEventListener('pointerdown', function (ev) { if (ev.target === nen) { ev.preventDefault(); xong(); } });
    cur = {
      nen: nen,
      phim: function (ev) {
        if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); dong(); }
        else if (ev.key === 'Enter') { ev.preventDefault(); ev.stopPropagation(); xong(); }
      }
    };
    window.addEventListener('keydown', cur.phim, true);
    k.hien = function () {
      (document.getElementById('stage') || document.body).appendChild(nen);
      try { nutXong.focus({ preventScroll: true }); } catch (e) { /* bỏ qua */ }
    };
    return k;
  }
  /** Thêm một mẩu code vào dòng xem trước: lop 'ten' | 'pu' | 'so'; dam: ô đang chọn. */
  function c1(cha, lop, txt, dam) { var e = h(dam ? 'b' : 'span', 'bdl-c-' + lop, txt); cha.appendChild(e); return e; }
  /** Bàn số 0…soMax. dang: số đang có (null: không tô). */
  function banSo(ban, dang, soMax, khiChon) {
    ban.className = 'bdl-ban';
    for (var n = 0; n <= soMax; n++) {
      (function (n) {
        var b = h('button', 'bdl-so' + (dang !== null && Math.abs(dang) === n ? ' on' : ''), String(n)); b.setAttribute('data-so', n);
        b.addEventListener('click', function () { khiChon(n); });
        ban.appendChild(b);
      })(n);
    }
  }
  /** Bàn chuỗi: mỗi chuỗi một thẻ. */
  function banChu(ban, ds, dang, khiChon, tat) {
    ban.className = 'bdl-ban chu';
    ds.forEach(function (s) {
      var b = h('button', 'bdl-so chu' + (s === dang ? ' on' : ''), s); b.setAttribute('data-chu', s); b.disabled = !!(tat && tat(s));
      b.addEventListener('click', function () { khiChon(s); });
      ban.appendChild(b);
    });
  }
  function nutThao(thao, chu, ma, tat, fn) {
    var b = h('button', 'bdl-nut ' + ma, chu); b.setAttribute('data-nut', 'bdl-' + ma); b.disabled = !!tat;
    b.addEventListener('click', fn);
    thao.appendChild(b);
    return b;
  }
  function gioiHanSo(n) { return Math.max(9, Math.min(n || 9, 12)); }

  /* ------------------------------------------------------------- LIST LỒNG */
  /**
   * o: { kieu: 'sua' | 'chon', ten ('' nếu lưới đặt thẳng trong lời gọi), luoi: số[][], r, c: ô đang chọn,
   *      soMax, choAm, khiXong(lưới mới) (kiểu 'sua'), khiChon(r, c) (kiểu 'chon': chạm một ô) }.
   */
  function moLuoi(o) {
    var sua = o.kieu === 'sua', xem = o.kieu === 'xem', ten = o.ten || '', soMax = gioiHanSo(o.soMax);
    var SI = xem ? Math.max(0, Math.min(o.si || 0, o.cacSan.length - 1)) : 0;                    // kiểu 'xem': lưới do sân cấp, o.cacSan = lưới của từng sân
    var luoi = (xem ? o.cacSan[SI] : o.luoi).map(function (r) { return r.slice(); });
    var R = Math.max(0, Math.min(o.r || 0, luoi.length - 1)), C = Math.max(0, Math.min(o.c || 0, luoi[R].length - 1));
    var k = vo({ lop: sua ? 'bdl-sua' : xem ? 'bdl-xem' : 'bdl-chon', td: sua ? 'Lưới' + (ten ? ' ' + ten : '') : xem ? 'Lưới ' + ten + ' · do sân cấp' : 'Chạm ô cần đọc', nut: sua ? 'Xong' : 'Đóng',
      nhan: sua ? 'Bảng dữ liệu: sửa lưới' : xem ? 'Bảng dữ liệu: lưới của từng sân' : 'Bảng dữ liệu: chọn ô', khiXong: function () { if (sua) o.khiXong(luoi); } });
    k.than.className = 'bdl-than bdl-khung';
    function soCot() { return luoi.reduce(function (m, r) { return Math.max(m, r.length); }, 0); }
    function nhanO(r, c) { return (ten || 'lưới') + '[' + r + '][' + c + ']'; }

    function veCode() {
      var code = k.code; code.textContent = '';
      if (!sua && !xem) { c1(code, 'ten', ten); c1(code, 'pu', '['); c1(code, 'so', String(R), true); c1(code, 'pu', ']['); c1(code, 'so', String(C), true); c1(code, 'pu', ']'); return; }
      if (ten) { c1(code, 'ten', ten); c1(code, 'pu', ' = '); }
      c1(code, 'pu', '[');
      luoi.forEach(function (hang, r) {
        var g = h('span', 'bdl-c-nhom' + (r === R ? ' on' : ''));
        c1(g, 'pu', '[');
        hang.forEach(function (v, c) { if (c) c1(g, 'pu', ', '); c1(g, 'so', String(v), r === R && c === C); });
        c1(g, 'pu', ']');
        code.appendChild(g);
        if (r < luoi.length - 1) c1(code, 'pu', ', ');
      });
      c1(code, 'pu', ']');
    }
    function veLuoi() {
      var n = soCot(), khung = k.than;
      khung.textContent = '';
      khung.style.setProperty('--bdl-cot', n);
      khung.classList.toggle('day', luoi.length > 4);
      khung.appendChild(h('span', 'bdl-goc'));
      for (var c = 0; c < n; c++) khung.appendChild(h('span', 'bdl-chi cot' + (c === C ? ' on' : ''), '[' + c + ']'));
      luoi.forEach(function (hang, r) {
        khung.appendChild(h('span', 'bdl-chi hang' + (r === R ? ' on' : ''), (ten || '') + '[' + r + ']'));
        for (var c2 = 0; c2 < n; c2++) {
          if (c2 >= hang.length) { khung.appendChild(h('span', 'bdl-trong')); continue; }
          (function (r, c) {
            var b = h('button', 'bdl-o' + (r === R && c === C ? ' on' : ''), String(hang[c]));
            b.setAttribute('data-hang', r); b.setAttribute('data-cot', c); b.setAttribute('aria-label', nhanO(r, c) + ' là ' + hang[c]);
            b.addEventListener('click', function () {
              R = r; C = c;
              if (!sua && !xem) { dong(); o.khiChon(r, c); return; }
              ve();
            });
            khung.appendChild(b);
          })(r, c2);
        }
      });
    }
    function veBan() {
      var dang = luoi[R][C];
      k.ban.textContent = '';
      banSo(k.ban, dang, soMax, function (n) {
        luoi[R][C] = dang < 0 && n > 0 ? -n : n;
        if (C + 1 < luoi[R].length) C++;                                  // điền xong một ô thì sang ô kế trong hàng, hết hàng thì xuống hàng dưới
        else if (R + 1 < luoi.length) { R++; C = 0; }
        ve();
      });
      k.thao.textContent = '';
      var n2 = soCot();
      function nut(chu, ma, tat, fn) { nutThao(k.thao, chu, ma, tat, function () { fn(); ve(); }); }
      nut('+ hàng', 'them them-hang', luoi.length >= HANG_MAX, function () { luoi.splice(R + 1, 0, luoi[R].slice()); R++; });
      nut('− hàng', 'bo bo-hang', luoi.length <= 1, function () { luoi.splice(R, 1); R = Math.min(R, luoi.length - 1); C = Math.min(C, luoi[R].length - 1); });
      nut('+ cột', 'them them-cot', n2 >= COT_MAX, function () { luoi.forEach(function (hg) { hg.splice(Math.min(C + 1, hg.length), 0, 1); }); C = Math.min(C + 1, luoi[R].length - 1); });
      nut('− cột', 'bo bo-cot', n2 <= 1, function () {
        luoi.forEach(function (hg) { if (hg.length > 1 && C < hg.length) hg.splice(C, 1); });
        C = Math.min(C, luoi[R].length - 1);
      });
      if (o.choAm) nut('±', 'doi-dau', dang === 0, function () { luoi[R][C] = -luoi[R][C]; });
    }
    function ve() {
      veCode(); veLuoi();
      if (sua) { veBan(); k.nhac.textContent = 'Ô đang chọn: ' + nhanO(R, C) + ' · hàng ' + R + ', cột ' + C; }
      else if (xem) { veSan(); k.nhac.textContent = 'Ở sân ' + (SI + 1) + ', ' + nhanO(R, C) + ' là ' + luoi[R][C] + ' · mỗi sân một lưới, không sửa được'; }
      else k.nhac.textContent = nhanO(R, C) + ' đang là ' + luoi[R][C] + ' · hàng trước, cột sau';
    }
    /** Kiểu 'xem': hàng thẻ Sân 1 · Sân 2 … để xem lưới của từng sân. */
    function veSan() {
      k.ban.textContent = ''; k.ban.className = 'bdl-ban san';
      o.cacSan.forEach(function (lg, i) {
        var b = h('button', 'bdl-so san' + (i === SI ? ' on' : ''), 'Sân ' + (i + 1)); b.setAttribute('data-san', i);
        b.addEventListener('click', function () {
          SI = i; luoi = lg.map(function (r) { return r.slice(); });
          R = Math.min(R, luoi.length - 1); C = Math.min(C, luoi[R].length - 1); ve();
        });
        k.ban.appendChild(b);
      });
    }
    if (!sua) k.thao.style.display = 'none';
    if (!sua && !xem) k.ban.style.display = 'none';
    ve(); k.hien();
  }

  /* ------------------------------------------------------------- TUPLE (bộ cố định) */
  /** o: { nhan: [nhãn từng ô], tien: chữ trước dấu ngoặc ('a, b = '), gt: số[], c: ô đang chọn, tach: bool (a, b = …: mỗi ô vào một tên), soMax, choAm, khiXong(số[]) }. */
  function moBo(o) {
    var gt = o.gt.slice(), C = Math.max(0, Math.min(o.c || 0, gt.length - 1)), soMax = gioiHanSo(o.soMax);
    var k = vo({ lop: 'bdl-bo', td: 'Bộ cố định · ' + gt.length + ' ô', nhan: 'Bảng dữ liệu: bộ cố định', khiXong: function () { o.khiXong(gt); } });
    k.than.className = 'bdl-than bdl-day';
    function ve() {
      var code = k.code; code.textContent = '';
      if (o.tien) c1(code, 'ten', o.tien);
      c1(code, 'pu', '(');
      gt.forEach(function (v, c) { if (c) c1(code, 'pu', ', '); c1(code, 'so', String(v), c === C); });
      c1(code, 'pu', ')');
      k.than.textContent = '';
      gt.forEach(function (v, c) {
        var cot = h('div', 'bdl-cot' + (c === C ? ' on' : ''));
        cot.appendChild(h('span', 'bdl-chi', o.nhan[c]));
        if (o.tach) cot.appendChild(h('span', 'bdl-mui', '↑'));
        var b = h('button', 'bdl-o' + (c === C ? ' on' : ''), String(v)); b.setAttribute('data-cot', c); b.setAttribute('aria-label', o.nhan[c] + ' là ' + v);
        b.addEventListener('click', function () { C = c; ve(); });
        cot.insertBefore(b, o.tach ? null : cot.firstChild);                // a, b = (2, 3): tên ở trên, mũi tên, ô ở dưới · p = (2, 3): ô trên, p[0] dưới
        k.than.appendChild(cot);
      });
      k.than.appendChild(h('span', 'bdl-khoa', 'khoá ' + gt.length + ' ô'));
      k.nhac.textContent = o.tach ? o.nhan[C] + ' nhận ô thứ ' + (C + 1) + ' · bộ cố định không thêm, không bỏ ô' : 'Đổi số được · bộ cố định không thêm, không bỏ ô';
      k.ban.textContent = '';
      banSo(k.ban, gt[C], soMax, function (n) { gt[C] = gt[C] < 0 && n > 0 ? -n : n; if (C + 1 < gt.length) C++; ve(); });
      k.thao.textContent = '';
      if (o.choAm) nutThao(k.thao, '±', 'doi-dau', gt[C] === 0, function () { gt[C] = -gt[C]; ve(); });
      k.thao.style.display = o.choAm ? '' : 'none';
    }
    ve(); k.hien();
  }

  /* ------------------------------------------------------------- DICT (từ điển) */
  /** o: { ten, cap: [[khoá, giá trị]] (chữ code: "a" có nháy hay số), sel: { i, phan: 'k' | 'v' }, khoaChu: [khoá chữ chọn được], giaChu: [giá trị chữ chọn được], khiXong(cap) }. */
  function moTuDien(o) {
    var cap = o.cap.map(function (c) { return c.slice(); }), ten = o.ten;
    var S = { i: Math.max(0, Math.min((o.sel && o.sel.i) || 0, cap.length - 1)), phan: (o.sel && o.sel.phan) || 'v' };
    var khoaSo = cap.length > 0 && cap.every(function (c) { return RE_SO.test(c[0]); });
    var k = vo({ lop: 'bdl-td-bang', td: 'Từ điển ' + ten, nhan: 'Bảng dữ liệu: từ điển', khiXong: function () { o.khiXong(cap); } });
    k.than.className = 'bdl-than bdl-cap';
    function trung(i) { return cap.some(function (c, j) { return j < i && c[0] === cap[i][0]; }); }
    function khoaMoi() {
      if (khoaSo) { var m = cap.reduce(function (a, c) { return Math.max(a, +c[0]); }, 0); return String(Math.min(m + 1, 12)); }
      var dung = cap.map(function (c) { return c[0]; });
      return o.khoaChu.filter(function (x) { return dung.indexOf(x) < 0; })[0] || o.khoaChu[0] || '"a"';
    }
    function ve() {
      var code = k.code; code.textContent = '';
      c1(code, 'ten', ten); c1(code, 'pu', ' = {');
      cap.forEach(function (c, i) {
        if (i) c1(code, 'pu', ', ');
        var g = h('span', 'bdl-c-nhom' + (i === S.i ? ' on' : ''));
        c1(g, 'chu', c[0], i === S.i && S.phan === 'k'); c1(g, 'pu', ': '); c1(g, 'so', c[1], i === S.i && S.phan === 'v');
        code.appendChild(g);
      });
      c1(code, 'pu', '}');

      k.than.textContent = '';
      if (!cap.length) k.than.appendChild(h('div', 'bdl-rong', 'Từ điển rỗng · bấm "+ cặp" để thêm'));
      else { k.than.appendChild(h('span', 'bdl-chi', 'khoá')); k.than.appendChild(h('span')); k.than.appendChild(h('span', 'bdl-chi', 'giá trị')); }
      cap.forEach(function (c, i) {
        function o1(phan, txt) {
          var b = h('button', 'bdl-o ' + (phan === 'k' ? 'khoa' : 'gia') + (i === S.i && S.phan === phan ? ' on' : '') + (phan === 'k' && trung(i) ? ' trung' : ''), txt);
          b.setAttribute('data-cap', i); b.setAttribute('data-phan', phan);
          b.addEventListener('click', function () { S = { i: i, phan: phan }; ve(); });
          k.than.appendChild(b);
        }
        o1('k', c[0]); k.than.appendChild(h('span', 'bdl-mui', '→')); o1('v', c[1]);
      });

      k.ban.textContent = ''; k.ban.style.display = cap.length ? '' : 'none';
      if (cap.length) {
        var dang = cap[S.i][S.phan === 'k' ? 0 : 1];
        if (S.phan === 'k') {
          var dung = cap.map(function (c) { return c[0]; });
          if (RE_SO.test(dang)) banSo(k.ban, +dang, 12, function (n) { cap[S.i][0] = String(n); S.phan = 'v'; ve(); });
          else banChu(k.ban, o.khoaChu, dang, function (s) { cap[S.i][0] = s; S.phan = 'v'; ve(); }, function (s) { return s !== dang && dung.indexOf(s) >= 0; });   // khoá đã dùng ở cặp khác: mờ
        } else if (RE_SO.test(dang)) banSo(k.ban, +dang, 12, function (n) { cap[S.i][1] = String(n); ve(); });
        else banChu(k.ban, o.giaChu.indexOf(dang) < 0 ? [dang].concat(o.giaChu) : o.giaChu, dang, function (s) { cap[S.i][1] = s; ve(); });
        var c0 = cap[S.i];
        k.nhac.textContent = trung(S.i) ? 'Khoá ' + c0[0] + ' đã có ở trên: cặp sau ghi đè cặp trước' :
          (S.phan === 'k' ? 'Đang chọn khoá · mỗi khoá chỉ có một lần' : ten + '[' + c0[0] + '] là ' + c0[1]);
      } else k.nhac.textContent = '';

      k.thao.textContent = '';
      nutThao(k.thao, '+ cặp', 'them them-cap', cap.length >= CAP_MAX, function () {
        var mau = cap.length ? cap[cap.length - 1][1] : '1';
        cap.splice(cap.length ? S.i + 1 : 0, 0, [khoaMoi(), RE_SO.test(mau) ? '1' : mau]);
        S = { i: cap.length === 1 ? 0 : S.i + 1, phan: 'v' }; ve();
      });
      nutThao(k.thao, '− cặp', 'bo bo-cap', !cap.length, function () { cap.splice(S.i, 1); S.i = Math.max(0, Math.min(S.i, cap.length - 1)); ve(); });
    }
    ve(); k.hien();
  }

  /* ------------------------------------------------------------- SET (tập hợp) */
  /** o: { ten, pt: [phần tử] (chữ code), c: thẻ đang chọn, chu: [chuỗi chọn được], dungChu: bool (tập hợp rỗng: thẻ mới là chuỗi),
   *       khoaRong: bool (màn dạy s.add: tập hợp rỗng không cho bỏ thẻ thẳng vào), khiXong(pt) }. */
  function moTapHop(o) {
    var pt = o.pt.slice(), ten = o.ten, C = Math.max(0, Math.min(o.c || 0, pt.length - 1));
    var k = vo({ lop: 'bdl-th-bang', td: 'Tập hợp ' + ten, nhan: 'Bảng dữ liệu: tập hợp', khiXong: function () { o.khiXong(pt); } });
    k.than.className = 'bdl-than bdl-tui';
    function trung(i) { return pt.indexOf(pt[i]) < i; }
    function dem() { return pt.filter(function (v, i) { return !trung(i); }).length; }
    function ptMoi() {
      var chu = pt.length ? RE_CHU.test(pt[C]) : !!o.dungChu;
      if (chu) return o.chu.filter(function (x) { return pt.indexOf(x) < 0; })[0] || o.chu[0] || '"a"';
      var n = 1; while (pt.indexOf(String(n)) >= 0 && n < 12) n++;
      return String(n);
    }
    function ve() {
      var code = k.code; code.textContent = '';
      c1(code, 'ten', ten); c1(code, 'pu', ' = ');
      if (!pt.length) { c1(code, 'ten', 'set'); c1(code, 'pu', '()'); }
      else { c1(code, 'pu', '{'); pt.forEach(function (v, i) { if (i) c1(code, 'pu', ', '); c1(code, RE_CHU.test(v) ? 'chu' : 'so', v, i === C); }); c1(code, 'pu', '}'); }

      k.than.textContent = '';
      if (!pt.length) k.than.appendChild(h('div', 'bdl-rong', o.khoaRong ? 'Tập hợp bắt đầu rỗng' : 'Tập hợp rỗng · bấm "+ thêm" để bỏ thẻ vào'));
      pt.forEach(function (v, i) {
        var b = h('button', 'bdl-o the' + (i === C ? ' on' : '') + (trung(i) ? ' trung' : ''), v); b.setAttribute('data-pt', i);
        b.setAttribute('aria-label', v + (trung(i) ? ' (trùng, không tính)' : ''));
        b.addEventListener('click', function () { C = i; ve(); });
        k.than.appendChild(b);
      });

      k.ban.textContent = ''; k.ban.style.display = pt.length ? '' : 'none';
      if (pt.length) {
        var dang = pt[C];
        if (RE_SO.test(dang)) banSo(k.ban, +dang, 12, function (n) { pt[C] = String(n); ve(); });
        else banChu(k.ban, o.chu.indexOf(dang) < 0 ? [dang].concat(o.chu) : o.chu, dang, function (s) { pt[C] = s; ve(); });
      }
      var soTrung = pt.length - dem();
      k.nhac.textContent = '';
      k.nhac.appendChild(h('b', 'bdl-len', 'len(' + ten + ') = ' + dem()));
      if (soTrung) k.nhac.appendChild(h('span', '', ' · ' + soTrung + ' thẻ trùng bị gạch: tập hợp chỉ giữ một'));
      if (o.khoaRong) k.nhac.appendChild(h('span', '', ' · thêm thẻ lúc robot chạy bằng ' + ten + '.add(…)'));

      k.thao.textContent = '';
      nutThao(k.thao, '+ thêm', 'them them-pt', pt.length >= PT_MAX || !!o.khoaRong, function () { pt.splice(pt.length ? C + 1 : 0, 0, ptMoi()); C = pt.length === 1 ? 0 : C + 1; ve(); });
      nutThao(k.thao, '− bỏ', 'bo bo-pt', !pt.length, function () { pt.splice(C, 1); C = Math.max(0, Math.min(C, pt.length - 1)); ve(); });
    }
    ve(); k.hien();
  }

  /** DỮ LIỆU THEO SÂN (man.duLieuSan; man-choi.js xemDuLieu): bảng CHỈ XEM của một dòng dữ liệu do sân cấp, có thẻ Sân 1 · Sân 2 … để so bộ số của từng sân.
   *  o: { dong: [dòng gán của từng sân], si: sân đang xem }. Nhận: lưới (list lồng số), list phẳng, tuple, dict, set. Dòng lạ thì không mở (trả false). */
  function xemSan(o) {
    if (!window.TP || !o || !Array.isArray(o.dong)) return false;
    var ten = null, cac = [];
    for (var i = 0; i < o.dong.length; i++) {
      var dong = chuoi(o.dong[i]).trim(), m = /^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*=(?!=)\s*(.+?)\s*$/.exec(dong); if (!m) return false;
      var n = window.TP.phanTichBT(m[2]), td = n && (n.t === 'ds' || n.t === 'bo') ? null : window.TP.tachTD(dong), x = null;      // set() đọc được như một lời gọi nên vẫn phải thử tachTD
      if (n && laLuoi(n)) x = { kieu: 'luoi', luoi: luoiTuNut(n) };
      else if (n && (n.t === 'ds' || n.t === 'bo')) x = { kieu: n.t === 'bo' ? 'bo' : 'list', pt: n.e.map(window.TP.inBT) };
      else if (td && td.kieu === 'ganDict') { x = { kieu: 'dict', cap: [] }; for (var k = 1; k + 1 < td.ds.length; k += 2) x.cap.push([td.ds[k], td.ds[k + 1]]); }
      else if (td && td.kieu === 'ganSet') x = { kieu: 'set', pt: td.ds.slice(1).filter(function (v, j) { return td.vt[j + 1] !== 'them'; }) };
      if (!x) x = { kieu: 'tho' };                                         // vế phải không phải dữ liệu đặt thẳng (a, b = max((2, 1), (2, 3))): chỉ hiện dòng code của từng sân
      x.dong = dong; ten = ten || m[1].replace(/\s*,\s*/g, ', '); cac.push(x);
    }
    if (cac.every(function (c) { return c.kieu === 'luoi'; })) { moLuoi({ kieu: 'xem', ten: ten, cacSan: cac.map(function (c) { return c.luoi; }), si: o.si || 0, r: 0, c: 0 }); return true; }
    if (cac.some(function (c) { return c.kieu === 'luoi'; })) return false;
    moXem({ ten: ten, cac: cac, si: o.si || 0 });
    return true;
  }
  /** Bảng chỉ xem cho list phẳng / tuple / dict / set của từng sân. o: { ten: vế trái, cac: [{ kieu, dong, pt | cap }], si }. */
  function moXem(o) {
    var SI = Math.max(0, Math.min(o.si || 0, o.cac.length - 1)), nhieuTen = o.ten.indexOf(',') >= 0;
    var TD = { list: 'Danh sách', bo: 'Bộ cố định', dict: 'Từ điển', set: 'Tập hợp', tho: 'Dữ liệu' };
    var k = vo({ lop: 'bdl-xem', td: TD[o.cac[0].kieu] + ' ' + o.ten + ' · do sân cấp', nut: 'Đóng', nhan: 'Bảng dữ liệu: dữ liệu của từng sân' });
    k.thao.style.display = 'none';
    function o1(cha, lop, txt) { var b = h('button', 'bdl-o ' + lop, txt); b.disabled = true; cha.appendChild(b); return b; }
    function ve() {
      var c = o.cac[SI], them = '';
      k.code.textContent = c.dong;
      k.than.textContent = '';
      if (c.kieu === 'tho') {
        k.than.className = 'bdl-than'; k.than.style.display = 'none';
      } else if (c.kieu === 'list' || c.kieu === 'bo') {
        k.than.className = 'bdl-than bdl-day';
        var tenO = nhieuTen ? o.ten.split(',').map(function (x) { return x.trim(); }) : null;
        c.pt.forEach(function (v, i) {
          var cot = h('div', 'bdl-cot');
          o1(cot, '', v); cot.appendChild(h('span', 'bdl-chi', tenO && tenO[i] ? tenO[i] : o.ten + '[' + i + ']'));
          k.than.appendChild(cot);
        });
        if (!c.pt.length) k.than.appendChild(h('div', 'bdl-rong', 'Danh sách rỗng'));
        if (c.kieu === 'bo') k.than.appendChild(h('span', 'bdl-khoa', 'khoá ' + c.pt.length + ' ô'));
        them = c.kieu === 'list' ? 'len(' + o.ten + ') = ' + c.pt.length + ' · ' : '';
      } else if (c.kieu === 'dict') {
        k.than.className = 'bdl-than bdl-cap';
        if (!c.cap.length) k.than.appendChild(h('div', 'bdl-rong', 'Từ điển rỗng'));
        else { k.than.appendChild(h('span', 'bdl-chi', 'khoá')); k.than.appendChild(h('span')); k.than.appendChild(h('span', 'bdl-chi', 'giá trị')); }
        c.cap.forEach(function (cp) { o1(k.than, 'khoa', cp[0]); k.than.appendChild(h('span', 'bdl-mui', '→')); o1(k.than, 'gia', cp[1]); });
      } else {
        k.than.className = 'bdl-than bdl-tui';
        if (!c.pt.length) k.than.appendChild(h('div', 'bdl-rong', 'Tập hợp rỗng'));
        var dem = 0;
        c.pt.forEach(function (v, i) { var trung = c.pt.indexOf(v) < i; if (!trung) dem++; o1(k.than, 'the' + (trung ? ' trung' : ''), v); });
        them = 'len(' + o.ten + ') = ' + dem + ' · ';
      }
      k.nhac.textContent = them + 'Sân ' + (SI + 1) + ' · mỗi sân một bộ số, không sửa được';
      k.ban.textContent = ''; k.ban.className = 'bdl-ban san';
      o.cac.forEach(function (x, i) {
        var b = h('button', 'bdl-so san' + (i === SI ? ' on' : ''), 'Sân ' + (i + 1)); b.setAttribute('data-san', i);
        b.addEventListener('click', function () { SI = i; ve(); });
        k.ban.appendChild(b);
      });
    }
    ve(); k.hien();
  }

  window.BangDuLieu = {
    xemSan: xemSan, moXem: moXem,
    chan: chan, chanTD: chanTD, moLuoi: moLuoi, moBo: moBo, moTuDien: moTuDien, moTapHop: moTapHop,
    dong: dong, dangMo: function () { return !!cur; }, laLuoi: laLuoi, inLuoi: inLuoi, luoiCuaTen: luoiCuaTen
  };
})();
