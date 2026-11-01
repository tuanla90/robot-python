/* ============================================================================
   san-robot-core.js — "Đội Robot Chấn Hưng", ĐỢT 1
   Nhân mô phỏng sân lưới (chạy theo tick) + nhân chạy code (tập con Python)
   + 5 bài của chặng 1 + cách chấm hạng A/B/C.

   Không dùng thư viện nào. Chạy được cả trong trình duyệt (window.RobotCore)
   và trong Node (module.exports) để test được.

   Hai tầng tách rời (theo GDD v0.2 §18):
     - NHÂN MÔ PHỎNG: sân, tick, luật, bản ghi  ← tài sản thật của game
     - NHÂN CHẠY CODE: tập con Python            ← thay được (sau này là Pyodide)
   Chúng chỉ nối với nhau qua bộ hàm API của robot.

   Đợt 1 CHƯA có: part, pin, ô nhớ có hạn, robot thứ hai, đối thủ, thư viện hàm.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- hướng */

  // B = Bắc (lên), D = Đông (phải), N = Nam (xuống), T = Tây (trái)
  var VEC_TOA = { B: [0, -1], D: [1, 0], N: [0, 1], T: [-1, 0] };
  var TEN_HUONG = { B: 'Bắc', D: 'Đông', N: 'Nam', T: 'Tây' };
  var KY_HUONG = { '^': 'B', '>': 'D', 'v': 'N', '<': 'T' };
  // quay trái: B→T→N→D→B   (ngược chiều kim đồng hồ)
  var TRAI = { B: 'T', T: 'N', N: 'D', D: 'B' };
  var PHAI = { B: 'D', D: 'N', N: 'T', T: 'B' };

  /* ----------------------------------------------------------- lỗi của game */

  function LoiChayGame(loai, dong, thongDiep) {
    var e = new Error(thongDiep);
    e.loai = loai; e.dong = dong; e.thongDiep = thongDiep; e.cuaGame = true;
    return e;
  }
  function LoiCuPhap(dong, td) { return LoiChayGame('syntax-error', dong, td); }
  function LoiThutLe(dong, td) { return LoiChayGame('indent-error', dong, td); }
  function LoiRuntime(dong, td) { return LoiChayGame('runtime-error', dong, td); }
  function LoiHetGio(dong, td) { return LoiChayGame('timeout', dong, td); }
  function LoiLapVoTan(dong, td) { return LoiChayGame('infinite-loop', dong, td); }

  /* ==========================================================================
     NHÂN MÔ PHỎNG
     ========================================================================== */

  /**
   * Đọc sân từ mảng chuỗi.
   * Ký hiệu: '.' trống · '#' vật cản · 'o' vật cần nhặt · 'D' ô đích
   *          '^' '>' 'v' '<' = robot xuất phát, kèm hướng
   */
  function docSan(rows) {
    var cao = rows.length, rong = rows[0].length, batDau = null, dsVat = [], dich = null;
    for (var y = 0; y < cao; y++) {
      if (rows[y].length !== rong) throw new Error('Sân không phải hình chữ nhật (dòng ' + (y + 1) + ')');
      for (var x = 0; x < rong; x++) {
        var c = rows[y][x];
        if (KY_HUONG[c]) { batDau = { x: x, y: y, huong: KY_HUONG[c] }; }
        else if (c === 'o') { dsVat.push({ x: x, y: y, daNhat: false }); }
        else if (c === 'D') { dich = { x: x, y: y }; }
        else if (c !== '.' && c !== '#') { throw new Error('Ký hiệu lạ trong sân: "' + c + '"'); }
      }
    }
    if (!batDau) throw new Error('Sân thiếu robot xuất phát');
    if (!dich) throw new Error('Sân thiếu ô đích');
    return { goc: rows.slice(), o: rows.slice(), rong: rong, cao: cao, batDau: batDau, dsVat: dsVat, dich: dich };
  }

  /** Dịch cả sân đi (dx, dy) vào một sân mới to hơn — dùng để sinh sân ẩn.
   *  Đợt 1 (chặng 1 chỉ có lệnh tuần tự): sân ẩn giữ NGUYÊN hình dạng tương đối,
   *  chỉ đổi vị trí. Nhờ vậy lời giải viết theo đường đi tương đối chạy được ở
   *  mọi sân ẩn, còn code ghi cứng toạ độ / đi thừa bước thì đâm tường. */
  function dichSan(rows, dx, dy, rongMoi, caoMoi) {
    var cao = rows.length, rong = rows[0].length;
    var o = [];
    for (var y = 0; y < caoMoi; y++) {
      var d = [];
      for (var x = 0; x < rongMoi; x++) d.push('.');
      o.push(d);
    }
    for (var yy = 0; yy < cao; yy++) {
      for (var xx = 0; xx < rong; xx++) {
        var c = rows[yy][xx];
        if (c === '.') continue;
        var nx = xx + dx, ny = yy + dy;
        if (nx < 0 || ny < 0 || nx >= rongMoi || ny >= caoMoi) throw new Error('Dịch sân ra ngoài khung');
        o[ny][nx] = c;
      }
    }
    return o.map(function (d) { return d.join(''); });
  }

  function trongSan(san, x, y) { return x >= 0 && y >= 0 && x < san.rong && y < san.cao; }
  function oTuong(san, x, y) { return !trongSan(san, x, y) || san.o[y][x] === '#'; }

  /* ==========================================================================
     NHÂN CHẠY CODE — tập con Python
     Hỗ trợ: gán (= += -= *= /=), if/elif/else, while, for-in-range, def/return,
             break/continue/pass, số, so sánh, and/or/not, gọi hàm, print.
     CHUỖI KÝ TỰ (chữ trong nháy), đúng Python:
       - literal "..." và '...' (thoát: \n \t \\ \' \"; dòng nào chưa đóng nháy là lỗi cú pháp);
       - == != < <= > >= giữa chuỗi với chuỗi; chuỗi == số luôn là False (như Python);
         so sánh thứ tự giữa chuỗi và số là lỗi chạy;
       - + nối chuỗi, += cũng vậy; * nhân chuỗi với số nguyên; chuỗi + số là lỗi chạy (TypeError);
       - in / not in: "U" in "UD" (chuỗi con);
       - len(s), str(x), int(s) là hàm dựng sẵn của nhân;
       - for c in "UURR": lặp từng ký tự (for ... in range(...) vẫn như cũ);
       - print in chuỗi; hàm game nhận và trả chuỗi (go("up"), color() trả "red").
     True / False vẫn là 1 / 0 (giữ nguyên để không vỡ code cũ).
     DANH SÁCH (list), đúng Python nhưng chỉ tập con đủ cho lớp 5–7:
       - literal [2, 3, 1] · ["red", "blue"] · [] (phần tử là số hoặc chuỗi); gán a = [...]; truyền làm đối số / tham số hàm của người chơi
         (truyền THAM CHIẾU như Python: hàm append vào thì danh sách của nơi gọi cũng đổi);
       - for x in a: / for x in [1, 2]: (duyệt theo vị trí, thêm phần tử lúc đang duyệt thì duyệt cả phần tử mới) · a[i] (0 <= i < len(a)) · len(a) · a.append(x);
       - x in a / x not in a (so đúng giá trị: "1" khác 1) · a == b (so từng phần tử) · a + b (nối hai danh sách) · a += b · if a: (rỗng là sai);
       - KHÔNG làm, báo lỗi lời Việt "Game chưa dạy ...": cắt đoạn a[1:3], gán vào ô a[0] = x, danh sách lồng danh sách, lệnh khác
         (.pop .sort .insert …), list comprehension [x for ...], chỉ số âm, lấy chữ của chuỗi bằng s[i]; hàm của game (move, forward…) không nhận danh sách.
       - print / str() in danh sách như Python: [1, 2, 'red'].
     TUPLE (bộ giá trị, mùa Bến sông), tập con đủ cho lớp 5–7:
       - literal (a, b) · ("back", 2) · (1, 2, 3) · (a,) (phần tử là số hoặc chuỗi; ngoặc có dấu phẩy mới là tuple, (a) chỉ là nhóm;
         () rỗng là lỗi lời Việt); vế phải của = và return không cần ngoặc: a, b = b, a · return "back", 2;
       - gỡ cặp khi gán: h, s = flow() (số tên phải bằng số phần tử, không thì lỗi lời Việt nói rõ hai con số);
       - t[0] t[1] · len(t) · x in t · for x in t: (như danh sách) · == != so từng phần tử; < <= > >= so lần lượt từng phần tử như Python
         (tuple chỉ so thứ tự với tuple, phần tử cùng kiểu); tuple == danh sách luôn là False (như Python);
       - print / str() in như Python: ('back', 2) · (1,) · hàm của game trả tuple (flow() trả (huong, suc)); hàm của game không nhận tuple;
       - KHÔNG làm, báo lỗi lời Việt "Game chưa dạy ...": gán vào ô t[0] = x, + hai tuple, tuple lồng tuple / danh sách, cắt đoạn.
     Hàm dựng sẵn thêm: min(a, b, ...) / max(a, b, ...) (từ 2 đối số, toàn số, toàn chuỗi hay toàn tuple; hay MỘT danh sách / tuple
       làm đối số duy nhất — cho mùa Nông trại), abs(x) (số).
     Chưa hỗ trợ: class, import, try/except, f-string, nháy ba.
     ========================================================================== */

  var TU_KHOA = ['if', 'elif', 'else', 'while', 'for', 'in', 'def', 'return',
    'break', 'continue', 'pass', 'and', 'or', 'not', 'True', 'False'];
  var TOAN_TU_2 = ['//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/='];
  var TOAN_TU_1 = ['+', '-', '*', '/', '%', '<', '>', '=', '(', ')', ':', ',', '[', ']', '{', '}', '.'];

  /** Cắt phần chú thích (#...) của một dòng, nhưng KHÔNG cắt dấu # nằm trong chuỗi ký tự. */
  function boChuThich(dong) {
    var nhay = null;
    for (var i = 0; i < dong.length; i++) {
      var c = dong[i];
      if (nhay) {
        if (c === '\\') i++;
        else if (c === nhay) nhay = null;
      } else if (c === '"' || c === "'") nhay = c;
      else if (c === '#') return dong.slice(0, i);
    }
    return dong;
  }

  var THOAT = { n: '\n', t: '\t', '\\': '\\', "'": "'", '"': '"' };

  function tachToken(code) {
    var src = String(code).replace(/\r\n?/g, '\n');
    var dongNguon = src.split('\n');
    var toks = [], nguCan = [0];

    for (var i = 0; i < dongNguon.length; i++) {
      var soDong = i + 1;
      var dong = boChuThich(dongNguon[i].replace(/\t/g, '    '));   // tab = 4 dấu cách
      if (dong.trim() === '') continue;

      var rong = dong.length - dong.replace(/^ +/, '').length;
      if (rong > nguCan[nguCan.length - 1]) {
        nguCan.push(rong); toks.push({ k: 'indent', dong: soDong });
      } else {
        while (nguCan.length > 1 && rong < nguCan[nguCan.length - 1]) {
          nguCan.pop(); toks.push({ k: 'dedent', dong: soDong });
        }
        if (rong !== nguCan[nguCan.length - 1]) {
          throw LoiThutLe(soDong, 'Thụt lề không khớp với khối bên trên.');
        }
      }

      var j = rong;
      while (j < dong.length) {
        var c = dong[j];
        if (c === ' ') { j++; continue; }
        if (c === '"' || c === "'") {
          var chu = '', kk = j + 1, daDong = false;
          while (kk < dong.length) {
            var ch = dong[kk];
            if (ch === c) { daDong = true; kk++; break; }
            if (ch === '\\' && kk + 1 < dong.length) {
              var tiep = dong[kk + 1];
              chu += (tiep in THOAT) ? THOAT[tiep] : '\\' + tiep;   // thoát lạ: giữ nguyên như Python
              kk += 2; continue;
            }
            chu += ch; kk++;
          }
          if (!daDong) {
            throw LoiCuPhap(soDong, 'Chuỗi chưa đóng: mở bằng dấu nháy ' + c + ' nhưng không có dấu ' + c + ' đóng lại trước khi hết dòng.');
          }
          toks.push({ k: 'chuoi', v: chu, dong: soDong });
          j = kk; continue;
        }
        if (c >= '0' && c <= '9') {
          var k = j;
          while (k < dong.length && ((dong[k] >= '0' && dong[k] <= '9') || dong[k] === '.')) k++;
          var so = dong.slice(j, k);
          if ((so.match(/\./g) || []).length > 1) throw LoiCuPhap(soDong, 'Số viết sai: ' + so);
          toks.push({ k: 'so', v: parseFloat(so), dong: soDong });
          j = k; continue;
        }
        if (/[A-Za-z_]/.test(c)) {
          var k2 = j;
          while (k2 < dong.length && /[A-Za-z0-9_]/.test(dong[k2])) k2++;
          var w = dong.slice(j, k2);
          toks.push(TU_KHOA.indexOf(w) >= 0 ? { k: 'kw', v: w, dong: soDong } : { k: 'ten', v: w, dong: soDong });
          j = k2; continue;
        }
        var hai = dong.substr(j, 2);
        if (TOAN_TU_2.indexOf(hai) >= 0) { toks.push({ k: 'op', v: hai, dong: soDong }); j += 2; continue; }
        if (TOAN_TU_1.indexOf(c) >= 0) { toks.push({ k: 'op', v: c, dong: soDong }); j++; continue; }
        throw LoiCuPhap(soDong, 'Ký tự lạ: "' + c + '"');
      }
      toks.push({ k: 'nl', dong: soDong });
    }
    while (nguCan.length > 1) { nguCan.pop(); toks.push({ k: 'dedent', dong: dongNguon.length }); }
    toks.push({ k: 'het', dong: dongNguon.length });
    return toks;
  }

  function phanTich(toks) {
    var i = 0;
    var bienListTuple = Object.create(null);
    var coDictHoacHam = toks.some(function (tk) {
      return (tk.k === 'op' && tk.v === '{') || (tk.k === 'ten' && tk.v === 'dict') || (tk.k === 'kw' && tk.v === 'def');
    });
    function xem() { return toks[i]; }
    function lay() { return toks[i++]; }
    function laOp(v) { var t = xem(); return t.k === 'op' && t.v === v; }
    function anOp(v) { if (laOp(v)) { i++; return true; } return false; }
    function mong(ok, msg) { if (!ok) { var t = xem(); throw LoiCuPhap(t.dong, msg); } }

    function boQuaNl() { while (xem().k === 'nl') i++; }

    // khối sau dấu ':' — nl indent ... dedent
    function khoi() {
      mong(anOp(':'), 'Thiếu dấu ":" ở cuối dòng này.');
      mong(xem().k === 'nl', 'Sau dấu ":" phải xuống dòng.');
      boQuaNl();
      mong(xem().k === 'indent', 'Thiếu dòng thụt lề bên trong khối.');
      i++; // indent
      var ds = [];
      while (xem().k !== 'dedent' && xem().k !== 'het') {
        boQuaNl();
        if (xem().k === 'dedent' || xem().k === 'het') break;
        ds.push(lenh());
      }
      if (xem().k === 'dedent') i++;
      if (!ds.length) throw LoiCuPhap(xem().dong, 'Khối rỗng.');
      return ds;
    }

    function lenh() {
      var t = xem();
      if (t.k === 'indent') {
        throw LoiThutLe(t.dong, 'Dòng này thụt lề thừa — không có khối nào cần nó.');
      }
      if (t.k === 'kw') {
        if (t.v === 'if') { i++; return lenhIf(); }
        if (t.v === 'while') {
          i++;
          var dk = bieuThuc();
          return { loai: 'while', dk: dk, than: khoi(), dong: t.dong };
        }
        if (t.v === 'for') {
          i++;
          var bien = lay();
          mong(bien.k === 'ten', 'Sau "for" phải là tên biến.');
          mong(xem().k === 'kw' && xem().v === 'in', 'Sau tên biến phải là "in".');
          i++;
          // sau "in": range(...) (đếm số) hoặc một chuỗi ký tự (lặp từng ký tự)
          var duyet = bieuThuc();
          if (duyet.loai === 'goi' && duyet.ten === 'range') {
            return { loai: 'for', bien: bien.v, tenHam: 'range', thamSo: duyet.thamSo, than: khoi(), dong: t.dong };
          }
          return { loai: 'for', bien: bien.v, duyet: duyet, than: khoi(), dong: t.dong };
        }
        if (t.v === 'def') {
          i++;
          var ten = lay();
          mong(ten.k === 'ten', 'Sau "def" phải là tên hàm.');
          mong(anOp('('), 'Thiếu dấu "(" sau tên hàm.');
          var ps = [];
          if (!laOp(')')) {
            ps.push(lay().v);
            while (anOp(',')) ps.push(lay().v);
          }
          mong(anOp(')'), 'Thiếu dấu ")" sau danh sách đối số.');
          return { loai: 'def', ten: ten.v, thamSo: ps, than: khoi(), dong: t.dong };
        }
        if (t.v === 'return') {
          i++;
          if (xem().k === 'nl') return { loai: 'return', gt: null, dong: t.dong };
          return heLenh({ loai: 'return', gt: bieuThucDay(), dong: t.dong });
        }
        if (t.v === 'break') { i++; return heLenh({ loai: 'break', dong: t.dong }); }
        if (t.v === 'continue') { i++; return heLenh({ loai: 'continue', dong: t.dong }); }
        if (t.v === 'pass') { i++; return heLenh({ loai: 'pass', dong: t.dong }); }
      }
      // gán?
      if (t.k === 'ten' && toks[i + 1] && toks[i + 1].k === 'op' && ['=', '+=', '-=', '*=', '/='].indexOf(toks[i + 1].v) >= 0) {
        var ten2 = lay().v, op = lay().v, gt2 = bieuThucDay();
        if (op === '=') {
          if (gt2.loai === 'dsLit' || gt2.loai === 'tupleLit') bienListTuple[ten2] = true;
          else delete bienListTuple[ten2];
        }
        return heLenh({ loai: 'gan', ten: ten2, op: op, gt: gt2, dong: t.dong });
      }
      // gỡ cặp: h, s = flow() · a, b = b, a (mọi vế trái là tên; vế phải là tuple hay thứ trả về tuple)
      if (t.k === 'ten' && toks[i + 1] && toks[i + 1].k === 'op' && toks[i + 1].v === ',') {
        var j = i, tens = [];
        while (toks[j] && toks[j].k === 'ten' && toks[j + 1] && toks[j + 1].k === 'op' && toks[j + 1].v === ',') { tens.push(toks[j].v); j += 2; }
        if (toks[j] && toks[j].k === 'ten' && toks[j + 1] && toks[j + 1].k === 'op' && toks[j + 1].v === '=') {
          tens.push(toks[j].v);
          i = j + 2;
          tens.forEach(function (tn) { delete bienListTuple[tn]; });
          return heLenh({ loai: 'ganNhieu', tens: tens, gt: bieuThucDay(), dong: t.dong });
        }
        if (toks[j] && toks[j].k === 'ten' && toks[j + 1] && toks[j + 1].k === 'op' && ['+=', '-=', '*=', '/='].indexOf(toks[j + 1].v) >= 0) {
          throw LoiCuPhap(t.dong, 'Gỡ cặp (h, s = ...) chỉ dùng được với dấu = thường, không dùng ' + toks[j + 1].v + ' được.');
        }
      }
      var bt = bieuThuc();
      if (xem().k === 'op' && ['=', '+=', '-=', '*=', '/='].indexOf(xem().v) >= 0 && bt.loai === 'chiSo') {
        if ((bt.goc.loai === 'ten' && bienListTuple[bt.goc.ten]) || !coDictHoacHam) {
          throw LoiCuPhap(t.dong, 'Game chưa dạy gán vào một ô của danh sách hay tuple (a[0] = x). Với danh sách, muốn thêm phần tử thì dùng a.append(x); ' +
            'muốn làm lại cả danh sách thì gán lại: a = [1, 2]. Tuple thì không đổi được từng phần tử, hãy tạo tuple mới: t = (1, 2).');
        }
        var opChi = lay().v;
        return heLenh({ loai: 'ganChiSo', goc: bt.goc, chi: bt.chi, op: opChi, gt: bieuThucDay(), dong: t.dong });
      }
      return heLenh({ loai: 'bt', gt: bt, dong: t.dong });
    }

    /** Lệnh đơn phải hết dòng ngay sau nó (như Python): `print "hi"` hay `move() 3` là lỗi cú pháp. */
    function heLenh(n) {
      var t = xem();
      if (t.k !== 'nl') {
        throw LoiCuPhap(t.dong, n.loai === 'bt' && n.gt && n.gt.loai === 'ten'
          ? 'Sau "' + n.gt.ten + '" còn chữ thừa mà thiếu cặp ngoặc: muốn gọi hàm thì viết ' + n.gt.ten + '(...).'
          : 'Chỗ này thừa chữ: mỗi dòng chỉ chứa một lệnh (kiểm tra dấu phẩy, dấu ngoặc).');
      }
      return n;
    }

    function lenhIf() {
      var t = toks[i - 1];
      var dk = bieuThuc();
      var nhanh = [{ dk: dk, than: khoi() }];
      var traiLai = null;
      boQuaNl();
      while (xem().k === 'kw' && (xem().v === 'elif' || xem().v === 'else')) {
        if (xem().v === 'elif') {
          i++;
          nhanh.push({ dk: bieuThuc(), than: khoi() });
        } else {
          i++;
          traiLai = khoi();
          break;
        }
        boQuaNl();
      }
      return { loai: 'if', nhanh: nhanh, traiLai: traiLai, dong: t.dong };
    }

    // biểu thức — ưu tiên từ thấp lên cao
    function bieuThuc() { return hoac(); }
    /** Biểu thức có thể là tuple không ngoặc (vế phải của = và return): a, b · "back", 2. Dấu phẩy thừa cuối cũng là tuple (a,). */
    function bieuThucDay() {
      var e = bieuThuc();
      if (!laOp(',')) return e;
      var ds = [e];
      while (anOp(',')) { if (xem().k === 'nl' || xem().k === 'het') break; ds.push(bieuThuc()); }
      return { loai: 'tupleLit', ds: ds, dong: e.dong };
    }
    function hoac() {
      var n = va();
      while (xem().k === 'kw' && xem().v === 'or') { var d = lay().dong; n = { loai: 'or', trai: n, phai: va(), dong: d }; }
      return n;
    }
    function va() {
      var n = khong();
      while (xem().k === 'kw' && xem().v === 'and') { var d = lay().dong; n = { loai: 'and', trai: n, phai: khong(), dong: d }; }
      return n;
    }
    function khong() {
      if (xem().k === 'kw' && xem().v === 'not') { var d = lay().dong; return { loai: 'not', gt: khong(), dong: d }; }
      return soSanh();
    }
    function soSanh() {
      var n = congTru();
      for (;;) {
        var t = xem();
        if (t.k === 'op' && ['==', '!=', '<', '<=', '>', '>='].indexOf(t.v) >= 0) {
          var op = lay(); n = { loai: 'soSanh', op: op.v, trai: n, phai: congTru(), dong: op.dong };
        } else if (t.k === 'kw' && t.v === 'in') {
          i++; n = { loai: 'trong', phu: false, trai: n, phai: congTru(), dong: t.dong };
        } else if (t.k === 'kw' && t.v === 'not' && toks[i + 1] && toks[i + 1].k === 'kw' && toks[i + 1].v === 'in') {
          i += 2; n = { loai: 'trong', phu: true, trai: n, phai: congTru(), dong: t.dong };
        } else break;
      }
      return n;
    }
    function congTru() {
      var n = nhanChia();
      while (xem().k === 'op' && (xem().v === '+' || xem().v === '-')) {
        var op = lay(); n = { loai: 'soHoc', op: op.v, trai: n, phai: nhanChia(), dong: op.dong };
      }
      return n;
    }
    function nhanChia() {
      var n = donNhat();
      while (xem().k === 'op' && ['*', '/', '//', '%'].indexOf(xem().v) >= 0) {
        var op = lay(); n = { loai: 'soHoc', op: op.v, trai: n, phai: donNhat(), dong: op.dong };
      }
      return n;
    }
    function donNhat() {
      if (laOp('-')) { var d = lay().dong; return { loai: 'am', gt: donNhat(), dong: d }; }
      return coBan();
    }
    /** Sau một biểu thức nhỏ: a[i] (lấy phần tử) và a.append(x) (lệnh của danh sách); có thể nối tiếp nhau. */
    function hauTo(n) {
      for (;;) {
        if (laOp('[')) {
          var d = lay().dong;
          if (laOp(':')) throw LoiCuPhap(d, MSG_CAT);
          if (laOp(']')) throw LoiCuPhap(d, 'Trong dấu [ ] phải có chỉ số, ví dụ a[0].');
          var chi = bieuThuc();
          if (laOp(':')) throw LoiCuPhap(d, MSG_CAT);
          mong(anOp(']'), 'Thiếu dấu "]" sau chỉ số.');
          n = { loai: 'chiSo', goc: n, chi: chi, dong: d };
        } else if (laOp('.')) {
          var d2 = lay().dong, pt = lay();
          mong(pt.k === 'ten', 'Sau dấu "." phải là tên lệnh, ví dụ a.append(1) hay s.add(1).');
          if (pt.v !== 'append' && pt.v !== 'add') {
            throw LoiCuPhap(d2, PHUONG_THUC_LIST.indexOf(pt.v) >= 0
              ? 'Game chưa dạy lệnh .' + pt.v + '() cho danh sách. Ở đây chỉ có .append(x) để thêm một phần tử vào cuối.'
              : 'Game chưa dạy cách viết ".' + pt.v + '". Với danh sách, game chỉ dạy .append(x); với tập hợp (set), chỉ dạy .add(x).');
          }
          mong(anOp('('), 'Thiếu cặp ngoặc: muốn thêm phần tử thì viết a.' + pt.v + '(x).');
          var ts = [];
          if (!laOp(')')) {
            ts.push(bieuThuc());
            while (anOp(',')) ts.push(bieuThuc());
          }
          mong(anOp(')'), 'Thiếu dấu ")" sau .' + pt.v + '(.');
          n = { loai: 'goiPt', doiTuong: n, ten: pt.v, thamSo: ts, dong: d2 };
        } else break;
      }
      return n;
    }
    function coBan() { return hauTo(nguyen()); }
    function nguyen() {
      var t = xem();
      if (t.k === 'op' && t.v === '{') {          // từ điển (dict): {1: "U", 2: "R"} · {} — hoặc tập hợp (set): {1, 2, 3}
        i++;
        if (laOp('}')) { i++; return { loai: 'dictLit', cap: [], dong: t.dong }; }
        var dau = bieuThuc();
        if (xem().k === 'kw' && xem().v === 'for') {
          throw LoiCuPhap(xem().dong, 'Game chưa dạy cách viết từ điển hay tập hợp bằng vòng for trong ngoặc nhọn ({... for ...}).');
        }
        if (anOp(':')) {
          var gtDau = bieuThuc();
          var cap = [{ khoa: dau, gt: gtDau }];
          while (anOp(',')) {
            if (laOp('}')) break;
            var kTiep = bieuThuc();
            if (!anOp(':')) throw LoiCuPhap(xem().dong, 'Trong từ điển {khóa: giá_trị}, mỗi mục đều phải có dấu ":" ngăn giữa khóa và giá trị.');
            cap.push({ khoa: kTiep, gt: bieuThuc() });
          }
          mong(anOp('}'), 'Thiếu dấu "}" đóng từ điển.');
          return { loai: 'dictLit', cap: cap, dong: t.dong };
        }
        var dss = [dau];
        while (anOp(',')) {
          if (laOp('}')) break;
          var ptTiep = bieuThuc();
          if (laOp(':')) throw LoiCuPhap(xem().dong, 'Không trộn tập hợp {a, b} với từ điển {k: v} trong cùng cặp ngoặc nhọn được.');
          dss.push(ptTiep);
        }
        mong(anOp('}'), 'Thiếu dấu "}" đóng tập hợp.');
        return { loai: 'setLit', ds: dss, dong: t.dong };
      }
      if (t.k === 'op' && t.v === '[') {          // danh sách: [1, 2] · ["red"] · []
        i++;
        var dsl = [];
        if (!laOp(']')) {
          dsl.push(bieuThuc());
          if (xem().k === 'kw' && xem().v === 'for') {
            throw LoiCuPhap(xem().dong, 'Game chưa dạy cách viết danh sách bằng vòng for trong ngoặc vuông ([x for x in ...]). ' +
              'Hãy tạo danh sách rỗng a = [] rồi dùng for và a.append(x).');
          }
          while (anOp(',')) { if (laOp(']')) break; dsl.push(bieuThuc()); }
        }
        mong(anOp(']'), 'Thiếu dấu "]" đóng danh sách.');
        return { loai: 'dsLit', ds: dsl, dong: t.dong };
      }
      if (t.k === 'so') { i++; return { loai: 'so', gt: t.v, dong: t.dong }; }
      if (t.k === 'chuoi') { i++; return { loai: 'so', gt: t.v, dong: t.dong }; }
      if (t.k === 'kw' && t.v === 'True') { i++; return { loai: 'so', gt: 1, dong: t.dong }; }
      if (t.k === 'kw' && t.v === 'False') { i++; return { loai: 'so', gt: 0, dong: t.dong }; }
      if (t.k === 'ten') {
        i++;
        if (laOp('(')) {
          i++;
          var ts = [];
          if (!laOp(')')) {
            ts.push(bieuThuc());
            while (anOp(',')) ts.push(bieuThuc());
          }
          mong(anOp(')'), 'Thiếu dấu ")" trong lời gọi hàm.');
          return { loai: 'goi', ten: t.v, thamSo: ts, dong: t.dong };
        }
        return { loai: 'ten', ten: t.v, dong: t.dong };
      }
      if (laOp('(')) {                            // (a) là nhóm · (a, b) là tuple · (a,) cũng là tuple · () là lỗi
        i++;
        if (laOp(')')) throw LoiCuPhap(t.dong, 'Game chưa dạy tuple rỗng (). Tuple phải có ít nhất một giá trị, ví dụ ("back", 2).');
        var e = bieuThuc();
        if (!laOp(',')) { mong(anOp(')'), 'Thiếu dấu ")".'); return e; }
        var dst = [e];
        while (anOp(',')) { if (laOp(')')) break; dst.push(bieuThuc()); }
        mong(anOp(')'), 'Thiếu dấu ")" đóng tuple.');
        return { loai: 'tupleLit', ds: dst, dong: t.dong };
      }
      throw LoiCuPhap(t.dong, 'Chỗ này không phải biểu thức hợp lệ.');
    }

    var ds = [];
    boQuaNl();
    while (xem().k !== 'het') {
      ds.push(lenh());
      boQuaNl();
    }
    return ds;
  }

  /* ------------------------------------------------------------ danh sách (list) */

  var PHUONG_THUC_LIST = ['pop', 'sort', 'insert', 'remove', 'extend', 'reverse', 'index', 'count', 'clear', 'copy'];
  var MSG_CAT = 'Game chưa dạy cắt một đoạn của danh sách (a[1:3]). Lấy từng phần tử bằng a[0], a[1]… hay đi qua cả danh sách bằng for x in a:.';
  var MSG_LONG = 'Game chưa dạy danh sách nằm trong danh sách: phần tử chỉ là một số hoặc một chuỗi.';
  var MSG_LONG_TUPLE = 'Game chưa dạy tuple lồng tuple hay danh sách: phần tử của tuple chỉ là một số hoặc một chuỗi.';
  var LIST_TOI_DA = 10000;
  function laList(v) { return Array.isArray(v); }
  /** Tuple: bộ giá trị không đổi được. Giữ riêng một lớp (không phải Array) để mọi chỗ xử lý danh sách không nhận nhầm. */
  function Tuple(ds) { this.ds = ds; }
  function laTuple(v) { return v instanceof Tuple; }
  function taoTuple(ds) { return new Tuple(ds.slice()); }
  /** Dict: từ điển ánh xạ khóa → giá trị, giữ thứ tự thêm khóa như Python 3.7+. */
  function Dict(cap) { this.cap = cap ? cap.slice() : []; }
  function laDict(v) { return v instanceof Dict; }
  function taoDict(cap) { return new Dict(cap ? cap.slice() : []); }
  /** SetPy: tập hợp các phần tử không trùng lặp, giữ thứ tự thêm lần đầu. */
  function SetPy(ds) { this.ds = ds ? ds.slice() : []; }
  function laSet(v) { return v instanceof SetPy; }
  function taoSet(ds) { return new SetPy(ds ? ds.slice() : []); }
  /** Danh sách hay tuple: thứ có nhiều phần tử. Trả mảng phần tử (của danh sách là chính nó). */
  function laDay(v) { return laList(v) || laTuple(v); }
  function phanTu(v) { return laTuple(v) ? v.ds : v; }
  /** Đúng / sai như Python: danh sách / tuple / từ điển / tập hợp rỗng là sai. Số và chuỗi giữ cách cũ. */
  function dung(v) {
    if (laDay(v)) return phanTu(v).length > 0;
    if (laDict(v)) return v.cap.length > 0;
    if (laSet(v)) return v.ds.length > 0;
    return !!v;
  }
  function dictTimViTri(d, k) {
    for (var i = 0; i < d.cap.length; i++) if (bangNhau(d.cap[i].k, k)) return i;
    return -1;
  }
  function kiemKhoaBam(k, loaiTen, dong) {
    if (laList(k) || laDict(k) || laSet(k)) {
      throw LoiRuntime(dong, (loaiTen === 'set'
        ? 'Phần tử của tập hợp (set) chỉ là số, chuỗi hoặc tuple, không cho ' + tenKieu(k) + ' vào set được.'
        : 'Khóa của từ điển chỉ là số, chuỗi hoặc tuple, không dùng ' + tenKieu(k) + ' làm khóa được.'));
    }
  }
  function dictGan(d, k, v, dong) {
    kiemKhoaBam(k, 'dict', dong);
    if (laDict(v) || laSet(v)) {
      throw LoiRuntime(dong, 'Game chưa dạy từ điển lồng ' + tenKieu(v) + ': giá trị trong từ điển là số, chuỗi, tuple hoặc danh sách.');
    }
    var idx = dictTimViTri(d, k);
    if (idx >= 0) { d.cap[idx].v = v; return; }
    if (d.cap.length >= LIST_TOI_DA) throw LoiRuntime(dong, 'Từ điển nhiều mục quá (hơn ' + LIST_TOI_DA + ' mục).');
    d.cap.push({ k: k, v: v });
  }
  function dictLay(d, k, ten, dong) {
    kiemKhoaBam(k, 'dict', dong);
    var idx = dictTimViTri(d, k);
    if (idx < 0) {
      throw LoiRuntime(dong, 'Khóa ' + dangChu(k) + ' không có trong từ điển' + (ten ? ' ' + ten : '') +
        ' (Python báo KeyError). Kiểm tra bằng ' + dangChu(k) + ' in ' + (ten || 'd') + ' trước khi đọc.');
    }
    return d.cap[idx].v;
  }
  function setCo(s, x) {
    for (var i = 0; i < s.ds.length; i++) if (bangNhau(s.ds[i], x)) return true;
    return false;
  }
  function setThem(s, x, dong) {
    kiemKhoaBam(x, 'set', dong);
    if (setCo(s, x)) return;
    if (s.ds.length >= LIST_TOI_DA) throw LoiRuntime(dong, 'Tập hợp (set) nhiều phần tử quá (hơn ' + LIST_TOI_DA + ' phần tử).');
    s.ds.push(x);
  }
  function bangNhau(a, b) {
    if (laDict(a) || laDict(b)) {
      if (!laDict(a) || !laDict(b)) return false;
      if (a.cap.length !== b.cap.length) return false;
      for (var id = 0; id < a.cap.length; id++) {
        var vi = dictTimViTri(b, a.cap[id].k);
        if (vi < 0 || !bangNhau(a.cap[id].v, b.cap[vi].v)) return false;
      }
      return true;
    }
    if (laSet(a) || laSet(b)) {
      if (!laSet(a) || !laSet(b)) return false;
      if (a.ds.length !== b.ds.length) return false;
      for (var is = 0; is < a.ds.length; is++) if (!setCo(b, a.ds[is])) return false;
      return true;
    }
    if (laDay(a) && laDay(b)) {
      if (laTuple(a) !== laTuple(b)) return false;                        // (1, 2) == [1, 2] là False như Python
      var pa = phanTu(a), pb = phanTu(b);
      if (pa.length !== pb.length) return false;
      for (var k = 0; k < pa.length; k++) if (!bangNhau(pa[k], pb[k])) return false;
      return true;
    }
    return a === b;
  }
  /** So thứ tự hai giá trị cùng kiểu (số với số, chuỗi với chuỗi, tuple với tuple theo từng phần tử như Python).
   *  Trả -1 / 0 / 1. Kiểu lệch thì ném lỗi lời Việt (op là dấu đang dùng, để ghi vào lời). */
  function soThuTu(a, b, op, dong) {
    if (laDict(a) || laDict(b) || laSet(a) || laSet(b)) {
      throw LoiRuntime(dong, 'Không so sánh "' + op + '" được ' + tenKieu(a) + ' với ' + tenKieu(b) +
        '. Từ điển và tập hợp chỉ so sánh bằng == hoặc !=.');
    }
    if (laTuple(a) && laTuple(b)) {
      var pa = a.ds, pb = b.ds, n = Math.min(pa.length, pb.length);
      for (var k = 0; k < n; k++) {
        var c = soThuTu(pa[k], pb[k], op, dong);
        if (c !== 0) return c;
      }
      return pa.length < pb.length ? -1 : pa.length > pb.length ? 1 : 0;
    }
    if (laDay(a) || laDay(b)) {
      throw LoiRuntime(dong, 'Không so sánh "' + op + '" được ' + tenKieu(a) + ' với ' + tenKieu(b) +
        (laList(a) || laList(b) ? '. Danh sách chỉ so sánh bằng == hoặc !=; muốn so từng phần tử thì lấy ra bằng a[0], a[1]…'
          : '. Tuple chỉ so thứ tự với tuple; muốn so một phần tử thì lấy ra bằng t[0], t[1].'));
    }
    if (laChuoi(a) !== laChuoi(b)) {
      throw LoiRuntime(dong, 'Không so sánh "' + op + '" được ' + tenKieu(a) + ' với ' + tenKieu(b) +
        ' (Python báo TypeError). Chuỗi chỉ so sánh với chuỗi; còn == và != thì so sánh kiểu nào cũng được.');
    }
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function tenDs(goc) { return goc && goc.loai === 'ten' ? goc.ten : null; }
  /** a[i] / d[k]: lấy phần tử thứ i của danh sách/tuple, hoặc lấy giá trị theo khóa k của từ điển. */
  function layPhanTu(goc, chi, ten, dong) {
    if (laDict(goc)) return dictLay(goc, chi, ten, dong);
    if (laSet(goc)) {
      throw LoiRuntime(dong, 'Tập hợp (set) không có thứ tự nên không lấy phần tử bằng ' + (ten || 's') + '[i] được. Dùng "x in ' + (ten || 's') + '" để kiểm tra, hoặc "for x in ' + (ten || 's') + ':" để duyệt.');
    }
    if (laChuoi(goc)) {
      throw LoiRuntime(dong, 'Game chưa dạy lấy từng chữ của chuỗi bằng s[i]. Muốn đi qua từng chữ thì dùng for c in s:.');
    }
    if (!laDay(goc)) {
      throw LoiRuntime(dong, 'Chỉ lấy được phần tử bằng [ ] từ một danh sách, mà ' + (ten ? '"' + ten + '"' : 'đây') + ' là một số.');
    }
    var nhan = (laTuple(goc) ? 'tuple' : 'danh sách') + (ten ? ' ' + ten : '');
    goc = phanTu(goc);
    if (laList(chi)) throw LoiRuntime(dong, 'Chỉ số phải là một số nguyên, không phải danh sách.');
    if (laChuoi(chi)) throw LoiRuntime(dong, 'Chỉ số của danh sách phải là số nguyên (0, 1, 2…), không phải chuỗi.');
    if (chi !== Math.floor(chi)) throw LoiRuntime(dong, 'Chỉ số phải là số nguyên, mà đây là ' + dangChu(chi) + '.');
    if (goc.length === 0) {
      throw LoiRuntime(dong, 'Chỉ số ' + chi + ' không lấy được gì: ' + nhan + ' đang rỗng (0 phần tử). Đã append gì vào danh sách chưa?');
    }
    if (chi < 0) {
      throw LoiRuntime(dong, 'Chỉ số ' + chi + ' là số âm. Chỉ số đếm từ 0: ' + nhan + ' có ' + goc.length + ' phần tử, chỉ dùng được chỉ số từ 0 đến ' + (goc.length - 1) + '.');
    }
    if (chi >= goc.length) {
      throw LoiRuntime(dong, 'Chỉ số ' + chi + ' nằm ngoài danh sách: ' + nhan + ' có ' + goc.length + ' phần tử nên chỉ dùng được chỉ số từ 0 đến ' + (goc.length - 1) + ' (chỉ số đếm từ 0).');
    }
    return goc[chi];
  }
  /** Phép số học có ít nhất một vế là danh sách: chỉ + giữa hai danh sách (nối) được; còn lại là lỗi như Python. */
  function soHocList(op, x, y, dong) {
    if (laTuple(x) || laTuple(y)) {
      throw LoiRuntime(dong, op === '+' && laTuple(x) && laTuple(y)
        ? 'Game chưa dạy cộng hai tuple. Muốn tính với từng phần tử thì lấy ra bằng t[0], t[1].'
        : 'Không dùng phép "' + op + '" giữa ' + tenKieu(x) + ' và ' + tenKieu(y) + ' được. Lấy từng phần tử của tuple bằng t[0], t[1] rồi mới tính.');
    }
    if (op === '+') {
      if (laList(x) && laList(y)) {
        if (x.length + y.length > LIST_TOI_DA) throw LoiRuntime(dong, 'Danh sách dài quá (hơn ' + LIST_TOI_DA + ' phần tử).');
        return x.concat(y);
      }
      throw LoiRuntime(dong, 'Không cộng được ' + tenKieu(x) + ' với ' + tenKieu(y) + ' (Python báo TypeError). ' +
        'Danh sách chỉ nối được với danh sách; muốn thêm một phần tử vào cuối thì dùng a.append(x).');
    }
    if (op === '*') throw LoiRuntime(dong, 'Game chưa dạy nhân danh sách với số.');
    throw LoiRuntime(dong, 'Không dùng phép "' + op + '" với danh sách được. Danh sách chỉ có + (nối hai danh sách).');
  }

  /* ------------------------------------------------------------- môi trường */

  function MoiTruong(cha) { this.cha = cha || null; this.bien = Object.create(null); }
  MoiTruong.prototype.tim = function (ten) {
    var e = this;
    while (e) { if (ten in e.bien) return e; e = e.cha; }
    return null;
  };
  MoiTruong.prototype.lay = function (ten, dong, laBien) {
    var e = this.tim(ten);
    if (!e) {
      throw LoiRuntime(dong, laBien
        ? 'Chưa có biến tên "' + ten + '": chưa gán giá trị cho nó, hay gõ sai tên (chữ hoa chữ thường cũng khác nhau)?'
        : 'Chưa có biến hay hàm tên "' + ten + '".');
    }
    return e.bien[ten];
  };
  /** Gán thì gán vào phạm vi hiện tại (giống Python: trong hàm là biến cục bộ,
   *  ngoài hàm là biến chung). Đọc thì dò ra ngoài theo chuỗi phạm vi. */
  MoiTruong.prototype.gan = function (ten, gt) { this.bien[ten] = gt; };

  function laHam(v) { return v && typeof v === 'object' && v.__laHam === true; }
  function hamGame(fn) { return { __laHam: true, goi: fn }; }
  function hamNguoiDung(ten, thamSo, than, dong, dongKhoa) {
    return { __laHam: true, ten: ten, thamSo: thamSo, than: than, dong: dong, dongKhoa: dongKhoa };
  }

  /** Lệnh thoát khối */
  function TinHieuReturn(v) { this.v = v; }
  function TinHieuBreak() { }
  function TinHieuContinue() { }

  /** Tên hàm chạy NGAY trong nhân, không nhường quyền ra ngoài. */
  var HAM_NOI_BO = { print: 1 };

  /* --- chuỗi ký tự: kiểu, phép toán, hàm dựng sẵn --- */
  function laChuoi(v) { return typeof v === 'string'; }
  function tenKieu(v) { return Array.isArray(v) ? 'danh sách' : laTuple(v) ? 'tuple' : laDict(v) ? 'từ điển' : laSet(v) ? 'tập hợp' : laChuoi(v) ? 'chuỗi' : 'số'; }
  function bieuDienPt(e) { return laChuoi(e) ? "'" + e + "'" : dangChu(e); }
  function dangChu(v) {
    if (Array.isArray(v)) return '[' + v.map(bieuDienPt).join(', ') + ']';
    if (laTuple(v)) {                                                     // như Python: ('back', 2) · (1,) · ()
      var pt = v.ds.map(bieuDienPt);
      return '(' + pt.join(', ') + (pt.length === 1 ? ',' : '') + ')';
    }
    if (laDict(v)) {
      return '{' + v.cap.map(function (c) { return bieuDienPt(c.k) + ': ' + bieuDienPt(c.v); }).join(', ') + '}';
    }
    if (laSet(v)) {
      if (v.ds.length === 0) return 'set()';
      return '{' + v.ds.map(bieuDienPt).join(', ') + '}';
    }
    return typeof v === 'number' ? String(Math.round(v * 1e6) / 1e6) : String(v);
  }

  /** Phép số học có ít nhất một vế là chuỗi: chỉ + (nối) và * (lặp) được, còn lại là lỗi như Python. */
  function soHocChuoi(op, x, y, dong) {
    if (op === '+') {
      if (laChuoi(x) && laChuoi(y)) return x + y;
      throw LoiRuntime(dong, 'Không cộng được ' + tenKieu(x) + ' với ' + tenKieu(y) + ' (Python báo TypeError). ' +
        'Chuỗi chỉ nối được với chuỗi; muốn nối một số vào chuỗi thì đổi số thành chuỗi trước, ví dụ str(3).');
    }
    if (op === '*') {
      var chu = laChuoi(x) ? x : y, lan = laChuoi(x) ? y : x;
      if (laChuoi(lan)) throw LoiRuntime(dong, 'Không nhân được chuỗi với chuỗi. Chuỗi chỉ nhân với một số nguyên, ví dụ "ab" * 3.');
      if (lan !== Math.floor(lan)) throw LoiRuntime(dong, 'Chuỗi chỉ nhân được với số nguyên, không phải ' + lan + '.');
      if (lan * chu.length > 100000) throw LoiRuntime(dong, 'Chuỗi dài quá (hơn 100000 ký tự).');
      return lan > 0 ? new Array(lan + 1).join(chu) : '';
    }
    throw LoiRuntime(dong, 'Không dùng phép "' + op + '" với chuỗi được. Chuỗi chỉ có + (nối) và * (lặp).');
  }

  /** Hàm dựng sẵn của nhân, có biết dòng để báo lỗi. */
  var HAM_DUNG_SAN = {
    len: function (dong, args) {
      if (args.length !== 1) throw LoiRuntime(dong, 'len() cần đúng 1 đối số, đang có ' + args.length + '.');
      if (laDay(args[0])) return phanTu(args[0]).length;
      if (laDict(args[0])) return args[0].cap.length;
      if (laSet(args[0])) return args[0].ds.length;
      if (!laChuoi(args[0])) throw LoiRuntime(dong, 'len() chỉ đếm được chuỗi hoặc danh sách (hay tuple, từ điển, tập hợp), mà đây là một số.');
      return Array.from(args[0]).length;
    },
    str: function (dong, args) {
      if (args.length !== 1) throw LoiRuntime(dong, 'str() cần đúng 1 đối số, đang có ' + args.length + '.');
      return dangChu(args[0]);
    },
    int: function (dong, args) {
      if (args.length !== 1) throw LoiRuntime(dong, 'int() cần đúng 1 đối số, đang có ' + args.length + '.');
      var a = args[0];
      if (laList(a)) throw LoiRuntime(dong, 'int() không đổi được danh sách thành số.');
      if (laTuple(a)) throw LoiRuntime(dong, 'int() không đổi được tuple thành số. Lấy một phần tử ra bằng t[0], t[1] trước.');
      if (laDict(a)) throw LoiRuntime(dong, 'int() không đổi được từ điển thành số. Lấy giá trị ra bằng d[k] trước.');
      if (laSet(a)) throw LoiRuntime(dong, 'int() không đổi được tập hợp thành số.');
      if (!laChuoi(a)) return Math.trunc(a);
      if (!/^\s*[+-]?\d+\s*$/.test(a)) throw LoiRuntime(dong, 'int() không đổi được "' + a + '" thành số nguyên.');
      return parseInt(a, 10);
    },
    dict: function (dong, args) {
      if (args.length === 0) return new Dict([]);
      if (args.length !== 1) throw LoiRuntime(dong, 'dict() nhận tối đa 1 đối số (hoặc viết {k: v} để tạo từ điển có sẵn mục).');
      var a = args[0];
      if (laDict(a)) return new Dict(a.cap.map(function (c) { return { k: c.k, v: c.v }; }));
      if (laDay(a)) {
        var dMoi = new Dict([]), pt = phanTu(a);
        for (var i = 0; i < pt.length; i++) {
          if (!laDay(pt[i]) || phanTu(pt[i]).length !== 2) {
            throw LoiRuntime(dong, 'dict(ds) cần mỗi phần tử là một cặp (khóa, giá_trị) gồm đúng 2 phần tử.');
          }
          var cap = phanTu(pt[i]);
          dictGan(dMoi, cap[0], cap[1], dong);
        }
        return dMoi;
      }
      throw LoiRuntime(dong, 'dict() không tạo được từ điển từ ' + tenKieu(a) + '. Hãy dùng dict() hoặc {khóa: giá_trị}.');
    },
    set: function (dong, args) {
      if (args.length === 0) return new SetPy([]);
      if (args.length !== 1) {
        throw LoiRuntime(dong, 'set() nhận tối đa 1 đối số (ví dụ set() để tạo tập rỗng, hoặc set(a) từ danh sách). Muốn tạo tập hợp có sẵn nhiều phần tử thì viết {1, 2, 3}.');
      }
      var a = args[0], sMoi = new SetPy([]);
      if (laSet(a)) { a.ds.forEach(function (x) { setThem(sMoi, x, dong); }); return sMoi; }
      if (laDay(a)) { phanTu(a).forEach(function (x) { setThem(sMoi, x, dong); }); return sMoi; }
      if (laChuoi(a)) { Array.from(a).forEach(function (ch) { setThem(sMoi, ch, dong); }); return sMoi; }
      if (laDict(a)) { a.cap.forEach(function (c) { setThem(sMoi, c.k, dong); }); return sMoi; }
      throw LoiRuntime(dong, 'set() chỉ nhận danh sách, tuple, chuỗi hay tập hợp, không nhận ' + tenKieu(a) + '.');
    },
    min: function (dong, args) { return nhoLon('min', dong, args); },
    max: function (dong, args) { return nhoLon('max', dong, args); },
    abs: function (dong, args) {
      if (args.length !== 1) throw LoiRuntime(dong, 'abs() cần đúng 1 đối số, đang có ' + args.length + '.');
      if (typeof args[0] !== 'number') throw LoiRuntime(dong, 'abs() chỉ bỏ dấu được của một số, mà đây là ' + tenKieu(args[0]) + '.');
      return Math.abs(args[0]);
    }
  };
  /** min(a, b, ...) / max(a, b, ...): từ 2 đối số (toàn số, toàn chuỗi hay toàn tuple — tuple so từng phần tử như Python),
   *  hay một danh sách / tuple làm đối số duy nhất (cho mùa Nông trại). Đối số lệch kiểu là lỗi lời Việt. */
  function nhoLon(ten, dong, args) {
    var ds = args;
    if (args.length === 0) throw LoiRuntime(dong, ten + '() cần ít nhất 2 giá trị để so, ví dụ ' + ten + '(a, b).');
    if (args.length === 1) {
      if (!laDay(args[0])) throw LoiRuntime(dong, ten + '() cần ít nhất 2 giá trị để so, ví dụ ' + ten + '(a, b). Một đối số thì phải là danh sách hay tuple.');
      ds = phanTu(args[0]);
      if (!ds.length) throw LoiRuntime(dong, ten + '() không tìm được gì trong một ' + tenKieu(args[0]) + ' rỗng.');
    }
    var tot = ds[0];
    for (var k = 1; k < ds.length; k++) {
      if (laList(ds[k]) || laList(tot)) throw LoiRuntime(dong, ten + '() không so được với một danh sách nằm trong các đối số. Muốn tìm trong danh sách thì viết ' + ten + '(a).');
      var c = soThuTu(ds[k], tot, ten === 'min' ? '<' : '>', dong);
      if (ten === 'min' ? c < 0 : c > 0) tot = ds[k];
    }
    return tot;
  }

  /** Nhân chạy code dạng GENERATOR.
   *  Mỗi lần chương trình gọi một hàm của game thì `yield` ra ngoài một yêu cầu
   *  {ten, thamSo} và nhận kết quả qua `next(kq)`. Nhờ vậy bên ngoài điều khiển
   *  được TỪNG HÀNH ĐỘNG — cần cho trận đấu nhiều robot chạy song song theo tick.
   *  Hàm nội bộ (print) và hàm người chơi tự viết thì chạy thẳng, không nhường. */
  function* chayCodeGen(code, api, tuyChon) {
    tuyChon = tuyChon || {};
    var nganSach = tuyChon.nganSachLenh || 200000;
    var choPhep2D = !!(tuyChon.choPhep2D || tuyChon.luoi2D || (api && api.radar));
    var toks = tachToken(code);
    var cay = phanTich(toks);

    var goc = new MoiTruong(null);
    Object.keys(HAM_DUNG_SAN).forEach(function (k) {
      goc.bien[k] = { __laHam: true, dungSan: HAM_DUNG_SAN[k] };
    });
    Object.keys(api).forEach(function (k) { goc.bien[k] = hamGame(api[k]); });   // hàm game đè hàm dựng sẵn cùng tên

    var ctx = { dem: 0, nganSach: nganSach, ra: [], doSau: 0, ngan: [] };   // ngan = số dòng các lời gọi hàm người chơi đang mở

    function demLenh(dong) {
      ctx.dem++;
      if (ctx.dem > ctx.nganSach) {
        throw LoiLapVoTan(dong, 'Chương trình chạy quá ' + ctx.nganSach + ' lệnh mà chưa xong — có vòng lặp không có đường ra.');
      }
    }

    function* tinh(n, mt) {
      switch (n.loai) {
        case 'so': return n.gt;
        case 'ten': return mt.lay(n.ten, n.dong, true);
        case 'not': return dung(yield* tinh(n.gt, mt)) ? 0 : 1;
        case 'am': {
          var vam = yield* tinh(n.gt, mt);
          if (laList(vam)) throw LoiRuntime(n.dong, 'Dấu - không đặt trước danh sách được.');
          if (laTuple(vam)) throw LoiRuntime(n.dong, 'Dấu - không đặt trước tuple được. Lấy phần tử ra bằng t[0], t[1] rồi mới đổi dấu.');
          if (laDict(vam)) throw LoiRuntime(n.dong, 'Dấu - không đặt trước từ điển được.');
          if (laSet(vam)) throw LoiRuntime(n.dong, 'Dấu - không đặt trước tập hợp được.');
          if (laChuoi(vam)) throw LoiRuntime(n.dong, 'Dấu - không đặt trước chuỗi được.');
          return -vam;
        }
        case 'and': return dung(yield* tinh(n.trai, mt)) ? (yield* tinh(n.phai, mt)) : 0;
        case 'or': return dung(yield* tinh(n.trai, mt)) ? 1 : (yield* tinh(n.phai, mt));
        case 'dsLit': {
          var dsKq = [];
          for (var il = 0; il < n.ds.length; il++) {
            var pt = yield* tinh(n.ds[il], mt);
            if (laList(pt) && !choPhep2D) throw LoiRuntime(n.dong, MSG_LONG);
            if (laTuple(pt)) throw LoiRuntime(n.dong, MSG_LONG_TUPLE);
            if (laDict(pt) || laSet(pt)) throw LoiRuntime(n.dong, 'Game chưa dạy ' + tenKieu(pt) + ' nằm trong danh sách.');
            dsKq.push(pt);
          }
          return dsKq;
        }
        case 'tupleLit': {
          var tKq = [];
          for (var it = 0; it < n.ds.length; it++) {
            var ptT = yield* tinh(n.ds[it], mt);
            if (laDay(ptT) || laDict(ptT) || laSet(ptT)) throw LoiRuntime(n.dong, MSG_LONG_TUPLE);
            tKq.push(ptT);
          }
          return new Tuple(tKq);
        }
        case 'dictLit': {
          var dKq = new Dict([]);
          for (var idc = 0; idc < n.cap.length; idc++) {
            var kDc = yield* tinh(n.cap[idc].khoa, mt);
            var vDc = yield* tinh(n.cap[idc].gt, mt);
            dictGan(dKq, kDc, vDc, n.dong);
          }
          return dKq;
        }
        case 'setLit': {
          var sKq = new SetPy([]);
          for (var isc = 0; isc < n.ds.length; isc++) {
            var ptS = yield* tinh(n.ds[isc], mt);
            setThem(sKq, ptS, n.dong);
          }
          return sKq;
        }
        case 'chiSo': {
          var gocDs = yield* tinh(n.goc, mt), chiDs = yield* tinh(n.chi, mt);
          return layPhanTu(gocDs, chiDs, tenDs(n.goc), n.dong);
        }
        case 'goiPt': {   // a.append(x) hoặc s.add(x)
          var dtPt = yield* tinh(n.doiTuong, mt), tsPt = [];
          for (var ip = 0; ip < n.thamSo.length; ip++) tsPt.push(yield* tinh(n.thamSo[ip], mt));
          if (n.ten === 'add') {
            if (!laSet(dtPt)) {
              throw LoiRuntime(n.dong, '.add() chỉ dùng được với tập hợp (set), mà ' + (tenDs(n.doiTuong) ? '"' + tenDs(n.doiTuong) + '"' : 'đây') + ' là ' + tenKieu(dtPt) +
                (laList(dtPt) ? '. Với danh sách hãy dùng .append(x).' : '.'));
            }
            if (tsPt.length !== 1) throw LoiRuntime(n.dong, 'add() cần đúng 1 đối số, đang có ' + tsPt.length + '.');
            setThem(dtPt, tsPt[0], n.dong);
            return 0;
          }
          if (!laList(dtPt)) {
            throw LoiRuntime(n.dong, '.append() chỉ dùng được với danh sách, mà ' + (tenDs(n.doiTuong) ? '"' + tenDs(n.doiTuong) + '"' : 'đây') + ' là ' + tenKieu(dtPt) +
              (laSet(dtPt) ? '. Với tập hợp (set) hãy dùng .add(x).' : '.'));
          }
          if (tsPt.length !== 1) throw LoiRuntime(n.dong, 'append() cần đúng 1 đối số, đang có ' + tsPt.length + '.');
          if (laList(tsPt[0]) && !choPhep2D) throw LoiRuntime(n.dong, MSG_LONG);
          if (laTuple(tsPt[0])) throw LoiRuntime(n.dong, MSG_LONG_TUPLE);
          if (laDict(tsPt[0]) || laSet(tsPt[0])) throw LoiRuntime(n.dong, 'Game chưa dạy ' + tenKieu(tsPt[0]) + ' nằm trong danh sách.');
          if (dtPt.length >= LIST_TOI_DA) {
            throw LoiRuntime(n.dong, 'Danh sách dài quá (hơn ' + LIST_TOI_DA + ' phần tử) — có vòng lặp nào cứ thêm mãi không?');
          }
          dtPt.push(tsPt[0]);
          return 0;
        }
        case 'soSanh': {
          var a = yield* tinh(n.trai, mt), b = yield* tinh(n.phai, mt);
          if (n.op === '==') return bangNhau(a, b) ? 1 : 0;
          if (n.op === '!=') return !bangNhau(a, b) ? 1 : 0;
          var cmp = soThuTu(a, b, n.op, n.dong);                       // kiểu lệch / danh sách → lỗi lời Việt ở trong
          switch (n.op) {
            case '<': return cmp < 0 ? 1 : 0;
            case '<=': return cmp <= 0 ? 1 : 0;
            case '>': return cmp > 0 ? 1 : 0;
            case '>=': return cmp >= 0 ? 1 : 0;
          }
          break;
        }
        case 'trong': {
          var ta = yield* tinh(n.trai, mt), tb = yield* tinh(n.phai, mt);
          if (laDict(tb)) {
            kiemKhoaBam(ta, 'dict', n.dong);
            return (dictTimViTri(tb, ta) >= 0) !== n.phu ? 1 : 0;
          }
          if (laSet(tb)) {
            kiemKhoaBam(ta, 'set', n.dong);
            return setCo(tb, ta) !== n.phu ? 1 : 0;
          }
          if (laDay(tb)) {                                                 // x in a / x in t: so đúng giá trị (số khác chuỗi)
            if (laList(ta) && laList(tb)) {
              if (!choPhep2D && !tb.some(laList)) throw LoiRuntime(n.dong, MSG_LONG);
              return tb.some(function (el) { return bangNhau(el, ta); }) !== n.phu ? 1 : 0;
            }
            if (laDay(ta)) throw LoiRuntime(n.dong, laTuple(tb) ? MSG_LONG_TUPLE : MSG_LONG);
            return (phanTu(tb).indexOf(ta) >= 0) !== n.phu ? 1 : 0;
          }
          if (!laChuoi(tb) || !laChuoi(ta)) {
            throw LoiRuntime(n.dong, '"' + (n.phu ? 'not in' : 'in') + '" ở đây chỉ kiểm tra được chuỗi nằm trong chuỗi (ví dụ "U" in "UD"), ' +
              'một giá trị nằm trong danh sách / tập hợp (ví dụ 2 in a), hay một khóa trong từ điển (ví dụ k in d).');
          }
          return (tb.indexOf(ta) >= 0) !== n.phu ? 1 : 0;
        }
        case 'soHoc': {
          var x = yield* tinh(n.trai, mt), y = yield* tinh(n.phai, mt);
          if (laDict(x) || laDict(y)) throw LoiRuntime(n.dong, 'Không dùng phép "' + n.op + '" với từ điển được. Muốn thêm hay sửa mục thì viết d[khóa] = giá_trị.');
          if (laSet(x) || laSet(y)) throw LoiRuntime(n.dong, 'Không dùng phép "' + n.op + '" với tập hợp (set) được. Muốn thêm phần tử thì viết s.add(x).');
          if (laDay(x) || laDay(y)) return soHocList(n.op, x, y, n.dong);
          if (laChuoi(x) || laChuoi(y)) return soHocChuoi(n.op, x, y, n.dong);
          switch (n.op) {
            case '+': return x + y;
            case '-': return x - y;
            case '*': return x * y;
            case '/':
              if (y === 0) throw LoiRuntime(n.dong, 'Chia cho 0.');
              return x / y;
            case '//':
              if (y === 0) throw LoiRuntime(n.dong, 'Chia cho 0.');
              return Math.floor(x / y);
            case '%':
              if (y === 0) throw LoiRuntime(n.dong, 'Chia cho 0.');
              var du = x % y;                                                  // phép mod của Python: kết quả cùng dấu với số chia (-5 % 8 = 3, 5 % -8 = -3), khớp với // (Math.floor); mùa Cảng sông dạy (b - a) % 8 với số âm (31/10)
              return du !== 0 && (du < 0) !== (y < 0) ? du + y : du;
          }
          break;
        }
        case 'goi': {
          var f = mt.lay(n.ten, n.dong);
          var args = [];
          for (var ia = 0; ia < n.thamSo.length; ia++) args.push(yield* tinh(n.thamSo[ia], mt));
          if (!laHam(f)) throw LoiRuntime(n.dong, '"' + n.ten + '" không phải là hàm.');
          if (f.dungSan) return f.dungSan(n.dong, args);       // len, str, int
          if (f.than) {   // hàm người chơi tự viết — chạy thẳng trong nhân
            if (args.length !== f.thamSo.length) {
              throw LoiRuntime(n.dong, 'Hàm ' + n.ten + '() cần ' + f.thamSo.length + ' đối số, đang có ' + args.length + '.');
            }
            var mtCon = new MoiTruong(goc);
            f.thamSo.forEach(function (p, idx) { mtCon.bien[p] = args[idx]; });
            ctx.doSau++;
            ctx.ngan.push(n.dong);
            if (ctx.doSau > 200) throw LoiRuntime(n.dong, 'Hàm gọi lồng nhau quá sâu.');
            try {
              yield* thucThiKhoi(f.than, mtCon);
              return 0;
            } catch (e) {
              if (e instanceof TinHieuReturn) return e.v;
              throw e;
            } finally { ctx.doSau--; ctx.ngan.pop(); }
          }
          // hàm nội bộ (print) — không tốn một "lượt" của bên ngoài (danh sách / tuple / dict / set in như Python)
          if (HAM_NOI_BO[n.ten]) return f.goi.apply(null, args.map(function (v) { return (laDay(v) || laDict(v) || laSet(v)) ? dangChu(v) : v; }));
          // hàm của game nhận số hoặc chuỗi, không nhận cả danh sách / tuple / từ điển / tập hợp
          for (var iq = 0; iq < args.length; iq++) {
            if (laList(args[iq])) {
              throw LoiRuntime(n.dong, 'Lệnh ' + n.ten + '() không nhận cả danh sách. Muốn dùng từng phần tử thì lấy ra bằng a[0], a[1]… hay vòng for x in a:.');
            }
            if (laTuple(args[iq])) {
              throw LoiRuntime(n.dong, 'Lệnh ' + n.ten + '() không nhận cả tuple. Muốn dùng một phần tử thì lấy ra bằng t[0], t[1].');
            }
            if (laDict(args[iq])) {
              throw LoiRuntime(n.dong, 'Lệnh ' + n.ten + '() không nhận cả từ điển. Muốn dùng một giá trị thì lấy ra bằng d[khóa].');
            }
            if (laSet(args[iq])) {
              throw LoiRuntime(n.dong, 'Lệnh ' + n.ten + '() không nhận cả tập hợp (set).');
            }
          }
          // hàm của game — nhường quyền ra ngoài để bên ngoài thực hiện
          try {
            var kq = yield { ten: n.ten, thamSo: args, dong: n.dong, ngan: ctx.ngan.slice() };
            // kết quả của hàm game: số hoặc chuỗi (đúng/sai là 1/0, không có gì là 0)
            if (typeof kq === 'boolean') return kq ? 1 : 0;
            if (kq === undefined || kq === null) return 0;
            if (Array.isArray(kq)) {
              if (kq.some(Array.isArray)) return kq;                    // mảng 2 chiều (radar() trả lưới 3x3) → giữ nguyên danh sách 2D
              return new Tuple(kq.slice());                             // hàm game trả mảng 1 chiều JS = tuple cho trẻ (flow() → ("back", 2))
            }
            return kq;
          } catch (e) {
            if (e && e.cuaGame) throw e;
            throw LoiRuntime(n.dong, 'Lỗi khi chạy ' + n.ten + '(): ' + (e && e.message ? e.message : e));
          }
        }
      }
      throw LoiRuntime(n.dong, 'Biểu thức chưa hỗ trợ.');
    }

    function* thucThiKhoi(ds, mt) {
      for (var k = 0; k < ds.length; k++) yield* thucThi(ds[k], mt);
    }

    function* thucThi(n, mt) {
      demLenh(n.dong);
      switch (n.loai) {
        case 'bt': yield* tinh(n.gt, mt); return;
        case 'gan': {
          var gt = yield* tinh(n.gt, mt);
          if (n.op === '=') { mt.gan(n.ten, gt); return; }
          var cu = mt.lay(n.ten, n.dong, true);
          if (laDict(cu) || laDict(gt)) throw LoiRuntime(n.dong, 'Không dùng "' + n.op + '" với từ điển được. Muốn thêm hay sửa mục thì viết d[khóa] = giá_trị.');
          if (laSet(cu) || laSet(gt)) throw LoiRuntime(n.dong, 'Không dùng "' + n.op + '" với tập hợp (set) được. Muốn thêm phần tử thì viết s.add(x).');
          if (laDay(cu) || laDay(gt)) {
            if (n.op === '+=' && laList(cu) && laList(gt)) {                 // a += b: nối thẳng vào danh sách a (như Python)
              if (cu.length + gt.length > LIST_TOI_DA) throw LoiRuntime(n.dong, 'Danh sách dài quá (hơn ' + LIST_TOI_DA + ' phần tử).');
              Array.prototype.push.apply(cu, gt.slice());
              return;
            }
            soHocList(n.op.charAt(0), cu, gt, n.dong);                        // mọi trường hợp còn lại đều báo lỗi
            return;
          }
          if (laChuoi(cu) || laChuoi(gt)) { mt.gan(n.ten, soHocChuoi(n.op.charAt(0), cu, gt, n.dong)); return; }
          if (typeof cu !== 'number') throw LoiRuntime(n.dong, 'Biến "' + n.ten + '" không phải là số.');
          if (n.op === '+=') mt.gan(n.ten, cu + gt);
          else if (n.op === '-=') mt.gan(n.ten, cu - gt);
          else if (n.op === '*=') mt.gan(n.ten, cu * gt);
          else if (n.op === '/=') {
            if (gt === 0) throw LoiRuntime(n.dong, 'Chia cho 0.');
            mt.gan(n.ten, cu / gt);
          }
          return;
        }
        case 'ganChiSo': {                                                // d[k] = v · d[k] += 1 (chỉ từ điển; danh sách / tuple báo lỗi)
          var gocG = yield* tinh(n.goc, mt);
          if (!laDict(gocG)) {
            throw LoiRuntime(n.dong, 'Game chưa dạy gán vào một ô của danh sách hay tuple (a[0] = x). Với danh sách, muốn thêm phần tử thì dùng a.append(x); ' +
              'muốn làm lại cả danh sách thì gán lại: a = [1, 2]. Tuple thì không đổi được từng phần tử, hãy tạo tuple mới: t = (1, 2).');
          }
          var chiG = yield* tinh(n.chi, mt);
          var gtG = yield* tinh(n.gt, mt);
          if (n.op === '=') { dictGan(gocG, chiG, gtG, n.dong); return; }
          var cuG = dictLay(gocG, chiG, tenDs(n.goc), n.dong);
          if (laDay(cuG) || laDay(gtG)) {
            if (n.op === '+=' && laList(cuG) && laList(gtG)) {
              if (cuG.length + gtG.length > LIST_TOI_DA) throw LoiRuntime(n.dong, 'Danh sách dài quá (hơn ' + LIST_TOI_DA + ' phần tử).');
              Array.prototype.push.apply(cuG, gtG.slice());
              return;
            }
            soHocList(n.op.charAt(0), cuG, gtG, n.dong);
            return;
          }
          if (laChuoi(cuG) || laChuoi(gtG)) { dictGan(gocG, chiG, soHocChuoi(n.op.charAt(0), cuG, gtG, n.dong), n.dong); return; }
          if (typeof cuG !== 'number' || typeof gtG !== 'number') throw LoiRuntime(n.dong, 'Chỉ cộng/trừ/nhân/chia được khi mục trong từ điển là số.');
          if (n.op === '+=') dictGan(gocG, chiG, cuG + gtG, n.dong);
          else if (n.op === '-=') dictGan(gocG, chiG, cuG - gtG, n.dong);
          else if (n.op === '*=') dictGan(gocG, chiG, cuG * gtG, n.dong);
          else if (n.op === '/=') {
            if (gtG === 0) throw LoiRuntime(n.dong, 'Chia cho 0.');
            dictGan(gocG, chiG, cuG / gtG, n.dong);
          }
          return;
        }
        case 'ganNhieu': {                                                // h, s = flow() · a, b = b, a
          var gtN = yield* tinh(n.gt, mt);
          if (!laDay(gtN)) {
            throw LoiRuntime(n.dong, 'Cần ' + n.tens.length + ' giá trị để gán cho ' + n.tens.join(', ') + ', mà vế phải chỉ là một ' + tenKieu(gtN) +
              '. Gỡ cặp chỉ dùng được với tuple (hay danh sách), ví dụ h, s = flow().');
          }
          var ptN = phanTu(gtN);
          if (ptN.length !== n.tens.length) {
            throw LoiRuntime(n.dong, 'Cần ' + n.tens.length + ' giá trị để gán cho ' + n.tens.join(', ') + ', mà vế phải có ' + ptN.length +
              ' phần tử (' + dangChu(gtN) + '). Số tên bên trái phải bằng số phần tử bên phải.');
          }
          for (var ig = 0; ig < n.tens.length; ig++) mt.gan(n.tens[ig], ptN[ig]);
          return;
        }
        case 'pass': return;
        case 'def': mt.bien[n.ten] = hamNguoiDung(n.ten, n.thamSo, n.than, n.dong); return;
        case 'return': throw new TinHieuReturn(n.gt ? (yield* tinh(n.gt, mt)) : 0);
        case 'break': throw new TinHieuBreak();
        case 'continue': throw new TinHieuContinue();
        case 'if': {
          for (var q = 0; q < n.nhanh.length; q++) {
            if (dung(yield* tinh(n.nhanh[q].dk, mt))) { yield* thucThiKhoi(n.nhanh[q].than, mt); return; }
          }
          if (n.traiLai) yield* thucThiKhoi(n.traiLai, mt);
          return;
        }
        case 'while': {
          while (dung(yield* tinh(n.dk, mt))) {
            try { yield* thucThiKhoi(n.than, mt); }
            catch (e) {
              if (e instanceof TinHieuBreak) break;
              if (e instanceof TinHieuContinue) continue;
              throw e;
            }
          }
          return;
        }
        case 'for': {
          if (n.duyet) {   // for c in <chuỗi>: lặp từng ký tự · for x in <danh sách/tuple/từ điển/tập hợp>: lặp từng phần tử / khóa
            var chuoiLap = yield* tinh(n.duyet, mt);
            if (laTuple(chuoiLap)) chuoiLap = chuoiLap.ds;                 // for x in t: duyệt tuple như danh sách
            else if (laDict(chuoiLap)) chuoiLap = chuoiLap.cap.map(function (c) { return c.k; });   // for k in d: duyệt các khóa theo thứ tự thêm
            else if (laSet(chuoiLap)) chuoiLap = chuoiLap.ds.slice();      // for x in s: duyệt các phần tử trong tập hợp
            if (laList(chuoiLap)) {
              for (var idl = 0; idl < chuoiLap.length; idl++) {                 // theo vị trí, đọc độ dài mỗi vòng: phần tử thêm lúc đang duyệt cũng được duyệt (như Python)
                mt.gan(n.bien, chuoiLap[idl]);
                try { yield* thucThiKhoi(n.than, mt); }
                catch (e) {
                  if (e instanceof TinHieuBreak) break;
                  if (e instanceof TinHieuContinue) continue;
                  throw e;
                }
              }
              return;
            }
            if (!laChuoi(chuoiLap)) {
              throw LoiRuntime(n.dong, 'Chỗ sau "in" là một số nên không lặp qua được. Hãy dùng range(...) để đếm, một chuỗi để lặp từng ký tự, hay một danh sách / từ điển / tập hợp để lặp.');
            }
            var kyTu = Array.from(chuoiLap);
            for (var ik = 0; ik < kyTu.length; ik++) {
              mt.gan(n.bien, kyTu[ik]);
              try { yield* thucThiKhoi(n.than, mt); }
              catch (e) {
                if (e instanceof TinHieuBreak) break;
                if (e instanceof TinHieuContinue) continue;
                throw e;
              }
            }
            return;
          }
          var so = [];
          for (var it = 0; it < n.thamSo.length; it++) so.push(yield* tinh(n.thamSo[it], mt));
          if (so.some(laList)) throw LoiRuntime(n.dong, 'range() cần đối số là số, mà đây là một danh sách. Muốn đi qua từng phần tử của danh sách thì viết for x in a:, hay range(len(a)) để đếm số phần tử.');
          if (so.some(function (v) { return typeof v !== 'number'; })) throw LoiRuntime(n.dong, 'range() cần đối số là số.');
          var bat, ket, buoc;
          if (so.length === 1) { bat = 0; ket = so[0]; buoc = 1; }
          else if (so.length === 2) { bat = so[0]; ket = so[1]; buoc = 1; }
          else if (so.length === 3) { bat = so[0]; ket = so[1]; buoc = so[2]; }
          else throw LoiRuntime(n.dong, 'range() nhận 1, 2 hoặc 3 đối số.');
          if (buoc === 0) throw LoiRuntime(n.dong, 'Bước nhảy của range() không được bằng 0.');
          var soVong = Math.ceil((ket - bat) / buoc);
          if (soVong > 100000) throw LoiRuntime(n.dong, 'range() quá lớn.');
          for (var v = bat; (buoc > 0 ? v < ket : v > ket); v += buoc) {
            mt.gan(n.bien, v);
            try { yield* thucThiKhoi(n.than, mt); }
            catch (e) {
              if (e instanceof TinHieuBreak) break;
              if (e instanceof TinHieuContinue) continue;
              throw e;
            }
          }
          return;
        }
      }
      throw LoiRuntime(n.dong, 'Câu lệnh chưa hỗ trợ.');
    }

    yield* thucThiKhoi(cay, goc);
    return { ra: ctx.ra, soLenh: ctx.dem };
  }

  /** Bản chạy thẳng (đồng bộ) của nhân trên — giữ nguyên cách dùng cũ:
   *  tự rút generator tới hết, tự gọi hàm của game khi nhân nhường quyền. */
  function chayCode(code, api, tuyChon) {
    var g = chayCodeGen(code, api, tuyChon);
    var r = g.next();
    while (!r.done) {
      var kq;
      try { kq = api[r.value.ten].apply(null, r.value.thamSo); }
      catch (e) { r = g.throw(e); continue; }
      r = g.next(kq);
    }
    return r.value;
  }

  /* ==========================================================================
     CHẠY MỘT CHƯƠNG TRÌNH TRÊN MỘT SÂN
     ========================================================================== */

  function chayTrenSan(bai, rows, code, tuyChon) {
    tuyChon = tuyChon || {};
    var san = docSan(rows);
    var st = {
      x: san.batDau.x, y: san.batDau.y, huong: san.batDau.huong,
      tick: 0, vaTuong: 0, nhatHong: 0, bag: [], ra: []
    };
    var gioiHan = bai.gioiHanTick || 60;
    var khung = [];
    var suKien = [];       // các mốc đáng chú ý để chẩn đoán: {tick, ma, x, y}

    function chup(ma) {
      khung.push({
        x: st.x, y: st.y, huong: st.huong, tick: st.tick,
        vaTuong: st.vaTuong, soVat: st.bag.length, ma: ma || null,
        daNhat: san.dsVat.map(function (v) { return v.daNhat; })
      });
    }
    function tangTick() {
      st.tick++;
      if (st.tick > gioiHan) {
        throw LoiHetGio(0, 'Hết ' + gioiHan + ' tick mà robot chưa xong việc. Nếu trong code có vòng lặp, kiểm tra xem nó có đường ra không.');
      }
    }
    function ketThucRoi() {
      var conVat = san.dsVat.some(function (v) { return !v.daNhat; });
      return !conVat && st.x === san.dich.x && st.y === san.dich.y;
    }

    var api = {
      move: function (n) {
        var soBuoc = (n === undefined) ? 1 : Math.floor(n);
        if (!(soBuoc >= 0)) throw LoiRuntime(0, 'move() cần số bước là số không âm.');
        for (var k = 0; k < soBuoc; k++) {
          var v = VEC_TOA[st.huong];
          var nx = st.x + v[0], ny = st.y + v[1];
          if (oTuong(san, nx, ny)) {
            st.vaTuong++;
            suKien.push({ tick: st.tick, ma: 'hit-wall', x: st.x, y: st.y });
            tangTick(); chup('hit-wall');   // vẫn tốn thời gian, không trừ điểm
          } else {
            st.x = nx; st.y = ny;
            tangTick(); chup('move');
          }
        }
        return 0;
      },
      turn_left: function () { st.huong = TRAI[st.huong]; tangTick(); chup('turn'); return 0; },
      turn_right: function () { st.huong = PHAI[st.huong]; tangTick(); chup('turn'); return 0; },
      pick: function () {
        var vat = null;
        for (var k = 0; k < san.dsVat.length; k++) {
          var v = san.dsVat[k];
          if (!v.daNhat && v.x === st.x && v.y === st.y) { vat = v; break; }
        }
        if (vat) { vat.daNhat = true; st.bag.push({ x: st.x, y: st.y }); }
        else { st.nhatHong++; }
        tangTick(); chup(vat ? 'pick' : 'pick-miss');
        return 0;
      },
      at_goal: function () { return (st.x === san.dich.x && st.y === san.dich.y) ? 1 : 0; },
      item_here: function () {
        for (var k = 0; k < san.dsVat.length; k++) {
          var v = san.dsVat[k];
          if (!v.daNhat && v.x === st.x && v.y === st.y) return 1;
        }
        return 0;
      },
      all_items_taken: function () {
        return san.dsVat.every(function (v) { return v.daNhat; }) ? 1 : 0;
      },
      front_is_wall: function () {
        var v = VEC_TOA[st.huong];
        return oTuong(san, st.x + v[0], st.y + v[1]) ? 1 : 0;
      },
      steps: function () { return st.tick; },
      wait: function () { tangTick(); chup('wait'); return 0; },
      bag_count: function () { return st.bag.length; },
      print: function () {
        var phan = [];
        for (var k = 0; k < arguments.length; k++) {
          var a = arguments[k];
          phan.push(typeof a === 'number' ? (Math.round(a * 1e6) / 1e6) : String(a));
        }
        st.ra.push(phan.join(' '));
        return 0;
      }
    };

    chup(null);   // khung 0: trạng thái xuất phát

    // KHAY THEO BÀI: chỉ đưa ra những hàm bài này đã mở
    var apiDay = { print: api.print };
    (bai.khay || Object.keys(api)).forEach(function (k) {
      if (api[k] && k !== 'print') apiDay[k] = api[k];
    });

    var ketQua = {
      ok: false, tick: 0, vaTuong: 0, nhatHong: 0, khung: khung,
      chanDoan: [], loi: null, ra: [], suKien: suKien
    };

    try {
      chayCode(code, apiDay, { nganSachLenh: tuyChon.nganSachLenh });
    } catch (e) {
      if (e && e.cuaGame) {
        ketQua.loi = { loai: e.loai, dong: e.dong, thongDiep: e.thongDiep };
        ketQua.chanDoan.push(e.loai);
      } else {
        throw e;
      }
    }

    // Gọi hàm có thật nhưng bài này chưa mở → nói rõ là chưa mở, đừng để thành "lỗi lạ"
    if (ketQua.loi && ketQua.loi.loai === 'runtime-error') {
      var mTen = /tên "([^"]+)"/.exec(ketQua.loi.thongDiep || '');
      if (mTen && api[mTen[1]] && mTen[1] !== 'print' &&
          (bai.khay || []).indexOf(mTen[1]) < 0) {
        ketQua.loi.loai = 'locked-command';
        ketQua.loi.thongDiep = 'Bài này chưa mở "' + mTen[1] + '()". Khay lệnh đang có: ' +
          (bai.khay || []).map(function (k) { return k + '()'; }).join(', ') + '.';
        ketQua.chanDoan = ['locked-command'];
      }
    }

    if (!ketQua.loi) {
      if (ketThucRoi()) ketQua.ok = true;
      else {
        var conVat = san.dsVat.some(function (v) { return !v.daNhat; });
        var trenDich = (st.x === san.dich.x && st.y === san.dich.y);
        ketQua.chanDoan.push((trenDich && conVat) ? 'missed-item' : 'unfinished');
      }
    } else if (ketQua.loi.loai === 'timeout') {
      var td = (st.x === san.dich.x && st.y === san.dich.y);
      var cv = san.dsVat.some(function (v) { return !v.daNhat; });
      if (td && cv) ketQua.chanDoan.push('missed-item');
      else ketQua.chanDoan.push('unfinished');
    }

    if (st.vaTuong > 0) ketQua.chanDoan.push('hit-wall');
    if (st.nhatHong > 0) ketQua.chanDoan.push('pick-miss');

    ketQua.tick = st.tick;
    ketQua.vaTuong = st.vaTuong;
    ketQua.nhatHong = st.nhatHong;
    ketQua.ra = st.ra;
    ketQua.san = { rong: san.rong, cao: san.cao, o: san.o, dich: san.dich, dsVat: san.dsVat };
    return ketQua;
  }

  /* ------------------------------------------------ chấm hạng của một bài */

  /** Qua sân chính = đi tiếp. Hạng:
   *   C = qua sân chính nhưng có va tường / nhặt hụt
   *   B = qua sân chính sạch
   *   A = qua TOÀN BỘ sân ẩn, sạch                                     */
  function chamBai(bai, code, tuyChon) {
    var chinh = chayTrenSan(bai, bai.san, code, tuyChon);
    var an = (bai.sanAn || []).map(function (s) { return chayTrenSan(bai, s, code, tuyChon); });

    var hang = null;
    if (chinh.ok) hang = (chinh.vaTuong === 0 && chinh.nhatHong === 0) ? 'B' : 'C';
    var quaHetSanAn = an.length > 0 && an.every(function (r) { return r.ok && r.vaTuong === 0 && r.nhatHong === 0; });
    if (hang === 'B' && quaHetSanAn) hang = 'A';

    var chanDoan = [];
    function them(ds) { ds.forEach(function (m) { if (chanDoan.indexOf(m) < 0) chanDoan.push(m); }); }
    them(chinh.chanDoan);
    an.forEach(function (r) { them(r.chanDoan); });

    return { hang: hang, chinh: chinh, sanAn: an, chanDoan: chanDoan };
  }

  /* ==========================================================================
     5 BÀI CỦA CHẶNG 1 — lệnh tuần tự, đi theo đường tương đối
     + 1 PHÒNG THÍ NGHIỆM (bài 6) — cố tình không giải được bằng thẻ
     ========================================================================== */

  /** Hành lang dài `n` bước: robot ở đầu, đích ở cuối, hai bên là tường. */
  function hanhLang(n) {
    var w = n + 1, tren = '', giua = '>';
    for (var i = 0; i < w; i++) tren += '#';
    for (var j = 1; j < n; j++) giua += '.';
    giua += 'D';
    return [tren, giua, tren];
  }

  var BAI = [
    {
      id: 'b1', so: 1, ten: 'Đường thẳng',
      mucTieu: 'Đưa robot tới ô đích.',
      goiY: ['Robot đi theo hướng nó đang quay.', 'Ở bài này chưa cần quay.'],
      gioiHanTick: 30,
      san: [
        '.....',
        '.....',
        '>...D',
        '.....',
        '.....'
      ],
      sanAn: [
        dichSan(['.....', '.....', '>...D', '.....', '.....'], 2, 1, 8, 7),
        dichSan(['.....', '.....', '>...D', '.....', '.....'], 1, 2, 8, 7)
      ],
      loiGiai: 'move(4)'
    },
    {
      id: 'b2', so: 2, ten: 'Nhặt rồi về',
      mucTieu: 'Nhặt vật rồi đưa robot về ô đích.',
      goiY: ['Phải nhặt HẾT vật thì về đích mới tính.', 'Đứng đúng ô có vật rồi mới pick().'],
      gioiHanTick: 40,
      san: [
        'D....',
        '.....',
        'o....',
        '.....',
        '^....'
      ],
      sanAn: [
        dichSan(['D....', '.....', 'o....', '.....', '^....'], 2, 0, 8, 5),
        dichSan(['D....', '.....', 'o....', '.....', '^....'], 1, 1, 7, 7)
      ],
      loiGiai: 'move(2)\npick()\nmove(2)'
    },
    {
      id: 'b3', so: 3, ten: 'Hai góc',
      mucTieu: 'Nhặt vật ở giữa đường rồi tới ô đích.',
      goiY: ['Đi hết một đoạn rồi mới quay, đừng quay sớm.', 'turn_left() và turn_right() là quay tại chỗ.'],
      gioiHanTick: 60,
      san: [
        '.......',
        '...#...',
        '.....D#',
        '.......',
        '.o.....',
        '..#....',
        '.^#....'
      ],
      sanAn: [
        dichSan(['.......', '...#...', '.....D#', '.......', '.o.....', '..#....', '.^#....'], 1, 0, 9, 7),
        dichSan(['.......', '...#...', '.....D#', '.......', '.o.....', '..#....', '.^#....'], 0, 1, 7, 9)
      ],
      loiGiai: 'move(2)\npick()\nmove(2)\nturn_right()\nmove(4)'
    },
    {
      id: 'b4', so: 4, ten: 'Hai vật, hai hướng',
      mucTieu: 'Nhặt cả hai vật rồi về đích. Thứ tự nào cũng được — miễn là không đâm vào đâu.',
      goiY: ['Đi đúng số bước rồi hãy quay; đi thừa là húc tường.', 'Nhặt vật thứ hai xong mới rẽ về đích.'],
      gioiHanTick: 70,
      san: [
        '...D....',
        '.#......',
        '........',
        '.#......',
        'o..o....',
        '.#......',
        '........',
        '^.#.....'
      ],
      sanAn: [
        dichSan(['...D....', '.#......', '........', '.#......', 'o..o....', '.#......', '........', '^.#.....'], 1, 0, 10, 8),
        dichSan(['...D....', '.#......', '........', '.#......', 'o..o....', '.#......', '........', '^.#.....'], 0, 1, 8, 9)
      ],
      loiGiai: 'move(3)\npick()\nturn_right()\nmove(3)\npick()\nturn_left()\nmove(4)'
    },
    {
      id: 'b5', so: 5, ten: 'Vật sau vật cản',
      mucTieu: 'Đường thẳng bị chặn. Đi vòng qua rồi nhặt vật, sau đó về đích.',
      goiY: ['Đi hết 3 bước thì dừng lại — trước mặt là tường.', 'Vòng qua bên trên, rồi mới xuống.'],
      gioiHanTick: 80,
      san: [
        '.........',
        '.........',
        '....#....',
        '....#....',
        '>...#.o.D',
        '....#....',
        '.........',
        '.........',
        '.........'
      ],
      sanAn: [
        dichSan(['.........', '.........', '....#....', '....#....', '>...#.o.D', '....#....', '.........', '.........', '.........'], 1, 0, 11, 9),
        dichSan(['.........', '.........', '....#....', '....#....', '>...#.o.D', '....#....', '.........', '.........', '.........'], 0, 1, 9, 10)
      ],
      loiGiai: 'move(3)\nturn_left()\nmove(3)\nturn_right()\nmove(3)\nturn_right()\nmove(3)\npick()\nturn_left()\nmove(2)'
    },
    {
      id: 'c2b1', so: 6, chang: 2, ten: 'Hành lang lạ', theMoi: 'while',
      mucTieu: 'Đưa robot tới cuối hành lang. Chú ý: hành lang ở sân chính và hai sân ẩn KHÔNG dài bằng nhau — 7 bước, 3 bước và 10 bước.',
      goiY: [
        'Đội vừa có một thẻ mới trên khay: while not at_goal():  — thẻ này có THÂN. Bấm thẻ để thêm, rồi bấm vào khe thân của nó và thêm move(1) vào trong.',
        'Đừng đếm bước. Đọc thẻ thành lời: "lặp lại chừng nào robot CHƯA tới đích".',
        'Một con số cố định chỉ đúng với một hành lang. Thẻ while đúng với cả ba — chạy thử là biết.'
      ],
      gioiHanTick: 25,
      // Khay hẹp có chủ ý: hành lang thẳng thì chỉ cần move + at_goal.
      // Nhiễu (turn_left, pick…) không cần thiết nên không đưa ra.
      khay: ['move', 'wait', 'at_goal'],
      khoi: ['lenh', 'while'],
      san: hanhLang(7),
      sanAn: [hanhLang(3), hanhLang(10)],
      loiGiai: 'while not at_goal():\n    move()'
    }
  ];

  /** Khay lệnh (toolbox) của chặng 1: chỉ lệnh tuần tự. */
  var LENH_CHANG_1 = ['move', 'turn_left', 'turn_right', 'pick', 'wait'];

  /** LUẬT KHAY THEO BÀI — chống lỗi "bài cần thứ chưa dạy".
   *  Mỗi bài khai báo nó mở những lệnh nào; nhân mô phỏng CHỈ đưa ra bấy nhiêu
   *  hàm, nên gọi thứ chưa mở sẽ ra chẩn đoán `locked-command` chứ không phải
   *  một bài không thể giải (GDD v0.2 §7.5).
   *  Chặng 1: 5 lệnh tuần tự. Chặng 2: thêm at_goal() — đi cùng thẻ while. */
  BAI.forEach(function (b) {
    if (!b.chang) b.chang = 1;
    if (!b.khay) {
      b.khay = b.chang === 1
        ? LENH_CHANG_1.slice()
        : LENH_CHANG_1.concat(['at_goal', 'front_is_wall', 'steps']);
    }
    if (!b.khoi) b.khoi = b.chang === 1 ? ['lenh'] : ['lenh', 'while'];
  });

  /* ------------------------------------------------------------------ API ra */

  var API = {
    VEC_TOA: VEC_TOA, TEN_HUONG: TEN_HUONG, TRAI: TRAI, PHAI: PHAI,
    docSan: docSan, dichSan: dichSan,
    chayCode: chayCode, chayCodeGen: chayCodeGen, chayTrenSan: chayTrenSan, chamBai: chamBai,
    taoTuple: taoTuple, laTuple: laTuple, taoDict: taoDict, laDict: laDict, taoSet: taoSet, laSet: laSet, dangChu: dangChu,
    BAI: BAI
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.RobotCore = API;
})();
