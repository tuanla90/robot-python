# Báo cáo V7c2 — xoá mã vẽ pixel chết (agent Claude Fable 5.1, nhánh claude/xoa-pixel, 28/10)

Brief: [brief-V7c2.md](brief-V7c2.md). Bản đồ: bao-cao-V7c1.md mục 3. Thứ tự làm: chỗ gọi trước, chỗ cung cấp sau; sau MỖI commit chạy phanh vector (13a-v / A3-v / B5-v / C3-v / kiem-lap-rap); không push, không merge.

## 1. KẾT QUẢ

### Commit (7, theo thứ tự; tất cả trên claude/xoa-pixel, từ 3f1bcad)
| SHA | Việc |
|---|---|
| d42965b | d0: máy kiểm thôi đọc part/: kiem-tay-xoay / kiem-loi-mua-2 / kiem-camera-drone nạp VeVector (LapRap.veVector()) thay Part (ổ, hamGoc, kiemGhep, hình so lệnh vẽ canvas giả); kiem-may-son / kiem-flycam soát ve-vector-tay-son.js / ve-vector-cam.js; kiem-huy-hieu-phim-vector A2 + lỗi giả không cần Part; kiem-bang-mau bỏ mục xem-part; tools/kiem-tat-ca bỏ hoc/game/part. Chứng minh: đổi tên part → part.tam, ba máy kiểm vẫn xanh (183 / 93 / 62), đổi tên lại. |
| 71bfa59 | d1: san-ve.js chỉ còn đường vector (2942 → 2277 dòng): 72 nhánh this.vec, 4 hàm tia pixel (veTiaCamera / veTiaNhin / veTiaTu / veTiaHongNgoai), veKhungDay / veDauSai / veMatDong / veMatTam, thuSan + thuVat pixel, Ve.tiles / make* / veCua; datDoPhanGiai luôn theo px thiết bị; bỏ biến vec. Giữ T, SON_XE, KINH_THAN, coMatDong. |
| fd28f82 | d2: ve-robot.js chỉ còn vector (340 → 181 dòng): hình tạm pixel (veTamTay / xoay / ctxMoi, Ve.makeRobot / makeNhen), veGhep + Part.ghep, beNgangThan / coPart / dungPart / ?part=0, bongTay, HH_PIXEL / REACH 26, nhánh pixel tiLeChoO / vatKep / vatXoay / reachCua. Cấu hình cấm / mã lạ rơi về hình TẠM vector (xe hai bánh không tay). |
| 6eb22fc | d3: mo-dau / phim-goi / phim-mua-1 / phim-mua-2 / man-dau / thanh-phan / ung-dung / xuong-ham / man-lap / the-part bỏ vế pixel (Ve.tiles / makeNutDe / veCua / mk ô, biến VEC + 6 if (VEC), mắt LED pixel màn đầu → luôn đặt mat, hinhPart Part._veMot + HINH_PART + catLe, veMuot luôn true, Ve.datChatLieu / Ve.khungGo, phông Handjet / VT323 dự phòng, `laPart ? : 3`). kiem-giao-dien-vector-b mục f luật mới + lỗi giả mới. |
| bfb634f | d4: xoá hoc/game/part/ (20 tệp, 513 dòng) + 18 thẻ `<script src="part/…">` trong choi.html, xoá hoc/chup-du-lieu-pixel.mjs; du-lieu-chup-pixel.json giữ. kiem-bang-mau: bỏ khoá CHEN part/xem-part.html, 117 vai robot* / son* / luatSon* / luatVat* / dsSon* chờ V7c3. |
| 83dbeaf | d5: huy-hieu.js 858 → 39 dòng (lớp mỏng trên VeVector.HUY_HIEU: ve / mk / maVec / veVec / DS); xoá Painter P, partTho, mọi HINH['x'] = function, vePixel, 20 bí danh, cheDoVec / mkGoc. Mã lạ: canvas trống cùng cỡ (không ném). kiem-huy-hieu-phim-vector A4 + lỗi giả mới (mk lệch 1 px); 89 vai hh* chờ V7c3. |
| e3038af | d6 + d7: ve.js 883 → 85 dòng (xoá Painter, rot90 / rng / tex*, datChatLieu, lưới icon HINH + icon pixel, sprite*, make*, tiles, khungGo, vế lùi pixel ico / sao / mui / khoa / hydrate; giữ T, MAU / MAU_TEN, CO_ICON, mk, ico / sao / mui / khoa / hydrate svg); phim-vector coIco đọc Ve.CO_ICON; xem-vector-v6.html bỏ 18 thẻ part + cột pixel (HuyHieu.vePixel) + iframe ?ve=pixel; xem-vector.html sửa chữ; tools/ve-icon.py + dòng README xoá; PHANH CHỐNG TÁI PHÁT kiem-ve-vector mục 15 / 15b có lỗi giả; kiem-ve-vector mục 10 đọc bảng TILES; kiem-nut-mo-dau B2 / C1; 257 vai chờ V7c3. |

Báo cáo này commit sau cùng (cùng SHA ghi ở câu trả lời cuối).

### Số dòng xoá / thêm theo tệp (git diff --numstat be8cf9e → cuối gói: 55 tệp, +610 / −3643)
| Tệp | Xoá | Thêm | Còn |
|---|---|---|---|
| hoc/game/huy-hieu.js | 833 | 14 | 39 dòng |
| hoc/game/san-ve.js | 829 | 164 | 2277 dòng |
| hoc/game/ve.js | 824 | 26 | 85 dòng |
| hoc/game/part/ (20 tệp) | 513 | 0 | xoá hẳn |
| hoc/game/ve-robot.js | 227 | 68 | 181 dòng |
| hoc/chup-du-lieu-pixel.mjs | 80 | 0 | xoá |
| tools/ve-icon.py | 61 | 0 | xoá |
| hoc/hinh-mau/xem-vector-v6.html | 34 | 14 | |
| hoc/game/thanh-phan.js | 29 | 7 | hinhPart, veMuot, HINH_PART, catLe |
| hoc/game/choi.html | 20 | 1 | 18 thẻ part + 1 chú thích |
| hoc/game/phim-goi.js | 20 | 12 | |
| hoc/game/phim-mua-1.js | 18 | 18 | biến VEC + 6 chỗ |
| hoc/game/mo-dau.js | 12 | 12 | |
| hoc/game/phim-mua-2.js | 11 | 6 | |
| phim-vector / man-dau / ung-dung / xuong-ham / man-lap / the-part / ve-vector-ky-hieu (chú thích) / README | 1–6 mỗi tệp | | |
| Máy kiểm: kiem-ve-vector (+mục 15), kiem-bang-mau (+danh sách vai chờ V7c3), kiem-loi-mua-2, kiem-tay-xoay, kiem-camera-drone, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau-phim-vector, kiem-nut-bat-san, kiem-giao-dien-vector-b, kiem-may-son, kiem-flycam, tools/kiem-tat-ca | | | |

### Lệnh kiểm (tại worktree, từng lệnh một, KHÔNG npm test) — kết quả nguyên văn ở trạng thái cuối (e3038af)
```
node hoc/kiem-ve-vector.mjs                 ĐẠT 97 · HỎNG 0 kiểm
   ✓ (13a-v) CHẾ ĐỘ VECTOR y nguyên: 39 lần phát lại (lời giải + lời sai, 22 màn kể cả màn nhiều robot), 8104 khung — canvas sân + lớp phủ robot của bản mới ra đúng từng lệnh như nền vector c830c12
   ✓ (13b) … canvas sân và lớp phủ robot KHÔNG có fillRect / strokeRect nào
   ✓ (15) V7c2: không thư mục game/part, choi.html không nạp part/, 54 tệp JS của hoc/game (bỏ chú thích) không còn Part.* · this.vec · HINH['x'] = function · Painter · Ve.tiles / make* / veCua / HINH / khungGo / datChatLieu · pixelated · ?ve=pixel / rẽ theo VeVector.bat() / cheDoVector() · Handjet / VT323 làm phông dự phòng
   ✓ (15b) V7c2: hoc/chup-du-lieu-pixel.mjs và tools/ve-icon.py đã xoá; du-lieu-chup-pixel.json còn; hoc/game/ve.js < 120 dòng
node hoc/kiem-ve-vector.mjs --loi-gia       HỎNG 46 / 97 kiểm (đang cắm lỗi giả: phải đỏ)   — trong đó ✗ (15) (lỗi giả: coi còn thư mục part, choi.html nạp part/part.js, san-ve.js có `if (this.vec) Part.ghep(...)`)
node hoc/kiem-huy-hieu-phim-vector.mjs      ĐẠT 12 · HỎNG 0 kiểm   (A3-v 84 × 3, B5-v 19 phim, A7)
node hoc/kiem-huy-hieu-phim-vector.mjs --loi-gia   ĐẠT 6 · HỎNG 6 kiểm (A1, A2, A3-v, A4, A7, B5-v đỏ)
node hoc/kiem-nut-mo-dau-phim-vector.mjs    ĐẠT 12 · HỎNG 0 kiểm   (C3-v 6 khung mở đầu)
node hoc/kiem-nut-mo-dau-phim-vector.mjs --loi-gia   HỎNG 8 / 12 kiểm (đang cắm lỗi giả: phải đỏ)
node hoc/kiem-giao-dien-vector-b.mjs        ĐẠT 16 · HỎNG 0 kiểm;  --loi-gia: HỎNG 9 / 16 kiểm (kể cả mục f mới: man-dau quên đặt mắt)
node hoc/kiem-lap-rap.mjs                   ĐẠT 127 · HỎNG 0
node hoc/kiem-khay.mjs                      ĐẠT 184 · HỎNG 0
node hoc/kiem-phim-goi.mjs                  ĐẠT 41 · HỎNG 0
node hoc/kiem-bang-mau.mjs                  ĐẠT 16 · HỎNG 0 kiểm
node hoc/kiem-dong-goi-artifact.mjs         ĐẠT 14 · HỎNG 0 kiểm   (gói 234 mảnh, 130 script của choi.html, không còn part/)
node hoc/kiem-hoc.mjs                       ĐẠT 6715 · HỎNG 0
node hoc/kiem-huong-dan.mjs                 ĐẠT 40 · HỎNG 0
node hoc/kiem-che-cam-bien.mjs              ĐẠT 224 · HỎNG 0
node hoc/kiem-tay-xoay.mjs                  ĐẠT 183 · HỎNG 0
node hoc/kiem-loi-mua-2.mjs                 ĐẠT 93 kiểm
node hoc/kiem-camera-drone.mjs              ĐẠT 62 · HỎNG 0
node hoc/kiem-may-son.mjs                   ĐẠT 145 · HỎNG 0
node hoc/kiem-gioi-thieu-part.mjs           ĐẠT 1258 · HỎNG 0
node hoc/kiem-sung-hoi.mjs                  ĐẠT 187 · HỎNG 0
node hoc/kiem-flycam.mjs                    ĐẠT 245 · HỎNG 0
node hoc/kiem-doi-thu-manh.mjs              ĐẠT 16 kiểm tra gói Đọ sức part mạnh.
node hoc/kiem-nut-bat-san.mjs               ĐẠT 30 kiểm
node hoc/kiem-trum-mua-1 / trum-mua-2 / doi-mua-1 / doi-mua-2 / hong-ngoai / rap-nao / che-list / be-sung / nut-de   đều ĐẠT (81 / 107 / 79 / 107 / 108 / 286 / 205 / 107 / 62)
```
(Các máy kiểm ở trên chạy ở nhiều thời điểm trong gói sau commit liên quan; kiem-ve-vector, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau, kiem-bang-mau, kiem-giao-dien-vector-b, kiem-dong-goi-artifact, kiem-lap-rap, kiem-tay-xoay chạy lại ở trạng thái cuối.)

### Phanh chống tái phát (kiem-ve-vector mục 15 / 15b) + lỗi giả
- (15) không thư mục hoc/game/part; choi.html không có `<script src="part/`; mọi tệp JS của hoc/game (bỏ chú thích khối và dòng) không khớp 8 mẫu cấm: `Part.(ghep|lay|hamGoc|_veMot|veVatNho|rot90|ds|SON|DS_SON|LOP_SON|K)`, `this.vec`, `HINH['x'] = function`, `new Painter( / function Painter( / Painter.prototype`, `Ve.(tiles|make*|veCua|HINH|Painter|khungGo|datChatLieu|spriteTrum|icon)` (không tính khoá chuỗi `'Ve.makeConv'` của bảng VE_TRUC_TIEP), `pixelated`, `ve=pixel / VeVector.bat() ?|&|| / cheDoVector() ? / VeRobot.coPart / dungPart / ?part=0`, phông `"Handjet"` / `"VT323"` làm chuỗi dự phòng.
- (15b) hoc/chup-du-lieu-pixel.mjs và tools/ve-icon.py đã xoá, du-lieu-chup-pixel.json còn, ve.js < 120 dòng.
- Lỗi giả `--loi-gia`: coi như còn thư mục part, choi.html nạp part/part.js, san-ve.js có `if (this.vec) Part.ghep(cfg, st, h)` → (15) ĐỎ (đã thấy đỏ ở lần chạy cuối). Lỗi giả có sẵn của 13a-v / A3-v / B5-v / C3-v vẫn đỏ.

### Trình duyệt (server tạm cổng 4202, một tab, gỡ SW + xoá caches + localStorage rồi tải lại; soát bằng script trong trang; tắt server + đóng tab khi xong)
- `window.Part` = undefined; 0 thẻ `<script src="part/…">`; 0 yêu cầu mạng tới `part/`; body `ve-vector san-sang`; Ve chỉ còn { T, MAU, MAU_TEN, CO_ICON, mk, ico, sao, khoa, mui, hydrate }; HuyHieu { ve, mk, maVec, veVec, DS } với DS = 84.
- Đi qua: màn đầu (5 canvas, 54 svg) → chọn gói → lưới màn gói xe (85 svg) → màn hai-banh.1 / xich.1 / nhen.1 / omni.1 / drone.1 / hai-robot.1 / tay-xoay.3 / nam-cham.6 → Lắp robot rap-nao.1 (112 svg) → phim tay-gap (3 khung) → phim mở đầu (2 khung) → Cài đặt: 0 canvas `image-rendering: pixelated` ở mọi bước, 0 phần tử icon thiếu (`.vi-thieu`), không bước nào ném lỗi.
- Lắp robot / luật ghép trong trang: drone + kẹp → "Drone không gắn được Tay kẹp trước mũi."; xe + camera-bay → "Camera nhìn xuống (camera-bay) chỉ gắn được lên drone."; drone + camera → "Drone không gắn được camera: drone không có hướng mặt để nhìn \"phía trước\"."; xích + tay xoay + camera → ok (y câu báo bộ pixel cũ).
- Cài đặt: hàng hieuUng, nhac, mat (không son, không kieu-ve).
- Canvas không mang cờ .laVector còn thấy: canvas sân `.tex` (#field / lớp phủ) và `.tp-hinh-cv` (thẻ Bộ phận, Ve.mk sao chép không chép cờ) — y như V7b / V7c1, không phải canvas pixel.
- Console: chỉ "An unknown error occurred when fetching the script." × 2 (đăng ký sw.js trong ô trình duyệt của app, như V7b / V7c1); không cảnh báo `HuyHieu:` / `Ve:` / `VeRobot:`.

### Việc dở
không có (mọi mục d0–d7 của brief đã làm). Để V7c3 như brief: choi.css / font / sw.js / bang-mau.js; thêm các khoản ở mục 3.

## 2. CÂU HỎI CẦN LÀM RÕ
1. **Lệnh `g.fillStyle = …` bóng thân còn giữ trong san-ve.js veLopXe (một dòng, không vẽ gì)**: ở vector bóng đổ nằm trong hình robot, dòng đặt màu là thừa; giữ vì phanh 13a-v so TỪNG LỆNH canvas (kể cả đặt thuộc tính) với nền c830c12, bỏ đi là phanh đỏ dù hình không đổi. Tương tự `g.save(); g.font = '8px VT323, monospace' … g.restore()` đo bề ngang chữ trong veBongMau / veThanhPin / veDan (số đo đưa cho HU.* vector). Đề nghị V7c3 (khi đã chấp nhận đổi nền phanh sang commit cuối V7c2) bỏ ba chỗ này và đổi VT323 → phông đo của vector. Tự quyết: giữ nguyên. Đảo lại được: có.
2. **huy-hieu.js không gộp vào huy-hieu-vector.js** (brief cho tự quyết): giữ tệp riêng 39 dòng vì 6 nơi gọi `window.HuyHieu` (bang-mo-khoa, man-chon, man-goi, gioi-thieu, phim-mua-1, ve.js hydrate) và thứ tự nạp (huy-hieu-vector → ve-robot → huy-hieu) không đổi; gộp thì phải đổi tên ở 6 tệp + máy kiểm nạp theo tên. Đảo lại được: có (V7c3 nếu muốn).
3. **Hình TẠM khi cấu hình cấm / mã lạ** (trước: hình pixel Ve.makeRobot / veTamTay): nay là xe hai bánh vector không tay (ve-robot.js ve()). Game không đi tới đường này (lap-rap.js chặn cấu hình cấm; mọi màn có hình), máy kiểm kiem-ve-vector mục 9 chốt hành vi mới (cấu hình cấm báo một lần rồi trả canvas vector = hình tạm). Tự quyết; đảo lại được.
4. **hinhVat chất lạ** (san-ve.js, trước rơi về Ve.makeVatNho pixel): nay rơi về `VeVector.vat('thung-go')`. Đường chết (chất chỉ go / sat / nam-cham). Tự quyết.
5. **Số dự phòng khi thiếu hình vector** (VeRobot.vatKep / vatXoay / hinhHoc / phim-mua-1 ở Node): hằng pixel cũ (24 / 10,5 / 23,5 / 1 / 11 pixel part; 22 − oy; 57 / 38 / 14) đổi sang 1/100 ô (× 100 / 24: mz 100, mzs 44, bk 98, pp 4,2, dinh 46; vật 75 / 42). Chỉ chạy khi hình vector thiếu (không có trong game) hoặc máy kiểm nạp phim-mua-1 ở Node mà không nạp ve-robot (kiem-phim-goi: chỉ đọc lời / khung). Tự quyết.
6. **kiem-bang-mau "vai nào cũng có chỗ dùng"**: xoá mã pixel làm 508 vai hết chỗ dùng (45 san-ve d1 + 117 part / ve-robot d4 + 89 hh* d5 + 257 ve.js d6). Brief nói "vai màu thừa để V7c3" nên tôi KHÔNG xoá khỏi bang-mau.js mà nối vào VAI_CHO_V7C3 trong máy kiểm (4 khối, có chú thích gói). V7c3 xoá vai khỏi bang-mau.js rồi xoá 4 khối này. Đảo lại được.
7. **Brief d0 "kiem-giao-dien-vector-b mục man-dau đặt mat CHỈ khi bat() → luật mới"**: làm ở d3 cùng man-dau.js (làm ở d0 thì mục đó đỏ tới d3). Không chặn.
8. **Brief / bảng V7c1 chỗ cần sửa**: (a) bảng V7c1 ghi ve-robot.js còn "cheDoVector / veVector (luôn true, chỉ còn coDu)" — đúng; nhưng kiem-ve-vector mục 9 còn hai kiểm đòi hành vi PIXEL (tiLeChoO mã lạ = công thức pixel; cấu hình cấm "không trả hình vector") mà bảng không nêu → đã sửa máy kiểm (câu 3). (b) Bảng V7c1 không nêu `veVat / veThung` nhận tham số `TL = Ve.tiles()` từ draw(): đổi chữ ký mà quên chỗ gọi thì phanh 13a-v đỏ lệch 2 px (nhun = NaN) — đã gặp và sửa trong d1 (xem rủi ro). (c) Brief d7 "tools/ve-icon.py xoá nếu không còn ai dùng": README dòng 42 là chỗ dùng duy nhất (icon app đã vẽ lại theo vector ở V7b) → xoá cả hai. (d) Brief "kiem-dong-goi-artifact (gói Artifact không được còn tệp part/)": gói đỏ ngay sau khi xoá part/ vì 18 thẻ script mồ côi (mục "mọi thẻ script trỏ tới tệp có thật" của kiem-sung-hoi cũng đỏ) → thẻ phải xoá CÙNG commit với thư mục (đã làm). (e) Brief liệt kê kiem-gioi-thieu-part, kiem-sung-hoi, kiem-doi-thu-manh trong nhóm "grep part/ Part. part-": ba máy này chỉ có chữ "part" ở tên khác (ThePart, man-tam-day / part-day đã xoá, "part mạnh") — không cần sửa, đã chạy xanh.
9. **Chuỗi `'8px VT323, monospace'` trong san-ve.js (3 chỗ đo chữ)**: mẫu cấm phông ở mục 15 cố ý chỉ bắt `"Handjet"` / `"VT323"` đứng riêng (chuỗi phông dự phòng của ung-dung.js, đã xoá), không bắt chuỗi đo chữ này (câu 1). Nêu để V7c3 quyết cùng font.css.

## 3. ĐỀ XUẤT cho V7c3 (choi.css, font, sw.js, bang-mau.js) — số dòng tại e3038af
- **bang-mau.js**: xoá 508 vai đã liệt kê trong `hoc/kiem-bang-mau.mjs` VAI_CHO_V7C3 (dòng 166–~215: 11 vai cũ + 45 d1 + 117 d4 + 89 d5 + 257 d6), rồi xoá danh sách; NEN = null hoặc dọn SUA_SAU_NEN (khoá 'huy-hieu.js' / 've.js' lý do nay là "V7c2 viết lại", tệp còn nhưng khác nền). Vai `luatSanDo*` (Ve.MAU) còn dùng; `sanTim`… đã hết. Cân nhắc: `tiaDoV1Rgb`… cùng nhóm.
- **choi.css (1187 dòng)**: 91 khai báo pixel (--wood / --chalk / pixelated / steps( / clip-path) như V7c1 ghi; thêm: `.deco .surf / .bev / canvas` (dòng 48–52, khung gỗ Ve.khungGo đã xoá nên ba phần tử này không còn được tạo; choi-vector.css:35 ẩn chúng cũng thành thừa); `canvas.lop-robot` image-rendering (san-ve đặt 'auto' bằng JS ở doiCo / datDoPhanGiai — bỏ CSS pixelated thì bỏ luôn hai dòng JS `style.imageRendering = 'auto'`; mục 15 chỉ cấm chữ `pixelated` trong JS). Cần user quyết: bỏ tiền tố `body.ve-vector` của choi-vector.css (hợp nhất hai tệp) hay giữ.
- **font/font.css**: 12 → 6 @font-face (bỏ Handjet / VT323, 6 woff2); dong-goi-artifact.py:38–47 PHONG_PIXEL; kiem-dong-goi-artifact mục "nguồn font.css vẫn có 12 @font-face" sửa; san-ve.js 3 chỗ `g.font = '8px VT323, monospace'` (chỉ đo bề ngang; đổi sang phông vector sẽ làm 13a-v đỏ → đổi nền phanh sang commit cuối V7c2 trước, rồi cập nhật nền sau V7c3).
- **sw.js:11**: BAN 'duong-hoc-v1' → 'duong-hoc-v2' (dọn part/*.js, woff2 cũ, ve.js / huy-hieu.js cũ trong bộ đệm người chơi cũ). Nên làm NGAY đầu V7c3: người chơi cũ đang có part/*.js trong cache 'duong-hoc-v1' (vô hại vì choi.html mới không nạp, nhưng cache chứa tệp 404).
- **ve-vector-ky-hieu.js:34–41** bảng TILES / VE_TRUC_TIEP: tên khoá là tên hàm pixel cũ ('Ve.makeConv'…); phim-vector.o / máy kiểm mục 10 vẫn gọi theo tên cũ (rug / wall / crate…). Giữ (dữ liệu), hoặc V7c3 đổi khoá thành tên hình thẳng — không cần.
- **Phanh**: khi V7c3 đổi lệnh vẽ (phông đo chữ, bỏ fillStyle thừa), đổi NEN_VEC của kiem-ve-vector 13a-v / A3-v / B5-v / C3-v từ c830c12 sang commit gộp V7c2 (hình không đổi, đã chứng minh ở gói này).
- kiem-ve-vector mục 14b còn chữ "(chế độ pixel không có lớp này → choi.css chạy y nguyên)" và 14d "pixel": chỉ lời, V7c3 sửa cùng CSS.

## 4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Gói trước đã tắt hẳn kiểu vẽ điểm ảnh cũ; gói này xoá luôn phần mã đó khỏi game: thư mục 20 tệp vẽ bộ phận robot cũ, ba tệp vẽ lớn (sân, huy hiệu, icon) mỗi tệp mất 800–830 dòng, tệp vẽ robot còn một nửa; tổng cộng bớt khoảng 3 600 dòng, thêm 600 dòng (chủ yếu là máy kiểm). Hình trên màn không đổi: máy kiểm phát lại 39 lần chơi (8 104 khung hình), 84 huy hiệu, 19 phim và 6 khung mở đầu rồi so từng nét với bản trước gói, tất cả khớp; mở game thật đi qua màn đầu, gói, lưới màn, 8 màn chơi đủ 5 thân robot, Lắp robot, phim, Cài đặt: không lỗi, không còn tệp cũ nào được tải. Có thêm một "phanh": nếu ai đưa mã vẽ cũ quay lại (thư mục cũ, tên hàm cũ, công tắc chế độ), máy kiểm sẽ báo đỏ (đã thử bằng lỗi giả). Phần còn lại cho gói sau: dọn bảng kiểu (CSS), phông chữ cũ, bộ đệm ngoại tuyến và bảng màu (508 màu không còn ai dùng).

## 5. RỦI RO CÒN LẠI
- **Chưa chạy npm test cả bộ** (luật): đã chạy 38 máy kiểm liên quan (liệt kê ở mục 1); ~50 máy còn lại (lộ trình, chương, sổ lệnh…) không đọc tệp pixel nhưng chưa chạy lại sau d6 (ve.js) — người giao chạy một lần sau gộp. Rủi ro thấp: Ve chỉ còn 10 hàm đều có từ V7b.
- **Trình duyệt chỉ soát bằng script** (đếm canvas / svg / lớp / lỗi), chưa nhìn ảnh từng màn (như V7c1); ô trình duyệt có thể ẩn. Cách kiểm: mở choi.html, đi màn đầu → Lắp robot → màn chơi hai robot → phim gói, nhìn bằng mắt; so với bản gộp V7c1 nếu nghi.
- **Khung gỗ Ve.khungGo (xoá ở ung-dung.js / xuong-ham.js)**: ở vector choi-vector.css:35 đã ẩn `.deco .surf / .bev / canvas` nên không đổi hình; nếu V7c3 bỏ tiền tố body.ve-vector mà quên luật này thì cũng không sao (phần tử không còn được tạo).
- **Người chơi cũ**: cache 'duong-hoc-v1' còn part/*.js, ve.js cũ…; choi.html mới không nạp nên vô hại, nhưng sw.js nên đổi tên bộ đệm ở V7c3 (xem mục 3).
- **Phanh 13a-v so từng lệnh canvas**: đã bắt được một lỗi thật trong gói (đổi chữ ký veVat / veThung mà draw() còn truyền TL → `now` nhận object → nảy (nhun) = 0 → vật lệch 2 px ở khung 146) — chứng tỏ phanh nhạy; nhưng cũng vì thế vài lệnh thừa (fillStyle bóng thân, g.font VT323 đo chữ) phải giữ (câu hỏi 1). Lệnh thừa không đổi hình.
- **Mục 15 bỏ chú thích bằng regex** (`//` không đứng sau `:`, `\`, `'`, `"`): chuỗi chứa `//` trong mã có thể bị cắt một phần dòng → có thể BỎ SÓT mẫu cấm nằm sau `//` trong chuỗi (không gây đỏ sai). Lỗi giả chèn vào san-ve.js đã chứng minh phanh đỏ đúng.
- **Nhánh hình tạm vector / số dự phòng** (câu hỏi 3–5) chưa có màn nào kích hoạt trong game; chỉ máy kiểm mục 9 chạm tới.
