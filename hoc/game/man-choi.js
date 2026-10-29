var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   man-choi.js — "Robot Chấn Hưng": MÀN CHƠI (window.Choi).
   Sân + cột nút ▶ ⏭ ↺ 💡 + đồng hồ NHỊP; nửa dưới: CHƯƠNG TRÌNH (10 ô) | KHỐI LỆNH.
   Chạy = ChamHoc.cham(...) rồi phát lại `vet`. Mọi luật và lời chẩn đoán đến từ lõi.
   Màn chế lệnh (14/10): mục tiêu 'bong-mo' (SanVe vẽ xe mờ + ô ◆ theo man.bongMo, ◆ sáng khi vết có 'qua-diem'), man.chinhCoDinh (khung chương trình chính chỉ đọc, có ổ khóa),
   man.canhBao (nhãn ⚠ trên sân). Thắng màn mà tổng sao vừa đủ mở gói mới: bảng "Mở gói mới!" (App.baoGoiMoi, tên cũ App.moKhoaDot2) trước khi sang màn / màn chọn.
   Màn lắp ráp (17/10, man.lapRap, lõi lap-rap.js): vao(m, cachLap) gắn robot đã chọn vào màn (LapRap.apDung: loaiRobot, robot, hamGoc) rồi chơi như màn thường; khay, đèn nhịp, Xưởng hàm đều theo
   robot đó. Nút "Lắp lại" ở thanh trên (chỉ màn lắp ráp) → App.lapLai; chương trình đang viết được giữ, dòng gọi lệnh của part đã tháo bị tô đỏ. Bảng thắng thêm mục "Cách lắp khác".
   Hàm của em (23/10): khay chỉ bày hàm màn này dùng tới, còn lại gom vào nhóm "Hàm khác" thu gọn (TP.tachHamKhac); về sân từ Xưởng thì khay sang thẻ có hàm vừa xem và nháy nó;
   vào màn mà hàm cốt truyện màn này khóa đã bị sửa hỏng (ChamHoc.hamHong) thì hỏi lấy lại bản đúng trước đề bài.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var E = {};                 // phần tử
  var S = {
    man: null, bai: null, ket: null, vet: null, idx: 0, nhip: 0, busy: false, rid: 0,
    toc: 1, goiYi: 0, cdi: 0, cd: [], si: 0, ed: null, pal: null, field: null, khung: null,
    marks: null, cap: null, nut: [],         // marks: sân nào tới cờ (sau khi Chạy); cap: giới hạn phát lại khi vòng while chạy mãi; nut: các ảnh nhỏ của dải sân
    theTao: {}                               // hàm mới tạo ở màn này → thẻ khay em đang xem lúc tạo (hàm còn trống thân, lời giải màn không có thì khay để nó ở thẻ đó)
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
        '<button class="bt g-or lap-lai" data-nut="lap-lai" style="display:none" aria-label="' + t('lap.lapLaiNhan') + '"><span data-i="banhRang" data-s="1" data-l="' + BM.goToiV13 + '"></span><span class="ll-chu">' + t('lap.lapLai') + '</span></button>' +
        '<button class="bt g-pu menu" data-nut="menu" aria-label="' + t('choi.menu') + '" title="' + t('choi.menu') + '"><span data-i="menu" data-s="2" data-l="' + BM.timToi2 + '"></span></button>' +
      '</div>' +
      '<div class="fblock">' +
        '<div class="ffr"><canvas class="tex" id="field"></canvas><div class="toast"></div></div>' +
        '<div class="side">' +
          '<div class="sanbar"></div>' +
          '<button class="bt g-gr cbtn" data-nut="chay"><span data-i="play" data-s="1.5" data-l="' + BM.bangV7 + '"></span>' + t('choi.chay') + '</button>' +
          '<button class="bt g-am cbtn" data-nut="nhip"><span data-i="step" data-s="1.5" data-l="' + BM.goV2 + '"></span>' + t('choi.nhip') + '</button>' +
          '<button class="bt g-bl cbtn" data-nut="lai"><span data-i="reset" data-s="1.5" data-l="' + BM.lamV1 + '"></span>' + t('choi.lai') + '</button>' +
          '<button class="bt g-pu cbtn" data-nut="goi-y"><span data-i="bulb" data-s="1.5" data-l="' + BM.timToi2 + '"></span>' + t('choi.goiY') + '</button>' +
          '<div class="mini"><button class="bt g-wd" data-nut="toc"></button><button class="bt g-te" data-nut="de-bai">' + t('choi.deBai') + '</button></div>' +
          '<div class="clock chalk"><span class="l">' + t('choi.nhipDong') + '</span><span class="v">0</span><span class="tong"></span>' +
            '</div>' +
        '</div>' +
      '</div>' +
      '<div class="low">' +
        '<div class="pan p-prog" id="pan-main"><i class="rv a"></i><i class="rv b"></i><i class="rv c"></i><i class="rv d"></i>' +
          '<div class="board chalk"><div class="bh"><span class="xe-tabs"></span><span class="tt">' + t('choi.chuongTrinh') + '</span><span class="ham-dem" data-nut="ham-dem" style="display:none" title="' + t('choi.hamDemNhan') + '"></span><span class="ct">0/10</span><span class="chinh-khoa" data-nut="chinh-khoa"><span class="ck-ic"></span><span class="ck-chu">' + t('choi.chinhKhoaNhan') + '</span></span>' +
            '<button class="bt g-rd del het" data-nut="xoa-het" aria-label="' + t('choi.xoaHet') + '" title="' + t('choi.xoaHet') + '"><span data-i="trash" data-s="2" data-l="' + BM.doToi + '"></span></button></div>' +
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
    E.toast = q('.toast'); E.bongD = q('.p-pal .bong'); E.clock = q('.clock .v'); E.side = q('.side');
    E.btnToc = q('[data-nut="toc"]'); E.ov = q('.ws-ov'); E.lapLai = q('[data-nut="lap-lai"]');
    DenBoPhan.dung(q('.clock'));                                                      // vùng đèn theo bộ phận: dòng thứ hai trong ô đồng hồ NHỊP
    E.xeTabs = q('.p-prog .xe-tabs');
    E.fb = q('.fblock'); E.bar = q('.sanbar'); E.tong = q('.clock .tong'); E.hamDem = q('.p-prog .ham-dem');
    q('.chinh-khoa .ck-ic').appendChild(Ve.khoa(2, true));                       // ổ khóa nhỏ ở tiêu đề khung chương trình (chỉ hiện khi màn có chinhCoDinh)

    S.field = new SanVe.Field(q('#field'), { kich: 210, catMep: true });          // catMep: bỏ hàng / cột mép toàn tường khi vẽ (sân thử Xưởng không bật)
    S.field.onRung = function () { if (window.AmThanh) AmThanh.phat('dam'); E.ffr.classList.remove('rung'); void E.ffr.offsetWidth; E.ffr.classList.add('rung'); };
    E.ffr = q('.ffr');

    S.kieu = TP.taoKieu(function () { return { man: S.man, hamCuaMan: S.bai ? S.bai.hamCuaMan : [], kho: KhoHam.ds() }; });     // kiểu đối số của hàm: số / một chữ / chuỗi ghép
    S.soMax = TP.taoSoToiDa(function () { return { man: S.man, hamCuaMan: S.bai ? S.bai.hamCuaMan : [], kho: KhoHam.ds() }; });       // số lớn nhất chọn được của đối số (aim: 3)
    S.ed = new TP.Editor(q('.p-prog .rows'), {
      tong: 10, dung: 10, lay: function () { return S.bai ? S.bai.chinh : []; }, bang: q('#pan-main'), dem: q('.p-prog .ct'),
      nutXoaHet: q('[data-nut="xoa-het"]'), dangChay: function () { return S.busy; },
      veNhip: function () { return !!S.man && S.man.loaiRobot !== 'nhen' && S.man.loaiRobot !== 'drone'; },        // ngoặc nhịp bên phải các dòng lệnh gốc + wait() cùng một nhịp (nhện / drone: go_* tự trôi nhịp, không vẽ)
      thutLe: function () { return TP.coCauTruc(S.man, 'for') || TP.coCauTruc(S.man, 'if') || TP.coCauTruc(S.man, 'while'); },
      camBien: function () { return TP.camBienCua(manXe()); },                                    // điều kiện while / if chạm đổi được: front_clear() …
      kieuDoiSo: function (ten, k) { return S.kieu(ten, k); },
      soToiDa: function (ten, k) { return S.soMax(ten, k); },                                    // aim(n) chỉ nhận 1–3
      listChu: function () { return !!TP.coMauCua(S.man) || !!(S.man && S.man.robot && S.man.robot.tay === 'son'); },     // máy sơn: danh sách màu (stripes, copy_row)                                     // danh sách cho phần tử là màu (màn có color() / look()): bảng chọn phần tử có thêm hàng màu
      tt: q('.p-prog .tt'), ttDay: t('choi.chuongTrinh'), ttNgan: t('choi.chuongTrinhNgan'),
      chiDoc: khungCoDinh,                                                                      // chương trình chính cố định (màn chế lệnh) hay robot tự động khóa (doi[i].coDinh): chỉ đọc
      khiChiDoc: baoChinhCoDinh,
      khiDoi: khiDoi, khiKhoa: function () { toast(t('choi.khoaO'), 'bad'); }, khiBam: function () { anBongD(); },
      khiCamNhip: function (ly) { toast(ly, 'bad', 3400); },                                  // mỗi bộ phận một lệnh mỗi nhịp: chèn bị từ chối
      khiNhip: function (cam) { if (S.pal) S.pal.datCamNhip(cam); }                          // khay làm mờ khối của bộ phận đã có lệnh trong nhịp đang soạn
    });
    S.pal = new TP.Palette(q('.pal'), {
      khiChen: function (txt) {
        if (khungCoDinh()) { baoChinhCoDinh(); return; }
        if (S.ed.chen(txt) === false) toast(t('choi.dayKhung'), 'bad');           // null = bộ phận đã có lệnh trong nhịp (khiCamNhip đã báo)
      },
      khiSua: function (loai, ten) { Xuong.mo(loai, ten); },
      khiMoi: function (the) { Xuong.moiHam(function (ten) { if (!S.theTao[ten]) S.theTao[ten] = the; Xuong.mo('em', ten, the); }); },          // hàm mới (còn trống) mở ở Xưởng với khay đúng thẻ em đang xem
      goiYThe: true,                                                                                    // lần đầu khay có từ hai thẻ (hay có thẻ Cảm biến): ◀ ▶ nhấp nháy + bong bóng "Bấm ▶ để sang thẻ …"
      kieuDoiSo: function (ten, k) { return S.kieu(ten, k); }
    });

    TP.Keo.gan({ ed: S.ed, pal: S.pal, khiKeoDong: function () { anBongD(); }, dangChay: function () { return S.busy; }, khiDay: function () { toast(t('choi.dayKhung'), 'bad'); }, khiKhoa: function () { toast(t('choi.khoaO'), 'bad'); }, khiChiDoc: baoChinhCoDinh });

    Xuong.dung(E.ov, {
      man: function () { return manXe(); }, bai: function () { return S.bai; },
      toc: function () { return S.toc; },
      khiDoiHam: function () { khiDoiHamKho(); },
      khiVe: function (vua) { khiDoiHamKho(); S.pal.vua(); if (vua) S.pal.hienGach((vua.loai === 'man' ? 'man:' : 'em:') + vua.ten); },     // về sân: khay sang thẻ có hàm vừa xem, nháy nó
      theRong: function (ten) { return theRong(ten); },
      baoLoi: function (s) { toast(s, 'bad'); }
    });

    q('[data-nut="menu"]').addEventListener('click', moMenu);
    E.lapLai.addEventListener('click', function () { if (window.App && App.lapLai) App.lapLai(); });
    q('[data-nut="chay"]').addEventListener('click', function () { chay(false); });
    q('[data-nut="nhip"]').addEventListener('click', function () { chay(true); });
    q('[data-nut="lai"]').addEventListener('click', function () { datLaiChay(); });
    q('[data-nut="goi-y"]').addEventListener('click', goiY);
    q('[data-nut="de-bai"]').addEventListener('click', function () { hienDeBai(); });
    E.btnToc.addEventListener('click', function () { S.toc = S.toc === 1 ? 2 : 1; veToc(); });
    q('[data-nut="xoa-het"]').addEventListener('click', function () {
      if (!S.bai.chinh.length) return;
      TP.Hop.xacNhan({ noiDung: t('choi.xoaHetHoi'), co: t('choi.xoaHetCo') }).then(function (ok) { if (ok) S.ed.xoaHet(); });
    });
    veToc();
  }

  /* -------------------------------------------------------------- nhiều robot (màn có man.doi, KE-HOACH-HAI-ROBOT.md)
     Mỗi robot một chương trình chính: S.bai.doi[i].chinh; S.bai.chinh luôn là chương trình của robot đang chọn ở khung code (S.xe), nên khung code,
     Xưởng, nút xóa hết làm việc như một robot. Khay lệnh, đèn bộ phận, Xưởng theo robot đang chọn (manXe). */
  function manCuaXe(m, i) { var o = Object.assign({}, m, m.doi[i]); delete o.doi; return o; }
  function manXe() { return S.man && S.man.doi ? manCuaXe(S.man, S.xe) : S.man; }
  function dongBoBai() { if (S.bai && S.bai.doi) S.bai.doi[S.xe].chinh = S.bai.chinh; }
  /** Thẻ R1 / R2 ở tiêu đề khung chương trình (chỉ màn nhiều robot), mang màu đế của xe trên sân. */
  function dungTabXe() {
    E.xeTabs.innerHTML = '';
    E.host.classList.toggle('co-doi', !!(S.man && S.man.doi));
    if (!S.man || !S.man.doi) return;
    S.man.doi.forEach(function (r, i) {
      var b = h('button', 'bt xe-tab', 'R' + (i + 1));
      b.setAttribute('data-nut', 'xe-' + (i + 1)); b.setAttribute('aria-label', t('choi.xeTab', { n: i + 1 }));
      var sonTab = (r.robot && r.robot.son) || (S.man.doiKhang && i === 1 ? 'do' : SanVe.SON_XE[i % SanVe.SON_XE.length]);
      var idxMau = SanVe.SON_XE.indexOf(sonTab);
      b.style.setProperty('--mx', SanVe.MAU_XE[idxMau >= 0 ? idxMau : (i % SanVe.MAU_XE.length)]);
      b.setAttribute('data-son', sonTab);                                           // giao diện vector (choi-vector.css): thẻ mang màu đội của robot vector (R1 xanh, R2 hồng, đối thủ đỏ)
      b.addEventListener('click', function () { chonXeCode(i); });
      if (r.coDinh) { b.classList.add('khoa'); b.appendChild(Ve.khoa(1, true)); }        // robot tự động: chương trình khóa, vẫn mở xem được
      E.xeTabs.appendChild(b);
    });
    veTabXe();
  }
  /** Thẻ R1 / R2: thẻ đang chọn sáng lên; thẻ của robot có lỗi riêng (chẩn đoán mang c.xe) gắn chấm đỏ, để người chơi biết mở thẻ nào mà sửa. */
  function veTabXe() {
    var cd = S.ket && !S.ket.thang && S.cd ? S.cd : [];
    Array.prototype.forEach.call(E.xeTabs.children, function (b, i) {
      b.classList.toggle('on', i === S.xe);
      b.classList.toggle('co-loi', cd.some(function (c) { return c.muc === 'loi' && c.xe === i; }));
    });
  }
  /** Đổi chương trình đang xem / sửa sang robot i (kết quả đã chạy vẫn giữ: vết, chẩn đoán của robot đó hiện ở khung code). */
  function chonXeCode(i) {
    if (!S.man || !S.man.doi || i === S.xe || S.busy) return;
    dongBoBai();
    S.xe = i; S.bai.chinh = S.bai.doi[i].chinh;
    S.ed.nap(function () { return S.bai.chinh; }, S.dung.chinh);
    S.ed.datChay(null); S.ed.datLoi([]); S.pal.datSang(null); S.pal.datLoi([]);
    veKho(); veHamDem(); DenBoPhan.nap(manXe()); veTabXe();
    S.field.chonXe(i);
    if (S.ket && !loiKhung()) {
      var ts = S.ket.theoSan[S.si];
      if (ts && ts.doi) S.lap = S.ed.lapChoVet(ts.doi[i].vet, dongChinhCua);
      if (!S.ket.thang) dungChanDoan(S.ket);
    }
    if (window.HuongDan) HuongDan.bao('doi-xe', { xe: i });
  }
  /** Vết của robot i ở sân đang xem (một robot: S.vet). */
  function vetXe(i) {
    var ts = S.ket && S.ket.theoSan && S.ket.theoSan[S.si];
    return ts && ts.doi ? ts.doi[i === undefined ? S.xe : i].vet : S.vet;
  }
  /** Gộp vết các robot thành một dòng phát lại: lệnh của từng robot (gắn e.xe) rồi một nhịp chung { loai: 'nhip', doi: [mục nhịp của từng robot] }. */
  function gopVet(doi) {
    var it = doi.map(function () { return 0; }), kq = [];
    for (;;) {
      doi.forEach(function (d, i) {
        var v = d.vet;
        while (it[i] < v.length && v[it[i]].loai !== 'nhip') { v[it[i]].xe = i; kq.push(v[it[i]]); it[i]++; }
      });
      var ds = doi.map(function (d, i) { return it[i] < d.vet.length ? d.vet[it[i]++] : null; });
      if (ds.every(function (x) { return !x; })) break;
      var e0 = ds.filter(function (x) { return x; })[0];
      kq.push({ loai: 'nhip', nhip: e0.nhip, doi: ds });
    }
    return kq;
  }

  function veToc() { E.btnToc.textContent = t('choi.toc', { n: S.toc }); E.btnToc.setAttribute('data-toc', S.toc); }

  /* -------------------------------------------------------------- vào màn */
  function sao3(n) {
    E.sao.innerHTML = '';
    for (var i = 0; i < 3; i++) E.sao.appendChild(Ve.sao(i < n, 2));
  }
  function nhanBan(m) {
    // bài làm: bản nháp nếu có, nếu không thì mã mẫu của màn
    var nhap = Luu.docNhap(m.ma);
    if (m.doi) {                                                                       // nhiều robot: mỗi robot một chương trình chính, hàm của màn dùng chung
      var nd = nhap && nhap.doi && nhap.doi.length === m.doi.length ? nhap.doi : null, md = (m.maMau && m.maMau.doi) || [];
      var doi = m.doi.map(function (r, i) { return { chinh: nd && !r.coDinh ? nd[i].chinh.slice() : ((md[i] && md[i].chinh) || []).slice() }; });   // robot tự động khóa: luôn chạy đúng chương trình của màn
      var hm = nhap ? nhap.hamCuaMan : ((m.maMau && m.maMau.hamCuaMan) || []).map(function (f) { return { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: f.than.slice() }; });
      return { doi: doi, chinh: doi[0].chinh, hamCuaMan: hm };
    }
    if (nhap && (m.chinhCoDinh || m.chiChay)) nhap.chinh = m.maMau.chinh.slice();                     // chương trình chính cố định: bản nháp cũ (nếu có) không được lệch khỏi chương trình của màn
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
  /** Vào màn m. Màn lắp ráp (m.lapRap): `cach` = cách lắp đã chọn ở màn Lắp robot (không có thì lấy cách đã lưu, rồi cách mặc định); S.man là bản đã gắn robot
   *  (LapRap.apDung), còn màn gốc ở S.man.manGoc. Vào màn mà chương trình (bản nháp) còn dòng gọi lệnh của part không gắn thì tô đỏ và báo (baoLenhMat). */
  function vao(m, cach) {
    var goc = m.manGoc || m;
    if (goc.lapRap) {
      var c = cach || Luu.docLap(goc.ma) || LapRap.cachMacDinh(goc);
      try { m = LapRap.apDung(goc, c); } catch (e) { m = LapRap.apDung(goc, LapRap.cachMacDinh(goc)); }
    }
    roi(); anBongD();
    S.man = m; S.bai = nhanBan(m); S.ket = null; S.goiYi = 0; S.theTao = {};
    S.xe = 0;                                                                           // nhiều robot: khung code đang xem robot 1
    dungTabXe();
    E.lapLai.style.display = goc.lapRap ? '' : 'none';
    E.lapLai.classList.remove('nhay');
    S.vet = null; S.idx = 0; S.nhip = 0;                                                // đồng hồ NHỊP không giữ số của màn trước
    TP.datCheList(TP.coListCua(m));                    // màn có cauTruc 'list': dòng danh sách (a = [1, 2], for n in a:, a.append(1)) tách thành ô phần tử chạm được
    TP.datCheMau(TP.coMauCua(m), TP.coPinCua(m));      // màn có color(): điều kiện while / if / elif tách thành ô chạm được (so màu, and / or); màn drone có battery(): so pin với một số
    var k = KhungCode.khungDayDu(m.khung);
    S.khung = k;
    var dung = KhungCode.soODung(k);
    S.dung = dung;
    E.n.textContent = m.id; E.t.textContent = m.ten;
    SanVe.datCanhBao(E.ffr, m.canhBao);                                                // nhãn ⚠ trên sân ("Dây bánh trái đấu ngược"); màn không có thì ẩn
    DenBoPhan.nap(manXe());                                                                  // đèn theo bộ phận cạnh đồng hồ NHỊP: chỉ các bộ phận robot của màn có (den-bo-phan.js)
    E.host.querySelector('.plaque .d').style.display = '';
    sao3(Luu.saoTot(m.ma));
    S.si = 0; S.marks = null; S.cap = null;
    S.field.nap(cauHinhSan(0));
    E.fb.classList.toggle('nhieu', nhieuSan());
    dungSanBar();
    S.ed.nap(function () { return S.bai.chinh; }, dung.chinh);
    S.ed.datLoi([]);
    veKho(true);
    veHamDem();
    veDongHo();
    E.side.classList.remove('busy');
    E.ov.classList.remove('open');
    TP.Hop.dong();
    function batDau() {
      if (S.man !== m) return;
      hoiLayLaiHam(function () {
        if (S.man !== m) return;
        // Màn có tutorial cần để khay trống cho người chơi làm theo ngay.
        // Đề bài vẫn mở được bằng nút riêng, không tự phủ lên các khối cần chạm.
        if (m.huongDan || (window.HuongDanMan && HuongDanMan[m.ma])) anBongD();
        else hienDeBai();
        if (window.HuongDan) HuongDan.vaoMan(m);                                        // man.huongDan (nếu màn khai): sáng nút / khối phải chạm, từng bước
        Array.prototype.forEach.call(document.querySelectorAll('.chinh-khoa .ck-chu'), function (e) { e.textContent = t(m.chiChay ? 'choi.chiChayNhan' : 'choi.chinhKhoaNhan'); });     // nhãn ổ khóa (khung chính và bản trong Xưởng): màn trình diễn (chỉ Chạy) hay main cố định (sửa hàm)
      });
    }
    if (window.ThePart && m.doi && m.doiThu) ThePart.choMan(manCuaXe(m, 0), function () { ThePart.doiThu(m, batDau); });     // đối thủ part mạnh: thẻ "ĐỐI THỦ" thay cho thẻ bộ phận của R2
    else if (window.ThePart && m.doi) ThePart.choMan(manCuaXe(m, 0), function () { ThePart.choMan(manCuaXe(m, 1), batDau); });      // nhiều robot: bộ phận mới của từng robot
    else if (window.ThePart) ThePart.choMan(m, batDau); else batDau();                      // bộ phận lần đầu gặp / lệnh mới mở: thẻ giới thiệu trước đề bài và hướng dẫn (the-part.js)
    if (goc.lapRap) baoLenhMat();                                                      // robot đã đổi (hay bản nháp cũ): dòng gọi lệnh của part đang không gắn thì tô đỏ
  }
  /** Hàm cốt truyện màn này KHÓA (chỉ xem) mà đã bị sửa hỏng ở màn trước, nên lời giải của màn chạy không được (ChamHoc.hamHong): [bản đúng { ten, thamSo, than }]. */
  function hamHongCuaMan() {
    if (!window.ManHoc || !ManHoc.khoThamChieu || !ChamHoc.hamHong) return [];
    var ref = ManHoc.khoThamChieu(S.man), khoa = TP.khoaKhay(S.man).filter(function (k) { return k.indexOf('em:') === 0; }).map(function (k) { return k.slice(3); });
    return ChamHoc.hamHong(S.man, KhoHam.ds(), ref, khoa).map(function (ten) { return ref.filter(function (f) { return f.ten === ten; })[0]; }).filter(Boolean);
  }
  /** Vào màn (23/10): hàm khóa bị sửa hỏng thì hộp "Lấy lại hàm đúng?" — đồng ý thì thay về bản đúng trong kho (Xưởng cũng có nút ↺ làm việc này). Xong hộp thì tiep(). */
  function hoiLayLaiHam(tiep) {
    var hong = [];
    try { hong = hamHongCuaMan(); } catch (e) { hong = []; }
    if (!hong.length) { tiep(); return; }
    var ds = hong.map(function (f) { return f.ten + '()'; }).join(', ');
    TP.Hop.xacNhan({ tieuDe: t('hong.tieuDe'), noiDung: t('hong.hoi', { ds: ds }), co: t('hong.co'), khong: t('hong.khong'), mau: 'g-gr' }).then(function (ok) {
      if (ok) {
        hong.forEach(function (f) { KhoHam.sua(f.ten, f.than.slice(), (f.thamSo || []).slice()); });
        var g = Luu.ghiKho();
        khiDoiHamKho();
        toast(g.ok ? t('hong.xong', { ds: ds }) : t('tb.khoGhiLoi', { loi: g.loi }), g.ok ? '' : 'bad', 2600);
      }
      tiep();
    });
  }
  /** Thẻ khay cho hàm còn trống thân: thẻ của bản trong lời giải màn, không có thì thẻ em đang xem lúc tạo hàm. */
  function theRong(ten) { return TP.theHamRong(manXe(), ten, KhoHam.ds(), S.bai ? S.bai.hamCuaMan : []) || S.theTao[ten] || null; }
  /** Sau "Lắp lại": dòng của chương trình chính gọi lệnh của part đã tháo thì tô đỏ và báo tên lệnh (chương trình vẫn giữ nguyên). */
  function baoLenhMat() {
    var rows = LapRap.lenhKhongCon(S.man, S.bai.chinh);
    if (!rows.length) return;
    S.ed.datLoi(rows.slice());
    toast(t('lap.lenhMat', { ds: rows.ten.join(', ') }), 'bad', 4800);                  // tên lệnh không kèm ngoặc (lý do gốc: phông pixel cũ vẽ "()" như "[]")
  }
  function cauHinhSan(i) {
    var m = S.man, nhieu = Array.isArray(m.san[0]), lm = SanHoc.lopMauCuaSan(m, i);
    return {
      san: nhieu ? m.san[i] : m.san,
      batDau: m.doi ? (Array.isArray(m.doi[0].batDau) && nhieu ? m.doi[0].batDau[i] : m.doi[0].batDau) : Array.isArray(m.batDau) ? m.batDau[i] : m.batDau,
      loaiRobot: m.loaiRobot || 'banh',
      robot: VeRobot.cauHinhCua(m),
      mau: lm.mau, vatMau: lm.vatMau,                   // lớp màu sàn / màu vật (chương cảm biến màu); null nếu màn không có
      vatChat: lm.vatChat, vat: lm.vatThem || undefined, vatThem: lm.vatThem,   // chất vật sắt / gỗ và vật thêm ngoài ký hiệu (chương nam châm)
      roBanDau: Array.isArray(m.roBanDau) ? m.roBanDau[i] : m.roBanDau,           // máy ném: rổ có sẵn một vật lúc xuất phát
      cuaNhip: lm.cuaNhip || undefined, nutBat: lm.nutBat || undefined, danToiDa: m.danToiDa, noi: lm.noi || undefined,   // gói V7a: noi (nút ↔ cửa) cho dây nối vector   // súng bóng: chu kỳ cửa nhịp của sân này, nút bật sẵn (nóng từ đầu), số đạn tối đa (không khai = vô hạn)
      pin: Array.isArray(m.pin) ? m.pin[i] : m.pin,                                // drone: pin đầy của sân này (không khai = pin vô hạn, ẩn thanh pin)
      bongMo: Array.isArray(m.bongMo) ? m.bongMo[i] : m.bongMo,                    // mục tiêu 'bong-mo': xe mờ (+ vật mờ, ô ◆) của sân này; màn nhiều sân thì mảng song song với san
      hinh: lm.hinh || undefined, sonBanDau: lm.sonBanDau || undefined, mucBanDau: m.mucBanDau,                          // máy sơn: hình mờ cần tô của sân này, màu sơn lúc đầu
      doiKhang: !!m.doiKhang,
      doi: m.doi ? m.doi.map(function (r, k) {                                       // nhiều robot: hình xe, chỗ xuất phát của từng robot (san-ve.js vẽ đủ, R1 xanh lơ, R2 cam)
        var mk = manCuaXe(m, k);
        return { robot: VeRobot.cauHinhCua(mk), batDau: Array.isArray(mk.batDau) && nhieu ? mk.batDau[i] : mk.batDau, loaiRobot: mk.loaiRobot || 'banh',
          pin: Array.isArray(mk.pin) ? mk.pin[i] : mk.pin, danToiDa: mk.danToiDa,
          roBanDau: Array.isArray(mk.roBanDau) ? mk.roBanDau[i] : mk.roBanDau, co: SanHoc.coCuaSan(mk.co, i, nhieu) };          // rổ có sẵn vật, cờ riêng của robot này
      }) : undefined
    };
  }
  /** Vẽ khay khối lệnh. lamMoi (vào màn): bỏ thẻ đang chọn, chọn thẻ chứa hàm màn bắt chế (man.taoHam), không có thì thẻ THÂN; không thì giữ thẻ đang chọn. */
  function veKho(lamMoi) {
    var m = manXe();
    var em = (m.moXuong !== false && !m.camHamCuaEm) ? TP.tachHamKhac(m, TP.locHamTheoRobot(m, KhoHam.ds()), S.bai) : null;
    S.pal.dung({
      goc: m.hamGoc,
      loai: m.loaiRobot,                                                                        // tên thẻ THÂN: Xe / Nhện / Drone
      lamMoi: !!lamMoi,
      the: lamMoi ? TP.theMacDinh({ man: m, kho: KhoHam.ds(), hamMan: S.bai.hamCuaMan, dangSua: null }) : undefined,
      vong: TP.coCauTruc(m, 'for'),
      bienDem: !!m.bienDem,                                                                     // chương che-cam-bien từ màn dạy biến đếm: nhóm ĐẾM (n = 0, n = n + 1, for i in range(n):)
      list: TP.coListCua(m),                                                                    // gói List: nhóm DANH SÁCH (a = [1, 2], for n in a:, for n in [1, 2]:, a.append(1)) ở thẻ Logic
      vongWhile: TP.coCauTruc(m, 'while') && TP.coDieuKienCua(m),
      cam: TP.camBienCua(m),                                                                    // hàm cảm biến: thành khối ĐIỀU KIỆN (while / if), không phải lệnh GỐC
      mau: TP.coMauCua(m),                                                                      // cảm biến màu: khối so màu + gán c = color()
      pin: TP.coPinCua(m),                                                                      // drone đo pin: khối so sánh battery() < 3
      chuoi: TP.coCauTruc(m, 'for') && TP.coMauCua(m) !== 'look' && (!!m.chuoi || (m.hamGoc || []).some(function (n) { return /^go_/.test(n); })),     // chương có chuỗi chữ (nhện): khối for c in "R": (flycam dùng danh sách màu, không dùng chuỗi chữ)
      dieuKien: TP.coCauTruc(m, 'if') && TP.coDieuKienCua(m),
      em: em ? em.chinh : null,                                                                 // nhện: bỏ hàm dùng lệnh bánh; hàm màn không dùng tới → emKhac
      emKhac: em ? em.khac : [],                                                                // nhóm "Hàm khác" thu gọn (TP.tachHamKhac)
      theRong: theRong,
      man: S.bai.hamCuaMan,
      khoa: TP.khoaKhay(m),                                                                     // hàm bị khóa ở màn này (hàm của màn khóa, hàm cốt truyện màn không sửa): ổ khóa thay bút chì, mở ở Xưởng chỉ xem
      coNutMoi: true
    });
  }
  /** Kho hàm hoặc hàm của màn đổi (từ Xưởng / hộp đặt tên): vẽ lại kho khối, hủy lượt chạy. */
  function khiDoiHamKho() {
    datLaiChay();
    veKho();
    veHamDem();
    dongBoBai(); Luu.ghiNhap(S.man.ma, S.bai);
  }
  /** Bộ đếm "Hàm 2/3" ở tiêu đề khung chương trình: chỉ có ở màn khai man.gioiHanHam; đỏ khi chương trình chính gọi quá số hàm của em được mang. */
  function veHamDem() {
    var el = E.hamDem, gh = S.man ? S.man.gioiHanHam : undefined;
    if (!el) return;
    if (typeof gh !== 'number') { el.style.display = 'none'; el.classList.remove('qua'); return; }
    var kho = S.man.camHamCuaEm ? [] : KhoHam.ds();
    var k = KhungCode.hamEmTrucTiep({ chinh: S.bai.chinh, hamCuaMan: S.bai.hamCuaMan }, kho).length;
    el.textContent = t('choi.hamDem', { k: k, n: gh });
    el.classList.toggle('qua', k > gh);
    el.style.display = '';
  }

  /** Rời màn: dừng phát lại. */
  function roi() {
    if (window.HuongDan) HuongDan.dung();                                              // rời màn: dừng mọi hướng dẫn đang sáng (chưa xong thì lần sau còn)
    if (window.AmThanh && AmThanh.datCheDo) AmThanh.datCheDo('soan');
    S.rid++; S.busy = false;
    if (E.side) E.side.classList.remove('busy');
  }

  /* ---------------------------------------------------------------- toast */
  var toastHen = null;
  function toast(chu, kieu, ms) {
    var tt = E.toast; tt.textContent = chu; tt.className = 'toast show ' + (kieu || '');
    if (kieu === 'bad' && window.AmThanh) AmThanh.phat('loi');
    clearTimeout(toastHen);
    if (ms !== 0) toastHen = setTimeout(function () { tt.className = 'toast'; }, ms || 2200);
  }
  function anToast() { clearTimeout(toastHen); E.toast.className = 'toast'; }
  /** Chạm / kéo thả vào chương trình chính khi màn khai chinhCoDinh: nhắc rằng chỉ sửa được hàm trong Xưởng. */
  function baoChinhCoDinh() {
    var xeKhoa = S.man && S.man.doi && S.man.doi[S.xe] && S.man.doi[S.xe].coDinh;
    toast(xeKhoa ? t('choi.xeCoDinh', { n: S.xe + 1 }) : S.man && S.man.chiChay ? t('choi.chiChay') : t('choi.chinhCoDinh'), '', 3200);
  }
  /** Khung chương trình đang xem chỉ đọc: chương trình chính cố định (màn chế lệnh), màn trình diễn chỉ bấm Chạy (man.chiChay, HD1) hay robot tự động khóa
   *  của màn nhiều robot (man.doi[i].coDinh). */
  function khungCoDinh() { return !!(S.man && (S.man.chinhCoDinh || S.man.chiChay || (S.man.doi && S.man.doi[S.xe] && S.man.doi[S.xe].coDinh))); }

  /* ------------------------------------------------------------- bong bóng */
  // Mọi bong bóng (đề bài, gợi ý, chẩn đoán sau khi chạy) đè lên cột KHỐI LỆNH (E.bongD), kho khối tạm ẩn khi bong bóng mở;
  // nhờ vậy sân (robot dừng ở đâu) và cột CHƯƠNG TRÌNH (dòng tô đỏ, kéo thả) luôn thấy được.
  function bong(o) { TP.bongVe(E.bongD, o); }
  function anBongD() { TP.bongAn(E.bongD); }
  function anBong() { anBongD(); }
  /** Bài làm hiện tại còn y nguyên code mẫu của màn (bỏ qua dòng trống cuối; hàm của màn so tên + thân) không. */
  function trungMaMau() {
    var mm = S.man.maMau || {}, b = S.bai;
    function cat(a) { a = (a || []).slice(); while (a.length && !String(a[a.length - 1]).trim()) a.pop(); return a; }
    function bang(a, c) { a = cat(a); c = cat(c); return a.length === c.length && a.every(function (x, i) { return x === c[i]; }); }
    if (!bang(b.chinh, mm.chinh)) return false;
    var hb = b.hamCuaMan || [], hm = mm.hamCuaMan || [];
    if (hb.length !== hm.length) return false;
    return hm.every(function (f) {
      var g = hb.filter(function (x) { return x.ten === f.ten; })[0];
      return !!g && bang(g.than, f.than);
    });
  }
  /** Đề bài = mục tiêu (luôn đúng). Câu nói về code mẫu (veMaMau) chỉ hiện khi bài làm còn là code mẫu. */
  function hienDeBai() {
    var m = S.man;
    bong({ kieu: 'de', tieuDe: m.id + ' · ' + m.ten, chu: m.deBai, phu: m.veMaMau && trungMaMau() ? m.veMaMau : null });
  }
  /** Menu ☰: về màn chọn / làm lại từ đầu (nạp lại code mẫu, bỏ bản nháp; không đụng kho hàm của em và sao). */
  function moMenu() {
    var m = TP.Hop.mo(t('menu.tieuDe'), 'hop-nho hop-menu');
    var hang = h('div', 'hop-hang cot');
    hang.appendChild(TP.Hop.nut('g-pu', t('menu.veChon'), function () { TP.Hop.dong(); roi(); App.veChon(); }, 'menu-ve-chon'));
    hang.appendChild(TP.Hop.nut('g-or', t('menu.lamLai'), function () {
      TP.Hop.xacNhan({ tieuDe: t('menu.lamLai'), noiDung: t('menu.lamLaiHoi'), co: t('menu.lamLaiCo') }).then(function (ok) { if (ok) lamLai(); });
    }, 'menu-lam-lai'));
    if (window.CaiDat) hang.appendChild(TP.Hop.nut('g-te', t('menu.caiDat'), function () { CaiDat.mo(); }, 'menu-cai-dat'));
    if (window.GoLoi && GoLoi.laBat()) hang.appendChild(TP.Hop.nut('g-cy', t('go.menu'), function () { GoLoi.mo(); }, 'menu-go-loi'));   // chỉ khi đang ở chế độ gỡ lỗi (?debug=1 / #debug / đã mở bảng / "Mở hết")
    hang.appendChild(TP.Hop.nut('g-wd', t('chung.dong'), function () { TP.Hop.dong(); }, 'menu-dong'));
    m.than.appendChild(hang);
  }
  function lamLai() {
    var m = S.man; if (!m) return;
    Luu.xoaNhap(m.ma);
    vao(m);                // nạp lại maMau, dựng lại kho khối, mở lại bong bóng đề bài
  }
  function goiY() {
    var ds = S.man.goiY || [];
    if (!ds.length) { bong({ kieu: 'goi', tieuDe: t('choi.goiY'), chu: t('choi.khongGoiY') }); return; }
    var i = S.goiYi % ds.length; S.goiYi++;
    bong({ kieu: 'goi', tieuDe: t('choi.goiYSo', { i: i + 1, n: ds.length }), chu: ds[i] });
  }
  /** Các vị trí (cot, dong, ten) mà một chẩn đoán trỏ tới. Lỗi `cau-truc-chua-hoc` / `tran-khung` ghi cot, dong, ten ngay trên chẩn đoán. */
  function chiCho(c) {
    var ds = [c.cho || TP.choBoSung(c, vetXe(c.xe)), c.choTruoc, c.choTruot, c.choPush, c.choNem, c.choBan];
    if (c.ma === 'cau-truc-chua-hoc' && c.cot && c.dong > 0) ds.push({ cot: c.cot, dong: c.dong, ten: c.ten });
    return ds;
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
    chiCho(c).forEach(function (cho) { if (dong === null && cho && cho.cot === 'chinh' && cho.dong > 0) dong = cho.dong - 1; });
    TP.bongMui(E.bongD, dong === null ? null : S.ed.hangEl(dong));
  }

  /* ----------------------------------------------------------- sửa chương trình */
  function khiDoi() {
    dongBoBai(); Luu.ghiNhap(S.man.ma, S.bai);
    datLaiChay();
    veKho();
    veHamDem();
  }

  /* -------------------------------------------------------------- chạy / phát lại */
  function datLaiChay() {
    S.rid++; S.busy = false; S.ket = null; S.vet = null; S.lap = null; S.idx = 0; S.nhip = 0; S.marks = null; S.cap = null;
    if (window.AmThanh && AmThanh.datCheDo) AmThanh.datCheDo('soan');
    E.side.classList.remove('busy');
    if (S.man && S.man.doi) veTabXe();
    if (S.si !== 0 && nhieuSan()) { S.si = 0; S.field.nap(cauHinhSan(0)); } else S.field.datLai();
    veDongHo(); veSanBar();
    S.ed.datChay(null); S.ed.datLoi([]); S.pal.datSang(null); S.pal.datLoi([]);
    DenBoPhan.tat();
    anToast(); anBong();
  }
  /** Lỗi khung (quá giới hạn hàm của màn, tràn ô, cấu trúc chưa học…): lõi chưa chạy sân nào, kết quả không có theoSan; vẫn có chẩn đoán để hiện. */
  function loiKhung() { return !!S.ket && !(S.ket.theoSan || []).length; }
  function chuanBi() {
    dongBoBai();
    S.ket = ChamHoc.cham(S.man, S.man.doi ? { doi: S.bai.doi, hamCuaMan: S.bai.hamCuaMan } : { chinh: S.bai.chinh, hamCuaMan: S.bai.hamCuaMan }, KhoHam.ds());
    if (loiKhung()) {                                                                       // không có sân nào để phát lại: sân về chỗ xuất phát, Chạy sẽ hiện chẩn đoán
      S.vet = []; S.idx = 0; S.nhip = 0; S.lap = null; S.cap = null; S.marks = null;
      S.field.datLai(); veDongHo(); veSanBar();
      return;
    }
    var si = 0;
    if (nhieuSan()) { var k = S.ket.theoSan.map(function (x) { return x.thang; }).indexOf(false); si = k < 0 ? 0 : k; }      // mặc định xem sân trượt đầu tiên (thắng hết thì sân 1)
    S.marks = null;
    S.field.nap(cauHinhSan(si));
    datVet(si);
  }
  /** Chọn vết của sân si để phát lại (kết quả đã có): đặt lại số nhịp, số lượt vòng for, giới hạn phát lại khi vòng while chạy mãi. */
  function datVet(si) {
    var ts = S.ket.theoSan[si];
    S.si = si; S.vet = ts.doi ? gopVet(ts.doi) : ts.vet; S.idx = 0; S.nhip = 0;      // nhiều robot: vết gộp theo nhịp chung
    S.lap = S.ed.lapChoVet(ts.doi ? ts.doi[S.xe].vet : S.vet, dongChinhCua);        // số lượt của các vòng for theo từng sự kiện
    S.cap = ts.chanDoan.some(function (c) { return c.ma === 'vong-vo-han'; }) ? { nhip: 6, lenh: 36 } : null;      // while chạy mãi: chỉ phát lại vài nhịp rồi dừng
    veDongHo(); veSanBar();
  }

  /* ----------------------------------------------------------- nhiều sân */
  function nhieuSan() { return !!S.man && Array.isArray(S.man.san[0]); }
  /** Dải ảnh nhỏ của các sân (đầu cột nút): chạm một ảnh để xem sân đó; sau khi Chạy có dấu ✓ (tới cờ) / ✗ (chưa). */
  function dungSanBar() {
    E.bar.innerHTML = ''; S.nut = [];
    if (!nhieuSan()) return;
    S.man.san.forEach(function (rows, i) {
      var b = h('button', 'sanbt'); b.setAttribute('data-nut', 'san-' + (i + 1)); b.setAttribute('data-san', i);
      var ch = cauHinhSan(i), cv = h('canvas'); SanVe.thuSan(cv, rows, ch.batDau, undefined, undefined, { mau: ch.mau, vatMau: ch.vatMau, vatChat: ch.vatChat, vatThem: ch.vatThem, cuaNhip: ch.cuaNhip, nutBat: ch.nutBat, hinh: ch.hinh, sonBanDau: ch.sonBanDau });
      b.appendChild(cv); b.appendChild(h('span', 'sn', String(i + 1))); b.appendChild(h('span', 'dau'));
      b.addEventListener('click', function () { xemSan(i); });
      E.bar.appendChild(b); S.nut.push(b);
    });
    veSanBar();
  }
  function veSanBar() {
    S.nut.forEach(function (b, i) {
      b.classList.toggle('on', i === S.si);
      var d = b.querySelector('.dau'), tt = S.marks ? S.marks[i] : null;
      d.className = 'dau' + (tt === true ? ' ok' : tt === false ? ' sai' : '');
      d.innerHTML = '';
      if (tt === true || tt === false) d.appendChild(Ve.ico(tt ? 'check' : 'cross', 1, { fill: BM.trang, line: BM.vienDam }));
      b.setAttribute('aria-label', t(tt === true ? 'choi.sanQua' : tt === false ? 'choi.sanTruot' : 'choi.san', { n: i + 1 }));
    });
  }
  /** Đồng hồ NHỊP: nhịp của sân đang xem; màn nhiều sân thì kèm TỔNG (số được tính sao) sau khi đã chạy. */
  function veDongHo() {
    E.clock.textContent = String(S.nhip || 0);
    E.tong.textContent = S.ket && nhieuSan() && !S.cap ? t('choi.tong', { n: S.ket.soNhip }) : '';      // vòng while chạy mãi: tổng vô nghĩa (chỉ phát lại vài nhịp), ẩn
  }
  /** Xem sân i (chạm ảnh nhỏ): nạp sân, và nếu đã chạy thì chuẩn bị phát lại vết của sân đó (nút Chạy phát lại). */
  function xemSan(i) {
    if (!nhieuSan() || i === S.si || i < 0 || i >= S.man.san.length) return;
    var dangPhat = S.busy && S.ket && !loiKhung();                                      // 29/10: đang phát lại vẫn đổi sân được (trước đây chạm bị bỏ qua, người chơi tưởng hỏng)
    if (S.busy && !dangPhat) return;
    if (dangPhat) { S.rid++; S.busy = false; E.side.classList.remove('busy'); sang(null); DenBoPhan.tat(true); }
    if (window.HuongDan) HuongDan.bao('xem-san', { i: i });                           // hướng dẫn từng bước: đã chạm ảnh nhỏ của một sân
    anToast();
    S.field.nap(cauHinhSan(i));
    S.ed.datChay(null); S.pal.datSang(null);
    if (S.ket && !loiKhung()) datVet(i); else { S.si = i; S.nhip = 0; veDongHo(); veSanBar(); }
    if (S.ket && !S.ket.thang && E.bongD.hasAttribute('data-ca')) { dungChanDoan(S.ket); hienChanDoan(); }      // đang mở chẩn đoán: đổi sang chẩn đoán của sân này
    if (dangPhat) chay();                                                               // đang phát thì phát tiếp sân vừa chọn từ đầu
  }
  /** Chỉ số dòng (từ 0) của chương trình mà sự kiện lệnh e đang chạy (kể cả khi lệnh nằm trong hàm được gọi từ dòng đó). */
  function dongChinhCua(e) {
    var chuoi = [e.cho].concat(e.ngan || []), dong = null;
    chuoi.forEach(function (c) { if (c && c.cot === 'chinh') dong = c.dong - 1; });
    return dong;
  }
  async function chay(tungNhip) {
    if (S.busy) return;
    if (window.HuongDan) HuongDan.bao('chay', { tungNhip: !!tungNhip });
    if (!S.ket) chuanBi();
    else if (S.idx >= S.vet.length) { datLaiChay(); chuanBi(); }
    anBong(); anToast(); S.ed.anHoan();
    S.ed.datLoi([]); S.pal.datLoi([]);
    var my = ++S.rid; S.busy = true; E.side.classList.add('busy');
    if (window.AmThanh && AmThanh.datCheDo) AmThanh.datCheDo(S.man && S.man.hang === 'trum' ? 'trum' : 'chay');
    var vet = S.vet, cap = S.cap, lenhDem = 0, capDung = false, lenhNhip = [];      // lenhNhip: các lệnh chạy trong nhịp sắp phát (để đèn bộ phận sáng đúng)
    while (S.idx < vet.length) {
      var e = vet[S.idx++];
      var toc = S.toc * (S.nhip < 60 ? 1 : S.nhip < 120 ? 3 : 6);        // phát lại dài (quá ~60 nhịp) thì tự tăng tốc
      if (cap) toc = Math.max(toc, 2.5);                                // vòng while chạy mãi: phát lại nhanh vài nhịp
      if (e.loai === 'lenh') {
        lenhNhip.push(e);
        sang(e, toc);
        await SanVe.ngu(LENH_MS / toc); if (my !== S.rid) return;
        if (cap && ++lenhDem >= cap.lenh) { capDung = true; break; }
      } else {
        if (window.AmThanh && lenhNhip.some(function (l) { return /^(left_|right_|slide_|go_)/.test(l.ten); })) AmThanh.phat('buoc');      // nhịp robot đi / bay: tiếng bước (đứng chờ thì im)
        if (e.doi) {                                                    // nhiều robot: một nhịp chung, phát lần lượt từng robot (robot đứng yên chỉ thoáng qua)
          if (e.doi[S.xe]) DenBoPhan.bat(e.doi[S.xe], lenhNhip.filter(function (x) { return x.xe === S.xe; }));
          for (var kx = 0; kx < e.doi.length; kx++) {
            var ek = e.doi[kx]; if (!ek) continue;
            var yen = (ek.suKien || []).every(function (q) { return q.ma === 'dung-yen' || q.ma === 'doc-cam-bien'; });
            S.field.chonXe(kx);
            await S.field.phatNhip(ek, yen ? 40 : NHIP_MS * 0.6 / toc); if (my !== S.rid) return;
          }
          S.field.chonXe(S.xe);
        } else {
          DenBoPhan.bat(e, lenhNhip);
          await S.field.phatNhip(e, NHIP_MS / toc); if (my !== S.rid) return;
        }
        DenBoPhan.tat(true); lenhNhip = [];
        S.nhip++; lenhDem = 0; E.clock.textContent = String(S.nhip);
        if (cap && S.nhip >= cap.nhip) { capDung = true; break; }
        if (tungNhip) {
          if (S.idx >= vet.length) break;
          S.busy = false; E.side.classList.remove('busy');
          if (window.AmThanh && AmThanh.datCheDo) AmThanh.datCheDo('soan');
          return;
        }
      }
    }
    sang(null);
    if (capDung) S.idx = vet.length;                                  // đã dừng giữa chừng: Chạy lần sau chạy lại từ đầu
    S.busy = false; E.side.classList.remove('busy');
    if (window.AmThanh && AmThanh.datCheDo) AmThanh.datCheDo('soan');
    ketThuc(capDung);
  }

  /** Sáng dòng đang chạy; mục lệnh đọc cảm biến thì cảm biến ở hông nháy và có tia tới ô được đo (toc = hệ số tốc độ). */
  function sang(e, toc) {
    if (!e) { S.ed.datChay(null); S.pal.datSang(null); return; }
    if (window.AmThanh) { if (e.docCamBien) AmThanh.phat('quet'); else AmThanh.lenh(e.ten); }
    if (e.xe !== undefined && e.xe !== S.xe) {                    // nhiều robot: lệnh của robot kia chỉ hiện tia cảm biến trên sân; khung code đang xem robot này
      if (e.docCamBien) { S.field.chonXe(e.xe); S.field.docCamBien(e.docCamBien, 380 / (toc || 1)); S.field.chonXe(S.xe); }
      return;
    }
    if (e.docCamBien) S.field.docCamBien(e.docCamBien, 380 / (toc || 1));
    if (e.aimTam) S.field.datTam(e.aimTam);                       // aim(n) vừa chạy: cần ném đổi số ngắm, vòng ở ô rơi nháy
    if (e.inkMau) S.field.datMauSon(e.inkMau);                    // ink(c) vừa chạy: lon sơn trên xe đổi màu
    S.ed.datChay(dongChinhCua(e), S.lap && S.lap.get(e));
    if (e.cho && (e.cho.cot === 'hamEm' || e.cho.cot === 'hamMan')) S.pal.datSang(e.cho.cot === 'hamEm' ? 'em' : 'man', e.cho.ten);
    else S.pal.datSang(null);
  }

  /** Chẩn đoán để hiện khi đang xem sân si: của chính sân đó trước (kèm "Sân N:"), rồi những mã chỉ có ở sân khác. Một sân thì giữ nguyên. */
  function chanDoanXem(k, si) {
    if (!nhieuSan() || !(k.theoSan || []).length) return k.chanDoan;
    var rieng = (k.theoSan[si].chanDoan || []).map(function (c) { return Object.assign({}, c, { loi: t('choi.sanTien', { n: si + 1 }) + c.loi, san: si }); });
    var co = {}; rieng.forEach(function (c) { co[c.ma] = true; });
    return rieng.concat(k.chanDoan.filter(function (c) { return c.san !== si && !co[c.ma]; }));
  }
  /** Dựng danh sách chẩn đoán S.cd (lỗi trước, thông tin sau) cho sân đang xem, tô dòng / khối bị trỏ tới. Trả về true nếu có lỗi tràn khung ở chương trình chính (cần nháy khung). */
  function dungChanDoan(k) {
    var ds = chanDoanXem(k, S.si);
    var loi = ds.filter(function (c) { return c.muc === 'loi'; });
    var tin = ds.filter(function (c) { return c.muc !== 'loi'; });
    S.cd = TP.xepChanDoan(loi.concat(tin)); S.cdi = 0;
    E.lapLai.classList.toggle('nhay', S.cd.some(function (c) { return c.ma === 'lap-khong-qua'; }));   // cách lắp không qua được màn: nút Lắp lại nhấp nháy
    var rows = [], bricks = [], conTran = false;
    S.cd.forEach(function (c) {
      if (c.xe !== undefined && c.xe !== S.xe) return;                 // nhiều robot: chỉ tô dòng của robot đang xem
      chiCho(c).forEach(function (cho) {
        if (!cho) return;
        if (cho.cot === 'chinh' && cho.dong > 0) rows.push(cho.dong - 1);
        else if (cho.cot === 'hamEm' && cho.ten) bricks.push('em:' + cho.ten);
        else if (cho.cot === 'hamMan' && cho.ten) bricks.push('man:' + cho.ten);
      });
      if (c.ma === 'dat-sai-mau') (S.bai.chinh || []).forEach(function (d, i) { if (/^\s*(drop|magnet_off|throw)\(\)/.test(d)) rows.push(i); });      // thả vật sai màu đích: tô các dòng drop() của chương trình
      if (c.ma === 'tran-khung') {
        conTran = true;
        if (c.cot === 'hamEm') bricks.push('em:' + c.ten); else if (c.cot === 'hamMan') bricks.push('man:' + c.ten);
      }
    });
    S.ed.datLoi(rows); S.pal.datLoi(bricks);
    if (S.man && S.man.doi) veTabXe();
    return conTran && !bricks.length && S.cd.some(function (c) { return c.cot === 'chinh'; });
  }

  function ketThuc(capDung) {
    var k = S.ket;
    if (nhieuSan()) { S.marks = k.theoSan.map(function (x) { return !!x.thang; }); veSanBar(); }        // ✓ / ✗ trên từng ảnh nhỏ
    veDongHo();
    if (k.thang) {
      if (window.HuongDan) HuongDan.xongMan(S.man);                                    // thắng rồi: hướng dẫn từng bước của màn (huong-dan-man.js) thôi, lưu cờ
      S.field.mungThang();
      if (window.AmThanh) AmThanh.phat('thang');
      var tot = Luu.ghiSao(S.man.ma, k.sao);
      sao3(tot);
      var my = S.rid;
      setTimeout(function () { if (my === S.rid) bangThang(); }, 750);
      return;
    }
    // chưa thắng: bong bóng chẩn đoán (lỗi trước, thông tin sau), đánh dấu dòng / khối
    if (window.AmThanh) AmThanh.phat('hong');
    var conTran = dungChanDoan(k);
    if (conTran) S.ed.nhay();
    if (S.cd.some(function (c) { return c.ma === 'lech-bong-mo' || c.ma === 'chua-qua-diem'; })) S.field.nhayBongMo(1500);      // bóng mờ nháy: chỗ xe cần tới (và ô ◆ chưa qua) hiện rõ
    if (!S.bai.chinh.length && !k.vet.length && !S.bai.hamCuaMan.length) toast(t('choi.trong'), 'bad');
    hienChanDoan();
    if (!(nhieuSan() && k.theoSan[S.si] && k.theoSan[S.si].thang)) S.field.chopDo(200);          // sân đang xem đã tới cờ (sân khác trượt) thì không chớp đỏ
    S.field.quayVe();                  // xích dừng giữa lúc quay dở: xoay ngược về thẳng kèm dấu ?
    if (capDung) toast(t('choi.vongVoHan'), 'bad', 2600);
  }

  /* ------------------------------------------------------------- bảng thắng */
  function bangThang() {
    var m = S.man, k = S.ket, ss = m.sao || {};
    var re = ss.re && typeof m.giaLap === 'number' ? ss.re : null;                       // màn lắp ráp: sao thứ ba = nhanh HOẶC rẻ (cham.js: k.re, k.nguongO)
    var nguongO = k.nguongO !== undefined ? k.nguongO : ss.o;
    var okO = nguongO === undefined || k.soO <= nguongO, okN = ss.nhip === undefined || k.soNhip <= ss.nhip || !!(re && k.re);
    var duaVat = m.mucTieu === 'dua-vat' || m.mucTieu === 'day-thung';
    var hop = TP.Hop.mo(t(m.mucTieu === 'day-thung' ? 'thang.tieuDe.dayThung' : m.mucTieu === 'bong-mo' ? 'thang.tieuDe.bongMo' : m.mucTieu === 'to-hinh' ? 'thang.tieuDe.toHinh' : duaVat ? 'thang.tieuDe.duaVat' : 'thang.tieuDe'), 'hop-thang');
    hop.hop.setAttribute('data-sao', k.sao);
    var st = h('div', 'th-sao');
    for (var i = 0; i < 3; i++) { var w = h('span', 'th-s' + (i < k.sao ? ' on' : '')); w.appendChild(Ve.sao(i < k.sao, 4)); w.style.animationDelay = (0.15 + i * 0.22) + 's'; st.appendChild(w); }
    if (window.AmThanh) for (var si = 0; si < k.sao; si++) setTimeout(AmThanh.sao.bind(null, si), 150 + si * 220);      // tiếng sao khớp lúc từng sao hiện
    hop.than.appendChild(st);
    function dong(ok, chu) {
      var d = h('div', 'th-dong ' + (ok ? 'ok' : 'chua'));
      var ic = h('span', 'ic'); ic.appendChild(Ve.ico(ok ? 'check' : 'cross', 2, { fill: ok ? BM.xanhLaSangV1 : BM.doSangV5, shade: ok ? BM.xanhLaToiV1 : BM.doV16, line: BM.bangV3 }));
      d.appendChild(ic); d.appendChild(TP.vanBan(h('span'), chu)); return d;
    }
    if (nguongO !== undefined) hop.than.appendChild(dong(okO, t('thang.o', { x: k.soO, y: nguongO })));
    var nSan = (k.theoSan || []).length, tong = nSan > 1 && m.nhipTheo === 'tong';        // nhiều sân tính sao theo TỔNG nhịp các sân
    if (re && k.re) hop.than.appendChild(dong(true, t('thang.re', { x: m.giaLap, y: re.gia })));
    else if (ss.nhip !== undefined) hop.than.appendChild(dong(okN, (tong ? t('thang.nhipTong', { x: k.soNhip, n: nSan, y: ss.nhip }) : t('thang.nhip', { x: k.soNhip, y: ss.nhip })) + (re ? t('thang.hoacRe', { y: re.gia }) : '')));
    if (nSan > 1) hop.than.appendChild(h('div', 'th-theo', t('thang.theoSan', { ds: k.theoSan.map(function (x) { return x.soNhip; }).join(' + ') })));
    if (!okO) hop.than.appendChild(h('div', 'th-ghi', t('thang.thieuO')));
    else if (!okN) hop.than.appendChild(h('div', 'th-ghi', t(re ? 'thang.thieuNhipRe' : tong ? 'thang.thieuNhipTong' : duaVat ? 'thang.thieuNhipVat' : 'thang.thieuNhip')));
    else hop.than.appendChild(h('div', 'th-ghi tot', t('thang.duSao')));
    if (m.lapRap) { var cl = khoiCachLap(m); if (cl) hop.than.appendChild(cl); }        // màn lắp ráp: các cách lắp mẫu (part, giá, nhịp, ô) để thấy đánh đổi
    // thắng mà vẫn có lưu ý (vd. bánh bị gọi lại, hàm của màn che hàm của em): cho học sinh thấy
    var luu = k.chanDoan.slice(0, 2);
    if (luu.length) {
      var lw = h('div', 'th-luu'); lw.setAttribute('data-ma', k.chanDoan.map(function (x) { return x.ma; }).join(' '));
      lw.appendChild(h('span', 'k', t('choi.thongTin')));
      luu.forEach(function (x) { lw.appendChild(TP.vanBan(h('p'), x.loi)); });
      hop.than.appendChild(lw);
    }
    if (m.huyHieu) {
      var hh = h('div', 'th-huy'); var hi = h('span'); hi.setAttribute('data-i', 'huyhieu'); hi.setAttribute('data-s', '2'); hi.setAttribute('data-ma', m.huyHieu.ma); hi.setAttribute('data-tt', 'xong'); hh.appendChild(hi);
      var tx = h('div', 'tx'); tx.appendChild(h('div', 'k', t('thang.huyHieu'))); tx.appendChild(h('div', 'v', m.huyHieu.ten)); hh.appendChild(tx);
      hh.setAttribute('data-huy-hieu', m.huyHieu.ma);
      hop.than.appendChild(hh); Ve.hydrate(hh);
    }
    var tiep = App.manTiep(m);
    if (tiep && tiep.chuong !== (m.manGoc || m).chuong) tiep = null;               // xong màn cuối chương: về lưới màn của gói, không tự sang chương / gói mới
    var hang = h('div', 'hop-hang' + (m.lapRap ? ' ba' : ''));
    if (m.lapRap) hang.appendChild(TP.Hop.nut('g-or', t('thang.lapLai'), function () { TP.Hop.dong(); if (window.App && App.lapLai) App.lapLai(); }, 'lap-lai'));
    hang.appendChild(TP.Hop.nut('g-wd', t('thang.choiLai'), function () { TP.Hop.dong(); datLaiChay(); }, 'choi-lai'));
    hang.appendChild(TP.Hop.nut('g-gr', tiep ? t('thang.manTiep') : t('thang.hetChuoi'), function () {
      TP.Hop.dong();
      var di = function () { if (tiep) App.vaoMan(tiep.ma); else { roi(); App.veChon(); } };
      if (App.baoGoiMoi) App.baoGoiMoi(di); else di();             // tổng sao vừa đủ mở gói mới: bảng "Mở gói mới!" rồi mới đi tiếp
    }, 'man-tiep'));
    hop.than.appendChild(hang);
  }

  /** Mục "Cách lắp khác" của bảng thắng (màn lắp ráp): dòng "Em lắp" rồi từng cách lắp MẪU của màn — tên part, xu, nhịp, ô (LapRap.thongKeMau chạy lời giải mẫu qua máy chấm); cách giống cách em lắp có chữ "Em". */
  var tkMau = {};
  function khoiCachLap(m) {
    var goc = m.manGoc || m, ds;
    try { ds = tkMau[goc.ma] || (tkMau[goc.ma] = LapRap.thongKeMau(goc)); } catch (e) { return null; }
    if (!ds || !ds.length) return null;
    var em = LapRap.chuanCach(m.cachLapDaChon), khoa = function (c) { return c.than + '|' + c.tay + '|' + c.camBien; };
    var w = h('div', 'th-cach'); w.setAttribute('data-cach', ds.map(function (x) { return khoa(x.cach); }).join(' '));
    w.appendChild(h('div', 'k', t('thang.cachKhac')));
    var dEm = h('div', 'th-cach-em'); dEm.appendChild(h('span', 'c', t('thang.cachEm') + ': '));
    dEm.appendChild(h('span', 'ten', LapRap.moTa(em) + ' · ' + LapRap.giaCach(em) + ' xu'));
    w.appendChild(dEm);
    ds.forEach(function (x) {
      var cung = khoa(x.cach) === khoa(em);
      var d = h('div', 'th-cach-dong' + (cung ? ' cung' : '') + (x.thang ? '' : ' hong'));
      var hd = h('div', 'hd'); hd.appendChild(h('span', 'ten', x.ten));
      if (cung) hd.appendChild(h('span', 'chip', t('thang.cachEm')));
      d.appendChild(hd);
      var so = h('div', 'so'); so.appendChild(Ve.ico('xu', 1, { fill: BM.vangV3, toi: BM.goSangV14, sang: BM.kem, line: BM.vienDam }));
      so.appendChild(h('span', null, x.thang ? t('thang.cachSo', { xu: x.gia, nhip: x.nhip, o: x.o }) : t('thang.cachChua', { xu: x.gia })));
      d.appendChild(so);
      if (x.ghiChu) d.appendChild(h('div', 'gc', x.ghiChu));
      w.appendChild(d);
    });
    return w;
  }

  window.Choi = {
    dung: dung, vao: vao, roi: roi,
    trangThai: function () { return { man: S.man, bai: S.bai, ket: S.ket, busy: S.busy, xe: S.xe || 0 }; }          // xe: robot đang chọn ở khung code (màn nhiều robot)
  };
})();
