NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi việc một commit; tối đa 40 phút một commit. Agent trước đứng gần 4 tiếng không commit rồi mất: CẤM khảo sát dài trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (RAM: CẤM npm test cả bộ; không trình duyệt). Rồi brief gốc cùng thư mục: brief-goi9.md (MỤC TIÊU, LUẬT HỌC, PHẠM VI, KIỂM TRA vẫn áp dụng nguyên).

LOẠI: Ship          MODEL: fable (giao lại sau một lần dừng; điểm gốc 6)

GÓI TIẾP NỐI. Chỗ làm: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\goi9-be-sung, nhánh claude/be-sung, HEAD 2fa95a2 (WIP người giao cất). Đọc `git log --stat d3af762..` trước.

ĐÃ CÓ: 19 màn (be-sung.1–10, che-be-sung.1–9), kiem-be-sung.mjs (bảng recall mùa 2), do-duong-be-sung.mjs. Người giao chạy `node hoc/kiem-be-sung.mjs` ở 2fa95a2: "ĐẠT 89 · HỎNG 13". Các mục HỎNG:
  - gói be-sung: chương che-be-sung chưa đủ 10 màn (thiếu trùm che-be-sung.10).
  - huy hiệu: huy-hieu.js thiếu HINH['be-sung'] (và 'che-be-sung').
  - che-be-sung.1, .2, .4–.9: "hàm của em cần đã tạo ở màn trước; mọi lời gọi khai trong hamCuaEmCan; hàm mới không trùng tên cốt truyện, có mục Sổ lệnh" → thiếu mục Sổ lệnh (hoc/so-lenh.js) cho blast_left, blast_right, lock_on, lock_left, lock_row(n), go_fire, visit, push_blast… và / hoặc hamCuaEmCan.
  - che-be-sung.7, .8, .9: "lời giải 3 sao đúng ngưỡng; mã mẫu chưa thắng; lời giải khác 2 sao; công thức khác thắng; lời sai thua đúng mã" → xem chi tiết trong output, sửa màn (ngưỡng sao / lời giải / lời sai).

VIỆC (theo thứ tự, mỗi việc một commit):
  1. Mục Sổ lệnh cho mọi hàm của em mới của che-be-sung (thêm một khối `ds.push(...)` hoặc `m(...)` như nhóm Hồng ngoại / Súng hơi), một dòng 'che-be-sung' → nhóm trong hoc/kiem-che-xe.mjs, hamCuaEmCan đúng.
  2. Sửa che-be-sung.7, .8, .9 cho đạt.
  3. Trùm che-be-sung.10 (2–3 sân, dùng nhiều hàm của em chương 2, recall gói trước), huy hiệu `che-be-sung` chỉ trùm mang.
  4. Huy hiệu HINH['be-sung'], HINH['che-be-sung'] trong hoc/game/huy-hieu.js (kiểu pixel như `do-nhiet`; chỉ THÊM dòng). Nếu kiem-bang-mau.mjs đỏ vì huy-hieu.js: ở nhánh bạn chưa có dòng SUA_SAU_NEN cho huy-hieu.js → thêm một dòng (người giao gộp tay với dòng đã có ở nhánh chính).
  5. Chạy đủ kiểm tra của brief gốc, ghi báo cáo.

BỐI CẢNH MỚI: nhánh chính (claude/tay-gap-xoay-comparison-00c53c) đã gộp gói 8 Đội (man-doi-mua-2.js; so-lenh.js và kiem-che-xe.mjs có dòng của gói 8 ở đúng chỗ bạn sắp thêm) và các gói vẽ vector. KHÔNG rebase / merge: người giao gộp tay các dòng trùng chỗ. Huy hiệu gói 9 ở chế độ vector sẽ tự rơi về pixel (đúng thiết kế, bản vector làm sau).

PHẢN BIỆN: như brief gốc. Kiểm lại từng khẳng định ở đây bằng code (vd danh sách hàm thiếu Sổ lệnh lấy từ output máy kiểm, đừng tin danh sách trên).

KIỂM TRA (tại worktree, từng lệnh một; CẤM npm test không lọc):
  node hoc/kiem-be-sung.mjs              ← phải ĐẠT hết, 20 màn; `--loi-gia` đỏ
  node hoc/do-duong-be-sung.mjs
  node hoc/kiem-lo-trinh.mjs
  node hoc/kiem-che-xe.mjs
  node hoc/kiem-loi-mua-2.mjs
  node hoc/kiem-bang-mau.mjs

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Không chạy server.

BÁO CÁO CUỐI: ghi dần vào D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-goi9.md (ghi đè bản cũ của agent trước) VÀ trong câu trả lời cuối, đủ 5 mục như brief gốc (bảng 20 màn: mã · tên · điều mới · gói được nhắc · số dòng lời giải · số nhịp; bảng recall; lệnh kiểm + output nguyên văn).
