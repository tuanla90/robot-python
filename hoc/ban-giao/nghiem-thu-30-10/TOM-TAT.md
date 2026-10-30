# Nghiệm thu độc lập 4 mùa (30/10)

Bốn agent đọc độc lập, mỗi agent một mùa, theo lộ trình xuất bản (`hoc/lo-trinh-hoc.js`, như `choi.html`). Chỉ đọc, không sửa tệp màn. Ba câu hỏi: đường cong học tập có hợp lý không, các bài trong một gói có liên quan nhau không, mỗi gói có đạt mục tiêu không. Bản đầy đủ: `nghiem-thu-mua-1.md` đến `nghiem-thu-mua-4.md` trong thư mục này.

Máy kiểm `hoc/kiem-loi-giai.mjs` cùng ngày: 1128 màn, lời giải chuẩn của mọi màn thắng 3 sao. Vài màn công cụ đọc của agent báo thua (tay-gap.9, che-xe.5, che-xe.9, che-tay.9, che-xich.9) là báo động giả. Công cụ để trùng hàm cũ và hàm sửa cùng tên; `GoLoi.khoChoCach` không mắc lỗi này.

## Kết luận theo gói

| Mùa | Đạt | Đạt có góp ý | Chưa đạt |
|---|---|---|---|
| 1 (10 gói) | Gặp R2, Nhìn bên nhặt bên, R1 xuất xưởng | Xe hai bánh, Tay kẹp, Cảm biến khoảng cách, Nút đè (nặng nhất: chương kho-hang lạc đề), Bánh lùi, Tay xoay, Cảm biến bên | (không có) |
| 2 (10 gói) | Hồng ngoại, Bệ vòi xích | Bánh xích, Vòi phun, Băng chuyền, Đẩy thùng, Lực phun, Đo nhiệt, R2 trở lại | Xe cứu hỏa R1 (gói lửa đang dở, trùm mùa chưa có lửa) |
| 3 (10 gói) | Nhện, Cảm biến từ | Nam châm, Bãi từ, Nhảy, Đảo cực, Đọc cực, Đội xích và nhện, Nam châm bụng nhện | Tổng hợp (trùm mùa gần như bản sao màn đội, không ôn nam châm, cảm biến từ, and / or) |
| 4 (10 gói, bản sau khi gộp main) | Camera bốn hướng, Phố màu, Nhìn dưới chân, Sơn từ trên cao | Cất cánh, Chấm sơn, Trạm sạc, Nét liền, Đội chia hàng, Drone kẻ vạch R1 | (không có) |

## Vấn đề lặp lại ở nhiều mùa

1. **Trùm không đúng vai.** Có trùm dễ hơn hay trùng lời giải màn trước (hai-banh.10, che-xe.10, luc-ban.10, do-nhiet.10, che-day-thung.10, logic-nam-cham.8, drone.14; trum-mua-4 có hai màn xe cũ nặng hơn màn trùm cuối). Có trùm vọt quá xa màn 9 (tay xoay 12.10: 8 lên 34 nhịp; nhen.10 gấp đôi màn 9).
2. **Chương 2 lạc chủ đề gói.** kho-hang (mùa 1, gói 4); tham-so và che-sung-hoi (mùa 2, gói 2 và 4); che-nam-cham.3 và .9 (mùa 3); list và che-list chạy trên xe, không dính drone / máy sơn (mùa 4, gói 1 và 2).
3. **Màn một sân có cảm biến nên lách được**: che-may-son.6 lách 3 sao; tram-sac.6, .9, che-may-son.9 lách 2 sao (mùa 4).
4. **Thiếu màn trình diễn hay lời sai mẫu**: `or` ở mùa 3 gói 2; đầu gói 8 mùa 2; 16 trên 20 màn gói 8 mùa 4 chưa có lời sai.
5. **Màn lặp không thêm gì**: me-cung 14.7 đến 14.10; `if not warm()` ở 7 màn.

## Việc nên làm trước (gộp từ 4 báo cáo)

1. Mùa 2: làm xong gói lửa (trùm mùa `dap-lua`).
2. Mùa 3: làm lại trum-mua-3.10 thành bài ôn cả mùa, 3 sân.
3. Mùa 1: thay 5 đến 6 màn chương kho-hang bằng bài chế lệnh có nút đè; đổi trùm che-xe.10.
4. Mùa 4: viết lời sai cho gói 8; chuyển che-may-son.6, .9, .10 sang camera bốn hướng (cảm biến bụng chưa được dạy) và thêm sân; thay hai màn xe cũ trong trum-mua-4 bằng màn drone.
5. Lõi: kho hàm vượt trần 200 từ che-xich.5. Đã sửa 30/10: trần chỉ tính hàm tự đặt tên (xem `hoc/KE-HOACH-LOI-GIAI.md`).
