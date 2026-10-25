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
  H['vong-lap.1'] = [
    buocDoiSo(1, 'Số trong range() là số lần lặp. Chạm số này để đổi.', 'Chọn số lần xe cần đi tới cờ.', daDoiSoLap),
    buocChay('Bấm Chạy.')
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

  /* ============================================================ Chương 8 · Cảm biến khoảng cách */
  H['khoang-cach.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: xe hỏi cảm biến front_clear() rồi mới tiến một ô.', xong: 'chay', daLam: daChay },
    khoiTheo(['khoi:vong:for'], 'if chỉ hỏi cảm biến một lần. Bọc nó trong vòng for để hỏi nhiều lần: chạm khối for.', 'Khối for nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*for\b/) >= 0; } }),
    buocThutVao(/^\s*if\s/, 1, 'if đang đứng ngoài vòng for. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: if phải nằm trong vòng for.'),
    buocThutVao(/^\s*move\(\)/, 2, 'move() phải nằm trong if. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: move() chỉ chạy khi if đúng.'),
    buocDoiSo(1, 'Chạm số này để đổi số lần xe hỏi cảm biến.', 'Chọn số lần hỏi, bằng số ô xe cần đi.', daDoiSoLap),
    buocChay('Bấm Chạy.')
  ];
  H['khoang-cach.2'] = [
    { dich: 'nut:xoa-het', chu: 'Bài này cần while thay cho if. Bấm thùng rác để xóa chương trình cũ.', huong: 'duoi', rong: 160, han: 20000,
      daLam: function () { return hopMo() || soDongChinh() === 0 || dongCo(/^\s*while\b/) >= 0; } },                      // bấm thùng rác thì hộp hỏi lại mở: bước qua (kiểm theo nhịp đồng hồ, không đợi cú bấm)
    { phu: true, dich: 'nut:co', chu: 'Bấm Xóa hết để dọn sạch.', huong: 'duoi', rong: 150, daLam: function () { return !hopMo(); } },
    khoiTheo(['khoi:vong:while'], 'while hỏi cảm biến lại sau mỗi bước, if chỉ hỏi một lần. Chạm khối while.', 'Khối while nằm ở thẻ Logic. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*while\s+front_clear\(\)/) >= 0; } }),
    khoiTheo(['khoi:em:move'], 'Rồi chạm move(): dòng mới tự thụt vào, nằm trong while.', 'move() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để quay lại thẻ đó.',
      { daLam: function () { var w = dongCo(/^\s*while\s+front_clear\(\)/); return w >= 0 && /^\s+move\(\)/.test(String(dsChinh()[w + 1] || '')); } }),
    buocChay('Bấm Chạy.')
  ];
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
  H['hai-robot.1'] = [
    { khongAn: true, dich: 'nut:xe-2', chu: 'Mỗi robot một chương trình. R1 đã có sẵn: chạm R2 để viết cho R2.', huong: 'duoi', rong: 170, xong: 'doi-xe',
      daLam: function () { return xeDangChon() === 1; } },
    khoiTheo(['khoi:em:go_wall'], 'Chạm go_wall(): R2 cũng đi tới cờ như R1.', 'go_wall() nằm ở thẻ Cảm biến. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return xeDangChon() === 1 && dongCo(/^\s*go_wall\(\)/) >= 0; } }),
    buocChay('Bấm Chạy: hai robot chạy cùng lúc.')
  ];

  /* ============================================================ Chương 9 · Chế lệnh có if, while (biến đếm) */
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

  /* ============================================================ Chương 21 · Tay xoay (làm quen): lệnh gốc mới arm_left / arm_right, thẻ Tay xoay */
  H['tay-xoay.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: tay xoay sang trái rồi nhặt vật ở bên hông xe.', xong: 'chay', daLam: daChay },
    khoiTheo(['khoi:arm_up', 'khoi:arm_right'], 'Nâng tay (arm_up), rồi xoay sang phải (arm_right) để đưa vật về phía trước.', 'Khối của tay nằm ở thẻ Tay xoay. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*arm_right\(\)/) >= 0; } }),
    khoiTheo(['khoi:arm_down', 'khoi:release'], 'Hạ tay (arm_down), rồi mở kẹp (release) để đặt vật xuống ô đích.', 'Khối của tay nằm ở thẻ Tay xoay. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*release\(\)/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  H['tay-xoay.6'] = [
    buocTaoHam('clear_left', 'Gói việc dọn vật thành hàm clear_left(): bấm Hàm mới.', CHU_TAO),
    buocThanHam('clear_left', ['.p-pal .pal'], 'Ghép các khối thành thân hàm: nhặt vật, đặt sang trái rồi xoay tay về.', 1, 'tren')
  ].concat(buocThuVeChay('Chương trình gọi được clear_left() rồi. Bấm Chạy.'));

  /* ============================================================ Chương 19 · Súng hơi (làm quen): shoot() bắn ra trước + giật lùi, shoot_back() bắn ra sau + giật tới */
  var CHU_THE_SUNG = 'Khối của súng nằm ở thẻ Súng hơi. Bấm ◀ hoặc ▶ để sang thẻ đó.';
  H['sung-hoi.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: bắn một phát ra trước thì xe bị giật lùi một ô.', xong: 'chay', daLam: daChay },
    khoiTheo(['khoi:shoot'], 'Cờ còn cách ba ô. Chạm shoot() để bắn thêm, nhớ wait() sau mỗi phát.', CHU_THE_SUNG,
      { daLam: function () { return soDongChinh() >= 6 || dongCo(/^\s*for\b/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  H['sung-hoi.2'] = [
    khoiTheo(['khoi:shoot_back'], 'Lệnh mới shoot_back() bắn ra sau, xe giật tới. Chạm nó rồi chạm wait().', CHU_THE_SUNG,
      { daLam: function () { return dongCo(/^\s*shoot_back\(\)/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  H['sung-hoi.3'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: bóng bay ra sau trúng nút, cửa mở, xe được giật tới một ô.', xong: 'chay', daLam: daChay },
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

  window.HuongDanMan = H;
  window.HuongDanManPhienBan = { 'xuong-ham.3': 2, 'che-xe.4': 2, 'tay-gap.1': 2, 'tay-gap.5': 2, 'vong-lap.3': 2 };
})();
