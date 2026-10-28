var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   thanh-phan.js — "Robot Chấn Hưng": THÀNH PHẦN GIAO DIỆN DÙNG CHUNG (window.TP).
   h() dựng DOM · Editor (khung 10 ô) · Palette (khay khối lệnh theo thẻ bộ phận: Thân / Tay / Cảm biến) · Hop (hộp thoại).
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
      var k = document.createElement('span'); k.className = m[0].length === 1 ? 'kc ngoac' : 'kc'; k.textContent = m[0]; el.appendChild(k);     // ngoặc đứng riêng trong câu: phông thường (VT323 vẽ ngoặc như vạch đứng)
      i = m.index + m[0].length;
    }
    if (i < s.length) el.appendChild(document.createTextNode(s.slice(i)));
    return el;
  }
  function hv(tag, cls, noi) { return vanBan(h(tag, cls), noi); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var TAY_TEN = ['arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right'];     // lệnh tay gắp: nhóm TAY (màu cam) trong kho khối
  var CHAN_TEN = ['crouch', 'stand'];                          // lệnh chân của nhện: co / duỗi chân (cùng nhóm CHÂN với go_*)
  var NC_TEN = ['magnet_n', 'magnet_s', 'magnet_off'];         // lệnh tay nam châm (cực N / cực S / ngắt điện): nhóm NAM CHÂM (cùng màu cam với tay) trong kho khối
  var NEM_TEN = ['aim', 'throw', 'load'];                      // lệnh máy ném: nhóm MÁY NÉM (cùng màu cam với tay); aim(n) mang một số 1–3
  var SUNG_TEN = ['shoot', 'shoot_back'];                      // lệnh SÚNG HƠI (bắn ra trước + giật lùi / bắn ra sau + giật tới): nhóm SÚNG HƠI (cùng màu cam với tay)
  var SON_TEN = ['ink', 'dot', 'pen_down', 'pen_up'];           // lệnh MÁY SƠN: nhóm MÁY SƠN (cùng màu cam với tay); ink(c) mang một màu, đổi ngay như aim(n)
  function lopMau(ten) {
    if (ten === 'left_move' || ten === 'right_move' || ten === 'left_back' || ten === 'right_back') return 'cy';
    if (ten === 'wait') return 'yl';
    if (TAY_TEN.indexOf(ten) >= 0 || NC_TEN.indexOf(ten) >= 0 || NEM_TEN.indexOf(ten) >= 0 || SUNG_TEN.indexOf(ten) >= 0 || SON_TEN.indexOf(ten) >= 0) return 'tay';
    if (/^go_/.test(ten) || CHAN_TEN.indexOf(ten) >= 0) return 'chan';
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
  /* ---- NGOẶC NHỊP: code vẫn là Python thật; khung chỉ VẼ thêm một ngoặc mảnh (nâu đậm, bên phải dòng, khác ngoặc tím của `for`) gom các dòng lệnh gốc thuộc cùng một nhịp,
         từ sau `wait()` trước (hay đầu khối) tới hết `wait()` kế tiếp, kèm nhãn nhỏ "nhịp k" ở dòng wait(). Chỉ gom lệnh gốc "chỉ ra lệnh" (bánh, trượt, tay, kẹp, đẩy, nam châm, ném, bắn)
         và wait(); aim(n) tác dụng ngay nên đứng trong nhóm hay ngoài nhóm đều không ngắt; dòng khác (hàm của em, for / if / while, gán biến, chú thích, dòng trống) ngắt nhóm;
         đổi bậc thụt cũng ngắt. Nhãn đánh số từ 1 trong mỗi dãy nhóm liền nhau, dãy mới (sau dòng ngắt) đánh lại từ 1. Nhện / drone (go_* tự trôi nhịp) không dùng ngoặc này (Editor tuyChon.veNhip). */
  var LENH_NHIP = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'magnet_n', 'magnet_s', 'magnet_off', 'load', 'throw', 'shoot', 'shoot_back', 'dot', 'pen_down', 'pen_up'];
  var RE_LENH_DON = /^\s*([A-Za-z_]\w*)\s*\([^()]*\)\s*(#.*)?$/;
  /** Mảng dòng code → [{ tu, den, so }]: nhóm một nhịp từ dòng tu tới dòng den (chỉ số từ 0, đều gồm), so = thứ tự nhịp trong dãy liền nhau. */
  function nhomNhip(arr) {
    var kq = [], mo = -1, bacMo = 0, truocDen = -9, bacTruoc = -1, so = 0;
    for (var i = 0; i < arr.length; i++) {
      var d = chuoi(arr[i]), m = RE_LENH_DON.exec(d), ten = m ? m[1] : '', bac = bacCua(d);
      var laLenh = LENH_NHIP.indexOf(ten) >= 0, laWait = ten === 'wait', laAim = ten === 'aim' || ten === 'ink';       // ink(c) cũng đổi ngay như aim(n)
      if (!laLenh && !laWait && !laAim) { mo = -1; continue; }          // dòng khác: ngắt nhóm đang mở
      if (mo >= 0 && bac !== bacMo) mo = -1;                              // đổi bậc thụt: bỏ nhóm dở
      if (laAim) continue;
      if (mo < 0) { mo = i; bacMo = bac; }
      if (laWait) {
        so = (mo === truocDen + 1 && bacMo === bacTruoc) ? so + 1 : 1;                // liền ngay nhóm trước và cùng bậc thụt thì đánh số tiếp
        kq.push({ tu: mo, den: i, so: so });
        truocDen = i; bacTruoc = bacMo; mo = -1;
      }
    }
    return kq;
  }
  /* ---- MỖI BỘ PHẬN MỘT LỆNH MỖI NHỊP. Lõi chỉ làm lệnh ĐẦU của mỗi bộ phận trong một nhịp (lệnh sau bị bỏ: 'banh-goi-lai', 'tay-goi-lai', 'magnet-goi-lai'…)
     và trong một nhịp xe chỉ đi MỘT kiểu: chạy bánh, trượt (omni không đi chéo) hay đứng yên để bắn / đẩy. Khung chương trình KHÔNG cho chèn lệnh phạm luật đó
     (Editor.chenTai → tuyChon.khiCamNhip(lý do)); khay làm mờ + ổ khóa các khối ấy theo NHỊP ĐANG SOẠN (Editor.camNhip → tuyChon.khiNhip → Palette.datCamNhip).
     Nhịp đang soạn = các dòng lệnh gốc liền trên / liền dưới chỗ chèn, cùng bậc thụt, giữa hai ranh nhịp wait() / go_*() (nhện, drone). Kéo đổi chỗ dòng không bị chặn. */
  var BO_PHAN_LENH = {
    banhT: ['left_move', 'left_back'], banhP: ['right_move', 'right_back'], truot: ['slide_left', 'slide_right'],
    tay: ['arm_down', 'arm_up'], xoay: ['arm_left', 'arm_right'], kep: ['grab', 'release'], namCham: ['magnet_n', 'magnet_s', 'magnet_off'],
    nem: ['load', 'throw'], sung: ['shoot', 'shoot_back'], chan: ['crouch', 'stand'], son: ['dot', 'pen_down', 'pen_up']
  };
  var BP_CUA = {};
  Object.keys(BO_PHAN_LENH).forEach(function (bp) { BO_PHAN_LENH[bp].forEach(function (l) { BP_CUA[l] = bp; }); });
  var KIEU_DI = { banhT: 'banh', banhP: 'banh', truot: 'truot', sung: 'dung' };       // một nhịp một kiểu đi
  var RE_HET_NHIP = /^(wait|go_up|go_down|go_left|go_right)$/;
  /** Tên lệnh của một dòng lệnh đơn (`ten(...)`), hoặc ''. */
  function tenDon(d) { var m = RE_LENH_DON.exec(chuoi(d)); return m ? m[1] : ''; }
  /** Lệnh gốc cùng NHỊP với chỗ chèn (vị trí at, bậc b): dòng lệnh gốc liền trên / liền dưới cùng bậc, dừng ở ranh nhịp (wait / go_*) hay dòng khác. aim(n) không thuộc bộ phận nào, bỏ qua. */
  function lenhCungNhip(arr, at, b) {
    var ds = [], i, ten;
    function laLenh(d) { if (bacCua(d) !== b) return false; ten = tenDon(d); return !!ten && !RE_HET_NHIP.test(ten) && (!!BP_CUA[ten] || ten === 'aim' || ten === 'ink'); }
    for (i = at - 1; i >= 0 && laLenh(arr[i]); i--) ds.push(ten);
    for (i = at; i < arr.length && laLenh(arr[i]); i++) ds.push(ten);
    return ds;
  }
  /** Lý do KHÔNG chèn được lệnh gốc `ten` vào nhịp đang có các lệnh ds, hoặc null nếu được. */
  function lyDoCamNhip(ten, ds) {
    var bp = BP_CUA[ten]; if (!bp) return null;
    for (var i = 0; i < ds.length; i++) {
      var bk = BP_CUA[ds[i]]; if (!bk) continue;
      if (bk === bp) return window.t('choi.motLenh', { bp: window.t('choi.bp.' + bp), lenh: ds[i] });
      if (KIEU_DI[bp] && KIEU_DI[bk] && KIEU_DI[bp] !== KIEU_DI[bk]) return window.t('choi.motKieuDi', { lenh: ds[i] });
    }
    return null;
  }
  /** Màn có cấu trúc `k` (vd. 'for') không. Chưa có trường cauTruc thì coi như []. */
  function coCauTruc(man, k) { return !!(man && Array.isArray(man.cauTruc) && man.cauTruc.indexOf(k) >= 0); }

  /* ---- đối số của một dòng: `for i in range(n):` (một đối số) hoặc lời gọi `ten(a, b)`. Số hoặc tên biến đơn giản là "ô chạm được" (.num). */
  var RE_FOR_DS = /^(\s*for\s+[A-Za-z_]\w*\s+in\s+range\()([^)]*)(\):.*)$/;
  var RE_FOR_CH = /^(\s*for\s+[A-Za-z_]\w*\s+in\s+)("[^"]*"|[A-Za-z_]\w*)(\s*:.*)$/;                       // for c in "UUR": / for c in path:
  var RE_IF_DS = /^(\s*(?:if|elif)\s+)([A-Za-z_]\w*)(\s*==\s*)("[^"]*"|[A-Za-z_]\w*)(\s*:.*)$/;            // if d == "U": / elif d == "D":
  var RE_DK = /^(\s*(?:while|if|elif)\s+)((?:not\s+)?[A-Za-z_]\w*\(\)|True|False)(\s*:.*)$/;                        // while front_clear(): / if not right_clear(): / while True:
  var RE_GOI_DS = /^(\s*([A-Za-z_]\w*)\()([^)]*)(\).*)$/;
  var RE_SO = /^\d+$/, RE_BIEN = /^[A-Za-z_]\w*$/, RE_CHUOI = /^"[^"]*"$/, RE_BTH = /^(\d+|[A-Za-z_]\w*)\s*[-+]\s*(\d+|[A-Za-z_]\w*)$/;      // RE_BTH: biểu thức đơn giản `3 - i`, `i + 1` (đối số aim)

  /* ---- DANH SÁCH (gói List, man.cauTruc có 'list'; TP.datCheList): `a = [2, 3, 1]`, `for n in a:`, `for n in [2, 3]:`, `a.append(1)` và danh sách đặt thẳng làm đối số `weave([2, 3, 1])`.
         Mỗi phần tử là một ô chạm được (.num.ptu): chạm → bảng chọn giá trị (số / màu) + "thêm ô" (chèn ngay sau ô này) + "bỏ ô"; danh sách rỗng có ô "+". Tên danh sách cũng là ô chạm được (chọn tên khác).
         Một dòng danh sách tách thành { ds: [ô chạm được], cau: [đoạn { lit, tu, den }] }: đoạn lit = một danh sách [..] gồm các ô ds[tu..den-1] (den == tu: rỗng); đoạn không lit = một ô ds[tu];
         ghep(ds, cau) ghép lại thành dòng code. Chế độ này chỉ bật ở màn có cauTruc 'list': các chương cũ giữ nguyên cách tách dòng. */
  var CHE_LIST = false;
  function datCheList(b) { CHE_LIST = !!b; }
  function coListCua(man) { return coCauTruc(man, 'list'); }
  var LIST_TEN_GOI_Y = ['a', 'b', 'c', 'steps', 'route'], LIST_TOI_DA = 6;                                // tên gợi ý · số phần tử tối đa của một danh sách vẽ trên khung ("thêm ô" mờ khi đủ)
  var RE_GAN_LS = /^(\s*)([A-Za-z_]\w*)(\s*=\s*)\[([^\]]*)\]\s*$/;                                         // a = [2, 3, 1]
  var RE_FOR_LSLIT = /^(\s*for\s+[A-Za-z_]\w*\s+in\s+)\[([^\]]*)\](\s*:.*)$/;                               // for n in [2, 3]:
  var RE_FOR_LS = /^(\s*for\s+[A-Za-z_]\w*\s+in\s+)([A-Za-z_]\w*)(\s*:.*)$/;                               // for n in a:
  var RE_THEM_LS = /^(\s*)([A-Za-z_]\w*)\.append\((.*)\)\s*$/;                                              // a.append(1)
  var RE_GOI_LS = /^(\s*([A-Za-z_]\w*)\()(.*)(\)\s*)$/;                                                    // ten(...): đối số có thể là danh sách, a[i], len(a)
  var RE_FOR_RANGE_LEN = /^(\s*for\s+[A-Za-z_]\w*\s+in\s+range\()(.*len\(.*)(\):.*)$/;                      // for i in range(len(a)):
  var RE_PTU_CHI = /^[A-Za-z_]\w*\[(?:\d+|[A-Za-z_]\w*)\]$/, RE_LEN_DS = /^len\([A-Za-z_]\w*\)$/;       // a[0] · a[i] · len(a): số lấy từ danh sách
  /** Cắt chuỗi theo dấu phẩy NGOÀI ngoặc và nháy: "[1, 2], 3" → ["[1, 2]", "3"]; chuỗi rỗng → []. */
  function catTop(str) {
    var kq = [], sau = 0, sau2 = 0, nhay = null, i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charAt(i);
      if (nhay) { if (c === nhay) nhay = null; }
      else if (c === '"' || c === "'") nhay = c;
      else if (c === '(' || c === '[') sau2++;
      else if (c === ')' || c === ']') sau2--;
      else if (c === ',' && sau2 === 0) { kq.push(str.slice(sau, i).trim()); sau = i + 1; }
    }
    var cuoi = str.slice(sau).trim();
    if (cuoi !== '' || kq.length) kq.push(cuoi);
    return kq;
  }
  function ghepCau(ds, cau) {
    return cau.map(function (c) { return c.lit ? '[' + ds.slice(c.tu, c.den).join(', ') + ']' : ds[c.tu]; }).join(', ');
  }
  /** Thêm vào ds các ô của danh sách đối số args (chuỗi), trả về cau. */
  function cauTuArgs(args, ds) {
    return args.map(function (a) {
      if (a.length > 1 && a.charAt(0) === '[' && a.charAt(a.length - 1) === ']') {
        var tu = ds.length;
        catTop(a.slice(1, -1)).forEach(function (e) { ds.push(e); });
        return { lit: true, tu: tu, den: ds.length };
      }
      ds.push(a); return { lit: false, tu: ds.length - 1, den: ds.length };
    });
  }
  /** Tách một dòng danh sách (xem trên): { loai: 'ganList' | 'forLit' | 'forList' | 'themList' | 'goiList', ds, cau, ghep } hay (đối số có len(a) / a[i]) cùng dạng với tachDoiSo; null nếu không phải. */
  function tachList(dong) {
    var m, ds, cau, args;
    if ((m = RE_GAN_LS.exec(dong))) {
      ds = [m[2]]; cau = cauTuArgs(['[' + m[4] + ']'], ds);
      return { loai: 'ganList', ten: '', tien: m[1], ds: ds, cau: cau, noi: ', ', hau: '', laFor: false, ghep: function (x, c) { return m[1] + x[0] + m[3] + ghepCau(x, c); } };
    }
    if ((m = RE_FOR_LSLIT.exec(dong))) {
      ds = []; cau = cauTuArgs(['[' + m[2] + ']'], ds);
      return { loai: 'forLit', ten: '', tien: m[1], ds: ds, cau: cau, noi: ', ', hau: m[3], laFor: true, ghep: function (x, c) { return m[1] + ghepCau(x, c) + m[3]; } };
    }
    if ((m = RE_FOR_LS.exec(dong)) && !KIEU_TEN_GHEP.test(m[2])) {
      return { loai: 'forList', ten: '', tien: m[1], ds: [m[2]], cau: [{ lit: false, tu: 0, den: 1 }], noi: ', ', hau: m[3], laFor: true, ghep: function (x) { return m[1] + x[0] + m[3]; } };
    }
    if ((m = RE_THEM_LS.exec(dong))) {
      args = m[3].trim() === '' ? [] : catTop(m[3]); ds = [m[2]]; cau = cauTuArgs(args, ds);
      return { loai: 'themList', ten: '', tien: m[1], ds: ds, cau: cau, noi: ', ', hau: ')', laFor: false, ghep: function (x, c) { return m[1] + x[0] + '.append(' + ghepCau(x, c) + ')'; } };
    }
    if ((m = RE_FOR_RANGE_LEN.exec(dong))) {
      return { loai: 'range', ten: '', tien: m[1], ds: catTop(m[2]), noi: ', ', hau: m[3], laFor: true };
    }
    if ((m = RE_GOI_LS.exec(dong)) && /\[|len\(/.test(m[3])) {
      args = m[3].trim() === '' ? [] : catTop(m[3]); ds = []; cau = cauTuArgs(args, ds);
      if (!cau.some(function (c) { return c.lit; })) return { loai: 'goi', ten: m[2], tien: m[1], ds: args, noi: ', ', hau: m[4], laFor: false };
      return { loai: 'goiList', ten: m[2], tien: m[1], ds: ds, cau: cau, noi: ', ', hau: m[4], laFor: false, ghep: function (x, c) { return m[1] + ghepCau(x, c) + m[4]; } };
    }
    return null;
  }
  /** Đoạn { i, c } của dòng đã tách chứa ô k (đoạn lit chứa ô k, hay đoạn đơn có ô k), hoặc null (vd. ô tên danh sách). */
  function segCua(d, k) {
    if (!d || !d.cau) return null;
    for (var i = 0; i < d.cau.length; i++) {
      var c = d.cau[i];
      if (c.lit ? (k >= c.tu && k < c.den) : c.tu === k) return { i: i, c: c };
    }
    return null;
  }
  /** Chèn phần tử `v` vào danh sách (đoạn seg) của dòng, ngay sau ô k (danh sách rỗng thì vào đầu). Dòng không đổi nếu không phải danh sách hay đã đủ LIST_TOI_DA ô. */
  function themPtuDong(dong, seg, k, v) {
    var d = tachDoiSo(dong), c = d && d.cau ? d.cau[seg] : null;
    if (!c || !c.lit || c.den - c.tu >= LIST_TOI_DA) return dong;
    var pos = c.den === c.tu ? c.tu : Math.max(c.tu, Math.min(k + 1, c.den));
    d.ds.splice(pos, 0, String(v));
    d.cau.forEach(function (x) { if (x === c) x.den++; else if (x.tu >= pos) { x.tu++; x.den++; } });
    return d.ghep(d.ds, d.cau);
  }
  /** Bỏ ô k khỏi danh sách (đoạn seg) của dòng; bỏ hết thì danh sách rỗng `[]`. */
  function boPtuDong(dong, seg, k) {
    var d = tachDoiSo(dong), c = d && d.cau ? d.cau[seg] : null;
    if (!c || !c.lit || k < c.tu || k >= c.den) return dong;
    d.ds.splice(k, 1);
    d.cau.forEach(function (x) { if (x === c) x.den--; else if (x.tu > k) { x.tu--; x.den--; } });
    return d.ghep(d.ds, d.cau);
  }
  /** Thay cả danh sách đặt thẳng (đoạn seg) bằng một tên danh sách `ten` (thẻ biến của hàm có tham số danh sách thả lên dòng `weave([2, 3, 1])` → `weave(steps)`). */
  function litThanhTen(dong, seg, ten) {
    var d = tachDoiSo(dong), c = d && d.cau ? d.cau[seg] : null;
    if (!c || !c.lit) return dong;
    var bot = (c.den - c.tu) - 1;
    d.ds.splice(c.tu, c.den - c.tu, ten);
    d.cau.forEach(function (x) { if (x === c) { x.lit = false; x.den = x.tu + 1; } else if (x.tu > c.tu) { x.tu -= bot; x.den -= bot; } });
    return d.ghep(d.ds, d.cau);
  }

  /* ---- chương CẢM BIẾN MÀU: điều kiện của while / if / elif gồm một hay hai vế nối bằng and / or.
     Vế là: lời gọi cảm biến (`front_clear()`, `not left_clear()`) hoặc phép so sánh màu `color() != "red"` / `c == "green"` / `color() != c`.
     Chế độ này chỉ bật ở màn có color() (TP.datCheMau): các chương cũ giữ nguyên cách tách dòng. */
  var CHE_MAU = false, CHE_PIN = false;                                                       // CHE_PIN: màn drone có pin: điều kiện `battery() < 3` cũng tách thành ô chạm được (số, phép so sánh)
  var MAU_DS = ['red', 'green', 'blue', 'yellow', 'none'];                                   // các giá trị color() có thể trả về
  var MAU_LOP = { red: 'g-rd', green: 'g-gr', blue: 'g-bl', yellow: 'g-yl', none: 'g-gy' };
  var RE_DKM = /^(\s*(?:while|if|elif)\s+)([^:]+?)(\s*:.*)$/;
  var RE_CL_SS = /^((?:color|look)\(\)|[A-Za-z_]\w*)\s*(==|!=)\s*("[^"]*"|[A-Za-z_]\w*(?:\(\))?)$/;
  var RE_CL_CAM = /^(?:not\s+)?[A-Za-z_]\w*\(\)$|^(?:True|False)$/;
  var RE_GAN_MAU = /^\s*([A-Za-z_]\w*)\s*=\s*(color|look)\(\)\s*(#.*)?$/;                    // c = color() / c = look() (drone có camera nhìn xuống)
  var HAM_MAU = 'color';                                                                      // hàm đọc màu của màn đang mở: 'color' (cảm biến màu, camera ở xe) hay 'look' (camera nhìn xuống của drone); khối mẫu và bảng chọn điều kiện dùng tên này
  /* ---- BIẾN ĐẾM (chương che-cam-bien, man.bienDem): `n = 0` đặt biến về một số, `n = n + 1` tăng biến; `for i in range(n):` lấy n làm số lần lặp (ô biến chạm đổi được) */
  var RE_GAN_DEM = /^\s*([A-Za-z_]\w*)\s*=\s*(\d+)\s*$/;
  var RE_TANG_DEM = /^\s*([A-Za-z_]\w*)\s*=\s*([A-Za-z_]\w*)\s*\+\s*(\d+)\s*$/;
  var RE_CL_PIN = /^battery\(\)\s*(<=|>=|<|>|==|!=)\s*(\d+)$/;                                  // battery() < 3: đo pin so với một số
  var PIN_SS = ['<', '<=', '>', '>='];                                                          // vòng đổi phép so sánh khi chạm
  function datCheMau(b, pin) { CHE_MAU = !!b; CHE_PIN = !!pin; HAM_MAU = b === 'look' ? 'look' : 'color'; }       // b: coMauCua(man) = tên hàm đọc màu của màn ('color' | 'look') hay false
  function cheDkm() { return CHE_MAU || CHE_PIN; }
  /** Màn có cảm biến màu (hamGoc có color). */
  /** Màn có điều kiện để viết while / if không: có cảm biến (front_clear, front_metal…) hay color(). Chương nam châm đầu (không cảm biến) thì không: ẩn khối while / if mẫu. */
  function coDieuKienCua(man) {
    var goc = (man && man.hamGoc) || [];
    if (goc.indexOf('battery') >= 0 || goc.indexOf('look') >= 0) return true;    // drone có đo pin hay camera nhìn xuống: while / if với battery() / look()
    if (man && man.loaiRobot === 'drone') return false;                          // drone chưa có đo pin: chưa có gì để so sánh
    if (!goc.some(function (n) { return NC_TEN.indexOf(n) >= 0; })) return true;
    return camBienCua(man).length > 0 || goc.indexOf('color') >= 0;
  }
  /** Màn có hàm đọc màu không: trả TÊN hàm ('look' nếu có camera nhìn xuống của drone, không thì 'color') hay false. Truthy = màn có đọc màu (spec.mau, datCheMau). */
  function coMauCua(man) { var g = (man && man.hamGoc) || []; return g.indexOf('look') >= 0 ? 'look' : g.indexOf('color') >= 0 ? 'color' : false; }
  /** Màn có đo pin battery() (drone có pin): khối giá trị số dùng trong so sánh của while / if. */
  function coPinCua(man) { return ((man && man.hamGoc) || []).indexOf('battery') >= 0; }
  /** Tách điều kiện màu của một dòng while / if / elif: { loai: 'dkm', tien, hau, ds: [chữ từng ô], tok: [{ vt: 'cam' | 'lhs' | 'op' | 'rhs' | 'noi', ci: vế, t }], cl: [vế], nx: [and | or] } hoặc null. */
  function tachDKM(dong) {
    var m = RE_DKM.exec(chuoi(dong)); if (!m) return null;
    var parts = m[2].trim().split(/\s+(and|or)\s+/), cl = [], nx = [], tok = [], i;
    for (i = 0; i < parts.length; i++) { if (i % 2) nx.push(parts[i]); else cl.push(parts[i].trim()); }
    if (cl.length > 2) return null;
    var coVePin = false;
    for (i = 0; i < cl.length; i++) {
      var pn = RE_CL_PIN.exec(cl[i]), ss = pn ? null : RE_CL_SS.exec(cl[i]);
      if (i) tok.push({ vt: 'noi', ci: i, t: nx[i - 1] });
      if (pn) { coVePin = true; tok.push({ vt: 'lhs', ci: i, t: 'battery()' }, { vt: 'op', ci: i, t: pn[1] }, { vt: 'rhs', ci: i, t: pn[2] }); }
      else if (ss) tok.push({ vt: 'lhs', ci: i, t: ss[1] }, { vt: 'op', ci: i, t: ss[2] }, { vt: 'rhs', ci: i, t: ss[3] });
      else if (RE_CL_CAM.test(cl[i])) tok.push({ vt: 'cam', ci: i, t: cl[i] });
      else return null;
    }
    if (!CHE_MAU && !coVePin) return null;                                 // chỉ màn drone có pin: chỉ điều kiện có battery() mới tách ô (các `if d == "U":` giữ cách cũ)
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
    if (CHE_LIST) { var dl = tachList(dong); if (dl) return dl; }          // dòng danh sách (a = [1, 2], for n in a:, a.append(1), weave([1, 2]), forward(len(a)), range(len(a)))
    if (cheDkm()) { var dm = tachDKM(dong); if (dm) return dm; }
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
    return d.ghep ? d.ghep(d.ds, d.cau) : d.tien + d.ds.join(d.noi) + d.hau;
  }
  /** Ô chạm được của đối số: số (data-so), chuỗi có nháy (data-chuoi) hoặc tên biến (data-bien); k = thứ tự trong dòng. */
  function oDoiSo(v, k) {
    if (RE_SO.test(v)) return '<span class="num" data-k="' + k + '" data-so="' + v + '">' + v + '</span>';
    if (RE_CHUOI.test(v)) return '<span class="num chuoi' + (MAU_DS.indexOf(v.slice(1, -1)) >= 0 ? ' chuoi-mau mc-' + v.slice(1, -1) : '') + '" data-k="' + k + '" data-so="0" data-chuoi="' + esc(v.slice(1, -1)) + '">' + esc(v) + '</span>';       // tên màu (ink("red"), stop_on("blue")): ô màu
    if (RE_BTH.test(v) || RE_PTU_CHI.test(v) || RE_LEN_DS.test(v)) return '<span class="num bien bth" data-k="' + k + '" data-so="0" data-bien="' + esc(v) + '">' + esc(v) + '</span>';        // 3 - i · a[0] · a[i] · len(a)
    if (RE_BIEN.test(v)) return '<span class="num bien" data-k="' + k + '" data-so="0" data-bien="' + esc(v) + '">' + esc(v) + '</span>';
    return '<span class="ar">' + esc(v) + '</span>';
  }

  /** Ô chạm được của một phần điều kiện màu (xem tachDKM): vế cảm biến / vế trái (teal), phép so sánh (== / !=), vế phải (màu hay biến), chữ nối and / or. */
  function oDkm(o, k) {
    var t = o.t, base = '<span class="num dkc dkm ' + o.vt;
    var at = '" data-k="' + k + '" data-so="0" data-vt="' + o.vt + '" data-dkm="' + esc(t) + '">' + esc(t) + '</span>';
    if (o.vt === 'rhs' && RE_SO.test(t)) return '<span class="num dkm rhs pinso" data-k="' + k + '" data-so="' + esc(t) + '" data-vt="rhs" data-dkm="' + esc(t) + '">' + esc(t) + '</span>';          // số của phép so sánh pin: ô số tím như range(n)
    if (o.vt === 'rhs') {
      var chu = RE_CHUOI.exec(t) ? t.slice(1, -1) : null;
      if (chu !== null) return base + ' chuoi-mau ' + (MAU_DS.indexOf(chu) >= 0 ? 'mc-' + chu : 'mc-sai') + at.replace('data-so="0"', 'data-so="0" data-chuoi="' + esc(chu) + '"');
      return base + ' bien' + at;
    }
    return base + at;
  }
  /** Ô chạm được của điều kiện (front_clear(), not right_clear(), True…): bấm để chọn điều kiện khác. */
  function oDieuKien(v) { return '<span class="num dkc" data-k="0" data-so="0" data-dk="' + esc(v) + '">' + esc(v) + '</span>'; }
  /** Ô chạm được của một phần tử danh sách: số (tím như range(n)), màu (chip màu), hay biểu thức khác (không chạm đổi được). k = ô trong dòng, seg = đoạn danh sách chứa nó. */
  function oPtu(v, k, seg) {
    var at = ' data-k="' + k + '" data-seg="' + seg + '" data-ptu="1"';
    if (RE_SO.test(v)) return '<span class="num ptu"' + at + ' data-so="' + v + '">' + v + '</span>';
    if (RE_CHUOI.test(v)) {
      var chu = v.slice(1, -1);
      return '<span class="num ptu chuoi chuoi-mau ' + (MAU_DS.indexOf(chu) >= 0 ? 'mc-' + chu : 'mc-sai') + '"' + at + ' data-so="0" data-chuoi="' + esc(chu) + '">' + esc(v) + '</span>';
    }
    return '<span class="ar">' + esc(v) + '</span>';
  }
  /** Tô một dòng danh sách đã tách bằng tachList. */
  function veList(d) {
    var ds = d.ds, cau = d.cau || [];
    function ten(k) { return '<span class="num lsten" data-k="' + k + '" data-so="0" data-bien="' + esc(ds[k]) + '">' + esc(ds[k]) + '</span>'; }
    function kwFor() { var mf = /^\s*for\s+([A-Za-z_]\w*)\s+in\s+$/.exec(d.tien); return '<span class="kw">for </span><span class="vr">' + esc(mf ? mf[1] : 'n') + ' </span><span class="kw">in </span>'; }
    function doan(c, ci) {
      if (!c.lit) return oDoiSo(ds[c.tu], c.tu);
      if (c.den === c.tu) return '<span class="pg"><span class="pu">[</span><span class="num ptu them" data-k="' + c.tu + '" data-seg="' + ci + '" data-ptu="1" data-them="1" data-so="0">+</span><span class="pu">]</span></span>';
      var ht = '', k;                                                              // mỗi phần tử đi kèm dấu [ đầu / dấu phẩy sau (.pg không bị cắt dòng giữa chừng khi danh sách dài xuống hai dòng)
      for (k = c.tu; k < c.den; k++) ht += '<span class="pg">' + (k === c.tu ? '<span class="pu">[</span>' : '') + oPtu(ds[k], k, ci) + (k < c.den - 1 ? '<span class="pu cp">,</span>' : '<span class="pu">]</span>') + '</span>';
      return ht;
    }
    if (d.loai === 'ganList') return ten(0) + '<span class="pu"> = </span>' + doan(cau[0], 0);
    if (d.loai === 'forLit') return kwFor() + doan(cau[0], 0) + '<span class="pu">:</span>';
    if (d.loai === 'forList') return kwFor() + ten(0) + '<span class="pu">:</span>';
    if (d.loai === 'themList') return ten(0) + '<span class="pu">.</span><span class="fn">append</span><span class="pu">(</span>' + (cau.length ? doan(cau[0], 0) : '') + '<span class="pu">)</span>';
    var ht2 = '<span class="fn">' + esc(d.ten) + '</span><span class="pu">(</span>';                       // goiList
    cau.forEach(function (c, ci) { ht2 += (ci ? '<span class="pu">, </span>' : '') + doan(c, ci); });
    return ht2 + '<span class="pu">)</span>';
  }
  /** Tô màu một dòng code (ngôn ngữ giữ nguyên tiếng Anh). Dấu cách đầu dòng bị bỏ: bậc thụt do khung vẽ bằng lề. */
  function mauDong(text) {
    text = boThut(text);
    if (/^#/.test(text)) return '<span class="cm">' + esc(text) + '</span>';
    if (CHE_LIST) { var dl = tachList(text); if (dl && dl.cau) return veList(dl); }
    if (cheDkm()) {
      var dkm = tachDKM(text);
      if (dkm) {
        var kw = /^\s*(\w+)/.exec(dkm.tien)[1], ht = '<span class="kw ' + (kw === 'while' ? 'wh' : 'if') + '">' + kw + ' </span>';
        dkm.tok.forEach(function (o, k) { ht += oDkm(o, k) + (o.vt === 'noi' ? '<span class="ngat"></span>' : ''); });       // điều kiện hai vế: xuống dòng sau and / or (hai dòng nhỏ trong một ô)
        return ht + '<span class="pu">:</span>';
      }
      var gm = RE_GAN_MAU.exec(text);
      if (gm) return '<span class="vr">' + esc(gm[1]) + '</span><span class="pu"> = </span><span class="fn">' + gm[2] + '</span><span class="pu">()</span>';
    }
    var f = /^for\s+([A-Za-z_]\w*)\s+in\s+range\(\s*(\d+|[A-Za-z_]\w*|len\([A-Za-z_]\w*\))\s*\):\s*$/.exec(text);
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
    var gd = RE_GAN_DEM.exec(text);                                                  // n = 0
    if (gd) return '<span class="vr dem">' + esc(gd[1]) + '</span><span class="pu"> = </span><span class="lit">' + gd[2] + '</span>';
    var td = RE_TANG_DEM.exec(text);                                                 // n = n + 1
    if (td && td[1] === td[2]) return '<span class="vr dem">' + esc(td[1]) + '</span><span class="pu"> = </span><span class="vr dem">' + esc(td[2]) + '</span><span class="pu"> + </span><span class="lit">' + td[3] + '</span>';
    var m = /^([A-Za-z_]\w*)\((.*)\)\s*$/.exec(text);
    if (!m) return esc(text);
    var cls = m[1] === 'left_move' || m[1] === 'right_move' || m[1] === 'left_back' || m[1] === 'right_back' ? 'mv'
      : m[1] === 'wait' ? 'wt' : TAY_TEN.indexOf(m[1]) >= 0 || NC_TEN.indexOf(m[1]) >= 0 || NEM_TEN.indexOf(m[1]) >= 0 || SUNG_TEN.indexOf(m[1]) >= 0 || SON_TEN.indexOf(m[1]) >= 0 ? 'ty' : /^go_/.test(m[1]) ? 'mv' : /^slide_/.test(m[1]) ? 'sl' : 'fn';
    var args = m[2].trim() === '' ? '' : m[2].split(',').map(function (x, k) { return oDoiSo(x.trim(), k); }).join('<span class="pu">, </span>');
    return '<span class="' + cls + '">' + esc(m[1]) + '</span><span class="pu">(</span>' + args + '<span class="pu">)</span>';
  }

  /** Dòng dài (chuỗi chữ dài trong `for c in "…":` hay `walk("…")`): co chữ cho vừa ô, không dưới 9px; vẫn tràn thì chuỗi tự rút gọn bằng "…" (CSS .num.chuoi). */
  function vuaDong(el) {
    el.style.fontSize = '';
    if (!el.clientWidth || !el.querySelector('.chuoi, .dkc, .ptu, .lsten')) return;
    el.classList.add('ko-cat');                                                    // đo với chuỗi chưa bị cắt
    var fs = parseFloat(getComputedStyle(el).fontSize) || 15;
    while (el.scrollWidth > el.clientWidth + 1 && fs > 9) { fs -= 0.5; el.style.fontSize = fs + "px"; }
    var tran = el.scrollWidth > el.clientWidth + 1;
    el.classList.remove('ko-cat');
    if (tran && el.querySelector('.ptu, .lsten') && !el.classList.contains('hai')) { el.classList.add('hai'); el.style.fontSize = ''; }       // danh sách dài vẫn tràn ở cỡ chữ nhỏ nhất: xuống hai dòng nhỏ trong cùng một ô (như điều kiện hai vế)
  }

  /* ------------------------------------------------------------- Editor */
  /** Giao diện vector (V5a): dòng code đổi chỗ trượt mượt thay vì nhảy bậc steps(); máy đặt giảm chuyển động thì không trượt. (V7c2: luôn vector.) */
  function veMuot() { return true; }
  function giamChuyenDong() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  /**
   * Khung 10 ô. tuyChon: { tong: 10, dung: số ô dùng được, lay: () => mảng dòng (sửa tại chỗ),
   *   bang: phần tử panel (để nháy đỏ + chứa thông báo "Đã xóa · Hoàn tác"), dem: phần tử đếm, khiDoi: fn, khiKhoa: fn,
   *   khiBam: fn(i) khi chạm một ô, dangChay: () => bool (đang chạy / phát lại thì tắt xóa nhanh),
   *   nutXoaHet: nút thùng rác ở tiêu đề (Editor tự làm mờ khi không có gì để xóa),
   *   thutLe: () => bool (màn có khối lồng như `for`: tiêu đề có thêm hai nút ⇤ ⇥, đặt ngay trước nutXoaHet),
   *   chiDoc: () => bool (màn khai chinhCoDinh: khung CHỈ ĐỌC — không chọn ô, sửa số, chèn, xóa, kéo; panel `bang` thêm lớp .co-dinh, host thêm .chi-doc) + khiChiDoc: fn (chạm / thả vào khung chỉ đọc),
   *   tt / ttDay / ttNgan: phần tử tiêu đề + chữ đầy đủ + chữ rút gọn (dùng khi tiêu đề không vừa) }
   * Xóa một dòng: chuột rê lên dòng có code thì ô số thứ tự đổi thành ✕ (bấm để xóa);
   * cảm ứng chạm HAI lần liên tiếp (≤ 350 ms) vào dòng có code. Mọi lần xóa đều hiện "Đã xóa · Hoàn tác" ~3 giây.
   * Thụt lề: mỗi dòng trong mảng giữ nguyên dấu cách đầu dòng (4 dấu cách = 1 bậc, tối đa 2 bậc); khung chỉ VẼ bậc bằng lề trái
   * và viền ngoặc tím nối từ dòng `for` tới dòng cuối thân. Khung không cho thụt sâu hơn (dòng trên có nghĩa) + 1 bậc.
   */
  function Editor(host, tuyChon) {
    var tong = tuyChon.tong || 10, dung = tuyChon.dung === undefined ? tong : tuyChon.dung;
    var lay = tuyChon.lay, sel = 0, runIdx = -1, loiSet = {}, lapSet = {}, ed = this;
    var daChon = false;                                           // người chơi vừa CHẠM CHỌN một dòng có code (sel = dòng đó): khối mới chèn XUỐNG DƯỚI dòng đó (user 22/10), không đẩy dòng đó xuống
    var rows = [], strips = [], brks = [], njs = [], xt = null, viTri = null;
    var hov = -1, kieuCuoi = 'mouse', cham = null, hoan = null, hoanHen = null, hoanEl = null;
    var nutRa = null, nutVao = null, boThutEl = null, thutCu = null;
    var hienX = -1, meoEl = null, meoHen = null;          // hienX: dòng đang hiện nút ✕ đỏ (cảm ứng: chạm dòng có code thì dòng được chọn VÀ hiện ✕) · bong bóng mẹo "Chèn nhầm? …" (chỉ hiện một lần)
    this.host = host; this.tong = tong;
    host.innerHTML = '';
    function dangChay() { return !!(tuyChon.dangChay && tuyChon.dangChay()); }
    /** Chương trình chính CỐ ĐỊNH (man.chinhCoDinh): khung chỉ đọc, không sửa / chèn / xóa / kéo; chạm hay thả vào thì báo khiChiDoc. */
    function chiDoc() { return !!(tuyChon.chiDoc && tuyChon.chiDoc()); }
    function baoChiDoc() { if (tuyChon.khiChiDoc) tuyChon.khiChiDoc(); }
    this.chiDoc = chiDoc;
    function choXoa() { return !xt && !dangChay() && !Chan.dang() && !chiDoc(); }
    function thutLe() { return !!(tuyChon.thutLe && tuyChon.thutLe()); }
    function soToiDa(ten, k) { return tuyChon.soToiDa ? (tuyChon.soToiDa(ten, k) || 9) : 9; }      // đối số số lớn nhất chọn được (aim: 3); mặc định 9
    function camDuoc() { return (tuyChon.camBien && tuyChon.camBien()) || []; }                  // hàm cảm biến của màn (front_clear…): điều kiện chạm đổi được
    function bienDuoc() { return (tuyChon.bienDuoc && tuyChon.bienDuoc()) || []; }       // tên các đối số của hàm đang sửa (dùng trong thân hàm)
    function kieuBienCua(ten) { return (tuyChon.kieuBien && tuyChon.kieuBien(ten)) || 'so'; }   // 'so' | 'don' (một chữ) | 'ghep' (chuỗi chữ) của một đối số của hàm đang sửa
    /** Kiểu ô của đối số k trong dòng đã tách d: 'so' | 'don' (một chữ U/D/L/R) | 'ghep' (chuỗi ghép) | 'bien' (ô biến của if) | 'dl' (chữ so sánh của if). */
    function kieuArg(d, k) {
      if (d && d.cau) {                                                    // dòng danh sách: tên danh sách · phần tử · đối số của lời gọi hàm
        if (d.loai === 'forList' || ((d.loai === 'ganList' || d.loai === 'themList') && k === 0)) return 'tenls';
        var sg = segCua(d, k);
        if (sg && sg.c.lit) return 'ptu';
        if (d.loai === 'themList') return RE_CHUOI.test(d.ds[k]) ? 'mauls' : 'so';       // giá trị đem thêm: số (kèm biến) hay màu
        var ka = tuyChon.kieuDoiSo && sg ? tuyChon.kieuDoiSo(d.ten, sg.i) : 'so';
        return ka === 'don' || ka === 'ghep' || ka === 'list' || ka === 'mau' ? ka : 'so';
      }
      if (!d || d.loai === 'range') return 'so';
      if (d.loai === 'forChuoi') return 'ghep';
      if (d.loai === 'dk') return 'dk';
      if (d.loai === 'dkm') return 'dkm';
      if (d.loai === 'if') return k === 0 ? 'bien' : 'dl';
      if (d.ten === 'ink') return 'mau';                                   // ink(c): bảng chọn bốn màu sơn
      if (d.ten === 'shoot' || d.ten === 'shoot_back') return 'luc';       // shoot(p): bảng chọn lực "fast" / "charge"
      var kd = tuyChon.kieuDoiSo ? tuyChon.kieuDoiSo(d.ten, k) : 'so';
      return kd === 'don' || kd === 'ghep' || kd === 'list' || kd === 'mau' || kd === 'luc' ? kd : 'so';
    }
    /** Biến kiểu kb có đặt được vào ô kiểu slot không (một chữ đặt được vào chuỗi ghép, ngược lại thì không). */
    function hopKieu(slot, kb) {
      if (slot === 'list' || slot === 'tenls') return kb === 'list';
      if (slot === 'so') return kb === 'so';
      if (slot === 'don') return kb === 'don';
      if (slot === 'luc') return kb === 'luc';                                                // ô lực bắn (shoot(p), fire(p)): biến lực
      if (slot === 'mau') return kb === 'mau' || kb === 'don' || kb === 'ghep';             // ô màu (ink(c), color_line(c, n)): biến màu, biến vòng for c in [màu…]
      if (slot === 'ghep' || slot === 'bien') return kb === 'don' || kb === 'ghep';
      return false;
    }
    /** Tên biến dùng được cho ô kiểu slot của dòng i (hoặc dòng sẽ chèn ở bậc bac): biến vòng for c in "…" bao quanh (trong cùng trước), rồi đối số của hàm đang sửa. */
    function bienTam(slot, i, bac, tenHam) {
      var arr = lay(), kq = [], j, cap = bac === undefined || bac === null ? bacCua(arr[i]) : bac, coBth = slot === 'so' && tenHam && soToiDa(tenHam, 0) === 3, vongSo = [];
      for (j = i - 1; j >= 0; j--) {
        if (!coY(arr[j])) continue;
        var b = bacCua(arr[j]);
        if (b >= cap) continue;
        cap = b;
        var fc = /^\s*for\s+([A-Za-z_]\w*)\s+in\s+("[^"]*"|[A-Za-z_]\w*)\s*:/.exec(chuoi(arr[j]));
        var kieuVong = 'don';                                                            // biến vòng for c in "…" là một chữ; for n in a: theo kiểu phần tử của danh sách (số hay chữ)
        if (CHE_LIST && fc && RE_BIEN.test(fc[2]) && !KIEU_TEN_GHEP.test(fc[2])) kieuVong = kieuPtuTai(fc[2], j) === 'chu' ? 'don' : 'so';
        var fl = CHE_LIST ? /^\s*for\s+([A-Za-z_]\w*)\s+in\s+\[([^\]]*)\]\s*:/.exec(chuoi(arr[j])) : null;
        if (fl) { fc = fl; kieuVong = catTop(fl[2]).some(function (e) { return RE_CHUOI.test(e); }) ? 'don' : 'so'; }
        if (fc && hopKieu(slot, kieuVong) && kq.indexOf(fc[1]) < 0) kq.push(fc[1]);
        var fr0 = CHE_LIST && slot === 'so' ? /^\s*for\s+([A-Za-z_]\w*)\s+in\s+range\(/.exec(chuoi(arr[j])) : null;
        if (fr0 && vongSo.indexOf(fr0[1]) < 0) vongSo.push(fr0[1]);
        var fr = coBth ? /^\s*for\s+([A-Za-z_]\w*)\s+in\s+range\(/.exec(chuoi(arr[j])) : null;      // đối số tầm ném (1–3) trong vòng for: i, i + 1, 3 - i
        if (fr) [fr[1], fr[1] + ' + 1', '3 - ' + fr[1]].forEach(function (b) { if (kq.indexOf(b) < 0) kq.push(b); });
      }
      bienDuoc().forEach(function (ten) { if (hopKieu(slot, kieuBienCua(ten)) && kq.indexOf(ten) < 0) kq.push(ten); });
      if (slot === 'so') for (j = 0; j < i && j < arr.length; j++) { var gd = RE_GAN_DEM.exec(chuoi(arr[j])); if (gd && kq.indexOf(gd[1]) < 0) kq.push(gd[1]); }       // biến đếm đã gán (n = 0) ở các dòng phía trên
      if (CHE_LIST && slot === 'so') {                                                    // số lấy từ danh sách: a[i] (i = biến vòng range), a[0], len(a)
        tenListTai(i).forEach(function (ds) {
          vongSo.forEach(function (v) { kq.push(ds + '[' + v + ']'); });
          kq.push(ds + '[0]', 'len(' + ds + ')');
        });
      }
      return kq;
    }
    /** Tên các danh sách dùng được ở dòng i: gán `a = [...]` ở các dòng phía trên, rồi đối số kiểu danh sách của hàm đang sửa. */
    function tenListTai(i) {
      var arr = lay(), kq = [], j, m;
      for (j = 0; j < i && j < arr.length; j++) if ((m = RE_GAN_LS.exec(chuoi(arr[j]))) && kq.indexOf(m[2]) < 0) kq.push(m[2]);
      bienDuoc().forEach(function (p) { if (kieuBienCua(p) === 'list' && kq.indexOf(p) < 0) kq.push(p); });
      return kq;
    }
    /** Kiểu phần tử của danh sách `ten` ở dòng i: 'so' (toàn số) hay 'chu' (có chuỗi / màu). Danh sách là đối số của hàm thì hỏi tuyChon.kieuPtuList (theo giá trị thử). */
    function kieuPtuTai(ten, i) {
      var arr = lay(), j, m;
      for (j = Math.min(i, arr.length) - 1; j >= 0; j--) {
        if ((m = RE_GAN_LS.exec(chuoi(arr[j]))) && m[2] === ten) {
          var els = catTop(m[4]);
          if (els.some(function (e) { return RE_CHUOI.test(e); })) return 'chu';
          if (HAM_MAU === 'look' && !els.length) return 'chu';                                      // màn có camera look(): danh sách rỗng `a = []` là danh sách MÀU (survey(a) sẽ ghi màu vào)
          var reThem = new RegExp('(^|[^\\w"])' + escRe(ten) + '\\.append\\(\\s*(look\\(\\)|"[^"]*")');
          return arr.some(function (x) { return reThem.test(chuoi(x)); }) ? 'chu' : 'so';           // a.append(look()) / a.append("red") ở đâu đó: phần tử là màu
        }
      }
      return (tuyChon.kieuPtuList && tuyChon.kieuPtuList(ten)) || 'so';
    }
    /** Khối `if d == "U":` mặc định của kho: đổi `d` thành biến có thật ở chỗ chèn (biến vòng for, rồi đối số của hàm đang sửa). */
    function thichNghi(txt, at, bac) {
      var m = /^(\s*(?:if|elif)\s+)d(\s*==.*)$/.exec(txt);
      if (!m) return CHE_LIST ? thichNghiList(txt, at) : txt;
      var vs = bienTam('bien', at, bac);
      return vs.length && vs.indexOf('d') < 0 ? m[1] + vs[0] + m[2] : txt;
    }
    /** Khối danh sách mặc định của kho (`a = [1, 2]`, `for n in a:`, `a.append(1)`): danh sách mới lấy tên chưa dùng (a, b, c…); for / append dùng tên danh sách vừa gán ở trên nếu `a` chưa có. */
    function thichNghiList(txt, at) {
      var arr = lay(), mg = RE_GAN_LS.exec(txt), mf = RE_FOR_LS.exec(txt), mt = RE_THEM_LS.exec(txt), ten;
      if (mg) {
        var dung = {};
        arr.forEach(function (x) { var g = RE_GAN_LS.exec(chuoi(x)); if (g) dung[g[2]] = true; });
        bienDuoc().forEach(function (p) { dung[p] = true; });
        ten = LIST_TEN_GOI_Y.filter(function (n) { return !dung[n]; })[0];
        return ten && ten !== mg[2] ? mg[1] + ten + txt.slice(mg[1].length + mg[2].length) : txt;
      }
      var mc = RE_GOI_LS.exec(txt);                                                              // hàm có đối số danh sách chèn sẵn `survey([2, 3, 1])`: đã có danh sách đặt tên ở trên (a = [], hay đối số danh sách) thì dùng luôn tên đó
      if (mc && mc[3].indexOf('[2, 3, 1]') >= 0) {
        var dsTen = tenListTai(at);
        if (dsTen.length) return mc[1] + mc[3].replace('[2, 3, 1]', dsTen[dsTen.length - 1]) + mc[4];
      }
      ten = mf ? mf[2] : mt ? mt[2] : null;
      if (!ten || KIEU_TEN_GHEP.test(ten)) return txt;
      var co = tenListTai(at);
      if (!co.length || co.indexOf(ten) >= 0) return txt;
      var moi = co[co.length - 1];
      return mf ? mf[1] + moi + mf[3] : mt[1] + moi + txt.slice(mt[1].length + mt[2].length);
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
      var arr = lay(), d = tachDoiSo(arr[i]), kd = so.getAttribute('data-them') && d && d.cau ? 'ptu' : kieuArg(d, kk);      // dấu + của danh sách rỗng luôn là ô 'ptu'
      if (kd === 'dkm') { moDkm(so, i, d, kk); return; }
      if (kd === 'ptu') { moPtu(so, i, d, kk); return; }
      if (kd === 'tenls' || kd === 'list') { moTenList(so, i, d, kk); return; }
      if (kd === 'mau') { chonMau({ neo: so, gia: d.ds[kk], bien: bienTam('mau', i), khongNone: true, khiChon: function (v) { ed.datSo(i, v, kk); } }); return; }
      if (kd === 'mauls') { chonMau({ neo: so, gia: d.ds[kk], bien: bienTam('bien', i), khiChon: function (v) { ed.datSo(i, v, kk); } }); return; }
      if (kd === 'dk') {                                                  // điều kiện cảm biến: bảng chọn front_clear() / not front_clear() / …
        if (camDuoc().length) chonDieuKien({ neo: so, ds: camDuoc(), gia: d.ds[kk], khiChon: function (v) { ed.datSo(i, v, kk); } });
        return;
      }
      if (kd === 'so') {
        chonSo({ neo: so, so: +so.getAttribute('data-so'), hien: so.getAttribute('data-bien'), toiDa: soToiDa(d && d.ten, kk), bien: bienTam('so', i, null, d && d.ten), khiChon: function (v) { ed.datSo(i, v, kk); } });
        return;
      }
      var gia = d && d.ds[kk] !== undefined ? d.ds[kk] : '', laChu = RE_CHUOI.test(gia);
      var bien = kd === 'dl' ? [] : bienTam(kd, i);
      if (kd === 'bien' && !bien.length) return;
      chonChuoi({ neo: so, kieu: kd, gia: laChu ? gia.slice(1, -1) : '', hien: laChu ? null : gia, bien: bien, khiChon: function (v) { ed.datSo(i, v, kk); } });
    }
    /** Chạm một phần tử của danh sách: bảng chọn số / màu + "thêm ô" (chèn ngay sau ô này) + "bỏ ô". Chạm dấu + của danh sách rỗng thì thêm phần tử đầu rồi mở bảng chọn. */
    function moPtu(so, i, d, kk) {
      var seg = +so.getAttribute('data-seg') || 0, c = d.cau[seg], n = c.den - c.tu;
      if (so.getAttribute('data-them')) { ed.themPtu(i, seg, kk, true); return; }
      chonPtu({
        neo: so, v: d.ds[kk], chu: !!(tuyChon.listChu && tuyChon.listChu()), coThem: n < LIST_TOI_DA, coBo: true,
        khiChon: function (v) { ed.datSo(i, v, kk); },
        khiThem: function () { ed.themPtu(i, seg, kk, true); },
        khiBo: function () { ed.boPtu(i, seg, kk); }
      });
    }
    /** Chạm tên danh sách: chọn tên khác. Ở dòng gán `a = [...]` là ĐỔI TÊN (các dòng phía dưới dùng tên cũ đổi theo); ở dòng khác là chọn một trong các danh sách đã có. */
    function moTenList(so, i, d, kk) {
      var cur = d.ds[kk], gan = d.loai === 'ganList', ds;
      if (gan) {
        var dung = {};
        lay().forEach(function (x, j) { var g = RE_GAN_LS.exec(chuoi(x)); if (g && j !== i) dung[g[2]] = true; });
        ds = LIST_TEN_GOI_Y.filter(function (n) { return !dung[n]; });
      } else ds = tenListTai(i);
      if (!ds.length && !gan) ds = LIST_TEN_GOI_Y.slice();
      if (ds.indexOf(cur) < 0) ds.unshift(cur);
      if (ds.length < 2) return;
      chonChuoi({ neo: so, kieu: 'bien', gia: '', hien: cur, bien: ds, khiChon: function (v) { if (gan) ed.doiTenList(i, v); else ed.datSo(i, v, kk); } });
    }
    /** Chạm một ô của điều kiện màu (while / if / elif): == / != và and / or đổi ngay; vế phải chọn màu; vế trái / vế cảm biến mở bảng điều kiện. */
    function moDkm(so, i, d, kk) {
      var o = d.tok[kk]; if (!o) return;
      if (RE_CL_PIN.test(d.cl[o.ci]) && !(CHE_MAU && o.vt === 'lhs')) {   // battery() < 3: chạm phép so sánh thì đổi < <= > >=, chạm số thì chọn số; chạm battery() không làm gì (trừ màn có cả camera look(): chạm battery() mở bảng chọn để đổi sang look() == …)
        if (o.vt === 'op') ed.datSo(i, PIN_SS[(PIN_SS.indexOf(o.t) + 1) % PIN_SS.length], kk);
        else if (o.vt === 'rhs') chonSo({ neo: so, so: +o.t, toiDa: 15, khiChon: function (v) { ed.datSo(i, v, kk); } });
        return;
      }
      if (o.vt === 'op') { ed.datSo(i, o.t === '==' ? '!=' : '==', kk); return; }
      if (o.vt === 'noi') { ed.datSo(i, o.t === 'and' ? 'or' : 'and', kk); return; }
      var bien = bienGanMau(lay(), i);
      if (CHE_LIST) bienTam('bien', i).forEach(function (v) { if (bien.indexOf(v) < 0) bien.push(v); });          // biến vòng for c in seen: (danh sách màu) cũng so được với màu: if c == "red":
      if (o.vt === 'rhs') {
        chonMau({ neo: so, gia: o.t, bien: bien, khiChon: function (v) { ed.datSo(i, v, kk); } });
        return;
      }
      var cam = camDuoc(), cl = d.cl[o.ci], coDong = d.cl.length;
      chonDkm({
        neo: so, cam: cam, bien: bien, gia: cl, pin: CHE_PIN,
        ghep: cam.length ? { coThem: coDong < 2 && o.ci === coDong - 1, coBo: coDong > 1 } : null,
        khiChon: function (v) { ed.datVe(i, o.ci, v); },
        khiGhep: function (nx) { ed.themVe(i, nx, /^(?:not\s+)?\w+\(\)$/.test(cl) && cl !== HAM_MAU + '()' ? HAM_MAU + '() != "red"' : (cam[0] + '()')); },
        khiBo: function () { ed.boVe(i, o.ci); }
      });
    }
    function veXx() {
      var n = lay().length, ok = choXoa();
      if (hienX >= n) hienX = -1;
      for (var i = 0; i < tong; i++) {
        var xc = ok && i < dung && i < n && i === hienX && i === sel;                          // cảm ứng: dòng vừa chạm (đang chọn) hiện ✕ đỏ (cùng bề rộng ô số, dòng code không bị đẩy)
        rows[i].classList.toggle('xx', ok && i < dung && i < n && (i === hov || xc));
        rows[i].classList.toggle('xc', xc);
      }
    }
    /** Báo sự kiện cho khung hướng dẫn (huong-dan.js): 'chen-khoi', 'chon-dong', 'xoa-dong', 'hoan-tac'. */
    function baoHd(su, ct) { try { if (window.HuongDan) HuongDan.bao(su, ct); } catch (e) { /* bỏ qua */ } }
    function anMeo() { try { if (window.HuongDan) HuongDan.dung('xoa-dong'); } catch (e) { /* bỏ qua */ } }
    /**
     * Hướng dẫn xóa dòng (một lần, cờ 'meo-xoa'): lần đầu người chơi chèn một khối, sáng dòng vừa chèn với bong bóng "Chèn nhầm? Chạm vào dòng rồi bấm ✕ để xóa.";
     * chạm dòng thì sáng chính nút ✕ đỏ ("Bấm ✕ để xóa dòng này.") cho tới khi bấm, hết hạn hay đổi việc khác.
     */
    function meoXoaLanDau(i) {
      var pan = tuyChon.bang;
      if (!pan || tuyChon.khongMeo || !rows[i] || !window.HuongDan) return;
      var xuong = !!(pan.closest && pan.closest('.ws-ov')), muon = i >= 6 ? 'tren' : 'duoi';
      function hangX() { for (var k = 0; k < rows.length; k++) if (rows[k].classList.contains('xc') || rows[k].classList.contains('xx')) return rows[k].querySelector('.tab'); return null; }
      HuongDan.chay({
        id: 'xoa-dong', co: 'meo-xoa', luuKhi: 'bat-dau',
        buoc: [
          { dich: function () { return rows[i]; }, chu: t('choi.meoXoa'), xong: 'chon-dong', huong: muon, han: 9000, rong: 160, xuong: xuong },
          { dich: hangX, chu: t('choi.meoXoa2'), xong: ['xoa-dong', 'hoan-tac'], huong: muon, han: 7000, rong: 150, xuong: xuong }
        ]
      });
    }
    this.anMeo = anMeo;
    /** Thụt lề dòng đang chọn thêm d bậc (-1 ra, +1 vào) nếu hợp lệ. */
    function doiBac(d) {
      var arr = lay();
      if (chiDoc() || dangChay() || Chan.dang() || xt || sel >= dung || sel >= arr.length || !boThut(arr[sel]).trim()) return false;
      var nb = bacCua(arr[sel]) + d;
      if (nb < 0 || nb > toiDaBac(arr, sel)) return false;
      ed.anHoan();
      arr[sel] = datBac(arr[sel], nb); chuanHoaBac(arr);
      ed.render(); ed.hieuUng(sel); tuyChon.khiDoi && tuyChon.khiDoi();
      baoHd('doi-bac', { dong: sel, bac: nb, huong: d });
      return true;
    }
    this.doiBac = doiBac;
    if (tuyChon.nutXoaHet && tuyChon.thutLe) {
      boThutEl = h('span', 'thut');
      [['thutra', 'thut-ra', 'choi.thutRa', -1], ['thutvao', 'thut-vao', 'choi.thutVao', 1]].forEach(function (c) {
        var b = h('button', 'bt g-pu thut-nut'); b.setAttribute('data-nut', c[1]); b.setAttribute('aria-label', t(c[2])); b.title = t(c[2]);
        b.appendChild(Ve.ico(c[0], 2, { line: BM.timToi2 }));
        b.addEventListener('click', function (ev) { ev.stopPropagation(); doiBac(c[3]); });
        boThutEl.appendChild(b);
        if (c[3] < 0) nutRa = b; else nutVao = b;
      });
      tuyChon.nutXoaHet.parentNode.insertBefore(boThutEl, tuyChon.nutXoaHet);
    }
    for (var i = 0; i < tong; i++) {
      var r = h('div', 'row'), tb = h('div', 'tab'), s = h('div', 'strip empty'), bk = h('div', 'brk'), nj = h('div', 'nj');
      tb.appendChild(h('span', 'tn', i + 1));
      var xi = Ve.ico('x5', 2, { fill: BM.trang, line: BM.doToiV8 }); xi.classList.add('tx'); tb.appendChild(xi);      // V7b: ở vector là <svg> (className không phải chuỗi)
      r.appendChild(tb); r.appendChild(s); r.appendChild(bk); r.appendChild(nj); host.appendChild(r); rows.push(r); strips.push(s); brks.push(bk); njs.push(nj);
      (function (i) {
        r.addEventListener('click', function (ev) {
          var arr = lay(), kieu = kieuCuoi;          // kiểu lấy từ pointerdown: Safari iOS báo click của cú chạm là 'mouse', không tin ev.pointerType của click
          if (chiDoc()) { cham = null; tuyChon.khiBam && tuyChon.khiBam(i); baoChiDoc(); return; }       // chương trình chính cố định: chạm chỉ báo, không chọn ô / mở bộ chọn số / xóa
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
              if (hienX === i && sel === i && ev.target.closest && ev.target.closest('.tab')) { ev.stopPropagation(); cham = null; ed.xoaTai(i); return; }      // bấm ✕ đỏ (dòng đã được chọn): xóa, vẫn có "Đã xóa · Hoàn tác"
              if (cham && cham.i === i && bay - cham.t <= 350) { cham = null; ed.xoaTai(i); return; }                                                        // cách cũ: chạm hai lần liên tiếp
              cham = { i: i, t: bay }; hienX = i;                                                                                                          // chạm một lần: chọn dòng + hiện ✕
            }
            baoHd('chon-dong', { dong: i });
          } else { cham = null; hienX = -1; }
          tuyChon.khiBam && tuyChon.khiBam(i);
          if (i >= dung) { tuyChon.khiKhoa && tuyChon.khiKhoa(); return; }
          sel = i; daChon = i < arr.length && coY(arr[i]); ed.render();
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
        strips[i].className = 'strip' + (khoa ? ' lock' : (slot ? ' slot' : (t === undefined ? ' empty' : ''))) + (laFor ? ' for' : '') + (laIf ? ' if' : '') + (laWh ? ' wh' : '') + (!khoa && !slot && t !== undefined && cheDkm() && (tachDKM(t) || { cl: [] }).cl.length === 2 ? ' hai' : '') +
          (!xt && runIdx === i ? ' on' : '') + (!xt && loiSet[i] ? ' err' : '');
        strips[i].innerHTML = '';
        var bac = lv[i];
        if (!khoa && !xt && t === undefined && i === sel && i >= cuoiDong && thutLe()) bac = ed.bacMacDinh(cuoiDong);
        strips[i].style.marginLeft = (!khoa && bac && (t !== undefined || slot || i === sel)) ? Math.min(bac, 3) * BUOC_PX + 'px' : '';
        if (khoa) strips[i].appendChild(Ve.khoa(2, true));
        else if (t !== undefined && !slot) { strips[i].innerHTML = mauDong(t); vuaDong(strips[i]); }
        if (!khoa && !xt && lapSet[i]) strips[i].appendChild(h('span', 'lap', lapSet[i]));
        rows[i].classList.toggle('sel', !xt && i === sel && !khoa && !chiDoc());
        rows[i].classList.toggle('run', !xt && runIdx === i);
        brks[i].innerHTML = ''; njs[i].innerHTML = '';
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
      if (!xt && tuyChon.veNhip && tuyChon.veNhip()) {                 // ngoặc nhịp: bên phải các dòng lệnh gốc cùng một nhịp (xem nhomNhip)
        nhomNhip(arr.slice(0, dung)).forEach(function (g) {
          for (var j = g.tu; j <= g.den && j < tong; j++) {
            njs[j].appendChild(h('i', 'njb' + (j === g.tu ? ' dau' : '') + (j === g.den ? ' cuoi' : '')));
            if (j === g.den) njs[j].appendChild(h('span', 'njn', window.t('choi.nhipNhan', { n: g.so })));            // window.t: trong render() có biến cục bộ t (dòng code)
          }
        });
      }
      if (tuyChon.dem) tuyChon.dem.textContent = arr.length + '/' + dung;
      var cd = chiDoc();
      host.classList.toggle('chi-doc', cd);
      if (tuyChon.bang) tuyChon.bang.classList.toggle('co-dinh', cd);
      if (tuyChon.nutXoaHet) tuyChon.nutXoaHet.disabled = !arr.length || cd;
      veXx();
      veThut();
      if (!xt && tuyChon.khiNhip) tuyChon.khiNhip(this.camNhip());     // khay làm mờ khối của bộ phận đã có lệnh trong nhịp đang soạn
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
      if (!hoan || dangChay() || chiDoc()) return;
      var s = hoan, arr = lay(); this.anHoan(); hienX = -1;
      arr.length = 0; Array.prototype.push.apply(arr, s.arr);
      sel = Math.max(0, Math.min(s.sel, dung - 1)); daChon = false;
      this.render(); this.hieuUng(Math.min(s.sel, arr.length - 1)); tuyChon.khiDoi && tuyChon.khiDoi();
      baoHd('hoan-tac', { dong: s.sel });
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

    /** Chỗ chèn khối từ khay: vừa chạm chọn một dòng có code thì ngay DƯỚI dòng đó, cùng bậc (thụt thêm một bậc nếu dòng đó mở khối, vd while …:);
     *  elif / else thì bậc theo if phía trên. Không thì tại con trỏ (ô trống sau dòng vừa chèn), bậc mặc định. → { at, bac } (bac undefined = bacMacDinh). */
    function choChen(txt) {
      var arr = lay();
      if (daChon && sel < arr.length && coY(arr[sel])) return { at: sel + 1, bac: txt && laNhanhPhu(txt) ? undefined : bacCua(arr[sel]) + (moKhoi(arr[sel]) ? 1 : 0) };
      return { at: Math.min(sel, arr.length), bac: undefined };
    }
    this.chen = function (txt) { var c = choChen(txt); return this.chenTai(txt, c.at, c.bac); };
    /** Lệnh gốc nào KHÔNG chèn được ở chỗ chèn hiện tại (dòng đang chọn): { tên lệnh: lý do } (xem lenhCungNhip). Khung chỉ đọc thì rỗng. */
    this.camNhip = function () {
      var arr = lay(), kq = {}; if (chiDoc()) return kq;
      var c = choChen(''), at = c.at, ds = lenhCungNhip(arr, at, c.bac === undefined ? this.bacMacDinh(at, '') : Math.max(0, Math.min(c.bac, toiDaBac(arr, at))));
      if (!ds.length) return kq;
      Object.keys(BP_CUA).forEach(function (l) { var ly = lyDoCamNhip(l, ds); if (ly) kq[l] = ly; });
      return kq;
    };
    /** Chèn vào vị trí at (0..số dòng). Đầy khung thì nháy đỏ, không chèn (trả về false). Bộ phận đã có lệnh trong nhịp đó thì không chèn, gọi tuyChon.khiCamNhip(lý do), trả về null.
     *  bac (tùy chọn): bậc thụt; mặc định xem bacMacDinh. */
    this.chenTai = function (txt, at, bac) {
      var arr = lay();
      if (chiDoc()) { baoChiDoc(); return false; }
      if (arr.length >= dung) { this.nhay(); return false; }
      this.anHoan(); hienX = -1;
      at = Math.max(0, Math.min(at, arr.length));
      var b = bac === undefined || bac === null ? this.bacMacDinh(at, txt) : Math.max(0, Math.min(bac, toiDaBac(arr, at)));
      var lyCam = lyDoCamNhip(tenDon(txt), lenhCungNhip(arr, at, b));         // bộ phận đã có lệnh trong nhịp này (hay khác kiểu đi): không chèn, báo lý do
      if (lyCam) { if (tuyChon.khiCamNhip) tuyChon.khiCamNhip(lyCam); baoHd('cam-nhip', { dong: at }); return null; }
      arr.splice(at, 0, datBac(thichNghi(txt, at, b), b));
      chuanHoaBac(arr);
      sel = Math.min(at + 1, dung - 1); daChon = false;
      this.render(); this.hieuUng(at); tuyChon.khiDoi && tuyChon.khiDoi();
      baoHd('chen-khoi', { dong: at });
      meoXoaLanDau(at);                                            // lần đầu chèn một khối: hướng dẫn xóa (sau khiDoi vì khay vẽ lại)
      return true;
    };
    /** Đổi dòng tu sang vị trí den (tính trong danh sách sau khi đã bỏ dòng tu); bac (tùy chọn) = bậc thụt mới (kéo ngang). */
    this.doiCho = function (tu, den, bac) {
      var arr = lay(); if (chiDoc() || tu < 0 || tu >= arr.length) return;
      den = Math.max(0, Math.min(den, arr.length - 1));
      var truoc = arr.join('\n');
      hienX = -1; var x = arr.splice(tu, 1)[0];
      var muon = bac === undefined || bac === null ? bacCua(x) : bac;
      arr.splice(den, 0, datBac(x, Math.max(0, Math.min(muon, toiDaBac(arr, den)))));
      chuanHoaBac(arr);
      var doi = truoc !== arr.join('\n');
      if (doi) this.anHoan();
      sel = den; daChon = coY(arr[den]); this.render(); this.hieuUng(den);
      if (doi) { tuyChon.khiDoi && tuyChon.khiDoi(); baoHd('doi-cho', { tu: tu, den: den }); }
    };
    this.xoaTai = function (i) {
      var arr = lay(); if (chiDoc() || i < 0 || i >= arr.length) return;
      hienX = -1;
      luuHoan(arr, i);
      arr.splice(i, 1); chuanHoaBac(arr); sel = Math.min(i, dung - 1); daChon = false;
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi(); hienHoan();
      baoHd('xoa-dong', { dong: i });
    };
    /** Đổi đối số thứ k (mặc định 0) của dòng i: số trong `range(n)` hoặc trong lời gọi hàm; v là số hoặc tên biến. */
    this.datSo = function (i, v, k) {
      var arr = lay(); if (chiDoc() || i < 0 || i >= arr.length) return;
      var s = thayDoiSo(arr[i], k || 0, v);
      if (s === arr[i]) return;
      this.anHoan(); arr[i] = s;
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
      baoHd('doi-so', { dong: i, k: k || 0, v: v });
    };
    /** Thêm một phần tử vào danh sách (đoạn seg) của dòng i, ngay sau ô k (danh sách rỗng: vào đầu). Phần tử mới là 1 (hay "red" nếu ô k là màu). moLai: mở lại bảng chọn ở ô mới. Trả về có thêm được không. */
    this.themPtu = function (i, seg, k, moLai) {
      var arr = lay(); if (chiDoc() || i < 0 || i >= arr.length) return false;
      var d = tachDoiSo(arr[i]), c = d && d.cau ? d.cau[seg] : null;
      if (!c || !c.lit || c.den - c.tu >= LIST_TOI_DA) return false;
      var rong = c.den === c.tu, goc = rong ? '1' : d.ds[Math.max(c.tu, Math.min(k, c.den - 1))], pos = rong ? c.tu : Math.max(c.tu, Math.min(k + 1, c.den));
      var s = themPtuDong(arr[i], seg, k, RE_CHUOI.test(goc) ? '"red"' : '1');
      if (s === arr[i]) return false;
      this.anHoan(); arr[i] = s;
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
      baoHd('them-ptu', { dong: i, k: pos });
      if (moLai) { var ct = strips[i] && strips[i].querySelector ? strips[i].querySelector('.ptu[data-k="' + pos + '"]') : null; if (ct) moBoChon(ct, i, pos); }
      return true;
    };
    /** Bỏ phần tử ô k của danh sách (đoạn seg) ở dòng i. */
    this.boPtu = function (i, seg, k) {
      var arr = lay(); if (chiDoc() || i < 0 || i >= arr.length) return false;
      var s = boPtuDong(arr[i], seg, k);
      if (s === arr[i]) return false;
      this.anHoan(); arr[i] = s;
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
      baoHd('bo-ptu', { dong: i, k: k });
      return true;
    };
    /** Đổi tên danh sách ở dòng gán `a = [...]` (dòng i) thành `moi`; các dòng phía dưới dùng tên cũ đổi theo, tới dòng gán lại tên cũ. Trả về có đổi được không. */
    this.doiTenList = function (i, moi) {
      var arr = lay(); if (chiDoc() || i < 0 || i >= arr.length) return false;
      var m = RE_GAN_LS.exec(chuoi(arr[i]));
      if (!m || m[2] === moi || !RE_BIEN.test(moi)) return false;
      var cu = m[2], re = new RegExp('(^|[^\\w"])' + escRe(cu) + '(?![\\w"])', 'g'), reGan = new RegExp('^\\s*' + escRe(cu) + '\\s*=[^=]');
      this.anHoan();
      arr[i] = thayDoiSo(arr[i], 0, moi);
      for (var j = i + 1; j < arr.length; j++) {
        var x = chuoi(arr[j]);
        if (reGan.test(x)) break;
        arr[j] = x.replace(re, function (_, a1) { return a1 + moi; });
      }
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
      baoHd('doi-ten-list', { dong: i, ten: moi });
      return true;
    };
    /** Đổi vế ci của điều kiện màu ở dòng i; themVe thêm một vế; boVe bỏ một vế. */
    this.datVe = function (i, ci, str) { this.suaDong(i, thayVe(lay()[i], ci, str)); };
    this.themVe = function (i, nx, str) { this.suaDong(i, themVe(lay()[i], nx, str)); };
    this.boVe = function (i, ci) { this.suaDong(i, boVe(lay()[i], ci)); };
    this.suaDong = function (i, dongMoi) {
      var arr = lay(); if (chiDoc() || i < 0 || i >= arr.length || dongMoi === arr[i]) return;
      this.anHoan(); arr[i] = dongMoi;
      this.render(); tuyChon.khiDoi && tuyChon.khiDoi();
    };
    /** Thay một đối số của dòng i bằng biến `ten`: ưu tiên đối số còn là số cụ thể, rồi đến đối số biến khác tên. Trả về có đổi được không. */
    this.datBienTai = function (i, ten, kieu) {
      var arr = lay(); if (chiDoc() || i < 0 || i >= arr.length || i >= dung || dangChay() || Chan.dang() || xt) return false;
      var d = tachDoiSo(arr[i]); if (!d || !d.ds.length) return false;
      var kb = kieu || 'so';
      function hop(j) { return hopKieu(kieuArg(d, j), kb); }                       // ô cùng kiểu với biến
      var k = -1, j;
      if (kb === 'list' && d.cau) {                                                // biến danh sách: thay cả danh sách đặt thẳng `[2, 3, 1]` (đoạn lit đầu tiên) bằng tên biến
        for (j = 0; j < d.cau.length && k < 0; j++) if (d.cau[j].lit) k = j;
        if (k >= 0) {
          var sl = litThanhTen(arr[i], k, ten);
          if (sl === arr[i]) return false;
          this.anHoan(); arr[i] = sl; this.render(); tuyChon.khiDoi && tuyChon.khiDoi(); this.hieuUng(i);
          baoHd('doi-so', { dong: i, k: 0, v: ten });
          return true;
        }
      }
      for (j = 0; j < d.ds.length && k < 0; j++) if (hop(j) && (kb === 'so' ? RE_SO.test(d.ds[j]) : kb === 'list' ? true : RE_CHUOI.test(d.ds[j]))) k = j;
      for (j = 0; j < d.ds.length && k < 0; j++) if (hop(j) && d.ds[j] !== ten && RE_BIEN.test(d.ds[j])) k = j;
      if (k < 0) return false;
      this.datSo(i, ten, k); this.hieuUng(i);
      return true;
    };
    /** Thẻ biến ở kho: thay vào dòng đang chọn, hoặc dòng có đối số gần nhất phía trên nó. kieu = kiểu của biến: 'so' (mặc định), 'don' (một chữ) hoặc 'ghep' (chuỗi chữ). */
    this.datBien = function (ten, kieu) {
      var arr = lay();
      for (var i = Math.min(sel, arr.length - 1); i >= 0; i--) if (this.datBienTai(i, ten, kieu)) { sel = Math.min(i + 1, dung - 1); daChon = false; this.render(); return true; }
      return false;
    };
    /** Đánh dấu dòng i là chỗ sắp thả thẻ biến (-1 = bỏ). */
    this.danhDauDich = function (i) { rows.forEach(function (r, k) { r.classList.toggle('dich', k === i); }); };
    this.chon = function (i) { if (i >= 0 && i < dung) { sel = i; daChon = false; this.render(); } };
    this.chonHienTai = function () { return sel; };
    this.xoaHet = function () {
      var arr = lay(); if (chiDoc() || !arr.length) return;
      hienX = -1; anMeo();
      luuHoan(arr, 0);
      arr.length = 0; sel = 0; daChon = false; this.render(); tuyChon.khiDoi && tuyChon.khiDoi(); hienHoan();
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
      this.anHoan(); dongChonSo(); hienX = -1; anMeo();
      lay = layMoi; if (dungMoi !== undefined) dung = dungMoi;
      runIdx = -1; loiSet = {}; lapSet = {}; xt = null; viTri = null; sel = Math.min(lay().length, Math.max(0, dung - 1)); daChon = false; this.render();
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
        if (cu && cu[it.id] !== undefined && cu[it.id] !== k && pitch && strips[k].animate && !(veMuot() && giamChuyenDong())) {
          try { strips[k].animate([{ transform: 'translateY(' + ((cu[it.id] - k) * pitch) + 'px)' }, { transform: 'translateY(0)' }], veMuot() ? { duration: 170, easing: 'cubic-bezier(.16,1,.3,1)' } : { duration: 130, easing: 'steps(3,end)' }); } catch (e) { /* bỏ qua */ }
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
    var tdN = o.toiDa >= 1 && o.toiDa <= 15 ? o.toiDa : 9;
    if (tdN < 9) el.classList.add('hep');
    if (tdN > 9) el.classList.add('rong');                                              // pin 1–15: lưới 5 cột
    for (var n = 1; n <= tdN; n++) {
      (function (n) {
        var b = h('button', 'bt g-pu cs' + (n === o.so ? ' on' : ''), String(n)); b.setAttribute('data-so', n);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(n); });
        el.appendChild(b);
      })(n);
    }
    if (o.bien && o.bien.length) {
      var hb = h('div', 'cs-bien' + (o.bien.some(function (ten) { return /[\[(]/.test(ten); }) ? ' xuong' : '')); hb.setAttribute('data-nut', 'chon-bien');      // a[0], a[i], len(a): chip dài, xuống dòng
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
  var LUC_BAN = ['fast', 'charge'];                                   // lực bắn của súng hơi ở màn Lực bắn: shoot("fast") / shoot("charge")
  /**
   * Bộ chọn chuỗi chữ chỉ đường cạnh ô `neo`. o: { neo, kieu, gia, hien, bien: [tên biến], khiChon(v) }
   *   kieu 'don' / 'dl': bốn nút U D L R, chạm một nút là chọn xong ('dl' không có hàng biến);
   *   kieu 'luc': hai nút "fast" / "charge" (lực bắn của shoot(p)), chạm là chọn xong, kèm hàng biến lực;
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
      var hc = h('div', 'cc-chu' + (o.kieu === 'luc' ? ' cc-luc' : ''));
      (o.kieu === 'luc' ? LUC_BAN : CHU_HUONG).forEach(function (c) {           // 'luc': hai nút "fast" / "charge" (lực bắn của súng hơi)
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
      if (o.khongNone && ten === 'none') return;                            // ink(c): không có màu sơn "none"
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
   * Bảng chọn PHẦN TỬ của danh sách cạnh ô `neo`. o: { neo, v: giá trị đang có ("3" hay "\"red\""), chu: bool (thêm hàng màu: danh sách cho chữ / màu), coThem, coBo, khiChon(v), khiThem(), khiBo() }.
   * Số 1–9 (lưới 3×3), hàng màu khi danh sách có chữ, rồi hai nút: "+ thêm ô" (thêm một phần tử ngay SAU ô này; mờ khi đủ ô) và "bỏ ô". khiChon nhận "3" hay "\"red\"".
   */
  function chonPtu(o) {
    dongChonSo();
    var el = h('div', 'chon-so chon-ptu'); el.setAttribute('data-nut', 'chon-ptu'); el.setAttribute('aria-label', t('choi.chonPtu'));
    var dangSo = RE_SO.test(o.v) ? +o.v : null, dangChu = RE_CHUOI.test(o.v) ? o.v.slice(1, -1) : null;
    for (var n = 1; n <= 9; n++) {
      (function (n) {
        var b = h('button', 'bt g-pu cs' + (n === dangSo ? ' on' : ''), String(n)); b.setAttribute('data-so', n);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(String(n)); });
        el.appendChild(b);
      })(n);
    }
    if (o.chu || dangChu !== null) {
      var hm = h('div', 'cs-bien pt-mau'); hm.setAttribute('data-nut', 'chon-mau-ptu');
      MAU_DS.forEach(function (ten) {
        var b = nutMau(ten, ten === dangChu);
        b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon('"' + ten + '"'); });
        hm.appendChild(b);
      });
      el.appendChild(hm);
    }
    var ht = h('div', 'cs-bien pt-thao'); ht.setAttribute('data-nut', 'ptu-thao');
    var bt = h('button', 'bt g-gr cs ptu-them', t('choi.themO')); bt.setAttribute('data-nut', 'ptu-them'); bt.disabled = !o.coThem;
    bt.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiThem(); });
    var bb = h('button', 'bt g-rd cs ptu-bo', t('choi.boO')); bb.setAttribute('data-nut', 'ptu-bo'); bb.disabled = !o.coBo;
    bb.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiBo(); });
    ht.appendChild(bt); ht.appendChild(bb); el.appendChild(ht);
    moBang(el, o.neo);
  }
  /** Bảng chọn MỤC có icon (Xưởng: loại vật / loại sàn). o: { neo, ds: [{ ma, chu, icon: canvas }], dang: mã đang chọn, khiChon(ma) }. */
  function chonMuc(o) {
    dongChonSo();
    var el = h('div', 'chon-so chon-chuoi muc'); el.setAttribute('data-nut', 'chon-muc');
    o.ds.forEach(function (m) {
      var b = h('button', 'bt g-wd cs muc-nut' + (m.ma === o.dang ? ' on' : '')); b.setAttribute('data-muc', m.ma);
      if (m.icon) b.appendChild(m.icon);
      b.appendChild(h('span', 'mc', m.chu));
      b.addEventListener('click', function (ev) { ev.stopPropagation(); dongChonSo(); o.khiChon(m.ma); });
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
    nut(HAM_MAU + '() == ' + mauDang, 'g-pk'); nut(HAM_MAU + '() != ' + mauDang, 'g-pk');
    if (o.pin) { nut('battery() < 3', 'g-or'); nut('battery() > 2', 'g-or'); }                  // drone vừa có camera look() vừa có pin: vế trái cũng chọn được điều kiện pin (while battery() > 2:)
    (o.bien || []).forEach(function (v) {
      nut(v + ' == ' + mauDang, 'g-pu'); nut(v + ' != ' + mauDang, 'g-pu');
      nut(HAM_MAU + '() == ' + v, 'g-pu'); nut(HAM_MAU + '() != ' + v, 'g-pu');
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
  var CAM_BIEN_TEN = ['front_clear', 'left_clear', 'right_clear', 'front_metal', 'front_pole', 'distance', 'warm'];      // distance / warm: cảm biến hồng ngoại (mùa 2): distance() trả SỐ (so sánh), warm() trả True / False
  function camBienCua(man) { return ((man && man.hamGoc) || []).filter(function (n) { return CAM_BIEN_TEN.indexOf(n) >= 0; }); }

  /** Chẩn đoán cụ thể lên trước câu chung chung: `nhen-khong-buoc` (nhện chưa bước lần nào) đứng trước `chua-toi-co` / `chua-dua-vat`. Trả về mảng mới. */
  function xepChanDoan(ds) {
    var kq = ds.slice(), i = -1, j;
    for (j = 0; j < kq.length; j++) if (kq[j].ma === 'nhen-khong-buoc' || kq[j].ma === 'drone-khong-bay') i = j;
    var dau = -1;
    for (j = 0; j < kq.length && dau < 0; j++) if (kq[j].ma === 'chua-toi-co' || kq[j].ma === 'chua-dua-vat') dau = j;
    if (i > dau && dau >= 0) { var x = kq.splice(i, 1)[0]; kq.splice(dau, 0, x); }
    return kq;
  }
  /** Hàm của em dùng được với robot của màn: hàm gọi (trực tiếp hay qua hàm khác của em) một lệnh gốc mà màn không có trong `hamGoc` thì ẩn khỏi kho
   *  (vd. nhện bỏ hàm dùng lệnh bánh; xích / omni bỏ go(d); xe không tay bỏ pick()). Màn không khai hamGoc: giữ nguyên. */
  var LENH_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole', 'aim', 'throw', 'load', 'shoot', 'shoot_back', 'ink', 'dot', 'pen_down', 'pen_up', 'slide_left', 'slide_right', 'go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'battery', 'front_clear', 'left_clear', 'right_clear', 'color', 'look', 'distance', 'warm'];
  /** Lệnh gốc mà THÂN HÀM CỦA EM được gọi ở màn này: các lệnh trên khay (hamGoc) cộng PHẦN CỨNG robot (SanHoc.phanCungCua(man) của lõi: man.phanCung nếu màn khai — màn hỏng —,
   *  không thì trọn bộ lệnh loại robot, vd. xe bánh luôn có bánh lùi dù khay chưa cho dùng). Lõi cũ chưa có SanHoc.phanCungCua thì dùng man.phanCung nếu có, không thì chỉ hamGoc như trước. */
  function lenhDuocGoi(man) {
    var co = {}, ph = null;
    ((man && man.hamGoc) || []).forEach(function (n) { co[n] = true; });
    try {
      if (man && window.SanHoc && typeof SanHoc.phanCungCua === 'function') ph = SanHoc.phanCungCua(man);
      else if (man && Array.isArray(man.phanCung)) ph = man.phanCung;
    } catch (e) { ph = null; }
    (ph || []).forEach(function (n) { if (typeof n === 'string') co[n] = true; });
    return co;
  }
  /** Như lenhDuocGoi nhưng KHÔNG tính bộ phận hỏng (man.phanCung): lọc khay theo LOẠI robot, không theo chỗ hỏng.
   *  Hàm dùng bộ phận hỏng vẫn phải hiện để người chơi mở ra sửa (vd. 3.9 "Chỉ còn số lùi" sửa turn_left / turn_right). */
  function lenhCuaLoaiRobot(man) {
    var co = {};
    ((man && man.hamGoc) || []).forEach(function (n) { co[n] = true; });
    try {
      if (man && window.SanHoc && typeof SanHoc.phanCungMacDinh === 'function') {
        SanHoc.phanCungMacDinh(man.loaiRobot || 'banh', man.hamGoc).forEach(function (n) { co[n] = true; });
        return co;
      }
    } catch (e) { /* lõi cũ: rơi xuống cách cũ */ }
    return lenhDuocGoi(man);
  }
  function locHamTheoRobot(man, ds) {
    if (!ds || !man || !man.hamGoc || !man.hamGoc.length) return ds;
    var co = lenhCuaLoaiRobot(man), bat = {};
    (man.taoHam || []).concat(man.hamCuaEmCan || []).forEach(function (n) { bat[n] = true; });   // hàm màn này bắt chế / sửa / cần dùng: luôn hiện để mở được trong Xưởng
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
    return ds.filter(function (f) { var da = {}; da[f.ten] = true; return bat[f.ten] || !dungLenhThieu(f, da); });
  }
  /**
   * Chia hàm của em (đã lọc theo robot) thành hai nhóm cho khay (23/10: kho đầy dần, nhiều hàm cốt truyện chỉ dùng ở đúng màn chế ra nó nên khay dài, tìm cực):
   *  chinh — hàm màn này dùng tới: hàm màn bắt tạo / cần / cho sửa (taoHam, hamCuaEmCan, ManHoc.hamSuaDuoc), hàm lời giải mẫu gọi (cả lời giải khác, công thức khác,
   *          cách lắp mẫu của màn lắp ráp), hàm bài làm đang gọi (bai: chương trình, hàm của màn), hàm em tự đặt tên (không phải tên cốt truyện), cùng mọi hàm mà chúng gọi tới;
   *  khac — các hàm cốt truyện còn lại: khay gom vào nhóm "Hàm khác" thu gọn, chạm mới mở. Thiếu ManHoc (máy kiểm dựng khay riêng) thì mọi hàm là chinh.
   */
  function tachHamKhac(man, ds, bai) {
    ds = ds || [];
    var MH = window.ManHoc;
    if (!man || !MH || typeof MH.hamCotTruyen !== 'function') return { chinh: ds, khac: [] };
    var cot = MH.hamCotTruyen(), can = {}, theoTen = {}, g = man.manGoc || man;
    ds.forEach(function (f) { theoTen[f.ten] = f; });
    var hang = [];
    function them(n) { if (!can[n]) { can[n] = true; hang.push(n); } }
    function goi(dong) {
      (dong || []).forEach(function (d) { var re = /([A-Za-z_]\w*)\s*\(/g, m, x = boChuThich(d); while ((m = re.exec(x))) them(m[1]); });
    }
    function tuBai(b) {
      if (!b) return;
      goi(b.chinh);
      (b.doi || []).forEach(function (x) { goi(x && x.chinh); });
      (b.hamCuaMan || []).forEach(function (f) { goi(f.than); });
      (b.hamCuaEmMoi || []).forEach(function (f) { them(f.ten); goi(f.than); });
    }
    function tuCach(c) { if (c) { tuBai(c.baiLam || c); tuBai({ hamCuaEmMoi: c.hamCuaEmMoi }); } }
    (g.taoHam || []).concat(g.hamCuaEmCan || [], typeof MH.hamSuaDuoc === 'function' ? MH.hamSuaDuoc(g) : []).forEach(them);
    tuBai(g.loiGiai); tuCach(g.loiGiaiKhac);
    [].concat(g.congThucKhac || []).forEach(tuCach);
    if (g.lapRap) (g.lapRap.cachLap || []).forEach(function (c) { tuBai(c.loiGiai); });
    tuBai(bai);
    ds.forEach(function (f) { if (cot.indexOf(f.ten) < 0) them(f.ten); });
    while (hang.length) { var f = theoTen[hang.pop()]; if (f) goi(f.than); }      // lan theo lời gọi trong thân các hàm của kho (park gọi back, u_turn…)
    return { chinh: ds.filter(function (f) { return can[f.ten]; }), khac: ds.filter(function (f) { return !can[f.ten]; }) };
  }
  /** Thẻ khay cho hàm `ten` còn TRỐNG thân: theo bản của hàm đó trong lời giải màn (man.loiGiai.hamCuaEmMoi), không có thì null (khay để ở THÂN). Như TP.theMacDinh. */
  function theHamRong(man, ten, kho, hamMan) {
    var lg = (man && man.loiGiai && man.loiGiai.hamCuaEmMoi) || [], g = lg.filter(function (f) { return f.ten === ten; })[0];
    if (!g) return null;
    function tim(n) { var l = [hamMan || [], kho || [], lg], i, j; for (i = 0; i < l.length; i++) for (j = 0; j < l[i].length; j++) if (l[i][j].ten === n && (l[i][j].than || []).some(coY)) return l[i][j]; return null; }
    return theCuaHam(g, tim);
  }

  /* ------------------------------------------------- kiểu của đối số hàm: số / một chữ / chuỗi ghép */
  var KIEU_TEN_DON = /^(d|c|dir|huong)$/i, KIEU_TEN_GHEP = /^(path|chuoi|s|chu)$/i, KIEU_TEN_LIST = /^(steps|route|lst|list|ds|items|seen)$/i;       // KIEU_TEN_LIST: đối số tên thế này là danh sách (ở màn có list) khi thân hàm chưa nói gì
  function boChuThich(s) { s = chuoi(s); var k = s.indexOf('#'); return k >= 0 ? s.slice(0, k) : s; }
  function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /**
   * Suy kiểu của đối số k của hàm f = { ten, thamSo, than } từ thân hàm: 'don' (so sánh với một chữ: `d == "U"`),
   * 'ghep' (lặp từng chữ `for c in path`), 'so' (`range(n)`); đưa nguyên sang hàm khác thì lấy theo hàm đó. null nếu thân chưa nói gì.
   */
  function suyKieu(f, k, tim, sau) {
    var p = (f.thamSo || [])[k]; if (!p) return null;
    var src = (f.than || []).map(boChuThich).join('\n'), P = escRe(p);
    if (CHE_LIST && (new RegExp('(^|[^\\w"])' + P + '\\s*\\[').test(src) || new RegExp('\\blen\\(\\s*' + P + '\\s*\\)').test(src) || new RegExp('(^|[^\\w"])' + P + '\\.append\\(').test(src))) return 'list';     // p[i] · len(p) · p.append(x): danh sách
    if (new RegExp('(^|[^\\w"])' + P + '\\s*[=!]=').test(src) || new RegExp('[=!]=\\s*' + P + '(?![\\w"])').test(src)) return 'don';
    if (new RegExp('\\bin\\s+' + P + '\\s*:').test(src)) return CHE_LIST && !KIEU_TEN_GHEP.test(p) ? 'list' : 'ghep';                      // for c in path: (chuỗi chữ) · for n in steps: (danh sách, ở màn có list)
    if (CHE_LIST && new RegExp('\\bin\\s+' + P + '(?![\\w"])').test(src)) return 'list';                                       // x in steps
    if (new RegExp('range\\(\\s*' + P + '\\s*\\)').test(src)) return 'so';
    if (new RegExp('\\bink\\(\\s*' + P + '\\s*\\)').test(src)) return 'mau';                                        // ink(c): đối số là tên MÀU sơn (máy sơn)
    if (new RegExp('\\bshoot(_back)?\\(\\s*' + P + '\\s*\\)').test(src)) return 'luc';                              // shoot(p): đối số là LỰC bắn "fast" / "charge" (súng hơi)
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
   * Hàm kieuDoiSo(tenHam, k) → 'so' | 'don' | 'ghep' | 'list' | 'mau' (tên màu sơn, đưa vào ink()). layCtx() trả { man, hamCuaMan: [f], kho: [f] }.
   * Hàm có trong lời giải của màn (go, walk, bring, go_sai…) thì theo lời giải; còn lại suy từ thân hàm (của em / của màn); chưa có gì thì theo tên đối số ở màn nhện (d, c: một chữ; path: chuỗi); còn lại là số.
   */
  function taoKieu(layCtx) {
    return function (ten, k) {
      var cx = layCtx() || {};
      if ((ten === 'shoot' || ten === 'shoot_back') && cx.man && (cx.man.lucBan || (cx.man.doi || []).some(function (d) { return d && d.lucBan; }))) return 'luc';      // màn Lực bắn: thẻ shoot chèn sẵn lực, chạm để đổi; màn đội: lucBan nằm ở phần riêng robot có súng (man.doi[i])
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
        if (p && cx.man && (cx.man.loaiRobot === 'nhen' || cx.man.loaiRobot === 'drone')) kq = KIEU_TEN_GHEP.test(p) ? 'ghep' : KIEU_TEN_DON.test(p) ? 'don' : null;
        if (!kq && CHE_LIST && p && KIEU_TEN_LIST.test(p)) kq = 'list';
      }
      return kq || 'so';
    };
  }

  /**
   * Số lớn nhất chọn được cho đối số k của lệnh / hàm `ten`: aim(n) chỉ nhận 1–3 (tầm ném), hàm nào đưa đối số k thẳng vào aim(...) (vd. toss(n) = aim(n); throw(); wait())
   * cũng chỉ 1–3; còn lại 9. layCtx() trả { man, hamCuaMan: [f], kho: [f] } như taoKieu.
   */
  function taoSoToiDa(layCtx) {
    return function (ten, k) {
      if (ten === 'aim') return 3;
      if (ten === 'ink') return 9;
      var cx = layCtx() || {}, l = [(cx.hamCuaMan || []), (cx.kho || [])], i, j, f = null;
      for (i = 0; i < l.length && !f; i++) for (j = 0; j < l[i].length && !f; j++) if (l[i][j].ten === ten) f = l[i][j];
      var p = f && f.thamSo ? f.thamSo[k] : null;
      if (!p) return 9;
      var re = new RegExp('^\\s*aim\\(\\s*' + p + '\\s*\\)');
      return (f.than || []).some(function (d) { return re.test(String(d)); }) ? 3 : 9;
    };
  }
  /* ------------------------------------------------------------ Palette */
  /** Cờ "đã xem" của các mẹo chỉ hiện một lần (lưu trong Luu; chạy không có Luu thì coi như chưa xem, không lưu). */
  function daXemMeo(k) { try { return !!(window.Luu && Luu.daXem(k)); } catch (e) { return false; } }
  function datXemMeo(k) { try { if (window.Luu) Luu.datDaXem(k); } catch (e) { /* bỏ qua */ } }
  /**
   * Hàm bị KHÓA ở màn `man` (chỉ xem, không sửa): trả về mảng khóa khối của khay ['man:go_out', 'em:u_turn'].
   *  - hàm của màn nằm trong man.khoaHamMan (vd. go_out ở che-xe.7);
   *  - hàm CỐT TRUYỆN của em (tên nằm trong `taoHam` của một màn nào đó) mà màn này không bắt chế / sửa (ManHoc.hamSuaDuoc): mở ở Xưởng chỉ xem.
   * Hàm người chơi tự đặt không bao giờ bị khóa. Bảng Gỡ lỗi "Mở hết" không mở khóa này. Không có ManHoc (máy kiểm dựng giao diện riêng) thì chỉ khóa theo khoaHamMan.
   */
  function khoaKhay(man) {
    var kq = [];
    if (!man) return kq;
    (man.khoaHamMan || []).forEach(function (n) { kq.push('man:' + n); });
    var MH = window.ManHoc;
    if (MH && typeof MH.hamCotTruyen === 'function' && typeof MH.hamSuaDuoc === 'function') {
      var sua = MH.hamSuaDuoc(man);
      MH.hamCotTruyen().forEach(function (n) { if (sua.indexOf(n) < 0) kq.push('em:' + n); });
    }
    return kq;
  }
  /** Lệnh đọc cảm biến (thân hàm gọi một trong số này thì hàm đó thuộc thẻ CẢM BIẾN) và mọi lệnh tay / dụng cụ (thẻ TAY). */
  var CAM_TEN_TAT_CA = CAM_BIEN_TEN.concat(['color', 'look', 'battery']);
  var LENH_TAY_TAT_CA = TAY_TEN.concat(NC_TEN, NEM_TEN, SUNG_TEN, SON_TEN);
  var RE_DK_CAM = /\b(front_clear|left_clear|right_clear|front_metal|front_pole|color|look|battery|distance|warm)\s*\(/;       // khối điều kiện có đọc cảm biến
  /**
   * Hàm f = { ten, than } thuộc thẻ nào của khay, theo các lệnh gốc nó gọi (kể cả gián tiếp qua hàm khác, tìm bằng tim(ten) → hàm | null):
   * có lệnh cảm biến → 'cam'; không có mà có lệnh tay / dụng cụ → 'tay'; còn lại → 'than'.
   */
  function theCuaHam(f, tim) {
    var thay = {}, cam = false, tay = false;
    function duyet(g) {
      if (!g || thay[g.ten]) return;
      thay[g.ten] = true;
      (g.than || []).forEach(function (dong) {
        var re = /([A-Za-z_]\w*)\s*\(/g, m, s = boChuThich(dong);
        while ((m = re.exec(s))) {
          if (CAM_TEN_TAT_CA.indexOf(m[1]) >= 0) cam = true;
          else if (LENH_TAY_TAT_CA.indexOf(m[1]) >= 0) tay = true;
          else duyet(tim(m[1]));
        }
      });
    }
    duyet(f);
    return cam ? 'cam' : tay ? 'tay' : 'than';
  }
  /**
   * Thẻ mặc định khi vào màn / mở Xưởng: thẻ chứa hàm đang sửa (o.dangSua = { ten, than }), không có thì hàm màn bắt chế (man.taoHam: hàm còn thiếu hay còn trống trước, không thì hàm đầu tiên);
   * hàm còn trống thì theo lời giải của màn (man.loiGiai.hamCuaEmMoi) để biết nó thuộc bộ phận nào; không có gì thì 'than'. Trả về 'than' | 'tay' | 'cam'.
   * o = { man, kho: [hàm của em], hamMan: [hàm của màn], dangSua: { ten, than } | null }.
   */
  function theMacDinh(o) {
    var man = o.man || {}, kho = o.kho || [], hamMan = o.hamMan || [], lg = (man.loiGiai && man.loiGiai.hamCuaEmMoi) || [];
    function theo(ds, ten) { for (var i = 0; i < ds.length; i++) if (ds[i].ten === ten) return ds[i]; return null; }
    function tim(ten) { return theo(hamMan, ten) || theo(kho, ten) || theo(lg, ten); }
    function coThan(f) { return !!f && (f.than || []).some(coY); }
    function loai(ten, f) {
      if (coThan(f)) return theCuaHam(f, tim);
      var g = theo(lg, ten);
      return g ? theCuaHam(g, tim) : 'than';
    }
    if (o.dangSua) return loai(o.dangSua.ten, o.dangSua);
    var ds = man.taoHam || [], ten = null, i;
    for (i = 0; i < ds.length && ten === null; i++) if (!coThan(theo(kho, ds[i]))) ten = ds[i];
    if (ten === null) ten = ds[0];
    if (ten === undefined || ten === null) {                       // màn không bắt chế hàm nào: hàm của màn cho sửa (không khóa) nếu có (vd. "sửa hàm lỗi"), rồi hàm của em mà lời giải sửa (vd. che-xe.5 sửa u_turn)
      var khoa = man.khoaHamMan || [], hm = null;
      for (i = 0; i < hamMan.length && !hm; i++) if (khoa.indexOf(hamMan[i].ten) < 0) hm = hamMan[i];
      if (hm) return loai(hm.ten, hm);
      return lg.length ? loai(lg[0].ten, theo(kho, lg[0].ten)) : 'than';
    }
    return loai(ten, theo(kho, ten));
  }
  /**
   * Khay khối lệnh THEO THẺ BỘ PHẬN (quyết định 14/10). Thanh tiêu đề: ◀ [tên thẻ] ▶ chuyển thẻ (vòng tròn: ◀ ở thẻ đầu sang thẻ cuối) và ▲ ▼ cuộn trong một thẻ dài.
   * Thẻ theo thứ tự: THÂN (Xe / Nhện / Drone: lệnh gốc thân + hàm của em chỉ dùng lệnh thân) · TAY (tay kẹp, nam châm, máy ném, súng bóng, tấm đẩy: khi khay có lệnh tay / dụng cụ;
   * hàm của em có lệnh tay mà không có lệnh cảm biến) · CẢM BIẾN (khi khay có cảm biến: các khối `while` / `if` đọc cảm biến + hàm của em có lệnh cảm biến).
   * KHÔNG còn thẻ "Của màn": hàm của màn xếp vào thẻ bộ phận theo CÙNG luật với hàm của em (lệnh gốc nó gọi), vẽ màu cam, có ổ khóa nếu màn khóa nó.
   * Chỉ một thẻ thì ẩn ◀ ▶. Mỗi thẻ: lệnh gốc của bộ phận → (khối cấu trúc) → hàm của màn → hàm của em.
   * Cấu trúc Python không có thẻ riêng: khối `for` nằm cuối phần lệnh gốc của MỌI thẻ lệnh (Thân, Tay, Cảm biến); `while` / `if` đọc cảm biến ở thẻ CẢM BIẾN; `if d == …` (chuỗi chỉ đường)
   * và `while` mẫu (khay không có cảm biến) ở thẻ THÂN. Khối BIẾN (đối số của hàm đang sửa) hiện ở đầu MỌI thẻ. Hàm của em có lệnh tay / cảm biến mà khay không có thẻ đó thì rơi về THÂN.
   * cb: { khiChen(text), khiSua(loai, ten), khiMoi(khoaThe) }.
   * dung({ goc: [tên], loai: loại robot, vong: bool (có khối `for`), bienDem: bool (man.bienDem: nhóm ĐẾM `n = 0`, `n = n + 1`, `for i in range(n):`, ở thẻ CẢM BIẾN), list: bool (man.cauTruc có 'list' — TP.coListCua: nhóm DANH SÁCH `a = [1, 2]`, `for n in a:`, `for n in [1, 2]:`, `a.append(1)` ở thẻ LOGIC; Editor cần TP.datCheList(true) để vẽ ô phần tử chạm được), bien: [tên đối số] (khi sửa hàm có tham số), em: [{ten,thamSo,than}] | null, man: [{ten,thamSo,than}], coNutMoi, boQua,
   *         khoa: ['em:u_turn', 'man:go_out'] (hàm bị khóa ở màn này: ổ khóa thay bút chì, mở ở Xưởng chỉ xem; xem khoaKhay),
   *         the: khóa thẻ mặc định ('than' | 'tay' | 'cam'), lamMoi: bool (true = bỏ thẻ đang chọn, dùng `the`; false / không có = giữ thẻ đang chọn) }).
   * cb.khiBien(ten): chạm thẻ biến. em === null → ẩn cả nhóm "hàm của em". cb.goiYThe (bool): màn chơi lần đầu có từ hai thẻ (hay lần đầu có thẻ Cảm biến) thì ◀ ▶ nhấp nháy + bong bóng nhỏ cho tới khi đổi thẻ (cờ Luu 'meo-the', 'meo-the-cam').
   * Khối KHÔNG co nhỏ (cỡ chạm đủ lớn trên điện thoại): khay dài thì cuộn bằng vuốt dọc, lăn chuột hay ▲ ▼.
   */
  var MAU_THE = { than: BM.xanhLoSang2V1, tay: BM.cam, cam: BM.tim };                       // màu icon tiêu đề thẻ: Thân xanh, Tay cam, Logic tím (như khối for)
  function Palette(host, cb) {
    this.host = host;
    var bricks = {}, lastSpec = null, pal = this;
    var camNhip = {};                                                                                 // lệnh gốc không chèn được ở nhịp đang soạn: { tên: lý do } (Editor.camNhip)
    var the = [], theChon = null, viTri = {}, loiSet = {}, sangKhoa = null, khoaSet = {}, khacSet = {}, moKhac = false;      // các thẻ của khay · khóa thẻ đang chọn · khối (em:ten / man:ten) → khóa thẻ chứa nó · khối đang tô lỗi / đang sáng · khối bị khóa (em:ten / man:ten) · khối trong nhóm "Hàm khác" · nhóm đó đang mở
    var bh = host.parentNode && host.parentNode.querySelector ? host.parentNode.querySelector('.bh') : null;
    var tieuDe = bh ? bh.querySelector('.tt') : null;
    var cuonEl = null, nutLen = null, nutXuong = null, theEl = null, theTen = null, theCham = null, nutTruoc = null, nutSau = null, qtHen = 0;
    /* HÀNG GHIM dưới khay (15/10): `wait()` là "chốt nhịp", việc của bộ não chứ không của bộ phận nào, nên luôn thấy dù đang ở thẻ nào. Cùng lớp .pal để dùng chung CSS khối,
       đích hướng dẫn ('khoi:wait' tìm '.pal .brick') và phép kiểm "đang thấy"; kéo khối từ đây vào khung như từ khay (gan() nghe pointerdown của cả hai). */
    var ghimEl = null, ghimWait = false;
    if (host.parentNode && host.parentNode.appendChild) { ghimEl = h('div', 'pal pal-ghim'); ghimEl.style.display = 'none'; if (host.parentNode.insertBefore) host.parentNode.insertBefore(ghimEl, host.nextSibling); else host.parentNode.appendChild(ghimEl); }
    this.ghim = ghimEl;
    function nutTam(lopNut, nhanChu, dataNut, fn) {
      var b = h('button', 'bt g-wd cuon-b ' + lopNut); b.setAttribute('data-nut', dataNut); b.setAttribute('aria-label', t(nhanChu)); b.title = t(nhanChu);
      b.appendChild(h('i', 'tam'));
      b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
      return b;
    }
    /** Người chơi tự bấm ◀ ▶: đã biết cách đổi thẻ, nhớ lại (mọi loại thẻ đang có) để lần sau không gợi ý nữa. */
    function daDoiThe() {
      datXemMeo('meo-the');
      if (chiSo('cam') >= 0) datXemMeo('meo-the-cam');
      try { if (window.HuongDan) HuongDan.bao('doi-the', { tu: theChon }); } catch (e) { /* bỏ qua */ }
    }
    if (bh) {
      theEl = h('span', 'pal-the'); theEl.style.display = 'none';
      nutTruoc = nutTam('trai', 'choi.theTruoc', 'pal-the-truoc', function () { daDoiThe(); pal.buoc(-1); });
      theEl.appendChild(nutTruoc);
      var giua = h('span', 'the-giua'); theTen = h('span', 'the-chu'); theCham = h('span', 'the-cham');
      giua.appendChild(theTen); giua.appendChild(theCham); theEl.appendChild(giua);
      nutSau = nutTam('phai', 'choi.theSau', 'pal-the-sau', function () { daDoiThe(); pal.buoc(1); });
      theEl.appendChild(nutSau);
      bh.appendChild(theEl);
      cuonEl = h('span', 'cuon-nut'); cuonEl.style.display = 'none';
      nutLen = nutTam('len', 'choi.palLen', 'pal-len', function () { pal.cuon(-1); });
      nutXuong = nutTam('xuong', 'choi.palXuong', 'pal-xuong', function () { pal.cuon(1); });
      cuonEl.appendChild(nutLen); cuonEl.appendChild(nutXuong);
      bh.appendChild(cuonEl);
    }
    host.addEventListener('wheel', function (ev) {
      if (!host.classList.contains('cuon')) return;
      ev.preventDefault(); dungQuanTinh(); host.scrollTop += ev.deltaY * (ev.deltaMode === 1 ? 16 : 1); veCuon();
    }, { passive: false });
    function dungQuanTinh() { if (qtHen) { if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(qtHen); qtHen = 0; } }
    /** Khay đang cuộn được (nội dung dài hơn khung)? */
    this.cuonDuoc = function () { return host.classList.contains('cuon'); };
    /** Cuộn khay thêm d px (đơn vị gốc của khung; dương = xuống), dừng quán tính đang chạy. Trả về số px thực đã cuộn (0 khi chạm đầu / cuối). */
    this.cuonThem = function (d) {
      dungQuanTinh();
      var cu = host.scrollTop; host.scrollTop = cu + d; veCuon();
      return host.scrollTop - cu;
    };
    /** Dừng quán tính (chạm tay vào khay). */
    this.dungQuanTinh = dungQuanTinh;
    /** Quán tính nhẹ sau khi nhấc tay khỏi lúc vuốt: v = vận tốc cuối (px gốc / ms, dương = xuống), giảm dần rồi dừng; chạm đầu / cuối là dừng. */
    this.quanTinh = function (v) {
      dungQuanTinh();
      if (!host.classList.contains('cuon') || !(Math.abs(v) >= 0.04) || typeof requestAnimationFrame !== 'function') return;
      v = Math.max(-1.8, Math.min(1.8, v));                                           // vuốt rất mạnh cũng chỉ trôi vừa phải
      var pos = host.scrollTop, truoc = null, toiDa = Math.max(0, host.scrollHeight - host.clientHeight);
      function buoc(tn) {
        var dt = truoc === null ? 16 : Math.min(40, tn - truoc); truoc = tn;
        pos = Math.max(0, Math.min(toiDa, pos + v * dt));
        host.scrollTop = pos; veCuon();
        v *= Math.pow(0.93, dt / 16);
        if (Math.abs(v) < 0.02 || pos <= 0 || pos >= toiDa) { qtHen = 0; return; }
        qtHen = requestAnimationFrame(buoc);
      }
      qtHen = requestAnimationFrame(buoc);
    };
    /** Nút ▲ ▼: thẻ dài thì sáng theo chỗ đang xem; khay nhiều thẻ thì luôn có mặt (mờ khi không có gì để cuộn) cho vị trí các nút không nhảy; một thẻ thì chỉ hiện khi tràn. */
    function veCuon() {
      if (!cuonEl) return;
      var tran = host.classList.contains('cuon');
      cuonEl.style.display = (tran || the.length > 1) ? '' : 'none';
      nutLen.disabled = !tran || host.scrollTop <= 0;
      nutXuong.disabled = !tran || host.scrollTop + host.clientHeight >= host.scrollHeight - 1;
    }
    /** Cuộn khay một trang: d = -1 lên, 1 xuống. */
    this.cuon = function (d) { dungQuanTinh(); host.scrollTop += d * Math.max(40, host.clientHeight - 34); veCuon(); };
    function chiSo(khoa) { for (var i = 0; i < the.length; i++) if (the[i].khoa === khoa) return i; return -1; }
    /** Tiêu đề: tên thẻ + chấm chỉ thẻ (• ○ ○); một thẻ thì chữ KHỐI LỆNH và ẩn ◀ ▶. */
    function veTieuDe() {
      if (!theEl) return;
      var nhieu = the.length > 1, i = chiSo(theChon);
      theEl.style.display = nhieu ? '' : 'none';
      if (tieuDe) tieuDe.style.display = nhieu ? 'none' : '';
      if (i < 0) return;
      theEl.setAttribute('data-the', theChon);
      theTen.className = 'the-chu k-' + theChon;
      theTen.innerHTML = ''; theTen.setAttribute('title', the[i].ten);
      var hp = hinhPart(the[i].part);
      if (hp) { theTen.classList.add('co-ic', 'co-part'); theTen.appendChild(hp); }
      else if (the[i].icon && window.Ve && Ve.ico) { theTen.classList.add('co-ic'); theTen.appendChild(Ve.ico(the[i].icon, 2, { fill: MAU_THE[theChon] || BM.trangV3, line: BM.bangV1, toi: BM.bangV1, sang: BM.trangV2 })); }
      else { theTen.textContent = the[i].ten; vuaTenThe(); }
      theCham.innerHTML = '';
      the.forEach(function (x, k) { theCham.appendChild(h('i', k === i ? 'on' : '')); });
      theEl.setAttribute('aria-label', t('choi.theSo', { ten: the[i].ten, i: i + 1, n: the.length }));
    }
    /** Hình một bộ phận cho tiêu đề thẻ: { loai: 'than' | 'tay', ma } → canvas vector đã cắt lề (VeIcon.hinhPartVec, cạnh 56 px thiết bị, lớp vi-part), hay null nếu không có mã.
     *  (V7c2: hết đường lùi bộ PART pixel.) */
    function hinhPart(bp) {
      if (!bp || !bp.ma || !window.VeIcon || !VeIcon.hinhPartVec) return null;
      var cvv = VeIcon.hinhPartVec(bp); if (!cvv) return null;
      cvv.className = 'pxi vi-part'; return cvv;
    }
    /** Tên thẻ dài thì co chữ cho vừa ô (đo được khi khay đã hiện: Xưởng gọi lại qua vua() sau khi mở). */
    function vuaTenThe() {
      if (!theTen || !the.length || theTen.classList.contains('co-ic')) return;
      theTen.style.fontSize = '';
      var fs = parseFloat(getComputedStyle(theTen).fontSize) || 11;
      while (theTen.clientWidth && theTen.scrollWidth > theTen.clientWidth + 1 && fs > 8) { fs -= 0.5; theTen.style.fontSize = fs + 'px'; }
    }
    /* ---- hướng dẫn đổi thẻ (cb.goiYThe, chỉ màn chơi), qua khung huong-dan.js: lần đầu khay có từ hai thẻ, ◀ ▶ sáng viền nhấp nháy + bong bóng "Bấm ▶ để sang thẻ Tay kẹp"
       cho tới khi người chơi tự đổi thẻ; lần đầu có thẻ Cảm biến cũng vậy (cờ 'meo-the' · 'meo-the-cam'; chuỗi lưu cờ khi XONG nên chưa đổi thẻ thì lần sau còn nhắc). */
    function huongGoiY() {
      if (!cb.goiYThe || the.length < 2 || !theEl) return null;
      var i = chiSo(theChon), n = the.length, ci = chiSo('cam');
      var dauTien = !daXemMeo('meo-the'), camMoi = ci >= 0 && !daXemMeo('meo-the-cam');
      if (!dauTien && !camMoi) return null;
      var dich = (!dauTien && camMoi && ci !== i) ? ci : (i + 1) % n;
      return { co: dauTien ? 'meo-the' : 'meo-the-cam', nut: dich === (i + 1) % n ? 'sau' : (dich === (i - 1 + n) % n ? 'truoc' : 'sau'), ten: the[dich].ten };
    }
    function capNhatGoiY() {
      if (!window.HuongDan) return;
      var g = huongGoiY();
      if (!g) { HuongDan.dung('doi-the'); return; }
      HuongDan.chay({
        id: 'doi-the', co: g.co, luuKhi: 'xong',
        buoc: [{
          dich: function () { return [nutTruoc, nutSau]; },
          neo: function () { var h2 = huongGoiY(); return h2 && h2.nut === 'truoc' ? nutTruoc : nutSau; },
          chu: function () { var h2 = huongGoiY(); return h2 ? t('choi.meoThe', { nut: h2.nut === 'sau' ? '▶' : '◀', ten: h2.ten }) : ''; },
          xong: 'doi-the', huong: 'tren'
        }]
      });
    }
    function danhDau() {
      Object.keys(bricks).forEach(function (k) { bricks[k].classList.toggle('lit', k === sangKhoa); bricks[k].classList.toggle('err', !!loiSet[k]); });
    }
    /** Vẽ thẻ đang chọn vào host (cuonDat: giữ chỗ đang cuộn khi vẽ lại cùng một thẻ). */
    function veThe(cuonDat) {
      dungQuanTinh();
      host.innerHTML = ''; bricks = {};
      host.classList.remove('cuon');
      var i = chiSo(theChon);
      if (i >= 0) the[i].ve();
      veGhim();
      veTieuDe();
      pal.vua();
      if (cuonDat && host.classList.contains('cuon')) host.scrollTop = cuonDat;
      veCuon();
      danhDau();
      apCamNhip();
    }
    /** Hàng ghim: khối `wait()` (màn có wait). Vẽ lại cùng thẻ (bricks xóa mỗi lần vẽ). */
    function veGhim() {
      if (!ghimEl) return;
      ghimEl.innerHTML = '';
      ghimEl.style.display = ghimWait ? '' : 'none';
      if (ghimWait) gach('wait', 'yl', 'goc', null, ghimEl);
    }
    /** Khối lệnh gốc của bộ phận đã có lệnh trong nhịp đang soạn: mờ + ổ khóa nhỏ (chạm vẫn gọi khiChen; khung chương trình từ chối và báo lý do). */
    function apCamNhip() {
      Object.keys(bricks).forEach(function (k) {
        if (k.indexOf('goc:') !== 0) return;
        var d = bricks[k], cam = !!camNhip[k.slice(4)], ic = d.querySelector('.cam-ic');
        d.classList.toggle('cam-nhip', cam);
        if (cam && !ic) { ic = h('span', 'cam-ic'); ic.appendChild(Ve.khoa(2, true)); d.appendChild(ic); }
        else if (!cam && ic) ic.parentNode.removeChild(ic);
        if (cam) d.setAttribute('title', camNhip[k.slice(4)]); else d.removeAttribute('title');
      });
    }
    this.datCamNhip = function (cam) { camNhip = cam || {}; apCamNhip(); };
    /** Sang thẻ kế (d = 1) / thẻ trước (d = -1), vòng tròn. */
    this.buoc = function (d) {
      if (the.length < 2) return;
      theChon = the[(chiSo(theChon) + d + the.length) % the.length].khoa;
      veThe(0);
    };
    this.chonThe = function (khoa) { if (khoa !== theChon && chiSo(khoa) >= 0) { theChon = khoa; veThe(0); } };
    this.theHienTai = function () { return theChon; };
    this.dsThe = function () { return the.map(function (x) { return x.khoa; }); };
    function nhan(chu, cls) { var g = h('div', 'gl ' + cls); g.appendChild(document.createTextNode(chu)); host.appendChild(g); return g; }
    function gach(ten, lopGach, loai, hamTS, cha) {
      var d = h('div', 'brick ' + lopGach); d.setAttribute('role', 'button');
      // chèn: mỗi đối số là 1 (số), "U" (một chữ) hoặc "R" (chuỗi chữ) tùy kiểu; hiện: tên đối số
      var goi = ten + '(' + (hamTS && hamTS.length ? hamTS.map(function (_, k) { var kd = cb.kieuDoiSo ? cb.kieuDoiSo(ten, k) : 'so'; return kd === 'mau' ? '"red"' : kd === 'luc' ? '"charge"' : kd === 'don' ? '"U"' : kd === 'ghep' ? '"R"' : kd === 'list' ? '[2, 3, 1]' : '1'; }).join(', ') : '') + ')';
      if (loai === 'goc' && ten === 'aim') goi = 'aim(1)';                       // aim(n): thẻ chèn sẵn tầm 1, chạm số để chọn 1 / 2 / 3
      if (loai === 'goc' && (ten === 'shoot' || ten === 'shoot_back') && cb.kieuDoiSo && cb.kieuDoiSo(ten, 0) === 'luc') goi = ten + '("charge")';   // màn Lực bắn: chạm "charge" để đổi sang "fast"
      if (loai === 'goc' && ten === 'ink') goi = 'ink("red")';                   // ink(c): thẻ chèn sẵn màu đỏ, chạm màu để chọn màu khác
      var hien = '(' + (hamTS || []).join(', ') + ')';
      d.setAttribute('data-ten', ten); d.setAttribute('data-loai', loai); d.setAttribute('data-goi', goi);
      var sp = h('span', 'tx');
      if (loai === 'goc') sp.textContent = ten === 'aim' ? 'aim(n)' : ten === 'ink' ? 'ink(c)' : ten;
      else { sp.appendChild(document.createTextNode(ten)); sp.appendChild(h('span', 'pn' + (hamTS && hamTS.length ? ' co' : ''), hien)); }
      d.appendChild(sp);
      if (loai !== 'goc') {
        var khoaH = !!khoaSet[loai + ':' + ten];                                     // hàm bị khóa ở màn này (hàm cốt truyện không cần sửa ở đây, hàm của màn khóa): ổ khóa thay bút chì, mở ở Xưởng chỉ xem
        var e = h('span', 'ed' + (khoaH ? ' khoa' : '')); e.setAttribute('role', 'button'); e.setAttribute('aria-label', t(khoaH ? 'choi.hamKhoaNhan' : 'choi.suaHam', { ten: ten })); e.title = e.getAttribute('aria-label');
        e.setAttribute('data-sua', ten);
        if (khoaH) { e.setAttribute('data-khoa', '1'); d.className += ' khoa'; }
        e.appendChild(khoaH ? Ve.khoa(2, true) : Ve.ico('edit', 2, { line: BM.bangV2 }));
        e.addEventListener('click', function (ev) { ev.stopPropagation(); cb.khiSua && cb.khiSua(loai, ten); });
        d.appendChild(e);
      }
      d.addEventListener('click', function () { cb.khiChen(goi); });
      (cha || host).appendChild(d); bricks[loai + ':' + ten] = d;
    }
    /** Thẻ biến (nhóm BIẾN): tên một đối số của hàm đang sửa. Chạm hoặc kéo vào dòng có số thì thay số đó bằng biến. */
    function gachBien(ten, cha) {
      var d = h('div', 'brick bien'); d.setAttribute('role', 'button');
      d.setAttribute('data-ten', ten); d.setAttribute('data-loai', 'bien'); d.setAttribute('data-goi', ten);
      d.appendChild(h('span', 'tx', ten));
      d.addEventListener('click', function () { cb.khiBien && cb.khiBien(ten); });
      (cha || host).appendChild(d); bricks['bien:' + ten] = d;
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
    /** Khối tím `for i in range(2):` (nhóm VÒNG LẶP); khối `while …:` màu xanh dương. */
    function gachVong(goi, khoa, lopThem) {
      goi = goi || 'for i in range(2):';
      var d = h('div', 'brick ' + (lopThem || 'pu') + ' vong'); d.setAttribute('role', 'button');
      d.setAttribute('data-ten', khoa === 'while' ? 'while' : 'for'); d.setAttribute('data-loai', 'vong'); d.setAttribute('data-goi', goi);
      var sp = h('span', 'tx'); sp.textContent = goi; d.appendChild(sp);
      d.addEventListener('click', function () { cb.khiChen(goi); });
      host.appendChild(d); bricks['vong:' + (khoa || 'for')] = d;
    }
    /** Khối danh sách (nhóm DANH SÁCH, xanh chanh): chạm hay kéo vào khung là chèn một dòng. khoa: gan | for | forlit | them. */
    function gachLs(goi, khoa) {
      var d = h('div', 'brick ls'); d.setAttribute('role', 'button');
      d.setAttribute('data-ten', 'ls-' + khoa); d.setAttribute('data-loai', 'ls'); d.setAttribute('data-goi', goi);
      d.appendChild(h('span', 'tx', goi));
      d.addEventListener('click', function () { cb.khiChen(goi); });
      host.appendChild(d); bricks['ls:' + khoa] = d;
    }
    /** Khối biến đếm (nhóm ĐẾM, hồng như thẻ biến): chạm hay kéo vào khung là chèn một dòng. khoa: gan (n = 0) | tang (n = n + 1) | lap (for i in range(n):). */
    function gachDem(goi, khoa) {
      var d = h('div', 'brick dem'); d.setAttribute('role', 'button');
      d.setAttribute('data-ten', 'dem-' + khoa); d.setAttribute('data-loai', 'dem'); d.setAttribute('data-goi', goi);
      d.appendChild(h('span', 'tx', goi));
      d.addEventListener('click', function () { cb.khiChen(goi); });
      host.appendChild(d); bricks['dem:' + khoa] = d;
    }
    this.dung = function (spec) {
      var cuonCu = host.scrollTop, khoaCu = spec.lamMoi ? null : theChon;           // dựng lại (sau mỗi lần sửa) thì giữ thẻ đang chọn và chỗ đang xem
      lastSpec = Object.assign({}, spec, { lamMoi: false });
      loiSet = {}; sangKhoa = null; viTri = {}; khoaSet = {}; khacSet = {};
      if (spec.lamMoi) moKhac = false;                                               // vào màn / mở Xưởng: nhóm "Hàm khác" thu gọn
      (spec.khoa || []).forEach(function (k) { khoaSet[k] = true; });
      var boQua = spec.boQua || null, goc = spec.goc || [], cam = spec.cam || [];
      var gocTay = goc.filter(function (n) { return TAY_TEN.indexOf(n) >= 0; });
      var gocNem = goc.filter(function (n) { return NEM_TEN.indexOf(n) >= 0; });                // máy ném: aim / throw / load
      var gocSung = goc.filter(function (n) { return SUNG_TEN.indexOf(n) >= 0; });              // súng hơi: shoot / shoot_back
      var gocSon = goc.filter(function (n) { return SON_TEN.indexOf(n) >= 0; });                // máy sơn: ink / dot / pen_down / pen_up
      var gocNC = goc.filter(function (n) { return NC_TEN.indexOf(n) >= 0; });                  // nam châm: magnet_n / magnet_s / magnet_off
      var camHN = cam.indexOf('distance') >= 0, camNong = cam.indexOf('warm') >= 0;             // hồng ngoại (mùa 2): distance() trả số nên không dùng làm `if distance():`; warm() là True / False
      var camKhac = cam.filter(function (n) { return n !== 'distance' && n !== 'warm'; });
      var camDau = cam.indexOf('front_metal') >= 0 ? 'front_metal' : camKhac.length ? camKhac[0] : camNong ? 'warm' : cam[0];      // màn có cảm biến từ: khối mẫu của while / if dùng front_metal()
      var camCuc = cam.indexOf('front_pole') >= 0;                                              // front_pole() trả chuỗi "N" / "S" / "none": khối mẫu so sánh chuỗi, không phải if front_pole():
      var gocChan = goc.filter(function (n) { return /^go_/.test(n) || CHAN_TEN.indexOf(n) >= 0; });      // nhện / drone: go_up / go_down / go_left / go_right (kèm wait); nhện còn có crouch / stand (co / duỗi chân)
      var gocTruot = goc.filter(function (n) { return /^slide_/.test(n); });                    // omni: slide_left / slide_right
      var gocThuong = goc.filter(function (n) { return n !== 'battery' && TAY_TEN.indexOf(n) < 0 && NC_TEN.indexOf(n) < 0 && NEM_TEN.indexOf(n) < 0 && SUNG_TEN.indexOf(n) < 0 && SON_TEN.indexOf(n) < 0 && !/^go_/.test(n) && CHAN_TEN.indexOf(n) < 0 && !/^slide_/.test(n) && CAM_BIEN_TEN.indexOf(n) < 0 && n !== 'color' && n !== 'look' && n !== 'wait'; });   // lệnh bánh; hàm cảm biến là ĐIỀU KIỆN, không phải lệnh; wait() ở hàng ghim
      ghimWait = goc.indexOf('wait') >= 0;
      var coTay = gocTay.length + gocNem.length + gocSung.length + gocNC.length + gocSon.length > 0;
      var coCam = cam.length > 0 || !!spec.mau || !!spec.pin;
      var coBien = !!(spec.bien && spec.bien.length);
      var coTS = coBien || [spec.em, spec.man].some(function (l) { return (l || []).some(function (f) { return f.thamSo && f.thamSo.length; }); });

      /* ---- khối cấu trúc Python (15/10): thẻ LOGIC (khóa 'cam') gom `for`, `while`, `if` / `elif` / `else`, điều kiện cảm biến và biến đếm — việc của bộ não, robot nào cũng có một;
         thẻ Thân / Tay chỉ còn lệnh của bộ phận. Màn chưa có cấu trúc nào (chuỗi 1, 2) thì không có thẻ Logic. */
      var dsDk = [], fm = typeof spec.mau === 'string' ? spec.mau : 'color';                  // fm: hàm đọc màu của màn ('look' ở drone có camera nhìn xuống)
      if (gocChan.length ? (spec.dieuKien || coCam) : coCam) {
        dsDk = spec.thamSoChuoi ? ['if d == "U":', 'elif d == "D":', 'else:'] : spec.pin && !spec.mau ? ['if battery() < 3:', 'else:'] : spec.mau ? (spec.pin ? ['if battery() < 3:'] : []).concat(cam.length ? ['if ' + camDau + '():'] : [], ['if ' + fm + '() == "red":', 'elif ' + fm + '() == "blue":', 'else:', 'c = ' + fm + '()'])          // cảm biến màu: so màu + gán biến (drone vừa có pin vừa có camera: thêm khối pin)
          : cam.length ? (cam.indexOf('right_clear') >= 0 ? ['if right_clear():', 'elif front_clear():', 'else:'] : ['if ' + camDau + '():', 'else:'])
          : ['if d == "U":', 'elif d == "D":', 'else:'];
      }
      if (camHN && dsDk.length) {                                                               // hồng ngoại: so số ô trống + gán biến d = distance(); khối `if distance():` (nếu lọt) đổi thành phép so sánh
        dsDk = dsDk.filter(function (s) { return s !== 'if distance():'; });
        if (!camKhac.length && !camNong && !spec.mau) dsDk = ['if distance() > 2:', 'else:'];
        else if (dsDk.indexOf('if distance() > 2:') < 0) dsDk.unshift('if distance() > 2:');
        if (dsDk.indexOf('d = distance()') < 0) dsDk.push('d = distance()');
      }
      if (camCuc && dsDk.length) {                                                              // cảm biến cực: ba khối if / elif so với "N", "S"; khối else: dùng chung
        dsDk = ['if front_pole() == "N":', 'elif front_pole() == "S":'].concat(dsDk.filter(function (s) { return s !== 'if front_pole():'; }));
        if (dsDk.indexOf('else:') < 0) dsDk.push('else:');
      }
      var dkCam = dsDk.some(function (s) { return RE_DK_CAM.test(s); });
      var chuWhile = spec.vong && spec.vongWhile ? (spec.pin && !spec.mau ? 'while battery() > 2:' : spec.mau && !cam.length ? 'while ' + fm + '() != ' + (fm === 'look' ? '"none"' : '"red"') + ':' : camCuc && !spec.mau ? 'while front_pole() == "none":' : camHN && !camKhac.length && !spec.mau ? 'while distance() > 0:' : camNong && !camKhac.length && !spec.mau ? 'while not warm():' : camDau === 'front_metal' ? 'while not front_metal():' : 'while ' + (camDau || 'front_clear') + '():') : null;     // vòng while: khối xanh dương (hồng ngoại: while distance() > 0: / while not warm():)
      var coLogic = coCam || !!spec.vong || dsDk.length > 0 || !!chuWhile || !!spec.bienDem || !!spec.list;

      /* ---- hàm của em chia vào thẻ theo lệnh gốc nó gọi (kể cả gián tiếp); thẻ không có thì rơi về THÂN */
      var hamMan = spec.man || [], emTat = spec.em || [], emKhac = spec.em ? (spec.emKhac || []) : [];
      function tim(ten) {
        var i;
        for (i = 0; i < hamMan.length; i++) if (hamMan[i].ten === ten) return hamMan[i];
        for (i = 0; i < emTat.length; i++) if (emTat[i].ten === ten) return emTat[i];
        for (i = 0; i < emKhac.length; i++) if (emKhac[i].ten === ten) return emKhac[i];
        return null;
      }
      var emThe = { than: [], tay: [], cam: [] }, manThe = { than: [], tay: [], cam: [] }, khacThe = { than: [], tay: [], cam: [] };
      /** Thẻ của một hàm: theo lệnh gốc nó gọi; hàm còn TRỐNG thân thì theo spec.theRong(ten) (thẻ của bản trong lời giải màn) — 23/10: drop() mới tạo còn trống
       *  từng nằm ở THÂN trong khi khay mở sẵn thẻ TAY, về sân không thấy hàm đâu. */
      function theoThe(f) {
        var k = !(f.than || []).some(coY) && spec.theRong ? (spec.theRong(f.ten) || 'than') : theCuaHam(f, tim);
        return ((k === 'tay' && !coTay) || (k === 'cam' && !coLogic)) ? 'than' : k;
      }
      emTat.filter(function (f) { return f.ten !== boQua; }).forEach(function (f) { var k = theoThe(f); emThe[k].push(f); viTri['em:' + f.ten] = k; });
      emKhac.filter(function (f) { return f.ten !== boQua; }).forEach(function (f) { var k = theoThe(f); khacThe[k].push(f); viTri['em:' + f.ten] = k; khacSet['em:' + f.ten] = true; });
      /* hàm của màn xếp vào thẻ bộ phận CÙNG LUẬT với hàm của em (không còn thẻ "Của màn"): màu cam, có ổ khóa nếu màn khóa nó */
      hamMan.filter(function (f) { return f.ten !== boQua; }).forEach(function (f) { var k = theoThe(f); manThe[k].push(f); viTri['man:' + f.ten] = k; });

      function lop(them) { return (host.firstChild ? 'g2 ' : 'g1 ') + them; }       // nhóm đầu tiên là g1 (không cách trên), các nhóm sau g2
      /** Nhóm BIẾN (đối số của hàm đang sửa): ở đầu mọi thẻ, hai đối số xếp một hàng. */
      function nhomBien() {
        if (!coBien) return;
        nhan(t('choi.nhom.bien'), lop('g-bien'));
        var cot = spec.bien.length > 1 ? h('div', 'g-2c') : null;
        if (cot) host.appendChild(cot);
        spec.bien.forEach(function (n) { gachBien(n, cot); });
      }
      /** Nhóm HÀM CỦA EM của thẻ: có nút Hàm mới (màn chơi) nên thẻ nào cũng có tiêu đề này; không có nút và không có hàm nào thì ẩn.
       *  khac: hàm màn này không dùng tới (TP.tachHamKhac) → cuối nhóm, sau nút "Hàm khác (n)" chạm để mở / thu gọn. */
      function nhomEm(ds, khac) {
        khac = khac || [];
        if (!spec.em || (!ds.length && !khac.length && !(spec.coNutMoi && cb.khiMoi))) return;
        var g2 = nhan(t('choi.nhom.em'), lop('g-em'));
        if (spec.coNutMoi && cb.khiMoi) {
          var nb = h('button', 'nb'); nb.setAttribute('data-nut', 'ham-moi');
          nb.appendChild(Ve.ico('plus', 1, { line: BM.bangV2, fill: BM.trangV3 }));
          nb.appendChild(document.createTextNode(t('choi.hamMoi')));
          nb.addEventListener('click', function () { cb.khiMoi(theChon); });                // truyền thẻ đang xem: hàm mới mở ở Xưởng sẽ hiện đúng thẻ đó
          g2.appendChild(nb);
        }
        if (coTS) ds = ds.filter(function (f) { return f.thamSo && f.thamSo.length; }).concat(ds.filter(function (f) { return !(f.thamSo && f.thamSo.length); }));   // hàm có tham số (chủ đề của chương) lên đầu
        ds.forEach(function (f) { gach(f.ten, 'gr', 'em', f.thamSo); });
        if (!khac.length) return;
        var nk = h('button', 'nk' + (moKhac ? ' mo' : '')); nk.setAttribute('data-nut', 'ham-khac'); nk.setAttribute('aria-expanded', moKhac ? 'true' : 'false'); nk.setAttribute('title', t('choi.hamKhacNhan', { n: khac.length }));
        nk.appendChild(Ve.ico(moKhac ? 'thutra' : 'next', 1, { line: BM.bangV2, fill: BM.trangV3 }));
        nk.appendChild(h('span', 'nk-chu', t(moKhac ? 'choi.hamKhacAn' : 'choi.hamKhac', { n: khac.length })));
        nk.addEventListener('click', function (ev) { ev.stopPropagation(); moKhac = !moKhac; veThe(host.scrollTop); });
        host.appendChild(nk);
        if (moKhac) khac.forEach(function (f) { gach(f.ten, 'gr', 'em', f.thamSo); });
      }
      /** Nhóm HÀM CỦA MÀN của thẻ (màu cam, ngay trên hàm của em): chỉ có khi thẻ có hàm của màn. */
      function nhomMan(ds) {
        if (!ds.length) return;
        var g3 = nhan(t('choi.nhom.man'), lop('g-ma'));
        if (coBien) g3.appendChild(h('span', 'tg', t('choi.nhom.chiMan')));
        ds.forEach(function (f) { gach(f.ten, 'or', 'man', f.thamSo); });
      }
      /** Mỗi thẻ gom nhiều nhóm: tiêu đề nhóm chỉ hiện khi thẻ có từ hai nhóm trở lên (một nhóm thì tên thẻ đã nói đủ). */
      function nhomGoc(coNhan) {
        if (!gocThuong.length) return;
        if (coNhan) nhan(t('choi.nhom.goc'), lop(''));
        gocThuong.forEach(function (n) { gach(n, lopMau(n) === 'gr' ? 'pu' : lopMau(n), 'goc'); });
      }
      function nhomChan(coNhan) {
        if (!gocChan.length) return;
        if (coNhan) nhan(t('choi.nhom.chan'), lop('g-chan'));
        var cot2 = h('div', 'g-2c'); host.appendChild(cot2);                                   // lệnh gốc của nhện xếp hai cột cho gọn
        gocChan.forEach(function (n) { gach(n, n === 'wait' ? 'yl' : 'chan', 'goc', null, cot2); });
      }
      function nhomTruot(coNhan) {
        if (!gocTruot.length) return;
        if (coNhan) nhan(t('choi.nhom.truot'), lop('g-truot'));
        gocTruot.forEach(function (n) { gach(n, 'truot', 'goc'); });
      }
      function nhomLenhTay(ds, khoaNhan, coNhan, hai) {
        if (!ds.length) return;
        if (coNhan) nhan(t(khoaNhan), lop('g-tay'));
        var cot2 = null;
        if (hai) { cot2 = h('div', 'g-2c'); host.appendChild(cot2); }
        ds.forEach(function (n) { gach(n, 'tay', 'goc', null, cot2); });
      }
      /** Khối `for` (và `for c in "R":` ở chương chuỗi chữ): cuối phần lệnh gốc của mọi thẻ lệnh, không tiêu đề riêng (khối tím tự nói). */
      function khoiFor() {
        if (!spec.vong) return;
        gachVong();
        if (spec.chuoi) gachVong('for c in "R":', 'forc');
      }
      /** Nhóm ĐẾM (man.bienDem, chương che-cam-bien): ba khối hồng `n = 0`, `n = n + 1`, `for i in range(n):`. Ở thẻ CẢM BIẾN (không có cảm biến thì ở THÂN), ngay dưới khối `for`. */
      function nhomDem() {
        if (!spec.bienDem) return;
        nhan(t('choi.nhom.dem'), lop('g-dem'));
        gachDem('n = 0', 'gan'); gachDem('n = n + 1', 'tang'); gachDem('for i in range(n):', 'lap');
      }

      /** Nhóm DANH SÁCH (spec.list: man.cauTruc có 'list'): bốn khối xanh chanh `a = [1, 2]`, `for n in a:`, `for n in [1, 2]:`, `a.append(1)`. Ở thẻ LOGIC, ngay dưới nhóm ĐẾM. */
      function nhomList() {
        if (!spec.list) return;
        nhan(t('choi.nhom.list'), lop('g-ls'));
        var nhin = spec.mau === 'look';                                                          // drone có camera nhìn xuống (look()): danh sách đa phần là danh sách MÀU
        gachLs('a = [1, 2]', 'gan'); gachLs(nhin ? 'for c in a:' : 'for n in a:', 'for'); gachLs(nhin ? 'for c in ["red", "blue"]:' : 'for n in [1, 2]:', 'forlit'); gachLs('a.append(1)', 'them');
        if (nhin) gachLs('a.append(look())', 'them-look');                                         // ghi màu camera thấy: seen.append(look())
      }

      /* ---- các thẻ, theo thứ tự: Thân · Tay · Cảm biến (hàm của màn nằm trong thẻ bộ phận của nó) */
      var loaiTay = [];                                                                       // tên thẻ TAY theo bộ phận thật; nhiều loại dụng cụ cùng lúc thì tên chung "Tay"
      if (gocTay.length) loaiTay.push(goc.indexOf('arm_left') >= 0 || goc.indexOf('arm_right') >= 0 ? 'Xoay' : 'Kep');       // tay xoay (có arm_left / arm_right) thì thẻ tên "Tay xoay"
      if (gocNC.length) loaiTay.push('NamCham');
      if (gocNem.length) loaiTay.push('Nem');
      if (gocSung.length) loaiTay.push('Sung');                                               // thẻ tên "Súng hơi"
      if (gocSon.length) loaiTay.push('Son');                                                 // thẻ tên "Máy sơn"
      var tenThe = {
        than: t(spec.loai === 'nhen' ? 'choi.the.nhen' : spec.loai === 'drone' ? 'choi.the.drone' : 'choi.the.xe'),
        tay: t('choi.the.tay' + (loaiTay.length === 1 ? loaiTay[0] : '')),
        cam: t('choi.the.cam')
      };
      var icThe = {                                                                           // icon tiêu đề thẻ (ve.js ICON BỘ PHẬN), dùng chung với đèn nhịp; chỉ dùng khi không vẽ được hình bộ phận
        than: ({ nhen: 'denChan', drone: 'denCanh', xich: 'denXich', omni: 'denTruot' })[spec.loai] || 'denBanh',
        tay: loaiTay.length === 1 ? ({ Kep: 'denKepMo', Xoay: 'denXoay', NamCham: 'denNamCham', Nem: 'denNem', Sung: 'denSung', Son: 'denSon' })[loaiTay[0]] : 'denTayLen',
        cam: 'denLogic'
      };
      var partThe = {                                                                         // 22/10: tiêu đề thẻ vẽ bằng HÌNH BỘ PHẬN THẬT (bộ PART) thay icon đèn: điều khiển xe thì thấy thân xe, không thấy bánh tròn
        than: { loai: 'than', ma: ({ nhen: 'nhen', drone: 'drone', xich: 'xich', omni: 'omni' })[spec.loai] || 'hai-banh' },
        tay: loaiTay.length === 1 ? { loai: 'tay', ma: ({ Kep: 'kep', Xoay: 'xoay', NamCham: 'nam-cham', Nem: 'nem', Sung: 'hoi', Son: 'son' })[loaiTay[0]] } : null,
        cam: null                                                                              // thẻ Logic (for / if / while / biến) không phải phần cứng: giữ icon
      };
      the = [];
      var nThan = [gocChan, gocThuong, gocTruot].filter(function (l) { return l.length; }).length + (coBien ? 1 : 0);
      the.push({ khoa: 'than', ten: tenThe.than, icon: icThe.than, part: partThe.than, ve: function () {
        nhomBien(); nhomChan(nThan > 1); nhomGoc(nThan > 1); nhomTruot(nThan > 1);
        nhomMan(manThe.than);
        nhomEm(emThe.than, khacThe.than);
      } });
      if (coTay) {
        var nTay = [gocTay, gocNC, gocNem, gocSung, gocSon].filter(function (l) { return l.length; }).length + (coBien ? 1 : 0);
        the.push({ khoa: 'tay', ten: tenThe.tay, icon: icThe.tay, part: partThe.tay, ve: function () {
          nhomBien();
          nhomLenhTay(gocTay, 'choi.nhom.tay', nTay > 1, !!gocChan.length || gocTay.length > 4);          // tay xoay có sáu lệnh: xếp hai cột (nâng / hạ, trái / phải, kẹp / thả)
          nhomLenhTay(gocNC, 'choi.nhom.namCham', nTay > 1);
          nhomLenhTay(gocNem, 'choi.nhom.mayNem', nTay > 1);
          nhomLenhTay(gocSung, 'choi.nhom.sungHoi', nTay > 1);
          nhomLenhTay(gocSon, 'choi.nhom.maySon', nTay > 1, gocSon.length > 2);
          nhomMan(manThe.tay);
          nhomEm(emThe.tay, khacThe.tay);
        } });
      }
      if (coLogic) {
        the.push({ khoa: 'cam', ten: tenThe.cam, icon: icThe.cam, ve: function () {
          nhomBien();
          if (coBien && (spec.vong || chuWhile || dsDk.length)) nhan(t('choi.nhom.dk'), lop('g-dk'));
          khoiFor();
          if (chuWhile) gachVong(chuWhile, 'while', 'wh');
          dsDk.forEach(gachDk);
          nhomDem();
          nhomList();
          nhomMan(manThe.cam);
          nhomEm(emThe.cam, khacThe.cam);
        } });
      }
      /* thẻ chọn: giữ thẻ đang chọn khi vẽ lại; không có (vào màn / mở Xưởng, hay thẻ cũ không còn) thì thẻ mặc định `spec.the`, không có nữa thì THÂN */
      var ds = the.map(function (x) { return x.khoa; });
      theChon = (khoaCu && ds.indexOf(khoaCu) >= 0) ? khoaCu : (spec.the && ds.indexOf(spec.the) >= 0 ? spec.the : ds[0]);
      veThe(theChon === khoaCu ? cuonCu : 0);
    };
    /** Khay vừa khung: khối LUÔN giữ cỡ đầy đủ (dễ chạm trên điện thoại, không tự co nhỏ); dài hơn khung thì bật chế độ cuộn (vuốt dọc, lăn chuột, nút ▲ ▼ ở tiêu đề). */
    this.vua = function () {
      if (!host.clientHeight) return;
      host.classList.add('cuon'); host.scrollTop = 0; host.classList.remove('cuon');       // .pal mặc định overflow:clip không nhận scrollTop; .cuon (overflow:hidden) mới đặt lại được chỗ đang xem
      if (host.scrollHeight > host.clientHeight + 1) host.classList.add('cuon');
      veCuon();
      vuaTenThe();
      vuaChuGach();
      capNhatGoiY();
    };
    /** Tên khối dài hơn chỗ trống: co chữ cho vừa (không dưới 78% cỡ gốc), vẫn dài thì CSS cắt gọn bằng "…". Đo được khi khay đã hiện. */
    function vuaChuGach() {
      Object.keys(bricks).forEach(function (k) {
        var tx = bricks[k].querySelector ? bricks[k].querySelector('.tx') : null;
        if (!tx) return;
        tx.style.fontSize = '';
        if (!(tx.clientWidth && tx.scrollWidth > tx.clientWidth + 1)) return;
        var goc = parseFloat(getComputedStyle(tx).fontSize) || 14, fs = goc;
        while (tx.scrollWidth > tx.clientWidth + 1 && fs > goc * 0.78) { fs -= 0.5; tx.style.fontSize = fs + 'px'; }
      });
    }
    this.datSang = function (loai, ten) {
      sangKhoa = loai ? loai + ':' + ten : null;
      danhDau();
    };
    this.datLoi = function (ds) {
      loiSet = {}; (ds || []).forEach(function (k) { loiSet[k] = true; });
      if (!Object.keys(bricks).some(function (k) { return loiSet[k]; })) {            // khối báo lỗi nằm ở thẻ khác (hay trong nhóm "Hàm khác" đang thu gọn): sang thẻ đó, mở nhóm
        var k2 = (ds || []).filter(function (k) { return viTri[k] && chiSo(viTri[k]) >= 0 && (viTri[k] !== theChon || (khacSet[k] && !moKhac)); })[0];
        if (k2) { if (khacSet[k2]) moKhac = true; theChon = viTri[k2]; veThe(0); }
      }
      danhDau();
      var dau = Object.keys(bricks).filter(function (k) { return loiSet[k]; })[0];
      if (dau && host.classList.contains('cuon')) {         // khối báo lỗi nằm ngoài tầm nhìn thì cuộn tới
        var b = bricks[dau], hr = host.getBoundingClientRect(), br = b.getBoundingClientRect(), k = host.offsetHeight ? hr.height / host.offsetHeight : 1;
        if (br.top < hr.top || br.bottom > hr.bottom) { host.scrollTop += (br.top - hr.top) / k - 20; veCuon(); }
      }
    };
    this.lai = function () { if (lastSpec) this.dung(lastSpec); };
    /** Cho thấy khối k ('em:ten' / 'man:ten'): sang thẻ chứa nó, mở nhóm "Hàm khác" nếu nó nằm trong đó, cuộn tới rồi nháy vài lần (về sân từ Xưởng: hàm vừa sửa / vừa tạo). Không có khối → false. */
    this.hienGach = function (k) {
      if (!viTri[k] || chiSo(viTri[k]) < 0) return false;
      var doi = false;
      if (khacSet[k] && !moKhac) { moKhac = true; doi = true; }
      if (viTri[k] !== theChon) { theChon = viTri[k]; doi = true; }
      if (doi) veThe(0);
      var b = bricks[k];
      if (!b) return false;
      if (host.classList.contains('cuon')) {
        var hr = host.getBoundingClientRect(), br = b.getBoundingClientRect(), ty = host.offsetHeight ? hr.height / host.offsetHeight : 1;
        if (br.top < hr.top || br.bottom > hr.bottom) { host.scrollTop += (br.top - hr.top) / ty - 20; veCuon(); }
      }
      b.classList.remove('nhay-ve'); void b.offsetWidth; b.classList.add('nhay-ve');
      setTimeout(function () { b.classList.remove('nhay-ve'); }, 1700);
      return true;
    };
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
   * - Cảm ứng trên KHAY: ngón tay rung nhẹ (dưới NGUONG_CHAM, đơn vị khung 360) vẫn là chạm. Vuốt chủ yếu theo chiều DỌC (quá TY_LE_DOC lần chiều ngang) = CUỘN khay (có quán tính nhẹ, vẫn có ▲ ▼ và lăn chuột);
   *   kéo ngang, hoặc giữ ~GIU_CHEN_MS (khối nhô lên) rồi kéo = kéo khối sang chương trình. Khay không cuộn được thì kéo hướng nào cũng là kéo khối.
   */
  var Keo = (function () {
    var HOLD_MS = 250, NGUONG_CHUOT = 6, NGUONG_CHAM = 14, NGUONG_BAC = 14;   // NGUONG_CHAM: px khung 360 (nhân hệ số co giãn) ngón tay được rung mà vẫn là CHẠM; NGUONG_BAC: px (hệ khung 360) kéo ngang cho một bậc thụt
    var GIU_CHEN_MS = 300, TY_LE_DOC = 1.5;                                   // giữ khối ở khay ngần này ms thì kéo hướng nào cũng được; vuốt dọc quá TY_LE_DOC lần chiều ngang = cuộn khay
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
      var ic = h('div', 'thung-ic'); ic.appendChild(Ve.ico('trash', 7, { line: BM.doToiV9, fill: BM.trangToiV7, shade: BM.doSangV11 }));
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
          started: false, key: null, slot: null, vung: null, loi: null, ghost: null, timer: null, cfg: cfg, panP: panP, panK: panK, thung: thung,
          t0: Date.now(), giu: false, cuon: null
        };
        // dòng code: giữ ~250 ms là bắt đầu kéo; khối ở kho: chỉ cần kéo (để chạm vẫn là chèn ngay); cảm ứng giữ ~300 ms thì khối nhô lên, kéo hướng nào cũng được
        if (loai === 'doi') cur.timer = setTimeout(function () { if (cur && !cur.started) batDau(); }, HOLD_MS);
        else if (loai === 'chen' && cur.kieu !== 'mouse') cur.timer = setTimeout(function () { if (cur && !cur.started && !cur.cuon) { cur.giu = true; cur.el.classList.add('giu'); } }, GIU_CHEN_MS);
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
        if (ed.chiDoc && ed.chiDoc()) return;                        // chương trình chính cố định: không kéo dòng
        bat(ev, 'doi', i, row.querySelector('.strip') || row, arr[i]);
      });
      function batKhay(ev) {
        var b = ev.target.closest && ev.target.closest('.brick');
        if (!b || ev.target.closest('.ed')) {                                                        // chỗ trống / nhãn nhóm / nút sửa: cảm ứng vuốt dọc ở đây cũng cuộn khay (chạm vẫn là chạm)
          if (ev.pointerType && ev.pointerType !== 'mouse' && pal.cuonDuoc && pal.cuonDuoc()) {
            pal.dungQuanTinh();
            bat(ev, 'cuon', -1, pal.host, '');
            if (cur && cur.loai === 'cuon') cur.cuon = { y: ev.clientY, mau: [{ t: Date.now(), y: ev.clientY }], da: false };
          }
          return;
        }
        pal.dungQuanTinh && pal.dungQuanTinh();
        bat(ev, 'chen', -1, b, b.getAttribute('data-goi'));
        if (cur && b.getAttribute('data-loai') === 'bien') { cur.bien = true; cur.kieuB = cfg.kieuBien ? cfg.kieuBien(b.getAttribute('data-goi')) : 'so'; }       // thẻ biến: thả lên một dòng thì thay số của dòng, không chèn dòng mới
      }
      pal.host.addEventListener('pointerdown', batKhay);
      if (pal.ghim) pal.ghim.addEventListener('pointerdown', batKhay);                         // khối wait() ở hàng ghim dưới khay
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
        g.classList.remove('giu', 'khoa');
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
      else if (vung === 'khung' && ed.chiDoc && ed.chiDoc()) { loi = 'chidoc'; xem = lap(arr, -1, null); }        // chương trình chính cố định: thả vào là báo, không chèn
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
    /** Ngón tay đang cuộn khay: khay đi theo ngón (vuốt lên = nội dung đi lên = cuộn xuống); nhớ vài mẫu cuối để tính quán tính khi thả. */
    function cuonTheo(c, ev) {
      var k = stageInfo().k, cu = c.cuon;
      ev.preventDefault();
      c.pal.cuonThem((cu.y - c.y) / k);
      cu.y = c.y; cu.da = true;
      var bay = Date.now(); cu.mau.push({ t: bay, y: c.y });
      while (cu.mau.length > 2 && bay - cu.mau[0].t > 100) cu.mau.shift();
    }
    /** Thả tay sau khi cuộn: vận tốc từ vài mẫu cuối (px khung / ms, dương = cuộn xuống); tay đã dừng quá ~80 ms thì không trôi. */
    function quanTinhCuon(c) {
      var m = c.cuon.mau, a = m[0], b = m[m.length - 1], k = stageInfo().k;
      if (m.length < 2 || Date.now() - b.t > 80 || b.t - a.t < 8) return;
      c.pal.quanTinh((a.y - b.y) / k / (b.t - a.t));
    }
    function dichuyen(ev) {
      var c = cur; if (!c || ev.pointerId !== c.id) return;
      c.x = ev.clientX; c.y = ev.clientY;
      if (!c.started) {
        if (c.cuon) { cuonTheo(c, ev); return; }                                           // đang cuộn khay bằng ngón tay
        var dx = c.x - c.sx, dy = c.y - c.sy, d = Math.sqrt(dx * dx + dy * dy);
        var ng = c.kieu === 'mouse' ? NGUONG_CHUOT : NGUONG_CHAM * stageInfo().k;
        if (d <= ng) return;
        if (c.loai === 'doi' && c.kieu !== 'mouse') { nuotClick(); ketThuc(); return; }   // vuốt nhanh trên dòng (cảm ứng) khi chưa giữ đủ lâu: bỏ
        if (c.loai === 'chen' && c.kieu !== 'mouse' && !c.giu && c.pal.cuonDuoc && c.pal.cuonDuoc() && Math.abs(dy) > TY_LE_DOC * Math.abs(dx)) {     // vuốt chủ yếu dọc, chưa giữ đủ lâu: cuộn khay (không kéo khối)
          clearTimeout(c.timer);
          c.cuon = { y: c.sy, mau: [{ t: c.t0, y: c.sy }], da: false };
          cuonTheo(c, ev); return;
        }
        batDau(); if (!c.started) return;
      }
      ev.preventDefault();
      viTriGhost(); capNhat(false);
    }
    function nha(ev) {
      var c = cur; if (!c || ev.pointerId !== c.id) return;
      if (ev.clientX !== undefined) { c.x = ev.clientX; c.y = ev.clientY; }
      if (!c.started) {
        if (c.cuon && c.cuon.da) { quanTinhCuon(c); nuotClick(); }         // vừa vuốt cuộn: thả tay thì còn trôi một chút, không chèn nhầm
        ketThuc(); return;                                                  // chạm nhanh: để click xử lý như cũ
      }
      ev.preventDefault();
      capNhat(false);
      var ed = c.ed, vung = c.vung, slot = c.slot, loi = c.loi, loai = c.loai, tu = c.tu, txt = c.txt, cf = c.cfg, bac = c.bac, laBien = c.bien, dichBien = c.dich, kieuB = c.kieuB;
      nuotClick(); ketThuc();
      if (loi === 'chidoc') { if (cf.khiChiDoc) cf.khiChiDoc(); return; }
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
      if (c.giu && c.el) c.el.classList.remove('giu');
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
    var nx = h('button', 'bt g-rd bg-x'); nx.setAttribute('data-nut', 'bong-x'); nx.setAttribute('aria-label', t('choi.anBong')); nx.title = t('choi.anBong');
    nx.appendChild(Ve.ico('close', 2, { line: BM.doToi }));
    nx.addEventListener('click', function (ev) { ev.stopPropagation(); bongAn(b); });
    b.appendChild(nx);
    var ch = h('div', 'bg-ch');
    if (o.pager) {
      var tr = h('button', 'bt g-wd pg', '‹'); tr.setAttribute('data-nut', 'cd-truoc'); tr.setAttribute('aria-label', t('choi.truoc')); tr.title = t('choi.truoc');
      var sa = h('button', 'bt g-wd pg', '›'); sa.setAttribute('data-nut', 'cd-sau'); sa.setAttribute('aria-label', t('choi.tiep')); sa.title = t('choi.tiep');
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
    var m = Ve.mui(b.classList.contains('tin') ? BM.lamSangV24 : BM.doV8, 2);
    m.classList.add('bg-mui');                                             // V7b: ở vector là <svg>
    b.appendChild(m);
    var rb = b.getBoundingClientRect(), rh = hangEl.getBoundingClientRect();
    var k = b.offsetHeight ? rb.height / b.offsetHeight : 1;
    var mh = parseFloat(m.style.height) || m.offsetHeight || 0;             // svg không có offsetHeight: cỡ CSS đặt sẵn trong style
    var y = (rh.top + rh.height / 2 - rb.top) / k - mh / 2;
    y = Math.max(2, Math.min(b.offsetHeight - mh - 2, y));
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
    if (window.VeIcon && VeIcon.thay) Promise.resolve().then(function () { VeIcon.thay(g); });      // V7b: nút chỉ icon trong hộp có title (sau khi người gọi dựng xong nội dung)
    return { hop: hop, than: than, nut: null };
  }
  function nut(mau, chu, khiBam, ten) {
    var b = h('button', 'bt ' + mau + ' hop-nut', chu);
    if (ten) b.setAttribute('data-nut', ten);
    b.addEventListener('click', khiBam);
    return b;
  }
  /** Hỏi lại có/không. Trả về Promise<boolean>. o = { tieuDe, noiDung, canhBao, co (nhãn nút đồng ý), mau (màu nút đồng ý), khong (nhãn nút hủy, mặc định "Hủy") }. */
  function xacNhan(o) {
    return new Promise(function (xong) {
      var m = mo(o.tieuDe || t('chung.xacNhan'), 'hop-nho');
      m.than.appendChild(hv('div', 'hop-chu', o.noiDung));
      if (o.canhBao) m.than.appendChild(hv('div', 'hop-chu canh', o.canhBao));
      var hang = h('div', 'hop-hang');
      hang.appendChild(nut('g-wd', o.khong || t('chung.huy'), function () { dong(); xong(false); }, 'huy'));
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

  /** Vị trí dòng / khối để tô cho các chẩn đoán lõi KHÔNG ghi sẵn `cho` (luật vật 14/10): thả bị chặn bằng kẹp (tha-bi-chan kieu 'kep'), vật vỡ (vat-vo) → lệnh release();
   *  kẹp hụt (kep-hut) → grab(); vật nam châm bị đẩy (day-vat) → magnet_n() / magnet_s() của nhịp đó; xe vướng vật / tường (dam-tuong) → lệnh bánh của nhịp đó. Tìm trong vết: các mục 'lenh' nằm ngay trước mục 'nhip' mang số nhịp của chẩn đoán.
   *  Trả về { cot, dong, ten? } hay null (lõi đã có cho thì không đụng tới). */
  var LENH_BANH = /^(left_move|right_move|left_back|right_back|slide_left|slide_right|go_up|go_down|go_left|go_right)$/;
  var LENH_BAY = /^(go_up|go_down|go_left|go_right|wait)$/;                          // drone hết pin: lệnh bay (kể cả wait) của nhịp cuối
  function choBoSung(c, vet) {
    if (!c || c.cho || !vet || c.nhip === undefined || c.nhip === null) return null;
    var re = (c.ma === 'tha-bi-chan' && c.kieu === 'kep') || c.ma === 'vat-vo' ? /^release$/ : c.ma === 'kep-hut' ? /^grab$/ : c.ma === 'day-vat' ? /^magnet_(n|s)$/ : c.ma === 'dam-tuong' ? LENH_BANH : c.ma === 'het-pin' ? LENH_BAY : null;
    if (!re) return null;
    for (var i = 0; i < vet.length; i++) {
      if (vet[i].loai !== 'nhip' || vet[i].nhip !== c.nhip) continue;
      for (var j = i - 1; j >= 0 && vet[j].loai === 'lenh'; j--) if (re.test(vet[j].ten) && vet[j].cho) return vet[j].cho;
      break;
    }
    return null;
  }

  window.TP = { h: h, esc: esc, choBoSung: choBoSung, vanBan: vanBan, mauDong: mauDong, tachDoiSo: tachDoiSo, thayDoiSo: thayDoiSo, lopMau: lopMau, bacCua: bacCua, coCauTruc: coCauTruc, chonSo: chonSo, chonChuoi: chonChuoi, chonDieuKien: chonDieuKien, chonMau: chonMau, chonMuc: chonMuc, chonDkm: chonDkm, datCheMau: datCheMau, datCheList: datCheList, coListCua: coListCua, chonPtu: chonPtu, tachList: tachList, themPtuDong: themPtuDong, boPtuDong: boPtuDong, litThanhTen: litThanhTen, catTop: catTop, LIST_TOI_DA: LIST_TOI_DA, LIST_TEN_GOI_Y: LIST_TEN_GOI_Y, coMauCua: coMauCua, coPinCua: coPinCua, coDieuKienCua: coDieuKienCua, MAU_DS: MAU_DS, tachDKM: tachDKM, camBienCua: camBienCua, taoKieu: taoKieu, taoSoToiDa: taoSoToiDa, locHamTheoRobot: locHamTheoRobot, tachHamKhac: tachHamKhac, theHamRong: theHamRong, theCuaHam: theCuaHam, theMacDinh: theMacDinh, khoaKhay: khoaKhay, daXemMeo: daXemMeo, datXemMeo: datXemMeo, nhomNhip: nhomNhip, lenhCungNhip: lenhCungNhip, lyDoCamNhip: lyDoCamNhip, BO_PHAN_LENH: BO_PHAN_LENH, xepChanDoan: xepChanDoan, dongChonSo: dongChonSo, Editor: Editor, Palette: Palette, Chan: Chan, Keo: Keo, XUONG_MS: XUONG_MS,
    bongVe: bongVe, bongAn: bongAn, bongMui: bongMui, vuaChu: vuaChu, Hop: { mo: mo, dong: dong, nut: nut, xacNhan: xacNhan, doc: doc } };
})();
