# Brief: dựng phim gói mùa 2, 3, 4 (khổ dọc, Remotion), theo mẫu mùa 1

Giao cho: Gemini (qua agy). Người nghiệm thu: phiên Claude "Phim CLB" khi có quota lại. Viết 31/10/2026.
Câu giao việc: **"Đọc toàn bộ file hoc/ban-giao/brief-phim-goi-mua-2-4-gemini.md rồi làm đúng theo đó."**

## 1. Việc cần làm

Dựng **phim gói mùa 2 (Nhà máy), mùa 3 (Bãi tái chế), mùa 4 (Nông trại hoa)**: mỗi gói 2 phim, mỗi mùa 20 phim, tổng 60.
- `M<mùa>G<gói>-Mo`: phim mở, chiếu khi vào gói (nhu cầu → thử, không được → Luna chế part → câu treo của Sola).
- `M<mùa>G<gói>-Ket`: đoạn kết, chiếu sau màn trùm (làm thật → thành tựu → người nhờ nói một câu).

Làm **lần lượt từng mùa**: xong mùa 2 thì commit, rồi mới sang mùa 3, rồi mùa 4.
**Không làm mùa 5, 6, 7**: chưa có màn chơi, kịch bản còn chờ.

## 2. Đọc trước (bắt buộc)

1. `hoc/KICH-BAN-PHIM-GOI-CLB.md`: **kịch bản bản 2**. Mục 0 là khuôn và luật kể; mục 1 là người nhờ và đồng hồ; mục 3, 4, 5 là bảng từng gói của mùa 2, 3, 4. Phim phải bám đúng các bảng này.
2. `phim-clb/src/doc/m1.tsx`: **mẫu đã dựng** cho mùa 1. Làm cùng cách, cùng nhịp, cùng độ dài:
   - Phim mở khoảng 15–25 giây.
   - Đoạn kết khoảng 10 giây.
   - Gói 10 dài hơn, gồm: tem XUẤT XƯỞNG, cảnh Ngoài đời, nhá nơi sau.
3. `phim-clb/src/doc/kit-doc.tsx`: bộ dựng khổ dọc. Gồm `NenHienTruong`, `ODat`, `Vat` (có `bam` = vật dính ở mũi xe), `Xe`, `ChuNay`, `Nguoi`, `DongHo`, `NhanGoi`, `BangViec`, `TrongXe`, `CauTreo`. Lưới sân 5 × 7 ô, ô 150 px; mốc chuyển động viết dạng `[khung, cột, hàng, góc]`.
4. `phim-clb/src/d10.tsx`: `Mascot` của Sola / Luna (danh sách mặt hợp lệ ở `FACES`), `CodeBox`, `Burst`, `Shake`.
5. `phim-clb/tools/xuat-m1.mjs`: cách xuất hình robot / ô / vật từ bộ vẽ của game.
6. `hoc/KE-HOACH-7-MUA.md`, mục "Cỗ máy của mỗi mùa": cỗ máy và nơi chốn của từng mùa.

## 3. Chỗ làm việc (quan trọng)

- **Làm trên nhánh `claude/phim-clb`, trong một worktree riêng.**
  - KHÔNG `git checkout` trong thư mục chính `D:\Users\tuanla2\game\doi-robot-chan-hung`: thư mục đó có việc chưa commit của các phiên khác, checkout sẽ xoá mất.
  - Lệnh tạo worktree:
    ```
    git -C D:/Users/tuanla2/game/doi-robot-chan-hung worktree add D:/Users/tuanla2/game/doi-robot-phim-clb-wt claude/phim-clb
    ```
  - Trong worktree, cài thư viện một lần: `npm install --prefix phim-clb` (`node_modules` không có trong git).
- **Chỉ sửa trong `phim-clb/`** và tạo báo cáo ở `hoc/ban-giao/`.
  - Không sửa file game: `hoc/game/*`, `hoc/lo-trinh-hoc.js`, `hoc/man-*.js`, `chu.js`, `phim-mua-*.js`.
  - Không sửa `hoc/KICH-BAN-PHIM-GOI-CLB.md`. Thấy kịch bản có chỗ không dựng được thì ghi vào báo cáo.
- **Không chạy `npm test`** của game (máy hết RAM).
- **Không sinh ảnh mới** (TopView), **không xuất mp4**.

## 4. Các bước cho mỗi mùa (ví dụ mùa 2)

### a. Chuẩn bị bộ dựng (chỉ làm một lần, trước mùa 2)

`kit-doc.tsx` đang ghi cứng thư mục hình `robot/m1/`. Hãy thêm cách chọn thư mục theo mùa:
- Dùng React context hoặc prop, giá trị mặc định `m1`.
- Phim mùa 1 phải ra **y hệt** như trước.
- Vị trí lưới (`X0`, `Y0`) đang khớp khoảng sàn trống của ảnh kho. Nếu nền mùa mới cần lưới ở chỗ khác thì cho chọn được theo mùa, giữ mặc định cũ.

### b. Xuất hình robot của mùa

Chép `tools/xuat-m1.mjs` thành `tools/xuat-m2.mjs`, xuất vào `public/robot/m2/`.
- Mã bộ vẽ:
  - thân: `'hai-banh' | 'xich' | 'nhen' | 'drone' | 'omni'`
  - tay: `'kep' | 'xoay' | 'hoi'` (vòi phun) ` | 'nam-cham' | 'son'` (bộ gieo hạt) ` | 'nem'`
  - cảm biến (`camBien: [{ma, o}]`): `ma` là `'khoang-cach' | 'hong-ngoai' | 'tu' | 'camera-4'`, `o` là `'truoc' | 'hong'`
  - xem thêm `tools/xuat-tham-chieu.mjs`
- Vẽ đủ các bước lắp dần đúng bản vẽ cỗ máy của mùa. R1 **không bao giờ** mang part của mùa khác. Ví dụ mùa 2:
  - `xich`
  - `xich-voi` (xích + vòi phun)
  - `xich-voi-hn` (xích + vòi phun + hồng ngoại)
  - và các mặt `-vui`, `-ngac`.
- **R2 dùng part cũ**, đúng cột gói 9 trong kịch bản:
  - mùa 2: hai bánh + tay kẹp + cảm biến khoảng cách
  - mùa 3: xích + lưỡi ủi
  - mùa 4: nhện + nam châm
- Ô và vật (`VeVector`):
  - ô: `bang` (băng chuyền), `nut-ban` (van), `lua`, `dem-tu`, `ho`, `san-mau`, `sac`, `rao`, `nut-de`, `cua`, `dich`, `co`
  - vật: `thung-go`, `thung-nang`, `khoi-sat`, `nam-cham`
- Ảnh tay xoay to hơn (canvas 922 thay vì 576). Ảnh nào có canvas khác 576 thì khai trong bảng `RONG` của `kit-doc.tsx`.
- Ô tường của game trông giống thùng. Đừng dùng nó làm kệ / vách: tự vẽ bằng CSS như `Ke` trong `m1.tsx`.

### c. Viết `phim-clb/src/doc/m2.tsx`

- Theo đúng cấu trúc `m1.tsx`, xuất `PHIM_M2: Phim[]` (mỗi phim có `doc: true`).
- Đăng ký trong `phim-clb/src/index.ts`, cạnh `PHIM_M1`.
- Nền hiện trường: `public/nen-doc/mua-2.png` (mùa 3: `mua-3.png`, mùa 4: `mua-4.png`; cả ba đều là ảnh nơi chốn nhìn từ trên). Nền trong xe: `nen-doc/trong-xe.jpg`.
- Người nhờ: `public/nguoi/hanh-a.png` (mùa 3: `sau-a`, mùa 4: `lan-a`), dùng component `Nguoi`.
- Thành tựu theo dòng "Thành tựu" của từng mùa trong kịch bản:
  - mùa 2: xưởng sáng đèn, ống hơi nhả khói
  - mùa 3: ba thùng sắt / gỗ / nhựa đầy dần
  - mùa 4: luống nở đúng màu
- Cũng được làm biến thể của `BangViec`. Làm cho nhìn ra được bằng hình, không chỉ bằng chữ.
- Đồng hồ theo mục 1 của kịch bản:
  - mùa 2: kim áp suất (tự vẽ đồng hồ kim)
  - mùa 3: lịch xe thu mua
  - mùa 4: tờ lịch đếm tới Tết

### d. Soát bằng ảnh

- Kiểm kiểu: `npx tsc -p phim-clb` (không được lỗi).
- Chụp khung:
  ```
  node phim-clb/tools/anh-soat-nhieu.mjs 0.3 "M2G1-Mo:60,150,300" "M2G1-Ket:80,250" ...
  ```
  (khung âm = tính từ cuối phim). Ảnh ra ở `phim-clb/out/soat/`.
- Ghép ảnh soát thành một tấm và **tự nhìn**. Kiểm:
  - chữ không tràn, bóng thoại không che robot
  - robot, vật nằm đúng ô
  - vật đang kẹp vẽ SAU robot (nằm trên robot)
  - không có ô trống hay ảnh lỗi 404

### e. Commit trên nhánh `claude/phim-clb`

- Mỗi mùa một commit, lời commit tiếng Việt.
- Không push. Không gộp vào `main`.

## 5. Luật nội dung (từ kịch bản mục 0, nhắc lại vì hay sai)

- Phim mở **không chạy lời giải, không nói ra quy luật**. Dừng ở câu treo ("Thử trên sa bàn nào!").
- **Luna chỉ hỏi, Sola đưa giải pháp.** Người nhờ chỉ phản ứng một câu, không giảng luật.
- **Mỗi gói một loại lý do** (bảng ở mục 0). Mỗi mùa tối đa một cú RẦM.
- **Gói 4 chỉ một "yếu tố ngôi sao"**, hiện ra như một bất ngờ nhìn thấy được.
- Gói 6 có bước lùi giữa mùa. Gói 8: yếu tố cũ đến theo chuỗi cung ứng (xe tải mang nhãn nơi trước, bộ đàm người nhờ cũ). Gói 9: hai việc ở hai chỗ cùng lúc. Gói 10: Sola thả tay khỏi bàn phím.
- Gói 1 các mùa sau: R1 gắn tạm lên bộ part dư của mùa trước, thử và không được, rồi Luna lắp thân mới (bộ dư này về sau thành R2 ở gói 9).
- Từ ngữ:
  - Dùng phun, xịt, mở van, dập lửa. **Cấm** bắn, súng, nổ, mìn.
  - Không gọi tên khái niệm Python trong lời thoại.
  - Mỗi câu thoại đọc được trong khoảng 4 giây.
- Mùa 2: **lửa được gieo từ gói 1** (đốm lửa nhỏ), bùng ở gói 6, dập ở gói 10. Van có cánh hứng nước: nước đập cánh làm van quay mở; van mở thì nóng.
- Mùa 3: cực nam châm **đỏ = N, xanh = S**, vẽ trên cả nam châm của R1 lẫn vật. Vật bị đẩy / hút là củ loa, mô-tơ cũ.
- Mùa 4: drone có lồng bảo vệ cánh quạt. Hoa chỉ 4 màu (đỏ, vàng, xanh dương, xanh lá; không tím, không hồng). Phim không phun thuốc vì drone không có bộ phun.
- Lệnh hiện trong `CodeBox` phải là lệnh thật của game mùa đó. Tra trong `hoc/KE-HOACH-PHIM-GOI.md` mục 3b, 3d, 3e và `hoc/KE-HOACH-MUA-2.md`, `-3`, `-4`. Không tự đặt tên lệnh.
- Cảnh Ngoài đời gói 10: dùng ô chờ ảnh như `NgoaiDoi` trong `m1.tsx`, đổi chữ theo danh sách ở `hoc/KE-HOACH-PHIM-CLB.md` mục 2.

## 6. Báo cáo khi xong mỗi mùa

Viết `hoc/ban-giao/bao-cao-phim-mua-<n>.md`, gồm:
- danh sách 20 composition và độ dài từng phim
- chỗ nào lệch kịch bản và vì sao
- hình nào phải tự vẽ bằng CSS
- ảnh soát đã xem (đường dẫn tấm ghép)
- câu hỏi cho người nghiệm thu
- mã commit

Khi xong cả ba mùa, hoặc bị chặn, thì dừng và báo. Không tự mở rộng sang mùa 5–7.
