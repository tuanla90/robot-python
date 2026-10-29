# Brief V8b: tay xoay cùng kiểu hình với tay kẹp (part nâng cấp dùng chung một hình)

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (đường vẽ robot chung VeVector), giá sai 1, mơ hồ 1, suy luận 1 = 5)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút. Tối đa 40 phút phải có một commit.
- Hết sức thì dừng và báo còn gì. Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: nhìn tay xoay (`hoc/game/ve-vector-tay-xoay.js`, mã 'xoay') người chơi nhận ra ngay đó là TAY KẸP (`ve-vector-tay-kep.js`, mã 'kep') được nâng cấp thêm khớp xoay:
cùng kiểu càng (càng cong viền chàm vecVien + lõi bạc vecNgon như tay kẹp), cùng cụm giữa trắng bo tròn có chấm đèn; cái KHÁC duy nhất là khớp tròn cho thấy tay quay được.
Mọi cơ chế của tay xoay giữ nguyên (góc liên tục / nấc trái, trước, phải, luật vươn L0 / L1, mở / khép dần moK, ôm vật, lề tràn, vatXoay).

## BỐI CẢNH (lời user 29/10, nguyên văn)
"bạn xem hộ tôi các part có nâng cấp, mở cách chơi mới đều đang dùng chung 1 hình ảnh nhưng tay kẹp và tay kẹp có cần xoay đang dùng 2 hình khác nhau."
Người giao đã xem (kiểm lại, đừng tin): cảm biến khoảng cách → cảm biến bên, hai bánh → bánh lùi đều cùng một hình bộ phận. Tay kẹp: càng CONG, chốt giữa chấm đèn tối;
tay xoay: ngón VUÔNG (thanh ngang + hai ngón thẳng), nắp khớp xanh lá / hổ phách, cổ tay tím. Xem nhanh: `VeIcon.hinhPartVec({loai:'tay',ma:'kep'})` và `ma:'xoay'`,
huy hiệu `HuyHieu.mk('tay-gap','mo',3)` / `HuyHieu.mk('tay-xoay','mo',3)`; trong game: màn `tay-xoay.1`, `tay-gap.1`.
Màu nắp khớp hiện đang báo tay nâng (xanh lá) / hạ (hổ phách); tay kẹp báo hạ bằng chấm đèn cam (BM.robotCam). Chọn một cách báo nâng / hạ chung cho hai tay nếu được, nói lý do.

## PHẠM VI
Được sửa: `hoc/game/ve-vector-tay-xoay.js` (chính), có thể `hoc/game/ve-vector-tay-kep.js` chỉ để tách hàm vẽ càng dùng chung (không đổi hình tay kẹp), `hoc/game/bang-mau.js` (chỉ THÊM vai màu nếu cần), máy kiểm `hoc/kiem-*.mjs`.
KHÔNG sửa: luật chạy / lõi (`nhan/`, `hoc/san-hoc.js`, `hoc/cham.js`), dữ liệu màn, thân, tay khác, giao diện ngoài.
Giữ nguyên: `diemNeo`, `khop`, `tran`, `vatKep` / `vatXoay` và mọi số đo vị trí vật (kiem-ve-vector mục 13h / 13i kiểm), hoạt cảnh mở / khép dần.

## CÁCH GIAO
Worktree riêng đã dựng: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v8b-tay-xoay-dong-bo`, nhánh `claude/v8b-tay-xoay-dong-bo` (từ e4b3e11 + commit brief này).
Commit từng bước. KHÔNG push, KHÔNG merge, KHÔNG đụng `main`. Bạn là agent duy nhất lúc này.

## PHẢN BIỆN (bắt buộc đọc)
Brief là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Kiểm lại từng khẳng định bằng code, đừng tin. Được phép và được khuyến khích nói ngược lại.
Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Quyết định của USER (không tự đi ngược): đồ hoạ vector (không pixel), màu đội R1 #38BDF8 / R2 #F472B6 (tay không mang màu đội: kiem-ve-vector mục 12e), chữ hiển thị không emoji, không gạch dài.

## KIỂM TRA (máy yếu RAM)
- CẤM `npm test` cả bộ. Chạy tuần tự: `node hoc/kiem-ve-vector.mjs`, `node hoc/kiem-tay-xoay.mjs`, `node hoc/kiem-che-tay-xoay.mjs`, `node hoc/kiem-huy-hieu-phim-vector.mjs`, `node hoc/kiem-nut-mo-dau-phim-vector.mjs`, `node hoc/kiem-combo-mua-1.mjs` (và `grep -l "xoay" hoc/kiem-*.mjs` tìm máy kiểm khác).
- Bốn PHANH so lệnh vẽ với `NEN_VEC` (13a-v trong kiem-ve-vector, A3-v / B5-v trong kiem-huy-hieu-phim-vector, C3-v trong kiem-nut-mo-dau-phim-vector) SẼ đỏ vì bạn cố ý đổi hình. Không được tắt. Cách làm đúng:
  1. commit thay đổi vẽ;
  2. CHỨNG MINH chỗ đỏ chỉ do tệp của bạn: tạm hoàn riêng các tệp đã sửa về e4b3e11 (`git show e4b3e11:<tệp> > <tệp>`), chạy lại các phanh, phải xanh; khôi phục;
  3. dời `const NEN_VEC` ở cả ba tệp kiểm sang SHA commit vẽ của bạn, kèm chú thích theo mẫu dòng hiện tại, commit riêng;
  4. ghi bước 2 (lệnh + kết quả) vào báo cáo.
- Xem bằng mắt: server cổng KHÁC 4181 (vd `PORT=4195 node server.mjs` chạy nền); `GoLoi.datMoHet(true)`, `App.vaoMan('tay-xoay.1')` và `tay-gap.1`; chụp tay xoay ở nấc trái / trước / phải, mở / đóng / cầm vật, nâng / hạ, cạnh tay kẹp; xem cả huy hiệu gói 2 và gói 6. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Phải dời ổ gắn / số đo vật; phải đổi luật chạy; phạm vi phình sang tay khác.

## BÁO CÁO CUỐI (ghi `hoc/ban-giao/bao-cao-V8b.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT (nếu có việc cần user quyết): vấn đề, bảng phương án, ưu tiên.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 – 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
