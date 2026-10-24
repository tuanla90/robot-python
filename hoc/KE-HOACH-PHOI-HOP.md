# Kế hoạch: các gói đội hai robot (24/10, user đã chốt)

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

## 1. Đặt ở đâu (user chốt 24/10)

- Mỗi gói đội **20 màn = 2 chương**: chương `doi-<gói>` (phối hợp, khuôn §3) và chương `che-doi-<gói>` (chế lệnh phối hợp, §3b).
- Gói đội đứng **ngay sau gói part** của nó và ghép part đó với **part liền trước** (cái sau dùng cái trước). Không bắt buộc có robot gốc
  (xe hai bánh + kẹp): đội có thể là hai robot đặc thù, part đặc thù.
- Robot tự động **luôn cho xem chương trình** (khóa, chỉ đọc); không có chế độ hộp đen (để dành cho robot đối thủ sau này).
- Làm các gói đội trước, gói Đề ban tổ chức sau.

| Sau gói part (chương `sau`) | Gói đội (tệp) | Đội | Trạng thái |
|---|---|---|---|
| Cảm biến + Robot hoàn thiện | Đội hai robot (`man-hai-robot.js`) | hai xe giống nhau | có, 10 màn (gói nhập môn, giữ nguyên) |
| Thân nhện (`che-nhen`) | Đội vượt hố và băng chuyền (`man-doi-ho-bang.js`) | xe + nhện | chương 1 có; **thiếu chương 2** |
| Bánh xích (`che-xich`) | Đội xích và nhện (`man-doi-xich.js`) | xích + nhện | mới |
| Bánh omni (`che-omni`) | Đội omni và xích (`man-doi-omni.js`) | omni + xích | mới |
| Súng hơi (`che-sung-hoi`) | Đội súng hơi và omni (`man-doi-sung-hoi.js`) | súng hơi + omni | mới |
| Cảm biến màu (`che-mau`) | Đội màu và súng hơi (`man-doi-mau.js`) | màu / camera + súng hơi | mới (trước Lắp ráp: Thân + Não) |
| Nam châm (`che-nam-cham`) | Đội nam châm và màu (`man-doi-nam-cham.js`) | nam châm + màu | mới |
| Tay xoay (`che-tay-xoay`) | Đội tay xoay và nam châm (`man-doi-tay-xoay.js`) | tay xoay + nam châm | mới |
| Máy ném (`che-may-nem`) | Đội tay gắp và máy ném (`man-doi-gap-nem.js`) | kẹp + ném (chương 2: tay xoay + ném) | chương 1 có, **đã dời lên trước Lắp ráp: Thân + Tay**; thiếu chương 2 |
| Flycam (`flycam`) | Đội drone và máy ném (`man-doi-drone.js`) | drone + máy ném | mới (trước Lắp ráp: Đủ bộ) |
| Lắp ráp: Đủ bộ | Đề ban tổ chức | chọn part cho cả đội | sau cùng **[cần G3, G4]** |

## 2. Bậc thang kỹ năng phối hợp (xuyên các gói)

Mỗi gói thêm đúng một kỹ năng phối hợp mới, ôn các kỹ năng trước. Thứ tự dưới đây khớp thứ tự gói ở mục 1.

| # | Kỹ năng | Ý nghĩa ở sân Robocon | Gói giới thiệu |
|---|---|---|---|
| K1 | Chia việc theo phần cứng | robot nào làm được gì | Đội hai robot, Đội vượt hố |
| K2 | Bàn giao vật (đặt trước mặt, chờ bằng cảm biến) | điểm chết số một | Đội vượt hố, Đội tay gắp và máy ném |
| K3 | **Phối hợp với robot tự động có sẵn**: đọc chương trình khóa của R1, viết R2 cho khớp | R1 tự động chạy cố định suốt trận | Đội xích và nhện |
| K4 | Nhường đường, giữ khoảng cách, không chặn nhau | hai robot chung một sân hẹp | Đội omni và xích |
| K5 | Mở đường cho đồng đội (nút, cửa, dời thùng) | robot này dọn sân cho robot kia | Đội súng hơi và omni |
| K6 | Báo nhau bằng vị trí vật (không có lệnh tín hiệu) | "giao tiếp" qua trạng thái sân | Đội màu và súng hơi |
| K7 | Đường lui khi đồng đội trễ (chờ có giới hạn bằng `for` + `if`) | robot tự động không được kẹt mãi | Đội nam châm và màu |
| K8 | Dây chuyền nhiều vật (vòng lặp hai phía, không ùn ô bàn giao) | năng suất trong thời gian giới hạn | Đội tay xoay và nam châm |
| K9 | Phân vai trên không / mặt đất, quản lý pin cả đội | robot khác độ cao không chặn nhau | Đội drone và máy ném |
| K10 | Chọn part cho từng robot theo đề, ngân sách chung | đề ban tổ chức đổi mỗi năm | Đề ban tổ chức |

## 3. Khuôn chương 1 `doi-<gói>` (10 màn, dùng chung cho mọi gói đội)

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

### 3b. Khuôn chương 2 `che-doi-<gói>` (chế lệnh phối hợp)

| Màn | Hàng | Dạng |
|---|---|---|
| 1–3 | làm quen | Tự chế một hàm phối hợp (`taoHam`, tên cốt truyện mới, không trùng kho), dùng ngay trong một tình huống: hàm chờ / bàn giao / mở đường |
| 4–6 | luyện | Dùng hàm vừa chế cho **cả hai robot** hay trong vòng lặp; một màn có robot tự động khóa gọi hàm đó |
| 7–9 | biến thể | Sửa hàm phối hợp hỏng (hàm của màn, `chinhCoDinh` hay robot khóa), cờ riêng `doi[i].co` cho bài đổi chỗ |
| 10 | trùm | Ba sân, cả đội dùng các hàm đã chế |

## 4. Các gói đội

Tình huống dưới đây chạy được trên luật lõi hiện có. Mỗi gói ghép part mới với part liền trước; robot nào thêm cảm biến khoảng cách / tay kẹp
là tùy màn (part đã học thì dùng được).

**Đội vượt hố và băng chuyền — chương 2** (xe + nhện): chế hàm bàn giao (nhện `ferry(path)` chở hộp qua hố rồi đặt; xe `take_box()` chờ rồi nhặt);
xe tự động khóa, em viết nhện đếm nhịp theo chương trình xe; cờ riêng: nhện và xe đổi phía cho nhau.

**Đội xích và nhện** (K3 robot tự động): cả hai leo bậc S; xích đứng vững trên băng, quay chậm 2 nhịp; nhện bật hố, chui gầm, bị băng đẩy, không cảm biến.
Xích đứng trên băng làm **chốt** cho nhện đang bị băng đẩy dừng đúng ô; xích chở hộp lên bậc, nhện chở qua hố; xích tự động khóa (quay chậm) —
em đọc chương trình xích để tính nhịp cho nhện. Trùm: ba kho bậc / hố khác nhau.

**Đội omni và xích** (K4 nhường đường): omni trượt ngang không quay, bị băng đẩy; xích không bị băng đẩy nhưng quay chậm. Hành lang một làn có hốc:
omni trượt vào hốc cho xích qua; băng ngang lối: xích đi thẳng qua, omni trượt né; xích tự động khóa chạy đi chạy lại, omni canh lúc bằng cảm biến.

**Đội súng hơi và omni** (K5 mở đường): súng hơi bắn nút N đổi cửa C/c và bật tắt băng, giật lùi đẩy thùng nặng H; omni chở vật nhẹ, trượt qua lối vừa mở.
Omni chờ cửa mở bằng `while not front_clear(): wait()`; thứ tự sai (đóng cửa khi omni ở giữa) thì kẹt; súng hơi tự động bắn theo chu kỳ.

**Đội màu và súng hơi** (K6 báo nhau bằng vị trí): robot camera đọc màu nhưng không bắn được; robot súng hơi không đọc màu. Robot camera đặt hộp / đứng
bên trái hay phải làm tín hiệu, robot súng hơi hỏi `left_clear()` / `right_clear()` rồi bắn đúng nút (mở cửa của màu đó). Trùm: thứ tự màu đổi theo sân.

**Đội nam châm và màu** (K7 đường lui): nam châm hút sắt 2 ô, đẩy vật cùng cực 3 ô, `front_metal()` / `front_pole()`; robot màu phân loại.
Vật gỗ thì nam châm bó tay: robot kia chờ có giới hạn (`for` + `if not front_clear()`), quá hạn thì tự đi lấy. Trùm: một sân vật gỗ.

**Đội tay xoay và nam châm** (K8 dây chuyền): nam châm hút vật từ xa về ô bàn giao, tay xoay gắp bên này đặt bên kia không quay xe (4 nhịp mỗi vật);
ô bàn giao còn vật thì robot trước chờ; nhiều vật, cả hai lặp; nhịp cả đội là thước đo.

**Đội tay gắp và máy ném — chương 2** (tay xoay + máy ném): tay xoay đặt vật sang ô trước mặt máy ném không cần quay; chế hàm `feed()` / `relay_throw(n)`.

**Đội drone và máy ném** (K9 khác tầng): drone bay qua rào / băng / vật, không chặn robot mặt đất, pin + ô sạc P, nam châm treo hút sắt, camera `look()`;
máy ném ném qua rào. Drone trinh sát màu rồi thả hộp ở chỗ báo hiệu; máy ném ném hộp sang bên drone chở tiếp; drone tự động chạy theo pin.

**Đề ban tổ chức** (gói cuối, sau Lắp ráp: Đủ bộ; K10) **[cần G3, G4]**: màn 1–4 R1 tự động có sẵn, em chọn part cho R2 trong ngân sách; màn 5–9 chọn part
cho cả hai, ngân sách chung, ≥ 2 đội hình thắng, không đội hình nào hơn hẳn; màn 10 "đề năm nay" ba sân. Mở đầu mỗi màn bằng **tờ đề**.

## 5. Việc lõi và giao diện cần thêm

| Mã | Việc | Vì sao | Công |
|---|---|---|---|
| G1 ✅ | **Robot khóa trong màn nhiều robot**: `doi[i].coDinh: true` — thẻ R của robot đó chỉ đọc, có ổ khóa, chương trình lấy từ `maMau.doi[i]`, nháp cũ không ghi đè; máy chấm từ chối bài làm sửa robot khóa | dạng bài "R1 tự động sẵn" (K3) | nhỏ: mở rộng `chinhCoDinh` hiện có (man-choi.js, thanh-phan.js) theo từng robot |
| G2 ✅ | **Mục tiêu theo robot**: cờ / đích có chủ (vd `cfg.chu = [{ x, y, robot: 0 }]` hay ký hiệu sân riêng), `toi-co` mỗi robot đúng cờ của mình; mở `bong-mo` cho nhiều robot | hết đường tắt "cờ nào cũng được" (KE-HOACH-HAI-ROBOT.md đã ghi), cho phép bài đổi chỗ / đổi hàng | vừa: san-hoc.js, cham.js, san-ve.js (vẽ màu chủ) |
| G3 | **Lắp ráp cho đội**: `lapRap.doi = [{ khe… } , …]`, ngân sách chung hay riêng, robot khóa không chọn được; màn Lắp robot có thẻ R1 / R2; `LapRap.kiemCanMan` duyệt tổ hợp đội (giới hạn danh mục mỗi màn để số tổ hợp nhỏ) | gói Đề ban tổ chức, chế độ thi | lớn: lap-rap.js, man-lap.js, máy kiểm |
| G4 | **Tờ đề** (màn hình đọc đề trước khi lắp): sân thu nhỏ, nhiệm vụ, trần cứng, part được phép | giao diện dùng lại cho Robocon | vừa |
| G5 | **Bộ dò chung cho đội khác thân**: BFS chạy thật `SanHoc.chay` trên trạng thái hai robot (như do-duong-rap-du.mjs), hoặc tối thiểu bộ "lời sai tiêu biểu" chạy cho mọi màn | bộ dò hiện tại chỉ hỗ trợ hai xe kẹp | vừa |
| G6 ✅ | `hoc/kiem-goi-doi.mjs` (thay cho mở rộng kiem-lo-trinh): mọi gói `doi-*` qua cùng bộ luật mục 3 (không trùng, mẫu không thắng, cần cả hai robot, robot khóa không đổi) | giữ chất lượng khi thêm 80 màn | nhỏ |

Chế độ thi về sau (ngoài phạm vi kế hoạch này): tính điểm trong N nhịp thay vì thắng / thua, đối thủ, trần mềm (tham-khao-robocon §5.3).

Đã làm (24/10): **G1** (`doi[i].coDinh`: thẻ R có ổ khóa, khung chỉ đọc, nháp cũ không đè; hàm `khungCoDinh` ở game/man-choi.js),
**G2** (`doi[i].co = [{x,y}]` hay mảng theo sân: lõi chỉ tính tới cờ khi đúng chủ, `SanHoc.coCuaSan`, sân vẽ vạch màu robot dưới cờ riêng),
**G6** (`hoc/kiem-goi-doi.mjs`), khung gói hai chương (`ManHoc.chuongThem`), công cụ đo sao `tools/do-goi-doi.mjs`. Sửa kèm: rổ có sẵn vật của
robot máy ném trong màn nhiều robot giờ được vẽ (trước chỉ vẽ ở màn một robot).

## 6. Thứ tự làm

1. Nền chung (xong 24/10).
2. Các gói đội, mỗi gói một phiên riêng, chạy song song được (mỗi phiên chỉ sửa tệp gói của mình + máy kiểm riêng): Đội xích và nhện, Đội omni và xích,
   Đội súng hơi và omni, Đội màu và súng hơi, Đội nam châm và màu, Đội tay xoay và nam châm, Đội drone và máy ném, chương 2 của Đội vượt hố và
   Đội tay gắp và máy ném.
3. Ráp các nhánh, chạy toàn bộ máy kiểm, chơi thử.
4. **G3 + G4 + G5**, rồi gói Đề ban tổ chức.

## 7. Đã chốt (24/10)

20 màn mỗi gói (hai chương); gói đội đứng ngay sau gói part, ghép với part liền trước; robot tự động luôn cho xem chương trình, không hộp đen
(hộp đen để dành cho robot đối thủ); làm các gói đội trước; không bắt buộc có robot gốc; giữ tên gói Dò đường.

## 8. Cách làm một gói đội (cho từng phiên)

1. Đọc tệp gói rỗng `hoc/man-doi-<gói>.js`, mẫu `hoc/man-doi-ho-bang.js` (cách khai robot từng phần `doi[i]`, `B(c1, c2)`, hàm `man()`), mục 3 / 3b / 4 ở trên,
   luật lõi của các part liên quan ở đầu `hoc/san-hoc.js` và tệp chương part (`man-<part>.js`, `man-che-<part>.js`) để biết hàm kho đã có.
2. Chỉ sửa: `hoc/man-doi-<gói>.js`, `hoc/kiem-doi-<gói>.mjs` (máy kiểm riêng: lời sai đặc thù, lối tắt, ý của từng màn). Không sửa tệp chung
   (`lo-trinh-hoc.js`, `lo-trinh-sao.js`, `thu-tu-chuong.js`, `choi.html`, `huy-hieu.js` đã có sẵn chỗ cho gói). Cần đổi lõi thì dừng lại hỏi.
3. Màn dùng chương `doi-<gói>` (10 màn) và `che-doi-<gói>` (10 màn, khai `chuong: 'che-' + CHUONG`). Robot khóa: `doi[i].coDinh = true` và chương trình ở
   `maMau.doi[i]` (trùng `loiGiai.doi[i]`). Cờ riêng: `doi[i].co`.
4. Thử từng màn bằng máy chấm (chạy lời giải, mẫu, vài lời sai), rồi `node tools/do-goi-doi.mjs hoc/man-doi-<gói>.js --ghi` để ghi ngưỡng sao.
5. Xong khi: `node hoc/kiem-goi-doi.mjs`, `node hoc/kiem-doi-<gói>.mjs`, `node hoc/kiem-lo-trinh.mjs` đều đạt, rồi `npm test` đủ bộ; mở 2 màn trong game
   (`hoc/game/choi.html?debug=1&man=doi-<gói>.4`) xem sân và robot vẽ đúng. Commit trên nhánh của phiên.
