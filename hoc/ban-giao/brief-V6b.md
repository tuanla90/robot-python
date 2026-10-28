NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút một commit; mỗi việc một commit. Sửa việc nào xem trình duyệt việc đó. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (CẤM npm test; RAM yếu; tệp dùng chung chỉ thêm). Lúc này còn chạy song song: gói 9 mùa 2 (man-be-sung.js, huy-hieu.js thêm hình, so-lenh.js). Cổng server tạm của bạn: 4203.

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (san-ve.js đường vẽ chung), giá sai 1, mơ hồ 1, suy luận 1 = 5)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v6b-thung-nhan, nhánh claude/ve-vector-thung-nhan (từ 0f39630: đã có V5a, V5b, V6).

MỤC TIÊU: xong khi (1) ở vector, vật trong kẹp TO RA khi nâng và thu về cỡ nằm sàn khi hạ / đặt, trên sân lẫn trong phim; (2) bốn nút chỉ icon của Xưởng hàm có title; (3) nhãn nút "Menu", "Ẩn", "Cài đặt" nói nút LÀM GÌ; chế độ pixel y nguyên từng điểm ảnh; máy kiểm đạt.

VIỆC 1 — CỠ VẬT KHI KẸP (user 28/10 chốt "Nâng lên to ra"):
- Hiện trạng người giao đo (màn tay-gap.1, `?ve=vector`): thùng nằm sàn ≈ 57% cạnh ô (san-ve.js `coVatDat` vector 10,5 pixel sân, thân vẽ trong hộp 12..88 của ve-vector-vat.js / ve-vector-o.js); kẹp nâng lên CO còn ≈ 24% (VeVector.vatKep: `tay.vatKep.canh` 28 × CO_THAN 0,86 trong ve-vector-tay-kep.js / ve-vector.js dòng ~310; san-ve.js dòng ~1072 vẽ vật kẹp). Ô nhỏ 14–24 px thì vật kẹp chỉ 3–6 px, nhìn như biến mất. Bản pixel thì ngược lại: vật nâng TO hơn sàn ~1,25 lần (sàn 8, kẹp 10 trong ô 14; tư thế dưới ×0,9).
- Cần: ở vector làm như tinh thần bản pixel. Vật nằm sàn giữ ≈ 57%. Tay HẠ (tư thế 'duoi', vừa kẹp / sắp thả) vật bằng cỡ sàn. Tay NÂNG vật to dần tới ≈ 1,15–1,25 lần cỡ sàn (gần camera hơn), chuyển cỡ MƯỢT theo hoạt cảnh nâng / hạ (V4 đã có chuyển tư thế mượt). Bóng đổ của vật nâng lệch / mờ hơn cho thấy vật đang ở trên cao. Càng kẹp phải ÔM vật ở cỡ mới (mở rộng khe kẹp theo cỡ vật, hai càng không xuyên vật), tay xoay (`vatXoay`) và các tay khác có vatKep (nam châm hút vật sắt, gáo ném nếu có) theo cùng luật. Không đổi luật chơi / vị trí ô / vết.
- Phim: phim-mua-1.js (V6 đã đổi VAT theo `VeRobot.vatKep` × cỡ ô) phải tự theo cỡ mới; phim kho-hang.3 thùng đặt lên nút phải về đúng cỡ sàn.
- Người giao đã thử: bấm Nhịp / Chạy trong ô trình duyệt bị ẩn thì hoạt cảnh có thể đứng; nếu vậy đọc trạng thái trong trang hoặc dùng trang xem (thêm mục "vật kẹp: sàn / hạ / nâng" cho kẹp, tay xoay, nam châm vào hoc/hinh-mau/xem-vector.html hoặc xem-vector-v6.html).

VIỆC 2 — Xưởng hàm: bốn nút chỉ icon trong hoc/game/xuong-ham.js (về, lấy lại, xoá hàm, xoá hết) thêm title (cả hai chế độ; nhãn nói nút làm gì, nút nào đã có aria-label thì title trùng nghĩa). xuong-ham.js chưa có trong SUA_SAU_NEN của hoc/kiem-bang-mau.mjs: được THÊM 'xuong-ham.js' vào danh sách đó (một dòng, ghi lý do như các dòng khác).

VIỆC 3 — Nhãn nút trong hoc/game/chu.js: 'choi.menu' "Menu" (nút mở bảng menu trong màn chơi), nhãn "Ẩn" (tìm khoá đúng), "Cài đặt" của nút bánh răng: đổi nhãn aria / title cho nói nút làm gì (vd "Mở menu", "Ẩn bảng …", "Mở cài đặt") — đọc onClick để biết thật nút làm gì; chữ HIỂN THỊ trên nút (nếu có chữ) giữ ngắn như cũ, chỉ đổi nhãn đọc màn hình / title khi chữ hiển thị phải giữ. Liệt kê mọi chỗ đổi.

PHẠM VI: được sửa san-ve.js (chỉ phần vẽ vật kẹp ở nhánh vector), ve-vector.js (vatKep / vatXoay), ve-vector-tay-*.js (khe kẹp), ve-robot.js (cầu vatKep nếu cần), phim-mua-1.js (chỉ chỗ cỡ vật), xuong-ham.js (title), chu.js (nhãn), kiem-bang-mau.mjs (chỉ thêm SUA_SAU_NEN), kiem-ve-vector.mjs (thêm kiểm: vector cỡ vật nâng > cỡ sàn > ... và tư thế dưới = cỡ sàn; lỗi giả), trang xem. KHÔNG sửa: luật (san-hoc.js, cham.js), màn, lộ trình, CSS giao diện, huy-hieu.js / so-lenh.js (gói 9 đang thêm).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng). Quyết định của USER (không tự đi ngược): vật nâng lên TO ra; chuyển hẳn sang vector, pixel giữ y nguyên tới V7; chữ không emoji / không gạch dài.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-ve-vector.mjs            ← nền 92 đạt; mục 13a (pixel phát lại khớp nền a962f7b) PHẢI giữ đạt = pixel y nguyên
  node hoc/kiem-ve-vector.mjs --loi-gia  ← lỗi giả mới đỏ
  node hoc/kiem-bang-mau.mjs             ← 19 đạt
  node hoc/kiem-huy-hieu-phim-vector.mjs ← 10 đạt
  node hoc/kiem-phim-goi.mjs             ← 33 đạt
  node hoc/kiem-giao-dien-vector-b.mjs   ← 16 đạt
  Trình duyệt: `node -e "process.env.PORT='4203';import('./server.mjs')"` chạy nền, tắt ngay khi xem xong; `choi.html?ve=vector&debug=1&man=tay-gap.1` (kẹp), một màn tay xoay (tay-xoay.*), một màn nam châm (nam-cham.*), phim kho-hang.3 và tay-gap; so `?ve=pixel`. Một tab của riêng bạn.

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI — đủ 5 mục: 1 KẾT QUẢ (SHA, tệp đổi, lệnh kiểm + kết quả nguyên văn, bảng cỡ vật: tay · sàn · hạ · nâng (% cạnh ô) trước / sau, danh sách nhãn đổi cũ → mới). 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai). 3 ĐỀ XUẤT cho V7. 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
