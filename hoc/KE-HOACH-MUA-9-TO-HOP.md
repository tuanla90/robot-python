# Kế hoạch tổ hợp part và đội cứu hộ mùa 9 Về CLB (3/11/2026, CHỜ USER DUYỆT)

User 3/11: "lên plan tổ hợp thân vs tay và cảm biến; plan mùa 9 khi tạo các bộ kết hợp thì xe nào hỗ trợ được xe nào khi gặp thử thách nào".
Bố cục mùa 9 đã chốt 31/10 (mục **Mùa 9 Về CLB** trong [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md)): gói 1–8 quay lại tám nơi cứu hộ, chương 1 **chọn đội** (hai cỗ máy đã có),
chương 2 **tự lắp robot** (một robot đặt sẵn + một robot tự lắp), màn 10 mỗi gói một đoạn song ca, gói 10 ghép bài; chấm bằng **trần nhịp**, không bắt máy kiểm chứng minh từng cặp.

Ba dòng:
1. **Luật ghép ba câu** cho cả 8 thân × 8 tay × 8 cảm biến (mục 2–3); mở thêm **5 tổ hợp lai mới** và **1 tương tác mới** (rắc cát), mỗi cái ra mắt ở đúng một gói (mục 4).
2. **Ai gỡ thử thách nào** (mục 5) và **28 cặp cỗ máy** (mục 6): mỗi gói cứu hộ dùng một cặp **chưa từng ghép** ở gói 9 của các mùa, mỗi cỗ máy đi giúp đúng một nơi; cặp yếu làm **bẫy** trong bảng chọn đội.
3. **Mười gói** (mục 7): sự cố bão, bảng chọn đội, tổ hợp đích của chương 2 theo khuôn "thân của bạn đến giúp + tay của nhà".

## 1. Hiện trạng (soát main 48dffe2, 3/11)

- **Đã có 200 màn mùa 9** (PDM9, agent viết: `hoc/man-cuu-*.js`, `man-ngay-hoi-clb.js`, `MUA_CLB` trong `lo-trinh-hoc.js`). Mỗi màn **R1 = cỗ máy của nơi đó, R2 cố định**; không màn nào có `lapRap`, không có bước chọn đội.
  R2 hầu hết là xe có bánh: bánh gai (khoảng 42 màn), hai bánh (30), omni (29), xích (27), nhện (27); drone 2 màn; **cần cẩu và xuồng chưa bao giờ đi giúp nơi khác**. Tức là chưa theo bố cục 31/10.
- **Lắp ráp** (`hoc/lap-rap.js`, `game/man-lap.js`): một robot, danh mục cũ 5 thân (hai bánh, xích, omni, nhện, drone) × 5 tay × 5 cảm biến. Thiếu cần cẩu, xuồng, bánh gai; móc cẩu, tay lưới, loa; hồng ngoại, đầu đọc mã, chong chóng, radar, mic, camera bốn hướng.
- **Luật ghép nằm rải** trong `san-hoc.js` (mỗi mùa thêm vài câu `throw`) và `lap-rap.js` `kiemGhep`; hai nơi không khớp nhau (lap-rap chưa biết part mùa 4, 5, 8; luật cho cần cẩu, xuồng, loa chỉ có trong san-hoc).
- **Cặp đã ghép ở gói 9 các mùa** (R2 lắp part mùa trước tới giúp): Cứu hỏa + Chở hàng (mùa 2) · Phân loại + Cứu hỏa (3) · Cần cẩu + Phân loại (4) · Xuồng + Chở hàng (5) · Drone + Phân loại (6) · Khai thác + Drone (7) · Hang động + Khai thác (8).

## 2. Luật ghép ba câu (cho trẻ, hiện trên thẻ part khi ghép sai)

Mỗi thân trả lời hai câu: **có mũi không** (một hướng "phía trước") và **có bụng / đầu treo không** (một chỗ làm việc ngay bên dưới).

| Nhóm thân | Thân | Mũi | Bụng / đầu treo |
|---|---|---|---|
| Xe có bánh | hai bánh, xích, omni, bánh gai | có | không |
| Xuồng | xuồng chân vịt | có (mũi xuồng), chỉ trên nước | không |
| Không mũi | nhện, drone | không (đi bốn hướng tuyệt đối) | có |
| Đứng yên | cần cẩu | không (bệ) | có: **đầu cần** |

1. **Đồ "phía trước" cần thân có mũi**: tay kẹp, kẹp xoay, vòi phun, máy ném, tay lưới, bộ gieo hạt dạng bút; cảm biến khoảng cách, hồng ngoại, camera trước, chong chóng.
2. **Thân không mũi dùng đồ "treo bụng" hay "nhìn quanh"**: nam châm, bộ gieo hạt (chấm ô dưới bụng), đầu đọc mã; camera bốn hướng / camera bụng, radar tròn, mic, cảm biến từ (nhện: cạnh trước cố định, đã có).
   Cần cẩu làm mọi việc **ở ô dưới đầu cần**.
3. **Ba điều cấm vì sức**: drone chở nhẹ (không loa, không móc cẩu, không vòi phun / máy ném vì giật); xuồng không gắn đồ giật (vòi phun, máy ném làm xuồng trôi); chong chóng phải nhúng nước (chỉ xuồng).

Một robot một tay, một cảm biến (giữ luật hiện nay). Lý do ghép sai luôn nói theo ba câu trên, không nói tên luật lõi.

## 3. Bảng ghép

Ký hiệu: **●** part gốc của cỗ máy · **✔** ghép được theo ba câu, lõi không chặn (mỗi cặp phải có máy kiểm chạy thử trước khi vào màn) · **★** lai mới mở ở mùa 9, phải thêm luật (mục 4) ·
**·** ghép được về lý nhưng **không mở ở mùa 9** (giữ bảng chọn nhỏ) · **✗** không ghép (lý do theo mục 2).

### 3a. Thân × tay

| Thân \ Tay | Kẹp (xoay) | Vòi phun | Nam châm | Móc cẩu | Tay lưới | Gieo hạt | Máy ném | Loa |
|---|---|---|---|---|---|---|---|---|
| Hai bánh | ● | ✔ | ✔ | ✗ cần cần cẩu | ★ L3 | ✔ | ✔ | ✔ |
| Xích | ✔ | ● | ✔ | ✗ | ★ L3 | ✔ | ✔ | ✔ |
| Omni | ✔ | ✔ | ✔ | ✗ | ★ L3 | ✔ | ● | ✔ |
| Bánh gai | ✔ | ✔ | ✔ | ✗ | ★ L3 | ✔ | ✔ | ● |
| Xuồng | ✗ (kẹp không với tới mặt nước) | ✗ giật | ✗ | ✗ | ● | ✗ | ✗ giật | ★ L5 |
| Nhện | ✔ (không xoay: không mũi) | ✗ không mũi | ● | ✗ | ✗ không mũi | ★ L6 | ✗ không mũi | ★ L7 |
| Drone | ✗ | ✗ giật | ✔ | ✗ nặng | ★ L10 (thả phao) | ● | ✗ giật | ✗ nặng |
| Cần cẩu | ★ L8 (gầu ngoạm) | ✗ | ★ L1 | ● | ★ L9 (giỏ cứu hộ) | ✗ | ✗ | ✗ |

### 3b. Thân × cảm biến

| Thân \ Cảm biến | Khoảng cách (bên) | Hồng ngoại | Cảm biến từ | Đầu đọc mã | Chong chóng | Camera (trước / bốn hướng / bụng) | Radar tròn | Mic |
|---|---|---|---|---|---|---|---|---|
| Hai bánh | ● | ✔ | ✔ | ✗ cần nhìn xuống | ✗ phải nhúng nước | ✔ trước | ✔ | ✔ |
| Xích | ✔ | ● | ✔ | ✗ | ✗ | ✔ trước | ✔ | ✔ |
| Omni | ✔ | ✔ | ✔ | ✗ | ✗ | ✔ trước | ● | ✔ |
| Bánh gai | ✔ | ✔ | ✔ | ✗ | ✗ | ✔ trước | ✔ | ● |
| Xuồng | ✔ | ✔ | · | ★ L2 | ● | ★ L14 trước | ★ L14 | ★ L5 |
| Nhện | ✗ không mũi | ✗ không mũi | ● | · | ✗ | ★ L12 bốn hướng | ★ L12 | ★ L4 |
| Drone | ✗ | ✗ | ✗ | · | ✗ | ● bụng / bốn hướng | ★ L11 | · |
| Cần cẩu | ✗ | ✗ | ★ L13 | ● | ✗ | ★ L13 bụng (ô đầu cần) | ✗ | ✗ |

Khi làm lõi (gói M9A, 3/11) bảng một chỗ ở `hoc/bang-ghep.js` tách thêm: kẹp / kẹp xoay (cần cẩu + xoay ✗, nhện + xoay ✗), camera trước / bốn hướng / bụng, và giữ part cũ **màu bụng**. **Nhện + camera trước ✔** (ngoại lệ, như cảm biến từ 31/10: đọc theo cạnh trước cố định) vì màn `rap-nao.10` đang cho nhện chọn camera. Tổng 160 ô: ● 16 · ✔ 60 · ★ 21 · · 6 · ✗ 57.

Tính nhanh: theo bảng, mùa 9 mở **8 thân · 8 tay · 8 cảm biến**, nhưng mỗi màn chương 2 chỉ đưa **2–3 thẻ mỗi khe** (mục 7, đường cong).

## 4. Tổ hợp lai mới (★) và tương tác mới

Mỗi cái ra mắt ở chương 2 của **một** gói (màn 1 lắp sẵn khoá, bấm Chạy là thấy; màn 2 ép dùng; sau đó thả), rồi được gọi lại ở gói 9–10.

| Mã | Tổ hợp | Luật thêm (ngắn) | Ngoài đời | Ra mắt | Thử thách nó gỡ |
|---|---|---|---|---|---|
| L1 | **Cần cẩu + Nam châm** | `magnet_*` hút / thả vật sắt **ở ô đầu cần** (thay chỗ móc); hút qua tường như móc; cảm biến từ đọc ô đầu cần | cầu trục nam châm điện ở nhà máy thép, bãi phế liệu | G2 Nhà máy | sắt vụn nằm sau dây chuyền, trong khe máy: không xe nào với tới |
| L2 | **Xuồng + Đầu đọc mã** (+ tay lưới) | `read_code()` đọc số **vật nổi ở ô trước mũi**; thêm vật nổi mới **container trôi** (`B` có `so`) | tàu cảng dò hàng rơi | G4 Cảng sông | bão đánh rơi nhiều container xuống sông: chỉ kéo đúng số tàu đang chờ |
| L3 | **Xe có bánh + Tay lưới** ("xe tời bờ") | `cast_net()` từ xe đứng **trên bờ**: kéo vật nổi về **ô nước sát mũi xe**; kéo **thùng gỗ** trên cạn (không thùng nặng) và **người** về ô trước mũi; không kéo khi vật có xe đứng | tời kéo trên bờ, ném phao từ bờ | G1 (kéo thùng), G5 Bến sông | cống kẹt, xuồng không ra: xe trên bờ tự ghép cầu phao; thùng sát tường kẹp không tới |
| L4 | **Nhện + Mic** | `hear()` / `listen()` như bánh gai (mic không cần mũi) | robot dò tìm trong khe hẹp | G8 Hang động | ngách hẹp, gầm thấp: chỉ nhện chui, phải nghe chuông đá để tìm lối |
| L5 | **Xuồng + Loa** (+ Mic) | `note()` trên xuồng như trên xe có bánh; đá chuông nằm ở ô nước chắn luồng | (sông ngầm Phong Nha) | G8 Hang động (song ca G4 dùng sớm, mục 7) | sông ngầm có đá chuông chắn luồng; bánh gai không bơi |
| R | **Rắc cát** (tương tác, không phải tổ hợp) | bộ gieo hạt `dot()` trên ô bùn trơn `I` biến ô đó thành sàn thường | rải cát chống trơn | G1 Kho hàng (chương 1) | bão để lại **bùn trơn** (luật đá vôi ướt mùa 8) ở mọi nơi |

**Mở rộng 3/11** (user: "càng nhiều tổ hợp càng tốt", mỗi màn một câu đố không trùng). Thêm L6–L14 và ba tương tác:

| Mã | Tổ hợp / tương tác | Luật thêm (ngắn) | Ngoài đời | Ra mắt |
|---|---|---|---|---|
| L6 | Nhện + Bộ gieo hạt | `dot()` / rắc cát ở ô dưới bụng (như drone) | robot bò gieo hạt | G3 (rắc cát), G6 (gieo) |
| L7 | Nhện + Loa | phát nốt trong tầm 3 ô (không dùng kiểu tia từ mũi) | | G3 song ca, G8 |
| L8 | Cần cẩu + Kẹp (gầu ngoạm) | `grab()` / `release()` vật thường ở ô đầu cần, qua tường | cẩu gầu ngoạm | G2 |
| L9 | Cần cẩu + Tay lưới (giỏ cứu hộ) | `cast_net()` vớt **người** hay vật nổi ở ô đầu cần, `drop_net()` đặt lên ô bờ | giỏ cứu hộ treo cẩu | G4, G7 |
| L10 | Drone + Tay lưới (**thả phao**) | `cast_net()` thả phao xuống ô nước dưới bụng: người bám phao **thôi trôi**; drone không kéo | drone thả phao cứu đuối | G4, G5 |
| L11 | Drone + Radar | quét bốn hướng như omni (không mũi) | | G7 |
| L12 | Nhện + Radar / camera bốn hướng | đọc bốn hướng tuyệt đối | | G3, G6, G7 |
| L13 | Cần cẩu + Cảm biến từ / camera bụng | đọc ô đầu cần | | G2, G4 |
| L14 | Xuồng + Camera trước / Radar | đọc ô trước mũi / bốn hướng | | G5 |
| T2 | Container lấp hố | `set_down()` lên ô hố: container thành sàn (hố mất) | | G3 |
| T3 | Vòi phun gạt van cống | tia phun trúng van `V` thì van đổi (như trúng van `N`) | | G5 |
| T4 | Bè sạc | ô sạc đặt trên bè nổi, đi theo bè | trạm sạc nổi | G6 |
| P | **Người cần cứu** | mục 8b | | G1 |

Vẫn **✗** (bài học "vì sức"): drone gắn loa / móc / vòi phun / máy ném; xuồng gắn đồ giật; móc cẩu trên xe; chong chóng ngoài xuồng. Mỗi lai có máy kiểm riêng chạy một sân nhỏ.

**Bùn trơn sau bão** là yếu tố chung của mùa 9 (luật `I` mùa 8 có sẵn, đổi hình thành bùn nâu ở nơi không phải hang): tạo nhu cầu cho bánh gai (bám) và drone (rắc cát) ở mọi nơi.

## 5. Ai gỡ thử thách nào

### 5a. Tám cỗ máy (bộ part đầy đủ của mùa)

| Cỗ máy | Part | Giỏi | Kẹt ở |
|---|---|---|---|
| 1 Xe chở hàng | hai bánh, kẹp xoay, khoảng cách | mang thùng gỗ, đè nút | hố, nước, thùng nặng, bùn trơn, băng chuyền |
| 2 Xe cứu hỏa | xích, vòi phun, hồng ngoại | ủi thùng nặng, đứng vững trên băng chuyền, phun van từ xa, đo nhiệt | hố, nước, bùn trơn, gầm thấp |
| 3 Robot phân loại | nhện, nam châm bụng, cảm biến từ | nhảy hố, chui gầm, hút sắt, đệm từ | nước, thùng nặng, không mang được đồ gỗ |
| 4 Cần cẩu | cần cẩu, móc cẩu, đầu đọc mã (+ ray) | nhấc container qua tường / nước, đọc số | ngoài tầm cần 3 ô; không đi (trừ ray), không đè nút |
| 5 Xuồng thủy lợi | xuồng, tay lưới, chong chóng (+ neo) | đi nước, kéo bè, ghép cầu phao, gạt van cống | mọi ô bờ |
| 6 Drone nông nghiệp | drone, bộ gieo hạt, camera (+ sạc) | bay qua mọi thứ, gieo / rắc cát, đọc màu | pin ít; **không đè nút** (lõi: drone lơ lửng), không đẩy, không nhấc |
| 7 Máy khai thác | omni, máy ném, radar | trượt ngang, đi chéo, ném vật qua rào, lăn đá lấp hố, biết đá tròn / vuông | nước, bùn trơn |
| 8 Xe hang động | bánh gai, loa, mic | bám bùn trơn, phá đá chuông, nghe chuông đá | hố, nước |

### 5b. Thử thách → ai gỡ → ai được cứu

| Thử thách (nơi gốc) | Ai gỡ | Ai được cứu (kẹt nếu đi một mình) |
|---|---|---|
| Thùng gỗ chắn lối / phải vào đích (Kho) | Xe chở hàng (kẹp); robot tự lắp có kẹp (nhện + kẹp ✔) | mọi cỗ máy không kẹp |
| Nút đè giữ cửa (Kho) | xe dưới đất đứng lên; vật, thùng đặt lên cũng đè | robot bên kia cửa. Drone **không** đè được |
| Thùng nặng / cây đổ / khối đá vuông (Nhà máy) | Xe cứu hỏa (xích ủi, vòi phun mạnh) | mọi xe dưới đất (thùng nặng như tường) |
| Băng chuyền (Nhà máy) | xích đứng vững; drone bay qua | xe có bánh khác bị trôi |
| Van + cửa (Nhà máy) | vòi phun từ xa | robot sau cửa |
| Sắt vụn (Bãi tái chế) | nam châm: Robot phân loại, drone + nam châm, cẩu + nam châm (L1) | ai cần dọn lối / đưa sắt về đích |
| Hố, hố sụt (Bãi, Hang) | nhện nhảy (1 ô); drone bay; đá tròn lăn lấp (Máy khai thác) | xe có bánh, xuồng |
| Gầm thấp | nhện co chân | mọi xe |
| Container, tàu cập / rời (Cảng) | Cần cẩu | mọi xe (chồng container như tường) |
| Mặt nước, dòng chảy (Bến) | xuồng đi; drone bay qua; xe dưới đất đi **cầu phao** | xe dưới đất, nhện |
| Cống + van cống (Bến) | tay lưới gạt van | xuồng sau cống, xe chờ cầu phao |
| Hộp màu, sàn màu, ô sạc (Nông trại) | drone (gieo, camera, sạc); xe có bánh + gieo hạt | (mục tiêu gieo) |
| Đá tròn, sàn dốc, bàn xoay (Mỏ đá) | Máy khai thác ném / lăn; xe nào cũng đẩy được đá tròn | ai cần lấp hố |
| Bùn trơn / đá ướt (Hang + bão) | bánh gai bám; drone rắc cát (R); drone, cẩu không bị | mọi xe dưới đất trượt hết dải |
| Đá chuông (Hang) | loa: Xe hang động, mọi xe có bánh + loa, xuồng + loa (L5) | ai đi sau khối đá |
| Chuông đá, ngách hang (Hang) | mic dò; ai cũng đi ngách | |

## 6. Hai mươi tám cặp: ai giúp ai, ở đâu

"Đã dùng" = cặp đã ghép ở gói 9 một mùa. Mỗi gói cứu hộ G1–G8 dùng **một cặp mới** làm đôi tốt; cặp yếu (drone gốc, cần cẩu đi xa) làm **bẫy**.

| # | Cặp | Ai giúp ai, thử thách nào | Đã dùng | Mùa 9 |
|---|---|---|---|---|
| 1 | Chở hàng + Cứu hỏa | xe đè nút giữ cửa; xích ủi thùng nặng, phun van | mùa 2 | G9 (ôn) |
| 2 | Chở hàng + Phân loại | **phân loại rác**: gỗ cho kẹp, sắt cho nam châm; nhện nhảy hố đè nút bên kia | | **G3** |
| 3 | Chở hàng + Cần cẩu | cẩu nhấc container đổ chắn đường xe; xe đè nút mở cổng bãi | | G9 |
| 4 | Chở hàng + Xuồng | xuồng kéo bè làm cầu phao cho xe | mùa 5 | bẫy G5 |
| 5 | Chở hàng + Drone | **drone rắc cát** mở lối qua bùn, xe chở thùng | | **G1** |
| 6 | Chở hàng + Khai thác | omni ném đá lấp hố; xe dọn thùng gỗ khỏi đường lăn | ngân hàng cũ "Đội tay gắp và máy ném" | G9 |
| 7 | Chở hàng + Hang động | gai bám bùn, đứng giữ nút đè giữa dải trơn; gai phá đá chuông | | G9 |
| 8 | Cứu hỏa + Phân loại | nhện nhảy hố đè nút; xích ủi thùng nặng | mùa 3 | G9 (ôn) |
| 9 | Cứu hỏa + Cần cẩu | cẩu nhấc container chắn cửa xưởng; xích ủi thùng nặng qua băng chuyền | | **G2** |
| 10 | Cứu hỏa + Xuồng | xuồng ghép cầu phao cho xích đẩy thùng (PDM9 có màn mẫu) | | G9 |
| 11 | Cứu hỏa + Drone | xích ủi **cây đổ** (thùng nặng) chắn luống; drone gieo lại | | **G6** |
| 12 | Cứu hỏa + Khai thác | xích ủi khối đá vuông, omni lăn đá tròn; radar biết khối nào | ngân hàng cũ "Đội omni và xích" | bẫy G7 |
| 13 | Cứu hỏa + Hang động | gai phá đá chuông; xích ủi thùng | | G9 |
| 14 | Phân loại + Cần cẩu | cẩu nhấc container chắn; nhện hút sắt | mùa 4 | G9 (ôn) |
| 15 | Phân loại + Xuồng | xuồng ghép cầu phao cho nhện hút sắt (PDM9 có màn mẫu) | | G9 |
| 16 | Phân loại + Drone | hai nam châm bụng: drone mang sắt qua tường, nhện chui gầm | mùa 6 | G9 (ôn) |
| 17 | Phân loại + Khai thác | nhện chui gầm đá lở hút mũi khoan sắt; omni lấp hố đường về | | G9 |
| 18 | Phân loại + Hang động | nhện nhảy hố sụt sang đè nút mở cửa đá; gai phá đá chuông chắn nhện | | **G8** |
| 19 | Cần cẩu + Xuồng | xuồng kéo container rơi sông về tầm cần; cẩu đặt bè xuống nước cho xuồng | | **G4** |
| 20 | Cần cẩu + Drone | yếu: drone gốc không nhấc, không đè nút | | bẫy G2 |
| 21 | Cần cẩu + Khai thác | cẩu nhấc container chắn đường lăn; omni lăn đá lấp hố | | G9 |
| 22 | Cần cẩu + Hang động | yếu | | không dùng |
| 23 | Xuồng + Drone | yếu: drone tự bay qua sông | | bẫy G6 |
| 24 | Xuồng + Khai thác | xuồng ghép cầu phao cho omni; omni ném đá lấp hố bờ, dọn đá chắn cống | | **G5** |
| 25 | Xuồng + Hang động | sông ngầm: gai phá đá chuông bờ hang, xuồng ghép cầu cho gai | | G8 chương 2, G9 |
| 26 | Drone + Khai thác | | mùa 7 | G9 (ôn) |
| 27 | Drone + Hang động | yếu: drone gốc không giúp được gì trong hang, pin ít | | bẫy G8 |
| 28 | Khai thác + Hang động | gai bám dốc bùn đẩy đá tròn lấp hố cho omni (**đổi vai** so với mùa 8: trả ơn) | mùa 8 (vai ngược) | **G7** |

Mỗi cỗ máy đi giúp đúng một nơi: Drone → Kho, Cần cẩu → Nhà máy, Chở hàng → Bãi, Xuồng → Cảng, Khai thác → Bến, Cứu hỏa → Nông trại, Hang động → Mỏ đá, Phân loại → Hang.
Nhận xét cho người viết màn: **drone gốc gần như không giúp được ai** (không đè, không đẩy, không nhấc). Vì vậy cần rắc cát (R) cho chương 1 và drone + nam châm cho chương 2.

## 7. Mười gói

Chương 1 **chọn đội**: bảng có 3 cỗ máy (thường gồm cỗ máy nhà), em chọn 2 cho Sola và Luna. **Đôi tốt** giải trong trần nhịp; **bẫy** là cỗ máy trông hợp nhưng thiếu đúng một việc, nên quá trần hay không giải được.
Chương 2 **tự lắp**: robot đặt sẵn = cỗ máy nhà (đã sửa); robot tự lắp theo khuôn **thân của bạn đến giúp + tay của nhà** (hay ngược lại), để trẻ thấy part ghép qua lại giữa các nơi.

| Gói | Nơi (nhà) | Sự cố bão | Chương 1: bảng chọn · **đôi tốt** · bẫy (thiếu gì) | Chương 2: tổ hợp đích (robot tự lắp) | Song ca màn 10 (ai hát) |
|---|---|---|---|---|---|
| G1 | Kho hàng (Chở hàng) | bùn trơn tràn vào kho, thùng gỗ đổ | Chở hàng, Drone, Cứu hỏa · **Chở hàng + Drone** (rắc cát R) · Cứu hỏa (xích cũng trượt bùn) | **Bánh gai + Kẹp xoay + Khoảng cách**: "xe chở hàng chạy bùn" (đổi thân, giữ tay) | Chở hàng lắp loa thay kẹp |
| G2 | Nhà máy (Cứu hỏa) | container văng chắn cửa xưởng, sắt vụn rơi vào khe máy | Cứu hỏa, Cần cẩu, Drone · **Cứu hỏa + Cần cẩu** · Drone (bay qua nhưng không nhấc) | **Cần cẩu + Nam châm** (L1): cầu trục từ nhặt sắt vụn | Cứu hỏa lắp loa |
| G3 | Bãi tái chế (Phân loại) | đống phế liệu gỗ lẫn sắt chắn đường, khe mới | Phân loại, Chở hàng, Cứu hỏa · **Phân loại + Chở hàng** (gỗ / sắt) · Cứu hỏa (ủi thẳng một hướng, quá trần) | **Nhện + Kẹp + Cảm biến từ**: nhện nhảy hố gắp gỗ (đổi tay, giữ thân) | nhện không gắn loa: **Chở hàng hát**, nhện nhảy theo nhịp |
| G4 | Cảng sông (Cần cẩu) | container rơi xuống sông trôi; tàu chỉ đậu ít nhịp | Cần cẩu, Xuồng, Phân loại · **Cần cẩu + Xuồng** · Phân loại (không xuống nước) | **Xuồng + Tay lưới + Đầu đọc mã** (L2): kéo đúng số container | cẩu không gắn loa: **xuồng + loa** (dùng sớm luật L5, chỉ để hát) |
| G5 | Bến sông (Xuồng) | lũ cuốn đá tròn chắn cống, bờ sụt hố; cống kẹt | Xuồng, Khai thác, Chở hàng · **Xuồng + Khai thác** · Chở hàng (qua cầu được, không lấp hố) | **Omni + Tay lưới + Radar** (L3): xe tời bờ tự ghép cầu khi cống kẹt | Xuồng lắp loa |
| G6 | Nông trại (Drone) | cây đổ chắn luống, trạm sạc hỏng (ít ô sạc) | Drone, Cứu hỏa, Xuồng · **Drone + Cứu hỏa** · Xuồng (không lên bờ ủi cây) | **Xích + Bộ gieo hạt + Camera trước**: vừa ủi vừa gieo khi drone thiếu pin | drone không gắn loa: **Cứu hỏa hát** |
| G7 | Mỏ đá (Khai thác) | mưa làm dốc thành bùn trơn, đá lở bít hố | Khai thác, Hang động, Cứu hỏa · **Khai thác + Hang động** (trả ơn) · Cứu hỏa (xích trượt trên dốc bùn) | **Bánh gai + Máy ném + Radar**: ném đá khi đứng trên dốc bùn | Khai thác lắp loa |
| G8 | Hang động (Hang động) | hố sụt mới, cửa đá đóng, sông ngầm dâng | Hang động, Phân loại, Drone · **Hang động + Phân loại** · Drone (bay qua hố, không đè nút, hết pin) | màn 1–5 **Nhện + Nam châm + Mic** (L4); màn 6–10 **Xuồng + Loa + Mic** (L5) trên sông ngầm | Hang động |
| G9 | CLB (bảo vệ kho CLB) | yếu tố của 2–3 nơi trong một sân | bảng 3–4 cỗ máy; dùng các cặp còn lại (# 3, 6, 7, 10, 13, 15, 17, 21) và cặp đã dùng để ôn | lắp tự do trong bảng lớn, không gợi ý tổ hợp; L6 nếu có | Sola và Luna |
| G10 | Ngày hội | (không) | tập song ca | ghép bài; robot hát nào cũng là **thân có bánh / xuồng + loa** | cả bài |

Song ca: chỉ thân có bánh và xuồng (L5) gắn được loa, nên ở Bãi tái chế, Cảng sông, Nông trại cỗ máy nhà không hát; khách hát, cỗ máy nhà làm động tác theo nhịp (nhện nhảy, cần quay, drone lượn). Đây cũng là một bài học ghép part.

## 8. Đường cong trong mỗi gói

Chương 1 (chọn đội):
- Màn 1–3: bảng **2** cỗ máy (đúng đôi tốt), màn 1 chạy sẵn cho xem mỗi bạn làm gì (show, không kể).
- Màn 4–6: bảng **3** (thêm bẫy); trần nhịp chặt dần.
- Màn 7–9: bảng 3–4; có màn **cỗ máy nhà vắng mặt** (đang kẹt) để hai khách tự lo; một màn đôi tốt khác đôi của gói (cặp G9 dùng lại).
- Màn 10: song ca.

Chương 2 (tự lắp):
- Màn 1: tổ hợp đích lắp sẵn, khoá, bấm Chạy là thấy. Màn 2: bảng chỉ có thẻ mới ở khe đổi (ép dùng).
- Màn 3–6: bảng 2 thẻ mỗi khe. Màn 7–9: 3 thẻ mỗi khe, có thẻ **ghép sai** (thẻ báo lý do theo ba câu mục 2), có màn hai cách lắp cùng thắng nhưng khác nhịp.
- Màn 10: song ca.

Ôn Python theo nơi (như bảng 9 mùa): G1 `def` / `for` · G2 biến, tham số · G3 chuỗi, `and` / `or` · G4 số âm, `abs`, `%`, `//` · G5 `return`, tuple, `min` / `max` · G6 list · G7 lưới · G8 dict, set · G9 trộn · G10 list bài nhạc.

Trần nhịp: lời giải mẫu của đôi tốt + 15–25 %. Bẫy là ý đồ thiết kế, **không bắt máy kiểm chứng minh** (user 31/10); người viết màn chạy thử tay đôi bẫy một lần khi cân màn.

## 8b. Màn ba robot và ba kiểu cứu hộ (user hỏi 3/11)

**Lõi đã cho 1–4 robot mỗi màn** (`san-hoc.js`: `cfg.doi` 1–4; khung code có tab R1–R4, màu đế R3 / R4). Nhưng **cả 572 màn đội hiện có đều đúng 2 robot**;
màn 3 robot chưa có, giao diện R3 chưa soát trên trình duyệt.

Đề xuất: tối đa **3 robot**, chỉ **2 robot em lập trình** (của Sola, của Luna), robot thứ ba là **máy khách bị kẹt**: khoá (`coDinh`), chạy chương trình sẵn rất ngắn
(vd "chờ tới khi phía trước trống thì về trạm"), em đọc được nhưng không sửa. Hợp truyện: chính cỗ máy của nơi đó đang mắc kẹt sau bão.

| Kiểu cứu | Thắng khi | Lõi | Ra mắt |
|---|---|---|---|
| **Cứu máy khách** | R3 (khoá) tới cờ của nó | có sẵn (cờ riêng từng robot, robot khoá) | chương 1 màn 7–9 mỗi gói (thay "cỗ máy nhà vắng mặt" ở mục 8) |
| **Cứu thùng hàng** | mọi vật / container / bè vào đích | có sẵn (mục tiêu đưa vật, giao tàu, đưa vật nổi) | màn thường của mọi gói |
| **Cứu người** | người tới ô trạm cứu (chữ thập xanh) | **chưa có**, luật P bên dưới | G1 (trên cạn), G4 (dưới nước, lưới) |

**Luật P, người cần cứu** (user 3/11 hỏi lưới kéo người vào bờ: **nên**, vì đúng cách cứu đuối nước ngoài đời: ném phao kéo vào, không nhảy xuống):
- **Trên cạn**: người đứng chờ; khi ô kế trên đường về trạm trống thì tự bước (như robot khoá, đường cố định vẽ chấm mờ). Biến thể G9: người đi về phía robot đang phát nốt (dẫn bằng tiếng).
- **Dưới nước**: người mặc áo phao, trôi theo dòng như vật nổi. Cứu bằng **lưới**: xuồng (`cast_net` kéo về mũi), xe trên bờ (L3), cẩu (L9 giỏ cứu hộ); **drone thả phao** (L10) giữ người thôi trôi để chờ.
  Người được kéo tới ô sát bờ thì tự bước lên bờ, đi về trạm.
- **Cấm chạm**: kẹp, nam châm, máy ném, vòi phun, móc cẩu nhắm vào ô có người: lệnh không làm, lỗi lời Việt ("Không phun nước vào người!"); robot không đi vào ô người.
- **Hạn**: người trôi tới cống / thác là **thua nhẹ** ("Người trôi xa quá, chưa kịp cứu. Thử lại!"), không vẽ cảnh chìm. Đây là sức ép thời gian tự nhiên thay cho trần nhịp.

### Màn "mở đường" đang có (đếm 3/11)

Cách đếm: chạy lời giải mẫu của 572 màn đội (`lo-trinh-hoc.js`, cả màn cất); tính là mở đường khi robot A làm việc ở ô X (nhấc, hút, kéo, lấp, mở cửa…) rồi sau đó robot B đứng lên ô X.
Đếm máy, gần đúng. Kết quả: 217 / 572 màn có ít nhất một kiểu.

| Kiểu | Màn đang chơi | Màn cất | Ở đâu |
|---|---|---|---|
| **Tay kẹp nhấc hòm cho bạn đi qua** | 15 | 6 | mùa 2 gói R2 trở lại (2), mùa 9 (13) |
| Nam châm hút sắt dọn lối | 29 | 7 | Cảng sông đội cẩu và nhện (17), Nông trại (1), mùa 9 (11) |
| Cẩu nhấc container dọn lối | 1 | | Cảng sông |
| **Lưới kéo vật ra khỏi chỗ cho xe đi qua** | **0** đúng nghĩa | | tay lưới chỉ kéo vật nổi trên nước; vật nổi không chắn xe cạn |
| Lưới kéo bè làm cầu phao | 30 | | Bến sông (17), mùa 9 (13) |
| Mở cửa (nút đè, phun van) | 68 | 18 | mọi mùa |
| Lấp hố cho bạn | 35 | | Hang động (6), mùa 9 (29) |
| Phá đá chuông cho bạn | 25 | | Hang động (2), mùa 9 (23) |
| Đẩy thùng cho bạn | 0 | 10 | |

Thiếu: **kéo trên cạn**. Muốn có kiểu "một xe kéo thùng ra khỏi lối, xe kia đi qua" thì mở rộng L3: tay lưới trên xe có bánh kéo **thùng gỗ** (không kéo thùng nặng)
từ xa 1–3 ô về ô trước mũi, như kéo bè. Khi đó kiểu nhấc (kẹp, từ trên xuống) và kiểu kéo (lưới, từ xa) là hai cách dọn khác nhau cho cùng một thùng chắn lối.

## 8c. Mỗi màn một câu đố không trùng

Danh sách đủ 200 màn: [MUA-9-200-CAU-DO.md](MUA-9-200-CAU-DO.md). Mỗi màn khai **dấu câu đố** `man.cauDo` và máy kiểm (vd `hoc/kiem-cau-do-mua-9.mjs`) chặn trùng:

```
cauDo: { doi: ['CH', 'DR'], lap: 'gai+kep+khoang-cach' | null, coChe: ['bun', 'nut-de'], cuu: 'hang' | 'may' | 'nguoi' | null, meo: 'lam-cau' }
```

- **Mẹo phối hợp** (`meo`, đúng một mẹo chính): dọn lối · giữ cửa · tiếp sức (đưa vật cho bạn) · làm cầu (cầu phao, lấp hố, rắc cát) · nhường đường · chờ tín hiệu (cảm biến) ·
  song song (trần nhịp buộc làm cùng lúc) · đổi vai · đọc rồi chọn (số, màu, cực, nốt, dòng) · dẫn đường (kéo theo đuôi, dẫn bằng tiếng) · cứu kịp (trôi, tàu rời, pin) · một chương trình nhiều sân.
- **Không trùng dấu**: hai màn của mùa 9 không được trùng cả bộ (`doi` hoặc `lap`, `coChe`, `cuu`, `meo`).
- **Không trùng thật**: chạy lời giải mẫu, rút gọn chuỗi sự kiện chính của mỗi robot (vd `rac-cat → nhat-vat → toi-co`); hai màn có chuỗi giống hệt và cùng đội là trùng, kể cả khi dấu khai khác.
  So luôn với 140 màn đội gói 9 của mùa 2–8 để mùa 9 không chép lại màn cũ.
- **Khai đúng**: mẹo khai phải thấy trong sự kiện (khai "giữ cửa" thì phải có `nut-de` của robot này trong lúc robot kia qua cửa).

## 9. Việc lõi và giao diện (thứ tự đề xuất)

1. **Bảng ghép một chỗ**: tệp mới (vd `hoc/bang-ghep.js`) chứa bảng mục 3 + lý do theo ba câu; `lap-rap.js` `kiemGhep` và các câu `throw` ghép part trong `san-hoc.js` đọc chung bảng này. Máy kiểm: mọi ô ✔ / ★ chạy được một sân nhỏ.
2. **Tám bộ cỗ máy** một chỗ (vd `hoc/co-may.js`: Chở hàng, Cứu hỏa…, mỗi bộ = thân + tay + cảm biến + cờ nâng cấp + hamGoc); các tệp `man-cuu-*.js` thôi tự khai `R_XICH`, `R_GAI`.
3. **Danh mục lắp ráp 8 × 8 × 8**: thêm vào `lap-rap.js` DANH_MUC (thân cần cẩu, xuồng, bánh gai; tay móc cẩu, tay lưới, loa; cảm biến hồng ngoại, đầu đọc mã, chong chóng, camera bốn hướng, radar, mic), giá xu, icon, thẻ part.
4. **Màn đội có chọn / lắp**: trường mới (vd `man.chonDoi = { menu: [...mã cỗ máy], batDau: [...] }` và `man.lapRap` cho robot thứ hai), giao diện chọn 2 trong bảng, lắp cho một robot trong màn hai robot (hiện `man-lap.js` chỉ một robot).
5. **Luật lai** L1–L5 và rắc cát R trong `san-hoc.js`, mỗi cái có máy kiểm; bùn trơn đổi hình theo nơi (cùng luật `I`).
6. **Hình**: robot ghép (cẩu treo nam châm, xuồng gắn loa / đầu đọc mã, xe gắn tay lưới, nhện gắn mic), cát rắc trên bùn, container trôi.
7. **Màn**: dùng lại sân của 200 màn PDM9 (sân, yếu tố, đoạn song ca giữ), đổi R2 cố định thành bảng chọn đội (chương 1) và robot tự lắp (chương 2) theo mục 7; màn nào R2 hiện có trùng đôi tốt thì giữ lời giải làm lời giải mẫu.

## 10. Câu hỏi cho user

1. Mở 5 tổ hợp lai L1–L5 và rắc cát R như mục 4? (Bỏ cái nào thì gói đó dùng tổ hợp ✔ có sẵn thay.)
2. Bảng chọn đội chương 1 **thường có cỗ máy nhà** (màn 7–9 có màn nó vắng mặt)? Hay cỗ máy nhà luôn đang kẹt, chỉ chọn khách?
3. Song ca: ở Bãi tái chế, Cảng sông, Nông trại cỗ máy nhà không gắn được loa, để **khách hát, nhà làm động tác**? (Cách khác: cho nhện / drone / cẩu gắn loa, phá luật ba câu.)
4. 200 màn PDM9 hiện có: **làm lại trên sân cũ** theo mục 7 (đề xuất), hay viết mới hoàn toàn?
5. Màn ba robot: tối đa 3, robot thứ ba là máy khách bị kẹt (khoá, em không sửa), như mục 8b?
6. Cứu người theo luật P (mục 8b): lưới / phao kéo người dưới nước, người tự đi trên cạn, robot không chạm người; ra mắt từ G1?
7. Duyệt danh sách 200 câu đố [MUA-9-200-CAU-DO.md](MUA-9-200-CAU-DO.md) và các lai mở rộng L6–L14, T2–T4?
