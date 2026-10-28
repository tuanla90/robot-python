NHỊP (đọc trước): commit đầu tiên trong ~20 phút (vd máy kiểm khung + 2 màn đầu); sau đó mỗi 2–4 màn một commit; TỐI ĐA 40 phút một commit. Agent gói 9 lần 1 đứng 4 tiếng không commit rồi mất trắng: CẤM khảo sát dài trước khi viết màn đầu tiên. Viết màn nào chạy máy kiểm màn đó. Hết sức thì dừng và báo còn gì: thà 10 màn đúng có commit còn hơn 20 màn không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (3 agent song song; CẤM npm test cả bộ; không trình duyệt; tệp dùng chung chỉ THÊM dòng). Rồi brief gói 9 cùng thư mục: brief-goi9.md (mục BỐI CẢNH và LUẬT HỌC áp dụng y nguyên cho gói 10, trừ chỗ ghi khác dưới đây).

LOẠI: Ship          MODEL: fable (điểm: quy mô 1, choke 1 (so-lenh / lộ trình), giá sai 1, mơ hồ 2 (tự thiết kế 20 màn + trùm cuối mùa), suy luận 2 (bộ dò, recall) = 7)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\goi10-trum-mua-2, nhánh claude/trum-mua-2 (từ 6348c9f: đã có gói 1–9 mùa 2).

MỤC TIÊU: xong khi gói 10 mùa 2 "Nhà máy chạy lại" (gói cuối mùa) có đủ 20 màn trong hoc/man-trum-mua-2.js: chương `tong-hop-2` "Tổng hợp" (tong-hop-2.1 … .10, màn 10 trùm có huy hiệu `tong-hop-2`) và chương `trum-mua-2` "Trùm mùa" (trum-mua-2.1 … .10, màn 10 là TRÙM CUỐI MÙA 2, huy hiệu riêng, vd `nha-may-chay`); mỗi màn thắng 3 sao, đường cong mượt, bảng recall đạt; máy kiểm mới hoc/kiem-trum-mua-2.mjs + bộ dò hoc/do-duong-trum-mua-2.mjs đạt; máy kiểm có sẵn liên quan đạt.

BỐI CẢNH RIÊNG GÓI 10:
- Mẫu gói 10 tốt nhất: mùa 1 gói 10 "R1 xuất xưởng" (hoc/man-trum-mua-1.js + hoc/kiem-trum-mua-1.mjs; mô tả ở hoc/KE-HOACH-MUA-1.md dòng "27/10 gói G xong"): chương 1 Tổng hợp, chương 2 Trùm mùa, trùm cuối nhiều sân dùng gần hết part / hàm của mùa, có màn hai robot.
- Bảng gói mùa 2 và trạng thái từng gói: hoc/KE-HOACH-MUA-2.md (đọc mọi dòng "28/10 P8", "28/10 P9" và các gói trước: luật lõi, hàm của em có sẵn, bẫy). Hàm của em mùa 2 đã có: hoc/so-lenh.js (nhóm hoi, hong-ngoai, xich…).
- Khung đã chừa: hoc/man-trum-mua-2.js (DS rỗng; đọc chú thích đầu tệp), đã đăng ký ở lo-trinh-hoc.js (gói `nha-may-chay`) và choi.html.
- Gói 9 vừa gộp: hoc/man-be-sung.js, hoc/kiem-be-sung.mjs (bảng recall mùa 2 GOI_RECALL / recallMan: dùng lại, mở rộng thêm cột gói 8 Đội và gói 9 Bệ súng xích), hoc/do-duong-be-sung.mjs (bộ mô phỏng xích + súng, so chéo lõi). Gói 8 Đội: hoc/man-doi-mua-2.js, hoc/kiem-doi-mua-2.mjs (màn hai robot; mọi màn khóa vì chưa có bộ dò chung hai robot).
- RECALL CẦN BÙ (số màn của gói 9 nhắc mỗi gói mùa 2, người giao đo): gói 1 (xích, biến, sidestep): 2 · gói 2 (súng hơi, tham số): 18 · gói 3 (hồng ngoại distance()): 5 · gói 4 (nhà máy: nút bắn + cửa, băng chuyền): 20 · gói 5 (xích đẩy thùng): 3 · gói 6 (lực bắn): 16 · gói 7 (warm()): 6 · gói 8 (đội): 0.
  LUẬT: trên gói 9 + 10 (40 màn) mỗi gói 1–8 được nhắc ≥ 3 lần; trong gói 10 mỗi gói 1–9 được nhắc ≥ 3 lần (gói 1, 5, 8 phải nhiều hơn mức đó vì gói 9 nhắc ít); mỗi màn mới dùng ≥ 2 gói trước. Máy kiểm in bảng recall 20 màn + tổng gộp gói 9 + 10 và kiểm các luật này.
- Gói 8 có màn hai robot: gói 10 nên có 2–3 màn hai robot (R1 #38BDF8, R2 #F472B6 do bộ vẽ tự lo). Nếu màn đội mở (không khóa) mà không chứng minh được bằng bộ dò thì khóa chương trình như gói 8, ghi lý do.
- Chương 2 Trùm mùa: tinh thần "nhà máy chạy lại": dùng hàm của em các chương 2 mùa 2 (đã tạo ở màn trước) nhiều chỗ, có màn sửa hàm lỗi, có màn nhiều sân một chương trình, trùm cuối (.10) 2–3 sân dùng gần hết: xích đẩy thùng, súng hơi lực bắn, bệ súng, hồng ngoại distance() + warm(), băng chuyền, cửa + nút bắn, biến, hàm có tham số. Không hai màn liền nhau cùng kiểu bài.
- Nút bật sẵn `cfg.nutBat`: nếu dùng, thêm hai chương của bạn vào GOI_DUNG_SAU trong hoc/kiem-nut-bat-san.mjs (một dòng, như dòng gói 9 người giao vừa thêm).

PHẠM VI: được sửa hoc/man-trum-mua-2.js; tạo hoc/kiem-trum-mua-2.mjs, hoc/do-duong-trum-mua-2.mjs; THÊM (không sửa dòng khác): huy hiệu pixel `tong-hop-2` và huy hiệu trùm mùa trong hoc/game/huy-hieu.js (kiểu như be-sung; bản vector KHÔNG làm: V7b lo), mục hàm của em (nếu có) trong hoc/so-lenh.js ĐẶT SAU khối che-be-sung (thứ tự mục = thứ tự chế trong game, kiem-che-xe kiểm), một dòng chương → nhóm trong hoc/kiem-che-xe.mjs, dòng GOI_DUNG_SAU trong kiem-nut-bat-san.mjs nếu dùng nutBat, khoá 'huy-hieu.js' trong SUA_SAU_NEN của kiem-bang-mau.mjs: nối lý do vào cuối chuỗi khoá đã có (đừng tạo khoá trùng). Máy kiểm có sẵn đỏ vì giả định cũ → sửa giả định tối thiểu, ghi rõ. KHÔNG sửa: lõi (san-hoc.js, cham.js), lộ trình, màn gói khác, kế hoạch (.md), giao diện, phim.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): ghi vào CÂU HỎI CẦN LÀM RÕ; bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Kiểm lại từng khẳng định ở đây bằng code (vd số recall: tự đo lại). Quyết định của USER (không tự đi ngược): khuôn 10 gói × 2 chương × 10 màn; gói 9–10 phong phú, nhắc lại mọi gói trước; chữ không emoji / không gạch dài.

KIỂM TRA (tại worktree, từng lệnh một; CẤM npm test không lọc):
  node hoc/kiem-trum-mua-2.mjs            ← mọi màn thắng 3 sao; mã mẫu không thắng; đường cong; bảng recall gói 10 và gộp 9 + 10; `--loi-gia` cắm lỗi giả phải đỏ
  node hoc/do-duong-trum-mua-2.mjs        ← lời cố định / lời thiếu part không 3 sao; so chéo lõi
  node hoc/kiem-be-sung.mjs
  node hoc/kiem-doi-mua-2.mjs
  node hoc/kiem-lo-trinh.mjs
  node hoc/kiem-che-xe.mjs
  node hoc/kiem-loi-mua-2.mjs
  node hoc/kiem-nut-bat-san.mjs
  node hoc/kiem-bang-mau.mjs
  Không mở trình duyệt, không chạy server.

CÁCH GIAO: commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge.

BÁO CÁO CUỐI (ghi dần sau mỗi commit vào D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-goi10.md, VÀ trong câu trả lời cuối):
  1 KẾT QUẢ: SHA từng commit, bảng 20 màn (mã · tên · kiểu bài · điều mới · gói được nhắc · số dòng lời giải · số nhịp), bảng recall gói 10 + gộp 9 + 10, lệnh kiểm + output NGUYÊN VĂN.
  2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT (phim mùa 2, mùa 3). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
  Chỉ ghi điều đã thật sự chạy. Người nghiệm thu tự chạy lại mọi lệnh.
