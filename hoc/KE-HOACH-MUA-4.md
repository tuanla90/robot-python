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
13. Giao diện color("hướng"): khay chèn sẵn color("front") / color("up"); chưa thử trên trình duyệt việc chạm chữ "front" để đổi hướng (cần màn gói 3).
    Bộ lắp ráp (màn lắp robot) chưa có camera-4 trong danh mục mua (giá, bảng kế hoạch): thêm khi dựng màn lắp ráp mùa 4.
14. **Chặn gói 3, 5, 7 (cần user chọn)**: màn cũ của ba gói dạy cơ chế mà user đã thay.
    - Gói 5: drone.5 TẠO hàm cốt truyện recharge() = bay lên ô P rồi xuống (sạc tự động). recharge() còn được drone.6, drone.10, che-drone.5, .8, .9, .10, flycam.6
      VÀ ba màn đội drone ẩn ở mùa 5 (doi-drone.6, .10, che-doi-drone.10) dùng. Luật mới "đáp mới sạc" làm recharge() cũ sai nghĩa.
    - Gói 3: chương mau / che-mau dạy cảm biến màu Ở BỤNG (color() đọc ô dưới xe) và camera trước, không phải camera bốn hướng. Ô dưới chân lại chính là nâng cấp "here" của gói 7.
    - Gói 7: flycam dùng look() (user bỏ look).
    Phương án: (A) dời các màn cũ đó sang một chương chứa ở mùa 5 (ẩn, cạnh đội drone để recharge() vẫn được tạo trước khi đội drone dùng), dựng gói 3, 5, 7
    bằng màn mới theo luật mới (khoảng 40 màn mới); (B) giữ màn cũ, viết lại lời giải từng màn theo luật mới (recharge() mới = đáp, sạc, cất cánh; đo lại sao, sửa cả
    ba màn đội drone mùa 5); (C) giữ nguyên, chỉ thêm màn mới (mâu thuẫn luật user chốt). Tôi nghiêng về A: màn cũ thiết kế quanh "ghé P liên tục", đúng điều user
    muốn tránh; viết lại theo B gần bằng làm mới mà vẫn kẹt bố cục cũ. Chưa làm, chờ user.

