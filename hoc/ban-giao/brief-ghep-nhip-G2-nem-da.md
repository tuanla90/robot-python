NHỊP LÀM VIỆC (đọc trước tiên): commit đầu tiên trong ~20 phút (lõi `nemDa` + ca kiểm lõi), tối đa 40 phút phải có commit mới; mỗi nhóm màn một commit. Máy kiểm chạy TIỀN CẢNH với `timeout 300 node …`, KHÔNG chạy nền rồi ngồi chờ. CẤM kiểm kê toàn bộ trước khi sửa dòng đầu tiên (ngoại lệ: bước ĐO aim(3) ở mục BỐI CẢNH, làm nhanh bằng lộ trình, ≤ 10 phút). Hết sức thì dừng và báo còn gì. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

LOẠI: Ship   MODEL: fable (điểm: quy mô 2 (lõi + 20 màn gói 6 + màn aim(3) gói sau), choke 2 (lõi máy ném san-hoc, cham.js), giá sai 1, mơ hồ 1, suy luận 1 = 7)

MỤC TIÊU: xong khi máy ném có cờ màn `cfg.nemDa` (NÉM ĐÀ): `throw()` cùng nhịp với TIẾN THẲNG thì (a) xe tiến 1 ô → (b) vật rời tay ở ô MỚI, bay `tầm + 1` ô; ô trước bị chặn thì xe đứng yên, ném tầm thường, sự kiện `khong-co-da`; gói 6 Chỉnh lực hất mùa 7 dựng lại (chương 1 tầm 1–2 đứng yên, chương 2 ném đà, có trình diễn + ép); mọi màn đang dùng `aim(3)` trong mùa 7 được sửa theo luật mới; `node tools/do-ghep-nhip.mjs` dòng mua-7 không tụt dưới 45/200 và gói 6 ≥ 10/20; mọi máy kiểm xanh.

BỐI CẢNH:
- Kế hoạch: hoc/KE-HOACH-GHEP-NHIP.md mục 1 và 5b (ĐỌC KỸ). Tóm tắt (user chốt 13/11):
  - Lý do: ném lao, ném biên phải chạy đà mới ném xa được; đứng tại chỗ thì không.
  - `aim(n)` chỉ còn n = 1, 2 (TAM_NEM_TOI_DA = 2). `throw()` + TIẾN THẲNG cùng nhịp: xe tiến 1 ô, vật rời tay ở ô mới, bay tầm + 1 (tới 3). Ô trước bị chặn: đứng yên, ném tầm thường, 'khong-co-da'. Lùi / quay / trượt + ném: vẫn bỏ lệnh bánh ('nem-dung-yen'). `load()` vẫn đứng yên.
  - Vì sao có nghĩa: tầm đo TỪ Ô THẢ VẬT. Đứng ở mép bờ thì chỉ vượt mép 2 ô; chạy vào ô mép và ném cùng nhịp thì vượt 3 ô.
  - Ví dụ: `aim(2)` rồi `left_move(); right_move(); throw(); wait()`. Màn ép: `. ▶ . ~ ~ u` (ô `.` trước xe là chỗ chạy đà, hố cách mép 3 ô).
  - Lời lỗi `tam-sai` đổi "1 hoặc 2" (ở nơi cờ / luật áp dụng).
- ĐO TRƯỚC (bắt buộc, nhanh): kế hoạch đếm `aim(3)` trong lời giải 10 màn đang chơi (gói 6: 8, gói 8: 1, gói 9: 1) + 7 màn mùa ẩn; 7 màn đặt tầm bằng biến. NHƯNG grep thô thấy `aim(3)` ở hoc/man-may-nem.js (35 chỗ), man-che-may-nem.js, man-rap-du.js, man-mo-cu.js, man-doi-omni-moi.js, man-chinh-luc.js (51). Gói 2 mùa 7 'may-nem' "Tay hất đá" (hoc/lo-trinh-hoc.js :1746) có thể đang DẠY aim(3). Đo qua hoc/lo-trinh-hoc.js (lộ trình xuất bản, không require man-*.js thô): liệt kê mọi màn xuất bản có aim(3) hay aim(biến) trong loiGiai / loiGiaiKhac / hàm em, theo mùa / gói.
  - Nếu gói 1–5 mùa 7 (trước gói 6) có màn DẠY / CẦN aim(3) để thắng: hạ tầm toàn cục sẽ phá đường cong (gói 2 dạy 3 rồi gói 6 cấm 3). Khi đó KHÔNG hạ toàn cục: làm trần 2 chỉ khi bật cờ `nemDa` (gói 6–10), giữ aim(3) ở gói 1–5 và mùa ẩn; ghi rõ vào CÂU HỎI CẦN LÀM RÕ để user quyết hướng dứt điểm (sửa gói 2 hay để trần theo cờ). Nếu gói 1–5 KHÔNG cần aim(3): hạ toàn cục như kế hoạch, sửa màn mùa ẩn.
  - Màn mùa khác (mùa 8, 9: man-cuu-*.js, man-doi-hang-dong.js, man-ngay-hoi-clb.js…) có aim(3): KHÔNG sửa sân; nếu trần mới phá chúng thì giữ trần 3 ở đó (theo cờ) — DỪNG hỏi nếu không tách được.
- Lõi: hoc/san-hoc.js — tài liệu MÁY NÉM :290–300 (aim / throw / load, 'nem-dung-yen'), TAM_NEM_TOI_DA :610, 'nem-dung-yen' :3948, 'tam-sai' :4687–4691. Khuôn cờ màn bật theo gói: hoc/lo-trinh-hoc.js (khối `cheoGhep` mùa 7 G1 vừa thêm, `GOI_GAT_DOI` mùa 4); cham.js đưa cờ xuống ba chỗ (tìm `cheoGhep` trong hoc/cham.js, làm y như vậy cho `nemDa`). Khung soạn lệnh: G1 phát hiện khung chặn "một nhịp một kiểu đi" và phải thêm `TP.datCheoGhep` (hoc/game/thanh-phan.js, man-choi.js, xuong-ham.js) — throw() + bánh cùng nhịp có thể cũng bị khung chặn: KIỂM bằng hoc/kiem-khay.mjs và nới theo cờ `nemDa` y như cheoGhep.
- Cờ `cheoGhep` (G1) đã bật gói 5–10 mùa 7; gói 6 có 7 màn đang dùng hàm em `dir_*` (chinh-luc.5, .6, .10; che-chinh-luc.3, .6, .7, .10): màn dựng lại vẫn phải giữ đường cong / nhắc lại đi chéo hợp lý.
- Tệp màn mùa 7: hoc/man-chinh-luc.js (gói 6: chinh-luc + che-chinh-luc), man-nhan-dang.js (7), man-mo-cu.js (8), man-doi-omni-moi.js (9), man-trum-mua-6.js (10). Hàm em gói 6 cũ (aim_lob, fill_far, lob_step, auto_aim, diag_aim…; xem đầu man-chinh-luc.js) có thể được gói sau gọi: grep trước khi bỏ / đổi; giữ tên + chữ ký nếu gói sau còn gọi.
- Hình: vật bay từ ô MỚI sau khi xe tiến trong cùng nhịp — hoc/game/san-ve.js phát theo sự kiện; xem hoạt cảnh tiến + ném có đúng thứ tự không, thêm ca vào máy kiểm vẽ nếu có.

LUẬT NỘI DUNG (user đã chốt):
- Khuôn: mỗi chương ĐÚNG 10 màn; 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm tối đa một điều mới; không nhảy vọt độ dài lời giải / nhịp. Không thêm chương.
- Show don't tell: màn TRÌNH DIỄN trước (`chinhCoDinh`, loiSai: []), rồi MÀN ÉP: đứng yên ném thì KHÔNG TỚI (loiSai chứng minh, mã lỗi đúng). Có màn giấu hàm cũ (`camHamCuaEm`) rồi thả. Chương 2 dạy hàm em có ném đà (ví dụ `run_throw()`; tên tiếng Anh ngắn, mỗi dòng một việc).
- Lời Việt cho trẻ: câu ngắn, mỗi câu một việc, chữ ít; đề không viết sẵn lời giải; nhân vật Sola / Luna. Gói 6 nói vì sao: "ném lao phải chạy đà".
- Ngưỡng sao: sửa TAY hoc/lo-trinh-sao.js. KHÔNG chạy `tools/do-lo-trinh.mjs --ghi-sao`.
- Phim gói 6 mùa mỏ đá (hoc/game/phim-mua-6.js) và sổ lệnh / giới thiệu part: sửa câu nói "tầm 1–3" thành luật mới (chữ ít, theo hoc/LUAT-SUA-PHIM-CLB.md).

PHẠM VI: được sửa hoc/san-hoc.js (CHỈ phần máy ném + tài liệu), hoc/cham.js, hoc/lo-trinh-hoc.js (dòng bật cờ), khung soạn lệnh (thanh-phan.js / man-choi.js / xuong-ham.js — CHỈ nới theo cờ nemDa), hoc/game/san-ve.js phần ném, tệp màn mùa 7 gói 2 (chỉ nếu đo thấy cần và đã ghi lý do), 6–10, màn mùa ẩn có aim(3), hoc/lo-trinh-sao.js, máy kiểm máy ném / omni / khay (thêm ca, KHÔNG nới tiêu chí), phim gói 6, sổ lệnh, giới thiệu part. KHÔNG sửa: luật đi chéo (G1), loại robot khác, mùa 8 / 9 (trừ khi chỉ cần giữ trần cũ qua cờ).

CÁCH GIAO: worktree riêng, tạo nhánh claude/mua-7-nem-da TỪ nhánh claude/ban-giao-ghep-nhip-8ada93 (đã gộp G1, CHƯA vào main: user muốn gộp main một lượt khi xong mùa 7). Việc đầu: `git merge --ff-only claude/ban-giao-ghep-nhip-8ada93` (phải có commit G1 67685ac và brief này). Chỉ ghi tệp trong worktree của mình (hook chặn ghi sang worktree khác). Commit từng bước. KHÔNG push, KHÔNG merge main. KHÔNG `git checkout -- <tệp>` / `git reset --hard` / `git stash`; so với gốc bằng `git show <rev>:<tệp> > <scratchpad>/...`.

PHẢN BIỆN (bắt buộc): brief là phán đoán từ bên ngoài; kiểm lại từng khẳng định bằng code, đừng tin. Bất đồng CHẶN → dừng, commit WIP, báo. Không chặn → làm theo, ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): ném + tiến cùng nhịp = vật rời tay ở ô mới, bay tầm + 1; ô trước chặn thì 'khong-co-da'; lùi / quay / trượt + ném vẫn bỏ bánh; aim tối đa 2 (ở đâu áp dụng: xem mục ĐO TRƯỚC); gói 6 dựng lại: chương 1 tầm 1–2 đứng yên, chương 2 ném đà; khuôn 10 × 2 × 10.

KIỂM TRA — TIỀN CẢNH, tuần tự, `timeout 300`, ghi ra tệp rồi đọc; sau mỗi nhóm commit. CẤM `npm test` cả bộ, cấm chạy song song. Nền ở nhánh claude/ban-giao-ghep-nhip-8ada93 sau G1 (người giao đã chạy):
  timeout 300 node hoc/kiem-omni.mjs              → "ĐẠT 239 · HỎNG 0"
  timeout 300 node hoc/kiem-che-omni.mjs          → "ĐẠT 234 · HỎNG 0"
  timeout 300 node hoc/kiem-doi-omni.mjs          → "ĐẠT 80 · HỎNG 0"
  timeout 300 node hoc/kiem-may-nem.mjs           → "ĐẠT 156 · HỎNG 0"
  timeout 300 node hoc/kiem-che-may-nem.mjs       → "ĐẠT 226 · HỎNG 0"
  timeout 300 node hoc/kiem-doi-gap-nem.mjs       → "ĐẠT 59 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-mua-6.mjs         → "ĐẠT 17 · HỎNG 0"
  timeout 300 node hoc/kiem-man-mua-6.mjs         → "ĐẠT 200/200 màn mùa 6." (mùa Mỏ đá)
  timeout 300 node hoc/kiem-mua-hang.mjs          → "KẾT QUẢ KIỂM MÙA 8 (HANG ĐỘNG): 14 đạt, 0 hỏng."
  timeout 300 node hoc/kiem-lai-mua-9.mjs         → "ĐẠT 170 · HỎNG 0"
  timeout 300 node hoc/kiem-nhap-mua-4-7.mjs      → "ĐẠT cả 41 phép kiểm nhập liệu mùa 4–7"
  timeout 300 node hoc/kiem-phim-goi.mjs          → "ĐẠT 55 · HỎNG 0"
  timeout 300 node hoc/kiem-huong-dan.mjs         → "ĐẠT 40 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-giai.mjs          → "ĐẠT 67/67"
  timeout 300 node hoc/kiem-hoc.mjs               → "ĐẠT 6716 · HỎNG 0" (~60 s)
  timeout 300 node hoc/kiem-khay.mjs              → "ĐẠT 185 · HỎNG 2" (2 ca HỎNG có sẵn ở main: luc-ban.6/.7/.9 mùa 2 và TP.tachHamKhac tay-gap.10 — chỉ báo nếu có ca hỏng KHÁC)
  timeout 300 node tools/do-ghep-nhip.mjs         → dòng mua-7 "màn có ghép ngoài hai bánh 45/200" (không được tụt; gói 6 hiện 7/20)
  NỀN ĐỎ SẴN (chỉ báo nếu có lỗi KHÁC): hoc/kiem-lo-trinh.mjs (dừng ở AssertionError 'combo' / 'hai-robot'); hoc/kiem-ve-vector.mjs (HỎNG 1/101 mục 13a-v).
  Ca kiểm lõi mới phải tự chứng minh: tắt cờ thì ca ném đà HỎNG. Máy đo ghép nhịp phải đếm ném + bánh là ghép ngoài cặp hai bánh: kiểm tools/do-ghep-nhip.mjs có bộ phận ném chưa; chưa có thì thêm (KHÔNG nới tiêu chí).
  Bài học F4a: khay KHÔNG chọn được hàm trong điều kiện `while` → đọc vào biến trước `while`.

DỪNG VÀ HỎI KHI: phải sửa lõi ngoài máy ném / khung theo cờ; trần aim 2 phá màn mùa 8 / 9 mà không tách được bằng cờ; phải dựng lại gói 2 mùa 7; lệch hàng loạt màn gói 7–10 không sửa được trong phạm vi.

BÁO CÁO CUỐI — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, kết quả bước ĐO aim(3) (bảng mùa · gói · màn · cách sửa), luật lõi đã làm (cờ, trần aim ở đâu, sự kiện, lời chấm), bảng màn đổi (mã · tên · loại · ghép gì · lời giải o / nhịp · màn cũ bị thay), hàm em còn / bỏ, lệnh kiểm + dòng kết quả nguyên văn, dòng mua-7 của do-ghep-nhip, việc dở.
  2. CÂU HỎI CẦN LÀM RÕ: còn mở; đã tự quyết; chỗ brief sai/thừa/thiếu (ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: mỗi mục cần user quyết: vấn đề → bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi ích · rủi ro) → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
