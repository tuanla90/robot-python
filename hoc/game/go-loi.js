/* ============================================================================
   go-loi.js — "Robot Chấn Hưng": BẢNG GỠ LỖI "chơi một màn bất kỳ" (window.GoLoi). Chỉ để người làm game thử màn.
   Mở bằng: giữ lâu logo màn khởi đầu / tiêu đề màn chọn gói / tiêu đề lưới màn 2 giây · nút 🐞 ở hàng "Hàm của em" (khi địa chỉ có ?debug=1 hoặc #debug) · mục "Gỡ lỗi" trong menu ☰ của màn chơi.
   Trong bảng: ‹ Chương N · tên › chọn chương (mọi chương, kể cả đợt 2) · lưới các màn của chương (số, tên, sao): chạm một màn là vào màn đó NGAY, bỏ qua khóa ·
   công tắc "Mở hết" (lưu ở localStorage, App.moHet đọc lại lúc khởi động) · "Nạp hàm chuẩn khi vào màn" (mặc định BẬT) · "Xóa tiến độ" (kèm "Xóa cả kho hàm" nếu bật) · "Bỏ mua" (xóa cờ các mùa đã mua thử).

   NẠP HÀM CHUẨN (khoThamChieu / napHamChuan): trước khi vào màn X, dựng kho tham chiếu như người chơi đã qua MỌI màn đứng trước X (theo thứ tự ManHoc.danhSach):
   trộn loiGiai.hamCuaEmMoi của từng màn vào kho theo tên, màn sau ghi đè màn trước (che-xe.5 sửa u_turn, che-xe.9 sửa turn_right / turn_left).
   Màn "tiết kiệm nhịp" (tietKiemNhip: tay-gap.9) sửa riêng hàm có sẵn, không ghi vào kho dùng chung (giống kiem-hoc.mjs). Hàm trong man.taoHam của X không nạp sẵn (người chơi tự chế ở màn).
   Ghi vào kho thật qua KhoHam (tao / sua) rồi Luu.ghiKho(): chỉ thêm / thay hàm cốt truyện, hàm tự đặt khác của người chơi giữ nguyên. Vào màn xong khay tự vẽ lại (Choi.vao).
   "Mở hết" đang bật mà vào màn từ lưới màn thường (App.vaoMan): napKhiMoHet(m) chỉ THÊM hàm cốt truyện còn thiếu (không thay hàm đã có), để nhảy cóc tới chương sau vẫn có move()…

   NẠP LỜI GIẢI (30/10, khối "Lời giải màn N" trong bảng, chỉ khi đang ở màn chơi): cachGiai(m) gom các lời giải đã lưu của màn (loiGiai chuẩn, loiGiaiKhac, congThucKhac;
   màn lắp ráp: lời giải của từng lapRap.cachLap), mỗi cái một nút kèm số sao chấm thử (chamCach, trên kho khoChoCach: kho tham chiếu + hàm mới của lời giải).
   "Nạp lời giải" (napLoiGiai): ghi hàm của em vào kho thật, đưa bài vào khung code (Choi.napBai, ghi nháp). Bài đang viết khác mã mẫu và lời giải, hay hàm trong kho
   sắp bị thay, thì hỏi trước. Địa chỉ `?debug=1&man=<mã>&loigiai=1` (hay loigiai=khac, ct2…) vào màn rồi nạp luôn (màn lắp ráp: dùng nút sau khi Lắp xong).
   Kế hoạch "xem lời giải tham khảo" cho người chơi: hoc/KE-HOACH-LOI-GIAI.md.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var KHOA_CAI = 'duong-hoc:go-loi';          // { moHet: bool, napHam: bool, tatHD: bool } — riêng, "Xóa tiến độ" không đụng tới
  var S = { chuong: null, kemKho: false, tin: '', daMo: false };

  /* ---------------------------------------------------------------- cài đặt (localStorage) */
  function docCai() {
    var c = { moHet: false, napHam: true, tatHD: true };
    try {
      var d = JSON.parse(Luu.kho.getItem(KHOA_CAI) || 'null');
      if (d && typeof d === 'object') {
        if (typeof d.moHet === 'boolean') c.moHet = d.moHet;
        if (typeof d.napHam === 'boolean') c.napHam = d.napHam;
        if (typeof d.tatHD === 'boolean') c.tatHD = d.tatHD;
      }
    } catch (e) { /* chạy với mặc định */ }
    return c;
  }
  function ghiCai(c) { try { Luu.kho.setItem(KHOA_CAI, JSON.stringify(c)); } catch (e) { /* chạy không lưu */ } }
  function docMoHet() { return docCai().moHet; }
  function datMoHet(b) {
    var c = docCai(); c.moHet = !!b; ghiCai(c);
    App.moHet = c.moHet;
    if (c.moHet && c.tatHD && window.HuongDan) HuongDan.dung();            // bật Mở hết: tắt luôn bong bóng đang hiện
    if (window.App && App.veLai) App.veLai(); else if (window.Chon) Chon.ve();
  }
  function datNapHam(b) { var c = docCai(); c.napHam = !!b; ghiCai(c); }
  /** "Tắt hướng dẫn khi Mở hết" (mặc định BẬT): đang Mở hết để nhảy cóc thử màn thì bong bóng hướng dẫn không hiện (huong-dan.js hỏi tatHuongDan()). Tắt công tắc để thử chính hướng dẫn. */
  function datTatHD(b) { var c = docCai(); c.tatHD = !!b; ghiCai(c); if (c.tatHD && c.moHet && window.HuongDan) HuongDan.dung(); }
  function tatHuongDan() { var c = docCai(); return c.moHet && c.tatHD; }

  /** Địa chỉ có ?debug=1 hoặc #debug (còn nhận #debug=1)? */
  function coCo() {
    try {
      var loc = window.location;
      return /(^|[?&])debug=1(&|$)/.test(loc.search || '') || /(^|[#&])debug(=1)?(&|$)/.test(loc.hash || '');
    } catch (e) { return false; }
  }
  /** Chế độ gỡ lỗi đang "mở khóa": có cờ trên địa chỉ, đã mở bảng trong phiên này, hoặc "Mở hết" đang bật. Mục "Gỡ lỗi" của menu ☰ chỉ hiện khi true. */
  function laBat() { return coCo() || S.daMo || docCai().moHet; }

  /* ---------------------------------------------------------------- kho hàm chuẩn */
  function giongHam(a, b) {
    return JSON.stringify([a.thamSo || [], a.than || []]) === JSON.stringify([b.thamSo || [], b.than || []]);
  }

  /** Kho tham chiếu LÚC TỚI màn m: [{ ten, thamSo, than }] theo thứ tự hàm xuất hiện; không gồm hàm trong m.taoHam (lõi: ManHoc.khoThamChieu). */
  function khoThamChieu(m) { return ManHoc.khoThamChieu(m); }

  /** Nạp kho tham chiếu vào kho thật của người chơi. Trả về { them, thay, giu, loi } (tên hàm đã thêm / đã thay / số hàm đã đúng sẵn / lỗi).
   *  chiThem: chỉ thêm hàm còn thiếu, hàm đã có (kể cả khác bản chuẩn) giữ nguyên. */
  function napHamChuan(m, chiThem) { return ghiVaoKho(khoThamChieu(m), chiThem); }

  /** Ghi danh sách hàm [{ ten, thamSo, than }] vào kho thật (KhoHam tao / sua, rồi Luu.ghiKho). Trả về { them, thay, giu, loi } như napHamChuan. */
  function ghiVaoKho(ds, chiThem) {
    var kq = { them: [], thay: [], giu: 0, loi: [] };
    ds.forEach(function (f) {
      var co = KhoHam.tim(f.ten), viec;
      if (!co) {
        var r = KhoHam.tao(f.ten, f.thamSo, { taoHam: [f.ten] });
        if (!r.ok) { kq.loi.push(f.ten + ': ' + r.loi); return; }
        viec = kq.them;
      } else if (chiThem || giongHam(co, f)) { kq.giu++; return; }
      else viec = kq.thay;
      var r2 = KhoHam.sua(f.ten, f.than, f.thamSo);
      if (!r2.ok) { kq.loi.push(f.ten + ': ' + r2.loi); return; }
      viec.push(f.ten);
    });
    if (kq.them.length || kq.thay.length) { var g = Luu.ghiKho(); if (!g.ok) kq.loi.push(g.loi); }
    return kq;
  }

  /* ---------------------------------------------------------------- lời giải đã lưu của màn */
  function chepHam(f) { return { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: (f.than || []).slice() }; }
  /** Bản chép một bài làm: { chinh, hamCuaMan } hay { doi: [{ chinh }], hamCuaMan } (màn nhiều robot). */
  function chepBai(b) {
    b = b || {};
    var kq = { hamCuaMan: (b.hamCuaMan || []).map(chepHam) };
    if (Array.isArray(b.doi)) kq.doi = b.doi.map(function (x) { return { chinh: ((x && x.chinh) || []).slice() }; });
    else kq.chinh = (b.chinh || []).slice();
    return kq;
  }
  /** Hai bài giống nhau (bỏ dòng trống cuối mỗi chương trình, thứ tự hàm của màn giữ nguyên)? */
  function giongBai(a, b) {
    function cat(ds) { ds = (ds || []).slice(); while (ds.length && !String(ds[ds.length - 1]).trim()) ds.pop(); return ds; }
    function gon(x) {
      x = chepBai(x);
      return JSON.stringify([x.doi ? x.doi.map(function (d) { return cat(d.chinh); }) : cat(x.chinh), x.hamCuaMan.map(function (f) { return [f.ten, f.thamSo, cat(f.than)]; })]);
    }
    return gon(a) === gon(b);
  }

  /** Các lời giải đã lưu của màn m: [{ ma, nhan, moTa, man, bai, moi, coMoi, cach }].
   *  ma 'chuan' = loiGiai (máy kiểm ép 3 sao) · 'khac' / 'khacN' = loiGiaiKhac (thường 2 sao) · 'ctN' = congThucKhac[N-1] · 'lapN' = lapRap.cachLap[N-1] (màn lắp ráp, kèm cach).
   *  man: bản màn để chấm (màn lắp ráp: đã gắn robot của cách đó). bai thiếu (công thức chỉ đổi hàm) thì lấy bài của lời giải chuẩn.
   *  moi: hàm của em mới của cách đó (trên mục hay trong baiLam); coMoi: cách có tự khai hàm của em mới không (khoChoCach dùng). */
  function cachGiai(m) {
    var ds = [];
    if (!m) return ds;
    var goc = m.manGoc || m, lg = m.loiGiai, L = goc.lapRap;
    if (L && Array.isArray(L.cachLap) && window.LapRap) {
      L.cachLap.forEach(function (cl, i) {
        if (!cl || !cl.loiGiai) return;
        var mm; try { mm = LapRap.apDung(goc, cl); } catch (e) { return; }
        ds.push({ ma: 'lap' + (i + 1), nhan: t('go.giaiLap', { n: i + 1 }), moTa: LapRap.moTa(cl) + (cl.ghiChu ? '. ' + cl.ghiChu : ''), man: mm,
          bai: chepBai(cl.loiGiai), moi: (cl.loiGiai.hamCuaEmMoi || []).map(chepHam), coMoi: true, cach: LapRap.chuanCach(cl) });
      });
    } else if (lg) {
      ds.push({ ma: 'chuan', nhan: t('go.giaiChuan'), moTa: t('go.giaiChuanMoTa'), man: m, bai: chepBai(lg), moi: (lg.hamCuaEmMoi || []).map(chepHam), coMoi: true });
    }
    if (!lg) return ds;
    function them(ma, nhan, c) {
      if (!c) return;
      var moi = Array.isArray(c.hamCuaEmMoi) ? c.hamCuaEmMoi : c.baiLam && Array.isArray(c.baiLam.hamCuaEmMoi) ? c.baiLam.hamCuaEmMoi : null;
      ds.push({ ma: ma, nhan: nhan, moTa: c.moTa || '', man: m, bai: chepBai(c.baiLam || lg), moi: (moi || []).map(chepHam), coMoi: !!moi });
    }
    var khac = [].concat(m.loiGiaiKhac || []);
    khac.forEach(function (c, i) { them(khac.length > 1 ? 'khac' + (i + 1) : 'khac', khac.length > 1 ? t('go.giaiKhac') + ' ' + (i + 1) : t('go.giaiKhac'), c); });
    (m.congThucKhac || []).forEach(function (c, i) { them('ct' + (i + 1), t('go.giaiCT', { n: i + 1 }), c); });
    return ds;
  }

  /** Kho hàm của em để chạy cách c (một mục của cachGiai(m)): kho tham chiếu lúc tới màn (khoThamChieu), cộng hàm mới của lời giải chuẩn, rồi hàm mới
   *  của chính cách c (cùng tên thì sau thay trước). Cách có tự khai hàm của em mới (coMoi) thì từ lời giải chuẩn chỉ lấy hàm màn này tạo mới (taoHam…),
   *  không lấy bản sửa hàm cũ, như máy kiểm chấm loiGiaiKhac trên kho trước màn. */
  function khoChoCach(m, c) {
    var ds = khoThamChieu(m.manGoc || m).map(chepHam), chi = {};
    ds.forEach(function (f, i) { chi[f.ten] = i; });
    function tron(fs) {
      fs.forEach(function (f) {
        if (chi[f.ten] === undefined) { chi[f.ten] = ds.length; ds.push(chepHam(f)); }
        else ds[chi[f.ten]] = chepHam(f);
      });
    }
    var lg = m.loiGiai;
    if (c && !c.cach && c.ma !== 'chuan' && lg) {
      var chuanMoi = lg.hamCuaEmMoi || [];
      tron(c.coMoi ? chuanMoi.filter(function (f) { return chi[f.ten] === undefined; }) : chuanMoi);
    }
    if (c) tron(c.moi);
    return ds;
  }

  /** Chấm thử cách c ở màn của nó trên kho khoChoCach: { thang, sao, soNhip } (lỗi lõi: { thang: false, sao: 0, loi }). */
  function chamCach(m, c) {
    try {
      var r = ChamHoc.cham(c.man, c.bai, khoChoCach(m, c));
      return { thang: !!r.thang, sao: r.sao || 0, soNhip: r.soNhip };
    } catch (e) { return { thang: false, sao: 0, loi: e.message }; }
  }

  /** Nạp lời giải `ma` (mã trong cachGiai) vào màn đang chơi: hàm của em vào kho thật (khoChoCach), bài vào khung code (Choi.napBai, ghi nháp).
   *  hoi: bài đang viết khác cả mã mẫu lẫn lời giải, hay hàm trong kho sắp bị thay khác bản đang có, thì hỏi trước (không ghi đè bài của người chơi khi chưa hỏi).
   *  Màn lắp ráp: cách lắp khác robot đang gắn thì lắp lại robot đó (Luu.ghiLap, Choi.vao) trước. Trả về Promise { ok, ten, them, thay, loi }. */
  function napLoiGiai(ma, hoi) {
    var tt = window.Choi && Choi.trangThai(), m = tt && tt.man;
    if (!m) return Promise.resolve({ ok: false, loi: 'chua-vao-man' });
    var ds = cachGiai(m), c = ds.filter(function (x) { return x.ma === ma; })[0] || ds[0];
    if (!c) return Promise.resolve({ ok: false, loi: 'khong-co-loi-giai' });
    var kho = khoChoCach(m, c), goc = m.manGoc || m;
    var thay = kho.filter(function (f) { var co = KhoHam.tim(f.ten); return co && !giongHam(co, f); }).map(function (f) { return f.ten + '()'; });
    var baiKhac = !giongBai(tt.bai, c.bai) && !(goc.maMau && giongBai(tt.bai, goc.maMau));
    function lam() {
      var kq = ghiVaoKho(kho);
      if (c.cach) {
        var dang = m.cachLapDaChon || {};
        if (['than', 'tay', 'camBien'].some(function (k) { return (dang[k] || null) !== (c.cach[k] || null); })) {
          Luu.ghiLap(goc.ma, c.cach);
          Choi.vao(goc, goc.lapRap.cachLap[+c.ma.slice(3) - 1]);
        }
      }
      if (kq.loi.length) Choi.napBai(c.bai, t('go.napGiaiLoi', { loi: kq.loi.join('; ') }), 'bad');              // kho đầy, tên hỏng…: bài vẫn nạp, báo đỏ để biết chạy sẽ thiếu hàm
      else Choi.napBai(c.bai, t('go.daNapGiai', { ten: c.nhan }));
      try { console.info('[GoLoi] ' + goc.ma + ': nạp lời giải ' + c.ma + ' — kho thêm ' + kq.them.length + ', thay ' + kq.thay.length + (kq.loi.length ? ', LỖI ' + kq.loi.join('; ') : '')); } catch (e) { /* bỏ qua */ }
      return { ok: !kq.loi.length, ten: c.ma, them: kq.them, thay: kq.thay, loi: kq.loi };
    }
    if (!hoi || (!baiKhac && !thay.length)) return Promise.resolve(lam());
    return TP.Hop.xacNhan({
      tieuDe: t('go.napGiai'), noiDung: t('go.napGiaiHoi', { ten: c.nhan }), canhBao: thay.length ? t('go.napGiaiThayHam', { ds: thay.join(', ') }) : undefined,
      co: t('go.napGiaiCo'), mau: 'g-gr'
    }).then(function (ok) { return ok ? lam() : { ok: false, loi: 'huy' }; });
  }

  /** Vào màn m NGAY (bỏ qua khóa); công tắc "Nạp hàm chuẩn" bật thì nạp kho trước. */
  function vaoNgay(m) {
    TP.Hop.dong();
    if (docCai().napHam) {
      var kq = napHamChuan(m);
      try { console.info('[GoLoi] ' + m.id + ' ' + m.ma + ': nạp hàm chuẩn — thêm ' + kq.them.length + ', thay ' + kq.thay.length + ', sẵn ' + kq.giu + (kq.loi.length ? ', LỖI ' + kq.loi.join('; ') : '')); } catch (e) { /* bỏ qua */ }
    }
    App.vaoMan(m.ma);
  }

  /** "Mở hết" đang bật, vào màn từ lưới màn thường: công tắc "Nạp hàm chuẩn" bật thì thêm hàm cốt truyện còn thiếu (không thay hàm đã có). */
  function napKhiMoHet(m) {
    if (!docCai().napHam) return null;
    var kq = napHamChuan(m, true);
    if (kq.them.length || kq.loi.length) { try { console.info('[GoLoi] Mở hết, ' + m.id + ' ' + m.ma + ': thêm ' + kq.them.length + ' hàm còn thiếu' + (kq.loi.length ? ', LỖI ' + kq.loi.join('; ') : '')); } catch (e) { /* bỏ qua */ } }
    return kq;
  }

  /** Địa chỉ có `man=<mã hoặc id>` (vd `choi.html?debug=1&man=vong-lap.10` hay `#man=6.10`): vào thẳng màn đó lúc mở trang
   *  (như chạm màn trong bảng Gỡ lỗi; công tắc "Nạp hàm chuẩn" bật thì nạp kho trước). */
  function vaoTuDiaChi() {
    try {
      var q = (location.search || '') + '&' + (location.hash || '').replace(/^#/, '');
      var k = /[?&]man=([^&]+)/.exec(q);
      if (!k) return;
      var ma = decodeURIComponent(k[1]), m = ManHoc.timMa(ma) || ManHoc.tim(ma);
      if (!m) return;
      S.daMo = true; vaoNgay(m);
      var g = /[?&]loigiai=([^&]+)/.exec(q), tt = window.Choi && Choi.trangThai();       // `loigiai=1` (chuẩn) hay mã một cách (khac, ct2, lap1…): nạp luôn, không hỏi (địa chỉ đã nói rõ)
      if (g && tt && tt.man && (tt.man.manGoc || tt.man).ma === m.ma) napLoiGiai(g[1] === '1' ? null : decodeURIComponent(g[1]), false);
    } catch (e) { /* bỏ qua */ }
  }
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('load', function () { setTimeout(vaoTuDiaChi, 50); });

  /* ---------------------------------------------------------------- xóa tiến độ */
  /** Xóa sao / tiến độ, cờ đã xem, bản nháp mọi màn; kemKho thì xóa cả kho hàm (và sân thử của từng hàm). Bảng cài đặt của chính Gỡ lỗi không bị xóa. */
  function xoaTienDo(kemKho) {
    Luu.xoaTienDo();
    ManHoc.danhSach.forEach(function (m) { Luu.xoaNhap(m.ma); if (Luu.xoaLap) Luu.xoaLap(m.ma); });
    if (kemKho) {
      var ten = {};
      KhoHam.ds().forEach(function (f) { ten[f.ten] = true; });
      ManHoc.danhSach.forEach(function (m) { (m.taoHam || []).forEach(function (n) { ten[n] = true; }); });
      Object.keys(ten).forEach(function (n) { Luu.xoaSanThu(n); });
      KhoHam.docLuu({ getItem: function () { return null; } });          // "không có gì được lưu" → kho rỗng (tên cố định vẫn khóa)
      Luu.ghiKho();
    }
    if (window.App && App.veLai) App.veLai(); else if (window.Chon) Chon.ve();
    var dangChoi = !document.getElementById('sc-choi').classList.contains('hidden');
    if (dangChoi) App.veChon();                                          // sao ở màn đang chơi đã cũ: về màn chọn
  }

  /* ---------------------------------------------------------------- bảng */
  function vuaTieuDe(td) {
    td.style.removeProperty('--ts');
    if (!td.clientWidth) return;
    var ts = 1;
    while (td.scrollWidth > td.clientWidth + 1 && ts > 0.5) { ts = Math.round((ts - 0.04) * 100) / 100; td.style.setProperty('--ts', ts); }
  }

  function oMan(m) {
    var sao = Luu.saoTot(m.ma), mo = App.trangThai(m).mo;
    var b = h('button', 'bt go-man ' + (m.hang === 'trum' ? 'trum ' : '') + (sao > 0 ? 'xong' : mo ? 'mo' : 'khoa'));
    b.setAttribute('data-man', m.ma); b.setAttribute('data-id', m.id); b.setAttribute('aria-label', m.id + ' ' + m.ten);
    var trai = h('span', 'go-trai');
    trai.appendChild(h('span', 'go-so', App.sttCua(m)));
    var st = h('span', 'go-sao');
    for (var i = 0; i < 3; i++) st.appendChild(Ve.sao(i < sao, 1));
    trai.appendChild(st);
    b.appendChild(trai);
    b.appendChild(h('span', 'go-ten', m.ten));
    b.addEventListener('click', function () { vaoNgay(m); });
    return b;
  }

  function congTat(ten, chu, bat, khiDoi) {
    var hang = h('div', 'go-cong'); hang.setAttribute('data-cong', ten);
    hang.appendChild(h('span', 'go-cong-chu', chu));
    var b = h('button', 'bt go-sw'); b.setAttribute('data-nut', ten);
    function ve() { b.className = 'bt go-sw ' + (bat ? 'g-gr bat' : 'g-wd'); b.textContent = t(bat ? 'go.bat' : 'go.tat'); b.setAttribute('aria-pressed', bat ? 'true' : 'false'); }
    b.addEventListener('click', function () { bat = !bat; ve(); khiDoi(bat); });
    ve(); hang.appendChild(b);
    return hang;
  }

  /** Mở bảng. ma (tùy chọn): mã chương cần xem sẵn; mặc định chương đang xem ở màn chọn / chương của màn đang chơi.
   *  giu: mở lại sau hộp xác nhận (giữ công tắc "Xóa cả kho hàm"); mở mới thì công tắc đó luôn TẮT. */
  function mo(ma, giu) {
    S.daMo = true;
    if (!giu) S.kemKho = false;
    var dsc = App.dsChuong();
    S.chuong = ma || App.chuong || (dsc[0] && dsc[0].ma);
    var hop = TP.Hop.mo(t('go.tieuDe'), 'hop-go-loi');
    var than = hop.than, cai = docCai();

    var nav = h('div', 'go-nav'), truoc = h('button', 'bt g-pu go-n'), sau = h('button', 'bt g-pu go-n'), td = h('div', 'go-td');
    truoc.setAttribute('data-nut', 'go-truoc'); truoc.setAttribute('aria-label', t('chon.truoc'));
    sau.setAttribute('data-nut', 'go-sau'); sau.setAttribute('aria-label', t('chon.sau'));
    td.setAttribute('data-nut', 'go-chuong');
    [[truoc, 'back'], [sau, 'next']].forEach(function (p) { var ic = h('span'); ic.setAttribute('data-i', p[1]); ic.setAttribute('data-s', '2'); p[0].appendChild(ic); });
    nav.appendChild(truoc); nav.appendChild(td); nav.appendChild(sau);
    var luoi = h('div', 'go-luoi');
    var tin = h('div', 'go-tin' + (S.tin ? ' co' : ''), S.tin || t('go.goiY')); S.tin = '';
    Ve.hydrate(nav);

    function veChuong() {
      var vt = App.chiSoChuong(S.chuong); if (vt < 0) { vt = 0; S.chuong = dsc[0].ma; }
      var cc = dsc[vt];
      td.innerHTML = '';
      td.appendChild(document.createTextNode(t('chon.chuoi', { n: '' })));
      td.appendChild(h('span', 'd', cc.so));
      td.appendChild(document.createTextNode(' · '));
      td.appendChild(h('em', null, cc.ten));
      truoc.classList.toggle('mo-mo', vt <= 0); sau.classList.toggle('mo-mo', vt >= dsc.length - 1);
      vuaTieuDe(td);
      luoi.innerHTML = '';
      App.dsMan(S.chuong).forEach(function (m) { luoi.appendChild(oMan(m)); });
    }
    function doiChuong(d) {
      var i = App.chiSoChuong(S.chuong) + d;
      if (i < 0 || i >= dsc.length) return;
      S.chuong = dsc[i].ma; veChuong();
    }
    truoc.addEventListener('click', function () { doiChuong(-1); });
    sau.addEventListener('click', function () { doiChuong(1); });

    var cong = h('div', 'go-congs');
    cong.appendChild(congTat('go-mo-het', t('go.moHet'), cai.moHet, function (b) { datMoHet(b); veChuong(); }));          // vẽ lại lưới: ô khóa / mở đổi theo
    cong.appendChild(congTat('go-nap-ham', t('go.napHam'), cai.napHam, function (b) { datNapHam(b); }));
    cong.appendChild(congTat('go-tat-hd', t('go.tatHD'), cai.tatHD, function (b) { datTatHD(b); }));
    cong.appendChild(congTat('go-xoa-kho', t('go.xoaKho'), S.kemKho, function (b) { S.kemKho = b; }));

    var hang = h('div', 'hop-hang go-chan');
    hang.appendChild(TP.Hop.nut('g-rd', t('go.xoaTienDo'), function () {
      var kem = S.kemKho;
      TP.Hop.xacNhan({ tieuDe: t('go.xoaTienDo'), noiDung: t(kem ? 'go.xoaKhoHoi' : 'go.xoaTienDoHoi'), co: t('go.xoaCo') }).then(function (ok) {
        if (ok) { xoaTienDo(kem); S.tin = t(kem ? 'go.daXoaKho' : 'go.daXoaTienDo'); S.kemKho = false; }
        mo(S.chuong, true);
      });
    }, 'go-xoa-tien-do'));
    hang.appendChild(TP.Hop.nut('g-wd', t('go.boMua'), function () {           // mua thử (man-goi.js): bỏ cờ đã mua để thử lại nút mua
      Luu.xoaDaMua(); S.tin = t('go.daBoMua'); mo(S.chuong, true); App.veLai();
    }, 'go-bo-mua'));
    hang.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'go-dong'));

    than.appendChild(nav); than.appendChild(luoi);
    var giai = khoiLoiGiai();
    if (giai) than.appendChild(giai);
    than.appendChild(cong); than.appendChild(tin); than.appendChild(hang);
    veChuong();
  }

  /** Khối "Lời giải màn N" (chỉ khi đang ở màn chơi): mỗi lời giải đã lưu một nút (nhãn + sao chấm thử trên kho khoChoCach), dòng mô tả, nút "Nạp lời giải". */
  function khoiLoiGiai() {
    var sc = document.getElementById('sc-choi'), tt = window.Choi && Choi.trangThai(), m = tt && tt.man;
    if (!m || !sc || sc.classList.contains('hidden')) return null;
    var goc = m.manGoc || m, ds = cachGiai(m);
    if (S.giaiMan !== goc.ma) { S.giaiMan = goc.ma; S.giai = ds[0] ? ds[0].ma : null; }
    var k = h('div', 'go-giai'); k.setAttribute('data-man', goc.ma);
    k.appendChild(h('div', 'go-giai-td', t('go.giaiTieuDe', { id: m.id })));
    if (!ds.length) { k.appendChild(h('div', 'go-giai-mo', t('go.giaiKhongCo'))); return k; }
    if (!ds.some(function (c) { return c.ma === S.giai; })) S.giai = ds[0].ma;
    var hang = h('div', 'go-giai-ds'), dongMoTa = h('div', 'go-giai-mo'), nut = {};
    function chon(ma) {
      S.giai = ma;
      ds.forEach(function (c) { nut[c.ma].classList.toggle('on', c.ma === ma); nut[c.ma].setAttribute('aria-pressed', c.ma === ma ? 'true' : 'false'); });
      dongMoTa.textContent = ds.filter(function (c) { return c.ma === ma; })[0].moTa;
    }
    ds.forEach(function (c) {
      var r = chamCach(m, c);
      var b = h('button', 'bt go-giai-c ' + (r.sao === 3 ? 'ba' : r.thang ? 'thang' : 'thua'));
      b.setAttribute('data-cach', c.ma); b.setAttribute('data-sao', r.sao);
      b.appendChild(h('span', 'n', c.nhan));
      b.appendChild(h('span', 's', r.thang ? t('go.giaiSao', { n: r.sao }) : t('go.giaiThua')));
      b.addEventListener('click', function () { chon(c.ma); });
      nut[c.ma] = b; hang.appendChild(b);
    });
    k.appendChild(hang); k.appendChild(dongMoTa);
    var hn = h('div', 'hop-hang go-giai-hang');
    hn.appendChild(TP.Hop.nut('g-gr', t('go.napGiai'), function () {
      var ma = S.giai;
      TP.Hop.dong();
      napLoiGiai(ma, true).then(function (kq) { if (kq.loi === 'huy') mo(S.chuong, true); });     // hủy ở hộp hỏi: mở lại bảng
    }, 'go-nap-giai'));
    k.appendChild(hn);
    chon(S.giai);
    return k;
  }

  /** Nút 🐞 (màn khởi đầu, chọn gói, lưới màn: cạnh nút Sổ lệnh); chỉ có khi địa chỉ mang cờ debug. */
  function nutBug(cha) {
    if (!coCo()) return null;
    var b = h('button', 'bt g-wd go-bug', '🐞'); b.setAttribute('data-nut', 'go-loi'); b.setAttribute('aria-label', t('chon.goLoi'));
    b.addEventListener('click', function () { mo(); });
    cha.appendChild(b);
    return b;
  }

  // thêm #debug vào địa chỉ khi đang ở màn chọn: vẽ lại để nút 🐞 hiện
  window.addEventListener('hashchange', function () { if (window.App && App.veLai) App.veLai(); else if (window.Chon) Chon.ve(); });

  window.GoLoi = {
    mo: mo, nutBug: nutBug, coCo: coCo, laBat: laBat,
    docMoHet: docMoHet, datMoHet: datMoHet, tatHuongDan: tatHuongDan,
    khoThamChieu: khoThamChieu, napHamChuan: napHamChuan, napKhiMoHet: napKhiMoHet, vaoNgay: vaoNgay, xoaTienDo: xoaTienDo,
    cachGiai: cachGiai, khoChoCach: khoChoCach, chamCach: chamCach, napLoiGiai: napLoiGiai, giongBai: giongBai
  };
})();
