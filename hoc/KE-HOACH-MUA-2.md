# Kế hoạch mùa 2 "Ghi nhớ" theo khuôn 10 gói (27/10/2026, ĐÃ DUYỆT; user chọn chạy agent TUẦN TỰ, song song để buổi tối máy rảnh)

Khuôn: [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md) (10 gói × 2 chương × 10 màn; chương 1 làm quen, chương 2 "hàm cho …"). Bảng mùa 2:
thân **Xích → đẩy thùng nặng** · tay **Súng hơi → lực bắn** · cảm biến **Hồng ngoại `distance()` → đo nhiệt `warm()`** ·
vật **thùng nặng** · sàn **băng chuyền** · cơ chế **cửa + nút bắn (nút đang bật thì nóng)** · Python A **biến**, Python B **tham số** · combo **Bệ súng xích** (xích bắn tụ không giật).
Đổi tên (29/10, nhánh claude/voi-phun-chu): chữ người chơi thấy đổi "súng hơi" thành **vòi phun** (gói Vòi phun, Bệ vòi xích, Hàm bệ vòi, Chế lệnh vòi phun; bóng thành tia nước, nòng thành đầu phun, đạn thành lượt phun); mã nội bộ (`sung-hoi`, `be-sung`, tay `'hoi'`), lệnh `shoot()` và chú thích giữ nguyên; phần hình (tên part "Vòi phun hai đầu", phim `pg.*`) ở nhánh claude/voi-phun-hinh.
Van hơi (29/10, nhánh claude/van-hoi): nút bắn N vẽ và gọi là **van hơi** (van tay quay có cánh hứng nước, mở thì nóng + hơi bốc), dây nối van ↔ cửa thành ống hơi; chữ người chơi thấy đổi nút bắn → van hơi, bật / tắt của van → mở / đóng; nút đè M, luật, lệnh, mã nội bộ (`nut`, `nutBat`, `nut-ban`) giữ.
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

- **27/10 P5 · Gói 5 Đẩy thùng xong** (nhánh claude/day-thung, gộp d366c28; npm test 76/76). 20 màn trong `man-day-thung.js`, mọi màn `xichDay: true`:
  đẩy thẳng, quay rồi đẩy, đố lùi không kéo được, ô sau thùng là tường (đi vòng), `range(distance())` tới sát thùng, thùng lên băng chuyền, mở đường, thùng đè nút M mở cửa;
  chương 2 hàm của em `push(n)`, `go_around()`, `push_around(n)`, `push_back(n)` (Sổ lệnh nhóm Bánh xích), sửa hàm `round_left`, `shove`. Hai trùm ba sân, huy hiệu `day-thung`, `che-day-thung`.
  Máy kiểm `kiem-day-thung.mjs` (108) + bộ dò `do-duong-day-thung.mjs`. Thùng chỉ đè được nút M (nút bắn N chặn thùng như tường); `push_to_wall()` không làm được (sau thùng distance() = 0).
  `kiem-luc-ban.mjs` sửa giả định "luc-ban ngay sau che-sung-hoi" (giữa giờ có gói 5).

- **27/10 P6 · Gói 6 Lực bắn đủ 20 màn** (nhánh claude/che-luc-ban, gộp 073de2e; npm test 77/77). Chương 2 `che-luc-ban` 10 màn mới trong `man-che-luc-ban.js`:
  chọn lực bằng `distance() > 1` (bắn nhanh chỉ bay 2 ô, nên không phải `> 2`), hàm gọi hàm, vòng lặp gọi hàm cảm biến, tham số lực truyền tiếp, `go_to_wall()` rồi bắn nhanh,
  sửa hàm `quick_aim` (Sola so `> 2`), đố lực viết cứng; trùm ba hành lang, huy hiệu `che-luc-ban`. Hàm của em mới (Sổ lệnh nhóm Súng hơi): aim_fire, aim_left, aim_right,
  fire_left, close_fire, scan_left, aim_turn. Phần lớn màn khóa chương trình chính (một sân không khóa thì đếm cứng luôn rẻ hơn if/else). Không dạy "biến giữ lực" (không sân nào cần).
  Máy kiểm `kiem-che-luc-ban.mjs` (57) + bộ dò `do-duong-che-luc-ban.mjs`. Ba màn có lời rẻ hơn lời giải mà vẫn dùng cảm biến (ghi ở `congThucKhac`).

- **27/10 S2 · Nút bắn bật sẵn xong** (nhánh claude/nut-bat-san, gộp bb08740; npm test 78/78). Gói 7 dừng hỏi vì mọi nút khởi đầu tắt (người chơi luôn biết trước nút nào nóng,
  `warm()` thừa). Lõi thêm cờ màn `nutBat: [{x, y}]` (nhiều sân: mảng song song như `noi`): nút N đó nóng từ đầu màn, bắn thì tắt (toggle như cũ); sân vẫn ghi `N`
  (không thêm ký hiệu: ~30 bộ dò đọc sân thô). Nút bật sẵn KHÔNG được nối cửa / băng (ném lỗi cấu hình; khai `noi` cho các nút khác). Máy kiểm `kiem-nut-bat-san.mjs` (30).
  Còn để ngỏ: danh sách lớp theo sân trong `lo-trinh-hoc.js` (motSan) chưa có `nutBat`.

- **27/10 P7 · Gói 7 Đo nhiệt xong** (nhánh claude/do-nhiet, gộp d1e1606; npm test 79/79). 20 màn trong `man-do-nhiet.js`, mọi màn khai `nutBat`:
  `if not warm():` bắn, `while not warm()` tìm đèn nóng, phân biệt đèn nóng với cửa / thùng / nút tắt cùng khoảng cách, `warm()` + `aim_fire()`, nút mình vừa bật cũng nóng (bẫy),
  đố Sola bắn mọi nút; chương 2 hàm của em switch_on, switch_left, find_warm, aim_on, scan_on(n), switch_right, aim_left_on (Sổ lệnh nhóm Hồng ngoại), sửa hàm light, find_hot.
  Hai trùm ba sân, huy hiệu `do-nhiet`, `che-do-nhiet`. Máy kiểm `kiem-do-nhiet.mjs` (107) + bộ dò `do-duong-do-nhiet.mjs` (timLoiNeNhanh, timThanCoDinh dùng lại được).
  Chương 1 từ màn 5 khóa chương trình chính (màn mở một sân bị cú giật súng hơi né warm()); lời giải được có chẩn đoán thông tin `giat-chan`.
  Đề xuất để sau: mục tiêu "trạng thái nút cuối màn" để bẫy "bắn nút nóng là tắt nó" thua ngay. `warm()` với robot khác để gói 8 Đội.
  Thứ tự tiếp theo (user 27/10): A1 bảng màu → A2 lab trắng + thân M1 (KE-HOACH-GOP-DIEM10CODE mục 2a) → gói 8, 9, 10 → phim mùa 2.

- **28/10 P8 · Gói 8 Đội xong** (agent Claude opus, user đổi từ Gemini vì auto mode chặn agy; nhánh claude/doi-mua-2, gộp 7291700; chạy song song V5b / V6 / gói 9).
  20 màn trong `man-doi-mua-2.js`: R1 xe xích + hồng ngoại (`xichDay` ở màn có thùng), R2 xe hai bánh + súng hơi + hồng ngoại (`lucBan` ở `doi[1]`); warm() thấy đồng đội.
  MỌI màn khóa chương trình của cả hai robot, người chơi viết / sửa một hàm được gọi nhiều chỗ (chờ dài ngắn khác nhau). Chương 1 hàm của màn (clear_shot, mate_in, keep_gap, after_pass,
  wait_cross, clear_line, pass_safe, wait_aim, cross_safe; trùm safe_step 3 sân); chương 2 hàm của em (Sổ lệnh nhóm Hồng ngoại): wait_clear, yield_step, wait_mate, pass_mate,
  shot_clear(p), step_clear, cover, guard (trùm 2 sân); sửa hàm keep_close, cross_ok. Máy kiểm `kiem-doi-mua-2.mjs` (107, lỗi giả 9 → đỏ 14) + bộ dò `do-duong-doi-mua-2.mjs`
  (không thân cố định nào thắng). Người giao chạy lại sau gộp: kiem-doi-mua-2 107, do-duong, kiem-lo-trinh 854, kiem-che-xe 270, kiem-nut-bat-san 30, kiem-bang-mau 19, kiem-khay 184,
  kiem-luc-ban 104, kiem-goi-doi 979. Sửa thêm (người giao, 4ac900f): thẻ shoot hiện chip lực khi `lucBan` ở `man.doi[i]` (trước R2 không chọn được bắn nhanh / tụ).
  Chưa xem trình duyệt (ô trình duyệt treo, service worker giữ bản cũ): huy hiệu doi-mua-2 / che-doi-mua-2 (pixel, chưa có bản vector), hai robot khóa, chip lực R2. npm test cả bộ: sau gói 9.
  Chờ user: không có màn mở (mọi màn khóa vì trên sân cố định `for … wait()` viết cứng tốn bằng `while warm()`); R1 "dừng ở trạm" bằng `for i in range(k): wait()` trong chương trình khóa;
  biên thua của lời cố định mỏng (vd doi-mua-2.4: 28 so với ngưỡng 27). Đề xuất gói 10: bộ dò mô phỏng chung hai robot hoặc luật "húc bạn thì mất bước" nếu muốn màn mở.
- **28/10 P9 · Gói 9 Bệ súng xích xong** (agent Claude opus dừng sau ~4 tiếng, người giao cất WIP 2fa95a2; agent fable làm tiếp 4 việc rồi đứng ở bước kiểm; người giao nhận lại, chạy kiểm, gộp 793a8e4).
  20 màn trong `man-be-sung.js`: `cfg.beSung` xích + súng hơi bắn tụ không giật. Chương 1 (be-sung.1–10): bắn tụ không giật, bắn sau lưng, hai / ba phát một chỗ, thùng nằm yên,
  hành lang có hốc, đọc warm() ở trạm, đố turn_left() nửa vòng trên xích, đẩy thùng qua cửa; trùm "Ba hành lang trạm" (3 sân, go_to_wall). Chương 2 hàm của em (Sổ lệnh nhóm Súng hơi):
  blast_left, blast_right, lock_on, lock_left, lock_row(n), go_fire, visit (biến d = distance()), push_blast; sửa hàm left_shot (che-be-sung.3); trùm "Hai dây chuyền" (2 sân, nối
  lock_row(2), go_fire(), visit()). Huy hiệu pixel be-sung / che-be-sung (vector rơi về pixel như các gói mùa 2). Máy kiểm `kiem-be-sung.mjs` 107 (lỗi giả 8 → đỏ 12) + bộ dò
  `do-duong-be-sung.mjs` (so chéo lõi khớp mọi màn; mọi màn không bệ súng thì chậm hơn sao.nhip). Agent fable sửa che-be-sung.7–9 (sao.o khai đúng số ô đo; lời sai .9 cũ vẫn thắng).
  Gộp tay với gói 8: huy-hieu.js, kiem-che-xe.mjs, kiem-bang-mau.mjs giữ cả hai; so-lenh.js dời khối che-be-sung xuống sau che-doi-mua-2 (thứ tự chế); kiem-be-sung.mjs đếm dòng màn đội
  (mốc chương be-sung giờ là màn cuối gói 8). Sau gộp: kiem-be-sung 107, kiem-doi-mua-2 107, kiem-lo-trinh 874, kiem-che-xe 270, kiem-loi-mua-2 93, kiem-bang-mau 19, kiem-huy-hieu-phim-vector 10.
  Recall gói 9 (số màn nhắc mỗi gói): 1:2 · 2:18 · 3:5 · 4:20 · 5:3 · 6:16 · 7:6 · 8:0 (nhánh tách trước khi có gói 8). Gói 10 phải bù: gói 1 (biến, sidestep), 3, 5 (đẩy thùng), 8 (đội, warm() thấy bạn).
  kiem-nut-bat-san: thêm chương be-sung / che-be-sung vào nhóm được khai nutBat (màn đọc warm() ở trạm). npm test cả bộ 86 bộ: 85 đạt + kiem-nut-bat-san đạt sau sửa. Chưa xem trình duyệt.
- **28/10 Phim mùa 2 xong** (agent Claude opus, nhánh claude/phim-mua-2, gộp 529281e). `game/phim-mua-2.js`: 10 phim (36 khung) cho mọi gói mùa 2, kịch bản ở KE-HOACH-PHIM-GOI.md mục 3b; truyện nối mùa 1:
  R1 nhặt lại bánh xích trên đồi, nhận súng hơi, mắt hồng ngoại, gặp R2, nhà máy chạy lại, phim 10 nhá mùa 3 (chân nhện, nam châm, sóng từ). 5 hình mới trong phim-vector.js (băng, nút bắn, thùng nặng, bóng, nòng).
  kiem-phim-goi 41 (mục 1b mùa 2 đọc MUA_2; lỗi giả 6 → đỏ 15); kiem-huy-hieu-phim-vector B5 chỉ so pixel nền cho 9 phim mùa 1 (phim mới chỉ cần chạy ở pixel): người giao duyệt.
  Người giao tự quyết: robot trong phim theo truyện (R1 lắp dần part), không theo robot từng màn. Chưa xem chuyển động thật (ô trình duyệt ẩn, agent chỉ xem trạng thái cuối): xem khi soát cuối.
  Còn: phim 10 dùng icon trong khung tròn cho huy hiệu chưa có vector (hết khi V7a gộp); màn chọn gói ghi mùa 2 là "Địa hình" còn kế hoạch gọi "Ghi nhớ" (chưa đổi); ở 360 px #stage phóng 1,2 nên khung phim tràn 12 px mỗi bên (cả mùa 1, sửa ở V7b).
- **28/10 P10 · Gói 10 Nhà máy chạy lại xong — MÙA 2 ĐỦ 10 GÓI** (agent Claude fable, nhánh claude/trum-mua-2, gộp 0045111, không xung đột). 20 màn trong `man-trum-mua-2.js`:
  chương `tong-hop-2` Tổng hợp (băng chuyền giúp đẩy, đố jet_back() trên bệ súng, giếng sau lưng, sidestep đẩy thùng, mở cửa cho thùng sau lưng, sửa pair_shot(), trạm xa gần, hai màn hai robot,
  trùm "Ba dây chuyền thùng" 3 sân, huy hiệu tong-hop-2); chương `trum-mua-2` Trùm mùa (hàm của em side_push, fire_on, lane_row(n), box_shot cho đội, gate_push, check_lane, far_push; sửa nudge();
  đố băng không chở xích; trùm cuối mùa "Nhà máy chạy lại" 2 sân nối năm hàm, huy hiệu nha-may-chay). Máy kiểm `kiem-trum-mua-2.mjs` 107 (lỗi giả 9 → đỏ 13) + bộ dò `do-duong-trum-mua-2.mjs`.
  Recall gói 10: 1:8 · 2:17 · 3:11 · 4:14 · 5:11 · 6:12 · 7:6 · 8:3 · 9:11; gộp gói 9 + 10: 1:10 · 2:35 · 3:16 · 4:34 · 5:14 · 6:28 · 7:12 · 8:3 · 9:31 (luật ≥ 3 đạt; gói 8 mỏng nhất).
  Người giao chạy lại sau gộp: kiem-trum-mua-2 107, do-duong, kiem-be-sung 107, kiem-doi-mua-2 107, kiem-lo-trinh 894, kiem-che-xe 270, kiem-loi-mua-2 93, kiem-nut-bat-san 30, kiem-bang-mau 19, kiem-phim-goi 41, kiem-khay 184.
  Người giao chấp nhận: ban-bi-chan mức thông tin ở trum-mua-2.2 (cố ý bắn cửa nhịp đang đóng); recall gói 9 chỉ tính màn cần bệ súng / gọi hàm gói 9; ba màn đội khóa như gói 8; trùm cuối 2 sân; cấm nút đè M ở gói 10 (bộ mô phỏng không có).
  Còn: huy hiệu vector tong-hop-2 / nha-may-chay (V7b); thêm hai mã đó vào HUY của phim-mua-2.js (V7b); chưa xem trình duyệt.
- **29/10 MÙA 2 XONG, ĐÃ MỞ** (agent Claude opus, nhánh claude/mua-2-xong, gộp 3614e3b, không xung đột; brief ban-giao/brief-mua-2-xong.md, báo cáo ban-giao/bao-cao-mua-2-xong.md).
  Trùm bien-xich.10 "Đếm để về đúng hàng" + huy hiệu vector bien-xich (mùa 2 đủ 20 trùm, mỗi trùm một huy hiệu vector riêng); 16 chỗ nhảy đường cong ở gói 1 / 2 / 4 sửa hết
  (đổi thứ tự, sửa qua lộ trình, thay màn; giữ `ma`); phanh kiem-lo-trinh.mjs (g) đường cong cả mùa, (h) 20 chương × 10 màn + trùm có huy hiệu (`--loi-gia-mua-2` 8 / 8 đỏ);
  mùa 2 bỏ `an`, tên "Ghi nhớ", ngưỡng sao gói khai cứng 0, 30, …, 270 (lo-trinh-sao.js).
  Người giao kiểm: đo đường cong độc lập 0 chỗ nhảy; chấm trong trình duyệt 200 / 200 màn 3 sao (kho hàm cộng dồn theo lộ trình); trùm bien-xich chơi 3 sao; mùa "Ghi nhớ" hiện ở màn chọn gói
  với nút mua sẵn có; khổ 360 px không tràn; không lỗi console. npm test trên main sau gộp: 88/88.
  Còn: gói T (màn trình diễn `chiChay` cho khối mới mùa 2 + màn giấu hàm cũ, máy dò lách mùa 2), chờ main có cờ `chiChay` của gói HD1 (KE-HOACH-MUA-3.md mục 4 câu 4).

29/10 GÓI T NGHIỆM THU ĐẠT (nhánh claude/t-trinh-dien-mua-2, chưa gộp): màn trình diễn chiChay ở xich, bien-xich (che-cam-bien.6), sung-hoi, tham-so, hong-ngoai, bang-chuyen, day-thung, luc-ban, do-nhiet, be-sung;
  màn ép kế tiếp (mã mẫu sai một chỗ / giấu lệnh cũ / ba sân + đâm-là-thua ở che-cam-bien.5, .9, robot-hoan-thien.9) + hướng dẫn từng bước. Máy dò hoc/kiem-lach-mua-2.mjs (lách A–F, 282 phép dò, 0 lỗ;
  phanh mã mẫu không được thắng sẵn). Còn: màn trình diễn đội (doi-mua-2, che-doi-mua-2) chờ HD3; LỖI CÓ SẴN: bảng chọn số của khay không có distance() / biến gán từ distance(),
  12 màn dùng range(distance()), forward(distance() + n), d = distance() → forward(d) không ghép được bằng khối (máy chấm thì qua).

29/10 GÓI T ĐÃ GỘP (00244a2, main 90/90). SỬA BẢNG CHỌN SỐ (nhánh claude/so-distance 31c60bf, 91/91): ô số có distance(), distance() + <đối số>,
  biến gán d = distance(); range(distance()) / forward(distance() + n) tách được ô; dòng dài xuống hai dòng. Máy kiểm hoc/kiem-o-so.mjs chạm từng ô số của lời giải
  400 màn mùa 1, 2 trên khung thật. CÒN CHỜ USER (10 ô, máy in ra mỗi lần chạy): bang-chuyen.7 cần range(10), che-hong-ngoai.10 cần go_safe(0) (bảng chọn chỉ 1–9);
  khoang-cach.6, me-cung.7–10, che-hong-ngoai.8 lời giải range(20 / 30 / 60) (màn có while, có lẽ giải được bằng while, chưa kiểm); hong-ngoai.6 range(20) có sẵn trong mã mẫu.

29/10 TÊN VÀ PHIM MÙA 2 THEO QUY TẮC (KE-HOACH-7-MUA.md "Quy tắc đặt tên và giọng kể"): tên mùa "Nhà máy"; gói đổi: nha-may → Băng chuyền, hong-ngoai → Cảm biến hồng ngoại,
  luc-ban → Lực phun, doi-mua-2 → R2 trở lại, nha-may-chay → Xe cứu hỏa R1; 20 chương là việc em làm; 10 phim giọng em, phun thay bắn. Còn: chữ "bắn" trong màn (đợt riêng sau giật một ô).
