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

## 7. Cần trao đổi lại với user (ghi dần, user treo máy đêm 29/10)

1. Tên 10 gói (mục 2) đang dùng bản đề xuất mới để dựng khung; user chưa duyệt. Đổi tên chỉ sửa chữ trong MUA_4 (mã gói giữ).
2. Camera của drone: 4 hướng theo bản đồ ("up" / "down" / "left" / "right") hay theo hướng bay; P0 chưa đụng, P1 làm theo bản đồ nếu chưa có ý khác.
3. Gói 3 Camera bốn hướng và gói 7 Nhìn dưới chân đang chứa màn cũ dùng color() bụng / look(): dựng lại sau lõi N2 (P1), số màn mất / giữ báo sau.
4. Mùa 5 "Sân bóng" chỉ là chỗ chứa tạm 18 gói cũ (vẫn ẩn), ngưỡng sao trong đó tính lại (vd rap-du 90 → 95 ★): dựng thật khi tới mùa 5.
5. Lõi P1 (đáp đất sạc, camera color(huong), drone sơn ô dưới) đụng san-hoc.js / cham.js chung: chờ P1b mùa 3 và Phun nhẹ A / B gộp, hay làm luôn trên nhánh riêng rồi gộp sau (sẽ phải giải xung đột)?

