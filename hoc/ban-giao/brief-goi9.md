NHỊP (đọc trước): commit đầu tiên trong ~25 phút (vd 3 màn đầu + máy kiểm khung); sau đó mỗi 3–5 màn một commit. Viết màn nào chạy máy kiểm màn đó. Hết sức thì dừng và báo còn gì: thà 10 màn đúng có commit còn hơn 20 màn không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi vào báo cáo cuối. Bạn KHÔNG nhận được tin nhắn giữa chừng: mọi thứ cần biết nằm ở đây.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (4 agent chạy song song; CẤM npm test cả bộ; không trình duyệt; tệp dùng chung chỉ THÊM dòng).

LOẠI: Ship          MODEL: Gemini gemini-4-argon-high (user 28/10: gói nội dung giao Gemini, Claude nghiệm thu)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\goi9-be-sung, nhánh claude/be-sung (đang ở d3af762). Chỉ commit trên nhánh này.

MỤC TIÊU: xong khi gói 9 mùa 2 "Bệ súng xích" (gói COMBO) có đủ 20 màn mới trong hoc/man-be-sung.js (chương `be-sung` 10 màn: be-sung.1 … .10; chương `che-be-sung` "Hàm bệ súng" 10 màn: che-be-sung.1 … .10), mỗi màn có lời giải thắng 3 sao, đường cong mượt, bảng recall đạt, máy kiểm mới hoc/kiem-be-sung.mjs và bộ dò hoc/do-duong-be-sung.mjs đều đạt, các máy kiểm liên quan có sẵn vẫn đạt.

BỐI CẢNH (đọc trước khi viết màn):
- Kế hoạch: hoc/KE-HOACH-MUA-2.md (bảng 10 gói; mục Trạng thái các gói 1–7: luật lõi, hàm của em đã có, bẫy đã dùng), hoc/KE-HOACH-7-MUA.md (khuôn: gói 9 = COMBO hai part của mùa), hoc/KE-HOACH-MUA-1.md mục "Đường cong học và recall".
- Khung đã chừa: hoc/man-be-sung.js (DS rỗng; đọc chú thích đầu tệp), đã đăng ký ở lo-trinh-hoc.js và choi.html.
- Mẫu cấu trúc gói tốt nhất: hoc/man-do-nhiet.js + hoc/kiem-do-nhiet.mjs + hoc/do-duong-do-nhiet.mjs (gói 7). Mẫu gói COMBO và BẢNG RECALL: mùa 1 gói 9 hoc/man-combo-mua-1.js + hoc/kiem-combo-mua-1.mjs (xuất recallMan, kiemRecall, GOI_RECALL: dùng lại, đổi bảng gói theo mùa 2).
- Lõi đã có, KHÔNG sửa lõi (hoc/san-hoc.js, hoc/cham.js): BỆ SÚNG XÍCH `cfg.beSung = true`: xích gắn súng hơi bắn TỤ (shoot("charge") hay shoot()) thì xe KHÔNG giật (không sự kiện 'giat', thùng sau xe không bị hất; có sự kiện 'be-sung'); bắn nhanh ("fast") như cũ; thân khác (hai bánh) có cờ vẫn giật. Đọc san-hoc.js dòng ~90–100 và mục SÚNG BÓNG / lực bắn (gói 6), xích đẩy thùng `cfg.xichDay` (gói 5), hồng ngoại distance() / warm() + nút bật sẵn `cfg.nutBat` (gói 3, 7).
- Ý gói: đây là combo ĐẮT GIÁ của mùa 2: xích + súng hơi = bệ súng vững. Điều mới: biết lúc nào giật có hại (đứng sát mép / trước thùng, giật làm lệch) và bệ súng giải được, so sánh xe hai bánh (giật) với xích (không giật) trên cùng một bài, bắn tụ liên tiếp không lùi, đẩy thùng rồi bắn tại chỗ. Chương 2 "Hàm bệ súng": hàm của em cho bệ súng (chương trình chính khóa, gọi hàm nhiều chỗ, như gói 7).

LUẬT HỌC (user chốt, áp nghiêm):
- Đường cong mượt: trong chương, màn 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm TỐI ĐA một điều mới; không nhảy vọt độ dài lời giải / nhịp / cỡ sân; không hai màn liền nhau cùng kiểu bài.
- Gói 9 PHONG PHÚ + RECALL: mỗi màn mới dùng ≥ 2 gói trước (đọc từ lời giải, như kiem-combo-mua-1); trong 20 màn gói 9, mỗi gói 1–7 mùa 2 được nhắc lại ≥ 2 lần (gói 10 sẽ bù để gói 1–8 đạt ≥ 3 lần trên gói 9 + 10). Gói 8 Đội (nhiều robot) đang viết song song: KHÔNG dựa vào màn / hàm của gói 8, không làm màn nhiều robot.
- Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): part mùa 1 + xích + súng hơi + hồng ngoại; không bậc thang S, hố u, gầm n; hàm của em phải được tạo ở màn đứng trước (được GỌI hàm của em các gói 1–7 đã tạo, xem so-lenh.js).
- Màn nào nói về bệ súng phải CẦN bệ súng: bộ dò chứng minh lời giải tương tự trên xe giật (hoặc không khai beSung) KHÔNG thắng / không 3 sao; màn đọc cảm biến thì lời cố định không 3 sao.
- Mỗi màn một sân, nhiều sân chỉ ở trùm (.10). Chữ hiển thị tiếng Việt, không emoji, không dấu gạch dài. Hàm của em tên tiếng Anh ngắn, không trùng hàm đã có (grep so-lenh.js và man-*.js).

PHẠM VI: được sửa hoc/man-be-sung.js; tạo hoc/kiem-be-sung.mjs, hoc/do-duong-be-sung.mjs; THÊM (không sửa dòng khác) huy hiệu `be-sung`, `che-be-sung` trong hoc/game/huy-hieu.js (kiểu pixel như huy hiệu `do-nhiet`), mục hàm của em trong hoc/so-lenh.js, một dòng chương → nhóm trong hoc/kiem-che-xe.mjs. Máy kiểm có sẵn đỏ vì giả định cũ (vd "không màn nào khai beSung") → được sửa giả định tối thiểu, ghi rõ trong báo cáo. KHÔNG sửa: lõi, lộ trình, màn gói khác, kế hoạch (.md), giao diện, man-doi-mua-2.js (gói 8 đang làm song song).

KIỂM TRA (tại worktree, từng lệnh một; CẤM `npm test` không lọc):
  node hoc/kiem-be-sung.mjs              ← máy kiểm mới: mọi màn thắng 3 sao; mã mẫu không thắng; đường cong; BẢNG RECALL in ra; `--loi-gia` cắm lỗi giả phải đỏ
  node hoc/do-duong-be-sung.mjs          ← lời xe giật / lời cố định không 3 sao
  node hoc/kiem-lo-trinh.mjs
  node hoc/kiem-che-xe.mjs
  node hoc/kiem-loi-mua-2.mjs            ← lõi mùa 2 (beSung) giữ đạt
  Không mở trình duyệt, không chạy server.

BÁO CÁO CUỐI (ghi vào D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-goi9.md, ghi dần sau mỗi commit):
  1 KẾT QUẢ: SHA từng commit, bảng 20 màn (mã · tên · điều mới · gói được nhắc · số dòng lời giải · số nhịp), bảng recall, lệnh kiểm + kết quả NGUYÊN VĂN.
  2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT cho gói 10. 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
  Chỉ ghi điều đã thật sự chạy. Người nghiệm thu tự chạy lại mọi lệnh.
