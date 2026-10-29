# Báo cáo P0 · Khung mùa 3 (29/10, opus, nhánh claude/khung-mua-3)

Nhánh `claude/khung-mua-3` tách từ main 142c61d. Không push, không merge.

## 1. KẾT QUẢ

Commit (theo thứ tự):
- fb65027 P0 mùa 3: mảng MUA_3 (10 gói, màn có sẵn), chương ngoài khuôn sang đầu mùa 4, 10 tệp ngân hàng rỗng
- d7c5e16 Máy kiểm lộ trình mục mùa 3 (a)–(h), lỗi giả --loi-gia-mua-3 đỏ 7 / 7; xếp lại che-nhen, che-doc-cuc theo đường cong
- 332da48 P0 mùa 3: ngưỡng gói dời sang mùa 4 tính lại theo luật mo-goi; kiem-goi-doi nhận khung mùa 3
- b63a7af P0 mùa 3: kiem-doi-xich, kiem-may-son theo khung mùa 3 (sửa giả định tối thiểu)
- (commit báo cáo này)

### Bảng MUA_3 đã dựng (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", sau khối mùa 2; mùa 3 vẫn `an: true`)

| Gói (mã, loại) | Chương 1: màn có sẵn theo thứ tự | Chương 2: màn có sẵn theo thứ tự | Có / thiếu |
|---|---|---|---|
| 1 Nhện (nhen, bo-phan) | `nhen` "Thân nhện": nhen.1, nhen.8 | `chuoi-nhen` "Chuỗi cho nhện": nhen.4, nhen.7 | 4 / 16 |
| 2 Nam châm (nam-cham, bo-phan) | `nam-cham`: nam-cham.1, .4, .7, .8, .5 | `logic-nam-cham` "Logic cho nam châm": che-nam-cham.1, .8 | 7 / 13 |
| 3 Cảm ứng từ (cam-ung-tu, bo-phan) | `cam-ung-tu` [] | `che-cam-ung-tu` "Hàm cho cảm ứng từ" [] | 0 / 20 |
| 4 Bãi từ (bai-tu) | `bai-tu` [] | `che-bai-tu` "Hàm cho bãi từ" [] | 0 / 20 |
| 5 Nhảy (nhay, bo-phan) | `nhay`: nhen.3, .2, .9, .5, .6, .10 (trùm) | `che-nhen`: che-nhen.1, .2, .8, .5, .9, .4, .3, .7, .6, .10 | 16 / 4 |
| 6 Đảo cực (dao-cuc, bo-phan) | `dao-cuc`: nam-cham.3, .2 | `che-dao-cuc` "Hàm đảo cực": che-nam-cham.6 | 3 / 17 |
| 7 Đọc cực (doc-cuc, bo-phan) | `doc-cuc`: nam-cham.6, nam-cham.10 (trùm) | `che-doc-cuc` "Hàm đọc cực": che-nam-cham.2, .7, .4, .5, .9, .3, .10 (trùm) | 9 / 11 |
| 8 Đội xích và nhện (doi-xich, thu-thach) | `doi-xich`: doi-xich.3, .9 | `che-doi-xich` [] | 2 / 18 |
| 9 Nam châm bụng nhện (bung-nhen, thu-thach) | `bung-nhen` [] | `che-bung-nhen` [] | 0 / 20 |
| 10 Tổng hợp + trùm (tong-hop-3, thu-thach) | `tong-hop-3` [] | `trum-mua-3` [] | 0 / 20 |
| | | **Tổng** | **41 / 159** |

Khác bảng brief (đo bằng máy kiểm (e), (g), có bằng chứng):
- che-nam-cham.2, .3, .4, .9 gọi `grip()` (tạo ở nam-cham.6, gói 7; thân dùng `front_pole()` + `magnet_s()`): đặt ở che-doc-cuc (gói 7), không ở logic-nam-cham (gói 2).
- che-nam-cham.7 có hàm của màn `fixed_grip()` đọc `front_pole()`: đặt ở che-doc-cuc (gói 7), không ở che-dao-cuc (gói 6).
- che-doi-xich: hai màn không bậc thang (.4, .5) cần `pause()` / `hop_box()` của che-doi-ho-bang (gói ngoài khuôn): cả 10 màn che-doi-xich rời mùa 3, gói 8 chương 2 trống.
- Màn mới của chương có trùm có sẵn ở cuối (nhay, doc-cuc, che-doc-cuc) CHEN TRƯỚC trùm (code tự làm); chương dùng lại mã cũ (nhen, nam-cham, doi-xich, che-doi-xich) thì màn mới khai `so` từ 11 (mã nhen.1–10 … đã có).
- Màn hình chọn gói đánh số gói theo gói ĐANG HIỆN: mùa 3 hiện "GÓI 1 Nhện, GÓI 2 Nam châm, GÓI 3 Nhảy, GÓI 4 Đảo cực, GÓI 5 Đọc cực, THỬ THÁCH Đội xích và nhện" (gói 3, 4, 9, 10 chưa có màn nên chưa hiện, như mùa 2 lúc P0).

### Màn đã sửa (qua lộ trình, không đụng tệp màn gốc)
- nhen.8: ô S thành sàn; đề bài, gợi ý bỏ chữ "bậc thang"; lời giải khác cũ (đi theo chuỗi bằng go(), go chưa tạo ở gói 1 chương 1) thay bằng đi thẳng từng bước. Lời giải, nhịp 24, ô 6 không đổi (đo: thắng 3 sao, nhip 24 / o 6 = ngưỡng) nên không đo lại sao.
- che-nhen.6: ô S thành sàn. Lời giải, nhịp 24, ô 25 không đổi (đo như trên).
- nam-cham.10 (trùm Đọc cực, qua `sua()`, nội dung bản 2): bỏ cảm biến màu và `color()`; ô vàng thành sàn; dừng bằng `while not right_clear(): move()` (cảm biến bên mùa 1); khay bỏ `color`, thêm `left_clear`, `right_clear`; viết lại mã mẫu, lời sai (5 lời sai, đã chạy: đủ mã chẩn đoán), gợi ý, đề bài, lời giải khác (forward(1), 2 sao).
  Sao đo lại: `node tools/do-lo-trinh.mjs --ghi-sao` cho nam-cham.10 { o: 23, nhip: 31 } (cũ 23 / 34). Lệnh đó ghi lại cả tệp và chỉ ĐỔI THỨ TỰ khóa của 5 màn khác (che-nhen.8, nam-cham.6, che-nam-cham.5, .7: giá trị y nguyên) nên tôi khôi phục tệp và chỉ thêm đúng 4 dòng của nam-cham.10 (diff lo-trinh-sao.js: +4 dòng).
- Khay theo gói (như mùa 1, chỉ bớt `hamGoc`): trước gói 3 bỏ front_metal, trước gói 5 bỏ crouch / stand, trước gói 6 bỏ magnet_s, trước gói 7 bỏ front_pole.
- Bỏ lời sai mẫu không còn nghĩa ở gói 2 (chỉ còn báo "hàm chưa có"): nam-cham.4 và che-nam-cham.1 "Bật cực S…", che-nam-cham.8 "Dùng grip() đã chế…".

### Nơi dời gói ngoài khuôn: đầu mùa 4 (ẩn), giữ thứ tự cũ, trước các gói mùa 4 cũ
ban-xoay, doi-ho-bang, list, che-xich (5 màn), **doi-xich-bac** "Đội xích leo bậc" (gói cũ doi-xich đổi mã: chương `doi-xich-bac` = doi-xich.1, .2, .4, .5, .6, .7, .8, .10; `che-doi-xich-bac` = che-doi-xich.1–10), omni, doi-omni, doi-sung-hoi, mau, doi-mau, may-son, rap-nao,
**nam-cham-omni** "Nam châm trên omni" (gói cũ nam-cham đổi mã: chương `nam-cham-omni` = nam-cham.9), doi-nam-cham, doi-tay-xoay; rồi may-nem … doi-thu-manh như cũ.
Chương che-nam-cham cũ hết màn (chia vào logic-nam-cham, che-dao-cuc, che-doc-cuc) nên rời thuTu. Ngưỡng gói dời tính một lần theo luật mo-goi (0,5 × sao gói thường đứng trước trong mùa, gói đội = gói trước + 30); gói đầu mùa 4 (ban-xoay) 0 ★; gói mùa 4 cũ giữ ngưỡng khai cứng. Ngưỡng mùa 3 không khai (mo-goi tự tính: 0, 5, 15, 40, 45, 55).

### Bảng tệp ngân hàng (rỗng, `ManHoc.<biến> = []`, đã require trong lo-trinh-hoc.js, thẻ script trong game/choi.html, `TEP_MUA_3` + chú thích bảng)
| Tệp | Biến | Gói · chương |
|---|---|---|
| man-than-nhen.js | manThanNhen | 1 · nhen, chuoi-nhen |
| man-nam-cham-n.js | manNamChamN | 2 · nam-cham, logic-nam-cham |
| man-cam-ung-tu.js | manCamUngTu | 3 · cam-ung-tu, che-cam-ung-tu |
| man-bai-tu.js | manBaiTu | 4 · bai-tu, che-bai-tu |
| man-nhay.js | manNhay | 5 · nhay (che-nhen đủ 10) |
| man-dao-cuc.js | manDaoCuc | 6 · dao-cuc, che-dao-cuc |
| man-doc-cuc.js | manDocCuc | 7 · doc-cuc, che-doc-cuc |
| man-doi-xich-nhen.js | manDoiXichNhen | 8 · doi-xich, che-doi-xich |
| man-bung-nhen.js | manBungNhen | 9 · bung-nhen, che-bung-nhen |
| man-trum-mua-3.js | manTrumMua3 | 10 · tong-hop-3, trum-mua-3 |

### Định nghĩa luật (kiem-lo-trinh.mjs mục mùa 3)
- Mốc: "trước gói k" = trước màn đầu (trong danhSach) của gói k của MUA_3, gói k chưa có màn thì gói có màn đầu tiên sau nó; hết mùa 3 thì màn đầu sau mùa 3. "Trước gói 1 chương 2" = trước màn đầu chương chuoi-nhen (tương tự logic-nam-cham). Xét MỌI màn đứng trước mốc (cả mùa 1, 2).
- Dòng xét: mã mẫu + lời giải (chinh, doi, hàm của em mới, hàm của màn) + thân các hàm của em được gọi tới, bắc cầu qua kho (như mục mùa 2).
- (b) chuỗi làm DỮ LIỆU, dòng nào khớp một trong: gán chuỗi `x = "…"`; `for v in <không phải range(…)>` (chuỗi hay biến); `==` / `!=` cạnh chuỗi; lời gọi có đối số là chuỗi đường đi chỉ gồm U D L R (`walk("RRD")`, `go("R")`, `leap("RRD")`). Đối số chuỗi cố định khác (`shoot("fast")`) không tính.
- (c) từ khóa `and` / `or` (bỏ chuỗi và chú thích trước khi tìm).
- (e) part mở dần: lệnh có trên khay (hamGoc, kể cả khay robot đội) HAY được gọi (bắc cầu): front_metal trước gói 3; crouch / stand / jump / leap trước gói 5; magnet_s trước gói 6; front_pole trước gói 7; thân nhện (loaiRobot / robot.than / đội) trước gói 1.
- (d) màn mùa 3: thân hai-banh / xich / nhen; tay kep / xoay / hoi / nam-cham; cảm biến khoang-cach / hong-ngoai / cam-ung-tu (mã chờ P1); khay ⊆ lệnh mùa 2 + go_* + crouch / stand + magnet_n / s / off + front_metal / front_pole; không gọi color / look / slide_left / slide_right / aim / throw / load / battery / recharge.
- (g) màn mùa 3 và mọi mùa sau (mùa 4): hamCuaEmCan và lời gọi thẳng của lời giải (trừ hàm riêng của màn, khay, lệnh mùa 3, range / len / append …) đều được tạo ở màn đứng trước.
- (f) không `S`; in bảng hố / gầm (dưới). (a) bảng, thứ tự màn, chương trống chưa vào thuTu, mùa 3 ẩn, gói mùa 3 không khai ngưỡng, đầu mùa 4 đúng danh sách gói dời, gói đầu mùa 4 0 ★, chương rời đúng màn.

Đo các màn có sẵn: không màn nào vi phạm (b), (c), (e) sau khi xếp lại / bớt khay như trên; (b), (c) cả mùa 1, 2 đều sạch.

### (f) hố u / gầm n theo gói (đo)
Gói 1, 2, 6, 7: không. Gói 5 Nhảy: nhen.3(u) nhen.2(n) nhen.9(u) nhen.5(nu) nhen.6(n) nhen.10(un), che-nhen 1(n) 2(u) 8(u) 5(nu) 9(n) 4(u) 3(nu) 7(nu) 10(un). Gói 8: doi-xich.3(u), doi-xich.9(u). Gói 1 không có hố.

### (h) Đường cong mùa 3 (chỉ in, chưa ép): 17 chỗ nhảy (gốc 20; xếp lại che-nhen và che-doc-cuc bớt 3)
| Gói | Màn (chỗ) | Mốc | Chỉ số |
|---|---|---|---|
| nhen | nhen.8 (nhen.2) | nhen.1 | nhịp 12 → 24; ô 7 → 18 |
| nhen | nhen.4 (chuoi-nhen.1) | nhen.8 | dòng 6 → 10 |
| nam-cham | nam-cham.1 (nam-cham.1) | nhen.7 | ô 13 → 25 |
| nam-cham | nam-cham.5 (nam-cham.5) | nam-cham.8 | nhịp 10 → 25 |
| nam-cham | che-nam-cham.8 (logic-nam-cham.2) | che-nam-cham.1 | nhịp 2 → 11 |
| nhay | nhen.9 (nhay.3) | nhen.2 | dòng 5 → 9 |
| nhay | nhen.5 (nhay.4) | nhen.9 | nhịp 9 → 24; ô 7 → 14 |
| nhay | che-nhen.7 (che-nhen.8) | che-nhen.3 | nhịp 12 → 24 |
| dao-cuc | nam-cham.3 (dao-cuc.1) | che-nhen.6 | ô 13 → 25 |
| dao-cuc | nam-cham.2 (dao-cuc.2) | nam-cham.3 | nhịp 4 → 9 |
| doc-cuc | nam-cham.6 (doc-cuc.1) | che-nam-cham.6 | dòng 4 → 11 |
| doc-cuc | che-nam-cham.2 (che-doc-cuc.1) | nam-cham.6 | ô 8 → 25 |
| doi-xich | doi-xich.3 (doi-xich.1) | che-nam-cham.3 | dòng 8 → 13; nhịp 9 → 20 |
| doi-xich | doi-xich.9 (doi-xich.2) | doi-xich.3 | nhịp 20 → 60 |

### Lệnh kiểm (tại worktree, từng lệnh một) và dòng tổng nguyên văn
- `node hoc/kiem-lo-trinh.mjs` → `ĐẠT 905 kiểm tra lộ trình xuất bản.` (main: 897; +7 mục mùa 3 … in bảng (f), (h))
- `node hoc/kiem-lo-trinh.mjs --loi-gia-mua-3` → `Lỗi giả mùa 3: HỎNG 7 / 7 mục (a)–(g).`
- `node hoc/kiem-lo-trinh.mjs --loi-gia-mua-2` → `Lỗi giả mùa 2: HỎNG 8 / 8 mục (a)–(h).`
- `node tools/do-lo-trinh.mjs` → `PASS 835 canonical solutions; 138 revised star thresholds.`
- `node hoc/kiem-hoc.mjs` → `ĐẠT 6715 · HỎNG 0`
- `node hoc/kiem-che-xe.mjs` → `ĐẠT 271 · HỎNG 0`; `kiem-nhen` → `ĐẠT 153 · HỎNG 0`; `kiem-nam-cham` → `ĐẠT 246 · HỎNG 0`; `kiem-phim-goi` → `ĐẠT 41 · HỎNG 0`; `kiem-huy-hieu-phim-vector` → `ĐẠT 12 · HỎNG 0 kiểm`
- `node hoc/kiem-goi-doi.mjs` → `ĐẠT 972 · HỎNG 0` (lúc đầu đỏ 12 MỚI, main 979 / 0; sau sửa tối thiểu: ít hơn 7 mục vì gói chia lại chương gộp mục cấu trúc, mọi màn vẫn kiểm từng màn)
- Thêm (máy giả định chương ở mùa 3): `kiem-doi-xich` đỏ 5 mới (main 69 / 0) → sau sửa `ĐẠT 69 · HỎNG 0`; `kiem-may-son` đỏ 1 mới (main 145 / 0) → `ĐẠT 145 · HỎNG 0`.
  Xanh không sửa: kiem-goi 56/0, kiem-dua-robot 28, kiem-doi-thu-manh 16, kiem-doi-ho-bang 60/0, kiem-doi-nam-cham 100/0, kiem-doi-tay-xoay 92/0, kiem-doi-omni 80/0, kiem-doi-mau 60/0, kiem-doi-sung-hoi 63/0, kiem-ban-xoay 23, kiem-dang-ky 9/0, kiem-huong-dan 40/0, kiem-doi-gap-nem 59/0, kiem-doi-drone 76/0, kiem-che-xich 237/0, kiem-che-nhen 129/0, kiem-che-nam-cham 227/0, kiem-nut-bat-san 30, kiem-trum-mua-1 81/0, kiem-doi-mua-2 107/0.
- Trình duyệt (cổng 4205, một tab, đã gỡ SW / caches: 0 / 0): bật "Mở hết" (GoLoi.datMoHet), màn chọn gói có mùa "Công cụ" với 6 gói như trên, "Bầu trời" có gói dời; mở được (thấy tên màn) nhen.1, nhen.4, nam-cham.1, che-nam-cham.1, nhen.3, che-nhen.6, nam-cham.3, nam-cham.10, che-nam-cham.2, doi-xich.3 (mùa 3) và doi-xich.1, nam-cham.9 (mùa 4). 140 thẻ script đều tải 200. Console có 2 lỗi "An unknown error occurred when fetching the script." (không thấy yêu cầu sw nào hỏng; sw.js trả 200; chưa tách được có ở main không). Đã tắt Mở hết, đóng tab, tắt server.
- Không có máy kiểm nào còn đỏ. Đỏ sẵn ở main (không phải của tôi, máy kiểm không bắt): lời sai mẫu của nam-cham.6 "grip() lúc nào cũng bật cực N" thắng 3 sao và "grip() bật cùng cực…" thiếu mã day-vat (đo bằng script riêng trên bản main).
- GitNexus impact: không chạy; không sửa hàm có sẵn nào của lo-trinh-hoc.js (chỉ thêm khối và dữ liệu, gọi lại dungChuong / sua / get như khối mùa 2).

## 2. CÂU HỎI CẦN LÀM RÕ
1. Brief xếp che-nam-cham.2, .3, .4, .9 vào gói 2 và .7 vào gói 6: các màn đó cần grip() / front_pole() (gói 7). Tôi dời sang che-doc-cuc. Đồng ý, hay muốn gói 2 có `grip()` bản một cực (tạo ở gói 2, gói 7 nâng cấp cùng tên)? Cách sau giữ được nhiều màn ở gói 2 nhưng phải viết lại 4 màn và lane() (che-nam-cham.5 dựa vào lane đọc cực).
2. che-doi-xich.4, .5 không bậc thang nhưng cần pause() / hop_box() của che-doi-ho-bang (rời mùa 3). Tôi để cả chương rời. Muốn đưa hai hàm đó thành hàm có sẵn của màn để giữ hai màn ở gói 8 chương 2 không?
3. nam-cham.10 thay color() bằng `while not right_clear()` (cảm biến bên mùa 1). Có muốn thay bằng `front_metal()` / cảm ứng từ của gói 3 khi P1 có part thay không?
4. Brief nói "elif đã có ở mùa 1": đúng (máy kiểm không cấm elif); "chuỗi làm đối số đã có ở mùa 2": đúng, máy (b) không bắt shoot("fast"), và mùa 1, 2 không có chuỗi làm dữ liệu nào.
5. Màn hình đánh số gói theo gói đang hiện ("GÓI 3 Nhảy"): chấp nhận khi đang dựng?

## 3. ĐỀ XUẤT
Khung vấn đề: gói 2 "Nam châm một cực" chỉ còn 7 màn có sẵn, chương 2 "Logic" 2 màn; gói 7 dồn 9 màn.
| Phương án | Được | Mất |
|---|---|---|
| A. Giữ như P0 (đã làm) | đúng luật gốc → nâng cấp, không viết lại màn | gói 2 cần 13 màn mới |
| B. grip() một cực ở gói 2, gói 7 nâng cấp cùng tên | gói 2 giữ thêm 4 màn | viết lại 4 màn + lane(), hai bản grip cùng tên dễ rối người chơi |
Nghiêng về A: gói 2 chương 2 là chỗ dạy and / or, đằng nào cũng cần màn mới; che-nam-cham dùng grip đọc cực hợp "Hàm đọc cực".

Khung vấn đề: đường cong (h) có 17 chỗ nhảy, nhiều chỗ ở ranh gói (ô 8 → 25 do sân 5 × 5 của che-nam-cham). Đề xuất: P2 mỗi gói thu sân che-nam-cham bằng tường (như mùa 2 làm với che-sung-hoi) và đặt màn mới làm bậc đệm, rồi mới ép (h) đỏ.

## 4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Mùa 3 giờ đã có bộ khung 10 gói, mỗi gói 2 chương, đang dùng 41 màn có sẵn; 159 màn còn phải làm. Mùa 3 vẫn ẩn, chỉ thấy khi bật Gỡ lỗi "Mở hết". Các gói cũ không hợp mùa 3 (omni, màu, máy sơn, danh sách, đội leo bậc…) được dời nguyên sang đầu mùa 4, vẫn chơi được, tiến độ cũ giữ nguyên vì mã màn không đổi. Mỗi gói có sẵn một tệp trống để các phiên sau chỉ việc thêm màn vào. Máy kiểm tự động giờ canh luật mùa 3: chuỗi và and / or không xuất hiện sớm, đồ của robot mở dần đúng gói, không bậc thang; cắm lỗi cố ý thì máy báo đỏ đủ cả 7 mục. Ba màn được sửa nhỏ: hai màn bỏ bậc thang, trùm nam châm bỏ cảm biến màu.

## 5. RỦI RO CÒN LẠI
- Gộp với nhánh HD1 (sửa khối mùa 1 lo-trinh-hoc.js, kiem-lo-trinh.mjs, lo-trinh-sao.js) và claude/dem-tu-thu (gói thử đệm từ ở đầu mùa 3 cũ): chỗ sửa của tôi gọn trong khối mùa 3 mới; kiem-lo-trinh.mjs có 4 dòng sửa giả định ngoài mục mùa 3 (chuongTam, che-xich ở mùa 4, mùa 2 (a) chương ở mùa ẩn, doi-ho-bang sau che-nhen). Gói thử đệm từ nếu neo ở mùa 3 cũ sẽ bị khối mùa 3 dời sang mùa 4.
- `tools/do-lo-trinh.mjs --ghi-sao` lần sau sẽ sắp lại thứ tự khóa trong lo-trinh-sao.js (giá trị không đổi): diff to nhưng vô hại.
- kiem-lo-trinh (a) so khớp ĐẦU mùa 4 với danh sách 15 gói dời: gói mới chèn vào đầu mùa 4 sẽ làm đỏ (cố ý, để thấy).
- Mã cảm biến cảm ứng từ trong PART_3 (`cam-ung-tu`) là đoán; P1 đặt mã khác thì sửa một chỗ.
- Chưa chạy `npm test` cả bộ (luật RAM); các máy kiểm khác không liệt kê ở trên chưa chạy.
- Hai lỗi console "unknown error when fetching the script" ở trình duyệt chưa rõ nguồn (mọi script tải 200).
