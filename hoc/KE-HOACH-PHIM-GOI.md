# Kế hoạch phim ngắn mở mỗi gói (27/10/2026, user đồng ý)

**27/10 đã làm** (f027ac0 … b2671cc): bộ máy `game/phim-goi.js`, dữ liệu `game/phim-mua-1.js` (9 phim, gói combo khai sẵn), nút ▶ xem lại trên hộp gói, Cài đặt "Xem lại phim các gói", máy kiểm `kiem-phim-goi.mjs`.
Đã quyết khi nghiệm thu: R1 trong phim theo màu sơn người chơi chọn (bảng sơn không có màu lam nên không trùng R2); phim gói 10 vẽ R1 có tay xoay (trùm mới của gói 10 sẽ dùng tay xoay).

**29/10 user duyệt: nhân vật chính là EM (người chế tạo), R1 là bộ não robot của em** (KE-HOACH-7-MUA.md, Quy tắc đặt tên, mục 6). Đã viết lại lời phim mở đầu
(md.1, .4, .5, .6) và phim gói mùa 1 có cảnh nhặt / lắp đồ theo góc nhìn em; hình giữ nguyên. Phim mùa 2 viết lại cùng đợt vòi phun / van hơi.

User 27/10: "mỗi gói bạn làm 1 đoạn hoạt hình ngắn giống đoạn mở đầu để giới thiệu các robot, cơ chế mới trong màn".

## 1. Có sẵn gì
- **Phim mở đầu** `hoc/game/mo-dau.js` (window.MoDau): 6 khung hoạt hình pixel, mỗi khung một câu chữ; chạm khung hay nút **Tiếp** để sang; **Bỏ qua** ở góc;
  hình lấy từ bộ vẽ sẵn có (`VeRobot.ve` cho robot, `Ve.ico` cho xe / thùng / icon đèn bộ phận, `Ve.tiles()` cho tường, thùng gỗ, cờ); chuyển động bằng CSS (`md-nhun`, `md-quay`, `md-di`, `md-bat`, `md-lac`… trong `game/choi.css`);
  tiếng qua `AmThanh.phat`. Chiếu một lần (cờ `Luu.daXem('mo-dau')`), Cài đặt có nút xem lại. Chữ ở `game/chu.js` (`md.1` … `md.6`).
- **Truyện** của phim mở đầu: xe chở linh kiện sụp ổ gà, bộ phận văng khắp xưởng (tay kẹp kẹt dưới thùng gỗ, đèn cảm biến, **bánh xích**, **cánh drone**), còn R1 chỉ có thân hai bánh. Mỗi gói bộ phận là một món R1 tìm lại.
- Bảng **"MỞ GÓI MỚI!"** (`game/bang-mo-khoa.js`, gọi từ `App.baoGoiMoi` trong `game/ung-dung.js`) hiện khi đủ sao mở gói.

## 2. Làm gì
1. **Bộ máy phim chung** `game/phim-goi.js` (window.PhimGoi): tách phần chiếu của mo-dau.js (lớp phim, khung, chữ, chấm, Tiếp, Bỏ qua, hẹn giờ tiếng) thành hàm dùng chung;
   `PhimGoi.mo(maGoi, khiXong)` chiếu phim của gói `maGoi` nếu có; MoDau giữ nguyên hành vi (dùng lại bộ máy hay để nguyên đều được, không được đổi phim mở đầu).
2. **Khi nào chiếu**: lần đầu người chơi **vào một gói** (bấm hộp gói, trước lưới màn), một lần mỗi gói (cờ `phim-goi:<mã gói>`). Hộp gói đã xem có nút nhỏ ▶ để xem lại; Cài đặt có "Xem lại phim các gói" (danh sách gói đã mở).
3. **Mỗi phim 3–4 khung, mỗi khung một câu ≤ 14 từ**, chữ ở `chu.js` (`pg.<mã gói>.<n>`). Hình chỉ dùng bộ vẽ sẵn có + CSS; R1 sơn vàng; R2 sơn lam (`son: 'lam'`).
   Khung cuối của phim bộ phận cho thấy **lệnh mới** dạng code (như khung 6 của phim mở đầu) để nối thẳng vào màn đầu của gói.
4. Phim là dữ liệu (một mảng khung cho mỗi gói) trong `game/phim-mua-1.js`; các mùa sau thêm `phim-mua-2.js`… cùng bộ máy.

## 3. Kịch bản mùa 1 (theo bảng 10 gói ở KE-HOACH-MUA-1.md)

| Gói | Khung 1 | Khung 2 | Khung 3 | Khung 4 |
|---|---|---|---|---|
| 1 Xe hai bánh | (dùng phim mở đầu, không làm mới) | | | |
| 2 Tay gắp | R1 lăn tới thùng gỗ; tay kẹp thò ra dưới gầm, lắc lắc. "Tay kẹp kẹt dưới thùng gỗ!" | tay kẹp bay lên, gắn vào mũi R1, chữ CẠCH! | R1 hạ tay, kẹp thùng, nhấc lên | code `arm_down()` `grab()` `arm_up()` hiện từng dòng; R1 đặt thùng vào ô đích khung vàng, sao lóe |
| 3 Cảm biến khoảng cách | R1 chạy thẳng, đâm tường RẦM, sao quay trên đầu | đèn cảm biến xanh lăn ra từ góc xưởng | gắn cảm biến; tia quét trước mũi, gặp tường tia đỏ, R1 dừng kịp | code `while front_clear():` + `move()`; R1 dừng sát tường |
| 4 Kho hàng (nút đè) | cửa kho đóng; trên sàn có ô nút đè | R1 lăn lên nút: cửa mở; R1 rời nút: cửa đóng sập, "?!" | R1 đặt thùng gỗ lên nút, cửa mở, R1 đi qua | (không cần) |
| 5 Bánh lùi | R1 vào ngõ cụt hẹp, hai bên tường, không quay được, "?" | hộp linh kiện bật nắp, hai bánh R1 sáng lên | R1 lùi ra khỏi ngõ, vệt bánh | code `left_back()` `right_back()` `wait()` |
| 6 Tay xoay | thùng nằm bên trái R1; R1 phải quay cả xe (mũi tên vòng, 2 nhịp) | khớp xoay lấp lánh nằm trên kệ, gắn vào tay | tay xoay sang trái nhặt thùng, xe đứng yên | code `arm_left()` `grab()` |
| 7 Cảm biến bên | R1 ở ngã ba mê cung, "?" | hai mắt nhỏ gắn hai bên hông, tia trái / phải quét | R1 bám tường phải, đi ra khỏi mê cung tới cờ | code `if right_clear():` |
| 8 Đội hai robot | cửa xưởng mở, R2 sơn lam lăn vào | R1 và R2 nhìn nhau; hai bảng code R1 / R2 hiện cạnh nhau | R1 chuyền thùng cho R2, R2 đưa vào ô đích | (không cần) |
| 9 Combo (tay xoay + cảm biến bên) | kho chật, thùng nằm hai bên lối đi | cảm biến bên nháy ở bên có thùng, tay xoay sang đúng bên đó nhặt | R1 lướt dọc lối đi, nhặt hai bên không cần quay xe, chồng thùng xong | |
| 10 R1 xuất xưởng | R1 đủ bộ (tay xoay, cảm biến) giữa xưởng, các huy hiệu mùa 1 bay quanh | cánh cửa lớn của xưởng mở, ánh sáng tràn vào; **tem XUẤT XƯỞNG** đóng xuống, bảng tên **"Xe chở hàng R1"**, ba part (hai bánh, tay xoay, cảm biến) (29/10, mục 3c) | R1 lăn ra ngoài; xa xa trên đồi thấy **bánh xích** văng hôm trước (nhá mùa 2) | |

Ghi chú:
- Gói 9 và 10 chưa có màn mới (gói F, G); phim vẫn làm được vì chỉ dựa vào part đã có.
- Gói 10 đổi tên thành **"R1 xuất xưởng"** (user 27/10 đồng ý). Làm sau khi gộp gói B (cùng sửa `lo-trinh-hoc.js`).
- **User 27/10: các mùa khác cũng phải có phim** cho mọi gói. Kịch bản mùa n viết cùng lúc lên danh sách màn mùa n (KE-HOACH-MUA-n.md), dữ liệu ở `game/phim-mua-n.js`.
- Mùa sau: phim mở gói bộ phận = R1 tìm lại món văng mất (xích, cánh drone…) hay nhận món mới; phim gói sân = cơ chế mới làm gì; phim gói đội = robot mới xuất hiện.

## 3b. Kịch bản mùa 2 "Ghi nhớ" (28/10, theo mảng MUA_2 của lo-trinh-hoc.js và KE-HOACH-MUA-2.md; dữ liệu `game/phim-mua-2.js`)

Truyện nối phim gói 10 mùa 1: R1 ra khỏi xưởng, nhặt lại bánh xích trên đồi, nhận vòi phun (mã súng hơi `hoi`), mắt hồng ngoại, gặp lại R2, rồi làm nhà máy cũ chạy lại;
phim cuối nhá mùa 3 "Tín hiệu" (chân nhện, nam châm, sóng từ). R1 vẽ theo phần đã có ở gói đó (xích → xích + vòi phun → xích + vòi phun + hồng ngoại); R2 hai bánh + vòi phun + hồng ngoại, sơn lam.
Hình: sân mini nhìn từ trên (`c.san`, ô 56 px) hay dải sàn; cơ chế mới (băng chuyền chạy, van hơi (nút bắn N) + quầng nóng, thùng nặng, khối nước + tia nước của vòi phun, 29/10 thay bóng hơi) vẽ thêm trong `phim-vector.js` (`PhimVector.bang / nutBan / thungNang / bong / nong`), ở pixel rơi về `Ve.tiles` / `Ve.ico`.
Lời ở `chu.js` khóa `pg.<mã gói>.<n>`; lệnh trong khung code là lệnh / hàm thật của màn (`tr_right` xich.3, `forward(n)` tham-so.3, `distance`, `push(n)` che-day-thung, `shoot("fast" | "charge")`, `warm`).

| Gói | Khung 1 | Khung 2 | Khung 3 | Khung 4 |
|---|---|---|---|---|
| 1 Bánh xích `xich` | **đơn việc** (29/10, mục 3c): xa xa nhà máy cũ đứng im (`PhimVector.nhaMay`, xám, cửa sổ tối); bánh xích nằm trên đồi nhấp nháy; R1 hai bánh lăn tới, "!" | xích bay vào thân, R1 thành xe xích, CẠCH! (lời 29/10: bám chắc, leo được đống đổ nát; bỏ "như xe tăng") | xích quay chậm: nhịp 1 nửa góc, nhịp 2 đủ góc vuông | code `def tr_right(): for i in range(2): left_move(); wait()`, R1 quay hai nhịp; lời nhắc biến `n` đếm bước (chương 2) |
| 2 Súng hơi `sung-hoi` (hình: vòi phun) | sau đống thùng có một vòi phun lắc lắc (`PhimVector.voiPhun`); R1 xích lăn tới | vòi phun bay lên mũi xe, CẠCH! | `shoot()`: tia nước phun ra trước, xe giật lùi một ô, PHỤT! | code `shoot_back()` + `def forward(n)`; R1 bắn ra sau, giật tới |
| 3 Hồng ngoại `hong-ngoai` | tường phía trước, "?": còn xa hay gần? | mắt hồng ngoại đỏ lăn ra, gắn lên mũi, CẠCH! | tia đỏ tới tường, số 1 2 3 bật lên từng ô | code `d = distance()` `for j in range(d): move()`, R1 đi đúng 3 ô dừng sát tường |
| 4 Nhà máy `nha-may` | băng chuyền đứng yên, cửa đóng, van hơi đóng, "?" | băng chạy, thùng nặng trôi theo mũi tên | R1 quay lên bắn trúng van: van quay mở (quầng nóng, hơi bốc), cửa cuối băng mở | thùng nặng sau xe: xe bắn, cú giật hất thùng lùi một ô, HẤT! |
| 5 Đẩy thùng `day-thung` | thùng nặng chắn lối, bắn vào: BỤP, thùng rung, không nhúc nhích | xích tiến hai lần, thùng trượt hai ô vào ô đích, sao | sau thùng là tường: RẦM, thùng kẹt | code `def push(n)` … `push(2)`, R1 đẩy thùng vào ô đích |
| 6 Lực bắn `luc-ban` | `shoot("charge")`: tia nước tới van, van mở, xe giật lùi | `shoot("fast")`: khối nước bay 2 ô (số 1, 2) rồi rơi, xe đứng yên | code `if distance() > 1: shoot("charge") else: shoot("fast")`; tia đo, bắn nhanh trúng van gần | |
| 7 Đo nhiệt `do-nhiet` | van đang mở (nóng); R1 lỡ bắn vào, van đóng, "?!" | R1 dùng tia hồng ngoại: van nóng hiện NÓNG!, để yên; sang van nguội, bắn cho mở | code `if not warm(): shoot()`; van nguội được bắn mở, quầng nóng hiện | |
| 8 Đội `doi-mua-2` | cửa xưởng mở, R2 (hai bánh, vòi phun, hồng ngoại, sơn lam) lăn vào | R1 chạy ngang qua trước mũi R2: tia của R2 thấy R1, NÓNG!, R2 chờ | R1 qua, đường trống: R2 bắn trúng van, cửa mở, R1 đi tiếp | hai bảng code R1 `forward(4)` / R2 `while warm(): wait()` `shoot()` |
| 9 Bệ vòi xích `be-sung` (tên cũ Bệ súng xích) | R2 hai bánh bắn tụ: giật lùi, hất thùng nặng phía sau, HẤT! | R1 xích bắn tụ cùng chỗ: xe rung nhẹ, đứng yên, VỮNG! | R1 đứng một chỗ quay ba hướng, bắn ba van, số 1 2 3 | |
| 10 Xe cứu hỏa R1 xuất xưởng `nha-may-chay` (29/10: khuôn mục 3c, 4 khung; user đổi từ "Xe tăng R1": robot chữa cháy bánh xích) | R1 đủ bộ giữa nhà máy, 10 huy hiệu mùa 2 bay quanh | **tem XUẤT XƯỞNG** đóng xuống, bảng tên **"Xe cứu hỏa R1"**, ba part: xích, vòi phun, mắt hồng ngoại như camera nhiệt | việc được gỡ: hai van mở, hai băng chạy, thùng nặng trôi, R1 và R2 vui (nhà máy chạy lại) | ngoài xưởng, cửa hầm mỏ trên đồi, xa xa nhấp nháy chân nhện, nam châm, sóng từ, "?" (nhá mùa 3: mỏ quặng) |

Ghi chú mùa 2:
- Gói 10 `nha-may-chay` chưa có màn (đang viết song song) nên chưa vào ThuTuChuong.goi; phim khai sẵn, máy kiểm lấy danh sách gói từ mảng MUA_2 (đọc nguồn).
  Khi gói 10 xong: xem lại khung 2 (nếu trùm có cơ chế riêng thì cho vào) và danh sách huy hiệu bay ở khung 1 (thêm huy hiệu `tong-hop-2` / `trum-mua-2` nếu có).
- Huy hiệu mùa 2 nào chưa có bản vector thì ở vector phim 10 vẽ icon bộ phận thay (không để canvas pixel trong phim vector); khi V7a có bản vector thì tự dùng.
- Gói 8, 9 (thử thách) và 4, 5, 6, 7 (sân / nâng cấp) không bắt buộc khung code; 4 gói 5, 6, 7, 8 vẫn có code vì lệnh / hàm mới là ý chính của gói.

## 3c. Sợi dây chung 7 mùa (user 29/10: "end mùa nên kiểu giống mùa 1 xuất xưởng")

Truyện khung: **mỗi mùa R1 lắp một cỗ máy cho một nơi đang cần**, gói 10 là **cỗ máy đó xuất xưởng** (như "R1 xuất xưởng" mùa 1).
Cỗ máy và nơi làm việc của từng mùa: KE-HOACH-7-MUA.md mục "Cỗ máy của mỗi mùa".
Chuỗi nơi: kho hàng → nhà máy → mỏ quặng → thành phố → sân bóng → núi tuyết → xưởng của em.

Khuôn phim chung (mọi mùa, viết vào kịch bản khi lập danh sách màn của mùa):
- **Gói 1, khung 1: đơn việc.** Nơi mới hiện ra cùng việc đang kẹt (vd mùa 3: quặng nằm bên kia khe nứt, xe bánh không qua được). Khung sau như cũ: R1 nhặt / nhận thân mới.
- **Gói 10 "<cỗ máy> xuất xưởng"**, 4 khung:
  1. R1 đủ bộ giữa xưởng, huy hiệu mùa bay quanh (như hiện nay).
  2. **Tem XUẤT XƯỞNG** đóng lên, hiện tên cỗ máy (vd "Xe cứu hỏa R1") và ba part ghép thành nó.
  3. Cỗ máy làm đúng việc ở nơi cần nó (kho chạy, nhà máy chạy, quặng về bãi…): việc kẹt ở gói 1 khung 1 được gỡ.
  4. Nhá mùa sau: part hay nơi mới nhấp nháy xa xa (như hiện nay).
- Mùa 7: phim cuối là **máy của em xuất xưởng**, sáu cỗ máy các mùa trước xếp hàng chào.
- Ý thêm (chưa làm, cần giao diện): **sổ cỗ máy**, mỗi lần xuất xưởng được một trang phiếu (tên máy, ba part, nơi làm việc, máy thật ngoài đời giống nó).

Phải sửa phim đã có (ĐÃ LÀM 29/10, nhánh claude/phim-xuat-xuong; tem dùng chung: `PhimVector.xuatXuong({ tem, ten, part, t })` ở phim-vector.js, chữ ở chu.js `pg.tem.*`):
- Mùa 1 gói 10 (`robot`): khung 2 thêm tem XUẤT XƯỞNG và tên **"Xe chở hàng R1"**; còn lại giữ.
- Mùa 2 gói 10 (`nha-may-chay`, phim-mua-2.js + chu.js `pg.nha-may-chay.*`): đổi theo khuôn; tên hiển thị gói đề xuất **"Xe cứu hỏa R1 xuất xưởng"** (user 29/10 bỏ "xe tăng": chủ đề chiến tranh) (mã gói giữ nguyên).
  Khung 3 giữ ý "nhà máy chạy lại" làm việc được gỡ; khung 1 gói 1 mùa 2 (`xich`) thêm ý đơn việc: nhà máy cũ đứng im.
- Mùa 3 trở đi: viết thẳng theo khuôn (mùa 3: "Xe thăm dò R1 xuất xưởng").

## 3e. Kịch bản mùa 4 "Thành phố" (30/10, phiên Mùa 4; theo mảng MUA_4 của lo-trinh-hoc.js và KE-HOACH-MUA-4.md; dữ liệu `game/phim-mua-4.js`)

Truyện: thành phố mới có vạch kẻ đường mờ hết, xe đi lộn xộn (đơn việc, khuôn mục 3c). Em lắp cánh quạt cho R1 thành drone, rồi máy sơn, camera bốn hướng;
nâng cấp đáp sạc, bút liền, mắt nhìn dưới chân; R2 trở lại ở gói đội; gói 9 gắn máy sơn dưới bụng drone; gói 10 "Drone kẻ vạch R1 xuất xưởng", phim cuối nhá mùa 5 (sân bóng).
Hình: ô của mùa 4 (sàn màu, hộp màu khoi-sat, ô sạc, hàng rào, hố, ô đích màu, ô đã sơn) vẽ bằng VeVector như trên sân chơi (`san4` trong phim-mua-4.js), canvas đánh dấu laVector;
nhà phố, mặt đường, sân bóng, thanh pin vẽ bằng div. Lời ở chu.js khóa `pg.<mã gói>.<n>`, tên cỗ máy `pg.tem.drone-ke-vach`.

| Gói | Khung 1 | Khung 2 | Khung 3 | Khung 4 |
|---|---|---|---|---|
| 1 Cất cánh `drone` | **đơn việc**: phố mới, vạch mờ, hai xe lắc lư lộn xộn, R1 hai bánh lăn tới, "?" | cánh quạt bay tới, R1 thành drone, CẠCH!, bay lên | sân mini: drone bay qua hàng rào, thanh pin mất một vạch mỗi ô | code `go_up()` `go_right()` `path = ["right", "down"]` |
| 2 Chấm sơn `may-son` | hàng ô khung vàng cần tô, R1 xe chưa có gì, "?" | máy sơn bay lên mũi xe, CẠCH! | xe chấm đỏ, vàng, đỏ cách ô | code `for c in [...]: ink(c); dot(); move()` |
| 3 Camera bốn hướng `cam-bon` | ngã tư, nhánh trái màu xanh, "?" | camera lên nóc xe, CẠCH! | bốn vòng nhìn bốn phía, vòng trái xanh; xe quay trái, đi theo | code `if color("left") == "green": turn_left()` |
| 4 Phố màu `pho-mau` | drone chở hộp đỏ xuống ô đích xanh: "?!" | drone nhìn hai ô đích, vòng đỏ / xanh, "!" | hộp đỏ về ô đỏ, sao | |
| 5 Trạm sạc `tram-sac` | pin cạn giữa phố, drone rơi xuống đường, "!?" | món ô sạc bay vào drone, CẠCH! (nâng cấp) | drone đáp trên P, pin đầy (ĐẦY!), cất cánh bay tiếp | code `land()` `take_off()` `if battery() < 3:` |
| 6 Nét liền `net-lien` | xe chấm từng ô, chậm, "?" | bút (icon edit) bay vào máy sơn, CẠCH! | xe đi bốn ô, vạch xanh dương kéo theo | code `pen_down()` `forward(3)` `pen_up()` |
| 7 Nhìn dưới chân `nhin-duoi` | drone đứng trên hộp đỏ, camera bốn hướng không thấy, "?" | mắt nhìn xuống lắp thêm, CẠCH! | vòng đỏ quanh hộp dưới bụng, drone chở hộp về ô đích đỏ | code `c = color("here")` |
| 8 Đội chia hàng `doi-nam-cham` | R1 xe nam châm chờ, R2 (kẹp + camera, sơn lam) lăn vào, "!" | R1 hút hộp qua rào (HÚT!), quay, đặt trước mũi R2 | R2 nhìn màu, quay lên, đặt hộp vào ô đích cùng màu | hai bảng code R1 `hand_off()` / R2 `hold_on(3)` `sort_by_color()` |
| 9 Sơn từ trên cao `son-tren-cao` | xe máy sơn đụng hàng rào (CỘP!), vạch bên kia chưa kẻ | máy sơn gắn dưới bụng drone, CẠCH! | drone kẻ vạch vàng, ô rào bỏ trống | code `pen_up()` `go_right()` `pen_down()` |
| 10 Drone kẻ vạch R1 xuất xưởng `drone-ke-vach` | drone đủ bộ, tám món của mùa bay quanh (cánh quạt, máy sơn, camera, ô sạc, pin, bút, nam châm, tay kẹp) | **tem XUẤT XƯỞNG**, tên **"Drone kẻ vạch R1"**, ba part: cánh quạt, máy sơn, camera | phố sáng đèn: drone bay ngang, vạch giữa đường sáng vàng từng đoạn, hai xe đi đúng làn (việc kẹt ở drone.1 được gỡ) | nhá mùa 5: xa xa sân bóng, hai đèn sân và quả bóng nhấp nháy, "?" |

Ghi chú mùa 4:
- Huy hiệu mùa 4 chưa có (chương mùa 4 chưa có bản vector); khung 1 gói 10 dùng icon bộ phận thay huy hiệu. Khi có huy hiệu mùa 4 thì đổi sang như phim gói 10 mùa 2.
- Mùa 4 còn ẩn: phim chỉ chiếu khi mùa mở. Máy kiểm: kiem-phim-goi.mjs mục 1c, kiem-huy-hieu-phim-vector.mjs B2 (canvas vector).
- Phim mùa 3 chưa có (phiên Mùa 3 sẽ đặt phim-mua-3.js giữa phim-mua-2.js và phim-mua-4.js trong choi.html).

## 4. Kiểm
- Máy kiểm `kiem-phim-goi.mjs` (Node): mọi gói mùa 1 trừ gói 1 có phim; mỗi phim 3–4 khung; mọi khóa chữ `pg.*` có trong chu.js; câu ≤ 14 từ; cờ đúng mã gói.
- Trình duyệt: người giao bấm xem từng phim (vào gói lần đầu, xem lại bằng ▶), kiểm Bỏ qua, chạm khung, không lỗi console, đúng cỡ trên màn hình điện thoại.
