# Luật trận v0.4 — hai khe chọn đề + ô nhớ chương trình

> Nối tiếp [luật v0.3](luat-tran-v0.3.md) (một khe chọn đề). v0.4 thêm **hai thứ**, và **không đổi gì của v0.3**:
> cả 23 phép kiểm của v0.3 vẫn xanh.
>
> 1. **Khe thứ hai · bánh xe** (`OMNI` / `XICH`) — để thấy hai khe **cộng hưởng**.
> 2. **Ô nhớ chương trình** — loại tiền tệ thứ ba của GDD §6.2, từ trước tới nay **chưa có răng**.

---

## 1. Khe thứ hai · bánh xe

| | `OMNI` (bánh omni) | `XICH` (bánh xích) |
|---|---|---|
| **THÊM được** | quay tại chỗ **1 tick** | đi thẳng **1 tick** |
| **BỎ đi** | mỗi **bước đi 2 tick** | mỗi **lần quay 2 tick** |

Bánh xe **không mở hay khoá hàm nào** — khác hẳn khe 1. Nó chỉ đổi **giá của hai hành động rẻ nhất**.
Đo được (một robot, cùng một chương trình):

| Đề | `XICH` | `OMNI` | Ai hơn |
|---|---|---|---|
| **đi thẳng** (2 bước, 0 lần quay) | **3 tick** | 5 tick | `XICH` |
| **nhiều góc** (4 lần quay, 2 bước) | 11 tick | **9 tick** | `OMNI` |

→ **Không bánh nào trội.** Và trong game, màn 5 ("Nhiều góc", đồng hồ 80 tick) biến chuyện này thành
sống còn: **omni về đích ở tick 73 (qua màn), xích hết giờ với 2/3 khối (không qua)**.

**Hai khe cộng hưởng thế nào:** khe 1 quyết định *làm được gì* (với tới đâu, có cảm biến không),
khe 2 quyết định *đi và quay giá bao nhiêu*. Bốn tổ hợp đều chạy được (có test), nhưng
`TAY_DAI + XICH` là tổ hợp nặng nhất (đi 2 tick **và** quay 2 tick), còn `CHAN_NHANH + XICH`
là tổ hợp nhanh nhất — đổi lại **mù**. Đây là lần đầu game có **câu đố trang bị**, không chỉ câu đố code.

---

## 2. Ô nhớ chương trình — và vì sao nó dạy viết hàm

**Cách đếm** (đơn giản, người chơi đếm được bằng mắt):

- **mỗi dòng lệnh là một ô** (dòng trống và dòng chỉ có `#` không tính; dòng thụt lề vẫn là một ô);
- **dùng hàm thư viện nào thì trả ô cho hàm đó**: `go_to` **6 ô**, `quay_ve` **3 ô**.

**Cách chặn:** hạn ô nhớ là của **ĐỀ**, không của phương án. Vượt hạn thì robot **không được nạp**
(`memory-full`), kèm lời nhắn *"Chương trình 37 ô, hạn của đề là 24 ô"* — và robot **đứng yên suốt trận**
(có test kiểm cả ba điều đó).

**Đo được ở màn 4 ("Ô nhớ hẹp", hạn 24 ô, bốn khối):**

| Cách viết | R1 | Vừa hạn? |
|---|---|---|
| **copy-paste** — lặp đường đi cho từng khối | **37 ô** | ✗ `memory-full` |
| **viết hàm** — một `def chuyen(x, y)` rồi gọi bốn lần | **21 ô** | ✓ qua màn |

Chênh **16 ô**, và đó là toàn bộ bài học: *máy chỉ nhớ được từng ấy dòng, nên phần nào lặp lại thì
phải gom thành hàm.* Đây là lần đầu **ô nhớ** — thứ mà GDD §6.2 vẫn coi là một loại tiền tệ —
thật sự **cắn** vào người chơi.

**Trần vẫn không tăng:** không có phương án nào cho thêm ô nhớ. Hạn là của đề, **hai đội cùng hạn**.

---

## 3. Kết quả đã kiểm chứng (10/10/2026)

Code: `tran/tran-dau.js` (mục v0.4) · `tran/tran-game.js` · giao diện `tran/choi-tran.html`.
Máy check: `node tran/kiem-tran-v04.mjs` → **22/22**. Bảy bộ cũ vẫn xanh
(74 + 33 + 21 + 38 + 23 + 38 + 40) — tổng **289 phép kiểm**.

**Năm màn của game, đo bằng chương trình mẫu:**

| Màn | Đề | Khe | `TAY_DAI` | `CHAN_NHANH` |
|---|---|---|---|---|
| 1 · Trận tập | 1 khối `(4,3)` | 1 | qua (27 tick) | qua (39 tick) |
| 2 · Hai cột | 2 khối lệch hàng | 1 | qua (**38**) | qua (60) |
| 3 · Chung kết | 3 khối dựng cột, 400 tick, **K.O.** | 1 | **qua** (3–0) | không qua (2–1) |
| 4 · Ô nhớ hẹp | 4 khối, **hạn 24 ô**, K.O. | 2 | **qua** (4–0) | không qua (1–3) |
| 5 · Nhiều góc | 3 khối chữ chi, 80 tick, K.O. | 2 | `+OMNI` **qua** (73) · `+XICH` không qua | không qua (2–0) |

---

## 4. Phát hiện về thiết kế

**a) "Part là đề bài" giờ có hai chiều và một câu đố trang bị.** Khe 1 đổi *khả năng*, khe 2 đổi *giá*.
Cùng một đề, chọn `TAY_DAI + OMNI` thì qua màn 5, chọn `TAY_DAI + XICH` thì hết giờ — **cùng code, khác đồ**.

**b) Tiền tệ phải cắn được thì mới là tiền tệ.** Ô nhớ nằm trong GDD từ v0.1 nhưng chưa bao giờ chặn ai.
Nay nó chặn, và chặn đúng chỗ cần dạy: **copy-paste vs viết hàm** (37 ô vs 21 ô). Bài học đến từ
**ràng buộc**, không từ lời khuyên.

**c) Trần không tăng — giờ có ba tầng đều không tăng.** tick (khe 2), khả năng (khe 1),
ô nhớ (đề). Không tầng nào nới ra theo tiến độ người chơi; giỏi lên thì **dùng trần giỏi hơn**.

---

## 5. Nợ còn lại

| # | Chuyện | Hiện tại |
|---|---|---|
| 1 | Chi phí ô nhớ của **hàm thư viện** | Cố định (`go_to` 6, `quay_ve` 3). Chưa có hàm **có lỗi** để người chơi phải tự viết lại (GDD §5.2) |
| 2 | Số khe | Mới **2 khe**; GDD §4.2 nói 6 khe × 2 robot |
| 3 | Ô nhớ tính theo **dòng**, không theo **câu lệnh** | Hai câu trên một dòng (`move(1); pick()`) chưa xử lý; chưa có chương trình con lồng nhau |
| 4 | Va chạm · cảm biến đồng đội · đồng hồ theo vòng đấu | Vẫn như v0.3 |

## 6. Bước tiếp có thể làm

- **Hàm thư viện có lỗi** ở một màn: `go_to` đi sai đường → người chơi phải tự viết `di_toi`, và
  **ô nhớ** là cái giá phải trả.
- **Khe thứ ba · cảm biến** (mua tầm nhìn bằng ô nhớ) để ba khe cùng siết.
- **Đối thủ ẩn**: hai đội chọn hai khe **bí mật** rồi mới đấu.
