# Kế hoạch mùa 1 "Xưởng R1" theo khuôn 10 gói (26/10/2026, khuôn ĐÃ DUYỆT, danh sách màn CHƯA DUYỆT)

Khuôn chung ở [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md), mục "Bố cục chuẩn": 10 gói × 2 chương × 10 màn = **200 màn**.
Chương 1 của gói là làm quen, chương 2 là "hàm cho …" (chế lệnh). Bản 9 gói / 160 màn trước đây bị thay.

Rà từng màn hiện có (script đọc lời giải, tính bắc cầu qua hàm của em): lệnh lùi, cảm biến bên, biến, tay xoay, `for` / `if` / `while`, hàm cần và hàm tạo ra.
Ràng buộc: không màn nào trước gói 5 gọi lệnh lùi; trước gói 7 gọi `left_clear` / `right_clear`; trước gói 2 chương 2 dùng `for`; mùa 1 không còn biến (sang mùa 2).
Giữ nguyên `ma` của mọi màn (khóa lưu sao); chỉ đổi chương / thứ tự ở lớp lộ trình `lo-trinh-hoc.js`.

## Trạng thái
- **27/10 gói A xong** (commit fa377d6, 7c501bd, 8043010): mùa 1 đã thành 10 gói bằng màn có sẵn (gói 9 Combo chưa có nên chưa hiện).
  Khác bảng: doi-tay-xoay neo sau `che-doi-nam-cham` (neo `che-nam-cham` thì chen trước Đội nam châm); tắt nhóm ĐẾM (`bienDem`) cho mọi màn mùa 1;
  cam-bien-ben.9 thành trùm chương 1 gói 7 (chương đủ 10 thì màn cuối là trùm); robot-hoan-thien.10 nhận `bounce` / `fetch_back` thành hàm của màn khóa (người chơi vẫn XEM được code có biến trong hai hàm đó: cất màn này khi gói 10 có 10 trùm mới).

## Danh sách 10 gói

| Gói | Chương 1 (10) | Chương 2 (10) | Có | Mới | Sửa |
|---|---|---|---|---|---|
| **1 Xe hai bánh** | `hai-banh` 1–10 | **Hàm cho xe** (`def`): `xuong-ham` 1–10 | 20 | 0 | xuong-ham.6: bỏ bậc thang `S` |
| **2 Tay gắp** | `tay-gap` 1–10 | **Vòng lặp** (`for`): `vong-lap` 1–6, 8, 9, 10 + `che-lap.5` "Dọn hàng" (lặp nhặt / thả) | 20 | 0 | 2 màn vong-lap thêm tay (để chương 2 đúng "hàm cho tay") |
| **3 Cảm biến khoảng cách** | `khoang-cach` 1–6, 8, 9, 10 + 1 mới | **Hàm cho cảm biến** (`if`, `while`): `che-cam-bien` 1, 2, 3, 7 + 6 mới | 13 | 7 | |
| **4 Kho hàng** (thùng gỗ, ô đích, **nút đè**) | 10 mới: làm quen nút đè (đặt thùng lên `M` giữ cửa mở) | **Hàm cho kho**: `che-tay` 1, 2, 3, 4, 6, 8, 10 + `che-xe` 1, 2, 3 (né thùng) | 10 | 10 | |
| **5 Bánh lùi** | `che-xe` 4, 5, 6, 7, 8, 9 + 4 mới | **Hàm có lùi**: `che-xe.10` (trùm Bãi đỗ xe) + `che-tay` 5, 7, 9 + `che-lap` 7, 9 + 4 mới | 12 | 8 | đo lại sao các màn có `u_turn()` |
| **6 Tay xoay** | `tay-xoay` 1–10 | `che-tay-xoay` 1–10 | 20 | 0 | (dời nguyên từ mùa 4) |
| **7 Cảm biến bên** | `che-cam-bien.4` (tạo `to_gap`) + `cam-bien-ben` 1–9 | **Dò đường**: `me-cung` 1–10 | 20 | 0 | |
| **8 Đội** | `hai-robot` 1–10 (dời từ mùa 2) | 10 mới: hai robot dùng tay xoay / cảm biến bên | 10 | 10 | |
| **9 Combo** | 10 mới: **tay xoay + cảm biến bên** ("nhìn bên nào có thùng, xoay tay nhặt bên đó") | `che-cam-bien.10` "Kho hàng" (lùi + bên) + 9 mới | 1 | 19 | che-cam-bien.10 (xem mục Vướng) |
| **10 Trùm mùa** | **Tổng hợp**: `robot-hoan-thien` 1–8, 10 + `cam-bien-ben.10` "Hành lang tự lái" | **Trùm mùa**: 10 mới (lùi + tay xoay + cảm biến bên + `while`) | 10 | 10 | robot-hoan-thien.10 (xem mục Vướng) |
| | | **Tổng** | **136** | **64** | |

## Dời / cất

| Màn | Đi đâu | Vì sao |
|---|---|---|
| che-cam-bien.5, .6, .9 · robot-hoan-thien.9 | **mùa 2** (gói 1 chương 2, giới thiệu biến) | dùng biến đếm |
| vong-lap.7 "Lệch một" | cất khỏi lộ trình | trùng ý (và tên) với che-lap.8 |
| che-lap 1, 2, 3, 4, 6, 8, 10 | cất khỏi lộ trình | vòng lặp cho thân: dư so với khuôn (gói 2 chương 2 chỉ còn 10 màn). Hàm chúng tạo (`dash`, `square`, `zigzag`, `ring`) không màn nào khác cần |
| khoang-cach.7 | cất | dùng cảm biến bên sớm; trùng ý me-cung.1 |
| che-cam-bien.8 "Sửa hàm lỗi" | cất (hoặc thay một màn me-cung) | dùng cảm biến bên; chương 7 đã đủ 20 |

"Cất" = bỏ khỏi lộ trình xuất bản, **vẫn nằm trong ngân hàng màn** (`man-*.js`), không mất, dùng lại được ở mùa 7.

## Vướng cần biết
1. **Hàm cần của màn ở lại mà màn tạo ra nó dời đi:**
   - `robot-hoan-thien.10` và `che-cam-bien.10` cần `fetch_back` (che-cam-bien.9) và `bounce` (che-cam-bien.5), hai màn này sang mùa 2. Cách gỡ: cho hai hàm đó thành **hàm của màn** (khóa, đưa sẵn), hay viết lại hai màn.
   - Mọi hàm khác đều còn: `dodge_left` / `dodge_right` (che-xe.1, .2) vẫn ở mùa 1 (gói 4) nên các gói đội mùa sau cần chúng không vỡ; `row`, `bend_left`, `bend_right` (vong-lap.10) giữ cho `bang-chuyen.8`.
2. **Hộp màu ở mùa 1** (che-tay.6, .10, che-tay-xoay.5, .6, .10, robot-hoan-thien.4): màu ở đây chỉ để **người chơi** phân biệt thùng ("đổi chỗ đỏ và xanh"), robot không đọc màu.
   **User chốt 26/10: giữ nguyên**, coi là thùng gỗ có nhãn màu, **nhá hàng** cho mùa 4 (mùa 4 mới có camera đọc màu, sàn màu, hộp màu thật).
3. **Bậc thang:** chỉ xuong-ham.6 ở mùa 1 có `S` (xe hai bánh không leo được, dùng như tường). Sửa thành tường thường.
4. **Gói 2 chương 2:** vong-lap hiện chỉ dạy `for` trên thân, chưa có tay. Thêm tay vào 2 màn cuối (và che-lap.5 đã có) để đúng "hàm cho tay".
5. **Thứ tự:** che-tay (hàm cho tay) dời từ ngay sau Tay gắp xuống gói 4. Tay xoay (gói 6) cần `put_right` (che-tay.2) và Đội (gói 8) cần `put_right`, `back`: đều đứng trước, không vỡ.

## Màn mới cần viết (64)

| Gói | Số | Nội dung gợi ý |
|---|---|---|
| 3 | 1 + 6 | thay khoang-cach.7: `while front_clear()` mang thùng · chế hàm có `if` / `while` chỉ dùng cảm biến trước: dừng trước thùng, tới tường rồi rẽ theo hàm, sửa `while` chạy mãi, trùm |
| 4 | 10 | nút đè: đặt thùng lên `M` cho cửa mở, lấy thùng ra thì cửa đóng, hai nút hai cửa, chọn thùng nào đè nút nào; lõi nút đè đã có (`M`, không cần tham số) |
| 5 | 4 + 4 | lùi tránh thùng, lùi vào ngách, quay đầu một nhịp trên hành lang hẹp · lùi mang hàng tới tường, kéo thùng khỏi ngõ cụt |
| 8 | 10 | đội hai robot có tay xoay / cảm biến bên |
| 9 | 10 + 9 | combo tay xoay + cảm biến bên: hỏi bên nào có thùng rồi xoay tay nhặt bên đó không quay xe; trùm combo |
| 10 | 10 | trùm mùa: kho hàng tổng hợp mọi part và nâng cấp mùa 1 |

## Đường cong học và recall (user 26/10: bắt buộc cho mọi gói viết mới)

**Đường cong mượt** trong mỗi chương 10 màn (theo `hang` đang dùng):
- màn 1–3 **làm quen**: một ý mới, sân nhỏ, lời giải ngắn; màn 4–6 **luyện**: dùng ý đó vài cách; màn 7–9 **biến thể**: đố, sửa hàm lỗi, ghép với ý cũ; màn 10 **trùm**.
- Mỗi màn thêm **tối đa một** điều mới so với màn trước. Không nhảy vọt: số dòng lời giải, số nhịp, cỡ sân tăng dần (màn n không quá ~1,5 lần màn n−1, trừ màn trùm).
- Màn đầu của một gói phải dễ hơn màn trùm của gói trước (thở ra trước khi học tiếp).

**Gói 9 (Combo) và gói 10 (Tổng hợp + Trùm mùa) phải phong phú và recall các gói khác:**
- Mỗi màn mới của gói 9–10 dùng **ít nhất hai gói trước** ngoài ý chính của nó (ví dụ combo tay xoay + cảm biến bên **cộng** nút đè, lùi, vòng lặp, `while`…).
- Trên cả gói 9 + 10, **mỗi gói 1–8 được nhắc lại ít nhất 3 lần** (hàm của gói đó, part, hay yếu tố sân của nó): xe + `def`, tay + `for`, khoảng cách + `if` / `while`, kho hàng + nút đè, bánh lùi, tay xoay, cảm biến bên, đội.
- Không hai màn liền nhau cùng một kiểu bài; xen bài giao hàng, dò đường, sửa hàm lỗi, đố nhịp, nhiều sân một chương trình.
- Trùm mùa (gói 10 màn 10) gần như dùng hết: thân, tay xoay, cảm biến bên, lùi, nút đè, hàm tự viết, vòng lặp.
- Máy kiểm của gói 9–10 có **bảng recall**: mỗi màn đánh dấu gói nào được dùng (đọc từ lời giải: lệnh, hàm của em, ký hiệu sân), và kiểm các điều trên.

## Việc phải làm khi bắt tay (chưa làm)
1. `lo-trinh-hoc.js`: dựng 10 gói / 20 chương mùa 1 theo bảng (đổi `m.chuong`, `m.so`, `m.hang`; giữ `ma`); thêm chương mới vào `thu-tu-chuong.js`; ngưỡng sao gói.
2. Khay: bỏ `left_back` / `right_back` khỏi `hamGoc` của mọi màn trước gói 5, `left_clear` / `right_clear` trước gói 7.
3. `kiem-lo-trinh.mjs`: kiểm các ràng buộc ở đầu file và mọi `hamCuaEmCan` được tạo ở màn đứng trước.
4. Viết 64 màn mới, sửa các màn ở cột "Sửa", đo sao (`node tools/do-lo-trinh.mjs --ghi-sao`).
