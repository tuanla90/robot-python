/* ============================================================================
   go-loi.js — "Đường học": BẢNG GỠ LỖI "chơi một màn bất kỳ" (window.GoLoi). Chỉ để người làm game thử màn.
   Mở bằng: giữ lâu tiêu đề màn chọn 2 giây · nút 🐞 ở hàng "Hàm của em" (khi địa chỉ có ?debug=1 hoặc #debug) · mục "Gỡ lỗi" trong menu ☰ của màn chơi.
   Trong bảng: ‹ Chương N · tên › chọn chương (mọi chương, kể cả đợt 2) · lưới các màn của chương (số, tên, sao): chạm một màn là vào màn đó NGAY, bỏ qua khóa ·
   công tắc "Mở hết" (lưu ở localStorage, App.moHet đọc lại lúc khởi động) · "Nạp hàm chuẩn khi vào màn" (mặc định BẬT) · "Xóa tiến độ" (kèm "Xóa cả kho hàm" nếu bật).

   NẠP HÀM CHUẨN (khoThamChieu / napHamChuan): trước khi vào màn X, dựng kho tham chiếu như người chơi đã qua MỌI màn đứng trước X (theo thứ tự ManHoc.danhSach):
   trộn loiGiai.hamCuaEmMoi của từng màn vào kho theo tên, màn sau ghi đè màn trước (che-xe.5 sửa u_turn, che-xe.9 sửa turn_right / turn_left).
   Màn "tiết kiệm nhịp" (tietKiemNhip: tay-gap.9) sửa riêng hàm có sẵn, không ghi vào kho dùng chung (giống kiem-hoc.mjs). Hàm trong man.taoHam của X không nạp sẵn (người chơi tự chế ở màn).
   Ghi vào kho thật qua KhoHam (tao / sua) rồi Luu.ghiKho(): chỉ thêm / thay hàm cốt truyện, hàm tự đặt khác của người chơi giữ nguyên. Vào màn xong khay tự vẽ lại (Choi.vao).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var KHOA_CAI = 'duong-hoc:go-loi';          // { moHet: bool, napHam: bool } — riêng, "Xóa tiến độ" không đụng tới
  var S = { chuong: null, kemKho: false, tin: '', daMo: false };

  /* ---------------------------------------------------------------- cài đặt (localStorage) */
  function docCai() {
    var c = { moHet: false, napHam: true };
    try {
      var d = JSON.parse(Luu.kho.getItem(KHOA_CAI) || 'null');
      if (d && typeof d === 'object') {
        if (typeof d.moHet === 'boolean') c.moHet = d.moHet;
        if (typeof d.napHam === 'boolean') c.napHam = d.napHam;
      }
    } catch (e) { /* chạy với mặc định */ }
    return c;
  }
  function ghiCai(c) { try { Luu.kho.setItem(KHOA_CAI, JSON.stringify(c)); } catch (e) { /* chạy không lưu */ } }
  function docMoHet() { return docCai().moHet; }
  function datMoHet(b) {
    var c = docCai(); c.moHet = !!b; ghiCai(c);
    App.moHet = c.moHet;
    if (window.Chon) Chon.ve();
  }
  function datNapHam(b) { var c = docCai(); c.napHam = !!b; ghiCai(c); }

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
  function saoHam(f) { return { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: (f.than || []).slice() }; }
  function giongHam(a, b) {
    return JSON.stringify([a.thamSo || [], a.than || []]) === JSON.stringify([b.thamSo || [], b.than || []]);
  }

  /** Kho tham chiếu LÚC TỚI màn m: [{ ten, thamSo, than }] theo thứ tự hàm xuất hiện; không gồm hàm trong m.taoHam. */
  function khoThamChieu(m) {
    var ds = [], chi = {}, tao = m.taoHam || [];
    for (var i = 0; i < ManHoc.danhSach.length; i++) {
      var x = ManHoc.danhSach[i];
      if (x.ma === m.ma) break;
      ((x.loiGiai && x.loiGiai.hamCuaEmMoi) || []).forEach(function (f) {
        var k = chi[f.ten];
        if (k === undefined) { chi[f.ten] = ds.length; ds.push(saoHam(f)); }
        else if (x.tietKiemNhip !== true) ds[k] = saoHam(f);              // màn sau ghi đè màn trước; màn tiết kiệm nhịp chỉ sửa riêng
      });
    }
    return ds.filter(function (f) { return tao.indexOf(f.ten) < 0; });
  }

  /** Nạp kho tham chiếu vào kho thật của người chơi. Trả về { them, thay, giu, loi } (tên hàm đã thêm / đã thay / số hàm đã đúng sẵn / lỗi). */
  function napHamChuan(m) {
    var ref = khoThamChieu(m), kq = { them: [], thay: [], giu: 0, loi: [] };
    ref.forEach(function (f) {
      var co = KhoHam.tim(f.ten), viec;
      if (!co) {
        var r = KhoHam.tao(f.ten, f.thamSo, { taoHam: [f.ten] });
        if (!r.ok) { kq.loi.push(f.ten + ': ' + r.loi); return; }
        viec = kq.them;
      } else if (giongHam(co, f)) { kq.giu++; return; }
      else viec = kq.thay;
      var r2 = KhoHam.sua(f.ten, f.than, f.thamSo);
      if (!r2.ok) { kq.loi.push(f.ten + ': ' + r2.loi); return; }
      viec.push(f.ten);
    });
    if (kq.them.length || kq.thay.length) { var g = Luu.ghiKho(); if (!g.ok) kq.loi.push(g.loi); }
    return kq;
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

  /* ---------------------------------------------------------------- xóa tiến độ */
  /** Xóa sao / tiến độ, cờ đã xem, bản nháp mọi màn; kemKho thì xóa cả kho hàm (và sân thử của từng hàm). Bảng cài đặt của chính Gỡ lỗi không bị xóa. */
  function xoaTienDo(kemKho) {
    Luu.xoaTienDo();
    ManHoc.danhSach.forEach(function (m) { Luu.xoaNhap(m.ma); });
    if (kemKho) {
      var ten = {};
      KhoHam.ds().forEach(function (f) { ten[f.ten] = true; });
      ManHoc.danhSach.forEach(function (m) { (m.taoHam || []).forEach(function (n) { ten[n] = true; }); });
      Object.keys(ten).forEach(function (n) { Luu.xoaSanThu(n); });
      KhoHam.docLuu({ getItem: function () { return null; } });          // "không có gì được lưu" → kho rỗng (tên cố định vẫn khóa)
      Luu.ghiKho();
    }
    if (window.Chon) Chon.ve();
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
    cong.appendChild(congTat('go-xoa-kho', t('go.xoaKho'), S.kemKho, function (b) { S.kemKho = b; }));

    var hang = h('div', 'hop-hang go-chan');
    hang.appendChild(TP.Hop.nut('g-rd', t('go.xoaTienDo'), function () {
      var kem = S.kemKho;
      TP.Hop.xacNhan({ tieuDe: t('go.xoaTienDo'), noiDung: t(kem ? 'go.xoaKhoHoi' : 'go.xoaTienDoHoi'), co: t('go.xoaCo') }).then(function (ok) {
        if (ok) { xoaTienDo(kem); S.tin = t(kem ? 'go.daXoaKho' : 'go.daXoaTienDo'); S.kemKho = false; }
        mo(S.chuong, true);
      });
    }, 'go-xoa-tien-do'));
    hang.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'go-dong'));

    than.appendChild(nav); than.appendChild(luoi); than.appendChild(cong); than.appendChild(tin); than.appendChild(hang);
    veChuong();
  }

  /** Nút 🐞 trên màn chọn (đặt cạnh nút Sổ lệnh); chỉ có khi địa chỉ mang cờ debug. */
  function nutBug(cha) {
    if (!coCo()) return null;
    var b = h('button', 'bt g-wd go-bug', '🐞'); b.setAttribute('data-nut', 'go-loi'); b.setAttribute('aria-label', t('chon.goLoi'));
    b.addEventListener('click', function () { mo(); });
    cha.appendChild(b);
    return b;
  }

  // thêm #debug vào địa chỉ khi đang ở màn chọn: vẽ lại để nút 🐞 hiện
  window.addEventListener('hashchange', function () { if (window.Chon) Chon.ve(); });

  window.GoLoi = {
    mo: mo, nutBug: nutBug, coCo: coCo, laBat: laBat,
    docMoHet: docMoHet, datMoHet: datMoHet,
    khoThamChieu: khoThamChieu, napHamChuan: napHamChuan, vaoNgay: vaoNgay, xoaTienDo: xoaTienDo
  };
})();
