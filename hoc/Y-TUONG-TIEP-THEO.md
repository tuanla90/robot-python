# Ý tưởng tiếp theo cho "Đường học" (15/10)

Ghi lại ý tưởng chưa làm. Mục A lấy từ lần xem NiHiCode (nihicode.com, 15/10). Mục B là ba ý của user (15/10 tối), đã nghiên cứu và có đề xuất, chờ user chốt.

---

## A. Ý tưởng học từ NiHiCode

NiHiCode dạy 4–12 tuổi, rộng và nông: Python chỉ có ở kiểu đi lưới / vẽ, các trò khác (âm nhạc, phân loại, dạy AI) là chạm / kéo. Game mình là Python thật cho bé lớn nên chỉ lấy ý, không lấy cách làm.

| Ý | Họ làm gì | Mình làm thế nào | Kiến thức Python mới |
|---|---|---|---|
| Máy sơn | Vẽ hình bằng lệnh đi + bút | Part "đầu sơn" tô ô sàn khi đi qua; đề là hình cần tô | list màu, `for` lồng `for` (hàng × cột) |
| Kho phân loại | Chọn luật Nếu…thì cho bảng món ăn, có bài hai điều kiện | Băng chuyền đưa vật nhiều loại (gỗ / sắt / màu), robot gạt vào đúng thùng | `and` / `or`, thứ tự `elif` (luật hẹp đứng trước luật rộng) |
| Loa / âm nhạc | Xếp nốt và nhịp gõ theo mẫu nghe được | Part "loa": `beep(n)`; luật nhịp của game sẵn là nhịp nhạc. Bài: robot vừa đi vừa phát đúng giai điệu | list nốt, hàm có tham số, vòng lặp đoạn điệp khúc |
| Dạng bài "Đoán trước" | — (họ có "bắt lỗi") | Cho sẵn code, hỏi robot dừng ở ô nào / mang vật gì, chọn rồi mới chạy | đọc code, theo dõi biến |
| Dạng bài "Điền chỗ thiếu" | Khung có sẵn, thiếu vài khối | Code có ô trống (số, điều kiện, một dòng), chỉ điền chỗ đó | tập trung vào một ý mỗi bài |
| Thử thách mỗi ngày + chuỗi ngày | Mỗi ngày một bài theo tuổi, đếm chuỗi | Mỗi ngày một màn ghép từ phần đã mở, có bảng xếp hạng tuần (biệt danh ngẫu nhiên) | ôn tập rải đều |
| Mức thành thạo từng kỹ năng | % theo từng dạng cho phụ huynh | Đếm theo khái niệm (`for`, `if`, tham số, hàm…) từ bài đã làm | — |
| Gia sư AI có giới hạn | Tối đa 6 lần / bài, chỉ sau khi đã Chạy thử | Nếu làm: chỉ gợi mở, chỉ sau khi chạy hỏng, đếm lượt | — |

---

## B. Ba ý của user

### B1. Gộp logic, `wait` và cảm biến vào một chỗ

**Hiện nay** (game/thanh-phan.js, hàm dựng khay ~dòng 1683): khay chia thẻ THEO BỘ PHẬN: Thân / Tay / Cảm biến.
- `for` được chép vào CẢ BA thẻ (khoiFor() gọi ở mỗi thẻ) → bánh có `for`, tay có `for`, cảm biến có `for`.
- `wait()` chỉ ở thẻ Thân. Viết tay (`arm_down`, `wait`, `grab`, `wait`) phải lật qua lại giữa hai thẻ.
- `while` / `if` nằm ở thẻ Cảm biến (có cảm biến) hoặc Thân (không có). Nhóm biến đếm cũng vậy.

**Vì sao sai:** bộ phận là phần cứng, lệnh của nó là việc nó LÀM. `for` / `if` / `while` / biến là việc của BỘ NÃO (mạch điều khiển), robot nào cũng có một bộ não chứ không phải mỗi bộ phận một cái. `wait()` là "hết nhịp", cũng là việc của bộ não. Cảm biến chỉ ĐO, giá trị đo chỉ dùng trong điều kiện.

**Đề xuất** (giữ tối đa 3 thẻ, vừa điện thoại dọc):
1. Thẻ **Thân** và **Tay**: chỉ còn lệnh của bộ phận + hàm của em dùng bộ phận đó. Bỏ `for` khỏi hai thẻ này.
2. Thẻ **Điều khiển** (thay thẻ Cảm biến): `for`, `while`, `if` / `elif` / `else`, biến đếm, và mọi điều kiện cảm biến (`front_clear()`, `color() == "r"`, `battery() < 3`…). Điều kiện cảm biến giữ màu / biểu tượng của cảm biến để vẫn thấy nó đến từ part nào. Hàm của em dùng cảm biến xếp ở đây.
3. **`wait()` là nút ghim**, không thuộc thẻ nào: luôn hiện ở cùng chỗ (đầu khay, cạnh hàng thẻ) dù đang ở thẻ nào. Theo luật nhịp mới, `wait()` là "chốt nhịp" nên phải với tới ngay. Chỉ gộp `wait` vào thẻ Điều khiển thì vẫn phải lật thẻ khi viết tay, nên ghim tốt hơn.
4. Thẻ Điều khiển xuất hiện lần đầu khi học `for` (gói Vòng lặp): kể thành "robot được lắp bộ não / mạch điều khiển". Trước đó chỉ có Thân (+ Tay) và nút `wait` ghim.

**Công sửa:** vừa. Phần dựng khay trong thanh-phan.js (mảng `the`), chu.js (tên thẻ), một hướng dẫn trỏ "thẻ Cảm biến" (huong-dan-man.js dòng 242, khối while), máy kiểm kiem-khay. Không màn nào đặt `the: 'cam'`. Luật nhịp (khóa lệnh cùng bộ phận trong một nhịp) không đổi.

**Chỗ cần user chốt:** tên thẻ ("Điều khiển" / "Bộ não" / "Logic"); `wait` ghim ở đầu khay hay cuối khay.

### B2. Đưa list (mảng) vào flycam (drone) hoặc omni trượt thay vì chuỗi

**Hiện nay:** chuỗi chỉ đường dạy ở gói Nhện (`walk("RRD")`, `for c in path:`), dùng lại ở drone (`fly(path)`, `ship(path)`). Bộ chạy Python của game (docs/mockups/san-robot-core.js) **chưa có list**: không có `[ ]`, không chỉ số `a[i]`, không `len()`, không `.append()`; `for x in …` chỉ lặp được chuỗi và `range`.

**Nhận định:** đừng THAY chuỗi ở Nhện. Chuỗi một chữ (U/D/L/R) là dãy dễ nhất, chạm chọn chữ trên điện thoại rất gọn. List chỉ đáng học khi chuỗi KHÔNG làm được, có hai lý do thật:
- **Mỗi bước mang một con số** (đoạn dài 2, 5, 12 ô; trượt trái là số âm). Chuỗi "253" chỉ chứa chữ số 0–9, phải đổi `int(c)` (chưa dạy) → list số là cách tự nhiên.
- **Nhớ rồi làm sau**: robot đo trên đường đi, ghi lại, quay về làm theo thứ đã ghi. Cần `append`.

**Đề xuất hai bước:**
1. **List số cố định ở Omni** (gói 11, đã có tham số + biến đếm): `for n in [2, 3, 1]: slide_r(n); forward(1)`; hàm `weave(steps)` nhận list. Số âm = trượt trái (`if n > 0` / `else`) cho bài sau. Thêm `len(steps)`, `steps[0]` ở 1–2 màn.
2. **List tự xây ở Flycam (drone + camera)**, gói cuối: drone bay trinh sát một hàng, đọc màu ô bên dưới (`color()`), `seen.append(color())`; bay về rồi chở hộp theo đúng thứ tự đã ghi. Đây là bài "nhìn trước, làm sau" mà chuỗi + `if` không gỡ được gọn. Cũng là chỗ gắn "Máy sơn" ở mục A (list màu).

**Công sửa:** bộ chạy Python thêm list literal, `for` qua list, `a[i]`, `len()`, `.append()` (cần đọc được dấu chấm gọi phương thức); khay thêm khối list (ô số chạm +/− giống ô chữ của Nhện); máy kiểm. Khoảng 1–2 ngày việc của một agent.

**Chỗ cần user chốt:** bước 1 đặt ở Omni hay để cả hai bước ở Flycam; có thêm camera cho drone không (part-camera.js hiện là "đôi mắt" đọc `color()` của xe).

### B3. Chế độ tự chọn part để lắp thiết bị giải một bài chung (nền cho Robocon)

**Đã có sẵn:** robot ghép từ part (game/part/: 5 thân, 5 kiểu tay, cảm biến), khay lệnh tự sinh từ lệnh của part (`cauHinhCua(man)` trong ve-robot.js), lõi san-hoc.js mô phỏng mọi tổ hợp, bộ dò BFS theo từng loại robot (do-duong-*.mjs). Thiết kế Robocon có sẵn: GDD v0.2 §4.2–4.5 (6 khe, tổng khối lượng ≤ 40, ngân sách 10 suất, không part nào trội), tham-khao-robocon-v0.1 §5 (trần cứng / mềm / tài nguyên / luật, 6 đánh đổi).

**Đề xuất "Xưởng lắp ráp":**
1. **Đề chung**: một sân + mục tiêu + ràng buộc (ngân sách xu, số khe: 1 thân, 1 tay, tối đa 2 cảm biến, giới hạn khối lượng / pin). Ví dụ: sân có băng chuyền, bậc thang và hàng rào; mang 3 vật về đích.
2. **Chọn part** chỉ trong số part đã học (đã qua gói đó). Thẻ thông số: giá, khối lượng, nhịp mỗi ô, vượt được gì. Part không hợp nhau thì không gắn được (drone không gắn tay kẹp…).
3. **Viết code** với khay sinh từ part đã chọn (thẻ Điều khiển ở B1 không phụ thuộc part, nên khớp luôn).
4. **Chấm ba điểm**: nhịp, số ô code, chi phí part. Sau khi thắng cho xem "cách lắp khác" (lời giải mẫu bằng tổ hợp khác) để thấy đánh đổi.
5. **Luật thiết kế đề**: ít nhất 2 tổ hợp giải được; không tổ hợp nào thắng cả ba điểm (§4.5 "không part trội"); máy kiểm chạy BFS cho TỪNG tổ hợp để chứng minh.

**Lộ trình tới Robocon:** (a) đề lắp ráp một mình → (b) đề tính điểm trong N nhịp (gom càng nhiều vật càng tốt, kiểu Robocon) → (c) đua với bản ghi của bạn (không cần mạng thời gian thực) → (d) hai robot cùng đội → (e) đối kháng.

**Đặt ở đâu:** bản nhẹ cuối mỗi vài gói ("màn chọn part": 2 lựa chọn, ví dụ bánh hay xích cho màn này); bản đầy đủ là một gói riêng mở sau gói Drone.

**Chỗ cần user chốt:** có bản nhẹ giữa chừng không; tiền tệ chi phí (xu cố định mỗi đề hay tích lũy từ sao); ai thiết kế đề đầu tiên (mình đề xuất 3 đề mẫu để thử).

---

## C. User chốt (15/10 khuya)

1. Thẻ tên **Logic**; `wait()` **ghim ở dưới** khay.
2. List làm **gói riêng** (không lồng vào Omni); drone thêm **camera** (hoặc part khác nếu hợp lý) để có bài `append`.
3. Lắp ráp làm **bước nhẹ, tổ hợp dần**: Thân + Não → Thân + Tay → Thân + Tay + Não.

### Ba dòng từng việc (15/10 khuya; user: làm Việc 1 + icon trước, Việc 2–3 để sau)

**Việc 1 · Thẻ Logic + `wait()` ghim dưới khay**
- Must keep: luật nhịp (khóa lệnh cùng bộ phận, `wait` chốt nhịp); ◀▶ đổi thẻ, ▲▼ cuộn, khối cỡ to; mọi lời giải hiện có vẫn chèn được; tối đa 3 thẻ.
- Must improve: `for` / `while` / `if` / biến / điều kiện cảm biến chỉ ở thẻ Logic (Thân, Tay chỉ còn lệnh bộ phận + hàm dùng bộ phận đó); `wait()` là hàng ghim ở đáy khay, thẻ nào cũng thấy; thẻ Logic xuất hiện từ gói Vòng lặp; hướng dẫn đang chỉ `wait` / `while` theo thẻ trỏ chỗ mới. Thêm: tên thẻ bộ phận đổi thành ICON đặc trưng (dùng chung với icon ở dải nhịp, vẽ rõ hơn).
- Done when: mọi máy kiểm xanh (kiem-khay thêm "for chỉ ở Logic, wait ghim"); chơi tay khung 375×812: 1.1 (không thẻ Logic, hướng dẫn chỉ đúng wait ghim), màn đầu Vòng lặp, màn while ở Cảm biến, một màn tay gắp viết `arm_down, wait, grab, wait` không đổi thẻ.

**Việc 2 · Gói List + drone gắn camera** (chưa làm)
- Must keep: chuỗi ở Nhện giữ nguyên; lõi Python cũ chạy y như cũ (mọi máy kiểm cũ xanh, kể cả mockup sân robot dùng chung lõi).
- Must improve: lõi thêm `[ ]`, `for x in list`, `a[i]`, `len()`, `.append()`; gói List hai chương (làm quen + chế lệnh), đề xuất đặt ngay sau gói Nhện; drone gắn camera nhìn xuống, `look()` trả màu ô / loại vật dưới bụng, bài trinh sát rồi `append`, bay về làm theo.
- Done when: máy kiểm lõi list + màn mới có lời giải chạy thật, BFS không đường tắt; khối list chạm sửa số được trên điện thoại; chơi tay ≥ 3 màn.
- Chờ user: gói List sau Nhện?; camera = chương mới "Flycam" trong gói Drone hay sửa vài màn drone sẵn có?

**Việc 3 · Lắp ráp tổ hợp dần** (chưa làm)
- Hiểu "Não" = cảm biến (khoảng cách, màu, camera…); Logic thì robot nào cũng có.
- Must keep: màn thường không đổi (robot cố định theo màn); chỉ chọn part đã học.
- Must improve: màn chọn part trước khi chơi (khe Thân / Tay / Não, thẻ part có giá + "vượt được gì", hình robot ghép ngay); khay sinh theo part đã chọn; ba chương xen lộ trình: Thân + Não sau gói Màu, Thân + Tay sau gói Máy ném, Thân + Tay + Não sau gói Drone; mỗi màn có ngân sách xu, ≥ 2 cách lắp giải được, thắng rồi xem "cách lắp khác".
- Done when: máy kiểm BFS từng tổ hợp trong ngân sách, mỗi màn ≥ 2 tổ hợp thắng; mỗi chương chơi tay 2 màn bằng 2 cách lắp khác nhau.
- Chờ user: "Não" = cảm biến đúng chưa; mỗi chương 5 hay 10 màn.
