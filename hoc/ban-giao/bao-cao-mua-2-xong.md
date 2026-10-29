# Báo cáo mùa 2 xong (agent Ship, opus, nhánh claude/mua-2-xong, 29/10)

Nhánh `claude/mua-2-xong` tạo tại e1be1ff (con của 5b731f1, chỉ thêm brief + sổ canh; worktree Agent tool mở ở 5b731f1 nên tôi tạo nhánh ở e1be1ff để có brief).
Không push, không merge. Không mở trình duyệt, không chạy server, không chạy `npm test` cả bộ.

## 1 KẾT QUẢ

### Commit

| SHA | Việc |
|---|---|
| b82fea3 | Việc 1: trùm bien-xich.10 + huy hiệu vector bien-xich + máy kiểm `hoc/kiem-bien-xich.mjs`; A7 của kiem-huy-hieu-phim-vector thêm `MOI_SAU_CHUP` |
| 0e2ac0c | Việc 3: phanh trong kiem-lo-trinh.mjs (g) đường cong cả mùa 2, (h) 20 chương × 10 màn + trùm có huy hiệu vector riêng; lỗi giả 8 / 8 |
| f8ad93a | Việc 2: gói 1 (xich, bien-xich), 4 chỗ |
| 2e8a7ff | Việc 2: gói 2 (sung-hoi, tham-so), 4 chỗ |
| a108737 | Việc 2: gói 4 (bang-chuyen, che-sung-hoi), 8 chỗ, mùa 2 hết chỗ nhảy |
| 329189a | Việc 4: mở mùa 2 "Ghi nhớ", ngưỡng sao khai cứng |
| (commit báo cáo này) | báo cáo |

Phanh (việc 3) làm trước việc 2 để đo tiến độ: (g) đỏ 19 chỉ số ở 0e2ac0c → 0 ở a108737.

### Trùm bien-xich.10 "Trùm: Đếm để về đúng hàng" (man-bien-xich.js, mã bien-xich.1)
- Xe xích không tay, mắt khoảng cách ở mũi (chỉ `front_clear()`); khay: bánh xích + `front_clear`; `cauTruc` for / if / while, `bienDem`; hàm cần: move, back, sidestep, spin.
- Ba sân CÙNG MỘT phòng hai làn × 5 hàng `#..#` (10 ô); xe xuất phát làn trái ở hàng 2, 4, 3 (từ trên), mặt quay lên; xe mờ ở cùng hàng làn phải, mặt quay xuống;
  ô ◆ (bongMo.diQua) ở đầu làn trái. `nhipTheo: 'tong'`.
- Lời giải (8 dòng, 22 ô, 45 nhịp = 13 + 17 + 15, 3 sao):
  `n = 0` / `while front_clear():` / `    move()` / `    n = n + 1` / `sidestep()` / `spin()` / `for i in range(n):` / `    move()`.
  Lời giải khác (thêm chú thích) 2 sao; công thức khác (lùi n ô bằng back() rồi spin) thắng 2 sao; mã mẫu (lên rồi né) thua; 4 lời sai thua `lech-bong-mo`.
- Vì sao lời không biến không 3 sao (kiem-bien-xich.mjs chứng minh):
  1. ba sân y hệt nhau, chỉ hàng xuất phát khác; ô ◆ buộc xe lên tới tường. Không có ◆ thì `sidestep(); spin()` thắng cả ba sân (tôi gặp lỗ này khi thử và đã chặn);
  2. BFS chung ba sân trên nhịp xích thật (do-duong-che-xich.mjs): duyệt hết 2380 trạng thái, KHÔNG dãy lệnh gốc cố định nào (dài bao nhiêu cũng vậy) thắng cả ba sân;
  3. bảy lời không biến tiêu biểu đều thua: không lên (`chua-qua-diem`), lên rồi đi tới đáy, về cứng 2 / 3 / 4 ô, tới đáy rồi lên cứng 1 ô (`lech-bong-mo`), phân nhánh `if` lồng viết cứng theo từng sân (`tran-khung`, 20 dòng > khung 10).
- Huy hiệu `bien-xich` có hình vector riêng ở huy-hieu-vector.js (xe xích đi lên, khối "n+1", mũi tên); `coHinhRieng('bien-xich')` = true.

### 16 chỗ nhảy · cách xử lý · số đo sau (dòng / nhịp / ô; mốc sau sửa)

| Chỗ (brief) | Cách | Sau |
|---|---|---|
| xich.2 sau xich.1: dòng 2→7 | b: xe quay trước rồi đi (sân `....F` một làn) | 5 / 6 / 5 sau xich.1 2 / 6 / 7 |
| xich.3 sau xich.2: dòng 7→11 | b: một khúc quẹo thay hai | 8 / 8 / 7 sau 5 / 6 / 5 (xich.4 12 / 12 / 8 vẫn trong lề) |
| xich.9 sau xich.8: ô 11→20 | b: bỏ hai hàng giữa đường dài (đường bậc thang y nguyên, vẫn chậm hơn: 19 so với 13 nhịp) | 7 / 13 / 16 |
| che-xich.6 (bien-xich.3) sau che-xich.2: nhịp 5→10 | a: che-xich.8 lên trước che-xich.6 (bien-xich 1, 2, 8, 6, …) + thu sân 5 × 5 của che-xich.1, .2, .6 còn 3 × 3 (mốc xich.9 nhỏ lại) | che-xich.8 6 / 7 / 6, che-xich.6 3 / 10 / 9 |
| sung-hoi.6 sau sung-hoi.5: ô 7→25 | b: tường quanh hai làn thùng trượt (lời giải không đổi) | 5 / 3 / 6 |
| sung-hoi.9 sau sung-hoi.8: dòng 4→8 | a: sung-hoi 1–6, 9, 7, 8, 10 | 8 / 6 / 8 sau sung-hoi.6 5 / 3 / 6 |
| tham-so.1 sau sung-hoi.9: nhịp 6→11 | a (cùng thứ tự trên): mốc thành sung-hoi.8 | 7 / 11 / 10 sau 4 / 8 / 9 |
| tham-so.5 sau tham-so.4: ô 10→17 | b: bỏ hàng cuối, forward(4) → forward(3) | 9 / 19 / 16 |
| bang-chuyen.2 sau .1: nhịp 4→10 | b: dải băng ngược 5 → 4 ô | 2 / 8 / 6 |
| bang-chuyen.3 sau .2: dòng 2→9, ô 7→20 | a: bang-chuyen 1, 2, 6, 5, 7, 8, 3, 4, 9, 10 (bc.3 sau bc.8) | 9 / 11 / 20 sau 8 / 20 / 17 |
| bang-chuyen.4 sau .3: ô 20→35 | b: ô xe không tới thành tường (lời giải không đổi) | 5 / 9 / 27 sau bc.3 |
| bang-chuyen.8 sau .7: nhịp 15→26, ô 11→23 | b: ba hàng băng 7 → 5 ô (lặp 3, 6, 3) | 8 / 20 / 17 sau bc.7 5 / 15 / 11 |
| che-sung-hoi.1 sau bang-chuyen.9: ô 8→25 | b: phòng 3 × 3 + hai ô đầu cột giữa | 2 / 1 / 11 sau bc.9 6 / 12 / 8 |
| che-sung-hoi.4 sau .3: ô 7→25 | b: tường, còn chữ thập (làn thùng trượt) | 4 / 3 / 7 |
| che-sung-hoi.6 sau .5: ô 6→25 | b: như trên | 4 / 6 / 7 |
| che-sung-hoi.9 sau .8: dòng 4→8, nhịp 3→8 | a: che-sung-hoi 1–6, 8, 7, 9, 10 (sau che-sung-hoi.7 6 / 4) + tường | 8 / 8 / 6 |

Thu sân thêm (không có trong 16 chỗ, nhưng thu một màn thì màn kế 25 ô thành chỗ nhảy mới): che-sung-hoi.2, .7, .8 (cùng kiểu chế lệnh một dòng 5 × 5).
Màn sửa bằng `sua()` (nội dung bản 2, đo lại sao `node tools/do-lo-trinh.mjs --ghi-sao`, lo-trinh-sao.js thêm 6 mục): xich.2, xich.3, xich.9, tham-so.5, bang-chuyen.2, bang-chuyen.8.
Màn chỉ thêm tường (lời giải / nhịp / bóng mờ không đổi, không đo lại): che-xich.1, .2, .6, sung-hoi.6, bang-chuyen.4, che-sung-hoi.1, .2, .4, .6, .7, .8, .9.
Mọi màn sửa: lời giải 3 sao, lời giải khác 2 sao, công thức khác thắng, lời sai đủ mã `phaiCoMa` (soát bằng máy chấm thật, cộng kiem-hoc 6715 đạt).

### Đường cong 20 chương sau sửa (dòng / nhịp / ô theo `so` 1–10; **đậm** = trùm, miễn đo)

| # | Gói / chương | Màn 1 … 10 |
|---|---|---|
| 1 | xich / xich | 2/6/7 · 5/6/5 · 8/8/7 · 12/12/8 · 8/13/10 · 8/13/10 · 8/11/8 · 8/16/11 · 7/13/16 · **9/23/10** |
| 2 | xich / bien-xich | 2/4/9 · 3/5/9 · 6/7/6 · 3/10/9 · 6/8/6 · 6/8/6 · 8/12/6 · 9/9/5 · 11/12/7 · **8/45/10** |
| 3 | sung-hoi / sung-hoi | 3/3/6 · 3/3/5 · 4/4/7 · 2/1/5 · 4/2/7 · 5/3/6 · 8/6/8 · 4/6/7 · 4/8/9 · **10/6/12** |
| 4 | sung-hoi / tham-so | 7/11/10 · 7/12/11 · 7/11/12 · 8/15/10 · 9/19/16 · 10/23/14 · 8/22/19 · 7/17/13 · 7/16/14 · **9/31/21** |
| 5 | hong-ngoai / hong-ngoai | 5/11/10 · 4/15/13 · 4/11/10 · 4/10/15 · 5/11/16 · 6/16/21 · 5/24/30 · 6/18/27 · 8/18/9 · **6/31/15** |
| 6 | hong-ngoai / che-hong-ngoai | 2/11/10 · 2/11/13 · 4/11/17 · 6/16/8 · 2/11/14 · 3/11/17 · 6/16/8 · 2/11/14 · 5/15/14 · **5/26/10** |
| 7 | nha-may / bang-chuyen | 2/4/7 · 2/8/6 · 5/11/10 · 6/10/9 · 5/15/11 · 8/20/17 · 9/11/20 · 5/9/27 · 6/12/8 · **8/25/11** |
| 8 | nha-may / che-sung-hoi | 2/1/11 · 2/1/11 · 4/5/7 · 4/3/7 · 5/6/6 · 4/6/7 · 4/3/8 · 6/4/7 · 8/8/6 · **5/13/16** |
| 9 | day-thung / day-thung | 2/2/5 · 2/5/7 · 4/6/6 · 4/7/6 · 6/10/7 · 5/10/12 · 4/7/8 · 5/11/12 · 5/7/8 · **5/24/11** |
| 10 | day-thung / che-day-thung | 1/11/13 · 3/16/17 · 5/12/8 · 5/12/8 · 1/14/11 · 2/21/12 · 3/13/15 · 3/18/16 · 3/20/15 · **3/63/13** |
| 11 | luc-ban / luc-ban | 4/5/8 · 4/4/7 · 7/7/12 · 2/7/12 · 2/5/8 · 5/6/11 · 4/6/8 · 4/7/11 · 4/7/11 · **3/16/9** |
| 12 | luc-ban / che-luc-ban | 4/7/12 · 3/9/11 · 4/9/13 · 3/13/15 · 3/16/17 · 2/12/11 · 3/17/17 · 2/6/11 · 3/9/11 · **6/52/18** |
| 13 | do-nhiet / do-nhiet | 5/13/12 · 5/12/11 · 5/14/16 · 6/18/11 · 2/18/17 · 2/20/14 · 4/25/13 · 2/14/15 · 2/14/9 · **5/37/16** |
| 14 | do-nhiet / che-do-nhiet | 2/14/9 · 3/17/11 · 2/13/12 · 3/14/16 · 2/18/17 · 3/19/11 · 3/25/13 · 3/17/17 · 3/14/16 · **5/45/12** |
| 15 | doi-mua-2 / doi-mua-2 | 2/20/24 · 2/26/33 · 2/27/18 · 4/27/27 · 2/16/21 · 2/24/31 · 2/15/16 · 3/15/18 · 2/14/14 · **2/34/15** |
| 16 | doi-mua-2 / che-doi-mua-2 | 2/15/19 · 2/13/21 · 2/16/13 · 2/16/18 · 2/24/27 · 2/15/18 · 3/17/18 · 2/22/27 · 2/14/14 · **2/44/27** |
| 17 | be-sung / be-sung | 4/6/8 · 4/5/9 · 5/8/10 · 8/11/8 · 6/15/14 · 4/20/19 · 6/14/10 · 4/8/10 · 4/11/12 · **8/63/21** |
| 18 | be-sung / che-be-sung | 3/15/14 · 3/14/14 · 3/21/19 · 2/20/19 · 3/27/25 · 3/34/28 · 2/25/23 · 5/34/20 · 2/15/15 · **8/77/31** |
| 19 | nha-may-chay / tong-hop-2 | 3/5/7 · 4/6/9 · 3/8/10 · 2/10/14 · 3/9/9 · 2/11/12 · 1/16/15 · 1/20/21 · 1/10/11 · **3/28/13** |
| 20 | nha-may-chay / trum-mua-2 | 2/15/10 · 2/18/15 · 5/14/11 · 2/21/13 · 3/19/19 · 2/19/17 · 2/22/11 · 5/12/11 · 2/12/12 · **5/54/24** |

Mùa 2: 200 màn (20 × 10), 0 chỗ nhảy theo luật đo.

### Ngưỡng sao 10 gói mùa 2 (khai cứng trong MUA_2, goi2 chép `sao`)
xich 0 · sung-hoi 30 · hong-ngoai 60 · nha-may 90 · day-thung 120 · luc-ban 150 · do-nhiet 180 · doi-mua-2 210 · be-sung 240 · nha-may-chay 270
(= `Math.floor(0,5 × tổng sao tối đa các gói trước / 5) × 5`, mỗi gói 20 màn × 3 = 60 sao; MoGoi.dsMua() trong Node trả `saoCan` đúng dãy này.)

### Màn chọn gói sẽ hiện mùa 2 thế nào (đọc man-goi.js / mo-goi.js, chưa xem trình duyệt)
- `muaHien()` lọc `!mu.an`: mùa 2 nay có tab / nút mùa "Ghi nhớ" cạnh "Xưởng R1" (mùa 3, 4 vẫn ẩn, chỉ hiện khi "Mở hết").
- Mùa 2 có `ban` mà người chơi chưa mua: nút mùa không có ổ khoá (`!mo && !ban` mới gắn lock), bấm vào vẫn xem được các hộp gói; gói có lyDo 'chua-mua';
  khung `g-ban` hiện nút mua thử `mua.nutBan` ("Ghi nhớ", 49.000đ), chưa nối thanh toán thật. Mùa 2 không có điều kiện `mo`, nên mua xong là gói 1 (0 ★) mở ngay.
- Luật mua / khoá không đổi.

### Lệnh kiểm + output nguyên văn (HEAD 329189a, từng lệnh một)
```
node hoc/kiem-lo-trinh.mjs                    ĐẠT 897 kiểm tra lộ trình xuất bản.
node hoc/kiem-lo-trinh.mjs --loi-gia-mua-2    Lỗi giả mùa 2: HỎNG 8 / 8 mục (a)–(h).
node hoc/kiem-che-xe.mjs                      ĐẠT 271 · HỎNG 0
node hoc/kiem-xich.mjs                        ĐẠT 137 · HỎNG 0
node hoc/kiem-sung-hoi.mjs                    ĐẠT 187 · HỎNG 0
node hoc/kiem-tham-so.mjs                     ĐẠT 113 · HỎNG 0
node hoc/kiem-bang-chuyen.mjs                 ĐẠT 87 · HỎNG 0
node hoc/kiem-che-sung-hoi.mjs                ĐẠT 209 · HỎNG 0
node hoc/kiem-che-xich.mjs                    ĐẠT 237 · HỎNG 0
node hoc/kiem-che-cam-bien.mjs                ĐẠT 224 · HỎNG 0
node hoc/kiem-robot-hoan-thien.mjs            ĐẠT 181 · HỎNG 0
node hoc/kiem-luc-ban.mjs                     ĐẠT 104 · HỎNG 0
node hoc/kiem-day-thung.mjs                   ĐẠT 108 · HỎNG 0 kiểm tra 20 màn gói Đẩy thùng.
node hoc/kiem-trum-mua-2.mjs                  ĐẠT 107 · HỎNG 0 kiểm tra 20 màn gói Nhà máy chạy lại.
node hoc/kiem-huy-hieu-phim-vector.mjs        ĐẠT 12 · HỎNG 0 kiểm
node hoc/kiem-ve-vector.mjs                   ĐẠT 98 · HỎNG 0 kiểm
node hoc/kiem-bang-mau.mjs                    ĐẠT 16 · HỎNG 0 kiểm
node hoc/kiem-phim-goi.mjs                    ĐẠT 41 · HỎNG 0
node hoc/kiem-goi.mjs                         ĐẠT 56 · HỎNG 0
node hoc/kiem-hoc.mjs                         ĐẠT 6715 · HỎNG 0
node hoc/kiem-bien-xich.mjs (mới)             ĐẠT 26 · HỎNG 0 kiểm
node hoc/kiem-goi-doi.mjs                     ĐẠT 979 · HỎNG 0
node tools/do-lo-trinh.mjs                    PASS 835 canonical solutions; 137 revised star thresholds.
```
Không còn máy nào đỏ nên không phải chạy lại ở 5b731f1. Hai lần đỏ giữa chừng là do chính tôi gây ra, đã sửa: A7 của kiem-huy-hieu-phim-vector (mã huy hiệu mới ngoài bản chụp pixel) và kiem-phim-goi (tôi chèn `sao:` giữa `ten` và `loai`, regex GOI_MUA_2 không đọc được loai; đã dời `sao:` ra sau).

## 2 CÂU HỎI CẦN LÀM RÕ
1. **Điểm tạo nhánh:** worktree mở ở 5b731f1 (không có brief); tôi tạo `claude/mua-2-xong` ở e1be1ff (con của 5b731f1, chỉ thêm brief + sổ canh). Đảo được: cherry-pick các commit lên 5b731f1 nếu cần.
2. **"Đếm nhịp quay"** (ý kế hoạch) tôi hiểu là đếm bước bằng biến trên xe xích (biến đếm n như cả chương), không phải đếm số nhịp quay. Trùm đếm bước đi lên rồi về đúng n ô. Muốn trùm đếm nhịp quay thật thì phải viết lại màn.
3. **Ngoài phạm vi ghi trên giấy, đã làm, ghi rõ:**
   - Tạo tệp mới `hoc/kiem-bien-xich.mjs` (brief đòi chứng minh bằng máy kiểm; `npm test` tự gom mọi kiem-*.mjs).
   - Sửa `hoc/kiem-huy-hieu-phim-vector.mjs` A7: thêm `MOI_SAU_CHUP = ['bien-xich']`. Các mã khác vẫn phải y hệt bản chụp pixel, mã mới phải có hình vector riêng.
   - `hoc/lo-trinh-sao.js` được `tools/do-lo-trinh.mjs --ghi-sao` ghi lại (thêm 6 mục), đúng cách P0 đã làm.
   - lo-trinh-hoc.js NGOÀI khối MÙA 2: sửa một dòng `san` trong `thay('che-sung-hoi.7', …)` ở cuối tệp (lệnh đó đặt lại sân sau khối mùa 2 nên sửa trong khối không có tác dụng). Đây vẫn là màn mùa 2.
4. **Lỗi có sẵn tìm thấy và đã sửa:** che-xich.2 (bien-xich.2) có lời giải khác gọi `forward(1)`, mà hàm có tham số chỉ có từ gói 2, nên ở gói 1 nó được 0 sao (`ham-chua-co`). Mục (c) của kiem-lo-trinh không soi lời giải khác nên không bắt. Tôi thay bằng "thêm một dòng chú thích" (2 sao).
5. **Đổi ý bài nhẹ:**
   - xich.3 còn một khúc quẹo nên mất lời sai "không dùng hàm thì tràn khung". Viết thẳng giờ chỉ 7 dòng, nên hàm tr_right() được đòi bằng đề bài và `taoHam` chứ không bằng khung.
   - bang-chuyen.3 "Chọn cột băng" và bang-chuyen.4 "Trôi lệch" (trước ở làm quen / luyện) thành màn 7–8 (biến thể).
   - Đề bài các màn đổi thứ tự không đổi chữ. Tôi đã đọc lại, không thấy câu nào nhắc màn trước theo thứ tự cũ, nhưng người giao nên đọc lại khi soát.
6. **Brief:** số đo đúng (199 màn, 16 chỗ / 19 chỉ số khớp từng con số). Brief có một chỗ thiếu: thu sân của một màn chế lệnh 5 × 5 làm màn kế (cũng 5 × 5) thành chỗ nhảy mới. Vì vậy phải thu cả chuỗi (che-xich.1, .2, .6; che-sung-hoi.1, .2, .4, .6, .7, .8, .9) và gỡ lệnh ghi đè ở `thay()`.
7. **Luật ô ở màn chế lệnh một dòng:** không vô lý đến mức phải sửa luật, vì thu sân bằng tường không đổi gì cho người chơi. Nhưng sân 5 × 5 trống không làm bài khó hơn, nên luật đo đang đếm "kích thước phòng" chứ không đo độ khó (xem đề xuất 1).
8. **GitNexus:** tôi không chạy `impact`; tôi dùng grep thay thế (thứ tự bien-xich, 'Địa hình', `an: true`, `.an`). Mọi thay đổi ở lo-trinh-hoc.js / thu-tu-chuong.js là dữ liệu (mảng MUA_2, mục mùa), không đổi chữ ký hàm nào.

## 3 ĐỀ XUẤT

**Đề xuất 1. Luật ô với màn chương trình chính khóa một dòng.** Vấn đề: sân 5 × 5 trống bị tính 25 ô dù xe chỉ đi 0–2 ô, nên phải xây tường cho qua luật.

| | A: miễn đo ô cho màn `chinhCoDinh` một dòng | B: đo ô = số ô xe đi qua trong lời giải | Để nguyên (xây tường như lần này) |
|---|---|---|---|
| Làm gì | thêm một điều kiện ở (g) và các máy kiểm gói | đổi hàm đo ở (g) và mọi kiem-gói (dùng vết lời giải) | không làm gì |
| Mất bao lâu | 15 phút | 1–2 giờ | 0 |
| Mức ảnh hưởng | nhỏ, chỉ máy kiểm | vừa, mọi máy kiểm đường cong | không |
| UI trước → sau | không đổi | không đổi | đã đổi: phòng 3 × 3 / chữ thập thay sân trống |
| Người chơi thấy khác gì | không | không | sân gọn hơn, ít ô trống |
| Lợi ích | luật khớp ý "khó dần" | đo đúng độ khó đường đi | không tốn công |
| Rủi ro | lọt màn sân to thật | sân rộng nhưng đường ngắn lọt luật | gói sau lại phải xây tường |

Ưu tiên thấp, tôi nghiêng về để nguyên: tường vừa rẻ vừa làm sân dễ đọc hơn.

**Đề xuất 2. Mục (c) của kiem-lo-trinh soi cả lời giải khác / công thức khác / lời sai.** Vấn đề: che-xich.2 lọt `forward(1)` trước gói 2 suốt từ P0.

| | A: (c), (b), (e) duyệt thêm loiGiaiKhac, congThucKhac | Để nguyên |
|---|---|---|
| Làm gì | thêm các bài đó vào `dongBacCau` | không |
| Mất bao lâu | 20 phút + sửa các chỗ đỏ lộ ra | 0 |
| Mức ảnh hưởng | máy kiểm; có thể lộ vài lời sai cố ý dùng hàm chưa học (phải loại trừ) | không |
| UI trước → sau | không | không |
| Người chơi thấy khác gì | lời giải khác ở bảng thắng luôn chạy được | có thể thấy lời giải khác 0 sao |
| Lợi ích | chặn tái phát | |
| Rủi ro | lời sai cố ý (`ham-chua-co`) bị báo nhầm | lỗi cùng kiểu lọt tiếp |

Ưu tiên vừa, tôi nghiêng về A (chỉ loiGiaiKhac và congThucKhac, không đụng lời sai).

**Đề xuất 3. Soát chữ các màn đổi thứ tự trong trình duyệt** (bien-xich, sung-hoi, bang-chuyen, che-sung-hoi). Việc này người giao làm khi soát 200 / 200 màn: đọc đề có câu nào nói "như màn trước" mà màn trước nay đã khác không. Tôi không thấy câu nào như vậy, nhưng chưa xem trình duyệt.

## 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Mùa 2 "Ghi nhớ" nay đủ 200 màn: 10 gói, mỗi gói 2 chương, mỗi chương 10 màn, màn cuối mỗi chương là màn trùm có huy hiệu riêng.
Chương "Biến cho xích" trước thiếu một màn; nay có màn trùm mới. Xe xích phải đếm số bước đã đi để quay về đúng hàng ở ba căn phòng giống nhau, chỉ khác chỗ đứng ban đầu, nên không đếm thì không qua được.
Ở ba gói đầu có 16 chỗ màn sau khó vọt hơn màn trước quá nhiều. Tôi đã sắp lại thứ tự vài màn, làm ngắn vài đường đi và xây tường quanh mấy sân trống to, để mỗi màn chỉ khó hơn màn trước một chút.
Có thêm một bộ kiểm tra tự động. Từ nay nếu ai làm màn khó vọt lên, hoặc một chương thiếu màn hay thiếu huy hiệu, máy báo đỏ ngay.
Mùa 2 giờ hiện ở màn chọn gói với tên "Ghi nhớ". Số sao cần để mở từng gói là 0, 30, 60, … tới 270, giống mùa 1, và được ghi cố định để sau này thêm màn không làm đổi.
Mùa 2 vẫn là mùa bán (49.000đ, mua thử), luật mua không đổi.

## 5 RỦI RO CÒN LẠI
- **Chưa xem trình duyệt:** chưa xem màn chọn gói với tab "Ghi nhớ", màn trùm mới, huy hiệu mới, và các sân đã xây tường (xem có đẹp, có dễ đọc). Cách kiểm: người giao mở cổng 4181, soát 200 / 200 màn như mùa 1 (nạp lời giải chuẩn, bấm Chạy), xem huy hiệu bien-xich ở bảng huy hiệu.
- **Chưa chạy `npm test` cả bộ** (theo luật RAM). Tôi chỉ chạy 23 lệnh ở mục 1. Cách kiểm: người giao chạy `npm test` sau khi gộp.
- **Lưu sao cũ:** các màn sửa lời giải (xich.2, .3, .9, tham-so.5, bang-chuyen.2, .8) có ngưỡng sao mới. Người đã có sao ở bản cũ vẫn giữ sao (khóa theo `ma` không đổi), nhưng bảng thắng sẽ so với ngưỡng mới. Mùa 2 trước đó ẩn nên rủi ro thấp.
- **Phạm vi chứng minh "không biến thì không 3 sao":** chứng minh ở trùm chỉ trọn vẹn với dãy lệnh cố định (BFS). Với chương trình có cảm biến mà không biến, tôi mới thử bảy lời tiêu biểu, chưa vét hết; về lý thuyết vẫn có thể có một lời ngắn khéo tôi chưa nghĩ ra. Cách kiểm: người giao hoặc một agent khác thử phá trùm; nếu cần chắc hơn, dò hết các chương trình không biến tới 10 dòng.
- **Ngôn ngữ đề bài:** đề / gợi ý / lời sai của trùm và các màn sửa do tôi viết, chưa ai đọc lại. Tôi không dùng emoji, không dùng gạch dài trong chữ hiển thị.
