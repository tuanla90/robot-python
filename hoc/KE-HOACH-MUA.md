# Kế hoạch tổng thể các mùa: mỗi mùa một ý Python + bộ part phục vụ ý đó (26/10/2026, CHƯA DUYỆT)

User chốt hướng 26/10:
- Mùa 1–3: **mỗi mùa một kiến thức Python mới, kèm 2 thân, 2 tay, 2 cảm biến** mà luật chơi của chúng cần đúng kiến thức đó. Mùa 1 theo [KE-HOACH-MUA-1.md](KE-HOACH-MUA-1.md).
- **Gói đội hai robot** giữ kịch bản có sẵn (bắt buộc kết hợp cả hai robot), đứng **ngay sau part thứ hai mà nó cần**.
- **Mùa 4 tách riêng**: chế độ tự chọn part, màn robot 2 cố định / sửa robot 1 để phối hợp, đối kháng với robot hệ thống (làm sau).
- **Mọi chương đúng 10 màn.** Mùa 1: 160 màn; **mùa 2 và mùa 3: mỗi mùa 250 màn** (mục 7).
- Sân cơ khí dời về đầu mùa 3. **Súng hơi về mùa 2** (thêm chương bắn nhanh / bắn tụ, mục 10), **Máy ném sang mùa 3**.
- Gói **Loa** (KE-HOACH-LOA.md, nhánh `claude/music-element-integration-02284a`, chưa vào main) và gói **Sân cơ khí** `ban-xoay`
  (bàn xoay, nút đè, cổng dịch chuyển; ngày 26/10 còn là thay đổi **chưa commit** ở thư mục repo chính, nhánh `huong-4-co-che-san`) nằm trong kế hoạch này.

## 1. Khuôn của mùa 1–3

```
Gói khái niệm (ý Python mới, dùng robot quen)
  → gói part (làm quen + chế lệnh, 20 màn); ý Python của mùa là công cụ chính trong gói
  → gói đội ngay sau part thứ hai mà nó cần (2 chương, 20 màn)
```

Luật chọn part: **lệnh của part phải nhận vào hay trả về đúng loại dữ liệu mà mùa đang dạy.**
Part không có lý do Python rõ (địa hình, vật lý) vẫn vào được, nhưng gói chế lệnh của nó phải có vài màn dùng ý Python của mùa.

## 2. Bảng các mùa

| Mùa | Ý Python | Thân | Tay | Cảm biến |
|---|---|---|---|---|
| 1 · Xưởng R1 (miễn phí) | `def`, `for`, `if` / `while` | Hai bánh (+ bánh lùi) | Tay kẹp (+ tay xoay) | Khoảng cách (+ cảm biến bên) |
| 2 · Ghi nhớ | **biến**: số, đếm, tham số, chuỗi, so sánh, `and` / `or` | Nhện · Xích | Nam châm · Súng hơi | Màu (kèm camera) · Từ (kèm nam châm) |
| 3 · Bầu trời | **danh sách**: `[ ]`, `for x in a`, `append`, `len`, chỉ số, lưới | Omni · Drone | Máy sơn · Loa (+ Máy ném) | Camera bay · Pin |
| 4 · Kỹ sư | **đọc code người khác, chiến thuật** (có thể thêm `return`) | tự chọn mọi part | | |

Ngoài mùa 1 có **5 tay** (nam châm, súng hơi, máy ném, máy sơn, loa), nên mùa 3 nhận thêm tay thứ ba là Máy ném (ném theo danh sách tầm).

### Vì sao part ấy thuộc mùa ấy
- **Mùa 2 (biến).** `color()` trả chuỗi nên phải `c = color()` rồi so `c == "red"`. Camera và cảm biến màu cùng hàm `color()` nhưng đọc chỗ khác nhau: bài về biến giữ kết quả của phần cứng.
  Nam châm có cực đọc `front_pole()` → `"N"` / `"S"`. **Súng hơi** chọn lực `shoot("fast")` / `shoot("charge")` theo tình huống (mục 10): lý do thật để giữ lực trong biến.
  Nhện dùng chuỗi chỉ đường `go("U")`. Xích ít lý do nhất: quay số nhịp khác hai bánh (tham số phần cứng).
- **Mùa 3 (danh sách).** Máy sơn tô hàng, tô lưới (`stripes(colors)`, for lồng). Loa chơi **bản nhạc là danh sách nốt** (`melody(notes)`, `song(notes, lens)`).
  Sơn và Loa cùng kiểu "làm theo mẫu mờ", và `read_song` của Loa đọc được sàn đã sơn. Flycam phải `seen.append(look())`. Drone bay theo `path`.
  Omni trượt theo danh sách độ lệch (ý B2, Y-TUONG-TIEP-THEO.md). Máy ném ném theo danh sách tầm `for t in [3, 1, 2]: aim(t)`.

## 3. Thứ tự gói trong từng mùa

Gói đội đặt ngay sau part thứ hai nó cần; ngoặc là hai part của gói.

**Mùa 2 · Ghi nhớ** (250 màn)
1. **Biến** *(mới phần lớn)*: chương `bien` (gán, cập nhật, đếm; lấy che-cam-bien.5, .6, .9 + 7 màn mới) · `tham-so` (20)
2. Băng chuyền (10; đứng trước Xích và Súng hơi vì hai gói này dùng băng) · 3. Đội hai robot: làm quen (10; trước gói đội đầu tiên)
4. Bánh xích (20) · 5. Thân nhện (20) → ✦ Đội vượt hố và băng chuyền (20), ✦ Đội xích và nhện (20)
6. Cảm biến màu (20; camera là màn 8 trong chương `mau` và màn 6 trong `che-mau`)
7. Súng hơi (30: `sung-hoi`, `che-sung-hoi`, chương mới `luc-ban`) → ✦ Đội màu và súng hơi (20)
8. Nam châm + cảm biến từ (20; nam-cham.10 cần cảm biến màu) → ✦ Đội nam châm và màu (20), ✦ Đội tay xoay và nam châm (20)

**Mùa 3 · Bầu trời** (250 màn)
1. **Sân cơ khí** (20; cần băng chuyền và tham số của mùa 2, cảm biến bên mùa 1)
2. **Danh sách**: `list` + `che-list` (20; cần `forward(n)` / `right(k)` của tham-so)
3. Bánh omni (20) → ✦ Đội omni và xích (20), ✦ Đội súng hơi và omni (20)
4. Máy sơn (20; cần cảm biến màu) · 5. **Loa** (20; sau Máy sơn vì `read_song` đọc sàn đã sơn) → ✦ **Đội máy sơn và loa** `doi-loa` *(mới, 20; KE-HOACH-LOA.md mục 7)*
6. Máy ném (20; may-nem.7 cần camera, may-nem.9 cần omni) → ✦ Đội tay gắp và máy ném (20)
7. Drone (20; + pin; dùng `go(d)` / `walk(path)` của nhện) · 8. Flycam (10; camera bay) → ✦ Đội drone và máy ném (20)

**Mùa 4 · Kỹ sư**: xem mục 4.

## 4. Mùa 4 · Kỹ sư (ý kiến)

Ba chế độ trong đề xuất nối nhau thành **một bậc thang**. Mỗi bậc dùng lại lõi của bậc trước:

| Bậc | Chế độ | Có sẵn | Phải làm |
|---|---|---|---|
| 1 | **Tự chọn part, một robot**: chọn thân + tay + cảm biến dưới ngân sách xu rồi viết code | `rap-nao`, `rap-tay`, `rap-du` (30 màn) + lõi `lap-rap.js` | Dời 3 gói về mùa 4; thêm Loa vào danh mục tay. Vướng omni ở rap-nao.2, .5, .9 tự hết |
| 2 | **Robot 2 cố định, em lắp và lập trình robot 1 để phối hợp** | Lõi đã có robot khóa chương trình (`doi[i].coDinh`). 89/180 màn gói đội đang là "R2 khóa, sửa R1" | `lap-rap.js` chưa nhận màn hai robot (`m.doi`). Phải thêm: khe part chỉ cho R1; R2 khóa cả part lẫn code |
| 3 | **Đối kháng robot hệ thống** | Robot hệ thống = R2 khóa chương trình nhưng có **mục tiêu ngược** | Luật mới: hai bên tranh vật / ô, tính điểm thay cho thắng thua, đối thủ có nhiều kịch bản chương trình. Làm sau |

Nhận xét:
- **Bậc 2 phải khác gói đội**, vì "R2 khóa, sửa R1" đã chiếm gần nửa số màn gói đội ở mùa 2–3.
  Điểm mới của bậc 2 là **chọn part cho R1**: nhìn R2 đang làm gì (có tay gì, đi đường nào) để chọn part bù vào chỗ R2 thiếu. Đó là bài về thiết kế, không chỉ về code.
- **Bậc 3 nên dựng trên bậc 2.** Robot hệ thống chính là R2 khóa, chỉ đổi mục tiêu.
- **Ý Python của mùa 4.** "Kiến thức mới" là **đọc hiểu code người khác**: R2 / robot hệ thống khóa, em phải đọc chương trình của nó để biết khi nào nó tới đâu.
  Nếu muốn có cú pháp mới thì `return` hợp với đối kháng: hàm chiến thuật trả về nước đi (`def choose(): return "left"`).
- Mùa 2 và 3 không còn lắp ráp cuối mùa. Gói đội cuối mỗi mùa làm trùm cuối mùa.

## 5. So với hiện tại

| Nội dung | Đang ở | Chuyển về |
|---|---|---|
| Tay xoay | mùa 4 | mùa 1 (nâng cấp tay) |
| Biến đếm (che-cam-bien.5, .6, .9) | mùa 1 | mùa 2, chương `bien` |
| `list` + `che-list`, Omni | mùa 2 | mùa 3 |
| Màu, Nam châm, Súng hơi | mùa 3 | mùa 2 |
| Máy sơn, Loa | mùa 3 | giữ mùa 3 |
| Máy ném, Drone, Flycam | mùa 4 | mùa 3 |
| `rap-nao` (mùa 3), `rap-tay`, `rap-du` (mùa 4) | mùa 3–4 | mùa 4 Kỹ sư |
| Gói đội | sau part của chúng | vẫn sau part, theo vị trí mới của part |

Mọi việc chuyển làm ở lớp lộ trình `lo-trinh-hoc.js`, giữ nguyên `ma`, nên sao đã lưu không mất (KE-HOACH-MUA-1.md mục 1).
Gói đội đang neo bằng `sau: '<chương>'` (`ManHoc.chuongThem`). Phải neo lại `doi-tay-xoay` sau `che-doi-nam-cham`, `doi-mau` sau chương cuối gói Súng hơi,
`doi-sung-hoi` sau `che-doi-omni`, `doi-gap-nem` sau `che-may-nem` ở mùa 3.

## 6. Phụ thuộc phải gỡ

| Màn | Vướng | Cách gỡ |
|---|---|---|
| nam-cham.9 | xe omni (omni sang mùa 3) | viết lại trên xe xích hoặc hai bánh |
| robot-hoan-thien.9 | dùng biến đếm (biến sang mùa 2) | viết lại không cần biến |
| `doi-sung-hoi` | cần omni | đặt ở mùa 3 sau Omni (đã tính ở mục 3) |

## 7. Cỡ mùa: 160 · 250 · 250

Trước khi cân: mùa 2 là 260 (thêm 10 vì Súng hơi lên 30 màn), mùa 3 là 230. Cách cân đã chọn, **không phải cắt màn nào có sẵn**:
- **Mùa 2 bớt 10:** bỏ gói Camera riêng (10 màn định viết mới). Camera vẫn có trong chương `mau` (màn 8) và `che-mau` (màn 6), đủ để dạy "cùng `color()`, khác chỗ đọc".
  Đổi lại, mùa 2 chỉ có một gói cảm biến riêng: Màu. Cảm biến từ nằm trong gói Nam châm, camera nằm trong gói Màu.
- **Mùa 3 thêm 20:** làm gói đội **Đội máy sơn và loa** `doi-loa` (robot sơn vẽ bản nhạc lên sàn, robot loa đọc màu và chơi), đứng ngay sau Loa.
  Gói này đã có trong kế hoạch Loa (mục 7, "để đợt sau"), nên chỉ là làm sớm hơn.

Cách khác nếu không muốn làm `doi-loa`: thêm chương chế lệnh `che-flycam` (Flycam 10 → 20) và một chương Pin (10).

Chỗ vướng cần biết:
- **Gói đội chiếm nhiều:** 100/250 màn mùa 2 và 100/250 màn mùa 3 là gói đội. Muốn bớt thì rút gói đội còn 10 màn, nhưng khi đó phải thêm gói part mới cho đủ 250.
- **Súng hơi ở mùa 2 nhưng `doi-sung-hoi` ở mùa 3** (gói đội cần omni). Người chỉ mua mùa 3 vẫn có hàm súng hơi trong kho (hàm cốt truyện mùa trước tự nạp).

## 8. Nội dung mới cần viết

| Mùa | Bắt buộc | Nên có |
|---|---|---|
| 1 | 27 màn để mọi chương đủ 10, viết lại robot-hoan-thien.9 và 2–3 màn có tay xoay (KE-HOACH-MUA-1.md) | |
| 2 | chương `bien` (7 màn) · **chương súng hơi mới `luc-ban`** (10 màn, mục 10) · nam-cham.9 | vài màn dùng biến trong che-xich |
| 3 | commit + merge Sân cơ khí và Loa · gói đội **`doi-loa`** (20 màn) | vài màn dùng danh sách trong che-omni, che-may-nem |
| 4 | bậc 2: `lap-rap.js` nhận màn hai robot + màn mới · bậc 3: luật đối kháng (làm sau) | |

## 9. Cần user chốt
1. Mùa 4 có thêm `return` không, hay chỉ cần đọc code + chiến thuật?
2. Tên mùa: Ghi nhớ / Bầu trời / Kỹ sư?

## 10. Súng hơi: bắn nhanh / bắn tụ (user chốt 26/10)

- `shoot(p)` / `shoot_back(p)` nhận **một đối số chuỗi**: `"fast"` (bắn nhanh) hay `"charge"` (bắn tụ). Không đối số = `"charge"`, đúng luật cũ, nên 20 màn cũ không đổi.
- **Bắn tụ**: bóng bay tới vật cản đầu tiên, xe giật 1 ô (luật cũ).
- **Bắn nhanh**: bóng bay **tối đa 2 ô** rồi rơi; **không giật**. Xe vẫn đứng yên trong nhịp bắn (bánh nghỉ như luật cũ).
- Lý do chọn biến: nút gần mà sau lưng là thứ không được giật vào (thùng mờ, thùng nằm sẵn trên đích) thì phải bắn nhanh;
  nút xa hay cần giật để đẩy thùng / lùi xe thì phải bắn tụ. Chương mới `luc-ban` (10 màn) đứng sau `che-sung-hoi`.
- **Đã làm 26/10** (chưa commit): lõi `san-hoc.js` (màn khai `lucBan: true`; lỗi `luc-ban-sai`, `luc-chua-mo`; thông tin `ban-ngan`), `cham.js`, bộ dò `do-duong-sung-hoi.mjs`,
  khay (ô lực chạm đổi fast / charge, tham số `fire(p)` suy ra kiểu lực), hoạt cảnh bóng rơi, 10 màn `man-luc-ban.js` (hàm cốt truyện `fire(p)`, `fire_back(p)`, `smart_fire()`),
  huy hiệu, Sổ lệnh, máy kiểm `kiem-luc-ban.mjs`. `doi-sung-hoi` neo lại sau `luc-ban`. Chương đang nằm ở gói Súng hơi hiện tại (mùa 3); dời gói về mùa 2 là việc của đợt sắp lại mùa.
