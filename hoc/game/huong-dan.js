/* ============================================================================
   huong-dan.js — "Đường học": KHUNG HƯỚNG DẪN dùng lại (window.HuongDan).

   Một CHUỖI hướng dẫn gồm các BƯỚC. Mỗi bước LÀM SÁNG nút / khối / dòng người chơi phải chạm (viền vàng nhấp nháy quanh đích)
   và hiện một bong bóng ngắn có mũi tên chỉ vào đích. Bước xong thì chuyển sang bước kế; hết chuỗi thì lưu cờ "đã xem" (Luu) để không hiện lại.
   Bong bóng và viền không chặn bấm (pointer-events: none). Chúng tự ẩn khi đích không thấy được (khay bị bong bóng đề bài đè lên, màn khác, Xưởng đang mở…),
   hoặc khi có bong bóng đề bài / chẩn đoán (.bong) hay hộp thoại đang mở, hay khi đang nhấn giữ kéo một khối; hết cản thì hiện lại.
   Nhiều chuỗi cùng chạy thì chỉ chuỗi chạy SAU CÙNG (đang thấy đích) hiện; các chuỗi cũ tạm ẩn, không đếm hạn, tới lượt thì hiện lại.

   ── CÁCH DÙNG ────────────────────────────────────────────────────────────────────────────────
   1) Chạy một chuỗi từ mã:
        HuongDan.chay({
          id:   'xoa-dong',                 // tên chuỗi (duy nhất): chạy lại cùng id khi đang chạy thì không làm gì
          co:   'meo-xoa',                  // cờ "đã xem" trong Luu.daXem / Luu.datDaXem (bỏ qua nếu chưa nạp Luu); đã xem rồi thì chay() trả về null
          luuKhi: 'xong' | 'bat-dau',       // lưu cờ khi chuỗi XONG (mặc định: chưa xong thì lần sau hiện lại) hay ngay khi BẮT ĐẦU (mẹo chỉ hiện một lần)
          buoc: [ { dich, chu, xong, huong?, han?, neo?, rong?, xuong?, khongAn?, phu?, daLam? }, … ],
          khiXong: function () {}           // (tùy chọn) gọi khi chuỗi xong
        });
   2) Khai trong dữ liệu màn:  man.huongDan = [ bước, … ]   hoặc   { co: 'tên cờ', luuKhi, buoc: [ … ] }.
      Màn không tự khai thì lấy từ tệp game/huong-dan-man.js: window.HuongDanMan['ma-man'] (cùng dạng; dữ liệu hướng dẫn nằm riêng, không đụng tệp màn).
      Màn chơi gọi HuongDan.vaoMan(man) mỗi khi vào màn (cờ mặc định 'hd:' + man.ma, nên mỗi màn một lần); rời màn thì HuongDan.dung().
      Thắng màn thì HuongDan.xongMan(man): dừng và lưu cờ (đã thắng thì không cần hướng dẫn lại).
   3) Mã game báo sự kiện cho các điều kiện "xong" bằng  HuongDan.bao('ten-su-kien', chiTiet).
      Sự kiện đang được báo: 'chen-khoi' (chèn một dòng vào chương trình; chiTiet.dong từ 0) · 'chon-dong' (chạm một dòng có code; hiện ✕ trên cảm ứng) · 'cam-nhip' (chèn bị từ chối: bộ phận đã có lệnh trong nhịp) · 'xoa-dong' ·
      'hoan-tac' · 'doi-cho' (kéo một dòng sang chỗ khác) · 'doi-bac' (thụt vào / thụt ra một dòng) · 'doi-so' (đổi số trong range(n) / lời gọi hàm) ·
      'doi-the' (người chơi bấm ◀ ▶ đổi thẻ khay) · 'doi-xe' (màn nhiều robot: chạm thẻ R1 / R2 ở khung code) · 'chay' (bấm Chạy / Nhịp) · 'xem-san' (chạm ảnh nhỏ của một sân) · 'mo-xuong' (mở Xưởng hàm) ·
      'tao-ham' (bấm "Tạo hàm" ở hộp đặt tên) · 'thu' (bấm Thử trong Xưởng) · 'dong-xuong' (bấm Về sân). Thêm sự kiện mới: chỉ cần gọi HuongDan.bao ở chỗ đó.

   ── MỘT BƯỚC ─────────────────────────────────────────────────────────────────────────────────
     dich   Đích được làm sáng (một hay nhiều):
              'nut:chay'            nút có data-nut="chay" (chỉ lấy nút THẤY được; Xưởng mở thì chỉ nút trong Xưởng, đóng thì chỉ nút ngoài Xưởng; khối ở khay cuộn khuất thì coi là không thấy)
              'khoi:move'           khối ở khay theo tên (data-ten); 'khoi:em:move' / 'khoi:goc:wait' / 'khoi:man:go_out' chỉ rõ loại khối
              'dong:3'              dòng thứ 3 (đếm từ 1) của chương trình chính;  'x:3'  ô số / nút ✕ của dòng đó
              'so:3'  'so:3:2'      con số chạm được (range(n), đối số) của dòng 3; số thứ hai của dòng đó
              (Xưởng mở: 'dong:' / 'x:' / 'so:' / 'khoi:' / 'nut:' tìm trong Xưởng; Xưởng đóng: chỉ tìm ngoài Xưởng)
              '.lop' '#id' '[thuoc]' bộ chọn CSS (phần tử thấy được đầu tiên trong màn)
              function () {…}       trả về phần tử, mảng phần tử hoặc chuỗi như trên (tính lại mỗi nhịp: khay vẽ lại, dòng dịch chỗ…)
              phần tử DOM / mảng    dùng thẳng
              mảng chuỗi ['nut:a', 'nut:b']   nhiều đích cùng sáng
     chu    Lời bong bóng, ngắn (lớp 5). Chuỗi, hoặc function () → chuỗi (đổi theo trạng thái).
     xong   Khi nào qua bước:
              'bam'                 người chơi bấm vào đích (hay bên trong đích)
              'ten-su-kien'         mã game gọi HuongDan.bao('ten-su-kien')
              { su: 'ten', khi: function (chiTiet) { return … } }   sự kiện kèm điều kiện
              function (su, chiTiet) {…} → true      điều kiện tự viết (được gọi với mọi sự kiện)
              [ … ]                 mảng, đạt một cái là xong
     huong  'duoi' (bong bóng dưới đích, mũi lên) | 'tren' | 'auto' (mặc định: đích ở nửa trên màn thì bong bóng xuống dưới, ngược lại thì lên trên); hoặc function () → một trong ba giá trị đó
     han    Số ms đích ĐƯỢC THẤY mà chưa xong thì tự qua bước (mẹo không bắt buộc, không để chờ mãi)
     neo    Đích mà mũi tên chỉ vào khi có nhiều đích: phần tử hoặc function → phần tử (mặc định: khung bao quanh mọi đích, bong bóng nằm trên / dưới cả khung)
     rong   Bề rộng bong bóng (px khung 360, mặc định 150)
     xuong  true: bước hiện cả khi Xưởng hàm đang mở (mặc định ẩn khi Xưởng mở, vì Xưởng phủ lên màn chơi)
     khongAn true: không ẩn khi có bong bóng đề bài / chẩn đoán đang mở
     phu    true: đích nằm TRÊN hộp thoại / bảng chọn số (nút "Tạo hàm", bảng 1–9): viền và bong bóng vẽ ở #stage, nổi cao hơn hộp; tìm đích trong cả #stage; không ẩn khi hộp đang mở
     daLam  function () → true: việc của bước này ĐÃ làm xong theo cách khác (hàm đã có, Xưởng đã mở…): bước tự qua (kiểm khi vào bước và mỗi nhịp đồng hồ)

   Kiểm trong Node: huong-dan.js chạy với "document" giả (không có màn thì chỉ chạy logic chuỗi / sự kiện / cờ, không vẽ);
   HuongDan.nhip() chạy một lượt "đồng hồ" (vẽ lại + đếm hạn) mà không cần setInterval. Máy kiểm: kiem-khay.mjs (khung) · kiem-huong-dan.mjs (dữ liệu từng màn).
   ========================================================================== */
(function () {
  'use strict';

  var CHUOI = [];                 // các chuỗi đang chạy: { id, co, luuKhi, buoc, i, thay, vien[], bong, tay }
  var dongHo = null, daGanBam = false;
  var NHIP_MS = 200;

  /* ------------------------------------------------------------- cờ "đã xem" */
  function daXem(co) { try { return !!(co && window.Luu && Luu.daXem(co)); } catch (e) { return false; } }
  function datXem(co) { try { if (co && window.Luu) Luu.datDaXem(co); } catch (e) { /* chạy không lưu */ } }

  /* --------------------------------------------------------------- tìm đích */
  function khungHien() {
    try { return document.querySelector('.screen:not(.hidden)') || null; } catch (e) { return null; }
  }
  function thay(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return false;
    try { if (window.getComputedStyle && getComputedStyle(el).visibility === 'hidden') return false; } catch (e) { /* coi là thấy */ }
    var ov = el.closest ? el.closest('.ws-ov') : null;                // phần tử trong Xưởng khi Xưởng đang đóng (chờ ngoài màn): không thấy
    if (ov && ov.classList && !ov.classList.contains('open')) return false;
    var pal = el.closest ? el.closest('.pal') : null;                 // khối ở khay đã cuộn khuất khỏi khung khay: coi là không thấy (khỏi vẽ viền đè lên chỗ khác); cuộn khay tới thì hiện
    if (pal && pal.getBoundingClientRect) { var rp = pal.getBoundingClientRect(); if (r.bottom > rp.bottom + 3 || r.top < rp.top - 3) return false; }
    return true;
  }
  function xuongMo(goc) { return !!(goc && goc.querySelector && goc.querySelector('.ws-ov.open')); }
  function trongXuong(el) { return !!(el && el.closest && el.closest('.ws-ov')); }
  /** Nằm trên cùng (hộp thoại #lop-hop, bảng chọn số / chữ): không thuộc màn chơi hay Xưởng, luôn tính là "thấy". */
  function trenCung(el) { return !!(el && el.closest && el.closest('#lop-hop, .chon-so')); }
  /** #stage (chứa màn, hộp thoại, bảng chọn số) hoặc null (Node / chưa có). */
  function sanKhau() { try { return document.getElementById ? document.getElementById('stage') : null; } catch (e) { return null; } }
  /** Phần tử khớp bộ chọn trong khung goc, chỉ lấy cái THẤY được: Xưởng mở thì chỉ cái nằm trong Xưởng (cái ngoài bị Xưởng che), Xưởng đóng thì chỉ cái nằm ngoài Xưởng (Xưởng chờ ngoài màn). */
  function timTrong(goc, sel) {
    if (!goc || !goc.querySelectorAll) return [];
    var ds = [], l = goc.querySelectorAll(sel), i;
    for (i = 0; i < l.length; i++) ds.push(l[i]);
    var mo = xuongMo(goc);
    return ds.filter(thay).filter(function (e) { return trenCung(e) || trongXuong(e) === mo; });
  }
  function chuoiThanhDich(s, goc) {
    var m;
    if ((m = /^nut:(.+)$/.exec(s))) return timTrong(goc, '[data-nut="' + m[1] + '"]').slice(0, 1);
    if ((m = /^khoi:(?:(em|goc|man|dk|vong|bien|dem):)?(.+)$/.exec(s))) {
      return timTrong(goc, '.pal .brick[data-ten="' + m[2] + '"]' + (m[1] ? '[data-loai="' + m[1] + '"]' : '')).slice(0, 1);
    }
    if ((m = /^(dong|x):(\d+)$/.exec(s))) {
      var rows = timTrong(goc, '.p-prog .rows > .row:nth-child(' + m[2] + ')'), hang = rows[0];
      if (m[1] === 'dong') return hang ? [hang] : [];
      var tab = hang && hang.querySelector ? hang.querySelector('.tab') : null;
      return tab ? [tab] : [];
    }
    if ((m = /^so:(\d+)(?::(\d+))?$/.exec(s))) {                                    // con số chạm được của dòng m[1] (số thứ m[2], mặc định số đầu)
      var dong = timTrong(goc, '.p-prog .rows > .row:nth-child(' + m[1] + ')')[0];
      var so = dong && dong.querySelectorAll ? dong.querySelectorAll('.num')[(+m[2] || 1) - 1] : null;
      return so && thay(so) ? [so] : [];
    }
    if (/^[.#\[]/.test(s)) return timTrong(goc, s).slice(0, 1);
    return [];
  }
  /** Mọi đích (mảng phần tử) của bước b trong khung goc; chưa thấy đích nào thì mảng rỗng. */
  function dsDich(b, goc) {
    var d = b.dich, kq = [];
    if (typeof d === 'function') { try { d = d(); } catch (e) { d = null; } }
    if (!d) return kq;
    if (!Array.isArray(d)) d = [d];
    d.forEach(function (x) {
      if (typeof x === 'string') chuoiThanhDich(x, goc).forEach(function (e) { kq.push(e); });
      else if (x && x.getBoundingClientRect && thay(x)) kq.push(x);
    });
    return kq;
  }

  /* ------------------------------------------------------------------- vẽ */
  /** choi.css chỉ định kiểu cho `.screen > .hd-vien / .hd-bong` (z-index 25 / 26, thấp hơn hộp thoại 40 và bảng chọn số 70). Bước `phu` vẽ thẳng vào #stage: thêm
   *  cùng kiểu ấy cho `#stage > …` với z-index cao hơn mọi lớp. Thêm một lần, chỉ khi có bước `phu`. */
  var daKieuPhu = false;
  function kieuPhu() {
    if (daKieuPhu || typeof document === 'undefined' || !document.head || !document.createElement) return;
    daKieuPhu = true;
    var st = document.createElement('style');
    st.textContent = '#stage>.hd-vien{position:absolute;z-index:95;pointer-events:none;animation:hdvien .6s steps(1) infinite}' +
      '#stage>.hd-bong{position:absolute;z-index:96;pointer-events:none;padding:6px 7px 4px;background:#fff3b0;color:#3a2200;text-align:left;' +
      'font:600 calc(12px*var(--kp))/1.15 var(--px);box-shadow:0 0 0 2px var(--ink),inset 0 2px 0 #fffbe0,inset 0 -2px 0 #e8c860;animation:hdnhay 1s steps(1) infinite}';
    document.head.appendChild(st);
  }
  function chuBuoc(b) { var c = b.chu; if (typeof c === 'function') { try { c = c(); } catch (e) { c = ''; } } return c === undefined || c === null ? '' : String(c); }
  function gaVien(c) { c.vien.forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e); }); c.vien = []; }
  function gaBong(c) { if (c.bong && c.bong.el.parentNode) c.bong.el.parentNode.removeChild(c.bong.el); c.bong = null; }
  function gaHet(c) { gaVien(c); gaBong(c); }

  function dangBiChe(goc, b) {
    if (!goc.querySelector) return false;
    if (xuongMo(goc) && !b.xuong) return true;                                       // Xưởng phủ lên màn chơi
    var hop = document.getElementById ? document.getElementById('lop-hop') : null;
    if (!b.phu && hop && hop.classList && hop.classList.contains('mo')) return true;  // đang có hộp thoại (bước `phu` thì chính là việc trên hộp, không ẩn)
    if (!b.khongAn && goc.querySelector('.bong.show')) return true;                   // đang có bong bóng đề bài / chẩn đoán
    if (!b.khongAn && goc.querySelector('.side.busy')) return true;                   // đang chạy chương trình (phát lại): không che sân / đồng hồ
    if (document.body && document.body.classList && document.body.classList.contains('dang-keo')) return true;   // đang nhấn giữ kéo một khối / một dòng: viền và bong bóng không che chỗ thả
    return false;
  }
  /**
   * Chỉ MỘT chuỗi hiện một lúc: chuỗi chạy SAU (mới hơn) đang hiện thì chuỗi cũ tạm ẩn và không đếm hạn `han`
   * (vd hướng dẫn chung "xóa dòng" bật lên giữa hướng dẫn "chạm khối" của màn 1.2: chỉ còn bong bóng xóa dòng; xóa xong / hết hạn thì bong bóng của màn hiện lại).
   * Chuỗi mới không thấy đích (Xưởng đang mở…) thì chuỗi cũ vẫn hiện.
   */
  function biChuoiMoiChe(c) { for (var i = CHUOI.indexOf(c) + 1; i < CHUOI.length; i++) if (CHUOI[i].dangHien) return true; return false; }
  function ve(c) {
    if (biChuoiMoiChe(c)) { gaHet(c); c.dangHien = false; return false; }
    c.dangHien = veMot(c);
    return c.dangHien;
  }
  /** Vẽ lại mọi chuỗi, chuỗi mới trước (để chuỗi cũ biết có bị che không). Không đếm hạn. */
  function veLai() { CHUOI.slice().reverse().forEach(ve); }
  /** Vẽ (hay ẩn) viền + bong bóng của bước hiện tại của chuỗi c. Trả về true nếu đang hiện. */
  function veMot(c) {
    var b = c.buoc[c.i], man = khungHien();
    if (!b || !man || !man.getBoundingClientRect) { gaHet(c); return false; }
    var goc = (b.phu && sanKhau()) || man;                            // bước `phu`: tìm đích và vẽ ở #stage (nổi trên hộp thoại / bảng chọn số)
    if (goc !== man) kieuPhu();
    var ds = dsDich(b, goc);
    if (!ds.length || dangBiChe(man, b)) { gaHet(c); return false; }
    var rg = goc.getBoundingClientRect(), W = goc.offsetWidth || rg.width, H = goc.offsetHeight || rg.height;
    var k = W && rg.width ? rg.width / W : 1;
    if (!rg.width) { gaHet(c); return false; }
    // viền quanh từng đích
    while (c.vien.length > ds.length) { var e0 = c.vien.pop(); if (e0.parentNode) e0.parentNode.removeChild(e0); }
    while (c.vien.length < ds.length) { var e1 = document.createElement('div'); e1.className = 'hd-vien'; goc.appendChild(e1); c.vien.push(e1); }
    ds.forEach(function (el, i) {
      var r = el.getBoundingClientRect(), v = c.vien[i];
      v.style.left = ((r.left - rg.left) / k - 2) + 'px'; v.style.top = ((r.top - rg.top) / k - 2) + 'px';
      v.style.width = (r.width / k + 4) + 'px'; v.style.height = (r.height / k + 4) + 'px';
    });
    // bong bóng
    var chu = chuBuoc(b);
    if (!chu) { gaBong(c); return true; }
    var neo = b.neo; if (typeof neo === 'function') { try { neo = neo(); } catch (e2) { neo = null; } }
    var rn;
    if (neo && neo.getBoundingClientRect && thay(neo)) rn = neo.getBoundingClientRect();
    else if (ds.length > 1) {                                          // nhiều đích mà không chỉ rõ neo: bong bóng đặt theo khung bao quanh tất cả (không đè lên đích nào)
      var dsBao = ds.filter(function (e) { return !(e.closest && e.closest('.pal-ghim')); });      // khối ở hàng ghim (wait) nằm tận đáy khay: không tính vào khung bao, kẻo bong bóng "dưới" rơi ra ngoài màn
      if (!dsBao.length) dsBao = ds;
      var rs = dsBao.map(function (e) { return e.getBoundingClientRect(); });
      var l = Math.min.apply(null, rs.map(function (r) { return r.left; })), tp = Math.min.apply(null, rs.map(function (r) { return r.top; }));
      var rr = Math.max.apply(null, rs.map(function (r) { return r.right; })), bt = Math.max.apply(null, rs.map(function (r) { return r.bottom; }));
      rn = { left: l, top: tp, right: rr, bottom: bt, width: rr - l, height: bt - tp };
    } else rn = ds[0].getBoundingClientRect();
    if (!c.bong) {
      var bg = document.createElement('div'), nd = document.createElement('span'), mui = document.createElement('i');
      nd.className = 'hd-nd'; mui.className = 'hd-mui'; bg.appendChild(nd); bg.appendChild(mui); goc.appendChild(bg);
      c.bong = { el: bg, nd: nd, mui: mui, chu: null, huong: null };
    }
    var bo = c.bong;
    if (bo.chu !== chu) {
      bo.chu = chu;
      if (window.TP && TP.vanBan) TP.vanBan(bo.nd, chu); else bo.nd.textContent = chu;
    }
    var neoX = (rn.left + rn.width / 2 - rg.left) / k, neoY = (rn.top + rn.height / 2 - rg.top) / k;
    var hg = b.huong; if (typeof hg === 'function') { try { hg = hg(); } catch (e3) { hg = null; } }
    var huong = hg === 'tren' || hg === 'duoi' ? hg : (neoY < H * 0.5 ? 'duoi' : 'tren');
    var bw = Math.min(W - 12, b.rong || 150), trai = Math.max(6, Math.min(W - bw - 6, neoX - bw / 2));
    bo.el.className = 'hd-bong ' + huong;
    bo.el.style.width = bw + 'px'; bo.el.style.left = trai + 'px';
    if (huong === 'tren') { bo.el.style.top = ''; bo.el.style.bottom = ((rg.bottom - rn.top) / k + 9) + 'px'; }
    else { bo.el.style.bottom = ''; bo.el.style.top = ((rn.bottom - rg.top) / k + 9) + 'px'; }
    bo.mui.style.left = Math.max(8, Math.min(bw - 20, neoX - trai - 6)) + 'px';
    return true;
  }

  /* ------------------------------------------------------------ chuỗi / bước */
  function tim(id) { for (var i = 0; i < CHUOI.length; i++) if (CHUOI[i].id === id) return CHUOI[i]; return null; }
  function dungChuoi(c) {
    gaHet(c);
    var i = CHUOI.indexOf(c); if (i >= 0) CHUOI.splice(i, 1);
    if (!CHUOI.length) tatDongHo(); else veLai();                 // chuỗi vừa dừng có thể đang che chuỗi cũ: hiện lại ngay
  }
  /** Việc của bước b đã làm xong theo cách khác (b.daLam trả về true)? */
  function daLamSan(b) { if (!b || typeof b.daLam !== 'function') return false; try { return !!b.daLam(); } catch (e) { return false; } }
  function vaoBuoc(c, i) {
    gaHet(c); c.i = i; c.thay = 0;
    if (daLamSan(c.buoc[i])) { qua(c); return; }                 // đã làm rồi: qua luôn (không nháy viền một khung hình)
    ve(c);
  }
  function qua(c) {
    if (CHUOI.indexOf(c) < 0) return;
    if (c.i + 1 < c.buoc.length) { vaoBuoc(c, c.i + 1); return; }
    if (c.luuKhi === 'xong') datXem(c.co);
    var kx = c.khiXong;
    dungChuoi(c);
    if (typeof kx === 'function') { try { kx(); } catch (e) { /* bỏ qua */ } }
  }
  function khop(xong, su, ct) {
    if (xong === undefined || xong === null) return false;
    if (Array.isArray(xong)) return xong.some(function (x) { return khop(x, su, ct); });
    if (typeof xong === 'string') return xong === su;
    if (typeof xong === 'function') { try { return !!xong(su, ct); } catch (e) { return false; } }
    if (typeof xong === 'object') {
      if (xong.su !== su) return false;
      try { return !xong.khi || !!xong.khi(ct); } catch (e) { return false; }
    }
    return false;
  }
  function coBam(xong) {
    if (Array.isArray(xong)) return xong.some(coBam);
    return xong === 'bam';
  }

  /** Báo một sự kiện của game cho mọi chuỗi đang chạy: bước hiện tại có điều kiện xong khớp thì qua bước. */
  function bao(su, chiTiet) {
    CHUOI.slice().forEach(function (c) {
      var b = c.buoc[c.i];
      if (b && khop(b.xong, su, chiTiet)) qua(c);
    });
  }
  /** Bấm (click, giai đoạn bắt) vào trong một đích của bước có điều kiện 'bam' → xong bước. */
  function khiBam(ev) {
    if (!CHUOI.length) return;
    var goc = khungHien(); if (!goc) return;
    CHUOI.slice().forEach(function (c) {
      var b = c.buoc[c.i];
      if (!b || !coBam(b.xong) || !ev.target) return;
      var ds = dsDich(b, (b.phu && sanKhau()) || goc);
      for (var i = 0; i < ds.length; i++) if (ds[i] === ev.target || (ds[i].contains && ds[i].contains(ev.target))) { qua(c); return; }
    });
  }

  /** Một nhịp đồng hồ: vẽ lại viền / bong bóng (đích dịch chỗ, khay vẽ lại) và đếm hạn `han` (chỉ tính lúc đích đang được thấy). */
  function nhip() {
    CHUOI.slice().reverse().forEach(function (c) {                // chuỗi mới trước: chuỗi cũ biết mình có bị che không (một chuỗi một lúc)
      if (CHUOI.indexOf(c) < 0) return;
      if (daLamSan(c.buoc[c.i])) { qua(c); return; }
      var hien = ve(c), b = c.buoc[c.i];
      if (hien && b && b.han > 0) { c.thay += NHIP_MS; if (c.thay >= b.han) qua(c); }
    });
  }
  function batDongHo() {
    if (!daGanBam && typeof document !== 'undefined' && document.addEventListener) { document.addEventListener('click', khiBam, true); daGanBam = true; }
    if (!dongHo && typeof setInterval === 'function') dongHo = setInterval(nhip, NHIP_MS);
  }
  function tatDongHo() { if (dongHo && typeof clearInterval === 'function') clearInterval(dongHo); dongHo = null; }

  /* ----------------------------------------------------------------- API */
  function chay(o) {
    if (!o || !o.id || !Array.isArray(o.buoc) || !o.buoc.length) return null;
    var cu = tim(o.id);
    if (cu) return cu.tay;                                       // đang chạy: giữ nguyên
    if (daXem(o.co)) return null;                                // đã xem rồi
    if (window.GoLoi && GoLoi.tatHuongDan && GoLoi.tatHuongDan()) return null;     // gỡ lỗi: đang Mở hết (nhảy cóc thử màn) thì không hiện hướng dẫn, trừ khi tắt công tắc này
    var c = { id: o.id, co: o.co || null, luuKhi: o.luuKhi === 'bat-dau' ? 'bat-dau' : 'xong', buoc: o.buoc, i: -1, thay: 0, vien: [], bong: null, dangHien: false, khiXong: o.khiXong, tay: null };
    c.tay = { id: o.id, dung: function () { dungChuoi(c); } };
    CHUOI.push(c);
    if (c.luuKhi === 'bat-dau') datXem(c.co);
    batDongHo();
    vaoBuoc(c, 0);
    if (CHUOI.indexOf(c) >= 0) veLai();                            // chuỗi mới đang hiện: ẩn ngay chuỗi cũ (khỏi hai bong bóng một khung hình)
    return c.tay;
  }
  /** Hướng dẫn của màn: man.huongDan (màn tự khai) hoặc window.HuongDanMan[man.ma] (game/huong-dan-man.js); dạng [bước…] hoặc { co, luuKhi, buoc }. */
  function theoMan(man) {
    if (!man) return null;
    if (man.huongDan) return man.huongDan;
    var kho = typeof window !== 'undefined' ? window.HuongDanMan : null;
    return kho && man.ma && kho[man.ma] ? kho[man.ma] : null;
  }
  /** Chuỗi khai cho màn. Cờ mặc định 'hd:' + man.ma (mỗi màn xem một lần). */
  function vaoMan(man) {
    var hd = theoMan(man);
    if (!hd) return null;
    var o = Array.isArray(hd) ? { buoc: hd } : hd;
    return chay({ id: 'man:' + man.ma, co: o.co || ('hd:' + man.ma), luuKhi: o.luuKhi, buoc: o.buoc || [], khiXong: o.khiXong });
  }
  /** Thắng màn: dừng chuỗi của màn và lưu cờ "đã xem" (đã thắng thì không cần hướng dẫn lại; chưa xong chuỗi cũng thôi). */
  function xongMan(man) {
    var hd = theoMan(man);
    if (!hd) return;
    dung('man:' + man.ma);
    datXem((!Array.isArray(hd) && hd.co) || ('hd:' + man.ma));
  }
  /** Các phần tử khớp một chuỗi đích ('nut:chay', 'khoi:move', 'dong:3', …) đang thấy (màn, Xưởng, hộp thoại, bảng chọn số): cho bước viết `dich: function () {…}`. Không thấy thì mảng rỗng. */
  function timDich(s) { var g = sanKhau() || khungHien(); return g && typeof s === 'string' ? chuoiThanhDich(s, g) : []; }
  /** Dừng một chuỗi (theo id) hay mọi chuỗi (không tham số). Không lưu cờ. */
  function dung(id) {
    CHUOI.slice().forEach(function (c) { if (id === undefined || id === null || c.id === id) dungChuoi(c); });
  }
  function dangChay(id) { return id === undefined ? CHUOI.length > 0 : !!tim(id); }
  /** Bước hiện tại (số thứ tự từ 0) của chuỗi id, hoặc -1 nếu không chạy. */
  function buocHienTai(id) { var c = tim(id); return c ? c.i : -1; }

  window.HuongDan = { chay: chay, vaoMan: vaoMan, xongMan: xongMan, dung: dung, bao: bao, bam: khiBam, nhip: nhip, dangChay: dangChay, buocHienTai: buocHienTai, timDich: timDich };
})();
