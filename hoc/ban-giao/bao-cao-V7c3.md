# Báo cáo V7c3 — CSS / phông / bảng màu / bộ đệm (agent Claude Opus 5.5, nhánh claude/css-phong, 29/10)

Brief: [brief-V7c3.md](brief-V7c3.md). Ghi dần theo từng commit.

## 1. KẾT QUẢ

### e0 (9233a92) sw.js + nền phanh
- sw.js:11 BAN 'duong-hoc-v1' → 'duong-hoc-v2'. activate ĐÃ xoá mọi bộ đệm khác tên (`ks.filter(k !== BAN).map(caches.delete)`), không cần thêm.
- NEN_VEC c830c12 → 8780764 ở kiem-ve-vector (13a-v), kiem-huy-hieu-phim-vector (A3-v / B5-v), kiem-nut-mo-dau-phim-vector (C3-v); chữ trong chú thích / tên kiểm sửa theo.
- Phát hiện: lỗi giả của C3-v KHÔNG cắm được (chuỗi `var v = PV() && PhimVector.o(ten, s, 0);` trong mo-dau.js đã hết từ V7c2, `replace` không khớp) → C3-v không đỏ khi --loi-gia (báo cáo V7c2 ghi "HỎNG 8 / 12" mà không nêu C3-v xanh). Sửa: cắm vào hàm `o()` thật → C3-v đỏ (HỎNG 9 / 12).

### e1 máy đo kiểu tính (tools/do-kieu-tinh.mjs + tools/nen-kieu-tinh.json)
- Chọn Chrome headless (Chrome có sẵn ở Program Files) điều khiển bằng DevTools Protocol qua WebSocket có sẵn của Node 24 (không cài gói). Lý do: chạy lại được bằng một lệnh, đặt khổ chính xác (Emulation.setDeviceMetricsOverride), không phụ thuộc ô trình duyệt bị ẩn, tự bật / tắt server.mjs (cổng 4202) và Chrome.
- 14 cảnh × 2 khổ (1280 × 800, 360 × 640) = 28 cảnh, 10 658 phần tử (+ ::before / ::after có content): phim mở đầu, màn đầu, Cài đặt, Sổ lệnh, thẻ Bộ phận (ThePart.mo kep), chọn gói, lưới màn, phim gói, thẻ "Bộ phận mới" khi vào màn, màn chơi khay mở ("Hàm khác" bấm mở nếu có), hộp gợi ý, thua (chạy chương trình trống), thắng (bản nháp = lời giải, bảng thắng), Lắp robot.
- Ghi mỗi phần tử: hộp bao (làm tròn 0,5 px) + display, visibility, opacity, transform, color, background (color / image / size / position / repeat), border 4 cạnh, border-radius, box-shadow, outline, font-family / size / weight / style, line-height, letter-spacing, text-shadow, text-transform, text-align, clip-path, image-rendering, filter, animation-name / timing, z-index, content. Hoạt cảnh CSS dừng ở 400 ms trước khi đo; phần tử JS đặt transform nội tuyến (robot màn đầu đi lại) ghi "js" cho hộp + transform (lần chạy đầu khác 4 px theo thời điểm).
- Ổn định: hai lần đo liên tiếp trên cùng cây: 0 khác.
- Tự chứng minh: (a) choi.css:148 `#sc-choi .side .cbtn{height:32px}` → 30px: máy báo 94 chỗ khác (nút Chạy / Nhịp / Lại / Gợi ý cao 40 → 37,5 ở khổ 1280, các hộp dưới dời). (b) choi.css:61 `.g-gr{--c:…}` → #ff0000: máy báo 0 khác — đúng, vì ở vector nút dùng --vc / nền riêng của choi-vector.css (khai báo này đã chết). Gỡ cả hai.
- Tệp nền 1,85 MB (bảng 326 bộ kiểu không trùng + khoá đường dẫn phần tử).
- Cách chạy: `node tools/do-kieu-tinh.mjs` (so với nền, mã thoát 1 nếu khác; ~3 phút); `--ghi-nen` ghi lại nền; `--canh choi-khay,cai-dat` chỉ vài cảnh.

### e2 choi.css bỏ khai báo pixel (choi.css 1187 → 1173 dòng; choi-vector.css −1; san-ve.js −2 dòng JS)
- Xoá trong choi.css: 11 `background-image:var(--wood|--woodD|--woodL|--chalk)` + 11 `background-size` đi kèm (192px 120px / 48px 48px), 25 `image-rendering:pixelated|crisp-edges`, 14 `--stud:var(--st-*)`, 53 `steps(n)` (bỏ khỏi animation / transition rút gọn), clip-path răng cưa của .screen (+ luật `body.dien-thoai .screen{clip-path:none}`), luật `.brick::before` (núm), `.deco canvas`, `.deco .surf`, `.deco .bev`, và 3 luật thành rỗng (`.tex{}`, `.cbtn.nut-loai .oi canvas{}`, `.md-a canvas,…{}`). Tổng 114 khai báo + 8 luật.
- Bằng chứng không còn hiệu lực trước khi xoá: --wood / --chalk / --stud / --st-* không còn ai đặt (Ve.datChatLieu xoá ở V7c2) → các var() đó rỗng; `body.ve-vector, body.ve-vector *{image-rendering:auto!important}`; MỌI luật có steps() (51 bộ chọn) đều có luật `body.ve-vector <cùng bộ chọn>` đặt lại `animation` / `animation-timing-function` / `transition-timing-function` (soát bằng script, chép ở mục rủi ro); `.ws-ov` transition đặt lại ở choi-vector.css:516.
- choi-vector.css: xoá luật ẩn `.deco .surf / .bev / >canvas` (không JS nào tạo các phần tử này: man-chon / man-dau / man-choi chỉ tạo `.deco` rỗng). GIỮ tiền tố body.ve-vector.
- san-ve.js: xoá `this.cv.style.imageRendering = 'auto'` (datDoPhanGiai) và `l.style.imageRendering = 'auto'` (lớp phủ robot): CSS không còn pixelated nên inline 'auto' thừa.
- Máy đo: lần đầu báo 4 chỗ khác: `.md` (phim mở đầu / phim gói, hai khổ) `background-size 192px 120px → auto` trong khi ảnh nền = none (choi-vector.css:738) → không hiện gì. Sửa MÁY ĐO: không có ảnh nền thì ghi '·' cho cỡ / vị trí / lặp ảnh nền; ghi lại nền TRÊN CÂY e1 (trả ba tệp về HEAD, --ghi-nen, chép lại bản e2). Đo lại: **KHÔNG KHÁC NỀN (0 chỗ), 28 cảnh, 10 658 phần tử**.
- kiem-bang-mau: 4 vai hết chỗ dùng (moCamToi, camSangV4, goV7, goV8 của .deco .surf / .bev) thêm vào VAI_CHO_V7C3; choi.css thêm vào SUA_SAU_NEN (mục 4 so từng byte với nền A1 13b8a97). ĐẠT 16; --loi-gia HỎNG 1 / 16.
