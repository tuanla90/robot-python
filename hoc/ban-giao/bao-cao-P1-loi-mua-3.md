# Báo cáo P1 mùa 3: lõi mới (đệm từ thật, nhảy / bay miễn đệm, nam châm bụng nhện, xe rơi hố, cảm biến từ là part riêng)

Nhánh `claude/p1-loi-mua-3` (worktree `.claude/worktrees/p1-loi-mua-3`), nền main 0478170 + brief 69c99ef. Không push, không merge. Agent: Fable (29/10).

## 1. KẾT QUẢ

### 1.1 Commit (theo thứ tự)
| SHA | Việc | Nội dung |
|---|---|---|
| 7777cf3 | 1a | Gộp `claude/dem-tu-thu` (4 commit bản thử) vào nhánh: lõi `cfg.demTu`, lời cham.js, hình ô đệm + hoạt cảnh san-ve, `kiem-dem-tu.mjs`. Giải 3 xung đột (cham.js LOAI_VAT giữ chữ "tia nước" của main + thêm 'dem-tu'; cfgSan có cả `demTu` lẫn `damLaThua`; lo-trinh-hoc / kiem-lo-trinh giữ khối MÙA 3 của main). Gói thử "Thử đệm từ" KHÔNG đăng ký lộ trình nữa (xem 1.2). |
| 113374e | 1b | Luật mới: nhện trong nhịp nhảy và drone mọi lúc MIỄN đệm. Chú thích đầu san-hoc.js (phần ĐỆM TỪ) + cham.js; 4 ca mới trong kiem-dem-tu (60/60, bỏ dòng miễn thì 4 ca đỏ). |
| 2720a14 | 2 | Nam châm bụng nhện: lõi (`ncBung()`), cham.js, lap-rap, thẻ bộ phận, hình đĩa nam châm, vật treo dưới thân; `kiem-bung-nhen.mjs` 35/35. |
| 6ba01a5 | 3 | Xe rơi hố: lõi đã có sẵn (brief đoán sai); lời cham.js cho xe; `kiem-xe-roi-ho.mjs` 14/14. |
| 98871a7 | 4 | Cảm biến từ là part riêng 'tu': hình vector riêng, lap-rap, thẻ bộ phận, the-part, VeRobot; `kiem-cam-bien-tu.mjs` 12/12. |
| (commit báo cáo) | 5 | Báo cáo này. |

### 1.2 Luật đã chốt
**Đệm từ** (san-hoc.js phần ĐỆM TỪ, cham.js): giữ nguyên luật bản thử (ô đệm là khối, kéo / đẩy 1 ô mỗi nhịp sau băng chuyền, tầm 2 ô cùng hàng / cột, chắn từ, hai đệm, kéo vào hố thì rơi). MIỄN: (a) drone mọi lúc, kể cả `wait()` lơ lửng; (b) nhện trong NHỊP NHẢY = nhịp ghi sự kiện `nhay` (bật qua một ô, kể cả bay qua hố rồi đáp) hoặc `nhay-hut` (bật lên rơi lại ô cũ). Nhịp chuẩn bị (nhịp 1 của bước, chân bật duỗi, nhện còn ở ô cũ) và mọi nhịp đi bộ / đứng chờ thì nhện bị đệm như xe (không nam châm: bị hút như sắt; có nam châm bụng bật: theo cực). Cài đặt: `demTuKeo()` bỏ qua khi `sk` của nhịp có `nhay` / `nhay-hut` (san-hoc.js ~1831).
- Hệ quả đã thấy bằng mắt: nhện nhảy đáp đúng ô dưới đệm thì nhịp nhảy không bị kéo, nhưng NHỊP KẾ TIẾP (wait hay chuẩn bị bước) đứng trên mặt đất trong tầm thì bị hút. Xem CÂU HỎI 2.1.

**Gói thử "Thử đệm từ"**: giữ tệp `hoc/man-dem-tu-thu.js` làm KHO MÀN MẪU (`ManHoc.manDemTuThu`, 6 màn), không đăng ký `chuongCoChe`, bỏ thẻ script choi.html. Lý do: main đã có khối MÙA 3 (10 gói) ở lo-trinh-hoc.js; gói thử chèn sau tham-so sẽ bị khối đó đẩy ra ĐẦU MÙA 4 ẩn và nâng ngưỡng Sân cơ khí lên 30 sao trong khi gói thử chỉ có 18 sao (kiem-lo-trinh đỏ: `ban-xoay.1 can 30 co 18`). Sửa được bằng một khối riêng trong lo-trinh-hoc.js nhưng vùng đó phiên "Kế hoạch mùa 2" đang sửa; không đáng. `kiem-dem-tu.mjs` phần B chấm thẳng 6 màn mẫu với kho hàm sau chương tham-so (lời giải 3 sao, lời sai không thắng, mã mẫu màn 1 thắng). P2 gói 4 Bãi từ lấy lại sân / lời giải từ tệp này rồi xoá nó.

**Nam châm bụng nhện** (san-hoc.js phần NAM CHÂM, mục "NAM CHÂM BỤNG NHỆN"):
- Nhện + `magnet_n / magnet_s / magnet_off` trong hamGoc = nam châm treo dưới bụng (bỏ lỗi "Nhện không gắn nam châm"); vẫn một tay (không đi chung kẹp), vẫn không cảm biến từ / khoảng cách.
- Dùng chung luật treo của drone qua `ncBung() = laDrone || (nhện && coNamCham)`: hút / thả ở Ô NGAY DƯỚI nhện (soO 0), cực nào cũng hút sắt, vật nam châm khác cực hút, cùng cực nằm yên (`cung-cuc`), gỗ `hut-go`.
- Nhịp: lệnh nam châm chỉ ra lệnh, làm việc ở nhịp `wait()` hay nhịp ĐẦU (chuẩn bị) của bước go_*; hút ở CUỐI nhịp (sau bước / nhảy / đệm dời). `quen-wait` / `magnet-goi-lai` như cũ (lời quen-wait của nhện gọi là "lệnh tay").
- Nhện gắn nam châm bụng ĐỨNG TRÙM lên vật nằm đất được (đi vào, nhảy đáp lên ô có vật), kể cả khi nam châm tắt; nhện KHÔNG nam châm vẫn bị vật chắn như cũ (0 màn cũ đổi kết quả).
- Vật dính đi theo khi đi bộ, khi nhảy (kể cả qua hố), khi bị băng / đệm dời. `magnet_off()` thả xuống ô ngay dưới (`oThaChan`: có vật khác / thùng / hố / gầm / đệm thì `tha-bi-chan`, vật vẫn dính). Nhện không bao giờ đứng trên hố nên không có "thả trên hố"; nhện rơi hố khi đang mang thì chương trình dừng, vật coi như rơi theo (vết cuối vẫn `cam`).
- Đệm từ: nhện bật nam châm bụng bị hút / đẩy theo cực như xe; đang nhảy thì miễn.
- Lời cham.js: `tha-bi-chan` / `hut-go` nói "ô ngay dưới nhện", "đi sang ô khác rồi thả".
- Hình: thân nhện khai `tayDuoi: ['nam-cham']` + `oTayDuoi {50, 42}` (KHÔNG phải ổ trong `oGan`, để cảm biến không gắn được "ổ duoi" và bảng luật ghép cũ y nguyên); tay nam châm vẽ nhánh `s.duoi && s.than === 'nhen'`: ĐĨA tròn (đế trắng, vành bạc, lõi N đỏ / S xanh dương / chưa cực: nửa xanh nửa đỏ, đèn giữa) đè lên vỏ phía đuôi dưới dải mắt, vòng gợn khi bật; thân nhện và tay kẹp y nguyên (phanh 13a-v xanh). san-ve `veDuoiNhen`: gợn từ ở mặt ô + vật treo vẽ dưới thân, thân hơi trong khi đang mang; nhện với nam châm bụng luôn hướng 0 (ve-robot). Lap-rap: nhện + nam châm ghép được (36 → 40 cách ở màn lớn), thẻ bộ phận Nam châm có lưu ý riêng cho thân nhện.

**Xe rơi hố**: brief viết "hố hiện chỉ có nghĩa với nhện" là SAI: lõi `chay()` đã cho MỌI thân trừ drone rơi khi đứng trên ô `u` cuối nhịp (san-hoc.js ~2047), `lyDoChan` không chặn ô `u`, và 36 màn cũ (đội xích + nhện, đội hố băng, đội nam châm, đội tay xoay, đọ sức) đã có hố + xe. Đã làm: chú thích rõ trong san-hoc.js; cham.js lời `roi-ho` theo loại robot: xe → "xe rơi xuống hố ở ô (x, y) ... Bánh xe lăn vào ô hố là rơi, xe không nhảy qua hố được: đi đường khác tránh ô hố (màn đội: hay để nhện trong đội nhảy qua)"; bị băng chuyền đẩy vào hố thì nói thêm "(băng chuyền đẩy xe vào ô hố)"; đệm kéo vào hố giữ lời `dem-roi-ho`; nhện giữ lời cũ. Hoạt cảnh rơi dùng chung (`v.roi`: nhỏ dần, xoay, mờ, bụi, dấu "!"), đã xem bằng mắt với xe hai bánh bị đệm hút vào hố. Kết quả 36 màn cũ không đổi (máy kiểm đội xanh).

**Cảm biến từ là part riêng** ('tu'): VeVector cam-bien `tu` (ve-vector-cam.js) hamGoc `front_metal / front_pole`, gắn hong / hongTrai / hongPhai, hình: vỏ con nhộng ngắn + đầu dò chữ U nhỏ hai nhánh N đỏ / S xanh dương mở về phía trước, ba vạch sóng khi đọc. lap-rap `tu` = part `tu`, chỉ hai hàm (không còn kèm front_clear / left_clear / right_clear), giá giữ 2 (rap-du.9 cách mẫu 'tu' không dùng front_clear nên kết quả cũ y nguyên). the-part vẽ part `tu`; thẻ bộ phận tên "Cảm biến từ", mô tả "Đầu dò chữ U ở hông xe, cho biết vật phía trước là sắt hay nam châm cực N, cực S". VeRobot: màn khai `robot.camBien [{ ma: 'tu', o: 'hong' }]` vẽ part tu; màn có front_metal / front_pole mà không khai cảm biến hông nào thì tự lắp tu; 51 màn cũ (đều khai khoang-cach) hình y nguyên. Lõi SanHoc không đổi (chỉ nhìn hamGoc; chú thích ghi rõ part riêng). Màn mùa 3 (P2 gói 3) khai: `robot: { than, tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] }` + hamGoc có front_metal / front_pole (thêm khoang-cach nếu cần front_clear).

### 1.3 Tệp đổi
- Lõi: `hoc/san-hoc.js` (ĐỆM TỪ miễn nhảy / bay; NAM CHÂM BỤNG NHỆN; chú thích hố / cảm biến từ), `hoc/cham.js` (LOAI_VAT 'dem-tu'; lời nhện bụng; lời xe rơi hố; chú thích).
- Hình: `hoc/game/ve-vector.js` (oTay / dichTay đọc `tayDuoi` + `oTayDuoi`), `ve-vector-than-nhen.js` (khai oTayDuoi, hình y nguyên), `ve-vector-tay-nam-cham.js` (đĩa nhện), `ve-vector-cam.js` (part tu), `ve-vector-o2.js` (ô đệm, từ bản thử), `ve-robot.js` (nhện nam châm hướng 0; lắp tu), `san-ve.js` (veDuoiNhen, veTuTreo dùng chung, đệm / vệt sóng từ bản thử, chú thích rơi hố), `the-part.js`, `man-choi.js` (demTu, từ bản thử).
- Dữ liệu / thẻ: `hoc/lap-rap.js`, `hoc/gioi-thieu-part.js`, `hoc/man-dem-tu-thu.js` (kho mẫu), `hoc/game/choi.html` (gộp rồi bỏ thẻ script gói thử: không đổi so với main).
- Máy kiểm: mới `kiem-dem-tu.mjs` (từ bản thử, sửa), `kiem-bung-nhen.mjs`, `kiem-xe-roi-ho.mjs`, `kiem-cam-bien-tu.mjs`; sửa `kiem-drone.mjs`, `kiem-nam-cham.mjs`, `kiem-lap-rap.mjs`, `kiem-ve-vector.mjs` (một dòng: part thêm sau chụp), `kiem-lo-trinh.mjs` (xung đột gộp, về như main).
- KHÔNG đụng: `nhan/`, dữ liệu màn mùa 1 / 2, khối MÙA 1 / 2 / đặt tên của lo-trinh-hoc.js (chỉ gỡ 'dem-tu-thu' khỏi danh sách require mà bản thử thêm vào), thu-tu-chuong.js, chu.js, bang-mau.js (không cần vai mới).

### 1.4 Lệnh kiểm và kết quả (chạy tuần tự, lần cuối sau commit 98871a7)
```
node hoc/kiem-dem-tu.mjs            Đạt 60 / 60        --loi-gia: HỎNG 2 / 60
node hoc/kiem-bung-nhen.mjs         Đạt 35 / 35        --loi-gia: HỎNG 2 / 35 (bỏ ncBung() trong lõi: HỎNG 9)
node hoc/kiem-xe-roi-ho.mjs         Đạt 14 / 14        --loi-gia: HỎNG 1 / 14
node hoc/kiem-cam-bien-tu.mjs       Đạt 12 / 12        --loi-gia: HỎNG 1 / 12
node hoc/kiem-nhen.mjs              ĐẠT 153 · HỎNG 0
node hoc/kiem-che-nhen.mjs          ĐẠT 129 · HỎNG 0
node hoc/kiem-nam-cham.mjs          ĐẠT 246 · HỎNG 0
node hoc/kiem-che-nam-cham.mjs      ĐẠT 227 · HỎNG 0
node hoc/kiem-drone.mjs             ĐẠT 196 · HỎNG 0
node hoc/kiem-che-drone.mjs         ĐẠT 233 · HỎNG 0
node hoc/kiem-bang-chuyen.mjs       ĐẠT 87 · HỎNG 0
node hoc/kiem-lap-rap.mjs           ĐẠT 127 · HỎNG 0
node hoc/kiem-lap-rap-sao.mjs       ĐẠT 512 · HỎNG 0
node hoc/kiem-rap-du.mjs            ĐẠT 160 · HỎNG 0
node hoc/kiem-gioi-thieu-part.mjs   ĐẠT 1280 · HỎNG 0
node hoc/kiem-doi-xich.mjs          ĐẠT 69 · HỎNG 0
node hoc/kiem-doi-ho-bang.mjs       ĐẠT 60 · HỎNG 0
node hoc/kiem-hai-robot-man.mjs     ĐẠT 105 · HỎNG 0
node hoc/kiem-doi-nam-cham.mjs      ĐẠT 100 · HỎNG 0
node hoc/kiem-doi-tay-xoay.mjs      ĐẠT 92 · HỎNG 0
node hoc/kiem-doi-thu-manh.mjs      ĐẠT 16
node hoc/kiem-ve-vector.mjs         ĐẠT 101 · HỎNG 0 kiểm (phanh 13a-v xanh so NEN_VEC 013ec5d: KHÔNG dời nền)
node hoc/kiem-hoc.mjs               ĐẠT 6715 · HỎNG 0
(đợt cuối, xem phụ lục A bên dưới: kiem-lo-trinh, kiem-loi-mua-2, kiem-bang-mau, kiem-nut-bat-san, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau-phim-vector, nhan/kiem-core-san-robot)
```
Không có máy kiểm nào đỏ sẵn ở main trong số đã chạy. Không chạy `npm test` cả bộ.

Xem bằng mắt (server cổng 4197, đã tắt; màn thử tạm `hoc/man-thu-p1.js` nạp qua console, KHÔNG commit, đã xoá): nhện nam châm bụng hút sắt ở ô vừa bước lên, mang theo khi nhảy qua hố, thả vào đích, thắng 3 sao; đĩa nam châm N đỏ / S xanh / tắt tối, vòng gợn khi bật, không đè dải mắt; xe bị đệm S hút lên ô hố rồi rơi (hoạt cảnh nhỏ dần + dấu "!", lời dem-roi-ho); nhện nhảy đáp dưới đệm không bị kéo ở nhịp nhảy; cảm biến từ ở hông: chữ U nhỏ hai nhánh đỏ / xanh, sóng khi đọc.

### 1.5 Việc dở
Không. Năm việc đều có commit. Chưa làm (ngoài phạm vi): màn thật mùa 3 (P2), đổi tên gói trong lo-trinh-hoc.js (phiên khác), nam châm điện (chỉ đề xuất, mục 3).

## 2. CÂU HỎI CẦN LÀM RÕ
1. **Miễn đệm khi nhảy: chỉ nhịp nhảy hay cả nhịp đáp xong?** Đã làm theo brief: chỉ nhịp ghi `nhay` / `nhay-hut`. Nhện nhảy đáp đúng ô dưới đệm (cách 2) thì nhịp đó không bị kéo, nhưng nhịp kế (wait hay nhịp chuẩn bị của bước sau) đứng trên đất trong tầm lại bị hút. Người chơi có thể thấy "vừa nhảy xong là bị kéo". Cách khác: miễn thêm nhịp ngay sau khi đáp (cho nhện "lấy đà"), hoặc để P2 thiết kế màn không đặt ô đáp trong tầm đệm. Cần user chốt; sửa là một dòng ở `demTuKeo()`.
2. **Gói thử "Thử đệm từ"** không còn trong lộ trình (lý do 1.2). Nếu user vẫn muốn chơi thử trước khi P2 có màn: cần một khối nhỏ trong lo-trinh-hoc.js (sau khối MÙA 3) hạ ngưỡng Sân cơ khí; tôi không đụng vì vùng đó phiên khác đang sửa.
3. **Brief sai ở việc 3**: lõi đã cho xe rơi hố từ trước (36 màn cũ dùng). Việc 3 thu lại thành lời chẩn đoán + máy kiểm; không có màn nào đổi kết quả nên không dừng hỏi.
4. **Lắp ráp: 'tu' không còn kèm khoảng cách.** Trước đây chọn "Cảm biến từ" trong xưởng lắp ráp được cả front_clear / left_clear / right_clear (giá 2); nay chỉ front_metal / front_pole (giá vẫn 2). Màn rap cũ không đổi kết quả (rap-du.9 cách mẫu không dùng front_clear). Nếu muốn robot lắp ráp vừa đo khoảng cách vừa đo từ thì cần cho khe cảm biến nhận hai part (lap-rap hiện một khe) hoặc giá 'tu' hạ xuống 1 vì mất tính năng. Cần user chốt giá / khe.
5. **Thẻ bộ phận Nam châm trên thân nhện** vẫn mở đầu bằng "Nam châm chữ U trước mũi xe" (moTa chung), chỉ phần lưu ý nói "trên nhện, treo dưới bụng" (drone cũng vậy từ trước). Muốn moTa đổi theo thân thì gioi-thieu-part.js cần moTa theo `than`; chưa làm vì ngoài mục tiêu.
6. **Đệm từ với vật / thùng** vẫn như bản thử: không bị đệm tác động. Nhện mang vật sắt đứng cạnh đệm: nhện bị đệm theo nam châm của nhện (không xét vật đang mang). Chốt khi làm gói 4.
7. Brief đúng ở các chỗ còn lại; không thấy việc thừa.

## 3. ĐỀ XUẤT cần user quyết

### 3.1 Nam châm điện (chưa làm, chỉ đề xuất)
Cơ chế thật hiện có để ghép: vật nam châm có cực (`cfg.vat chat 'nam-cham', cuc`), nút đè `M` (san-hoc.js phần nút đè: `capNhatCua`, sự kiện `nut-de`), cửa nhịp (`cuaNhip`), đệm từ (`san.demTu`, `demTuKeo()` san-hoc.js ~1828), hút / đẩy theo cực (`hutVat`, ~1790). KE-HOACH-7-MUA ghi vật mùa 3 là "sắt + nam châm (nam châm điện)", gói 4 "Bãi từ".

| | A. Đệm từ có công tắc (nút đè) | B. Đệm từ theo nhịp | C. Vật nam châm điện trên sân (bật khi robot chạm / kẹp) | Để nguyên (chỉ đệm từ thường) |
|---|---|---|---|---|
| Làm gì | `demTu[i].nut = {x, y}`: đệm chỉ "có điện" khi nút đè M ở ô đó đang bị đè (robot / vật / thùng); không đè thì đệm là sàn trơn, đi qua được | `demTu[i].chuKy = n`: đệm bật n nhịp, tắt n nhịp (như cửa nhịp); tắt thì không hút / đẩy nhưng vẫn là khối | Vật mới chất `'dien'`: thường là sắt; khi robot đang dính nó và bật cực X thì nó thành nam châm cực X, đẩy / hút vật khác theo luật cực; thả ra là hết từ | Không thêm gì; gói 4 dùng đệm N / S + nam châm xe |
| Mất bao lâu | 0,5 ngày lõi + lời + hình nút nối đệm (dây nối như nút ↔ cửa đã có `noi`) + máy kiểm | 0,5 ngày (tái dùng cuaNhip) | 1 ngày (vật đổi chất giữa chừng, hình vật đổi màu, chẩn đoán) | 0 |
| Ảnh hưởng | san-hoc.js (demTuKeo, lyDoChan), san-ve (đệm tắt vẽ xám, dây nối), cham.js lời; màn cũ không đổi (cờ mới) | san-hoc.js demTuKeo + bộ đếm nhịp, san-ve nhấp nháy; màn cũ không đổi | san-hoc.js hutVat / dayVat (vật mang theo cực), ve-vector-vat, cham.js | không |
| Người chơi thấy khác gì | Đứng lên nút (hay đặt vật lên nút) thì đệm sáng và hút / đẩy; rời nút thì đệm tối, xe đi qua ô đệm được. Dạy if / while với cảm biến từ: "đợi đệm tắt rồi đi" | Đệm nhấp nháy theo nhịp, phải đếm nhịp để đi qua lúc tắt (như cửa nhịp) | Robot "nạp điện" cho cục sắt thành nam châm rồi dùng nó đẩy vật khác / bị đệm đẩy; logic hai tầng | Chỉ có N / S cố định |
| Lợi | Đúng chữ "nam châm điện" (bật tắt bằng điện), tái dùng nút đè + dây nối đã có hình; phối đệm + hố: nút tắt đệm thì xe không bị kéo vào hố | Rẻ nhất, dạy đếm nhịp | Sâu nhất, kết hợp nam châm bụng nhện (nhện mang cục nam châm điện) | không tốn |
| Rủi ro | Thêm trạng thái vào ô đệm (đang là khối cố định): `lyDoChan` tĩnh không biết trạng thái nút, phải tách như cửa đóng (`cuaDong`); bộ dò BFS mùa 3 (nếu có) phải biết | Trùng ý cửa nhịp, ít mới | Đổi luật vật (chất đổi giữa chừng) dễ vỡ màn cũ dùng vật sắt, chẩn đoán phức tạp | Gói 4 nghèo cơ chế, "nam châm điện" trong kế hoạch không có thật |

Nghiêng về **A** (ưu tiên 1), rồi B làm "độ khó thêm" ở chương 2 của gói 4 nếu cần; C để mùa sau. Phối với đệm + hố ở A: màn mẫu "đệm S hút xe vào hố; đặt vật sắt lên nút để tắt đệm rồi đi qua", hoặc ngược lại "đè nút để đệm bật, hút vật sắt qua hố về phía robot" (nếu mở rộng đệm tác động lên vật, xem 2.6).

### 3.2 Miễn đệm sau khi đáp (câu hỏi 2.1)
| | Chỉ nhịp nhảy (đang làm) | Nhịp nhảy + nhịp ngay sau khi đáp | Để nguyên bản thử (nhảy cũng bị) |
|---|---|---|---|
| Làm gì | như hiện tại | thêm cờ `vuaDap` một nhịp | bỏ dòng miễn |
| Mất bao lâu | 0 | 20 phút + 2 ca kiểm | 10 phút |
| Người chơi thấy | nhảy qua đệm an toàn, đáp xong đứng im là bị kéo | đáp xong còn một nhịp "lấy đà" để bước tiếp | nhện nhảy vào tầm là bị kéo ngay |
| Lợi / rủi ro | đúng chữ user; có thể gây "vừa nhảy xong bị kéo" khó hiểu | dễ chịu hơn, nhưng luật khó nói ("miễn hai nhịp") | đơn giản nhất nhưng ngược ý user |
Nghiêng về giữ hiện tại và để P2 tránh đặt ô đáp trong tầm đệm ở màn dễ.

### 3.3 Giá / khe part cảm biến từ trong lắp ráp (câu hỏi 2.4)
| | Giữ 2 xu, chỉ từ (đang làm) | Hạ 1 xu | Khe cảm biến nhận 2 part |
|---|---|---|---|
| Ảnh hưởng | không màn rap đổi | kiem-lap-rap-sao có thể đổi số cách / sao vài màn rap-du | lap-rap.js đổi cấu trúc khe, nhiều máy kiểm |
| Nghiêng | giữ, chờ P2 gói 3 xem màn lắp ráp mùa 3 cần gì | | |

## 4. PHẦN CHO NGƯỜI KINH DOANH
Mùa 3 có bốn thứ mới mà màn chơi sắp tới cần, nay đã nằm trong máy và được kiểm tự động. Thứ nhất, các ô "đệm từ" trên sân hút hoặc đẩy robot như nam châm thật; robot nhảy hay bay qua thì không bị kéo, đúng như anh đã chốt sau khi chơi thử. Thứ hai, con nhện có thể đeo nam châm dưới bụng để nhặt đồ sắt, mang theo cả khi nhảy qua hố rồi thả xuống đích; hình nhện vẫn như cũ, chỉ thêm một đĩa nam châm nhỏ. Thứ ba, xe lăn vào hố thì rơi và trò chơi nói rõ bằng tiếng Việt vì sao; hoá ra máy đã làm được từ trước, chúng tôi chỉ thêm lời giải thích cho xe. Thứ tư, "cảm biến từ" nay là một bộ phận riêng có hình riêng và thẻ giới thiệu riêng, để bán thành gói 3 của mùa 3. Gói chơi thử đệm từ được giữ làm kho mẫu cho đội làm màn, không bày ra cho người chơi. Mọi màn cũ của mùa 1 và 2 vẫn cho kết quả như trước. Còn một ý tưởng "nam châm điện" chưa làm, có bảng ba phương án để anh chọn.

## 5. RỦI RO CÒN LẠI và cách kiểm
1. **`npm test` cả bộ chưa chạy** (máy yếu). Đã chạy từng máy liên quan (mục 1.4). Người giao chạy cả bộ sau khi gộp; nếu đỏ máy nào ngoài danh sách 1.4, so với main trước.
2. **Hình nhện + nam châm bụng chưa có trong dữ liệu chụp / phanh 13a-v** (chưa màn nào dùng): phanh chỉ bảo vệ hình cũ. Khi P2 có màn gói 9, chạy kiem-ve-vector và dời NEN_VEC theo quy trình. `kiem-bung-nhen.mjs` phần C so hình khác nhau theo cực / bật, không so pixel.
3. **Lắp ráp 'tu' bớt lệnh** (2.4): nếu có màn rap nào ngoài rap-du.9 cho chọn 'tu' sau này, cách mẫu dùng front_clear với 'tu' sẽ hỏng; kiem-lap-rap-sao / kiem-rap-du sẽ bắt.
4. **Nhện nam châm đứng trùm lên vật** là luật mới chỉ cho nhện có nam châm; bộ dò đường của kiem-hoc (BFS) cho nhện chưa biết luật này. Màn gói 9 (P2) cần máy kiểm riêng hoặc mở rộng bộ dò; `kiem-bung-nhen.mjs` chỉ chấm lõi.
5. **Hoạt cảnh xe rơi hố** dùng chung với nhện (nhỏ dần, xoay): hợp lý với xe; bánh xe vẫn "quay" lúc rơi vì cờ bánh không tắt; nhỏ, chỉ nhìn thấy trong 0,9 s. Sửa nếu user thấy xấu (san-ve.js nhánh `roi-ho`).
6. **Gộp vào main**: hai nhánh khác đang sửa lo-trinh-hoc.js / chu.js / thu-tu-chuong.js; nhánh này chỉ đổi dòng require của lo-trinh-hoc.js (bỏ 'dem-tu-thu' bản thử thêm), không đụng chu.js / thu-tu-chuong.js, nên xung đột ít.

## Phụ lục A. Đợt kiểm cuối (sau commit 98871a7, chạy tuần tự, nguyên văn dòng cuối)
```
== kiem-lo-trinh: ĐẠT 905 kiểm tra lộ trình xuất bản.
== kiem-loi-mua-2: ĐẠT 93 kiểm
== kiem-bang-mau: ĐẠT 16 · HỎNG 0 kiểm
== kiem-nut-bat-san: ĐẠT 30 kiểm
== kiem-dem-tu: Đạt 60 / 60
== kiem-bung-nhen: Đạt 35 / 35
== kiem-xe-roi-ho: Đạt 14 / 14
== kiem-cam-bien-tu: Đạt 12 / 12
== kiem-drone: ĐẠT 196 · HỎNG 0
== kiem-che-drone: ĐẠT 233 · HỎNG 0
== kiem-bang-chuyen: ĐẠT 87 · HỎNG 0
== kiem-doi-xich: ĐẠT 69 · HỎNG 0
== kiem-huy-hieu-phim-vector: ĐẠT 12 · HỎNG 0 kiểm   (A3-v / B5-v xanh so NEN_VEC 013ec5d)
== kiem-nut-mo-dau-phim-vector: ĐẠT 12 · HỎNG 0 kiểm   (C3-v xanh)
== kiem-hoc: ĐẠT 6715 · HỎNG 0
== nhan/kiem-core-san-robot: ĐẠT 75 · HỎNG 0
```
