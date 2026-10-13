/* ============================================================================
   man-choi.js — "Đường học": MÀN CHƠI (window.Choi).
   Sân + cột nút ▶ ⏭ ↺ 💡 + đồng hồ NHỊP; nửa dưới: CHƯƠNG TRÌNH (10 ô) | KHỐI LỆNH.
   Chạy = ChamHoc.cham(...) rồi phát lại `vet`. Mọi luật và lời chẩn đoán đến từ lõi.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var E = {};                 // phần tử
  var S = {
    man: null, bai: null, ket: null, vet: null, idx: 0, nhip: 0, busy: false, rid: 0,
    toc: 1, goiYi: 0, cdi: 0, cd: [], si: 0, ed: null, pal: null, field: null, khung: null
  };
  var NHIP_MS = 230, LENH_MS = 45;

  /* ------------------------------------------------------------ dựng DOM */
  function dung(host) {
    E.host = host;
    var deco = host.querySelector('.deco');
    var html =
      '<div class="top">' +
        '<div class="plaque"><span class="n"></span><span class="d"></span><span class="t"></span></div>' +
        '<div class="stars"></div>' +
        '<button class="bt g-pu menu" data-nut="menu" aria-label="' + t('choi.menu') + '"><span data-i="menu" data-s="2" data-l="#2f1a6a"></span></button>' +
      '</div>' +
      '<div class="fblock">' +
        '<div class="ffr"><canvas class="tex" id="field"></canvas><div class="toast"></div><div class="bong" data-nut="bong"></div></div>' +
        '<div class="side">' +
          '<button class="bt g-gr cbtn" data-nut="chay"><span data-i="play" data-s="2" data-l="#14561e"></span>' + t('choi.chay') + '</button>' +
          '<button class="bt g-yl cbtn dark" data-nut="nhip"><span data-i="step" data-s="2" data-l="#6a4400"></span>' + t('choi.nhip') + '</button>' +
          '<button class="bt g-bl cbtn" data-nut="lai"><span data-i="reset" data-s="2" data-l="#0f2f6a"></span>' + t('choi.lai') + '</button>' +
          '<button class="bt g-pu cbtn" data-nut="goi-y"><span data-i="bulb" data-s="2" data-l="#2f1a6a"></span>' + t('choi.goiY') + '</button>' +
          '<div class="mini"><button class="bt g-wd" data-nut="toc"></button><button class="bt g-cy" data-nut="de-bai">' + t('choi.deBai') + '</button></div>' +
          '<div class="clock chalk"><span class="l">' + t('choi.nhipDong') + '</span><span class="v">0</span>' +
            '<span class="lamps"><span class="lamp lt">' + t('choi.banhTrai') + '</span><span class="lamp lp">' + t('choi.banhPhai') + '</span></span></div>' +
        '</div>' +
      '</div>' +
      '<div class="low">' +
        '<div class="pan p-prog" id="pan-main"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="tt">' + t('choi.chuongTrinh') + '</span><span class="ct">0/10</span>' +
            '<button class="bt g-rd del" data-nut="xoa-dong" aria-label="' + t('choi.xoaDong') + '"><span data-i="del" data-s="1" data-l="#5a1010"></span></button>' +
            '<button class="bt g-wd del" data-nut="xoa-het" aria-label="' + t('choi.xoaHet') + '"><span data-i="trash" data-s="1" data-l="#3a2008"></span></button></div>' +
            '<div class="rows"></div></div></div>' +
        '<div class="pan p-pal"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="tt">' + t('choi.khoiLenh') + '</span></div><div class="pal"></div></div>' +
          '<div class="bong duoi" data-nut="bong-duoi"></div></div>' +
      '</div>' +
      '<div class="ovwrap"><div class="ws-ov"></div></div>';
    deco.insertAdjacentHTML('afterend', html);
    Ve.hydrate(host);
    var q = function (s) { return host.querySelector(s); };
    E.n = q('.plaque .n'); E.t = q('.plaque .t'); E.sao = q('.top .stars');
    E.toast = q('.toast'); E.bong = q('.ffr .bong'); E.bongD = q('.p-pal .bong'); E.clock = q('.clock .v'); E.side = q('.side');
    E.btnToc = q('[data-nut="toc"]'); E.ov = q('.ws-ov');

    S.field = new SanVe.Field(q('#field'), { kich: 210, lamps: { T: q('.lamp.lt'), P: q('.lamp.lp') } });
    S.field.onRung = function () { E.ffr.classList.remove('rung'); void E.ffr.offsetWidth; E.ffr.classList.add('rung'); };
    E.ffr = q('.ffr');

    S.ed = new TP.Editor(q('.p-prog .rows'), {
      tong: 10, dung: 10, lay: function () { return S.bai ? S.bai.chinh : []; }, bang: q('#pan-main'), dem: q('.p-prog .ct'),
      khiDoi: khiDoi, khiKhoa: function () { toast(t('choi.khoaO'), 'bad'); }, khiBam: function () { anBongD(); }
    });
    S.pal = new TP.Palette(q('.pal'), {
      khiChen: function (txt) { if (!S.ed.chen(txt)) toast(t('choi.dayKhung'), 'bad'); },
      khiSua: function (loai, ten) { Xuong.mo(loai, ten); },
      khiMoi: function () { Xuong.moiHam(function (ten) { Xuong.mo('em', ten); }); }
    });

    Xuong.dung(E.ov, {
      man: function () { return S.man; }, bai: function () { return S.bai; },
      toc: function () { return S.toc; },
      khiDoiHam: function () { khiDoiHamKho(); },
      khiVe: function () { khiDoiHamKho(); S.pal.vua(); },
      baoLoi: function (s) { toast(s, 'bad'); }
    });

    q('[data-nut="menu"]').addEventListener('click', function () { roi(); App.veChon(); });
    q('[data-nut="chay"]').addEventListener('click', function () { chay(false); });
    q('[data-nut="nhip"]').addEventListener('click', function () { chay(true); });
    q('[data-nut="lai"]').addEventListener('click', function () { datLaiChay(); });
    q('[data-nut="goi-y"]').addEventListener('click', goiY);
    q('[data-nut="de-bai"]').addEventListener('click', function () { hienDeBai(); });
    E.btnToc.addEventListener('click', function () { S.toc = S.toc === 1 ? 2 : 1; veToc(); });
    q('[data-nut="xoa-dong"]').addEventListener('click', function () { S.ed.xoaDong(); });
    q('[data-nut="xoa-het"]').addEventListener('click', function () {
      if (!S.bai.chinh.length) return;
      TP.Hop.xacNhan({ noiDung: t('choi.xoaHetHoi'), co: t('choi.xoaHetCo') }).then(function (ok) { if (ok) S.ed.xoaHet(); });
    });
    E.bong.addEventListener('click', function () { anBongTren(); });
    E.bongD.addEventListener('click', function () { anBongD(); });
    veToc();
  }

  function veToc() { E.btnToc.textContent = t('choi.toc', { n: S.toc }); E.btnToc.setAttribute('data-toc', S.toc); }

  /* -------------------------------------------------------------- vào màn */
  function sao3(n) {
    E.sao.innerHTML = '';
    for (var i = 0; i < 3; i++) E.sao.appendChild(Ve.sao(i < n, 2));
  }
  function nhanBan(m) {
    // bài làm: bản nháp nếu có, nếu không thì mã mẫu của màn
    var nhap = Luu.docNhap(m.id);
    if (nhap) {
      // hàm của màn mà màn cho sẵn thì luôn phải có mặt (bản nháp hỏng / cũ có thể thiếu)
      (m.maMau.hamCuaMan || []).forEach(function (f) {
        if (!nhap.hamCuaMan.some(function (x) { return x.ten === f.ten; })) nhap.hamCuaMan.push({ ten: f.ten, thamSo: (f.thamSo || []).slice(), than: f.than.slice() });
      });
      return nhap;
    }
    return {
      chinh: m.maMau.chinh.slice(),
      hamCuaMan: (m.maMau.hamCuaMan || []).map(function (f) { return { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: f.than.slice() }; })
    };
  }
  function vao(m) {
    roi(); anBongD();
    S.man = m; S.bai = nhanBan(m); S.ket = null; S.goiYi = 0;
    var k = KhungCode.khungDayDu(m.khung);
    S.khung = k;
    var dung = KhungCode.soODung(k);
    E.n.textContent = m.id; E.t.textContent = m.ten;
    E.host.querySelector('.lamps').style.display = (m.loaiRobot === 'nhen') ? 'none' : '';
    E.host.querySelector('.plaque .d').style.display = '';
    sao3(Luu.saoTot(m.id));
    S.si = 0;
    S.field.nap(cauHinhSan(0));
    S.ed.nap(function () { return S.bai.chinh; }, dung.chinh);
    S.ed.datLoi([]);
    veKho();
    E.clock.textContent = '0';
    E.side.classList.remove('busy');
    E.ov.classList.remove('open');
    TP.Hop.dong();
    hienDeBai();
  }
  function cauHinhSan(i) {
    var m = S.man, nhieu = Array.isArray(m.san[0]);
    return {
      san: nhieu ? m.san[i] : m.san,
      batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau,
      loaiRobot: m.loaiRobot || 'banh'
    };
  }
  function veKho() {
    var m = S.man;
    S.pal.dung({
      goc: m.hamGoc,
      em: (m.moXuong !== false && !m.camHamCuaEm) ? KhoHam.ds() : null,
      man: S.bai.hamCuaMan,
      coNutMoi: true
    });
  }
  /** Kho hàm hoặc hàm của màn đổi (từ Xưởng / hộp đặt tên): vẽ lại kho khối, hủy lượt chạy. */
  function khiDoiHamKho() {
    datLaiChay();
    veKho();
    Luu.ghiNhap(S.man.id, S.bai);
  }

  /** Rời màn: dừng phát lại. */
  function roi() {
    S.rid++; S.busy = false;
    if (E.side) E.side.classList.remove('busy');
  }

  /* ---------------------------------------------------------------- toast */
  var toastHen = null;
  function toast(chu, kieu, ms) {
    var tt = E.toast; tt.textContent = chu; tt.className = 'toast show ' + (kieu || '');
    clearTimeout(toastHen);
    if (ms !== 0) toastHen = setTimeout(function () { tt.className = 'toast'; }, ms || 2200);
  }
  function anToast() { clearTimeout(toastHen); E.toast.className = 'toast'; }

  /* ------------------------------------------------------------- bong bóng */
  // Đề bài / gợi ý: bong bóng đè lên sân (E.bong). Chẩn đoán sau khi chạy: bong bóng đè lên cột KHỐI LỆNH (E.bongD),
  // để sân (robot dừng ở đâu) và dòng code tô đỏ ở cột CHƯƠNG TRÌNH vẫn thấy được.
  function bong(o) { TP.bongVe(E.bong, o); }
  function anBongTren() { TP.bongAn(E.bong); }
  function anBongD() { TP.bongAn(E.bongD); }
  function anBong() { anBongTren(); anBongD(); }
  function hienDeBai() { bong({ kieu: 'de', tieuDe: S.man.id + ' · ' + S.man.ten, chu: S.man.deBai }); }
  function goiY() {
    var ds = S.man.goiY || [];
    if (!ds.length) { bong({ kieu: 'goi', tieuDe: t('choi.goiY'), chu: t('choi.khongGoiY') }); return; }
    var i = S.goiYi % ds.length; S.goiYi++;
    bong({ kieu: 'goi', tieuDe: t('choi.goiYSo', { i: i + 1, n: ds.length }), chu: ds[i] });
  }
  function hienChanDoan() {
    var ds = S.cd;
    if (!ds.length) return;
    var i = S.cdi, c = ds[i];
    TP.bongVe(E.bongD, {
      kieu: c.muc === 'loi' ? 'loi' : 'tin', tieuDe: t(c.muc === 'loi' ? 'choi.chanDoan' : 'choi.thongTin'), chu: c.loi,
      ma: ds.map(function (x) { return x.ma; }).join(' '),
      pager: ds.length > 1 ? {
        i: i + 1, n: ds.length,
        truoc: function () { S.cdi = (S.cdi + ds.length - 1) % ds.length; hienChanDoan(); },
        sau: function () { S.cdi = (S.cdi + 1) % ds.length; hienChanDoan(); }
      } : null
    });
    E.bongD.setAttribute('data-ca', c.ma);
    // mũi tên sang dòng code bị tô đỏ (nếu lỗi có vị trí dòng)
    var dong = null;
    [c.cho, c.choTruoc].forEach(function (cho) { if (dong === null && cho && cho.cot === 'chinh' && cho.dong > 0) dong = cho.dong - 1; });
    TP.bongMui(E.bongD, dong === null ? null : S.ed.hangEl(dong));
  }

  /* ----------------------------------------------------------- sửa chương trình */
  function khiDoi() {
    Luu.ghiNhap(S.man.id, S.bai);
    datLaiChay();
    veKho();
  }

  /* -------------------------------------------------------------- chạy / phát lại */
  function datLaiChay() {
    S.rid++; S.busy = false; S.ket = null; S.vet = null; S.idx = 0; S.nhip = 0;
    E.side.classList.remove('busy');
    E.clock.textContent = '0';
    if (S.si !== 0 && Array.isArray(S.man.san[0])) { S.si = 0; S.field.nap(cauHinhSan(0)); } else S.field.datLai();
    S.ed.datChay(null); S.ed.datLoi([]); S.pal.datSang(null); S.pal.datLoi([]);
    anToast(); anBong();
  }
  function chuanBi() {
    S.ket = ChamHoc.cham(S.man, { chinh: S.bai.chinh, hamCuaMan: S.bai.hamCuaMan }, KhoHam.ds());
    var nhieu = Array.isArray(S.man.san[0]);
    var si = 0;
    if (nhieu) { var k = S.ket.theoSan.map(function (x) { return x.thang; }).indexOf(false); si = k < 0 ? 0 : k; }
    S.si = si;
    S.field.nap(cauHinhSan(si));
    S.vet = S.ket.vet; S.idx = 0; S.nhip = 0;
    E.clock.textContent = '0';
  }
  async function chay(tungNhip) {
    if (S.busy) return;
    if (!S.ket) chuanBi();
    else if (S.idx >= S.vet.length) { datLaiChay(); chuanBi(); }
    anBong(); anToast();
    S.ed.datLoi([]); S.pal.datLoi([]);
    var my = ++S.rid; S.busy = true; E.side.classList.add('busy');
    var vet = S.vet;
    while (S.idx < vet.length) {
      var e = vet[S.idx++];
      if (e.loai === 'lenh') {
        sang(e);
        await SanVe.ngu(LENH_MS / S.toc); if (my !== S.rid) return;
      } else {
        await S.field.phatNhip(e, NHIP_MS / S.toc); if (my !== S.rid) return;
        S.nhip++; E.clock.textContent = String(S.nhip);
        if (tungNhip) {
          if (S.idx >= vet.length) break;
          S.busy = false; E.side.classList.remove('busy');
          return;
        }
      }
    }
    sang(null);
    S.busy = false; E.side.classList.remove('busy');
    ketThuc();
  }

  function sang(e) {
    if (!e) { S.ed.datChay(null); S.pal.datSang(null); return; }
    var chuoi = [e.cho].concat(e.ngan || []), dong = null;
    chuoi.forEach(function (c) { if (c && c.cot === 'chinh') dong = c.dong - 1; });
    S.ed.datChay(dong);
    if (e.cho && (e.cho.cot === 'hamEm' || e.cho.cot === 'hamMan')) S.pal.datSang(e.cho.cot === 'hamEm' ? 'em' : 'man', e.cho.ten);
    else S.pal.datSang(null);
  }

  function ketThuc() {
    var k = S.ket;
    if (k.thang) {
      S.field.mungThang();
      var tot = Luu.ghiSao(S.man.id, k.sao);
      sao3(tot);
      var my = S.rid;
      setTimeout(function () { if (my === S.rid) bangThang(); }, 750);
      return;
    }
    // chưa thắng: bong bóng chẩn đoán (lỗi trước, thông tin sau), đánh dấu dòng / khối
    var loi = k.chanDoan.filter(function (c) { return c.muc === 'loi'; });
    var tin = k.chanDoan.filter(function (c) { return c.muc !== 'loi'; });
    S.cd = loi.concat(tin); S.cdi = 0;
    var rows = [], bricks = [], conTran = false;
    S.cd.forEach(function (c) {
      [c.cho, c.choTruoc].forEach(function (cho) {
        if (!cho) return;
        if (cho.cot === 'chinh' && cho.dong > 0) rows.push(cho.dong - 1);
        else if (cho.cot === 'hamEm' && cho.ten) bricks.push('em:' + cho.ten);
        else if (cho.cot === 'hamMan' && cho.ten) bricks.push('man:' + cho.ten);
      });
      if (c.ma === 'tran-khung') {
        conTran = true;
        if (c.cot === 'hamEm') bricks.push('em:' + c.ten); else if (c.cot === 'hamMan') bricks.push('man:' + c.ten);
      }
    });
    S.ed.datLoi(rows); S.pal.datLoi(bricks);
    if (conTran && !bricks.length && S.cd.some(function (c) { return c.cot === 'chinh'; })) S.ed.nhay();
    if (!S.bai.chinh.length && !k.vet.length && !S.bai.hamCuaMan.length) toast(t('choi.trong'), 'bad');
    hienChanDoan();
    S.field.chopDo(200);
  }

  /* ------------------------------------------------------------- bảng thắng */
  function bangThang() {
    var m = S.man, k = S.ket, ss = m.sao || {};
    var okO = ss.o === undefined || k.soO <= ss.o, okN = ss.nhip === undefined || k.soNhip <= ss.nhip;
    var hop = TP.Hop.mo(t('thang.tieuDe'), 'hop-thang');
    hop.hop.setAttribute('data-sao', k.sao);
    var st = h('div', 'th-sao');
    for (var i = 0; i < 3; i++) { var w = h('span', 'th-s' + (i < k.sao ? ' on' : '')); w.appendChild(Ve.sao(i < k.sao, 4)); w.style.animationDelay = (0.15 + i * 0.22) + 's'; st.appendChild(w); }
    hop.than.appendChild(st);
    function dong(ok, chu) {
      var d = h('div', 'th-dong ' + (ok ? 'ok' : 'chua'));
      var ic = h('span', 'ic'); ic.appendChild(Ve.ico(ok ? 'check' : 'cross', 2, { fill: ok ? '#7cff86' : '#ff8a80', shade: ok ? '#3cc24a' : '#d04a40', line: '#0e2a14' }));
      d.appendChild(ic); d.appendChild(h('span', null, chu)); return d;
    }
    if (ss.o !== undefined) hop.than.appendChild(dong(okO, t('thang.o', { x: k.soO, y: ss.o })));
    if (ss.nhip !== undefined) hop.than.appendChild(dong(okN, t('thang.nhip', { x: k.soNhip, y: ss.nhip })));
    if (!okO) hop.than.appendChild(h('div', 'th-ghi', t('thang.thieuO')));
    else if (!okN) hop.than.appendChild(h('div', 'th-ghi', t('thang.thieuNhip')));
    else hop.than.appendChild(h('div', 'th-ghi tot', t('thang.duSao')));
    // thắng mà vẫn có lưu ý (vd. bánh bị gọi lại, hàm của màn che hàm của em): cho học sinh thấy
    var luu = k.chanDoan.slice(0, 2);
    if (luu.length) {
      var lw = h('div', 'th-luu'); lw.setAttribute('data-ma', k.chanDoan.map(function (x) { return x.ma; }).join(' '));
      lw.appendChild(h('span', 'k', t('choi.thongTin')));
      luu.forEach(function (x) { lw.appendChild(h('p', null, x.loi)); });
      hop.than.appendChild(lw);
    }
    if (m.huyHieu) {
      var hh = h('div', 'th-huy'); var hi = h('span'); hi.setAttribute('data-i', 'huyhieu'); hi.setAttribute('data-s', '3'); hh.appendChild(hi);
      var tx = h('div', 'tx'); tx.appendChild(h('div', 'k', t('thang.huyHieu'))); tx.appendChild(h('div', 'v', m.huyHieu.ten)); hh.appendChild(tx);
      hh.setAttribute('data-huy-hieu', m.huyHieu.ma);
      hop.than.appendChild(hh); Ve.hydrate(hh);
    }
    var tiep = App.manTiep(m);
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-wd', t('thang.choiLai'), function () { TP.Hop.dong(); datLaiChay(); }, 'choi-lai'));
    hang.appendChild(TP.Hop.nut('g-gr', tiep ? t('thang.manTiep') : t('thang.hetChuoi'), function () {
      TP.Hop.dong();
      if (tiep) App.vaoMan(tiep.id); else { roi(); App.veChon(); }
    }, 'man-tiep'));
    hop.than.appendChild(hang);
  }

  window.Choi = {
    dung: dung, vao: vao, roi: roi,
    trangThai: function () { return { man: S.man, bai: S.bai, ket: S.ket, busy: S.busy }; }
  };
})();
