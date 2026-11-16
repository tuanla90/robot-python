NHỊP LÀM VIỆC (đọc trước tiên): commit đầu tiên trong ~20 phút (lõi `cheoGhep` + ca kiểm lõi), tối đa 40 phút phải có commit mới; mỗi nhóm màn một commit. Máy kiểm chạy TIỀN CẢNH với `timeout 300 node …`, KHÔNG chạy nền rồi ngồi chờ. CẤM kiểm kê toàn bộ trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì — thà lõi + gói 5 có commit còn hơn cả 26 màn không commit nào. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

LOẠI: Ship   MODEL: fable (điểm: quy mô 2 (lõi + 20 màn gói 5 + ~11 màn gói sau ở nhiều tệp, cả mùa 8, 9), choke 2 (lõi xe omni san-hoc, cham.js), giá sai 1, mơ hồ 1, suy luận 1 = 7)

MỤC TIÊU: xong khi xe omni có cờ màn `cfg.cheoGhep`: `slide_*` cùng nhịp với ĐI THẲNG (tiến hay lùi, cả hai bánh) = đi chéo 1 ô, giữ hướng mặt, được cả 4 hướng chéo; gói 5 Đi chéo mùa 7 dạy trẻ TỰ VIẾT bốn hàm `dir_fl()`, `dir_fr()`, `dir_bl()`, `dir_br()`; các màn gói sau đang dùng `diag_*` đổi lời giải sang `dir_*`; `node tools/do-ghep-nhip.mjs` dòng mua-7 "màn có ghép ngoài hai bánh" từ 0/200 lên ≥ 20/200 (gói 5 ≥ 15/20); mọi máy kiểm xanh.

BỐI CẢNH:
- Kế hoạch: hoc/KE-HOACH-GHEP-NHIP.md mục 1 (luật chung) và 5a (ĐỌC KỸ). Tóm tắt (user chốt 13/11):
  - Lý do: bánh omni đi chéo chính là nhờ cộng chuyển động tới và ngang.
  - Có cờ: bỏ `omni-khong-cheo`; `slide_*` + đi thẳng (tiến / lùi) cùng nhịp = chéo 1 ô, giữ hướng mặt. Trượt + QUAY vẫn bỏ như cũ. Ví dụ: `slide_left(); left_move(); right_move(); wait()` chéo tiến-trái; `slide_right(); left_back(); right_back(); wait()` chéo lùi-phải.
  - Hàm của em (gói 5): `def dir_fl(): slide_left(); left_move(); right_move(); wait()` (f = front / tới, b = back / lùi, l / r = trái / phải SO VỚI HƯỚNG MẶT). KHÔNG dùng tên `ul` / `up` / `back_left`. Code mỗi dòng một việc (mùa 4–7 "B chặt") nên thân hàm viết 4 dòng.
  - `diag_*` gốc THÔI DẠY nhưng lõi GIỮ (không vỡ mã / bản lưu cũ). Gói 5 làm lại; màn gói sau đổi lời giải sang `dir_*` lấy từ kho hàm (không dựng lại sân).
  - Kế hoạch đếm: `diag_*` có trong 15 màn gói 5 và 11 màn gói sau (gói 6: 3, gói 7: 2, gói 8: 2, gói 10: 1, mùa 8 gói 9: 2, mùa 9 gói 7: 1). Kiểm lại bằng code (grep thô ra nhiều hơn vì lẫn chữ đề / hàm em).
- Lõi hiện tại: hoc/san-hoc.js tài liệu xe omni :112–120 ("KHÔNG ĐI CHÉO", 'omni-khong-cheo', 'slide-goi-lai'); OMNI_CHEO / diag_* :558–559, :650, :1203 (coOmniCheo), :2596; chỗ phát 'omni-khong-cheo' :3995. Khuôn cờ màn bật theo gói: hoc/lo-trinh-hoc.js (khối `GOI_GAT_DOI` của mùa 4 ở gần dòng 3363, `ghiXich` mùa 2, `cuonDay` mùa 5); cham.js đưa cờ màn xuống cfg (tìm `canGatDoi` trong hoc/cham.js — làm y như vậy cho `cheoGhep`, ba chỗ).
- Thứ tự trong nhịp có cờ: tự định rõ (ví dụ cộng vector trượt + tiến rồi kiểm ô đích một lần; ô đích bị chặn thì đứng yên như đâm tường của bánh, ghi sự kiện rõ ràng). Kiểm chéo qua góc tường (hai ô kề bị chặn) xử thế nào — chọn cách dễ hiểu cho trẻ, đồng nhất với `diag_*` hiện có, ghi vào báo cáo.
- Bật cờ từ gói 5 tới hết mùa 7 (gói 5–10: di-cheo, chinh-luc, nhan-dang, mo-cu, doi-omni, may-mo-da). Gói 1–4 không bật. Bật cờ có thể đổi kết quả màn gói 6–10 đang có `slide` + lệnh bánh cùng nhịp (trước bị bỏ bánh, nay đi chéo) → ĐO LẠI mọi màn gói 5–10 (thắng, nhịp, sao, lời sai); màn lệch thì sửa lời giải / sao. Lệch hàng loạt không sửa được → DỪNG hỏi. Mùa 8, 9: mặc định KHÔNG bật cờ; màn ở đó dùng `diag_*` thì đổi sang `dir_*` CHỈ khi hàm em `dir_*` có trong kho người chơi lúc tới đó (cờ phải bật cho màn đó để `dir_*` chạy đúng) — nếu cần bật cờ cho riêng màn đó thì đo, ghi lại.
- Tệp màn mùa 7: hoc/man-di-cheo.js (gói 5), man-chinh-luc.js (6), man-nhan-dang.js (7), man-mo-cu.js (8), man-doi-omni-moi.js (9), man-trum-mua-6.js (10, chương tong-hop-6 + trum-mua-6). Mùa 8 gói 9: hoc/man-doi-hang-dong.js. Mùa 9: hoc/man-cuu-mo-da.js (và các man-cuu-*.js khác nếu có diag_). Lộ trình hoc/lo-trinh-hoc.js :1752–1781.
- Node phải đi qua hoc/lo-trinh-hoc.js (lộ trình xuất bản), không require man-*.js thô.

LUẬT NỘI DUNG (user đã chốt):
- Khuôn: mỗi chương ĐÚNG 10 màn; 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm tối đa một điều mới; không nhảy vọt độ dài lời giải / nhịp. Không thêm chương.
- Show don't tell: màn TRÌNH DIỄN trước (mã khoá `chinhCoDinh`, loiSai: []), rồi MÀN ÉP: tách nhịp (trượt rồi tiến = 2 nhịp) thì KHÔNG THẮNG (có loiSai chứng minh, mã lỗi đúng; áp lực có thể là cửa nhịp, đá lăn, hay số nhịp tối đa). Có màn giấu hàm cũ (`camHamCuaEm` / bỏ `diag_*` khỏi hamGoc) ép dùng cách mới, rồi thả. Chương 2 (che-di-cheo) dạy chế 4 hàm `dir_*` (một màn trình diễn một hàm, rồi trẻ tự viết các hàm còn lại).
- Lời Việt cho trẻ: câu ngắn, mỗi câu một việc, chữ ít; đề không viết sẵn lời giải; nhân vật Sola / Luna. Gói 5 nói vì sao: "bánh omni cộng hai chuyển động: tới và ngang".
- Ngưỡng sao: sửa TAY hoc/lo-trinh-sao.js. KHÔNG chạy `tools/do-lo-trinh.mjs --ghi-sao`.
- Phim gói 5 mùa mỏ đá: nếu phim dạy `diag_*` hay nói "omni không đi chéo được" thì thêm / sửa câu cho đúng luật mới (theo hoc/LUAT-SUA-PHIM-CLB.md: chữ ít). Sổ lệnh / tooltip `diag_*` nếu còn hiện cho trẻ: ghi rõ "lệnh cũ".

PHẠM VI: được sửa hoc/san-hoc.js (CHỈ phần xe omni + tài liệu), hoc/cham.js (đưa cờ xuống + lời sự kiện mới), hoc/lo-trinh-hoc.js (dòng bật cờ), hình đi chéo của omni trong hoc/game/san-ve.js nếu chéo-ghép cần hoạt cảnh khác, các tệp màn liệt kê ở trên, hoc/lo-trinh-sao.js, máy kiểm omni (thêm ca, KHÔNG nới tiêu chí), phim gói 5 mùa mỏ đá. KHÔNG sửa: ném / aim / throw (gói G2 sau), loại robot khác, mùa khác ngoài các màn diag_ đã kể.

CÁCH GIAO: worktree riêng, tạo nhánh claude/mua-7-cheo-ghep TỪ main hiện tại (a5f54d9 hoặc mới hơn, có brief này; worktree khởi đầu cũ thì `git merge --ff-only main`). Chỉ ghi tệp trong worktree của mình (hook chặn ghi sang worktree khác). Commit từng bước. KHÔNG push, KHÔNG merge main. KHÔNG `git checkout -- <tệp>` / `git reset --hard` / `git stash`; so với gốc bằng `git show main:<tệp> > <scratchpad>/...`.

PHẢN BIỆN (bắt buộc): brief là phán đoán từ bên ngoài; kiểm lại từng khẳng định bằng code, đừng tin. Bất đồng CHẶN → dừng, commit WIP, báo. Không chặn → làm theo, ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): chéo = trượt + đi thẳng cùng nhịp (cờ cheoGhep, từ gói 5); trượt + quay vẫn bỏ; bốn hàm em tên dir_fl / dir_fr / dir_bl / dir_br; diag_* thôi dạy nhưng lõi giữ; khuôn 10 × 2 × 10.

KIỂM TRA — TIỀN CẢNH, tuần tự, `timeout 300`, ghi ra tệp rồi đọc; sau mỗi nhóm commit. CẤM `npm test` cả bộ, cấm chạy song song. Nền ở main a5f54d9 (người giao đã chạy):
  timeout 300 node hoc/kiem-omni.mjs              → "ĐẠT 174 · HỎNG 0"
  timeout 300 node hoc/kiem-che-omni.mjs          → "ĐẠT 234 · HỎNG 0"
  timeout 300 node hoc/kiem-doi-omni.mjs          → "ĐẠT 80 · HỎNG 0"
  timeout 300 node hoc/kiem-may-nem.mjs           → "ĐẠT 156 · HỎNG 0"
  timeout 300 node hoc/kiem-che-may-nem.mjs       → "ĐẠT 226 · HỎNG 0"
  timeout 300 node hoc/kiem-doi-gap-nem.mjs       → "ĐẠT 59 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-mua-6.mjs         → "ĐẠT 17 · HỎNG 0" (lõi mùa Mỏ đá)
  timeout 300 node hoc/kiem-man-mua-6.mjs         → "ĐẠT 200/200 màn mùa 6." (mùa Mỏ đá)
  timeout 300 node hoc/kiem-mua-hang.mjs          → "KẾT QUẢ KIỂM MÙA 8 (HANG ĐỘNG): 14 đạt, 0 hỏng."
  timeout 300 node hoc/kiem-lai-mua-9.mjs         → "ĐẠT 170 · HỎNG 0"
  timeout 300 node hoc/kiem-nhap-mua-4-7.mjs      → "ĐẠT cả 41 phép kiểm nhập liệu mùa 4–7"
  timeout 300 node hoc/kiem-phim-goi.mjs          → "ĐẠT 55 · HỎNG 0"
  timeout 300 node hoc/kiem-huong-dan.mjs         → "ĐẠT 40 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-giai.mjs          → "ĐẠT 67/67"
  timeout 300 node hoc/kiem-hoc.mjs               → "ĐẠT 6716 · HỎNG 0" (~60 s)
  timeout 300 node tools/do-ghep-nhip.mjs         → dòng mua-7 "màn có ghép ngoài hai bánh 0/200" (phải lên ≥ 20/200)
  NỀN ĐỎ SẴN (chỉ báo nếu có lỗi KHÁC): hoc/kiem-lo-trinh.mjs (dừng ở AssertionError thứ tự gói mùa 1 'combo' / 'hai-robot'); hoc/kiem-ve-vector.mjs (HỎNG 1/101 mục 13a-v).
  Máy đo ghép nhịp phải biết slide + bánh là ghép ngoài cặp hai bánh: kiểm tools/do-ghep-nhip.mjs có nhận bộ phận "truot" không; nếu chưa thì thêm (máy đo được sửa, KHÔNG nới tiêu chí đếm). Ca kiểm lõi mới phải tự chứng minh: tắt cờ thì ca chéo-ghép HỎNG.
  Bài học F4a: khay KHÔNG chọn được hàm trong điều kiện `while` (kiem-nhap-mua-4-7 bắt) → đọc vào biến trước `while`.

DỪNG VÀ HỎI KHI: phải sửa lõi ngoài phần omni; bật cờ làm lệch hàng loạt màn gói 6–10 không sửa được trong phạm vi; phải dựng lại sân màn mùa 8 / 9; phạm vi phình sang ném đà.

BÁO CÁO CUỐI — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, luật lõi đã làm (cờ, sự kiện, chéo qua góc), bảng màn đổi (mã · tên · loại · ghép gì · lời giải o / nhịp · màn cũ bị thay), số màn lệch vì bật cờ và cách sửa, danh sách màn diag_ → dir_*, lệnh kiểm + dòng kết quả nguyên văn, dòng mua-7 của do-ghep-nhip, việc dở.
  2. CÂU HỎI CẦN LÀM RÕ: còn mở; đã tự quyết; chỗ brief sai/thừa/thiếu (ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: mỗi mục cần user quyết: vấn đề → bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi ích · rủi ro) → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
