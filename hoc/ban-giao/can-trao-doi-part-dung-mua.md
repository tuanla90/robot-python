# Sổ trao đổi: dựng lại mùa 1–4 theo luật part đúng mùa (31/10, user treo máy qua đêm)

Điểm Claude tự quyết trong đêm (đảo lại được), và câu hỏi chờ user. Kế hoạch: `hoc/KE-HOACH-PART-DUNG-MUA.md`.

## Tự quyết
1. **Mùa 1 giữ gói 8 Gặp R2, gói 9 Nhìn bên, nhặt bên.** Mùa 1 không có mùa trước nên "yếu tố cũ" (gói 8) và "R2 part cũ" (gói 9) không áp được.
   Đội được ở cả gói 8 và 9 của mùa 1 (che-combo.1, .6 là màn đội).
2. **Mùa 1 từ gói 7: R1 tay kẹp → tay xoay** (lo-trinh-hoc.js khối lenTayXoay): thêm arm_left / arm_right lên khay, lời giải giữ nguyên.
   Màn hai robot của Gặp R2 trước đây R1 kẹp, R2 xoay; nay cả hai tay xoay. Câu đố đội có thể dễ hơn (R1 cũng gắp ngang được) — chưa soát từng màn.
3. **Màn ít part hơn cỗ máy được phép** (vd gói 3 chưa cần tay): R1 vẫn là cỗ máy, chỉ chưa lắp hết. Máy kiểm chỉ chặn part NGOÀI mùa.
4. **Mùa 2 bỏ luật Bệ vòi xích** (cfg.beSung): xích gắn vòi phun mạnh thì giật như xe khác, nên gói 6 Lực phun giữ bài "lần đầu bị giật". Màn be-sung cất khỏi lộ trình.
5. **Mùa 3 cảm biến từ trên nhện** đo theo cạnh trước cố định của nhện (hướng xuất phát, cùng cạnh tay kẹp nhện đang dùng).

6. **Mùa 1 gói 10 (PDM1, đã xong):** 20 màn đều 3 "ngày làm việc", lời giải chung 3 sao, mỗi màn có lời đếm cứng thua. trum-mua-1.4 (trước là hai robot)
   thành màn một robot "Một mình hai trạm". Bảng recall gói 9 + 10: gói 8 Đội chỉ còn nhắc 2 lần (trước 3) vì gói 10 không còn đội; hạ ngưỡng riêng gói 8 xuống 2.
   Nhịp màn thường tính theo ngày dài nhất, trùm tính tổng mọi ngày (robot-hoan-thien.5 cũng tính tổng để for range(3) đếm cứng không được 3 sao).

7. **Mùa 2 gói 1–4 (PDM2a, PDM2a2, đã xong 80 màn):** R1 xích (+ vòi, + hồng ngoại). Gói 1 chưa có cảm biến nên chương biến đổi thành "Đi xoắn ốc"
   (biến đếm độ dài đoạn, n = n + 1). Hàm của em tham-so.8 đổi tên `step` → `stair_down` (trùng hàm của màn mùa 4).
   Chương băng chuyền thành "Canh băng chở thùng": lõi thêm `man.thungThem` (thùng nặng đặt sẵn trên băng); xích không trôi, van bật tắt băng.
   Màn ẩn (mùa sau) còn gọi hàm mùa 2 cũ (fetch_back, bounce, pick_behind, deliver…) được cấp bản cũ làm hàm của màn.
   Thứ tự chương sung-hoi đổi (.9 trước .7): mã giữ nên sao đã lưu không mất.

8. **Mùa 2 gói 6–8 (PDM2b):** gói 6–7 sửa THẲNG ngân hàng (man-luc-ban / man-che-luc-ban / man-do-nhiet.js) sang xích + hồng ngoại (không qua sua() như gói 1–4), sao đo
   lại trong ngân hàng; bản hai bánh của 9 hàm của em (smart_spray, squirt_left, switch_left…) khai cứng ở lo-trinh-hoc.js cho màn ẩn. Băng chuyền không đẩy xích nên
   che-luc-ban.5 và do-nhiet.9 đổi băng thành cửa. Bộ dò do-duong-sung-hoi.mjs nay biết xích (quay hai nhịp), xích đẩy thùng, nút đè M, thùng gỗ o.
   Gói 8 MỚI "Góc kho cũ" (kho-cu / che-kho-cu, man-kho-cu.js, 20 màn, sao 210): ý chính "xe đè nút đè thì cửa trước mũi mở cho TIA NƯỚC qua"; rào: tia qua, xe không;
   thùng gỗ: chắn xe và chắn tia (thử lõi: băng chuyền KHÔNG chở vật o, brief ghi "chở được" là sai; ô đích D không dùng vì chỉ hợp thùng nặng).
   Gói Đội cũ cất khỏi mùa 2 (CAT_MUA_2, gói ẩn mùa 5, sao 125 trong mùa ẩn), gói 9 vẫn là Bệ vòi xích tới khi PDM2c dựng gói 9–10: gói 10 còn gọi hàm gói Đội
   (wait_clear, step_clear…) nên được cấp bản cũ làm hàm của màn gắn cờ `capCu` (kiem-lo-trinh (g) và kiem-trum-mua-2 không tính dòng / trùng tên của hàm capCu).
   kiem-doi-mua-2 dừng sớm (ĐẠT, ghi chú) khi gói Đội không ở mùa 2.

## Câu hỏi chờ user
- (PDM2b) Gói Đội cũ cất ở mùa ẩn và gói 9 còn là Bệ vòi xích: PDM2c dựng gói 9 Đội (R2 xe chở hàng) thì Bệ vòi xích đi đâu (cất hẳn, hay giữ vài màn cho gói 10)?
  Gói 10 đang mượn hàm gói Đội qua `capCu`; PDM2c dựng lại gói 10 thì bỏ CAP_HAM_CU.
- (PDM2b) luc-ban.8 smart_spray() so distance() > 0 còn che-luc-ban.1 auto_spray() so > 1 (giữ ý cũ của hai chương): hai hàm gần giống nhau, có muốn gộp?
- Sổ lệnh (so-lenh.js) theo ngân hàng nên còn hiện tên hàm mùa 2 cũ (step, deliver, pick_behind, fetch_back, bounce) mà người chơi giờ không tạo; thiếu next_lane, open_at,
  stair_down. Agent đề xuất cho Sổ lệnh đọc theo lộ trình (một lượt riêng). Claude nghiêng về làm, sau khi xong mùa 2–4.
- Chương băng chuyền màn 6–9 cùng một khung (đỗ trên ô đích, tắt / mở rồi đi qua, bật lại): có thể thấy lặp.
- robot-hoan-thien.8 sau khi nhiều ngày (dọn dãy thùng bằng while) gần giống robot-hoan-thien.5: có muốn đổi ý bài .8 không?
- Màn không có cờ "đâm là thua" thì lời đếm cứng đi quá (húc tường) vẫn thắng với ít sao hơn (vd robot-hoan-thien.4: 1 sao). Có muốn bật "đâm là thua" cho cả gói 10?
  (Cờ này hiện chỉ cho màn ép khối mới theo định nghĩa của kiem-lach-mua-1; bật cho gói 10 cần sửa máy dò đó.)

## Việc kỹ thuật ghi lại
- `tools/do-lo-trinh.mjs --ghi-sao` hiện ghi lại lo-trinh-sao.js khác bản đã commit kể cả trước đợt này (đổi thứ tự, thêm list.1, bớt che-list.8 / .9): chưa ai dọn.
  Các agent đợt này sửa tay đúng mục màn mình đổi.
