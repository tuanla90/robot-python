# Cần trao đổi lại: đợt phun nhẹ (đêm 29/10)

User treo máy, dặn: "cứ làm và tự quyết các phần đơn giản, xong gói nào commit gói đó, note lại những điều cần trao đổi lại". Dưới đây là các chỗ Claude TỰ QUYẾT; user xem rồi chốt hoặc bảo đổi.

## Đã tự quyết

1. **Tên hàm em tự chế có chữ vũ khí** (đổi theo, kho của người chơi được chuyển một lần lúc mở game):
   fire → squirt · fire_back → squirt_back · smart_fire → smart_spray · pick_fire → pick_spray · aim_fire → auto_spray ·
   aim_left → auto_left · aim_right → auto_right · aim_left_on → auto_left_on · aim_on → auto_on · aim_turn → auto_turn · quick_aim → quick_pick ·
   fire_left → squirt_left · shot_right → squirt_right · close_fire → close_spray · clear_shot → wait_cool · wait_aim → wait_auto ·
   shot_clear → clear_squirt · blast_left → spray_left · blast_right → spray_right · left_shot → side_spray · lock_on → valve_on ·
   lock_left → valve_left · lock_row → valve_row · go_fire → go_spray · push_blast → push_spray · pair_shot → pair_spray ·
   cover_shot → cover_spray · fire_on → open_valve · box_shot → box_spray · fire_clear → wait_spray.
   Giữ: kick_* (bóng đá), cover, guard, lock_rival (đua robot), aim(n) của máy ném (lệnh gốc mùa khác).
2. **Gõ tên cũ** shoot() / shoot_back(): game báo "shoot() giờ là spray()" (không chạy ngầm như bí danh).
3. **Lực mạnh mở theo lộ trình**: mọi màn từ luc-ban.1 trở đi tự được chọn lực (lo-trinh-hoc.js), màn đội khai theo từng xe; robot không vòi phun bỏ qua cờ.
   Màn trước gói 6 chỉ có spray() / spray_back() (phun nhẹ, tầm 2 ô, không giật).
4. **Hàm chế ở gói 4 đi bằng cú giật** (jet_back, jet_fwd, kick_right, kick_left) không còn hợp với gói 4. Màn sau gói 6 đang gọi chúng đổi sang hàm của gói 6 cùng động tác:
   jet_back() → squirt("high"), jet_fwd() → squirt_back("high"), kick_right() → squirt_left("high"), kick_left() → squirt_right("high").
   Màn đố tong-hop-2.2 ("jet_back() không lùi") đổi theo. Gói 4 chế hàm mới dùng phun nhẹ.
5. **be-sung.4** hành lang dài thêm một ô (van cách ba ô) để phun nhẹ không tới, vẫn phải phun mạnh trên bệ vòi.
6. **rap-tay.7** (lắp ráp): lời giải mới phun nhẹ ra sau trúng van, nhanh hơn một nhịp (8 thay 9).

## Cần user chốt

(điền tiếp khi làm gói 2, gói 4, gói 6)
