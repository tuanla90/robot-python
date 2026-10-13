/* ============================================================================
   xuong-ham.js — "Đường học": XƯỞNG HÀM (window.Xuong).
   Lớp phủ trượt lên đè màn chơi. Từ trên xuống:
   - thanh trên: ‹ | TÊN HÀM to bằng font code (xanh lá = hàm của em, cam = hàm của màn) | 🗑 xóa hàm của em;
   - khối giữa: SÂN THỬ 5×5 cố định (cỡ như sân chính) + cột nút Thử / Lại / Đặt xe / Vật / Tường.
     Nút chế độ bật thì sáng viền, bấm lại để tắt; chạm ô sân để đặt xe (chạm xe thì xoay 90°),
     thêm / bớt vật (khối hàng), thêm / bớt tường. Cách sắp lưu RIÊNG từng hàm (Luu.docSanThu);
   - nửa dưới: khung thân hàm (tiêu đề là chữ `def`) + kho khối (Gốc, hàm khác của em, hàm của màn; không có chính nó).
   Chạy = ChamHoc.thuHam(..., { sanThu }) rồi phát lại vết; lỗi hiện ở bong bóng trên kho khối,
   chạy xong không lỗi thì toast "Xong: n nhịp" 2 giây ở đáy sân thử.
   Hộp đặt tên cho "＋ Hàm mới". Sửa hàm của em → KhoHam.sua + lưu ngay;
   sửa hàm của màn → chỉ vào bản nháp của màn.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var A = null;        // app: { man(), bai(), khiDoiHam(), khiVe(), toc() }
  var E = {};          // phần tử
  var S = { loai: null, ten: null, than: null, ed: null, pal: null, field: null, rid: 0, busy: false, ketThu: null, coBong: false, cdi: 0, st: null, che: null };
  var NHIP_MS = 230, LENH_MS = 45, TOAST_MS = 2000;
  var CHE = { xe: 'che-xe', vat: 'che-vat', tuong: 'che-tuong' };

  /* -------------------------------------------------------------- dựng DOM */
  function dung(host, app) {
    A = app; E.host = host;
    host.innerHTML =
      '<div class="deco"></div>' +
      '<div class="top"><button class="bt g-or menu" data-nut="ve" aria-label="' + t('xuong.ve') + '"><span data-i="back" data-s="2" data-l="#5a2f08"></span></button>' +
        '<div class="tenham chalk"><span class="nm"></span></div>' +
        '<button class="bt g-rd menu" data-nut="xoa-ham" aria-label="' + t('xuong.xoaHam') + '"><span data-i="trash" data-s="2"></span></button></div>' +
      '<div class="fblock">' +
        '<div class="ffr sua"><canvas class="tex"></canvas><div class="toast"></div></div>' +
        '<div class="side xu">' +
          '<button class="bt g-gr cbtn" data-nut="thu"><span data-i="play" data-s="2" data-l="#14561e"></span>' + t('xuong.thu') + '</button>' +
          '<button class="bt g-bl cbtn" data-nut="lai"><span data-i="reset" data-s="2" data-l="#0f2f6a"></span>' + t('xuong.lai') + '</button>' +
          '<button class="bt g-yl cbtn dark mode" data-nut="' + CHE.xe + '" data-che="xe"><span data-i="car" data-s="2" data-l="#6a4400"></span>' + t('xuong.datXe') + '</button>' +
          '<button class="bt g-or cbtn mode" data-nut="' + CHE.vat + '" data-che="vat"><span data-i="box" data-s="2" data-l="#5a2f08"></span>' + t('xuong.vat') + '</button>' +
          '<button class="bt g-gy cbtn mode" data-nut="' + CHE.tuong + '" data-che="tuong"><span data-i="wall" data-s="2" data-l="#2d3340"></span>' + t('xuong.tuong') + '</button>' +
        '</div></div>' +
      '<div class="low">' +
        '<div class="pan p-prog"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="tt code">' + t('xuong.def') + '</span>' +
            '<button class="bt g-rd del het" data-nut="xoa-het" aria-label="' + t('choi.xoaHet') + '"><span data-i="trash" data-s="2" data-l="#4a0e0c"></span></button></div>' +
            '<div class="rows"></div></div></div>' +
        '<div class="pan p-pal"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="tt">' + t('choi.khoiLenh') + '</span></div><div class="pal"></div></div>' +
          '<div class="bong duoi" data-nut="bong-duoi"></div></div>' +
      '</div>';
    Ve.hydrate(host);
    Ve.khungGo(host.querySelector('.deco'));
    var q = function (s) { return host.querySelector(s); };
    E.tenham = q('.tenham'); E.nm = q('.tenham .nm'); E.ffr = q('.ffr'); E.toast = q('.toast');
    E.side = q('.side'); E.xoaHam = q('[data-nut="xoa-ham"]');
    E.canvas = q('.ffr canvas'); E.bongD = q('.p-pal .bong');
    S.field = new SanVe.Field(E.canvas, { kich: 210 });
    S.field.onRung = function () { E.ffr.classList.remove('rung'); void E.ffr.offsetWidth; E.ffr.classList.add('rung'); };
    S.ed = new TP.Editor(q('.rows'), {
      tong: 10, dung: 10, lay: function () { return S.than || []; }, bang: q('.p-prog'),
      nutXoaHet: q('[data-nut="xoa-het"]'), dangChay: function () { return S.busy; },
      thutLe: function () { return TP.coCauTruc(A.man(), 'for'); },
      tt: q('.p-prog .tt'), ttDay: t('xuong.def'), ttNgan: t('xuong.def'),
      khiDoi: khiSuaThan, khiBam: function () { anBongD(); }
    });
    S.pal = new TP.Palette(q('.pal'), {
      khiChen: function (txt) { S.ed.chen(txt); },
      khiSua: function (loai, ten) { mo(loai, ten); }
    });
    TP.Keo.gan({ ed: S.ed, pal: S.pal, khiKeoDong: function () { anBongD(); }, dangChay: function () { return S.busy; } });
    q('[data-nut="xoa-het"]').addEventListener('click', function () {
      if (!S.than || !S.than.length) return;
      TP.Hop.xacNhan({ noiDung: t('choi.xoaHetHoi'), co: t('choi.xoaHetCo') }).then(function (ok) { if (ok) S.ed.xoaHet(); });
    });
    q('[data-nut="ve"]').addEventListener('click', dong);
    q('[data-nut="thu"]').addEventListener('click', thu);
    q('[data-nut="lai"]').addEventListener('click', lai);
    Object.keys(CHE).forEach(function (k) {
      q('[data-nut="' + CHE[k] + '"]').addEventListener('click', function () { if (!S.busy) datChe(S.che === k ? null : k); });
    });
    E.canvas.addEventListener('click', chamSan);
    E.xoaHam.addEventListener('click', xoaHam);
  }

  /* --------------------------------------------------------------- mở / đóng */
  function hamHienTai() {
    if (S.loai === 'em') return KhoHam.tim(S.ten);
    var m = A.bai().hamCuaMan.filter(function (f) { return f.ten === S.ten; })[0];
    return m || null;
  }
  function mo(loai, ten) {
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    S.loai = loai; S.ten = ten;
    var f = hamHienTai();
    if (!f) return;
    S.than = loai === 'em' ? f.than.slice() : f.than;        // hàm của màn: sửa thẳng vào bản nháp
    E.nm.textContent = ten + '(' + (f.thamSo || []).join(', ') + ')';
    E.host.setAttribute('data-loai', loai);                   // màu tên hàm: xanh lá (của em) / cam (của màn)
    E.host.setAttribute('data-ham', ten);
    E.xoaHam.style.display = loai === 'em' ? 'flex' : 'none';
    E.xoaHam.classList.toggle('nhat', loai === 'em' && KhoHam.tenCoDinh(ten));       // hàm theo cốt truyện: nút xóa mờ, chạm chỉ báo
    S.ed.nap(function () { return S.than; }, 10);
    S.st = ChamHoc.chuanSanThu(Luu.docSanThu(ten) || ChamHoc.SAN_THU_MAC_DINH);
    datChe(null);
    napSan();
    lamPal();
    xoaKetThu();
    anToast();
    TP.Chan.giu(TP.XUONG_MS + 300);
    E.host.classList.add('open');
    S.pal.vua();
    vuaTen();
  }
  /** Tên hàm dài thì co chữ cho vừa thanh (không cắt, không xuống dòng). */
  function vuaTen() {
    E.nm.style.fontSize = '';
    var s = parseFloat(getComputedStyle(E.nm).fontSize) || 24;
    while (E.tenham.scrollWidth > E.tenham.clientWidth + 1 && s > 10) { s -= 1; E.nm.style.fontSize = s + 'px'; }
  }
  function dong() {
    S.rid++; S.busy = false;
    TP.Chan.giu(TP.XUONG_MS + 300);
    E.host.classList.remove('open');
    E.host.removeAttribute('data-ham');
    A.khiVe();
  }
  function dangMo() { return E.host.classList.contains('open'); }

  function lamPal() {
    var man = A.man();
    S.pal.dung({
      goc: man.hamGoc,
      vong: TP.coCauTruc(man, 'for'),
      em: (man.moXuong !== false && !man.camHamCuaEm) ? KhoHam.ds() : null,
      man: A.bai().hamCuaMan,
      coNutMoi: false,
      boQua: S.ten
    });
  }

  /* -------------------------------------------------------- sửa thân hàm */
  function khiSuaThan() {
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    if (S.loai === 'em') {
      var r = KhoHam.sua(S.ten, S.than);
      if (!r.ok) { toast(r.loi, 'bad', 3500); return; }
      var g = Luu.ghiKho();
      if (!g.ok) toast(t('tb.khoGhiLoi', { loi: g.loi }), 'bad', 3500);
    } else {
      Luu.ghiNhap(A.man().ma, A.bai());
    }
    S.field.datLai();
    xoaKetThu();
    A.khiDoiHam();            // màn chơi vẽ lại kho khối, hủy lượt chạy cũ
    lamPal();
  }

  /* ------------------------------------------------------------- toast */
  var toastHen = null;
  function toast(chu, kieu, ms) {
    var tt = E.toast; tt.textContent = chu; tt.className = 'toast show ' + (kieu || '');
    clearTimeout(toastHen);
    toastHen = setTimeout(function () { tt.className = 'toast'; }, ms || TOAST_MS);
  }
  function anToast() { clearTimeout(toastHen); E.toast.className = 'toast'; }

  /* -------------------------------------------------------- sân thử */
  function napSan() {
    var st = S.st;
    S.field.nap({ san: ChamHoc.hangSanThu(st), batDau: st.batDau, loaiRobot: A.man().loaiRobot || 'banh', vat: st.vat });
  }
  function datChe(k) {
    S.che = k;
    Object.keys(CHE).forEach(function (x) {
      var b = E.host.querySelector('[data-nut="' + CHE[x] + '"]');
      if (b) b.classList.toggle('on', x === k);
    });
    E.ffr.classList.toggle('sua', !!k);
  }
  /** Gì đang ở ô (x, y) của sân thử: 'xe' | 'tuong' | 'vat' | null. */
  function coGi(x, y) {
    var st = S.st;
    if (st.batDau.x === x && st.batDau.y === y) return 'xe';
    function trong(ds) { return ds.some(function (o) { return o.x === x && o.y === y; }); }
    if (trong(st.tuong)) return 'tuong';
    if (trong(st.vat)) return 'vat';
    return null;
  }
  function boO(ds, x, y) { return ds.filter(function (o) { return !(o.x === x && o.y === y); }); }
  /** Chạm một ô sân thử theo chế độ đang bật. Ô có xe không đặt được vật hay tường (và ngược lại). */
  function chamSan(ev) {
    if (S.busy || !S.che || !S.st) return;
    var r = E.canvas.getBoundingClientRect(), st = S.st;
    var x = Math.floor((ev.clientX - r.left) / r.width * st.rong), y = Math.floor((ev.clientY - r.top) / r.height * st.cao);
    if (x < 0 || y < 0 || x >= st.rong || y >= st.cao) return;
    var co = coGi(x, y), moi = { rong: st.rong, cao: st.cao, batDau: Object.assign({}, st.batDau), vat: st.vat.slice(), tuong: st.tuong.slice() };
    if (S.che === 'xe') {
      if (co === 'xe') moi.batDau.huong = (moi.batDau.huong + 1) % 4;
      else if (co) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      else { moi.batDau.x = x; moi.batDau.y = y; }
    } else {
      var khoa = S.che === 'vat' ? 'vat' : 'tuong';
      if (co === khoa) moi[khoa] = boO(moi[khoa], x, y);
      else if (co) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      else moi[khoa].push({ x: x, y: y });
    }
    S.st = ChamHoc.chuanSanThu(moi);
    Luu.ghiSanThu(S.ten, S.st);
    napSan();
    xoaKetThu();
    anToast();
  }
  function lai() {
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    S.field.datLai();
    S.ed.datChay(null); S.pal.datSang(null);
    anToast();
  }

  /* ------------------------------------------------------- kết quả thử */
  function chay() {
    var man = A.man();
    return ChamHoc.thuHam(man, { chinh: [], hamCuaMan: A.bai().hamCuaMan }, S.ten, KhoHam.ds(), { sanThu: S.st });
  }
  function anBongD() { TP.bongAn(E.bongD); S.coBong = false; }
  function xoaKetThu() {
    S.ketThu = null; anBongD();
    S.ed.datChay(null); S.ed.datLoi([]); S.pal.datSang(null); S.pal.datLoi([]);
  }
  /** Các vị trí mà một chẩn đoán trỏ tới (xem man-choi.js). */
  function chiCho(c) {
    var ds = [c.cho, c.choTruoc];
    if (c.ma === 'cau-truc-chua-hoc' && c.cot && c.dong > 0) ds.push({ cot: c.cot, dong: c.dong, ten: c.ten });
    return ds;
  }
  /** Bong bóng chẩn đoán đè lên kho khối (nửa phải), mũi tên sang dòng lỗi của thân hàm; sân thử vẫn thấy. */
  function hienBongD() {
    var ds = S.ketThu ? S.ketThu.chanDoan : [];
    if (!ds.length) return;
    if (S.cdi >= ds.length) S.cdi = 0;
    var i = S.cdi, c = ds[i];
    TP.bongVe(E.bongD, {
      kieu: c.muc === 'loi' ? 'loi' : 'tin', tieuDe: t(c.muc === 'loi' ? 'choi.chanDoan' : 'choi.thongTin'), chu: c.loi,
      ma: ds.map(function (x) { return x.ma; }).join(' '),
      pager: ds.length > 1 ? {
        i: i + 1, n: ds.length,
        truoc: function () { S.cdi = (S.cdi + ds.length - 1) % ds.length; hienBongD(); },
        sau: function () { S.cdi = (S.cdi + 1) % ds.length; hienBongD(); }
      } : null
    });
    S.coBong = true;
    E.bongD.setAttribute('data-ca', c.ma);
    var dong = null;
    chiCho(c).forEach(function (cho) { if (dong === null && cho && cho.ten === S.ten && cho.dong > 0) dong = cho.dong - 1; });
    TP.bongMui(E.bongD, dong === null ? null : S.ed.hangEl(dong));
  }
  /** Chạy xong: lỗi (hoặc lưu ý) hiện ở bong bóng trên kho khối; không lỗi thì toast "Xong: n nhịp". */
  function hienKetQua(kq) {
    S.ketThu = kq; S.cdi = 0; anBongD();
    var loi = kq.chanDoan.filter(function (c) { return c.muc === 'loi'; });
    var tin = kq.chanDoan.filter(function (c) { return c.muc !== 'loi'; });
    var ds = loi.concat(tin);
    kq.chanDoan = ds;
    var rows = [], bricks = [];
    ds.forEach(function (c) { chiCho(c).forEach(function (cho) { gomLoi(cho, rows, bricks); }); });
    S.ed.datLoi(rows); S.pal.datLoi(bricks);
    if (ds.length) hienBongD();
    if (loi.length) {
      if (loi.some(function (c) { return c.ma === 'dam-tuong'; })) S.field.chopDo(450);
    } else {
      toast(t('xuong.xong', { n: kq.soNhip }), 'win');
    }
  }
  function gomLoi(cho, rows, bricks) {
    if (!cho) return;
    if (cho.ten === S.ten && cho.dong > 0) rows.push(cho.dong - 1);
    else if (cho.cot === 'hamEm') bricks.push('em:' + cho.ten);
    else if (cho.cot === 'hamMan') bricks.push('man:' + cho.ten);
  }

  /* --------------------------------------------------------------- thử hàm */
  async function thu() {
    if (S.busy) return;
    if (!S.than || !S.than.length) { toast(t('xuong.trong'), 'bad'); return; }
    var my = ++S.rid, kq = chay();
    anBongD(); S.ed.anHoan(); anToast();
    S.ed.datLoi([]); S.pal.datLoi([]);
    S.busy = true; E.side.classList.add('busy');
    S.field.datLai();
    var vet = kq.vet;
    var lap = S.ed.lapChoVet(vet, dongTrongHam);        // số lượt của các vòng for trong thân hàm
    var toc = A.toc();
    for (var i = 0; i < vet.length; i++) {
      var e = vet[i];
      if (e.loai === 'lenh') {
        sang(e, lap.get(e));
        await SanVe.ngu(LENH_MS / toc); if (my !== S.rid) return;
      } else {
        await S.field.phatNhip(e, NHIP_MS / toc); if (my !== S.rid) return;
      }
    }
    sang(null);
    S.busy = false; E.side.classList.remove('busy');
    hienKetQua(kq);
  }
  /** Chỉ số dòng (từ 0) của thân hàm đang mở mà sự kiện lệnh e đang chạy (kể cả khi lệnh nằm trong hàm khác được gọi từ dòng đó). */
  function dongTrongHam(e) {
    var chuoi = [e.cho].concat(e.ngan || []), dong = null;
    chuoi.forEach(function (c) { if (c && c.ten === S.ten && c.dong > 0) dong = c.dong - 1; });
    return dong;
  }
  function sang(e, lap) {
    if (!e) { S.ed.datChay(null); S.pal.datSang(null); return; }
    var dong = dongTrongHam(e), lit = null;
    if (e.cho && (e.cho.cot === 'hamEm' || e.cho.cot === 'hamMan') && e.cho.ten !== S.ten) lit = [e.cho.cot === 'hamEm' ? 'em' : 'man', e.cho.ten];
    S.ed.datChay(dong, lap);
    if (lit) S.pal.datSang(lit[0], lit[1]); else S.pal.datSang(null);
  }

  /* ------------------------------------------------------------- xóa hàm */
  function xoaHam() {
    if (S.loai !== 'em') return;
    var ten = S.ten;
    if (KhoHam.tenCoDinh(ten)) { toast(t('xuong.hamCoDinh'), 'bad', 2600); return; }
    var goi = KhoHam.ds().filter(function (f) { return f.ten !== ten && KhungCode.tenDuocGoi(f.than).indexOf(ten) >= 0; }).map(function (f) { return f.ten; });
    TP.Hop.xacNhan({
      tieuDe: t('xuong.xoaHam'), noiDung: t('xuong.xoaHoi', { ten: ten }),
      canhBao: goi.length ? t('xuong.xoaCanhBao', { ds: goi.join(', ') }) : null, co: t('xuong.xoaCo')
    }).then(function (ok) {
      if (!ok) return;
      var r = KhoHam.xoa(ten);
      if (!r.ok) return;
      Luu.ghiKho();
      Luu.xoaSanThu(ten);
      TP.Chan.giu(TP.XUONG_MS + 300);
      E.host.classList.remove('open'); E.host.removeAttribute('data-ham');
      S.rid++;
      A.khiVe();
    });
  }

  /* ---------------------------------------------------------- hộp đặt tên */
  function moiHam(taoXong) {
    var man = A.man();
    var m = TP.Hop.mo(t('ten.tieuDe'), 'hop-ten');
    // hàm THEO CỐT TRUYỆN còn thiếu ở màn này (tên trong taoHam): điền sẵn đúng tên, ô chỉ đọc, chỉ có nút "Tạo hàm";
    // đủ rồi thì hộp như thường, em tự đặt tên cho hàm riêng của mình
    var coDinh = (man.taoHam || []).filter(function (n) { return !KhoHam.tim(n); })[0] || null;
    var loi = h('div', 'hop-loi');
    var inp = h('input', 'hop-in'); inp.type = 'text'; inp.maxLength = 24; inp.placeholder = t('ten.mauGo');
    inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('data-nut', 'o-ten');
    function tao(ten) {
      ten = String(ten).trim();
      var tc = { taoHam: man.taoHam || [] };
      var kt = KhoHam.kiemTen(ten, undefined, tc);
      if (!kt.ok) { loi.textContent = kt.loi; loi.classList.add('co'); return; }
      var r = KhoHam.tao(ten, [], tc);
      if (!r.ok) { loi.textContent = r.loi; loi.classList.add('co'); return; }
      var g = Luu.ghiKho();
      TP.Hop.dong();
      A.khiDoiHam();
      if (!g.ok) A.baoLoi && A.baoLoi(t('tb.khoGhiLoi', { loi: g.loi }));
      taoXong && taoXong(ten);
    }
    if (coDinh) {
      m.than.appendChild(h('div', 'hop-chu nho', t('ten.coDinh')));
      inp.value = coDinh; inp.readOnly = true; inp.setAttribute('data-co-dinh', coDinh);
    }
    m.than.appendChild(inp); m.than.appendChild(loi);
    var hang = h('div', 'hop-hang');
    if (!coDinh) hang.appendChild(TP.Hop.nut('g-wd', t('chung.huy'), function () { TP.Hop.dong(); }, 'huy'));
    hang.appendChild(TP.Hop.nut('g-gr', t('ten.tao'), function () { tao(inp.value); }, 'tao'));
    m.than.appendChild(hang);
    inp.addEventListener('input', function () { loi.textContent = ''; loi.classList.remove('co'); });
    inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') tao(inp.value); });
  }

  window.Xuong = {
    dung: dung, mo: mo, dong: dong, dangMo: dangMo, moiHam: moiHam,
    capNhatKho: function () { if (dangMo()) lamPal(); }
  };
})();
