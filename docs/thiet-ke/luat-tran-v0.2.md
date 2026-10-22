# Luật trận v0.2 — hai robot, bàn giao bắt buộc

> Nối tiếp [luật trận v0.1](luat-tran-v0.1.md). v0.1 là **cái sàn** (1 robot, không cảm biến,
> thắng = nhiều điểm hơn). v0.2 thêm **robot thứ hai và bàn giao** — thứ mà Robocon thật gọi là
> *"hai robot phải ăn nhịp"*.
>
> Vẫn **không** part, **không** trần, **không** điều kiện thắng đặc biệt. Chỉ thêm đúng hai thứ:
> robot thứ hai, và luật buộc hai robot phải phối hợp.

---

## 1. Ba thay đổi so với v0.1, và vì sao cả ba đều bắt buộc

| # | Thay đổi | Vì sao không thể bỏ |
|---|---|---|
| 1 | Mỗi đội **2 robot**: `R1` đi lấy khối, `R2` giao hàng | Đây là cấu trúc của Robocon thật |
| 2 | Có **cảm biến** → chương trình **rẽ nhánh** | Muốn phối hợp thì phải *hỏi* được đồng đội/ô đất đang thế nào |
| 3 | **Bàn giao bắt buộc**: khối chỉ tính điểm nếu đã qua **trạm giao** | Nếu không, đội chỉ cần một robot làm hết — mất hẳn bài học phối hợp |

**Hệ quả kỹ thuật của thay đổi số 2 (quan trọng nhất):** ở v0.1, chương trình không rẽ nhánh nên
lộ trình hai đội **độc lập**, tính riêng rồi gộp được. Có cảm biến là hết: phải **chạy bốn chương
trình song song thật theo tick**. Vì vậy nhân chạy code đã được chuyển sang dạng **generator**
(`chayCodeGen`) — mỗi lần chương trình gọi một lệnh thì nó *nhường quyền* ra ngoài, bên ngoài thực
hiện đúng một hành động rồi cho chạy tiếp. Bản chạy thẳng cũ (`chayCode`) vẫn giữ nguyên nên toàn
bộ test cũ không đổi.

---

## 2. Sân

Lưới **11 × 7**, đối xứng qua cột `x = 5`.

| Thứ | Đội A | Đội B |
|---|---|---|
| Nhà (ô giao hàng) | `(0,3)` | `(10,3)` |
| Trạm giao | `(3,3)` | `(7,3)` |
| `R1` xuất phát | `(2,3)` quay Đông | `(8,3)` quay Tây |
| `R2` xuất phát | `(1,3)` quay Đông | `(9,3)` quay Tây |
| Khối (4 cái, 2 cặp đối xứng) | `(4,1) (4,5)` | `(6,1) (6,5)` |

**Vùng giữa `4 ≤ x ≤ 6`: chỉ `R1` được vào.** `R2` đi vào sẽ bị chặn (vẫn tốn tick, có chẩn đoán).
Đây là luật mượn từ Robocon 2021 (một robot chỉ được ở ngoài sân) — và nó là thứ **buộc** phải bàn giao.

---

## 3. Lệnh, cảm biến, và "thư viện hàm của đội"

| Loại | Tên | Tick |
|---|---|---|
| Hành động | `move(n)` · `turn_left()` · `turn_right()` · `pick()` · `drop()` · `wait()` | 1 mỗi bước |
| Cảm biến | `pos_x()` · `pos_y()` · `huong()` · `item_here()` · `dang_cam()` | **0** (hỏi thì trả lời ngay) |

`pick()` trả về **1 nếu nhặt được, 0 nếu hụt** — để chương trình rẽ nhánh theo kết quả thật.

**Thư viện hàm của đội** (`THU_VIEN`, chèn trước bài của người chơi, viết bằng chính Python):

```python
def quay_ve(h):            # h: 0 Bắc · 1 Đông · 2 Nam · 3 Tây
    while huong() != h:
        turn_right()

def go_to(x, y):           # đi thẳng tới ô, mỗi bước 1 tick
    ...
```

`go_to` là **thư viện**, không phải lệnh gốc — nên người chơi viết lại được, và code của họ phải
trả giá đúng bằng số bước đi.

---

## 4. Bàn giao, và luật một khối một ô

- `R1` lấy khối ở vùng giữa → mang về **trạm giao** → `drop()`.
- `R2` tới trạm → `pick()` → mang về **nhà** → `drop()` → **1 điểm**.
- **Chỉ `R2` giao ở nhà mới tính điểm.** `R1` tự mang khối về nhà thì khối **rơi lại sân**, không điểm.
- **Mỗi ô chỉ chứa được 1 khối.** `drop()` vào ô đã có khối thì **không thả được** (vẫn giữ khối)
  → đây chính là chỗ tạo ra *"ăn nhịp"*: `R1` phải **chờ** `R2` dọn trạm.

## 4.5. Tranh chấp: hai robot giành một khối trong CÙNG MỘT TICK

**Luật:** khối bên nửa sân nào thì **đội nửa đó được** (`x < 5` → A, `x > 5` → B). Khối nằm **đúng trục giữa**
thì **không ai được** — và thiết kế sân **cấm đặt khối trên trục** (có test canh).

**Vì sao phải có luật này:** cách làm cũ xử theo *thứ tự robot trong tick* (`A-R1` trước `B-R1`) nên
**thiên vị đội A**. Luật mới **không phụ thuộc thứ tự** — có test chứng minh: đảo thứ tự trong mảng vẫn ra
cùng kết quả.

**Cách máy làm:** mỗi tick, cả bốn robot **gom yêu cầu hành động lại trước**, rồi mới giải quyết một lượt
(đi/quay/chờ → thả → nhặt). Nhờ vậy mới so được ai cùng nhặt một ô.

## 5. Kết thúc và thắng thua — hai tầng, đừng lẫn

| Tầng | Con số | Tính chất | Khi chạm |
|---|---|---|---|
| **Đồng hồ trận** | **1800 tick** (1 tick ≈ 0,1 giây → 3 phút) | **LUẬT** — mọi trận Robocon thật đều có | Dừng **bình thường**, `het-gio`, thắng thua theo điểm |
| **Hạn an toàn** | 4000 tick | **KHÔNG phải luật** — chỉ để máy không treo | `het-han`, robot còn chạy bị đánh dấu `qua-tick` |

- Trận kết thúc sớm khi **cả 4 khối đã giao** (`het-khoi`) hoặc **cả bốn chương trình chạy xong** (`xong-het`).
- **Thắng = nhiều điểm hơn. Bằng điểm = hòa.**

(Lẫn hai tầng này là lỗi tôi đã mắc: lần đầu tôi ghi "hết hạn" cho một trận chỉ chạy 38 tick.)

---

## 6. Kết quả đã kiểm chứng (10/10/2026)

Code: `tran/tran-dau.js` (mục v0.2) · `tran/chuong-trinh.js` (các logic) ·
máy check: `node tran/kiem-tran-v02.mjs` → **38/38 đạt**. Ba bộ test cũ vẫn xanh
(74 + 33 + 21) — tổng **166 phép kiểm**.

**Cùng robot, cùng sân, khác logic → khác kết quả:**

| Cặp logic | Kết quả | Kết thúc |
|---|---|---|
| "ăn nhịp" vs **bản gương của nó** | **2–2 hòa** | giao hết khối, tick 39 |
| "ăn nhịp" vs "giao **1** chuyến rồi thôi" | **2–1** | hết đồng hồ trận |
| "ăn nhịp" vs "**R2 không bao giờ tới trạm**" | **2–0** | hết đồng hồ trận, `R1` đội B còn cầm khối |
| "**R1 tự mang về nhà**" vs bản gương | **0–0** | cả hai chạy xong |
| hai `R1` cùng nhặt `(6,1)` ở **cùng tick** | **B được khối** | luật công bằng, không theo thứ tự robot |

**Điều máy đã chứng minh:**

1. Sân và vai đối xứng · 2. **Chạy song song thật**: mỗi tick mỗi robot **đúng một hành động**
   (kiểm bằng khoảng cách ≤ 1 ô giữa hai khung liên tiếp) · 3. Tất định · 4. Logic đối xứng → hòa ·
5. Hai logic khác nhau → kết quả khác nhau, **cả hai đội đều ghi điểm** ·
6. **Bàn giao bắt buộc**: `R1` tự mang về nhà → 0 điểm, mà khối vẫn bảo toàn ·
7. **R2 không tới trạm → dây chuyền đứng**: `R1` cầm khối đứng chờ tới hết giờ ·
8. **Luật vùng**: `R2` bị chặn khỏi vùng giữa, `R1` vào được ·
9. **Đồng hồ trận là luật, hạn an toàn thì không**: hết giờ thì robot treo **không** bị coi là lỗi;
   ép hạn an toàn xuống 50 tick thì mới có `het-han` + `qua-tick` ·
10. **Tranh chấp cùng tick công bằng**: `(6,1)` là nửa sân B → **B được**, không theo thứ tự robot.

**Một lỗi đã bắt được trong lúc làm (đáng ghi):** sau khi tách luật công bằng ra ngoài hàm, tôi so
**yêu cầu** với **robot** (`yc === thang`) nên **mọi lượt nhặt đều trượt** — mà test cũ vẫn xanh
vì trận khi đó vô tình vẫn ra 0–0. Chỉ khi thêm test "hai `R1` cùng nhặt một khối" thì lỗi mới lộ.
Bài học: **test phải chạm đúng ca tranh chấp**, không chỉ ca đường thẳng.

### Phát hiện về thiết kế — và nó bổ sung cho phát hiện của v0.1

v0.1 kết luận: sân đối xứng + robot giống nhau ⇒ muốn có thắng thua thì phải khác **hiệu quả lộ trình**,
và khi đó kết quả **lệch hẳn** (5–1, 6–0).

v0.2 cho thấy **bàn giao sửa được chính chỗ đó**: kết quả trở nên **sít sao** (2–1, 2–0) vì
**trạm giao là một nút cổ chai** — đội dẫn đầu không thể bứt xa, vì muốn lấy khối tiếp thì phải chờ
`R2` dọn trạm. Đây chính là cơ chế khiến Robocon thật căng: **không phải ai nhanh hơn, mà là ai giữ nhịp**.

Và nó tạo ra **kiểu thua mới**: không phải chạy chậm, mà là **dây chuyền đứng** — `R2` lệch nhịp thì
`R1` kẹt, cả đội không giao được gì (2–0). Đúng lời đội CĐ Công nghiệp Huế ở
[tham-khao-robocon](tham-khao-robocon-v0.1.md) §4.1.

---

## 7. Đơn giản hoá đã biết (phải trả nợ ở bước sau)

| # | Chuyện | Hiện tại |
|---|---|---|
| 1 | Hai robot **đứng chung một ô** | Cho phép, chưa có luật va chạm |
| 2 | Cảm biến | Chưa có "đồng đội đang ở đâu", chưa có "khối đang được ai giữ" — `R1` phải **mò** bằng `item_here()` |
| 3 | Khối trên trục giữa | Bị cấm bằng thiết kế + test; nếu ai đó đặt vào thì cùng tick sẽ **không ai lấy được** (kẹt, hạn an toàn bắt) |
| 4 | Đồng hồ trận | 1800 tick cố định. Chưa có luật kiểu Robocon 2025 (vòng loại 120 giây / loại trực tiếp 160 giây) |
| 5 | `go_to` trong thư viện | Luôn quay phải từng bước một, nên **quay 3 lần** khi chỉ cần quay trái 1 lần — cố ý để lộ ra bài học tối ưu, nhưng cần nói rõ cho người chơi |

**Đã trả xong ở bản này:** luật tranh chấp cùng tick (trước thiên vị A) · tách đồng hồ trận khỏi hạn an toàn.

## 8. Cái cố ý để sau

Part · trần cứng · trần mềm · bàn giao nhiều bước · va chạm · K.O. · điểm thưởng · phạt ·
quản lý đội · đối thủ ẩn · mã sân.
