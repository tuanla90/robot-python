# Brief SM1-A: sửa mùa 1 gói 4 (chương Kho hàng) và gói 5 (Bánh lùi) theo nghiệm thu độc lập

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 1 (lo-trinh-hoc.js khối MUA_1 + chuỗi tạo hàm cốt truyện), giá sai 1, mơ hồ 2 (thiết kế màn mới), suy luận 1 = 7)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút. Tối đa 40 phút phải có commit. Mỗi việc (1, 2, 3 dưới đây) xong là một hay vài commit, máy kiểm liên quan xanh.
- Làm theo thứ tự Việc 1 → 2 → 3. Hết sức thì dừng và báo còn gì: thà Việc 1 làm đúng còn hơn ba việc không commit nào.
- CẤM dựng kiểm kê toàn bộ trước khi sửa dòng đầu tiên. Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: (1) chương 2 của gói 4 "Kho hàng" thật sự về nút đè và chế lệnh cho kho, trùm của chương có nút đè; (2) trùm chương 2 gói 5 (hiện che-xe.10) là màn khó nhất chương và kiểm "chế lệnh có lùi"; (3) gói 5 bớt các màn trùng ý; mọi máy kiểm liên quan xanh, lời giải chuẩn mọi màn mùa 1 vẫn 3 sao.

## BỐI CẢNH
- Nghiệm thu độc lập mùa 1: `hoc/ban-giao/nghiem-thu-30-10/nghiem-thu-mua-1.md` (đọc mục Câu 1, 2 và Đề xuất 1, 2, 3). Lời user (nguyên văn, 30/10): "bạn sửa mùa 1".
- Lộ trình xuất bản mùa 1 ráp ở `hoc/lo-trinh-hoc.js` (mảng `MUA_1`, khoảng dòng 435 đến 460; `CAT` = màn cất; `day()`, `dungChuong()`, `sua()`, `nhieuSan()`). Ngân hàng bài ở `hoc/man-*.js`. Mẫu thêm màn mới cho một gói có sẵn: `hoc/man-banh-lui-them.js` + máy kiểm `hoc/kiem-banh-lui-them.mjs`, `hoc/man-nut-de.js` + `hoc/kiem-nut-de.mjs`, `hoc/man-cam-bien-them.js`.
- Chương kho-hang hiện tại (8.1 đến 8.10) = che-xe.1, .2, .3, che-tay.1, .2, .3, .4, .6, .8, .10. Sáu màn TẠO hàm cốt truyện mà màn sau dùng (người giao đã đo):
  che-xe.1 dodge_right (11 màn sau dùng, tới che-xe.10, che-omni.7, doi-mau.5), che-xe.2 dodge_left (9), che-tay.1 pass_back (12, tới robot-hoan-thien.11), che-tay.2 put_right (8), che-tay.4 grab_back (2), che-tay.6 swap (2).
  Bốn màn không tạo hàm nào: che-xe.3, che-tay.3, che-tay.8, che-tay.10. Hàm phải được tạo ở một màn ĐỨNG TRƯỚC mọi màn dùng nó (theo thứ tự lộ trình); máy kiểm `hoc/kiem-loi-giai.mjs` và `tools/do-lo-trinh.mjs` bắt chỗ hỏng.
- Lộ trình 30/10: 1128 màn (mùa 1 đến 4 đang mở, mùa 5 ẩn). Trần kho hàm nay chỉ tính hàm tự đặt tên (`hoc/kho-ham.js`), hàm cốt truyện mới không bị chặn.

## VIỆC
### Việc 1. Chương 2 gói 4 "Kho hàng" về nút đè (Đề xuất 1)
- Thay ít nhất 5 màn của chương bằng màn "chế lệnh cho kho" có nút đè (cơ chế nút đè của chương 1 nut-de: đọc `hoc/man-nut-de.js`), ví dụ chế hold_door() / open_way(), hàm có go_wall + nút; trùm 8.10 phải có nút đè.
- Sáu màn tạo hàm ở trên: hoặc giữ lại trong chương (có thể viết lại sân / đề cho dính nút đè, giữ `ma` và giữ tên + thân hàm tạo ra), hoặc dời tới chỗ khác ĐỨNG TRƯỚC màn đầu tiên dùng hàm đó. Bạn chọn, nói lý do. Màn không tạo hàm (che-xe.3, che-tay.3, che-tay.8, che-tay.10) là ứng viên cất (`CAT`) hay dời.
- Màn mới: tệp ngân hàng mới (gợi ý `hoc/man-kho-hang-them.js`, mã mới không trùng màn có sẵn hay đã cất), nạp trong danh sách tệp của lo-trinh-hoc.js như các tệp "-them" khác, máy kiểm mới (gợi ý `hoc/kiem-kho-hang-them.mjs`, theo mẫu kiem-banh-lui-them.mjs: đủ trường, lời giải 3 sao đúng sao.o / sao.nhip, mã mẫu chưa thắng, lời giải khác 2 sao, lời sai thua đủ mã, đường cong, bộ dò lách).
- Hàm cốt truyện mới (nếu chế): tên tiếng Anh ngắn, không trùng hàm đã có (`ManHoc.hamCotTruyen()`), không trùng hàm gốc (`hoc/kho-ham.js` HAM_GOC_MAC_DINH); thêm mục Sổ lệnh nếu máy kiểm đòi (`hoc/so-lenh.js`).
### Việc 2. Trùm chương 2 gói 5 (Đề xuất 2)
- Trùm mới thay che-xe.10 "Bãi đỗ xe" (12 nhịp, dễ hơn màn 9 19 nhịp, không for / while / cảm biến, không tạo hàm): có lùi + while + một hàm em chế, ba sân dài ngắn khác nhau để không đếm cứng được (chưa có cảm biến bên ở gói 5). che-xe.10 lùi về hàng biến thể hoặc cất. Huy hiệu trùm chương chuyển theo (xem cách lo-trinh-hoc.js chuyển huy hiệu cam-bien-ben).
### Việc 3. Gói 5 bớt trùng (Đề xuất 3)
- Ba màn "viết hàm đường về" gần trùng (che-xe.7 come_back, che-tay.7 put_back, che-lap.7 come_home) và ba màn "kẹt số" (che-xe.9, che-tay.9, che-lap.9): giữ một mỗi loại (chọn màn có hàm cốt truyện được dùng về sau; kiểm hamCuaEmCan), chỗ trống thay bằng màn lùi + cảm biến khoảng cách + tay (nhắc gói 2, 3). che-lap.9 (lời giải 1 dòng) cất.

## LUẬT THIẾT KẾ MÀN (quyết định của USER, không tự đi ngược)
- Đường cong: trong chương màn 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm; mỗi màn thêm tối đa MỘT điều mới; không nhảy vọt độ dài lời giải / nhịp / cỡ sân (mẫu ngưỡng ở kiem-banh-lui-them.mjs mục 4: n ≤ max(1,5 × màn trước, màn trước + bù), bù dòng +3, nhịp +4, ô sân +6); trùm là màn khó nhất chương nhưng không gấp quá 2 lần màn 9.
- Show don't tell: khối / cơ chế mới thì màn đầu là màn trình diễn (`chiChay: true, chinhCoDinh: true`), màn sau ép dùng nó (lời giải lách phải thua hoặc thiếu sao; `node hoc/kiem-lach-mua-1.mjs` đo), rồi mới thả. Nút đè đã có màn trình diễn ở nut-de.1.
- Recall: màn mới nên dùng thứ của gói trước (go_wall, pick / drop, for, while, front_clear).
- Ràng buộc mùa 1: không biến, không hàm có tham số, không left_clear / right_clear trước gói 7, không left_back / right_back trước gói 5 (lo-trinh-hoc.js tự bớt khay theo gói; gói 4 KHÔNG có lệnh lùi), không bậc thang S, không tay xoay trước gói 6.
- Giữ `ma` màn đã phát hành (khoá lưu sao). Đổi nội dung màn có sẵn thì tăng `phienBanNoiDung` (bản nháp cũ bị bỏ). Đo lại ngưỡng sao: `node tools/do-lo-trinh.mjs --ghi-sao`.
- Chữ hiển thị tiếng Việt, không emoji, không dấu gạch dài (em dash). Đề và gợi ý không đọc ra luôn đáp án.

## PHẠM VI
Được sửa: khối MÙA 1 trong `hoc/lo-trinh-hoc.js` (chỉ thêm / sửa dòng cần thiết, CẤM định dạng lại tệp; khối mùa 2 / 3 / 4 / 5 phiên khác đang sửa), `hoc/lo-trinh-sao.js`, tệp ngân hàng mới, các `hoc/man-*.js` của che-xe / che-tay / che-lap / nut-de / banh-lui (chỉ màn mùa 1), `hoc/so-lenh.js` (thêm dòng), `hoc/game/huong-dan-man.js` (thêm hướng dẫn nếu cần), `hoc/game/huy-hieu*.js` (chỉ khi chuyển huy hiệu cần), máy kiểm `hoc/kiem-*.mjs` của mùa 1, `tools/do-lo-trinh.mjs` nếu cần.
KHÔNG sửa: `hoc/cham.js`, `hoc/san-hoc.js`, `nhan/`, `hoc/kho-ham.js`, `hoc/game/go-loi.js`, hình vẽ, phim, khối mùa 2 trở đi.

## CÁCH GIAO
Worktree riêng đã dựng: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\sua-mua-1-a`, nhánh `claude/sua-mua-1-a`. Làm mọi lệnh trong worktree đó.
Commit từng bước, message tiếng Việt, cuối message dòng `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng `main` hay nhánh khác. Bạn là agent duy nhất lúc này.
Shell là Git Bash trên Windows: `cat > file` không có stdin sẽ treo, ghi tệp bằng công cụ ghi tệp; lệnh node đọc stdin thì thêm `< /dev/null`.

## PHẢN BIỆN (bắt buộc đọc)
Brief là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Kiểm lại từng khẳng định trong brief bằng code, đừng tin.
Được phép và được khuyến khích nói ngược lại (bằng chứng đọc sai, cách đơn giản hơn, việc thừa, lỗ bị sót).
Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Quyết định của USER: mục LUẬT THIẾT KẾ MÀN và câu "bạn sửa mùa 1". Các đề xuất 1 đến 3 là của người nghiệm thu, không phải luật: cách làm cụ thể bạn được chọn khác nếu có lý do.

## KIỂM TRA (máy yếu RAM)
- CẤM `npm test` cả bộ (người giao chạy sau khi gộp). Chạy từng máy kiểm liên quan, TUẦN TỰ, mỗi lệnh thêm `< /dev/null`:
  `node hoc/kiem-lo-trinh.mjs`, `node hoc/kiem-lach-mua-1.mjs`, `node hoc/kiem-loi-giai.mjs`, `node tools/do-lo-trinh.mjs`, `node hoc/kiem-nut-de.mjs`, `node hoc/kiem-banh-lui-them.mjs`,
  `node hoc/kiem-che-xe.mjs`, `node hoc/kiem-che-tay.mjs`, `node hoc/kiem-che-lap.mjs`, `node hoc/kiem-trum-mua-1.mjs`, `node hoc/kiem-combo-mua-1.mjs`, `node hoc/kiem-doi-mua-1.mjs`, `node hoc/kiem-huong-dan.mjs`, `node hoc/kiem-hoc.mjs` (chậm, chạy cuối),
  máy kiểm mới của bạn, và máy kiểm khác nhắc tới màn bạn đổi (`grep -l "che-xe\|che-tay\|che-lap\|kho-hang\|nut-de" hoc/kiem-*.mjs`).
- Mỗi ca kiểm mới phải tự chứng minh bắt được lỗi thật (cắm lỗi giả, thấy đỏ, gỡ).
- Xem bằng mắt (khi cần): server cổng 4205, `PORT=4205 node server.mjs` chạy nền, mở `http://127.0.0.1:4205/hoc/game/choi.html?debug=1&man=<mã>&loigiai=1` (bảng Gỡ lỗi mới nạp lời giải chuẩn; xem chú thích đầu `hoc/game/go-loi.js`). Cổng 4181 là của người giao: không dùng, không tắt. Lần đầu mở trang thì gỡ service worker + xoá caches rồi tải lại. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Phải đổi `ma` màn đã phát hành; một chương cần quá 10 màn; phải sửa cham.js / san-hoc.js; một hàm cốt truyện phải đổi tên hay thân khiến màn mùa sau đổi kết quả.

## BÁO CÁO CUỐI (ghi `hoc/ban-giao/bao-cao-SM1A.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, màn mới / màn cất / màn dời (bảng chương trước → sau, nhịp, ô), lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT cần user quyết: vấn đề (cơ chế thật, file:dòng), bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi · rủi ro), ưu tiên và nghiêng về đâu.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 đến 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
