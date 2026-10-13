/* ============================================================================
   khung-code.js — "Đường học": KHUNG CODE, MỖI HÀM MỘT KHUNG RIÊNG (window.KhungCode).

   Bài làm của học sinh ở một màn:
     { chinh: [dòng], hamCuaMan: [ { ten, thamSo: [], than: [dòng] } ] }
   - chinh: CHƯƠNG TRÌNH (nửa trái của màn). Mỗi dòng là một ô; dòng trống không tính ô.
   - hamCuaMan: HÀM CỦA MÀN (tạm) — màn cho sẵn để dạy, chỉ sống trong màn đó, không
     được lưu; học sinh sửa được trong màn. Bản đang sửa nằm ở đây.
   HÀM CỦA EM (bền) không nằm trong bài làm mà là KHO riêng (xem kho-ham.js):
     hamCuaEm = [ { ten, thamSo, than } ]
   Tên hàm là tiêu đề, dòng `def` KHÔNG tốn ô. Thân hàm viết ở mức thụt lề 0 (khối lồng
   bên trong như for / if thì thụt thêm như Python); mỗi hàm có khung riêng.

   Khung của màn:
     { chinh: 10, moiHam: 10, khoaChinh: k, khoaHam: k, moXuong: true|false }
     - moXuong: false = màn chưa mở Xưởng hàm (chuỗi 1). Mặc định true.
     - khoa*: số ô bị khóa ở cuối khung → số ô dùng được = số ô − số ô khóa.
     - cauTruc: danh sách cấu trúc Python màn cho dùng (vd ['for']). Có khai (kể cả []) thì
       bài làm dùng `for` mà 'for' vắng ở đây bị báo 'cau-truc-chua-hoc'. Không khai thì không kiểm.
       Chỉ kiểm CHƯƠNG TRÌNH và HÀM CỦA MÀN (bài làm của màn); hàm của em không bị kiểm.
   Dòng thụt lề: mỗi dòng (chương trình hay thân hàm) vẫn là MỘT ô; `for ...:` là một ô và mỗi
   dòng trong thân for là một ô. Thân hàm viết ở mức thụt lề 0, khối lồng trong đó thụt thêm 4 dấu cách.
     (Số hàm của em tối đa cả game do kho-ham.js giữ, không còn theo màn.)

   Hàm của màn che hàm của em cùng tên (trong màn đó).
   Hàm của em chỉ được ghép vào mã Python nếu bài làm GỌI TỚI nó (thẳng hay gián tiếp),
   để một hàm dở dang trong kho không làm hỏng mọi màn khác.

   soO (để chấm sao) = ô chương trình + thân các hàm (của em và của màn) THỰC SỰ được
   gọi khi chạy; mỗi hàm tính một lần. Phần "thực sự được gọi" do máy chấm dò từ vết
   chạy (cham.js); ở đây chỉ có phép cộng demO() và bản dò TĨNH (tapHamDung) dùng khi
   chưa chạy được.

   Ghép thành Python thật theo thứ tự: HÀM CỦA EM → HÀM CỦA MÀN → CHƯƠNG TRÌNH, kèm bảng
   ánh xạ từ số dòng Python sang
     { cot: 'chinh', dong } | { cot: 'hamEm', ten, dong } | { cot: 'hamMan', ten, dong }
   `dong` của chinh / thân hàm là số thứ tự ô (từ 1) trong mảng, kể cả ô trống, nên khớp
   đúng vị trí học sinh thấy trên khung. Dòng def của hàm có dong = 0 (phần tiêu đề).

   Chạy được trong Node (module.exports) và trình duyệt (window.KhungCode).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  function laTrong(s) { return s === undefined || s === null || String(s).trim() === ''; }
  function layChinh(baiLam) { return (baiLam && baiLam.chinh) ? baiLam.chinh : []; }
  function layHamMan(baiLam) { return (baiLam && baiLam.hamCuaMan) ? baiLam.hamCuaMan : []; }
  function layThan(h) { return (h && h.than) ? h.than : []; }
  function soDong(ds) { var n = 0; (ds || []).forEach(function (s) { if (!laTrong(s)) n++; }); return n; }
  function laDef(s) { return /^\s*def\b/.test(String(s)); }
  function boChuThich(s) { var t = String(s === undefined || s === null ? '' : s), k = t.indexOf('#'); return k >= 0 ? t.slice(0, k) : t; }
  function laFor(s) { return /^\s*for\b/.test(boChuThich(s)); }

  /** Khung đầy đủ (điền mặc định). */
  function khungDayDu(khung) {
    khung = khung || {};
    return {
      chinh: khung.chinh === undefined ? 10 : khung.chinh,
      moiHam: khung.moiHam === undefined ? 10 : khung.moiHam,
      khoaChinh: khung.khoaChinh || 0,
      khoaHam: khung.khoaHam || 0,
      moXuong: khung.moXuong !== false,
      cauTruc: Array.isArray(khung.cauTruc) ? khung.cauTruc.slice() : undefined
    };
  }

  /** Số ô dùng được: { chinh, moiHam }. */
  function soODung(khung) {
    var k = khungDayDu(khung);
    return {
      chinh: Math.max(0, k.chinh - k.khoaChinh),
      moiHam: Math.max(0, k.moiHam - k.khoaHam)
    };
  }

  /** Số ô thân của một hàm. */
  function soOHam(h) { return soDong(layThan(h)); }

  /** Số ô của chương trình + thân các hàm trong `dsHam` (mỗi hàm tính MỘT lần, theo tên). */
  function demO(baiLam, dsHam) {
    var n = soDong(layChinh(baiLam)), thay = {};
    (dsHam || []).forEach(function (h) {
      if (thay[h.ten]) return;
      thay[h.ten] = true; n += soOHam(h);
    });
    return n;
  }

  /* ---------------------------------------------------- dò hàm được gọi (TĨNH) */

  /** Tên các hàm xuất hiện dạng `ten(` trong các dòng (bỏ phần chú thích). */
  function tenDuocGoi(dong) {
    var kq = [], re = /([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    (dong || []).forEach(function (s) {
      var t = String(s === undefined || s === null ? '' : s), k = t.indexOf('#');
      if (k >= 0) t = t.slice(0, k);
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(t))) { if (kq.indexOf(m[1]) < 0) kq.push(m[1]); }
    });
    return kq;
  }

  /**
   * Những hàm "với tới được" bằng cách đọc chữ (không chạy), xuất phát từ `tuyChon.goc`
   * (mặc định: các tên được gọi trong chương trình), đi theo lời gọi trong thân hàm.
   * tuyChon.tatCaHamMan: mọi hàm của màn đều tính là với tới được (để còn bắt lỗi trong
   * đó), kể cả khi chưa ai gọi.
   * Trả về { man: [hàm của màn], em: [hàm của em], che: [tên hàm của em bị hàm của màn che] }.
   * `em` đã bỏ các hàm bị che.
   */
  function tapHamDung(baiLam, hamCuaEm, tuyChon) {
    tuyChon = tuyChon || {};
    var hamMan = layHamMan(baiLam), em = hamCuaEm || [];
    var tenMan = {}, tenEm = {}, che = [];
    hamMan.forEach(function (h) { if (!tenMan[h.ten]) tenMan[h.ten] = h; });
    em.forEach(function (h) {
      if (tenMan[h.ten]) { if (che.indexOf(h.ten) < 0) che.push(h.ten); return; }
      if (!tenEm[h.ten]) tenEm[h.ten] = h;
    });
    var hang = (tuyChon.goc || tenDuocGoi(layChinh(baiLam))).slice();
    var thamMan = {}, thamEm = {};
    if (tuyChon.tatCaHamMan) {
      hamMan.forEach(function (h) { thamMan[h.ten] = true; hang = hang.concat(tenDuocGoi(layThan(h))); });
    }
    while (hang.length) {
      var n = hang.pop();
      if (tenMan[n]) {
        if (!thamMan[n]) { thamMan[n] = true; hang = hang.concat(tenDuocGoi(layThan(tenMan[n]))); }
      } else if (tenEm[n]) {
        if (!thamEm[n]) { thamEm[n] = true; hang = hang.concat(tenDuocGoi(layThan(tenEm[n]))); }
      }
    }
    return {
      man: hamMan.filter(function (h) { return thamMan[h.ten]; }),
      em: em.filter(function (h) { return !tenMan[h.ten] && thamEm[h.ten]; }),
      che: che
    };
  }

  /** soO tính TĨNH: chương trình + các hàm với tới được từ chương trình. */
  function soO(baiLam, hamCuaEm) {
    var t = tapHamDung(baiLam, hamCuaEm);
    return demO(baiLam, t.man.concat(t.em));
  }

  function dongDau(ds, loc) {
    var kq = [];
    ds.forEach(function (s, i) { if (!laTrong(s) && loc(s)) kq.push(i + 1); });
    return kq;
  }

  /**
   * Kiểm hợp lệ theo khung. Trả về mảng { ma, loi, … }; rỗng = hợp lệ.
   * hamGoc (tuỳ chọn): danh sách tên hàm gốc, để bắt hàm trùng tên hàm gốc.
   * hamEmDung (tuỳ chọn): các hàm của em sẽ được ghép vào bài (đã bỏ hàm bị che).
   * Mã: tran-khung (cot 'chinh' | 'hamMan' | 'hamEm' kèm ten), def-trong-chuong-trinh,
   *     cau-truc-chua-hoc, ham-trung-ten.
   */
  function kiemTra(khung, baiLam, hamGoc, hamEmDung) {
    var k = khungDayDu(khung), dung = soODung(k), loi = [];
    var chinh = layChinh(baiLam), hamMan = layHamMan(baiLam), hamEm = hamEmDung || [], mo = k.moXuong;

    // 1. tràn khung — chương trình, rồi hàm của màn, rồi hàm của em
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
    [['hamMan', hamMan], ['hamEm', hamEm]].forEach(function (nhom) {
      nhom[1].forEach(function (h) {
        var n = soOHam(h);
        if (n > dung.moiHam) {
          loi.push({ ma: 'tran-khung', loi: tran(h.ten, n, dung.moiHam, k.moiHam, k.khoaHam), cot: nhom[0], ten: h.ten, can: n, co: dung.moiHam });
        }
      });
    });

    // 2. def trong chương trình
    var dChinh = dongDau(chinh, laDef);
    if (dChinh.length) {
      loi.push({
        ma: 'def-trong-chuong-trinh', cot: 'chinh', dong: dChinh[0],
        loi: 'Dòng ' + dChinh[0] + ' của chương trình đang định nghĩa hàm (def). ' +
          (mo ? 'Chương trình chỉ chứa các lệnh chạy; hàm được tạo trong Xưởng hàm.' : 'Màn này chưa có Xưởng hàm nên chưa tự viết hàm được.')
      });
    }

    // 2b. cấu trúc chưa học: `for` ở màn có khai cauTruc mà không có 'for' trong đó
    if (k.cauTruc && k.cauTruc.indexOf('for') < 0) {
      var vi = null, dFor = dongDau(chinh, laFor);
      if (dFor.length) vi = { cot: 'chinh', dong: dFor[0], noi: 'chương trình, dòng ' + dFor[0] };
      else hamMan.forEach(function (h) {
        var d = dongDau(layThan(h), laFor);
        if (!vi && d.length) vi = { cot: 'hamMan', ten: h.ten, dong: d[0], noi: 'hàm ' + h.ten + ' của màn, dòng ' + d[0] };
      });
      if (vi) {
        var ct = { ma: 'cau-truc-chua-hoc', cot: vi.cot, dong: vi.dong, cauTruc: 'for',
          loi: 'Ở ' + vi.noi + ': vòng lặp for chưa được dùng ở màn này, hãy viết theo cách khác.' };
        if (vi.ten) ct.ten = vi.ten;
        loi.push(ct);
      }
    }

    // 3. trùng tên (hai hàm của màn cùng tên, hai hàm của em cùng tên, hoặc trùng hàm gốc).
    //    Hàm của màn trùng tên hàm của em là CHE, không phải lỗi.
    var thayMan = {}, thayEm = {}, trung = [];
    function ghiTrung(t) { if (trung.indexOf(t) < 0) trung.push(t); }
    hamMan.forEach(function (h) { if (thayMan[h.ten]) ghiTrung(h.ten); else thayMan[h.ten] = true; });
    hamEm.forEach(function (h) { if (thayEm[h.ten]) ghiTrung(h.ten); else thayEm[h.ten] = true; });
    hamMan.concat(hamEm).forEach(function (h) { if ((hamGoc || []).indexOf(h.ten) >= 0) ghiTrung(h.ten); });
    if (trung.length) {
      loi.push({
        ma: 'ham-trung-ten', ten: trung[0], danhSach: trung,
        loi: 'Tên hàm "' + trung.join('", "') + '" bị trùng (hai hàm cùng tên, hoặc trùng tên một hàm gốc). Mỗi hàm cần một tên riêng.'
      });
    }
    return loi;
  }

  function dongDef(h) { return 'def ' + h.ten + '(' + (h.thamSo || []).join(', ') + '):'; }

  /**
   * Ghép bài làm + các hàm của em thành Python thật.
   * hamEmDung: các hàm của em cần ghép (đã bỏ hàm bị che; xem tapHamDung).
   * Trả về { ma, dong: [chuỗi], anhXa } — anhXa[số dòng Python (từ 1)] như mô tả đầu tệp.
   */
  function ghep(baiLam, hamEmDung) {
    var dong = [], anhXa = [null];
    function themHam(h, cot) {
      dong.push(dongDef(h)); anhXa.push({ cot: cot, ten: h.ten, dong: 0 });
      layThan(h).forEach(function (s, i) {
        var t = (s === undefined || s === null) ? '' : String(s);
        dong.push(laTrong(t) ? '' : '    ' + t); anhXa.push({ cot: cot, ten: h.ten, dong: i + 1 });
      });
    }
    (hamEmDung || []).forEach(function (h) { themHam(h, 'hamEm'); });
    layHamMan(baiLam).forEach(function (h) { themHam(h, 'hamMan'); });
    layChinh(baiLam).forEach(function (s, i) {
      dong.push(String(s === undefined || s === null ? '' : s)); anhXa.push({ cot: 'chinh', dong: i + 1 });
    });
    return { ma: dong.join('\n'), dong: dong, anhXa: anhXa };
  }

  /**
   * Xuất tệp .py đọc được: hàm của em đang dùng + hàm của màn + chương trình.
   * Hàm của em xuất ra là bản đầy đủ nên tệp chạy được một mình.
   */
  function xuatPy(baiLam, hamCuaEm) {
    var t = tapHamDung(baiLam, hamCuaEm, { tatCaHamMan: true });
    var ghiChu = t.em.length
      ? '# Hàm của em dùng trong bài: ' + t.em.map(function (h) { return h.ten; }).join(', ')
      : '# Bài này không dùng hàm nào của em';
    var phan = [ghiChu];
    t.em.concat(t.man).forEach(function (h) {
      var than = layThan(h).filter(function (s) { return !laTrong(s); }).map(function (s) { return '    ' + s; });
      phan.push('', [dongDef(h)].concat(than).join('\n'));
    });
    var chinh = layChinh(baiLam).filter(function (s) { return !laTrong(s); });
    if (chinh.length) phan.push('', chinh.join('\n'));
    return phan.join('\n') + '\n';
  }

  var API = {
    laTrong: laTrong, soDong: soDong, soO: soO, demO: demO, soOHam: soOHam, soODung: soODung, khungDayDu: khungDayDu,
    tenDuocGoi: tenDuocGoi, tapHamDung: tapHamDung,
    kiemTra: kiemTra, ghep: ghep, xuatPy: xuatPy
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.KhungCode = API;
})();
