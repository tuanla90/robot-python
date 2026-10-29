NHỊP (đọc trước): commit đầu tiên trong ~20 phút (lõi: tên lệnh mới + mặc định "low" + máy kiểm lõi); sau đó mỗi nhóm tệp một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

SONG SONG: có thể có phiên khác gộp việc vào main; bạn làm trên nhánh riêng. CẤM định dạng lại tệp, CẤM npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4208.

LOẠI: Ship          MODEL: fable (điểm: quy mô 2 (khoảng 30 tệp), choke 2 (san-hoc.js / cham.js / dữ liệu lưu của người chơi), giá sai 2 (kho hàm cũ của người chơi hỏng), mơ hồ 1, suy luận 1 = 8)

MỤC TIÊU: xong khi lệnh vòi phun có tên không mang nghĩa vũ khí, gọi không đối số là PHUN NHẸ, lực mạnh là thứ mở khoá ở gói 6; mọi màn ĐỨNG SAU gói 6 (Lực phun) vẫn thắng 3 sao bằng cách viết lực mạnh rõ ràng; dữ liệu lưu cũ của người chơi vẫn chạy; máy kiểm đạt. Dựng lại các màn ĐỨNG TRƯỚC gói 6 là việc của brief B (brief-phun-nhe-b.md), KHÔNG làm ở đây.

QUYẾT ĐỊNH CỦA USER (29/10, không tự đi ngược):
- "shot mặc định không có biến nên là fast, để sau đó mở khoá charge sẽ ý nghĩa hơn"; "low vs high okie với điều kiện sửa tên hàm shoot"; chọn "giữ gói 6 (Lực phun), dựng lại hết".
- Đổi tên lệnh cho người chơi: shoot() → spray(), shoot_back() → spray_back(). Lực: "fast" → "low", "charge" → "high".
- spray() / spray_back() KHÔNG đối số = "low" (luật của "fast" hiện nay: tia bay tối đa TAM_BAN_NHANH = 2 ô, xe không giật). "high" = luật của "charge" hiện nay (tia bay tới vật cản đầu tiên, xe giật; giật vào thùng nặng theo luật giật một ô).
- Màn chưa mở lực (không có cfg.lucBan): chỉ viết spray() / spray_back() không đối số; có đối số thì báo lỗi như 'luc-chua-mo' hiện nay. Màn có cfg.lucBan: nhận "low" / "high"; chữ khác báo 'luc-ban-sai' (thông điệp nêu "low" hoặc "high").
- Không dùng chữ vũ khí trong tên lệnh / tên hàm người chơi tự chế: shoot, shot, fire, blast, aim, gun, lock_on... Chữ "fire" để dành cho phần tử ĐÁM CHÁY sau này (KE-HOACH-7-MUA.md), nên không còn hàm nào tên fire*.

VIỆC:
1. Lõi (hoc/san-hoc.js, hoc/cham.js, nơi khai báo lệnh có sẵn / TAY_HOI / LUC_BAN): tên lệnh spray / spray_back, LUC_BAN = ['low', 'high'], mặc định 'low'. Mã nội bộ (mã sự kiện 'ban', 'giat', luc trong sự kiện, mã part 'sung-hoi', khoá lưu) GIỮ hoặc đổi tuỳ bạn nhưng phải nhất quán và không làm vỡ hoạt cảnh; ưu tiên GIỮ mã nội bộ, chỉ đổi thứ người chơi thấy. Viết shoot() / shoot_back() cũ: báo lỗi thân thiện "shoot() giờ là spray()" (không chạy ngầm như bí danh). Chú thích luật (mục SÚNG HƠI, LỰC BẮN, BỆ SÚNG XÍCH) ghi luật mới.
2. Hàm em tự chế có chữ vũ khí (taoHam / hamCuaEmMoi / mã mẫu / lời giải trong hoc/man-*.js; danh sách đo được: aim_fire, aim_left, aim_left_on, aim_on, aim_right, aim_turn, blast_left, blast_right, box_shot, close_fire, fire, fire_back, fire_clear, fire_left, fire_on, go_fire, lock_left, lock_on, lock_row, push_blast, shot_clear, smart_fire; tự grep thêm): đổi sang tên tiếng Anh dễ hiểu theo việc hàm làm (vd blast_left → spray_left, fire_on → open_valve...). Tên phải duy nhất, không trùng lệnh có sẵn, giữ nghĩa để màn sau gọi lại đúng. Ghi BẢNG ĐỔI TÊN (cũ → mới → hàm làm gì) ở đầu báo cáo và trong chú thích đầu tệp nơi bạn đặt bảng di trú.
3. Dữ liệu lưu của người chơi (hoc/game/luu.js: kho hàm KhoHam.ghiLuu, bản nháp duong-hoc:nhap:*, sân thử của Xưởng): di trú MỘT LẦN lúc khởi động: thay tên theo bảng (shoot → spray, shoot_back → spray_back, các hàm tự chế, chuỗi "fast" / "charge" trong lời gọi spray) theo ranh giới từ, có cờ phiên bản để không chạy lại. Hỏng thì bỏ qua không lỗi (mọi thứ trong luu.js bọc try/catch). Có máy kiểm cho hàm di trú (chuỗi mẫu trước / sau).
4. Màn ĐỨNG SAU gói 6 có lời giải dựa vào bắn không đối số mà cần giật / tầm xa (đo trước: be-sung.1–3, tong-hop-2.2, doi-sung-hoi.1–10, che-doi-sung-hoi.4/7/8/9/10, doi-mau.1/2/3/9/10, che-doi-mau.4/5/10, rap-tay.7/10, rap-du.4/7; số này là SÀN, tự đo lại): bật cfg.lucBan nếu chưa có và viết spray("high") / spray_back("high") ở lời giải, lời giải khác, mã mẫu, lời sai, gợi ý. Sao giữ như cũ (đo lại; lo-trinh-sao.js nếu sao được đo). Màn trong chương luc-ban / che-luc-ban: chỉ đổi tên và chữ lực ở bước này, việc đổi ý dạy (gói 6 thành nơi lần đầu xe giật) thuộc brief B.
5. Chữ người chơi thấy: đề bài, gợi ý, veMaMau, lời sai, thông điệp lỗi, Sổ lệnh (so-lenh.js), thẻ bộ phận (gioi-thieu-part.js), hướng dẫn màn (huong-dan-man.js), phim (phim-mua-2.js, chu.js pg.*), tooltip khối lệnh, trang tài liệu nếu có. Theo quy tắc đặt tên và giọng kể (hoc/KE-HOACH-7-MUA.md mục "Quy tắc đặt tên và giọng kể"): câu nào em sửa thì dùng "phun / xịt" thay "bắn", "phun nhẹ / phun mạnh" thay "bắn nhanh / bắn tụ". Không emoji, không gạch dài. Câu đang dạy "phun thì xe giật" ở gói 2–5 KHÔNG sửa ý ở đây (brief B dựng lại), chỉ đổi tên lệnh.
6. Máy kiểm hoc/kiem-*.mjs và bộ dò hoc/do-duong-*.mjs có chuỗi shoot / "fast" / "charge": đổi theo. Nền cố định (kiem-ve-vector 13a-v, kiem-huy-hieu-phim-vector, kiem-bang-mau SUA_SAU_NEN): lệch thì dời / ghi miễn theo cách có sẵn, chứng minh chỉ chỗ cố ý lệch.

BỐI CẢNH:
- Đo của người giao (29/10, đổi mặc định thành bắn nhanh trên bản sao): 46 lời giải mất sao. 15 màn đứng trước gói 6 (sung-hoi.1–10, che-sung-hoi.3/6/7/9/10): để brief B. 31 màn sau: việc 4 ở trên.
- Nhánh giật một ô (claude/giat-mot-o, luật thùng nhích 1 ô) gộp vào main trước khi bạn bắt đầu; làm trên main mới nhất.
- Lời giải các màn trước gói 6 sẽ hỏng sau bước 1 (mong đợi). Máy kiểm của sung-hoi / che-sung-hoi được phép đỏ ĐÚNG ở các màn đó: ghi danh sách màn đỏ trong báo cáo, KHÔNG sửa màn đó. Mọi máy kiểm khác phải xanh.

PHẠM VI: được sửa hoc/san-hoc.js, hoc/cham.js, hoc/game/luu.js (di trú), hoc/game/*.js chứa tên lệnh / khối lệnh, hoc/man-*.js (chỉ đổi tên + việc 4), hoc/lo-trinh-hoc.js (chữ, sửa màn), hoc/lo-trinh-sao.js, hoc/kiem-*.mjs, hoc/do-duong-*.mjs, chu.js, so-lenh.js, gioi-thieu-part.js, huong-dan-man.js, phim-mua-2.js (chữ và mã hiện trong phim), KE-HOACH-MUA-2.md (một dòng trạng thái).
KHÔNG sửa: luật khác (tầm 2 ô, giật một ô, băng chuyền, cửa, van, bệ vòi xích không giật), ý dạy của màn trước gói 6, phim mùa 1, mã part / khoá lưu tiến độ (sao của người chơi theo m.ma phải còn).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): bỏ sót chỗ có tên lệnh, tên mới không hợp, cách di trú đơn giản hơn, màn sau gói 6 không nên bật lucBan (vd màn đội mà người chơi chưa học chọn lực). Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-sung-hoi.mjs; node hoc/kiem-che-sung-hoi.mjs (chỉ được đỏ đúng 15 màn trước gói 6); node hoc/kiem-luc-ban.mjs; node hoc/kiem-che-luc-ban.mjs; node hoc/kiem-be-sung.mjs; node hoc/kiem-trum-mua-2.mjs; node hoc/kiem-doi-sung-hoi.mjs; node hoc/kiem-doi-mua-2.mjs; node hoc/kiem-rap-du.mjs; node hoc/kiem-do-nhiet.mjs; node hoc/kiem-bang-chuyen.mjs; node hoc/kiem-day-thung.mjs (ls hoc/kiem-*.mjs: chạy máy kiểm của MỌI tệp bạn sửa)
  node hoc/kiem-lo-trinh.mjs; node hoc/kiem-lach-mua-2.mjs; node hoc/kiem-hoc.mjs; node hoc/kiem-huong-dan.mjs; node hoc/kiem-gioi-thieu-part.mjs; node hoc/kiem-phim-goi.mjs; node hoc/kiem-ve-vector.mjs; node hoc/kiem-bang-mau.mjs
  grep -rn "shoot\|\"fast\"\|\"charge\"" hoc --include=*.js --include=*.mjs: chỉ còn trong bảng di trú / thông báo lỗi tên cũ / chú thích lịch sử.
  Trình duyệt: `node -e "process.env.PORT='4208';import('./server.mjs')"` chạy nền, TẮT khi xem xong; `hoc/game/choi.html?debug=1`, Mở hết. Xem một màn sau gói 6 (vd doi-sung-hoi.1) chạy spray("high") giật đúng; một màn gói 2 gõ shoot() thấy lỗi thân thiện; nạp localStorage có hàm cũ tên blast_left / shoot rồi tải lại: kho hàm đã đổi tên. Khổ 360 × 640, không lỗi console.

CÁCH GIAO: worktree riêng do Agent tool tạo; việc đầu tiên `git checkout -b claude/phun-nhe-a` và kiểm HEAD là main mới nhất (`git log --oneline -1 main`; nếu cũ hơn và chưa có commit nào thì `git reset --hard main`). Commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, bảng đổi tên, luật mới (trích chú thích), danh sách màn bật lucBan, lệnh kiểm + kết quả nguyên văn (danh sách màn đỏ được phép), kết quả grep, kết quả soát trình duyệt.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT (mỗi mục: vấn đề, phương án, nghiêng về đâu).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5. RỦI RO CÒN LẠI.
