NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút một commit; mỗi vùng giao diện một commit. CẤM làm hết rồi mới xem: sửa vùng nào xem trình duyệt vùng đó. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ. npm test (~10 phút) chỉ chạy MỘT lần ở cuối, chạy nền, ghi ra tệp. Hết sức thì dừng và báo còn gì: thà 3 vùng làm đúng có commit còn hơn 6 vùng không commit nào. (Lần trước agent dừng giữa chừng vì máy ngủ: commit sớm.)

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 2, suy luận 1 = 7; user chốt 28/10 gói vẽ giao agent Claude opus)

ĐÂY LÀ GÓI TIẾP NỐI. Brief gốc: hoc/ban-giao/brief-V5a.md trong worktree chính
D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\tay-gap-xoay-comparison-00c53c — ĐỌC TRƯỚC, mọi mục MỤC TIÊU / BỐI CẢNH / VÙNG / PHẠM VI / KIỂM TRA / BÁO CÁO ở đó vẫn áp dụng nguyên.

CHỖ LÀM: làm thẳng trong worktree CŨ D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\agent-a2b177d2cde83df28,
nhánh claude/ve-vector-giao-dien-a (HEAD 91b81ae, sạch). Mọi lệnh git / node chạy ở thư mục đó (dùng đường dẫn tuyệt đối hoặc `git -C`). Không tạo worktree mới, không đụng worktree khác.

ĐÃ CÓ (đọc `git log --stat 0e1f4a8..` và toàn bộ hoc/game/choi-vector.css trước khi sửa):
- 32daa0b vùng 1 nền tảng (phông Google Sans Flex / Code ở hoc/game/font/, choi-vector.css áp khi body.ve-vector, vai vec* trong bang-mau.js)
- 7a8c0cc vùng 6 + 2 (nút phẳng, thanh trên, cột nút sân, bảng nhịp, khung sân, toast)
- 0f3298d vùng 3 khung code
- 91b81ae WIP vùng 2 làm thêm dở (thanh trên, đồng hồ, khung sân, toast) — agent cũ dừng đột ngột, CHƯA ai xem lại.

CÒN LÀM (theo thứ tự, mỗi mục một commit):
  a. Soát vùng 2 (phần WIP): xem trình duyệt máy tính + 360 × 640, sửa chỗ dở / vỡ, commit "V5a vùng 2 (soát)".
  b. Vùng 4 khối lệnh .brick thành thẻ phẳng.
  c. Vùng 5 khay / hộp / gợi ý / hộp kết quả / menu.
  d. Vùng 7 bỏ steps() ở vector + prefers-reduced-motion.
  e. Vùng 8 phông chữ canvas (bong bóng, pin, thẻ đạn).
  f. Vùng 9 robot ngoài sân ×1,2 ở vector.
  g. Vùng 10 công tắc Cài đặt "Kiểu vẽ".
  h. Vùng 11 cỡ ô sân + khổ 360 × 640.
  i. Máy kiểm (hoc/kiem-ve-vector.mjs mục V5a + lỗi giả) + trang xem hoc/hinh-mau/xem-vector.html mục V5a.
  j. npm test MỘT lần (nền, ghi tệp) → báo cáo 5 mục như brief gốc.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại brief (thứ tự vùng, vùng thừa, cách đơn giản hơn, lỗ bị bỏ sót). Bất đồng CHẶN đường → dừng, commit WIP, báo ngay. Không chặn → làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): chuyển hẳn sang vector, pixel giữ y nguyên tới hết V6, màu đội R1 #38BDF8 / R2 #F472B6, không emoji / không gạch dài trong chữ hiển thị. Kiểm lại từng khẳng định trong brief bằng code, đừng tin.

TRƯỚC KHI SỬA JS: GitNexus impact (repo = D:\Users\tuanla2\game\doi-robot-chan-hung) cho symbol sắp sửa (ve-robot.js hằng cỡ, cai-dat.js, ve-vector-hieu-ung.js); risk HIGH/CRITICAL → dừng, báo.

KIỂM TRA (đã chạy được ở repo này, chạy tại worktree agent):
  node hoc/kiem-ve-vector.mjs          ← sau mỗi nhóm commit; nền 85 đạt; mục 13a cần git + commit a962f7b
  node hoc/kiem-bang-mau.mjs           ← pixel y nguyên; nền 19 đạt
  npm test > <scratchpad của bạn>/npm-test-v5a.txt 2>&1   ← MỘT lần cuối, chạy nền; nền 81/81; máy 16 GB: không chạy hai lần cùng lúc
  Trình duyệt: server tạm `node -e "process.env.PORT='4199';import('./server.mjs')"` chạy nền ở worktree agent (cổng 4181 là của phiên giao việc, đừng dùng / đừng tắt).
  `http://localhost:4199/hoc/game/choi.html?ve=vector&debug=1&man=<mã>`; xem vong-lap.3, omni.3, hai-robot.2, hộp kết quả sau khi thắng, hộp Bộ phận mới, Cài đặt; so `?ve=pixel` cùng màn: pixel không đổi.
  Khổ: máy tính VÀ resize_window 360 × 640, trả về preset desktop khi xong. Ô Trình duyệt dùng chung: chỉ dùng tab của mình (tabs_create), không reload / sửa tab khác.
  Shell là Git Bash trên Windows; `cat > file` không có stdin sẽ treo — ghi tệp bằng công cụ Write.

CÁCH GIAO: commit từng vùng, message tiếng Việt, cuối message dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng nhánh khác. Tắt mọi server tạm (4199) trước khi kết thúc.

LUẬT UI (rút từ đợt rà trước): nút chỉ có icon phải có cả title và aria-label, nhãn nói nút LÀM GÌ; nút bật / tắt nhãn đổi theo trạng thái; vùng chạm tối thiểu 24 × 24 px; hiệu ứng rê chuột đặt trong @media (hover:hover); không dùng emoji làm hình; tương phản chữ WCAG AA — đo bằng script trong trang, không chấm bằng mắt, và tự kiểm script bằng một lỗi giả trước khi tin.

DỪNG VÀ HỎI KHI: phải sửa luật chơi (san-hoc.js, cham.js), màn, lộ trình, màn ngoài màn chơi (V5b), hoặc phải đổi choi.css cũ ngoài thêm bộ chọn; phạm vi phình.

BÁO CÁO CUỐI: đủ 5 mục như brief gốc (KẾT QUẢ kèm bảng vùng · trước · sau · tệp, màn đã xem, cỡ ô nhỏ nhất thực tế; CÂU HỎI CẦN LÀM RÕ kèm chỗ brief sai; ĐỀ XUẤT cho V5b / V6; PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE; RỦI RO CÒN LẠI).
