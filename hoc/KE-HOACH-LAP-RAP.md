# Kế hoạch: chế độ Lắp ráp (Việc 3, user chốt 17/10)

Nguồn: Y-TUONG-TIEP-THEO.md mục B3, C. "Não" = cảm biến (Logic thì robot nào cũng có). Mỗi chương 10 màn. Nền cho cuộc thi Robocon sau này (docs/thiet-ke/doi-robot-chan-hung-GDD-v0.2.md §4.2–4.5, docs/thiet-ke/tham-khao-robocon-v0.1.md §5).

## Ba dòng
- **Must keep:** màn thường không đổi (robot vẫn cố định theo màn); chỉ chọn part đã học (part của các gói đứng trước chương lắp ráp); luật lõi (nhịp, mỗi bộ phận một lệnh mỗi nhịp, ghép part hợp lệ) giữ nguyên; khuôn chương (10 màn, làm quen · luyện · biến thể · trùm, sao theo nhịp + ô).
- **Must improve:** màn chọn part trước khi chơi (khe Thân / Tay / Não, thẻ part có giá + "vượt được gì", hình robot ghép ngay); khay sinh theo part đã chọn; ba chương lắp ráp xen lộ trình; mỗi màn có ngân sách xu, ≥ 2 cách lắp giải được, thắng rồi xem "cách lắp khác".
- **Done when:** máy kiểm chạy BFS / lời giải cho TỪNG cách lắp hợp lệ trong ngân sách, mỗi màn ≥ 2 cách lắp thắng và không cách nào hơn hẳn mọi cách khác ở cả nhịp, ô lẫn giá; mỗi chương chơi tay 2 màn bằng 2 cách lắp khác nhau trên khung 375×812; toàn bộ máy kiểm xanh.

## 1. Ba chương (mỗi chương là một gói riêng)
| Mã | Gói | Đặt sau | Khe chọn |
|---|---|---|---|
| `rap-nao` | Lắp ráp: Thân + Não | gói Cảm biến màu (che-mau) | 1 thân + 1 cảm biến (hoặc không) |
| `rap-tay` | Lắp ráp: Thân + Tay | gói Máy ném (che-may-nem) | 1 thân + 1 tay (hoặc không) |
| `rap-du` | Lắp ráp: Đủ bộ | gói Drone (flycam) | 1 thân + 1 tay + 1 cảm biến |

## 2. Danh mục part (giá xu khởi điểm, chỉnh khi cân màn)
- **Thân:** hai bánh 2 · xích 3 (leo bậc, không trôi băng) · omni 4 (trượt ngang) · nhện 4 (chui gầm, nhảy hố, leo bậc; 2 nhịp mỗi ô) · drone 5 (bay qua rào / băng / vật; pin; chỉ ở `rap-du`).
- **Tay:** tay kẹp 2 · tay xoay 3 · nam châm 3 (hút từ xa, chỉ vật sắt / nam châm) · máy ném 3 (qua rào) · súng hơi 3 (giật lùi, đẩy thùng nặng).
- **Não:** khoảng cách 1 · màu (bụng) 2 · camera (nhìn trước) 2 · từ 2 · camera bụng drone 2 (chỉ drone).
- Ghép không hợp lệ (vd drone + tay kẹp) thì thẻ part mờ và nói lý do; vượt ngân sách thì nút "Lắp xong" khóa và nói thiếu bao nhiêu xu.

## 3. Dữ liệu màn
`lapRap: { than: [mã…], tay: [mã…] | [], camBien: [mã…] | [], nganSach: n, cachLap: [{ than, tay, camBien, loiGiai: {chinh, hamCuaMan}, ghiChu }] }` — `cachLap` là các cách lắp mẫu (≥ 2), mỗi cách có lời giải chạy thật; máy kiểm lấy nhịp / ô từ đó. Robot thật của màn = cách người chơi chọn: `robot`, `loaiRobot`, `hamGoc` (hợp lệnh của các part + `wait`, `battery` nếu drone có pin) suy ra lúc vào màn. Sao: `sao.nhip`, `sao.o` theo cách lắp tốt nhất; cách khác có thể chỉ đạt 2 sao — đó là đánh đổi.

## 4. Giao diện
- Vào màn lắp ráp: màn **Lắp robot** (trước khi chơi): ba khe, mỗi khe một hàng thẻ part (icon bộ phận đã có ở ve.js / hình part), giá, một dòng "vượt được gì"; hình robot ghép ngay (VeRobot); thanh xu còn lại; nút "Lắp xong".
- Trong màn: nút nhỏ "Lắp lại" (quay về màn Lắp robot, giữ chương trình nếu lệnh còn hợp lệ). Cách lắp đã chọn lưu theo màn.
- Thắng: bảng kết quả có mục "Cách lắp khác" (các `cachLap` mẫu: part, giá, nhịp, ô) để thấy đánh đổi.

## 5. Thứ tự làm
1. (E) Lõi + giao diện chế độ lắp ráp, máy kiểm với màn tạm — chưa có màn thật. Claude đăng ký chương trước.
2. (F1, F2, F3) Ba chương, mỗi agent một chương, sau khi E xong.
3. Ráp, chạy mọi máy kiểm, chơi tay, commit, đăng Artifact.

## 6. Đã làm (E, 17/10): lõi + giao diện, chưa có màn thật
- **Lõi `lap-rap.js`** (`window.LapRap`; Node tự nạp game/part): danh mục part (`DANH_MUC`: mã part thật, giá xu, "vượt được gì", icon, `ham` = lệnh gốc), `kiemGhep` (luật Part.ghep + luật cấu hình SanHoc.chay, kèm lý do tiếng Việt), `kiemCachLap(man, c)` → `{ ok, gia, lyDo, ma, thieu, khe }`, `dsCachLap(man)`, `apDung(man, c)` (loaiRobot, robot, hamGoc, battery + camBien pin chỉ khi drone có `man.pin`, bỏ pin khi thân khác), `kiemDuLieu`, `kiemCanMan` (dữ liệu + mọi cách mẫu thắng + cachLap[0] đạt 3 sao + không cách nào hơn hẳn), `thongKeMau`, `honHan` / `cachBiHonHan`, `macDinh`, `lenhKhongCon`. Cảm biến **từ** = mã `tu` (part khoang-cach + front_metal / front_pole).
- **Dữ liệu màn** như mục 3, thêm tuỳ chọn `lapRap.phaiCo: ['tay', 'camBien']` (khe bắt buộc). Màn KHÔNG cần khai loaiRobot / robot / hamGoc: `ManHoc.chuanHoa` (man-chuoi-1.js) điền bản mặc định theo **cachLap[0]** (kèm loiGiai nếu màn chưa khai), nên máy kiểm chung / Sổ lệnh đọc `ManHoc.danhSach` vẫn thấy màn đủ trường. Quy ước: **cachLap[0] = cách ứng với sao 3** (sao.nhip / sao.o); các cách khác thắng nhưng đánh đổi. Game chơi `LapRap.apDung(màn, cách người chơi chọn)`, không chơi bản mặc định.
- **Giao diện:** màn hình `lap` (`game/man-lap.js`, `#sc-lap`): `App.vaoMan` mở màn Lắp robot trước, "Lắp xong" → `Choi.vao(màn, cachLap)`; trong màn chơi nút "Lắp lại" (thanh trên) → `App.lapLai` (chương trình giữ, dòng gọi lệnh part đã tháo bị tô đỏ); bảng thắng thêm "Cách lắp khác" (nhịp / ô lấy từ `LapRap.thongKeMau`, chạy lời giải mẫu qua máy chấm). Cách lắp lưu theo màn: `Luu.docLap / ghiLap / xoaLap` (khóa `duong-hoc:lap:<mã màn>`).
- **Máy kiểm:** `kiem-lap-rap.mjs` (màn tạm trong bộ nhớ: hai cách lắp thắng một màn bậc thang). Mỗi chương F nên gọi `LapRap.kiemCanMan(màn)` cho từng màn rồi tự chạy BFS cho TỪNG cách trong `LapRap.dsCachLap(màn)` bằng bộ dò đường của chương.

## 7. Đã làm (F3, 17/10): chương `rap-du` · Đủ bộ (10 màn, chương cuối)
- **Màn** (`man-rap-du.js`; bảng giá · nhịp · ô trong đầu tệp và ở `node kiem-rap-du.mjs --bang`): 1 Qua sông (thân: drone / nhện / hai bánh) · 2 Ném qua rào (máy ném / kẹp) · 3 Tìm lối (ba sân; hai bánh + khoảng cách / nhện không mắt) · 4 Cửa sắt (súng hơi / drone / vòng) · 5 Băng ngược (drone / xích / hai bánh) · 6 Hàng sắt có pin (drone + nam châm có ô sạc P / nhện + kẹp / hai bánh + kẹp) · 7 Đẩy thùng (omni / hai bánh + súng hơi) · 8 Phân loại màu (ba sân; camera + tay xoay / tay kẹp) · 9 Hút từ xa (ba sân; nam châm + cảm biến từ / kẹp) · 10 Cổng năm lối (trùm: súng hơi / drone / nhện / xích).
- **Luật cân màn:** cachLap[0] = cách NHANH NHẤT trong ngân sách (3 sao); cách rẻ hơn thì chậm hơn hay dài hơn (từng cặp). `sao.o` = MAX(ô lời giải tự nhiên dùng hàm kho, ô lời giải viết thuần lệnh gốc) — lời giải mặc định là bản dùng hàm kho, bản còn lại nằm ở `cachLap[0].loiGiaiPhu`; màn khai `lapRap.dungKho: true` (không khai hàm nào, hàm kho vẫn bị khóa).
- **Bộ dò `do-duong-rap-du.mjs`:** BFS chạy thật `SanHoc.chay` cho MỌI (thân, tay) (cảm biến không đổi vật lý), khớp bộ dò viết tay trên sân của chương và 50 sân ngẫu nhiên. Máy kiểm chứng minh không robot nào thắng nhanh hơn robot mặc định.
- **Đổi lõi `lap-rap.js`:** `pin` của màn chỉ có nghĩa với drone; `macDinh` cất pin sang `pinDrone` khi cách mẫu đầu không phải drone (bản mặc định không mang pin), `apDung` đọc `pinDrone` cho cách drone. Không đổi giá, luật ghép.

## 8. Sửa theo chơi thử (22/10): báo cách lắp không qua, sao "nhanh hoặc rẻ"
- **Cách lắp không qua được** (dò hết: 17 cách ở 7 màn, có cả ba màn thử thách): khai ở `lapRap.khongQua: [{ than, tay?, camBien?, lyDo }]`
  (khe không khai = khe nào cũng khớp, `null` = không gắn). Vẫn cho chọn (đánh đổi là bài học), nhưng chạy hỏng thì `cham.js` thêm chẩn đoán
  `lap-khong-qua` đứng đầu, nói lý do + "Bấm Lắp lại để đổi bộ phận", nút Lắp lại nhấp nháy. `kiem-lap-rap-sao.mjs` dò mọi cách lắp: cách trong
  danh sách phải được chứng minh không thắng nổi, cách được chứng minh không thắng nổi phải có trong danh sách.
- **Sao thứ ba = nhanh HOẶC rẻ**: `sao.re = { gia, o }` (gia = giá cách mẫu rẻ nhất, o = ô lời giải của cách đó). Robot ≤ `re.gia` xu thì sao thứ ba có
  luôn, ngưỡng ô thành max(sao.o, re.o). Cách mẫu đầu (nhanh) và cách mẫu rẻ nhất đều 3 sao; cách nằm giữa (không rẻ nhất, không nhanh nhất) tối đa 2 sao.
  Bảng thắng hiện "Rẻ: robot x xu (cần ≤ y)" hoặc "Nhanh: … hoặc robot ≤ y xu"; màn Lắp robot nói luật này trong hộp đề bài.
- Chưa sửa: ở 32.10 và 36.10, cách lắp mặc định (hai bánh, không tay) chính là cách không qua được.
