# Kế hoạch: Robot Chấn Hưng khớp với diem10code (27/10/2026, CHƯA LÀM)

User đang tính gộp game vào diem10code.com (repo `tin_hoc`, `D:\Users\tuanla2\tin_hoc`) làm game Python trong bốn game (logic, Python, SQL, HTML/CSS).
Kế hoạch gộp bên đó: `tin_hoc/KE-HOACH-GOP-GAME-LOGIC.md` (khung `/choi/<game>/`, `window.D10`, khoá tiến độ, Premium, sự kiện).
Tệp này ghi những gì phía game nên đổi để trông và nghe như cùng một sản phẩm. **Chưa sửa code.**

## 0. Đã đọc

| Bên | Thứ | Ở đâu |
|---|---|---|
| diem10code | Màu thương hiệu tím chàm (`--brand` = indigo), phông Google Sans Flex, luật "không emoji, không gạch dài — trong chữ hiển thị" | `tin_hoc/public/css/tokens.css`, `KE-HOACH-GOP-GAME-LOGIC.md` mục 3 |
| diem10code | Linh vật nam / nữ × sáng / tối, bộ đồ trắng bạc viền xanh ngọc, thang tiến hoá 7 bậc | `tin_hoc/PROMPT-HUY-HIEU-MASCOT.md`, `tin_hoc/public/asset/mascot/` |
| video | Hai mascot **Sola** (hấp tấp, tự tin thái quá, xanh `#38BDF8`) và **Luna** (lanh lợi, tinh nghịch, hồng `#F472B6`), chibi vector tóc trắng, kính xanh | `diem10code-video/README.md`, `public/mascot/<sola|luna>/` |
| video | Bài "Rô bốt né vật cản": **Đo khoảng cách → So mức an toàn → Gần thì rẽ**, robot hút bụi, khoảng cách bằng cm | khung hình user gửi 27/10 |
| game | Thế giới pixel (gỗ, bảng đen), phông Handjet; truyện R1 và cái xưởng, không có nhân vật người | `hoc/game/mo-dau.js`, `hoc/game/phim-goi.js`, `hoc/game/choi.css` |

## 1. Cốt truyện: Sola và Luna vào game (ưu tiên 1)

- **Sola và Luna là hai kỹ sư của xưởng; R1 là robot của họ.** Người chơi viết code giúp hai bạn.
- Phim mở đầu (`mo-dau.js`) và phim mở gói (`phim-mua-*.js`) thêm **một câu thoại** của Sola hoặc Luna ở khung đầu hay khung cuối (không đổi số khung).
- Tính cách khớp kiểu màn đang có:
  - Màn **sửa hàm lỗi**: "Sola viết vội, em sửa giúp nhé" (Sola hấp tấp).
  - **Gợi ý** (`goiY`) do Luna nói (Luna lanh lợi).
  - Màn đố / bẫy (đố nhịp, quên `wait()`…): Luna ra đố, Sola dính bẫy, đúng giọng series "BẪY".
- **Gói Đội**: R1 là robot của Sola, R2 là robot của Luna. Màu đội trong game đang là R1 vàng, R2 lam: cân nhắc đổi R2 sang hồng của Luna, hoặc giữ màu đội và chỉ đặt tên.
- Không đổi luật chơi; chỉ đổi chữ (`deBai`, `goiY`, lời phim) và thêm chân dung.

## 2. Hình ảnh: giữ thế giới pixel, thêm Sola / Luna bản pixel

- **Giữ sân pixel** (bản sắc của game; theo kế hoạch gộp, mỗi game vẫn là app riêng). Không dán ảnh chibi vector lên sân: lệch phong cách.
- Vẽ **chân dung pixel** Sola và Luna (đầu + vai, vài nét mặt: vui, lo, ngạc nhiên) dùng ở: hộp thoại đề bài / gợi ý, phim, màn thắng. Mẫu là ảnh mascot thật trong `diem10code-video/public/mascot/`.
- Cách làm: công cụ sinh ảnh pixel đang kết nối (retro-diffusion, có `reference_images`) lấy ảnh mascot làm mẫu → `fix_pixel_art` về đúng lưới → chỉnh tay. **Tốn tiền mỗi lần sinh: báo giá (`estimate_inference_cost`) và hỏi user trước khi chạy.**
- Thanh trên cùng 40px của khung `/choi/` (kiểu diem10code, có sẵn trong kế hoạch gộp) là đủ để thấy cùng một sản phẩm; nút màu tím chàm trong game là không cần.

## 3. Nội dung: gói Hồng ngoại mùa 2 khớp video "Rô bốt né vật cản"

Ba bước của video trùng đúng gói 3 mùa 2 (`distance()` + biến + `if`). Viết gói này theo ba bước đó:

| Bước video | Màn trong game |
|---|---|
| Đo khoảng cách | `d = distance()`, in ra / đi đúng `d` ô |
| So mức an toàn | biến ngưỡng `an_toan = 2`, `if distance() <= an_toan:` |
| Gần thì rẽ | `while True` / `for` + `if distance() <= an_toan: turn_right()`, né chân bàn |

- Đề bài nói **"mỗi ô là 10 cm"** để khớp đơn vị với video ("tới 10 cm mới rẽ thì quá sát").
- Có màn đố đúng tình huống trong video: ngưỡng quá nhỏ thì xe đâm (sửa `an_toan`).
- Liên kết hai chiều: video / bài SGK có nút "Chơi phần này" mở `/choi/python/#/…` đúng màn; màn game có nút xem video / bài SGK (như kế hoạch gộp làm với bài C10-23, C10-24).
- Việc này phải đưa vào **brief gói 3 mùa 2** (đang chờ sau P1).

## 4. Chữ hiển thị theo luật diem10code

- **Không emoji, không dấu gạch dài "—"** trong chữ hiển thị. Hiện có: 2 chỗ "—" trong `hoc/game/chu.js`, nút 🐞 trong bảng Gỡ lỗi (chỉ chế độ thử; vẫn nên đổi sang biểu tượng vẽ). Cần quét cả `deBai` / `goiY` / `ten` trong mọi `man-*.js` và lộ trình.
- Thêm một máy kiểm quét chữ hiển thị (chu.js + trường chữ của màn) để chặn tái phát.
- Tên gọi: thống nhất "Tay kẹp" (đã đổi trong phim 27/10); dùng đúng từ của SGK Tin học khi nói về Python (biến, hàm, tham số, vòng lặp).

## 5. Nối kỹ thuật với khung D10 (làm khi gộp)

Theo `tin_hoc/KE-HOACH-GOP-GAME-LOGIC.md`; phía game:

| Việc | Ghi chú |
|---|---|
| Đường dẫn `/choi/python/` | game là trang tĩnh, đường dẫn tương đối: chép bản chụp bằng script đồng bộ (`hoc/`, `nhan/`, bỏ `tools/`, máy kiểm) |
| Tiến độ: khoá `gamePython` | `Luu` hiện lưu localStorage theo `ma` màn (cố định, hợp để đồng bộ); thêm đuôi hồ sơ; gộp kiểu hợp (sao lấy cao hơn, cờ đã xem hợp tập) |
| Quyền theo mùa | mùa 1 miễn phí (đúng luật "phần Học miễn phí" của site); mùa sau Premium. Game đã có `ban` / `chuaMua` theo mùa (`mo-goi.js`): nối `quyenChoi` vào đó thay cho mua thử |
| Đăng nhập | khách chơi gói 1; gói 2 trở đi cần đăng nhập (miễn phí) — cùng kiểu "học thử một bài" |
| Sự kiện | `choi-mo`, `choi-xong-man` (`python:<ma>`), `choi-cham-khoa` |
| XP / huy hiệu | để đợt sau, khi có hai game trở lên (như kế hoạch gộp) |
| Chạy riêng (không có `D10`) | mọi thứ như bây giờ, máy kiểm giữ nguyên |

## 6. Thứ tự đề xuất

1. Mục 3 (gói Hồng ngoại theo video) — gộp vào brief gói 3 mùa 2.
2. Mục 1 (Sola / Luna vào chữ: đề bài, gợi ý, phim) — một gói riêng, quét mùa 1 trước.
3. Mục 4 (chữ theo luật) + máy kiểm chữ.
4. Mục 2 (chân dung pixel) — cần user duyệt chi phí sinh ảnh.
5. Mục 5 khi bắt đầu gộp vào diem10code.

## 7. Cần user chốt
1. R2 ở gói Đội: đổi sang màu hồng của Luna, hay giữ màu đội lam?
2. Chân dung pixel: sinh bằng công cụ (tốn tiền, báo giá trước) hay vẽ tay đơn giản bằng code như các part?
3. Ranh giới miễn phí: khách chơi gói 1, tài khoản miễn phí chơi hết mùa 1, Premium từ mùa 2 — đúng ý chưa?
