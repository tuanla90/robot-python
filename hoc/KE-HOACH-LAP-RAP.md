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
