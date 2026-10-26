# Kế hoạch các mùa theo cách B: mỗi mùa 3 part như mùa 1, part nào cũng có nâng cấp (26/10/2026, CHƯA DUYỆT)

> **26/10: đã thay bằng [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md)** (bảng 7 mùa của user). File này giữ để tra số liệu cũ.

User chốt 26/10: **cách B**. Mỗi mùa đúng **1 thân + 1 tay + 1 cảm biến**, mỗi part có gói gốc (20) và gói nâng cấp riêng (20), xen các gói ý Python, như mùa 1 ([KE-HOACH-MUA-1.md](KE-HOACH-MUA-1.md)).
Bốn thân còn lại (Xích, Nhện, Drone, Omni) nên cần **4 mùa part** sau mùa 1. Mùa Kỹ sư thành mùa 6.
File này thay mục 2–3 và 7 của [KE-HOACH-MUA.md](KE-HOACH-MUA.md) nếu được duyệt.

## 1. Khuôn một mùa

```
[ý Python] → Thân gốc → Tay gốc → Cảm biến gốc → Nâng cấp thân → Nâng cấp tay → Nâng cấp cảm biến → COMBO (kết mùa)
                  gói đội của mùa: ngay sau part thứ hai mà nó cần
```
- **Nâng cấp** giữ mọi lệnh của part gốc, mở thêm lệnh hay khả năng; code cũ vẫn chạy (như bánh lùi, tay xoay, cảm biến bên).
- **Gói Combo** (10 màn) thay cho "Robot hoàn thiện" ở các mùa sau: **luật riêng khi hai part của mùa gắn chung** (ý của user: Xích + Súng hơi = không bị giật).
  Combo dạy một điều mà mùa 6 (tự chọn part) cần: **chọn part nào đi với part nào** có lý do.

## 2. Mùa nào part nào

| Mùa | Ý Python | Thân → nâng cấp | Tay → nâng cấp | Cảm biến → nâng cấp | Combo |
|---|---|---|---|---|---|
| 1 · Xưởng R1 | `def`, `for`, `if` / `while` | Hai bánh → Bánh lùi | Tay kẹp → Tay xoay | Khoảng cách → Cảm biến bên | Robot hoàn thiện |
| 2 · Ghi nhớ | **biến**: gán, đếm, tham số | Xích → **Lưỡi ủi** | Súng hơi → **Lực bắn** | Màu → **Camera trước** | **Bệ súng xích** |
| 3 · Tín hiệu | **chuỗi và logic**: `==` chuỗi, `and` / `or` / `not`, `elif` | Nhện → **Chân co** | Nam châm (cực N) → **Hai cực** | Từ → **Đọc cực** | Nhện từ trường |
| 4 · Bầu trời | **danh sách**: `[ ]`, `for x in a`, `append`, `len` | Drone → **Đồng hồ pin** | Máy sơn (chấm) → **Bút liền** | Camera bay → **Quét hàng** | Drone vẽ |
| 5 · Lưới | **danh sách lồng, `return`** | Omni → **Đi chéo** | Máy ném (tầm 1) → **Ngắm tầm** | **(trống, mục 5)** | Omni ném ngang |
| 6 · Kỹ sư | đọc code người khác, chiến thuật | tự chọn mọi part: lắp ráp, đua đối kháng, đọ sức part mạnh, phối hợp | | | |

Vì sao thứ tự này (đã rà hàm mà lời giải từng màn gọi):
- Mùa 2 trước hết vì Xích, Súng hơi, Nam châm, Omni, Máy sơn, Danh sách đều gọi hàm của `tham-so` (mùa 2).
- Nhện (mùa 3) trước Drone (mùa 4): màn drone gọi hàm của nhện (`walk(path)`). Drone có nam châm cực N (mùa 3): không vướng.
- Máy sơn (mùa 4) cần cảm biến màu (mùa 2). Máy ném (mùa 5) cần màu (`may-nem` 7, 10) và omni (`may-nem.9`), cùng mùa 5 nên đặt Omni trước Máy ném.

## 3. Các gói từng mùa

"Có / mới" là ước theo màn hiện có; mỗi gói 20 màn trừ khi ghi khác.

### Mùa 1 · Xưởng R1 (9 gói, 160 màn) — đã có kế hoạch riêng, KE-HOACH-MUA-1.md

### Mùa 2 · Ghi nhớ (11 gói, 200 màn, khoảng 77 mới)
| # | Gói | Loại | Nội dung chính | Có / mới |
|---|---|---|---|---|
| 1 | Biến | ý Python | gán, cập nhật, đếm (`n = n + 1`); robot quen | 3 / 17 |
| 2 | Đường dài | ý Python | băng chuyền + hàm có tham số `forward(n)` | 20 / 0 |
| 3 | Hai robot làm quen (10) | đội | hai chương trình, nhịp chung | 10 / 0 |
| 4 | Bánh xích | thân | leo bậc, băng không đẩy, quay 2 nhịp: đếm nhịp bằng biến | 20 / 0 |
| 5 | Súng hơi | tay | bắn nút, giật lùi đẩy thùng nặng | 20 / 0 |
| 6 | Cảm biến màu | cảm biến | `c = color()`, so `c == "red"` | 18 / 2 |
| 7 | Đội màu và súng hơi | đội | | 20 / 0 |
| 8 | **Lưỡi ủi** | nâng cấp thân | xích tiến vào thùng nặng thì **đẩy** thùng 1 ô (hai bánh: đâm như tường). Lõi mới | 0 / 20 |
| 9 | **Lực bắn** | nâng cấp tay | `shoot("fast")` / `shoot("charge")`: giữ lực trong biến | 10 / 10 |
| 10 | **Camera trước** | nâng cấp cảm biến | cùng `color()`, nhìn ô trước mặt / màu vật | 2 / 18 |
| 11 | **Bệ súng xích** (10) | combo | xích bám chắc: bắn tụ **không giật** (mục 4) | 0 / 10 |

### Mùa 3 · Tín hiệu (13 gói, 250 màn, khoảng 106 mới)
| # | Gói | Loại | Nội dung chính | Có / mới |
|---|---|---|---|---|
| 1 | Chuỗi và logic | ý Python | `and` / `or` / `not`, `elif`, so chuỗi; robot quen + cảm biến màu | 0 / 20 |
| 2 | Sân cơ khí | cơ chế | bàn xoay, nút đè, cổng dịch chuyển | 20 / 0 |
| 3 | Thân nhện | thân | đi 4 hướng không quay, leo bậc, chuỗi chỉ đường `go("U")` | 9 / 11 |
| 4 | Nam châm | tay | chỉ cực N: `magnet_n()`, `magnet_off()` hút sắt từ xa | ~13 / ~7 |
| 5 | Cảm biến từ | cảm biến | `front_metal()`: sắt hay gỗ (chưa màn nào dùng) | 0 / 20 |
| 6 | Đội vượt hố và băng chuyền | đội | | 20 / 0 |
| 7 | Đội xích và nhện | đội | | 20 / 0 |
| 8 | **Chân co** | nâng cấp thân | `crouch()` / `stand()`: chui gầm, nhảy hố | 11 / 9 |
| 9 | **Hai cực** | nâng cấp tay | `magnet_s()`: hút / đẩy vật nam châm | ~7 / ~13 |
| 10 | **Đọc cực** | nâng cấp cảm biến | `front_pole()` → `"N"` / `"S"`, `grip()` chọn cực | 4 / 16 |
| 11 | Đội nam châm và màu | đội | | 20 / 0 |
| 12 | Đội tay xoay và nam châm | đội | | 20 / 0 |
| 13 | **Nhện từ trường** (10) | combo | gợi ý: nhện co chân thì nam châm sát đất, hút được vật dưới gầm thấp. Lõi mới | 0 / 10 |

### Mùa 4 · Bầu trời (8 gói, 150 màn, khoảng 80 mới)
| # | Gói | Loại | Nội dung chính | Có / mới |
|---|---|---|---|---|
| 1 | Danh sách | ý Python | `[ ]`, chỉ số, `for x in a`, `walk(path)` | 20 / 0 |
| 2 | Drone | thân | bay qua rào, hố, băng; tốn pin | 17 / 3 |
| 3 | Máy sơn | tay | chấm từng ô `ink(c)` + `dot()`, tô theo danh sách màu | ~10 / ~10 |
| 4 | Camera bay | cảm biến | `look()`, `seen.append(look())` (chương flycam) | 10 / 10 |
| 5 | **Đồng hồ pin** | nâng cấp thân | `battery()`: đọc pin, tự về ô sạc | 3 / 17 |
| 6 | **Bút liền** | nâng cấp tay | `pen_down()` / `pen_up()`: nét liền qua góc | ~10 / ~10 |
| 7 | **Quét hàng** | nâng cấp cảm biến | gợi ý `scan()` trả danh sách màu cả hàng dưới drone. Lõi mới | 0 / 20 |
| 8 | **Drone vẽ** (10) | combo | drone gắn máy sơn tô sân từ trên cao (lõi đang cấm drone gắn máy sơn) | 0 / 10 |

### Mùa 5 · Lưới (12 gói, 230 màn, khoảng 105 mới)
| # | Gói | Loại | Nội dung chính | Có / mới |
|---|---|---|---|---|
| 1 | Lưới và hàm trả về | ý Python | danh sách lồng `grid[y][x]`, `def f(): return …` | 0 / 20 |
| 2 | Bánh omni | thân | trượt ngang không cần quay | 20 / 0 |
| 3 | Máy ném | tay | `load()` + `throw()` tầm 1 ô (màn cũ đều dùng `aim`) | ~5 / ~15 |
| 4 | (cảm biến, mục 5) | cảm biến | | 0 / 20 |
| 5 | Đội omni và xích | đội | | 20 / 0 |
| 6 | Đội súng hơi và omni | đội | | 20 / 0 |
| 7 | **Đi chéo** | nâng cấp thân | trượt và tiến cùng nhịp (lõi đang cấm: `omni-khong-cheo`) | 0 / 20 |
| 8 | **Ngắm tầm** | nâng cấp tay | `aim(n)`, `for t in [3, 1, 2]` | 20 / 0 |
| 9 | (nâng cấp cảm biến) | nâng cấp cảm biến | | 0 / 20 |
| 10 | Đội tay gắp và máy ném | đội | | 20 / 0 |
| 11 | Đội drone và máy ném | đội | | 20 / 0 |
| 12 | **Omni ném ngang** (10) | combo | gợi ý: omni ném sang bên lúc trượt, không phải quay | 0 / 10 |

### Mùa 6 · Kỹ sư (khoảng 6 gói, 80+ màn)
Lắp ráp: Thân + Não, Thân + Tay, Đủ bộ (30, có) · Đua đối kháng (20, có) · Đọ sức part mạnh (10, có) · bậc "R2 cố định, em lắp R1 để phối hợp" (mới, KE-HOACH-MUA.md mục 4).

**Tổng:** 160 + 200 + 250 + 150 + 230 + 80 ≈ **1.070 màn**, khoảng **370 màn mới** cho mùa 2–5, cộng 27 màn mới của mùa 1.
Mùa 4 ngắn (150) vì ít gói đội; thêm Loa và Đội máy sơn và loa (mục 5) thì lên 190.

## 4. Combo Xích + Súng hơi: "không bị giật" (câu hỏi của user)

**Nên làm.** Lõi hiện cho xích giật như xe hai bánh, và **chưa màn nào gắn súng hơi lên xích** (đã rà mọi màn, kể cả robot trong gói đội), nên thêm luật không làm hỏng màn cũ.

Luật đề xuất: xích bám chắc, **bắn tụ không giật**; bắn nhanh như cũ.

| Robot | Bắn tụ `"charge"` | Bắn nhanh `"fast"` |
|---|---|---|
| Hai bánh + súng hơi | bóng bay xa, **xe giật 1 ô** (đẩy được thùng nặng sau lưng) | bóng bay 2 ô, xe đứng yên |
| **Xích + súng hơi** | bóng bay xa, **xe đứng yên** | bóng bay 2 ô, xe đứng yên |

Vì sao hay: tạo một lựa chọn thứ ba mà Lực bắn chưa có (**xa mà không giật**), nên chọn thân có lý do:
nút xa mà sau lưng là vực / thùng không được đụng thì cần xích; cần giật để đẩy thùng hay để di chuyển thì cần hai bánh.
Đổi lại, xích + súng hơi **mất cách dời thùng nặng bằng cú giật**. Nhưng xích đã có Lưỡi ủi (gói 8) đẩy thùng bằng cách tiến, nên combo vẫn giải được bài thùng nặng, chỉ theo đường khác.
Đây là lý do gói Combo đứng **sau cả ba nâng cấp**.

## 5. Chỗ còn trống
1. **Cảm biến mùa 5** chưa có part: chỉ có 3 cảm biến gốc mới (Màu, Từ, Camera bay); Camera trước đã thành nâng cấp của Màu. Ba cách:
   - (a) part mới **Radar**: `distance()` trả số ô tới vật trước mặt; nâng cấp `scan_all()` trả danh sách 4 hướng (hợp lưới / `return`).
   - (b) part mới **Micro** nghe nốt robot khác phát (đi cùng Loa).
   - (c) bỏ khe cảm biến mùa 5 (mùa 5 chỉ có 2 part).
2. **Loa** (tay thứ 5, chưa vào main) không còn khe tay: đưa vào mùa 4 làm gói thêm ngay sau Máy sơn (`read_song` đọc sàn đã sơn), hoặc sang mùa 6.
3. **Combo mùa 3–5** mới là gợi ý; từng cái cần lõi mới. Chỉ combo mùa 2 đã rà kỹ.

## 6. Cần user chốt
1. Thứ tự mùa và ý Python ở bảng mục 2 (thêm mùa 3 "Tín hiệu" cho chuỗi và logic, mùa 5 "Lưới" cho danh sách lồng và `return`)?
2. Gói Combo kết mỗi mùa, bắt đầu bằng Bệ súng xích (mục 4)?
3. Cảm biến mùa 5: Radar, Micro hay bỏ?
4. Loa: mùa 4 hay mùa 6?

## 7. Đủ 5 thân / 5 tay / 5 cảm biến và 5 vật / 5 sàn / 5 cơ chế chưa (rà 26/10)

**Part:** thân 5 (hai bánh, xích, nhện, drone, omni). Tay 5 (kẹp, súng hơi, nam châm, máy sơn, máy ném) + Loa là tay thứ 6.
Cảm biến mới có **4** (khoảng cách, màu, từ, camera bay); khe thứ 5 là cảm biến mùa 5 còn trống (mục 5). Camera trước, cảm biến bên là nâng cấp, không tính.

**Thứ trên sân** (đếm trên mọi màn của ngân hàng, `lo-trinh-hoc.js`):

| Loại | Có | Số màn dùng |
|---|---|---|
| Vật (5) | hộp gỗ `o` · hộp màu (lớp `vatMau`) · khối sắt (lớp `vatChat` s) · vật nam châm N/S · thùng nặng `H` | 302 · 57 · 54 · 45 · 25 |
| Sàn (5, chưa tính ô đích `D`) | băng chuyền `<>^v` · sàn màu `rgby` · bậc thang `S` · hố `u` · ô sạc `P` | 64 · 31 · 37 · 52 · 19 |
| Cơ chế (5) | cửa `C`/`c` · nút bắn `N` · nút đè `M` · bàn xoay `@`/`%` · cổng dịch chuyển `1`/`2` | 71 · 58 · 16 · 18 · 22 |
| Chướng ngại (thêm) | tường `#` · hàng rào `=` · gầm thấp `n` | mọi màn · 79 · 24 |

Đủ về số. Nhưng nếu muốn **mỗi mùa giới thiệu đúng 1 vật + 1 sàn + 1 cơ chế** thì lệch, vì vật / sàn đi theo part:

| Mùa | Part | Vật mới | Sàn mới | Cơ chế mới |
|---|---|---|---|---|
| 1 | Hai bánh · Kẹp · Khoảng cách | hộp gỗ | (ô đích) | **nút đè** (dời về: kẹp đặt hộp lên `M` giữ cửa) |
| 2 | Xích · Súng hơi · Màu | thùng nặng (+ hộp màu cho Camera trước) | băng chuyền (+ sàn màu cho cảm biến màu) | nút bắn + cửa |
| 3 | Nhện · Nam châm · Từ | khối sắt (+ vật nam châm) | hố (+ bậc thang) | cổng dịch chuyển |
| 4 | Drone · Máy sơn · Camera bay | **thiếu** | ô sạc | (cổng, nếu không để mùa 3) |
| 5 | Omni · Máy ném · ? | **thiếu** | **thiếu** | **bàn xoay** (dời về: bàn xoay đổi hướng, omni trượt ngang không cần quay) |

Mùa 2 và 3 dư (ngoặc), mùa 4–5 thiếu. Hai hướng:
- **Không ép 1–1:** vật / sàn / cơ chế đi theo part cần nó (sàn màu theo cảm biến màu, sắt và nam châm theo nam châm). Chỉ dời **nút đè về mùa 1**, **bàn xoay về mùa 5** để mùa nào cũng có cơ chế riêng.
- **Ép 1–1:** cần thêm 1 vật cho mùa 4–5 (gợi ý: bình dễ vỡ cho máy ném) và 1 sàn cho mùa 5 (gợi ý: sàn trơn, omni trượt dài). Đây là nội dung mới, có lõi mới.
