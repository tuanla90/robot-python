# Bàn giao mùa 8 Hang động (16/11/2026)

Kế hoạch: [KE-HOACH-MUA-8.md](../KE-HOACH-MUA-8.md). Nhánh `claude/mua-8-hang-dong`, worktree `.claude/worktrees/mua-8-hang-dong` (máy chủ thử: cấu hình `game-mua-8`, cổng 4220).

**User 16/11: đợi đủ 10 gói viết lại rồi mới gộp main một lần** (không gộp từng phần, không cầu tạm cho màn cũ). Trong lúc đó gộp main vào nhánh khi cần.

## Đã xong

| Phần | Trạng thái | Ở đâu |
|---|---|---|
| P0 khung + đo, P1 khay nhập từ điển / tập hợp / `hear()` `listen()`, P2 vẽ chuông đá, đá chuông, ngách, thẻ Loa / Mic | xong | đã trên main từ 526630b |
| Gộp main mới vào nhánh (231 commit, 5 xung đột) | xong | 3eb0e0a |
| P3 gói 1 Bánh gai: `banh-gai` Bám đá ướt, `tu-dien` Sổ tay đường hang | xong, 20/20 màn đạt máy kiểm | nhánh |
| P3 gói 2 Loa: `loa` Gõ đá chuông, `tap-hop` Không gõ trùng | xong, 20/20 màn đạt máy kiểm | nhánh |
| P3 gói 3 Cảm biến âm thanh: `am-thanh` Nghe tiếng vang, `che-am-thanh` Chế lệnh: dò tiếng vang | xong, 20/20 màn đạt máy kiểm | nhánh |
| P3 gói 4 Ngách hang: `san-hang-dong` Chui ngách ngầm, `che-hang-dong` Chế lệnh: vượt ngách | xong, 20/20 màn đạt máy kiểm | nhánh |
| P3 gói 5 Thu gai: `thu-gai` Lướt đá ướt, `che-thu-gai` Chế lệnh: lướt rồi bám | xong, 20/20 màn đạt máy kiểm | nhánh feb24e1 |
| P3 gói 6 Ngân dài: `phat-not` Vừa đi vừa ngân, `che-phat-not` Chế lệnh: tấu phá đá | xong, 20/20 màn đạt máy kiểm | nhánh 14105db |
| P3 gói 7 Nghe nốt: `nghe-not` Bắt nốt chuông đá, `che-nghe-not` Chế lệnh: giải mã giai điệu | xong, 20/20 màn đạt máy kiểm | nhánh 58aa658 |
| P3 gói 8 Hang có dấu cũ: `hang-cu` Gặp dấu cũ trong hang, `che-hang-cu` Chế lệnh: qua hang cũ | xong, 20/20 màn đạt máy kiểm | nhánh 98dd5c2 |

Gói 2 sửa ở phiên này: loa.2 (lời sai thứ hai thắng 3 sao), loa.6 (đá cách 4 ô không nghe: đi tới chỗ rẽ rồi mới lặp), loa.10 (đường sai, khung 12 dòng),
tap-hop.3 (nước dâng 6 nhịp: tạo túi trong vòng là hết nhịp), tap-hop.4 viết lại "Đếm nốt trong túi" (2 sân, `duLieuSan` cho `s`, `forward(len(s))`),
tap-hop.5 (khối nốt 7 thứ hai trong tầm 3 ô), tap-hop.6 (rim(2), đá trong tầm), tap-hop.7 (đá nốt 2 thứ hai trong tầm, khung 14),
tap-hop.9 và tap-hop.10 viết lại (sổ ghi nốt từng ô, `ring_once(a[k], s)` rồi `move()`; trùm chế `ring_book(book, s)` cho ba sổ dùng chung túi). Mọi ngưỡng sao đo bằng máy chấm.

Soát trên trình duyệt (cổng 4220, `?debug=1&man=…&loigiai=1`): tap-hop.4 (chạm số trong `forward(3)` có chip `len(s)`, thắng 3 sao cả 2 sân), tap-hop.10 (3 sao, huy hiệu), loa.10 (3 sao).

Gói 3 viết lại cả 20 màn: `forward(hear())`, `rim(hear())`, `n = hear()`, `forward(hear() - 1)`, `while hear() == 0`, `while hear() > 0`, đo trước khi gõ đá; mọi màn 2 sân.
Hàm chế: `go_echo()` (thân `forward(hear())`, mùa 9 gọi), `wait_echo()`, `crack_rim(n)` (`gap = hear()`, `play_note(n)`, `rim(gap)`), `echo_spiral()`.
Lưu ý khi dựng sân: đâm vách chỉ chặn bánh (không thua), nên đoạn đo bằng `hear()` mà kết thúc ở chỗ rẽ thì đặt hố sụt ngay sau chỗ rẽ, để viết cứng số lớn rơi hố.
Chuông vừa rời khỏi vẫn nghe được (cách 1 ô), nên không đặt `wait_echo()` ngay sau một chuông đá; đá chuông vỡ thì hết vang nên dùng được.
Soát trên trình duyệt: am-thanh.4, am-thanh.7, che-am-thanh.10 (3 sao, huy hiệu).

Gói 4: bước vào miệng ngách tính một bước, ra miệng kia giữ hướng; `hear()` đo đường chim bay (không theo ngách) nên màn dạy chui rồi mới nghe / đo.
Sân tầng ngách dựng bằng hàm `tang(n, coDa, duoi, rong, bCuoi)` trong man-san-hang-dong.js. Hàm chế: `dive(n)`, `echo_exit()`, `dive_once(n, s)` (nhắc `ring_once` gói 2), `dive_all(book)`.
Lưu ý: chương trình có `while` (kể cả trong hàm như `wait_echo`) mà chạm `nhipToiDa` thì máy chấm báo `vong-vo-han` chứ không `qua-nhieu-nhip`; màn trần nhịp nên không có `while`.
Lõi: ngách không kiểm đá chuông ở miệng ra (`ngach-chan` chỉ xét thùng / vật / cửa / đồng đội), nên không đặt đá chuông lên miệng ngách.
Soát trên trình duyệt: san-hang-dong.10, che-hang-dong.6 (3 sao).

Gói 5: lướt dừng ở ô đầu tiên không phải đá ướt (cờ cũng dừng cú lướt), nên muốn ép bung gai thì đặt hố ngay sau ô đá ướt phải bám và cho rẽ ở đó.
Đi bộ (gai bung) vẫn tới đích nếu đủ nhịp, nên màn chương 1 có trần nhịp (không `while`) để chỉ lướt mới kịp. Cờ nằm thẳng trước hố thì `forward(hear())` chạm cờ trước khi rơi: cho cờ ở bên cạnh.
Sân tầng đá ướt + ngách dựng bằng `tangLuot(cuoi, duoi, rong)` (đá chuông ở x = 3, cách R1 ở tầng trên đúng 3 ô nên `ring_once` có tác dụng).
Hàm chế: `slide_stop()`, `glide_step()`, `glide_tunnel()` (thân giống `slide_stop`), `echo_glide()` (if / else). Bỏ `glide_left`, `glide_beat`, `unique_glide` của bản cũ.
Soát trên trình duyệt: thu-gai.10, che-thu-gai.6 (3 sao; màn đầu chương có phim "Chỉ đường cho R1!" phải bấm qua).

Gói 6: `note(n, k)` rồi `wait()` là đứng ngân k nhịp; rồi đi / rẽ / lướt thì loa ngân tiếp trong các nhịp đó. Tiếng phát ở chỗ R1 đứng đầu nhịp,
nên ô xuất phát cũng phải trong tầm đá (màn rẽ phải đặt chỗ xuất phát sát góc). Đá chưa vỡ vang xa 9 ô nên `hear()` đo tới đá kế tiếp (che-phat-not.4);
đá `daK` vang khẽ (phamVi 1) cho `while hear() > 0: crack_glide(…)`.
Hàm chế: `crack_glide(n, k)`, `march_note(n, k, m)`, `long_once(n, k, s)`. Bỏ `crack_step`, `play_list`, `dict_crack`, `unique_notes`, `march_note` một đối số của bản cũ.
Soát trên trình duyệt: phat-not.7, che-phat-not.10 (3 sao).

Gói 7: `listen()` trả nốt của nguồn gần nhất, kể cả chuông ngay trên đầu (khoảng cách 0); `hear()` bỏ qua chuông trên đầu. Chuông `cd(…, 1)` ngân khẽ
(phamVi 1) để `while hear() > 0` chỉ đo tới đá chưa vỡ. Sau `glide_tunnel()` R1 đứng ở ô (2, y) của tầng dưới (ô đá ướt đầu tầng), không phải (1, y).
Khay chưa chạm được `d[listen()]` (chip chỉ có `d["a"]`, `d[k]`), nên mọi màn viết `n = listen()` rồi `d[n]`; thân `decode_glide(d, k)` là hai dòng
`n = listen()`, `crack_glide(d[n], k)`. Sổ ám hiệu dùng khoá số (`d = {2: 5, 4: 7}`): màn phải có `khoaTD: ['2', '4']`; khay nay giữ khoá số không bọc "…" (`khoaChu` trong thanh-phan.js).
Hàm chế: `crack_tunnel()`, `decode_glide(d, k)`, `listen_unique_step(s)`. Bỏ `listen_step` và các hàm cũ của bản PDM8.
Soát trên trình duyệt: nghe-not.8, che-nghe-not.10 (3 sao).

Gói 8: đo lõi với bánh gai: bàn xoay `@` `%` (Mỏ đá; lướt dừng trên bàn thì bị quay), cổng nhịp `C` + `cuaNhip` (Nhà máy), cổng dịch chuyển `1 1` chạy được;
thùng `H` không đẩy được, nút bắn `N` không bắn được, băng chuyền đẩy cách nhịp (khó đoán) nên không dùng. Cổng nhịp đóng đè lên xe thì giữ mở (`cua-ket`, thông tin):
hang-cu.8 dùng điều này (cổng chỉ mở đúng một nhịp, ngân thừa một nhịp là lỡ cổng), nên lời giải thắng kèm "Lưu ý" cửa giữ mở.
`extend_spikes()` rồi `retract_spikes()` liền nhau (chưa qua nhịp nào) thì lệnh trước mất (`gai-goi-lai`): hàm lướt mà gọi nối nhau phải kết thúc bằng lệnh tốn nhịp.
Hàm chế: `crack_switch()` (thân mùa 9), `spin_crack()`, `ring_gate(n, k)`. Bỏ `echo_gate`, `belt_echo`, `dict_gate`, `unique_echo_step` và `spin_crack` cũ (gói 9, 10 cũ còn gọi).
Soát trên trình duyệt: hang-cu.8, hang-cu.10, che-hang-cu.10 (3 sao).

Gói 9 (đội R1 + R2): R1 của Sola (bánh gai, loa, mic) và R2 máy mỏ đá của Luna (bánh omni ghép nhịp `cheoGhep`, tay ném `nemDa`, radar; bỏ `diag_*`, `shape`, `vatDang` vì mùa 8 chưa có hình).
Hai robot chung một sân: R2 hất đá `o` lấp hố `u` hay đè nút `M` mở cổng `C` (`noi`); R1 gõ đúng nốt làm vỡ đá chuông chắn đường R2.
Loa phá đá trong Manhattan ≤ 3 hoặc trên tia thẳng từ mũi xe (tường chặn tia); phát nốt khác thì vạch đã ngân về 0.
`lob()` 2 nhịp, `aim_lob(3)` 3 nhịp (chạy đà rồi lùi), lướt hết dải trong 1 nhịp. Đặt đá chuông sát bên phải R2 thì `slide_r(1)` trong `fill_for_mate` đâm đá.
Hàm chế: `fill_for_mate(k)`, `crack_for_mate()` (thân mùa 9), `ring_for_mate(k)` (`go_echo()`, `ring_gate(listen(), k)`).
Bỏ `heavy_gate_lob`, `wait_crack_go`, `shape_lob_step`, `dict_team_lob` của bản cũ. Soát trên trình duyệt: doi-hang-dong.8, doi-hang-dong.10, che-doi-hang-dong.10 (3 sao, huy hiệu).

Gói 10 (R1 một mình, mọi màn 2–3 hầm, `nhipTheo: 'tong'`): nhắc lại cả 8 gói, kể cả ngách (gói 4) mà gói 9 chưa dùng.
`hear()` đo Manhattan tới nguồn gần nhất, kể cả chuông vừa rời (cách 1 ô), nên `echo_crack_step()` không gọi liền hai lần.
Giữa hai lần có lướt (`glide_step`) để chuông cũ xa ra, hoặc dùng chuông `phamVi` 3 (trum-mua-hang.4: `while hear() > 0: tunnel_crack_glide()`).
Hàm chế: `echo_crack_step()`, `tunnel_crack_glide()` (thân mùa 9), `ring_dive(k)` (`n = listen()`, `note(n, k)`, `wait()`, `forward(3)`). `dive(listen())` (gói 4) dùng lại cho tầng ngách có đá.
Soát trên trình duyệt: trum-mua-hang.10 (3 sao, huy hiệu), trum-mua-hang.6 (3 sao).

Khay `d[n]`: trước đây chạm ô số chỉ có `d[2]`, `d[4]` (khoá đặt thẳng) và `d[k]` (biến vòng `for k in d`), không có `d[n]` dù `n = listen()` nằm ngay trên.
Các màn sổ ám hiệu gói 7, 9, 10 vì vậy không lắp được bằng khay. Nay `thanh-phan.js` thêm chip `sổ[biến]` cho mọi biến gán `n = …` ở các dòng trên, cả với sổ là đối số hàm.
`kiem-nhap-mua-8.mjs` có thêm phép 88. Trên trình duyệt chưa soát được chip này: tab xem thử treo ở `thanh-phan.js` sau khi xoá bộ đệm service worker, dù curl lấy tệp bình thường.

Khay: dòng từ điển ba cặp (`a = {"dau": 3, "giua": 6, "cuoi": 3}`) tràn ô ở khung hẹp; nay hàng code đó tự cao lên (flex-grow tới 2,2 lần, `vuaDong` trong thanh-phan.js), các hàng khác thấp đi một chút.

Máy kiểm:
- `hoc/kiem-man-mua-8.mjs`: chỉ chặn các chương trong `CHUONG_XONG` (đầu tệp); chương cũ in tên, không chặn. Viết xong chương nào thì thêm vào `CHUONG_XONG` ở cả `kiem-man-mua-8.mjs` và `kiem-ve-mua-8.mjs`.
  Đường cong đo bằng số dòng phải viết / sửa (dòng lời giải không có sẵn trong mã mẫu) và sân lớn nhất.
- `hoc/kiem-ve-mua-8.mjs`: mục 5 chỉ chặn chương đã viết lại; màn cũ dùng trường chưa có hình chỉ in ra.

`npm test` trên nhánh (sau gộp main): 123/132 bộ đạt. Đo nền ở commit main bf718c0 (worktree tạm, 16/11): 8 bộ đã hỏng sẵn trên main, không do mùa 8:
kiem-bang-mau, kiem-che-xe (SoLenh.ds), kiem-dong-goi-artifact (3 CSS), kiem-huy-hieu-phim-vector, kiem-khay (tay-gap.10), kiem-lo-trinh, kiem-trum-mua-1, kiem-ve-vector.
Nhánh thêm đỏ `kiem-loi-giai` (và `kiem-lo-trinh` dừng sớm hơn, ở am-thanh.3): xem mục 2 dưới đây.

## Còn lại

1. P3 xong cả 10 gói (200/200 màn đạt `kiem-man-mua-8`). Còn P4 tổng soát: `npm test` cả bộ, rồi gộp main một lần qua /push-main. Mùa 8 vẫn ẩn tới khi user cho mở. Phim gói mùa 8 không thuộc phạm vi.
2. Hàm mùa 9 phải giữ (tên, tham số, thân): `play_note` (loa.5), `go_echo` (gói 3), `glide_step`, `glide_tunnel`, `slide_stop`, `echo_glide` (gói 5), `crack_glide` (gói 6),
   `crack_tunnel`, `decode_glide` (thân nay hai dòng, cùng hành vi), `listen_unique_step` (gói 7), `crack_switch` (gói 8), `fill_for_mate`, `crack_for_mate`, `aim_lob`, `slide_r` (gói 9), `echo_crack_step`, `tunnel_crack_glide` (gói 10): đã giữ.
3. Soát lại trên trình duyệt chip `d[n]` của khay khi tab xem thử chạy lại được (mở một màn sổ ám hiệu, chạm ô số trong `play_note(…)`).
6. Thẻ bộ phận tay loa còn tên cũ "Loa cộng hưởng" (gói đã đổi tên ngắn "Loa"); xem có cần đổi theo.
