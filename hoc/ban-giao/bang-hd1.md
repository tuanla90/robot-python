# Bảng hướng dẫn mùa 1 (sinh bởi node hoc/kiem-lach-mua-1.mjs --bang)

Cột "mới": khái niệm / lệnh / thao tác lần đầu xuất hiện trong lộ trình mùa 1 tại màn đó. "HD": có hướng dẫn từng bước (huong-dan-man.js). "trình diễn": chiChay. "ép": màn đang ép khái niệm (máy dò lách kiểm).


## hai-banh

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | hai-banh.1 | Bước đầu tiên | lệnh left_move, lệnh right_move, lệnh wait | có |  |  |
| 2 | hai-banh.2 | Ba bước |  | có |  |  |
| 3 | hai-banh.3 | Đố: rẽ phải |  |  |  |  |
| 4 | hai-banh.4 | Rẽ trái |  |  |  |  |
| 5 | hai-banh.5 | Chữ L |  |  |  |  |
| 6 | hai-banh.6 | Chữ L ngược |  |  |  |  |
| 7 | hai-banh.7 | Quay đầu |  |  |  |  |
| 8 | hai-banh.8 | Lạch bạch |  |  |  |  |
| 9 | hai-banh.9 | Dọn dòng thừa |  | có |  |  |
| 10 | hai-banh.10 | Xếp lại cho đúng |  | có |  |  |

## xuong-ham

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | xuong-ham.1 | Gọi hàm | goi-ham, sửa hàm của màn | có |  | goi-ham |
| 2 | xuong-ham.2 | Tạo hàm move | def, tạo hàm | có |  | def |
| 3 | xuong-ham.3 | Dùng move của em |  | có |  | goi-ham |
| 4 | xuong-ham.4 | Tạo hàm rẽ phải |  |  |  | def, goi-ham |
| 5 | xuong-ham.5 | Tạo hàm rẽ trái |  |  |  | def |
| 6 | xuong-ham.6 | Bậc thang |  |  |  |  |
| 7 | xuong-ham.7 | Quay đầu bằng hàm |  |  |  | def |
| 8 | xuong-ham.8 | Sửa hàm lỗi |  |  |  |  |
| 9 | xuong-ham.9 | Hàm gọi hàm |  |  |  | def |
| 10 | xuong-ham.10 | Cầu thang dài |  |  |  | def |

## tay-gap

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | tay-gap.1 | Nhặt và đặt | lệnh arm_down, lệnh arm_up, lệnh grab, lệnh release | có |  |  |
| 2 | tay-gap.2 | Tự nhặt, tự đặt |  |  |  |  |
| 3 | tay-gap.3 | Đố: kẹp hụt |  |  |  |  |
| 4 | tay-gap.4 | Đố: xe kẹt |  |  |  |  |
| 5 | tay-gap.5 | Hàm nhặt pick |  | có |  | def |
| 6 | tay-gap.6 | Hàm đặt drop |  |  |  | def |
| 7 | tay-gap.7 | Đường gấp khúc |  |  |  |  |
| 8 | tay-gap.8 | Sửa hàm thả nhanh |  |  |  |  |
| 9 | tay-gap.9 | Tiết kiệm nhịp |  |  |  |  |
| 10 | tay-gap.10 | Ba vật một đường |  |  |  | def |

## vong-lap

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | vong-lap.1 | Lặp lại | for | có |  | for |
| 2 | vong-lap.2 | Tự viết vòng lặp |  | có |  | for |
| 3 | vong-lap.3 | Hai đoạn thẳng |  | có |  | for |
| 4 | vong-lap.4 | Lặp một cụm |  |  |  | for |
| 5 | vong-lap.5 | Bậc thang |  |  |  |  |
| 6 | vong-lap.6 | Vòng lặp trong hàm |  |  |  | def, for |
| 7 | vong-lap.8 | Thụt lề |  | có |  |  |
| 8 | vong-lap.9 | Vòng lặp lồng nhau |  |  |  |  |
| 9 | che-lap.5 | Dọn hàng | main khoá, sửa hàm |  |  | def, for |
| 10 | vong-lap.10 | Đường ngoằn ngoèo |  |  |  | def, for |

## khoang-cach

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | khoang-cach.1 | Hỏi trước khi đi | if, lệnh front_clear | có | có | if |
| 2 | khoang-cach.12 | Hỏi rồi mới bước | nhiều sân | có |  | if |
| 3 | khoang-cach.2 | Đi tới tường | while | có | có | while |
| 4 | khoang-cach.13 | Hai hành lang |  | có |  | while |
| 5 | khoang-cach.3 | Tới tường rồi rẽ |  |  |  |  |
| 6 | khoang-cach.11 | Thùng trên tay |  |  |  |  |
| 7 | khoang-cach.8 | Vòng while chạy mãi |  |  |  |  |
| 8 | khoang-cach.5 | Hàm go_wall() |  | có |  | def, while |
| 9 | khoang-cach.6 | Gặp tường thì rẽ |  |  |  |  |
| 10 | khoang-cach.10 | Ba chuyến giao hàng |  | có |  |  |

## che-cam-bien

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-cam-bien.1 | Đi cẩn thận |  | có |  | def, if |
| 2 | che-cam-bien.2 | Tìm lối mở | not | có |  | not, def, while |
| 3 | che-cam-bien.7 | Thừa chữ not |  |  |  | if |
| 4 | che-cam-bien.11 | Một hàm, hai đoạn đường |  |  |  |  |
| 5 | che-cam-bien.12 | Dừng trước thùng |  |  |  |  |
| 6 | che-cam-bien.13 | Quay đầu trong vòng lặp |  |  |  | while |
| 7 | che-cam-bien.3 | Ghép những góc rẽ |  |  |  |  |
| 8 | che-cam-bien.14 | Sửa hàm nhặt thùng |  |  |  |  |
| 9 | che-cam-bien.15 | Rẽ về phía có lối |  |  |  | if, not |
| 10 | che-cam-bien.16 | Giao thùng vào ngách |  |  |  |  |

## nut-de

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | nut-de.1 | Thùng giữ cửa |  |  |  |  |
| 2 | nut-de.2 | Tự đặt lên nút |  |  |  |  |
| 3 | nut-de.3 | Thùng cuối hành lang |  |  |  |  |
| 4 | nut-de.4 | Ngách đối diện |  |  |  |  |
| 5 | nut-de.5 | Hai nút hai cửa |  |  |  |  |
| 6 | nut-de.6 | Kho dài |  |  |  |  |
| 7 | nut-de.7 | Đố: xe tự đè nút |  |  |  |  |
| 8 | nut-de.8 | Đố: cửa ngược |  |  |  |  |
| 9 | nut-de.9 | Sửa hàm giữ cửa |  |  |  |  |
| 10 | nut-de.10 | Trùm: kho nhiều cửa |  |  |  |  |

## kho-hang

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-xe.1 | Né phải |  | có |  | def |
| 2 | che-xe.2 | Né trái |  |  |  | def |
| 3 | che-xe.3 | Đường né |  |  |  |  |
| 4 | che-tay.1 | Chuyền ra sau |  |  |  | def |
| 5 | che-tay.2 | Đặt sang phải |  |  |  | def |
| 6 | che-tay.3 | Dọn đường |  |  |  |  |
| 7 | che-tay.4 | Nhặt sau lưng |  |  |  | def |
| 8 | che-tay.6 | Đổi chỗ |  |  |  | def |
| 9 | che-tay.8 | Thứ tự của tay |  |  |  |  |
| 10 | che-tay.10 | Kho đồ |  |  |  |  |

## banh-lui

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-xe.4 | Bánh lùi | lệnh left_back, lệnh right_back | có |  | def |
| 2 | che-xe.5 | Quay đầu một nhịp |  |  |  |  |
| 3 | che-xe.6 | Đỗ lùi |  |  |  | def |
| 4 | banh-lui.1 | Lùi tránh thùng |  |  |  |  |
| 5 | banh-lui.2 | Lùi vào ngách |  |  |  |  |
| 6 | che-xe.7 | Đường về |  |  |  |  |
| 7 | banh-lui.3 | Ghé trạm rồi lùi ra |  |  |  |  |
| 8 | che-xe.8 | Hai bánh cùng nhịp |  |  |  |  |
| 9 | che-xe.9 | Chỉ còn số lùi |  |  |  |  |
| 10 | banh-lui.4 | Ra khỏi ngõ cụt |  |  |  |  |

## che-banh-lui

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-tay.5 | Lùi mang hàng |  |  |  | def |
| 2 | che-tay.7 | Đặt lại chỗ cũ |  |  |  |  |
| 3 | che-banh-lui.1 | Kéo thùng khỏi ngõ cụt |  |  |  |  |
| 4 | che-tay.9 | Cần cẩu |  |  |  |  |
| 5 | che-lap.7 | Đường về vòng lặp |  |  |  | for |
| 6 | che-lap.9 | Số lùi đường dài |  |  |  | for |
| 7 | che-banh-lui.2 | Lùi qua cửa |  |  |  |  |
| 8 | che-banh-lui.3 | Tới tường rồi lùi một ô |  |  |  |  |
| 9 | che-banh-lui.4 | Sửa hàm dọn thùng |  |  |  |  |
| 10 | che-xe.10 | Bãi đỗ xe |  |  |  |  |

## tay-xoay

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | tay-xoay.1 | Xoay sang trái | lệnh arm_left, lệnh arm_right | có |  |  |
| 2 | tay-xoay.2 | Đố: sai bên |  |  |  |  |
| 3 | tay-xoay.3 | Đố: khớp kẹt |  |  |  |  |
| 4 | tay-xoay.4 | Mang hàng sang bên |  |  |  |  |
| 5 | tay-xoay.5 | Nhanh hơn quay xe |  |  |  |  |
| 6 | tay-xoay.6 | Dọn lối |  | có |  | def |
| 7 | tay-xoay.7 | Đố: quên hạ tay |  |  |  |  |
| 8 | tay-xoay.8 | Khớp xoay một chiều |  |  |  |  |
| 9 | tay-xoay.9 | Quay xe, tay đi theo |  |  |  |  |
| 10 | tay-xoay.10 | Chuyền hàng |  |  |  | def |

## che-tay-xoay

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-tay-xoay.1 | Nhặt bên trái |  |  |  | def |
| 2 | che-tay-xoay.2 | Đặt sang phải |  |  |  | def |
| 3 | che-tay-xoay.3 | Mở lối |  |  |  |  |
| 4 | che-tay-xoay.4 | Nhặt phải, đặt trái |  |  |  | def |
| 5 | che-tay-xoay.5 | Đổi chỗ hai bên |  |  |  | def |
| 6 | che-tay-xoay.6 | Phân loại |  |  |  | def |
| 7 | che-tay-xoay.7 | Đường về |  |  |  |  |
| 8 | che-tay-xoay.8 | Tay chưa về giữa |  |  |  |  |
| 9 | che-tay-xoay.9 | Khớp kẹt cứng |  |  |  |  |
| 10 | che-tay-xoay.10 | Kho hai bên |  |  |  |  |

## cam-bien-ben

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-cam-bien.4 | Cửa hông | lệnh right_clear |  |  | def, while, not |
| 2 | cam-bien-ben.1 | Lối bên trái | lệnh left_clear |  |  |  |
| 3 | cam-bien-ben.2 | Trái hay phải |  |  |  |  |
| 4 | cam-bien-ben.3 | Cửa bên trái |  |  |  |  |
| 5 | cam-bien-ben.4 | Rời cửa rồi mới hỏi |  |  |  |  |
| 6 | cam-bien-ben.5 | Chế to_left_gap() |  |  |  | def, while, not |
| 7 | cam-bien-ben.6 | Khúc quanh liên tiếp |  |  |  |  |
| 8 | cam-bien-ben.7 | Sửa hàm tìm cửa |  |  |  | while, not |
| 9 | cam-bien-ben.8 | Ngõ cụt thì quay đầu |  |  |  |  |
| 10 | cam-bien-ben.9 | Mang hộp qua khúc quanh |  |  |  |  |

## me-cung

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | me-cung.1 | Bên phải của xe |  |  |  |  |
| 2 | me-cung.2 | Rẽ rồi đi |  |  |  |  |
| 3 | me-cung.3 | Không rẽ thì tiến |  |  |  |  |
| 4 | me-cung.4 | Hai phía đều bị chặn |  |  |  |  |
| 5 | me-cung.5 | Ưu tiên ở ngã ba |  |  |  |  |
| 6 | me-cung.6 | Chế một bước bám tường |  |  |  | def, if |
| 7 | me-cung.7 | Lặp những bước nhỏ |  |  |  |  |
| 8 | me-cung.8 | Đi vào rồi ra ngõ cụt |  |  |  |  |
| 9 | me-cung.9 | Sửa quy tắc ưu tiên |  |  |  | if |
| 10 | me-cung.10 | Chinh phục ba mê cung |  |  |  |  |

## hai-robot

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | hai-robot.1 | Hai lá cờ | hai robot | có |  |  |
| 2 | hai-robot.2 | Chia việc |  |  |  |  |
| 3 | hai-robot.3 | Bàn giao |  |  |  |  |
| 4 | hai-robot.4 | Chờ hàng |  |  |  |  |
| 5 | hai-robot.5 | Nhường đường |  |  |  |  |
| 6 | hai-robot.6 | Theo sau |  |  |  |  |
| 7 | hai-robot.7 | Dọn hai dãy |  |  |  |  |
| 8 | hai-robot.8 | Nhường lối |  |  |  |  |
| 9 | hai-robot.9 | Làm mốc |  |  |  |  |
| 10 | hai-robot.10 | Ca làm đôi |  |  |  |  |

## che-hai-robot

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-hai-robot.1 | Tay xoay vào đội |  |  |  |  |
| 2 | che-hai-robot.2 | Nhìn bên hông |  |  |  |  |
| 3 | che-hai-robot.3 | Giữ cửa cho bạn |  |  |  |  |
| 4 | che-hai-robot.4 | Chờ hàng bên hông |  |  |  |  |
| 5 | che-hai-robot.5 | Lùi giao hàng |  |  |  |  |
| 6 | che-hai-robot.6 | Chờ cửa mở |  |  |  |  |
| 7 | che-hai-robot.7 | Dọn chỗ cho bạn |  |  |  |  |
| 8 | che-hai-robot.8 | Gác nút cho bạn qua |  |  |  |  |
| 9 | che-hai-robot.9 | Bạn tự động |  |  |  |  |
| 10 | che-hai-robot.10 | Ca phối hợp |  |  |  |  |

## combo

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | combo.1 | Thùng nằm bên nào |  |  |  |  |
| 2 | combo.2 | Dừng cạnh thùng |  |  |  |  |
| 3 | combo.3 | Sửa hàm đổi kệ |  |  |  | if |
| 4 | combo.4 | Lùi giữ bên tay |  |  |  |  |
| 5 | combo.5 | Thùng lên nút đè |  |  |  |  |
| 6 | combo.6 | Bên nào cũng dừng |  |  |  |  |
| 7 | combo.7 | Dọn lối đi |  |  |  | if |
| 8 | combo.8 | Sửa hàm lấy hàng |  |  |  | while, not |
| 9 | combo.9 | Lùi qua cửa sau |  |  |  |  |
| 10 | combo.10 | Ba kho hai bên |  |  |  |  |

## che-combo

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | che-combo.1 | Hàng tới bên nào |  |  |  |  |
| 2 | che-combo.2 | Cửa phải, thùng bên nào |  |  |  |  |
| 3 | che-combo.3 | Hai cửa, hai nút |  |  |  | if |
| 4 | che-combo.4 | Thùng đè nút giữ cửa |  |  |  |  |
| 5 | che-combo.5 | Qua hai góc |  |  |  |  |
| 6 | che-combo.6 | Thùng mở cửa cho bạn |  |  |  |  |
| 7 | che-combo.7 | Đầu này, đầu kia |  |  |  | if |
| 8 | che-cam-bien.10 | Kho hàng |  |  |  | while, not |
| 9 | che-combo.8 | Mở cửa rồi giao |  |  |  |  |
| 10 | che-combo.9 | Ca trực kho |  |  |  | for, if |

## robot-hoan-thien

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | robot-hoan-thien.1 | Giao hàng |  |  |  |  |
| 2 | robot-hoan-thien.2 | Hàng bỏ quên |  |  |  |  |
| 3 | robot-hoan-thien.3 | Xếp ngăn kệ |  |  |  |  |
| 4 | robot-hoan-thien.4 | Đổi thùng |  |  |  |  |
| 5 | robot-hoan-thien.5 | Dọn dãy thùng |  |  |  |  |
| 6 | robot-hoan-thien.6 | Giao hàng quanh góc |  |  |  |  |
| 7 | robot-hoan-thien.7 | Mang thùng về nhà |  |  |  |  |
| 8 | robot-hoan-thien.8 | Dọn sang trái rồi về |  |  |  |  |
| 9 | cam-bien-ben.10 | Hành lang tự lái |  |  |  |  |
| 10 | robot-hoan-thien.11 | Giao ca ở kho |  |  |  | while, not |

## trum-mua-1

| số | mã | tên | mới | HD | trình diễn | ép |
|---|---|---|---|---|---|---|
| 1 | trum-mua-1.1 | Lùi tìm thùng |  |  |  |  |
| 2 | trum-mua-1.2 | Lùi về hốc đích |  |  |  |  |
| 3 | trum-mua-1.3 | Sửa hàm lùi tìm |  |  |  | while |
| 4 | trum-mua-1.4 | Hàng trao tay |  |  |  |  |
| 5 | trum-mua-1.5 | Lùi qua cửa tới cờ |  |  |  |  |
| 6 | trum-mua-1.6 | Cất vào hốc trống |  |  |  | while, not |
| 7 | trum-mua-1.7 | Đè nút sau lưng |  |  |  |  |
| 8 | trum-mua-1.8 | Lấy hàng trong nhánh |  |  |  |  |
| 9 | trum-mua-1.9 | Dọn lối hai cửa |  |  |  | if |
| 10 | trum-mua-1.10 | Ngày xuất xưởng |  |  |  | for, if |
