# Báo cáo dựng phim gói Mùa 3 (Bãi tái chế · Robot phân loại R1)

- Nhánh: `claude/phim-clb`
- Worktree: `D:\Users\tuanla2\game\doi-robot-phim-clb-wt`

## Tệp đã tạo / sửa
- `phim-clb/src/doc/kit-doc.tsx`: bổ sung tuỳ chọn `goc?: number` trong `Bam` để vật đang hút bởi nhện (thân nhện không xoay hướng, luôn nhìn lên `0°`) nằm đúng ở gọng nam châm phía trước (`goc: -90`).
- `phim-clb/tools/xuat-m3.mjs`: xuất 32 ảnh PNG vào `phim-clb/public/robot/m3/`:
  - Robot R1 & R2 (18 ảnh `576x576`): `xich`, `xich-ngac`, `nhen`, `nhen-vui`, `nhen-ngac`, `nhen-nc`, `nhen-nc-vui`, `nhen-nc-ngac`, `nhen-nc-hut`, `nhen-tu`, `nhen-tu-vui`, `nhen-tu-ngac`, `nhen-tu-do`, `nhen-tu-n` (bật cực Đỏ N kèm sóng từ đỏ), `nhen-tu-s` (bật cực Xanh S kèm sóng từ xanh), `nhen-co` (co 6 chân lò xo chuẩn bị nhảy), `r2` (bánh xích hồng + lưỡi ủi), `r2-vui`.
  - Ô sân & vật (14 ảnh `320x320`): `o-ho`, `o-dem-tu-n`, `o-dem-tu-s`, `o-nut-de`, `o-cua`, `o-bang`, `o-nut-ban`, `o-nut-ban-mo`, `o-dich`, `vat-khoi-sat`, `vat-nam-cham-n`, `vat-nam-cham-s`, `vat-thung-go`, `vat-thung-nang`.
- `phim-clb/src/doc/m3.tsx`: 605 dòng, xuất `PHIM_M3` gồm đủ 20 composition (`M3G1-Mo`, `M3G1-Ket` … `M3G10-Mo`, `M3G10-Ket`) bám sát kịch bản mục 4 `hoc/KICH-BAN-PHIM-GOI-CLB.md`:
  - Người nhờ: bác Sáu (`sau-a.png`).
  - Đồng hồ: `DongHoBai` đếm ngược thời gian tới giờ xe thu mua phế liệu.
  - Bảng thành tựu: `BaThung` (3 thanh tiến độ Thùng Sắt - Thùng Gỗ - Thùng Nhựa) + `BangViec` (10 hạng mục phân loại bãi tái chế) + bước lùi ở `M3G6-Ket` (nam châm loa lăn xuống làm sạt đống mô-tơ nam châm đè lên Thùng Nhựa, mục số 5 bị đánh dấu đỏ).
  - Gieo hạt từ Gói 1: khối nam châm loa cũ chữ `N` đỏ nằm chênh vênh ở góc `(4, 0)` từ Gói 1–5, lăn xuống ở Gói 6.
  - Liên kết Mùa 2 → Mùa 3 ở Gói 8 (băng chuyền cũ từ nhà máy cô Hạnh gửi sang tái chế) và Gói 9 (R2 bánh xích + lưỡi ủi từ Mùa 2 sang ủi khối bê-tông nặng mở cổng cho R1 nhện nhảy qua rãnh).
  - Gói 10: cảnh Sola thả tay, R1 tự nhảy qua rãnh dò sắt & tự đọc cực từ đảo sang cực Xanh (`magnet_s()`) hút gọn khối nam châm cực Đỏ (`N`), đóng dấu `XUẤT XƯỞNG` ("Robot phân loại R1"), khung `NGOÀI ĐỜI` (cần cẩu nam châm điện) và cảnh nhá Mùa 4 ("Nông trại hoa chị Lan · Chuẩn bị vụ hoa Tết").
- `phim-clb/src/index.ts`: đã đăng ký `...PHIM_M3`.

## Kết quả tự kiểm
- `tsc`: **PASS** (`node phim-clb/node_modules/typescript/bin/tsc -p phim-clb` → exit code 0).
- Số ảnh soát đã xuất và kiểm bằng mắt: **45 ảnh** đại diện cho toàn bộ 20 composition của Mùa 3 qua `tools/anh-soat-nhieu.mjs` (không có lỗi 404 tài nguyên).
- Các điểm đã tự phát hiện và sửa:
  1. Thân nhện trong `VeRobot.veCo` luôn giữ góc `0°` (mắt nhìn lên `-y`), nên trong `xuat-m3.mjs` đã vẽ bổ sung gọng nam châm điện chữ U hai cực Đỏ (`N`) / Xanh (`S`) ở phía trước đầu nhện và thêm `goc: -90` vào `Bam` để vật đang hút nằm đúng trên đầu nam châm của nhện.
  2. Trong `CauTreo` của Mùa 3, truyền `xoay={0}` để robot nhện đứng thẳng hướng mặt trên sa bàn thay vì xoay ngang `-90°` như xe bánh.

## Chỗ cần người duyệt quyết
- Bác Sáu hiện dùng ảnh `nguoi/sau-a.png` (có sẵn `sau-b.png` nếu muốn đổi).
- Cảnh `NgoaiDoiM3` đang để khung chờ ảnh minh hoạ TopView giống Mùa 1 và Mùa 2.
