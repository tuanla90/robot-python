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
  var S = { loai: null, ten: null, than: null, ed: null, pal: null, field: null, rid: 0, busy: false, ketThu: null, coBong: false, cdi: 0, st: null, che: null, doiSo: {} };   // doiSo: 'loai:tên hàm' → giá trị thử của từng đối số
  var NHIP_MS = 230, LENH_MS = 45, TOAST_MS = 2000;
  var CHE = { xe: 'che-xe', vat: 'che-vat', tuong: 'che-tuong', mau: 'che-mau' };
  /* Các loại Ô đặc biệt của từng chương (hàng rào, nút bắn, cửa, ô sạc) gộp vào MỘT nút chọn theo vòng "Ô: Rào → Nút → Cửa" (nút .nut-o): chạm khi chưa ở chế độ ô = bật loại đang chọn;
     chạm khi đang ở chế độ ô = chuyển sang loại kế tiếp (chương chỉ có một loại thì chạm lại = tắt, như nút chế độ thường). Chế độ trong S.che vẫn là 'rao' | 'nut' | 'cua' | 'sac'. */
  var LOAI_O = {
    rao: { lop: 'g-wd', bieu: 'rao', vien: '#3a1c00', chu: 'xuong.rao', toi: false },
    nut: { lop: 'g-rd', bieu: 'nutban', vien: '#4a0e0c', chu: 'xuong.nut', toi: false },
    cua: { lop: 'g-cy', bieu: 'cua', vien: '#0a3f4a', chu: 'xuong.cua', toi: false },
    sac: { lop: 'g-yl dark', bieu: 'sac', vien: '#6a4400', chu: 'xuong.sac', toi: true }
  };
  var MAU_VONG = [null, 'red', 'green', 'blue', 'yellow'];                 // chạm ô (chế độ Màu): không màu → đỏ → xanh lá → xanh dương → vàng → không màu
  var MAU_KY = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };
  function mauKeTiep(m) { return MAU_VONG[(MAU_VONG.indexOf(m || null) + 1) % MAU_VONG.length]; }
  var DS_GOI_Y = ['n', 'k', 'a', 'b', 'd', 'x'], DS_TOI_DA = 2, DS_THU_MAC_DINH = 2;     // gợi ý tên đối số, số đối số tối đa của hàm mới, giá trị thử mặc định

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
          '<div class="thu-hang"><button class="bt g-gr cbtn" data-nut="thu"><span data-i="play" data-s="2" data-l="#14561e"></span><span class="cl">' + t('xuong.thu') + '</span></button><span class="dso"></span></div>' +
          '<button class="bt g-bl cbtn" data-nut="lai"><span data-i="reset" data-s="2" data-l="#0f2f6a"></span>' + t('xuong.lai') + '</button>' +
          '<button class="bt g-yl cbtn dark mode" data-nut="' + CHE.xe + '" data-che="xe"><span data-i="car" data-s="2" data-l="#6a4400"></span>' + t('xuong.datXe') + '</button>' +
          '<button class="bt g-or cbtn mode" data-nut="' + CHE.vat + '" data-che="vat"><span data-i="box" data-s="2" data-l="#5a2f08"></span>' + t('xuong.vat') + '</button>' +
          '<button class="bt g-gy cbtn mode" data-nut="' + CHE.tuong + '" data-che="tuong"><span data-i="wall" data-s="2" data-l="#2d3340"></span>' + t('xuong.tuong') + '</button>' +
          '<button class="bt g-wd cbtn mode nut-o" data-nut="nut-o"><span class="oi" data-i="rao" data-s="2" data-l="#3a1c00"></span><span class="ol"></span></button>' +
          '<button class="bt g-pu cbtn mode nut-ro" data-nut="nut-ro" aria-pressed="false"><span data-i="ro" data-s="2" data-l="#2a1050"></span>' + t('xuong.ro') + '</button>' +
          '<button class="bt g-gr cbtn nut-pin" data-nut="nut-pin" aria-label="' + t('choi.chonPin') + '"><span data-i="pin" data-s="2" data-l="#14561e"></span><span class="pin-chu">' + t('xuong.pin') + '</span><span class="pin-so"></span></button>' +
          '<button class="bt g-pk cbtn mode nut-mau" data-nut="' + CHE.mau + '" data-che="mau"><span data-i="mau" data-s="2" data-l="#5a1238"></span>' + t('xuong.mau') + '</button>' +
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
    E.side = q('.side'); E.xoaHam = q('[data-nut="xoa-ham"]'); E.thuHang = q('.thu-hang'); E.dso = q('.dso');
    E.canvas = q('.ffr canvas'); E.bongD = q('.p-pal .bong'); E.nutMau = q('.nut-mau'); E.nutO = q('.nut-o'); E.nutRo = q('.nut-ro'); E.nutPin = q('.nut-pin');
    S.field = new SanVe.Field(E.canvas, { kich: 210 });
    S.field.onRung = function () { E.ffr.classList.remove('rung'); void E.ffr.offsetWidth; E.ffr.classList.add('rung'); };
    S.kieu = TP.taoKieu(function () { return { man: A.man(), hamCuaMan: A.bai().hamCuaMan, kho: KhoHam.ds() }; });     // kiểu đối số của hàm: số / một chữ / chuỗi ghép
    S.soMax = TP.taoSoToiDa(function () { return { man: A.man(), hamCuaMan: A.bai().hamCuaMan, kho: KhoHam.ds() }; });
    S.ed = new TP.Editor(q('.rows'), {
      tong: 10, dung: 10, lay: function () { return S.than || []; }, bang: q('.p-prog'),
      nutXoaHet: q('[data-nut="xoa-het"]'), dangChay: function () { return S.busy; },
      thutLe: function () { return TP.coCauTruc(A.man(), 'for') || TP.coCauTruc(A.man(), 'if') || TP.coCauTruc(A.man(), 'while'); },
      camBien: function () { return TP.camBienCua(A.man()); },                                 // điều kiện while / if chạm đổi được: front_clear() …
      bienDuoc: function () { var f = hamHienTai(); return f ? (f.thamSo || []) : []; },       // thân hàm có tham số: chọn được biến ở bộ chọn số
      kieuBien: kieuBienHam,                                                                   // kiểu của từng đối số (số / một chữ / chuỗi) để bộ chọn chỉ liệt kê biến hợp kiểu
      kieuDoiSo: function (ten, k) { return S.kieu(ten, k); },
      soToiDa: function (ten, k) { return S.soMax(ten, k); },                                  // aim(n) chỉ nhận 1–3
      giaBien: giaBienThu,                                                                     // để hiện số lượt của range(n) khi Thử
      tt: q('.p-prog .tt'), ttDay: t('xuong.def'), ttNgan: t('xuong.def'),
      khiDoi: khiSuaThan, khiBam: function () { anBongD(); },
      chiDoc: hamKhoa, khiChiDoc: baoHamKhoa                                                   // hàm của màn bị khóa (man.khoaHamMan, vd. go_out() ở 3.7): chỉ xem
    });
    S.pal = new TP.Palette(q('.pal'), {
      khiChen: function (txt) { S.ed.chen(txt); },
      khiSua: function (loai, ten) { mo(loai, ten); },
      khiBien: function (ten) { thayBien(ten); },
      kieuDoiSo: function (ten, k) { return S.kieu(ten, k); }
    });
    TP.Keo.gan({ ed: S.ed, pal: S.pal, kieuBien: kieuBienHam, khiKeoDong: function () { anBongD(); }, dangChay: function () { return S.busy; }, khiKhongSo: function (ten) { toast(t('xuong.khongCoSo', { ten: ten }), 'bad', 3000); }, khiChiDoc: baoHamKhoa });
    q('[data-nut="xoa-het"]').addEventListener('click', function () {
      if (hamKhoa()) { baoHamKhoa(); return; }
      if (!S.than || !S.than.length) return;
      TP.Hop.xacNhan({ noiDung: t('choi.xoaHetHoi'), co: t('choi.xoaHetCo') }).then(function (ok) { if (ok) S.ed.xoaHet(); });
    });
    q('[data-nut="ve"]').addEventListener('click', dong);
    q('[data-nut="thu"]').addEventListener('click', thu);
    q('[data-nut="lai"]').addEventListener('click', lai);
    Object.keys(CHE).forEach(function (k) {
      q('[data-nut="' + CHE[k] + '"]').addEventListener('click', function () { if (!S.busy) datChe(S.che === k ? null : k); });
    });
    E.nutO.addEventListener('click', function () {
      if (S.busy) return;
      var ds = dsO(); if (!ds.length) return;
      if (ds.indexOf(S.che) < 0) datChe(S.oLoai);                                       // đang ở chế độ khác: bật loại ô đang chọn
      else if (ds.length === 1) datChe(null);                                          // chỉ một loại: chạm lại = tắt
      else { S.oLoai = ds[(ds.indexOf(S.oLoai) + 1) % ds.length]; datChe(S.oLoai); }   // nhiều loại: chạm lại = loại kế tiếp
      veNutO();
    });
    E.nutRo.addEventListener('click', function () { if (!S.busy) datRo(); });
    E.nutPin.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (S.busy) return;
      TP.chonSo({ neo: E.nutPin, so: pinSanThu(), toiDa: 15, khiChon: datPin });          // pin thử 1–15 (bộ chọn số)
    });
    E.canvas.addEventListener('click', chamSan);
    E.xoaHam.addEventListener('click', xoaHam);
  }

  /* --------------------------------------------------------------- mở / đóng */
  /** Hàm của màn mà màn khóa (man.khoaHamMan): chỉ xem thân hàm, không sửa / chèn / xóa / kéo (máy chấm luôn dùng bản mẫu). */
  function hamKhoa() {
    var m = A.man && A.man();
    return S.loai === 'man' && !!(m && m.khoaHamMan && m.khoaHamMan.indexOf(S.ten) >= 0);
  }
  function baoHamKhoa() { toast(t('xuong.hamKhoa'), '', 2800); }
  function hamHienTai() {
    if (S.loai === 'em') return KhoHam.tim(S.ten);
    var m = A.bai().hamCuaMan.filter(function (f) { return f.ten === S.ten; })[0];
    return m || null;
  }
  /** Mở Xưởng sửa hàm `ten`. the (tùy chọn): thẻ khay muốn mở sẵn ('than' | 'tay' | 'cam'), dùng cho hàm mới còn trống tạo từ một thẻ; không có thì theo hàm đang sửa. */
  function mo(loai, ten, the) {
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    S.loai = loai; S.ten = ten; S.theMo = the || null;
    var f = hamHienTai();
    if (!f) return;
    S.than = loai === 'em' ? f.than.slice() : f.than;        // hàm của màn: sửa thẳng vào bản nháp
    E.nm.textContent = ten + '(' + (f.thamSo || []).join(', ') + ')';
    E.host.setAttribute('data-loai', loai);                   // màu tên hàm: xanh lá (của em) / cam (của màn)
    E.host.setAttribute('data-ham', ten);
    E.xoaHam.style.display = loai === 'em' ? 'flex' : 'none';
    E.xoaHam.classList.toggle('nhat', loai === 'em' && KhoHam.tenCoDinh(ten));       // hàm theo cốt truyện: nút xóa mờ, chạm chỉ báo
    E.host.classList.toggle('ham-khoa', hamKhoa());                                    // hàm của màn bị khóa: ẩn nút xóa hết, tiêu đề có ổ khóa
    if (hamKhoa()) setTimeout(baoHamKhoa, TP.XUONG_MS || 0);
    S.ed.nap(function () { return S.than; }, 10);
    S.st = ChamHoc.chuanSanThu(Luu.docSanThu(ten) || ChamHoc.SAN_THU_MAC_DINH);
    E.nutMau.style.display = TP.coMauCua(A.man()) ? '' : 'none';              // nút Màu chỉ có ở màn có cảm biến màu
    var dO = dsO();
    E.nutO.style.display = dO.length ? '' : 'none';                              // nút Ô: máy ném (Rào), súng bóng (Rào → Nút → Cửa), drone có pin (Sạc)
    if (dO.indexOf(S.oLoai) < 0) S.oLoai = dO[0] || null;
    veNutO();
    E.nutRo.style.display = coNem() ? '' : 'none';                              // nút Rổ (rổ có sẵn vật) chỉ có ở màn máy ném
    E.nutPin.style.display = coPin() ? '' : 'none';                             // nút Pin (pin thử) chỉ có ở màn drone có pin
    E.side.classList.toggle('co-mau', TP.coMauCua(A.man()) || dO.length > 0);
    E.side.classList.toggle('co-nem', coNem() || coPin());                       // bảy nút (thêm Ô và Rổ / Pin): thấp hơn nữa; súng bóng chỉ sáu nút
    datChe(null);
    napSan();
    SanVe.datCanhBao(E.ffr, A.man().canhBao);                                   // màn đấu dây ngược / bộ phận hỏng: sân thử cũng nhắc (lõi đưa daoChieu / phanCung xuống sân thử)
    dungDoiSo();
    lamPal(true);
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

  /** Drone: hàm đang sửa có đối số chuỗi (go(d), walk(path)) thì Xưởng cho hiện khối mẫu `if d == "U":` dù màn chưa có battery() — để sửa / viết go(d) như ở chương nhện. */
  function hamChuoiDrone(man) {
    return man.loaiRobot === 'drone' && TP.coCauTruc(man, 'if') && thamSoHienTai().some(function (n) { return kieuBienHam(n) !== 'so'; });
  }
  /** Vẽ khay của Xưởng. lamMoi (mở Xưởng): bỏ thẻ đang chọn, chọn thẻ chứa hàm đang sửa (theo lệnh gốc nó gọi; hàm còn trống thì theo hàm màn bắt chế); không thì giữ thẻ đang chọn. */
  function lamPal(lamMoi) {
    var man = A.man(), chuoiDr = hamChuoiDrone(man);
    S.pal.dung({
      goc: man.hamGoc,
      loai: man.loaiRobot,
      lamMoi: !!lamMoi,
      the: lamMoi ? (S.theMo || TP.theMacDinh({ man: man, kho: KhoHam.ds(), hamMan: A.bai().hamCuaMan, dangSua: hamHienTai() })) : undefined,
      vong: TP.coCauTruc(man, 'for'),
      vongWhile: TP.coCauTruc(man, 'while') && TP.coDieuKienCua(man),
      cam: TP.camBienCua(man),
      mau: TP.coMauCua(man),
      pin: TP.coPinCua(man),
      chuoi: TP.coCauTruc(man, 'for') && (!!man.chuoi || (man.hamGoc || []).some(function (n) { return /^go_/.test(n); })),
      dieuKien: (TP.coCauTruc(man, 'if') && TP.coDieuKienCua(man)) || chuoiDr,
      thamSoChuoi: chuoiDr,                              // khối mẫu `if d == "U":` thay cho khối battery()
      em: (man.moXuong !== false && !man.camHamCuaEm) ? TP.locHamTheoRobot(man, KhoHam.ds()) : null,
      man: A.bai().hamCuaMan,
      bien: (hamHienTai() || {}).thamSo || [],          // hàm có tham số: nhóm BIẾN có thẻ cho từng đối số
      coNutMoi: false,
      boQua: S.ten
    });
  }
  /** Thẻ biến ở kho: thay vào dòng đang chọn (hoặc dòng có số gần nhất phía trên); không có dòng nào thì nhắc. */
  function thayBien(ten) {
    if (S.busy) return;
    if (!S.ed.datBien(ten, kieuBienHam(ten))) toast(t('xuong.khongCoSo', { ten: ten }), 'bad', 3000);
  }
  /** Kiểu của đối số `ten` của hàm đang sửa: 'so' | 'don' (một chữ U/D/L/R) | 'ghep' (chuỗi chữ). */
  function kieuBienHam(ten) {
    var f = hamHienTai(), k = f ? (f.thamSo || []).indexOf(ten) : -1;
    return k < 0 ? 'so' : S.kieu(f.ten, k);
  }

  /* ----------------------------------------- ô số cạnh nút Thử (đối số khi thử) */
  function thamSoHienTai() { var f = hamHienTai(); return f ? (f.thamSo || []) : []; }
  /** Giá trị thử của từng đối số (nhớ theo hàm; số mặc định 2; đối số chữ: "R" cho một chữ, "RRD" cho chuỗi; chuỗi lưu không có nháy). */
  function doiSoHienTai() {
    var nho = S.doiSo[S.loai + ':' + S.ten] || [];
    return thamSoHienTai().map(function (ten, k) {
      var kd = kieuBienHam(ten);
      if (kd === 'so') return nho[k] > 0 ? +nho[k] : DS_THU_MAC_DINH;
      var v = typeof nho[k] === 'string' ? nho[k] : '';
      return /^[UDLR]+$/.test(v) && (kd === 'ghep' || v.length === 1) ? v : (kd === 'don' ? 'R' : 'RRD');
    });
  }
  function giaBienThu() {
    var v = doiSoHienTai(), o = {};
    thamSoHienTai().forEach(function (ten, k) { o[ten] = typeof v[k] === 'string' ? 0 : v[k]; });
    return o;
  }
  function dungDoiSo() {
    var ts = thamSoHienTai(), v = doiSoHienTai();
    E.dso.innerHTML = '';
    E.thuHang.classList.toggle('co-ds', ts.length > 0);
    E.thuHang.classList.toggle('ds2', ts.length > 1);
    ts.forEach(function (ten, k) {
      var kd = kieuBienHam(ten), laChu = kd !== 'so';
      var b = h('button', 'bt g-pu dso-o' + (laChu ? ' chu' : '')); b.setAttribute('data-nut', 'doi-so'); b.setAttribute('data-k', k); b.setAttribute('data-ten', ten);
      b.setAttribute('aria-label', t(laChu ? 'xuong.doiChuoi' : 'xuong.doiSo', { ten: ten }));
      b.appendChild(h('span', 'k', ten)); b.appendChild(h('span', 'v', String(v[k])));
      b.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (S.busy) return;
        if (laChu) TP.chonChuoi({ neo: b, kieu: kd, gia: doiSoHienTai()[k], bien: [], khiChon: function (s) { datDoiSo(k, s.replace(/"/g, '')); } });
        else TP.chonSo({ neo: b, so: doiSoHienTai()[k], toiDa: S.soMax(S.ten, k), khiChon: function (n) { datDoiSo(k, n); } });      // đối số đưa thẳng vào aim(): chỉ 1–3
      });
      E.dso.appendChild(b);
    });
  }
  function datDoiSo(k, n) {
    var v = doiSoHienTai(); v[k] = n; S.doiSo[S.loai + ':' + S.ten] = v;
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    S.field.datLai(); xoaKetThu(); anToast();
    dungDoiSo();
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
    S.field.nap({ san: ChamHoc.hangSanThu(st), batDau: st.batDau, loaiRobot: A.man().loaiRobot || 'banh', vat: st.vat, thung: st.thung, robot: VeRobot.cauHinhCua(A.man()), mau: lopMauSan(st), roBanDau: st.ro === true && coNem() ? true : undefined, danToiDa: coSung() ? A.man().danToiDa : undefined, pin: coPin() ? pinSanThu() : undefined });
    veNutRo(); vePin();
  }
  /** Màn drone có pin (man.pin): Xưởng có nút Sạc và Pin. */
  function coPin() { var m = A.man(); return m.loaiRobot === 'drone' && (typeof m.pin === 'number' || Array.isArray(m.pin)); }
  /** Pin của sân thử: sanThu.pin, không có thì pin của màn (sân đầu tiên nếu màn nhiều sân). */
  function pinSanThu() { var m = A.man(), st = S.st; return st && typeof st.pin === 'number' ? st.pin : (Array.isArray(m.pin) ? m.pin[0] : m.pin); }
  /** Số pin thử hiện trên nút Pin. */
  function vePin() { E.nutPin.querySelector('.pin-so').textContent = coPin() ? String(pinSanThu()) : ''; }
  /** Đổi pin thử (lưu cùng sân thử). */
  function datPin(n) {
    var moi = banSao(S.st); moi.pin = n;
    S.st = ChamHoc.chuanSanThu(moi);
    Luu.ghiSanThu(S.ten, S.st);
    napSan(); xoaKetThu(); toast(t('xuong.pinDat', { n: n }), '', 2000);
  }
  /** Nút Rổ sáng khi sân thử cho rổ có sẵn một vật. */
  function veNutRo() { var on = !!(S.st && S.st.ro); E.nutRo.classList.toggle('on', on); E.nutRo.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  /** Bật / tắt "rổ có sẵn vật" của sân thử (lưu cùng sân thử). */
  function datRo() {
    var st = S.st, moi = banSao(st); moi.ro = !st.ro;
    S.st = ChamHoc.chuanSanThu(moi);
    Luu.ghiSanThu(S.ten, S.st);
    napSan(); xoaKetThu(); toast(t(S.st.ro ? 'xuong.roCo' : 'xuong.roTrong'), '', 2200);
  }
  /** Lớp màu sàn của sân thử (mảng chuỗi r g b y '.') cho sân vẽ, hoặc null nếu không có ô màu. */
  function lopMauSan(st) {
    if (!st.mau || !st.mau.length) return null;
    var rows = [], x, y;
    for (y = 0; y < st.cao; y++) { var d = ''; for (x = 0; x < st.rong; x++) d += '.'; rows.push(d); }
    st.mau.forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + MAU_KY[o.mau] + rows[o.y].slice(o.x + 1); });
    return rows;
  }
  function datChe(k) {
    S.che = k;
    if (k === 'vat' && coNamCham()) toast(t('xuong.vatGoiY'), '', 2600);
    if (k === 'rao') toast(t('xuong.raoGoiY'), '', 2600);
    if (k === 'sac') toast(t('xuong.sacGoiY'), '', 2600);
    if (k === 'nut') toast(t('xuong.nutGoiY'), '', 2600);
    if (k === 'cua') toast(t('xuong.cuaGoiY'), '', 2600);
    Object.keys(CHE).forEach(function (x) {
      var b = E.host.querySelector('[data-nut="' + CHE[x] + '"]');
      if (b) b.classList.toggle('on', x === k);
    });
    E.nutO.classList.toggle('on', dsO().indexOf(k) >= 0);
    E.ffr.classList.toggle('sua', !!k);
  }
  /** Bản sao sâu của cấu hình sân thử để sửa (mọi danh sách ô, kể cả nút và cửa của chương súng bóng). */
  function banSao(st) {
    var m = Object.assign({}, st);
    m.batDau = Object.assign({}, st.batDau);
    ['vat', 'tuong', 'thung', 'mau', 'rao', 'nut', 'cua', 'sac'].forEach(function (k) { if (st[k]) m[k] = st[k].map(function (o) { return Object.assign({}, o); }); });
    return m;
  }
  /** Gì đang ở ô (x, y) của sân thử: 'xe' | 'tuong' | 'nut' | 'cua' | 'rao' | 'thung' | 'vat' | null. (Luật vật 14/10: vật chiếm ô, không nằm dưới xe được; lõi chuanSanThu cũng bỏ vật đè xe.) */
  function coGi(x, y) {
    var st = S.st;
    if (st.batDau.x === x && st.batDau.y === y) return 'xe';
    function trong(ds) { return ds.some(function (o) { return o.x === x && o.y === y; }); }
    if (trong(st.tuong)) return 'tuong';
    if (trong(st.nut || [])) return 'nut';
    if (trong(st.cua || [])) return 'cua';
    if (trong(st.rao || [])) return 'rao';
    if (trong(st.thung || [])) return 'thung';
    if (trong(st.vat)) return 'vat';
    return null;
  }
  function coVat(x, y) { return S.st.vat.some(function (o) { return o.x === x && o.y === y; }); }
  /** Các loại ô đặc biệt của chương này, theo thứ tự vòng của nút Ô. */
  function dsO() { return coSung() ? ['rao', 'nut', 'cua'] : coNem() ? ['rao'] : coPin() ? ['sac'] : []; }
  /** Nút Ô: biểu tượng, màu và chữ theo loại đang chọn ("Ô: Rào"). */
  function veNutO() {
    var lo = LOAI_O[S.oLoai]; if (!lo || !E.nutO) return;
    E.nutO.className = 'bt cbtn mode nut-o ' + lo.lop + (E.nutO.classList.contains('on') ? ' on' : '');
    var oi = E.nutO.querySelector('.oi'); oi.innerHTML = ''; oi.setAttribute('data-i', lo.bieu); oi.setAttribute('data-l', lo.vien); Ve.hydrate(E.nutO);
    E.nutO.querySelector('.ol').textContent = t('xuong.o', { ten: t(lo.chu) });
    E.nutO.setAttribute('data-che', S.oLoai);
  }
  function coSung() { return VeRobot.cauHinhCua(A.man()).tay === 'bong'; }                    // súng bóng: có nút Nút (nút bắn) và Cửa
  function coNem() { return VeRobot.cauHinhCua(A.man()).tay === 'nem'; }                       // máy ném: có nút Rào / Rổ
  function coNamCham() { return VeRobot.cauHinhCua(A.man()).tay === 'nam-cham'; }      // nam châm: nút Vật đặt vật GỖ, chạm lại thì thành SẮT, chạm nữa thì bỏ
  function coDay() { return VeRobot.cauHinhCua(A.man()).tay === 'day'; }           // tấm đẩy: nút Vật đặt THÙNG NẶNG
  function boO(ds, x, y) { return ds.filter(function (o) { return !(o.x === x && o.y === y); }); }
  /** Chạm một ô sân thử theo chế độ đang bật. Ô có xe không đặt được vật hay tường (và ngược lại). */
  function chamSan(ev) {
    if (S.busy || !S.che || !S.st) return;
    var r = E.canvas.getBoundingClientRect(), st = S.st;
    var x = Math.floor((ev.clientX - r.left) / r.width * st.rong), y = Math.floor((ev.clientY - r.top) / r.height * st.cao);
    if (x < 0 || y < 0 || x >= st.rong || y >= st.cao) return;
    var co = coGi(x, y), moi = banSao(st);
    if (S.che === 'mau') {                                                             // chế độ Màu: chạm vật thì đổi màu vật, chạm ô khác thì đổi màu sàn
      if (co === 'tuong' || co === 'thung' || co === 'rao' || co === 'nut' || co === 'cua') return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      var vi = -1;
      moi.vat.forEach(function (o, k) { if (o.x === x && o.y === y) vi = k; });
      if (vi >= 0) moi.vat[vi] = { x: x, y: y, mau: mauKeTiep(moi.vat[vi].mau) || undefined, chat: moi.vat[vi].chat };      // đổi màu vật giữ nguyên chất sắt / gỗ
      else {
        var mc = null; moi.mau = moi.mau.filter(function (o) { if (o.x === x && o.y === y) { mc = o.mau; return false; } return true; });
        var mm = mauKeTiep(mc); if (mm) moi.mau.push({ x: x, y: y, mau: mm });
      }
    } else if (S.che === 'vat' && coNamCham()) {                                      // chế độ Vật ở màn nam châm: ô trống → vật gỗ → chạm → vật sắt → chạm → bỏ
      var vj = -1;
      moi.vat.forEach(function (o, k) { if (o.x === x && o.y === y) vj = k; });
      if (vj >= 0) {
        var cu = moi.vat[vj];
        if (cu.chat === 'sat') { moi.vat = boO(moi.vat, x, y); toast(t('xuong.vatBo'), ''); }
        else { moi.vat[vj] = { x: x, y: y, mau: cu.mau, chat: 'sat' }; toast(t('xuong.vatSat'), ''); }
      } else if (!co) { moi.vat.push({ x: x, y: y }); toast(t('xuong.vatGo'), ''); }
      else return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
    } else if (S.che === 'sac') {                                                      // chế độ Sạc (drone): ô trống → ô sạc, chạm ô sạc → bỏ; không đặt lên tường / thùng / rào / nút / cửa
      if ((moi.sac || []).some(function (o) { return o.x === x && o.y === y; })) { moi.sac = boO(moi.sac, x, y); toast(t('xuong.sacBo'), ''); }
      else if (co === 'tuong' || co === 'thung' || co === 'rao' || co === 'nut' || co === 'cua') return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      else { moi.sac = (moi.sac || []).concat([{ x: x, y: y }]); toast(t('xuong.sacDat'), ''); }
    } else if (S.che === 'nut') {                                                      // chế độ Nút (súng bóng): ô trống → nút bắn (nằm như tường), chạm nút → bỏ
      if (co === 'nut') moi.nut = boO(moi.nut || [], x, y);
      else if (co || coVat(x, y)) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + (co || 'vat')) }), 'bad');
      else { moi.nut = (moi.nut || []).concat([{ x: x, y: y }]); toast(t('xuong.nutDat'), ''); }
    } else if (S.che === 'cua') {                                                      // chế độ Cửa: ô trống → cửa đóng → chạm → cửa mở → chạm → bỏ
      var cj = (moi.cua || []).filter(function (o) { return o.x === x && o.y === y; })[0];
      if (cj && !cj.mo) { cj.mo = true; toast(t('xuong.cuaMo'), ''); }
      else if (cj) { moi.cua = boO(moi.cua, x, y); toast(t('xuong.cuaBo'), ''); }
      else if (co || coVat(x, y)) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + (co || 'vat')) }), 'bad');
      else { moi.cua = (moi.cua || []).concat([{ x: x, y: y, mo: false }]); toast(t('xuong.cuaDong'), ''); }
    } else if (S.che === 'rao') {                                                      // chế độ Rào: ô trống → hàng rào, chạm hàng rào → bỏ; không đặt lên xe / vật / tường / thùng
      if (co === 'rao') moi.rao = boO(moi.rao || [], x, y);
      else if (co || coVat(x, y)) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + (co || 'vat')) }), 'bad');
      else moi.rao = (moi.rao || []).concat([{ x: x, y: y }]);          // sân thử chưa có hàng rào nào (súng bóng) thì chưa có mảng rao
    } else if (S.che === 'xe') {
      if (co === 'xe') { if (A.man().loaiRobot === 'nhen' || A.man().loaiRobot === 'drone') return; moi.batDau.huong = (moi.batDau.huong + 1) % 4; }       // nhện không có hướng mặt: chạm lại vào nó không xoay
      else if (co) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      else { moi.batDau.x = x; moi.batDau.y = y; }
    } else {
      var khoa = S.che === 'vat' ? (coDay() ? 'thung' : 'vat') : 'tuong';
      if (co === 'rao' || co === 'nut' || co === 'cua') return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
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
    var ds = doiSoHienTai().map(function (v) { return typeof v === 'string' ? '"' + v + '"' : v; });      // đối số chữ truyền vào code có nháy: go("R"), walk("RRD")
    return ChamHoc.thuHam(man, { chinh: [], hamCuaMan: A.bai().hamCuaMan }, S.ten, KhoHam.ds(), { sanThu: S.st, doiSo: ds });
  }
  function anBongD() { TP.bongAn(E.bongD); S.coBong = false; }
  function xoaKetThu() {
    S.ketThu = null; anBongD();
    S.ed.datChay(null); S.ed.datLoi([]); S.pal.datSang(null); S.pal.datLoi([]);
  }
  /** Các vị trí mà một chẩn đoán trỏ tới (xem man-choi.js). */
  function chiCho(c) {
    var ds = [c.cho || TP.choBoSung(c, S.ketThu && S.ketThu.vet), c.choTruoc, c.choTruot, c.choPush, c.choNem, c.choBan];
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
    var ds = TP.xepChanDoan(loi.concat(tin));
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
    var cap = kq.chanDoan.some(function (c) { return c.ma === 'vong-vo-han'; }) ? { nhip: 6, lenh: 36 } : null;       // while chạy mãi: chỉ phát lại vài nhịp rồi dừng
    var nhipDa = 0, lenhDem = 0, capDung = false;
    for (var i = 0; i < vet.length; i++) {
      var e = vet[i];
      var toc = A.toc() * (nhipDa < 60 ? 1 : nhipDa < 120 ? 3 : 6);          // phát lại dài thì tự tăng tốc
      if (cap) toc = Math.max(toc, 2.5);
      if (e.loai === 'lenh') {
        sang(e, lap.get(e), toc);
        await SanVe.ngu(LENH_MS / toc); if (my !== S.rid) return;
        if (cap && ++lenhDem >= cap.lenh) { capDung = true; break; }
      } else {
        await S.field.phatNhip(e, NHIP_MS / toc); if (my !== S.rid) return;
        nhipDa++; lenhDem = 0;
        if (cap && nhipDa >= cap.nhip) { capDung = true; break; }
      }
    }
    sang(null);
    S.busy = false; E.side.classList.remove('busy');
    hienKetQua(kq);
    if (capDung) toast(t('choi.vongVoHan'), 'bad', 2600);
  }
  /** Chỉ số dòng (từ 0) của thân hàm đang mở mà sự kiện lệnh e đang chạy (kể cả khi lệnh nằm trong hàm khác được gọi từ dòng đó). */
  function dongTrongHam(e) {
    var chuoi = [e.cho].concat(e.ngan || []), dong = null;
    chuoi.forEach(function (c) { if (c && c.ten === S.ten && c.dong > 0) dong = c.dong - 1; });
    return dong;
  }
  function sang(e, lap, toc) {
    if (!e) { S.ed.datChay(null); S.pal.datSang(null); return; }
    if (e.docCamBien) S.field.docCamBien(e.docCamBien, 380 / (toc || 1));       // đọc cảm biến: cảm biến ở hông nháy, tia tới ô được đo
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
  /** Đối số gợi ý của hàm cốt truyện `ten` ở màn này, lấy theo lời giải (vd. forward → ['n'], step → ['a', 'b']). */
  function thamSoGoiY(man, ten) {
    var f = ((man.loiGiai && man.loiGiai.hamCuaEmMoi) || []).filter(function (x) { return x.ten === ten; })[0];
    return f && f.thamSo ? f.thamSo.slice() : [];
  }
  /** Từ chương "Hàm có tham số" trở đi, hộp hàm mới có chỗ khai đối số (trước đó chưa học nên không hiện). */
  function coChoKhaiDoiSo(man) {
    var th = (window.ThuTuChuong && ThuTuChuong.thuTu) || [], a = th.indexOf('tham-so');
    return a >= 0 && th.indexOf(man.chuong) >= a;
  }

  function moiHam(taoXong) {
    var man = A.man();
    var m = TP.Hop.mo(t('ten.tieuDe'), 'hop-ten');
    // hàm THEO CỐT TRUYỆN còn thiếu ở màn này (tên trong taoHam): điền sẵn đúng tên VÀ đối số, ô chỉ đọc, chỉ có nút "Tạo hàm";
    // đủ rồi thì hộp như thường, em tự đặt tên (và đối số) cho hàm riêng của mình
    var coDinh = (man.taoHam || []).filter(function (n) { return !KhoHam.tim(n); })[0] || null;
    var dsTen = coDinh ? thamSoGoiY(man, coDinh) : [], chon = 0;
    var hienDs = dsTen.length > 0 || coChoKhaiDoiSo(man);
    var loi = h('div', 'hop-loi');
    function baoLoi(chu) { loi.textContent = chu; loi.classList.add('co'); }
    function xoaLoi() { loi.textContent = ''; loi.classList.remove('co'); }
    var inp = h('input', 'hop-in'); inp.type = 'text'; inp.maxLength = 24; inp.placeholder = t('ten.mauGo');
    inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('data-nut', 'o-ten');
    function tao(ten) {
      ten = String(ten).trim();
      var tc = { taoHam: man.taoHam || [] };
      var kt = KhoHam.kiemTen(ten, undefined, tc);
      if (!kt.ok) return baoLoi(kt.loi);
      var thamSo = dsTen.map(function (x) { return String(x).trim(); });
      if (thamSo.some(function (x) { return !x; })) return baoLoi(t('ten.doiSoTrong'));
      var r = KhoHam.tao(ten, thamSo, tc);
      if (!r.ok) return baoLoi(r.loi);
      var g = Luu.ghiKho();
      TP.Hop.dong();
      A.khiDoiHam();
      if (!g.ok) A.baoLoi && A.baoLoi(t('tb.khoGhiLoi', { loi: g.loi }));
      taoXong && taoXong(ten);
    }
    if (coDinh) {
      m.than.appendChild(h('div', 'hop-chu nho', t(dsTen.length ? 'ten.coDinhDoiSo' : 'ten.coDinh')));
      inp.value = coDinh; inp.readOnly = true; inp.setAttribute('data-co-dinh', coDinh);
    }
    m.than.appendChild(inp);

    // ---- khai đối số: ten( [n] [k] )  [+ đối số]  và hàng chip tên gợi ý
    if (hienDs) {
      var dsEl = h('span', 'ds-ds'), them = h('button', 'bt g-gr ds-them', t('ten.themDoiSo')), chips = h('div', 'ds-chips');
      them.setAttribute('data-nut', 'them-doi-so');
      var hang0 = h('div', 'hop-ds');
      hang0.appendChild(h('span', 'ngoac', '(')); hang0.appendChild(dsEl); hang0.appendChild(h('span', 'ngoac', ')')); hang0.appendChild(them);
      m.than.appendChild(h('div', 'hop-chu nho ds-nhan', t(coDinh ? 'ten.doiSoCoDinh' : 'ten.doiSo', { n: DS_TOI_DA })));
      m.than.appendChild(hang0);
      var veChip = function () {
        Array.prototype.forEach.call(chips.children, function (c) {
          var n = c.getAttribute('data-ds');
          c.classList.toggle('on', dsTen[chon] === n);
          c.classList.toggle('dung', dsTen.some(function (x, k) { return x === n && k !== chon; }));
        });
      };
      var danhDau = function () { Array.prototype.forEach.call(dsEl.children, function (o, k) { o.classList.toggle('on', k === chon); }); veChip(); };
      var veDs = function () {
        dsEl.innerHTML = '';
        dsTen.forEach(function (n, k) {
          var o = h('span', 'ds-o' + (k === chon ? ' on' : ''));
          var ip = h('input', 'ds-in'); ip.type = 'text'; ip.maxLength = 6; ip.value = n; ip.readOnly = !!coDinh;
          ip.setAttribute('autocapitalize', 'off'); ip.setAttribute('autocomplete', 'off'); ip.setAttribute('spellcheck', 'false');
          ip.setAttribute('data-nut', 'o-doi-so'); ip.setAttribute('data-k', k);
          ip.addEventListener('focus', function () { chon = k; danhDau(); });
          ip.addEventListener('input', function () { dsTen[k] = ip.value; xoaLoi(); veChip(); });
          ip.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') tao(inp.value); });
          o.appendChild(ip);
          if (!coDinh) {
            var x = h('button', 'ds-x', '\u00d7'); x.setAttribute('data-nut', 'bo-doi-so'); x.setAttribute('aria-label', t('ten.boDoiSo', { ten: n }));
            x.addEventListener('click', function () { xoaLoi(); dsTen.splice(k, 1); chon = Math.max(0, Math.min(chon, dsTen.length - 1)); veDs(); });
            o.appendChild(x);
          }
          dsEl.appendChild(o);
        });
        them.style.display = (!coDinh && dsTen.length < DS_TOI_DA) ? '' : 'none';
        veChip();
      };
      var datTen = function (n) {
        xoaLoi();
        if (!dsTen.length) { dsTen.push(n); chon = 0; veDs(); return; }
        if (dsTen.some(function (x, k) { return x === n && k !== chon; })) return;
        dsTen[chon] = n; veDs();
      };
      them.addEventListener('click', function () {
        xoaLoi();
        var moi = DS_GOI_Y.filter(function (x) { return dsTen.indexOf(x) < 0; })[0];
        dsTen.push(moi); chon = dsTen.length - 1; veDs();
      });
      if (!coDinh) {
        DS_GOI_Y.forEach(function (n) {
          var c = h('button', 'bt g-wd ds-chip', n); c.setAttribute('data-ds', n); c.setAttribute('data-nut', 'chip-doi-so');
          c.addEventListener('click', function () { datTen(n); });
          chips.appendChild(c);
        });
        m.than.appendChild(chips);
      }
      veDs();
    }

    m.than.appendChild(loi);
    var hang = h('div', 'hop-hang');
    if (!coDinh) hang.appendChild(TP.Hop.nut('g-wd', t('chung.huy'), function () { TP.Hop.dong(); }, 'huy'));
    hang.appendChild(TP.Hop.nut('g-gr', t('ten.tao'), function () { tao(inp.value); }, 'tao'));
    m.than.appendChild(hang);
    inp.addEventListener('input', xoaLoi);
    inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') tao(inp.value); });
  }

  window.Xuong = {
    dung: dung, mo: mo, dong: dong, dangMo: dangMo, moiHam: moiHam,
    capNhatKho: function () { if (dangMo()) lamPal(); }
  };
})();
