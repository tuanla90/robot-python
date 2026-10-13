/* ============================================================================
   xuong-ham.js — "Đường học": XƯỞNG HÀM (window.Xuong).
   Lớp phủ trượt lên đè màn chơi: bảng tên vàng `def ten():`, sân thử (vẽ đúng vùng robot đã đi, nới 1 ô viền, tối thiểu 3×3) + "Thử hàm",
   THÂN HÀM 10 ô + kho khối (Gốc, hàm khác của em, hàm của màn; không có chính nó).
   Hộp đặt tên cho "＋ Hàm mới". Sửa hàm của em → KhoHam.sua + lưu ngay;
   sửa hàm của màn → chỉ vào bản nháp của màn.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var A = null;        // app: { man(), bai(), khiDoiHam(), khiVe(), toc() }
  var E = {};          // phần tử
  var S = { loai: null, ten: null, than: null, ed: null, pal: null, field: null, rid: 0, busy: false, ketThu: null };
  var NHIP_MS = 230, LENH_MS = 45;
  var CO_SAN = 168, CO_O_NHO = 12;                       // khung sân (px) và cỡ ô nhỏ nhất (px màn hình)
  var MAX_O = Math.floor(CO_SAN / CO_O_NHO);             // quá số ô này thì chỉ vẽ phần quanh vị trí cuối

  /* -------------------------------------------------------------- dựng DOM */
  function dung(host, app) {
    A = app; E.host = host;
    host.innerHTML =
      '<div class="deco"></div>' +
      '<div class="top"><button class="bt g-or back" data-nut="ve"><span data-i="back" data-s="2"></span>' + t('xuong.ve') + '</button>' +
        '<div class="plaque"><span class="t t-xuong">' + t('xuong.tieuDe') + '</span></div>' +
        '<button class="bt g-rd menu" data-nut="xoa-ham" aria-label="' + t('xuong.xoaHam') + '"><span data-i="trash" data-s="2"></span></button></div>' +
      '<div class="plate2"><span class="tag"></span><span class="nm"></span><i class="rvt a"></i><i class="rvt b"></i></div>' +
      '<div class="fblock w">' +
        '<div class="ffr w"><canvas class="tex"></canvas></div>' +
        '<div class="side w">' +
          '<button class="bt g-gr runb" data-nut="thu"><span data-i="play" data-s="2" data-l="#14561e"></span>' + t('xuong.thu') + '</button>' +
          '<div class="result chalk" data-nut="ket-qua"><span class="k">' + t('xuong.ketQua') + '</span><span class="m"></span><span class="dg"></span></div>' +
        '</div></div>' +
      '<div class="low w">' +
        '<div class="pan p-prog"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="tt">' + t('xuong.than') + '</span><span class="ct">0/10</span>' +
            '<button class="bt g-rd del het" data-nut="xoa-het" aria-label="' + t('choi.xoaHet') + '"><span data-i="trash" data-s="2" data-l="#4a0e0c"></span></button></div>' +
            '<div class="rows"></div></div></div>' +
        '<div class="pan p-pal"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="tt">' + t('choi.khoiLenh') + '</span></div><div class="pal"></div></div>' +
          '<div class="bong duoi" data-nut="bong-duoi"></div></div>' +
      '</div>';
    Ve.hydrate(host);
    Ve.khungGo(host.querySelector('.deco'));
    var q = function (s) { return host.querySelector(s); };
    E.nm = q('.plate2 .nm'); E.tag = q('.plate2 .tag'); E.plate = q('.plate2');
    E.m = q('.result .m'); E.dg = q('.result .dg'); E.kq = q('.result');
    E.side = q('.side'); E.xoaHam = q('[data-nut="xoa-ham"]');
    E.canvas = q('.ffr canvas'); E.bongD = q('.p-pal .bong');
    S.field = new SanVe.Field(E.canvas, { kich: CO_SAN, coNhoNhat: CO_O_NHO });
    S.ed = new TP.Editor(q('.rows'), {
      tong: 10, dung: 10, lay: function () { return S.than || []; }, bang: q('.p-prog'), dem: q('.p-prog .ct'),
      nutXoaHet: q('[data-nut="xoa-het"]'), dangChay: function () { return S.busy; },
      tt: q('.p-prog .tt'), ttDay: t('xuong.than'), ttNgan: t('xuong.thanNgan'),
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
    E.xoaHam.addEventListener('click', xoaHam);
    E.kq.addEventListener('click', function () {
      if (S.ketThu && S.coBong) { hienBongD(); return; }
      if (E.kq.classList.contains('dai') && S.ketThu) TP.Hop.doc(t('choi.chanDoan'), S.ketThu.chanDoan.map(function (c) { return c.loi; }).join('\n\n'));
    });
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
    var man = A.man();
    E.nm.innerHTML = '';
    var b = h('b', null, 'def'); E.nm.appendChild(b); E.nm.appendChild(document.createTextNode(' ' + ten));
    E.nm.appendChild(h('i', null, '(' + (f.thamSo || []).join(', ') + '):'));
    E.plate.classList.toggle('ma', loai === 'man');
    E.tag.textContent = loai === 'man' ? t('xuong.nhanMan') : t('xuong.nhanEm');
    E.xoaHam.style.display = loai === 'em' ? 'flex' : 'none';
    S.ed.nap(function () { return S.than; }, 10);
    napSan(null);
    lamPal();
    tinhNhanh();
    anBongD();
    TP.Chan.giu(TP.XUONG_MS + 300);
    E.host.classList.add('open');
    E.host.setAttribute('data-ham', ten); E.host.setAttribute('data-loai', loai);
    S.pal.vua();
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
      if (!r.ok) { E.m.textContent = r.loi; return; }
      var g = Luu.ghiKho();
      if (!g.ok) E.dg.textContent = t('tb.khoGhiLoi', { loi: g.loi });
    } else {
      Luu.ghiNhap(A.man().id, A.bai());
    }
    S.field.datLai();
    S.ed.datChay(null); S.ed.datLoi([]); S.pal.datSang(null); S.pal.datLoi([]);
    A.khiDoiHam();            // màn chơi vẽ lại kho khối, hủy lượt chạy cũ
    lamPal();
    tinhNhanh();
  }

  /* ------------------------------------------------------- kết quả thử */
  /** Các đoạn đi liền một hướng (lên/phải/xuống/trái) theo thứ tự thật trong vết: [{h: 0..3, n}]. */
  function cacDoan(kq) {
    var b = ChamHoc.BAT_DAU_THU, tr = { x: b.x, y: b.y }, ds = [];
    kq.vet.forEach(function (e) {
      if (e.loai !== 'nhip' || !e.robot) return;
      var dx = e.robot.x - tr.x, dy = e.robot.y - tr.y;
      tr = { x: e.robot.x, y: e.robot.y };
      if (!dx && !dy) return;
      var hg = dy < 0 ? 0 : dx > 0 ? 1 : dy > 0 ? 2 : 3, n = Math.abs(dx) + Math.abs(dy);
      if (ds.length && ds[ds.length - 1].h === hg) ds[ds.length - 1].n += n; else ds.push({ h: hg, n: n });
    });
    return ds;
  }
  var TEN_O = ['len', 'phai', 'xuong', 'trai'];
  function oDi(d) { return t('xuong.o.' + TEN_O[d.h], { n: d.n }); }
  /** Lời tả kết quả theo vị trí TƯƠNG ĐỐI so với chỗ xuất phát (không nói tọa độ). */
  function mota(kq) {
    var r = kq.robot, b = ChamHoc.BAT_DAU_THU, dx = r.x - b.x, dy = r.y - b.y, dd = (r.huong - b.huong + 4) % 4;
    var mat = dd === 1 ? 'phai' : dd === 3 ? 'trai' : dd === 2 ? 'dau' : null;
    if (!dx && !dy) {
      var ds0 = cacDoan(kq);
      if (ds0.length) return t('xuong.vongVe') + (mat ? ', ' + t('xuong.quayMat.' + mat) : '');
      return mat ? t('xuong.quayTaiCho.' + mat) : t('xuong.dungYen');
    }
    var ds = cacDoan(kq), viec;
    if (ds.length === 1 && !mat && ds[0].h === 0) viec = t('xuong.tien', { n: ds[0].n });
    else if (ds.length === 1 && !mat && ds[0].h === 2) viec = t('xuong.lui', { n: ds[0].n });
    else if (ds.length >= 1 && ds.length <= 3) {
      viec = t('xuong.di', { ds: ds.map(oDi).reduce(function (a, c) { return t('xuong.roi', { a: a, b: c }); }) });
    } else {
      var net = [];
      if (dy) net.push(oDi({ h: dy < 0 ? 0 : 2, n: Math.abs(dy) }));
      if (dx) net.push(oDi({ h: dx > 0 ? 1 : 3, n: Math.abs(dx) }));
      return t('xuong.vong', { ds: net.join(' và ') }) + (mat ? ', ' + t('xuong.quayMat.' + mat) : '');
    }
    return t('xuong.robot', { viec: viec + (mat ? ', ' + t('xuong.quayMat.' + mat) : '') });
  }

  /* -------------------------------------------- vẽ đúng vùng robot đã đi */
  /** Cấu hình sân vẽ từ `kq.khung` (tọa độ quy ước của lõi): nới 1 ô viền, tối thiểu 3×3;
   *  quá MAX_O ô thì chỉ lấy MAX_O ô quanh vị trí cuối, đánh dấu cạnh bị cắt. ox, oy: tọa độ quy ước của ô (0,0) của sân vẽ. */
  function cauHinhSan(kq) {
    var kh = kq ? kq.khung : { minX: 1, maxX: 1, minY: 1, maxY: 1 }, r = kq ? kq.robot : ChamHoc.BAT_DAU_THU, b = ChamHoc.BAT_DAU_THU;
    var lo = { x: kh.minX - 1, y: kh.minY - 1 }, hi = { x: kh.maxX + 1, y: kh.maxY + 1 }, cat = { trai: false, phai: false, tren: false, duoi: false }, coCat = false;
    if (hi.x - lo.x + 1 > MAX_O) {
      var a = Math.max(lo.x, Math.min(hi.x - MAX_O + 1, r.x - Math.floor(MAX_O / 2)));
      cat.trai = a > lo.x; cat.phai = a + MAX_O - 1 < hi.x; lo.x = a; hi.x = a + MAX_O - 1; coCat = true;
    }
    if (hi.y - lo.y + 1 > MAX_O) {
      var c = Math.max(lo.y, Math.min(hi.y - MAX_O + 1, r.y - Math.floor(MAX_O / 2)));
      cat.tren = c > lo.y; cat.duoi = c + MAX_O - 1 < hi.y; lo.y = c; hi.y = c + MAX_O - 1; coCat = true;
    }
    var w = hi.x - lo.x + 1, hh = hi.y - lo.y + 1, d = '', rows = [];
    for (var i = 0; i < w; i++) d += '.';
    for (var j = 0; j < hh; j++) rows.push(d);
    var sx = b.x - lo.x, sy = b.y - lo.y, trong = sx >= 0 && sy >= 0 && sx < w && sy < hh;
    return {
      san: rows, batDau: { x: sx, y: sy, huong: b.huong }, loaiRobot: A.man().loaiRobot || 'banh',
      danhDau: trong ? { x: sx, y: sy } : null, cat: coCat ? cat : null, ox: lo.x, oy: lo.y
    };
  }
  function napSan(kq) {
    S.cs = cauHinhSan(kq);
    S.field.nap(S.cs);
    E.canvas.title = S.cs.cat ? t('xuong.vungCat') : '';
  }
  /** Bản sao vết với tọa độ quy ước đổi sang tọa độ của sân vẽ. */
  function vetTrenSan(vet) {
    var ox = S.cs.ox, oy = S.cs.oy;
    function dich(v) {
      if (!v || typeof v !== 'object') return v;
      if (Array.isArray(v)) return v.map(dich);
      var o = {};
      for (var k in v) o[k] = dich(v[k]);
      if (typeof v.x === 'number' && typeof v.y === 'number') { o.x = v.x - ox; o.y = v.y - oy; }
      return o;
    }
    return dich(vet);
  }
  function chay() {
    var man = A.man();
    return ChamHoc.thuHam(man, { chinh: [], hamCuaMan: A.bai().hamCuaMan }, S.ten, KhoHam.ds());
  }
  function anBongD() { TP.bongAn(E.bongD); }
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
    E.bongD.setAttribute('data-ca', c.ma);
    var dong = null;
    [c.cho, c.choTruoc].forEach(function (cho) { if (dong === null && cho && cho.ten === S.ten && cho.dong > 0) dong = cho.dong - 1; });
    TP.bongMui(E.bongD, dong === null ? null : S.ed.hangEl(dong));
  }
  /** baoBong: true khi người chơi bấm "Thử hàm" — lỗi hiện ở bong bóng trên kho khối; còn lúc tự tính khi sửa thì chỉ ở khung kết quả. */
  function hienKetQua(kq, baoBong) {
    S.ketThu = kq; S.coBong = false; S.cdi = 0; anBongD();
    var loi = kq.chanDoan.filter(function (c) { return c.muc === 'loi'; });
    var tin = kq.chanDoan.filter(function (c) { return c.muc !== 'loi'; });
    var ds = loi.concat(tin);
    S.ketThu.chanDoan = ds;
    E.m.textContent = loi.length ? '' : mota(kq);
    E.m.style.display = loi.length ? 'none' : '';
    E.dg.innerHTML = '';
    E.dg.removeAttribute('data-ma');
    if (baoBong && loi.length) {
      S.coBong = true;
      E.dg.className = 'dg loi';
      E.dg.textContent = t('choi.xemLoi');
      E.dg.setAttribute('data-ma', ds.map(function (c) { return c.ma; }).join(' '));
      E.kq.classList.add('dai');
    } else if (ds.length) {
      var d0 = ds[0];
      E.dg.className = 'dg ' + (d0.muc === 'loi' ? 'loi' : 'tin');
      TP.vanBan(E.dg, d0.loi);
      E.dg.setAttribute('data-ma', ds.map(function (c) { return c.ma; }).join(' '));
    } else { E.dg.className = 'dg'; }
    if (!S.coBong) {
      E.kq.classList.remove('dai');
      vuaChu(E.dg, 13, 9);
      if (E.dg.scrollHeight > E.dg.clientHeight + 1) E.kq.classList.add('dai');
    }
    // đánh dấu dòng / khối có lỗi
    var rows = [], bricks = [];
    ds.forEach(function (c) { gomLoi(c.cho, rows, bricks); });
    S.ed.datLoi(rows); S.pal.datLoi(bricks);
    if (S.coBong) hienBongD();
  }
  function gomLoi(cho, rows, bricks) {
    if (!cho) return;
    if (cho.ten === S.ten && cho.dong > 0) rows.push(cho.dong - 1);
    else if (cho.cot === 'hamEm') bricks.push('em:' + cho.ten);
    else if (cho.cot === 'hamMan') bricks.push('man:' + cho.ten);
  }
  function tinhNhanh() {
    if (!S.than || !S.than.length) {
      E.m.style.display = ''; E.m.textContent = t('xuong.bamThu'); E.dg.textContent = ''; E.dg.className = 'dg';
      S.ketThu = null; E.kq.classList.remove('dai'); return;
    }
    var kq = chay();
    napSan(kq);
    hienKetQua(kq);
  }
  function vuaChu(el, max, min) { TP.vuaChu(el, max, min); }

  /* --------------------------------------------------------------- thử hàm */
  async function thu() {
    if (S.busy) return;
    if (!S.than || !S.than.length) { E.m.style.display = ''; E.m.textContent = t('xuong.trong'); return; }
    var my = ++S.rid, kq = chay();
    anBongD(); S.ed.anHoan();
    S.busy = true; E.side.classList.add('busy');
    S.field.datLai();
    napSan(kq);
    var vet = vetTrenSan(kq.vet);
    var toc = A.toc();
    for (var i = 0; i < vet.length; i++) {
      var e = vet[i];
      if (e.loai === 'lenh') {
        sang(e);
        await SanVe.ngu(LENH_MS / toc); if (my !== S.rid) return;
      } else {
        await S.field.phatNhip(e, NHIP_MS / toc); if (my !== S.rid) return;
      }
    }
    sang(null);
    S.busy = false; E.side.classList.remove('busy');
    hienKetQua(kq, true);
  }
  function sang(e) {
    if (!e) { S.ed.datChay(null); S.pal.datSang(null); return; }
    var chuoi = [e.cho].concat(e.ngan || []), dong = null, lit = null;
    chuoi.forEach(function (c) {
      if (!c) return;
      if (c.ten === S.ten && c.dong > 0) dong = c.dong - 1;
    });
    if (e.cho && (e.cho.cot === 'hamEm' || e.cho.cot === 'hamMan') && e.cho.ten !== S.ten) lit = [e.cho.cot === 'hamEm' ? 'em' : 'man', e.cho.ten];
    S.ed.datChay(dong);
    if (lit) S.pal.datSang(lit[0], lit[1]); else S.pal.datSang(null);
  }

  /* ------------------------------------------------------------- xóa hàm */
  function xoaHam() {
    if (S.loai !== 'em') return;
    var ten = S.ten;
    var goi = KhoHam.ds().filter(function (f) { return f.ten !== ten && KhungCode.tenDuocGoi(f.than).indexOf(ten) >= 0; }).map(function (f) { return f.ten; });
    TP.Hop.xacNhan({
      tieuDe: t('xuong.xoaHam'), noiDung: t('xuong.xoaHoi', { ten: ten }),
      canhBao: goi.length ? t('xuong.xoaCanhBao', { ds: goi.join(', ') }) : null, co: t('xuong.xoaCo')
    }).then(function (ok) {
      if (!ok) return;
      var r = KhoHam.xoa(ten);
      if (!r.ok) return;
      Luu.ghiKho();
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
    var goiY = (man.taoHam || []).filter(function (n) { return !KhoHam.tim(n); });
    var loi = h('div', 'hop-loi');
    var inp = h('input', 'hop-in'); inp.type = 'text'; inp.maxLength = 24; inp.placeholder = t('ten.mauGo');
    inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('data-nut', 'o-ten');
    function tao(ten) {
      ten = String(ten).trim();
      var kt = KhoHam.kiemTen(ten);
      if (!kt.ok) { loi.textContent = kt.loi; loi.classList.add('co'); return; }
      var r = KhoHam.tao(ten, []);
      if (!r.ok) { loi.textContent = r.loi; loi.classList.add('co'); return; }
      var g = Luu.ghiKho();
      TP.Hop.dong();
      A.khiDoiHam();
      if (!g.ok) A.baoLoi && A.baoLoi(t('tb.khoGhiLoi', { loi: g.loi }));
      taoXong && taoXong(ten);
    }
    if (goiY.length) {
      m.than.appendChild(h('div', 'hop-chu nho', t('ten.goiY')));
      var chips = h('div', 'hop-chips');
      // chạm tên gợi ý chỉ ĐIỀN tên vào ô và tô sáng chip; bấm "Tạo hàm" mới tạo
      goiY.forEach(function (n) {
        var c = h('button', 'bt g-gr chip', n + '()'); c.setAttribute('data-goi-y', n);
        c.addEventListener('click', function () {
          inp.value = n; loi.textContent = ''; loi.classList.remove('co');
          sangChip(n);
        });
        chips.appendChild(c);
      });
      m.than.appendChild(chips);
      m.than.appendChild(h('div', 'hop-chu nho', t('ten.hoacGo')));
    }
    m.than.appendChild(inp); m.than.appendChild(loi);
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-wd', t('chung.huy'), function () { TP.Hop.dong(); }, 'huy'));
    hang.appendChild(TP.Hop.nut('g-gr', t('ten.tao'), function () { tao(inp.value); }, 'tao'));
    m.than.appendChild(hang);
    function sangChip(n) {
      var cs = m.than.querySelectorAll('.chip');
      for (var i = 0; i < cs.length; i++) cs[i].classList.toggle('on', cs[i].getAttribute('data-goi-y') === n);
    }
    inp.addEventListener('input', function () { loi.textContent = ''; loi.classList.remove('co'); sangChip(inp.value.trim()); });
    inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') tao(inp.value); });
  }

  window.Xuong = {
    dung: dung, mo: mo, dong: dong, dangMo: dangMo, moiHam: moiHam,
    capNhatKho: function () { if (dangMo()) lamPal(); }
  };
})();
