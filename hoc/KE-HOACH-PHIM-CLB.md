# Kế hoạch phim CLB Mật Lệnh Robot (30/10/2026, khung truyện user đã chốt)

User 30/10: phim hiện có chưa kể được cốt truyện xuyên suốt, và ý "rẽ phải = bánh trái chạy, bánh phải đứng" khó hiểu với người chơi thường.
Hướng mới: **cốt truyện là ứng dụng của CLB robot, hành trình đưa robot vào đời sống**; phim nhìn **từ trên xuống**; dựng bằng **TopView** (như ảnh mascot) ghép với lõi game.
Thay phần giọng kể của KE-HOACH-PHIM-GOI.md (mục 3c giữ khuôn gói 1 / gói 10) và quy tắc 6 của KE-HOACH-7-MUA.md.

**Sửa / làm phim mới: theo [LUAT-SUA-PHIM-CLB.md](LUAT-SUA-PHIM-CLB.md)** (2/11: chữ ít, phim dừng cuối cảnh chờ Tiếp, không che, bản đồ cuộn + xe bám đường, tên không kiểu thứ miền Nam).

## 1. Đã chốt (user 30/10)

- **CLB Mật Lệnh Robot** (trùng tên game).
- **Nhân vật: chỉ Sola và Luna** (mascot diem10code, ảnh ở `diem10code-video/public/mascot/<sola|luna>/`). Không có "em" trong truyện; người chơi viết code giúp hai bạn từ bên ngoài.
- **R1 là robot của Sola, khoá xanh Sola `#38BDF8`** (bỏ bảng sơn R1). **R2 là robot của Luna, hồng `#F472B6`** (bộ vẽ vector đã vẽ hồng).
- Sola hấp tấp, tự tin thái quá, thiên về robot: hay viết vội, chạy thử, R1 làm sai. Luna lanh lợi: chỉ ra chỗ sai, ra đố, gợi ý.
- **Góc nhìn từ trên xuống** cho mọi cảnh robot (khớp sân chơi).
- **Dựng ghép hai loại** (mục 4): TopView cho cảnh kể chuyện, lõi game cho cảnh cơ chế và code.
- **Cỗ máy xuất xưởng thì ở lại nơi đó làm việc**, chạy bằng mật lệnh đã viết; bộ não R1 đi tiếp sang nơi mới, thân mới.
- **Mùa 7**: một sự kiện lớn cần **năng lực của cả sáu cỗ máy** (không cần sáu con). Sola và Luna **mỗi bạn tự chế một robot**, lắp từ các part đã có, rồi điều khiển đi giải cứu.
- **Bản đồ thị trấn và bản vẽ cỗ máy hiện cả ở màn chọn gói**, không chỉ trong phim.
- **Đề bài trong màn: Sola giao việc ("Giúp Sola…"), gợi ý do Luna nói**; màn sửa lỗi: "Sola viết vội, sửa giúp nhé". Người chơi được gọi là "bạn".
- **Áp lực của CLB (user 30/10, sau hội đồng 20261030-2055): thầy hiệu trưởng giao nhiệm vụ: đem kiến thức đã học ra giúp đời.** Thầy chỉ hiện qua thư / lời nhắn, không vẽ. **Luna định hướng đi đâu trước** (Sola hấp tấp muốn nhận hết).
- **Kịch bản theo hội đồng 20261030-2055**: giới thiệu bằng hành động, không tự giới thiệu tên; phim gói 1 dùng "bẫy chữ LEFT" (Sola tưởng left_move() là rẽ trái, xe rẽ PHẢI); Luna chỉ hỏi dẫn, Sola tự nói quy luật; cho người xem đoán trước khi xem. Phim mở đầu ~35 giây, phim gói 1 ~45 giây.
- **Xe trạm thí nghiệm di động (user chốt 30/10):** Sola và Luna lái một chiếc xe cũ của trường (thầy hiệu trưởng giao kèm nhiệm vụ), Luna cải tạo thành trạm thí nghiệm. **Luna chế part, Sola lập trình** (Sola viết vội nên hay sai → "Giúp Sola…"; Luna hiểu bộ phận nên hỏi dẫn). Xe chạy dọc con đường trên bản đồ, mỗi mùa dừng một trạm; trong thùng xe là lab nhỏ có **sa bàn mô phỏng** (màn chơi diễn ra trên sa bàn, hình "lab trắng" giữ nguyên), rồi ra hiện trường làm thật (phim, màn trùm, gói 10). Mùa 7 xe về lại CLB.
- **Màn dọc (user 30/10):** game làm trên màn dọc; bản đồ thế giới kiểu đường dọc như Duolingo (đi từ dưới lên), ảnh nơi chốn sinh lại khổ 9:16.
- **Bỏ vụ xe linh kiện sụp ổ gà**: mỗi mùa CLB nhận part mới theo việc cần làm (không còn sợi dây "đồ văng hôm đầu").

## 2. Khung truyện

**Tiền đề.** CLB Mật Lệnh Robot của Sola và Luna nhận việc từ những nơi đang cần robot trong thị trấn. Mỗi mùa một nơi, CLB chế một cỗ máy giống máy thật ngoài đời
(bảng "Cỗ máy của mỗi mùa", KE-HOACH-7-MUA.md): kho hàng → nhà máy → bãi tái chế → nông trại hoa → mỏ đá → núi tuyết, rồi mùa 7 về CLB (user 30/10: một con đường từ CLB ra xa rồi quay về; mùa 3 đổi từ mỏ quặng, mùa 4 từ thành phố, mùa 5 từ sân bóng).
R1 là bộ não, mỗi mùa được lắp vào thân mới; cỗ máy xuất xưởng ở lại làm việc. Mùa 7: sự kiện lớn, Sola và Luna mỗi bạn chế một robot từ part các mùa, cùng giải cứu.

**Ba sợi dây hiện trên hình** (trong phim và ở màn chọn gói):
1. **Bản đồ thị trấn nhìn từ trên**: phòng CLB ở giữa, sáu nơi quanh. Cảnh mở mỗi phim phóng từ bản đồ vào nơi đang làm. Xong mỗi mùa, nơi đó sáng lên, có cỗ máy đang chạy.
   Ở màn chọn gói: bản đồ là màn chọn mùa.
2. **Bản vẽ cỗ máy** của mùa: ba ô part + ô nâng cấp. Gói 1 hiện ô trống; mỗi phim gói 2–9 kết bằng một ô sáng (góc khung cuối); gói 10 đầy, đóng tem XUẤT XƯỞNG.
   Ở màn chọn gói: bản vẽ nhỏ cạnh danh sách gói.
3. **Cảnh "Ngoài đời"** cuối mỗi mùa: robot thật làm việc giống cỗ máy vừa xuất xưởng, theo nơi đã chốt 30/10 (user 31/10 nhắc sửa: bỏ robot dò mỏ, kẻ vạch, RoboCup):
   mùa 1 robot kho tự hành chở kệ hàng · mùa 2 robot chữa cháy bánh xích · mùa 3 robot phân loại phế liệu ở nhà máy tái chế (tay gắp + nam châm tách sắt) ·
   mùa 4 drone nông nghiệp phun, tưới, gieo hạt trên ruộng · mùa 5 máy đào / khai thác đá điều khiển từ xa · mùa 6 robot và drone cứu hộ núi tuyết · mùa 7 robot cứu hộ sau bão lũ.

**Khuôn phim gói** (4 nhịp, giữ quy tắc 4):
1. Sự cố là **một việc kẹt cụ thể trong việc lớn của nơi đó** (không "tình cờ thấy món đồ").
2. Lắp món mới, CẠCH!
3. Dùng được: việc kẹt được gỡ. Khi gói có lệnh dễ hiểu sai, nhịp này là **Sola làm sai, Luna chỉ ra** rồi chạy lại đúng.
4. Lệnh mới (code sáng từng dòng, khớp chuyển động) + ô bản vẽ sáng lên.

**Gói 1 mỗi mùa:** bản đồ → nơi mới + việc lớn; R1 sang thân mới; bản vẽ ba ô trống.
**Gói 10 mỗi mùa:** tem XUẤT XƯỞNG, cỗ máy làm đúng việc lớn rồi ở lại, nơi đó sáng trên bản đồ, cảnh "Ngoài đời", nhá nơi sau.
**Mùa 7:** gói 1 là sự kiện lớn (cả thị trấn cần năng lực của sáu cỗ máy); Sola, Luna mở kho part, mỗi bạn lắp một robot; gói 10 là hai robot cùng giải cứu xong.

## 3. Phim mở đầu và phim gói 1 (user 30/10: mở đầu = bối cảnh; đoạn dạy lái nằm SAU phần tới kho hàng)

**Phim mở đầu** (`phim-clb/src/PhimMoDau.tsx`, ~40 giây): giới thiệu bối cảnh.

| Cảnh | Nội dung | Nền |
|---|---|---|
| 1 | Bản đồ thị trấn phóng chậm, tên game, sáu nơi lần lượt hiện kèm "?"; chữ chốt "Thị trấn nhỏ, sáu nơi đang cần robot giúp." | the-gioi |
| 2 | Sola: "Mình là Sola. Mình mê chế robot!" Luna: "Mình là Luna. Bọn mình lập CLB Mật Lệnh Robot!" | mua-7 (phòng CLB) |
| 3 | R1 "bộ não robot"; bản vẽ cỗ máy Xe chở hàng R1: thân hai bánh ✓, tay ?, cảm biến ? | mua-7 làm mờ |
| 4 | Phiếu việc kho hàng rơi xuống; Luna đọc; đường CLB → kho sáng dần, R1 chạy trên bản đồ | the-gioi |
| 5 | Tới kho hàng; Sola: "Tới kho hàng rồi! Việc đầu tiên: dạy R1 lái." | mua-1 |

**Phim gói 1 "Xe hai bánh"** (mã gói `xe`, `phim-clb/src/PhimXe.tsx`, ~51 giây), chiếu khi vào gói 1: nền kho hàng làm mờ sau sân.

| Cảnh | Nội dung |
|---|---|
| 1 | Sola viết vội bốn cặp `left_move()` `wait()`, bấm Chạy: R1 quay một vòng tại chỗ, Sola hốt hoảng |
| 2 | Cận cảnh: bánh trái sáng, mũi tên "lăn"; bánh phải chốt đỏ "đứng yên"; dừng 2 giây cho nhìn rồi xe mới xoay 90°, vệt bánh thành cung. Luna giải thích; chữ chốt "Chỉ bánh TRÁI lăn → xe rẽ PHẢI" |
| 3 | `right_move()` rẽ trái (chốt ở bánh trái); `left_move()` + `right_move()` + `wait()` đi thẳng, hai vệt song song |
| 4 | Lệnh mới: ba dòng lệnh, mỗi dòng một việc; Sola: "Đủ cả ba lệnh, R1 đi đâu cũng được!" |

Phim bánh xích (mùa 2 gói 1) dùng lại cận cảnh 2: xích trái chạy, xích phải đứng, mỗi nhịp chỉ được nửa góc nên cần hai nhịp.

## 3b. Ảnh nền cần gen (user 30/10: 1 bản đồ + 7 ảnh mùa, dùng chung cho game và phim)

**Mùa 4 (phiên Mùa 4 báo 30/10, nhánh claude/khung-mua-4):** nông trại hoa dùng đúng 4 màu của game: đỏ = hoa hồng, vàng = hoa cúc, xanh dương = cẩm tú cầu, xanh lá = cỏ ba lá (KHÔNG có tím); ảnh bản đồ / nền mùa 4 vẽ luống theo 4 màu này. Phim gói 1 mùa 4 mở từ bãi tái chế ra đồng quê, gói 10 nhá mỏ đá.

**BẢN ĐỒ HÀNH TRÌNH THEO MÙA (30/10, user: mỗi mùa một ảnh dài cuộn được, 10 điểm = 10 gói, các mùa nối liền):** sinh từng ảnh bằng Image Edit + tham chiếu (Image1 Sola/Luna, Image2 R1 + part, Image3 = ảnh mùa ngay dưới để nối khớp), mỗi lệnh 2 biến thể. Luật ảnh (user 30/10 đổi: ĐI TỪ TRÊN XUỐNG): mùa 1 đường bắt đầu ở cổng CLB trên đỉnh (không có đường nào trỏ vào trường); mùa sau đường vào ĐÚNG GIỮA MÉP TRÊN; ra ĐÚNG GIỮA MÉP DƯỚI; 8% dưới cùng chuyển sang cảnh mùa sau. Chỗ nối GHÉP SẴN bằng `tools/noi-mua.py` (chồng 200 px, ĐƯỜNG CẮT TỐI ƯU: quy hoạch động tìm đường cắt qua chỗ hai ảnh giống nhau nhất, viền mềm 6 px; không hoà mờ cả dải nên hết cây / nhà mờ chồng nhau) → một ảnh dài `public/ban-do/dai-*.jpg`. KHÔNG dùng dải tiêu đề che chỗ nối: điểm dừng cuối mỗi mùa (nút 10) là icon nơi chốn + tên. ĐƯỜNG KHÔNG GÃY Ở CHỖ NỐI (user 31/10): câu lệnh bắt đường THẲNG ĐỨNG ở 10% trên và 10% dưới, cùng bề rộng; `noi-mua.py` đo tâm đường ở vùng chồng và uốn nhẹ phần đầu ảnh dưới cho trùng, lòng đường chuyển mềm 24 px. CHUYỂN CẢNH Ở ĐÁY MỖI MÙA KHÔNG DÙNG CỎ XANH: dùng nền của nơi kế tiếp (vd đáy bãi tái chế = đất nâu sẫm đã cày, sang nông trại). Ảnh trong xe: user chốt bản A (`trong-xe.jpg`). Mùa 3: user 31/10 chốt bản B (`mua-3b.jpg`; bản A bị phế liệu nằm trên luống đất cày của nông trại — dải chuyển cảnh ở đáy phải SẠCH, không mang đồ của mùa trên xuống). Mùa 4 nông trại hoa (user 31/10: đường chỗ nối bị méo vì 3B ra lệch phải; nền đất cày phải ĐI THEO cả mùa): sinh lại với câu lệnh nói rõ VỊ TRÍ ĐƯỜNG VÀO = chỗ đường mùa trên ra (đo bằng máy, 3B ra ở x≈60%) và NỀN ĐẤT NÂU SẪM PHỦ CẢ ẢNH; dùng `mua-4a.jpg` (vào x≈621, chỉ uốn 32 px), Studio BanDoMua-4; đáy sỏi đá xám sang mỏ đá. Bản cũ (nền đất vàng, đường vào giữa) cất ở `tam-anh/s4-a.png`, `s4-b.png`. Từ mùa 5: đo chỗ đường mùa trên ra rồi ghi tỉ lệ đó vào câu lệnh. Đường 3B ra lệch phải ~113 px dù câu lệnh bảo giữa: `noi-mua.py` khi lệch ≥ 50 px chỉ uốn trong vùng chồng (dải đất cày sọc ngang, dịch quấn vòng không lộ), đường cắt ép ở phần trên, đường thành một khúc cua — không uốn sâu vào ảnh dưới để khỏi làm xiêu nhà. MÀU NỀN RIÊNG TỪNG MÙA (user 31/10: mùa 3 lần đầu bị lẫn cỏ xanh của mùa 2): câu lệnh phải nói rõ nền đất của mùa (vd bãi tái chế: đất nâu nhạt + sỏi xám, KHÔNG cỏ) và chỉ dùng ảnh mùa trên cho NÉT VẼ + VỊ TRÍ ĐƯỜNG, không cho màu nền. User 31/10 chốt bản A (mùa 2 bản A, xe A). Ảnh trong xe trạm (lab nhìn từ đầu xe về cửa sau, bàn sa bàn giữa): `public/nen-doc/trong-xe-a.jpg`, `-b.jpg`. Xe trạm: CHIBI NHÌN NGANG (user 30/10: ngắn, tròn, tối giản, không cần hợp lý), kính lái như kính R1, 2 biến thể `robot/xe-tram-a.png`, `-b.png`. 10 nút gói do code vẽ (`phim-clb/src/BanDoMua.tsx`): đường dò bằng `tools/do-duong.py` (→ `src/ban-do-mua.json`), nút rải đều theo chiều dài, chừa chỗ nối cho dải tiêu đề mùa; hai mùa chồng 140 px, mùa trên mờ dần ở mép dưới; xe trạm đỗ cạnh nút đang mở. Đã có: mùa 1 (CLB → kho), mùa 2 hai biến thể (Studio: BanDoMua-A / BanDoMua-B). Xe trạm làm lại theo tham chiếu (`public/robot/xe-tram.png`).
**BẢN ĐỒ 9 MÙA (31/10 tối, theo bảng 9 mùa ở KE-HOACH-7-MUA.md nhánh `claude/them-mua-ke-hoach-c51a50`):** thêm 5 đoạn, ghép đủ thành `public/ban-do/dai-9.jpg` (1080×15716; đỉnh mỗi mùa y = 0, 1724, 3448, 5172, 6896, 8620, 10344, 12068, 13792):
Kho `mua-1` → Nhà máy `mua-2a` → Bãi tái chế `mua-3b` → **Cảng sông `mua-cang`** (bản C/4: cẩu giàn, cẩu tháp, sà lan; đáy ra mép sông lau sậy) → **Bến sông `mua-song`** (bản B/2: đập cống, âu thuyền, bè, lục bình, ruộng lúa, đáy đất cày) → Nông trại `mua-4a` → **Mỏ đá `mua-mo`** (bản B/2: hố khai thác bậc thang, đá khối, mâm cắt đá, đáy đá vôi ướt) → **Hang động `mua-hang`** (bản A/2: hố sụt có rừng, thạch nhũ, ruộng bậc thang đá, sông ngầm, trại cứu hộ, đường chui vòm đá) → **Về CLB `mua-clb`** (bản B/2: lặp lại thị trấn mùa 1, đường KẾT ở quảng trường ngày hội trước toà CLB, 8 bục trưng bày cỗ máy). Bản còn lại cất ở `tam-anh/` (cang-a..d, song-a, mo-a, hang-b, clb-a).
Chỗ nối còn khúc cua nhỏ ở Nông trại → Mỏ đá (lệch 60 px) và Bến sông → Nông trại; các chỗ khác khớp. Chưa dò đường / rải nút cho 5 đoạn mới (`tools/do-duong.py`, `BanDoMua.tsx`).
Cách làm (31/10): tham chiếu đưa vào ô Import bằng `fetch('http://127.0.0.1:4215/tep/<tên>')` + DataTransfer (iframe bị chặn); ảnh gốc tải bằng `tools/tai-tv.sh` (curl đúng link `0.png?verify=` lấy từ ảnh lớn trong khung xem trước; link tự đổi từ `0_resized` bị 403).
**BẢN ĐỒ 9 MÙA DẤU ẤN VIỆT (31/10 khuya, thay mọi đoạn bên dưới):** user thấy mùa 2 trùng nền cỏ mùa 1, làng hoa không ra Việt Nam, nên vẽ lại một lượt cả 9 cảnh đơn bằng TopView. Mỗi cảnh: tham chiếu là đoạn cũ, khung 9:16. Mô tả gồm:
- dấu ấn Việt riêng của nơi đó;
- mép trên / dưới 10% là địa hình của nơi liền kề, theo trình tự địa lý: thị trấn → khu công nghiệp ven thị trấn → bãi ve chai → cảng sông → miệt vườn đồng bằng → làng hoa phù sa → đất cao dần lên núi đá vôi → hang → ra thung lũng về thị trấn.

Bản chọn (`tam-anh/vn<số>.png`, đủ 16 bản xem ở `tam-anh/vn*.png`):

| Đoạn | Bản | Nội dung |
|---|---|---|
| Kho | 13 | Nhà ống mái ngói, cổng chùa, xe ba gác |
| Nhà máy | 15 | KCN mái tôn xanh trên đất đỏ bazan, hết nền cỏ |
| Bãi tái chế | 11 | Bao tải ve chai, xe ba gác, cẩu nam châm |
| Cảng | 10 | Sà lan cát / container, ghe vẽ mắt |
| Bến sông | 8 | Chợ nổi xuồng ba lá, cầu khỉ, nhà sàn, cống âu thuyền |
| Làng hoa | 6 | Kiểu Sa Đéc: luống hoa trên giàn qua kênh, mai vàng, đào, nhà lưới; đáy ra đất đá |
| Mỏ đá | 5 | Moong bậc thang, sân tạc sư tử đá, núi đá vôi |
| Hang | 3 | Kiểu Phong Nha: hố sụt, sông ngầm ngọc bích, trại cứu hộ |
| CLB | 1 | Nhà vàng mái đỏ, phượng vĩ, đèn lồng, 8 bục |

Ghép thô bằng `noi-mua.py` (chồng 200), rồi TopView vẽ lại cả 8 dải chuyển. Khung 3:4 quanh mỗi vết nối (`tam-anh/vn-noi-1..8.jpg`), tham chiếu hai cảnh đầy đủ, mô tả chuyển tiếp hợp địa lý:

| Nối | Bản | Chuyển tiếp |
|---|---|---|
| 1 | vc14 | Hàng cây, quán nước, cỏ ngả dần sang đất đỏ |
| 2 | vc13 | Hàng rào sau KCN, mương bê tông có cống |
| 3 | vc11 | Hàng rào lưới, barie, chốt gác |
| 4 | vc8 | Bờ sậy, dừa nước, ghe |
| 5 | vc6 | Kênh có cống, cổng tre vào làng hoa |
| 6 | vd3 (khung 1920, 9:16) | Luống hoa → ruộng rau, chòi tranh → bãi cỏ khô → đá vôi lác đác → mép moong (bản vc4 chuyển đột ngột, đã thay) |
| 7 | vc3 | Đường lách giữa vách đá vôi |
| 8 | vc16 | Hầm đá ra khỏi hang, rừng tre, cầu suối |
| Cuối | vd1 (`tren`) | Đường CLB dừng ở cổng chào, bỏ đoạn đường cụt phía dưới |

**VẼ NỐI ĐUÔI (1/11, thay cách vá + nắn ở dưới):** user thấy đường cong uốn éo trông giả, muốn TopView vẽ chứ không nắn bằng code. Inpaint của TopView (công cụ riêng, cho tải ảnh lên, tô vùng bằng cọ) thử ở vết nối 1 thì không dùng được: nó vẽ lại cả khung, nửa dưới đổi hẳn, phần ngoài vùng tô không giữ nguyên. Nên vẽ lại cả bản đồ theo kiểu nối đuôi, `tools/noi-tiep.py`:
- Mùa 1 (Kho): Image Edit trên `vn-kho.jpg`, chỉ đổi đường thành cong nhẹ một lần (`tam-anh/nt1-2.png`).
- Mùa k ≥ 2: khung 1080×1924 = 200 hàng đáy của ảnh dài + nền xám (`noi-tiep.py khung`); Image1 khung, Image2 mùa trước (`nt-mua-<k-1>.jpg`), Image3 cảnh cũ `vn-<tên>.jpg` làm nội dung. Mô tả: giữ nguyên dải trên, tô kín phần xám, đường đi tiếp đúng chỗ, chỉ một hai khúc cong rộng, trình tự địa lý vào → giữa → 10% đáy gợi nơi kế (prompt trong `PRT` / `taoPrt` ở phiên làm, nội dung ở bảng dưới). Ghép bằng `noi-tiep.py noi`: chỉ DỊCH nguyên ảnh (dx, dy từ matchTemplate dải chồng; thực tế dy 0–3, dx 0–2 px, riêng mùa 9 là 13 px, lấp mép bằng soi gương), đường cắt tối ưu trong 200 hàng chồng, khớp màu bằng dịch trung bình. Không co giãn, không nắn.
- Bản chọn: 1 `nt1-2`, 2 `nt2-2`, 3 `nt3-2`, 4 `nt4-2`, 5 `nt5-1`, 6 `nt6-2`, 7 `nt7-2`, 8 `nt8f-2`, 9 `nt9f-1`.
- Mùa 8: nền xám để lại vết ngang ở mép khung (vách đá vôi cắt cụt). Thử khung ghép thô (dải trên + cảnh hang cũ) vẫn bị. Cách đạt: đưa chính ảnh vừa sinh (`nt8-1`) cho Image Edit, bảo chỉ xoá vết ngang và nối đường (`nt8f-*`).
- Mùa 9: sửa thêm một lượt trên `nt9-2`: rìa rừng tre tự nhiên, cổng chào dời lên chỗ đường vào sân CLB, đáy là hàng rào hoa (`nt9f-*`; bản 2 mất nhà CLB nên bỏ).
- Ảnh dài cao 15719, cắt còn 15716 (bỏ 3 hàng hàng rào đáy). Vị trí mùa giữ y = k·1724 như `BanDoMua.tsx`.
- Cảng → Bến sông (1/11, user: nước cảng xanh rêu, hai vùng nước như không liên quan): Image Edit cả khung y 5250..7174 (`tam-anh/ns-khung.jpg`), bảo cùng màu nước sông xanh của chợ nổi, dải đất chắn ngang thành cù lao để nước thông hai bên. Chọn `ns-1`; đặt lại bằng `noi-tiep.py va` (khớp mép trên và dưới, chỉ dịch, cắt tối ưu 300 hàng mỗi mép; `ns-2` bị co dọc 60 px nên máy báo và bỏ).
- Cầu qua sông (1/11, user: cầu dở hơi, cầu gỗ thò xuống nước, màu nước chưa khớp): Image Edit khung y 6600..8524 (`tam-anh/cs-khung.jpg`): một cầu bê tông dài có lan can, trụ dưới nước qua hết sông, bỏ cầu ngắn ở bờ nam và cầu gỗ trên cù lao phải, mọi chỗ nước (sông, âu thuyền, ao cá, kênh) cùng màu nước cảng. Chọn `cs-2` (`cs-1` gãy mép đường ở đường cắt dưới).
- Đường hết cầu (1/11, user: đường hơi gãy chỗ hết cầu): Image Edit khung y 7120..9044 (`tam-anh/hc-khung.jpg`): ra khỏi cầu giữ bề rộng, chạy thẳng rồi uốn nhẹ một lần tới cống. Chọn `hc-1`.
- **Trường trên đỉnh, dừng ở mùa 8** (1/11, user: bản đồ dọc từ trên xuống, trường trên cùng, tới mùa 8 là dừng; mùa 9 Về CLB đi NGƯỢC trên chính bản đồ này qua các điểm, không vẽ tiếp từ hang xuống trường): bỏ đoạn CLB ở đáy; Image Edit đoạn mùa 1 dời nhà kho xanh sang trái để đường chạy lên tới mép trên (`dau-1-s2`, `va … chi-duoi`); Image Edit đoạn hang cho đường dừng ở vòng quay xe cạnh lán cam, dưới chỉ còn rừng (`cuoi-8-s1`, `va … chi-tren`); vẽ đoạn trường lên trên bằng `khung-tren` + `tren` (mới trong `noi-tiep.py`, lật dọc rồi nối như `noi`), tham chiếu khu trường của đoạn CLB cũ (`truong-2`, cắt 30 hàng đỉnh cho đủ lưới), rồi hai lượt Image Edit xoá vết nối dưới đoạn trường (`mn-truong-1`, `mn2-truong-2`). Vẫn 1080×15716, 9 đoạn bước 1724: `mua-clb` (trường, NAY Ở ĐỈNH), `mua-1`, `mua-2a`, `mua-3b`, `mua-cang`, `mua-song`, `mua-4a`, `mua-mo`, `mua-hang` (cuối). Code đọc bản đồ (danh sách mùa, `ban-do-mua.json` dò đường) phải đổi thứ tự: CLB đứng đầu; đường trong `mua-1` và `mua-hang` đã khác nên dò lại hai đoạn này.
- `nen-doc/the-gioi.png` (bản đồ thế giới trong phim mở đầu) vẽ lại cùng thứ tự: trường trên đỉnh, đường đi xuống qua 8 nơi, dừng ở hang.
- Còn lại: vài khúc đường vẫn cong chữ S nhẹ (mùa 4, 8); vị trí nút trên đường trong `BanDoMua.tsx` (nutCua) chưa so với đường mới.

Lần sửa 31/10 khuya (user: nhà mùa 2, mùa 4 méo; hoa → mỏ đột ngột; đường mùa 9 gãy). `va-cho-noi.py` bây giờ:
- không co giãn dọc ảnh sinh nữa (trước nội suy affine có y-scale ~0.8 nên nhà bị kéo); mỗi mép chỉ khớp ngang `x' = a·x + b` và dịch dọc `d`;
- đường cắt tìm trong 38% mỗi mép để lách qua đất trống, không cắt ngang mái nhà;
- nắn riêng mặt đường theo từng hàng cho liền, chỉ trong dải mặt đường + lề (~140 px mỗi bên tâm đường), chặn ±40 px, nên luống hoa, nhà ở xa không cong.

Lệnh dựng lại (từ `phim-clb/`, `T=tam-anh`):
```
cp $T/vn/dai-tho.jpg cur.jpg
for p in "1 vc14 1440" "2 vc13 1440" "3 vc11 1440" "4 vc8 1440" "5 vc6 1440" "6 vd3 1920" "7 vc3 1440" "8 vc16 1440"; do set -- $p; python tools/va-cho-noi.py cur.jpg nxt.jpg $(( $1*1724+100 )) $3 $T/$2.png; mv nxt.jpg cur.jpg; done
python tools/va-cho-noi.py cur.jpg public/ban-do/dai-9.jpg 14996 1440 $T/vd1.png tren
```

Đặt vào bằng `va-cho-noi.py`. Bỏ: vc9 (khớp hình hỏng), vc1 (TopView vẽ khác hẳn phần dưới, ghép bị méo). Bản đồ cũ cất ở `tam-anh/dai-9-cu.jpg`; 9 đoạn `mua-*.jpg` cắt lại từ `dai-9.jpg`. Nền sân dọc (`nen-doc/`) CHƯA vẽ lại theo bản mới.
**Vá chỗ nối (31/10 khuya):** ba vết nối Bãi tái chế→Cảng, Cảng→Bến sông, Bến sông→Nông trại là đường cắt thẳng, đổi nền đột ngột. TopView vẽ lại riêng dải chuyển cảnh: khung 1080×1440 cắt quanh vết nối (`tam-anh/noi-0..2.jpg`), tham chiếu là hai đoạn mùa đầy đủ, mô tả bắt giữ nguyên 25% trên / dưới. Kết quả chọn (bản còn lại ở `tam-anh/van*.png`): hàng rào lưới + barie + chốt gác (`van5`), cầu bê tông lan can qua sông (`van3`), kênh tưới + hàng rào + cổng vòm nông trại (`van1`). Đặt lại bằng `tools/va-cho-noi.py <vào> <ra> <tâm y> 1440 <ảnh sinh>` (tâm y = đỉnh mùa dưới + 100):
1. TopView nén hình theo chiều dọc (tỉ lệ 0,76–0,85) nên lệch tới 100 px. Mỗi mép một phép affine từ điểm SIFT khớp (RANSAC), nội suy theo hàng.
2. Phần lệch nhỏ còn lại: luồng quang học DIS, khớp bằng mặt bậc hai trơn (luồng từng điểm làm nhòe lau sậy).
3. Khớp màu từng kênh theo hai mép.
4. Cắt bằng đường cắt tối ưu ở chỗ hai ảnh giống nhau nhất, viền mềm 8 px.

`mua-3b`, `mua-cang`, `mua-song`, `mua-4a` cắt lại từ `dai-9.jpg` (đỉnh y như trên, cao 1924) để từng đoạn khớp ảnh dài. Bản trước khi vá ở `tam-anh/*-truoc-va.jpg`.
**Nền sân dọc mới (31/10):** `nen-doc/mua-cang.png` (bãi container, giữa trống), `mua-song.png` (mặt nước giữa, cống và lục bình quanh rìa) và `mua-hang.png` (sàn đá vôi ướt, thạch nhũ, hồ ngọc) thay nền tạm vẽ bằng code (`xuat-m4/m7.mjs` chỉ vẽ lại khi `NEN_TAM=1`); `mua-4.png` nông trại vẽ lại đúng 4 màu (bản cũ có hoa tím).
**ĐỢT 3 (30/10, MÀN DỌC, Bot TopView một lần 10 ảnh, 1536×2736 → 1080×1920 ở `phim-clb/public/nen-doc/`): bản đồ dọc kiểu Duolingo (con đường ngoằn ngoèo từ CLB ở đáy lên núi tuyết ở đỉnh, mỗi trạm một ô trắng đặt nhãn; toạ độ ô (khung 1080×1920): CLB 770,1739 · kho 754,1487 · nhà máy 771,1232 · bãi tái chế 775,1016 · nông trại 776,760 · mỏ đá 813,476 · núi tuyết 664,195), 7 ảnh nơi (mua-1..7), `trong-xe.png` (lab trong thùng xe), `robot/xe-tram.png` (xe trạm nhìn từ trên, đã tách nền, mũi hướng lên). Bản gốc ở `phim-clb/tam-anh/doc-*.png`. Phim hiện vẫn 16:9 dùng `public/nen/`.**
**ĐỢT 2 (30/10, sau khi user chốt con đường 7 nơi): sinh lại bản đồ + mua-2..6 bằng Bot của TopView (một lần 6 ảnh), mỗi nơi tông màu riêng, nhìn từ trên. Bản đồ là MỘT con đường uốn từ thị trấn (góc dưới trái) qua kho → nhà máy → bãi tái chế → nông trại → mỏ đá → núi tuyết (góc trên phải), mỗi trạm có ô trắng đặt nhãn (toạ độ đo bằng máy ở ban-do.tsx). Ảnh đợt 1 cất ở phim-clb/tam-anh/cu/. mua-1 (kho) và mua-7 (phòng CLB) giữ từ đợt 1.**
**Đợt 1: ĐÃ SINH ĐỦ 8 ẢNH 30/10** (TopView, GPT Image 2.5, 2736×1536, thu về 1920×1080 ở `phim-clb/public/nen/`, bản gốc ở `phim-clb/tam-anh/` không commit). Bản đồ ra góc nghiêng 3/4 (không thẳng từ trên) nhưng đúng bố cục; 7 ảnh mùa nhìn từ trên, giữa trống. Nhãn trên bản đồ đã đo lại theo toà nhà (`ban-do.tsx`).
Đặt vào `phim-clb/public/nen/<mã>.png`, rồi bật `CO_ANH['<mã>'] = true` trong `phim-clb/src/nen.tsx` (chưa có thì phim vẽ nền tạm có nhãn vàng).
Cỡ **1920×1080 (16:9)**, PNG. Có ảnh bản đồ rồi thì đo lại toạ độ ghim trong `phim-clb/src/ban-do.tsx`.

**Phần chung, dán vào đầu mọi câu lệnh** (giữ nét thống nhất):
> Top-down view, straight overhead camera (bird's-eye, no perspective tilt). Clean flat vector illustration for a kids' coding game, soft rounded shapes, thick dark indigo outlines (#1E1B4B),
> light "white lab" palette: pale lavender #F4F2FB, white, cool slate grays, small accents of sky blue #38BDF8 and pink #F472B6. Soft shadows, no noisy textures, no text, no letters, no people, no robots.
> Leave the CENTER of the image fairly empty and flat (open floor) so game elements can be placed on top.

| Mã | Nơi | Câu lệnh riêng (nối sau phần chung) |
|---|---|---|
| `the-gioi` | Bản đồ thị trấn (đợt 1, ĐÃ THAY: nay là bản đồ dọc nối các mùa `ban-do/dai-*.jpg`; câu dưới còn mỏ quặng, thành phố, sân bóng cũ) | A small friendly town map seen from above. In the middle a round plaza with a small robotics club building (sky-blue roof). Six roads radiate to six districts: top-right a warehouse with stacked crates; right a quiet old factory with chimneys; bottom-left a mine entrance with rocks and rails; top-left a downtown city block with crosswalks; bottom a soccer stadium; top a snowy mountain. Parks and trees between. Each district clearly separated. |
| `mua-1` | Kho hàng | Inside a tidy warehouse: wooden crates and pallets along the walls, shelves at the edges, a loading door at one side, floor markings. Open concrete floor in the center. |
| `mua-2` | Nhà máy | Inside an old factory that has stopped: conveyor belts at the edges, big pipes and steam valves, a few small smoldering spots near the walls, heavy metal boxes. Open floor in the center. |
| `mua-3` | ~~Mỏ quặng~~ ĐÃ THAY 30/10: Bãi tái chế (ảnh dọc mới `ban-do/mua-3b.jpg`) | (câu lệnh đợt 1, bỏ) |
| `mua-4` | ~~Thành phố~~ ĐÃ THAY 30/10: Nông trại hoa (`ban-do/mua-4a.jpg`) | (câu lệnh đợt 1, bỏ) |
| `mua-5` | ~~Sân bóng~~ ĐÃ THAY 30/10: Mỏ đá trên núi (chưa sinh ảnh dọc) | (câu lệnh đợt 1, bỏ) |
| `mua-6` | Núi tuyết | A snowy mountain area from above: snow, ice patches, a small tunnel in the rock, pine trees at the edges, a rescue hut. Open snow field in the center. |
| `mua-7` | Phòng CLB | The robotics club workshop from above: workbenches with tools and parts bins, a big blueprint table, shelves of robot parts, a whiteboard. Open floor in the center. (Dùng cho phim mở đầu và mùa 7.) |

## 4. Dựng

User 30/10: **phần nào làm được bằng ảnh + hoạt cảnh Remotion thì làm thế, không gen video.**
- **Remotion** (thư mục `phim-clb/` ở gốc repo, `npm run studio`): mọi cảnh. Robot là hình xuất từ bộ vẽ game (`npm run xuat-hinh` → `public/robot/`), Sola / Luna là ảnh mascot
  (chép từ `diem10code-video/public/mascot/`), bảng code, bong bóng thoại, vệt bánh, bản đồ vẽ bằng React. Bánh đang chạy: lớp sáng vàng + mũi tên chạy tới; bánh trục: viền đứt "đứng yên".
- **TopView chỉ gen ẢNH** cho thứ chưa có: nền phòng CLB, bản đồ thị trấn, nơi chốn từng mùa, cảnh "Ngoài đời", biểu cảm / dáng mascot còn thiếu. Cảnh đang dùng nền tạm có nhãn vàng "chờ ảnh TopView".
  Không dùng ảnh AI cho bánh, góc xoay, đi từng ô, chữ code.
- Sau này thêm giọng ElevenLabs của Sola / Luna (giọng đã chọn ở `diem10code-video`) và nhạc.
- **Video dựng bằng Remotion** từ ảnh nền + code, kể cả phim ra mắt và phim xuất xưởng (user 30/10).
- **Đưa vào game: chiếu thẳng trên web, không xuất mp4** (user chốt 1/11). `@remotion/player` chiếu chính component phim trong `#stage` 360×640 (khổ dọc 1080×1920 thu 1/3).
  Đóng gói: `npm run web` trong `phim-clb/` (`tools/web/dong-goi.mjs`) → `hoc/game/phim-clb/phim-clb.js` (React + Player + phim, ~1,3 MB, chỉ tải khi mở phim lần đầu),
  `hoc/game/phim-clb/ds.js` (gói nào có phim), ảnh WebP 2/3 cỡ gốc ở `hoc/game/phim-clb/a/` (mùa 1–3: ~14 MB thay 171 MB PNG).
  `phim-goi.js`: gói có trong `PhimCLBDs` chiếu phim CLB thay phim khung cũ (cùng cờ đã xem, cùng nút Bỏ qua / Vào gói); tải lỗi thì về phim khung. Gói thứ n mùa m chiếu `M<m>G<n>-Mo`
  (đã ghép đoạn kết gói trước, như Studio). Đang bật mùa 1–3 (`MUA` trong `dong-goi.mjs`); thêm mùa thì thêm vào `MUA`, `CHON` trong `nen-anh.py` và import trong `src/web/entry.tsx`.
  Phim `M<m>G10-Ket` (kết mùa) chưa có chỗ chiếu trong game. mp4 chỉ xuất khi cần đăng ra ngoài.

## 5. Việc tiếp theo

1. **Phim mở đầu + phim gói 1** (mục 3): bản thử 30/10 trong `phim-clb/`. Còn: 8 ảnh nền (mục 3b), giọng, duyệt nhịp.
2. Viết lại kịch bản 10 phim mỗi mùa theo khuôn mục 2 (mùa 1–4 đã có phim cũ: giữ ý cơ chế, đổi sự cố và giọng).
   **Đêm 31/10:** kịch bản 70 phim theo cấu trúc 10 gói mới ở [KICH-BAN-PHIM-GOI-CLB.md](KICH-BAN-PHIM-GOI-CLB.md) (bản 2, sau hội đồng 20261031-0120; chờ user duyệt các mục [DUYỆT]);
   7 người nhờ đã sinh (`phim-clb/public/nguoi/`, mỗi người bản a / b); 10 phim mùa 1 khổ dọc đã dựng (`phim-clb/src/doc/m1.tsx`, Studio `M1G<n>-Mo` / `M1G<n>-Ket`, đang dùng bản a của chú Tùng).
3. Đổi mã: R1 khoá xanh (`part.js`, bảng sơn, Cài đặt); lời phim / màn đang nói "R1 của em", "em lắp".
4. Đợt chữ trong màn: đề bài "Giúp Sola…", gợi ý của Luna, màn sửa lỗi "Sola viết vội" (kế hoạch gộp diem10code mục 1 đã phác cách làm).
5. Giao diện: bản đồ thị trấn làm màn chọn mùa, bản vẽ cỗ máy ở màn chọn gói.
6. Lý do mở gói trong phim cũ (`mo-dau.js`, `bang-mo-khoa.js` GOI_BO_PHAN: "món đồ tìm lại") đổi thành "CLB nhận part mới cho việc cần làm".
