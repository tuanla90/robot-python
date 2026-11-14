NHỊP LÀM VIỆC (đọc trước tiên): commit đầu tiên trong ~20 phút (lõi + ca kiểm lõi), tối đa 40 phút phải có commit mới; mỗi gói màn một commit. Máy kiểm chạy TIỀN CẢNH với `timeout 300 node …`, KHÔNG chạy nền rồi ngồi chờ. CẤM kiểm kê toàn bộ trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

LOẠI: Ship   MODEL: opus (điểm: quy mô 2, choke 2 (lõi san-hoc nhịp cẩu), giá sai 1, mơ hồ 1, suy luận 2 = 8 → lẽ ra fable; Fable hết hạn mức nên dùng opus)

MỤC TIÊU: xong khi cần cẩu có cờ màn `cfg.canGatDoi`: các lệnh cẩu của BỘ PHẬN KHÁC NHAU viết liền trước `wait()` chạy chung MỘT nhịp; gói 5 Đường ray mùa 4 có màn trình diễn + màn ép (tách nhịp thì THUA vì tàu rời bến); `node tools/do-ghep-nhip.mjs` cho mùa 4 gói "5.Đường ray cảng" ≥ 6/20 và các gói 6–10 dùng lại để tổng mùa 4 ≥ 20/200; mọi máy kiểm xanh.

BỐI CẢNH:
- Kế hoạch: hoc/KE-HOACH-GHEP-NHIP.md mục 1 (luật chung) và 3a (đọc kỹ). Cẩu đã đổi 4 hướng (mục 3e XONG, merge 9ebfa0c): nac 0–3, swing quay 90°.
- Luật (user chốt 13/11): bốn bộ phận **ray** (`rail(±n)`), **quay** (`swing_left` / `swing_right`), **vươn** (`extend` / `retract`), **móc** (`pick_up` / `pick_up2` / `set_down`; giỏ cứu hộ mùa 9 nếu có, xem TAY_GIO). Thứ tự máy làm CỐ ĐỊNH trong nhịp: (a) ray 1 ô → (b) quay → (c) vươn / thu → kiểm đầu cần trong sân → (d) móc / hạ ở đầu cần MỚI. `rail(n)` |n| > 1: các lệnh cùng nhịp làm ở nhịp CUỐI của rail.
- Cách gộp: khi có cờ, lệnh cẩu chỉ RA LỆNH vào hàng chờ; `wait()` gom các lệnh đứng ngay trước nó thành MỘT nhịp. Hàng chờ bị đóng KHÔNG có `wait()` (gặp lệnh cùng bộ phận lần nữa, đọc cảm biến, hết chương trình) thì mỗi lệnh trong hàng chạy một nhịp riêng như cũ — KHÔNG báo 'quen-wait' kiểu mùa 1 (chương trình gói 1–4 không có wait() vẫn chạy đúng số nhịp cũ).
- Rủi ro user đã biết, PHẢI ĐO: mẫu cũ `swing_left(); wait()` (quay rồi đứng một nhịp = 2 nhịp) thành 1 nhịp khi bật cờ. Bật cờ từ gói 5 thì đo lại mọi màn gói 5–10 (số nhịp lời giải, tàu cập theo chu kỳ có còn khớp không, ngưỡng sao); màn nào lệch thì sửa lời giải / tàu / sao.
- Gói 1–4 KHÔNG bật cờ (giữ "mỗi lệnh một nhịp", chốt 31/10). Mùa 9: chỉ bật nếu đo thấy không lệch; mặc định không bật, báo lại.
- Lõi: hoc/san-hoc.js — tài liệu cẩu (:466–482, dòng 468 "MỌI LỆNH CẨU LÀ MỘT NHỊP NGAY"), nhánh lệnh cẩu ở :4361 (`if (laCau) … motNhip`), apCau quanh :3647–3760 (thứ tự pha trong motNhip). Khuôn để học: hàng chờ tay mùa 1 (`tayCho`, `rutTay` :4102), và cách mùa 5 làm neo / lưới cùng nhịp. Cờ bật theo gói trong hoc/lo-trinh-hoc.js (xem cách gói 6 mùa 2 bật `ghiXich`, mùa 5 bật `cuonDay`). Hai lệnh cùng bộ phận trong một hàng chờ có wait(): lệnh sau bị bỏ + sự kiện kiểu 'cau-goi-lai' (theo `banh-goi-lai` / `tay-goi-lai`), lời Việt trong hoc/cham.js.
- Máy đo tools/do-ghep-nhip.mjs đã biết bộ phận cẩu (:26–27: quayCan, vuonCan, moc, ray).
- Màn ép mẫu (kế hoạch 3a): cần chĩa vào container (phải, tầm 1), boong ở hướng lên tầm 3, tàu cập đúng 3 nhịp. Tách: móc, quay, vươn, vươn, hạ = 5 nhịp (trễ tàu). Ghép: `pick_up(); wait()` → `swing_left(); extend(); wait()` → `extend(); set_down(); wait()` = 3 nhịp.
- Hình: hoc/game/san-ve.js phát hoạt cảnh theo sự kiện từng nhịp — một nhịp có cả quay + vươn + móc phải hiện được (quay rồi vươn rồi móc trong cùng khung nhịp, hoặc song song), không treo hoạt cảnh. Kiểm bằng kiem-ve-mua-song-cang và xem một màn trên trình duyệt nếu được.
- Node phải đi qua hoc/lo-trinh-hoc.js (lộ trình xuất bản), không require man-*.js thô.

LUẬT NỘI DUNG (user đã chốt):
- Khuôn: mỗi chương ĐÚNG 10 màn; 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm tối đa một điều mới; không nhảy vọt độ dài lời giải / nhịp. Không thêm chương.
- Show don't tell: màn TRÌNH DIỄN trước (mã khoá `chinhCoDinh`, loiSai: []), rồi MÀN ÉP: tách nhịp thì KHÔNG THẮNG (có loiSai chứng minh, mã lỗi đúng). Có màn giấu hàm cũ (`camHamCuaEm`) ép dùng cách mới, rồi thả. Chương 2 (che-duong-ray) dạy hàm em có wait() ghép (ví dụ hàm chuyển một container 2 nhịp).
- Lời Việt cho trẻ: câu ngắn, mỗi câu một việc; nhân vật Sola / Luna. Gói 5 nói vì sao: "người lái cẩu cầm hai cần gạt, quay và vươn cùng lúc".
- Ngưỡng sao: sửa TAY hoc/lo-trinh-sao.js. KHÔNG chạy `tools/do-lo-trinh.mjs --ghi-sao`.
- Phim gói 5 mùa cảng (hoc/game/phim-mua-cang.js) nếu có câu "mỗi lệnh một nhịp" thì thêm một câu về cần gạt đôi.

PHẠM VI: được sửa hoc/san-hoc.js (CHỈ phần cẩu + tài liệu đầu tệp phần cẩu), hoc/cham.js (lời cho sự kiện mới), hoc/lo-trinh-hoc.js (dòng bật cờ), hoc/game/san-ve.js (hoạt cảnh nhịp ghép cẩu), các tệp màn cẩu mùa 4 gói 5–10 (hoc/man-duong-ray.js, man-nhac-doi.js, man-can-tai.js, man-cang-cu.js, man-doi-cang.js, man-trum-mua-cang.js), hoc/lo-trinh-sao.js, máy kiểm cẩu (thêm ca, KHÔNG nới tiêu chí), phim gói 5 mùa cảng, khay lệnh / sổ lệnh nếu cần nói "ghép bằng wait()". KHÔNG sửa: loại robot khác, mùa khác, xếp chồng luật màu (chongLuat — gói sau), hàng tàu (gói sau).

CÁCH GIAO: nhánh claude/mua-4-can-gat-doi trong worktree riêng, TỪ main hiện tại (c98a3f9 hoặc mới hơn; chạy `git merge --ff-only main` nếu worktree khởi đầu cũ). Commit từng bước. KHÔNG push, KHÔNG merge main. KHÔNG `git checkout -- <tệp>` / `git reset --hard` / `git stash`; so với gốc bằng `git show main:<tệp> > <scratchpad>/...`.

PHẢN BIỆN (bắt buộc): brief là phán đoán từ bên ngoài; kiểm lại từng khẳng định bằng code. Bất đồng CHẶN → dừng, commit WIP, báo. Không chặn → làm theo, ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): gộp bằng hàng chờ + wait() từ gói 5; gói 1–4 mỗi lệnh một nhịp; thứ tự ray → quay → vươn → móc; khuôn 10 × 2 × 10; móc đôi không gọi là hàng đợi.

KIỂM TRA — TIỀN CẢNH, tuần tự, `timeout 300`, ghi ra tệp rồi đọc; sau mỗi nhóm commit. CẤM `npm test` cả bộ, cấm chạy song song. Nền ở main c98a3f9 (người giao đã chạy):
  timeout 300 node hoc/kiem-mua-cang.mjs          → "ĐẠT 126 · HỎNG 0"
  timeout 300 node hoc/kiem-man-mua-cang.mjs      → "ĐẠT 200/200 màn mùa cảng sông."
  timeout 300 node hoc/kiem-ve-mua-song-cang.mjs  → "ĐẠT 35 · HỎNG 0"
  timeout 300 node hoc/kiem-cau-do-mua-9.mjs      → "ĐẠT 27 · HỎNG 0"
  timeout 300 node hoc/kiem-lai-mua-9.mjs         → "ĐẠT 170 · HỎNG 0"
  timeout 300 node hoc/kiem-nhap-mua-4-7.mjs      → "ĐẠT cả 41 phép kiểm nhập liệu mùa 4–7"
  timeout 300 node hoc/kiem-phim-goi.mjs          → "ĐẠT 55 · HỎNG 0"
  timeout 300 node hoc/kiem-huong-dan.mjs         → "ĐẠT 40 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-giai.mjs          → "ĐẠT 67/67"
  timeout 300 node hoc/kiem-hoc.mjs               → "ĐẠT 6716 · HỎNG 0" (~60 s)
  timeout 300 node tools/do-ghep-nhip.mjs         → dòng mua-4 "theo gói"
  NỀN ĐỎ SẴN (chỉ báo nếu có lỗi KHÁC): hoc/kiem-lo-trinh.mjs (dừng ở AssertionError thứ tự gói mùa 1 'combo' / 'hai-robot', dòng ~220); hoc/kiem-ve-vector.mjs (HỎNG 1/101 mục 13a-v).

DỪNG VÀ HỎI KHI: phải sửa lõi ngoài phần cẩu; bật cờ làm lệch hàng loạt màn gói 6–10 không sửa được trong phạm vi; phạm vi phình sang mùa khác.

BÁO CÁO CUỐI — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, luật lõi đã làm (sự kiện mới, lời chấm), bảng màn đổi (mã · tên · loại · ghép gì · lời giải), số màn lệch nhịp vì bật cờ và cách sửa, lệnh kiểm + dòng kết quả nguyên văn, dòng mua-4 của do-ghep-nhip, việc dở.
  2. CÂU HỎI CẦN LÀM RÕ: còn mở; đã tự quyết; chỗ brief sai/thừa/thiếu (ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: mỗi mục cần user quyết: vấn đề → bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi ích · rủi ro) → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
