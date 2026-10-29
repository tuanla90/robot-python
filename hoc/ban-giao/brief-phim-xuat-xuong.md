ĐỔI 29/10 (user, đã nhắn agent): mọi chỗ "Xe tăng R1" dưới đây đọc là "Xe cứu hỏa R1" (robot chữa cháy bánh xích); tên gói "Xe cứu hỏa R1 xuất xưởng"; thêm việc: bỏ chữ "xe tăng" trong pg.xich.2.

NHỊP (đọc trước): commit đầu tiên trong ~20 phút (vd hình tem XUẤT XƯỞNG trong phim-vector.js + phim gói 10 mùa 1); sau đó mỗi phim một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi viết dòng đầu tiên. Làm phim nào xem phim đó. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

SONG SONG: agent "Gói T màn trình diễn mùa 2" (nhánh claude/t-trinh-dien-mua-2) đang chạy, có thể sửa hoc/lo-trinh-hoc.js, hoc/game/chu.js, các tệp màn mùa 2. Bạn chỉ sửa ĐÚNG các dòng cần ở hai tệp dùng chung đó, CẤM định dạng lại. CẤM npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4203.

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (chu.js dùng chung, phanh B5-v), giá sai 0, mơ hồ 1 (vẽ tem, chia khung), suy luận 0 = 3)

MỤC TIÊU: xong khi phim gói 10 mùa 1 (`robot`) và mùa 2 (`nha-may-chay`) theo khuôn "cỗ máy xuất xưởng", phim gói 1 mùa 2 (`xich`) mở bằng ý "đơn việc", tên hiển thị gói 10 mùa 2 là "Xe tăng R1 xuất xưởng", các máy kiểm đạt và phim xem được trong trình duyệt không lỗi.

BỐI CẢNH:
- Quyết định user 29/10 (đọc hoc/KE-HOACH-PHIM-GOI.md mục 3c "Sợi dây chung 7 mùa", và hoc/KE-HOACH-7-MUA.md mục "Cỗ máy của mỗi mùa"): mỗi mùa R1 lắp một cỗ máy gần giống máy ngoài đời cho một nơi đang cần; gói 10 là cỗ máy đó XUẤT XƯỞNG, "end mùa nên kiểu giống mùa 1 xuất xưởng". Mùa 1 = Xe chở hàng R1 (kho hàng), mùa 2 = Xe tăng R1 (nhà máy).
- Khuôn phim gói 10 (mục 3c): (1) R1 đủ bộ giữa xưởng, huy hiệu mùa bay quanh; (2) TEM "XUẤT XƯỞNG" đóng lên, hiện tên cỗ máy và ba part ghép thành nó; (3) cỗ máy làm đúng việc ở nơi cần nó (việc kẹt ở phim gói 1 được gỡ); (4) nhá mùa sau.
- Việc cụ thể:
  a. Mùa 1 `robot` (hoc/game/phim-mua-1.js dòng ~414, khoá pg.robot.1–3 trong chu.js ~493): hiện 3 khung. Khung 2 (cửa xưởng mở) thêm tem XUẤT XƯỞNG + tên "Xe chở hàng R1"; lời khung 2 đổi theo. Còn lại giữ (khung 3 đã là "R1 lăn ra, nhá bánh xích"). Được thêm khung thứ 4 nếu thấy cần để tách "làm việc" khỏi "nhá mùa sau", nhưng không bắt buộc.
  b. Mùa 2 `nha-may-chay` (hoc/game/phim-mua-2.js dòng ~511, khoá pg.nha-may-chay.*): thành 4 khung theo khuôn: 1 đủ bộ + huy hiệu (giữ), 2 tem XUẤT XƯỞNG + "Xe tăng R1" (xích, súng hơi, mắt hồng ngoại), 3 nhà máy chạy lại (ý khung 2 cũ: việc được gỡ), 4 nhá mùa 3 (ý khung 3 cũ: chân nhện, nam châm, sóng từ; mùa 3 sẽ là xe thăm dò quặng ở mỏ, được gợi nhẹ).
  c. Mùa 2 `xich` khung 1 (pg.xich.1): thêm ý ĐƠN VIỆC: nhà máy cũ đứng im ở xa, cần một cỗ máy khỏe (vd thêm hình nhà máy im lìm xa xa; lời ≤ 14 từ). Không đổi khung 2–4.
  d. Tên hiển thị gói 10 mùa 2: hoc/lo-trinh-hoc.js dòng ~642 `ten: 'Nhà máy chạy lại'` → 'Xe tăng R1 xuất xưởng' (mã gói giữ `nha-may-chay`). Grep mọi nơi hiển thị / máy kiểm khẳng định tên cũ ("Nhà máy chạy lại") và sửa chỗ hiển thị; chú thích lịch sử trong mã và tệp ban-giao/ để nguyên.
- Bộ máy phim: hoc/game/phim-goi.js (PhimGoi; c.xe, c.nen, c.dat, c.chu, c.sau, c.keu…). Hình vector của phim: hoc/game/phim-vector.js (PhimVector.*). Game đã chỉ còn VECTOR (V7c gỡ pixel): đừng làm nhánh pixel.
- Tem: một con dấu chữ nhật / tròn chữ "XUẤT XƯỞNG" đóng xuống (hoạt cảnh rơi + lắc nhẹ + tiếng), kèm bảng tên cỗ máy và ba icon part. Vẽ trong phim-vector.js (hàm MỚI, dùng chung cho mùa sau: tên máy và danh sách part là tham số). Màu lấy theo bảng màu có sẵn (hoc/game/bang-mau.js; thêm vai màu mới vào khối phim nếu cần, kiem-bang-mau phải đạt). Chữ trong tem qua chu.js (khoá mới, vd pg.tem.xuat-xuong), không viết cứng trong JS.
- Mẫu tốt để xem: brief phim mùa 2 trước đó hoc/ban-giao/brief-phim-mua-2.md (luật phim: 3–4 khung, mỗi khung một câu ≤ 14 từ, khoá pg.<mã gói>.<n>).

PHẠM VI: được sửa hoc/game/phim-mua-1.js (chỉ phim `robot`), hoc/game/phim-mua-2.js (chỉ `xich` khung 1 và `nha-may-chay`), hoc/game/phim-vector.js (THÊM hàm), hoc/game/chu.js (chỉ khoá pg.robot.*, pg.xich.1, pg.nha-may-chay.*, khoá tem mới), hoc/lo-trinh-hoc.js (một dòng tên), hoc/game/bang-mau.js (+ kiem-bang-mau.mjs nếu cần), CSS hoạt cảnh tem trong hoc/game/choi.css (chỉ thêm lớp mới), các máy kiểm phim (hoc/kiem-phim-goi.mjs, hoc/kiem-huy-hieu-phim-vector.mjs, hoc/kiem-nut-mo-dau-phim-vector.mjs) khi cần, hoc/KE-HOACH-PHIM-GOI.md (cập nhật bảng kịch bản mùa 1 gói 10 và mùa 2 gói 1, 10 cho khớp).
KHÔNG sửa: phim khác, mo-dau.js, phim-goi.js (trừ khi bộ máy THIẾU điều cần: sửa tối thiểu, ghi rõ), luật, màn, ve-robot.js, ve-vector*.js, huy-hieu*.js.

PHANH B5-v: hoc/kiem-huy-hieu-phim-vector.mjs B5-v so cây DOM + lệnh vẽ của MỌI khung MỌI phim với commit nền NEN_VEC (dòng ~32). Sửa phim thì B5-v sẽ đỏ ĐÚNG ở các phim bạn sửa: đọc chú thích đầu tệp xem cách có sẵn để ghi nhận thay đổi cố ý (danh sách miễn / dời nền). Cách bạn chọn phải giữ được: phim KHÔNG sửa vẫn bị so y nguyên. Không có cách nào sạch → dừng, hỏi. Ghi rõ trong báo cáo đỏ nào là cố ý.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): bằng chứng đọc sai, có cách đơn giản hơn, lỗ bị bỏ sót. Kiểm lại từng khẳng định ở đây bằng code (số dòng chỉ là gần đúng). Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): khuôn xuất xưởng mục 3c; tên "Xe chở hàng R1", "Xe tăng R1", "Xe tăng R1 xuất xưởng"; chữ không emoji, không gạch dài; mỗi khung một câu ≤ 14 từ; luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

TRƯỚC KHI SỬA: không cần GitNexus (dữ liệu phim + chữ). Nếu phải sửa hàm dùng chung trong phim-goi.js thì grep mọi nơi gọi trước.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-phim-goi.mjs                 ← hiện ĐẠT 41; `--loi-gia` phải đỏ
  node hoc/kiem-huy-hieu-phim-vector.mjs     ← B5-v: chỉ đỏ cố ý đã ghi nhận theo cách trên
  node hoc/kiem-nut-mo-dau-phim-vector.mjs
  node hoc/kiem-bang-mau.mjs
  node hoc/kiem-ve-vector.mjs
  node hoc/kiem-lo-trinh.mjs                 ← vì đổi tên gói
  Trình duyệt: `node -e "process.env.PORT='4203';import('./server.mjs')"` chạy nền, TẮT ngay khi xem xong; `hoc/game/choi.html?debug=1`, Mở hết, xem ba phim (▶ trên hộp gói, hoặc Cài đặt "Xem lại phim các gói"); Bỏ qua, chạm khung; không lỗi console; khổ máy tính và 360 × 640 (tem không tràn, chữ không đè).

CÁCH GIAO: nhánh claude/phim-xuat-xuong trong worktree riêng (Agent tool đã tạo). Commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, tệp đổi, bảng ba phim (gói · khung · lời), lệnh kiểm + kết quả nguyên văn, cách xử B5-v, kết quả soát trình duyệt.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT (vd tem dùng lại cho mùa 3+; phim gói 1 mùa 1 có cần "đơn việc" không; mỗi mục: vấn đề, phương án, nghiêng về đâu).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5. RỦI RO CÒN LẠI.
