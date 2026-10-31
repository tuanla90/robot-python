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
- **Mùa 1:** từ gói 7 R1 tay kẹp → tay xoay; gói 10 (20 màn) mỗi màn 3 ngày (PDM1), cả 20 màn tính TỔNG nhịp mọi ngày (`nhipTheo: 'tong'`) và đã qua bộ dò `dayChung` (không dãy cố định không cảm biến nào thắng cả 3 ngày trong `sao.nhip`). Mùa 1 giữ gói 8 Gặp R2, gói 9 Nhìn bên nhặt bên (không có mùa trước).
- **Mùa 2:** cả 10 gói trên xe cứu hỏa (xích + vòi + hồng ngoại). Gói 1 biến thành "Đi xoắn ốc"; băng chuyền thành "Canh băng chở thùng" (lõi mới `man.thungThem`);
  gói 8 MỚI "Góc kho cũ" (kho-cu); gói 9 "R2 trở lại" (R2 = xe chở hàng mùa 1); gói 10 "Dập lửa" một robot nhiều sân. Bệ vòi xích và gói Đội cũ cất ra mùa ẩn (không xoá).
- **Lõi:** nhện gắn được cảm biến từ, đo theo cạnh trước cố định (hướng xuất phát), hình nhện quay theo; `thungThem`; luật lắp ráp theo đó.
- Soát trình duyệt: trum-mua-1.4, bang-chuyen.10, kho-cu.10 (3 sao, console sạch); agent soát tong-hop-2.8, trum-mua-2.10.

- **Mùa 3 (PDM3a + PDM3b1 + PDM3b2):** cả 10 gói mùa 3 đã dựng lại hoàn chỉnh trên robot phân loại (nhện + nam châm bụng + cảm biến từ ở hông):
  - Gói 2–4 (PDM3a: `nam-cham`, `cam-ung-tu`, `bai-tu`), gói 5–7 (PDM3b1: `nhay`, `dao-cuc`, `doc-cuc`).
  - Gói 8 MỚI "Băng chuyền cũ" (`bang-cu`, `che-bang-cu` trong `man-bang-cu.js`, 20 màn); gói `bung-nhen` cũ cất sang `CAT_MUA_3` (mùa 5 ẩn).
  - Gói 9 "Đội xích và nhện" (`doi-xich.11..20`, `che-doi-xich.11..20` trong `man-doi-xich-nhen.js`): R1 = robot phân loại mùa 3 đầy đủ, R2 = xe cứu hỏa mùa 2 đầy đủ.
  - Gói 10 "Tổng hợp + Trùm mùa" (`tong-hop-3.1..10`, `trum-mua-3.1..10` trong `man-trum-mua-3.js`): 20 màn 1 robot nhiều sân (`nhipTheo: 'tong'`), có lời sai `cung: true`.
  - Xoá `CAP_HAM_CU_3` / `THAN_CU_3`, nâng `GOI_SIET_3 = 10`, thêm `'mua-3'` vào `XONG` trong `kiem-part-mua.mjs` (`0 màn sai luật part`), 0 chỗ nhảy đường cong mùa 3.

- **Mùa 4 (PDM4a + PDM4b + PDM4c):** cả 10 gói mùa 4 đã dựng lại hoàn chỉnh trên drone nông nghiệp (drone + miệng gieo `son` + `camera-4` bốn hướng + nhìn dưới chân `taiCho: true` từ gói 7):
  - Gói 1–4 (PDM4a: `drone`, `may-son`, `cam-bon`, `pho-mau`), gói 5–7 (PDM4b: `tram-sac`, `net-lien`, `nhin-duoi`).
  - Gói 8 MỚI "Vườn cũ rào sắt" (`vuon-cu`, `che-vuon-cu` trong `man-vuon-cu.js`, 20 màn: drone nông nghiệp gặp yếu tố mùa 1–3, chế `span_sow(c, n)`, `mark_here(n)`, `gate_sow(c)`, `sow_up(n)`); gói 9 cũ `son-tren-cao` cất sang `CAT_MUA_4` (mùa 5 ẩn).
  - Gói 9 "Đội drone và nhện" (`doi-nam-cham.11..20`, `che-doi-nam-cham.11..20` trong `man-doi-chia-hang.js`, 20 màn): R1 = drone nông nghiệp mùa 4 đầy đủ, R2 = nhện phân loại mùa 3 đầy đủ (chế `pad_hold(d)`, `wait_sow(c, n)`, `pole_gate()`); 20 màn cũ `doi-nam-cham.1..10`, `che-doi-nam-cham.1..10` dời sang gói ẩn `doi-nam-cham-cu` (mùa 5).
  - Gói 10 "Tổng hợp + Trùm mùa" (`tong-hop-4.1..10`, `trum-mua-4.1..10` trong `man-trum-mua-4.js`): 20 màn 1 robot drone nông nghiệp, mỗi màn 2 sân ("ngày làm việc", `nhipTheo: 'tong'`), có lời sai `cung: true`, chế `charge_if(k)`, `sow_marks(n)`, `stair_line(c, n)`, `up_sow()`, `bar_len(c, a)`, `field_row(c, n)`, `field_dock(c, n)`, `two_marks(n)`.
  - Xoá `CAP_HAM_CU_4`, nâng `GOI_SIET_4 = 10`, thêm `'drone-ke-vach'` vào `GOI_NHIEU_SAN`, khóa `'mua-4'` vào `XONG` trong `kiem-part-mua.mjs` (`0 màn sai luật part` cho cả mùa 1–4).

## Còn phải làm (lần lượt)
1. ~~Mùa 1 gói 10 đổi sang tính TỔNG nhịp mọi sân (PDM2c2 phát hiện: tính theo sân dài nhất thì dãy viết cứng vẫn 3 sao) + chạy bộ dò dayChung.~~ **Đã xong:** cả 20 màn gói 10 mùa 1 (`robot-hoan-thien` + `trum-mua-1`) đã chuyển sang `nhipTheo: 'tong'`, cập nhật tay ngưỡng `sao.nhip` trong `lo-trinh-sao.js` và `man-trum-mua-1.js`, dời thùng đỏ ngày 1 của `robot-hoan-thien.4` lên `(1,1)` (`sao.nhip: 74`), khóa `GOI_NHIEU_SAN` bắt buộc `nhipTheo === 'tong'` trong `kiem-lo-trinh.mjs`, và chạy bộ dò `dayChung` đạt 100% (`dc === null` trên cả 20 màn gói 10 mùa 1 và 10 màn ngân hàng `man-robot-hoan-thien.js`).
2. Sau cùng: gộp main (báo các phiên khác trước: phiên Phim CLB đang dựa danh sách gói mới), cập nhật KE-HOACH-7-MUA.md bảng bố cục gói 8–10.

## Bài học
- Agent nào cũng để lại hồi quy ở máy kiểm ngoài danh sách (sổ lệnh, kiem-khay, kiem-hoc, kiem-phim-goi, kiem-huy-hieu-phim-vector, kiem-goi-doi…): cho agent chạy
  `npm test` cả bộ sau mỗi gói (một agent một lúc thì RAM chịu được), người giao vẫn tự chạy lại.
- Không chạy `tools/do-lo-trinh.mjs --ghi-sao` (ghi lại cả mục không liên quan); sửa tay đúng mục trong hoc/lo-trinh-sao.js.
- Hàm của em mới không được trùng tên hàm của màn ở mùa sau (step → stair_down).
- Gói 10: tính tổng nhịp; mỗi màn có lời viết cứng thua ở ít nhất một sân.

## Câu hỏi chờ user (chi tiết ở sổ trao đổi)
Sổ lệnh đọc theo lộ trình? · bật "húc tường là thua" cho gói 10? · robot-hoan-thien.8 giống .5 · băng chuyền màn 6–9 lặp khung ·
smart_spray / auto_spray gần nhau · cảm biến từ trên nhện đo theo hướng xuất phát (Claude tự quyết) · đâm-là-thua chưa áp cho màn đội (lõi).
