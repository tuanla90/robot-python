var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-goi.js — "Robot Chấn Hưng": MÀN CHỌN GÓI (window.ChonGoi), BẢN ĐỒ CUỘN DỌC (3/11).
   Nền: ảnh dài 9 nơi chốn của phim CLB (phim-clb/a/ban-do/dai-9.webp: CLB, kho, nhà máy, bãi tái chế, cảng, bến sông, nông trại, mỏ đá, hang)
   lặp dọc vô hạn; cuộn qua hang thì vòng về cổng CLB, đúng chỗ mùa 9 "Về CLB". Mùa n nằm ở khúc ảnh nơi chốn của nó: đầu khúc một biển
   "MÙA n · tên ★" đặt đúng chỗ giao giữa hai nơi chốn (cổng, cầu, đổi nền: mép khúc ảnh), rồi 10 gói là 10 huy hiệu tròn trên con
   đường, nhãn "GÓI k · tên · sao" bên cạnh. Mùa ẩn (`an`, chưa bật "Mở hết") vẫn có biển tên mùa, kèm ổ khoá và "SẮP CÓ", chưa có gói. Gói thử thách: viền hổ phách, nhãn "THỬ THÁCH". Gói chưa đủ sao: xám + "Cần 45 ★"; gói chưa có màn: "SẮP CÓ".
   Chạm gói đã mở → lưới màn của gói (App.vaoGoi). Gói và luật mở ở game/mo-goi.js.
   Bản đồ phủ cả màn hình; nổi trên đó chỉ có nút quay về (góc trái) và ô tổng sao (góc phải; giữ lâu 2 giây = bảng Gỡ lỗi).
   Mùa BÁN RIÊNG chưa mua (25/10): biển mùa có nút "Mua <mùa> · giá"; chạm biển, nút hay gói của mùa đó mở bảng
   mua (moMua). Hiện là MUA THỬ: bấm "Mua thử" chỉ ghi cờ đã mua trên máy (App.muaThu), chưa nối thanh toán.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var GIU_LAU_MS = 2000;
  var S = { ds: [], bien: [] };

  /* Bản đồ: ảnh 720×10477 phóng ×0.8 (rộng 576), dời trái DX để đường nằm giữa khung 360 (choi.css .g-bd). DUONG = hoành độ giữa đường
     (px ảnh) mỗi 16px dọc, dò bằng tools/do-duong-ban-do.py. Đường bắt đầu dưới cổng CLB (DAU_DUONG), hết ở vòng xuyến trong hang
     (CUOI_DUONG): qua đó thì sang tấm ảnh kế. Khúc thứ r (đếm liền qua các tấm) là nơi chốn r % 9: 0 CLB, 1 kho … 8 hang. */
  var AW = 720, AH = 10477, SC = 0.8, DX = 120, BUOC_DUONG = 16, DAU_DUONG = 340, CUOI_DUONG = 10150;
  var VUNG = 1724 * AW / 1080;        // mỗi nơi chốn cao 1724 px ảnh gốc 1080
  var GOI_Y = 120, KHOANG = 92;      // px ảnh tính từ chỗ giao (biển mùa): gói đầu (chừa chỗ nút mua dưới biển), giữa hai gói (= 74px màn hình); 10 gói vừa khúc hang (đường hết ở vòng xuyến)
  var THEM_DUOI = 360;                // px màn hình dư dưới gói cuối; cuộn gần đáy thì nối thêm một tấm ảnh
  var DUONG = [
    362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,362,365,370,376,382,385,385,385,385,380,374,367,361,358,
    358,358,358,361,367,374,380,385,387,387,387,387,383,378,373,367,363,358,357,357,357,357,358,359,360,360,360,361,361,361,361,362,368,374,380,385,389,391,391,391,391,
    389,385,381,375,375,375,364,362,359,357,355,352,350,350,350,350,351,352,356,360,361,366,371,372,376,376,376,376,376,376,375,374,373,372,371,367,366,365,364,363,362,
    362,362,362,363,364,365,366,367,372,373,374,379,380,381,382,383,384,385,385,385,385,385,384,383,382,381,380,378,378,378,378,378,378,378,378,378,378,378,378,378,378,
    376,374,372,370,367,365,363,361,359,357,357,356,356,356,356,356,357,358,360,363,366,369,371,373,374,375,375,375,374,373,372,372,370,368,368,368,368,367,367,367,367,
    367,369,369,369,371,371,371,371,371,371,371,371,371,370,368,366,366,364,364,364,364,364,367,370,373,376,377,377,377,377,377,375,373,371,369,366,364,362,360,358,358,
    357,357,357,357,358,359,361,364,367,370,373,376,379,383,386,389,391,394,395,396,396,396,396,396,396,396,394,392,390,388,385,383,381,379,377,375,373,371,369,367,365,
    365,365,365,365,363,363,363,361,361,361,361,361,362,363,365,367,369,373,377,381,386,391,395,398,401,401,401,401,401,398,394,389,384,379,374,369,366,362,361,360,360,
    360,360,360,362,366,369,373,375,378,379,379,379,379,377,375,374,372,370,369,367,366,364,363,362,362,362,362,361,361,361,361,361,361,361,361,360,360,359,359,359,359,
    359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,359,360,360,360,360,360,360,360,360,361,
    362,362,364,366,368,372,376,381,387,394,401,407,409,409,409,409,408,406,405,404,404,404,403,403,403,403,403,403,403,403,402,402,402,402,402,401,401,399,397,393,389,
    385,384,382,381,381,381,381,382,383,387,388,388,388,388,388,387,386,382,381,377,373,372,371,369,368,367,366,366,366,367,367,368,369,373,376,380,384,387,391,394,395,
    396,397,397,397,397,397,397,396,395,394,394,394,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,393,390,387,383,379,374,370,367,363,361,
    361,361,361,362,363,366,368,372,376,381,385,389,393,393,393,393,393,393,391,388,384,380,377,374,374,374,374,375,378,382,385,388,391,393,393,393,393,393,392,390,387,
    385,383,380,377,376,374,373,372,372,372,375,379,390,395,397,397,397,397,397,397,397,390,378,365,353,350,350,350,350,350,352,358,369,383,396,396,396,396,396,394,387,
    374,361,352,345,341,341,341,341,341,347,353,353,353,353,353,353,353,353,353,353,353,339,334,334,334,342,342,342,342,342,342,342,342,342,342,342,342,342,342,342
  ];

  function duongX(y) {
    var yy = ((y % AH) + AH) % AH, i = yy / BUOC_DUONG, a = Math.min(Math.floor(i), DUONG.length - 1), b = Math.min(a + 1, DUONG.length - 1);
    return DUONG[a] + (DUONG[b] - DUONG[a]) * (i - Math.floor(i));
  }
  /** Chỗ y (px ảnh, có thể quá một tấm) nằm ngoài con đường thì dời xuống đầu đường (cùng tấm hoặc tấm kế). */
  function trenDuong(y) {
    var yy = ((y % AH) + AH) % AH;
    if (yy > CUOI_DUONG) return y - yy + AH + DAU_DUONG;
    if (yy < DAU_DUONG) return y - yy + DAU_DUONG;
    return y;
  }
  function dauKhuc(r) { return Math.floor(r / 9) * AH + (r % 9) * VUNG; }
  /** px ảnh → px bản đồ (màn hình). */
  function diem(y) { return { x: duongX(y) * SC - DX, y: y * SC }; }

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    el.khung = h('div', 'g-khung'); el.bd = h('div', 'g-bd'); el.khung.appendChild(el.bd);
    host.appendChild(el.khung);

    var dau = h('div', 'g-dau g-noi');                                // nổi trên bản đồ: ◀ · ★ tổng sao
    el.ve = h('button', 'bt g-pu nav'); el.ve.setAttribute('aria-label', t('goi.ve')); el.ve.setAttribute('data-nut', 've-dau');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); el.ve.appendChild(ic);
    el.sao = h('div', 'g-tong'); el.sao.setAttribute('data-nut', 'tieu-de'); el.sao.setAttribute('aria-label', t('goi.tieuDe'));
    dau.appendChild(el.ve); dau.appendChild(el.sao);
    host.appendChild(dau);
    el.duoi = h('div', 'g-duoi'); host.appendChild(el.duoi);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);

    el.ve.addEventListener('click', function () { App.veDau(); });
    el.khung.addEventListener('scroll', khiCuon, { passive: true });

    var hen = null;
    el.sao.addEventListener('pointerdown', function () { clearTimeout(hen); hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) { el.sao.addEventListener(s, function () { clearTimeout(hen); hen = null; }); });
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu; el.tb.classList.add('hien');
    clearTimeout(tbHen); tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2600);
  }

  /** Lời báo mùa chưa mở (theo điều kiện `mo` của mùa). */
  function loiMua(mu) {
    if (!mu) return t('chon.khoaMua');
    var c = mu.mo || {};
    if (typeof c.sao === 'number') { var mt = App.dsMua().filter(function (x) { return x.ma === (c.mua || App.dsMua()[0].ma); })[0]; return t('goi.khoaMuaSao', { sao: c.sao, mua: mt ? mt.ten : '', ten: mu.ten }); }
    if (c.goi) { var g = App.goiTheoMa(c.goi); return t('goi.khoaMuaGoi', { goi: g ? g.ten : c.goi, ten: mu.ten }); }
    return t('goi.khoaMua', { ten: mu.ten });
  }
  /** Bảng mua một mùa bán riêng (mua thử: chưa nối thanh toán). */
  function moMua(mu) {
    var soMan = mu.goi.reduce(function (s, g) { return s + g.man.length; }, 0);
    var m = TP.Hop.mo(t('mua.tieuDe', { ten: mu.ten }), 'hop-nho hop-mua');
    m.hop.setAttribute('data-hop', 'mua');
    m.than.appendChild(h('div', 'hop-chu', t('mua.noiDung', { ten: mu.ten, goi: mu.goi.filter(function (g) { return !g.sapCo; }).length, man: soMan })));
    m.than.appendChild(h('div', 'hop-chu canh', t('mua.thu')));
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-wd', t('mua.deSau'), function () { TP.Hop.dong(); }, 'de-sau'));
    hang.appendChild(TP.Hop.nut('g-gr', t('mua.nut', { gia: mu.ban.gia }), function () { TP.Hop.dong(); App.muaThu(mu.ma); }, 'mua-thu'));
    m.than.appendChild(hang);
  }
  /** Các mùa hiện trên màn chọn gói: mùa khai `an` (thu-tu-chuong.js) chỉ hiện khi bật "Mở hết" (bảng Gỡ lỗi). */
  function muaHien() { return App.dsMua().filter(function (mu) { return !mu.an || App.moHet; }); }
  /** Vẽ lại; ma (tùy chọn): gói cần cuộn tới (mặc định App.goi, rồi gói nên chơi). */
  function ve(ma) {
    var hien = muaHien();
    var gDich = App.goiTheoMa(ma || App.goi);
    if (gDich && hien.indexOf(App.dsMua().filter(function (mu) { return mu.ma === gDich.mua; })[0]) < 0) gDich = null;
    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));

    // gói nên chơi: gói đầu tiên đã mở mà chưa qua hết (trong các mùa đang hiện)
    var cur = null;
    hien.forEach(function (mu) { mu.goi.forEach(function (g) { if (!cur && !g.sapCo && App.goiMo(g) && App.soQua(g) < g.man.length) cur = g; }); });
    if (!gDich) gDich = cur;

    el.bd.innerHTML = '';
    el.bd.style.backgroundPosition = (-DX) + 'px 0';
    S.ds = []; S.bien = [];
    var r = 1, cuoiY = 0, dichY = null;
    App.dsMua().forEach(function (mu) {
      var so = /^mua-(\d)$/.exec(mu.ma), laHien = hien.indexOf(mu) >= 0;
      if (!so && !laHien) return;                                     // Kho lưu trữ (mua-an): chỉ có khi bật Mở hết
      if (so) r = Math.max(r, +so[1]);
      var y = Math.max(dauKhuc(r), cuoiY ? cuoiY / SC + KHOANG : 0);   // biển ở chỗ giao, kể cả mép tấm ảnh (hang → cổng CLB): không cần nằm trên đường
      var bn = bienMua(mu, laHien, so ? +so[1] : null), pb = diem(y);
      bn.style.top = pb.y + 'px';
      el.bd.appendChild(bn); S.bien.push({ ma: mu.ma, y: pb.y, hien: laHien });
      cuoiY = pb.y;
      if (laHien) {
        y += GOI_Y;
        mu.goi.forEach(function (g, k) {
          y = trenDuong(y);
          var p = diem(y), n = nutGoi(g, k, g === cur, k % 2 ? 'trai' : 'phai');
          n.style.left = p.x + 'px'; n.style.top = p.y + 'px';
          el.bd.appendChild(n); S.ds.push({ g: g, y: p.y });
          if (g === gDich) dichY = p.y;
          cuoiY = p.y; y += KHOANG;
        });
      }
      r++;
    });
    el.bd.style.height = Math.max(cuoiY + THEM_DUOI, el.khung.clientHeight + 1) + 'px';

    el.duoi.innerHTML = '';
    if (window.SoLenh && window.SoLenhMan) {
      var bs = h('button', 'bt g-cy d-so'); bs.setAttribute('data-nut', 'so-lenh'); bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span'); ib.setAttribute('data-i', 'book'); ib.setAttribute('data-s', '2'); ib.setAttribute('data-l', BM.xanhLo); bs.appendChild(ib);
      bs.appendChild(h('span', null, t('chon.soLenh')));
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.duoi.appendChild(bs);
    }
    if (window.GoLoi) GoLoi.nutBug(el.duoi);
    Ve.hydrate(el.duoi);
    Ve.hydrate(el.bd);

    if (dichY != null) cuonToi(dichY - el.khung.clientHeight * 0.45, false);
    else { var b0 = S.bien.filter(function (x) { return x.ma === App.mua; })[0]; cuonToi(b0 ? b0.y - 80 : 0, false); }
    khiCuon();
  }

  /** Biển đầu mỗi mùa: "MÙA n · tên ★ sao"; mùa ẩn: "SẮP CÓ"; mùa khoá: ổ khoá (chạm báo lý do); mùa chưa mua: thêm nút mua. */
  function bienMua(mu, laHien, so) {
    var b = h('div', 'g-bien' + (laHien ? '' : ' sap')); b.setAttribute('data-mua', mu.ma);
    var dong = h('div', 'g-bien-dong');
    if (!laHien) {
      var k0 = h('span'); k0.setAttribute('data-i', 'lock'); k0.setAttribute('data-s', '1'); dong.appendChild(k0);
      if (so) dong.appendChild(h('span', 'g-bien-so', t('goi.muaSo', { n: so })));
      dong.appendChild(h('span', 'g-bien-ten', mu.ten));
      dong.appendChild(h('span', 'g-bien-sap', t('goi.sapCo')));
      b.appendChild(dong);
      return b;
    }
    var mo = App.muaMo(mu), ban = App.chuaMua(mu);
    if (!mo && !ban) { var k = h('span'); k.setAttribute('data-i', 'lock'); k.setAttribute('data-s', '1'); dong.appendChild(k); }
    if (so) dong.appendChild(h('span', 'g-bien-so', t('goi.muaSo', { n: so })));
    dong.appendChild(h('span', 'g-bien-ten', mu.ten));
    var sao = h('span', 'g-bien-sao'); sao.appendChild(Ve.sao(true, 1.5)); sao.appendChild(h('span', null, String(App.saoMua(mu.ma)))); dong.appendChild(sao);
    b.appendChild(dong);
    if (ban) {
      var nb = h('button', 'bt g-gr g-ban-nut', t('mua.nutBan', { ten: mu.ten, gia: mu.ban.gia })); nb.setAttribute('data-nut', 'mua-mua');
      nb.addEventListener('click', function (ev) { ev.stopPropagation(); moMua(mu); });
      b.appendChild(nb);
    }
    b.addEventListener('click', function () {
      if (ban) { moMua(mu); return; }
      if (!mo) { lac(b); thongBao(loiMua(mu)); }
    });
    return b;
  }

  /** Một gói trên đường: huy hiệu tròn (tâm đặt bằng left/top) + nhãn bên trái / phải. */
  function nutGoi(g, k, laCur, ben) {
    var mo = App.goiMo(g), xong = mo && App.soQua(g) === g.man.length;
    var tt = g.loai === 'thu-thach';
    var muG = App.dsMua().filter(function (x) { return x.ma === g.mua; })[0];
    var b = h('div', 'g-nut ' + ben + ' ' + (g.sapCo ? 'sap' : !mo ? 'khoa' : xong ? 'xong' : 'mo') + (laCur ? ' cur' : '') + (g.dot === 2 ? ' dot2' : '') + (tt ? ' thu-thach' : ''));
    b.setAttribute('data-goi', g.ma); b.setAttribute('role', 'button'); b.setAttribute('aria-label', t('goi.so', { n: k + 1 }) + ' ' + g.ten);
    var tron = h('div', 'g-tron');
    var co = window.HuyHieu && HuyHieu.DS.indexOf(g.hinh) >= 0;
    tron.appendChild(co ? HuyHieu.mk(g.hinh, g.sapCo || !mo ? 'khoa' : xong ? 'xong' : 'mo', 1.3) : Ve.ico('plus', 3, { fill: BM.vang, line: BM.vienDam }));
    b.appendChild(tron);

    var nhan = h('div', 'g-nhan');
    nhan.appendChild(h('div', 'g-nh-so', tt ? t('goi.thuThach') : t('goi.so', { n: k + 1 })));
    nhan.appendChild(h('div', 'g-nh-ten', g.ten));
    var dong = h('div', 'g-nh-sao');
    if (g.sapCo) dong.appendChild(h('span', 'g-nh-can', t('goi.sapCo')));
    else {
      dong.appendChild(Ve.sao(true, 1.2));
      if (mo) dong.appendChild(h('span', null, App.saoGoi(g) + '/' + g.saoToiDa));
      else if (App.chuaMua(muG)) dong.appendChild(h('span', 'g-nh-can', t('goi.chuaMua')));
      else if (App.muaMo(muG)) dong.appendChild(h('span', 'g-nh-can', t('goi.canSao', { n: g.saoCan })));
      else dong.appendChild(h('span', 'g-nh-can', t('chon.khoaMua')));
    }
    nhan.appendChild(dong);
    b.appendChild(nhan);

    if (!g.sapCo) {
      var moDauGoi = g.ma === 'xe' && window.MoDau && window.Luu && Luu.daXem(MoDau.CO)     // gói 1 dùng phim mở đầu (mo-dau.js) làm phim của gói,
        && !(window.PhimGoi && PhimGoi.co(g.ma));                                           // trừ khi đã có phim CLB của gói (phim-clb/ds.js)
      if (mo && (moDauGoi || (window.PhimGoi && PhimGoi.co(g.ma) && (App.moHet || PhimGoi.daXem(g.ma))))) {        // đã xem phim gói (hoặc đang bật Mở hết): nút nhỏ ▶ xem lại (phim xong thì vào gói)
        var xl = h('button', 'bt g-cy g-phim'); xl.setAttribute('data-nut', 'xem-phim'); xl.setAttribute('aria-label', t('pg.xemLai')); xl.setAttribute('title', t('pg.xemLai'));
        var ip = h('span'); ip.setAttribute('data-i', 'play'); ip.setAttribute('data-s', '1'); ip.setAttribute('data-l', BM.xanhLo); ip.setAttribute('data-f', BM.trangV2); xl.appendChild(ip);
        xl.addEventListener('click', function (ev) {
          ev.stopPropagation();
          App.goi = g.ma;
          if (moDauGoi) MoDau.mo(function () { App.vaoGoi(g.ma); });
          else PhimGoi.mo(g.ma, function () { App.vaoGoi(g.ma); });
        });
        tron.appendChild(xl);
      }
    }
    b.addEventListener('click', function () {
      if (g.sapCo) { lac(b); thongBao(t('goi.sapCoTb')); return; }
      if (!App.goiMo(g)) {
        if (App.chuaMua(muG)) { moMua(muG); return; }
        lac(b); thongBao(App.muaMo(muG) ? t('goi.khoa', { can: g.saoCan, co: App.saoMua(g.mua) }) : loiMua(muG)); return;
      }
      App.goi = g.ma; App.mua = g.mua;
      if (window.PhimGoi && PhimGoi.co(g.ma) && !PhimGoi.daXem(g.ma)) { PhimGoi.mo(g.ma, function () { App.vaoGoi(g.ma); }); return; }   // lần đầu vào gói: phim ngắn (phim-goi.js)
      App.vaoGoi(g.ma);
    });
    return b;
  }
  function lac(b) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); }

  function cuonToi(y, muot) {
    y = Math.max(0, y);
    if (muot && el.khung.scrollTo) el.khung.scrollTo({ top: y, behavior: 'smooth' });
    else el.khung.scrollTop = y;
  }
  /** Cuộn: gần đáy thì nối thêm một tấm ảnh (ảnh lặp dọc nên liền mạch); App.mua theo biển mùa ở phần trên khung. */
  function khiCuon() {
    var k = el.khung, cao = el.bd.offsetHeight;
    if (k.scrollTop + k.clientHeight > cao - 600) el.bd.style.height = (cao + Math.round(AH * SC)) + 'px';
    var mocY = k.scrollTop + k.clientHeight * 0.4, ma = null;
    S.bien.forEach(function (x) { if (x.hien && x.y <= mocY) ma = x.ma; });
    if (!ma) { var d = S.bien.filter(function (x) { return x.hien; })[0]; ma = d && d.ma; }
    if (ma) App.mua = ma;
  }
  window.ChonGoi = { dung: dung, ve: ve, thongBao: thongBao, loiMua: loiMua, moMua: moMua };
})();
