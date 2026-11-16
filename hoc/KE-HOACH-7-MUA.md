# Bảng chuẩn 9 mùa (cập nhật 31/10/2026: thêm Mùa 4 Cảng sông và Mùa 5 Bến sông, đổi Núi tuyết thành Hang động đá vôi)

Tên file giữ `KE-HOACH-7-MUA.md` để các tài liệu, bộ nhớ và nhánh khác trỏ tới không gãy; nội dung là bảng 9 mùa.

User 26/10 phác 7 mùa; 31/10 user chốt:
1. Thêm **Bến sông (Sông nước)** sau **Bãi tái chế**, trước **Nông trại hoa**, để chuyển tiếp tự nhiên từ vùng đông dân cư (kho hàng, nhà máy, bãi tái chế) qua sông sang vùng đồng quê – núi rừng ít dân cư dần (nông trại, mỏ đá, hang động), đồng thời xếp `tuple` + `return` ngay trước `list` và `list lồng`.
2. Đổi mùa **Núi tuyết** thành **Hang động đá vôi** vì Việt Nam không có núi tuyết mà nổi tiếng thế giới về hang động đá vôi và đàn đá cộng hưởng.
3. Thêm **Mùa 4 Cảng sông: Cần cẩu container R1** giữa Bãi tái chế và Bến sông (tới bờ sông trước, rồi mới ra sông). Thân là **cần cẩu** (quay cần, vươn / thu cần), không phải thuyền, để khỏi trùng xuồng của Bến sông. Mùa này **tập trung vào tính toán số học**.
4. **Bến sông** (nay là mùa 5) thêm `min` / `max` (gói 7, khi `flow()` trả cặp `(hướng, sức)`). Số âm chuyển sang mùa Cảng.
5. Mùa cuối (nay là mùa 9, Về CLB) đổi bố cục: mỗi gói quay lại một nơi cũ giải cứu, xem mục **Mùa 9 Về CLB** ở cuối file.

Mỗi mùa (Mùa 1–8): **1 thân + 1 tay + 1 cảm biến**, mỗi part có **gốc → nâng cấp**, cộng **1 vật + 1 sàn + 1 cơ chế** mới; **Mùa 9**: Về lại CLB (tổng hợp).

**Bảng đối chiếu số mùa.** Các mục ghi trước 31/10 bên dưới (Luật dự kiến, Chốt 26/10, Không còn trong bảng, Phụ thuộc, Ý tưởng gói) dùng số mùa cũ; đọc theo bảng này:

| Nơi | Bản 7 mùa (26/10) | Bản 8 mùa (31/10 sáng) | **Bản 9 mùa (hiện hành)** | Mã mùa trong code (main) |
|---|---|---|---|---|
| Kho hàng | 1 | 1 | **1** | `mua-1` |
| Nhà máy | 2 | 2 | **2** | `mua-2` |
| Bãi tái chế | 3 | 3 | **3** | `mua-3` |
| Cảng sông | (không có) | (không có) | **4** | chưa có |
| Bến sông | (không có) | 4 | **5** | chưa có |
| Nông trại hoa | 4 | 5 | **6** | `mua-4` |
| Mỏ đá | 5 | 6 | **7** | `mua-5` (ẩn, tên cũ "Sân bóng", đang chứa gói cũ chờ dựng) |
| Hang động (trước là Núi tuyết) | 6 | 7 | **8** | chưa có |
| Về CLB | 7 | 8 | **9** | chưa có |

Đề xuất (Claude, chưa chốt): **giữ nguyên mã mùa trong code**, chỉ đổi số và thứ tự hiển thị (`thu-tu-chuong.js`); mùa mới lấy mã mới (`mua-cang`, `mua-song`…). Đổi mã `mua-4` → `mua-6` sẽ vỡ dữ liệu lưu, máy kiểm và nhánh `claude/part-dung-mua`.

## Bảng

| Mùa | Ý Python | Thân (gốc → nâng cấp) | Tay (gốc → nâng cấp) | Cảm biến (gốc → nâng cấp) | Vật | Sàn | Cơ chế |
|---|---|---|---|---|---|---|---|
| 1 | `def`, `for`, `if` / `while` | Hai bánh → đi lùi | Tay kẹp → tay xoay | Khoảng cách → cảm biến bên (bên cạnh có vật không) | Thùng gỗ | Ô đích | Nút đè |
| 2 | *biến (gán, đếm, tham số)* | Xích → đẩy thùng nặng khi tiến | Súng hơi → lực bắn `"fast"` / `"charge"` | Hồng ngoại: cách bao nhiêu ô `distance()` → thêm đo nhiệt `warm()` (robot, nút đang bật) | Thùng nặng | Băng chuyền | Cửa + nút bắn |
| 3 | *chuỗi và logic (`and` / `or`, `elif`)* | Nhện → nhảy | Nam châm (một cực) → đảo cực | Cảm ứng từ: sắt → đọc cực | Sắt + nam châm (nam châm điện) | Hố | Đệm từ (hút / đẩy thân xe) |
| 4 | *số học: số âm, `abs()`, `%`, `//`* | Cần cẩu, bệ đứng yên: **quay cần** (nấc quay) và **vươn / thu cần** 1–3 ô → **chạy trên ray** (cả cần cẩu dời dọc đường ray) | Móc cẩu: nhấc container **trên cùng** của chồng ở đầu cần, hạ xuống chồng / ô khác → **nhấc đôi** (một lần nhấc hai container) | Máy quét mã: đọc **số** của container ở đầu cần → **cân tải** (container nặng thì cần không vươn xa được) | Container có số (xếp chồng nhiều tầng) | Bãi container + ô tàu ở bến | Tàu cập / rời bến theo nhịp (tàu chỉ đậu một số nhịp) |
| 5 | *`return`, bộ cố định `tuple` (`h, s = flow()`), `min` / `max`* | Xuồng chân vịt (đi trên nước, trôi theo dòng) → thả neo `anchor()` (đứng vững giữa dòng xiết) | Dây phao kéo `tow()` (kéo vật nổi từ xa 2–3 ô về mũi) → buộc dắt theo đuôi `tether()` (kéo bè đi theo sau như sà lan) | Chong chóng đo dòng chảy: hướng dòng `flow_dir()` → cặp `(hướng, sức_nước)` `flow()` | Bè nổi / Lục bình (trôi theo dòng, ghép làm cầu phao) | Mặt nước & Dòng chảy (thuận/ngược/ngang) | Cống thủy lợi / Âu tàu (đóng/mở đổi dòng chảy & mực nước) |
| 6 | *danh sách (`list`)* | Drone pin ít, bay ngắn → hạ cánh / cất cánh để sạc | Máy sơn chấm ô → bút liền | Camera màu phía trước → thêm camera dưới chân | Hộp màu | Sàn màu | Ô sạc |
| 7 | *lưới 2 chiều (danh sách lồng `grid[r][c]`)* | Omni → đi chéo | Máy ném lực 2 → chỉnh lực | Radar tròn: khoảng cách 4 hướng → hình dạng (tròn / vuông) | Bóng tròn / Đá tròn (xe nào cũng đẩy được) | Sàn dốc | Bàn xoay |
| 8 | `dict`, `set` | Bánh gai → thu gai | Loa: phát theo nhịp `beat()` → phát theo nốt `note(n)` | Âm thanh: nghe nhịp → nghe nốt | Nguồn phát nhạc (chuông đá định vị) | Sàn đá ướt (trơn như băng) | Đường hầm / Ngách hang (luật của cổng dịch chuyển cũ) |
| 9 | ôn mọi ý Python, đọc code người khác, chiến thuật | quay lại tám nơi giải cứu: chọn đội hai cỗ máy, rồi một robot đặt sẵn + một robot tự lắp; câu đố tổ hợp (hộp trên bàn xoay, phun qua cổng, ném vật, đẩy vật lấp hố, kéo bè làm cầu phao, cẩu container qua sông); song ca (xem mục Mùa 9) | | | | | |

Đủ 8 × 8: **thân** hai bánh, xích, nhện, cần cẩu, xuồng, drone, omni, bánh gai · **tay** kẹp, súng hơi, nam châm, móc cẩu, dây phao kéo, máy sơn, máy ném, loa ·
**cảm biến** khoảng cách, hồng ngoại, cảm ứng từ, máy quét mã, chong chóng dòng chảy, camera, radar tròn, âm thanh · **vật / sàn / cơ chế** đủ 8 mỗi loại.

## Cỗ máy của mỗi mùa (29/10–31/10, user phác & chốt)

**Thứ tự nơi = con đường từ CLB ra xa (đông dân cư → qua sông → đồng quê → núi rừng hoang sơ) rồi quay về (user chốt 31/10):** kho hàng (trong thị trấn) → nhà máy (rìa, khu công nghiệp) → bãi tái chế (cuối khu công nghiệp, sát bờ sông) → **cảng sông (bến container ven sông, tới sông)** → **bến sông / trạm thủy lợi (vượt sông)** → nông trại hoa (đồng quê bên kia sông) → mỏ đá (chân núi) → hang động đá vôi (lòng núi sâu, xa nhất) → về CLB (mùa 9). Bản đồ thế giới vẽ thành MỘT con đường uốn lượn qua tám trạm; mỗi mùa xong trạm sáng lên. Ảnh nơi chốn mỗi nơi một tông màu riêng (không ép bảng "lab trắng").


Ba part của một mùa ghép lại thành **một cỗ máy gần giống thiết bị ngoài đời** mà trẻ gọi được tên. Cỗ máy là câu chuyện, phim, hình vẽ và
tên gọi; **không quyết định luật** (hội đồng 29/10, cả bốn thành viên đồng ý). Gói 10 mỗi mùa là cỗ máy đó **xuất xưởng** (xem KE-HOACH-PHIM-GOI.md mục Sợi dây chung).

| Mùa | Cỗ máy | Nơi làm việc | Ghép thế nào | Đổi hình / tên (luật giữ) |
|---|---|---|---|---|
| 1 | Xe chở hàng | kho hàng | hai bánh chở, tay gắp bốc thùng, cảm biến tránh va | (không) |
| 2 | Xe cứu hỏa (robot chữa cháy bánh xích) | nhà máy | xích leo đống đổ nát, ủi thùng; súng hơi như vòi phun (tia nhanh / tia mạnh); hồng ngoại đo nhiệt như camera nhiệt tìm điểm nóng | user 29/10 bỏ "xe tăng" (chủ đề chiến tranh); tên part "súng hơi" tạm giữ, chỉ lời phim gọi vòi phun |
| 3 | **Robot phân loại phế liệu R1** (user 30/10, thay Xe thăm dò quặng; dáng cua: chân nhện + nam châm) | **bãi tái chế phế liệu** (thay mỏ quặng, để khỏi trùng mỏ đá) | nhện leo đống phế liệu / chui gầm băng chuyền, nhảy qua khe giữa đống phế liệu; nam châm nhặt sắt vụn; cảm biến từ = **phân loại rác** (sắt / gỗ, nhựa); đệm từ = tấm nam châm điện dưới sàn bãi; đảo cực, đọc cực = vật có nam châm bên trong (loa, động cơ cũ) | **luật giữ nguyên, chỉ đổi hình / tên / lời** (mùa 3 đã đủ 200 màn); sắt = sắt vụn, hố = khe giữa đống phế liệu |
| 4 | **Cần cẩu container R1** (user chốt 31/10: chèn giữa Bãi tái chế và Bến sông; thân cần cẩu để khỏi trùng thuyền) | **cảng sông** (bến container ven sông, cuối khu công nghiệp; hàng tái chế và hàng nhà máy xuống tàu) | bệ cẩu đứng yên, **quay cần và vươn / thu cần** để với tới ô (kiểu di chuyển chưa mùa nào có: trẻ nghĩ "đứng đâu thì với tới đâu" thay cho tìm đường), nâng cấp chạy trên ray; móc cẩu nhấc container trên cùng của chồng, nâng cấp nhấc đôi; máy quét mã đọc số container, nâng cấp cân tải; tàu chỉ đậu ở bến một số nhịp | ngoài đời: cẩu tháp, cẩu giàn chạy ray ở cảng container, cẩu nhấc đôi, cảm biến tải chống lật cẩu. Người nhờ: chưa đặt (phiên phim) |
| 5 | **Tàu thủy lợi & tuần tra sông nước R1** (user chốt 31/10: sau Cảng sông, trước Nông trại hoa) | **bến sông / trạm thủy lợi** (con sông ngăn cách khu công nghiệp với vùng đồng quê) | thân xuồng chân vịt lướt trên mặt nước, thả neo `anchor()` giữ vị trí giữa dòng nước xiết; dây phao kéo `tow()` quăng từ xa kéo bè hàng / lục bình về mũi, nâng cấp buộc dắt theo đuôi `tether()` như tàu kéo sà lan; chong chóng đo dòng chảy đọc hướng chảy và sức nước `(hướng, sức)`; cống thủy lợi điều tiết dòng nước tưới sang nông trại | cơ chế dòng nước đẩy/kéo quen thuộc như băng chuyền nhưng có hướng và sức nước (`-1`, `+1`, `+2`); ngoài đời ở Việt Nam có tàu tự hành vớt lục bình trên sông và trạm cống thủy lợi miền Tây |
| 6 | **Drone nông nghiệp** (user 30/10, thay Drone kẻ vạch) | **nông trại hoa** (đồng quê bên kia sông, dùng nước từ trạm thủy lợi mùa 5) | drone bay trên luống; máy sơn thành **bộ gieo hạt / bình phun**: mỗi màu là một loại hạt hoa, `dot` gieo một ô (ô nở hoa đúng màu), bút liền phun / gieo cả hàng; camera nhìn luống: hoa màu gì, lá vàng (phun phân bón) hay có sâu (phun thuốc); hộp màu = bao hạt; ô sạc giữ (hạ cánh thay pin, nạp bình) | **luật giữ nguyên, chỉ đổi hình / tên** (như súng hơi → vòi phun); lý do: drone phun thuốc rất phổ biến ở Việt Nam, trẻ dễ nhận ra ứng dụng thật |
| 7 | **Máy khai thác đá R1** (user 30/10, thay Robot cầu thủ: sân bóng không có hố, dốc) | **mỏ đá trên núi** (chân núi, đá vàng nâu ngoài trời) | omni bò ngang sườn dốc; bóng tròn = **tảng đá tròn** lăn theo dốc; lấp hố đã khai thác; radar tròn phân biệt **đá hộc (tròn) / đá xẻ (khối)**; bàn xoay = mâm xoay máy cắt đá; máy ném = tay hất / đẩy đá (đặt tên sau) | robot cần thật: đá lở, bụi, nổ mìn nguy hiểm cho người; ngoài đời có máy khai thác điều khiển từ xa |
| 8 | **Xe thám hiểm & cứu hộ hang động R1** (user chốt 31/10, thay Xe tuần tra núi tuyết vì Việt Nam không có núi tuyết) | **hang động đá vôi** (kiểu Phong Nha – Sơn Đoòng – Tràng An, ngay sau mỏ đá) | bánh gai bám sàn đá vôi phủ bùn nhũ / rêu ướt trơn bóng, thu gai trượt dốc máng đá ướt; **loa phát nhịp định vị tiếng vang (như dơi) và phát nốt cộng hưởng làm khối thạch nhũ rỗng (đá chuông / đàn đá) rung nứt**; cảm biến âm thanh nghe tiếng vang / đọc nốt đá chuông | cổng dịch chuyển → **ngách hang ngầm xuyên vách núi** (**user chốt 29/10 & 31/10**); sàn băng → sàn đá vôi ướt; khối băng → khối thạch nhũ rỗng (đá chuông) |
| 9 | Robot riêng của Sola, của Luna (30/10) | **về lại CLB** (trung tâm thị trấn) | quay lại tám nơi giải cứu (mục Mùa 9 ở cuối file); chọn đội từ tám cỗ máy, rồi tự lắp một robot từ part đã có | |

Combo gói 9 gợi ý (hội đồng): mùa 7 Mỏ đá **"Trượt và sút"**: omni có máy ném được ném khi đang trượt (lõi hiện bắt đứng yên: `nem-dung-yen`, `san-hoc.js` mục MÁY NÉM);
cùng khuôn với Bệ súng xích (bỏ một điều bất lợi). Mùa 8 Hang động: để lúc lập kế hoạch mùa 8 (ứng viên: phát đúng nốt thì mở ngách hang / làm khối thạch nhũ lăn).
Khuôn gói 8–10 đã đổi 31/10 (nhánh `claude/part-dung-mua`): 8 cỗ máy mùa gặp yếu tố mùa trước, 9 đội với R2 lắp part mùa trước, 10 R1 chạy một mình nhiều sân; gợi ý combo trên chỉ còn để tham khảo.

Mùa 8 Hang động: "làm tuyết lăn" (ghi 29/10 khi còn là Núi tuyết; nay đọc **khối tuyết / khối băng = khối thạch nhũ rỗng (đá chuông)**, sàn băng = sàn đá ướt; user 29/10 hỏi, Claude góp ý, chưa chốt):
- Ngoài đời đội tuần tra núi tuyết vừa **chủ động gây lở có kiểm soát** (để tuyết không lở bất ngờ) vừa **cứu hộ**: một cỗ máy làm cả hai, dùng đủ hai part âm thanh
  (loa phát = chủ động, cảm biến nghe = tìm người). Lưu ý cho lời thoại: ngoài đời người ta gây lở bằng pháo hơi / nổ khí, tiếng nói thường không làm tuyết lở; trong game
  coi loa là "còi sóng âm cực mạnh", đừng dạy trẻ rằng hét to làm lở tuyết.
- Gợi ý luật: **khối tuyết** nằm trên sàn dốc (sàn mùa 7, mùa 8 được dùng) chỉ lăn khi nghe **đúng nốt** của nó; lăn theo luật bóng tròn mùa 7 (tới vật cản, lấp hố).
  Python: `dict` khối → nốt (`{"A": 3, "B": 5}`), `set` khối đã lăn. Tốn một luật mới (tuyết đáp nốt) nhưng dùng lại máy lăn bóng sẵn có.
- Còn phải chốt: khối tuyết thay hay đi cùng "nguồn phát nhạc" (vật mùa 8, nay là chuông đá định vị); nguồn phát giữ vai máy báo hiệu của người cần cứu.

Mùa 8 Hang động, âm thanh: bài hát, cộng hưởng, R1 và R2 nói chuyện (user 29/10 đồng ý ghi khi còn là mùa 6; chi tiết chốt khi lập kế hoạch mùa 8):
- **Nốt và độ dài theo nhịp nguyên** (lõi chỉ có nhịp nguyên, mọi luật đếm theo nhịp; không dùng 0,25 / 0,5): nốt 1–8 = đô rê mi fa son la si đô cao;
  1 nhịp = nốt ngắn nhất (móc đơn), nốt đen 2, đen chấm dôi 3, trắng 4; `0` = nghỉ. Lệnh gợi ý `note(n, so_nhip)`, vd `note(3, 2)` = mi ngân 2 nhịp.
  Game tạo tiếng bằng máy (`hoc/game/am-thanh.js`): phát được nốt thật, trẻ nghe ra bài mình lập trình.
- **Bài hát không chỉ là dãy nốt đơn** (user: dãy nốt đơn thì ít bài đánh được): ghi theo Python của từng mùa: chuỗi `"1 2 3- 0"` (`-` ngân thêm một nhịp, mùa 3),
  danh sách lồng `[[1, 1], [2, 1], [3, 2], [0, 1]]` (nốt, số nhịp; mùa 7 lưới); `dict` mùa 8 hợp làm bảng (tên → nốt, khối → nốt), không chứa được bài có nốt lặp.
- **Song tấu**: R1 phát giai điệu, R2 phát bè cùng nhịp (máy chấm đã chạy nhiều robot theo nhịp); màn thắng khi hai giọng ghép đúng bài. Hợp gói đội mùa 8; mùa 9 dùng lại cho các đoạn song ca (mục Mùa 9).
- **Khối băng có tần số cộng hưởng riêng** (user: "1 khối băng sẽ có 1 tần số cộng hưởng riêng nên cần phát âm liên tiếp"; đúng vật lý: hát đúng nốt làm vỡ ly):
  mỗi khối một nốt riêng + độ bền k; nghe đúng nốt đó k nhịp LIÊN TIẾP thì nứt / lăn (khối "8888": nốt 8, k = 4); nghỉ một nhịp hay sai nốt thì dao động tắt, đếm lại.
  Vạch rung trên khối dâng dần. `note(8, 4)` (ngân 4 nhịp) cũng tính là 4 nhịp liên tiếp. Hai robot cùng phát một nốt vào khối lớn thì nứt nhanh hơn (gói đội).
- **Đo nốt rồi phát** (màn ép cảm biến âm thanh): gõ khối băng thì nó ngân nốt riêng; robot nghe `n = listen()` rồi phát lại n đủ k nhịp; mỗi sân một nốt khác nên không viết cứng được.
- **R1 và R2 nói chuyện bằng nốt** (lần đầu có tín hiệu thật; mùa 1–7 đội chỉ báo nhau bằng vị trí / nhiệt): bảng mật mã là `dict` (`{3: "trái", 5: "phải"}`), `set` nhớ nốt đã nghe.
  Luật đề xuất: phát nhịp này, robot khác nghe nhịp sau; nghe cả sân (tường chặn tiếng để màn khó); mỗi robot một nốt mỗi nhịp, hai robot cùng phát thì `listen()` trả tập nốt;
  không nghe tiếng của chính mình; `listen()` trả số, nghĩa do trẻ tự đặt.
- Còn phải chốt: tách rõ "khối băng đáp nốt của loa" với "robot đọc nốt qua listen()" để trẻ không lẫn; tiếng của R2 có tính vào mẫu cộng hưởng không; vai của "nguồn phát nhạc".

## Quy tắc đặt tên và giọng kể (user duyệt 29/10; hội đồng 20261029-1738)

Game tên **Mật Lệnh Robot** (đổi 29/10). Chỉ đổi chữ hiển thị, mã gói / chương giữ nguyên (khoá lưu). Khối đặt tên ở cuối `hoc/lo-trinh-hoc.js`.
1. **Tên mùa = nơi robot làm việc** (1–3 chữ): Kho hàng · Nhà máy · Bãi tái chế (30/10, thay Mỏ quặng) · **Cảng sông (31/10, thêm mới sau Bãi tái chế)** · **Bến sông (31/10, thêm mới trước Nông trại)** · Nông trại (30/10, thay Thành phố) · Mỏ đá (30/10, thay Sân bóng) · Hang động (31/10, thay Núi tuyết) · CLB (mùa 9: về lại CLB).
   Mùa 1 "Xưởng R1" → **"Kho hàng"** (user 29/10: mùa 1 là xe bê vác).
   Khái niệm Python không làm tên mùa (nếu cần thì làm nhãn phụ cho phụ huynh, chưa quyết).
2. **Tên gói = món mới hay tình huống mới**, gọi đúng như thẻ bộ phận (`hoc/gioi-thieu-part.js`); mỗi món một tên trong cả game. Không "Combo", không "Đội" trống.
3. **Tên chương = việc em làm**, không lặp tên gói, không "Hàm cho…", không tên khái niệm (if, while, biến); chương dạy tạo hàm thì "Chế lệnh: …".
4. **Phim gói 4 nhịp**: sự cố → lắp món mới ("CẠCH!") → dùng được → một lệnh mới. Mỗi khung một ý, câu đọc to nghe tự nhiên, không nhồi hai lệnh.
   Không chữ vũ khí: dùng phun, xịt, mở van thay cho bắn, súng (mùa 2 đổi cùng gói vòi phun / van hơi).
5. "Mật lệnh" dùng có chừng mực: phim mở đầu và phim cuối mùa (móc sang nơi tiếp theo), không rải ở mọi chương.
6. **ĐÃ THAY 30/10** (KE-HOACH-PHIM-CLB.md): nhân vật chỉ Sola và Luna của CLB Robot; R1 robot của Sola (khoá xanh `#38BDF8`), R2 robot của Luna (hồng). Bản cũ bên dưới giữ để tra.
   **Nhân vật chính là EM, người chế tạo robot** (user duyệt 29/10). Không vẽ nhân vật người: phim kể bằng "em" (em tìm, em lắp, em viết mật lệnh).
   **R1 là bộ não robot của em**, mùa nào cũng được lắp vào một thân máy mới (Xe chở hàng R1, Xe cứu hỏa R1, …); xưởng là xưởng của em; R2 là robot thứ hai em chế.
   Câu thoại có R1 làm việc vẫn giữ ("R1 hạ tay, kẹp thùng"), câu nhặt / lắp đồ thì chủ thể là em.

Đã đổi 29/10: tên 4 mùa đang có (mùa 1 sau đó thành Kho hàng), lời phim mở đầu và 9 phim gói mùa 1 theo góc nhìn em (quy tắc 6), gói và chương mùa 1 (Tay gắp → Tay kẹp, Kho hàng → Nút đè, Đội hai robot → Gặp R2, Combo → Nhìn bên, nhặt bên;
20 chương theo quy tắc 3), phim mở đầu khung 3 (bánh xích "văng qua tường ra ngoài", khớp hình và khớp "chờ trên đồi" ở phim sau) và khung 6 ("mật lệnh").
Mùa 3 (user 29/10): giữ thân nhện; gói 3 "Cảm ứng từ" → **"Cảm biến từ"** (trùng thẻ part), chương "Dò sắt" / "Chế lệnh: dò sắt" (mã cam-ung-tu giữ).
Mùa 2 (29/10, sau khi vòi phun / van hơi gộp): gói Băng chuyền, Cảm biến hồng ngoại, Lực phun, R2 trở lại, Xe cứu hỏa R1; 20 chương theo quy tắc 3;
10 phim mùa 2 giọng em, phun thay bắn (≤ 14 từ). Chữ "bắn" trong đề bài / gợi ý / lời báo lỗi của màn mùa 2: đợt riêng (agent), sau gói giật một ô.
30/10: bốn chương mùa 2 đổi tiếp cho khỏi trùng / lặp tên gói (Trôi theo băng, Đưa thùng vào đích, Chế lệnh: mở van nguội, Thử mọi món); tầm phun nhẹ chốt 2 ô.
30/10: huy hiệu mùa 1, 2 mang tên chương chứa màn trùm ("Huy hiệu Lăn bánh", "Huy hiệu Chế lệnh chọn lực").
Còn: các tên khác của mùa 3 (đặt khi làm P2), nhãn Python cho phụ huynh.

## Ô còn trống
| Ô | Gợi ý của Claude |
|---|---|
| (hết ô trống 26/10) | |

## Ý tưởng gói nội dung sau (chưa xếp chỗ; số mùa theo bản 7 mùa)
- **Drone gắp và phun sơn xuống ô bên dưới** (user 27/10). Hiện luật `part.js` chỉ cho drone gắn nam châm (tay khác đều "chỉa về phía trước", mà drone
  không có hướng mặt). Ý tưởng: cho drone gắn **tay kẹp hướng xuống** (gắp vật ở ô ngay dưới, mang bay qua rào / hố / băng, thả xuống ô khác: kiểu giao hàng)
  và **máy sơn hướng xuống** (phun màu ô ngay dưới, không cần quay mặt). Cần làm khi xếp gói: luật mới trong `part.js` (ổ `duoi` nhận kẹp / sơn), lõi
  `san-hoc.js` (gắp / thả / sơn theo ô dưới drone, độ cao bay), máy chấm, hình vector tay hướng xuống, màn mới + máy kiểm đường tắt.
  Chỗ hợp: **mùa 4** (drone và máy sơn cùng mùa: gói nâng cấp drone hoặc gói đội), hoặc **mùa 7** (câu đố tổ hợp). Chốt khi lập kế hoạch mùa 4.

- **Đám cháy** (user 29/10, xếp sau). Mùa 2 là Xe cứu hỏa nhưng chưa có lửa. KHÔNG đổi nút bắn thành lửa: nút đổi qua lại (bắn hai lần về như cũ),
  còn điều khiển băng chuyền, `warm()` đọc nút bật là nóng, nút bật sẵn; cửa còn mở bằng nút đè (mùa 1) và cửa nhịp. Đổi là phải sửa luật, dựng lại nhiều màn mùa 2.
  Làm thành **yếu tố MỚI**: phun nước trúng thì lửa tắt hẳn (một chiều, không bật lại); `warm()` thấy lửa là nóng (đúng việc camera nhiệt);
  có thể thêm cửa chống cháy chỉ mở khi mọi đám cháy trên sân đã tắt. Chỗ hợp: trùm mùa 2 "Xe cứu hỏa R1 xuất xưởng", hoặc câu đố tổ hợp mùa 7.
- **Phun nhẹ là mặc định, lực mạnh mở ở gói 6** (**user chốt 29/10**): lệnh đổi tên shoot() → spray(), shoot_back() → spray_back(); lực "fast" / "charge" → "low" / "high". spray() không đối số = phun nhẹ (tầm 2 ô, xe không giật); spray("high") mở khoá ở gói 6 Lực phun, là lần đầu xe giật. Hàm em tự chế có chữ vũ khí (fire, blast, shot, aim...) đổi tên, chữ fire để dành cho đám cháy. Gói 2 dạy lại theo phun nhẹ; ý thùng sau lưng, thùng đi băng chuyển sang gói 6. Giao hai đợt: hoc/ban-giao/brief-phun-nhe-a.md (đổi tên, mặc định, màn sau gói 6 viết "high", di trú dữ liệu lưu) rồi brief-phun-nhe-b.md (dựng lại gói 2, chương chế lệnh gói 4, gói 6).
- **Nút bắn là VAN HƠI** (Claude đề xuất, **user chốt 29/10**, giao sau gói vòi phun; chỉ đổi hình và lời, luật giữ; **ĐÃ LÀM 29/10** nhánh claude/van-hoi: hình van + ống hơi, chữ người chơi thấy, nền NEN_VEC 9a6d47c): nhà máy cũ chạy bằng hơi nước nóng. Nút N là một van tay quay
  có cánh hứng nước gắn trên tường; tia nước đập vào cánh làm van quay nửa vòng: mở ↔ đóng (đúng luật đổi qua lại). Van mở thì hơi nóng chảy qua,
  nên van **nóng** (`warm()` True), băng chuyền chạy bằng hơi, cửa khí nén mở / đóng (dây nối nút ↔ cửa vẽ thành ống hơi). Lý do phải phun từ xa:
  van đang mở nóng bỏng, không chạm tay được. Camera nhiệt nhìn van nào đang mở trước khi phun. Tránh hướng "công tắc điện" (nước với điện là bài học sai cho trẻ).

## Mùa 4 Cảng sông và Mùa 5 Bến sông: Python (user chốt 31/10)

**Mùa 4 Cảng sông: tính toán số học.** Vòng quay của cần cẩu là lý do tự nhiên để cần số âm và phép chia lấy dư:
- Python A (gói 1): **số âm, `abs()`**. Quay trái là số âm, quay phải là số dương; `abs(dich - hien_tai)` là số nấc phải quay; tầm vươn bằng `abs` hiệu toạ độ.
- Python B (gói 2): **`%` và `//`**. Đang ở nấc 6, quay thêm 3 nấc (vòng 8 nấc) thì tới `(6 + 3) % 8 = 1`; `//` chia container thành số chuyến (`so_chuyen = so_thung // 2` khi nhấc đôi).
- Cảm biến trả **số**: số container (máy quét mã), rồi số cân (cân tải); so sánh số để xếp đúng chồng, đúng tàu.
- Gợi ý màn trùm (tuỳ chọn, chưa chốt): **Tháp Hà Nội** với ba chồng container, giải bằng hàm tự gọi lại chính nó (chỉ cần `def` và tham số, không cần list).
- Còn phải chốt: 4 hay 8 nấc quay; tên lệnh (quay cần dùng lại `turn_left` / `turn_right` hay lệnh riêng; vươn / thu, móc / thả, đọc số, cân);
  container thường của mùa này khác thùng gỗ mùa 1 ở chỗ có số và xếp chồng nhiều tầng (hình nhìn từ trên phải cho thấy số tầng).

**Mùa 5 Bến sông: `return`, `tuple`, `min` / `max`.** Số âm đã học ở Cảng, Bến sông dùng lại để bù bước xuôi / ngược dòng.
- Python A (gói 1): **`return`** trong hàm của em (`def step_needed(d): return ...`). Python B (gói 2): **`tuple`** (`pair = ("right", 2)`, gỡ cặp `h, s = flow()`).
- **`min` / `max` ở gói 7** (nâng cấp cảm biến, `flow()` trả cặp `(hướng, sức)`): ở ngã ba kênh, chọn **nhánh nước yếu nhất** để đi ngược dòng hay **nhánh mạnh nhất** để xuôi cho nhanh; có trần nhịp nên chọn sai nhánh là quá giờ.
  Đường cong: chương 1 `min(a, b)` trên hai số (đọc hai nhánh) → chương 2 tìm min dần trong vòng lặp (`yeu = min(yeu, s)`, quay mũi đọc từng nhánh) →
  màn trùm nhớ cả nhánh: `best = min(best, (s, h))` rồi `s, h = best`. Trẻ tự ghép cặp `(sức, hướng)` theo đúng thứ tự nên thấy thứ tự trong tuple có nghĩa (`min` so phần tử đầu trước).
  Mùa 6 Nông trại dùng tiếp `min(a)` / `max(a)` trên danh sách.

**Lõi Python phải thêm** (`nhan/san-robot-core.js`, rà 31/10): số âm (phép trừ một ngôi) **đã có**; `%`, `//` **đã có**; hàm dựng sẵn hiện chỉ `len`, `str`, `int`:
**chưa có `abs`, `min`, `max`**, **chưa có tuple** (tạo cặp, `t[0]`, so sánh, gỡ cặp khi gán / trong `for`). Khay lệnh mỗi mùa mở đúng thứ mùa đó dạy.

## Luật dự kiến cho các yếu tố mới (user 26/10, Claude làm rõ; số mùa theo bản 7 mùa, xem bảng đối chiếu ở đầu file)
- **Đệm từ (cơ chế mùa 3)**: ô đệm có cực N hay S, kéo hoặc đẩy **thân xe** ở ô kề (1 ô mỗi nhịp, dọc theo hàng / cột).
  Xe không bật nam châm: bị hút như sắt. Xe bật nam châm **khác cực** đệm: bị hút; **cùng cực**: bị đẩy ra xa.
  Dùng đủ ba part mùa 3: cảm ứng từ đọc cực của đệm, nam châm đảo cực để chọn hút hay đẩy (`if pole == "N": magnet_n()`: đúng ý Python chuỗi và logic).
  Khác băng chuyền (mùa 2): băng đẩy một chiều cố định, đệm tùy cực mình chọn. Cần chốt: nhện đang nhảy có bị hút không; drone (mùa 4) bay qua có bị hút không.
- **Bóng tròn (vật mùa 5)**: xe nào đi vào ô bóng thì đẩy bóng **lăn tới khi gặp vật cản** (khác thùng nặng mùa 2: chỉ xích đẩy, mỗi lần 1 ô).
  Bóng lăn vào hố thì **lấp hố** thành đường (ý "đẩy vật lấp hố" của mùa 7 có ngay từ đây).
- **Sàn dốc (sàn mùa 5)**: chỉ tác động **vật tròn**: bóng nằm trên dốc tự lăn xuống mỗi nhịp; xe đi lại bình thường (để khỏi trùng băng chuyền).
- **Hồng ngoại / radar**: mùa 2 **cảm biến hồng ngoại** chiếu thẳng trước mặt: gốc `distance()` trả số ô tới vật cản (cảm biến hồng ngoại thật làm đúng việc này).
  Nâng cấp **đo nhiệt** `warm()`: True khi thứ trước mặt **có nhiệt**: robot (thân có động cơ) hay **nút bắn đang bật** (user 26/10: nút bật thì nóng, tắt thì nguội);
  False khi là tường, thùng, cửa, nút tắt. Có nút nóng thì màn một robot cũng có câu đố: đứng xa đo nút nào đang bật rồi mới bắn đúng nút (hai nút trông giống hệt nhau, cửa ở chỗ khuất). Hồng ngoại thật đo được nhiệt nhưng **không nhận ra vật là gì**,
  nên bỏ `what()` (user 26/10: mạnh quá, hơn cả camera mùa 4). `warm()` còn dùng cho gói đội mùa 2 và đối kháng mùa 7: thấy robot thì chờ, thấy vật thì vòng.
  Mùa 5 radar tròn quét quanh xe: khoảng cách 4 hướng (danh sách) → **hình dạng** (bóng tròn hay hộp vuông); radar / LiDAR thật đo được dáng thô của vật.
- **Loa / âm thanh (mùa 6)**: nhánh loa (`claude/music-element-integration-02284a`) đã có hai lệnh `beat()` (gõ trống) và `note(n)` (nốt 1–8):
  gốc chỉ `beat()` (phát theo nhịp), nâng cấp mở `note(n)`. Cảm biến âm thanh: gốc nghe có tiếng / đếm nhịp, nâng cấp nghe nốt nào. Nguồn phát nhạc là vật trên sân phát nhịp / nốt.
  Python: `dict` tra nốt → việc làm (`{3: "left", 5: "right"}`), `set` các nốt đã nghe (không trùng).

## Chốt 26/10 (số mùa theo bản 7 mùa, xem bảng đối chiếu ở đầu file)
- Mùa 2 cảm biến là **hồng ngoại** (chỉ nhìn thẳng trước mặt), mùa 5 là **radar tròn** (quét quanh xe).
- Bánh gai nâng cấp **thu gai**: thu gai vào thì trượt trên băng đá như xe khác (trượt có chủ đích để đi nhanh).
- Omni nâng cấp **đi chéo** (trượt và tiến cùng nhịp; lõi đang cấm `omni-khong-cheo`). Cách khác đã cân: khóa bánh trên băng chuyền (trùng ưu điểm của xích), xoay mặt lúc trượt (khó thấy lợi). Đi chéo hợp mùa 5 nhất: đổi cả x lẫn y trong một nhịp, đúng ý lưới.
- Mùa 1 sàn: **ô đích**. Ô sạc không dùng được ở mùa 1 vì mùa 1 chưa có pin; ô sạc để mùa 4 cùng drone.
- Mùa 2: thùng nặng là vật; nâng cấp xích là đẩy thùng nặng khi tiến (đã bàn: "Lưỡi ủi").
- Mùa 4: hộp màu là vật (cũng lấp chỗ camera mùa 4 cần thấy màu vật).
- Mùa 6: sàn băng đá + thân bánh gai (xe khác trượt trên băng, không điều khiển được). Đặt tên **băng đá** để khỏi lẫn với băng chuyền.
- Drone: gốc có pin nhưng ít, bay ngắn; nâng cấp là hạ cánh / cất cánh (đỗ lên ô sạc để nạp pin).

## Không còn trong bảng (phải xử lý khi dựng lại; số mùa theo bản 7 mùa)
| Thứ | Số màn đang dùng | Xử lý |
|---|---|---|
| Bậc thang `S` | 37 (xích 8, đội xích và nhện 16, đọ sức part mạnh 3, lắp ráp 5…) | bỏ (user 26/10: vai trò giống hố); dựng lại các màn này |
| Gầm thấp `n` | 24 (chủ yếu nhện) | *giữ trong nâng cấp nhảy của nhện* (co chân vừa chui gầm vừa nhảy) hoặc bỏ |
| Hàng rào `=` | 79 | giữ làm chướng ngại chung (drone bay qua, máy ném ném qua) |
| Cảm biến màu ở bụng | mùa 2 hiện nay | gộp vào camera mùa 4 (nâng cấp "dưới chân"); khoảng 37 màn dùng `color()` trước mùa 4 phải dời / sửa |
| Hộp màu ở mùa 1 | 6 màn (che-tay 2, che-tay-xoay 3, robot-hoan-thien 1) | đổi sang thùng gỗ thường hoặc dời |

## Phụ thuộc đã rà (thứ tự mùa không vỡ; số mùa theo bản 7 mùa)
- Drone (mùa 4) dùng hàm của nhện và nam châm cực N (mùa 3).
- Máy sơn (mùa 4) có vài màn dùng `color()`: đặt sau camera trong cùng mùa (hoặc chuyển sang gói bút liền).
- Máy ném (mùa 5) có màn cần omni (cùng mùa, omni đứng trước) và màu (mùa 4).
- Nút đè về mùa 1, bàn xoay về mùa 5, cổng về mùa 6: tách gói Sân cơ khí hiện nay; màn nút đè cho mùa 1 phải viết mới (màn cũ cần hàm có tham số của mùa 2).

## Bố cục chuẩn mỗi mùa (user 26/10: 10 gói; Python rải trong mọi gói)

**Mọi mùa 10 gói · mọi gói 2 chương · mọi chương 10 màn = 200 màn.** Không còn gói Python riêng:
mỗi gói là **chương 1 làm quen** (part hay yếu tố mới, dùng Python đã biết) + **chương 2 "hàm cho …"** (tự viết hàm cho thứ vừa học, dùng Python mới của mùa; màn 10 là trùm, có huy hiệu).
Giống các chương chế lệnh `che-*` hiện nay (che-xe, che-tay, che-xich…): đó chính là "hàm cho part".

| Gói | Chương 1 (10) | Chương 2 (10) |
|---|---|---|
| 1 | Thân gốc | Hàm cho thân · **giới thiệu Python A** |
| 2 | Tay gốc | Hàm cho tay · **giới thiệu Python B** |
| 3 | Cảm biến gốc | Hàm cho cảm biến (cảm biến trả về đúng loại dữ liệu của mùa) |
| 4 | Sân của mùa: vật + sàn + cơ chế | Hàm cho sân |
| 5 | Nâng cấp thân | Hàm cho nâng cấp thân |
| 6 | Nâng cấp tay | Hàm cho nâng cấp tay |
| 7 | Nâng cấp cảm biến | Hàm cho nâng cấp cảm biến |
| 8 | Đội: làm quen | Đội: thử thách |
| 9 | Combo: luật khi hai part của mùa gắn chung (như Bệ súng xích) | Combo: thử thách |
| 10 | Tổng hợp mùa | Trùm mùa |

Yếu tố sân cần một nâng cấp mới dùng được (ô sạc cần Hạ cánh) thì giới thiệu trong gói nâng cấp đó.

**Phim mở gói (user 27/10, mọi mùa):** mỗi gói có một phim ngắn 3–4 khung giới thiệu robot / part / cơ chế mới, chiếu lần đầu vào gói (bộ máy và kịch bản mùa 1: [KE-HOACH-PHIM-GOI.md](KE-HOACH-PHIM-GOI.md)). Kịch bản từng mùa viết cùng lúc lên danh sách màn của mùa đó.

| Mùa | Python A (gói 1) | Python B (gói 2) | Cảm biến trả về (gói 3 → 7) | 1 Thân | 2 Tay | 3 Cảm biến | 4 Sân | 5–7 Nâng cấp | 8 Đội |
|---|---|---|---|---|---|---|---|---|---|
| 1 Kho hàng | `def` | `for` | bool, `if` / `while` | Hai bánh | Tay gắp | Khoảng cách | thùng gỗ, ô đích, nút đè | Bánh lùi · Tay xoay · Cảm biến bên | Hai robot (+10 mới) |
| 2 Nhà máy | biến (đếm) | tham số | số `d = distance()` | Xích | Súng hơi | Hồng ngoại | thùng nặng, băng chuyền, cửa + nút bắn | Đẩy thùng · Lực bắn · Đo nhiệt | mới |
| 3 Bãi tái chế | chuỗi | logic `and` / `or` / `elif` | chuỗi `"N"` / `"S"` | Nhện | Nam châm | Cảm ứng từ | sắt + nam châm, hố, đệm từ | Nhảy · Đảo cực · Đọc cực | Đội xích và nhện |
| 4 Cảng sông | số âm, `abs()` | `%`, `//` | số container → số cân | Cần cẩu | Móc cẩu | Máy quét mã | container có số, bãi container + ô tàu, tàu cập / rời bến | Chạy trên ray · Nhấc đôi · Cân tải | mới (gợi ý: R2 nhện + nam châm mùa 3 trên bãi) |
| 5 Bến sông | `return` | bộ cố định `tuple` (`h, s = flow()`) | hướng chảy → cặp `(hướng, sức_nước)`, gói 7 thêm `min` / `max` | Xuồng chân vịt | Dây phao kéo | Chong chóng dòng chảy | bè nổi, mặt nước & dòng chảy, cống thủy lợi | Thả neo · Buộc dắt theo đuôi · Đo sức nước | mới (gợi ý: R2 cần cẩu trên bờ cẩu bè xuống, R1 xuồng kéo đi) |
| 6 Nông trại | danh sách (`list`) | duyệt `for x in a`, `append` | chuỗi màu → danh sách màu | Drone | Máy sơn | Camera | hộp màu, sàn màu, ô sạc | Hạ cánh sạc · Bút liền · Camera dưới chân | Đội nam châm/xuồng và màu |
| 7 Mỏ đá | lưới 2 chiều (danh sách lồng) | duyệt lưới 2 vòng lặp / tọa độ `(r, c)` | danh sách 4 hướng → hình dạng | Omni | Máy ném | Radar tròn | bóng/đá tròn, sàn dốc, bàn xoay | Đi chéo · Chỉnh lực · Hình dạng | Đội omni và xích/drone |
| 8 Hang động | `dict` | `set` | nốt nghe được `listen()` | Bánh gai | Loa | Âm thanh | chuông đá, sàn đá ướt, ngách hang | Thu gai · Phát nốt · Nghe nốt | mới (Omni + Bánh gai) |

Cột "8 Đội" theo khuôn cũ; khuôn 31/10 (nhánh `claude/part-dung-mua`) dời đội sang gói 9 với R2 lắp part mùa trước.

## Mùa 9 Về CLB (user chốt 31/10, thay bố cục "Lắp ráp · Đua · Phối hợp ×3 · Câu đố tổ hợp · Trùm cuối")

Mùa cuối không có part mới. Mỗi gói **quay lại một nơi cũ giải cứu**, theo thứ tự hành trình, nên cũng là ôn lại Python của mùa đó (gói 1 ôn `def` / `for`, gói 4 ôn số học, gói 5 ôn `tuple`…).

| Gói | Nơi | Chương 1: **chọn đội** (10 màn) | Chương 2: **tự lắp robot** (10 màn) |
|---|---|---|---|
| 1–8 | Kho hàng → Nhà máy → Bãi tái chế → Cảng sông → Bến sông → Nông trại → Mỏ đá → Hang động | Sola và Luna **mỗi bạn chọn một cỗ máy đã có** (hai robot) | Hai bạn **tách ra**: mỗi màn có **1 robot đặt sẵn + 1 robot các bạn tự lắp** từ part đã có |
| 9 | CLB / sân trường (thầy hiệu trưởng) | như trên | như trên |
| 10 | Ngày hội | tập song ca | **bài song ca chúc mừng chiến thắng**, màn trùm cuối game |

- **Song ca ghép dần** (user "ổn"): **màn 10 của mỗi gói giải cứu** kết bằng một **đoạn song ca ngắn** (4–8 nhịp) mang âm thanh của nơi đó; gói 10 ghép các đoạn đã thu thành một bài.
  Sola phát giai điệu, Luna phát bè, dùng loa và `note(n, so_nhip)` của mùa 8, ghi bài bằng danh sách như mùa 6–7. Robot phát nhạc phải mang loa (mọi part đã mở ở mùa 9).
  Bài hát: tự sáng tác hoặc dân ca đã hết bản quyền, không dùng bài thiếu nhi còn bản quyền.
- **Chấm bằng trần nhịp** (user chốt): màn yêu cầu giải trong một số nhịp tối đa (sức ép thời gian), không bắt máy kiểm chứng minh từng cặp cỗ máy / từng tổ hợp part.
  Mỗi màn vẫn cần ít nhất một lời giải mẫu trong trần; trần lấy theo lời giải mẫu tốt nhất cộng một khoảng dư, nên chọn sai đội / lắp sai robot tự thua vì quá giờ.
- **Chọn đội từ đâu**: mỗi màn nên mở 2–3 cỗ máy hợp cảnh thay vì cả tám (8 cỗ máy ghép đôi ra 28 cặp), để trẻ suy nghĩ chứ không chọn mò.
- **Tự lắp robot**: 8 thân × 8 tay × 8 cảm biến; nhiều cặp chưa từng có luật (xuồng gắn máy ném, cần cẩu gắn loa…). Cần bảng cặp được phép trong `part.js`, mỗi màn chỉ cho chọn trong một tập nhỏ. Đây là phần lõi tốn công nhất của mùa 9.
  Bảng ghép 8 × 8 × 8, tổ hợp lai, ai giúp ai ở thử thách nào, đôi tốt / bẫy từng gói: [KE-HOACH-MUA-9-TO-HOP.md](KE-HOACH-MUA-9-TO-HOP.md) (3/11, chờ duyệt).
- **Dùng lại màn cũ**: sáu gói đội dư (bảng dưới) là màn hai robot dùng part cũ, hợp chương 1 chọn đội của gói nơi tương ứng.
- **Python mới (tuỳ chọn, chưa chốt)**: chương 2 tự lắp robot là chỗ hợp để thêm thuật toán nhẹ (sắp xếp, tìm đường); bỏ thì mùa 9 chỉ ôn.
- **Kịch bản phim** `KICH-BAN-PHIM-GOI-CLB.md` mục mùa cuối (bản "thân lai / tay lai", "bảy cỗ máy giữ bảy nơi, người nhờ kẹt ở cửa ngõ") phải viết lại theo bố cục này; có thể giữ cơn bão, đổi thành bão làm từng nơi gặp nạn.

### Gói đội hiện có xếp vào đâu
Mỗi gói đội đứng ở mùa của part **mới nhất** mà nó dùng (đã rà robot của từng gói):

| Gói đội | Part cần | Mùa | Vào |
|---|---|---|---|
| Đội vượt hố và băng chuyền | nhện, hố, băng chuyền | 3 | mùa 9, chương chọn đội |
| Đội xích và nhện | xích, nhện | 3 | **gói 8 mùa 3** |
| Đội tay xoay và nam châm | nam châm, tay xoay | 3 | mùa 9, chương chọn đội |
| Đội màu và súng hơi | màu, súng hơi | 6 | mùa 9, chương chọn đội |
| Đội nam châm và màu | nam châm, màu | 6 | **gói 8 mùa 6** |
| Đội omni và xích | omni, xích | 7 | **gói 8 mùa 7** |
| Đội súng hơi và omni | súng hơi, omni | 7 | mùa 9, chương chọn đội |
| Đội tay gắp và máy ném | máy ném | 7 | mùa 9, chương chọn đội |
| Đội drone và máy ném | drone, máy ném | 7 | mùa 9, chương chọn đội |
| Đội hai robot (10) | hai bánh | 1 | **gói 8 mùa 1** (+10 màn) |

Sáu gói dư (120 màn) vào chương 1 "chọn đội" của các gói giải cứu mùa 9 (gói của nơi hợp với part mới nhất): giữ màn hay nhất, phần còn lại cất khỏi lộ trình (vẫn trong ngân hàng, không mất).
Mùa 2, mùa 4 (Cảng sông), mùa 5 (Bến sông) và mùa 8 (Hang động) viết gói đội mới.

### Tổng
9 mùa × 200 = **1.800 màn** (lộ trình ngày 30/10 có 1.128 màn, gồm mùa 1–4 cũ và mùa 5 ẩn). Mùa nào cũng cùng cỡ, cùng khuôn; khác nhau chỉ ở part và ý Python.
