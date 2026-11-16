# Luật sửa phim CLB (rút từ lần sửa phim mở đầu, 2/11/2026)

User duyệt phim mở đầu (`phim-clb/src/PhimMoDau.tsx`) qua 8 lượt góp ý; các luật dưới đây áp cho **mọi phim CLB còn lại** (phim gói `phim-clb/src/doc/m*.tsx`, `cang.tsx`, phim Lab).
Tham khảo thêm skill remotion-motion-graphics (github.com/haidrrrry/claude-remotion-skill): mỗi nhịp một câu + một hình, có nhịp dừng, chữ trong vùng an toàn, soát khung trước khi giao.
Khổ dọc 1080×1920, 30 khung/giây; trên game phim thu 1/3 (360×640).

## 1. Chữ ít, đọc kịp

- **Bóng thoại ≤ 9–10 chữ**, một ý. Mỗi cảnh tối đa **2 bóng thoại** (hai người nói nối nhau). Câu dài ~20 chữ trước đây → user: "chữ bị nhiều, che chữ quá".
- **Thẻ / bảng chỉ còn ảnh + tên** (tên nơi, tên part). Bỏ: dòng phụ dưới tiêu đề, mã kiểu `QUEST #1` / `#GARAGE`, nhãn trạng thái (`KHẨN CẤP`, `ONLINE`, `READY`), đoạn mô tả, dải liệt kê thêm.
- Cỡ chữ tên trên thẻ ≥ 32px; tiêu đề cảnh giữ `Headline`.
- **Đã đạt (3/11, giao agent qua /giao-viec + phiên chính rút nốt phần lệch phạm vi):** mọi cảnh mở đầu `G<n>Mo`/`G<n>Thu` của `m2.tsx`–`m8.tsx` + `cang.tsx` (kể cả gói 1-2 `m2.tsx` phát hiện sót lúc rà) và 5 cảnh "thả tay" mở đầu gói 10 (`ThaTayCang`/`ThaTayM4`/`ThaTayM6`/`ThaTayM7`/`ThaTayM8`, tên hàm khác `G<n>Mo` nên dễ bỏ sót khi rà bằng mẫu tên) nay ≤9-10 chữ/bóng. Soát lại bằng script đếm chữ độc lập (tách theo khoảng trắng, chỉ quét trong thân hàm `G<n>Mo`/`Thu`) ra 0 vi phạm. `m1.tsx` vẫn là mẫu văn phong tham khảo.

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
- **Góc máy theo cơ chế** (user 2/11): cơ chế trên mặt bằng (đi, rẽ, cảm biến, nút đè, xoay tay) → nhìn từ trên như game; cơ chế **đổi độ cao / trục z** (hạ – nâng tay kẹp, cúi, nhảy, bay, co chân) → **góc máy ngang** với robot vẽ bằng mã SVG **`R1Ngang`** trong `PhimTayKep.tsx` (bản Remotion cũ user đã duyệt 2/11: vỏ bo góc, kính một mắt, 4 bánh tròn lăn, rãnh trượt nâng hạ, gọng kẹp đóng / mở), thùng `ThungNgang`, sàn `SanNgang`; vì nhìn từ trên không thấy tay cao hay thấp. Ảnh 3D `public/robot/ngang/` (Antigravity `r1_ngang_opt3_v2`) chỉ là tham chiếu phong cách.
- **Hoạt cảnh lắp part trong xe trạm dùng ẢNH PART RIÊNG** (`public/robot/part/`, `tools/xuat-part.mjs` vẽ part trên thân rỗng bằng bộ vẽ game), không cắt từ ảnh xe đủ.
- **Mọi gói đều có cảnh cơ chế trên sa bàn Lab** (1–2 cảnh 8s): thử sai một lần nhanh → đúng, quy tắc nói **một câu**. Nhịp nhanh, chữ ít; phần kể (hiện trường → chế part → câu treo) ~25s.
- Không nhãn tiếng Anh kỹ thuật trên hình (`Test Case`, `hardcode`, `ONLINE`): nói "ca sáng / ca chiều", "đếm bước cứng".
- **Chuẩn gói cuối mùa** (user 2/11): gói 8 = tổng duyệt mọi tình huống, yếu tố map của mùa trước với xe mới (mùa 1 chưa có mùa trước: yếu tố của chính kho, phim phải lý giải "thử hết một lượt trước khi giao"); gói 9 = hai thiết bị (R2) thử với môi trường mới; gói 10 = tự động hoá nhiều map. Thứ tự gói trong game (`lo-trinh-hoc.js` MUA_*) phải theo chuẩn này; phim theo thứ tự gói trong game.

## 9. Lý do đổi thân phải thuyết phục: so thân cũ / thân mới trên ĐÚNG địa hình (3/11, góp ý user)

User 3/11 chê phim mở gói "Bánh xích" (mùa 2): lý do nghe như kể miệng, chưa chắc người xem tự nhìn ra vấn đề trước khi nghe Sola/cô Hạnh nói.

**Soát 3/11 (mọi gói 1 "thân mới" của mọi mùa, `G1Mo` + `G1Lam` trong từng `doc/m*.tsx` / `cang.tsx`): khuôn chuẩn đã đúng ở MỌI gói.**
`G1Mo` luôn cho thân cũ thất bại trên đúng các ô địa hình gây ra nhu cầu (`ODat` cùng toạ độ), kèm `Shake` + `ChuNay` xuất hiện **trước** lời thoại giải thích (lệch vài khung, ví dụ mùa 2: chữ ở khung 68, lời Hạnh ở khung 72); `G1Lam` ở đoạn kết gói quay lại **đúng những ô đó** cho thân mới đi qua, không đổi sang ô khác. Giữ nguyên khuôn này khi viết gói 1 của mùa mới — không cần sửa lại các gói đã liệt kê.

**Lỗ hổng không riêng gói 1 — nằm ở BẤT KỲ gói nào có thêm cảnh cơ chế Lab xen giữa** (soát 3/11 thấy cả 3 gói đầu mùa 2 đều dính: "Bánh xích" gói 1, "Vòi phun nước" gói 2, "Mắt hồng ngoại" gói 3 — vì cả 3 đều cần dạy cơ chế riêng khó giải thích bằng lời, xem `man-xich.js` cho luật xoay xích): cảnh thất bại (`G1Mo`/`G2Thu`/`G3Thu`...) và cảnh thành công (`G1Lam`/`G2Lam`/`G3Lam`...) cách nhau cả một gói chơi (10 màn) — quá xa để người xem nối lại "cùng một ô/cùng một van". Cảnh Lab chen giữa (`CANH_LAB_*`, `PhimMua2Lab.tsx`) trước đó chỉ dựng cơ chế bằng hình minh hoạ trừu tượng (khung Lab riêng, không phải địa hình thật), không nhắc lại pha thất bại.

- **Sửa**: thêm một cảnh so sánh ngắn ngay sau khi Luna chế part (trước phần dạy cơ chế trừu tượng) — thân/trạng thái cũ và mới LẦN LƯỢT tác động lên CÙNG ô địa hình đã thấy ở cảnh thất bại (dùng lại toạ độ/`ODat`/component dựng địa hình của cảnh đó), không chờ tới cảnh thành công ở cuối gói. Đã làm cho cả 3 gói đầu mùa 2 (đều ở `PhimMua2Lab.tsx`, chèn làm phần tử đầu của mảng `CANH_LAB_*`):
  - Gói 1 "Bánh xích": `xich-0-so-sanh` (`CanhXichSoSanh`, đầu `CANH_LAB_BANH_XICH`) — bánh bị băng chuyền đẩy trôi / xích đi vững, cùng ô băng chuyền.
  - Gói 2 "Vòi phun nước": `voi-phun-0-so-sanh` (`CanhVoiPhunSoSanh`, đầu `CANH_LAB_VOI_PHUN`) — không vòi thì bó tay trước rãnh nóng / có vòi thì phun xa đóng van, cùng vị trí đứng.
  - Gói 3 "Mắt hồng ngoại": `hong-ngoai-0-so-sanh` (`CanhHongNgoaiSoSanh`, đầu `CANH_LAB_HONG_NGOAI`) — không cảm biến thì không biết nóng/nguội / có cảm biến thì biết chắc và phun đúng, cùng một ống.
- Áp lại quy tắc này cho **mọi gói (không riêng gói 1) của mùa mới (6+ hiện có / mùa về sau) hễ gói đó cần thêm cảnh Lab dạy cơ chế riêng** — gói chỉ có khuôn `G<n>Mo`/`G<n>Lam` sẵn có, không có cảnh Lab xen giữa, thì không cần thêm (đã đủ "thấy trước khi nghe" nhờ khoảng cách Mo/Lam gần).
- **Đặt sprite `robot/lab/*.png` lên nền thật (`NenHienTruong`) là SAI — luôn dùng sprite `robot/<mua>/*.png` qua `<Xe anh="..." moc={...} vet={false} .../>`.** Người nhờ 3/11 phát hiện: sprite trong `robot/lab/` (banh-r1, xich-co-ban, voi-phun-truoc, cb-hong-ngoai…) được vẽ kèm khung/bóng nền cho card trắng của `KhungLabLuna`; đặt trực tiếp lên nền địa hình thật (ảnh `nen-doc/*.png` + lưới ô) thì khung đó nổi vênh hẳn lên, không hoà với nền. `robot/<mua>/*.png` (ví dụ `robot/m2/xich.png`) là sprite cắt nền trong suốt, dùng sẵn trong `G<n>Mo`/`Thu`/`Lam` của `doc/m*.tsx` nên luôn khớp. Cảnh tĩnh (không di chuyển) vẫn dùng `Xe` với `moc` một điểm, ví dụ `moc={[[0, c, r, goc]]}`, để vừa có đúng sprite vừa có bóng đổ `drop-shadow` khớp nền — KHÔNG `<Img src={staticFile('robot/lab/...')}>` trực tiếp. Chỉ dùng `robot/lab/*.png` bên trong `KhungLabLuna` (card trắng), không bao giờ trên `NenHienTruong`. Đã sửa cả 5 cảnh đang dùng sai ở `PhimMua2Lab.tsx`: `CanhXichSoSanh`, `CanhXich1NhipSai`, `CanhXich2NhipDung`, `CanhVoiPhunSoSanh`, `CanhHongNgoaiSoSanh`.
- Đã dọn xong (3/11): mọi bản thảo cũ không đăng ký ở `index.ts`/`doc/m*.tsx` đã xoá — `PHIM_BANH_XICH`/`CanhXichVanDeBangChuyen`/`CanhXichLunaChePart`, `CanhVoiPhunVanDe`/`CanhVoiPhunLunaChePart`/`PHIM_VOI_PHUN`, `CanhHongNgoaiVanDe`/`CanhHongNgoaiLunaChePart`/`PHIM_HONG_NGOAI` (khỏi `PhimMua2Lab.tsx`); `CanhTayKepVanDe`/`CanhTayKepLunaChePart`/`CANH_LAB_TAY_KEP`/`CANH_LAB_TAY_XOAY`/`PHIM_TAY_KEP` và cảnh Lab riêng của chúng (khỏi `PhimTayKep.tsx`, giữ lại `KhungLabLuna`/`CongThucLab`/`HangSoTayLab`/`SanNgang`/`ThungNgang`/`R1Ngang` vì vẫn dùng ở `doc/m1.tsx`/`PhimMua2Lab.tsx`); và xoá hẳn 5 file toàn bộ nội dung không đăng ký ở đâu: `PhimKhoangCach.tsx`, `PhimXe.tsx`, `PhimMua34Lab.tsx`, `PhimMua56Lab.tsx`, `PhimXeMuaKhac.tsx`.

**Rà 3/11 (toàn bộ cảnh mở đầu `G<n>Mo`/`G<n>Thu` của 82 gói, m1–m8 + cảng, theo fork đọc tĩnh — xem thêm ghi chú CHƯA ĐẠT ở mục 1):**
- Sprite `robot/lab/*.png` trên `NenHienTruong`: KHÔNG tái phạm ở mùa khác ngoài mùa 2 (đã sửa ở trên) — `grep "robot/lab/"` trên m1–m8/cảng không ra kết quả.
- Thứ tự "thấy trước khi nghe" (ChuNay/ChuO phải hiện **trước** lời thoại giải thích): phát hiện 3 cảnh ở `m1.tsx` bị đảo ngược (chữ hiệu ứng hiện SAU lời thoại) — **đã sửa**, đổi `at` của lời thoại sang sau mốc hiệu ứng (kiểm bằng Remotion Studio, đúng thứ tự):
  - `G5Thu` (gói 5 "Bánh lùi"): lời Luna "Quay đầu tốn nhịp…" đổi từ `at=150` (cố định, trước hiệu ứng `tQuay=184`) sang `at={tQuay + 6}`.
  - `G6Thu` (gói 6 "Tay xoay"): lời Sola "Quay cả xe mỗi thùng…" đổi từ `S2(...)` (`at=126`, trước hiệu ứng `tQuay=192`) sang say tường minh `at={tQuay + 6}`.
  - `G7Thu` (gói 7 "Cảm biến bên"): câu 2 "Toang, ngõ cụt rồi!" đổi từ `at=126` (trước hiệu ứng `tCut=184`) sang `at={tCut + 6}`.
- Mục 8 (lệnh/hình khớp gói), mục 3 (bố cục đè) qua đọc tĩnh: không thấy bất thường rõ ràng.
