NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi bước một commit (10 bước dưới); TỐI ĐA 40 phút một commit. CẤM khảo sát lại toàn bộ: bản đồ đã có (Scout). Sửa bước nào kiểm bước đó. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (CẤM npm test; RAM yếu). Rồi BẢN ĐỒ: hoc/ban-giao/scout-go-pixel.md trong worktree của bạn (Scout 28/10, 13 phát hiện kèm tệp:dòng; số dòng có thể lệch sau các gói vừa gộp, tự dò lại). Rồi hoc/KE-HOACH-GOP-DIEM10CODE.md dòng "28/10 Scout gỡ pixel" (quyết định của người giao).

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 2 (ve.js / icon dùng khắp nơi, móc drawImage toàn cục), giá sai 1, mơ hồ 1, suy luận 2 = 8)

CHỖ LÀM: worktree D:Users	uanla2gamedoi-robot-chan-hung.claudeworktrees7b-mac-dinh-vector, nhánh claude/ve-vector-mac-dinh (ĐƯỜNG ĐÚNG: D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v7b-mac-dinh-vector; từ 4d14382: nhánh chính đã gộp V7a, gói 10, phim mùa 2; bạn chạy một mình, không agent nào khác).

MỤC TIÊU: xong khi mở game KHÔNG tham số là vector; pixel vẫn chạy được bằng `?ve=pixel` hay Cài đặt "Kiểu vẽ" (lựa chọn pixel được LƯU); năm cầu tạm C1–C5 gỡ hết, giao diện vector y như trước khi gỡ; gói Artifact có giao diện vector; máy kiểm đạt.

VIỆC (theo thứ tự Scout đề xuất, mỗi việc một commit):
  1. Mặc định vector: doCheDo trả vector trừ khi `?ve=pixel` hay đã lưu 'pixel'; luuCheDo('pixel') GHI 'pixel' (không xoá khoá). Ba máy dựng trang giả với địa chỉ rỗng (kiem-ve-vector, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau-phim-vector: Scout ghi dòng) đổi sang '?ve=pixel' cho phần so pixel; kiem-ve-vector mục 8, 14f sửa giả định mặc định.
  2. Nền tĩnh: theme-color choi.html, manifest (2 chỗ), dong-goi-artifact.py theo nền vector (lab trắng / chàm nhạt của choi-vector.css); cập nhật ghim ở kiem-bang-mau.mjs dòng ~72–78 cho khớp.
  3. Gói Artifact (hoc/dong-goi-artifact.py): gói thêm choi-vector.css, giao-dien-vector-b.css, mọi script vector, nhúng phông Google Sans Flex / Code có sẵn ở hoc/game/font (không gọi Google Fonts). Thêm máy kiểm nhỏ (Node, đọc nguồn tệp .py hay chạy `python -X utf8 -I hoc/dong-goi-artifact.py hoc/game <thư mục tạm trong scratchpad>` rồi soát tệp ra có đủ CSS / script / phông vector); lỗi giả đỏ.
  4. Hai lỗi cũ (người giao đã quyết): ở vector R1 luôn #38BDF8, bỏ qua sơn đã lưu (ve-robot.js sonChon / ve-vector.js mauDoi), mốc mở màu sơn giữ dữ liệu nhưng ẩn ở vector; "Biểu cảm mắt" có tác dụng ở vector (tắt thì mắt thường, chỉ chớp; san-ve.js bieuCam).
  5. Huy hiệu vector cho các mã gói 10 mùa 2 vừa thêm (tong-hop-2, nha-may-chay; máy kiểm V7a liệt kê mã HINH thiếu vector: phải đạt); thêm hai mã đó vào mảng HUY của hoc/game/phim-mua-2.js (phim gói 10 hiện vẽ icon trong khung tròn cho huy hiệu chưa có vector: gỡ đường tạm đó nếu mọi mã đã có vector). Màn 360 px: #stage phóng 1,2 làm khung phim tràn 12 px mỗi bên (cả mùa 1): sửa.
  6. Gỡ C4 (bọc Ve.mk / Ve.hydrate trong huy-hieu.js): các chỗ gọi Ve.mk(HuyHieu.ve(...)) đổi sang HuyHieu.mk.
  7. Gỡ C1 + C5: Ve.ico / sao / khoa / mui / hydrate ở vector trả thẳng svg (VeIcon), bỏ MutationObserver; một hằng PHAM_VI; sửa kiem-giao-dien-vector-b mục d (luật cũ "PHAM_VI không chứa #sc-choi"). ~90 chỗ gọi icon: soát từng chỗ cần canvas hay svg.
  8. Gỡ C2 (noiVe).
  9. Gỡ C3 (móc Part._veMot + drawImage toàn cục): thanh-phan.js gọi VeIcon.hinhPartVec; the-part.js tự chép .laVector.
  10. Nối giao-dien-vector-b.css vào cuối choi-vector.css NGUYÊN VĂN, giữ tiền tố body.ve-vector (bỏ tiền tố là đổi độ ưu tiên); choi.html, máy kiểm, dong-goi theo tên mới. choi.css GIỮ (nền bố cục chung).
  Icon app (hoc/game/icon/*.png): vẽ lại theo vector nếu xuất được PNG từ trang (canvas toDataURL qua javascript trong trình duyệt rồi ghi tệp); không xuất được thì ghi vào báo cáo cho V7c.

PHẠM VI: được sửa mọi tệp hoc/game/* cần cho 10 việc trên, choi.html, manifest, sw.js (chỉ nếu cần thêm tệp vào danh sách), hoc/dong-goi-artifact.py, máy kiểm liên quan (kiem-ve-vector, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau-phim-vector, kiem-giao-dien-vector-b, kiem-bang-mau SUA_SAU_NEN / ghim nền), trang xem. KHÔNG sửa: luật (san-hoc.js, cham.js), màn, lộ trình, nội dung phim / chữ (trừ nhãn cần cho việc 4). KHÔNG xoá bộ vẽ pixel (V7c): pixel phải y nguyên từng điểm ảnh qua `?ve=pixel` (mục 13a kiem-ve-vector giữ đạt).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; được phép và được khuyến khích nói ngược lại (có bằng chứng). Kiểm lại từng khẳng định của brief và của Scout bằng code. Quyết định của USER (không tự đi ngược): chuyển hẳn sang vector; đổi mặc định rồi mới gỡ pixel; màu đội R1 #38BDF8 / R2 #F472B6; chữ không emoji / không gạch dài; luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-ve-vector.mjs  (+ --loi-gia)
  node hoc/kiem-huy-hieu-phim-vector.mjs  (+ --loi-gia)
  node hoc/kiem-nut-mo-dau-phim-vector.mjs
  node hoc/kiem-giao-dien-vector-b.mjs
  node hoc/kiem-phim-goi.mjs
  node hoc/kiem-bang-mau.mjs
  node hoc/kiem-lap-rap.mjs
  node hoc/kiem-khay.mjs
  máy kiểm gói Artifact mới (việc 3)
  Trình duyệt: `node -e "process.env.PORT='4202';import('./server.mjs')"` chạy nền, tắt ngay khi xem xong; gỡ SW + xoá caches trước. Mở `choi.html` KHÔNG tham số (phải vector), `?ve=pixel` (phải pixel y cũ), Cài đặt đổi qua lại (lưu qua nạp lại); soát bằng script trong trang mọi màn hình chính + một màn chơi + phim: 0 icon .pxi điểm ảnh, 0 canvas pixel, 0 phông pixel ở vector (tự kiểm script bằng lỗi giả); không lỗi console; máy tính và 360 × 640.

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (ghi dần vào D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-V7b.md VÀ trong câu trả lời cuối) — đủ 5 mục: 1 KẾT QUẢ (SHA, tệp đổi, lệnh kiểm + kết quả nguyên văn, bảng cầu · trước · sau). 2 CÂU HỎI CẦN LÀM RÕ (kể cả brief / Scout sai chỗ nào). 3 ĐỀ XUẤT cho V7c (theo phương án C: V7c1 / V7c2 / V7c3). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
