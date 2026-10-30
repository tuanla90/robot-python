# Brief SM1-A lượt 2 (tiếp gói A sửa mùa 1)

LOẠI: Ship          MODEL: fable (như lượt 1: điểm 7)

Đọc trước, theo thứ tự: brief lượt 1 `hoc/ban-giao/brief-SM1A-kho-hang-banh-lui.md` (mọi luật NHỊP, LUẬT THIẾT KẾ MÀN, PHẠM VI, CÁCH GIAO, PHẢN BIỆN, KIỂM TRA, DỪNG VÀ HỎI vẫn áp dụng y nguyên), rồi báo cáo lượt 1 `hoc/ban-giao/bao-cao-SM1A.md` (agent lượt 1 đã làm gì, đề xuất A / B / C). Cùng worktree `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\sua-mua-1-a`, nhánh `claude/sua-mua-1-a` (đang ở 031ee61, sạch). Commit đầu tiên trong ~20 phút.

## Nghiệm thu lượt 1 (người giao)
Đạt. Người giao đã gộp tới 031ee61 vào nhánh của mình, chạy lại máy kiểm tại đó đều xanh; đã xem trên trình duyệt kho-hang.4 (3 sao, 26 + 27 + 24 nhịp) và che-banh-lui.5 (3 sao).

## VIỆC (theo thứ tự)
1. SỬA LỖI (làm trước): hàm của màn `dock` ở che-banh-lui.5 trùng tên hàm cốt truyện `dock` do che-drone.11 (mùa 4) tạo. Người chơi đã qua mùa 4 chơi lại màn này thấy bảng thắng báo "hàm dock() của em được thay bằng hàm của màn". Đổi tên hàm của màn sang tên chưa có trong `ManHoc.hamCotTruyen()` và chưa là hàm của màn nào khác (nạp lộ trình: `require('./hoc/lo-trinh-hoc.js')`). Thêm vào máy kiểm của gói (kiem-banh-lui-them.mjs hay kiem-kho-hang-them.mjs) một ca: mọi hàm của màn của các màn gói A tạo / viết lại không trùng tên hàm cốt truyện nào (cắm lỗi giả cho đỏ rồi gỡ). Bảy chỗ trùng có từ trước (xuong-ham.1 move, che-tay.7 go_get, combo.3 / che-combo.7 cross, che-cam-bien.10 fetch_back, tham-so.1 / .2 forward) KHÔNG phải việc của gói này: chỉ ghi vào báo cáo.
2. Đề xuất A, phương án A2 (người giao chốt): gộp ba màn "đường về" (che-xe.7 come_back, che-tay.7 put_back, che-lap.7 come_home): giữ MỘT (chọn màn mà hàm cốt truyện của nó được dùng về sau; kiểm hamCuaEmCan), giữ hai màn kẹt số (che-xe.9, che-tay.9). Hai chỗ trống thay bằng màn MỚI lùi + cảm biến khoảng cách + tay (nhắc gói 2, 3), đúng luật đường cong, có lời giải khác, lời sai, bộ dò lách.
3. Đề xuất B (người giao chốt làm): nut-de.10 và banh-lui.4 tính nhịp theo sân dài nhất (`nhipTheo: 'max'` như trùm mới che-banh-lui.5), đo lại sao bằng `node tools/do-lo-trinh.mjs --ghi-sao`; sao đã lưu giữ. Sửa máy kiểm nào đang ghi cứng số nhịp cũ.
4. Đề xuất C: để nguyên che-xe.1, .2.

## BÁO CÁO
Thêm mục "Lượt 2" vào `hoc/ban-giao/bao-cao-SM1A.md` (đủ 5 mục như lượt 1), commit. Câu trả lời cuối: tóm tắt 5 mục.
Lưu ý công cụ: hook phiên có thể chặn công cụ Write / Edit sang worktree này; lượt 1 đã ghi tệp bằng cách ghi vào scratchpad rồi `cp`, và thay chuỗi bằng script node. Shell Git Bash: lệnh node thêm `< /dev/null`.
