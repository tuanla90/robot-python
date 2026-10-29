NHỊP (đọc trước): commit đầu tiên trong ~25 phút (sung-hoi.1–2 dựng lại + máy kiểm); sau đó mỗi 2–3 màn một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát dài trước khi sửa dòng đầu tiên. Hết sức thì dừng và báo còn gì: thà 6 màn đúng có commit còn hơn 15 màn không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

SONG SONG: có thể có phiên khác gộp việc vào main; bạn làm trên nhánh riêng. CẤM định dạng lại tệp, CẤM npm test cả bộ (máy từng hết RAM). Cổng server tạm của bạn: 4209.

LOẠI: Ship          MODEL: fable (điểm: quy mô 2 (khoảng 25 màn), choke 1, giá sai 2 (màn không giải được / đường cong gãy), mơ hồ 2 (thiết kế lại ý dạy gói 2 và gói 6), suy luận 2 = 9)

ĐIỀU KIỆN: chỉ bắt đầu khi brief A (brief-phun-nhe-a.md, nhánh claude/phun-nhe-a) đã gộp vào main: lệnh spray() / spray_back(), không đối số = phun nhẹ "low" (tầm 2 ô, không giật), "high" mở ở màn có cfg.lucBan.

MỤC TIÊU: xong khi mùa 2 kể đúng câu chuyện mới: gói 2 Vòi phun dạy PHUN NHẸ (đi gần, phun mở van, không giật); gói 6 Lực phun là nơi ĐẦU TIÊN em mở khoá spray("high"): tia bay xa và xe bị giật (lùi, đi tới bằng spray_back("high"), giật đẩy thùng nhích một ô). Mọi màn trước gói 6 thắng 3 sao không cần giật; đường cong mượt; máy kiểm xanh.

QUYẾT ĐỊNH CỦA USER (29/10, không tự đi ngược): "shot mặc định không có biến nên là phun nhẹ, để sau đó mở khoá charge sẽ ý nghĩa hơn"; "giữ gói 6, dựng lại hết"; luật giật một ô (thùng 1 ô, xe 1 ô); tia nước không đẩy thùng; bệ vòi xích không giật; chữ không emoji, không gạch dài; đường cong học mượt (memory "duong-cong-hoc-va-recall"); khối mới: màn đầu khoá sửa bấm Chạy là thấy, màn hai ép dùng khối mới (memory "show-dont-tell-khoi-moi").

VIỆC:
1. Gói 2 chương sung-hoi (10 màn, thứ tự lộ trình 1, 2, 3, 4, 5, 6, 9, 7, 8, 10 ở lo-trinh-hoc.js): dựng lại theo phun nhẹ. Ý dạy gợi ý: .1 trình diễn (khoá) spray() mở van cách hai ô; .2 ép spray_back() mở van sau lưng (H); sau đó: đi tới gần rồi phun (van cách ba ô phải move() trước), tia dừng ở thùng (thùng che van thì đi vòng), hai van, vòng for phun nhiều van, kết hợp với xích của gói 1; .9 .10 phong phú, nhắc lại gói 1. Giữ tên màn nếu còn đúng, đổi tên nếu nói về giật ("Thùng sau lưng", "Thùng đi băng"...): ý thùng sau lưng và thùng đi băng CHUYỂN sang gói 6. Đo lại sao (lo-trinh-sao.js), nhịp, lời sai.
2. Gói 4 chương che-sung-hoi (Nhà máy, chế lệnh vòi phun): 5 màn có lời giải dựa vào giật (che-sung-hoi.3, .6, .7, .9, .10; tự đo lại) dựng lại thành hàm tự chế dùng phun nhẹ (vd hàm đi tới rồi phun, phun hai bên, phun theo băng chuyền). Hàm tự chế nào màn sau gọi lại (taoHam / hamCuaEmMoi, kể cả màn đội sau gói 6) phải còn đúng nghĩa hoặc sửa nơi gọi; đo bằng cách chạy Cham.cham mọi màn theo thứ tự lộ trình với kho hàm cộng dồn.
3. Gói 6 chương luc-ban (10 màn) và che-luc-ban: thành nơi lần đầu xe giật. .1 trình diễn (khoá) spray("high"): tia bay xa tới van, xe giật lùi một ô; .2 ép: mã mẫu spray() không tới van xa, em thêm "high" (H); sau đó đưa vào các ý giật cũ của gói 2: spray_back("high") để đi tới, thùng sau lưng nhích một ô (luật giật một ô), thùng lên băng bằng cú giật, chọn lực ("low" khi thùng sau lưng không được xô, "high" khi van xa); .9 .10 phong phú. Lấy lại các màn hay đang có của sung-hoi (sau luật giật một ô) và luc-ban nếu hợp, ghi rõ màn nào chuyển từ đâu. che-luc-ban: hàm tự chế dùng lực (aim_fire cũ đã đổi tên ở brief A).
4. Chữ đi theo ý dạy mới: đề bài, gợi ý, veMaMau, lời sai, hướng dẫn màn (huong-dan-man.js), thẻ bộ phận Vòi phun (gioi-thieu-part.js: không còn "phun thì xe giật lùi"), thẻ / thông báo mở khoá Lực phun, Sổ lệnh, phim gói 2 (phim-mua-2.js 'sung-hoi' khung 3–4 đang vẽ giật lùi / cú giật hất thùng: đổi thành phun nhẹ mở van) và phim gói 6 ('luc-ban': cái mới là phun mạnh, xe giật). Giọng kể: em là nhân vật chính, R1 là bộ não; "phun / xịt" không "bắn".
5. Màn trình diễn (chiChay) và màn đội đứng trước gói 6 nếu có dùng giật: tự đo, sửa theo cùng nguyên tắc.
6. Sót lại từ đợt giật một ô (người giao chốt 29/10): che-doi-sung-hoi.5 "Đỡ ba thùng" hiện R2 tự thắng, omni không còn việc: dựng lại để CẢ HAI xe đều cần (vd thùng phải qua chỗ chỉ omni dọn / đón được; máy kiểm "R1 sai thì thua" VÀ "R2 sai thì thua"). che-luc-ban.8 hiện phải thêm hai back() chỉ để qua phanh đường cong: làm lại cho tự nhiên khi dựng gói 6. doi-sung-hoi.5 đã đổi tên "Chờ bạn qua rồi đẩy" (giữ).

BỐI CẢNH:
- Sau brief A, máy kiểm sung-hoi / che-sung-hoi đỏ đúng các màn trước gói 6 (danh sách trong báo cáo A, sổ canh hoc/ban-giao/so-canh-agent.md). Đó là điểm bắt đầu của bạn.
- Đặt màn: dữ liệu ở hoc/man-sung-hoi.js, man-che-sung-hoi.js, man-luc-ban.js, man-che-luc-ban.js; sửa theo lộ trình ở hoc/lo-trinh-hoc.js (sua / thay / trinhDien / day). Ngân hàng màn có máy kiểm riêng (kiem-*.mjs): nếu lo-trinh-hoc.js thay màn thì giữ ngân hàng như cách các màn khác đang làm.
- Máy dò lách (kiem-lach-mua-2): màn mới không được thắng bằng cách lách (vd không dùng khối mới).

PHẠM VI: được sửa các tệp màn ở trên, hoc/lo-trinh-hoc.js, hoc/lo-trinh-sao.js, hoc/do-duong-*.mjs, hoc/kiem-*.mjs liên quan, huong-dan-man.js, gioi-thieu-part.js, so-lenh.js, chu.js, phim-mua-2.js, KE-HOACH-MUA-2.md (trạng thái gói 2 và gói 6).
KHÔNG sửa: luật lõi (san-hoc.js trừ khi phát hiện lỗi; báo trước khi sửa), tên lệnh đã chốt ở brief A, màn mùa 1, màn sau gói 6 ngoài chương luc-ban / che-luc-ban và việc 6 (man-doi-sung-hoi.js được sửa cho che-doi-sung-hoi.5).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (có bằng chứng): ý dạy gói 2 khác hay hơn, tầm phun nhẹ 2 ô quá ngặt cho gói 2 (đề xuất, KHÔNG tự đổi luật), màn bị bỏ sót, hàm tự chế đổi nghĩa làm hỏng màn sau. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi.

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-sung-hoi.mjs; node hoc/kiem-che-sung-hoi.mjs; node hoc/kiem-luc-ban.mjs; node hoc/kiem-che-luc-ban.mjs; node hoc/kiem-bang-chuyen.mjs; node hoc/kiem-doi-sung-hoi.mjs; node hoc/kiem-be-sung.mjs; node hoc/kiem-trum-mua-2.mjs; node hoc/kiem-doi-mua-2.mjs (ls hoc/kiem-*.mjs: chạy máy kiểm của MỌI tệp bạn sửa)
  node hoc/kiem-lo-trinh.mjs; node hoc/kiem-lach-mua-2.mjs; node hoc/kiem-hoc.mjs; node hoc/kiem-huong-dan.mjs; node hoc/kiem-gioi-thieu-part.mjs; node hoc/kiem-phim-goi.mjs; node hoc/kiem-ve-vector.mjs (13a-v: dời nền theo cách có sẵn nếu lệch đúng màn dựng lại); node hoc/kiem-bang-mau.mjs
  Đo bằng script: chạy Cham.cham lời giải mọi màn theo thứ tự lộ trình (kho hàm cộng dồn): không màn nào trước luc-ban.1 có sự kiện 'giat'; mọi lời giải 3 sao.
  Trình duyệt: `node -e "process.env.PORT='4209';import('./server.mjs')"` chạy nền, TẮT khi xem xong; `hoc/game/choi.html?debug=1`, Mở hết. Mẹo nạp lời giải: `const m=ManHoc.timMa('sung-hoi.3'); m.maMau=JSON.parse(JSON.stringify(m.loiGiai)); App.vaoMan('sung-hoi.3')`. Xem sung-hoi.1, .2, một màn giữa gói 2, luc-ban.1, .2 và một màn thùng sau lưng ở gói 6; phim gói 2 và gói 6. Khổ 360 × 640, không lỗi console.

CÁCH GIAO: worktree riêng do Agent tool tạo; việc đầu tiên `git checkout -b claude/phun-nhe-b` và kiểm HEAD là main mới nhất có brief A (`git log --oneline -3 main`; nếu cũ hơn và chưa có commit nào thì `git reset --hard main`). Commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, bảng màn (màn · tên · ý dạy · lời giải · sao · chuyển từ đâu), lệnh kiểm + kết quả nguyên văn, kết quả đo, kết quả soát trình duyệt.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT (mỗi mục: vấn đề, phương án, nghiêng về đâu).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5. RỦI RO CÒN LẠI.
