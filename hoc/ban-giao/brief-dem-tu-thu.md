NHỊP (đọc trước): commit đầu trong ~25 phút (máy kiểm lõi đệm từ với 3–4 ca đầu chạy được, chưa cần hình); sau đó TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi viết dòng lõi đầu tiên. Hết sức thì dừng và báo còn gì: thà lõi + 3 màn chơi được có commit còn hơn đủ 6 màn không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: hoc/ban-giao/luat-song-song.md (RAM: CẤM `npm test` cả bộ, chạy từng máy kiểm một; server tạm chỉ cổng 4204, tắt ngay khi xem xong; cổng 4181 của người giao). Đang có agent khác chạy song song: V8a (phiên khác, worktree v8a-nhen-omni, vẽ lại thân nhện / omni trong hoc/game/ve-vector-than-*.js, kiem-ve-vector.mjs): KHÔNG đụng các tệp đó. Rồi đọc hoc/KE-HOACH-MUA-3.md (mục 4 câu 2: luật đệm từ) và hoc/KE-HOACH-7-MUA.md mục "Luật dự kiến … Đệm từ".

LOẠI: Ship (bản THỬ để user chơi thử)          MODEL: fable (điểm: quy mô 2 (lõi + vẽ + màn + máy kiểm), choke 2 (san-hoc.js / cham.js / bộ vẽ sân dùng chung), giá sai 1 (vỡ màn cũ), mơ hồ 2 (tự chốt chi tiết luật), suy luận 1 = 8)

CHỖ LÀM: worktree riêng (Agent tool tạo), nhánh claude/dem-tu-thu từ main (e1be1ff hoặc mới hơn). Tự tạo nhánh nếu worktree đặt tên khác.

MỤC TIÊU: xong khi user mở game (Gỡ lỗi bật "Mở hết") thấy ở đầu mùa 3 (đang ẩn) gói "Thử đệm từ" với 5–6 màn chơi được, đệm từ hoạt động đúng luật dưới đây, có hình vector cho ô đệm và hoạt cảnh robot bị kéo / đẩy; mọi màn cũ y nguyên (máy kiểm cũ xanh).

LUẬT ĐỆM TỪ (user duyệt hướng này 29/10: "thử làm hướng đệm từ đó t chơi thử xem"):
- Ô đệm có cực N hoặc S. Đệm là KHỐI (robot không đi vào ô đệm, đâm như tường). Khai bằng cờ màn, KHÔNG thêm ký hiệu sân (khoảng 30 bộ dò đọc sân thô; cách làm giống `cfg.nutBat`): đề xuất `cfg.demTu = [{ x, y, cuc: 'N' | 'S' }]` (màn nhiều sân: mảng song song như `noi`), ô đó trên sân ghi '.'; bạn thấy cách khác tốt hơn thì nêu.
- Tầm: robot đứng trên cùng hàng hoặc cùng cột với đệm, cách ≤ 2 ô, giữa không có khối chặn (tường, cửa đóng, thùng, vật…). Đệm tác động SAU hành động của robot trong nhịp đó (cùng chỗ băng chuyền tác động; đọc cách băng chuyền làm trong san-hoc.js và làm y hệt thứ tự).
- Chiều: robot KHÔNG bật nam châm → bị HÚT như sắt (kể cả nhện, kể cả đang nhảy: user hỏi "nếu trừ lúc nhảy thì khác gì hố ver2?", nên KHÔNG có ngoại lệ nhảy). Robot bật nam châm KHÁC cực đệm → HÚT; CÙNG cực → ĐẨY. (Nam châm có sẵn: magnet_n / magnet_s / magnet_off; cực robot coi như cả thân, không xét hướng mặt.)
- Hút: dời 1 ô về phía đệm mỗi nhịp, dừng ở ô sát đệm (không lên đệm). Đẩy: dời 1 ô ra xa mỗi nhịp tới khi ra khỏi tầm hoặc bị chặn (bị chặn thì đứng im, không phải đâm). Hướng mặt robot không đổi.
- Hai đệm cùng tác động một robot: đệm GẦN hơn thắng; bằng khoảng thì không dời. Ô hố: bị đẩy / hút vào hố thì rơi như đi vào hố.
- Drone (mùa 4): không bị tác động (bay). Thùng / vật: bản thử KHÔNG tác động (ghi vào câu hỏi: có nên kéo vật sắt không).
- Sự kiện vết chạy (cho hoạt cảnh và lời nhắc máy chấm): vd 'dem-hut' / 'dem-day' { nhip, tu, den, dem }. Máy chấm (cham.js) có lời nhắc tiếng Việt khi robot bị đệm kéo vào hố / ra khỏi đường (đọc cách lời 'bang-chan' làm).

MÀN THỬ (5–6, chương mới `dem-tu-thu`, tệp ngân hàng mới hoc/man-dem-tu-thu.js theo khuôn hoc/man-bien-xich.js; xe hai bánh gắn nam châm, chỉ Python mùa 1–2; theo luật show don't tell, memory show-dont-tell-khoi-moi):
  1 trình diễn: mã mẫu đã đúng, bấm Chạy là thắng (robot đi ngang đệm S, bị hút lệch làn đúng vào đích); đề nói "Bấm Chạy, xem robot đi qua đệm từ".
  2 ép hiểu hút: đi thẳng thì bị kéo vào hố; phải bật cùng cực để đi qua (lời không bật nam châm không thắng).
  3 dùng đẩy làm công cụ: bật cùng cực để được đẩy sang làn có đích (nhanh hơn đi vòng; chứng minh lời đi vòng không 3 sao).
  4 hai đệm N và S: phải đổi cực giữa đường.
  5 hút làm công cụ: tắt nam châm để được kéo tới chỗ khó đi.
  6 trùm nhỏ (1–2 sân): kết hợp.
  Cờ khóa sửa màn trình diễn (`chiChay`) CHƯA có (phiên khác định nghĩa sau): màn 1 chỉ cần mã mẫu thắng 3 sao; không tự làm cờ đó.
  Đăng ký: gói "Thử đệm từ" đứng ĐẦU mùa 3 (ẩn; hiện khi bật "Mở hết"), sao 0. Đăng ký ở lo-trinh-hoc.js theo cách chương chỉ có ở lộ trình đang làm (chuongThem / chenGoi), NGOÀI khối "MÙA 2 = 10 GÓI" (nhánh claude/mua-2-xong đang sửa khối đó), thêm thẻ <script> trong hoc/game/choi.html. Kiểm kiem-lo-trinh.mjs không đỏ vì gói mới (sửa giả định tối thiểu nếu cần, ghi rõ).

HÌNH (vector, theo hệ vẽ hiện có hoc/game/ve-vector-o*.js, ve-vector-ky-hieu.js; KHÔNG đụng ve-vector-than-*.js của V8a): ô đệm cực N đỏ / S xanh dương (đọc hoc/game/bang-mau.js: chỉ THÊM vai mới một khối có chú thích, dùng màu cực nam châm đã có nếu có), có chữ N / S, vòng sóng từ nhẹ; khi kéo / đẩy: robot trượt mượt 1 ô + vệt sóng giữa đệm và robot. Đọc được ở ô 24 px. Kiểm bằng kiem-ve-vector.mjs (mục có sẵn) và xem trình duyệt cổng 4204.

PHẠM VI: được sửa hoc/san-hoc.js, hoc/cham.js (chỉ thêm luật / lời đệm từ), hoc/man-dem-tu-thu.js (mới), hoc/kiem-dem-tu.mjs (mới: máy kiểm lõi + màn, có `--loi-gia` phải đỏ), hoc/lo-trinh-hoc.js (đăng ký, ngoài khối MÙA 2), hoc/game/choi.html (thẻ script), tệp vẽ ô / hiệu ứng vector (ve-vector-o*.js, ve-vector-hieu-ung.js, san-ve.js), hoc/game/bang-mau.js (THÊM), hoc/kiem-bang-mau.mjs (SUA_SAU_NEN thêm dòng). KHÔNG sửa: màn có sẵn, khối MÙA 2, ve-vector-than-*.js, kế hoạch .md, sổ canh.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại có bằng chứng (luật tầm 2 ô, thứ tự tác động, cách khai đệm, màn thử không hay). Kiểm lại từng khẳng định ở đây bằng code, đừng tin. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): đệm không có ngoại lệ nhảy; đệm dời robot chứ không chặn như hố; người chơi chọn chiều bằng cực; chữ tiếng Việt, không emoji, không gạch dài.

TRƯỚC KHI SỬA: GitNexus `impact` cho các hàm sắp sửa trong san-hoc.js / cham.js (repo = D:\Users\tuanla2\game\doi-robot-chan-hung); risk HIGH/CRITICAL → dừng, báo. Không có GitNexus thì grep chỗ gọi.

KIỂM TRA (tại worktree, TỪNG LỆNH MỘT; CẤM npm test cả bộ: người giao chạy):
  node hoc/kiem-dem-tu.mjs ; node hoc/kiem-dem-tu.mjs --loi-gia     ← lõi + mọi màn thử thắng 3 sao, lời sai không thắng; lỗi giả phải đỏ
  node hoc/kiem-loi-mua-2.mjs ; node hoc/kiem-bang-chuyen.mjs ; node hoc/kiem-nam-cham.mjs ; node hoc/kiem-nhen.mjs ; node hoc/kiem-drone.mjs ; node hoc/kiem-nut-bat-san.mjs   ← lõi chung không vỡ
  node hoc/kiem-lo-trinh.mjs ; node hoc/kiem-che-xe.mjs ; node hoc/kiem-hoc.mjs
  node hoc/kiem-ve-vector.mjs ; node hoc/kiem-bang-mau.mjs
  Máy kiểm đỏ: chạy lại ĐÚNG máy đó ở main để tách đỏ sẵn khỏi đỏ mới; ghi cả hai.
  Trình duyệt (cổng 4204, một tab của bạn, gỡ service worker + xoá caches khi mở lần đầu): bật Gỡ lỗi "Mở hết", chơi qua 6 màn, chụp ô đệm và cảnh bị kéo; tắt server khi xong.

CÁCH GIAO: commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng nhánh / worktree khác.

BÁO CÁO CUỐI (ghi dần vào hoc/ban-giao/bao-cao-dem-tu-thu.md trên nhánh của bạn, VÀ trong câu trả lời cuối), đủ 5 mục: 1 KẾT QUẢ (SHA, luật đã chốt từng chi tiết, bảng 6 màn: tên · ý bài · lời giải · nhịp · vì sao lời sai không thắng, lệnh kiểm + dòng tổng nguyên văn, ảnh chụp đã xem); 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai; có nên kéo vật sắt; tầm 2 ô có hợp không); 3 ĐỀ XUẤT (khung vấn đề → bảng phương án → nghiêng về đâu); 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (5–8 câu: chơi thử ở đâu, bấm gì); 5 RỦI RO CÒN LẠI. Chỉ ghi điều đã thật sự chạy.
