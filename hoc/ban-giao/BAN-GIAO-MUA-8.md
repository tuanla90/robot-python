# Bàn giao mùa 8 Hang động (16/11/2026)

Kế hoạch: [KE-HOACH-MUA-8.md](../KE-HOACH-MUA-8.md). Nhánh `claude/mua-8-hang-dong`, worktree `.claude/worktrees/mua-8-hang-dong` (máy chủ thử: cấu hình `game-mua-8`, cổng 4220).

## Đã xong

| Phần | Trạng thái | Ở đâu |
|---|---|---|
| P0 khung + đo, P1 khay nhập từ điển / tập hợp / `hear()` `listen()`, P2 vẽ chuông đá, đá chuông, ngách, thẻ Loa / Mic | xong | đã trên main từ 526630b |
| Gộp main mới vào nhánh (231 commit, 5 xung đột) | xong | 3eb0e0a |
| P3 gói 1 Bánh gai: `banh-gai` Bám đá ướt, `tu-dien` Sổ tay đường hang | xong, 20/20 màn đạt máy kiểm | nhánh |
| P3 gói 2 Loa: `loa` Gõ đá chuông, `tap-hop` Không gõ trùng | xong, 20/20 màn đạt máy kiểm | nhánh |

Gói 2 sửa ở phiên này: loa.2 (lời sai thứ hai thắng 3 sao), loa.6 (đá cách 4 ô không nghe: đi tới chỗ rẽ rồi mới lặp), loa.10 (đường sai, khung 12 dòng),
tap-hop.3 (nước dâng 6 nhịp: tạo túi trong vòng là hết nhịp), tap-hop.4 viết lại "Đếm nốt trong túi" (2 sân, `duLieuSan` cho `s`, `forward(len(s))`),
tap-hop.5 (khối nốt 7 thứ hai trong tầm 3 ô), tap-hop.6 (rim(2), đá trong tầm), tap-hop.7 (đá nốt 2 thứ hai trong tầm, khung 14),
tap-hop.9 và tap-hop.10 viết lại (sổ ghi nốt từng ô, `ring_once(a[k], s)` rồi `move()`; trùm chế `ring_book(book, s)` cho ba sổ dùng chung túi). Mọi ngưỡng sao đo bằng máy chấm.

Soát trên trình duyệt (cổng 4220, `?debug=1&man=…&loigiai=1`): tap-hop.4 (chạm số trong `forward(3)` có chip `len(s)`, thắng 3 sao cả 2 sân), tap-hop.10 (3 sao, huy hiệu), loa.10 (3 sao).

Khay: dòng từ điển ba cặp (`a = {"dau": 3, "giua": 6, "cuoi": 3}`) tràn ô ở khung hẹp; nay hàng code đó tự cao lên (flex-grow tới 2,2 lần, `vuaDong` trong thanh-phan.js), các hàng khác thấp đi một chút.

Máy kiểm:
- `hoc/kiem-man-mua-8.mjs`: chỉ chặn các chương trong `CHUONG_XONG` (đầu tệp); chương cũ in tên, không chặn. Viết xong chương nào thì thêm vào `CHUONG_XONG` ở cả `kiem-man-mua-8.mjs` và `kiem-ve-mua-8.mjs`.
  Đường cong đo bằng số dòng phải viết / sửa (dòng lời giải không có sẵn trong mã mẫu) và sân lớn nhất.
- `hoc/kiem-ve-mua-8.mjs`: mục 5 chỉ chặn chương đã viết lại; màn cũ dùng trường chưa có hình chỉ in ra.

`npm test` trên nhánh (sau gộp main): 123/132 bộ đạt. Đo nền ở commit main bf718c0 (worktree tạm, 16/11): 8 bộ đã hỏng sẵn trên main, không do mùa 8:
kiem-bang-mau, kiem-che-xe (SoLenh.ds), kiem-dong-goi-artifact (3 CSS), kiem-huy-hieu-phim-vector, kiem-khay (tay-gap.10), kiem-lo-trinh, kiem-trum-mua-1, kiem-ve-vector.
Nhánh thêm đỏ `kiem-loi-giai` (và `kiem-lo-trinh` dừng sớm hơn, ở am-thanh.3): xem mục 2 dưới đây.

## Còn lại

1. **P3 gói 3–10 (160 màn)** vẫn là bản PDM8 cũ: đề chưa mở bằng "Giúp Sola", gợi ý chưa "Luna:", nhiều dòng không lắp được bằng khay, nhiều màn chỉ một lời sai.
2. **Màn cũ gói 3–8 gọi hàm của gói 1–2 cũ** mà bản viết lại đã bỏ: `spike_step` (7 màn: am-thanh.3, .4, che-am-thanh.7–.10, thu-gai.4), `march_beat` (11 màn, gói 3–4),
   `count_unique` (4 màn), `drum_hit` (4 màn). Vì vậy `hoc/kiem-lo-trinh.mjs` và `hoc/kiem-loi-giai.mjs` đỏ trên nhánh này. Gộp main trước khi viết lại các gói đó thì cần cầu tạm
   (cấp 4 hàm đó làm hàm của màn cho các màn cũ) hay viết lại gói 3–4 trước.
3. Hàm mùa 9 phải giữ (tên, tham số, thân): `play_note` (đã có ở loa.5), `go_echo` (gói 3), `glide_step`, `glide_tunnel`, `slide_stop`, `echo_glide` (gói 5), `crack_glide` (gói 6),
   `crack_tunnel`, `decode_glide`, `listen_unique_step` (gói 7), `crack_switch` (gói 8), `fill_for_mate`, `crack_for_mate`, `aim_lob`, `slide_r` (gói 9), `echo_crack_step`, `tunnel_crack_glide` (gói 10).
4. Màn cũ có lỗi dữ liệu: tong-hop-hang.9 miệng ngách (3, 1), (4, 1) đè tường; doi-hang-dong.9, che-doi-hang-dong.5–.8, .10 dùng `vatDang` chưa có hình.
5. P4 tổng soát (recall gói 9–10, huy hiệu, `npm test` cả bộ), mùa 8 vẫn ẩn tới khi user cho mở. Phim gói mùa 8 không thuộc phạm vi.
6. Thẻ bộ phận tay loa còn tên cũ "Loa cộng hưởng" (gói đã đổi tên ngắn "Loa"); xem có cần đổi theo.
