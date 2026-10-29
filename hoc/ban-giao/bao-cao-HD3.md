# Báo cáo HD3: màn trình diễn gói 5 (bánh lùi) và gói 8 (hai robot)

## 1. KẾT QUẢ
Nhánh `claude/hd3-trinh-dien-goi-5-8` (worktree `.claude/worktrees/hd3-trinh-dien-goi-5-8`), từ 2ee402c. Không push, không merge.

| SHA | Nội dung |
|---|---|
| 2741a26 | Việc 1: banh-lui.5 "Xe lùi" (trình diễn), cất che-xe.8, che-xe.9 lên trước banh-lui.3, hướng dẫn, máy kiểm, đo sao |
| 7e11b81 | Việc 2 (WIP): cham.js chamDoi khoá theo maMau.doi khi chiChay, man-choi.js bỏ nháp đội khi chiChay, hai-robot.1 trình diễn, hai-robot.2 R1 viết sẵn, hướng dẫn |
| bc2a6a8 | Việc 2: kiem-hai-robot-man mục 6 (7 ca) |
| 4e19424 | Đo lại sao (hai-robot.1 / .2), sinh lại `bang-hd1.md` |
| a98e641 | Hướng dẫn hai-robot.1 còn một bước (xem câu hỏi 4) |
| (commit báo cáo này) | `hoc/ban-giao/bao-cao-HD3.md` |

Tệp đổi: `hoc/man-banh-lui-them.js`, `hoc/lo-trinh-hoc.js`, `hoc/lo-trinh-sao.js`, `hoc/cham.js` (+2 dòng), `hoc/game/man-choi.js` (1 dòng), `hoc/game/huong-dan-man.js`, `hoc/kiem-banh-lui-them.mjs`, `hoc/kiem-hai-robot-man.mjs`, `hoc/kiem-lo-trinh.mjs`, `hoc/kiem-huong-dan.mjs`, `hoc/ban-giao/bang-hd1.md`.

### Gói 5: chương banh-lui (10 màn)
| # | Trước | Sau |
|---|---|---|
| 1 | che-xe.4 chế back() | **banh-lui.5 "Xe lùi" (mới, chiChay)**: thùng chắn trước, main khoá `left_back(); right_back(); wait()` ×2, xe lùi 2 ô tới xe mờ, 3 sao (6 ô, 2 nhịp) |
| 2 | che-xe.5 | che-xe.4 chế back() (ép, giữ cờ đâm-là-thua) |
| 3–7 | che-xe.6, banh-lui.1, banh-lui.2, che-xe.7, banh-lui.3 | che-xe.5, che-xe.6, banh-lui.1, banh-lui.2, che-xe.7 |
| 8 | che-xe.8 | che-xe.9 |
| 9 | che-xe.9 | banh-lui.3 |
| 10 | banh-lui.4 (trùm) | banh-lui.4 (trùm) |

Màn cất: **che-xe.8** (vào `CAT`, ngân hàng `man-che-xe.js` giữ mã, sao đã lưu không mất). Lý do chọn che-xe.8 thay banh-lui.2: bản lộ trình của che-xe.8 đã bị viết lại thành "Hai bánh cùng nhịp" (sửa go_one() có hai lệnh bánh ở hai nhịp: ý của gói 1, không dùng lệnh lùi), nhịp 3 là chỗ trũng giữa 11 và 7. banh-lui.2 "Lùi vào ngách" là màn luyện lùi đúng chủ đề, và cất nó làm cỡ sân nhảy banh-lui.1 (11 ô) → che-xe.7 (24 ô). Cất che-xe.8 lại làm lộ cặp banh-lui.3 (10 ô) → che-xe.9 (21 ô) vượt luật 1,5× / +6 nên tôi đổi chỗ che-xe.9 lên trước banh-lui.3 (thứ tự màn cũ giữ nguyên: che-xe.7 rồi che-xe.9; dòng 8 → 4 → 5, nhịp 8 → 7 → 11 đều trong luật).
`lo-trinh-hoc.js`: lệnh `thay('che-xe.8', …)` (viết lại daoChieu) chạy sau khi cất nên gắn `if (get('che-xe.8'))`, giữ bản viết lại cho lần đưa về.

### Gói 8: hai-robot.1 / .2
- `cham.js` chamDoi (dòng 1291): màn đội `chiChay` thì robot i chạy `maMau.doi[i].chinh`, bỏ bài gửi lên (cùng kiểu dòng đối thủ `doiKhang` ngay trên). Không màn đội nào khác có chiChay nên hành vi cũ không đổi (máy kiểm chứng minh, mục dưới).
- `man-choi.js` nhanBan (dòng 211): màn đội chiChay không lấy bản nháp cũ. `khungCoDinh()` vốn đã khoá mọi thẻ khi `S.man.chiChay`; nhãn "Chỉ chạy" hiện ở cả R1 và R2 (xem bằng mắt).
- hai-robot.1 (lộ trình): chiChay + chinhCoDinh, R1 và R2 đều khoá `go_wall()`, bấm Chạy hai robot cùng tới cờ, 3 sao (7 ô, 4 nhịp). Hướng dẫn một bước (nút Chạy). Phiên bản hướng dẫn hai-robot.1 = 2.
- hai-robot.2 (lộ trình): R1 viết sẵn `pick(); u_turn(); drop()`, R2 trống; đề bài nói "Chạm thẻ R2 rồi viết chương trình cho R2". Hướng dẫn mới: chạm R2 → chạm pick() (tự chỉ ◀ ▶ sang thẻ Tay kẹp) → Chạy.
- Ngân hàng `man-hai-robot.js` không đổi (máy kiểm cũ mục 1–5 vẫn kiểm bản ngân hàng).

### Lệnh kiểm (tuần tự, không `npm test`) và kết quả nguyên văn (dòng cuối)
```
node hoc/kiem-lach-mua-1.mjs        → ĐẠT 0 lỗ ngoài danh sách chấp nhận · 0 lỗ chấp nhận · 241 phép dò trên 200 màn mùa 1.
node hoc/kiem-lo-trinh.mjs          → ĐẠT 905 kiểm tra lộ trình xuất bản.
node hoc/kiem-huong-dan.mjs         → ĐẠT 40 · HỎNG 0
node hoc/kiem-banh-lui-them.mjs     → ĐẠT 52 · HỎNG 0 kiểm tra 8 màn mới và màn trình diễn banh-lui.5 gói Bánh lùi.
node hoc/kiem-che-xe.mjs            → ĐẠT 271 · HỎNG 0
node hoc/kiem-hai-robot-man.mjs     → ĐẠT 105 · HỎNG 0
node hoc/kiem-doi-mua-1.mjs         → ĐẠT 79 · HỎNG 0 kiểm tra 10 màn chương Đội phối hợp.
node hoc/kiem-hoc.mjs               → ĐẠT 6715 · HỎNG 0
kiem-bang-chuyen 87 · kiem-che-cam-bien 224 · kiem-che-lap 198 · kiem-che-mau 244 · kiem-che-nhen 129 · kiem-che-tay-xoay 159 · kiem-che-tay 237 ·
kiem-combo-mua-1 128 · kiem-goi 56 · kiem-hai-robot 360 · kiem-hong-ngoai 108 · kiem-huy-hieu-phim-vector 12 · kiem-khay 184 · kiem-rap-nao 286 ·
kiem-robot-hoan-thien 181 · kiem-tay-gap 250 · kiem-tay-xoay 183 · kiem-ve-vector 99 · kiem-nut-de 62 · kiem-cam-bien-them 59 · kiem-khoang-cach 87 ·
kiem-trum-mua-1 81 · kiem-chuoi 99 · kiem-dang-ky 9 · kiem-mau 148 · kiem-thu-ham 78   (đều HỎNG 0)
node tools/do-lo-trinh.mjs --ghi-sao → PASS 835 canonical solutions; 142 revised star thresholds.
node hoc/kiem-lach-mua-1.mjs --bang > hoc/ban-giao/bang-hd1.md   (banh-lui.5, hai-robot.1 cột "trình diễn" = có)
```
Lỗi giả (cắm, thấy đỏ, gỡ):
- Bỏ `chiChay: true, chinhCoDinh: true` ở banh-lui.5 → kiem-banh-lui-them HỎNG 2 ca ("thiếu chiChay / chinhCoDinh"; "bài [] không thắng 3 sao: lech-bong-mo").
- Bỏ dòng chiChay trong cham.js chamDoi → kiem-hai-robot-man HỎNG 2 ca (màn đội chiChay bài khác mã mẫu thua; lộ trình hai-robot.1 bài bất kỳ thua).
- Bỏ `!m.chiChay` trong man-choi.js nhanBan → kiem-hai-robot-man HỎNG 1 ca (kiểm nguồn giao diện).
- Ca kiểm "mở khoá thì move() / một bánh lùi không tới xe mờ" chứng minh banh-lui.5 thắng nhờ chương trình khoá chứ không nhờ sân dễ.
Gỡ hết → xanh như trên.

Xem bằng mắt (server cổng 4193, localStorage trống, 360 × 640, đã TẮT server, cổng 4181 không đụng):
- banh-lui.5 "9.1 Xe lùi": nhãn "Chỉ chạy", chạm khối khay → toast "Màn này chỉ xem…", chương trình không đổi; bấm Chạy → "ĐÚNG CHỖ!" 3 sao (6 ô, 2 nhịp). Bong bóng "Chương trình đã khoá. Bấm Chạy: hai bánh cùng quay lùi, xe lùi." chỉ nút Chạy (đè lên góc thùng gỗ, đọc được).
- Màn tiếp "9.2 Bánh lùi" (che-xe.4): main `back()` "Cố định", nhãn "Đâm tường là thua", khay có Hàm mới.
- hai-robot.1: R1 và R2 đều `go_wall()`, nhãn "Chỉ chạy" ở cả hai thẻ, chạm khối khi đang ở R2 vẫn bị chặn; Chạy → "TỚI CỜ!" 3 sao (7 ô, 4 nhịp). Bong bóng một bước chỉ nút Chạy.
- hai-robot.2: R1 có sẵn 3 dòng, sửa được; bong bóng chỉ thẻ R2, chạm R2 → khung R2 trống, bong bóng chuyển sang "Bấm ▶ để sang thẻ Tay kẹp".

Việc dở: không.

## 2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thiếu)
1. Brief việc 2: "`ganCoDinh` chỉ thay `baiLam.chinh`; màn đội chấm theo `maMau.doi[i]`… mở rộng ganCoDinh". Sai một nửa: màn đội KHÔNG đi qua ganCoDinh (`cham()` rẽ sang `chamDoi` trước dòng ganCoDinh, cham.js:1157), và chamDoi chấm theo BÀI GỬI LÊN `baiLam.doi[i]` (chỉ robot đối thủ `doiKhang` mới dùng `maMau.doi[i]`). Tôi thêm 2 dòng vào chamDoi (cạnh dòng đối thủ) thay vì sửa ganCoDinh; vẫn là cộng thêm, chỉ bật khi `man.chiChay === true`.
2. Brief chưa nhắc: cất che-xe.8 mở ra bước nhảy cỡ sân 10 → 21 ô (banh-lui.3 → che-xe.9), nên tôi đổi chỗ hai màn này (bảng ở mục 1). Nếu muốn giữ đúng thứ tự cũ thì phải cất banh-lui.2 và vẫn phải đổi chỗ khác (11 → 24 ô).
3. hai-robot.2: brief chỉ bảo dời bước "chạm R2" sang đó. Bản cũ hai-robot.2 cho cả hai khung trống (viết 6 dòng, dòng nhảy 1 → 6 đã có từ trước). Tôi cho R1 viết sẵn lời giải để màn chỉ thêm MỘT điều mới (tự viết cho R2), đúng luật đường cong; nếu user muốn hai khung trống thì bỏ khối `(function (m) {…})(get('hai-robot.2'))` trong lo-trinh-hoc.js.
4. Lỗi khuôn ở MỌI màn trình diễn của HD1 / HD2 (kc.1, kc.2, vong-lap.1, nut-de.1, tay-xoay.1, cam-bien-ben.1) và banh-lui.5: bước thứ hai đặt SAU bước "Bấm Chạy". Bấm Chạy là thắng, thắng thì `HuongDan.xongMan` dừng chuỗi (man-choi.js:684, huong-dan.js:385), nên bước hai chỉ hiện trong lúc xe chạy (1–3 giây) rồi tắt. Với hai-robot.1 bước hai là "chạm R2 để xem" nên vô nghĩa: tôi gộp còn một bước. Các màn khác chưa sửa (xem đề xuất 3a).
5. Máy dò lách vẫn bỏ qua màn hai robot (giữ nguyên như HD1 ghi): `kiem-lach-mua-1` in "hai-robot.1 | hai robot: bỏ qua". Màn trình diễn đội được kiểm ở kiem-hai-robot-man mục 6 thay vào.
6. `lo-trinh-sao.js` sinh lại có đổi thứ tự vài mục mùa 3 (che-nhen.8, nam-cham.6 / .10, che-nam-cham.5 / .7) do thứ tự lộ trình sau P0 mùa 3; số không đổi. Có thể đụng khi gộp với phiên mùa 3: chạy lại `node tools/do-lo-trinh.mjs --ghi-sao` sau khi gộp.
7. Lỗi quy trình của tôi (đã khắc phục, không ảnh hưởng nhánh): lần cắm lỗi giả đầu tiên tôi gỡ bằng `git checkout` tệp chưa commit nên mất bản sửa banh-lui.5, khôi phục ngay từ bản sao đã chép trước; từ đó commit trước rồi mới cắm lỗi giả.

## 3. ĐỀ XUẤT cần user quyết
### 3a. Bước thứ hai của màn trình diễn gần như không hiện
Cơ chế thật: `huong-dan-man.js` các màn chiChay khai `[ {nut:chay, xong:'chay'}, {dong:N, giải thích…} ]`; bấm Chạy chuyển sang bước 2, nhưng màn trình diễn thắng ngay khi chạy xong và `man-choi.js:684` gọi `HuongDan.xongMan` → chuỗi dừng, bước 2 tắt.

| | A. Gộp một bước (như hai-robot.1) | B. Bước giải thích đứng TRƯỚC Chạy | C. Để nguyên |
|---|---|---|---|
| Làm gì | Mỗi màn trình diễn còn một bong bóng ở nút Chạy, lời gộp cả ý giải thích | Bước 1 chỉ dòng khối mới (tự qua sau ~6 s hay khi chạm), bước 2 chỉ Chạy | Không |
| Mất bao lâu | 15 phút (7 màn, chỉ đổi dữ liệu) | 20 phút | 0 |
| Ảnh hưởng | huong-dan-man.js, tăng HuongDanManPhienBan 7 màn | như A | không |
| UI trước → sau | 2 bong bóng (cái sau loé rồi tắt) → 1 bong bóng dài hơn | 2 bong bóng, đọc được cả hai, Chạy sau | như cũ |
| Người chơi thấy | một câu: bấm gì và sẽ thấy gì | đọc dòng khối mới trước rồi mới bấm | câu giải thích loé trong lúc xe chạy |
| Lợi | đúng "bấm là thấy", ít chữ | giải thích không mất | không tốn |
| Rủi ro | câu dài hơn ở khổ 360 px | chậm một nhịp trước khi bấm, hơi "tell trước show" | ý giải thích gần như không ai đọc |
Nghiêng về A (đúng tinh thần show don't tell của user; ý "màn sau em…" đã có trong đề bài / gợi ý).

### 3b. Nhãn toast của màn trình diễn
`choi.chiChay` nói "bấm Chạy để thấy khối mới làm gì": ở hai-robot.1 "cái mới" là hai robot chứ không phải khối. Để nguyên (đủ hiểu) hay đổi thành "để thấy cái mới làm gì" (5 phút, chu.js một chuỗi). Nghiêng về để nguyên.

## 4. PHẦN CHO NGƯỜI KINH DOANH
Gói Bánh lùi và gói Đội hai robot giờ mở đầu giống các gói khác: màn đầu tiên chỉ cần bấm Chạy để xem điều mới hoạt động ra sao, không phải viết gì. Ở gói Bánh lùi, trẻ thấy xe lùi khỏi thùng gỗ trước, rồi màn sau mới tự gói lệnh lùi thành một lệnh riêng. Ở gói Đội hai robot, trẻ thấy hai robot cùng chạy một lúc, rồi màn sau tự chuyển sang robot thứ hai và viết chương trình cho nó, có sẵn chương trình của robot thứ nhất làm mẫu. Mỗi chương vẫn 10 màn; một màn trùng ý ở gói Bánh lùi được cất đi, sao người chơi đã có không mất. Mọi bài kiểm tra tự động đều đạt và đã chơi thử trên khổ điện thoại.

## 5. RỦI RO CÒN LẠI và cách kiểm
- cham.js / man-choi.js / lo-trinh-hoc.js có thể đụng phiên mùa 2 / mùa 3 khi gộp: diff ở cham.js 2 dòng, man-choi.js 1 dòng, lo-trinh-hoc.js chỉ thêm khối (không định dạng lại). Kiểm: sau khi gộp chạy kiem-hai-robot-man, kiem-banh-lui-them, kiem-lo-trinh, `do-lo-trinh --ghi-sao`.
- `kiem-lo-trinh` khai cứng `CAT_MUA_1` và bảng gói banh-lui: phiên khác đổi chương mùa 1 sẽ thấy đỏ ở đó (chủ ý).
- Người chơi đã có bản nháp hai-robot.2 (hai khung) sẽ giữ bản nháp cũ thay vì R1 viết sẵn (nhanBan ưu tiên nháp); chỉ khác ở lần vào đầu. Kiểm: vào hai-robot.2 với nháp cũ, Chạy vẫn chấm bình thường.
- Chưa chơi tay toàn bộ hai-robot.2 tới thắng trong trình duyệt (lời giải chuẩn chấm máy 3 sao); chưa xem lại các màn chương banh-lui số 3–10 bằng mắt sau khi đổi số thứ tự (dữ liệu không đổi, chỉ đổi `so` / `hang`).
- Màn trình diễn đội mới chỉ có một (hai-robot.1); màn đội chiChay có hàm của màn thì hamCuaMan vẫn lấy của người chơi (giống ganCoDinh một robot). Kiểm khi thêm màn như vậy.
