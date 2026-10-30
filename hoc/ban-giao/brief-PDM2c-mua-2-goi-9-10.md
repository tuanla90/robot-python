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
  Tên gói / chương theo quy tắc đặt tên (gợi ý gói "R2 trở lại" giữ tên cũ vì đúng truyện: Luna mang xe chở hàng tới giúp).
- Gói 10 "Xe cứu hỏa R1 xuất xưởng": mọi màn MỘT robot (xe cứu hỏa đầy đủ), 2–3 sân mỗi màn (mỗi sân một "ngày": van / lửa / thùng ở chỗ khác),
  một chương trình tổng quát (while / if với distance() / warm()) thắng mọi sân; một lời giải viết cứng thua ở ít nhất một sân (loiSai có phaiCoMa).
  Màn đội trong tong-hop-2 / trum-mua-2 hiện có: chuyển ý sang gói 9 nếu hợp, ô của nó trong gói 10 thay bằng màn một robot mới (giữ mã nếu được).
  Máy kiểm "nhiều sân chỉ ở màn trùm" (kiem-lo-trinh.mjs NHIEU_SAN_KHONG_TRUM): mùa 1 gói 10 đã có luật "gói 10 được nhiều sân" (PDM1) — dùng lại.
- Lời mùa 2: không chữ vũ khí (kiem-loi-mua-2.mjs). Luật học như brief PDM2a.

PHẢN BIỆN, CÁCH GIAO, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: y như brief PDM2a (làm thẳng trên nhánh claude/part-dung-mua; không npm test cả bộ).
Máy kiểm riêng thêm: kiem-doi-mua-2, kiem-be-sung (gỡ hay chuyển sang kiểm ngân hàng nếu còn ý nghĩa), kiem-trum-mua-2, kiem-part-mua (commit cuối: 'mua-2' vào XONG).
