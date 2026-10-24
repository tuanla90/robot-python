/* ============================================================================
   man-doi-tay-xoay.js — "Đường học": GÓI ĐỘI TAY XOAY VÀ NAM CHÂM (chưa có màn). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§4, §8).
   Hai chương doi-tay-xoay + che-doi-tay-xoay, 20 màn, đặt ngay sau chương che-tay-xoay: tay xoay (dây chuyền: gắp đặt hai bên không quay xe) với nam châm.
   Mẫu cách viết: man-doi-ho-bang.js. Chương chưa có màn thì lo-trinh-hoc.js chưa chèn vào lộ trình.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-tay-xoay';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {};
  // @sao-cuoi

  var DS = [];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-tay-xoay', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội tay xoay và nam châm' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội tay xoay' }],
    goi: { ma: CHUONG, ten: 'Đội tay xoay và nam châm', hinh: 'tay-xoay' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
