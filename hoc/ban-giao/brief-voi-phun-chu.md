NHỊP (đọc trước): commit đầu tiên trong ~20 phút (vd tên gói / chương / huy hiệu trong lo-trinh-hoc.js + máy kiểm của nó); sau đó mỗi nhóm tệp một commit (vd mỗi 3–5 tệp màn); TỐI ĐA 40 phút một commit. CẤM dựng kiểm kê toàn bộ trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì: thà 10 tệp đúng có commit còn hơn 25 tệp không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

SONG SONG: agent "Vòi phun phần hình" (nhánh claude/voi-phun-hinh, brief hoc/ban-giao/brief-voi-phun-hinh.md) chạy cùng lúc, giữ các tệp vẽ: hoc/game/ve-vector*.js (kể cả ve-vector-tay-hoi.js với tên part "Súng hơi hai nòng" → "Vòi phun hai đầu"), san-ve.js, den-bo-phan.js, huy-hieu-vector.js, phim-vector.js, phim-mua-2.js, bang-mau.js, choi.css và các máy kiểm vẽ / phim / bảng màu. Bạn KHÔNG sửa các tệp đó. chu.js chia đôi: agent hình sửa khoá phim `pg.*`; bạn sửa mọi khoá khác. CẤM định dạng lại tệp, CẤM npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4205.

LOẠI: Ship          MODEL: opus (điểm: quy mô 2 (khoảng 25 tệp), choke 1 (chu.js, lời báo lỗi trong lõi), giá sai 1 (chữ sai trên màn), mơ hồ 1 (tách chữ hiển thị khỏi chú thích, chọn từ thay), suy luận 0 = 5)

MỤC TIÊU: xong khi người chơi KHÔNG còn thấy chữ "súng", "súng hơi", "bóng hơi", "bệ súng" ở bất kỳ đâu trong game (tên gói, chương, màn, huy hiệu, hướng dẫn, mô tả màn, Sổ lệnh, xưởng lắp ráp, lời báo lỗi / gợi ý khi chạy), thay bằng chữ của robot chữa cháy; luật, lệnh Python, mã nội bộ giữ nguyên; máy kiểm đạt.

BỐI CẢNH:
- User 29/10: cỗ máy mùa 2 là "Xe cứu hỏa R1", robot chữa cháy bánh xích (bỏ "xe tăng" vì chủ đề chiến tranh; hoc/KE-HOACH-7-MUA.md mục "Cỗ máy của mỗi mùa"). Sau đó user: "rà sửa chữ súng hơi thành vòi phun".
- BẢNG ĐỔI (người giao chọn; thấy chỗ nào đọc ngượng thì đề xuất trong báo cáo, đừng tự đổi khác bảng):
  | Cũ | Mới |
  |---|---|
  | súng hơi / Súng hơi | vòi phun / Vòi phun |
  | Súng hơi hai nòng | Vòi phun hai đầu |
  | nòng trước / nòng sau | đầu phun trước / đầu phun sau |
  | bóng hơi, quả bóng (của súng) | tia nước (hoặc "nước" khi ngắn gọn hơn) |
  | Bệ súng xích, bệ súng | Bệ vòi xích, bệ vòi |
  | đạn (số phát bắn) | lượt phun (hoặc "nước" nếu câu là "hết đạn" → "hết nước") |
  | bắn, bắn tụ, bắn nhanh, nút bắn, lực bắn | GIỮ ("bắn nước" vẫn tự nhiên) |
- GIỮ NGUYÊN: lệnh `shoot()`, `shoot_back()`, `shoot("fast")`, `shoot("charge")`; mã part `'hoi'`; mã gói / chương / màn / huy hiệu (`sung-hoi`, `che-sung-hoi`, `be-sung`, `che-be-sung`…); mã sự kiện, mã lỗi; tên hàm, biến, khoá; CHÚ THÍCH trong mã (chỉ đổi chữ người chơi thấy). Mã mẫu / lời giải Python của màn: tên hàm người chơi tự đặt có chữ súng (nếu có) thì đổi được, nhưng lời giải phải vẫn thắng đúng số sao.
- Nơi có chữ (người giao đếm thô, gồm cả chú thích, phải tự tách): man-be-sung.js 45, man-trum-mua-2.js 25, san-hoc.js 19, chu.js 12, lo-trinh-hoc.js 10, so-lenh.js 7, huong-dan-man.js 7, cham.js 7, man-rap-tay.js 6, man-rap-du.js 6, xuong-ham.js 6, man-doi-sung-hoi.js 5, thanh-phan.js 5, man-doi-mau.js 4, man-doi-thu-manh.js 3, man-che-sung-hoi.js 3, và 1–2 chỗ ở man-sung-hoi, man-doi-mua-2, man-do-nhiet, man-day-thung, man-che-luc-ban, lap-rap, gioi-thieu-part, man-xich, man-omni, man-luc-ban, man-hong-ngoai, man-bien-xich, kho-ham. Grep thêm "súng", "nòng", "đạn", "bóng" quanh chương súng hơi: số này là SÀN, không phải trần.
- Chữ trong lõi (san-hoc.js, cham.js): chỉ chuỗi người chơi đọc (thongDiep, lời gợi ý); máy kiểm nào khẳng định nguyên văn chuỗi cũ thì sửa máy kiểm theo (đừng nới máy kiểm).
- Câu hướng dẫn / mô tả màn đổi chữ xong phải còn đúng ngữ pháp, không dài hơn nhiều (màn hình 360 px).

PHẠM VI: được sửa hoc/man-*.js (chỉ chữ hiển thị), hoc/game/huong-dan-man.js, hoc/lo-trinh-hoc.js (tên gói / chương / huy hiệu hiển thị), hoc/san-hoc.js và hoc/cham.js (chỉ chuỗi hiển thị), hoc/so-lenh.js, hoc/gioi-thieu-part.js, hoc/lap-rap.js, hoc/kho-ham.js, hoc/game/thanh-phan.js, hoc/game/xuong-ham.js, hoc/game/chu.js (trừ `pg.*`), các máy kiểm màn / lộ trình khẳng định chữ cũ, hoc/KE-HOACH-MUA-2.md (ghi một dòng trạng thái đổi tên).
KHÔNG sửa: tệp của agent hình (xem SONG SONG), luật (logic) trong san-hoc.js, mã nội bộ.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): bằng chứng đọc sai, chữ thay đọc ngượng, chỗ bị bỏ sót, có cách đơn giản hơn. Kiểm lại từng khẳng định bằng code. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): Xe cứu hỏa R1; súng hơi → vòi phun; luật / lệnh giữ; chữ không emoji, không gạch dài.

TRƯỚC KHI SỬA: chuỗi hiển thị có thể bị máy kiểm hay mã khác so nguyên văn (vd tìm theo tên gói / tên huy hiệu): grep chuỗi đó trước khi đổi.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-lo-trinh.mjs
  node hoc/kiem-sung-hoi.mjs; node hoc/kiem-che-sung-hoi.mjs; node hoc/kiem-luc-ban.mjs; node hoc/kiem-che-luc-ban.mjs; node hoc/kiem-be-sung.mjs; node hoc/kiem-trum-mua-2.mjs; node hoc/kiem-doi-mua-2.mjs   (tên đúng: ls hoc/kiem-*.mjs; chạy máy kiểm của MỌI tệp màn bạn sửa)
  node hoc/kiem-lach-mua-2.mjs (nếu có), node hoc/kiem-so-lenh.mjs / kiem-lap-rap.mjs / kiem-huong-dan*.mjs (nếu có)
  Cuối cùng: grep chứng minh không còn chữ hiển thị nào (in phần còn lại, mỗi dòng là chú thích hay mã nội bộ, giải thích từng loại).
  Trình duyệt: `node -e "process.env.PORT='4205';import('./server.mjs')"` chạy nền, TẮT khi xem xong; `hoc/game/choi.html?debug=1`, Mở hết, xem bản đồ mùa 2 (tên gói), vào gói Vòi phun và Bệ vòi xích (tên chương, mô tả màn, hướng dẫn), mở Sổ lệnh và xưởng lắp ráp, chạy một lời giải sai để thấy lời báo lỗi mới; khổ 360 × 640: chữ không tràn; không lỗi console.

CÁCH GIAO: worktree riêng do Agent tool tạo; việc đầu tiên `git checkout -b claude/voi-phun-chu` và kiểm HEAD là main mới nhất (`git log --oneline -1 main`; nếu worktree tạo từ commit cũ hơn và chưa có commit nào thì `git reset --hard main`). Commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, tệp đổi, số chỗ đổi mỗi tệp, tên mới của gói / chương / huy hiệu, lệnh kiểm + kết quả nguyên văn, grep còn lại + giải thích, kết quả soát trình duyệt.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT (chữ thay đọc ngượng; tên gói nên khác; mỗi mục: vấn đề, phương án, nghiêng về đâu).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5. RỦI RO CÒN LẠI.
