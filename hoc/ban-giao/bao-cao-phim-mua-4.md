# Báo cáo dựng phim gói Mùa 4 (Nông trại hoa · Drone nông nghiệp R1)

- Nhánh: `claude/phim-clb`
- Worktree: `D:\Users\tuanla2\game\doi-robot-phim-clb-wt`

## Tệp đã tạo / sửa
- `phim-clb/tools/xuat-m4.mjs`: xuất 43 ảnh PNG vào `phim-clb/public/robot/m4/`:
  - Robot R1 & R2 (24 ảnh `576x576`): `nhen`, `nhen-ngac`, `drone` (có **lồng bảo vệ cánh quạt** đồng tâm quanh 4 mô-tơ), `drone-vui`, `drone-ngac`, `drone-dau`, `drone-son`, `drone-son-vui`, `drone-son-ngac`, `drone-son-red`, `drone-son-yellow`, `drone-son-blue`, `drone-son-green`, `drone-cam`, `drone-cam-vui`, `drone-cam-ngac`, `drone-cam-do`, `drone-cam-dau`, `drone-cam-red`, `drone-cam-yellow`, `drone-cam-blue`, `drone-cam-green`, `r2` (nhện hồng + nam châm điện), `r2-vui`.
  - Ô sân & vật (19 ảnh `320x320`, đúng 4 màu `red`, `yellow`, `blue`, `green` — không có hoa tím/hồng): `o-co-non`, `o-bui-cay`, `o-sac`, `o-rao`, `o-ho`, `o-dich`, `o-luong-{red,yellow,blue,green}`, `o-hoa-{red,yellow,blue,green}`, `vat-khoi-sat`, `vat-bao-{red,yellow,blue,green}`.
- `phim-clb/src/doc/m4.tsx`: 605 dòng, xuất `PHIM_M4` gồm đủ 20 composition (`M4G1-Mo`, `M4G1-Ket` … `M4G10-Mo`, `M4G10-Ket`) bám sát kịch bản mục 5 `hoc/KICH-BAN-PHIM-GOI-CLB.md`:
  - Người nhờ: chị Lan (`lan-a.png`).
  - Đồng hồ: `DongHoTet` đếm ngược ngày hội Hoa Xuân.
  - Bảng thành tựu: `VuonHoaBar` (4 luống hoa Đỏ - Vàng - Lam - Lục) + `BangViec` (10 hạng mục gieo hoa đón Tết) + bước lùi ở `M4G6-Ket` (gió đêm thổi bung tấm bạt làm rơi thẻ màu xuống dưới mặt luống, mục số 5 bị đánh dấu đỏ).
  - Gieo hạt từ Gói 1: tấm bạt chắn gió ở góc `(4, 0)` lay nhẹ từ Gói 1–5, bung chốt ở Gói 6.
  - Liên kết Mùa 3 → Mùa 4 ở Gói 8 (dãy chậu nhựa tái chế 4 màu từ bãi bác Sáu gửi sang) và Gói 9 (R2 chân nhện nam châm từ Mùa 3 bò dưới đất hút tấm sắt đè luống hoa và trạm sạc cho R1 drone bay gieo trên cao).
  - Gói 10: cảnh Sola thả tay, R1 tự đọc màu mẫu gieo dải hoa 4 màu & tự canh `battery()` đáp xuống trạm sạc `P` (`land()`) nạp đầy pin rồi `take_off()` hoàn tất thảm hoa Tết, đóng dấu `XUẤT XƯỞNG` ("Drone nông nghiệp R1"), khung `NGOÀI ĐỜI` và cảnh nhá Mùa 5 ("Trạm địa chất · Đường đèo đang bị đá lở chắn ngang!").
- `phim-clb/src/index.ts`: đã đăng ký `...PHIM_M4`.

## Kết quả tự kiểm
- `tsc`: **PASS** (`node phim-clb/node_modules/typescript/bin/tsc -p phim-clb` → exit code 0).
- Số ảnh soát đã xuất và kiểm bằng mắt: **45 ảnh** đại diện cho toàn bộ 20 composition của Mùa 4 qua `tools/anh-soat-nhieu.mjs` (không có lỗi 404 tài nguyên).
- Các điểm đã tự phát hiện và sửa khi xem ảnh:
  1. Trong `xuat-m4.mjs`, lần xuất đầu tiên `VeVector.diemTrenO` tính theo `CANH = 480` trong khi canvas của `VeRobot.veCo` có kích thước `576x576`, làm lồng bảo vệ cánh quạt hơi lệch tâm so với vành cánh; đã sửa lại phép biến đổi toạ độ theo `cv.width` để 4 lồng bảo vệ cánh quạt đồng tâm tuyệt đối với 4 mô-tơ.
  2. Trong `VuonHoaBar` (`M4G6-Ket-225.png`), nhãn 4 thẻ màu hoa bị xuống dòng làm chiều cao thẻ chạm vào kẹp bảng `BangViec`; đã rút gọn nhãn thành `Hoa Đỏ`, `Hoa Vàng`, `Hoa Lam`, `Cỏ Xanh` (`whiteSpace: 'nowrap'`).

## Chỗ cần người duyệt quyết
- Chị Lan hiện dùng ảnh `nguoi/lan-a.png` (có sẵn `lan-b.png` nếu muốn đổi).
- Cảnh `NgoaiDoiM4` đang để khung chờ ảnh minh hoạ TopView giống các mùa trước.
