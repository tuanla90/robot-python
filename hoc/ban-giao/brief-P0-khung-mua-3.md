NHỊP (đọc trước): commit đầu trong ~25 phút (mảng MUA_3 với 2–3 gói đầu dựng được, máy kiểm cũ còn xanh); sau đó TỐI ĐA 40 phút một commit. CẤM khảo sát toàn bộ 200 màn trước khi viết dòng đầu tiên: dựng khung trước, đo sau. Hết sức thì dừng và báo còn gì: thà 6 gói đúng có commit còn hơn 10 gói không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: hoc/ban-giao/luat-song-song.md (RAM: CẤM `npm test` cả bộ, chạy từng máy kiểm một; server tạm chỉ cổng 4205, tắt ngay khi xem xong; cổng 4181, 4185, 4186 không phải của bạn). Rồi hoc/KE-HOACH-MUA-3.md (cả tệp: mục 1 rà màn, đoạn "Đo lại 29/10", mục 2 bảng 10 gói), hoc/KE-HOACH-MUA-2.md mục Trạng thái dòng "27/10 P0 · Khung mùa 2 xong" (làm Y HỆT cách đó cho mùa 3), và khối "MÙA 2 = 10 GÓI" trong hoc/lo-trinh-hoc.js (dòng ~510–775).

LOẠI: Ship          MODEL: opus (điểm: quy mô 2 (lo-trinh-hoc.js, kiem-lo-trinh.mjs, ~9 tệp ngân hàng rỗng, choi.html), choke 1 (lộ trình dùng chung), giá sai 1 (vỡ tiến độ / màn cũ), mơ hồ 1, suy luận 1 = 6)

CHỖ LÀM: worktree riêng (Agent tool tạo), nhánh claude/khung-mua-3 từ main 3fe2207 hoặc mới hơn (main đã có mùa 2 xong, npm test 88/88). Tự tạo nhánh nếu worktree đặt tên khác.

MỤC TIÊU: xong khi lộ trình có khối "MÙA 3 = 10 GÓI" (mảng `MUA_3`, như `MUA_2`) chỉ bằng màn ĐÃ CÓ, mùa 3 vẫn ẩn (`an: true`, hiện khi bật Gỡ lỗi "Mở hết"); mọi chương ngoài khuôn đang nằm ở mùa 3 dời sang mùa ẩn sau, vẫn chơi được; mỗi chương mới có tệp ngân hàng rỗng đã đăng ký; kiem-lo-trinh.mjs có mục mùa 3 với lỗi giả đỏ đủ; mùa 1, mùa 2 y nguyên.

BẢNG MÙA 3 (mã chương đề xuất; được đổi mã chương MỚI nếu có lý do, ghi vào báo cáo; KHÔNG đổi `ma` của màn nào: đó là khoá lưu sao):
| Gói (mã gói) | Chương 1: màn có sẵn | Chương 2: màn có sẵn |
|---|---|---|
| 1 Nhện (nhen, bo-phan) | `nhen` "Thân nhện": nhen.1, nhen.8 (sửa: `S` thành sàn) | `chuoi-nhen` "Chuỗi cho nhện": nhen.4, nhen.7 |
| 2 Nam châm (nam-cham, bo-phan) | `nam-cham` "Nam châm": nam-cham.1, .4, .5, .7, .8 | `logic-nam-cham` "Logic cho nam châm": che-nam-cham.1, .2, .3, .4, .8, .9 |
| 3 Cảm ứng từ (cam-ung-tu, bo-phan) | `cam-ung-tu` [] | `che-cam-ung-tu` "Hàm cho cảm ứng từ" [] |
| 4 Bãi từ (bai-tu) | `bai-tu` [] | `che-bai-tu` "Hàm cho bãi từ" [] |
| 5 Nhảy (nhay, bo-phan) | `nhay` "Nhảy": nhen.2, .3, .5, .6, .9, .10 | `che-nhen` "Chế lệnh nhện": che-nhen.1–10 (.6 sửa: bỏ `S`) |
| 6 Đảo cực (dao-cuc, bo-phan) | `dao-cuc`: nam-cham.2, .3 | `che-dao-cuc` "Hàm đảo cực": che-nam-cham.6, .7 |
| 7 Đọc cực (doc-cuc, bo-phan) | `doc-cuc`: nam-cham.6, nam-cham.10 (sửa: bỏ color(), cảm biến camera) | `che-doc-cuc` "Hàm đọc cực": che-nam-cham.5, .10 |
| 8 Đội xích và nhện (doi-xich, thu-thach) | `doi-xich`: màn KHÔNG có `S` | `che-doi-xich`: màn KHÔNG có `S` |
| 9 Nam châm bụng nhện (bung-nhen, thu-thach) | `bung-nhen` [] | `che-bung-nhen` [] |
| 10 Tổng hợp + trùm (tong-hop-3, thu-thach) | `tong-hop-3` [] | `trum-mua-3` [] |
Thứ tự màn trong chương: thứ tự trong bảng là gợi ý; xếp để độ khó tăng dần theo luật đo đường cong (dưới), màn khó nhất có sẵn của chương đứng cuối.
Rời mùa 3 (đi mùa ẩn sau, GIỮ thứ tự cũ, vẫn chơi được bằng "Mở hết"): nam-cham.9 (omni), che-xich (5 màn, bậc `S`), màn `S` của doi-xich / che-doi-xich, và mọi gói đang ở mùa 3 mà không thuộc bảng (ban-xoay, doi-ho-bang, list, omni, doi-omni, doi-sung-hoi, mau, doi-mau, may-son, rap-nao, doi-nam-cham, doi-tay-xoay: đo bằng `TT.goi.filter(g => g.mua === 'mua-3')` sau khi nạp lo-trinh-hoc.js). Đề xuất: sang đầu mùa 4 (đang ẩn), giữ thứ tự; bạn thấy cách khác tốt hơn thì nêu.
  Chú ý: che-xich.4 tạo climb() mà che-doi-xich.1, .2 và che-doi-omni.5 cần: màn cần hàm phải đứng SAU màn tạo hàm (máy kiểm (e) của mùa 2 đã kiểm điều này, áp cho mùa 3).
Ngưỡng sao gói mùa 3: KHÔNG khai cứng (mo-goi.js tự tính trong mùa), như P0 mùa 2. Gói đầu mùa 3 cần 0 sao; gói đầu mùa 4 cần 0 sao.

SỬA MÀN (chỉ các chỗ ghi ở bảng; lời giải đổi thì đo lại sao bằng `node tools/do-lo-trinh.mjs --ghi-sao` như mùa 2 đã làm, đọc tools/do-lo-trinh.mjs trước): sửa qua lộ trình (hàm `sua` / `get` trong lo-trinh-hoc.js, trong khối mùa 3), KHÔNG sửa tệp màn gốc man-nhen.js / man-nam-cham.js…
  Lệnh `--ghi-sao` GHI ĐÈ CẢ tệp hoc/lo-trinh-sao.js: chạy xong `git diff hoc/lo-trinh-sao.js` phải chỉ đổi dòng của màn bạn đã sửa; đổi dòng khác thì khôi phục tệp và báo.

PHÁT HIỆN CỦA NGƯỜI GIAO (kiểm lại, đừng tin): `elif` đã có ở mùa 1 (me-cung.3–6, .9, cam-bien-ben.8, .10) nên KHÔNG phải khối mới mùa 3; cái mới là `and` / `or`. Chuỗi làm đối số (`shoot("fast")`) đã có ở mùa 2; cái mới là chuỗi làm DỮ LIỆU.

MÁY KIỂM hoc/kiem-lo-trinh.mjs, mục mùa 3 (thêm, như mục mùa 2; KHÔNG đổi mục mùa 1, mùa 2), mỗi mục có lỗi giả trong `--loi-gia-mua-3` phải đỏ:
  (a) đúng bảng MUA_3 (gói, chương, loại; chương chưa có màn chưa hiện; mùa 3 `an: true`).
  (b) chuỗi làm dữ liệu (biến gán chuỗi, `for … in` chuỗi / biến chuỗi, so sánh `==` / `!=` với chuỗi, gọi hàm nhận chuỗi đường đi như walk / leap) không xuất hiện trước gói 1 chương 2; đối số chuỗi cố định kiểu shoot("fast") vẫn được. Tự định nghĩa chính xác, ghi vào báo cáo.
  (c) `and` / `or` không xuất hiện trước gói 2 chương 2 (kể cả mùa 1, 2; bắc cầu qua hàm của em như mục (c) mùa 2).
  (d) part đúng mùa: thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ (front_metal / front_pole). Không omni, drone, camera, máy sơn, máy ném, color().
  (e) part mở dần (gốc → nâng cấp): không magnet_s trước gói 6; không front_metal trước gói 3; không front_pole trước gói 7; không crouch / stand / jump / leap trước gói 5; nhện không có trước gói 1. Đo xem các màn có sẵn có vi phạm không; vi phạm thì xếp lại / sửa nhỏ / báo (đừng âm thầm nới luật).
  (f) không `S` ở sân mùa 3. Ô hố, gầm `n`: đo xem đang có ở gói nào, báo (luật: hố là sàn mới của mùa 3, đi cùng nhảy ở gói 5 và bãi từ gói 4; gói 1 có hố thì nêu).
  (g) hàm cần được tạo trước (cả mùa 3 và mùa ẩn sau nó).
  (h) ĐO đường cong mùa 3 bằng luật của phanh (g) mùa 2 (lề dòng 3 / nhịp 4 / ô 6, mốc = màn không trùm đứng trước, trùm miễn) và IN bảng chỗ nhảy, CHƯA ép đỏ (màn mới còn chưa có, mốc sẽ đổi); xếp lại thứ tự trong chương nếu sửa được nhảy dễ.
TỆP NGÂN HÀNG RỖNG: mỗi chương mới có màn mới về sau một tệp hoc/man-<tệp>.js khai `ManHoc.<biến> = []` (khuôn: hoc/man-bien-xich.js), require ở đầu lo-trinh-hoc.js, thẻ <script> trong hoc/game/choi.html, mảng `TEP_MUA_3` + chú thích bảng tệp như `TEP_MUA_2`. Đề xuất một tệp mỗi gói có màn mới (gói 1–10, chương 2 gói 2 dùng chung tệp gói 2…); ghi bảng vào báo cáo.

PHẠM VI: được sửa hoc/lo-trinh-hoc.js (khối MÙA 3 mới đặt SAU khối MÙA 2; KHÔNG sửa khối mùa 1, khối MÙA 2), hoc/kiem-lo-trinh.mjs (thêm mục mùa 3, sửa giả định tối thiểu ở chỗ khác nếu dời gói làm đỏ, ghi rõ), hoc/lo-trinh-sao.js (sao màn đã sửa), hoc/thu-tu-chuong.js (chỉ nếu bắt buộc), hoc/man-*.js MỚI (rỗng), hoc/game/choi.html (thẻ script), máy kiểm khác nếu chúng giả định chương nằm ở mùa 3 (sửa tối thiểu, ghi rõ). KHÔNG sửa: tệp màn có sẵn, san-hoc.js, cham.js, bộ vẽ, kế hoạch .md, sổ canh.
Đang có nhánh khác: claude/dem-tu-thu (bản thử đệm từ, chưa gộp, có gói "Thử đệm từ" ở đầu mùa 3) và phiên khác làm gói HD1 mùa 1 (sửa khối mùa 1 của lo-trinh-hoc.js, kiem-lo-trinh.mjs). Đừng lấy code từ các nhánh đó; chỉ giữ chỗ sửa của bạn gọn trong khối mùa 3 để gộp sau dễ.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại có bằng chứng (màn xếp sai gói, mã chương, nơi dời chương ngoài khuôn, luật (b) (e) quá chặt / quá lỏng). Kiểm lại từng khẳng định ở đây bằng code, đừng tin. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): khuôn 10 gói × 2 chương × 10 màn; gói 9 là nam châm bụng nhện; mùa 3 ẩn tới khi đủ; không đổi `ma`; show don't tell (màn trình diễn làm ở P2, không phải P0); chữ tiếng Việt, không emoji, không gạch dài.

TRƯỚC KHI SỬA: GitNexus `impact` cho hàm sắp sửa trong lo-trinh-hoc.js (repo = D:\Users\tuanla2\game\doi-robot-chan-hung); risk HIGH/CRITICAL → dừng, báo. Không có GitNexus thì grep chỗ gọi.

KIỂM TRA (tại worktree, TỪNG LỆNH MỘT; CẤM npm test cả bộ: người giao chạy):
  node hoc/kiem-lo-trinh.mjs ; node hoc/kiem-lo-trinh.mjs --loi-gia-mua-3 ; node hoc/kiem-lo-trinh.mjs --loi-gia-mua-2   ← mục mùa 3 xanh; lỗi giả mùa 3 đỏ đủ; mùa 2 vẫn đỏ đủ 8 / 8
  node tools/do-lo-trinh.mjs   ← mọi màn thắng 3 sao theo lộ trình (đọc lệnh có cờ gì trước)
  node hoc/kiem-hoc.mjs ; node hoc/kiem-che-xe.mjs ; node hoc/kiem-nhen.mjs ; node hoc/kiem-nam-cham.mjs ; node hoc/kiem-phim-goi.mjs ; node hoc/kiem-huy-hieu-phim-vector.mjs ; node hoc/kiem-goi-doi.mjs
  Máy kiểm đỏ: chạy lại ĐÚNG máy đó ở main để tách đỏ sẵn khỏi đỏ mới; ghi cả hai.
  Trình duyệt (cổng 4205, một tab của bạn, gỡ service worker + xoá caches khi mở lần đầu): bật Gỡ lỗi "Mở hết", thấy mùa 3 với các gói có màn, mở một màn mỗi gói; mùa 4 có các gói dời sang; tắt server khi xong.

CÁCH GIAO: commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng nhánh / worktree khác.

BÁO CÁO CUỐI (ghi dần vào hoc/ban-giao/bao-cao-P0-khung-mua-3.md trên nhánh của bạn, VÀ trong câu trả lời cuối), đủ 5 mục: 1 KẾT QUẢ (SHA từng commit; bảng MUA_3 đã dựng: gói · chương · màn có sẵn theo thứ tự · số màn còn thiếu; màn đã sửa và sao đo lại; nơi dời từng gói ngoài khuôn; bảng tệp ngân hàng; định nghĩa chính xác luật (b) (e); bảng đường cong (h); lệnh kiểm + dòng tổng nguyên văn); 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai); 3 ĐỀ XUẤT (khung vấn đề → bảng phương án → nghiêng về đâu); 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (5–8 câu); 5 RỦI RO CÒN LẠI. Chỉ ghi điều đã thật sự chạy.
