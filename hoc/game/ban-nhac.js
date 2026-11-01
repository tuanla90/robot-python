var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ban-nhac.js — "Robot Chấn Hưng": BẢN NHẠC MỜ của màn loa & song ca (window.BanNhac; hoc/KE-HOACH-AM-NHAC.md).
   Dải nhạc nằm đè mép trên vùng sân: mỗi cột là một nhịp của điệu, khối màu là nốt (cao dần từ 1 Đô tới 8 Đô cao, màu như sóng âm của part loa), khối xám ở đáy là trống,
   cột trống là dấu lặng. Hỗ trợ cả màn 1 robot (chuỗi/mảng) lẫn màn 2 robot song ca ({ r1, r2 }).
   Nút "Nghe đề" (icon SVG Ve.ico('nhac')) phát điệu mẫu một lần (AmThanh.loa), vạch sáng chạy theo.
   Hỗ trợ phát nối Bài nhạc Chúc mừng Chiến thắng 9 đoạn (BanNhac.phatChienThang).
     BanNhac.dung(host)                     dựng dải nhạc trong host (một lần)
     BanNhac.nap(dieu, tuyChon)             nạp điệu (chuỗi "1 2 . x", { r1, r2 } hay null = ẩn dải); tuyChon.msNhip = nhịp phát mẫu (mặc định 400)
     BanNhac.datLai()                       về lúc chưa chơi
     BanNhac.nhip(e)                        cập nhật theo một mục 'nhip' của vết (e.dieuDung, sự kiện sai-not / lech-nhip / lo-nhip)
     BanNhac.dangNghe() / BanNhac.dungNghe() đang phát mẫu không / dừng phát mẫu
     BanNhac.phatChienThang(soDoan, tuyChon) nạp & phát nối Đoạn 1..soDoan của Bài nhạc Chúc mừng Chiến thắng
   ========================================================================== */
(function () {
  'use strict';

  var MAU_NOT = { 1: BM.vecDo, 2: BM.vecVanNong, 3: BM.vecVang, 4: BM.vecXanhLa, 5: BM.vecNgoc, 6: BM.vecCong1, 7: BM.vecCong2, 8: BM.vecHong, x: BM.vecSat };
  var TEN_NOT = { 1: 'Đô', 2: 'Rê', 3: 'Mi', 4: 'Fa', 5: 'Son', 6: 'La', 7: 'Si', 8: 'Đô cao', x: 'trống' };
  var E = {}, S = { dieu: null, doi: null, cot: [], ms: 400, nghe: 0 };

  function h(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function t(k) { return window.t ? window.t(k) : k; }

  function dung(host) {
    E.goc = h('div', 'bannhac'); E.goc.hidden = true;
    E.nut = h('button', 'bn-nghe'); E.nut.setAttribute('data-nut', 'nghe-de');
    E.nut.setAttribute('aria-label', t('choi.ngheDe')); E.nut.setAttribute('title', t('choi.ngheDe'));
    if (window.Ve && Ve.ico) E.nut.appendChild(Ve.ico('nhac', 1.4));
    E.cuon = h('div', 'bn-cuon'); E.hang = h('div', 'bn-hang');
    E.cuon.appendChild(E.hang); E.goc.appendChild(E.nut); E.goc.appendChild(E.cuon);
    host.appendChild(E.goc);
    E.nut.addEventListener('click', function (ev) { ev.stopPropagation(); if (S.nghe) dungNghe(); else nghe(); });
  }

  /** Khối của một tiếng am (1…8 hay 'x') trong cột: đáy cao dần theo nốt, trống nằm sát đáy. */
  function khoi(am, cls) {
    var k = h('i', 'bn-k ' + cls);
    k.style.bottom = (am === 'x' ? 2 : 6 + (am - 1) * 4) + 'px';
    k.style.background = MAU_NOT[am] || BM.vecVang;
    return k;
  }

  function nap(dieu, tuyChon) {
    dungNghe();
    S.ms = (tuyChon && tuyChon.msNhip) || 400;
    S.doi = (dieu && typeof dieu === 'object' && !Array.isArray(dieu) && SanHoc.docDieuDoi) ? SanHoc.docDieuDoi(dieu) : null;
    S.dieu = S.doi ? S.doi.r1 : (dieu ? SanHoc.docDieu(dieu) : null);
    if (!E.goc) return;
    E.goc.hidden = !S.dieu;
    E.goc.classList.toggle('song-ca', !!S.doi);
    E.hang.textContent = '';
    S.cot = [];
    (S.dieu || []).forEach(function (am, i) {
      var am2 = S.doi && S.doi.r2 ? S.doi.r2[i] : null;
      var c = h('span', 'bn-o' + (am === null && am2 === null ? ' lang' : ''));
      var nhan1 = am === null ? t('choi.dauLang') : TEN_NOT[am];
      var nhan2 = S.doi ? (' / R2: ' + (am2 === null ? t('choi.dauLang') : TEN_NOT[am2])) : '';
      c.title = (i + 1) + ': ' + (S.doi ? 'R1: ' : '') + nhan1 + nhan2;
      if (am !== null) c.appendChild(khoi(am, 'mo r1'));
      if (S.doi && am2 !== null) c.appendChild(khoi(am2, 'mo r2'));
      E.hang.appendChild(c); S.cot.push(c);
    });
    datLai();
  }

  function datLai() {
    S.cot.forEach(function (c) {
      c.classList.remove('da', 'sai', 'hien');
      var thua = c.querySelectorAll('.bn-k.choi');
      for (var i = 0; i < thua.length; i++) c.removeChild(thua[i]);
    });
    if (E.cuon) E.cuon.scrollLeft = 0;
  }

  /** Vạch sáng ở cột i (null = bỏ), cuộn cho cột đó hiện ra. */
  function sang(i) {
    S.cot.forEach(function (c, k) { c.classList.toggle('hien', k === i); });
    if (i === null || !S.cot[i]) return;
    var c = S.cot[i], x = c.offsetLeft - E.cuon.clientWidth / 2 + c.offsetWidth / 2;
    E.cuon.scrollLeft = Math.max(0, x);
  }

  function nhip(e) {
    if (!S.dieu || !e || e.loai !== 'nhip') return;
    var m0 = e.doi ? e.doi[0] : e;
    if (!m0) return;
    var du = m0.dieuDung || 0;
    S.cot.forEach(function (c, k) { c.classList.toggle('da', k < du); });
    var skNhip = e.doi ? [].concat((e.doi[0] && e.doi[0].suKien) || [], (e.doi[1] && e.doi[1].suKien) || []) : (e.suKien || []);
    var hong = skNhip.filter(function (s) { return s.ma === 'sai-not' || s.ma === 'lech-nhip' || s.ma === 'lo-nhip'; })[0];
    if (hong && S.cot[hong.viTri]) {
      var c = S.cot[hong.viTri];
      c.classList.add('sai');
      if (hong.choi !== null && hong.choi !== undefined) c.appendChild(khoi(hong.choi, 'choi'));
      sang(hong.viTri);
    } else sang(du > 0 ? du - 1 : null);
  }

  /** Phát điệu mẫu một lần: mỗi cột một nhịp S.ms, vạch chạy theo (màn song ca phát cả 2 bè R1 + R2). */
  function nghe() {
    if (!S.dieu) return;
    var my = ++S.nghe, i = 0;
    if (E.goc) E.goc.classList.add('dang-nghe');
    if (window.AmThanh && AmThanh.datCheDo) AmThanh.datCheDo('im');
    (function buoc() {
      if (my !== S.nghe) return;
      if (i >= S.dieu.length) { dungNghe(); return; }
      sang(i);
      var dai = S.ms * 0.85 / 1000;
      if (S.dieu[i] !== null && window.AmThanh && AmThanh.loa) AmThanh.loa(S.dieu[i], dai, 1);
      if (S.doi && S.doi.r2 && S.doi.r2[i] !== null && window.AmThanh && AmThanh.loa) AmThanh.loa(S.doi.r2[i], dai, 2);
      i++;
      setTimeout(buoc, S.ms);
    })();
  }

  function dungNghe() {
    if (!S.nghe) return;
    S.nghe = 0;
    if (E.goc) E.goc.classList.remove('dang-nghe');
    sang(null);
    if (window.AmThanh && AmThanh.datCheDo) AmThanh.datCheDo('soan');
  }
  function dangNghe() { return !!S.nghe; }

  /** Nạp & phát nối Đoạn 1..soDoan (1..9) của Bài nhạc Chúc mừng Chiến thắng trên dải nhạc. */
  function phatChienThang(soDoan, tuyChon) {
    if (!window.AmThanh || !AmThanh.DOAN_CHIEN_THANG) return;
    tuyChon = tuyChon || {};
    var ds = AmThanh.DOAN_CHIEN_THANG, k = Math.max(1, Math.min(ds.length, soDoan || ds.length));
    var tu = tuyChon.noi ? 0 : k - 1, r1 = [], r2 = [], i, j;
    for (i = tu; i < k; i++) {
      for (j = 0; j < ds[i].r1.length; j++) {
        r1.push(ds[i].r1[j]);
        r2.push(ds[i].r2[j]);
      }
    }
    nap({ r1: r1, r2: r2 }, { msNhip: tuyChon.msNhip || 220 });
    nghe();
  }

  window.BanNhac = { dung: dung, nap: nap, datLai: datLai, nhip: nhip, nghe: nghe, dungNghe: dungNghe, dangNghe: dangNghe, phatChienThang: phatChienThang, MAU_NOT: MAU_NOT };
})();
