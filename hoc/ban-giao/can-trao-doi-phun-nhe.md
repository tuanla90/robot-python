# Cần trao đổi lại: đợt phun nhẹ (đêm 29–30/10)

User treo máy, dặn: "cứ làm và tự quyết các phần đơn giản, xong gói nào commit gói đó, note lại những điều cần trao đổi lại".
Nhánh: `claude/phun-nhe` (worktree `.claude/worktrees/phun-nhe`). Dưới đây là chỗ Claude TỰ QUYẾT và chỗ cần user chốt.

## Đã làm (theo commit)

1. **Lõi + đổi tên** (phần 1): shoot → spray, shoot_back → spray_back; lực "fast" / "charge" → "low" / "high"; spray() không đối số = phun nhẹ
   (tầm 2 ô, không giật). Gõ shoot() thì game báo "shoot() giờ là spray()". Kho hàm, bản nháp, sân thử đã lưu của người chơi được chuyển tên một lần lúc mở game.
2. **Lực mạnh mở theo lộ trình**: mọi màn từ luc-ban.1 trở đi tự được chọn lực (lo-trinh-hoc.js); màn đội khai theo từng xe; robot không vòi phun bỏ qua cờ.
3. **Gói 2 Vòi phun** dựng lại (phần 2): Phun mở van (trình diễn) · Van phía sau (ép spray_back) · Hai ô là hết tầm · Phun qua hàng rào · Quay về phía van ·
   Tắt băng · Thùng chắn tia nước · Một van hai cửa · Hai van hai cửa (for) · Nhà máy hơi (trùm). Không còn cú giật nào trước gói 6.
4. **Gói 4 chương Chế lệnh vòi phun** dựng lại (phần 3): chế puff(), puff_back(), open_left(), open_right(), open_behind() (đầu sau hỏng);
   vòi lắp ngược sửa fixed_open(); Đường về (come_back ngược go_out); trùm Ba van ba cửa.
5. **Gói 6 Lực phun** (phần 4): luc-ban.1 thành màn trình diễn PHUN MẠNH (van cách ba ô, cú giật đưa xe tới hàng cửa), luc-ban.2 ép đổi "low" thành "high",
   màn "Bắn nhanh" cũ thành luc-ban.3 "Thùng sau lưng". Bỏ màn "Nhanh hay tụ" (gần trùng luc-ban.4).
6. **Chữ và phim** (phần 5): thẻ Vòi phun, Sổ lệnh, lời chẩn đoán (màn chưa mở lực thì khuyên "đưa xe tới gần hơn", không gợi ý "high"), phim gói 2 không còn giật,
   phim gói 4 khung 4 thành "thùng nặng chắn lối" (nhá gói 5 Đẩy thùng), lời phim gói 2, 4, 6, 9.

## Đã tự quyết (user xem, chốt hay bảo đổi)

1. **Tên hàm em tự chế có chữ vũ khí** đổi theo:
   fire → squirt · fire_back → squirt_back · smart_fire → smart_spray · pick_fire → pick_spray · aim_fire → auto_spray ·
   aim_left → auto_left · aim_right → auto_right · aim_left_on → auto_left_on · aim_on → auto_on · aim_turn → auto_turn · quick_aim → quick_pick ·
   fire_left → squirt_left · shot_right → squirt_right · close_fire → close_spray · clear_shot → wait_cool · wait_aim → wait_auto ·
   shot_clear → clear_squirt · blast_left → spray_left · blast_right → spray_right · left_shot → side_spray · lock_on → valve_on ·
   lock_left → valve_left · lock_row → valve_row · go_fire → go_spray · push_blast → push_spray · pair_shot → pair_spray ·
   cover_shot → cover_spray · fire_on → open_valve · box_shot → box_spray · fire_clear → wait_spray.
   Giữ: kick_* (bóng đá), cover, guard, lock_rival (đua robot), aim(n) của máy ném (lệnh gốc mùa khác).
2. **Hàm chế ở gói 4 cũ đi bằng cú giật** (jet_back, jet_fwd, kick_right, kick_left, tap_right, kick_ahead) bỏ hẳn. Màn sau gói 6 đang gọi chúng đổi sang hàm
   gói 6 cùng động tác: jet_back() → squirt("high"), jet_fwd() → squirt_back("high"), kick_right() → squirt_left("high"), kick_left() → squirt_right("high").
   Màn đố tong-hop-2.2 ("jet_back() không lùi") đổi theo thành squirt("high").
3. **puff()** ở gói 4 là bước đệm cho squirt(p) ở gói 6 (cùng thân spray(), wait(), gói 6 thêm tham số lực).
4. **be-sung.4** hành lang dài thêm một ô (van cách ba ô) để phun nhẹ không tới, vẫn phải phun mạnh trên bệ vòi.
5. **rap-tay.7** (lắp ráp): lời giải mới phun nhẹ ra sau trúng van, nhanh hơn một nhịp (8 thay 9).
6. **Tên chương** (tên cũ sai với luật mới): sung-hoi "Phun là lùi" → "Phun mở van"; che-sung-hoi "Chế lệnh: phun để đi" → "Chế lệnh: mở van";
   luc-ban "Phun nhanh, phun tụ" → "Phun mạnh, phun nhẹ".
9. **day-thung.1** (màn trình diễn gói 5): gói 2 không còn màn đẩy thùng vào đích, nên mục tiêu "đẩy thùng vào ô khung vàng" ra mắt cùng xích đẩy thùng ở màn
   trình diễn này. Máy kiểm "mỗi màn một điều mới" miễn đúng đặc trưng đó ở màn trình diễn.
10. Nền so hình cố định: kiem-ve-vector 13a-v dời sang 4548dda (chỉ lệch tia phun nhẹ sung-hoi.3, luc-ban.8 do đổi chữ "fast" → "low"); kiem-huy-hieu-phim-vector
   B5-v dời sang d3917d2 (so với 4548dda chỉ lệch phim gói 2 khung 3, 4).
7. **sung-hoi.2** tên "Van phía sau" (tên "Van sau lưng" đã có ở be-sung.2).
8. Thứ tự lộ trình: sung-hoi 1–6, 8, 7, 9, 10; che-sung-hoi 1–7, 9, 8, 10 (luật đường cong dòng / nhịp / ô).

## Đợt 2 (30/10, user: "quét chữ và làm lại các màn cần thiết")

1. **Quét chữ**: mọi chữ hiện cho người chơi ở mùa 2 (đề, gợi ý, lời sai, hướng dẫn, Sổ lệnh, chẩn đoán, tên gói) đổi "bắn" sang "phun":
   bắn tụ → phun mạnh, bắn nhanh → phun nhẹ, lực bắn → lực phun, nút bắn → van. Gói 6 tên "Lực phun", chương 2 "Hàm lực phun".
   Màn nam châm (che-nam-cham, doi-tay-xoay, chẩn đoán đổi cực) đổi "bắn vật" → "hất vật" (màn "Bắn vật" thành "Hất vật"). Giữ "ngắm" của máy ném.
   Chú thích trong code các tệp màn cũng theo; chú thích lõi san-hoc.js giữ nguyên (lịch sử thiết kế).
2. **che-doi-sung-hoi.5 thành "Thùng báo tin"**: mỗi van trên cao mở một cửa ở làn omni; hàng rào chắn nên xe vòi phun phải phun mạnh, cú giật đẩy thùng
   sau lưng xuống ngách. Omni quay mặt lên, không thấy cửa, chỉ thấy thùng rơi xuống trước mặt: catch_crate() (while front_clear(): wait()) chờ tín hiệu đó
   rồi slide_r(2) qua cửa. Không chờ hay viết nhầm như wait_gate() thì omni đâm cửa đóng; phun nhẹ thì tia không tới van (25 ô, 18 nhịp).
3. **che-luc-ban.8** bỏ hai back(): chương trình chính chỉ còn auto_turn() hai lần (4 nhịp), xe mờ đứng ngay chỗ xe theo thùng xuống.
   Để qua luật đường cong, che-luc-ban.9 bớt một nhịp: bỏ ô cuối hành lang, xe mờ đứng trên cửa thứ hai (forward(2) → move()).

## Đợt 3 (30/10, user: "tầm 2 okie, tên chương và gói đặt theo chuẩn chung trước đi")

Đối chiếu tên gói / chương mùa 2 với quy tắc 2, 3 (KE-HOACH-7-MUA.md): tên gói giữ (đúng thẻ part hoặc món nâng cấp). Đổi bốn tên chương:
`bang-chuyen` "Lên băng chuyền" → "Trôi theo băng" và `day-thung` "Đẩy thùng nặng" → "Đưa thùng vào đích" (chứa trọn tên gói);
`che-do-nhiet` "Chế lệnh: mở van" → "Chế lệnh: mở van nguội" (trùng che-sung-hoi); `tong-hop-2` "Đủ bộ" → "Thử mọi món" (trùng mùa 1).
Màn luc-ban.6 "Nhanh để bấm, tụ để đẩy" (sót chữ lực cũ) → "Nhẹ để mở, mạnh để đẩy".
Quét chữ "phát" (user: "Quét chữ phát"): mọi chữ người chơi thấy có "phát" nghĩa một lần phun đổi thành "lần" / "lần phun" (cham.js, thẻ part,
hướng dẫn, đề / gợi ý / lời sai ở sung-hoi, che-sung-hoi, luc-ban, che-luc-ban, be-sung, doi-sung-hoi, doi-thu-manh, trum-mua-2). Tên màn:
"Phun một phát" → "Phun một lần" (che-sung-hoi.1), "Hai phát một chỗ" → "Hai lần phun một chỗ", "Ba phát quanh mình" → "Ba lần phun quanh mình".
Giữ "xuất phát", "phát lại". Lời mô tả trong máy kiểm (.mjs, người chơi không thấy) chưa đổi.
Chưa đổi: tên huy hiệu (mùa 1 cũng chưa đổi; vài cái còn "Huy hiệu Hàm …", "Huy hiệu Tổng hợp mùa 2").

## Cần user chốt

1. (đã làm ở đợt 2) che-doi-sung-hoi.5.
2. (user 30/10: đặt theo chuẩn chung) Tên chương gói 2 và gói 6, xem Đợt 3.
3. (đã làm ở đợt 2) che-luc-ban.8.
4. (đã làm ở đợt 2) quét chữ "bắn".
5. (user chốt 30/10) Tầm phun nhẹ giữ 2 ô.
6. Đổi "bắn vật" của nam châm thành "hất vật": user xem có ưng không (đó không phải vòi phun, nhưng giữ luật không dùng chữ vũ khí).
