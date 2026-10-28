# Luật chung khi 4 agent chạy SONG SONG (28/10, đọc trước brief riêng)

User 28/10: "tôi đang dùng máy nên máy sẽ thức, nhưng cần hạn chế build/test vì hết ram; giao nhiều agent làm các việc song song".
Máy 16 GB, lúc giao chỉ còn ~1,5 GB trống. Bốn agent đang chạy cùng lúc:

| Gói | Ai | Worktree (D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\…) | Nhánh | Cổng server tạm |
|---|---|---|---|---|
| V5b giao diện các màn khác (vector) | agent Claude | v5b-giao-dien-b | claude/ve-vector-giao-dien-b (từ fa3702f) | 4201 |
| V6 huy hiệu + phim vector | agent Claude | v6-huy-hieu-phim | claude/ve-vector-huy-hieu-phim (từ fa3702f) | 4202 |
| Gói 8 mùa 2 Đội | Gemini | goi8-doi-mua-2 | claude/doi-mua-2 (từ d3af762) | không dùng |
| Gói 9 mùa 2 Bệ súng xích | Gemini | goi9-be-sung | claude/be-sung (từ d3af762) | không dùng |

## RAM: luật cứng
- **CẤM `npm test`** (cả bộ ~10 phút, rất nặng). Người giao chạy cả bộ MỘT lần sau khi gộp. Chỉ chạy máy kiểm của gói mình và các máy kiểm liên quan, từng tệp một:
  `node hoc/kiem-<tên>.mjs` hay `npm test -- hoc/kiem-<tên>` (lọc theo chuỗi, chỉ chạy tệp khớp). Không chạy hai lệnh node nặng cùng lúc.
- Server tạm: chỉ khi cần trình duyệt, đúng cổng của mình ở bảng trên, chạy nền, **tắt ngay khi xem xong** (đừng để chạy suốt). Cổng 4181 là của người giao: không dùng, không tắt.
- Trình duyệt (ô Trình duyệt dùng chung): mỗi agent đúng MỘT tab của mình (tabs_create), đóng tab khi xong; không reload / sửa tab khác. Gemini không dùng trình duyệt.
- Không cài gói, không build, không tải gì ngoài thứ brief nói.

## Tệp: ai được đụng gì
- Mỗi gói chỉ ghi tệp trong PHẠM VI của brief mình. Tệp dùng chung dưới đây chỉ được **THÊM dòng ở chỗ của mình, CẤM định dạng lại / sắp lại / sửa dòng người khác**:
  `hoc/game/huy-hieu.js` (gói 8, 9 thêm hình huy hiệu mới kiểu pixel như cũ; V6 đổi cách vẽ, KHÔNG sửa các `HINH[...]` có sẵn trừ khi cần cho vector, và phải để huy hiệu chưa có bản vector tự rơi về pixel),
  `hoc/so-lenh.js` (gói 8, 9 thêm mục hàm của em), `hoc/kiem-che-xe.mjs` (gói 8, 9 thêm một dòng chương → nhóm), `hoc/game/bang-mau.js` (V5b, V6 chỉ THÊM vai `vec*` mới, mỗi gói một khối riêng có chú thích tên gói),
  `hoc/game/choi.html` (V5b, V6 chỉ thêm thẻ link / script cần thiết).
- Kế hoạch (`hoc/KE-HOACH-*.md`) và sổ canh do người giao ghi. Agent KHÔNG sửa.
- Không merge, không rebase, không push, không đụng nhánh / worktree khác. Commit từng bước trên nhánh của mình, message tiếng Việt, cuối message dòng
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (agent Claude) hay `Co-Authored-By: Gemini <noreply@google.com>` (Gemini).

## Chung
- Shell là Git Bash trên Windows; `cat > file` không có stdin sẽ treo, nên ghi tệp bằng công cụ ghi tệp.
- Kiểm lại từng khẳng định trong brief bằng code, đừng tin. Được phép nói ngược lại brief (có bằng chứng): ghi vào CÂU HỎI CẦN LÀM RÕ.
- Vướng mà tự quyết có thể sai hướng thì DỪNG, commit WIP, ghi câu hỏi vào báo cáo cuối.
- Tắt mọi server / tác vụ nền trước khi kết thúc.
