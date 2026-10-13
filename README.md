# robotics/ — Đội Robot Chấn Hưng · Trận đấu

Đây là **dòng 3** của vũ trụ Chấn Hưng: game dạy Python bằng cách **dẫn đội robot đi thi**.
Thư mục này chứa **nhân trận đấu** (mô phỏng + luật + máy chấm) và **game chơi được**.

---

## Chơi ngay

Mở **`choi-tran.html`** bằng trình duyệt (nhấp đúp là được — không cần build, không cần mạng, không cần cài gì).

**Năm màn, mỗi màn một đề:**

| Màn | Đề | Khe | Điều đáng học |
|---|---|---|---|
| 1 · Trận tập | 1 khối ở `(4,3)`, hàng nhà | 1 | bàn giao hai robot: R1 lấy khối → trạm giao → R2 mang về nhà |
| 2 · Hai cột | 2 khối ở `(4,2)`, `(6,2)` lệch hàng | 1 | đề này **chiều tay gắp dài** |
| 3 · Chung kết | 3 khối dựng cột, đồng hồ 400 tick | 1 | **thắng tuyệt đối** (giao đủ khối); bên **mù** trượt nhịp |
| 4 · Ô nhớ hẹp | 4 khối, **hạn 24 ô nhớ** mỗi robot | 2 | **copy-paste là hết chỗ** → phải viết `def` rồi gọi |
| 5 · Nhiều góc | 3 khối chữ chi, đồng hồ 80 tick | 2 | chọn **bánh xe** sai là hết giờ |

**Cách chơi:** chọn phương án cho từng khe → bấm **Nạp mẫu (bản gọn)** (hoặc tự viết) → **▶ Chạy trận**
→ xem phát lại từng tick trên sân → đọc kết quả, ô nhớ, và bảng chẩn đoán. Tiến độ lưu lại.

Bấm **📝 Cách chơi** trong game để đọc luật đầy đủ.

### Hai khe chọn đề (part là **đề bài**, không phải tài sản)

| Khe | Phương án | THÊM | BỎ |
|---|---|---|---|
| 1 · tay gắp | `TAY_DAI` | gắp được khối ở **ô trước mặt** | mỗi bước đi **2 tick** |
| | `CHAN_NHANH` | mọi hành động **1 tick** | **cảm biến `item_here()`** → robot **MÙ** |
| 2 · bánh xe | `OMNI` | quay tại chỗ **1 tick** | mỗi bước đi **2 tick** |
| | `XICH` | đi thẳng **1 tick** | mỗi lần quay **2 tick** |

Cả hai đội chọn từ **cùng một bộ**; **không phương án nào nâng trần**.

### Ô nhớ chương trình

Mỗi **dòng lệnh** là một ô; dùng hàm thư viện thì trả ô (`go_to` 6, `quay_ve` 3). Đồng hồ ô nhớ
hiện liên tục trên khung code. Ở màn 4: bản copy-paste **37 ô** (bị chặn), bản viết hàm **21 ô** (qua màn).

---

## Các tệp

| Tệp | Việc |
|---|---|
| `tran-dau.js` | **nhân trận**: luật v0.1 · v0.2 · v0.3 · v0.4 + máy chấm |
| `tran-game.js` | **lớp màn chơi**: 5 màn, đối thủ do máy viết, chương trình mẫu (gọn/dài), ô nhớ, lời thoại nhân vật |
| `chuong-trinh.js` | các đoạn logic Python đem ra thi đấu (cùng robot, khác logic / khác phương án) |
| `choi-tran.html` + `choi-tran.js` | **game**: sân, hai khe, khay thẻ lệnh, đồng hồ ô nhớ, nhân vật dẫn dắt, phát lại |
| `do-v03.mjs` | công cụ **đo**: quét hình học đề để biết phương án nào thắng đề nào |

## Máy check

```bash
node robotics/kiem-tran-dau.mjs    # 21 — luật v0.1
node robotics/kiem-tran-v02.mjs    # 38 — luật v0.2 (bàn giao, chạy song song)
node robotics/kiem-tran-v03.mjs    # 23 — luật v0.3 (khe chọn đề)
node robotics/kiem-tran-v04.mjs    # 22 — luật v0.4 (hai khe + ô nhớ)
node robotics/kiem-game.mjs        # 38 — năm màn, mẫu, đối thủ, ô nhớ, lời thoại
node robotics/kiem-ui-game.mjs     # 40 — giao diện (DOM giả, không cần trình duyệt)
```

Cộng hai bộ của mockup đợt 1 (`docs/mockups/kiem-core-san-robot.mjs` 74 ·
`kiem-ui-san-robot.mjs` 33): tổng **289 phép kiểm**.

## Luật và thiết kế

- [`luat-tran-v0.1.md`](../docs/thiet-ke/luat-tran-v0.1.md) — luật tối giản, 1 robot
- [`luat-tran-v0.2.md`](../docs/thiet-ke/luat-tran-v0.2.md) — 2 robot + bàn giao + chạy song song thật
- [`luat-tran-v0.3.md`](../docs/thiet-ke/luat-tran-v0.3.md) — khe chọn đề
- [`luat-tran-v0.4.md`](../docs/thiet-ke/luat-tran-v0.4.md) — hai khe + ô nhớ chương trình
- [`doi-robot-chan-hung-GDD-v0.2.md`](../docs/thiet-ke/doi-robot-chan-hung-GDD-v0.2.md) — GDD dòng này
- [`tham-khao-robocon-v0.1.md`](../docs/thiet-ke/tham-khao-robocon-v0.1.md) — tư liệu Robocon thật

## Còn nợ

- Khay thẻ lệnh trong game là **nút chèn khối code**; mockup đợt 1 có **thẻ lệnh lồng nhau** (DOM).
  Nên gộp thành một trình soạn thẻ thật.
- **Hàm thư viện chưa bao giờ sai** — chưa có màn buộc người chơi tự viết lại `go_to`.
- Mới **2 khe** (GDD §4.2 nói 6 khe × 2 robot). Ô nhớ đếm theo **dòng**, chưa theo câu lệnh.
- Va chạm hai robot cùng ô · cảm biến "đồng đội đang ở đâu" · đồng hồ theo vòng đấu · nhiều màn hơn.
