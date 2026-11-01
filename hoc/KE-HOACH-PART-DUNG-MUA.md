# Dựng lại mùa 1–4: R1 là cỗ máy của mùa (31/10/2026, user chốt)

User 31/10 sau khi chơi mùa 2–4: "các màn bên trong nên dùng đúng part của mùa … hiện tại cứ học mới là lại lôi part cũ ra tôi thấy k hợp lý lắm";
"chốt và dựng lại từ mùa 1 đến mùa 4. bạn làm lần lượt". Tự lắp part tuỳ ý để dành mùa 7 ("giảm thú vị nhưng trẻ ko bị loạn khi học").
Nhánh `claude/part-dung-mua` (worktree `.claude/worktrees/part-dung-mua`), từ main 0fed47a.

## 1. Khuôn mới mỗi mùa (thay bảng "Bố cục chuẩn mỗi mùa" của KE-HOACH-7-MUA.md ở gói 8–10)

| Gói | Nội dung | R1 | R2 |
|---|---|---|---|
| 1 | thân mới | thân mùa | không |
| 2 | tay mới | thân + tay mùa | không |
| 3 | cảm biến mới | thân + tay + cảm biến mùa (được bớt part chưa cần) | không |
| 4 | yếu tố sân mới (vật, sàn, cơ chế) | cỗ máy mùa | không |
| 5–7 | ba nâng cấp | cỗ máy mùa, part đã nâng cấp thì luôn là bản nâng cấp | không |
| 8 | **cỗ máy mùa gặp yếu tố (vật / sàn / cơ chế) của các mùa trước** | cỗ máy mùa đầy đủ | không |
| 9 | **đội: R2 của Luna lắp part mùa trước** (nên là trọn một cỗ máy mùa trước có tên) | cỗ máy mùa đầy đủ | part mùa trước |
| 10 | **chạy một mình: mỗi màn nhiều sân (2–3 "ngày làm việc"), một chương trình đúng mọi sân** | cỗ máy mùa đầy đủ | không |

Luật R1 (máy kiểm `kiem-part-mua.mjs` chặn): thân = thân mùa; tay ∈ tay mùa đã mở (sau gói nâng cấp tay thì chỉ bản nâng cấp); cảm biến ⊆ cảm biến mùa.
"Bản nâng cấp" ở đây là khay lệnh: lệnh nâng cấp đã mở thì màn sau có trên khay (màn được giấu lệnh cũ để ép lệnh mới như [[show-dont-tell]] vẫn được).
Màn ít part hơn cỗ máy (vd gói 3 chưa cần tay) được, vì R1 vẫn là cỗ máy, chỉ chưa lắp hết.
Gói combo cũ (luật hai part của mùa gắn chung) bỏ: luật ghép ra ngay lúc part tới (gói 2 / 3). Màn combo cũ không hợp thì cất khỏi lộ trình (vẫn ở ngân hàng, mã không đổi).

Gói 10 "chạy một mình" khớp truyện (KE-HOACH-PHIM-CLB.md: cỗ máy xuất xưởng ở lại làm việc bằng mật lệnh, Sola và Luna đi tiếp): màn nào cũng nhiều sân,
mỗi sân là một ngày (vật ở chỗ khác), chương trình viết cứng cho một sân không qua (bộ dò chứng minh); chương 1 "ngày thường", chương 2 hàm + trùm.

## 2. Mùa 1 Kho hàng (xe chở hàng: hai bánh → lùi · kẹp → tay xoay · khoảng cách → bên)

Gói 1–7 đã đúng. Mùa 1 không có mùa trước nên gói 8 (yếu tố cũ) và gói 9 (R2 part cũ) không áp được: **giữ gói 8 Gặp R2 và gói 9 Nhìn bên, nhặt bên** như hiện nay
(R2 cũng là xe chở hàng). Đổi:
- Gói 8–10: R1 đang gắn tay kẹp thì đổi sang tay xoay (đã nâng cấp ở gói 6); lời giải giữ được vì tay xoay giữ đủ bốn lệnh kẹp.
- Gói 7: màn còn tay kẹp (cam-bien-ben có kẹp) đổi tay xoay.
- Gói 10 (robot-hoan-thien + trum-mua-1): mọi màn nhiều sân, chương trình tổng quát.

## 3. Mùa 2 Nhà máy (xe cứu hỏa: xích → đẩy thùng · vòi phun → phun mạnh · hồng ngoại → đo nhiệt)

Lõi đã đủ (xích có vòi, hồng ngoại; xích quay hai nhịp nên hàm quay là tr_right / tr_left).
- **Bệ vòi xích bỏ:** xích gắn vòi phun mạnh thì GIẬT như xe khác (lõi: không khai cfg.beSung là giật sẵn). Nhờ vậy gói 6 giữ bài "lần đầu bị giật".
- Gói 1: bỏ kẹp và cảm biến khoảng cách khỏi R1; bốn màn hai bánh của bien-xich làm lại trên xích. Gói 1–2 chưa có cảm biến (Python mùa 2 gói 1 biến, gói 2 tham số không cần).
- Gói 2 Vòi phun: sung-hoi, tham-so làm lại trên xích + vòi.
- Gói 3 Hồng ngoại: xích (+ vòi) + hồng ngoại; bỏ kẹp.
- Gói 4 Nhà máy: **băng chuyền không đẩy được xích** (luật mùa 2 có sẵn) nên chương băng chuyền đổi ý: băng chở thùng nặng / vật, xích bám chắc đi ngang băng, van bật tắt băng; che-sung-hoi làm lại trên xích.
- Gói 5 Đẩy thùng: giữ (đã xích).
- Gói 6, 7: xích + vòi + hồng ngoại (bỏ cảm biến khoảng cách).
- Gói 8 MỚI "Kho hàng cũ trong nhà máy": xe cứu hỏa gặp yếu tố mùa 1: nút đè (xích đè nút / thùng nặng đè nút), ô đích, thùng gỗ (vật nằm đất: chắn đường, chắn tia; băng chở được), hàng rào (tia bay qua rào).
- Gói 9 Đội: R1 xe cứu hỏa đầy đủ + R2 của Luna là xe chở hàng mùa 1 (hai bánh, tay xoay, khoảng cách / bên). Màn đội hiện có (R1 xích không vòi, R2 hai bánh có vòi) làm lại.
- Gói 10: nhiều sân, xe cứu hỏa đầy đủ; màn đội trong tong-hop-2 / trum-mua-2 chuyển sang gói 9 hay làm lại một robot.

## 4. Mùa 3 Bãi tái chế (robot phân loại: nhện → nhảy · nam châm → đảo cực · cảm biến từ → đọc cực)

Lõi phải sửa (P-lõi mùa 3):
- Nhện gắn nam châm = **nam châm bụng** (có sẵn từ gói 9 cũ): ra ngay ở gói 2.
- **Cảm biến từ trên nhện** (lõi hiện báo lỗi "nhện không có hướng mặt"): đo theo **cạnh trước cố định** của nhện (cfg.batDau.huong, đúng cạnh tay kẹp nhện đang dùng),
  front_metal() / front_pole() như xe. Claude tự quyết (đơn giản nhất, không thêm lệnh mới); ghi vào sổ trao đổi để user đổi nếu muốn.
- Gói 2 chương 2 (and / or) chưa có cảm biến: điều kiện lấy từ chuỗi dữ liệu trong mã (mùa 3 gói 1 dạy chuỗi), vd duyệt "SGSN" từng chữ.
- Gói 4 đệm từ: nhện có nam châm bụng bật thì bị hút / đẩy (lõi có sẵn), đang nhảy thì miễn.
- Gói 8 MỚI: nhện gặp yếu tố mùa 1–2: băng chuyền (nhện bị đẩy), thùng nặng (chắn), van / cửa, nút đè, ô đích, thùng gỗ.
- Gói 9 Đội: R2 = xe cứu hỏa mùa 2 (hay xe chở hàng mùa 1). Gói 8 cũ "Đội xích và nhện" (R1 xích có kẹp) làm lại theo vai mới.
- Gói 10: nhiều sân.
- Gói 2, 3, 4, 6, 7 (100 màn hai bánh) làm lại trên nhện.

## 5. Mùa 4 Nông trại hoa (drone nông nghiệp: drone → đáp sạc · máy sơn / gieo hạt → bút liền · camera bốn hướng → dưới chân)

Lõi đủ: drone gắn máy sơn treo bụng (luật N3 của gói 9 cũ) ra ngay gói 2; drone + camera bốn hướng có sẵn.
- **Drone không còn mang nam châm** (part mùa 3) ở gói 1–8, 10.
- Gói 1 chương 2 (list) và gói 2, 3, 6 (70 màn hai bánh) làm lại trên drone.
- Gói 8 MỚI: drone gặp yếu tố mùa 1–3 (bay qua hàng rào, hố, băng chuyền; đệm từ không hút drone không nam châm; ô đích, thùng).
- Gói 9 Đội: R2 = robot phân loại phế liệu mùa 3 hay xe cứu hỏa mùa 2. Đội chia hàng cũ (hai xe hai bánh) làm lại.
- Gói 10: nhiều sân.

## 6. Thứ tự làm, cách làm

Lần lượt mùa 1 → 2 → 3 → 4 (user: "bạn làm lần lượt"). Phiên này lập kế hoạch và nghiệm thu, mỗi lúc một agent viết màn (/giao-viec), commit theo gói.
Mỗi màn làm lại: lời giải thắng 3 sao, ngưỡng sao đo lại, đường cong trong chương ([[duong-cong-hoc-va-recall]]), màn trình diễn trước màn ép khối mới.
Phần tự quyết khi user treo máy ghi ở `hoc/ban-giao/can-trao-doi-part-dung-mua.md`.
