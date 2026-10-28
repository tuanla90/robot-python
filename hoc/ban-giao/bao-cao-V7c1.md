# Báo cáo V7c1 — phanh vector + tách logic + gỡ công tắc pixel (agent Ship, Claude Fable 5.1, 28/10)

Worktree: D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v7c1-phanh-vector · nhánh claude/go-pixel-1 · tách từ c830c12 (nhánh chính sau V7b). Cây sạch, không push, không merge. Server 4202 đã tắt, tab trình duyệt đã đóng. Không chạy npm test (luật).

## 1. KẾT QUẢ

### Commit (8, theo thứ tự)
| SHA | Việc |
|---|---|
| 4f841ff | c0: chụp dữ liệu logic từ mã pixel → hoc/du-lieu-chup-pixel.json (tại c830c12): Part.ghep câu lỗi 1680 tổ hợp (danh sách mục 12b kiem-ve-vector) + 180 tổ hợp Lắp robot kèm Part.hamGoc; 17 bộ phận (ten, hamGoc, gan, oGan, diemNeo); HuyHieu.DS 84 mã + 20 bí danh; SON / DS_SON / LOP_SON. Sinh bằng hoc/chup-du-lieu-pixel.mjs (chạy lại được khi part/ còn) |
| be07d8a | c1: phanh VECTOR so nền c830c12, chạy song song phanh pixel cũ: kiem-ve-vector 13a-v (phát lại 39 lần / 8104 khung, từng lệnh canvas sân + lớp robot); kiem-huy-hieu-phim-vector A3-v (84 mã × 3, HuyHieu.mk từng lệnh) + B5-v (68 khung / 19 phim, cây DOM + lệnh vẽ); kiem-nut-mo-dau C3-v (6 khung mở đầu). Harness nạp MỌI tệp của nền từ git (napGame(…, 'vec')) |
| a4478be | c2a: luật ghép + hamGoc tách khỏi part/: 17 dangKy vector (than / tay / cam) thêm `hamGoc`; VeVector.hamGoc(cfg) y Part.hamGoc; lap-rap.js P() → VV() (Node tự nạp ve-vector + bộ phận), kiemGhep nhờ VeVector.kiemGhep, API part() → veVector(); kiem-lap-rap + kiem-ve-vector 12 so với dữ liệu chụp (không nạp part/) |
| 0c6d6aa | c2c: danh sách mã huy hiệu + bí danh thành dữ liệu: VeVector.HUY_HIEU.BI_DANH / maGoc / dsTatCa (huy-hieu-vector.js); HuyHieu.DS = dsTatCa(), maVec tra bảng; kiem-huy-hieu A7 so với dữ liệu chụp |
| 2824a2f | c2d: bỏ sơn mở khoá: cai-dat.js xoá hangSon + bảng sơn dự phòng; chu.js 7 khoá caiDat.son*; luu.js bỏ trường son; ve-robot.js xoá sonChon, sonHieuLuc luôn 'vang'; ve-vector.js SON_DOI chỉ do / tim; máy kiểm 6 / 9 / i + lỗi giả mới; kiem-bang-mau VAI_CHO_V7C3 (11 vai) |
| dc2d8af | c3: 25 máy kiểm bỏ regex `HINH['ma'] = function` trong huy-hieu.js → hoc/huy-hieu-ds.mjs (đồ dùng chung: coHuyHieu / coHinhRieng / dsHuyHieu / biDanh, nạp ve-vector + huy-hieu-vector trong vm riêng) |
| 37d61ff | c4: gỡ công tắc: ve-vector.js bat() luôn true (xoá doCheDo / luuCheDo / KHOA_LUU; datCheDo giữ làm no-op cho trang xem); choi.html `<body class="ve-vector">`; cai-dat.js xoá hàng Kiểu vẽ + taiLaiKieuVe; chu.js 5 khoá caiDat.kieuVe*; ve.js svgVec không rẽ theo body.ve-vector, cỡ icon = bảng số CO_ICON (60 tên, đo một lần); phim-vector.js RIENG trum 26 → 24; gỡ phanh pixel cũ (13a, 9 vế pixel, 14f cũ, A3, B5, C3, kiem-bang-mau mục 5, ngữ cảnh ?ve=pixel của 3 harness); 14f mới (nguồn sạch công tắc) có lỗi giả |

57 tệp đổi so với c830c12 (+29 191 / −513, trong đó du-lieu-chup-pixel.json +28 690): game 26 tệp (cai-dat.js −127, lap-rap.js, ve-vector.js, ve.js, huy-hieu.js, huy-hieu-vector.js, luu.js, chu.js, ve-robot.js, phim-vector.js, choi.html, 12 tệp bộ phận vector), 31 máy kiểm, 3 tệp mới (hoc/chup-du-lieu-pixel.mjs, hoc/du-lieu-chup-pixel.json, hoc/huy-hieu-ds.mjs). KHÔNG xoá tệp pixel nào (part/ 20 tệp, ve.js, nhánh pixel san-ve.js / ve-robot.js / huy-hieu.js còn nguyên, chết lúc chạy).

### Lệnh kiểm (tại worktree, từng lệnh một, KHÔNG npm test) — kết quả nguyên văn (sau c4)
```
kiem-ve-vector: ĐẠT 95 · HỎNG 0 kiểm                      (V7b 99; −5 phanh pixel 8 / 9 ×3 / 13a / 14f cũ, +1 13a-v, +14f mới; 12b nay 1360 tổ hợp từ dữ liệu chụp)
kiem-huy-hieu-phim-vector: ĐẠT 12 · HỎNG 0 kiểm           (V7b 11; −A3 −B5 +A3-v +B5-v +A7)
kiem-nut-mo-dau-phim-vector: ĐẠT 12 · HỎNG 0 kiểm         (V7b 12; −C3 +C3-v)
kiem-giao-dien-vector-b: ĐẠT 16 · HỎNG 0 kiểm
kiem-phim-goi: ĐẠT 41 · HỎNG 0
kiem-bang-mau: ĐẠT 17 · HỎNG 0 kiểm                       (V7b 19; bỏ mục 5 = 2 kiểm)
kiem-lap-rap: ĐẠT 127 · HỎNG 0                            (V7b 125; +2 so dữ liệu chụp)
kiem-khay: ĐẠT 184 · HỎNG 0
kiem-dong-goi-artifact: ĐẠT 14 · HỎNG 0 kiểm
kiem-hoc: ĐẠT 6715 · HỎNG 0
kiem-huong-dan: ĐẠT 40 · HỎNG 0  ·  kiem-che-cam-bien: ĐẠT 224 · HỎNG 0   (hai máy đọc xuong-ham.js; không có kiem-xuong-ham.mjs như brief ghi)
kiem-tay-xoay: ĐẠT 183 · HỎNG 0  ·  kiem-loi-mua-2: ĐẠT 93 kiểm  ·  kiem-camera-drone: ĐẠT 62 · HỎNG 0   (ba máy nạp ve-robot.js không nạp ve-vector.js: vẫn chạy nhánh Part pixel, xem câu hỏi 2)
25 máy kiểm c3 (banh-lui-them 49, be-sung 107, cam-bien-them 45, che-drone 233, che-list 205, che-luc-ban 57, che-mau 244, che-may-nem 226, che-xich 237, combo-mua-1 128, day-thung 108,
  do-nhiet 107, doi-mua-1 79, doi-mua-2 107, flycam 245, hoc 6715, hong-ngoai 108, list-man 168, may-son 145, nut-de 62, rap-du 160, rap-nao 286, rap-tay 265, trum-mua-1 81, trum-mua-2 107): ĐẠT · HỎNG 0
--- lỗi giả
kiem-ve-vector --loi-gia: HỎNG 46 / 95 kiểm (đang cắm lỗi giả: phải đỏ)      (13a-v đỏ, 14f mới đỏ)
kiem-huy-hieu-phim-vector --loi-gia: ĐẠT 4 · HỎNG 8 kiểm                    (A1 A2 A3-v A7 B2 B3 B4 B5-v đỏ)
kiem-nut-mo-dau-phim-vector --loi-gia: HỎNG 10 / 12 kiểm                    (C3-v đỏ, B2 đỏ)
kiem-giao-dien-vector-b --loi-gia: HỎNG 9 / 16 kiểm                         (i đỏ với lỗi giả mới)
kiem-bang-mau --loi-gia: HỎNG 1 / 17 kiểm                                   (mục 4 đỏ)
kiem-dong-goi-artifact --loi-gia: ĐẠT 10 · HỎNG 4 kiểm
```

### Bảng phanh: pixel cũ → vector mới · lỗi giả
| Phanh pixel cũ (gỡ ở c4) | Phanh vector mới (c1) | Lỗi giả (--loi-gia) |
|---|---|---|
| kiem-ve-vector 13a: phát lại PIXEL khớp nền a962f7b (39 lần, 8103 khung) | 13a-v: phát lại VECTOR khớp nền c830c12 (39 lần, 8104 khung, từng lệnh canvas sân + lớp robot, cùng hạt Math.random / đồng hồ ảo) | HU.hat thêm save / restore → 13a-v đỏ (đã thấy đỏ) |
| kiem-ve-vector 9 vế pixel (REACH 26, vatKep 18/10, HH_PIXEL, tiLeChoO công thức cũ), 8 (bat() theo ?ve=), 14f (luuCheDo ghi / xoá khoá) | 8: bat() luôn true + nguồn ve-vector.js sạch công tắc; 14f: cai-dat / chu / ve-vector / choi.html sạch công tắc | 14f: lỗi giả cắm hangKieuVe vào cai-dat.js → đỏ |
| kiem-huy-hieu-phim-vector A3: vePixel = HuyHieu.ve nền fa3702f từng điểm ảnh | A3-v: HuyHieu.mk(ma, tt, 2) bản mới = nền vector c830c12 từng lệnh vẽ (84 × 3), mọi mã của nền còn | lỗi giả có sẵn (tay-gap gọi Part.ghep, xich ném) → A3-v đỏ |
| kiem-huy-hieu-phim-vector B5: cây DOM 9 phim pixel = nền fa3702f | B5-v: cây DOM + lệnh vẽ 68 khung / 19 phim = nền vector c830c12, không mất phim | lỗi giả có sẵn (PhimVector bỏ ô tường, VAT 57…) → B5-v đỏ |
| kiem-nut-mo-dau C3: 6 khung mở đầu pixel = nền 4ac900f; C1 / C2 vế so pixel; B2 cỡ svg so canvas pixel | C3-v: 6 khung mở đầu vector = nền c830c12; B2 cỡ svg so bảng CO_ICON (bản chép độc lập trong máy kiểm) + nguồn ve.js dùng CO_ICON | lỗi giả có sẵn (mo-dau dùng ô pixel) → C3-v đỏ |
| kiem-ve-vector 12 liệt kê từ part/*.js, 12b Part.ghep sống | 12 liệt kê + 1360 tổ hợp từ du-lieu-chup-pixel.json (c0), so cả hamGoc | lỗi giả V3 có sẵn (drone mất khongHuong…) → đỏ |
| kiem-lap-rap: Part.lay / Part.hamGoc / Part.ghep | VeVector.lay / hamGoc / kiemGhep + 2 mục mới so 17 bộ phận và 180 tổ hợp với dữ liệu chụp | (không có cờ lỗi giả; chụp là chuẩn) |
| kiem-huy-hieu A6 "HuyHieu.DS = Object.keys(HINH)" | A7: DS + BI_DANH = dữ liệu chụp (tập), mọi HINH pixel còn lại ⊆ DS, maVec(bí danh) = mã gốc | lỗi giả có sẵn → A7 đỏ |
| 25 máy kiểm regex huy-hieu.js | coHuyHieu / coHinhRieng (hoc/huy-hieu-ds.mjs) | — |
| kiem-bang-mau mục 5 (8528 ảnh Part.ghep nền 13b8a97) | BỎ (hình vector đã có 12 / 13a-v); mục 4 giữ (không phụ thuộc pixel) | lỗi giả mục 4 vẫn đỏ |
| kiem-giao-dien-vector-b i "pixel CÓ hàng sơn" | i: không hàng sơn / Kiểu vẽ ở Cài đặt, nguồn sạch | lỗi giả cắm data-cd="son" → đỏ |

### Trình duyệt (server 4202, gỡ SW + xoá caches + localStorage rỗng, soát bằng script trong trang; ô trình duyệt có thể ẩn nên không chụp ảnh)
- `choi.html?ve=pixel`: body `ve-vector san-sang`, VeVector.bat() = true, 0 canvas icon điểm ảnh (`_vi`), 54 svg.vi → **?ve=pixel không còn tác dụng**. `VeVector.luuCheDo` = undefined.
- Màn đầu / chọn gói / lưới màn xe (85 svg) / Lắp robot rap-nao.1 (97 svg) / màn chơi hai-banh.1 (104 svg) / phim tay-gap: 0 icon canvas điểm ảnh, 0 phần tử phông Handjet / VT323, 0 nút chỉ icon thiếu title (lần soát hai; lần đầu thấy 2 nút ở lưới màn chưa có title ngay sau App.vaoGoi, lần quét vi tác vụ sau đã đặt). Canvas không mang cờ .laVector còn thấy: `.d-robot` màn đầu (86 px) và `.lr-hinh` Lắp robot (58 px) do VeRobot.veCo vẽ VECTOR lên canvas (cờ không chép), `#field` / `.lop-robot` sân — y như V7b.
- Cài đặt: hàng hieuUng, nhac, mat — KHÔNG còn `son`, KHÔNG còn `kieu-ve`; Luu.docCaiDat() = { hieuUng, nhac, mat } (không son).
- Lắp robot: LapRap.kiemGhep drone + kẹp → "Drone chỉ treo được nam châm dưới bụng, không gắn tay kẹp."; hai bánh + camera bụng → "Camera bụng chỉ gắn được lên drone."; xích + tay xoay + camera → ok; VeVector.kiemGhep drone + camera → "Drone không gắn được camera: drone không có hướng mặt để nhìn \"phía trước\"." (đúng câu Part.ghep); VeVector.hamGoc(xích + súng hơi + hồng ngoại) = 9 lệnh đúng.
- Đi qua màn đầu → lưới màn → Lắp robot → màn chơi → màn đầu: **Part.ghep / Part._veMot được gọi 0 lần** (bọc đếm) → bộ pixel part/ chết lúc chạy.
- Console: chỉ "An unknown error occurred when fetching the script." ×2 (đăng ký sw.js trong ô trình duyệt của app, như V7b câu hỏi 3); không lỗi khác.

## 2. CÂU HỎI CẦN LÀM RÕ
1. **Brief c4 "ve.js svgVec bỏ đường lùi pixel": làm MỘT NỬA.** svgVec không còn rẽ theo body.ve-vector và cỡ icon là bảng số CO_ICON (không đọc lưới HINH pixel), nhưng `ico / sao / mui / khoa / hydrate` vẫn giữ vế `|| nhan(mk(pixel…))` khi VeIcon thiếu hay tên lạ. Lý do: ném lỗi ở UI khi thiếu icon là đổi hành vi; máy kiểm nút-mở-đầu A1 đã bắt mọi tên dùng có trong VeIcon.HINH nên vế này chết trong game. V7c2 xoá cùng Ve.mk / icon pixel. Chấp nhận?
2. **Ba máy nạp ve-robot.js không nạp ve-vector.js (kiem-tay-xoay 345–372, kiem-loi-mua-2 290–349, kiem-camera-drone 205–235)** vẫn xanh vì chúng require part/ và chạy nhánh Part pixel của VeRobot (VV() null → cheDoVector() false). Chúng không đỏ ở V7c1 (part/ còn) nhưng SẼ đỏ ở V7c2 khi xoá part/ / nhánh pixel VeRobot. Đề xuất V7c2 sửa 3 máy sang nạp ve-vector*.js trong vm (như kiem-ve-vector 13) và đổi vế Part.* → VeVector.* (ổ, hamGoc, ghép được). Tương tự tools/kiem-tat-ca.mjs:11 quét 'hoc/game/part' và game/part/kiem-part.mjs.
3. **Thứ tự HuyHieu.DS đổi**: trước = thứ tự khai HINH pixel, nay = thứ tự dk() trong huy-hieu-vector.js + bí danh. Mọi chỗ dùng chỉ indexOf ≥ 0 (bang-mo-khoa, gioi-thieu, man-chon, man-goi, phim-mua-1) nên không đổi gì nhìn thấy; máy kiểm A7 so TẬP. Nếu nơi nào cần thứ tự thì nói.
4. **kiem-ve-vector --loi-gia từng crash sau c2a** (TypeError hamCuaMan ở man-chuoi-1.js:54): lap-rap.js nay xét ghép bằng VeVector = globalThis.VeVector của máy kiểm, mà lỗi giả V3 (drone mất khongHuong, camera-bay sang ổ tren…) cắm lên đúng đối tượng đó TRƯỚC khi mục 12g nạp bộ màn → màn lắp ráp macDinh ném. Đã sửa bằng cách nạp bộ màn ngay đầu máy kiểm (trước khi cắm lỗi giả). Nêu để người giao biết: từ nay mọi máy kiểm nào require ve-vector.js ở Node rồi require màn sẽ dùng chung một VeVector với lap-rap.
5. **Scout phát hiện 8 "coIco trum 26 × 26" đúng là sai**: đo thật spriteTrum = 24 × 24 (co-icon.cjs); phim-vector.js đã sửa 26 → 24 (chỉ ảnh hưởng cỡ icon trùm trong phim nếu có; B5-v vẫn khớp nền → không phim nào dùng icon trùm).
6. **Brief "kiem-xuong-ham.mjs" không tồn tại**; đã chạy kiem-huong-dan + kiem-che-cam-bien + kiem-khay (các máy đọc xuong-ham.js / thanh-phan.js) thay.
7. **Lưới màn: 2 nút chỉ icon chưa có title ngay sau App.vaoGoi** (soát lần đầu), lần quét sau đã có → VeIcon.thay chạy trong vi tác vụ sau App.hien (V7b câu hỏi 6). Không phải lỗi mới của V7c1; nêu vì nó là khoảng trống rất ngắn (trước khi vi tác vụ chạy).

## 3. ĐỀ XUẤT cho V7c2 / V7c3
### V7c2 (xoá mã chết) — mỗi tệp một commit, sau mỗi commit chạy 13a-v / A3-v / B5-v / C3-v
| Tệp | Xoá được (số dòng hiện tại) | Giữ |
|---|---|---|
| hoc/game/part/ (20 tệp: part.js 89, 17 part-*.js, xem-part.html, kiem-part.mjs) + 18 thẻ `<script src="part/…">` choi.html:114–131 | toàn bộ (Part.ghep / hamGoc / SON / DS_SON / LOP_SON / _veMot / veVatNho / veMat) — logic đã ở VeVector (kiemGhep, hamGoc, ten, gan, oGan) và du-lieu-chup-pixel.json | — |
| ve-robot.js | veTamTay / veTamXoay / ctxMoi :92–136, beNgangThan :138–147, coPart :148, veGhep :174–218 (nhánh pixel ve() :243…), bongTay :281–312 (export bongTay), HH_PIXEL :327, nhánh pixel của tiLeChoO :161 / vatKep / vatXoay / reachCua / REACH getter :337, dungPart / ?part=0 :335, cheDoVector / veVector (luôn true, chỉ còn coDu) | cauHinhCua, chuanTay, TAY_THEO_LENH, sonHieuLuc (3 dòng), veCo, heSoCss, PX_O_PART, PHONG_NGOAI_SAN, vatKep / vatXoay / hinhHoc / reachCua vế vector |
| huy-hieu.js | :1–805 (Painter P, partTho, mọi `HINH['x'] = function`, vePixel :769), 20 dòng bí danh :834–853, cheDoVec / mkGoc; HuyHieu.vePixel / veVec xuất | ve / mk / maVec / DS (xây thẳng từ VeVector.HUY_HIEU; tệp ~40 dòng) hoặc gộp vào huy-hieu-vector.js |
| ve.js (882) | Painter :14–60, rot90 / rng / tex* :65–91, datChatLieu :92–117 (ung-dung.js:212 gọi), icon pixel + HINH lưới :118–211 (giữ CO_ICON), sprite* :212–327, makeRug…makeNhen :329–748, makeMatMau / makeCrateMau :757–784, makeVatNho, tiles() :798–809, phongVec :823, khungGo :868 (ung-dung.js:222, xuong-ham.js:80 gọi), vế `\|\| nhan(mk(…))` trong ico / sao / mui / khoa / hydrate :845–862 | T = 14 :328, MAU / MAU_TEN :750–756 (san-ve.js:711, :1001 nhánh vector dùng Ve.MAU[m].vi), mk (HuyHieu.mk pixel? không; the-part.js / mo-dau.js / phim-goi.js:56 còn Ve.mk cho canvas vector: giữ mk thu gọn), ico / sao / mui / khoa / hydrate (vector), CO_ICON, svgVec |
| san-ve.js (72 `this.vec`) | mọi nhánh else của this.vec (2–3 commit theo vùng ô / vật / robot / hiệu ứng), coMatDong :2831 + veMatTam :2840 (mắt LED pixel; cài đặt mắt vector đọc coMatDong :1400 → giữ coMatDong, xoá veMatTam), :1307 nhánh spr.laPart && !spr.laVector, thuSan pixel, datDoPhanGiai(0) | T, SON_XE :57, KINH_THAN, mọi nhánh vector |
| mo-dau.js :53–60, phim-goi.js :44–60 / :75–77 (Ve.tiles().rug), phim-mua-1.js :29–40 (VEC luôn true → bỏ biến) + 6 chỗ `if (VEC)`, phim-mua-2.js (soát nhánh pixel), man-dau.js :106 / :115 (mắt pixel), thanh-phan.js :1842–1863 hinhPart vế Part._veMot + HINH_PART, :462 veMuot, ung-dung.js :212 datChatLieu / :222 khungGo / :265 phông theo body, xuong-ham.js :80 khungGo | | |
| tools/kiem-tat-ca.mjs:11 bỏ 'hoc/game/part'; kiem-tay-xoay / kiem-loi-mua-2 / kiem-camera-drone / kiem-may-son / kiem-gioi-thieu-part / kiem-sung-hoi / kiem-flycam / kiem-doi-thu-manh (grep Part/part-) đổi sang VeVector; kiem-giao-dien-vector-b mục "man-dau.js đặt mat CHỈ khi VeVector.bat()" → luôn; hoc/hinh-mau/xem-vector*.html bỏ iframe ?ve=pixel + cột pixel; tools/ve-icon.py xoá | | |
| hoc/chup-du-lieu-pixel.mjs | xoá sau khi part/ xoá (không chạy được nữa); du-lieu-chup-pixel.json GIỮ làm chuẩn cho kiem-lap-rap / kiem-ve-vector 12 / kiem-huy-hieu A7 | |
Luật ngay từ giờ: gói mới KHÔNG viết pixel (huy hiệu mới chỉ dangKy ở huy-hieu-vector.js; bộ phận mới dangKy ở ve-vector-*.js kèm hamGoc; máy kiểm dùng hoc/huy-hieu-ds.mjs).

### V7c3 (CSS / phông / bảng màu)
- choi.css (1187 dòng): bỏ 91 khai báo pixel rõ (--wood / --chalk / pixelated / steps( / clip-path răng cưa), --px / --mono thẳng Google Sans; cân nhắc bỏ tiền tố body.ve-vector của choi-vector.css (so ảnh từng màn, V7d).
- font/font.css: 12 @font-face → 6 (bỏ Handjet / VT323 + 6 woff2 = 60 588 byte); dong-goi-artifact.py:38–47 bỏ PHONG_PIXEL; kiem-dong-goi-artifact mục "nguồn font.css vẫn có 12 @font-face" sửa.
- sw.js:11 BAN 'duong-hoc-v1' → 'duong-hoc-v2' (dọn part/*.js, woff2 cũ trong bộ đệm người chơi cũ).
- bang-mau.js: xoá vai không còn chỗ dùng sau V7c2 (kiem-bang-mau mục 3 liệt kê; VAI_CHO_V7C3 11 vai bảng sơn đã có sẵn trong máy kiểm → xoá danh sách đó), NEN = null / dọn SUA_SAU_NEN (khoá tệp đã xoá: part, huy-hieu.js nếu gộp).
- ve-vector.js SON_DOI: nếu bỏ hẳn đối thủ tím thì chỉ còn do (san-ve SON_XE 4 màu đang dùng tim cho R4).

## 4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Game giờ chỉ còn một cách vẽ: nét mới (vector). Nút "Kiểu vẽ" và địa chỉ ?ve=pixel không còn tác dụng, hàng "Màu sơn R1" (mở khoá sơn theo sao) cũng bỏ vì robot R1 luôn mang màu đội. Trước khi gỡ, bộ máy kiểm đã có "phanh" mới: phát lại 39 lần chơi (8104 khung hình), 84 huy hiệu, 19 phim, 6 khung mở đầu và so từng nét với bản vector trước gói này, nên hình trên màn không đổi (đã thử cắm lỗi giả, phanh đều đỏ). Những luật từng nằm lẫn trong mã vẽ cũ (robot nào ghép được với tay / cảm biến nào, mỗi bộ phận mở lệnh gì, danh sách huy hiệu) đã được chụp ra một tệp dữ liệu rồi chuyển sang bộ vẽ mới, máy kiểm chứng minh y hệt. Mã vẽ điểm ảnh cũ vẫn nằm trong kho nhưng không còn chạy; gói sau (V7c2) xoá hẳn.

## 5. RỦI RO CÒN LẠI
- Trình duyệt chỉ soát bằng script (đếm phần tử / lớp / phông / lời gọi Part), chưa nhìn ảnh từng màn (ô trình duyệt bị ẩn); cỡ icon theo bảng CO_ICON đo bằng canvas giả ở Node, trình duyệt kiểm bằng B2 (máy kiểm) chứ chưa nhìn bằng mắt.
- Chưa chạy npm test cả bộ (luật): ngoài 46 máy đã chạy, các máy kiểm còn lại (~40) chưa chạy lại sau c2d / c4 (chu.js mất 12 khoá, luu.js mất trường son, cai-dat.js mất 2 hàng) — người giao chạy một lần sau khi gộp.
- Ba máy kiểm nạp ve-robot.js không nạp ve-vector.js vẫn xanh nhờ part/ còn; V7c2 phải sửa trước khi xoá part/ (câu hỏi 2).
- lap-rap.js ở Node dùng chung globalThis.VeVector với máy kiểm nào require ve-vector.js (câu hỏi 4); máy kiểm khác cắm lỗi giả lên VeVector rồi mới nạp màn sẽ gặp cùng lỗi.
- HuyHieu.DS đổi thứ tự (câu hỏi 3).
- hoc/hinh-mau/xem-vector-v6.html còn iframe ?ve=pixel và cột pixel (HuyHieu.vePixel): trang xem nay hai cột giống nhau / cột pixel vẫn vẽ pixel vì vePixel còn; V7c2 sửa trang xem.
- Người chơi đã lưu 'pixel' trong localStorage (duong-hoc:ve-vector) hay 'son' trong cài đặt: khoá cũ bị bỏ qua, không dọn (vô hại).
- Gói Artifact chỉ chạy máy kiểm ghép mảnh (14 đạt), chưa mở trong trình duyệt.
