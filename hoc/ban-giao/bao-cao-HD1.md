# Báo cáo HD1: hướng dẫn mùa 1 theo "show don't tell" (29/10/2026, agent fable)

Nhánh `claude/hd1-huong-dan-mua-1` (worktree riêng). Không push, không merge, không đụng main.

## 1. KẾT QUẢ

### Commit
| SHA | Nội dung |
|---|---|
| 9c8990c | Máy dò lời giải lách `hoc/kiem-lach-mua-1.mjs` (bản đầu, 13 lỗ) |
| d74b75c | Gói 3 chương khoang-cach: trình diễn → ép → thả; cờ `chiChay`; hướng dẫn kc.1 / .12 / .2 / .13 / .5 và che-cam-bien.1 / .2; máy dò thêm B2 (đếm thừa) và `--loi-gia` |
| abc0dd7 | Gói 3 chương che-cam-bien + gói 7: che-cam-bien.1 / .2 / .4 lấy lại ba sân của ngân hàng, cam-bien-ben.5, cam-bien-ben.7, me-cung.6; đo lại sao; bảng `bang-hd1.md` |
| (cuối) | Nhãn "Chỉ chạy" sửa cho cả hai khung (lỗi thấy khi xem bằng mắt), báo cáo này |

### Lỗ (lời giải lách thắng ĐỦ 3 SAO ở màn đang ép) trước / sau, theo chương
| Chương | Trước | Sau | Ghi chú |
|---|---|---|---|
| vong-lap | 0 (bản đầu máy dò báo 1 giả: vong-lap.6, đã sửa cách tính) | 0 | lách A2 (bỏ for) ở vong-lap.1 / .2 / .4 chỉ được 2 sao: ép bằng sao ô, giữ nguyên |
| khoang-cach | 7 (kc.1 ×2, kc.2, kc.3, kc.8, kc.4, kc.11) | 0 | kc.1 / kc.2 thành màn trình diễn (chiChay), kc.12 ép if, kc.13 ép while (hai sân, xe mờ); kc.3 / kc.11 / kc.8 từ màn 5 là "thả tự do" (đếm cứng vẫn thắng 3 sao trên một sân: ghi thông tin) |
| che-cam-bien | 1 (ccb.2) | 0 | ccb.1 / .2 lấy lại ba sân của ngân hàng; ccb.1 lách còn 2 sao |
| cam-bien-ben | 3 (ccb.4, cbb.5, cbb.7) | 0 | ccb.4 ba sân (ngân hàng), cbb.5 hai cửa cách 2 / 3 ô, cbb.7 hai sân |
| me-cung | 1 (me-cung.6) | 0 | ba sân, mỗi sân một nhánh của follow_right, main gọi hai lượt |
| che-combo | 1 (che-cam-bien.10) | 1 CHẤP NHẬN | gói 9 recall, một sân theo quyết định 27/10; chờ user chọn (mục 3) |
| 14 chương còn lại | 0 | 0 | khái niệm mới của các gói đó là LỆNH (nút đè, lùi, tay xoay, cảm biến bên, hai robot), lách cấu trúc không áp dụng |

Tự kiểm máy dò: bản đầu báo LỖ khoang-cach.1 (A2: `move()` ×3, B: `for i in range(3): move()`) và khoang-cach.2 (B: `for i in range(4): move()`) đúng như bằng chứng của người giao. `node hoc/kiem-lach-mua-1.mjs --loi-gia` gộp khoang-cach.13 về một sân: máy dò BẮT ĐƯỢC (ĐẠT).

### Tệp đổi
- Mới: `hoc/kiem-lach-mua-1.mjs` (máy dò, tự vào `npm test` theo tên kiem-*), `hoc/ban-giao/bang-hd1.md` (sinh bởi `--bang`), `hoc/ban-giao/bao-cao-HD1.md`.
- Dữ liệu màn: `hoc/man-cam-bien-them.js` (+ khoang-cach.12 "Hỏi rồi mới bước", khoang-cach.13 "Hai hành lang"; helper nhận `cauTruc` riêng), `hoc/lo-trinh-hoc.js` (khối HD1: `sua` kc.1 / kc.2 thành chiChay, `nhieuSan()` cho ccb.1 / .2 / .4, thứ tự khoang-cach `[1, 12, 2, 13, 3, 11, 8, 5, 6, 10]`, cất kc.4 / kc.9, cam-bien-ben.5 / .7, me-cung.6), `hoc/lo-trinh-sao.js` (đo lại).
- Game: `hoc/game/man-choi.js` (cờ `chiChay`: khung chỉ đọc, nhãn "Chỉ chạy", toast riêng), `hoc/cham.js` (`chiChay` khoá main như chinhCoDinh), `hoc/game/chu.js` (hai chuỗi), `hoc/game/huong-dan-man.js` (H mới: kc.1, kc.12, kc.2, kc.13, kc.5, che-cam-bien.1, che-cam-bien.2; phiên bản kc.1 / kc.2 = 2).
- Máy kiểm: `hoc/kiem-lo-trinh.mjs` (NHIEU_SAN_KHONG_TRUM, bảng gói 3, CAT, vị trí kc.8, luật cam-bien-ben), `hoc/kiem-cam-bien-them.mjs` (MOI + HAI_SAN, thứ tự, luật đếm cứng của màn hai sân = không đủ 3 sao), `hoc/kiem-huong-dan.mjs` (PHAI_CO).
- Mã màn giữ nguyên (sao đã lưu theo mã không mất); kc.4 / kc.9 chỉ rời lộ trình (vẫn trong ngân hàng, sao cũ giữ).

### Lệnh kiểm và kết quả nguyên văn (chạy tuần tự, không `npm test`)
```
node hoc/kiem-lach-mua-1.mjs        → ĐẠT 0 lỗ ngoài danh sách chấp nhận · 1 lỗ chấp nhận · 246 phép dò trên 200 màn mùa 1.
node hoc/kiem-lach-mua-1.mjs --loi-gia → Lỗi giả (gộp khoang-cach.13 về một sân): máy dò BẮT ĐƯỢC (ĐẠT)
node hoc/kiem-lo-trinh.mjs          → ĐẠT 894 kiểm tra lộ trình xuất bản.
node hoc/kiem-cam-bien-them.mjs     → ĐẠT 55 · HỎNG 0 kiểm tra 7 màn mới gói Cảm biến khoảng cách.
node hoc/kiem-che-cam-bien.mjs      → ĐẠT 224 · HỎNG 0
node hoc/kiem-khoang-cach.mjs       → ĐẠT 79 · HỎNG 0   (ngân hàng man-khoang-cach.js không đổi)
node hoc/kiem-huong-dan.mjs         → ĐẠT 40 · HỎNG 0
node tools/do-lo-trinh.mjs --ghi-sao → PASS 834 canonical solutions; 131 revised star thresholds.
```
Xem bằng mắt (server cổng 4191, localStorage trống, trình duyệt trong app): khoang-cach.1 hiện ổ khoá nhãn "Chỉ chạy", bong bóng "Chương trình đã khoá. Bấm Chạy...", bấm Chạy → ĐÚNG CHỖ 3 sao (6 ô, 3 nhịp). khoang-cach.12: dải hai sân + bong bóng dải sân. khoang-cach.13: bong bóng "Chạy thử: đếm cứng 4 bước...". che-cam-bien.2: ba sân; bong bóng → Hàm mới → Tạo hàm → Xưởng mở → "Chạm khối while" → chèn `while front_clear():` → "Chạm vào front_clear() trên dòng while" → bảng chọn mở → "Chọn not front_clear()". Server đã tắt.

### Việc dở
- Gói 2 (vong-lap): chỉ soát (0 lỗ). vong-lap.1 "Lặp lại" chưa phải màn trình diễn thuần (mã mẫu `range(2)` chưa thắng, người chơi đổi số): xem đề xuất 3.
- Gói 3 chương 2 (che-cam-bien) chưa có màn TRÌNH DIỄN "hàm có if" (chương 10 màn đã kín): che-cam-bien.1 là màn tạo hàm có hướng dẫn từng bước ngay. Xem đề xuất 1.
- Gói 4–10: máy dò không thấy lỗ (khái niệm mới là lệnh, không phải cấu trúc); chưa dựng màn trình diễn kiểu chiChay cho lệnh mới (nút đè, lùi, tay xoay, cảm biến bên): bảng `bang-hd1.md` cột "trình diễn" chỉ có kc.1 / kc.2. Hiện các màn đầu gói đó (tay-xoay.1, che-xe.4, hai-robot.1...) đã có hướng dẫn từng bước.
- che-cam-bien.10 (gói 9) còn một lỗ chấp nhận.
- Đường cong nhịp của cam-bien-ben / me-cung không có máy kiểm riêng (xem mục 5).

## 2. CÂU HỎI CẦN LÀM RÕ (chỗ brief sai / thừa / thiếu)
1. Brief: "Phanh đường cong đã có trong `hoc/kiem-lo-trinh.mjs`". SAI: phanh đường cong nằm trong máy kiểm từng gói (`kiem-cam-bien-them.mjs` mục 4, `kiem-combo-mua-1.mjs`, `kiem-trum-mua-1.mjs`...), kiem-lo-trinh.mjs không đo 1,5× / bù. Gói 3 đã qua phanh của kiem-cam-bien-them.
2. Nguyên nhân gốc của "không thấy nhiều bản đồ để bắt buộc dùng while": ngân hàng `man-khoang-cach.js` vốn viết kc.4 / .5 / .6 / .8 / .9 với BA SÂN, nhưng lộ trình (lo-trinh-hoc.js, 26/10: "Luyện trên một tình huống đủ tiêu biểu; phần khái quát hóa dành cho trùm") gộp mọi màn không phải trùm về một sân (`motSan`). Cũng vậy với che-cam-bien.1 / .2 / .4. Tôi đã lấy lại nhiều sân CHỈ cho màn ép và màn chế hàm (danh sách NHIEU_SAN_KHONG_TRUM); quyết định 26/10 vẫn giữ cho các màn luyện khác. User cần xác nhận hướng này.
3. Brief: "Nếu CHƯA có cách khoá cả chương trình cho màn trình diễn". Đã có `chinhCoDinh` (khoá main, sửa hàm trong Xưởng). `chiChay` thêm vào là cờ mỏng: dữ liệu màn khai cả `chiChay: true, chinhCoDinh: true`; game chỉ đổi nhãn ("Chỉ chạy") và lời toast; cham.js coi chiChay như chinhCoDinh. Tên cờ đúng thống nhất với phiên mùa 2.
4. Luật lõi phát hiện khi làm: đích là CỜ thì chương trình dừng ngay lúc tới cờ, và húc tường không thua (chỉ mất nhịp). Hệ quả: màn ép mà đích là cờ cuối hành lang thì ĐẾM THỪA (`for i in range(9): move()`) vẫn 3 sao. Vì thế kc.1 / kc.12 / kc.13 dùng XE MỜ (bong-mo) làm đích; máy dò có lách B2 (đếm thừa theo sân dài nhất) để bắt lỗi này ở mọi màn.
5. Brief: `che-cam-bien.5` có H mà "không thuộc lộ trình mùa 1: kiểm xem có chết không". Không chết: màn còn trong lộ trình (mùa 2, chương bien-xich), kiem-huong-dan ĐẠT.
6. Brief đoán "màn ép" theo cauTruc / taoHam / hamCuaEmCan. Máy dò định nghĩa chặt hơn: ép = (khái niệm cấu trúc xuất hiện lần đầu trong chương đó VÀ màn ≤ 4) HOẶC thân hàm người chơi viết ở màn này (hàm phải dùng lại được) HOẶC taoHam. Từ màn 5 của chương là thả tự do (lách thắng chỉ ghi thông tin). Nếu user muốn ép cả 1–6 thì đổi `MAN_EP_CUOI`.
7. Máy dò bỏ qua 23 màn hai robot (chấm chamDoi khác dạng): ghi "hai robot: bỏ qua".

## 3. ĐỀ XUẤT cần user quyết
### 3a. Màn trình diễn "hàm có if" ở che-cam-bien (gói 3 chương 2)
| | A. Thêm màn trình diễn, cất che-cam-bien.11 | B. Giữ như hiện nay (hướng dẫn từng bước ở ccb.1) |
|---|---|---|
| Làm gì | Màn mới chiChay: main khoá gọi safe_move() (hàm của màn khoá) ba lần, bấm Chạy thấy xe dừng trước tường; ccb.11 ("Một hàm, hai đoạn đường", luyện go_wall) rời lộ trình | Không đổi dữ liệu |
| Mất bao lâu | 40 phút (màn + sao + máy kiểm THU_TU) | 0 |
| Ảnh hưởng | kiem-cam-bien-them THU_TU, đường cong chương | không |
| UI trước → sau | ccb.1 là màn tạo hàm ngay → có màn xem trước rồi mới tạo | như cũ |
| Người chơi thấy | Giống kc.1: bấm Chạy là thấy hàm có if làm gì | Vào chương là chế hàm, có bong bóng dẫn từng bước |
| Lợi | Đúng khuôn 3 bước cho cả "hàm có if" | Không mất màn luyện |
| Rủi ro | Mất một màn luyện go_wall | Trẻ chưa thấy "hàm có if" chạy trước khi tự chế |
Ưu tiên: B trước (ccb.1 đã có hướng dẫn, và if đã được trình diễn ở kc.1); A nếu user thấy ccb.1 vẫn "lủng".

### 3b. che-cam-bien.10 "Kho hàng" (gói 9, lỗ chấp nhận)
| | A. Lấy lại ba kho của ngân hàng | B. Hai kho dài ngắn khác nhau (sân mới) | C. Giữ (gói recall, thả tự do) |
|---|---|---|---|
| Làm gì | nhieuSan('che-cam-bien.10') + kiểm fetch_back không biến chạy đúng ba kho | thêm một sân thứ hai | ghi CHAP_NHAN (đã làm) |
| Mất bao lâu | 30 phút | 30 phút | 0 |
| Ảnh hưởng | nhịp tổng tăng, phanh đường cong kiem-combo-mua-1 | như A, nhẹ hơn | không |
| Người chơi thấy | ba kho | hai kho | một kho |
| Lợi / rủi ro | ép thật / có thể vỡ đường cong | ép thật, nhẹ / phải vẽ sân | không ép |
Ưu tiên: B.

### 3c. vong-lap.1 thành màn trình diễn `for` (chiChay, mã mẫu `range(6)` thắng ngay)
Làm: 15 phút; người chơi: bấm Chạy thấy lặp 6 lần thay vì tự đổi số (việc đổi số dời sang vong-lap.2 cùng với tự chèn for). Lợi: đúng khuôn như gói 1; rủi ro: vong-lap.2 nặng hơn một thao tác (hướng dẫn đã có sẵn bước đổi số). Ưu tiên: làm, nếu user duyệt khuôn.

### 3d. Áp khuôn trình diễn cho LỆNH mới ở gói 4–8 (nút đè, lùi, tay xoay, cảm biến bên, hai robot)
Hiện các màn đầu gói đó là "chạy thử rồi viết tiếp" có hướng dẫn (tay-xoay.1, hai-robot.1, che-xe.4...), không khoá. Làm chiChay cho 5 màn: ~1 giờ; lợi: nhất quán; rủi ro: mỗi gói mất một màn "làm". Ưu tiên: sau 3a–3c.

## 4. PHẦN CHO NGƯỜI KINH DOANH
Người chơi từng than rằng ở gói Cảm biến, bài tập không bắt buộc dùng điều mới vừa học: cứ đếm bước là qua được. Chúng tôi đã dựng một máy tự động thử "ăn gian" trên cả 200 màn mùa 1 và tìm ra 13 chỗ như vậy. Gói Cảm biến nay được sắp lại: màn đầu chỉ bấm Chạy để xem lệnh mới hoạt động, màn tiếp theo có hai sân khác nhau nên ai đếm bước sẽ không đủ sao, sau đó mới tự do luyện. Các màn chế hàm ở gói Cảm biến và gói Cảm biến bên cũng được đưa nhiều sân trở lại để hàm viết ẩu không qua. Mọi màn đều có hướng dẫn từng bước chỉ đúng nút phải bấm. Tiến độ và sao đã lưu của người chơi không mất. Còn một chỗ ở gói Combo chờ quyết định.

## 5. RỦI RO CÒN LẠI và cách kiểm
- Đường cong nhịp của cam-bien-ben / me-cung tăng ở màn chế hàm nhiều sân (ccb.4: 4 → 11 nhịp đầu chương; cbb.7: 6 → 10; me-cung.6: 2 → 5): hai chương này KHÔNG có phanh đường cong máy. Kiểm: thêm mục đường cong vào kiem-lo-trinh cho mọi chương mùa 1 (giống kiem-cam-bien-them mục 4) rồi xem đỏ ở đâu.
- Lách bằng `for N: if front_clear(): move()` thay while (vòng while giả): máy dò không sinh dạng này; ép hiện dựa vào sao ô (kc.13: 3 ô > 2). Kiểm: chạy tay bài đó ở các màn ép while (kc.13 2 sao: đã thử trong loiGiaiKhac).
- Màn hai robot (23 màn) không được dò lách. Kiểm: mở rộng máy dò cho `chamDoi` khi cần.
- Bản nháp cũ của người chơi ở kc.1 / kc.2 (nay khoá) bị thay bằng mã mẫu (như chinhCoDinh); sao đã có giữ nguyên. Kiểm: kiem-lo-trinh mục "bản lưu cũ" ĐẠT.
- Bong bóng bước "Chạm khối while" trong Xưởng che-cam-bien.2 đặt sát mép phải khay (đã thấy trong ảnh): chỉ là vị trí, không chặn. Kiểm bằng mắt ở khổ 360 × 640.
- Chưa chơi tay toàn bộ 10 màn khoang-cach từ đầu đến trùm trong trình duyệt (chỉ kc.1, kc.12, kc.13, ccb.2); lời giải chuẩn mọi màn đã chấm bằng máy (894 ĐẠT).
