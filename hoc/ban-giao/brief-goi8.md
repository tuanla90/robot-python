NHỊP (đọc trước): commit đầu tiên trong ~25 phút (vd 3 màn đầu + máy kiểm khung); sau đó mỗi 3–5 màn một commit. Viết màn nào chạy máy kiểm màn đó. Hết sức thì dừng và báo còn gì: thà 10 màn đúng có commit còn hơn 20 màn không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi vào báo cáo cuối. Bạn KHÔNG nhận được tin nhắn giữa chừng: mọi thứ cần biết nằm ở đây.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (4 agent chạy song song; CẤM npm test cả bộ; không trình duyệt; tệp dùng chung chỉ THÊM dòng).

LOẠI: Ship          MODEL: Gemini gemini-4-argon-high (user 28/10: gói nội dung giao Gemini, Claude nghiệm thu)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\goi8-doi-mua-2, nhánh claude/doi-mua-2 (đang ở d3af762). Chỉ commit trên nhánh này.

MỤC TIÊU: xong khi gói 8 mùa 2 "Đội" có đủ 20 màn mới trong hoc/man-doi-mua-2.js (chương `doi-mua-2` 10 màn: doi-mua-2.1 … .10; chương `che-doi-mua-2` "Đội phối hợp" 10 màn: che-doi-mua-2.1 … .10), mỗi màn có lời giải thắng 3 sao, đường cong độ khó mượt, máy kiểm mới hoc/kiem-doi-mua-2.mjs và bộ dò hoc/do-duong-doi-mua-2.mjs đều đạt, các máy kiểm liên quan có sẵn vẫn đạt.

BỐI CẢNH (đọc các tệp này trước khi viết màn):
- Kế hoạch: hoc/KE-HOACH-MUA-2.md (bảng 10 gói, mục Trạng thái các gói 1–7: luật lõi, hàm của em đã có, bẫy đã dùng), hoc/KE-HOACH-7-MUA.md (khuôn 10 gói: gói 8 = ĐỘI), hoc/KE-HOACH-MUA-1.md mục "Đường cong học và recall".
- Khung đã chừa sẵn: hoc/man-doi-mua-2.js (mảng DS rỗng, đọc chú thích đầu tệp: ràng buộc mùa 2), đã đăng ký ở lo-trinh-hoc.js và choi.html. Chỉ việc thêm màn vào DS.
- Mẫu gói đã làm tốt nhất để bắt chước cấu trúc (màn, chú thích đầu tệp, máy kiểm, bộ dò): hoc/man-do-nhiet.js + hoc/kiem-do-nhiet.mjs + hoc/do-duong-do-nhiet.mjs (gói 7, 20 màn, có timLoiNeNhanh / timThanCoDinh dùng lại được). Mẫu màn ĐỘI (nhiều robot, tab R1 / R2, mỗi robot một chương trình): mùa 1 gói 8 hoc/man-doi-mua-1.js (chương hai-robot / che-hai-robot) + hoc/do-duong-hai-robot.mjs. Tham khảo thêm hoc/man-doi-sung-hoi.js, hoc/man-doi-xich.js (chương cũ đã rời mùa 2, đừng sửa, đừng dùng lại mã màn).
- Lõi đã có, KHÔNG sửa lõi (hoc/san-hoc.js, hoc/cham.js): warm() trả True khi vật cản đầu tiên trước mũi xe là ROBOT KHÁC (vat 'dong-doi') hoặc nút bắn đang bật; distance() đếm ô trống tới vật cản (robot khác cũng là vật cản); xích (`than: 'xich'`), súng hơi (`tay: 'hoi'`), lực bắn, xích đẩy thùng nặng `cfg.xichDay`, nút bật sẵn `cfg.nutBat`. Đọc san-hoc.js mục "CẢM BIẾN HỒNG NGOẠI" (dòng ~174) và mục SÚNG BÓNG. KHÔNG dùng `cfg.beSung` (gói 9).
- Ý gói: đội xích + súng hơi, hồng ngoại THẤY ROBOT: robot dùng warm() / distance() để biết đồng đội đang đứng trước mặt (chờ đồng đội đi qua, nhường đường, bắn nút mở cửa cho đồng đội, xích đẩy thùng dọn đường cho xe súng, đứng thành hàng). Chương 1 làm quen, chương 2 "Đội phối hợp" = hàm của em dùng cho cả đội (chương trình chính khóa, gọi hàm ở nhiều chỗ, như gói 7).

LUẬT HỌC (user chốt, áp nghiêm):
- Đường cong mượt: trong chương, màn 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm TỐI ĐA một điều mới; không nhảy vọt độ dài lời giải / số nhịp / cỡ sân giữa hai màn liền nhau; không hai màn liền nhau cùng kiểu bài.
- Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs kiểm): part mùa 1 + xích + súng hơi + hồng ngoại; không bậc thang S, hố u, gầm n; hàm của em phải được tạo ở màn đứng trước.
- Màn đọc cảm biến phải CẦN cảm biến: lời cố định (không đọc cảm biến) KHÔNG được 3 sao (bộ dò phải chứng minh).
- Mỗi màn một sân, nhiều sân chỉ ở màn trùm (.10). Chữ hiển thị tiếng Việt, không emoji, không dấu gạch dài. Hàm của em đặt tên tiếng Anh ngắn, không trùng hàm đã có (grep so-lenh.js và các man-*.js trước).
- Giữ `ma` màn đúng mẫu `chuong.so`.

PHẠM VI: được sửa hoc/man-doi-mua-2.js; tạo hoc/kiem-doi-mua-2.mjs, hoc/do-duong-doi-mua-2.mjs; THÊM (không sửa dòng khác) huy hiệu `doi-mua-2`, `che-doi-mua-2` trong hoc/game/huy-hieu.js (hình kiểu pixel như các huy hiệu gói 7 `do-nhiet`), mục hàm của em trong hoc/so-lenh.js, một dòng chương → nhóm trong hoc/kiem-che-xe.mjs (như 'che-do-nhiet': 'hong-ngoai'). Máy kiểm có sẵn đỏ vì giả định cũ (vd "không màn nào có nhiều robot ở mùa 2") → được sửa giả định đó tối thiểu, ghi rõ trong báo cáo. KHÔNG sửa: lõi, lộ trình, màn của gói khác, kế hoạch (.md), giao diện, man-be-sung.js (gói 9 đang làm song song).

KIỂM TRA (tại worktree, từng lệnh một; CẤM `npm test` không lọc):
  node hoc/kiem-doi-mua-2.mjs            ← máy kiểm mới: mọi màn thắng 3 sao bằng lời giải; mã mẫu không thắng; đường cong (bảng nhịp / dòng theo thứ tự màn); `--loi-gia` cắm lỗi giả phải đỏ
  node hoc/do-duong-doi-mua-2.mjs        ← lời cố định không 3 sao
  node hoc/kiem-lo-trinh.mjs             ← ràng buộc mùa 2
  node hoc/kiem-che-xe.mjs
  npm test -- hoc/kiem-do-nhiet          ← (lọc) các máy kiểm gói kề, chạy riêng từng cái nếu nghi ảnh hưởng
  Không mở trình duyệt, không chạy server.

BÁO CÁO CUỐI (ghi vào tệp D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-goi8.md, ghi dần sau mỗi commit, không đợi cuối):
  1 KẾT QUẢ: SHA từng commit, bảng 20 màn (mã · tên · điều mới · số dòng lời giải · số nhịp), lệnh kiểm + kết quả NGUYÊN VĂN (dán output, không tóm tắt).
  2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT cho gói 10. 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
  Chỉ ghi điều đã thật sự chạy. Người nghiệm thu tự chạy lại mọi lệnh.
