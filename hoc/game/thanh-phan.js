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

  var TAY_TEN = ['arm_down', 'arm_up', 'grab', 'release'];     // lệnh tay gắp: nhóm TAY (màu cam) trong kho khối
  var DAY_TEN = ['push'];                                      // lệnh tấm đẩy: nhóm ĐẨY (cùng màu cam với tay) trong kho khối
  function lopMau(ten) {
    if (ten === 'left_move' || ten === 'right_move' || ten === 'left_back' || ten === 'right_back') return 'cy';
    if (ten === 'wait') return 'yl';
    if (TAY_TEN.indexOf(ten) >= 0 || DAY_TEN.indexOf(ten) >= 0) return 'tay';
    if (/^go_/.test(ten)) return 'chan';
    if (/^slide_/.test(ten)) return 'truot';
    return 'gr';
  }
  /* ---- thụt lề: mỗi dòng trong mảng giữ dấu cách đầu dòng (4 dấu cách = 1 bậc); khung vẽ bậc bằng lề trái */
  var BUOC = 4, BAC_TOI_DA = 2, BUOC_PX = 10;
  function chuoi(s) { return s === undefined || s === null ? '' : String(s); }
  function bacCua(s) { return Math.floor(/^ */.exec(chuoi(s))[0].length / BUOC); }
  function boThut(s) { return chuoi(s).replace(/^[ \t]+/, ''); }
  function datBac(s, b) { return new Array(b * BUOC + 1).join(' ') + boThut(s); }
  /** Dòng có nghĩa: không trống, không phải chú thích. */
  function coY(s) { var x = boThut(s).trim(); return x !== '' && x.charAt(0) !== '#'; }
  /** Dòng mở khối (kết thúc bằng dấu ":"), ví dụ `for i in range(2):`. */
  function moKhoi(s) { return coY(s) && /:\s*(#.*)?$/.test(boThut(s)); }
  /** Bậc thụt tối đa của dòng thứ i: bậc dòng có nghĩa ở trên (+1 nếu nó mở khối), không quá BAC_TOI_DA; dòng đầu là 0. */
  function toiDaBac(arr, i) {
    for (var j = i - 1; j >= 0; j--) if (coY(arr[j])) return Math.min(BAC_TOI_DA, bacCua(arr[j]) + (moKhoi(arr[j]) ? 1 : 0));
    return 0;
  }
  /** Kẹp bậc từng dòng không vượt mức hợp lệ (sau khi chèn / xóa / đổi chỗ / thụt dòng). Thụt thiếu thì giữ nguyên để lõi báo lỗi. */
  function chuanHoaBac(arr) {
    for (var i = 0; i < arr.length; i++) {
      if (!boThut(arr[i]).trim()) continue;
      var m = toiDaBac(arr, i);
      if (bacCua(arr[i]) > m) arr[i] = datBac(arr[i], m);
    }
    return arr;
  }
  /** Dòng `if …:` / `elif …:` / `else:` (khối rẽ nhánh). */
  function laRe(s) { return /^\s*(if|elif|else)\b/.test(chuoi(s)); }
  /** Dòng `elif` / `else` (chỉ có nghĩa khi đứng ngay dưới một khối if / elif cùng bậc). */
  function laNhanhPhu(s) { return /^\s*(elif|else)\b/.test(chuoi(s)); }
  /** Màn có cấu trúc `k` (vd. 'for') không. Chưa có trường cauTruc thì coi như []. */
  function coCauTruc(man, k) { return !!(man && Array.isArray(man.cauTruc) && man.cauTruc.indexOf(k) >= 0); }

  /* ---- đối số của một dòng: `for i in range(n):` (một đối số) hoặc lời gọi `ten(a, b)`. Số hoặc tên biến đơn giản là "ô chạm được" (.num). */
  var RE_FOR_DS = /^(\s*for\s+[A-Za-z_]\w*\s+in\s+range\()([^)]*)(\):.*)$/;
  var RE_FOR_CH = /^(\s*for\s+[A-Za-z_]\w*\s+in\s+)("[^"]*"|[A-Za-z_]\w*)(\s*:.*)$/;                       // for c in "UUR": / for c in path:
  var RE_IF_DS = /^(\s*(?:if|elif)\s+)([A-Za-z_]\w*)(\s*==\s*)("[^"]*"|[A-Za-z_]\w*)(\s*:.*)$/;            // if d == "U": / elif d == "D":
  var RE_DK = /^(\s*(?:while|if|elif)\s+)((?:not\s+)?[A-Za-z_]\w*\(\)|True|False)(\s*:.*)$/;                        // while front_clear(): / if not right_clear(): / while True:
  var RE_GOI_DS = /^(\s*([A-Za-z_]\w*)\()([^)]*)(\).*)$/;
  var RE_SO = /^\d+$/, RE_BIEN = /^[A-Za-z_]\w*$/, RE_CHUOI = /^"[^"]*"$/;

  /* ---- chương CẢM BIẾN MÀU: điều kiện của while / if / elif gồm một hay hai vế nối bằng and / or.
     Vế là: lời gọi cảm biến (`front_clear()`, `not left_clear()`) hoặc phép so sánh màu `color() != "red"` / `c == "green"` / `color() != c`.
     Chế độ này chỉ bật ở màn có color() (TP.datCheMau): các chương cũ giữ nguyên cách tách dòng. */
  var CHE_MAU = false;
  var MAU_DS = ['red', 'green', 'blue', 'yellow', 'none'];                                   // các giá trị color() có thể trả về
  var MAU_LOP = { red: 'g-rd', green: 'g-gr', blue: 'g-bl', yellow: 'g-yl', none: 'g-gy' };
  var RE_DKM = /^(\s*(?:while|if|elif)\s+)([^:]+?)(\s*:.*)$/;
  var RE_CL_SS = /^(color\(\)|[A-Za-z_]\w*)\s*(==|!=)\s*("[^"]*"|[A-Za-z_]\w*(?:\(\))?)$/;
  var RE_CL_CAM = /^(?:not\s+)?[A-Za-z_]\w*\(\)$|^(?:True|False)$/;
  var RE_GAN_MAU = /^\s*([A-Za-z_]\w*)\s*=\s*color\(\)\s*(#.*)?$/;                           // c = color()
  function datCheMau(b) { CHE_MAU = !!b; }
  /** Màn có cảm biến màu (hamGoc có color). */
  function coMauCua(man) { return ((man && man.hamGoc) || []).indexOf('color') >= 0; }
  /** Tách điều kiện màu của một dòng while / if / elif: { loai: 'dkm', tien, hau, ds: [chữ từng ô], tok: [{ vt: 'cam' | 'lhs' | 'op' | 'rhs' | 'noi', ci: vế, t }], cl: [vế], nx: [and | or] } hoặc null. */
  function tachDKM(dong) {
    var m = RE_DKM.exec(chuoi(dong)); if (!m) return null;
    var parts = m[2].trim().split(/\s+(and|or)\s+/), cl = [], nx = [], tok = [], i;
    for (i = 0; i < parts.length; i++) { if (i % 2) nx.push(parts[i]); else cl.push(parts[i].trim()); }
    if (cl.length > 2) return null;
    for (i = 0; i < cl.length; i++) {
      var ss = RE_CL_SS.exec(cl[i]);
      if (i) tok.push({ vt: 'noi', ci: i, t: nx[i - 1] });
      if (ss) tok.push({ vt: 'lhs', ci: i, t: ss[1] }, { vt: 'op', ci: i, t: ss[2] }, { vt: 'rhs', ci: i, t: ss[3] });
      else if (RE_CL_CAM.test(cl[i])) tok.push({ vt: 'cam', ci: i, t: cl[i] });
      else return null;
    }
    return { loai: 'dkm', ten: '', tien: m[1], ds: tok.map(function (x) { return x.t; }), noi: ' ', hau: m[3], laFor: false, tok: tok, cl: cl, nx: nx };
  }
  function ghepDKM(d, cl, nx) {
    var kq = cl[0];
    for (var i = 1; i < cl.length; i++) kq += ' ' + nx[i - 1] + ' ' + cl[i];
    return d.tien + kq + d.hau;
  }
  /** Thay vế ci của dòng bằng chuỗi `str` (vd. `color() != "red"`). */
  function thayVe(dong, ci, str) {
    var d = tachDKM(dong); if (!d || ci < 0 || ci >= d.cl.length) return dong;
    d.cl[ci] = str; return ghepDKM(d, d.cl, d.nx);
  }
  /** Nối thêm một vế (nx = 'and' | 'or') vào cuối điều kiện (tối đa hai vế). */
  function themVe(dong, nx, str) {
    var d = tachDKM(dong); if (!d || d.cl.length >= 2) return dong;
    d.cl.push(str); d.nx.push(nx); return ghepDKM(d, d.cl, d.nx);
  }
  /** Bỏ vế ci (cùng chữ nối của nó) khỏi điều kiện có hai vế. */
  function boVe(dong, ci) {
    var d = tachDKM(dong); if (!d || d.cl.length < 2) return dong;
    d.cl.splice(ci, 1); d.nx.splice(ci === 0 ? 0 : ci - 1, 1); return ghepDKM(d, d.cl, d.nx);
  }
  /** Tên biến đã gán bằng color() ở các dòng phía trên dòng i (hoặc mọi dòng nếu i âm). */
  function bienGanMau(arr, i) {
    var kq = [], j, m;
    for (j = 0; j < arr.length && (i < 0 || j < i); j++) if ((m = RE_GAN_MAU.exec(chuoi(arr[j]))) && kq.indexOf(m[1]) < 0) kq.push(m[1]);
    return kq;
  }
  /** { loai: 'range' | 'forChuoi' | 'if' | 'dk' (điều kiện cảm biến của while / if / elif) | 'goi', ten (tên hàm được gọi), tien, ds: [chuỗi đối số], noi (chuỗi nối các đối số), hau, laFor } hoặc null nếu dòng không có ngoặc đối số. */
  function tachDoiSo(dong) {
    dong = chuoi(dong);
    if (CHE_MAU) { var dm = tachDKM(dong); if (dm) return dm; }
    var m = RE_FOR_DS.exec(dong);
    if (m) return { loai: 'range', ten: '', tien: m[1], ds: m[2].trim() === '' ? [] : m[2].split(',').map(function (x) { return x.trim(); }), noi: ', ', hau: m[3], laFor: true };
    m = RE_FOR_CH.exec(dong);
    if (m) return { loai: 'forChuoi', ten: '', tien: m[1], ds: [m[2]], noi: ', ', hau: m[3], laFor: true };
    m = RE_IF_DS.exec(dong);
    if (m) return { loai: 'if', ten: '', tien: m[1], ds: [m[2], m[4]], noi: m[3], hau: m[5], laFor: false };
    m = RE_DK.exec(dong);
    if (m) return { loai: 'dk', ten: '', tien: m[1], ds: [m[2]], noi: ', ', hau: m[3], laFor: false };
    m = RE_GOI_DS.exec(dong);
    if (!m) return null;
    return { loai: 'goi', ten: m[2], tien: m[1], ds: m[3].trim() === '' ? [] : m[3].split(',').map(function (x) { return x.trim(); }), noi: ', ', hau: m[4], laFor: false };
  }
  /** Thay đối số thứ k của dòng bằng v (số, tên biến hoặc chuỗi có nháy); dòng không đổi nếu không có đối số k. */
  function thayDoiSo(dong, k, v) {
    var d = tachDoiSo(dong);
    if (!d || k < 0 || k >= d.ds.length) return dong;
    d.ds[k] = String(v);
    return d.tien + d.ds.join(d.noi) + d.hau;
  }
  /** Ô chạm được của đối số: số (data-so), chuỗi có nháy (data-chuoi) hoặc tên biến (data-bien); k = thứ tự trong dòng. */
  function oDoiSo(v, k) {
    if (RE_SO.test(v)) return '<span class="num" data-k="' + k + '" data-so="' + v + '">' + v + '</span>';
    if (RE_CHUOI.test(v)) return '<span class="num chuoi" data-k="' + k + '" data-so="0" data-chuoi="' + esc(v.slice(1, -1)) + '">' + esc(v) + '</span>';
    if (RE_BIEN.test(v)) return '<span class="num bien" data-k="' + k + '" data-so="0" data-bien="' + esc(v) + '">' + esc(v) + '</span>';
    return '<span class="ar">' + esc(v) + '</span>';
  }

  /** Ô chạm được của một phần điều kiện màu (xem tachDKM): vế cảm biến / vế trái (teal), phép so sánh (== / !=), vế phải (màu hay biến), chữ nối and / or. */
  function oDkm(o, k) {
    var t = o.t, base = '<span class="num dkc dkm ' + o.vt;
    var at = '" data-k="' + k + '" data-so="0" data-vt="' + o.vt + '" data-dkm="' + esc(t) + '">' + esc(t) + '</span>';
    if (o.vt === 'rhs') {
      var chu = RE_CHUOI.exec(t) ? t.slice(1, -1) : null;
      if (chu !== null) return base + ' chuoi-mau ' + (MAU_DS.indexOf(chu) >= 0 ? 'mc-' + chu : 'mc-sai') + at.replace('data-so="0"', 'data-so="0" data-chuoi="' + esc(chu) + '"');
      return base + ' bien' + at;
    }
    return base + at;
  }
  /** Ô chạm được của điều kiện (front_clear(), not right_clear(), True…): bấm để chọn điều kiện khác. */
  function oDieuKien(v) { return '<span class="num dkc" data-k="0" data-so="0" data-dk="' + esc(v) + '">' + esc(v) + '</span>'; }
  /** Tô màu một dòng code (ngôn ngữ giữ nguyên tiếng Anh). Dấu cách đầu dòng bị bỏ: bậc thụt do khung vẽ bằng lề. */
  function mauDong(text) {
    text = boThut(text);
    if (/^#/.test(text)) return '<span class="cm">' + esc(text) + '</span>';
    if (CHE_MAU) {
      var dkm = tachDKM(text);
      if (dkm) {
        var kw = /^\s*(\w+)/.exec(dkm.tien)[1], ht = '<span class="kw ' + (kw === 'while' ? 'wh' : 'if') + '">' + kw + ' </span>';
        dkm.tok.forEach(function (o, k) { ht += oDkm(o, k) + (o.vt === 'noi' ? '<span class="ngat"></span>' : ''); });       // điều kiện hai vế: xuống dòng sau and / or (hai dòng nhỏ trong một ô)
        return ht + '<span class="pu">:</span>';
      }
      var gm = RE_GAN_MAU.exec(text);
      if (gm) return '<span class="vr">' + esc(gm[1]) + '</span><span class="pu"> = </span><span class="fn">color</span><span class="pu">()</span>';
    }
    var f = /^for\s+([A-Za-z_]\w*)\s+in\s+range\(\s*(\d+|[A-Za-z_]\w*)\s*\):\s*$/.exec(text);
    if (f) {
      return '<span class="kw">for </span><span class="vr">' + esc(f[1]) + ' </span><span class="kw">in </span><span class="fn">range</span>' +
        '<span class="pu">(</span>' + oDoiSo(f[2], 0) + '<span class="pu">):</span>';
    }
    var fc = /^for\s+([A-Za-z_]\w*)\s+in\s+("[^"]*"|[A-Za-z_]\w*)\s*:\s*$/.exec(text);
    if (fc) {
      return '<span class="kw">for </span><span class="vr">' + esc(fc[1]) + ' </span><span class="kw">in </span>' + oDoiSo(fc[2], 0) + '<span class="pu">:</span>';
    }
    var ic = /^(if|elif)\s+([A-Za-z_]\w*)\s*==\s*("[^"]*"|[A-Za-z_]\w*)\s*:\s*$/.exec(text);
    if (ic) {
      return '<span class="kw if">' + ic[1] + ' </span>' + oDoiSo(ic[2], 0) + '<span class="pu"> == </span>' + oDoiSo(ic[3], 1) + '<span class="pu">:</span>';
    }
    var dk = /^(while|if|elif)\s+((?:not\s+)?[A-Za-z_]\w*\(\)|True|False)\s*:\s*$/.exec(text);
    if (dk) return '<span class="kw ' + (dk[1] === 'while' ? 'wh' : 'if') + '">' + dk[1] + ' </span>' + oDieuKien(dk[2]) + '<span class="pu">:</span>';
    if (/^else\s*:\s*$/.test(text)) return '<span class="kw if">else</span><span class="pu">:</span>';
    var m = /^([A-Za-z_]\w*)\((.*)\)\s*$/.exec(text);
    if (!m) return esc(text);
    var cls = m[1] === 'left_move' || m[1] === 'right_move' || m[1] === 'left_back' || m[1] === 'right_back' ? 'mv'
      : m[1] === 'wait' ? 'wt' : TAY_TEN.indexOf(m[1]) >= 0 || DAY_TEN.indexOf(m[1]) >= 0 ? 'ty' : /^go_/.test(m[1]) ? 'mv' : /^slide_/.test(m[1]) ? 'sl' : 'fn';
    var args = m[2].trim() === '' ? '' : m[2].split(',').map(function (x, k) { return oDoiSo(x.trim(), k); }).join('<span class="pu">, </span>');
    return '<span class="' + cls + '">' + esc(m[1]) + '</span><span class="pu">(</span>' + args + '<span class="pu">)</span>';
  }

  /** Dòng dài (chuỗi chữ dài trong `for c in "…":` hay `walk("…")`): co chữ cho vừa ô, không dưới 9px; vẫn tràn thì chuỗi tự rút gọn bằng "…" (CSS .num.chuoi). */
  function vuaDong(el) {
    el.style.fontSize = '';
    if (!el.clientWidth || !el.querySelector('.chuoi, .dkc')) return;
    el.classList.add('ko-cat');                                                    // đo với chuỗi chưa bị cắt
    var fs = parseFloat(getComputedStyle(el).fontSize) || 15;
    while (el.scrollWidth > el.clientWidth + 1 && fs > 9) { fs -= 0.5; el.style.fontSize = fs + "px"; }
    el.classList.remove('ko-cat');
  }

  /* ------------------------------------------------------------- Editor */
  /**
   * Khung 10 ô. tuyChon: { tong: 10, dung: số ô dùng được, lay: () => mảng dòng (sửa tại chỗ),
   *   bang: phần tử panel (để nháy đỏ + chứa thông báo "Đã xóa · Hoàn tác"), dem: phần tử đếm, khiDoi: fn, khiKhoa: fn,
   *   khiBam: fn(i) khi chạm một ô, dangChay: () => bool (đang chạy / phát lại thì tắt xóa nhanh),
   *   nutXoaHet: nút thùng rác ở tiêu đề (Editor tự làm mờ khi không có gì để xóa),
   *   thutLe: () => bool (màn có khối lồng như `for`: tiêu đề có thêm hai nút ⇤ ⇥, đặt ngay trước nutXoaHet),
   *   tt / ttDay / ttNgan: phần tử tiêu đề + chữ đầy đủ + chữ rút gọn (dùng khi tiêu đề không vừa) }
   * Xóa một dòng: chuột rê lên dòng có code thì ô số thứ tự đổi thành ✕ (bấm để xóa);
   * cảm ứng chạm HAI lần liên tiếp (≤ 350 ms) vào dòng có code. Mọi lần xóa đều hiện "Đã xóa · Hoàn tác" ~3 giây.
   * Thụt lề: mỗi dòng trong mảng giữ nguyên dấu cách đầu dòng (4 dấu cách = 1 bậc, tối đa 2 bậc); khung chỉ VẼ bậc bằng lề trái
   * và viền ngoặc tím nối từ dòng `for` tới dòng cuối thân. Khung không cho thụt sâu hơn (dòng trên có nghĩa) + 1 bậc.
   */
  function Editor(host, tuyChon) {
    var tong = tuyChon.tong || 10, dung = tuyChon.dung === undefined ? tong : tuyChon.dung;
    var lay = tuyChon.lay, sel = 0, runIdx = -1, loiSet = {}, lapSet = {}, ed = this;
    var rows = [], strips = [], brks = [], xt = null, viTri = null;
    var hov = -1, kieuCuoi = 'mouse', cham = null, hoan = null, hoanHen = null, hoanEl = null;
    var nutRa = null, nutVao = null, boThutEl = null, thutCu = null;
    this.host = host; this.tong = tong;
    host.innerHTML = '';
    function dangChay() { return !!(tuyChon.dangChay && tuyChon.dangChay()); }
    function choXoa() { return !xt && !dangChay() && !Chan.dang(); }
    function thutLe() { return !!(tuyChon.thutLe && tuyChon.thutLe()); }
    function camDuoc() { return (tuyChon.camBien && tuyChon.camBien()) || []; }                  // hàm cảm biến của màn (front_clear…): điều kiện chạm đổi được
    function bienDuoc() { return (tuyChon.bienDuoc && tuyChon.bienDuoc()) || []; }       // tên các đối số của hàm đang sửa (dùng trong thân hàm)
    function kieuBienCua(ten) { return (tuyChon.kieuBien && tuyChon.kieuBien(ten)) || 'so'; }   // 'so' | 'don' (một chữ) | 'ghep' (chuỗi chữ) của một đối số của hàm đang sửa
    /** Kiểu ô của đối số k trong dòng đã tách d: 'so' | 'don' (một chữ U/D/L/R) | 'ghep' (chuỗi ghép) | 'bien' (ô biến của if) | 'dl' (chữ so sánh của if). */
    function kieuArg(d, k) {
      if (!d || d.loai === 'range') return 'so';
      if (d.loai === 'forChuoi') return 'ghep';
      if (d.loai === 'dk') return 'dk';
      if (d.loai === 'dkm') return 'dkm';
      if (d.loai === 'if') return k === 0 ? 'bien' : 'dl';
      var kd = tuyChon.kieuDoiSo ? tuyChon.kieuDoiSo(d.ten, k) : 'so';
      return kd === 'don' || kd === 'ghep' ? kd : 'so';
    }
    /** Biến kiểu kb có đặt được vào ô kiểu slot không (một chữ đặt được vào chuỗi ghép, ngược lại thì không). */
    function hopKieu(slot, kb) {
      if (slot === 'so') return kb === 'so';
      if (slot === 'don') return kb === 'don';
      if (slot === 'ghep' || slot === 'bien') return kb === 'don' || kb === 'ghep';
      return false;
    }
    /** Tên biến dùng được cho ô kiểu slot của dòng i (hoặc dòng sẽ chèn ở bậc bac): biến vòng for c in "…" bao quanh (trong cùng trước), rồi đối số của hàm đang sửa. */
    function bienTam(slot, i, bac) {
      var arr = lay(), kq = [], j, cap = bac === undefined || bac === null ? bacCua(arr[i]) : bac;
      for (j = i - 1; j >= 0; j--) {
        if (!coY(arr[j])) continue;
        var b = bacCua(arr[j]);
        if (b >= cap) continue;
        cap = b;
        var fc = /^\s*for\s+([A-Za-z_]\w*)\s+in\s+("[^"]*"|[A-Za-z_]\w*)\s*:/.exec(chuoi(arr[j]));
        if (fc && hopKieu(slot, 'don') && kq.indexOf(fc[1]) < 0) kq.push(fc[1]);
      }
      bienDuoc().forEach(function (ten) { if (hopKieu(slot, kieuBienCua(ten)) && kq.indexOf(ten) < 0) kq.push(ten); });
      return kq;
    }
    /** Khối `if d == "U":` mặc định của kho: đổi `d` thành biến có thật ở chỗ chèn (biến vòng for, rồi đối số của hàm đang sửa). */
    function thichNghi(txt, at, bac) {
      var m = /^(\s*(?:if|elif)\s+)d(\s*==.*)$/.exec(txt);
      if (!m) return txt;
      var vs = bienTam('bien', at, bac);
      return vs.length && vs.indexOf('d') < 0 ? m[1] + vs[0] + m[2] : txt;
    }
    /** Bậc của khối if / elif ngay phía trên chỗ chèn at (khối trong cùng còn mở), hoặc -1 nếu không có: `elif` / `else` nhận bậc này. */
    function bacNhanhPhu(arr, at) {
      for (var L = toiDaBac(arr, at); L >= 0; L--) {
        for (var j = at - 1; j >= 0; j--) {
          if (!coY(arr[j])) continue;
          var lv = bacCua(arr[j]);
          if (lv <= L) { if (lv === L && /^\s*(if|elif)\b/.test(chuoi(arr[j]))) return L; break; }
        }
      }
      return -1;
    }
    /** Mở bộ chọn cho ô .num đang chạm (số 1–9 / chữ U D L R / bộ ghép chuỗi). */
    function moBoChon(so, i, kk) {
      var arr = lay(), d = tachDoiSo(arr[i]), kd = kieuArg(d, kk);
      if (kd === 'dkm') { moDkm(so, i, d, kk); return; }
      if (kd === 'dk') {                                                  // điều kiện cảm biến: bảng chọn front_clear() / not front_clear() / …
        if (camDuoc().length) chonDieuKien({ neo: so, ds: camDuoc(), gia: d.ds[kk], khiChon: function (v) { ed.datSo(i, v, kk); } });
        return;
      }
      if (kd === 'so') {
        chonSo({ neo: so, so: +so.getAttribute('data-so'), hien: so.getAttribute('data-bien'), bien: bienTam('so', i), khiChon: function (v) { ed.datSo(i, v, kk); } });
        return;
      }
      var gia = d && d.ds[kk] !== undefined ? d.ds[kk] : '', laChu = RE_CHUOI.test(gia);
      var bien = kd === 'dl' ? [] : bienTam(kd, i);
      if (kd === 'bien' && !bien.length) return;
      chonChuoi({ neo: so, kieu: kd, gia: laChu ? gia.slice(1, -1) : '', hien: laChu ? null : gia, bien: bien, khiChon: function (v) { ed.datSo(i, v, kk); } });
    }
    /** Chạm một ô của điều kiện màu (while / if / elif): == / != và and / or đổi ngay; vế phải chọn màu; vế trái / vế cảm biến mở bảng điều kiện. */
    function moDkm(so, i, d, kk) {
      var o = d.tok[kk]; if (!o) return;
      if (o.vt === 'op') { ed.datSo(i, o.t === '==' ? '!=' : '==', kk); return; }
      if (o.vt === 'noi') { ed.datSo(i, o.t === 'and' ? 'or' : 'and', kk); return; }
      var bien = bienGanMau(lay(), i);
      if (o.vt === 'rhs') {
        chonMau({ neo: so, gia: o.t, bien: bien, khiChon: function (v) { ed.datSo(i, v, kk); } });
        return;
      }
      var cam = camDuoc(), cl = d.cl[o.ci], coDong = d.cl.length;
      chonDkm({
        neo: so, cam: cam, bien: bien, gia: cl,
        ghep: cam.length ? { coThem: coDong < 2 && o.ci === coDong - 1, coBo: coDong > 1 } : null,
        khiChon: function (v) { ed.datVe(i, o.ci, v); },
        khiGhep: function (nx) { ed.themVe(i, nx, /^(?:not\s+)?\w+\(\)$/.test(cl) && cl !== 'color()' ? 'color() != "red"' : (cam[0] + '()')); },
        khiBo: function () { ed.boVe(i, o.ci); }
      });
    }
    function veXx() {
      var n = lay().length, ok = choXoa();
      for (var i = 0; i < tong; i++) rows[i].classList.toggle('xx', ok && i === hov && i < dung && i < n);
    }
    /** Thụt lề dòng đang chọn thêm d bậc (-1 ra, +1 vào) nếu hợp lệ. */
    function doiBac(d) {
      var arr = lay();
      if (dangChay() || Chan.dang() || xt || sel >= dung || sel >= arr.length || !boThut(arr[sel]).trim()) return false;
      var nb = bacCua(arr[sel]) + d;
      if (nb < 0 || nb > toiDaBac(arr, sel)) return false;
      ed.anHoan();
      arr[sel] = datBac(arr[sel], nb); chuanHoaBac(arr);
      ed.render(); ed.hieuUng(sel); tuyChon.khiDoi && tuyChon.khiDoi();
      return true;
    }
    this.doiBac = doiBac;
    if (tuyChon.nutXoaHet && tuyChon.thutLe) {
      boThutEl = h('span', 'thut');
      [['thutra', 'thut-ra', 'choi.thutRa', -1], ['thutvao', 'thut-vao', 'choi.thutVao', 1]].forEach(function (c) {
        var b = h('button', 'bt g-pu thut-nut'); b.setAttribute('data-nut', c[1]); b.setAttribute('aria-label', t(c[2]));
        b.appendChild(Ve.ico(c[0], 2, { line: '#2f1a6a' }));
        b.addEventListener('click', function (ev) { ev.stopPropagation(); doiBac(c[3]); });
        boThutEl.appendChild(b);
        if (c[3] < 0) nutRa = b; else nutVao = b;
      });
      tuyChon.nutXoaHet.parentNode.insertBefore(boThutEl, tuyChon.nutXoaHet);
    }
    for (var i = 0; i < tong; i++) {
      var r = h('div', 'row'), tb = h('div', 'tab'), s = h('div', 'strip empty'), bk = h('div', 'brk');
      tb.appendChild(h('span', 'tn', i + 1));
      var xi = Ve.ico('x5', 2, { fill: '#fff', line: '#5a0e0c' }); xi.className += ' tx'; tb.appendChild(xi);
      r.appendChild(tb); r.appendChild(s); r.appendChild(bk); host.appendChild(r); rows.push(r); strips.push(s); brks.push(bk);
      (function (i) {
        r.addEventListener('click', function (ev) {
          var arr = lay(), kieu = ev.pointerType || kieuCuoi;
          var so = ev.target.closest && ev.target.closest('.num');
          if (so && !xt && i < dung && i < arr.length && !dangChay() && !Chan.dang()) {      // chạm con số trong range(n) / lời gọi hàm: bộ chọn 1–9 (+ biến của hàm)
            cham = null; tuyChon.khiBam && tuyChon.khiBam(i);          // không đổi ô đang chọn: khối kế tiếp vẫn chèn vào chỗ cũ
            moBoChon(so, i, +so.getAttribute('data-k') || 0);
            return;
          }
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

    /** Hai nút ⇤ ⇥: ẩn hẳn nếu màn không có khối lồng; mờ chỗ (giữ chỗ) khi chưa chọn dòng có code; tắt khi không thụt thêm / bớt được. */
    function veThut() {
      if (!boThutEl) return;
      var bat = thutLe() && !xt, arr = lay();
      var co = bat && sel < dung && sel < arr.length && !!boThut(arr[sel]).trim();
      boThutEl.classList.toggle('off', !thutLe());
      boThutEl.classList.toggle('an', !co);
      var b = co ? bacCua(arr[sel]) : 0;
      nutRa.disabled = !co || b <= 0;
      nutVao.disabled = !co || b >= toiDaBac(arr, sel);
      var hien = thutLe();
      if (hien !== thutCu) { thutCu = hien; ed.vuaTieuDe(); }
    }

    this.render = function () {
      var arr = lay(), tx = [], lv = [], sl = [], i;
      for (i = 0; i < tong; i++) {
        var it = xt ? xt[i] : arr[i];
        if (xt && it && it.slot) { tx.push(''); sl.push(true); lv.push(it.bac || 0); }
        else {
          var tt = xt ? (it ? it.t : undefined) : it;
          tx.push(tt); sl.push(false); lv.push(tt === undefined ? 0 : bacCua(tt));
        }
      }
      var cuoiDong = arr.length;                                    // ô trống đang chọn: hiện sẵn bậc thụt mặc định
      for (i = 0; i < tong; i++) {
        var khoa = i >= dung, t = tx[i], slot = sl[i];
        var laFor = !slot && t !== undefined && /^\s*for\s/.test(t), laIf = !slot && t !== undefined && laRe(t), laWh = !slot && t !== undefined && /^\s*while\s/.test(t);
        strips[i].className = 'strip' + (khoa ? ' lock' : (slot ? ' slot' : (t === undefined ? ' empty' : ''))) + (laFor ? ' for' : '') + (laIf ? ' if' : '') + (laWh ? ' wh' : '') + (!khoa && !slot && t !== undefined && CHE_MAU && (tachDKM(t) || { cl: [] }).cl.length === 2 ? ' hai' : '') +
          (!xt && runIdx === i ? ' on' : '') + (!xt && loiSet[i] ? ' err' : '');
        strips[i].innerHTML = '';
        var bac = lv[i];
        if (!khoa && !xt && t === undefined && i === sel && i >= cuoiDong && thutLe()) bac = ed.bacMacDinh(cuoiDong);
        strips[i].style.marginLeft = (!khoa && bac && (t !== undefined || slot || i === sel)) ? Math.min(bac, 3) * BUOC_PX + 'px' : '';
        if (khoa) strips[i].appendChild(Ve.khoa(2, true));
        else if (t !== undefined && !slot) { strips[i].innerHTML = mauDong(t); vuaDong(strips[i]); }
        if (!khoa && !xt && lapSet[i]) strips[i].appendChild(h('span', 'lap', lapSet[i]));
        rows[i].classList.toggle('sel', !xt && i === sel && !khoa);
        rows[i].classList.toggle('run', !xt && runIdx === i);
        brks[i].innerHTML = '';
      }
      // viền ngoặc tím: từ dòng mở khối (for) xuống dòng cuối của thân (các dòng thụt sâu hơn nó)
      var gioiHan = Math.min(tong, dung);
      for (var f = 0; f < gioiHan; f++) {
        if (sl[f] || tx[f] === undefined || !moKhoi(tx[f])) continue;
        var g = f;
        while (g + 1 < gioiHan && tx[g + 1] !== undefined && lv[g + 1] > lv[f]) g++;
        for (var j = f + 1; j <= g; j++) {
          var sg = h('i', 'bk' + (laRe(tx[f]) ? ' if' : /^\s*while\s/.test(tx[f]) ? ' wh' : '') + (j === g ? ' cuoi' : '')); sg.style.left = (Math.min(lv[f], 2) + 1) * BUOC_PX - 8 + 'px';
          brks[j].appendChild(sg);
        }
      }
      if (tuyChon.dem) tuyChon.dem.textContent = arr.length + '/' + dung;
      if (tuyChon.nutXoaHet) tuyChon.nutXoaHet.disabled = !arr.length;
      veXx();
      veThut();
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

    /** Bậc thụt mặc định của một dòng mới chèn vào vị trí at: bằng bậc dòng đang nằm ở đó (bị đẩy xuống);
     *  ô trống cuối khung thì bằng dòng có nghĩa ở trên, +1 bậc nếu dòng đó mở khối (for). Luôn kẹp trong mức hợp lệ. */
    this.bacMacDinh = function (at, txt) {
      var arr = lay(), b = 0;
      at = Math.max(0, Math.min(at, arr.length));
      if (txt && laNhanhPhu(txt)) { var bn = bacNhanhPhu(arr, at); if (bn >= 0) return bn; }     // elif / else: bậc của if phía trên
      if (at < arr.length && boThut(arr[at]).trim()) {
        b = bacCua(arr[at]);
        for (var k = at - 1; k >= 0; k--) if (coY(arr[k])) {                                  // ngay dưới một dòng if / elif / else: nằm trong nhánh đó, không bằng bậc dòng đang bị đẩy xuống
          if (laRe(arr[k]) && moKhoi(arr[k])) b = Math.max(b, bacCua(arr[k]) + 1);
          break;
        }
      } else {
        for (var j = at - 1; j >= 0; j--) if (coY(arr[j])) { b = bacCua(arr[j]) + (moKhoi(arr[j]) ? 1 : 0); break; }
      }
      return Math.max(0, Math.min(b, toiDaBac(arr, at)));
    };
    /** Bậc hợp lệ gần `muon` nhất nếu dòng tu được đặt ở vị trí den (tính sau khi đã bỏ dòng tu). */
    this.bacHopLe = function (tu, den, muon) {
      var tmp = lay().slice(); if (tu >= 0) tmp.splice(tu, 1);
      return Math.max(0, Math.min(muon, toiDaBac(tmp, Math.max(0, Math.min(den, tmp.length)))));
    };

    this.chen = function (txt) { return this.chenTai(txt, Math.min(sel, lay().length)); };
    /** Chèn vào vị trí at (0..số dòng). Đầy khung thì nháy đỏ, không chèn. bac (tùy chọn): bậc thụt; mặc định xem bacMacDinh. */
    this.chenTai = function (txt, at, bac) {
      var arr = lay();
      if (arr.length >= dung) { this.nhay(); return false; }
      this.anHoan();
      at = Math.max(0, Math.min(at, arr.length));
      var b = bac === undefined || bac === null ? this.bacMacDinh(at, txt) : Math.max(0, Math.min(bac, toiDaBac(arr, at)));
      arr.splice(at, 0, datBac(thichNghi(txt, at, b), b));
      chuanHoaBac(arr);
      sel = Math.min(at + 1, dung - 1);
      this.render(); this.hieuUng(at); tuyChon.khiDoi && tuyChon.khiDoi();
      return true;
    };
    /** Đổi dòng tu sang vị trí den (tính trong danh sách sau khi đã bỏ dòng tu); bac (tùy chọn) = bậc thụt mới (kéo ngang). */
    this.doiCho = function (tu, den, bac) {
      var arr = lay(); if (tu < 0 || tu >= arr.length) return;
      den = Math.max(0, Math.min(den, arr.length - 1));
      var truoc = arr.join('\n');
      var x = arr.splice(tu, 1)[0];
      var muon = bac === undefined || bac === null ? bacCua(x) : bac;
      arr.splice(den, 0, datBac(x, Math.max(0, Math.min(muon, toiDaBac(arr, den)))));
      chuanHoaBac(arr);
      var doi = truoc !== arr.join('\n');
      if (doi) this.anHoan();
      sel = den; this.render(); this.hieuUng(den);
      if (doi) tuyChon.khiDoi && tuyChon.khiDoi();
    };
    this.xoaTai = function (i) {
      var arr = lay(); if (i < 0 || i >= arr.length) return;
      luuHoan(arr, i);
      arr.splice(i, 1); chuanHoaBac(arr); sel = Math.min(i, dung - 1);
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi(); hienHoan();
    };
    /** Đổi đối số thứ k (mặc định 0) của dòng i: số trong `range(n)` hoặc trong lời gọi hàm; v là số hoặc tên biến. */
    this.datSo = function (i, v, k) {
      var arr = lay(); if (i < 0 || i >= arr.length) return;
      var s = thayDoiSo(arr[i], k || 0, v);
      if (s === arr[i]) return;
      this.anHoan(); arr[i] = s;
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
    };
    /** Đổi vế ci của điều kiện màu ở dòng i; themVe thêm một vế; boVe bỏ một vế. */
    this.datVe = function (i, ci, str) { this.suaDong(i, thayVe(lay()[i], ci, str)); };
    this.themVe = function (i, nx, str) { this.suaDong(i, themVe(lay()[i], nx, str)); };
    this.boVe = function (i, ci) { this.suaDong(i, boVe(lay()[i], ci)); };
    this.suaDong = function (i, dongMoi) {
      var arr = lay(); if (i < 0 || i >= arr.length || dongMoi === arr[i]) return;
      this.anHoan(); arr[i] = dongMoi;
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
    };
    /** Thay một đối số của dòng i bằng biến `ten`: ưu tiên đối số còn là số cụ thể, rồi đến đối số biến khác tên. Trả về có đổi được không. */
    this.datBienTai = function (i, ten, kieu) {
      var arr = lay(); if (i < 0 || i >= arr.length || i >= dung || dangChay() || Chan.dang() || xt) return false;
      var d = tachDoiSo(arr[i]); if (!d || !d.ds.length) return false;
      var kb = kieu || 'so';
      function hop(j) { return hopKieu(kieuArg(d, j), kb); }                       // ô cùng kiểu với biến
      var k = -1, j;
      for (j = 0; j < d.ds.length && k < 0; j++) if (hop(j) && (kb === 'so' ? RE_SO.test(d.ds[j]) : RE_CHUOI.test(d.ds[j]))) k = j;
      for (j = 0; j < d.ds.length && k < 0; j++) if (hop(j) && d.ds[j] !== ten && RE_BIEN.test(d.ds[j])) k = j;
      if (k < 0) return false;
      this.datSo(i, ten, k); this.hieuUng(i);
      return true;
    };
    /** Thẻ biến ở kho: thay vào dòng đang chọn, hoặc dòng có đối số gần nhất phía trên nó. kieu = kiểu của biến: 'so' (mặc định), 'don' (một chữ) hoặc 'ghep' (chuỗi chữ). */
    this.datBien = function (ten, kieu) {
      var arr = lay();
      for (var i = Math.min(sel, arr.length - 1); i >= 0; i--) if (this.datBienTai(i, ten, kieu)) { sel = Math.min(i + 1, dung - 1); this.render(); return true; }
      return false;
    };
    /** Đánh dấu dòng i là chỗ sắp thả thẻ biến (-1 = bỏ). */
    this.danhDauDich = function (i) { rows.forEach(function (r, k) { r.classList.toggle('dich', k === i); }); };
    this.chon = function (i) { if (i >= 0 && i < dung) { sel = i; this.render(); } };
    this.chonHienTai = function () { return sel; };
    this.xoaHet = function () {
      var arr = lay(); if (!arr.length) return;
      luuHoan(arr, 0);
      arr.length = 0; sel = 0; this.render(); tuyChon.khiDoi && tuyChon.khiDoi(); hienHoan();
    };
    /** idx: dòng đang chạy (hoặc null); lap (tùy chọn): { dòng: 'k/n' } số lượt đang chạy của các vòng for bao quanh. */
    this.datChay = function (idx, lap) {
      runIdx = idx === null || idx === undefined ? -1 : idx;
      lapSet = {};
      (lap || []).forEach(function (x) { lapSet[x.f] = x.k + '/' + x.n; });
      this.render();
    };
    this.datLoi = function (ds) { loiSet = {}; (ds || []).forEach(function (i) { loiSet[i] = true; }); this.render(); };
    this.nap = function (layMoi, dungMoi) {
      this.anHoan(); dongChonSo();
      lay = layMoi; if (dungMoi !== undefined) dung = dungMoi;
      runIdx = -1; loiSet = {}; lapSet = {}; xt = null; viTri = null; sel = Math.min(lay().length, Math.max(0, dung - 1)); this.render();
      this.vuaTieuDe();
    };
    this.dung = function () { return dung; };
    this.mang = function () { return lay(); };
    /** Phần tử của ô thứ i (để vẽ mũi tên chỉ tới). */
    this.hangEl = function (i) { return rows[i] || null; };
    this.chiSo = function (row) { return rows.indexOf(row); };
    this.hinhHoc = function () { return rows.map(function (r) { return r.getBoundingClientRect(); }); };

    /**
     * Đếm lượt của các vòng for từ vết chạy: trả về Map sự kiện → [{ f: dòng for, k: lượt thứ mấy, n: tổng số lượt }] (vòng ngoài trước).
     * dongCua(e) = chỉ số dòng (từ 0) của khung này mà sự kiện e đang chạy (hoặc null). Chỉ đếm vòng `range(n)` với n là số cụ thể,
     * và chỉ khi các lượt giống hệt nhau (không if / while bên trong) — còn lại thì bỏ qua, không hiện số lượt.
     */
    this.lapChoVet = function (vet, dongCua) {
      var arr = lay(), n = arr.length, lv = arr.map(bacCua), evs = [], kq = new Map();
      (vet || []).forEach(function (e) {
        if (e.loai !== 'lenh') return;
        var d = dongCua(e);
        if (d !== null && d !== undefined && d >= 0 && d < n) evs.push({ e: e, d: d });
      });
      function laF(i) { return /^\s*for\s/.test(arr[i] || ''); }
      function soLan(f) {
        var m = /range\(\s*(\w+)\s*\)/.exec(arr[f] || ''); if (!m) return 0;
        if (RE_SO.test(m[1])) return +m[1];
        var gb = tuyChon.giaBien && tuyChon.giaBien();                // đối số của hàm đang thử: n → giá trị ở ô số cạnh nút Thử
        return gb && gb[m[1]] > 0 ? +gb[m[1]] : 0;
      }
      function cuoi(f) {
        var g = f;
        while (g + 1 < n && (lv[g + 1] > lv[f] || !boThut(arr[g + 1]).trim())) g++;
        while (g > f && !boThut(arr[g]).trim()) g--;
        return g;
      }
      function coRe(f) {                                            // thân vòng có if / elif / else / while: các lượt không giống nhau, không hiện số lượt
        var g = cuoi(f);
        for (var j = f + 1; j <= g; j++) if (/^\s*(if|elif|else|while)\b/.test(arr[j] || '')) return true;
        return false;
      }
      function ngoai(d, da) {                                       // vòng ngoài cùng chứa dòng d mà chưa nằm trong da
        for (var f = 0; f < d; f++) if (laF(f) && !da[f] && cuoi(f) >= d) return f;
        return -1;
      }
      function xuLy(a, b, da) {
        var i = a;
        while (i < b) {
          var f = ngoai(evs[i].d, da);
          if (f < 0) { i++; continue; }
          var j = i + 1;
          while (j < b && ngoai(evs[j].d, da) === f) j++;
          var so = soLan(f), dem = j - i;
          if (so > 0 && dem % so === 0 && !coRe(f)) {
            var moi = {}; for (var kk in da) moi[kk] = true; moi[f] = true;
            var phan = dem / so;
            for (var k = 0; k < so; k++) {
              for (var x = i + k * phan; x < i + (k + 1) * phan; x++) {
                var l = kq.get(evs[x].e) || []; l.push({ f: f, k: k + 1, n: so }); kq.set(evs[x].e, l);
              }
              xuLy(i + k * phan, i + (k + 1) * phan, moi);
            }
          }
          i = j;
        }
      }
      xuLy(0, evs.length, {});
      return kq;
    };
    /**
     * Xem trước khi kéo: list = mảng { t, id } (dòng đang có, id = chỉ số cũ) hoặc { slot: true, bac } (chỗ sẽ thả); null = bỏ xem trước.
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

  /* ------------------------------------------------- bộ chọn số 1–9 */
  var chonCur = null;
  function dongChonSo() {
    var c = chonCur; if (!c) return;
    chonCur = null;
    if (c.el.parentNode) c.el.parentNode.removeChild(c.el);
    window.removeEventListener('pointerdown', c.ngoai, true);
    window.removeEventListener('keydown', c.phim, true);
  }
  /** Bảng nhỏ 3×3 nút số 1–9 ngay cạnh con số `neo`. o: { neo, so, khiChon(v), bien: [tên biến], hien: tên biến đang dùng }.
   *  Có `bien` thì thêm một hàng nút tên biến dưới 9 số; khiChon nhận số hoặc tên biến. Chạm ngoài bảng / Esc thì đóng. */
  function chonSo(o) {
    dongChonSo();
    var st = document.getElementById('stage'), rs = st.getBoundingClientRect(), k = st.offsetWidth ? rs.width / st.offsetWidth : 1;
    var el = h('div', 'chon-so'); el.setAttribute('data-nut', 'chon-so');
    el.setAttribute('aria-label', t('choi.chonSo'));
    for (var n = 1; n <= 9; n++) {
      (function (n) {
        var b = h('button', 'bt g-pu cs' + (n === o.so ? ' on' : ''), String(n)); b.setAttribute('data-so', n);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(n); });
        el.appendChild(b);
      })(n);
    }
    if (o.bien && o.bien.length) {
      var hb = h('div', 'cs-bien'); hb.setAttribute('data-nut', 'chon-bien');
      o.bien.forEach(function (ten) {
        var b = h('button', 'bt g-pk cs bien' + (ten === o.hien ? ' on' : ''), ten); b.setAttribute('data-bien', ten);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(ten); });
        hb.appendChild(b);
      });
      el.appendChild(hb);
    }
    st.appendChild(el);
    var ra = o.neo.getBoundingClientRect(), w = el.offsetWidth, hh = el.offsetHeight;
    var cx = (ra.left - rs.left) / k, cr = (ra.right - rs.left) / k, cy = ((ra.top + ra.bottom) / 2 - rs.top) / k;
    var x = cr + 6;
    if (x + w > st.offsetWidth - 4) x = cx - w - 6;
    x = Math.max(4, Math.min(x, st.offsetWidth - w - 4));
    var y = Math.max(4, Math.min(cy - hh / 2, st.offsetHeight - hh - 4));
    el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px';
    var c = {
      el: el,
      ngoai: function (ev) { if (!el.contains(ev.target)) dongChonSo(); },
      phim: function (ev) { if (ev.key === 'Escape') { ev.preventDefault(); dongChonSo(); } }
    };
    chonCur = c;
    window.addEventListener('pointerdown', c.ngoai, true);
    window.addEventListener('keydown', c.phim, true);
  }

  /** Đặt bảng chọn el cạnh phần tử neo (trong khung stage đã co giãn). */
  function datViTri(el, neo, duoi) {
    var st = document.getElementById('stage'), rs = st.getBoundingClientRect(), k = st.offsetWidth ? rs.width / st.offsetWidth : 1;
    var ra = neo.getBoundingClientRect(), w = el.offsetWidth, hh = el.offsetHeight;
    var cx = (ra.left - rs.left) / k, cr = (ra.right - rs.left) / k, cy = ((ra.top + ra.bottom) / 2 - rs.top) / k;
    var x, y;
    if (duoi) {                                   // ngay dưới ô neo (hoặc ngay trên nếu dưới hết chỗ): không che dòng đang sửa
      var ct = (ra.top - rs.top) / k, cb = (ra.bottom - rs.top) / k;
      x = Math.max(4, Math.min(cx, st.offsetWidth - w - 4));
      y = cb + 8 + hh <= st.offsetHeight - 4 ? cb + 8 : ct - 8 - hh;
      y = Math.max(4, Math.min(y, st.offsetHeight - hh - 4));
    } else {
      x = cr + 6;
      if (x + w > st.offsetWidth - 4) x = cx - w - 6;
      x = Math.max(4, Math.min(x, st.offsetWidth - w - 4));
      y = Math.max(4, Math.min(cy - hh / 2, st.offsetHeight - hh - 4));
    }
    el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px';
  }
  var CHU_TOI_DA = 16;       // chuỗi ghép dài tối đa
  var CHU_HUONG = ['U', 'D', 'L', 'R'];
  /**
   * Bộ chọn chuỗi chữ chỉ đường cạnh ô `neo`. o: { neo, kieu, gia, hien, bien: [tên biến], khiChon(v) }
   *   kieu 'don' / 'dl': bốn nút U D L R, chạm một nút là chọn xong ('dl' không có hàng biến);
   *   kieu 'ghep': nút U D L R thêm chữ vào cuối, ⌫ xóa chữ cuối, Xong để đóng; chuỗi đang ghép hiện ở trên (tối đa 16 chữ), mỗi lần chạm đều đổi dòng code ngay;
   *   kieu 'bien': chỉ hàng tên biến.
   *   gia: chuỗi đang có (không nháy); hien: tên biến đang dùng (nếu ô đang là biến). khiChon nhận chuỗi có nháy ("RRD") hoặc tên biến.
   */
  function chonChuoi(o) {
    dongChonSo();
    var st = document.getElementById('stage');
    var el = h('div', 'chon-so chon-chuoi ' + o.kieu); el.setAttribute('data-nut', 'chon-chuoi'); el.setAttribute('data-kieu', o.kieu);
    el.setAttribute('aria-label', t('choi.chonChuoi'));
    var cur = String(o.gia || '').replace(/[^UDLR]/g, '').slice(0, CHU_TOI_DA), hienEl = null, bsEl = null, chuEls = [];
    function ve() {
      if (hienEl) {
        hienEl.textContent = '"' + cur + '"';
        hienEl.setAttribute('data-chuoi', cur);
        hienEl.classList.toggle('trong', !cur);
        var dem = hienEl.nextSibling; if (dem) dem.textContent = cur.length + '/' + CHU_TOI_DA;
      }
      if (bsEl) bsEl.disabled = !cur;
      chuEls.forEach(function (b) { b.disabled = cur.length >= CHU_TOI_DA; });
    }
    if (o.kieu === 'ghep') {
      var hang0 = h('div', 'cc-hang0');
      hienEl = h('div', 'cc-hien'); hienEl.setAttribute('data-nut', 'chuoi-hien'); hang0.appendChild(hienEl); hang0.appendChild(h('div', 'cc-dem'));
      el.appendChild(hang0);
    }
    if (o.kieu !== 'bien') {
      var hc = h('div', 'cc-chu');
      CHU_HUONG.forEach(function (c) {
        var b = h('button', 'bt g-pu cs' + (o.kieu !== 'ghep' && c === o.gia ? ' on' : ''), c); b.setAttribute('data-chu', c);
        b.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (o.kieu === 'ghep') { if (cur.length < CHU_TOI_DA) { cur += c; ve(); o.khiChon('"' + cur + '"'); } }
          else { dongChonSo(); o.khiChon('"' + c + '"'); }
        });
        hc.appendChild(b); chuEls.push(b);
      });
      el.appendChild(hc);
    }
    if (o.kieu === 'ghep') {
      var hd = h('div', 'cc-hang');
      bsEl = h('button', 'bt g-rd cs cc-bs', '⌫'); bsEl.setAttribute('data-nut', 'chuoi-xoa'); bsEl.setAttribute('aria-label', t('choi.xoaChu'));
      bsEl.addEventListener('click', function (ev) { ev.stopPropagation(); if (cur) { cur = cur.slice(0, -1); ve(); o.khiChon('"' + cur + '"'); } });
      var xong = h('button', 'bt g-gr cs cc-xong', t('choi.xongChuoi')); xong.setAttribute('data-nut', 'chuoi-xong');
      xong.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); });
      hd.appendChild(bsEl); hd.appendChild(xong); el.appendChild(hd);
    }
    if (o.bien && o.bien.length) {
      var hb = h('div', 'cs-bien'); hb.setAttribute('data-nut', 'chon-bien');
      o.bien.forEach(function (ten) {
        var b = h('button', 'bt g-pk cs bien' + (ten === o.hien ? ' on' : ''), ten); b.setAttribute('data-bien', ten);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(ten); });
        hb.appendChild(b);
      });
      el.appendChild(hb);
    }
    st.appendChild(el);
    ve();
    datViTri(el, o.neo, true);
    var c = {
      el: el,
      ngoai: function (ev) { if (!el.contains(ev.target)) dongChonSo(); },
      phim: function (ev) { if (ev.key === 'Escape' || ev.key === 'Enter') { ev.preventDefault(); dongChonSo(); } }
    };
    chonCur = c;
    window.addEventListener('pointerdown', c.ngoai, true);
    window.addEventListener('keydown', c.phim, true);
  }

  /**
   * Bảng chọn ĐIỀU KIỆN cảm biến cạnh ô `neo` (cho dòng `while …:` / `if …:` / `elif …:`). o: { neo, ds: [tên hàm cảm biến của màn], gia: điều kiện đang có, khiChon(v) }.
   * Mỗi hàm một hàng hai nút: `front_clear()` | `not front_clear()`. khiChon nhận chuỗi điều kiện ("not left_clear()"). Chạm ngoài bảng / Esc thì đóng.
   */
  function chonDieuKien(o) {
    dongChonSo();
    var st = document.getElementById('stage');
    var el = h('div', 'chon-so chon-chuoi dkb'); el.setAttribute('data-nut', 'chon-dk');
    el.setAttribute('aria-label', t('choi.chonDieuKien'));
    o.ds.forEach(function (ten) {
      [ten + '()', 'not ' + ten + '()'].forEach(function (v) {
        var b = h('button', 'bt g-cy cs dk-nut' + (v === o.gia ? ' on' : ''), v); b.setAttribute('data-dk', v);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(v); });
        el.appendChild(b);
      });
    });
    st.appendChild(el);
    datViTri(el, o.neo, true);
    var c = {
      el: el,
      ngoai: function (ev) { if (!el.contains(ev.target)) dongChonSo(); },
      phim: function (ev) { if (ev.key === 'Escape' || ev.key === 'Enter') { ev.preventDefault(); dongChonSo(); } }
    };
    chonCur = c;
    window.addEventListener('pointerdown', c.ngoai, true);
    window.addEventListener('keydown', c.phim, true);
  }
  /** Đặt bảng chọn el cạnh neo, đóng khi chạm ra ngoài / Esc / Enter. */
  function moBang(el, neo) {
    var st = document.getElementById('stage');
    st.appendChild(el);
    datViTri(el, neo, true);
    var c = {
      el: el,
      ngoai: function (ev) { if (!el.contains(ev.target)) dongChonSo(); },
      phim: function (ev) { if (ev.key === 'Escape' || ev.key === 'Enter') { ev.preventDefault(); dongChonSo(); } }
    };
    chonCur = c;
    window.addEventListener('pointerdown', c.ngoai, true);
    window.addEventListener('keydown', c.phim, true);
  }
  /** Nút một màu trong bảng chọn màu: nền theo màu (g-rd, g-gr, g-bl, g-yl; none xám). */
  function nutMau(ten, on) {
    var b = h('button', 'bt ' + MAU_LOP[ten] + ' cs mau-nut' + (on ? ' on' : ''), ten); b.setAttribute('data-mau', ten);
    return b;
  }
  /**
   * Bảng chọn MÀU cho vế phải của phép so sánh màu (`"red"`). o: { neo, gia: vế phải hiện tại ("red" hay tên biến), bien: [tên biến gán bằng color()], khiChon(v) }.
   * Năm nút red / green / blue / yellow / none; có biến `c` (gán c = color()) thì thêm nút `c`. khiChon nhận chuỗi có nháy ("red") hoặc tên biến.
   */
  function chonMau(o) {
    dongChonSo();
    var el = h('div', 'chon-so chon-chuoi mau'); el.setAttribute('data-nut', 'chon-mau'); el.setAttribute('aria-label', t('choi.chonMau'));
    var hien = RE_CHUOI.test(o.gia) ? o.gia.slice(1, -1) : null;
    MAU_DS.forEach(function (ten) {
      var b = nutMau(ten, ten === hien);
      b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon('"' + ten + '"'); });
      el.appendChild(b);
    });
    (o.bien || []).forEach(function (ten) {
      var b = h('button', 'bt g-pk cs bien' + (ten === o.gia ? ' on' : ''), ten); b.setAttribute('data-bien', ten);
      b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(ten); });
      el.appendChild(b);
    });
    moBang(el, o.neo);
  }
  /**
   * Bảng chọn ĐIỀU KIỆN của màn có cảm biến màu. o: { neo, cam: [hàm cảm biến khoảng cách], bien: [biến c = color()], gia: vế đang có, khiChon(vế), ghep: { coThem, coBo } | null, khiGhep(and|or), khiBo() }.
   * Hàng cảm biến: `front_clear()` | `not front_clear()`. Hàng màu: `color() == "red"` | `color() != "red"` (giữ màu đang so nếu có). Có biến c: `c == "red"`, `c != "red"`, `color() == c`, `color() != c`.
   * Màn có cả hai loại cảm biến thì thêm hàng ghép: `+ and` / `+ or` thêm một vế nữa, `bỏ vế` bỏ vế này.
   */
  function chonDkm(o) {
    dongChonSo();
    var el = h('div', 'chon-so chon-chuoi dkb dkm-bang'); el.setAttribute('data-nut', 'chon-dk');
    el.setAttribute('aria-label', t('choi.chonDieuKien'));
    var ss = RE_CL_SS.exec(o.gia || ''), mauDang = ss && RE_CHUOI.test(ss[3]) ? ss[3] : '"red"';
    function nut(v, cls) {
      var b = h('button', 'bt ' + (cls || 'g-cy') + ' cs dk-nut' + (v === o.gia ? ' on' : ''), v); b.setAttribute('data-dk', v);
      b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(v); });
      el.appendChild(b);
    }
    (o.cam || []).forEach(function (ten) { nut(ten + '()'); nut('not ' + ten + '()'); });
    nut('color() == ' + mauDang, 'g-pk'); nut('color() != ' + mauDang, 'g-pk');
    (o.bien || []).forEach(function (v) {
      nut(v + ' == ' + mauDang, 'g-pu'); nut(v + ' != ' + mauDang, 'g-pu');
      nut('color() == ' + v, 'g-pu'); nut('color() != ' + v, 'g-pu');
    });
    if (o.ghep) {
      var hg = h('div', 'cs-bien'); hg.setAttribute('data-nut', 'chon-ghep');
      function nutG(ma, chu, cls, fn) {
        var b = h('button', 'bt ' + cls + ' cs ghep-nut', chu); b.setAttribute('data-ghep', ma);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); fn(); });
        hg.appendChild(b);
      }
      if (o.ghep.coThem) { nutG('and', t('choi.ghepAnd'), 'g-or', function () { o.khiGhep('and'); }); nutG('or', t('choi.ghepOr'), 'g-or', function () { o.khiGhep('or'); }); }
      if (o.ghep.coBo) nutG('bo', t('choi.boVe'), 'g-rd', o.khiBo);
      if (hg.children.length) el.appendChild(hg);
    }
    moBang(el, o.neo);
  }
  /** Hàm cảm biến khoảng cách mà màn cho dùng (front_clear, left_clear, right_clear), theo hamGoc của màn. */
  var CAM_BIEN_TEN = ['front_clear', 'left_clear', 'right_clear'];
  function camBienCua(man) { return ((man && man.hamGoc) || []).filter(function (n) { return CAM_BIEN_TEN.indexOf(n) >= 0; }); }

  /** Chẩn đoán cụ thể lên trước câu chung chung: `nhen-khong-buoc` (nhện chưa bước lần nào) đứng trước `chua-toi-co` / `chua-dua-vat`. Trả về mảng mới. */
  function xepChanDoan(ds) {
    var kq = ds.slice(), i = -1, j;
    for (j = 0; j < kq.length; j++) if (kq[j].ma === 'nhen-khong-buoc') i = j;
    var dau = -1;
    for (j = 0; j < kq.length && dau < 0; j++) if (kq[j].ma === 'chua-toi-co' || kq[j].ma === 'chua-dua-vat') dau = j;
    if (i > dau && dau >= 0) { var x = kq.splice(i, 1)[0]; kq.splice(dau, 0, x); }
    return kq;
  }
  /** Hàm của em dùng được với robot của màn: hàm gọi (trực tiếp hay qua hàm khác của em) một lệnh gốc mà màn không có trong `hamGoc` thì ẩn khỏi kho
   *  (vd. nhện bỏ hàm dùng lệnh bánh; xích / omni bỏ go(d); xe không tay bỏ pick()). Màn không khai hamGoc: giữ nguyên. */
  var LENH_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'push', 'slide_left', 'slide_right', 'go_up', 'go_down', 'go_left', 'go_right'];
  function locHamTheoRobot(man, ds) {
    if (!ds || !man || !man.hamGoc || !man.hamGoc.length) return ds;
    var co = {}; man.hamGoc.forEach(function (n) { co[n] = true; });
    var theoTen = {}; ds.forEach(function (f) { theoTen[f.ten] = f; });
    function dungLenhThieu(f, da) {
      return (f.than || []).some(function (dong) {
        var re = /([A-Za-z_]\w*)\(/g, m, s = boChuThich(dong);
        while ((m = re.exec(s))) {
          if (LENH_GOC.indexOf(m[1]) >= 0 && !co[m[1]]) return true;
          var g = theoTen[m[1]];
          if (g && !da[m[1]]) { da[m[1]] = true; if (dungLenhThieu(g, da)) return true; }
        }
        return false;
      });
    }
    return ds.filter(function (f) { var da = {}; da[f.ten] = true; return !dungLenhThieu(f, da); });
  }

  /* ------------------------------------------------- kiểu của đối số hàm: số / một chữ / chuỗi ghép */
  var KIEU_TEN_DON = /^(d|c|dir|huong)$/i, KIEU_TEN_GHEP = /^(path|chuoi|s|chu)$/i;
  function boChuThich(s) { s = chuoi(s); var k = s.indexOf('#'); return k >= 0 ? s.slice(0, k) : s; }
  function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /**
   * Suy kiểu của đối số k của hàm f = { ten, thamSo, than } từ thân hàm: 'don' (so sánh với một chữ: `d == "U"`),
   * 'ghep' (lặp từng chữ `for c in path`), 'so' (`range(n)`); đưa nguyên sang hàm khác thì lấy theo hàm đó. null nếu thân chưa nói gì.
   */
  function suyKieu(f, k, tim, sau) {
    var p = (f.thamSo || [])[k]; if (!p) return null;
    var src = (f.than || []).map(boChuThich).join('\n'), P = escRe(p);
    if (new RegExp('(^|[^\\w"])' + P + '\\s*[=!]=').test(src) || new RegExp('[=!]=\\s*' + P + '(?![\\w"])').test(src)) return 'don';
    if (new RegExp('\\bin\\s+' + P + '\\s*:').test(src)) return 'ghep';
    if (new RegExp('range\\(\\s*' + P + '\\s*\\)').test(src)) return 'so';
    if ((sau || 0) < 4) {
      var re = /([A-Za-z_]\w*)\(([^()]*)\)/g, m;
      while ((m = re.exec(src))) {
        var j = m[2].split(',').map(function (x) { return x.trim(); }).indexOf(p);
        if (j < 0) continue;
        var g = tim(m[1]);
        if (g && g !== f) { var kq = suyKieu(g, j, tim, (sau || 0) + 1); if (kq) return kq; }
      }
    }
    return null;
  }
  /**
   * Hàm kieuDoiSo(tenHam, k) → 'so' | 'don' | 'ghep'. layCtx() trả { man, hamCuaMan: [f], kho: [f] }.
   * Hàm có trong lời giải của màn (go, walk, bring, go_sai…) thì theo lời giải; còn lại suy từ thân hàm (của em / của màn); chưa có gì thì theo tên đối số ở màn nhện (d, c: một chữ; path: chuỗi); còn lại là số.
   */
  function taoKieu(layCtx) {
    return function (ten, k) {
      var cx = layCtx() || {};
      function tim(n) {
        var l = [(cx.hamCuaMan || []), (cx.kho || [])], i, j;
        for (i = 0; i < l.length; i++) for (j = 0; j < l[i].length; j++) if (l[i][j].ten === n) return l[i][j];
        return null;
      }
      function timLG(n) {
        var lg = (cx.man && cx.man.loiGiai) || {}, l = [(lg.hamCuaEmMoi || []), (lg.hamCuaMan || [])], i, j;
        for (i = 0; i < l.length; i++) for (j = 0; j < l[i].length; j++) if (l[i][j].ten === n) return l[i][j];
        return null;
      }
      var f = tim(ten), g = timLG(ten), kq = null;
      if (g) kq = suyKieu(g, k, function (n) { return timLG(n) || tim(n); });       // hàm cốt truyện của màn: theo lời giải (ổn định dù em đang viết thân hàm thế nào)
      if (!kq && f) kq = suyKieu(f, k, tim);
      if (!kq) {
        var p = ((f || g || {}).thamSo || [])[k];
        if (p && cx.man && cx.man.loaiRobot === 'nhen') kq = KIEU_TEN_GHEP.test(p) ? 'ghep' : KIEU_TEN_DON.test(p) ? 'don' : null;
      }
      return kq || 'so';
    };
  }

  /* ------------------------------------------------------------ Palette */
  /**
   * Kho khối chia 3 nhóm. cb: { khiChen(text), khiSua(loai, ten), khiMoi() }.
   * dung({ goc: [tên], vong: bool (có khối `for`), bien: [tên đối số] (nhóm BIẾN, khi sửa hàm có tham số), em: [{ten,thamSo}] | null, man: [{ten,thamSo}], coNutMoi, boQua }).
   * cb.khiBien(ten): chạm thẻ biến.
   * em === null → ẩn cả nhóm "hàm của em". Nhóm rỗng thì ẩn (trừ "hàm của em" có nút Hàm mới).
   */
  function Palette(host, cb) {
    this.host = host;
    var bricks = {}, lastSpec = null, pal = this;
    // Kho dài quá cỡ (nhiều hàm của em): hai nút ▲ ▼ ở tiêu đề cuộn từng trang, không có thanh cuộn
    var bh = host.parentNode && host.parentNode.querySelector ? host.parentNode.querySelector('.bh') : null;
    var cuonEl = null, nutLen = null, nutXuong = null;
    if (bh) {
      cuonEl = h('span', 'cuon-nut'); cuonEl.style.display = 'none';
      [['len', 'choi.palLen', -1], ['xuong', 'choi.palXuong', 1]].forEach(function (c) {
        var b = h('button', 'bt g-wd cuon-b ' + c[0]); b.setAttribute('data-nut', 'pal-' + c[0]); b.setAttribute('aria-label', t(c[1]));
        b.appendChild(h('i', 'tam'));
        b.addEventListener('click', function (ev) { ev.stopPropagation(); pal.cuon(c[2]); });
        cuonEl.appendChild(b);
        if (c[2] < 0) nutLen = b; else nutXuong = b;
      });
      bh.appendChild(cuonEl);
    }
    host.addEventListener('wheel', function (ev) {
      if (!host.classList.contains('cuon')) return;
      ev.preventDefault(); host.scrollTop += ev.deltaY; veCuon();
    }, { passive: false });
    function veCuon() {
      if (!cuonEl) return;
      var tran = host.classList.contains('cuon');
      cuonEl.style.display = tran ? '' : 'none';
      if (!tran) return;
      nutLen.disabled = host.scrollTop <= 0;
      nutXuong.disabled = host.scrollTop + host.clientHeight >= host.scrollHeight - 1;
    }
    /** Cuộn kho khối một trang: d = -1 lên, 1 xuống. */
    this.cuon = function (d) { host.scrollTop += d * Math.max(40, host.clientHeight - 34); veCuon(); };
    function nhan(chu, cls) { var g = h('div', 'gl ' + cls); g.appendChild(document.createTextNode(chu)); host.appendChild(g); return g; }
    function gach(ten, lop, loai, hamTS, cha) {
      var d = h('div', 'brick ' + lop); d.setAttribute('role', 'button');
      // chèn: mỗi đối số là 1 (số), "U" (một chữ) hoặc "R" (chuỗi chữ) tùy kiểu; hiện: tên đối số
      var goi = ten + '(' + (hamTS && hamTS.length ? hamTS.map(function (_, k) { var kd = cb.kieuDoiSo ? cb.kieuDoiSo(ten, k) : 'so'; return kd === 'don' ? '"U"' : kd === 'ghep' ? '"R"' : '1'; }).join(', ') : '') + ')';
      var hien = '(' + (hamTS || []).join(', ') + ')';
      d.setAttribute('data-ten', ten); d.setAttribute('data-loai', loai); d.setAttribute('data-goi', goi);
      var sp = h('span', 'tx');
      if (loai === 'goc') sp.textContent = ten;
      else { sp.appendChild(document.createTextNode(ten)); sp.appendChild(h('span', 'pn' + (hamTS && hamTS.length ? ' co' : ''), hien)); }
      d.appendChild(sp);
      if (loai !== 'goc') {
        var e = h('span', 'ed'); e.setAttribute('role', 'button'); e.setAttribute('aria-label', t('choi.suaHam', { ten: ten }));
        e.setAttribute('data-sua', ten);
        e.appendChild(Ve.ico('edit', 2, { line: '#0e3a12' }));
        e.addEventListener('click', function (ev) { ev.stopPropagation(); cb.khiSua && cb.khiSua(loai, ten); });
        d.appendChild(e);
      }
      d.addEventListener('click', function () { cb.khiChen(goi); });
      (cha || host).appendChild(d); bricks[loai + ':' + ten] = d;
    }
    /** Thẻ biến (nhóm BIẾN): tên một đối số của hàm đang sửa. Chạm hoặc kéo vào dòng có số thì thay số đó bằng biến. */
    function gachBien(ten) {
      var d = h('div', 'brick bien'); d.setAttribute('role', 'button');
      d.setAttribute('data-ten', ten); d.setAttribute('data-loai', 'bien'); d.setAttribute('data-goi', ten);
      d.appendChild(h('span', 'tx', ten));
      d.addEventListener('click', function () { cb.khiBien && cb.khiBien(ten); });
      host.appendChild(d); bricks['bien:' + ten] = d;
    }
    /** Khối rẽ nhánh (nhóm ĐIỀU KIỆN): `if d == "U":`, `elif d == "D":`, `else:`. */
    function gachDk(goi) {
      var d = h('div', 'brick dk'); d.setAttribute('role', 'button');
      var khoa = goi.split(/[ :]/)[0] + (RE_GAN_MAU.test(goi) ? '=' : '');
      d.setAttribute('data-ten', khoa); d.setAttribute('data-loai', 'dk'); d.setAttribute('data-goi', goi);
      d.appendChild(h('span', 'tx', goi));
      d.addEventListener('click', function () { cb.khiChen(goi); });
      host.appendChild(d); bricks['dk:' + khoa] = d;
    }
    /** Khối tím `for i in range(2):` (nhóm VÒNG LẶP). */
    function gachVong(goi, khoa, lopThem) {
      goi = goi || 'for i in range(2):';
      var d = h('div', 'brick ' + (lopThem || 'pu') + ' vong'); d.setAttribute('role', 'button');
      d.setAttribute('data-ten', khoa === 'while' ? 'while' : 'for'); d.setAttribute('data-loai', 'vong'); d.setAttribute('data-goi', goi);
      var sp = h('span', 'tx'); sp.textContent = goi; d.appendChild(sp);
      d.addEventListener('click', function () { cb.khiChen(goi); });
      host.appendChild(d); bricks['vong:' + (khoa || 'for')] = d;
    }
    this.dung = function (spec) {
      var cuonCu = host.scrollTop;                          // dựng lại (sau mỗi lần sửa) thì giữ chỗ đang xem
      lastSpec = spec; host.innerHTML = ''; bricks = {};
      host.classList.remove('d1', 'd2', 'd3');
      var boQua = spec.boQua || null;
      var gocTay = (spec.goc || []).filter(function (n) { return TAY_TEN.indexOf(n) >= 0; });
      var gocDay = (spec.goc || []).filter(function (n) { return DAY_TEN.indexOf(n) >= 0; });                // tấm đẩy: push (nhóm ĐẨY)
      var gocChan = (spec.goc || []).filter(function (n) { return /^go_/.test(n); });                      // nhện: go_up / go_down / go_left / go_right (nhóm CHÂN, kèm wait)
      var gocTruot = (spec.goc || []).filter(function (n) { return /^slide_/.test(n); });                  // omni: slide_left / slide_right (nhóm TRƯỢT)
      var gocThuong = (spec.goc || []).filter(function (n) { return TAY_TEN.indexOf(n) < 0 && DAY_TEN.indexOf(n) < 0 && !/^go_/.test(n) && !/^slide_/.test(n) && CAM_BIEN_TEN.indexOf(n) < 0 && n !== 'color' && !(gocChan.length && n === 'wait'); });   // lệnh bánh (và wait của xe bánh); hàm cảm biến là ĐIỀU KIỆN, không phải lệnh
      if (gocChan.length && (spec.goc || []).indexOf('wait') >= 0) gocChan.push('wait');
      function lop(them) { return (host.firstChild ? 'g2 ' : 'g1 ') + them; }       // nhóm đầu tiên là g1 (không cách trên), các nhóm sau g2
      function nhomGoc() {
        if (!gocThuong.length) return;
        nhan(t('choi.nhom.goc'), lop(''));
        gocThuong.forEach(function (n) { gach(n, lopMau(n) === 'gr' ? 'pu' : lopMau(n), 'goc'); });
      }
      function nhomChan() {
        if (!gocChan.length) return;
        nhan(t('choi.nhom.chan'), lop('g-chan'));
        var cot2 = h('div', 'g-2c'); host.appendChild(cot2);                                   // lệnh gốc của nhện xếp hai cột cho gọn
        gocChan.forEach(function (n) { gach(n, n === 'wait' ? 'yl' : 'chan', 'goc', null, cot2); });
      }
      function nhomTruot() {
        if (!gocTruot.length) return;
        nhan(t('choi.nhom.truot'), lop('g-truot'));
        gocTruot.forEach(function (n) { gach(n, 'truot', 'goc'); });
      }
      function nhomTay() {
        if (!gocTay.length) return;
        nhan(t('choi.nhom.tay'), lop('g-tay'));
        var cot2 = null;
        if (gocChan.length) { cot2 = h('div', 'g-2c'); host.appendChild(cot2); }
        gocTay.forEach(function (n) { gach(n, 'tay', 'goc', null, cot2); });
      }
      function nhomDay() {
        if (!gocDay.length) return;
        nhan(t('choi.nhom.day'), lop('g-tay'));
        gocDay.forEach(function (n) { gach(n, 'tay', 'goc'); });
      }
      function nhomVong() {
        if (!spec.vong) return;
        nhan(t('choi.nhom.vong'), lop('g-vl'));
        gachVong();
        if (spec.chuoi) gachVong('for c in "R":', 'forc');
        if (spec.vongWhile) gachVong(spec.mau && !(spec.cam || []).length ? 'while color() != "red":' : 'while ' + ((spec.cam || [])[0] || 'front_clear') + '():', 'while', 'wh');         // vòng while: khối xanh dương
      }
      function nhomDk() {
        var cam = spec.cam || [];
        if (!spec.dieuKien && !cam.length && !spec.mau) return;
        nhan(t('choi.nhom.dk'), lop('g-dk'));
        (spec.mau ? (cam.length ? ['if ' + cam[0] + '():'] : []).concat(['if color() == "red":', 'elif color() == "blue":', 'else:', 'c = color()'])          // cảm biến màu: so màu + gán biến
          : cam.length ? (cam.indexOf('right_clear') >= 0 ? ['if right_clear():', 'elif front_clear():', 'else:'] : ['if ' + cam[0] + '():', 'else:'])
          : ['if d == "U":', 'elif d == "D":', 'else:']).forEach(gachDk);
      }
      function nhomDkCam() { if ((spec.cam || []).length || spec.mau) nhomDk(); }                     // màn có cảm biến: nhóm ĐIỀU KIỆN nằm cạnh VÒNG LẶP
      function nhomBien() {
        if (!spec.bien || !spec.bien.length) return;
        nhan(t('choi.nhom.bien'), lop('g-bien'));
        spec.bien.forEach(gachBien);
      }
      function nhomEm() {
        if (!spec.em) return;
        var g2 = nhan(t('choi.nhom.em'), lop('g-em'));
        if (spec.coNutMoi && cb.khiMoi) {
          var nb = h('button', 'nb'); nb.setAttribute('data-nut', 'ham-moi');
          nb.appendChild(Ve.ico('plus', 1, { line: '#0e3a12', fill: '#e8ffe0' }));
          nb.appendChild(document.createTextNode(t('choi.hamMoi')));
          nb.addEventListener('click', function () { cb.khiMoi(); });
          g2.appendChild(nb);
        }
        var ds = spec.em.filter(function (f) { return f.ten !== boQua; });
        if (coTS) ds = ds.filter(function (f) { return f.thamSo && f.thamSo.length; }).concat(ds.filter(function (f) { return !(f.thamSo && f.thamSo.length); }));   // hàm có tham số (chủ đề của chương) lên đầu
        ds.forEach(function (f) { gach(f.ten, 'gr', 'em', f.thamSo); });
      }
      function nhomMan() {
        if (!spec.man || !spec.man.length) return;
        var list = spec.man.filter(function (f) { return f.ten !== boQua; });
        if (list.length) {
          var g3 = nhan(t('choi.nhom.man'), lop('g-ma'));
          g3.appendChild(h('span', 'tg', t('choi.nhom.chiMan')));
          list.forEach(function (f) { gach(f.ten, 'or', 'man', f.thamSo); });
        }
      }
      // Thứ tự nhóm. Có hàm có tham số (từ chương Hàm có tham số): kho dài nên chỉ thấy được một trang, nên lên trước những gì chương này dùng
      // (BIẾN, VÒNG LẶP, hàm của màn, hàm của em), khối gốc / tay xuống cuối. Kho của em đã dài: hàm của màn (ít, đề bài thường cần ngay) lên trước hàm của em.
      var coTS = !!(spec.bien && spec.bien.length) || [spec.em, spec.man].some(function (l) { return (l || []).some(function (f) { return f.thamSo && f.thamSo.length; }); });
      var thuTu = gocChan.length ? [nhomBien, nhomChan, nhomTay, nhomVong, nhomDk, nhomMan, nhomEm, nhomGoc]      // nhện: chân (lệnh chính) lên đầu
        : coTS ? [nhomBien, nhomDay, nhomVong, nhomDkCam, nhomMan, nhomEm, nhomTruot, nhomGoc, nhomTay]
        : (spec.em && spec.em.length > 8) ? [nhomGoc, nhomDay, nhomTruot, nhomTay, nhomVong, nhomDkCam, nhomBien, nhomMan, nhomEm]
        : [nhomGoc, nhomDay, nhomTruot, nhomTay, nhomVong, nhomDkCam, nhomBien, nhomEm, nhomMan];
      thuTu.forEach(function (f) { f(); });
      this.vua();
      if (cuonCu && host.classList.contains('cuon')) { host.scrollTop = cuonCu; veCuon(); }
    };
    /** Co khối lại cho vừa khung; co hết cỡ mà vẫn dài thì bật chế độ cuộn từng trang (nút ▲ ▼ ở tiêu đề). */
    this.vua = function () {
      if (!host.clientHeight) return;
      ['d1', 'd2', 'd3', 'cuon'].forEach(function (c) { host.classList.remove(c); });
      host.scrollTop = 0;
      var bac = host.querySelector('.pn.co') ? ['d1', 'd2'] : ['d1', 'd2', 'd3'];     // có hàm có tham số: giữ một cột (thấy đủ tên + đối số), dài thì cuộn trang
      for (var i = 0; i < bac.length && host.scrollHeight > host.clientHeight + 1; i++) {
        if (i) host.classList.remove(bac[i - 1]);
        host.classList.add(bac[i]);
      }
      if (host.scrollHeight > host.clientHeight + 1) host.classList.add('cuon');
      veCuon();
    };
    this.datSang = function (loai, ten) {
      Object.keys(bricks).forEach(function (k) { bricks[k].classList.toggle('lit', !!loai && k === loai + ':' + ten); });
    };
    this.datLoi = function (ds) {
      var set = {}; (ds || []).forEach(function (k) { set[k] = true; });
      Object.keys(bricks).forEach(function (k) { bricks[k].classList.toggle('err', !!set[k]); });
      var dau = Object.keys(bricks).filter(function (k) { return set[k]; })[0];
      if (dau && host.classList.contains('cuon')) {         // khối báo lỗi / đang sáng nằm ngoài tầm nhìn thì cuộn tới
        var b = bricks[dau], hr = host.getBoundingClientRect(), br = b.getBoundingClientRect(), k = host.offsetHeight ? hr.height / host.offsetHeight : 1;
        if (br.top < hr.top || br.bottom > hr.bottom) { host.scrollTop += (br.top - hr.top) / k - 20; veCuon(); }
      }
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
    var HOLD_MS = 250, NGUONG_CHUOT = 6, NGUONG_CHAM = 10, NGUONG_BAC = 14;   // NGUONG_BAC: px (hệ khung 360) kéo ngang cho một bậc thụt
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
    function lap(arr, bo, slotAt, bac) {
      var ds = [];
      arr.forEach(function (t, i) { if (i !== bo) ds.push({ t: t, id: i }); });
      if (slotAt !== null) ds.splice(slotAt, 0, { slot: true, bac: bac || 0 });
      return ds;
    }
    /** Bậc thụt của dòng đang kéo nếu thả ở slot: chuột kéo ngang quá nửa bậc (NGUONG_BAC px) thì đổi bậc; cảm ứng giữ bậc cũ. */
    function bacKeo(c, slot) {
      var goc = bacCua(c.txt), muon = goc;
      if (c.kieu === 'mouse') muon = goc + Math.round((c.x - c.sx) / (NGUONG_BAC * stageInfo().k));
      return c.ed.bacHopLe(c.tu, slot, muon);
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
        if (cur && b.getAttribute('data-loai') === 'bien') { cur.bien = true; cur.kieuB = cfg.kieuBien ? cfg.kieuBien(b.getAttribute('data-goi')) : 'so'; }       // thẻ biến: thả lên một dòng thì thay số của dòng, không chèn dòng mới
      });
    }

    function stageInfo() {
      var st = document.getElementById('stage'), r = st.getBoundingClientRect();
      return { st: st, left: r.left, top: r.top, k: st.offsetWidth ? r.width / st.offsetWidth : 1 };
    }
    function datGhost() {
      var c = cur, si = stageInfo(), g;
      if (c.loai === 'doi') {
        g = h('div', 'keo-bong keo-dong' + (/^\s*for\s/.test(c.txt) ? ' for' : '') + (laRe(c.txt) ? ' if' : '') + (/^\s*while\s/.test(c.txt) ? ' wh' : '')); g.innerHTML = mauDong(c.txt);
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
      c.bac = null;
      if (c.loai === 'doi' && trong(rk, c.x, c.y)) vung = 'thung';
      else if (trong(rp, c.x, c.y)) vung = 'khung';
      var dich = -1;
      if (vung === 'thung') xem = lap(arr, c.tu, null);
      else if (vung === 'khung' && c.bien) {
        dich = hangGan(ed.hinhHoc(), c.y);
        if (dich >= dung || dich >= n) dich = -1;
        xem = lap(arr, -1, null);
      }
      else if (vung === 'khung') {
        var idx = hangGan(ed.hinhHoc(), c.y);
        if (idx >= dung) { loi = 'khoa'; xem = c.loai === 'doi' ? lap(arr, c.tu, c.tu, bacCua(c.txt)) : lap(arr, -1, null); }
        else if (c.loai === 'doi') { slot = Math.min(idx, n - 1); c.bac = bacKeo(c, slot); xem = lap(arr, c.tu, slot, c.bac); }
        else if (n >= dung) { loi = 'day'; xem = lap(arr, -1, null); }
        else { slot = Math.min(idx, n); c.bac = ed.bacMacDinh(slot, c.txt); xem = lap(arr, -1, slot, c.bac); }
      } else xem = c.loai === 'doi' ? lap(arr, c.tu, c.tu, bacCua(c.txt)) : lap(arr, -1, null);
      var key = vung + '|' + slot + '|' + loi + '|' + c.bac;
      c.vung = vung; c.slot = slot; c.loi = loi; c.dich = dich;
      ed.danhDauDich(c.bien ? dich : -1);
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
      var ed = c.ed, vung = c.vung, slot = c.slot, loi = c.loi, loai = c.loai, tu = c.tu, txt = c.txt, cf = c.cfg, bac = c.bac, laBien = c.bien, dichBien = c.dich, kieuB = c.kieuB;
      nuotClick(); ketThuc();
      if (laBien) { if (vung === 'khung' && !(dichBien >= 0 && ed.datBienTai(dichBien, txt, kieuB))) cf.khiKhongSo && cf.khiKhongSo(txt); }
      else if (vung === 'thung') ed.xoaTai(tu);
      else if (loai === 'doi') { if (slot !== null) ed.doiCho(tu, slot, bac); }
      else if (loi === 'day') { ed.nhay(); cf.khiDay && cf.khiDay(); }
      else if (loi === 'khoa') cf.khiKhoa && cf.khiKhoa();
      else if (slot !== null) ed.chenTai(txt, slot, bac);
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
        c.ed.xemTruoc(null); c.ed.danhDauDich(-1);
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

  window.TP = { h: h, esc: esc, vanBan: vanBan, mauDong: mauDong, tachDoiSo: tachDoiSo, thayDoiSo: thayDoiSo, lopMau: lopMau, bacCua: bacCua, coCauTruc: coCauTruc, chonSo: chonSo, chonChuoi: chonChuoi, chonDieuKien: chonDieuKien, chonMau: chonMau, chonDkm: chonDkm, datCheMau: datCheMau, coMauCua: coMauCua, MAU_DS: MAU_DS, tachDKM: tachDKM, camBienCua: camBienCua, taoKieu: taoKieu, locHamTheoRobot: locHamTheoRobot, xepChanDoan: xepChanDoan, dongChonSo: dongChonSo, Editor: Editor, Palette: Palette, Chan: Chan, Keo: Keo, XUONG_MS: XUONG_MS,
    bongVe: bongVe, bongAn: bongAn, bongMui: bongMui, vuaChu: vuaChu, Hop: { mo: mo, dong: dong, nut: nut, xacNhan: xacNhan, doc: doc } };
})();
