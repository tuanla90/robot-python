# Đội Robot Chấn Hưng

Game dạy Python bằng robot (dòng 3 của vũ trụ Chấn Hưng). Tách ra từ repo `learn-code-by-game`
ngày 22/10/2026: lịch sử commit của thư mục `robotics/` (nhánh `robotics`) giữ nguyên.

Trang tĩnh thuần HTML + JS: không build, không gói npm.

## Chơi

```bash
npm start
```

Mở `http://localhost:4180`:

| Đường dẫn | Trang |
|---|---|
| `/` | **Đường học**: lắp robot từ part, viết Python điều khiển, các gói chương (`hoc/game/choi.html`) |
| `/tran` | **Trận đấu**: hai đội robot thi theo luật v0.4 (`tran/choi-tran.html`) |
| `/nhan` | mockup sân robot đợt 1 (`nhan/san-robot-dot-1.html`) |

Đổi cổng bằng biến `PORT`. Trên Railway, `railway.json` chạy `npm start`.

## Thư mục

| Thư mục | Việc |
|---|---|
| `nhan/` | **nhân chạy Python** dùng chung (`san-robot-core.js`, `window.RobotCore`) + mockup đợt 1 |
| `hoc/` | **Đường học**: lõi sân (`san-hoc.js`), máy chấm (`cham.js`), khung code, kho hàm, sổ lệnh, lắp ráp, tệp màn `man-*.js`, công cụ đo đường `do-duong-*.mjs` |
| `hoc/game/` | giao diện Đường học: màn chọn gói, màn chơi, Xưởng hàm, vẽ robot pixel, lưu tiến độ |
| `hoc/game/part/` | danh mục part (thân, tay, cảm biến) và cách vẽ từng part |
| `tran/` | **Trận đấu**: nhân trận, lớp màn chơi, giao diện, mockup UI (xem `tran/README.md`) |
| `docs/thiet-ke/` | GDD v0.1 · v0.2, luật trận v0.1 → v0.4, tư liệu Robocon |
| `tools/` | `kiem-tat-ca.mjs` chạy mọi máy kiểm |

Kế hoạch và lộ trình của Đường học nằm trong `hoc/`: `LO-TRINH.md`, `KE-HOACH-CHE-LENH.md`,
`KE-HOACH-LIST-FLYCAM.md`, `KE-HOACH-LAP-RAP.md`, `Y-TUONG-TIEP-THEO.md`.
Đổi thứ tự chương: sửa `hoc/thu-tu-chuong.js`.

## Máy kiểm

```bash
npm test
```

Chạy lần lượt 53 bộ `kiem-*.mjs` (khoảng 4 phút; `hoc/kiem-hoc.mjs` và `hoc/kiem-nam-cham.mjs` lâu nhất).
Chạy một bộ: `node hoc/kiem-xich.mjs`, hoặc lọc `npm test -- hoc/kiem-xich`.

## Đóng gói thành trang Artifact

```bash
npm run dong-goi
```

Ghi ra `dist-artifact/` (mỗi tệp gói < 40KB), rồi đăng `dist-artifact/index.html` kèm thư mục `g/`.
