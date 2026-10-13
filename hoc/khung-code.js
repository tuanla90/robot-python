/* ============================================================================
   khung-code.js — "Đường học": KHUNG CODE SỐ Ô CỐ ĐỊNH (window.KhungCode).

   Bài làm của học sinh: { chinh: [chuỗi dòng], ham: [chuỗi dòng] }.
   Mỗi dòng là một ô; dòng trống không tính ô.
   Khung của màn: { chinh: 8, ham: 0..8, khoaChinh: k, khoaHam: k }
     - ham = 0: chưa mở cột HÀM.
     - khoa*: số ô bị khóa ở cuối cột → số ô dùng được = số ô − số ô khóa.
   Hàm đã vào THƯ VIỆN thì không chiếm ô.

   Ghép thành Python thật theo thứ tự: THƯ VIỆN → cột HÀM → cột CHÍNH, kèm bảng
   ánh xạ từ số dòng Python sang { cot: 'chinh'|'ham'|'thuvien', dong }.
   `dong` của cột chinh/ham là số thứ tự ô (từ 1) trong mảng bài làm, kể cả ô trống,
   nên khớp đúng vị trí học sinh nhìn thấy trên khung.

   Chạy được trong Node (module.exports) và trình duyệt (window.KhungCode).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var TEN_COT = { chinh: 'CHÍNH', ham: 'HÀM' };

  function laTrong(s) { return s === undefined || s === null || String(s).trim() === ''; }
  function lay(baiLam, cot) { return (baiLam && baiLam[cot]) ? baiLam[cot] : []; }
  function soDong(ds) { var n = 0; (ds || []).forEach(function (s) { if (!laTrong(s)) n++; }); return n; }
  function laDef(s) { return /^\s*def\b/.test(String(s)); }
  function thutLe(s) { return /^\s/.test(String(s)); }

  /** Số ô dùng được của từng cột. */
  function soODung(khung) {
    var ham = khung.ham || 0;
    return {
      chinh: Math.max(0, (khung.chinh || 0) - (khung.khoaChinh || 0)),
      ham: ham > 0 ? Math.max(0, ham - (khung.khoaHam || 0)) : 0
    };
  }

  /** Số ô bài làm đang dùng (cột HÀM + cột CHÍNH; thư viện không tính). */
  function soO(baiLam) { return soDong(lay(baiLam, 'chinh')) + soDong(lay(baiLam, 'ham')); }

  function dongDau(ds, loc) {
    var kq = [];
    ds.forEach(function (s, i) { if (!laTrong(s) && loc(s)) kq.push(i + 1); });
    return kq;
  }

  /** Kiểm hợp lệ theo khung. Trả về mảng { ma, loi, cot, dong? }; rỗng = hợp lệ. */
  function kiemTra(khung, baiLam) {
    var loi = [], dung = soODung(khung), chinh = lay(baiLam, 'chinh'), ham = lay(baiLam, 'ham');
    var mo = (khung.ham || 0) > 0;

    // 1. tràn khung
    [['chinh', chinh], ['ham', ham]].forEach(function (c) {
      var cot = c[0], dsDong = c[1];
      if (cot === 'ham' && !mo) return;               // cột chưa mở: xét ở mục chua-mo-cot-ham
      var can = soDong(dsDong), co = dung[cot], tong = cot === 'chinh' ? khung.chinh : khung.ham;
      if (can > co) {
        var khoa = cot === 'chinh' ? (khung.khoaChinh || 0) : (khung.khoaHam || 0);
        var s = 'Cột ' + TEN_COT[cot] + ' có ' + can + ' dòng nhưng chỉ có ' + co + ' ô dùng được' +
          (khoa ? ' (' + tong + ' ô, ' + khoa + ' ô đang khóa)' : '') + ' — thừa ' + (can - co) + ' dòng.';
        if (cot === 'chinh' && mo) s += ' Trong đoạn code có chỗ nào lặp lại không? Gói nó lại để gọi cho gọn.';
        else s += ' Tìm cách viết ngắn hơn.';
        loi.push({ ma: 'tran-khung', loi: s, cot: cot, can: can, co: co });
      }
    });

    // 2. def ở cột chính
    var dChinh = dongDau(chinh, laDef);
    if (dChinh.length) {
      loi.push({
        ma: 'def-o-cot-chinh', cot: 'chinh', dong: dChinh[0],
        loi: 'Dòng ' + dChinh[0] + ' ở cột CHÍNH đang định nghĩa hàm (def). ' +
          (mo ? 'Cột CHÍNH chỉ chứa các lệnh chạy; khối def thuộc cột HÀM.' : 'Màn này chưa có cột HÀM nên chưa tự viết hàm được.')
      });
    }

    // 3. cột HÀM chưa mở mà có dòng
    if (!mo && soDong(ham) > 0) {
      loi.push({
        ma: 'chua-mo-cot-ham', cot: 'ham', dong: dongDau(ham, function () { return true; })[0],
        loi: 'Màn này chưa mở cột HÀM, nhưng cột HÀM đang có ' + soDong(ham) + ' dòng. Đưa các lệnh về cột CHÍNH.'
      });
    }

    // 4. lệnh lẻ ở cột HÀM
    if (mo) {
      var le = dongDau(ham, function (s) { return !thutLe(s) && !laDef(s) && !/^\s*#/.test(s); });
      if (le.length) {
        loi.push({
          ma: 'lenh-le-o-cot-ham', cot: 'ham', dong: le[0],
          loi: 'Dòng ' + le[0] + ' ở cột HÀM là lệnh lẻ, không nằm trong hàm nào. ' +
            'Cột HÀM chỉ chứa các khối def (thân hàm phải thụt vào); lệnh chạy để cột CHÍNH.'
        });
      }
    }
    return loi;
  }

  /** Tách mã của một hàm thư viện thành mảng dòng (bỏ dòng trống cuối). */
  function tachDong(ma) {
    var ds = String(ma).replace(/\r\n?/g, '\n').split('\n');
    while (ds.length && laTrong(ds[ds.length - 1])) ds.pop();
    return ds;
  }

  /**
   * Ghép bài làm + thư viện thành Python thật.
   * dsThuVien: [{ ten, ma }] — các hàm thư viện đã có (không tính ô).
   * Trả về { ma, dong: [chuỗi], anhXa } với anhXa[số dòng Python (từ 1)] =
   *   { cot: 'thuvien', dong, ten } | { cot: 'ham'|'chinh', dong }.
   */
  function ghep(baiLam, dsThuVien) {
    var dong = [], anhXa = [null];
    (dsThuVien || []).forEach(function (h) {
      tachDong(h.ma).forEach(function (s, i) {
        dong.push(s); anhXa.push({ cot: 'thuvien', dong: i + 1, ten: h.ten });
      });
    });
    ['ham', 'chinh'].forEach(function (cot) {
      lay(baiLam, cot).forEach(function (s, i) {
        dong.push(String(s === undefined || s === null ? '' : s)); anhXa.push({ cot: cot, dong: i + 1 });
      });
    });
    return { ma: dong.join('\n'), dong: dong, anhXa: anhXa };
  }

  /** Tên các hàm thư viện (trong `tenThuVien`) mà bài làm có gọi. */
  function thuVienDung(baiLam, tenThuVien) {
    var chuoi = lay(baiLam, 'ham').concat(lay(baiLam, 'chinh')).join('\n');
    return (tenThuVien || []).filter(function (t) {
      return new RegExp('(^|[^A-Za-z0-9_])' + t + '\\s*\\(').test(chuoi) &&
        !new RegExp('def\\s+' + t + '\\s*\\(').test(chuoi);     // tự viết lại thì không còn là thư viện
    });
  }

  /** Xuất tệp .py đọc được: cột HÀM + cột CHÍNH, kèm một dòng chú thích về thư viện. */
  function xuatPy(baiLam, tenThuVien) {
    var dung = thuVienDung(baiLam, tenThuVien);
    var ghiChu = dung.length
      ? '# Dùng hàm thư viện của game: ' + dung.join(', ') + ' (chưa có trong tệp này)'
      : '# Không dùng hàm thư viện nào của game';
    var ham = lay(baiLam, 'ham').filter(function (s) { return !laTrong(s); });
    var chinh = lay(baiLam, 'chinh').filter(function (s) { return !laTrong(s); });
    var phan = [ghiChu];
    if (ham.length) phan.push('', ham.join('\n'));
    if (chinh.length) phan.push('', chinh.join('\n'));
    return phan.join('\n') + '\n';
  }

  var API = {
    laTrong: laTrong, soDong: soDong, soO: soO, soODung: soODung,
    kiemTra: kiemTra, ghep: ghep, thuVienDung: thuVienDung, xuatPy: xuatPy
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.KhungCode = API;
})();
