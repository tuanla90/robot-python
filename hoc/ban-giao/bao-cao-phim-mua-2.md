# Báo cáo dựng phim gói Mùa 2 (Nhà máy · Xe cứu hỏa R1)

- Nhánh: `claude/phim-clb`
- Worktree: `D:\Users\tuanla2\game\doi-robot-phim-clb-wt`

## Tệp đã tạo / sửa
- `phim-clb/src/doc/kit-doc.tsx`: thêm ngữ cảnh `MuaCtx` (mặc định `'m1'`) và prop `mua` tuỳ chọn cho `NenHienTruong`, `ODat`, `Vat`, `Xe`, `TrongXe`, `CauTreo` (kèm `xoay` cho `CauTreo`), giữ nguyên 100% hành vi của Mùa 1.
- `phim-clb/tools/xuat-m2.mjs`: xuất 34 ảnh PNG vào `phim-clb/public/robot/m2/`:
  - Robot R1 & R2 (21 ảnh `576x576`): `r1-banh`, `r1-banh-ngac`, `xich`, `xich-vui`, `xich-ngac`, `xich-voi`, `xich-voi-vui`, `xich-voi-ngac`, `xich-voi-phun`, `xich-hn`, `xich-hn-vui`, `xich-hn-ngac`, `xich-hn-do`, `xich-hn-phun`, `du` (xích + vòi nước + mắt hồng ngoại + lưỡi ủi trước mũi), `du-vui`, `du-ngac`, `du-do`, `du-phun`, `r2`, `r2-vui`.
  - Ô sân & vật (13 ảnh `320x320`): `o-bang`, `o-nut-ban`, `o-nut-ban-mo`, `o-lua-nho`, `o-lua`, `o-lua-tat`, `o-cua`, `o-nut-de`, `o-dich`, `o-rao`, `vat-thung-nang`, `vat-thung-go`, `vat-bong`.
- `phim-clb/src/doc/m2.tsx`: 686 dòng, xuất `PHIM_M2` gồm đủ 20 composition (`M2G1-Mo`, `M2G1-Ket` … `M2G10-Mo`, `M2G10-Ket`) bám sát kịch bản mục 3 `hoc/KICH-BAN-PHIM-GOI-CLB.md`:
  - Người nhờ: cô Hạnh (`hanh-a.png`).
  - Đồng hồ: `DongHoApSuat` kim nhích dần về vùng đỏ, nhấp nháy khi nguy cấp.
  - Bảng thành tựu: `XuongBar` (3 phân xưởng sáng đèn theo tiến độ) + `BangViec` (10 hạng mục cứu hộ nhà máy) + bước lùi ở `M2G6-Ket` (lửa bùng lại ở phòng vật tư, đèn phân xưởng 2 tắt, mục số 5 bị đánh dấu đỏ).
  - Gieo hạt từ Gói 1: đốm lửa nhỏ sau hàng rào góc `(4, 0)`, bùng to ở Gói 6, dập tắt hoàn toàn ở Gói 10.
  - Liên kết Mùa 1 → Mùa 2 ở Gói 8 (thùng gỗ từ kho chú Tư kèm bộ đàm) và Gói 9 (R2 hai bánh + tay kẹp giữ băng chuyền).
  - Gói 10: cảnh Sola thả tay, R1 tự vượt khu băng chuyền & buồng lò chính (tự đổi sang mức phun mạnh khi gặp van kẹt), đóng dấu `XUẤT XƯỞNG` ("Xe cứu hỏa R1"), khung `NGOÀI ĐỜI` và cảnh nhá Mùa 3 ("Hướng đi tiếp: Bãi tái chế bác Sáu").
- `phim-clb/src/index.ts`: đã đăng ký `...PHIM_M2`.

## Kết quả tự kiểm
- `tsc`: **PASS** (`node phim-clb/node_modules/typescript/bin/tsc -p phim-clb` → exit code 0).
- Số ảnh soát đã xuất và kiểm bằng mắt: **45 ảnh** đại diện cho toàn bộ 20 composition của Mùa 2 qua `tools/anh-soat-nhieu.mjs` (không có lỗi 404 tài nguyên).
- Các điểm đã tự phát hiện và sửa khi xem ảnh:
  1. Trong `xuat-m2.mjs`, mã tay vòi phun nước trong `VeVector` là `'hoi'` (không phải `'voi-nuoc'`) và ổ gắn mắt hồng ngoại là `'tren'`; đã sửa và kiểm tra lại ảnh `du.png`, `xich-hn-phun.png` hiển thị đầy đủ thân xích, vòi phun trước/sau, mắt hồng ngoại và lưỡi ủi.
  2. Trong `M2G10-Mo` (`ThaTay`), bóng thoại của Sola và Luna bị trùng khung `75..155`; đã tách Sola (`10..72`) và Luna (`78..155`) để không đè nhau.
  3. Trong `M2G10-Ket` (`NhaMua3`), nhãn xe chở phế liệu ở khung cuối hơi sát mép phải; đã thu gọn biên độ `xXe` về `80..210` để cân giữa khung.

## Chỗ cần người duyệt quyết
- Cô Hạnh hiện dùng ảnh `nguoi/hanh-a.png` (có sẵn `hanh-b.png` nếu muốn đổi).
- Cảnh `NgoaiDoiM2` đang để khung chờ ảnh minh hoạ TopView giống `NgoaiDoi` của Mùa 1.
