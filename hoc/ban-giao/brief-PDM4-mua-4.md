# Brief PDM4: mùa 4 Nông trại hoa trên drone nông nghiệp (drone + bộ gieo hạt treo bụng + camera bốn hướng)

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi chương ít nhất 2 commit; tối đa 40 phút phải có commit. CẤM khảo sát toàn bộ rồi mới sửa.
Đợt được giao ghi ở lời giao việc (PDM4a: gói 1–4; PDM4b: gói 5–7; PDM4c: gói 8–10). Hết sức thì dừng và báo còn gì.**

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 2, suy luận 2 = 8)

MỤC TIÊU (cả mùa): mọi màn mùa 4 theo khuôn mới; đợt cuối thêm 'mua-4' vào XONG của `hoc/kiem-part-mua.mjs` mà máy kiểm đó ĐẠT; mọi máy kiểm liên quan ĐẠT.

BỐI CẢNH:
- `hoc/KE-HOACH-PART-DUNG-MUA.md` mục 1 và 5. Mùa 4 Nông trại hoa, cỗ máy Drone nông nghiệp R1: thân DRONE (go_* tự trôi 1 nhịp, bay qua rào / băng / vật / thùng;
  pin; nâng cấp gói 5 land() / take_off() đáp ô sạc), tay MÁY SƠN = bộ gieo hạt TREO BỤNG (ink(màu), dot() gieo ô ngay dưới; nâng cấp gói 6 pen_down / pen_up gieo liền),
  cảm biến CAMERA BỐN HƯỚNG (color(huong); nâng cấp gói 7 color("here") nhìn dưới chân, camBien { ma: 'camera-4', taiCho: true }).
  R1 KHÔNG được mang thân hai bánh, NAM CHÂM (part mùa 3), tay kẹp, cảm biến khoảng cách.
- Luật drone + máy sơn treo bụng (lõi có sẵn, phần DRONE "DRONE GẮN MÁY SƠN" của san-hoc.js; gói 9 cũ son-tren-cao dùng): đầu sơn tô ô NGAY DƯỚI drone; dot() / pen_down() /
  pen_up() làm ở nhịp kế, TRƯỚC khi bay; nhịp có tô ô tốn thêm 1 pin. Gói 2 trở đi dùng luật này ngay (trước đây máy sơn gắn xe hai bánh).
  Màn gói 2–3 nên khai pin dư (hay không giới hạn) để trẻ chưa phải lo pin trước gói 5.
- Hiện trạng (`node hoc/kiem-part-mua.mjs --chi-tiet`, mục mua-4): gói 1 chương list (10 màn hai bánh), gói 2 (20 màn hai bánh + sơn), gói 3 (20 màn hai bánh + camera),
  gói 6 (20 màn hai bánh + sơn), drone mang nam châm ở gói 1, 4, 5, 7 (~26 màn), gói 8 Đội chia hàng (hai xe hai bánh), gói 9 Gieo từ trên cao (drone + sơn: nguồn tốt
  cho gói 2 / 6 mới), gói 10 có màn hai bánh / đội.
- Python mùa 4: gói 1 danh sách, gói 2 duyệt for x in a / append. Ràng buộc ở kiem-lo-trinh.mjs mục mùa 4 và kiem-man-mua-4.mjs: siết lại cho đúng luật mới, không xoá phanh.
- Gói 8 MỚI: drone gặp yếu tố mùa 1–3: bay qua hàng rào, hố, băng chuyền, thùng nặng, vật (không bị chặn); cửa đóng / van trong tường chặn; ô đích / thùng gỗ;
  đệm từ (mùa 3) không hút drone không nam châm. Tệp ngân hàng mới, mã chương mới; màn 1 trình diễn, màn 10 trùm có huy hiệu.
- Gói 9 ĐỘI: R1 drone nông nghiệp đầy đủ; R2 (Luna) lắp TRỌN một cỗ máy mùa trước: Robot phân loại mùa 3 (nhện + nam châm bụng + cảm biến từ) ưu tiên, hay Xe cứu hỏa mùa 2.
  Đội chia hàng cũ (doi-nam-cham / che-doi-nam-cham) đổi vai hay viết mới. Gói son-tren-cao cũ rời lộ trình (mã giữ; màn dời sang gói 2 / 6 thì thôi).
- Gói 10: mọi màn MỘT robot (drone đầy đủ), 2–3 sân ("ngày": luống / màu hạt / trạm sạc ở chỗ khác), một chương trình tổng quát (danh sách, camera) thắng mọi sân; một lời viết
  cứng thua ở ít nhất một sân. kiem-lo-trinh.mjs GOI_NHIEU_SAN mở rộng cho gói 10 mùa 4.
- Nơi chốn: Nông trại hoa (4 màu: đỏ hồng, vàng cúc, xanh dương cẩm tú cầu, xanh lá cỏ ba lá), vỏ 'nong-trai'; lời đổi ở lộ trình (chuNongTrai) chồng lên ngân hàng;
  15 hàm cốt truyện mùa 4 đã đổi tên theo nông trại (KE-HOACH-MUA-4.md mục 6, 7). Mùa 4 đang `an: true` (ẩn): giữ nguyên.
- Cách làm đã dùng ở mùa 1–3 (git log từ 73b5b91; `hoc/ban-giao/can-trao-doi-part-dung-mua.md`): đo sao sửa tay trong hoc/lo-trinh-sao.js (KHÔNG `--ghi-sao`), cấp hàm cũ
  cho màn ẩn (mùa 5) khi hàm của em bị đổi / bỏ, tên hàm mới không trùng (kiem-goi-doi, kiem-man-mua-4 bắt).
- Luật học: đường cong mượt; trình diễn rồi ép khối mới; máy kiểm mùa 4: kiem-man-mua-4, kiem-lap-rap, kiem-may-son, kiem-drone-son, kiem-list, kiem-che-list,
  kiem-camera-*, kiem-lo-trinh (+ mục mùa 4), kiem-part-mua.

PHẠM VI: màn, lộ trình, lo-trinh-sao.js (đúng mục), máy kiểm mùa 4. KHÔNG sửa lõi (cần thì DỪNG báo), không sửa mùa 1–3.
PHẢN BIỆN, CÁCH GIAO, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: như brief PDM2a (`hoc/ban-giao/brief-PDM2a-mua-2-goi-1-4.md`).

BÀI HỌC ĐỢT MÙA 2 (người giao ghi): đợt nào cũng để lại hồi quy ở máy kiểm KHÔNG nằm trong danh sách (sổ lệnh so-lenh.js, kiem-khay, kiem-hoc, kiem-phim-goi,
kiem-huy-hieu-phim-vector, kiem-goi-doi, kiem-nut-bat-san…). Vì vậy: ĐƯỢC chạy `npm test` cả bộ (chạy nền, ghi ra tệp) sau mỗi gói và lần cuối trước báo cáo;
báo cáo ghi dòng kết quả nguyên văn. Gói mới cần phim gói tạm (phim-mua-N.js + chu.js) và hình huy hiệu nếu máy kiểm đòi.

LUẬT NHỊP GÓI 10 (PDM2c2 phát hiện): màn nhiều sân của gói 10 tính TỔNG nhịp mọi sân (nhipTheo "tong"), không theo sân dài nhất: theo sân dài nhất thì dãy viết cứng cho ngày khó nhất vẫn 3 sao mọi ngày. Bộ dò dayChung theo tổng phải không tìm ra dãy chung 3 sao.
