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

- **Mùa 4 / 6 Nông trại (PDM4a + PDM4b + PDM4c):** cả 10 gói mùa Nông trại đã dựng lại hoàn chỉnh trên drone nông nghiệp (drone + miệng gieo `son` + `camera-4` bốn hướng + nhìn dưới chân `taiCho: true` từ gói 7):
  - Gói 1–4 (PDM4a: `drone`, `may-son`, `cam-bon`, `pho-mau`), gói 5–7 (PDM4b: `tram-sac`, `net-lien`, `nhin-duoi`).
  - Gói 8 MỚI "Vườn cũ rào sắt" (`vuon-cu`, `che-vuon-cu` trong `man-vuon-cu.js`, 20 màn: drone nông nghiệp gặp yếu tố mùa 1–3, chế `span_sow(c, n)`, `mark_here(n)`, `gate_sow(c)`, `sow_up(n)`); gói 9 cũ `son-tren-cao` cất sang `CAT_MUA_4` (mùa 5 ẩn).
  - Gói 9 "Đội drone và nhện" (`doi-nam-cham.11..20`, `che-doi-nam-cham.11..20` trong `man-doi-chia-hang.js`, 20 màn): R1 = drone nông nghiệp mùa 4 đầy đủ, R2 = nhện phân loại mùa 3 đầy đủ (chế `pad_hold(d)`, `wait_sow(c, n)`, `pole_gate()`); 20 màn cũ `doi-nam-cham.1..10`, `che-doi-nam-cham.1..10` dời sang gói ẩn `doi-nam-cham-cu` (mùa 5).
  - Gói 10 "Tổng hợp + Trùm mùa" (`tong-hop-4.1..10`, `trum-mua-4.1..10` trong `man-trum-mua-4.js`): 20 màn 1 robot drone nông nghiệp, mỗi màn 2 sân ("ngày làm việc", `nhipTheo: 'tong'`), có lời sai `cung: true`, chế `charge_if(k)`, `sow_marks(n)`, `stair_line(c, n)`, `up_sow()`, `bar_len(c, a)`, `field_row(c, n)`, `field_dock(c, n)`, `two_marks(n)`.
  - Xoá `CAP_HAM_CU_4`, nâng `GOI_SIET_4 = 10`, thêm `'drone-ke-vach'` vào `GOI_NHIEU_SAN`, khóa `'mua-4'` vào `XONG` trong `kiem-part-mua.mjs` (`0 màn sai luật part` cho cả mùa 1–4).

- **Mùa 5 Bến sông (`mua-5`, PDM-Song-a + PDM-Song-b + PDM-Song-c):** cả 10 gói (200 màn) đã dựng hoàn chỉnh trên xuồng thủy lợi R1 (`than: 'xuong'`, `tay: 'day-keo'` từ gói 2, cảm biến `dong-chay` từ gói 3 + neo tàu gói 5, dây buộc đuôi gói 6, đo sức nước gói 7):
  - Gói 1–4 (PDM-Song-a: `xuong`/`ham-tra-ve`, `day-keo`/`bo-co-dinh`, `dong-chay`/`che-dong-chay`, `cong-thuy-loi`/`che-cong`), gói 5–7 (PDM-Song-b: `tha-neo`/`che-tha-neo`, `buoc-duoi`/`che-buoc-duoi`, `suc-nuoc`/`che-suc-nuoc`).
  - Gói 8 "Vũng bến cũ" (`ben-cu`, `che-ben-cu` trong `man-ben-cu.js`, 20 màn): R1 xuồng thủy lợi gặp cống thủy lợi, dòng nước 2 cấp, vật trôi bè gỗ / bèo lục bình, chế `calm_gate_pass(n)`, `tug_to_gate(tag, n)`, `tail_over_calm(tag, n)`, `dock_old_basin(tag, n)`.
  - Gói 9 "R2 ở bến sông" (`doi-xuong`, `che-doi-xuong` trong `man-doi-xuong.js`, 20 màn): đội 2 robot R1 xuồng thủy lợi mùa 5 + R2 xe chở hàng mùa 1 (`than: 'hai-banh'`, `tay: 'kep'`) trên bờ đè nút mở cửa cảng nổi cho R1 qua kênh, chế `shore_hold(d)`, `canal_pass(n)`, `shore_tug(tag, n)`, `team_river_dock(tag, n)`.
  - Gói 10 "Xuồng thủy lợi R1" (`tong-hop-song`, `trum-mua-song` trong `man-trum-mua-song.js`, 20 màn): R1 chạy một mình 2–3 sân (`nhipTheo: 'tong'`), có lời sai `cung: true`, chế `river_span_pass(a, b)`, `calm_tug_run(tag, n)`, `anchor_gate_tow(tag, n)`, `master_river_dock(tag, n)`.
  - Thêm `'tong-hop-song'` vào `GOI_NHIEU_SAN`, khóa `'mua-5'` vào `XONG` trong `kiem-part-mua.mjs` (cả 7 mùa `mua-1..7` đạt `0 màn sai luật part`).

- **Mùa 8 Hang động đá vôi (`mua-8`, PDM8-a + PDM8-b + PDM8-c):** cả 10 gói (200 màn) đã dựng hoàn chỉnh trên Robot thám hiểm hang động R1 (`than: 'gai'`, `tay: 'loa'` từ gói 2, cảm biến `am-thanh` từ gói 3 + thu gai `thuGai: true` gói 5, phát nốt `phatNot: true` gói 6, thẩm âm `phanAm: true` gói 7):
  - Gói 1–4 (PDM8-a: `banh-gai`/`tu-dien`, `loa`/`tap-hop`, `am-thanh`/`che-am-thanh`, `san-hang-dong`/`che-hang-dong`), gói 5–7 (PDM8-b: `thu-gai`/`che-thu-gai`, `phat-not`/`che-phat-not`, `nghe-not`/`che-nghe-not`).
  - Gói 8 "Hang đá cổ" (`hang-cu`, `che-hang-cu` trong `man-hang-cu.js`, 20 màn): R1 thám hiểm hang động gặp băng chuyền, cổng nhịp `C`, bàn xoay `@` kết hợp đá vôi ướt `I`, ngách hang ngầm, chuông đá và đá chuông, chế `echo_gate()`, `crack_switch()`, `belt_echo()`, `spin_crack()`, `dict_gate(d)`, `unique_echo_step(s)`.
  - Gói 9 "Đội thám hiểm hang" (`doi-hang-dong`, `che-doi-hang-dong` trong `man-doi-hang-dong.js`, 20 màn): đội 2 robot R1 thám hiểm hang động mùa 8 + R2 xe omni mỏ đá mùa 7 (`than: 'omni'`, `tay: 'nem'`, cảm biến `radar`, `omniCheo: true`, `chinhLuc: true`, `nhanDang: true`, `daLapHo: true`) phối hợp hất đá lấp hố `u` / đè nút `M` mở cổng `C` và cộng hưởng âm phá đá chuông qua vách ngăn, chế `fill_for_mate(k)`, `crack_for_mate()`, `heavy_gate_lob(k)`, `wait_crack_go(k, n)`, `shape_lob_step()`, `dict_team_lob(d)`.
  - Gói 10 "Robot hang động R1" (`tong-hop-hang`, `trum-mua-hang` trong `man-trum-mua-hang.js`, 20 màn): R1 chạy một mình 2–3 sân (`nhipTheo: 'tong'`), có lời sai `cung: true`, chế `echo_crack_step()`, `tunnel_crack_glide()`, `master_echo_crack()`, `dict_glide_echo(d)`, `unique_cave_march(n, s)`.
  - Thêm `'tong-hop-hang'` vào `GOI_NHIEU_SAN`, khóa `'mua-8'` vào `XONG` trong `kiem-part-mua.mjs` (toàn bộ 8 mùa `mua-1..8` = 1.600 màn chính thức đạt `0 màn sai luật part`).

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
