NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi bước một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát lại toàn bộ: bản đồ đã có (báo cáo V7c2 mục 3).
MỖI COMMIT PHẢI ĐỂ GAME CHẠY ĐƯỢC và các phanh (dưới) xanh. Hết sức thì dừng ở commit xanh gần nhất và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: hoc/ban-giao/luat-song-song.md (CẤM npm test; RAM yếu; bạn chạy MỘT MÌNH, cổng server tạm 4202; cổng 4181 của người giao: không dùng, không tắt).
Rồi BẢN ĐỒ: hoc/ban-giao/bao-cao-V7c2.md mục 2 (câu 1, 6, 9) và mục 3 (đề xuất V7c3, số dòng tại e3038af; nay chỉ khác kiem-luc-ban); hoc/KE-HOACH-GOP-DIEM10CODE.md dòng "29/10 V7c2" (người giao đã trả lời câu hỏi).

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1 (choi.css bố cục chung mọi màn), giá sai 1, mơ hồ 1, suy luận 1 = 6)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v7c3-css-phong, nhánh claude/css-phong (từ nhánh chính, sau gộp V7c2 + brief này).

MỤC TIÊU (V7c3, gói cuối của chặng gỡ pixel; user 27/10: "chạy ổn rồi gỡ bộ vẽ pixel"): xong khi không còn dấu vết pixel ở CSS / phông / bảng màu / bộ đệm ngoại tuyến:
choi.css không còn khai báo pixel; font.css chỉ 6 @font-face Google Sans (Handjet / VT323 + 6 woff2 xoá); bang-mau.js không còn vai hết chỗ dùng; sw.js đổi tên bộ đệm; phanh chống tái phát mở rộng sang CSS / phông;
giao diện KHÔNG đổi (đo bằng máy, dưới) trừ chỗ ghi rõ là cố ý.

VIỆC (theo thứ tự, mỗi việc một commit; dò lại số dòng):
  e0. sw.js:11 BAN 'duong-hoc-v1' → 'duong-hoc-v2' (người chơi cũ còn part/*.js, ve.js / huy-hieu.js cũ, woff2 cũ trong bộ đệm). Soát sw.js có xoá bộ đệm khác tên lúc activate không; không có thì thêm (ghi lý do).
      ĐỔI NỀN PHANH: NEN_VEC của kiem-ve-vector (13a-v, dòng ~578), kiem-huy-hieu-phim-vector (A3-v / B5-v), kiem-nut-mo-dau-phim-vector (C3-v) từ c830c12 → 8780764 (commit gộp V7c2; V7c2 đã chứng minh
      hình y hệt c830c12). Chạy ba máy: xanh; --loi-gia: đỏ đủ. Sửa luôn chữ "c830c12" trong chú thích / tên kiểm cho khớp.
  e1. PHANH CSS (trước khi sửa CSS): dựng một máy đo KIỂU TÍNH (getComputedStyle) chạy trong trình duyệt thật (ô trình duyệt của bạn hoặc Chrome headless; tự chọn, ghi lý do), đi qua: màn đầu, Cài đặt, chọn gói,
      lưới màn, một màn chơi (khay mở, hộp gợi ý, hộp thắng / thua), Lắp robot, Sổ lệnh, thẻ Bộ phận mới, một phim; khổ 1280 × 800 và 360 × 640. Mỗi phần tử nhìn thấy ghi: hộp bao (làm tròn 0,5 px),
      color, background, border, border-radius, box-shadow, font-family / size / weight, opacity, transform, display, visibility. Chụp NỀN tại cây hiện tại (trước e2) ra tệp; máy so bản mới với nền, in khác biệt.
      Tự chứng minh: sửa tạm một khai báo choi.css đang có hiệu lực (vd đổi màu một nút) → máy phải báo khác; gỡ ra. Commit máy đo (tools/ hoặc hoc/, tự chọn) + tệp nền.
  e2. choi.css: bỏ khai báo pixel (V7c1 đếm 91: --wood* / --chalk / --stud / pixelated / steps( / clip-path răng cưa / phông Handjet, VT323…), `.deco .surf / .bev / canvas` (~48–52, phần tử không còn được tạo)
      + luật ẩn thừa ở choi-vector.css (~35), `canvas.lop-robot` image-rendering pixelated + hai dòng JS `style.imageRendering = 'auto'` trong san-ve.js (doiCo / datDoPhanGiai) nếu thành thừa.
      GIỮ choi-vector.css riêng, GIỮ tiền tố body.ve-vector (người giao quyết 29/10: bỏ tiền tố đổi độ ưu tiên CSS, rủi ro hình đổi mà không được gì). Máy đo e1: KHÔNG khác (khác thì đó là khai báo còn hiệu lực: trả lại).
  e3. Phông: font.css 12 → 6 @font-face, xoá 6 tệp woff2 Handjet / VT323; dong-goi-artifact.py PHONG_PIXEL (~38–47); kiem-dong-goi-artifact mục "font.css 12 @font-face" sửa theo; --px / --mono trong CSS trỏ thẳng Google Sans Flex / Code.
      san-ve.js: 3 chỗ `g.font = '8px VT323, monospace'` (đo bề ngang chữ cho HU.* vector: veBongMau / veThanhPin / veDan) → đo bằng ĐÚNG phông mà HU.* vẽ chữ (đọc ve-vector-hieu-ung.js), và dòng `g.fillStyle` bóng thân thừa trong veLopXe.
      Việc này ĐỔI lệnh vẽ (và có thể bề ngang bong bóng / thanh pin): phanh 13a-v sẽ đỏ ĐÚNG ở các lệnh đó. Làm thế này: chạy phanh, chép khác biệt (khung nào, lệnh nào) vào báo cáo, xem bằng mắt 2–3 khung có bong bóng / pin
      (ảnh trước / sau), nếu chỉ khác ở các lệnh dự kiến thì đổi NEN_VEC của phanh sang commit này (commit RIÊNG, ghi lý do), chạy lại xanh. Khác ngoài dự kiến → dừng, hỏi.
  e4. bang-mau.js: xoá các vai trong hoc/kiem-bang-mau.mjs VAI_CHO_V7C3 (V7c2 đếm 508 + 11 cũ), rồi xoá danh sách đó; dọn SUA_SAU_NEN / NEN theo đề xuất V7c2 (khoá tệp đã xoá; ghi rõ nếu đặt NEN = null).
      kiem-bang-mau "vai nào cũng có chỗ dùng" + "không còn mã gõ thẳng" phải xanh; lỗi giả đỏ. Vai `luatSanDo*` (Ve.MAU) còn dùng: giữ. Tệp tĩnh theme-color (choi.html, manifest, dong-goi-artifact.py) không đổi màu.
  e5. Dọn chữ cũ: chú thích choi.html:~39 và man-lap.js:~7 còn nói Part.ghep; kiem-ve-vector 14b / 14d lời "pixel"; README / chú thích đầu tệp nhắc chế độ pixel (grep -i "pixel" trong hoc/game, chỉ sửa câu sai,
      KHÔNG đụng nghĩa "pixel thiết bị" / "điểm ảnh" của canvas). PHANH CHỐNG TÁI PHÁT mở rộng kiem-ve-vector mục 15: CSS (choi.css, choi-vector.css) không `pixelated`, không `steps(`, không --wood / --chalk / --stud,
      không Handjet / VT323; font.css đúng 6 @font-face, thư mục font không còn woff2 Handjet / VT323; JS game không còn chuỗi VT323 (cả chuỗi đo chữ); sw.js BAN ≠ 'duong-hoc-v1'. Lỗi giả làm mục đỏ.

PHANH (xanh sau MỖI commit): kiem-ve-vector (13a-v, 15) · kiem-huy-hieu-phim-vector (A3-v / B5-v / A7) · kiem-nut-mo-dau-phim-vector (C3-v) · kiem-giao-dien-vector-b · máy đo kiểu tính e1 (từ e2).
  Phanh không đỏ khi cắm lỗi giả → nghi PHÉP THỬ trước (cắm đúng chỗ chưa, có đường nào bù không). Máy kiểm require ve-vector.js rồi require màn: nạp màn TRƯỚC khi cắm lỗi giả (V7c1 câu 4).

PHẠM VI: được sửa hoc/game/choi.css, choi-vector.css, font/ (font.css + xoá woff2 pixel), bang-mau.js, sw.js, san-ve.js (chỉ 3 chỗ g.font + dòng fillStyle thừa + 2 dòng imageRendering), choi.html (chú thích),
  man-lap.js (chú thích), chú thích đầu tệp nhắc pixel, hoc/dong-goi-artifact.py, hoc/kiem-*.mjs, tools/ (máy đo mới), README (dòng nhắc pixel). KHÔNG sửa: luật, màn, lộ trình, nội dung chữ / phim,
  bộ vẽ vector (ve-vector*.js, huy-hieu-vector.js, phim-vector.js) trừ khi phải đọc phông đo chữ, kế hoạch hoc/KE-HOACH-*.md, sổ canh. KHÔNG đổi màu nào đang hiện trên màn.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; số liệu là của agent V7c1 / V7c2. Được phép và được khuyến khích nói ngược lại (có bằng chứng): khai báo "pixel" mà thật ra còn hiệu lực ở vector,
  vai "thừa" mà còn chỗ dùng động (tên vai ghép chuỗi), thứ tự không hợp lý, cách gọn hơn. Kiểm lại từng khẳng định bằng code, đừng tin. Bất đồng CHẶN → dừng, commit WIP, ghi câu hỏi; KHÔNG chặn → làm theo brief, ghi vào CÂU HỎI.
  Quyết định của USER (không tự đi ngược): chuyển hẳn sang vector; gỡ bộ vẽ pixel; màu đội R1 #38BDF8 / R2 #F472B6; phông Google Sans Flex / Code; chữ hiển thị không emoji / không gạch dài;
  luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test; chạy sau mỗi nhóm commit, đừng dồn về cuối):
  node hoc/kiem-ve-vector.mjs            (+ --loi-gia: phải đỏ đủ)
  node hoc/kiem-huy-hieu-phim-vector.mjs (+ --loi-gia)
  node hoc/kiem-nut-mo-dau-phim-vector.mjs (+ --loi-gia)
  node hoc/kiem-giao-dien-vector-b.mjs   (+ --loi-gia)
  node hoc/kiem-bang-mau.mjs             (+ --loi-gia nếu có)
  node hoc/kiem-dong-goi-artifact.mjs
  node hoc/kiem-khay.mjs, node hoc/kiem-phim-goi.mjs, node hoc/kiem-lap-rap.mjs, node hoc/kiem-hoc.mjs, node hoc/kiem-sung-hoi.mjs (thẻ script trỏ tệp thật)
  Trình duyệt: `node -e "process.env.PORT='4202';import('./server.mjs')"` chạy nền tại worktree, tắt ngay khi xem xong; một tab của bạn, đóng khi xong; gỡ SW + xoá caches trong trang rồi tải lại.
  Lưu ý: ô trình duyệt của app có thể báo "An unknown error occurred when fetching the script" khi đăng ký service worker sau khi gỡ SW (người giao thử: tệp không tồn tại cũng ra đúng lỗi đó): môi trường, không phải lỗi game.
  Kiểm sw.js bằng cách khác (đọc mã; nếu dùng Chrome headless thì xem bộ đệm 'duong-hoc-v2' được tạo, 'duong-hoc-v1' bị xoá).
  Cuối gói: 0 lỗi console (trừ lỗi SW môi trường ở trên), 0 yêu cầu mạng tới woff2 pixel, document.fonts không còn Handjet / VT323, máy đo e1 không khác ở cả hai khổ.

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG rebase, không đụng nhánh / worktree khác. Tắt server trước khi kết thúc.
  Shell là Git Bash trên Windows; `cat > file` không có stdin sẽ treo, nên ghi tệp bằng công cụ ghi tệp.

BÁO CÁO CUỐI (ghi DẦN vào hoc/ban-giao/bao-cao-V7c3.md trong worktree, commit cùng commit cuối, VÀ trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1 KẾT QUẢ: SHA từng commit + việc; số dòng / số khai báo / số vai / số byte xoá theo tệp; lệnh kiểm + kết quả nguyên văn; máy đo kiểu tính (cách chạy, số phần tử đo, khác biệt = 0?); khác biệt cố ý ở e3 (khung, lệnh, ảnh); việc dở.
  2 CÂU HỎI CẦN LÀM RÕ: câu còn mở; câu đã tự quyết (quyết thế nào, vì sao, đảo lại được không); chỗ brief sai / thừa / thiếu (hoặc "brief không có chỗ nào sai").
  3 ĐỀ XUẤT: việc còn lại sau chặng gỡ pixel (nếu có), mục nào cần user quyết thì nêu vấn đề, các phương án, bạn nghiêng về đâu.
  4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5 RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
