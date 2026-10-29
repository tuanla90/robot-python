# Báo cáo HD2: vá tiếp hướng dẫn mùa 1 (29/10/2026, agent fable)

Nhánh `claude/hd2-huong-dan-mua-1` (worktree riêng, từ 9c80b13). Không push, không merge, không đụng main. Thứ tự làm theo brief: việc 2 → 3 → 1 → 4.

## 1. KẾT QUẢ

### Commit (cũ → mới)
| SHA | Nội dung |
|---|---|
| 9c417c8 | Việc 2: vong-lap.1 thành màn trình diễn `for` (chiChay, `range(6)` thắng ngay khi bấm Chạy) |
| c53f8b8 | Việc 3: che-cam-bien.10 "Kho hàng" hai kho dài ngắn khác nhau, hết lỗ chấp nhận |
| 8e8a541 | Việc 1 (lõi): cờ `damLaThua`, đâm tường là thua ở 58 màn ép mùa 1; nhãn + câu đề bài; máy dò tiêu chí mới, `--loi-gia-dam` |
| d197547 | Việc 1 (máy kiểm): ca cờ tắt / bật ở kiem-khoang-cach + kiem-cam-bien-them; 5 lời sai gói 9–10 theo luật mới |
| 64d8a27 | Việc 4 (gói 4, 6): nut-de.1 và tay-xoay.1 thành màn trình diễn |
| 2461b9a | Sửa regex máy kiểm tay-xoay (lỗi do sed khi sửa dòng 373 ở commit trước) |
| 1950974 | Việc 4 (gói 7): cam-bien-ben.1 trình diễn `left_clear` lên đầu chương, che-cam-bien.4 đứng thứ hai |
| (cuối) | Báo cáo này |

### Tệp đổi (17 tệp, không tạo tệp mới ngoài báo cáo)
- Lõi: `hoc/san-hoc.js` (cfg `damLaThua`, mặc định tắt: nhịp có `dam-tuong` mà chưa thắng thì `dungSom = 'dam-tuong'`, robot đứng lại ở cú đâm), `hoc/cham.js` (đưa `man.damLaThua` xuống lõi ở chấm một robot; lời `dam-tuong` nói thêm luật, kèm `damLaThua: true`; không thêm `chua-toi-co` khi dừng vì đâm).
- Lộ trình: `hoc/lo-trinh-hoc.js` (sua vong-lap.1 / nut-de.1 / tay-xoay.1 / cam-bien-ben.1 chiChay; che-cam-bien.10 hai kho; `DAM_LA_THUA` 58 màn, `M.manDamLaThua`; thứ tự chương cam-bien-ben), `hoc/lo-trinh-sao.js` (đo lại, sao các màn đổi không thay đổi), `hoc/man-combo-mua-1.js` + `hoc/man-trum-mua-1.js` (5 lời sai: `phaiCoMa` → `dam-tuong`).
- Game: `hoc/game/man-choi.js` (nhãn trên sân ghép với canhBao; câu luật trong đề bài), `hoc/game/chu.js` (`choi.damLaThua` "Đâm tường là thua", `choi.damLaThuaDe`), `hoc/game/huong-dan-man.js` (H mới: vong-lap.1, nut-de.1, tay-xoay.1, tay-xoay.2, cam-bien-ben.1; phiên bản vong-lap.1 / tay-xoay.1 = 2).
- Máy kiểm: `kiem-lach-mua-1.mjs`, `kiem-lo-trinh.mjs`, `kiem-huong-dan.mjs`, `kiem-cam-bien-them.mjs`, `kiem-khoang-cach.mjs`, `kiem-nut-de.mjs`, `kiem-tay-xoay.mjs`; `hoc/ban-giao/bang-hd1.md` sinh lại (thêm cột "đâm là thua").

### Màn gắn cờ đâm-là-thua (58 = mọi màn ÉP theo máy dò, trừ 3 màn trình diễn chiChay; lời giải chuẩn không màn nào đâm tường ở sân nào, máy dò kiểm)
xuong-ham.1 .2 .3 .4 .5 .7 .9 .10 · tay-gap.5 .6 .10 · vong-lap.2 .3 .4 .6 .10, che-lap.5 · khoang-cach.12 .13 .5 · che-cam-bien.1 .2 .7 .13 .15 · che-xe.1 .2 .4 .6, che-tay.1 .2 .4 .5 .6, che-lap.7 .9 · tay-xoay.6 .10, che-tay-xoay.1 .2 .4 .5 .6 · che-cam-bien.4, cam-bien-ben.5 .7, me-cung.6 .9 · combo.3 .7 .8, che-combo.3 .7 .9, che-cam-bien.10 · robot-hoan-thien.11, trum-mua-1.3 .6 .9 .10.
Không gắn: vong-lap.1, khoang-cach.1, khoang-cach.2, nut-de.1, tay-xoay.1, cam-bien-ben.1 (chiChay, chương trình khoá); mọi màn mùa 2; màn hai robot (không có màn ép nào là màn đội).

### Bảng lách trước / sau (lách ở khái niệm đang ép mà THẮNG; máy dò `node hoc/kiem-lach-mua-1.mjs`)
| Màn | Lách | Kết quả cũ | Kết quả mới |
|---|---|---|---|
| khoang-cach.12 Hỏi rồi mới bước | A2 `move()` ×4 | 1 sao | THUA (sân 1 dừng ở cú đâm nhịp 3) |
| khoang-cach.12 | B / B2 `for i in range(4): move()` | 2 sao | THUA |
| khoang-cach.13 Hai hành lang | B2 `for i in range(6): move()` | 2 sao | THUA |
| che-cam-bien.1 Đi cẩn thận | B / B2 thân safe_move đếm cứng | 2 sao | THUA |
| che-cam-bien.7 Thừa chữ not | B | 2 sao | THUA |
| che-cam-bien.10 Kho hàng | B thân `for i in range(2): back()` | 3 sao (LỖ chấp nhận) | THUA (kho 2 lùi lọt hốc trái, lệch bóng mờ) |
| trum-mua-1.6 Cất vào hốc trống | B | 2 sao | THUA |
| vong-lap.2 / .4 / .10 | A2 duỗi vòng for (`move()` ×6…) | 2 sao | 2 sao (không đổi: không húc tường; ép bằng sao ô như HD1) |
Máy dò: trước 0 lỗ + 1 chấp nhận; sau 0 lỗ + 0 chấp nhận (tiêu chí chặt hơn cho màn có cờ: lách đếm cứng bỏ if / while / not mà thắng dù mấy sao là LỖ). `--loi-gia` (gộp kc.13 một sân) và `--loi-gia-dam` (chấm kc.12 bằng bản bỏ cờ) đều BẮT ĐƯỢC.

### Màn trình diễn mới của từng gói (bấm Chạy là 3 sao, nhãn "Chỉ chạy", bong bóng chỉ nút Chạy rồi chỉ dòng khối mới)
| Gói | Cái mới (cách tôi hiểu) | Màn trình diễn | Màn kế tiếp ép |
|---|---|---|---|
| 2 (việc 2) | `for` | vong-lap.1 (mới: chiChay, `range(6)`) | vong-lap.2 tự chèn for + đổi số (H đã có bước đổi số) |
| 4 | cơ chế nút đè / thùng giữ cửa (không phải lệnh) | nut-de.1: carry() đặt thùng lên M, cửa C mở | nut-de.2: cửa đóng, đặt thùng lên nút là cách duy nhất |
| 6 | lệnh arm_left / arm_right | tay-xoay.1: tay xoay sang hông nhặt, xoay về trước đặt | tay-xoay.2: mã mẫu sai bên, phải đổi arm_left → arm_right (H mới) |
| 7 | lệnh left_clear / right_clear | cam-bien-ben.1 đưa lên ĐẦU chương: tới tường, hỏi bên trái, rẽ | che-cam-bien.4 (nay màn 2): chế to_gap() với right_clear, ba sân, có cờ đâm-là-thua |
| 5 | lệnh left_back / right_back | CHƯA (xem mục 3a) | che-xe.4 chế back() đang là màn 1 |
| 8 | hai robot, hai chương trình | CHƯA (xem mục 3b) | hai-robot.1 có H từng bước (chạm R2, go_wall) |

### Lệnh kiểm và kết quả nguyên văn (chạy tuần tự, không `npm test`)
```
node hoc/kiem-lach-mua-1.mjs              → ĐẠT 0 lỗ ngoài danh sách chấp nhận · 0 lỗ chấp nhận · 241 phép dò trên 200 màn mùa 1.
node hoc/kiem-lach-mua-1.mjs --loi-gia    → Lỗi giả (gộp khoang-cach.13 về một sân): máy dò BẮT ĐƯỢC (ĐẠT)
node hoc/kiem-lach-mua-1.mjs --loi-gia-dam → Lỗi giả (bỏ cờ damLaThua của khoang-cach.12 khi chấm, lõi không dừng khi đâm): máy dò BẮT ĐƯỢC (ĐẠT)
node hoc/kiem-lo-trinh.mjs                → ĐẠT 894 kiểm tra lộ trình xuất bản.
node hoc/kiem-huong-dan.mjs               → ĐẠT 40 · HỎNG 0
node hoc/kiem-cam-bien-them.mjs           → ĐẠT 59 · HỎNG 0 kiểm tra 7 màn mới gói Cảm biến khoảng cách.
node hoc/kiem-khoang-cach.mjs             → ĐẠT 87 · HỎNG 0
node hoc/kiem-che-cam-bien.mjs            → ĐẠT 224 · HỎNG 0
node hoc/kiem-combo-mua-1.mjs             → ĐẠT 128 · HỎNG 0 kiểm tra gói Combo.
node hoc/kiem-trum-mua-1.mjs              → ĐẠT 81 · HỎNG 0 kiểm tra gói R1 xuất xưởng.
node hoc/kiem-nut-de.mjs                  → ĐẠT 62 · HỎNG 0 kiểm tra chương Nút đè.
node hoc/kiem-tay-xoay.mjs                → ĐẠT 183 · HỎNG 0
node hoc/kiem-hoc.mjs                     → ĐẠT 6715 · HỎNG 0
node hoc/kiem-goi.mjs 56 · kiem-dang-ky 9 · kiem-chuoi 99 · kiem-doi-mua-1 79 · kiem-banh-lui-them 49 · kiem-tay-gap 250 · kiem-che-xe 271 · kiem-che-tay 237 · kiem-che-lap 198 · kiem-che-tay-xoay 159 · kiem-thu-ham 78 · kiem-hai-robot-man 98 · kiem-mau 148 (đều HỎNG 0)
node tools/do-lo-trinh.mjs --ghi-sao      → PASS 834 canonical solutions; 134 revised star thresholds.
```
Lỗi giả cho máy kiểm của cham: tắt dòng dừng trong san-hoc.js → kiem-khoang-cach đỏ 3 ca, kiem-cam-bien-them đỏ 2 ca; gỡ → xanh.

Xem bằng mắt (server cổng 4192, localStorage trống, trình duyệt trong app, đã TẮT server): khoang-cach.12 có nhãn "Đâm tường là thua" góc sân, đề bài có câu luật; chơi `move()` ×4 → NHỊP 3, sân 1 dấu X đỏ, xe đứng lại trước tường, bảng "Chưa được" đọc: "...Màn này đâm tường là thua: chương trình dừng ngay tại cú đâm, robot không chạy tiếp. Sửa dòng gây ra cú đâm rồi chạy lại." vong-lap.1: nhãn "Chỉ chạy", bấm Chạy → TỚI CỜ 3 sao (5 ô, 6 nhịp). che-cam-bien.10: dải hai sân, nhãn đâm-là-thua, đề bài "Hai kho...". nut-de.1 / tay-xoay.1 / cam-bien-ben.1: nhãn "Chỉ chạy", bấm Chạy → 3 sao (10 / 3 / 5 nhịp).

### Việc dở
- Gói 5 (bánh lùi) và gói 8 (hai robot) chưa có màn trình diễn: xem mục 3a / 3b (cần user quyết vì phải thêm màn hoặc sửa máy chấm đội).
- Chưa chơi tay các màn có cờ ngoài kc.12 trong trình duyệt (lời giải chuẩn 834 bài đã chấm máy; 5 lời sai gói 9–10 đổi mã).

## 2. CÂU HỎI CẦN LÀM RÕ
1. Brief việc 1: "`move()` ×4 vẫn thắng 1 sao (kc.12), `for` vẫn 2 sao (kc.13)": ĐÚNG, kiểm lại bằng máy chấm (bản cũ: thắng 1 sao / 2 sao, có `dam-tuong`).
2. Brief: "lách phải THUA (không chỉ thiếu sao)". Tôi thu hẹp cho đúng mục tiêu (1) "đếm cứng thay if / while": màn có cờ thì lách bỏ **if / while / not** mà thắng là LỖ; lách bỏ **for** (duỗi vòng lặp thành `move()` ×6 ở vong-lap.2 / .4 / .10) vẫn chỉ ép bằng sao ô như HD1, vì không húc tường được nên cờ không đổi gì. Nếu muốn ép for thật thì phải đổi khung (`canFor: 'tran-khung'` như vong-lap.3), không thuộc brief.
3. Brief việc 3 "thêm sân thứ hai... đếm cứng không thắng cả hai": với luật cũ (húc tường chỉ mất nhịp) thì hai kho dài ngắn CHƯA đủ: đếm thừa (range(3)) vẫn thắng kho ngắn nhờ húc tường. Tôi làm kho 2 có hốc trái ĐỐI DIỆN cửa (lùi quá là lọt hốc, đặt hàng lệch) nên ép được không cần cờ; sau đó màn này cũng có cờ đâm-là-thua (màn ép theo máy dò) nên ép hai lớp. Nhịp theo sân dài nhất (mặc định) nên sao / đường cong không đổi.
4. Cờ gắn cả gói 9–10 (recall) vì máy dò coi màn có thân hàm người chơi viết là màn ép (combo.3, trum-mua-1.x...). Hệ quả: 5 lời sai ở combo.8, che-combo.9, trum-mua-1.3 / .6 / .10 đổi mã mong đợi từ `vong-vo-han` / `lech-bong-mo` sang `dam-tuong` (xe dừng ngay ở cú đâm thay vì lặp mãi). Tôi thấy lời "đâm là thua" dễ hiểu hơn "vòng lặp chạy mãi"; nếu user không muốn luật mới ở gói recall thì bỏ 11 mã cuối khỏi `DAM_LA_THUA` và sửa máy dò (`epThat` trừ gói 9–10).
5. Brief gợi ý "nhãn cạnh tên màn": tôi dùng nhãn ⚠ có sẵn trên sân (`SanVe.datCanhBao`, ghép với canhBao của màn dây ngược bằng " · ") + câu trong đề bài; không thêm phần tử mới. Nhãn nowrap có thể bị cắt "..." ở màn vừa có canhBao vừa có cờ (che-xe.1 / .2 "Dây bánh trái đấu ngược · Đâm tường là thua") trên màn hẹp: chưa xem bằng mắt ở 360 px.
6. chiChay ở màn đội (gói 8): cham.js `ganCoDinh` chỉ khoá `maMau.chinh`, không khoá `maMau.doi[i]`; giao diện khoá theo `doi[i].coDinh`. Không ép theo brief, ghi ở 3b.
7. kiem-nut-de.mjs vốn đòi mọi màn có `loiGiaiKhac`, mã mẫu chưa thắng, và đường cong 1,5× không bù: tôi nới cho màn chiChay (mã mẫu khoá phải thắng 3 sao; đường cong so với số dòng mã mẫu người chơi đã đọc). Các máy kiểm gói khác (kiem-cam-bien-them, kiem-combo) đã có bù dòng +3 nên không vướng.
8. Lỗi quy trình: commit 64d8a27 chứa một dòng regex hỏng ở kiem-tay-xoay.mjs (sửa bằng sed mất dấu chéo), sửa ngay ở 2461b9a. Khi gộp nên lấy cả hai.

## 3. ĐỀ XUẤT cần user quyết
### 3a. Màn trình diễn bánh lùi (gói 5). Cơ chế thật: chương banh-lui đủ 10 màn; màn 1 che-xe.4 là màn CHẾ back() (`taoHam`, lo-trinh-hoc.js MUA_1 banh-lui), back() được che-xe.6 (park) và các màn sau dùng, nên không biến che-xe.4 thành chiChay được.
| | A. Thêm banh-lui.5 trình diễn, cất một màn | B. che-xe.4 thành trình diễn, chế back() dời sang che-xe.5 | C. Để nguyên |
|---|---|---|---|
| Làm gì | Màn mới (man-banh-lui-them.js): main khoá `left_back(); right_back(); wait()` ×2, xe mờ; cất che-xe.8 hoặc banh-lui.2 (cần đọc hai màn đó) | che-xe.4 khoá main gọi back() với back() là hàm của màn; che-xe.5 (đang sửa u_turn) đổi thành tạo back() | không |
| Mất bao lâu | 45 phút (màn + sao + kiem-banh-lui-them THU_TU + H) | 40 phút, nhưng u_turn một nhịp mất chỗ dạy | 0 |
| Ảnh hưởng | đường cong kiem-banh-lui-them, bảng mở khoá gói | kho hàm của em (u_turn), che-tay.* | không |
| UI trước → sau | che-xe.4 tạo hàm ngay → có màn xem lùi trước | như A | như cũ |
| Người chơi thấy | bấm Chạy thấy xe lùi một ô | như A | vào chương là chế hàm, có H từng bước |
| Lợi / rủi ro | đúng khuôn / mất một màn luyện | không mất màn / mất bài sửa u_turn | không tốn / gói 5 lệch khuôn |
Nghiêng về A nếu user muốn đủ khuôn; che-xe.4 hiện đã có H từng bước nên C chấp nhận được.

### 3b. Màn trình diễn hai robot (gói 8). Cơ chế thật: `cham.js:1141 ganCoDinh` chỉ thay `baiLam.chinh` bằng `maMau.chinh`; màn đội chấm `maMau.doi`; `man-choi.js:211` khoá từng robot theo `doi[i].coDinh`.
| | A. Mở rộng ganCoDinh cho đội + hai-robot.1 chiChay | B. Để nguyên (H từng bước ở hai-robot.1) |
|---|---|---|
| Làm gì | cham.js +3 dòng (chiChay && maMau.doi → thay doi[i].chinh); hai-robot.1 maMau R2 = go_wall, chiChay; H dời "chạm R2" sang hai-robot.2 | không |
| Mất bao lâu | 40 phút (kèm kiem-hai-robot-man, kiem-lach bỏ qua đội) | 0 |
| Người chơi thấy | bấm Chạy thấy hai robot chạy cùng lúc, rồi màn 2 mới tự chạm R2 | màn 1 đã phải chạm R2 viết go_wall (có bong bóng) |
| Rủi ro | cham.js đang bị phiên mùa 2 sửa song song | cái mới của gói (chạm thẻ R2) chưa được "xem trước" |
Nghiêng về B lúc này (hai-robot.1 chỉ cần một khối, H đã dẫn), làm A sau khi mùa 2 gộp.

### 3c. Phạm vi cờ đâm-là-thua ở gói 9–10 (xem câu hỏi 4): giữ (đang làm) hay bỏ 11 màn recall. Nghiêng về giữ: luật nhất quán "màn ép thì húc tường là thua", lời chẩn đoán rõ hơn.

## 4. PHẦN CHO NGƯỜI KINH DOANH
Trước đây ở nhiều màn dạy khối mới, trẻ có thể "ăn gian" bằng cách đếm bước cứng; xe húc tường vài lần nhưng vẫn qua màn với một hai sao. Nay ở 58 màn đang dạy khối mới, xe húc tường là thua ngay: xe dừng tại chỗ đâm, trên sân có nhãn báo trước luật, và lời giải thích nói rõ dòng nào gây ra. Màn "Kho hàng" ở gói Combo có thêm kho thứ hai nên cách đếm bước không còn qua được. Bốn gói (Vòng lặp, Nút đè, Tay xoay, Cảm biến bên) có thêm màn mở đầu chỉ cần bấm Chạy để xem khối hoặc lệnh mới làm gì, giống gói Cảm biến đã làm đợt trước. Tiến độ và sao đã lưu của người chơi không mất. Còn hai gói (Bánh lùi, Hai robot) chờ quyết định vì cần thêm màn hoặc sửa máy chấm đội.

## 5. RỦI RO CÒN LẠI và cách kiểm
- 58 màn đổi luật lõi nhưng chỉ kc.12 được chơi tay trong trình duyệt; lời giải chuẩn, lời giải khác và lời sai đã chấm máy (do-lo-trinh 834, máy kiểm từng gói). Kiểm: chơi tay vài màn có cờ ở các gói khác (xuong-ham.1, che-xe.1, trum-mua-1.6), đặc biệt màn có cả canhBao dây ngược (nhãn ghép).
- Nhãn ⚠ ghép hai chuỗi có thể bị cắt ở khổ 360 px. Kiểm bằng mắt che-xe.1 ở 360 × 640; nếu cắt thì đổi sang hai nhãn hoặc rút chữ.
- Hoạt cảnh khi dừng sớm vì đâm: vết chỉ có tới nhịp đâm (như vật vỡ), giao diện đã chạy đúng ở kc.12; chưa xem màn bong-mo có cờ (che-xe.1) và màn dua-vat có cờ (tay-gap.5). Kiểm: chơi tay một bài húc tường ở hai màn đó.
- Phiên mùa 2 sửa cùng cham.js / man-choi.js / lo-trinh-hoc.js: diff của HD2 ở ba tệp này chỉ cộng dòng (cham.js 8 dòng, man-choi.js 2 dòng, lo-trinh-hoc.js một khối cuối), nhưng vẫn có thể đụng khi gộp. Kiểm: gộp HD2 trước mùa 2 hoặc rebase mùa 2 lên.
- Máy dò coi cờ phải khớp đúng tập màn ép: phiên sau đổi thứ tự chương mùa 1 (màn mới lên ≤ 4) sẽ thấy máy dò HỎNG "màn ép mà chưa gắn cờ": là chủ ý, thêm mã vào `DAM_LA_THUA` sau khi kiểm lời giải chuẩn không đâm.
- Đường cong cam-bien-ben đổi vì cam-bien-ben.1 lên đầu (màn 1 nhịp 5 dòng 0, màn 2 che-cam-bien.4 nhịp 11): chương này không có máy phanh (đã nêu ở HD1).
