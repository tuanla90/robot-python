# Đội Robot Chấn Hưng — Tài liệu thiết kế (v0.1, 09/10/2026)

> **⚠️ Bản này đã bị thay thế bởi `doi-robot-chan-hung-GDD-v0.2.md` (cùng ngày 09/10/2026).** Bản v0.2 mở rộng thành **2 robot, part, thư viện hàm, quản lý đội**. Giữ tệp này làm lịch sử — đừng sửa nữa, sửa ở v0.2.
>
> Game học **Python cơ bản** bằng cách lập trình cho robot đi trên sân thi đấu dạng lưới.
> Là **dòng thứ 3** của **Vũ trụ Chấn Hưng** — nhân vật chung, dòng thời gian, kiến trúc dùng chung xem `vu-tru-chan-hung-tong-quan.md` (§4.3, §8).
>
> **Trạng thái:** ý tưởng trong tài liệu vũ trụ → nay thành thiết kế. **Chưa có QĐ nào cho dòng này**; mọi mục ghi **[đề xuất]** là ý của người soạn, chờ user chốt rồi mới ghi thành QĐ-096 trở đi trong `docs/lich-su-quyet-dinh.md`.
>
> **Phạm vi tài liệu này:** **cơ chế** — thế giới, lệnh, cách chấm, hai chế độ chơi, lộ trình chặng, màn review, sinh sân, MVP. Kịch bản lời thoại, danh sách ảnh, phong cách hội họa **để bản sau** (dòng SQL cũng đi theo thứ tự này: GDD trước, kịch bản và asset sau).
>
> **Nguồn gốc:** 09/10/2026, sau khi user cân nhắc hai hướng (đấu robot theo vũ trụ Chấn Hưng / game thẻ bài kiểu *Slay the Spire* mà mỗi thẻ là một khối lệnh) và chọn **hướng đấu robot**. Ý tưởng thẻ bài **không bị bỏ** — nó thành **chế độ cơ bản** của dòng này (§5).

---

## 1. Các quyết định đã có từ canon (không bàn lại ở đây)

| Hạng mục | Đã chốt ở | Nội dung |
|---|---|---|
| Vị trí trong chuỗi | vũ trụ §3, §9 | Dòng 3; ra mắt **sau** khi HTML/CSS có người chơi ổn định (giai đoạn 3) |
| Thời gian trong truyện | vũ trụ §6 | Học kỳ 2 năm học 2026–2027, **ngay sau mùa 1 SQL** |
| Nhân vật chính | vũ trụ §4.3 | Sinh viên năm nhất (người chơi tạo), mới vào CLB Robotics |
| Mục tiêu lớn | vũ trụ §4.3 | Đưa đội vào **chung kết giải robot quốc gia (tháng 4)** |
| Nhân vật | vũ trụ §4.3, §5 | **Vương Khánh** (trưởng CLB, năm 4, tuyến chuộc lỗi); cameo thầy Khải, Hà Vy, Quân (trọng tài) |
| Rival | vũ trụ §4.3 | Đội trường bạn **ĐH Kỹ thuật Hải Đăng**; đội trưởng giỏi nhưng coi thường dân không chuyên |
| Câu hô | vũ trụ §3 | **"Chạy thử là biết!"** |
| Hai chế độ | vũ trụ §4.3, §8.2 | Cơ bản: sắp xếp dòng code (hợp người mới **và điện thoại**); Hardcore: gõ Python thuần |
| Chấm | vũ trụ §4.3 | Chạy code bằng Python trong trình duyệt, kiểm tra robot về đích trên **nhiều sân kiểm tra ẩn** |
| Lộ trình kiến thức | vũ trụ §4.3 | Lệnh tuần tự → biến → điều kiện → vòng lặp → hàm → danh sách → tình huống bất ngờ |
| Tên biến/hàm | QĐ-008 | Giao diện và nội dung tiếng Việt; **tên biến/hàm tiếng Anh** |
| Nền tảng | QĐ-085, QĐ-093 | Laptop là nền chính; **điện thoại cầm dọc phải chơi được** |

**Nguồn chuẩn về nhân vật:** `nhan-vat.yaml` (đặc tả nội dung §4). Hiện nhân vật còn ở dạng `.md` trong `prototype/noi-dung-mvp/`; gói 12b mới chuyển sang YAML. Dòng này **chưa có nhân vật nào mới** phải đặt tên ngoài đội trưởng đội bạn (§17, câu 9).

---

## 2. Tài liệu này trả lời câu hỏi nào

| Câu hỏi còn mông lung | Mục |
|---|---|
| Robot sống ở đâu, luật chơi là gì, mỗi lệnh làm gì? | §3 |
| Một "bài" gồm những gì, khó lên bằng cách nào, chấm thế nào? | §4 |
| Chế độ kéo thả cụ thể ra sao, có dạy được Python không hay chỉ là game? | §5 |
| Dạy cái gì trước cái gì, mỗi chặng mấy bài? | §6 |
| Màn phản bác (thay buổi giải trình) chơi thế nào? | §7 |
| "Mỗi người một đề" áp vào đây ra sao? | §8 |
| Phần thưởng, tiến độ, có buff robot không? | §9 |
| Có bao nhiêu màn hình phải làm? | §10 |
| Chạy code bằng gì (Pyodide hay không)? | §13 |
| Làm cái gì trước để biết hướng này có sống được không? | §14 |

---

## 3. Mô hình thế giới: sân lưới, robot, tick — **[đề xuất]**

### 3.1. Sân

Sân là **lưới ô vuông** kích thước `W × H` (mặc định 5×5 → 12×12 theo chặng). Mỗi ô một loại:

| Ký hiệu | Loại ô | Ý nghĩa |
|---|---|---|
| `.` | `trong` | Trống, đi qua được |
| `#` | `tuong` | Vật cản cố định; đi vào → tính là **va tường** |
| `o` | `vat` | Linh kiện cần nhặt; có mã riêng (`o1`, `o2`…) |
| `D` | `dich` | Ô đích; về đây khi đã xong việc |
| `S` | `tram` | Trạm sạc pin (từ chặng 4) |
| `~` | `tron` | Ô trơn: bước vào thì **trượt thêm 1 ô** cùng hướng (chỉ chặng cuối) |

```
Ví dụ sân 5×5 (r = robot đang ở (1,1) hướng Bắc, ^ = hướng):
. . D . .
. r . . .
. # . o .
. . . # .
o . . . .
```

**Vì sao lưới chứ không phải vật lý thật (bánh xe, quán tính, cảm biến khoảng cách):** mọi thứ **đếm được** — số bước, số tick, số pin — nên chấm bài là so hai con số, không phải "trông có vẻ đúng". Người mới nhìn ra ngay quan hệ nhân quả giữa một dòng lệnh và một bước đi. Vật lý thật để dành cho bản nâng cao nếu có.

### 3.2. Robot và trạng thái

Trạng thái robot (chính là **các biến** người chơi sẽ học):

| Trạng thái | Kiểu | Ghi chú |
|---|---|---|
| `x`, `y` | số | Toạ độ ô hiện tại |
| `huong` | `B` / `D` / `N` / `T` | Bắc (lên) / Đông (phải) / Nam (xuống) / Tây (trái) |
| `pin` | số | Mỗi bước đi tốn 1 pin; hết pin → robot dừng |
| `tui` | danh sách | Mã các linh kiện đã nhặt |
| `tick` | số | Số đơn vị thời gian đã trôi |

### 3.3. Lệnh (hành động) và cảm biến — API mùa 1

Tên hàm **tiếng Anh** (QĐ-008). Mùa 1 chỉ có bấy nhiêu, mở dần theo chặng (§6).

| Lệnh | Việc | Tick | Pin |
|---|---|---|---|
| `move()` | Đi 1 bước theo hướng đang quay | 1 | 1 |
| `move(3)` | Đi 3 bước (dừng nếu gặp vật cản) | n | n |
| `turn_left()` / `turn_right()` | Quay tại chỗ | 1 | 0 |
| `pick()` | Nhặt linh kiện ở ô đang đứng vào túi | 1 | 0 |
| `drop()` | Bỏ linh kiện ra ô đang đứng | 1 | 0 |
| `wait()` | Chờ (dạy "đôi khi không làm gì là đúng") | 1 | 0 |

| Cảm biến (trả về `True`/`False` hoặc số, **không tốn tick**) | Việc |
|---|---|
| `front_is_wall()` | Ô trước mặt có vật cản? |
| `at_goal()` | Đang đứng ở ô đích? |
| `item_here()` | Ô đang đứng có linh kiện? |
| `battery()` | Pin còn lại |
| `bag()` / `bag_count()` | Túi đồ / số món trong túi |
| `steps()` | Số tick đã trôi |

**Chưa mở ở mùa 1:** `print()` (chỉ mở ở chặng cuối nếu cần), `import`, `input()`, chuỗi, từ điển, lớp (class), đọc/ghi tệp, `random`.

### 3.4. Luật chạy

1. **Theo tick.** Mỗi lệnh tốn tick; sim chạy từng tick và **phát lại được** (xem §7.3).
2. **Va tường không làm hỏng bài.** Robot đứng yên, vẫn tốn 1 tick + 1 pin, và bị **ghi nhận** vào bản chạy. Va tường **không** bị trừ điểm, nhưng **không đạt hạng A** (§4.3). Lý do: "sai là để học" (nguyên tắc 5), nhưng vẫn cần một đích để phấn đấu.
3. **Hết pin → robot dừng**, bài coi như chưa xong (trừ khi đứng ở trạm sạc, chặng 4+).
4. **Ngân sách.** Mỗi sân có `tick_toi_da` (ví dụ 3× độ dài đường đi ngắn nhất) và mỗi chương trình có `ngan_sach_lenh` (ví dụ 200.000 lệnh). Vượt ngân sách lệnh → chẩn đoán `infinite-loop`; vượt `tick_toi_da` → `budget-exceeded`.
5. **Chương trình kết thúc mà chưa xong việc** → vẫn chấm (ra chẩn đoán `unfinished`, chỉ đúng chỗ còn thiếu: "còn 1 linh kiện ở góc dưới").
6. **Không dùng lệnh chưa mở** → `locked-command`, kèm lời thoại của Khánh chứ không phải thông báo lỗi kỹ thuật.

---

## 4. Một bài luyện sân gồm những gì — **[đề xuất]**

### 4.1. Cấu trúc một bài

| Trường | Nội dung |
|---|---|
| `muc_tieu` | Việc phải xong, viết bằng lời người ("Nhặt đủ 3 linh kiện rồi về ô đích") |
| `san_chinh` | Sân hiện, có hoạt cảnh, có lời kể |
| `san_an` | 2–4 sân cùng luật, **khác bố cục** — dùng để chấm (§4.3) |
| `rang_buoc` | Giới hạn pin, giới hạn số dòng, cấm lệnh cụ thể, thứ tự bắt buộc |
| `goi_y` | 2–3 câu nhắc **theo ý nghĩa**, không có đáp án, nói bằng giọng nhân vật |
| `loi_giai_mau` | 1–2 chương trình mẫu, dùng cho test bất biến (§12) |

### 4.2. Núm chỉnh độ khó

| Núm | Dễ → Khó |
|---|---|
| Kích thước sân | 3×3 → 12×12 |
| Số vật cản | 0 → nhiều, buộc đi vòng |
| Số linh kiện | 1 → 6, rải rác |
| Pin | Thoải mái → vừa đủ, buộc chọn đường ngắn |
| Số sân ẩn phải qua | 1 → 4 |
| Số dòng code tối đa | Không giới hạn → "không quá 12 dòng" (buộc dùng hàm ở chặng 4) |
| Bất ngờ | Không → sân ẩn có bố cục khác hẳn sân chính |

### 4.3. Chấm: ba hạng, không phạt

Mỗi lần bấm **Chạy** đều được phát lại kèm nhận xét (theo tinh thần QĐ-018 — chạy là chấm, không phạt, thử lại không giới hạn).

| Hạng | Điều kiện | Ý nghĩa sư phạm |
|---|---|---|
| **C** | Qua sân chính nhưng có va tường hoặc hết pin giữa đường | "Chạy được rồi, còn lộn xộn" |
| **B** | Qua sân chính, không va tường, không hết pin | "Sạch" |
| **A** | Qua **toàn bộ sân ẩn**, không va tường | Đây là bài học thật: **code phải đúng ở sân mình chưa thấy** |

Qua sân chính là **đủ để đi tiếp**; hạng A là để phấn đấu và là điều kiện mở bài "thử thách" của chặng. Hạng không bao giờ khoá cốt truyện — nhất quán với "không phạt nặng".

**Cách chấm:** chạy chương trình trên **cùng một nhân mô phỏng**, im lặng (không hoạt cảnh) cho các sân ẩn; so bản ghi kết quả. Không so từng dòng code — nhiều cách viết đúng đều được chấp nhận (nguyên tắc 3).

### 4.4. Mã chẩn đoán

Dùng lại đúng cơ chế **mã chẩn đoán** của dòng SQL (QĐ-040), chỉ khác bộ mã:

| Mã | Nghĩa | Ai nói | Ví dụ lời |
|---|---|---|---|
| `hit-wall` | Va vật cản ở `(x,y)` tick `t` | Khánh | "Nó húc tường rồi. Cậu xem lại chỗ rẽ ấy." |
| `battery-empty` | Hết pin giữa sân | Hà Vy | "Khoan, tính lại đã. Đi thế này thì hết pin trước khi tới đích." |
| `infinite-loop` | Vượt ngân sách lệnh | thầy Khải | "Vòng lặp này không có đường ra. Máy không tự biết dừng đâu." |
| `budget-exceeded` | Chạy quá số tick cho phép | Khánh | "Chạy được, nhưng chậm quá. Trọng tài bấm giờ rồi." |
| `unfinished` | Chương trình kết thúc mà chưa xong | Hà Vy | "Còn một linh kiện ở góc dưới kìa." |
| `missed-item` | Về đích khi còn linh kiện | Khánh | "Về đích mà tay không thì không tính điểm." |
| `syntax-error` | Sai cú pháp | thầy Khải | Chỉ đúng **dòng và cột**, không đọc traceback tiếng Anh |
| `indent-error` | Sai thụt lề | thầy Khải | "Dòng này phải lùi vào trong vòng lặp." |
| `locked-command` | Dùng lệnh chưa mở | Khánh | "Cái đó đội chưa có. Mình mới có nhiêu đây thôi." |
| `wrong-result` | Chạy xong, kết quả khác yêu cầu | Khánh | Nêu **khác ở đâu**, không nêu đáp án |

Nguyên tắc: **nhận xét theo ý nghĩa, không lộ đáp án**. Sân ẩn **không** được nêu vị trí vật cản (giống QĐ-053 của dòng SQL: màn xem xét không nêu tên manh mối còn thiếu).

### 4.5. Chống gian lận bằng sân ẩn

Mỗi bài phải bảo đảm: **có một lời giải "đường cứng"** (ghi cứng từng bước: `move(); turn_left(); move()…`) **chạy được trên sân chính nhưng trượt trên ít nhất một sân ẩn**. Đây là bất biến kiểm thử, không phải lời khuyên (§12). Nhờ vậy người chơi buộc phải viết code có vòng lặp/điều kiện thay vì chép đường đi — đúng bài học của chặng.

---

## 5. Hai chế độ chơi — **[đề xuất]**

### 5.1. Chế độ cơ bản — "Bàn lệnh"

Đây là chỗ ý tưởng **thẻ bài** sống: một **khay lệnh** bên trái, một **khung chương trình** bên phải.

- **Thẻ lệnh** = một dòng lệnh. Thẻ có **ô tham số**: `move( )`, `for i in range( )`.
- **Thẻ lồng được**: `if` / `while` / `for` có **khe thân**; thả thẻ vào khe thì thụt lề tự động. Đây chính là "sắp xếp dòng code, đúng thụt lề" của vũ trụ §4.3, làm ở mức thẻ.
- **Tham số là chip** (dùng lại ý tưởng "dữ kiện thành chip" của dòng SQL §10.2): chip số (`3`), chip cảm biến (`front_is_wall()`), chip biến (`i`, `pin`). Chip chỉ thả được vào ô đúng kiểu → dạy kiểu dữ liệu mà không giảng lý thuyết.
- **Thẻ nhiễu** nằm chung khay (lệnh chưa cần cho bài, lệnh sai ngữ cảnh) → người chơi phải chọn, không thả hết.
- Khay lệnh **chỉ hiện lệnh đã mở** theo chặng → không choáng.

### 5.2. Quyết định quan trọng: thẻ hiện **chính chữ Python**

Đây là chỗ tôi đề nghị khác mặc định của "khối kiểu Scratch", và đề nghị **chốt thành QĐ**:

> **Trên mỗi thẻ in thẳng dòng Python** (`move(3)`, `turn_left()`, `for i in range(4):`) bằng phông mono. Chú thích tiếng Việt là **dòng phụ nhỏ**, không phải nội dung chính của thẻ.

Lý do: nghiên cứu về chuyển từ lập trình khối sang lập trình chữ cho thấy người học **không tự động** chuyển được, và hay mang theo hiểu lầm khái niệm ([Mediated transfer & misconceptions](https://rd.springer.com/article/10.1007/s40692-022-00225-z), [block-based → text-based](https://dl.acm.org/doi/abs/10.1007/s10209-025-01271-x)). Nếu thẻ ghi "ĐI 3 BƯỚC" thì người chơi học *ngôn ngữ của game*, không học Python. Nếu thẻ ghi `move(3)` thì kéo thả **chính là** đang viết Python, và bỏ thẻ đi là còn lại một chương trình Python thật.

### 5.3. Cầu nối sang gõ tay, và Hardcore

| Bước | Việc | Mở khi |
|---|---|---|
| 1 | Bàn lệnh (kéo thả, thẻ là chữ Python) | Chặng 1 |
| 2 | **Nút "Chép sang bản gõ tay"**: đổi chương trình đang có thành văn bản sửa được, giữ nguyên code | Chặng 1 (tuỳ chọn) |
| 3 | **Hardcore**: gõ Python thuần, khay thẻ ẩn đi | Sau chặng 1; đổi qua lại bất cứ lúc nào |
| 4 | Điểm/huy hiệu thưởng thêm khi làm bài ở Hardcore | Sau chặng 1 |

Mở Hardcore **sớm hơn dòng SQL** (dòng SQL mở sau Vụ 1) là có lý do: ở đây code ngắn, ít cú pháp, nên gõ tay không đáng sợ; và càng nhiều người rời khỏi bàn lệnh càng tốt.

### 5.4. Bảng trạng thái trực quan (dạy biến)

Cạnh sân luôn có một bảng nhỏ hiện `x`, `y`, `huong`, `pin`, `tui`, `tick` — **và các biến người chơi tự tạo** (`steps`, `i`). Khi chạy, các ô này **đổi số theo từng tick**.

Đây là cách dạy biến mà không cần giảng: người chơi thấy `i` nhảy 0 → 1 → 2 → 3 khi vòng lặp quay, và thấy `pin` tụt mỗi bước. Cũng là chỗ chẩn đoán "vì sao hết pin" trở nên hiển nhiên.

---

## 6. Chặng, lộ trình kiến thức và độ khó — **[đề xuất]**

**Chữ dùng:** trong tài liệu này **"chặng"** là **đơn vị lớn nhất của mùa** — tương ứng "vụ" của dòng SQL. Chữ "chặng" trong lời Vụ 1 bản 7 của dòng SQL (`docs/mua-1/v7-thoai/01-chang-1.md`) nghĩa là **nhịp bên trong một vụ**, khác nghĩa; ai viết nội dung cho dòng này nhớ phân biệt.

Mùa 1 đề xuất **6 chặng**. Mỗi chặng = 1 buổi họp chiến thuật (truyện, nhận đề) + **3–5 bài luyện sân** + 1 buổi **review chiến thuật** (§7).

| Chặng | Truyện (nháp) | Lệnh mới | Khái niệm | Dạng sân | Trọng tâm chấm | Lỗi cài vào code đội bạn |
|---|---|---|---|---|---|---|
| 1. Vào đội | Khánh thử tay, cho robot chạy sân tập | `move`, `turn_left/right`, `pick`, `at_goal` | Lệnh tuần tự, thứ tự | Đường thẳng, 1–2 góc | Làm đúng thứ tự | Quên `turn`, đi thẳng mãi |
| 2. Đo sân | thầy Khải đưa bản vẽ; Hà Vy đo khoảng cách | `steps`, `battery`, `bag_count` | **Biến**, gán, đếm | 2 nhánh, có 1 vật cản | Biến đếm đúng | Đếm sai, cộng dồn sai chỗ |
| 3. Gặp tường | Sân tập có vật cản, robot húc tường trước mặt khán giả | `front_is_wall`, `if/else`, `while` | **Điều kiện, lặp có điều kiện** | Mê cung nhỏ | Không kẹt, không lặp vô tận | `while` thiếu điều kiện dừng |
| 4. Đường vòng | Đội bạn khoe code "tối ưu" | `for i in range(n)`, `def` | **Vòng lặp đếm, hàm, khử lặp** | Nhiều góc giống nhau, giới hạn 12 dòng | Dùng lại hàm | Chép 4 lần cùng một đoạn, sửa 3 chỗ quên 1 |
| 5. Túi đồ | Kiểm kê linh kiện trước giải | `bag()`, `len()`, `for x in bag()`, tự tạo danh sách: `ds = []` / `ds.append(x)` | **Danh sách** | Nhiều linh kiện rải rác | Xử lý được nhiều vật | Giả sử lúc nào cũng đúng 3 món |
| 6. Sân lạ | Giải trong trường → chung kết quốc gia | (không có lệnh mới) | Tổng hợp, **tình huống bất ngờ** | Sân sinh từ mã sân, chưa từng thấy | Tổng quát hoá | Code chỉ đúng với sân quen |

**Nhịp một chặng** (theo đúng lối dòng SQL: buổi nào cũng có việc, không có bài tập rời):

```
Họp chiến thuật  →  Bài 1  →  Bài 2  →  Bài 3  →  [Bài thử thách]  →  Review chiến thuật  →  mở chặng sau
   (truyện,          (dạy)     (luyện)   (biến thể)   (chỉ mở khi         (phản biện code
    nhận đề,                                            hạng A/B)          đội bạn)
    dữ kiện đo sân)
```

**Tỉ lệ nhắm tới:** khoảng **60% luyện sân, 25% truyện/hội thoại/đi lấy dữ kiện, 15% review**. Cảnh báo ngược với dòng SQL: ở đây rủi ro không phải "trôi thành truyện" mà là **"trôi thành chuỗi bài tập"** — nên mỗi bài phải có một *hậu quả trong truyện* (thắng/thua trận đấu thử, đội bạn chế giễu, đội mất suất), không bao giờ chỉ là "Bài 7: vòng lặp".

**Nhịp thời gian:** giữ khung dòng SQL — học kỳ 2, 18 tuần, CLB sinh hoạt 2 buổi/tuần; mỗi chặng ≈ 3 tuần.

---

## 7. Buổi review chiến thuật (thay màn giải trình) — **[đề xuất]**

Đây là màn cao trào, và là chỗ dạy kỹ năng **đọc code** — kỹ năng mà dòng SQL không dạy.

### 7.1. Bốn nhịp

| Nhịp | Việc | Ai nói |
|---|---|---|
| 1. Đội bạn trình bày | Chiếu code "tối ưu" của đội Hải Đăng + **sân họ tự chọn** (sân dễ) → chạy ra đúng | Đội trưởng đội bạn |
| 2. Người chơi nêu điểm đáng ngờ | Chọn từ **danh sách quan sát** (không tự gõ): "thiếu trường hợp…", "lặp theo số cố định…", "giả sử lúc nào cũng có 3 linh kiện"… | Người chơi |
| 3. **Dựng sân phản ví dụ rồi chạy** | Người chơi đặt vài vật cản/linh kiện lên một sân trống nhỏ, rồi bấm cho code đội bạn chạy trên đó | Khánh: "Chạy thử là biết!" |
| 4. Kết luận | Code sập → đội bạn phải nhận; nói ra **nguyên tắc**: "code phải chạy trên mọi sân, không chỉ sân mình quen" | Cả đội |

**Nhịp 3 là linh hồn của màn này:** người chơi phải **tự tạo ra phản ví dụ**, không chọn từ đáp án cho sẵn. Đó là kỹ năng phản chứng — mạnh hơn hẳn một câu trắc nghiệm, và rất khó đoán mò. Khuôn sân dựng giới hạn (ví dụ 4×4, tối đa 4 vật cản + 2 linh kiện) để không thành công cụ vẽ.

### 7.2. Uy tín và câu hô

- Chọn **sai** điểm đáng ngờ → mất 1 **uy tín đội**; Khánh đỡ lời (theo đúng mô-típ QĐ-082/083 của dòng SQL: trừ ở một số nhịp, người dẫn dắt giải cứu).
- Hiệu ứng câu hô **"Chạy thử là biết!"**: toàn màn hình, ~1,2 giây, bấm để bỏ qua, tắt rung khi `prefers-reduced-motion`; dùng **tối đa 2–3 lần mỗi mùa** (theo QĐ-025) — và lần đáng nhớ nhất chính là nhịp 3.

### 7.3. Bằng chứng = "bản ghi chạy"

Mỗi lần chạy sinh ra một **bản ghi chạy**:

```
{ ma_san, chuong_trinh, danh_sach_tick[], ket_qua, chan_doan, hang }
```

Bản ghi này là **vật chứng** của dòng này (tương ứng "vật chứng = kết quả truy vấn" của dòng SQL). Nó dùng để: phát lại trong màn review, đính vào hồ sơ, và **cắt clip ngắn** — đúng tài sản thương hiệu "clip khoảnh khắc phản bác" ở vũ trụ §10. Vì bản ghi tất định (§12), cùng `(ma_san, chuong_trinh)` luôn ra cùng bản ghi.

---

## 8. Sinh đề: "mã sân" — **[đề xuất]**

- **Mã sân** = một chuỗi ngắn sinh từ một câu trả lời của người chơi (giống "Tùng hỏi chuyện để tạo mã đề" của dòng SQL). Từ mã sân sinh ra: kích thước sân, vị trí vật cản, vị trí linh kiện, ô đích, mức pin, và **bộ sân ẩn**.
- **Mỗi người một đề** (nguyên tắc 4) nhờ vậy vẫn giữ được, dù bài học là chung.
- **Mã sân chia sẻ được**: cuối mỗi chặng, người chơi có một mã sân của mình và chơi được sân của bạn cùng lớp. Đây là móc lan truyền tự nhiên của dòng này (tương ứng "cuối mùa có một game của chính mình" của dòng Game).
- **MVP dùng sân cố định**, chưa có mã sân — đúng cách dòng SQL cắt MVP (QĐ-077).

---

## 9. Phần thưởng và tiến độ — **[đề xuất]**

Nguyên tắc: **không buff chỉ số robot**. Nếu nâng cấp làm robot đi nhanh hơn / pin trâu hơn thì mọi bài đố trở nên dễ hơn, và người chơi học được rằng "thắng nhờ đồ", không phải nhờ code. Phần thưởng đi theo hướng khác:

| Phần thưởng | Kiếm bằng | Ảnh hưởng cơ chế |
|---|---|---|
| Sơn, decal, đèn, ăng-ten cho robot | Hạng A, bài thử thách | Không — chỉ hình thức, hiện trong mọi màn chơi |
| Huy hiệu chặng | Xong chặng | Không |
| Cảm biến mới (`item_here`, `bag`) | Mở theo chặng | Mở **dạng bài mới**, không làm bài cũ dễ hơn |
| Sân luyện tự do (sandbox) | Xong chặng 2 | Chơi nghịch, tự dựng sân, chia sẻ mã sân |
| Bảng xếp hạng lớp | Hạng A + Hardcore | Chỉ trong lớp, không toàn cầu ở mùa 1 |

Tiến độ lưu cục bộ (`localStorage`, mã phiên ẩn danh) theo QĐ-029; telemetry ghi: số lần chạy mỗi bài, mã chẩn đoán gặp phải, có dùng gợi ý, **có qua sân ẩn ngay lần đầu hay không**, thời gian tới lần chạy đầu, có muốn chơi tiếp. Chỉ số "qua sân ẩn ngay lần đầu" là **thước đo học thật** của dòng này — hơn hẳn "hoàn thành bài".

---

## 10. Danh sách màn hình tối thiểu — **[đề xuất]**

| # | Màn | Nội dung chính |
|---|---|---|
| 1 | Sân đấu | Sân vẽ theo ô, robot, hoạt cảnh từng tick; thanh Chạy / Tạm dừng / Tua / Chạy lại / tốc độ |
| 2 | Khay lệnh | Thẻ lệnh đã mở, thẻ nhiễu, khe tham số |
| 3 | Khung chương trình | Danh sách thẻ có thụt lề; đổi sang bản gõ tay (Hardcore) |
| 4 | Bảng trạng thái | `x, y, huong, pin, tui, tick` + biến người chơi tạo, đổi theo tick |
| 5 | Bảng chẩn đoán | Mã chẩn đoán + lời nhân vật + nút "chạy lại từ tick này" (rất hữu ích khi gỡ lỗi) |
| 6 | Bảng kết quả | Hạng A/B/C, bảng sân ẩn đã qua/chưa qua (không lộ bố cục) |
| 7 | Sổ tay | Kiến thức Python theo chặng (tương ứng sổ chị Linh của dòng SQL) |
| 8 | Hồ sơ kỹ thuật | Bản vẽ sân, thông số, dữ kiện đo được ngoài đời |
| 9 | Review chiến thuật | Code đội bạn + khuôn dựng sân phản ví dụ (§7) |
| 10 | Xưởng (tuỳ chọn) | Sơn/decal, chọn robot, sandbox |

Dùng lại **phần kể chuyện dùng chung** (bản đồ, hội thoại, sổ tay, hồ sơ, mã đề, tiến độ) — chỉ màn 1–4, 9 là phần giải đố mới phải viết (vũ trụ §8.1/§8.2).

---

## 11. Từ vựng đối chiếu với dòng SQL

Giữ được nhiều thứ dùng chung thì đỡ phải nghĩ lại; bảng này để hai dòng nói cùng một thứ tiếng:

| Dòng SQL | Dòng Robotics | Dùng chung được? |
|---|---|---|
| Hồ sơ (thông tin vụ) | Hồ sơ kỹ thuật (bản vẽ sân) | Giao diện, khác dữ liệu |
| Sổ tay (kiến thức SQL) | Sổ tay (kiến thức Python) | **Có** |
| Bàn làm việc + giấy nhớ | **Bàn lệnh** + thẻ lệnh | Khung, khác thẻ |
| Chip dữ kiện | Chip tham số | **Có** (cùng cơ chế) |
| Vật chứng = kết quả truy vấn | Bằng chứng = bản ghi chạy | Giao diện, khác dữ liệu |
| Mã đề | Mã sân | **Có** |
| Buổi giải trình | Review chiến thuật | Khung màn, khác luật |
| Thanh uy tín | Uy tín đội | **Có** |
| Mã chẩn đoán | Mã chẩn đoán | **Có** (khác bộ mã) |
| Câu hô "Số liệu đây!" | "Chạy thử là biết!" | Cơ chế hiệu ứng |
| Hạng S/A/B/C | Hạng A/B/C | **Có** |

**Chưa làm chung:** API/kiến trúc chia sẻ giữa các dòng (vũ trụ §8.1 nói tách phần kể chuyện khỏi phần giải đố, nhưng `prototype-scope-down-v0.1.md` mục "Ngoài phạm vi" chốt: **không** thiết kế API chung cho Python robot ở giai đoạn này). Bảng trên là để **không đặt tên lệch**, không phải để bắt tay vào code chung.

---

## 12. Bất biến kỹ thuật và cách kiểm — **[đề xuất]**

Theo đúng lối dòng SQL (QĐ-012 "bất biến số dòng" có test bảo vệ; §12.1 "mỗi khuôn đề chạy 1.000 mã đề"):

| # | Bất biến | Cách kiểm |
|---|---|---|
| 1 | **Tất định:** cùng `(ma_san, chuong_trinh)` → cùng bản ghi chạy | Chạy 1.000 lần, so bản ghi |
| 2 | **Chạy được bằng Python thật:** mọi chương trình hợp lệ trong game cho **cùng kết quả** khi chạy bằng CPython thật (ngoài trình duyệt, với thư viện lệnh giả lập) | Bộ đối chiếu: N chương trình mẫu × M sân, so bản ghi hai nhân |
| 3 | **Mọi bài đều có lời giải trong tập lệnh đã mở** | Chạy lời giải mẫu trên 500 mã sân, phải qua 100% |
| 4 | **Sân ẩn phải làm trượt lời giải "đường cứng"** (§4.5) | Sinh lời giải ghi cứng, xác nhận trượt trên ≥1 sân ẩn |
| 5 | **Không treo máy:** mọi chương trình đều kết thúc trong ngân sách, kể cả `while True` | Test với 10 chương trình lặp vô tận |
| 6 | **Không lộ đáp án:** bảng kết quả không nêu bố cục sân ẩn | Test chữ hiển thị |

Bất biến 2 là quan trọng nhất về mặt dạy học: nó là hàng rào chống việc "dạy một thứ giống Python nhưng không phải Python".

---

## 13. Chạy code bằng gì — **[đề xuất, cần user chốt]**

Vũ trụ §8.2 ghi "Chạy: Pyodide". Ba phương án:

| | A. Pyodide (CPython WASM) | B. Nhân chạy tự viết (subset Python) | C. A trước, B dự phòng |
|---|---|---|---|
| Là Python thật | Có, 100% | Gần đúng | Có |
| Nặng | ~6–12 MB tải lần đầu, khởi động vài giây | Nhẹ, chạy ngay | Như A |
| Ngắt vòng lặp vô tận | Phải kill Web Worker rồi nạp lại (chậm) | Ngắt tức thời | Như A |
| Chẩn đoán (mã chẩn đoán §4.4) | Lấy từ exception + traceback của Python, phải ánh xạ dòng → thẻ | Tự sinh, chính xác và dễ dịch tiếng Việt | Như A |
| Công sức | Thấp | Cao (phải viết parser + kiểm ngữ nghĩa) | Thấp trước, cao sau |

**Đề xuất: A, và giữ cửa cho B** — bằng cách tách **nhân mô phỏng** (sân, tick, luật, bản ghi — tài sản thật của sản phẩm) khỏi **nhân chạy code**, chỉ nối với nhau qua một giao diện: *chạy chương trình trên sân X → bản ghi chạy*. Nhân mô phỏng viết bằng TypeScript; nhân chạy code là Pyodide trong Web Worker, gọi ngược vào API lệnh. Khi đó đổi A ↔ B chỉ là thay ruột một tầng, không viết lại game.

Việc phải xử lý riêng khi dùng A:
1. **Tải lười**: chỉ nạp Pyodide khi người chơi bấm Chạy lần đầu (hoặc lúc mở bài), có thanh tiến trình và câu thoại của Khánh che thời gian chờ.
2. **Ngân sách lệnh** đặt ngay trong API lệnh (mỗi lệnh cộng một biến đếm, vượt thì `raise`) — bắt được gần hết vòng lặp vô tận.
3. **Chó canh (watchdog)** cho `while True: pass` — kill worker, nạp lại, báo `infinite-loop`. Đây là trường hợp tốn vài giây, chấp nhận được vì hiếm.
4. **Sân ẩn chạy không hoạt cảnh** nên rất nhanh; chạy cùng worker, không nạp lại.
5. **Ảnh hưởng tài liệu:** nếu giữ A thì §8.2 của tài liệu vũ trụ không phải sửa; nếu sau này đổi sang B thì phải sửa §8.2 và mục này.

---

## 14. MVP và buổi thử nghiệm — **[đề xuất]**

**Phạm vi MVP** (cắt theo đúng cách dòng SQL cắt: một đoạn ngắn, đo được):

- **Chặng 1 cắt còn 3 bài** + 1 màn review ngắn (1 nhịp, có dựng sân phản ví dụ đơn giản) + đoạn mở đầu truyện ~10 phút.
- Có sân ẩn (2 sân/bài) và hạng A/B/C.
- Có Bàn lệnh **và** nút "chép sang bản gõ tay".
- Chưa có: mã sân, sandbox, trang trí robot, bảng xếp hạng, chặng 2–6.

**Buổi thử nghiệm** (mượn khuôn `docs/prototype/prototype-scope-down-v0.1.md` §9 của dòng SQL): 6–8 người **chưa từng học lập trình** (học sinh cuối cấp hoặc SV năm 1 ngành khác), chơi 30–40 phút, có người quan sát.

**Thí nghiệm quan trọng nhất — chia hai nhóm:**

| Nhóm | Chơi bằng | Câu hỏi cần trả lời |
|---|---|---|
| 1 | Bàn lệnh (kéo thả thẻ) | Có hiểu vòng lặp không, hay chỉ kéo cho xong? |
| 2 | Gõ tay thẳng từ bài 1 | Có bỏ cuộc vì cú pháp không? |

Sau buổi chơi, **cho cả hai nhóm gõ lại một chương trình ngắn ra giấy** (không có thẻ). Nếu nhóm 1 gõ được tương đương nhóm 2 → thẻ không gây hại, giữ nguyên thiết kế. Nếu nhóm 1 kém hơn rõ → đẩy cầu nối ở §5.3 lên sớm hơn (bắt buộc chép sang bản gõ tay ở bài 3 trở đi).

Câu hỏi đo khác: qua sân ẩn ngay lần đầu (%), số lần chạy mỗi bài, mã chẩn đoán gặp nhiều nhất, có bấm "Chạy lại từ tick này" không, có muốn chơi chặng 2 không.

---

## 15. Ngoài phạm vi mùa 1

- Vật lý thật (quán tính, bánh xe, cảm biến khoảng cách, đường cong).
- Nhiều robot cùng lúc, đấu đối kháng thời gian thực, PvP.
- OOP (class), `import`, thư viện ngoài, tệp, `try/except`, chuỗi và từ điển.
- API/kiến trúc dùng chung với dòng SQL (theo `docs/prototype/prototype-scope-down-v0.1.md`).
- Bảng xếp hạng toàn cầu, tài khoản, lớp học cho giáo viên (để sau MVP).
- Trí tuệ nhân tạo cho robot, robot tự học.

---

## 16. Nếu user chốt, phải sửa những tài liệu nào

| Tài liệu | Sửa gì |
|---|---|
| `docs/lich-su-quyet-dinh.md` | Ghi các QĐ mới (QĐ-096 trở đi) theo danh sách §17 |
| `docs/thiet-ke/vu-tru-chan-hung-tong-quan.md` §4.3 | Thay phần tóm tắt bằng bản đầy đủ: lưới + tick, ba hạng, bàn lệnh có thẻ là chữ Python, review 4 nhịp, mã sân |
| `docs/thiet-ke/vu-tru-chan-hung-tong-quan.md` §8.2 | Nếu chốt phương án B hoặc C ở §13 thì sửa ô "Chạy" của cột Python robot |
| `docs/thiet-ke/vu-tru-chan-hung-tong-quan.md` §5 | Thêm **tên đội trưởng đội bạn** vào bảng nhân vật khi đã đặt tên |
| `nhan-vat.yaml` (đặc tả nội dung §4) | Thêm nhân vật mới của dòng này (đội trưởng đội bạn, nếu có thêm ai) |
| `README.md` | Thêm tài liệu này vào bản đồ repo |
| `docs/prototype/prototype-scope-down-v0.1.md` | Chỉ khi bắt tay làm prototype — hiện chưa |

---

## 17. Điểm cần user chốt (sẽ thành QĐ-096 trở đi)

| # | Câu hỏi | Đề xuất của người soạn |
|---|---|---|
| 1 | Mô hình sân lưới + chạy theo tick? | **Có** — vì chấm được, nhìn ra nhân quả, hợp người mới |
| 2 | Pin là ràng buộc chính hay chỉ chống lạm dụng? | Phụ ở chặng 1–3 (chỉ để thấy pin tụt), **chính** từ chặng 4 |
| 3 | Chạy code bằng gì? (§13) | **A — Pyodide**, tách nhân mô phỏng khỏi nhân chạy code để sau này đổi được |
| 4 | Thẻ lệnh in chữ Python hay chữ tiếng Việt? (§5.2) | **Chữ Python là chính**, tiếng Việt là dòng phụ |
| 5 | Mở Hardcore từ lúc nào? | Sau chặng 1, đổi qua lại tự do |
| 6 | Mùa 1 mấy chặng, mỗi chặng mấy bài? | **6 chặng × 3–5 bài** |
| 7 | Nâng cấp robot: hình thức hay có chức năng? | **Chỉ hình thức + mở cảm biến**, tuyệt đối không buff chỉ số |
| 8 | Có sandbox & chia sẻ mã sân không? | **Có**, từ chặng 2 — đây là móc lan truyền |
| 9 | Tên đội trưởng đội bạn (canon chưa có)? | Cần user đặt; phải vào `nhan-vat.yaml` |
| 10 | Ai là người hướng dẫn chính? | **Khánh** (dạy bằng kinh nghiệm, hợp tuyến chuộc lỗi); Hà Vy và thầy Khải vào theo tình huống |

---

## 18. Việc tiếp theo

1. **User chốt §17** → ghi QĐ-096 trở đi vào `docs/lich-su-quyet-dinh.md`.
2. **Mockup HTML tĩnh** một bài (sân 5×5 + khay thẻ + khung chương trình + nút Chạy) để sờ tận tay trước khi viết engine — đúng thói quen `docs/mockups/` của repo.
3. Sau mockup mới tới: kịch bản chặng 1 (Markdown theo đặc tả QĐ-075), danh sách asset tối thiểu, rồi mới tới prototype.
