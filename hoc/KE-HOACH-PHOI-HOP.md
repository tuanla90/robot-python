# Kế hoạch: các gói phối hợp hai robot (24/10, chờ user chốt)

Mục tiêu xa: chế độ thi kiểu Robocon, người chơi đọc **đề của ban tổ chức** (sân, nhiệm vụ, trần part / ngân sách), tự chọn part cho từng robot
rồi lập trình cả đội. Các gói ở đây là bậc thang tới đó: mỗi lần học xong một part mới thì có ngay một gói **dùng part đó trong đội hai robot**.

Nền đã có: lõi nhiều robot (`cfg.doi`, nhịp chung, đồng đội là vật cản, tối đa 4 robot, KE-HOACH-HAI-ROBOT.md); gói Đội hai robot (hai robot giống nhau);
hai gói thử thách khác thân: Đội vượt hố và băng chuyền (xe + nhện), Đội tay gắp và máy ném (kẹp + ném); chế độ lắp ráp MỘT robot (KE-HOACH-LAP-RAP.md).
Tư liệu: tham-khao-robocon-v0.1.md §4 (điểm chết là **bàn giao**; phần mềm phải biết **chờ**, **kiểm tra** đồng đội và có **đường lui**), GDD v0.2 §4.1
(R1 tự động chạy chương trình cố định suốt trận).

## Ba dòng
- **Must keep:** luật lõi một robot và nhiều robot như hiện tại; không thêm lệnh tín hiệu (user chốt 22/10: báo nhau bằng cảm biến và bằng vật trên sân);
  khuôn chương 10 màn (3 làm quen · 3 luyện · 3 biến thể · 1 trùm), màn 1–9 một sân, trùm ba sân; chỉ dùng part và hàm đã học trước gói.
- **Must improve:** mỗi gói bộ phận có một gói phối hợp ngay sau; robot có vai khác nhau do part khác nhau; có dạng bài **R1 tự động sẵn, em xây R2**;
  mục tiêu theo từng robot (hết đường tắt "cờ nào cũng được"); cuối lộ trình là gói chọn part cho cả đội theo đề.
- **Done when:** mỗi gói có máy kiểm: lời giải mọi màn thắng 3 sao trên mọi sân; mẫu không thắng sẵn; 10 màn khác nhau; lời sai tiêu biểu
  (chờ cứng, viết thẳng, bỏ đồng đội, R2 tự làm hết) bị chặn hay mất sao; chơi tay 2 màn mỗi gói trên khung 375×812.

## 1. Đặt ở đâu (chèn ngay sau gói giới thiệu part)

| Sau gói part | Gói phối hợp | Trạng thái | Part mới trong đội |
|---|---|---|---|
| Cảm biến (+ Robot hoàn thiện) | Đội hai robot | đã có | hai robot giống nhau |
| Thân nhện | Đội vượt hố và băng chuyền | đã có | nhện (không cảm biến) + xe |
| Bánh xích | **Đội xích chở nặng** | mới | xích (leo bậc, không trôi băng) |
| Bánh omni | **Đội omni nhường đường** | mới | omni (trượt ngang) |
| Súng hơi | **Đội mở cổng** | mới | súng hơi (bắn nút, đẩy thùng) |
| Cảm biến màu | **Đội đọc màu** | mới | màu / camera |
| Nam châm | **Đội hút từ xa** | mới | nam châm + cảm biến từ |
| Tay xoay | **Dây chuyền hai trạm** | mới | tay xoay |
| Máy ném | Đội tay gắp và máy ném | đã có (đề xuất dời lên trước Lắp ráp: Thân + Tay) | máy ném |
| Drone (+ Flycam) | **Đội trên không – mặt đất** | mới | drone, camera nhìn xuống, pin |
| Lắp ráp: Đủ bộ | **Đề ban tổ chức** | mới, gói cuối | chọn part cho cả đội |

Tám gói mới, 80 màn. Gói phối hợp là gói `thu-thach`, `khongTangNguong: true` (không đẩy ngưỡng sao gói sau), khai báo trong `man-doi-*.js`
(`ManHoc.chuongThem`), `lo-trinh-hoc.js` chèn vào sau gói part, như hai gói đội đã có.

## 2. Bậc thang kỹ năng phối hợp (xuyên các gói)

Mỗi gói thêm đúng một kỹ năng phối hợp mới, ôn các kỹ năng trước. Thứ tự dưới đây khớp thứ tự gói ở mục 1.

| # | Kỹ năng | Ý nghĩa ở sân Robocon | Gói giới thiệu |
|---|---|---|---|
| K1 | Chia việc theo phần cứng | robot nào làm được gì | Đội hai robot, Đội vượt hố |
| K2 | Bàn giao vật (đặt trước mặt, chờ bằng cảm biến) | điểm chết số một | Đội vượt hố, Đội tay gắp và máy ném |
| K3 | **Phối hợp với robot tự động có sẵn**: đọc chương trình khóa của R1, viết R2 cho khớp | R1 tự động chạy cố định suốt trận | Đội xích |
| K4 | Nhường đường, giữ khoảng cách, không chặn nhau | hai robot chung một sân hẹp | Đội omni |
| K5 | Mở đường cho đồng đội (nút, cửa, dời thùng) | robot này dọn sân cho robot kia | Đội mở cổng |
| K6 | Báo nhau bằng vị trí vật (không có lệnh tín hiệu) | "giao tiếp" qua trạng thái sân | Đội đọc màu |
| K7 | Đường lui khi đồng đội trễ (chờ có giới hạn bằng `for` + `if`) | robot tự động không được kẹt mãi | Đội hút từ xa |
| K8 | Dây chuyền nhiều vật (vòng lặp hai phía, không ùn ô bàn giao) | năng suất trong thời gian giới hạn | Dây chuyền hai trạm |
| K9 | Phân vai trên không / mặt đất, quản lý pin cả đội | robot khác độ cao không chặn nhau | Đội trên không – mặt đất |
| K10 | Chọn part cho từng robot theo đề, ngân sách chung | đề ban tổ chức đổi mỗi năm | Đề ban tổ chức |

## 3. Khuôn 10 màn dùng chung cho mọi gói phối hợp

| Màn | Hàng | Dạng | Ai viết |
|---|---|---|---|
| 1 | làm quen | Hai làn riêng: robot cũ đã có chương trình, em viết robot mang part mới | robot mới |
| 2 | làm quen | **R1 tự động (khóa)** làm phần việc của nó; em viết R2 | R2 |
| 3 | làm quen | Một lần dùng part mới để giúp đồng đội (bàn giao / mở đường đơn) | cả hai, một phần cho sẵn |
| 4 | luyện | Kỹ năng phối hợp mới của gói (bảng mục 2), một sân | cả hai |
| 5 | luyện | Kỹ năng mới + bàn giao | cả hai |
| 6 | luyện | **R1 tự động** dùng cảm biến; R2 phải chờ bằng cảm biến, đếm nhịp thì mất sao | R2 |
| 7 | biến thể | Sửa lỗi phối hợp: chờ cứng / sai điều kiện chờ | sửa một robot |
| 8 | biến thể | Sửa lỗi phối hợp: chặn đường đồng đội / sai thứ tự | sửa một robot |
| 9 | biến thể | Nhiều vật hay nhiều lượt: viết thẳng tràn khung, phải lặp | cả hai |
| 10 | trùm | Ba sân khác tình huống; R1 có thể là robot tự động khóa mà hành vi đổi theo sân | cả hai (hay chỉ R2) |

Luật thiết kế (rút từ lần làm lại 24/10):
- Mỗi màn một tình huống thật khác; máy kiểm so `san + loiGiai` của 10 màn, không được trùng.
- Mẫu không bao giờ thắng sẵn; màn "R1 tự động" khóa R1 nhưng R2 phải còn việc thật để làm.
- Phải cần **cả hai** robot: kiểm "một robot làm hết" (robot kia đứng yên hay tránh đường) không thắng, trừ màn cố ý cho phép.
- Robot không cảm biến (nhện, robot "mù") không thể chờ bằng cảm biến: chỉ cho chờ đếm nhịp ở màn cố ý dạy điều đó.
- Trùm ba sân phải khác ở chỗ buộc quyết định (độ dài, phía, thời điểm đồng đội tới), không chỉ khác trang trí.

## 4. Tám gói mới

Robot "xe" mặc định = xe hai bánh + tay kẹp + cảm biến khoảng cách (robot của gói Robot hoàn thiện). Tình huống dưới đây đều chạy được trên luật lõi hiện có
trừ chỗ ghi **[cần G…]** (mục 5).

**Đội xích chở nặng** (sau Bánh xích; K3 robot tự động có sẵn)
- Vai: xích leo bậc S, đứng yên trên băng (băng không đẩy), quay chậm 2 nhịp; xe đi băng nhanh nhưng không leo bậc.
- Tình huống: xích chở hộp lên bậc rồi đặt cho xe; **xích đứng trên băng làm chốt** để xe bị băng đẩy dừng đúng ô; xe chờ xích quay xong mới đi.
- Robot tự động: R1 xích chạy chương trình khóa (vd lặp ba chuyến chở hộp lên bậc); em đọc chương trình đó và viết xe nhận hàng **[cần G1]**.
- Trùm: ba kho bậc cao thấp khác nhau, xích tự động dùng `go_wall`/cảm biến nên thời điểm giao đổi theo sân; xe phải chờ bằng cảm biến.

**Đội omni nhường đường** (sau Bánh omni; K4)
- Vai: omni trượt ngang không cần quay; xe phải quay mới đổi hướng.
- Tình huống: hành lang một làn có hốc bên, omni trượt vào hốc cho xe chở hàng đi qua rồi trượt ra; hai robot đi song song chở một hàng dài
  (giữ khoảng cách, không chặn nhau); omni bám sau xe và dừng khi thấy xe (`front_clear`).
- Robot tự động: xe khóa chạy đi chạy lại trên hành lang chính; em viết omni tránh đúng lúc.
- Trùm: ba hành lang có hốc ở vị trí khác nhau; omni phải dùng `left_clear` / `right_clear` tìm hốc.

**Đội mở cổng** (sau Súng hơi; K5)
- Vai: súng hơi bắn nút N đổi cửa C/c và bật tắt băng; giật lùi đẩy thùng nặng H; xe chở vật nhẹ.
- Tình huống: R1 bắn nút mở cửa cho xe, xe chờ `while not front_clear(): wait()` rồi qua; R1 bắn lần nữa tắt băng cho xe đi ngược; R1 giật đẩy thùng
  ra khỏi lối của xe; thứ tự sai (đóng cửa khi xe đang ở giữa) thì kẹt.
- Robot tự động: súng hơi khóa bắn nút theo chu kỳ cố định; xe phải canh lúc cửa mở.
- Trùm: ba sân, nút điều khiển cửa khác nhau, số lần bắn khác nhau.

**Đội đọc màu** (sau Cảm biến màu, trước Lắp ráp: Thân + Não; K6)
- Vai: một robot có camera (đọc màu vật trước mặt), robot kia không có cảm biến màu.
- Tình huống: R1 đọc màu hộp rồi đặt hộp ở ô A (đỏ) hay ô B (xanh); R2 không nhìn màu nhưng biết màu nhờ **chỗ hộp nằm** và chở vào đích màu;
  R1 **đứng bên trái hay bên phải** làm tín hiệu, R2 hỏi `left_clear()` / `right_clear()` để chọn đường. Đích có màu nên đặt sai thì `dat-sai-mau`.
- Robot tự động: R1 khóa phân loại theo màu; em viết R2 đọc vị trí.
- Trùm: ba kho thứ tự màu khác nhau; chương trình R2 không được ghi cứng thứ tự.

**Đội hút từ xa** (sau Nam châm; K7 đường lui)
- Vai: nam châm hút sắt trong 2 ô, đẩy vật cùng cực tới 3 ô; cảm biến từ `front_metal()` / `front_pole()`; xe kẹp chở vật gỗ.
- Tình huống: R1 đẩy vật nam châm trượt tới trước mũi xe; vật gỗ thì nam châm bó tay, xe phải tự đi lấy; xe chờ có giới hạn
  (`for i in range(n): if not front_clear(): …`), quá hạn thì làm phương án B.
- Robot tự động: R1 khóa chỉ hút / đẩy vật sắt và nam châm; em viết xe xử lý cả trường hợp R1 không làm được.
- Trùm: ba sân, một sân vật là gỗ (R1 không giao) — xe chờ mãi thì quá nhịp, phải có đường lui.

**Dây chuyền hai trạm** (sau Tay xoay; K8)
- Vai: tay xoay gắp / đặt ô bên trái, bên phải mà không quay xe (chu trình 4 nhịp); xe kẹp chở đi xa.
- Tình huống: R1 đứng yên lấy từng hộp bên trái đặt sang bên phải (ô bàn giao), xe nhận và chở đi; ô bàn giao còn hộp thì R1 phải chờ
  (`while not right_clear(): wait()`); ba, bốn hộp: cả hai cùng lặp, nhịp cả đội là thước đo.
- Robot tự động: R1 khóa với chu kỳ cố định; xe phải theo kịp, chậm thì R1 đặt vào ô đang có hộp và kẹt.
- Trùm: ba sân số hộp và đường chở khác nhau.

**Đội trên không – mặt đất** (sau Flycam, trước Lắp ráp: Đủ bộ; K9)
- Vai: drone bay qua rào, băng, vật, không chặn robot mặt đất; nam châm treo hút sắt dưới bụng; pin + ô sạc P; camera nhìn xuống `look()`.
- Tình huống: drone chở hộp sắt qua rào thả xuống trước mũi xe; drone trinh sát màu bằng `look()` rồi thả hộp ở chỗ báo hiệu cho xe (K6);
  drone bay ngang trên đầu xe mà không chặn nhau (khác tầng), nhưng hai robot vẫn tranh ô bàn giao dưới đất.
- Robot tự động: drone khóa chạy theo pin (`if battery() < n`), thời điểm giao đổi theo mức pin của sân.
- Trùm: ba sân pin khác nhau; xe chờ bằng cảm biến.

**Đề ban tổ chức** (gói cuối, sau Lắp ráp: Đủ bộ; K10) **[cần G3]**
- Màn 1–4: R1 là robot tự động có sẵn (part và chương trình khóa); em **chọn part cho R2** trong ngân sách rồi viết R2.
- Màn 5–9: chọn part cho **cả hai** robot, ngân sách chung của đội; mỗi màn ≥ 2 đội hình thắng, không đội hình nào hơn hẳn (luật lắp ráp).
- Màn 10: "đề năm nay": tờ đề ghi sân, nhiệm vụ, trần cứng (ngân sách, part được phép), ba sân.
- Mỗi màn mở đầu bằng **tờ đề** (như tờ luật Robocon) thay cho đoạn đề bài thường: đây là giao diện sẽ dùng lại cho chế độ thi.

## 5. Việc lõi và giao diện cần thêm

| Mã | Việc | Vì sao | Công |
|---|---|---|---|
| G1 | **Robot khóa trong màn nhiều robot**: `doi[i].coDinh: true` — thẻ R của robot đó chỉ đọc, có ổ khóa, chương trình lấy từ `maMau.doi[i]`, nháp cũ không ghi đè; máy chấm từ chối bài làm sửa robot khóa | dạng bài "R1 tự động sẵn" (K3) | nhỏ: mở rộng `chinhCoDinh` hiện có (man-choi.js, thanh-phan.js) theo từng robot |
| G2 | **Mục tiêu theo robot**: cờ / đích có chủ (vd `cfg.chu = [{ x, y, robot: 0 }]` hay ký hiệu sân riêng), `toi-co` mỗi robot đúng cờ của mình; mở `bong-mo` cho nhiều robot | hết đường tắt "cờ nào cũng được" (KE-HOACH-HAI-ROBOT.md đã ghi), cho phép bài đổi chỗ / đổi hàng | vừa: san-hoc.js, cham.js, san-ve.js (vẽ màu chủ) |
| G3 | **Lắp ráp cho đội**: `lapRap.doi = [{ khe… } , …]`, ngân sách chung hay riêng, robot khóa không chọn được; màn Lắp robot có thẻ R1 / R2; `LapRap.kiemCanMan` duyệt tổ hợp đội (giới hạn danh mục mỗi màn để số tổ hợp nhỏ) | gói Đề ban tổ chức, chế độ thi | lớn: lap-rap.js, man-lap.js, máy kiểm |
| G4 | **Tờ đề** (màn hình đọc đề trước khi lắp): sân thu nhỏ, nhiệm vụ, trần cứng, part được phép | giao diện dùng lại cho Robocon | vừa |
| G5 | **Bộ dò chung cho đội khác thân**: BFS chạy thật `SanHoc.chay` trên trạng thái hai robot (như do-duong-rap-du.mjs), hoặc tối thiểu bộ "lời sai tiêu biểu" chạy cho mọi màn | bộ dò hiện tại chỉ hỗ trợ hai xe kẹp | vừa |
| G6 | Mở rộng `kiem-lo-trinh.mjs`: mọi gói `doi-*` qua cùng bộ luật mục 3 (không trùng, mẫu không thắng, cần cả hai robot, robot khóa không đổi) | giữ chất lượng khi thêm 80 màn | nhỏ |

Chế độ thi về sau (ngoài phạm vi kế hoạch này): tính điểm trong N nhịp thay vì thắng / thua, đối thủ, trần mềm (tham-khao-robocon §5.3).

## 6. Thứ tự làm đề xuất

1. **G1 + G6**, dời gói Đội tay gắp và máy ném lên ngay sau gói Máy ném (nếu user chốt).
2. **Thí điểm hai gói**: Đội xích chở nặng (K3, robot khóa) và Đội mở cổng (K5). Chơi thử, chỉnh khuôn 10 màn ở mục 3.
3. **G2**, rồi bốn gói giữa: Đội omni, Đội đọc màu, Đội hút từ xa, Dây chuyền hai trạm.
4. Đội trên không – mặt đất.
5. **G3 + G4 + G5**, rồi gói Đề ban tổ chức.

Mỗi gói làm riêng một phiên (một tệp `man-doi-*.js`, một khối kiểm), không đụng chương khác; ước một gói ~ nửa ngày tới một ngày kể cả máy kiểm.

## 7. Cần user chốt

1. Giữ **10 màn** mỗi gói phối hợp (như mọi chương) hay gói ngắn hơn? Gói ngắn cần sửa luật "10 màn / chương" trong máy kiểm.
2. Dời **Đội tay gắp và máy ném** lên ngay sau gói Máy ném (trước Lắp ráp: Thân + Tay) cho đúng luật "sau gói part"?
3. Robot tự động: người chơi **xem được chương trình khóa** (đọc để tính) hay chỉ **xem nó chạy** (hộp đen)? Đề xuất: xem được ở các gói giữa, hộp đen ở gói Đề ban tổ chức.
4. Thứ tự ưu tiên: thí điểm Đội xích + Đội mở cổng trước như mục 6, hay làm Đề ban tổ chức sớm hơn?
5. Tên gói gộp **Dò đường** (Cảm biến hai bên + Mê cung) đã đặt 24/10 — giữ hay đổi.
