/* ============================================================================
   thu-tu-chuong.js — diem10code-python: THỨ TỰ CÁC CHƯƠNG (window.ThuTuChuong).

   Dự án tách từ doi-robot-chan-hung (31/10 → 5/11): CHỈ GIỮ các mùa "cốt lõi" khớp
   chương trình Tin học lớp 12 ôn thi đại học (không cần tuple, dict/set, mảng 2
   chiều). Mùa 1, 2 đã dựng theo khuôn 4 cột × 8 hàng (man-m1-*.js, man-m2-*.js); các mùa còn lại
   mới có MỘT chương demo, xem hoc/KE-HOACH-4-MUA-COT-LOI.md.

   - mua-1 Kho hàng    (hai bánh) — def, for, if/while
   - mua-2 Bãi tái chế (nhện)     — chuỗi, logic and/or/elif
   - mua-3 Bến sông    (xuồng)    — biến, tham số
   - mua-4 Nông trại   (drone)    — list, for x in a, append

   CHƯA THÊM (xem README.md): Cảng sông (cần cẩu — toạ độ cực nac/tam khác hẳn
   x,y, cần thiết kế riêng) và Tổng kết (ôn lại các mùa trên — chưa thiết kế).

   Quy tắc giữ nguyên bản gốc: mã chương cố định, màn dùng `ma` để lưu tiến độ,
   `id` hiển thị tính từ vị trí trong `thuTu`. Nạp tệp này TRƯỚC man-co-so.js.
   Chạy được trong Node (module.exports) và trình duyệt (window.ThuTuChuong).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var API = {
    thuTu: ['m1-c1-than', 'm1-c2-tay', 'm1-c3-cam-bien', 'm1-c4-san',                 // mùa 1: lưới 4 cột × 8 hàng (KE-HOACH-4-MUA-COT-LOI.md), mỗi cột một chương, một gói
      'm2-c1-than', 'm2-c2-tay', 'm2-c3-cam-bien', 'm2-c4-san',                       // mùa 2: chuỗi part Nhện + Kẹp + Khoảng cách → + Nam châm → + Cảm ứng từ → sân riêng
      'demo-ben-song', 'demo-nong-trai'],
    dot2: [],
    congDot2: null,
    mua: [
      { ma: 'mua-1', ten: 'Kho hàng' },
      { ma: 'mua-2', ten: 'Bãi tái chế' },
      { ma: 'mua-3', ten: 'Bến sông' },
      { ma: 'mua-4', ten: 'Nông trại' }
    ],
    goi: [
      // không khai `sao`: gói sau mở khi đủ một nửa số sao tối đa của các gói trước (mo-goi.js), nên 4 cột mở lần lượt: thân → +tay → +cảm biến → +sân
      { ma: 'm1-c1-than', ten: 'Hai bánh', hinh: 'hai-banh', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c1-than'] },
      { ma: 'm1-c2-tay', ten: 'Tay kẹp', hinh: 'tay-gap', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c2-tay'] },
      { ma: 'm1-c3-cam-bien', ten: 'Cảm biến khoảng cách', hinh: 'khoang-cach', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c3-cam-bien'] },
      { ma: 'm1-c4-san', ten: 'Kho hàng: nút đè', hinh: 'nut-de', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c4-san'] },
      { ma: 'm2-c1-than', ten: 'Thân nhện', hinh: 'che-nhen', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c1-than'] },
      { ma: 'm2-c2-tay', ten: 'Nam châm', hinh: 'nam-cham', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c2-tay'] },
      { ma: 'm2-c3-cam-bien', ten: 'Cảm ứng từ', hinh: 'che-nam-cham', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c3-cam-bien'] },
      { ma: 'm2-c4-san', ten: 'Bãi tái chế: hố và đệm từ', hinh: 'tong-hop-2', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c4-san'] },
      { ma: 'demo-ben-song', ten: 'Bến sông (demo)', sao: 0, mua: 'mua-3', chuong: ['demo-ben-song'] },
      { ma: 'demo-nong-trai', ten: 'Nông trại (demo)', sao: 0, mua: 'mua-4', chuong: ['demo-nong-trai'] }
    ],
    ten: {
      'm1-c1-than': 'Hai bánh',
      'm1-c2-tay': 'Tay kẹp',
      'm1-c3-cam-bien': 'Cảm biến khoảng cách',
      'm1-c4-san': 'Kho hàng: nút đè',
      'm2-c1-than': 'Thân nhện',
      'm2-c2-tay': 'Nam châm',
      'm2-c3-cam-bien': 'Cảm ứng từ',
      'm2-c4-san': 'Bãi tái chế: hố và đệm từ',
      'demo-ben-song': 'Bến sông (demo)',
      'demo-nong-trai': 'Nông trại (demo)'
    }
  };

  /** Chương `ma` thuộc đợt 2 (mở sau khi thắng trùm chương cổng)? Dự án này chưa dùng đợt 2. */
  API.laDot2 = function (ma) { return API.dot2.indexOf(ma) >= 0; };

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ThuTuChuong = API;
})();
