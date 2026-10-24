/* ============================================================================
   man-doi-sung-hoi.js — "Đường học": GÓI ĐỘI SÚNG HƠI VÀ OMNI (chưa có màn). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§4, §8).
   Hai chương doi-sung-hoi + che-doi-sung-hoi, 20 màn, đặt ngay sau chương che-sung-hoi: súng hơi (bắn nút mở cửa / bật tắt băng, giật đẩy thùng nặng) với omni.
   Mẫu cách viết: man-doi-ho-bang.js. Chương chưa có màn thì lo-trinh-hoc.js chưa chèn vào lộ trình.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-sung-hoi';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {};
  // @sao-cuoi

  var DS = [];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-sung-hoi', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội súng hơi và omni' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội súng hơi' }],
    goi: { ma: CHUONG, ten: 'Đội súng hơi và omni', hinh: 'sung-hoi' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
