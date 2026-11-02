# Kế hoạch sửa phim gói CLB (Remotion), đợt 2/11/2026

Phỏng vấn user 2/11 (phiên "Sửa phim gói Remotion"), các quyết định:

| Câu hỏi | User chốt |
|---|---|
| Phạm vi | **Mùa 1 làm mẫu** (20 phim `phim-clb/src/doc/m1.tsx`), user duyệt trên trình duyệt rồi mới lan ra 8 mùa còn lại |
| Hướng sửa | Cả bốn: áp `hoc/LUAT-SUA-PHIM-CLB.md` · viết lại kịch bản (lý do cần part rõ, khớp màn, đúng giọng, nhịp mùa) · đồng bộ hình + **cơ chế vật lý + hoạt cảnh giống game**, **grid chuẩn** · cắt ngắn |
| Độ dài phim mở | ~25s phần kể (3 cảnh × 8s) **+ cảnh cơ chế**; **mọi gói đều cần phần giải thích cơ chế**, nhưng đẩy nhịp nhanh, rút chữ (đảo quyết định "không nói ra quy luật" ở KICH-BAN bản 3 mục 0) |
| Đoạn kết gói | Giữ gộp kết gói n vào đầu phim mở gói n+1 (`gopKetVaoMoSau`), rút kết còn **1 cảnh**; chỉ gói 10 có phim kết riêng |
| Khớp màn chơi | **Mọi lệnh trong phim phải được dùng trong gói đó; mọi hình (vật, ô, part) trong phim phải xuất hiện trong gói đó** |
| Chuẩn gói 8–9–10 (user 2/11) | **Gói 8 = tổng duyệt**: thử mọi tình huống, mọi yếu tố map tương tác của mùa trước với xe mới. **Gói 9 = hai thiết bị**: R2, thử tương tác các thiết bị với môi trường mới. **Gói 10 = tự động hoá nhiều map**. Mùa 1 gói 8 hơi đơn điệu (chưa có mùa trước, chỉ có yếu tố của chính mùa 1) nhưng chấp nhận; **phim phải lý giải** việc đó |
| Nhánh | Gộp `claude/ve-moi-tu-ban-chup` vào main (đã gộp: 840ee24), sửa tiếp trên main |
| Ai làm, duyệt | Phiên này tự làm, tự chụp khung dừng soát theo luật mục 7; xong mùa 1 user mở game xem |

## 1. Lệch phát hiện khi soát m1.tsx (2/11)

1. **Thứ tự gói 8 / 9 trong game ngược với chuẩn.** `lo-trinh-hoc.js` MUA_1 (main lẫn nhánh part-dung-mua): 8 = `hai-robot` (Đội hai robot), 9 = `combo` (Nhìn bên, nhặt bên). Chuẩn user: 8 tổng duyệt (= combo), 9 hai thiết bị (= hai-robot). Phim hiện tại đã theo chuẩn (8 Bến xuất yếu tố cũ, 9 R2). **Sửa game**: đổi chỗ hai gói trong MUA_1 (sao 210 ↔ 240), cập nhật `kiem-combo-mua-1.mjs`, sinh lại `DS_GOI` (dong-goi.mjs).
2. **Lệnh không có trong game**: `forward()`, `grab()` / `release()` ở gói 10 (game dùng `move()`, `pick()`, `drop()`), `wait_n()`, `forward(4)`, `stay()` ở gói 9 (gói hai-robot chỉ có `move pick drop back turn_left turn_right go_wall to_gap…`).
3. **Vật lý khác game**: gói 2 "RẦM! văng hết thùng" (game: đâm vật = dừng khựng + sao choáng, thùng đứng yên); gói 5 "bánh cạ kệ quay hụt" (game: xoay tại chỗ luôn được, kể cả đang cầm thùng; lý do đúng game là **quay đầu tốn hai nhịp**, đồng hồ chạy, đúng loại lý do gói 5 "chậm so với đồng hồ"); gói 6 thùng trượt chéo từ ngoài lưới.
4. **Toạ độ lẻ grid**: `1.62, 2.35, 2.55, 2.68, 3.32, 0.62, 0.4, 5.2, 4.4, 2.2, 2.6, 0.32…` ở hầu hết `Moc` của Xe và Vat (xe dừng "sát thùng" thay vì ở tâm ô kề). Game: xe luôn ở tâm ô, thùng ở ô kề trước mũi, tay gắp với sang ô đó.
5. **Chữ**: bóng thoại 15–25 chữ; nhãn tiếng Anh kỹ thuật (`Test Case`, `hardcode`, `TH1: ĐẠT`, `ĐANG CHẠY`), thẻ nhiều dòng mô tả (ThaTay, NgoaiDoi, NhaMua2); tên "chú Tư" còn trong nhãn `CHÚ TƯ` (phải là **Chú Tùng**).
6. **Thiếu cảnh cơ chế**: gói 4 (nút đè), 8 (tổng duyệt), 9 (hai robot), 10 (một code nhiều sân) không có cảnh sa bàn Lab; gói 1–3, 5–7 có nhưng dài (PhimXe 6 cảnh, Tay kẹp 4 cảnh) và nhiều chữ.
7. Hình: `public/robot/m1/` xuất từ bộ vẽ vector game (`tools/xuat-m1.mjs`), phải **xuất lại** sau mốc hình 3D 8a09db2 rồi mới soát; kiểm tra thùng / kệ / cửa / nút đè trong phim đúng ảnh ô game.

## 2. Khuôn phim mở gói (mùa 1 áp dụng, các mùa sau theo)

Mỗi cảnh chạy tới cuối rồi **dừng chờ Tiếp** (entry.tsx). Mỗi bóng ≤ 10 chữ, mỗi cảnh ≤ 2 bóng.

| # | Cảnh | Dài | Nội dung |
|---|---|---|---|
| 0 | Kết gói trước (gói ≥ 2) | 6s | Hiện trường tối, bảng đơn gạch một dòng, chú Tùng 1 câu. (Gói 10: phim kết riêng.) |
| 1 | Hiện trường, thử không được | 8s | Lưới 5×7, mọi vật **ở tâm ô**. R1 làm theo cách cũ → lỗi **đúng vật lý game** (đâm: khựng + choáng; cửa sập; vướng tay; hết nhịp). Người nhờ 1 câu phản ứng, Sola hoặc Luna 1 câu. |
| 2 | Trong xe, Luna chế part | 4–5s | `TrongXe`: Luna hỏi 1 câu, Sola đáp 1 câu, CẠCH. Gói 4, 8, 10 không có part mới: bỏ cảnh này. |
| 3 | Sa bàn Lab, cơ chế | 8s × 1–2 | Sân game thật (ô Lab), robot game, **lệnh đúng tên game**, bảng code 2–3 dòng; thử sai một lần (nhanh) → đúng. Chỉ nói **quy tắc một câu**. |
| 4 | Câu treo | 3s | Sola 1 câu ≤ 8 chữ, bấm Tiếp vào màn 1 (sa bàn Lab). |

**Gói 8 (tổng duyệt), lý giải trong phim:** chú Tùng trước giờ xuất bến yêu cầu **chạy thử một lượt tất cả**: thùng, nút đè, cửa, ngõ cụt, mê cung dồn trên một sân; Luna: "Xe xong rồi, sao còn thử?" Sola: "Thử hết một lượt mới dám giao!" (mùa 1 chưa có nơi trước nên chỉ có yếu tố của kho; mùa sau cảnh này là yếu tố của nơi trước xuất hiện lại theo chuỗi cung ứng).
**Gói 9 (hai thiết bị):** R2 lắp từ bộ part dư, hai bảng mật lệnh chạy cùng nhịp; thử R2 với cửa, nút của kho.
**Gói 10 (tự động nhiều map):** cảnh 1 = màn "Giao hàng" có **3 sân** (`san` là mảng 3), một code đếm cứng đạt sân 1, hỏng sân 2; cảnh Lab = cùng một code cảm biến + vòng lặp qua cả 3 sân; Sola thả tay. Kết gói 10: thành tựu → tem Xuất xưởng (rút chữ) → ngoài đời (1 thẻ, 1 câu) → nhá mùa 2 (1 câu cô Hạnh).

## 3. Bảng 10 gói mùa 1 (lệnh và ký hiệu lấy từ dữ liệu màn, `lo-trinh-hoc.js`; thứ tự sau khi đổi 8 ↔ 9)

Ký hiệu sân: `#` kệ/tường · `o` thùng · `D` ô đích · `M` nút đè · `C`/`c` cửa · `F` ô về/cờ · `,` sàn khác.

| Gói (mã game) | Tên game | Lệnh được dùng trong phim | Hình | Hiện trường: lỗi đúng game | Cơ chế Lab | Câu treo |
|---|---|---|---|---|---|---|
| 1 `xe` | Xe hai bánh | `move() turn_left() turn_right() left_move() right_move()` | `#` | 13:00, chú Tùng còn nghi; R1 là bộ não trên bàn, chưa có bánh | PhimXe rút còn 3 cảnh: thử LEFT sai → vết bánh (rẽ phải = bánh trái lăn) → lệnh mới | "Thử lái trên sa bàn!" |
| 2 `tay-gap` | Tay gắp | `arm_down() grab() arm_up() release() move()` | `o D #` | R1 húc thùng: **khựng, choáng**, thùng không nhúc nhích. Luna: "Thùng có tay cầm kìa?" | chưa hạ tay → kẹp hụt; hạ tay, kẹp, nâng → đi được | "Hạ tay, kẹp, nhấc!" |
| 3 `cam-bien` | Cảm biến khoảng cách | `range() front_clear() move()` | `o D #` | thùng dời chỗ, `move()` ×3 cứng: hụt rồi cộp | `while front_clear(): move()` dừng sát mọi lần | "R1 tự nhìn, mình chờ." |
| 4 `kho-hang` | Kho hàng (nút đè) | `move() pick() drop() hold_door()` | `M C c o #` | lăn qua `M` cửa mở, rời → **sập** (đúng luật nút giữ) | **mới**: xe lên `M` cửa mở, rời đóng; đặt `o` lên `M` → mở giữ | "Hay là… thùng đè nút!" |
| 5 `banh-lui` | Bánh lùi | `back() move() pick()` | `# o M C` | ngõ 1 ô, cầm thùng quay đầu mất **hai nhịp**, đồng hồ chạy | `back()` lùi thẳng một nhịp, vệt bánh ngược | "Lùi thử trên sa bàn!" |
| 6 `tay-xoay` | Tay xoay | `arm_left() arm_right() pick_left() drop_right()` | `# o D` | **bước lùi**: kệ sập, thùng hai bên; quay cả xe mỗi thùng 2 nhịp, đồng hồ chạy | `arm_left()` kẹp bên trái, xe đứng yên | "Xe đứng yên, tay quay!" |
| 7 `me-cung` | Cảm biến bên | `left_clear() right_clear() turn_left() turn_right() move()` | `# D` | ngã ba y hệt, chọn bừa → ngõ cụt | `if right_clear(): turn_right()` | "Hỏi trước rồi mới rẽ." |
| 8 `combo` | Nhìn bên, nhặt bên (**tổng duyệt**) | `left_clear() right_clear() pick_left() drop_right() move()` + `M C` | `# o D M C` | 16:00 chú Tùng: thử một lượt hết mọi thứ trước khi xuất bến; Sola viết rời rạc từng việc → hết nhịp, sao nhịp tắt | ghép: nhìn bên → nhặt bên → đè nút trong một hàm em | "Ghép hết lại một hàm!" |
| 9 `hai-robot` | Đội hai robot (**hai thiết bị**) | `move() pick() drop()` ×2 bảng | `M C o #` + R2 | 16:30 không còn thùng đè nút; R1 đè nút thì không vào, rời → sập | R2 đứng trên `M`, R1 qua cửa; hai bảng chạy **cùng nhịp** | "Hai bảng mật lệnh nhé!" |
| 10 `robot` | R1 xuất xưởng (**tự động nhiều map**) | `move() pick() drop() front_clear() left_clear() turn_left()` | 3 sân `# o` | đếm cứng: sân 1 đạt, sân 2 cộp | một code cảm biến + `while` qua 3 sân | (thả tay) |

## 4. Kết quả 2/11 (phiên này)

- Đã làm xong mục 1–6 bên dưới cho mùa 1: game đổi gói 8/9; hình m1 xuất lại; `phim-clb/src/doc/sa-ban.tsx` (bộ mô phỏng sân game trong phim: ký hiệu sân, nhịp lệnh đúng tên game, đâm = khựng + choáng, tay hạ mà bước = vướng tay, nút đè giữ cửa, hai robot, bánh sáng, tia cảm biến); `m1.tsx` viết lại 20 phim; `TrongXe` / `CauTreo` / `BangViec` rút chữ.
- Soát bằng `node tools/chup-khung.mjs <mã gói|id phim>` + `python tools/ghep-soat.py out/soat/<mã>` (ảnh 1080×1920 qua game thật, khung giữa câu + khung dừng mỗi cảnh); đã soát cả 10 phim mở và phim kết gói 10 theo bảng luật mục 7.
- Chưa làm: user mở game xem mùa 1 (bước 7); các mùa 2–9 chờ chốt khuôn. Ngoại lệ gói 1: giữ bẫy chữ LEFT nhưng xe **quay tại chỗ** như game (bánh đang lăn sáng vàng, bánh đứng yên viền đỏ), bỏ cảnh "chân compa" vì game không quay quanh bánh.

## 5. Việc làm theo thứ tự (kế hoạch ban đầu)

1. Game: đổi chỗ `combo` ↔ `hai-robot` trong MUA_1 (`lo-trinh-hoc.js`), sửa `kiem-combo-mua-1.mjs`, chạy bộ kiểm; sinh lại `DS_GOI`.
2. `cd phim-clb && node tools/xuat-m1.mjs` (xuất lại hình m1 từ game; cần Chrome).
3. Thành phần dùng chung (`kit-doc.tsx`): `Moc` ép nguyên (cảnh báo khi lẻ), `Choang` (sao choáng như game `veChoang`); bộ mô phỏng `sa-ban.tsx` (ký hiệu sân + nhịp lệnh game); `Nguoi` nhãn CHÚ TÙNG.
4. Viết lại `m1.tsx` từng gói theo bảng mục 3 (gói 2 trước làm khuôn, rồi 3–10, gói 1 cuối).
5. Rút các cảnh Lab (`PhimXe`, `PhimTayKep`, `PhimKhoangCach`) còn 1–3 cảnh, chữ ≤ 10; viết cảnh Lab mới cho gói 4, 8, 9, 10.
6. `node tools/web/dong-goi.mjs`, chụp khung dừng (luật mục 7), tự soát, sửa; `node hoc/kiem-phim-goi.mjs`, `node hoc/kiem-dong-goi-artifact.mjs`.
7. Báo user mở game xem mùa 1; chốt khuôn rồi mới sang mùa 2–9.
