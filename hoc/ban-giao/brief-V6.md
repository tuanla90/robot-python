NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút một commit; mỗi phần một commit. Sửa phần nào xem trình duyệt phần đó. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (4 agent chạy song song; CẤM npm test; cổng của bạn 4202; tệp dùng chung).

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1, giá sai 1, mơ hồ 1, suy luận 1 = 5)

MỤC TIÊU: xong khi ở `?ve=vector` HUY HIỆU và PHIM (phim mở gói + phim mùa 1) vẽ bằng bộ vẽ vector (robot, bộ phận, ô, vật, icon), robot trong phim dùng mắt biểu cảm, thùng nằm đúng trong kẹp; huy hiệu chưa có bản vector tự rơi về pixel không lỗi; chế độ pixel y nguyên từng điểm ảnh.

BỐI CẢNH:
- Bộ vẽ vector V1–V4 đã xong (ve-vector.js, ve-vector-*.js, ve-robot.js `VeRobot.veCo`, ve-vector-hieu-ung.js mắt biểu cảm: chớp, vui "^ ^", ngạc nhiên, buồn…). V5a (giao diện màn chơi, nhánh claude/ve-vector-giao-dien-a) thêm phông Google Sans Flex / Code, `VeRobot.PHONG_NGOAI_SAN` ×1,2; nhánh của bạn tạo từ đầu nhánh đó (fa3702f). Đọc `git log --stat 0e1f4a8..fa3702f`.
- Việc còn nợ ghi ở hoc/KE-HOACH-GOP-DIEM10CODE.md: "→ V6: huy-hieu.js gọi thẳng `Part.ghep` (luôn pixel)"; "→ V6: `phim-mua-1.js` hằng VAT = 57 chưa theo veCo (thùng lệch kẹp ở vector)". Phim dùng được biểu cảm mắt (theo khung truyện: vui khi xong, ngạc nhiên khi gặp chuyện…). Icon `.pxi` trong phim-goi.js / phim-mua-1.js sang vector (cùng cách gói V5b làm cho các màn khác: nếu cần một hàm vẽ icon chung, đặt nó trong tệp MỚI của bạn và ghi rõ trong báo cáo để V5b / người giao gom sau).
- Kế hoạch phim: hoc/KE-HOACH-PHIM-GOI.md. Tệp: hoc/game/huy-hieu.js (770 dòng, `HINH[...]` hình từng huy hiệu kiểu Painter pixel), hoc/game/phim-goi.js, hoc/game/phim-mua-1.js.

PHẠM VI: được sửa huy-hieu.js (cách vẽ + thêm bản vector; KHÔNG định dạng lại / sắp lại các `HINH[...]` có sẵn: gói 8, 9 mùa 2 đang thêm huy hiệu mới kiểu pixel song song, nên đường vẽ vector phải tự rơi về pixel cho huy hiệu chưa có bản vector), phim-goi.js, phim-mua-1.js, tệp mới hoc/game/ve-vector-huy-hieu.js / ve-vector-phim.js nếu cần (thêm thẻ script vào choi.html), bang-mau.js (chỉ THÊM vai, khối riêng "V6"), tạo hoc/kiem-huy-hieu-phim-vector.mjs, tạo trang xem hoc/hinh-mau/xem-vector-v6.html (mọi huy hiệu pixel | vector cạnh nhau, vài khung phim mỗi gói).
KHÔNG sửa: luật, màn, lộ trình, nội dung / lời thoại phim (chỉ cách vẽ), CSS giao diện (choi-vector.css, giao-dien-vector-b.css, choi.css: V5a / V5b), hoc/kiem-ve-vector.mjs, hoc/hinh-mau/xem-vector.html (V5b đang thêm mục).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại. Bất đồng chặn đường → dừng, commit WIP, ghi rõ. Quyết định của USER (không tự đi ngược): chuyển hẳn sang vector, pixel giữ y nguyên tới hết V6, màu đội R1 #38BDF8 / R2 #F472B6, màu đội ở kính + mắt + chấm ăng-ten, camera là khối ống kính ở đuôi (mắt chỉ để biểu cảm), chữ không emoji / không gạch dài.

TRƯỚC KHI SỬA: GitNexus impact (repo = D:\Users\tuanla2\game\doi-robot-chan-hung) cho symbol sắp sửa (HuyHieu.*, các hàm phim); risk HIGH/CRITICAL → dừng, báo.

KIỂM TRA (tại worktree của bạn, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-huy-hieu-phim-vector.mjs  ← máy kiểm mới: mọi huy hiệu vẽ được ở cả hai chế độ (không ném lỗi), huy hiệu có bản vector không gọi Part.ghep ở vector, phim vector không dùng hằng cỡ pixel; `--loi-gia` cắm lỗi giả phải đỏ
  node hoc/kiem-ve-vector.mjs             ← giữ đạt (pixel: phát lại lệnh vẽ khớp nền)
  node hoc/kiem-bang-mau.mjs              ← pixel y nguyên
  npm test -- hoc/kiem-phim               ← chỉ các máy kiểm phim có sẵn (lọc theo chuỗi), nếu có
  Trình duyệt: `node -e "process.env.PORT='4202';import('./server.mjs')"` chạy nền; trang xem-vector-v6.html; trong game `choi.html?ve=vector` mở bảng huy hiệu và vài phim (phim mở gói tay-gap, hai-robot, robot; phim mùa 1) ở máy tính và 360 × 640; so `?ve=pixel`.

BÁO CÁO CUỐI — đủ 5 mục: 1 KẾT QUẢ (nhánh + SHA, tệp đổi, lệnh kiểm + kết quả nguyên văn, bảng phần · trước · sau · tệp, danh sách huy hiệu còn pixel). 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT cho V7 (đổi mặc định sang vector, gỡ pixel: những chỗ nào còn phụ thuộc pixel). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
