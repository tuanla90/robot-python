NHỊP (đọc trước): commit đầu tiên trong ~20 phút (luật mới trong san-hoc.js + máy kiểm lõi của luật đó); sau đó mỗi màn dựng lại một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì: thà 5 màn đúng có commit còn hơn 9 màn không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

SONG SONG: có thể có phiên khác gộp việc vào main; bạn làm trên nhánh riêng. CẤM định dạng lại tệp, CẤM npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4207.

LOẠI: Ship          MODEL: fable (điểm: quy mô 2 (lõi + 5 tệp màn + bộ dò + máy kiểm), choke 2 (san-hoc.js luật lõi, bộ mô phỏng do-duong-* phải khớp lõi), giá sai 1 (màn không giải được / sai sao), mơ hồ 2 (dựng lại màn giữ ý dạy), suy luận 1 = 8)

MỤC TIÊU: xong khi cú giật của vòi phun trúng thùng nặng chỉ dời thùng ĐÚNG 1 Ô và xe cũng đi 1 ô theo hướng giật (không còn "thùng trượt tới vật cản"); mọi màn có lời giải dựa vào luật cũ được dựng lại để vẫn dạy đúng ý và thắng 3 sao; bộ dò / bộ mô phỏng, hoạt cảnh, chữ hiển thị theo luật mới; máy kiểm đạt.

LUẬT MỚI (user chốt 29/10: "giật cũng chỉ đi được 1 ô, đi không dừng lại hơi vô lý về mặt vật lý"; "tia nước để không đẩy; cứ có charge thì xe bị giật và đẩy được thùng"):
- Cú giật (shoot / shoot_back bắn tụ, tức không đối số hay "charge"): ô xe giật vào có THÙNG NẶNG → ô sau thùng (theo hướng giật) đi vào được thì THÙNG dời 1 ô VÀ XE dời 1 ô vào ô thùng vừa rời (như xe xích đẩy thùng khi tiến); ô sau thùng bị chặn (tường, mép sân, bậc thang, hàng rào, nút / van, cửa đóng, thùng khác, vật nằm đất) thì cả hai đứng yên ('thung-chan' kieu 'giat' như hiện nay).
- Ô sau thùng là băng chuyền / ô đích / sàn thường: thùng vào bình thường (đích: tính như thùng tới đích; băng: đếm nhịp từ 0 như thùng mới lên băng, như luật xích đẩy thùng).
- Giữ nguyên: bắn nhanh "fast" không giật (không đẩy); TIA NƯỚC trúng thùng KHÔNG đẩy thùng (tia dừng ở vật cản đầu tiên như cũ); bệ vòi xích (cfg.beSung, xích bắn tụ) không giật nên không đẩy; xe giật vào ô trống thì đi 1 ô như cũ; thứ tự trong nhịp (a) bắn → (b) giật → (c) băng chuyền → (d) cửa.
- Sự kiện: 'thung-di' nguon 'giat' {id, tu, den, soO: 1}; 'giat' có di: true (xe đã dời), thung: id. Ghi rõ trong chú thích luật san-hoc.js (mục SÚNG HƠI, dòng ~133–138) và mọi chỗ khác mô tả luật cũ.

BỐI CẢNH:
- Luật cũ ở hoc/san-hoc.js mục GIẬT (dòng ~133–138) và hàm giật (~1641). Luật xích đẩy thùng (cfg.xichDay, gói 5 mùa 2) là mẫu tốt cho "thùng 1 ô, xe 1 ô".
- Người giao đã đo bằng lõi (Cham.cham lời giải + lời giải khác, tìm 'thung-di' nguon 'giat' soO > 1): 9 màn dựa vào luật cũ: sung-hoi.4 (Thùng sau lưng), .5, .6, .7 (Thùng đi băng), .9, .10; che-sung-hoi.10; doi-sung-hoi.5; rap-du.7. Số này là SÀN: tự đo lại sau khi đổi luật (chạy mọi màn: lời giải, lời giải khác, lời sai phải còn đúng mã mong đợi), kể cả màn mà lời giải vẫn thắng nhưng sao / đường đi đổi, và màn trình diễn (chiChay) của gói T.
- Dựng lại màn: GIỮ ý dạy của màn (tên, đề bài, khái niệm Python), sửa ít nhất có thể: dời thùng / đích / băng cho gần, thêm một phát bắn (vòng for), đổi lời giải; đo lại sao (lo-trinh-sao.js nếu sao được đo), đường cong học mượt (luật ở hoc/KE-HOACH-MUA-1.md mục Trạng thái / memory "duong-cong-hoc-va-recall"), máy dò lách (kiem-lach-mua-2) đạt. Màn đang dạy "trượt tới khi gặp vật cản" (sung-hoi.4 "Thùng sau lưng") thì dạy luật mới: "cú giật đẩy thùng nhích một ô".
- Chữ: đề bài, gợi ý, veMaMau, lời sai, thẻ bộ phận (gioi-thieu-part.js), Sổ lệnh, hướng dẫn màn (huong-dan-man.js), phim (chu.js pg.* nếu có nhắc trượt xa) — mọi câu nói thùng "trượt tới khi gặp vật cản / trượt ra xa" đổi theo luật mới. Theo quy tắc đặt tên và giọng kể (hoc/KE-HOACH-7-MUA.md mục "Quy tắc đặt tên và giọng kể"): câu mới viết dùng "phun" thay "bắn" khi tự nhiên; KHÔNG làm đợt đổi chữ "bắn" hàng loạt (đợt sau).
- Hoạt cảnh: hoc/game/san-ve.js vẽ thùng trượt theo sự kiện 'thung-di' (nhiều ô) và xe đứng yên khi giật vào thùng: sửa để thùng nhích 1 ô và xe đi 1 ô cùng nhịp (xem cách vẽ xích đẩy thùng). Xem trong trình duyệt.
- Bộ dò / bộ mô phỏng: hoc/do-duong-sung-hoi.mjs, do-duong-che-sung-hoi.mjs, do-duong-be-sung.mjs, do-duong-trum-mua-2.mjs, do-duong-luc-ban*.mjs… (grep 'truot' / 'thung-di' / luật giật trong hoc/do-duong-*.mjs): mô phỏng giật phải khớp lõi mới; phần so chéo với lõi (nếu có) phải đạt.

PHẠM VI: được sửa hoc/san-hoc.js (luật giật + chú thích), hoc/game/san-ve.js (hoạt cảnh giật / thùng), các tệp màn có màn bị ảnh hưởng (man-sung-hoi.js, man-che-sung-hoi.js, man-doi-sung-hoi.js, man-rap-du.js, và tệp khác nếu đo ra), hoc/lo-trinh-sao.js (đo lại sao), hoc/do-duong-*.mjs, các máy kiểm liên quan, chữ hiển thị nói về luật (gioi-thieu-part.js, so-lenh.js, huong-dan-man.js, chu.js), KE-HOACH-MUA-2.md (một dòng trạng thái), hoc/KE-HOACH-7-MUA.md (không cần).
KHÔNG sửa: luật khác (tia nước, băng chuyền, cửa, van, xích đẩy, bệ vòi), mã nội bộ không liên quan, phim mùa 1.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): bằng chứng đọc sai (số dòng chỉ gần đúng), có cách đơn giản hơn, màn bị bỏ sót, luật mới có trường hợp biên chưa tính (vd giật vào thùng đang nằm trên băng, hai robot, thùng vào ô cửa đang mở). Kiểm lại từng khẳng định bằng code. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): luật mới ở trên (thùng 1 ô, xe 1 ô; tia nước không đẩy; fast không giật; bệ vòi xích không giật); chữ không emoji, không gạch dài; đường cong học mượt.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-sung-hoi.mjs; node hoc/kiem-che-sung-hoi.mjs; node hoc/kiem-luc-ban.mjs; node hoc/kiem-che-luc-ban.mjs; node hoc/kiem-be-sung.mjs; node hoc/kiem-trum-mua-2.mjs; node hoc/kiem-doi-sung-hoi.mjs; node hoc/kiem-doi-mua-2.mjs; node hoc/kiem-rap-du.mjs; node hoc/kiem-day-thung.mjs; node hoc/kiem-bang-chuyen.mjs; node hoc/kiem-do-nhiet.mjs (ls hoc/kiem-*.mjs: chạy máy kiểm của MỌI tệp màn bạn sửa và của luật lõi)
  node hoc/kiem-lo-trinh.mjs; node hoc/kiem-lach-mua-2.mjs; node hoc/kiem-hoc.mjs; node hoc/kiem-huong-dan.mjs; node hoc/kiem-gioi-thieu-part.mjs; node hoc/kiem-ve-vector.mjs (13a-v phát lại màn: nếu lệch đúng màn bạn dựng lại thì dời nền theo cách có sẵn, chứng minh chỉ chỗ cố ý lệch); node hoc/kiem-bang-mau.mjs (tệp sửa sau nền: ghi vào SUA_SAU_NEN nếu nó báo)
  Đo lại bằng script: không còn lời giải nào có 'thung-di' nguon 'giat' soO > 1.
  Trình duyệt: `node -e "process.env.PORT='4207';import('./server.mjs')"` chạy nền, TẮT khi xem xong; `hoc/game/choi.html?debug=1`, Mở hết. Mẹo nạp lời giải: trong console `const m=ManHoc.timMa('sung-hoi.7'); m.maMau=JSON.parse(JSON.stringify(m.loiGiai)); App.vaoMan('sung-hoi.7')` rồi bấm Chạy / Nhịp. Xem ít nhất 3 màn dựng lại (thùng nhích 1 ô, xe đi theo), khổ 360 × 640, không lỗi console.

CÁCH GIAO: worktree riêng do Agent tool tạo; việc đầu tiên `git checkout -b claude/giat-mot-o` và kiểm HEAD là main mới nhất (`git log --oneline -1 main`; nếu cũ hơn và chưa có commit nào thì `git reset --hard main`). Commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, tệp đổi, luật mới (trích chú thích), bảng màn dựng lại (màn · đổi gì · lời giải mới · sao), lệnh kiểm + kết quả nguyên văn, kết quả đo lại, kết quả soát trình duyệt.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT (mỗi mục: vấn đề, phương án, nghiêng về đâu).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5. RỦI RO CÒN LẠI.
