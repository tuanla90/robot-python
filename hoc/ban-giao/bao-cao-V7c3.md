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
