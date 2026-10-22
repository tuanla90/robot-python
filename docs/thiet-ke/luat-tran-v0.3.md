# Luật trận v0.3 — một khe chọn đề

> Nối tiếp [luật v0.2](luat-tran-v0.2.md) (2 robot, bàn giao, chạy song song).
> v0.3 thêm **đúng một thứ**: một **khe chọn đề** — chỗ mà trước đây tôi định làm "part"
> như một hệ thống tài sản (mua, nâng cấp, sưu tầm).
>
> **Đổi hướng theo việc đã tra Robocon:** trong thể thao thật, **trần giống nhau cho mọi đội, mọi năm**
> ([tham-khao-robocon](tham-khao-robocon-v0.1.md) §5.4). Nên "part" ở đây là **ràng buộc của đề**,
> không phải tài sản: **hai đội chọn từ cùng một bộ phương án, không ai mua gì.**

---

## 1. Khe chọn đề là gì

Mỗi trận có **một khe**; mỗi khe có **2 phương án**; mỗi đội chọn một phương án **trước khi viết code**.
Chọn xong thì **khay hàm đổi theo** — đây là chỗ "part mở API" thành luật.

| | `TAY_DAI` (tay gắp dài) | `CHAN_NHANH` (chân nhanh) |
|---|---|---|
| **THÊM được** | `pick()` gắp được khối ở **ô trước mặt**, không cần đứng đúng ô | mọi hành động **1 tick** |
| **BỎ đi** | **tốc độ**: mỗi **bước đi** tốn **2 tick** (quay và gắp vẫn 1 tick) | **cảm biến `item_here()`** — robot **MÙ**, phải chạy theo lịch cố định |
| Cảm biến còn lại | đủ (`item_here`, `pos_x`, `pos_y`, `huong`, `dang_cam`) | `pos_x`, `pos_y`, `huong`, `dang_cam` |
| Hình dạng chương trình | hỏi rồi mới làm (`while not item_here(): wait()`) | **đếm tick theo lịch**, không hỏi được gì |

**Trần không tăng:** không có hạn riêng nào theo phương án. Đồng hồ 1800 tick, hạn an toàn 4000, sân 11×7 —
**giống nhau cho cả hai phương án và cả hai đội** (có test canh).

---

## 2. Ba luật bắt buộc, và cách máy kiểm

| # | Luật | Máy kiểm bằng gì |
|---|---|---|
| 1 | Mỗi phương án **BỎ một khả năng và THÊM một khả năng** | Đếm hàm trong khay: `TAY_DAI` hơn `CHAN_NHANH` **đúng 1** hàm; và `pick` ô trước mặt chỉ `TAY_DAI` có |
| 2 | Mỗi phương án **ĐỔI HÌNH DẠNG bài toán**, không chỉ đổi con số | Chương trình dùng `item_here()` chạy dưới `CHAN_NHANH` → **`locked-command`**; chương trình **mù** chạy được ở **cả hai** nhưng chậm hơn dưới `TAY_DAI` |
| 3 | **Không phương án nào trội** trên mọi đề | Hai đề khác nhau, **mỗi đề một bên thắng** (§3) |

---

## 3. Kết quả đo (10/10/2026)

Code: `tran/tran-dau.js` (mục v0.3) · `tran/chuong-trinh.js` · công cụ đo `tran/do-v03.mjs` ·
máy check: `node tran/kiem-tran-v03.mjs` → **23/23 đạt**. Bốn bộ test cũ vẫn xanh
(74 + 33 + 21 + 38) — tổng **189 phép kiểm**.

**Hai đề, hai kết quả ngược nhau.** Đo bằng "tick R1 giao khối tới trạm" và "tick giao xong về nhà":

| Đề | `TAY_DAI` | `CHAN_NHANH` | Ai thắng |
|---|---|---|---|
| **"biết trước"** — khối ở `(4,3)`, ngay hàng nhà | tới trạm **10** · xong **20** | tới trạm **7** · xong **15** | **CHAN_NHANH** |
| **"không biết chỗ"** — khối ở `(6,5)`, đề có hai chỗ khả dĩ `(4,1)`/`(6,5)` | **23** · **33** | 25 · 49 | **TAY_DAI** |

Trên đề "không biết chỗ", bên mù **buộc phải đi thử chỗ sai trước** — máy ghi được
`A-R1:pick-hut@4,1` làm bằng chứng.

**Các con số cơ học đã kiểm:**

- Cùng một chuyến (3 bước đi + 4 hành động khác): `TAY_DAI` **10 tick**, `CHAN_NHANH` **7 tick**.
- Đứng ở `(6,4)` quay Nam, khối ở `(6,5)`: `TAY_DAI` **gắp được**, `CHAN_NHANH` **hụt**.
- `item_here()` dưới `CHAN_NHANH` → `locked-command`, lời nhắn nêu rõ tên phương án.
- Một chương trình **mù** chạy được dưới **cả hai** phương án, nhưng chậm hơn dưới `TAY_DAI`.
- Tất định: chạy hai lần, cùng tick, cùng điểm, cùng bản ghi.

---

## 4. Phát hiện về thiết kế

**a) "Part là đề bài" giờ là chuyện máy kiểm được, không phải khẩu hiệu.** Cùng một phương án
**thắng một đề và thua một đề khác** — nên câu hỏi của người chơi không còn là *"tôi có đồ gì"* mà là
***"đề này cần gì"***. Đó đúng là điều user muốn: *khác biệt đến từ cả cứng lẫn mềm, nhưng mọi thứ đều có trần*.

**b) Mất một cảm biến là mất một HÌNH DẠNG chương trình, không phải mất một con số.** `CHAN_NHANH`
không có `item_here()` nên nó **không thể hỏi** — nó phải chạy theo **lịch**. Đó là lý do nó thắng đề
"biết trước" (1 tick/hành động) và thua đề "không biết chỗ" (phải mò). Đây là bài học lập trình thật:
*thiếu cảm biến thì code phải giả định, và giả định thì sai khi mọi thứ không như dự tính.*

> **Ghi chú về con số (đã sửa sau khi đo):** bản đầu tôi cho `TAY_DAI` chậm **1,5× mọi hành động**.
> Đo ra thì nó **thua mọi đề** — lợi thế tay gắp dài không bao giờ bù nổi. Đổi sang **chỉ bước đi mới
> chậm gấp đôi** thì hai phương án mới thật sự chia nhau thắng thua (bảng trên). Bài học: *đánh đổi
> phải được ĐO, không được đoán.*

**c) Trần không tăng theo tiến độ — và giờ nó có răng.** Không có chỗ nào trong luật cho một phương án
nhiều tick hơn, nhiều ô nhớ hơn, hay nhiều hàm hơn phương án kia. Người chơi giỏi lên thì **trần vẫn thế**,
chỉ **dùng trần giỏi hơn**.

---

## 5. Đơn giản hoá đã biết

| # | Chuyện | Hiện tại |
|---|---|---|
| 1 | Ô nhớ chương trình | **Chưa có hạn ô nhớ** trong máy chạy trận, dù GDD §6.2 coi nó là một loại tiền tệ. Đây là món nợ lớn nhất còn lại |
| 2 | Số khe | Mới **một** khe, hai phương án. GDD §4.2 nói 6 khe × 2 robot |
| 3 | Thư viện hàm | Chưa tính vào ô nhớ; chưa có hàm có lỗi (GDD §5.2) |
| 4 | Va chạm, cảm biến đồng đội, đồng hồ theo vòng đấu | Vẫn như v0.2 |

## 6. Bước tiếp có thể làm

- **Hạn ô nhớ chương trình** (món nợ §5.1): đếm ô của chương trình + chi phí hàm thư viện, chặn trước khi chạy
  → mở ra loại đề "ô nhớ hẹp", nơi `CHAN_NHANH` (phải viết dài) gặp bất lợi và `TAY_DAI` (dùng `go_to`) có lợi.
- **Khe thứ hai** (bánh xe: omni vs xích) để thấy hai khe cộng hưởng.
- **Đối thủ ẩn**: hai đội chọn phương án **bí mật**, rồi mới đấu — biến việc chọn thành một nước đi.
