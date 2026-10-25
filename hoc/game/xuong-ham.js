/* ============================================================================
   xuong-ham.js — "Học lập trình": XƯỞNG HÀM (window.Xuong).
   Lớp phủ trượt lên đè màn chơi. Từ trên xuống:
   - thanh trên: ‹ | TÊN HÀM to bằng font code (xanh lá = hàm của em, cam = hàm của màn) | ↺ lấy lại bản đúng (hàm cốt truyện khác bản của game) | 🗑 xóa hàm của em;
     chạm bút chì một hàm khác trong kho khối thì Xưởng chuyển sang hàm đó, ‹ quay lại hàm trước (S.lui), hết chuỗi mới về sân;
   - khối giữa: SÂN THỬ 5×5 cố định (cỡ như sân chính) + cột nút Chạy / Lại / Đặt xe / Đặt vật / Đặt sàn (user 15/10: Đặt vật gom mọi thứ ĐỨNG trên ô — vật, thùng,
     tường, rào, nút, cửa, bậc thang, gầm; Đặt sàn gom thứ NẰM dưới sàn — màu, ô sạc, băng chuyền, hố; mỗi nút mở bảng chọn loại). Đối số thử, pin, rổ nằm trên thanh tên hàm.
     Nút chế độ bật thì sáng viền, bấm lại để tắt; chế độ Đặt xe: KÉO xe tới ô khác (bóng mờ ô đích, thả chỗ không hợp lệ thì về chỗ cũ), CHẠM xe thì xoay 90° theo chiều kim đồng hồ,
     chạm ô trống thì đặt xe vào đó; bấm Thử cũng thoát chế độ. Thêm / bớt vật (khối hàng), thêm / bớt tường. Cách sắp lưu RIÊNG từng hàm (Luu.docSanThu);
   - nửa dưới: khung thân hàm (tiêu đề là chữ `def`) + kho khối (Gốc, hàm khác của em, hàm của màn; không có chính nó).
   Chạy = ChamHoc.thuHam(..., { sanThu }) rồi phát lại vết; lỗi hiện ở bong bóng trên kho khối,
   chạy xong không lỗi thì toast "Xong: n nhịp" 2 giây ở đáy sân thử.
   Hộp đặt tên cho "＋ Hàm mới". Sửa hàm của em → KhoHam.sua + lưu ngay;
   sửa hàm của màn → chỉ vào bản nháp của màn.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var A = null;        // app: { man(), bai(), khiDoiHam(), khiVe({ loai, ten } | null), toc(), theRong(ten), baoLoi(chu) }
  var E = {};          // phần tử
  var S = { loai: null, ten: null, than: null, ed: null, pal: null, field: null, rid: 0, busy: false, ketThu: null, coBong: false, cdi: 0, st: null, che: null, keo: null, doiSo: {}, lui: [] };   // doiSo: 'loai:tên hàm' → giá trị thử của từng đối số; lui: các hàm đã mở trước hàm đang xem [{ loai, ten, the }]
  var NHIP_MS = 230, LENH_MS = 45, TOAST_MS = 2000, KEO_NGUONG = 6;     // KEO_NGUONG: ngón tay / chuột đi quá chừng này px (màn hình) từ lúc bấm xuống thì là KÉO, ít hơn là CHẠM
  var CHE = { xe: 'che-xe', vat: 'che-vat', san: 'che-san' };
  /* Loại thứ đặt được trên sân thử. Chế độ S.che 'vat' (Đặt vật) dùng loại S.coVat, 'san' (Đặt sàn) dùng S.coSan; bảng chọn chỉ có loại màn này dùng tới (dsVat / dsSan).
     ky: ký hiệu sân của lõi (sanThu.ky), băng chuyền thì đổi hướng theo BANG_VONG. */
  var LOAI = {
    vat: { bieu: 'box', mau: '#e0a050', chu: 'xuong.loai.vat', goiY: 'xuong.vatGoiY' },
    thung: { bieu: 'thung', mau: '#b08860', chu: 'xuong.loai.thung', goiY: 'xuong.thungGoiY' },
    tuong: { bieu: 'wall', mau: '#b0b8c8', chu: 'xuong.loai.tuong', goiY: 'xuong.tuongGoiY' },
    rao: { bieu: 'rao', mau: '#e0b868', chu: 'xuong.loai.rao', goiY: 'xuong.raoGoiY' },
    nut: { bieu: 'nutban', mau: '#ff6a5a', chu: 'xuong.loai.nut', goiY: 'xuong.nutGoiY' },
    cua: { bieu: 'cua', mau: '#6fd8e8', chu: 'xuong.loai.cua', goiY: 'xuong.cuaGoiY' },
    bac: { bieu: 'bac', mau: '#d8c898', chu: 'xuong.loai.bac', goiY: 'xuong.bacGoiY', ky: 'S' },
    gam: { bieu: 'gam', mau: '#9aaabb', chu: 'xuong.loai.gam', goiY: 'xuong.gamGoiY', ky: 'n' },
    mau: { bieu: 'mau', mau: '#ff7ab0', chu: 'xuong.loai.mau', goiY: 'xuong.mauGoiY' },
    sac: { bieu: 'sac', mau: '#ffd23a', chu: 'xuong.loai.sac', goiY: 'xuong.sacGoiY' },
    bang: { bieu: 'bang', mau: '#9aaabb', chu: 'xuong.loai.bang', goiY: 'xuong.bangGoiY' },
    ho: { bieu: 'ho', mau: '#8a7058', chu: 'xuong.loai.ho', goiY: 'xuong.hoGoiY', ky: 'u' }
  };
  var BANG_VONG = ['>', 'v', '<', '^'];                                     // chạm băng chuyền: quay hướng theo chiều kim đồng hồ, hết vòng thì bỏ
  function kyTen(k) { return k === 'S' ? 'bac' : k === 'n' ? 'gam' : k === 'u' ? 'ho' : 'bang'; }
  var MAU_VONG = [null, 'red', 'green', 'blue', 'yellow'];                 // chạm ô (chế độ Màu): không màu → đỏ → xanh lá → xanh dương → vàng → không màu
  var MAU_KY = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };
  function mauKeTiep(m) { return MAU_VONG[(MAU_VONG.indexOf(m || null) + 1) % MAU_VONG.length]; }
  var DS_LIST_MAC_DINH = [2, 3, 1], DS_LIST_MAU_MAC_DINH = ['red', 'blue', 'red'], DS_LIST_TOI_DA = 5;                      // danh sách thử mặc định của đối số kiểu list, số ô tối đa trên thanh tên hàm
  var DS_GOI_Y = ['n', 'k', 'a', 'b', 'd', 'x'], DS_TOI_DA = 2, DS_THU_MAC_DINH = 2;     // gợi ý tên đối số, số đối số tối đa của hàm mới, giá trị thử mặc định

  /* -------------------------------------------------------------- dựng DOM */
  function dung(host, app) {
    A = app; E.host = host;
    host.innerHTML =
      '<div class="deco"></div>' +
      '<div class="top"><button class="bt g-or menu" data-nut="ve" aria-label="' + t('xuong.ve') + '"><span data-i="back" data-s="2" data-l="#5a2f08"></span></button>' +
        '<div class="tenham chalk"><span class="nm"></span></div><span class="dso"></span>' +
        '<button class="bt g-bl menu" data-nut="lay-lai" aria-label="' + t('xuong.layLai') + '"><span data-i="reset" data-s="2" data-l="#0f2f6a"></span></button>' +
        '<button class="bt g-rd menu" data-nut="xoa-ham" aria-label="' + t('xuong.xoaHam') + '"><span data-i="trash" data-s="2"></span></button></div>' +
      '<div class="fblock">' +
        '<div class="ffr sua"><canvas class="tex"></canvas><div class="toast"></div></div>' +
        '<div class="side xu">' +
          '<div class="thu-hang"><button class="bt g-gr cbtn" data-nut="thu"><span data-i="play" data-s="1.5" data-l="#14561e"></span><span class="cl">' + t('xuong.thu') + '</span></button></div>' +
          '<button class="bt g-am cbtn" data-nut="nhip"><span data-i="step" data-s="1.5" data-l="#6a4400"></span>' + t('choi.nhip') + '</button>' +
          '<button class="bt g-bl cbtn" data-nut="lai"><span data-i="reset" data-s="1.5" data-l="#0f2f6a"></span>' + t('xuong.lai') + '</button>' +
          '<button class="bt g-am cbtn mode" data-nut="' + CHE.xe + '" data-che="xe"><span data-i="car" data-s="1.5" data-l="#6a4400"></span>' + t('xuong.datXe') + '</button>' +
          '<button class="bt g-or cbtn mode nut-loai" data-nut="' + CHE.vat + '" data-che="vat"><span class="oi" data-i="box" data-s="1.5" data-l="#5a2f08"></span><span class="ol">' + t('xuong.datVat') + '</span></button>' +
          '<button class="bt g-pk cbtn mode nut-loai xu-san" data-nut="' + CHE.san + '" data-che="san"><span class="oi" data-i="mau" data-s="1.5" data-l="#5a1238"></span><span class="ol">' + t('xuong.datSan') + '</span></button>' +
          '<div class="clock chalk xu-dem"><span class="l">' + t('choi.nhipDong') + '</span><span class="v">0</span></div>' +
        '</div></div>' +
      '<div class="low">' +
        '<div class="pan p-prog"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="tt code">' + t('xuong.def') + '</span><span class="chinh-khoa" data-nut="ham-khoa"><span class="ck-ic"></span><span class="ck-chu">' + t('xuong.chiXem') + '</span></span>' +
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
    E.side = q('.side'); E.xoaHam = q('[data-nut="xoa-ham"]'); E.layLai = q('[data-nut="lay-lai"]'); E.thuHang = q('.thu-hang'); E.dso = q('.dso');
    q('.chinh-khoa .ck-ic').appendChild(Ve.khoa(2, true));                       // ổ khóa nhỏ + "Chỉ xem" ở tiêu đề khung thân hàm khi hàm bị khóa (hiện nhờ lớp .co-dinh của khung)
    E.dem = q('.xu-dem .v');                                                     // ô đếm NHỊP n của lượt chạy đang phát
    E.canvas = q('.ffr canvas'); E.bongD = q('.p-pal .bong'); E.nutVat = q('[data-che="vat"]'); E.nutSan = q('[data-che="san"]');
    S.field = new SanVe.Field(E.canvas, { kich: 210 });
    S.field.onRung = function () { E.ffr.classList.remove('rung'); void E.ffr.offsetWidth; E.ffr.classList.add('rung'); };
    S.kieu = TP.taoKieu(function () { return { man: A.man(), hamCuaMan: A.bai().hamCuaMan, kho: KhoHam.ds() }; });     // kiểu đối số của hàm: số / một chữ / chuỗi ghép
    S.soMax = TP.taoSoToiDa(function () { return { man: A.man(), hamCuaMan: A.bai().hamCuaMan, kho: KhoHam.ds() }; });
    S.ed = new TP.Editor(q('.rows'), {
      tong: 10, dung: 10, lay: function () { return S.than || []; }, bang: q('.p-prog'),
      nutXoaHet: q('[data-nut="xoa-het"]'), dangChay: function () { return S.busy; },
      veNhip: function () { var m = A.man(); return !!m && m.loaiRobot !== 'nhen' && m.loaiRobot !== 'drone'; },        // ngoặc nhịp như khung chương trình chính
      thutLe: function () { return TP.coCauTruc(A.man(), 'for') || TP.coCauTruc(A.man(), 'if') || TP.coCauTruc(A.man(), 'while'); },
      camBien: function () { return TP.camBienCua(A.man()); },                                 // điều kiện while / if chạm đổi được: front_clear() …
      bienDuoc: function () { var f = hamHienTai(); return f ? (f.thamSo || []) : []; },       // thân hàm có tham số: chọn được biến ở bộ chọn số
      kieuBien: kieuBienHam,                                                                   // kiểu của từng đối số (số / một chữ / chuỗi) để bộ chọn chỉ liệt kê biến hợp kiểu
      kieuDoiSo: function (ten, k) { return S.kieu(ten, k); },
      soToiDa: function (ten, k) { return S.soMax(ten, k); },                                  // aim(n) chỉ nhận 1–3
      kieuPtuList: kieuPtuThu,                                                                 // đối số danh sách: số hay chữ / màu (theo giá trị thử) để bộ chọn liệt kê biến hợp kiểu
      listChu: function () { return !!TP.coMauCua(A.man()); },                                 // danh sách cho phần tử là màu: bảng chọn phần tử có thêm hàng màu
      giaBien: giaBienThu,                                                                     // để hiện số lượt của range(n) khi Thử
      tt: q('.p-prog .tt'), ttDay: t('xuong.def'), ttNgan: t('xuong.def'),
      khiDoi: khiSuaThan, khiBam: function () { anBongD(); },
      chiDoc: hamKhoa, khiChiDoc: baoHamKhoa,                                                  // hàm của màn bị khóa (man.khoaHamMan, vd. go_out() ở 3.7): chỉ xem
      khiCamNhip: function (ly) { toast(ly, 'bad', 3400); },                                  // mỗi bộ phận một lệnh mỗi nhịp (như khung chương trình chính)
      khiNhip: function (cam) { if (S.pal) S.pal.datCamNhip(cam); }
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
    q('[data-nut="ve"]').addEventListener('click', function () { veTruoc(); });
    q('[data-nut="thu"]').addEventListener('click', function () { thu(false); });
    q('[data-nut="nhip"]').addEventListener('click', function () { thu(true); });       // chạy từng nhịp: mỗi lần bấm phát tới hết nhịp kế tiếp
    q('[data-nut="lai"]').addEventListener('click', lai);
    q('[data-nut="' + CHE.xe + '"]').addEventListener('click', function () { if (!S.busy) datChe(S.che === 'xe' ? null : 'xe'); });
    /* Đặt vật / Đặt sàn: đang bật thì chạm lại = tắt; đang tắt thì mở bảng chọn loại (chỉ một loại thì bật luôn) */
    [['vat', E.nutVat, dsVat], ['san', E.nutSan, dsSan]].forEach(function (x) {
      x[1].addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (S.busy) return;
        if (S.che === x[0]) { datChe(null); return; }
        var ds = x[2](); if (!ds.length) return;
        function chon(ma) { if (x[0] === 'vat') S.coVat = ma; else S.coSan = ma; datChe(x[0]); }
        if (ds.length === 1) { chon(ds[0]); return; }
        TP.chonMuc({ neo: x[1], dang: x[0] === 'vat' ? S.coVat : S.coSan, khiChon: chon,
          ds: ds.map(function (ma) { return { ma: ma, chu: t(LOAI[ma].chu), icon: Ve.ico(LOAI[ma].bieu, 2, { fill: LOAI[ma].mau, line: '#2a1a0a', toi: '#2a1a0a' }) }; }) });
      });
    });
    E.canvas.addEventListener('click', chamSan);
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(function (loai) { E.canvas.addEventListener(loai, xeCon); });       // chế độ Đặt xe: kéo thả / chạm xe (chuột và cảm ứng)
    E.xoaHam.addEventListener('click', xoaHam);
    E.layLai.addEventListener('click', layLai);
  }

  /* --------------------------------------------------------------- mở / đóng */
  /** Hàm đang mở bị KHÓA (chỉ xem thân hàm, không sửa / chèn / xóa / kéo): hàm của màn mà màn khóa (man.khoaHamMan, máy chấm luôn dùng bản mẫu),
   *  hoặc hàm CỐT TRUYỆN của em mà màn này không bắt chế / sửa (TP.khoaKhay / ManHoc.hamSuaDuoc). Hàm tự đặt không bao giờ khóa. Bảng Gỡ lỗi "Mở hết" không mở khóa này. */
  function hamKhoa() {
    var m = A.man && A.man();
    if (!m) return false;
    if (S.loai === 'man') return !!(m.khoaHamMan && m.khoaHamMan.indexOf(S.ten) >= 0);
    return S.loai === 'em' && TP.khoaKhay(m).indexOf('em:' + S.ten) >= 0;
  }
  function baoHamKhoa() { toast(S.loai === 'em' ? t('xuong.hamKhoaEm', { ten: S.ten }) : t('xuong.hamKhoa'), '', 2800); }
  function timHam(loai, ten) {
    if (loai === 'em') return KhoHam.tim(ten);
    return A.bai().hamCuaMan.filter(function (f) { return f.ten === ten; })[0] || null;
  }
  function hamHienTai() { return timHam(S.loai, S.ten); }
  /** Mở Xưởng sửa hàm `ten`. the (tùy chọn): thẻ khay muốn mở sẵn ('than' | 'tay' | 'cam'), dùng cho hàm mới còn trống tạo từ một thẻ; không có thì theo hàm đang sửa.
   *  Xưởng đang mở một hàm khác (chạm bút chì trong kho khối của Xưởng) thì hàm đó vào chuỗi S.lui để ‹ quay lại (23/10: tạo hàm xong lỡ chạm sang hàm khác, ‹ về thẳng sân,
   *  không thấy hàm vừa tạo đâu); quayLai = true khi chính ‹ mở lại hàm trước. Mở từ sân thì chuỗi bắt đầu lại. */
  function mo(loai, ten, the, quayLai) {
    if (!timHam(loai, ten)) return;
    if (!dangMo()) S.lui = [];
    else if (!quayLai && S.ten && !(S.loai === loai && S.ten === ten)) {
      S.lui = S.lui.filter(function (x) { return !(x.loai === loai && x.ten === ten) && !(x.loai === S.loai && x.ten === S.ten); });
      S.lui.push({ loai: S.loai, ten: S.ten, the: S.pal.theHienTai() });
    }
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    if (window.HuongDan) HuongDan.bao('mo-xuong', { loai: loai, ten: ten });
    S.loai = loai; S.ten = ten; S.theMo = the || null;
    TP.datCheList(TP.coListCua(A.man()));                     // gói List: ô phần tử danh sách trong khung thân hàm
    var f = hamHienTai();
    if (!f) return;
    S.than = loai === 'em' ? f.than.slice() : f.than;        // hàm của màn: sửa thẳng vào bản nháp
    E.nm.textContent = ten + '(' + (f.thamSo || []).join(', ') + ')';
    E.host.setAttribute('data-loai', loai);                   // màu tên hàm: xanh lá (của em) / cam (của màn)
    E.host.setAttribute('data-ham', ten);
    E.xoaHam.style.display = loai === 'em' ? 'flex' : 'none';
    E.xoaHam.classList.toggle('nhat', loai === 'em' && KhoHam.tenCoDinh(ten));       // hàm theo cốt truyện: nút xóa mờ, chạm chỉ báo
    veLayLai();
    E.host.classList.toggle('ham-khoa', hamKhoa());                                    // hàm của màn bị khóa: ẩn nút xóa hết, tiêu đề có ổ khóa
    if (hamKhoa() && !quayLai) setTimeout(baoHamKhoa, TP.XUONG_MS || 0);              // mở lại bằng ‹ / ↺: em đã thấy lời nhắc này, để chỗ cho toast "Về hàm …" / "Đã lấy lại …"
    S.ed.nap(function () { return S.than; }, 10);
    S.st = ChamHoc.chuanSanThu(Luu.docSanThu(ten) || sanThuMacDinh(ten));
    var dV = dsVat(), dS = dsSan();
    if (dV.indexOf(S.coVat) < 0) S.coVat = dV[0];
    if (dS.indexOf(S.coSan) < 0) S.coSan = dS[0] || null;
    E.nutSan.style.display = dS.length ? '' : 'none';                           // Đặt sàn chỉ có khi màn có thứ dưới sàn (màu, ô sạc, băng chuyền, hố)
    E.side.classList.remove('co-mau'); E.side.classList.toggle('co-nem', dS.length > 0);   // sáu nút + ô đếm: nút thấp lại cho vừa cột
    veNutLoai();
    S.keo = null;
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
  /** Nút ‹: còn hàm trước trong chuỗi S.lui (hàm đã bị xóa thì bỏ qua) thì mở lại hàm đó ở đúng thẻ khay em đang xem; hết chuỗi thì về sân. */
  function veTruoc() {
    while (S.lui.length) {
      var p = S.lui.pop();
      if (!timHam(p.loai, p.ten)) continue;
      mo(p.loai, p.ten, p.the, true);
      toast(t('xuong.veHam', { ten: p.ten }), '', 1800);
      return;
    }
    dong();
  }
  /** Đóng Xưởng về sân. Màn chơi nhận hàm vừa xem (A.khiVe({ loai, ten })) để khay sang đúng thẻ có hàm đó và nháy nó. */
  function dong() {
    var vua = S.ten && timHam(S.loai, S.ten) ? { loai: S.loai, ten: S.ten } : null;
    S.rid++; S.busy = false; S.lui = [];
    TP.Chan.giu(TP.XUONG_MS + 300);
    E.host.classList.remove('open');
    E.host.removeAttribute('data-ham');
    datChe(null);                                                                      // thoát chế độ sân thử (Đặt xe …), tắt bong bóng hướng dẫn kéo xe
    A.khiVe(vua);
    if (window.HuongDan) HuongDan.bao('dong-xuong');                                  // hướng dẫn từng bước (huong-dan-man.js): đã bấm Về sân
  }
  function dangMo() { return E.host.classList.contains('open'); }

  /** Drone: hàm đang sửa có đối số chuỗi (go(d), walk(path)) thì Xưởng cho hiện khối mẫu `if d == "U":` dù màn chưa có battery() — để sửa / viết go(d) như ở chương nhện. */
  function hamChuoiDrone(man) {
    return man.loaiRobot === 'drone' && TP.coCauTruc(man, 'if') && thamSoHienTai().some(function (n) { var kd = kieuBienHam(n); return kd !== 'so' && kd !== 'list'; });       // đối số một chữ / chuỗi chữ (nhện, drone chương trước): khối if d == "U":; đối số danh sách (flycam) thì không
  }
  /** Vẽ khay của Xưởng. lamMoi (mở Xưởng): bỏ thẻ đang chọn, chọn thẻ chứa hàm đang sửa (theo lệnh gốc nó gọi; hàm còn trống thì theo hàm màn bắt chế); không thì giữ thẻ đang chọn. */
  function lamPal(lamMoi) {
    var man = A.man(), chuoiDr = hamChuoiDrone(man);
    var em = (man.moXuong !== false && !man.camHamCuaEm) ? TP.tachHamKhac(man, TP.locHamTheoRobot(man, KhoHam.ds()), A.bai()) : null;
    S.pal.dung({
      goc: man.hamGoc,
      loai: man.loaiRobot,
      lamMoi: !!lamMoi,
      the: lamMoi ? (S.theMo || TP.theMacDinh({ man: man, kho: KhoHam.ds(), hamMan: A.bai().hamCuaMan, dangSua: hamHienTai() })) : undefined,
      vong: TP.coCauTruc(man, 'for'),
      bienDem: !!man.bienDem,
      list: TP.coListCua(man),                           // gói List: nhóm DANH SÁCH ở thẻ Logic
      vongWhile: TP.coCauTruc(man, 'while') && TP.coDieuKienCua(man),
      cam: TP.camBienCua(man),
      mau: TP.coMauCua(man),
      pin: TP.coPinCua(man),
      chuoi: TP.coCauTruc(man, 'for') && TP.coMauCua(man) !== 'look' && (!!man.chuoi || (man.hamGoc || []).some(function (n) { return /^go_/.test(n); })),
      dieuKien: (TP.coCauTruc(man, 'if') && TP.coDieuKienCua(man)) || chuoiDr,
      thamSoChuoi: chuoiDr,                              // khối mẫu `if d == "U":` thay cho khối battery()
      em: em ? em.chinh : null,
      emKhac: em ? em.khac : [],                         // hàm màn này không dùng tới: nhóm "Hàm khác" thu gọn
      theRong: A.theRong,                                // hàm còn trống thân: thẻ theo lời giải màn
      man: A.bai().hamCuaMan,
      khoa: TP.khoaKhay(man),                            // hàm bị khóa ở màn này: ổ khóa thay bút chì (mở ra chỉ xem)
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

  /** Sân thử mặc định của hàm `ten`. Màn drone có camera nhìn xuống (look()): sân có sẵn ô màu để hàm có cái nhìn thấy — dải hai ô màu ngay chỗ drone đứng cho survey() (đỏ, xanh dương; sau đó là ô không màu để vòng lặp dừng), còn lại một ô xanh dương và một ô đỏ ở bên phải (seek_red, steer…). */
  function sanThuMacDinh(ten) {
    var mac = ChamHoc.SAN_THU_MAC_DINH;
    if (TP.coMauCua(A.man()) !== 'look') return mac;
    var dai = ten === 'survey' ? [{ x: 2, y: 2, mau: 'red' }, { x: 3, y: 2, mau: 'blue' }]
      : (ten === 'patrol' || ten === 'scan_row' || ten === 'go_out') ? [{ x: 4, y: 2, mau: 'yellow' }]                         // hàm đi tới ô vàng (điểm cuối): có sẵn một ô vàng ở bên phải
      : [{ x: 3, y: 2, mau: 'blue' }, { x: 4, y: 2, mau: 'red' }];
    return Object.assign({}, mac, { mau: dai });
  }
  /* ----------------------------------------- ô số cạnh nút Thử (đối số khi thử) */
  function thamSoHienTai() { var f = hamHienTai(); return f ? (f.thamSo || []) : []; }
  /** Giá trị thử của từng đối số (nhớ theo hàm; số mặc định 2; đối số chữ: "R" cho một chữ, "RRD" cho chuỗi; chuỗi lưu không có nháy). */
  function doiSoHienTai() {
    var nho = S.doiSo[S.loai + ':' + S.ten] || [];
    return thamSoHienTai().map(function (ten, k) {
      var kd = kieuBienHam(ten);
      if (kd === 'list') return Array.isArray(nho[k]) ? nho[k].slice() : (TP.coMauCua(A.man()) ? DS_LIST_MAU_MAC_DINH : DS_LIST_MAC_DINH).slice();      // màn có camera look(): danh sách thử mặc định là danh sách MÀU
      if (kd === 'so') return nho[k] > 0 ? +nho[k] : DS_THU_MAC_DINH;
      var v = typeof nho[k] === 'string' ? nho[k] : '';
      return /^[UDLR]+$/.test(v) && (kd === 'ghep' || v.length === 1) ? v : (kd === 'don' ? 'R' : 'RRD');
    });
  }
  function giaBienThu() {
    var v = doiSoHienTai(), o = {};
    thamSoHienTai().forEach(function (ten, k) { o[ten] = Array.isArray(v[k]) ? v[k].length : typeof v[k] === 'string' ? 0 : v[k]; });
    return o;
  }
  function dungDoiSo() {
    var ts = thamSoHienTai(), v = doiSoHienTai();
    E.dso.innerHTML = '';
    ts.forEach(function (ten, k) {
      var kd = kieuBienHam(ten), laChu = kd !== 'so';
      if (kd === 'list') { E.dso.appendChild(chipList(ten, k, v[k])); return; }
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
    /* pin thử (drone có pin) và rổ có sẵn vật (máy ném): cùng hàng với đối số, trên thanh tên hàm */
    function chip(ma, k, v, lop, fn) {
      var b = h('button', 'bt ' + lop + ' dso-o'); b.setAttribute('data-nut', ma);
      b.appendChild(h('span', 'k', k)); b.appendChild(h('span', 'v', v));
      b.addEventListener('click', function (ev) { ev.stopPropagation(); if (!S.busy) fn(b); });
      E.dso.appendChild(b);
    }
    if (coPin()) chip('nut-pin', t('xuong.pin'), String(pinSanThu()), 'g-gr', function (b) { TP.chonSo({ neo: b, so: pinSanThu(), toiDa: 15, khiChon: datPin }); });
    if (coNem()) chip('nut-ro', t('xuong.ro'), S.st && S.st.ro ? '1' : '0', 'g-pu', function () { datRo(); });
    E.dso.style.display = E.dso.firstChild ? '' : 'none';
  }
  /** Chip của đối số DANH SÁCH ở thanh tên hàm: tên đối số + các ô phần tử (số tím / chip màu). Chạm một ô: bảng chọn giá trị + "thêm ô" (sau ô này) + "bỏ ô"; danh sách rỗng có ô +. */
  function chipList(ten, k, ds) {
    var b = h('span', 'bt g-pu dso-o dso-ls'); b.setAttribute('data-nut', 'doi-list'); b.setAttribute('data-k', k); b.setAttribute('data-ten', ten);
    b.setAttribute('role', 'group'); b.setAttribute('aria-label', t('xuong.doiList', { ten: ten }));
    b.appendChild(h('span', 'k', ten));
    var v = h('span', 'v dls');
    if (!ds.length) {
      var p = h('span', 'dp them', '+'); p.setAttribute('data-nut', 'ptu-them-thu');
      p.addEventListener('click', function (ev) { ev.stopPropagation(); if (!S.busy) themPtuThu(k, -1); });
      v.appendChild(p);
    }
    ds.forEach(function (x, j) {
      var c = h('span', 'dp' + (typeof x === 'string' ? ' mc-' + x : ''), String(x)); c.setAttribute('data-nut', 'ptu-thu'); c.setAttribute('data-j', j);
      c.addEventListener('click', function (ev) { ev.stopPropagation(); if (!S.busy) moPtuThu(k, j, c); });
      v.appendChild(c);
    });
    b.appendChild(v);
    return b;
  }
  /** Mở bảng chọn phần tử j của danh sách thử (đối số k). */
  function moPtuThu(k, j, neo) {
    var ds = doiSoHienTai()[k], x = ds[j];
    TP.chonPtu({
      neo: neo, v: typeof x === 'string' ? '"' + x + '"' : String(x), chu: !!TP.coMauCua(A.man()), coThem: ds.length < DS_LIST_TOI_DA, coBo: true,
      khiChon: function (s) { var d = doiSoHienTai()[k]; d[j] = /^"/.test(s) ? s.replace(/"/g, '') : +s; datDoiSo(k, d); },
      khiThem: function () { themPtuThu(k, j); },
      khiBo: function () { var d = doiSoHienTai()[k]; d.splice(j, 1); datDoiSo(k, d); }
    });
  }
  /** Thêm một phần tử ngay sau ô j (-1: danh sách rỗng, thêm ô đầu), rồi mở bảng chọn ở ô mới. */
  function themPtuThu(k, j) {
    var d = doiSoHienTai()[k];
    if (d.length >= DS_LIST_TOI_DA) return;
    d.splice(j + 1, 0, j >= 0 && typeof d[j] === 'string' ? 'red' : 1);
    datDoiSo(k, d);
    var o = E.dso.querySelector ? E.dso.querySelector('[data-k="' + k + '"] [data-j="' + (j + 1) + '"]') : null;
    if (o) moPtuThu(k, j + 1, o);
  }
  /** Kiểu phần tử của danh sách thử (đối số tên `ten` của hàm đang sửa): 'chu' nếu có chữ / màu, không thì 'so'. */
  function kieuPtuThu(ten) {
    var k = thamSoHienTai().indexOf(ten);
    if (k < 0) return null;
    var v = doiSoHienTai()[k];
    return Array.isArray(v) && v.some(function (x) { return typeof x === 'string'; }) ? 'chu' : 'so';
  }
  function datDoiSo(k, n) {
    var v = doiSoHienTai(); v[k] = n; S.doiSo[S.loai + ':' + S.ten] = v;
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    S.field.datLai(); xoaKetThu(); anToast();
    dungDoiSo();
    vuaTen();                                                       // danh sách thử dài ra / ngắn lại: chip rộng hơn thì tên hàm co lại cho vừa thanh
  }

  /* -------------------------------------------------------- sửa thân hàm */
  function khiSuaThan() {
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    if (S.loai === 'em') {
      var r = KhoHam.sua(S.ten, S.than);
      if (!r.ok) { toast(r.loi, 'bad', 3500); return; }
      var g = Luu.ghiKho();
      if (!g.ok) toast(t('tb.khoGhiLoi', { loi: g.loi }), 'bad', 3500);
      veLayLai();
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
    if (E.dso) dungDoiSo();                                                        // pin / rổ trên thanh tên hàm đổi theo sân thử
  }
  /** Màn drone có pin (man.pin): Xưởng có nút Sạc và Pin. */
  function coPin() { var m = A.man(); return m.loaiRobot === 'drone' && (typeof m.pin === 'number' || Array.isArray(m.pin)); }
  /** Pin của sân thử: sanThu.pin, không có thì pin của màn (sân đầu tiên nếu màn nhiều sân). */
  function pinSanThu() { var m = A.man(), st = S.st; return st && typeof st.pin === 'number' ? st.pin : (Array.isArray(m.pin) ? m.pin[0] : m.pin); }
  /** Đổi pin thử (lưu cùng sân thử). */
  function datPin(n) {
    var moi = banSao(S.st); moi.pin = n;
    S.st = ChamHoc.chuanSanThu(moi);
    Luu.ghiSanThu(S.ten, S.st);
    napSan(); xoaKetThu(); toast(t('xuong.pinDat', { n: n }), '', 2000);
  }
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
    huyKeoXe();                                                                      // đang kéo xe dở mà đổi chế độ: xe về chỗ cũ
    S.che = k;
    S.field.datSuaXe(k === 'xe');                                                   // viền nhấp nháy quanh xe khi đang sửa vị trí
    E.canvas.style.touchAction = k === 'xe' ? 'none' : '';                           // kéo xe bằng ngón tay: trình duyệt không được cuộn / thu phóng giữa chừng
    E.canvas.style.cursor = k === 'xe' ? 'grab' : '';
    if (k === 'xe') goiYXe(); else if (window.HuongDan) HuongDan.dung('sua-xe');
    var lo = k === 'vat' ? LOAI[S.coVat] : k === 'san' ? LOAI[S.coSan] : null;
    if (lo) toast(t(lo.goiY), '', 2600);
    veNutLoai();
    Object.keys(CHE).forEach(function (x) {
      var b = E.host.querySelector('[data-nut="' + CHE[x] + '"]');
      if (b) b.classList.toggle('on', x === k);
    });
    E.ffr.classList.toggle('sua', !!k);
  }
  /** Bản sao sâu của cấu hình sân thử để sửa (mọi danh sách ô, kể cả nút và cửa của chương súng hơi). */
  function banSao(st) {
    var m = Object.assign({}, st);
    m.batDau = Object.assign({}, st.batDau);
    ['vat', 'tuong', 'thung', 'mau', 'rao', 'nut', 'cua', 'sac', 'ky'].forEach(function (k) { if (st[k]) m[k] = st[k].map(function (o) { return Object.assign({}, o); }); });
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
    var ky = (st.ky || []).filter(function (o) { return o.x === x && o.y === y; })[0];
    if (ky) return kyTen(ky.ky);
    if (trong(st.thung || [])) return 'thung';
    if (trong(st.vat)) return 'vat';
    return null;
  }
  function coVat(x, y) { return S.st.vat.some(function (o) { return o.x === x && o.y === y; }); }
  /** Ký hiệu sân của màn đang chơi (gộp mọi sân, kể cả màn nhiều sân). */
  function kySan() { var s = A.man().san || []; return (Array.isArray(s[0]) ? [].concat.apply([], s) : s).join(''); }
  /** Loại của Đặt vật: vật, tường luôn có; còn lại theo bộ phận robot và thứ có trên sân màn đang chơi. */
  function dsVat() {
    var k = kySan(), loai = A.man().loaiRobot, ds = ['vat'];
    if (coSung() || /[Hh]/.test(k)) ds.push('thung');
    ds.push('tuong');
    if (coSung() || coNem() || /=/.test(k)) ds.push('rao');
    if (coSung() || /N/.test(k)) ds.push('nut');
    if (coSung() || /[Cc]/.test(k)) ds.push('cua');
    if (loai === 'nhen' || loai === 'xich' || /S/.test(k)) ds.push('bac');
    if (loai === 'nhen' || /n/.test(k)) ds.push('gam');
    return ds;
  }
  /** Loại của Đặt sàn: màu (cảm biến màu / sân có màu), ô sạc (drone có pin), băng chuyền (xe xích / sân có băng), hố (nhện / sân có hố). */
  function dsSan() {
    var m = A.man(), k = kySan(), loai = m.loaiRobot, ds = [];
    if (TP.coMauCua(m) || /[rgby]/.test(k)) ds.push('mau');
    if (coPin() || /P/.test(k)) ds.push('sac');
    if (loai === 'xich' || /[<>^v]/.test(k)) ds.push('bang');
    if (loai === 'nhen' || /u/.test(k)) ds.push('ho');
    return ds;
  }
  /** Nút Đặt vật / Đặt sàn: biểu tượng theo loại đang chọn. */
  function veNutLoai() {
    [[E.nutVat, S.coVat], [E.nutSan, S.coSan]].forEach(function (x) {
      var lo = LOAI[x[1]]; if (!x[0] || !lo) return;
      var oi = x[0].querySelector('.oi'); oi.innerHTML = ''; oi.appendChild(Ve.ico(lo.bieu, 1.5, { fill: lo.mau, line: '#2a1a0a', toi: '#2a1a0a' }));
    });
  }
  function coSung() { return VeRobot.cauHinhCua(A.man()).tay === 'hoi'; }                     // súng hơi: có nút Nút (nút bắn) và Cửa
  function coNem() { return VeRobot.cauHinhCua(A.man()).tay === 'nem'; }                       // máy ném: có nút Rào / Rổ
  function coThung() { return VeRobot.cauHinhCua(A.man()).tay === 'hoi'; }                    // súng hơi: nút Vật đặt THÙNG NẶNG (chỉ cú giật của súng mới dời được thùng)
  function boO(ds, x, y) { return ds.filter(function (o) { return !(o.x === x && o.y === y); }); }
  /** Chạm một ô sân thử theo chế độ đang bật. Ô có xe không đặt được vật hay tường (và ngược lại). */
  function chamSan(ev) {
    if (S.busy || !S.che || S.che === 'xe' || !S.st) return;                           // chế độ Đặt xe không dùng click: có pointer riêng (xeCon)
    var che = S.che === 'vat' ? S.coVat : S.coSan;                                    // loại đang chọn của Đặt vật / Đặt sàn
    var r = E.canvas.getBoundingClientRect(), st = S.st;
    var x = Math.floor((ev.clientX - r.left) / r.width * st.rong), y = Math.floor((ev.clientY - r.top) / r.height * st.cao);
    if (x < 0 || y < 0 || x >= st.rong || y >= st.cao) return;
    var co = coGi(x, y), moi = banSao(st);
    if (che === 'mau') {                                                               // chế độ Màu: chạm vật thì đổi màu vật, chạm ô khác thì đổi màu sàn
      if (co === 'tuong' || co === 'thung' || co === 'rao' || co === 'nut' || co === 'cua') return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      var vi = -1;
      moi.vat.forEach(function (o, k) { if (o.x === x && o.y === y) vi = k; });
      if (vi >= 0) moi.vat[vi] = { x: x, y: y, mau: mauKeTiep(moi.vat[vi].mau) || undefined, chat: moi.vat[vi].chat, cuc: moi.vat[vi].cuc };      // đổi màu vật giữ nguyên chất sắt / gỗ / nam châm (và chữ cực)
      else {
        var mc = null; moi.mau = moi.mau.filter(function (o) { if (o.x === x && o.y === y) { mc = o.mau; return false; } return true; });
        var mm = mauKeTiep(mc); if (mm) moi.mau.push({ x: x, y: y, mau: mm });
      }
    } else if (che === 'vat') {                                       // chế độ Vật (mọi màn có vật, trừ súng hơi: màn súng hơi đặt thùng nặng): ô trống → vật gỗ → chạm → sắt → nam châm N → nam châm S → bỏ. Tay kẹp gắp mọi chất như nhau; nam châm thì khác
      var vj = -1;
      moi.vat.forEach(function (o, k) { if (o.x === x && o.y === y) vj = k; });
      if (vj >= 0) {
        var cu = moi.vat[vj];
        if (cu.chat === 'nam-cham' && cu.cuc === 'S') { moi.vat = boO(moi.vat, x, y); toast(t('xuong.vatBo'), ''); }
        else if (cu.chat === 'nam-cham') { moi.vat[vj] = { x: x, y: y, mau: cu.mau, chat: 'nam-cham', cuc: 'S' }; toast(t('xuong.vatS'), ''); }
        else if (cu.chat === 'sat') { moi.vat[vj] = { x: x, y: y, mau: cu.mau, chat: 'nam-cham', cuc: 'N' }; toast(t('xuong.vatN'), ''); }
        else { moi.vat[vj] = { x: x, y: y, mau: cu.mau, chat: 'sat' }; toast(t('xuong.vatSat'), ''); }
      } else if (!co) { moi.vat.push({ x: x, y: y }); toast(t('xuong.vatGo'), ''); }
      else return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
    } else if (che === 'sac') {                                                      // chế độ Sạc (drone): ô trống → ô sạc, chạm ô sạc → bỏ; không đặt lên tường / thùng / rào / nút / cửa
      if ((moi.sac || []).some(function (o) { return o.x === x && o.y === y; })) { moi.sac = boO(moi.sac, x, y); toast(t('xuong.sacBo'), ''); }
      else if (co && co !== 'xe' && co !== 'vat') return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      else { moi.sac = (moi.sac || []).concat([{ x: x, y: y }]); toast(t('xuong.sacDat'), ''); }
    } else if (che === 'nut') {                                                      // chế độ Nút (súng hơi): ô trống → nút bắn (nằm như tường), chạm nút → bỏ
      if (co === 'nut') moi.nut = boO(moi.nut || [], x, y);
      else if (co || coVat(x, y)) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + (co || 'vat')) }), 'bad');
      else { moi.nut = (moi.nut || []).concat([{ x: x, y: y }]); toast(t('xuong.nutDat'), ''); }
    } else if (che === 'cua') {                                                      // chế độ Cửa: ô trống → cửa đóng → chạm → cửa mở → chạm → bỏ
      var cj = (moi.cua || []).filter(function (o) { return o.x === x && o.y === y; })[0];
      if (cj && !cj.mo) { cj.mo = true; toast(t('xuong.cuaMo'), ''); }
      else if (cj) { moi.cua = boO(moi.cua, x, y); toast(t('xuong.cuaBo'), ''); }
      else if (co || coVat(x, y)) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + (co || 'vat')) }), 'bad');
      else { moi.cua = (moi.cua || []).concat([{ x: x, y: y, mo: false }]); toast(t('xuong.cuaDong'), ''); }
    } else if (che === 'rao') {                                                      // chế độ Rào: ô trống → hàng rào, chạm hàng rào → bỏ; không đặt lên xe / vật / tường / thùng
      if (co === 'rao') moi.rao = boO(moi.rao || [], x, y);
      else if (co || coVat(x, y)) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + (co || 'vat')) }), 'bad');
      else moi.rao = (moi.rao || []).concat([{ x: x, y: y }]);          // sân thử chưa có hàng rào nào (súng hơi) thì chưa có mảng rao
    } else if ((LOAI[che] && LOAI[che].ky) || che === 'bang') {                      // bậc thang / gầm / hố / băng chuyền: ký hiệu sân của lõi (sanThu.ky); ô trống → đặt, chạm lại → bỏ (băng: quay hướng rồi bỏ)
      var kc = (moi.ky || []).filter(function (o) { return o.x === x && o.y === y; })[0];
      if (kc && che === 'bang' && BANG_VONG.indexOf(kc.ky) >= 0) {
        var bi = BANG_VONG.indexOf(kc.ky);
        if (bi === BANG_VONG.length - 1) moi.ky = boO(moi.ky, x, y); else kc.ky = BANG_VONG[bi + 1];
      } else if (kc && kc.ky === (LOAI[che].ky || '')) moi.ky = boO(moi.ky, x, y);
      else if (co || coVat(x, y)) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + (co || 'vat')) }), 'bad');
      else moi.ky = (moi.ky || []).concat([{ x: x, y: y, ky: che === 'bang' ? BANG_VONG[0] : LOAI[che].ky }]);
    } else {
      var khoa = che === 'thung' ? 'thung' : 'tuong';
      if (co === 'rao' || co === 'nut' || co === 'cua' || (co && LOAI[co] && co !== 'vat' && co !== 'thung' && co !== 'tuong')) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      if (co === khoa) moi[khoa] = boO(moi[khoa], x, y);
      else if (co) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + co) }), 'bad');
      else moi[khoa].push({ x: x, y: y });
    }
    apSan(moi);
  }
  /** Áp cách sắp mới của sân thử: chuẩn hóa, lưu (riêng từng hàm), vẽ lại, xóa kết quả thử cũ. */
  function apSan(moi) {
    S.st = ChamHoc.chuanSanThu(moi);
    Luu.ghiSanThu(S.ten, S.st);
    napSan();
    xoaKetThu();
    anToast();
  }

  /* ------------------------------------- chế độ Đặt xe: kéo thả xe, chạm xe để xoay */
  /** Gợi ý khi vào chế độ Đặt xe: lần đầu là bong bóng hướng dẫn chỉ vào sân (cờ 'meo-sua-xe', tự tắt khi kéo / xoay lần đầu hay sau 9 giây), các lần sau là toast ngắn. */
  function goiYXe() {
    if (window.HuongDan && HuongDan.chay({
      id: 'sua-xe', co: 'meo-sua-xe', luuKhi: 'bat-dau',
      buoc: [{ dich: function () { return E.canvas; }, chu: t('xuong.suaXeHd'), xong: 'sua-xe', huong: 'duoi', han: 9000, rong: 170, xuong: true }]
    })) return;
    toast(t('xuong.xeGoiY'), '', 2600);
  }
  function baoSuaXe() { if (window.HuongDan) HuongDan.bao('sua-xe'); }
  /** Điểm chạm → tọa độ ô THỰC trong sân thử (px, py: 0 … rộng / cao) và ô chứa nó (x, y; có thể nằm ngoài sân). */
  function oCuaDiem(ev) {
    var r = E.canvas.getBoundingClientRect(), st = S.st;
    var px = (ev.clientX - r.left) / r.width * st.rong, py = (ev.clientY - r.top) / r.height * st.cao;
    return { px: px, py: py, x: Math.floor(px), y: Math.floor(py) };
  }
  function trongSan(x, y) { return x >= 0 && y >= 0 && x < S.st.rong && y < S.st.cao; }
  function kep(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  /** Pointer trên sân thử, chỉ ở chế độ Đặt xe. Bấm xuống ô xe rồi đi quá KEO_NGUONG px = KÉO (xe đi theo ngón tay, ô đích sáng vàng / đỏ, thả ở ô hợp lệ thì xe nằm đó,
   *  thả chỗ không hợp lệ hay ngoài sân thì về chỗ cũ); thả ra mà chưa kéo = CHẠM: chạm xe thì xoay 90° theo chiều kim đồng hồ, chạm ô trống thì đặt xe vào đó (như cách cũ). */
  function xeCon(ev) {
    if (S.che !== 'xe' || S.busy || !S.st) { if (S.keo && ev.type === 'pointercancel') huyKeoXe(); return; }
    var st = S.st, b = st.batDau, k = S.keo, o, kt;
    if (ev.type === 'pointerdown') {
      if (k || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      o = oCuaDiem(ev);
      if (!trongSan(o.x, o.y)) return;
      S.keo = { id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, x: o.x, y: o.y, laXe: o.x === b.x && o.y === b.y, keo: false, lx: o.px - (b.x + 0.5), ly: o.py - (b.y + 0.5), tx: b.x, ty: b.y, hopLe: true, ngoai: false };
      try { E.canvas.setPointerCapture(ev.pointerId); } catch (e) { /* không bắt được con trỏ: vẫn nhận pointerup trong sân */ }
      ev.preventDefault();
      return;
    }
    if (!k || ev.pointerId !== k.id) return;
    if (ev.type === 'pointercancel') { huyKeoXe(); return; }
    if (ev.type === 'pointermove') {
      if (!k.keo) {
        if (!k.laXe || Math.hypot(ev.clientX - k.sx, ev.clientY - k.sy) <= KEO_NGUONG) return;
        k.keo = true; anToast(); E.canvas.style.cursor = 'grabbing';
        if (window.HuongDan) HuongDan.dung('sua-xe');                                // đã biết cách kéo: tắt bong bóng hướng dẫn
      }
      o = oCuaDiem(ev);
      var cx = o.px - k.lx, cy = o.py - k.ly;                                       // tâm xe (ô thực): ngón tay trừ chỗ đã nắm lúc đầu nên xe không nhảy
      k.ngoai = o.px < -0.4 || o.py < -0.4 || o.px > st.rong + 0.4 || o.py > st.cao + 0.4;
      k.tx = kep(Math.floor(cx), 0, st.rong - 1); k.ty = kep(Math.floor(cy), 0, st.cao - 1);
      kt = coGi(k.tx, k.ty);
      k.hopLe = !k.ngoai && (kt === null || kt === 'xe');
      S.field.datKeoXe({ x: kep(cx - 0.5, 0, st.rong - 1), y: kep(cy - 0.5, 0, st.cao - 1), tx: k.tx, ty: k.ty, hopLe: k.hopLe, ngoai: k.ngoai });
      ev.preventDefault();
      return;
    }
    // pointerup
    S.keo = null;
    try { E.canvas.releasePointerCapture(ev.pointerId); } catch (e) { /* đã nhả */ }
    E.canvas.style.cursor = 'grab';
    if (!k.keo) {                                                                    // CHẠM (chưa kéo)
      if (!k.laXe && Math.hypot(ev.clientX - k.sx, ev.clientY - k.sy) > KEO_NGUONG) return;       // bấm ô trống rồi lướt đi: không phải chạm
      if (k.laXe) return xoayXe();
      kt = coGi(k.x, k.y);
      if (kt) return toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + kt) }), 'bad');
      var moi = banSao(st); moi.batDau.x = k.x; moi.batDau.y = k.y;                 // ô trống: đặt xe vào đó
      baoSuaXe(); apSan(moi);
      return;
    }
    S.field.datKeoXe(null);                                                          // THẢ sau khi kéo
    if (k.hopLe && (k.tx !== b.x || k.ty !== b.y)) {
      var mo2 = banSao(st); mo2.batDau.x = k.tx; mo2.batDau.y = k.ty;
      baoSuaXe(); apSan(mo2);
    } else {
      S.field.datLai();                                                              // về chỗ cũ (thả ngoài sân, hay vào ô đã có gì: nói rõ là gì)
      if (!k.ngoai && !k.hopLe) toast(t('xuong.oDaCo', { gi: t('xuong.gi.' + coGi(k.tx, k.ty)) }), 'bad');
    }
  }
  function huyKeoXe() {
    var k = S.keo; S.keo = null;
    if (k && k.keo) { S.field.datKeoXe(null); S.field.datLai(); }
    if (E.canvas) E.canvas.style.cursor = S.che === 'xe' ? 'grab' : '';
  }
  /** Chạm vào xe: xoay 90° theo chiều kim đồng hồ (lên → phải → xuống → trái). Nhện không có hướng mặt, drone mặt cố định: không xoay, chỉ kéo thả. */
  function xoayXe() {
    var lr = A.man().loaiRobot;
    if (lr === 'nhen' || lr === 'drone') return toast(t('xuong.khongXoay'), '', 2200);
    var moi = banSao(S.st); moi.batDau.huong = (moi.batDau.huong + 1) % 4;
    baoSuaXe(); apSan(moi);
    S.field.xoayXe();
  }
  function lai() {
    S.rid++; S.busy = false; E.side.classList.remove('busy');
    S.phat = null; veDem(0);
    S.field.datLai();
    S.ed.datChay(null); S.pal.datSang(null);
    anToast();
  }

  /* ------------------------------------------------------- kết quả thử */
  /** Giá trị thử → chữ trong code: số giữ nguyên, chuỗi có nháy, danh sách thành [2, "red"]. */
  function viDuCode(v) { return Array.isArray(v) ? '[' + v.map(viDuCode).join(', ') + ']' : typeof v === 'string' ? '"' + v + '"' : v; }
  function chay() {
    var man = A.man();
    var ds = doiSoHienTai().map(viDuCode);                                                              // đối số chữ truyền vào code có nháy: go("R"), walk("RRD"); danh sách: weave([2, 3, 1])
    return ChamHoc.thuHam(man, { chinh: [], hamCuaMan: A.bai().hamCuaMan }, S.ten, KhoHam.ds(), { sanThu: S.st, doiSo: ds });
  }
  function anBongD() { TP.bongAn(E.bongD); S.coBong = false; }
  /** Ô đếm NHỊP n ở cột nút. */
  function veDem(n) { if (E.dem) E.dem.textContent = String(n || 0); }
  function xoaKetThu() {
    S.ketThu = null; anBongD();
    S.phat = null; veDem(0);                                                          // sửa thân hàm / sân thử / đối số: lượt chạy từng nhịp cũ bỏ, lần bấm sau chạy lại từ đầu
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
  /** Chạy (tungNhip false) hay Nhịp (true). Lượt phát lại giữ trong S.phat: bấm Nhịp phát tới hết nhịp kế tiếp rồi dừng, bấm Chạy phát nốt phần còn lại;
   *  lượt đã hết, hay vừa sửa gì (xoaKetThu / lai / S.rid đổi) thì lần bấm sau chạy lõi lại từ đầu. */
  async function thu(tungNhip) {
    if (S.busy) return;
    if (S.che === 'xe') datChe(null);                                                  // bấm Chạy / Nhịp thì thoát chế độ Đặt xe
    if (!S.than || !S.than.length) { toast(t('xuong.trong'), 'bad'); return; }
    if (window.HuongDan) HuongDan.bao('thu');                                          // hướng dẫn từng bước: đã bấm Chạy (thân hàm không trống)
    var p = S.phat;
    if (!p || p.rid !== S.rid || p.idx >= p.vet.length) {
      var kq = chay();
      S.field.datLai();
      p = S.phat = { kq: kq, vet: kq.vet, idx: 0, nhip: 0, lenhDem: 0, rid: 0,
        lap: S.ed.lapChoVet(kq.vet, dongTrongHam),                                     // số lượt của các vòng for trong thân hàm
        cap: kq.chanDoan.some(function (c) { return c.ma === 'vong-vo-han'; }) ? { nhip: 6, lenh: 36 } : null };      // while chạy mãi: chỉ phát lại vài nhịp rồi dừng
      veDem(0);
    }
    var my = ++S.rid; p.rid = my;
    anBongD(); S.ed.anHoan(); anToast();
    S.ed.datLoi([]); S.pal.datLoi([]);
    S.busy = true; E.side.classList.add('busy');
    var vet = p.vet, capDung = false;
    while (p.idx < vet.length) {
      var e = vet[p.idx++];
      var toc = A.toc() * (p.nhip < 60 ? 1 : p.nhip < 120 ? 3 : 6);          // phát lại dài thì tự tăng tốc
      if (p.cap) toc = Math.max(toc, 2.5);
      if (e.loai === 'lenh') {
        sang(e, p.lap.get(e), toc);
        await SanVe.ngu(LENH_MS / toc); if (my !== S.rid) return;
        if (p.cap && ++p.lenhDem >= p.cap.lenh) { capDung = true; break; }
      } else {
        await S.field.phatNhip(e, NHIP_MS / toc); if (my !== S.rid) return;
        p.nhip++; p.lenhDem = 0; veDem(p.nhip);
        if (p.cap && p.nhip >= p.cap.nhip) { capDung = true; break; }
        if (tungNhip && p.idx < vet.length) { S.busy = false; E.side.classList.remove('busy'); return; }      // Nhịp: dừng sau mỗi nhịp, dòng đang chạy vẫn sáng
      }
    }
    sang(null);
    if (capDung) p.idx = vet.length;
    S.busy = false; E.side.classList.remove('busy');
    hienKetQua(p.kq);
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
      A.khiDoiHam();
      veTruoc();                                                                       // còn hàm trước trong chuỗi thì về hàm đó, không thì về sân
    });
  }

  /* ------------------------------------------------- lấy lại bản đúng (23/10) */
  /** Bản ĐÚNG của hàm cốt truyện đang mở ở màn này: bản trong kho tham chiếu lúc tới màn (ManHoc.khoThamChieu: như đã qua mọi màn trước theo lời giải).
   *  Hàm màn này bắt tạo (taoHam) hay hàm tự đặt thì không có bản đúng → null. */
  function banDung() {
    if (S.loai !== 'em' || !KhoHam.tenCoDinh(S.ten) || !window.ManHoc || !ManHoc.khoThamChieu) return null;
    var m = A.man();
    return m ? ManHoc.khoThamChieu(m).filter(function (f) { return f.ten === S.ten; })[0] || null : null;
  }
  function khacBan(f, b) { return !!f && !!b && JSON.stringify([f.thamSo || [], f.than || []]) !== JSON.stringify([b.thamSo || [], b.than || []]); }
  /** Nút ↺ ở thanh trên: chỉ hiện khi hàm cốt truyện đang mở KHÁC bản đúng (kể cả hàm bị khóa chỉ xem ở màn này: sửa nhầm ở màn trước thì lấy lại ở đây). */
  function veLayLai() { if (E.layLai) E.layLai.style.display = khacBan(hamHienTai(), banDung()) ? 'flex' : 'none'; }
  function layLai() {
    var b = banDung(), ten = S.ten;
    if (S.busy || !khacBan(hamHienTai(), b)) return;
    TP.Hop.xacNhan({ tieuDe: t('xuong.layLai'), noiDung: t('xuong.layLaiHoi', { ten: ten }), co: t('xuong.layLaiCo'), mau: 'g-bl' }).then(function (ok) {
      if (!ok || S.ten !== ten || !dangMo()) return;
      var r = KhoHam.sua(ten, b.than.slice(), (b.thamSo || []).slice());
      if (!r.ok) { toast(r.loi, 'bad', 3500); return; }
      var g = Luu.ghiKho();
      A.khiDoiHam();
      mo('em', ten, S.pal.theHienTai(), true);                                         // nạp lại thân hàm, đối số, sân thử
      if (!g.ok) toast(t('tb.khoGhiLoi', { loi: g.loi }), 'bad', 3500);
      else toast(t('xuong.layLaiXong', { ten: ten }), 'win', 2400);
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

  /** Thân hàm chưa có dòng lệnh nào (chỉ dòng trống / chú thích). */
  function thanTrong(f) { return !(f.than || []).some(function (d) { var x = String(d).trim(); return x && x.charAt(0) !== '#'; }); }
  /** Hộp đặt tên hàm mới. taoXong(ten): mở Xưởng cho hàm vừa tạo — cũng dùng để MỞ hàm đã có (23/10: tạo hàm xong lỡ về sân, bấm Hàm mới lại thì
   *  không còn kẹt "Đã có hàm tên …": hàm màn bắt tạo đã có mà thân còn trống thì hộp có nút Mở; gõ trùng tên hàm đã có thì lời báo kèm nút Mở). */
  function moiHam(taoXong) {
    var man = A.man();
    var goiY = TP.coListCua(man) ? ['n', 'steps', 'route', 'k', 'a', 'x'] : DS_GOI_Y;           // màn có danh sách: tên gợi ý có steps / route (đối số tên vậy mặc định là danh sách)
    var m = TP.Hop.mo(t('ten.tieuDe'), 'hop-ten');
    // hàm THEO CỐT TRUYỆN còn thiếu ở màn này (tên trong taoHam): điền sẵn đúng tên VÀ đối số, ô chỉ đọc, chỉ có nút "Tạo hàm";
    // đủ rồi thì hộp như thường, em tự đặt tên (và đối số) cho hàm riêng của mình
    var coDinh = (man.taoHam || []).filter(function (n) { return !KhoHam.tim(n); })[0] || null;
    var dangTrong = coDinh ? null : ((man.taoHam || []).filter(function (n) { var f = KhoHam.tim(n); return f && thanTrong(f); })[0] || null);
    var dsTen = coDinh ? thamSoGoiY(man, coDinh) : [], chon = 0;
    var hienDs = dsTen.length > 0 || coChoKhaiDoiSo(man);
    var loi = h('div', 'hop-loi');
    function baoLoi(chu) { loi.textContent = chu; loi.classList.add('co'); }
    function moCo(ten) { TP.Hop.dong(); taoXong && taoXong(ten); }
    /** Một hàng: lời nói + nút "Mở ten()" (mở hàm đã có ở Xưởng). */
    function hangMo(chu, ten) {
      var d = h('div', 'hop-mo'); d.appendChild(h('span', 'chu', chu));
      d.appendChild(TP.Hop.nut('g-gr', t('ten.moHam', { ten: ten }), function () { moCo(ten); }, 'mo-ham'));
      return d;
    }
    function xoaLoi() { loi.textContent = ''; loi.classList.remove('co'); }
    var inp = h('input', 'hop-in'); inp.type = 'text'; inp.maxLength = 24; inp.placeholder = t('ten.mauGo');
    inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('data-nut', 'o-ten');
    function tao(ten) {
      ten = String(ten).trim();
      // tên cốt truyện được tạo: hàm màn này dạy tạo, CỘNG hàm màn này cần mà kho chưa có (22/10: thiếu u_turn ở 3.5 thì tạo lại được tại chỗ, không kẹt "tên dành cho màn khác")
      var thieu = (man.hamCuaEmCan || []).filter(function (n) { return !KhoHam.ds().some(function (f) { return f.ten === n; }); });
      var tc = { taoHam: (man.taoHam || []).concat(thieu) };
      var kt = KhoHam.kiemTen(ten, undefined, tc);
      if (!kt.ok && kt.ma === 'ten-da-co') { xoaLoi(); loi.classList.add('co'); loi.appendChild(hangMo(kt.loi, ten)); return; }
      if (!kt.ok) return baoLoi(kt.loi);
      var thamSo = dsTen.map(function (x) { return String(x).trim(); });
      if (thamSo.some(function (x) { return !x; })) return baoLoi(t('ten.doiSoTrong'));
      var r = KhoHam.tao(ten, thamSo, tc);
      if (!r.ok) return baoLoi(r.loi);
      var g = Luu.ghiKho();
      TP.Hop.dong();
      A.khiDoiHam();
      if (!g.ok) A.baoLoi && A.baoLoi(t('tb.khoGhiLoi', { loi: g.loi }));
      if (window.HuongDan) HuongDan.bao('tao-ham', { ten: ten });                      // hướng dẫn từng bước: hàm đã tạo
      taoXong && taoXong(ten);
    }
    if (coDinh) {
      m.than.appendChild(h('div', 'hop-chu nho', t(dsTen.length ? 'ten.coDinhDoiSo' : 'ten.coDinh')));
      inp.value = coDinh; inp.readOnly = true; inp.setAttribute('data-co-dinh', coDinh);
    }
    if (dangTrong) m.than.appendChild(hangMo(t('ten.dangTrong', { ten: dangTrong }), dangTrong));
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
        var moi = goiY.filter(function (x) { return dsTen.indexOf(x) < 0; })[0];
        dsTen.push(moi); chon = dsTen.length - 1; veDs();
      });
      if (!coDinh) {
        goiY.forEach(function (n) {
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
