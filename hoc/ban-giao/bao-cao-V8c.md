# Báo cáo V8c: một tay kẹp từ gói 2, gói 6 chỉ mở thêm lệnh xoay

## 1. KẾT QUẢ

Nhánh `claude/v8c-mot-tay-kep-xoay` (worktree `.claude/worktrees/v8c-mot-tay-kep-xoay`), từ 4a85b25 (brief). Chưa push, chưa merge.

| SHA | Nội dung |
|---|---|
| fbc976e | Commit vẽ: tay kẹp vẽ y hệt tay xoay ở nấc trước (cụm giữa tâm (50, 84), khớp tròn vành bạc + đèn qua hàm `khop` dùng chung) |
| a163e6c | Phanh vẽ: dời `NEN_VEC` sang fbc976e ở ba tệp kiểm |
| 5161892 | Thẻ bộ phận: 'xoay' là tay kẹp mở thêm xoay (`nangCapCua: 'kep'`), thẻ "lệnh mới", Sổ lệnh một dòng tay, ca kiểm 3b |
| 3dbd575 | Chữ hiển thị: thẻ khay, phim gói 6 / combo / robot đủ bộ, hướng dẫn tay-xoay.1 |
| (commit báo cáo) | Thêm ba dòng ghép tay kẹp vào thẻ đầy đủ của 'xoay'; hoàn chú thích `den-bo-phan.js` về ad0899a; báo cáo này |

### Tệp đổi
- `hoc/game/ve-vector-tay-kep.js`: thêm `khop(g, H, x, y, ha)` (vành bạc r 7 + đèn r 3, nâng cyan / hạ cam), đưa vào `dungChung`. Tay kẹp vẽ cụm giữa ở (50, 78) (tâm 84, trùng gốc càng) và khớp tròn ở (50, 84), y như tay xoay ở nấc trước. Không đổi: `diemNeo`, `vatKep` (Y_VAT 102, HA 3), dáng / độ dài càng, khe ôm vật, khung ô (không có `tran`).
- `hoc/game/ve-vector-tay-xoay.js`: khớp tròn vẽ bằng `KEP.khop` (cùng một hàm), hình không đổi.
- `hoc/gioi-thieu-part.js`: thẻ 'xoay' tên "Tay kẹp", `nangCapCua: 'kep'`, mô tả lệnh arm_left / arm_right ("Xoay tay kẹp một nấc sang trái / phải"), thêm dòng ghép xoay (và ba dòng ghép tay kẹp cho thẻ đầy đủ), các mục làm tốt / không làm được / nhớ về xoay có `can: XOAY` để vào được thẻ lệnh mới. Phép chọn thẻ dời vào đây thành hàm thuần: `cungBoPhan`, `theCanHien`, `khoaDaXem`, `daGap`, `lenhDaXem`.
- `hoc/game/the-part.js`: `theCuaMan`, `danhDau`, `daGap`, `lenhDaXem` gọi các hàm trên (không còn chọn thẻ riêng). Cờ Luu giữ nguyên dạng `part:<mã>` / `part-lenh:<mã>:<lệnh>`.
- `hoc/game/chu.js`, `hoc/game/huong-dan-man.js`, `hoc/game/thanh-phan.js` (chú thích): xem bảng dưới. `hoc/game/den-bo-phan.js` cuối cùng KHÔNG đổi: tôi có sửa một chú thích ở 3dbd575 nhưng `kiem-bang-mau` (mục 4, so từng byte với nền 13b8a97) đỏ, nên đã hoàn tệp về ad0899a.
- Máy kiểm: `hoc/kiem-gioi-thieu-part.mjs` (mục 3 đi bằng chính `theCanHien` / `khoaDaXem`; mục 3b mới), `hoc/kiem-tay-xoay.mjs` (dòng 368: thẻ khay tên "Tay kẹp"), ba tệp phanh (`NEN_VEC`).

### Tên hiển thị: chọn "Tay kẹp" cho cả hai mã
Lý do: user muốn một bộ phận ("mở tính năng là mở luôn"). Mẫu bánh lùi cũng giữ tên "Thân hai bánh" ở thẻ lệnh mới. Phần mới nằm ở dòng lệnh: "Xoay tay kẹp một nấc sang trái / phải". Lõi cũng gọi tay xoay là "Tay kẹp đời 2" (san-hoc.js dòng 60).

### Hành vi thẻ bộ phận
- Đã xem tay kẹp (gói 2) → vào tay-xoay.1: chỉ thẻ "LỆNH MỚI · Tay kẹp" với arm_left, arm_right, hai dòng ghép xoay, các mục về xoay.
- Chưa xem tay kẹp (mở hết gói, vào thẳng gói 6): thẻ "BỘ PHẬN MỚI · Tay kẹp" đầy đủ sáu lệnh.
- Đã xem tay xoay rồi quay về gói 2: không hiện lại thẻ tay kẹp.
- Sổ lệnh, trang "Bộ phận": một dòng tay (mã đã gặp sau cùng trong nhóm), mở ra thấy đủ lệnh đã giới thiệu ở cả hai mã.

### Chỗ hiển thị: đã đổi / để nguyên
| Chỗ | Trước | Giờ | Ghi chú |
|---|---|---|---|
| Hình tay kẹp: sân, thẻ bộ phận, huy hiệu gói 2 / 4, phim, lắp ráp, mở đầu | cụm giữa (50, 76), chấm đèn (50, 82) | cùng hình tay xoay ở nấc trước | đổi một chỗ (ve-vector-tay-kep.js), mọi nơi dùng chung bộ vẽ |
| Thẻ bộ phận 'xoay' (`gioi-thieu-part.js`) | "Tay xoay", thẻ bộ phận mới | "Tay kẹp", thẻ lệnh mới nếu đã xem tay kẹp | ĐỔI |
| Sổ lệnh trang "Bộ phận" (`the-part.js daGap`) | hai dòng "Tay kẹp" + "Tay xoay" | một dòng "Tay kẹp" | ĐỔI |
| Thẻ khay lệnh tay (`choi.the.tayXoay`) | "Tay xoay" | "Tay kẹp" | ĐỔI (hình thẻ vẫn tay 'xoay', giờ trùng tay kẹp) |
| Phim gói 6 khung 2 (`pg.tay-xoay.2`) | "Trên kệ có khớp xoay lấp lánh. Gắn vào tay, cạch!" | "Trong thùng có món nâng cấp. Cạch! Tay kẹp của R1 giờ xoay được!" | ĐỔI chữ; hình phim (thùng, icon bay về tay, robot sáng) giữ nguyên, giống phim bánh lùi |
| Phim gói 6 khung 3 (`pg.tay-xoay.3`) | "Tay xoay sang trái…" | "Tay kẹp xoay sang trái…" | ĐỔI |
| Phim combo khung 2, robot đủ bộ khung 1 | "tay xoay" | "tay kẹp xoay (được)" | ĐỔI |
| Hướng dẫn tay-xoay.1 (`huong-dan-man.js`) | "tay xoay sang trái…", "arm_left() xoay tay…" | "tay kẹp xoay sang trái…", "Tay kẹp giờ xoay được: arm_left()…" | ĐỔI (không tăng phiên bản hướng dẫn) |
| Đèn bộ phận `choi.den.xoay` "Khớp xoay (trái / phải)", `choi.bp.xoay` "Khớp xoay", `den-bo-phan.js` | | để nguyên | khớp xoay là một phần của cùng tay kẹp, giống "Bánh trái" là một phần của thân; đèn tách riêng vẫn đúng |
| Phim gói 6 khung 4, `pg.tay-xoay.1`, tay-xoay.2 hướng dẫn | "xoay" là động từ | để nguyên | không gọi là bộ phận riêng |
| `hoc/lap-rap.js` TAY: `{ ma: 'xoay', ten: 'Tay xoay', gia: 3 }` | | để nguyên | NGOÀI PHẠM VI (xem mục 2) |
| `hoc/so-lenh.js`: nhóm 'tay-xoay' "Tay xoay", mô tả gốc "Tay xoay: xoay khớp…" | | để nguyên | NGOÀI PHẠM VI; thẻ bộ phận đã đè câu mô tả bằng `moTaLenh` |
| `hoc/thu-tu-chuong.js`: gói "Tay xoay", chương "Chế lệnh tay xoay" | | để nguyên | NGOÀI PHẠM VI; đọc được là "tay [được] xoay" |
| `hoc/cham.js` ("Tay xoay đang chỉ…"), deBai trong `man-tay-xoay.js` | | để nguyên | cấm sửa (lõi chấm, dữ liệu màn) |
| `bang-mau.js` chú thích vecTim "cổ tay xoay" | | để nguyên | chú thích cũ từ V8b |

### Phanh so hình (quy trình dời NEN_VEC)
Ở fbc976e (trước khi dời), ba phanh đỏ đúng chỗ tay kẹp: 13a-v (tay-gap.4, tay-gap.4:sai, mau.8), A3-v (tay-gap/khoa…), B5-v (phim tay-gap.2, tay-gap.3), C3-v (khung mở đầu 2, 3). Lệch đều ở `moveTo 40,78 … arcTo 66,78` / `40,76` (cụm giữa dời 2).

Chứng minh (chạy ở fbc976e):
```
git show ad0899a:hoc/game/ve-vector-tay-kep.js > hoc/game/ve-vector-tay-kep.js
git show ad0899a:hoc/game/ve-vector-tay-xoay.js > hoc/game/ve-vector-tay-xoay.js
node hoc/kiem-ve-vector.mjs
node hoc/kiem-huy-hieu-phim-vector.mjs
node hoc/kiem-nut-mo-dau-phim-vector.mjs
git checkout -- hoc/game/ve-vector-tay-kep.js hoc/game/ve-vector-tay-xoay.js
```
Kết quả (nguyên văn):
```
  ✓ (13a-v) CHẾ ĐỘ VECTOR y nguyên: 39 lần phát lại (lời giải + lời sai, 22 màn kể cả màn nhiều robot), 8104 khung …
ĐẠT 100 · HỎNG 0 kiểm
  ✓ (A3-v) V7c1 VECTOR y nguyên: HuyHieu.mk(ma, tt, 2) bản mới = bản nền vector fa7637a từng lệnh vẽ (85 mã × 3); mọi mã của nền vẫn còn
  ✓ (B5-v) V7c1 VECTOR y nguyên: cây DOM + lệnh vẽ của 68 khung (sau mọi hẹn giờ) của 19 phim bản nền vector fa7637a = bản mới; không mất phim
ĐẠT 12 · HỎNG 0 kiểm
  ✓ (C3-v) V7c1 VECTOR y nguyên: cây DOM + lệnh vẽ của 6 khung mở đầu (sau mọi hẹn giờ) bản mới = bản nền vector fa7637a; cùng số khung
ĐẠT 12 · HỎNG 0 kiểm
```
Sau đó dời `NEN_VEC` = 'fbc976e' ở `kiem-ve-vector.mjs`, `kiem-huy-hieu-phim-vector.mjs`, `kiem-nut-mo-dau-phim-vector.mjs` (chú thích theo mẫu, giữ chuỗi "Trước đó"), commit riêng a163e6c. Các commit chữ sau đó (chu.js) không làm đỏ B5-v (phanh so cây DOM + lệnh vẽ, chữ lời phim không nằm trong đó).

### Ca kiểm mới (kiem-gioi-thieu-part.mjs, mục 3b) và lỗi giả
Ca: mã giữ nguyên ('kep' ở tay-gap.1, 'xoay' ở tay-xoay.1); cungBoPhan; cùng tên "Tay kẹp"; đã xem kep → tay-xoay.1 chỉ một thẻ tay, là thẻ lệnh mới, đúng arm_left / arm_right, có mô tả xoay + mục làm tốt / không làm được / nhớ, chỉ ghép dòng có lệnh xoay; chưa xem → thẻ đầy đủ; đã xem xoay → tay-gap.1 không lặp thẻ; Sổ lệnh một dòng tay, đủ sáu lệnh; the-part.js gọi đúng các hàm; dòng ghép xoay chạy thật trên SanHoc (2 nhịp, cầm vật, tay về trước, nâng). Mục 3 thêm: đi đúng thứ tự game thì 'xoay' không có thẻ bộ phận mới, arm_left / arm_right vào thẻ lệnh mới ở tay-xoay.1.

Lỗi giả 1 (bỏ `nangCapCua: 'kep'`): `ĐẠT 1267 · HỎNG 8` (8 ca V8c đỏ). Lỗi giả 2 (the-part.js gọi `theCanHienX`): `ĐẠT 1274 · HỎNG 1`. Đã gỡ cả hai, về `ĐẠT 1275 · HỎNG 0`.

### Kiểm sau cùng (chạy tuần tự từng máy, không chạy `npm test`)
Ở 3dbd575 + phần chưa commit (ghép tay kẹp ở thẻ 'xoay', hoàn den-bo-phan.js):
```
kiem-ve-vector                ĐẠT 100 · HỎNG 0 kiểm
kiem-gioi-thieu-part          ĐẠT 1278 · HỎNG 0
kiem-tay-gap                  ĐẠT 250 · HỎNG 0
kiem-tay-xoay                 ĐẠT 183 · HỎNG 0
kiem-che-tay-xoay             ĐẠT 159 · HỎNG 0
kiem-rap-tay                  ĐẠT 265 · HỎNG 0
kiem-lap-rap                  ĐẠT 127 · HỎNG 0
kiem-khay                     ĐẠT 184 · HỎNG 0
kiem-huy-hieu-phim-vector     ĐẠT 12 · HỎNG 0 kiểm
kiem-nut-mo-dau-phim-vector   ĐẠT 12 · HỎNG 0 kiểm
kiem-huong-dan                ĐẠT 40 · HỎNG 0
kiem-chuoi                    ĐẠT 99 · HỎNG 0
kiem-phim-goi                 ĐẠT 41 · HỎNG 0
kiem-combo-mua-1              ĐẠT 128 · HỎNG 0 kiểm tra gói Combo.
kiem-doi-tay-xoay             ĐẠT 92 · HỎNG 0
kiem-robot-hoan-thien         ĐẠT 181 · HỎNG 0
kiem-doi-mua-1                ĐẠT 79 · HỎNG 0 kiểm tra 10 màn chương Đội phối hợp.
kiem-trum-mua-1               ĐẠT 81 · HỎNG 0 kiểm tra gói R1 xuất xưởng.
kiem-giao-dien-vector-b       ĐẠT 16 · HỎNG 0 kiểm
kiem-goi                      ĐẠT 56 · HỎNG 0
kiem-rap-du                   ĐẠT 160 · HỎNG 0
kiem-che-tay                  ĐẠT 237 · HỎNG 0
kiem-doi-gap-nem              ĐẠT 59 · HỎNG 0
kiem-bang-mau                 ĐẠT 16 · HỎNG 0 kiểm   (trước khi hoàn den-bo-phan.js: HỎNG 1 / 16, mục 4 so byte)
```
`kiem-gioi-thieu-part` chạy lại sau khi thêm ba dòng ghép (1275 → 1278); các máy còn lại chạy trước thay đổi đó, thay đổi chỉ là dữ liệu thẻ. Các máy kiểm có "'kep'" mà tôi chưa chạy (phần lớn chỉ dính mã tay trong dữ liệu màn của gói khác): banh-lui-them, cam-bien-them, che-cam-bien, che-lap, che-mau, che-nhen, che-omni, che-xich, doi-mau, doi-nam-cham, doi-sung-hoi, doi-thu-manh, hai-robot-man, hoc, hong-ngoai, khoang-cach, lo-trinh, loi-mua-2, mau, nut-de, omni, thu-ham, xich.

### Xem bằng mắt
Server cổng 4196 (đã tắt). localStorage trống, `GoLoi.datMoHet(true)`.
- `xem-vector.html`: robot hai bánh tay kẹp / tay xoay ở mở, đóng, hạ cầm vật, hạ mở, xoay trái: tay kẹp và tay xoay ở nấc trước cùng một hình (cụm trắng, khớp vành bạc, đèn cyan / cam, hai càng cong).
- `tay-gap.1`: thẻ "BỘ PHẬN MỚI · Tay · Tay kẹp" bốn lệnh, hình có khớp tròn.
- `tay-xoay.1` (sau tay-gap.1): thẻ "LỆNH MỚI · Tay kẹp" chỉ arm_left / arm_right (trước đó là thẻ lệnh mới của hai bánh vì tôi nhảy qua gói 5). Khay: "Thẻ Tay kẹp (2/3)". Sân: robot tay xoay ở nấc trước, trùng hình tay kẹp. `ThePart.daGap()` = ["hai-banh", "xoay"]; `ThePart.mo('xoay')` ra thẻ "Tay kẹp" sáu lệnh.
- Huy hiệu `tay-gap`, `che-tay` (gói 4), `tay-xoay`, `che-tay-xoay`, `combo`: tay kẹp và tay xoay cùng kiểu.

Việc dở: không còn trong phạm vi. Xem mục 3 cho phần ngoài phạm vi.

## 2. CÂU HỎI CẦN LÀM RÕ
- Brief mục 3 bảo rà và sửa "lắp ráp / chọn bộ phận" cho cùng câu chuyện, nhưng PHẠM VI không có `hoc/lap-rap.js` (cũng không có `so-lenh.js`, `thu-tu-chuong.js`). Tôi giữ phạm vi, không sửa ba tệp này; ghi ở bảng trên và mục 3.
- "Tay 'kep' vẽ y hệt tay 'xoay' ở nấc trước": y hệt về hình (cụm, khớp, đèn, dáng càng), nhưng đầu càng tay kẹp dài hơn 2 đơn vị (tay kẹp: vật ở y 102, hạ thêm 3; tay xoay: y 100, hạ thêm 2). Muốn khớp tuyệt đối phải đổi `vatKep` của tay kẹp, mà brief cấm. Mắt thường không thấy khác.
- Thẻ "lệnh mới" của 'xoay': các mục làm tốt / không làm được / nhớ cần `can: ['arm_left', 'arm_right']` mới vào được thẻ lệnh mới. Ở tay-xoay.8 (khay chỉ có arm_left) các mục này ẩn. Thẻ ở đó không hiện vì arm_left đã giới thiệu ở tay-xoay.1, nên không ảnh hưởng người chơi theo thứ tự.
- Phim gói 6 khung 2: hình vẫn là một icon khớp xoay bay từ thùng vào tay (trong `phim-mua-1.js`, ngoài phạm vi). Tôi chỉ đổi lời thành "món nâng cấp", hợp với hình đó và giống phim bánh lùi.
- Brief không có chỗ nào sai khác.

## 3. ĐỀ XUẤT
Ba chỗ ngoài phạm vi vẫn gọi tay xoay như một bộ phận riêng:

| Chỗ | Hiện | Phương án A (đề xuất) | Phương án B |
|---|---|---|---|
| `lap-rap.js` TAY 'xoay' | "Tay xoay", 3 xu | "Tay kẹp xoay", giữ giá: chọn bản nâng cấp của cùng tay | để nguyên: ở lắp ráp đây là lựa chọn mua, tên riêng giúp phân biệt |
| `so-lenh.js` nhóm 'tay-xoay', mô tả arm_left / arm_right | "Tay xoay: xoay khớp…" | "Xoay tay kẹp một nấc sang trái / phải" (khớp thẻ bộ phận) | để nguyên |
| `thu-tu-chuong.js` gói / chương | "Tay xoay", "Chế lệnh tay xoay" | để nguyên ("tay xoay" đọc như tay kẹp biết xoay) | "Tay kẹp xoay" |

Ưu tiên: sửa `so-lenh.js` (mô tả lệnh) trước vì người chơi đọc ở Sổ lệnh; `lap-rap.js` sau. Phiên khác đang làm `lo-trinh-*`, không đụng.

## 4. PHẦN CHO NGƯỜI KINH DOANH
Trước đây người chơi nhận "tay kẹp" ở gói 2, rồi tới gói 6 lại được giới thiệu như một bộ phận hoàn toàn mới là "tay xoay", hình cũng khác. Giờ robot chỉ có một cái tay kẹp từ gói 2 tới cuối. Hình của nó đã có sẵn khớp tròn. Tới gói 6, người chơi không nhận đồ mới mà chỉ mở khoá thêm hai lệnh để tay xoay sang trái hoặc sang phải, giống cách gói 5 mở thêm lệnh lùi cho bánh xe. Thẻ giới thiệu, phim, sổ lệnh và tên trên khay đều kể cùng một câu chuyện đó. Cách chơi, màn chơi và độ khó không đổi. Các bài kiểm tra tự động liên quan đều đạt.

## 5. RỦI RO CÒN LẠI và cách kiểm
- **Người chơi cũ đã có cờ 'part:xoay'**: vẫn đúng, Sổ lệnh gộp còn một dòng tay. Cách kiểm: localStorage có cả `part:kep` và `part:xoay` → `ThePart.daGap()` chỉ có 'xoay'.
- **Thẻ "lệnh mới" của tay xoay ở màn khay thiếu một lệnh** (tay-xoay.8 chỉ arm_left): mục làm tốt / nhớ ẩn. Cách kiểm: vào thẳng tay-xoay.8 với localStorage chỉ có cờ tay kẹp.
- **Đổi hình tay kẹp ở những chỗ ngoài ba phanh** (ảnh chụp tĩnh, tài liệu): cách kiểm: xem lại huy hiệu gói 2 / 4 và phim gói 2 trên bản đồ gói.
- **Icon bộ phận trong thẻ bị cắt mép trên** (có từ trước, cả tay kẹp lẫn tay xoay). Cách kiểm: thẻ "Bộ phận mới" ở tay-gap.1.
- **Ba tệp ngoài phạm vi** (mục 3) còn chữ "Tay xoay"; người chơi ở chế độ lắp ráp vẫn thấy hai lựa chọn "Tay kẹp" / "Tay xoay".
