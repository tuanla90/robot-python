NHỊP (đọc trước): commit đầu tiên trong ~20 phút (vd hình van ở trạng thái đóng / mở trên sân); sau đó mỗi nhóm việc một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi vẽ nét đầu tiên. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

SONG SONG: có thể có phiên khác đang gộp việc vào main; bạn làm trên nhánh riêng. CẤM định dạng lại tệp, CẤM npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4206.

LOẠI: Ship          MODEL: opus (điểm: quy mô 2 (tệp vẽ + khoảng 18 tệp có chữ "nút bắn"), choke 1 (san-ve.js vẽ sân chung, phanh nền vector), giá sai 1 (hình / chữ sai trên mọi màn mùa 2), mơ hồ 1 (tự thiết kế hình van), suy luận 0 = 5)

MỤC TIÊU: xong khi NÚT BẮN (ký hiệu N) trông và được gọi là một VAN HƠI ở mọi nơi người chơi thấy (sân, ảnh nhỏ, icon, huy hiệu, phim, đề bài, hướng dẫn, Sổ lệnh, lời báo lỗi), dây nối nút ↔ cửa / băng vẽ thành ỐNG HƠI; luật, lệnh, mã nội bộ giữ nguyên; máy kiểm đạt; xem được trong trình duyệt.

BỐI CẢNH:
- Quyết định user 29/10 (hoc/KE-HOACH-7-MUA.md, mục "Ý tưởng gói nội dung sau", dòng "Nút bắn là VAN HƠI"): nhà máy cũ chạy bằng hơi nước nóng. Nút N là van tay quay có CÁNH HỨNG NƯỚC gắn trên tường; tia nước của vòi phun đập vào cánh làm van quay nửa vòng: mở ↔ đóng (đúng luật đổi qua lại). Van MỞ thì hơi nóng chảy qua nên van NÓNG (`warm()` True), băng chuyền chạy bằng hơi, cửa khí nén đóng / mở. Phải phun từ xa vì van đang mở nóng bỏng. Tránh hình ảnh điện (nước với điện là bài học sai cho trẻ).
- Vừa gộp (main 4ae01d0): súng hơi đã thành VÒI PHUN (part, tia nước, chữ). Xem hoc/ban-giao/brief-voi-phun-hinh.md và brief-voi-phun-chu.md để biết cách làm và bảng đổi chữ đã dùng; làm cùng phong cách.
- Luật nút ở hoc/san-hoc.js mục SÚNG HƠI (dòng ~129–160): N đổi bat true ↔ false khi bị bắn trúng; điều khiển cửa thường và băng chuyền (cfg.noi); nút bật sẵn cfg.nutBat (gói Đo nhiệt); warm() True khi nút bật. Vẽ nút trên sân ở hoc/game/san-ve.js (nutO, bat, loe; dây nối V7a veDayNoi ~336–350; ảnh nhỏ thuOVec ~2201), icon trong ve-vector-icon.js, huy hiệu huy-hieu-vector.js, phim phim-vector.js (PhimVector.nutBan) / phim-mua-2.js.
- HÌNH: van tay quay tròn (bánh lái có nan) gắn trên mặt tường, có cánh hứng nước; trạng thái ĐÓNG: màu nguội, không hơi; MỞ: quay nửa vòng (hoạt cảnh quay khi đổi), có làn hơi trắng bốc lên nhẹ, quầng nóng (giữ ý quầng nóng hiện có của nút bật). Dây nối thành ống hơi (ống kim loại có khớp nối), có thể có vệt hơi chạy dọc khi mở. Màu qua hoc/game/bang-mau.js (thêm vai mới nếu cần), không viết mã màu cứng.
- CHỮ — bảng đổi (thấy chỗ nào đọc ngượng thì đề xuất trong báo cáo, đừng tự đổi khác bảng):
  | Cũ | Mới |
  |---|---|
  | nút bắn / Nút bắn | van hơi / Van hơi (lặp lại trong câu thì "van") |
  | nút (khi đang chỉ nút bắn N) | van |
  | nút bật / nút đang bật / bật nút | van mở / van đang mở / mở van |
  | nút tắt / tắt nút | van đóng / đóng van |
  | bắn trúng nút | bắn trúng van |
  - KHÔNG đổi: "nút đè" (ô M của mùa 1, là tấm đè trên sàn, khác van), nút giao diện (nút Chạy, nút ▶…), mã nội bộ (`nut`, `nutBat`, `nut-doi`, khoá chu.js, tên hàm), lệnh Python, chú thích trong mã.
  - Lời giải / mã mẫu của màn: tên hàm người chơi tự đặt có chữ nut (vd `hit_button`) GIỮ (đổi là đổi bài); chỉ đổi chữ hiển thị.
- Đếm thô của người giao: 18 tệp .js có "nút bắn", 23 chỗ trong man-*.js, chu.js, cham.js, lo-trinh-hoc.js, huong-dan-man.js, gioi-thieu-part.js, so-lenh.js. Grep thêm "nút" quanh chương mùa 2 (đề bài hay nói "nút" trơn): số này là SÀN.

PHẠM VI: được sửa tệp vẽ (san-ve.js chỉ phần vẽ, ve-vector*.js, huy-hieu-vector.js, phim-vector.js, phim-mua-2.js, bang-mau.js, choi.css chỉ thêm lớp), chữ hiển thị trong hoc/man-*.js, huong-dan-man.js, lo-trinh-hoc.js, thu-tu-chuong.js, san-hoc.js / cham.js (chỉ chuỗi hiển thị), so-lenh.js, gioi-thieu-part.js, lap-rap.js, chu.js, các máy kiểm khẳng định chữ / hình cũ, KE-HOACH-PHIM-GOI.md, KE-HOACH-MUA-2.md (một dòng trạng thái), KE-HOACH-7-MUA.md (dòng "Nút bắn là VAN HƠI": ghi đã làm).
KHÔNG sửa: logic luật, mã nội bộ, phim mùa 1, mo-dau.js.

PHANH: kiem-huy-hieu-phim-vector.mjs và kiem-ve-vector.mjs so hình với nền NEN_VEC (đọc dòng khai báo). Trước khi dời nền: in danh sách MỌI thứ lệch (bản sao tạm của máy kiểm, xoá sau), chứng minh chỉ chỗ có nút N / dây nối lệch; rồi dời nền sang commit của bạn, ghi lý do ở dòng khai báo như các lần trước. Không chứng minh được → dừng, hỏi.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng). Kiểm lại từng khẳng định bằng code (số dòng chỉ gần đúng). Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): nút bắn là van hơi; luật giữ; không hình ảnh điện; chữ không emoji, không gạch dài; luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-ve-vector.mjs (+ --loi-gia đỏ); node hoc/kiem-huy-hieu-phim-vector.mjs (+ --loi-gia đỏ); node hoc/kiem-nut-mo-dau-phim-vector.mjs; node hoc/kiem-phim-goi.mjs; node hoc/kiem-bang-mau.mjs
  node hoc/kiem-lo-trinh.mjs; node hoc/kiem-huong-dan.mjs; node hoc/kiem-hoc.mjs; node hoc/kiem-gioi-thieu-part.mjs
  máy kiểm của MỌI tệp màn bạn sửa (ls hoc/kiem-*.mjs; vd kiem-sung-hoi, kiem-che-sung-hoi, kiem-luc-ban, kiem-che-luc-ban, kiem-nha-may?, kiem-bang-chuyen, kiem-do-nhiet, kiem-be-sung, kiem-trum-mua-2, kiem-doi-mua-2, kiem-lach-mua-2)
  Cuối cùng: grep chứng minh không còn "nút bắn" hiển thị; phần còn lại giải thích từng loại.
  Trình duyệt: `node -e "process.env.PORT='4206';import('./server.mjs')"` chạy nền, TẮT khi xem xong; `hoc/game/choi.html?debug=1`, Mở hết. Mẹo nạp lời giải vào ô code: trong console `const m=ManHoc.timMa('luc-ban.2'); m.maMau=JSON.parse(JSON.stringify(m.loiGiai)); App.vaoMan('luc-ban.2')` rồi bấm Chạy / Nhịp. Xem: một màn bắn mở van (cửa mở, hơi bốc), một màn có băng chuyền nối van, một màn Đo nhiệt có van mở sẵn, ảnh nhỏ trên bản đồ / lưới màn, phim nha-may và do-nhiet; khổ 360 × 640; không lỗi console.

CÁCH GIAO: worktree riêng do Agent tool tạo; việc đầu tiên `git checkout -b claude/van-hoi` và kiểm HEAD là main mới nhất (`git log --oneline -1 main`, hiện 4ae01d0 hoặc mới hơn; nếu cũ hơn và chưa có commit nào thì `git reset --hard main`). Commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, tệp đổi, mọi chỗ đổi hình, bảng chữ đổi (số chỗ mỗi tệp), lệnh kiểm + kết quả nguyên văn, cách xử phanh nền, kết quả soát trình duyệt + đường dẫn ảnh.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT (mỗi mục: vấn đề, phương án, nghiêng về đâu).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5. RỦI RO CÒN LẠI.
