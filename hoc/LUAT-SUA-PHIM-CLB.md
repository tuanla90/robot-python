# Luật sửa phim CLB (rút từ lần sửa phim mở đầu, 2/11/2026)

User duyệt phim mở đầu (`phim-clb/src/PhimMoDau.tsx`) qua 8 lượt góp ý; các luật dưới đây áp cho **mọi phim CLB còn lại** (phim gói `phim-clb/src/doc/m*.tsx`, `cang.tsx`, phim Lab).
Tham khảo thêm skill remotion-motion-graphics (github.com/haidrrrry/claude-remotion-skill): mỗi nhịp một câu + một hình, có nhịp dừng, chữ trong vùng an toàn, soát khung trước khi giao.
Khổ dọc 1080×1920, 30 khung/giây; trên game phim thu 1/3 (360×640).

## 1. Chữ ít, đọc kịp

- **Bóng thoại ≤ 9–10 chữ**, một ý. Mỗi cảnh tối đa **2 bóng thoại** (hai người nói nối nhau). Câu dài ~20 chữ trước đây → user: "chữ bị nhiều, che chữ quá".
- **Thẻ / bảng chỉ còn ảnh + tên** (tên nơi, tên part). Bỏ: dòng phụ dưới tiêu đề, mã kiểu `QUEST #1` / `#GARAGE`, nhãn trạng thái (`KHẨN CẤP`, `ONLINE`, `READY`), đoạn mô tả, dải liệt kê thêm.
- Cỡ chữ tên trên thẻ ≥ 32px; tiêu đề cảnh giữ `Headline`.

## 2. Nhịp

- *(2/11 tối, user: phim đã ngắn, nút Tiếp che nội dung → `TU_PHAT = true` trong `entry.tsx`: tạm tự phát liền mạch, ẩn nút Tiếp giữa phim, hết phim mới hiện nút cuối; chữ vẫn phải đọc kịp trong 8s mỗi cảnh.)*
- **Phim dừng cuối mỗi cảnh, chờ bấm Tiếp** (trình chiếu chung `phim-clb/src/web/entry.tsx`, đã có; không làm riêng từng phim). Khung dừng của cảnh = `dur − XF − 1` (XF = 16) tính trong cảnh.
- Cảnh có thoại dài **8s (240 khung)**. Câu 1: `at ≈ 14`, `out ≈ 120` (giữ ~3.5s). Câu 2: `at ≈ 126`, `out = dur` (còn hiện ở khung dừng). Cảnh cuối phim: câu cuối `out: 999` (giữ tới hết).
- Không nút to giữa màn lúc hết phim (che mặt nhân vật); nút cuối nằm ở hàng đáy và nhịp nhẹ (đã làm trong entry.tsx).

## 3. Bố cục, không che

- Khối nội dung (bảng, lưới thẻ) **kết thúc trên y ≈ 1050**; bóng thoại `bubbleTop={1180}`, `bubbleW={560}`; nhân vật đứng dưới.
- **Hàng nút đáy (Bỏ qua · chấm cảnh · Tiếp) chiếm y 1776–1920**: không đặt chữ, nhãn, mặt nhân vật quan trọng ở đó.
- Nhân vật / bóng thoại **không được đè thông tin** (nhãn, thẻ). Cảnh bản đồ: bỏ hẳn nhân vật, bản đồ tự kể.
- **Ảnh robot / part sẫm màu** (bánh xe xanh đen) đặt trên **nền sáng** `radial-gradient(circle, #FFFFFF 0%, #E0F2FE 75%)`, không trên nền tối (user: "Core R1 chỉ có mỗi thân, chưa có bánh" — bánh có nhưng chìm vào nền tối). Ô trưng bày cạnh nhau dùng cùng nền.
- Ảnh tròn (người nhờ) **nằm trong nhãn**, trước icon; không đặt chồng lên nhãn (che icon).

## 4. Bản đồ / cảnh di chuyển

- **Zoom vào** (~1.45, 24 khung đầu) rồi cho hoạt cảnh chạy; không để cả bản đồ nhỏ xíu.
- **Camera không bám xe liên tục** (user: "mắt theo tên vị trí bị chóng mặt"). Đứng một khung, rồi **cuộn mượt** (~1s, `Easing.inOut(Easing.sin)`) sang khung sau; không cắt cảnh (user: "scroll chứ không switch"). Nên cuộn lúc xe qua đoạn không có nhãn (qua sông).
- **Xe chạy liền** (~1s mỗi trạm), không dừng từng trạm (user: dừng từng trạm thì chậm).
- **Xe bám đường thật trên ảnh**: dò bằng `python tools/do-duong-xuong.py <ảnh> <ra.ts> x1,y1:x2,y2 ...` (khung xương, mỗi đối số một khúc liền; các khúc nối thẳng) → `DUONG`, `diemTren(s)`, `CAU_S`. Soát ảnh `<ra.ts>-soat.png` rồi xoá. Không vẽ vệt đường vàng đè bản đồ.
- Nhãn trạm **đè đúng ô nhãn trống in sẵn trên ảnh** (không để ô trống lộ ra), hiện đủ từ đầu; trắng = chưa tới, vàng + nảy nhẹ khi xe xuống ngang nhãn (`xe.yMax ≥ nhãn.y − 60`).
- Nhãn đặt trong toạ độ khung hình (không phóng theo bản đồ) để chữ giữ cỡ; kiểm nhãn xa nhất bên phải còn trong khung.

## 5. Tên nhân vật

- **Không gọi thứ kiểu miền Nam** (Hai, Ba, Tư, Năm, Sáu, Bảy, Tám, Chín, Út). Đã đổi 2/11: **Chú Tư → Chú Tùng** (thủ kho), **Bác Sáu → Bác Sơn** (bãi tái chế), **Bác Ba → Bác Bình** (bến sông). Tên tệp ảnh (`tu-*`, `sau-*`, `ba-*`) giữ nguyên (mã nội bộ).
- Tên mới viết vào kịch bản (`KICH-BAN-PHIM-GOI-CLB.md`) trước khi dùng trong phim.

## 6. Thành phần dùng chung (đừng sửa riêng từng phim)

- Bóng thoại `Mascot` (`src/d10.tsx`): đuôi đã vẽ lại (to, có bóng, liền viền); `Nguoi` (`src/doc/kit-doc.tsx`) cho người nhờ.
- Trình chiếu web `src/web/entry.tsx`: tự chạy, dừng cuối cảnh, Tiếp / chạm phim, Bỏ qua, chấm cảnh.

## 7. Soát trước khi giao

1. `cd phim-clb && node tools/web/dong-goi.mjs` (đóng gói lại `hoc/game/phim-clb/phim-clb.js`).
2. Trình duyệt: gỡ service worker + cache (`navigator.serviceWorker.getRegistrations()` → unregister, `caches.delete`), tải lại, `MoDau.mo()` hoặc `PhimCLB.mo(maGoi, stage, chu)`.
3. Tua khung bằng `PhimCLB.player().seekTo(f)`, **đợi ~2s cho ảnh tải** rồi chụp: khung giữa câu 1, **khung dừng của từng cảnh**, khung cuối phim. Khung đầu cảnh cách nhau `dur − 16`, bắt đầu từ 8.
4. Soát theo bảng: chữ ≤ 10 chữ / bóng, không gì đè nhãn / mặt, không ô nhãn trống, ảnh sẫm có nền sáng, không chữ ở dải nút đáy, tên không kiểu thứ.
5. `node hoc/kiem-phim-goi.mjs`, `node hoc/kiem-dong-goi-artifact.mjs`.

## 8. Khớp game (phỏng vấn user 2/11, kế hoạch `hoc/KE-HOACH-SUA-PHIM-GOI.md`)

- **Lệnh trong phim phải là lệnh được dùng trong gói đó** (đối chiếu `maMau` / `loiGiai` / `hamCuaEmCan` của 20 màn): `move()`, `pick()`, `drop()`, `back()`, `arm_left()`… Không bịa `forward()`, `grab()` cho gói không có, không `wait_n()`, `stay()`.
- **Hình trong phim phải xuất hiện trong gói đó**: ô sàn, kệ, thùng, cửa, nút đè, part, R2 chỉ hiện khi gói có ký hiệu / part ấy. Hình lấy từ bộ vẽ vector game (`tools/xuat-m*.mjs`), xuất lại sau mỗi mốc đổi hình.
- **Cơ chế vật lý và hoạt cảnh giống game**: đâm vật / tường = khựng tại chỗ + sao choáng (không văng, không đổ); xoay tại chỗ trong ô luôn được (vật đang cầm nằm trong kẹp, không chiếm ô); tay hạ mà bước = vướng tay; nút đè giữ cửa chỉ khi có xe / vật trên nút; đi từng ô một nhịp.
- **Grid chuẩn**: mọi `Moc` của xe và vật là **số nguyên** (tâm ô); xe dừng ở ô kề vật, tay với sang ô kề. Số lẻ chỉ dùng cho hoạt cảnh rơi / rung trong một ô.
- **Mọi gói đều có cảnh cơ chế trên sa bàn Lab** (1–2 cảnh 8s): thử sai một lần nhanh → đúng, quy tắc nói **một câu**. Nhịp nhanh, chữ ít; phần kể (hiện trường → chế part → câu treo) ~25s.
- Không nhãn tiếng Anh kỹ thuật trên hình (`Test Case`, `hardcode`, `ONLINE`): nói "ca sáng / ca chiều", "đếm bước cứng".
- **Chuẩn gói cuối mùa** (user 2/11): gói 8 = tổng duyệt mọi tình huống, yếu tố map của mùa trước với xe mới (mùa 1 chưa có mùa trước: yếu tố của chính kho, phim phải lý giải "thử hết một lượt trước khi giao"); gói 9 = hai thiết bị (R2) thử với môi trường mới; gói 10 = tự động hoá nhiều map. Thứ tự gói trong game (`lo-trinh-hoc.js` MUA_*) phải theo chuẩn này; phim theo thứ tự gói trong game.
