# Brief SM1-C: sửa mùa 1 gói 6 (Tay xoay) và gói 7 (Cảm biến bên, chương Mê cung)

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (lo-trinh-hoc.js khối MUA_1), giá sai 1, mơ hồ 1, suy luận 1 = 5)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút. Tối đa 40 phút phải có commit. Mỗi việc dưới đây xong là một commit, máy kiểm liên quan xanh.
- Làm theo thứ tự Việc 1 → 2 → 3. Hết sức thì dừng và báo còn gì. CẤM dựng kiểm kê toàn bộ trước khi sửa dòng đầu tiên.
- Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: chương me-cung không dạy lại cái đã học ở đầu, không lặp một lời giải ở cuối, trùm có yếu tố mới; gói 6 không còn bước nhảy 11.6 và trùm 12.10 không gấp quá 2 lần màn 9; gói 6 có 2 đến 3 màn dùng lại for / while; mọi máy kiểm liên quan xanh, lời giải chuẩn mọi màn 3 sao.

## BỐI CẢNH
- Nghiệm thu độc lập mùa 1: `hoc/ban-giao/nghiem-thu-30-10/nghiem-thu-mua-1.md`, Đề xuất 5 và 7. Lời user (nguyên văn, 30/10): "bạn sửa mùa 1".
- Gói A (gói 4, 5) và gói B (gói 1, 2, 3) đã làm trước gói này: xem `hoc/ban-giao/bao-cao-SM1A.md`, `hoc/ban-giao/bao-cao-SM1B.md` để biết cách thêm màn, các bẫy công cụ, ca kiểm "hàm của màn không trùng tên hàm cốt truyện".
- Số liệu người giao đo (lộ trình xuất bản):
  - tay-xoay 11.1 đến 11.10: nhịp 3, 3, 3, 4, 3, 15, 3, 5, 3, 20; ô 10, 10, 9, 13, 9, 25, 10, 18, 10, 28. 11.6 "Dọn lối" (chế clear_left) nhảy 3 → 15 rồi tụt về 3.
  - che-tay-xoay 12.1 đến 12.10: nhịp 2, 4, 9, 4, 12, 20, 4, 4, 8, 34; ô 8, 14, 26, 16, 45, 30, 14, 16, 22, 58. 12.5 ô 16 → 45; trùm 12.10 34 nhịp 58 ô (gấp 4 lần màn 9).
  - Cả gói 6 không màn nào dùng for / if / while (khái niệm của gói 2, 3 không được nhắc).
  - cam-bien-ben (chương 1 gói 7) 13.1 đến 13.10 đã dạy left_clear, right_clear (to_gap), else, while not, elif (13.9).
  - me-cung 14.1 đến 14.10: nhịp 2, 3, 1, 2, 2, 5, 5, 17, 21, 70 (trùm cộng ba sân, `nhipTheo: 'tong'`; gói A đã đổi hai trùm tương tự sang `'max'`). 14.1 đến 14.5 dạy lại right_clear / elif (đã học ở chương 1). 14.7, 14.8, 14.10 cùng lời giải `for i in range(N): follow_right()`; trùm 14.10 = chương trình 14.8 chạy ba sân. Hàm cốt truyện follow_right (14.6) được mùa sau dùng: giữ.

## VIỆC
1. Chương me-cung (Đề xuất 5): gộp / bỏ các màn đầu dạy lại (14.1 đến 14.3), thay 14.7 hay 14.8 bằng bám tường trái (follow_left) hoặc bám tường mang thùng; trùm 14.10 phải thêm yếu tố mới (vd mang thùng qua mê cung, hay dừng ở ô đích bằng cảm biến), nhịp theo sân dài nhất. Đầu chương đừng tụt quá sâu so với trùm chương 1 (13.10, 15 nhịp).
2. Tay xoay (Đề xuất 7): làm mượt 11.6 (thêm màn đệm 6 đến 8 nhịp trước, hay chuyển 11.6 xuống hàng biến thể); 12.5 bớt bước nhảy ô; trùm 12.10 bớt (ô 58 → khoảng 35, không gấp quá 2 lần màn 9).
3. Recall trong gói 6 (Đề xuất 7): 2 đến 3 màn dùng lại for / while (vd sort_two trong for, go_wall tới vật).
Giữ 10 màn / chương: thêm màn thì cất màn trùng ý (giữ ở ngân hàng), nói lý do. Giữ mọi hàm cốt truyện màn sau cần (kiểm hamCuaEmCan, `node hoc/kiem-loi-giai.mjs`).

## LUẬT THIẾT KẾ MÀN, PHẠM VI, CÁCH GIAO, PHẢN BIỆN, KIỂM TRA, DỪNG VÀ HỎI
Y như brief gói A (`hoc/ban-giao/brief-SM1A-kho-hang-banh-lui.md`), với các khác biệt:
- Worktree / nhánh: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\sua-mua-1-c`, nhánh `claude/sua-mua-1-c`. Commit cuối message dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Được sửa: khối MÙA 1 của lo-trinh-hoc.js phần gói 6, 7 (KHÔNG đụng phần gói 1 đến 5 gói A, B vừa sửa), `hoc/lo-trinh-sao.js`, tệp ngân hàng mới (gợi ý `hoc/man-goi-6-7-them.js`), `hoc/game/huong-dan-man.js`, `hoc/game/huy-hieu*.js` nếu huy hiệu trùm chuyển, máy kiểm mùa 1 và máy kiểm mới của gói.
- Ràng buộc mùa 1 thêm: gói 6 chưa có left_clear / right_clear (khay tự bớt); không biến, không hàm có tham số.
- Máy kiểm thêm: `node hoc/kiem-tay-xoay.mjs`, `node hoc/kiem-che-tay-xoay.mjs`, `node hoc/kiem-hoc.mjs`, `node hoc/kiem-huong-dan.mjs`, `node hoc/kiem-lach-mua-1.mjs`, `node hoc/kiem-lo-trinh.mjs`, `node hoc/kiem-loi-giai.mjs`, `node tools/do-lo-trinh.mjs`, `node hoc/kiem-trum-mua-1.mjs`, `node hoc/kiem-combo-mua-1.mjs`, và máy kiểm nhắc tới màn bạn đổi (`grep -l "tay-xoay\|me-cung\|cam-bien-ben\|follow_right" hoc/kiem-*.mjs`).
- Kiểm thêm: mọi hàm của màn bạn tạo không trùng tên hàm cốt truyện (`ManHoc.hamCotTruyen()`, nạp `require('./hoc/lo-trinh-hoc.js')`); hàm cốt truyện mới không trùng hàm có sẵn.
- Server xem bằng mắt: cổng 4207.

## BÁO CÁO CUỐI
Ghi `hoc/ban-giao/bao-cao-SM1C.md` (5 mục như brief gói A), commit; tóm tắt trong câu trả lời cuối.
