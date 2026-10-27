# Kế hoạch mùa 2 "Ghi nhớ" theo khuôn 10 gói (27/10/2026, ĐÃ DUYỆT; user chọn chạy agent TUẦN TỰ, song song để buổi tối máy rảnh)

Khuôn: [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md) (10 gói × 2 chương × 10 màn; chương 1 làm quen, chương 2 "hàm cho …"). Bảng mùa 2:
thân **Xích → đẩy thùng nặng** · tay **Súng hơi → lực bắn** · cảm biến **Hồng ngoại `distance()` → đo nhiệt `warm()`** ·
vật **thùng nặng** · sàn **băng chuyền** · cơ chế **cửa + nút bắn (nút đang bật thì nóng)** · Python A **biến**, Python B **tham số** · combo **Bệ súng xích** (xích bắn tụ không giật).
Luật học: đường cong mượt (luật đo ở KE-HOACH-MUA-1.md mục Trạng thái), gói 9–10 phong phú, recall (memory `duong-cong-hoc-va-recall`); mùa 2 được dùng mọi thứ mùa 1. Mỗi gói có phim mở gói.

## 1. Rà màn hiện có (script đọc lời giải, bắc cầu qua hàm của em)

| Chương | Màn | Vướng |
|---|---|---|
| `xich` (10) | thân xích, tr_right / tr_left | **bậc thang** ở xich.5, .7, .10 (đã bỏ khỏi game); băng chuyền ở xich.6, .10 |
| `che-xich` (10) | chế hàm xích | bậc thang ở .3, .4, .5, .7, .10; dùng hàm có tham số (`forward(n)`) ở .3, .4, .5, .7, .10 |
| `sung-hoi` (10), `che-sung-hoi` (10) | súng hơi, thùng nặng, nút, cửa, băng | gọi hàm có tham số ở sung-hoi.3, .4, .8, che-sung-hoi.5, .10 |
| `luc-ban` (10) | lực bắn | dùng tham số xuyên suốt (hợp: đứng sau gói tham số) |
| `tham-so` (10) | dạy hàm có tham số, xe hai bánh | hố ở tham-so.3, gầm ở .7 (mùa 3); băng ở .9, .10 |
| `bang-chuyen` (10) | băng chuyền, xe hai bánh | không vướng |
| `bien` (4, tạm) | biến đếm (dời từ mùa 1) | xe hai bánh |

Lõi CHƯA có: cảm biến hồng ngoại (`distance()`, `warm()`, nút nóng), xích đẩy thùng nặng khi tiến, xích bắn tụ không giật. Mùa 2 hiện tại còn chứa nhện, danh sách, omni, sân cơ khí, các gói đội: những chương này rời mùa 2 (giữ ở mùa ẩn, xếp lại khi làm mùa của chúng).

## 2. Mười gói (có / mới ước)

| Gói | Chương 1 | Chương 2 | Có / mới |
|---|---|---|---|
| 1 Bánh xích | `xich` (sửa 3 màn bậc thang) | **Biến cho xích**: `bien` 4 + che-xich 1, 2, 6, 8, 9 + 1 mới (đếm nhịp quay) | 19 / 1 |
| 2 Súng hơi | `sung-hoi` (sửa 3 màn dùng tham số) | **Hàm có tham số**: `tham-so` (sửa 2 màn hố / gầm) | 20 / 0 |
| 3 Hồng ngoại | mới: `distance()` số ô tới vật cản | mới: hàm cho hồng ngoại (`d = distance()`, so số) | 0 / 20 |
| 4 Nhà máy | `bang-chuyen` (băng chuyền) | `che-sung-hoi` (thùng nặng, nút bắn, cửa) | 20 / 0 |
| 5 Đẩy thùng | mới: xích tiến vào thùng nặng thì đẩy | mới (+ che-xich bỏ bậc thang nếu cứu được) | 0 / 20 |
| 6 Lực bắn | `luc-ban` | mới: hàm `fire(p)`… | 10 / 10 |
| 7 Đo nhiệt | mới: `warm()` (robot, nút đang bật) | mới | 0 / 20 |
| 8 Đội | mới (xích + súng hơi, hồng ngoại thấy robot) | mới | 0 / 20 |
| 9 Combo Bệ súng xích | mới: xích bắn tụ không giật | mới | 0 / 20 |
| 10 Tổng hợp + trùm (tên mốc truyện, ví dụ "Nhà máy chạy lại") | mới | mới | 0 / 20 |
| | | **Tổng** | **~69 / ~131** |

## 3. Thứ tự giao (đề xuất)

1. **P0 · Khung mùa 2** (1 agent, opus): lộ trình 10 gói mùa 2 bằng màn có sẵn + sửa 8 màn vướng; đưa các chương không thuộc mùa 2 ra mùa ẩn; **tạo sẵn tệp ngân hàng rỗng + đăng ký (require, `<script>`, chỗ trong `MUA_2`) cho mọi chương mới**, để các gói sau chỉ phải viết trong tệp của mình.
2. **P1 · Lõi mới** (1 agent, **fable** vì đụng lõi chung san-hoc.js / cham.js): hồng ngoại + nút nóng, đẩy thùng, chống giật; part hồng ngoại (hình pixel, thẻ bộ phận, khay, Sổ lệnh). Có máy kiểm lõi.
3. **P2 · Màn mới** theo gói (3, 5, 6, 7, 8, 9, 10 + phim mùa 2): **chạy 2 agent song song** được, vì mỗi gói chỉ ghi tệp của mình sau P0.

## 4. Chạy song song: được, có điều kiện
- **Không song song P0 và P1** với bất kỳ gì: cả hai sửa tệp dùng chung (lộ trình, lõi).
- **P2 chạy 2 agent cùng lúc**: mỗi agent một gói, tệp riêng; dòng dùng chung (ngưỡng sao, `kiem-lo-trinh.mjs`, `huy-hieu.js`) chỉ thêm, không sửa dòng của người khác; người giao gộp từng nhánh, chạy `npm test` một lần sau mỗi lần gộp.
- **Rủi ro máy:** máy 16 GB, lúc rà còn trống ~1 GB; mỗi agent tự chạy `npm test` (~10 phút, nặng). Hai agent cùng chạy có thể làm máy chậm hay tràn bộ nhớ (đã từng). Cách giảm: agent chỉ chạy máy kiểm của gói mình, **người giao** chạy `npm test` đầy đủ khi gộp.
