# Kế hoạch Hệ thống Âm nhạc & Bài nhạc Chúc mừng Chiến thắng (cập nhật 31/10/2026)

Liên kết:
- Lộ trình mùa & Mùa cuối Về CLB: [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md) (bản 8 mùa trên `main`, bản 9 mùa trên nhánh `claude/them-mua-ke-hoach-c51a50`).
- Gốc bộ phận Loa & Bản nhạc mờ: nhánh `claude/music-element-integration-02284a` (`hoc/KE-HOACH-LOA.md`).
- Bộ tổng hợp âm thanh WebAudio: [am-thanh.js](game/am-thanh.js).

---

## 1. Nâng cấp Âm nhạc & Nhạc nền hiện tại (`hoc/game/am-thanh.js`) — ĐÃ THỰC HIỆN ĐỢT 1

Để game vui nhộn, bắt tai ngay từ Mùa 1 mà vẫn giữ nguyên kiến trúc **100% WebAudio không tệp âm thanh ngoài**:

1. **Sequencer 4 kênh 8-bit (`xepNhac`)**:
   - **Kênh 1 — Giai điệu chính (`dieu`)**: Mở rộng từ 64 bước (4 ô nhịp) lên **128 bước (8 ô nhịp = Đoạn A + Đoạn B đối đáp)** để không bị lặp nhàm tai.
   - **Kênh 2 — Bè hòa âm / đối âm (`be`)**: Sóng `triangle` đi quãng 3 / quãng 6 cùng giai điệu chính hoặc đệm rải hợp âm, tạo cảm giác đầy đặn như nhạc game Nintendo / Chiptune cổ điển.
   - **Kênh 3 — Bass nảy (`bass`)**: Thay mẫu bass đơn điệu bằng mẫu octave-bounce và walking-bass ở phách cuối.
   - **Kênh 4 — Bộ gõ 8-bit (`trongKickNhac`, `trongSnareNhac`, `hiHatNhac`)**:
     - `soan` (104 BPM — Xưởng chế tạo): Kick ấm đầu ô nhịp + shaker nhẹ ở phách lơi + giai điệu xylophone/marimba sóng tam giác kích thích suy nghĩ.
     - `chay` (120 BPM — Robot hành động): Hành khúc sôi nổi có Kick + Snare + Hi-hat nảy.
     - `trum` (136 BPM — Màn Trùm): Nhịp trống dồn kịch tính + bass chạy nốt móc liên tục.
     - `khaiHoan` (128 BPM — Lễ hội Chiến thắng): Phát nối 8 đoạn nhạc chiến thắng của 8 trạm với đầy đủ 2 bè + bass + trống lễ hội.
     - `im`: Tạm tắt nhạc nền khi màn có Loa đang phát hoặc khi người chơi bấm "Nghe đề".
2. **Fanfare Chiến thắng & Hiệu ứng mới (`HIEU_UNG`)**:
   - `thang`: Fanfare 6 nốt 2 bè kèm bass rải hợp âm Đô trưởng.
   - `thangTrum`: Fanfare đặc biệt khi thắng màn Trùm (trống dồn + kèn đồng 2 bè 11 nốt dài ~1,1 giây, đã gắn vào `man-choi.js`).
   - `sao(2)`: Ngôi sao thứ 3 ngân thêm bồi âm lấp lánh.
   - Hiệu ứng cho các cơ chế mới: `nuoc` (xuồng/dây phao), `neo` (thả neo), `cau` (cần cẩu), `gieoHat` (nông trại), `daLan` (mỏ đá), `chuongDa` (đá chuông cộng hưởng trong hang động), `phaoHoa` (ngày hội CLB).
3. **Loa 2 giọng (`AmThanh.loa(am, dai, giong)`)**:
   - `giong = 1` (R1 của Sola): Sóng vuông (`square`) + bồi âm tam giác sắc nét cho giai điệu chính.
   - `giong = 2` (R2 của Luna): Sóng tam giác (`triangle`) + sine ấm cho bè hòa âm khi hai robot song ca.

---

## 2. Thiết kế Âm nhạc Mùa Hang Động (Mùa 7 ở bản 8 mùa / Mùa 8 ở bản 9 mùa)

Trong mùa Hang động đá vôi (**Xe thám hiểm & cứu hộ hang động R1**):

### 2.1 Bộ phận & Lệnh Python
| Gói | Bộ phận | Lệnh gốc → nâng cấp | Ý Python | Luật nhịp & cơ chế sân |
|---|---|---|---|---|
| 2 | Tay: **Loa** (`loa`) | `beat()` (gói 2) → `note(n)` / `note(n, so_nhip)` (gói 6) | `dict` (bảng tra khối đá → nốt, mã → hướng), `set` (tập nốt đã nghe) | Phát xung âm ở đầu nhịp; `note(n)` với `n = 1..8` (Đô..Đô cao), `note(n, k)` ngân `k` nhịp liên tiếp |
| 3 | Cảm biến: **Âm thanh** (`am-thanh`) | `hear()` (có tiếng vang không / hướng tiếng vang, gói 3) → `listen()` (đọc số nốt `1..8`, gói 7) | `n = listen()` trả về số nguyên `1..8` (hoặc `0` nếu im; gói đội trả `set` nếu nhiều nguồn) | Nghe tiếng vang từ cột chuông đá định vị, khối thạch nhũ rỗng hoặc từ robot kia |

### 2.2 Ba cơ chế âm thanh đặc trưng trong Hang động
1. **Định vị tiếng vang (Sonar — Gói 2 & 3)**:
   - R1 phát `beat()`, sóng âm dội vào vách hang / cột tiêu phát tín hiệu của đoàn khảo sát; cảm biến nghe phản hồi để tìm đường trong hang tối.
2. **Cộng hưởng Đá chuông / Thạch nhũ rỗng (Resonance — Gói 6 & 7)**:
   - Mỗi khối thạch nhũ rỗng trên sân có **tần số cộng hưởng riêng** (nốt `n = 1..8`) và **độ bền `k` nhịp** (ví dụ khối ghi `888` cần nốt `8` trong `3` nhịp liên tiếp).
   - Khi loa phát đúng nốt `n` liên tiếp đủ `k` nhịp (bằng vòng lặp hoặc `note(n, k)`), vạch rung trên khối đá dâng đầy và khối đá nứt mở đường / lăn xuống lấp khe vực. Nghỉ 1 nhịp hoặc phát sai nốt thì dao động tắt, đếm lại từ 0.
   - Ở Gói 7 (Nghe nốt): khối thạch nhũ không hiện sẵn số nốt; robot phải gõ/đứng cạnh gọi `n = listen()` để đo giọng ngân của đá rồi phát lại đúng nốt đó `k` nhịp.
3. **Mật mã âm vang R1 – R2 (Gói 9 Đội hai robot)**:
   - Vách đá dày chặn sóng bộ đàm, R1 và R2 truyền tín hiệu qua tiếng vang trong hang: R2 đọc địa hình tầng trên rồi phát nốt mật mã (`dict` `{3: "left", 5: "right", 8: "go"}`), R1 ở tầng dưới `listen()` nhịp tiếp theo để đi đúng ngách hang.

---

## 3. Kế hoạch Mùa Cuối "Về CLB": Nối các đoạn thành Bài Nhạc Chúc Mừng Chiến Thắng

*(Lưu ý đánh số mùa: Trên nhánh `main` 8 mùa là **Mùa 8 Về CLB**; trên nhánh `claude/them-mua-ke-hoach-c51a50` 9 mùa có thêm Cảng sông là **Mùa 9 Về CLB**. Thiết kế âm nhạc dưới đây tương thích cả hai cấu trúc).*

### 3.1 Ý tưởng cốt lõi: "Khúc Khải Hoàn CLB" ghép dần qua từng nơi giải cứu
- Sau cơn bão trước Ngày hội Robot, Sola và Luna quay lại từng nơi để giải cứu.
- **Màn 10 (Màn Trùm) của mỗi gói giải cứu (Gói 1..8/9)**: Sau khi hai robot hoàn thành nhiệm vụ giải cứu tại hiện trường (hoặc ngay tại bục phao/cổng đích cuối màn), hai robot đứng vào vị trí phát **Đoạn nhạc tín hiệu an toàn (Motif 8 nhịp)** của nơi đó.
- Mỗi đoạn gồm **8 phách (2 ô nhịp 4/4)**:
  - **Sola (R1)**: Phát giai điệu chính (`r1`).
  - **Luna (R2)**: Phát bè hòa âm quãng 3 / quãng 6 (`r2`) + nhịp trống (`beat()`).
- Khi thắng màn 10 của gói $k$:
  1. Đoạn nhạc thứ $k$ được mở khóa và lưu vào tiến độ người chơi.
  2. Bảng chiến thắng phát **nối tiếp từ Đoạn 1 đến Đoạn $k$** (`AmThanh.phatDoanChienThang(k, { noi: true })`), để người chơi nghe bài hát dài dần lên sau mỗi gói!
  3. Trên màn hình chọn gói của Mùa cuối có **"Đĩa nhạc Ngày hội (8 mảnh ghép)"**: mỗi gói xong sáng thêm 1 cung nhạc, bấm vào nghe lại toàn bộ các đoạn đã nối.

### 3.2 Bản tổng phổ 9 Đoạn Nhạc Chiến Thắng (`DOAN_CHIEN_THANG` trong `am-thanh.js`)

Tất cả các đoạn được sáng tác riêng cho game (không vướng bản quyền), viết ở giọng **Đô trưởng (nốt 1..8 = Đô4..Đô5)** để ghép nối mượt mà thành một bản hành khúc 9 đoạn × 8 nhịp = 72 nhịp (có đầy đủ Cảng sông):

| Đoạn | Nơi giải cứu | Âm hưởng | Giai điệu R1 (Sola) | Bè hòa âm R2 (Luna) | Nhịp trống |
|---|---|---|---|---|---|
| **1** | **Kho hàng** (`kho-hang` — Chú Tư) | Khởi hành vững chãi (I – IV – I) | `1 3 5 5 · 6 5 3 1` | `1 1 3 3 · 4 3 1 1` | `x . x . x . x x` |
| **2** | **Nhà máy** (`nha-may` — Cô Hạnh) | Guồng hơi nước rộn ràng (ii – V) | `2 4 5 6 · 5 4 3 2` | `1 2 3 4 · 3 2 1 5` | `x . x x x . x .` |
| **3** | **Bãi tái chế** (`bai-tai-che` — Bác Sáu) | Bước nhảy đệm từ (iii – vi – ii – I) | `3 5 8 6 · 5 3 2 3` | `1 3 5 4 · 3 1 5 1` | `x x . x x . x .` |
| **4** | **Cảng sông** (`cang-song` — Bác Ba) | Còi tàu rẽ sóng ra khơi (I – IV – V) | `1 4 6 6 · 5 4 2 5` | `1 2 4 4 · 3 2 5 3` | `x . x x . x x .` |
| **5** | **Bến sông** (`ben-song` — Bác Ba) | Lướt sóng vượt sông (IV – I – V) | `4 6 8 7 · 6 5 3 5` | `2 4 6 5 · 4 3 1 3` | `x . . x x . x .` |
| **6** | **Nông trại hoa** (`nong-trai` — Chị Lan) | Trăm hoa đua nở (I – IV – I) | `5 6 5 3 · 4 5 3 1` | `3 4 3 1 · 2 3 1 6` | `x . x . x x . x` |
| **7** | **Mỏ đá** (`mo-da` — Anh Dũng) | Vượt dốc núi cao (ii – V7) | `2 3 4 6 · 5 6 7 5` | `5 1 2 4 · 3 4 5 3` | `x x x . x x x .` |
| **8** | **Hang động** (`hang-dong` — Chú Phong) | Chuông đá ngân vang (I cao trào) | `8 7 6 5 · 6 7 8 5` | `5 5 4 3 · 4 5 6 3` | `x . . . x . x .` |
| **9** | **Ngày hội CLB** (`ngay-hoi` — Thầy hiệu trưởng) | Khúc Khải Hoàn Ngày Hội (IV – V – I kết) | `6 7 8 5 · 6 4 5 8` | `4 5 6 3 · 4 2 3 5` | `x x x x x . x x` |

### 3.3 Cấu trúc 20 màn của Gói 10 Mùa Cuối: "Ngày Hội Robot"

#### Chương 1: `tap-song-ca` — Tập Song Ca (10 màn)
Sola (R1) và Luna (R2) đứng trên sân khấu CLB, ôn lại các cấu trúc Python (`list`, `tuple`, `dict`, hàm có tham số) để ghép bè:
1. **Màn 1 (Khởi động hai loa)**: R1 phát câu Kho hàng (`[1, 3, 5, 5, 6, 5, 3, 1]`), R2 gõ nhịp trống `beat()` vào các phách mạnh.
2. **Màn 2 (Hòa âm quãng ba)**: R1 phát giai điệu, R2 tính bè trầm bằng phép trừ `note(n - 2)` từ danh sách của R1.
3. **Màn 3 (Đọc cặp nốt song ca — `tuple`)**: Bản nhạc cho dưới dạng danh sách cặp `[(1, 1), (3, 1), (5, 3)...]`; gỡ cặp `a, b = pair`, R1 phát `a`, R2 phát `b`.
4. **Màn 4 (Nối hai câu Kho hàng + Nhà máy)**: Viết hàm `play_phrase(notes)` và nối hai danh sách câu 1 + câu 2.
5. **Màn 5 (Hát đuổi Canon)**: R1 bắt đầu trước 2 nhịp, R2 chờ `rest(2)` rồi phát lại cùng câu tạo hiệu ứng đuổi âm vang.
6. **Màn 6 (Tra bảng câu nhạc — `dict`)**: Bảng `SONGS = {"kho": [...], "song": [...]}`; đọc yêu cầu trên sân rồi phát đúng câu của trạm đó.
7. **Màn 7 (Đổi giọng / Dịch tông)**: Dịch câu nhạc lên cao `k` bậc khi vào điệp khúc (`note(n + k)`).
8. **Màn 8 (Vừa diễu hành vừa hòa nhạc)**: R1 và R2 đi đối xứng trên sân khấu lễ hội, mỗi bước phát 1 nốt của Đoạn 5 & 6.
9. **Màn 9 (Ghép nửa bài đầu — Đoạn 1..4)**: Phối hợp R1 + R2 phát liền 32 nhịp đầu tiên.
10. **Màn 10 (Trùm Chương 1 — Tổng duyệt phần hai)**: Phối hợp R1 + R2 phát liền Đoạn 5..8 và về đúng bục danh dự.

#### Chương 2: `bai-ca-chien-thang` — Bài Song Ca Chúc Mừng Chiến Thắng (10 màn)
Kết hợp **giải đố điều khiển sân khấu + phát nhạc chiến thắng**:
- **Màn 1–4**: Dẫn nguồn điện / đẩy hộp màu / mở van hơi / kích hoạt chuông đá cho 4 góc sân khấu Ngày hội, mỗi góc bật sáng phát 2 đoạn nhạc đã thu.
- **Màn 5–8**: Phối hợp 2 robot vượt chướng ngại tổng hợp trong trần nhịp để thu thập các bản ghi âm bị gió thổi lệch và phát kiểm tra.
- **Màn 9 (Đội hình danh dự)**: R1 và R2 di chuyển vào tâm sân khấu đồng thời phát khúc dạo đầu mở màn Ngày hội.
- **Màn 10 (TRÙM CUỐI GAME — Khúc Khải Hoàn CLB Mật Lệnh Robot)**:
  - Sân khấu lớn có mặt đầy đủ các cỗ máy đại diện các mùa ở viền sân.
  - Người chơi lập trình cho **R1 (Sola)** và **R2 (Luna)** dùng hàm và vòng lặp duyệt qua toàn bộ **8 đoạn nhạc chiến thắng (`DOAN_CHIEN_THANG`)** vừa di chuyển đội hình vừa hòa âm 2 bè.
  - Ngay khi nốt cuối cùng (`8` — Đô cao) vang lên:
    - Sân khấu bắn pháo hoa vector (`AmThanh.phat('phaoHoa')`), các cỗ máy quanh sân nháy đèn theo nhịp.
    - Nhạc nền tự động chuyển sang chế độ **`AmThanh.datCheDo('khaiHoan')`** phát bản hòa tấu 4 kênh chúc mừng chiến thắng toàn game!

---

## 4. Lộ trình triển khai kỹ thuật (Checklist các bước)

- [x] **Bước 1 (Đã xong trong `hoc/game/am-thanh.js` & `hoc/game/man-choi.js`)**:
  - Nâng cấp nhạc nền 4 kênh (`soan`, `chay`, `trum`, `khaiHoan`, `im`) với giai điệu 128 bước, bè phụ, bass nảy và bộ trống Kick/Snare/Hi-hat.
  - Thêm `thangTrum` (fanfare thắng màn Trùm), nâng cấp `thang`, `sao(2)`, `loa(am, dai, giong)`.
  - Định nghĩa `AmThanh.DOAN_CHIEN_THANG` (9 đoạn × 8 nhịp = 72 nhịp, có Cảng sông) và hàm `AmThanh.phatDoanChienThang(soDoan, tuyChon)`.
- [x] **Bước 2 (Đã tích hợp Lõi Loa 2 bè & `note(n, so_nhip)` vào `hoc/san-hoc.js`, `hoc/cham.js`, `hoc/so-lenh.js`, `hoc/kho-ham.js`)**:
  - Đưa phần `LOA` sang `main` và mở rộng cho **2 robot song ca**:
    - Hỗ trợ `man.dieu` cho 1 robot (chuỗi `"1 3 5..."`) hoặc **2 robot song ca** (`man.dieu = { r1: "1 3 5...", r2: "1 1 3..." }`).
    - Hỗ trợ `note(n)` và `note(n, so_nhip)` (2 tham số: `n = 1..8`, `so_nhip = 1..8` mặc định `1`; khi đứng yên 1 `wait()` tự kéo dài đủ `so_nhip` nhịp, khi di chuyển thì ngân suốt `so_nhip` bước đi).
- [x] **Bước 3 (Đã tích hợp Giao diện Bản nhạc mờ 2 bè, Vector Loa & Bộ kiểm thử `hoc/kiem-loa.mjs`)**:
  - Tạo `hoc/game/ban-nhac.js`: Hiển thị 1 bè hoặc 2 dòng bè (R1 Sola + R2 Luna), nút `Nghe đề` (SVG `Ve.ico('nhac')`) và `BanNhac.phatChienThang(soDoan, tuyChon)`.
  - Tích hợp vẽ vector loa trên thân robot (`ve-vector-tay-son.js`, `ve-robot.js`, `san-ve.js`), đèn bộ phận `loa` (`den-bo-phan.js`), ô số nốt & số nhịp trên thẻ lệnh (`thanh-phan.js`, `choi.css`).
  - Máy kiểm `hoc/kiem-loa.mjs` kiểm tra toàn bộ 27 hạng mục (100% pass).
- [ ] **Bước 4 (Dựng màn Mùa Hang động & Mùa cuối Về CLB khi lên nội dung màn)**:
  - Dựng màn 10 mỗi gói giải cứu của Mùa cuối có đoạn kết phát câu nhạc của trạm đó.
  - Dựng 20 màn Gói 10 (`tap-song-ca` & `bai-ca-chien-thang`).
