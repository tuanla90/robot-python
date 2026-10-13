/* ============================================================================
   kho-ham.js — "Đường học": KHO HÀM CỦA EM, bền, dùng ở mọi màn (window.KhoHam).

   Hàm của em: học sinh tạo MỘT lần, được lưu, luôn có trên khay ở mọi màn sau.
   Sửa hàm thì mọi chỗ dùng nó đều đổi theo (máy chấm luôn chạy bản hiện tại trong kho).
   Mỗi hàm: { ten, thamSo: [tên đối số], than: [dòng] } — đúng dạng ChamHoc.cham() nhận.

   Dùng:
     var kho = KhoHam.moi({ soHamToiDa: 12 });     // một kho độc lập
     kho.tao('move', [], { taoHam: ['move'] })  → { ok:true, ham } | { ok:false, ma, loi }
                                   tuyChon.taoHam = tên các hàm cốt truyện màn ĐANG CHƠI yêu cầu tạo (man.taoHam).
                                   Tên cốt truyện (xem datTenCoDinh) mà kho chưa có chỉ tạo / đổi sang được
                                   khi nằm trong tuyChon.taoHam; còn lại → 'ten-danh-cho-cot-truyen'.
     kho.sua('move', [dòng…])    → thay thân hàm (tham số thứ ba tuỳ chọn: thamSo mới)
     kho.doiTen('cu', 'moi', tuyChon)  → đổi tên + sửa chỗ gọi trong thân các hàm khác của kho
     kho.xoa('move')             → { ok, conDung: [hàm khác còn gọi nó] }
     kho.datTenCoDinh([tên…])    → khóa tên các hàm THEO CỐT TRUYỆN (tên nằm trong taoHam của một màn nào đó):
                                   không đổi tên được, không xóa được (mã 'ten-co-dinh'); thân vẫn sửa tự do.
                                   Lõi không tự biết danh sách màn, nên giao diện gọi lúc khởi động (ung-dung.js).
     kho.tenCoDinh('move')       → true nếu tên đang bị khóa;  kho.dsTenCoDinh() → bản sao danh sách
     kho.ds()                    → bản sao các hàm (mảng), truyền thẳng cho cham()
     kho.kiemTen('ten', boQua, tuyChon)  → { ok } | { ok:false, ma, loi }   (boQua: tên được phép trùng, vd tên cũ khi đổi tên)
     kho.docLuu(luu) / kho.ghiLuu(luu)   → luu là đối tượng có getItem / setItem
   Cũng có kho mặc định dùng thẳng: KhoHam.tao(...), KhoHam.ds()… (KhoHam.macDinh).

   Mã lỗi: ten-rong, ten-sai-cu-phap, ten-la-tu-khoa, ten-trung-ham-goc, ten-da-co,
   ten-danh-cho-cot-truyen, het-cho, ten-co-dinh, khong-co-ham, tham-so-sai, than-sai, luu-hong,
   phien-ban-la, khong-ghi-duoc.
   Dữ liệu lưu: JSON { phienBan: 1, ham: [...] } ở khóa KhoHam.KHOA_LUU.

   Chạy được trong Node (module.exports) và trình duyệt (window.KhoHam).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var PHIEN_BAN = 1;
  var KHOA_LUU = 'duong-hoc:kho-ham';
  var SO_HAM_MAC_DINH = 31;      // 29 hàm cốt truyện (xuong-ham 7, tay-gap 3, vong-lap 4, tham-so 4: forward, right, deliver, step, nhen 3: go, walk, bring, xich 2: tr_right, tr_left, omni 2: slide_r, slide_l, tam-day 1: shove, khoang-cach 1: go_wall, mau 1: read_turn, nam-cham 1: fetch) + 2 chỗ cho hàm tự đặt.
                               // Chương sau thêm hàm cốt truyện nào thì tăng số này tương ứng (kiem-hoc.mjs kiểm: >= số hàm cốt truyện + 2).

  // hàm gốc của mọi loại robot (xe bánh có tay gắp, nhện, omni, tấm đẩy push, cảm biến khoảng cách, cảm biến màu color, nam châm magnet_on / magnet_off, cảm biến từ front_metal) + hàm nội bộ của nhân chạy code (print, range, len, str, int)
  var HAM_GOC_MAC_DINH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'arm_down', 'arm_up', 'grab', 'release',
    'slide_left', 'slide_right', 'push', 'front_clear', 'left_clear', 'right_clear', 'color', 'magnet_on', 'magnet_off', 'front_metal',
    'go_up', 'go_down', 'go_left', 'go_right', 'print', 'range', 'len', 'str', 'int'];
  // từ khóa Python (nhân chạy code chỉ hiểu một phần, nhưng cấm cả bộ cho khỏi nhầm)
  var TU_KHOA = ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
    'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if',
    'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
    'while', 'with', 'yield'];

  var RE_TEN = /^[A-Za-z_][A-Za-z0-9_]*$/;

  function loi(ma, noi, them) {
    var o = { ok: false, ma: ma, loi: noi };
    if (them) for (var k in them) o[k] = them[k];
    return o;
  }
  function saoChep(h) {
    return { ten: h.ten, thamSo: (h.thamSo || []).slice(), than: (h.than || []).slice() };
  }
  function bo(s) { var k = s.indexOf('#'); return k >= 0 ? s.slice(0, k) : s; }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function moi(tuyChon) {
    tuyChon = tuyChon || {};
    var toiDa = tuyChon.soHamToiDa === undefined ? SO_HAM_MAC_DINH : tuyChon.soHamToiDa;
    var hamGoc = tuyChon.hamGoc || HAM_GOC_MAC_DINH;
    var ham = [];
    var coDinh = (tuyChon.tenCoDinh || []).map(String);     // tên hàm theo cốt truyện (xem datTenCoDinh)
    var phienBanDoc = PHIEN_BAN;       // phiên bản của dữ liệu đã đọc (mới hơn bản này → không ghi đè)

    function tim(ten) {
      for (var i = 0; i < ham.length; i++) if (ham[i].ten === ten) return ham[i];
      return null;
    }

    /** Tên hợp lệ: định danh Python, không trùng từ khóa, hàm gốc, hàm đã có.
     *  boQua: tên một hàm được phép trùng (chính nó khi đổi tên). */
    function kiemTen(ten, boQua, tuyChon) {
      if (ten === undefined || ten === null || String(ten).trim() === '') {
        return loi('ten-rong', 'Tên hàm không được để trống.');
      }
      ten = String(ten);
      if (!RE_TEN.test(ten)) {
        return loi('ten-sai-cu-phap', 'Tên hàm "' + ten + '" không hợp lệ: chỉ dùng chữ cái không dấu, chữ số và dấu gạch dưới, và không bắt đầu bằng chữ số.');
      }
      if (TU_KHOA.indexOf(ten) >= 0) {
        return loi('ten-la-tu-khoa', 'Tên "' + ten + '" là từ khóa của Python, hãy chọn tên khác.');
      }
      if (hamGoc.indexOf(ten) >= 0) {
        return loi('ten-trung-ham-goc', 'Tên "' + ten + '" trùng một hàm gốc của game, hãy chọn tên khác.');
      }
      if (ten !== boQua && tim(ten)) {
        return loi('ten-da-co', 'Đã có hàm tên "' + ten + '" trong kho của em.');
      }
      // tên hàm cốt truyện mà kho chưa có: chỉ tạo đúng ở màn yêu cầu nó (tránh chiếm tên của màn khác)
      if (ten !== boQua && !tim(ten) && tenCoDinh(ten) &&
          !(tuyChon && Array.isArray(tuyChon.taoHam) && tuyChon.taoHam.indexOf(ten) >= 0)) {
        return loi('ten-danh-cho-cot-truyen', 'Tên "' + ten + '" dành cho một hàm ở màn khác trong cốt truyện, hãy đặt tên khác.');
      }
      return { ok: true };
    }

    function kiemThamSo(thamSo) {
      var thay = {};
      for (var i = 0; i < thamSo.length; i++) {
        var p = thamSo[i];
        if (typeof p !== 'string' || !RE_TEN.test(p) || TU_KHOA.indexOf(p) >= 0) {
          return loi('tham-so-sai', 'Tên đối số "' + p + '" không hợp lệ.');
        }
        if (thay[p]) return loi('tham-so-sai', 'Hai đối số cùng tên "' + p + '".');
        thay[p] = true;
      }
      return { ok: true };
    }

    function kiemThan(than) {
      if (!Array.isArray(than)) return loi('than-sai', 'Thân hàm phải là danh sách các dòng.');
      for (var i = 0; i < than.length; i++) {
        if (typeof than[i] !== 'string') return loi('than-sai', 'Mỗi dòng của thân hàm phải là chữ.');
      }
      return { ok: true };
    }

    function tao(ten, thamSo, tuyChon) {
      var r = kiemTen(ten, undefined, tuyChon);
      if (!r.ok) return r;
      thamSo = thamSo || [];
      if (!Array.isArray(thamSo)) return loi('tham-so-sai', 'Đối số phải là danh sách tên.');
      var rs = kiemThamSo(thamSo);
      if (!rs.ok) return rs;
      if (ham.length >= toiDa) {
        return loi('het-cho', 'Kho chỉ chứa tối đa ' + toiDa + ' hàm của em. Xóa bớt một hàm không dùng rồi tạo tiếp.');
      }
      var h = { ten: String(ten), thamSo: thamSo.slice(), than: [] };
      ham.push(h);
      return { ok: true, ham: saoChep(h) };
    }

    function sua(ten, than, thamSo) {
      var h = tim(ten);
      if (!h) return loi('khong-co-ham', 'Không có hàm "' + ten + '" trong kho.');
      var r = kiemThan(than);
      if (!r.ok) return r;
      if (thamSo !== undefined) {
        if (!Array.isArray(thamSo)) return loi('tham-so-sai', 'Đối số phải là danh sách tên.');
        var rs = kiemThamSo(thamSo);
        if (!rs.ok) return rs;
        h.thamSo = thamSo.slice();
      }
      h.than = than.slice();
      return { ok: true, ham: saoChep(h) };
    }

    /** Các hàm khác của kho có gọi `ten` trong thân (bỏ chú thích). */
    function aiGoi(ten) {
      var re = new RegExp('(^|[^A-Za-z0-9_])' + escRe(ten) + '\\s*\\(');
      return ham.filter(function (h) {
        return h.ten !== ten && h.than.some(function (s) { return re.test(bo(s)); });
      }).map(function (h) { return h.ten; });
    }

    function tenCoDinh(ten) { return coDinh.indexOf(String(ten)) >= 0; }
    function datTenCoDinh(dsTen) {
      coDinh = [];
      (Array.isArray(dsTen) ? dsTen : []).forEach(function (n) { n = String(n); if (coDinh.indexOf(n) < 0) coDinh.push(n); });
      return coDinh.slice();
    }
    function loiCoDinh(ten, viec) {
      return loi('ten-co-dinh', 'Hàm ' + ten + ' cần cho các màn sau, nên không ' + viec + ' được. Em vẫn sửa thân hàm thoải mái.');
    }

    function doiTen(cu, moiTen, tuyChon) {
      var h = tim(cu);
      if (!h) return loi('khong-co-ham', 'Không có hàm "' + cu + '" trong kho.');
      if (tenCoDinh(cu)) return loiCoDinh(cu, 'đổi tên');
      if (cu === moiTen) return { ok: true, capNhat: [] };
      var r = kiemTen(moiTen, cu, tuyChon);
      if (!r.ok) return r;
      var capNhat = aiGoi(cu);
      var re = new RegExp('(^|[^A-Za-z0-9_])' + escRe(cu) + '(\\s*\\()', 'g');
      ham.forEach(function (g) {
        if (g === h) return;
        g.than = g.than.map(function (s) {
          var k = s.indexOf('#'), code = k >= 0 ? s.slice(0, k) : s, ghiChu = k >= 0 ? s.slice(k) : '';
          return code.replace(re, function (_, truoc, ngoac) { return truoc + moiTen + ngoac; }) + ghiChu;
        });
      });
      h.ten = String(moiTen);
      return { ok: true, capNhat: capNhat };
    }

    function xoa(ten) {
      var h = tim(ten);
      if (!h) return loi('khong-co-ham', 'Không có hàm "' + ten + '" trong kho.');
      if (tenCoDinh(ten)) return loiCoDinh(ten, 'xóa');
      var conDung = aiGoi(ten);
      ham.splice(ham.indexOf(h), 1);
      return { ok: true, conDung: conDung };
    }

    function ds() { return ham.map(saoChep); }

    /* ------------------------------------------------------------- lưu / đọc */

    function sachHam(r) {
      // chỉ nhận mục đọc được; mục hỏng bị bỏ, không làm hỏng cả kho
      if (!r || typeof r !== 'object') return null;
      if (!RE_TEN.test(String(r.ten)) || TU_KHOA.indexOf(r.ten) >= 0) return null;
      var thamSo = Array.isArray(r.thamSo) ? r.thamSo.filter(function (p) { return typeof p === 'string' && RE_TEN.test(p); }) : [];
      var than = Array.isArray(r.than) ? r.than.filter(function (s) { return typeof s === 'string'; }) : [];
      return { ten: String(r.ten), thamSo: thamSo, than: than };
    }

    /** Đọc kho từ `luu` (getItem). Không có gì được lưu → kho rỗng, ok.
     *  Dữ liệu hỏng / phiên bản lạ → { ok:false } và kho GIỮ NGUYÊN như cũ. */
    function docLuu(luu) {
      var tho;
      try { tho = luu.getItem(KHOA_LUU); } catch (e) { return loi('luu-hong', 'Không đọc được chỗ lưu.'); }
      if (tho === null || tho === undefined) { ham = []; phienBanDoc = PHIEN_BAN; return { ok: true, moi: true, soHam: 0 }; }
      var du;
      try { du = JSON.parse(tho); } catch (e) { return loi('luu-hong', 'Dữ liệu đã lưu bị hỏng, không đọc được.'); }
      if (!du || typeof du !== 'object' || typeof du.phienBan !== 'number' || !Array.isArray(du.ham)) {
        return loi('luu-hong', 'Dữ liệu đã lưu không đúng dạng.');
      }
      if (du.phienBan > PHIEN_BAN) {
        phienBanDoc = du.phienBan;
        return loi('phien-ban-la', 'Dữ liệu được lưu bằng bản game mới hơn (phiên bản ' + du.phienBan + '), bản này chưa đọc được.', { phienBan: du.phienBan });
      }
      var moiDs = [], bo2 = 0, thay = {};
      du.ham.forEach(function (r) {
        var h = sachHam(r);
        if (!h || thay[h.ten] || hamGoc.indexOf(h.ten) >= 0 || moiDs.length >= toiDa) { bo2++; return; }
        thay[h.ten] = true; moiDs.push(h);
      });
      ham = moiDs; phienBanDoc = du.phienBan;
      return { ok: true, soHam: ham.length, boQua: bo2 };
    }

    /** Ghi kho vào `luu` (setItem). Không ghi đè dữ liệu của bản game mới hơn. */
    function ghiLuu(luu) {
      if (phienBanDoc > PHIEN_BAN) {
        return loi('phien-ban-la', 'Dữ liệu đã lưu là của bản game mới hơn, không ghi đè.', { phienBan: phienBanDoc });
      }
      try { luu.setItem(KHOA_LUU, JSON.stringify({ phienBan: PHIEN_BAN, ham: ds() })); }
      catch (e) { return loi('khong-ghi-duoc', 'Không ghi được vào chỗ lưu.'); }
      return { ok: true };
    }

    return {
      tao: tao, sua: sua, doiTen: doiTen, xoa: xoa, ds: ds, kiemTen: kiemTen,
      datTenCoDinh: datTenCoDinh, tenCoDinh: tenCoDinh, dsTenCoDinh: function () { return coDinh.slice(); },
      tim: function (ten) { var h = tim(ten); return h ? saoChep(h) : null; },
      soHam: function () { return ham.length; },
      soHamToiDa: function () { return toiDa; },
      docLuu: docLuu, ghiLuu: ghiLuu
    };
  }

  var macDinh = moi();
  var API = {
    moi: moi, macDinh: macDinh,
    PHIEN_BAN: PHIEN_BAN, KHOA_LUU: KHOA_LUU, SO_HAM_MAC_DINH: SO_HAM_MAC_DINH,
    HAM_GOC_MAC_DINH: HAM_GOC_MAC_DINH, TU_KHOA: TU_KHOA
  };
  Object.keys(macDinh).forEach(function (k) { API[k] = macDinh[k]; });

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.KhoHam = API;
})();
