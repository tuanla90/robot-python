NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi bước một commit (tệp lớn: mỗi vùng một commit); TỐI ĐA 40 phút một commit. CẤM khảo sát lại toàn bộ: bản đồ đã có (báo cáo V7c1 mục 3).
MỖI COMMIT PHẢI ĐỂ GAME CHẠY ĐƯỢC và các phanh vector (dưới) xanh: hết sức thì dừng ở commit xanh gần nhất và báo còn gì. Thà xoá đúng nửa còn hơn xoá hết mà không commit nào.
Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: hoc/ban-giao/luat-song-song.md (CẤM npm test; RAM yếu; lần này bạn chạy MỘT MÌNH, cổng server tạm 4202; cổng 4181 của người giao: không dùng, không tắt).
Rồi BẢN ĐỒ: hoc/ban-giao/bao-cao-V7c1.md mục 2 (câu hỏi 1, 2, 4) và mục 3 "V7c2" (bảng tệp / dòng xoá được / giữ, đo tại 37d61ff, nay chưa đổi); hoc/ban-giao/scout-go-pixel.md nếu cần;
hoc/KE-HOACH-GOP-DIEM10CODE.md dòng "28/10 V7c1 · Gỡ công tắc pixel xong" (người giao đã trả lời câu hỏi của V7c1).

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 2 (san-ve.js đường vẽ chung, ve.js / huy-hieu.js dùng khắp nơi), giá sai 1, mơ hồ 1, suy luận 1 = 7)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v7c2-xoa-pixel, nhánh claude/xoa-pixel (từ nhánh chính be8cf9e = sau khi gộp V7c1).

MỤC TIÊU (V7c2 trong ba gói gỡ pixel; user 27/10: "chạy ổn rồi gỡ bộ vẽ pixel"): xong khi mã vẽ pixel đã chết sau V7c1 bị XOÁ khỏi game và máy kiểm, hình trên màn KHÔNG đổi:
(a) thư mục hoc/game/part/ không còn, choi.html không nạp part/; (b) san-ve.js, ve-robot.js, huy-hieu.js, ve.js, phim / mở đầu / màn đầu / thanh-phan / ung-dung / xuong-ham không còn nhánh pixel
(không còn biến chế độ kiểu this.vec / VEC / cheDoVector() làm điều kiện: nhánh vector thành đường thẳng); (c) không máy kiểm nào đọc part/ hay chạy nhánh Part; (d) có PHANH CHỐNG TÁI PHÁT
(dưới) đã tự chứng minh bằng lỗi giả. CSS / phông / bảng màu / sw.js để V7c3.

VIỆC (theo thứ tự; dò lại số dòng; thứ tự là "chỗ gọi trước, chỗ cung cấp sau" để không commit nào để lại tham chiếu treo):
  d0. MÁY KIỂM trước: kiem-tay-xoay (≈345–372), kiem-loi-mua-2 (≈290–349), kiem-camera-drone (≈205–235) nạp ve-vector*.js trong vm như kiem-ve-vector 13 và đổi vế Part.* → VeVector.* (ổ, hamGoc, ghép được);
      soát cả kiem-may-son, kiem-lap-rap, kiem-bang-mau, kiem-huy-hieu-phim-vector, kiem-nut-mo-dau-phim-vector, kiem-ve-vector, kiem-gioi-thieu-part, kiem-sung-hoi, kiem-flycam, kiem-doi-thu-manh
      (grep `part/`, `Part\.`, `part-`): chỗ nào đọc part/ của CÂY LÀM VIỆC thì đổi; chỗ nạp nền c830c12 TỪ GIT (napGame … 'vec', phanh 13a-v / A3-v / B5-v / C3-v) là đúng, GIỮ.
      tools/kiem-tat-ca.mjs:11 bỏ 'hoc/game/part'. kiem-giao-dien-vector-b mục "man-dau.js đặt mat CHỈ khi VeVector.bat()" → luật mới (luôn đặt).
      Chứng minh: đổi tên tạm hoc/game/part → part.tam, chạy các máy kiểm vừa sửa: phải xanh; đổi tên lại rồi mới commit.
  d1. san-ve.js: xoá mọi nhánh else của this.vec (72 chỗ; 2–3 commit theo vùng: ô / vật → robot → hiệu ứng / mắt), thuSan pixel, datDoPhanGiai(0), :~1307 nhánh spr.laPart && !spr.laVector,
      veMatTam (giữ coMatDong: cài đặt "Biểu cảm mắt" đọc nó). GIỮ T, SON_XE, KINH_THAN. Sau đó bỏ biến this.vec nếu chỉ còn là hằng true.
  d2. ve-robot.js: theo bảng V7c1 (veTamTay / veTamXoay / ctxMoi, beNgangThan, coPart, veGhep, bongTay + export, HH_PIXEL, nhánh pixel của tiLeChoO / vatKep / vatXoay / reachCua / REACH, dungPart / ?part=0,
      cheDoVector / veVector luôn true). GIỮ phần bảng ghi "Giữ".
  d3. mo-dau.js, phim-goi.js, phim-mua-1.js (VEC luôn true → bỏ biến + 6 chỗ if (VEC)), phim-mua-2.js (soát), man-dau.js (mắt pixel), thanh-phan.js (hinhPart vế Part._veMot + HINH_PART, veMuot),
      ung-dung.js (datChatLieu, khungGo, phông theo body), xuong-ham.js (khungGo): bỏ vế pixel / lời gọi tới hàm pixel sắp xoá.
  d4. Xoá hoc/game/part/ (20 tệp) + 18 thẻ <script src="part/…"> trong choi.html; xoá hoc/chup-du-lieu-pixel.mjs (hết chạy được). hoc/du-lieu-chup-pixel.json GIỮ (chuẩn của kiem-lap-rap / kiem-ve-vector 12 / kiem-huy-hieu A7).
  d5. huy-hieu.js: xoá Painter P, partTho, mọi HINH['x'] = function, vePixel, bí danh trùng (đã ở huy-hieu-vector.js), cheDoVec / mkGoc; còn ve / mk / maVec / DS dựng thẳng từ VeVector.HUY_HIEU
      (tệp ~40 dòng; gộp vào huy-hieu-vector.js nếu gọn hơn — tự quyết, ghi lý do). Câu hỏi 1 V7c1: ve.js ico / sao / mui / khoa / hydrate bỏ vế lùi `|| nhan(mk(pixel…))` ở bước d6.
  d6. ve.js: xoá Painter, rot90 / rng / tex*, datChatLieu, icon pixel + lưới HINH (giữ CO_ICON), sprite*, make* (Rug … Nhen, MatMau, CrateMau, VatNho), tiles(), phongVec, khungGo, vế lùi pixel trong ico / sao / mui / khoa / hydrate.
      GIỮ T = 14, MAU / MAU_TEN, mk thu gọn nếu the-part.js / mo-dau.js / phim-goi.js còn dùng cho canvas vector, ico / sao / khoa / mui / hydrate (vector), CO_ICON, svgVec.
  d7. hoc/hinh-mau/xem-vector*.html bỏ iframe ?ve=pixel + cột pixel (HuyHieu.vePixel); tools/ve-icon.py xoá nếu không còn ai dùng; kiem-bang-mau SUA_SAU_NEN / VAI_CHO_V7C3: chỉ sửa khoá của tệp đã xoá
      (vai màu thừa để V7c3). PHANH CHỐNG TÁI PHÁT: thêm một mục máy kiểm (vd kiem-ve-vector mục 15): không có thư mục hoc/game/part, choi.html không nạp part/, mã game không còn `Part.`,
      `this.vec`, `HINH['…'] = function`, `imageRendering`/`pixelated` trong JS game (tự chọn danh sách mẫu cho đủ, ghi trong chú thích), kèm lỗi giả --loi-gia làm mục đó đỏ.

PHANH (đã có từ V7c1, so VECTOR với nền c830c12 — phải XANH sau MỖI commit d1–d6; đây là bằng chứng hình không đổi):
  kiem-ve-vector 13a-v (39 lần chơi, 8104 khung) · kiem-huy-hieu-phim-vector A3-v (84 huy hiệu × 3) / B5-v (19 phim) / A7 · kiem-nut-mo-dau-phim-vector C3-v (6 khung mở đầu) · kiem-lap-rap (so dữ liệu chụp).
  Phanh đỏ sau một bước → bước đó xoá nhầm thứ vector đang dùng: sửa trước khi đi tiếp. Phanh không đỏ khi cắm lỗi giả → nghi PHÉP THỬ trước (cắm đúng chỗ chưa, có đường nào bù không), đừng vội nghi phanh.
  Lưu ý V7c1 câu hỏi 4: máy kiểm require ve-vector.js rồi require màn thì dùng chung một VeVector với lap-rap.js: nạp màn TRƯỚC khi cắm lỗi giả.

PHẠM VI: được sửa / xoá hoc/game/* (trừ luật san-hoc.js / cham.js, trừ choi.css / choi-vector.css / font/ / bang-mau.js / sw.js), choi.html, hoc/kiem-*.mjs, tools/kiem-tat-ca.mjs, tools/ve-icon.py,
  hoc/hinh-mau/xem-vector*.html, hoc/chup-du-lieu-pixel.mjs. KHÔNG sửa: luật, màn, lộ trình, nội dung chữ / phim (lời, khung, thời lượng), kế hoạch hoc/KE-HOACH-*.md, sổ canh. KHÔNG đổi hình vector nào.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bảng xoá là của agent V7c1, đo tại 37d61ff. Được phép và được khuyến khích nói ngược lại (có bằng chứng): bảng đánh dấu "chết" mà thật ra
  đang chạy, thứ tự không hợp lý, có cách gọn hơn. Kiểm lại từng khẳng định bằng code, đừng tin (vd "chết lúc chạy" phải là KHÔNG còn đường gọi, không phải "chưa thấy ai gọi" qua grep).
  Bất đồng CHẶN → dừng, commit WIP, ghi câu hỏi. KHÔNG chặn → làm theo brief, ghi vào CÂU HỎI CẦN LÀM RÕ.
  Quyết định của USER (không tự đi ngược): chuyển hẳn sang vector; gỡ bộ vẽ pixel; màu đội R1 #38BDF8 / R2 #F472B6; chữ hiển thị không emoji / không gạch dài;
  luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test; chạy sau mỗi nhóm commit, đừng dồn về cuối):
  node hoc/kiem-ve-vector.mjs            (+ node hoc/kiem-ve-vector.mjs --loi-gia: phải đỏ đủ)
  node hoc/kiem-huy-hieu-phim-vector.mjs (+ --loi-gia)
  node hoc/kiem-nut-mo-dau-phim-vector.mjs
  node hoc/kiem-giao-dien-vector-b.mjs
  node hoc/kiem-lap-rap.mjs
  node hoc/kiem-khay.mjs
  node hoc/kiem-phim-goi.mjs
  node hoc/kiem-bang-mau.mjs
  node hoc/kiem-dong-goi-artifact.mjs    (gói Artifact không được còn tệp part/)
  node hoc/kiem-hoc.mjs, node hoc/kiem-huong-dan.mjs, node hoc/kiem-che-cam-bien.mjs
  mọi máy kiểm sửa ở d0 (chạy từng cái); cuối gói chạy thêm từng cái: kiem-may-son, kiem-gioi-thieu-part, kiem-sung-hoi, kiem-flycam, kiem-doi-thu-manh, kiem-loi-mua-2, kiem-tay-xoay, kiem-camera-drone
  Trình duyệt (cuối gói): `node -e "process.env.PORT='4202';import('./server.mjs')"` chạy nền tại worktree, tắt ngay khi xem xong; một tab của bạn, đóng khi xong; gỡ SW + xoá caches trong trang rồi tải lại.
  Soát bằng script trong trang: màn đầu, chọn gói, lưới màn, Lắp robot (ghép đúng câu báo), một màn mỗi thân (hai-banh, xich, nhen, omni, drone), một màn hai robot, phim mở đầu, một phim gói, Cài đặt:
  0 lỗi console, 0 yêu cầu mạng tới part/, 0 canvas pixelated.

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG rebase, không đụng nhánh / worktree khác. Tắt server trước khi kết thúc.
  Shell là Git Bash trên Windows; `cat > file` không có stdin sẽ treo, nên ghi tệp bằng công cụ ghi tệp.

BÁO CÁO CUỐI (ghi DẦN vào hoc/ban-giao/bao-cao-V7c2.md trong worktree của bạn, commit cùng commit cuối, VÀ trong câu trả lời cuối) — đủ 5 mục, mục nào trống ghi "không có":
  1 KẾT QUẢ: SHA từng commit + việc; số dòng xoá theo tệp; lệnh kiểm + kết quả nguyên văn; phanh chống tái phát + lỗi giả; việc dở.
  2 CÂU HỎI CẦN LÀM RÕ: câu còn mở; câu đã tự quyết (quyết thế nào, vì sao, đảo lại được không); chỗ brief / bảng V7c1 sai, thừa, thiếu (hoặc "brief không có chỗ nào sai").
  3 ĐỀ XUẤT cho V7c3 (choi.css, font, sw.js, bang-mau.js): danh sách theo tệp kèm số dòng hiện tại; mục nào cần user quyết thì nêu vấn đề, các phương án, bạn nghiêng về đâu.
  4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu).
  5 RỦI RO CÒN LẠI: điều chưa kiểm được và cách kiểm.
