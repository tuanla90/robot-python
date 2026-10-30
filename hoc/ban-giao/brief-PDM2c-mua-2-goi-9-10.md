# Brief PDM2c: mùa 2 gói 9 đội (R2 = xe chở hàng mùa 1) và gói 10 chạy một mình (nhiều sân)

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi chương ít nhất 2 commit; tối đa 40 phút phải có commit. CẤM khảo sát toàn bộ rồi mới sửa.
Thứ tự: gói 9 → gói 10. Hết sức thì dừng và báo còn gì.**

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 1, suy luận 2 = 7)

MỤC TIÊU: xong khi gói 9 mùa 2 là 20 màn đội (R1 xe cứu hỏa đầy đủ, R2 xe chở hàng mùa 1), gói 10 là 20 màn MỘT robot nhiều sân,
và thêm 'mua-2' vào XONG của `hoc/kiem-part-mua.mjs` mà máy kiểm đó ĐẠT; mọi máy kiểm liên quan ĐẠT.

BỐI CẢNH:
- `hoc/KE-HOACH-PART-DUNG-MUA.md` mục 1 và 3. Gói 1–8 mùa 2 đã làm lại (PDM2a, PDM2b: xem git log, báo cáo ở hoc/ban-giao/).
- Gói 9 ĐỘI: R1 (vàng) = Xe cứu hỏa đầy đủ: xích (xichDay) + vòi phun (spray("high") có) + hồng ngoại (distance, warm). R2 (Luna, hồng/lam theo bộ vẽ hiện dùng cho R2)
  = Xe chở hàng mùa 1 đầy đủ: hai bánh (có lùi) + tay xoay + cảm biến khoảng cách ba hướng. Máy kiểm part chặn R2 mang part mùa 2.
  Cái hay của đội: mỗi xe làm việc xe kia không làm được (R2 gắp / mang vật 'o' mà xích không gắp được; R1 phun van, đẩy thùng nặng, đi băng không trôi mà R2 bị băng đẩy).
  Nguồn: màn đội có sẵn doi-mua-2 / che-doi-mua-2 (R1 xích không vòi, R2 hai bánh có vòi: luật đội, nhịp, chờ nhau đã có) — giữ ý phối hợp khi được, đổi vai cho đúng;
  không giữ được thì viết màn mới (mã mới, tệp hiện có man-doi-mua-2.js). Gói 9 hiện là "Bệ vòi xích" (be-sung): gỡ khỏi lộ trình (ngân hàng giữ nguyên, mã không đổi).
  CẬP NHẬT sau PDM2b (đọc `hoc/ban-giao/can-trao-doi-part-dung-mua.md` mục 8): gói Đội cũ đang CẤT ở mùa ẩn (CAT_MUA_2 trong lo-trinh-hoc.js) và kiem-doi-mua-2.mjs
  đang dừng sớm khi gói Đội không ở mùa 2: đưa gói Đội về làm GÓI 9 mùa 2 (sao 240) và cho kiem-doi-mua-2 chạy lại đầy đủ. Bệ vòi xích: CẤT ra mùa ẩn bằng cùng cơ chế
  (người giao chọn phương án A), không xoá ngân hàng. Gói 10 đang mượn hàm gói Đội / Bệ vòi qua cờ `capCu` (CAP_HAM_CU): khi dựng lại gói 10 thì BỎ CAP_HAM_CU và phần
  bỏ qua capCu trong kiem-lo-trinh (g) / kiem-trum-mua-2 nếu không còn cần.
  Tên gói / chương theo quy tắc đặt tên (gợi ý gói "R2 trở lại" giữ tên cũ vì đúng truyện: Luna mang xe chở hàng tới giúp).
- Gói 10 "Xe cứu hỏa R1 xuất xưởng": mọi màn MỘT robot (xe cứu hỏa đầy đủ), 2–3 sân mỗi màn (mỗi sân một "ngày": van / lửa / thùng ở chỗ khác),
  một chương trình tổng quát (while / if với distance() / warm()) thắng mọi sân; một lời giải viết cứng thua ở ít nhất một sân (loiSai có phaiCoMa).
  Màn đội trong tong-hop-2 / trum-mua-2 hiện có: chuyển ý sang gói 9 nếu hợp, ô của nó trong gói 10 thay bằng màn một robot mới (giữ mã nếu được).
  Máy kiểm "nhiều sân chỉ ở màn trùm" (kiem-lo-trinh.mjs NHIEU_SAN_KHONG_TRUM): mùa 1 gói 10 đã có luật "gói 10 được nhiều sân" (PDM1) — dùng lại.
- Lời mùa 2: không chữ vũ khí (kiem-loi-mua-2.mjs). Luật học như brief PDM2a.

PHẦN A (LÀM TRƯỚC, commit riêng): `npm test` cả bộ sau PDM2b còn 9 bộ HỎNG (97/106), đầu ra đầy đủ ở `hoc/ban-giao/npm-test-sau-PDM2b.txt`:
kiem-che-tay (1), kiem-che-xe (4: Sổ lệnh thừa hàm gói Đội đang cất: wait_clear, yield_step, wait_mate, pass_mate, clear_squirt, step_clear, cover, guard; nhóm hàm đợt 2),
kiem-doi-sung-hoi (1: che-doi-sung-hoi.7 quá 200 nhịp ở go_wall), kiem-goi-doi (1: hàm của màn squirt_left trùng hàm của em ở doi-sung-hoi.9, che-doi-sung-hoi.6, .10),
kiem-hoc (9), kiem-huy-hieu-phim-vector (1: A7 HuyHieu.DS khác dữ liệu chụp c830c12 — PDM2b thêm hình kho-cu / che-kho-cu), kiem-khay (2: 24.8 / 24.9 thiếu distance…),
kiem-nut-bat-san (2: nutBat ngoài gói Đo nhiệt ở kho-cu.7, kho-cu.8, che-kho-cu.7), kiem-phim-goi (2: gói kho-cu chưa có phim; phim doi-mua-2 không còn gói trong MUA_2).
Tại commit f4200fe (trước PDM2b) cả 105 bộ ĐẠT: đây là hồi quy của PDM2b. Sửa đúng nguyên nhân (một số tự hết khi gói Đội về gói 9); máy kiểm đổi trông đợi chỉ khi luật
mới đúng là thế (ghi lý do ngay dòng sửa); phim gói 8 mới: thêm phim tạm theo khuôn phim-mua-2.js nếu máy kiểm bắt buộc (phim thật làm ở phiên Phim CLB).
ĐƯỢC chạy `npm test` cả bộ (chỉ mình bạn đang chạy, người giao nghỉ): lần cuối của phần A và lần cuối trước báo cáo, chạy nền, ghi ra tệp trong scratchpad của bạn.

PHẢN BIỆN, CÁCH GIAO, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: y như brief PDM2a (làm thẳng trên nhánh claude/part-dung-mua), trừ `npm test` cả bộ được phép như trên.
Máy kiểm riêng thêm: kiem-doi-mua-2, kiem-be-sung (gỡ hay chuyển sang kiểm ngân hàng nếu còn ý nghĩa), kiem-trum-mua-2, kiem-part-mua (commit cuối: 'mua-2' vào XONG).
