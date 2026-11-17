# Kế hoạch: gộp Mật Lệnh Robot vào `diem10code-python`, chia hai bản, làm đẹp giao diện

Lập 17/11/2026. **Chưa làm gì.** Chưa chuyển code, chưa tạo repo, chưa push.
Thay cho mục 5 của [KE-HOACH-GOP-DIEM10CODE.md](KE-HOACH-GOP-DIEM10CODE.md) (27/10). Phần khung D10 vẫn theo
`tin_hoc/KE-HOACH-GOP-GAME-LOGIC.md`.

### Đã chốt (user 17/11)

1. **Giữ lịch sử: cách A** (thay `main` của `diem10code-python` bằng lịch sử game này, `main` cũ cất ở nhánh lưu trữ).
2. **Bản Ôn thi = bản 5 mùa** của `diem10code-python` (`hoc/KE-HOACH-4-MUA-COT-LOI.md`: 4 mùa cốt lõi + mùa Tổ hợp).
3. **Bản Ôn thi không có khái niệm `wait()`**: mỗi lệnh tự chiếm một nhịp. Bản đầy đủ giữ `wait()` như hiện nay.
4. **Tính phí: mua "bản đầy đủ" một lần cho mọi game** diem10code (Python, logic, SQL...). Bản Ôn thi không bán. Bỏ
   bán lẻ từng mùa 49.000đ.
5. **Thứ tự: nối thành một game dùng chung lõi trước, sửa sau.** Bản Ôn thi chạy trên đúng lõi của bản đầy đủ ngay từ
   đầu, nội dung và giao diện làm đẹp dần.
6. **Khách (chưa đăng nhập) chơi được cả 5 mùa bản Ôn thi.** Đăng nhập chỉ để lưu tiến độ theo tài khoản.
7. **Chưa mua thì không chơi được bản đầy đủ** (không có phần chơi thử).
8. **Mang `phim-clb/` sang** repo mới (cách A mang sẵn cả cây).
9. **5 mùa theo bản mới nhất**: `KE-HOACH-4-MUA-COT-LOI.md` (6/11): Kho hàng, Bãi tái chế, Bến sông, Nông trại, Tổ hợp.
10. **Hai bản gần nhau nhất có thể**: cùng tên lệnh, tên part, Sổ lệnh, giao diện ở mọi chỗ; chỉ khác đúng chỗ bắt buộc vì
    bỏ `wait()` (mục 2.1).

Không còn câu hỏi treo (mục 9).

---

## 1. Hiện trạng đã đọc

### 1.1 Ba repo diem10code (`D:\Users\tuanla2\game\`)

| | `diem10code-python` | `diem10code-sql` (Sổ Ngày Hội) | `diem10code-logic` (Mạch Đèn) |
|---|---|---|---|
| Remote | `tuanla90/diem10code-python` | `tuanla90/diem10code-sql` | `tuanla90/diem10code-logic` |
| Công nghệ | trang tĩnh, JS thường, không build (giống game này) | React 19 + Vite 8 + TS, Vitest | React 19 + Vite 8 + TS, Vitest |
| Dựng / chạy | `npm start` (server.mjs, cổng 4180) | `npm run dev` / `build` ra `dist/` | `npm run build` → `dist/`, `npm start` phục vụ `dist/`; Railway qua `Dockerfile` |
| Commit cuối | 83f5886, 6/11 | 1cc31c0, 16/11 | 919d11b, 17/11 |
| Việc dở | **6 tệp xoá chưa commit** (`man-m1-*.js`, `kiem-m1-nhanh.mjs`), 1 tệp lạ `hoc/trace-banh.mjs` | sạch | sạch |

**`diem10code-python` là bản tách từ chính game này** (commit a7306a8, 5/11): chép `nhan/`, `hoc/game/*`, lõi chấm,
bỏ toàn bộ 142 tệp màn, phim, máy kiểm. Kế hoạch riêng của nó: `hoc/KE-HOACH-4-MUA-COT-LOI.md` (4 mùa × lưới 4×8 = 128 màn,
không `tuple` / `dict` / `set` / mảng 2 chiều, 8 dạng bài: chỉ xem, đoán rồi chạy, điền chỗ trống, sắp xếp, sửa lỗi, viết có
gợi ý, viết hàm, tự lực). Màn thật **chưa viết**. Chạy thử 17/11: trang đầu lên, bản đồ thế giới hỏng (27 lỗi 404, ảnh
mùa không có), vì tệp màn mùa 1 đang bị xoá dở.

Lõi của nó là bản cũ (5/11) của lõi game này. Từ 5/11 tới nay game này đã thêm: mùa 4–9, cần cẩu 4 hướng, xuồng, bảng dữ
liệu theo sân, chọn đội, lắp ráp mùa 9, phim CLB, hàng trăm máy kiểm.

### 1.2 Hai bản ở hai game anh em

| | Mạch Đèn (logic) | Sổ Ngày Hội (SQL) |
|---|---|---|
| Kiểu chia | **Một mã nguồn, hai bản, một đường dẫn** (commit caf8c17) | **Một bộ màn, hai cách sắp** (thẻ lộ trình) |
| Bản dễ / hẹp | `thpt` "Ôn thi THPT", 7 chuyên đề `c1`..`c7`, 36 màn, sao chấm thuần tư duy, mặc định | `thpt` "Ôn thi THPT": 10 gói xếp lại thành Chuyên đề 1–10, đưa SELECT lên đầu, mặc định |
| Bản đầy đủ | `day-du` "Bản đầy đủ", 10 ngày `n0`..`n9`, đủ cơ chế | `cot-truyen` "Cốt truyện 84 Giờ", thứ tự gói gốc |
| Màn của hai bản | mã khác nhau (`c1-01` / `n1-01`), bản suy ra từ mã | **cùng màn**, chỉ khác thứ tự |
| Lưu bản đang chọn | `localStorage['mach-den.ban.v1']` | `so-ngay-hoi:tuy-chon:v1` (`loTrinh`, `tuDo`) |
| Tiến độ | chung một kho, mã không trùng nên không lẫn | chung một kho theo mã màn |
| Chọn bản ở đâu | hai thẻ cạnh nhau đầu trang lộ trình + trong Cài đặt (`ChonBan.tsx`) | thẻ "Ôn thi THPT / Cốt truyện" đầu trang chọn gói |
| Mở tự do | công tắc "Chọn chuyên đề tự do" | công tắc "Chọn gói tự do" |
| Bố cục web | `src/ban-web.css` nạp cuối, đổi bố cục từ 1024px | chưa có, khung điện thoại |
| Sáng / tối | có, nhớ riêng (`mach-den.chu-de`) | có, đọc chế độ của hồ sơ diem10code (`tinhoc_thpt_v1:<id>`.settings.theme) |

Chưa game nào nối đăng nhập / Premium thật: khung `window.D10` và đường dẫn `/choi/<game>/` trong
`tin_hoc/KE-HOACH-GOP-GAME-LOGIC.md` vẫn là kế hoạch (`tin_hoc/public/choi/` chưa có, `KHOA_CHO_PHEP` chưa có khoá game).

### 1.3 Game này (`doi-robot-chan-hung`, main d6e023a)

| Thứ | Hiện trạng |
|---|---|
| Lộ trình | `hoc/lo-trinh-hoc.js` nạp ngân hàng `man-*.js` rồi sắp lại. Đếm 17/11: **2223 màn**, trong đó 9 mùa × 10 gói = 1794 màn (mùa 9 trên main còn 194, G8 dở), 429 màn ở `mua-an` "Kho lưu trữ". Con số 1128 trong memory đã cũ. |
| Mùa / gói | `hoc/thu-tu-chuong.js`: `mua-1` Kho hàng (miễn phí), `mua-2` Nhà máy, `mua-3` Bãi tái chế (khai `ban: { gia: '49.000đ' }`), `mua-4`..`mua-9` thêm `an: true`. Mã mùa trong code: 4 Cảng sông, 5 Bến sông, 6 Nông trại, 7 Mỏ đá, 8 Hang động, 9 CLB. |
| Bán | **mua thử**: cờ `duong-hoc:da-mua` trên máy (`hoc/game/mo-goi.js`, `chuaMua`). Chưa nối thanh toán. |
| Tiến độ | `hoc/game/luu.js`: `duong-hoc:tien-do` (sao theo `ma` màn), `duong-hoc:nhap:<ma>`, `duong-hoc:da-xem`, `duong-hoc:lap:<ma>`. Không tách theo hồ sơ. |
| Giao diện | `hoc/game/choi.html` nạp **230 thẻ `<script>`** (khoảng 250 yêu cầu mạng lúc chơi). `choi.css` 1309 dòng, `choi-vector.css` 959 dòng. Màu đã gom về `bang-mau.js` (203 màu gốc, biến `--g-*`). Phông Google Sans Flex / Code tự chứa. Chưa có nền tối. |
| Máy kiểm | `npm test` → `tools/kiem-tat-ca.mjs`, chạy lần lượt mọi `kiem-*.mjs` trong `nhan/` và `hoc/` (132 tệp ở `hoc/`). Mỗi tệp tự tìm đường từ vị trí của nó. |
| Dung lượng | `.git` 406 MB (gói). 1923 tệp theo git, 701 trong `phim-clb/` (video Remotion; tệp lớn nhất 7,7 MB). `phim-clb/` trên đĩa 3 GB (phần lớn `node_modules`, `out`). `review-man/` 895 MB đã bỏ qua git. Không có blob nào trên 20 MB trong lịch sử. |
| Nhánh dở | `claude/mua-9-tiep` (worktree `.claude/worktrees/mua-9-tiep`, 4b303d3): 59 commit chưa gộp, đủ G1–G10 mùa 9. `claude/mua-8-hang-dong` đã gộp. |
| Việc chưa commit trên main | khay hàm, chip biểu thức ở màn 122.1 (`choi.css`, `choi-vector.css`, `chu.js`, `man-choi.js`, `thanh-phan.js`, `xuong-ham.js`, `kiem-khay.mjs`): **không đụng**. |

---

## 2. Hai bản: game này nằm ở đâu

| | **Ôn thi THPT** (bản 5 mùa, miễn phí, mặc định) | **Bản đầy đủ: Mật Lệnh Robot** (trả phí) |
|---|---|---|
| Ai | học sinh ôn thi Tin học | em thích chơi, muốn học rộng |
| Nguồn thiết kế | `diem10code-python/hoc/KE-HOACH-4-MUA-COT-LOI.md` (6/11) | game này |
| Mùa | 1 Kho hàng (hai bánh, kẹp, khoảng cách) · 2 Bãi tái chế (nhện, nam châm, cảm ứng từ) · 3 Bến sông (xuồng, dây phao kéo, camera màu) · 4 Nông trại (drone, vòi phun, hồng ngoại) · 5 Tổ hợp (chưa thiết kế) | 9 mùa, 9 nơi |
| Phạm vi Python | `def`, `for`, `if`/`while`, biến, tham số, chuỗi, `and`/`or`/`elif`, `list`; **không** `tuple`, `dict`, `set`, lưới 2 chiều | thêm `tuple`, `min`/`max`, `%` `//` `abs`, lưới 2 chiều, `dict`, `set`, hai robot, lắp ráp |
| Lệnh di chuyển | hai bánh, xuồng: `up()` `down()` `turn_left()` `turn_right()`; nhện, drone: **giữ đúng tên** `go_up()` `go_down()` `go_left()` `go_right()`; **không `wait()`**, mỗi lệnh một nhịp | hai bánh, xuồng: `left_move()` / `right_move()` + `wait()`; nhện, drone: `go_*()` + `wait()` |
| Khuôn mùa | lưới 4 cột (thân, tay, cảm biến, sân) × 8 hàng (chỉ xem, đoán rồi chạy, điền chỗ trống, sắp xếp, sửa lỗi, viết có gợi ý, viết hàm, tự lực) = 32 màn | 10 gói × 2 chương × 10 màn |
| Màn | **mã riêng** (kiểu Mạch Đèn), tiến độ tách khỏi bản đầy đủ | như hiện nay |
| Phim, bản đồ | dùng lại phim và bản đồ của bản đầy đủ cho 4 nơi trùng (Kho hàng, Bãi tái chế, Bến sông, Nông trại) khi đã khớp part; lúc đầu chưa bật | giữ phim CLB, bản đồ 9 nơi |
| Ai chơi được | **mọi người, kể cả khách** | **chỉ người đã mua bản đầy đủ** |

**Game này là Bản đầy đủ.** Hai bản cùng tên Mật Lệnh Robot, cùng một trang, cùng lõi `nhan/` + `hoc/san-hoc.js` +
`hoc/cham.js`, cùng giao diện `hoc/game/`.

### 2.1 Một lõi cho hai bản

- **Bản của một màn suy ra từ mã chương** (như `banCuaMa` của Mạch Đèn): chương bản Ôn thi có tiền tố `t` + số mùa
  (`t1-than`, `t1-tay`...), mã màn `t1-than.3`. Lõi, máy chấm, máy kiểm không cần cờ toàn cục.
- **Chế độ "mỗi lệnh một nhịp"** thêm vào lõi bằng cờ màn (`cfg.motNhip = true`, chương `t*` tự bật):
  - Hai bánh, xuồng: thêm 4 lệnh gốc `up` / `down` / `turn_left` / `turn_right`. Bản tách 5/11 đã làm và chạy được
    (`diem10code-python` commit a618cf4, `san-hoc.js` +17 dòng: `GOC_MOI_BANH` dùng lại luật `{trai, phai}` của xe
    bánh, `LENH_NGUOC` thêm 4 cặp). Bản đó **thay** `HAM_GOC.banh`; ở đây phải **thêm theo cờ**, không đổi
    `HAM_GOC.banh` của bản đầy đủ.
  - Nhện, drone: `go_*` giữ nguyên tên, chỉ tự chốt nhịp.
  - Tay, cảm biến: lệnh tay tự chiếm một nhịp; lệnh cảm biến không tốn nhịp (như hiện nay).
  - `wait()` không có trong khay, không có trong Sổ lệnh của bản Ôn thi.
- **Ô tay tác động** (luật chung của bản 5 mùa): thân có mũi (hai bánh, xuồng) thì ô trước mũi; thân không mũi (nhện,
  drone) thì ô đang đứng. Đối chiếu với lõi hiện nay ở giai đoạn 2, chỗ nào khác thì theo cờ `motNhip`.
- **Mọi tổ hợp thân + tay** được phép ở bản Ôn thi (chuỗi đổi part từng món một giữa các mùa).
- **Giữ hai bản gần nhau nhất** (quyết định 10). Chỉ ba chỗ được khác:
  1. không có `wait()`;
  2. hai bánh và xuồng dùng `up()` / `down()` / `turn_left()` / `turn_right()` (bỏ `wait()` thì
     `left_move()` / `right_move()` không còn ghép thành bước đi được);
  3. ô tay tác động theo luật bản 5 mùa nếu lõi hiện nay khác.
  Mọi thứ khác dùng chung: tên lệnh tay và cảm biến (`grab()`, `distance()`, `magnet_n()`...), tên part, hình
  robot, Sổ lệnh, khay, hộp thoại, chấm sao, lời sai (`loiSai` cùng mã). Máy kiểm `kiem-ban-on-thi.mjs` báo mọi tên
  lệnh có ở bản Ôn thi mà bản đầy đủ không có, ngoài 4 lệnh di chuyển trên.
- **Máy kiểm**: `hoc/kiem-ban-on-thi.mjs` chạy mọi `loiGiai` chương `t*` (3 sao, mọi sân), và bộ dò cú pháp chặn
  `wait(`, `tuple`, `{`, `set(`, `[..][..]` trong `loiGiai` / `maMau` của bản Ôn thi.

### 2.2 Nội dung khởi đầu (để "nối trước, sửa sau")

- Lấy lại **45 màn mùa 1** của bản tách (`diem10code-python` commit a618cf4: `man-m1-than`, `-tay`, `-cambien`, `-san`,
  `-trum`, đã dùng `up()` / `down()`, 45/45 lời giải thắng), đổi mã chương sang `t1-*`, gắn vào lõi mới. Bản Ôn thi
  chơi được ngay mùa 1.
- Mùa 2–4 ban đầu hiện "Sắp có".
- Sau đó mới dựng lại theo lưới 4×8 (32 màn / mùa, 8 dạng bài) và viết mùa 2–4, rồi thiết kế mùa 5 Tổ hợp.
- Ba dạng bài game chưa có (đoán rồi chạy, sắp xếp, điền chỗ trống) cần thêm cơ chế ở giao diện; dạng "chỉ xem" và
  "sửa lỗi" đã có (khoá sửa, code sẵn).

---

## 3. Sơ đồ thư mục sau khi gộp

`diem10code-python` là repo chính. Giữ **đúng đường dẫn hiện nay** (`hoc/`, `nhan/`, `tools/`), vì máy kiểm, `server.mjs`,
`sw.js`, 230 thẻ script và mọi `require` đều đi theo đường dẫn tương đối; dời vào thư mục con thì phải sửa hết.

```
diem10code-python/
├── README.md                 viết lại: hai bản, cách chạy, cách gộp vào diem10code
├── package.json              start, test (kiem-tat-ca), dong-bo (chép bản chụp sang tin_hoc)
├── server.mjs                giữ; thêm /choi/python/ để thử đường dẫn con
├── nhan/                     lõi chạy Python (RobotCore)
├── hoc/
│   ├── game/                 giao diện (choi.html, css, vẽ vector, phim, bản đồ)
│   │   ├── ban.js            MỚI: bản đang chọn ('thpt' | 'day-du'), chữ theo bản, nhớ lựa chọn
│   │   ├── ban-web.css       MỚI: bố cục từ 1024px (nạp cuối)
│   │   └── d10.js            MỚI: nối window.D10 nếu có (đăng nhập, tiến độ, quyền), không có thì chạy như cũ
│   ├── lo-trinh-hoc.js       bản đầy đủ (giữ nguyên)
│   ├── lo-trinh-on-thi.js    MỚI: 5 mùa bản Ôn thi (chương t1-* … t5-*)
│   ├── man-t1-*.js …         MỚI: màn bản Ôn thi, mã riêng (khởi đầu: 45 màn mùa 1 của bản tách 5/11)
│   ├── san-hoc.js            lõi chung; thêm chế độ cfg.motNhip (up/down/turn_*, không wait)
│   ├── man-*.js              ngân hàng màn bản đầy đủ (giữ)
│   ├── kiem-*.mjs            máy kiểm (giữ) + kiem-ban-on-thi.mjs
│   └── KE-HOACH-*.md, ban-giao/   tài liệu (giữ)
├── docs/
│   └── tach-5-11/            KE-HOACH-4-MUA-COT-LOI.md (kế hoạch gốc của bản Ôn thi), trace-banh.mjs
├── phim-clb/                 dự án Remotion (mang sang, quyết định 8)
└── tools/kiem-tat-ca.mjs
```

### 3.1 Giữ lịch sử git

| Cách | Làm gì | Được | Mất |
|---|---|---|---|
| **A. Thay gốc (ĐÃ CHỐT 17/11)** | Đẩy `main` của game này lên remote `diem10code-python` làm `main` mới. `main` cũ (4 commit tách 5/11) cất ở nhánh `luu-tru/tach-5-11`. Chép 4 tệp riêng của bản tách vào `docs/tach-5-11/` bằng một commit. | Lịch sử game nguyên vẹn, `git log` / `blame` từng tệp như cũ, không xung đột | `main` cũ không còn là tổ tiên của `main` mới (vẫn còn ở nhánh lưu trữ). Cần push ép lên `main` của remote: làm khi user bảo đẩy. |
| B. Gộp không chung gốc (không chọn) | Trong `diem10code-python`: `git fetch` game, `git merge --allow-unrelated-histories`, giải xung đột nghiêng về game | Cả hai lịch sử là tổ tiên | 97 tệp trùng đường dẫn (`hoc/game/*`, `cham.js`...), 42 tệp khác nội dung phải giải tay; dễ lấy nhầm bản cũ 5/11 |
| C. `git subtree add --prefix=game/` (không chọn) | Đặt game vào thư mục con | Không chạm tệp cũ | Đổi mọi đường dẫn (server, máy kiểm, launch), đúng chỗ dễ vỡ nhất |

Sau khi gộp: `doi-robot-chan-hung` thêm một dòng README trỏ sang repo mới và lưu trữ (archive) trên GitHub; không xoá.

**Trước bước này phải xong:** bản sửa chưa commit trên main (khay hàm, chip 122.1) được commit hay bỏ; nhánh
`claude/mua-9-tiep` gộp main (hoặc user chốt mang sang sau, nhánh vẫn gộp được vì cùng lịch sử với cách A).

---

## 4. Dùng chung với diem10code

| Thứ | Dùng chung thế nào | Phía game |
|---|---|---|
| Chỗ đứng | `diem10code.com/choi/python/`, bản chụp chép bằng script đồng bộ của `tin_hoc` (như kế hoạch game logic). Không build: chép `hoc/`, `nhan/`, bỏ `kiem-*.mjs`, `do-duong-*.mjs`, `*.md`, `hinh-mau/`, `phim-clb/` gốc. | Mọi đường dẫn trong `choi.html` đã tương đối. `sw.js` phải đổi phạm vi về thư mục của nó và đặt tên bộ đệm riêng để không đụng `sw.js` phạm vi `/` của diem10code. |
| Đăng nhập | cookie `tinhoc.sid` cùng tên miền; `window.D10.user` | `d10.js`: khách chơi cả 5 mùa bản Ôn thi, tiến độ lưu trên máy; đăng nhập để lưu theo tài khoản (gộp bản khách vào hồ sơ lần đầu) |
| Lưu tiến độ | bảng `progress`, khoá **`gamePython`**, gộp kiểu hợp | `luu.js` thêm đuôi hồ sơ `:<hoSoId>`; gộp: sao lấy cao hơn, `da-xem` hợp tập, `da-mua` bỏ (quyền lấy từ D10). Nháp code (`nhap:<ma>`) chỉ lưu trên máy. Đăng nhập lần đầu: gộp bản khách vào hồ sơ. |
| Bản đang chọn | lưu trong cùng khoá `gamePython` (trường `ban`) để đổi máy vẫn nhớ | `ban.js` |
| Thanh toán (ĐÃ CHỐT) | **mua bản đầy đủ một lần cho mọi game** diem10code; nguồn duy nhất là `plan` của `/api/me` (cờ "đã mua bản đầy đủ") | bản Ôn thi: mở hết. Bản đầy đủ: **khoá cả 9 mùa** khi chưa mua; thẻ "Bản đầy đủ" ở trang đầu vẫn hiện, chạm thì mở hộp mua. `mo-goi.js`: thay `chuaMua` (49.000đ từng mùa) bằng `quyenChoi(ban)` → `mo` / `can-ban-day-du`; mở thẳng `?man=` một màn bản đầy đủ cũng phải qua `quyenChoi`. Chạy riêng (không có D10) thì giữ mua thử như cũ để máy kiểm không đổi. |
| Bảng màu | `tin_hoc/public/css/tokens.css`: indigo `#4f46e5`, nền lavender `#f5f4fc`, mực chàm `#1e1b4b`, cyan; bản tối | `bang-mau.js` đã có biến `--g-*`; thêm bộ giá trị tối, đọc chế độ của hồ sơ diem10code như `diem10code-sql/src/app/che-do.ts` |
| Phông | Google Sans Flex / Code (game đã tự chứa trong `hoc/game/font/`, cùng bộ với hai game kia) | giữ |
| Nhân vật | Sola, Luna, R1 theo `VU-TRU-DIEM10CODE.html`; ảnh mặt đã có trong `diem10code-sql/public/mat/`, `diem10code-logic/dist/mascot/` | chân dung trong hộp thoại dùng cùng bộ ảnh |
| Chữ hiển thị | luật diem10code: không emoji, không gạch dài | máy kiểm chữ (đã đề xuất ở kế hoạch 27/10 mục 4) |
| Sự kiện | `choi-mo`, `choi-xong-man` (`python:<ma>`), `choi-cham-khoa` | `d10.js` |

Repo game không biết URL, cookie hay luật gói của diem10code. Mọi thứ qua `window.D10`.

---

## 5. Giao diện web: đánh giá

Chụp 17/11 bằng trình duyệt trong app, khổ 375×812 và 1280×800.

### 5.1 Mật Lệnh Robot (main d6e023a)

| Màn | Tốt | Chưa tốt |
|---|---|---|
| Trang đầu | sạch, nền lavender, nút CHƠI indigo lớn, đã cùng tông diem10code | không cho biết đang ở bản nào, chưa có lối vào bản Ôn thi |
| Bản đồ 9 nơi | tranh đẹp, có cảm giác hành trình | tranh vẽ tay (raster), khác hẳn phần còn lại phẳng vector; Mùa 9 nằm **trên** Mùa 1 nên thứ tự khó đọc; mọi mùa sau đều hiện ổ khoá nên trang đầu toàn khoá; nhãn mùa nhỏ |
| Hộp mùa, thẻ gói | gọn, có sao / tiến độ | nút CHƠI trên thẻ gói **xanh lá**, chỗ khác indigo: hai màu cho cùng một việc; chấm phân trang dưới đáy nhỏ |
| Lưới màn | 2 chương × 10 ô, rõ | ô khoá chiếm nửa màn hình, không nói vì sao khoá |
| Phim gói | nhân vật chibi đẹp | tranh raster nặng; nút "Bỏ qua" là lối duy nhất |
| Màn chơi 375px | đủ thứ trong một màn, không cuộn | **sân chỉ chiếm khoảng nửa bề ngang** vì cột 5 nút đứng bên phải; lời nhắc đè góc trên; 10 dòng code trống chiếm chỗ; khay lệnh hẹp; **33 nút dưới 44px** (×1 và Đề bài 59×28, nút xoá 38×33, khối lệnh cao 35, nút cột phải cao 40) |
| Màn chơi 1280px | chạy | vẫn là cột điện thoại 375px giữa nền trống, sân nhỏ trên màn lớn |
| Tải | chơi được không mạng (service worker) | 230 thẻ script, khoảng 250 yêu cầu, 0,76 MB tranh chỉ để vào một màn |
| Nền tối | | chưa có |

### 5.2 Hai game anh em (để lấy mẫu)

- **Mạch Đèn**: hai thẻ chọn bản ngay đầu trang; khối "Bắt đầu" nói rõ chuyên đề kế tiếp; công tắc mở tự do; danh sách
  chuyên đề một cột; thanh đáy ba mục (Chuyên đề, Sổ tay, Cài đặt); nút sáng / tối. Lỗi nhỏ: dòng phụ dưới tên game bị
  nút loa che ở 375px.
- **Sổ Ngày Hội**: thẻ gói có icon hai tông, kỹ năng viết bằng phông code, thanh tiến độ, nhãn "Cần 18 sao" trên gói
  khoá; Luna nói một câu đầu trang. `dist/` trên máy là bản 1/11, chưa có hai lộ trình (bản mới ở `src/`).
- **diem10code-python**: cùng giao diện với game này (bản 5/11), bản đồ hỏng.

### 5.3 Đề xuất (xếp theo lợi / công)

1. **Chọn bản ở trang đầu** (giống Mạch Đèn): hai thẻ "Ôn thi THPT · 5 mùa" và "Bản đầy đủ · 9 mùa", dưới là khối
   "Bắt đầu / Chơi tiếp" nói tên mùa, cột kế tiếp. Đổi bản trong Cài đặt.
2. **Trang lộ trình bản Ôn thi**: danh sách thẻ mùa một cột; mở một mùa thì thấy lưới 4 cột (thân, tay, cảm biến,
   sân) × 8 hàng dạng bài, mỗi ô ghi dạng bài ("Đoán", "Sửa lỗi"...); công tắc "Chọn màn tự do". Không bản đồ, không phim.
3. **Một màu cho hành động chính**: indigo cho mọi nút Chơi / Chạy; xanh lá chỉ cho "đúng / thắng". Sửa qua `bang-mau.js`.
4. **Màn chơi 375px**: sân rộng hết bề ngang; hàng nút Chạy / Nhịp / Lại / Gợi ý nằm ngang dưới sân; số dòng code
   theo lời giải (+2 dòng trống), không cố định 10; khay lệnh thành tấm trượt đáy khi chạm ô trống; mọi nút từ 44px;
   lời nhắc thành dải dưới sân, không đè.
5. **Bố cục web từ 1024px** (`ban-web.css`, cách Mạch Đèn): trái là sân lớn + đề + nút Chạy, phải là code + khay;
   trang lộ trình chia hai cột (bìa, tiến độ | lưới thẻ).
6. **Bản đồ 9 nơi** (bản đầy đủ): Mùa 1 ở dưới, đi lên tới CLB; chỉ mùa kế tiếp có nhãn rõ, các mùa xa mờ đi thay vì
   khoá đỏ; nén tranh WebP theo khổ màn hình.
7. **Nền tối**: bộ giá trị tối cho `--g-*`, đọc chế độ hồ sơ diem10code.
8. **Thanh trên 40px của diem10code** (`khung-choi.js`): kiểm không đè đầu màn chơi ở 375px dọc và ngang.
9. **Gộp script khi xuất bản** (để sau): script đồng bộ nối 230 tệp thành vài tệp; mã nguồn vẫn tách.

Không đổi luật chơi, không đổi hình robot / part.

---

## 6. Các giai đoạn

Thứ tự theo quyết định 5: **nối thành một game dùng chung lõi trước, sửa sau**. Mỗi giai đoạn một nhánh, gộp khi máy
kiểm xanh. Máy kiểm chạy **lần lượt từng tệp** (`npm test` vốn tuần tự; không chạy hai `npm test` cùng lúc, không giao
`npm test` cho agent).

| GĐ | Việc | Ở đâu | Đầu ra kiểm được |
|---|---|---|---|
| **0. Dọn** | Commit hay bỏ bản sửa khay hàm / chip 122.1; gộp `claude/mua-9-tiep` (qua `/push-main`); trong `diem10code-python`: lấy lại 6 tệp xoá dở vào nhánh lưu trữ (không mất), cất `trace-banh.mjs` | game, `diem10code-python` | `git status` sạch cả hai repo; `npm test` của game: số bộ đạt bằng nền trước khi gộp |
| **1. Chuyển nhà** (cách A) | Nhánh `luu-tru/tach-5-11` = `main` cũ; đẩy `main` game lên `diem10code-python` (push ép, khi user bảo); commit `docs/tach-5-11/`; README mới; README game cũ trỏ sang, archive repo cũ | `diem10code-python` | `git log` đủ lịch sử game; `npm start` mở game ở cổng 4180; `npm test` cùng kết quả như repo cũ |
| **2. Lõi chung: chế độ mỗi lệnh một nhịp** | `cfg.motNhip` trong `san-hoc.js`: `up` / `down` / `turn_left` / `turn_right` cho hai bánh, xuồng (mang từ a618cf4, thêm theo cờ thay vì thay `HAM_GOC`); `go_*` nhện, drone tự chốt nhịp; lệnh tay tự chốt; ô tay tác động theo luật bản 5 mùa; Sổ lệnh / khay ẩn `wait` khi cờ bật | `hoc/san-hoc.js`, `cham.js`, `so-lenh.js` | `kiem-mot-nhip.mjs` mới (mỗi lệnh đúng một nhịp, lệnh ngược, đâm tường, tay trước mũi / tại chỗ); **mọi máy kiểm cũ giữ nguyên kết quả** (bản đầy đủ không đổi) |
| **3. Một game hai bản** | `ban.js` (bản suy ra từ tiền tố chương `t`), hai thẻ chọn bản ở trang đầu + Cài đặt, chữ theo bản; `lo-trinh-on-thi.js` khai 5 mùa; nạp 45 màn mùa 1 của bản tách thành `t1-*`; mùa 2–5 "Sắp có"; bản Ôn thi ẩn phim và bản đồ | `hoc/`, `hoc/game/` | `kiem-ban-on-thi.mjs`: 45/45 lời giải 3 sao, 0 `wait(` / `tuple` / `dict` / lưới trong bản Ôn thi; đổi bản giữ sao hai bên; `?man=t1-than.3` mở thẳng bản Ôn thi; chụp 375px |
| **4. Nối diem10code** | `d10.js`, `luu.js` theo hồ sơ + gộp, `quyenChoi` (bản Ôn thi mở, bản đầy đủ theo cờ đã mua), `sw.js` phạm vi riêng; phía `tin_hoc`: khoá `gamePython`, script đồng bộ, thẻ Sân chơi, cờ "bản đầy đủ" dùng cho mọi game | cả hai repo | chơi máy tính rồi mở điện thoại cùng tài khoản thấy đúng sao; khách chơi được `t5-*`; chưa mua chạm thẻ Bản đầy đủ hay mở thẳng `?man=` bản đầy đủ → hộp mua → mua xong về đúng chỗ |
| **5. Sửa: nội dung bản Ôn thi** | Dựng lại mùa 1 theo lưới 4×8 (8 dạng bài); thêm cơ chế 3 dạng còn thiếu (đoán rồi chạy, sắp xếp, điền chỗ trống); viết mùa 2 Bãi tái chế, 3 Bến sông, 4 Nông trại theo chuỗi đổi part; thiết kế mùa 5 Tổ hợp | `hoc/` | mỗi mùa 32 màn, máy kiểm từng dạng bài, bộ dò phạm vi xanh |
| **6. Sửa: làm đẹp** | Mục 5.3 việc 3–9 | `hoc/game/` | ảnh trước / sau ở 320, 375, 768, 1280px; 0 nút dưới 44px; `kiem-bang-mau` xanh; không màn nào cuộn ngang |
| **7. Mở mùa ẩn bản đầy đủ** | Bỏ `an: true` từng mùa khi đã soát trên trình duyệt (mùa 4 còn soát 200 màn) | `thu-tu-chuong.js` | danh sách soát từng mùa trong `hoc/ban-giao/`; `kiem-lo-trinh` xanh |

GĐ 2–3 không cần diem10code. GĐ 5–7 làm song song được (khác tệp), mỗi phiên một mùa.

---

## 7. Rủi ro

| Rủi ro | Vì sao | Giảm thế nào |
|---|---|---|
| Chế độ một nhịp làm lệch bản đầy đủ | sửa ngay trong `san-hoc.js` (lõi dùng chung, hơn 4000 dòng) | mọi thay đổi sau cờ `cfg.motNhip`; GĐ 2 chỉ gộp khi toàn bộ máy kiểm cũ cho đúng kết quả cũ |
| Lõi bản tách lệch lõi mới | 45 màn của bản tách viết trên lõi 5/11 | chạy lại 45 lời giải trên lõi mới ở GĐ 3; màn nào hỏng thì sửa màn, không sửa lõi theo bản cũ |
| Máy kiểm hết RAM / chậm | 132+ tệp, từng hết RAM | chạy lần lượt; máy kiểm bản Ôn thi nạp lộ trình một lần; agent không chạy `npm test` |
| Đường dẫn tương đối | 230 script, `sw.js`, `server.mjs`, `require` trong máy kiểm | giữ nguyên cây `hoc/`, `nhan/` (cách A); thử ở `/choi/python/` bằng `server.mjs` trước khi chép sang `tin_hoc` |
| Service worker đè nhau | `sw.js` game và `sw.js` phạm vi `/` của diem10code | phạm vi `./`, tên bộ đệm tiền tố `python-` |
| Mùa đang ẩn | bản đầy đủ mùa 4–9 còn ẩn, chưa soát hết | quyền mua không phụ thuộc cờ `an`; mở từng mùa ở GĐ 7 |
| Việc dở trên `claude/mua-9-tiep` | 59 commit chưa gộp | gộp ở GĐ 0; cách A giữ chung lịch sử nên gộp sau vẫn được |
| Tiến độ người chơi cũ | đổi khoá localStorage hay `ma` làm mất sao | giữ khoá `duong-hoc:*` và mọi `ma`; mã bản Ôn thi (`t*`) không trùng mã cũ |
| Push ép lên `diem10code-python` | cách A thay `main` của remote | cất `main` cũ ở `luu-tru/tach-5-11` trước, push nhánh đó trước, rồi mới push ép |
| Dung lượng repo | `.git` 406 MB, `phim-clb/` 701 tệp ảnh mang sang | không tệp nào trên 100 MB nên GitHub nhận; script đồng bộ sang `tin_hoc` không chép `phim-clb/` gốc (chỉ `hoc/game/phim-clb/` 21 MB) |
| Một cờ "bản đầy đủ" cho mọi game | logic, SQL đang có bản riêng, chưa game nào nối D10 | định nghĩa cờ một lần ở `tin_hoc` (`plan`), mỗi game chỉ hỏi `D10.daMuaBanDayDu`; ghi vào `KE-HOACH-GOP-GAME-LOGIC.md` khi làm GĐ 4 |
| Bản chụp lệch nguồn | `tin_hoc` giữ bản chụp | `PHIEN-BAN.txt`, script từ chối chép khi repo game còn thay đổi chưa commit |

---

## 8. Không làm trong kế hoạch này

- Viết lại game bằng React / Vite như hai game kia. Game là JS thường, chạy tốt, máy kiểm đầy đủ; chuyển công nghệ là
  việc rất lớn mà không thêm gì cho người chơi.
- Bỏ `wait()` ở bản đầy đủ, đổi luật bản đầy đủ, đổi hình robot.
- XP / huy hiệu chung diem10code.

---

## 9. Câu hỏi

Đã trả lời hết (17/11, quyết định 1–10 ở đầu tệp). Câu hỏi mới phát sinh khi làm thì ghi thêm ở đây.
