# Nghiệm thu độc lập mùa 1 (mua-1, "Kho hàng")

Dữ liệu: lộ trình xuất bản `hoc/lo-trinh-hoc.js` (nạp qua Node, đúng như choi.html), 10 gói, 20 chương, 200 màn. Đã đối chiếu với công cụ xem-goi.cjs bản đã sửa: cùng danh sách gói / chương.
Kế hoạch đối chiếu: hoc/KE-HOACH-MUA-1.md (bảng 10 gói, mục "Đường cong học và recall"), KE-HOACH-7-MUA.md.
Số liệu "nhịp / ô" là `sao.nhip` / `sao.o` của màn (ô = số ô code). Màn nhiều sân có `nhipTheo: 'tong'` (nut-de.10, me-cung.10, ...) thì nhịp là tổng ba sân, ghi là Σ.

Ghi chú công cụ: bốn màn tay-gap.9, che-xe.5, che-xe.9, che-tay.9 báo "thắng=false" trong xem-goi.cjs là do công cụ ghép kho cũ với hàm em sửa lại cùng tên (lỗi `ham-trung-ten`). Bỏ bản cũ khỏi kho rồi chấm lại thì cả bốn thắng 3 sao, đúng sao.nhip / sao.o. Không phải lỗi màn.

## Bảng tổng quan

| Gói | Chương 1 | Chương 2 | Kết luận |
|---|---|---|---|
| 1 Xe hai bánh | hai-banh "Lăn bánh" | xuong-ham "Xưởng hàm" | Đạt có góp ý |
| 2 Tay kẹp | tay-gap "Gắp thùng" | vong-lap "Lặp cho gọn" | Đạt có góp ý |
| 3 Cảm biến khoảng cách | khoang-cach "Dừng trước tường" | che-cam-bien "Chế lệnh: tự dừng" | Đạt có góp ý |
| 4 Nút đè | nut-de "Thùng giữ cửa" | kho-hang "Chế lệnh: né thùng" | Đạt có góp ý (chương 2 lạc đề) |
| 5 Bánh lùi | banh-lui "Lùi khỏi ngõ cụt" | che-banh-lui "Chế lệnh: lùi" | Đạt có góp ý |
| 6 Tay xoay | tay-xoay "Nhặt bên hông" | che-tay-xoay "Chế lệnh: xoay tay" | Đạt có góp ý |
| 7 Cảm biến bên | cam-bien-ben "Nhìn hai bên" | me-cung "Mê cung" | Đạt có góp ý |
| 8 Gặp R2 | hai-robot "Chia việc" | che-hai-robot "Phối hợp ăn ý" | Đạt |
| 9 Nhìn bên, nhặt bên | combo "Dừng cạnh thùng" | che-combo "Trực kho" | Đạt |
| 10 R1 xuất xưởng | robot-hoan-thien "Đủ bộ" | trum-mua-1 "Ngày xuất xưởng" | Đạt |

## Câu 1. Đường cong học tập

### Thứ tự khái niệm giữa các gói
Thứ tự dựa đúng trên cái đã học: lệnh bánh (gói 1) → `def` (gói 1 chương 2) → tay (gói 2) → `for` (gói 2 chương 2) → `if` / `while` / `front_clear` (gói 3) → nút đè dùng go_wall, pick, for (gói 4) → lùi (gói 5) → tay xoay dùng put_right của gói 4 (gói 6) → cảm biến bên (gói 7) → đội (gói 8) → tổng hợp (gói 9, 10). Ràng buộc khay đúng: không màn nào trước gói 5 có left_back / right_back, trước gói 7 có left_clear / right_clear; mọi hàm cần đều được tạo ở màn đứng trước.

Lần xuất hiện đầu của từng khái niệm (theo thứ tự lộ trình):
- Có màn trình diễn (chiChay) hay mã mẫu cho thấy trước: for (4.1 vong-lap.1 TD), if (5.1 khoang-cach.1 TD), while (5.3 khoang-cach.2 TD), nút đè (7.1 nut-de.1 TD), lùi (9.1 banh-lui.5 TD), tay xoay (11.1 tay-xoay.1 TD), left_clear (13.1 cam-bien-ben.1 TD), hai robot (15.1 hai-robot.1 TD), def (2.1 xuong-ham.1 cho sẵn move() của màn), tay kẹp (3.1 tay-gap.1 có mã mẫu nửa bài), else (5.9 khoang-cach.6 có mã mẫu if/else), elif (13.9 cam-bien-ben.8 có mã mẫu).
- KHÔNG có bước cho thấy: **vòng for lồng** xuất hiện lần đầu ở 4.8 vong-lap.9 (hàng biến thể) với mã mẫu RỖNG, cùng lúc thêm pick/drop và nhịp 14 → 21; **if lồng làm phép "và"** xuất hiện lần đầu ở 17.6 combo.6 (hàng luyện, chỉ có gợi ý); **not** xuất hiện lần đầu ở 6.2 che-cam-bien.2 cùng lúc với việc chế hàm có while (hai điều mới một màn).
- Đảo thứ tự nhẹ: elif dùng ở 13.9 cam-bien-ben.8, nhưng 14.3 me-cung.3 lại dạy "thêm nhánh elif" như điều mới; right_clear dùng từ 13.2 (to_gap) nhưng 14.1 me-cung.1 dạy lại từ đầu.

### Nhảy vọt (trong chương, không tính trùm, so với luật 1,5 lần / +4 nhịp)
- 11.6 tay-xoay.6 "Dọn lối": nhịp 3 → 15, ô 9 → 25, rồi 11.7–11.9 tụt về 3–5 nhịp (răng cưa).
- 12.5 che-tay-xoay.5 "Đổi chỗ hai bên": ô 16 → 45; trùm 12.10: nhịp 8 → 34, ô 22 → 58 (gấp 2,6 lần màn 9).
- 8.8 che-tay.6 "Đổi chỗ": thân hàm swap() 10 dòng, nhịp 6 → 22, ô 13 → 31; cả chương kho-hang răng cưa 3 → 15 → 8 → 6 → 21 → 6 → 22 → 6 → 32 nhịp.
- 4.5 vong-lap.5: nhịp 8 → 19; trùm 4.10 vong-lap.10: dòng 7 → 16, nhịp 21 → 46, phải chế BA hàm mới (row, bend_left, bend_right) trong một màn.
- 19.4 robot-hoan-thien.4 "Đổi thùng" (hàng luyện): nhịp 8 → 24, ô 21 → 40; 19.8: nhịp 8 → 27.
- 3.9 tay-gap.9 "Tiết kiệm nhịp": viết lại cả pick() và drop() (bỏ wait), hai vật, u_turn, 18 dòng: nặng nhất chương, nặng hơn cả trùm 3.10 (10 dòng).

### Chững / lặp không thêm gì
- Chương hai-banh: 1.4 đến 1.10 đều 3 nhịp, 7–8 ô; trùm 1.10 "Xếp lại cho đúng" bằng đúng 1.5 (3 nhịp, 8 ô), chỉ đổi thành kéo dòng xáo trộn. Trùm không cao hơn màn 9.
- Chương me-cung: 14.7, 14.8, 14.9, 14.10 cùng lời giải hai dòng `for i in range(N): follow_right()`; trùm 14.10 chính là chương trình của 14.8 chạy ba sân. Đầu chương 14.1–14.5 rất nhỏ (1–3 nhịp) ngay sau trùm 13.10 (15 nhịp), dạy lại right_clear / elif.
- Gói 5 có ba màn "viết hàm đường về" gần như trùng (9.7 che-xe.7 come_back, 10.2 che-tay.7 put_back, 10.5 che-lap.7 come_home) và ba màn "kẹt số" (9.8 che-xe.9, 10.4 che-tay.9, 10.6 che-lap.9). 10.6 che-lap.9 lời giải chỉ 1 dòng gọi, 6 nhịp, ở hàng luyện.
- Trùm 10.10 che-xe.10 "Bãi đỗ xe" DỄ hơn màn 9 (nhịp 19 → 12), không có for / while / cảm biến (cauTruc []), không tạo hàm: trùm hụt hơi.
- Gói 6 (20 màn): không lời giải nào dùng for / if / while, robot không cảm biến; khái niệm điều khiển của gói 2–3 không được nhắc trong cả gói.
- Gói 4 chương 2 (kho-hang): cả 10 màn cauTruc [], 8.1–8.3 robot không tay, không cảm biến; nội dung (dodge_right, pass_back) là trình độ gói 1–2, đi lùi so với trùm gói 3 (if/while ba sân).

### Chuyển gói
Màn đầu mỗi gói đều dễ hơn trùm gói trước (đúng luật "thở ra"). Riêng gói 4 → chương 2 tụt quá sâu (xem trên).

## Câu 2. Liên kết chương 1 và chương 2 trong gói

- Gói 1: nối tốt. hai-banh viết tay từng bánh, chạm giới hạn 10 ô; xuong-ham.1 nói thẳng "12 dòng, quá 10 ô" rồi cho move(); chuỗi move → turn_right → u_turn → corner → stair/two. Không màn lạc.
- Gói 2: nối yếu. Chương 1 về tay (và đã tự chế pick/drop/carry), chương 2 là `for` trên xe trần: 4.1–4.6 và trùm 4.10 không dùng tay; chỉ 4.7, 4.8, 4.9 có tay. Trùm vong-lap.10 không kiểm tay. Chương 2 thực chất là một gói "Vòng lặp" riêng.
- Gói 3: nối tốt. Chương 1 if / while / go_wall, chương 2 chế safe_move, face_open, sửa hàm của màn có while. Trùm chương 2 che-cam-bien.16 không bắt chế hàm mới (chỉ chương trình chính), hơi lệch tên chương "Chế lệnh".
- Gói 4: KHÔNG nối. Chương 1 nut-de rất tốt (TD, recall go_wall / pick / for, đố cửa ngược 7.8, sửa hàm 7.9, trùm ba kho). Chương 2 "Chế lệnh: né thùng" là che-xe.1–3 + che-tay.1, 2, 3, 4, 6, 8, 10: 0/10 màn có nút đè hay cửa, 0/10 có cảm biến. Lạc đề cả chương (dù các hàm put_right, pass_back, swap, grab_back, dodge_right là nền cho gói 5–10).
- Gói 5: nối được (back → park → drag → pull_out → before_wall → tidy). Lạc / trùng: 8.9 che-tay.8 kiểu "thứ tự lệnh tay" thuộc gói 2 đã dời ra; ba màn đường về và ba màn kẹt số (nêu trên). Trùm che-xe.10 không dùng gì của chương 2 (drag, pull_out, before_wall...).
- Gói 6: nối tốt: tay-xoay dạy arm_left / arm_right, che-tay-xoay chế pick_left, drop_right, pick_right, drop_left, swap_sides, sort_two rồi trùm dùng lại. 11.8 tay-xoay.8 (khớp kẹt, quay xe) và 12.9 (kẹt cứng) là cùng một ý, chấp nhận được.
- Gói 7: nối được (to_gap, to_left_gap → follow_right) nhưng me-cung khởi động lại từ số không, nên chương 2 vừa lặp chương 1 ở đầu vừa lặp chính nó ở cuối.
- Gói 8: nối tốt: chương 1 chia việc / chờ bằng cảm biến, chương 2 thêm tay xoay cho R2, cảm biến bên, nút đè, lùi. Chương 2 tên "che-" nhưng không màn nào tạo hàm (đúng kế hoạch: 10 màn đội mới).
- Gói 9: nối tốt, xen kiểu bài (giao hàng, dò đường, sửa hàm, đố nhịp, hai robot). che-cam-bien.10 ở 18.8 đã viết lại không biến, hợp.
- Gói 10: nối tốt. Chương 1 ôn tay kẹp + cảm biến (robot-hoan-thien), chương 2 tay xoay + cảm biến bên + lùi + nút đè.

## Câu 3. Đạt mục tiêu gói

- Gói 1 (xe + def): người chơi chế được move, turn_right, turn_left, u_turn, corner, hàm gọi hàm. Trùm xuong-ham.10 kiểm đúng (stair, two, 3 lời gọi). Chương 1 trùm yếu. **Đạt có góp ý.**
- Gói 2 (tay + for, kế hoạch "hàm cho tay"): tay và for đều học được; trùm tay-gap.10 (carry) và vong-lap.10 kiểm riêng từng thứ, không màn trùm nào kiểm "for cho tay". Mục tiêu "hàm cho tay" chỉ đạt qua 3 màn (4.7–4.9). **Đạt có góp ý.**
- Gói 3 (if / while): ép tốt (khoang-cach.12, .13 hai sân, damLaThua), trùm ba sân không đếm cứng. else / not đến hơi dồn. **Đạt có góp ý.**
- Gói 4 (kho hàng, nút đè): nút đè dùng thành thạo qua chương 1; chương 2 không phục vụ mục tiêu. **Đạt có góp ý** (mức nặng nhất trong các gói đạt).
- Gói 5 (bánh lùi): lùi, quay một nhịp, đỗ lùi dùng được; trùm chương 1 banh-lui.4 ba sân kiểm tốt; trùm chương 2 che-xe.10 không kiểm "chế lệnh lùi". **Đạt có góp ý.**
- Gói 6 (tay xoay): mục tiêu bộ phận đạt; trùm 12.10 kiểm đúng nhưng nhảy quá xa. **Đạt có góp ý.**
- Gói 7 (cảm biến bên): left/right_clear, while not, if/elif/else, bám tường đạt; trùm me-cung.10 không thêm gì so với 14.8. **Đạt có góp ý.**
- Gói 8, 9, 10: đạt mục tiêu và yêu cầu recall (mỗi màn mới gói 9–10 dùng ≥ 2 gói trước, có máy kiểm kiem-trum-mua-1 / kiem-combo-mua-1). Trùm mùa trum-mua-1.10 dùng tay xoay, cảm biến trước + bên, lùi, nút đè, for, if lồng, hàm của màn. Góp ý nhỏ: "if lồng trong for range(4)" (combo.6, che-combo.1, che-combo.9, trum-mua-1.10) là cách vá thiếu `and`, đếm cứng giới hạn lặp. **Đạt.**

## Đề xuất sửa ưu tiên

1. **Gói 4 chương 2 kho-hang**: thay ít nhất 5–6 màn bằng "chế lệnh cho kho": chế hold_door() / open_way() với nút đè, chế hàm có go_wall + nút; dời che-xe.1–3 (né) xuống làm màn ôn đầu gói 5 hoặc giữ 2 màn để tạo dodge_right cho che-xe.10. Trùm 8.10 nên có nút đè.
2. **Trùm 10.10 che-xe.10 "Bãi đỗ xe"**: thay bằng trùm có lùi + while + một hàm em chế (vd. ba bãi đỗ dài ngắn khác nhau: go_wall tới cuối, rồi park() hay drag() tự chế; chưa dùng cảm biến bên vì gói 7 mới có); che-xe.10 lùi về hàng biến thể.
3. **Gói 5 bớt trùng**: giữ một trong ba màn "đường về" (9.7 / 10.2 / 10.5) và một trong ba màn "kẹt số"; cất 10.6 che-lap.9 (1 dòng). Chỗ trống dùng màn lùi + cảm biến + tay.
4. **4.8 vong-lap.9 (for lồng)**: thêm một màn trình diễn for lồng (khoá, bấm Chạy) ngay trước, hoặc cho mã mẫu nửa bài; tách việc thêm tay kẹp sang màn khác để một màn chỉ một điều mới.
5. **Chương me-cung**: bỏ / gộp 14.1–14.3 (đã học ở cam-bien-ben), thay 14.7 hay 14.8 bằng bám tường trái (follow_left) hoặc bám tường mang thùng; trùm 14.10 phải thêm yếu tố mới (mang thùng qua mê cung, hay dừng ở ◆ bằng cảm biến).
6. **Trùm hai-banh.10**: đổi thành bài dài hơn màn 9 (vd. chữ U 5 nhịp, đúng 10 ô) để trùm đúng nghĩa; hai màn L 1.6 / 1.9 trùng ý, thay một màn bằng quay đầu + đi.
7. **Gói 6 tay xoay**: làm mượt 11.6 tay-xoay.6 (thêm màn đệm 6–8 nhịp trước, hay chuyển 11.6 xuống hàng biến thể) và 12.10 (bớt một phần, ô 58 → khoảng 35); cho 2–3 màn dùng lại for / while (vd. sort_two trong for, go_wall tới vật) để giữ recall.
8. **Gói 2 chương 2 vong-lap**: cho trùm vong-lap.10 hoặc 4.6 có tay (vd. đường ngoằn ngoèo mang thùng, hoặc lặp carry) để chương 2 nối với tay kẹp; đồng thời 6.2 che-cam-bien.2 cho `not` một bước thấy trước (mã mẫu `while front_clear()` sai rồi sửa thành `while not`).
