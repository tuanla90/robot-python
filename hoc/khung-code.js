/* ============================================================================
   khung-code.js — "Đường học": KHUNG CODE, MỖI HÀM MỘT KHUNG RIÊNG (window.KhungCode).

   Bài làm của học sinh:
     { chinh: [dòng], ham: [ { ten, thamSo: [], than: [dòng] } ] }
   - chinh: CHƯƠNG TRÌNH (màn chơi nửa trái). Mỗi dòng là một ô; dòng trống không tính ô.
   - ham: các hàm học sinh tạo trong "Xưởng hàm". Tên hàm là tiêu đề, dòng `def`
     KHÔNG tốn ô. Thân hàm viết ở mức thụt lề 0 (khối lồng bên trong như for / if
     thì thụt thêm như Python); mỗi hàm có khung riêng.
   Khung của màn:
     { chinh: 10, moiHam: 10, soHam: n, khoaChinh: k, khoaHam: k }
     - soHam: số hàm tối đa được tạo; 0 = chưa mở Xưởng hàm.
     - khoa*: số ô bị khóa ở cuối khung → số ô dùng được = số ô − số ô khóa.
   Hàm đã vào THƯ VIỆN thì không chiếm ô.

   soO (để chấm sao) = ô chương trình + tổng ô thân các hàm học sinh tạo.

   Ghép thành Python thật theo thứ tự: THƯ VIỆN → các hàm của em (dòng def + thân
   thụt 4) → CHƯƠNG TRÌNH, kèm bảng ánh xạ từ số dòng Python sang
     { cot: 'chinh', dong }  |  { cot: 'ham', ten, dong }  |  { cot: 'thuvien', ten, dong }
   `dong` của chinh / thân hàm là số thứ tự ô (từ 1) trong mảng bài làm, kể cả ô
   trống, nên khớp đúng vị trí học sinh thấy trên khung. Dòng def của hàm học
   sinh có dong = 0 (phần tiêu đề).

   Chạy được trong Node (module.exports) và trình duyệt (window.KhungCode).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  function laTrong(s) { return s === undefined || s === null || String(s).trim() === ''; }
  function layChinh(baiLam) { return (baiLam && baiLam.chinh) ? baiLam.chinh : []; }
  function layHam(baiLam) { return (baiLam && baiLam.ham) ? baiLam.ham : []; }
  function layThan(h) { return (h && h.than) ? h.than : []; }
  function soDong(ds) { var n = 0; (ds || []).forEach(function (s) { if (!laTrong(s)) n++; }); return n; }
  function laDef(s) { return /^\s*def\b/.test(String(s)); }

  /** Khung đầy đủ (điền mặc định). */
  function khungDayDu(khung) {
    khung = khung || {};
    return {
      chinh: khung.chinh === undefined ? 10 : khung.chinh,
      moiHam: khung.moiHam === undefined ? 10 : khung.moiHam,
      soHam: khung.soHam || 0,
      khoaChinh: khung.khoaChinh || 0,
      khoaHam: khung.khoaHam || 0
    };
  }

  /** Số ô dùng được: { chinh, moiHam }. */
  function soODung(khung) {
    var k = khungDayDu(khung);
    return {
      chinh: Math.max(0, k.chinh - k.khoaChinh),
      moiHam: k.soHam > 0 ? Math.max(0, k.moiHam - k.khoaHam) : 0
    };
  }

  /** Số ô thân của một hàm. */
  function soOHam(h) { return soDong(layThan(h)); }

  /** Số ô bài làm đang dùng: chương trình + thân mọi hàm (thư viện không tính). */
  function soO(baiLam) {
    var n = soDong(layChinh(baiLam));
    layHam(baiLam).forEach(function (h) { n += soOHam(h); });
    return n;
  }

  function dongDau(ds, loc) {
    var kq = [];
    ds.forEach(function (s, i) { if (!laTrong(s) && loc(s)) kq.push(i + 1); });
    return kq;
  }

  /**
   * Kiểm hợp lệ theo khung. Trả về mảng { ma, loi, … }; rỗng = hợp lệ.
   * hamGoc (tuỳ chọn): danh sách tên hàm gốc, để bắt hàm trùng tên hàm gốc.
   * Mã: tran-khung (cot 'chinh' | 'ham' kèm ten), def-trong-chuong-trinh,
   *     chua-mo-xuong, qua-nhieu-ham, ham-trung-ten.
   */
  function kiemTra(khung, baiLam, hamGoc) {
    var k = khungDayDu(khung), dung = soODung(k), loi = [];
    var chinh = layChinh(baiLam), ham = layHam(baiLam), mo = k.soHam > 0;

    // 1. tràn khung — chương trình rồi tới từng hàm
    function tran(ten, can, co, tong, khoa) {
      var s = (ten === null ? 'Chương trình' : 'Hàm "' + ten + '"') + ' có ' + can + ' dòng nhưng chỉ có ' + co +
        ' ô dùng được' + (khoa ? ' (' + tong + ' ô, ' + khoa + ' ô đang khóa)' : '') + ' — thừa ' + (can - co) + ' dòng.';
      if (ten === null && mo) s += ' Trong đoạn code có chỗ nào lặp lại không? Gói nó lại để gọi cho gọn.';
      else s += ' Tìm cách viết ngắn hơn.';
      return s;
    }
    var nChinh = soDong(chinh);
    if (nChinh > dung.chinh) {
      loi.push({ ma: 'tran-khung', loi: tran(null, nChinh, dung.chinh, k.chinh, k.khoaChinh), cot: 'chinh', can: nChinh, co: dung.chinh });
    }
    if (mo) {
      ham.forEach(function (h) {
        var n = soOHam(h);
        if (n > dung.moiHam) {
          loi.push({ ma: 'tran-khung', loi: tran(h.ten, n, dung.moiHam, k.moiHam, k.khoaHam), cot: 'ham', ten: h.ten, can: n, co: dung.moiHam });
        }
      });
    }

    // 2. def trong chương trình
    var dChinh = dongDau(chinh, laDef);
    if (dChinh.length) {
      loi.push({
        ma: 'def-trong-chuong-trinh', cot: 'chinh', dong: dChinh[0],
        loi: 'Dòng ' + dChinh[0] + ' của chương trình đang định nghĩa hàm (def). ' +
          (mo ? 'Chương trình chỉ chứa các lệnh chạy; hàm được tạo trong Xưởng hàm.' : 'Màn này chưa có Xưởng hàm nên chưa tự viết hàm được.')
      });
    }

    // 3. Xưởng hàm chưa mở / quá số hàm
    if (!mo && ham.length > 0) {
      loi.push({ ma: 'chua-mo-xuong', loi: 'Màn này chưa mở Xưởng hàm, nhưng bài làm đang có ' + ham.length + ' hàm. Viết các lệnh vào chương trình.' });
    }
    if (mo && ham.length > k.soHam) {
      loi.push({
        ma: 'qua-nhieu-ham', can: ham.length, co: k.soHam,
        loi: 'Màn này chỉ cho tạo tối đa ' + k.soHam + ' hàm, bài làm đang có ' + ham.length + ' hàm.'
      });
    }

    // 4. trùng tên
    var thay = {}, trung = [];
    ham.forEach(function (h) {
      if (thay[h.ten]) { if (trung.indexOf(h.ten) < 0) trung.push(h.ten); } else thay[h.ten] = true;
      if ((hamGoc || []).indexOf(h.ten) >= 0 && trung.indexOf(h.ten) < 0) trung.push(h.ten);
    });
    if (trung.length) {
      loi.push({
        ma: 'ham-trung-ten', ten: trung[0], danhSach: trung,
        loi: 'Tên hàm "' + trung.join('", "') + '" bị trùng (hai hàm cùng tên, hoặc trùng tên một hàm gốc). Mỗi hàm cần một tên riêng.'
      });
    }
    return loi;
  }

  /** Tách mã của một hàm thư viện thành mảng dòng (bỏ dòng trống cuối). */
  function tachDong(ma) {
    var ds = String(ma).replace(/\r\n?/g, '\n').split('\n');
    while (ds.length && laTrong(ds[ds.length - 1])) ds.pop();
    return ds;
  }

  function dongDef(h) { return 'def ' + h.ten + '(' + (h.thamSo || []).join(', ') + '):'; }

  /**
   * Ghép bài làm + thư viện thành Python thật.
   * dsThuVien: [{ ten, ma }] — các hàm thư viện đã có (không tính ô).
   * Trả về { ma, dong: [chuỗi], anhXa } — anhXa[số dòng Python (từ 1)] như mô tả đầu tệp.
   */
  function ghep(baiLam, dsThuVien) {
    var dong = [], anhXa = [null];
    (dsThuVien || []).forEach(function (h) {
      tachDong(h.ma).forEach(function (s, i) {
        dong.push(s); anhXa.push({ cot: 'thuvien', ten: h.ten, dong: i + 1 });
      });
    });
    layHam(baiLam).forEach(function (h) {
      dong.push(dongDef(h)); anhXa.push({ cot: 'ham', ten: h.ten, dong: 0 });
      layThan(h).forEach(function (s, i) {
        var t = (s === undefined || s === null) ? '' : String(s);
        dong.push(laTrong(t) ? '' : '    ' + t); anhXa.push({ cot: 'ham', ten: h.ten, dong: i + 1 });
      });
    });
    layChinh(baiLam).forEach(function (s, i) {
      dong.push(String(s === undefined || s === null ? '' : s)); anhXa.push({ cot: 'chinh', dong: i + 1 });
    });
    return { ma: dong.join('\n'), dong: dong, anhXa: anhXa };
  }

  function toanBo(baiLam) {
    var ds = layChinh(baiLam).slice();
    layHam(baiLam).forEach(function (h) { ds = ds.concat(layThan(h)); });
    return ds.join('\n');
  }

  /** Tên các hàm thư viện (trong `tenThuVien`) mà bài làm có gọi. */
  function thuVienDung(baiLam, tenThuVien) {
    var chuoi = toanBo(baiLam), tuViet = layHam(baiLam).map(function (h) { return h.ten; });
    return (tenThuVien || []).filter(function (t) {
      return new RegExp('(^|[^A-Za-z0-9_])' + t + '\\s*\\(').test(chuoi) && tuViet.indexOf(t) < 0;
    });
  }

  /** Xuất tệp .py đọc được: các hàm của em + chương trình, kèm một dòng chú thích về thư viện. */
  function xuatPy(baiLam, tenThuVien) {
    var dung = thuVienDung(baiLam, tenThuVien);
    var ghiChu = dung.length
      ? '# Dùng hàm thư viện của game: ' + dung.join(', ') + ' (chưa có trong tệp này)'
      : '# Không dùng hàm thư viện nào của game';
    var phan = [ghiChu];
    layHam(baiLam).forEach(function (h) {
      var than = layThan(h).filter(function (s) { return !laTrong(s); }).map(function (s) { return '    ' + s; });
      phan.push('', [dongDef(h)].concat(than).join('\n'));
    });
    var chinh = layChinh(baiLam).filter(function (s) { return !laTrong(s); });
    if (chinh.length) phan.push('', chinh.join('\n'));
    return phan.join('\n') + '\n';
  }

  var API = {
    laTrong: laTrong, soDong: soDong, soO: soO, soOHam: soOHam, soODung: soODung, khungDayDu: khungDayDu,
    kiemTra: kiemTra, ghep: ghep, thuVienDung: thuVienDung, xuatPy: xuatPy
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.KhungCode = API;
})();
