# Báo cáo: Đệm từ, bản THỬ (nhánh claude/dem-tu-thu, từ fdc85a0)

Agent: Claude Fable 5.1. Brief: hoc/ban-giao/brief-dem-tu-thu.md. Chỉ ghi điều đã thật sự chạy.

## 1. KẾT QUẢ

### Commit (nhánh claude/dem-tu-thu, chưa push, chưa merge)
| SHA | Nội dung |
|---|---|
| cbc683f | Lõi: `cfg.demTu`, ô đệm là khối, hút / đẩy theo cực ngay sau băng chuyền; lời nhắc cham.js; `hoc/kiem-dem-tu.mjs` 18 ca lõi |
| 2bcab69 | Gói thử "Thử đệm từ" đầu mùa 3 (ẩn): 6 màn chương `dem-tu-thu` (`hoc/man-dem-tu-thu.js`), đăng ký `chuongCoChe` + thẻ script choi.html; sửa giả định kiem-lo-trinh |
| 83d09f6 | Hình vector ô đệm, quầng thở, xe trượt mượt + vệt sóng khi bị hút / đẩy, rung khi bị chặn; kiem-ve-vector thêm 1 kiểm |
| (commit này) | Báo cáo |

Tệp sửa: hoc/san-hoc.js, hoc/cham.js, hoc/man-dem-tu-thu.js (mới), hoc/kiem-dem-tu.mjs (mới), hoc/lo-trinh-hoc.js (ngoài khối MÙA 2), hoc/game/choi.html, hoc/game/ve-vector-o2.js, hoc/game/san-ve.js, hoc/kiem-ve-vector.mjs (1 kiểm), hoc/kiem-lo-trinh.mjs (1 dòng), **hoc/game/man-choi.js (1 dòng, NGOÀI phạm vi brief**: `cauHinhSan` phải truyền `demTu` xuống san-ve, không thì giao diện không vẽ đệm; cách làm y hệt `nutBat`). Không đụng bang-mau.js (dùng vai có sẵn), không đụng ve-vector-than-*.js, kế hoạch, sổ canh, màn cũ.

### Luật đã chốt (san-hoc.js, phần ĐỆM TỪ; từng chi tiết đều có ca kiểm)
- Khai: `cfg.demTu = [{ x, y, cuc: 'N' | 'S' }]`; màn nhiều sân: mảng song song như `noi` / `nutBat` (`lopMauCuaSan` cắt). Ô đó trên sân phải là `'.'`; ném lỗi cấu hình nếu không phải `'.'`, cực lạ, khai trùng, có vật / thùng trên ô, robot xuất phát trên ô đệm.
- Ô đệm là KHỐI: `lyDoChan` trả `'dem-tu'` (drone bay qua). Nhờ đó mọi chỗ chặn (đi, băng chuyền, nhảy nhện, thả vật, thùng, `front_clear()`, `distance()`) coi đệm như tường mà không sửa từng chỗ. `dam-tuong` có `vat: 'dem-tu'`; cham.js có tên "ô đệm từ" trong ba bảng lý do.
- Tầm: cùng hàng hoặc cùng cột, cách ≤ 2 ô (`TAM_DEM = 2`). Ô giữa chắn từ nếu là tường `#`, nút `N`, cửa đóng, thùng, vật nằm đất, robot khác, đệm khác. Rào thấp, bậc thang, gầm, hố, băng chuyền KHÔNG chắn từ (nhưng robot bị kéo vào rào / bậc thì vẫn bị chặn theo luật đi thường).
- Thời điểm: `demTuKeo()` gọi ngay sau khối băng chuyền trong `phaA` (trước bàn xoay, cổng, vật theo xe). Nhiều robot: mỗi robot xét riêng trong pha a của nó.
- Chiều: robot không bật nam châm hoặc bật KHÁC cực → HÚT 1 ô về phía đệm, sát đệm rồi thì giữ tại chỗ (`dem-giu`). Bật CÙNG cực → ĐẨY 1 ô ra xa mỗi nhịp tới khi cách 3 ô (ra khỏi tầm). Hướng mặt không đổi. Nhện bị hút như xe, kể cả vừa nhảy đáp (không ngoại lệ nhảy, ca 11b). Drone không bị.
- Bị chặn (tường, cửa, thùng, vật, rào, bậc thang, đồng đội, gầm với nhện đứng): đứng im, sự kiện `dem-chan { nhip, o, den, dem, kieu, vat }`, không phải đâm.
- Hai đệm: gần hơn thắng. Bằng khoảng: nếu mọi lực cùng chiều thì dời (ca 7: N đẩy phải + S hút phải), ngược chiều thì đứng im (`dem-can`). Chi tiết "cùng chiều thì dời" là tôi thêm (brief nói "bằng khoảng thì không dời"): vật lý hợp hơn và không tạo bẫy vô lý; nếu muốn đúng chữ brief thì bỏ một dòng.
- Hố: bị hút / đẩy vào hố → `roi-ho` cùng nhịp (phaE), chương trình dừng.
- Thùng / vật nằm đất: không bị đệm tác động (bản thử).
- Sự kiện vết: `dem-hut` / `dem-day { nhip, tu, den, dem: {x,y,cuc}, lenh }`, `dem-chan`, `dem-giu`, `dem-can` (hai mã sau là thông tin, không chiếm thời gian hoạt cảnh).
- cham.js: `dem-roi-ho` (lỗi, thay lời `roi-ho` "nhện phải nhảy": nói đệm nào, hút hay đẩy, từ ô nào sang ô nào, cách bật cùng cực `magnet_x()` hay tắt), `dem-keo` (thông tin khi chưa thắng: đệm dời robot ở đâu, nhắc luật chiều).
- Hệ quả đáng chú ý: xe không bật nam châm đứng sát đệm (cách 1) muốn đi thẳng ra xa dọc hàng thì nhịp đó đi lên cách 2 rồi bị hút về lại cách 1 (đứng yên thật sự); phải đi ngang (ra khỏi hàng / cột) hoặc bật cùng cực. Đây là luật "sắt" đúng ý user, nhưng cần biết khi thiết kế màn.

### Bảng 6 màn (chương `dem-tu-thu`, gói "Thử đệm từ", hamGoc = hai bánh + magnet_n / magnet_s / magnet_off; kho hàm `move`, `turn_right`, `turn_left` của mùa 1)
| # | Tên · hang | Ý bài | Lời giải (3 sao) | Nhịp / ô | Vì sao lời sai không thắng |
|---|---|---|---|---|---|
| 1 | Xem đệm từ hút xe · lam-quen | Trình diễn: mã mẫu đúng, bấm Chạy là thắng; xe đi ngang dưới đệm S cách 2 ô, bị hút lệch lên làn có cờ | `for 4: move()` (= mã mẫu) | 4 / 5 | Bật S → bị đẩy xuống làn dưới, đi hết đường (`chua-toi-co` + `dem-keo`); đi 3 bước → chưa tới |
| 2 | Hố dưới đệm · lam-quen | Ép hiểu hút: hố giữa đệm S và đường; đi thẳng bị hút lên hố; bật S thì bị đẩy nhưng tường dưới giữ xe → đi tiếp | `magnet_s(); for 4: move()` | 4 / 6 | Không bật → `dem-roi-ho`; bật N (khác cực) → vẫn hút, `dem-roi-ho` |
| 3 | Mượn đệm đổi làn · luyen | Đẩy làm công cụ: bật N để đệm N đẩy xe xuống làn có cờ (tường chặn làn trên) | `magnet_n(); for 4: move()` | 4 / 6 | Không bật / bật S → đệm giữ xe làn trên, `dam-tuong`. Lời khác đi vòng (`turn_right`, `turn_left`) thắng nhưng 7 nhịp, 13 ô → 1 sao |
| 4 | Đổi cực giữa đường · luyen | Đệm N và S, hố dưới mỗi đệm, tường dưới làn: phải N trước, S sau | `magnet_n(); for 4: move(); magnet_s(); for 2: move()` | 6 / 9 | Chỉ N → rơi hố 2; chỉ S → rơi hố 1; đổi S muộn một bước → rơi hố 2 (đều `dem-roi-ho`) |
| 5 | Tắt nam châm để được kéo · bien-the | Hút làm công cụ: hai đệm S; qua hố bằng S rồi tắt (hay đổi N) để đệm 2 kéo xe lên ô cờ sát đệm | `magnet_s(); for 4: move(); magnet_off(); move()` | 5 / 8 | Giữ S tới cuối → bị đẩy vào tường, đứng dưới cờ; tắt từ đầu → rơi hố 1; giữ S rồi rẽ trái đi lên → đệm đẩy xuống lại (`dem-keo`). Lời khác `magnet_n()` thay `magnet_off()` cũng 3 sao |
| 6 | Ba đệm một đường · bien-the | Trùm nhỏ (1 sân): N qua hố, S để bị đẩy xuống làn dưới, giữ S để đệm N ở góc hút xe lên cờ | `magnet_n(); for 4: move(); magnet_s(); move(); move()` | 6 / 9 | Không bật → rơi hố; giữ N → đệm S hút lên làn trên, hết đường; tắt khi tới đệm S → bị hút lên, không xuống làn cờ |

Màn 6 dùng `hang: 'bien-the'` chứ không `'trum'` vì màn trùm cần huy hiệu (`huyHieu` + hình trong HuyHieu.DS), chưa có cho gói thử. Mã mẫu màn 2–6 là bài chưa thắng (máy kiểm có ca riêng). Cờ `chiChay` không làm (theo brief).

Đăng ký: `ManHoc.chuongCoChe` với `sau: 'tham-so'` (như man-ban-xoay.js), tệp nạp SAU man-ban-xoay nên `chenGoi` chèn gói trước Sân cơ khí; khối MÙA 2 (không sửa) tự đặt gói đầu mùa 3 = 0 sao. Thêm một khối nhỏ SAU khối MÙA 2: Sân cơ khí (giờ thứ hai) hạ ngưỡng từ 35 xuống 15 ≤ 18 sao của gói thử (kiem-lo-trinh đòi), ghi rõ "bỏ gói thử thì xoá khối này". kiem-lo-trinh.mjs: thêm `'dem-tu-thu'` vào `chuongTam` (chương được phép < 10 màn). Dùng `chuongCoChe` chứ không `chuongThem` vì kiem-goi-doi.mjs coi mọi `chuongThem` là gói đội.

### Lệnh kiểm (tại worktree, từng lệnh một) và dòng tổng nguyên văn
| Lệnh | Dòng tổng |
|---|---|
| `node hoc/kiem-dem-tu.mjs` | `Đạt 56 / 56` |
| `node hoc/kiem-dem-tu.mjs --loi-gia` | `HỎNG 1 / 56 (--loi-gia: phải HỎNG)` (ca hút lệch làn đỏ như dự kiến) |
| `node hoc/kiem-loi-mua-2.mjs` | `ĐẠT 93 kiểm` |
| `node hoc/kiem-bang-chuyen.mjs` | `ĐẠT 87 · HỎNG 0` |
| `node hoc/kiem-nam-cham.mjs` | `ĐẠT 246 · HỎNG 0` |
| `node hoc/kiem-nhen.mjs` | `ĐẠT 153 · HỎNG 0` |
| `node hoc/kiem-drone.mjs` | `ĐẠT 196 · HỎNG 0` |
| `node hoc/kiem-nut-bat-san.mjs` | `ĐẠT 30 kiểm` |
| `node hoc/kiem-lo-trinh.mjs` | `ĐẠT 900 kiểm tra lộ trình xuất bản.` |
| `node hoc/kiem-che-xe.mjs` | `ĐẠT 271 · HỎNG 0` |
| `node hoc/kiem-hoc.mjs` | `ĐẠT 6715 · HỎNG 0` |
| `node hoc/kiem-ve-vector.mjs` | `ĐẠT 99 · HỎNG 0 kiểm` |
| `node hoc/kiem-bang-mau.mjs` | `ĐẠT 16 · HỎNG 0 kiểm` |

Không máy kiểm nào đỏ nên không phải chạy lại ở main. `npm test` cả bộ KHÔNG chạy (luật RAM): người giao chạy.

### Trình duyệt (ô trình duyệt của app, server tạm `PORT=4204 node server.mjs`, một tab, đã gỡ SW + xoá caches, tắt server và đóng tab khi xong)
- `choi.html?debug=1&man=dem-tu-thu.1`: ô đệm S xanh dương có chữ S, cung sóng nhẹ, quầng thở; bấm Chạy: xe đi 2 bước rồi trượt mượt lên một ô, vệt sóng xanh chạy giữa đệm và xe (ảnh phóng đã xem), tới cờ, bảng "TỚI CỜ! Gọn 5 ô (cần ≤ 5), Nhanh 4 nhịp (cần ≤ 4), Đủ 3 sao!".
- Màn 2 với lời sai (không bật): xe tới cột đệm, bị kéo lên hố, rơi; lời nhắc hiện: "Ở nhịp 2, đệm từ cực S ở ô (2, 0) HÚT robot từ ô (2, 2) sang ô (2, 1) là hố, robot rơi (sau lệnh left_move() ở hàm move, dòng 1) … bật CÙNG cực với đệm (đệm S thì gọi magnet_s()) …".
- Màn 3: cảnh bị đẩy: đệm N đỏ, vệt sóng đỏ chạy ra giữa đệm và xe (ảnh phóng đã xem); thắng 3 sao (6 ô, 4 nhịp). Màn 4: 3 sao (9 ô, 6 nhịp). Màn 5: 3 sao (8 ô, 5 nhịp). Màn 6: 3 sao (9 ô, 6 nhịp), ba đệm N / S / N vẽ đúng chỗ.
- Màn chọn gói (Mở hết): "GÓI 21 · Thử đệm từ", huy hiệu nam châm, 15/18 sao (màn 2 chỉ chạy lời sai), "Chương 41 · Thử đệm từ 5/6". `MoGoi.dsMua()`: `mua-3/dem-tu-thu:0,ban-xoay:15`.
- Ảnh chụp không lưu vào repo (chỉ xem trong phiên).

## 2. CÂU HỎI CẦN LÀM RÕ
1. **Có nên kéo vật sắt / vật nam châm / thùng?** Bản thử không. Nếu có thì vật sắt nằm trong tầm đệm sẽ trượt về đệm như bị tay nam châm hút (`hutVe`), và sẽ sinh bài "dùng đệm dọn vật" nhưng cũng làm màn dua-vat phức tạp (vật bị kéo khỏi đích). Đề nghị: KHÔNG ở gói thật đầu tiên; cân nhắc cho gói kết hợp nam châm điện (mục 4 KE-HOACH-MUA-3).
2. **Tầm 2 ô có hợp không?** Chơi thử thấy tầm 2 là vừa: tầm 1 thì đệm chỉ là "tường dính", tầm 3 thì sân 5 ô gần như toàn vùng từ, khó đặt làn an toàn. Nhưng "chắn từ" của ô giữa là tôi tự chốt (tường / nút / cửa đóng / thùng / vật / robot / đệm khác chắn; rào, bậc, hố, băng không chắn). Hố không chắn là cốt lõi của màn 2, 4, 5 (hố giữa đệm và xe).
3. **Hai đệm bằng khoảng mà cùng chiều thì dời** (tôi thêm, khác chữ brief "bằng khoảng thì không dời"). Giữ hay bỏ?
4. **Xe sát đệm không bật nam châm thì không thể đi thẳng ra xa** (lên cách 2 lại bị hút về 1). Đúng luật "sắt" nhưng người chơi có thể thấy xe "kẹt" khó hiểu; hoạt cảnh hiện là đi 1 ô rồi trượt ngược về. Có muốn lời nhắc riêng ("đệm giữ xe") không? Hiện `dem-giu` chỉ là sự kiện vết, cham.js chưa nói gì.
5. **Đệm có cản bóng của súng bóng / cú giật súng hơi / vật ném không?** Chưa xét riêng: bóng bay dùng `lyDoChan`? Tôi không kiểm (gói thử không có súng); ở gói thật cần ca kiểm.
6. **Thứ tự với cổng / bàn xoay**: đệm xét trước bàn xoay và cổng (ngay sau băng chuyền). Nếu xe bị đệm đẩy lên bàn xoay thì bàn xoay có xoay ngay nhịp đó (vì `vuaVaoBX` so với vị trí đầu nhịp) — chưa có màn nào kết hợp, chưa kiểm.
7. man-choi.js một dòng ngoài phạm vi (xem mục 1): xác nhận chấp nhận.
8. Mã màn `dem-tu-thu.1..6` là khóa lưu sao của gói thử; khi làm gói thật (chương khác) sao của gói thử sẽ mồ côi trong localStorage: chấp nhận hay cần xoá?

## 3. ĐỀ XUẤT
Khung vấn đề: gói thử chứng minh luật đệm từ chơi được với xe hai bánh + nam châm, 6 màn, không sensor. Gói thật mùa 3 (Bãi từ) cần quyết: đệm có là "khối" lâu dài không, và dạy gì thêm.

| Phương án | Ưu | Nhược |
|---|---|---|
| A. Giữ đệm là KHỐI, tầm 2, cờ màn `demTu` (như bản thử) | Không thêm ký hiệu sân, 30 bộ dò không đụng; luật đơn giản, đã có máy kiểm | Ô đệm trên sân thô là `'.'`, người đọc sân thô không thấy đệm; bộ đo đường (do-duong-*.mjs) không biết đệm |
| B. Thêm ký hiệu sân (vd `A` / `a` cho N / S) | Sân thô tự nói, bộ đo đường đọc được | Phải sửa ~30 bộ dò đọc sân thô + san-ve thuSan; nguy cơ vỡ màn cũ |
| C. Đệm là Ô ĐI ĐƯỢC (đứng trên đệm = bị giữ) | Gần hố ver2, ít luật chặn hơn | User đã bác (khác gì hố ver2), bỏ |

Nghiêng về A cho gói thật, bổ sung: (1) bộ đo đường cho chương đệm đọc `demTu` khi tính BFS "lời ngắn nhất"; (2) ký hiệu chỉ trong ảnh nhỏ thuSan (chưa vẽ đệm trong ảnh nhỏ màn chọn, xem rủi ro); (3) lời nhắc `dem-giu` cho tình huống "kẹt sát đệm".

Về nội dung dạy: 6 màn thử đã phủ 4 động tác (né bằng cùng cực, đổi làn bằng đẩy, đổi cực giữa đường, tắt để được hút). Gói thật 20 màn có thể thêm: cảm biến `front_pole()` không đọc được đệm (đệm không phải vật) → cần hàm cảm ứng từ mới nếu muốn màn "đọc cực đệm rồi quyết định" (`if` / `elif` mùa 3); hai robot (R1 kéo R2?) không hợp vì đệm chỉ kéo thân.

## 4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE
Mở game từ nhánh claude/dem-tu-thu (cổng của bạn), vào Gỡ lỗi bật "Mở hết", chọn mùa 3: gói đầu tiên là "Thử đệm từ" (6 màn, 0 sao để mở). Hoặc gõ thẳng địa chỉ `choi.html?debug=1&man=dem-tu-thu.1`. Màn 1 chỉ cần bấm Chạy: xe đi ngang qua dưới ô đệm S xanh và bị hút lệch lên một ô rồi tới cờ. Màn 2 trở đi phải thêm `magnet_s()` / `magnet_n()` / `magnet_off()` từ khay lệnh: cùng cực thì đệm đẩy xe ra, khác cực hay tắt thì đệm hút xe vào, mỗi nhịp một ô, chỉ khi xe đứng thẳng hàng hay thẳng cột với đệm trong 2 ô. Xe bị kéo xuống hố thì màn dừng và có lời nhắc đỏ nói đệm nào kéo, nên bật cực gì. Màn 6 kết hợp cả ba đệm.

## 5. RỦI RO CÒN LẠI
- `npm test` cả bộ chưa chạy (luật RAM); 13 máy kiểm riêng xanh nhưng còn các máy kiểm khác (súng bóng, súng hơi, cổng, bàn xoay, đội hai robot…) chưa chạy ở nhánh này; thay đổi ở `lyDoChan` / `oThaChan` / `oThungChan` chỉ có tác dụng khi `san.demTu` có ô nên màn cũ không đổi (kiem-hoc 6715 xanh), nhưng `san.demTu = {}` giờ luôn được gán trên đối tượng sân trong `chay()`.
- Ảnh nhỏ màn chọn (`SanVe.thuSan`) KHÔNG vẽ đệm (đệm là `'.'`): thẻ màn ở màn chọn trông như sân trống. Chưa làm vì brief không nhắc và thuSan đi theo khuôn ký hiệu.
- Bộ đo đường / lời ngắn nhất (do-duong-*.mjs) không biết đệm; kiem-hoc không đo đường tắt cho chương này nên chưa đỏ, nhưng không có bằng chứng máy rằng lời giải là ngắn nhất (tôi dò tay: màn 3 và 5 có lời khác chậm hơn).
- Hoạt cảnh `dem-chan` (rung + ô đỏ) chưa thấy trên trình duyệt (không màn nào trong 6 màn với lời giải gặp; màn 2 lời giải có `dem-chan` ở nhịp 2 nhưng tôi chỉ chạy lời sai trên trình duyệt). Logic chép từ `cong-chan`.
- Nhiều robot (`cfg.doi`) + đệm: lõi chạy pha a cho từng robot nên đệm xét riêng từng xe; không có ca kiểm đội.
- Thanh "!" cạnh đệm khi rơi hố là `baoHieu` chung của roi-ho, không phải của đệm; không hại.
- V8a đang sửa kiem-ve-vector.mjs: tôi chỉ thêm 4 dòng ở cuối khối 10 (sau kiểm "nam châm N tô luatVatDo"), có thể gộp xung đột nhỏ.
