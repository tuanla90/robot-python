/* ============================================================================
   tran-game.js — LỚP MÀN CHƠI của "Đội Robot Chấn Hưng · Trận đấu".

   Trên nhân trận (robotics/tran-dau.js, luật v0.4), lớp này thêm:
     - NĂM MÀN, mỗi màn một ĐỀ (khối nằm ở đâu) + một ĐỐI THỦ do máy viết.
       Màn 1–3 mở KHE 1 (tay gắp). Màn 4–5 mở thêm KHE 2 (bánh xe) và ô nhớ chương trình.
     - Chương trình MẪU sinh theo (phương án × đề) — bản GỌN dùng hàm khi nhiều khối,
       và bản DÀI (copy-paste) để thấy vì sao ô nhớ hẹp dạy viết hàm.
     - LỜI THOẠI nhân vật theo tình huống (Khánh · thầy Khải · Hà Vy · Quân).
     - Kết luận cả trận: ai thắng nhiều sân hơn (màn này một sân).

   Chạy được cả trong Node (module.exports) và trong trình duyệt (window.TranGame).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var TD = laNode ? require('./tran-dau.js') : window.TranDau;
  var L = TD.LUAT_V04;

  /* ------------------------------------------------------- mẫu chương trình */

  /** Ô đứng kề khối + hướng nhìn tới khối (cho tay gắp dài: luôn đứng DƯỚI khối). */
  function oKe(o) { return { x: o.x, y: o.y + 1, h: 0 }; }

  function manhGoTo(x, y) { return 'go_to(' + x + ', ' + y + ')'; }

  /** Chờ cho trạm giao trống: tay gắp dài HỎI, chân nhanh CHỜ THEO LỊCH. */
  function choTram(pa) {
    return pa === 'TAY_DAI'
      ? ['while item_here():', '    wait()']
      : ['for k in range(6):', '    wait()'];
  }

  /** Thân MỘT chuyến cho một khối cụ thể (dùng cho đề một khối và cho bản dài). */
  function thanMotChuyen(pa, doi, o) {
    var tram = L.tram[doi], d = [];
    if (pa === 'TAY_DAI') {
      var k = oKe(o);
      d.push(manhGoTo(k.x, k.y));
      d.push('quay_ve(' + k.h + ')');
    } else {
      d.push(manhGoTo(o.x, o.y));
    }
    d.push('pick()');
    d.push(manhGoTo(tram.x, tram.y));
    return d.concat(choTram(pa)).concat(['drop()']);
  }

  /** R1 ĐI LẤY KHỐI. `gon` = bản GỌN: một hàm rồi gọi (tiết kiệm ô nhớ). */
  function mauR1(pa, doi, dsO, gon) {
    var tram = L.tram[doi], d = [];
    if (gon && dsO.length > 1) {
      d.push('def chuyen(x, y):');
      if (pa === 'TAY_DAI') {
        d.push('    go_to(x, y + 1)');
        d.push('    quay_ve(0)');
      } else {
        d.push('    go_to(x, y)');
      }
      d.push('    pick()');
      d.push('    go_to(' + tram.x + ', ' + tram.y + ')');
      choTram(pa).forEach(function (t) { d.push('    ' + t); });
      d.push('    drop()');
      d.push('');
      dsO.forEach(function (o) { d.push('chuyen(' + o.x + ', ' + o.y + ')'); });
      return d.join('\n');
    }
    dsO.forEach(function (o) { thanMotChuyen(pa, doi, o).forEach(function (t) { d.push(t); }); });
    return d.join('\n');
  }

  /** R2 GIAO HÀNG. Có cảm biến thì HỎI; mù thì CHỜ THEO LỊCH. */
  function mauR2(pa, doi, soChuyen) {
    var nha = L.nha[doi], tram = L.tram[doi];
    if (pa === 'TAY_DAI') {
      return [
        'for i in range(' + soChuyen + '):',
        '    go_to(' + tram.x + ', ' + tram.y + ')',
        '    n = 0',
        '    while not item_here() and n < 80:',
        '        wait()',
        '        n = n + 1',
        '    if item_here():',
        '        pick()',
        '        go_to(' + nha.x + ', ' + nha.y + ')',
        '        drop()'
      ].join('\n');
    }
    return [
      'for i in range(' + soChuyen + '):',
      '    go_to(' + tram.x + ', ' + tram.y + ')',
      '    for k in range(9):',
      '        wait()',
      '    pick()',
      '    go_to(' + nha.x + ', ' + nha.y + ')',
      '    drop()'
    ].join('\n');
  }

  /** Đối thủ: cùng bộ mẫu, thêm vài tick "chần chừ" theo độ mạnh. */
  function doiThu(tayGap, banhXe, dsO, doManh) {
    var cho = doManh === 'yeu' ? 6 : (doManh === 'vua' ? 3 : 0);
    var r1 = mauR1(tayGap, 'B', dsO, true);
    if (cho > 0) r1 = 'for i in range(' + cho + '):\n    wait()\n' + r1;
    return { tayGap: tayGap, banhXe: banhXe, R1: r1, R2: mauR2(tayGap, 'B', dsO.length + 1) };
  }

  /* ------------------------------------------------------------------ năm màn */

  var MAN = [
    {
      so: 1, ten: 'Trận tập', khe: 1,
      mucTieu: 'Giao được khối và thắng đội bạn. Đối thủ còn chần chừ.',
      de: 'Một khối ở (4,3) — ngay trên hàng nhà, cùng hàng với trạm giao.',
      san: [{ ten: 'sân chính', khoi: [{ x: 4, y: 3 }] }],
      doiThu: doiThu('CHAN_NHANH', 'XICH', [{ x: 4, y: 3 }], 'yeu'),
      dongHo: 1800
    },
    {
      so: 2, ten: 'Hai cột', khe: 1,
      mucTieu: 'Hai khối, không nằm trên hàng nhà. Đề này chiều tay gắp dài.',
      de: 'Hai khối ở (4,2) và (6,2) — lệch lên trên hàng nhà một ô.',
      san: [{ ten: 'sân chính', khoi: [{ x: 4, y: 2 }, { x: 6, y: 2 }] }],
      doiThu: doiThu('TAY_DAI', 'OMNI', [{ x: 4, y: 2 }, { x: 6, y: 2 }], 'vua'),
      dongHo: 1800
    },
    {
      so: 3, ten: 'Chung kết', khe: 1,
      mucTieu: 'Phải thắng TUYỆT ĐỐI: giao đủ cả 3 khối. Đồng hồ chỉ còn 40 giây.',
      de: 'Ba khối ở (4,1), (4,3), (4,5).',
      san: [{ ten: 'sân chính', khoi: [{ x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 5 }] }],
      doiThu: doiThu('TAY_DAI', 'XICH', [{ x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 5 }], 'manh'),
      dongHo: 400,
      yeuCauKhoi: true
    },
    {
      so: 4, ten: 'Ô nhớ hẹp', khe: 2, hanO: 24,
      mucTieu: 'Bốn khối, mà mỗi robot chỉ có 24 ô nhớ. Đừng copy-paste — hãy viết một hàm rồi gọi.',
      de: 'Bốn khối ở (4,1), (6,1), (4,5), (6,5). Thắng tuyệt đối: giao đủ 4 khối.',
      san: [{ ten: 'sân chính', khoi: [{ x: 4, y: 1 }, { x: 6, y: 1 }, { x: 4, y: 5 }, { x: 6, y: 5 }] }],
      doiThu: doiThu('TAY_DAI', 'OMNI', [{ x: 4, y: 1 }, { x: 6, y: 1 }, { x: 4, y: 5 }, { x: 6, y: 5 }], 'vua'),
      dongHo: 900,
      yeuCauKhoi: true
    },
    {
      so: 5, ten: 'Nhiều góc', khe: 2,
      mucTieu: 'Ba khối xếp chữ chi, đường đi toàn góc cua. Bánh xe chọn sai là hết giờ.',
      de: 'Ba khối ở (4,1), (6,3), (4,5). Thắng tuyệt đối.',
      san: [{ ten: 'sân chính', khoi: [{ x: 4, y: 1 }, { x: 6, y: 3 }, { x: 4, y: 5 }] }],
      doiThu: doiThu('TAY_DAI', 'XICH', [{ x: 4, y: 1 }, { x: 6, y: 3 }, { x: 4, y: 5 }], 'manh'),
      dongHo: 80,           // đo được: omni về đích ở tick 73, xích ở tick 90 → chọn bánh là sống còn
      yeuCauKhoi: true
    }
  ];

  /* -------------------------------------------------------------- chạy một màn */

  function chayMan(man, chon, codeA, tuyChon) {
    tuyChon = tuyChon || {};
    var dsSan = [];
    man.san.forEach(function (s) {
      var de = { ten: s.ten + ' · ' + man.ten, khoi: s.khoi, hanO: man.hanO === undefined ? null : man.hanO };
      var kq = TD.chamTranV04(de,
        { tayGap: chon.tayGap, banhXe: man.khe > 1 ? chon.banhXe : null, R1: codeA.R1, R2: codeA.R2 },
        { tayGap: man.doiThu.tayGap, banhXe: man.khe > 1 ? man.doiThu.banhXe : null, R1: man.doiThu.R1, R2: man.doiThu.R2 },
        { dongHo: tuyChon.dongHo || man.dongHo });
      dsSan.push({
        ten: s.ten, khoi: s.khoi, thang: kq.thang, diemA: kq.diemA, diemB: kq.diemB,
        lyDo: kq.lyDo, ketThuc: kq.ketThuc, tick: kq.tick, khung: kq.khung,
        chanDoan: kq.chanDoan, xong: kq.xong, loi: kq.loi, baoToan: kq.baoToan
      });
    });
    var thangA = dsSan.filter(function (s) { return s.thang === 'A'; }).length;
    var thangB = dsSan.filter(function (s) { return s.thang === 'B'; }).length;
    var duKhoi = dsSan.every(function (s) { return s.diemA >= s.khoi.length; });
    var thangTran = thangA > thangB;
    return {
      man: man.so, san: dsSan, thangSanA: thangA, thangSanB: thangB,
      thang: thangA > thangB ? 'A' : (thangB > thangA ? 'B' : 'hòa'),
      duKhoi: duKhoi,
      thangTuyetDoi: duKhoi && dsSan.every(function (s) { return s.thang === 'A'; }),
      dat: thangTran && (!man.yeuCauKhoi || duKhoi),
      lyDo: thangA + '–' + thangB + ' sân' + (man.yeuCauKhoi
        ? ' · giao ' + dsSan.map(function (s) { return s.diemA + '/' + s.khoi.length; }).join(',') + ' khối' : '')
    };
  }

  /** Các ô khối có thể có trong màn (đề cho biết). */
  function oCuaMan(man) {
    var dsO = [];
    man.san.forEach(function (s) {
      s.khoi.forEach(function (k) {
        if (!dsO.some(function (o) { return o.x === k.x && o.y === k.y; })) dsO.push({ x: k.x, y: k.y });
      });
    });
    return dsO;
  }

  /** Mẫu gợi ý (bản GỌN — vừa hạn ô nhớ của màn). */
  function mauChoMan(man, chon) {
    var dsO = oCuaMan(man);
    return { R1: mauR1(chon.tayGap, 'A', dsO, true), R2: mauR2(chon.tayGap, 'A', dsO.length + 1) };
  }

  /** Mẫu DÀI (copy-paste từng khối) — để thấy ô nhớ hẹp phạt cái gì. */
  function mauDaiChoMan(man, chon) {
    var dsO = oCuaMan(man);
    return { R1: mauR1(chon.tayGap, 'A', dsO, false), R2: mauR2(chon.tayGap, 'A', dsO.length + 1) };
  }

  /** Đếm ô nhớ của một chương trình theo luật v0.4. */
  function demO(code) { return TD.demO(code, L.chiPhiThuVien); }

  /* ------------------------------------------------------------- lời thoại */

  /** Nhân vật nói một câu theo tình huống. Trả về {ai, noi, lop}. */
  function loiThoai(tinhHuong, man, kq) {
    var K = {
      'mo-man': ['Hà Vy', 'Đề này khối nằm ở đó. Cậu tính đường đi trước, rồi hãy viết.'],
      'chon-tay-gap': ['Khánh', 'Tay gắp dài thì với được ô trước mặt, nhưng thân nặng — đi chậm gấp đôi.'],
      'chon-chan-nhanh': ['Khánh', 'Chân nhanh thì đi một tick một bước, mà MÙ: không hỏi được ô nào có khối.'],
      'chon-banh': ['Khánh', 'Bánh omni quay tại chỗ nhanh nhưng đi chậm. Bánh xích thì ngược lại. Đường nhiều góc thì omni hơn.'],
      'thang': ['Hà Vy', 'Được rồi! Giữ nhịp đó.'],
      'thang-tuyet-doi': ['thầy Khải', 'Thắng tuyệt đối. Cả bốn khối về đích — đúng cách một đội robot phải thắng.'],
      'thua': ['Quân', 'Thua keo này. Xem lại chỗ nào lệch nhịp đã.'],
      'hoa': ['Hà Vy', 'Hoà. Hai bên cùng nhịp — muốn hơn thì phải ăn nhịp tốt hơn, không phải code dài hơn.'],
      'thieu-khoi': ['Quân', 'Thắng điểm mà chưa giao đủ khối. Màn này đòi thắng tuyệt đối cơ.'],
      'memory-full': ['thầy Khải', 'Hết ô nhớ rồi. Phần nào lặp lại thì gom thành một hàm — máy chỉ nhớ được từng ấy dòng.'],
      'locked-command': ['Khánh', 'Lệnh đó phương án này không có. Đổi phương án, hoặc viết theo cách khác.'],
      'syntax-error': ['thầy Khải', 'Chỗ này viết chưa đúng cú pháp Python.'],
      'indent-error': ['thầy Khải', 'Thụt lề chưa khớp. Dòng trong khối phải lùi vào đều nhau.'],
      'pick-hut': ['Khánh', 'Nhặt hụt rồi — ô đó không có khối. Bên mù dễ dính cái này lắm.'],
      'het-gio': ['Quân', 'Hết đồng hồ. Đi chậm quá, hoặc vòng vo.'],
      'chua-viet-code': ['Hà Vy', 'Còn thiếu chương trình. Nạp mẫu rồi sửa cũng được, đừng ngồi không.']
    };
    // Tình huống suy ra từ kết quả trận
    if (!tinhHuong && kq) {
      var co = [];
      kq.san.forEach(function (s) {
        s.xong.forEach(function (r) { if (r.loi) co.push(r.loi.loai); });
        s.chanDoan.forEach(function (c) { co.push(c.split('@')[0].split(':').pop()); });
      });
      if (co.indexOf('memory-full') >= 0) tinhHuong = 'memory-full';
      else if (co.indexOf('locked-command') >= 0) tinhHuong = 'locked-command';
      else if (co.indexOf('syntax-error') >= 0) tinhHuong = 'syntax-error';
      else if (co.indexOf('indent-error') >= 0) tinhHuong = 'indent-error';
      // "thắng tuyệt đối" chỉ được gọi tên khi ĐỀ đòi nó
      else if (kq.thang === 'A' && kq.dat && man && man.yeuCauKhoi && kq.duKhoi) tinhHuong = 'thang-tuyet-doi';
      else if (kq.thang === 'A' && kq.dat) tinhHuong = 'thang';
      else if (kq.thang === 'A' && !kq.dat) tinhHuong = 'thieu-khoi';
      else if (kq.thang === 'B') tinhHuong = 'thua';
      else tinhHuong = 'hoa';
    }
    var t = K[tinhHuong] || K['mo-man'];
    return { ai: t[0], noi: t[1], lop: tinhHuong };
  }

  var API = {
    L: L, MAN: MAN, oKe: oKe, mauR1: mauR1, mauR2: mauR2,
    mauChoMan: mauChoMan, mauDaiChoMan: mauDaiChoMan, demO: demO,
    chayMan: chayMan, doiThu: doiThu, oCuaMan: oCuaMan, loiThoai: loiThoai
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.TranGame = API;
})();
