/* ============================================================================
   thu-tu-chuong.js — "Robot Chấn Hưng": THỨ TỰ CÁC CHƯƠNG (window.ThuTuChuong).

   MUỐN ĐỔI THỨ TỰ CHƯƠNG THÌ CHỈ SỬA MẢNG `thuTu` Ở DƯỚI. Không sửa chỗ nào khác.
   - Mỗi chương có MÃ cố định (chuỗi, không bao giờ đổi): đây là danh tính của chương.
   - Mỗi màn có MÃ cố định `ma` = chương + '.' + số (vd 'vong-lap.4'). Mã không đổi khi
     đổi thứ tự chương → dùng nó làm khóa lưu tiến độ.
   - `id` HIỂN THỊ của màn ("3.4") do ManHoc TÍNH khi nạp, từ vị trí của chương trong
     mảng `thuTu` (vị trí 0 → "1.x"). Đổi thứ tự thì id đổi theo.
   - Giao diện lưu tiến độ cần dùng `ma`, KHÔNG dùng `id`.

   Nạp tệp này TRƯỚC các tệp màn (man-chuoi-1.js trở đi).
   Chương mới: thêm mã vào `thuTu`, thêm tên vào `ten`, rồi viết tệp màn của chương
   (mỗi màn khai `chuong` và `so`, xem man-chuoi-1.js).
   THỨ TỰ MỚI (kế hoạch "Chế lệnh", 14/10, xem KE-HOACH-CHE-LENH.md): đợt 1 = hai-banh, xuong-ham, che-xe, tay-gap, vong-lap, khoang-cach (mỗi part chỉ mở vài
   lệnh gốc, người chơi tự chế hàm); đợt 2 = các chương còn lại, mở CÙNG LÚC khi thắng trùm của chương cổng (congDot2). Chỉ liệt kê chương ĐÃ CÓ tệp màn;
   ba chương chế lệnh (che-tay, che-lap, che-cam-bien) và robot-hoan-thien đã có tệp màn và nằm đúng vị trí trong mảng. Số chương hiển thị (id màn) đổi theo vị trí trong mảng.
   Chương 3 'che-xe' (Chế lệnh xe) nằm ở man-che-xe.js.
   Chương 10 'robot-hoan-thien' (Robot hoàn thiện, chương cổng mở đợt 2) nằm ở man-robot-hoan-thien.js.
   Chương 11 'hai-robot' (Đội hai robot: hai robot, hai chương trình, nhịp chung; 22/10, KE-HOACH-HAI-ROBOT.md) nằm ở man-hai-robot.js.
   Chương 'bang-chuyen' (Băng chuyền) nằm ở man-bang-chuyen.js.
   Chương 6 'tham-so' (Hàm có tham số) nằm ở man-tham-so.js.
   Chương 7 'nhen' (Thân nhện) nằm ở man-nhen.js.
   Chương 8 'xich' (Bánh xích) nằm ở man-xich.js.
   Chương 9 'omni' (Bánh omni) nằm ở man-omni.js.
   Chương 11 'khoang-cach' (Cảm biến khoảng cách) nằm ở man-khoang-cach.js.
   Chương 12 'mau' (Cảm biến màu) nằm ở man-mau.js.
   Chương 13 'nam-cham' (Nam châm) nằm ở man-nam-cham.js.
   Chương 14 'may-nem' (Máy ném) nằm ở man-may-nem.js.
   Chương 19 'sung-hoi' (Súng hơi) nằm ở man-sung-hoi.js; chương 20 'che-sung-hoi' (Chế lệnh súng hơi) nằm ở man-che-sung-hoi.js.
   Chương 'luc-ban' (Lực phun: spray("low") phun nhẹ / spray("high") phun mạnh, 26/10) nằm ở man-luc-ban.js, chương thứ ba của gói Súng hơi.
   Chương 16 'drone' (Drone) nằm ở man-drone.js.
   Chương 15 'list' (Danh sách) nằm ở man-list.js; chương 16 'che-list' (Chế lệnh danh sách) nằm ở man-che-list.js (17/10, gói List sau gói Nhện).
   Chương 'flycam' (Flycam: drone gắn camera nhìn xuống, look() + danh sách; chương CUỐI, cuối gói Drone) nằm ở man-flycam.js.

   Chạy được trong Node (module.exports) và trình duyệt (window.ThuTuChuong).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var API = {
    // 15/10 tối: mỗi bộ phận hai chương (làm quen + chế lệnh) — thêm che-xich, che-omni, che-mau, che-may-nem, che-drone; SÚNG HƠI (sung-hoi + che-sung-hoi:
    // spray() phun ra trước + giật lùi, spray_back() phun ra sau + giật tới đẩy thùng) thay TẤM ĐẨY và SÚNG BÓNG (hai chương cũ tam-day / sung-bong đã xóa).
    thuTu: ['hai-banh', 'xuong-ham', 'che-xe', 'tay-gap', 'che-tay', 'vong-lap', 'che-lap', 'khoang-cach', 'che-cam-bien', 'robot-hoan-thien', 'hai-robot',
      'bang-chuyen', 'tham-so', 'nhen', 'che-nhen', 'list', 'che-list', 'xich', 'che-xich', 'omni', 'che-omni', 'sung-hoi', 'che-sung-hoi', 'luc-ban', 'mau', 'che-mau', 'may-son', 'che-may-son', 'rap-nao',
      'nam-cham', 'che-nam-cham', 'tay-xoay', 'che-tay-xoay', 'may-nem', 'che-may-nem', 'rap-tay', 'drone', 'che-drone', 'flycam', 'rap-du'],
    // các chương đợt 2 (khóa tới khi thắng trùm của chương cổng)
    dot2: ['hai-robot', 'bang-chuyen', 'tham-so', 'nhen', 'che-nhen', 'list', 'che-list', 'xich', 'che-xich', 'omni', 'che-omni', 'sung-hoi', 'che-sung-hoi', 'luc-ban', 'mau', 'che-mau', 'may-son', 'che-may-son', 'rap-nao',
      'nam-cham', 'che-nam-cham', 'tay-xoay', 'che-tay-xoay', 'may-nem', 'che-may-nem', 'rap-tay', 'drone', 'che-drone', 'flycam', 'rap-du'],
    // chương cổng: thắng trùm chương này (Robot hoàn thiện, chương 10 cuối đợt 1) thì mở cả đợt 2.
    // (15/10: màn chọn đã chuyển sang GÓI mở bằng tổng sao, xem `goi` dưới; dot2 / congDot2 chỉ còn dùng để ghi nhãn và cho máy kiểm.)
    congDot2: 'robot-hoan-thien',
    // GÓI (kiểu hộp của Cut the Rope, user chốt 15/10): mỗi gói là MỘT bộ phận (chương làm quen + chương chế lệnh của nó) hoặc MỘT logic mới.
    // Màn hình: khởi đầu → chọn gói (lướt ngang) → lưới màn của gói. Gói mở khi TỔNG SAO đủ (luật ở game/mo-goi.js); khai `sao: n` thì dùng đúng n.
    // `loai` (22/10): 'bo-phan' = một bộ phận robot (phim mở đầu: R1 đi tìm lại) · 'khai-niem' = một ý Python / kiểu sân mới (mặc định)
    //   · 'thu-thach' = chặng tổng hợp 10 màn, không dạy món mới (hộp màu vàng "THỬ THÁCH"). Cỡ gói: món mới 20 màn, thử thách 10 màn.
    // `hinh`: mã chương lấy huy hiệu làm hình hộp (mặc định chương đầu). Chương không có trong gói nào thì tự thành một gói riêng, đứng đúng chỗ trong `thuTu`.
    // MÙA (22/10, kiểu episode của Angry Birds): mùa 1 là lộ trình chính. GÓI MỞ RỘNG thêm vào MÙA MỚI, không chen vào giữa mùa 1:
    //   1. thêm chương mới vào CUỐI thuTu, viết tệp màn; 2. thêm mùa vào `mua` với điều kiện `mo` ({ goi: 'cam-bien' } = qua hết gói đó,
    //   hay { sao: 200, mua: 'mua-1' } = đủ 200 sao ở mùa 1); 3. thêm gói với `mua: '<mã mùa>'` (không khai `sao` thì tự tính trong mùa).
    // `sao` của các gói khai CỨNG (mùa 1 bằng công thức TI_LE_SAO lúc 22/10; mùa 2–4 trừ đi ngưỡng của gói đầu mùa, 25/10): sửa danh sách gói sau này không làm đổi ngưỡng đã công bố.
    // BÁN THEO MÙA (25/10): mùa 1 miễn phí; mùa có `ban` chỉ mở khi đã mua (Luu.daMua, mo-goi.js). `ban.gia` là giá hiện trên nút mua thử
    //   (chưa nối thanh toán thật). Sao của các gói mùa sau tính TRONG MÙA (gói đầu mùa cần 0 ★), nên người mua thẳng mùa sau vẫn chơi được;
    //   hàm cốt truyện của các mùa trước tự nạp vào kho khi vào màn (ung-dung.js, App.vaoMan).
    mua: [
      { ma: 'mua-1', ten: 'Xưởng R1' },
      // `an: true` (user 27/10): mùa chưa dựng lại theo khuôn 10 gói (KE-HOACH-7-MUA.md) thì ẩn khỏi màn chọn gói; bảng Gỡ lỗi "Mở hết" vẫn hiện để thử.
      // Mùa 2 "Ghi nhớ" đủ 10 gói × 20 màn (29/10): hiện ở màn chọn gói; ngưỡng sao gói khai cứng ở MUA_2 (lo-trinh-hoc.js).
      { ma: 'mua-2', ten: 'Ghi nhớ', ban: { gia: '49.000đ' } },
      // Mùa 3 "Mỏ quặng" đủ 10 gói × 20 màn (30/10, user cho chơi thử): hiện ở màn chọn gói.
      { ma: 'mua-3', ten: 'Công cụ', ban: { gia: '49.000đ' } },
      { ma: 'mua-4', ten: 'Bầu trời', ban: { gia: '49.000đ' }, an: true }
    ],
    goi: [
      { ma: 'xe', ten: 'Xe hai bánh', sao: 0, chuong: ['hai-banh'] },
      { ma: 'ham', ten: 'Xưởng hàm', sao: 15, chuong: ['xuong-ham', 'che-xe'] },
      { ma: 'tay-gap', ten: 'Tay gắp', loai: 'bo-phan', sao: 45, chuong: ['tay-gap', 'che-tay'] },
      { ma: 'vong-lap', ten: 'Vòng lặp', sao: 75, chuong: ['vong-lap', 'che-lap'] },
      { ma: 'cam-bien', ten: 'Cảm biến', loai: 'bo-phan', sao: 105, chuong: ['khoang-cach', 'che-cam-bien'] },
      { ma: 'robot', ten: 'Robot hoàn thiện', loai: 'thu-thach', sao: 135, chuong: ['robot-hoan-thien'] },
      { ma: 'hai-robot', ten: 'Đội hai robot', loai: 'thu-thach', mua: 'mua-2', sao: 0, chuong: ['hai-robot'] },                 // 22/10 hai robot, hai chương trình, nhịp chung (KE-HOACH-HAI-ROBOT.md)
      { ma: 'bang-chuyen', ten: 'Đường dài', mua: 'mua-2', sao: 15, chuong: ['bang-chuyen', 'tham-so'] },       // 22/10: gộp Băng chuyền + Hàm có tham số (mỗi chương 10 màn đứng lẻ) thành một gói 20 màn
      { ma: 'nhen', ten: 'Thân nhện', loai: 'bo-phan', mua: 'mua-2', sao: 45, chuong: ['nhen', 'che-nhen'] },
      { ma: 'list', ten: 'Danh sách', mua: 'mua-2', sao: 75, chuong: ['list', 'che-list'] },                   // 17/10: list ngay sau chuỗi chữ của nhện (KE-HOACH-LIST-FLYCAM.md)
      { ma: 'xich', ten: 'Bánh xích', loai: 'bo-phan', mua: 'mua-2', sao: 105, chuong: ['xich', 'che-xich'] },
      { ma: 'omni', ten: 'Bánh omni', loai: 'bo-phan', mua: 'mua-2', sao: 135, chuong: ['omni', 'che-omni'] },
      { ma: 'sung-hoi', ten: 'Vòi phun', loai: 'bo-phan', mua: 'mua-3', sao: 0, chuong: ['sung-hoi', 'che-sung-hoi', 'luc-ban'] },        // 26/10: thêm chương Lực phun (spray("low") / spray("high"))
      { ma: 'mau', ten: 'Cảm biến màu', loai: 'bo-phan', mua: 'mua-3', sao: 30, chuong: ['mau', 'che-mau'] },
      { ma: 'may-son', ten: 'Máy sơn', loai: 'bo-phan', mua: 'mua-3', sao: 60, chuong: ['may-son', 'che-may-son'] },       // 25/10 tô màu: chấm, nét liền qua góc, chọn màu (KE-HOACH-MAY-SON.md)
      { ma: 'rap-nao', ten: 'Lắp ráp: Thân + Não', loai: 'thu-thach', mua: 'mua-3', sao: 90, chuong: ['rap-nao'] },            // 17/10 chế độ lắp ráp (KE-HOACH-LAP-RAP.md): tự chọn part dưới ngân sách
      { ma: 'nam-cham', ten: 'Nam châm', loai: 'bo-phan', mua: 'mua-3', sao: 105, chuong: ['nam-cham', 'che-nam-cham'] },
      { ma: 'tay-xoay', ten: 'Tay xoay', loai: 'bo-phan', mua: 'mua-4', sao: 0, chuong: ['tay-xoay', 'che-tay-xoay'] },
      { ma: 'may-nem', ten: 'Máy ném', loai: 'bo-phan', mua: 'mua-4', sao: 30, chuong: ['may-nem', 'che-may-nem'] },
      { ma: 'rap-tay', ten: 'Lắp ráp: Thân + Tay', loai: 'thu-thach', mua: 'mua-4', sao: 60, chuong: ['rap-tay'] },
      { ma: 'drone', ten: 'Drone', loai: 'bo-phan', mua: 'mua-4', sao: 75, chuong: ['drone', 'che-drone'] },
      { ma: 'flycam', ten: 'Flycam', loai: 'bo-phan', mua: 'mua-4', sao: 105, chuong: ['flycam'] },              // 22/10 tách khỏi gói Drone: drone gắn camera nhìn xuống, look() + list (17/10)
      { ma: 'rap-du', ten: 'Lắp ráp: Đủ bộ', loai: 'thu-thach', mua: 'mua-4', sao: 120, chuong: ['rap-du'] }
    ],
    ten: {
      'hai-banh': 'Hai bánh',
      'xuong-ham': 'Xưởng hàm',
      'che-xe': 'Chế lệnh xe',
      'tay-gap': 'Tay gắp',
      'che-tay': 'Chế lệnh tay',
      'vong-lap': 'Vòng lặp',
      'che-lap': 'Chế lệnh có for',
      'che-cam-bien': 'Chế lệnh có if, while',
      'robot-hoan-thien': 'Robot hoàn thiện',
      'hai-robot': 'Đội hai robot',
      'bang-chuyen': 'Băng chuyền',
      'tham-so': 'Hàm có tham số',
      'nhen': 'Thân nhện',
      'che-nhen': 'Chế lệnh nhện',
      'xich': 'Bánh xích',
      'omni': 'Bánh omni',
      'khoang-cach': 'Cảm biến khoảng cách',
      'mau': 'Cảm biến màu',
      'nam-cham': 'Nam châm',
      'che-nam-cham': 'Chế lệnh nam châm',
      'tay-xoay': 'Tay xoay',
      'che-tay-xoay': 'Chế lệnh tay xoay',
      'may-nem': 'Máy ném',
      'drone': 'Drone',
      'che-xich': 'Chế lệnh xích',
      'che-omni': 'Chế lệnh omni',
      'sung-hoi': 'Vòi phun',
      'che-sung-hoi': 'Chế lệnh vòi phun',
      'luc-ban': 'Lực phun',
      'che-mau': 'Chế lệnh màu',
      'may-son': 'Máy sơn',
      'che-may-son': 'Chế lệnh máy sơn',
      'che-may-nem': 'Chế lệnh máy ném',
      'che-drone': 'Chế lệnh drone',
      'list': 'Danh sách',
      'che-list': 'Chế lệnh danh sách',
      'flycam': 'Flycam',
      'rap-nao': 'Lắp ráp: Thân + Não',
      'rap-tay': 'Lắp ráp: Thân + Tay',
      'rap-du': 'Lắp ráp: Đủ bộ'
    }
  };

  /** Chương `ma` thuộc đợt 2 (mở sau khi thắng trùm chương cổng)? */
  API.laDot2 = function (ma) { return API.dot2.indexOf(ma) >= 0; };

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ThuTuChuong = API;
})();
