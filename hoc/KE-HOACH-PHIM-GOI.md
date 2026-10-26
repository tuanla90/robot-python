# Kế hoạch phim ngắn mở mỗi gói (27/10/2026, user đồng ý)

**27/10 đã làm** (f027ac0 … b2671cc): bộ máy `game/phim-goi.js`, dữ liệu `game/phim-mua-1.js` (9 phim, gói combo khai sẵn), nút ▶ xem lại trên hộp gói, Cài đặt "Xem lại phim các gói", máy kiểm `kiem-phim-goi.mjs`.
Đã quyết khi nghiệm thu: R1 trong phim theo màu sơn người chơi chọn (bảng sơn không có màu lam nên không trùng R2); phim gói 10 vẽ R1 có tay xoay (trùm mới của gói 10 sẽ dùng tay xoay).

User 27/10: "mỗi gói bạn làm 1 đoạn hoạt hình ngắn giống đoạn mở đầu để giới thiệu các robot, cơ chế mới trong màn".

## 1. Có sẵn gì
- **Phim mở đầu** `hoc/game/mo-dau.js` (window.MoDau): 6 khung hoạt hình pixel, mỗi khung một câu chữ; chạm khung hay nút **Tiếp** để sang; **Bỏ qua** ở góc;
  hình lấy từ bộ vẽ sẵn có (`VeRobot.ve` cho robot, `Ve.ico` cho xe / thùng / icon đèn bộ phận, `Ve.tiles()` cho tường, thùng gỗ, cờ); chuyển động bằng CSS (`md-nhun`, `md-quay`, `md-di`, `md-bat`, `md-lac`… trong `game/choi.css`);
  tiếng qua `AmThanh.phat`. Chiếu một lần (cờ `Luu.daXem('mo-dau')`), Cài đặt có nút xem lại. Chữ ở `game/chu.js` (`md.1` … `md.6`).
- **Truyện** của phim mở đầu: xe chở linh kiện sụp ổ gà, bộ phận văng khắp xưởng (tay kẹp kẹt dưới thùng gỗ, đèn cảm biến, **bánh xích**, **cánh drone**), còn R1 chỉ có thân hai bánh. Mỗi gói bộ phận là một món R1 tìm lại.
- Bảng **"MỞ GÓI MỚI!"** (`game/bang-mo-khoa.js`, gọi từ `App.baoGoiMoi` trong `game/ung-dung.js`) hiện khi đủ sao mở gói.

## 2. Làm gì
1. **Bộ máy phim chung** `game/phim-goi.js` (window.PhimGoi): tách phần chiếu của mo-dau.js (lớp phim, khung, chữ, chấm, Tiếp, Bỏ qua, hẹn giờ tiếng) thành hàm dùng chung;
   `PhimGoi.mo(maGoi, khiXong)` chiếu phim của gói `maGoi` nếu có; MoDau giữ nguyên hành vi (dùng lại bộ máy hay để nguyên đều được, không được đổi phim mở đầu).
2. **Khi nào chiếu**: lần đầu người chơi **vào một gói** (bấm hộp gói, trước lưới màn), một lần mỗi gói (cờ `phim-goi:<mã gói>`). Hộp gói đã xem có nút nhỏ ▶ để xem lại; Cài đặt có "Xem lại phim các gói" (danh sách gói đã mở).
3. **Mỗi phim 3–4 khung, mỗi khung một câu ≤ 14 từ**, chữ ở `chu.js` (`pg.<mã gói>.<n>`). Hình chỉ dùng bộ vẽ sẵn có + CSS; R1 sơn vàng; R2 sơn lam (`son: 'lam'`).
   Khung cuối của phim bộ phận cho thấy **lệnh mới** dạng code (như khung 6 của phim mở đầu) để nối thẳng vào màn đầu của gói.
4. Phim là dữ liệu (một mảng khung cho mỗi gói) trong `game/phim-mua-1.js`; các mùa sau thêm `phim-mua-2.js`… cùng bộ máy.

## 3. Kịch bản mùa 1 (theo bảng 10 gói ở KE-HOACH-MUA-1.md)

| Gói | Khung 1 | Khung 2 | Khung 3 | Khung 4 |
|---|---|---|---|---|
| 1 Xe hai bánh | (dùng phim mở đầu, không làm mới) | | | |
| 2 Tay gắp | R1 lăn tới thùng gỗ; tay kẹp thò ra dưới gầm, lắc lắc. "Tay kẹp kẹt dưới thùng gỗ!" | tay kẹp bay lên, gắn vào mũi R1, chữ CẠCH! | R1 hạ tay, kẹp thùng, nhấc lên | code `arm_down()` `grab()` `arm_up()` hiện từng dòng; R1 đặt thùng vào ô đích khung vàng, sao lóe |
| 3 Cảm biến khoảng cách | R1 chạy thẳng, đâm tường RẦM, sao quay trên đầu | đèn cảm biến xanh lăn ra từ góc xưởng | gắn cảm biến; tia quét trước mũi, gặp tường tia đỏ, R1 dừng kịp | code `while front_clear():` + `move()`; R1 dừng sát tường |
| 4 Kho hàng (nút đè) | cửa kho đóng; trên sàn có ô nút đè | R1 lăn lên nút: cửa mở; R1 rời nút: cửa đóng sập, "?!" | R1 đặt thùng gỗ lên nút, cửa mở, R1 đi qua | (không cần) |
| 5 Bánh lùi | R1 vào ngõ cụt hẹp, hai bên tường, không quay được, "?" | hộp linh kiện bật nắp, hai bánh R1 sáng lên | R1 lùi ra khỏi ngõ, vệt bánh | code `left_back()` `right_back()` `wait()` |
| 6 Tay xoay | thùng nằm bên trái R1; R1 phải quay cả xe (mũi tên vòng, 2 nhịp) | khớp xoay lấp lánh nằm trên kệ, gắn vào tay | tay xoay sang trái nhặt thùng, xe đứng yên | code `arm_left()` `grab()` |
| 7 Cảm biến bên | R1 ở ngã ba mê cung, "?" | hai mắt nhỏ gắn hai bên hông, tia trái / phải quét | R1 bám tường phải, đi ra khỏi mê cung tới cờ | code `if right_clear():` |
| 8 Đội hai robot | cửa xưởng mở, R2 sơn lam lăn vào | R1 và R2 nhìn nhau; hai bảng code R1 / R2 hiện cạnh nhau | R1 chuyền thùng cho R2, R2 đưa vào ô đích | (không cần) |
| 9 Combo (tay xoay + cảm biến bên) | kho chật, thùng nằm hai bên lối đi | cảm biến bên nháy ở bên có thùng, tay xoay sang đúng bên đó nhặt | R1 lướt dọc lối đi, nhặt hai bên không cần quay xe, chồng thùng xong | |
| 10 R1 xuất xưởng | R1 đủ bộ (tay xoay, cảm biến) giữa xưởng, các huy hiệu mùa 1 bay quanh | cánh cửa lớn của xưởng mở, ánh sáng tràn vào | R1 lăn ra ngoài; xa xa trên đồi thấy **bánh xích** văng hôm trước (nhá mùa 2) | |

Ghi chú:
- Gói 9 và 10 chưa có màn mới (gói F, G); phim vẫn làm được vì chỉ dựa vào part đã có.
- Gói 10 đổi tên thành **"R1 xuất xưởng"** (user 27/10 đồng ý). Làm sau khi gộp gói B (cùng sửa `lo-trinh-hoc.js`).
- **User 27/10: các mùa khác cũng phải có phim** cho mọi gói. Kịch bản mùa n viết cùng lúc lên danh sách màn mùa n (KE-HOACH-MUA-n.md), dữ liệu ở `game/phim-mua-n.js`.
- Mùa sau: phim mở gói bộ phận = R1 tìm lại món văng mất (xích, cánh drone…) hay nhận món mới; phim gói sân = cơ chế mới làm gì; phim gói đội = robot mới xuất hiện.

## 4. Kiểm
- Máy kiểm `kiem-phim-goi.mjs` (Node): mọi gói mùa 1 trừ gói 1 có phim; mỗi phim 3–4 khung; mọi khóa chữ `pg.*` có trong chu.js; câu ≤ 14 từ; cờ đúng mã gói.
- Trình duyệt: người giao bấm xem từng phim (vào gói lần đầu, xem lại bằng ▶), kiểm Bỏ qua, chạm khung, không lỗi console, đúng cỡ trên màn hình điện thoại.
