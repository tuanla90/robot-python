var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-goi.js — "Robot Chấn Hưng": MÀN CHỌN GÓI (window.ChonGoi), 10 GÓI CỦA MỘT MÙA GỌN TRONG 1 MÀN HÌNH, KHÔNG CUỘN (5/11).
   Đứng sau "CHỌN MÙA" (man-mua.js, đã lọc mùa khoá/chưa mua): vào tới đây là App.mua CHẮC CHẮN đã mở, nên màn này không
   còn lo khoá / mua cả mùa nữa, chỉ còn luật mở từng GÓI (game/mo-goi.js). 10 gói (9 + 1 thử thách) vẽ thành một con
   đường ngoằn ngoèo thu nhỏ vừa khung (tính theo chiều cao thật của `el.than`, không phụ thuộc cỡ màn hình).
   Thanh trên: ◀ (về chọn mùa) · "MÙA n · tên" · ô tổng sao (giữ lâu 2 giây = bảng Gỡ lỗi).
   Gói: huy hiệu tròn (chạm → App.vaoGoi) + nhãn tên/sao bên cạnh, xen trái/phải cho khỏi chồng chữ. Gói thử thách: viền hổ phách.
   Gói chưa đủ sao: xám + "Cần n ★". Gói chưa có màn: "SẮP CÓ". Phim gói (phim-goi.js) vẫn mở trước khi vào gói lần đầu.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var GIU_LAU_MS = 2000;

  /* Nền đường: CÙNG ảnh dài 9 nơi chốn của man-mua.js (phim-clb/a/ban-do/dai-9.webp, SC = 0.8, DX = 120 để đường nằm giữa khung 360),
     cắt đúng khúc ảnh (nơi chốn) của App.mua rồi co vừa `el.than` — không vẽ lại toàn bộ bản đồ, chỉ một khúc. 10 gói đặt ĐÚNG lên con
     đường vẽ trong khúc ảnh đó (duongX, cùng mảng DUONG với man-mua.js — đổi mảng thì sửa cả hai tệp), không phải vị trí bịa. */
  var AW = 720, AH = 10477, SC = 0.8, DX = 120, BUOC_DUONG = 16;
  var VUNG_RAW = 1724 * AW / 1080, VUNG = VUNG_RAW * SC;   // một khúc (nơi chốn) cao bấy nhiêu px ảnh gốc / px màn hình sau khi co
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
  /** Khúc ảnh của mùa `so` (1..9): nơi chốn so % 9 (0 CLB, 1 kho … 8 hang), khớp dauKhuc() của man-mua.js. */
  function khucMua(so) { return (so % 9) * VUNG; }
  /** Hoành độ con đường (px màn hình) ở hàng `yC` trong `el.than` đã cắt quanh `giua` (giữa khúc ảnh) cao `cao`. */
  function xTrenDuong(yC, giua, cao) { return duongX((giua - cao / 2 + yC) / SC) * SC - DX; }
  /** Nửa trái hay phải khung (360px) thì nhãn xoè sang bên kia, luôn còn chỗ (nhãn rộng 132px); kẹp x để vòng tròn không lòi ra ngoài. */
  function xKep(x) { return Math.max(32, Math.min(328, x)); }

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    var dau = h('div', 'c-dau');
    el.ve = h('button', 'bt g-pu nav'); el.ve.setAttribute('aria-label', t('goi.veMua')); el.ve.setAttribute('data-nut', 've-mua');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); el.ve.appendChild(ic);
    el.tieuDe = h('div', 'c-td'); el.tieuDe.setAttribute('data-nut', 'tieu-de-goi');
    el.phai = h('div', 'c-phai');
    el.sao = h('div', 'g-tong'); el.sao.setAttribute('data-nut', 'tieu-de'); el.sao.setAttribute('aria-label', t('goi.tieuDe'));
    el.phai.appendChild(el.sao);
    dau.appendChild(el.ve); dau.appendChild(el.tieuDe); dau.appendChild(el.phai);
    host.appendChild(dau);

    el.than = h('div', 'gg-than'); host.appendChild(el.than);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(vuaTieuDe);

    el.ve.addEventListener('click', function () { App.veMua(); });

    var hen = null;
    el.sao.addEventListener('pointerdown', function () { clearTimeout(hen); hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) { el.sao.addEventListener(s, function () { clearTimeout(hen); hen = null; }); });
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu; el.tb.classList.add('hien');
    clearTimeout(tbHen); tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2600);
  }
  function lac(b) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); }

  /** Tiêu đề dài ("Mùa 3 · Bãi tái chế") thì co chữ (hệ số --ts) cho vừa chỗ, không đè lên nút (như man-chon.js). */
  function vuaTieuDe() {
    var td = el.tieuDe; if (!td) return;
    td.style.removeProperty('--ts');
    if (!td.clientWidth) return;
    var ts = 1;
    while (td.scrollWidth > td.clientWidth + 1 && ts > 0.5) { ts = Math.round((ts - 0.04) * 100) / 100; td.style.setProperty('--ts', ts); }
  }

  /** Lời báo mùa chưa mở (theo điều kiện `mo` của mùa). Dùng lại ở man-mua.js. */
  function loiMua(mu) {
    if (!mu) return t('chon.khoaMua');
    var c = mu.mo || {};
    if (typeof c.sao === 'number') { var mt = App.dsMua().filter(function (x) { return x.ma === (c.mua || App.dsMua()[0].ma); })[0]; return t('goi.khoaMuaSao', { sao: c.sao, mua: mt ? mt.ten : '', ten: mu.ten }); }
    if (c.goi) { var g = App.goiTheoMa(c.goi); return t('goi.khoaMuaGoi', { goi: g ? g.ten : c.goi, ten: mu.ten }); }
    return t('goi.khoaMua', { ten: mu.ten });
  }
  /** Bảng mua một mùa bán riêng (mua thử: chưa nối thanh toán). Dùng lại ở man-mua.js. */
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

  function muaDangXem() {
    return App.dsMua().filter(function (x) { return x.ma === App.mua; })[0] || App.dsMua()[0];
  }

  /** Vị trí nút thứ k / tổng n nút: y chia đều vừa chiều cao `cao` (px, đo thật ở el.than), không cuộn; x lấy ĐÚNG trên con đường
   *  ở hàng y đó (xTrenDuong) nên theo sát khúc cua trong ảnh, không phải vị trí bịa.
   *  Mùa chuẩn (khuôn 10 gói) thì n = 10; mùa 1–3 (cũ, chưa dựng lại) có thể nhiều gói hơn nên chia đều theo n thật. */
  function viTri(k, n, cao, giua) {
    var TREN = 50, DUOI = 34, buoc = (cao - TREN - DUOI) / Math.max(1, n - 1);
    var y = TREN + k * buoc;
    return { x: xKep(xTrenDuong(y, giua, cao)), y: y };
  }

  function ve() {
    var mu = muaDangXem(); if (!mu) return;
    App.mua = mu.ma;
    var hienGoi = mu.goi;   // gói của mùa, đúng thứ tự (mo-goi.js); gói "SẮP CÓ" (sapCo) vẫn vẽ, khoá
    var so = /^mua-(\d)$/.exec(mu.ma);

    el.tieuDe.innerHTML = '';
    if (so) { el.tieuDe.appendChild(document.createTextNode(t('goi.muaSo', { n: '' }))); el.tieuDe.appendChild(h('span', 'd', so[1])); el.tieuDe.appendChild(document.createTextNode(' · ')); }
    el.tieuDe.appendChild(document.createTextNode(mu.ten));

    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));
    vuaTieuDe();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(vuaTieuDe);   // phông tải muộn thì đo lại (tiêu đề dài "MÙA n · tên" dễ lộ hơn "GÓI n")

    // gói nên chơi: gói đầu tiên đã mở mà chưa qua hết
    var cur = null;
    hienGoi.forEach(function (g) { if (!cur && !g.sapCo && App.goiMo(g) && App.soQua(g) < g.man.length) cur = g; });

    el.than.innerHTML = '';
    var cao = el.than.clientHeight || 480, tongGoi = hienGoi.length;
    var giua = khucMua(so ? +so[1] : 0) + VUNG / 2;                    // giữa khúc ảnh của mùa, rồi canh giữa trong el.than (cắt bớt nếu khúc cao hơn)
    el.than.style.backgroundPosition = (-DX) + 'px ' + (-(giua - cao / 2)) + 'px';
    hienGoi.forEach(function (g, k) {
      var p = viTri(k, tongGoi, cao, giua), nut = nutGoi(g, k, g === cur);
      nut.style.left = p.x + 'px'; nut.style.top = p.y + 'px';
      el.than.appendChild(nut);
    });

    if (el.phai.firstChild !== el.sao) el.phai.insertBefore(el.sao, el.phai.firstChild);   // giữ ★ luôn ở cuối, Sổ lệnh / bug chèn trước nó
    Array.prototype.slice.call(el.phai.children).forEach(function (c) { if (c !== el.sao) c.remove(); });
    if (window.SoLenh && window.SoLenhMan) {
      var bs = h('button', 'bt g-cy c-so'); bs.setAttribute('data-nut', 'so-lenh'); bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span'); ib.setAttribute('data-i', 'book'); ib.setAttribute('data-s', '2'); ib.setAttribute('data-l', BM.xanhLo); bs.appendChild(ib);
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.phai.insertBefore(bs, el.sao);
    }
    if (window.GoLoi) GoLoi.nutBug(el.phai);
    Ve.hydrate(el.phai);
    Ve.hydrate(el.than);
  }

  /** Một gói trên đường: CHỈ huy hiệu tròn (user 5/11: show hết nhãn full thì che mất cảnh — như man-mua.js).
   *  Chạm → moChiTietGoi (hộp tên + sao / lý do khoá + nút Chơi), trừ "sắp có" (lắc + báo nhanh, khỏi mở hộp). */
  function nutGoi(g, k, laCur) {
    var sap = g.sapCo, mo = App.goiMo(g), xong = mo && App.soQua(g) === g.man.length;
    var tt = g.loai === 'thu-thach';
    var b = h('div', 'g-nut ' + (sap ? 'sap' : !mo ? 'khoa' : xong ? 'xong' : 'mo') + (laCur ? ' cur' : '') + (g.dot === 2 ? ' dot2' : '') + (tt ? ' thu-thach' : ''));
    b.setAttribute('data-goi', g.ma); b.setAttribute('role', 'button'); b.setAttribute('aria-label', (tt ? t('goi.thuThach') : t('goi.so', { n: k + 1 })) + ' ' + g.ten);
    var tron = h('div', 'g-tron');
    var co = window.HuyHieu && HuyHieu.DS.indexOf(g.hinh) >= 0;
    tron.appendChild(co ? HuyHieu.mk(g.hinh, sap || !mo ? 'khoa' : xong ? 'xong' : 'mo', 1.3) : Ve.ico('plus', 3, { fill: BM.vang, line: BM.vienDam }));
    b.appendChild(tron);
    Ve.hydrate(b);
    b.addEventListener('click', function () {
      if (sap) { lac(b); thongBao(t('goi.sapCoTb')); return; }
      moChiTietGoi(g, k, tt);
    });
    return b;
  }

  /** Vào thật sự (phim gói lần đầu rồi mới App.vaoGoi, như trước 5/11). */
  function vaoGoiThat(g) {
    App.goi = g.ma; App.mua = g.mua;
    if (window.PhimGoi && PhimGoi.co(g.ma) && !PhimGoi.daXem(g.ma)) { PhimGoi.mo(g.ma, function () { App.vaoGoi(g.ma); }); return; }
    App.vaoGoi(g.ma);
  }
  /** Hộp chi tiết một gói (chạm nút mới hiện — nút trên đường chỉ còn huy hiệu tối giản): tên + sao (hay lý do khoá) +
   *  nút "Chơi" (mở hay chưa xem phim gói thì phim trước), kèm "Xem phim" nếu gói đã có phim và đã xem qua rồi. */
  function moChiTietGoi(g, k, tt) {
    var mo = App.goiMo(g), muG = App.dsMua().filter(function (x) { return x.ma === g.mua; })[0];
    var tieu = (tt ? t('goi.thuThach') : t('goi.so', { n: k + 1 })) + ' · ' + g.ten;
    if (!mo && App.chuaMua(muG)) { moMua(muG); return; }
    var m = TP.Hop.mo(tieu, 'hop-nho');
    if (mo) {
      var dong = h('div', 'hop-chu canh'); dong.appendChild(Ve.sao(true, 1.3)); dong.appendChild(h('span', null, ' ' + App.saoGoi(g) + '/' + g.saoToiDa)); m.than.appendChild(dong);
      var hang = h('div', 'hop-hang');
      var moDauGoi = g.ma === 'xe' && window.MoDau && window.Luu && Luu.daXem(MoDau.CO)     // gói 1 dùng phim mở đầu (mo-dau.js) làm phim của gói,
        && !(window.PhimGoi && PhimGoi.co(g.ma));                                           // trừ khi đã có phim CLB của gói (phim-clb/ds.js)
      if (moDauGoi || (window.PhimGoi && PhimGoi.co(g.ma) && (App.moHet || PhimGoi.daXem(g.ma)))) {   // đã xem (hay đang bật Mở hết): thêm nút xem lại
        hang.appendChild(TP.Hop.nut('g-wd', t('pg.xemLai'), function () {
          TP.Hop.dong(); App.goi = g.ma;
          if (moDauGoi) MoDau.mo(function () { App.vaoGoi(g.ma); });
          else PhimGoi.mo(g.ma, function () { App.vaoGoi(g.ma); });
        }, 'xem-phim'));
      }
      hang.appendChild(TP.Hop.nut('g-gr', t('chon.choi'), function () { TP.Hop.dong(); vaoGoiThat(g); }, 'choi'));
      m.than.appendChild(hang);
    } else {
      var lyDo = App.muaMo(muG) ? t('goi.khoa', { can: g.saoCan, co: App.saoMua(g.mua) }) : loiMua(muG);
      m.than.appendChild(h('div', 'hop-chu', lyDo));
      m.than.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'dong'));
    }
  }

  window.ChonGoi = { dung: dung, ve: ve, thongBao: thongBao, loiMua: loiMua, moMua: moMua };
})();
