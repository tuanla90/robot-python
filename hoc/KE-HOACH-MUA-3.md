# Kế hoạch mùa 3 theo khuôn 10 gói (29/10/2026, ĐÃ DUYỆT: user "cbi làm tiếp mùa 3" sau khi gộp mùa 2)

Tên mùa: trong code đang là "Công cụ" (thu-tu-chuong.js); bản nháp ghi "Tín hiệu". Giữ "Công cụ" tới khi mở mùa, user chốt tên lúc đó.

Khuôn: [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md). Bảng mùa 3: thân **Nhện → nhảy** · tay **Nam châm (một cực) → đảo cực** · cảm biến **Cảm ứng từ: sắt → đọc cực** ·
vật **sắt + nam châm điện** · sàn **hố** · cơ chế **đệm từ** · Python A **chuỗi**, Python B **logic `and` / `or` / `elif`**. Mùa 3 được dùng mọi thứ mùa 1, 2.
Luật học (mọi gói): đường cong mượt + recall (memory `duong-cong-hoc-va-recall`), **show don't tell** (memory `show-dont-tell-khoi-moi`, user 29/10):
mỗi khối / part / cơ chế mới mở bằng **màn trình diễn** (mã mẫu đã đúng, bấm Chạy là thắng), màn sau **ép dùng khối mới** (bộ dò chứng minh lời không dùng khối mới không 3 sao).

## 1. Rà màn có sẵn (đo bằng script trên main 29/10)

| Chương có sẵn (mùa 3 ẩn) | Robot | Dùng gì | Vướng |
|---|---|---|---|
| `nhen` 10 | nhện | go_* 4 hướng; crouch / stand ở .2 .3 .5 .6 .9 .10; chuỗi ở .4–.7, .10 | `elif` ở .4, .7 (không vướng: `elif` đã dạy ở mùa 1, xem dưới); bậc `S` ở .8 |
| `che-nhen` 10 | nhện | crouch ở 9 / 10 màn; chuỗi cả 10 (walk("RRD"), jump(d), leap(path)) | bậc `S` ở .6 |
| `nam-cham` 10 | xe, omni | magnet_n hầu hết; magnet_s ở .2 .3 .6; front_pole ở .6 | omni ở .9 (mùa 5); color() ở .10 (mùa 4) |
| `che-nam-cham` 10 | xe | chế kick / reel / grip / lane / sort; magnet_s ở .6 .7; front_pole ở .5 .7 .10 | |
| `doi-xich` 10 + `che-doi-xich` 10 | xích + nhện | chuỗi cả 20; crouch nhiều | bậc `S` ở 16 / 20 màn, climb() của che-xich |
| `che-xich` 5 (dời từ mùa 2) | xích | climb / descend | bậc `S` cả 5: cất |
| `doi-ho-bang`, `doi-tay-xoay`, `doi-nam-cham`, … | | | ngoài khuôn mùa 3: để mùa 7 Phối hợp (KE-HOACH-7-MUA) |

Lõi đã có: nhện go_* + crouch / stand + nhảy hố + gầm `n`; nam châm magnet_n / magnet_s / magnet_off; **cảm ứng từ đã có sẵn hai hàm**: `front_metal()` (True / False: sắt) và `front_pole()` ("N" / "S" / "none"), khớp đúng "sắt → đọc cực".
Lõi CHƯA có: tách nam châm một cực (gốc chỉ magnet_n) / mở magnet_s ở nâng cấp; tách cảm ứng từ thành part riêng; **đệm từ**; **nam châm điện** (vật); **màn trình diễn**; xe rơi hố (hố hiện chỉ cho nhện).
**Luật cấm hiện có: nhện KHÔNG gắn nam châm** (san-hoc.js 739: nhện không có hướng mặt). Vướng gói 9 Combo (mục 4).

Đo lại 29/10 (sau gộp mùa 2): `elif` ĐÃ có ở mùa 1 (me-cung.3–6, .9, cam-bien-ben.8, .10); chuỗi làm đối số (`shoot("fast")`) đã có ở mùa 2 (luc-ban).
Nên cái MỚI của mùa 3: Python B = `and` / `or` (elif là recall); Python A = chuỗi làm DỮ LIỆU (biến chuỗi, `for c in path`, so `pole == "N"`, `walk("RRD")`).

## 2. Mười gói (có / mới ước)

| Gói | Chương 1 | Chương 2 | Có / mới |
|---|---|---|---|
| 1 Nhện | đi 4 hướng không quay: nhen.1, .8 (`S` → sàn) + mới | **Chuỗi cho nhện**: walk("RRD"), `for c in path`, nhen.4, .7 + mới | 4 / 16 |
| 2 Nam châm | một cực N: nam-cham.1, .4, .5, .7, .8 + mới | **Logic cho nam châm** (`and` / `or` / `elif` với front_clear / left_clear…): che-nam-cham.1–4, .8, .9 + mới | 11 / 9 |
| 3 Cảm biến từ (user 29/10, trước: Cảm ứng từ; theo tên thẻ part) | `front_metal()` sắt hay không | chế lệnh dò sắt (`if front_metal() and …`) | 0 / 20 |
| 4 Bãi từ | sắt + nam châm điện, hố, đệm từ | hàm cho sân | 0 / 20 |
| 5 Nhảy | crouch / stand, gầm, hố: nhen.2, .3, .5, .6, .9, .10 | che-nhen 10 (.6 bỏ `S`) | 16 / 4 |
| 6 Đảo cực | magnet_s: nam-cham.2, .3 + mới | che-nam-cham.6, .7 + mới | 4 / 16 |
| 7 Đọc cực | `front_pole()` chuỗi "N" / "S": nam-cham.6, .10 (bỏ color) + mới | che-nam-cham.5, .10 + mới (`elif pole == "S"`) | 4 / 16 |
| 8 Đội xích và nhện | doi-xich (dựng lại 8 màn `S`) | che-doi-xich (dựng lại 8 màn `S`) | ~4 / ~16 |
| 9 Combo (chờ chốt, mục 4) | | | 0 / 20 |
| 10 Tổng hợp + trùm (tên mốc truyện) | | | 0 / 20 |
| | | **Tổng** | **~43 / ~157** |

## 3. Thứ tự giao (như mùa 2, mỗi lúc một agent; agent cấm `npm test` cả bộ)
0. Gói T (màn trình diễn mùa 2) chờ main có cờ `chiChay` (HD1); nó không đụng khối mùa 3 nên P0 đi trước, T làm khi HD1 vào main.
   Bản thử đệm từ (nhánh claude/dem-tu-thu) chưa gộp: P0 không đụng; lõi đệm từ thật làm ở P1 (theo phản hồi user khi chơi thử), màn ở gói 4.
1. **P0 · Khung mùa 3** (opus): mảng `MUA_3` trong lo-trinh-hoc.js bằng màn có sẵn + sửa vướng nhỏ (`elif`, `S`, omni, color), chương ngoài khuôn ra mùa ẩn sau, tệp ngân hàng rỗng + đăng ký cho mọi chương mới; máy kiểm lộ trình mục mùa 3 (chuỗi chỉ từ gói 1 chương 2, logic chỉ từ gói 2 chương 2, part đúng mùa).
2. **P1 · Lõi mới** (fable: đụng san-hoc.js / cham.js chung; cờ màn trình diễn đã có từ gói T): nam châm bụng nhện, nam châm một cực / đảo cực, part cảm ứng từ, đệm từ, nam châm điện, (combo theo mục 4); hình vector part mới; máy kiểm lõi có lỗi giả.
3. **P2 · Màn** theo gói 1 → 10 (opus, mỗi gói một agent), rồi phim mùa 3, rồi soát 200 / 200 trong trình duyệt và mở mùa 3.

## 4. Câu hỏi user (29/10)
1. **Combo gói 9: CHỐT nam châm bụng nhện** (user 29/10): nhện hút / thả vật sắt ở ô ngay dưới, mang theo khi đi và khi nhảy hố. Luật lõi mới ở P1 (ổ `duoi`, như ý drone gắp ở KE-HOACH-7-MUA "Ý tưởng gói sau").
2. **Đệm từ**: user hỏi lại "nếu trừ lúc nhảy thì khác gì hố ver2?". Người giao đề xuất (chờ user gật): đệm KHÔNG có ngoại lệ nhảy; đệm khác hố ở chỗ nó **dời** robot (kéo / đẩy 1 ô mỗi nhịp dọc hàng / cột) chứ không chặn hay làm rơi,
   và người chơi **chọn chiều** bằng cực nam châm của mình (khác cực: bị hút về đệm; cùng cực: bị đẩy ra xa; không bật: bị hút như sắt). Đệm là công cụ (đẩy mình qua hàng rào chỗ khó đi, kéo về đúng làn), không phải chướng ngại.
   Nhện không có nam châm bụng (gói 1–8): bị hút như sắt; có nam châm bụng (gói 9): chọn hút / đẩy như xe. Drone mùa 4 bay qua: không bị hút (chốt ở mùa 4).
   **29/10 USER CHỐT ĐỆM TỪ** (qua phiên vector): "cho tôi nhảy và bay k bị hút" = nhện ĐANG NHẢY và drone ĐANG BAY thì đệm không tác động; mặt đất như bản thử claude/dem-tu-thu
   (P1 gộp lõi đó). "Nhện đáp xuống thì lượt sau bị hút" = đáp xuống trong vùng đệm thì nhịp kế tiếp mới bị hút / đẩy.
   **Nam châm điện = đệm từ có công tắc NÚT ĐÈ** (phương án A, user: "A sẽ làm game có chiều sâu hơn"): đè nút thì đệm có điện, rời nút thì đệm tắt.
   **Đệm tương tác với vật kim loại**: đệm hút / đẩy cả vật sắt và vật nam châm (không chỉ robot). Hai việc này giao ở P1b (phiên vector), sau gói giật một ô.
   **Vật sắt đang bị đệm có điện hút thì robot KHÔNG nhấc / hút được** (user: "đệm từ hút khối sắt thì ko nâng, ko hút được. phải tắt đi thì vật mới nâng lên đc"):
   phải tắt đệm (rời nút đè) rồi mới nhấc được. Vào P1b.
   Cảm biến từ: user chưa chơi thật, chưa nhận xét.
3. Gói 3 trả về gì: bảng "Cảm biến trả về (gói 3)" ghi chuỗi "N" / "S", còn bảng part ghi gốc "sắt" rồi mới "đọc cực". Người giao chọn: gói 3 `front_metal()` (bool), gói 7 `front_pole()` (chuỗi), đúng thứ tự gốc → nâng cấp.
4. **Màn trình diễn bù cả mùa 1, 2** (user 29/10). Mùa 1 do phiên "Vector hình ảnh theo plan mới" làm (gói HD1, brief-HD1-huong-dan-mua-1.md trên nhánh claude/tay-gap-xoay-comparison-00c53c).
   Phiên này làm gói riêng **T chỉ cho mùa 2**, ngay sau khi gộp mùa 2, TRƯỚC P0 mùa 3. Cờ màn trình diễn tên **`chiChay: true`** (không kéo / sửa / xoá, chỉ Chạy; máy kiểm miễn "mã mẫu không thắng"): ai làm trước thì định nghĩa, người sau dùng lại, báo phiên kia một dòng.
   **Cờ đã có** (HD1, commit gộp 45af133 trên nhánh claude/tay-gap-xoay-comparison-00c53c, chưa vào main): khai `chiChay: true, chinhCoDinh: true` + `maMau.chinh` đúng, nên dùng xe mờ (bong-mo) làm đích;
   cham.js `ganCoDinh`, man-choi.js `khungCoDinh()` / nhãn "Chỉ chạy", chu.js `choi.chiChay*`; máy dò lời lách hoc/kiem-lach-mua-1.mjs (làm bản mùa 2 dựa vào đó).
   Gói T phải tách từ nhánh có CẢ mùa 2 (claude/mua-2-xong) và 45af133: chờ user gộp hai nhánh vào main. 29/10: phiên kia đã gộp main 3fe2207 vào nhánh điều phối của họ (merge 149a075, npm test 89/89): nhánh đó có cả mùa 2 lẫn `chiChay`; gói T tách từ main sau khi user gộp nhánh đó, hoặc từ 149a075 nếu user cho. HD2 (phiên kia) đang sửa khối mùa 1, thêm cờ "đâm tường là thua" (cham.js, mặc định tắt). HD1 sửa lo-trinh-hoc.js (khối mùa 1), lo-trinh-sao.js, kiem-lo-trinh.mjs: gộp với mùa 2 có thể đụng.
   Theo thứ tự memory show-dont-tell-khoi-moi: màn trình diễn khóa sửa → màn giấu hàm cũ + tooltip → thả tự do. Đổi màn đầu của mỗi part / khối mới ở mùa 2 thành màn trình diễn (mã mẫu = lời giải, đo lại sao, đường cong vẫn đạt), máy kiểm: mọi khối mới của mùa có màn trình diễn đứng trước màn ép dùng. Mùa 3 trở đi dùng cờ đó từ đầu.

## 5. Trạng thái
- **29/10 P0 · Khung mùa 3 xong** (agent Claude opus, nhánh claude/khung-mua-3, gộp f6d514c; báo cáo ban-giao/bao-cao-P0-khung-mua-3.md). Khối "MÙA 3 = 10 GÓI" (`MUA_3`) sau khối mùa 2 trong lo-trinh-hoc.js,
  41 màn có sẵn / 159 màn mới; mùa 3 vẫn ẩn, ngưỡng sao chưa khai cứng. Bảng có / thiếu: 1 nhen 4/16 · 2 nam-cham 7/13 · 3 cam-ung-tu 0/20 · 4 bai-tu 0/20 · 5 nhay 16/4 · 6 dao-cuc 3/17 ·
  7 doc-cuc 9/11 · 8 doi-xich 2/18 · 9 bung-nhen 0/20 · 10 tong-hop-3 / trum-mua-3 0/20. Tệp ngân hàng: man-than-nhen, man-nam-cham-n, man-cam-ung-tu, man-bai-tu, man-nhay, man-dao-cuc,
  man-doc-cuc, man-doi-xich-nhen, man-bung-nhen, man-trum-mua-3. Chương dùng lại mã cũ (nhen, nam-cham, doi-xich, che-doi-xich): màn mới khai `so` từ 11.
  Khác bảng mục 2 (agent đo, người giao đồng ý): che-nam-cham.2, .3, .4, .9 gọi grip() (cần cực S + front_pole) và che-nam-cham.7 đọc cực → sang che-doc-cuc (gói 7);
  che-doi-xich cả 10 màn rời mùa 3 (.4, .5 cần pause / hop_box của che-doi-ho-bang); gói ngoài khuôn sang đầu mùa 4 (doi-xich cũ thành doi-xich-bac, nam-cham.9 thành nam-cham-omni).
  Sửa màn: nhen.8, che-nhen.6 bỏ `S`; nam-cham.10 bỏ color() dùng right_clear (sao đo lại o 23, nhịp 31). Khay bớt lệnh theo gói (front_metal < 3, crouch / stand < 5, magnet_s < 6, front_pole < 7).
  kiem-lo-trinh.mjs mục mùa 3: (a) bảng, (b) chuỗi làm dữ liệu từ chuoi-nhen, (c) and / or từ logic-nam-cham, (d) part đúng mùa, (e) part mở dần, (f) không `S`, (g) hàm tạo trước;
  (h) đường cong CHỈ IN (17 chỗ nhảy, ép đỏ khi soát cuối). `--loi-gia-mua-3` 7 / 7 đỏ; người giao tự cắm magnet_s ở gói 2 → (e) đỏ 5 chỗ.
  Người giao chạy lại trên main sau gộp (main đã có HD1 / HD2 / V8a của phiên vector): npm test 89/89, lỗi giả mùa 3 7 / 7, mùa 2 8 / 8.
  Còn cho P2: gói 2 cần 13 màn mới (logic and / or); lời sai mẫu nam-cham.6 sai sẵn (một lời "sai" thắng 3 sao); ngưỡng sao vài gói dời sang mùa 4 lùi (mùa 4 dựng lại sau).

29/10 USER CHỐT (qua phiên vector): mùa 3 giữ **thân nhện**; "xe thăm dò dáng cua" chỉ là chân nhện + tay nam châm trông giống cua, không có thân cua riêng.
Gói 3 đổi tên **"Cảm biến từ"** cho trùng thẻ part (mã gói / chương cam-ung-tu giữ nguyên); tên chương theo quy tắc đặt tên (KE-HOACH-7-MUA.md): "Dò sắt" / "Chế lệnh: dò sắt".
