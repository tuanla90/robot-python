# Brief PDM2b: mùa 2 gói 5–8 (xe cứu hỏa đầy đủ; gói 8 mới "gặp yếu tố mùa 1")

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi chương (10 màn) ít nhất 2 commit; tối đa 40 phút phải có commit. CẤM khảo sát toàn bộ rồi mới sửa.
Thứ tự: gói 6 → gói 7 → gói 8 (gói 5 chỉ soát). Hết sức thì dừng và báo còn gì.**

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 2, suy luận 1 = 7 → fable nếu có; opus nếu không)

MỤC TIÊU: xong khi gói 5–8 mùa 2 đúng luật part (`node hoc/kiem-part-mua.mjs --chi-tiet` không còn dòng mùa 2 gói 5–8), gói 8 là 20 màn MỚI
"xe cứu hỏa gặp yếu tố mùa 1", mọi màn thắng 3 sao, ngưỡng sao đo lại, mọi máy kiểm liên quan ĐẠT.

BỐI CẢNH:
- `hoc/KE-HOACH-PART-DUNG-MUA.md` mục 1 và 3 (user chốt 31/10). Gói 1–4 mùa 2 đã làm lại ở PDM2a (xem `git log` và báo cáo trong `hoc/ban-giao/`): học theo cách
  PDM2a đổi màn (tr_right / tr_left, bỏ kẹp và cảm biến khoảng cách, đo lại sao).
- Cỗ máy: XÍCH + VÒI PHUN (spray, spray_back; spray("high") mở ở gói 6 Lực phun, phun mạnh làm xe GIẬT; không khai cfg.beSung) + HỒNG NGOẠI (distance(); warm() mở ở gói 7).
  Xích đẩy thùng nặng (cfg.xichDay) là nâng cấp gói 5. Sau gói nâng cấp thì luôn có bản nâng cấp trên khay (màn được giấu lệnh cũ để ép).
- Gói 6 luc-ban / che-luc-ban, gói 7 do-nhiet / che-do-nhiet đang chạy xe hai bánh + vòi (một số màn còn cảm biến khoảng cách): làm lại trên xích.
- Gói 8 hiện là "R2 trở lại" (đội). Đội chuyển sang gói 9 (PDM2c làm). Gói 8 MỚI: tên gói theo quy tắc tên (KE-HOACH-7-MUA.md mục Quy tắc đặt tên), gợi ý
  "Kho hàng cũ" hay "Góc kho cũ" (nhà máy có một góc kho hàng kiểu mùa 1). Hai chương mới, mã chương MỚI (vd `kho-cu`, `che-kho-cu`), 20 màn mã mới trong tệp mới
  `hoc/man-kho-cu.js` (theo mẫu tệp ngân hàng mùa 2 như man-do-nhiet.js; thêm vào require đầu lo-trinh-hoc.js, TEP_MUA_2 và thẻ <script> của hoc/game/choi.html).
  Yếu tố mùa 1 dùng: nút đè M (xích hay thùng nặng đè nút mở cửa), ô đích D, thùng gỗ / vật nằm đất 'o' (chắn đường, chắn tia; băng chuyền chở được; xích không gắp được),
  hàng rào '=' (tia nước bay qua rào, xe không qua). Trộn với yếu tố mùa 2 (van N, cửa C, băng chuyền, thùng nặng, lửa nếu hợp). Python mùa 2 (biến, tham số).
  Đường cong: chương 1 màn 1 trình diễn (chiChay) cho yếu tố đầu tiên, rồi mỗi màn thêm tối đa một điều mới; màn 10 trùm (nhiều sân nếu hợp) có huy hiệu.
- Gỡ gói 8 cũ khỏi MUA_2 (doi-mua-2 / che-doi-mua-2 KHÔNG xoá khỏi ngân hàng: PDM2c dời sang gói 9).
  Ngưỡng sao gói khai cứng (MUA_2 sao: 0, 30, …): giữ nguyên số theo vị trí gói.
- Luật học, lời mùa 2 (không chữ vũ khí), cách sửa màn ở lộ trình: như brief PDM2a (`hoc/ban-giao/brief-PDM2a-mua-2-goi-1-4.md` mục BỐI CẢNH, CÁCH LÀM).

PHẢN BIỆN, CÁCH GIAO, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: y như brief PDM2a (làm thẳng trên nhánh claude/part-dung-mua, worktree part-dung-mua; không npm test cả bộ).
Máy kiểm riêng thêm: kiem-luc-ban, kiem-che-luc-ban, kiem-do-nhiet, kiem-doi-mua-2 (nếu trông đợi gói 8 là đội thì sửa trông đợi theo vị trí mới / ghi lại cho PDM2c),
và máy kiểm MỚI `hoc/kiem-kho-cu.mjs` cho gói 8 (đủ trường, đường cong, màn trình diễn, yếu tố mùa 1 có mặt trong mọi màn).
