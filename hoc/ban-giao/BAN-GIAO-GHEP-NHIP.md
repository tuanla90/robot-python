# Biên bản bàn giao: ghép nhịp mùa 2, 4, 5, 7 (14/11/2026)

Kế hoạch gốc: `hoc/KE-HOACH-GHEP-NHIP.md` (user chốt 13/11, mục 7). Máy đo: `node tools/do-ghep-nhip.mjs`.
User dặn tối 13/11: "xong 1 mùa thì commit, làm dần các mùa khác r merge main đẩy git sáng mai t chơi thử". Thứ tự: mùa 5 → 2 → 4 → 7. Cách làm: phiên chính lập kế hoạch và nghiệm thu, agent viết (skill /giao-viec), mỗi lúc một agent.

## 1. Trạng thái từng mùa

| Mùa | Trạng thái | Ở đâu | Số đo (màn có ghép ngoài cặp hai bánh) |
|---|---|---|---|
| 5 Bến sông (xuồng) | XONG | main | 69/200 (gói 5: 18, 6: 17, 7: 10, 8: 10, 9: 4, 10: 10); trước đợt là 0 |
| 2 Nhà máy (xe cứu hỏa) | XONG, hụt chỉ tiêu | main 5107a78 | 11/200 (gói 6: 7/20, cần 15; gói 10: 4/20, cần 5) |
| 4 Cảng sông (cần cẩu) | F1 cẩu 4 hướng XONG (main 9ebfa0c); F2 cần gạt đôi XONG (đã push ccaed8e); F3 xếp chồng theo luật XONG (push 5e1e2a0); F4a lớn nhất hàng ngang + F4b hàng tàu XONG (main 2970a6e+). MÙA 4 XONG | main | 29/200 (sau F4a); trước F2 là 0 |
| 7 Mỏ đá (xe omni) | CHƯA BẮT ĐẦU | — | 0/200 |

**Đã đẩy GitHub** (origin/main d7c4e52, 14/11). Sáng 14/11 các lần đẩy trước đó lỗi `HTTP 503` phía GitHub lúc gửi gói (đăng nhập vẫn qua); thử lại sau ~1 giờ thì được. Mỗi mùa xong: `git push origin main` (user cho phép đợt này).

## 2. Mùa 5 Bến sông: đã làm

- Lõi: tời cuộn `reel_in()` / `reel_out()` thay `set_length` (f9bb5c3, 85f69e4, 1915467). Mỗi nhịp cuộn hoặc nhả 1 ô. Bật bằng hamGoc hoặc cờ `cuonDay`. Hết nấc thì có sự kiện `day-het-thu` / `day-het-nha`.
- Gói 5 Mỏ neo: `lift_anchor()` bỏ `wait()`. Nhổ neo, rồ máy, quay / lùi chạy cùng nhịp. Neo + tung lưới cùng nhịp có hàm `anchor_net(d)`. Commit 0ab2362, 2e70ae5, 9b41142, 27e717b, 180c87c.
- Gói 6 Buộc đuôi: `tether_grab()` nay là `reel_in()`, có hàm mới `reel_home(n)`. Màn ép dùng lục bình trôi chắn đường lùi. Gói 7–10 bật tời cuộn và hạ ngưỡng sao. Commit 5d435a2, c4a385e, 5c7d173, 4e450a1.
- Mùa 9: xuồng R1 có tời cuộn (c02bbaa). Hai chỗ phải thêm `reel_in` / `reel_out` vào hamGoc là `hoc/co-may.js` và `hoc/man-cuu-ben-song.js`.

## 3. Mùa 2 Nhà máy: đã làm

- Lõi (bea67c3, 36803b0) có hai cờ:
  - `cfg.ghiXich` (cần `lucBan`): phun mạnh cùng nhịp với hai xích. Tổng 0 thì đứng yên (`ghi-xich`), tổng ±2 thì phóng 2 ô (`phong`).
  - `cfg.phunKhiChay`: phun nhẹ cùng nhịp với đi thẳng thì đi 1 ô rồi phun từ ô mới.
- Màn (agent E rồi E2, commit d6be3ac…f4962aa):
  - Ghì xích: luc-ban.6 trình diễn, .7 ép, .9 hàm `brace_spray()`; dùng lại ở che-luc-ban.5, .10 và tong-hop-2.9.
  - Phun khi chạy: che-luc-ban.6 trình diễn, .9 ép. Màn ép dùng cửa nhịp chắn TIA NƯỚC. Chắn xe thì không ép được, vì lõi giữ cửa mở khi xe đứng trong ô cửa (`cua-ket`).
  - Phóng: trum-mua-2.8 trình diễn, .9 hàm `boost()` ép, .10 trùm.
  - Bỏ hàm `close_spray` và `far_push` (hai màn cũ bị thay).
  - Phim gói 6 thêm khung 4 ghì xích.
- Nghiệm thu: phiên chính chạy lại trên nhánh, mọi máy kiểm xanh (dòng kết quả nguyên văn):
  - kiem-luc-ban 145/0, kiem-che-luc-ban 58/0;
  - kiem-sung-hoi 210, kiem-che-sung-hoi 211, kiem-xich 137;
  - kiem-loi-mua-2 93, kiem-lach-mua-2 0 lỗ;
  - kiem-trum-mua-2 108, kiem-doi-sung-hoi 67, kiem-doi-mua-2 107;
  - kiem-loi-giai 67/67, kiem-huong-dan 40, kiem-phim-goi 55;
  - kiem-hoc 6716/0.

### Chờ user quyết (mùa 2)
1. **Gói 6 mới 7/20 (chỉ tiêu 15).** Sáu màn chọn lực (che-luc-ban.1–4, .7, .8) dùng chính cú giật làm bước đi, và trùm luc-ban.10 thì `brace_spray()` làm xe lệch cột. Agent nghiêng về:
   - nếu 15/20 là chỉ tiêu cứng: thêm một trạm ghì vào chương trình chính khoá của từng màn, khoảng 1 phiên;
   - nếu chỉ là ước lượng: để nguyên, hạ chỉ tiêu xuống 8–10.
2. **Gói 10 mới 4/20 (chỉ tiêu 5): đề xuất để nguyên.** Bật `ghiXich` sớm hơn trong gói thì bộ dò tìm ra một dãy lệnh cố định thắng mọi sân, phá ép cảm biến (trum-mua-2.7).
3. Màn trình diễn phun-khi-chạy (che-luc-ban.6) cách màn ép (.9) hai màn: đề xuất để nguyên. Màn 7, 8 tạo hàm mà gói sau còn gọi.

### Rủi ro còn lại (mùa 2)
- Chưa xem trên trình duyệt: che-luc-ban.6 (sân xoắn), .9 (hai cửa nhịp), trum-mua-2.8–.10 (sân .10 rộng 17 ô), khung phim 4. Lần thử sáng 14/11 bị các hộp "Bộ phận mới" che liên tục, chưa xem được sân.
- Cửa nhịp lần đầu xuất hiện ở mùa 2.
- Bản lưu cũ: sao lưu ở các màn bị thay nay ứng với bài khác; kho hàm có thể còn `close_spray` / `far_push`. Còn tên cũ trong `HAM_DEMO_MOT_LAN` (`hoc/man-chuoi-1.js`) và ánh xạ ở `hoc/game/luu.js`, vô hại.
- `kiem-che-luc-ban.mjs --loi-gia` báo "THIẾU: che-luc-ban.10: bộ dò". Lỗi này có từ trước đợt.

## 4. Mùa 4 Cảng sông: đang làm

Thứ tự gói theo kế hoạch mục 3, 6:
- **F1** cẩu quay 4 hướng (3e). XONG 14/11, merge 9ebfa0c: agent fable hết hạn mức giữa chừng, agent opus làm nốt 42 màn. Phiên chính kiểm lại trên main sau merge: kiem-man-mua-cang 200/200, kiem-mua-cang 126/0, kiem-ve-mua-song-cang 35/0, kiem-cau-do-mua-9 27/0, kiem-lai-mua-9 170/0, kiem-loi-giai 67/67, kiem-hoc 6716/0; tong-hop-cang.7 chạy trên trình duyệt 3 sao. Chờ user: tong-hop-cang.7 đổi tháp [20, 10] thành [11, 10] (luật tháp); `load_safe_stack(d)` thêm tham số (bản lưu cũ một tham số sẽ lỗi gọi hàm). Chưa xem phim mở gói cảng và các sân mới khác. Lịch sử: agent fable, nhánh `claude/mua-4-cau-4-huong`. Brief nằm ở `hoc/ban-giao/brief-ghep-nhip-F1-cau-4-huong.md`.
  - Lúc ghi biên bản, agent đã có commit cho gói 9, gói 10 và 20 màn cẩu mùa 9 (7bdf14a).
  - Agent tự ghi việc còn dở: doi-cang.2, .5, .7, .9, che-doi-cang.10 lệch nhịp phối hợp; tong-hop-cang.7, trum-mua-cang.8 dùng cọc phụ ở nấc chéo.
  - Nền máy kiểm cẩu ở main: kiem-mua-cang 126/0, kiem-man-mua-cang 200/200, kiem-ve-mua-song-cang 35/0, kiem-cau-do-mua-9 27/0, kiem-lai-mua-9 170/0.
- **F2** cần gạt đôi (3a). XONG 14/11, đã ff vào main (a4e4482), chưa push. Agent opus làm lõi (5526e83) rồi dừng; agent fable làm nốt (c9e18d8, 31e80be); phiên chính áp 3 ca kiểm hình (53d62a6). Nhánh claude/mua-4-can-gat-doi đã ff vào nhánh claude/ban-giao-ghep-nhip-8ada93.
  - Lõi: cờ `canGatDoi` bật gói 5–10 mùa 4 (`GOI_GAT_DOI` trong lo-trinh-hoc.js). Lệnh cẩu vào hàng chờ `cauCho`, `wait()` gom thành một nhịp theo thứ tự ray → quay → vươn → móc. Hàng đóng không `wait()` (lệnh cùng bộ phận lần nữa, đọc cảm biến, hết chương trình) thì mỗi lệnh một nhịp như cũ. Không có sự kiện 'cau-goi-lai' (brief có nhắc, lõi thấy không cần). Sửa thêm: màn nhiều robot, vết lệnh xả ra đứng ngay trước nhịp của nó, nên máy đo hết đếm nhầm gói 9.
  - Bật cờ, đo 120 màn gói 5–10: lệch 2. doi-cang.5 `wait_n(4)` → `wait_n(5)`; cang-cu.4 lời sai thêm 2 `wait()`.
  - Gói 5: duong-ray.4 trình diễn (khoá), .5 ép (tàu ghé 3 nhịp, tách 5 nhịp thua), .6 giấu kho hàm + ép, .7, .8 biến thể, .10 trùm; che-duong-ray.1 `rail_pick(dx)`, .3 `rail_drop(dx)` là hàm em có `wait()` ghép. BỎ 3 màn cũ: "Quét ba cột bãi cảng", "Vươn cần kết hợp chạy ray", "Chuyển cả chồng ở đầu ray". 19 màn nhanh lên vì hàm ghép: hạ giờ tàu rời + sửa sao tay.
  - Phim gói 5 không có câu "mỗi lệnh một nhịp" nên không sửa. san-ve.js không cần sửa: nhịp chia thời gian theo từng sự kiện.
  - Mùa 9: KHÔNG bật. Agent thử bật trong bộ nhớ cho 20 màn cẩu: lệch 0.
  - Nghiệm thu (phiên chính, tại worktree nhánh này, tuần tự): kiem-mua-cang 144/0, kiem-man-mua-cang 200/200, kiem-ve-mua-song-cang 38/0 (ca mới tự đỏ khi tắt cờ), kiem-cau-do-mua-9 27/0, kiem-lai-mua-9 170/0, kiem-nhap-mua-4-7 41, kiem-phim-goi 55/0, kiem-huong-dan 40/0, kiem-loi-giai 67/67, kiem-hoc 6716/0. do-ghep-nhip mua-4: 25/200, 4183 nhịp (trước 4343). Trình duyệt: duong-ray.5 chạy lời giải 3 nhịp, 3 sao, console không lỗi game.
  - Chờ user: (a) bỏ 3 màn cũ gói 5; (b) rail_pick / rail_drop đổi sang ghép ngay ở màn chế hàm, kho cũ bản 4 dòng sẽ thua "chua-giao-tau"; (c) bật cờ mùa 9 (lệch 0); (d) gói 6, 8, 9 mới 1/20 màn ghép: viết lại rail_carry2 / over_wall thành hàm ghép (~1–1,5 giờ); (e) đề duong-ray.5 viết sẵn từng nhịp (chữ nhiều, gần như cho lời giải).
  - Chưa xem trên trình duyệt: duong-ray.4 (khoá mã), .6 (giấu kho hàm), che-duong-ray.3, lời giải dài 16–18 dòng (.7, .8, .10). Chưa có ca kiểm riêng cho sửa vết lệnh nhiều robot. Bẫy: `pick_up(); rail(1); wait()` chạy ray trước rồi mới móc.
  - Brief: `hoc/ban-giao/brief-ghep-nhip-F2-can-gat-doi.md`.
- **F3** xếp chồng theo luật màu + số (3c). XONG 15/11: agent fable (dừng một lần vì hết hạn mức 5 giờ, gửi tin cho chạy tiếp), nhánh claude/mua-4-chong-luat, commit eae67ae…63f480f, đã ff vào main.
  - Lõi: `bongMo.chongLuat = [{ x, y, luat: 'nho-tren' | 'lon-tren', mau?, du? }]`, `SanHoc.soatChongLuat`, lỗi chấm `sai-luat-chong` (kieu treo / la-mau / thieu / thua / sai-chieu, chỉ chỗ sai đầu tiên). Ô không khai không xét. Không dùng chung với `bongMo.chong`. Lõi chồng, móc đôi, cần gạt đôi không đổi.
  - Hình: biển luật ở chồng đích ('bien-luat-chong': mũi tên + "nhỏ" / "lớn" + ô màu khi lọc), huy hiệu mũi tên vào / ra ở đỉnh chồng ('dinh-chong'), khung nét đứt quanh ô đích. Chỉ vẽ ở màn có chongLuat.
  - 9 màn thay: moc-cau.5 (trình diễn đảo khi bốc lẻ), .6 (luật nhỏ ở trên), .8 (ép, lớn ở trên, chồng tạm); nhac-doi.7 (trình diễn móc đôi giữ / bốc lẻ đảo), .8 (ép 3 sân, read_code chọn nhấc 1 hay 2), .9 (hai chồng); cang-cu.9 (3 sân, đọc hai mã so sánh); tong-hop-cang.7 (trình diễn luật kép theo màu, 2 sân), .8 (ép luật kép, 3 sân). Màn bị thay không có taoHam.
  - kiem-lo-trinh.mjs: thêm nhac-doi.8, .9, cang-cu.9 vào NHIEU_SAN_KHONG_TRUM (màn cảm biến nhiều sân, như mùa hang động; duLieuSan không hợp với read_code).
  - Nghiệm thu (phiên chính, tuần tự, sau commit cuối): kiem-chong-luat 76/0 (--pha: phải hỏng, hỏng đúng), kiem-mua-cang 144/0, kiem-man-mua-cang 200/200, kiem-ve-mua-song-cang 43/0, kiem-cau-do-mua-9 27/0, kiem-lai-mua-9 170/0, kiem-nhap-mua-4-7 41, kiem-phim-goi 55/0, kiem-huong-dan 40/0, kiem-loi-giai 67/67, kiem-hoc 6716/0; nền đỏ y nguyên (kiem-ve-vector 1/101 13a-v, kiem-lo-trinh 'combo'). do-ghep-nhip mua-4 25/200 (không tụt). do-meo-dien-so (agent chạy): không màn mới nào lách được. Trình duyệt: tong-hop-cang.7 thắng 2 sân 3 sao; biển luật đọc được ở sân 5 cột.
  - Chờ user: (a) biển luật ở sân 7 cột (moc-cau.6, ô ~30 px trên điện thoại) chữ "nhỏ" / "lớn" quá bé, gần như không đọc được; (b) chồng chỉ hiện số trên cùng, gói 2 phải ghi số các tầng trong đề (agent đề xuất bảng "chồng này có gì" khi bấm vào chồng); (c) nhac-doi.8, .9 dựa vào câu "đáy luôn là 50" trong đề; (d) gói 10 mất hai màn nhắc lại cũ (tháp ở .7, lọc đuôi 9 + cân tải ở .8), agent nghiêng về để nguyên; (e) đề tong-hop-cang.7 dài (luật "chữ ít"); (f) chương chia-du gói 2 chưa có màn màu.
  - Chưa xem: moc-cau.5, .8, nhac-doi.7–.9, cang-cu.9, tong-hop-cang.8 trên trình duyệt; phim / hướng dẫn gói có thể còn nhắc tên màn cũ (tháp, đuôi 9).
  - Brief: `hoc/ban-giao/brief-ghep-nhip-F3-chong-luat.md`.
- **F4a** tìm lớn nhất / nhỏ nhất theo hàng ngang (3f). XONG 15/11: agent opus (một lần đứt mạng, cho chạy lại), nhánh claude/mua-4-lon-nhat db56389…ed6d2d6, merge e1fa8fa. Không sửa lõi / hình.
  - 5 màn thay: can-tai.8 (trình diễn lớn nhất, 2 sân), .9 (ép, 3 sân), che-can-tai.8 (nặng nhất bằng weight(), 3 sân), cang-cu.7 (nhỏ nhất sau hàng rào, sân 8 cột, 3 sân), tong-hop-cang.9 (đỏ lớn nhất, c % 4 == 0, 3 sân). Trẻ tự viết vòng quét giữ kỷ lục, không max() / min(). Đích là bongMo.chong khai từng sân. Màn bị thay không có taoHam.
  - Máy kiểm mới hoc/kiem-lon-nhat.mjs 66/0 (--pha hỏng đúng): lời sai "làm theo sân 1" và "quên cập nhật kỷ lục" đều thua. kiem-lo-trinh: thêm can-tai.8, .9, che-can-tai.8, cang-cu.7 vào NHIEU_SAN_KHONG_TRUM. Ghép nhịp mùa 4: 25 → 29/200 (quay lần hai + set_down() chung một wait()).
  - Bài học: khay không chọn được hàm trong điều kiện while (kiem-nhap-mua-4-7 bắt): đọc c = read_code() trước while.
  - Chờ user: bài "nặng nhất" nằm ở chương 2 (che-can-tai.8), tách khỏi lớn nhất ở cuối chương 1 (agent nghiêng về để nguyên); khi sai, lời chấm chỉ nói "chồng chưa giống bóng mờ", chưa nói "chưa phải số lớn nhất" (muốn có phải sửa cham.js).
- **F4b** hàng tàu nối đuôi (3d). XONG 15/11: agent fable (dừng một lần vì hết hạn mức, cho chạy tiếp), nhánh claude/mua-4-hang-tau 5984c9a…2970a6e.
  - Lõi: cfg.hangTau = { o, can, cho? } (mảng song song khi nhiều sân). Chỉ tàu đầu hàng ở boong, luôn có mặt. Cuối nhịp boong có đúng một container đúng số: 'tau-roi-hang' rồi 'tau-vao' / 'het-hang-tau' cùng nhịp. Sai số hay hạ đôi: 'giao-nham' { hang: true }, thua. read_code() ở boong trống trả số tàu đầu hàng cần, hết tàu −1; boong có container thì đọc container như cũ. Mục tiêu giao-tau thắng khi hết hàng. cfg.tau / cfg.giao cũ không đổi nghĩa. Lời chấm riêng cho giao-nham / chua-giao-tau ("tàu tới trước nhận trước"). man-choi.js thêm một dòng đưa hangTau xuống Field.
  - Hình: bảng số ở bến ('bang-tau'), tàu chờ nối đuôi mang bảng số ('tau-cho', "+n" khi hết chỗ), tàu rời trôi xa mờ dần, cả hàng dồn lên.
  - Chương 2 gói 4 làm lại, tên "Chế lệnh: hàng tàu nối đuôi" (mã chương / huy hiệu giữ che-ben-tau): .1 trình diễn, .2 ép thứ tự, .3 vòng lặp, .4 bãi tạm, .5 chế move_tower2 (giữ tên, chữ ký, thân; gói 7, 9, 10 vẫn gọi được), .6 hai tháp bốn tàu, .7 trình diễn read_code ở boong (2 sân), .8 ép (3 sân), .9 chế serve_ship(), .10 trùm while c != -1. Bỏ hàm wait_ticks, ship_pair, ship_all_pair, ship_tower2, filter_ship (không màn nào khác gọi). Gói 10: trum-mua-cang.7 "Ngăn xếp gặp hàng đợi" (3 sân, chồng A + bãi tạm + hàng tàu, đúng ví dụ 3d).
  - Máy kiểm mới hoc/kiem-hang-tau.mjs 136/0 (--pha hỏng đúng); kiem-ve-mua-song-cang 52/0 (+9 ca). kiem-lo-trinh: thêm che-ben-tau.7, .8 vào NHIEU_SAN_KHONG_TRUM.
  - Chờ user: (a) chương 2 gói 4 mới không còn dạy chờ tàu theo chu kỳ (wait_ticks); (b) trum-mua-cang.7 dài 20 dòng, ba tầng if: agent đề xuất tách thành trình diễn + ép; (c) phim gói 4 chưa có cảnh hàng tàu (luật "mọi gói có cảnh cơ chế"); (d) trùm che-ben-tau.10 không ép được while (for range(4) cũng thắng).
- Nghiệm thu F4a + F4b (phiên chính, tuần tự, ở 2970a6e): kiem-hang-tau 136/0, kiem-lon-nhat 66/0, kiem-chong-luat 76/0, kiem-mua-cang 144/0, kiem-man-mua-cang 200/200, kiem-ve-mua-song-cang 52/0, kiem-cau-do-mua-9 27/0, kiem-lai-mua-9 170/0, kiem-nhap-mua-4-7 41, kiem-phim-goi 55/0, kiem-huong-dan 40/0, kiem-loi-giai 67/67, kiem-hoc 6716/0; do-ghep-nhip mua-4 29/200. Trình duyệt: cang-cu.7 thắng 3 sân 3 sao; che-ben-tau.6 bến có bảng số, ba tàu chờ nối đuôi rõ, thắng 3 sao; trum-mua-cang.7 thắng 3 sân (30 + 18 + 30 nhịp) 3 sao. Chưa xem: lúc thua giao-nham, che-ben-tau.7 (hộp nói khi read_code đọc boong), ảnh xem trước màn gói 4.

Nghiệm thu F1: chạy lại các máy kiểm trong brief ở main sau khi ff-merge. Xem cần quay trên trình duyệt (`hoc/game/choi.html?debug=1`, cổng 4193 cấu hình "game-main"). Mở màn bằng JS: `GoLoi.vaoNgay(ManHoc.timMa('<mã>')); GoLoi.napLoiGiai(null,false)`; lớp phủ `.pclb` che màn thì ẩn đi.

## 5. Mùa 7 Mỏ đá: chưa làm

Theo kế hoạch mục 5:
- Lõi: cờ `cheoGhep` (trượt + đi thẳng = chéo 1 ô) và cờ `nemDa` (ngắm 1–2, ném + tiến = tầm + 1, sự kiện `khong-co-da`).
- Màn gói 5: hàm em `dir_fl` / `dir_fr` / `dir_bl` / `dir_br` thay `diag_*`.
- Màn gói 6: ném đà.
- Sửa các màn đang dùng aim(3): gói 6 có 8 màn, gói 8 và gói 9 mỗi gói 1, mùa ẩn 7. Sửa thêm 11 màn chéo ở các gói sau.

## 6. Nền đỏ có sẵn (không do đợt này)
- `hoc/kiem-lo-trinh.mjs`: AssertionError ở thứ tự gói mùa 1 ('combo' / 'hai-robot'). Lỗi dừng ở mục đầu nên các mục mùa 2 phía sau của máy kiểm này KHÔNG chạy. Agent E2 phải kiểm bằng một bản tạm.
- `hoc/kiem-ve-vector.mjs`: HỎNG 1/101, mục 13a-v, từ commit 2f0cac4 "mắt ba vòng".

## 7. Luật làm việc đã áp
- Agent không chạy `npm test` cả bộ (từng hết RAM); chạy từng máy kiểm ở tiền cảnh với `timeout 300`.
- Agent không push, không merge main, không dùng `git checkout --` / `reset --hard` / `stash`.
- Gói fail một lần thì giao lại ở model cao hơn một bậc. Agent E (opus) treo lúc chờ máy kiểm chạy nền, nên E2 giao cho fable.
- Ngưỡng sao sửa tay ở `hoc/lo-trinh-sao.js`, không chạy `--ghi-sao`.
- Còn sót worktree `.claude/worktrees/nghiem-thu`: xoá bị "Permission denied".
