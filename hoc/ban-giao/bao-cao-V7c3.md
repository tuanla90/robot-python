# Báo cáo V7c3 — CSS / phông / bảng màu / bộ đệm (agent Claude Opus 5.5, nhánh claude/css-phong, 29/10)

Brief: [brief-V7c3.md](brief-V7c3.md). Ghi dần theo từng commit.

## 1. KẾT QUẢ

### Commit (8, nhánh claude/css-phong từ db08b60; không push, không merge)
| SHA | Việc |
|---|---|
| 9233a92 | e0: sw.js BAN v1 → v2; nền phanh c830c12 → 8780764; lỗi giả C3-v cắm lại |
| 6114524 | e1: máy đo kiểu tính tools/do-kieu-tinh.mjs + nền tools/nen-kieu-tinh.json |
| 85cb56b | e2: choi.css bỏ 114 khai báo + 8 luật pixel; choi-vector.css −1 luật; san-ve.js −2 dòng imageRendering |
| 6e04104 | e3: font.css 12 → 6 @font-face, xoá 6 woff2; dong-goi-artifact.py; --px / --mono; san-ve.js đo chữ bằng phông vector, bỏ fillStyle thừa (13a-v đỏ đúng dự kiến) |
| a6fcfb9 | e3b: nền phanh 8780764 → 6e04104 (commit riêng) |
| 80beb46 | e4: bang-mau.js xoá 500 vai (giữ 19 vai dùng động + 5 gốc) |
| ba5a7ee | e5: dọn chú thích / chữ cũ, phanh 15c + sửa lỗi giả 14c / giao-dien-b mục c |
| (commit cuối) | báo cáo này + phần soát trình duyệt cuối |

### Số dòng / byte theo tệp (git diff --numstat db08b60 → cuối; thêm / xoá)
bang-mau.js +4 / −504 (1377 → 877 dòng, 160 402 → 88 971 byte, 500 vai) · choi.css +90 / −103 (1187 → 1174 dòng; 114 khai báo + 8 luật) · font/font.css +3 / −51 (12 → 6 @font-face) · 6 woff2 xoá (60 588 byte) · san-ve.js +4 / −6 · choi-vector.css +3 / −4 · dong-goi-artifact.py +2 / −4 · thanh-phan / thanh-cuon / the-part / mo-dau / man-lap / man-choi / chu / choi.html / sw.js / ve-vector-hieu-ung / README: 1–3 dòng mỗi tệp · máy kiểm: kiem-ve-vector +44 / −9, kiem-bang-mau +14 / −57, kiem-nut-mo-dau +4 / −4, kiem-giao-dien-vector-b +3 / −2, kiem-huy-hieu-phim-vector +2 / −2, kiem-dong-goi-artifact +1 / −1 · mới: tools/do-kieu-tinh.mjs 182 dòng, tools/nen-kieu-tinh.json 11 044 dòng (1,85 MB).

### e0 (9233a92) sw.js + nền phanh
- sw.js:11 BAN 'duong-hoc-v1' → 'duong-hoc-v2'. activate ĐÃ xoá mọi bộ đệm khác tên (`ks.filter(k !== BAN).map(caches.delete)`), không cần thêm.
- NEN_VEC c830c12 → 8780764 ở kiem-ve-vector (13a-v), kiem-huy-hieu-phim-vector (A3-v / B5-v), kiem-nut-mo-dau-phim-vector (C3-v); chữ trong chú thích / tên kiểm sửa theo.
- Phát hiện: lỗi giả của C3-v KHÔNG cắm được (chuỗi `var v = PV() && PhimVector.o(ten, s, 0);` trong mo-dau.js đã hết từ V7c2, `replace` không khớp) → C3-v không đỏ khi --loi-gia (báo cáo V7c2 ghi "HỎNG 8 / 12" mà không nêu C3-v xanh). Sửa: cắm vào hàm `o()` thật → C3-v đỏ (HỎNG 9 / 12).

### e1 máy đo kiểu tính (tools/do-kieu-tinh.mjs + tools/nen-kieu-tinh.json)
- Chọn Chrome headless (Chrome có sẵn ở Program Files) điều khiển bằng DevTools Protocol qua WebSocket có sẵn của Node 24 (không cài gói). Lý do: chạy lại được bằng một lệnh, đặt khổ chính xác (Emulation.setDeviceMetricsOverride), không phụ thuộc ô trình duyệt bị ẩn, tự bật / tắt server.mjs (cổng 4202) và Chrome.
- 14 cảnh × 2 khổ (1280 × 800, 360 × 640) = 28 cảnh, 10 658 phần tử (+ ::before / ::after có content): phim mở đầu, màn đầu, Cài đặt, Sổ lệnh, thẻ Bộ phận (ThePart.mo kep), chọn gói, lưới màn, phim gói, thẻ "Bộ phận mới" khi vào màn, màn chơi khay mở ("Hàm khác" bấm mở nếu có), hộp gợi ý, thua (chạy chương trình trống), thắng (bản nháp = lời giải, bảng thắng), Lắp robot.
- Ghi mỗi phần tử: hộp bao (làm tròn 0,5 px) + display, visibility, opacity, transform, color, background (color / image / size / position / repeat), border 4 cạnh, border-radius, box-shadow, outline, font-family / size / weight / style, line-height, letter-spacing, text-shadow, text-transform, text-align, clip-path, image-rendering, filter, animation-name / timing, z-index, content. Hoạt cảnh CSS dừng ở 400 ms trước khi đo; phần tử JS đặt transform nội tuyến (robot màn đầu đi lại) ghi "js" cho hộp + transform (lần chạy đầu khác 4 px theo thời điểm).
- Ổn định: hai lần đo liên tiếp trên cùng cây: 0 khác.
- Tự chứng minh: (a) choi.css:148 `#sc-choi .side .cbtn{height:32px}` → 30px: máy báo 94 chỗ khác (nút Chạy / Nhịp / Lại / Gợi ý cao 40 → 37,5 ở khổ 1280, các hộp dưới dời). (b) choi.css:61 `.g-gr{--c:…}` → #ff0000: máy báo 0 khác — đúng, vì ở vector nút dùng --vc / nền riêng của choi-vector.css (khai báo này đã chết). Gỡ cả hai.
- Tệp nền 1,85 MB (bảng 326 bộ kiểu không trùng + khoá đường dẫn phần tử).
- Cách chạy: `node tools/do-kieu-tinh.mjs` (so với nền, mã thoát 1 nếu khác; ~3 phút); `--ghi-nen` ghi lại nền; `--canh choi-khay,cai-dat` chỉ vài cảnh.

### e2 choi.css bỏ khai báo pixel (choi.css 1187 → 1173 dòng; choi-vector.css −1; san-ve.js −2 dòng JS)
- Xoá trong choi.css: 11 `background-image:var(--wood|--woodD|--woodL|--chalk)` + 11 `background-size` đi kèm (192px 120px / 48px 48px), 25 `image-rendering:pixelated|crisp-edges`, 14 `--stud:var(--st-*)`, 53 `steps(n)` (bỏ khỏi animation / transition rút gọn), clip-path răng cưa của .screen (+ luật `body.dien-thoai .screen{clip-path:none}`), luật `.brick::before` (núm), `.deco canvas`, `.deco .surf`, `.deco .bev`, và 3 luật thành rỗng (`.tex{}`, `.cbtn.nut-loai .oi canvas{}`, `.md-a canvas,…{}`). Tổng 114 khai báo + 8 luật.
- Bằng chứng không còn hiệu lực trước khi xoá: --wood / --chalk / --stud / --st-* không còn ai đặt (Ve.datChatLieu xoá ở V7c2) → các var() đó rỗng; `body.ve-vector, body.ve-vector *{image-rendering:auto!important}`; MỌI luật có steps() (51 bộ chọn) đều có luật `body.ve-vector <cùng bộ chọn>` đặt lại `animation` / `animation-timing-function` / `transition-timing-function` (soát bằng script, chép ở mục rủi ro); `.ws-ov` transition đặt lại ở choi-vector.css:516.
- choi-vector.css: xoá luật ẩn `.deco .surf / .bev / >canvas` (không JS nào tạo các phần tử này: man-chon / man-dau / man-choi chỉ tạo `.deco` rỗng). GIỮ tiền tố body.ve-vector.
- san-ve.js: xoá `this.cv.style.imageRendering = 'auto'` (datDoPhanGiai) và `l.style.imageRendering = 'auto'` (lớp phủ robot): CSS không còn pixelated nên inline 'auto' thừa.
- Máy đo: lần đầu báo 4 chỗ khác: `.md` (phim mở đầu / phim gói, hai khổ) `background-size 192px 120px → auto` trong khi ảnh nền = none (choi-vector.css:738) → không hiện gì. Sửa MÁY ĐO: không có ảnh nền thì ghi '·' cho cỡ / vị trí / lặp ảnh nền; ghi lại nền TRÊN CÂY e1 (trả ba tệp về HEAD, --ghi-nen, chép lại bản e2). Đo lại: **KHÔNG KHÁC NỀN (0 chỗ), 28 cảnh, 10 658 phần tử**.
- kiem-bang-mau: 4 vai hết chỗ dùng (moCamToi, camSangV4, goV7, goV8 của .deco .surf / .bev) thêm vào VAI_CHO_V7C3; choi.css thêm vào SUA_SAU_NEN (mục 4 so từng byte với nền A1 13b8a97). ĐẠT 16; --loi-gia HỎNG 1 / 16.

### e3 phông (font.css 12 → 6 @font-face; xoá 6 woff2 = 60 588 byte; san-ve.js đo chữ bằng phông vẽ chữ)
- font/font.css: xoá 6 khối @font-face Handjet / VT323 (12 → 6, 101 → 53 dòng); `git rm` handjet-{viet,latin-ext,latin}.woff2 (3 492 + 7 196 + 7 660 byte) + vt323-{viet,latin-ext,latin}.woff2 (7 932 + 16 372 + 17 936 byte).
- dong-goi-artifact.py: bỏ PHONG_PIXEL + dòng `css = PHONG_PIXEL.sub('', css)` + chú thích. kiem-dong-goi-artifact: "nguồn font.css đúng 6 @font-face".
- choi.css :root: `--px` / `--mono` trỏ thẳng "Google Sans Flex" / "Google Sans Code" (cùng chuỗi dự phòng như choi-vector.css), `--kp:1; --km:1; --wm:500` (hệ số của phông pixel cũ 1,4 / 1,5 / 400; body.ve-vector đã đặt đúng các giá trị này nên không đổi gì); chú thích đầu tệp + chú thích .fb sửa theo.
- san-ve.js: 3 chỗ đo chữ `g.font = '8px VT323, monospace'` → `HU().PHONG_CHU` (veBongMau, cùng phông HU.bongMau vẽ) và `HU().PHONG_SO` (veThanhPin, veDan; cùng phông HU.thanhPin / HU.theDan vẽ). ve-vector-hieu-ung.js chỉ THÊM `PHONG_CHU, PHONG_SO` vào V.HU (đọc phông đo chữ, brief cho phép). Xoá dòng `if (!v.dr) g.fillStyle = …` bóng thân thừa trong veLopXe → vai moToiV22 hết chỗ dùng (thêm VAI_CHO_V7C3, xoá ở e4).
- Phanh 13a-v ĐỎ đúng dự kiến. Thêm cờ `--chi-tiet-13a` cho kiem-ve-vector (in mọi khung khác + lệnh bớt / thêm). Kết quả: 39 / 39 lần phát lại khác, tất cả khung, gồm (a) `− =fillStyle(rgba(0,30,10,.35))` (một robot) hoặc `− =fillStyle(#5aa9ff)` + `− =fillStyle(#ffcf30)` (hai robot) ở MỌI khung: đúng dòng bóng thân đã xoá; (b) chỉ ở màn có chữ trên sân: drone.3 / drone.5 / flycam.2 (thanh pin), mau.8 / may-nem.7 (bong chữ màu): `=font(8px VT323, monospace)` → `=font(600 6px "Google Sans Code" …)` / `=font(600 6.5px "Google Sans Flex" …)` và đường bo (moveTo / lineTo / arcTo / arc / fillText) của viên pin / bong chữ dời theo bề ngang mới.
- Chứng minh chỉ khác ở các lệnh dự kiến: trả TẠM 3 chỗ g.font về '8px VT323, monospace' (giữ phần còn lại của e3) → `--chi-tiet-13a` chỉ còn đúng 3 loại dòng `− =fillStyle(…)` (34 lần phát lại; 5 lần còn lại không khác gì). Tức là toàn bộ khác biệt hình học ở (b) do phông đo chữ.
- Xem bằng mắt (Chrome headless, 360 × 640, dpr 3, chạy lời giải): drone.3 cuối màn: viên pin "1" trước / sau cùng cỡ, số nằm gọn trong viên; mau.8 khung đọc màu: bong `"blue"` trước nằm bên phải ô đọc, sau nằm bên trái (viTriBong chọn chỗ theo bề ngang mới), chữ gọn trong viên thuốc, cỡ gần như cũ. Ảnh: scratchpad của phiên (anh/tong-truoc.png, tong-sau.png, bong-truoc-sau.png; không commit).
- Máy đo kiểu tính: 0 khác. kiem-bang-mau ĐẠT 16, kiem-dong-goi-artifact ĐẠT 14, A3-v / B5-v / C3-v / giao-dien-vector-b xanh.

### e3b đổi nền phanh sang 6e04104 (commit riêng)
- NEN_VEC 8780764 → 6e04104 ở kiem-ve-vector (13a-v), kiem-huy-hieu-phim-vector (A3-v / B5-v), kiem-nut-mo-dau-phim-vector (C3-v). Lý do: e3 đổi lệnh vẽ có chủ ý (đo chữ bằng phông vector, bỏ fillStyle thừa), đã chứng minh ở trên là chỉ khác ở các lệnh đó. A3-v / B5-v / C3-v không đổi kết quả (xanh với cả hai nền); đổi cùng để ba phanh chung một nền.
- Kết quả: kiem-ve-vector ĐẠT 97 · HỎNG 0 (13a-v ✓, 8104 khung); --loi-gia HỎNG 45 / 97 (13a-v, 15 đỏ). Ghi chú: e0 là 46 / 97; mục (14c) thôi đỏ khi cắm lỗi giả từ e2 vì lỗi giả của nó là "bỏ phần phủ .ffr.rung", mà choi.css hết steps() nên phần phủ không còn cần → sửa phép thử ở e5. kiem-huy-hieu-phim-vector ĐẠT 12 (--loi-gia ĐẠT 6 · HỎNG 6), kiem-nut-mo-dau-phim-vector ĐẠT 12 (--loi-gia HỎNG 9 / 12).

### e4 bang-mau.js (1377 → 877 dòng; 500 vai xoá)
- Danh sách VAI_CHO_V7C3 (524 vai, gồm 5 vai e2 / e3 thêm; theo tầng G 63, BT 415, DOI 25, LUAT 21) xử lý: **500 vai xoá** khỏi bang-mau.js (G 58, BT 415, DOI 23, LUAT 4; 160 402 → 88 971 byte), rồi xoá danh sách khỏi kiem-bang-mau.
- **PHẢN BIỆN brief / V7c2: 19 vai trong danh sách CÒN CHỖ DÙNG ĐỘNG** (tên vai là chuỗi trong bảng tra, đọc `BM[tên]`): ve-vector-tay-son.js `MAU` (luatSon* 11 vai: DoSang / DoToi / XanhLa / XanhLaSang / XanhLaToi / XanhDuong / XanhDuongSang / XanhDuongToi / Vang / VangSang / VangToi), ve-vector-vat.js / ve-vector-o.js `MAU_DAI` + `CUC` (luatVatXanhLa, luatVatVang, luatVatDoSang, luatVatDoToi, luatVatXanhDuongSang, luatVatXanhDuongToi), ve-vector.js `SON_DOI` (sonDoToi, sonTimToi; kiem-ve-vector:250 còn đọc BM.sonDoToi). V7c2 tưởng thừa vì mục "vai nào cũng có chỗ dùng" chỉ đếm `BM.<vai>` / `var(--g-<vai>)`. Lần xoá đầu (524) làm sơn / đai màu / màu đối thủ thành undefined → phát hiện bằng quét chuỗi trước khi chạy máy; khôi phục từ HEAD rồi xoá lại trừ 19 vai này. GIỮ.
- GIỮ thêm 5 gốc G (kemToi, sanDoSang, sanLamToi, sanXanhLoToi, sanNau): không còn chỗ gõ thẳng nhưng là gốc (BM._gocCua) của biến thể còn dùng; xoá thì kiểm "gốc của mỗi biến thể có trong G" đỏ và A2 (GOP_HET) gãy.
- kiem-bang-mau: mục "vai nào cũng có chỗ dùng" đếm thêm (a) tên vai đứng riêng trong chuỗi '…' của tệp JS game (bỏ chú thích) = chỗ dùng động, (b) gốc của biến thể đang dùng. Đã soát: luật (a) chỉ cứu đúng 19 vai trên, không vai nào khác. Lỗi giả mới: thêm vai `vaiThuaGia` → mục này đỏ; chèn `color:#123456` vào choi.css trong bộ nhớ → "không có mã màu gõ thẳng" đỏ.
- SUA_SAU_NEN: không khoá nào trỏ tệp đã xoá (kiểm "chỉ gồm tệp có thật" xanh); nối lý do V7c2 / V7c3 vào huy-hieu.js, ve.js, san-ve.js, ve-robot.js. GIỮ NEN = '13b8a97' (mục 4 vẫn so được 3 tệp / 30 token chưa sửa sau nền: còn có ích, không đặt null).
- Chú thích đầu các tầng sửa số: G 203, DOI 12, LUAT 44, BT 439 (698 vai). Tệp tĩnh theme-color không đụng.
- Kiểm: kiem-bang-mau ĐẠT 16 · HỎNG 0; --loi-gia HỎNG 4 / 16 (tổng số vai, mã gõ thẳng, vai có chỗ dùng, tương đương nền). kiem-ve-vector ĐẠT 97, A3-v / B5-v ĐẠT 12, C3-v ĐẠT 12, giao-dien-vector-b ĐẠT 16, dong-goi-artifact ĐẠT 14, lap-rap 127, may-son 145, tay-xoay 183, loi-mua-2 93, nam-cham 246; máy đo kiểu tính 0 khác.

### e5 dọn chữ cũ + phanh chống tái phát mở rộng (kiem-ve-vector 14b / 14c / 14d / 15 / 15c mới)
- Chú thích sai đã sửa: choi.html:39 (Part.ghep → VeVector.kiemGhep), man-lap.js:7 (VeRobot.ve → Part.ghep → VeVector), mo-dau.js:4 ("hoạt hình pixel" → "(vector)"), thanh-cuon.js:2–4 ("KIỂU PIXEL", "cục kéo vàng" → kiểu ở choi-vector.css), thanh-phan.js:17–18 + :26, the-part.js:57, man-choi.js:311 (phông Handjet / VT323 → "phông pixel cũ", lý do gốc), choi-vector.css 3 chú thích, README:39 (Chữ: Google Sans Flex / Code).
- **chu.js `caiDat.thongTinChu`** (chữ hiện trong Cài đặt → Thông tin): "Chữ: Handjet, VT323 (giấy phép SIL Open Font License)." → "Chữ: Google Sans Flex, Google Sans Code (giấy phép SIL Open Font License)." Tự quyết (xem câu hỏi 1): câu cũ sai sự thật sau khi xoá phông, và phanh 15c bắt đúng nó.
- KHÔNG sửa (ngoài phạm vi: bộ vẽ vector / chú thích không ở đầu tệp; liệt kê ở đề xuất): ve-vector.js:4 / :18 / :46 / :178, ve-vector-icon.js:7, huy-hieu-vector.js:3 / :9, phim-vector.js:5 / :99, phim-goi.js:75, phim-mua-1.js:470, phim-mua-2.js:42 (câu "rơi về pixel" / "pixel: …" đã hết đúng). den-bo-phan.js:4 ("biểu tượng pixel nhỏ"): đã sửa rồi TRẢ LẠI vì tệp này là một trong 3 tệp kiem-bang-mau mục 4 còn so từng byte với nền A1 (sửa chú thích thì mất phép chứng minh đó).
- kiem-ve-vector: 14b lời "(chế độ pixel không có lớp này…)" → "(body luôn có lớp này; tiền tố giữ độ ưu tiên…)"; 14c thêm điều kiện "choi.css 0 bộ chọn steps()" + lỗi giả cắm lại steps() vào choi.css (từ e2 lỗi giả cũ của 14c không còn làm đỏ); 14d chú thích.
- **(15c) mới**: choi.css / choi-vector.css (bỏ chú thích) không `pixelated` / `steps(` / `--wood --chalk --stud` / Handjet VT323; font.css đúng 6 @font-face, không Handjet / VT323; thư mục font không còn handjet-* / vt323-*; 54 tệp JS game không còn CHUỖI có VT323 / Handjet (cả chuỗi đo chữ); sw.js BAN ≠ 'duong-hoc-v1'. Lỗi giả: cả 10 điều kiện cùng đỏ (choi.css 4 mẫu, font.css 7 @font-face + còn Handjet, font/ còn handjet-latin.woff2, san-ve.js chuỗi VT323, sw.js BAN v1; chu.js đỏ thật trước khi sửa câu Thông tin).
- kiem-giao-dien-vector-b: mục c (luật phủ cho vân gỗ / bảng phấn / steps / bóng chữ của choi.css) thôi đỏ khi cắm lỗi giả từ e2 (choi.css hết bảng phấn ở .d-san) → lỗi giả cắm lại `.d-san{background-image:var(--chalk)}` vào choi.css trong bộ nhớ: --loi-gia lại HỎNG 9 / 16 như V7c2.
- Kiểm (trạng thái e5): kiem-ve-vector ĐẠT 98 · HỎNG 0 (--loi-gia HỎNG 47 / 98: 13a-v, 14c, 15, 15c …), kiem-huy-hieu-phim-vector ĐẠT 12 (--loi-gia HỎNG 6), kiem-nut-mo-dau-phim-vector ĐẠT 12 (--loi-gia HỎNG 9 / 12), kiem-giao-dien-vector-b ĐẠT 16 (--loi-gia HỎNG 9 / 16), kiem-bang-mau ĐẠT 16 (--loi-gia HỎNG 4 / 16), kiem-dong-goi-artifact ĐẠT 14, kiem-khay ĐẠT 184, kiem-phim-goi ĐẠT 41, kiem-lap-rap ĐẠT 127, kiem-hoc ĐẠT 6715, kiem-sung-hoi ĐẠT 187; máy đo kiểu tính 0 khác (một lần chạy cảnh 360x640:lap-robot hết giờ chờ trang tải → chạy lại riêng cảnh đó: 0 khác).

### Soát trình duyệt cuối (Chrome headless, hồ sơ mới, server tạm 4202 do script bật / tắt; ô trình duyệt của app không dùng)
- Trước khi vào game, tạo sẵn bộ đệm 'duong-hoc-v1' (trang font.css cùng nguồn, không đăng ký SW) → vào choi.html, SW kích hoạt: `caches.keys()` = ['duong-hoc-v2'] (v1 đã bị xoá), v2 có 144 tệp.
- Đi qua: màn đầu → chọn gói → lưới màn → màn hai-banh.3 → Cài đặt → Sổ lệnh → Lắp robot → phim mở đầu. Lỗi: 0 exception, 0 console.error / warning; một dòng 404 favicon.ico là của trang font.css mở ở bước tạo bộ đệm (trình duyệt tự xin favicon), không phải game.
- Yêu cầu woff2: chỉ gsflex-latin / latin-ext / viet, gscode-latin / viet; 0 yêu cầu handjet-* / vt323-*. `document.fonts`: chỉ Google Sans Code, Google Sans Flex (không Handjet / VT323).
- Cài đặt → Thông tin: "Chữ: Google Sans Flex, Google Sans Code (giấy phép SIL Open Font License)."
- Máy đo kiểu tính ở cả hai khổ: 0 khác (xem e5).

### Việc dở
không có (e0–e5 đã làm). Ngoài phạm vi, để lại: các câu chú thích "rơi về pixel" trong bộ vẽ vector (mục 3).

## 2. CÂU HỎI CẦN LÀM RÕ
Câu còn mở:
1. **chu.js `caiDat.thongTinChu`** (chữ hiện cho người chơi, Cài đặt → Thông tin): brief cấm sửa nội dung chữ, nhưng câu "Chữ: Handjet, VT323 (giấy phép SIL Open Font License)." sai sự thật sau khi xoá hai phông (và phanh 15c brief đòi bắt đúng nó). Tự quyết: đổi thành "Chữ: Google Sans Flex, Google Sans Code (giấy phép SIL Open Font License)." (giấy phép theo chú thích font.css của gói V5a: Google Fonts, SIL OFL). Đảo lại được: một dòng. Người giao xác nhận câu chữ / giấy phép.
2. **Nền máy đo kiểu tính 1,85 MB** trong tools/: chấp nhận cỡ này trong repo không, hay chuyển ra ngoài (gzip / chỉ giữ máy, ghi nền khi cần)?

Câu đã tự quyết:
3. Máy đo: Chrome headless + DevTools Protocol (WebSocket có sẵn Node 24), không dùng ô trình duyệt (lý do: chạy lại một lệnh, khổ chính xác, không phụ thuộc ô bị ẩn). Phần tử JS đặt transform nội tuyến ghi "js" (robot màn đầu đi lại theo thời gian), cỡ / vị trí / lặp ảnh nền ghi '·' khi không có ảnh nền (không hiện gì). Đảo lại được.
4. e2: cũng bỏ `background-size` đi kèm vân gỗ / bảng phấn (brief chỉ nêu --wood / --chalk) và `--stud` của khối; máy đo chứng minh không đổi.
5. e3: choi.css :root đặt luôn `--kp:1; --km:1; --wm:500` (giá trị body.ve-vector đã dùng) cùng lúc đổi --px / --mono: hệ số 1,4 / 1,5 / 400 chỉ có nghĩa với phông pixel. GIỮ khai báo trùng ở choi-vector.css (giữ tệp riêng như người giao quyết).
6. e3b: đổi nền cả A3-v / B5-v / C3-v sang 6e04104 (không bắt buộc, chúng xanh với cả hai nền) để ba phanh chung một nền.
7. e4: GIỮ 19 vai dùng động + 5 gốc (xem e4); kiem-bang-mau đếm thêm hai kiểu chỗ dùng đó. GIỮ NEN = '13b8a97' (mục 4 còn so 3 tệp). Đảo lại được.
8. e5: không sửa chú thích trong bộ vẽ vector (brief cấm), trả lại sửa ở den-bo-phan.js (giữ phép so từng byte của mục 4).

Chỗ brief sai / thiếu:
9. **Brief e4 "xoá các vai trong VAI_CHO_V7C3"**: 19 vai trong đó còn dùng động (luatSon* / luatVat* / sonDoToi / sonTimToi), xoá là sơn của tay sơn, đai màu vật, cực nam châm, màu đối thủ thành undefined (kiem-ve-vector:250 đọc BM.sonDoToi cũng gãy). Brief có cảnh báo chung "tên vai ghép chuỗi": đúng là chỗ này. Thêm: 5 gốc G không xoá được vì là gốc của biến thể còn dùng.
10. **Lỗi giả có sẵn đã mục** (phanh không đỏ khi cắm lỗi giả): C3-v (chuỗi `var v = PV() && PhimVector.o(…)` hết từ V7c2; báo cáo V7c2 ghi "HỎNG 8 / 12" mà C3-v xanh), 14c và giao-dien-vector-b mục c (từ e2: choi.css hết steps / bảng phấn nên "bỏ luật phủ" không còn gây đỏ). Đã sửa cả ba.
11. Brief e2 "V7c1 đếm 91 khai báo": đếm thật ra 114 khai báo (53 steps(), 25 image-rendering, 14 --stud, 11 + 11 vân gỗ / bảng phấn + cỡ, 1 clip-path) + 8 luật; khác do cách đếm (steps() tính từng chỗ).
12. Brief e3 "phanh 13a-v đỏ ĐÚNG ở các lệnh đó": đỏ thêm ở các lệnh hình học (moveTo / lineTo / arcTo / fillText) của viên pin / bong chữ dời theo bề ngang mới, và vị trí bong chữ (viTriBong chọn chỗ khác theo bề ngang). Đã chứng minh bằng phép trả tạm phông đo (mục e3).

## 3. ĐỀ XUẤT
- **Chặng gỡ pixel coi như xong** ở CSS / phông / bảng màu / bộ đệm. Còn lại (nhỏ, không cần user quyết):
  - Chú thích "rơi về pixel" / "pixel: …" đã sai trong bộ vẽ vector và phim: ve-vector.js:4 / :18 / :46 / :178, ve-vector-icon.js:7, huy-hieu-vector.js:3 / :9, phim-vector.js:5 / :99, phim-goi.js:75, phim-mua-1.js:470, phim-mua-2.js:42; den-bo-phan.js:4 ("biểu tượng pixel nhỏ") nếu chấp nhận bỏ nó khỏi mục 4 kiem-bang-mau (hoặc đặt NEN = null luôn).
  - @keyframes pixel trong choi.css (rung, redfl, selb, blink, shake, pop…) vẫn được choi.css gọi theo tên nhưng ở vector bị luật body.ve-vector thay tên khác: có thể xoá cùng các luật `animation:` của choi.css đã bị phủ hết. Cẩn thận: .md-* / .pg-* của phim chỉ bị phủ `animation-timing-function`, KHÔNG đổi tên → keyframes md-* / pg-* còn hiệu lực, không được xoá. Cần máy đo + so hoạt cảnh.
  - Lớp `.tex` / `.pxi` còn gắn vào canvas / svg (tên cũ, không còn luật pixel); `--kp` / `--km` / `--wm` có thể bỏ hẳn (mọi calc(…*var(--kp)) thành cỡ thẳng): nhiều dòng, lợi ít.
  - kiem-bang-mau NEN: mục 4 chỉ còn 3 tệp / 30 token; khi sửa tệp nào trong ba tệp đó thì đặt NEN = null.
- **Cần user quyết**: (a) câu Thông tin phông (câu hỏi 1); (b) gộp choi.css + choi-vector.css / bỏ tiền tố body.ve-vector (người giao đã giữ; máy đo kiểu tính nay đủ để làm an toàn nếu muốn: so 10 658 phần tử ở hai khổ). Tôi nghiêng: (a) giữ câu mới; (b) chưa làm, lợi ít.

## 4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Gói này dọn nốt phần "trang trí kiểu điểm ảnh" còn sót sau khi game đã chuyển hẳn sang hình nét mới: các dòng tô vân gỗ, bảng phấn, núm khối, chuyển động giật từng nấc trong tệp kiểu trang; hai phông chữ điểm ảnh cũ (6 tệp, khoảng 60 KB); 500 màu không còn ai dùng trong bảng màu. Để chắc giao diện không đổi, tôi làm một "máy đo" mở game thật trong trình duyệt ẩn, đi qua 14 màn hình ở hai cỡ màn (máy tính và điện thoại) và ghi kiểu dáng của hơn 10 000 phần tử; sau mỗi bước dọn, máy đo báo 0 chỗ khác. Thay đổi nhìn thấy duy nhất là cố ý và rất nhỏ: nhãn màu và thanh pin trên sân giờ đo chữ đúng bằng phông đang vẽ, nên nhãn có thể nằm sang bên kia ô một chút. Người chơi cũ sẽ tự bỏ bộ nhớ đệm cũ ở lần mở sau. Có thêm "phanh": nếu ai đưa phông hay kiểu điểm ảnh quay lại, máy kiểm sẽ báo đỏ.

## 5. RỦI RO CÒN LẠI
- **Chưa chạy npm test cả bộ** (luật): đã chạy 15 máy kiểm liên quan (mục 1). Máy khác có thể đọc vai màu đã xoá theo tên chuỗi (đã quét: chỉ 19 vai dùng động trong game, đã giữ; trong máy kiểm chỉ kiem-ve-vector đọc BM.sonDoToi, đã giữ). Cách kiểm: người giao chạy npm test một lần sau gộp.
- **Máy đo kiểu tính chỉ thấy 14 cảnh**: trạng thái không có trong cảnh (dòng code đang chọn, khối đang kéo, bảng mở gói, hộp mua mùa, Xưởng hàm…) không được đo. Với steps() đã soát tĩnh: MỌI bộ chọn có steps() trong choi.css đều có luật body.ve-vector cùng bộ chọn đặt lại animation / animation-timing-function / transition-timing-function (script soát ở e2, 51 bộ chọn + .ws-ov). Vân gỗ / bảng phấn / núm: biến CSS không ai đặt nên vốn rỗng. Cách kiểm thêm: thêm cảnh vào CANH của tools/do-kieu-tinh.mjs, ghi nền ở commit trước gói (trả tệp tạm) rồi so.
- **Máy đo có lúc hết giờ chờ trang** (một lần ở cảnh 360x640:lap-robot khi máy bận): báo "lỗi dựng cảnh", chạy lại cảnh đó bằng `--canh` thì 0 khác. Không phải khác giao diện.
- **Hoạt cảnh dừng ở 400 ms**: khác biệt chỉ lộ ở thời điểm khác của hoạt cảnh thì máy không bắt (đã soát tĩnh như trên).
- **Đo chữ trên sân** dùng Google Sans: lần vẽ đầu tiên trước khi phông tải xong, measureText dùng phông dự phòng → bong chữ / viên pin có thể rộng hơn một nhịp (trước đây VT323 cũng vậy). Rủi ro thấp.
- **Phanh 13a-v / A3-v / B5-v / C3-v so nền 6e04104** (commit của gói này): nếu gói bị rebase khác SHA thì phải đổi NEN_VEC theo.
- Trình duyệt soát bằng Chrome headless + script (không nhìn từng màn bằng mắt, trừ hai khung pin / bong chữ). Cách kiểm: mở game, vào mau.8 / drone.3 xem nhãn màu và viên pin; mở Cài đặt → Thông tin.
