# Kế hoạch viết lại mùa 8 Hang động (2/11/2026, CHỜ USER DUYỆT)

Nhánh `claude/mua-8-hang-dong` (worktree `.claude/worktrees/mua-8-hang-dong`), tách từ main 8ef2188.
User 2/11: "viết lại cả mùa"; phiên này tự làm (không agent); phạm vi **giao diện nhập liệu + vẽ sân / thẻ part + 200 màn**. Phim gói mùa 8 không thuộc phạm vi (để phiên phim CLB).
Khuôn: [KE-HOACH-PART-DUNG-MUA.md](KE-HOACH-PART-DUNG-MUA.md) (gói 8 yếu tố cũ, 9 đội R2 part cũ, 10 một mình nhiều sân), bảng mùa 8 ở [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md).

## 1. Vì sao viết lại (soát 2/11 trên main)

Bản PDM8 (agent viết, 3f95b35 → e49ddd5) chỉ xong lõi `san-hoc.js` và dữ liệu màn: 200/200 lời giải thắng 3 sao, `kiem-mua-hang.mjs` 14/14. Nhưng trong game:
- **Không nhập được.** Khay không có khối từ điển / tập hợp; dòng `d["b"] = 1` vẽ thành chữ trơn, không chạm sửa được. Ô số chỉ biết `distance()` (thanh-phan.js `CAM_BIEN_TEN`), không có `hear()` / `listen()`.
  Khoảng 49 màn bắt em tự gõ dòng loại này: kẹt hẳn.
- **Không thấy đồ vật.** Bộ vẽ không đọc `ngachHang` (33 màn), `chuongDa` (86), `daChuong` (74): đề nói có chuông đá mà sân trống.
- Thẻ part Loa, Mic mượn hình robot; phim gói là màn đen; 91 màn thiếu lời sai thứ hai, 18 lời sai báo nhầm.

Bài học thành luật cho lần này (mục 6): **mọi dòng của mọi lời giải và mã mẫu phải lắp được bằng khay của chính màn đó**, có máy kiểm chặn; **mọi trường của màn phải có hình**, có máy kiểm chặn; soát gói nào xong gói đó trên trình duyệt.

## 2. Luật chơi (giữ lõi PDM8, đổi tối thiểu)

| Thứ | Luật (đã có trong san-hoc.js) | Hình cần vẽ |
|---|---|---|
| Thân **Bánh gai** `gai` | lệnh như hai bánh: `left_move` `right_move` `left_back` `right_back` `wait`; hàm kho cũ (`move`, `forward`, `turn_*`) dùng lại; bung gai thì bám ô đá ướt | có (thân xe gai), thiếu thẻ part riêng |
| Sàn **đá vôi ướt** `I` | xe bánh thường bước vào thì trượt hết dải; bánh gai bám từng ô | có |
| **Hố sụt** `u` | rơi là thua | có |
| Tay **Loa** | `note(n)` phát nốt 1–8 trong nhịp (vừa đi vừa phát được); mỗi nhịp một nốt | thiếu: loa gắn xe, sóng âm khi phát |
| **Đá chuông** `daChuong {x, y, not, ben}` | khối chặn đường; phát đúng `not` **ben nhịp liên tiếp** trong tầm 3 ô (hay tia thẳng từ mũi xe) thì vỡ; sai nốt / nghỉ một nhịp thì đếm lại | **thiếu**: khối thạch nhũ có số nốt + ben vạch rung dâng dần, vỡ |
| Cảm biến **Âm thanh** | `hear()` = số ô (Manhattan) tới chuông đá gần nhất | thiếu: mic gắn xe |
| **Chuông đá** `chuongDa {x, y, not}` | nhũ đá treo tự ngân nốt riêng; là nguồn để `hear()` / `listen()` đo | **thiếu**: nhũ đá treo + vòng sóng + số nốt |
| **Ngách hang ngầm** `ngachHang [{a, b}]` | bước vào cửa a thì chui ra b trong cùng nhịp (hai chiều) | **thiếu**: hai cửa hang cùng màu, mỗi cặp một màu |
| Nâng cấp **Thu gai** | `retract_spikes()` thu gai: lướt hết dải `I` trong 1 nhịp (tiết kiệm nhịp), cuối dải là hố thì rơi; `extend_spikes()` bung lại để bám | hình gai thu / bung |
| Nâng cấp **Ngân dài** (bảng cũ: "Phát nốt") | `beat(n)` cho nốt đang phát ngân thêm n nhịp, bánh vẫn đi được: vừa tiến vừa làm đá rung | sóng ngân kéo dài |
| Nâng cấp **Nghe nốt** | `listen()` = nốt của chuông đá gần nhất (trong 6 ô) | mic nâng cấp |

Đề xuất đổi tên gói 6 "Phát nốt" → **"Ngân dài"**: loa gốc ở gói 2 đã phát nốt, nên "Phát nốt" không phải điều mới (câu hỏi 1).

## 3. Python và các dạng câu khay phải lắp được

Python A (gói 1 chương 2) **từ điển**, Python B (gói 2 chương 2) **tập hợp**. Chỉ dùng các dạng dưới; dạng nào chưa có trong khay thì làm ở P1 trước khi viết màn.

| Dạng câu | Ví dụ | Trong khay (P1) |
|---|---|---|
| tạo từ điển | `d = {"ngang": 3, "doc": 2}` | khối mới nhóm TỪ ĐIỂN; chạm khoá → chọn tên, chạm giá trị → bảng số, "thêm cặp" / "bỏ cặp" (như ô danh sách) |
| đọc từ điển làm số | `forward(d["ngang"])`, `note(d[k])` | ô số có thêm chip `d["…"]` theo khoá của từ điển ở trên (như `a[i]`) |
| gán một khoá | `d["doc"] = 4` | khối mới; chạm khoá, chạm số |
| duyệt khoá | `for k in d:` | như `for n in a:` |
| tra có không | `if k in d:` | điều kiện mới |
| tạo tập hợp | `s = set()`, `s = {3, 5}` | khối mới nhóm TẬP HỢP (ô phần tử như danh sách) |
| thêm vào tập | `s.add(n)` | như `a.append(n)` |
| có trong tập không | `if n in s:` / `if n not in s:` | điều kiện mới |
| đếm | `len(s)`, `len(d)` | chip số (như `len(a)`) |
| số từ cảm biến âm thanh | `forward(hear())`, `while hear() > 0:`, `if hear() == 1:`, `n = hear()` | như `distance()`: chip số, điều kiện so sánh, gán biến |
| nốt nghe được | `note(listen())`, `n = listen()`, `play_note(listen())` | chip số `listen()` (sau gói 7) |

Không dùng trong mùa 8: `d.get`, `.items()`, `del`, `.remove`, từ điển lồng, khoá là số tự do, phép trên tập (`|`, `&`). Thứ tự duyệt tập hợp không dùng (Python không hứa thứ tự).

## 4. Mười gói

Mã gói / chương giữ như PDM8 (mùa 9 và lưu tiến độ trỏ vào). Tên hiển thị theo quy tắc đặt tên (tên chương = việc làm, tạo hàm thì "Chế lệnh: …").

| Gói | Chương 1 (10 màn) | Chương 2 (10 màn) | Điều mới | R1 / R2 |
|---|---|---|---|---|
| 1 Bánh gai `banh-gai` | `banh-gai` **Bám đá ướt**: màn 1 xe bánh thường trượt (chỉ chạy) rồi bánh gai bám; lệnh bánh, hàm kho; hố sụt | `tu-dien` **Sổ tay đường hang**: từ điển (tạo, đọc, sửa giá trị, gán khoá, duyệt khoá, hàm nhận từ điển) | thân, `I`, `u`, dict | R1 bánh gai |
| 2 Loa `loa` | `loa` **Gõ đá chuông**: `note(n)`; đá chuông ben 1 → ben 2–3 (lặp `for`); phát điệu báo hiệu ở cờ | `tap-hop` **Không gõ trùng**: tập hợp (`set()`, `add`, `in`, `not in`, `len`) | tay loa, đá chuông, set | + loa |
| 3 Âm thanh `am-thanh` | `am-thanh` **Nghe tiếng vang**: chuông đá, `hear()` làm số, `while hear() > 0` | `che-am-thanh` **Chế lệnh: dò tiếng vang** (`go_echo` …) | cảm biến, chuông đá | + mic |
| 4 Ngách hang `san-hang-dong` | `san-hang-dong` **Chui ngách ngầm**: một cặp → nhiều cặp màu; ngách + hố + đá chuông | `che-hang-dong` **Chế lệnh: vượt ngách** | ngách hang ngầm | cỗ máy mùa |
| 5 Thu gai `thu-gai` | `thu-gai` **Lướt đá ướt**: thu / bung gai, lướt tiết kiệm nhịp, dừng kịp trước hố | `che-thu-gai` **Chế lệnh: lướt rồi bám** (`slide_stop`, `glide_step`, `glide_tunnel`, `echo_glide`) | nâng cấp thân | |
| 6 Ngân dài `phat-not` | `phat-not` **Vừa đi vừa ngân**: `beat(n)`, đá ben lớn, nhiều khối khác nốt | `che-phat-not` **Chế lệnh: tấu phá đá** (`play_note`, `crack_glide` …) | nâng cấp loa | |
| 7 Nghe nốt `nghe-not` | `nghe-not` **Bắt nốt chuông đá**: `listen()`; đá chuông cùng nốt với chuông cạnh nó, mỗi sân một nốt (không viết cứng được) | `che-nghe-not` **Chế lệnh: giải mã giai điệu** (dict nốt → hướng, set nốt đã nghe; `crack_tunnel`, `decode_glide`, `listen_unique_step`) | nâng cấp cảm biến | |
| 8 Hang có dấu cũ `hang-cu` | `hang-cu` xe hang động gặp yếu tố mùa 1–7 trong hang (thùng gỗ, nút đè + cửa, băng chuyền, đệm từ, dòng nước, sàn màu, tảng đá tròn / sàn dốc / bàn xoay: chọn loại lõi chạy được với bánh gai, đo ở P0) | `che-hang-cu` chế lệnh cho các cảnh đó | yếu tố cũ | |
| 9 Đội thám hiểm `doi-hang-dong` | `doi-hang-dong` R2 của Luna = **máy khai thác đá mùa 7** (omni, máy ném, radar): R2 ném đá lấp hố sụt cho R1, R1 phá đá chuông mở lối cho R2 | `che-doi-hang-dong` chế lệnh phối hợp (`fill_for_mate`, `crack_for_mate`) | đội | R2 mùa 7 |
| 10 (tên mốc truyện, vd "Cứu hộ hang sâu") `tong-hop-hang` | `tong-hop-hang` mỗi màn 2–3 sân ("mỗi ngày nước rút khác"), một chương trình đúng mọi sân | `trum-mua-hang` hàm + trùm mùa (`echo_crack_step`, `crack_switch`, `tunnel_crack_glide`) | nhiều sân | R1 một mình |

Mỗi chương: màn 1–3 làm quen (màn 1 của mỗi khối / part / vật mới là **màn trình diễn** `chiChay`), 4–6 luyện, 7–9 biến thể, 10 trùm chương.
Màn ngay sau màn trình diễn **ép dùng khối mới** (giấu lệnh cũ lách được + hướng dẫn chỉ đúng chỗ), có bộ dò chứng minh.

**Hàm mùa 9 đang gọi** (phải còn, cùng tên, cùng tham số, cùng việc): `play_note(n)` (51 màn), `echo_crack_step` (10), `glide_tunnel` (6), `go_echo` (5), `slide_stop` (5),
`echo_glide` (3), `fill_for_mate` (3), `tunnel_crack_glide` (3), `crack_for_mate`, `decode_glide`, `listen_unique_step`, `crack_tunnel`; kèm hàm chúng gọi (`glide_step`, `crack_glide`, `crack_switch`, `aim_lob`, `slide_r`).
Gói ghi ở bảng trên là chỗ dạy đầu tiên; nếu thân hàm đổi thì sửa luôn màn mùa 9 dùng nó.

## 5. Thứ tự làm (mỗi bước một commit trở lên trên nhánh này)

- **P0 · Khung + đo** (nhỏ): rút 200 màn PDM8 khỏi lộ trình (tệp `man-*.js` mùa 8 viết lại tại chỗ, giữ mã chương); đo yếu tố mùa 1–7 nào chạy được với bánh gai (gói 8) và R2 omni đi cùng bánh gai (gói 9); máy kiểm khung.
- **P1 · Khay nhập liệu**: các dạng ở mục 3 trong `thanh-phan.js` (tách dòng, ô chạm, khối mẫu, bảng chọn); **`kiem-nhap-mua-8.mjs`**: mọi dòng lời giải / mã mẫu / lời sai mùa 8 tách được thành dạng có ô chạm và khối mẫu có trên khay của màn.
  Thử tay trên trình duyệt: tạo từ điển, sửa giá trị, chèn `d["…"]` vào ô số, `s.add`, `if n not in s`, `forward(hear())`.
- **P2 · Vẽ**: chuông đá, đá chuông (số nốt, vạch ben, rung, vỡ), cửa ngách theo màu, sóng loa, gai thu / bung; thẻ part Bánh gai, Loa, Mic (+ hai nâng cấp); **`kiem-ve-mua-8.mjs`**: mọi trường vật mùa 8 có hàm vẽ.
- **P3 · Màn gói 1 → 10**: mỗi gói viết 20 màn → `kiem-man-mua-8.mjs` (3 sao đúng ngưỡng, mã mẫu chưa thắng trừ `chiChay`, ≥ 2 lời sai đúng mã chẩn đoán, chữ không gạch dài) + kiem-nhap + bộ dò lách + đường cong → **mở từng màn trên trình duyệt** → commit gói.
- **P4 · Tổng soát**: recall gói 9–10, huy hiệu, ngưỡng sao khai cứng, `npm test` cả bộ (chạy nền), soát 200/200, báo user chơi thử. Mùa 8 vẫn ẩn tới khi user cho mở.

## 6. Luật học và luật kiểm (chép từ memory, áp mọi gói)

- Đường cong mượt: mỗi màn thêm tối đa một điều mới; không nhảy vọt độ dài lời giải / nhịp / cỡ sân; không hai màn liền nhau cùng kiểu bài.
- Recall: màn gói 9–10 dùng ≥ 2 gói trước; trên gói 9 + 10 mỗi gói 1–8 được nhắc ≥ 3 lần.
- Lời: "Giúp Sola…", gợi ý của Luna, gọi người chơi là "bạn"; không chữ vũ khí; không dấu gạch dài.
- Nhập liệu: không màn nào bắt gõ dạng câu ngoài mục 3. Hình: không trường nào thiếu hình.

## 7. Câu hỏi cho user

1. Đổi tên gói 6 "Phát nốt" → "Ngân dài"? (loa gốc đã phát nốt; nâng cấp là ngân nhiều nhịp trong khi bánh vẫn chạy)
2. Đá chuông ra mắt ở gói 2 (cùng loa, để loa có việc ngay) thay vì gói 4; gói 4 còn ngách hang ngầm. Đồng ý?
3. Chuông đá ra mắt ở gói 3 (là thứ cảm biến nghe). Đồng ý?
4. R2 gói 9 là máy khai thác đá mùa 7 (bảng 9 mùa ghi "Omni + Bánh gai"). Đồng ý?
