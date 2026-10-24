/* ============================================================================
   man-doi-drone.js — "Đường học": GÓI ĐỘI DRONE VÀ MÁY NÉM (chưa có màn). Kế hoạch: hoc/KE-HOACH-PHOI-HOP.md (§4, §8).
   Hai chương doi-drone + che-doi-drone, 20 màn, đặt ngay sau chương flycam: drone (bay qua rào / băng, pin, nam châm treo, camera nhìn xuống) với máy ném.
   Mẫu cách viết: man-doi-ho-bang.js. Chương chưa có màn thì lo-trinh-hoc.js chưa chèn vào lộ trình.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-drone';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {};
  // @sao-cuoi

  var DS = [];

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'flycam', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội drone và máy ném' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội drone' }],
    goi: { ma: CHUONG, ten: 'Đội drone và máy ném', hinh: 'drone' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
