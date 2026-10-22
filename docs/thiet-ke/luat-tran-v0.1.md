# Luật trận v0.1 — bản tối giản để kiểm chứng

> **Mục đích duy nhất của bản luật này:** kiểm chứng được **đội nào thắng, đội nào thua**, bằng máy.
> Cố ý **KHÔNG** có: part, trần (khối lượng / kích thước / ngân sách), K.O., điểm thưởng, phạt,
> quản lý đội, mã sân, đối kháng va chạm.
>
> Đây là **cái sàn** để code máy check lên trên. Luật đầy đủ (2 robot, part, trần mềm) làm sau,
> khi cái sàn này đã chạy và có test.

---

## 1. Sân

- Lưới **9 × 7** (9 cột `x = 0..8`, 7 hàng `y = 0..6`).
- **Đối xứng qua cột giữa `x = 4`**: khối và ô xuất phát đều có ảnh gương qua trục này.

## 2. Robot — một loại duy nhất, không có gì đặc biệt

- Mỗi đội **một robot giống hệt nhau**. Không part, không chỉ số, không nâng cấp.
- Xuất phát: **A ở `(0,3)` quay Đông**, **B ở `(8,3)` quay Tây** (đối xứng).
- Ô đích của mỗi đội **chính là ô xuất phát của đội đó** ("nhà").

**Bộ lệnh — hết, không hơn:**

| Lệnh | Việc | Tick |
|---|---|---|
| `move(n)` | Đi `n` bước theo hướng đang quay | mỗi bước 1 |
| `turn_left()` / `turn_right()` | Quay tại chỗ | 1 |
| `pick()` | Nhặt khối ở ô đang đứng (nếu có và tay đang trống) | 1 |
| `drop()` | Thả khối đang cầm xuống ô đang đứng | 1 |
| `go_to(x, y)` | **Hàm thư viện của đội**: đi thẳng tới ô `(x,y)` | mỗi bước quay/đi 1 |

**Không có cảm biến.** Hệ quả quan trọng: chương trình **không rẽ nhánh theo việc nhặt được hay không** —
nó là một **lộ trình cố định**. Nhờ vậy lộ trình của hai đội tính độc lập được với nhau (§6).

## 3. Khối và cách tính điểm

- **6 khối**, thành **3 cặp đối xứng**, không khối nào nằm trên trục giữa:
  `(3,1) (5,1)`, `(3,3) (5,3)`, `(3,5) (5,5)`.
- **Mỗi khối mang về "nhà" bằng `drop()` = 1 điểm.** Không có điểm nào khác.
- Thả khối ở chỗ không phải nhà thì khối **rơi lại sân** tại ô đó (vẫn nhặt lại được) — không mất điểm,
  không bị phạt. Đây là hệ quả tự nhiên, không phải luật riêng.

## 4. Kết thúc và thắng thua

- **Trận kết thúc** khi: **hết khối trên sân** (cả 6 đã về nhà) **hoặc cả hai chương trình đã chạy xong**.
- **Thắng = nhiều điểm hơn. Bằng điểm = hòa.**
- Đang cầm khối mà chương trình kết thúc thì khối đó **không tính điểm**.
- **Không có điều kiện thắng đặc biệt nào khác.**

## 5. Tranh chấp

- Hai robot **được phép đứng chung một ô** (chưa có luật va chạm).
- Ai `pick()` **trước theo tick** thì được khối. **Cùng tick mà cùng giành một khối** thì
  **khối bên nửa sân nào thì đội nửa đó được** (`x < 4` → A, `x > 4` → B). Luật này đối xứng,
  nên không thiên vị bên nào.

## 6. Bảo hiểm — KHÔNG phải luật

Chỉ để máy không treo, và **không ảnh hưởng kết quả**:

- Hạn lệnh mỗi chương trình (chống `while True`).
- Hạn tick an toàn cho cả trận.
- Vượt hạn → ghi **chẩn đoán**, chương trình đó dừng. Điểm đã giao **vẫn được tính**.

## 7. Điều kiện "pass" của bước này

Bước này **đạt** khi máy check chứng minh được cả 6 điều:

| # | Điều phải chứng minh | Vì sao cần |
|---|---|---|
| 1 | **Sân đối xứng** (kiểm bằng code) | Không thiên vị bên nào |
| 2 | **Tất định**: chạy lại cho cùng kết quả | Bản ghi phải phát lại được |
| 3 | **Logic đối xứng → hòa** | Chứng minh sân không thiên vị |
| 4 | **Hai logic khác nhau → kết quả khác nhau** | Đây là điều user yêu cầu: *"mô phỏng ra được khác nhau là pass"* |
| 5 | **Đổi chỗ hai logic → điểm đảo** | Chứng minh kết quả do **logic**, không do bên |
| 6 | **Bảo toàn khối** (điểm + còn trên sân + đang cầm = 6) | Không sinh mất vật chất |

---

## 8. Cái cố ý để sau (KHÔNG làm ở bước này)

Part · trần cứng · trần mềm · robot thứ hai · bàn giao · va chạm · K.O. · điểm thưởng · phạt ·
quản lý đội · đối thủ ẩn · mã sân · thư viện hàm nhiều hàm · sổ tay.

---

## 9. Kết quả đã kiểm chứng (10/10/2026)

Code: `tran/tran-dau.js` (nhân trận + máy chấm) · `tran/chuong-trinh.js` (các logic) ·
máy check: `node tran/kiem-tran-dau.mjs` → **21/21 đạt**.

**Cùng một robot, cùng một sân, khác logic → khác kết quả:**

| Cặp logic đem ra đấu | Kết quả | Vì sao |
|---|---|---|
| "lấy hết" vs **bản gương của nó** | **3–3 hòa** | Lộ trình đối xứng → chứng minh sân không thiên vị |
| "lấy hết" vs "chỉ lấy hai khối giữa" | **5–1** | Bỏ khối thì mất điểm; cả hai đội đều giao được khối |
| "lấy hết" vs "cướp bên kia trước" | **6–0** | Cướp xa nhà → tới muộn ở **mọi** khối |
| "cướp" vs "hai khối giữa" | **4–2** | Hai chiến thuật khác nhau, cùng có điểm |

Bốn cặp → **bốn kết quả khác nhau**. Đây là bằng chứng máy kiểm được cho ý *"cùng part, khác logic"*:
robot giống hệt nhau, sân đối xứng, và kết quả do **đoạn code** quyết định.

**Điều máy đã chứng minh được (không phải lời hứa):**

1. Sân đối xứng (kiểm bằng code) · 2. Tất định (3 lần chạy giống nhau, kể cả bản ghi) ·
3. Logic đối xứng → hòa (cả ba logic) · 4. Hai logic khác nhau → kết quả khác nhau ·
5. **Đổi chỗ hai logic → điểm đảo** (5–1 thành 1–5) → sân không thiên vị ·
6. **Bảo toàn khối**: điểm + còn trên sân + đang cầm = 6, ở mọi trận ·
7. Chương trình lặp vô tận bị chặn, trận vẫn kết thúc và vẫn có kết luận ·
8. **Lộ trình độc lập**: nhật ký hành động của A không đổi dù đối thủ là ai — đây là tính chất
   khiến mô phỏng không cần chạy song song thật mà vẫn đúng.

### Phát hiện về thiết kế (quan trọng cho bước sau)

Trên sân **đối xứng tuyệt đối** với **robot giống hệt nhau**, hai chiến thuật "đều tốt như nhau"
sẽ **luôn hòa** — vì mỗi bên lấy nửa sân mình. Muốn có thắng thua thì **phải có khác biệt về
hiệu quả lộ trình**, và khi đó kết quả thường **lệch hẳn** (5–1, 6–0) chứ không sít sao.

→ Hệ quả cho bước sau: nếu muốn trận đấu **sít sao và căng**, thì khác biệt phải đến từ
**luật của đề** (giới hạn vùng, thứ tự bắt buộc, nhiệm vụ phụ) chứ không chỉ từ việc ai viết code
gọn hơn. Đây là lý do kỹ thuật để Robocon thật **đổi đề mỗi năm**.

