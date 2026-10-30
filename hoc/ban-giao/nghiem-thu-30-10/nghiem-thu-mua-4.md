# Nghiệm thu độc lập Mùa 4 "Thành phố" (bản dựng lại 10 gói)

Ngày 30/10, repo `tay-gap-xoay-comparison-00c53c` sau khi gộp main (fd5bc97). Chỉ đọc, không sửa repo, không chạy npm test.
Dữ liệu: `xem-goi.cjs ... mua-4` (đã nạp lo-trinh-hoc.js), một bảng gọn mỗi màn một dòng (ô, nhịp, số sân, lời sai, trình diễn, hàm tạo, khối mới lần đầu trong lộ trình), và máy chấm của repo chạy lời giải lách. Đối chiếu `KE-HOACH-MUA-4.md` và `KE-HOACH-7-MUA.md`.
Bản báo cáo trước (kho tạm 24 gói) đã bỏ.

## 0. Hiện trạng

- Mùa 4 có **10 gói, 20 chương, 200 màn**, đúng khuôn và đúng bảng kế hoạch: drone gốc rồi đáp đất sạc; máy sơn chấm ô rồi bút liền; camera bốn hướng rồi "here"; sàn màu, hộp màu, ô sạc; Python A danh sách, Python B `for x in a` / `append`. Mùa vẫn ẩn (`an: true`).
- Kiểm lại các vấn đề cũ:

| Vấn đề cũ | Hiện tại |
|---|---|
| Không có màn trình diễn khoá | **Đã hết.** 9 màn `chiChay`, mỗi chương 1 có khối mới: drone.11, list.1, may-son.11, cam-bon.1, pho-mau.1, tram-sac.1, net-lien.1, nhin-duoi.1, son-tren-cao.1. Màn kế tiếp ép bằng hai sân hoặc mã mẫu sai (cam-bon.2, pho-mau.2, nhin-duoi.2, son-tren-cao.2). |
| Một sân cho màn 1 đến 9, lách được | **Phần lớn đã hết.** Màn camera mới dùng hai đến ba sân. Còn 10 màn một sân có cảm biến: che-list.4, .8, .9, tram-sac.6, .9, che-may-son.6, .9, che-doi-nam-cham.1, .3, .8. Thử lách: che-may-son.6 thắng **3 sao**; tram-sac.6, tram-sac.9, che-may-son.9 thắng 2 sao. |
| Ngưỡng sao không đơn điệu | **Đã hết.** Gói mùa 4 không khai `sao` cứng, mo-goi.js tính 0,5 × tổng sao gói trước trong mùa: 0, 30, 60 … 270, tăng đều. |
| Bậc thang S | **Đã hết.** 0 màn. |
| Lời sai mẫu | **Còn 17 màn** không lời sai (không kể màn trình diễn): che-list.9 và 16 trên 20 màn gói 8 Đội chia hàng (chỉ 4 màn mới có). |

## 1. Đường cong học tập

### Thứ tự khái niệm giữa các gói: tốt
- Danh sách (gói 1), rồi duyệt và `append` (gói 2), rồi được dùng ở mọi gói sau: `read_row` (gói 4), `read_below` (gói 7), `paint_list`, `copy_down` (gói 9), `bar_len` (gói 10).
- `color(huong)` dạy trên xe (gói 3) trước khi lên drone (gói 4). `land` / `take_off` / `dock` (gói 5) trước khi dùng ở gói 9, 10. `pen_down` bị rút khỏi khay gói 1 đến 5, mở ở gói 6. "here" (gói 7) trước gói 9.
- Gói 10 nhắc lại có chủ ý: tong-hop-4 mỗi màn ghi rõ "Ôn gói …", phủ cả 9 gói.
- **Ngoại lệ:** cảm biến màu ở bụng (`color()` không đối số, part `mau`) xuất hiện lần đầu trong cả lộ trình ở che-may-son.9 (vị trí 72.2, hàng làm quen), rồi che-may-son.6 và trùm che-may-son.10. Gói dạy cảm biến này đã sang mùa 5 (ẩn). Nó cũng trái quy ước vừa dạy ở gói 3: với camera bốn hướng, `color()` để trống là lỗi `huong-cam-sai`.

### Trong chương (ô sao 3 theo thứ tự màn)
- **Mượt:** list 11, 11, 11, 12, 17, 11, 11, 14, 17, 15 · may-son 9, 8, 9, 9, 8, 8, 10, 8, 14, 16 · cam-bon 12 đến 16 · pho-mau 5 đến 11 · tram-sac 5 đến 10 · nhin-duoi 3 đến 10 · che-nhin-duoi 4 đến 13 · son-tren-cao 4 đến 10 · che-son-tren-cao 7 đến 18.
- **Tăng hợp lý:** che-cam-bon 6, 6, 15, 17, 15, 18, 25, 30, 15, 36 (màn 7 thêm tay kẹp, trùm cao nhất) · che-pho-mau 9 đến 13, trùm 21.
- **Chỗ nhảy hoặc lệch còn lại:**
  - che-may-son: 10, 10, 14, 17, 14, **26**, 25, 26, 27, 23. Màn 6 `next_row` nhảy từ 14 lên 26 ô ở hàng luyện; trùm (23 ô) nhẹ hơn màn 6 đến 9.
  - Ranh gói 7 sang gói 8: che-nhin-duoi.10 13 ô, rồi doi-nam-cham.1 34 ô. Gói 8 suốt 34 đến 73 ô; che-doi-nam-cham.1 (vị trí 2, hàng làm quen) 60 ô / 28 nhịp. Hai chương trình đội cộng lại nên ô cao là tự nhiên, nhưng đây vẫn là gói nặng nhất mùa.
  - trum-mua-4: vị trí 8, 9 là hai màn xe cũ che-may-son.7 "Lưới chấm" (37 nhịp) và .8 "Khung lồng khung" (44 nhịp), nặng hơn **trùm cuối mùa** trum-mua-4.10 (17 nhịp, cùng 24 ô).
  - drone (gói 1): drone.8, .9 (nam châm treo, 19 và 18 ô) bằng trùm drone.14 (19 ô): trùm không khó hơn màn 8.
- **Chững:** "đếm bằng danh sách" lặp bốn lần với cùng mẹo `a.append(1)` rồi `len(a)` (che-cam-bon.3, che-pho-mau.8, che-nhin-duoi.4, trum-mua-4.6).

## 2. Liên quan trong gói

- **Nối mạch tốt (chương 2 chế lệnh cho đúng thứ chương 1 dạy):**
  - Gói 3: `go_to`, `turn_green`, `green_step`, `cross4`, `sort_by_color`.
  - Gói 4: `find_box`, `fly_to`, `read_row`, `follow_code`, `drop_down`, `place_box`; trùm ghép đúng các hàm đó.
  - Gói 5: `dock`, `fly_dock`, `safe_go`; trùm dùng `safe_go`.
  - Gói 7: `seek_here`, `read_below`, `arrow_step`, `count_here`, `deliver_up`, `lift_by_color`.
  - Gói 9: `stripe`, `retrace`, `paint_list`, `dashes`, `trace_marks`, `mural`, `copy_down`.
- **Gói 1 Cất cánh và gói 2 Chấm sơn:** chương 2 là chương Python (list, che-list) chạy trên **xe hai bánh**, không dính drone hay máy sơn. Đúng chủ ý kế hoạch (chương 2 giới thiệu Python bằng part cũ), nhưng mạch gói đứt.
  - che-list còn dùng cảm biến khoảng cách đo bãi trống, xa chủ đề "Chấm sơn".
  - Chương 1 bù một phần: may-son.7 "Danh sách màu", may-son.16 trùm `paint_row(colors)`.
- **Gói 6 Nét liền:** che-may-son.9, .6, .10 dùng cảm biến bụng (xem mục 1), lệch khỏi mạch camera của mùa.
- **Gói 10:** che-may-son.7, .8 (xe hai bánh, `grid`, `border`) nằm trong chương "Phố mới kẻ vạch" của drone: lạc chủ đề cỗ máy xuất xưởng.
- **Gói 8 Đội chia hàng:** hai chương nối đúng: phối hợp, rồi `hold_on`, `hand_off`, `plan_b`. Thứ tự đã xếp lại theo "dạy trước dùng sau".

## 3. Đạt mục tiêu gói

- **Gói 3, 4, 7, 9:** khái niệm bị ép bằng nhiều sân. Trùm kiểm tra đúng mục tiêu:
  - cam-bon.10 dùng while theo vạch, ba sân;
  - che-pho-mau.10 dùng `read_row`, `follow_code`, `place_box`;
  - che-nhin-duoi.10 dùng `count_here` rồi `deliver_up(len(a))`;
  - son-tren-cao.10 đọc dấu, ba chặng, hỏi pin ở trạm.
- **Gói 5:** người chơi dùng được `land` / `take_off` / `dock` và ngưỡng pin. tram-sac.8 và trùm có hai mức pin. Riêng tram-sac.6, .9 một sân nên đáp cứng vẫn được 2 sao.
- **Gói 1, 2:** đạt Python A / B (danh sách, duyệt, `append`, `len`, chỉ số, hàm nhận danh sách); đạt drone gốc và máy sơn chấm ô.
- **Gói 6:** đạt bút liền và hàm vẽ. Thiếu chỗ: che-may-son.6 lách 3 sao bằng danh sách màu viết cứng, và cảm biến bụng chưa được dạy.
- **Gói 8:** mục tiêu đội nam châm và màu có mặt. Thiếu lời sai mẫu nên không chứng minh được trùm bắt lỗi điển hình.
- **Gói 10:** tong-hop-4 đạt vai tổng hợp. Trùm cuối mùa đúng cỗ máy (`trace_marks`, `charge_if`, `mark_dash`, danh sách màu, hai trạm) nhưng không khó hơn hai màn xe đứng trước nó.

## Kết luận từng gói

| # | Gói | Kết luận |
|---|---|---|
| 1 | Cất cánh | Đạt có góp ý: chương 2 list trên xe, không dính drone; trùm drone.14 không khó hơn drone.8 |
| 2 | Chấm sơn | Đạt có góp ý: chương 2 che-list không dính máy sơn; che-list.9 không lời sai |
| 3 | Camera bốn hướng | Đạt |
| 4 | Phố màu | Đạt |
| 5 | Trạm sạc | Đạt có góp ý: tram-sac.6, .9 một sân, đáp cứng được 2 sao |
| 6 | Nét liền | Đạt có góp ý: cảm biến bụng chưa dạy ở che-may-son.9, .6, .10; .6 lách 3 sao; che-may-son.6 nhảy 14 lên 26 ô |
| 7 | Nhìn dưới chân | Đạt |
| 8 | Đội chia hàng | Đạt có góp ý: 16/20 màn không lời sai, tải 34 đến 73 ô sau gói 7 (≤ 13 ô) |
| 9 | Sơn từ trên cao | Đạt |
| 10 | Drone kẻ vạch R1 | Đạt có góp ý: hai màn xe cũ (37, 44 nhịp) đứng trước và nặng hơn trùm cuối mùa (17 nhịp) |

## Đề xuất sửa ưu tiên (tối đa 8)

1. **Gói 8:** viết lời sai mẫu cho 16 màn còn thiếu (doi-nam-cham.1 đến .5, .7, .8, .10; che-doi-nam-cham.1, .2, .3, .5, .6, .7, .8, .10). Cân lại che-doi-nam-cham.1 (60 ô ở vị trí 2).
2. **che-may-son.9, .6, .10:** đổi cảm biến bụng sang camera bốn hướng (`color("here")` khi xe có camera-4, hoặc chuyển ý sang drone gói 9). Thêm sân thứ hai cho che-may-son.6 (đang lách 3 sao).
3. **trum-mua-4:** thay che-may-son.7, .8 bằng hai màn drone kẻ vạch mới tải vừa phải, để trùm cuối mùa .10 là màn khó nhất chương.
4. **tram-sac.6, .9:** thêm sân pin khác (như tram-sac.8) để `battery()` bị ép, không chỉ được thưởng sao.
5. **Gói 2 chương 2 (che-list):** chuyển dần sang máy sơn hoặc drone dùng `append` (ghi màu rồi sơn lại), cho chương nối với "Chấm sơn". Bỏ cảm biến khoảng cách ở che-list.4 đến .10 nếu được. Viết lời sai cho che-list.9.
6. **Đếm bằng `a.append(1)`** (che-cam-bon.3, che-pho-mau.8, che-nhin-duoi.4, trum-mua-4.6): ghi giá trị thật (màu) rồi đếm, hoặc giữ một màn duy nhất. Tránh dạy danh sách như biến đếm bốn lần.
7. **che-may-son.6 `next_row`:** tách bớt hoặc chèn màn đệm. Nâng trùm che-may-son.10 lên trên màn 6 đến 9.
8. **Gói 1:** thay một trong drone.8 / .9 (nam châm, 18 đến 19 ô) bằng màn bay / pin, để trùm drone.14 rõ là màn khó nhất.

Ghi chú độ sâu: gói 3, 4, 5, 7, 9, 10 đọc đề, lời giải từng màn. Gói 1, 2, 6, 8 đọc theo bảng và đề, thêm từng màn có chỗ nghi. Lời giải lách chạy bằng `cham.js` của repo. Tôi không chạy lại các lời giải chuẩn thua giả do công cụ nối hàm cùng tên; máy kiểm khác đã xác nhận chúng thắng 3 sao.
