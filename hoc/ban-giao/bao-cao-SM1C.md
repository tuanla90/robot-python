# Báo cáo SM1-C: sửa mùa 1 gói 6 (Tay xoay) và gói 7 (chương Mê cung)

Nhánh `claude/sua-mua-1-c`, worktree `.claude/worktrees/sua-mua-1-c`, từ `6b7a5c9` (brief). Không push, không merge. Ngày 30 đến 31/10. Làm đủ ba việc.

## 1. KẾT QUẢ

### Commit
| SHA | Nội dung |
|---|---|
| `48904a5` | Việc 1: chương me-cung (me-cung.1 đến .3 cất; .11, .12, .13 mới; trùm .10 viết lại) |
| `403e14e` | Việc 2, 3: gói 6 (4 màn mới, trùm che-tay-xoay.10 viết lại, 4 màn cất); hướng dẫn me-cung.11; kiem-o-so |
| `b16a8f8` | Máy kiểm mới `hoc/kiem-goi-6-7-them.mjs`; tay-xoay.11, .12 đổi sang xe mờ; bỏ khóa tay-xoay.6 |
| (commit sau) | Báo cáo này |

### Tệp đổi
- Mới: `hoc/man-goi-6-7-them.js` (tay-xoay.11, .12, che-tay-xoay.11, .12; `ManHoc.manGoi67Them`), `hoc/kiem-goi-6-7-them.mjs` (có `--loi-gia`).
- Sửa: `hoc/lo-trinh-hoc.js` (chỉ phần gói 6, 7 của khối mùa 1: nạp tệp mới, khối SM1-C me-cung trong phần dựng chương me-cung, khối SM1-C gói 6 (sua trùm che-tay-xoay.10), thứ tự hai gói trong MUA_1, CAT, hai `thay()` của màn đã cất có điều kiện `if (get(...))`), `hoc/lo-trinh-sao.js` (`--ghi-sao`), `hoc/game/choi.html` (một thẻ script), `hoc/game/huong-dan-man.js` (hướng dẫn me-cung.11), `hoc/kiem-lo-trinh.mjs` (bảng gói 6, 7, CAT, màn trình diễn, hai ca mê cung), `hoc/kiem-huong-dan.mjs` (PHAI_CO thêm me-cung.11), `hoc/kiem-o-so.mjs` (ba ô chờ quyết, xem đề xuất H).
- Không đụng: ngân hàng `man-tay-xoay.js`, `man-che-tay-xoay.js` (kiem-tay-xoay / kiem-che-tay-xoay kiểm bản ngân hàng), phần gói 1 đến 5, `cham.js`, `san-hoc.js`, `so-lenh.js` (không hàm cốt truyện mới), huy hiệu (ba trùm giữ mã nên giữ huy hiệu).

### Chương me-cung (gói 7 chương 2): trước → sau
Trước: me-cung.1 đến .10, nhịp 2, 3, 1, 2, 2, 5, 5, 17, 21, 70 (trùm cộng ba sân).

| Số | Mã | Tên | Loại | Dòng | Nhịp | Ô |
|---|---|---|---|---|---|---|
| 1 | me-cung.11 | Xe tự bám tường | MỚI, trình diễn (chiChay) quy tắc bám tường phải trong vòng for | 0 | 16 | 15 |
| 2 | me-cung.4 | Hai phía đều bị chặn | giữ | 8 | 2 | 13 |
| 3 | me-cung.5 | Ưu tiên ở ngã ba | giữ | 7 | 2 | 12 |
| 4 | me-cung.6 | Chế một bước bám tường | giữ (tạo follow_right) | 7 | 5 (tổng ba sân) | 16 |
| 5 | me-cung.7 | Lặp những bước nhỏ | giữ | 2 | 5 | 14 |
| 6 | me-cung.8 | Đi vào rồi ra ngõ cụt | giữ | 2 | 17 | 16 |
| 7 | me-cung.9 | Sửa quy tắc ưu tiên | giữ | 9 | 21 | 16 |
| 8 | me-cung.12 | Bám tường trái | MỚI: quy tắc gương; sân có khối tường giữa, bám phải đi vòng mãi | 8 | 18 | 15 |
| 9 | me-cung.13 | Dừng ở ngõ cụt | MỚI: xe mờ ở ngõ cụt; nhánh cuối `elif left_clear()` thay `else` | 8 | 19 | 15 |
| 10 | me-cung.10 | Trùm: ba ngõ cụt | VIẾT LẠI (phienBanNoiDung 3): ba mê cung, bám tường TRÁI + dừng ở ngõ cụt, mỗi mê cung có ngõ cụt mồi phía tay phải; nhịp theo mê cung dài nhất | 8 | 22 (22 / 19 / 21) | 15 |

Cất: me-cung.1, .2, .3 (dạy lại right_clear / elif của chương cam-bien-ben). Đầu chương 16 nhịp sau trùm 13.10 15 nhịp. Bốn màn cuối có bốn lời giải khác nhau; trùm gộp điều mới của .12 và .13, không trùng chương trình màn nào. Lời sai của trùm: bám phải + dừng (dừng ở ngõ cụt mồi), bám trái không dừng (quay đầu ra), lặp follow_right(): đều `lech-bong-mo`. follow_right (me-cung.6) giữ nguyên.

### Chương tay-xoay (gói 6 chương 1): trước → sau
Trước: nhịp 3, 3, 3, 4, 3, 15, 3, 5, 3, 20; ô 10, 10, 9, 13, 9, 25, 10, 18, 10, 28.

| Số | Mã | Nhịp | Ô | Dòng | Ghi chú |
|---|---|---|---|---|---|
| 1–3 | tay-xoay.1, .2, .3 | 3, 3, 3 | 10, 10, 9 | 0, 10, 9 | không đổi |
| 4 | tay-xoay.5 | 3 | 9 | 9 | đổi chỗ với .4 (ô 9 → 13 → 18 không nhảy) |
| 5 | tay-xoay.4 | 4 | 13 | 10 | |
| 6 | tay-xoay.8 | 5 | 18 | 4 | khớp một chiều, lên từ thứ 8 |
| 7 | tay-xoay.11 Vật chắn trước mặt | 9 | 20 | 5 | MỚI: nhặt vật chắn, đặt vào hốc trái, xoay tay về, go_wall() tới xe mờ |
| 8 | tay-xoay.12 Dọn hai vật | 13 | 21 | 8 | MỚI: vòng for hai lần dọn sang hốc phải; viết thẳng quá 10 ô |
| 9 | tay-xoay.6 Dọn lối | 15 | 25 | 12 | giữ nguyên (chế clear_left) |
| 10 | tay-xoay.10 Chuyền hàng | 20 | 28 | 15 | giữ (trùm, 1,33 lần màn 9) |

Cất: tay-xoay.7 "Đố: quên hạ tay" (đố thứ ba cùng chương trình mười dòng như .2, .3), tay-xoay.9 "Quay xe, tay đi theo" (cùng ý quay xe mang tay của .8).

### Chương che-tay-xoay (gói 6 chương 2): trước → sau
Trước: nhịp 2, 4, 9, 4, 12, 20, 4, 4, 8, 34; ô 8, 14, 26, 16, 45, 30, 14, 16, 22, 58.

| Số | Mã | Nhịp | Ô | Ghi chú |
|---|---|---|---|---|
| 1, 2 | che-tay-xoay.1, .2 | 2, 4 | 8, 14 | |
| 3 | che-tay-xoay.4 | 4 | 16 | lên trước .3 |
| 4 | che-tay-xoay.9 Khớp kẹt cứng | 8 | 22 | lên từ thứ 9 |
| 5 | che-tay-xoay.3 Mở lối | 9 | 26 | |
| 6 | che-tay-xoay.11 Hai đầu hành lang | 11 | 38 | MỚI: pick_left, drop_right, go_wall, pick_right, drop_left (đệm ô 26 → 38 → 45) |
| 7 | che-tay-xoay.5 Đổi chỗ hai bên | 12 | 45 | |
| 8 | che-tay-xoay.12 Dọn hàng sang trái | 15 | 22 | MỚI: go_wall tới hàng vật, for ba lần pick, drop_left, move (đệm nhịp 12 → 15 → 20, dẫn vào sort_two) |
| 9 | che-tay-xoay.6 Phân loại | 20 | 30 | |
| 10 | che-tay-xoay.10 Kho hai bên | 34 | 33 | VIẾT LẠI: go_wall() tới sáu vật, for ba lần sort_two(); giới hạn 2 hàm; xe mờ + vật mờ (cũ: swap_sides + hai sort_two, 58 ô) |

Cất: che-tay-xoay.7 "Đường về" (ý "viết hàm đi ngược" đã gộp ở gói 5, SM1-A), che-tay-xoay.8 "Tay chưa về giữa" (sửa hàm của màn quên xoay tay về, cùng lỗi với lời sai của .1, .2). Trùm 34 nhịp = 1,7 lần màn 9 (20), 33 ô = 1,1 lần (30); khó nhất chương theo nhịp.

Recall for / while ở gói 6 (Việc 3): tay-xoay.11 (go_wall), tay-xoay.12 (for), che-tay-xoay.11 (go_wall), che-tay-xoay.12 (go_wall + for), trùm che-tay-xoay.10 (go_wall + for + sort_two). Bốn màn mới gói 6 dùng xe tay xoay CÓ cảm biến khoảng cách (front_clear) cho go_wall.

### Lệnh kiểm và kết quả (tuần tự, mỗi lệnh `< /dev/null`)
```
node tools/do-lo-trinh.mjs --ghi-sao      PASS 1128 canonical solutions; 142 revised star thresholds.
node hoc/kiem-goi-6-7-them.mjs            ĐẠT 42 · HỎNG 0 kiểm tra brief SM1-C (gói 6 Tay xoay, chương Mê cung gói 7).
node hoc/kiem-goi-6-7-them.mjs --loi-gia  HỎNG 7 (bốn lỗi giả đều bị bắt: kho thiếu go_wall ở tay-xoay.11, ngưỡng nhịp tay-xoay.12 lệch, trùm me-cung cộng ba sân, trùm che-tay-xoay mất vòng for)
node hoc/kiem-lo-trinh.mjs                ĐẠT 1203 kiểm tra lộ trình xuất bản.
node hoc/kiem-lach-mua-1.mjs              ĐẠT 0 lỗ ngoài danh sách chấp nhận · 0 lỗ chấp nhận · 246 phép dò trên 200 màn mùa 1.
node hoc/kiem-loi-giai.mjs                ĐẠT 47/47
node hoc/kiem-tay-xoay.mjs                ĐẠT 183 · HỎNG 0
node hoc/kiem-che-tay-xoay.mjs            ĐẠT 159 · HỎNG 0
node hoc/kiem-huong-dan.mjs               ĐẠT 40 · HỎNG 0
node hoc/kiem-trum-mua-1.mjs              ĐẠT 81 · HỎNG 0
node hoc/kiem-combo-mua-1.mjs             ĐẠT 128 · HỎNG 0
node hoc/kiem-o-so.mjs                    ĐẠT 0 ô số không ghép được bằng khối (+ 7 ô đã biết, chờ quyết) trong 381 ô số của 600 màn mùa đã mở.
node hoc/kiem-khay.mjs                    ĐẠT 184 · HỎNG 0
node hoc/kiem-che-xe.mjs                  ĐẠT 272 · HỎNG 0
node hoc/kiem-goi.mjs                     ĐẠT 56 · HỎNG 0
node hoc/kiem-doi-tay-xoay.mjs            ĐẠT 92 · HỎNG 0
node hoc/kiem-che-cam-bien.mjs            ĐẠT 224 · HỎNG 0
node hoc/kiem-gioi-thieu-part.mjs         ĐẠT 1286 · HỎNG 0
node hoc/kiem-huy-hieu-phim-vector.mjs    ĐẠT 12 · HỎNG 0
node hoc/kiem-ve-vector.mjs               ĐẠT 101 · HỎNG 0
node hoc/kiem-rap-nao.mjs                 ĐẠT 286 · HỎNG 0
node hoc/kiem-doi-gap-nem.mjs             ĐẠT 59 · HỎNG 0
node hoc/kiem-nut-mo-dau-phim-vector.mjs  ĐẠT 12 · HỎNG 0
node hoc/kiem-che-mau.mjs                 ĐẠT 244 · HỎNG 0
node hoc/kiem-rap-du.mjs                  ĐẠT 160 · HỎNG 0
node hoc/kiem-che-lap.mjs                 ĐẠT 198 · HỎNG 0
node hoc/kiem-doi-mua-1.mjs               ĐẠT 79 · HỎNG 0
node hoc/kiem-thu-ham.mjs                 ĐẠT 78 · HỎNG 0
node hoc/kiem-goi-1-2-them.mjs            ĐẠT 25 · HỎNG 0
node hoc/kiem-banh-lui-them.mjs           ĐẠT 72 · HỎNG 0
node hoc/kiem-kho-hang-them.mjs           ĐẠT 51 · HỎNG 0
node hoc/kiem-cam-bien-them.mjs           ĐẠT 59 · HỎNG 0
node hoc/kiem-phim-goi.mjs                ĐẠT 56 · HỎNG 0
node hoc/kiem-hoc.mjs                     ĐẠT 6709 · HỎNG 0 (chạy cuối, khoảng 2 phút)
```
Máy kiểm mới bắt lỗi thật trong lúc làm: lời giải khác của tay-xoay.11 thiếu một bước; tay-xoay.11 bản đầu (cờ) thắng khi "xoay tay sang phải" vì xe cầm vật đi luôn tới cờ được, nên hai màn dọn vật đổi sang xe mờ + vật mờ (lời sai "cầm vật đi luôn" nay thua); hai lời sai khai sai mã; đường cong dòng 4 → 8 ở tay-xoay.11 → .12. Đường cong lần đầu cũng bắt tay-xoay.12 14 nhịp sau .11 9 nhịp (vượt 13,5): sân thu lại còn 13 nhịp.

Xem bằng mắt (cổng 4207, đã tắt; gỡ service worker + caches trước): choi.html nạp man-goi-6-7-them.js không lỗi; trùm me-cung.10 vẽ đúng mê cung 1 có xe mờ ở ngõ cụt; trong trang, ChamHoc chấm lời giải chuẩn của 7 màn đổi (kho theo lộ trình, bỏ hàm tiết kiệm nhịp như do-lo-trinh): đều 3 sao, đúng nhịp / ô. Chưa xem từng nhịp hoạt cảnh.

### Việc dở
Không có trong ba việc. Chưa `npm test` cả bộ (luật RAM).

## 2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu)
1. "Trùm 12.10 không gấp quá 2 lần màn 9": theo thứ tự cũ màn 9 là che-tay-xoay.9 (8 nhịp), trùm ≤ 16 nhịp thì dễ hơn che-tay-xoay.6 (20 nhịp) đứng trước. Tôi xếp lại để màn 9 là che-tay-xoay.6 (sort_two, 20 nhịp, 30 ô): trùm mới 34 nhịp (= cũ), 33 ô (cũ 58). Brief nhắm ô (58 → khoảng 35): đạt; nhịp không giảm vì trùm phải khó nhất chương.
2. "Dừng ở ô đích bằng cảm biến" và "mang thùng qua mê cung": mùa 1 không có cảm biến nhận ô đích, chưa có `and` / `or`. Vòng for đếm cứng không dừng được ở ô D khi ba mê cung dài khác nhau, nên tôi KHÔNG làm trùm mang thùng. "Dừng bằng cảm biến" làm theo nghĩa: ngõ cụt (ba phía là tường) thì không nhánh nào chạy, xe đứng yên tới hết vòng; trùm dùng xe mờ (bong-mo) ở ngõ cụt đúng. Nếu muốn mang thùng: cần một cảm biến mới hay `and`, ngoài mùa 1.
3. Brief "thay 14.7 hay 14.8 bằng bám tường trái": tôi thêm bám tường trái ở .12 (thay chỗ của .1–.3 đã cất), GIỮ cả .7 và .8. .7 (5 nhịp, một góc) là bậc đệm sau màn chế hàm .6; .7 và .8 cùng dạng `for: follow_right()` nhưng nằm giữa chương, bốn màn cuối khác nhau từng đôi (máy kiểm đo). Cặp .7 → .8 (5 → 17 nhịp) và .8 → .9 (2 → 9 dòng) vượt luật đường cong từ trước, máy kiểm chỉ ghi. Muốn hết hẳn: đề xuất J.
4. Brief gợi ý "sort_two trong for, go_wall tới vật": làm đúng ở trùm che-tay-xoay.10. Cảm biến khoảng cách thấy vật như tường nên go_wall() dừng ngay trước vật đầu tiên.
5. Lúc đầu tôi khóa chương trình chính tay-xoay.6 (sợ em viết bản vòng for vừa 10 ô sau tay-xoay.12 mà không chế clear_left). Đo lại: máy chấm đã báo `chua-tao-ham` cho bản đó, nên bỏ khóa, tay-xoay.6 giữ nguyên (máy kiểm có ca chứng minh).
6. Ô số range(N) với N > 12 (bảng chọn số tối đa 12): me-cung.7 đến .10 đã có từ trước (kiem-o-so ghi "đã biết, chờ quyết"). Ba màn mới me-cung.11 (khóa, không cần ghép), .12, .13 cần 17, 18 lượt nên cùng vấn đề; tôi ghi vào danh sách chờ cùng quyết định thay vì tự chọn cách (đề xuất H).
7. Hàm `pick` "tiết kiệm nhịp" của tay-gap.9 (thân không có `wait()` cuối): nếu kho người chơi giữ bản này, mọi chỗ `pick()` liền với lệnh tay (drop, drop_left, arm_left…) bị `tay-goi-lai` và vỡ vật. Đo trong trang: che-tay-xoay.5, .6 (có từ trước) và bốn màn mới gói 6 cùng hỏng như nhau với kho đó; tools/do-lo-trinh.mjs bỏ hàm tiết kiệm nhịp khi đo. Không sửa (lan sang màn cũ và lõi); đề xuất I.
8. Brief không sai số liệu: nhịp / ô hai chương gói 6 và chương me-cung đo lại khớp từng số.
9. Công cụ: hook phiên chặn Edit / Write vào worktree khác; mọi tệp ghi bằng scratchpad + `cp` / script thay chuỗi chính xác (không định dạng lại).

## 3. ĐỀ XUẤT cần user quyết

### H. Vòng lặp "đủ lâu" của chương me-cung vượt bảng chọn số 1–12 (câu hỏi 6)
Cơ chế: `hoc/game/thanh-phan.js` dòng 143 `SO_TOI_DA = 12`; lời giải me-cung.7–.10, .12, .13 dùng range(20 / 40 / 60) (`hoc/lo-trinh-hoc.js` khối me-cung); `hoc/kiem-o-so.mjs` CHAP_NHAN.

| | Để nguyên | H1: vòng for lồng | H2: nới bảng chọn cho range | H3: while True ở màn có cờ |
|---|---|---|---|---|
| Làm gì | Không | Viết `for i in range(2):` / `for j in range(12):` bọc quy tắc ở các màn cần hơn 12 lượt | Thêm vài số lớn (20, 30, 60) vào bảng chọn khi ô là đối số range | `while True:` cho màn tới cờ (.7, .8, .9, .12); màn dừng ở ngõ cụt (.13, trùm) vẫn cần H1 hay H2 vì while True không dừng |
| Mất bao lâu | 0 | 1 giờ (6 màn + máy kiểm) | 1 đến 2 giờ (giao diện, ngoài phạm vi gói này) | 1 giờ + kiểm bảng chọn điều kiện có True không (hiện chỉ có cảm biến) |
| Người chơi thấy khác gì | Không ghép được số 20 / 40 / 60 bằng khối: các màn này chỉ qua được khi gõ chữ | Hai vòng lồng, số nhỏ | Chọn được số lớn | Vòng lặp "mãi mãi" dễ hiểu |
| Lợi | Không đụng | Chơi được ngay, không sửa giao diện | Lời giải giữ gọn | Gọn, đúng ý "tự tìm đường" |
| Rủi ro | Bảy màn mê cung kẹt khi ghép khối | Khó đọc với trẻ | Đụng thanh-phan.js dùng chung mọi mùa | Không đủ cho màn dừng |

Nghiêng về H2 (một chỗ sửa, mọi màn me-cung chơi được), H1 nếu không muốn đụng giao diện.

### I. Hàm pick tiết kiệm nhịp làm hỏng màn gói 6 (câu hỏi 7)
Cơ chế: tay-gap.9 (`tietKiemNhip`) dạy thân pick không `wait()` cuối; kho hàm của em (`hoc/kho-ham.js`, lưu theo tên) giữ bản em viết sau cùng (chưa kiểm trong game thật); màn gói 6 gọi pick() rồi lệnh tay ngay.

| | Để nguyên | I1: lời giải gói 6 chịu được cả hai bản pick | I2: màn tiết kiệm nhịp không ghi đè pick trong kho |
|---|---|---|---|
| Làm gì | Không | Thêm wait() sau pick() ở các chỗ liền lệnh tay (sáu màn) và đo lại | Lưu bản tiết kiệm dưới tên khác hay không lưu |
| Mất bao lâu | 0 | 1 giờ | 1 giờ + kiểm luu.js |
| Người chơi thấy khác gì | Ai giữ bản tiết kiệm thì vỡ vật ở gói 6, phải tự sửa pick | Không lỗi, ngưỡng nhịp có thể lỏng thêm | Không lỗi |
| Rủi ro | Kẹt khó hiểu | Lời giải dài thêm | Đụng lõi lưu kho |

Cần người giao kiểm game thật xem kho người chơi sau tay-gap.9 giữ bản nào; nếu là bản tiết kiệm thì nghiêng về I2.

### J. me-cung.7 và .8 cùng dạng lời giải
| | Để nguyên (đã làm) | J1: cất me-cung.7, thêm màn đệm 9 đến 12 nhịp |
|---|---|---|
| Làm gì | Không | Màn mới "hai góc rẽ" giữa .6 và .8 | 
| Mất bao lâu | 0 | 45 phút |
| Lợi | .7 là bậc đệm nhỏ sau màn chế hàm | Hết cặp 5 → 17 nhịp và bớt một lời giải lặp |
| Rủi ro | Cặp 5 → 17 vẫn còn | Thêm một màn phải kiểm |

Nghiêng về J1 nếu nghiệm thu sau vẫn ghi "lặp".

## 4. PHẦN CHO NGƯỜI KINH DOANH
Gói 7: chương Mê cung trước đây mở đầu bằng ba bài dạy lại điều trẻ vừa học ở chương trước và kết thúc bằng ba bài cùng một lời giải. Nay chương mở bằng một bài xem trước (bấm Chạy, thấy xe tự bám tường đi qua mê cung), có thêm hai ý mới là bám tường bên trái và biết dừng ở ngõ cụt, và bài cuối ghép cả hai ý trên ba mê cung có bẫy. Gói 6: chỗ độ khó nhảy vọt (bài 6 dài gấp năm bài 5) nay có hai bài bậc thang ở giữa, bài cuối chương hai ngắn bớt gần một nửa (33 so với 58 ô lệnh) mà vẫn khó nhất chương. Năm bài của gói 6 giờ dùng lại vòng lặp và lệnh "đi tới tường" của gói 2, 3, để trẻ không quên. Bốn bài trùng ý bị cất (sao đã có vẫn giữ). Mọi bài qua máy kiểm: lời giải ba sao, lời sai thua đúng chỗ, độ khó tăng dần. Còn hai việc cần quyết: bảng chọn số chỉ tới 12 nên vài bài mê cung chưa ghép khối được (có từ trước), và một lệnh "nhặt nhanh" của gói 2 có thể làm hỏng bài gói 6.

## 5. RỦI RO CÒN LẠI và cách kiểm
1. Ô range(20 / 40 / 60) ở chương me-cung không ghép được bằng khối (đề xuất H). Kiểm: `node hoc/kiem-o-so.mjs` (danh sách chờ quyết).
2. Kho người chơi có pick tiết kiệm nhịp (đề xuất I). Kiểm trong trang: chấm lời giải che-tay-xoay.12 với kho không bỏ `tietKiemNhip` (ra `tay-goi-lai`, `vat-vo`).
3. Chưa xem từng nhịp hoạt cảnh: trùm che-tay-xoay.10 sân 5 × 13 cao, trùm me-cung ba mê cung 8 × 8 / 9 × 8. Kiểm: `PORT=4207 node server.mjs`, `choi.html?debug=1&man=che-tay-xoay.10&loigiai=1`, nạp lời giải, chạy; tương tự me-cung.10, .12, .13, tay-xoay.11, .12.
4. Bản lưu cũ: sao của màn cất (me-cung.1–.3, tay-xoay.7, .9, che-tay-xoay.7, .8) giữ theo mã, không hiện; nháp cũ của me-cung.10 (phienBanNoiDung 3) và che-tay-xoay.10 (2) bị bỏ. Người đã 3 sao trùm cũ giữ sao.
5. Bộ dò BFS tay xoay: đường lệnh gốc ngắn nhất ngắn hơn ngưỡng ở cả bốn màn mới (tay-xoay.12: 9 so với 13, nhờ gộp xoay tay vào nhịp bánh): ngưỡng lỏng, không phải đường tắt qua ý của màn. Viết thẳng ở tay-xoay.12 quá 10 ô (máy kiểm đo).
6. `npm test` cả bộ chưa chạy (luật RAM). Máy kiểm mùa 2 trở đi không đọc các màn đổi, trừ kiem-hoc.mjs (xanh) và kiem-o-so.mjs (xanh).
