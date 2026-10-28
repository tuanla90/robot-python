NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút một commit; mỗi việc một commit. Sửa việc nào xem việc đó (trình duyệt hoặc trang xem). Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (CẤM npm test; RAM yếu; tệp dùng chung chỉ thêm). Đang chạy song song: gói 9 mùa 2 (man-be-sung.js, huy-hieu.js, so-lenh.js) và V6b (cỡ vật kẹp: san-ve.js, ve-vector*.js tay, ve-robot.js, phim-mua-1.js; title Xưởng hàm: xuong-ham.js; nhãn: chu.js; kiem-ve-vector.mjs, kiem-bang-mau.mjs). Cổng server tạm của bạn: 4204.

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 1, suy luận 1 = 6)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v6c-nut-mo-dau-phim, nhánh claude/ve-vector-nut-mo-dau-phim (từ 4ac900f: đã có V5a, V5b, V6, gói 8).

MỤC TIÊU (user 28/10: "button, cảnh mở màn, video cũng sang vector hết nhé"): xong khi ở `?ve=vector` KHÔNG còn hình điểm ảnh nào trong (1) MỌI NÚT, kể cả nút / icon trong màn chơi; (2) CẢNH MỞ MÀN (phim mở đầu mo-dau.js: mưa, xe chở linh kiện, đường, xưởng…); (3) PHIM (phim mở gói phim-goi.js, phim mùa 1 phim-mua-1.js): nền, khung, chữ, hoạt cảnh; pixel y nguyên từng điểm ảnh.

BỐI CẢNH (đọc hoc/KE-HOACH-GOP-DIEM10CODE.md các dòng trạng thái V5a, V6, V5b ngày 28/10, mục "→ V7"):
- V5b: hoc/game/ve-vector-icon.js (VeIcon.HINH, SVG theo vai) thay `.pxi` bằng MutationObserver CHỈ trong PHAM_VI = '#sc-dau,#sc-goi,#sc-chon,#sc-lap,#lop-hop,.md' → màn chơi #sc-choi còn icon điểm ảnh phóng (nút Chạy / Nhịp / Lại / Gợi ý, thẻ bộ phận trên khay, nút menu / xoá / thụt lề…). Icon `trum` và `mui` (mũi tên bong bóng) còn pixel.
- V6: hoc/game/phim-vector.js (PhimVector.ICON + ô / cờ / nút / cửa / sao) cho phim-goi.js; trùng 7 tên với VeIcon.HINH (denKepMo, denCam, denBanh, denXich, denXoay, box, reset): GỘP về MỘT bộ trong ve-vector-icon.js, phim-vector.js gọi lại bộ đó.
- Cảnh mở màn hoc/game/mo-dau.js (166 dòng) chưa chuyển: vẽ cảnh bằng Painter pixel (người giao thấy ở vector: nền xanh mưa sọc, xe tối, đường vạch vàng kiểu pixel trong khung phẳng). Vẽ lại các cảnh bằng bộ vẽ vector (VeVector, ô / vật / robot có sẵn, mắt biểu cảm), cùng tông lab trắng; giữ nội dung, lời, thứ tự khung, thời lượng.
- Phim (.md, .pg-*): choi-vector.css V5a đang GIỮ mực / kem pixel cho .md và loại .md khỏi luật prefers-reduced-motion (phim hiện từng hình theo animation-delay). Chuyển hẳn sang vector: nền / chữ / ô cảnh phẳng theo V5b (giao-dien-vector-b.css §7), tương phản AA; reduced-motion: hiện ngay mọi hình thay vì bỏ ngoại lệ thô. Mọi hình trong phim (kể cả ảnh nền cảnh, vật trang trí) vector.

VIỆC (mỗi việc một commit): 1 gộp hai bộ icon về ve-vector-icon.js · 2 bật icon vector cho màn chơi (#sc-choi vào PHAM_VI, vẽ thêm mọi icon còn thiếu kể cả trum, mui, icon thẻ bộ phận trong khay), soát mọi nút hai chế độ · 3 cảnh mở màn mo-dau.js vector · 4 phim: nền / khung / chữ .md vector + reduced-motion · 5 soát cả game ở vector bằng script trong trang: đếm phần tử còn `image-rendering: pixelated`, canvas Painter pixel, phông Handjet / VT323, ảnh nền điểm ảnh (tự kiểm script bằng lỗi giả trước khi tin), ghi kết quả từng màn · 6 máy kiểm + trang xem.

PHẠM VI: được sửa ve-vector-icon.js, phim-vector.js, mo-dau.js, phim-goi.js (chỉ chỗ icon / nền), ve.js (chỉ nhánh vector; GIỮ chữ ký Ve.mk(cv, s), Ve.hydrate và cầu nối huy hiệu của V6 trong huy-hieu.js), choi-vector.css và giao-dien-vector-b.css (luật .md / .pg-* / icon), choi.html (thêm script nếu cần), bang-mau.js (chỉ THÊM vai, khối "V6c"), tạo hoc/kiem-nut-mo-dau-phim-vector.mjs, thêm mục vào hoc/hinh-mau/xem-vector-v6.html. Cần THÊM tệp vào SUA_SAU_NEN của kiem-bang-mau.mjs hay danh sách NGOAI của kiem-ve-vector.mjs: được, chỉ thêm / bớt đúng dòng đó (V6b cũng thêm một dòng ở đó: người giao gộp tay).
KHÔNG sửa: luật, màn, lộ trình, nội dung lời phim, san-ve.js / ve-vector-tay-*.js / ve-robot.js / phim-mua-1.js / xuong-ham.js / chu.js (V6b), huy-hieu.js / so-lenh.js (gói 9). Nếu phim-mua-1.js cần đổi để nền / icon thành vector: ghi vào báo cáo, không sửa.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng). Quyết định của USER (không tự đi ngược): mọi thứ sang vector (nút, cảnh mở màn, phim); pixel giữ y nguyên tới V7 (V7 mới đổi mặc định rồi gỡ pixel); màu đội R1 #38BDF8 / R2 #F472B6; chữ không emoji / không gạch dài; luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-nut-mo-dau-phim-vector.mjs  ← máy kiểm mới: ở vector không icon .pxi điểm ảnh nào trong mọi màn (kể cả #sc-choi), mo-dau không gọi Painter pixel, phim .md không phông pixel / mực kem; một bộ icon (không tên trùng); `--loi-gia` đỏ
  node hoc/kiem-ve-vector.mjs               ← 92 đạt (mục 13a pixel phát lại khớp nền)
  node hoc/kiem-giao-dien-vector-b.mjs      ← 16 đạt
  node hoc/kiem-huy-hieu-phim-vector.mjs    ← 10 đạt
  node hoc/kiem-phim-goi.mjs                ← 33 đạt
  node hoc/kiem-bang-mau.mjs                ← 19 đạt
  Trình duyệt: `node -e "process.env.PORT='4204';import('./server.mjs')"` chạy nền, tắt ngay khi xem xong. LƯU Ý: game có service worker (sw.js, bộ đệm 'duong-hoc-v1') nên trình duyệt có thể chạy BẢN CŨ: mở trang lần đầu thì gỡ SW + xoá caches trong trang rồi tải lại, kiểm `document.styleSheets` có đủ choi-vector.css + giao-dien-vector-b.css. Ô trình duyệt có thể bị ẩn làm hoạt cảnh / tải trang đứng: dùng get_page_text / javascript thay ảnh chụp khi cần. Một tab của riêng bạn. Xem phim mở đầu, phim mở gói (tay-gap, hai-robot, robot), một màn chơi (omni.3, hai-robot.2) ở máy tính và 360 × 640; so `?ve=pixel`.

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI — đủ 5 mục: 1 KẾT QUẢ (SHA, tệp đổi, lệnh kiểm + kết quả nguyên văn, bảng phần · trước · sau · tệp, kết quả script soát từng màn). 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT cho V7 (còn chỗ nào phụ thuộc pixel). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
