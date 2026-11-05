/* ============================================================================
   thu-tu-chuong.js — diem10code-python: THỨ TỰ CÁC CHƯƠNG (window.ThuTuChuong).

   Dự án tách từ doi-robot-chan-hung (31/10 → 5/11): CHỈ GIỮ các mùa "cốt lõi" khớp
   chương trình Tin học lớp 12 ôn thi đại học (không cần tuple, dict/set, mảng 2
   chiều). Mỗi mùa hiện mới có MỘT chương demo (để chứng minh khung game chạy
   được); màn thật sẽ viết dần, xem README.md.

   - mua-1 Kho hàng    (hai bánh) — def, for, if/while
   - mua-2 Nhà máy     (xích)     — biến, tham số
   - mua-3 Bãi tái chế (nhện)     — chuỗi, logic and/or/elif
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
    thuTu: ['demo-kho-hang', 'demo-nha-may', 'demo-bai-tai-che', 'demo-nong-trai'],
    dot2: [],
    congDot2: null,
    mua: [
      { ma: 'mua-1', ten: 'Kho hàng' },
      { ma: 'mua-2', ten: 'Nhà máy' },
      { ma: 'mua-3', ten: 'Bãi tái chế' },
      { ma: 'mua-4', ten: 'Nông trại' }
    ],
    goi: [
      { ma: 'demo-kho-hang', ten: 'Kho hàng (demo)', sao: 0, mua: 'mua-1', chuong: ['demo-kho-hang'] },
      { ma: 'demo-nha-may', ten: 'Nhà máy (demo)', sao: 0, mua: 'mua-2', chuong: ['demo-nha-may'] },
      { ma: 'demo-bai-tai-che', ten: 'Bãi tái chế (demo)', sao: 0, mua: 'mua-3', chuong: ['demo-bai-tai-che'] },
      { ma: 'demo-nong-trai', ten: 'Nông trại (demo)', sao: 0, mua: 'mua-4', chuong: ['demo-nong-trai'] }
    ],
    ten: {
      'demo-kho-hang': 'Kho hàng (demo)',
      'demo-nha-may': 'Nhà máy (demo)',
      'demo-bai-tai-che': 'Bãi tái chế (demo)',
      'demo-nong-trai': 'Nông trại (demo)'
    }
  };

  /** Chương `ma` thuộc đợt 2 (mở sau khi thắng trùm chương cổng)? Dự án này chưa dùng đợt 2. */
  API.laDot2 = function (ma) { return API.dot2.indexOf(ma) >= 0; };

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ThuTuChuong = API;
})();
