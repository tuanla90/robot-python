# Báo cáo gói T: màn trình diễn + ép dùng khối mới cho MÙA 2 (29/10/2026, agent fable)

Nhánh `claude/t-trinh-dien-mua-2` (worktree riêng, tách từ main d61278c). Không push, không merge, không đụng nhánh khác. Server tạm cổng 4206 đã tắt.

## 1. KẾT QUẢ

### Commit (cũ → mới)
| SHA | Nội dung |
|---|---|
| d5780d8 | Máy dò lách mùa 2 `hoc/kiem-lach-mua-2.mjs` + mô-đun chung `hoc/lach-chung.mjs`; bảng `bang-t-mua-2.md` bản đầu (8 lỗ bien-xich, 0 màn trình diễn) |
| a242050 | Gói 1: xich.1 trình diễn, xich.2 ép đổi số nhịp quay; che-cam-bien.6 trình diễn biến đếm, che-cam-bien.5 / .9 / robot-hoan-thien.9 ba sân + cờ đâm-là-thua; H; kiem-lo-trinh (g) miễn màn chiChay |
| 56d244a | Gói 2: sung-hoi.1 trình diễn (H bản 2); tham-so.1 trình diễn, tham-so.2 ép đổi số 2 thành n |
| 87d9bb9 | Gói 3: hong-ngoai.1 trình diễn; H hong-ngoai.2, che-hong-ngoai.1; kiem-hong-ngoai miễn cho màn trình diễn; --loi-gia nới ngưỡng sao |
| 7a4d3c5 | Gói 4, 5, 6: bang-chuyen.1, day-thung.1, luc-ban.1 trình diễn; H 8 màn; kiem-day-thung, kiem-luc-ban |
| ffba506 | Gói 7, 9 + H gói 8: do-nhiet.1, be-sung.1 trình diễn; H do-nhiet.2, che-do-nhiet.1, be-sung.2, che-be-sung.1, doi-mua-2.1, che-doi-mua-2.1; kiem-do-nhiet, kiem-be-sung |
| (cuối) | Báo cáo này + bảng sinh lại |

### Bảng chương · màn trình diễn · màn ép · cách ép · hướng dẫn (chi tiết từng màn: `hoc/ban-giao/bang-t-mua-2.md`, sinh bởi `node hoc/kiem-lach-mua-2.mjs --bang`)
| Gói | Chương | Cái mới | Màn trình diễn (chiChay, mới) | Màn ép kế | Cách ép | H từng bước (mới) |
|---|---|---|---|---|---|---|
| 1 | xich | thân xích quay hai nhịp | xich.1 "Xích quay hai nhịp" (sân mới 3 ô, lời giải đổi) | xich.2 | mã mẫu quay MỘT nhịp `range(1)` phải đổi thành 2; turn_right() của em rút khỏi khay (hamCuaEmCan) | xich.1, xich.2 |
| 1 | bien-xich | biến đếm (màn 5) | che-cam-bien.6 (count_return đúng sẵn, hàm của màn khoá `khoaHamMan`) | che-cam-bien.5 (bounce), .9 (fetch_back), robot-hoan-thien.9 | lấy lại BA SÂN của ngân hàng (nhịp theo sân dài nhất) + cờ đâm-là-thua `DAM_LA_THUA_2` | che-cam-bien.6 (ccb.5 đã có) |
| 2 | sung-hoi | súng hơi giật lùi | sung-hoi.1 | sung-hoi.2 (shoot_back) | mã mẫu một phát, phải thêm (H đã có) | sung-hoi.1 (bản 2) |
| 2 | tham-so | hàm có tham số | tham-so.1 (main + forward(n) của màn khoá) | tham-so.2 | thân forward(n) lặp cứng `range(2)`: phải đổi số thành biến n (lách D2 chỉ 2 sao; tràn khung nếu duỗi ở main) | tham-so.1, tham-so.2 |
| 3 | hong-ngoai | distance() | hong-ngoai.1 | hong-ngoai.2 | mã mẫu lặp cứng 3, phải đặt distance() vào range; bộ dò lời né của kiem-hong-ngoai chứng minh đếm cứng không đủ sao (E / C: 2 sao) | hong-ngoai.1, hong-ngoai.2 |
| 3 | che-hong-ngoai | hàm có distance() | (chế hàm ngay, như HD1 3a-B) | che-hong-ngoai.1 (taoHam) | main khoá, tạo go_to_wall() | che-hong-ngoai.1 |
| 4 | bang-chuyen | băng chuyền | bang-chuyen.1 (bốn wait trôi hai ô rồi ba move; lời giải đổi) | bang-chuyen.2 | ngược băng: đếm theo ô thì thiếu (lời sai có sẵn) | bang-chuyen.1, bang-chuyen.2 |
| 4 | che-sung-hoi | hàm giật | (chế hàm ngay) | che-sung-hoi.1 (taoHam jet_back) | main khoá | (đã có) |
| 5 | day-thung | xích đẩy thùng | day-thung.1 | day-thung.2 | mã mẫu lặp 3, thùng nửa đường: đổi số | day-thung.1, day-thung.2 |
| 5 | che-day-thung | push(n) | (chế hàm ngay) | che-day-thung.1 (taoHam) | main khoá, ba thùng xa gần khác nhau | che-day-thung.1 |
| 6 | luc-ban | chọn lực fast / charge | luc-ban.1 (bắn nhanh, thùng nằm yên) | luc-ban.2 | mã mẫu bắn nhanh không tới nút cách 3 ô: đổi "fast" thành "charge" (lách F đảo lực thua) | luc-ban.1, luc-ban.2 |
| 6 | che-luc-ban | aim_fire() | (chế hàm ngay) | che-luc-ban.1 (taoHam) | main khoá | che-luc-ban.1 |
| 7 | do-nhiet | warm() | do-nhiet.1 | do-nhiet.2 | mã mẫu quay phải một lần: phải `while not warm()` (B / A2 chỉ 2 sao) | do-nhiet.1, do-nhiet.2 |
| 7 | che-do-nhiet | switch_on() | (chế hàm ngay) | che-do-nhiet.1 (taoHam) | main khoá | che-do-nhiet.1 |
| 8 | doi-mua-2 / che-doi-mua-2 | đội, warm() thấy bạn | CHỜ HD3 (ganCoDinh chưa khoá maMau.doi) | doi-mua-2.1 (viết thân clear_shot của màn), che-doi-mua-2.1 (taoHam wait_clear) | hai chương trình khoá sẵn (gói 8) | doi-mua-2.1, che-doi-mua-2.1 |
| 9 | be-sung | bệ súng xích không giật | be-sung.1 | be-sung.2 | mã mẫu của Sola có back() bù giật thừa: phải xoá dòng | be-sung.1, be-sung.2 |
| 9 | che-be-sung | blast_left() | (chế hàm ngay) | che-be-sung.1 (taoHam) | main khoá | che-be-sung.1 |
| 10 | tong-hop-2 / trum-mua-2 | không có cái mới (recall) | không cần | | | |

Màn cất / dời: KHÔNG màn nào (mọi chương giữ 10 màn, thứ tự giữ; màn trình diễn là màn 1 hiện có sửa lại, `ma` giữ). Tổng: 10 màn trình diễn mới (xich.1, che-cam-bien.6, sung-hoi.1, tham-so.1, hong-ngoai.1, bang-chuyen.1, day-thung.1, luc-ban.1, do-nhiet.1, be-sung.1); 23 mục H mới / sửa.

### Bảng lỗ trước / sau (máy dò `node hoc/kiem-lach-mua-2.mjs`; LỖ = lách thắng 3 sao ở khái niệm đang ép, hoặc thắng dù mấy sao ở màn có cờ đâm-là-thua)
| Chương | Trước | Sau | Ghi chú |
|---|---|---|---|
| bien-xich | 8 (che-cam-bien.6 B / C, .5 B / C, .9 B / C, robot-hoan-thien.9 A2 / C) | 0 | ccb.6 thành trình diễn; ccb.5 / .9 / rh.9 ba sân (nhịp theo sân dài nhất: sao nhịp 8 → 10, 12 → 14, 9 → 11) + cờ đâm-là-thua (ccb.9 B2 đếm thừa vẫn 3 sao nhờ húc tường hai đầu hành lang, như HD2) |
| luc-ban | 1 giả (luc-ban.2 A1 `shoot()` không lực) | 0 | máy dò sửa: khối shoot ở màn lucBan luôn mang lực nên A1 giữ `shoot("charge")` (lách không có thật) |
| do-nhiet, che-do-nhiet | 4 giả (F đảo lực trong thân hàm) | 0 | định nghĩa sửa: `luc` chỉ ép ở chương luc-ban (lực trong thân hàm không phải bài học chương khác) |
| 17 chương còn lại | 0 | 0 | tham-so (D2 2 sao), hong-ngoai (E / C 2 sao), do-nhiet (B 2 sao): ép bằng sao, không lỗ |

### Định nghĩa lách C / D / E (và D2, F) của máy dò mùa 2 (đầu tệp kiem-lach-mua-2.mjs)
- C hằng thay biến: trên bản B (while / if đã dỡ theo vết), bỏ mọi dòng gán (`n = 0`, `n = n + 1`, `d = distance()`, `an_toan = 2`), mỗi chỗ dùng biến thay bằng một hằng; thử mọi tổ hợp 0..8 cho tối đa hai biến. Bỏ qua: bien (+ distance / warm nếu gán là chỗ đọc duy nhất).
- D duỗi hàm có tham số: lời gọi `f(3)` ở main thành thân f chép ra với tham số thay bằng đối số. D2 hằng thay tham số: hàm có tham số người chơi viết thành hàm KHÔNG tham số, thân thay tham số bằng một đối số đã dùng (thử từng đối số), lời gọi bỏ đối số. Bỏ qua: tham-so.
- E hằng thay cảm biến số: trên bản B, mọi `distance()` / `warm()` còn lại thay bằng một giá trị đã đo ở sân 1 (thử từng giá trị đã gặp). Bỏ qua: distance / warm.
- F đảo lực: mọi "fast" ↔ "charge". Bỏ qua: luc.
- Bỏ qua của mỗi lách = khái niệm có trong lời giải chuẩn mà bản lách không còn (F: luc). "Đang ép" = chương ĐẦU TIÊN của mùa 2 dùng khái niệm (bien=bien-xich.5, tham-so=tham-so.1, distance=hong-ngoai.1, luc=luc-ban.1, warm=do-nhiet.1), trong BỐN màn kể từ màn đầu tiên dùng nó; thêm: thân hàm người chơi viết (trừ luc), màn taoHam. Khái niệm mùa 1 (for / if / while / not) không ép lại ngoài hai luật đó.
- `--loi-gia`: nới ngưỡng sao (+9 ô, +9 nhịp) của màn ép distance / warm đầu tiên (hong-ngoai.2): lách E phải thành LỖ. (Đổi so với brief "gộp sân": mùa 2 ép bằng ngưỡng sao, không có màn ép nhiều sân cho cảm biến số.)

### Lệnh kiểm và dòng tổng nguyên văn (chạy TUẦN TỰ từng lệnh, không `npm test`; tại worktree sau commit ffba506)
```
hoc/kiem-lach-mua-2.mjs → ĐẠT 0 lỗ ngoài danh sách chấp nhận · 0 lỗ chấp nhận · 282 phép dò trên 200 màn mùa 2.
hoc/kiem-lach-mua-2.mjs --loi-gia → Lỗi giả (nới ngưỡng sao của hong-ngoai.2 thêm 9 ô / 9 nhịp): máy dò BẮT ĐƯỢC (ĐẠT)
hoc/kiem-lach-mua-1.mjs → ĐẠT 0 lỗ ngoài danh sách chấp nhận · 0 lỗ chấp nhận · 241 phép dò trên 200 màn mùa 1.
hoc/kiem-lach-mua-1.mjs --loi-gia → Lỗi giả (gộp khoang-cach.13 về một sân): máy dò BẮT ĐƯỢC (ĐẠT)
hoc/kiem-lo-trinh.mjs → ĐẠT 905 kiểm tra lộ trình xuất bản.
hoc/kiem-lo-trinh.mjs --loi-gia-mua-2 → Lỗi giả mùa 2: HỎNG 8 / 8 mục (a)–(h).
tools/do-lo-trinh.mjs → PASS 835 canonical solutions; 145 revised star thresholds.
hoc/kiem-huong-dan.mjs → ĐẠT 40 · HỎNG 0
hoc/kiem-loi-mua-2.mjs → ĐẠT 93 kiểm
hoc/kiem-bien-xich.mjs → ĐẠT 26 · HỎNG 0 kiểm
hoc/kiem-hong-ngoai.mjs → ĐẠT 108 · HỎNG 0 kiểm tra 20 màn gói Hồng ngoại.
hoc/kiem-day-thung.mjs → ĐẠT 108 · HỎNG 0 kiểm tra 20 màn gói Đẩy thùng.
hoc/kiem-luc-ban.mjs → ĐẠT 104 · HỎNG 0
hoc/kiem-che-luc-ban.mjs → ĐẠT 57 · HỎNG 0 kiểm tra 10 màn chương Hàm lực bắn.
hoc/kiem-do-nhiet.mjs → ĐẠT 107 · HỎNG 0 kiểm tra 20 màn gói Đo nhiệt.
hoc/kiem-be-sung.mjs → ĐẠT 107 · HỎNG 0 kiểm tra 20 màn gói Bệ súng xích.
hoc/kiem-tham-so.mjs → ĐẠT 113 · HỎNG 0
hoc/kiem-sung-hoi.mjs → ĐẠT 187 · HỎNG 0
hoc/kiem-xich.mjs → ĐẠT 137 · HỎNG 0
hoc/kiem-bang-chuyen.mjs → ĐẠT 87 · HỎNG 0
hoc/kiem-che-xe.mjs → ĐẠT 271 · HỎNG 0
hoc/kiem-hoc.mjs → ĐẠT 6715 · HỎNG 0
hoc/kiem-khay.mjs → ĐẠT 184 · HỎNG 0
hoc/kiem-doi-mua-2.mjs → ĐẠT 107 · HỎNG 0 kiểm tra 20 màn gói Đội.
hoc/kiem-trum-mua-2.mjs → ĐẠT 107 · HỎNG 0 kiểm tra 20 màn gói Nhà máy chạy lại.
hoc/kiem-nut-bat-san.mjs → ĐẠT 30 kiểm
hoc/kiem-che-cam-bien.mjs → ĐẠT 224 · HỎNG 0
hoc/kiem-robot-hoan-thien.mjs → ĐẠT 181 · HỎNG 0
hoc/kiem-goi.mjs → ĐẠT 56 · HỎNG 0
```
Máy kiểm đỏ sẵn ở main: không gặp (mọi máy chạy đều xanh trước và sau; đỏ tạm trong lúc làm đều do thay đổi của gói T và đã sửa).

Sao đo lại (`tools/do-lo-trinh.mjs --ghi-sao` ghi đè cả tệp và đảo thứ tự khoá mùa 3, nên khôi phục tệp rồi gộp đúng dòng): `hoc/lo-trinh-sao.js` chỉ thêm / đổi xich.1 (o 8, nhịp 5), che-cam-bien.5 (nhịp 8 → 10), che-cam-bien.9 (12 → 14), robot-hoan-thien.9 (9 → 11), sung-hoi.1 (3 / 3), tham-so.1 (14 / 11), bang-chuyen.1 (7 / 7). Ngưỡng sao GÓI mùa 2 (0, 30, …, 270) không đổi.

Xem bằng mắt (server python cổng 4206, trình duyệt trong app, SW + caches + localStorage đã xoá, ĐÃ TẮT server): xich.1, che-cam-bien.6, tham-so.1, hong-ngoai.1, bang-chuyen.1, day-thung.1, luc-ban.1, do-nhiet.1, be-sung.1: nhãn "Chỉ chạy", bong bóng "Chương trình đã khoá. Bấm Chạy: …", bấm Chạy → thắng 3 sao (xich.1: "TỚI CỜ! Gọn 8 ô, Nhanh 5 nhịp, Đủ 3 sao"). xich.2: mã mẫu chạy ra dam-tuong + xich-quay-do + chua-toi-co, bong bóng "Chạy thử: xích chỉ quay một nhịp…", số 1 trong range được làm sáng. che-cam-bien.5: dải ba sân, nhãn "Đâm tường là thua", main "Cố định" gọi bounce(). Khổ 360 × 640: xich.2 và che-cam-bien.5 không tràn (scrollWidth = 360).

### Màn đội chờ HD3
doi-mua-2.1 / che-doi-mua-2.1 chỉ có màn ép (sẵn có: hai chương trình khoá, người chơi viết thân hàm) + H mới. Màn TRÌNH DIỄN đội không làm vì cham.js `ganCoDinh` chỉ khoá `maMau.chinh` (HD3 đang mở rộng cho `maMau.doi` ở nhánh claude/hd3-trinh-dien-goi-5-8; main lúc tách chưa có). Khi HD3 gộp: khai `chiChay: true` + `maMau.doi` = lời giải ở doi-mua-2.1 theo cách HD3 làm; máy dò mùa 2 đã bỏ qua màn đội (ghi "hai robot: bỏ qua").

### Tệp đổi
- Mới: `hoc/lach-chung.mjs`, `hoc/kiem-lach-mua-2.mjs`, `hoc/ban-giao/bang-t-mua-2.md`, báo cáo này.
- `hoc/lo-trinh-hoc.js`: khối "GÓI T MÙA 2" (đặt SAU `deLuyen` vì deLuyen ghi đề một sân cho che-cam-bien.5 / .9, TRƯỚC gán ngưỡng sao); hàm `trinhDien(ma, …)` dùng get() cho màn mới mùa 2 (giữ lời sai / lời giải khác cho máy kiểm chương); `DAM_LA_THUA_2` nối vào `M.manDamLaThua`. Không sửa khối mùa 1 / mùa 3, không đổi `ma`.
- `hoc/lo-trinh-sao.js`: 7 dòng màn (trên).
- `hoc/game/huong-dan-man.js`: khối "GÓI T MÙA 2" (hàm `trinhDien(chuChay, dong, chuDong)`, 22 H mới) + H sung-hoi.1 viết lại (HuongDanManPhienBan 'sung-hoi.1': 2, thêm một dòng).
- Máy kiểm (sửa tối thiểu, có chú thích "gói T"): `kiem-lo-trinh.mjs` ((g) màn chiChay miễn và không làm mốc; NHIEU_SAN_KHONG_TRUM.push ba màn bien-xich), `kiem-hong-ngoai.mjs`, `kiem-day-thung.mjs`, `kiem-do-nhiet.mjs`, `kiem-be-sung.mjs` (màn chiChay: mã mẫu khoá phải 3 sao thay vì "mã mẫu thua"; lời giải khác / lời sai không chấm (main khoá nên cũng chạy mã mẫu); bộ dò lời cố định bỏ qua (be-sung: vẫn kiểm BFS không bệ súng không kịp); đường cong chương miễn và không làm mốc), `kiem-luc-ban.mjs` (lời giải khác / lời sai / ca "màn 1" chấm trên bản không khoá).
- Không đụng: cham.js, san-hoc.js, man-choi.js, chu.js, tệp màn gốc, kiem-lach-mua-1.mjs (giữ bản riêng; đổi sang import lach-chung.mjs sau khi HD3 gộp).

## 2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai)
1. Brief liệt kê "thân xích (đi ngang left_move / right_move…)": thật ra xích dùng ĐÚNG bộ lệnh của xe hai bánh; cái mới của part là quay bằng MỘT bên xích HAI nhịp liền (kiem-xich.mjs). Màn trình diễn xich.1 làm đúng việc đó, nên sân / tên màn đổi ("Đường thẳng" → "Xích quay hai nhịp"); ngân hàng man-xich.js giữ bản cũ.
2. Chương "Biến cho xích" (bien-xich): 4 màn biến (che-cam-bien.6 / .5 / .9, robot-hoan-thien.9) chạy trên XE HAI BÁNH có cảm biến khoảng cách, không phải xe xích; biến đếm xuất hiện ở màn 5 chứ không phải màn 1 (bốn màn đầu là hàm xích spin / sidestep / fixed_turn / pick_behind). Gói T giữ cấu trúc đó (brief cấm đổi thứ tự / `ma`); nếu user muốn chương đúng tên thì là việc khác.
3. Brief: "máy dò --loi-gia gộp sân". Mùa 2 không có màn ép cảm biến số nhiều sân (ép bằng ngưỡng sao + bộ dò lời né của máy kiểm chương), nên --loi-gia đổi thành NỚI NGƯỠNG SAO của màn ép distance / warm đầu tiên; bắt được.
4. Luật "đang ép" của mùa 2 khác HD1 ("màn ≤ 4 của chương"): tính BỐN màn kể từ màn đầu tiên dùng khái niệm (vì biến đếm bắt đầu ở màn 5 của bien-xich). Hệ quả: robot-hoan-thien.9 (màn 8) thành màn ép → lấy ba sân + cờ. Nếu user muốn 3 màn thì đổi `SO_MAN_EP`.
5. Đường cong (g) với màn trình diễn: HD2 (kiem-nut-de) tính dòng = số dòng mã mẫu người chơi đọc; tôi chọn MIỄN và không làm mốc (như trùm), vì màn chỉ bấm Chạy không có việc làm, và che-cam-bien.6 (1 + 6 dòng hàm của màn) sau che-xich.6 (3 dòng) sẽ đỏ nếu tính dòng đọc. Áp cùng luật ở máy kiểm chương hong-ngoai / day-thung / do-nhiet / be-sung.
6. PHÁT HIỆN khi xem bằng mắt (ngoài phạm vi, không sửa): ở hong-ngoai.2, chạm số 3 trong `range(3)` thì bảng chọn chỉ có 1–9, KHÔNG có `distance()` hay biến `d`; khay không thấy khối `d = distance()` ở thẻ đang mở. Lời giải chuẩn `range(distance())` có thể KHÔNG ghép được bằng khối (P1 đã ghi "khay chưa cho chạm đổi số trong distance() > 2"; mùa 2 "xong" được kiểm bằng máy chấm 200 / 200, không phải chơi bằng khối). Tương tự `forward(distance() + n)` (che-day-thung.1), `range(d)` (hong-ngoai.1 nay khoá nên không sao). Cần user / phiên khay xác nhận, vì nếu đúng thì các màn ép distance của gói 3 / 5 chưa chơi được bằng tay dù máy dò xanh.
7. Ở che-cam-bien.6 (bienDem), bong bóng chung của thanh-phan "Bấm ▶ để sang thẻ Logic" hiện trước bong bóng của H (chỉ nút Chạy); H chỉ "dòng 1 count_return()" thay vì thân hàm (hàm của màn khoá, bút chì thành ổ khoá).
8. Lỗi quy trình: `tools/do-lo-trinh.mjs --ghi-sao` đảo thứ tự khoá mùa 3 trong lo-trinh-sao.js (như P0 mùa 3 gặp); tôi gộp đúng dòng bằng script tạm ở scratchpad, không sửa tool.

## 3. ĐỀ XUẤT cần user quyết
### 3a. Màn ép distance có ghép được bằng khối không (câu hỏi 6)
| | A. Khay thêm `distance()` / biến `d` vào bảng chọn số | B. Đổi lời giải các màn ép sang dạng có khối (`d = distance()` + `range(d)`) nếu picker có `d` | C. Giữ, chỉ máy chấm |
|---|---|---|---|
| Làm gì | thanh-phan.js `bienTam`: slot 'so' thêm `distance()` khi hamGoc có distance, thêm biến gán từ cảm biến | sửa hong-ngoai.2, day-thung.6, .10, che-day-thung.1 … (nhiều màn) | không |
| Mất bao lâu | 30 phút + kiem-khay | 1–2 giờ, đo lại sao | 0 |
| Người chơi thấy | chạm số, chọn distance() | thêm dòng gán | kẹt ở màn ép |
| Rủi ro | đụng khay dùng chung (phiên khác) | vỡ đường cong dòng | gói 3 / 5 không chơi được |
Nghiêng về A (một chỗ, mở cho cả mùa), sau khi user xác nhận hiện tượng bằng tay.

### 3b. Màn trình diễn đội (gói 8): chờ HD3 gộp rồi khai `chiChay` cho doi-mua-2.1 theo cách HD3 (15 phút); hay giữ (H đã dẫn viết clear_shot). Nghiêng về làm sau khi HD3 gộp.

### 3c. kiem-lach-mua-1.mjs chuyển sang import `lach-chung.mjs` (bỏ bản chép) sau khi HD3 gộp: 20 phút, kết quả mùa 1 phải y nguyên (241 phép dò). Nghiêng về làm.

## 4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Mùa 2 giờ cũng theo cách "cho xem trước rồi mới bắt làm" như mùa 1. Ở mỗi gói, màn đầu tiên chỉ có một nút Chạy: trẻ bấm là thấy ngay bánh xích quay, súng hơi giật, mắt hồng ngoại đo, băng chuyền đẩy, thùng nặng trượt, lực bắn khác nhau, nút nóng, bệ súng không giật. Màn thứ hai bắt trẻ tự làm đúng điều vừa thấy, với bong bóng chỉ đúng nút phải bấm; chúng tôi giấu bớt lệnh cũ hoặc thêm sân thứ hai, thứ ba để cách "đếm bước" không qua được, và ở ba màn dạy biến đếm thì húc tường là thua. Một máy tự động thử "ăn gian" trên cả 200 màn mùa 2 tìm ra 8 chỗ, nay còn 0. Tiến độ và sao đã lưu không mất; giá các gói không đổi. Còn chờ: màn xem trước cho gói Đội (cần máy chấm đội của phiên khác), và cần kiểm lại bằng tay xem ở gói Hồng ngoại trẻ có ghép được lệnh đo khoảng cách vào vòng lặp hay không.

## 5. RỦI RO CÒN LẠI và cách kiểm
- Câu hỏi 6: nếu picker thật sự không cho `distance()`, các màn ép distance (hong-ngoai.2, day-thung.6, che-day-thung.1…) không chơi được bằng khối dù máy dò xanh. Kiểm: chơi tay hong-ngoai.2 trong trình duyệt, chạm số trong range.
- Chỉ chơi tay 9 màn trình diễn + xich.2 + che-cam-bien.5 (xem); các màn ép khác (tham-so.2 bút chì mở Xưởng + chọn biến n, luc-ban.2 đổi chữ lực, be-sung.2 xoá dòng, do-nhiet.2) chưa bấm thử từng bước H: đích 'so:1' cho chữ "fast" và '[data-sua="forward"]' chưa thấy chạy thật. Kiểm: chơi tay 4 màn đó ở 360 px.
- Gộp với HD3: cùng sửa lo-trinh-hoc.js (HD3 khối mùa 1, gói T khối cuối tệp), huong-dan-man.js (HD3 phần mùa 1, gói T khối cuối + một dòng HuongDanManPhienBan), kiem-lo-trinh.mjs (một dòng push + hai dòng (g)), lo-trinh-sao.js (dòng khác nhau). Chỉ cộng dòng, nhưng dòng `HuongDanManPhienBan` và `NHIEU_SAN_KHONG_TRUM` có thể đụng. Kiểm: sau gộp chạy kiem-huong-dan, kiem-lo-trinh, hai máy dò lách.
- Cờ đâm-là-thua ở ba màn bien-xich đổi luật lõi cho màn cũ (người chơi đã có sao giữ nguyên); lời sai của ba màn này (từ ngân hàng, kiem-che-cam-bien đọc ngân hàng) chưa chấm lại dưới cờ trên lộ trình. Kiểm: thêm ca ở kiem-lo-trinh nếu cần.
- Máy dò mùa 2 bỏ qua 23 màn đội; C chỉ thử hằng 0..8 và tối đa hai biến; E chỉ thử giá trị đã đo ở sân 1.
- Thư viện khay (bienTam) không nằm trong phạm vi gói T: không sửa.
