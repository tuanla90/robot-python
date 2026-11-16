var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-mua.js — "Robot Chấn Hưng": MÀN CHỌN MÙA (window.ChonMua), BẢN ĐỒ THẾ GIỚI (5/11).
   Đúng ảnh bản đồ "Bản đồ chiến dịch" ở phim mở đầu (phim-clb/src/PhimMoDau.tsx, cảnh CanhHanhTrinh): nền
   nen-doc/the-gioi.webp (720×1280, đã có sẵn trong hoc/game/phim-clb/a/), 9 ghim ĐÚNG toạ độ TRAM_DOC của cảnh đó
   (x, y đo trên khung thiết kế 1080×1920 nên chia 3 ra px màn hình 360 rộng).
   Ghim TỐI GIẢN (user 5/11, theo kiểu bản đồ game khác: chỉ icon, chạm mới hiện chi tiết — show hết nhãn full-width
   thì che mất cảnh): chỉ còn vòng tròn ảnh mặt người nhờ (viền màu theo nơi) hoặc ổ khoá, không có nhãn tên/sao nổi
   trên ảnh nữa. Chạm ghim → hộp thoại nhỏ (TP.Hop, như hộp mua mùa) hiện tên, sao / lý do khoá, rồi nút "Vào mùa"
   hay "Mua thử". Một ảnh tĩnh, không cuộn: ảnh phủ vừa khít khung (kiểu background cover), ghim tính lại theo đúng
   tỉ lệ che phủ đó nên luôn đúng chỗ dù màn hình cao thấp khác nhau.
   Mùa ẩn (`an`, chưa bật "Mở hết") vẫn có ghim, khoá. "Kho lưu trữ" (mua-an) không có chỗ trên ảnh này nên không vẽ
   ở màn này (debug "Mở hết" vẫn vào được gói của nó bằng cách khác).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var GIU_LAU_MS = 2000;

  var ANH_W = 720, ANH_H = 1280;                  // nen-doc/the-gioi.webp, xuất ở 2/3 khung thiết kế 1080×1920
  var TY_LE_THIET_KE = ANH_W / 1080;               // 2/3: toạ độ TRAM_DOC (thiết kế 1080) → px ảnh thật
  /** 9 ghim, đúng TRAM_DOC của CanhHanhTrinh (PhimMoDau.tsx): x, y trong khung thiết kế 1080×1920; nguoi = ảnh mặt (phim-clb/a/nguoi). */
  var TRAM = [
    { ma: 'mua-9', x: 750, y: 131, nguoi: 'thay-giao-viec', mau: '#4F46E5' },     // CLB Robot (đầu + cuối hành trình)
    { ma: 'mua-1', x: 750, y: 330, nguoi: 'tu-nghi', mau: '#D97706' },
    { ma: 'mua-2', x: 750, y: 522, nguoi: 'hanh-nghi', mau: '#DC2626' },
    { ma: 'mua-3', x: 755, y: 698, nguoi: 'sau-nghi', mau: '#16A34A' },
    { ma: 'mua-4', x: 768, y: 908, nguoi: 'mai-nghi', mau: '#0891B2' },
    { ma: 'mua-5', x: 842, y: 1133, nguoi: 'ba-nghi', mau: '#0D9488' },
    { ma: 'mua-6', x: 798, y: 1336, nguoi: 'lan-nghi', mau: '#DB2777' },
    { ma: 'mua-7', x: 802, y: 1558, nguoi: 'dung-nghi', mau: '#7C3AED' },
    { ma: 'mua-8', x: 802, y: 1722, nguoi: 'phong-nghi', mau: '#0284C7' }
  ];

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    el.khung = h('div', 'g-khung'); el.bd = h('div', 'g-bd'); el.khung.appendChild(el.bd);
    host.appendChild(el.khung);

    var dau = h('div', 'g-dau g-noi');                                // nổi trên bản đồ: ◀ · ★ tổng sao
    el.ve = h('button', 'bt g-pu nav'); el.ve.setAttribute('aria-label', t('goi.ve')); el.ve.setAttribute('data-nut', 've-dau');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); el.ve.appendChild(ic);
    el.sao = h('div', 'g-tong'); el.sao.setAttribute('data-nut', 'tieu-de'); el.sao.setAttribute('aria-label', t('chonMua.tieuDe'));
    dau.appendChild(el.ve); dau.appendChild(el.sao);
    host.appendChild(dau);
    el.duoi = h('div', 'g-duoi'); host.appendChild(el.duoi);
    el.tb = h('div', 'c-tb'); host.appendChild(el.tb);
    Ve.hydrate(host);

    el.ve.addEventListener('click', function () { App.veDau(); });

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
  /** Hộp chi tiết một ghim (chạm ghim mới hiện — ghim trên bản đồ chỉ còn icon tối giản). mua ẩn → chỉ báo "sắp có";
   *  bán riêng chưa mua → mở thẳng hộp mua; còn lại → tên + sao (hay lý do khoá) + nút "Vào mùa" khi đã mở. */
  function moChiTiet(mu, tr, so, laHien) {
    var tieu = (so ? t('goi.muaSo', { n: so }) + ' · ' : '') + mu.ten;
    if (!laHien) {
      var m0 = TP.Hop.mo(tieu, 'hop-nho');
      m0.than.appendChild(h('div', 'hop-chu', t('chonMua.sapCoTb')));
      m0.than.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'dong'));
      return;
    }
    if (App.chuaMua(mu)) { moMua(mu); return; }
    var mo = App.muaMo(mu);
    var m = TP.Hop.mo(tieu, 'hop-nho');
    if (mo) {
      var dong = h('div', 'hop-chu canh'); dong.appendChild(Ve.sao(true, 1.3)); dong.appendChild(h('span', null, ' ' + App.saoMua(mu.ma))); m.than.appendChild(dong);
      var hang = h('div', 'hop-hang');
      hang.appendChild(TP.Hop.nut('g-gr', t('chonMua.vaoMua'), function () { TP.Hop.dong(); App.mua = mu.ma; App.hien('goi'); }, 'vao-mua'));
      m.than.appendChild(hang);
    } else {
      m.than.appendChild(h('div', 'hop-chu', loiMua(mu)));
      m.than.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'dong'));
    }
  }

  /** Ảnh phủ vừa khít khung (kiểu CSS background-size: cover), canh giữa, rồi đặt 9 ghim theo đúng tỉ lệ đó.
   *  Gọi lại ở requestAnimationFrame vì lúc vừa chuyển màn hình, el.khung.clientHeight đôi khi còn đọc non (0 / bằng màn trước). */
  function datAnhVaGhim() {
    var caoKhung = el.khung.clientHeight, rongKhung = 360;
    if (!caoKhung) { requestAnimationFrame(datAnhVaGhim); return; }
    var tiLe = Math.max(rongKhung / ANH_W, caoKhung / ANH_H);
    var rongAnh = ANH_W * tiLe, caoAnh = ANH_H * tiLe;
    var dichX = (rongKhung - rongAnh) / 2, dichY = (caoKhung - caoAnh) / 2;
    el.bd.style.width = rongAnh + 'px'; el.bd.style.height = caoAnh + 'px';
    el.bd.style.left = dichX + 'px'; el.bd.style.top = dichY + 'px';
    var tiLeGhim = TY_LE_THIET_KE * tiLe;                              // toạ độ thiết kế (1080) → px màn hình

    el.bd.innerHTML = '';
    TRAM.forEach(function (tr) {
      var mu = App.dsMua().filter(function (x) { return x.ma === tr.ma; })[0]; if (!mu) return;
      var laHien = !mu.an || App.moHet;                                // mùa ẩn (chưa dựng): vẫn có ghim, khoá
      var so = /^mua-(\d)$/.exec(mu.ma), x = tr.x * tiLeGhim, y = tr.y * tiLeGhim;
      var bn = nutMua(mu, tr, so ? +so[1] : null, laHien);
      bn.style.left = x + 'px'; bn.style.top = y + 'px';
      el.bd.appendChild(bn);
    });
    Ve.hydrate(el.bd);
  }

  function ve() {
    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));

    datAnhVaGhim();
    requestAnimationFrame(datAnhVaGhim);                                // tự sửa nếu lần đo đầu (trên) bắt hụt chiều cao thật

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
  }

  /** Ghim một mùa: CHỈ vòng tròn — ảnh mặt người nhờ (viền màu tr.mau) hay ổ khoá. Chạm → moChiTiet (hộp tên + sao / nút). */
  function nutMua(mu, tr, so, laHien) {
    var mo = laHien && App.muaMo(mu), khoa = !mo;
    var b = h('div', 'g-nut ' + (!laHien ? 'sap' : khoa ? 'khoa' : 'mo'));
    b.setAttribute('data-mua', mu.ma); b.setAttribute('role', 'button'); b.setAttribute('aria-label', (so ? t('goi.muaSo', { n: so }) + ' ' : '') + mu.ten);
    var tron = h('div', 'g-tron'); tron.style.setProperty('--mau-mua', tr.mau);
    if (khoa) { var lk = h('span'); lk.setAttribute('data-i', 'lock'); lk.setAttribute('data-s', '1.3'); tron.appendChild(lk); }
    else { var anh = h('img', 'g-tron-anh'); anh.src = 'phim-clb/a/nguoi/' + tr.nguoi + '.webp'; anh.alt = ''; tron.appendChild(anh); }
    b.appendChild(tron);
    Ve.hydrate(b);
    b.addEventListener('click', function () { moChiTiet(mu, tr, so, laHien); });
    return b;
  }

  window.ChonMua = { dung: dung, ve: ve, thongBao: thongBao, loiMua: loiMua, moMua: moMua };
})();
