NHỊP (đọc trước): commit đầu tiên trong khoảng 20 phút. Sau đó mỗi nhóm 3–5 tệp màn một commit. Hết sức thì dừng và báo còn gì: thà 6 tệp đúng còn hơn 12 tệp không có commit nào.

SONG SONG: phiên khác có thể gộp việc vào main. Bạn làm trên nhánh riêng. CẤM định dạng lại tệp. CẤM chạy npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4208.

LOẠI: Ship          MODEL: opus (điểm: quy mô 2 (khoảng 12 tệp màn mùa 2 + huong-dan-man.js + lõi), choke 1 (chuỗi hiển thị trong san-hoc.js / cham.js), giá sai 1 (chữ sai trên màn), mơ hồ 1 (tách chữ hiển thị khỏi chú thích), suy luận 0 = 5)

MỤC TIÊU: xong khi người chơi KHÔNG còn thấy chữ "bắn" ở bất kỳ đâu trong mùa 2: đề bài (deBai), mô tả mã mẫu (veMaMau), gợi ý (goiY), tên màn, mô tả lời sai (moTa) nếu có hiện ra,
  hướng dẫn từng bước (huong-dan-man.js), lời báo lỗi / chẩn đoán (cham.js, san-hoc.js), Sổ lệnh, thẻ part. Tên lệnh Python giữ nguyên.

BỐI CẢNH:
- User 29/10 chốt: cỗ máy mùa 2 là Xe cứu hỏa R1, không còn chủ đề chiến tranh. Hai đợt trước đã đổi "súng hơi → vòi phun", "bóng hơi → tia nước", "nút bắn → van hơi".
  Đợt vòi phun cố ý GIỮ chữ "bắn". Nay user muốn đổi nốt: "Đổi 'bắn' thành 'phun / xịt' trong mùa 2".
- Tên gói, tên chương và lời 10 phim mùa 2 đã đổi xong (nhánh claude/ten-mua-2, khối đặt tên cuối lo-trinh-hoc.js, chu.js pg.*). Đợt này KHÔNG đụng các phần đó.
- Quy tắc giọng kể: hoc/KE-HOACH-7-MUA.md mục "Quy tắc đặt tên và giọng kể". Nhân vật chính là "em", R1 là bộ não robot. Câu trong màn có thể giữ chủ thể R1 / xe.
- BẢNG ĐỔI (người giao chọn; chỗ nào đọc ngượng thì nêu trong báo cáo, đừng tự đổi khác bảng):
  | Cũ | Mới |
  |---|---|
  | bắn (động từ) | phun |
  | bắn tụ / bắn nhanh | phun tụ / phun nhanh |
  | lực bắn | lực phun |
  | phát bắn, phát | lượt phun |
  | bắn trúng | phun trúng |
  | "Bắn là lùi" (tên màn) | "Phun là lùi" |
  | bắn ra sau | phun ra sau |
  Chỉ dùng "xịt" khi câu nói về tia ngắn, nhẹ, và "phun" nghe lặp; không bắt buộc.
- GIỮ NGUYÊN: lệnh shoot(), shoot_back(), shoot("fast"), shoot("charge"), fire(p) và tên hàm của màn (aim_fire, close_fire, box_shot, pair_shot, blast_left…).
  Đổi tên hàm là đổi lời giải, máy chấm, ngưỡng sao, nên đợt này không làm. Nếu thấy tên hàm có chữ "fire" / "shot" đọc ngượng thì liệt kê trong báo cáo.
  Giữ cả mã gói / chương / màn (luc-ban, be-sung…), mã sự kiện và mã chẩn đoán.
- Mùa 1, 3, 4 không đụng (đồ chơi máy ném ở mùa sau có chữ "ném", không phải "bắn"; nếu gặp "bắn" ngoài mùa 2 thì liệt kê, đừng sửa).

PHẠM VI: được sửa chuỗi hiển thị trong hoc/man-*.js của các chương mùa 2 (xich, bien-xich, sung-hoi, tham-so, hong-ngoai, che-hong-ngoai, bang-chuyen, che-sung-hoi, day-thung, che-day-thung,
  luc-ban, che-luc-ban, do-nhiet, che-do-nhiet, doi-mua-2, che-doi-mua-2, be-sung, che-be-sung, tong-hop-2, trum-mua-2 và các tệp ngân hàng chúng lấy màn),
  hoc/lo-trinh-hoc.js (chỉ chuỗi deBai / veMaMau / goiY trong khối MÙA 2 và khối gói T; KHÔNG sửa khối đặt tên ở cuối tệp),
  hoc/game/huong-dan-man.js, hoc/san-hoc.js và hoc/cham.js (chỉ chuỗi người chơi đọc), hoc/so-lenh.js, hoc/gioi-thieu-part.js, các máy kiểm khẳng định nguyên văn chuỗi cũ (sửa theo chuỗi mới, đừng nới).
KHÔNG sửa: chu.js (đã xong), khối đặt tên cuối lo-trinh-hoc.js, luật trong san-hoc.js, mã nội bộ, tên lệnh / tên hàm, chú thích code (chú thích có chữ "bắn" để nguyên).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Bạn được phép và được khuyến khích nói ngược lại, kèm bằng chứng. Kiểm lại từng khẳng định trong brief bằng code, đừng tin.
  Bất đồng CHẶN đường thì dừng, commit WIP, báo ngay. Bất đồng không chặn thì làm theo brief rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
  Bảng đổi là quyết định của người giao; giữ tên lệnh shoot() là quyết định của user (code Python thật).

TRƯỚC KHI SỬA: một chuỗi hiển thị có thể bị máy kiểm hay mã khác so nguyên văn (tìm theo tên màn, tên huy hiệu, chẩn đoán). grep chuỗi đó trước khi đổi.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-lo-trinh.mjs ; node hoc/kiem-lach-mua-2.mjs ; node hoc/kiem-huong-dan.mjs ; node hoc/kiem-loi-mua-2.mjs
  node hoc/kiem-sung-hoi.mjs ; node hoc/kiem-che-sung-hoi.mjs ; node hoc/kiem-luc-ban.mjs ; node hoc/kiem-che-luc-ban.mjs ; node hoc/kiem-do-nhiet.mjs
  node hoc/kiem-be-sung.mjs ; node hoc/kiem-doi-mua-2.mjs ; node hoc/kiem-trum-mua-2.mjs ; node hoc/kiem-tham-so.mjs ; node hoc/kiem-bang-chuyen.mjs
  (tên tệp đúng thì kiểm bằng ls hoc/kiem-*.mjs; tệp nào không có thì bỏ.)
  Cuối cùng: grep chứng minh không còn chữ hiển thị "bắn" nào trong mùa 2. In phần còn lại, mỗi dòng ghi là chú thích, mã nội bộ hay ngoài mùa 2.
  Trình duyệt: `node -e "process.env.PORT='4208';import('./server.mjs')"` chạy nền, TẮT khi xem xong. Mở `hoc/game/choi.html?debug=1`, bật Mở hết.
  Vào luc-ban.1, do-nhiet.1, be-sung.1: đề bài và bong bóng hướng dẫn không còn "bắn". Khổ 360 px không tràn.

CÁCH GIAO: worktree riêng do Agent tool tạo. Việc đầu tiên: `git checkout -b claude/ban-thanh-phun`, rồi kiểm HEAD là main mới nhất (`git log --oneline -1 main`).
  KHÔNG push, KHÔNG merge main.

DỪNG VÀ HỎI KHI: phải đổi tên hàm / lời giải; phải đụng luật; phạm vi phình ra ngoài mùa 2.

BÁO CÁO CUỐI, đủ 5 mục (mục nào trống ghi "không có"):
  1. KẾT QUẢ: nhánh, SHA từng commit, số chỗ đã đổi theo tệp, lệnh kiểm và dòng tổng nguyên văn, grep cuối.
  2. CÂU HỎI CẦN LÀM RÕ: chỗ đọc ngượng, tên hàm có fire / shot, "bắn" ngoài mùa 2; chỗ brief sai hoặc thiếu.
  3. ĐỀ XUẤT (nếu có), theo khung phân tích rõ.
  4. CHO NGƯỜI KHÔNG ĐỌC CODE: 4–6 câu.
  5. RỦI RO CÒN LẠI.
