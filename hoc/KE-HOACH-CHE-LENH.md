# Kế hoạch "Chế lệnh" — đợt 1 (14/10/2026)

User chốt 14/10: mỗi part chỉ mở **vài ba lệnh gốc**; người chơi **tự chế hàm** từ lệnh gốc, không đưa hàm làm sẵn.
Làm tốt 3 part cơ bản (**xe hai bánh, tay kẹp, cảm biến khoảng cách**) → **Robot hoàn thiện** → mở khóa part mới.
Sau mỗi lần học cú pháp mới (`def`, `for`, `if`/`while`) có một **chương chế lệnh**.

## 1. Luật thiết kế

1. **Lệnh gốc chỉ đổi một trạng thái** của part (bánh quay tới / lùi, tay lên / xuống, kẹp đóng / mở…).
   Động tác hay (né, đỗ lùi, nhặt sau lưng, nhảy, đá…) là thứ người chơi **tự chế**.
2. **Mỗi lệnh gốc chuyển động có một lệnh ngược** (bảng `LENH_NGUOC` ở lõi):
   `left_move ↔ left_back`, `right_move ↔ right_back`, `arm_up ↔ arm_down`, `grab ↔ release`;
   sau này `go_up ↔ go_down`, `go_left ↔ go_right` (drone, nhện), hút ↔ đẩy (nam châm), `crouch ↔ stand` (nhện).
   `wait()` và lệnh cảm biến không có lệnh ngược; bắn / ném không hoàn tác được (đó cũng là một điều để dạy).
   Lệnh ngược dùng cho: màn **Đường về** (chế hàm đi ngược), màn **Đấu dây ngược** (một bộ phận lắp ngược chiều),
   và Sổ lệnh (hiện cặp lệnh ngược).
3. Chương 1, 2, Tay gắp, Vòng lặp, Cảm biến khoảng cách **giữ nguyên** nội dung (chỉ đổi vị trí trong thứ tự).
   Code chương đợt 2 giữ nguyên, chỉ khóa chờ mở.

## 2. Thứ tự chương

| Đợt | # | Mã | Tên | Ghi chú |
|---|---|---|---|---|
| 1 | 1 | `hai-banh` | Hai bánh | giữ |
| 1 | 2 | `xuong-ham` | Xưởng hàm | giữ |
| 1 | 3 | `che-xe` | Chế lệnh xe | **MỚI** — làm trước (lát cắt dọc) |
| 1 | 4 | `tay-gap` | Tay gắp | giữ |
| 1 | 5 | `che-tay` | Chế lệnh tay | MỚI — làm sau khi user chơi `che-xe` |
| 1 | 6 | `vong-lap` | Vòng lặp | giữ |
| 1 | 7 | `che-lap` | Chế lệnh có `for` | MỚI — sau |
| 1 | 8 | `khoang-cach` | Cảm biến khoảng cách | dời lên |
| 1 | 9 | `che-cam-bien` | Chế lệnh có `if` / `while` (+ biến đếm) | MỚI — sau |
| 1 | 10 | `robot-hoan-thien` | Robot hoàn thiện | MỚI — sau; trùm = cổng mở đợt 2 |
| 2 | — | `bang-chuyen`, `tham-so`, `nhen`, `xich`, `omni`, `tam-day`, `mau`, `nam-cham`, `may-nem`, `sung-bong`, `drone` | | mở **cùng lúc** khi thắng trùm của chương cổng |

Chương cổng khai ở `thu-tu-chuong.js` (`congDot2`). Khi chưa có `robot-hoan-thien`, cổng tạm là chương cuối đợt 1 đang có.

## 3. Cơ chế mới (lõi + giao diện)

### 3.1 Mục tiêu `bong-mo` (bóng mờ)
- `man.mucTieu = 'bong-mo'`, `man.bongMo = { x, y, huong, diQua: [{x,y}] (tuỳ chọn), vat: [{x,y}] (tuỳ chọn, chương tay) }`.
- **Thắng xét khi chương trình CHẠY XONG** (không thắng giữa đường): robot đúng ô + đúng hướng, đã đi qua mọi ô `diQua`,
  vật (nếu khai) đúng ô. Đi ngang qua bóng mờ rồi đi tiếp thì chưa thắng.
- Chẩn đoán khi thua: nói **lệch ở đâu** bằng lời người ("xe dừng lệch một ô bên trái bóng mờ", "xe đúng chỗ nhưng quay mặt
  sang phải", "chưa đi qua điểm ◆"). Mã: `lech-bong-mo`, `chua-qua-diem`.
- Màn nhiều sân: `bongMo` là mảng song song với `san` (như các lớp khác).
- Giao diện: vẽ **xe mờ** (độ đục ~0.35, viền nét đứt) ở tư thế đích; ô `diQua` là dấu ◆ nhỏ, sáng lên khi tua qua.

### 3.2 Chương trình chính cố định
- `man.chinhCoDinh = true`: chương trình chính chỉ đọc (khóa, có biểu tượng ổ khóa), người chơi chỉ sửa hàm trong Xưởng.
  Dùng ở màn chế lệnh: chương trình chính chỉ là `dodge_right()` chẳng hạn. Máy chấm không đổi.
  (Khác `khung.khoaChinh` hiện có — đó là SỐ Ô bị khóa.)

### 3.3 Đấu dây ngược / hỏng
- `cfg.daoChieu = ['trai']` (hoặc `'phai'`; sau này `'tay'`, `'kep'`…): lệnh gốc của động cơ đó chạy thành **lệnh ngược**
  (`left_move()` làm bánh trái quay lùi). Vết lệnh vẫn ghi tên người chơi gọi.
- `hamGoc` hẹp hơn bình thường = bộ phận hỏng. Gọi lệnh gốc không có: chẩn đoán thân thiện `lenh-goc-hong`
  ("Bánh trái hỏng: left_move() không chạy được ở màn này").
- `man.canhBao` (chuỗi ngắn) hiện thành nhãn ⚠ trên sân ("Dây bánh trái đấu ngược").

### 3.3b Khay và phần cứng (vì bánh lùi mở giữa chừng)
Hiện chưa chương nào cho bánh lùi. Từ `che-xe` 3.4, hàm của em có thể gọi `left_back`/`right_back` (`back`, `u_turn` 1 nhịp, `park`…),
và hàm của em dùng ở MỌI màn sau (kể cả chơi lại chương 2, tay-gap, vong-lap, khoang-cach, đợt 2). Luật:
- `man.hamGoc` = **khay**: lệnh gốc hiện trên khay, dùng được trong chương trình chính và hàm của màn. Giữ nguyên ở các chương cũ
  (để BFS / sao nhịp các chương cũ không đổi).
- **Phần cứng** (`man.phanCung`, mặc định = trọn bộ lệnh của loại robot + bộ phận gắn trên màn, ví dụ xe bánh luôn có cả bánh lùi):
  thân **hàm của em** được gọi mọi lệnh thuộc phần cứng. Màn hỏng khai `phanCung` hẹp hơn (và/hoặc `daoChieu`).
- Người chơi dùng hàm của em nhanh hơn nên vượt sao nhịp cũ: chấp nhận (sao là ngưỡng).
- Máy kiểm cũ vẫn dùng `hamGoc` cho BFS; thêm phép kiểm: chạy lại các chương cũ với kho có `u_turn` 1 nhịp / `turn_right` bằng bánh lùi vẫn thắng.

### 3.4 Sổ lệnh
- Tệp dữ liệu `so-lenh.js`: mỗi hàm cốt truyện `{ ten, nhom: 'xe'|'tay'|'lap'|'cam-bien'|…, moTa, chuong }`
  (moTa ngắn, lời lớp 5: "Né sang phải một ô, giữ hướng").
- Màn hình Sổ lệnh (mở từ màn chọn, thay/đi cùng hàng "Hàm của em"): theo nhóm; hàm đã chế thì hiện tên + thân;
  chưa chế thì "???" + moTa + "chế ở chương …". Có thêm một trang "Lệnh gốc" liệt kê cặp lệnh ngược.

### 3.4b Khay theo thẻ bộ phận + giới hạn theo màn (user chốt 14/10)
- Khay (màn chơi và Xưởng): ◀ [tên thẻ] ▶ chuyển thẻ theo BỘ PHẬN của robot trên màn (Thân / Tay / Cảm biến…, thêm thẻ "Của màn"
  khi có hàm của màn); ▲▼ cuộn trong một thẻ. Mỗi thẻ: lệnh gốc của bộ phận trước, rồi hàm của em thuộc bộ phận đó.
- Hàm của em xếp vào thẻ theo lệnh gốc nó gọi (kể cả gián tiếp): có cảm biến → Cảm biến; không có mà có lệnh tay / dụng cụ → Tay; còn lại → Thân.
- KHÔNG giới hạn chung số hàm mang vào màn. Màn nào muốn thì khai `man.gioiHanHam = n`: chương trình chính được gọi trực tiếp
  tối đa n hàm của em KHÁC NHAU (hàm gọi bên trong hàm khác không tính); vượt thì lỗi khung `qua-gioi-han-ham`; giao diện hiện bộ đếm "Hàm 2/3".
- **Đã làm (14/10)** — `game/thanh-phan.js` (Palette), `khung-code.js` + `cham.js` (giới hạn), `man-so-lenh.js`, máy kiểm `kiem-khay.mjs`:
  - Thẻ theo thứ tự: **Thân** (tên "Xe" cho banh / xich / omni, "Nhện", "Drone") · **Tay** (khi khay có lệnh tay / dụng cụ; tên theo bộ phận thật: "Tay kẹp", "Nam châm", "Máy ném", "Súng bóng", "Tấm đẩy"; nhiều loại cùng lúc thì "Tay")
    · **Cảm biến** (khi khay có front_clear / left_clear / right_clear / front_metal / color / battery) · **Của màn** (khi có hàm của màn). Tối đa 4 thẻ. Một thẻ thì ẩn ◀ ▶ và hiện lại chữ KHỐI LỆNH. ◀ ▶ đi vòng tròn.
  - Hàm của em vào thẻ theo lệnh gốc nó gọi (kể cả gián tiếp): cảm biến > tay > thân. Hàm tay / cảm biến mà khay không có thẻ đó thì nằm ở thẻ Thân (như khay cũ). `locHamTheoRobot` giữ nguyên.
  - Cấu trúc Python KHÔNG có thẻ riêng: khối `for` (và `for c in "R":`) nằm cuối phần lệnh gốc của MỌI thẻ lệnh (Thân, Tay, Cảm biến) nên không phải đổi thẻ; `while` / `if` / `elif` / `else` đọc cảm biến và `c = color()` ở thẻ Cảm biến;
    `if d == "U":` (chuỗi chỉ đường của nhện / drone) và `while` mẫu của màn không có cảm biến ở thẻ Thân; khối BIẾN (đối số của hàm đang sửa) ở đầu mọi thẻ.
  - Thẻ mặc định khi vào màn / mở Xưởng: thẻ chứa hàm đang sửa; ở màn chơi thì hàm màn bắt chế (`taoHam`; hàm còn trống thì theo lời giải của màn); không có thì Thân. "Hàm mới" tạo từ một thẻ thì Xưởng mở sẵn thẻ đó. Vẽ lại khay giữ thẻ đang chọn;
    khối báo lỗi ở thẻ khác thì tự sang thẻ đó.
  - Khối không co quá mức `.d1`; tràn thì cuộn bằng ▲ ▼ (và lăn chuột). Khay nhiều thẻ thì ▲ ▼ luôn có mặt (mờ khi không cuộn được) để ◀ ▶ không nhảy chỗ.
  - `man.gioiHanHam = n` (không khai thì không kiểm); tiêu đề khung chương trình hiện "Hàm k/n" (đỏ khi k > n). Chưa màn thật nào khai.
  - Sổ lệnh: chỉ thẻ nhóm đã mở + "Lệnh gốc" + "Hàm của em"; các nhóm chưa mở gộp thành một dòng mờ "Còn N nhóm chưa mở".
  - Lưu ý ngoài phạm vi: kho hàm của em có trần chung `KhoHam.SO_HAM_MAC_DINH = 41` (39 hàm cốt truyện + 2 chỗ tự đặt) — đây là trần kho, không phải giới hạn hàm mang vào màn; nếu muốn người chơi tự chế thoải mái hơn thì nâng số này.

### 3.5 Mở khóa đợt 2
- `ThuTuChuong`: thêm `dot2: [...]`, `congDot2: 'mã chương'`. `App.trangThai`: chương đợt 2 mở khi trùm của chương cổng đã qua
  (không cần chương đợt 2 đứng trước). Lý do khóa mới `dot2` ("Hoàn thành <chương cổng> để mở bộ phận mới").
- Thắng trùm chương cổng lần đầu: bảng **"Mở khóa bộ phận mới!"** liệt kê part đợt 2 (vẽ bằng part có sẵn nếu tiện).

## 4. Chương 3 `che-xe` — Chế lệnh xe (10 màn)

Robot `banh`. Hàm của em có từ chương 2: `move`, `turn_right`, `turn_left`, `u_turn`, `corner`, `stair`, `two`.
Màn 3.1–3.3: `hamGoc = [left_move, right_move, wait]`. Từ 3.4: **bánh quay lùi** `left_back`, `right_back`.
Mỗi màn chế lệnh: `mucTieu 'bong-mo'`, `chinhCoDinh`, sân thoáng (vài ô) để nhiều cách chế cùng qua.
**Mỗi lệnh phải chế được ít nhất 2 cách và cả hai đều thắng** (khai `congThucKhac` cho máy kiểm).

| # | Hàng | Tên | Việc | Lệnh chế (taoHam) | Cách 1 | Cách 2 (ví dụ) |
|---|---|---|---|---|---|---|
| 1 | làm quen | Né phải | bóng mờ lệch phải 1 ô, cùng hướng | `dodge_right` | turn_right, move, turn_left | ba lần turn_left, move, turn_left |
| 2 | làm quen | Né trái | bóng mờ lệch trái 1 ô, cùng hướng | `dodge_left` | turn_left, move, turn_right | … |
| 3 | làm quen | Đường né | tới cờ qua hành lang so le (chương trình chính tự viết) | — (dùng dodge_*) | | |
| 4 | luyện | Bánh lùi | bóng mờ 1 ô sau lưng, cùng hướng; mở `left_back`/`right_back` | `back` | left_back, right_back, wait | u_turn, move, u_turn |
| 5 | luyện | Quay đầu 1 nhịp | sửa `u_turn` của em: trái tiến + phải lùi = quay đầu trong 1 nhịp (sao nhịp chỉ đạt bằng cách này) | sửa `u_turn` | left_move, right_back, wait | turn_right ×2 (thắng, ít sao) |
| 6 | luyện | Đỗ lùi | lùi vào chỗ đỗ bên cạnh, đầu xe quay ra đường | `park` | turn_left, back | turn_right, move, u_turn |
| 7 | biến thể | Đường về | hàm của màn `go_out()` (khóa, xem được); chế `come_back()` đưa xe về đúng chỗ + hướng ban đầu. Gợi ý: đi ngược thứ tự, đổi từng lệnh thành lệnh ngược | `come_back` | lệnh ngược theo thứ tự ngược | u_turn + đi lại + u_turn |
| 8 | biến thể | Đấu dây ngược | `daoChieu ['trai']`: `move()` của em thành quay đầu. Tới cờ | `fixed_move` | left_back, right_move, wait | … |
| 9 | biến thể | Chỉ còn số lùi | `hamGoc = [left_back, right_back, wait]`; tới cờ bằng cách đi lùi. Sửa `turn_right`/`turn_left` của em sang bánh lùi (vẫn đúng ở mọi màn khác) | sửa `turn_right`, `turn_left` | right_back, wait | |
| 10 | trùm | Bãi đỗ xe | ra khỏi bãi, né xe đỗ, lùi vào chỗ trống: bóng mờ + ◆; tự viết chương trình chính | huy hiệu `che-xe` | | |

Tên trên là đề xuất; giữ tiếng Anh, khóa theo cốt truyện (`taoHam`). Lời đề bài lớp 5, theo `docs/huong-dan-viet-noi-dung.md` của repo.

## 5. Bốn chương mới của đợt 1 (user duyệt làm 14/10)

Thứ tự đợt 1 (đã đăng ký ở `thu-tu-chuong.js`, tệp màn rỗng đã có, đã gắn vào `choi.html` và `kiem-hoc.mjs`):
1 hai-banh · 2 xuong-ham · 3 che-xe · 4 tay-gap · **5 che-tay** · 6 vong-lap · **7 che-lap** · 8 khoang-cach · **9 che-cam-bien** · **10 robot-hoan-thien**; đợt 2 từ 11.

Khuôn chung (như che-xe): 10 màn = làm quen 1–3, luyện 4–6, biến thể 7–9, trùm 10 (huy hiệu riêng). Màn chế lệnh: `mucTieu 'bong-mo'`,
`chinhCoDinh`, sân thoáng, `congThucKhac` ≥ 1 công thức khác (đều thắng). Có màn "dùng" (chương trình chính tự viết). Hàng biến thể dùng các kiểu:
Đường về (lệnh ngược theo thứ tự ngược), lắp ngược (`daoChieu`), hỏng (`phanCung`), sửa hàm lỗi (hàm của màn). Trùm có thể khai
`gioiHanHam` (giới hạn theo nhiệm vụ, user chốt). Tên hàm tiếng Anh, khóa theo `taoHam`; mô tả mỗi hàm thêm vào `so-lenh.js` ở chỗ đánh dấu.
Lời đề bài / gợi ý theo `docs/huong-dan-viet-noi-dung.md` (lớp 5, câu ngắn, không rao cơ chế thừa). Bảng dưới là ĐỀ XUẤT: agent được đổi
sân, tên, thứ tự nếu cần cho đúng luật / vừa khung 10 ô, nhưng phải ghi lý do trong báo cáo.

### 5.1 Chương 5 `che-tay` — Chế lệnh tay (robot banh + tay kẹp; bánh có cả số lùi)
Hàm có sẵn: chương 2–4 (move, turn_right/left bản bánh lùi, u_turn 1 nhịp, dodge_*, back, park…, pick, drop, carry).
| # | Tên | Việc | Chế |
|---|---|---|---|
| 1 | Chuyền ra sau | vật trước mặt → ô sau lưng; xe giữ ô và hướng | `pass_back` (pick, u_turn, drop, u_turn) |
| 2 | Đặt sang phải | vật trước mặt → ô bên phải xe; xe giữ hướng | `put_right` (pick, turn_right, drop, turn_left) |
| 3 | Dọn đường (dùng) | vật nằm chắn lối (vật chiếm ô), dẹp sang bên rồi tới cờ | — |
| 4 | Nhặt sau lưng | vật sau lưng; xong thì đang CẦM vật, mặt như cũ (`bongMo.cam`) | `grab_back` |
| 5 | Lùi mang hàng | nhặt vật trước mặt, lùi 2 ô, đặt xuống trước mặt | `drag` (pick, back, back, drop) |
| 6 | Đổi chỗ | hai vật khác màu ở trước mặt và bên phải đổi chỗ (bóng mờ vật có màu, chấm theo màu); ≤ 10 dòng nhờ hàm vừa chế | `swap` |
| 7 | Đặt lại chỗ cũ | hàm của màn `go_get()` khóa (move, move, pick); chế `put_back()` đưa vật về chỗ cũ, xe về chỗ + hướng cũ (pick ↔ drop là cặp ngược) | `put_back` |
| 8 | Tay lắp ngược | `daoChieu ['tay']`: arm_up ↔ arm_down đổi chỗ; pick/drop của em hỏng; chế bản dùng được rồi đưa vật về đích | `fixed_pick`, `fixed_drop` |
| 9 | Cần cẩu | bánh phải hỏng (`phanCung` chỉ bánh trái + tay): xe chỉ xoay tại chỗ; chuyển các vật quanh xe vào đích. turn_right của em (bánh lùi phải) hỏng → sửa lại bằng bánh trái | sửa `turn_right`, `u_turn` |
| 10 | Kho đồ (trùm) | nhiều vật, nhiều đích, `gioiHanHam` ~4; huy hiệu `che-tay` | — |
Lõi cần thêm: `bongMo.cam` (xe đang cầm vật lúc xong), `bongMo.vat` có `mau` (chấm theo màu), `daoChieu` cho `'tay'` (arm_up↔arm_down) và `'kep'` (grab↔release); giao diện vẽ bóng mờ vật có màu, xe mờ cầm vật.

### 5.2 Chương 7 `che-lap` — Chế lệnh có `for` (cauTruc ['for'])
Chỉ dùng hàm của chương 2–4 và 6 (KHÔNG dùng hàm của che-tay — hai chương làm song song).
| # | Tên | Việc | Chế |
|---|---|---|---|
| 1 | Chạy nước rút | bóng mờ 4 ô trước | `dash` (for i in range(4): move()) |
| 2 | Vòng vuông | đi một vòng vuông về đúng chỗ cũ, ◆ ở ba góc | `square` (for 4: corner()) |
| 3 | Tuần tra (dùng) | đi qua các ◆ bằng dash / square | — |
| 4 | Bậc chéo | lên 3 bậc chéo phải, giữ hướng | `zigzag` (for 3: stair() / move()+dodge_right()) |
| 5 | Dọn hàng | 3 vật thẳng hàng trước mặt → dời mỗi vật sang cột phải | `sweep` (for có pick/drop) |
| 6 | Vòng lồng | vòng vuông cạnh 3 ô (for lồng), ◆ | `ring` |
| 7 | Đường về vòng lặp | hàm của màn `go_round()` khóa có for; chế `come_home()`: cùng số lần lặp, thân đảo thứ tự + lệnh ngược | `come_home` |
| 8 | Lệch một | hàm của màn dùng `range` sai một → sửa | sửa hàm của màn |
| 9 | Số lùi đường dài | chỉ còn số lùi (`phanCung`), đi xa bằng for | `reverse_run` |
| 10 | Tuần tra kho (trùm) | nhiều ◆, `gioiHanHam` ~3; huy hiệu `che-lap` | — |

### 5.3 Chương 9 `che-cam-bien` — Chế lệnh có `if` / `while` + BIẾN ĐẾM (cauTruc for/if/while)
Chỉ dùng hàm của chương 2–4, 6, 8 (KHÔNG dùng hàm của che-tay / che-lap). Màn chế lệnh có cảm biến dùng 3 sân (`bongMo` mảng song song `san`).
| # | Tên | Việc | Chế |
|---|---|---|---|
| 1 | Đi cẩn thận | trống thì tiến một ô, có tường thì đứng yên (3 sân) | `safe_move` (if front_clear(): move()) |
| 2 | Tìm lối mở | quay tới khi trước mặt trống (3 sân, hướng khác nhau) | `face_open` (while not front_clear(): turn_right()) |
| 3 | Mê cung nhỏ (dùng) | go_wall + face_open, 3 sân | — |
| 4 | Cửa hông | đi tới khi bên phải trống (3 sân dài ngắn khác) | `to_gap` (while not right_clear(): move()) |
| 5 | Đi rồi về | tới tường rồi về ĐÚNG chỗ cũ, mặt như cũ (3 sân dài khác) → BIẾN ĐẾM `n = 0`, `n = n + 1`, `range(n)` | `bounce` |
| 6 | Bám tường | một bước bám tường phải (if/elif/else); chương trình chính cố định lặp nó | `follow_right` |
| 7 | Cảm biến lắp ngược | `daoChieu ['cam']`: front_clear() trả ngược → chế bản đúng bằng `not` | `safe_move2` |
| 8 | Sửa hàm lỗi | hàm của màn sai điều kiện (left_clear thay right_clear, hoặc quên move trong while) | sửa hàm của màn |
| 9 | Lấy rồi về | đi tới vật, nhặt, về chỗ cũ (đếm bước), đặt xuống (3 sân) | `fetch_back` |
| 10 | Mê cung kho (trùm) | mê cung + mang hàng, 3 sân, `gioiHanHam`; huy hiệu `che-cam-bien` | — |
Lõi / giao diện cần thêm: `daoChieu` cho `'cam'` (cảm biến khoảng cách trả ngược); khối gán biến đếm trên khay (`n = 0`, `n = n + 1`,
`for i in range(n):` với n là biến) — lõi Python đã hiểu gán / cộng, cần khối giao diện và máy kiểm.

### 5.4 Chương 10 `robot-hoan-thien` — Robot hoàn thiện (làm SAU ba chương trên)
Xe + tay kẹp + cảm biến khoảng cách; mỗi màn là một NHIỆM VỤ ghép cả ba bộ phận, phần lớn 3 sân (chống viết cứng), chương trình chính tự viết,
dùng mọi hàm đã chế (gồm che-tay, che-lap, che-cam-bien). Hàng biến thể có hỏng hóc / lắp ngược; vài màn khai `gioiHanHam`.
Trùm = cổng mở đợt 2: đổi `ThuTuChuong.congDot2` thành `'robot-hoan-thien'`; huy hiệu riêng.

## 6. Xong khi
- Chơi trên trình duyệt (thao tác như người chơi) hết chương `che-xe`; ở mỗi màn chế lệnh, thử cả 2 cách đều thắng.
- Máy kiểm mới `kiem-che-xe.mjs` xanh (BFS nhịp ngắn nhất tới bóng mờ, congThucKhac đều thắng, loiSai đúng mã);
  mọi máy kiểm cũ vẫn xanh (`kiem-hoc` sau khi đổi thứ tự chương).
- Đóng gói Artifact chạy được.
