# Mùa 3: ghi chú cần trao đổi lại với user (phiên "Mùa 3", từ đêm 29/10)

User 29/10 tối: "tôi treo máy đêm nay, bạn cứ làm và tự quyết các phần đơn giản. Xong gói nào commit gói đó. note lại những điều cần trao đổi lại".
Nhánh làm: `claude/mua-3-man` (worktree `.claude/worktrees/mua-3-man`, tách từ main f18b538). Chưa gộp main, chưa push.

## Tình trạng (sáng 30/10)
- Mùa 3 đủ **200 màn** (41 màn có sẵn + 159 màn mới), 10 gói × 2 chương × 10 màn, mỗi gói một commit.
- `node hoc/kiem-man-mua-3.mjs`: mọi màn mới lời giải thắng 3 sao đúng ngưỡng, mã mẫu thua, lời sai thua đúng mã chẩn đoán (889 kiểm).
- `node hoc/kiem-lo-trinh.mjs`: mục (h) đường cong mùa 3 nay là phép kiểm thật (lề dòng 3 / nhịp 4 / ô 6 như mùa 2), 0 chỗ nhảy.
- `node hoc/kiem-lach-mua-3.mjs` (mới): máy dò lời giải lách mùa 3, 0 lỗ ngoài danh sách chấp nhận; `--loi-gia` bắt được lỗi giả.
- Lõi đệm từ P1b (công tắc nút đè, đệm kéo vật, vật bị đệm giữ) có máy kiểm `hoc/kiem-dem-tu.mjs` mục A2 (13 ca, `--loi-gia` đỏ).

## Câu hỏi cần user trả lời
1. ĐÃ XỬ LÝ (user 30/10 "Viết lại cho phù hợp"): che-nhen.7 "Đường về" viết lại ngắn hơn: go_in() = crawl("D"), jump("R"); come_back() = jump("L"),
   crawl("U"); 16 nhịp (trước 24), đường cong che-nhen.3 12 → che-nhen.7 16 → che-nhen.6 24. kiem-che-nhen cập nhật theo.
2. ĐÃ XỬ LÝ (user 30/10 "vẽ 20 huy hiệu"): mỗi chương một huy hiệu trên màn cuối (trùm), bảng HUY_HIEU_3 ở lo-trinh-hoc.js. 17 hình vector mới
   (huy-hieu-vector.js) + 3 hình có sẵn giữ nguyên vì phanh A3-v (nhen, nam-cham, che-nhen). Màn có sẵn đổi huy hiệu theo chương mới: nhen.10 → nhay,
   nam-cham.10 → doc-cuc, che-nam-cham.10 → che-doc-cuc. Hai chương đội dùng mã mới doi-xich-nhen / che-doi-xich-nhen (bí danh cũ y nguyên).
   Trùm mùa trum-mua-3.10 = xe-tham-do. Máy kiểm: kiem-lo-trinh (i), có lỗi giả.
3. **Luật đệm từ P1b** tôi tự chốt (đảo lại được), cần user chơi thử:
   - Công tắc: `demTu: [{ x, y, cuc, nut: { x, y }, khiDe: 'bat' | 'tat' }]`, nút là ô M. 'bat' (mặc định): đè thì đệm chạy; 'tat': đè thì đệm tắt.
     Đệm đổi từ NHỊP SAU khi nút đổi (nút đè cập nhật cuối nhịp, như cửa). Vật nằm trên nút cũng đè được.
   - Đệm đang chạy kéo / đẩy vật sắt và vật nam châm nằm đất 1 ô mỗi nhịp (sắt và khác cực: hút, cùng cực: đẩy), robot đứng giữa thì chắn.
   - Vật đang bị đệm HÚT (trong tầm, đường thông) thì tay kẹp không gắp, nam châm không hút / không đẩy được (lời chẩn đoán "đệm đang hút giữ nó,
     tắt đệm trước"). Vật đã dính mũi xe / bụng nhện thì đệm không giật ra.
   - Xích (không nam châm) bị đệm hút như sắt: trùm mùa trum-mua-3.10 và trum-mua-3.7 dùng chuyện này (nhện đứng lên nút tắt đệm cho xích qua).
   - Vẽ: đệm tắt phủ tối, không thở; dây nối nút ↔ đệm vẽ như dây nút ↔ cửa. Trên sân nhỏ dây khó thấy, user xem giúp.
4. ĐÃ XỬ LÝ (user 30/10 "sửa lại tên cho phù hợp"): iron_run(n) → `fetch_iron(n)`, detour(k) → `loop_right(k)` (hàm của màn sửa: `loop_left(k)`),
   call_iron() → `pull_iron()`, idle(n) → `wait_n(n)`; giữ `pass_box()`, `hop_drop(d)`. Hàm của màn trình diễn: `get_iron(n)`, `rest(n)`. Còn muốn đổi thì nói tên.
5. **Máy dò lách**: 6 lỗ chấp nhận có lý do (che-bai-tu.4, che-bai-tu.9 tham số; che-doc-cuc.2 là lách giả; nam-cham.6, che-nam-cham.7, che-nam-cham.5
   là màn có sẵn một sân). Màn nhện (không gắn được cảm biến làm dấu) và màn hai robot máy dò bỏ qua. Muốn ép chặt hơn thì phải sửa màn có sẵn.
6. **Giao diện and / or** (gói 2): cờ màn `vaHoac: true` mở nút "+ and" / "+ or" cho điều kiện toàn cảm biến. Cần user xem trên máy thật.

## Quyết định đã tự chốt (đảo lại được)
1. Gói 1 chương `nhen`: màn trình diễn nhen.11 đứng đầu; chưa dùng crouch / stand (gói 5) và chưa dùng chuỗi (chương 2). Hàm của em mới: `step_down()`, `stairs(n)`.
2. Gói 1 chương `chuoi-nhen`: hàm của màn `step_to(d)` cho hai màn đầu, hàm của em mới `trail(path)`; không dùng `+` / `*` chuỗi (khay khối chưa có).
3. Máy đo đường cong: miễn màn trình diễn chiChay như mùa 2 (g). Màn mới được xếp chỗ (dòng chương trong MUA_3) để không có chỗ nhảy.
4. Gói 2: khay chỉ cực N; hàm `to_turn()`. Vừa rẽ phải thì bên phải là đường cũ, nên màn to_turn cho xe tiến một ô sau mỗi lần rẽ.
   Vài màn có "ô phụ" (ô sàn tách rời) để số ô tăng dần (logic-nam-cham.4 / .5); bỏ được bằng cách đổi thứ tự.
5. Gói 3: xe gắn cả cảm biến khoảng cách lẫn cảm biến từ; hàm seek_iron(), take_iron(), seek_safe(), face_iron().
6. Gói 4 Bãi từ: chỉ có magnet_n (magnet_s từ gói 6). Đệm S luôn hút xe (bật N là khác cực); đệm N thì bật N để được đẩy vào tường.
7. Gói 5: 4 màn mới xen giữa 6 màn có sẵn của chương Nhảy.
8. Gói 8 Đội xích và nhện: R1 xích tay kẹp + cảm biến khoảng cách, R2 nhện (có / không tay kẹp). Chương doi-xich xếp: 11, 12, 13, 14, 15, có sẵn .3,
   16, 17, có sẵn .9, 18 (trùm) để nhịp tăng 14 → 20 → 28 → 42 → 60. che-doi-xich màn mới khai số 11–20 (mã 1–10 đã dùng ở mùa 4).
9. Gói 10: tong-hop-3 ôn từng cặp gói; trum-mua-3 trộn nhiều gói, trùm mùa là màn đội có đệm và nút tắt. Không tạo hàm mới ở gói 10.
10. Thêm cấu hình `game-mua-3` (cổng 4197) vào `.claude/launch.json` của repo gốc để xem bản của nhánh này (4181 đang trỏ worktree khác).

## Đã gộp main (30/10, user "đưa lên main cho tôi chơi thử")
- Gộp main (phun nhẹ) vào nhánh, rồi main tua tới nhánh. Chưa push (origin/main vẫn ở f18b538).
- Mở mùa 3: bỏ `an: true` của mua-3 ở thu-tu-chuong.js, tab "Mỏ quặng" hiện ở màn chọn gói. Mùa 3 vẫn là mùa bán riêng: chưa mua thì bấm "Mua thử"
  (chỉ ghi cờ trên máy), hay bật Gỡ lỗi "Mở hết". Máy kiểm đổi theo: kiem-lo-trinh (mùa 3 hiện, tên Mỏ quặng, có `ban`; nhen, doi-xich thuộc mua-3),
  kiem-goi-doi (gói đội vào khung mùa 3: mùa 3 hiện).
- kiem-o-so (chỉ dò mùa đã mở) bắt trum-mua-3.7 dùng wait_n(14) mà bảng chọn số chỉ 0–12: lời giải đổi thành wait_n(7), wait_n(7), sao.o 55 → 56.

## Việc còn lại (chờ user)
- Phim mùa 3 ĐÃ LÀM (30/10): game/phim-mua-3.js, 10 phim 34 khung, kịch bản KE-HOACH-PHIM-GOI.md mục 3d, tem "Xe thăm dò R1"; kiem-phim-goi mục 1c.
  Đã xem từng khung trên trình duyệt (không lỗi console); user xem lại giúp lời và cảnh.
- Còn: soát 200 / 200 màn trên trình duyệt (KE-HOACH-MUA-3 mục 3 bước P2).
