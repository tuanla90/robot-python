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

## 2. Hình ảnh: GIỮ phong cách pixel, ĐỔI bảng màu cho đồng bộ (user 27/10)

User 27/10: "vẫn muốn đổi art / color cho đồng bộ, pixel style thì vẫn giữ".

**Hiện trạng màu:** khoảng 800 mã hex gõ thẳng (choi.css ~400, ve.js ~180, san-ve.js ~140, huy-hieu.js ~80, part.js, mo-dau.js, phim-goi.js): nền gỗ nâu, sân cỏ xanh lá, bảng đen xanh, R1 vàng, nút có núm nhiều màu.

**Hai phương án màu** (đã cho user xem bảng mẫu 27/10):
- **A · đêm tím chàm**: nền chàm đậm (như nền tối của site), sân chàm, tường xám bạc, chữ trắng; khớp chế độ tối của diem10code.
- **B · sáng như video**: nền lavender nhạt, sân trắng lưới mờ, tường xám slate, chữ chàm đậm; khớp khung bài giảng video.
- Cả hai: màu thương hiệu tím chàm cho nút chính; **R1 xanh da trời của Sola** (`#38BDF8`), **R2 hồng của Luna** (`#F472B6`); điểm nhấn xanh ngọc theo bộ đồ linh vật; giữ phông pixel Handjet / VT323.

**Cách làm (không đổi hình, chỉ đổi màu):**
1. Đợt token: gom mọi hex vào **một bảng màu** (`game/bang-mau.js` + biến CSS `--g-*`), thay hex bằng tên vai trò (nền, sân, tường, R1, R2, nút chính…). Chụp màn trước / sau phải **giống từng điểm ảnh** (đợt này không đổi màu nào).
2. Đợt đổi màu: chỉ sửa giá trị trong bảng màu theo phương án user chọn; chụp lại các màn mẫu (sân, khay, hộp, phim, huy hiệu) cho user duyệt.
3. Màu sơn R1 mặc định (`SON.vang` → xanh Sola) và màu đội (R2 lam → hồng Luna) đổi trong `part.js`; kiểm lại tương phản trên sân mới.

### 2a. ĐÃ CHỐT (user 27/10 chiều): bảng màu "lab trắng", thân hai bánh M1

- **Bảng màu**: không phải A hay B ở trên mà là **"lab trắng"** theo ảnh mẫu TopView `hoc/hinh-mau/concept-lab-trang.webp`:
  sân ô trắng bóng, lưới tím lavender nhạt; tường là khối trắng bạc có dải đèn xanh cyan; thùng gỗ thành hộp trắng có đai xanh; thùng nặng / khối sắt xám bạc có đinh tán;
  nút đè là vòng sáng cyan trên đế tối; cờ hồng `#F472B6` trên cột bạc; viền đậm chàm. Đổi **toàn bộ** màu (sân, vật, khung giao diện, khay, hộp thoại, huy hiệu, phim) cho cùng tông.
  GIỮ phong cách pixel và mọi hình dạng / lưới hiện có; chỉ được sửa nhẹ hình ô khi cần để giống mẫu (ví dụ thêm dải đèn cyan trên tường).
- **Thân hai bánh**: bản **M1** của nháp `hoc/hinh-mau/nhap-than-hai-banh.cjs` (hàm `hb-gM1`): bánh như cũ, đầu (mũi + kính) như cũ, đuôi bo tròn,
  hoa văn viền trong chạy dọc cong ở đuôi + chấm giữa lưng. Giữ ổ gắn (`oGan`) của thân hai bánh hiện tại.
- **Robot màu gì trên sân trắng**: thân trắng như mẫu, viền chàm đậm để nổi trên sàn trắng; **màu đội nằm ở chi tiết** (chấm lưng, viền trong, dải đèn):
  R1 xanh trời Sola `#38BDF8`, R2 hồng Luna `#F472B6`, đối thủ đỏ. Bộ sơn mở khoá (`DS_SON`) giữ, đổi thành màu chi tiết.
- **Nhân vật chibi trong ảnh mẫu** (đầu tròn nhìn thẳng): KHÔNG dùng trên sân vì không xoay 4 hướng và không gắn được tay / cảm biến theo ổ; dùng được làm
  **chân dung** trong hộp thoại, phim, màn thắng (mục 2b).
- **Cách làm** (giữ hai bước ở trên): gói A1 gom màu vào bảng màu, ảnh trước / sau giống từng điểm ảnh; gói A2 đổi giá trị bảng màu sang "lab trắng" +
  vẽ thân M1 + sửa ô tường / thùng cho giống mẫu, chụp màn mẫu cho user duyệt. Hai gói chạy tuần tự sau gói mùa 2 đang chạy.

### 2c. Đang cân nhắc: bỏ pixel, chuyển sang VECTOR (user 27/10 tối)

- Lý do: hai game kia của diem10code (game logic mới `mach-den` vẽ SVG, khung `luyen-sql`) không dùng pixel art. Vector nét ở mọi cỡ ô (hết lệch điểm ảnh khi
  cạnh ô không là bội số 14), mẫu robot vòm trắng user thích vốn là hình vector.
- Đã có: bản thử của Claude (sân lab trắng + robot vòm hai bánh + tay kẹp, xoay 4 hướng, nhiều cỡ ô) và tờ SVG của Gemini user gửi (4 góc, 5 thân, 6 tay, 3 biểu cảm):
  "chưa ưng lắm nhưng làm base được". Cần tệp SVG gốc của Gemini để tách mảnh.
- **ĐÃ CHỐT (user 27/10): MỘT hình mỗi bộ phận, quay mặt XUỐNG, xoay cả nhóm cho 4 hướng** (không vẽ riêng 4 góc như tờ Gemini): dễ cân bằng, ít việc.
  Tay gắn vào thân theo điểm gắn rồi xoay cùng thân; bóng đổ (nếu có) vẽ ở lớp riêng không xoay.
- **ĐÃ CHỐT (user 27/10 tối): thân A** của bản thử `hoc/hinh-mau/thu-vector.html` (vỏ vuông bo góc lớn, đường ghép tím nhạt chạy dọc, kính dải ngang
  hai mắt viên thuốc, hai bánh con nhộng viền cyan, tay kẹp cong) — mắt / kính theo bản thử của Claude (user thích hơn bản Gemini).
  **Màu đội nằm ở kính + mắt + CHẤM ĂNG-TEN** (R1 xanh `#38BDF8`, R2 hồng `#F472B6`, đổi sơn là đổi cả ba); vỏ trắng giữ nguyên.
  Sân lab trắng như bản thử (ô trắng bo góc, tường khối trắng có dải đèn cyan, thùng trắng đai xanh, khối sắt có đinh tán, nút đè vòng cyan, cờ hồng).
- Không đổi: luật chơi, máy chấm, mọi màn. Đổi: bộ vẽ sân / vật / bộ phận / hoạt cảnh / giao diện (font Google Sans Flex) / huy hiệu / phim. Bảng màu gói A1 dùng tiếp.
- ~~Gói A2 (pixel lab trắng + thân M1)~~ BỎ (user chọn vector). Thứ tự (user 27/10): A1 bảng màu → **V1–V6 vector** → gói 8, 9, 10 mùa 2 → phim mùa 2.
  V1 bộ vẽ vector + ghép bộ phận theo điểm gắn, xoay 4 hướng · V2 ô sân + vật · V3 5 thân, 6 tay, cảm biến · V4 hoạt cảnh · V5 giao diện phẳng diem10code · V6 huy hiệu + phim · V7 đổi mặc định sang vector, rồi gỡ bộ vẽ pixel (user 27/10).
  **V5 làm lại TOÀN BỘ giao diện ngoài sân** (user 27/10: "còn phải làm lại cả khung code, rìa ngoài, các button"). Hiện `game/choi.css` (1187 dòng) vẫn kiểu pixel:
  font Handjet / VT323, vân gỗ `--wood*`, bảng phấn `.chalk`, khối lệnh `.brick` có núm `--stud`, viền vát `inset` nhiều lớp, 51 hoạt cảnh `steps()`, icon `.pxi` pixel.
  Tách hai gói, làm lần lượt:
  - **V5a · màn chơi:** rìa / khung ngoài (`.screen` `.deco .surf`, nền điện thoại), thanh trên `.top`, khung code (`.pan` `.row` `.strip` `.tab`, số dòng, dòng chọn, lỗi),
    khối lệnh `.brick` thành thẻ phẳng bo góc (giữ màu theo nhóm lệnh), khay lệnh, mọi nút (`.bt` `.cbtn` …: thường / nhấn / tắt / đang chọn), thanh sân `.sanbar`,
    hộp gợi ý, toast, hộp thoại `.md*`; font Google Sans Flex (mã dùng font mono phẳng), bỏ `steps()` sang chuyển động mượt; mục Cài đặt bật / tắt vector; xử lý cỡ ô sân.
  - **V5b · các màn khác:** màn đầu `.d-*`, bản đồ gói / màn `.g-*` `.go-*`, xưởng lắp ráp `.lr-*`, sổ lệnh `.so-*`, hộp mở khóa / part `.hop-*`, màn xong `.th-*`,
    giới thiệu part `.gt-*`, thẻ phim `.pg-*` (khung, không đổi nội dung phim); icon `.pxi` sang vector.
  Không đổi luật, máy chấm, nội dung màn; `npm test` phải giữ xanh; kiểm trên trình duyệt cả máy tính lẫn khổ điện thoại.
- **27/10 A1 · Bảng màu xong** (nhánh claude/bang-mau, gộp 60ad527; npm test 80/80). `hoc/game/bang-mau.js`: 141 màu gốc G theo vai thị giác, 854 biến thể BT
  (`GOP_HET = true` gộp hết về gốc), nhóm DOI (sơn, đội) và LUAT (màu luật chơi); CSS qua biến `--g-<vai>` do bang-mau.js ghi lúc nạp. 2279 chỗ màu trong 33 tệp.
  Máy kiểm `kiem-bang-mau.mjs`: không còn mã gõ thẳng; thay token ra đúng từng byte bản nền 13b8a97; 8528 ảnh bộ phận y hệt (khi đổi màu thật: đặt `NEN = null`).
  Tệp tĩnh theme-color (choi.html, manifest, dong-goi-artifact.py) phải sửa tay theo khi đổi màu nền.
- **27/10 V1 · Bộ vẽ vector xong** (nhánh claude/ve-vector, gộp 7f07c93; npm test 81/81). Bật `choi.html?ve=vector` (mặc định pixel; lưu qua `VeVector.luuCheDo`).
  `hoc/game/ve-vector.js`: kho hình đăng ký (`VeVector.dangKy({loai:'o'|'vat'|'than'|'tay', ...})`, hệ 100 × 100 một ô), raster ra canvas đúng pixel thiết bị, bộ đệm theo
  (tên, cỡ, trạng thái, hướng, sơn); robot ghép thân + tay theo `oGan` − `diemNeo`, thu 0,86, XOAY cả nhóm, bóng đổ lớp riêng. san-ve.js giữ kiến trúc, canvas sân theo pixel
  thiết bị và phép phóng `sv` nên hiệu ứng cũ vẫn tính theo pixel sân. Đã có: sàn, tường, cờ, thùng gỗ, thân A hai bánh, tay kẹp; hình chưa có tự rơi về pixel phóng.
  Trang xem `hoc/hinh-mau/xem-vector.html`. Máy kiểm `kiem-ve-vector.mjs` (38). Chốt (người giao): robot 86% ô; vật nằm đất ~57% cạnh ô; mục Cài đặt để V5; dải đội ở chân xem lại ở V3.
- **27/10 V2 · Ô sân + vật vector xong** (nhánh claude/ve-vector-o, gộp c9b710b; npm test 81/81). Mọi ký hiệu sân (29), mọi ô `Ve.tiles()`, mọi vật (sắt, nam châm N / S,
  thùng gỗ, thùng nặng, bóng) có hình vector theo trạng thái (băng chuyền 4 hướng × 5 pha, cửa mở dần, nút bật, bàn xoay, cổng…); ảnh nhỏ sân `thuSan` vector; bảng nối
  `ve-vector-ky-hieu.js`. Máy kiểm (55) liệt kê ký hiệu từ luật chơi; pixel y nguyên (886 ảnh nhỏ sân, 6 màn băm trùng). Ô đích hổ phách `vecDich`.
  Việc chuyển sang V3: sàn màu thêm dấu hình (mù màu), thùng nặng tông riêng khác khối sắt.
- **27/10 V3 · Thân, tay, cảm biến vector xong** (nhánh claude/ve-vector-robot, gộp cbdbc97; npm test 81/81). Ở `?ve=vector` mọi robot vẽ vector, không còn rơi về pixel:
  thân xích / nhện (bước, co) / omni / drone (không hướng, quạt, pin) trong `ve-vector-than-*.js`; tay nam châm (cực N đỏ / S xanh), ném (gáo), súng hơi (hai nòng),
  tay xoay (góc liên tục), sơn (4 màu) trong `ve-vector-tay-*.js`; 6 cảm biến trong `ve-vector-cam.js` (camera = hai mắt trên kính). Luật ghép như pixel
  (`VeVector.kiemGhep`: 1680 tổ hợp, 528 hợp lệ, cùng câu báo); san-ve.js lấy hình học tay qua `VeRobot.hinhHoc` / `reachCua` / `vatXoay`. Sàn màu có dấu hình
  (tròn / tam giác / vuông / sao), thùng nặng thép tối `vecThep*`. Màn đội: kính + chấm ăng-ten đủ phân biệt, không thêm dải đội. Máy kiểm 74 (400 màn → 36 cấu hình, đều vector).
  Còn lại → V4: robot ngoài sân (Lắp robot, thẻ Bộ phận mới, mở đầu, phim) quá to ở vector (tham số cỡ theo bội số pixel); hiệu ứng sân còn khối pixel; vật kẹp nhỏ, cùng
  màu ngón. → V6: huy-hieu.js gọi thẳng `Part.ghep` (luôn pixel). Nòng sau súng hơi lệch trái ăng-ten ~0,12 ô: giữ. Bộ vẽ pixel (user chốt 27/10): GIỮ tới hết V6, sau đó đổi mặc định sang vector rồi mới gỡ pixel (gói gỡ riêng sau V6).

## 2b. Linh vật Sola / Luna bản pixel

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
1. ~~Bảng màu: phương án A (đêm tím chàm) hay B (sáng như video)?~~ ĐÃ CHỐT 27/10: "lab trắng" + thân M1 (mục 2a).
2. Chân dung pixel: sinh bằng công cụ (tốn tiền, báo giá trước) hay vẽ tay đơn giản bằng code như các part?
3. Ranh giới miễn phí: khách chơi gói 1, tài khoản miễn phí chơi hết mùa 1, Premium từ mùa 2 — đúng ý chưa?
