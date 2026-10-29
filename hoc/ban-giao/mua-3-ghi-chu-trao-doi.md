# Mùa 3: ghi chú cần trao đổi lại với user (phiên "Mùa 3", từ đêm 29/10)

User 29/10 tối: "tôi treo máy đêm nay, bạn cứ làm và tự quyết các phần đơn giản. Xong gói nào commit gói đó. note lại những điều cần trao đổi lại".
Nhánh làm: `claude/mua-3-man` (worktree `.claude/worktrees/mua-3-man`, tách từ main f18b538). Chưa gộp main, chưa push.

## Quyết định đã tự chốt (đảo lại được)
1. Gói 1 chương `nhen`: màn trình diễn nhen.11 đứng đầu; chưa dùng crouch / stand (gói 5) và chưa dùng chuỗi (chương 2). Hàm của em mới: `step_down()`, `stairs(n)`.
2. Gói 1 chương `chuoi-nhen`: hàm của màn `step_to(d)` cho hai màn đầu (chỉ vài nhánh), hàm của em mới `trail(path)`; không dùng `+` / `*` chuỗi vì khay khối chưa có khối đó (nhân Python có).
3. Huy hiệu trùm: nhen.10 (giờ là trùm chương Nhảy) vẫn mang huy hiệu "Thân nhện"; trùm mới nhen.18 / chuoi-nhen.8 tạm chưa có huy hiệu. Cần chốt cách đặt huy hiệu cả mùa 3 khi xong.
4. Máy đo đường cong mùa 3 (kiem-lo-trinh mục (h)): miễn màn trình diễn chiChay như mùa 2 (g).

## Câu hỏi cần user trả lời
(ghi dần)

## Gói 2 Nam châm (xong 29/10 đêm, commit ebe6ff5)
- Tự chốt: khay gói 2 chỉ cực N (magnet_n, magnet_off) như P0. Hàm của em mới: `to_turn()` (while front_clear() and not right_clear(): move()).
- Tự chốt (giao diện, cần user xem): **trình soạn khối trước đây chỉ cho ghép hai vế and / or ở màn có color() hay battery()**. Mùa 3 cần and / or với cảm biến
  khoảng cách nên tôi thêm cờ màn `vaHoac: true` (thanh-phan.js CHE_VH, man-choi.js truyền cờ): điều kiện toàn cảm biến tách ô, chạm vế có nút "+ and" / "+ or",
  vế mới là cảm biến. Đã thử trên trình duyệt: logic-nam-cham.2 ghép and bằng chạm, chạy 3 sao. Màn màu cũ không đổi (kiem-mau 148/0).
- Lưu ý thiết kế: vừa rẽ phải ở chỗ rẽ thì bên phải là đường cũ, nên `not right_clear()` sai ngay; màn to_turn cho xe tiến một ô sau mỗi lần rẽ.
- Đo đường cong theo luật mùa 2 khiến vài màn phải thêm "ô phụ" (ô sàn tách rời không nằm trên đường) để số ô tăng dần (logic-nam-cham.4 / .5). Nếu user thấy lạ thì bỏ được bằng cách đổi thứ tự.

## Câu hỏi
1. Huy hiệu trùm mùa 3: mỗi chương một huy hiệu như mùa 1–2, hay chỉ trùm gói? Hiện trùm mới chưa có huy hiệu.
2. Máy dò lời giải lách mùa 3 (kiem-lach-mua-3, như mùa 1–2): sẽ làm khi xong 10 gói.
