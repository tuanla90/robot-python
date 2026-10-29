# Brief gói T: màn trình diễn + ép dùng khối mới cho MÙA 2 (show don't tell)

NHỊP (đọc trước): commit đầu trong ~25 phút (máy dò lách mùa 2 chạy được trên gói 1–2, in bảng là đủ); sau đó mỗi GÓI sửa xong là một commit, TỐI ĐA 40 phút một commit. CẤM soát tay 200 màn trước khi sửa màn đầu: máy dò làm kiểm kê, bạn sửa theo thứ tự gói. Hết sức thì dừng và báo còn gì: thà 4 gói đúng có commit còn hơn 10 gói không commit. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: hoc/ban-giao/luat-song-song.md (RAM: CẤM `npm test` cả bộ, chạy từng máy kiểm một; server tạm chỉ cổng 4206, tắt ngay khi xem xong; cổng 4181, 4185, 4186, 4187 không phải của bạn). Rồi:
- hoc/ban-giao/brief-HD1-huong-dan-mua-1.md, bao-cao-HD1.md, bao-cao-HD2.md: gói T là ĐÚNG việc HD1 + HD2 đã làm cho mùa 1, nay làm cho mùa 2. Dùng lại công cụ của họ, KHÔNG tạo cờ thứ hai.
- hoc/KE-HOACH-MUA-2.md (bảng 10 gói, mục Trạng thái), hoc/KE-HOACH-MUA-3.md mục 4 câu 4 (luật gói T), khối "MÙA 2 = 10 GÓI" trong hoc/lo-trinh-hoc.js.

LOẠI: Ship          MODEL: fable (điểm: quy mô 2 (20 chương, lo-trinh-hoc.js, huong-dan-man.js, máy dò mới), choke 1 (dữ liệu màn + hướng dẫn dùng chung), giá sai 1 (vỡ đường cong / sao mùa 2 đã mở bán), mơ hồ 2 (tự định nghĩa lách cho biến / tham số / cảm biến số), suy luận 2 = 8)

CHỖ LÀM: worktree riêng (Agent tool tạo), nhánh claude/t-trinh-dien-mua-2 từ main 415d3ac hoặc mới hơn (main đã có mùa 2 xong, khung mùa 3, HD1 + HD2: cờ `chiChay`, cờ `damLaThua`, hoc/kiem-lach-mua-1.mjs). Tự tạo nhánh nếu worktree đặt tên khác.

MỤC TIÊU: xong khi ở mọi chương mùa 2 giới thiệu một khối / part / cơ chế mới: (1) màn ĐẦU cho THẤY nó chạy (màn trình diễn `chiChay`: chương trình khoá, bấm Chạy là thắng 3 sao, đề chỉ nói "Bấm Chạy, xem robot …"); (2) màn KẾ ép dùng nó (lời lách không dùng thì THUA hoặc không đủ sao), có hướng dẫn từng bước / tooltip chỉ đúng thao tác mới, được giấu bớt lệnh cũ có thể lách; (3) sau đó mới thả; và máy dò hoc/kiem-lach-mua-2.mjs chứng minh (2), có `--loi-gia` đỏ. Mùa 2 vẫn đủ 200 màn, đường cong (phanh (g) mùa 2) vẫn xanh.

LỜI USER (29/10, nguyên văn, QUYẾT ĐỊNH CỦA USER): "đảm bảo đường cong học tập và tutorial đầy đủ, cần tạo điều kiện để user buộc phải dùng khối mới, hoặc các bài đầu nên dạng show off, user ko cần sửa, bấm là chạy để hiểu dạng show don't tell"; "mấy màn đầu có thể ko cho sửa. bấm là thấy tác dụng luôn, … sau đó có thể làm các màn kiểu giấu bớt các hàm đi, buộc dùng hàm mới với hỗ trợ tooltip rồi mới thả". User chọn "Bù cả mùa 1, 2" (mùa 1 phiên khác đã làm: HD1, HD2, HD3).

CÁI MỚI CỦA MÙA 2 (người giao liệt kê; kiểm lại bằng code, thiếu thì thêm): thân xích (đi ngang left_move / right_move, lùi left_back / right_back; KHÔNG move / turn), biến (gán, đếm, chương bien-xich), súng hơi (shoot giật lùi, shoot_back giật tới), hàm có tham số (tham-so: def f(n), gọi f(3)), hồng ngoại `distance()` (số ô), băng chuyền (sàn), xích đẩy thùng nặng (day-thung), lực bắn shoot("fast") / shoot("charge"), đo nhiệt `warm()` + nút bắn nóng / cửa, đội hai robot mùa 2 (doi-mua-2), bệ súng xích (combo). Màn đầu hiện có của 20 chương: KHÔNG màn nào `chiChay` (đo trên main 415d3ac).

CÔNG CỤ ĐÃ CÓ (đọc code, đừng tin mô tả này):
- Màn trình diễn: khai `chiChay: true, chinhCoDinh: true` và `maMau.chinh` = lời giải đúng (xem 6 màn mùa 1 trong lo-trinh-hoc.js quanh dòng 316–380: khoang-cach.1, .2, vong-lap.1, nut-de.1, tay-xoay.1, cam-bien-ben.1); nên có xe mờ / bóng mờ làm đích. cham.js `ganCoDinh`; man-choi.js `khungCoDinh()` / nhãn "Chỉ chạy"; chu.js `choi.chiChay*`.
- Đâm tường là thua: cờ `damLaThua` (danh sách DAM_LA_THUA, lo-trinh-hoc.js ~dòng 568; HD2 ghi "Mùa 2 không gắn (phiên mùa 2 tự quyết)"). Bạn ĐƯỢC gắn cho màn ép mùa 2 nếu cần, theo đúng điều kiện HD2 (lời giải chuẩn không đâm tường ở sân nào).
- Giấu lệnh: `hamGoc` (khay), `camHamCuaEm`, `khung.*`, nhiều sân (`san: [[…],[…]]`, `batDau` mảng), `sao`.
- Hướng dẫn từng bước: hoc/game/huong-dan-man.js (`H['<mã màn>']`, `buocTaoHam`, `buocThanHam`, `buocChay`…, `HuongDanManPhienBan`); máy kiểm hoc/kiem-huong-dan.mjs.
- Máy dò lách mùa 1: hoc/kiem-lach-mua-1.mjs (A1 duỗi gốc, A2 duỗi lời gọi, B dỡ điều kiện; đang ép = chương đầu tiên dùng khái niệm; màn đội bỏ qua).

VIỆC (thứ tự):
1. Máy dò hoc/kiem-lach-mua-2.mjs (dùng lại phần chung của kiem-lach-mua-1.mjs bằng import / tách mô-đun nhỏ nếu gọn; KHÔNG làm đỏ / đổi kết quả máy dò mùa 1). Ngoài A1 / A2 / B, thêm lách cho khái niệm mùa 2, tự định nghĩa chính xác và ghi báo cáo, gợi ý:
   C hằng thay biến (biến đếm / gán thay bằng số đo ở sân 1), D duỗi hàm có tham số (f(3) thành thân hàm chép với n = 3, hoặc hàm không tham số), E hằng thay cảm biến số (`distance()` / `warm()` thay bằng giá trị đo ở sân 1, điều kiện theo nó thành nhánh đã chạy).
   "Đang ép" = chương ĐẦU TIÊN của mùa 2 (theo lộ trình MUA_2) dùng khái niệm đó, hay màn có taoHam. Có `--loi-gia` tự chứng minh bắt được lỗ. Commit.
2. Bảng (hoc/ban-giao/bang-t-mua-2.md, sinh bằng máy dò hoặc tay): mỗi chương mùa 2 · khái niệm / part / cơ chế mới · màn trình diễn có chưa · màn ép có chưa (lỗ / không) · có `H[...]` chưa.
3. Sửa theo gói 1 → 10: mỗi khối mới, màn đầu thành trình diễn `chiChay` (chọn màn ngắn, rõ, hoặc biến màn 1 hiện có; đề "Bấm Chạy, xem …"), màn kế ép (nhiều sân / giấu lệnh cũ / damLaThua / ngưỡng sao) + hướng dẫn từng bước cho thao tác mới (tạo hàm có tham số, gán biến, đọc distance()…). Giữ 10 màn mỗi chương: màn trình diễn THAY một màn hoặc chen vào và cất màn yếu nhất có cùng ý (ghi rõ, như HD3 cất một màn trùng ý). Sửa qua lộ trình (`sua` / `get` trong khối MÙA 2 của lo-trinh-hoc.js), KHÔNG sửa tệp màn gốc. KHÔNG đổi `ma` màn.
   Lời giải đổi thì đo lại sao bằng `node tools/do-lo-trinh.mjs --ghi-sao`: lệnh này GHI ĐÈ CẢ tệp hoc/lo-trinh-sao.js; chạy xong `git diff hoc/lo-trinh-sao.js` phải chỉ đổi dòng màn bạn sửa (đổi thứ tự khoá thì khôi phục tệp, thêm tay đúng dòng, như P0 mùa 3 đã làm).
   Ngưỡng sao GÓI mùa 2 khai cứng 0, 30, …, 270 (đã công bố, mùa 2 đang mở bán): KHÔNG đổi.
4. MÀN ĐỘI (doi-mua-2, che-doi-mua-2 và mọi màn có `man.doi`): HIỆN `ganCoDinh` chỉ khoá `maMau.chinh`; phiên khác đang làm HD3 (nhánh claude/hd3-trinh-dien-goi-5-8) mở rộng khoá cho `maMau.doi`. KHÔNG tự sửa cham.js `ganCoDinh`. Màn đội: chỉ làm màn ép + hướng dẫn; màn trình diễn đội ghi vào báo cáo "chờ HD3", trừ khi main đã có HD3 lúc bạn làm tới (kiểm `git log main`, rồi chỉ dùng cách HD3 đã làm).

PHẠM VI: được sửa hoc/lo-trinh-hoc.js (CHỈ khối MÙA 2 và danh sách DAM_LA_THUA thêm dòng mùa 2), hoc/lo-trinh-sao.js (dòng màn mùa 2 đã sửa), hoc/game/huong-dan-man.js (CHỈ thêm `H[...]` của màn mùa 2, gom một khối có chú thích "gói T mùa 2"; phiên bản tăng khi đổi H đã có), hoc/kiem-lach-mua-2.mjs (mới), tools/kiem-tat-ca.mjs (thêm bộ mới nếu repo gom như vậy), máy kiểm của chương mùa 2 đã đổi (kiem-*.mjs, sửa tối thiểu, ghi rõ), hoc/game/chu.js (chỉ THÊM khoá nếu cần). KHÔNG sửa: khối mùa 1, khối MÙA 3, hoc/cham.js, hoc/san-hoc.js, man-choi.js (trừ khi chiChay vỡ ở màn mùa 2: dừng, hỏi), hình vẽ, phim, tệp màn gốc, kế hoạch .md, sổ canh.
Song song: phiên khác chạy HD3 (khối MÙA 1 trong lo-trinh-hoc.js / lo-trinh-sao.js, cham.js ganCoDinh, huong-dan-man.js phần mùa 1). Chỉ giữ thay đổi gọn trong phần mùa 2 để gộp sau dễ; tệp dùng chung chỉ THÊM dòng ở chỗ của mình, CẤM định dạng lại.

PHẢN BIỆN: brief là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại có bằng chứng (danh sách cái mới sai / thiếu, màn chọn làm trình diễn không hợp, lách C / D / E định nghĩa kém, cách giấu lệnh hay hơn). Kiểm lại từng khẳng định ở đây bằng code, đừng tin. Bất đồng chặn đường → dừng, commit WIP, ghi câu hỏi. Quyết định của USER (không tự đi ngược): show don't tell theo thứ tự trình diễn khoá sửa → ép + giấu lệnh + tooltip → thả; đường cong mượt (phanh (g) mùa 2 phải xanh); 10 màn mỗi chương, 2 chương mỗi gói; không đổi `ma`; ngưỡng sao gói mùa 2 giữ; chữ tiếng Việt, không emoji, không gạch dài.

TRƯỚC KHI SỬA: GitNexus `impact` cho hàm sắp sửa (repo = D:\Users\tuanla2\game\doi-robot-chan-hung); risk HIGH/CRITICAL → dừng, báo. Không có GitNexus thì grep chỗ gọi.

KIỂM TRA (tại worktree, TỪNG LỆNH MỘT; CẤM npm test cả bộ: người giao chạy):
  node hoc/kiem-lach-mua-2.mjs ; node hoc/kiem-lach-mua-2.mjs --loi-gia     ← lỗ về 0 (hoặc ghi rõ vì sao chấp nhận); lỗi giả phải đỏ
  node hoc/kiem-lach-mua-1.mjs                                              ← mùa 1 không đổi
  node hoc/kiem-lo-trinh.mjs ; node hoc/kiem-lo-trinh.mjs --loi-gia-mua-2   ← mục mùa 2 (g) đường cong xanh; lỗi giả mùa 2 đỏ 8 / 8
  node tools/do-lo-trinh.mjs                                                ← mọi màn thắng 3 sao theo lộ trình
  node hoc/kiem-huong-dan.mjs ; node hoc/kiem-loi-mua-2.mjs ; máy kiểm của từng chương đã đổi (grep -l "<mã chương>" hoc/kiem-*.mjs)
  Máy kiểm đỏ: chạy lại ĐÚNG máy đó ở main để tách đỏ sẵn khỏi đỏ mới; ghi cả hai.
  Trình duyệt (cổng 4206, một tab của bạn, gỡ service worker + xoá caches khi mở lần đầu): chơi 4–5 màn trình diễn (bấm Chạy thắng ngay, không sửa được) và màn ép kế (hướng dẫn hiện đúng chỗ, lời lách thua); 360 px không tràn; tắt server khi xong.

CÁCH GIAO: commit từng bước, message tiếng Việt, cuối message `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng nhánh / worktree khác.

BÁO CÁO CUỐI (ghi dần vào hoc/ban-giao/bao-cao-T-mua-2.md trên nhánh của bạn, VÀ trong câu trả lời cuối), đủ 5 mục: 1 KẾT QUẢ (SHA từng commit; bảng chương · màn trình diễn · màn ép · cách ép · hướng dẫn; màn cất / dời; bảng lỗ trước / sau; định nghĩa lách C / D / E; lệnh kiểm + dòng tổng nguyên văn; màn đội chờ HD3); 2 CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai); 3 ĐỀ XUẤT (khung vấn đề → bảng phương án → nghiêng về đâu); 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (5–8 câu); 5 RỦI RO CÒN LẠI. Chỉ ghi điều đã thật sự chạy.
