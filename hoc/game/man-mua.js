var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-mua.js — "Mật Lệnh Robot": MÀN CHỌN MÙA (window.ChonMua), BẢN ĐỒ CHIẾN DỊCH.
   Nền nen-doc/the-gioi.webp (720×1280, khung thiết kế 1080×1920). 9 biển trạm chiến dịch (.m-tram) đặt khớp
   lên 9 biển tên của ảnh gốc: bên trái là huy hiệu chân dung người nhờ (viền màu mùa), bên phải là thân biển
   ghi số mùa + tên nơi chốn + tiến độ sao (hoặc khoá nhỏ). Chạm trạm mở Thẻ Nhiệm Vụ Mùa (có chân dung, quy mô,
   thanh tiến độ sao và nút Đóng / chạm nền ngoài để thoát).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var GIU_LAU_MS = 2000;

  var ANH_W = 720, ANH_H = 1280;
  var TY_LE_THIET_KE = ANH_W / 1080;
  var NUA_RONG_TRAM = 60;

  /** 9 trạm chiến dịch khớp chính xác tâm 9 biển trắng trên the-gioi.webp (quy về hệ 1080×1920). */
  var TRAM = [
    { ma: 'mua-9', x: 684, y: 131, nguoi: 'thay-giao-viec', mau: BM.vecBrand },
    { ma: 'mua-1', x: 762, y: 330, nguoi: 'tu-nghi', mau: BM.vecVangToi },
    { ma: 'mua-2', x: 741, y: 522, nguoi: 'hanh-nghi', mau: BM.vecLoiDam },
    { ma: 'mua-3', x: 747, y: 698, nguoi: 'sau-nghi', mau: BM.vecLa },
    { ma: 'mua-4', x: 756, y: 908, nguoi: 'mai-nghi', mau: BM.vecDenToi },
    { ma: 'mua-5', x: 834, y: 1131, nguoi: 'ba-nghi', mau: BM.vecNgocDam },
    { ma: 'mua-6', x: 792, y: 1336, nguoi: 'lan-nghi', mau: BM.vecHongDam },
    { ma: 'mua-7', x: 795, y: 1557, nguoi: 'dung-nghi', mau: BM.vecTimDam },
    { ma: 'mua-8', x: 795, y: 1765, nguoi: 'phong-nghi', mau: BM.vecTroiDam }
  ];

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    el.khung = h('div', 'g-khung m-khung');
    el.bd = h('div', 'g-bd');
    el.khung.appendChild(el.bd);
    host.appendChild(el.khung);

    var dau = h('div', 'g-dau g-noi');
    el.ve = h('button', 'bt g-pu nav');
    el.ve.setAttribute('aria-label', t('goi.ve'));
    el.ve.setAttribute('data-nut', 've-dau');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); el.ve.appendChild(ic);

    el.sao = h('div', 'g-tong');
    el.sao.setAttribute('data-nut', 'tieu-de');
    el.sao.setAttribute('aria-label', t('chonMua.tieuDe'));
    dau.appendChild(el.ve);
    dau.appendChild(el.sao);
    host.appendChild(dau);

    el.duoi = h('div', 'g-duoi m-duoi');
    host.appendChild(el.duoi);
    el.tb = h('div', 'c-tb');
    host.appendChild(el.tb);
    Ve.hydrate(host);

    el.ve.addEventListener('click', function () { App.veDau(); });
    window.addEventListener('resize', function () {
      if (window.App && App.manHinh === 'mua') requestAnimationFrame(datAnhVaGhim);
    });

    var hen = null;
    el.sao.addEventListener('pointerdown', function () {
      clearTimeout(hen);
      hen = setTimeout(function () { hen = null; if (window.GoLoi) GoLoi.mo(App.chuong); }, GIU_LAU_MS);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (s) {
      el.sao.addEventListener(s, function () { clearTimeout(hen); hen = null; });
    });
  }

  var tbHen = null;
  function thongBao(chu) {
    el.tb.textContent = chu;
    el.tb.classList.add('hien');
    clearTimeout(tbHen);
    tbHen = setTimeout(function () { el.tb.classList.remove('hien'); }, 2600);
  }

  /** Lời báo mùa chưa mở (theo điều kiện `mo` của mùa). */
  function loiMua(mu) {
    if (!mu) return t('chon.khoaMua');
    var c = mu.mo || {};
    if (typeof c.sao === 'number') {
      var mt = App.dsMua().filter(function (x) { return x.ma === (c.mua || App.dsMua()[0].ma); })[0];
      return t('goi.khoaMuaSao', { sao: c.sao, mua: mt ? mt.ten : '', ten: mu.ten });
    }
    if (c.goi) {
      var g = App.goiTheoMa(c.goi);
      return t('goi.khoaMuaGoi', { goi: g ? g.ten : c.goi, ten: mu.ten });
    }
    return t('goi.khoaMua', { ten: mu.ten });
  }

  /** Gắn nút đóng góc phải và cho phép chạm vùng tối ngoài hộp để đóng nhanh. */
  function ganNutDongHop(m) {
    var td = m.hop.querySelector('.hop-td');
    if (td) {
      var nx = h('button', 'bt hop-dong-x');
      nx.setAttribute('type', 'button');
      nx.setAttribute('data-nut', 'dong-hop');
      nx.setAttribute('aria-label', t('chonMua.dong'));
      nx.title = t('chonMua.dong');
      nx.appendChild(Ve.ico('close', 1.4));
      nx.addEventListener('click', function () { TP.Hop.dong(); });
      td.appendChild(nx);
    }
    var lop = document.getElementById('lop-hop');
    if (lop) {
      lop.onclick = function (ev) {
        if (ev.target === lop && lop.querySelector('.hop-mua-ct, .hop-mua')) TP.Hop.dong();
      };
    }
  }

  /** Bảng mua một mùa bán riêng (mua thử: chưa nối thanh toán). */
  function moMua(mu, tr) {
    var goiCo = mu.goi.filter(function (g) { return !g.sapCo; });
    var soMan = goiCo.reduce(function (s, g) { return s + g.man.length; }, 0);
    var m = TP.Hop.mo(t('mua.tieuDe', { ten: mu.ten }), 'hop-nho hop-mua hop-mua-ct');
    m.hop.setAttribute('data-hop', 'mua');
    ganNutDongHop(m);
    if (tr) m.than.appendChild(khungNhanVat(mu, tr, null, false));
    m.than.appendChild(h('div', 'hop-chu', t('mua.noiDung', { ten: mu.ten, goi: goiCo.length, man: soMan })));
    m.than.appendChild(h('div', 'hop-chu canh m-ct-ghi', t('mua.thu')));
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-wd', t('mua.deSau'), function () { TP.Hop.dong(); }, 'de-sau'));
    hang.appendChild(TP.Hop.nut('g-gr', t('mua.nut', { gia: mu.ban.gia }), function () { TP.Hop.dong(); App.muaThu(mu.ma); }, 'mua-thu'));
    m.than.appendChild(hang);
  }

  /** Khối đầu hộp chi tiết mùa: chân dung nhân vật + nhãn mùa + quy mô gói/màn. */
  function khungNhanVat(mu, tr, so, daMo) {
    var goiCo = mu.goi.filter(function (g) { return !g.sapCo; });
    var soMan = goiCo.reduce(function (s, g) { return s + g.man.length; }, 0);
    var xongGoi = goiCo.filter(function (g) { return g.man.length && App.soQua(g) === g.man.length; }).length;

    var dau = h('div', 'm-ct-dau');
    dau.style.setProperty('--mau-mua', tr.mau);
    var khungAnh = h('div', 'm-ct-ava');
    var anh = h('img', 'g-tron-anh');
    anh.src = 'phim-clb/a/nguoi/' + tr.nguoi + '.webp';
    anh.alt = '';
    khungAnh.appendChild(anh);
    dau.appendChild(khungAnh);

    var chu = h('div', 'm-ct-chu');
    var nhan = so === 9 ? t('chonMua.clb') : so ? t('goi.muaSo', { n: so }) : t('chonMua.tieuDe');
    chu.appendChild(h('div', 'm-ct-nhan', nhan));
    chu.appendChild(h('div', 'm-ct-ten', mu.ten));
    if (goiCo.length) {
      var phu = daMo
        ? t('chonMua.tienDoGoi', { x: xongGoi, tong: goiCo.length }) + ' · ' + t('chonMua.quyMo', { goi: goiCo.length, man: soMan })
        : t('chonMua.quyMo', { goi: goiCo.length, man: soMan });
      chu.appendChild(h('div', 'm-ct-phu', phu));
    }
    dau.appendChild(chu);
    return dau;
  }

  /** Hộp chi tiết một trạm mùa: chân dung + thanh tiến độ sao ngang hàng + nút Vào mùa / Đóng. */
  function moChiTiet(mu, tr, so, laHien) {
    var tieu = t('chonMua.hopTieuDe');
    if (!laHien) {
      var m0 = TP.Hop.mo(tieu, 'hop-nho hop-mua-ct');
      ganNutDongHop(m0);
      m0.than.appendChild(khungNhanVat(mu, tr, so, false));
      m0.than.appendChild(h('div', 'hop-chu m-ct-khoa', t('chonMua.sapCoTb')));
      m0.than.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'dong'));
      return;
    }
    if (App.chuaMua(mu)) { moMua(mu, tr); return; }

    var mo = App.muaMo(mu);
    var m = TP.Hop.mo(tieu, 'hop-nho hop-mua-ct');
    ganNutDongHop(m);
    m.than.appendChild(khungNhanVat(mu, tr, so, mo));

    if (mo) {
      var saoDat = App.saoMua(mu.ma);
      var saoMax = mu.goi.reduce(function (s, g) { return s + (g.saoToiDa || 0); }, 0);
      var tien = h('div', 'm-ct-tien');
      var hangSao = h('div', 'm-ct-sao');
      hangSao.appendChild(Ve.sao(true, 1.6));
      hangSao.appendChild(h('span', 'm-ct-sao-so', saoMax ? (saoDat + ' / ' + saoMax) : String(saoDat)));
      tien.appendChild(hangSao);
      if (saoMax > 0) {
        var bar = h('div', 'm-ct-bar');
        var fill = h('div', 'm-ct-bar-fill');
        fill.style.width = Math.min(100, Math.round(saoDat * 100 / saoMax)) + '%';
        bar.appendChild(fill);
        tien.appendChild(bar);
      }
      m.than.appendChild(tien);

      var hang = h('div', 'hop-hang');
      hang.appendChild(TP.Hop.nut('g-gr', t('chonMua.vaoMua'), function () {
        TP.Hop.dong();
        App.mua = mu.ma;
        App.hien('goi');
      }, 'vao-mua'));
      m.than.appendChild(hang);
    } else {
      m.than.appendChild(h('div', 'hop-chu m-ct-khoa', loiMua(mu)));
      m.than.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'dong'));
    }
  }

  /** Mùa khuyến nghị chơi tiếp: mùa đầu tiên đã mở mà còn gói chưa qua hết. */
  function muaDangChoi() {
    var ds = App.dsMua();
    for (var i = 0; i < ds.length; i++) {
      var mu = ds[i];
      if (mu.ma === 'mua-an') continue;
      var laHien = !mu.an || App.moHet;
      if (!laHien || App.chuaMua(mu) || !App.muaMo(mu)) continue;
      var conGoi = mu.goi.some(function (g) { return !g.sapCo && App.soQua(g) < g.man.length; });
      if (conGoi) return mu.ma;
    }
    return null;
  }

  /** Ảnh phủ vừa khít khung (background-size: cover), đặt 9 biển trạm khớp 9 biển trắng trên ảnh gốc. */
  function datAnhVaGhim() {
    if (!el.khung) return;
    var caoKhung = el.khung.clientHeight, rongKhung = 360;
    if (!caoKhung) { requestAnimationFrame(datAnhVaGhim); return; }
    var tiLe = Math.max(rongKhung / ANH_W, caoKhung / ANH_H);
    var rongAnh = ANH_W * tiLe, caoAnh = ANH_H * tiLe;
    var dichX = (rongKhung - rongAnh) / 2, dichY = (caoKhung - caoAnh) / 2;
    el.bd.style.width = rongAnh + 'px';
    el.bd.style.height = caoAnh + 'px';
    el.bd.style.left = dichX + 'px';
    el.bd.style.top = dichY + 'px';
    var tiLeGhim = TY_LE_THIET_KE * tiLe;

    var maCur = muaDangChoi();
    el.bd.innerHTML = '';
    TRAM.forEach(function (tr) {
      var mu = App.dsMua().filter(function (x) { return x.ma === tr.ma; })[0];
      if (!mu) return;
      var laHien = !mu.an || App.moHet;
      var so = /^mua-(\d)$/.exec(mu.ma);
      var x = tr.x * tiLeGhim, y = tr.y * tiLeGhim;
      // Kẹp nhẹ để biển trạm không tràn mép phải khung 360px trên màn hình điện thoại rất cao (20:9)
      var xMan = x + dichX;
      if (xMan + NUA_RONG_TRAM > rongKhung - 6) x = (rongKhung - 6 - NUA_RONG_TRAM) - dichX;
      if (xMan - NUA_RONG_TRAM < 6) x = (6 + NUA_RONG_TRAM) - dichX;
      var bn = nutMua(mu, tr, so ? +so[1] : null, laHien, mu.ma === maCur);
      bn.style.left = Math.round(x) + 'px';
      bn.style.top = Math.round(y) + 'px';
      el.bd.appendChild(bn);
    });
    Ve.hydrate(el.bd);
  }

  function ve() {
    el.sao.innerHTML = '';
    el.sao.appendChild(Ve.sao(true, 2));
    el.sao.appendChild(h('span', null, String(App.tongSao())));

    datAnhVaGhim();
    requestAnimationFrame(datAnhVaGhim);

    el.duoi.innerHTML = '';
    if (window.SoLenh && window.SoLenhMan) {
      var bs = h('button', 'bt g-cy d-so m-so');
      bs.setAttribute('data-nut', 'so-lenh');
      bs.setAttribute('aria-label', t('chon.soLenh'));
      var ib = h('span');
      ib.setAttribute('data-i', 'book');
      ib.setAttribute('data-s', '2');
      ib.setAttribute('data-l', BM.xanhLo);
      bs.appendChild(ib);
      bs.appendChild(h('span', null, t('chon.soLenh')));
      bs.addEventListener('click', function () { SoLenhMan.mo(); });
      el.duoi.appendChild(bs);
    }
    if (window.GoLoi) GoLoi.nutBug(el.duoi);
    Ve.hydrate(el.duoi);
  }

  /** Một biển trạm mùa trên bản đồ thế giới: Huy hiệu chân dung trái + Thân biển tên nơi chốn phải. */
  function nutMua(mu, tr, so, laHien, laCur) {
    var mo = laHien && !App.chuaMua(mu) && App.muaMo(mu);
    var goiCo = mu.goi.filter(function (g) { return !g.sapCo; });
    var xongHet = mo && goiCo.length > 0 && goiCo.every(function (g) { return g.man.length && App.soQua(g) === g.man.length; });
    var trangThai = !laHien ? 'sap' : !mo ? 'khoa' : xongHet ? 'xong' : 'mo';

    var b = h('div', 'g-nut m-nut ' + trangThai + (laCur ? ' cur' : ''));
    b.setAttribute('data-mua', mu.ma);
    b.setAttribute('role', 'button');
    b.setAttribute('aria-label', (so ? t('goi.muaSo', { n: so }) + ' ' : '') + mu.ten);
    b.style.setProperty('--mau-mua', tr.mau);

    var the = h('div', 'm-tram');
    var ava = h('div', 'm-ava');
    var anh = h('img', 'g-tron-anh');
    anh.src = 'phim-clb/a/nguoi/' + tr.nguoi + '.webp';
    anh.alt = '';
    ava.appendChild(anh);
    if (!mo) {
      var lk = h('span', 'm-ava-khoa');
      lk.appendChild(Ve.khoa(1));
      ava.appendChild(lk);
    } else if (xongHet) {
      var ck = h('span', 'm-ava-xong');
      ck.appendChild(Ve.ico('check', 1));
      ava.appendChild(ck);
    }
    the.appendChild(ava);

    var bang = h('div', 'm-bang');
    var dongPhu = h('div', 'm-phu');
    dongPhu.appendChild(h('span', 'm-so-mua', so ? t('goi.muaSo', { n: so }) : ''));
    if (mo) {
      var cumSao = h('span', 'm-sao-nho');
      cumSao.appendChild(Ve.sao(true, 1));
      cumSao.appendChild(h('span', null, String(App.saoMua(mu.ma))));
      dongPhu.appendChild(cumSao);
    }
    bang.appendChild(dongPhu);
    bang.appendChild(h('div', 'm-ten', mu.ten));
    the.appendChild(bang);

    b.appendChild(the);
    Ve.hydrate(b);
    b.addEventListener('click', function () { moChiTiet(mu, tr, so, laHien); });
    return b;
  }

  window.ChonMua = { dung: dung, ve: ve, thongBao: thongBao, loiMua: loiMua, moMua: moMua };
})();
