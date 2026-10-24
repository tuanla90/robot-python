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
| `hoc/game/` | giao diện Đường học: màn chọn gói, màn chơi, Xưởng hàm, vẽ robot pixel, lưu tiến độ, âm thanh (`am-thanh.js`), cài đặt (`cai-dat.js`), phim mở đầu (`mo-dau.js`) và mẹo chơi (`gioi-thieu.js`) |
| `hoc/game/part/` | danh mục part (thân, tay, cảm biến) và cách vẽ từng part |
| `tran/` | **Trận đấu**: nhân trận, lớp màn chơi, giao diện, mockup UI (xem `tran/README.md`) |
| `docs/thiet-ke/` | GDD v0.1 · v0.2, luật trận v0.1 → v0.4, tư liệu Robocon |
| `tools/` | `kiem-tat-ca.mjs` chạy mọi máy kiểm |

Kế hoạch và lộ trình của Đường học nằm trong `hoc/`: `LO-TRINH.md`, `KE-HOACH-CHE-LENH.md`,
`KE-HOACH-LIST-FLYCAM.md`, `KE-HOACH-LAP-RAP.md`, `Y-TUONG-TIEP-THEO.md`.
Đổi thứ tự chương: sửa `hoc/thu-tu-chuong.js`.

## Chơi không cần mạng

- Chữ (Handjet, VT323) nằm sẵn trong `hoc/game/font/`, không gọi Google Fonts.
- `hoc/game/sw.js` (service worker) cất mọi tệp mà `choi.html` nạp. Mở game một lần khi có mạng, lần sau mất mạng vẫn chơi được.
- `hoc/game/manifest.webmanifest` và `hoc/game/icon/`: cài lên màn hình chính như một app, bọc thành app Android.
- Vẽ lại icon: `python -I tools/ve-icon.py` (cần Pillow).
- Âm thanh tổng hợp bằng WebAudio ngay trong game, không có tệp âm thanh.

### Lộ trình xuất bản

Game nạp `hoc/lo-trinh-hoc.js` sau ngân hàng `man-*.js`: **570 màn / 57 chương**, có gói Dò đường (Cảm biến hai bên + Mê cung) sau Cảm biến, và 9 gói đội hai robot (20 màn mỗi gói, hai chương), mỗi gói đứng ngay sau gói part của nó, ghép part đó với part liền trước (khai báo trong `man-doi-*.js`, chèn vào lộ trình ở `lo-trinh-hoc.js`; luật chung `hoc/kiem-goi-doi.mjs`, kế hoạch `hoc/KE-HOACH-PHOI-HOP.md`). Màn 1–9 chỉ chấm một sân; bài nhiều sân nằm ở màn 10. Giữ mã `ma` khi đổi vị trí để sao và tiến độ vẫn thuộc đúng bài. Gói mới không tăng ngưỡng sao mở các gói cũ.

Khi viết công cụ đọc nội dung game, dùng `require('./hoc/lo-trinh-hoc.js')`; đọc riêng `man-*.js` là ngân hàng bài trước khi sắp lộ trình. Xem [bản rà soát và thay đổi](docs/thiet-ke/ra-soat-do-kho-2026-10-23.md).

- Kiểm kê: `node hoc/ra-soat-do-kho.mjs` (`--goc` để xem ngân hàng gốc).
- Đo lại ngưỡng sao sau khi sửa bài: `node tools/do-lo-trinh.mjs --ghi-sao`.
- Kiểm tra game xuất bản, mở khóa và bản lưu: `node hoc/kiem-lo-trinh.mjs`.

## Máy kiểm

```bash
npm test
```

Chạy lần lượt 57 bộ `kiem-*.mjs` (khoảng 6 phút; `hoc/kiem-hoc.mjs` và `hoc/kiem-nam-cham.mjs` lâu nhất).
Chạy một bộ: `node hoc/kiem-xich.mjs`, hoặc lọc `npm test -- hoc/kiem-xich`.

## Đóng gói thành trang Artifact

```bash
npm run dong-goi
```

Ghi ra `dist-artifact/` (mỗi tệp gói < 40KB), rồi đăng `dist-artifact/index.html` kèm thư mục `g/`.
