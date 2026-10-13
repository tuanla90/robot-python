# Đường học — lộ trình chương (bản 14/10/2026)

Robot lắp từ PART:
- **Thân** để đi.
- **Tay** để hành động.
- **Cảm biến** để tự chạy.

Mỗi part mở một bộ hàm gốc riêng và có **luật chơi riêng**, không chỉ khác hình. Mỗi chương đủ 10 màn: 9 màn (Làm quen / Luyện / Biến thể) và 1 trùm. Hàng **Biến thể** và trùm là chỗ cho part **phối hợp với part khác** hoặc gặp **địa hình lạ**.

Quy ước chung (đã chốt, áp mọi chương):
- Khung code 10 ô; mỗi hàm 10 ô riêng.
- Hàm của em được lưu, dùng mãi.
- Sao 3 thưởng lời giải gọn, chấm theo cách viết tự nhiên.
- Mẹo tối ưu (gộp nhịp…) thành bài riêng có chủ đích.
- Đổi thứ tự chương: sửa `thu-tu-chuong.js`.

| # | Chương (mã) | Part / cơ chế mới | Luật riêng | Python học thêm | Màn phối hợp / địa hình lạ |
|---|---|---|---|---|---|
| 1 | Hai bánh (`hai-banh`) | thân hai bánh | lệnh bánh chỉ ra lệnh, `wait()` cho nhịp trôi | lệnh tuần tự, sửa code (xóa, đổi chỗ) | — |
| 2 | Xưởng hàm (`xuong-ham`) | — | khung 10 ô | `def`, hàm gọi hàm | — |
| 3 | Tay gắp (`tay-gap`) | tay kẹp | tay di chuyển trước, kẹp sau; tay hạ thì xe kẹt; thả từ cao thì vỡ | tạo `pick`/`drop`, gộp nhịp (bài riêng) | nhiều vật, nhiều đích |
| 4 | Vòng lặp (`vong-lap`) | — | — | `for`, thụt lề, `for` lồng | — |
| 5 | Băng chuyền (`bang-chuyen`) | địa hình băng chuyền | đứng trên băng đủ 2 nhịp thì bị đẩy 1 ô | `for` để đếm | mang vật qua băng |
| 6 | Hàm có tham số (`tham-so`) | — | — | `def move(n)`, `turn(k)`, `range(n)` | tay gắp + đường dài |
| 7 | Thân nhện (`nhen`) | thân nhện | đi 4 hướng theo màn hình, 2 nhịp/ô, leo bậc thang, đứng trên băng ngược thì kẹt | chuỗi ký tự, `if/elif`, `go("U")` ("U" lên, "D" xuống, "L" trái, "R" phải), `for c in "UURR"`, `walk(path)` | nhện + tay kẹp; bậc thang + băng |
| 8 | Bánh xích (`xich`) | thân bánh xích | cùng lệnh với hai bánh nhưng quay 2 nhịp; leo bậc thang; không bị băng đẩy | hàm phụ thuộc phần cứng: sửa lại `turn_*` cho thân mới | xích qua băng; xích + tay kẹp leo bậc |
| 9 | Bánh omni (`omni`) | thân omni | có mọi lệnh bánh của xe hai bánh + `slide_left()` / `slide_right()` trượt ngang 1 ô theo HƯỚNG MẶT; không đi chéo (slide + lệnh bánh cùng nhịp = chỉ slide); không leo bậc thang; băng chuyền đẩy ngay sau 1 nhịp (xuôi băng 2 ô / nhịp, ngược băng đứng im) | hướng tương đối và tuyệt đối, hàm trượt có tham số `slide_r(n)`, `slide_l(n)` | omni + tay kẹp trong hốc hẹp; băng đẩy mạnh |
| 10 | Tấm đẩy (`tam-day`) | tay tấm đẩy | thùng NẶNG không gắp được, chỉ đẩy; đẩy vào tường hay góc thì kẹt (kiểu Sokoban) | lập kế hoạch, hàm `push_to` | đẩy thùng lên băng chuyền |
| 11 | Cảm biến khoảng cách (`khoang-cach`) | cảm biến | `front_clear()` trả True/False; chấm trên NHIỀU sân ngẫu nhiên | `if`, `while`, biến đếm | đi theo tường; tìm vật |
| 12 | Cảm biến màu (`mau`) | cảm biến | `color()` đọc màu ô dưới xe | so sánh chuỗi `== "red"` | đi theo vạch kẻ; phân loại vật theo ô màu |
| 13 | Nam châm (`nam-cham`) | tay nam châm | hút vật SẮT ở phía trước 1–2 ô về sát xe; vật gỗ không hút được | loại vật, `if` theo loại | nam châm + cảm biến màu |
| 14 | Máy ném (`may-nem`) | tay máy ném | `aim(n)` rồi `throw()`: vật bay `n` ô qua tường thấp | tham số, tính khoảng cách | ném qua băng hay rào |
| 15 | Súng bóng (`sung-bong`) | tay súng bóng | `shoot()` bóng bay thẳng; trúng nút thì mở cửa hoặc tắt băng | trạng thái sân, `while` chờ | bắn nút tắt băng rồi qua |
| 16 | Drone (`drone`) | thân drone | bay qua tường thấp và băng; có PIN giới hạn; không gắn tay kẹp hay tấm đẩy | biến đếm pin, tối ưu | drone + nam châm treo |
| 17+ | Thực chiến | tự chọn part | mỗi màn có nhiều cách giải tùy bộ part | tổng hợp | — |

Thứ tự làm qua đêm 14/10:
1. Ghép part vào game.
2. Chương 5.
3. Thêm chuỗi ký tự vào bộ chạy Python.
4. Chương 6, 7, 8…
5. Làm tới đâu thì ghi vào cuối tệp này.

## Nhật ký
- 14/10: chương 1–4 chơi được. Chương 5 đang làm lõi. Bộ part lượt 5 xong (`cd6a347`).
- 14/10 (tối): core Python có chuỗi ký tự (`"..."`, `'...'`, `==`/`!=`/`<`, `+` nối, `*` lặp, `in`/`not in`, `len`/`str`/`int`, `for c in "UURR":`, hàm game nhận/trả chuỗi; chuỗi + số là lỗi chạy tiếng Việt; chuỗi chưa đóng báo đúng dòng); máy kiểm `kiem-chuoi.mjs` (99). Chương 6 `tham-so` (Hàm có tham số) xong lõi: 10 màn `man-tham-so.js` (forward(n), right(k), deliver(n), step(a, b), run(n) của màn), máy kiểm `kiem-tham-so.mjs` (113); kho hàm tăng lên 20 chỗ. Giao diện chưa có ô nhập tham số trong Xưởng.
- 14/10 (đêm): chương 7 `nhen` (Thân nhện) xong lõi: 10 màn `man-nhen.js` (go(d) bằng if/elif, walk(path), bring(path); nhện + tay kẹp ở 6, 9, 10; sửa `go_sai`; băng ngược chặn nhện), máy kiểm `kiem-nhen.mjs` (130) và bộ dò đường tắt cho nhện `do-duong-nhen.mjs`. Luật nhện + tay (`san-hoc.js`): lệnh tay làm ở NHỊP ĐẦU của bước `go_*` kế tiếp (hoặc ở nhịp `wait()`), nhịp hai là bước chân; tay đang hạ ở nhịp hai thì chân vướng, bước bị bỏ (`tay-vuong`). `cauTruc` kiểm thêm `if`; chẩn đoán mới `nhen-khong-buoc`; kho tăng lên 23 chỗ. Giao diện chưa có: ô nhập chuỗi (chạm chọn U/D/L/R), bộ ghép chuỗi trong `for c in "…"`, nhóm khối `go_*`, vẽ nhện bằng part.
- 14/10 (rạng sáng): chương 8 `xich` (Bánh xích) xong lõi: 10 màn `man-xich.js` (tr_right() ở 8.3, tr_left() ở 8.4; xích + tay kẹp ở 8.7, 8.10; 8.2 chạy turn_right() cũ để thấy xe chỉ quay nửa vòng; 8.8 sửa tr_sai(); 8.9 hai đường: ngắn gấp khúc 19 nhịp, dài ít khúc quẹo 17 nhịp), máy kiểm `kiem-xich.mjs` (132) và bộ dò đường tắt cho xích `do-duong-xich.mjs`; `kiem-hoc` lên 80 màn (1594). Luật xích (`san-hoc.js`, loaiRobot `xich`): CÙNG bộ lệnh với xe bánh; tiến / lùi 1 ô; QUAY CHẬM: một nhịp chỉ một bên chạy (hoặc hai bên ngược chiều) thì xe chỉ "nhích nửa vòng" (robot.quayDo ±1, sự kiện `quay-nua`), 2 nhịp LIÊN TIẾP CÙNG tổ hợp (cặp trái, phải) mới đủ 90° — nhịp kế khác tổ hợp (tiến, lùi, wait, tay vướng, tổ hợp quay khác) thì quay dở MẤT (sự kiện `xich-quay-do`, chẩn đoán thông tin "Xe xích cần 2 nhịp liên tiếp cùng một lệnh để quay đủ 90°"); leo bậc thang S; băng chuyền KHÔNG đẩy được xích (chỉ ghi `bang-khong-day` cho hoạt cảnh). turn_right() cũ gọi hai lần liền = đúng một lần quay 90° (u_turn() cũ chỉ quay 90° trên xích). Kho tăng lên 25 chỗ (23 hàm cốt truyện + 2). Giao diện chưa có: nạp `man-xich.js` (choi.html), vẽ xích bằng part (`part-xich.js`), hoạt cảnh quay dở (xoay ~45° theo robot.quayDo). Xưởng hàm nhận tr_right và tr_left không đối số như hàm thường.
- 14/10 (sáng): chương 9 `omni` (Bánh omni) xong lõi: 10 màn `man-omni.js` (9.1 slide_right() đầu tiên; 9.2 né vật cản; 9.3 tạo `slide_r(n)`; 9.4 tạo `slide_l(n)`, hành lang uốn rắn; 9.5 xe quay mặt sang trái nên `slide_right` đi LÊN; 9.6 omni + tay kẹp, nhặt ở hốc bên cạnh; 9.7 băng đẩy mạnh, xuôi băng 2 ô / nhịp, ngược băng đứng im; 9.8 sửa hàm của màn `side_r(n)` trượt nhầm phía; 9.9 đề `omni-khong-cheo`: tách nhịp trượt và tiến; 9.10 trùm: xe quay mặt sang phải, tay kẹp, băng, hốc), máy kiểm `kiem-omni.mjs` (174) và bộ dò đường tắt cho omni `do-duong-omni.mjs`; `kiem-hoc` lên 90 màn (1754). Luật omni (`san-hoc.js`, loaiRobot `omni`, HAM_GOC.omni): CÙNG bộ lệnh bánh với xe hai bánh (tiến / lùi 1 ô, quay 90° và quay đầu trong 1 nhịp) + HAI lệnh gốc mới `slide_left()` / `slide_right()` (chỉ ra lệnh, `wait()` cho nhịp trôi) trượt 1 ô sang trái / phải so với hướng mặt, hướng giữ nguyên; KHÔNG ĐI CHÉO: nhịp có slide mà còn lệnh bánh thì chỉ làm slide, lệnh bánh bị bỏ (sự kiện `omni-khong-cheo`, chẩn đoán thông tin "Bánh omni không đi chéo: một nhịp chỉ trượt ngang HOẶC tiến/quay"); hai slide cùng nhịp thì lệnh sau bị bỏ (`slide-goi-lai`, mức lỗi); tay hạ chặn cả slide (`tay-vuong`); không leo S; băng chuyền đẩy omni ngay sau 1 nhịp (ngưỡng 1 thay vì 2): xuôi băng 2 ô / nhịp, ngược băng đứng im. Vết nhịp có `robot.truot` (-1 trái, 0, +1 phải). Kho tăng lên 27 chỗ (25 hàm cốt truyện + 2); `slide_left`, `slide_right` vào HAM_GOC_MAC_DINH của kho. Giao diện chưa có: nạp `man-omni.js` (choi.html), khối `slide_left` / `slide_right`, vẽ omni bằng part (sửa `hamGoc` của `part-omni.js` thành bộ lệnh omni mới), hoạt cảnh trượt ngang (theo `robot.truot`). Vì trượt và tiến cùng tốc độ (1 ô / nhịp), quay không bao giờ nhanh hơn trượt: trùm không bắt buộc quay.
