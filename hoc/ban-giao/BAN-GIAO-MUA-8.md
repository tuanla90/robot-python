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

Khay: dòng từ điển ba cặp (`a = {"dau": 3, "giua": 6, "cuoi": 3}`) tràn ô ở khung hẹp; nay hàng code đó tự cao lên (flex-grow tới 2,2 lần, `vuaDong` trong thanh-phan.js), các hàng khác thấp đi một chút.

Máy kiểm:
- `hoc/kiem-man-mua-8.mjs`: chỉ chặn các chương trong `CHUONG_XONG` (đầu tệp); chương cũ in tên, không chặn. Viết xong chương nào thì thêm vào `CHUONG_XONG` ở cả `kiem-man-mua-8.mjs` và `kiem-ve-mua-8.mjs`.
  Đường cong đo bằng số dòng phải viết / sửa (dòng lời giải không có sẵn trong mã mẫu) và sân lớn nhất.
- `hoc/kiem-ve-mua-8.mjs`: mục 5 chỉ chặn chương đã viết lại; màn cũ dùng trường chưa có hình chỉ in ra.

`npm test` trên nhánh (sau gộp main): 123/132 bộ đạt. Đo nền ở commit main bf718c0 (worktree tạm, 16/11): 8 bộ đã hỏng sẵn trên main, không do mùa 8:
kiem-bang-mau, kiem-che-xe (SoLenh.ds), kiem-dong-goi-artifact (3 CSS), kiem-huy-hieu-phim-vector, kiem-khay (tay-gap.10), kiem-lo-trinh, kiem-trum-mua-1, kiem-ve-vector.
Nhánh thêm đỏ `kiem-loi-giai` (và `kiem-lo-trinh` dừng sớm hơn, ở am-thanh.3): xem mục 2 dưới đây.

## Còn lại

1. **P3 gói 8–10 (60 màn)** vẫn là bản PDM8 cũ: đề chưa mở bằng "Giúp Sola", gợi ý chưa "Luna:", nhiều dòng không lắp được bằng khay, nhiều màn chỉ một lời sai.
2. **Màn cũ gói 8, 10 gọi hàm cũ đã bỏ**: `drum_hit` (gói 2 cũ), `crack_step`, `unique_notes`, `march_note(n)` một đối số (gói 6 cũ). Vì vậy `hoc/kiem-lo-trinh.mjs` và `hoc/kiem-loi-giai.mjs` đỏ trên nhánh này; hết khi viết lại các gói đó.
3. Hàm mùa 9 phải giữ (tên, tham số, thân): `play_note` (đã có ở loa.5), `go_echo` (gói 3), `glide_step`, `glide_tunnel`, `slide_stop`, `echo_glide` (gói 5), `crack_glide` (gói 6),
   `crack_tunnel`, `decode_glide` (thân nay hai dòng, cùng hành vi), `listen_unique_step` (gói 7), `crack_switch` (gói 8), `fill_for_mate`, `crack_for_mate`, `aim_lob`, `slide_r` (gói 9), `echo_crack_step`, `tunnel_crack_glide` (gói 10).
4. Màn cũ có lỗi dữ liệu: tong-hop-hang.9 miệng ngách (3, 1), (4, 1) đè tường; doi-hang-dong.9, che-doi-hang-dong.5–.8, .10 dùng `vatDang` chưa có hình.
5. P4 tổng soát (recall gói 9–10, huy hiệu, `npm test` cả bộ), mùa 8 vẫn ẩn tới khi user cho mở. Phim gói mùa 8 không thuộc phạm vi.
6. Thẻ bộ phận tay loa còn tên cũ "Loa cộng hưởng" (gói đã đổi tên ngắn "Loa"); xem có cần đổi theo.
