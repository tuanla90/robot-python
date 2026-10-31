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

7. **Mùa 2 gói 1–4 (PDM2a, PDM2a2, đã xong 80 màn):** R1 xích (+ vòi, + hồng ngoại). Gói 1 chưa có cảm biến nên chương biến đổi thành "Đi xoắn ốc"
   (biến đếm độ dài đoạn, n = n + 1). Hàm của em tham-so.8 đổi tên `step` → `stair_down` (trùng hàm của màn mùa 4).
   Chương băng chuyền thành "Canh băng chở thùng": lõi thêm `man.thungThem` (thùng nặng đặt sẵn trên băng); xích không trôi, van bật tắt băng.
   Màn ẩn (mùa sau) còn gọi hàm mùa 2 cũ (fetch_back, bounce, pick_behind, deliver…) được cấp bản cũ làm hàm của màn.
   Thứ tự chương sung-hoi đổi (.9 trước .7): mã giữ nên sao đã lưu không mất.

8. **Mùa 2 gói 6–8 (PDM2b):** gói 6–7 sửa THẲNG ngân hàng (man-luc-ban / man-che-luc-ban / man-do-nhiet.js) sang xích + hồng ngoại (không qua sua() như gói 1–4), sao đo
   lại trong ngân hàng; bản hai bánh của 9 hàm của em (smart_spray, squirt_left, switch_left…) khai cứng ở lo-trinh-hoc.js cho màn ẩn. Băng chuyền không đẩy xích nên
   che-luc-ban.5 và do-nhiet.9 đổi băng thành cửa. Bộ dò do-duong-sung-hoi.mjs nay biết xích (quay hai nhịp), xích đẩy thùng, nút đè M, thùng gỗ o.
   Gói 8 MỚI "Góc kho cũ" (kho-cu / che-kho-cu, man-kho-cu.js, 20 màn, sao 210): ý chính "xe đè nút đè thì cửa trước mũi mở cho TIA NƯỚC qua"; rào: tia qua, xe không;
   thùng gỗ: chắn xe và chắn tia (thử lõi: băng chuyền KHÔNG chở vật o, brief ghi "chở được" là sai; ô đích D không dùng vì chỉ hợp thùng nặng).
   Gói Đội cũ cất khỏi mùa 2 (CAT_MUA_2, gói ẩn mùa 5, sao 125 trong mùa ẩn), gói 9 vẫn là Bệ vòi xích tới khi PDM2c dựng gói 9–10: gói 10 còn gọi hàm gói Đội
   (wait_clear, step_clear…) nên được cấp bản cũ làm hàm của màn gắn cờ `capCu` (kiem-lo-trinh (g) và kiem-trum-mua-2 không tính dòng / trùng tên của hàm capCu).
   kiem-doi-mua-2 dừng sớm (ĐẠT, ghi chú) khi gói Đội không ở mùa 2.

9. **Mùa 2 phần A + gói 9 (PDM2c, 31/10):** 9 bộ hồi quy sau PDM2b sửa đúng nguyên nhân (ngân hàng thô được cấp go_to_wall của che-hong-ngoai.1 trước luc-ban;
   kiem-khay coi distance / warm là cảm biến; kiem-goi-doi bỏ qua hàm capCu; kiem-doi-sung-hoi dùng squirt_left bản hai bánh ở màn ẩn; phim TẠM gói kho-cu 3 khung).
   Gói Đội về GÓI 9 mùa 2 (sao 240), Bệ vòi xích CẤT ra mùa ẩn (CAT_MUA_2, ngân hàng + phim giữ, 8 mục Sổ lệnh của nó bỏ; kiem-be-sung dừng sớm khi gói cất).
   Gói 9 viết lại: R1 xe cứu hỏa đầy đủ, R2 xe chở hàng mùa 1 (hai bánh + tay xoay + cảm biến khoảng cách); ý đội: cảm biến THẤY ĐỒNG ĐỘI (warm / distance của R1,
   front_clear của R2), R2 gắp thùng gỗ (chắn tia, chắn đường, không nóng). Vì hai xe khác cảm biến nên không còn "hàm của em cả đội cùng gọi"; thay bằng mỗi chương có
   màn R2 chờ bạn bằng front_clear(). Màn R1 không phun thì khay R1 không có spray (squirt_back("high") giật tới là một bước đi "không húc" nên thân cố định né được
   cảm biến). Bộ dò thân cố định: thân húc (dam-tuong) rồi vẫn tới cờ không tính là né (lõi hai robot không có đâm-là-thua). Gói 10 CHƯA dựng lại: còn 3 màn đội
   (tong-hop-2.8, .9, trum-mua-2.5), beSung, một sân, gọi hàm Bệ vòi xích qua capCu (CAP_HAM_CU giữ tạm); kiem-trum-mua-2 đỏ 1 mục (điều mới); 'mua-2' CHƯA vào XONG.

10. **Mùa 2 gói 10 (PDM2c2, 31/10, phương án B của người giao):** 20 màn viết lại, MỘT robot xe cứu hỏa đầy đủ (xích + vòi + hồng ngoại, xichDay, lucBan), không beSung:
   phun mạnh thì xe giật như mọi xe, `fence_shot()` của Góc kho cũ bù cú giật (ôn gói 8). Mọi màn 2–3 "ngày làm việc" (lửa to nhỏ / xa gần, van, thùng, trạm đổi chỗ),
   lời giải đọc cảm biến thắng 3 sao mọi ngày, mỗi màn ≥ 1 lời sai VIẾT CỨNG (`loiSai.cung`) thua ở ≥ 1 ngày. Ba màn đội cũ thành màn một robot giữ mã: tong-hop-2.8
   "Thùng qua ngã tư" (băng chở thùng cắt ngang hành lang, `step_clear()`), tong-hop-2.9 "Van sau rào" (hàng rào gói 8, `go_safe(1)` tìm trạm), trum-mua-2.5 "Hàm box_spray()"
   (thùng trên băng chắn tia: `while distance() < 2: wait()`). Hàm Bệ vòi xích bỏ hẳn (CAP_HAM_CU xoá); capCu vẫn còn cho màn ẩn. 'mua-2' vào XONG của kiem-part-mua (ĐẠT).
   **Khác mùa 1 một điểm:** nhịp sao của màn thường tính TỔNG mọi ngày (không theo ngày dài nhất như PDM1): bộ dò dayChung chứng minh với ngưỡng theo ngày dài nhất thì
   dãy cố định viết cho ngày khó nhất (phun thừa, đi thừa húc tường) vẫn 3 sao ở mọi ngày (tong-hop-2.2, .4, .6, .8, trum-mua-2.5, .8 đều có dãy như thế); tính tổng
   thì nhịp phí ở ngày dễ làm mất sao. Recall gói 10: gói 8 = hàm Góc kho cũ hay sân có rào / thùng gỗ / nút đè; gói 9 Đội = hàm gói Đội hay "chờ bằng cảm biến"
   (while distance()/warm(): wait()), ngưỡng 2 lần (như PDM1 hạ ngưỡng gói Đội mùa 1 vì gói 10 không còn đội). Bộ dò gói 9/10 (do-duong-be-sung) nay biết thùng đặt sẵn
   `man.thungThem` (trước bỏ qua: thùng trên băng không có trong mô hình nên dãy cố định "thắng" giả).


11. **Mùa 3 gói 2–4 (PDM3a, 31/10):** 60 màn dựng lại trên ROBOT PHÂN LOẠI (nhện + nam châm bụng + cảm biến từ hông), không màn nào còn thân xe.
   Gói 2 toàn màn MỚI (man-nam-cham-n.js: nam-cham.11–20, logic-nam-cham.1–10); màn xe cũ nam-cham.1 .4 .5 .7 .8 và che-nam-cham.1 .8 cất ra chương rời
   nam-cham-xe / che-nam-cham-xe (mùa ẩn, mã giữ; gói ẩn Nam châm trên omni đổi tên Nam châm trên xe, ngưỡng rap-du mùa 5 ẩn 180 → 195).
   Chương logic: and / or / elif trên CHUỖI DỮ LIỆU (mỗi chữ là chất một mẩu: s sắt, g gỗ, S, N; mẩu N nằm sẵn trên thùng bằng ô X vì cực N không nhấc được);
   hàm của em carry_down / carry_up. Nhện đâm tường KHÔNG thua, nên lời sai chứng minh bằng cách để nhánh sai làm nhện lạc hàng (thả, đi lên / xuống hàng khác)
   rồi chuyến sau hút ô trống. Gói 3, 4 viết lại THẲNG ngân hàng, mã giữ (như PDM2b gói 6–7): cảm biến từ đo theo cạnh trước cố định (mọi màn nhện xuất
   phát quay phải, đi xuống dọc cột, dãy phế liệu cách 2 ô); hàm của em pick_iron / seek_row / next_iron / col_iron(n); gói 4 đệm từ với nhện, KHÔNG hố
   (hố đi cùng nhảy gói 5), hàm detour(n) / call_out / shield_run(n). Bản xe cũ của kick (gói 2) và seek_iron, take_iron, seek_safe, face_iron, fetch_iron,
   loop_right, pull_iron (gói 3–4) khai cứng ở lo-trinh-hoc (THAN_CU_3) và cấp capCu cho che-doc-cuc (gói 7) và tong-hop-3 / trum-mua-3 (gói 10) tới khi
   PDM3b / PDM3c dựng lại. kiem-lo-trinh (d) SIẾT gói 1–4 (GOI_SIET_3: R1 chỉ nhện + nam châm bụng + cảm biến từ); kiem-lach-mua-3 bỏ qua hàm capCu
   (lách D2) và cắm lỗi giả vào màn xe ép front_pole (gói 7) vì máy dò không chèn dấu vào nhện. Phim gói 2–4 (phim-mua-3.js) CHƯA đổi: vẫn vẽ xe hai bánh.

12. **Mùa 3 gói 5–7 (PDM3b1, 31/10):** 60 màn của ba gói Nhảy, Đảo cực, Đọc cực hoàn tất trên ROBOT PHÂN LOẠI (nhện + nam châm bụng + cảm biến từ ở hông).
   - **Gói 5 Nhảy (`nhay`, `che-nhen`):** đổi màn duy nhất còn tay kẹp (`che-nhen.6` "Nhảy qua mang thùng") sang nam châm bụng hút mẩu sắt (`vatChat: ['.s..']`),
     lời giải giữ cấu trúc `jump("R")` hai chiều kèm `magnet_n()`, `magnet_off()`, `wait()`; sửa tay `lo-trinh-sao.js` (`o: 28, nhip: 14`).
   - **Gói 6 Đảo cực (`dao-cuc.1..10`, `che-dao-cuc.1..10`):** viết lại toàn bộ 20 màn trong `man-dao-cuc.js` trên nhện + nam châm bụng + cảm biến từ hông
     (`batDau.huong = 1`); màn xe cũ `nam-cham.2, .3` và `che-nam-cham.6` cất sang chương rời `nam-cham-xe` / `che-nam-cham-xe` (mùa 5 ẩn). Hàm của em mới:
     `pull_n()` (`magnet_off()`, `magnet_s()`, `wait()`), `pull_s()` (`magnet_off()`, `magnet_n()`, `wait()`), `haul_n(k)` (`pull_n()`, `for i in range(k): go_right()`, `magnet_off()`, `wait()`).
     Phối hợp chuỗi ký tự (`for c in ...`), cảm biến sắt (`front_metal()`), đệm từ (`detour(n)`), nhảy qua hố / chui gầm (`jump("R")`, `crawl("R")`).
   - **Gói 7 Đọc cực (`doc-cuc.1..10`, `che-doc-cuc.1..10`):** viết lại toàn bộ 20 màn trong `man-doc-cuc.js` trên nhện + nam châm bụng + cảm biến từ hông
     (`front_pole()` đọc chuỗi `"N"`, `"S"`, `"none"` trong 3 ô bên phải); màn xe cũ `nam-cham.6` và `che-nam-cham.2, .3, .4, .5, .7, .9, .10` cất sang
     `nam-cham-xe` / `che-nam-cham-xe` (đủ 18 màn `nam-cham.1..8` + `che-nam-cham.1..10`, ngưỡng `rap-du` mùa 5 ẩn 195 → 210). Bản xe cũ của `grip`, `reel`,
     `lane`, `sort`, `fling` thêm vào `DAY_CU` (`lo-trinh-hoc.js`) để cấp `capCu` cho màn mùa 4/5 và gói 10 mùa 3 (tới khi PDM3c dựng lại); bỏ `'che-doc-cuc'`
     khỏi `CAP_HAM_CU_3`. Hàm của em mới trên nhện: `sort_drop(p)`, `grab_pole()`, `sort_row()`, `sort_back()`.
   - **Máy kiểm:** `GOI_SIET_3` nâng từ 4 → 7 trong `kiem-lo-trinh.mjs`; sửa regex `\bfront_metal` / `\bfront_pole` (trước bị dính ký tự `0x08`) trong
     `kiem-lach-mua-3.mjs` để `--loi-gia` bắt lỗi giả lách G trên `doc-cuc.4`; gói 1–7 mùa 3 đạt 0 lỗi trong `kiem-part-mua.mjs` (mùa 3 chỉ còn 28 màn sai ở gói 8 `doi-xich` và gói 10 `tong-hop-3` chờ PDM3b2 / PDM3c).

## Câu hỏi chờ user

- (PDM3a) Chương logic-nam-cham ghép điều kiện kiểu `c == "s" or c == "S"` / `c != "g" and c != "N"` (hai vế đều là so sánh chuỗi). Ô ghép CHE_VH của
  thanh-phan.js (mùa 3) mới cho vế ghép thêm là lời gọi cảm biến: cần soát trên trình duyệt xem người chơi có bấm ra được hai vế so sánh chuỗi (và dấu !=)
  không; nếu không thì mở rộng CHE_VH (giao diện) hay đổi lời giải sang `if c == "s": … elif c == "S": …`.
- (PDM3a) Máy dò lách mùa 3 bỏ qua mọi màn nhện (không chèn dấu front_clear được): gói 2–4 nay toàn nhện nên chỉ còn kiểm "lời giải 3 sao, mã mẫu không 3 sao".
  Có muốn một bộ dò riêng cho nhện (dấu bằng front_metal / vết nhịp) không?
- (PDM3a) Phim gói 2, 3, 4 ở phim-mua-3.js vẫn vẽ xe hai bánh có nam châm mũi: cần đợt vẽ lại (nhện + nam châm bụng) sau khi PDM3b / 3c xong.
- (PDM3a) Gói 4 không dùng hố (hố là sàn mới đi cùng nhảy gói 5), và không có màn "nút tắt đệm" (nhện không thể vừa đứng trên nút vừa đứng trên mẩu sắt): ý
  "đệm giữ sắt, tắt đệm rồi mới lấy" để dành gói 9 Đội (R2 đè nút). Chấp nhận?
- (PDM2c2) Mùa 1 gói 10 (PDM1) tính nhịp màn thường theo ngày dài nhất; mùa 2 gói 10 tính tổng (lý do ở mục 10). Có muốn mùa 1 đổi theo cho nhất quán (và chạy lại
  bộ dò dayChung theo tổng ở mùa 1 — có thể lòi dãy cố định ở vài màn mùa 1)?
- (PDM2c2) Lời sai viết cứng chỉ cần thua ở ≥ 1 ngày: ở vài màn nó thua cả hai ngày (tong-hop-2.2, trum-mua-2.4…), vì ngày còn lại cũng "lệch" một ô / một ngọn.
  Có cần luật chặt hơn "lời cứng thắng ngày đầu, thua ngày sau" (dạy rõ hơn "viết cho một ngày thì sai ngày khác") không? Máy kiểm hiện chỉ đòi cung: true + thua.
- (PDM2c2) Gói 10 không còn đội nên gói 9 Đội chỉ được ôn 2 lần (tong-hop-2.8 step_clear, trum-mua-2.5 chờ bằng cảm biến). Chấp nhận như mùa 1, hay thêm một màn chờ nữa?
- (PDM2b, đã làm ở PDM2c theo phương án A) Bệ vòi xích cất ra mùa ẩn; (PDM2c2) gói 10 không còn mượn hàm của nó: CAP_HAM_CU đã xoá, ngân hàng + phim be-sung giữ.
- (PDM2c, đã quyết ở PDM2c2: phương án B) Gói 10 dựng lại một robot nhiều sân, giữ khung Dập lửa; ba màn đội cũ thành màn một robot giữ mã; hàm Bệ vòi xích bỏ.
- (PDM2c) Lõi hai robot không có cờ đâm-là-thua (cfg.damLaThua chỉ dừng khi một robot; thử ở doi-mua-2.9: húc vẫn chạy tiếp): có muốn lõi áp cho màn đội không?
  Hiện bộ dò gói Đội coi thân húc rồi vẫn tới (1 sao, chẩn đoán dam-tuong) là không né được cảm biến.
- (PDM2c) Cửa đang đổi mà có xe đứng trên thì giữ mở (cua-ket, lõi): phun đúng nhịp R2 đứng trên cửa vào là "thoát" bài chờ bạn; các màn gói 9 đã dời chỗ xuất phát R2
  để không thân cố định ngắn nào trúng nhịp đó, nhưng đây là kẽ hở chung của mọi màn van đổi cửa trên đường robot.
- (PDM2b) luc-ban.8 smart_spray() so distance() > 0 còn che-luc-ban.1 auto_spray() so > 1 (giữ ý cũ của hai chương): hai hàm gần giống nhau, có muốn gộp?
- Sổ lệnh (so-lenh.js) theo ngân hàng nên còn hiện tên hàm mùa 2 cũ (step, deliver, pick_behind, fetch_back, bounce) mà người chơi giờ không tạo; thiếu next_lane, open_at,
  stair_down. Agent đề xuất cho Sổ lệnh đọc theo lộ trình (một lượt riêng). Claude nghiêng về làm, sau khi xong mùa 2–4.
- Chương băng chuyền màn 6–9 cùng một khung (đỗ trên ô đích, tắt / mở rồi đi qua, bật lại): có thể thấy lặp.
- robot-hoan-thien.8 sau khi nhiều ngày (dọn dãy thùng bằng while) gần giống robot-hoan-thien.5: có muốn đổi ý bài .8 không?
- Màn không có cờ "đâm là thua" thì lời đếm cứng đi quá (húc tường) vẫn thắng với ít sao hơn (vd robot-hoan-thien.4: 1 sao). Có muốn bật "đâm là thua" cho cả gói 10?
  (Cờ này hiện chỉ cho màn ép khối mới theo định nghĩa của kiem-lach-mua-1; bật cho gói 10 cần sửa máy dò đó.)

## Việc kỹ thuật ghi lại
- `tools/do-lo-trinh.mjs --ghi-sao` hiện ghi lại lo-trinh-sao.js khác bản đã commit kể cả trước đợt này (đổi thứ tự, thêm list.1, bớt che-list.8 / .9): chưa ai dọn.
  Các agent đợt này sửa tay đúng mục màn mình đổi.
