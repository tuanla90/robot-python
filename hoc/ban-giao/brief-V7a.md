NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi việc một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi sửa dòng đầu tiên. Sửa việc nào xem việc đó (trình duyệt hoặc trang xem). Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (3 agent song song; CẤM npm test cả bộ; tệp dùng chung chỉ THÊM). Cổng server tạm của bạn: 4203.

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1 (san-ve.js đường vẽ chung), giá sai 1, mơ hồ 1, suy luận 1 = 6)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v7a-ve-vector-duoi, nhánh claude/ve-vector-duoi (từ 6348c9f: đã có V1–V6c, gói 8, gói 9).

MỤC TIÊU: xong khi ở `?ve=vector` không còn chỗ HÌNH nào rơi về pixel hay vẽ chưa đúng trong danh sách dưới đây, pixel y nguyên từng điểm ảnh, máy kiểm đạt. Đây là gói dọn đuôi HÌNH trước V7b (V7b sau gói này: đổi mặc định sang vector, gỡ bộ vẽ pixel, gỡ cầu tạm MutationObserver / noiVe / drawImage, gộp CSS và PHAM_VI: KHÔNG làm các việc đó ở đây).

BỐI CẢNH: hoc/KE-HOACH-GOP-DIEM10CODE.md các dòng trạng thái V4 → V6c (28/10) và mọi mục "→ V7". Đã quyết của người giao khi nghiệm thu V6b (giữ): vật nâng 68,4% ô, tâm vật ≈ 0,4 ô trước tâm thân.

VIỆC (mỗi việc một commit):
1. HUY HIỆU VECTOR: mọi mã huy hiệu có HINH pixel trong hoc/game/huy-hieu.js phải có bản vector trong hoc/game/huy-hieu-vector.js (`VeVector.HUY_HIEU.dangKy` hay cách tệp đang dùng). Người giao đo thô bằng regex (SÀN, chưa kiểm chéo, có thể sai vì mã sinh bằng vòng lặp): thiếu doi-mua-2, che-doi-mua-2, be-sung, che-be-sung; có thể cả me-cung, cam-bien-ben, doi-* / che-doi-* của các gói đội. Tự đo bằng code (gọi hàm của tệp, vd HuyHieu có bản vector hay không cho từng mã) rồi vẽ đủ; hình theo ý huy hiệu pixel (xích nhìn ngang + nòng súng + bóng tụ cho be-sung; hai xe đội + sóng nhiệt cho doi-mua-2; chế = thêm bánh răng). Huy hiệu tay-gap / tay-xoay / combo: thùng to lẹm viền (truyền k = 0 hay thu cỡ vật cho vừa đĩa). Máy kiểm: mọi mã HINH đều có vector (kiem-huy-hieu-phim-vector.mjs thêm mục; lỗi giả: bỏ một mã phải đỏ). Gói 10 mùa 2 đang viết song song sẽ thêm 2 mã mới: máy kiểm phải liệt kê từ HINH (không danh sách cứng) để V7b thấy thiếu.
2. NAM CHÂM DRONE: vật treo / dính dưới drone gắn nam châm chưa theo luật cỡ vật V6b (`VAT_SAN`, `VAT_NANG`, `nangK` trong ve-vector.js): làm theo cùng luật (vật nâng to dần, bóng lệch / mờ hơn, chuyển mượt). Xem màn drone + nam châm (tìm trong lộ trình, vd chương drone / doi-drone).
3. TAY XOAY MỞ DẦN: tay xoay bật khe lớn ngay khi cầm (V6b ghi): làm hoạt cảnh mở / khép dần như tay kẹp (theo pha hoạt cảnh có sẵn); càng kẹp mở rộng ôm vật to trông như "sừng" (người giao thấy ở V6b): chỉnh cho càng ôm sát hai cạnh vật, không chĩa ra ngoài.
4. DÂY NỐI NÚT ↔ CỬA (vector): mùa 1 gói 4 (nut-de.5, .6, .9, .10) và mùa 2 (cửa + nút bắn, `cfg.noi`) chưa vẽ cửa nào nối nút nào, người chơi khó đoán. Vẽ dây nối mờ chìm dưới sàn (đường gấp khúc theo ô, nét mảnh, màu trung tính), sáng lên theo màu nút khi nút bật / cửa mở; màn một nút một cửa không cần dây thì để mảnh hơn hoặc không vẽ (tự quyết, ghi lý do). Chỉ vector; pixel y nguyên. Lấy quan hệ nối từ lõi (san-hoc.js đọc cfg.noi / mặc định) qua dữ liệu san-ve.js đã có, không tự suy lại luật.
5. TRỜI MƯA `:has()`: luật CSS dùng `:has()` (V6c) làm Safari < 15.4 / Firefox < 121 thấy nền sáng: thêm đường lùi (lớp đặt bằng JS hay luật không cần :has), cùng hình ở trình duyệt mới.
6. MÁY KIỂM + TRANG XEM: thêm mục vào hoc/kiem-ve-vector.mjs (vd cỡ vật drone nâng > sàn; tay xoay khe đổi dần qua nhiều khung; dây nối có ở màn có noi) và hoc/kiem-huy-hieu-phim-vector.mjs (việc 1), mỗi mục có lỗi giả đỏ; thêm mục vào hoc/hinh-mau/xem-vector-v6.html.

PHẠM VI: được sửa hoc/game/huy-hieu-vector.js, ve-vector.js (vatKep / vatXoay / luật cỡ), ve-vector-tay-*.js, ve-vector-than-*.js (drone), ve-vector-hieu-ung.js, san-ve.js (CHỈ nhánh vector: vật treo drone, dây nối), choi-vector.css / giao-dien-vector-b.css (việc 5), mo-dau.js chỉ nếu luật :has nằm ở đó, bang-mau.js (chỉ THÊM vai, khối "V7a"), kiem-ve-vector.mjs, kiem-huy-hieu-phim-vector.mjs, kiem-bang-mau.mjs SUA_SAU_NEN (nối lý do vào khoá có sẵn), trang xem.
KHÔNG sửa: luật (san-hoc.js, cham.js), màn, lộ trình, huy-hieu.js (gói 10 đang thêm), so-lenh.js, phim-mua-*.js, phim-goi.js, phim-vector.js, chu.js (phim mùa 2 đang làm), ve.js / ve-vector-icon.js / cầu nối (V7b).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng). Kiểm lại từng khẳng định ở đây bằng code. Quyết định của USER (không tự đi ngược): mọi thứ sang vector, pixel giữ y nguyên tới V7b; vật nâng lên TO ra; màu đội R1 #38BDF8 / R2 #F472B6; chữ không emoji / không gạch dài.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-ve-vector.mjs               ← nền 94 đạt; mục 13a (pixel phát lại khớp nền a962f7b) PHẢI giữ đạt = pixel y nguyên; `--loi-gia` lỗi giả mới đỏ
  node hoc/kiem-huy-hieu-phim-vector.mjs    ← nền 10 đạt + mục mới; `--loi-gia`
  node hoc/kiem-nut-mo-dau-phim-vector.mjs  ← 11 đạt
  node hoc/kiem-giao-dien-vector-b.mjs      ← 16 đạt
  node hoc/kiem-phim-goi.mjs                ← 33 đạt
  node hoc/kiem-bang-mau.mjs                ← 19 đạt
  node hoc/kiem-nut-de.mjs                  ← 62 đạt (việc 4 không đổi luật)
  Trình duyệt: `node -e "process.env.PORT='4203';import('./server.mjs')"` chạy nền, tắt ngay khi xem xong; `choi.html?ve=vector&debug=1&man=<mã>`: nut-de.5, nut-de.9, một màn cửa + nút bắn mùa 2 (che-sung-hoi.*), một màn tay xoay (tay-xoay.3), một màn drone nam châm; trang chọn gói (huy hiệu); so `?ve=pixel`. Một tab của riêng bạn.

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (ghi dần vào D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-V7a.md VÀ trong câu trả lời cuối) — đủ 5 mục: 1 KẾT QUẢ (SHA, tệp đổi, lệnh kiểm + kết quả nguyên văn, bảng việc · trước · sau · tệp, danh sách mã huy hiệu đã vẽ). 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT cho V7b (còn chỗ nào phụ thuộc pixel, cầu tạm nào gỡ được). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
