# Ghép nhịp: hai bộ phận cùng chạy trong một nhịp cho mùa 2, 4, 5, 7 (13/11/2026, user chốt)

User 13/11: "phần mùa 1 yếu tố wait để ghép 2 bộ phận khác nhau làm khá tốt (Bánh trái + bánh phải), (nâng hạ + kẹp vào thả ra). Còn các mùa khác có vẻ k có lắm."
Đo xong user duyệt hướng làm, sửa hai chỗ (ném đà, cuộn dây), giữ móc đôi kiểu chồng, thêm ngăn xếp / hàng đợi. Chưa dựng gì; tài liệu này là đặc tả để giao việc.
User chốt thêm 13/11 (mục 7): phóng ±2 ô ở gói 10 mùa 2; cẩu quay 4 hướng + gộp nhịp; xếp container theo luật màu + số; quét lớn nhất / nhỏ nhất theo hàng ngang; `reel_in` / `reel_out`; hàm đi chéo của em tên `dir_*`.

## 0. Số đo hiện tại (`node tools/do-ghep-nhip.mjs`)

Máy đo chạy lời giải mọi màn theo lộ trình, gom lệnh gốc giữa hai mốc nhịp, đếm nhịp có từ 2 bộ phận cùng chạy (bỏ cặp hai bánh vì gói 1 mùa 1 đã dạy). Màn đội chỉ đếm R1, mùa 9 đếm mọi robot.

| Mùa | Nhịp ghép ngoài hai bánh | Màn có ghép | Ghép gì |
|---|---|---|---|
| 1 Kho hàng | 21,4% | 115/200 | nâng hạ + kẹp, nâng hạ + kẹp + xoay tay |
| 2 Nhà máy | **0%** | 0/200 | (vòi phun làm xe đứng yên: `ban-dung-yen`) |
| 3 Bãi tái chế | 4,4% | 86/200 | bước + co/duỗi chân, bước + nam châm (kèm `go_*`, không qua `wait()`) |
| 4 Cảng sông | **0%** | 0/200 | (mỗi lệnh cẩu một nhịp, không hàng chờ) |
| 5 Bến sông | **0%** | 0/200 | (lõi đã cho ghép neo / lưới + chân vịt nhưng không màn nào dùng) |
| 6 Nông trại | 16,5% | 99/200 | bước + gieo hạt (kèm `go_*`) |
| 7 Mỏ đá | **0%** | 0/200 | (ném làm xe đứng yên `nem-dung-yen`; trượt bỏ lệnh bánh `omni-khong-cheo`) |
| 8 Hang động | 19,0% | 91/200 | bánh + gai, bánh + loa |
| 9 CLB | 5,1% | 88/200 | dùng lại mùa 1, 6, 8 |

Mùa 3, 6 không nằm trong kế hoạch này (đã ghép kiểu "kèm bước").

## 1. Luật chung (giữ đúng khuôn mùa 1)

- Một nhịp: mỗi BỘ PHẬN nhận nhiều nhất một lệnh; bộ phận khác nhau chạy cùng lúc. Hai lệnh cùng bộ phận: lệnh sau bị bỏ (như `banh-goi-lai` / `tay-goi-lai`).
- Thứ tự máy làm trong nhịp CỐ ĐỊNH, thứ tự viết lệnh không quan trọng (như tay xoay: nâng → xoay → hạ → kẹp → bánh). Mỗi mục dưới đây ghi thứ tự pha.
- Cách dạy: đầu mùa "dùng thiết bị thì đứng yên"; gói nâng cấp mới mở ghép. Mỗi cơ chế ghép có màn trình diễn rồi **màn ép** (không ghép thì KHÔNG THẮNG, không chỉ mất sao); gói 8, 10 dùng lại.
- Mọi luật mới bật bằng cờ màn, nên màn cũ không khai cờ chạy y nguyên (cách làm như `xichDay`, `lucBan`, `chinhLuc`).

## 2. Mùa 2 Nhà máy (xe cứu hỏa)
- XONG 14/11 (lõi 1915467…36803b0, màn d6be3ac…f4962aa): ghì xích luc-ban.6 trình diễn / .7 ép / .9 hàm `brace_spray()`, che-luc-ban.5, .10, tong-hop-2.9; phun khi chạy che-luc-ban.6 trình diễn / .9 ép (cửa nhịp chắn tia nước); phóng trum-mua-2.8 trình diễn / .9 hàm `boost()` ép / .10 trùm. Đo: gói 6 7/20, gói 10 4/20 (chỉ tiêu 15 / 5 chưa đạt: sáu màn chọn lực dùng cú giật làm bước đi, thêm ghép phải dựng lại sân — chờ user quyết).

### 2a. Ghì xích chống giật (gói 6 Lực phun, chương 2; cờ `cfg.ghiXich`)
- Lý do: phun mạnh thì nước đẩy xe lùi (lực đẩy ngược, định luật 3 Newton); xích bám đất đẩy tới cùng lúc thì hai lực triệt tiêu. Lấp chỗ "bệ vòi xích" đã bỏ: gói 6 chương 1 giữ bài "lần đầu bị giật", chương 2 học tự chống giật bằng lệnh.
- Luật: nhịp có `spray("high")` / `spray_back("high")` mà hai xích CÙNG CHIỀU (đi thẳng) thì lệnh bánh không bị bỏ nữa. Thứ tự: (a) tia bay → (b) cộng chuyển động: xích (+1 tiến / −1 lùi) + giật (−1 với `spray("high")`, +1 với `spray_back("high")`) → (c) băng chuyền.
  - Tổng 0: xe đứng yên, sự kiện `ghi-xich` (hoạt cảnh rung, bụi sau xích).
  - Tổng ±2 "phóng" (user chốt 13/11: CÓ): đi 2 ô từng ô, vướng thì dừng ở ô trước vật cản. Tự ra từ luật cộng, không thêm ngoại lệ. Dùng ở 2–3 màn gói 10 (vd `spray_back("high"); left_move(); right_move(); wait()` vượt nhanh đoạn cửa nhịp).
  - Tổ hợp quay (một bên, hai bên ngược chiều) cùng nhịp phun: vẫn bỏ như cũ (`ban-dung-yen`; lời cho trẻ: vòi phải giữ thẳng hướng).
- Ví dụ: `spray("high"); left_move(); right_move(); wait()`.
- Màn ép: `u ▶ . . . N` (hố sau đuôi, van cách 4 ô): phun nhẹ không tới (2 ô), phun mạnh thì giật rơi hố, chỉ ghì xích mới thắng.

### 2b. Vừa chạy vừa phun (gói 2 Vòi phun chương 2, hay gói 10; cờ `cfg.phunKhiChay`)
- Lý do: phun nhẹ không có giật nên xe chạy được trong lúc xịt.
- Luật: `spray()` / `spray("low")` cùng nhịp với xích ĐI THẲNG. Thứ tự: (a) xích chạy → (b) tia phun từ ô MỚI, bay 2 ô. Tổ hợp quay vẫn bị bỏ.
- Màn ép: hành lang 3 đám lửa sức 1, cửa nhịp (có sẵn) cuối hành lang chỉ mở 4 nhịp: tách phun và đi thì cửa đóng trước khi tới.

## 3. Mùa 4 Cảng sông (cần cẩu container)

### 3a. Cần gạt đôi: quay + vươn + móc trong một nhịp (gói 5 Đường ray, chương 2; cờ `cfg.canGatDoi`)
- XONG 14/11 (lõi 5526e83, màn c9e18d8 + 31e80be, ca kiểm hình 53d62a6; chưa gộp main): cờ bật gói 5–10 mùa 4, gói 5 có 14/20 màn ghép, cả mùa 25/200; 120 màn đo lại lệch 2 đã sửa; mùa 9 không bật (đo lệch 0). Chi tiết và việc chờ user: hoc/ban-giao/BAN-GIAO-GHEP-NHIP.md mục 4.
- Lý do: người lái cẩu cảng cầm hai cần gạt, quay cần và vươn cần cùng lúc rồi móc. Áp lực có sẵn: tàu chỉ cập vài nhịp (cả 140 màn gói 4–10 có tàu).
- Luật (khuôn tay xoay mùa 1): bốn bộ phận **ray** (`rail(±1)`), **quay** (`swing_*`), **vươn** (`extend` / `retract`), **móc** (`pick_up` / `pick_up2` / `set_down`).
  Thứ tự: (a) ray 1 ô → (b) quay → (c) vươn / thu → kiểm đầu cần trong sân → (d) móc / hạ ở đầu cần MỚI.
  - Chuyển một container còn 2 nhịp: `swing_left(); extend(); pick_up(); wait()` rồi `swing_right(); retract(); set_down(); wait()`.
  - `rail(n)` với |n| > 1: móc / hạ cùng nhịp làm ở nhịp CUỐI của rail (bệ đã tới).
- Cách gộp nhịp (user chốt 13/11): khi có cờ, lệnh cẩu chỉ RA LỆNH vào hàng chờ; `wait()` gom các lệnh đứng ngay trước nó thành MỘT nhịp. Hàng chờ bị đóng KHÔNG có `wait()` (gặp lệnh cùng bộ phận lần nữa, đọc cảm biến, hết chương trình) thì mỗi lệnh trong hàng chạy một nhịp riêng như cũ.
  Gói 1–4 không bật cờ: giữ "mỗi lệnh một nhịp" (chốt 31/10). Hàm của trẻ viết ở gói 1–4 (không có `wait()`) vẫn chạy đúng số nhịp cũ. Rủi ro phải đo: mẫu `swing_left(); wait()` cũ (quay rồi đứng một nhịp = 2 nhịp) thành 1 nhịp.
- Làm CÙNG ĐỢT với 3e (cần quay 4 hướng): hai việc cùng đụng lõi cẩu và cùng bắt đo lại ngưỡng sao mùa 4.
- Màn ép (4 hướng: lên / phải / xuống / trái): cần chĩa vào container (phải, tầm 1), boong ở hướng lên tầm 3, tàu cập đúng 3 nhịp. Tách lệnh: móc, quay, vươn, vươn, hạ = 5 nhịp (trễ tàu). Ghép: `pick_up(); wait()` → `swing_left(); extend(); wait()` → `extend(); set_down(); wait()` = 3 nhịp.

### 3b. Móc đôi giữ kiểu chồng (user chốt), không tách thả trên / dưới
- `pick_up2()` / `set_down()` giữ nguyên luật hiện tại (18 màn gói 6–8 đang dùng).
- Không thêm lệnh thả riêng: cái trên gắn khung móc nên không thả trước được; thả riêng cái dưới không dạy được hàng đợi (hai cái vào móc cùng lúc, không có "vào trước").
- Lời dạy KHÔNG gọi móc đôi là "hàng đợi": móc đôi là cách **giữ nguyên thứ tự**, nhấc lẻ là cách **đảo thứ tự**; trẻ chọn nhấc 1 hay 2 (3c). Chữ "hàng đợi" chỉ dùng cho hàng tàu (3d).

### 3c. Ngăn xếp + xếp chồng theo luật màu + số (gọi đúng tên: **ngăn xếp**, "vào sau ra trước")
- Mỗi chồng container là một ngăn xếp: chỉ lấy / đặt ở đỉnh. Lõi chồng không đổi.
- Hai cách chuyển cho kết quả khác nhau: bốc lẻ từng cái (`pick_up` / `set_down` hai lần) thì thứ tự **đảo ngược**; móc đôi thì **giữ nguyên**. Ví dụ chồng [3, 7] (dưới → trên) sang chồng trống: bốc lẻ ra [7, 3], móc đôi ra [3, 7]. Đề bắt đảo hay giữ, trẻ chọn nhấc 1 hay 2.
- LUẬT XẾP (user chốt 13/11): đề không cho dãy đích cố định mà cho LUẬT, chấm theo luật nên mỗi sân một bộ số (`duLieuSan`, như "dữ liệu theo sân" 82.2): trẻ phải `read_code()` và so sánh, không điền thẳng được.
  - Luật hướng: **"nhỏ ở trên"** / **"lớn ở trên"** (KHÔNG ghi "tăng dần / giảm dần": dễ hiểu ngược; luật tháp `luatThap` có sẵn là "lớn không đặt lên nhỏ" = nhỏ ở trên). Biển ở chồng đích vẽ mũi tên + chữ.
  - Luật màu: màu container ĐÃ CÓ trong hình, theo `so % 4` (`hoc/game/ve-vector-vat-cang.js`: 0 đỏ · 1 xanh dương · 2 vàng · 3 xanh lá). Giữ đúng quy tắc này, không thêm thuộc tính màu riêng, không thêm lệnh đọc màu: đề nói bằng màu + số ("đỏ xếp nhỏ ở trên, xanh dương xếp lớn ở trên"), trẻ nhìn màu nhận ra; trong code nhận màu bằng `read_code() % 4 == 0` (đúng bài `%` Python mùa 4). Lời dạy nói rõ "màu = mã chia 4 dư mấy" kèm bảng 4 màu.
  - Luật kép (mỗi màu một chiều, hay lọc màu sang chồng riêng) chỉ ở gói 10; gói 2, 6 một luật, 3–4 container, một chồng tạm (cao tối đa 4).
- Lõi: mục tiêu mới `bongMo.chongLuat = [{ x, y, luat: 'nho-tren' | 'lon-tren', mau?: 0..3 | [..], du?: n }]`: lúc xong, chồng ở (x, y) chứa ĐÚNG mọi container hợp `mau` (mặc định mọi màu) trên sân, đúng chiều `luat`; `du` số container phải có (mặc định đếm từ sân). Lỗi chấm `sai-luat-chong` (chỉ ô / cặp sai đầu tiên). Máy kiểm riêng `hoc/kiem-chong-luat.mjs`. `bongMo.chong` cũ giữ nguyên.
- Hình: mũi tên nhỏ ở đỉnh mỗi chồng "vào / ra ở đây"; biển luật ở chồng đích (mũi tên chiều + ô màu nếu có lọc).
- Chỗ dạy: gói 2 Móc cẩu container (đảo thứ tự khi bốc lẻ, luật một chiều), gói 6 Móc cẩu đôi (giữ hay đảo, chọn nhấc 1 / 2), gói 8, 10 dùng lại (gói 10 luật kép theo màu).

### 3d. Hàng đợi: hàng tàu nối đuôi một bến (gói 4 Tàu cập bến: LÀM LẠI một chương có sẵn, user chốt 13/11, mặc định chương 2; gói 10)
- Không thêm chương (khuôn 10 gói × 2 chương × 10 màn).
- Lý do: tàu tới cảng xếp hàng chờ; tàu đầu hàng cập, nhận hàng, rời; tàu sau mới vào: **hàng đợi**, "vào trước ra trước".
- Luật (lõi mới, gần tàu / `giao-tau` có sẵn): một bến có nhiều tàu nối đuôi; chỉ tàu đầu hàng ở ô boong `T`; mỗi tàu cần đúng MỘT số container (bảng ở mũi tàu). Đặt đúng lên tàu đầu hàng thì cuối nhịp tàu rời, tàu kế vào bến. Đặt sai: thua (`giao-nham`). Trẻ không chọn tàu.
  `read_code()` chĩa vào boong đọc số tàu đầu hàng đang cần (để gói 10 viết một chương trình đúng nhiều sân).
- Bài ghép ngăn xếp + hàng đợi (gói 10): chồng A [5, 2, 8] (dưới → trên), chồng tạm B trống, hàng tàu cần 2 → 8 → 5: cất 8 sang B, giao 2, lấy 8 ở B giao, giao 5.
- Nối Python: mùa 4 chưa học `list` (Python mùa 4: số âm, `abs`, `%`, `//`); sang mùa 6 học `list` thì nhắc lại: `append()` / `pop()` là ngăn xếp, `pop(0)` là hàng đợi.

### 3e. Cần quay 4 hướng thay 8 nấc (user chốt 13/11; làm cùng đợt 3a)
- XONG 14/11 (merge 9ebfa0c, nhánh claude/mua-4-cau-4-huong): lõi SO_NAC 4, hình quay 90°, 200/200 màn mùa 4 + màn cẩu mùa 9 thắng; 34 màn dời sân, bài `% 8` thành `% 4`, `load_safe_stack(d)` thêm tham số. Gộp nhịp 3a chưa làm.
- Lý do: 8 nấc cho đầu cần chéo ở (±tầm, ±tầm) nên cần trông dài ~1,4 lần; 4 hướng thì tầm đúng bằng số ô, độ dài cần không đổi. Quay 90° còn 1 lệnh (nay 2), 180° còn 2 (nay 4): bài quay xa ngắn lại, ghép với 3a gọn một nhịp.
- Luật: `nac` 0–3 (0 lên, 1 phải, 2 xuống, 3 trái); `swing_left()` / `swing_right()` quay 90°. Đổi hẳn (mùa 4 đang ẩn), không giữ đường 8 nấc. `batDau.nac` cũ phải đổi sang hệ 4 hướng.
- Tầm với: gói 1–4 bệ đứng yên chỉ với 12 ô hình chữ thập (nay 24): dùng chính điều này làm lý do mở ray ở gói 5 ("ô chéo cần không với tới, bệ phải chạy").
- Đã đo (13/11): móc / hạ ở nấc chéo có trong **41 màn** (gói 2: 12, gói 3: 14, gói 4: 13, gói 7: 2) → sửa sân (dời container / boong lên ô chữ thập). Gói 5, 6, 8, 9, 10 mùa 4 và 9 màn cẩu mùa 9 chỉ quay QUA nấc chéo → lời giải bớt lệnh quay. Mọi màn cẩu đo lại ngưỡng sao.
- Hình: `hoc/game/san-ve.js` (vis.cau nội suy nac), VeVector.veCanCau, phim mùa cảng (`hoc/game/phim-mua-cang.js`) đổi về 4 hướng; máy kiểm vẽ `hoc/kiem-ve-mua-song-cang.mjs`.

### 3f. Tìm lớn nhất / nhỏ nhất theo hàng ngang (user chốt 13/11)
- Chia việc: chồng DỌC = ngăn xếp (3c); dãy NGANG = tìm lớn nhất / nhỏ nhất; hàng tàu = hàng đợi (3d).
- Sân: một dãy ô bãi song song ray, mỗi ô MỘT container (mọi ô đều lấy được, khác chồng). Cẩu chạy ray qua từng ô, `read_code()`, giữ biến kỷ lục, rồi mang container lớn nhất (nhỏ nhất, hay lớn nhất của một màu) đi giao. Số đổi theo sân (`duLieuSan`) nên phải quét thật.
- Không sửa lõi (ray, `read_code`, `bongMo.chong` / `chongLuat` có sẵn). Chỗ dạy: gói 5 Đường ray chương 2 hay gói 7 (cùng `weight()`: nặng nhất), gói 8, 10 dùng lại.
- Nối Python: mùa 4 trẻ TỰ VIẾT vòng quét giữ kỷ lục (biến + `if`); `min()` / `max()` có sẵn là bài Python mùa 5 Bến sông, nhắc lại ở đó: "`max()` làm hộ đúng việc em đã làm ở cảng".

## 4. Mùa 5 Bến sông (xuồng thủy lợi)

Lõi đã đúng thứ tự (a) neo → (b) lưới → (c) chân vịt → (d) dòng chảy; dòng đẩy MỖI nhịp (156/200 màn có dòng) nên nhịp làm riêng nào cũng bị trôi: áp lực có sẵn.

### 4a. Nhổ neo rồ máy (gói 5 Mỏ neo) — không sửa lõi
- `unanchor(); left_move(); right_move(); wait()`: dòng chỉ xét ô xuồng đứng SAU khi chạy, nên nhổ neo và lách vào kênh êm cùng nhịp thì không trôi; nhổ neo một nhịp riêng thì bị cuốn 1–2 ô.
- Màn ép: xuồng neo giữa dòng sức 2, cửa kênh êm trước mũi, dưới dòng là bờ đá / cống đóng.

### 4b. Neo + tung lưới (gói 5, chương 2) — không sửa lõi
- `anchor(); cast_net("left"); wait()`: bè trôi đi ngang tầm lưới đúng một nhịp; neo trước một nhịp thì bè trôi qua. Không neo thì lưới VẪN bắt được (lưới pha (b) chạy trước dòng (d)), nhưng dòng cuốn cả xuồng lẫn bè vào ngách ngay sau: màn ép dựng theo cơ chế này.
- XONG 13/11 (180c87c, gói A): gói 5 có 18/20 màn ghép. `lift_anchor()` còn một dòng `unanchor()` (bỏ `wait()`), hàm mới `anchor_net(d)`; 11 màn sau chỉ hạ ngưỡng sao. Lưới đã bắt bè trước mũi thì xuồng không tiến được (`luoi-vuong`), nên 4a ghép nhổ neo với LÙI / QUAY khi bè ở mũi.

### 4c. Tời cuộn từng ô: `reel_in()` / `reel_out()` thay `set_length` (gói 6 Cuộn dây) — sửa lõi
- Vấn đề hiện tại: `set_length(0)` kéo bè vào khoang NGAY trong một nhịp dù dây dài 3, nên ghép với chân vịt chỉ bớt một nhịp.
- User đề xuất thu dây từng nấc; KHÔNG dùng `set_length(-1)` (cùng tên hai nghĩa "đặt" và "bớt", và hiện là lỗi chạy). Thay bằng cặp lệnh ngược `reel_in()` / `reel_out()` (tên user chốt 13/11; LENH_NGUOC, như `anchor` / `unanchor`):
  - `reel_in()`: dây ngắn đi 1 ô, vật về gần 1 ô theo dây; từ 1 về 0 thì vật vào khoang. `reel_out()`: dây dài thêm 1 ô (tối đa TAM_KEO = 3). Không kéo gì thì chỉ chỉnh độ dài dây cho lần tung sau.
  - Một lệnh dây mỗi nhịp (chung hàng chờ `phao-goi-lai`), làm ở pha (b), trước chân vịt.
  - `set_length` thôi dạy (11 màn gói 6 làm lại); lõi giữ để không vỡ mã cũ / xe tời bờ mùa 9.
- Ghép: `reel_in(); left_move(); right_move(); wait()`. Dây còn 1 ô thì vật vào khoang và xuồng đi trong cùng nhịp. Tiến về phía vật trong lúc cuộn thì cán lên dây (`luoi-vuong` có sẵn), trừ nấc cuối: dạy như lỗi hay gặp.
- Màn ép "giữ chỗ giữa dòng": bè cách 3 ô, xuồng giữa dòng sức 1, không neo: phải cuộn 3 nhịp, nhịp nào cũng vừa cuộn vừa chạy máy ngược dòng (ngược dòng sức 1 thì đứng yên). Gói có neo: so với cách `anchor()` rồi cuộn yên (mất nhịp thả / nhổ neo).
- XONG 14/11 (lõi 1915467, gói 6 4e450a1, mùa 9 c02bbaa): `reel_in` / `reel_out` ≡ `set_length(dài ∓ 1)` chung đường code, bật bằng hamGoc hay cờ `cuonDay`. Gói 6 có 17/20 màn ghép; gói 7–10 tự ghép qua `tether_grab()` = `reel_in()` (7: 10/20, 8: 10/20, 9: 4/20, 10: 10/20). Màn ép "giữ chỗ giữa dòng" KHÔNG dựng được (dây theo vệt nước xuồng vừa rời, dòng đẩy lùi thì lệnh tiến cán dây): thay bằng lục bình trôi chắn đường lùi (buoc-duoi.4, che-buoc-duoi.5). Mùa 9: xuồng R1 (`co-may.js` XU, `man-cuu-ben-song.js`) thêm `reel_in` / `reel_out`.

## 5. Mùa 7 Mỏ đá (xe omni)

### 5a. Đi chéo = trượt + đi thẳng (gói 5 Đi chéo; cờ `cfg.cheoGhep`)
- Lý do: bánh omni đi chéo chính là nhờ cộng chuyển động tới và ngang.
- Luật: bỏ `omni-khong-cheo` khi có cờ: `slide_*` cùng nhịp với đi thẳng (tiến / lùi) = đi chéo 1 ô, giữ hướng mặt; trượt + quay vẫn bỏ. Được cả 4 hướng chéo (`diag_*` chỉ có 2 hướng tới).
- `slide_left(); left_move(); right_move(); wait()` chéo tiến-trái; `slide_right(); left_back(); right_back(); wait()` chéo lùi-phải.
- Hàm của em (user chốt 13/11): trẻ tự viết ở gói 5 bốn hàm `dir_fl()`, `dir_fr()`, `dir_bl()`, `dir_br()` (f = front / tới, b = back / lùi, l / r = trái / phải), vd `def dir_fl(): slide_left(); left_move(); right_move(); wait()`. Tên theo HƯỚNG MẶT xe (omni trượt so với hướng mặt), không dùng `ul` / `up` (dễ hiểu thành hướng bản đồ, trùng nghĩa `go_up` của nhện / drone), không dùng `back_left` (dễ nhầm `left_back` bánh trái lùi).
- Màn cũ: `diag_*` có trong 15 màn gói 5 và 11 màn gói sau (gói 6: 3, gói 7: 2, gói 8: 2, gói 10: 1, mùa 8 gói 9: 2, mùa 9 gói 7: 1). Làm lại gói 5; 11 màn sau đổi lời giải sang hàm của em `dir_*` (lấy từ kho hàm, không dựng lại sân). `diag_*` gốc thôi dạy, lõi giữ để không vỡ mã cũ.

### 5b. Ném đà (gói 6 Chỉnh lực hất; cờ `cfg.nemDa`)
- Lý do: ném lao, ném biên phải chạy đà mới ném xa được; đứng tại chỗ thì không.
- Luật (user chốt 13/11): `aim(n)` chỉ còn n = 1, 2 (TAM_NEM_TOI_DA = 2). `throw()` cùng nhịp với TIẾN THẲNG: (a) xe tiến 1 ô → (b) vật rời tay ở ô MỚI, bay `tầm + 1` ô (tới 3). Ô trước bị chặn: xe đứng yên, ném tầm thường, sự kiện `khong-co-da`. Lùi / quay / trượt + ném: vẫn bỏ lệnh bánh (`nem-dung-yen`). `load()` vẫn đứng yên.
- Vì sao có nghĩa: tầm đo TỪ Ô THẢ VẬT. Đứng ở mép bờ thì dù bao nhiêu nhịp cũng chỉ vượt mép 2 ô; chạy vào ô mép và ném cùng nhịp thì vượt 3 ô.
- Ví dụ: `aim(2)` rồi `left_move(); right_move(); throw(); wait()`.
- Màn ép: `. ▶ . ~ ~ u` (ô `.` trước xe là chỗ chạy đà, hố cách mép 3 ô).
- Ảnh hưởng: `aim(3)` có trong lời giải 10 màn đang chơi (gói 6: 8, gói 8: 1, gói 9: 1) + 7 màn mùa ẩn; 7 màn đặt tầm bằng biến. Gói 6 dựng lại: chương 1 tầm 1–2 đứng yên, chương 2 ném đà; màn gói 8, 9 sửa sân hay đổi lời giải sang ném đà; lời lỗi `tam-sai` đổi "1 hoặc 2".

## 6. Thứ tự làm, nghiệm thu

1. **Mùa 5** 4a, 4b (chỉ màn) → 4c (lõi `reel_in` / `reel_out` + gói 6).
2. **Mùa 2** 2a ghì xích (lõi nhỏ + gói 6 chương 2) → 2b.
3. **Mùa 4** 3e cần 4 hướng + 3a cần gạt đôi (một đợt lõi cẩu, sửa 41 màn nấc chéo, đo lại sao) → 3c ngăn xếp + luật xếp (lõi chấm `chongLuat`) → 3f quét lớn nhất / nhỏ nhất (chỉ màn) → 3d hàng tàu (lõi mới, làm lại một chương gói 4).
4. **Mùa 7** sau cùng (đụng nhiều màn cũ nhất).

Mỗi bước: lõi có máy kiểm riêng (`hoc/kiem-*.mjs`), màn mới thắng 3 sao, ngưỡng sao đo lại tay trong `hoc/lo-trinh-sao.js` (không chạy `do-lo-trinh.mjs --ghi-sao`), có màn trình diễn trước màn ép, `npm test` cả bộ đạt.
Đo lại bằng `node tools/do-ghep-nhip.mjs`: mỗi mùa 2, 4, 5, 7 có ít nhất một gói nâng cấp ≥ 15/20 màn có ghép ngoài hai bánh, và gói 8 hoặc 10 có dùng lại.

## 7. User đã chốt (13/11)

- Mùa 2: CÓ "phóng" ±2 ô ở gói 10 (2a).
- Mùa 4: gộp nhịp bằng hàng chờ + `wait()` từ gói 5 (3a); cần quay 4 hướng thay 8 nấc, cùng đợt (3e); hàng tàu nối đuôi LÀM LẠI một chương có sẵn của gói 4 (3d); xếp chồng theo luật màu + số, màu = `so % 4` có sẵn (3c); dãy ngang dạy lớn nhất / nhỏ nhất (3f); trẻ chọn nhấc 1 hay 2, móc đôi không gọi là hàng đợi (3b).
- Mùa 5: tên lệnh `reel_in()` / `reel_out()` (4c).
- Mùa 7: `diag_*` ở màn sau đổi thành hàm của em `dir_fl` / `dir_fr` / `dir_bl` / `dir_br` (5a).

Còn để người dựng chọn (không cần hỏi lại): chương nào của gói 4 làm lại cho hàng tàu (mặc định chương 2); 3f đặt ở gói 5 chương 2 hay gói 7.
