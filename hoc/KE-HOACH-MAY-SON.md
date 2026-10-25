# Kế hoạch gói "Máy sơn" (25/10/2026)

User chốt: "thêm phần tô màu nhé. có dạng chấm và nét cong, có chọn màu. nét cong có khi giữ tô màu kèm di chuyển cua góc".
Gói thêm vào **mùa 3 "Công cụ"** (cân lại số màn: mùa 3 từ 130 lên 150 màn), đứng ngay sau gói Cảm biến màu (`mau`); gói đội của Cảm biến màu (`doi-mau`) vẫn đứng ngay sau gói `mau`.

## 1. Bộ phận và lệnh

Đầu sơn là một **tay** mới (`robot.tay = 'son'`, part `game/part/part-son.js`): một robot một tay, không đi chung tay kẹp, tay xoay, nam châm, máy ném, súng hơi. Chỉ gắn lên xe có bánh (hai bánh, xích, omni).
Đầu sơn tô **ô xe đang đứng** (không phải ô trước mặt như tay kẹp).

| Lệnh | Việc | Nhịp |
|---|---|---|
| `ink(c)` | chọn màu `"red"`, `"green"`, `"blue"`, `"yellow"` | **đổi ngay, không tốn nhịp** (như `aim(n)`); màu lạ là lỗi chạy `mau-son-sai` |
| `dot()` | chấm vào ô đang đứng | chỉ ra lệnh, `wait()` chốt nhịp |
| `pen_down()` | hạ đầu sơn (tô luôn ô đứng) và giữ | chỉ ra lệnh |
| `pen_up()` | nhấc đầu sơn | chỉ ra lệnh |

Lý do chọn tên / luật (theo luật nhịp của `san-hoc.js`: mỗi bộ phận một lệnh mỗi nhịp, `wait()` chốt nhịp):
- `dot`, `pen_down`, `pen_up` là ba lệnh của **một** bộ phận (đầu sơn) nên mỗi nhịp chỉ nhận một lệnh (`son-goi-lai`); khay chặn chèn lệnh thứ hai (`BO_PHAN_LENH.son`). Cặp lệnh ngược `pen_down ↔ pen_up`.
- Chọn màu không phải chuyển động nên không chiếm nhịp: `ink()` giống `aim()`, khỏi phải tốn một nhịp chỉ để đổi màu. Tên `ink` (không dùng `paint`) để khỏi nhầm "paint = tô".
- Thứ tự trong nhịp: **lệnh sơn → bánh chạy → băng chuyền → đầu sơn đang hạ thì tô ô xe đứng cuối nhịp**. Nên `dot(); move()` chấm rồi mới đi; `pen_down(); move()` tô ô cũ và ô mới;
  `pen_up(); move()` nhấc trước khi đi. Xe quay tại chỗ khi đầu sơn hạ thì ô góc vẫn được tô: **nét liền qua góc** (nét cong). `dot()` / `pen_down()` dùng màu lúc gọi; nét đang giữ dùng màu hiện tại.
- Sơn không chiếm ô, không đổi màu sàn (`color()` vẫn đọc sàn). Tô lại một ô thì màu mới đè màu cũ.

## 2. Mục tiêu "tô theo hình"

`man.mucTieu = 'to-hinh'`, `man.hinh` = hình mờ (mảng chuỗi `r g b y .`; màn nhiều sân: mảng song song với `san`). Thắng **ngay** cuối nhịp mà mọi ô hình đúng màu và không ô nào ngoài hình bị tô.
Tô ra ngoài hình thì không xóa được: `to-thua`, dừng sớm. Tô sai màu trong hình thì tô lại được (`to-sai-mau`, thông tin). Chạy xong chưa đủ: `chua-to-hinh` (đếm ô thiếu, ô sai màu, chỉ một ô ví dụ).
Giao diện (`game/san-ve.js`): ô hình chưa tô = khung nét đứt + chấm màu mờ; ô đã tô = sơn đặc, lóe trắng lúc vừa tô; ô ngoài hình viền đỏ, ô sai màu gạch chéo màu cần tô. Lon sơn trên xe mang màu đang chọn, chổi dài ra khi đầu sơn hạ.

## 3. Hai chương (khuôn KE-HOACH-CHE-LENH.md)

`may-son` (làm quen): chấm, đổi màu, nét thẳng, giữ nét qua góc, chữ U (for), chấm cách quãng (chế `dots(n)`), danh sách màu (`for c in [...]`), đổi màu giữa nét, khung vuông, trùm hai khung hai màu (chế `frame()`, for lồng for).
`che-may-son` (chế lệnh, chương trình chính cố định): `line(n)`, `color_line(c, n)`, `next_row(n)`, hàm của màn `stair_step()` rẽ ngược, `stripes(colors)`, `color_dots(colors)`, `grid(r, k)` (for lồng for),
`border(n)`, hàm của màn `fix_middle()` (tô đè), trùm lá cờ có viền (gioiHanHam 3). Không có màn "lắp ngược".

## 4. Máy kiểm

`hoc/kiem-may-son.mjs` (luật, chẩn đoán, 20 màn, đăng ký), bộ dò `hoc/do-duong-may-son.mjs` (BFS trên tập ô đã tô; hình lớn thì `khongDoBFS`), `kiem-hoc.mjs` nạp hai tệp màn.
