/* ============================================================================
   huong-dan-man.js — "Đường học": HƯỚNG DẪN TỪNG BƯỚC CHO TỪNG MÀN (window.HuongDanMan).

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
    var b = {
      dich: function () {
        if (o.xuong && !xuongMo()) return [];
        var k = ds.filter(thay);
        if (k.length) return k;
        return daCoHuongDanThe() ? [] : ['nut:pal-the-sau', 'nut:pal-the-truoc'];
      },
      chu: function () { return ds.some(thay) ? chuKhoi : chuThe; },
      rong: 170, han: 45000
    };
    if (o.xuong) b.xuong = true;
    return gop(b, { huong: o.huong, rong: o.rong || 170, han: o.han || 45000, daLam: o.daLam, xong: o.xong });
  }
  var CHU_THE = 'Khối này nằm ở thẻ khác của khay. Bấm ◀ hoặc ▶ để sang thẻ đó.';
  /** Con số chạm được của dòng (từ 1) / bảng chọn 1–9 đang mở: một bước đổi số. phu: bảng chọn nổi lên trên khay. */
  function buocDoiSo(dong, chuSo, chuBang, daLam) {
    return {
      phu: true, huong: 'tren',
      dich: function () { return thay('nut:chon-so') ? 'nut:chon-so' : 'so:' + dong; },
      chu: function () { return thay('nut:chon-so') ? chuBang : chuSo; },
      xong: 'doi-so', daLam: daLam, rong: 160, han: 60000
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
      xuong: true, dich: trongXuong(dich), chu: chu, huong: huong, rong: 170, han: 45000,
      xong: function (su) { return su === 'dong-xuong' || (su === 'chen-khoi' && soDongThan(ten) >= n); },
      daLam: function () { return soDongThan(ten) >= n; }
    };
  }
  /** Ba bước sau khi đã có thân hàm: Thử (trong Xưởng) → Về sân → Chạy. */
  function buocThuVeChay(chuChay) {
    return [
      { xuong: true, khongAn: true, dich: 'nut:thu', chu: 'Bấm Thử: xe chạy thử hàm này trên sân nhỏ.', xong: ['thu', 'dong-xuong'], daLam: function () { return !xuongMo(); } },
      { xuong: true, khongAn: true, dich: 'nut:ve', chu: 'Hàm chạy đúng rồi thì bấm Về sân.', xong: 'dong-xuong', daLam: function () { return !xuongMo(); } },
      buocChay(chuChay)
    ];
  }
  function buocChay(chu) { return { khongAn: true, dich: 'nut:chay', chu: chu, xong: 'chay' }; }
  /** Bước "chạm khối để chèn" cho tới khi chương trình chính có từ n dòng. */
  function buocChen(dich, chu, n, huong) {
    return {
      dich: dich, chu: chu, rong: 170, han: 40000, huong: huong,
      xong: function (su) { return su === 'chen-khoi' && soDongChinh() >= n; },
      daLam: function () { return soDongChinh() >= n; }
    };
  }
  /** Bước "chạm khối này" cho tới khi chương trình chính có dòng khớp re (không cần sự kiện: xét lại mỗi nhịp đồng hồ). */
  function buocCoDong(dich, chu, re, huong) {
    return { dich: dich, chu: chu, rong: 170, han: 40000, huong: huong, daLam: function () { return dongCo(re) >= 0; } };
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
      rong: 170, han: 45000,
      daLam: function () { var i = dongCo(re); return i < 0 || bac(dsChinh()[i]) >= bacCan; }
    };
  }
  /** Chạm dòng → bấm ✕ đỏ: nút ✕ (ô số dòng đang hiện ✕, hay dòng đang chọn nếu chuột chưa rê qua). */
  function nutX() {
    var t = document.querySelector('#pan-main .rows .row.xc .tab') || document.querySelector('#pan-main .rows .row.xx .tab');
    if (!t) {
      var r = document.querySelector('#pan-main .rows .row.sel');
      t = r && r.querySelector('.strip:not(.empty)') ? r.querySelector('.tab') : null;
    }
    return t || [];
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
  H['hai-banh.9'] = [
    { dich: '#pan-main .rows', chu: 'Dòng nào thừa thì chạm vào dòng đó.', xong: ['chon-dong', 'xoa-dong'], han: 25000, huong: 'tren' },
    { dich: nutX, chu: 'Bấm ✕ đỏ để xóa dòng. Xóa nhầm thì bấm Hoàn tác.', xong: ['xoa-dong', 'hoan-tac'], han: 20000, rong: 160 }
  ];
  H['hai-banh.10'] = [
    { dich: '#pan-main .rows', chu: 'Nhấn giữ một dòng, rồi kéo lên hoặc xuống để đổi chỗ.', xong: 'doi-cho', han: 30000, huong: 'tren', rong: 160 }
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
    buocChay('Đủ lệnh rồi thì bấm Chạy.')
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
      xuong: true, dich: trongXuong(['khoi:left_back', 'khoi:right_back']), rong: 170, han: 45000,
      chu: 'Xe có thêm hai bánh lùi: left_back() và right_back(). Chạm để dùng chúng.',
      daLam: function () { return /_back/.test(chuThan('back')); }
    }
  ];

  /* ============================================================ Chương 4 · Tay gắp */
  H['tay-gap.1'] = [
    buocCoDong('khoi:em:move', 'Cần đi tiếp một ô tới sát ô đích: chạm move().', /^\s*move\(\)/),
    khoiTheo(['khoi:arm_down', 'khoi:release'], 'Thả vật xuống ô đích: hạ tay (arm_down), rồi mở kẹp (release).', 'Khối của tay nằm ở thẻ Tay kẹp. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*release\(\)/) >= 0; } }),
    buocChay('Bấm Chạy.')
  ];
  H['tay-gap.5'] = [
    buocTaoHam('pick', 'Gói việc nhặt vật thành hàm pick(): bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:arm_down', 'khoi:grab', 'khoi:arm_up'], 'Nhặt vật: hạ tay, kẹp, rồi nâng tay lại để xe đi tiếp được.', 'Khối của tay nằm ở thẻ Tay kẹp. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { xuong: true, xong: 'dong-xuong', daLam: function () { return soDongThan('pick') >= 3; } })
  ].concat(buocThuVeChay('Chương trình gọi được pick() rồi. Bấm Chạy.'));

  /* ============================================================ Chương 6 · Vòng lặp */
  H['vong-lap.1'] = [
    buocDoiSo(1, 'Số trong range() là số lần lặp. Chạm số này để đổi.', 'Chọn số lần xe cần đi tới cờ.', daDoiSoLap),
    buocChay('Bấm Chạy.')
  ];
  H['vong-lap.2'] = [
    buocCoDong('khoi:vong:for', 'Chạm khối for: nó lặp lại những dòng thụt vào bên dưới.', /^\s*for\b/),
    khoiTheo(['khoi:em:move'], 'Chạm move(): dòng mới tự thụt vào, nằm trong vòng lặp.', 'move() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để quay lại thẻ đó.',
      { daLam: function () { return dongCo(/^\s*move\(\)/) >= 0; } }),
    buocThutVao(/^\s*move\(\)/, 1, 'move() đang đứng ngoài vòng lặp. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: move() phải nằm trong vòng lặp.'),
    buocDoiSo(1, 'Chạm số 2, chọn số lần lặp bằng số ô xe cần đi.', 'Chọn số lần xe cần đi tới cờ.', daDoiSoLap),
    buocChay('Bấm Chạy.')
  ];
  H['vong-lap.3'] = [
    {
      dich: function () {
        var t = dongCo(/^\s*turn_right\(\)/);
        if (t < 0) return khoiTheo(['khoi:em:turn_right'], '', '').dich();
        return dongChon() === t ? 'nut:thut-ra' : 'dong:' + (t + 1);
      },
      chu: function () {
        var t = dongCo(/^\s*turn_right\(\)/);
        if (t < 0) return thay('khoi:em:turn_right') ? 'Hết đoạn đầu thì xe rẽ phải: chạm turn_right().' : CHU_THE;
        return dongChon() === t ? 'Bấm ⇤ để thụt ra: rẽ phải chỉ một lần, nằm ngoài vòng lặp.' : 'turn_right() đang nằm trong vòng lặp. Chạm vào dòng này.';
      },
      huong: function () { var t = dongCo(/^\s*turn_right\(\)/); return t < 0 ? undefined : (dongChon() === t ? 'tren' : 'duoi'); },
      han: 60000, rong: 170,
      daLam: function () { var t = dongCo(/^turn_right\(\)/); return t >= 0 && dongCo(/^\s*for\b/) >= 0 && dongCo(/^\s+\S/) >= 0 && bac(dsChinh()[t]) === 0; }
    }
  ];
  H['vong-lap.8'] = [
    { dich: '#pan-main .rows', chu: 'Chạm một dòng để chọn nó: hai nút thụt lề sẽ hiện ra.', xong: 'chon-dong', han: 25000, huong: 'tren', rong: 160 },
    { dich: ['nut:thut-ra', 'nut:thut-vao'], huong: 'tren', rong: 170, han: 30000, xong: 'doi-bac',
      chu: '⇥ thụt vào: dòng nằm trong vòng lặp. ⇤ thụt ra: dòng nằm ngoài vòng lặp.' }
  ];

  /* ============================================================ Chương 8 · Cảm biến khoảng cách */
  H['khoang-cach.1'] = [
    { khongAn: true, dich: 'nut:chay', chu: 'Chạy thử: xe hỏi cảm biến front_clear() rồi mới tiến một ô.', xong: 'chay', daLam: daChay },
    buocCoDong('khoi:vong:for', 'if chỉ hỏi cảm biến một lần. Bọc nó trong vòng for để hỏi nhiều lần: chạm khối for.', /^\s*for\b/),
    buocThutVao(/^\s*if\s/, 1, 'if đang đứng ngoài vòng for. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: if phải nằm trong vòng for.'),
    buocThutVao(/^\s*move\(\)/, 2, 'move() phải nằm trong if. Chạm vào dòng này.', 'Bấm ⇥ để thụt vào: move() chỉ chạy khi if đúng.'),
    buocDoiSo(1, 'Chạm số này để đổi số lần xe hỏi cảm biến.', 'Chọn số lần hỏi, bằng số ô xe cần đi.', daDoiSoLap),
    buocChay('Bấm Chạy.')
  ];
  H['khoang-cach.2'] = [
    { dich: 'nut:xoa-het', chu: 'Bài này cần while thay cho if. Bấm thùng rác để xóa chương trình cũ.', huong: 'duoi', rong: 160, han: 20000,
      daLam: function () { return hopMo() || soDongChinh() === 0 || dongCo(/^\s*while\b/) >= 0; } },                      // bấm thùng rác thì hộp hỏi lại mở: bước qua (kiểm theo nhịp đồng hồ, không đợi cú bấm)
    { phu: true, dich: 'nut:co', chu: 'Bấm Xóa hết để dọn sạch.', huong: 'duoi', rong: 150, daLam: function () { return !hopMo(); } },
    khoiTheo(['khoi:vong:while'], 'while hỏi cảm biến lại sau mỗi bước, if chỉ hỏi một lần. Chạm khối while.', 'Khối while nằm ở thẻ Cảm biến. Bấm ◀ hoặc ▶ để sang thẻ đó.',
      { daLam: function () { return dongCo(/^\s*while\s+front_clear\(\)/) >= 0; } }),
    khoiTheo(['khoi:em:move'], 'Rồi chạm move(): dòng mới tự thụt vào, nằm trong while.', 'move() nằm ở thẻ Xe. Bấm ◀ hoặc ▶ để quay lại thẻ đó.',
      { daLam: function () { var w = dongCo(/^\s*while\s+front_clear\(\)/); return w >= 0 && /^\s+move\(\)/.test(String(dsChinh()[w + 1] || '')); } }),
    buocChay('Bấm Chạy.')
  ];
  /* màn nhiều sân đầu tiên (3 sân): dải ảnh nhỏ bên trên nút Chạy; chạm một ảnh để xem sân đó, sau khi Chạy có ✓ / ✗ */
  H['khoang-cach.4'] = [
    { khongAn: true, dich: '.sanbar', chu: 'Màn này có ba sân khác nhau. Chạm ảnh nhỏ để xem từng sân.', xong: ['xem-san', 'chay'], han: 12000, rong: 160, huong: 'duoi' },
    { khongAn: true, dich: 'nut:chay', chu: 'Một chương trình phải đưa xe tới cờ ở cả ba sân. Bấm Chạy.', xong: 'chay', daLam: daChay },
    { khongAn: true, dich: function () { var d = document.querySelector('.sanbar .sanbt .dau.sai'); return d ? d.parentNode : []; }, huong: 'duoi', rong: 160, han: 20000,
      chu: 'Dấu ✗ là sân xe chưa tới cờ. Chạm ảnh đó để xem xe dừng ở đâu.', xong: 'xem-san' }
  ];

  /* ============================================================ Chương 9 · Chế lệnh có if, while (biến đếm) */
  H['che-cam-bien.5'] = [
    buocTaoHam('bounce', 'Chế hàm bounce() trong Xưởng: bấm Hàm mới.', CHU_TAO),
    khoiTheo(['khoi:dem:dem-gan', 'khoi:dem:dem-tang', 'khoi:dem:dem-lap'],
      'Ba khối hồng để đếm: n = 0 lúc đầu, n = n + 1 mỗi ô xe đi thêm, for i in range(n) lặp đúng n lần.', CHU_THE,
      { xuong: true, xong: 'dong-xuong', huong: 'tren', rong: 180, daLam: function () { var t = chuThan('bounce'); return /n = 0/.test(t) && /n = n \+ 1/.test(t) && /range\(n\)/.test(t); } })
  ].concat(buocThuVeChay('Chương trình chính đã gọi bounce(). Bấm Chạy.'));

  window.HuongDanMan = H;
})();
