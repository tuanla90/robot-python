# Mùa 9 Về CLB: 200 câu đố (3/11/2026, CHỜ USER DUYỆT)

Đi kèm [KE-HOACH-MUA-9-TO-HOP.md](KE-HOACH-MUA-9-TO-HOP.md) (luật ghép, lai L1–L14, tương tác R, T2–T4, người P, dấu câu đố mục 8c).
User 3/11: "đa dạng hoá, càng nhiều tổ hợp càng tốt, mỗi màn là một câu đố không trùng nhau".

**Mã cỗ máy** (bộ part đầy đủ của mùa): CH Xe chở hàng · CU Xe cứu hỏa · PL Robot phân loại · CC Cần cẩu · XU Xuồng thủy lợi · DR Drone nông nghiệp · KT Máy khai thác · HD Xe hang động.
**Chương 1 chọn đội**: `[bảng chọn] → đôi đúng`; R3 = máy khách bị kẹt (khoá, chương trình sẵn). **Chương 2 tự lắp**: `đặt sẵn X · lắp: thân + tay + cảm biến`; ⟨…⟩ = bảng thẻ màn đó đưa.
**Cứu**: hàng · máy (R3) · người · — . Màn 1 mỗi chương chạy sẵn (show); màn 2 ép thứ mới; màn 10 có đoạn song ca.
Mẹo, cơ chế, đội được xếp để không màn nào trùng bộ dấu với màn khác (máy kiểm mục 8c sẽ chứng minh khi dựng).

## G1 Kho hàng sau bão (ôn `def`, `for`) · bão: bùn trơn, kệ sập thành hố, thùng đổ

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [CH, DR] → CH + DR | drone rắc cát 3 ô bùn thành lối, xe chở thùng vào đích (chạy sẵn) | hàng | làm cầu |
| 2 | [CH, DR] | bao cát chỉ đủ 3 lần, hai lối bùn: rắc lối ngắn, `for` đếm ô | hàng | đọc rồi chọn |
| 3 | [CH, HD] | nút đè nằm giữa dải bùn: xe thường trượt qua nút; bánh gai bám, đứng giữ cửa | hàng | giữ cửa |
| 4 | [CH, DR, CU] → CH + DR | hai dải bùn: drone rắc dải xa trong lúc xe chở thùng qua dải gần; bẫy CU (xích cũng trượt) | hàng | song song |
| 5 | [CH, HD, DR] → CH + HD | thủ kho kẹt sau cửa; gai giữ nút, xe dọn thùng chắn đường người đi ra | người | dọn lối |
| 6 | [CH, DR, HD] → DR + HD | xe chở hàng ở nhà sửa; hai khách tự lo: drone rắc lối bùn, gai qua giữ nút cho người ra | người | làm cầu |
| 7 | [R3 CH; DR, HD, CU] → DR + HD | R3 trượt kẹt ở mép bùn sát hố ("tiến khi trước trống"); drone rắc cát trước bánh R3, gai mở cửa | máy | chờ tín hiệu |
| 8 | [R3 CH; CU, DR, KT] → CU + DR | kệ đổ (thùng nặng) đè lối R3: xích ủi kệ, drone rắc cát dải bùn cho xích tới | máy | dọn lối |
| 9 | [R3 CH; PL, KT, HD] → PL + HD | hố sụt chia kho, hai nút đè hai bên: nhện nhảy hố giữ nút xa, gai giữ nút gần trên bùn | máy | giữ cửa (hai nút) |
| 10 | [CH, HD] | song ca đoạn Kho: xe chở hàng lắp loa, cả hai đi theo vạch nhịp qua bùn | — | song ca |
| 11 | đặt sẵn CH · lắp: **gai + kẹp xoay + khoảng cách** (khoá) | xe chở hàng chạy bùn mang thùng tới tay CH ở cửa | hàng | tiếp sức |
| 12 | ⟨hai bánh, gai⟩ + kẹp xoay | ép đổi thân: chỉ bánh gai qua dải bùn | hàng | dọn lối |
| 13 | ⟨gai⟩ + ⟨kẹp, kẹp xoay⟩ | thùng nằm bên hông hành lang hẹp, không quay được: kẹp xoay gắp bên | hàng | dọn lối |
| 14 | ⟨gai, omni⟩ + kẹp | hai thùng chắn hai cột kề nhau: omni trượt ngang dọn cả hai cho CH | hàng | dọn lối |
| 15 | **hai bánh + tay lưới (L3)** | thùng đứng sau hố, sát tường: kẹp không tới; lưới kéo thùng ra khỏi lối từ xa 3 ô | hàng | dọn lối (kéo) |
| 16 | **nhện + kẹp** | thùng ở bên kia hố: nhện nhảy hố gắp, đặt trước mũi CH | hàng | tiếp sức |
| 17 | **drone + nam châm** | hòm sắt trên kệ sau tường: drone hút hòm thả lên nút đè, cửa mở cho CH | hàng | giữ cửa (bằng vật) |
| 18 | ⟨xích, gai⟩ + ⟨kẹp, vòi phun⟩ | người kẹt sau thùng nặng và thùng gỗ: xích + kẹp vừa ủi vừa gắp | người | dọn lối |
| 19 | ⟨gai, drone⟩ + ⟨kẹp, nam châm⟩ | hai cách đều thắng: gai + kẹp (nhanh) hay drone + nam châm (rẻ); chọn theo sao | hàng | đọc rồi chọn |
| 20 | ⟨hai bánh, gai⟩ + loa | song ca: tự lắp robot hát; hai bánh trượt lệch nhịp trên bùn, gai giữ đúng nhịp | — | song ca |

## G2 Nhà máy sau bão (ôn biến, tham số) · bão: container văng chắn cửa xưởng, sắt vụn rơi vào khe máy, vệt dầu trơn

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [CU, CC] → CU + CC | cẩu nhấc container chắn cửa, xích đẩy thùng nặng vào đích (chạy sẵn) | hàng | dọn lối |
| 2 | [CU, CC] | băng chuyền đưa từng thùng nặng tới; biến đếm: cẩu dọn container đúng lúc thùng tới | hàng | chờ tín hiệu |
| 3 | [CU, CC, DR] → CU + CC | ba chồng container, xích chỉ đi được khi chồng giữa thấp ≤ 1; bẫy DR (bay qua, không nhấc) | hàng | đọc rồi chọn |
| 4 | [CU, DR] | vệt dầu trước thùng nặng: drone rắc cát, xích ủi thùng; tham số số ô cát | hàng | làm cầu |
| 5 | [CU, CC, KT] → CU + CC | công nhân kẹt phòng điều khiển: cẩu nhấc container chắn, xích phun van mở cửa trong | người | dọn lối + giữ cửa |
| 6 | [CU, PL, CC] → PL + CC | sắt vụn trên băng chuyền: nhện hút; cẩu dời container khỏi đường nhện nhảy | hàng | dọn lối |
| 7 | [R3 CU; CC, DR, PL] → CC + PL | R3 kẹt giữa hai chồng container: cẩu nhấc một chồng, nhện giữ nút đè cửa về trạm | máy | dọn lối |
| 8 | [R3 CU; CC, CH, KT] → CC + CH | đường về trạm của R3 bị container (cẩu) và thùng gỗ (xe kẹp) chắn, thứ tự dọn có hạn nhịp | máy | song song |
| 9 | [R3 CU; CC, XU, DR] → CC + XU | xưởng ngập: cẩu đặt bè xuống nước, xuồng kéo bè thành cầu phao cho R3 | máy | làm cầu |
| 10 | [CU, CC] | song ca đoạn Nhà máy: xích lắp loa hát, cẩu quay cần theo nhịp | — | song ca |
| 11 | đặt sẵn CU · lắp: **cẩu + nam châm (L1)** (khoá) | cầu trục từ nhặt sắt vụn trong khe máy, mở lối cho CU | hàng | dọn lối |
| 12 | cẩu + ⟨móc cẩu, nam châm⟩ | ép đổi tay: vật là sắt, không phải container | hàng | đọc rồi chọn |
| 13 | **cẩu + nam châm + cảm biến từ (L13)** | đống lẫn sắt và gỗ: đọc ô đầu cần, chỉ hút sắt; biến đếm số sắt | hàng | đọc rồi chọn |
| 14 | **cẩu + kẹp (L8)** | gầu ngoạm gắp thùng gỗ kẹt trong khe máy qua tường | hàng | dọn lối |
| 15 | **omni + vòi phun + hồng ngoại** | hàng van trước mặt cách 2 ô: trượt ngang phun từng van, tham số số van | hàng | giữ cửa |
| 16 | **gai + vòi phun** | vệt dầu dài trước van xa: gai bám tới tầm phun, CU qua cửa | hàng | giữ cửa |
| 17 | **hai bánh + nam châm + cảm biến từ** | sắt rơi trên băng chuyền tới: xe đứng chờ, đọc sắt thì hút | hàng | chờ tín hiệu |
| 18 | drone + ⟨gieo hạt, nam châm⟩ | người kẹt sau vệt dầu: drone rắc cát lối cho người tự đi ra | người | làm cầu |
| 19 | ⟨cẩu, nhện⟩ + nam châm | hai cách: cẩu đứng yên (rẻ) hay nhện nhảy hố (nhanh) | hàng | đọc rồi chọn |
| 20 | ⟨xích, omni⟩ + loa | song ca: omni hát đi ngang theo nhịp giữa hai hàng máy | — | song ca |

## G3 Bãi tái chế sau bão (ôn chuỗi, `and` / `or`) · bão: phế liệu gỗ lẫn sắt, khe mới, đệm từ

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [PL, CH] → PL + CH | phân loại: nhện hút sắt vào ô sắt, xe kẹp gỗ vào ô gỗ (chạy sẵn) | hàng | song song |
| 2 | [PL, CH] | nhện đọc `front_metal()`: sắt thì hút, gỗ thì để lại cho xe (`if`/`else`) | hàng | đọc rồi chọn |
| 3 | [PL, CH, CU] → PL + CH | đống phế liệu chắn lối tới cờ: mỗi bạn dọn loại của mình; bẫy CU (ủi thẳng một hướng, quá trần) | hàng | dọn lối |
| 4 | [PL, CH] | nhện nhảy khe đè nút; xe mang gỗ qua cửa | hàng | giữ cửa |
| 5 | [PL, CH, CC] → PL + CC | người kẹt trên đảo phế liệu giữa khe: cẩu hạ container lấp khe (T2), nhện hút sắt chắn | người | làm cầu |
| 6 | [PL, CH, KT] → CH + KT | gỗ phải qua hàng rào vào bãi gỗ: xe đặt gỗ trước máy ném, máy ném nạp và ném qua rào | hàng | tiếp sức |
| 7 | [R3 PL; CH, CU, DR] → CH + CU | lối R3 bị gỗ (kẹp) và thùng nặng (ủi) chắn ở hai đoạn | máy | dọn lối |
| 8 | [R3 PL; CH, DR, XU] → CH + DR | bùn quanh nút đè: drone rắc cát, xe tới giữ nút, R3 qua cửa | máy | làm cầu + giữ cửa |
| 9 | [R3 PL; CH, KT, CC] → KT + CC | khe rộng 2 ô (nhện chỉ nhảy 1): cẩu hạ container lấp một ô, máy ném hất gỗ chắn | máy | làm cầu |
| 10 | [PL, CH] | song ca đoạn Bãi: xe hát, nhện nhảy theo nhịp | — | song ca |
| 11 | đặt sẵn PL · lắp: **nhện + kẹp + cảm biến từ** (khoá) | nhện nhảy khe gắp gỗ, PL hút sắt | hàng | song song |
| 12 | nhện + ⟨nam châm, kẹp⟩ | ép đổi tay: vật là gỗ | hàng | dọn lối |
| 13 | nhện + kẹp + từ | `if not front_metal():` gắp; sắt chừa cho PL (`and` / `or` trong điều kiện) | hàng | đọc rồi chọn |
| 14 | **nhện + kẹp + camera bốn hướng (L12)** | gỗ sơn màu theo loại nhựa / gỗ: đọc màu bốn phía chọn hướng (chuỗi màu) | hàng | đọc rồi chọn |
| 15 | **hai bánh + nam châm + từ** | vật nam châm chắn lối: đọc cực rồi bật cùng cực đẩy nó ra xa | hàng | dọn lối (đẩy từ xa) |
| 16 | **cẩu + nam châm (L1)** | sắt sau hàng rào cao, PL không với tới | hàng | dọn lối |
| 17 | **nhện + gieo hạt (L6)** | bùn trơn: nhện rắc cát đi trước, PL đi theo đúng vết | hàng | dẫn đường |
| 18 | ⟨xích, nhện⟩ + kẹp | người kẹt sau thùng nặng và gỗ: xích + kẹp ủi rồi gắp | người | dọn lối |
| 19 | ⟨nhện, omni⟩ + kẹp | hai cách: nhện nhảy khe hay omni trượt hành lang | hàng | đọc rồi chọn |
| 20 | **nhện + loa (L7)** | song ca: nhện hát lần đầu, PL nhảy theo | — | song ca |

## G4 Cảng sông sau bão (ôn số âm, `abs`, `%`, `//`) · bão: container rơi xuống sông trôi, tàu đậu ít nhịp, thủy thủ rơi xuống nước

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [CC, XU] → CC + XU | xuồng kéo container nổi về ô dưới tầm cần, cẩu nhấc lên bãi (chạy sẵn) | hàng | tiếp sức |
| 2 | [CC, XU] | tàu đậu 6 nhịp: kéo và nhấc kịp lên boong trước tàu rời | hàng | cứu kịp |
| 3 | [CC, XU, PL] → CC + XU | ba container nổi, chỉ hai số cần giao: cẩu quét mã, xuồng thả cái sai | hàng | đọc rồi chọn |
| 4 | [CC, XU] | dòng xiết: xuồng thả neo giữ container đứng yên cho cẩu nhấc | hàng | chờ tín hiệu |
| 5 | [CC, XU, CU] → CC + XU | thủy thủ trôi theo dòng: xuồng tung lưới kéo người vào bờ, cẩu dọn container chắn lối lên | người | cứu kịp |
| 6 | [CC, CH, KT] → CC + CH | container đổ chắn đường xe: cẩu dọn, xe chở thùng gỗ ra ô bến | hàng | dọn lối |
| 7 | [R3 CC; XU, PL, CU] → XU + PL | R3 hỏng quay cần, chỉ nhấc ở một ô: xuồng kéo hàng tới đúng ô đó, nhện dọn sắt | máy | tiếp sức |
| 8 | [R3 CC; PL, CU, KT] → PL + CU | ray của R3 bị sắt vụn và thùng nặng chắn: nhện hút, xích ủi; `rail(n)` âm / dương | máy | dọn lối |
| 9 | [R3 CC; XU, KT, DR] → XU + KT | máy khai thác lăn đá lấp hố trên ray, xuồng kéo container về tầm R3 | máy | làm cầu |
| 10 | [CC, XU] | song ca đoạn Cảng: xuồng lắp loa hát, cẩu quay cần theo nhịp | — | song ca |
| 11 | đặt sẵn CC · lắp: **xuồng + lưới + đầu đọc mã (L2)** (khoá) | đọc số, chỉ kéo container số chẵn (`% 2`) | hàng | đọc rồi chọn |
| 12 | xuồng + lưới + ⟨chong chóng, đọc mã⟩ | ép đổi cảm biến | hàng | đọc rồi chọn |
| 13 | xuồng + lưới + đọc mã | `so // 10` là tàu, đưa container về đúng bến của tàu đó | hàng | đọc rồi chọn |
| 14 | **hai bánh + lưới (L3)** | xe trên bờ kéo container nổi sát bờ khi xuồng bận | hàng | tiếp sức |
| 15 | **drone + lưới (L10, thả phao)** | hai thủy thủ trôi; drone thả phao giữ một người, xuồng khoá (R2) kéo người kia | người | cứu kịp |
| 16 | **cẩu + lưới (L9, giỏ cứu hộ)** | người ngoài tầm xuồng, trong tầm cần: `abs(dich - nac)` nấc quay | người | cứu kịp |
| 17 | **omni + nam châm + radar** | sắt vụn trên ray giữa hai chồng: omni trượt ngang hút | hàng | dọn lối |
| 18 | **cẩu + móc + camera bụng (L13)** | container màu theo tàu, số bị mờ: đọc màu thay số | hàng | đọc rồi chọn |
| 19 | ⟨xuồng, hai bánh⟩ + lưới | hai cách: xuồng (nhanh) hay xe bờ (rẻ) | hàng | đọc rồi chọn |
| 20 | ⟨xuồng, hai bánh⟩ + loa | song ca: robot hát trên nước hay trên bờ, chọn chỗ nghe được đủ nhịp | — | song ca |

## G5 Bến sông sau bão (ôn `return`, tuple, `min` / `max`) · bão: lũ cuốn đá tròn chắn cống, bờ sụt hố, cống kẹt, dòng xiết

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [XU, KT] → XU + KT | máy khai thác lấp hố bờ, xuồng ghép cầu phao, máy khai thác qua sông (chạy sẵn) | hàng | làm cầu |
| 2 | [XU, KT] | đá chắn van cống trên bờ: omni đẩy đá lăn xuống dốc lấp hố, xuồng gạt van | hàng | dọn lối |
| 3 | [XU, KT, CH] → XU + KT | bờ bên kia có hố: bẫy CH (qua cầu được, không lấp hố) | hàng | làm cầu |
| 4 | [XU, KT] | ba nhánh kênh: `flow()` đọc sức, chọn nhánh yếu nhất (`min`) để kéo bè ngược dòng | hàng | đọc rồi chọn |
| 5 | [XU, KT, DR] → XU + KT | người trôi về phía cống: xuồng kéo vào bờ, máy khai thác lấp hố trên lối lên trạm | người | cứu kịp |
| 6 | [XU, PL, CC] → XU + PL | một chiếc bè làm cầu hai lần: cho nhện sang hút sắt rồi kéo bè sang nhịp thứ hai | hàng | đổi vai |
| 7 | [R3 XU; KT, CH, CU] → KT + CU | R3 kẹt sau cống đóng: xích phun trúng van cống (T3), máy khai thác hất đá chắn cửa cống | máy | dọn lối + giữ cửa |
| 8 | [R3 XU; CU, DR, HD] → CU + DR | R3 kẹt trong vũng tách sông: drone rắc cát bờ bùn, xích tới tầm phun van mở cống nối nước | máy | làm cầu |
| 9 | [R3 XU; KT, PL, CC] → CC + KT | cẩu nhấc container chắn bến, máy khai thác lăn đá lấp hố cầu tàu cho R3 cập bến | máy | song song |
| 10 | [XU, KT] | song ca đoạn Bến: xuồng hát, omni đi chéo theo nhịp | — | song ca |
| 11 | đặt sẵn XU · lắp: **omni + lưới + radar (L3)** (khoá) | cống kẹt, xuồng không ra: xe tời bờ tự ghép cầu | hàng | làm cầu |
| 12 | ⟨xuồng, omni⟩ + lưới | ép đổi thân: bè ở sau cống, chỉ xe trên bờ tới | hàng | làm cầu |
| 13 | **xích + lưới + hồng ngoại** | lục bình chắn luồng sát bờ: xích kéo vào bờ cho XU qua; `distance()` đo tầm | hàng | dọn lối (kéo) |
| 14 | **xuồng + lưới + chong chóng** (xuồng thứ hai) | đoàn xuồng: tự lắp buộc đuôi dắt bè, XU đặt sẵn mở van; `return` số bè | hàng | dẫn đường |
| 15 | **xuồng + lưới + camera (L14)** | phao màu đánh dấu luồng (đỏ cạn, xanh sâu): đọc màu, hàm trả hướng | hàng | đọc rồi chọn |
| 16 | **hai bánh + lưới (L3)** | người trôi sát bờ: ném phao từ bờ kéo vào trước khi tới cống | người | cứu kịp |
| 17 | **drone + lưới (L10)** | người giữa dòng xiết: thả phao giữ người, XU đặt sẵn tới đón | người | chờ tín hiệu |
| 18 | **gai + lưới** | bờ bùn trơn: chỉ gai đứng vững khi kéo bè | hàng | làm cầu |
| 19 | ⟨omni, xuồng⟩ + lưới | hai cách: `min` của cặp `(nhịp, ô)` cho biết cách nào đỡ hơn | hàng | đọc rồi chọn |
| 20 | ⟨xuồng, omni⟩ + loa | song ca: robot hát đi dọc bờ theo dòng | — | song ca |

## G6 Nông trại sau bão (ôn list) · bão: cây đổ chắn luống, trạm sạc hỏng, mương tràn

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [DR, CU] → DR + CU | xích ủi cây đổ, drone gieo luống (chạy sẵn) | hàng | dọn lối |
| 2 | [DR, CU] | cây đổ đè ô sạc: xích ủi khỏi ô sạc, drone đáp sạc rồi gieo theo danh sách luống | hàng | dọn lối |
| 3 | [DR, CU, XU] → DR + CU | bẫy XU (không lên bờ ủi cây) | hàng | dọn lối |
| 4 | [DR, CU] | mương tràn thành bùn: drone vừa rắc cát (danh sách ô) vừa gieo, xích ủi cây cuối luống | hàng | làm cầu |
| 5 | [DR, CU, CH] → CU + CH | bác nông dân kẹt trong nhà kính đổ: xích ủi khung đổ, xe kẹp dọn bao hạt chắn cửa | người | dọn lối |
| 6 | [DR, CH, PL] → DR + CH | pin drone ít: xe chở bao hạt (hộp màu) tới gần luống xa, drone nạp màu gần | hàng | tiếp sức |
| 7 | [R3 DR; CU, CC, KT] → CU + KT | R3 hết pin chờ ô sạc: cây đổ (xích ủi) và đá tròn (omni đẩy) chắn hai ô sạc | máy | dọn lối |
| 8 | [R3 DR; XU, CH, HD] → XU + CH | trạm sạc nổi (T4): xuồng kéo bè sạc tới gần R3, xe dọn bao hạt chắn bến | máy | tiếp sức |
| 9 | [R3 DR; CH, PL, CU] → CH + PL | ô sạc phủ bao hạt (gỗ) và cày sắt: phân loại dọn | máy | song song |
| 10 | [DR, CU] | song ca đoạn Nông trại: xích hát, drone lượn theo nhịp | — | song ca |
| 11 | đặt sẵn DR · lắp: **xích + gieo hạt + camera** (khoá) | ủi cây đổ rồi gieo hàng khi drone thiếu pin | hàng | song song |
| 12 | ⟨drone, xích⟩ + gieo hạt | ép đổi thân: luống có cây đổ | hàng | dọn lối |
| 13 | **nhện + gieo hạt (L6)** | luống cắt bởi mương 1 ô và nhà kính đổ (gầm thấp): nhện nhảy, chui, gieo | hàng | làm cầu |
| 14 | **nhện + gieo hạt + camera bốn hướng (L12)** | gieo đúng màu luống bên cạnh (danh sách màu bốn hướng) | hàng | đọc rồi chọn |
| 15 | **hai bánh + gieo hạt + khoảng cách** | gieo theo danh sách số bước `for n in a:`, DR gieo phần trên cao | hàng | song song |
| 16 | **drone + nam châm** | cày sắt rơi trên luống: drone thứ hai hút cày khỏi luống cho DR gieo | hàng | dọn lối |
| 17 | **omni + kẹp + radar** | bác nông dân trong mê cung cây đổ: radar bốn hướng tìm lối, kẹp bao hạt chắn | người | dọn lối |
| 18 | **gai + gieo hạt** | luống bùn trơn: gai bám gieo từng ô | hàng | làm cầu |
| 19 | ⟨nhện, xích⟩ + gieo hạt | hai cách: chui (nhện) hay ủi (xích); `len(a)` ô phải gieo quyết định | hàng | đọc rồi chọn |
| 20 | ⟨nhện, xích, omni⟩ + loa | song ca: drone không hát; chọn thân hát được, đi qua luống không giẫm hoa | — | song ca |

## G7 Mỏ đá sau bão (ôn lưới `grid[r][c]`) · bão: dốc thành bùn trơn, đá lở bít hố, thợ mỏ kẹt

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [KT, HD] → KT + HD | gai bám dốc bùn đẩy đá tròn lấp hố, omni qua (chạy sẵn) | hàng | làm cầu |
| 2 | [KT, HD] | đẩy đá ở đúng cột để lăn xuống trúng hố (`grid[r][c]`) | hàng | đọc rồi chọn |
| 3 | [KT, HD, CU] → KT + HD | bẫy CU (xích trượt trên dốc bùn) | hàng | làm cầu |
| 4 | [KT, HD] | khối đá rỗng chắn cửa hầm: gai phát nốt làm nứt, omni ném đá qua lối vừa mở | hàng | dọn lối |
| 5 | [KT, HD, PL] → HD + KT | thợ mỏ kẹt trong hầm: gai phá đá rỗng chắn cửa, omni lấp hố trên đường ra | người | dọn lối + làm cầu |
| 6 | [KT, CU, CC] → CU + CC | khối đá xẻ vuông (thùng nặng) xích ủi, cẩu nhấc thùng đá đặt lên xe goòng (ô đích) | hàng | tiếp sức |
| 7 | [R3 KT; HD, DR, PL] → HD + PL | R3 kẹt sau hố sụt 2 ô: nhện giữ nút đường vòng, gai phá đá rỗng trên đường vòng | máy | giữ cửa |
| 8 | [R3 KT; CU, CH, XU] → CU + CH | lối R3 bị khối đá vuông (ủi) và hòm dụng cụ (kẹp) chắn | máy | dọn lối |
| 9 | [R3 KT; DR, HD, CC] → DR + HD | dốc bùn: drone rắc cát một vệt, gai đẩy đá lấp hố cho R3 | máy | làm cầu |
| 10 | [KT, HD] | song ca đoạn Mỏ đá: omni lắp loa hát, gai gõ nhịp | — | song ca |
| 11 | đặt sẵn KT · lắp: **gai + máy ném + radar** (khoá) | ném đá lấp hố khi đứng trên dốc bùn | hàng | làm cầu |
| 12 | ⟨omni, gai⟩ + máy ném | ép đổi thân: chỗ ném nằm trên dốc bùn | hàng | làm cầu |
| 13 | **nhện + nam châm + radar (L12)** | đống đá lở: radar bốn hướng dò lối (lưới khoảng cách), nhện chui gầm hút mũi khoan sắt | hàng | đọc rồi chọn |
| 14 | **cẩu + nam châm (L1)** | mũi khoan sắt rơi xuống hố sâu: cẩu với vào hố | hàng | dọn lối |
| 15 | **xích + máy ném** | khối đá vuông ủi đi, đá tròn ném lấp hố: một xe làm cả hai | hàng | dọn lối |
| 16 | **cẩu + lưới (L9)** | thợ mỏ dưới hố sâu: giỏ cứu hộ nhấc lên, toạ độ `(r, c)` của hố | người | cứu kịp |
| 17 | **omni + vòi phun** | đá tròn lăn qua cửa hầm theo nhịp: phun van mở cửa đúng lúc đá qua | hàng | chờ tín hiệu |
| 18 | **drone + nam châm + radar (L11)** | mũi khoan sắt rải trong bãi đá lở có rào cao: drone bay, radar đọc bốn hướng tìm mũi khoan gần nhất (lưới khoảng cách), hút về thùng | hàng | đọc rồi chọn |
| 19 | ⟨gai, nhện⟩ + ⟨máy ném, nam châm⟩ | hai cách: gai + ném hay nhện + nam châm | hàng | đọc rồi chọn |
| 20 | ⟨gai, omni⟩ + loa | song ca trên dốc: robot hát phải đứng vững không trượt | — | song ca |

## G8 Hang động sau bão (ôn `dict`, `set`) · bão: hố sụt mới, cửa đá, sông ngầm dâng

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [HD, PL] → HD + PL | nhện nhảy hố sụt đè nút mở cửa đá cho gai (chạy sẵn) | hàng | giữ cửa |
| 2 | [HD, PL] | gai phá đá chuông chắn ngách hẹp cho nhện chui (`dict` khối → nốt) | hàng | dọn lối |
| 3 | [HD, PL, DR] → HD + PL | bẫy DR (bay qua hố, không đè nút, hết pin trong hang dài) | hàng | giữ cửa |
| 4 | [HD, PL] | ngách hang cặp màu: nhện qua ngách sang bờ kia đè nút | hàng | giữ cửa |
| 5 | [HD, PL, XU] → HD + XU | nhà thám hiểm trên đảo đá giữa sông ngầm: gai phá đá chuông chắn luồng, xuồng kéo người vào bờ | người | dọn lối + cứu kịp |
| 6 | [HD, XU, CH] → HD + XU | cầu phao qua sông ngầm cho gai, đá chuông ở bờ chắn xuồng cập | hàng | làm cầu |
| 7 | [R3 HD; PL, KT, CC] → PL + KT | R3 kẹt sau hố sụt: omni lăn đá lấp hố, nhện giữ nút cửa đá | máy | làm cầu + giữ cửa |
| 8 | [R3 HD; PL, CU, DR] → PL + CU | thạch nhũ đổ (thùng nặng) chắn lối R3: xích ủi, nhện nhảy hố giữ nút | máy | dọn lối |
| 9 | [R3 HD; XU, DR, PL] → XU + PL | R3 kẹt trên đảo khi nước dâng: xuồng ghép cầu, nhện hút thang sắt đổ chắn | máy | làm cầu |
| 10 | [HD, PL] | song ca đoạn Hang: gai hát, nhện nhảy, tiếng vang (`set` nốt đã phát) | — | song ca |
| 11 | đặt sẵn HD · lắp: **nhện + nam châm + mic (L4)** (khoá) | ngách hẹp tối: nghe chuông đá tìm lối | hàng | đọc rồi chọn |
| 12 | nhện + nam châm + ⟨cảm biến từ, mic⟩ | ép đổi cảm biến | hàng | đọc rồi chọn |
| 13 | nhện + mic | `dict` nốt → hướng, `set` ngách đã đi để không quay lại | hàng | đọc rồi chọn |
| 14 | **xuồng + loa + mic (L5)** (khoá) | sông ngầm: đá chuông chắn luồng, xuồng phá rồi đi | hàng | dọn lối |
| 15 | xuồng + loa | ngân dài `note(n, k)` phá đá chuông trong lúc trôi theo dòng | hàng | cứu kịp |
| 16 | **xuồng + lưới + mic** | người gọi trong hang tối (người là nguồn tiếng): `hear()` tìm, lưới kéo vào bờ | người | đọc rồi chọn |
| 17 | **nhện + loa (L7)** | đá chuông bên kia hố sụt: nhện nhảy tới trong tầm 3 ô để phát | hàng | dọn lối |
| 18 | **omni + loa + mic** | hành lang hai dãy đá chuông: trượt ngang phát từng khối, không quay | hàng | dọn lối |
| 19 | ⟨nhện, xuồng⟩ + ⟨mic, loa⟩ | hai cách: đường ngách khô (nhện) hay sông ngầm (xuồng) | hàng | đọc rồi chọn |
| 20 | ⟨xuồng, gai⟩ + loa | song ca: xuồng hát trên sông ngầm, tiếng vang đổi nhịp | — | song ca |

## G9 CLB sau bão (trộn mọi Python) · bão: sân bùn, hồ CLB tràn, kho đổ, bác bảo vệ kẹt

Chương 1 bảng 3–4 cỗ máy, dùng các cặp còn lại. Chương 2: robot đặt sẵn đổi mỗi màn, bảng thẻ 3–4 mỗi khe, không gợi ý tổ hợp.

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | [CH, CC, PL] → CH + CC | container văng vào sân chắn kho: cẩu nhấc, xe chở thùng vào kho | hàng | dọn lối |
| 2 | [CH, KT, DR] → CH + KT | xe đặt thùng trước máy ném, máy ném ném qua tường kho | hàng | tiếp sức |
| 3 | [CU, XU, CH] → CU + XU | hồ tràn: xích phun van cống xả nước (T3), xuồng kéo bè làm cầu cho xích đẩy thùng | hàng | làm cầu |
| 4 | [CU, HD, KT] → CU + HD | tượng đá chuông đổ chắn cổng và thùng nặng chắn sân: hai việc cùng lúc | hàng | song song |
| 5 | [PL, XU, DR] → PL + XU | sắt rơi trên đảo giữa hồ: cầu phao cho nhện | hàng | làm cầu |
| 6 | [PL, KT, CH] → PL + KT | gầm sân khấu và hố: nhện chui gầm giữ nút, omni lấp hố | hàng | giữ cửa |
| 7 | [CC, KT, CU] → CC + KT | cẩu nhấc container khỏi đường lăn trước, rồi omni mới lăn đá lấp hố (sai thứ tự là kẹt) | hàng | thứ tự |
| 8 | [HD, CC, PL] → HD + CC | bác bảo vệ trong kho tối: cẩu dọn container chắn, gai phát nốt dẫn bác đi theo tiếng | người | dẫn đường |
| 9 | [R3 robot cũ CLB; CH, CU, PL, XU] | hai cặp đều qua, chỉ một cặp trong trần nhịp | máy | đọc rồi chọn |
| 10 | [cả 8] | song ca: chọn hai cỗ máy hát được và đi kịp vạch nhịp | — | song ca |
| 11 | đặt sẵn CH · lắp tự do | thùng sát tường, kẹp không tới: xe + lưới kéo thùng ra | hàng | dọn lối (kéo) |
| 12 | đặt sẵn XU · lắp tự do | thùng gỗ sau tường kho: cẩu + kẹp gắp qua tường | hàng | tiếp sức |
| 13 | đặt sẵn DR · lắp tự do | kẻ vạch sân dưới gầm sân khấu: nhện + gieo hạt | hàng | song song |
| 14 | đặt sẵn KT · lắp tự do | hồ có phao màu: xuồng + camera chọn luồng | hàng | đọc rồi chọn |
| 15 | đặt sẵn PL · lắp tự do | hai dãy đá chuông: omni + loa trượt ngang | hàng | dọn lối |
| 16 | đặt sẵn CC · lắp tự do | sắt rải trên mái kho: drone + nam châm | hàng | dọn lối |
| 17 | đặt sẵn xe bờ + lưới (khoá) · lắp tự do | bác bảo vệ trôi trong hồ: drone + phao giữ bác, xe bờ kéo vào | người | chờ tín hiệu |
| 18 | đặt sẵn HD · lắp tự do | đồ hội trại lẫn sắt gỗ: cẩu + nam châm + cảm biến từ phân loại | hàng | đọc rồi chọn |
| 19 | R3 + đặt sẵn + lắp tự do (ba robot) | robot cũ CLB kẹt sau đá chuông: nhện + loa phá, đặt sẵn giữ cửa | máy | giữ cửa |
| 20 | cả hai robot tự lắp | song ca: Sola và Luna mỗi bạn tự lắp robot hát cho sân của mình | — | song ca |

## G10 Ngày hội (tổng hợp) · mỗi màn 2–3 sân, một chương trình chạy đúng mọi sân

| # | Đội / lắp | Câu đố | Cứu | Mẹo |
|---|---|---|---|---|
| 1 | chọn đội | sân Kho + sân Nhà máy: một đôi qua được cả bùn lẫn van | hàng | nhiều sân |
| 2 | chọn đội | Bãi + Cảng: sắt và container | hàng | nhiều sân |
| 3 | chọn đội | Bến + Nông trại: cầu phao và luống | hàng | nhiều sân |
| 4 | chọn đội | Mỏ đá + Hang: đá tròn và đá chuông | hàng | nhiều sân |
| 5 | chọn đội | ba sân, một đôi đa năng: cặp nào cũng qua một sân, chỉ một cặp qua cả ba | hàng | đọc rồi chọn |
| 6 | chọn đội | cứu người hai sân: bờ sông (lưới) và hầm mỏ (mở lối) | người | nhiều sân |
| 7 | chọn đội + R3 | cứu máy ba sân, R3 mỗi sân một cỗ máy khác | máy | nhiều sân |
| 8 | lắp tự do | một robot tự lắp cho hai sân khác hẳn (đa năng) | hàng | nhiều sân |
| 9 | hai robot tự lắp | hai sân, đội tự lắp hoàn toàn | hàng | nhiều sân |
| 10 | chọn đội | tập song ca: ghép bốn đoạn đầu | — | song ca |
| 11 | lắp, **không dùng CH** | Kho: làm việc của xe chở hàng bằng tổ hợp khác (nhện + kẹp, xe + lưới…); robot kia hát đoạn Kho | hàng | đổi vai |
| 12 | lắp, **không dùng CU** | Nhà máy không có xích: cẩu + kẹp, omni + vòi phun… | hàng | đổi vai |
| 13 | lắp, **không dùng PL** | Bãi không có nhện nam châm: cẩu + nam châm, drone + nam châm… | hàng | đổi vai |
| 14 | lắp, **không dùng CC** | Cảng không có cần cẩu: xuồng + lưới, xe bờ + lưới đưa container lên bến | hàng | đổi vai |
| 15 | lắp, **không dùng XU** | Bến không có xuồng: xe bờ + lưới, drone + phao | người | đổi vai |
| 16 | lắp, **không dùng DR** | Nông trại không có drone: nhện / xích + gieo hạt | hàng | đổi vai |
| 17 | lắp, **không dùng KT** | Mỏ không có omni: gai + máy ném, cẩu + nam châm | hàng | đổi vai |
| 18 | lắp, **không dùng HD** | Hang không có bánh gai: xuồng + loa, nhện + loa, nhện + mic | hàng | đổi vai |
| 19 | hai robot tự lắp | sân CLB: tám đoạn ghép đủ bài, robot vừa làm việc vừa giữ nhịp | — | song ca |
| 20 | ba robot (R3 đánh trống `beat()`, khoá) | trùm cuối: Sola, Luna và trống CLB tấu bài chúc mừng trên sân đủ tám nơi | — | song ca |

## Đếm nhanh

- Kiểu cứu: hàng là nhiều nhất; **máy** (R3) 3 màn mỗi gói G1–G8 + G9–G10; **người** ít nhất 2 màn mỗi gói, có cả trên cạn (mở lối, dẫn bằng tiếng) lẫn dưới nước (xuồng, xe bờ, cẩu giỏ, drone phao).
- Tổ hợp tự lắp khác nhau trong chương 2: khoảng 40, đủ L1–L14; mỗi lai ra mắt bằng màn khoá rồi được gọi lại ở G9–G10.
- Bảng chọn đội: phần lớn trong 28 cặp có mặt (đôi đúng, bẫy, G9–G10); cặp Cần cẩu + Xe hang động bỏ vì không có việc chung.
- Đếm trên là ước tay; khi dựng, máy kiểm mục 8c chạy dấu câu đố của cả 200 màn và in số tổ hợp, số cặp thật.
