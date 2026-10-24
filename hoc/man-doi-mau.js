/* ============================================================================
   man-doi-mau.js — "Đường học": GÓI ĐỘI MÀU VÀ SÚNG HƠI (chưa có màn). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§4, §8).
   Hai chương doi-mau + che-doi-mau, 20 màn, đặt ngay sau chương che-mau: cảm biến màu / camera (đọc màu, báo nhau bằng vị trí vật) với súng hơi.
   Mẫu cách viết: man-doi-ho-bang.js. Chương chưa có màn thì lo-trinh-hoc.js chưa chèn vào lộ trình.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-mau';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {};
  // @sao-cuoi

  var DS = [];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-mau', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội màu và súng hơi' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội màu' }],
    goi: { ma: CHUONG, ten: 'Đội màu và súng hơi', hinh: 'mau' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
