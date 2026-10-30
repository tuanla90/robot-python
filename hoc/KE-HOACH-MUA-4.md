# Kế hoạch mùa 4 "Thành phố" theo khuôn 10 gói (29/10/2026, user đã chốt lõi; tên gói chờ duyệt)

**User 29/10: phiên Mùa 4 TỰ LÀM, không giao subagent** (memory `mua-4-tu-lam`). Mục 4 "Thứ tự giao" vì thế là thứ tự tự làm.

Phiên giữ: "Mùa 4" (user 29/10 chia lại việc: phiên "Mùa 3" giữ mùa 3, phiên này giữ mùa 4).
Khuôn: [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md) (bảng chuẩn, bố cục 10 gói, quy tắc đặt tên và giọng kể). Mùa 4 được dùng mọi thứ của mùa 1–3.

Bảng mùa 4: thân **Drone pin ít, bay ngắn → hạ cánh / cất cánh để sạc** · tay **Máy sơn chấm ô → bút liền** ·
cảm biến **Camera màu phía trước → camera dưới chân** · vật **hộp màu** · sàn **sàn màu** · cơ chế **ô sạc** ·
Python A **danh sách**, Python B **duyệt `for x in a`, `append`** · cảm biến trả về **chuỗi màu → danh sách màu**.
Cỗ máy xuất xưởng (gói 10): **Drone kẻ vạch R1**, làm việc ở thành phố: bay theo lưới phố, sơn vạch đường / tranh tường, nhìn xuống đọc màu, về ô sạc khi hết pin.

Luật học (mọi gói, như mùa 2, 3):
- đường cong mượt và nhắc lại kiến thức cũ (memory `duong-cong-hoc-va-recall`);
- **show don't tell** (memory `show-dont-tell-khoi-moi`): khối / part / cơ chế mới mở bằng màn trình diễn `chiChay` (bấm Chạy là thắng),
  màn sau ép dùng khối mới (máy dò lách chứng minh), rồi mới thả;
- tên gói / chương / phim theo **quy tắc đặt tên và giọng kể** (nhân vật chính là em, R1 là bộ não robot lắp vào thân drone; tên chương là việc em làm).

## 0. User chốt 29/10

- **Drone đáp đất mới sạc, sạc đầy luôn** (tránh bay đậu nhiều lần): `land()` trên ô sạc P thì pin đầy ngay; đang đậu không bay được, `take_off()` để bay tiếp.
  Gốc (gói 1–4): drone chưa đáp được, ô sạc P chỉ là ô thường (tắt sạc tự động hiện có).
- **Pin gốc 5–6** nếu màn chỉ bay. Màn có hành động tốn thêm pin (sơn từ drone…) thì pin nhiều hơn. Pin khai theo từng màn (`cfg.pin`).
- **Camera gom về một lệnh `color`**, bỏ `look()`. Nâng cấp camera: **gốc đọc 4 hướng**, **nâng cấp thêm "tại chỗ"** (ô dưới chân).
- **Combo gói 9 phải đủ phong phú** (mục 3, N2).
- Tên gói: user chưa ưng bản cũ, bản mới ở mục 2 chờ duyệt.

## 1. Rà màn có sẵn (đo bằng script trên main f18b538, 29/10)

Mùa 4 hiện đang ẩn (`an: true`) và là "kho chứa" của mọi gói cũ chưa xếp (24 gói, gồm cả omni, máy ném, bàn xoay, đua robot… của mùa 5, 7).
Mười một chương dưới đây hợp mùa 4 (110 màn); chương khác chuyển sang mùa 5 / mùa 7 ở P0.

| Chương | Màn | Robot | Dùng gì (số màn) | Ghi chú |
|---|---|---|---|---|
| drone | 10 | drone, có màn gắn nam châm | pin 5, ô sạc P 4 | bay `go_*`, pin, sạc tự động trên P |
| che-drone | 10 | drone | pin 4, P 4, `for c in path` 3 | hàm cho drone |
| flycam | 10 | drone + camera bụng `look()` | danh sách 7, look 6, pin 1 | camera dưới chân của drone |
| list | 10 | hai bánh | danh sách 10, `for x in a` 6 | dạy danh sách thuần |
| che-list | 10 | hai bánh (+ cảm biến khoảng cách) | danh sách 10 | hàm nhận danh sách |
| mau | 10 | hai bánh + cảm biến màu bụng / camera trước | color 10 | sàn màu |
| che-mau | 10 | hai bánh + màu / camera | color 6 | |
| may-son | 10 | hai bánh + máy sơn | **dot 4, pen_down 6**, danh sách 2 | lẫn chấm ô và bút liền |
| che-may-son | 10 | hai bánh + máy sơn | dot 2, pen 3, danh sách 3, color 2 | lẫn |
| doi-nam-cham | 10 | hai bánh nam châm + kẹp | color 8, cảm biến từ | gói đội của mùa 4 (bảng chuẩn) |
| che-doi-nam-cham | 10 | như trên | color 8 | |

Lõi đã có: drone bay `go_up / go_down / go_left / go_right`, pin `battery()` (cần `cfg.pin`), ô sạc `P` (cuối nhịp trên P thì pin đầy, KHÔNG cần lệnh),
máy sơn `ink(c) / dot() / pen_down() / pen_up()` (chỉ xe bánh, xích, omni), cảm biến màu ở bụng (`color()` đọc ô dưới), camera trước (`color()` đọc ô / vật trước mặt),
camera bụng drone `look()`, sàn màu, vật có màu (`lopVatMau`), chế độ danh sách của khay (`TP.datCheList`).

## 2. Mười gói (đề xuất; có / mới ước, P0 đo lại)

| Gói | Tên đề xuất (chờ duyệt) | Chương 1 | Chương 2 | Có / mới |
|---|---|---|---|---|
| 1 | Cất cánh (thân drone gốc) | bay, pin ít: drone | **danh sách** (Python A): list | 20 / 0 |
| 2 | Chấm sơn (máy sơn gốc) | `dot()`: may-son phần dot + mới | **duyệt `for x in a`, `append`** (Python B): che-list | ~14 / ~6 |
| 3 | Camera bốn hướng (camera gốc) | `color(huong)` đọc 4 hướng: mau dựng lại | chế lệnh: chuỗi màu → danh sách màu (che-mau dựng lại) | ~16 / ~4 |
| 4 | Phố màu (sân: hộp màu, sàn màu, ô sạc) | mới | chế lệnh cho sân | 0 / 20 |
| 5 | Trạm sạc (nâng cấp drone: đáp đất sạc) | mới | che-drone dựng lại | 10 / 10 |
| 6 | Nét liền (nâng cấp máy sơn: bút liền) | may-son phần pen_down + mới | che-may-son + mới | ~12 / ~8 |
| 7 | Nhìn dưới chân (nâng cấp camera: tại chỗ) | flycam dựng lại (`look()` → `color("here")`) | mới | 10 / 10 |
| 8 | Đội chia hàng (đội nam châm và màu) | doi-nam-cham | che-doi-nam-cham | 20 / 0 (dựng lại đường cong) |
| 9 | Sơn từ trên cao (combo: drone + máy sơn + camera) | **mới** (mục 3, N2) | mới | 0 / 20 |
| 10 | Drone kẻ vạch R1 xuất xưởng | tổng hợp | trùm mùa | 0 / 20 |
| | | | **Tổng** | **~102 có / ~98 mới** |

Ghi chú chia:
- Máy sơn có sẵn lẫn chấm ô và bút liền: màn dùng `dot()` về gói 2 (tay gốc), màn dùng `pen_down()` về gói 6 (nâng cấp). P0 tách theo lời giải.
- Danh sách (list, che-list) đang chạy trên xe hai bánh: được dùng làm chương dạy Python (bảng chuẩn cho chương 2 "giới thiệu Python" dùng part cũ). Màn mới nên dần dùng drone / máy sơn.
- Gói đội của mùa 4 là "Đội nam châm và màu" (bảng chuẩn, mục "Gói đội hiện có xếp vào đâu"). Đội màu và vòi phun, đội drone và máy ném sang mùa 7 Phối hợp.

## 3. Lõi mới cần làm (P1 mùa 4, tự làm)

- **N1 · Đáp đất để sạc** (gói 5, user chốt): `land()` hạ drone xuống ô đang ở; trên ô sạc P thì pin ĐẦY NGAY. Đang đậu: lệnh bay bị chặn (chẩn đoán "đang đậu, cần take_off()"),
  `take_off()` cất cánh. Đậu không tốn pin. Gốc (gói 1–4): bỏ sạc tự động trên P cho drone chưa có nâng cấp (màn drone cũ có P: 4 + 4 màn, đo lại).
  Đụng san-hoc.js (luật pin, trạng thái đậu), cham.js (lời), hình (drone đậu: bóng sát đất, cánh quay chậm), khay (hai khối mới).
- **N2 · Camera một lệnh `color`** (user chốt): `color(huong)` với huong là 4 hướng; nâng cấp thêm "here" (ô dưới chân).
  Xe: "front" / "left" / "right" / "back" (theo mũi xe). Drone (không có mũi): "up" / "down" / "left" / "right" theo bản đồ, khớp go_up / go_down… (chờ chốt).
  `color()` không đối số GIỮ nghĩa cũ (cảm biến bụng / camera trước) để 61 màn cũ ngoài mùa 4 không vỡ; màn mùa 4 dùng dạng có hướng. `look()` không dùng ở mùa 4 (11 màn flycam / đội drone viết lại).
  Cảm biến trả về đúng ý bảng chuẩn: chuỗi màu, rồi gom 4 hướng thành danh sách màu (`[color(h) for …]` chưa học, nên dùng `append` trong vòng lặp).
- **N3 · Drone gắn máy sơn, sơn ô dưới** (combo gói 9, user: "combo nên đủ phong phú"): mẫu nam châm bụng nhện của mùa 3 (`ncBung()`).
  Các ý cho 20 màn (mỗi màn một ý, chương 2 trộn):
  - sơn qua chỗ xe không tới: vạch băng qua rào, hố, băng chuyền, đệm từ (drone miễn đệm);
  - bút liền trên không: `pen_down()` rồi bay, mọi ô bay qua thành vạch, kể cả ô có vật;
  - đọc rồi sơn: `color("here")` thấy vạch phai thì tô lại đúng màu, vạch còn tốt thì bỏ qua;
  - tranh tường theo danh sách: `mau = ["red", "blue", …]`, `for c in mau: ink(c); dot(); go_right()`;
  - pin và sơn: sơn tốn thêm pin, phải tính đáp trạm sạc giữa chừng (`land()` / `take_off()`);
  - phối hợp tay: drone vừa mang vật bằng nam châm (mùa 3) vừa không sơn được (một bụng một món), phải chọn: chở trước hay sơn trước.
- **N4** · màn trình diễn + màn ép cho từng khối mới; máy dò lách mùa 4 (`hoc/kiem-lach-mua-4.mjs` dựa trên `hoc/lach-chung.mjs`): lách "danh sách viết cứng thay duyệt",
  "hằng thay `color()`".

## 4. Thứ tự làm (phiên Mùa 4 tự làm; npm test chạy nền khi máy rảnh)

0. Chờ phiên khác: giật một ô (đang chạy), P1b mùa 3, Phun nhẹ A / B. Mùa 4 đụng lo-trinh-hoc.js (khối MUA_4 riêng, sau MUA_3) và lo-trinh-sao.js: báo phiên "Mùa 3" trước khi sửa.
1. **P0 · Khung mùa 4**: khối `MUA_4` 10 gói bằng màn có sẵn (bảng mục 2), chương ngoài mùa 4 chuyển sang mùa ẩn sau, tệp ngân hàng rỗng cho chương mới,
   tách máy sơn dot / pen, máy kiểm mùa 4 trong kiem-lo-trinh.mjs (a)–(h) như mùa 3, `--loi-gia-mua-4`.
2. **P1 · Lõi mới** (đụng san-hoc.js / cham.js chung: báo phiên Mùa 3, làm sau P1b / Phun nhẹ của phiên khác): N1 đáp đất sạc, N2 camera `color(huong)`, N3 drone sơn ô dưới.
3. **P2 · Màn** theo gói 1 → 10 (gói đầu làm luôn máy dò lách mùa 4), rồi phim mùa 4, soát 200 / 200 trên trình duyệt, mở mùa 4.

## 5. Câu hỏi chờ user

1. Tên 10 gói (mục 2): duyệt bộ mới hay chỉnh chỗ nào?
2. Camera của drone: 4 hướng theo bản đồ ("up" / "down" / "left" / "right", khớp go_up…) hay theo hướng bay gần nhất? Đề xuất: theo bản đồ.

## 6. Trạng thái

- **29/10 P0 · Khung mùa 4 xong** (phiên Mùa 4 tự làm, nhánh `claude/khung-mua-4`, chưa gộp main). Khối `MUA_4` trong lo-trinh-hoc.js ngay sau khối mùa 3;
  10 tệp ngân hàng rỗng (man-cat-canh … man-trum-mua-4) đã đăng ký require + choi.html; mùa 5 "Sân bóng" (ẩn) nhận 18 gói cũ ngoài khuôn
  (Sân cơ khí, omni, máy ném, lắp ráp, đua, các gói đội…), ngưỡng tính lại trong mùa 5. Khay gói 1–5 bớt pen_down / pen_up.
  Máy kiểm: kiem-lo-trinh.mjs mục mùa 4 (a)–(d) (bảng, part mùa 1–4, bút liền từ gói 6, ô sạc từ gói 5), `--loi-gia-mua-4` HỎNG 4 / 4.
  Máy kiểm cũ khẳng định "mùa 4 cũ" sửa theo (kiem-goi: năm mùa; kiem-lo-trinh: che-xich / gói ngoài khuôn mùa 3 / rap-du 95 ★ ở mùa 5;
  kiem-goi-doi: nhánh khung mùa 4; kiem-may-son: may-son tách chấm / nét liền; kiem-dua-robot, kiem-doi-thu-manh: mùa 5).
  Có / thiếu theo gói: 1 Cất cánh 16/4 · 2 Chấm sơn 14/6 · 3 Camera bốn hướng 20/0 (dựng lại sau N2) · 4 Phố màu 0/20 · 5 Trạm sạc 14/6 ·
  6 Nét liền 16/4 · 7 Nhìn dưới chân 10/10 · 8 Đội chia hàng 20/0 · 9 Sơn từ trên cao 0/20 · 10 Drone kẻ vạch R1 0/20. Tổng 110 / 90.
- **29/10 Gói 1 Cất cánh xong** (c37bc2a): man-cat-canh.js drone.11 (trình diễn) · .12 · .13 · .14 (trùm giao hàng qua phố), list.11; list.1 thành trình diễn,
  cắt list.2. Đường cong (lề dòng 3 / nhịp 4 / ô 6 so màn mốc trước) không nhảy.
- **30/10 Gói 2 Chấm sơn xong**: man-cham-son.js may-son.11 (trình diễn ink / dot) · .12 · .13 · .14 · .15 · .16 (trùm, chế paint_row(colors)).
  Thứ tự may-son 11 · 1 · 2 · 12 · 6 · 7 · 14 · 15 · 13 · 16; che-list 1 · 2 · 3 · 4 · 5 · 6 · 8 · 9 · 7 · 10 (Đường về 26 nhịp dời ra sau cho khỏi nhảy).
  kiem-man-mua-4 siết: lời giải không được kèm chẩn đoán (bắt được may-son.14 / .15 đâm tường cuối hàng, đã nới sân). 96 / 96 bộ đạt.
- **30/10 Gói 6 Nét liền xong**: man-net-lien.js net-lien.1 (trình diễn pen_down / pen_up) · .2 Nét đứt · .3 Khung chữ nhật · .4 Dấu bằng hai màu;
  che-may-son.11 Nét gập hai màu (chế bend(c, n)) · .12 Ô cờ hai màu (chế checker(a, b, n)) làm cầu nối nhịp.
  Thứ tự net-lien: net-lien.1 · may-son.3 · may-son.4 · net-lien.2 · may-son.5 · may-son.8 · may-son.9 · net-lien.3 · net-lien.4 · may-son.10 (trùm);
  che-may-son: 1 · 9 · 2 · 11 · 4 · 3 · 12 · 6 · 5 · 10. che-may-son.7 Lưới chấm và .8 Khung lồng khung (37 / 44 nhịp, sân 49 ô, khó hơn trùm 26 nhịp)
  dời sang gói 10 chương tong-hop-4 "Đủ bộ" (màn nhắc lại; gói 10 hiện có hai màn đó, chưa đủ).
  kiem-man-mua-4 thêm: hàm em chế ở màn mới không được trùng tên hàm đã có trong kho (bắt corner() mùa 1, đã đổi thành bend).
- **30/10 P1 lõi** (nhánh claude/khung-mua-4, đã gộp main ffc9492 trước khi làm; báo phiên Mùa 3 trước khi sửa tệp chung, bên đó không đụng các chỗ này):
  - N1 đáp đất sạc (587c16b): khay có land / take_off thì ô P chỉ sạc khi land() trên đó (đầy ngay); nhịp đậu trọn không tốn pin, nhịp land / take_off tốn 1;
    go_*() lúc đậu: đứng yên mất nhịp, chẩn đoán dang-dau (không dừng chương trình); land() trên rào / hố / băng / bậc / thùng / vật: dap-bi-chan, vẫn bay.
    Drone gốc (không có land) GIỮ sạc tự động trên P để màn cũ ngoài mùa 4 không đổi; mùa 4 gói 1–4 không có ô P (máy kiểm (d)). kiem-dap-sac.mjs.
  - N2 camera bốn hướng (587c16b): bộ phận mới camera-4 (tháp bốn ống kính trên nóc), color(huong): xe "front" / "left" / "right" / "back" theo mũi, drone / nhện
    "up" / "down" / "left" / "right" theo bản đồ; nâng cấp { ma: 'camera-4', taiCho: true } thêm "here". color() để trống, hướng lạ, "here" chưa nâng cấp: lỗi chạy
    huong-cam-sai. Cảm biến bụng / camera trước cũ giữ color() không đối số (61 màn cũ không đổi). kiem-cam-4.mjs. Khay: khối mẫu chèn sẵn color("front") / color("up").
  - N3 drone gắn máy sơn: đầu sơn treo dưới bụng, tô ô dưới drone, cùng luật máy sơn của xe; nhịp có tô tốn thêm 1 pin; bút còn hạ khi bay ngang rào / hố là tô lên đó
    (ô hình không được nằm trên rào / hố nên là tô ngoài hình). Không đi chung nam châm. kiem-drone-son.mjs.
- **30/10 Gói 4 Phố màu xong (20 màn mới)**: man-pho-mau.js. Robot: drone gắn camera bốn hướng (+ nam châm khi chở hộp). Cái mới của gói: phố màu có hộp màu
  và ô đích màu (đích chỉ nhận hộp cùng màu), camera đọc ô bên cạnh để chọn đường.
  - pho-mau (Đi giữa phố màu): 1 trình diễn hộp về đúng màu · 2 ép đọc màu (hai sân khác màu hộp) · 3 phố đèn xanh · 4 theo vạch xanh (for + if) · 5 tìm hộp (while)
    · 6 tìm hộp rồi chọn đích · 7 đếm nhà đỏ (biến đếm) · 8 mật lệnh màu (danh sách, append, for c in a) · 9 sửa mật lệnh · 10 trùm giao hàng theo số nhà đỏ.
  - che-pho-mau (Chế lệnh: qua phố): find_box() · fly_to(col) · read_row(a, n) · follow_code(a) · drop_down(n) · place_box() · sửa hàm của màn scan_street
    · red_count(a, n) với len(a) · sửa hàm của màn walk_code · trùm tự viết chương trình chính bằng read_row / follow_code / place_box.
  - Màn đọc camera dùng hai sân khác màu để chương trình viết cứng không qua (thêm vào ngoại lệ NHIEU_SAN_KHONG_TRUM của kiem-lo-trinh.mjs).
  - Đường cong trong gói không nhảy; còn một chỗ ở đầu gói (pho-mau.2 9 dòng sau che-mau.9 2 dòng): gói 3 dựng lại sẽ có màn đứng trước.
  - Giao diện: chạm chữ hướng trong c = color("up") mở bảng chọn hướng; bảng chọn vế trái của điều kiện có nút cho từng hướng (đã thử trên trình duyệt).
- **30/10 Phương án A (user chọn) xong cho gói 3, 5, 7**: màn cũ dạy cơ chế đã thay sang mùa 5 (ẩn): gói mau (mau, che-mau), gói flycam, gói chứa
  drone-sac-cu (drone.4, .5, .6, .10 và che-drone.3, .5, .6, .8, .9, .10: sạc tự động / recharge()), đứng trước flycam và đội drone để recharge() vẫn được tạo trước.
  - Gói 3 Camera bốn hướng (man-camera-bon-huong.js, 20 màn mới): xe hai bánh gắn camera-4. cam-bon: rẽ theo màu trái / phải, dừng trước vạch đỏ (front), nhìn sau
    lưng (back), ngã tư ba sân, hai ngã rẽ, theo vạch xanh có rẽ, đếm ô vàng hai bên, sửa hướng camera, trùm đường xanh tới ô vàng (while). che-cam-bon: turn_green,
    go_to(col), sửa go_until, yellow_sides(a) với len(a), green_step, cross4, sort_by_color (xe kẹp), chạy tới hộp rồi xếp, sửa walk_green, trùm đường xanh tới hộp.
  - Gói 5 Trạm sạc (man-tram-sac.js): tram-sac 10 màn mới (trình diễn đáp sạc, ghé trạm, trạm trên mái, đậu chờ cửa nhịp không tốn pin, hai trạm, đáp khi pin yếu
    bằng battery(), quên cất cánh, đáp ít nhất với hai mức pin, ngưỡng pin sai, trùm giao hàng qua trạm). che-drone: giữ che-drone.1, .2, .4, .7 (không ô sạc)
    + 6 màn mới dock(), charge_stop (sửa), fly_dock(n), safe_go(n), cẩu hàng qua hai trạm, trùm kho hàng có trạm sạc.
  - Gói 7 Nhìn dưới chân (man-nhin-duoi-chan.js, 20 màn mới): drone gắn camera-4 bản nâng cấp taiCho, color("here"). nhin-duoi: dừng trên ô đỏ, mũi tên màu,
    đếm ô đỏ, ghi màu đường bay, đọc hộp dưới bụng, nhầm "down" với "here", tìm hộp đỏ, đếm ô vàng, trùm chở đúng hộp theo đơn. che-nhin-duoi: seek_here(col),
    read_below(a, n), arrow_step, count_here(a, n, col), deliver_up(n), lift_by_color, sửa lift_n, sửa find_col, đơn hàng bằng hàm, trùm đếm rồi nâng.
  - Gói 8 Đội chia hàng đổi camera trước thành camera-4: color() → color("front"), sort_color → sort_by_color (gói 3 tạo). Gói đội mùa 5 vẫn dùng sort_color cũ.
  - Đường cong gói 1–7 không nhảy (cong4.js), trừ chỗ che-list.4 (bãi trống) đã ghi; gói 8 còn nhảy như cũ (mục 15).
- **30/10 Gói 9 Sơn từ trên cao xong (20 màn mới)**: man-son-tren-cao.js. Robot combo: drone nâng cấp đáp đất + máy sơn dưới bụng + camera bốn hướng nâng cấp "here";
  mục tiêu to-hinh. Nhắc lại: danh sách (gói 1, 2), color("here") / "up" (gói 4, 7), dock() (gói 5), bút liền (gói 6), read_below (gói 7), băng chuyền / rào / hố (mùa 2, 3).
  - son-tren-cao (Kẻ vạch qua rào): 1 trình diễn kẻ vạch trên băng, nhấc bút qua rào · 2 nhấc bút qua rào (ép pen_up) · 3 vạch đứt qua rào và hố (for) · 4 lề đường đỏ vàng
    (for c in [...]) · 5 tô lại vạch mờ (ink(color("here")), hai sân) · 6 chép màu hàng trên (color("up"), bỏ ô trống, hai sân) · 7 sơn tốn pin (đáp trạm bằng dock())
    · 8 khung quanh ao · 9 sửa cột màu (dot trước ink) · 10 trùm kẻ vạch theo dấu (đọc dấu, ba chặng, hỏi pin ở trạm).
  - che-son-tren-cao (Chế lệnh: tranh tường): stripe(c, n) · retrace(n) · paint_list(a) · dashes(c, n) (gọi stripe) · sửa hop_fence · trace_marks(n) · mural(a, b)
    (hàng dưới phải sang trái) · copy_down(a, n) (read_below + paint_list) · sửa line_dock (dock trong vòng lặp) · trùm tự viết bằng retrace, dock, stripe.
  - Đường cong trong gói không nhảy. Chỗ nhảy ở ranh gói 10 (che-may-son.7 sau che-son-tren-cao.9) chờ gói 10 dựng.
  - Không có màn nam châm: lõi N3 cấm máy sơn đi chung nam châm (một bụng một món), ý "chở trước hay sơn trước" ở mục 3 bỏ (mục 7 câu 17).
- **30/10 Gói 10 Drone kẻ vạch R1 xong (18 màn mới + 2 màn xe cũ)**: man-trum-mua-4.js. Mỗi màn ôn ít nhất hai gói; gói 8 (đội) được nhắc ba lần ở gói 10
  (gói 9 chưa nhắc lần nào), gói 3 (xe camera) ba lần.
  - tong-hop-4 (Đủ bộ): 1 ghé trạm rồi phân loại (fly_dock + lift_by_color) · 2 xe máy sơn chấm theo đường xanh (green_step) · 3 giao hộp theo đơn (seek_here + deliver_up)
    · 4 xe kẻ tới vạch đỏ (go_to + bút liền) · 5 đội drone nam châm chuyền hộp qua rào cho xe kẹp sort_by_color · 6 chép mật lệnh hàng trên (read_row + paint_list)
    · 7 đội drone dọn lối cho xe máy sơn · 8 bay theo danh sách hướng · 9 sửa hàm của màn mark_step (arrow_step) · 10 trùm chương (trace_marks, dock, stripe, danh sách màu).
  - trum-mua-4 (Phố mới kẻ vạch): chế charge_if(k) · mark_dash(n) · stairs(c, n) · sửa pond_frame · đội: lift_aside() · bar_len(c, a) (count_here) · street(c, n) (stripe)
    · che-may-son.7 Lưới chấm · che-may-son.8 Khung lồng khung (màn xe cũ, mục 9: giữ, đặt sau street làm cầu nối) · trum-mua-4.10 TRÙM CUỐI MÙA "Drone kẻ vạch R1 xuất xưởng"
    (trace_marks, charge_if, mark_dash, danh sách màu; pin 10, hai trạm).
  - Màn đội chạy được mục tiêu to-hinh (xe sơn, drone dọn đường). Đường cong gói 9, 10 không nhảy (cong4.js).
  - Chưa có: huy hiệu và phim gói 10 (phim mùa 4 là bước sau, mục 4 P2).
- **30/10 Phim mùa 4 xong** (game/phim-mua-4.js, 10 phim 37 khung, lời ở chu.js `pg.<gói>.<n>`, tem `pg.tem.drone-ke-vach`; kịch bản KE-HOACH-PHIM-GOI.md mục 3e).
  kiem-phim-goi.mjs thêm mục 1d (mọi gói MUA_4 có phim, khung cuối phim bộ phận có code, tem gói 10, thẻ script); kiem-huy-hieu-phim-vector B2 đạt (ô vẽ VeVector, canvas laVector).
  Đã chiếu thử cả 10 phim trên trình duyệt (gọi PhimGoi.mo vì mùa 4 còn ẩn): không lỗi console.
- **30/10 Huy hiệu mùa 4 xong** (huy-hieu-vector.js): 13 hình mới cam-bon, che-cam-bon, pho-mau, che-pho-mau, tram-sac, net-lien, nhin-duoi, che-nhin-duoi,
  son-tren-cao, che-son-tren-cao, tong-hop-4, drone-ke-vach (cỗ máy, hình gói 10), trum-mua-4. Mọi chương mùa 4 có huy hiệu (drone, list, may-son, che-list, che-drone,
  che-may-son có từ trước; doi-* dùng bí danh hai-robot). Gói mùa 4 có hình riêng (MUA_4 hinh = chương 1, gói 10 = drone-ke-vach). Màn trùm (cuối) mỗi chương mùa 4
  trao huy hiệu mã chương (trum-mua-4.10 trao drone-ke-vach); màn khác thôi trao (may-son.10 ở chương net-lien đổi sang net-lien). Phim gói 10 khung 1: huy hiệu bay quanh.
  kiem-huy-hieu-phim-vector A7: 13 mã vào MOI_SAU_CHUP.
- **30/10 Gói 8 Đội chia hàng làm lại theo tính giáo dục** (user: "tối ưu cho hợp tính giáo dục nhất, làm lại nếu cần"; bản trước chỉ lo đường cong
  nên có chỗ dùng khái niệm gỗ trước khi dạy, hai màn trạm liền nhau, ba màn sửa liền nhau, bỏ màn đảo vai). Luật đặt cứng khi tìm thứ tự: khái niệm dạy trước dùng sau,
  không hai màn cùng kiểu (sửa / trạm) liền nhau, doi-nam-cham.1 mở đầu, đường cong không nhảy (cong4.js). Chỉ xếp lại hay hai màn cầu đều không đủ; lời giải giữ
  sát thang kỹ năng gốc nhất cần bốn màn mới (man-doi-chia-hang.js):
  - chương 1 Chia hàng theo màu: 1 Hai làn hai tay · 2 Nam châm tự động (chờ bằng cảm biến) · 3 Kéo qua rào · **11 Lại gần mới hút được** (tầm hút sắt 2 ô)
    · 4 Gỗ thì tự lấy (gỗ, chờ có hạn, đường lui) · 5 Dọn gỗ cho nam châm (đảo vai) · 7 Chờ quá ngắn (sửa) · **12 Chuyền ra sau lưng** (pass_back, ngăn hai màn sửa)
    · 8 Bó tay cho sớm (sửa; R2 tự động dùng pass_back) · 10 trùm.
  - chương 2 Chế lệnh: **11 Hai trạm sát nhau** (ôn vòng lặp cả đội sau trùm) · 1 hold_on · 2 hand_off · 5 Ba màu một hàng · 3 plan_b · 6 Giao cho kịp · 7 Sửa thứ tự giao
    · **12 Hai trạm có hạn** (cùng việc với màn đầu chương nhưng viết bằng hàm: thấy hàm làm chương trình ngắn hẳn) · 8 Sửa hàm dò cực · 10 trùm.
  - sang mùa 5 (ẩn, gói chứa doi-nam-cham-cu): doi-nam-cham.6 Hai chuyến tự động, .9 Ba trạm (vòng lặp cả đội nay ở che-doi-nam-cham.11),
    che-doi-nam-cham.4 Ba trạm có hạn, .9 Hốc nhường đường.
  - doi-nam-cham.8 mở hai ô thừa cạnh R2 (6 → 8 ô; robot không đi tới, lời sai "tránh sai phía" vẫn thua).
  Máy kiểm theo: kiem-doi-nam-cham (lời sai bốn màn mới), kiem-goi-doi (chương chứa -cu ở mùa 5; hàng theo vị trí), kiem-lo-trinh (rap-du mùa 5: 165 ★).

## 7. Cần trao đổi lại với user (ghi dần, user treo máy đêm 29/10)

1. Tên 10 gói (mục 2) đang dùng bản đề xuất mới để dựng khung; user chưa duyệt. Đổi tên chỉ sửa chữ trong MUA_4 (mã gói giữ).
2. Camera của drone: 4 hướng theo bản đồ ("up" / "down" / "left" / "right") hay theo hướng bay; P0 chưa đụng, P1 làm theo bản đồ nếu chưa có ý khác.
3. Gói 3 Camera bốn hướng và gói 7 Nhìn dưới chân đang chứa màn cũ dùng color() bụng / look(): dựng lại sau lõi N2 (P1), số màn mất / giữ báo sau.
4. Mùa 5 "Sân bóng" chỉ là chỗ chứa tạm 18 gói cũ (vẫn ẩn), ngưỡng sao trong đó tính lại (vd rap-du 90 → 95 ★): dựng thật khi tới mùa 5.
5. Lõi P1 (đáp đất sạc, camera color(huong), drone sơn ô dưới) đụng san-hoc.js / cham.js chung: chờ P1b mùa 3 và Phun nhẹ A / B gộp, hay làm luôn trên nhánh riêng rồi gộp sau (sẽ phải giải xung đột)?
6. Đường cong gói 2: che-list.4 (Đo một cạnh) nhảy số ô 12 → 47 so với che-list.3. Ba sân của các màn đo là bãi trống 7 × 7, xe chỉ đi chu vi tối đa
   4 × 4 nên tôi để nguyên (coi số ô của bãi trống là đo lệch). Muốn mượt hẳn thì thu bãi về 5 × 5 hoặc 6 × 6 (sửa PHONG trong man-che-list.js, đo lại sao).
7. Chương che-list (gói 2) không có màn trình diễn: không có khối mới (hàm nhận danh sách ghép hai thứ đã học), nên tôi không thêm.
8. Hai chỗ nhảy ở ranh giới gói chưa dựng xong, để lại: may-son.3 (đầu gói 6, 18 ô) sau che-drone.9 (cuối gói 5, 9 ô): gói 5 dựng lại sau lõi P1;
   che-may-son.7 (đầu gói 10, 37 nhịp, 49 ô) sau che-doi-nam-cham.9 (gói 8): gói 9 còn trống, gói 10 sẽ có màn đứng trước.
9. Dời che-may-son.7 / .8 sang gói 10: đồng ý không, hay muốn cắt hẳn (gói 10 sẽ dựng màn nhắc lại mới)?
10. Câu hỏi 2 (camera của drone theo bản đồ hay theo hướng bay): tôi đã làm THEO BẢN ĐỒ ("up" / "down" / "left" / "right", khớp go_up…). Đổi được nếu cần.
11. Luật pin tự đặt (đơn giản, đổi được): nhịp land() / take_off() tốn 1 pin, đậu trọn nhịp không tốn; sơn từ drone tốn thêm 1 pin mỗi nhịp có tô.
12. go_*() lúc drone đang đậu: tôi cho đứng yên mất nhịp + lỗi dang-dau (như đâm tường), KHÔNG dừng chương trình. Muốn dừng hẳn thì đổi một dòng.
13. Giao diện color("hướng"): khay chèn sẵn color("front") / color("up"); chạm chữ hướng đổi được (đã thử trên trình duyệt, gói 4).
    Bộ lắp ráp (màn lắp robot) chưa có camera-4 trong danh mục mua (giá, bảng kế hoạch): thêm khi dựng màn lắp ráp mùa 4.
14. ~~Chặn gói 3, 5, 7~~: user 30/10 chọn A, đã làm (mục 6).
15. ~~Gói 8 nhảy đường cong~~ làm lại 30/10 theo tính giáo dục (mục 6): bốn màn mới, bốn màn cũ sang mùa 5 (ẩn): doi-nam-cham.6, .9, che-doi-nam-cham.4, .9.
16. ~~Gói 9, gói 10~~ xong 30/10 (mục 6). Mùa 4 đủ 200 màn; còn phim mùa 4, huy hiệu, soát 200 / 200 trên trình duyệt, mở mùa 4.
17. Gói 9 không có màn nam châm (máy sơn và nam châm không gắn chung). Muốn có ý "chở trước hay sơn trước" thì cần màn hai drone (một sơn, một chở) kiểu gói đội: để gói 10?
19. Mục 9 (che-may-son.7 / .8): tôi giữ, đặt ở trum-mua-4 vị trí 8, 9 (sau màn cầu nối street 25 nhịp). Muốn cắt thì thay bằng hai màn drone mới.
20. ~~Huy hiệu mùa 4~~ xong 30/10 (mục 6).
18. Ranh gói 5 / 6: may-son.3 (đầu gói 6, 18 ô) sau che-drone.16 (10 ô) nhảy số ô (như mục 8, nay màn đứng trước là che-drone.16). Chưa sửa.

