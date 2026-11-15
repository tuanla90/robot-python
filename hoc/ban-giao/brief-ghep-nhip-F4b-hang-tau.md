NHỊP LÀM VIỆC (đọc trước tiên): commit đầu tiên trong ~20 phút (lõi hàng tàu + ca kiểm lõi), tối đa 40 phút phải có commit mới; hình một commit; mỗi nhóm màn một commit. Máy kiểm chạy TIỀN CẢNH với `timeout 300 node …`, KHÔNG chạy nền rồi ngồi chờ. CẤM kiểm kê toàn bộ trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì — thà lõi + hình + 5 màn có commit còn hơn 10 màn không commit nào. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

LOẠI: Ship   MODEL: fable (điểm: quy mô 2 (lõi + hình + 10 màn + gói 10), choke 2 (san-hoc tàu / mục tiêu giao-tau, cham.js, san-ve), giá sai 1, mơ hồ 1, suy luận 2 = 8)

MỤC TIÊU: xong khi lõi có HÀNG TÀU NỐI ĐUÔI một bến (kế hoạch 3d): chỉ tàu đầu hàng ở boong, mỗi tàu cần đúng MỘT số container, giao đúng thì cuối nhịp tàu rời và tàu kế vào, giao sai thì thua `giao-nham`, `read_code()` chĩa vào boong đọc số tàu đầu hàng cần; hình thấy được hàng tàu chờ; chương 2 gói 4 (`che-ben-tau`) LÀM LẠI thành chương dạy hàng đợi (10 màn); gói 10 có ≥ 1 màn ghép ngăn xếp + hàng đợi; mọi máy kiểm xanh.

BỐI CẢNH:
- Kế hoạch: hoc/KE-HOACH-GHEP-NHIP.md mục 3d (ĐỌC KỸ) và 3b, 3c (để phân biệt). Tóm tắt luật (user chốt 13/11):
  - Tàu tới cảng xếp hàng chờ; tàu đầu hàng cập, nhận hàng, rời; tàu sau mới vào: HÀNG ĐỢI, "vào trước ra trước". Chữ "hàng đợi" CHỈ dùng cho hàng tàu (không cho móc đôi, không cho chồng — chồng là "ngăn xếp").
  - Một bến có nhiều tàu nối đuôi; chỉ tàu đầu hàng ở ô boong `T`; mỗi tàu cần đúng MỘT số container (bảng ở mũi tàu). Đặt đúng lên tàu đầu hàng thì cuối nhịp tàu rời, tàu kế vào bến. Đặt sai: thua (`giao-nham`). Trẻ KHÔNG chọn tàu.
  - `read_code()` chĩa vào boong đọc số tàu đầu hàng đang cần (để một chương trình đúng nhiều sân). Hiện read_code đọc container trên cùng ở đầu cần, trả −1 nếu trống (hoc/san-hoc.js :487–488) — phải định rõ: boong có tàu đầu hàng mà chưa có container thì trả số tàu cần; hết tàu thì −1. Tự thiết kế chỗ còn mơ hồ, ghi vào báo cáo.
  - Bài ghép ngăn xếp + hàng đợi (gói 10): chồng A [5, 2, 8] (dưới → trên), chồng tạm B trống, hàng tàu cần 2 → 8 → 5: cất 8 sang B, giao 2, lấy 8 ở B giao, giao 5.
  - Python mùa 4 chưa có `list` (mùa 4: số âm, `abs`, `%`, `//`, vòng for / while, if). KHÔNG dạy list ở đây; lời dạy có thể nhắc "sau này em sẽ gặp lại hàng đợi trong Python".
- Lõi tàu có sẵn (hoc/san-hoc.js): tài liệu :463 (cfg.tau [{ o, co, vang, pha }], tàu có mặt theo chu kỳ), :497–498 (mục tiêu 'giao-tau', cfg.giao, 'giao-nham'), dựng tàu :1972–1995, cuối nhịp tàu cập / rời :3839–3860, thắng :4119. Gợi ý thiết kế (phản biện được): một khai báo mới, ví dụ `cfg.hangTau = { o: [{x,y}], can: [số, số, …] }` (ô boong của bến + dãy số các tàu cần theo thứ tự), KHÔNG đổi nghĩa `cfg.tau` / `cfg.giao` cũ (140 màn gói 4–10 đang dùng). Mục tiêu thắng: hết hàng tàu (mọi tàu đã nhận đúng và rời). Sự kiện mới cho hình, ví dụ 'tau-vao' / 'tau-roi-hang'.
- Cờ `canGatDoi` (F2) bật gói 5–10, KHÔNG bật gói 4: màn gói 4 mỗi lệnh một nhịp. Màn gói 10 viết theo luật ghép nhịp. Luật chồng theo luật (F3, `bongMo.chongLuat`) có sẵn nếu cần.
- Chương 2 gói 4 hiện tại: hoc/man-ben-tau.js `che-ben-tau.1..10` "Chế lệnh: giao đúng tàu", tạo các hàm `wait_ticks`, `ship_pair`, `ship_all_pair`, `move_tower2` (:79–100, :577, :648, :680, :749). `move_tower2` ĐƯỢC GỌI LẠI ở hoc/man-can-tai.js, man-doi-cang.js, man-trum-mua-cang.js → PHẢI giữ màn tạo `move_tower2` (hay một màn tạo hàm cùng tên, cùng nghĩa, cùng chữ ký) trong chương mới, hoặc DỪNG hỏi. Kiểm lại ba hàm kia có ai gọi không (grep cả hoc/man-chuoi-1.js, hoc/game/luu.js). Mặc định LÀM LẠI chương 2 (user chốt 13/11: "mặc định chương 2").
- Hình: hoc/game/san-ve.js (phần tàu / cảng) và hoc/game/ve-vector-vat-cang.js (vẽ tàu, bảng mũi tàu). Hàng tàu chờ phải THẤY được (ví dụ các tàu xếp hàng ngoài nước phía sau bến, mỗi tàu mang bảng số cần), tàu rời / tàu kế vào có hoạt cảnh, không treo. Thêm ca vào hoc/kiem-ve-mua-song-cang.mjs.
- Node phải đi qua hoc/lo-trinh-hoc.js (lộ trình xuất bản), không require man-*.js thô.

LUẬT NỘI DUNG (user đã chốt):
- Khuôn: mỗi chương ĐÚNG 10 màn; 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm tối đa một điều mới; không nhảy vọt độ dài lời giải / nhịp. Không thêm chương.
- Show don't tell: màn TRÌNH DIỄN trước (mã khoá `chinhCoDinh`, loiSai: []), rồi MÀN ÉP có loiSai chứng minh (mã lỗi đúng, ví dụ giao không theo thứ tự hàng → `giao-nham`). Màn nhiều sân mỗi sân một hàng tàu khác nhau (dãy lệnh cố định thua) — màn cảm biến nhiều sân không phải trùm thì thêm mã vào `NHIEU_SAN_KHONG_TRUM` trong hoc/kiem-lo-trinh.mjs (như F3 đã làm). Gói 10 mọi màn 2–3 sân + `nhipTheo: 'tong'`.
- Lời Việt cho trẻ: câu ngắn, mỗi câu một việc, chữ ít; đề KHÔNG viết sẵn từng bước lời giải; nhân vật Sola / Luna. Code mỗi dòng một việc. Phim / giới thiệu gói 4 (hoc/game/phim-mua-cang.js, huyHieu, tên chương ở hoc/lo-trinh-hoc.js :1909) cập nhật nếu nói về chương cũ.
- Ngưỡng sao: sửa TAY hoc/lo-trinh-sao.js. KHÔNG chạy `tools/do-lo-trinh.mjs --ghi-sao`.

PHẠM VI: được sửa hoc/san-hoc.js (CHỈ phần cẩu / tàu + tài liệu), hoc/cham.js (đưa khai báo mới xuống + lời Việt sự kiện mới), hoc/game/san-ve.js + hoc/game/ve-vector-vat-cang.js (phần tàu), hoc/man-ben-tau.js, tệp màn gói 10 mùa 4, hoc/lo-trinh-hoc.js (tên chương, nếu đổi), hoc/lo-trinh-sao.js, hoc/kiem-lo-trinh.mjs (CHỈ thêm mã vào NHIEU_SAN_KHONG_TRUM), phim gói 4 mùa cảng, máy kiểm cẩu (thêm ca, KHÔNG nới tiêu chí), tạo hoc/kiem-hang-tau.mjs. KHÔNG sửa: nghĩa `cfg.tau` / `cfg.giao` cũ, luật chồng / móc đôi / cần gạt đôi / chongLuat, loại robot khác, mùa khác (mùa 9 có cẩu: chỉ cần vẫn xanh).

CÁCH GIAO: worktree riêng, tạo nhánh claude/mua-4-hang-tau TỪ main hiện tại (phải có commit F4a "lớn nhất hàng ngang" — người giao sẽ nói SHA; worktree khởi đầu cũ thì `git merge --ff-only main`). Chỉ ghi tệp trong worktree của mình (hook chặn ghi sang worktree khác). Commit từng bước. KHÔNG push, KHÔNG merge main. KHÔNG `git checkout -- <tệp>` / `git reset --hard` / `git stash`; so với gốc bằng `git show main:<tệp> > <scratchpad>/...`.

PHẢN BIỆN (bắt buộc): brief là phán đoán từ bên ngoài; kiểm lại từng khẳng định bằng code, đừng tin. Bất đồng CHẶN → dừng, commit WIP, báo. Không chặn → làm theo, ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): hàng tàu nối đuôi LÀM LẠI một chương có sẵn của gói 4 (mặc định chương 2), không thêm chương; chỉ tàu đầu hàng nhận, trẻ không chọn tàu; giao sai là thua; chữ "hàng đợi" chỉ cho hàng tàu; mùa 4 chưa học list; khuôn 10 × 2 × 10.

KIỂM TRA — TIỀN CẢNH, tuần tự, `timeout 300`, ghi ra tệp rồi đọc; sau mỗi nhóm commit. CẤM `npm test` cả bộ, cấm chạy song song. Nền: người giao sẽ ghi số nền sau F4a vào tin nhắn giao việc; trước F4a (main 5e1e2a0) là:
  timeout 300 node hoc/kiem-chong-luat.mjs        → "ĐẠT 76 · HỎNG 0"
  timeout 300 node hoc/kiem-mua-cang.mjs          → "ĐẠT 144 · HỎNG 0"
  timeout 300 node hoc/kiem-man-mua-cang.mjs      → "ĐẠT 200/200 màn mùa cảng sông."
  timeout 300 node hoc/kiem-ve-mua-song-cang.mjs  → "ĐẠT 43 · HỎNG 0"
  timeout 300 node hoc/kiem-cau-do-mua-9.mjs      → "ĐẠT 27 · HỎNG 0"
  timeout 300 node hoc/kiem-lai-mua-9.mjs         → "ĐẠT 170 · HỎNG 0"
  timeout 300 node hoc/kiem-nhap-mua-4-7.mjs      → "ĐẠT cả 41 phép kiểm nhập liệu mùa 4–7"
  timeout 300 node hoc/kiem-phim-goi.mjs          → "ĐẠT 55 · HỎNG 0"
  timeout 300 node hoc/kiem-huong-dan.mjs         → "ĐẠT 40 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-giai.mjs          → "ĐẠT 67/67"
  timeout 300 node hoc/kiem-hoc.mjs               → "ĐẠT 6716 · HỎNG 0" (~60 s)
  timeout 300 node tools/do-ghep-nhip.mjs         → dòng mua-4 (nền 25/200; không được tụt)
  NỀN ĐỎ SẴN (chỉ báo nếu có lỗi KHÁC): hoc/kiem-lo-trinh.mjs (dừng ở AssertionError thứ tự gói mùa 1 'combo' / 'hai-robot'); hoc/kiem-ve-vector.mjs (HỎNG 1/101 mục 13a-v).
  Máy kiểm mới hoc/kiem-hang-tau.mjs: ca lõi (giao đúng thứ tự thắng; giao số của tàu thứ hai lên tàu đầu → giao-nham; read_code ở boong trả số tàu đầu hàng, hết tàu −1; cấu hình sai báo lỗi tiếng Việt) + mỗi màn mới thắng mọi sân, lời sai ra đúng mã. Phải tự chứng minh bắt lỗi thật (chạy với lời giải sai → HỎNG).

DỪNG VÀ HỎI KHI: phải đổi nghĩa cfg.tau / cfg.giao cũ hay lõi ngoài phần cẩu / tàu; làm lại chương 2 mà không giữ được `move_tower2` cho gói sau; phạm vi phình sang mùa khác.

BÁO CÁO CUỐI — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, luật lõi đã làm (khai báo, sự kiện, read_code ở boong, lời chấm), bảng màn đổi (mã · tên · loại · hàng tàu · số sân · lời giải o / nhịp · màn cũ bị bỏ), hàm em cũ còn / bỏ, lệnh kiểm + dòng kết quả nguyên văn, việc dở.
  2. CÂU HỎI CẦN LÀM RÕ: còn mở; đã tự quyết; chỗ brief sai/thừa/thiếu (ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: mỗi mục cần user quyết: vấn đề → bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi ích · rủi ro) → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
