# Brief PDM3b: mùa 3 gói 5–10 (đảo cực, đọc cực trên nhện; gói 8 mới; gói 9 đội R2 part cũ; gói 10 nhiều sân)

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi chương ít nhất 2 commit; tối đa 40 phút phải có commit. CẤM khảo sát toàn bộ rồi mới sửa.
Thứ tự: gói 6 → 7 → 5 (soát) → 8 → 9 → 10, mỗi gói xong là commit. Hết sức thì dừng và báo còn gì.**

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 2, suy luận 2 = 8)

MỤC TIÊU: xong khi gói 5–10 mùa 3 theo khuôn mới và thêm 'mua-3' vào XONG của `hoc/kiem-part-mua.mjs` mà máy kiểm đó ĐẠT; mọi máy kiểm liên quan ĐẠT.

BỐI CẢNH: đọc `hoc/ban-giao/brief-PDM3a-mua-3-goi-2-4.md` (luật lõi nhện / nam châm bụng / cảm biến từ trên nhện, Python mùa 3, lời mùa 3, cách làm) và kết quả PDM3a (git log).
- Gói 5 Nhảy (crouch / stand / jump / leap): đã là nhện; che-nhen có 1 màn nhện + tay kẹp → bỏ tay kẹp (R1 không kẹp). Từ gói 5 R1 có thể mang nam châm bụng + cảm biến từ.
- Gói 6 Đảo cực (magnet_s) và gói 7 Đọc cực (front_pole): 40 màn hiện xe hai bánh + nam châm mũi + khoảng cách + từ → làm lại trên nhện (nam châm bụng: vật nam châm
  cùng cực nằm yên, khác cực hút; đảo cực lúc đang dính vật nam châm theo luật bụng). Đệm từ (gói 4) và nhảy (gói 5) được dùng lại.
- Gói 8 MỚI "robot phân loại gặp yếu tố mùa 1–2" (tên gói theo quy tắc tên, gợi ý theo nơi: một góc bãi có băng chuyền cũ / thùng nặng): mã chương mới, tệp ngân hàng mới
  `hoc/man-<mã>.js` (thêm vào require đầu lo-trinh-hoc.js, TEP_MUA_3 và thẻ <script> của hoc/game/choi.html). Yếu tố cũ: băng chuyền (nhện bị đẩy: đứng 2 nhịp trên băng),
  thùng nặng (chắn; nhện không đẩy được), van N + cửa C (nhện không có vòi: cửa mở theo nhịp cuaNhip hay nút đè M), nút đè, ô đích, thùng gỗ (vật gỗ: nam châm không hút).
  Màn 1 trình diễn, màn 10 trùm có huy hiệu.
- Gói 9 ĐỘI: R1 (vàng) robot phân loại đầy đủ (nhện + nam châm bụng N/S + cảm biến từ); R2 (của Luna) lắp TRỌN một cỗ máy mùa trước: Xe cứu hỏa mùa 2 (xích + vòi phun
  + hồng ngoại) — ưu tiên — hay Xe chở hàng mùa 1. Máy kiểm part chặn R2 mang part mùa 3. Mỗi xe làm việc xe kia không làm được (R2 phun van mở cửa, đẩy / giật thùng nặng,
  không trôi trên băng; R1 hút sắt, nhảy qua hố, đọc cực). Gói đội cũ "Đội xích và nhện" (doi-xich / che-doi-xich: R1 xích kẹp, R2 nhện) đổi vai cho đúng hay viết mới;
  gói bung-nhen cũ rời lộ trình (mã giữ trong ngân hàng; màn đã dời sang gói 2 ở PDM3a thì thôi).
- Gói 10: mọi màn MỘT robot (robot phân loại đầy đủ), 2–3 sân mỗi màn ("ngày làm việc": sắt / nam châm / gỗ ở chỗ khác), một chương trình tổng quát
  (if / elif / and / or với front_metal / front_pole, chuỗi) thắng mọi sân; một lời viết cứng thua ở ít nhất một sân (loiSai có phaiCoMa). Màn đội ở tong-hop-3 / trum-mua-3
  chuyển ý sang gói 9 hay thay bằng màn một robot (giữ mã nếu được). kiem-lo-trinh.mjs GOI_NHIEU_SAN (mùa 1, PDM1) mở rộng cho gói 10 mùa 2 (nếu PDM2c đã làm) và mùa 3.
- Huy hiệu trùm mùa 3 gán ở lo-trinh-hoc.js HUY_HIEU_3 (tên = tên chương); gói mới có trùm mới thì cần hình huy hiệu (kiem-huy-hieu*: nếu bắt buộc hình riêng mà không vẽ được
  thì DỪNG hỏi, đừng tắt máy kiểm).

PHẠM VI, PHẢN BIỆN, CÁCH GIAO, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: như brief PDM3a. Commit cuối: 'mua-3' vào XONG của kiem-part-mua.mjs.

BÀI HỌC ĐỢT MÙA 2 (người giao ghi): đợt nào cũng để lại hồi quy ở máy kiểm KHÔNG nằm trong danh sách (sổ lệnh so-lenh.js, kiem-khay, kiem-hoc, kiem-phim-goi,
kiem-huy-hieu-phim-vector, kiem-goi-doi, kiem-nut-bat-san…). Vì vậy: ĐƯỢC chạy `npm test` cả bộ (chạy nền, ghi ra tệp) sau mỗi gói và lần cuối trước báo cáo;
báo cáo ghi dòng kết quả nguyên văn. Gói mới cần phim gói tạm (phim-mua-N.js + chu.js) và hình huy hiệu nếu máy kiểm đòi.

LUẬT NHỊP GÓI 10 (PDM2c2 phát hiện): màn nhiều sân của gói 10 tính TỔNG nhịp mọi sân (nhipTheo "tong"), không theo sân dài nhất: theo sân dài nhất thì dãy viết cứng cho ngày khó nhất vẫn 3 sao mọi ngày. Bộ dò dayChung theo tổng phải không tìm ra dãy chung 3 sao.
