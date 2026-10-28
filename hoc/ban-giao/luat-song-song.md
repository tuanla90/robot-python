# Luật chung khi các agent chạy SONG SONG (28/10 chiều, đọc trước brief riêng)

User 28/10: "tôi đang dùng máy nên máy sẽ thức, nhưng cần hạn chế build/test vì hết ram; giao nhiều agent làm các việc song song".
Máy 16 GB, thường chỉ còn ~1,5 GB trống. Ba agent chạy cùng lúc, cả ba tách từ nhánh chính ở 6348c9f (đã có V5a, V5b, V6, V6b, V6c, gói 8, gói 9):

| Gói | Model | Worktree (D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\…) | Nhánh | Cổng server tạm |
|---|---|---|---|---|
| Gói 10 mùa 2 "Nhà máy chạy lại" (màn) | fable | goi10-trum-mua-2 | claude/trum-mua-2 | không dùng |
| Phim mùa 2 (phim mở gói) | opus | phim-mua-2 | claude/phim-mua-2 | 4202 |
| V7a vector dọn đuôi (huy hiệu, sân, tay) | opus | v7a-ve-vector-duoi | claude/ve-vector-duoi | 4203 |

## RAM: luật cứng
- **CẤM `npm test`** (cả bộ ~10 phút, rất nặng). Người giao chạy cả bộ MỘT lần sau khi gộp. Chỉ chạy máy kiểm của gói mình và các máy kiểm liên quan, từng tệp một:
  `node hoc/kiem-<tên>.mjs`. Không chạy hai lệnh node nặng cùng lúc.
- Server tạm: chỉ khi cần trình duyệt, đúng cổng của mình ở bảng trên, chạy nền, **tắt ngay khi xem xong**. Cổng 4181 là của người giao: không dùng, không tắt.
- Trình duyệt: mỗi agent đúng MỘT tab của mình (tabs_create), đóng tab khi xong; không reload / sửa tab khác, không gắn vào Chrome headless của agent khác.
  Game có service worker (sw.js, bộ đệm 'duong-hoc-v1'): mở trang lần đầu thì gỡ SW + xoá caches trong trang rồi tải lại. Ô trình duyệt có thể bị ẩn làm hoạt cảnh / tải trang đứng:
  dùng get_page_text / javascript thay ảnh chụp.
- Không cài gói, không build, không tải gì.

## Tệp: ai được đụng gì
- Mỗi gói chỉ ghi tệp trong PHẠM VI của brief mình. Tệp dùng chung dưới đây chỉ được **THÊM dòng ở chỗ của mình, CẤM định dạng lại / sắp lại / sửa dòng người khác**:
  `hoc/game/huy-hieu.js` (gói 10 thêm HINH pixel; V7a không đụng tệp này, vẽ vector ở huy-hieu-vector.js), `hoc/so-lenh.js` (gói 10), `hoc/kiem-che-xe.mjs` (gói 10 một dòng),
  `hoc/game/chu.js` (phim mùa 2 thêm khoá `pg.*`), `hoc/game/choi.html` (phim thêm thẻ script; V7a nếu cần), `hoc/game/bang-mau.js` (chỉ THÊM vai mới, một khối có chú thích tên gói),
  `hoc/kiem-bang-mau.mjs` SUA_SAU_NEN (thêm dòng; khoá đã có thì nối lý do vào cuối chuỗi của khoá đó, KHÔNG tạo khoá trùng).
- Kế hoạch (`hoc/KE-HOACH-*.md`) và sổ canh do người giao ghi. Agent KHÔNG sửa (trừ khi brief nói rõ, vd phim mùa 2 ghi kịch bản vào KE-HOACH-PHIM-GOI.md).
- Không merge, không rebase, không push, không đụng nhánh / worktree khác. Commit từng bước trên nhánh của mình, message tiếng Việt, cuối message dòng
  `Co-Authored-By: Claude <model> <noreply@anthropic.com>` đúng model của bạn (Claude Opus 5.5 / Claude Fable 5.1).

## Chung
- Shell là Git Bash trên Windows; `cat > file` không có stdin sẽ treo, nên ghi tệp bằng công cụ ghi tệp.
- Kiểm lại từng khẳng định trong brief bằng code, đừng tin. Được phép nói ngược lại brief (có bằng chứng): ghi vào CÂU HỎI CẦN LÀM RÕ.
- Vướng mà tự quyết có thể sai hướng thì DỪNG, commit WIP, ghi câu hỏi vào báo cáo cuối.
- Tắt mọi server / tác vụ nền trước khi kết thúc.
- Chữ hiển thị: tiếng Việt, không emoji, không dấu gạch dài. Màu đội R1 #38BDF8, R2 #F472B6. Pixel giữ y nguyên từng điểm ảnh tới V7b (gói sau cả ba gói này).
