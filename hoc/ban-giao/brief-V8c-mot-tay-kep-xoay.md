# Brief V8c: một tay kẹp duy nhất từ gói 2, gói 6 chỉ mở thêm lệnh xoay

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1 (đường vẽ robot + thẻ bộ phận dùng chung), giá sai 1, mơ hồ 1, suy luận 1 = 6)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút (việc 1 nhỏ nhất làm trước). Tối đa 40 phút phải có một commit.
- Hết sức thì dừng và báo còn gì. Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: người chơi thấy robot có MỘT cái tay kẹp từ gói 2 (tay-gap) tới hết; ở gói 6 (tay-xoay) không có "bộ phận mới", chỉ là cùng cái tay đó được mở thêm lệnh `arm_left` / `arm_right`,
giống cách gói 5 mở thêm lệnh lùi cho cùng hai bánh. Cụ thể:
1. HÌNH: tay mã 'kep' vẽ y hệt tay 'xoay' ở nấc trước (kiểu càng cong mới của V8b, cả vòng khớp quanh đèn). Mọi nơi hiện tay kẹp (sân, thẻ bộ phận, huy hiệu gói 2 / 4, phim, lắp ráp, mở đầu) ra cùng hình.
2. THẺ BỘ PHẬN (`hoc/gioi-thieu-part.js`, `hoc/game/the-part.js`): người chơi đã xem tay kẹp thì lần đầu gặp robot tay 'xoay' chỉ hiện thẻ "lệnh mới" với `arm_left` / `arm_right`
   (không hiện thẻ đầy đủ một bộ phận mới); người chơi chưa xem tay kẹp (mở hết gói, vào thẳng gói 6) thì thẻ đầy đủ vẫn đúng. Tên hiển thị nhất quán (vd vẫn "Tay kẹp", phần mới ghi "xoay trái / phải"): tự chọn, nói lý do.
3. Các chỗ khác gọi tay xoay là bộ phận riêng (Sổ lệnh trang "Bộ phận", lắp ráp / chọn bộ phận, đèn bộ phận `den-bo-phan.js`, chữ `chu.js`, hướng dẫn tay-xoay.1, phim gói 6): rà và sửa cho cùng một câu chuyện. Liệt kê từng chỗ đã đổi / để nguyên.

## BỐI CẢNH (lời user 29/10, nguyên văn, là QUYẾT ĐỊNH CỦA USER)
- "bạn xem hộ tôi các part có nâng cấp, mở cách chơi mới đều đang dùng chung 1 hình ảnh nhưng tay kẹp và tay kẹp có cần xoay đang dùng 2 hình khác nhau."
- "ý tôi là dùng luôn hình tay xoay cho phần tay kẹp được k ấy? và mở tính năng là mở luôn"
- Chọn kiểu hình: "Càng cong mới" (kiểu V8b: `hoc/ban-giao/bao-cao-V8b.md`).
Mẫu "nâng cấp mở thêm lệnh": hai bánh → bánh lùi (`gioi-thieu-part.js` đầu tệp: "bộ phận được mở thêm lệnh ở chương sau (vd. bánh lùi ở Chế lệnh xe) thì hiện thẻ 'lệnh mới' chỉ với phần mới"; `the-part.js` ~dòng 136 khoá `part:<ma>` / `part-lenh:<ma>:<lệnh>`).
KHÔNG đổi mã bộ phận trong dữ liệu màn ('kep' / 'xoay' giữ nguyên: nhiều màn, máy chấm và lõi dùng) trừ khi bạn chứng minh được cách gộp an toàn hơn; nếu thấy nên gộp mã, DỪNG và báo trước.

## PHẠM VI
Được sửa: `hoc/game/ve-vector-tay-kep.js`, `hoc/game/ve-vector-tay-xoay.js`, `hoc/gioi-thieu-part.js`, `hoc/game/the-part.js`, `hoc/game/chu.js`, `hoc/game/den-bo-phan.js`, `hoc/game/huong-dan-man.js`, `hoc/game/thanh-phan.js` (chỉ phần tên / hình bộ phận), máy kiểm `hoc/kiem-*.mjs`.
KHÔNG sửa: luật chạy / lõi (`nhan/`, `hoc/san-hoc.js`, `hoc/cham.js`), dữ liệu màn, thân, tay khác. `hoc/lo-trinh-*.js`: không đụng (phiên khác đang làm mùa 2 / 3).
Giữ nguyên: hành vi tay kẹp (không có lệnh xoay), `diemNeo`, `vatKep`, số đo vật trong kẹp (kiem-ve-vector 13h); tay kẹp không có lề tràn `tran` nếu không cần (khung ô của tay kẹp không đổi).

## CÁCH GIAO
Worktree riêng đã dựng: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v8c-mot-tay-kep-xoay`, nhánh `claude/v8c-mot-tay-kep-xoay` (từ ad0899a + commit brief này).
Commit từng bước. KHÔNG push, KHÔNG merge, KHÔNG đụng `main`. Bạn là agent duy nhất lúc này.

## PHẢN BIỆN (bắt buộc đọc)
Brief là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Kiểm lại từng khẳng định bằng code, đừng tin. Được phép và được khuyến khích nói ngược lại.
Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Quyết định của USER (không tự đi ngược): lời user ở BỐI CẢNH, kiểu càng cong mới, đồ hoạ vector, màu đội R1 #38BDF8 / R2 #F472B6 (tay không mang màu đội), chữ hiển thị không emoji, không gạch dài (em dash). Nút chỉ có icon có title + aria-label, vùng chạm ≥ 24 px.

## KIỂM TRA (máy yếu RAM)
- CẤM `npm test` cả bộ. Chạy tuần tự: `node hoc/kiem-ve-vector.mjs`, `node hoc/kiem-gioi-thieu-part.mjs`, `node hoc/kiem-tay-gap.mjs`, `node hoc/kiem-tay-xoay.mjs`, `node hoc/kiem-che-tay-xoay.mjs`, `node hoc/kiem-rap-tay.mjs`, `node hoc/kiem-lap-rap.mjs`, `node hoc/kiem-khay.mjs`, `node hoc/kiem-huy-hieu-phim-vector.mjs`, `node hoc/kiem-nut-mo-dau-phim-vector.mjs`, `node hoc/kiem-huong-dan.mjs`, `node hoc/kiem-chuoi.mjs` (và `grep -l "the-part\|GioiThieuPart\|'kep'" hoc/kiem-*.mjs`).
- Thêm ca kiểm cho thẻ bộ phận: đã xem 'kep' → robot 'xoay' chỉ ra thẻ lệnh mới arm_left / arm_right; chưa xem → thẻ đầy đủ. Cắm lỗi giả cho đỏ rồi gỡ.
- Bốn PHANH so lệnh vẽ với `NEN_VEC` (13a-v, A3-v / B5-v, C3-v) SẼ đỏ vì đổi hình tay kẹp. Không được tắt. Quy trình: commit vẽ; CHỨNG MINH chỗ đỏ chỉ do tệp của bạn (tạm hoàn riêng các tệp vẽ đã sửa về ad0899a bằng `git show ad0899a:<tệp> > <tệp>`, chạy lại phanh, phải xanh; khôi phục); dời `const NEN_VEC` ở cả ba tệp sang SHA commit vẽ, kèm chú thích theo mẫu, commit riêng; ghi lệnh + kết quả vào báo cáo.
- Xem bằng mắt: server cổng KHÁC 4181 (vd `PORT=4196 node server.mjs` chạy nền); localStorage trống; `GoLoi.datMoHet(true)`; vào `tay-gap.1` (thẻ bộ phận tay kẹp) rồi `tay-xoay.1` (phải chỉ là thẻ lệnh mới); xem huy hiệu gói 2 / 4 / 6 và sân. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Phải đổi mã bộ phận trong dữ liệu màn; phải đổi luật chạy; hình tay kẹp phải tràn khỏi ô (đổi khung).

## BÁO CÁO CUỐI (ghi `hoc/ban-giao/bao-cao-V8c.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, danh sách chỗ hiển thị đã đổi / để nguyên, lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT (nếu có việc cần user quyết): vấn đề, bảng phương án, ưu tiên.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 – 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
