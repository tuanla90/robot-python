# Nghiệm thu độc lập Mùa 4 (mua-4), theo lộ trình thật

Ngày 30/10. Chỉ đọc repo `tay-gap-xoay-comparison-00c53c`, không sửa tệp nào. Dữ liệu: `xem-goi.cjs` đã sửa (nạp `hoc/lo-trinh-hoc.js`), cộng một bảng gọn một dòng mỗi màn và vài lần chạy máy chấm với lời giải lách (script trong scratchpad).

Nguồn kế hoạch: `KE-HOACH-7-MUA.md` (mùa 4 "Thành phố": Drone, Máy sơn, Camera; Python danh sách / `for x in a` / `append`; hộp màu, sàn màu, ô sạc; gói 8 là Đội nam châm và màu), `KE-HOACH-LIST-FLYCAM.md`, `KE-HOACH-LAP-RAP.md`, `KE-HOACH-MUA.md` (bản cũ).

## 0. Hiện trạng mùa 4

- Mùa 4 đang **ẩn** (`an: true`), là **kho tạm 24 gói, 394 màn**, xếp theo thứ tự cũ (lo-trinh-hoc.js dòng 1013 đến 1050). Vượt khuôn 10 gói × 200 màn; ghi nhận, không chấm thiếu gói là lỗi.
- Thống kê toàn mùa:
  - 11 gói đội (208 màn có hai robot), 3 gói lắp ráp, 2 gói chỉ một chương bộ phận (Flycam, Chế lệnh xích), 1 gói một màn (Nam châm trên omni).
  - **0 màn trình diễn khoá** (`chiChay`) trong 394 màn.
  - **165 màn không có lời sai mẫu** (gần hết 8 gói đội, cộng các trùm viết lại).
  - **31 màn còn bậc thang `S`** (kế hoạch đã bỏ S): toàn bộ che-xich, doi-xich-bac (trừ vài màn), doi-omni.1, .5, rap-nao.1, .7, .10, rap-tay.2, .10, doi-thu-manh.1, .4, .10.
  - Ba chương thiếu màn: che-xich 5 màn, doi-xich-bac 8 màn, nam-cham-omni 1 màn.
  - Mọi màn 1 đến 9 chỉ còn **một sân** (`motSan`, lo-trinh-hoc.js dòng 52 đến 79); mọi trùm ba sân.
  - Ngưỡng sao gói không đơn điệu: 0, 30, **0** (list), 30, 60, 35, 65, 95, 65, 95, 95, 125, 140, 170, 200, **0** (máy ném), 30, 30, 45, 75, 90, 90, 120, 150. Hai gói giữa mùa cần 0 sao nên mở ngay, phá thứ tự (do `NGUONG_MUA_SAU` khai cứng cũ cho list, máy ném, drone... ghi đè lên cách tính mới).
- So kế hoạch 7 mùa: hợp mùa 4 chỉ có Danh sách, Cảm biến màu / camera, Máy sơn, Drone, Flycam, Đội nam châm và màu. Còn lại thuộc mùa khác: Sân cơ khí (nút đè mùa 1, bàn xoay mùa 5, cổng mùa 6), omni và máy ném (mùa 5), gói đội dư và lắp ráp, đua, đọ sức (mùa 7), Chế lệnh xích (mùa 2).

## 1. Đường cong học tập

### 1.1 Vấn đề chung

**(a) Một sân cho màn 1 đến 9: cảm biến và điều kiện không bị ép, trùm thành bước nhảy.** Lời giải viết cứng, chạy bằng máy chấm của repo:

| Màn | Khái niệm cần ép | Lời giải lách | Kết quả |
|---|---|---|---|
| may-nem.6 "Đo rồi ném" | `front_clear()` + if | `aim(3)`, `throw()`, `wait()` | thắng 3 sao |
| may-nem.7 "Đích đúng màu" | `color()` + if | nạp rồi `aim(3)` | thắng 3 sao |
| che-may-nem.6 "Chia theo màu" | if `color()` trong hàm | `split()` chỉ nhánh ném trái | thắng 3 sao |
| flycam.1 "Tìm ô đỏ" | `while look() != "red"` | `for i in range(4): go_right()` | thắng 3 sao |
| flycam.3 "Đọc đơn" | `seen.append(look())` | ghi cứng ba màu | thắng 2 sao |
| drone.6 "Theo dõi pin" | `battery()` | đường bay cứng có ghé sạc | thắng 2 sao |
| rap-du.8 "Phân loại màu" | camera + if | `pick()`, `arm_right()`, `drop()` | thắng 3 sao |
| rap-du.9 "Hút từ xa" | cảm biến từ | `magnet_n()` cứng | thắng 3 sao |

Trùm là lần đầu chương trình phải tổng quát: nhịp trùm tính tổng ba sân, thường gấp 3 đến 6 lần màn 9 (ban-xoay 14 lên 64, doi-nam-cham 27 lên 73, che-drone 8 lên 74, flycam 7 lên 54, che-may-nem 10 lên 50).

**(b) Không có màn "show don't tell", không có bước giấu hàm cũ.** Màn đầu dồn khái niệm:
- may-son.1: bốn lệnh mới `ink`, `dot`, `pen_down`, `pen_up` cùng lúc.
- may-nem.1: `aim(n)`, `throw()` và luật bay qua rào.
- drone.1: bốn lệnh `go_*` cùng ba luật (qua rào, qua băng, không qua tường).
- flycam.1: cảm biến `look()` mới + tạo hàm có while ngay màn 1.
- ban-xoay: ba cơ chế mới trong một gói (bàn xoay màn 1 đến 3, nút đè chen ở màn 4, cổng dịch chuyển cả chương 2).

**(c) Màn làm quen quá nặng ở gói đội**: che-doi-xich.2 68 ô / 47 nhịp, che-doi-tay-xoay.3 64 ô, che-doi-nam-cham.1 60 ô / 28 nhịp, che-doi-nam-cham.3 63 ô. Màn đầu của gói đội đã 21 đến 37 ô (doi-ho-bang.1 21, doi-nam-cham.1 34, doi-mau.1 31).

**(d) Trùm nhẹ hơn giữa chương**: rap-tay.10 17 ô (màn 5: 29, màn 8: 27); dua-robot.10 17 ô (màn 9: 35); doi-thu-manh.10 21 ô (màn 4: 35, màn 9: 32); che-doi-gap-nem.10 42 ô, 17 nhịp (màn 4: 44 ô).

**(e) Chững / lặp**: drone.6 trùng drone.5 (cùng pin 5, lời giải, 8 nhịp); doi-mau.4, .5, .6 cùng 39 ô / 13 nhịp; che-doi-mau.4 đến .9 đều 41 đến 46 ô. Mỗi chương chế lệnh đều có một màn "Đường về" và một màn "sửa hàm hỏng / khớp hỏng" (che-list.7, che-omni.9, che-mau.7, che-may-nem.9, che-drone.7, flycam.7...): dùng được nhưng lặp khuôn.

### 1.2 Theo chương (ô sao 3, theo thứ tự màn)

- ban-xoay: 5, 6, 9, **27**, 19, 24, 23, 28, 24, 27. Nhảy ở màn 4 (nút đè, cơ chế mới ở hàng luyện).
- che-ban-xoay: 6, 6, **18**, 6, 24, 28, 29, 25, 26, 23. Răng cưa 18, 6, 24.
- list: 11, 11, 11, 17, 14, 12, 11, 17, 11, 15 (mượt). che-list: 11, 11, 17, **21**, 18, 21... (che-list.4 dồn biến đếm + while + `append` + tham số danh sách).
- omni: 3, 11, 14, 17, 15, 24, 9, 13, 7, 28. che-omni: 7, 9, 17, 15, 11, 21, 17, 12, 30, 30 (ổn).
- mau: 10, 9, 13, 13, 14, 10, 10, **23**, 14, 29 (mau.8 chen camera phía trước ở hàng biến thể). che-mau: 6, 7, 18, 11, 15, 25, 25, 14, 17, 35.
- may-son: 8, 9, 7, 11, 11, 8, 8, 14, 12, 16 (trùm may-son.10 chỉ một sân). che-may-son: 10, 14, **26**, 14, 27, 26, 24, 24, 10, 23 (che-may-son.3 26 ô ở hàng làm quen).
- may-nem: 3, 3, 8, **22**, 18, 6, 9, 19, 10, 25. che-may-nem: 7, 13, **25**, 13, 12, 16, 15, 17, 26, 20.
- drone: 4, 11, 2, 6, 7, 7, 8, **19**, 18, 25. che-drone: 5, 5, 6, 4, **15**, 11, 16, 14, 11, 24 (che-drone.6 `airlift` 23 nhịp).
- flycam: 3, 8, 10, 13, **19**, 12, 10, 7, 11, 18 (flycam.5 `dispatch` 25 nhịp ở hàng luyện).
- rap-nao: 6, 9, 12, 6, 11, 14, 12, 15, 14, 23. rap-tay: 13, 19, 13, 15, 29, 25, 19, 27, 19, 17. rap-du: 11, 7, 16, 12, 11, 16, 13, 17, 12, **37** (trùm nhảy vọt: hai hàm tự viết, ba sân, hai hộp mỗi kho).
- Gói đội: phần lớn 25 đến 50 ô suốt chương, trùm 40 đến 73 ô; doi-nam-cham / che-doi-nam-cham là nặng nhất mùa (trùm 63 và 73 ô, 73 nhịp).

### 1.3 Thứ tự khái niệm giữa các gói
Phụ thuộc không vỡ: `walk()`/`go()` nhện (mùa 3) trước drone.2; nam châm (mùa 3) trước drone.7; omni (gói 6) trước may-nem.9, doi-sung-hoi, nam-cham-omni; camera (mau.8) trước may-nem.7; `append` (che-list.4) trước flycam; `airlift`, `recharge` trước flycam. Không màn nào dùng khối chưa học.
Điểm trừ: mùa mở bằng Sân cơ khí và một gói đội, part mới đầu tiên (omni) mãi gói 6; ngưỡng 0 sao ở list và máy ném làm thứ tự này không được giữ khi chơi.

## 2. Liên kết trong gói

- **Chương 2 không phải chế lệnh**: che-ban-xoay "Cổng dịch chuyển" là một cơ chế mới (không màn nào tạo hàm), trái nguyên tắc chương 2 = chế lệnh cho thứ vừa học.
- **Nối tốt**: Danh sách (route, scan dùng lại ở trùm), Máy ném (`toss` chương 1 thành nền cho `launch`, `side_throw`, `carry_throw`...), Drone (che-drone.10 dùng `fly` + `recharge` của pin chương 1), Cảm biến màu, Máy sơn (`line`, `color_line`, `next_row` xây dần tới `grid`, `border`), Omni.
- **Lạc đề nhẹ**: may-nem.7 (bài camera), may-nem.9 (bài omni), che-may-nem.8 (bài bánh hỏng); mau.8 chen camera phía trước vào chương cảm biến bụng.
- **Gói rời rạc**: Chế lệnh xích (5 màn, chương làm quen xích ở mùa 2); Nam châm trên omni (1 màn, không có chương); Đội xích leo bậc (dựa vào bậc thang đã bỏ).
- **Gói đội**: chương 1 phối hợp / chương 2 tự chế hàm cho đội nối đúng khuôn (`hop_box`, `wait_box`, `give_way`, `wait_gate`, `load_belt`, `receive`...). Tên "Đội tay xoay và nam châm" nhưng R1 của mọi màn là xe nam châm.
- **Gói cuối mùa (Đọ sức part mạnh)**: nhắc lại xích, omni, nhện, vòi phun, drone, nam châm, máy ném: phong phú, đúng vai gói cuối; nhưng một chương và trùm nhẹ hơn màn 4, màn 9.

## 3. Đạt mục tiêu gói chưa

- **Danh sách**: xong gói viết được danh sách, chỉ số, `len`, `append` trong hàm. Đạt; che-list.9 không có lời sai.
- **Máy ném**: dùng được tầm, nạp, hàm ném có tham số; chọn tầm theo cảm biến chưa bị ép (lách 3 sao); trùm cho sẵn `toss_color`, không lời sai.
- **Drone**: bay lưới, `walk`, pin, ô sạc, nam châm treo, `ship`; trùm ba mức pin đúng mục tiêu. Nâng cấp "hạ cánh để sạc" của kế hoạch chưa có.
- **Flycam**: mục tiêu `seen.append(look())` chỉ bị kiểm thật ở trùm; thiếu chương 2.
- **Máy sơn**: đạt chấm, nét, màu, danh sách màu (may-son.7, hợp Python mùa 4); trùm chương 1 một sân.
- **Lắp ráp (não, tay, đủ bộ)**: đạt ý chọn part theo chướng ngại; rap-du khe cảm biến chỉ bắt buộc ở trùm, trùm viết lại chỉ còn hai cách lắp cùng thân + camera nên mất ý "chọn đủ bộ".
- **Sân cơ khí**: người chơi dùng được bàn xoay, nút đè, cổng, nhưng chưa chế hàm cho chúng (chỉ che-ban-xoay.6 có `warp_fetch`).
- **Gói đội**: mục tiêu phối hợp / chờ / hàm cho đội có mặt và trùm ba sân kiểm tra; nhưng không có lời sai mẫu nên máy kiểm không chứng minh trùm bắt lỗi điển hình.

## Kết luận từng gói

| # | Gói | Kết luận |
|---|---|---|
| 1 | Sân cơ khí | Chưa đạt: ba cơ chế một gói, chương 2 không chế lệnh, ban-xoay.4 nhảy 9 lên 27 ô |
| 2 | Đội vượt hố và băng chuyền | Đạt có góp ý: 0 lời sai, làm quen 21 đến 45 ô |
| 3 | Danh sách | Đạt có góp ý: che-list.4 dồn khái niệm |
| 4 | Chế lệnh xích | Chưa đạt: 5 màn, cả 5 dùng bậc thang S |
| 5 | Đội xích leo bậc | Chưa đạt: dựa bậc thang S, che-doi-xich.2 68 ô ở làm quen |
| 6 | Bánh omni | Đạt có góp ý: không màn trình diễn |
| 7 | Đội omni và xích | Đạt có góp ý: 0 lời sai, S ở .1, .5 |
| 8 | Đội vòi phun và omni | Đạt có góp ý: 0 lời sai |
| 9 | Cảm biến màu | Đạt có góp ý: mau.8 chen camera, một sân |
| 10 | Đội màu và vòi phun | Đạt có góp ý: 0 lời sai, ba màn liền cùng tải |
| 11 | Máy sơn | Đạt có góp ý: may-son.1 bốn lệnh mới, che-may-son.3 26 ô |
| 12 | Lắp ráp: Thân + Não | Đạt có góp ý: S ở .1, .7, .10 |
| 13 | Nam châm trên omni | Chưa đạt: một màn lẻ |
| 14 | Đội nam châm và màu | Đạt có góp ý: làm quen 60 ô, trùm 73 ô / 73 nhịp, 0 lời sai |
| 15 | Đội tay xoay và nam châm | Đạt có góp ý: tên lệch nội dung, doi-tay-xoay.4 63 ô, 0 lời sai |
| 16 | Máy ném | Đạt có góp ý: .6, .7 lách 3 sao |
| 17 | Đội tay gắp và máy ném | Đạt có góp ý: 0 lời sai, trùm không khó hơn màn 4 |
| 18 | Lắp ráp: Thân + Tay | Đạt có góp ý: trùm nhẹ nhất chương, S ở .2, .10 |
| 19 | Drone | Đạt có góp ý: drone.6 trùng drone.5 |
| 20 | Flycam | Chưa đạt: một chương, `look()` lách được trước trùm |
| 21 | Đội drone và máy ném | Đạt có góp ý: 0 lời sai |
| 22 | Lắp ráp: Đủ bộ | Chưa đạt: khe cảm biến lách ở .8, .9; trùm nhảy 17 lên 37 ô |
| 23 | Đua đối kháng | Đạt có góp ý: trùm 17 ô nhẹ hơn màn 9 (35 ô) |
| 24 | Đọ sức part mạnh | Đạt có góp ý: một chương, S ở .1, .4, .10, trùm nhẹ |

## Đề xuất sửa ưu tiên (tối đa 8)

1. **Dựng lại mùa 4 thành 10 gói "Thành phố"** theo KE-HOACH-7-MUA, giữ lõi đã hợp (Danh sách, Cảm biến màu / camera, Máy sơn, Drone, Flycam, Đội nam châm và màu), dời phần còn lại sang mùa 5 / 6 / 7. Trước mắt sửa ngưỡng sao: bỏ `NGUONG_MUA_SAU` cho list và máy ném (đang 0 sao giữa mùa).
2. **Lấy lại nhiều sân cho màn ép cảm biến / điều kiện**: may-nem.6, .7, che-may-nem.6, drone.6 (bản "Ba mức pin" 7, 5, 4, cũng hết trùng drone.5), flycam.1, .3, rap-du.3, .8, .9; sửa chữ còn sót "mỗi sân" (che-may-nem.6, gợi ý drone.6); thêm máy dò lách mùa 4 với các lời giải lách ở bảng 1.1(a).
3. **Màn trình diễn khoá + màn ép** ở màn đầu mỗi chương có khối mới: may-son.1 (tách bốn lệnh), may-nem.1, drone.1, flycam.1 (`look()` trước, `seek_red` sau), omni.1, mau.1, list.1, ban-xoay.1.
4. **Lời sai mẫu** cho 165 màn đang 0, ưu tiên trùm của 8 gói đội và bốn trùm viết lại (may-nem.10, drone.10, che-drone.10, rap-du.10) cùng che-list.9.
5. **Bỏ bậc thang S** ở 31 màn: dựng lại hoặc cất che-xich và doi-xich-bac; thay S ở rap-nao.1, .7, .10, rap-tay.2, .10, doi-omni.1, .5, doi-thu-manh.1, .4, .10. Gộp nam-cham.9 (Nam châm trên omni) vào chương omni / che-omni.
6. **Sân cơ khí**: tách cơ chế (nút đè về mùa 1, bàn xoay mùa 5, cổng mùa 6) và làm chương 2 thành chế lệnh thật cho cơ chế của gói.
7. **Flycam thêm chương 2** (làm quen `look()` không tạo hàm, rồi chế lệnh), dời flycam.5 ra sau; **rap-du** thêm màn đệm ba sân trước trùm, hạ trùm từ 37 ô và trả lại ít nhất ba cách lắp khác thân.
8. **Làm mượt tải và sửa trùm nhẹ**: che-doi-xich.2 (68 ô), che-doi-tay-xoay.3 (64), che-doi-nam-cham.1 (60), ban-xoay.4, che-may-son.3, may-nem.4, che-list.4 tách bớt; nâng trùm rap-tay.10, dua-robot.10, doi-thu-manh.10, che-doi-gap-nem.10 lên trên màn 9.

Ghi chú độ sâu: 6 gói Máy ném, Lắp ráp Thân + Tay, Drone, Flycam, Lắp ráp Đủ bộ, Danh sách được đọc từng màn và thử lách bằng máy chấm; 18 gói còn lại chấm theo bảng gọn (ô, nhịp, sân, lời sai, robot, hàm tạo, tên, đề một số màn), chưa đọc từng sân.
