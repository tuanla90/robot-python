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

- **27/10 gói B xong** (8e4e4f0, eaf8873, 091018e): gói 4 chương 1 `nut-de` 10 màn (máy kiểm hoc/kiem-nut-de.mjs, bộ dò đường riêng có cửa / nút đè). Gói 10 đổi tên **"R1 xuất xưởng"**.
  Còn treo: sân chưa vẽ dây nối nút đè với cửa (màn 5, 6, 9, 10 dùng `noi`); bấm thử thấy rối thì làm sau.

- **27/10 gói phim xong** (f027ac0 … b2671cc): 9 phim mở gói mùa 1 (KE-HOACH-PHIM-GOI.md).
- **27/10 gói C xong** (01fac58, e44772f): gói 3 đủ 20 màn (khoang-cach.11; che-cam-bien.11–.16, trùm ccb.16 huy hiệu `che-cam-bien`); thứ tự ccb 1, 2, 7, 11, 12, 13, 3, 14, 15, 16.
  **Luật đo đường cong** (áp cho mọi gói sau): màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), bù: dòng +3, nhịp +4, ô +6; trừ trùm (với số nhỏ, 1,5 lần là quá chặt).
  Ngưỡng mở gói 4–10 thành 90, 120, 135, 165, 195, 210 (gói đã mở không khóa lại).

- **27/10 gói D xong** (e2835fb, 9ed6b14, a9ff891): gói 5 đủ 20 màn (banh-lui.1–4, trùm mới banh-lui.4 huy hiệu `banh-lui`; che-banh-lui.1–4). Ngưỡng gói 6–9: 150, 180, 210, 225.

- **27/10 gói E xong** (df9f9e5 … b5d1d50): gói 8 chương 2 `che-hai-robot` "Đội phối hợp" 10 màn (R1 tay kẹp, R2 tay xoay; nút đè, lùi, cảm biến bên), trùm huy hiệu `che-hai-robot`. Gói R1 xuất xưởng cần 240 ★.
  Luật đo "ô +6" = cỡ sân (số ô không phải tường), không phải số ô code.

- **27/10 gói F xong** (b27f16d … dc356aa): gói 9 `combo` 20 màn (`combo` 1–10 "Nhìn bên, nhặt bên", trùm huy hiệu `combo`; `che-combo` 1–9 + che-cam-bien.10 viết lại không biến, trùm che-combo.9 huy hiệu `che-combo`). Recall gói 9: gói 1: 8 · 2: 17 · 3: 11 · 4: 8 · 5: 8 · 6: 19 · 7: 20 · 8: 2. Gói R1 xuất xưởng cần 270 ★. Mùa 1 lúc này 190 màn.

- **27/10 gói G xong — MÙA 1 ĐỦ 200 MÀN** (nhánh claude/trum-mua-1, 3c2e532 … 833b878): gói 10 "R1 xuất xưởng" đủ hai chương (man-trum-mua-1.js, máy kiểm hoc/kiem-trum-mua-1.mjs).
  Chương 1 Tổng hợp: robot-hoan-thien.10 **cất** (hàm của màn khóa có biến), thay bằng **robot-hoan-thien.11** "Giao ca ở kho" (cùng kho ba sân, "lùi về chỗ cũ" thành lùi tới cửa nhánh bằng cảm biến bên, hàm của màn bring_out(), huy hiệu robot-hoan-thien).
  Chương 2 **Trùm mùa** (`trum-mua-1` 1–10, R1 tay xoay; màn 4 hai robot R1 xoay vàng + R2 kẹp lam; trùm cuối mùa trum-mua-1.10 "Ngày xuất xưởng" ba kho, huy hiệu **xuat-xuong**).
  Huy hiệu cam-bien-ben chuyển từ cam-bien-ben.10 (nay đứng thứ 9 Tổng hợp) về trùm mới của chương đó cam-bien-ben.9. vong-lap.8, .9 thêm tay kẹp (qua lộ trình).
  Recall gộp gói 9 + 10 (40 màn): gói 1: 13 · 2: 35 · 3: 27 · 4: 16 · 5: 22 · 6: 29 · 7: 33 · 8: 3. Ngưỡng gói 10 vẫn 270 ★ (gói cuối mùa: màn thêm không đổi ngưỡng gói nào).

  | Gói | Chương 1 | Chương 2 | Màn |
  |---|---|---|---|
  | 1 Xe hai bánh | `hai-banh` 10 | `xuong-ham` 10 | 20 |
  | 2 Tay gắp | `tay-gap` 10 | `vong-lap` 10 | 20 |
  | 3 Cảm biến khoảng cách | `khoang-cach` 10 | `che-cam-bien` 10 | 20 |
  | 4 Kho hàng | `nut-de` 10 | `kho-hang` 10 | 20 |
  | 5 Bánh lùi | `banh-lui` 10 | `che-banh-lui` 10 | 20 |
  | 6 Tay xoay | `tay-xoay` 10 | `che-tay-xoay` 10 | 20 |
  | 7 Cảm biến bên | `cam-bien-ben` 10 | `me-cung` 10 | 20 |
  | 8 Đội hai robot | `hai-robot` 10 | `che-hai-robot` 10 | 20 |
  | 9 Combo | `combo` 10 | `che-combo` 10 | 20 |
  | 10 R1 xuất xưởng | `robot-hoan-thien` (Tổng hợp) 10 | `trum-mua-1` (Trùm mùa) 10 | 20 |
  | | | **Tổng** | **200** |

- **29/10 MÙA 1 XONG Ở BẢN VECTOR** (soát sau khi gộp V7c3 c258019; game luôn vector, mã / CSS / phông pixel đã gỡ hết, KE-HOACH-GOP-DIEM10CODE.md mục 2c). Người giao soát trong trình duyệt thật (cổng 4181):
  màn chọn gói đủ 10 gói mùa 1, mỗi gói 2 chương 20 màn, ngưỡng sao 0 / 30 / 60 / … / 270; **200 / 200 màn** nạp hàm chuẩn + lời giải chuẩn rồi bấm Chạy thật: máy chấm của game báo THẮNG cả 200
  (kể cả 23 màn hai robot), 0 lỗi JS, 0 canvas pixelated; phim mở đầu (6 khung) + 9 phim gói chạy hết khung (gói 1 dùng phim mở đầu), 0 hình pixel; 20 huy hiệu trùm chương (hai-banh … xuat-xuong) đều có hình vector;
  trùm mùa trum-mua-1.10 và Sổ lệnh ở khổ 360 × 640 không tràn ngang; document.fonts chỉ Google Sans Flex / Code. npm test 87/87. Lỗi console duy nhất là đăng ký service worker trong ô trình duyệt của app (môi trường).
  Mục "Còn treo" của gói B (dây nối nút đè ↔ cửa) đã làm ở V7a; "Vướng cần biết" 1–5 và "Việc phải làm khi bắt tay" bên dưới là ghi chép lúc lập kế hoạch, đã làm xong qua gói A–G
  (bậc thang xuong-ham.6 đã thành tường; hộp màu mùa 1 giữ theo user 26/10). Chưa gộp vào main (chờ user).

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
