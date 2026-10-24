/* ============================================================================
   man-doi-nam-cham.js — "Đường học": GÓI ĐỘI NAM CHÂM VÀ MÀU (chưa có màn). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§4, §8).
   Hai chương doi-nam-cham + che-doi-nam-cham, 20 màn, đặt ngay sau chương che-nam-cham: nam châm + cảm biến từ (hút / đẩy từ xa, đường lui khi không hút được) với cảm biến màu.
   Mẫu cách viết: man-doi-ho-bang.js. Chương chưa có màn thì lo-trinh-hoc.js chưa chèn vào lộ trình.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-nam-cham';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {};
  // @sao-cuoi

  var DS = [];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-nam-cham', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội nam châm và màu' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội nam châm' }],
    goi: { ma: CHUONG, ten: 'Đội nam châm và màu', hinh: 'nam-cham' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
