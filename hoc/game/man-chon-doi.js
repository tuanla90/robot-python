var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-chon-doi.js — "Mật Lệnh Robot": MÀN CHỌN ĐỘI (window.ChonDoi), mùa 9 chương 1 (KE-HOACH-MUA-9-TO-HOP.md mục 7, 8, 8b; lõi ../lap-rap.js M9D1, cỗ máy ../co-may.js).
   Hiện TRƯỚC khi chơi một màn có man.chonDoi: mỗi robot em lập trình một KHE (Sola, Luna); bảng thẻ cỗ máy từ chonDoi.menu (hình robot ghép VeRobot, tên, một dòng "giỏi").
     · chạm khe → khe đó đang chọn; chạm thẻ → gắn cỗ máy cho khe đang chọn (chạm lại thẻ đang gắn = bỏ); xong một khe thì tự sang khe còn trống;
     · thẻ không hợp lệ cho khe đang chọn (trùng cỗ máy bạn kia khi màn cấm trùng) MỜ; chạm vào thì rung, ô lời báo lý do của LapRap.kiemChon;
     · robot khoá (man.doi[i].coDinh, máy khách R3): khe có hình + ổ khoá, không chọn được;
     · "Vào màn" sáng khi LapRap.kiemChon(man, chon).ok; bấm: Luu.ghiDoi rồi tuyChon.khiXong(chon). Nút Về gọi tuyChon.khiVe().
   Theo kiểu màn Lắp robot (man-lap.js): dùng lại lớp lr-* (choi.css, choi-vector.css), chỉ thêm vài lớp cd-* cho hàng khe.
   Dùng:  ChonDoi.dung(host) (một lần, ung-dung.js)  ·  ChonDoi.vao(man, { chon, khiXong(chon), khiVe() })  ·  App.vaoManDuLieu / App.doiDoi gọi.
   Chữ (doi.*) chưa có trong chu.js (ngoài phạm vi gói M9D2): tệp này điền vào CHU.vi nếu chưa có — chuyển sang chu.js khi soát chữ.
   ========================================================================== */
(function () {
  'use strict';

  var CHU_DOI = {
    'doi.tieuDe': 'Chọn đội',
    'doi.ve': 'Về',
    'doi.deBai': 'Đề bài',
    'doi.coMay': 'CỖ MÁY',
    'doi.vao': 'Vào màn',
    'doi.doi': 'Đổi đội',
    'doi.doiNhan': 'Đổi đội robot',
    'doi.chonCho': 'Chọn {ten} cho {ai}',
    'doi.boCho': 'Bỏ {ten} của {ai}',
    'doi.kheNhan': 'Chọn cỗ máy cho {ai}',
    'doi.kheTrong': 'Chưa chọn',
    'doi.khach': 'Khách',
    'doi.khachNhan': 'Máy khách {ten}: khoá, không chọn được',
    'doi.chamThe': 'Chạm thẻ để chọn cho {ai}.',
    'doi.dangDung': 'cho {ai}'
  };
  if (window.CHU && CHU.vi) Object.keys(CHU_DOI).forEach(function (k) { if (CHU.vi[k] === undefined) CHU.vi[k] = CHU_DOI[k]; });

  var h = TP.h;
  var E = {};
  var S = { m: null, chon: [], k: 0, tuyChon: null, loiHen: null, loiRieng: null };
  var TEN_BAN = ['Sola', 'Luna'];

  /** Tên người lái robot thứ i của đội: R1 Sola, R2 Luna (CLB); robot khác "R<i+1>". */
  function tenAi(i) { return TEN_BAN[i] || ('R' + (i + 1)); }
  function DS() { return LapRap.coMay().DS; }
  function em() { return LapRap.robotEm(S.m); }
  /** Màu đế robot thứ i (như lap-rap.js sonCua): R2 hồng Luna, R1 xanh Sola. */
  function sonCua(i) { var r = S.m.doi[i] || {}; return r.son || (r.robot && r.robot.son) || (i === 1 ? 'lam' : undefined); }
  /** Một dòng ngắn "giỏi gì" của cỗ máy (hai ý đầu của CoMay.DS[ma].gioi); không có thì câu "vượt" của thân. */
  function gioiNgan(d) {
    if (d.gioi) return d.gioi.split(',').slice(0, 2).map(function (s) { return s.trim(); }).join(', ');
    var th = LapRap.tim('than', d.than); return th ? th.vuot : '';
  }
  /** Hình robot của cỗ máy ma (hay cấu hình robot r) cỡ px CSS. */
  function hinh(cfg, px, son) {
    var cv; cfg = Object.assign({}, cfg); if (son) cfg.son = son;
    try { cv = VeRobot.veCo(cfg, {}, 0, px); } catch (e) { cv = null; }
    if (!cv) return null;
    var c = Ve.mk(cv, VeRobot.heSoCss(cv)); c.classList.add('lr-hinh');
    return c;
  }
  function cfgCua(ma) { var d = DS()[ma]; return d ? { than: d.than, tay: d.tay, camBien: d.camBien } : null; }

  /* ------------------------------------------------------------------ dựng DOM */
  function dung(host) {
    E.host = host;
    host.setAttribute('aria-label', t('doi.tieuDe'));
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    var top = h('div', 'top lr-top');
    E.ve = h('button', 'bt g-pu nav'); E.ve.setAttribute('data-nut', 'doi-ve'); E.ve.setAttribute('aria-label', t('doi.ve')); E.ve.title = t('doi.ve');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); E.ve.appendChild(ic);
    var pl = h('div', 'plaque');
    E.n = h('span', 'n'); E.t = h('span', 't');
    pl.appendChild(E.n); pl.appendChild(h('span', 'd')); pl.appendChild(E.t);
    E.de = h('button', 'bt g-te lr-de', t('doi.deBai')); E.de.setAttribute('data-nut', 'doi-de');
    top.appendChild(E.ve); top.appendChild(pl); top.appendChild(E.de);
    host.appendChild(top);

    E.bang = h('div', 'lr-bang chalk cd-bang');
    E.khes = h('div', 'cd-khes'); E.bang.appendChild(E.khes);
    host.appendChild(E.bang);
    E.loi = h('div', 'lr-loi cd-loi'); E.loi.setAttribute('data-nut', 'doi-loi'); E.loi.setAttribute('aria-live', 'polite');
    host.appendChild(E.loi);

    var khe = h('div', 'lr-khes cd-menu');
    var sec = h('div', 'lr-khe'); sec.setAttribute('data-khe', 'co-may');
    var hd = h('div', 'lr-khe-hd'); hd.appendChild(h('span', 'lr-khe-ten', t('doi.coMay'))); E.dang = h('span', 'lr-khe-dang'); hd.appendChild(E.dang);
    sec.appendChild(hd);
    E.hang = h('div', 'lr-hang'); E.hang.setAttribute('data-khe', 'co-may');
    sec.appendChild(E.hang);
    khe.appendChild(sec);
    host.appendChild(khe);

    E.xong = h('button', 'bt g-gr lr-xong'); E.xong.setAttribute('data-nut', 'doi-vao');
    host.appendChild(E.xong);
    Ve.hydrate(host);

    E.ve.addEventListener('click', function () { if (S.tuyChon && S.tuyChon.khiVe) S.tuyChon.khiVe(); });
    E.de.addEventListener('click', moDe);
    E.loi.addEventListener('click', function () { if (E.loi.classList.contains('de')) moDe(); });
    E.xong.addEventListener('click', xong);
    E.hang.addEventListener('wheel', function (ev) {                                    // con lăn chuột cuộn hàng thẻ theo chiều ngang (như man-lap.js)
      if (E.hang.scrollWidth <= E.hang.clientWidth + 1 || Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
      E.hang.scrollLeft += ev.deltaY; ev.preventDefault();
    }, { passive: false });
  }

  /* ----------------------------------------------------------------------- vào */
  /** Mở màn Chọn đội cho màn m (màn gốc có chonDoi). tuyChon: { chon (đội đang có, nếu còn hợp lệ), khiXong(chon), khiVe() }. */
  function vao(m, tuyChon) {
    S.m = m.manGoc || m; S.tuyChon = tuyChon || {};
    var so = LapRap.soChonCua(S.m), c = S.tuyChon.chon || Luu.docDoi(S.m.ma);
    if (!c || !LapRap.kiemChon(S.m, c).ok) c = [];
    S.chon = []; for (var i = 0; i < so; i++) S.chon.push(c[i] || null);
    S.k = Math.max(0, S.chon.indexOf(null));
    TP.Hop.dong();
    clearTimeout(S.loiHen); S.loiRieng = null;
    E.n.textContent = S.m.id || ''; E.t.textContent = S.m.ten || '';
    E.xong.classList.remove('rung');
    veThe();
    ve();
  }
  function ve() { veKhe(); veTheTrangThai(); veNut(); veLoi(); }

  /* ----------------------------------------------------------------- hàng khe */
  function veKhe() {
    var dsEm = em();
    E.khes.innerHTML = '';
    S.m.doi.forEach(function (r, i) {
      var k = dsEm.indexOf(i), khoa = k < 0 || k >= S.chon.length;
      var b = h(khoa ? 'div' : 'button', 'lr-the cd-khe' + (khoa ? ' khoa' : ''));
      b.setAttribute('data-robot', String(i + 1));
      var ma = khoa ? null : S.chon[k];
      var cfg = khoa ? (r.robot || null) : (ma ? cfgCua(ma) : null);
      var o = h('div', 'cd-hinh');
      var hi = cfg ? hinh(cfg, VeRobot.PX_O_PART * 1.5, sonCua(i)) : null;
      if (hi) o.appendChild(hi); else o.appendChild(Ve.ico('plus', 2, { fill: BM.xamV9, line: BM.bangV1, toi: BM.bangV1 }));
      b.appendChild(o);
      var ten = khoa ? t('doi.khach') : tenAi(i);
      b.appendChild(h('div', 'lr-the-ten cd-ai', ten));
      var tenMay = khoa ? ((DS()[CoMay_cua(r)] || {}).ten || '') : (ma ? DS()[ma].ten : t('doi.kheTrong'));
      b.appendChild(h('div', 'lr-the-vuot cd-may', tenMay));
      if (khoa) {
        var kh = h('span', 'cd-khoa'); kh.appendChild(Ve.khoa(1, true)); b.appendChild(kh);
        var nhan = t('doi.khachNhan', { ten: tenMay.toLowerCase() });
        b.setAttribute('aria-label', nhan); b.title = nhan; b.setAttribute('role', 'img');
      } else {
        var dang = k === S.k;
        b.classList.toggle('chon', dang);
        b.setAttribute('aria-pressed', dang ? 'true' : 'false');
        var nh = t('doi.kheNhan', { ai: ten }); b.setAttribute('aria-label', nh); b.title = nh;
        b.addEventListener('click', function () { S.k = k; datLoi(null); ve(); });
      }
      E.khes.appendChild(b);
    });
    E.dang.textContent = t('doi.dangDung', { ai: tenAi(dsEm[S.k]) });
  }
  /** Mã cỗ máy của robot khoá (theo thân). */
  function CoMay_cua(r) { return (r && r.robot && LapRap.coMay().cuaThan(r.robot.than)) || null; }

  /* --------------------------------------------------------------- bảng thẻ */
  function veThe() {
    E.hang.innerHTML = '';
    (S.m.chonDoi.menu || []).forEach(function (ma) {
      var d = DS()[ma]; if (!d) return;
      var b = h('button', 'lr-the cd-the'); b.setAttribute('data-ma', ma);
      var hd = h('div', 'lr-the-hd cd-the-hd');
      var o = h('span', 'lr-the-ic cd-the-hinh'); var hi = hinh(cfgCua(ma), VeRobot.PX_O_PART); if (hi) o.appendChild(hi);
      hd.appendChild(o);
      hd.appendChild(h('span', 'cd-ai-the'));                                          // tên bạn đang dùng cỗ máy này (Sola / Luna)
      b.appendChild(hd);
      b.appendChild(h('div', 'lr-the-ten', d.ten));
      b.appendChild(h('div', 'lr-the-vuot', gioiNgan(d)));
      var tick = h('span', 'lr-tick'); tick.appendChild(Ve.ico('check', 1, { fill: BM.xanhLaSangV1, shade: BM.xanhLaToiV1, line: BM.bangV3 })); b.appendChild(tick);
      b.addEventListener('click', function () { chon(ma, b); });
      E.hang.appendChild(b);
    });
  }
  /** Lựa chọn giả định: khe S.k = ma. Trả { ok, lyDo } — chỉ xét luật trùng / ngoài bảng (khe còn trống thì điền cỗ máy khác chưa dùng để kiemChon không kêu "thiếu"). */
  function thu(ma) {
    var hyp = S.chon.slice(); hyp[S.k] = ma;
    var menu = S.m.chonDoi.menu || [], du = hyp.map(function (x) {
      if (x) return x;
      var con = menu.filter(function (m) { return hyp.indexOf(m) < 0; });
      return con[0] || menu[0];
    });
    var r = LapRap.kiemChon(S.m, du);
    return { ok: r.ok || r.ma === 'thieu' || r.ma === 'thua', lyDo: r.lyDo, hyp: hyp };
  }
  function veTheTrangThai() {
    var dsEm = em(), ai = tenAi(dsEm[S.k]);
    Array.prototype.forEach.call(E.hang.querySelectorAll('.cd-the'), function (b) {
      var ma = b.getAttribute('data-ma'), ten = DS()[ma].ten, k = S.chon.indexOf(ma), dang = S.chon[S.k] === ma;
      var r = dang ? { ok: true } : thu(ma);
      b.classList.toggle('chon', k >= 0);
      b.classList.toggle('mo', !r.ok);
      b.setAttribute('aria-pressed', dang ? 'true' : 'false');
      var nh = dang ? t('doi.boCho', { ten: ten.toLowerCase(), ai: ai }) : t('doi.chonCho', { ten: ten.toLowerCase(), ai: ai });
      b.setAttribute('aria-label', nh + (r.ok ? '' : '. ' + r.lyDo));
      b.title = r.ok ? nh : r.lyDo;
      var dung = []; S.chon.forEach(function (x, j) { if (x === ma) dung.push(tenAi(dsEm[j])); });
      b.querySelector('.cd-ai-the').textContent = dung.join(' · ');
    });
  }
  function chon(ma, nut) {
    if (S.chon[S.k] === ma) { S.chon[S.k] = null; datLoi(null); ve(); return; }     // chạm lại thẻ đang gắn cho khe này: bỏ
    var r = thu(ma);
    if (!r.ok) { rung(nut); datLoi(r.lyDo, 'bad', 4200); return; }
    S.chon = r.hyp;
    var trong = S.chon.indexOf(null);
    if (trong >= 0) S.k = trong;                                                         // xong khe này: sang khe còn trống
    datLoi(null);
    ve();
  }

  /* --------------------------------------------------------------- lời + nút */
  function rung(el) { if (!el) return; el.classList.remove('rung'); void el.offsetWidth; el.classList.add('rung'); }
  function datLoi(chu, kieu, ms) {
    clearTimeout(S.loiHen);
    S.loiRieng = chu ? { chu: chu, kieu: kieu || '' } : null;
    if (chu && ms) S.loiHen = setTimeout(function () { S.loiRieng = null; veLoi(); }, ms);
    veLoi();
  }
  function veLoi() {
    if (!S.m) return;
    var kieu = '';
    E.loi.classList.remove('de', 'canh', 'bad');
    if (S.loiRieng) { TP.vanBan(E.loi, S.loiRieng.chu); kieu = S.loiRieng.kieu; }
    else if (S.chon.indexOf(null) >= 0) E.loi.textContent = t('doi.chamThe', { ai: tenAi(em()[S.k]) });
    else { TP.vanBan(E.loi, S.m.deBai || ''); kieu = 'de'; }
    if (kieu) E.loi.classList.add(kieu);
  }
  function veNut() {
    var r = LapRap.kiemChon(S.m, S.chon.filter(Boolean));
    E.xong.classList.toggle('khoa', !r.ok);
    E.xong.setAttribute('aria-disabled', r.ok ? 'false' : 'true');
    E.xong.innerHTML = '';
    E.xong.appendChild(h('span', 'lx-chu', t('doi.vao')));
    if (!r.ok) E.xong.appendChild(h('span', 'lx-phu', r.lyDo));
  }
  function xong() {
    var chon = S.chon.filter(Boolean), r = LapRap.kiemChon(S.m, chon);
    if (!r.ok) { rung(E.xong); datLoi(r.lyDo, 'bad', 4200); return; }
    Luu.ghiDoi(S.m.ma, chon);
    var cb = S.tuyChon && S.tuyChon.khiXong;
    if (cb) cb(chon.slice());
  }

  /* ----------------------------------------------------------------- đề bài */
  function moDe() {
    var m = S.m; if (!m) return;
    var hop = TP.Hop.mo((m.id ? m.id + ' · ' : '') + m.ten, 'hop-nho lr-hop-de');
    var khung = h('div', 'lr-hop-san'), cv = h('canvas', 'tex'), lm = SanHoc.lopMauCuaSan(m, 0), nhieu = Array.isArray(m.san[0]);
    var bd = (m.doi && m.doi[0] && m.doi[0].batDau) || (Array.isArray(m.batDau) ? m.batDau[0] : m.batDau);
    SanVe.thuSan(cv, nhieu ? m.san[0] : m.san, bd, 220, 160, { mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem, cuaNhip: lm.cuaNhip, nutBat: lm.nutBat, lua: lm.lua, vo: m.vo });
    khung.appendChild(cv);
    hop.than.appendChild(khung);
    hop.than.appendChild(TP.vanBan(h('div', 'hop-chu'), m.deBai || ''));
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-gr', t('chung.dong'), function () { TP.Hop.dong(); }, 'dong'));
    hop.than.appendChild(hang);
  }

  window.ChonDoi = { dung: dung, vao: vao, trangThai: function () { return { man: S.m, chon: S.chon.slice(), khe: S.k }; } };
})();
