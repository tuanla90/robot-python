NHỊP LÀM VIỆC (đọc trước tiên): commit đầu tiên trong ~20 phút (lõi `chongLuat` + ca kiểm lõi), tối đa 40 phút phải có commit mới; mỗi gói màn một commit. Máy kiểm chạy TIỀN CẢNH với `timeout 300 node …`, KHÔNG chạy nền rồi ngồi chờ. CẤM kiểm kê toàn bộ trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì — thà lõi + 2 gói có commit còn hơn 4 gói không commit nào. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

LOẠI: Ship   MODEL: fable (điểm: quy mô 2 (lõi + hình + 4 gói màn), choke 2 (san-hoc chấm mục tiêu, cham.js), giá sai 1, mơ hồ 1, suy luận 1 = 7)

MỤC TIÊU: xong khi lõi có mục tiêu `bongMo.chongLuat` (chấm theo LUẬT xếp, không theo dãy cố định) + lỗi chấm `sai-luat-chong` + máy kiểm `hoc/kiem-chong-luat.mjs`; hình có biển luật ở chồng đích và mũi tên "vào / ra ở đỉnh"; mùa 4 có màn dạy ngăn xếp ở gói 2 Móc cẩu container, gói 6 Móc cẩu đôi, dùng lại ở gói 8 Bãi cảng cũ, gói 10 Cần cẩu container R1 (luật kép theo màu); mọi máy kiểm xanh.

BỐI CẢNH:
- Kế hoạch: hoc/KE-HOACH-GHEP-NHIP.md mục 3b (móc đôi, user chốt) và 3c (ĐỌC KỸ, đây là luật của gói). Tóm tắt:
  - Mỗi chồng container là một NGĂN XẾP ("vào sau ra trước"): chỉ lấy / đặt ở đỉnh. Lõi chồng KHÔNG đổi.
  - Bốc lẻ (`pick_up` / `set_down` hai lần) thì thứ tự ĐẢO; móc đôi (`pick_up2`) thì GIỮ. Đề bắt đảo hay giữ, trẻ chọn nhấc 1 hay 2.
  - Luật hướng: "nhỏ ở trên" / "lớn ở trên" (KHÔNG viết "tăng dần / giảm dần"). Luật tháp `luatThap` có sẵn = "lớn không đặt lên nhỏ".
  - Luật màu: màu = `so % 4` đã có trong hình (hoc/game/ve-vector-vat-cang.js:3, :26, :67 — 0 đỏ · 1 xanh dương · 2 vàng · 3 xanh lá). KHÔNG thêm thuộc tính màu, KHÔNG thêm lệnh đọc màu. Trong code nhận màu bằng `read_code() % 4 == 0`. Lời dạy nói "màu = mã chia 4 dư mấy" kèm bảng 4 màu.
  - Gói 2, 6: một luật, 3–4 container, một chồng tạm (cao tối đa 4). Luật kép (mỗi màu một chiều, hay lọc màu sang chồng riêng) chỉ ở gói 10.
  - Lời dạy KHÔNG gọi móc đôi là "hàng đợi" (chữ đó để dành cho hàng tàu 3d, gói sau).
- Lõi đề xuất (kế hoạch 3c): `bongMo.chongLuat = [{ x, y, luat: 'nho-tren' | 'lon-tren', mau?: 0..3 | [..], du?: n }]`. Lúc xong, chồng ở (x, y) chứa ĐÚNG mọi container hợp `mau` (mặc định mọi màu) trên sân, đúng chiều `luat`; `du` = số container phải có (mặc định đếm từ sân). Lỗi chấm `sai-luat-chong` (chỉ ô / cặp sai đầu tiên), lời Việt trong hoc/cham.js. `bongMo.chong` cũ giữ nguyên.
- Chỗ lõi có sẵn để học theo: hoc/san-hoc.js tài liệu cẩu :464–500 (luatThap :486, bongMo.chong :499–500), dựng bongMo.chong :1472–1480; chấm `chua-xep-chong` ở cham.js; read_code :487–488 (trả −1 khi trống).
- LƯU Ý ĐƯỜNG CONG: `read_code()` là cảm biến của GÓI 3 (Đầu đọc mã). Gói 2 CHƯA có read_code → màn gói 2 chỉ một sân, đề cho luật, trẻ nhìn số / màu trên hình rồi tự viết thứ tự; chấm theo luật vẫn đúng. Từ gói 6 có read_code → màn ép dùng NHIỀU SÂN, mỗi sân một bộ số (dãy cố định thắng một sân sẽ thua sân khác). Xem memory "dữ liệu theo sân" (mẫu 82.2; công cụ `node hoc/do-meo-dien-so.cjs`, `node hoc/kiem-du-lieu-san.cjs`). Kiểm lại nhận định này bằng code.
- Tệp màn: hoc/man-moc-cau.js (gói 2, chương moc-cau + chia-du), hoc/man-nhac-doi.js (gói 6, nhac-doi + che-nhac-doi), hoc/man-cang-cu.js (gói 8), hoc/man-trum-mua-cang.js + màn tong-hop-cang (gói 10; tìm tệp bằng grep 'tong-hop-cang.'). Lộ trình: hoc/lo-trinh-hoc.js :1886–1903.
- Cờ `canGatDoi` (F2, vừa xong) bật ở gói 5–10: màn gói 6, 8, 10 viết lời giải theo luật ghép nhịp hiện hành; tàu / sao đo lại sau khi đổi.
- Node phải đi qua hoc/lo-trinh-hoc.js (lộ trình xuất bản), không require man-*.js thô.

SỐ MÀN TỐI THIỂU (người giao đặt, phản biện được): gói 2 ≥ 3 màn (trình diễn đảo thứ tự khi bốc lẻ; luật một chiều; một màn ép), gói 6 ≥ 3 (giữ vs đảo, chọn nhấc 1 / 2; màn ép nhiều sân), gói 8 ≥ 1, gói 10 ≥ 2 (luật kép theo màu). Màn mới THAY màn yếu / trùng trong chương (khuôn đúng 10 màn), ghi rõ màn bị thay.

LUẬT NỘI DUNG (user đã chốt):
- Khuôn: mỗi chương ĐÚNG 10 màn; 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm tối đa một điều mới; không nhảy vọt độ dài lời giải / nhịp. Không thêm chương.
- Show don't tell: màn TRÌNH DIỄN trước (mã khoá `chinhCoDinh`, loiSai: []), rồi MÀN ÉP có loiSai chứng minh (đúng mã lỗi `sai-luat-chong`). Có màn giấu hàm cũ (`camHamCuaEm`) nếu cần ép cách mới, rồi thả.
- Lời Việt cho trẻ: câu ngắn, mỗi câu một việc, chữ ít (đề KHÔNG viết sẵn từng bước lời giải); nhân vật Sola / Luna. Code mỗi dòng một việc (mùa 4–7 "B chặt").
- Ngưỡng sao: sửa TAY hoc/lo-trinh-sao.js. KHÔNG chạy `tools/do-lo-trinh.mjs --ghi-sao`.

PHẠM VI: được sửa hoc/san-hoc.js (CHỈ phần cẩu: mục tiêu chongLuat + tài liệu), hoc/cham.js (lời `sai-luat-chong` + đưa mục tiêu xuống), hình chồng / biển luật (hoc/game/ve-vector-vat-cang.js, hoc/game/san-ve.js phần cẩu), tệp màn gói 2 / 6 / 8 / 10 mùa 4, hoc/lo-trinh-sao.js, máy kiểm cẩu (thêm ca, KHÔNG nới tiêu chí), tạo hoc/kiem-chong-luat.mjs. KHÔNG sửa: loại robot khác, mùa khác, luật cần gạt đôi, hàng tàu (3d, gói sau), móc đôi (3b: giữ nguyên luật).

CÁCH GIAO: worktree riêng, tạo nhánh claude/mua-4-chong-luat TỪ main hiện tại (ccaed8e hoặc mới hơn; worktree khởi đầu cũ thì `git merge --ff-only main`). Chỉ ghi tệp trong worktree của mình. Commit từng bước. KHÔNG push, KHÔNG merge main. KHÔNG `git checkout -- <tệp>` / `git reset --hard` / `git stash`; so với gốc bằng `git show main:<tệp> > <scratchpad>/...`.

PHẢN BIỆN (bắt buộc): brief là phán đoán từ bên ngoài; kiểm lại từng khẳng định bằng code, đừng tin. Bất đồng CHẶN → dừng, commit WIP, báo. Không chặn → làm theo, ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): luật xếp chấm theo luật, mỗi sân một bộ số; "nhỏ ở trên / lớn ở trên" (không "tăng / giảm dần"); màu = so % 4, không thêm thuộc tính / lệnh màu; móc đôi giữ luật cũ và không gọi là hàng đợi; luật kép chỉ gói 10; khuôn 10 × 2 × 10.

KIỂM TRA — TIỀN CẢNH, tuần tự, `timeout 300`, ghi ra tệp rồi đọc; sau mỗi nhóm commit. CẤM `npm test` cả bộ, cấm chạy song song. Nền ở main ccaed8e (người giao đã chạy):
  timeout 300 node hoc/kiem-mua-cang.mjs          → "ĐẠT 144 · HỎNG 0"
  timeout 300 node hoc/kiem-man-mua-cang.mjs      → "ĐẠT 200/200 màn mùa cảng sông."
  timeout 300 node hoc/kiem-ve-mua-song-cang.mjs  → "ĐẠT 38 · HỎNG 0"
  timeout 300 node hoc/kiem-cau-do-mua-9.mjs      → "ĐẠT 27 · HỎNG 0"
  timeout 300 node hoc/kiem-lai-mua-9.mjs         → "ĐẠT 170 · HỎNG 0"
  timeout 300 node hoc/kiem-nhap-mua-4-7.mjs      → "ĐẠT cả 41 phép kiểm nhập liệu mùa 4–7"
  timeout 300 node hoc/kiem-phim-goi.mjs          → "ĐẠT 55 · HỎNG 0"
  timeout 300 node hoc/kiem-huong-dan.mjs         → "ĐẠT 40 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-giai.mjs          → "ĐẠT 67/67"
  timeout 300 node hoc/kiem-hoc.mjs               → "ĐẠT 6716 · HỎNG 0" (~60 s)
  timeout 900 node hoc/do-meo-dien-so.cjs         → màn mới KHÔNG được có trong danh sách lách (chạy > 5 phút; chạy MỘT lần cuối, Bash timeout 900000)
  timeout 300 node tools/do-ghep-nhip.mjs         → dòng mua-4 (nền 25/200; không được tụt)
  NỀN ĐỎ SẴN (chỉ báo nếu có lỗi KHÁC): hoc/kiem-lo-trinh.mjs (dừng ở AssertionError thứ tự gói mùa 1 'combo' / 'hai-robot'); hoc/kiem-ve-vector.mjs (HỎNG 1/101 mục 13a-v).
  Máy kiểm mới hoc/kiem-chong-luat.mjs phải tự chứng minh bắt lỗi thật: chạy với một lời giải sai luật → phải HỎNG.

DỪNG VÀ HỎI KHI: phải sửa lõi ngoài phần cẩu; đổi luật chồng / móc đôi hiện có; thay màn làm vỡ hàm em mà gói sau còn gọi; phạm vi phình sang mùa khác.

BÁO CÁO CUỐI — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, luật lõi đã làm (mục tiêu, lỗi chấm, lời Việt), bảng màn đổi (mã · tên · loại · luật gì · lời giải · màn bị thay), lệnh kiểm + dòng kết quả nguyên văn, việc dở.
  2. CÂU HỎI CẦN LÀM RÕ: còn mở; đã tự quyết; chỗ brief sai/thừa/thiếu (ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: mỗi mục cần user quyết: vấn đề → bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi ích · rủi ro) → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
