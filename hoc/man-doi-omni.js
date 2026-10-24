/* ============================================================================
   man-doi-omni.js — "Đường học": GÓI ĐỘI OMNI VÀ XÍCH (chưa có màn). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§4, §8).
   Hai chương doi-omni + che-doi-omni, 20 màn, đặt ngay sau chương che-omni: omni (trượt ngang, nhường đường) với xích.
   Mẫu cách viết: man-doi-ho-bang.js. Chương chưa có màn thì lo-trinh-hoc.js chưa chèn vào lộ trình.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-omni';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {};
  // @sao-cuoi

  var DS = [];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-omni', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội omni và xích' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội omni' }],
    goi: { ma: CHUONG, ten: 'Đội omni và xích', hinh: 'omni' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
