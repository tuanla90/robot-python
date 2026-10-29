NHỊP (đọc trước): commit đầu tiên trong ~20 phút (vd máy kiểm đường cong mùa 2 ở việc 1); sau đó TỐI ĐA 40 phút một commit, mỗi chương sửa xong một commit. CẤM khảo sát toàn bộ 200 màn trước khi sửa chỗ đầu tiên: số liệu đã đo sẵn ở dưới. Hết sức thì dừng và báo còn gì: thà 3 việc đúng có commit còn hơn 5 việc không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: hoc/ban-giao/luat-song-song.md (mục "RAM: luật cứng", "Tệp", "Chung" áp dụng y nguyên; lần này chỉ MỘT agent là bạn, không dùng server / trình duyệt). Rồi hoc/KE-HOACH-MUA-2.md (toàn bộ, nhất là mục Trạng thái P0) và hoc/KE-HOACH-MUA-1.md (dòng "Luật đo đường cong", dòng "29/10 MÙA 1 XONG Ở BẢN VECTOR", mục "Đường cong học và recall").

LOẠI: Ship          MODEL: opus (điểm: quy mô 1 (4–10 tệp), choke 1 (lo-trinh-hoc.js dùng chung), giá sai 1 (sai lộ trình / mất sao đã lưu), mơ hồ 1 (tự chọn cách làm mượt từng chỗ), suy luận 1 = 5; user chọn opus)

CHỖ LÀM: worktree riêng (Agent tool tạo), nhánh claude/mua-2-xong từ main 5b731f1 (mùa 2 đủ 10 gói nội dung, game đã vector hoàn toàn). Tự tạo nhánh đó nếu worktree đặt tên khác.

MỤC TIÊU: xong khi mùa 2 "Ghi nhớ" đạt chuẩn như mùa 1: đủ 200 màn (20 chương × 10), mỗi chương có trùm + huy hiệu vector, đường cong cả mùa 2 đạt luật đo (có máy kiểm chặn tái phát), và mùa 2 hiện ở màn chọn gói (không còn ẩn) với tên "Ghi nhớ" và ngưỡng sao khai cứng.

BỐI CẢNH (người giao đo trên 5b731f1, tự đo lại, đừng tin):
- Đo bằng: M = require('./lo-trinh-hoc.js'); M.mua2 (10 gói, mỗi gói `chuong: [[mã, …], …]`); M.danhSach lọc theo `chuong`, sắp theo `so`; M.timMa(ma).
  Hàm đo (chép từ hoc/kiem-be-sung.mjs dòng 123, 176–177, 413–425): soDong = dòng chương trình chính (0 nếu chinhCoDinh; màn đội cộng các robot không coDinh) + dòng thân hamCuaMan + hamCuaEmMoi; nhịp = m.sao.nhip; ô = số ô không phải '#' của sân lớn nhất.
  Luật: màn n ≤ max(1,5 × mốc, mốc + lề), lề dòng 3 / nhịp 4 / ô 6; mốc = màn không trùm đứng ngay trước theo thứ tự cả mùa (qua ranh chương); trùm miễn và không làm mốc.
- Việc 1 · THIẾU MÀN: chương `bien-xich` "Biến cho xích" (gói 1 chương 2) mới có 9 màn, KHÔNG có trùm, không huy hiệu. Mùa 2 hiện 199 màn. Tệp hoc/man-bien-xich.js DS rỗng, đã đăng ký sẵn (đọc chú thích đầu tệp): màn mới nối cuối chương, thành màn 10 = trùm. Ý kế hoạch: "đếm nhịp quay" (biến đếm trên xe xích). Chín màn có sẵn: che-xich.1, .2, .6, .8, che-cam-bien.6, .5, .9, robot-hoan-thien.9, che-xich.9 (đọc chúng trước: trùm phải dùng biến như chương đã dạy, hàm của em đã tạo ở chương: spin, sidestep, pick_behind, count_return, bounce, fetch_back…; tự xác minh tên).
  Trùm cần: thắng 3 sao bằng lời giải, mã mẫu không thắng, lời không dùng biến / viết cứng không 3 sao (chứng minh bằng máy kiểm), 2–3 sân nếu hợp (như các trùm mùa 2 khác), chỉ part mùa 1 + xích (kiem-lo-trinh mục mùa 2 ràng buộc: chưa có tham số trước tham-so, không S / u / n). Huy hiệu `bien-xich` (`huyHieu: { ma: 'bien-xich', ten: 'Huy hiệu Biến cho xích' }`) PHẢI có hình vector riêng trong hoc/game/huy-hieu-vector.js (bộ pixel đã gỡ, mã thiếu hình ra canvas trống): vẽ theo kiểu các huy hiệu mùa 2 đã có ở đó (vd be-sung, day-thung), kiểm bằng `coHinhRieng` của hoc/huy-hieu-ds.mjs. Hàm của em mới (nếu có) thêm mục Sổ lệnh hoc/so-lenh.js đúng thứ tự chế (kiem-che-xe kiểm).
- Việc 2 · 16 CHỖ NHẢY ĐƯỜNG CONG, toàn ở chương DÙNG LẠI (gói 1, 2, 4); các chương viết mới (gói 3, 5–10) đều đạt. Dạng "mã (chương.số) sau mốc: chỉ số":
    xich.2 sau xich.1: dòng 2→7 · xich.3 sau xich.2: dòng 7→11 · xich.9 sau xich.8: ô 11→20
    che-xich.6 (bien-xich.3) sau che-xich.2: nhịp 5→10
    sung-hoi.6 sau sung-hoi.5: ô 7→25 · sung-hoi.9 sau sung-hoi.8: dòng 4→8 · tham-so.1 sau sung-hoi.9: nhịp 6→11 · tham-so.5 sau tham-so.4: ô 10→17
    bang-chuyen.2 sau .1: nhịp 4→10 · bang-chuyen.3 sau .2: dòng 2→9, ô 7→20 · bang-chuyen.4 sau .3: ô 20→35 · bang-chuyen.8 sau .7: nhịp 15→26, ô 11→23
    che-sung-hoi.1 sau bang-chuyen.9: ô 8→25 · che-sung-hoi.4 sau .3: ô 7→25 · che-sung-hoi.6 sau .5: ô 6→25 · che-sung-hoi.9 sau .8: dòng 4→8, nhịp 3→8
  Nhiều chỗ "ô 25" là sân 5×5 trống của màn chế lệnh một dòng (che-sung-hoi.1 `jet_back()`, .4 `kick_right()`): thu sân bằng tường '#' (lời giải / nhịp không đổi) là cách rẻ; nếu bạn thấy luật ô vô lý ở đây thì nêu ra, đừng lách bằng cách sửa luật đo.
  Cách được phép, theo thứ tự ưu tiên: (a) đổi thứ tự màn trong chương (sửa dòng chương đó trong MUA_2 của lo-trinh-hoc.js); (b) sửa sân / lời giải QUA LỘ TRÌNH như P0 đã làm (lo-trinh-hoc.js, ngân hàng màn cũ không đổi, đo lại sao), giữ ý bài; (c) thay một màn bằng màn mới viết trong tệp ngân hàng mùa 2 của gói đó (gói 1: man-bien-xich.js; gói 2, 4 chưa có tệp: tạo tệp mới theo khuôn man-bien-xich.js và đăng ký ở require + TEP_MUA_2 của lo-trinh-hoc.js + thẻ <script> trong hoc/game/choi.html), màn bị thay thì cất (không xoá khỏi ngân hàng). Mỗi chương vẫn đúng 10 màn, trùm vẫn là màn 10.
  KHÔNG đổi `ma` của màn đã có (khóa lưu sao người chơi). Màn đổi thứ tự thì kiểm lại "hàm cần được tạo trước" (kiem-lo-trinh mục e) và "mỗi màn thêm tối đa một điều mới".
- Việc 3 · PHANH: thêm vào hoc/kiem-lo-trinh.mjs (mục mùa 2) phép đo đường cong CẢ MÙA 2 như trên + kiểm mỗi chương mùa 2 đúng 10 màn, màn 10 trùm có huy hiệu và `coHinhRieng(huy hiệu)`; thêm lỗi giả vào `--loi-gia-mua-2` (vd đảo hai màn một chương) phải đỏ.
- Việc 4 · MỞ MÙA 2: hoc/thu-tu-chuong.js dòng 70 `{ ma: 'mua-2', ten: 'Địa hình', ban: { gia: '49.000đ' }, an: true }` → bỏ `an`, tên 'Ghi nhớ' (giữ `ban`; mùa 3, 4 vẫn ẩn). Ngưỡng sao gói mùa 2 khai cứng trong MUA_2 như mùa 1 (lo-trinh-hoc.js dòng 290, 343–362: sao 0, 30, 60…; công thức TI_LE_SAO 0,5 × tổng sao tối đa các gói trước trong mùa, làm tròn xuống bội 5, hoc/game/mo-goi.js dòng 9, 72): tính từ số màn thật sau việc 1–2, dòng code dựng goi2 (lo-trinh-hoc.js ~dòng 655) phải chép `sao` sang. Sửa chú thích "mùa 2 còn ẩn" cho đúng. Soát mọi máy kiểm / chuỗi đang giả định mùa 2 ẩn hay tên "Địa hình" (grep 'Địa hình', 'an: true', `\.an\b` trong hoc/*.mjs, hoc/game/*.js, tools/) và sửa giả định tối thiểu, ghi rõ.
  Mùa 2 có `ban: { gia }` (mua mới mở): KHÔNG đổi luật mua / khoá; chỉ ghi vào báo cáo màn chọn gói sẽ hiện mùa 2 thế nào (đọc hoc/game/man-goi.js / mo-goi.js), người giao xem trình duyệt.

PHẠM VI: được sửa hoc/man-bien-xich.js, tệp ngân hàng mới cho gói 2 / 4 nếu cần (việc 2c), hoc/lo-trinh-hoc.js (chỉ khối MÙA 2 và dòng đăng ký require / TEP_MUA_2), hoc/thu-tu-chuong.js (dòng mùa 2), hoc/game/huy-hieu-vector.js (THÊM hình bien-xich, không sửa hình khác), hoc/game/choi.html (THÊM thẻ script nếu tạo tệp mới), hoc/so-lenh.js (THÊM mục), hoc/kiem-lo-trinh.mjs, máy kiểm có sẵn đỏ vì giả định cũ (sửa tối thiểu, ghi rõ). KHÔNG sửa: lõi (san-hoc.js, cham.js), màn gói 3, 5–10 (đã đạt), mùa 1, mùa 3+, giao diện / CSS, phim, kế hoạch .md, sổ canh.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): số đo sai, cách làm mượt có cách đơn giản hơn, luật ô vô lý ở màn một dòng, chỗ bị bỏ sót. Kiểm lại từng khẳng định ở đây bằng code, đừng tin. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): khuôn 10 gói × 2 chương × 10 màn; đường cong mượt (màn 1–3 làm quen, 4–6 luyện, 7–9 biến thể, 10 trùm; mỗi màn tối đa một điều mới; không hai màn liền nhau cùng kiểu bài); chữ tiếng Việt, không emoji, không gạch dài; không đổi `ma`.

TRƯỚC KHI SỬA: GitNexus `impact` cho các symbol sắp sửa trong lo-trinh-hoc.js / thu-tu-chuong.js (repo = D:\Users\tuanla2\game\doi-robot-chan-hung); không có GitNexus thì grep chỗ dùng. Risk HIGH/CRITICAL → dừng, báo.

KIỂM TRA (tại worktree, TỪNG LỆNH MỘT, sau mỗi nhóm commit; CẤM `npm test` cả bộ: người giao chạy sau khi gộp):
  node hoc/kiem-lo-trinh.mjs                  ← kèm phép đo đường cong mùa 2 mới
  node hoc/kiem-lo-trinh.mjs --loi-gia-mua-2  ← mọi mục đỏ, kể cả lỗi giả mới
  node hoc/kiem-che-xe.mjs
  node hoc/kiem-xich.mjs ; node hoc/kiem-sung-hoi.mjs ; node hoc/kiem-tham-so.mjs ; node hoc/kiem-bang-chuyen.mjs ; node hoc/kiem-che-sung-hoi.mjs (cái nào có thì chạy; chương bạn sửa)
  node hoc/kiem-che-xich.mjs ; node hoc/kiem-che-cam-bien.mjs ; node hoc/kiem-robot-hoan-thien.mjs (màn của bien-xich đến từ các chương này)
  node hoc/kiem-luc-ban.mjs ; node hoc/kiem-day-thung.mjs ; node hoc/kiem-trum-mua-2.mjs (giả định thứ tự gói mùa 2)
  node hoc/kiem-huy-hieu-phim-vector.mjs ; node hoc/kiem-ve-vector.mjs ; node hoc/kiem-bang-mau.mjs (huy hiệu mới)
  node hoc/kiem-phim-goi.mjs ; node hoc/kiem-goi.mjs ; node hoc/kiem-hoc.mjs (mở mùa / ngưỡng sao)
  Máy kiểm đỏ: chạy lại ĐÚNG máy đó ở main 5b731f1 (git stash hoặc worktree tạm) để tách đỏ sẵn khỏi đỏ mới; ghi cả hai.
  Không mở trình duyệt, không chạy server (người giao soát 200/200 màn trong trình duyệt sau khi gộp).

CÁCH GIAO: commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng nhánh / worktree khác.

BÁO CÁO CUỐI (ghi dần sau mỗi commit vào hoc/ban-giao/bao-cao-mua-2-xong.md trên nhánh của bạn, VÀ trong câu trả lời cuối), đủ 5 mục, mục trống ghi "không có":
  1 KẾT QUẢ: SHA từng commit; màn trùm bien-xich (sân, lời giải, nhịp, vì sao lời không biến không 3 sao); bảng 16 chỗ nhảy · cách xử lý (a / b / c) · số đo sau; bảng đường cong 20 chương sau sửa (dòng / nhịp / ô từng màn); ngưỡng sao 10 gói; lệnh kiểm + output NGUYÊN VĂN (dòng tổng của từng máy).
  2 CÂU HỎI CẦN LÀM RÕ (đã tự quyết gì, vì sao, đảo lại được không; chỗ brief sai / thừa / thiếu, hoặc ghi "brief không có chỗ nào sai").
  3 ĐỀ XUẤT: mỗi mục theo khung vấn đề → bảng phương án (cột A / B / để nguyên; hàng Làm gì · Mất bao lâu · Mức ảnh hưởng · UI trước → sau · Người chơi thấy khác gì · Lợi ích · Rủi ro) → ưu tiên + nghiêng về đâu.
  4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (5–8 câu, không thuật ngữ).
  5 RỦI RO CÒN LẠI (điều chưa kiểm và cách kiểm).
  Chỉ ghi điều đã thật sự chạy. Người nghiệm thu tự chạy lại mọi lệnh.
