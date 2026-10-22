# Đội Robot Chấn Hưng — Tài liệu thiết kế (v0.2, 09/10/2026)

> Game học **Python cơ bản** bằng cách lập trình cho robot thi đấu — có **trận đấu, part, hàm thư viện và quản lý đội**, lấy cảm hứng từ luật **Robocon**.
> Là **dòng thứ 3** của **Vũ trụ Chấn Hưng** — nhân vật chung, dòng thời gian, kiến trúc dùng chung xem `vu-tru-chan-hung-tong-quan.md` (§4.3, §8).
>
> **Trạng thái:** **chưa có QĐ nào cho dòng này.** Mọi mục ghi **[đề xuất]** là ý của người soạn, chờ user chốt rồi mới ghi thành QĐ-096 trở đi trong `docs/lich-su-quyet-dinh.md`. §23 là danh sách chờ chốt.
>
> **Thay đổi ở v0.2 (so với `doi-robot-chan-hung-GDD-v0.1.md`):**
> - **Người chơi là đội trưởng kỹ thuật của đội thi trong mùa 1**; chức chủ nhiệm CLB để **mùa 2** (giữ canon — Khánh là trưởng CLB năm 4, tốt nghiệp cuối mùa 1 rồi bàn giao). §2.
> - **Ba lớp game:** mùa giải (mỏng) → chuẩn bị trận (vừa) → thi đấu (dày). §2.
> - **Hai robot mỗi đội** (một tự động, một điều khiển) và **trận đấu có đối thủ, có điểm số**. §4, §6.
> - **Khe lắp part** + ràng buộc khối lượng/kích thước/ngân sách; **part mở API**. §4.
> - **Ba loại tiền tệ trong trận:** ô nhớ chương trình, pin, tick — đây là chỗ đánh đổi "ít lệnh ↔ tốc độ" của user thành luật chơi. §6.2.
> - **Thư viện hàm của đội** (hàm dựng sẵn, đọc được mã nguồn, có hàm lỗi). §5.
> - **Quản lý đội:** đàn em có chỉ số tay nghề, ngân sách part, đội hình. §11.
> - **Đánh giá thắng ba tầng** tách bạch: trận đấu / hạng code / mùa giải. §14.
> - Thêm **§19 thứ tự ra từng đợt** (vì phạm vi đầy đủ thì phải chia đợt), cập nhật §21 ngoài phạm vi (gỡ hai dòng "nhiều robot" và "thư viện" — nay đã vào phạm vi).
>
> **Phạm vi tài liệu:** **cơ chế**. Kịch bản lời thoại, danh sách ảnh, phong cách hội họa để bản sau.
>
> **Nguồn gốc:** 09/10/2026. User cân nhắc hai hướng (đấu robot theo vũ trụ Chấn Hưng / game thẻ bài kiểu *Slay the Spire* mà mỗi thẻ là một khối lệnh), chọn **hướng đấu robot**; sau đó yêu cầu mở rộng thành **giả lập đội thi robot** theo luật Robocon (thử thách, số lượng robot, giới hạn, đánh đổi part, hàm dựng sẵn). Ý tưởng thẻ bài **không bị bỏ**: nó thành **Bàn lệnh** (§7) và **bộ part + hàm mang ra sân** (§5).

---

## 1. Các quyết định đã có từ canon (không bàn lại ở đây)

| Hạng mục | Đã chốt ở | Nội dung |
|---|---|---|
| Vị trí trong chuỗi | vũ trụ §3, §9 | Dòng 3; ra mắt **sau** khi HTML/CSS có người chơi ổn định |
| Thời gian trong truyện | vũ trụ §6 | Học kỳ 2 năm học 2026–2027, **ngay sau mùa 1 SQL** |
| Nhân vật chính | vũ trụ §4.3 | Sinh viên năm nhất (người chơi tạo), mới vào CLB Robotics |
| Mục tiêu lớn | vũ trụ §4.3 | Đưa đội vào **chung kết giải robot quốc gia (tháng 4)** |
| Nhân vật | vũ trụ §4.3, §5 | **Vương Khánh** (trưởng CLB, năm 4, tuyến chuộc lỗi); cameo thầy Khải, Hà Vy, Quân (trọng tài) |
| Rival | vũ trụ §4.3 | Đội **ĐH Kỹ thuật Hải Đăng**; đội trưởng giỏi nhưng coi thường dân không chuyên |
| Câu hô | vũ trụ §3 | **"Chạy thử là biết!"** |
| Hai chế độ | vũ trụ §4.3, §8.2 | Cơ bản: sắp xếp dòng code (hợp người mới **và điện thoại**); Hardcore: gõ Python thuần |
| Lộ trình kiến thức | vũ trụ §4.3 | Lệnh tuần tự → biến → điều kiện → vòng lặp → hàm → danh sách → tình huống bất ngờ |
| Tên biến/hàm | QĐ-008 | Giao diện tiếng Việt; **tên biến/hàm tiếng Anh** |
| Nền tảng | QĐ-085, QĐ-093 | Laptop là nền chính; **điện thoại cầm dọc phải chơi được** |

**Chốt 09/10/2026 (phiên này):** phạm vi mùa 1 là **đầy đủ** (2 robot, part, hàm thư viện, quản lý đội); **giữ canon** về vai nhân vật chính.

**Nguồn chuẩn về nhân vật:** `nhan-vat.yaml` (đặc tả nội dung §4); hiện còn ở dạng `.md` trong `prototype/noi-dung-mvp/`, gói 12b mới chuyển sang YAML.

---

## 2. Vai người chơi và ba lớp game

### 2.1. Bạn là ai

| Mùa | Vai | Quản lý cái gì |
|---|---|---|
| **Mùa 1** | **Đội trưởng kỹ thuật** của đội thi — Khánh là trưởng CLB, giao đội cho bạn | Đội hình, part, ngân sách được cấp, lịch thi đấu |
| **Mùa 2** (để dành) | **Chủ nhiệm CLB** sau khi Khánh tốt nghiệp | Cả CLB: tuyển người, xin kinh phí, chọn giải, đào tạo khoá sau |

Cách chia này giữ đúng canon (nhân vật chính là năm nhất mới vào CLB) mà vẫn cho người chơi cảm giác "dẫn đội đi thi" ngay từ mùa 1. Cuối mùa 1, Khánh bàn giao — đó là cái kết tự nhiên và là cửa mở cho mùa 2.

### 2.2. Ba lớp

| Lớp | Trải nghiệm | Độ dày |
|---|---|---|
| **1. Mùa giải** | Nhận lịch, gặp đối thủ, đọc tin đồn về lối chơi của họ, chọn đội hình ra sân | **Mỏng** — chủ yếu truyện + vài lựa chọn |
| **2. Chuẩn bị trận** | Lắp part cho 2 robot trong ngân sách, chọn hàm thư viện mang theo, chọn ai lái robot tay | **Vừa** — đây là chỗ ý tưởng deckbuilding sống |
| **3. Thi đấu** | Viết code cho robot, chạy sân, đọc chẩn đoán, sửa, thi đấu tính điểm | **Dày nhất** — đây là game |

**Tỉ lệ thời gian chơi nhắm tới:** ~**50% lập trình & chạy thử, 20% chuẩn bị trận, 20% truyện & quản lý đội, 10% review chiến thuật.**

Cảnh báo (ngược với dòng SQL): ở đây rủi ro không phải "trôi thành truyện" mà là **"trôi thành bảng tính quản lý"** hoặc **"trôi thành chuỗi bài tập"**. Nên: lớp 1 và 2 **không bao giờ chiếm quá một phần ba thời gian**, và mỗi bài luyện phải có **hậu quả trong truyện** (thắng/thua trận đấu thử, đội bạn chế giễu, mất suất dự giải).

### 2.3. Đường đi của một trận

```
Mùa giải: gặp đối thủ  →  Chuẩn bị: lắp part + chọn hàm + chọn người lái
        →  Luyện: 3–5 bài trên sân tập (viết code, chạy, sửa)
        →  Thi đấu: vào sân, chạy code thật, tính điểm, thắng/thua
        →  Review chiến thuật: đọc code đối thủ, dựng sân phản ví dụ
        →  Mùa giải: bàn giao, mở trận sau
```

---

## 3. Mô hình thế giới: sân lưới, tick, hai đội

### 3.1. Sân — **[đề xuất]**

Sân là **lưới ô vuông** `W × H` (8×8 chặng đầu → 14×14 chặng cuối).

| Ký hiệu | Loại ô | Ý nghĩa |
|---|---|---|
| `.` | `trong` | Trống, đi qua được |
| `#` | `tuong` | Vật cản cố định |
| `o` | `vat` | Vật cần nhặt/di chuyển; có mã và **khối lượng** |
| `D` | `dich` | Ô đích (nơi phải đưa vật về) |
| `S` | `tram` | Trạm sạc pin |
| `~` | `tron` | Ô trơn: bước vào thì trượt thêm 1 ô cùng hướng |
| `B` | `nut` | Nút/công tắc, phải có robot đè lên mới mở cổng |
| `=` | `cong` | Cổng, chỉ mở khi nút được đè |

**Vì sao lưới chứ không phải vật lý thật:** mọi thứ **đếm được** (bước, tick, pin, ô nhớ) nên chấm bài là so hai con số; người mới nhìn ra ngay nhân quả giữa một dòng lệnh và một bước đi. Vật lý thật để dành cho bản nâng cao.

### 3.2. Trạng thái robot

| Trạng thái | Kiểu | Ghi chú |
|---|---|---|
| `x`, `y` | số | Toạ độ ô |
| `huong` | `B`/`D`/`N`/`T` | Bắc / Đông / Nam / Tây |
| `pin` | số | Năng lượng còn lại |
| `tui` | danh sách | Vật đang mang |
| `tick` | số | Thời gian đã trôi |

Đây **chính là các biến** người chơi sẽ học, và chúng hiện trên **bảng trạng thái** cạnh sân.

### 3.3. Luật chạy

1. **Theo tick.** Mỗi hành động tốn tick; sim chạy từng tick và **phát lại được** (§12).
2. **Va tường không làm hỏng bài.** Robot đứng yên, vẫn tốn tick + pin, bị ghi nhận nhưng **không trừ điểm**; chỉ mất hạng A. Lý do: "sai là để học" (nguyên tắc 5).
3. **Hết pin → robot dừng** (trừ khi đứng ở trạm sạc).
4. **Ngân sách:** mỗi bài có `tick_toi_da`; mỗi chương trình có **hạn ô nhớ** và **hạn pin** (§6.2). Vượt ngân sách lệnh → `infinite-loop`.
5. **Chương trình kết thúc mà chưa xong** → vẫn chấm, ra chẩn đoán `unfinished` chỉ đúng chỗ còn thiếu.
6. **Không dùng lệnh chưa mở** (do chưa lắp part đó, hoặc chưa tới chặng) → `locked-command`, kèm lời thoại của Khánh chứ không phải thông báo lỗi kỹ thuật.

---

## 4. Hai robot, part và API — **[đề xuất]**

### 4.1. Hai robot mỗi đội

| | `R1` — robot tự động | `R2` — robot điều khiển |
|---|---|---|
| Code | Chạy từ đầu trận đến hết, **không can thiệp** | Cũng là code bạn viết, **nhưng có độ trễ và sai số tay nghề** |
| Ai "lái" | Không ai | **Đàn em trong đội** (NPC) — trình độ là một chỉ số (§11.1) |
| Vì sao có trễ/sai số | Máy thì chính xác | Dạy một điều thật: *cùng một đoạn code, chạy trên cơ chế khác nhau, cho kết quả khác nhau* |
| Tất định | Có | **Có** — sai số sinh từ `seed` của trận, không phải ngẫu nhiên thật |

**Đề xuất thay thế (để dành):** cho `R2` chạy theo "phiếu điều khiển" (chọn ưu tiên, không viết code). Không chọn ở mùa 1 vì nó tạo ra **hai ngôn ngữ** phải học.

**Không chọn:** cho người chơi **tự lái bằng phím** trong lúc `R1` chạy code. Nó biến game thành real-time, phá mô hình theo tick, và làm việc chấm bài khó hơn nhiều. Để dành cho một chế độ phụ ở mùa sau.

### 4.2. Khe lắp part

Mỗi robot có **6 khe**, mỗi khe chọn 1 part. Cả hai robot dùng **chung một ngân sách part**, nên đây là quyết định lớn: đầu tư cho robot tự động hay robot tay.

| Khe | Part ví dụ | Đổi bằng cách nào |
|---|---|---|
| **Động cơ** | `motor-A` nhanh / `motor-B` tiết kiệm | tick mỗi bước ↔ pin mỗi bước |
| **Bánh** | bánh omni / bánh xích | quay tại chỗ nhanh ↔ đi thẳng nhanh |
| **Tay gắp** | 1 ngón / 2 ngón / tay xoay | sức chứa, khối lượng, hành động mới |
| **Cảm biến** | chạm / khoảng cách / la bàn | **mở hàm mới** cho chương trình |
| **Pin** | pin nhỏ (300) / pin lớn (600) | ngân sách pin ↔ khối lượng |
| **Khung** | khung nhỏ / khung lớn | kích thước, tải trọng, khối lượng |

### 4.3. Ràng buộc (vì sao không lắp hết mọi thứ)

| Ràng buộc | Ví dụ | Lý do sư phạm |
|---|---|---|
| Tổng khối lượng | ≤ 40 đơn vị | Nặng hơn → tốn pin hơn mỗi bước |
| Kích thước lúc xuất phát | phải nằm trong 2×2×2 ô | Buộc chọn khung, không nhồi |
| Ngân sách part | 10 "suất" chia cho 2 robot | Buộc chọn, buộc biết ưu tiên |
| Khe | 6 khe, 1 part mỗi khe | Buộc bỏ thứ không cần |
| Tải trọng | mang 3 vật thì chậm hơn mang 1 | **Đánh đổi động**, thay đổi giữa trận |

### 4.4. Part mở API — chỗ nối giữa lắp ráp và lập trình

Đây là điều làm part không phải một hệ thống song song vô nghĩa:

| Lắp part | Mở ra |
|---|---|
| cảm biến chạm | `front_is_wall()` |
| cảm biến khoảng cách | `distance()` — đo được bao xa mới tới vật cản |
| la bàn | `direction()` |
| tay gắp 2 ngón | `pick()` nhặt được 2 vật cùng lúc |
| tay xoay | `rotate_item()` |
| không lắp cảm biến | **không có hàm đó** → chương trình phải mò bằng `move()` rồi kiểm tra |

Nghĩa là: **lắp part nào thì viết code kiểu đó**. Bỏ cảm biến để lấy tốc độ → code phải "mù", phải dùng cách khác. Đó là một bài học thiết kế rất thật.

### 4.5. Luật công bằng: không part nào trội toàn diện

Mỗi part phải là **đáp án tốt nhất trên một dạng sân nào đó**. Nếu có part thắng ở mọi sân thì part đó phá game (đúng như "không có lá bài nào tốt nhất" trong deckbuilding). Đây là **bất biến kiểm thử** (§17).

---

## 5. Thư viện hàm của đội — **[đề xuất]**

Đây là ý user đề xuất và tôi cho là mạnh nhất trong cả bản thiết kế: **"tạo sẵn hàm để đưa vào robot rồi chạy thử"**.

### 5.1. Cơ chế

- **Thư viện hàm** gồm các hàm do **Khánh và thầy Khải** viết (đàn anh, thầy hướng dẫn), mở dần theo chặng.
- Trước mỗi trận, bạn chọn **3–5 hàm mang theo** (giống chọn part).
- Mỗi hàm chiếm **ô nhớ chương trình** (§6.2) — nên mang nhiều hàm là mất chỗ viết code. Chọn lọc là bắt buộc.
- Hàm thư viện **luôn đọc được mã nguồn**: bấm vào là thấy code của nó. Học cách đọc code người khác là mục tiêu, không phải tính năng phụ.

### 5.2. Ba loại hàm

| Loại | Ví dụ | Dạy gì |
|---|---|---|
| Tiện ích, tin được | `go_to(x, y)` — đi thẳng tới ô, tốn 2 ô nhớ | Gọi hàm, truyền tham số |
| Có điều kiện phức tạp | `avoid_obstacle()` — tự vòng qua vật cản, 2 ô nhớ | Tin vào hành vi, nhưng phải hiểu giới hạn |
| **Có lỗi ở trường hợp biên** | `go_to()` bản rẻ (1 ô nhớ) **không kiểm tra đích ngoài sân** | **Đọc code để tìm lỗi** — đỉnh cao của mùa 1 |

Chi tiết cố ý: **bản `go_to` rẻ (1 ô) là bản lỗi, bản đúng (2 ô) đắt hơn.** Người chơi phải trả giá để hiểu rằng "rẻ" và "đúng" không phải một.

### 5.3. Luật bắt buộc

**Mỗi bài phải có ít nhất một phần mà hàm thư viện không làm được** — nếu không, bài đó vô nghĩa vì hàm đã giải hết. Đây là bất biến kiểm thử (§17).

---

## 6. Luật một trận đấu — **[đề xuất]**

### 6.1. Bảng luật

| Hạng mục | Luật đề xuất |
|---|---|
| Số robot | 2 mỗi đội: `R1` tự động + `R2` điều khiển |
| Thời gian | **1.800 tick** (≈ 3 phút khi xem hoạt cảnh) |
| Xuất phát | Hai robot trong ô xuất phát, đúng chuẩn khối lượng/kích thước |
| Nhiệm vụ | 3–5 nhiệm vụ theo "đề" của chặng: nhặt vật đưa về ô đích, đẩy vật nặng (**cần cả 2 robot**), đè nút để mở cổng, nâng rổ, leo dốc |
| Điểm | Nhiệm vụ (chính) + **về sớm (ECP)** + không va chạm (thưởng) − va chạm/chắn đường đồng đội (trừ) |
| Thắng | Nhiều điểm hơn; bằng điểm thì **về sớm hơn thắng** |
| Sân | Đối xứng hai nửa, có vùng chung ở giữa |
| Đối thủ | Code + part của đội bạn, do game viết, **tất định** |

### 6.2. Ba loại tiền tệ — chỗ đánh đổi của user thành luật chơi

Đây là trái tim của hệ thống, và là lý do sư phạm mạnh nhất của cả game:

| Loại | Là gì | Ai làm nó cạn | Cách tiết kiệm |
|---|---|---|---|
| **Ô nhớ chương trình** | Số dòng lệnh tối đa của chương trình (ví dụ 40 ô) | Viết dài dòng | **Vòng lặp và hàm** (`for i in range(4): move()` = 2 ô thay vì 4 ô) |
| **Pin** | Năng lượng trong trận | Đi nhiều, mang nặng, part động cơ mạnh | Đường đi ngắn hơn, part tiết kiệm, bỏ tải |
| **Tick** | Đồng hồ trận (1.800) | Đi chậm, chờ, lặp vô ích | Part nhanh hơn, đường ngắn hơn |

**Vì sao hay:** "muốn nhanh thì phải viết **ít lệnh hơn**" — mà ít lệnh hơn thì buộc phải dùng **vòng lặp** và **hàm**. Ràng buộc tài nguyên trở thành **lý do để học hàm**, mạnh hơn hẳn một bài giảng "hàm là gì". Và đúng như user nói: *ít lệnh, hoặc part khác* — hai cách trả giá cho cùng một mục tiêu, người chơi tự chọn.

Hệ quả kèm theo (đều tốt): mang nhiều hàm thư viện thì mất ô nhớ để viết code → **chọn lọc**; pin lớn thì nặng → **chậm**; khung lớn chở được nhiều nhưng cồng kềnh → **dễ va chạm**.

### 6.3. Nhịp leo thang của luật trận

| Chặng | Hình thức | Vì sao |
|---|---|---|
| 1–4 | **Chạy sân riêng, so điểm** với đội bạn | Dễ chấm, dễ học, không có nhiễu; vẫn có cảm giác thi đấu |
| 5 | Chạy sân riêng, **thêm nhiệm vụ cần cả 2 robot** | Dạy phối hợp |
| 6 | **Đối kháng cùng sân** (4 robot, tranh vật, va chạm) | Cao trào; chỉ đưa vào khi mọi thứ khác đã vững |

Đối kháng cùng sân đắt hơn hẳn (4 robot, tranh chấp, luật va chạm) nên **không** đưa vào sớm — nhưng phải để dành cho chặng cuối, vì đó là khoảnh khắc "chung kết".

---

## 7. Hai chế độ chơi — **[đề xuất]**

### 7.1. Chế độ cơ bản — "Bàn lệnh"

- **Khay lệnh** bên trái, **khung chương trình** bên phải. Thẻ lệnh = một dòng lệnh, có ô tham số.
- **Thẻ lồng được**: `if` / `while` / `for` / `def` có khe thân; thả vào khe thì **thụt lề tự động**. Đây là "sắp xếp dòng code, đúng thụt lề" của vũ trụ §4.3, làm ở mức thẻ.
- **Tham số là chip** (dùng lại "dữ kiện thành chip" của dòng SQL §10.2): chip số, chip cảm biến, chip biến. Chip chỉ thả được vào ô đúng kiểu → dạy kiểu dữ liệu mà không giảng lý thuyết.
- **Thẻ nhiễu** nằm chung khay (lệnh không cần cho bài, lệnh sai ngữ cảnh).
- Khay chỉ hiện lệnh **đã mở** (theo chặng, theo part đã lắp).

### 7.2. Quyết định quan trọng: thẻ in **chính chữ Python**

> Trên mỗi thẻ in thẳng dòng Python (`move(3)`, `turn_left()`, `for i in range(4):`) bằng phông mono. Chú thích tiếng Việt là **dòng phụ nhỏ**, không phải nội dung chính của thẻ.

Lý do: nghiên cứu về chuyển từ lập trình khối sang lập trình chữ cho thấy người học **không tự động** chuyển được và hay mang theo hiểu lầm khái niệm ([Mediated transfer & misconceptions](https://rd.springer.com/article/10.1007/s40692-022-00225-z), [block-based → text-based](https://dl.acm.org/doi/abs/10.1007/s10209-025-01271-x)). Nếu thẻ ghi "ĐI 3 BƯỚC" thì người chơi học *ngôn ngữ của game*, không học Python.

### 7.3. Cầu nối sang gõ tay, và Hardcore

| Bước | Việc | Mở khi |
|---|---|---|
| 1 | Bàn lệnh (kéo thả thẻ là chữ Python) | Chặng 1 |
| 2 | **Nút "Chép sang bản gõ tay"** — đổi chương trình đang có thành văn bản sửa được | Chặng 1 (tuỳ chọn) |
| 3 | **Hardcore** — gõ Python thuần, khay thẻ ẩn đi | Sau chặng 1, đổi qua lại tự do |
| 4 | Huy hiệu/điểm thưởng thêm khi làm bài ở Hardcore | Sau chặng 1 |

### 7.4. Bảng trạng thái và thanh ô nhớ

Cạnh sân luôn có: `x`, `y`, `huong`, `pin`, `tui`, `tick`, các biến người chơi tự tạo — **đổi số theo từng tick**. Và một **thanh ô nhớ** hiện `đã dùng 12/40 ô`.

Thanh ô nhớ là công cụ dạy quan trọng: khi người chơi thấy chương trình tràn ô nhớ rồi thay 4 dòng `move()` bằng một vòng lặp và thanh tụt xuống — đó là lúc "vòng lặp" trở thành thứ có ích, chứ không phải bài học phải nhớ.

### 7.5. Khi nào mở một thứ mới — luật khay theo bài

> **Sinh ra từ một lỗi thật** (09/10/2026): bài 6 "phòng thí nghiệm" bắt người chơi dùng `while`, `not`, `at_goal()` trong khi chưa dạy cái nào. User chỉ ra: *"các hàm như not, at_goal chưa được dạy thì sao user chơi được? game cho người tiếp cận Python hay cho người biết Python rồi?"* — câu hỏi đúng, và đây là luật để không tái diễn.

**Đối tượng của dòng này là người CHƯA biết lập trình** (vũ trụ §4.3: học sinh cuối cấp và SV năm 1; nguyên tắc 6: "không học IT vẫn làm được"). Bản Hardcore và bản gõ tay dành cho người đã biết hoặc muốn đi trước. Nên mặc định phải là **chưa biết gì**.

**Luật (bắt buộc, có test canh):** mỗi bài khai báo **khay lệnh** của nó (`bai.khay`); nhân mô phỏng **chỉ đưa ra bấy nhiêu hàm**. Gọi hàm chưa mở → chẩn đoán `locked-command` kèm lời nhắn liệt kê khay đang có. **Không bài học nào được phép cần thứ chưa dạy.**

**Cú pháp thì không khoá, hàm thì khoá.** `while` / `for` / `if` / `def` luôn gõ được ở bản gõ tay — ai đã biết Python thì không bị chặn, người mới tò mò thử sớm cũng không sao. Cái bị khoá là **đồ của đội** (`at_goal()`, `front_is_wall()`, hàm thư viện) — đúng như thật: muốn có cảm biến thì phải lắp.

**Ba trường phái game dạy lập trình đang làm:**

| Trường phái | Ví dụ | Cách dạy | Hợp với ai |
|---|---|---|---|
| **Thiết kế màn ép ra khái niệm** | Blockly Games (Maze), Human Resource Machine, 7 Billion Humans, Lightbot, RoboZZle | Không giảng. Mỗi màn thêm **đúng một** khối vào khay, và màn được thiết kế sao cho khối đó là **cần** | Người mới — **miễn là khối đã có sẵn trên khay** |
| **Có tài liệu trong game** | Zachtronics (TIS-100, EXAPUNKS, Shenzhen I/O), [The Farmer Was Replaced](https://thefarmerwasreplaced.com/tutorial/) | Đưa sách hướng dẫn / danh sách hàm, người chơi tự tra như lập trình viên thật | Người đã có động lực, thích tự mò |
| **Dạy tường minh rồi cho làm** | CodeCombat, CodinGame, CheckiO | Nói trước, làm sau, có gợi ý | Lớp học, có giáo viên |

**Điểm chung bắt buộc của cả ba:** không bao giờ đặt người chơi trước một màn **không giải được bằng thứ họ đang có**. Blockly Games dạy `while` bằng cách **đưa khối `while` vào khay** ở đúng màn mà đường đi dài ngắn khác nhau — người chơi bị *ép dùng*, chứ không bị bắt *tự nghĩ ra cú pháp*. Human Resource Machine cũng vậy: mỗi màn thêm đúng một lệnh, và màn đó không giải được nếu thiếu lệnh ấy.

Điều này khớp với nghiên cứu sư phạm: với người mới, để họ tự "khám phá" mà không có hướng dẫn thường thất bại, vì họ không đủ kiến thức nền để tự tìm ra ([Kirschner, Sweller & Clark 2006](https://www.tandfonline.com/doi/pdf/10.1207/s15326985ep4102_1)).

**Vậy dòng này chọn: lai trường phái 1 + 2**

1. **Khay theo bài**, mỗi chặng mở thêm một ít.
2. Khái niệm mới đến **cùng lúc với màn cần nó** — thẻ `while` xuất hiện ở chính màn có độ dài thay đổi, không sớm hơn, không muộn hơn.
3. Nhân vật nói **một câu bằng lời** khi thẻ mới xuất hiện (không giảng lý thuyết).
4. **Sổ tay** ghi lại khái niệm **sau khi** người chơi đã dùng nó — không đọc trước.
5. Bản gõ tay và Hardcore **luôn mở** cho ai muốn đi trước.

**Đối chiếu đáng chú ý:** Human Resource Machine chấm thêm hai điểm **kích thước chương trình** và **số bước chạy** ([lời giải size/speed](https://github.com/mrflip/hrm-solutions)) — đúng bằng **ô nhớ chương trình** và **tick** của dòng này (§6.2). Cách đó đã được chứng minh là làm người chơi tự đi tìm vòng lặp và hàm, nên §6.2 có cơ sở.

---

## 8. Một bài luyện sân — **[đề xuất]**

| Trường | Nội dung |
|---|---|
| `muc_tieu` | Việc phải xong, viết bằng lời người |
| `san_chinh` | Sân hiện, có hoạt cảnh |
| `san_an` | 2–4 sân cùng luật, **khác bố cục** — dùng để chấm hạng A |
| `doi_thu_an` | (từ chặng 3) 1–2 đối thủ khác lối chơi |
| `rang_buoc` | Hạn ô nhớ, hạn pin, hạn tick, cấm part |
| `goi_y` | 2–3 câu nhắc **theo ý nghĩa**, giọng nhân vật |
| `loi_giai_mau` | 1–2 chương trình mẫu, cho test bất biến (§17) |

**Núm chỉnh độ khó:** kích thước sân · số vật cản · số vật và khối lượng · hạn ô nhớ · hạn pin · số sân ẩn · số đối thủ ẩn · bất ngờ trong bố cục.

**Chấm — ba hạng, không phạt** (mỗi lần Chạy đều phát lại kèm nhận xét, theo tinh thần QĐ-018):

| Hạng | Điều kiện | Ý nghĩa |
|---|---|---|
| **C** | Qua sân chính nhưng va chạm hoặc hết pin | "Chạy được rồi, còn lộn xộn" |
| **B** | Qua sân chính, không va chạm, không hết pin | "Sạch" |
| **A** | Thắng **toàn bộ sân ẩn × đối thủ ẩn** | Đây là học thật: **code đúng ở chỗ mình chưa thấy** |

Qua sân chính là **đủ để đi tiếp**; hạng A để phấn đấu và mở bài thử thách. Hạng **không bao giờ khoá cốt truyện**.

**Sân ẩn ở chặng 1 khác sân ẩn từ chặng 3** (chốt khi làm mockup đợt 1):

| Giai đoạn | Sân ẩn là gì | Vì sao |
|---|---|---|
| **Chặng 1** (chỉ có lệnh tuần tự) | **Dịch cả sân đi chỗ khác**, giữ nguyên hình dạng tương đối | Chưa có `if`/`while` thì không có cách viết nào qua được sân đổi hẳn bố cục — mà hạng A phải *làm được* mới công bằng. Code viết theo **đường đi tương đối** qua được mọi sân; code ẩu (đi thừa bước) đâm tường |
| **Từ chặng 3** (đã có `if`/`while`) | **Đổi hẳn bố cục**, và từ chặng 3 thêm **đối thủ ẩn** | Lúc này mới thật sự đo được "code đúng ở chỗ chưa thấy" |
| **Phòng thí nghiệm (bài 6, cuối chặng 1)** | Sân ẩn **đổi hẳn độ dài** (7 / 3 / 10 bước), cố tình **không giải được bằng khay thẻ** | Đây là bài **đo**, không phải bài **dạy**: xem người chơi có tự đòi vòng lặp không (§20, thí nghiệm 4) |

---

## 9. Mã chẩn đoán — **[đề xuất]**

Dùng lại đúng cơ chế **mã chẩn đoán** của dòng SQL (QĐ-040), khác bộ mã:

| Mã | Nghĩa | Ai nói |
|---|---|---|
| `hit-wall` | Va vật cản ở `(x,y)` tick `t` | Khánh |
| `robot-collision` | Hai robot đâm nhau | Quân (trọng tài) |
| `blocked-teammate` | `R1` chắn đường `R2` (hoặc ngược lại) | Khánh: "Cậu chắn đường thằng em rồi." |
| `battery-empty` | Hết pin giữa sân | Hà Vy: "Khoan, tính lại đã." |
| `memory-full` | Vượt **ô nhớ chương trình** | thầy Khải: "Bộ nhớ con chip có hạn. Gộp lại đi." |
| `infinite-loop` | Vượt ngân sách lệnh | thầy Khải: "Vòng lặp này không có đường ra." |
| `timeout` | Hết 1.800 tick | Quân |
| `unfinished` | Chương trình kết thúc mà chưa xong | Hà Vy: "Còn một vật ở góc dưới kìa." |
| `missed-item` | Về đích khi còn vật | Khánh: "Về đích mà tay không thì không tính điểm." |
| `syntax-error` | Sai cú pháp (chỉ đúng dòng/cột, không đọc traceback tiếng Anh) | thầy Khải |
| `indent-error` | Sai thụt lề | thầy Khải |
| `runtime-error` | Lỗi khi đang chạy: chia cho 0, gọi hàm không có, sai số đối số… | thầy Khải |
| `pick-miss` | `pick()` ở ô không có vật (nhặt hụt) | Khánh: "Ô đó không có vật nào để nhặt." |
| `locked-command` | Gọi hàm **bài này chưa mở** (chưa lắp part, hoặc chặng chưa dạy); lời nhắn liệt kê khay đang có | Khánh: "Bài này chưa mở cái đó. Khay mình đang có: move(), turn_left()…" |
| `wrong-result` | Chạy xong, kết quả khác yêu cầu — nêu **khác ở đâu**, không nêu đáp án | Khánh |

Sân ẩn và đối thủ ẩn **không** được nêu bố cục (theo QĐ-053 của dòng SQL: không nêu tên manh mối còn thiếu).

---

## 10. Lộ trình chặng — **[đề xuất]**

**Chữ dùng:** trong tài liệu này **"chặng"** là **đơn vị lớn nhất của mùa** (tương ứng "vụ" của dòng SQL). Chữ "chặng" trong lời Vụ 1 bản 7 của dòng SQL (`docs/mua-1/v7-thoai/01-chang-1.md`) nghĩa là nhịp bên trong một vụ — khác nghĩa, nhớ phân biệt.

Mùa 1: **6 chặng**, mỗi chặng = 1 buổi họp chiến thuật + **3–5 bài luyện** + 1 buổi chuẩn bị + **1 trận đấu** + 1 **review chiến thuật** (§12). Mùa 1 có **6–8 trận** (đấu vòng bảng trong trường, rồi giải quốc gia).

**Chặng 1 có thêm 1 "phòng thí nghiệm"** (bài 6): hành lang dài 7 / 3 / 10 bước, **cố tình không giải được bằng khay thẻ**. Không bắt buộc, không tính vào 5 bài. Đây là bài **đo nhu cầu vòng lặp** — nếu người chơi tự tìm ra `while not at_goal(): move()` thì chặng 3 là sự giải thoát; nếu bí và bực thì phải thiết kế lại chặng 1–3 (§20, thí nghiệm 4).

| Chặng | Đề/nhiệm vụ | Kiến thức Python | Part mở | Hàm thư viện mở | Luật trận |
|---|---|---|---|---|---|
| 1. Vào đội | Nhặt 1–2 vật đưa về đích | Lệnh tuần tự, thứ tự | motor-A, bánh omni, tay 1 ngón, cảm biến chạm | — | Sân riêng, chưa có đồng hồ |
| 2. Đo sân | Đếm bước, kiểm tra pin | **Biến**, gán, đếm | pin nhỏ, la bàn | — | Có đồng hồ 1.800 tick |
| 3. Vật cản | Vòng qua vật cản, đè nút mở cổng | `if/else`, `while` | bánh xích, cảm biến khoảng cách | `avoid_obstacle()` | Có **đối thủ đầu tiên** (so điểm) |
| 4. Đường vòng | Dọn 4 góc giống nhau, **hạn 40 ô nhớ** | `for range`, `def` | tay 2 ngón | `clear_corner()`, `go_to(x,y)` bản đúng (2 ô) **và bản rẻ bị lỗi** (1 ô) | Thêm hạn pin |
| 5. Túi đồ | Nhiều vật, có vật nặng **cần cả 2 robot** | **Danh sách**, `for x in`, `append` | motor-B tiết kiệm | `count_items()`, `push_together()` | Phối hợp 2 robot; phạt `blocked-teammate` |
| 6. Sân lạ | Chung kết | Tổng hợp, **tình huống bất ngờ** | khung lớn | hàm có lỗi ở biên (phải tự sửa hoặc tự viết lại) | **Đối kháng cùng sân**, 4 robot |

**Tỉ lệ:** ~50% lập trình & chạy thử, 20% chuẩn bị, 20% truyện & quản lý, 10% review.

**Nhịp thời gian:** giữ khung dòng SQL — học kỳ 2, 18 tuần, CLB sinh hoạt 2 buổi/tuần; mỗi chặng ≈ 3 tuần.

---

## 11. Quản lý đội trong mùa 1 — **[đề xuất]**

### 11.1. Đàn em (đội hình)

Mỗi đàn em là một NPC với 2–3 chỉ số:

| Chỉ số | Ảnh hưởng |
|---|---|
| **Tay nghề** (1–5) | Giảm **độ trễ** lệnh của `R2` (từ 3 tick xuống 1 tick) |
| **Bình tĩnh** (1–5) | Giảm số lần lệch hướng khi gần đối thủ |
| **Nết** | Chăm/ẩu — ảnh hưởng truyện và luyện tập, không ảnh hưởng điểm trực tiếp |

**Luật vàng: quản lý chỉ được MỞ/KHOÁ lựa chọn, tuyệt đối không cộng điểm trực tiếp.** Tay nghề chỉ giảm **dao động**, không nâng **trần** — và **phải thắng được mà không cần tối ưu quản lý**. Nếu "chủ nhiệm giỏi = robot mạnh hơn" thì người chơi học "thắng nhờ quản lý", không phải nhờ code.

### 11.2. Ngân sách và mua sắm

- Đầu mỗi chặng: CLB cấp một **ngân sách part** (10 "suất" cho cả 2 robot).
- Part mua ở xưởng; bán lại được nhưng **mất giá** (để lựa chọn có trọng lượng).
- Sau trận thắng: thêm ngân sách + một part thưởng; sau trận thua: vẫn có ngân sách tối thiểu (không bao giờ chặn đường chơi tiếp).

### 11.3. Mùa giải

- Đối thủ có **tính cách lối chơi** đọc được trước trận (đội nhanh mà ẩu / đội chắc mà chậm / đội chuyên đẩy vật nặng), và bạn **chuẩn bị đối sách** bằng part + hàm → đây là chỗ lớp quản lý chạm vào lớp lập trình.
- **Ngoài mùa 1:** mùa 2 bạn là chủ nhiệm CLB — tuyển người, xin kinh phí, chọn giải, đào tạo khoá sau. Ghi ở đây để không thiết kế chặn đường.

---

## 12. Review chiến thuật — **[đề xuất]**

Màn cao trào, dạy kỹ năng **đọc code**.

| Nhịp | Việc |
|---|---|
| 1 | Đối thủ trình bày code "tối ưu" + **sân họ tự chọn** (sân dễ) → chạy ra đúng |
| 2 | Người chơi chọn **điểm đáng ngờ** trong code (chọn từ danh sách quan sát, không gõ) |
| 3 | **Tự dựng sân phản ví dụ** rồi cho code đối thủ chạy trên đó → code sập → "Chạy thử là biết!" |
| 4 | Kết luận: nói ra **nguyên tắc** ("code phải chạy trên mọi sân", "phải kiểm tra biên") |

Nhịp 3 là linh hồn: người chơi phải **tự tạo phản ví dụ**, không chọn từ đáp án. Khuôn dựng giới hạn (4×4, tối đa 4 vật cản + 2 vật) để không thành công cụ vẽ.

**Uy tín đội:** chọn sai điểm đáng ngờ → mất 1 uy tín, Khánh đỡ lời (theo mô-típ QĐ-082/083 của dòng SQL).

**Bằng chứng = "bản ghi chạy":** `{ma_tran, ma_san, chuong_trinh, danh_sach_tick[], ket_qua, chan_doan, hang}`. Dùng để phát lại trong review, đính vào hồ sơ, và **cắt clip ngắn** — đúng tài sản thương hiệu "clip khoảnh khắc phản bác" (vũ trụ §10).

**Hiệu ứng câu hô "Chạy thử là biết!"**: toàn màn hình ~1,2 giây, bấm để bỏ qua, tắt rung khi `prefers-reduced-motion`; **tối đa 2–3 lần mỗi mùa** (theo QĐ-025).

---

## 13. Sinh đề: mã sân và mã trận — **[đề xuất]**

- **Mã trận** sinh ra: sân, vị trí vật cản/vật/nút, **bộ part của đối thủ**, lối chơi đối thủ, và seed sai số tay nghề.
- **Mã sân** là mã con, chia sẻ được: cuối mỗi chặng người chơi có mã sân của mình và chơi được sân của bạn cùng lớp → **móc lan truyền** của dòng này.
- **Mỗi người một đề** (nguyên tắc 4) nhờ vậy vẫn giữ, dù bài học chung.
- **MVP dùng sân cố định**, chưa có mã (đúng cách dòng SQL cắt MVP — QĐ-077).

---

## 14. Đánh giá thắng: ba tầng — **[đề xuất]**

| Tầng | Thắng = | Dùng để | Có bị may rủi không |
|---|---|---|---|
| **Trận đấu** | Nhiều điểm hơn (nhiệm vụ + ECP + thưởng sạch − phạt) | Nhịp căng thẳng, cảm giác thi đấu | Không — mọi thứ tất định, kể cả sai số tay nghề |
| **Hạng code** | A/B/C trên sân ẩn × đối thủ ẩn | **Đo học thật**, tách khỏi kết quả trận | Không |
| **Mùa giải** | Thứ hạng, vào vòng trong | Mục tiêu dài | Không |

Cốt truyện **không khoá theo thắng thua**: thua thì đi nhánh khác, mất uy tín chứ không mất game (đúng "không phạt nặng"). Ngoại lệ duy nhất được phép là trận chung kết.

**Telemetry** (cục bộ, QĐ-029): số lần chạy mỗi bài · mã chẩn đoán gặp phải · có dùng gợi ý · **qua sân ẩn ngay lần đầu hay không** (thước đo học thật) · có mở bản gõ tay không · thời gian tới lần chạy đầu · có muốn chơi chặng sau không.

---

## 15. Danh sách màn hình tối thiểu — **[đề xuất]**

| # | Màn | Nội dung chính |
|---|---|---|
| 1 | Sân đấu | Sân, 2 robot, đối thủ; thanh Chạy / Tạm dừng / Tua / Chạy lại / tốc độ |
| 2 | Khay lệnh | Thẻ đã mở theo chặng **và theo part đã lắp**; thẻ nhiễu; khe tham số |
| 3 | Khung chương trình | Danh sách thẻ có thụt lề; **thanh ô nhớ**; đổi sang bản gõ tay |
| 4 | Bảng trạng thái | `x, y, huong, pin, tui, tick` + biến tự tạo, đổi theo tick (cho cả 2 robot) |
| 5 | Bảng chẩn đoán | Mã chẩn đoán + lời nhân vật + nút "chạy lại từ tick này" |
| 6 | Bảng kết quả | Hạng A/B/C, điểm trận, sân ẩn đã qua (không lộ bố cục) |
| 7 | **Xưởng lắp ráp** | 6 khe × 2 robot, ngân sách, khối lượng/kích thước, xem trước API mở ra |
| 8 | **Thư viện hàm** | Danh sách hàm, chi phí ô nhớ, **đọc mã nguồn**, chọn mang theo |
| 9 | **Phòng đội** | Đàn em, chỉ số, chọn ai lái; đội hình |
| 10 | Sổ tay | Kiến thức Python theo chặng (tương ứng sổ chị Linh của dòng SQL) |
| 11 | Hồ sơ kỹ thuật | Bản vẽ sân, thông số, dữ kiện đo được ngoài đời |
| 12 | Review chiến thuật | Code đối thủ + khuôn dựng sân phản ví dụ |

Dùng lại **phần kể chuyện dùng chung** (bản đồ, hội thoại, sổ tay, hồ sơ, mã đề, tiến độ); màn 1–9, 12 là phần giải đố mới phải viết.

---

## 16. Từ vựng đối chiếu với dòng SQL

| Dòng SQL | Dòng Robotics |
|---|---|
| Hồ sơ (thông tin vụ) | Hồ sơ kỹ thuật (bản vẽ sân) |
| Sổ tay (kiến thức SQL) | Sổ tay (kiến thức Python) |
| Bàn làm việc + giấy nhớ | **Bàn lệnh** + thẻ lệnh |
| Chip dữ kiện | Chip tham số |
| Vật chứng = kết quả truy vấn | Bằng chứng = **bản ghi chạy** |
| Mã đề | Mã sân / mã trận |
| Buổi giải trình | Review chiến thuật |
| Thanh uy tín | Uy tín đội |
| Mã chẩn đoán | Mã chẩn đoán (khác bộ mã) |
| Câu hô "Số liệu đây!" | "Chạy thử là biết!" |
| Hạng S/A/B/C | Hạng A/B/C |

**Chưa làm chung:** API/kiến trúc chia sẻ giữa các dòng. Bảng này để **không đặt tên lệch**, không phải để bắt tay vào code chung (`prototype-scope-down-v0.1.md`).

---

## 17. Bất biến kỹ thuật và cách kiểm — **[đề xuất]**

| # | Bất biến | Cách kiểm |
|---|---|---|
| 1 | **Tất định:** cùng `(ma_tran, chuong_trinh, part, doi_hinh)` → cùng bản ghi, **kể cả sai số tay nghề** | Chạy 1.000 lần, so bản ghi |
| 2 | **Chạy được bằng Python thật:** mọi chương trình hợp lệ trong game cho cùng kết quả khi chạy bằng CPython thật | Bộ đối chiếu: N chương trình × M sân × 2 nhân |
| 3 | **Mọi bài đều có lời giải trong tập lệnh + part đã mở** | Chạy lời giải mẫu trên 500 mã trận, phải qua 100% |
| 4 | **Sân ẩn phải làm trượt lời giải "đường cứng"** (ghi cứng từng bước) | Sinh lời giải ghi cứng, xác nhận trượt trên ≥1 sân ẩn |
| 5 | **Không part nào trội toàn diện:** mỗi part phải thắng ở ít nhất một dạng sân | Chạy bộ part tối ưu trên toàn bộ sân mẫu, xem có part nào luôn thắng |
| 6 | **Hàm thư viện không giải hết bài:** mỗi bài có phần hàm không làm được | Kiểm bằng lời giải chỉ dùng hàm thư viện — phải trượt |
| 7 | **Phải thắng được mà không cần tối ưu quản lý** | Chơi với đội hình yếu nhất, xác nhận vẫn qua được các trận bắt buộc |
| 8 | **Không treo máy:** mọi chương trình kết thúc trong ngân sách, kể cả `while True` | 10 chương trình lặp vô tận |
| 9 | **Không lộ đáp án:** bảng kết quả không nêu bố cục sân ẩn / đối thủ ẩn | Test chữ hiển thị |
| 10 | **Không bài học nào cần thứ chưa dạy:** lời giải mẫu của mỗi bài chỉ dùng lệnh trong `bai.khay`, và khay của bài học chỉ gồm lệnh đã mở ở chặng đó | Test canh `khay` + lời giải mẫu (`kiem-core-san-robot.mjs` §9) |
| 11 | **Gọi hàm chưa mở phải ra `locked-command`** kèm lời nhắn liệt kê khay đang có, không phải một lỗi khó hiểu | Test gọi `at_goal()` ở bài 1 |

Bất biến 2 là quan trọng nhất về dạy học: hàng rào chống việc "dạy một thứ giống Python nhưng không phải Python". Bất biến 5, 6, 7 là hàng rào của **lớp quản lý và part** — chống việc game biến thành "sưu tầm đồ".

---

## 18. Chạy code bằng gì — **[đề xuất, cần user chốt]**

Vũ trụ §8.2 ghi "Chạy: Pyodide". Ba phương án:

| | A. Pyodide (CPython WASM) | B. Nhân chạy tự viết (tập con Python) | C. A trước, B dự phòng |
|---|---|---|---|
| Là Python thật | Có, 100% | Gần đúng | Có |
| Nặng | ~6–12 MB lần đầu, khởi động vài giây | Nhẹ, chạy ngay | Như A |
| Ngắt `while True` | Phải kill Web Worker rồi nạp lại (chậm) | Ngắt tức thời | Như A |
| Mã chẩn đoán | Từ exception của Python, phải ánh xạ về dòng/thẻ | Tự sinh, chính xác, dễ viết tiếng Việt | Như A |
| Công sức | Thấp | Cao | Thấp trước, cao sau |

**Đề xuất: A**, và **giữ cửa cho B** bằng cách tách **nhân mô phỏng** (sân, tick, luật, bản ghi — tài sản thật của game, viết bằng TypeScript) khỏi **nhân chạy code**, chỉ nối qua giao diện: *chạy chương trình này trên sân kia → bản ghi*. Với 2 robot thì nhân mô phỏng phải chạy **2 chương trình cùng lúc theo tick** — nên nó phải là một bộ điều phối tick, không phải hai lần chạy rời.

Việc phải xử lý khi dùng A: tải lười có thanh tiến trình · ngân sách lệnh đặt trong API · chó canh cho `while True: pass` · sân ẩn chạy không hoạt cảnh nên rất nhanh · nếu sau này đổi sang B thì phải sửa vũ trụ §8.2.

---

## 19. Thứ tự ra từng đợt — **[đề xuất]**

Phạm vi đầy đủ là lớn. Chia đợt để **mỗi đợt đều có thứ chơi được**:

| Đợt | Có gì | Chưa có |
|---|---|---|
| **1. Sân và code** | 1 robot, sân lưới + tick, Bàn lệnh, bản gõ tay, 3 hạng, 5 bài của chặng 1 — **đã có mockup chơi được**: `nhan/san-robot-dot-1.html` (2 test: `kiem-core-san-robot.mjs`, `kiem-ui-san-robot.mjs`) | part, đối thủ, thư viện, quản lý |
| **2. Trận đấu** | 1 đối thủ, tính điểm, đồng hồ 1.800 tick, ECP, chạy sân riêng | robot thứ hai, part |
| **3. Part** | 6 khe, ngân sách, ba loại tiền tệ, part mở API | robot thứ hai, thư viện |
| **4. Hai robot** | `R2` + độ trễ/sai số tay nghề, phạt `blocked-teammate`, nhiệm vụ cần 2 robot | thư viện, quản lý |
| **5. Thư viện hàm** | Chọn hàm mang theo, đọc mã nguồn, hàm lỗi | quản lý đội |
| **6. Quản lý đội** | Đàn em, ngân sách, đội hình, mùa giải 6–8 trận, đối kháng cùng sân ở chặng 6 | mùa 2 |

Thứ tự này cũng là thứ tự **kiểm chứng giả thuyết**: đợt 1 trả lời "kéo thẻ có dạy được Python không", đợt 3 trả lời "đánh đổi part có vui không", đợt 5 trả lời "hàm thư viện có làm bài học mất giá không".

---

## 20. MVP và buổi thử nghiệm — **[đề xuất]**

**Phạm vi MVP** (đợt 1 + một phần đợt 2, đủ để thấy "có trận đấu"):

- Chặng 1 cắt còn **2 bài luyện** + mở đầu truyện ~10 phút.
- **1 trận đấu thật** với 1 đối thủ: 1 robot tự động (chưa có `R2`), tính điểm, đồng hồ tick.
- **3 part** (động cơ, bánh, cảm biến chạm) để thấy mùi đánh đổi.
- **1 hàm thư viện** (`go_to`) để thấy mùi "hàm dựng sẵn".
- Có sân ẩn × đối thủ ẩn và hạng A/B/C. Có Bàn lệnh + bản gõ tay.
- **Chưa có:** `R2`, thư viện đầy đủ, đàn em, ngân sách, mùa giải, mã sân, sandbox.

**Buổi thử nghiệm** (mượn khuôn `docs/prototype/prototype-scope-down-v0.1.md` §9 của dòng SQL): 6–8 người **chưa từng học lập trình**, chơi 40 phút, có người quan sát.

**Bốn thí nghiệm:**

| # | Câu hỏi | Cách làm |
|---|---|---|
| 1 | Kéo thẻ có dạy được Python không, hay chỉ kéo cho xong? | Chia 2 nhóm (thẻ / gõ tay); sau buổi cho **cả hai gõ lại một chương trình ra giấy** |
| 2 | Đánh đổi part có hiểu được không? | Đưa 2 bộ part, hỏi **vì sao** chọn bộ đó; xem có nói được "nhanh thì tốn pin" |
| 3 | Hàm dựng sẵn có làm bài học mất giá không? | Đưa `go_to` **bản lỗi**; xem bao nhiêu người phát hiện |
| 4 | **Người chơi có tự đòi vòng lặp không?** (thí nghiệm quan trọng nhất của chặng 1) | **Bài 6 — phòng thí nghiệm** (`nhan/san-robot-dot-1.html`): hành lang 7/3/10 bước, không giải được bằng thẻ. Đo: có mở bản gõ tay không · có gọi `at_goal()` hay `front_is_wall()` không · có hỏi gợi ý không · có nói ra được "cần cái gì đó tự biết dừng" không. **Nếu đa số bí mà không bực → chặng 1–3 phải thiết kế lại** (có thể phải đưa `while` sớm hơn, hoặc bỏ kiểu bài "đếm bước") |

**Thí nghiệm 1 đã có kết quả sơ bộ (user tự chơi, 09/10/2026):** đọc thẻ ra ngay code tương ứng —
"nhìn như này thì code ra như vậy, chỉ là không phải gõ". Nghĩa là **quyết định in chữ Python trên thẻ
(§7.2) đã đúng**, và **không cần làm thêm một "ngôn ngữ khối" riêng**: chỉ cần nút "chép sang bản gõ tay".

Câu hỏi đo khác: qua sân ẩn ngay lần đầu (%) · số lần chạy mỗi bài · mã chẩn đoán gặp nhiều nhất · có mở bản gõ tay không · có muốn chơi chặng 2 không.

---

## 21. Ngoài phạm vi mùa 1

- **Vật lý thật** (quán tính, bánh xe trượt, cảm biến analog, đường cong).
- **Người chơi tự lái `R2` bằng phím trong lúc `R1` chạy code** (real-time — phá mô hình theo tick).
- **OOP (class)**, `try/except`, tệp, chuỗi, từ điển, `import` thư viện ngoài (thư viện **của đội** thì có, ở §5).
- **Đối kháng cùng sân** trước chặng 6.
- **PvP thật giữa hai người**, bảng xếp hạng toàn cầu, tài khoản, lớp học cho giáo viên.
- **Mùa 2 (chủ nhiệm CLB)** — ghi để không chặn đường, chưa thiết kế.
- API/kiến trúc dùng chung với dòng SQL.

---

## 22. Nếu user chốt, phải sửa những tài liệu nào

| Tài liệu | Sửa gì |
|---|---|
| `docs/lich-su-quyet-dinh.md` | Ghi các QĐ mới (QĐ-096 trở đi) theo §23 |
| `docs/thiet-ke/vu-tru-chan-hung-tong-quan.md` §4.3 | Thay bản tóm tắt bằng bản đầy đủ: 2 robot, part, ba loại tiền tệ, thư viện hàm, 6 chặng, 3 tầng thắng |
| `docs/thiet-ke/vu-tru-chan-hung-tong-quan.md` §8.2 | Nếu chốt phương án B/C ở §18 thì sửa ô "Chạy" của cột Python robot; thêm ghi chú "sân đấu có 2 robot/đội" |
| `docs/thiet-ke/vu-tru-chan-hung-tong-quan.md` §5 | Thêm **tên đội trưởng đội bạn** và các đàn em vào bảng nhân vật |
| `nhan-vat.yaml` | Thêm nhân vật mới của dòng này |
| `README.md` | Cập nhật dòng tài liệu (v0.2) |
| `docs/thiet-ke/doi-robot-chan-hung-GDD-v0.1.md` | Đã đánh dấu "v0.2 thay thế" ở đầu tệp |

---

## 23. Điểm cần user chốt (sẽ thành QĐ-096 trở đi)

| # | Câu hỏi | Trạng thái / đề xuất |
|---|---|---|
| 1 | Phạm vi mùa 1 | **ĐÃ CHỐT 09/10: đầy đủ** (2 robot, part, thư viện, quản lý đội) |
| 2 | Vai nhân vật chính | **ĐÃ CHỐT 09/10: giữ canon** — mùa 1 đội trưởng kỹ thuật, mùa 2 chủ nhiệm |
| 3 | `R2` do code điều khiển (có trễ/sai số) hay bằng "phiếu điều khiển"? | **Code + trễ/sai số** (một ngôn ngữ duy nhất) |
| 4 | Số ô nhớ chương trình mỗi chặng | Ví dụ 40 ô ở chặng 4 — cần chốt con số |
| 5 | Số part và ngân sách part | 6 khe, 10 suất cho 2 robot |
| 6 | Đối kháng cùng sân từ chặng mấy | **Chặng 6** |
| 7 | Thư viện hàm: mang theo mấy hàm, có tốn ô nhớ riêng không? | 3–5 hàm, tốn ô nhớ chương trình |
| 8 | Có bán lại part không? | Có, mất giá |
| 9 | Chạy code bằng gì (§18) | **A — Pyodide**, tách nhân mô phỏng |
| 10 | Thẻ lệnh in chữ Python hay tiếng Việt (§7.2) | **Chữ Python** |
| 11 | Mở Hardcore từ lúc nào | Sau chặng 1 |
| 12 | Nâng cấp/quản lý có buff điểm không | **Không** — chỉ mở/khoá lựa chọn (§11.1) |
| 13 | Tên đội trưởng đội bạn + đàn em | Cần user đặt; phải vào `nhan-vat.yaml` |
| 14 | Ai là người hướng dẫn chính | **Khánh**; Hà Vy và thầy Khải theo tình huống |

---

## 24. Việc tiếp theo

1. **Chơi thử mockup đợt 1** — `nhan/san-robot-dot-1.html` (mở trực tiếp bằng trình duyệt). Đây là đợt 1 đã làm xong; cảm nhận Bàn lệnh, thanh ô nhớ và ba hạng trước khi quyết gì thêm.
2. **User chốt §23** → ghi QĐ-096 trở đi vào `docs/lich-su-quyet-dinh.md`.
3. Sau đó mới tới: **đợt 2 (trận đấu có đối thủ + tính điểm)**; **bảng part cụ thể có số** (một trang tính); kịch bản chặng 1 theo đặc tả QĐ-075; danh sách asset tối thiểu; rồi mới tới prototype thật.
