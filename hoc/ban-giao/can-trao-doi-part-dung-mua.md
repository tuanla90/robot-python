# Sổ trao đổi: dựng lại mùa 1–4 theo luật part đúng mùa (31/10, user treo máy qua đêm)

Điểm Claude tự quyết trong đêm (đảo lại được), và câu hỏi chờ user. Kế hoạch: `hoc/KE-HOACH-PART-DUNG-MUA.md`.

## Tự quyết
1. **Mùa 1 giữ gói 8 Gặp R2, gói 9 Nhìn bên, nhặt bên.** Mùa 1 không có mùa trước nên "yếu tố cũ" (gói 8) và "R2 part cũ" (gói 9) không áp được.
   Đội được ở cả gói 8 và 9 của mùa 1 (che-combo.1, .6 là màn đội).
2. **Mùa 1 từ gói 7: R1 tay kẹp → tay xoay** (lo-trinh-hoc.js khối lenTayXoay): thêm arm_left / arm_right lên khay, lời giải giữ nguyên.
   Màn hai robot của Gặp R2 trước đây R1 kẹp, R2 xoay; nay cả hai tay xoay. Câu đố đội có thể dễ hơn (R1 cũng gắp ngang được) — chưa soát từng màn.
3. **Màn ít part hơn cỗ máy được phép** (vd gói 3 chưa cần tay): R1 vẫn là cỗ máy, chỉ chưa lắp hết. Máy kiểm chỉ chặn part NGOÀI mùa.
4. **Mùa 2 bỏ luật Bệ vòi xích** (cfg.beSung): xích gắn vòi phun mạnh thì giật như xe khác, nên gói 6 Lực phun giữ bài "lần đầu bị giật". Màn be-sung cất khỏi lộ trình.
5. **Mùa 3 cảm biến từ trên nhện** đo theo cạnh trước cố định của nhện (hướng xuất phát, cùng cạnh tay kẹp nhện đang dùng).

6. **Mùa 1 gói 10 (PDM1, đã xong):** 20 màn đều 3 "ngày làm việc", lời giải chung 3 sao, mỗi màn có lời đếm cứng thua. trum-mua-1.4 (trước là hai robot)
   thành màn một robot "Một mình hai trạm". Bảng recall gói 9 + 10: gói 8 Đội chỉ còn nhắc 2 lần (trước 3) vì gói 10 không còn đội; hạ ngưỡng riêng gói 8 xuống 2.
   Nhịp màn thường tính theo ngày dài nhất, trùm tính tổng mọi ngày (robot-hoan-thien.5 cũng tính tổng để for range(3) đếm cứng không được 3 sao).

## Câu hỏi chờ user
- robot-hoan-thien.8 sau khi nhiều ngày (dọn dãy thùng bằng while) gần giống robot-hoan-thien.5: có muốn đổi ý bài .8 không?
- Màn không có cờ "đâm là thua" thì lời đếm cứng đi quá (húc tường) vẫn thắng với ít sao hơn (vd robot-hoan-thien.4: 1 sao). Có muốn bật "đâm là thua" cho cả gói 10?
  (Cờ này hiện chỉ cho màn ép khối mới theo định nghĩa của kiem-lach-mua-1; bật cho gói 10 cần sửa máy dò đó.)

## Việc kỹ thuật ghi lại
- `tools/do-lo-trinh.mjs --ghi-sao` hiện ghi lại lo-trinh-sao.js khác bản đã commit kể cả trước đợt này (đổi thứ tự, thêm list.1, bớt che-list.8 / .9): chưa ai dọn.
  Các agent đợt này sửa tay đúng mục màn mình đổi.
