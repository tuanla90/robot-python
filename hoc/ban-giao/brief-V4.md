NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút một commit; mỗi bước (mỗi nhóm hiệu ứng) một commit. CẤM làm hết rồi mới xem. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ. npm test (~10 phút) chỉ chạy MỘT lần ở cuối, ghi ra tệp. (Phiên giao việc có thể khởi động lại giữa chừng: commit sớm.)

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 1, suy luận 2 = 7)

MỤC TIÊU: xong khi ở chế độ vector (`?ve=vector`) **mọi hoạt cảnh và hiệu ứng trên sân** vẽ bằng vector cùng phong cách lab trắng với ô / vật / robot đã có (nét mượt ở pixel thiết bị, màu từ bảng màu, không còn khối pixel `fillRect` kiểu cũ), chuyển động mượt (không giật từng nấc), robot có mắt biểu cảm; robot ở các màn ngoài sân hiện đúng cỡ; chế độ pixel y nguyên; máy kiểm phủ; `npm test` xanh.

BỐI CẢNH:
- V1 (7f07c93) bộ vẽ; V2 (c9b710b) mọi ô / vật; V3 (gộp cbdbc97) mọi thân / tay / cảm biến. Đọc chú thích đầu hoc/game/ve-vector.js, ve-robot.js, san-ve.js (đoạn đầu tệp liệt kê ĐỦ hiệu ứng từng chương: hạt, chớp đỏ, dấu ? / !, sóng nam châm, tia camera / hồng ngoại / front_metal, vạch ngắm + vòng cung máy ném, bóng hơi + làn bắn nhanh + giật, bụi thùng, mảnh vỡ, khói hết pin, bóng drone, ô sơn / vệt loang, quầng nóng + gợn nhiệt, viền đặt xe + mũi tên ↻, xoay xe…), hoc/kiem-ve-vector.mjs, trang xem hoc/hinh-mau/xem-vector.html.
- Trong san-ve.js chế độ vector đang vẽ hiệu ứng qua phép phóng `sv` theo pixel sân (T = 14 mỗi ô), ~114 lệnh `fillRect` → ra khối vuông pixel phóng to. Việc gói này: ở chế độ vector, các hiệu ứng đó vẽ lại bằng hình mượt (tròn, bo, gradient nhẹ, nét đều) — vẫn đặt theo toạ độ sân như cũ nên không phải đổi luồng phát lại. Có thể gom thành tệp mới hoc/game/ve-vector-hieu-ung.js (khuyên) để san-ve.js chỉ rẽ nhánh.
- Đề xuất của V3 (làm trong gói này):
  - Tia hồng ngoại, tia camera, tia front_metal xuất phát từ ổ thật của cảm biến (`VeVector.diemO`), không từ tâm xe.
  - Vật trong kẹp vector chỉ ~18% ô và cùng màu trắng với ngón → khó thấy: phóng vật kẹp to hơn và / hoặc ngón tay tông tối hơn (nhất quán mọi tay kẹp, tay xoay).
  - Tay xoay chuyển MƯỢT giữa các nấc trái / trước / phải (góc đã liên tục trong hình; nối với nhịp phát lại).
  - Bóng drone (đang `fillRect`), dấu ?, ô sơn, bụi → vector.
- MẮT BIỂU CẢM — user yêu cầu rõ (27/10: "mắt chớp theo thời gian, khi đâm, khi vui"); san-ve.js đang tắt `coMatDong` ở vector, ghi chú "gói V4". Bắt buộc đủ:
  - **Chớp theo thời gian:** robot đứng yên hay đang chạy đều chớp mắt định kỳ, khoảng ngẫu nhiên 2,5–5 s (thỉnh thoảng chớp đôi), mỗi lần ~150 ms (mắt khép thành vạch rồi mở). Nhiều robot không chớp cùng lúc. Chạy cả khi chưa bấm Chạy.
  - **Khi đâm** (đâm tường / vật, bị chặn, hết pin rơi, thả bị chặn…: các sự kiện vết đang có dấu ! hay rung): mắt xoáy hoặc chữ X ~0,6–0,8 s kèm thân rung nhẹ, rồi về thường.
  - **Khi vui** (tới cờ / đích, xong màn, đặt đúng vật vào đích, bắn trúng nút): mắt cong "^ ^" cười ~1 s, nảy nhẹ thân; xong màn thì giữ mắt vui tới khi hộp kết quả hiện.
  - Thêm nếu rẻ: ngạc nhiên (mắt tròn to) khi dấu ? hiện; liếc theo hướng sắp đi; mắt sáng khi cảm biến đọc (đã có, giữ).
  - Màu mắt vẫn là màu đội; đúng trên mọi thân (cả drone không hướng) và mọi hướng.
  - Trang xem mục V4: hàng robot cho từng biểu cảm (thường, chớp, đâm, vui, ngạc nhiên) trên cả 5 thân; máy kiểm: mỗi biểu cảm ra hình khác nhau, sự kiện vết đâm / vui kích hoạt đúng biểu cảm.
- Chuyển động robot: đi / quay / trượt (omni) / bay (drone, độ cao ALT) dùng nội suy mượt (ease) theo nhịp; bánh / xích / con lăn / chân nhện / quạt chạy theo quãng đi; giật súng có nảy nhẹ; gáo ném vung; kẹp mở / đóng có tween. Ô động: băng chuyền chạy pha liên tục (không nhảy 5 pha), cửa trượt mượt, nút lóe, sạc thở.
- CỠ ROBOT NGOÀI SÂN (câu hỏi V3): màn Lắp robot (man-lap.js), thẻ "Bộ phận mới" (the-part.js / gioi-thieu.js), mở đầu (mo-dau.js, man-dau.js), phim (phim-goi.js, phim-mua-1.js) gọi `VeRobot.ve(…, tiLe = 2 / 3 / 4)` theo nghĩa "bội số pixel part"; ở vector tham số bị hiểu là cạnh ô / 100 nên canvas 200 px, robot bị cắt. Quyết định người giao: thêm trong ve-robot.js một cách gọi theo CỠ HIỂN THỊ (px CSS) dùng được cho cả hai chế độ (ví dụ `VeRobot.veCo(cauHinh, trangThai, pxCss)` — tên tuỳ), rồi đổi các nơi gọi ngoài sân sang nó; ở chế độ pixel kết quả phải đúng như cũ (cùng bội số). Chỉ đổi đúng chỗ gọi / tham số cỡ trong các tệp giao diện đó, không đổi CSS hay bố cục (V5) hay nội dung phim / huy hiệu (V6).
- Quyết định khác: nòng sau súng hơi lệch trái cột ăng-ten ~0,12 ô — GIỮ như V3 (không dời ăng-ten). Nhện / drone miễn quay: khi đụng tới, cho ve-robot.js đọc cờ `khongHuong` của hình vector thay vì so tên thân nếu rẻ (nói rõ).
- Tôn trọng `prefers-reduced-motion`: chớp mắt / thở / lắc giảm hoặc tắt (chuyển động có nghĩa luật như đi, bắn vẫn chạy).
- Nền: nhánh claude/tay-gap-xoay-comparison-00c53c, commit mới nhất (`git log -1 --format='%h %s'`). Tạo nhánh claude/ve-vector-hoat-canh từ HEAD đó.

CÁCH LÀM (thứ tự gợi ý, mỗi bước một commit):
  1. Cỡ robot ngoài sân (hàm cỡ mới + đổi nơi gọi) — xem màn Lắp robot, thẻ Bộ phận mới ở `?ve=vector` lẫn pixel.
  2. Hạ tầng hiệu ứng vector (tệp mới, rẽ nhánh trong san-ve.js) + hạt / bụi / khói / mảnh vỡ / chớp đỏ / dấu ? !.
  3. Tia + sóng (camera, hồng ngoại, front_metal, nam châm) từ ổ thật; quầng nóng / gợn nhiệt.
  4. Đạn / ném / sơn / drone (bóng hơi, làn bắn nhanh, vòng cung + bóng đất, vạch ngắm, ô sơn + vệt, bóng drone, thanh pin).
  5. Chuyển động mượt robot + bộ phận (tay xoay, kẹp, giật, gáo, bánh / xích / chân / quạt) và ô động (băng, cửa, nút, sạc); vật kẹp dễ thấy.
  6. Mắt biểu cảm (chớp theo thời gian, đâm, vui — đủ cả ba là điều kiện xong gói).
  7. Trang xem: mục V4 phát vòng lặp từng hiệu ứng / trạng thái mắt (nút chạy lại từng cái); máy kiểm; chú thích đầu tệp.

PHẠM VI: được tạo tệp mới trong hoc/game/, sửa hoc/game/ve-vector*.js, ve-robot.js, san-ve.js, choi.html (thêm script), bang-mau.js (chỉ THÊM vai `vec*`), các tệp gọi robot ngoài sân (man-lap.js, the-part.js, gioi-thieu.js, mo-dau.js, man-dau.js, phim-goi.js, phim-mua-1.js — CHỈ chỗ gọi cỡ), hoc/kiem-ve-vector.mjs, hoc/hinh-mau/xem-vector.html. KHÔNG sửa luật (san-hoc.js, cham.js), part.js / part-*.js, màn, lộ trình, CSS / bố cục giao diện (V5), huy hiệu (huy-hieu.js) và nội dung phim (V6). Chế độ pixel đổi một điểm ảnh → sai.

CÁCH GIAO: nhánh claude/ve-vector-hoat-canh trong worktree riêng; commit từng bước, message tiếng Việt, cuối message dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng nhánh khác.

KIỂM TRA:
  node hoc/kiem-ve-vector.mjs          ← thêm mục: mọi loại hiệu ứng / sự kiện vết ở chế độ vector vẽ qua đường vector (đếm trên ctx giả: không còn fillRect khối pixel của hiệu ứng), tia bắt đầu đúng ổ, hàm cỡ ngoài sân ra đúng px ở cả hai chế độ; `--loi-gia` có lỗi giả mới phải đỏ
  node hoc/kiem-bang-mau.mjs           ← pixel y nguyên (8528 ảnh part)
  Chế độ pixel của hiệu ứng: ghi vết lệnh canvas (ctx giả) của vài màn tiêu biểu ở bản nền và bản mới → khớp hệt (để máy kiểm làm, nêu cách)
  npm test                              ← MỘT lần cuối, ghi ra tệp; nền 81/81
  Trình duyệt: server tạm `node -e "process.env.PORT='4199';import('./server.mjs')"`; mở `choi.html?ve=vector&debug=1&man=<mã>` (vd man=omni.3) để vào thẳng màn. Xem và chạy: một màn đi đường + đâm tường, nam-cham.*, sung-hoi.* + luc-ban.*, may-nem.*, may-son.* / mau.*, drone.* (pin, camera-bay), tay-xoay.*, hong-ngoai.* (mùa 2 — nếu không vào được bằng man= thì xem trang xem), một màn đội, Lắp robot, thẻ Bộ phận mới; so vài màn với chế độ pixel. Ghi màn đã xem. (Ô Trình duyệt bị ẩn thì hoạt cảnh dừng: chạy từng nhịp.)
  Shell là Git Bash trên Windows; `cat > file` không có stdin sẽ treo — ghi tệp bằng công cụ Write.

BÁO CÁO CUỐI — đủ 5 mục:
  1. KẾT QUẢ: nhánh + SHA, file đổi, lệnh kiểm + kết quả nguyên văn, bảng hiệu ứng: sự kiện / hiệu ứng · cách vẽ vector · tệp; màn đã xem.
  2. CÂU HỎI CẦN LÀM RÕ.
  3. ĐỀ XUẤT (cho V5 giao diện, V6 huy hiệu + phim).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE: 3–5 câu.
  5. RỦI RO CÒN LẠI.


BỔ SUNG (user 27/10, gửi qua SendMessage lúc chạy): 1. cờ F phấp phới nhẹ (lệch pha, phất mạnh khi tới); 2. robot cảm xúc hơn, nhất là khi tương tác nhau ở màn nhiều robot (liếc nhau, giật mình, chờ sốt ruột, đưa/nhận vật cười, va nhau xoáy, cả đội nảy vui, thắng/thua) — chỉ đọc vết; 3. sàn thường hai tông trắng-xám nhẹ đan xen kiểu bàn cờ (vai vec* mới, ve-vector-o.js, cả thuSan).

GÓP Ý USER 28/10 00:1x (gửi SendMessage): mắt biểu cảm nét dày + to hơn, đọc được ở ô 24 px (nhất là mắt vui); camera KHÔNG ở mắt nữa → trụ camera ở đuôi, ống kính nhìn về trước, tia từ ống kính; mắt luôn là mắt cảm xúc.
GÓP Ý USER 28/10 (gửi SendMessage): cảm biến phải dính vỏ theo từng thân (không lơ lửng), máy kiểm hộp bao đế giao vỏ, lỗi giả dời ổ hông.
