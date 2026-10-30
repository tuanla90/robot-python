# Brief SM1-B: sửa mùa 1 gói 1 (trùm chương Lăn bánh), gói 2 (vòng lặp lồng, tay kẹp ở chương vòng lặp), gói 3 (`not`)

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (lo-trinh-hoc.js khối MUA_1), giá sai 1, mơ hồ 1, suy luận 1 = 5)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút. Tối đa 40 phút phải có commit. Mỗi việc dưới đây xong là một commit, máy kiểm liên quan xanh.
- Làm theo thứ tự Việc 1 → 2 → 3 → 4. Hết sức thì dừng và báo còn gì. CẤM dựng kiểm kê toàn bộ trước khi sửa dòng đầu tiên.
- Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: trùm chương hai-banh khó hơn màn 9; chương vong-lap có màn trình diễn vòng for lồng và trùm (hay màn luyện) có tay kẹp; `not` có một bước cho thấy trước ở che-cam-bien.2; mọi máy kiểm liên quan xanh, lời giải chuẩn mọi màn 3 sao.

## BỐI CẢNH
- Nghiệm thu độc lập mùa 1: `hoc/ban-giao/nghiem-thu-30-10/nghiem-thu-mua-1.md`, Đề xuất 4, 6, 8. Lời user (nguyên văn, 30/10): "bạn sửa mùa 1".
- Gói A (gói 4, 5) đã làm xong trước gói này, xem `hoc/ban-giao/bao-cao-SM1A.md` để biết cách repo thêm màn (tệp ngân hàng "-them", máy kiểm riêng, `sua()` trong lo-trinh-hoc.js, `phienBanNoiDung`, `do-lo-trinh.mjs --ghi-sao`) và các bẫy công cụ agent trước gặp.
- Lộ trình mùa 1: `hoc/lo-trinh-hoc.js` mảng `MUA_1`. Số liệu người giao đo (lộ trình xuất bản):
  - hai-banh 1.1 đến 1.10: nhịp 1, 3, 3, 3, 3, 3, 3, 2, 3, 3; ô 3, 9, 8, 8, 8, 8, 7, 6, 8, 8. Trùm hai-banh.10 "Xếp lại cho đúng" = độ khó của 1.5. 1.5 "Chữ L" và 1.6 "Chữ L ngược" trùng ý. RÀNG BUỘC: chương 1 chỉ có left_move / right_move / wait, khung chính 10 ô, chưa có hàm (`moXuong: false`, `camHamCuaEm`); một ô đi thẳng tốn 3 dòng, rẽ tại chỗ 2 dòng. Đề xuất "chữ U 5 nhịp" của người nghiệm thu có thể không vừa 10 ô: tự đo, tìm bài trùm khó hơn màn 9 mà vừa khung (vd nhiều rẽ hơn, hay xếp lại dòng của bài dài hơn), nói lý do.
  - kiem-hoc.mjs có ca riêng cho 1.9 / 1.10 của NGÂN HÀNG (dòng ~1044 đến 1073) và kiem-huong-dan.mjs đòi hướng dẫn cho hai-banh.10: đừng sửa ngân hàng, đổi qua lộ trình (`sua()`) hay màn mới; nếu đổi trùm thì hướng dẫn màn và huy hiệu đi theo.
  - vong-lap (chương 2 gói 2) 4.1 đến 4.10: nhịp 6, 6, 12, 8, 19, 11, 14, 21, 21, 46; chỉ 4.9 (che-lap.5) có tay. 4.8 vong-lap.9 "Vòng lặp lồng nhau" là lần đầu for lồng, mã mẫu rỗng, cùng lúc thêm pick / drop. Trùm vong-lap.10 46 nhịp, chế ba hàm một lúc (row, bend_left, bend_right).
  - che-cam-bien.2 (6.2) "Tìm lối mở": chế face_open() thân `while not front_clear(): turn_right()`, lần đầu có `not` cùng lúc chế hàm có while.

## VIỆC
1. Trùm hai-banh (Đề xuất 6): trùm khó hơn màn 9 (nhịp và ô), vừa khung; thay một trong hai màn chữ L trùng ý bằng màn quay đầu + đi.
2. Vòng for lồng (Đề xuất 4): thêm màn trình diễn for lồng (`chiChay: true, chinhCoDinh: true`, bấm Chạy là thấy) ngay trước 4.8, hay cho 4.8 mã mẫu nửa bài; tách việc thêm pick / drop ra khỏi màn for lồng đầu tiên. Giữ chương 10 màn (cất một màn trùng ý nếu thêm màn, nói lý do).
3. Tay kẹp trong chương vòng lặp (Đề xuất 8 phần 1): trùm vong-lap.10 hoặc một màn luyện (4.4 đến 4.6) có tay (vd lặp carry, mang thùng qua đường ngoằn ngoèo). Trùm không chế quá hai hàm mới một lúc; không gấp quá 2 lần màn 9.
4. `not` (Đề xuất 8 phần 2): che-cam-bien.2 có một bước thấy trước (vd mã mẫu `while front_clear():` sai rồi sửa thành `while not`), hoặc tách thành hai màn; một màn một điều mới.

## LUẬT THIẾT KẾ MÀN, PHẠM VI, CÁCH GIAO, PHẢN BIỆN, KIỂM TRA, DỪNG VÀ HỎI
Y như brief gói A (`hoc/ban-giao/brief-SM1A-kho-hang-banh-lui.md`), với các khác biệt:
- Worktree / nhánh: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\sua-mua-1-b`, nhánh `claude/sua-mua-1-b`. Commit cuối message dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Được sửa: khối MÙA 1 của lo-trinh-hoc.js phần gói 1, 2, 3 (KHÔNG đụng phần gói 4, 5 gói A vừa sửa), `hoc/lo-trinh-sao.js`, tệp ngân hàng mới (gợi ý `hoc/man-goi-1-2-them.js`), `hoc/game/huong-dan-man.js`, `hoc/game/huy-hieu*.js` nếu huy hiệu trùm chuyển, máy kiểm mùa 1 (`hoc/kiem-*.mjs`) và máy kiểm mới của gói.
- Máy kiểm thêm cho gói này: `node hoc/kiem-hoc.mjs`, `node hoc/kiem-huong-dan.mjs`, `node hoc/kiem-che-lap.mjs`, `node hoc/kiem-che-cam-bien.mjs`, `node hoc/kiem-cam-bien-them.mjs`, `node hoc/kiem-lach-mua-1.mjs`, `node hoc/kiem-lo-trinh.mjs`, `node hoc/kiem-loi-giai.mjs`, `node tools/do-lo-trinh.mjs`, và máy kiểm nhắc tới màn bạn đổi (`grep -l "hai-banh\|vong-lap\|che-lap\|che-cam-bien" hoc/kiem-*.mjs`).
- Kiểm thêm: mọi hàm của màn bạn tạo không trùng tên hàm cốt truyện (`ManHoc.hamCotTruyen()`, nạp `require('./hoc/lo-trinh-hoc.js')`); hàm cốt truyện mới không trùng hàm có sẵn.
- Server xem bằng mắt: cổng 4206.

## BÁO CÁO CUỐI
Ghi `hoc/ban-giao/bao-cao-SM1B.md` (5 mục như brief gói A), commit; tóm tắt trong câu trả lời cuối.
