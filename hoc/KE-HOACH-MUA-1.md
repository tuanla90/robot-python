# Kế hoạch mùa 1 "Xưởng R1": ba bộ phận + ba nâng cấp (26/10/2026, CHƯA DUYỆT)

User đề xuất 26/10: mùa 1 giới thiệu đủ **3 bộ phận chính** rồi **3 nâng cấp** của chúng, xen giữa là các phần logic.

```
Bánh xe → (khai báo hàm) → Tay gắp → (for) → Cảm biến trước → (if, while)
       → Bánh lùi → Tay xoay → Cảm biến bên → Robot hoàn thiện
```

| Bộ phận chính | Nâng cấp | Lệnh mở thêm |
|---|---|---|
| Thân hai bánh | Bánh lùi | `left_back`, `right_back` |
| Tay kẹp | Tay xoay | `arm_left`, `arm_right` |
| Cảm biến khoảng cách | Cảm biến bên | `left_clear`, `right_clear` |

## 1. Hiện trạng (lộ trình xuất bản `lo-trinh-hoc.js`, không phải ngân hàng `man-*.js`)

Mùa 1 đang có 7 gói, 120 màn: Xe hai bánh (10) · Xưởng hàm (`xuong-ham` + `che-xe`) · Tay gắp (`tay-gap` + `che-tay`) · Vòng lặp (`vong-lap` + `che-lap`)
· Cảm biến (`khoang-cach` + `che-cam-bien`) · Dò đường (`cam-bien-ben` + `me-cung`) · Robot hoàn thiện (10). Tay xoay đang ở mùa 4.

Hai trong ba nâng cấp **đã có** ở mùa 1, nhưng mở rải rác chứ không thành một chặng:
- **Bánh lùi** mở ở `che-xe.4`, rồi được dùng trong che-tay, che-lap, che-cam-bien.
- **Cảm biến bên** đã có chương riêng `cam-bien-ben` (gói Dò đường), nhưng `right_clear` mở sớm hơn ở `khoang-cach.7` và `che-cam-bien.4/.8/.10`.

Rà từng màn (script đọc lời giải, tính bắc cầu qua hàm của em; định nghĩa đầu tiên của hàm):

| Màn phải dời vì dùng **bánh lùi** | Màn phải dời vì dùng **cảm biến bên** |
|---|---|
| che-xe.4, .5, .6, .7, .9, .10 · che-tay.5, .7, .9 · che-lap.7, .9 · che-cam-bien.5, .6, .9, .10 | khoang-cach.7 · che-cam-bien.4, .8, .10 |

Màn chỉ dùng `u_turn()` (không gọi thẳng lệnh lùi) **ở lại được**: tay-gap.9, che-tay.1, .4, .6, .10. Trước nâng cấp bánh lùi, `u_turn()` là bản xuong-ham.7
(`turn_right()` hai lần = 2 nhịp). Màn `che-xe.5` "Quay đầu một nhịp" sửa nó thành 1 nhịp, nên phải **đo lại sao nhịp** của năm màn này.

Tay xoay (`tay-xoay`, `che-tay-xoay`) không dùng `for` / `if` / `while`, không dùng lệnh lùi hay cảm biến bên. Nó chỉ cần `pick` / `drop` (tay-gap) và `put_right` (che-tay.2).

## 2. Mùa 1 mới (9 gói, 160 màn; user chốt 26/10: mọi chương đúng 10 màn, mùa 1 khoảng 160 màn)

| # | Gói | Loại | Chương và màn (giữ `ma`) | Số màn |
|---|---|---|---|---|
| 1 | Xe hai bánh | bộ phận | `hai-banh` 1–10 | 10 |
| 2 | Xưởng hàm | khái niệm | `xuong-ham` 1–10 · `che-xe` 1, 2, 3, 8 + **6 màn mới** (có trùm; không lùi) | 20 |
| 3 | Tay gắp | bộ phận | `tay-gap` 1–10 · `che-tay` 1, 2, 3, 4, 6, 8, 10 (trùm .10 "Kho đồ") + **3 màn mới** | 20 |
| 4 | Vòng lặp | khái niệm | `vong-lap` 1–10 · `che-lap` 1–6, 8, 10 + **2 màn mới** | 20 |
| 5 | Cảm biến | bộ phận | `khoang-cach` (trừ .7) + **1 màn mới** · `che-cam-bien` 1, 2, 7, 3 + **6 màn mới** (có trùm; không lùi, không cảm biến bên, không biến) | 20 |
| 6 | **Bánh lùi** | **nâng cấp** | chương mới `banh-lui`: che-xe.4, .5, .6, .7, .9, .10 (trùm) + **4 màn mới** · chương mới `che-banh-lui`: che-tay.5, .7, .9, che-lap.7, .9 + **5 màn mới** (có trùm) | 20 |
| 7 | **Tay xoay** | **nâng cấp** | `tay-xoay` 1–10 · `che-tay-xoay` 1–10 (dời nguyên từ mùa 4) | 20 |
| 8 | **Cảm biến bên** (Dò đường) | **nâng cấp** | `cam-bien-ben`: che-cam-bien.4 (tạo `to_gap`, cam-bien-ben.4 cần) + cam-bien-ben 1–10 bỏ một màn · `me-cung` 1–10. Cất khỏi lộ trình: khoang-cach.7 (trùng ý me-cung.1), che-cam-bien.8 | 20 |
| 9 | Robot hoàn thiện | thử thách | `robot-hoan-thien` 1–10, đổi 2–3 màn thành màn có tay xoay | 10 |

Ghi chú:
- **Không đổi `ma`.** Lớp lộ trình chỉ đổi `m.chuong`, `m.so`, `m.hang` (giống `xep()` đang làm cho khoang-cach / che-cam-bien), nên sao đã lưu vẫn thuộc đúng màn.
  Đã kiểm: không chỗ nào trong game tách chương ra từ `ma`; luật mở trùm là "qua hết các màn khác trong chương" chứ không cứng 9 màn, nên chương ít hơn 10 màn vẫn chạy.
- **Biến đếm** (che-cam-bien.5, .6, .9: "đi rồi lùi về") rời mùa 1, sang chương `bien` của mùa 2 (KE-HOACH-MUA.md: mỗi mùa một ý Python, biến là của mùa 2).
  Mùa 1 không còn biến; robot-hoan-thien.9 "Kẹt số lùi" đang dùng biến đếm nên phải viết lại.
- **che-cam-bien.10** "Kho hàng" (dùng cả lùi lẫn cảm biến bên) không còn chỗ hợp lý: cất khỏi lộ trình (giữ trong ngân hàng), hoặc đưa vào Robot hoàn thiện.
- Huy hiệu chương đi theo màn trùm: `che-xe.10` mang huy hiệu "Chế lệnh xe" sang chương `banh-lui`, nên phải đổi tên huy hiệu và gắn huy hiệu mới cho trùm mới của `che-xe` / `che-cam-bien`.

## 3. Việc cần làm

### 3.1 Lộ trình (`lo-trinh-hoc.js`): phần chính, ngân hàng `man-*.js` giữ nguyên
1. Hàm `chuyen(ma, chuongMoi)` đổi chương của một màn; dựng lại `so` / `hang` cho mỗi chương sau khi chuyển.
2. Thêm chương `banh-lui`, `che-banh-lui` vào `TT.thuTu` / `TT.ten`; dời `tay-xoay`, `che-tay-xoay` lên trước `cam-bien-ben`.
3. Sửa `TT.goi` mùa 1 theo bảng mục 2, khai ngưỡng sao mới (gợi ý: 0 · 15 · 45 · 75 · 105 · 135 · 155 · 185 · 215; đo lại với `TI_LE_SAO`).
   Gói đã mở không khóa lại (cờ `goi-mo:<mã>`), nên người đang chơi thử không bị khóa ngược.
4. **Khay:** bỏ `left_back` / `right_back` khỏi `hamGoc` của mọi màn gói 3–5 (che-tay, che-lap, khoang-cach, che-cam-bien đang có sẵn). Bỏ `left_clear` / `right_clear` khỏi gói 5.
5. **Mùa 4:** bỏ gói Tay xoay. Gói đội `doi-tay-xoay` đang neo `sau: 'che-tay-xoay'` nên sẽ bị kéo vào mùa 1, trong khi nó cần nam châm (mùa 3).
   Phải neo lại sau `che-nam-cham` (mùa 3) hay `che-may-nem` (mùa 4), và tính lại ngưỡng sao các gói mùa 4.
6. Robot hoàn thiện: viết lại 2–3 màn (gợi ý .4 "Đổi thùng" dùng `swap_sides`, .5 "Dọn dãy thùng" dùng tay xoay thay `put_right`), và .9 cho khỏi dùng biến đếm.

### 3.2 Màn mới
**27 màn mới** cho đủ mọi chương 10 màn:

| Chương | Màn mới | Gợi ý nội dung |
|---|---|---|
| `che-xe` | 6 (có trùm) | chế động tác chỉ bằng bánh tiến: né, vòng chướng ngại, `corner` / `stair` dài, sửa hàm né sai |
| `che-tay` | 3 | nhặt / đặt hai bên bằng quay xe, chuyền vật qua hành lang (`u_turn` hai nhịp) |
| `che-lap` | 2 | lặp `pick` / `drop` trên dãy vật, `for` lồng có tay |
| `khoang-cach` | 1 | thay chỗ .7: `while front_clear()` mang vật |
| `che-cam-bien` | 6 (có trùm) | chế hàm có `if` / `while` chỉ dùng cảm biến trước: dừng trước vật, đi tới tường rồi rẽ theo hàm, sửa `while` chạy mãi |
| `banh-lui` | 4 | lùi tránh vật, lùi vào ngách, quay đầu một nhịp trên hành lang hẹp |
| `che-banh-lui` | 5 (có trùm) | chế hàm có lùi + tay + `for` / `while`: lùi mang hàng tới tường, kéo vật ra khỏi ngõ cụt |

### 3.3 Giao diện, cốt truyện
- Loại gói mới `nang-cap` (`mo-goi.js`, `bang-mo-khoa.js`, `chu.js`): lời mở khóa "R1 được nâng cấp:" thay cho "R1 tìm lại được:"; hộp gói có dấu nâng cấp.
- Thẻ giới thiệu nâng cấp (`gioi-thieu-part.js`, `den-bo-phan.js`): bánh lùi và cảm biến bên chưa có thẻ riêng.

### 3.4 Đo và kiểm
- Đo lại sao: `node tools/do-lo-trinh.mjs --ghi-sao` (ghi `lo-trinh-sao.js`), nhất là năm màn dùng `u_turn()` hai nhịp.
- Sửa / thêm kiểm trong `kiem-lo-trinh.mjs`: thứ tự gói mùa 1; không màn nào trước gói Bánh lùi gọi lệnh lùi (thẳng hay qua hàm); không màn nào trước gói Cảm biến bên gọi `left_clear` / `right_clear`;
  mọi hàm `hamCuaEmCan` được tạo ở màn đứng trước; `doi-tay-xoay` không nằm ở mùa 1.
- Chạy `node tools/kiem-tat-ca.mjs`. Máy kiểm của ngân hàng (`kiem-che-xe.mjs`…) không đổi vì ngân hàng không đổi.
- Cập nhật `LO-TRINH.md`, mục 2 của `KE-HOACH-CHE-LENH.md`.

## 4. Cần user chốt
1. (Đã chốt 26/10: mọi chương 10 màn, mùa 1 = 160 màn, viết thêm 27 màn.)
2. Tay xoay giữ đủ 20 màn hay gọn còn 10?
3. (Đã gỡ bằng KE-HOACH-MUA.md: biến đếm sang mùa 2.)
4. che-cam-bien.10 "Kho hàng": cất đi hay đưa vào Robot hoàn thiện?
