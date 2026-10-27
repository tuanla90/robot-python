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

## Trạng thái

- **27/10 P0 · Khung mùa 2 xong** (nhánh claude/khung-mua-2): lộ trình xếp mùa 2 thành 10 gói (`lo-trinh-hoc.js`, khối "MÙA 2 = 10 GÓI", mảng `MUA_2`) chỉ bằng màn đã có; mùa 2 vẫn ẩn (`an: true`).
  Giữ `ma` mọi màn. Gói / chương chưa có màn **chưa hiện**; gói sau chỉ việc thêm màn vào tệp ngân hàng của mình (bảng dưới), màn tự vào đúng chương, đúng gói
  (màn mới nối sau màn có sẵn của chương, theo `so`; chương đủ 10 thì màn cuối là trùm). Ngưỡng sao mùa 2 **không khai cứng**: mo-goi.js tính TI_LE_SAO trong mùa,
  tự đổi khi thêm màn (khai cứng khi mở bán, như mùa 1).
  Máy kiểm `hoc/kiem-lo-trinh.mjs` mục mùa 2: (a) đúng bảng, (b) không biến trước gói 1 chương 2, (c) không hàm có tham số / lời gọi có đối số (trừ `range`) trước `tham-so`
  (kể cả mùa 1, bắc cầu qua hàm của em), (d) không `S` / `u` / `n`, (e) hàm cần được tạo trước, (f) part mùa 1 + xích + súng hơi (+ `distance` / `warm`).
  `node hoc/kiem-lo-trinh.mjs --loi-gia-mua-2` cắm 6 lỗi giả: cả 6 mục đỏ.

  | Gói | Chương 1 | Chương 2 | Màn | Mã màn | Tệp màn mới |
  |---|---|---|---|---|---|
  | 1 Bánh xích `xich` | `xich` 10 | `bien-xich` "Biến cho xích" 9 (+1 mới) | 19 | xich.1–10 · che-xich.1, .2, .6, .8, che-cam-bien.6, .5, .9, robot-hoan-thien.9, che-xich.9 | man-bien-xich.js |
  | 2 Súng hơi `sung-hoi` | `sung-hoi` 10 | `tham-so` 10 | 20 | sung-hoi.1–10 · tham-so.1–10 | |
  | 3 Hồng ngoại `hong-ngoai` | `hong-ngoai` 0 | `che-hong-ngoai` 0 | 0 (chưa hiện) | | man-hong-ngoai.js |
  | 4 Nhà máy `nha-may` | `bang-chuyen` 10 | `che-sung-hoi` 10 | 20 | bang-chuyen.1–10 · che-sung-hoi.1–10 | |
  | 5 Đẩy thùng `day-thung` | `day-thung` 0 | `che-day-thung` 0 | 0 (chưa hiện) | | man-day-thung.js |
  | 6 Lực bắn `luc-ban` | `luc-ban` 10 | `che-luc-ban` 0 | 10 | luc-ban.1–10 | man-che-luc-ban.js |
  | 7 Đo nhiệt `do-nhiet` | `do-nhiet` 0 | `che-do-nhiet` 0 | 0 (chưa hiện) | | man-do-nhiet.js |
  | 8 Đội `doi-mua-2` | `doi-mua-2` 0 | `che-doi-mua-2` 0 | 0 (chưa hiện) | | man-doi-mua-2.js |
  | 9 Bệ súng xích `be-sung` | `be-sung` 0 | `che-be-sung` 0 | 0 (chưa hiện) | | man-be-sung.js |
  | 10 Nhà máy chạy lại `nha-may-chay` | `tong-hop-2` 0 | `trum-mua-2` 0 | 0 (chưa hiện) | | man-trum-mua-2.js |
  | | | | **69** | | |

  Đã sửa (qua lộ trình, ngân hàng không đổi): sung-hoi.3, .8 lời giải `forward(n)` → `for … move()` (đo lại sao), sung-hoi.4 mã mẫu bỏ `forward(2)`;
  xich.5 ("Trái rồi phải"), xich.7, xich.10 ("Đường bậc thềm") ô `S` thành sàn, lời giải / nhịp / ô không đổi; tham-so.3 hố `u` → hàng rào `=`; tham-so.7 gầm `n` → tường;
  xich.6 đề tự giới thiệu băng chuyền. **Giữ** băng chuyền trước gói 4 ở xich.6, .10 (băng không đẩy xích: đặc tính part), tham-so.9, .10 và sung-hoi.7, .8 (băng là ý bài, đề đã nêu luật băng; dời thì hụt chương).
  **Khác kế hoạch:** che-xich 3, 4, 5, 7, 10 không cất hẳn mà thành chương `che-xich` (5 màn) ở mùa 3 (ẩn), vì che-xich.4 tạo `climb()` mà che-doi-xich.1, .2, che-doi-omni.5 cần.
  Dời đầu mùa 3 (ẩn), giữ thứ tự: Sân cơ khí (`ban-xoay`, gói đầu mùa 3 cần 0 ★), Thân nhện, Đội vượt hố và băng chuyền, Danh sách, `che-xich`, Đội xích và nhện, Bánh omni, Đội omni và xích.
  Đường cong (luật mùa 1) chưa đạt ở vài chỗ của chương có sẵn (xich.2, .3 dòng; bang-chuyen.2–4, .8; che-xich.6 trong `bien-xich` nhịp 10 so với 5): để gói viết mới xử lý nếu cần.

- **27/10 P1 · Lõi mới mùa 2 xong** (nhánh claude/loi-mua-2, gộp dfe443e). Máy kiểm `hoc/kiem-loi-mua-2.mjs` (93 ca, `--loi-gia` đỏ 5). Mọi màn cũ y nguyên.

  | Luật | Bật bằng | Ghi chú |
  |---|---|---|
  | Hồng ngoại `distance()` | `hamGoc` có `distance` (part `hong-ngoai` tự lắp) | số ô trống tới vật cản phía trước theo hướng mặt, sát là 0, không tốn nhịp; nhện / drone gắn → lỗi cấu hình; tia đỏ khi đọc |
  | Đo nhiệt `warm()` | `hamGoc` có `warm` | True khi vật cản đầu tiên là robot khác hoặc nút bắn đang bật; nút bật có quầng đỏ ở MỌI màn (luật thế giới) |
  | Xích đẩy thùng nặng | `cfg.xichDay: true` + xích, khi TIẾN | ô sau thùng trống thì thùng dời 1 ô; chặn thì đâm như cũ; lùi không kéo |
  | Bệ súng xích | `cfg.beSung: true` + xích + súng hơi | bắn tụ không giật; robot không súng thì bỏ qua cờ (khác `lucBan`, để màn đội khai cờ chung) |

  Để sau: part hồng ngoại chưa vào danh mục lắp ráp (`lap-rap.js`) tới khi có màn lắp ráp dùng nó; khay chưa cho chạm đổi số trong `distance() > 2`;
  thùng bị đẩy vào hố `u` chưa có luật (mùa 3); bắn nhanh ở màn nhiều robot vẫn giữ ô sau lưng (lỗi sẵn có). Thẻ bộ phận hồng ngoại còn một dấu "—" (đợt quét chữ diem10code).

- **27/10 P3 · Gói 3 Hồng ngoại xong** (nhánh claude/hong-ngoai-2, gộp 80fcb34; npm test 75/75). 20 màn trong `man-hong-ngoai.js` theo video "Rô bốt né vật cản"
  (Đo → So → Rẽ, mỗi ô 10 cm, biến `an_toan`; hong-ngoai.7 "Phanh không kịp" là màn đố ngưỡng quá nhỏ). Màn thường một sân, trùm ba sân.
  Máy kiểm `kiem-hong-ngoai.mjs` (107) + bộ dò `do-duong-hong-ngoai.mjs`: lời né `distance()` không được 3 sao. Huy hiệu `hong-ngoai`, `che-hong-ngoai`.
  Hàm của em mới: `go_to_wall`, `go_safe(an_toan)`, `clean_step(an_toan)`, `go_get` (không dùng tên `fetch`: trùng hàm cốt truyện nam-cham.5).
  Còn nợ (gói sửa S1): 4 hàm trên chưa có mục Sổ lệnh (kiem-che-xe chưa thấy màn ngân hàng mùa 2); hong-ngoai.7 chạy mã mẫu thì lời nhắc đầu là "vòng while chạy mãi" thay vì "đâm tường".

- **27/10 S1 · Sửa sau gói 3 xong** (nhánh claude/sua-mua-2-a, gộp 28ba21d; npm test 75/75). Sổ lệnh có nhóm "Hồng ngoại" với 4 hàm; `kiem-che-xe.mjs` nạp màn mới
  mùa 2 qua lộ trình, gói sau chỉ thêm mục Sổ lệnh + một dòng chương → nhóm. `cham.js`: vòng while chạy mãi mà robot cứ đâm thì lời `vong-vo-han` mở đầu bằng
  "Robot đâm vào … ở ô (x, y) từ nhịp n, cả thảy N lần." (giữ mã, thứ tự, thắng / thua / sao; 38 ca ở 21 màn đổi câu đầu).
  Nợ cũ phát hiện thêm: lộ trình xuất bản có ~30 hàm cốt truyện chưa có mục Sổ lệnh (to_left_gap, các hàm che-doi-*), và 4 mục (dash, square, zigzag, ring) chỉ màn đã cất tạo.
