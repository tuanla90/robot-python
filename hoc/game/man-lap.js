var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-lap.js — "Robot Chấn Hưng": MÀN LẮP ROBOT (window.LapRobot), chế độ lắp ráp (KE-HOACH-LAP-RAP.md, lõi ở ../lap-rap.js).
   Hiện TRƯỚC khi chơi một màn có man.lapRap: người chơi chọn part cho ba khe (THÂN · TAY · NÃO = cảm biến) dưới ngân sách xu rồi bấm "Lắp xong".
     · mỗi khe là một hàng thẻ lướt ngang: icon bộ phận + tên + giá (xu) + một dòng "vượt được gì"; khe màn không có thì ẩn; khe tay / não có thẻ "Không gắn" (trừ khe bắt buộc);
     · thẻ ghép không hợp lệ với các khe đang chọn thì MỜ; chạm vào thì thẻ rung, bảng báo lý do (lõi: LapRap.kiemGhep) và cách gỡ ("Bỏ tay kẹp trước nhé");
     · hình robot ghép ngay (VeRobot.ve → Part.ghep), hàng xu còn lại; vượt ngân sách thì nút "Lắp xong" khóa và nói thiếu bao nhiêu xu (LapRap.kiemCachLap);
     · Lắp xong: lưu cách lắp theo màn (Luu.ghiLap) rồi gọi tuyChon.khiXong(cach); ◀ gọi tuyChon.khiVe().
   Ô chữ cạnh robot (E.loi) là một chỗ duy nhất cho lời: mặc định là đề bài (chạm để xem đề bài + sân đầy đủ), khi cần thì đổi thành lý do ghép sai / thiếu xu.
   Khung thấp (≈640): bảng robot + xu + ba hàng thẻ; khung cao (điện thoại dài, ≥ 700): có thêm hàng "sân + đề bài" riêng.
   Dùng:  LapRobot.dung(host) (một lần, ung-dung.js)  ·  LapRobot.vao(man, { cach, khiXong, khiVe })  ·  App.vaoMan / App.lapLai gọi.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var E = {};
  var S = { m: null, cach: null, tuyChon: null, loiHen: null, loiRieng: null, keo: null, vuaKeo: 0, cao: false };
  var CAO_TU = 700;                                    // chiều cao khung (--sh) từ đây trở lên: có hàng sân + đề bài riêng
  var MAU_KHE = { than: BM.ngocToi, tay: BM.cam, camBien: BM.ngoc };
  var MAU_RIENG = { 'nam-cham': BM.doSangV6 };
  var XU_TOI_DA_ICON = 14;                             // quá số này thì chỉ ghi số, không vẽ từng đồng xu

  /* ------------------------------------------------------------------ dựng DOM */
  function dung(host) {
    E.host = host;
    host.setAttribute('aria-label', t('lap.tieuDe'));
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));

    var top = h('div', 'top lr-top');
    E.ve = h('button', 'bt g-pu nav'); E.ve.setAttribute('data-nut', 'lap-ve'); E.ve.setAttribute('aria-label', t('lap.ve'));
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); E.ve.appendChild(ic);
    var pl = h('div', 'plaque');
    E.n = h('span', 'n'); E.t = h('span', 't');
    pl.appendChild(E.n); pl.appendChild(h('span', 'd')); pl.appendChild(E.t);
    E.de = h('button', 'bt g-te lr-de', t('lap.deBai')); E.de.setAttribute('data-nut', 'lap-de');
    top.appendChild(E.ve); top.appendChild(pl); top.appendChild(E.de);
    host.appendChild(top);

    E.bang = h('div', 'lr-bang chalk');
    E.robot = h('div', 'lr-robot'); E.bang.appendChild(E.robot);
    var tt = h('div', 'lr-tt');
    var xuHang = h('div', 'lr-xu-hang');
    E.xu = h('div', 'lr-xu'); E.xuChu = h('div', 'lr-xu-chu');
    xuHang.appendChild(E.xu); xuHang.appendChild(E.xuChu);
    E.loi = h('div', 'lr-loi'); E.loi.setAttribute('data-nut', 'lap-loi');
    tt.appendChild(xuHang); tt.appendChild(E.loi);
    E.bang.appendChild(tt);
    host.appendChild(E.bang);

    E.hangDe = h('div', 'lr-hang-de chalk');          // chỉ hiện ở khung cao
    E.san = h('div', 'lr-san'); E.deDai = h('div', 'lr-de-dai');
    E.hangDe.appendChild(E.san); E.hangDe.appendChild(E.deDai);
    host.appendChild(E.hangDe);

    E.khes = h('div', 'lr-khes');
    host.appendChild(E.khes);

    E.xong = h('button', 'bt g-gr lr-xong'); E.xong.setAttribute('data-nut', 'lap-xong');
    host.appendChild(E.xong);
    Ve.hydrate(host);

    E.ve.addEventListener('click', function () {
      if (window.HuongDan && S.m) HuongDan.dung('man:' + S.m.ma);        // rời màn Lắp robot: hướng dẫn chưa xong thì lần sau còn
      if (S.tuyChon && S.tuyChon.khiVe) S.tuyChon.khiVe();
    });
    E.de.addEventListener('click', moDe);
    E.loi.addEventListener('click', function () { if (E.loi.classList.contains('de')) moDe(); });
    E.san.addEventListener('click', moDe);
    E.xong.addEventListener('click', xong);

    // kéo ngang bằng chuột (cảm ứng thì trình duyệt tự cuộn)
    window.addEventListener('pointermove', function (ev) {
      var k = S.keo; if (!k) return;
      var dx = (ev.clientX - k.x0) / k.k;
      if (Math.abs(dx) > 5) k.keo = true;
      if (k.keo) k.hang.scrollLeft = k.sl0 - dx;
    });
    function tha() { var k = S.keo; S.keo = null; if (k && k.keo) S.vuaKeo = Date.now(); }
    window.addEventListener('pointerup', tha);
    window.addEventListener('pointercancel', tha);
    window.addEventListener('resize', function () { setTimeout(datCao, 0); });                // sau khi ung-dung.js đặt lại --sh
  }

  /** Khung cao (điện thoại dài) hay thấp: đọc --sh mà ung-dung.js đặt. */
  function datCao() {
    var st = document.getElementById('stage'), sh = st ? parseFloat(st.style.getPropertyValue('--sh')) : 640;
    S.cao = (sh || 640) >= CAO_TU;
    if (!E.host) return;
    E.host.classList.toggle('cao', S.cao);
    if (S.m) { veDe(); veLoi(); }
  }

  /* ----------------------------------------------------------------------- vào */
  function hopLe(m, c) {
    var r = LapRap.kiemCachLap(m, c);
    return r.ok || r.ma === 'vuot-ngan-sach';        // vượt ngân sách vẫn giữ lại để người chơi bớt part
  }
  /** Mở màn Lắp robot cho màn m. tuyChon: { cach (cách lắp đang có, nếu còn hợp lệ), khiXong(cach), khiVe() }. */
  function vao(m, tuyChon) {
    S.m = m.manGoc || m; S.tuyChon = tuyChon || {};
    var c = LapRap.chuanCach(S.tuyChon.cach || Luu.docLap(S.m.ma));
    S.cach = c.than && hopLe(S.m, c) ? c : LapRap.cachMacDinh(S.m);
    TP.Hop.dong();
    clearTimeout(S.loiHen); S.loiRieng = null;
    E.n.textContent = S.m.id; E.t.textContent = S.m.ten;
    E.xong.classList.remove('rung');
    datCao();
    veKhe(true);
    ve();
    if (window.HuongDan) HuongDan.vaoMan(S.m);                         // hướng dẫn màn Lắp robot của màn (huong-dan-man.js, vd 'rap-nao.1'): sáng khe thân, thẻ part, thanh xu, nút Lắp xong
  }

  function ve() { veRobot(); veXu(); veKheTrangThai(); veNut(); veLoi(); }

  /* --------------------------------------------------------------------- robot */
  function veRobot() {
    var cfg = LapRap.cauHinhCua(S.cach), cv;
    E.robot.innerHTML = '';
    try { cv = VeRobot.veCo(cfg, {}, 0, 2 * VeRobot.PX_O_PART); } catch (e) { cv = null; }      // cỡ hiển thị: một ô 48 px CSS (pixel: bội số 2 như cũ; vector: đúng cỡ, nét theo pixel thiết bị)
    if (!cv) return;
    var c = Ve.mk(cv, VeRobot.heSoCss(cv));
    c.classList.add('lr-hinh');
    E.robot.appendChild(c);
    E.robot.classList.remove('doi'); void E.robot.offsetWidth; E.robot.classList.add('doi');
  }

  /* ------------------------------------------------------------------------ xu */
  function veXu() {
    var L = S.m.lapRap, ns = L.nganSach, gia = LapRap.giaCach(S.cach), con = ns - gia;
    E.xu.innerHTML = '';
    if (ns <= XU_TOI_DA_ICON) {
      for (var i = 0; i < ns; i++) E.xu.appendChild(xuIcon(i < con, 1));
    } else E.xu.appendChild(xuIcon(true, 1));
    E.xuChu.textContent = con >= 0 ? t('lap.xuCon', { n: con, tong: ns }) : t('lap.xuThieu', { n: -con });
    E.xuChu.classList.toggle('qua', con < 0);
    E.xu.classList.toggle('qua', con < 0);
  }
  function xuIcon(sang, s) {
    return Ve.ico('xu', s || 1, sang ? { fill: BM.vangV3, toi: BM.goSangV14, sang: BM.kem, line: BM.vienDam } : { fill: BM.xamToi2V4, toi: BM.xamToi2V5, sang: BM.xamToiV9, line: BM.denV4 });
  }

  /* ----------------------------------------------------------------- đề bài + sân */
  function veDe() {
    var m = S.m; if (!m) return;
    TP.vanBan(E.deDai, m.deBai || '');
    E.san.innerHTML = '';
    if (S.cao) E.san.appendChild(canvasSan(104, 96));
  }
  function canvasSan(rong, cao) {
    var m = S.m, nhieu = Array.isArray(m.san[0]), lm = SanHoc.lopMauCuaSan(m, 0), cv = h('canvas', 'tex');
    SanVe.thuSan(cv, nhieu ? m.san[0] : m.san, Array.isArray(m.batDau) ? m.batDau[0] : m.batDau, rong, cao, { mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem, cuaNhip: lm.cuaNhip, nutBat: lm.nutBat });
    return cv;
  }
  /** Hộp đề bài đầy đủ + sân. */
  function moDe() {
    var m = S.m; if (!m) return;
    var hop = TP.Hop.mo(m.id + ' · ' + m.ten, 'hop-nho lr-hop-de');
    var khung = h('div', 'lr-hop-san'); khung.appendChild(canvasSan(220, 160));
    hop.than.appendChild(khung);
    hop.than.appendChild(TP.vanBan(h('div', 'hop-chu'), m.deBai || ''));
    if (m.sao && m.sao.re) hop.than.appendChild(TP.vanBan(h('div', 'hop-chu nho'), t('lap.saoRe', { n: m.sao.nhip, g: m.sao.re.gia })));     // sao thứ ba: nhanh HOẶC rẻ (cham.js)
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-gr', t('chung.dong'), function () { TP.Hop.dong(); }, 'dong'));
    hop.than.appendChild(hang);
  }

  /* ------------------------------------------------------------------ ba khe */
  function mauThe(khe, ma) { return MAU_RIENG[ma] || MAU_KHE[khe]; }
  /** Dựng lại ba hàng thẻ (giữ vị trí cuộn của từng hàng, trừ khi vào màn). */
  function veKhe(moi) {
    var cu = {};
    if (!moi) Array.prototype.forEach.call(E.khes.querySelectorAll('.lr-hang'), function (hg) { cu[hg.getAttribute('data-khe')] = hg.scrollLeft; });
    E.khes.innerHTML = '';
    LapRap.dsKhe(S.m).forEach(function (khe) {
      var L = S.m.lapRap, bat = (L.phaiCo || []).indexOf(khe) >= 0;
      var sec = h('div', 'lr-khe'); sec.setAttribute('data-khe', khe);
      var hd = h('div', 'lr-khe-hd');
      hd.appendChild(h('span', 'lr-khe-ten', t('lap.khe.' + khe)));
      var dang = h('span', 'lr-khe-dang'); dang.setAttribute('data-dang', khe);
      hd.appendChild(dang);
      sec.appendChild(hd);
      var hang = h('div', 'lr-hang'); hang.setAttribute('data-khe', khe);
      var ds = (L[khe] || []).map(function (ma) { return LapRap.tim(khe, ma); }).filter(Boolean);
      if (khe !== 'than' && !bat) hang.appendChild(the(khe, null));
      ds.forEach(function (d) { hang.appendChild(the(khe, d)); });
      hang.addEventListener('wheel', function (ev) {                                   // con lăn chuột cuộn hàng thẻ theo chiều ngang
        if (hang.scrollWidth <= hang.clientWidth + 1 || Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
        hang.scrollLeft += ev.deltaY; ev.preventDefault();
      }, { passive: false });
      hang.addEventListener('pointerdown', function (ev) {
        if (ev.pointerType !== 'mouse' || ev.button) return;
        var r = hang.getBoundingClientRect();
        S.keo = { hang: hang, x0: ev.clientX, sl0: hang.scrollLeft, keo: false, k: hang.offsetWidth ? r.width / hang.offsetWidth : 1 };
      });
      sec.appendChild(hang);
      E.khes.appendChild(sec);
      if (cu[khe] !== undefined) hang.scrollLeft = cu[khe];
    });
  }
  /** Một thẻ part (d = null: thẻ "Không gắn"). */
  function the(khe, d) {
    var ma = d ? d.ma : null;
    var b = h('button', 'lr-the'); b.setAttribute('data-khe', khe); b.setAttribute('data-ma', ma || 'khong');
    var hd = h('div', 'lr-the-hd');
    var ic = h('span', 'lr-the-ic');
    ic.appendChild(Ve.ico(d ? d.icon : 'cross', 2, d ? DenBoPhan.mauIcon(mauThe(khe, ma), true) : { fill: BM.xamV9, line: BM.bangV1, toi: BM.bangV1 }));
    hd.appendChild(ic);
    var gia = h('span', 'lr-gia'); gia.appendChild(xuIcon(true, 1)); gia.appendChild(h('span', 'lr-gia-so', String(d ? d.gia : 0)));
    hd.appendChild(gia);
    b.appendChild(hd);
    b.appendChild(h('div', 'lr-the-ten', d ? d.ten : t('lap.khongGan')));
    b.appendChild(h('div', 'lr-the-vuot', d ? d.vuot : t('lap.khongGanMoTa')));
    var tick = h('span', 'lr-tick'); tick.appendChild(Ve.ico('check', 1, { fill: BM.xanhLaSangV1, shade: BM.xanhLaToiV1, line: BM.bangV3 })); b.appendChild(tick);
    b.addEventListener('click', function () { if (Date.now() - S.vuaKeo < 250) return; chon(khe, ma, b); });
    return b;
  }
  /** Cập nhật trạng thái thẻ (chọn / mờ) và tên đang chọn của từng khe, không dựng lại. */
  function veKheTrangThai() {
    Array.prototype.forEach.call(E.khes.querySelectorAll('.lr-the'), function (b) {
      var khe = b.getAttribute('data-khe'), ma = b.getAttribute('data-ma') === 'khong' ? null : b.getAttribute('data-ma');
      var hyp = Object.assign({}, S.cach); hyp[khe] = ma;
      var g = LapRap.kiemGhep(hyp), dang = (S.cach[khe] || null) === ma;
      b.classList.toggle('chon', dang);
      b.classList.toggle('mo', !g.ok);
      b.setAttribute('aria-pressed', dang ? 'true' : 'false');
      b.title = g.ok ? '' : g.lyDo;
    });
    Array.prototype.forEach.call(E.khes.querySelectorAll('[data-dang]'), function (sp) {
      var khe = sp.getAttribute('data-dang');
      sp.textContent = S.cach[khe] ? LapRap.tenCua(khe, S.cach[khe]) : (khe === 'than' ? '' : t('lap.khongGan'));
    });
  }

  /** Cách gỡ khi ghép sai: bỏ part ở khe kia (hay đổi thân). */
  function cachGo(khe, g) {
    var khac = (g.xung || []).filter(function (k) { return k !== khe && S.cach[k]; });
    var k = khac.filter(function (x) { return x !== 'than'; })[0] || khac[0];
    if (!k) return '';
    return k === 'than' ? t('lap.doiThan') : t('lap.boTruoc', { ten: LapRap.tenCua(k, S.cach[k]).toLowerCase() });
  }
  function chon(khe, ma, nut) {
    var cur = S.cach[khe] || null;
    if (cur === ma) {                                          // chạm lại thẻ đang chọn: bỏ part (trừ thân và khe bắt buộc)
      var bat = (S.m.lapRap.phaiCo || []).indexOf(khe) >= 0;
      if (khe === 'than' || bat || ma === null) return;
      ma = null;
    }
    var hyp = Object.assign({}, S.cach); hyp[khe] = ma;
    var g = LapRap.kiemGhep(hyp);
    if (!g.ok) {                                               // ghép sai: thẻ rung, bảng báo lý do và cách gỡ
      rung(nut);
      datLoi((g.lyDo + ' ' + cachGo(khe, g)).trim(), 'bad', 4200);
      return;
    }
    S.cach = LapRap.chuanCach(hyp);
    datLoi(null);
    ve();
  }

  /* --------------------------------------------------------------- lời + nút */
  function rung(el) { if (!el) return; el.classList.remove('rung'); void el.offsetWidth; el.classList.add('rung'); }
  /** Lời trong ô cạnh robot. chu null = trở về lời mặc định (đề bài; thiếu xu thì báo thiếu xu). ms: tự về mặc định sau ms mili giây. */
  function datLoi(chu, kieu, ms) {
    clearTimeout(S.loiHen);
    S.loiRieng = chu ? { chu: chu, kieu: kieu || '' } : null;
    if (chu && ms) S.loiHen = setTimeout(function () { S.loiRieng = null; veLoi(); }, ms);
    veLoi();
  }
  function veLoi() {
    if (!S.m) return;
    var r = LapRap.kiemCachLap(S.m, S.cach), kieu = '';
    E.loi.classList.remove('de', 'canh', 'bad');
    if (S.loiRieng) { TP.vanBan(E.loi, S.loiRieng.chu); kieu = S.loiRieng.kieu; }
    else if (r.ma === 'vuot-ngan-sach') { E.loi.textContent = t('lap.thieu', { n: r.thieu }); kieu = 'canh'; }
    else if (!r.ok) { E.loi.textContent = r.lyDo; kieu = 'canh'; }
    else if (S.cao) E.loi.textContent = t('lap.chonThe');
    else { TP.vanBan(E.loi, S.m.deBai || ''); kieu = 'de'; }
    if (kieu) E.loi.classList.add(kieu);
  }
  function veNut() {
    var r = LapRap.kiemCachLap(S.m, S.cach);
    E.xong.classList.toggle('khoa', !r.ok);
    E.xong.setAttribute('aria-disabled', r.ok ? 'false' : 'true');
    E.xong.innerHTML = '';
    E.xong.appendChild(h('span', 'lx-chu', t('lap.xong')));
    if (r.ma === 'vuot-ngan-sach') E.xong.appendChild(h('span', 'lx-phu', t('lap.xongThieu', { n: r.thieu })));
    else if (r.ma === 'thieu-khe' && r.khe) E.xong.appendChild(h('span', 'lx-phu', t('lap.xongCan', { khe: t('lap.khe.' + r.khe).toLowerCase() })));
  }
  function xong() {
    var r = LapRap.kiemCachLap(S.m, S.cach);
    if (!r.ok) { rung(E.xong); datLoi(r.ma === 'vuot-ngan-sach' ? t('lap.thieu', { n: r.thieu }) : r.lyDo, 'bad', 4200); return; }
    Luu.ghiLap(S.m.ma, S.cach);
    if (window.HuongDan) HuongDan.xongMan(S.m);                        // bấm Lắp xong = đã biết dùng màn này: dừng hướng dẫn và lưu cờ
    var cb = S.tuyChon && S.tuyChon.khiXong;
    if (cb) cb(Object.assign({}, S.cach));
  }

  window.LapRobot = { dung: dung, vao: vao, trangThai: function () { return { man: S.m, cach: S.cach && Object.assign({}, S.cach) }; } };
})();
