NHỊP (đọc trước): commit đầu tiên trong ~20 phút (vd hình part vòi phun trong ve-vector-tay-hoi.js); sau đó mỗi nhóm hình một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi vẽ nét đầu tiên. Vẽ cái nào xem cái đó. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

SONG SONG (cập nhật 29/10 chiều, lần giao thứ hai: lần đầu agent dừng khi phiên kết thúc, không commit gì): gói T đã gộp. Agent "Vòi phun phần chữ" (nhánh claude/voi-phun-chu, brief hoc/ban-giao/brief-voi-phun-chu.md) chạy song song, giữ các tệp màn hoc/man-*.js, huong-dan-man.js, lo-trinh-hoc.js, san-hoc.js, cham.js, so-lenh.js, gioi-thieu-part.js, lap-rap.js, kho-ham.js, thanh-phan.js, xuong-ham.js và các máy kiểm màn. Bạn KHÔNG sửa các tệp đó. chu.js chia đôi: bạn chỉ sửa khoá phim `pg.*`; agent chữ sửa mọi khoá khác. Tên hiển thị part trong ve-vector-tay-hoi.js (`ten: 'Súng hơi hai nòng'`) là của BẠN: đổi thành 'Vòi phun hai đầu' (grep máy kiểm vẽ / lắp ráp khẳng định tên cũ và sửa theo). CẤM định dạng lại tệp, CẤM npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4204.

LOẠI: Ship          MODEL: opus (điểm: quy mô 1 (khoảng 6–8 tệp vẽ), choke 1 (san-ve.js đường vẽ sân chung), giá sai 1 (hình sai trên mọi màn mùa 2), mơ hồ 1 (tự thiết kế hình vòi phun và tia nước), suy luận 1 = 5)

MỤC TIÊU: xong khi part "súng hơi" trong game TRÔNG như một VÒI PHUN NƯỚC (robot chữa cháy), phát bắn trông như NƯỚC phun (không còn quả bóng vàng / khẩu súng), ở mọi nơi vẽ: robot trên sân, xưởng lắp ráp, đèn bộ phận, icon, huy hiệu, phim; luật và lệnh Python giữ nguyên; máy kiểm đạt; xem được trong trình duyệt.

BỐI CẢNH:
- User 29/10: cỗ máy mùa 2 đổi từ "xe tăng" (chủ đề chiến tranh) sang "Xe cứu hỏa R1", robot chữa cháy bánh xích (hoc/KE-HOACH-7-MUA.md mục "Cỗ máy của mỗi mùa"). Sau đó user: "rà sửa chữ súng hơi thành vòi phun, sửa lại animation". Gói này lo PHẦN HÌNH + HOẠT CẢNH + chữ trong phim; phần chữ trong màn / hướng dẫn / lời báo lỗi là gói sau.
- GIỮ NGUYÊN: luật (hoc/san-hoc.js), lệnh `shoot()`, `shoot_back()`, `shoot("fast")`, `shoot("charge")`, mã part `'hoi'`, mã gói / chương / huy hiệu (`sung-hoi`, `luc-ban`, `be-sung`…), mã sự kiện (`ban`, `be-sung`…). Trong tiếng Việt "bắn nước" vẫn tự nhiên nên chữ "bắn" được giữ; chỉ bỏ hình ảnh và chữ "súng".
- Part hiện là "Súng hơi hai nòng" (hoc/game/ve-vector-tay-hoi.js dòng ~19: nòng trước ở mũi, nòng sau ở đuôi cho shoot_back). Thành **vòi phun hai đầu**: đầu phun trước, đầu phun sau, có bình nước / ống dẫn trên thân; giữ đúng điểm neo, miệng nòng (mz, mzs trong san-ve.js ~959) để tia xuất phát đúng chỗ.
- Viên đạn: "BÓNG HƠI" vàng (hoc/game/ve-vector-vat.js ~44, có trạng thái bẹp khi đập) → **khối nước / tia nước** xanh nước (đầu tia tròn, vệt nước phía sau; đập vào vật thì tóe giọt). `shoot("fast")` (bay 2 ô rồi rơi) = tia ngắn rơi thành vũng / giọt; `shoot("charge")` (tới vật cản đầu tiên, giật lùi) = tia mạnh dài hơn. Giật lùi của xe giữ như cũ (vòi rồng thật cũng giật).
- Thẻ số đạn (hoc/game/ve-vector-hieu-ung.js ~350, "quả bóng vàng nhỏ ×n") → giọt nước ×n (hoặc vạch bình nước).
- Đèn bộ phận (hoc/game/den-bo-phan.js) và icon (VeIcon: denSung…): icon súng → vòi phun. Phim xuất xưởng vừa thêm `PhimVector.voiPhun` (hoc/game/phim-vector.js): xem và dùng lại / thống nhất một hình.
- Huy hiệu (hoc/game/huy-hieu-vector.js ~352–361): be-sung, tong-hop-2, nha-may-chay, và mọi huy hiệu mùa 2 có vẽ súng / bóng: đổi sang vòi + nước.
- Phim mùa 2 (hoc/game/phim-mua-2.js; chữ chu.js `pg.sung-hoi.*`, `pg.luc-ban.*`, `pg.be-sung.*`, và bất kỳ `pg.*` nào nói súng / bóng hơi): hình súng / bóng → vòi / nước; lời bỏ chữ "súng", "bóng hơi" (vd "Sau đống thùng có một vòi phun nằm lăn lóc."), mỗi câu ≤ 14 từ. Tên "Bệ súng xích" trong lời phim → "Bệ vòi xích" (tên gói hiển thị đổi ở gói sau, cùng tên này).
- Màu: lấy vai màu có sẵn trong hoc/game/bang-mau.js hoặc THÊM vai mới (khối của part / hiệu ứng), không viết mã màu cứng; kiem-bang-mau phải đạt. Có sáng / tối thì theo cách bảng màu đang làm.
- Game đã chỉ còn VECTOR (không có nhánh pixel).

PHẠM VI: được sửa hoc/game/ve-vector-tay-hoi.js, ve-vector-vat.js, ve-vector-hieu-ung.js, san-ve.js (chỉ phần vẽ súng / bóng / thẻ đạn, không đổi logic đồng bộ sự kiện), den-bo-phan.js, ve-vector-icon.js (nếu icon nằm đó), huy-hieu-vector.js (chỉ huy hiệu có súng / bóng), phim-vector.js, phim-mua-2.js, chu.js (chỉ khoá phim pg.* và tên part hiển thị nếu nằm trong chu.js), bang-mau.js, choi.css (chỉ thêm lớp), các máy kiểm vẽ khi cần (kiem-ve-vector.mjs, kiem-huy-hieu-phim-vector.mjs: nền B5-v / A3-v, kiem-bang-mau.mjs…), KE-HOACH-PHIM-GOI.md (bảng kịch bản mùa 2 cho khớp lời mới).
KHÔNG sửa: các tệp của agent chữ (xem SONG SONG), phim mùa 1, mo-dau.js.

PHANH: kiem-huy-hieu-phim-vector.mjs A3-v / B5-v so mọi huy hiệu, mọi khung phim với nền NEN_VEC (đọc dòng khai báo; main đã dời mấy lần). Đổi hình CỐ Ý sẽ đỏ đúng ở chỗ có súng / bóng: trước khi dời nền, in danh sách MỌI thứ lệch (bản sao tạm của máy kiểm, xoá sau) và chứng minh chỉ những chỗ có súng / bóng / vòi lệch; rồi dời NEN_VEC sang commit của bạn, ghi lý do trong chú thích như các lần trước. kiem-ve-vector.mjs có thể có phanh ảnh mẫu tương tự: xử cùng cách. Không chứng minh được "chỉ chỗ cố ý lệch" → dừng, hỏi.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): bằng chứng đọc sai (số dòng chỉ gần đúng), có cách đơn giản hơn, chỗ vẽ súng / bóng bị bỏ sót. Kiểm lại từng khẳng định bằng code. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): Xe cứu hỏa R1, súng hơi → vòi phun, sửa hoạt cảnh; luật / lệnh giữ; chữ không emoji, không gạch dài; luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

TRƯỚC KHI SỬA: grep mọi nơi gọi hàm vẽ bạn đổi (đặc biệt hàm dùng chung trong san-ve.js / ve-vector*.js) trước khi đổi chữ ký; tốt nhất KHÔNG đổi chữ ký, chỉ đổi phần thân vẽ.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-ve-vector.mjs
  node hoc/kiem-huy-hieu-phim-vector.mjs     (+ --loi-gia phải đỏ)
  node hoc/kiem-nut-mo-dau-phim-vector.mjs
  node hoc/kiem-phim-goi.mjs                 (+ --loi-gia phải đỏ)
  node hoc/kiem-bang-mau.mjs
  node hoc/kiem-lap-rap.mjs                  (xưởng lắp ráp, nếu tồn tại)
  node hoc/kiem-sung-hoi.mjs; node hoc/kiem-luc-ban.mjs; node hoc/kiem-be-sung.mjs   (màn mùa 2 vẫn chấm đúng; bạn không đổi luật nên phải giữ nguyên)
  grep mọi máy kiểm có so tên part "Súng hơi hai nòng" trước khi đổi tên hiển thị part.
  Trình duyệt: `node -e "process.env.PORT='4204';import('./server.mjs')"` chạy nền, TẮT khi xem xong; `hoc/game/choi.html?debug=1`, Mở hết, chơi bằng lời giải: sung-hoi.1 (shoot, giật lùi), một màn shoot_back, luc-ban (fast / charge), be-sung.1 (bệ không giật), một màn trùm mùa 2; xem xưởng lắp ráp gắn part; xem phim sung-hoi, luc-ban, be-sung, nha-may-chay; khổ máy tính và 360 × 640; không lỗi console. Chụp ảnh trước / sau part và phát bắn để đưa vào báo cáo (đường dẫn tệp ảnh).

CÁCH GIAO: worktree riêng do Agent tool tạo; việc đầu tiên `git checkout -b claude/voi-phun-hinh` và kiểm HEAD là main mới nhất (nếu worktree tạo từ commit cũ hơn main thì `git reset --hard main` khi chưa có commit nào). Commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, tệp đổi, danh sách mọi chỗ đã đổi hình (part, đạn, thẻ đạn, đèn, icon, huy hiệu, phim), lời phim mới, lệnh kiểm + kết quả nguyên văn, cách xử phanh nền, kết quả soát trình duyệt + ảnh.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: chỗ hình súng / bóng còn sót (nếu có), và chỗ chữ "súng" còn hiển thị trong tệp của bạn mà bạn không chắc nên đổi.
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5. RỦI RO CÒN LẠI.
