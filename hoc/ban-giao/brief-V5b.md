NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút một commit; mỗi màn / vùng một commit. Sửa vùng nào xem trình duyệt vùng đó, không dồn về cuối. Hết sức thì dừng và báo còn gì: thà 4 màn làm đúng có commit còn hơn 8 màn không commit nào. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (4 agent chạy song song; CẤM npm test; cổng của bạn 4201; tệp dùng chung).

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 1, suy luận 1 = 6)

MỤC TIÊU: xong khi ở `?ve=vector` mọi màn NGOÀI màn chơi có giao diện phẳng diem10code cùng tông "lab trắng" với màn chơi V5a (không vân gỗ, bảng phấn, viền vát, phông pixel, `steps()`), icon `.pxi` ở các màn này thành hình vector, robot ở màn đầu có mắt biểu cảm; dùng được ở máy tính lẫn 360 × 640; chế độ pixel y nguyên.

BỐI CẢNH:
- V5a (màn chơi) đã làm xong ở nhánh claude/ve-vector-giao-dien-a (người giao đang nghiệm thu). Nhánh của bạn tạo từ đầu nhánh đó (fa3702f), nên đã có: phông Google Sans Flex / Code (hoc/game/font/), hoc/game/choi-vector.css áp khi `body.ve-vector` (VeVector.apGiaoDien), vai `vec*` trong bang-mau.js, công tắc Cài đặt "Kiểu vẽ". ĐỌC `git log --stat 0e1f4a8..fa3702f` và choi-vector.css trước: đó là ngôn ngữ thiết kế bạn phải nối tiếp (biến, bán kính, bóng, nút, thẻ). Brief V5a: D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\tay-gap-xoay-comparison-00c53c\hoc\ban-giao\brief-V5a.md (bối cảnh diem10code: D:\Users\tuanla2\tin_hoc\public\css\tokens.css, styles.css).
- Kế hoạch: hoc/KE-HOACH-GOP-DIEM10CODE.md dòng "V5b · các màn khác": màn đầu `.d-*`, bản đồ gói / màn `.g-*` `.go-*`, xưởng lắp ráp `.lr-*`, sổ lệnh `.so-*`, hộp mở khóa / part `.hop-*`, màn xong `.th-*`, giới thiệu part `.gt-*`, khung thẻ phim `.pg-*` (KHUNG, không đổi nội dung phim); icon `.pxi` sang vector; robot màn đầu có mắt biểu cảm (V4 đã có mắt biểu cảm ở `ve-vector-hieu-ung.js` / VeRobot, dùng lại).
- Tệp JS liên quan: man-dau.js, mo-dau.js, man-goi.js, man-chon.js, man-lap.js, man-so-lenh.js, bang-mo-khoa.js, gioi-thieu.js, the-part.js, mo-goi.js, ve.js (icon pxi), ung-dung.js. CSS gốc: choi.css (pixel, giữ nguyên).

VÙNG (mỗi vùng một commit, thứ tự gợi ý): 1 màn đầu + robot mắt biểu cảm · 2 bản đồ gói / màn · 3 Lắp robot · 4 Sổ lệnh · 5 hộp mở khóa / part, giới thiệu part · 6 màn xong · 7 khung thẻ phim `.pg-*` · 8 icon `.pxi` sang vector (SVG / canvas vector, màu theo vai) · 9 máy kiểm + trang xem.

PHẠM VI: được tạo hoc/game/giao-dien-vector-b.css (CSS mới của gói, áp khi body.ve-vector; hoặc nối vào choi-vector.css nếu bạn thấy hợp hơn, nói rõ), sửa choi.html (link), các tệp JS màn ở trên CHỈ để thêm lớp / thuộc tính / nhánh vẽ vector (không đổi hành vi, không đổi chữ trừ khi chữ có emoji / gạch dài), bang-mau.js (chỉ THÊM vai, khối riêng "V5b"), tạo hoc/kiem-giao-dien-vector-b.mjs (máy kiểm mới của gói), thêm mục V5b vào hoc/hinh-mau/xem-vector.html.
KHÔNG sửa: luật (san-hoc.js, cham.js), màn, lộ trình, màn chơi của V5a (choi-vector.css chỉ được thêm, không sửa quy tắc có sẵn trừ lỗi, nói rõ), choi.css cũ, **phim-goi.js / phim-mua-1.js / huy-hieu.js (gói V6 đang làm song song)**: icon pxi trong phim là việc của V6; nếu khung `.pg-*` cần JS phim thì ghi lại, không sửa. KHÔNG sửa hoc/kiem-ve-vector.mjs (tránh xung đột): kiểm mới đặt trong tệp mới của bạn.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (thứ tự, vùng thừa, cách đơn giản hơn, lỗ bỏ sót). Bất đồng chặn đường → dừng, commit WIP, ghi rõ. Quyết định của USER (không tự đi ngược): chuyển hẳn sang vector, pixel giữ y nguyên tới hết V6, màu đội R1 #38BDF8 / R2 #F472B6, chữ không emoji / không dấu gạch dài.

TRƯỚC KHI SỬA JS: GitNexus impact (repo = D:\Users\tuanla2\game\doi-robot-chan-hung) cho symbol sắp sửa; risk HIGH/CRITICAL → dừng, báo.

KIỂM TRA (chạy tại worktree của bạn, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-giao-dien-vector-b.mjs   ← máy kiểm mới: ở vector các màn trên không còn phông Handjet / VT323, `steps(`, `pixelated`, vân gỗ áp vào phần tử; icon pxi có bản vector; có `--loi-gia` cắm lỗi giả phải đỏ (tự chứng minh máy kiểm bắt được lỗi)
  node hoc/kiem-ve-vector.mjs            ← nền 85+ (V5a thêm mục 14) phải giữ đạt
  node hoc/kiem-bang-mau.mjs             ← pixel y nguyên
  Trình duyệt: `node -e "process.env.PORT='4201';import('./server.mjs')"` chạy nền; `http://localhost:4201/hoc/game/choi.html?ve=vector` rồi đi qua màn đầu → bản đồ gói → chọn màn → Lắp robot → Sổ lệnh → hộp Bộ phận mới / mở khóa → màn xong (`&debug=1&man=<mã>` vào thẳng màn). Khổ máy tính VÀ resize_window 360 × 640 (trả preset desktop khi xong). So `?ve=pixel`: không đổi. Tương phản chữ WCAG AA đo bằng script trong trang (tự kiểm script bằng lỗi giả trước).
LUẬT UI: nút chỉ có icon có cả title và aria-label, nhãn nói nút LÀM GÌ; vùng chạm ≥ 24 × 24 px; rê chuột trong @media (hover:hover); không emoji làm hình; tôn trọng prefers-reduced-motion.

BÁO CÁO CUỐI — đủ 5 mục: 1 KẾT QUẢ (nhánh + SHA từng commit, tệp đổi, lệnh kiểm + kết quả nguyên văn, bảng màn · trước (pixel) · sau (vector) · tệp, màn đã xem). 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT cho V7 (đổi mặc định, gỡ pixel). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
