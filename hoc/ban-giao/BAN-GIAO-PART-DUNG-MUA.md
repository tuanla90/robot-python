# Bàn giao: dựng lại mùa 1–4 theo luật "R1 là cỗ máy của mùa" (31/10–01/11/2026)

## Bối cảnh
User 31/10 chốt khuôn mới mỗi mùa (kế hoạch: `hoc/KE-HOACH-PART-DUNG-MUA.md`):
1 thân · 2 tay · 3 cảm biến · 4 yếu tố sân · 5–7 nâng cấp · 8 cỗ máy gặp yếu tố mùa trước · 9 đội, R2 của Luna lắp part mùa trước · 10 R1 chạy một mình, mỗi màn 2–3 sân.
R1 không bao giờ mang part mùa khác; tự lắp tuỳ ý để mùa 7. User: "chốt và dựng lại từ mùa 1 đến mùa 4. bạn làm lần lượt".

## Nơi làm
- Nhánh `claude/part-dung-mua`, worktree `.claude/worktrees/part-dung-mua`, tách từ main 0fed47a. CHƯA gộp main, chưa push.
- Cách làm: phiên chính lập kế hoạch + nghiệm thu, mỗi lúc một agent viết màn THẲNG trên nhánh này (agent không ghi được worktree khác vì phiên bị khoá worktree).
- Brief: `hoc/ban-giao/brief-PDM*.md`. Sổ tự quyết + câu hỏi chờ user: `hoc/ban-giao/can-trao-doi-part-dung-mua.md` (mục 1–10).
- Máy kiểm canh luật: `hoc/kiem-part-mua.mjs` (mùa trong XONG thì chặt; `--chi-tiet` liệt kê màn sai; `--loi-gia` tự chứng minh bắt lỗi).
- Xem game: `.claude/launch.json` của worktree, cấu hình `game-part-dung-mua` cổng 4199; vào thẳng màn: `choi.html?debug=1&man=<mã>&loigiai=1`.

## Đã xong (nghiệm thu: Claude tự chạy `npm test` cả bộ 106/106 đạt sau mùa 2, commit 17effe8)
- **Mùa 1:** từ gói 7 R1 tay kẹp → tay xoay; gói 10 (20 màn) mỗi màn 3 ngày (PDM1). Mùa 1 giữ gói 8 Gặp R2, gói 9 Nhìn bên nhặt bên (không có mùa trước).
- **Mùa 2:** cả 10 gói trên xe cứu hỏa (xích + vòi + hồng ngoại). Gói 1 biến thành "Đi xoắn ốc"; băng chuyền thành "Canh băng chở thùng" (lõi mới `man.thungThem`);
  gói 8 MỚI "Góc kho cũ" (kho-cu); gói 9 "R2 trở lại" (R2 = xe chở hàng mùa 1); gói 10 "Dập lửa" một robot nhiều sân. Bệ vòi xích và gói Đội cũ cất ra mùa ẩn (không xoá).
- **Lõi:** nhện gắn được cảm biến từ, đo theo cạnh trước cố định (hướng xuất phát), hình nhện quay theo; `thungThem`; luật lắp ráp theo đó.
- Soát trình duyệt: trum-mua-1.4, bang-chuyen.10, kho-cu.10 (3 sao, console sạch); agent soát tong-hop-2.8, trum-mua-2.10.

## Đang dở
- **PDM3a (mùa 3 gói 2–4, 60 màn sang nhện + nam châm bụng + cảm biến từ):** agent đã commit đủ ba gói (f036203 gói 2, f54ec9a gói 3, 9fc3685 gói 4,
  54db835 siết kiem-lo-trinh). Agent báo `npm test` cả bộ 106/106 tại 54db835 (Claude CHƯA tự chạy lại). Claude soát trình duyệt logic-nam-cham.6 (điều kiện
  `and` hai vế chuỗi): 3 sao. Sổ trao đổi mục 11 có câu hỏi của đợt này (damLaThua cho nhện, máy dò lách mùa 3 không dò màn nhện, phim gói 2–4 còn vẽ xe cũ).
  Gói 7 và gói 10 mùa 3 đang chạy tạm bằng hàm xe cũ cấp `capCu` (CAP_HAM_CU_3, THAN_CU_3): PDM3b/3c phải gỡ, rồi 'mua-3' vào XONG và GOI_SIET_3 lên 10.
  Phiên sau: tự chạy `npm test` cả bộ rồi giao PDM3b (gói 5–7).

## Còn phải làm (lần lượt)
1. Nghiệm thu PDM3a: `npm test` cả bộ, soát vài màn gói 2–4 trên trình duyệt.
2. PDM3b mùa 3 gói 5–7 rồi gói 8–10 (brief `brief-PDM3b-mua-3-goi-5-10.md`, nên giao hai đợt: 5–7, 8–10), commit cuối 'mua-3' vào XONG.
3. Mùa 4 (brief `brief-PDM4-mua-4.md`, ba đợt: gói 1–4, 5–7, 8–10), commit cuối 'mua-4' vào XONG.
4. Mùa 1 gói 10 đổi sang tính TỔNG nhịp mọi sân (PDM2c2 phát hiện: tính theo sân dài nhất thì dãy viết cứng vẫn 3 sao) + chạy bộ dò dayChung.
5. Sau cùng: gộp main (báo các phiên khác trước: phiên Phim CLB đang dựa danh sách gói mới), cập nhật KE-HOACH-7-MUA.md bảng bố cục gói 8–10.

## Bài học
- Agent nào cũng để lại hồi quy ở máy kiểm ngoài danh sách (sổ lệnh, kiem-khay, kiem-hoc, kiem-phim-goi, kiem-huy-hieu-phim-vector, kiem-goi-doi…): cho agent chạy
  `npm test` cả bộ sau mỗi gói (một agent một lúc thì RAM chịu được), người giao vẫn tự chạy lại.
- Không chạy `tools/do-lo-trinh.mjs --ghi-sao` (ghi lại cả mục không liên quan); sửa tay đúng mục trong hoc/lo-trinh-sao.js.
- Hàm của em mới không được trùng tên hàm của màn ở mùa sau (step → stair_down).
- Gói 10: tính tổng nhịp; mỗi màn có lời viết cứng thua ở ít nhất một sân.

## Câu hỏi chờ user (chi tiết ở sổ trao đổi)
Sổ lệnh đọc theo lộ trình? · bật "húc tường là thua" cho gói 10? · robot-hoan-thien.8 giống .5 · băng chuyền màn 6–9 lặp khung ·
smart_spray / auto_spray gần nhau · cảm biến từ trên nhện đo theo hướng xuất phát (Claude tự quyết) · đâm-là-thua chưa áp cho màn đội (lõi).
