/* ============================================================================
   thu-tu-chuong.js — diem10code-python: THỨ TỰ CÁC CHƯƠNG (window.ThuTuChuong).

   Dự án tách từ doi-robot-chan-hung (31/10 → 5/11): CHỈ GIỮ các mùa "cốt lõi" khớp
   chương trình Tin học lớp 12 ôn thi đại học (không cần tuple, dict/set, mảng 2
   chiều). Cả 4 mùa đã dựng theo khuôn 4 cột × 8 hàng (man-m1-*.js … man-m4-*.js), xem hoc/KE-HOACH-4-MUA-COT-LOI.md.

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
      'm3-c1-than', 'm3-c2-tay', 'm3-c3-cam-bien', 'm3-c4-san',                       // mùa 3: chuỗi part Xuồng + Nam châm + Cảm ứng từ → + Lưới phao → + Camera màu → sân riêng
      'm4-c1-than', 'm4-c2-tay', 'm4-c3-cam-bien', 'm4-c4-san',
      'm5-c1-co-san', 'm5-c2-hai-xe', 'm5-c3-chon-xe', 'm5-c4-lap-part'],                                                 // mùa 5: hai xe, độ tự do tăng dần theo cột (cột 3 Chọn xe, cột 4 Lắp part làm sau)                       // mùa 4: chuỗi part Drone + Lưới phao + Camera → + Vòi phun → + Hồng ngoại
    dot2: [],
    congDot2: null,
    mua: [
      { ma: 'mua-1', ten: 'Kho hàng' },
      { ma: 'mua-2', ten: 'Bãi tái chế' },
      { ma: 'mua-3', ten: 'Bến sông' },
      { ma: 'mua-4', ten: 'Nông trại' },
      { ma: 'mua-5', ten: 'Đồng đội' }
    ],
    goi: [
      // không khai `sao`: gói sau mở khi đủ một nửa số sao tối đa của các gói trước (mo-goi.js), nên 4 cột mở lần lượt: thân → +tay → +cảm biến → +sân
      { ma: 'm1-c1-than', ten: 'Hai bánh', hinh: 'm1-c1-than', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c1-than'] },
      { ma: 'm1-c2-tay', ten: 'Tay kẹp', hinh: 'm1-c2-tay', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c2-tay'] },
      { ma: 'm1-c3-cam-bien', ten: 'Cảm biến khoảng cách', hinh: 'm1-c3-cam-bien', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c3-cam-bien'] },
      { ma: 'm1-c4-san', ten: 'Kho hàng: nút đè', hinh: 'm1-c4-san', loai: 'bo-phan', mua: 'mua-1', chuong: ['m1-c4-san'] },
      { ma: 'm2-c1-than', ten: 'Thân nhện', hinh: 'm2-c1-than', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c1-than'] },
      { ma: 'm2-c2-tay', ten: 'Nam châm', hinh: 'm2-c2-tay', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c2-tay'] },
      { ma: 'm2-c3-cam-bien', ten: 'Cảm ứng từ', hinh: 'm2-c3-cam-bien', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c3-cam-bien'] },
      { ma: 'm2-c4-san', ten: 'Bãi tái chế: hố và đệm từ', hinh: 'm2-c4-san', loai: 'bo-phan', mua: 'mua-2', chuong: ['m2-c4-san'] },
      { ma: 'm3-c1-than', ten: 'Thân xuồng', hinh: 'm3-c1-than', loai: 'bo-phan', mua: 'mua-3', chuong: ['m3-c1-than'] },
      { ma: 'm3-c2-tay', ten: 'Lưới phao', hinh: 'm3-c2-tay', loai: 'bo-phan', mua: 'mua-3', chuong: ['m3-c2-tay'] },
      { ma: 'm3-c3-cam-bien', ten: 'Camera màu', hinh: 'm3-c3-cam-bien', loai: 'bo-phan', mua: 'mua-3', chuong: ['m3-c3-cam-bien'] },
      { ma: 'm3-c4-san', ten: 'Bến sông: dòng nước và cống', hinh: 'm3-c4-san', loai: 'bo-phan', mua: 'mua-3', chuong: ['m3-c4-san'] },
      { ma: 'm4-c1-than', ten: 'Thân drone', hinh: 'm4-c1-than', loai: 'bo-phan', mua: 'mua-4', chuong: ['m4-c1-than'] },
      { ma: 'm4-c2-tay', ten: 'Vòi phun', hinh: 'm4-c2-tay', loai: 'bo-phan', mua: 'mua-4', chuong: ['m4-c2-tay'] },
      { ma: 'm4-c3-cam-bien', ten: 'Hồng ngoại', hinh: 'm4-c3-cam-bien', loai: 'bo-phan', mua: 'mua-4', chuong: ['m4-c3-cam-bien'] },
      { ma: 'm4-c4-san', ten: 'Nông trại: tưới và gieo', hinh: 'm4-c4-san', loai: 'bo-phan', mua: 'mua-4', chuong: ['m4-c4-san'] },
      { ma: 'm5-c1-co-san', ten: 'Xe có sẵn', hinh: 'm5-c1-co-san', loai: 'bo-phan', mua: 'mua-5', chuong: ['m5-c1-co-san'] },
      { ma: 'm5-c2-hai-xe', ten: 'Hai chương trình', hinh: 'm5-c2-hai-xe', loai: 'bo-phan', mua: 'mua-5', chuong: ['m5-c2-hai-xe'] },
      { ma: 'm5-c3-chon-xe', ten: 'Chọn xe', hinh: 'm5-c3-chon-xe', loai: 'bo-phan', mua: 'mua-5', chuong: ['m5-c3-chon-xe'] },
      { ma: 'm5-c4-lap-part', ten: 'Lắp part', hinh: 'm5-c4-lap-part', loai: 'bo-phan', mua: 'mua-5', chuong: ['m5-c4-lap-part'] }
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
      'm3-c1-than': 'Thân xuồng',
      'm3-c2-tay': 'Lưới phao',
      'm3-c3-cam-bien': 'Camera màu',
      'm3-c4-san': 'Bến sông: dòng nước và cống',
      'm4-c1-than': 'Thân drone',
      'm4-c2-tay': 'Vòi phun',
      'm4-c3-cam-bien': 'Hồng ngoại',
      'm4-c4-san': 'Nông trại: tưới và gieo'
    }
  };

  /** Chương `ma` thuộc đợt 2 (mở sau khi thắng trùm chương cổng)? Dự án này chưa dùng đợt 2. */
  API.laDot2 = function (ma) { return API.dot2.indexOf(ma) >= 0; };

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ThuTuChuong = API;
})();
