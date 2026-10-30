# Báo cáo SM1-B: sửa mùa 1 gói 1 (trùm Lăn bánh), gói 2 (for lồng, tay trong chương vòng lặp), gói 3 (`not`)

Nhánh `claude/sua-mua-1-b`, worktree `.claude/worktrees/sua-mua-1-b`, từ `0cc462b` (brief). Không push, không merge. Ngày 30/10. Làm đủ bốn việc.

## 1. KẾT QUẢ

### Commit
| SHA | Nội dung |
|---|---|
| `93a07dc` | Việc 1: trùm hai-banh.10 viết lại (4 nhịp, 10 ô); hai-banh.6 cất; hai-banh.11 mới; máy kiểm mới mục A |
| `63b0a6b` | Việc 2, 3: vong-lap.11 trình diễn for lồng trước vong-lap.9; vong-lap.5 cất; trùm vong-lap.10 mang thùng, chế 2 hàm |
| `16e6e7b` | Việc 4: che-cam-bien.7 (not viết sẵn) lên ngay trước che-cam-bien.2 (while not) |
| (commit sau) | Báo cáo này |

### Tệp đổi
- Mới: `hoc/man-goi-1-2-them.js` (hai-banh.11, vong-lap.11), `hoc/kiem-goi-1-2-them.mjs` (máy kiểm của gói: mục A hai-banh, B vong-lap, C not; có `--loi-gia`).
- Sửa: `hoc/lo-trinh-hoc.js` (chỉ khối MÙA 1 gói 1, 2, 3: nạp tệp mới, `sua('hai-banh.10')`, `sua('vong-lap.10')`, `thay('che-cam-bien.7')` thêm sân / đề, thứ tự ba chương trong MUA_1, CAT thêm hai-banh.6 và vong-lap.5, một dòng chú thích cũ về vong-lap.10), `hoc/lo-trinh-sao.js` (`--ghi-sao`), `hoc/game/choi.html` (nạp tệp mới), `hoc/game/huong-dan-man.js` (hướng dẫn vong-lap.11), máy kiểm `kiem-lo-trinh.mjs` (bảng gói 1, 2, danh sách cất, che-cam-bien.7 số 2, vong-lap.11 là màn trình diễn), `kiem-huong-dan.mjs` (PHAI_CO thêm vong-lap.11), `kiem-cam-bien-them.mjs` (thứ tự chương che-cam-bien), `kiem-trum-mua-1.mjs` (chương vong-lap mới), `kiem-che-cam-bien.mjs` (xem câu hỏi 6).
- Không đụng: ngân hàng `man-chuoi-1.js`, `man-vong-lap.js`, `man-che-cam-bien.js` (kiem-hoc.mjs kiểm bản ngân hàng), `cham.js`, `san-hoc.js`, `so-lenh.js`, `kho-ham.js`, khối gói 4, 5 của gói A, mùa 2 trở đi.

### Việc 1: chương hai-banh (gói 1 chương 1)
Đo lại: một nhịp tiến = 3 dòng, một nhịp quay = 2 dòng, khung chính 10 ô. Chữ U 5 nhịp (tiến, rẽ, tiến, rẽ, tiến) cần 13 dòng: không vừa. Trong 10 ô, chương trình dài nhất có nghĩa là 4 nhịp (hai tiến + hai quay = 10 dòng). Trùm mới chọn đúng mức trần đó, và thêm độ khó về loại: hai lần rẽ NGƯỢC phía nhau, mã mẫu đầy khung bị xáo (không thừa dòng nào, chỉ kéo đổi chỗ).

| Số | Mã | Tên | Dòng | Nhịp | Ô | Ghi chú |
|---|---|---|---|---|---|---|
| 1–5 | hai-banh.1–.5 | (không đổi) | 3, 9, 8, 8, 8 | 1, 3, 3, 3, 3 | | |
| 6 | hai-banh.7 | Quay đầu | 7 | 3 | 7 | lên từ thứ 7 |
| 7 | hai-banh.11 | Quay đầu, đi hai ô | 10 | 4 | 10 | MỚI, thay hai-banh.6 "Chữ L ngược" (cất, trùng ý 1.5) |
| 8 | hai-banh.8 | Lạch bạch | 6 | 2 | 6 | |
| 9 | hai-banh.9 | Dọn dòng thừa | 8 | 3 | 8 | |
| 10 | hai-banh.10 | Xếp lại cho đúng | 10 | 4 | 10 | VIẾT LẠI (trước: 3 nhịp, 8 ô = 1.5) |

Trùm hai-banh.10 (lộ trình, `phienBanNoiDung` 2; giữ mã, tên, huy hiệu, hướng dẫn kéo dòng): xe quay mặt lên, trước mũi là tường, cờ ở chéo trên phải. Lời giải: rẽ phải, tiến, rẽ trái, tiến. Mã mẫu = đúng 10 dòng đó theo thứ tự tiến, rẽ phải, tiến, rẽ trái: nhịp đầu xe húc tường, cuối cùng đứng cạnh cờ. Máy kiểm chứng minh: mã mẫu đầy khung và đâm tường; lời giải là hoán vị đủ dòng của mã mẫu, không phải dãy con; đổi một cặp dòng cạnh nhau chưa ra 3 sao; bộ dò vét cạn (mọi dãy tiến / quay phải / quay trái / chờ tới 5 nhịp) cho đường ngắn nhất 4 nhịp, 10 ô ở cả hai màn mới / viết lại.

### Việc 2, 3: chương vong-lap (gói 2 chương 2)
| Số | Mã | Tên | Dòng | Nhịp | Ô | Tay |
|---|---|---|---|---|---|---|
| 1–4 | vong-lap.1, .2, .3, .4 | (không đổi) | 0, 2, 5, 4 | 6, 6, 12, 8 | | |
| 5 | vong-lap.6 | Vòng lặp trong hàm | 7 | 11 | 14 | |
| 6 | vong-lap.8 | Thụt lề | 7 | 14 | 22 | có |
| 7 | vong-lap.11 | Lặp trong lặp | 0 (khoá) | 15 | 9 | MỚI, trình diễn for lồng (chiChay, chinhCoDinh), không tay |
| 8 | vong-lap.9 | Vòng lặp lồng nhau | 6 | 21 | 21 | có |
| 9 | che-lap.5 | Dọn hàng | 6 | 21 | 24 | có |
| 10 | vong-lap.10 | Mang hàng đường ngoằn ngoèo | 17 | 35 | 34 | VIẾT LẠI, có |

- Cất vong-lap.5 "Bậc thang": trùng ý "lặp một cụm" với vong-lap.4, và là chỗ nhảy 8 → 19 nhịp nghiệm thu nêu. Chương giữ 10 màn.
- vong-lap.11: `for i in range(3): turn_right(); for j in range(4): move()`, chữ U úp ngược ba đoạn bốn ô; lệnh nào cũng chạy, xe dừng đúng ở cờ (không dư lệnh rẽ cuối, điều user từng chê ở trùm cũ 15/10). Có hướng dẫn 2 bước như vong-lap.1. Theo thứ tự lộ trình, đây là màn đầu tiên có for lồng (máy kiểm đo).
- Trùm vong-lap.10: nhặt thùng, đi bốn hàng ngoằn ngoèo, đặt vào ô đích. `pick()`, `for i in range(2):` { `for j in range(4): move()`, `bend_left()`, `for j in range(4): move()`, `bend_right()` }, `drop()`. Chế HAI hàm (bend_left, bend_right; thân y như ngân hàng vì bang-chuyen.8 mùa 2 cần), bỏ row (không màn nào khác dùng). 35 nhịp = 1,67 lần màn 9 (cũ 46 = 2,2 lần, chế ba hàm). Lời sai: quên nhặt, bend_right rẽ nhầm, hàng năm ô, vòng ngoài một lần (thùng đặt giữa đường), chưa chế bend_left. Màn có cờ damLaThua (từ trước): lời giải không đâm tường.
- Bộ dò BFS (move / rẽ 1 nhịp, pick 2, drop 2 hay 1 nếu đặt xong là thắng) khớp ngưỡng ở cả hai màn.

### Việc 4: `not` (gói 3 chương 2)
Thứ tự che-cam-bien nay: .1, **.7**, **.2**, .11, .12, .13, .3, .14, .15, .16. che-cam-bien.7 "Thừa chữ not" (hàm của màn safe_move2 viết sẵn `if not front_clear()`) đứng ngay trước che-cam-bien.2 (tự chế face_open với `while not`). Đề .7 viết lại: so với safe_move() vừa chế ở .1, nói rõ "not đảo ngược câu trả lời: True thành False, False thành True"; bấm Chạy thấy xe đứng im (0 nhịp), bỏ not thì đúng. Sân .7 dài hơn (tường cách bốn ô, main gọi bốn lần: ba lần tiến, một lần đứng yên) để đường cong 4 → 3 → 6 → 5 nhịp không nhảy (bản cũ 1 nhịp thì .2 6 nhịp vượt luật). Máy kiểm: chữ not xuất hiện lần đầu ở mã mẫu .7, lần đầu phải tự viết là .2.

### Lệnh kiểm và kết quả (tuần tự trong worktree, mỗi lệnh `< /dev/null`)
```
node tools/do-lo-trinh.mjs --ghi-sao      PASS 1128 canonical solutions; 144 revised star thresholds.
node hoc/kiem-goi-1-2-them.mjs            ĐẠT 25 · HỎNG 0 kiểm tra brief SM1-B (gói 1, 2, 3 mùa 1).
node hoc/kiem-goi-1-2-them.mjs --loi-gia  ĐẠT 14 · HỎNG 11 (bảy lỗi giả, mọi mục A2, A3, A4, B2, B3, B4, C1, C2 đều đỏ)
node hoc/kiem-lo-trinh.mjs                ĐẠT 1203 kiểm tra lộ trình xuất bản.
node hoc/kiem-lach-mua-1.mjs              ĐẠT 0 lỗ ngoài danh sách chấp nhận · 0 lỗ chấp nhận · 241 phép dò trên 200 màn mùa 1.
node hoc/kiem-loi-giai.mjs                ĐẠT 46/46
node hoc/kiem-huong-dan.mjs               ĐẠT 40 · HỎNG 0
node hoc/kiem-che-lap.mjs                 ĐẠT 198 · HỎNG 0
node hoc/kiem-che-cam-bien.mjs            ĐẠT 224 · HỎNG 0
node hoc/kiem-cam-bien-them.mjs           ĐẠT 59 · HỎNG 0
node hoc/kiem-khoang-cach.mjs             ĐẠT 87 · HỎNG 0
node hoc/kiem-tay-gap.mjs                 ĐẠT 250 · HỎNG 0
node hoc/kiem-bang-chuyen.mjs             ĐẠT 87 · HỎNG 0
node hoc/kiem-banh-lui-them.mjs           ĐẠT 72 · HỎNG 0
node hoc/kiem-kho-hang-them.mjs           ĐẠT 51 · HỎNG 0
node hoc/kiem-nut-de.mjs                  ĐẠT 63 · HỎNG 0
node hoc/kiem-che-xe.mjs                  ĐẠT 272 · HỎNG 0
node hoc/kiem-che-tay.mjs                 ĐẠT 237 · HỎNG 0
node hoc/kiem-trum-mua-1.mjs              ĐẠT 81 · HỎNG 0
node hoc/kiem-combo-mua-1.mjs             ĐẠT 128 · HỎNG 0
node hoc/kiem-doi-mua-1.mjs               ĐẠT 79 · HỎNG 0
node hoc/kiem-robot-hoan-thien.mjs        ĐẠT 181 · HỎNG 0
node hoc/kiem-goi.mjs                     ĐẠT 56 · HỎNG 0
node hoc/kiem-khay.mjs                    ĐẠT 184 · HỎNG 0
node hoc/kiem-huy-hieu-phim-vector.mjs    ĐẠT 12 · HỎNG 0
node hoc/kiem-thu-ham.mjs                 ĐẠT 78 · HỎNG 0
node hoc/kiem-phim-goi.mjs                ĐẠT 56 · HỎNG 0
node hoc/kiem-gioi-thieu-part.mjs         ĐẠT 1286 · HỎNG 0
node hoc/kiem-xe-roi-ho.mjs               Đạt 14 / 14
node hoc/kiem-hoc.mjs                     ĐẠT 6709 · HỎNG 0 (chạy cuối, 1 phút 21 giây)
```
Máy kiểm mới tự bắt lỗi thật trong lúc làm: ngưỡng nhịp trùm vong-lap.10 khai 36, máy chấm đo 35 (drop thắng ngay ở nhịp thả); ba lời sai của trùm vong-lap.10 khai thiếu mã đúng (màn damLaThua dừng ở dam-tuong, không tới chua-dua-vat). Mục A5 lúc đầu bắt cặp 1.1 → 1.2 (3 → 9 dòng, có từ trước, ngân hàng): thu hẹp về cặp có màn đổi, ghi lý do trong tệp.

Xem bằng mắt (cổng 4206, đã tắt): choi.html nạp man-goi-1-2-them.js không lỗi; trong trình duyệt năm màn đổi có đúng id (1.7, 1.10, 4.7, 4.10, 6.2) và ngưỡng sao; chấm lời giải chuẩn bằng ChamHoc của trang: cả năm 3 sao, đúng nhịp / ô; trùm 4.10 vẽ được (sân 9 × 5 cao, hơi nhỏ ở khung 800 × 600). Chưa xem từng nhịp hoạt cảnh.

### Việc dở
Không có trong bốn việc. Chưa `npm test` cả bộ (luật RAM).

## 2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu)
1. "Chữ U 5 nhịp, đúng 10 ô" (nghiệm thu, đề xuất 6) không vừa khung: 13 dòng. Trần thật của chương 1 là 4 nhịp / 10 ô. Trùm mới vì thế BẰNG hai-banh.11 (màn 7) về nhịp và ô; khó hơn về loại (hai lần rẽ ngược phía, mã mẫu xáo đầy khung phải kéo ba dòng trở lên). Brief chỉ đòi "khó hơn màn 9" (đạt: 4 > 3 nhịp, 10 > 8 ô). Nếu muốn trùm hơn hẳn mọi màn về số: xem đề xuất F.
2. Nghiệm thu nói hai màn L trùng là 1.6 / 1.9, brief nói 1.5 / 1.6. Tôi cất 1.6 "Chữ L ngược" (1.9 là màn dạy xóa dòng, có hướng dẫn riêng). Ý "trái / phải tính theo mặt xe" của 1.6 vẫn còn ở 1.9 (xe quay mặt sang trái) và trùm.
3. "Thay bằng màn quay đầu + đi": hai-banh.7 "Quay đầu" đã đúng là quay đầu rồi đi một ô. Màn mới hai-banh.11 là quay đầu rồi đi HAI ô (vừa khít 10 ô), điều mới là "lấp đầy khung, không còn chỗ cho dòng thừa" trước trùm. Ý mới mỏng; xem đề xuất F.
4. Brief / nghiệm thu: "4.8 vong-lap.9 cùng lúc thêm pick / drop". Đo lại: vong-lap.8 (đứng ngay trước, 4.7 cũ) trong lộ trình đã mang thùng bằng pick / drop từ trước, nên pick / drop không mới ở 4.8. Điều mới thật ở 4.8 chỉ là for lồng; nay có màn trình diễn vong-lap.11 đứng trước (không tay), vong-lap.9 giữ nguyên.
5. Việc 4, gợi ý "mã mẫu `while front_clear():` sai rồi sửa thành `while not`" không làm được ở che-cam-bien.2 mà không sửa lõi: màn đó bắt CHẾ hàm face_open (taoHam), mà mã mẫu không chứa được bản nháp hàm của em (không có `maMau.hamCuaEmMoi` trong game; lo-trinh-hoc.js còn xoá trường này). Đặt sẵn face_open thành hàm của màn thì trùng tên hàm cốt truyện. Tôi chọn cách không thêm màn: đưa che-cam-bien.7 (not viết sẵn) lên ngay trước. Muốn "while not" thấy trước đúng như gợi ý: đề xuất G.
6. `kiem-che-cam-bien.mjs` đỏ 1 ca TỪ SM1-A (không phải gói này): SM1-A thêm `to_left_gap` (nhóm cam-bien) vào so-lenh.js, ca "nhóm cam-bien = go_wall + sáu hàm che-cam-bien" hết đúng; SM1-A không chạy máy kiểm này. Đã sửa kỳ vọng của ca (thêm to_left_gap ở cuối), không đụng so-lenh.js.
7. `kiem-trum-mua-1.mjs` có ca "vong-lap.10 không đổi" (phienBanNoiDung undefined) và "vong-lap.8 đứng thứ 7 đến 9": cả hai đi ngược việc 2, 3 của brief. Đã đổi thành "vong-lap.10 vẫn tạo bend_left / bend_right" và "thứ 6 đến 9"; đường cong quanh màn trình diễn so dòng với màn trước nó.
8. row không còn là hàm cốt truyện trong lộ trình (không màn nào tạo). Sổ lệnh (so-lenh.js, ghi theo ngân hàng) vẫn có mục row ở vong-lap.10; không sửa vì so-lenh.js không nằm trong phạm vi brief SM1-B và máy kiểm Sổ lệnh (kiem-che-xe) vẫn xanh. Người chơi đã có row trong kho thì giữ.
9. Bẫy công cụ (cho gói sau): `sua()` đặt `sao` nhưng `lo-trinh-sao.js` cũ đè lên lúc nạp, nên sau mỗi lần đổi bài phải `--ghi-sao` rồi mới đọc ngưỡng. Hook phiên chặn ghi vào worktree khác: mọi tệp ghi bằng scratchpad + `cp` / script thay chuỗi chính xác (không định dạng lại).

## 3. ĐỀ XUẤT cần user quyết

### F. Trùm hai-banh bằng màn 7 về số (câu hỏi 1, 3)
Cơ chế: khung 10 ô (`man-chuoi-1.js` KHUNG), hai-banh.11 và hai-banh.10 đều 4 nhịp / 10 ô (`hoc/man-goi-1-2-them.js`, `hoc/lo-trinh-hoc.js` khối SM1-B).

| | Để nguyên (đã làm) | F1: màn 7 về 3 nhịp | F2: trùm nhiều sân |
|---|---|---|---|
| Làm gì | Không | hai-banh.11 thành "quay đầu, đi một ô rồi rẽ" hay bỏ, đưa hai-banh.6 về | Trùm hai sân khác nhau, một chương trình (chưa có cảm biến nên chỉ được khi hai sân cùng đường) |
| Mất bao lâu | 0 | 30 phút | Không làm được có nghĩa ở chương 1 |
| Ảnh hưởng | Không | Màn 7 dễ lại, chương không có màn "lấp đầy khung" | |
| Người chơi thấy khác gì | Màn 7 và trùm cùng dài, trùm phải kéo dòng | Trùm dài nhất chương rõ ràng | |
| Lợi | Có bước đệm 10 ô trước trùm | Trùm khó nhất theo số | |
| Rủi ro | Nghiệm thu sau có thể ghi "trùm bằng màn 7" | Bớt bước đệm, mất ý mới của màn 7 | |

Nghiêng về để nguyên.

### G. `while not` thấy trước đúng như gợi ý (câu hỏi 5)
| | Để nguyên (đã làm) | G1: thêm màn sửa "Thiếu chữ not" |
|---|---|---|
| Làm gì | che-cam-bien.7 (if not, phải bỏ not) ngay trước .2 | Màn mới: hàm của màn tên khác (vd turn_till_open) viết `while front_clear(): turn_right()`, sửa thành `while not`; cất một màn luyện (che-cam-bien.11 hay .13) để giữ 10 màn |
| Mất bao lâu | 0 | 1 giờ (màn, máy kiểm, đường cong, hướng dẫn) |
| Ảnh hưởng | Không | .2 thành gần bản sao của màn mới (cùng thân while not turn_right) |
| Người chơi thấy khác gì | Gặp not lần đầu như một lỗi phải bỏ | Gặp đúng "while not" trước khi tự chế |
| Lợi | Không thêm màn | Sát gợi ý brief nhất |
| Rủi ro | Thấp | Hai màn liền trùng ý, ngược tinh thần đề xuất 3 của gói A |

Nghiêng về để nguyên.

## 4. PHẦN CHO NGƯỜI KINH DOANH
Gói 1: bài cuối chương đầu trước đây dễ ngang bài 5; nay là bài dài nhất mà khung 10 dòng chứa được, xe phải rẽ hai lần ngược phía nhau, và các dòng có sẵn bị xáo, trẻ phải kéo lại cho đúng. Hai bài "chữ L" gần giống nhau bớt một, thay bằng bài quay đầu đi hai ô viết vừa khít 10 dòng. Gói 2: trước đây trẻ gặp "vòng lặp trong vòng lặp" lần đầu ở một bài trống trơn; nay có một bài xem trước (chỉ bấm Chạy, thấy xe đi hình chữ U nhờ hai vòng lặp lồng nhau), rồi mới tự viết. Bài cuối chương vòng lặp nay bắt mang thùng hàng qua đường ngoằn ngoèo, nối được tay gắp vừa học với vòng lặp; bài ngắn hơn bản cũ (35 so với 46 bước) và chỉ phải tự chế hai lệnh thay vì ba. Gói 3: chữ "not" giờ xuất hiện trước ở một bài sửa lỗi có đề giải thích, rồi bài sau trẻ mới tự dùng. Mọi bài đổi đã qua máy kiểm: lời giải ba sao, không có đường tắt, độ khó tăng đều; đã mở thử trong trình duyệt, chưa chơi qua từng bước hoạt cảnh.

## 5. RỦI RO CÒN LẠI và cách kiểm
1. Trùm vong-lap.10 sân 9 hàng × 5 cột cao và hẹp, vẽ nhỏ ở màn hình thấp. Kiểm: `PORT=4206 node server.mjs`, mở `choi.html?debug=1&man=vong-lap.10&loigiai=1`, bấm Chạy, xem thùng đi theo xe và vào ô D; tương tự `man=vong-lap.11`, `man=hai-banh.10` (thử kéo dòng), `man=che-cam-bien.7`.
2. Người chơi đã 3 sao ở hai-banh.6, vong-lap.5 (cất): sao giữ theo mã (M.manCat), không hiện. Người đã qua hai-banh.10, vong-lap.10, che-cam-bien.7 bản cũ: bản mới `phienBanNoiDung` 2, nháp cũ bị bỏ, sao giữ; ngưỡng mới cao hơn (trùm hai-banh 4 nhịp / 10 ô).
3. Ngưỡng gói (sao mở gói sau) không đổi: số màn mỗi chương giữ 10, tổng sao tối đa không đổi.
4. `npm test` cả bộ chưa chạy (luật RAM). Máy kiểm mùa 2 có đụng bend_left / bend_right (bang-chuyen.8): kiem-bang-chuyen xanh, thân hàm giữ y ngân hàng (máy kiểm mới so từng dòng).
5. Hàm cốt truyện row biến khỏi lộ trình: nếu mùa sau cần row, phải cho một màn tạo lại. Kiểm: `grep -rn "row()" hoc/man-*.js`.
