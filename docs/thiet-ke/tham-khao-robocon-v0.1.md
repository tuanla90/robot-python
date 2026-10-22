# Tư liệu: luật Robocon và chiến thuật các đội (v0.1)

> **Để làm gì:** rút ra cơ chế cho **dòng 3 — Đội Robot Chấn Hưng** (Python). User yêu cầu:
> *"game giả lập kiểu đó. Khác biệt đến từ cả phần mềm và phần cứng, nhưng mọi thứ đều có trần, trade-off."*
> Tài liệu này là **tư liệu thô**, không phải đặc tả. Kết luận nằm ở §5–§7.
>
> **Cách đọc:** luật Robocon **đổi chủ đề mỗi năm**, nên §2 chỉ ghi những thứ **ổn định qua nhiều năm**, §3 đưa hai đề cụ thể để thấy độ đa dạng. §4 là chiến thuật thật, lấy từ lời các đội và trưởng ban giám khảo — phần này giá trị nhất cho thiết kế.
>
> **Nguồn:** bài về chung kết *Vietnam KOSEN Robocon 2026* ([Cao Thắng dẫn lại Tuổi Trẻ](https://caothang.edu.vn/Sinh-vien-Viet-Nhat-so-tai-hai-robot-phai-an-nhip-tung-giay-de-thang-tran-Robocon-4-phut.html)); phỏng vấn trưởng BGK *Robocon Việt Nam 2019* ([VTV](https://suckhoe.vtv.vn/truyen-hinh/vck-robocon-viet-nam-2019-su-on-dinh-moi-la-yeu-to-dam-bao-chien-thang-20190512132859297.htm)); luật ABU (dẫn qua [KRAI 2019](https://kontesrobotindonesia.id/data/2019/Panduan_KRAI2019.pdf)); [kế hoạch thể lệ Robocon 2026](https://tainangviet.vn/source/files/RBT2026_Kehoach_Thele.pdf) và [ABU Robocon 2025 FAQ](https://aburobocon2025.mnb.mn/uploads/file/ABU_ROBOCON_2025_FAQ_20250314.pdf). Tra 10/10/2026.

---

## 1. Ranh giới của tư liệu này

- **Không** lấy luật một năm làm chuẩn. Robocon đổi đề mỗi năm; bê nguyên một năm vào game là sai.
- **Không** mô phỏng điện tử, cơ khí, vật lý thật. Cái cần lấy là **cấu trúc cuộc thi** và **các đánh đổi**.
- Số liệu cụ thể (50 kg, 4 phút, 6 khối…) ghi kèm nguồn vì chúng **khác nhau giữa các giải**.

---

## 2. Luật: cái ổn định và cái đổi

| Hạng mục | Nội dung | Ổn định hay đổi |
|---|---|---|
| **Số robot** | **2 robot** mỗi đội (có năm "hai hoặc nhiều hơn") | Ổn định |
| **Ai điều khiển** | **Một robot điều khiển bằng tay** + **các robot còn lại tự động** | Ổn định |
| **Đối kháng** | **Hai đội trên cùng một sân**, hai bên **đỏ / xanh** | Ổn định |
| **Sân** | **Đối xứng**, hai đội xuất phát như nhau | Ổn định — **chỉ 2015 (cầu lông, đánh theo lượt) và 2025 (bóng rổ)** phá lệ |
| **Thời gian** | **3 phút là chuẩn** (trừ 2015, 2025). Gần đây có năm đổi: **2025 = 120 giây vòng loại / 160 giây loại trực tiếp**; giải KOSEN 2026 = **4 phút** | **Đổi** |
| **Thắng tuyệt đối (K.O.)** | Hoàn thành **toàn bộ** nhiệm vụ → **trận kết thúc ngay** | Ổn định |
| **Giới hạn khối lượng** | Robot phải nằm trong khung cho phép lúc xuất phát; ABU: **tổng 2 robot + điều khiển + dây + pin chính ≤ 50 kg** | Ổn định |
| **Giới hạn điện áp** | **Cả mạch động cơ lẫn mạch điều khiển ≤ 24 V** | Ổn định |
| **Giới hạn kinh phí** | Một trường chi khoảng **400 triệu đồng** cho việc thử nghiệm + thi Robocon 2026 | Trần thật, do trường chịu |
| **Cấm gây hại đối thủ** | Có FAQ riêng về việc ném đĩa **kẹt vào robot đối phương**; lo ngại **nhiễu sóng điều khiển** | Luật về sau siết chặt hơn |
| **Robot giỏi nặng bao nhiêu** | Thường **hơn 10 kg**, chiếm khoảng **1 m²** | Thực tế, không phải trang trí |
| **Giới hạn vật liệu** | Có năm cho in 3D nhựa nhưng **cấm kim loại** ở một số bộ phận | **Đổi** |
| **Điểm** | Theo **nhiệm vụ hoàn thành**, cộng thưởng **làm sớm**, trừ **lỗi/va chạm** | Đổi chi tiết |
| **Ai quyết đề** | **Nước chủ nhà** quyết chủ đề và luật của năm đó | Đây là **lý do gốc** khiến đề đổi mỗi năm |
| **Xu hướng luật** | Đầu 2000: **đối kháng, cản đối thủ** (VN 2004 & 2006, TQ 2008 thắng bằng cách đó). Về sau: **giảm đối kháng, tăng kỹ thuật** | Có xu hướng rõ |

---

## 3. Đề đổi mỗi năm — bảng tra

Xem thêm [ABU Robocon (Wikipedia)](https://en.wikipedia.org/wiki/ABU_Robocon) và [lịch sử chính thức](https://official-robocon.com/aburobocon/history.html).

### 3.1. Bảng chủ đề theo năm

| Năm | Nơi | Chủ đề | Nhiệm vụ (tóm tắt) | Cấu trúc đáng mượn cho game |
|---|---|---|---|---|
| 2002 | Tokyo | Reach for the Top of Mount Fuji | Leo lên đỉnh núi Phú Sĩ | Trò leo dốc |
| 2003 | Bangkok | Takraw Space Conqueror | Bóng chuyền kiểu takraw | — |
| 2008 | Pune | Govinda (Dahi Handi) | Xếp chồng để với tới nồi sữa trên cao | **Xếp chồng theo chiều cao** |
| 2009 | Tokyo | Travel Together for the Victory Drums | Đánh trống | Phối hợp theo nhịp |
| 2010 | Cairo | Robo-Pharaohs Build Pyramids | **Xếp kim tự tháp** từ khối | Xây chồng, chính xác vị trí |
| 2011 | Bangkok | Loy Krathong | Thả hoa đăng xuống nước | — |
| 2012 | Hong Kong | Peng On Dai Gat | Cầu an bình thịnh vượng | — |
| 2013 | Đà Nẵng | The Green Planet | Năng lượng xanh | Tài nguyên hữu hạn |
| 2014 | Pune | A Salute for Parenthood | Chăm sóc, nuôi nấng | — |
| 2015 | Yogyakarta | Robominton (cầu lông) | **Đánh cầu qua lại, theo LƯỢT** | **Ngoại lệ đối xứng: đánh theo lượt** |
| 2016 | Bangkok | Clean Energy Recharging the World | Sạc năng lượng tái tạo | **Trạm sạc = điểm hẹn** |
| 2017 | Tokyo | The Landing Disc | Đáp đĩa xuống đúng chỗ | Hạ cánh chính xác |
| 2018 | Ninh Bình | **Ném còn** | Ném cầu qua vòng | **Ném qua vòng = điểm xa** |
| 2019 | Ulaanbaatar | Sharing the Knowledge (Urtuu) | Mô phỏng **bước chân động vật 4 chân**; chuyển thông tin như trạm ngựa | **Cùng đề, nhiều lời giải cơ khí khác nhau** |
| 2020 | Suva | ROBO RUGBY 7s | Bóng bầu dục: chuyền + ghi bàn/kick qua cột | **Hai vai: chuyền & ghi điểm** |
| 2021 | Jimo | Pitch-pot (ném thẻ vào chum) | **Một robot bị giới hạn ngoài sân**, robot kia vào trong, xoay chum, **cản đối thủ**, chuyền thẻ còn lại | **Giới hạn vùng di chuyển theo vai** |
| 2022 | Delhi | Lagori (bảy hòn đá) | **Đội đánh theo LƯỢT**: một đội là "seeker" (đập đống đá rồi xếp lại), đội kia là "hitter" (ném bóng để lật bóng trên đầu seeker) | **Hai vai bất đối xứng + theo lượt** |
| 2023 | Phnom Penh | Casting Flowers over Angkor Wat / Throwing rings into poles | Rải hoa, **ném vòng vào cột** | Ném chính xác |
| 2024 | Quảng Ninh | **Harvest Day** | Gặt lúa trên **ruộng bậc thang** | **Địa hình nhiều tầng** |
| 2025 | Ulaanbaatar | **Bóng rổ** | Tranh bóng, **sở hữu bóng chuyển ngay khi bên phòng thủ bắt được bóng** | **Luật chuyển sở hữu** — đối kháng trực tiếp |
| 2026 | Hong Kong | **Kung Fu** | Mỗi đội 2 robot **R1 và R2** | Đặt tên vai R1/R2 như game |

**Ba nhận xét quan trọng:**

1. **Đề là "thể loại" khác nhau, không phải bài tập khác nhau.** Bóng rổ, bóng bầu dục, cầu lông, ném còn, ném vòng, xếp kim tự tháp, gặt lúa, đánh trống — **cùng một bộ khung** (2 robot, sân đối xứng, 3 phút, trần khối lượng) mà ra hàng chục trò khác nhau trong 25 năm.
2. **Bất đối xứng đến từ LUẬT, không từ đồ.** 2021 giới hạn vùng di chuyển theo vai; 2022 chia seeker/hitter và đánh theo lượt. Sân vẫn đối xứng, hai đội vẫn xuất phát như nhau → **công bằng nằm ở luật, khác biệt nằm ở code**.
3. **Xu hướng giảm đối kháng, tăng kỹ thuật.** Cản đối thủ từng là cách thắng (VN 2004/2006, TQ 2008), nhưng luật về sau **hạn chế dần** để buộc các đội giỏi *thiết kế* hơn là *phá* nhau.

### 3.2. Hai đề cụ thể, để thấy độ đa dạng

**a) Vietnam KOSEN Robocon 2026 (chung kết 18/9/2026, 9 đội Việt + Nhật).**
Sân có **cầu** và **đường line dưới sàn**. Robot tay đưa **đế xây dựng** vào vị trí; robot tự động **bám line, vượt cầu, mang khối vật liệu** về khu xây dựng. Muốn **chiến thắng tuyệt đối**: đưa đủ **6 khối**, **xếp đúng yêu cầu**, rồi **cắm cờ ở vị trí trung tâm**. Trận tối đa **4 phút**, hai đội đối kháng trên cùng sân.

**b) Robocon Việt Nam 2019.**
Đề: robot **mô phỏng bước chân của động vật bốn chân** (chủ đề ngựa). Các đội giải cùng một đề bằng **những giải pháp cơ khí khác hẳn nhau**: ĐH Lạc Hồng mô phỏng **bước chân ngựa** (có cả bước nhảy), ĐH Sao Đỏ làm **dạng xe tăng** bước trơn tru. Kỷ lục vòng bảng: **"Uukhai" 26 giây**.

→ Bài học: **cùng một đề, hai lời giải cứng hoàn toàn khác nhau** — và cả hai đều có thể thắng. Đây là bằng chứng thật cho ý "khác biệt đến từ cả cứng lẫn mềm".

### 3.3. Rút ra: **đề là máy sinh nội dung** của game

Đây là kết luận lớn nhất của cả tài liệu, và nó đến từ chỗ user chỉ ra: *mỗi năm một đích khác*.

- **Một bộ khung dùng lại được** (2 robot · sân lưới đối xứng · tick · trần khối lượng/ô nhớ/pin) **+ một đề mới mỗi mùa** = nội dung mới mà **không phải viết engine mới**. Robocon sống 25 năm bằng đúng cách đó: hàng chục trò khác nhau trên gần như cùng một bộ khung.
- **Một "đề" gồm 4 thứ** — chốt bốn thứ này để dùng lại cho mọi mùa:
  1. **Nhiệm vụ và cách tính điểm**
  2. **Luật đặc biệt của mùa** (theo lượt / chuyển sở hữu / giới hạn vùng / thời gian khác)
  3. **Part và khay hàm được phép** — đây là "trần luật"
  4. **Dạng sân**
- **Bốn đề mẫu lấy thẳng từ lịch sử**, mỗi cái dạy một thứ khác nhau:

| Mượn từ | Luật đặc biệt | Dạy được gì |
|---|---|---|
| **2024 Harvest Day** | địa hình nhiều tầng (ruộng bậc thang) | xử lý địa hình, chia việc thành chặng |
| **2021 Pitch-pot** | một robot **chỉ được ở ngoài sân** | **hai chương trình khác nhau phải phối hợp** |
| **2020 Rugby 7s / 2018 Ném còn** | chuyền rồi ghi điểm ở xa | tham số, tầm xa, đánh đổi độ chính xác |
| **2022 Lagori** | seeker / hitter, **đánh theo lượt** | đọc luật và viết code cho **vai của mình** |

- **Giữ "K.O."**: một hành động chốt hạ (cắm cờ / đánh trống) **kết thúc trận ngay**. Vừa có kịch tính, vừa là chỗ để tối ưu code có giá — và là cái kết rất dễ cắt clip.

---

## 4. Chiến thuật thật của các đội — phần giá trị nhất

### 4.1. Điểm chết là lúc **bàn giao** giữa hai robot

> *"Căng thẳng nhất là lúc hai robot phải nối phần việc cho nhau. Robot tự động đi lệch đường, dừng sai vài centimet hay đặt khối chưa chuẩn đều có thể làm chậm cả chuỗi thao tác."*
> — bài về chung kết KOSEN 2026

> *"Cái khó nhất là làm sao để hai robot **'ăn nhịp'**. Robot điều khiển bằng tay có thể linh hoạt theo tình huống, còn robot tự động phải chạy đúng chương trình đã lập. Chỉ cần một robot chậm vài giây hoặc đặt khối lệch vị trí, những thao tác phía sau có thể bị ảnh hưởng."*
> — Ngô Văn Liên, CĐ Công nghiệp Huế

**Phần mềm phải làm được gì:** biết **chờ** đồng đội, biết **kiểm tra** đồng đội đã xong chưa, và có **đường lui** khi đồng đội trễ.

### 4.2. Ổn định thắng tốc độ — và cái trần là có thật

> *"Các đội cần chú ý đến **sự ổn định** của robot thay vì **đẩy cao tốc độ** dẫn tới những sự cố trên sân."*
> *"Kỷ lục về tốc độ giành chiến thắng tuyệt đối… **đã không xuất hiện trở lại** ở vòng loại trực tiếp. Có lẽ do các đội đã **vội vàng đưa tốc độ robot lên cao hơn** so với những gì đã đạt được tại vòng bảng… **tính ổn định của robot không được duy trì**. Bằng chứng: nhiều đội **dẫn đầu về tốc độ ở vòng bảng đã phải khởi động lại robot giữa chừng**."*
> *"Cần **cân nhắc giữa tốc độ và sự ổn định kỹ thuật**. Nếu tăng tốc độ không thể đảm bảo chắc chắn cho chiến thắng, tốt hơn hết là **giữ lại sự ổn định**."*
> *"Khi đã **vượt quá khả năng về tốc độ**, đội đó có thể phải **thất bại trước đội chậm hơn nhưng ổn định hơn**."*
> — PGS-TS Nguyễn Tăng Cường, Trưởng BGK Robocon Việt Nam 2019

**Đây là cơ chế quan trọng nhất cả tài liệu này.** Trong thể thao thật, tốc độ **không** phải chỉ số mua được: vượt một ngưỡng thì **tính ổn định tụt**, và hình phạt là **robot phải khởi động lại** — mất cả bài.

### 4.3. Thử sân thật là bắt buộc

> Đội Nhật *"đã chuẩn bị robot và linh kiện từ trước, nhưng **phải đến Việt Nam mới có thể căn chỉnh theo sân thi đấu thực tế**."*
> *"Thử thách lớn là giúp robot tự động **bám chính xác các đường line dưới sàn**, nên cảm biến phải nhận biết vạch **ổn định trong suốt đường chạy**."*

### 4.4. Vòng luyện: chạy thử → ghi sai số → chỉnh thông số

> Đội vô địch *"dành khoảng **ba tháng** để nghiên cứu, thiết kế và hoàn thiện robot. **Sau mỗi lần chạy thử, các thành viên ghi nhận sai số rồi tiếp tục căn chỉnh cảm biến và thông số vận hành.**"*
> *"Thử **nhiều phương án linh kiện và cách bố trí các bộ phận**, **ưu tiên độ ổn định** vì một sai lệch nhỏ ở cảm biến hay cơ cấu truyền động có thể khiến robot đi sai đường, kéo theo cả bài thi."*

→ **Đúng vòng lặp cốt lõi của game đã có**: chạy → đọc chẩn đoán → sửa → chạy lại. Không phải bịa ra.

### 4.5. Bảy bài học gom lại

| # | Bài học từ sân thật | Đưa vào game thành |
|---|---|---|
| 1 | Điểm chết nằm ở **bàn giao** giữa 2 robot | Nhiệm vụ nối tiếp + hàm chờ đồng đội + chẩn đoán `blocked-teammate` |
| 2 | **Ổn định > tốc độ** khi đã chạm trần | **Trần mềm**: chạy hết tốc độ thì sinh sai số nhỏ |
| 3 | Vượt trần thì **phải khởi động lại** | Hình phạt là **mất tick**, không phải mất bài (không phạt nặng) |
| 4 | **Thử sân thật** mới căn chỉnh được | Sân ẩn + đối thủ ẩn; luyện trên sân chính rồi thi trên sân lạ |
| 5 | Sai số nhỏ ở **cảm biến** làm sai cả bài | Part cảm biến là thứ đáng đầu tư, và bỏ nó thì code phải "mù" |
| 6 | Luyện = **chạy → ghi sai số → chỉnh** | Bản ghi chạy + bảng chẩn đoán (đã có) |
| 7 | Cùng đề, **nhiều lời giải cứng khác nhau** | Nhiều bộ part đều thắng được trên những sân khác nhau |

---

## 5. Rút ra cho game: **trần** và **đánh đổi**

### 5.1. Bốn loại trần

| Loại trần | Trong Robocon thật | Trong game |
|---|---|---|
| **Trần cứng** | 50 kg tổng, kích thước xuất phát, cấm kim loại | **Ngân sách part** + **khối lượng tối đa** + **kích thước lúc xuất phát** |
| **Trần mềm** | Vượt tốc độ → mất ổn định | **Ngưỡng an toàn** của từng part: chạy hết tốc độ thì sinh sai số (tất định theo seed) |
| **Trần tài nguyên** | Pin, thời gian 4 phút | **Pin** + **tick** + **ô nhớ chương trình** |
| **Trần luật** | Đề năm nay quy định được làm gì | **Đề của chặng**: khay hàm, part được phép lắp |

**Nguyên tắc user chốt:** *mọi thứ đều có trần.* Nghĩa là **không có chỉ số nào nâng vô hạn** — kể cả khi thắng liên tục. Đây là hàng rào chống power creep mạnh hơn luật "không part nào trội" (§4.5 GDD).

### 5.2. Sáu đánh đổi lấy thẳng từ sân thật

| Đánh đổi | Lấy ở đâu | Hệ quả lên chương trình |
|---|---|---|
| **Tốc độ ↔ ổn định** | Trưởng BGK 2019 | Chạy nhanh thì phải chấp nhận rủi ro sai số → phải viết code chịu lỗi |
| **Tốc độ ↔ pin** | Vật lý cơ bản | Động cơ mạnh tốn pin hơn mỗi bước |
| **Tầm ↔ cơ động** | Ý user (bắn xa nhưng chậm) | Phải lập kế hoạch đường thay vì chạy đua |
| **Chở nặng ↔ nhanh** | KOSEN 2026: mang khối qua cầu | Mang nhiều thì chậm; chọn số chuyến |
| **Thông minh ↔ ô nhớ** | Robocon: nhồi nhiều cảm biến = nặng, cồng kềnh | Càng nhiều hàm/cảm biến càng tốn ô nhớ |
| **Tự động ↔ linh hoạt** | Tự động chạy đúng chương trình, tay ứng biến | Code phải tính trước; không sửa được giữa trận |

### 5.3. Trần mềm — cơ chế đáng làm nhất rút từ tài liệu này

Trong GDD hiện tại, tốc độ là thứ **mua được** (part nhanh hơn = tốt hơn). Sân thật nói khác: tốc độ có **ngưỡng**, vượt ngưỡng thì **mất ổn định**.

Đề xuất cụ thể: mỗi robot có **ngưỡng an toàn** `an_toan`; mỗi hành động ở tốc độ tối đa cộng dồn **điểm căng**; khi vượt ngưỡng, sim sinh **một sai số nhỏ tất định theo seed** (lệch 1 ô, gắp hụt, chậm 1 tick — chọn theo mã trận). Không phải ngẫu nhiên thật, nên vẫn **tất định và phát lại được** (bất biến §17 số 1).

Vì sao đáng làm:
- Nó tạo ra **quyết định thú vị thật sự**: *"trận này mình dám chạy 100% tốc độ không?"* — đúng câu các đội thật phải trả lời.
- Nó dạy **viết code chịu lỗi** (kiểm tra lại sau mỗi bước, có đường lui) — kỹ năng mà hiện GDD chưa dạy ở đâu.
- Nó biến "chọn part nhanh nhất" thành **sai lầm có thể hiểu được**, không phải bị cấm bằng luật.

---

### 5.4. Hai luật vàng rút từ trần của sân thật

**a) Trần cứng thì thành LUẬT; trần mềm thì thành SAI SỐ.**

| Loại | Sân thật | Trong game |
|---|---|---|
| **Cứng** (đo được, vi phạm là bị loại) | 50 kg, kích thước xuất phát, ≤ 24 V, vật liệu, số robot, thời gian | **Chặn ở màn chuẩn bị**: không cho ra sân, nói rõ vi phạm cái gì. Không trừ điểm trong trận |
| **Mềm** (không ai cấm, vượt là tự hại) | tốc độ ↔ ổn định, chính xác ↔ tầm, độ trễ điều khiển, nhiễu sóng | **Sinh sai số trong trận**, tất định theo seed. Không cấm, chỉ trả giá |

**b) Trần KHÔNG tăng theo tiến độ.** Đây là điều quan trọng nhất, và tôi chưa thấy nó ở tài liệu nào khác:

> Trong Robocon **không có chuyện đội vô địch năm trước được robot nặng hơn**. Trần giống nhau cho mọi đội, mọi năm, mọi vòng. Đội mạnh là đội **dùng trần giỏi hơn**, không phải đội **có trần rộng hơn**.

Với game, đây là hàng rào chống power creep **mạnh hơn hẳn** luật "không part nào trội toàn diện" (GDD §17 số 5): *người chơi giỏi lên thì trần vẫn thế*. Nhờ vậy bảng part **không bao giờ phải làm lại vì người chơi đã mạnh quá** — và đây là lý do kỹ thuật để **cắt hẳn phần mua bán part** ở GDD §11.2.

---

## 6. Cái KHÔNG bê vào

- Vật lý thật (ma sát, quán tính, mô-men), điện tử, PWM, PID, mạch.
- Ba chiều, cầu, dốc phức tạp.
- Điều khiển tay **thời gian thực** (người chơi lái bằng phím trong lúc robot tự động chạy) — phá mô hình theo tick (GDD §4.1).
- Số liệu cụ thể của một năm (50 kg, 6 khối, 4 phút) — chỉ lấy **cấu trúc**, không lấy con số.
- Luật *Foul*/*Violation* chi tiết — trong game chỉ cần **ba mức**: nhắc, mất tick, mất điểm nhiệm vụ.

---

## 7. Việc phải sửa ở GDD nếu user chốt

| Mục GDD | Sửa gì |
|---|---|
| §4.2 khe part | Thêm **khối lượng tối đa**, **kích thước xuất phát**, và **ngưỡng an toàn** cho mỗi part |
| §6.2 ba loại tiền tệ | Thêm **điểm căng** (tốc độ vượt ngưỡng) làm loại thứ tư, hoặc gộp vào tick |
| §6.1 luật trận | Ghi rõ: **2 robot, bàn giao là điểm chết, thưởng hoàn thành sớm, phạt va chạm ba mức** |
| §9 mã chẩn đoán | Thêm `unstable` (vượt ngưỡng an toàn → sai số), `restart` (phải khởi động lại, mất tick) |
| §11 quản lý đội | Cắt **ngân sách part + mua bán**; giữ đội hình, đàn em, lịch, uy tín |
| §10 lộ trình chặng | Mỗi chặng là **một "đề năm nay"** — đổi nhiệm vụ và đổi luật part, đúng như Robocon đổi đề. Đây là **cách sinh nội dung** cho mùa sau: xem bảng đề theo năm ở §3 và bốn đề mẫu ở §3.3 |
| §2.1 vai người chơi | Cân nhắc: nhân vật chính là **đội trưởng kỹ thuật** — khớp đúng vai các đội thật |
| Từ vựng | Cân nhắc dùng **"Uukhai"** cho chiến thắng tuyệt đối (lời thoại đội bạn khoe) |
