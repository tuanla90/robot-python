NHỊP (đọc trước): commit đầu tiên trong ~20 phút (vd kịch bản 10 gói vào KE-HOACH-PHIM-GOI.md + khung tệp phim-mua-2.js + máy kiểm mở rộng); sau đó mỗi 2–3 phim một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi viết dòng đầu tiên. Làm phim nào xem phim đó. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (3 agent song song; CẤM npm test cả bộ; tệp dùng chung chỉ THÊM dòng). Cổng server tạm của bạn: 4202.

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (phim-goi.js bộ máy chung), giá sai 0, mơ hồ 2 (tự viết kịch bản), suy luận 1 = 5)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\phim-mua-2, nhánh claude/phim-mua-2 (từ 6348c9f).

MỤC TIÊU: xong khi MỌI gói mùa 2 (10 gói: xich, sung-hoi, hong-ngoai, nha-may, day-thung, luc-ban, do-nhiet, doi-mua-2, be-sung, nha-may-chay — lấy danh sách thật từ mảng MUA_2 trong hoc/lo-trinh-hoc.js) có phim mở gói 3–4 khung trong hoc/game/phim-mua-2.js, chiếu đúng lần đầu vào gói và xem lại được (▶ trên hộp gói, Cài đặt "Xem lại phim các gói"), đẹp ở `?ve=vector` (sắp là mặc định), chạy không lỗi ở pixel, máy kiểm đạt.

BỐI CẢNH:
- Kế hoạch phim + kịch bản mùa 1 (mẫu): hoc/KE-HOACH-PHIM-GOI.md. User 27/10: "mỗi gói bạn làm 1 đoạn hoạt hình ngắn giống đoạn mở đầu để giới thiệu các robot, cơ chế mới trong màn"; "các mùa khác cũng phải có phim cho mọi gói"; dữ liệu mùa n ở game/phim-mua-n.js cùng bộ máy.
- Bộ máy: hoc/game/phim-goi.js (PhimGoi.them / mo / co; c.xe, c.san, c.code…). Dữ liệu mẫu: hoc/game/phim-mua-1.js (9 phim, đã vector hoá: VeRobot.veCo, VeRobot.vatKep, PhimVector, mắt biểu cảm). Icon / ô / vật vector: hoc/game/phim-vector.js, hoc/game/ve-vector-icon.js. Máy kiểm: hoc/kiem-phim-goi.mjs (33), hoc/kiem-huy-hieu-phim-vector.mjs (10, có mục B5 pixel phim-mua-1 y nguyên), hoc/kiem-nut-mo-dau-phim-vector.mjs (11: phim không phông pixel / mực kem, không icon .pxi ở vector).
- Truyện nối mùa 1: phim gói 10 mùa 1 kết bằng R1 lăn ra khỏi xưởng, xa xa trên đồi thấy BÁNH XÍCH văng hôm trước (nhá mùa 2). Mùa 2 "Ghi nhớ" (biến, tham số): R1 tìm lại / nhận part mới, nhà máy dần chạy lại. Mỗi gói, nội dung xem ở hoc/KE-HOACH-MUA-2.md (bảng 10 gói + trạng thái từng gói: part, cơ chế, lệnh mới):
  1 Bánh xích (xích, biến đếm) · 2 Súng hơi (shoot(), tham số) · 3 Hồng ngoại (d = distance()) · 4 Nhà máy (thùng nặng, băng chuyền, cửa + nút bắn) · 5 Đẩy thùng (xích đẩy thùng nặng khi tiến) · 6 Lực bắn (shoot("fast") / shoot("charge")) · 7 Đo nhiệt (warm(): robot, nút đang bật thì nóng) · 8 Đội (R1 xích + R2, warm() thấy bạn) · 9 Bệ súng xích (xích bắn tụ không giật) · 10 Nhà máy chạy lại (tổng hợp + trùm; màn đang viết song song, phim chỉ dựa vào chủ đề: dây chuyền chạy lại, các huy hiệu mùa 2 bay quanh, nhá mùa 3 "Tín hiệu": nhện / nam châm / cảm ứng từ).
  Khung cuối của phim bộ phận hiện LỆNH MỚI dạng code (như phim mùa 1). Lệnh dùng đúng tên trong game (grep hoc/so-lenh.js và san-hoc.js LENH, đừng bịa).
- Mỗi phim 3–4 khung, mỗi khung một câu ≤ 14 từ, khoá chữ 'pg.<mã gói>.<n>' trong hoc/game/chu.js. R1 sơn vàng mặc định / màu người chơi ở pixel; ở vector R1 #38BDF8, R2 #F472B6 (bộ vẽ tự lo theo son).
- choi.html nạp phim-goi.js rồi phim-mua-1.js trước ung-dung.js: thêm phim-mua-2.js ngay sau phim-mua-1.js. Gói mùa 2 hiện ẩn (`an: true`) nhưng chơi được bằng "Mở hết" (debug=1): xem bằng đường đó.

PHẠM VI: được tạo hoc/game/phim-mua-2.js; sửa hoc/kiem-phim-goi.mjs (mở rộng cho mùa 2: mọi gói mùa 2 có phim, 3–4 khung, khoá chữ, ≤ 14 từ, cờ đúng mã gói; lỗi giả); THÊM khoá pg.* vào hoc/game/chu.js; thêm thẻ script vào hoc/game/choi.html; ghi kịch bản mùa 2 thành mục mới "Kịch bản mùa 2" trong hoc/KE-HOACH-PHIM-GOI.md (chỉ tệp kế hoạch này); THÊM hình cần cho phim vào hoc/game/phim-vector.js (chỉ thêm hàm mới, không đổi hàm đang có) và vai màu mới vào hoc/game/bang-mau.js (khối "Phim mùa 2"); SUA_SAU_NEN trong kiem-bang-mau.mjs nếu cần (nối lý do vào khoá có sẵn). Phim cần hình robot / vật / ô: dùng bộ vẽ có sẵn (VeRobot, VeVector, PhimVector, VeIcon); thiếu hình (vd băng chuyền chạy, cửa nút bắn, bóng bắn tụ) thì vẽ thêm trong phim-vector.js.
KHÔNG sửa: phim-mua-1.js, mo-dau.js, phim-goi.js (trừ khi bộ máy THIẾU điều cần cho mùa 2: sửa tối thiểu, ghi rõ, kiem-phim-goi mùa 1 vẫn đạt), luật, màn, lộ trình, san-ve.js, ve-vector*.js, ve-robot.js (V7a đang sửa), huy-hieu*.js.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng). Kiểm lại từng khẳng định ở đây bằng code. Quyết định của USER (không tự đi ngược): mọi gói mọi mùa có phim; phim mở đầu và mùa 1 giữ nguyên; mọi thứ sang vector, pixel giữ y nguyên tới V7b; màu đội; chữ không emoji / không gạch dài; luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-phim-goi.mjs                 ← mùa 1 + mùa 2; `--loi-gia` đỏ
  node hoc/kiem-huy-hieu-phim-vector.mjs     ← 10 đạt (B5 pixel phim-mua-1 y nguyên)
  node hoc/kiem-nut-mo-dau-phim-vector.mjs   ← 11 đạt (thêm phim mùa 2 vào phần soát nếu máy kiểm liệt kê phim theo tệp)
  node hoc/kiem-bang-mau.mjs                 ← 19 đạt
  node hoc/kiem-ve-vector.mjs                ← 94 đạt
  Trình duyệt: `node -e "process.env.PORT='4202';import('./server.mjs')"` chạy nền, tắt ngay khi xem xong; `choi.html?ve=vector&debug=1`, Mở hết, vào từng gói mùa 2 (phim chiếu lần đầu), ▶ xem lại, Bỏ qua, chạm khung; không lỗi console; khổ máy tính và 360 × 640; so `?ve=pixel` (chạy không lỗi). Soát bằng script trong trang: 0 canvas điểm ảnh / icon .pxi / phông pixel trong phim ở vector (tự kiểm script bằng lỗi giả trước khi tin).

CÁCH GIAO: commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (ghi dần vào D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-phim-mua-2.md VÀ trong câu trả lời cuối) — đủ 5 mục: 1 KẾT QUẢ (SHA, tệp đổi, bảng 10 phim: gói · khung · lời, lệnh kiểm + kết quả nguyên văn, kết quả soát trình duyệt). 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT (phim mùa 3; chỗ phim mùa 2 phải đổi khi gói 10 xong). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
