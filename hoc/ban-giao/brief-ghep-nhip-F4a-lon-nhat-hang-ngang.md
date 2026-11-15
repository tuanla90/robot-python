NHỊP LÀM VIỆC (đọc trước tiên): commit đầu tiên trong ~20 phút (màn đầu tiên của gói 7 + ca kiểm), tối đa 40 phút phải có commit mới; mỗi gói màn một commit. Máy kiểm chạy TIỀN CẢNH với `timeout 300 node …`, KHÔNG chạy nền rồi ngồi chờ. CẤM kiểm kê toàn bộ trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

LOẠI: Ship   MODEL: opus (điểm: quy mô 1 (3 tệp màn + sao + máy kiểm), choke 0 (không sửa lõi), giá sai 1, mơ hồ 1, suy luận 1 = 4)

MỤC TIÊU: xong khi mùa 4 có màn dạy TÌM LỚN NHẤT / NHỎ NHẤT theo HÀNG NGANG (kế hoạch 3f): gói 7 Cảm biến tải trọng ≥ 3 màn (trình diễn, ép nhiều sân, "nặng nhất" bằng `weight()`), gói 8 Bãi cảng cũ ≥ 1 màn, gói 10 Cần cẩu container R1 ≥ 1 màn dùng lại; mọi màn ép chứng minh được "dãy lệnh cố định thắng một sân thì thua sân khác"; KHÔNG sửa lõi; mọi máy kiểm xanh.

BỐI CẢNH:
- Kế hoạch: hoc/KE-HOACH-GHEP-NHIP.md mục 3f (ĐỌC KỸ) — tóm tắt:
  - Chồng DỌC = ngăn xếp (3c, đã làm ở F3); dãy NGANG = tìm lớn nhất / nhỏ nhất (gói này); hàng tàu = hàng đợi (3d, gói F4b sau, KHÔNG làm ở đây).
  - Sân: một dãy ô bãi song song ray, mỗi ô MỘT container (mọi ô đều lấy được, khác chồng). Cẩu chạy ray qua từng ô, `read_code()`, giữ BIẾN KỶ LỤC, rồi mang container lớn nhất (nhỏ nhất, hay lớn nhất của một màu = `so % 4`) đi giao. Số đổi theo sân nên phải quét thật.
  - Python mùa 4: trẻ TỰ VIẾT vòng quét giữ kỷ lục (biến + `if`). KHÔNG dùng `max()` / `min()` / `list` (đó là bài mùa 5 / 6). Mùa 4 đã có vòng `for … in range(…)`, `%`, `//`, `abs`, số âm (read_code trả −1 khi ô trống).
- Lõi có sẵn (không sửa): `rail(±n)`, `read_code()`, `weight()` (nâng cấp cân tải gói 7: không treo thì trả tấn của container trên cùng ở đầu cần), mục tiêu `bongMo.chong` / `bongMo.chongLuat` (F3) / `giao-tau`. Tài liệu ở hoc/san-hoc.js :460–500. Cờ `canGatDoi` (F2) bật gói 5–10: lời giải viết theo luật ghép nhịp hiện hành (ví dụ `rail(1)` và lệnh khác trước `wait()` chạy chung một nhịp).
- Kiểu "đáp án": nên dùng `bongMo.chongLuat` hay `bongMo.chong` với ô đích một container, hoặc `giao-tau`, sao cho mỗi sân đáp án KHÁC NHAU (mỗi sân một bộ số). Tự chọn cái gọn nhất, ghi lý do.
- MÀN NHIỀU SÂN đọc bằng cảm biến: `duLieuSan` (dữ liệu theo sân) là cơ chế gán biến Python theo sân, KHÔNG hợp với bài đọc bằng `read_code()`. F3 đã xử bằng cách thêm mã màn vào danh sách `NHIEU_SAN_KHONG_TRUM` trong hoc/kiem-lo-trinh.mjs (xem dòng có 'nhac-doi.8', 'cang-cu.9'). Làm y như vậy cho màn nhiều sân không phải trùm. Gói 10 (`tong-hop-cang`, `trum-mua-cang`) bắt MỌI màn 2–3 sân + `nhipTheo: 'tong'`.
- Tệp màn: hoc/man-can-tai.js (gói 7, chương can-tai + che-can-tai), hoc/man-cang-cu.js (gói 8), tệp màn tong-hop-cang / trum-mua-cang (gói 10, grep 'tong-hop-cang.'). Lộ trình hoc/lo-trinh-hoc.js :1886–1903. F3 vừa thay cang-cu.9, tong-hop-cang.7, .8 — KHÔNG thay lại các màn đó.
- Node phải đi qua hoc/lo-trinh-hoc.js (lộ trình xuất bản), không require man-*.js thô.
- Đề xuất máy kiểm: thêm ca vào hoc/kiem-chong-luat.mjs hoặc tạo hoc/kiem-lon-nhat.mjs: với mỗi màn mới, lời giải thắng MỌI sân; một lời sai "làm theo sân 1" (dãy lệnh cố định) THUA ở sân khác; một lời sai "quên cập nhật kỷ lục" thua. Máy kiểm phải tự chứng minh bắt lỗi thật (chạy với lời giải sai → HỎNG).

LUẬT NỘI DUNG (user đã chốt):
- Khuôn: mỗi chương ĐÚNG 10 màn; 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm tối đa một điều mới; không nhảy vọt độ dài lời giải / nhịp. Không thêm chương. Màn mới THAY màn yếu / trùng trong chương, ghi rõ màn bị thay; màn bị thay có `taoHam` mà gói sau còn gọi → KHÔNG thay (chọn màn khác).
- Show don't tell: màn TRÌNH DIỄN trước (mã khoá `chinhCoDinh`, loiSai: []), rồi MÀN ÉP có loiSai chứng minh (mã lỗi đúng). Có thể có màn giấu hàm cũ (`camHamCuaEm`) rồi thả.
- Lời Việt cho trẻ: câu ngắn, mỗi câu một việc, chữ ít; đề KHÔNG viết sẵn từng bước lời giải; nhân vật Sola / Luna. Code mỗi dòng một việc (mùa 4–7 "B chặt"). Gọi đúng tên: "lớn nhất", "nhỏ nhất", "kỷ lục"; KHÔNG gọi là ngăn xếp / hàng đợi.
- Ngưỡng sao: sửa TAY hoc/lo-trinh-sao.js. KHÔNG chạy `tools/do-lo-trinh.mjs --ghi-sao`.

PHẠM VI: được sửa các tệp màn gói 7 / 8 / 10 mùa 4, hoc/lo-trinh-sao.js, hoc/kiem-lo-trinh.mjs (CHỈ thêm mã vào NHIEU_SAN_KHONG_TRUM), máy kiểm cẩu (thêm ca, KHÔNG nới tiêu chí), tạo máy kiểm mới. KHÔNG sửa: hoc/san-hoc.js, hoc/cham.js, hình, loại robot khác, mùa khác, hàng tàu (F4b).

CÁCH GIAO: worktree riêng, tạo nhánh claude/mua-4-lon-nhat TỪ main hiện tại (có brief này; worktree khởi đầu cũ thì `git merge --ff-only main`). Chỉ ghi tệp trong worktree của mình (hook chặn ghi sang worktree khác). Commit từng bước. KHÔNG push, KHÔNG merge main. KHÔNG `git checkout -- <tệp>` / `git reset --hard` / `git stash`; so với gốc bằng `git show main:<tệp> > <scratchpad>/...`.

PHẢN BIỆN (bắt buộc): brief là phán đoán từ bên ngoài; kiểm lại từng khẳng định bằng code, đừng tin. Bất đồng CHẶN → dừng, commit WIP, báo. Không chặn → làm theo, ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): dãy ngang dạy lớn nhất / nhỏ nhất, trẻ tự viết vòng quét giữ kỷ lục, không max() / min() ở mùa 4; mỗi sân một bộ số; màu = so % 4; khuôn 10 × 2 × 10.

KIỂM TRA — TIỀN CẢNH, tuần tự, `timeout 300`, ghi ra tệp rồi đọc; sau mỗi nhóm commit. CẤM `npm test` cả bộ, cấm chạy song song. Nền ở main 5e1e2a0 (người giao đã chạy):
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
  NỀN ĐỎ SẴN (chỉ báo nếu có lỗi KHÁC): hoc/kiem-lo-trinh.mjs (dừng ở AssertionError thứ tự gói mùa 1 'combo' / 'hai-robot' — các mục sau KHÔNG chạy, nên tự kiểm luật nhiều sân bằng một bản tạm nếu cần); hoc/kiem-ve-vector.mjs (HỎNG 1/101 mục 13a-v).
  Máy dò lách hoc/do-meo-dien-so.cjs KHÔNG dò màn dùng cảm biến: không cần chạy; bằng chứng chặn lách là lời sai "làm theo sân 1" trong máy kiểm.

DỪNG VÀ HỎI KHI: phải sửa lõi hay hình; thay màn làm vỡ hàm em mà gói sau còn gọi; phạm vi phình sang mùa khác hay sang hàng tàu.

BÁO CÁO CUỐI — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, bảng màn đổi (mã · tên · loại · việc tìm (lớn / nhỏ / nặng / theo màu) · số sân · lời giải o / nhịp · màn bị thay), lệnh kiểm + dòng kết quả nguyên văn, việc dở.
  2. CÂU HỎI CẦN LÀM RÕ: còn mở; đã tự quyết; chỗ brief sai/thừa/thiếu (ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: mỗi mục cần user quyết: vấn đề → bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi ích · rủi ro) → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
