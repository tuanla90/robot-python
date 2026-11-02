# Soát nhập liệu mùa 4–7: học sinh có lắp được lời giải bằng khay khối không

2/11, đo trên main `8ef2188`. Chỉ đọc và đo, không sửa code. Ảnh chụp thử tay ở [soat-nhap-lieu-anh/](soat-nhap-lieu-anh/) (tên ảnh ghi trong bài, vd. `m4-chia-du-2-ma-mau` = `soat-nhap-lieu-anh/m4-chia-du-2-ma-mau.jpg`).

## Đã sửa (2/11, sau báo cáo)

Màn thuộc mùa 4–7 bật **chế độ BIỂU THỨC** trong `hoc/game/thanh-phan.js` (`datCheBT`, `coBTCua`, `khayBTCua`, `nguonBTCua`): dòng gán, so sánh, `return`, `for x in tên`, lời gọi có biểu thức đều tách thành cây, mỗi ô (lá, hàm nguồn, toán tử, phần tử danh sách) chạm đổi được; bảng chọn có số 0–12, biến / nguồn (`read_code()`, `flow()`, `radar()`, `color("…")`, hàm em có trả về), chuỗi, toán tử, và phép bọc (+1, −1, ×2, //2, %2, đổi dấu, `abs`, `min`, `max`, `x[0]`, `[x]`, `== 1`, `not`). Tab khay BIỂU THỨC có `n = 1`, `a, b = …`, `return`, `if/elif/else`, `while`, `for n in …`. Thêm `rail(1)` / `set_length(1)` mặc định, khối thứ hai `cast_net("left")`, `cauTruc` cho gói Vườn cũ.

Máy kiểm `hoc/kiem-nhap-mua-4-7.mjs` chạm lắp lời giải mẫu từng màn trong khay thật (theo từng robot ở màn đội): **0 màn kẹt** ở cả bốn mùa (trước: 88 / 60 / 28 / 41). Thử tay `duong-ray.7` trên trình duyệt: lắp được `while read_code() != -1:`, `rail(-1)`, tới cờ.

## Kết luận

Cả bốn mùa đều có màn mà **lời giải mẫu chứa dòng học sinh không lắp được** bằng khay khối + chạm ô:

| Mùa | Màn trên lộ trình | Màn em phải tự lắp ít nhất một dòng | **Màn kẹt** | Dạng kẹt chính |
|---|---|---|---|---|
| 4 Cảng sông | 200 | 173 | **88** | số âm `swing_by(-2)`, lệnh gốc có đối số `rail(2)`, `else:`, `read_code()` trong điều kiện, `//` `%` `abs()` |
| 5 Bến sông | 200 | 175 | **60** | `else:`, `return`, `x = f(…)` / `d = a + b`, `flow_dir()` / `is_calm_front()` trong điều kiện, `cast_net("left")`, `min/max`, gán tuple |
| 6 Nông trại | 200 | 164 | **28** | `while color("right") != …` (khay không có while), `b.append(c)`, `if c != "blue"`, màn thiếu khối `for` |
| 7 Mỏ đá | 200 | 172 | **41** | `else:`, lưới `g[r][c]` / `[[…]]`, `g = radar()`, `shape("front")` trong điều kiện |

"Kẹt" = lời giải mẫu có ít nhất một dòng không lắp được (không có khối mẫu cùng dạng, hoặc có khối nhưng ô cần giá trị mà bảng chọn không có). Học sinh có thể tìm lời giải khác ở vài màn, nhưng phần lớn dạng kẹt (return, tuple, `%`, lưới, `else`, `while` màu) không có đường vòng: chính khái niệm của màn nằm ở dòng đó.

Không tính là kẹt: 16 màn mùa 6 và 4 màn mùa 7 chỉ khác **tên biến vòng** (`for c in a:` trong khi khay chỉ có `for n in a:`; tên biến vòng không chạm đổi được, nhưng đổi tên trong thân là chạy như nhau).

## Khay chơi được những dạng nào

Trình soạn (`hoc/game/thanh-phan.js`) **không có chỗ gõ chữ**: mọi dòng đều phải đi từ một khối mẫu trên khay rồi chạm ô tím / chip để đổi giá trị. Những dạng mùa 4–7 dùng được (đã thấy trên game):

- Lời gọi lệnh gốc **không đối số** (`pick_up()`, `extend()`, `go_right()`…): mùa 4–7 không màn nào kẹt ở dạng này.
- Lời gọi **hàm của em / hàm của màn** có đối số số 1–12, biến (`n`, tham số), `a[0]`, `len(a)`, chuỗi `"U"`, màu `"red"`: ví dụ `swing_by(1)` ở chia-du.2 có ô tím.
- `for i in range(n)`: bảng chọn có 1–12 và các biến đếm phía trên (`n`) (ảnh `m4-chia-du-2-bang-chon-so`).
- Danh sách: `a = [..]`, `for n in a:`, `for n in [..]:`, `a.append(số)`, chip phần tử màu sửa được (may-son.7, ảnh `m6-may-son-7-sua-chip-duoc`).
- Mùa 6: `if color("up") == "red":` / `elif` / `else:` / `c = color("up")`; `n = 0`, `n = n + 1`.
- Mùa 7: `for r in g:` + `slide_r(r[0])` hiện chip khi đã có sẵn trong mã mẫu.

Đếm dòng lời giải theo dạng (✓ không kẹt / ✗ kẹt, gồm cả dòng có sẵn trong mã mẫu):

- Mùa 4: gọi có đối số 353✓/95✗ · gọi không đối số 285✓/0✗ · for range 49✓/3✗ · if/elif 18✓/13✗ · **else 7✓/22✗** · while 8✓/8✗
- Mùa 5: gọi không đối số 425✓/0✗ · gọi có đối số 325✓/12✗ · if/elif 25✓/17✗ · gán 24✓/10✗ · **else 5✓/17✗** · **return 0✓/12✗**
- Mùa 6: gọi không đối số 575✓/1✗ · gọi có đối số 222✓/3✗ · for range 95✓/7✗ · if/elif 60✓/3✗ · else 28✓/0✗ · **while 2✓/13✗** · append 13✓/10✗
- Mùa 7: gọi không đối số 361✓/0✗ · gọi có đối số 321✓/2✗ · for range 60✓/0✗ · if/elif 28✓/19✗ · **else 4✓/23✗** · gán 19✓/6✗

## Vì sao kẹt: cơ chế chung

1. **Ô số chỉ nhận số 1–12** (và 0 ở đối số lời gọi), tên biến, `a ± b` đơn giản, `a[i]`, `len(a)`, `distance()`. Không có số âm, `-d`, `n % 2`, `n // 2`, `abs(d)`, `3 - flow_power()`, `g[1][0]`. Dòng mã mẫu có biểu thức như vậy hiện **chữ trơn, không ô chạm** (ảnh `m4-chia-du-2-ma-mau`: `range(n // 2` và `swing_by(-1)` không có ô tím, còn `swing_by(1)` có).
2. **Lệnh gốc chèn từ khay luôn là `ten()` không đối số** (trừ `aim`, `spray`, `ink` được viết riêng). Lệnh gốc mới có đối số như `rail(n)`, `cast_net("left")`, `set_length(n)` chèn ra `rail()` và không có ô để thêm số (ảnh `m4-duong-ray-3-rail-khong-o`).
3. **Khối `if` / `else` / `while` chỉ dựng cho cảm biến khay đã biết** (`front_clear`, `color`, `battery`, `distance`, `front_pole`…). Cảm biến mới của mùa 4–7 (`read_code()`, `weight()`, `flow_dir()`, `flow_power()`, `is_calm_front()`, `radar()`, `shape()`) bị khay coi như lệnh thường: không có `if read_code() …`, không có `else:` (ảnh `m4-chia-du-2-the-logic`: thẻ Logic của cần cẩu chỉ có `for`, `while front_clear():` và danh sách).
4. **Không có khối cho**: `return`, gán `x = f(…)` / `x = a + b`, gán tuple `a, b = f()`, `min()` / `max()`, so sánh `<` `>` (trừ `battery()` và `distance()`), lưới hai chiều. `cauTruc` của màn mùa 5 có khai `'def', 'return', 'tuple'` nhưng khay bỏ qua các khóa này.
5. Mùa 6: màn camera bốn hướng (`color("right")`, `color("here")`…) có khối `if`, nhưng **không có khối `while`** (`coDieuKienCua` trả false nên `vongWhile` tắt), dù màn có hai sân nên không thay bằng `for` đếm cố định được (ảnh `m6-cam-bon-3-khong-while`). Ô phần tử của `append(…)` chỉ cho số, `a[0]`, `len(a)`, không cho biến vòng kiểu chữ, nên không lắp được `b.append(c)` (ảnh `m6-che-list-15-append`).

## Từng mùa

### Mùa 4 Cảng sông: 88 / 200 màn kẹt

| Dạng câu | Màn | Dòng | Ví dụ |
|---|---|---|---|
| số âm / `-x` trong ô (`swing_by(-2)`, `reach_by(-d)`, `rail(-1)`) | 38 | 41 | moc-cau.5 `swing_by(-2)`; moc-cau.7 `reach_by(-d)`; moc-cau.9 `aim_crane(1, -1)` |
| lệnh gốc có đối số (`rail(n)`), khay chèn `rail()` không ô | 23 | 31 | duong-ray.3 `rail(2)`; che-duong-ray.1 `rail(dx)`; trum-mua-cang.1 `rail(s)` |
| `else:` (không có khối if/else cho cần cẩu) | 22 | 22 | so-am.5, quet-ma.2, quet-ma.7 |
| điều kiện đọc `read_code()` / `weight()` | 20 | 22 | che-quet-ma.3 `while read_code() != -1:`; che-quet-ma.1 `if read_code() % 2 == 0:`; che-can-tai.1 `if weight() <= 2:` |
| `//` chia lấy nguyên | 7 | 8 | chia-du.6 `carry_n(n // 2, d1)`; quet-ma.3 `carry_by(read_code() // 10)` |
| `%` chia lấy dư | 6 | 6 | chia-du.2 `for i in range(n % 2):`; chia-du.3 `swing_r((b - a) % 8)` |
| `abs()` | 4 | 4 | so-am.2 `for i in range(abs(d)):`; so-am.5 `swing_l(abs(d))` |
| so sánh `<` | 2 | 2 | so-am.5 `if d < 0:` |
| `if w == 1:` (biến số, không có khối) | 1 | 1 | che-cang-cu.10 |

Theo gói (kẹt / 20): can-cau 4 · moc-cau 11 · quet-ma 15 · ben-tau 13 · duong-ray 12 · nhac-doi 8 · can-tai 9 · cang-cu 9 · doi-cang 2 · tong-hop-cang 5.

Thử tay: chia-du.2 (bảng chọn số chỉ 1–12 và `n`, không có `n % 2`), duong-ray.3 (`rail()` chèn vào không ô).

### Mùa 5 Bến sông: 60 / 200 màn kẹt

| Dạng câu | Màn | Dòng | Ví dụ |
|---|---|---|---|
| `else:` | 17 | 17 | bo-co-dinh.5, dong-chay.2, dong-chay.3 |
| `return` | 13 | 14 | ham-tra-ve.3 `return d`; ham-tra-ve.5 `return d * 2`; che-suc-nuoc.1 `return s` |
| điều kiện đọc `flow_dir()` / `flow_power()` / `is_calm_front()` | 13 | 13 | che-dong-chay.3 `if flow_dir() == "front":`; che-dong-chay.5 `if not is_calm_front():`; che-ben-cu.1 `if flow_power() > 0:` |
| gán `x = f(…)` / `x = a + b` | 9 | 10 | ham-tra-ve.2 `s2 = add_one(3)`; ham-tra-ve.3 `d = a + b`; ham-tra-ve.10 `d = sail_to(2, 2)` |
| lệnh gốc có đối số (`cast_net("left")`, `set_length(1)`) | 6 | 6 | day-keo.8 `cast_net("left")`; buoc-duoi.2 `set_length(1)` |
| biểu thức trong ô `3 - flow_power()` | 5 | 5 | che-suc-nuoc.9, ben-cu.8 |
| `min()` / `max()` | 4 | 5 | suc-nuoc.5 `if a == min(a, b):`; suc-nuoc.6 `if a == max(a, b):` |
| `if side == "R":` (khay xe không có khối if chuỗi) | 3 | 3 | ham-tra-ve.7, bo-co-dinh.5, tong-hop-song.8 |
| gán tuple `a, b = f()` | 3 | 4 | che-suc-nuoc.1 `h, s = flow()`; bo-co-dinh.9 `h, m = pair_step("R", d)` |

Theo gói: xuong 8 · day-keo 8 · dong-chay 11 · cong-thuy-loi 2 · tha-neo 0 · buoc-duoi 9 · suc-nuoc 11 · ben-cu 7 · doi-xuong 0 · tong-hop-song 4.

Thử tay: ham-tra-ve.3 (chương trình chính cố định gọi `d = span_dist(2, 2)`; Hàm mới → Xưởng `span_dist(a, b)` chỉ có thẻ biến `a`, `b` và lệnh đi, không có `return` hay gán; ảnh `m5-ham-tra-ve-3-xuong`), che-suc-nuoc.1 (khay có `flow()` như một lệnh trơn, chèn ra `flow()` không gán; không có khối tuple, return; ảnh `m5-che-suc-nuoc-1-khay`).

### Mùa 6 Nông trại: 28 / 200 màn kẹt

| Dạng câu | Màn | Dòng | Ví dụ |
|---|---|---|---|
| `while color("…") != …` (khay camera bốn hướng không có while) | 12 | 13 | cam-bon.3 `while color("right") != "red":`; nhin-duoi.2 `while color("here") != "red":`; che-pho-mau.2 `while color("right") != col:` |
| `append(biến)` / `append(color("up"))`: ô phần tử không nhận | 7 | 10 | che-list.15 `b.append(c)`; che-pho-mau.3 `a.append(color("up"))`; che-may-son.6 `seen.append(color("up"))` |
| `if c != "blue":` / `if battery() < k:` | 4 | 4 | che-list.16, che-list.19, che-list.20, trum-mua-4.1 |
| màn không khai `cauTruc` `for` mà lời giải cần `for` | 4 | 4 | vuon-cu.9 `for i in range(3):`; che-vuon-cu.2 `for i in range(n):` |
| `ink(color("here"))` | 3 | 3 | vuon-cu.6, vuon-cu.8, che-vuon-cu.3 |
| `magnet_off()` không có trên khay | 1 | 1 | che-doi-nam-cham.15 |

Theo gói: drone 0 · may-son 4 · cam-bon 4 · pho-mau 4 · tram-sac 0 · net-lien 1 · nhin-duoi 6 · vuon-cu 6 · doi-nam-cham 1 · drone-ke-vach 2.

Thử tay: may-son.7 **chơi được** (sửa chip màu của dòng `for c in [...]` có sẵn); che-list.15 kẹt ở `b.append(c)`; cam-bon.3 thẻ Logic không có `while`.

### Mùa 7 Mỏ đá: 41 / 200 màn kẹt

| Dạng câu | Màn | Dòng | Ví dụ |
|---|---|---|---|
| `else:` | 23 | 23 | radar-tron.3, radar-tron.4, nhan-dang.2 |
| lưới hai chiều `g[r][c]` / `g = [[…]]` | 21 | 22 | luoi-2d.2 `slide_r(g[1][0])`; luoi-2d.3 `g = [[2, 2], [3, 1], [2, 1]]`; radar-tron.2 `if g[1][2] == "F":` |
| `g = radar()` (radar là lệnh trơn, chèn ra `radar()`) | 6 | 6 | che-radar-tron.1, che-radar-tron.2 |
| `if shape("front") == "round":` | 3 | 3 | nhan-dang.9, che-nhan-dang.6, tong-hop-6.9 |

Theo gói: omni 3 · may-nem 0 · radar-tron 14 · ban-xoay 3 · di-cheo 4 · chinh-luc 4 · nhan-dang 12 · mo-cu 0 · doi-omni 0 · may-mo-da 1.

Thử tay: luoi-2d.3 (dòng `g = [[2, 2], [1, 1], …]` của mã mẫu là chữ trơn, không sửa được phần tử nào; ảnh `m7-luoi-2d-3-luoi-chu-tron`), che-radar-tron.1 (chèn `radar` ra `radar()` đứng một mình; ảnh `m7-che-radar-tron-1-radar`).

## Danh sách màn kẹt

- **Mùa 4 (88):** so-am.2, 5, 6, 7 · moc-cau.5, 7, 8, 9, 10 · chia-du.2, 3, 5, 6, 7, 9 · quet-ma.2, 3, 4, 5, 6, 7, 8, 10 · che-quet-ma.1, 3, 4, 5, 6, 7, 8 · ben-tau.4, 5, 7, 8, 9, 10 · che-ben-tau.2, 3, 4, 6, 7, 9, 10 · duong-ray.3, 5, 6, 7, 8, 10 · che-duong-ray.1, 3, 4, 5, 6, 7 · nhac-doi.3, 9, 10 · che-nhac-doi.2, 3, 4, 5, 7 · can-tai.7, 8, 10 · che-can-tai.1, 2, 3, 4, 5, 7 · cang-cu.3, 4, 6, 8 · che-cang-cu.1, 5, 6, 9, 10 · che-doi-cang.4, 5 · tong-hop-cang.8 · trum-mua-cang.1, 2, 3, 7
- **Mùa 5 (60):** ham-tra-ve.2, 3, 5, 6, 7, 8, 9, 10 · day-keo.8, 9, 10 · bo-co-dinh.5, 6, 8, 9, 10 · dong-chay.2, 3, 4, 5, 6 · che-dong-chay.1, 2, 3, 5, 7, 8 · cong-thuy-loi.7 · che-cong.4 · buoc-duoi.2, 5, 7, 9, 10 · che-buoc-duoi.1, 5, 9, 10 · suc-nuoc.5, 6, 7, 10 · che-suc-nuoc.1, 2, 3, 4, 7, 9, 10 · ben-cu.6, 8, 10 · che-ben-cu.1, 6, 7, 8 · tong-hop-song.8 · trum-mua-song.4, 8, 10
- **Mùa 6 (28):** che-list.15, 16, 19, 20 · cam-bon.3, 10 · che-cam-bon.2, 8 · pho-mau.5 · che-pho-mau.1, 2, 3 · che-may-son.6 · nhin-duoi.2, 8, 10 · che-nhin-duoi.1, 2, 4 · vuon-cu.6, 8, 9 · che-vuon-cu.2, 3, 7 · che-doi-nam-cham.15 · tong-hop-4.4 · trum-mua-4.1
- **Mùa 7 (41):** luoi-2d.2, 3, 8 · radar-tron.2–10 · che-radar-tron.1, 2, 3, 4, 7 · ban-xoay.18, 20 · che-ban-xoay.12 · di-cheo.7, 8, 10 · che-di-cheo.6 · chinh-luc.7, 8, 10 · che-chinh-luc.5 · nhan-dang.2, 3, 4, 6, 7, 8, 9, 10 · che-nhan-dang.1, 2, 4, 6 · tong-hop-6.9

(Mã màn là `ma` trong ngân hàng bài, mở bằng `hoc/game/choi.html?debug=1&man=<ma>`.)

## Cách đo

- Script (không commit, để ở thư mục ghi chú chung của nhóm phiên: `soat-nhap-lieu-mua-4-7/soat-nhap.mjs`, `tong-hop.cjs`, kết quả `kq.json`, `tong-hop.txt`): nạp `hoc/lo-trinh-hoc.js` (điểm vào lộ trình xuất bản, 200 màn mỗi mùa), chạy **khay thật** `game/thanh-phan.js` trên DOM giả (chép từ `hoc/kiem-khay.mjs`) với cùng cờ mà `man-choi.js` `veKho()` truyền, gom mọi khối mẫu trên mọi thẻ.
- Dòng "em phải tự lắp" = dòng lời giải (chương trình chính, thân hàm em chế / sửa, thân hàm của màn) trừ dòng có nguyên văn trong mã mẫu / bản hàm cũ. Dòng lắp được khi: trùng khối mẫu; hoặc cùng dạng (`TP.tachDoiSo`) với một khối mẫu hay một dòng mã mẫu còn dư (chương trình chính không cố định) **và** mọi ô cần giá trị bảng chọn có.
- Giới hạn: kho hàm của em lấy theo `ManHoc.khoThamChieu` (như em đã qua mọi màn trước); không mô phỏng hết bảng chọn chuỗi; chỉ đo lời giải mẫu, không tìm lời giải khác. Các dạng ở bảng trên đều đã thử tay ít nhất một màn trên game (server `node server.mjs`, cổng 4214).

## Việc ngoài lề thấy khi thử

- Khay cần cẩu (mùa 4), xuồng (mùa 5), omni (mùa 7) có khối `while front_clear():` dù robot không có cảm biến trước: `chuWhile` rơi về `front_clear` khi màn không có cảm biến nào.
- Thẻ "Bộ phận mới" của Móc cẩu container (chia-du.2) có dòng "Ghép trong một nhịp `pick_up()` `set_down()` → undefined": thiếu chuỗi.
