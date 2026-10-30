# Kế hoạch gói lửa: gói 10 mùa 2 "Xe cứu hỏa R1" (30/10)

User 30/10: "làm thêm gói lửa nhé, k thì tên gọi ko còn khớp nữa"; chốt **gói 10 thành gói lửa** (giữ khuôn 10 gói × 2 chương × 10 màn, mùa 2 vẫn 200 màn).
Gói 10 giữ tên "Xe cứu hỏa R1", mã gói `nha-may-chay`, mã chương `tong-hop-2`, `trum-mua-2` và mã màn (khoá lưu sao). 20 màn ôn hiện tại được dựng lại
thành màn có lửa, mỗi màn vẫn ôn 2 đến 4 gói trước (luật recall gói 9–10). Sân cũ hay thì giữ, thêm lửa vào.

## 1. Luật lửa (lõi san-hoc.js) — CẦN USER DUYỆT

1. **Ô lửa** khai như van bật sẵn: `cfg.lua = [{ x, y, suc }]`, ô ghi `.` trên sân, `suc` là 1, 2 hay 3 (số lần trúng mới tắt). Hình: 1 đến 3 ngọn lửa.
2. **Đang cháy:** chắn xe như cửa đóng (xe tiến vào thì đứng yên, chẩn đoán dam-tuong vat 'lua'); chắn tia nước;
   `warm()` thấy là nóng; `distance()` đếm tới lửa, loại vật mới `'lua'`.
3. **Mỗi lần tia nước trúng thì `suc` giảm 1**, phun nhẹ hay phun mạnh như nhau (lực chỉ quyết tầm bay). Về 0 thì **tắt hẳn**:
   ô thành sàn có vết khói, đi qua được, không bao giờ cháy lại. Khác van: van trúng là đổi qua lại, lửa chỉ một chiều.
4. **Cửa chống cháy (tuỳ chọn):** dùng lại `noi`, nhưng nút là ô lửa: lửa tắt thì cửa nối với nó mở, một lần, không đóng lại.
5. Lửa **không lan, không làm hỏng xe**, không có đồng hồ. Giữ đơn giản cho lớp 3–5.
6. **Mục tiêu mới `dap-lua`:** thắng khi mọi đám cháy đã tắt (và tới cờ nếu màn có cờ). Màn chưa dập hết mà tới cờ thì thua, chẩn đoán `con-lua`.
7. Không lệnh mới: chỉ `spray()`, `spray_back()`, `squirt(p)`, `warm()`, `distance()`. Khay, Sổ lệnh giữ; thẻ Vòi phun thêm một câu "phun trúng lửa thì lửa nhỏ đi".

Điểm khó cần thiết kế kỹ: `warm()` không phân biệt lửa với van đang mở. Màn có cả hai thì `while warm(): spray()` dập lửa đúng nhưng đóng mất van mở:
dùng thành câu đố ở một màn (tong-hop-2.5), còn lại không đặt chung.

## 2. Hai chương (dàn ý, đo đường cong khi viết)

**tong-hop-2 → "Dập lửa"** (ôn, chương trình chính viết hoặc sửa):
1. Trình diễn, khoá: đám cháy chắn hành lang, một lần phun nhẹ là tắt, xe đi qua tới cờ (gói 2).
2. Ép: lửa cỡ 2, mã mẫu phun một lần rồi đi, xe đứng trước lửa; thêm lần phun (gói 2, 7).
3. Lửa xa: phun mạnh trên bệ vòi, xe không giật (gói 6, 9).
4. `while warm(): spray()` một lửa cỡ chưa biết, ba sân cỡ 1, 2, 3 (gói 7).
5. Lửa hay van nóng: hai vật cùng nóng, chỉ dập lửa, để yên van (gói 4, 7).
6. Lửa sau lưng: spin() hay spray_back() (gói 1, 2).
7. Lửa cạnh băng chuyền (gói 4).
8. Thùng nặng chắn lửa: đẩy thùng đi rồi mới phun tới lửa (gói 5).
9. Đội: bệ vòi dập lửa mở lối cho R2 (gói 8).
10. Trùm chương: ba sân, hành lang nhiều đám cháy cỡ khác nhau, đi tới tường bằng distance() (gói 3, 7).

**trum-mua-2 → "Chế lệnh: dập lửa"** (hàm của em; màn 10 là trùm cuối mùa 2):
1. Chế `put_out()` = while warm(): spray(); wait().
2. Chế `put_out_left()` (quay trái, dập, quay lại).
3. Sửa hàm lỗi: `if warm()` thay cho `while` nên chỉ phun một lần.
4. Hàm có tham số `clear_row(n)`: n đám cháy dọc hành lang.
5. Hàm cho đội (gói 8): chờ bạn ra khỏi đường tia rồi dập.
6. Hàm gọi hàm: `go_to_wall()` rồi `put_out()`.
7. Cửa chống cháy: dập đúng đám nối với cửa.
8. Đố: phun van nóng tưởng là lửa (warm() như nhau).
9. Biến d = distance() chọn lực cho lửa xa gần (gói 3, 6).
10. Trùm cuối mùa: nhà máy cháy, hai dây chuyền, nối năm hàm của em, mọi đám cháy tắt.

## P1 đã làm (30/10, user duyệt luật)

Lõi san-hoc.js (cfg.lua, mục tiêu dap-lua, sự kiện lua-nho / lua-tat, cửa chống cháy qua noi), cham.js (truyền lua; lời đâm lửa "đang cháy";
chẩn đoán con-lua), hình vector ô `lua` (ve-vector-o2.js, 1–3 ngọn, lửa lay, tắt thì vết cháy + khói; màu mới ở bang-mau.js), san-ve.js (vẽ, tia trúng lửa
bụi nước + lửa nhỏ đi, đồng bộ theo vết, ảnh nhỏ), man-choi.js / man-lap.js truyền lua, tiêu đề thắng "HẾT CHÁY!". Máy kiểm hoc/kiem-lua.mjs 31 phép (lỗi giả 5 đỏ).
Khác kế hoạch: xe đâm lửa dùng chẩn đoán sẵn có dam-tuong (vat 'lua', lời riêng) thay cho mã mới vao-lua; bộ dò đường tắt (bản mô phỏng riêng) dạy lửa ở P2,
cùng máy kiểm gói 10, khi biết bộ dò nào dùng. Đã xem trong trình duyệt: ô lửa 4 cỡ, tia trúng lửa, tắt thì vết cháy, xe đi qua.

## P2 đã làm (30/10)

Chương tong-hop-2 "Dập lửa" (man-trum-mua-2.js), giữ khung các màn cũ đã cân recall khi thêm được lửa:
1. Đám cháy đầu tiên (mới, trình diễn chiChay: squirt("low"), forward(5)) · 2. Lửa to (mới: lửa hai ngọn sát mũi, phun hai lần) ·
3. Giếng sau lưng (+ lửa giữa hành lang cách ba ô: phải phun mạnh) · 4. Thùng ở làn dưới (+ lửa đúng chỗ né xuống: quay xuống phun nhẹ rồi mới xuống) ·
5. Mở cửa cho thùng sau lưng (+ lửa chắn tia trước van: phun nhẹ dập lửa, phun mạnh mở van) · 6. Sửa hàm pair_spray() (giữ) ·
7. Hai đám cháy (mới, thay Trạm xa trạm gần: khóa main, hàm của màn douse() = while warm(): squirt("low"); hai đám cỡ 1 và 3 ở hai đoạn vuông góc
   vì cùng hàng thì warm() thấy đám xa và phun nhẹ mãi) · 8, 9. hai màn đội (giữ) · 10. Trùm: Ba hành lang cháy (mới: while warm(): squirt("high"), go_to_wall(), tr_right(), forward(2)).
Bỏ: Băng chuyền giúp một tay, Đố: squirt("high") không lùi, Trạm xa trạm gần, Trùm: Ba dây chuyền thùng.
Sau đó (user: "Thêm lửa 6, 8, 9 trước"): màn 6 lửa trong giếng trên chắn tia trước van (pair_spray() của Sola viết lúc chưa cháy: sửa thành dập lửa, van trên, van dưới);
màn 8, 9 (hai robot, chương trình khóa) lửa trước mũi bệ vòi R1 lúc xuất phát, chương trình khóa của R1 dập trước (màn 9 không dập thì box_step() chờ mãi). Cả 10 màn chương 1 có lửa.
Bộ dò do-duong-be-sung.mjs mô phỏng lửa (trạng thái f, cửa chống cháy, đích dap-lua, so chéo lõi theo lửa); do-duong-do-nhiet.mjs cắt lua theo sân.
kiem-trum-mua-2.mjs: dap-lua, đặc trưng 'lua', màn trình diễn như kiem-be-sung. Recall gói 10 vẫn đủ (mỗi gói 1–9 ≥ 3 lần).
Cần sửa ở P4: thẻ Cảm biến hồng ngoại còn ghi warm() nóng với "robot khác, van hơi đang mở" (thiếu đám cháy); hướng dẫn từng bước cho màn trình diễn.

## P3 đã làm (30/10)

Chương trum-mua-2 "Chế lệnh: dập lửa": 1. Hàm put_out() (while warm(): squirt("low"), hai đám cỡ 3 và 1) · 2. Hàm put_out_left() (mục tiêu dap-lua, lửa trong giếng bên trái) ·
3. Sửa hàm put_far() (Sola phun nhẹ vào lửa xa nên lặp mãi; sửa thành phun mạnh) · 4. Hàm clear_row(n) (ba giếng cháy, dap-lua) · 5. box_spray() cho đội (giữ, R1 put_out() trước) ·
6. gate_push() (giữ, put_out() trước thùng) · 7. Hàm fire_valve() (dập lửa chắn van rồi phun mạnh mở van) · 8. Đố: phun thừa một lần (lần thừa trúng van, cửa đóng; dap-lua) ·
9. far_push() (giữ, put_out() trước thùng đầu) · 10. Trùm cuối mùa (giữ hai dây chuyền, thêm đám cháy cỡ 1 / 3 sát mũi lúc xuất phát, put_out() trước).
Bỏ: side_push, open_valve, Sửa hàm nudge(), lane_row, check_lane, Đố: băng không chở xích (không màn nào sau gói 10 dùng các hàm này). Sổ lệnh: put_out, put_out_left, clear_row, fire_valve.
Recall gói 10: gói 1 còn đúng 3 lần (tối thiểu).

## 3. Thứ tự làm (commit theo phần, test đầy đủ trước khi gộp main)

- **P1 lõi + hình:** cfg.lua, mục tiêu `dap-lua`, chẩn đoán `con-lua`, `warm()` / `distance()` thấy lửa, hoạt cảnh tia trúng lửa (lửa nhỏ dần, khói),
  hình vector ô lửa; máy kiểm `kiem-lua.mjs` (luật từng mục ở phần 1); bộ dò `do-duong-sung-hoi.mjs` hiểu lửa.
- **P2 chương tong-hop-2** (10 màn) + `kiem-trum-mua-2.mjs` phần chương 1, đo sao.
- **P3 chương trum-mua-2** (10 màn) + phần chương 2, đo sao, recall đủ gói 1–9.
- **P4 chữ:** tên chương, 4 khung phim gói 10 (sự cố: nhà máy cháy → lắp… → dập lửa → lệnh mới), thẻ Vòi phun, hướng dẫn màn trình diễn, huy hiệu (tự theo tên chương).

Người làm: phiên chính tự làm (như đợt phun nhẹ), ghi điểm tự quyết vào `hoc/ban-giao/can-trao-doi-phun-nhe.md`.
