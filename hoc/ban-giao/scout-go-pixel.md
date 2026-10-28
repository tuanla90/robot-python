# Scout gỡ pixel (V7b / V7c) — ghi dần

Chỗ đọc: worktree tay-gap-xoay-comparison-00c53c, HEAD 260eee8. Chỉ đọc.

## Nhật ký
- Bắt đầu. hoc/game: ve.js 868, san-ve.js 2865, thanh-phan.js 2663, choi.css 1187, choi-vector.css 530, giao-dien-vector-b.css 310, ve-vector.js 405, ve-vector-icon.js 349, huy-hieu.js 855.

## Phát hiện 1: công tắc + thứ tự nạp (đọc code)
- hoc/game/ve-vector.js:43-49 doCheDo: ?ve=vector → true; ?ve=pixel → false; localStorage 'duong-hoc:ve-vector' === 'vector' → true; còn lại false (cả Node: không location/localStorage).
  :51 bat() tính MỘT lần rồi nhớ (cheDo); :52 datCheDo chỉ cho máy kiểm; :54 luuCheDo('vector') ghi 'vector', khác thì removeItem (KHÔNG ghi 'pixel').
  => Đổi mặc định V7b: cần luuCheDo('pixel') GHI 'pixel' (không removeItem), doCheDo: 'pixel' → false, còn lại (null, 'vector') → true. Người chơi cũ đã chọn pixel trước V7b: hiện removeItem nên KHÔNG phân biệt được "chưa chọn" với "đã chọn pixel" → sau V7b họ sẽ thành vector (chấp nhận được, vì user muốn chuyển hẳn; nêu cho user).
  :396 apGiaoDien() chạy NGAY khi nạp tệp (thêm body.ve-vector).
- hoc/game/choi.html: CSS choi.css(:16) → choi-vector.css(:18) → giao-dien-vector-b.css(:20) đều nạp ở <head>, áp theo lớp body.ve-vector.
  Script trước ve-vector.js (:135): lõi ../*.js (:33-111), chu.js(:113), ve.js(:114), part/*.js(:116-133). Các tệp này CHỈ khai hàm, đọc chế độ lúc GỌI (lười) — xác nhận ở phát hiện 2. Sau ve-vector.js: ve-vector-icon.js(:137) và mọi tệp dựng màn hình.
  Khung đầu tiên trước khi script chạy: body KHÔNG có lớp ve-vector → nếu có nháy giao diện pixel trước khi script nạp (thường không thấy vì các .screen đều hidden lúc đầu: choi.html:24-28).
- hoc/game/sw.js:11 BAN='duong-hoc-v1', :50-65 MẠNG TRƯỚC (network-first), hẹn 4 s rồi mới lấy bộ đệm. => KHÔNG bắt buộc đổi tên BAN để người chơi cũ nhận bản mới (có mạng là nhận). Đổi BAN chỉ để dọn tệp cũ (part/*.js, choi.css bị gỡ ở V7c vẫn nằm trong bộ đệm cũ; activate :38-41 xoá bộ đệm khác tên). Đề xuất: đổi 'duong-hoc-v2' ở V7c (khi danh sách tệp thay đổi lớn), V7b không cần.
- theme-color choi.html:7 '#2a1d14' (nâu tối kiểu pixel). Xem manifest ở phát hiện sau.

## Phát hiện 2: VeRobot (hoc/game/ve-robot.js, 352 dòng) là chỗ rẽ nhánh robot chính
- :152 cheDoVector(), :154 veVector(cfg) = bat() && coDu(cfg). Rẽ nhánh ở: :160 tiLeChoO, :258 ve(), :279 veCo, :288 heSoCss, :296 bongTay (pixel only), :317 vatKep, :327 vatXoay, :340 hinhHoc (HH_PIXEL :339), :342 reachCua, :349 REACH getter.
- Pixel-only trong tệp: veTamTay/xoay (:92-130, hình tạm dùng Ve.makeRobot), veGhep (:186-218), beNgangThan (:138-147 đo Painter), bongTay (:293-312 getImageData), REACH=26, DEM/TAM_THAN pixel, nhánh pixel của vatKep/vatXoay (:318-320, :328-334 đọc Part.lay(...).oGan.tay.y, U_VAT).
- LOGIC dùng chung còn nằm ở đây: cauHinhCua (:64-74), chuanTay (:76-84), TAY_THEO_LENH (:52-56), sonChon/sonHieuLuc (:167-184) — sonChon đọc Part.SON + Part.DS_SON (dữ liệu nằm trong part/part.js:10-21!).
- Fallback hiện tại: vector ném lỗi (kiemGhep) → veVec trả null → veGhep pixel → hình tạm. Sau V7c phải đổi fallback: hình tạm vector hoặc null có kiểm.

## Phát hiện 3: part/part.js chứa DỮ LIỆU LOGIC, không chỉ hình
- part.js:10-21 SON (bộ ba màu sơn), DS_SON (tên + saoCan 0/60/150/300/450 mở khoá sơn) — dùng ở cai-dat.js:50, ve-robot.js:167-176, huy-hieu.js:600/617/685/708.
- part.js:76-79 ghep() = LUẬT GHÉP (drone + camera cấm…); ve-vector.js:246-267 kiemGhep là bản sao cùng câu báo. lap-rap.js:146-149 kiemGhep gọi part.ghep (trình duyệt window.Part, Node tự nạp game/part :92-102) để xét lại.
- part.js:88 hamGoc(cfg) + mỗi part-*.js khai hamGoc (lệnh gốc mở ra): dùng ở kiem-lap-rap.mjs:49,68, kiem-camera-drone.mjs:210-211. Trong game: grep không thấy runtime gọi Part.hamGoc ngoài máy kiểm (lap-rap.js DANH_MUC giữ `ham` riêng).
- part-*.js khai ten (tên tiếng Việt dùng trong câu lỗi 'Drone không gắn được ' + tay.ten), oGan (ổ), gan, diemNeo, U_VAT (part-tay-xoay.js:10).
  => V7c KHÔNG xoá thẳng part/: phải chuyển SON/DS_SON sang tệp logic (vd bang-mau.js hay tệp mới son.js), hamGoc sang lap-rap.js/gioi-thieu-part.js, luật ghép giữ một bản (VeVector.kiemGhep), lap-rap.js đổi P() sang VeVector (Node: require ve-vector.js + ve-vector-than-*/tay-*/cam.js).

## Phát hiện 4: các CẦU TẠM (đọc code)
| # | Cầu | Chỗ | Làm gì | Ai dựa vào | Gỡ thì thay bằng |
|---|---|---|---|---|---|
| C1 | MutationObserver #stage | ve-vector-icon.js:330-340 batDau(), gọi ở :346 khi nạp | canvas.pxi có nhãn _vi (Ve.ico/sao/khoa/mui/hydrate, ve.js:829-850) trong PHAM_VI (:16) hoặc PHAM_VI_CHOI (:17) → thayMot (:237-249) đổi sang <svg> taoSvg | mọi màn | ve.js ico/sao/khoa/mui/hydrate (+ nhan(mk(spriteTrum…)) ở hydrate 'trum') ở vector trả THẲNG svg qua VeIcon.taoSvg + lớp `vi vi-<tên>` + phuCua; phải giữ y lớp người gọi thêm (.pxi + lớp riêng) và cỡ style width/height như Ve.mk. VeIcon phải nạp TRƯỚC ve.js hay ve.js gọi lười window.VeIcon (đang nạp sau: choi.html:114 vs :137 — gọi lúc dựng màn nên lười là đủ). |
| C2 | noiVe | ve-vector-icon.js:227-234 | canvas cũ bị gỡ nhưng người gọi còn giữ (den-bo-phan.js bật/tắt cv.style.display; thanh-phan.js thêm lớp) → đổi style/classList/className của canvas cũ sang svg | den-bo-phan.js, thanh-phan.js | Hết cần khi C1 trả svg thẳng (người gọi giữ đúng phần tử đang hiện). Kiểm: các chỗ gọi .getContext trên kết quả Ve.ico (svg không có getContext) — xem phát hiện 5. |
| C3 | móc Part._veMot + CanvasRenderingContext2D.prototype.drawImage TOÀN CỤC | ve-vector-icon.js:281-298 noiPart() | đánh dấu _partVi lên canvas bộ phận, dấu lan qua drawImage; .laVector lan sang bản chép lần vẽ đầu | thanh-phan.js:1843-1848 hinhPart (Part._veMot → cắt lề → Ve.mk) ở tiêu đề thẻ khay .co-part; the-part.js / mo-dau.js cắt lề robot vector | thanh-phan.js hinhPart ở vector gọi thẳng VeIcon.hinhPartVec({loai, ma}) (đã có :262-279); mo-dau.js:53-54 đã tự đặt cl.laVector; the-part.js cần soát (dùng catLe + Ve.mk?). Gỡ móc drawImage là việc RỦI RO NHẤT của V7b (ảnh hưởng mọi drawImage). |
| C4 | bọc Ve.mk / Ve.hydrate | huy-hieu.js:814-832 (chỉ khi cheDoVec() lúc nạp tệp) | Ve.mk(cv có .huyHieu) → HuyHieu.mk vector; hydrate điền trước [data-i=huyhieu] | mọi chỗ Ve.mk(HuyHieu.ve(...)) vd phim-mua-1.js:424, ve.js:847 hydrate 'huyhieu' | ve.js:847 gọi HuyHieu.mk(ma, tt, s) thẳng; người gọi Ve.mk(HuyHieu.ve(m,'xong'),1) đổi sang HuyHieu.mk(m,'xong',1). huy-hieu.js là tệp gói 10 đang THÊM HINH → V7b đụng cùng tệp (chỉ khối :785-832). |
| C5 | PHAM_VI + PHAM_VI_CHOI | ve-vector-icon.js:16-17, trongPhamVi :224 | giới hạn chỗ thay | kiem-giao-dien-vector-b.mjs mục d (luật cũ "PHAM_VI không chứa #sc-choi", KE-HOACH-GOP-DIEM10CODE.md:142) | Khi C1 bỏ thì PHAM_VI chỉ còn cho datTitle (:301-306, title cho nút chỉ icon) — chuyển datTitle vào chỗ dựng nút hay giữ một quét nhỏ; gộp thành một hằng '#stage'. |
| C6 | Ve.mk phongVec | ve.js:811-826 | ở body.ve-vector phóng sẵn canvas điểm ảnh (không pixelated) | mọi Ve.mk của canvas điểm ảnh còn lại | V7c: không còn canvas điểm ảnh → bỏ. |
| C7 | HuyHieu.ve/mk rơi về vePixel | huy-hieu.js:807-811 | mã chưa có vector → pixel | gói 10 thêm 2 mã mới | V7a đang làm đủ vector + máy kiểm liệt kê từ HINH. V7c: HINH pixel là NGUỒN danh sách mã (window.HuyHieu.DS = Object.keys(HINH) :853) → phải tách danh sách mã + bí danh (:834-852 doi-* = hai-robot) ra trước khi xoá hình pixel. |
| C8 | thanh-phan.js veMuot / ung-dung.js:264 phông | thanh-phan.js:462, ung-dung.js:264 đọc body.classList 've-vector' | chọn phông Google Sans vs Handjet/VT323 | | V7c: hằng vector. |

## Phát hiện 5: máy kiểm đọc VĂN BẢN huy-hieu.js + bảng màu sẽ thừa vai
- 26 máy kiểm (grep -l "huy-hieu.js" kiem-*.mjs | xargs grep -l HINH → 26) đọc chữ huy-hieu.js và tìm `HINH['<mã>'] = function` (vd kiem-be-sung.mjs:277, kiem-doi-mua-2.mjs:214, kiem-nut-de.mjs:55, kiem-hoc.mjs:850 includes("HINH['"+ma+"']")).
  huy-hieu.js hiện có 62 HINH = function + 20 bí danh HINH[x] = HINH[y] (node đếm regex). => V7c gỡ hình pixel huy hiệu thì 26 máy kiểm đỏ, trừ khi giữ một bảng HINH (danh sách mã) hoặc sửa 26 tệp đổi sang hỏi VeVector.HUY_HIEU.co(ma) / đọc huy-hieu-vector.js. Đề xuất: V7c đổi 26 máy kiểm sang một hàm chung (vd hoc/kiem-chung.mjs coHuyHieu(ma)) đọc huy-hieu-vector.js; làm MỘT commit riêng trước khi xoá.
- Bảng màu: scratchpad/dem-vai.js (node, chỉ đọc) trên HEAD 260eee8: 1196 vai; 806 vai chỉ dùng ở {ve.js, part/*, huy-hieu.js phần pixel, choi.css}; 460 vai chỉ dùng ở {ve.js, part/*, huy-hieu pixel} (không kể choi.css).
  Số vai mỗi tệp: choi.css 380 · ve.js 327 · san-ve.js 176 · huy-hieu pixel 90 · part/part.js 71 · choi-vector.css 58 · giao-dien-vector-b.css 53.
  kiem-bang-mau.mjs mục 3 "vai nào cũng có chỗ dùng" (:162) → gỡ pixel mà không xoá vai thì đỏ hàng trăm vai. V7c phải xoá ~460–800 vai khỏi bang-mau.js (cùng lúc với tệp dùng chúng), hay nới luật mục 3. Mục 4 (so từng byte nền 13b8a97) bỏ qua tệp đã xoá tự nhiên (lặp theo TEP hiện có) nhưng :201 đòi mọi khoá SUA_SAU_NEN là tệp có thật → xoá khoá của tệp đã gỡ. Mục 5 (:207-237) nạp part/ của nền VÀ part/ hiện tại (PM = nap(GAME/part)) → xoá part/ thì mục 5 phải bỏ (hay đặt NEN = null như ghi chú :12-13: "đổi màu thật (A2) thì đặt NEN = null").

## Phát hiện 6: nền tĩnh, gói Artifact, phông
- theme-color choi.html:7, manifest.webmanifest background_color / theme_color, dong-goi-artifact.py `background:#2a1d14` = vai goToiV11 (nâu gỗ). kiem-bang-mau.mjs:72-78 NGOAI_LE ghim cả 4 chỗ vào VAI_NEN_TRANG='goToiV11'. V7b đổi mặc định → nên đổi 4 chỗ sang vecNenSau '#e8e6f6' (bang-mau.js:241) và đổi VAI_NEN_TRANG trong kiem-bang-mau.mjs cùng commit (không thì mục 2 đỏ). Thanh trình duyệt điện thoại nâu trên game lavender là lỗi nhìn thấy được.
- hoc/dong-goi-artifact.py (gói Artifact): CHỈ nạp choi.css (:32-33 `css = open(choi.css)`), KHÔNG có choi-vector.css / giao-dien-vector-b.css / font/font.css; nạp Handjet + VT323 từ Google Fonts (:55). Ở Artifact localStorage có thể ném → doCheDo trả false → luôn pixel. Sau V7b (mặc định vector) bản Artifact sẽ có body.ve-vector mà THIẾU CSS vector → giao diện vỡ. => V7b phải sửa dong-goi-artifact.py: gói thêm choi-vector.css (+ b), link phông Google Sans Flex / Code (CÂU HỎI: Google Fonts có phục vụ hai họ này không; nếu không, gói woff2 dạng data: hay chấp nhận phông hệ thống). Không có máy kiểm nào chạy dong-goi-artifact.py ngoài regex nền ở kiem-bang-mau (grep -l dong-goi hoc/*.mjs: chỉ kiem-bang-mau).
- Phông: font/font.css nạp Handjet + VT323 + Google Sans Flex + Code (font-display swap). 6 tệp handjet-* / vt323-* = 60 588 byte (của 223 592). san-ve.js:694, 1450, 1683, 1831 còn `g.font = '8px VT323, monospace'` ở NHÁNH PIXEL (vector đi qua ve-vector-hieu-ung.js PHONG_CHU). sw.js:28 cất mọi woff2 trong font.css → V7c xoá @font-face Handjet / VT323 + 6 tệp.
  kiem-ve-vector.mjs mục 14d (:992-996) và kiem-gioi-thieu-part.mjs:50 nhắc Handjet (luật ngoặc) — 14d đọc choi.css, cần sửa khi gộp CSS.

## Phát hiện 7: máy kiểm giả định mặc định pixel / so pixel (V7b đổi mặc định, V7c gỡ)
Đếm: vm / Node nạp ve-vector.js ở các máy: kiem-ve-vector, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau-phim-vector, kiem-giao-dien-vector-b (grep "ve-vector": 29 / 2 / 13 / 23). Các máy nạp ve-robot.js mà KHÔNG nạp ve-vector.js (kiem-loi-mua-2:317, kiem-tay-xoay:354, kiem-camera-drone:216) → VeRobot.VV() null → luôn pixel: KHÔNG đổi ở V7b, nhưng ĐỎ ở V7c nếu gỡ nhánh pixel của VeRobot / Part.
| Máy kiểm · mục | Giả định | V7b (đổi mặc định) | V7c (gỡ pixel) |
|---|---|---|---|
| kiem-ve-vector 8 (:270) | `V.bat() === false` khi không ?ve / lưu | ĐỎ: đổi thành "mặc định VECTOR; ?ve=pixel hay lưu 'pixel' → false" | bỏ công tắc → mục thành "bat() luôn true" hay bỏ |
| kiem-ve-vector 9 (:278-297) | datCheDo('pixel') → REACH 26, vatKep {18,10}, HH_PIXEL | không đổi (đặt chế độ tường minh) | đổi: chỉ còn kiểm nhánh vector (đã có) |
| kiem-ve-vector 13a (:716-733) | harness location.search '' = pixel (:638 `cheDo === 'vector' ? '?ve=vector' : ''`), so với nền a962f7b | ĐỎ (bản mới với '' thành vector) → harness đặt '?ve=pixel' (nền a962f7b cũng hiểu ?ve=pixel: git show a962f7b:hoc/game/ve-vector.js có 2 chỗ ve=pixel) | bỏ 13a; phanh thay: "phát lại vector khớp nền <SHA cuối V7b>" (cùng harness, cheDo 'vector', so luồng lệnh với commit nền) — canary: lỗi giả đổi một lệnh vẽ HU → đỏ |
| kiem-ve-vector 12 (:401-560) | liệt kê thân / tay / cảm biến TỪ part/*.js, kiemGhep ném đúng khi Part.ghep ném, CÙNG câu | không đổi | đổi nguồn liệt kê sang danh sách logic (lap-rap.js DANH_MUC / gioi-thieu-part.js) + bảng câu lỗi chốt cứng (chụp từ Part.ghep trước khi xoá: ghi thành tệp dữ liệu kiểm) |
| kiem-ve-vector 10 (:300) | ô pixel = khoá Ve.tiles() đọc nguồn ve.js; hàm Ve.make* trong san-ve.js | không đổi | đổi: liệt kê từ SanHoc.docSan + KY_HIEU (bỏ vế Ve.tiles / Ve.make*) |
| kiem-ve-vector 14b/14d (:972-996) | choi-vector.css mọi bộ chọn body.ve-vector; choi.css chỉ gõ phông qua --px | gộp b vào choi-vector: 14b vẫn đúng nếu giữ tiền tố | nếu bỏ tiền tố body.ve-vector: viết lại 14b |
| kiem-ve-vector 14f (:1016-1035) | luuCheDo('pixel') XOÁ khoá (`ra === null`), nguồn có `getItem(KHOA_LUU) === 'vector'` | ĐỎ nếu đổi luuCheDo ghi 'pixel' → sửa mong đợi (ra === 'pixel') | bỏ cùng công tắc |
| kiem-huy-hieu-phim-vector A1–A4, B5 (:121 harness '' = pixel; NEN fa3702f) | hai chế độ; A3 vePixel = nền từng điểm ảnh; B5 DOM phim pixel = nền | harness '' → '?ve=pixel' | A3, B5 bỏ; A2 (vector không gọi Part.*) thành "Part không tồn tại"; thay phanh: "phim vector khớp nền <SHA V7b>" (cây DOM + lệnh vẽ) |
| kiem-nut-mo-dau-phim-vector C (:107 harness; NEN 4ac900f) | pixel 6 khung mở đầu y như nền | harness '?ve=pixel' | bỏ vế pixel; giữ vế vector "0 Painter / Ve.tiles"; B (MutationObserver thay icon trong DOM giả) PHẢI viết lại khi C1 gỡ (kiểm Ve.ico trả svg thẳng) |
| kiem-giao-dien-vector-b d (:170-172) | PHAM_VI KHÔNG gồm #sc-choi (luật cũ, đã sai từ V6c) | sửa ngay ở V7b khi gộp PHAM_VI | — |
| kiem-giao-dien-vector-b i (:227) | Cài đặt pixel CÓ mục sơn | không đổi | bỏ vế pixel |
| kiem-bang-mau 4 (NEN 13b8a97), 5 (Part buffer y hệt nền) | xem phát hiện 5 | không đổi | 5 bỏ; 4: xoá khoá SUA_SAU_NEN của tệp đã xoá; 3: xoá vai thừa |
| kiem-lap-rap (:23 LapRap.part(), :43-76 Part.lay / hamGoc / ghep 180 tổ hợp) | Part có | không đổi | đổi sang VeVector.kiemGhep + hamGoc chuyển chỗ |
| kiem-camera-drone 3 (:209-234), kiem-loi-mua-2 (:290-349), kiem-tay-xoay 7 (:345-372), kiem-may-son (:148), kiem-gioi-thieu-part, kiem-sung-hoi, kiem-flycam, kiem-doi-thu-manh (grep Part/part-: 11/14/7/3/9/2/2/1 dòng) | ảnh part pixel, thứ tự nạp part-*.js trong choi.html, pixel vatXoay (n 10 / 9) | không đổi | mỗi tệp sửa vế Part → VeVector (cùng ý: ổ, hamGoc, ghép được) |
| game/part/kiem-part.mjs (48 dòng Part) | toàn bộ bộ part | không đổi | xoá cùng part/ (có trong npm test? xem phát hiện sau) |
| 26 máy kiểm regex HINH['ma'] trong huy-hieu.js | phát hiện 5 | không đổi | đổi sang huy-hieu-vector.js |

## Phát hiện 8: người dùng API Ve (ve.js) ngoài ve.js — đếm grep -o "\bVe\.[a-zA-Z]+"
Ve.ico/sao/khoa/mui/hydrate/mk (API icon DOM, ~90 chỗ ở 20 tệp: thanh-phan 14, man-choi 9, man-chon 8, man-goi 8, mo-dau, phim-goi, xuong-ham, cai-dat…) → GIỮ tên API, đổi ruột trả svg vector.
LOGIC trong ve.js mà nhánh vector vẫn dùng: Ve.T = 14 (ve.js:328, san-ve.js:55 `var T = Ve.T`; phim-goi.js 4 chỗ) = HỆ TOẠ ĐỘ "pixel sân" của mọi hoạt cảnh (san-ve.js:36 "mọi hiệu ứng vẫn tính theo pixel sân (T = 14 mỗi ô)") — KHÔNG được gỡ; Ve.MAU (ve.js:750-755, tên màu lõi → màu luật; san-ve.js:937 dùng trong NHÁNH VECTOR `Ve.MAU[e.mau].vi`, bang-mau.js 4 chỗ nhắc); Ve.MAU_TEN.
Chỉ pixel: Painter, texWood/Chalk/Stud, datChatLieu (gọi ở ung-dung.js:211 → biến CSS --wood/--chalk), khungGo (ung-dung.js:221, xuong-ham.js: ốc vít + .surf/.bev trong .deco), sprite*, makeRug/Wall/…/makeRobot/makeNhen (ve-robot.js hình tạm), tiles() (san-ve, mo-dau, phim-goi nhánh pixel; ve-vector-ky-hieu.js:34-41 chỉ là BẢNG TÊN cho máy kiểm 10), makeVatNho (gọi Part.veVatNho), phongVec (C6).
the-part.js:39-44 cắt lề robot rồi Ve.mk: dựa móc drawImage (C3) để bản cắt mang .laVector → V7b phải tự đặt c.laVector như mo-dau.js:53 đã làm (nếu không: Ve.mk phóng điểm ảnh hình vector, mờ / to sai).

## Phát hiện 9: lỗi tiềm ẩn — màu sơn R1 cũ lọt vào vector (nên sửa ở V7b)
- cai-dat.js:210 ẩn hàng "Màu sơn R1" ở vector (user 28/10: R1 cố định #38BDF8). NHƯNG ve-robot.js:253 `son = sonHieuLuc(cauHinh.son)` → :180-184 `sonChon()` vẫn đọc Luu.docCaiDat().son (:167-176), và ve-vector.js:226-231 mauDoi có 'ngoc' / 'cam' / 'trang' / 'hoang-kim' → người chơi CŨ đã chọn sơn ở pixel sẽ thấy R1 vector màu ngọc / cam…, không còn chỗ đổi lại (hàng đã ẩn). Hiện ít người gặp (mặc định pixel); sau V7b ai từng chọn sơn đều gặp.
  Đề xuất V7b: sonHieuLuc ở vector bỏ qua sonChon (R1 = '' → vecDoiR1), hay xoá son trong Luu khi đổi. CÂU HỎI cho user: phần thưởng "mở khoá sơn theo sao" (DS_SON saoCan 60/150/300/450) có còn ở vector không? Hiện vector đã bỏ hẳn (ẩn hàng), V7c gỡ pixel thì phần thưởng này mất hẳn.
- gói 10 (brief-goi10.md:22) thêm huy hiệu PIXEL `tong-hop-2` + trùm mùa vào huy-hieu.js và ghi "bản vector KHÔNG làm: V7b lo" → V7b phải vẽ thêm 2 huy hiệu vector (VeVector.HUY_HIEU.dangKy). V7a làm máy kiểm "mọi mã HINH có vector" liệt kê từ HINH → sau gộp gói 10, máy V7a sẽ ĐỎ cho 2 mã đó cho tới khi V7b vẽ (người giao xếp: gộp gói 10 → V7b vẽ 2 huy hiệu đầu tiên).
- phim mùa 2 (brief-phim-mua-2.md:17,31) tạo phim-mua-2.js theo mẫu phim-mua-1 (có nhánh pixel "R1 vàng ở pixel", soát `?ve=pixel` chạy được) → V7c phải gỡ nhánh pixel của CẢ phim-mua-2.js (thêm một tệp vào danh sách).

## Phát hiện 10: Cài đặt "Biểu cảm mắt" không có tác dụng ở vector
- cai-dat.js:136-160 hangMat bật / tắt SanVe.dungMat + Luu…mat; chỉ coMatDong() (san-ve.js:2754-2758) đọc, và coMatDong chỉ dùng ở nhánh PIXEL (san-ve.js:1240 `spr.laPart && !spr.laVector && coMatDong()`, man-dau.js:115 `!cv.laVector`). Nhánh vector bieuCam (san-ve.js:1319-1344) không đọc cài đặt này → ở vector nút "Biểu cảm mắt" bấm không đổi gì. V7b: cho bieuCam trả 'thuong' khi !coMatDong() (giữ hàng), hoặc ẩn hàng ở vector (hỏi user).

## Phát hiện 11: bản đồ PIXEL-ONLY vs LOGIC (mục 4 của brief)
Gỡ được NGAY ở V7c (chỉ vẽ pixel, không ai ngoài pixel đọc):
- ve.js: Painter (:14-60), rot90, rng, tex* (:65-91), datChatLieu (:92-117, đặt --wood/--chalk… cho choi.css), tamGiac/vong/HINH icon pixel (:118-211), sprite* (:212-327), makeRug…makeNhen (:329-748), makeMatMau/CrateMau (:757-784), makeVatNho (:787-795), tiles() (:798-809), phongVec (:823-826), khungGo (:853-861, ốc vít + .surf/.bev).
- part/*.js phần HÌNH (mọi ve(p, s) vẽ Painter), part/xem-part.html, part/kiem-part.mjs.
- ve-robot.js: veTamTay/xoay/ctxMoi (:87-130), DEM/TAM_THAN/REACH 26 (:133-134), beNgangThan (:137-147), coPart / dungPart / ?part=0 (:148, :347), veGhep (:186-218), bongTay (:290-312), HH_PIXEL (:339), nhánh pixel của tiLeChoO / vatKep / vatXoay / reachCua / REACH.
- san-ve.js: mọi nhánh `else` của 69 chỗ `this.vec` (grep -c 'fillRect|strokeRect|Ve.tiles|Ve.make|TL.|VT323|Ve.veCua|bongTay|veMatTam' = 171 dòng; ước 600–900 / 2865 dòng), coMatDong / veMatTam mắt LED pixel (:2754-2860), ảnh nhỏ thuSan pixel (nhánh không vecT :2643), datDoPhanGiai(0).
- huy-hieu.js: vePixel + mọi HINH[ma] = function (Painter, Part._veMot, Part.ghep, Part.SON) :1-783; cầu bọc :814-832.
- mo-dau.js:53-60, phim-goi.js:44-60,75-77, phim-mua-1.js:29-40 (VEC false), phim-mua-2.js (sắp có): nhánh rơi về Ve.tiles / Ve.mk pixel.
- man-dau.js:115 mắt pixel; thanh-phan.js:462 veMuot (luôn true), ung-dung.js:264 (luôn Google Sans), :211 datChatLieu, :221 khungGo; xuong-ham.js khungGo.
- font: @font-face Handjet / VT323 + 6 woff2 (60 588 byte); dong-goi-artifact.py:55 link Handjet / VT323.
- bang-mau.js: ~460 vai chỉ ve.js / part / huy-hieu pixel dùng (+ tới ~800 nếu bỏ cả phần trang trí choi.css).
- icon app hoc/game/icon/*.png vẽ từ robot pixel (tools/ve-icon.py:1-2) — CÂU HỎI: vẽ lại icon vector hay giữ.

LOGIC đang nằm trong tệp pixel — PHẢI TÁCH TRƯỚC khi xoá:
| Logic | Đang ở | Ai dùng | Chuyển tới |
|---|---|---|---|
| Ve.T = 14 (hệ "pixel sân" của mọi hoạt cảnh, kể cả vector) | ve.js:328 | san-ve.js:55, phim-goi.js (4) | giữ trong ve.js thu gọn (hay SanVe.T) — KHÔNG đổi giá trị: vết phát lại / hiệu ứng tính theo 14 |
| Ve.MAU / MAU_TEN (tên màu lõi red/green/blue/yellow → bộ màu, có .vi) | ve.js:750-756 | san-ve.js:937 nhánh VECTOR, 10 chỗ san-ve | bang-mau.js hay ve.js thu gọn |
| Luật ghép (drone + camera…, câu báo) | part.js:76-79 ghep | lap-rap.js:146-149 kiemGhep (Node + trình duyệt), kiem-lap-rap 180 tổ hợp | VeVector.kiemGhep (ve-vector.js:246-267, đã y câu); lap-rap.js P() đổi sang VeVector (Node: require ve-vector.js + các ve-vector-than/tay/cam.js) |
| hamGoc của từng bộ phận | part-*.js hamGoc, part.js:88 | kiem-lap-rap :49,:68; kiem-camera-drone :210-211; kiem-tay-xoay :348 | lap-rap.js DANH_MUC.ham đã có (máy kiểm so); chuyển nguồn sự thật sang lap-rap / gioi-thieu-part.js (GioiThieuPart.DS[ma].lenh đã có) |
| ten bộ phận (câu lỗi "Drone không gắn được " + tay.ten) | part-*.js ten | Part.ghep câu lỗi; VeVector có ten RIÊNG (vd 'Tay kẹp trước mũi') → câu lỗi vector đang lấy ten vector | kiem-ve-vector 12 kiểm "CÙNG câu báo" nên ten hai bên đang khớp ở chỗ dùng; giữ ten vector |
| SON / DS_SON (bộ ba màu sơn, mốc sao mở khoá) | part.js:10-21 | cai-dat.js:50 (có bản dự phòng cứng!), ve-robot.js sonChon :167-176, huy-hieu pixel | nếu giữ phần thưởng sơn (CÂU HỎI): bảng sang bang-mau.js / luu.js; không giữ: xoá cùng hàng sơn |
| oGan.tay.y, U_VAT | part-*.js | ve-robot.js nhánh pixel vatKep / vatXoay | chỉ pixel dùng → xoá cùng |
| HINH huy hiệu = DANH SÁCH MÃ + bí danh doi-* = hai-robot | huy-hieu.js:76-852, DS :853 | bang-mo-khoa.js:22, gioi-thieu.js:15, man-chon.js:95, man-goi.js:192, phim-mua-1.js:420 (HuyHieu.DS.indexOf), 26 máy kiểm regex | HuyHieu.DS = VeVector.HUY_HIEU.ds() + bảng bí danh; huy-hieu-vector.js đã có maVec theo bí danh (huy-hieu.js:794-799 dựa HINH[ma] === HINH[k] → phải chuyển bảng bí danh sang dạng dữ liệu) |
| cauHinhCua / chuanTay / TAY_THEO_LENH / sonHieuLuc | ve-robot.js:52-84, :180 | san-ve.js, man-lap, máy kiểm (kiem-tay-xoay, kiem-loi-mua-2, kiem-camera-drone nạp ve-robot.js trong vm) | GIỮ trong ve-robot.js (tệp còn lại sau khi gỡ nhánh pixel) |
| Hitbox / chạm ô | xuong-ham.js:530,610 theo st.rong (ô), san-ve.js theo T | — | không phụ thuộc ảnh pixel; giữ |
Lõi luật (san-hoc.js, cham.js, kho-ham.js, man-*.js): grep không thấy Ve / Part / VeRobot (chỉ lap-rap.js dùng Part) → gỡ pixel KHÔNG đụng luật.

## Phát hiện 12: CSS (scratchpad/dem-css.js, node, chỉ đọc)
- choi.css: 995 luật, 3541 khai báo; bố cục (position, kích thước, flex / grid, margin / padding, z-index, transform, cỡ chữ…) 2263; trang trí (màu, nền, bóng, viền, phông, chuyển động) 1084; biến / khác 194; khai báo pixel rõ (--wood / --chalk / pixelated / steps( / clip-path răng cưa) 91.
- 1041 bộ chọn choi.css, 600 có luật vector cùng bộ chọn (đặt lại). 614 luật vector (choi-vector + b), 0 luật không bắt đầu bằng body.ve-vector.
- Kết luận: choi.css là NỀN BỐ CỤC của cả hai chế độ (vector chỉ PHỦ), không xoá được. Gộp:
  V7b: nối giao-dien-vector-b.css vào CUỐI choi-vector.css nguyên văn (giữ thứ tự phủ: b nạp sau, cùng độ ưu tiên body.ve-vector → nối cuối là y nguyên), xoá thẻ <link> :20, sửa kiem-giao-dien-vector-b mục a / b (đọc tệp mới) và dong-goi-artifact.py. Không bỏ tiền tố body.ve-vector (bỏ là đổi độ ưu tiên: `body.ve-vector .x` (0,1,1+) thắng `.a .b` của choi.css; bỏ tiền tố có thể để luật choi.css thắng lại → vỡ ngầm).
  V7c: body LUÔN có lớp ve-vector (đặt sẵn `<body class="ve-vector">` trong choi.html → hết cả chớp khung đầu); xoá trong choi.css 91 khai báo pixel rõ + font Handjet / VT323 (--px / --mono đổi thẳng sang Google Sans), giữ bố cục. Gộp hẳn thành một tệp và bỏ tiền tố là việc dọn sau (V7d), cần so ảnh từng màn trước / sau.

## Phát hiện 13: chỗ khác cần nhớ
- the-part.js:37-48 catLe chép .laPart nhưng KHÔNG chép .laVector (đang nhờ móc drawImage C3) → V7b thêm `c.laVector = cv.laVector`. thanh-phan.js:1842-1863 hinhPart dùng Part._veMot (pixel) rồi C3 thay → V7b ở vector gọi thẳng VeIcon.hinhPartVec(bp) (ve-vector-icon.js:262-279).
- Móc drawImage (C3) chạy trên MỌI lần drawImage của mọi canvas (sân vẽ hàng nghìn lần mỗi khung) và ghi `dich._daVe = 1` → gỡ ở V7b còn là lợi hiệu năng.
- tools/kiem-tat-ca.mjs:11 quét thư mục 'hoc/game/part' (readdirSync) → xoá part/ mà không sửa thì npm test ném lỗi ngay từ đầu.
- hoc/hinh-mau/xem-vector.html, xem-vector-v6.html nạp part/ + ve.js và iframe ?ve=pixel → V7c sửa trang xem.
- kiem-giao-dien-vector-b mục i (:238-250) dùng VeVector giả `bat: () => vector` → không đổi khi đổi mặc định.
- Thứ tự nạp: KHÔNG có chỗ nào đọc chế độ lúc nạp tệp trước ve-vector.js (ve.js giaoDienVec đọc body.classList lúc gọi; part/*, chu.js, lõi không đọc). Chỗ đọc lúc NẠP tệp: ve-vector.js:396 apGiaoDien, ve-vector-icon.js:346 batDau, huy-hieu.js:814 (cài cầu), phim-mua-1.js:29 (VEC tính một lần khi nạp, sau ve-vector.js nên đúng).

## ĐỀ XUẤT THỨ TỰ V7b (commit nhỏ, mỗi commit kiểm ngay)
| # | Commit | Tệp | Kiểm |
|---|---|---|---|
| b1 | Mặc định vector: doCheDo trả false chỉ khi ?ve=pixel hoặc lưu 'pixel'; luuCheDo('pixel') GHI 'pixel'; chú thích choi.html:134, san-ve.js:35, ve-vector.js:4-5 | ve-vector.js; kiem-ve-vector 8, 14f; harness '?ve=pixel' ở kiem-ve-vector:638, kiem-huy-hieu-phim-vector:121, kiem-nut-mo-dau-phim-vector:107 | 4 máy kiểm đó (13a vẫn so pixel với nền a962f7b qua ?ve=pixel) |
| b2 | Nền tĩnh lavender: theme-color, manifest ×2, dong-goi-artifact.py → vecNenSau; VAI_NEN_TRANG | choi.html:7, manifest.webmanifest, dong-goi-artifact.py, kiem-bang-mau.mjs:72 | kiem-bang-mau |
| b3 | Gói Artifact: thêm choi-vector.css (+ b), phông vector | dong-goi-artifact.py | chạy gói ra dist rồi mở trang (không có máy kiểm) |
| b4 | Hai lỗi lộ ra khi mặc định vector: sơn R1 cũ lọt vào vector; nút "Biểu cảm mắt" vô tác dụng ở vector (chờ user chốt) | ve-robot.js sonHieuLuc, san-ve.js bieuCam (hoặc cai-dat.js ẩn hàng) | kiem-ve-vector 6, kiem-giao-dien-vector-b i + mục mới có lỗi giả |
| b5 | Huy hiệu vector cho 2 mã của gói 10 (sau khi gộp gói 10) | huy-hieu-vector.js | máy kiểm V7a "mọi mã HINH có vector" |
| b6 | Cầu C4: ve.js hydrate 'huyhieu' và 5 người gọi Ve.mk(HuyHieu.ve(…)) → HuyHieu.mk; bỏ bọc Ve.mk / Ve.hydrate | ve.js:846, bang-mo-khoa.js:23, gioi-thieu.js:16, man-chon.js:96, man-goi.js:193, phim-mua-1.js:424, huy-hieu.js:812-832 | kiem-huy-hieu-phim-vector A3 / A4 (sửa A3 "Ve.mk không bị bọc" thành đúng cả hai chế độ) |
| b7 | Cầu C1 + C5: Ve.ico / sao / khoa / mui / hydrate('trum') ở vector trả thẳng svg (VeIcon.taoSvg, lớp `pxi vi vi-<tên>` + phuCua, cỡ như Ve.mk); datTitle chạy một lần khi dựng hộp / màn (hay giữ quét title nhỏ); bỏ MutationObserver; một hằng phạm vi | ve.js:829-850, ve-vector-icon.js:224-346 | kiem-nut-mo-dau-phim-vector B (viết lại: Ve.ico trả svg), kiem-giao-dien-vector-b d (bỏ luật cũ "không gồm #sc-choi"), g; trình duyệt: mọi màn, đếm `canvas.pxi` có _vi = 0, console sạch |
| b8 | Cầu C2 noiVe: bỏ | ve-vector-icon.js:227-234 | trình duyệt: đèn nhịp bật / tắt (den-bo-phan.js), lớp thẻ khay (thanh-phan.js) |
| b9 | Cầu C3: thanh-phan.js hinhPart ở vector → VeIcon.hinhPartVec; the-part.js chép laVector; bỏ noiPart (móc Part._veMot + drawImage) | thanh-phan.js:1842, the-part.js:37-48, ve-vector-icon.js:281-298 | trình duyệt: tiêu đề thẻ khay, thẻ Bộ phận mới, Lắp robot, phim mở đầu (mo-dau đã tự đặt laVector) |
| b10 | CSS: nối giao-dien-vector-b.css vào cuối choi-vector.css nguyên văn, xoá <link> | choi.html:20, choi-vector.css, kiem-giao-dien-vector-b (a, b, c, e đọc tệp gộp), kiem-ve-vector 14, kiem-nut-mo-dau-phim-vector D | 3 máy kiểm; trình duyệt so ảnh vài màn |
Khối lượng ước: 8–10 giờ agent. Dễ vỡ nhất: b7 (icon ~90 chỗ gọi, có chỗ gọi giữ phần tử rồi đổi lớp / style), b9 (gỡ móc toàn cục), b3 (không có máy kiểm). Pixel vẫn chạy được ở ?ve=pixel / Cài đặt suốt V7b (mọi cầu chỉ gắn ở vector).

## ĐỀ XUẤT THỨ TỰ V7c (sau khi V7b "chạy ổn")
| # | Commit | Ghi chú |
|---|---|---|
| c0 | Chụp phanh trước khi xoá: ghi tệp dữ liệu kiểm (câu lỗi Part.ghep của mọi tổ hợp, hamGoc mỗi bộ phận); chốt SHA nền vector (cuối V7b) cho phát lại | làm lúc Part còn sống |
| c1 | Phanh mới: kiem-ve-vector 13a → "phát lại VECTOR khớp nền <SHA V7b>" (cùng harness, lỗi giả đổi một lệnh HU phải đỏ); kiem-huy-hieu-phim-vector A3 / B5 và kiem-nut-mo-dau-phim-vector C → bản vector khớp nền | trước khi gỡ, để chứng minh gỡ không đổi hình vector |
| c2 | Tách logic: lap-rap.js P() → VeVector.kiemGhep; hamGoc → lap-rap / gioi-thieu-part; HuyHieu.DS + bảng bí danh thành dữ liệu; Ve.T / Ve.MAU giữ; SON / DS_SON theo quyết định user | kiem-lap-rap 180 tổ hợp so với tệp c0 |
| c3 | Máy kiểm đọc pixel đổi nguồn: 26 máy regex HINH → một hàm chung; kiem-ve-vector 10 / 12; kiem-camera-drone, kiem-loi-mua-2, kiem-tay-xoay, kiem-may-son, kiem-gioi-thieu-part, kiem-sung-hoi, kiem-flycam, kiem-doi-thu-manh; tools/kiem-tat-ca.mjs bỏ 'hoc/game/part' | máy nào cũng giữ lỗi giả |
| c4 | Gỡ công tắc: VeVector.bat() luôn true (giữ hàm để 69 chỗ this.vec không phải sửa cùng lúc), <body class="ve-vector">, bỏ hàng Kiểu vẽ + 5 khoá chữ caiDat.kieuVe* | |
| c5 | Gỡ nhánh pixel từng tệp, mỗi tệp một commit: ve-robot.js; san-ve.js (2–3 commit theo vùng: ô / vật / robot / hiệu ứng); huy-hieu.js; mo-dau / phim-goi / phim-mua-1 / phim-mua-2; man-dau, thanh-phan, ung-dung, xuong-ham | sau mỗi commit chạy máy phát lại vector c1 |
| c6 | Xoá part/ (18 tệp + xem-part.html + kiem-part.mjs), thẻ script choi.html:116-133, trang xem hinh-mau | |
| c7 | ve.js thu gọn (T, MAU, MAU_TEN, mk, ico / sao / khoa / mui / hydrate vector); bỏ .deco / khungGo / datChatLieu | |
| c8 | CSS + phông: xoá 91 khai báo pixel rõ trong choi.css, --px / --mono thẳng Google Sans, @font-face + 6 woff2 Handjet / VT323, link phông Artifact; sw.js BAN → 'duong-hoc-v2' (dọn bộ đệm cũ) | so ảnh từng màn |
| c9 | Bảng màu: xoá vai không còn chỗ dùng (kiem-bang-mau mục 3 liệt kê), NEN = null / bỏ mục 5, dọn SUA_SAU_NEN | |
Khối lượng ước: 2–3 ngày agent (c3 và c5 san-ve.js nặng nhất). Dễ vỡ nhất: c2 (logic nằm lẫn trong tệp pixel), c5 san-ve.js (69 nhánh), c9 (hàng trăm vai).

## Đụng với gói đang chạy song song
- Gói 10 (fable): THÊM HINH pixel vào huy-hieu.js (V7b b6 sửa khối :785-832 cùng tệp; V7c xoá phần pixel) và nói "bản vector V7b lo" → gộp gói 10 TRƯỚC V7b; V7b b5 vẽ 2 huy hiệu vector. Gói 10 thêm dòng kiem-che-xe, so-lenh: không đụng V7b.
- Phim mùa 2 (opus): tạo phim-mua-2.js (nhánh pixel kiểu phim-mua-1), chu.js, choi.html thẻ script, kiem-phim-goi → V7b b1 sửa harness của kiem-huy-hieu-phim-vector / kiem-nut-mo-dau-phim-vector (phim mùa 2 có thể đã thêm phim vào phần soát của 2 máy này) → gộp phim mùa 2 TRƯỚC V7b. V7c c5 thêm phim-mua-2.js.
- V7a (opus): sửa san-ve.js (nhánh vector), ve-vector*.js, huy-hieu-vector.js, choi-vector.css / giao-dien-vector-b.css (việc 5 :has), kiem-ve-vector, kiem-huy-hieu-phim-vector → đụng trực tiếp V7b b1, b6, b10 → gộp V7a TRƯỚC V7b.
- Thứ tự gộp đề xuất: V7a → gói 10 → phim mùa 2 → npm test cả bộ một lần → V7b (từ nhánh chính mới).

## BẢNG PHƯƠNG ÁN V7c
Ước lượng mã gỡ được: ve.js ~800 / 868 dòng, part/ 513 dòng (18 tệp + trang xem + máy kiểm), huy-hieu.js ~780 / 855, ve-robot.js ~170 / 352, san-ve.js ~600–900 / 2865, 91 khai báo choi.css, 460–800 vai bang-mau.js, 6 woff2 (60 KB). Tổng ~3 500–4 500 dòng mã + vai màu.
| Phương án | Làm gì | Mất bao lâu | Ảnh hưởng | Người chơi thấy gì | Lợi | Rủi ro |
|---|---|---|---|---|---|---|
| A. Gỡ hẳn một lượt | c0–c9 trong một gói | 2–3 ngày agent | ~60 tệp, ~30 máy kiểm | không khác (đã vector từ V7b); mất nút Kiểu vẽ (+ sơn nếu bỏ) | một đường vẽ, bớt ~4k dòng, bỏ móc toàn cục, gói sau vẽ một lần | gói to, nhiều máy kiểm đổi cùng lúc, khó tìm lỗi khi đỏ |
| B. Giữ pixel làm lối thoát ẩn (?ve=pixel, không nút) | chỉ c4 bỏ nút | 0,5 ngày | 2–3 tệp | không khác | lối lui nếu vector lỗi trên máy yếu | MỌI gói sau phải vẽ hai lần (gói 10 vừa thêm huy hiệu pixel) hoặc pixel thối dần; máy kiểm pixel giữ chạy, ~10 phút npm test không giảm |
| C. Gỡ theo lớp (A chia 3 gói nhỏ) — NGHIÊNG VỀ | V7c1: c0–c4 (phanh vector mới, tách logic, gỡ công tắc; mã pixel còn nhưng chết) · V7c2: c5–c7 (xoá mã chết từng tệp) · V7c3: c8–c9 (CSS, phông, bảng màu) | như A, chia 1 + 1–1,5 + 0,5 ngày | như A | không khác ở mọi bước | mỗi gói gộp được riêng, dừng được giữa chừng; phanh vector có TRƯỚC khi xoá | phải giữ kỷ luật "không viết pixel mới" giữa các gói |
| D. Đóng băng (không gỡ, cấm viết pixel mới) | ghi luật vào kế hoạch; hình mới thiếu pixel thì rơi về hình tạm | 0 | 0 | không khác | rẻ | mã chết ở lại, máy kiểm pixel vẫn chạy, đi ngược ý user "gỡ bộ vẽ pixel" |
Nghiêng về C: cùng đích user chốt (gỡ hẳn), nhưng phanh vector được dựng và chứng minh TRƯỚC khi mất phanh pixel, logic nằm lẫn (luật ghép, hamGoc, danh sách huy hiệu, Ve.T, Ve.MAU) được tách trước khi xoá tệp chứa nó. Ngay sau V7b nên áp luật của D ("gói mới không viết pixel") cho tới khi xong C.

## CÂU HỎI CẦN LÀM RÕ
1. Phần thưởng "mở khoá màu sơn theo sao" (DS_SON 60 / 150 / 300 / 450 sao) có giữ ở vector không? Hiện vector ẩn hàng sơn nhưng sơn cũ vẫn lọt vào R1 (phát hiện 9). Giữ → cần thiết kế sơn vector (đổi màu đội R1?) ; bỏ → V7b xoá sơn đã lưu, V7c xoá SON / DS_SON.
2. Nút "Biểu cảm mắt" ở vector: làm cho có tác dụng (mắt đứng yên) hay ẩn? (phát hiện 10)
3. Gói Artifact: Google Fonts có phục vụ "Google Sans Flex" / "Google Sans Code" không? Nếu không: nhúng woff2 (data:) hay chấp nhận phông hệ thống trong bản Artifact.
4. Icon app (hoc/game/icon/*.png, robot pixel, tools/ve-icon.py) có vẽ lại theo vector ở V7c không?
5. Người chơi đã CHỌN pixel trước V7b: luuCheDo('pixel') hiện xoá khoá (ve-vector.js:54) nên không phân biệt được với "chưa chọn" → sau V7b họ thành vector. Chấp nhận? (đề xuất: có, đúng ý "chuyển hẳn").
Brief sai / cần chỉnh:
- "choi.css (1187 dòng, kiểu pixel)": choi.css là NỀN BỐ CỤC cho cả vector (2263 / 3541 khai báo là bố cục; vector chỉ phủ 600 / 1041 bộ chọn) → không gộp choi.css vào choi-vector.css được; chỉ gỡ phần trang trí pixel.
- "sw.js bộ đệm phải đổi tên để người chơi cũ nhận bản mới?": không cần (mạng trước, sw.js:50-65); đổi tên chỉ để dọn tệp cũ ở V7c.
- "chỗ đọc chế độ TRƯỚC khi ve-vector.js nạp": không có (mọi chỗ đọc lười); chỉ có chỗ đọc LÚC NẠP sau ve-vector.js (phát hiện 13).
- "Node không có location: doCheDo trả false" làm đổi kết quả: chỉ 3 máy có harness vm đặt location.search '' (kiem-ve-vector, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau-phim-vector) + mục 8 / 14f của kiem-ve-vector; các máy nạp ve-robot.js không nạp ve-vector.js nên KHÔNG đổi ở V7b (nhưng đổi ở V7c).
- "Part.ghep dùng cho luật ghép": đúng và còn hơn thế: lap-rap.js:146-149 gọi Part.ghep LÚC CHẠY ở màn Lắp robot (không chỉ máy kiểm) → part/ không xoá được trước khi lap-rap chuyển sang VeVector.kiemGhep.
- "hình học tay REACH, điểm gắn, hitbox, cỡ ô": vector đã có bản riêng (tamVoi, oGan, vatKep, hinhHoc); hitbox không dựa ảnh pixel; T = 14 là hệ toạ độ hoạt cảnh (không phải ảnh pixel) → giữ.

## PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Bản vẽ nét mới đã đủ để làm mặc định; việc đổi mặc định (V7b) nhỏ, nhưng lộ ra hai lỗi cũ cần sửa cùng lúc (màu sơn cũ của robot lọt vào kiểu mới, nút "Biểu cảm mắt" không có tác dụng) và bản đóng gói Artifact đang thiếu hẳn giao diện mới. Bộ vẽ điểm ảnh không chỉ là hình: trong đó còn lẫn luật lắp robot, danh sách huy hiệu và bảng màu sơn, nên phải chuyển những thứ đó ra trước rồi mới xoá. Nên gỡ thành ba đợt nhỏ thay vì một lần, mỗi đợt người chơi không thấy gì khác, và trước khi xoá phải có máy kiểm mới canh hình vector (vì máy kiểm hiện tại canh hình điểm ảnh). Ba gói đang chạy song song nên gộp xong hết rồi mới bắt đầu V7b.

## RỦI RO CÒN LẠI
- Chưa chạy máy kiểm nào (luật Scout); mọi số đếm từ grep / node đọc tệp ở HEAD 260eee8. Ba gói song song có thể đổi số dòng.
- Ước lượng san-ve.js (600–900 dòng pixel) là thô (đếm dòng có fillRect / Ve.tiles / Ve.make…), chưa tách từng nhánh.
- dem-css.js tách luật CSS đơn giản (không hiểu hết @media lồng, :is()), số "600 bộ chọn được phủ" là so chuỗi bộ chọn, không chứng minh mọi khai báo đều được phủ.
- b7 (Ve.ico trả svg thẳng): chưa soát hết ~90 chỗ gọi xem có chỗ nào đọc .width / .getContext / vẽ icon lên canvas khác (grep không thấy trong các tệp màn, nhưng chưa đọc từng chỗ của thanh-phan.js 14 chỗ).
- Gói Artifact chưa có máy kiểm: sau V7b dễ vỡ mà không ai biết.
- Chưa đo trên máy yếu / trình duyệt cũ việc vector làm mặc định (hiệu năng canvas theo devicePixelRatio, :has() đang được V7a sửa).
