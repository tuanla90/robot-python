/* ============================================================================
   huong-dan-man.js — "Robot Chấn Hưng": HƯỚNG DẪN TỪNG BƯỚC CHO TỪNG MÀN (window.HuongDanMan).

   Dữ liệu cho khung huong-dan.js (đọc phần CÁCH DÙNG ở đầu tệp đó): mỗi màn làm quen có THAO TÁC MỚI được khai các bước
   "làm sáng nút / khối / dòng người chơi phải chạm" + một bong bóng ngắn nói chạm vào đâu và vì sao.
       window.HuongDanMan = { 'ma-man': [ { dich, chu, xong, … }, … ], … }       (mã màn = man.ma, vd 'hai-banh.2')
   HuongDan.vaoMan(man) lấy bước từ  man.huongDan || HuongDanMan[man.ma]  mỗi khi vào màn; cờ "đã xem" 'hd:' + mã màn (xong chuỗi, hay thắng màn, thì không hiện lại).
   Nạp SAU các tệp màn, TRƯỚC man-choi.js. Không sửa tệp màn: màn nào cần hướng dẫn thì thêm một mục ở đây.

   Luật viết:
   - Lời: MỘT câu ngắn (lớp 5), nói chạm vào đâu VÀ vì sao. Không rao luật, không giải bài hộ (màn "đố" / màn khó không có hướng dẫn riêng).
   - Không bước nào chặn người chơi: bước có `han` (tự qua khi đích đã được thấy đủ lâu) hoặc `daLam` (người chơi làm xong theo cách khác thì bước tự qua).
     Đích không thấy (khay bị bong bóng đề bài che, Xưởng đóng…) thì bước chỉ ẩn, hiện lại khi thấy.
   - Việc "chương trình có dòng gì" đọc từ Choi.trangThai().bai (chỉ đọc), việc "Xưởng đang mở / hộp đang mở" đọc từ DOM.
   - Bảng Gỡ lỗi (go-loi.js) và hướng dẫn chung của thanh-phan.js (xóa dòng, ◀ ▶ đổi thẻ) không khai ở đây.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------ đọc trạng thái game (chỉ đọc) */
  function dsChinh() { try { var b = window.Choi && Choi.trangThai().bai; return (b && b.chinh) || []; } catch (e) { return []; } }
  /** Bậc thụt (4 dấu cách một bậc) của một dòng code. */
  function bac(d) { return Math.floor(/^ */.exec(String(d))[0].length / 4); }
  /** Chỉ số dòng (từ 0) đầu tiên của chương trình chính khớp re (từ dòng `tu`), hoặc -1. */
  function dongCo(re, tu) { var a = dsChinh(); for (var i = tu || 0; i < a.length; i++) if (re.test(String(a[i]))) return i; return -1; }
  function soDongChinh() { return dsChinh().filter(function (d) { return String(d).trim(); }).length; }
  function xuongMo() { return !!document.querySelector('.ws-ov.open'); }
  function hopMo() { var h = document.getElementById('lop-hop'); return !!(h && h.classList.contains('mo')); }
  /** Số dòng có code trong thân hàm đang mở ở Xưởng, và toàn bộ chữ của thân hàm đó. */
  function dongXuong() { return document.querySelectorAll('.ws-ov.open .p-prog .rows .strip:not(.empty):not(.lock):not(.slot)').length; }
  function chuXuong() { var t = ''; Array.prototype.forEach.call(document.querySelectorAll('.ws-ov.open .p-prog .rows .strip'), function (s) { t += ' ' + s.textContent; }); return t; }
  /** Thân hàm của em tên ten: số dòng có code, và toàn bộ chữ. Xưởng đang mở thì đọc ngay trên màn hình; Xưởng đóng thì đọc bản đã lưu trong kho hàm
   *  (vào lại màn sau khi đã chế hàm thì bước "ghép thân hàm" tự qua). */
  function thanHam(ten) { var f = window.KhoHam && KhoHam.tim ? KhoHam.tim(ten) : null; return f && f.than ? f.than : []; }
  function soDongThan(ten) { return xuongMo() ? dongXuong() : thanHam(ten).filter(function (d) { return String(d).trim(); }).length; }
  function chuThan(ten) { return xuongMo() ? chuXuong() : thanHam(ten).join(' '); }
  /** Dòng đang được chọn (có viền sáng) của chương trình chính: chỉ số từ 0, hoặc -1. */
  function dongChon() { var rows = document.querySelectorAll('#pan-main .rows > .row'); for (var i = 0; i < rows.length; i++) if (rows[i].classList.contains('sel')) return i; return -1; }
  function daChay() { try { return !!Choi.trangThai().ket; } catch (e) { return false; } }
  function timDich(s) { return window.HuongDan ? HuongDan.timDich(s) : []; }
  function thay(s) { return timDich(s).length > 0; }
  function daCoHuongDanThe() { return !!window.HuongDan && HuongDan.dangChay('doi-the'); }       // hướng dẫn chung ◀ ▶ (thanh-phan.js) đang chỉ rồi: bước của màn không chỉ trùng
  function gop(a, b) { for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k]; return a; }

  /* ------------------------------------------------------------ viên gạch dựng bước */
  /** Đích ở trong Xưởng: Xưởng đóng thì không có đích (bước ẩn). */
  function trongXuong(ds) { return function () { return xuongMo() ? ds : []; }; }
  /**
   * Một bước chỉ vào các khối ds ('khoi:…') ở khay. Khối nằm ở thẻ khác của khay (đang không thấy) thì bước chỉ vào hai nút ◀ ▶ với lời chuThe
   * (trừ khi hướng dẫn chung ◀ ▶ đang chỉ rồi: khi đó ẩn, khỏi hai bong bóng chồng nhau). o: { xuong: true → chỉ trong Xưởng, huong, rong, han, daLam, xong }.
   */
  function khoiTheo(ds, chuKhoi, chuThe, o) {
    o = o || {};
    // wait được ghim ở mọi thẻ: nó không chứng minh các khối tay/cảm biến đã hiện.
    var chinh = ds.filter(function (s) { return !/^khoi:(?:goc:)?wait$/.test(s); });
    if (!chinh.length) chinh = ds;
    function dungThe() { return chinh.some(thay); }
    var b = {
      dich: function () {
        if (o.xuong && !xuongMo()) return [];
        var k = dungThe() ? ds.filter(thay) : [];
        if (k.length) return k;
        return daCoHuongDanThe() ? [] : ['nut:pal-the-sau', 'nut:pal-the-truoc'];
      },
      chu: function () { return dungThe() ? chuKhoi : chuThe; },
      rong: 170, han: 45000
    };
    if (o.xuong) b.xuong = true;
    return gop(b, { huong: o.huong, rong: o.rong || 170,
      han: o.han === undefined ? (o.daLam || o.xong ? 0 : 45000) : o.han, daLam: o.daLam, xong: o.xong });
  }
  var CHU_THE = 'Khối này nằm ở thẻ khác của khay. Bấm ◀ hoặc ▶ để sang thẻ đó.';
  /** Con số chạm được của dòng (từ 1) / bảng chọn 1–9 đang mở: một bước đổi số. phu: bảng chọn nổi lên trên khay. */
  function buocDoiSo(dong, chuSo, chuBang, daLam) {
    return {
      phu: true, huong: 'tren',
      dich: function () { return thay('nut:chon-so') ? 'nut:chon-so' : 'so:' + dong; },
      chu: function () { return thay('nut:chon-so') ? chuBang : chuSo; },
      xong: 'doi-so', daLam: daLam, rong: 160, han: 0
    };
  }
  /** range(N) đầu tiên của chương trình chính đã khác số mặc định 2 (người chơi đã đổi số lần lặp). */
  function daDoiSoLap() { var i = dongCo(/range\(\s*\d+\s*\)/); return i >= 0 && !/range\(\s*2\s*\)/.test(dsChinh()[i]); }
  /** Hàm mới → Tạo hàm: một bước (đích đổi theo hộp đặt tên), xong khi Xưởng mở. */
  function buocTaoHam(ten, chuMo, chuTao) {
    return {
      phu: true,
      dich: function () { return hopMo() ? 'nut:tao' : 'nut:ham-moi'; },
      chu: function () { return hopMo() ? chuTao : chuMo; },
      huong: function () { return hopMo() ? 'duoi' : 'tren'; },       // hộp đặt tên: bong bóng dưới nút (không đè ô tên hàm)
      xong: 'mo-xuong', rong: 160,
      daLam: function () { return xuongMo() || (!hopMo() && !!window.KhoHam && !!KhoHam.tim(ten)); }
    };
  }
  var CHU_TAO = 'Tên hàm đã điền sẵn. Bấm Tạo hàm.';
  /** Bước trong Xưởng: ghép khối thành thân hàm `ten`, xong khi thân hàm có từ n dòng (hay người chơi bấm Về sân sớm: phần Xưởng kết thúc). */
  function buocThanHam(ten, dich, chu, n, huong) {
    return {
      xuong: true, dich: trongXuong(dich), chu: chu, huong: huong, rong: 170, han: 0,
      xong: function (su) { return su === 'dong-xuong' || (su === 'chen-khoi' && soDongThan(ten) >= n); },
      daLam: function () { return soDongThan(ten) >= n; }
    };
  }
  /** Ba bước sau khi đã có thân hàm: Thử (trong Xưởng) → Về sân → Chạy. */
  function buocThuVeChay(chuChay) {
    return [
      { xuong: true, khongAn: true, dich: 'nut:thu', chu: 'Bấm Chạy: xe chạy thử hàm này trên sân nhỏ.', xong: ['thu', 'dong-xuong'], daLam: function () { return !xuongMo(); } },
      { xuong: true, khongAn: true, dich: 'nut:ve', chu: 'Hàm chạy đúng rồi thì bấm Về sân.', xong: 'dong-xuong', daLam: function () { return !xuongMo(); } },
      buocChay(chuChay)
    ];
  }
  function buocChay(chu) { return { khongAn: true, dich: 'nut:chay', chu: chu, xong: 'chay' }; }
  /** Bước "chạm khối để chèn" cho tới khi chương trình chính có từ n dòng. */
  function buocChen(dich, chu, n, huong) {
    return {
      dich: dich, chu: chu, rong: 170, han: 0, huong: huong,
      xong: function (su) { return su === 'chen-khoi' && soDongChinh() >= n; },
      daLam: function () { return soDongChinh() >= n; }
    };
  }
  /** Bước "chạm khối này" cho tới khi chương trình chính có dòng khớp re (không cần sự kiện: xét lại mỗi nhịp đồng hồ). */
  function buocCoDong(dich, chu, re, huong) {
    return { dich: dich, chu: chu, rong: 170, han: 0, huong: huong, daLam: function () { return dongCo(re) >= 0; } };
  }
  /**
   * Dòng khớp re phải THỤT VÀO cho tới bậc bacCan (nằm trong vòng for / if phía trên). Chưa chọn dòng thì sáng dòng đó ("chạm vào dòng này"),
   * chọn rồi (hai nút ⇤ ⇥ hiện lên) thì sáng đúng nút ⇥. Không có dòng đó (người chơi dựng khác đi) hoặc đã đủ bậc thì bước tự qua.
   */
  function buocThutVao(re, bacCan, chuDong, chuNut) {
    return {
      dich: function () { var i = dongCo(re); return i < 0 ? [] : (dongChon() === i ? 'nut:thut-vao' : 'dong:' + (i + 1)); },
      chu: function () { var i = dongCo(re); return i >= 0 && dongChon() === i ? chuNut : chuDong; },
      huong: function () { return dongChon() === dongCo(re) ? 'tren' : 'duoi'; },       // nút ⇥ ở đầu khung: bong bóng nằm trên nó; dòng: nằm dưới dòng (chỗ trống, không đè code)
      rong: 170, han: 0,
      daLam: function () { var i = dongCo(re); return i < 0 || bac(dsChinh()[i]) >= bacCan; }
    };
  }

  function dongFor(thu) {
    var a = dsChinh(), n = 0;
    for (var i = 0; i < a.length; i++) if (/^\s*for\b/.test(a[i]) && ++n === thu) return i;
    return -1;
  }
  function dongMoveTrongFor(thu) {
    var a = dsChinh(), f = dongFor(thu);
    for (var i = f + 1; f >= 0 && i < a.length; i++) {
      if (/^\s*for\b/.test(a[i])) break;
      if (/^\s*move\(\)/.test(a[i])) return i;
    }
    return -1;
  }
  function buocBacDong(layDong, can, chuDong, chuNut) {
    return {
      dich: function () { var i = layDong(); return i < 0 ? [] : dongChon() === i ? (bac(dsChinh()[i]) > can ? 'nut:thut-ra' : 'nut:thut-vao') : 'dong:' + (i + 1); },
      chu: function () { return dongChon() === layDong() ? chuNut : chuDong; },
      daLam: function () { var i = layDong(); return i >= 0 && bac(dsChinh()[i]) === can; },
      rong: 170, han: 0
    };
  }
  function buocSoFor(thu, so) {
    return {
      phu: true,
      dich: function () { return thay('nut:chon-so') ? 'nut:chon-so' : 'so:' + (Math.max(0, dongFor(thu)) + 1); },
      chu: function () { return thay('nut:chon-so') ? 'Chọn số ' + so + ' cho đoạn đường này.' : 'Chạm số trong vòng for thứ ' + thu + ', đổi thành ' + so + '.'; },
      daLam: function () { var i = dongFor(thu); return i >= 0 && new RegExp('range\\(\\s*' + so + '\\s*\\)').test(dsChinh()[i]); },
      rong: 170, han: 0
    };
  }
  var H = {};

  /* ============================================================ Chương 1 · Hai bánh */
  H['hai-banh.1'] = [
    buocChay('Bấm Chạy để xe làm theo các dòng lệnh có sẵn.')
  ];
  H['hai-banh.2'] = [
    buocChen(['khoi:left_move', 'khoi:right_move', 'khoi:wait'], 'Chạm khối ở đây để thêm lệnh vào chương trình. Mỗi ô xe đi cần đủ cả ba khối.', 9, 'duoi'),
    { khongAn: true, dich: ['nut:chay', 'nut:nhip'], neo: function () { return timDich('nut:chay')[0]; }, rong: 170, xong: 'chay',
      chu: 'Đủ ba ô rồi thì bấm Chạy. Bấm Nhịp để xem xe đi từng nhịp một.' }
  ];
  // 1.9 (Dọn dòng thừa): không dạy xóa lại. Cách xóa đã dạy một lần ở hướng dẫn chung của thanh-phan.js (lần đầu chèn khối, màn 1.2).
  H['hai-banh.10'] = [
    { dich: '#pan-main .rows', chu: 'Nhấn giữ một dòng, rồi kéo lên hoặc xuống để đổi chỗ.', xong: 'doi-cho', han: 30000, huong: 'tren', rong: 160 }
  ];
  H['hai-banh.9'] = [
    { dich: '#pan-main .rows', chu: 'Chạm một dòng thừa để chọn. Ô số của dòng đó hiện dấu xóa.', xong: 'chon-dong', han: 30000 },
    { dich: '#pan-main .row.sel .tab', chu: 'Bấm ô số có dấu xóa để bỏ dòng đã chọn. Xóa nhầm có thể Hoàn tác.', xong: ['xoa-dong', 'hoan-tac'], han: 30000 }
  ];

  /* ============================================================ Chương 2 · Xưởng hàm */
  H['xuong-ham.1'] = [
    buocChen('khoi:man:move', 'move() là hàm có sẵn, mỗi lần gọi xe tiến một ô. Chạm nó bốn lần.', 4, 'duoi'),
    buocChay('Bấm Chạy.')
  ];
  H['xuong-ham.2'] = [
    buocTaoHam('move', 'Em chưa có hàm move(). Bấm Hàm mới để tạo nó.', CHU_TAO),
    buocThanHam('move', ['khoi:left_move', 'khoi:right_move', 'khoi:wait'], 'Đây là thân hàm move(). Chạm ba khối này để xe tiến một ô.', 3)
  ].concat(buocThuVeChay('Chương trình gọi được move() rồi. Bấm Chạy.'));
  H['xuong-ham.3'] = [
    buocChen('khoi:em:move', 'Hàm move() em chế nằm ở đây. Chạm để dùng, như một lệnh có sẵn.', 3, 'duoi'),
    khoiTheo(['khoi:left_move', 'khoi:wait'], 'Sau ba move(), thêm left_move() rồi wait() để rẽ phải.', CHU_THE,
      { daLam: function () { var a = dsChinh(); return a.some(function (d, i) { return /^left_move\(\)/.test(d) && /^wait\(\)/.test(a[i + 1] || ''); }); } }),
    khoiTheo(['khoi:em:move'], 'Sau lệnh rẽ, thêm hai move() để đi tới cờ.', CHU_THE,
      { daLam: function () { return dsChinh().filter(function (d) { return /^move\(\)/.test(d); }).length >= 5; } }),
    buocChay('Hai đoạn đường đã đủ lệnh. Bấm Chạy.')
  ];

  /* ============================================================ Chương 3 · Chế lệnh xe */
  H['che-xe.1'] = [
    { khongAn: true, dich: '#field', chu: 'Bóng mờ là chỗ xe phải tới. Nhìn kỹ chỗ đứng và hướng mặt của nó.', xong: 'bam', han: 7000, rong: 160, huong: 'duoi' },
    { dich: 'dong:1', chu: 'Dòng này bị khóa: nó gọi dodge_right(), mà em chưa chế hàm đó.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('dodge_right', 'Chế hàm trong Xưởng: bấm Hàm mới.', CHU_TAO),
    buocThanHam('dodge_right', ['.p-pal .pal'], 'Ghép các khối thành thân hàm để xe sang ô bên phải, mặt vẫn quay lên như bóng mờ.', 1, 'tren')
  ].concat(buocThuVeChay('Chương trình chính đã gọi hàm của em. Bấm Chạy.'));
  // HD3 (29/10): banh-lui.5 là màn trình diễn lệnh lùi (chiChay), đứng ngay trước che-xe.4 (chế back()).
  H['banh-lui.5'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá. Bấm Chạy: hai bánh cùng quay lùi, xe lùi.', xong: 'chay' },
    { khongAn: true, dich: 'dong:1', chu: 'left_back() và right_back() trong cùng một nhịp: xe lùi một ô. Màn sau em gói chúng thành back().', xong: 'bam', han: 9000, rong: 170 }
  ];
  H['che-xe.4'] = [
    buocTaoHam('back', 'Chế hàm back() trong Xưởng: bấm Hàm mới.', CHU_TAO),
    {
      xuong: true, dich: trongXuong(['khoi:left_back', 'khoi:right_back', 'khoi:wait']), rong: 170, han: 45000,
      chu: 'Lùi một ô: left_back(), right_back() rồi wait() để hai bánh chạy.',
      daLam: function () { var c = chuThan('back'); return /left_back/.test(c) && /right_back/.test(c) && /wait/.test(c); }
    }
  ];

  /* ============================================================ Chương 4 · Tay gắp */
  H['tay-gap.1'] = [
    buocCoDong('khoi:em:move', 'Cần đi tiếp một ô tới sát ô đích: chạm move().', /^\s*move\(\)/),
    khoiTheo(['khoi:arm_down', 'khoi:release', 'khoi:wait'], 'Thả vật: arm_down(), release() rồi wait() để tay thực hiện.', 'Khối của tay nằm ở thẻ Tay kẹp. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { var a = dsChinh(), i = dongCo(/^\s*release\(\)/); return i >= 0 && a.slice(i + 1).some(function (d) { return /^\s*wait\(\)/.test(d); }); } }),
    buocChay('Bấm Chạy.')
  ];
  H['tay-gap.5'] = [
    buocTaoHam('pick', 'Gói việc nhặt vật thành hàm pick(): bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:arm_down', 'khoi:grab', 'khoi:arm_up', 'khoi:wait'], 'Nhặt vật: arm_down(), grab(), wait(), arm_up(), wait().', 'Khối của tay nằm ở thẻ Tay kẹp. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { xuong: true, xong: 'dong-xuong', daLam: function () { var c = chuThan('pick'); return /arm_down/.test(c) && /grab/.test(c) && /arm_up/.test(c) && (c.match(/wait/g) || []).length >= 2; } })
  ].concat(buocThuVeChay('Chương trình gọi được pick() rồi. Bấm Chạy.'));

  /* ============================================================ Chương 6 · Vòng lặp */
  // HD2 (29/10): vong-lap.1 là màn trình diễn for (chiChay): chỉ bấm Chạy; việc đổi số dời sang vong-lap.2.
  H['vong-lap.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá. Bấm Chạy: vòng for chạy dòng move() sáu lần.', xong: 'chay' },
    { khongAn: true, dich: 'dong:1', chu: 'range(6) là lặp sáu lần. Màn sau em tự viết vòng for và chọn số.', xong: 'bam', han: 9000, rong: 170 }
  ];
  H['vong-lap.2'] = [
    khoiTheo(['khoi:vong:for'], 'Chạm khối for: nó lặp lại những dòng thụt vào bên dưới.', 'Khối for nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*for\b/) >= 0; } }),
    khoiTheo(['khoi:em:move'], 'Chạm move(): dòng mới tự thụt vào, nằm trong vòng lặp.', 'move() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để quay lại thẻ đó.',
      { daLam: function () { return dongCo(/^\s*move\(\)/) >= 0; } }),
    buocThutVao(/^\s*move\(\)/, 1, 'move() đang đứng ngoài vòng lặp. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: move() phải nằm trong vòng lặp.'),
    buocDoiSo(1, 'Chạm số 2, chọn số lần lặp bằng số ô xe cần đi.', 'Chọn số lần xe cần đi tới cờ.', daDoiSoLap),
    buocChay('Bấm Chạy.')
  ];
  H['vong-lap.3'] = [
    khoiTheo(['khoi:vong:for'], 'Đoạn đầu đi lên năm ô. Thêm vòng for thứ nhất.', 'Khối for nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.', { daLam: function () { return dongFor(1) >= 0; } }),
    khoiTheo(['khoi:em:move'], 'Thêm move() vào trong vòng for thứ nhất.', 'move() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để quay về thẻ đó.', { daLam: function () { return dongMoveTrongFor(1) >= 0; } }),
    buocBacDong(function () { return dongMoveTrongFor(1); }, 1, 'Chạm move() của đoạn đầu để đặt nó trong vòng for.', 'Bấm thụt vào để move() nằm trong vòng for.'),
    buocSoFor(1, 5),
    khoiTheo(['khoi:em:turn_right'], 'Hết đoạn đầu mới rẽ: thêm turn_right() sau move().', 'turn_right() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để về thẻ đó.', { daLam: function () { return dongCo(/^\s*turn_right\(\)/) >= 0; } }),
    buocBacDong(function () { return dongCo(/^\s*turn_right\(\)/); }, 0, 'Chạm turn_right(): lệnh rẽ phải nằm ngoài vòng for.', 'Bấm thụt ra để xe chỉ rẽ một lần sau vòng for.'),
    khoiTheo(['khoi:vong:for'], 'Sau lệnh rẽ, thêm vòng for thứ hai cho đoạn ngang.', 'Khối for nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.', { daLam: function () { return dongFor(2) >= 0; } }),
    buocBacDong(function () { return dongFor(2); }, 0, 'Chạm for thứ hai: nó phải đứng ngang hàng với for thứ nhất.', 'Bấm thụt ra để hai vòng for độc lập.'),
    khoiTheo(['khoi:em:move'], 'Thêm move() vào trong vòng for thứ hai.', 'move() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để quay về thẻ đó.', { daLam: function () { return dongMoveTrongFor(2) >= 0; } }),
    buocBacDong(function () { return dongMoveTrongFor(2); }, 1, 'Chạm move() của đoạn ngang để đặt nó trong for thứ hai.', 'Bấm thụt vào để move() nằm trong for thứ hai.'),
    buocSoFor(2, 6),
    buocChay('Đoạn đầu lặp 5 lần, rẽ một lần, đoạn sau lặp 6 lần. Bấm Chạy.')
  ];
  H['vong-lap.8'] = [
    { dich: '#pan-main .rows', chu: 'Chạm một dòng để chọn nó: hai nút thụt lề sẽ hiện ra.', xong: 'chon-dong', han: 25000, huong: 'tren', rong: 160 },
    { dich: ['nut:thut-ra', 'nut:thut-vao'], huong: 'tren', rong: 170, han: 30000, xong: 'doi-bac',
      chu: '⇥ thụt vào: dòng nằm trong vòng lặp. ⇤ thụt ra: dòng nằm ngoài vòng lặp.' }
  ];

  /* ============================================================ Chương 8 · Cảm biến khoảng cách (HD1 29/10, show don't tell: trình diễn → ép → thả)
     khoang-cach.1 trình diễn if (chiChay), .12 ép if (hai sân, màn nhiều sân ĐẦU TIÊN của lộ trình), .2 trình diễn while (chiChay), .13 ép while (hai sân), .5 chế go_wall(). */
  var CHU_THE_LOGIC = 'Khối này nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.';
  var CHU_THE_XE = 'move() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để quay lại thẻ đó.';
  var BUOC_SANBAR = { khongAn: true, dich: '.sanbar', chu: 'Màn này có hai sân dài ngắn khác nhau. Chạm ảnh nhỏ để xem từng sân.', xong: ['xem-san', 'chay'], han: 12000, rong: 160, huong: 'duoi' };
  H['khoang-cach.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá. Bấm Chạy: mỗi lần lặp xe hỏi front_clear() rồi mới tiến.', xong: 'chay' },
    { khongAn: true, dich: 'dong:2', chu: 'Dòng if hỏi cảm biến: tới tường thì trả False nên xe dừng, không húc.', xong: 'bam', han: 9000, rong: 170 }
  ];
  H['khoang-cach.12'] = [
    BUOC_SANBAR,
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: if chỉ hỏi cảm biến một lần, xe mới đi được một ô.', xong: 'chay', daLam: daChay },
    khoiTheo(['khoi:vong:for'], 'Bọc if trong vòng for để hỏi nhiều lần: chạm khối for.', CHU_THE_LOGIC,
      { daLam: function () { return dongCo(/^\s*for\b/) >= 0; } }),
    buocThutVao(/^\s*if\s/, 1, 'if đang đứng ngoài vòng for. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: if phải nằm trong vòng for.'),
    buocThutVao(/^\s*move\(\)/, 2, 'move() phải nằm trong if. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: move() chỉ chạy khi if đúng.'),
    buocDoiSo(1, 'Chạm số này: lặp 5 lần là đủ cho cả sân dài.', 'Chọn 5: đủ cho sân dài, sân ngắn thì if lo phần dừng.', daDoiSoLap),
    buocChay('Bấm Chạy: một chương trình phải tới chỗ xe mờ ở cả hai sân.')
  ];
  H['khoang-cach.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá: while hỏi lại sau mỗi bước. Bấm Chạy, xe tự đi hết hành lang.', xong: 'chay' },
    { khongAn: true, dich: 'dong:1', chu: 'Không có số ô nào trong chương trình: hành lang dài bao nhiêu xe cũng tới.', xong: 'bam', han: 9000, rong: 170 }
  ];
  H['khoang-cach.13'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: đếm cứng 4 bước thì sân ngắn húc tường, sân dài chưa tới.', xong: 'chay', daLam: daChay },
    { dich: 'nut:xoa-het', chu: 'Bài này cần while thay cho đếm cứng. Bấm thùng rác để xóa chương trình cũ.', huong: 'duoi', rong: 160, han: 20000,
      daLam: function () { return hopMo() || soDongChinh() === 0 || dongCo(/^\s*while\b/) >= 0; } },                      // bấm thùng rác thì hộp hỏi lại mở: bước qua (kiểm theo nhịp đồng hồ, không đợi cú bấm)
    { phu: true, dich: 'nut:co', chu: 'Bấm Xóa hết để dọn sạch.', huong: 'duoi', rong: 150, daLam: function () { return !hopMo(); } },
    khoiTheo(['khoi:vong:while'], 'while hỏi cảm biến lại sau mỗi bước. Chạm khối while.', CHU_THE_LOGIC,
      { daLam: function () { return dongCo(/^\s*while\s+front_clear\(\)/) >= 0; } }),
    khoiTheo(['khoi:em:move'], 'Rồi chạm move(): dòng mới tự thụt vào, nằm trong while.', CHU_THE_XE,
      { daLam: function () { var w = dongCo(/^\s*while\s+front_clear\(\)/); return w >= 0 && /^\s+move\(\)/.test(String(dsChinh()[w + 1] || '')); } }),
    buocChay('Bấm Chạy: cùng hai dòng này xe tới chỗ xe mờ ở cả hai sân.')
  ];
  /* chế go_wall(): bấm Hàm mới, ghép while + move trong Xưởng, Thử, Về sân, Chạy */
  H['khoang-cach.5'] = [
    { dich: 'dong:1', chu: 'Dòng này gọi go_wall(), mà em chưa chế hàm đó. Chế nó trong Xưởng.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('go_wall', 'Bấm Hàm mới để chế go_wall().', CHU_TAO),
    khoiTheo(['khoi:vong:while'], 'Chạm khối while: lặp chừng nào trước mặt còn trống.', CHU_THE_LOGIC,
      { xuong: true, daLam: function () { return /while/.test(chuThan('go_wall')); } }),
    khoiTheo(['khoi:em:move'], 'Rồi chạm move(): nó tự thụt vào, nằm trong while.', CHU_THE_XE,
      { xuong: true, xong: 'dong-xuong', daLam: function () { var c = chuThan('go_wall'); return /while/.test(c) && /move/.test(c); } })
  ].concat(buocThuVeChay('Chương trình gọi go_wall() ba lần, mỗi đoạn dài khác nhau. Bấm Chạy.'));

  /* màn nhiều sân đầu tiên (3 sân): dải ảnh nhỏ bên trên nút Chạy; chạm một ảnh để xem sân đó, sau khi Chạy có ✓ / ✗ */
  H['khoang-cach.10'] = [
    { khongAn: true, dich: '.sanbar', chu: 'Màn này có ba sân khác nhau. Chạm ảnh nhỏ để xem từng sân.', xong: ['xem-san', 'chay'], han: 12000, rong: 160, huong: 'duoi' },
    { khongAn: true, dich: 'nut:chay', chu: 'Một chương trình phải giao hàng đúng đích ở cả ba sân. Bấm Chạy.', xong: 'chay', daLam: daChay },
    { khongAn: true, dich: function () { var d = document.querySelector('.sanbar .sanbt .dau.sai'); return d ? d.parentNode : []; }, huong: 'duoi', rong: 160, han: 20000,
      chu: 'Dấu ✗ là sân chưa giao hàng xong. Chạm ảnh đó để xem xe dừng ở đâu.', xong: 'xem-san' }
  ];

  /* ============================================================ Chương 11 · Đội hai robot */
  /* màn hai robot đầu tiên: R1 đã có chương trình; chạm thẻ R2 để viết chương trình của R2 (thẻ R1 / R2 ở đầu khung chương trình) */
  function xeDangChon() { try { return Choi.trangThai().xe || 0; } catch (e) { return 0; } }
  // HD3 (29/10): hai-robot.1 là màn trình diễn (chiChay, cả hai robot khoá go_wall()); bước "chạm R2 rồi viết cho R2" dời sang hai-robot.2 (R1 viết sẵn).
  // Một bước: bấm Chạy là thắng ngay, thắng thì chuỗi dừng (HuongDan.xongMan) nên bước "chạm R2 để xem" đặt sau Chạy sẽ không kịp hiện.
  H['hai-robot.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Mỗi robot một chương trình, cả hai đã khoá. Bấm Chạy: R1 và R2 chạy cùng lúc.', xong: 'chay' }
  ];
  H['hai-robot.2'] = [
    { khongAn: true, dich: 'nut:xe-2', chu: 'Mỗi robot một chương trình. R1 đã có sẵn: chạm R2 để viết cho R2.', huong: 'duoi', rong: 170, xong: 'doi-xe',
      daLam: function () { return xeDangChon() === 1; } },
    khoiTheo(['khoi:em:pick'], 'Chạm pick(): R2 làm giống R1, nhặt vật trước mặt.', CHU_THE,
      { daLam: function () { return xeDangChon() === 1 && dongCo(/^\s*pick\(\)/) >= 0; } }),
    buocChay('Viết đủ cho R2 như R1 rồi bấm Chạy: hai robot chạy cùng lúc.')
  ];

  /* ============================================================ Gói 7 · Cảm biến bên (HD2: cam-bien-ben.1 trình diễn left_clear, chiChay, đứng đầu chương) */
  H['cam-bien-ben.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá. Bấm Chạy: tới tường, xe hỏi bên trái rồi rẽ trái.', xong: 'chay' },
    { khongAn: true, dich: 'dong:2', chu: 'left_clear() hỏi ô bên trái xe: trống thì True. Màn sau em dùng right_clear().', xong: 'bam', han: 9000, rong: 170 }
  ];

  /* ============================================================ Gói 4 · Nút đè (HD2: nut-de.1 trình diễn cơ chế thùng giữ cửa, chiChay) */
  H['nut-de.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá. Bấm Chạy: carry() đặt thùng lên nút M, cửa C mở ra.', xong: 'chay' },
    { khongAn: true, dich: 'dong:1', chu: 'Thùng đè lên nút M thì cửa C mở. Màn sau em tự nhặt thùng đặt lên nút.', xong: 'bam', han: 9000, rong: 170 }
  ];

  /* ============================================================ Chương 9 · Hàm cho cảm biến (HD1: che-cam-bien.1 chế safe_move có if, .2 chế face_open có while not) */
  H['che-cam-bien.1'] = [
    { dich: 'dong:1', chu: 'Main đã khoá: nó gọi safe_move() ba lần, mà em chưa chế hàm đó.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('safe_move', 'Bấm Hàm mới để chế safe_move().', CHU_TAO),
    khoiTheo(['khoi:dk:if'], 'Chạm khối if: chỉ tiến khi trước mặt trống.', CHU_THE_LOGIC,
      { xuong: true, daLam: function () { return /if/.test(chuThan('safe_move')); } }),
    khoiTheo(['khoi:em:move'], 'Rồi chạm move(): nó tự thụt vào, nằm trong if.', CHU_THE_XE,
      { xuong: true, xong: 'dong-xuong', daLam: function () { var c = chuThan('safe_move'); return /if/.test(c) && /move/.test(c); } })
  ].concat(buocThuVeChay('Main gọi safe_move() ba lần, xe chỉ tiến khi trước mặt trống. Bấm Chạy.'));
  H['che-cam-bien.2'] = [
    { dich: 'dong:1', chu: 'Main đã khoá: nó gọi face_open(), mà em chưa chế hàm đó.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('face_open', 'Bấm Hàm mới để chế face_open().', CHU_TAO),
    khoiTheo(['khoi:vong:while'], 'Chạm khối while.', CHU_THE_LOGIC,
      { xuong: true, daLam: function () { return /while/.test(chuThan('face_open')); } }),
    { xuong: true, phu: true, huong: 'tren', rong: 180, han: 0,
      dich: function () { return thay('nut:chon-dk') ? 'nut:chon-dk' : xuongMo() ? 'so:1' : []; },
      chu: function () { return thay('nut:chon-dk') ? 'Chọn not front_clear(): lặp chừng nào trước mặt còn bị chắn.' : 'Chạm vào front_clear() trên dòng while để đổi điều kiện.'; },
      daLam: function () { return /not/.test(chuThan('face_open')); } },
    khoiTheo(['khoi:em:turn_right'], 'Rồi chạm turn_right(): quay phải cho tới khi thấy lối mở.', 'turn_right() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để về thẻ đó.',
      { xuong: true, xong: 'dong-xuong', daLam: function () { var c = chuThan('face_open'); return /not/.test(c) && /turn_right/.test(c); } })
  ].concat(buocThuVeChay('Xe quay cho tới khi nhìn thấy lối mở. Bấm Chạy.'));
  H['che-cam-bien.5'] = [
    buocTaoHam('bounce', 'Chế hàm bounce() trong Xưởng: bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:dem:dem-gan', 'khoi:dem:dem-tang', 'khoi:dem:dem-lap'],
      'Ba khối hồng để đếm: n = 0 lúc đầu, n = n + 1 mỗi ô xe đi thêm, for i in range(n) lặp đúng n lần.', CHU_THE,
      { xuong: true, xong: 'dong-xuong', huong: 'tren', rong: 180, daLam: function () { var t = chuThan('bounce'); return /n = 0/.test(t) && /n = n \+ 1/.test(t) && /range\(n\)/.test(t); } })
  ].concat(buocThuVeChay('Chương trình chính đã gọi bounce(). Bấm Chạy.'));

  /* ============================================================ Nam châm (cực N, cực S): wait() cho lệnh chạy, magnet_off() thả vật; hàm fetch() và grip() */
  H['nam-cham.1'] = [
    khoiTheo(['khoi:wait'], 'magnet_n() chỉ ra lệnh. Chạm wait() ngay sau nó để nhịp trôi và nam châm chạy.', 'Khối wait() nằm ở hàng dưới cùng của khay.',
      { daLam: function () { return dongCo(/^\s*wait\(\)/) >= 0; } }),
    khoiTheo(['khoi:magnet_off'], 'Xe tới sát ô đích thì ngắt điện: chạm magnet_off(), rồi wait() để vật rơi xuống.', 'Khối của nam châm nằm ở thẻ Nam châm. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*magnet_off\(\)/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  H['nam-cham.5'] = [
    buocTaoHam('fetch', 'Gói cả chuyến lấy vật thành hàm fetch(): bấm Hàm mới.', CHU_TAO),
    buocThanHam('fetch', ['.p-pal .pal'], 'Ghép các khối thành thân hàm: hút vật, quay đầu, tiến một ô rồi thả.', 1, 'tren')
  ].concat(buocThuVeChay('Chương trình gọi được fetch() rồi. Bấm Chạy.'));
  H['nam-cham.6'] = [
    buocTaoHam('grip', 'Gói việc kéo vật về thành hàm grip(): bấm Hàm mới.', CHU_TAO),
    buocThanHam('grip', ['.p-pal .pal'], 'Ghép các khối thành thân hàm: hỏi chữ trên vật rồi bật cực khác với nó.', 1, 'tren')
  ].concat(buocThuVeChay('Chương trình gọi được grip() rồi. Bấm Chạy.'));

  /* ============================================================ Chương 21 · Tay xoay (làm quen): lệnh gốc mới arm_left / arm_right cho CÙNG tay kẹp (gói V8c: thẻ "lệnh mới", không phải bộ phận mới) */
  // HD2 (29/10): tay-xoay.1 là màn trình diễn arm_left / arm_right (chiChay): chỉ bấm Chạy; tay-xoay.2 ép sửa lệnh xoay (vật bên phải).
  H['tay-xoay.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá. Bấm Chạy: tay kẹp xoay sang trái nhặt vật rồi xoay về trước đặt.', xong: 'chay' },
    { khongAn: true, dich: 'dong:1', chu: 'Tay kẹp giờ xoay được: arm_left() xoay tay sang trái, arm_right() xoay sang phải, xe không cần quay.', xong: 'bam', han: 9000, rong: 170 }
  ];
  H['tay-xoay.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: vật nằm bên phải mà tay xoay sang trái nên kẹp hụt.', xong: 'chay', daLam: daChay },
    { dich: 'dong:1', chu: 'Chạm dòng arm_left() rồi đổi thành arm_right(); dòng arm_right() phía dưới đổi thành arm_left().', xong: 'chon-dong', han: 12000, rong: 180,
      daLam: function () { return dongCo(/^\s*arm_right\(\)/) === 0; } },
    buocChay('Bấm Chạy.')
  ];
  H['tay-xoay.6'] = [
    buocTaoHam('clear_left', 'Gói việc dọn vật thành hàm clear_left(): bấm Hàm mới.', CHU_TAO),
    buocThanHam('clear_left', ['.p-pal .pal'], 'Ghép các khối thành thân hàm: nhặt vật, đặt sang trái rồi xoay tay về.', 1, 'tren')
  ].concat(buocThuVeChay('Chương trình gọi được clear_left() rồi. Bấm Chạy.'));

  /* ============================================================ Máy sơn (làm quen, 25/10): dot() chấm ô đang đứng, ink(c) chọn màu (bảng chọn bốn màu), chế dots(n) */
  var CHU_THE_SON = 'Khối sơn nằm ở thẻ Máy sơn. Bấm ◀ hoặc ▶ để sang thẻ đó.';
  H['may-son.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: dot() chấm sơn vào ô xe đang đứng.', xong: 'chay', daLam: daChay },
    khoiTheo(['khoi:em:move'], 'Chấm thứ hai cách hai ô: chạm move() hai lần.', CHU_THE,
      { daLam: function () { return dongCo(/^\s*move\(\)/, dongCo(/^\s*move\(\)/) + 1) >= 0; } }),
    khoiTheo(['khoi:dot', 'khoi:wait'], 'Rồi chạm dot() và wait() để chấm chấm thứ hai.', CHU_THE_SON,
      { daLam: function () { var i = dongCo(/^\s*move\(\)/); return i >= 0 && dongCo(/^\s*dot\(\)/, i) >= 0 && dongCo(/^\s*wait\(\)/, i) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  /** Dòng (từ 1) của lệnh ink(...) đầu tiên trong chương trình chính, 0 nếu chưa có. */
  function dongInk() { return dongCo(/^\s*ink\(/) + 1; }
  H['may-son.2'] = [
    khoiTheo(['khoi:ink'], 'Lệnh mới ink() chọn màu sơn. Chọn dòng đứng trước chấm thứ hai rồi chạm ink().', CHU_THE_SON,
      { daLam: function () { return dongInk() > 0; } }),
    {
      phu: true, huong: 'tren',
      dich: function () { return thay('nut:chon-mau') ? 'nut:chon-mau' : dongInk() ? 'so:' + dongInk() : []; },
      chu: function () { return thay('nut:chon-mau') ? 'Chọn blue: chấm sau dòng này sẽ màu xanh dương.' : 'Chạm vào màu trong ink() để chọn màu khác.'; },
      xong: 'doi-so', rong: 170, han: 0,
      daLam: function () { var i = dongInk() - 1; return i >= 0 && !/"red"/.test(dsChinh()[i]); }
    },
    buocChay('Bấm Chạy.')
  ];
  H['may-son.6'] = [
    buocTaoHam('dots', 'Chế hàm dots(n) trong Xưởng: bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:vong:for'], 'Chạm khối for, rồi trong vòng lặp thêm dot() và hai move().', 'Khối for nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { xuong: true, xong: 'dong-xuong', huong: 'tren', daLam: function () { var t = chuThan('dots'); return /for/.test(t) && /dot\(\)/.test(t); } })
  ].concat(buocThuVeChay('Chương trình chính đã gọi dots(3). Bấm Chạy.'));

  /* ============================================================ Chương 19 · Súng hơi (làm quen): shoot() bắn ra trước + giật lùi, shoot_back() bắn ra sau + giật tới */
  var CHU_THE_SUNG = 'Khối của vòi phun nằm ở thẻ Vòi phun. Bấm ◀ hoặc ▶ để sang thẻ đó.';
  // Gói T mùa 2 (29/10): sung-hoi.1 là màn trình diễn súng hơi (chiChay: chỉ bấm Chạy); phiên bản 2.
  H['sung-hoi.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chương trình đã khoá. Bấm Chạy: mỗi phát shoot() bắn ra trước, cú giật đẩy xe lùi một ô.', xong: 'chay' },
    { khongAn: true, dich: 'dong:2', chu: 'shoot() bắn, wait() cho nhịp trôi: ba vòng lặp là lùi ba ô. Màn sau em dùng shoot_back().', xong: 'bam', han: 9000, rong: 170 }
  ];
  H['sung-hoi.2'] = [
    khoiTheo(['khoi:shoot_back'], 'Lệnh mới shoot_back() bắn ra sau, xe giật tới. Chạm nó rồi chạm wait().', CHU_THE_SUNG,
      { daLam: function () { return dongCo(/^\s*shoot_back\(\)/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  H['sung-hoi.3'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: tia nước bay ra sau trúng van, cửa mở, xe được giật tới một ô.', xong: 'chay', daLam: daChay },
    buocChay('Rồi viết tiếp đoạn đi qua cửa. Bấm Chạy.')
  ];
  H['sung-hoi.4'] = [
    khoiTheo(['khoi:shoot'], 'Thùng nằm sau xe: chạm shoot(), cú giật đẩy xe lùi đúng vào thùng.', CHU_THE_SUNG,
      { daLam: function () { return dongCo(/^\s*shoot\(\)/) >= 0; } }),
    buocChay('Chạm wait() rồi bấm Chạy.')
  ];

  /* ============================================================ Chương 20 · Chế lệnh súng hơi: thẻ Súng hơi trong Xưởng */
  H['che-sung-hoi.1'] = [
    { khongAn: true, dich: '#field', chu: 'Xe mờ là chỗ xe phải tới. Xe chỉ cần lùi một ô.', xong: 'bam', han: 7000, rong: 160, huong: 'duoi' },
    buocTaoHam('jet_back', 'Chế hàm jet_back() trong Xưởng: bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:shoot'], 'Chạm shoot() rồi wait(): xe bắn một phát và bị giật lùi một ô.', CHU_THE_SUNG,
      { xuong: true, xong: 'dong-xuong', huong: 'tren', daLam: function () { return soDongThan('jet_back') >= 2; } })
  ].concat(buocThuVeChay('Chương trình chính đã gọi hàm của em. Bấm Chạy.'));
  H['che-sung-hoi.2'] = [
    buocTaoHam('jet_fwd', 'Chế hàm jet_fwd() trong Xưởng: bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:shoot_back'], 'Chạm shoot_back() rồi wait(): bắn ra sau thì xe được giật tới một ô.', CHU_THE_SUNG,
      { xuong: true, xong: 'dong-xuong', huong: 'tren', daLam: function () { return soDongThan('jet_fwd') >= 2; } })
  ].concat(buocThuVeChay('Chương trình chính đã gọi hàm của em. Bấm Chạy.'));

  /* ============================================================ Chương 13 · Thân nhện (co chân, gầm, hố, nhảy) */
  H['nhen.2'] = [
    buocCoDong('khoi:crouch', 'Gầm thấp: nhện phải co chân mới chui qua. Chạm crouch() để co chân.', /^\s*crouch\(\)/),
    khoiTheo(['khoi:stand'], 'Chui xong thì duỗi chân lại: chạm stand().', 'Khối này nằm ở thẻ khác của khay. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*stand\(\)/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  H['nhen.3'] = [
    buocCoDong('khoi:crouch', 'Muốn nhảy qua hố, nhện phải co chân trước. Chạm crouch().', /^\s*crouch\(\)/),
    khoiTheo(['khoi:stand'], 'Rồi chạm stand() NGAY TRƯỚC một bước đi: nhện sẽ bật qua hố.', 'Khối này nằm ở thẻ khác của khay. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*stand\(\)/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];

  /* ============================================================ Chương 15 · Danh sách (làm quen) · Chương 16 · Chế lệnh danh sách
     Thao tác mới: khối `a = [1, 2]` (nhóm DANH SÁCH, thẻ Logic), chạm một số trong [ ] để đổi, "thêm ô", `for n in a:`; trong Xưởng: `for n in steps:`, `seen.append(n)`. */
  var CHU_THE_LS = 'Khối danh sách nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.';
  /** Dòng đầu của chương trình chính có dạng `a = [..]`, và số phần tử đang có trong danh sách đó. */
  function dongDs() { return dongCo(/^\s*[A-Za-z_]\w*\s*=\s*\[/); }
  function soPtuDs() { var i = dongDs(); if (i < 0) return 0; var m = /\[(.*)\]/.exec(String(dsChinh()[i])); return m && m[1].trim() ? m[1].split(',').length : 0; }
  H['list.1'] = [
    khoiTheo(['khoi:ls-gan'], 'Chạm khối này để tạo một danh sách. Mỗi số trong [ ] là độ dài một đoạn đường.', CHU_THE_LS,
      { daLam: function () { return dongDs() >= 0; } }),
    {
      phu: true, huong: 'tren', rong: 170, han: 45000,
      dich: function () { if (thay('nut:chon-ptu')) return 'nut:chon-ptu'; var i = dongDs(); return i < 0 ? [] : 'so:' + (i + 1) + ':2'; },                  // số thứ hai của dòng = phần tử đầu (số đầu là tên danh sách)
      chu: function () { return thay('nut:chon-ptu') ? 'Chọn số mới: đoạn đầu dài 4 ô.' : 'Chạm một số trong danh sách để đổi nó.'; },
      xong: 'doi-so',
      daLam: function () { var i = dongDs(); return i >= 0 && /\[\s*4\b/.test(String(dsChinh()[i])); }
    },
    {
      phu: true, huong: 'tren', rong: 170, han: 45000,
      dich: function () { if (thay('nut:ptu-them')) return 'nut:ptu-them'; var i = dongDs(); return i < 0 ? [] : 'so:' + (i + 1) + ':' + (soPtuDs() + 1); },       // phần tử cuối: chạm nó rồi bấm thêm ô
      chu: function () { return thay('nut:ptu-them') ? 'Bấm thêm ô: danh sách có thêm một số ngay sau số này.' : 'Đường có ba đoạn. Chạm một số, rồi bấm thêm ô.'; },
      daLam: function () { return soPtuDs() >= 3; }
    },
    khoiTheo(['khoi:ls-for'], 'Chạm khối này: for n in a lấy lần lượt từng số trong danh sách ra làm n.', CHU_THE_LS,
      { daLam: function () { return dongCo(/^\s*for\s+\w+\s+in\s+\w+\s*:/) >= 0; } }),
    buocChay('Có forward(n) và rẽ phải trong vòng for rồi thì bấm Chạy.')
  ];
  H['list.8'] = [
    buocCoDong('khoi:man:tour', 'Hàm tour(steps) của màn nằm ở đây. Chạm để gọi, rồi sửa các số trong ngoặc vuông.', /^\s*tour\(/, 'duoi'),
    buocChay('Gọi cả tour() và tour_left(), mỗi hàm một danh sách. Bấm Chạy.')
  ];
  H['che-list.1'] = [
    buocTaoHam('route', 'Chế hàm route(steps) trong Xưởng: bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:ls-for'], 'Khối for n in steps: lấy lần lượt từng số trong danh sách steps. Chạm nó, rồi forward(n) và rẽ phải.', CHU_THE_LS,
      { xuong: true, xong: 'dong-xuong', huong: 'tren', rong: 180, daLam: function () { var t = chuThan('route'); return /forward\(n\)/.test(t) && /turn_right/.test(t); } })
  ].concat(buocThuVeChay('Chương trình chính đã gọi route(). Bấm Chạy.'));
  H['che-list.4'] = [
    buocTaoHam('scan', 'Chế hàm scan(seen) trong Xưởng: bấm Hàm mới.', CHU_TAO),
    {                                                                                      // khối seen.append(1) nằm ở thẻ Logic, dưới các khối ĐẾM: chưa thấy thì chỉ nút cuộn khay (Xưởng mở sẵn ở thẻ Logic)
      xuong: true, xong: 'dong-xuong', huong: 'tren', rong: 180, han: 45000,
      dich: function () { return thay('khoi:ls-them') ? ['khoi:ls-them'] : ['nut:pal-xuong']; },
      chu: function () { return thay('khoi:ls-them') ? 'Khối seen.append(n) thêm số n vào cuối danh sách seen. Đếm n như ở màn Đi rồi về, rồi ghi n vào seen.' : 'Khối danh sách nằm cuối thẻ Logic, dưới các khối đếm. Bấm ▼ để cuộn khay xuống.'; },
      daLam: function () { return /\.append\(/.test(chuThan('scan')); }
    }
  ].concat(buocThuVeChay('Chương trình chính đã gọi scan(). Bấm Chạy.'));

  /* ============================================================ Chương 33 · Flycam (drone gắn camera nhìn xuống, look()) */
  H['flycam.1'] = [
    buocTaoHam('seek_red', 'Chế hàm seek_red() trong Xưởng: bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:vong:while'], 'Khối while có look(): camera dưới bụng cho biết màu ô bên dưới. Chạm khối này rồi đổi chữ none thành red.', CHU_THE,
      { xuong: true, xong: 'chen-khoi', huong: 'tren', daLam: function () { return soDongThan('seek_red') >= 1; } })
  ].concat(buocThuVeChay('Chương trình chính đã gọi hàm của em. Bấm Chạy.'));

  /* ============================================================ Lắp ráp: Thân + Não · màn Lắp robot (man-lap.js gọi HuongDan.vaoMan khi mở màn Lắp robot của màn đầu chương) */
  H['rap-nao.1'] = [
    { dich: '.lr-khe[data-khe="than"] .lr-hang', chu: 'Đây là khe Thân. Mỗi thẻ là một thân robot, có giá và việc nó làm được.', rong: 170, han: 22000, xong: 'bam' },
    { dich: '.lr-khe[data-khe="than"] .lr-the[data-ma="xich"]', chu: 'Chạm thẻ Bánh xích để gắn nó vào robot.', rong: 160, han: 45000, xong: 'bam',
      daLam: function () { try { return LapRobot.trangThai().cach.than === 'xich'; } catch (e) { return false; } } },
    { dich: '.lr-xu-hang', chu: 'Đây là số xu còn lại. Thẻ nào đắt quá thì nút Lắp xong bị khóa.', rong: 170, han: 20000, xong: 'bam' },
    { dich: 'nut:lap-xong', chu: 'Đủ xu rồi thì bấm Lắp xong để vào màn.', rong: 150, han: 60000, xong: 'bam', huong: 'tren' }
  ];

  /* ============================================================ GÓI T MÙA 2 (29/10, show don't tell, như HD1 / HD2 mùa 1): mỗi chương mùa 2 có màn TRÌNH DIỄN (chiChay:
     chỉ bấm Chạy, bong bóng chỉ nút Chạy rồi chỉ dòng khối mới) và màn KẾ ép dùng khối mới (bong bóng chỉ đúng thao tác mới). Dữ liệu màn: lo-trinh-hoc.js khối "GÓI T MÙA 2". */
  /** Hai bước của màn trình diễn: bấm Chạy, rồi chỉ dòng `dong` (từ 1) nói khối mới làm gì. */
  function trinhDien(chuChay, dong, chuDong) {
    return [
      { khongAn: true, dich: 'nut:chay', chu: chuChay, xong: 'chay' },
      { khongAn: true, dich: 'dong:' + dong, chu: chuDong, xong: 'bam', han: 9000, rong: 170 }
    ];
  }
  // Gói 1: thân xích quay hai nhịp (xich.1 trình diễn, xich.2 đổi số nhịp quay); biến đếm (che-cam-bien.6 trình diễn count_return, che-cam-bien.5 chế bounce: H đã có)
  H['xich.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: một bên xích quay hai nhịp là xe quay phải 90°, rồi đi tới cờ.', 1,
    'left_move() lặp hai lần với wait(): xích quay HAI nhịp mới đủ 90°. Màn sau em tự đổi số nhịp.');
  H['xich.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: xích chỉ quay một nhịp nên mới được nửa góc, xe đâm tường.', xong: 'chay', daLam: daChay },
    buocSoFor(1, 2),
    buocChay('Quay đủ hai nhịp rồi thì bấm Chạy.')
  ];
  // Gói 2: súng hơi (sung-hoi.1 trình diễn, sửa ở trên; sung-hoi.2 H đã có); hàm có tham số (tham-so.1 trình diễn, tham-so.2 đổi số 2 trong range thành n ở thân forward của màn)
  H['tham-so.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: forward(4) đi bốn ô, forward(3) đi ba ô, forward(2) đi hai ô.', 1,
    'Số trong ngoặc là tham số n: cùng một hàm forward(n), mỗi lần gọi một số khác. Màn sau em sửa thân hàm.');
  H['tham-so.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: n bằng 3 hay 5 thì xe cũng chỉ đi hai ô, vì thân hàm lặp cứng range(2).', xong: 'chay', daLam: daChay },
    { dich: '[data-sua="forward"]', chu: 'Chạm bút chì cạnh forward(n) để mở thân hàm trong Xưởng.', xong: 'mo-xuong', han: 0, rong: 170, daLam: xuongMo },
    { xuong: true, phu: true, huong: 'tren', rong: 180, han: 0,
      dich: function () { return thay('nut:chon-bien') ? 'nut:chon-bien' : xuongMo() ? 'so:1' : []; },
      chu: function () { return thay('nut:chon-bien') ? 'Chọn n: số lần lặp lấy từ đối số của hàm.' : 'Chạm số 2 trong range để đổi nó thành n.'; },
      daLam: function () { return /range\(\s*n\s*\)/.test(chuThan('forward')); } }
  ].concat(buocThuVeChay('forward(n) lặp đúng n lần rồi. Bấm Chạy.'));
  // Gói 3: mắt hồng ngoại distance() (hong-ngoai.1 trình diễn, hong-ngoai.2 đặt distance() vào range, che-hong-ngoai.1 chế go_to_wall với while distance() > 0)
  H['hong-ngoai.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: ở đầu mỗi đoạn, tia đỏ đo số ô trống rồi xe đi đúng chừng ấy ô.', 2,
    'd = distance() đọc số ô trống phía trước vào d; range(d) lặp đúng d lần. Màn sau em tự đặt số đo vào range.');
  H['hong-ngoai.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: mỗi đoạn đi cứng ba ô, mà đoạn đầu dài năm ô nên xe rẽ sớm.', xong: 'chay', daLam: daChay },
    { phu: true, huong: 'tren', rong: 180, han: 0,
      dich: function () { return thay('nut:chon-so') ? 'nut:chon-so' : 'so:2'; },
      chu: function () { return thay('nut:chon-so') ? 'Chọn distance(): số ô đo được ngay lúc bắt đầu vòng lặp.' : 'Chạm số 3 trong range để thay nó bằng distance().'; },
      daLam: function () { return dongCo(/range\(\s*distance\(\)\s*\)/) >= 0; } },
    buocChay('Bấm Chạy: bốn đoạn dài ngắn khác nhau, cùng một vòng lặp.')
  ];
  H['che-hong-ngoai.1'] = [
    { dich: 'dong:1', chu: 'Main đã khoá: nó gọi go_to_wall() ba lần, mà em chưa chế hàm đó.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('go_to_wall', 'Bấm Hàm mới để chế go_to_wall().', CHU_TAO),
    khoiTheo(['khoi:vong:while'], 'Chạm khối while distance() > 0: lặp chừng nào phía trước còn ô trống.', CHU_THE_LOGIC,
      { xuong: true, daLam: function () { return /while/.test(chuThan('go_to_wall')); } }),
    khoiTheo(['khoi:em:move'], 'Rồi chạm move(): nó tự thụt vào, nằm trong while.', CHU_THE_XE,
      { xuong: true, xong: 'dong-xuong', daLam: function () { var c = chuThan('go_to_wall'); return /while/.test(c) && /move/.test(c); } })
  ].concat(buocThuVeChay('Ba đoạn dài ngắn khác nhau, cùng một go_to_wall(). Bấm Chạy.'));
  // Gói 4: băng chuyền (bang-chuyen.1 trình diễn, bang-chuyen.2 đi ngược băng; che-sung-hoi.1 H đã có)
  H['bang-chuyen.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: bốn nhịp đứng yên mà băng vẫn đưa xe đi hai ô, rồi ba bước tới cờ.', 2,
    'wait() trên băng: xe không bước mà vẫn trôi một ô mỗi hai nhịp. Màn sau băng chạy ngược chiều xe.');
  H['bang-chuyen.2'] = [
    khoiTheo(['khoi:vong:for'], 'Băng kéo xe lùi một ô mỗi hai nhịp. Chạm khối for, rồi move() vào trong.', CHU_THE_LOGIC,
      { daLam: function () { return dongCo(/^\s*for\b/) >= 0 && dongCo(/^\s+move\(\)/) >= 0; } }),
    buocChay('Chạy thử xem xe tới đâu, rồi đổi số lần lặp cho đủ.')
  ];
  // Gói 5: xích đẩy thùng nặng (day-thung.1 trình diễn, day-thung.2 đổi số lần lặp, che-day-thung.1 chế push(n))
  H['day-thung.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: xích tiến vào thùng nặng thì thùng trượt đi một ô.', 1,
    'move() của xích đẩy được thùng nặng: mỗi bước tiến, thùng dời một ô. Màn sau em tự đẩy cả đoạn đường.');
  H['day-thung.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: lặp ba lần thì thùng mới đi nửa đường.', xong: 'chay', daLam: daChay },
    buocDoiSo(1, 'Thùng còn cách đích mấy ô thì lặp thêm bấy nhiêu: chạm số trong range.', 'Chọn số lần lặp mới.',
      function () { var i = dongFor(1); return i >= 0 && !/range\(\s*3\s*\)/.test(dsChinh()[i]); }),
    buocChay('Bấm Chạy.')
  ];
  H['che-day-thung.1'] = [
    { dich: 'dong:1', chu: 'Main đã khoá: nó gọi push(1), push(2), push(1), mà em chưa chế push(n).', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('push', 'Bấm Hàm mới để chế push(n) với tham số n.', CHU_TAO),
    buocThanHam('push', ['.p-pal .pal'], 'Ghép thân hàm: forward với số là distance() + n: tới sát thùng rồi đẩy thêm n ô.', 1, 'tren')
  ].concat(buocThuVeChay('Ba thùng xa gần khác nhau, cùng một push(n). Bấm Chạy.'));
  // Gói 6: chọn lực bắn (luc-ban.1 trình diễn bắn nhanh, luc-ban.2 đổi "fast" thành "charge", che-luc-ban.1 chế aim_fire())
  H['luc-ban.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: shoot("fast") bắn nhanh, nước bay hai ô trúng van, xe đứng yên nên thùng không bị xô.', 1,
    'Chữ trong ngoặc là lực: "fast" bắn nhanh không giật, "charge" bắn tụ bay xa. Màn sau em tự chọn lực.');
  H['luc-ban.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: bắn nhanh chỉ bay hai ô, van cách ba ô nên tia nước rơi giữa đường.', xong: 'chay', daLam: daChay },
    { phu: true, huong: 'tren', rong: 180, han: 0,
      dich: function () { return thay('nut:chon-chuoi') ? 'nut:chon-chuoi' : 'so:1'; },
      chu: function () { return thay('nut:chon-chuoi') ? 'Chọn "charge": bắn tụ bay xa tới van.' : 'Chạm chữ "fast" trên dòng shoot để đổi lực.'; },
      daLam: function () { return dongCo(/"charge"/) >= 0; } },
    buocChay('Cửa mở rồi thì rẽ trái, đi hai ô tới cờ. Bấm Chạy.')
  ];
  H['che-luc-ban.1'] = [
    { dich: 'dong:1', chu: 'Main đã khoá: nó gọi aim_fire() hai lần, mà em chưa chế hàm đó.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('aim_fire', 'Bấm Hàm mới để chế aim_fire().', CHU_TAO),
    buocThanHam('aim_fire', ['.p-pal .pal'], 'Ghép: if distance() > 1 thì fire("charge"), else thì fire("fast").', 1, 'tren')
  ].concat(buocThuVeChay('Một van xa, một van gần: cùng một aim_fire(). Bấm Chạy.'));
  // Gói 7: đo nhiệt warm() (do-nhiet.1 trình diễn, do-nhiet.2 quay tới khi warm(), che-do-nhiet.1 chế switch_on())
  H['do-nhiet.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: ở mỗi khúc quanh xe hỏi warm(), van chưa nóng thì bắn nhanh cho mở.', 2,
    'warm() là True khi van trước mũi đang nóng (quầng đỏ): if not warm() chỉ bắn van còn đóng. Màn sau em tự dùng warm().');
  H['do-nhiet.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: mỗi ngã chỉ quay phải một lần nên xe đi nhầm hướng.', xong: 'chay', daLam: daChay },
    khoiTheo(['khoi:vong:while'], 'Chạm khối while not warm(): quay phải cho tới khi thấy van nóng ở cuối đường.', CHU_THE_LOGIC,
      { daLam: function () { return dongCo(/^\s*while\s+not\s+warm\(\)/) >= 0; } }),
    khoiTheo(['khoi:em:turn_right'], 'Rồi chạm turn_right(): nó tự thụt vào, nằm trong while.', CHU_THE_XE,
      { daLam: function () { var w = dongCo(/^\s*while\s+not\s+warm\(\)/); return w >= 0 && /^\s+turn_right\(\)/.test(String(dsChinh()[w + 1] || '')); } }),
    buocChay('Bấm Chạy: bốn ngã, xe tự tìm hướng có đèn nóng.')
  ];
  H['che-do-nhiet.1'] = [
    { dich: 'dong:1', chu: 'Main đã khoá: nó gọi switch_on() ở mỗi van, mà em chưa chế hàm đó.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('switch_on', 'Bấm Hàm mới để chế switch_on().', CHU_TAO),
    buocThanHam('switch_on', ['.p-pal .pal'], 'Ghép: if not warm() thì fire("fast"): chỉ mở van còn đóng.', 1, 'tren')
  ].concat(buocThuVeChay('Bốn van, cùng một switch_on(). Bấm Chạy.'));
  // Gói 9: bệ súng xích không giật (be-sung.1 trình diễn, be-sung.2 bỏ dòng back() bù giật thừa, che-be-sung.1 chế blast_left())
  H['be-sung.1'] = trinhDien('Chương trình đã khoá. Bấm Chạy: bắn tụ xong xe vẫn đứng nguyên ô, không cần move() bù giật.', 1,
    'Bệ vòi xích bắn tụ không giật: sau shoot() và wait() là rẽ phải ngay. Màn sau em bỏ dòng bù giật thừa của Sola.');
  H['be-sung.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: xe không giật mà vẫn back() nên lệch khỏi cửa.', xong: 'chay', daLam: daChay },
    { dich: 'dong:3', chu: 'Chạm dòng back() để chọn, rồi bấm ô số có dấu xóa để bỏ nó.', xong: 'xoa-dong', han: 0, rong: 170,
      daLam: function () { return dongCo(/^\s*back\(\)/) < 0; } },
    buocChay('Bấm Chạy.')
  ];
  H['che-be-sung.1'] = [
    { dich: 'dong:2', chu: 'Main đã khoá: trong vòng lặp nó gọi blast_left(), mà em chưa chế hàm đó.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('blast_left', 'Bấm Hàm mới để chế blast_left().', CHU_TAO),
    buocThanHam('blast_left', ['.p-pal .pal'], 'Ghép: tr_left(), fire("charge"), tr_right(): quay trái bắn tụ rồi quay về.', 1, 'tren')
  ].concat(buocThuVeChay('Hai van bên trái, cùng một blast_left(). Bấm Chạy.'));
  // Gói 8 (đội, hai chương trình khoá; màn trình diễn đội chờ HD3 mở rộng khoá cho maMau.doi): doi-mua-2.1 viết thân clear_shot() của màn (bút chì mở Xưởng), che-doi-mua-2.1 chế wait_clear()
  H['doi-mua-2.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: clear_shot() còn trống nên R2 bắn ngay, tia nước trúng R1 đang đứng trong giếng.', xong: 'chay', daLam: daChay },
    { dich: '[data-sua="clear_shot"]', chu: 'Chạm bút chì cạnh clear_shot() để viết thân hàm trong Xưởng.', xong: 'mo-xuong', han: 0, rong: 170, daLam: xuongMo },
    khoiTheo(['khoi:vong:while'], 'Chạm khối while warm(): còn thấy bạn nóng trước mũi thì lặp.', CHU_THE_LOGIC,
      { xuong: true, daLam: function () { return /while/.test(chuThan('clear_shot')); } }),
    khoiTheo(['khoi:wait', 'khoi:goc:wait'], 'Rồi chạm wait(): mỗi lượt chờ một nhịp.', CHU_THE,
      { xuong: true, xong: 'dong-xuong', daLam: function () { var c = chuThan('clear_shot'); return /while/.test(c) && /wait/.test(c); } })
  ].concat(buocThuVeChay('R2 chờ R1 đi khỏi giếng rồi mới bắn. Bấm Chạy.'));
  H['che-doi-mua-2.1'] = [
    buocTaoHam('wait_clear', 'Chế hàm wait_clear() trong Xưởng: bấm Hàm mới.', CHU_TAO),
    buocThanHam('wait_clear', ['.p-pal .pal'], 'Ghép: while warm() rồi wait() ở trong: còn thấy đồng đội trước mũi thì chờ.', 2, 'tren')
  ].concat(buocThuVeChay('Hai chương trình đã gọi wait_clear(). Bấm Chạy.'));
  H['che-cam-bien.6'] = trinhDien('Chương trình đã khoá. Bấm Chạy: xe đi tới tường, mỗi bước n tăng một, rồi lùi đúng n bước về xe mờ.', 1,
    'count_return() dùng biến n: n = 0 lúc đầu, n = n + 1 mỗi bước, for i in range(n) lùi n lần. Mở Xưởng để xem.');

  /* ============================================================ MÙA 3 gói 1 (29/10, phiên Mùa 3): thân nhện (nhen.11 trình diễn, step_down / stairs), chuỗi cho nhện
     (chuoi-nhen.1 trình diễn, .2 sửa chuỗi, .3 thêm nhánh vào hàm của màn, .6 tạo trail). Màn trình diễn chỉ MỘT bước (nút Chạy): thắng thì chuỗi hướng dẫn dừng,
     bước thứ hai chỉ kịp loé (báo cáo HD3 đề xuất 3a). */
  function trinhDien1(chu) { return [{ khongAn: true, dich: 'nut:chay', chu: chu, xong: 'chay' }]; }
  H['nhen.11'] = trinhDien1('Chương trình đã khoá. Bấm Chạy: nhện đi phải, xuống, trái, lên mà thân không xoay. Màn sau em tự viết.');
  H['nhen.13'] = [
    { dich: 'dong:2', chu: 'Dòng này gọi step_down(), mà em chưa có hàm đó. Tạo nó trong Xưởng.', xong: 'bam', han: 8000, rong: 160 },
    buocTaoHam('step_down', 'Bấm Hàm mới để tạo step_down().', CHU_TAO),
    khoiTheo(['khoi:go_right', 'khoi:goc:go_right'], 'Một bậc: chạm go_right() trước.', CHU_THE, { xuong: true, daLam: function () { return /go_right/.test(chuThan('step_down')); } }),
    khoiTheo(['khoi:go_down', 'khoi:goc:go_down'], 'Rồi chạm go_down().', CHU_THE,
      { xuong: true, daLam: function () { var c = chuThan('step_down'); return /go_right[\s\S]*go_down/.test(c); } })
  ].concat(buocThuVeChay('Chương trình gọi step_down() bốn lần. Bấm Chạy.'));
  H['nhen.14'] = [
    { dich: 'dong:1', chu: 'stairs(3) leo 3 bậc, stairs(2) leo 2 bậc: số trong ngoặc là đối số n. Tạo hàm stairs có đối số n.', xong: 'bam', han: 9000, rong: 170 },
    buocTaoHam('stairs', 'Bấm Hàm mới, đặt tên stairs và thêm đối số n.', CHU_TAO)
  ].concat(buocThuVeChay('Trong hàm dùng for i in range(n). Bấm Chạy.'));
  H['chuoi-nhen.1'] = trinhDien1('Chương trình đã khoá. Bấm Chạy: mỗi chữ của chuỗi "RRDRD" là một bước, R sang phải, D xuống.');
  H['chuoi-nhen.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: chuỗi "RR" mới đi hai bước.', xong: 'chay', daLam: daChay },
    { dich: 'so:1', chu: 'Chạm vào chuỗi "RR" để thêm chữ R hoặc D cho đủ đường.', xong: 'bam', han: 12000, rong: 170 }
  ];
  H['chuoi-nhen.3'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: tới chữ L thì nhện đứng im, vì step_to chưa biết chữ L.', xong: 'chay', daLam: daChay },
    { dich: '[data-sua="step_to"]', chu: 'Chạm bút chì cạnh step_to để mở thân hàm trong Xưởng.', xong: 'mo-xuong', han: 0, rong: 170, daLam: xuongMo }
  ].concat(buocThuVeChay('Thêm nhánh elif d == "L": go_left() rồi bấm Chạy.'));
  H['chuoi-nhen.6'] = [
    buocTaoHam('trail', 'Bấm Hàm mới, đặt tên trail và thêm đối số path.', CHU_TAO)
  ].concat(buocThuVeChay('Thân hàm: for c in path: rồi go(c). Bấm Chạy.'));

  // MÙA 3 gói 2: nam châm cực N (nam-cham.11 trình diễn), and / or (logic-nam-cham.1 trình diễn, .2 ghép and, .4 ghép or, .7 tạo to_turn)
  H['nam-cham.11'] = trinhDien1('Chương trình đã khoá. Bấm Chạy: magnet_n() hút vật sắt về mũi xe, magnet_off() thả nó xuống ô đích.');
  H['logic-nam-cham.1'] = trinhDien1('Chương trình đã khoá. Bấm Chạy: xe đi khi trước mặt trống VÀ bên phải chưa có lối, nên dừng đúng chỗ rẽ.');
  function buocGhep(nx, chuVe, chuNut, daLam) {
    return [
      { dich: '.num.dkm.cam', chu: chuVe, xong: 'bam', han: 0, rong: 170, daLam: function () { return thay('nut:chon-ghep') || daLam(); } },
      { phu: true, dich: '[data-ghep="' + nx + '"]', chu: chuNut, xong: 'bam', han: 0, rong: 170, daLam: daLam }
    ];
  }
  H['logic-nam-cham.2'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: sân 1 xe đi quá chỗ rẽ vì chỉ hỏi front_clear().', xong: 'chay', daLam: daChay }
  ].concat(buocGhep('and', 'Chạm front_clear() trên dòng while.', 'Chạm + and để ghép thêm một vế.', function () { return dongCo(/^\s*while .+ and /) >= 0; }),
    [{ dich: function () { var c = document.querySelectorAll('.num.dkm.cam'); return c.length > 1 ? [c[1]] : []; }, chu: 'Chạm vế thứ hai, chọn not right_clear().', xong: 'bam', han: 0, rong: 170,
      daLam: function () { return dongCo(/^\s*while front_clear\(\) and not right_clear\(\):/) >= 0; } },
    buocChay('Xe đi khi trước mặt trống và bên phải chưa có lối. Bấm Chạy.')]);
  H['logic-nam-cham.4'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: tới góc đầu tiên trước mặt là tường nên xe dừng.', xong: 'chay', daLam: daChay }
  ].concat(buocGhep('or', 'Chạm front_clear() trên dòng while.', 'Chạm + or: chỉ cần một vế đúng là đi tiếp.', function () { return dongCo(/^\s*while .+ or /) >= 0; }),
    [{ dich: function () { var c = document.querySelectorAll('.num.dkm.cam'); return c.length > 1 ? [c[1]] : []; }, chu: 'Chạm vế thứ hai, chọn right_clear().', xong: 'bam', han: 0, rong: 170,
      daLam: function () { return dongCo(/^\s*while front_clear\(\) or right_clear\(\):/) >= 0; } },
    buocChay('Bấm Chạy.')]);
  H['logic-nam-cham.7'] = [
    buocTaoHam('to_turn', 'Bấm Hàm mới để tạo to_turn().', CHU_TAO)
  ].concat(buocThuVeChay('Thân hàm: while front_clear() and not right_clear(): rồi move(). Bấm Chạy.'));

  window.HuongDanMan = H;
  window.HuongDanManPhienBan = { 'xuong-ham.3': 2, 'che-xe.4': 2, 'tay-gap.1': 2, 'tay-gap.5': 2, 'vong-lap.1': 2, 'vong-lap.3': 2, 'khoang-cach.1': 2, 'khoang-cach.2': 2, 'tay-xoay.1': 2, 'hai-robot.1': 2,
    'sung-hoi.1': 2 };       // gói T mùa 2: màn trình diễn
})();
