# Nghiệm thu độc lập Mùa 2 "Nhà máy" (mã mua-2), 30/10/2026

Dữ liệu: lộ trình xuất bản `hoc/lo-trinh-hoc.js` (bản game thật nạp), 10 gói × 2 chương × 10 màn = 200 màn, đối chiếu `KE-HOACH-MUA-2.md`, `KE-HOACH-GOI-LUA.md`, `KE-HOACH-7-MUA.md`.
Công cụ xem-goi.cjs bản đã sửa cho đúng 200 màn như bản tôi tự dựng từ lộ trình (so từng dòng, không khác). Chỉ số đường cong tôi đo theo đúng cách của `kiem-lo-trinh.mjs` mục (g):
dòng (chương trình chính không khóa + thân hàm), nhịp (`sao.nhip`), ô = số ô không phải tường của sân lớn nhất. Trùm nhiều sân: xem nhịp từng sân (`theoSan`).

Ghi chú công cụ: xem-goi báo `che-xich.9` thắng=false. Đây không phải lỗi màn: công cụ ghép kho hàm của em (đã có `tr_right`) với `tr_right` mới của lời giải nên trùng tên (`ham-trung-ten`).
Thay bản cũ bằng bản mới thì lời giải thắng 3 sao (12 nhịp, 16 ô). Nên sửa công cụ: hàm của em mới cùng tên thì thay, không nối.

Thứ tự Python của mùa: biến đếm (gói 1 chương 2) → hàm có tham số (gói 2 chương 2) → `d = distance()`, so sánh `> < <= ==`, biến `an_toan` (gói 3) → đối số chuỗi `"low"/"high"` (gói 6) → `warm()`, `while not warm()` (gói 7).
Mỗi bước dựng trên bước trước (gói 3 cần cả biến lẫn tham số: `go_safe(an_toan)`). Thứ tự khái niệm Python hợp lý.

## 1. Đường cong học tập

### Toàn mùa
- Máy kiểm (g) đã cấm nhảy giữa màn liền nhau, và tôi đo lại: trùm không vượt xa màn 9 tính theo từng sân. Ví dụ che-day-thung.10 tổng 63 nhịp nhưng mỗi sân 20, 21, 22 (màn 9: 20); be-sung.10 mỗi sân 20 đến 22; che-be-sung.10 mỗi sân 36, 41 (màn 6 và 8 trong chương đã 34).
  Trùm lệch nhiều nhất: tham-so.10 31 nhịp so với tham-so.9 16 (đỉnh chương 23), xich.10 23 so với xich.9 13. Chấp nhận được.
- Chỗ trùm lại DỄ hơn màn 9 (không kiểm thêm gì): luc-ban.10 ba dòng `smart_spray(); turn_left(); go_wall()`, mỗi sân 5 đến 6 nhịp, trong khi luc-ban.8, .9 đã là 7 nhịp và cũng dùng smart_spray; sung-hoi.10 8 nhịp so với sung-hoi.9 10 nhịp.
- Chỗ trùm trùng nguyên lời giải một màn luyện (chỉ thêm sân): do-nhiet.10 = đúng chương trình của do-nhiet.2 và .3; che-day-thung.10 = đúng lời giải che-day-thung.6 (`push(1); push_around(1); push_around(2)`); hong-ngoai.10 = hong-ngoai.8 với `an_toan = 1`. Kiểm khái quát hóa, nhưng không thêm suy nghĩ mới.

### Chỗ dồn khái niệm trong một màn
- hong-ngoai.6 "Gần thì rẽ": cùng lúc `<=`, `if/else`, `while True` và lối nghĩ "mỗi lượt một việc" của robot hút bụi (16 nhịp, sân 21 ô). Màn trước (hong-ngoai.5) chỉ thêm biến `an_toan`. Đây là màn nặng nhất gói 3.
- che-day-thung.1: lần đầu cộng cảm biến với tham số `forward(distance() + n)` ngay trong màn chế hàm đầu chương.
- doi-mua-2.1: màn đầu gói Đội, KHÔNG có màn trình diễn (gói T còn chờ, KE-HOACH-MUA-2 dòng 173). Cùng lúc gặp: hai robot hai chương trình, `warm()` thấy đồng đội, chương trình khóa và viết thân hàm `wait_cool()`. Sân 24 ô, 20 nhịp, chương trình khóa 14 dòng phải đọc hiểu.
- tong-hop-2.1 (lửa) là cơ chế MỚI ở gói tổng hợp cuối mùa. Có màn trình diễn, luật đơn giản, nên ổn; nhưng nghĩa là gói 10 vừa ôn vừa dạy.

### Chỗ chững, lặp không thêm gì
- Thân hàm `while distance() == 0: wait()` lặp ở 6 màn: doi-mua-2.3, .7, .9, .10, che-doi-mua-2.3, .9 (che-doi-mua-2.9 dùng lại tình huống doi-mua-2.9). Cả gói 8 chỉ có 2 đến 4 dòng mỗi màn; người chơi chỉ viết một vòng chờ.
- Thân `if not warm(): <phun>` lặp ở do-nhiet.5, .6, .8, .9, che-do-nhiet.1, .3, .5 (cộng be-sung.6, che-be-sung.4). Bảy màn liền của gói 7 cùng một thân.
- Gói 4 chương 1 `bang-chuyen`: Python chỉ là `for` + `move()` như mùa 1 (robot "banh" không cảm biến), đứng ngay sau gói 3 đã dùng `while`, `if/else`, `distance()`. Cơ chế mới (băng chuyền) có, Python lùi lại.
- che-hong-ngoai.8 chỉ là `while True: clean_step(1)` (2 dòng), gần như lặp hong-ngoai.10.

## 2. Liên kết chương 1 và chương 2 trong gói

| Gói | Chương 1 | Chương 2 | Nối mạch? |
|---|---|---|---|
| 1 Bánh xích | xich: quay hai nhịp, tr_right / tr_left | bien-xich: 4 màn chế hàm xích (spin, sidestep, fixed_turn, pick_behind) rồi 4 màn biến đếm trên XE HAI BÁNH (che-cam-bien.6, .5, .9, robot-hoan-thien.9), rồi che-xich.9 (sửa tr_right, không biến), trùm xích + biến | Nửa. Biến dạy trên robot khác part của gói; che-xich.9 ở vị trí 9 lạc chủ đề "Đếm bước để về". Trùm bien-xich.1 nối được hai ý. |
| 2 Vòi phun | sung-hoi: spray, spray_back, van, cửa | tham-so: forward(n), right(k), deliver(n), step(a, b) trên xe tay kẹp, KHÔNG có vòi phun | Không. Chương 2 không phải "hàm cho vòi phun". |
| 3 Hồng ngoại | distance(), so sánh, an_toan | go_to_wall, go_safe(an_toan), clean_step, go_get, sửa safe / take | Tốt, chương 2 đóng gói đúng các mẫu của chương 1. |
| 4 Băng chuyền | bang-chuyen (for, xe trôi) | che-sung-hoi: puff, open_left/right, open_behind (hàm cho vòi phun) | Không. Chương 2 là hàm cho part của gói 2, chẳng dùng băng chuyền. |
| 5 Đẩy thùng | đẩy thẳng, vòng, distance tới thùng, nút đè | push(n), go_around, push_around(n), push_back(n) | Tốt. |
| 6 Lực phun | "low"/"high", squirt(p), smart_spray (front_clear) | auto_spray (distance() > 1) và các hàm gọi nó | Khá. Chương 1 chọn lực bằng `front_clear()` (cảm biến mùa 1), chương 2 bằng `distance()`: hai cách, không có màn nối "vì sao đổi". |
| 7 Đo nhiệt | warm(), đèn nóng, mồi | switch_on, find_warm, auto_on, scan_on(n) | Nối, nhưng chương 1 từ màn 5 đã toàn "viết thân hàm của màn" nên hai chương gần như cùng một hoạt động. |
| 8 R2 trở lại | 10 màn viết thân hàm chờ (hàm của màn) | 10 màn viết đúng các thân đó thành hàm của em, dùng lại sân doi-mua-2.2, .4, .9 | Nối quá sát: chương 2 lặp chương 1, khác ở chỗ hàm vào kho. |
| 9 Bệ vòi xích | phun không giật, warm ở trạm | spray_left → valve_on → valve_left → valve_row(n) → go_spray → visit (biến d) → push_spray → trùm | Tốt nhất mùa: chuỗi hàm gọi hàm rõ. |
| 10 Xe cứu hỏa R1 | tong-hop-2 "Thử mọi món": lửa ở .1–.5, .7, .10; .6, .8, .9 chưa có lửa | trum-mua-2 "Nhà máy chạy lại": đẩy thùng, van, đội; KHÔNG có lửa | Chưa nối: tên gói là cứu hỏa nhưng chương 2 và trùm cuối mùa không có lửa (P3 của KE-HOACH-GOI-LUA chưa làm). |

Màn lạc đề / lạc giọng:
- che-xich.9 (bien-xich màn 9): không dùng biến, lạc chủ đề chương.
- che-cam-bien.5, .9, robot-hoan-thien.9: biến trên xe hai bánh trong gói Bánh xích.
- tong-hop-2.8, .9: đề nói luôn đáp án ("clear_squirt(p) của gói Đội làm đúng việc đó", "step_clear() ... làm đúng việc đó"); thân hàm 1 dòng, không còn là ôn.
- Chữ trỏ gói sai tên: xich.6 "(gói Nhà máy sẽ gặp lại)" và che-luc-ban.8 "Nhớ lại gói Nhà máy: phun mạnh thì cú giật..." Gói 4 nay tên "Băng chuyền"; cú giật lại học ở gói Lực phun (luc-ban.3, .6), không phải gói 4.

## 3. Mỗi gói có đạt mục tiêu không

- **Gói 1 Bánh xích (thân xích + Python A biến).** Xích: đạt (xich.1 trình diễn, xich.2 ép, tr_right / tr_left, sửa tr_sai, chọn đường ít khúc quẹo). Biến: chỉ 4 màn sau trình diễn (che-cam-bien.5, .9, robot-hoan-thien.9, trùm), trùm bien-xich.1 kiểm đúng biến n + sidestep + spin trên 3 sân. Đủ để dùng, mỏng.
- **Gói 2 Vòi phun (tay + Python B tham số).** Tham số: đạt rõ (forward(n) trình diễn → sửa → tạo → right(k) → deliver(n) → run(n) → step(a, b) → trùm deliver). Vòi phun: đạt ở chương 1. Nhưng không có màn nào ghép tham số với vòi phun.
- **Gói 3 Hồng ngoại.** Đạt. Trùm hong-ngoai.10 bắt tự tìm `an_toan` trên 3 phòng; che-hong-ngoai.10 bắt `go_safe(0)` thay go_to_wall. Đúng mục tiêu `d = distance()`, so sánh số.
- **Gói 4 Băng chuyền.** Băng chuyền học được (xuôi, ngược, lệch, chờ băng, chọn cột) và trùm bang-chuyen.10 kiểm đúng. Chương 2 đạt mục tiêu "hàm cho vòi phun" chứ không phải cho băng chuyền. Python gói này không tiến.
- **Gói 5 Đẩy thùng.** Đạt. Trùm day-thung.10 dùng `forward(distance())` 3 kho; che-day-thung.10 đúng ý nhưng trùng lời giải màn 6.
- **Gói 6 Lực phun.** Đạt về chọn lực bằng cảm biến và đối số chuỗi. Trùm luc-ban.10 quá dễ; che-luc-ban.10 (3 sân, 6 dòng, nối auto_left + close_spray) mới là kiểm thật.
- **Gói 7 Đo nhiệt.** Đạt (`if not warm()`, `while not warm()`, phân biệt đèn nóng với cửa / thùng / van đóng cùng khoảng cách). Trùm do-nhiet.10 trùng chương trình màn 2; che-do-nhiet.10 tốt hơn (hành lang + ngã rẽ, 3 sân).
- **Gói 8 R2 trở lại (Đội, hồng ngoại thấy robot).** Ý "warm() thấy đồng đội, distance() thấy cả thùng" được dạy và kiểm (đố doi-mua-2.7 đèn nóng, .9 thùng; trùm 3 sân). Nhưng người chơi không bao giờ viết chương trình cho hai robot (mọi màn khóa cả hai), chỉ viết vòng chờ 1 đến 2 dòng; không màn trình diễn; recall gói 8 ở gói 9–10 chỉ 3 lần (mỏng nhất mùa, KE-HOACH-MUA-2 dòng 159).
- **Gói 9 Bệ vòi xích.** Đạt. Chương 2 là ví dụ mẫu của "hàm gọi hàm" có tham số và biến (valve_row(n), visit với d), trùm che-be-sung.10 nối năm hàm trên 2 sân.
- **Gói 10 Xe cứu hỏa R1.** Đang dở theo kế hoạch gói lửa: chương 1 có 7/10 màn lửa, trùm tong-hop-2.10 kiểm `while warm(): squirt("high")` (đúng mục tiêu lửa + warm + go_to_wall); chương 2 và trùm cuối mùa trum-mua-2.10 chưa có lửa, tên "Xe cứu hỏa" chưa khớp nội dung. Recall các gói 1–9 đủ (≥ 3 mỗi gói theo kế hoạch), nhưng ôn biến và Đội mỏng.

## Kết luận từng gói

- Gói 1 Bánh xích: Đạt có góp ý (biến dạy trên xe hai bánh, che-xich.9 lạc chỗ).
- Gói 2 Vòi phun: Đạt có góp ý (tham số đạt, nhưng hai chương rời nhau).
- Gói 3 Cảm biến hồng ngoại: Đạt.
- Gói 4 Băng chuyền: Đạt có góp ý (chương 2 là hàm vòi phun, Python chững).
- Gói 5 Đẩy thùng: Đạt có góp ý (trùm chương 2 trùng màn 6).
- Gói 6 Lực phun: Đạt có góp ý (trùm chương 1 dễ hơn màn 8, hai cảm biến chọn lực).
- Gói 7 Đo nhiệt: Đạt có góp ý (thân `if not warm()` lặp 7 màn, trùm chương 1 trùng màn 2).
- Gói 8 R2 trở lại: Đạt có góp ý (không trình diễn, chương 2 lặp chương 1, không tự viết chương trình hai robot).
- Gói 9 Bệ vòi xích: Đạt.
- Gói 10 Xe cứu hỏa R1: Chưa đạt (đang dở: chương 2 và trùm cuối mùa chưa có lửa).

## Đề xuất sửa ưu tiên (tối đa 8)

1. **Gói 10, chương trum-mua-2 (P3 gói lửa)**: làm xong theo dàn ý KE-HOACH-GOI-LUA mục 2, ít nhất trum-mua-2.10 phải có lửa (dập đủ mọi đám mới thắng, mục tiêu `dap-lua`) và một màn ôn Đội có lửa; thêm lửa cho tong-hop-2.6, .8, .9. Sửa đề tong-hop-2.8, .9 để không đọc ra đáp án (bỏ câu "clear_squirt / step_clear làm đúng việc đó", chỉ nói việc cần làm).
2. **Ghép đúng chương 2 cho gói 2 và gói 4**: đổi gói 2 = sung-hoi + che-sung-hoi (hàm cho vòi phun; thay `forward(n)` ở che-sung-hoi.3, .10 bằng `for … move()` như đã làm ở sung-hoi.3, .8), gói 3 = bang-chuyen + tham-so (tham-so.9, .10 vốn đã có băng chuyền, đúng cặp "Đường dài" cũ), gói 4 = Hồng ngoại (cần tham số cho go_safe nên phải đứng sau gói tham số). Giữ `ma`, đo lại đường cong (g) và ngưỡng sao. Nếu không muốn đảo gói: ít nhất dựng lại 2 đến 3 màn tham-so dùng vòi phun (vd `puff_n(k)`, phun k van) và 2 đến 3 màn che-sung-hoi có băng chuyền.
3. **Gói 8, doi-mua-2.1**: thêm màn trình diễn `chiChay` đứng đầu (hai robot, R2 chờ khi warm() thấy R1, bấm Chạy là thấy), đẩy màn viết wait_cool() xuống; hạ sân màn đầu (hiện 24 ô, chương trình khóa 14 dòng).
4. **Gói 8 chương che-doi-mua-2**: bớt lặp `while distance() == 0: wait()` (6 màn). Thay che-doi-mua-2.9 (trùng doi-mua-2.9) bằng một màn người chơi TỰ VIẾT chương trình chính cho một robot (robot kia khóa), dùng yield_step / wait_clear của em; dùng kho hàm Đội thêm ở trum-mua-2 để recall gói 8 lên.
5. **Gói 1 chương bien-xich**: dời che-xich.9 lên trước màn trình diễn biến (vị trí 5) để nửa sau chương thuần biến; thay một trong che-cam-bien.5 / .9 bằng bản xích (biến đếm số ô rồi quay về, như trùm). Đo lại dòng (che-xich.9 11 dòng sau che-xich.6 3 dòng có thể vượt luật: dùng mã mẫu viết sẵn một phần).
6. **Trùm yếu**: luc-ban.10 thêm một van thứ hai cần lực khác (gọi smart_spray hai lần ở hai hướng) để khó hơn luc-ban.8; do-nhiet.10 thêm một đoạn `if not warm(): squirt` trước mê cung để không trùng do-nhiet.2; che-day-thung.10 thêm một bước push_back hoặc go_around ngược để khác che-day-thung.6.
7. **hong-ngoai.6 tách đôi ý**: cho `while True` + `if/else` ở một màn với so sánh `>` quen thuộc, rồi màn sau mới đổi sang `<=` (hoặc đưa `<=` vào gợi ý mã mẫu viết sẵn). Gói 7: đổi 2 trong 7 màn `if not warm()` thành dạng mới (vd `while warm()` dập lửa hay `if warm(): ... else: ...`) để chương không chững.
8. **Chữ và nhất quán**: xich.6 sửa "(gói Nhà máy sẽ gặp lại)" thành "(gói Băng chuyền ...)"; che-luc-ban.8 "Nhớ lại gói Nhà máy" thành "gói Lực phun"; luc-ban.8–.10 chuyển smart_spray sang `distance()` (robot đã có hồng ngoại từ gói 3) hoặc thêm một câu nối "front_clear chỉ biết sát hay không, distance cho biết bao xa". Sửa xem-goi.cjs để hàm của em mới cùng tên thay hàm cũ (che-xich.9 báo thua giả).
