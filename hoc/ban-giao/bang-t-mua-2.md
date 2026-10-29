# Bảng gói T mùa 2 (sinh bởi node hoc/kiem-lach-mua-2.mjs --bang)

Cột "mới": khái niệm / lệnh / part / cơ chế lần đầu xuất hiện trong lộ trình mùa 2 tại màn đó. "HD": có hướng dẫn từng bước (huong-dan-man.js). "trình diễn": chiChay. "ép": khái niệm màn đang ép (máy dò lách kiểm; "lệnh / cơ chế" không có lách cấu trúc). "lỗ": lách thắng ở khái niệm đang ép. "đâm là thua": cờ damLaThua.


## xich (Bánh xích)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | xich.1 | Xích quay hai nhịp | thân xích | có | có |  |  |  |
| 2 | xich.2 | Quay nửa vòng |  | có |  |  |  |  |
| 3 | xich.3 | Hàm tr_right() |  |  |  | def, for |  |  |
| 4 | xich.4 | Hàm tr_left() | thùng nặng |  |  | def, for |  |  |
| 5 | xich.5 | Trái rồi phải |  |  |  |  |  |  |
| 6 | xich.6 | Băng chuyền bất lực | băng chuyền |  |  |  |  |  |
| 7 | xich.7 | Xích gắp hàng |  |  |  |  |  |  |
| 8 | xich.8 | Sửa hàm tr_sai |  |  |  | for |  |  |
| 9 | xich.9 | Đường nào nhanh hơn |  |  |  |  |  |  |
| 10 | xich.10 | Đường bậc thềm |  |  |  |  |  |  |

## bien-xich (Biến cho xích)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-xich.1 | Quay đầu |  |  |  | def |  |  |
| 2 | che-xich.2 | Né sang phải |  |  |  | def |  |  |
| 3 | che-xich.8 | Quay chưa đủ |  |  |  | for |  |  |
| 4 | che-xich.6 | Nhặt sau lưng |  |  |  | def |  |  |
| 5 | che-cam-bien.6 | Đếm bước để trở về | biến | có | có | bien, while, for |  |  |
| 6 | che-cam-bien.5 | Đi rồi về | nhiều sân | có |  | bien, def, while, for |  | có |
| 7 | che-cam-bien.9 | Lấy rồi về |  |  |  | bien, def, while, for |  | có |
| 8 | robot-hoan-thien.9 | Kẹt số lùi |  |  |  | bien |  | có |
| 9 | che-xich.9 | Xích trái chỉ lùi |  |  |  | for |  |  |
| 10 | bien-xich.1 | Trùm: Đếm để về đúng hàng |  |  |  |  |  |  |

## sung-hoi (Súng hơi)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | sung-hoi.1 | Bắn là lùi | lệnh shoot | có | có |  |  |  |
| 2 | sung-hoi.2 | Bắn ra sau | lệnh shoot_back | có |  |  |  |  |
| 3 | sung-hoi.3 | Nút ở sau lưng | nút bắn, cửa | có |  |  |  |  |
| 4 | sung-hoi.4 | Thùng sau lưng |  | có |  |  |  |  |
| 5 | sung-hoi.5 | Hai thùng hai phía |  |  |  |  |  |  |
| 6 | sung-hoi.6 | Quay rồi đẩy |  |  |  |  |  |  |
| 7 | sung-hoi.9 | Thùng chắn bóng |  |  |  |  |  |  |
| 8 | sung-hoi.7 | Thùng đi băng |  |  |  |  |  |  |
| 9 | sung-hoi.8 | Tắt băng |  |  |  |  |  |  |
| 10 | sung-hoi.10 | Kho hàng |  |  |  |  |  |  |

## tham-so (Hàm có tham số)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | tham-so.1 | Gọi hàm có số | hàm có tham số | có | có | tham-so, for |  |  |
| 2 | tham-so.2 | Hoàn thành forward |  | có |  | tham-so, for |  |  |
| 3 | tham-so.3 | Tạo hàm forward |  |  |  | tham-so, def, for |  |  |
| 4 | tham-so.4 | Quay k lần |  |  |  | tham-so, def, for |  |  |
| 5 | tham-so.5 | Đường nhiều đoạn |  |  |  |  |  |  |
| 6 | tham-so.6 | Giao hàng deliver |  |  |  | def, tham-so |  |  |
| 7 | tham-so.7 | Sửa số cố định |  |  |  | for, tham-so |  |  |
| 8 | tham-so.8 | Hai tham số |  |  |  | def, tham-so |  |  |
| 9 | tham-so.9 | Số lần chứ không phải số ô |  |  |  |  |  |  |
| 10 | tham-so.10 | Ba chuyến dài |  |  |  |  |  |  |

## hong-ngoai (Hồng ngoại)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | hong-ngoai.1 | Mỗi ô là 10 cm | distance(), lệnh distance | có | có | distance |  |  |
| 2 | hong-ngoai.2 | Đưa thẳng số đo vào vòng lặp |  | có |  | distance |  |  |
| 3 | hong-ngoai.3 | Còn ô trống thì đi |  |  |  | distance |  |  |
| 4 | hong-ngoai.4 | Dừng cách tường 20 cm |  |  |  | distance |  |  |
| 5 | hong-ngoai.5 | Biến an_toan |  |  |  |  |  |  |
| 6 | hong-ngoai.6 | Gần thì rẽ |  |  |  |  |  |  |
| 7 | hong-ngoai.7 | Phanh không kịp |  |  |  |  |  |  |
| 8 | hong-ngoai.8 | Chân bàn |  |  |  |  |  |  |
| 9 | hong-ngoai.9 | Nhớ số để quay về |  |  |  |  |  |  |
| 10 | hong-ngoai.10 | Trùm: Robot hút bụi |  |  |  |  |  |  |

## che-hong-ngoai (Hàm cho hồng ngoại)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-hong-ngoai.1 | Hàm go_to_wall() |  | có |  | def, while, distance |  |  |
| 2 | che-hong-ngoai.2 | Hàm go_safe(an_toan) |  |  |  | def, while, distance, tham-so |  |  |
| 3 | che-hong-ngoai.3 | Một bước hút bụi |  |  |  | def, if, distance, tham-so |  |  |
| 4 | che-hong-ngoai.4 | Đi lấy rồi về: go_get() |  |  |  | def, bien, distance, tham-so |  |  |
| 5 | che-hong-ngoai.5 | Sửa hàm safe() |  |  |  | while, distance, tham-so |  |  |
| 6 | che-hong-ngoai.6 | go_safe trong vòng lặp |  |  |  |  |  |  |
| 7 | che-hong-ngoai.7 | Sửa hàm take() |  |  |  | bien, distance, tham-so |  |  |
| 8 | che-hong-ngoai.8 | Tìm mức an toàn |  |  |  |  |  |  |
| 9 | che-hong-ngoai.9 | Chở vật qua ngõ hẹp |  |  |  |  |  |  |
| 10 | che-hong-ngoai.10 | Trùm: Một hàm cho mọi đoạn |  |  |  |  |  |  |

## bang-chuyen (Băng chuyền)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | bang-chuyen.1 | Lên băng |  | có | có |  |  |  |
| 2 | bang-chuyen.2 | Ngược dòng |  | có |  |  |  |  |
| 3 | bang-chuyen.6 | Bậc thang băng |  |  |  |  |  |  |
| 4 | bang-chuyen.5 | Chở qua băng |  |  |  |  |  |  |
| 5 | bang-chuyen.7 | Sửa số lần lặp |  |  |  |  |  |  |
| 6 | bang-chuyen.8 | Rắn băng |  |  |  |  |  |  |
| 7 | bang-chuyen.3 | Chọn cột băng |  |  |  |  |  |  |
| 8 | bang-chuyen.4 | Trôi lệch |  |  |  |  |  |  |
| 9 | bang-chuyen.9 | Chờ băng |  |  |  |  |  |  |
| 10 | bang-chuyen.10 | Ba chuyến băng |  |  |  |  |  |  |

## che-sung-hoi (Chế lệnh súng hơi)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-sung-hoi.1 | Lùi bằng giật |  | có |  | def |  |  |
| 2 | che-sung-hoi.2 | Tiến bằng giật |  | có |  | def |  |  |
| 3 | che-sung-hoi.3 | Giật tới giật lùi |  |  |  |  |  |  |
| 4 | che-sung-hoi.4 | Đá thùng sang phải |  |  |  | def |  |  |
| 5 | che-sung-hoi.5 | Bắn nút rồi về |  |  |  | def |  |  |
| 6 | che-sung-hoi.6 | Đá thùng sang trái |  |  |  | def |  |  |
| 7 | che-sung-hoi.8 | Nòng sau hỏng |  |  |  | def |  |  |
| 8 | che-sung-hoi.7 | Đá hai bên |  |  |  |  |  |  |
| 9 | che-sung-hoi.9 | Đường về |  |  |  |  |  |  |
| 10 | che-sung-hoi.10 | Kho hàng |  |  |  |  |  |  |

## day-thung (Đẩy thùng)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | day-thung.1 | Thùng trượt một ô | xích đẩy thùng | có | có |  |  |  |
| 2 | day-thung.2 | Đẩy cả đoạn đường |  | có |  |  |  |  |
| 3 | day-thung.3 | Quay xích rồi đẩy |  |  |  |  |  |  |
| 4 | day-thung.4 | Đố: lùi có kéo được không? |  |  |  |  |  |  |
| 5 | day-thung.5 | Ô sau thùng là tường |  |  |  |  |  |  |
| 6 | day-thung.6 | Mắt hồng ngoại thấy thùng |  |  |  |  |  |  |
| 7 | day-thung.7 | Thùng lên băng chuyền |  |  |  |  |  |  |
| 8 | day-thung.8 | Mở đường |  |  |  |  |  |  |
| 9 | day-thung.9 | Thùng đè nút |  |  |  |  |  |  |
| 10 | day-thung.10 | Trùm: Kho thùng xích |  |  |  |  |  |  |

## che-day-thung (Hàm đẩy thùng)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-day-thung.1 | Hàm push(n) |  | có |  | def, distance, tham-so |  |  |
| 2 | che-day-thung.2 | push trong vòng lặp |  |  |  |  |  |  |
| 3 | che-day-thung.3 | Hàm go_around() |  |  |  | def |  |  |
| 4 | che-day-thung.4 | Sửa hàm round_left() |  |  |  |  |  |  |
| 5 | che-day-thung.5 | Sửa hàm shove(n) |  |  |  | distance, tham-so |  |  |
| 6 | che-day-thung.6 | Hàm push_around(n) |  |  |  | def, tham-so |  |  |
| 7 | che-day-thung.7 | Đẩy hai ô mỗi đoạn |  |  |  |  |  |  |
| 8 | che-day-thung.8 | Thùng đè nút, cửa mở |  |  |  |  |  |  |
| 9 | che-day-thung.9 | Hàm push_back(n) |  |  |  | def, tham-so |  |  |
| 10 | che-day-thung.10 | Trùm: Một hàm cho ba kho |  |  |  |  |  |  |

## luc-ban (Lực bắn)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | luc-ban.1 | Bắn nhanh | lực bắn fast / charge, chọn lực bắn | có | có | luc |  |  |
| 2 | luc-ban.2 | Nút ở xa |  | có |  | luc |  |  |
| 3 | luc-ban.3 | Nhanh hay tụ |  |  |  | luc |  |  |
| 4 | luc-ban.4 | Hàm fire(p) |  |  |  | def, tham-so |  |  |
| 5 | luc-ban.5 | Bắn nhanh ra sau |  |  |  | def, tham-so |  |  |
| 6 | luc-ban.6 | Nhanh để bấm, tụ để đẩy |  |  |  |  |  |  |
| 7 | luc-ban.7 | Đố: quên dùng p |  |  |  | tham-so |  |  |
| 8 | luc-ban.8 | Hàm smart_fire() |  |  |  | def, if, tham-so |  |  |
| 9 | luc-ban.9 | Đố: đảo nhánh |  |  |  | if, tham-so |  |  |
| 10 | luc-ban.10 | Trùm: Ba cửa ba lực |  |  |  |  |  |  |

## che-luc-ban (Hàm lực bắn)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-luc-ban.1 | Hàm aim_fire() |  | có |  | def, if, distance, tham-so |  |  |
| 2 | che-luc-ban.2 | Hàm aim_left() |  |  |  | def |  |  |
| 3 | che-luc-ban.3 | Sửa hàm quick_aim() |  |  |  | if, distance, tham-so |  |  |
| 4 | che-luc-ban.4 | Hàm aim_right() trong vòng lặp |  |  |  | def |  |  |
| 5 | che-luc-ban.5 | Hàm fire_left(p) |  |  |  | def, tham-so |  |  |
| 6 | che-luc-ban.6 | Hàm close_fire() |  |  |  | def, tham-so |  |  |
| 7 | che-luc-ban.7 | Hàm scan_left() |  |  |  | def, for |  |  |
| 8 | che-luc-ban.8 | Hàm aim_turn() |  |  |  | def |  |  |
| 9 | che-luc-ban.9 | Đố: lực bị viết cứng |  |  |  | tham-so |  |  |
| 10 | che-luc-ban.10 | Trùm: Ba hành lang nút |  |  |  |  |  |  |

## do-nhiet (Đo nhiệt)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | do-nhiet.1 | Nút nào đang nóng | warm(), lệnh warm, nút bật sẵn (nóng) | có | có | warm |  |  |
| 2 | do-nhiet.2 | Đèn nóng chỉ đường |  | có |  | warm |  |  |
| 3 | do-nhiet.3 | Cửa, thùng hay đèn |  |  |  | warm |  |  |
| 4 | do-nhiet.4 | Hành lang năm nút |  |  |  | warm |  |  |
| 5 | do-nhiet.5 | Xa gần và nóng lạnh |  |  |  | if, not, warm |  |  |
| 6 | do-nhiet.6 | Nút hai bên đường |  |  |  | if, not, warm, tham-so |  |  |
| 7 | do-nhiet.7 | Đi rồi về qua nút cũ |  |  |  | if, not, warm, tham-so |  |  |
| 8 | do-nhiet.8 | Đố: Sola bắn mọi nút |  |  |  | if, not, warm |  |  |
| 9 | do-nhiet.9 | Băng chuyền và nút nóng |  |  |  | if, not, warm, tham-so |  |  |
| 10 | do-nhiet.10 | Trùm: Ba mê cung đèn nóng |  |  |  |  |  |  |

## che-do-nhiet (Hàm đo nhiệt)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-do-nhiet.1 | Hàm switch_on() |  | có |  | def, if, not, warm, tham-so |  |  |
| 2 | che-do-nhiet.2 | Hàm switch_left() |  |  |  | def |  |  |
| 3 | che-do-nhiet.3 | Sửa hàm light() |  |  |  | if, not, warm, tham-so |  |  |
| 4 | che-do-nhiet.4 | Hàm find_warm() |  |  |  | def, while, not, warm |  |  |
| 5 | che-do-nhiet.5 | Hàm aim_on() |  |  |  | def, if, not, warm |  |  |
| 6 | che-do-nhiet.6 | Hàm scan_on(n) |  |  |  | def, for, tham-so |  |  |
| 7 | che-do-nhiet.7 | Hàm switch_right() |  |  |  | def |  |  |
| 8 | che-do-nhiet.8 | Hàm aim_left_on() |  |  |  | def |  |  |
| 9 | che-do-nhiet.9 | Sửa hàm find_hot() |  |  |  | while, not, warm |  |  |
| 10 | che-do-nhiet.10 | Trùm: Hành lang và ngã rẽ |  |  |  |  |  |  |

## doi-mua-2 (Đội)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | doi-mua-2.1 | Bạn chắn đường bóng | hai robot | có |  |  |  |  |
| 2 | doi-mua-2.2 | Đón bạn vào khoang |  |  |  |  |  |  |
| 3 | doi-mua-2.3 | Theo sau xe xích |  |  |  |  |  |  |
| 4 | doi-mua-2.4 | Bạn qua rồi mới bắn |  |  |  |  |  |  |
| 5 | doi-mua-2.5 | Xích nhường ở ngã tư |  |  |  |  |  |  |
| 6 | doi-mua-2.6 | Thùng không nóng |  |  |  |  |  |  |
| 7 | doi-mua-2.7 | Đố: Sola chờ mãi |  |  |  |  |  |  |
| 8 | doi-mua-2.8 | Chờ bạn rồi chọn lực |  |  |  |  |  |  |
| 9 | doi-mua-2.9 | Ngã tư có thùng |  |  |  |  |  |  |
| 10 | doi-mua-2.10 | Trùm: Ba ngã tư |  |  |  |  |  |  |

## che-doi-mua-2 (Đội phối hợp)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-doi-mua-2.1 | Hàm wait_clear() |  | có |  |  |  |  |
| 2 | che-doi-mua-2.2 | Hàm yield_step() cho cả đội |  |  |  |  |  |  |
| 3 | che-doi-mua-2.3 | Sửa hàm keep_close() |  |  |  |  |  |  |
| 4 | che-doi-mua-2.4 | Hàm wait_mate() |  |  |  |  |  |  |
| 5 | che-doi-mua-2.5 | Hàm pass_mate() |  |  |  |  |  |  |
| 6 | che-doi-mua-2.6 | Hàm shot_clear(p) |  |  |  |  |  |  |
| 7 | che-doi-mua-2.7 | Hàm step_clear() |  |  |  |  |  |  |
| 8 | che-doi-mua-2.8 | Hàm cover() |  |  |  |  |  |  |
| 9 | che-doi-mua-2.9 | Sửa hàm cross_ok() |  |  |  |  |  |  |
| 10 | che-doi-mua-2.10 | Trùm: Canh cửa sổ |  |  |  |  |  |  |

## be-sung (Bệ súng xích)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | be-sung.1 | Bệ súng không giật | bệ súng xích | có | có |  |  |  |
| 2 | be-sung.2 | Nút sau lưng |  | có |  |  |  |  |
| 3 | be-sung.3 | Hai phát một chỗ |  |  |  |  |  |  |
| 4 | be-sung.4 | Thùng nằm yên |  |  |  |  |  |  |
| 5 | be-sung.5 | Hành lang có hốc |  |  |  |  |  |  |
| 6 | be-sung.6 | Trạm nào còn tắt |  |  |  | if, not, warm, tham-so |  |  |
| 7 | be-sung.7 | Đố: Sola quay nửa vòng |  |  |  |  |  |  |
| 8 | be-sung.8 | Đẩy thùng qua cửa |  |  |  |  |  |  |
| 9 | be-sung.9 | Ba phát quanh mình |  |  |  |  |  |  |
| 10 | be-sung.10 | Trùm: Ba hành lang trạm |  |  |  |  |  |  |

## che-be-sung (Hàm bệ súng)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | che-be-sung.1 | Hàm blast_left() |  | có |  | def, tham-so |  |  |
| 2 | che-be-sung.2 | Hàm blast_right() |  |  |  | def, tham-so |  |  |
| 3 | che-be-sung.3 | Sửa hàm left_shot() |  |  |  | tham-so |  |  |
| 4 | che-be-sung.4 | Hàm lock_on() |  |  |  | def, if, not, warm, tham-so |  |  |
| 5 | che-be-sung.5 | Hàm lock_left() |  |  |  | def |  |  |
| 6 | che-be-sung.6 | Hàm lock_row(n) |  |  |  | def, for, tham-so |  |  |
| 7 | che-be-sung.7 | Hàm go_fire() |  |  |  | def |  |  |
| 8 | che-be-sung.8 | Hàm visit() |  |  |  | def, bien, distance, for, tham-so |  |  |
| 9 | che-be-sung.9 | Hàm push_blast() |  |  |  | def, tham-so |  |  |
| 10 | che-be-sung.10 | Trùm: Hai dây chuyền |  |  |  |  |  |  |

## tong-hop-2 (Tổng hợp)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | tong-hop-2.1 | Băng chuyền giúp một tay |  |  |  |  |  |  |
| 2 | tong-hop-2.2 | Đố: jet_back() không lùi |  |  |  |  |  |  |
| 3 | tong-hop-2.3 | Giếng sau lưng |  |  |  |  |  |  |
| 4 | tong-hop-2.4 | Thùng ở làn dưới |  |  |  |  |  |  |
| 5 | tong-hop-2.5 | Mở cửa cho thùng sau lưng |  |  |  |  |  |  |
| 6 | tong-hop-2.6 | Sửa hàm pair_shot() |  |  |  | tham-so |  |  |
| 7 | tong-hop-2.7 | Trạm xa trạm gần |  |  |  |  |  |  |
| 8 | tong-hop-2.8 | Bệ súng và xe đẩy |  |  |  |  |  |  |
| 9 | tong-hop-2.9 | Thùng qua ngã tư |  |  |  |  |  |  |
| 10 | tong-hop-2.10 | Trùm: Ba dây chuyền thùng |  |  |  |  |  |  |

## trum-mua-2 (Trùm mùa)

| số | mã | tên | mới | HD | trình diễn | ép | lỗ | đâm là thua |
|---|---|---|---|---|---|---|---|---|
| 1 | trum-mua-2.1 | Hàm side_push() |  |  |  | def, tham-so |  |  |
| 2 | trum-mua-2.2 | Hàm fire_on() |  |  |  | def, while, not, warm, tham-so |  |  |
| 3 | trum-mua-2.3 | Sửa hàm nudge() |  |  |  | bien, distance, for, tham-so |  |  |
| 4 | trum-mua-2.4 | Hàm lane_row(n) |  |  |  | def, for, tham-so |  |  |
| 5 | trum-mua-2.5 | Hàm box_shot() cho đội |  |  |  |  |  |  |
| 6 | trum-mua-2.6 | Hàm gate_push() |  |  |  | def, tham-so |  |  |
| 7 | trum-mua-2.7 | Hàm check_lane() |  |  |  | def |  |  |
| 8 | trum-mua-2.8 | Đố: băng không chở xích |  |  |  |  |  |  |
| 9 | trum-mua-2.9 | Hàm far_push() |  |  |  | def, bien, distance, tham-so |  |  |
| 10 | trum-mua-2.10 | Trùm: Nhà máy chạy lại |  |  |  |  |  |  |
