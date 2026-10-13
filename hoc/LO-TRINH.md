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
| 7 | Thân nhện (`nhen`) | thân nhện | đi 4 hướng theo màn hình, 2 nhịp/ô, leo bậc thang, đứng trên băng ngược thì kẹt | chuỗi ký tự, `if/elif`, `go("up")`, `for c in "UURR"` | nhện + tay kẹp; bậc thang + băng |
| 8 | Bánh xích (`xich`) | thân bánh xích | cùng lệnh với hai bánh nhưng quay 2 nhịp; leo bậc thang; không bị băng đẩy | hàm phụ thuộc phần cứng: sửa lại `turn_*` cho thân mới | xích qua băng; xích + tay kẹp leo bậc |
| 9 | Bánh omni (`omni`) | thân omni | đi ngang được theo hướng mặt; quay riêng; bánh nhỏ bị băng đẩy mỗi nhịp | hướng tương đối và tuyệt đối, ít lệnh nhất | omni + tay kẹp trong hành lang hẹp |
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
