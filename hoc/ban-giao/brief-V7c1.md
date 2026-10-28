NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi bước một commit; TỐI ĐA 40 phút một commit. CẤM khảo sát lại toàn bộ: bản đồ đã có. Sửa bước nào kiểm bước đó. Hết sức thì dừng và báo còn gì. Vướng mà tự quyết có thể sai hướng → DỪNG, commit WIP, ghi câu hỏi.

ĐỌC TRƯỚC: D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\luat-song-song.md (CẤM npm test; RAM yếu; bạn chạy một mình). Rồi BẢN ĐỒ: hoc/ban-giao/scout-go-pixel.md (Scout 28/10) và báo cáo V7b D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-V7b.md mục 3 (đề xuất V7c1 / c2 / c3 của agent V7b, đã ở trong code sâu nhất). Rồi hoc/KE-HOACH-GOP-DIEM10CODE.md dòng "28/10 Scout gỡ pixel" (quyết định: phương án C gỡ theo lớp).

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 2 (luật ghép part, danh sách huy hiệu, máy kiểm), giá sai 1, mơ hồ 1, suy luận 2 = 8)

CHỖ LÀM: worktree D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\v7c1-phanh-vector, nhánh claude/go-pixel-1 (từ nhánh chính sau khi gộp V7b; bạn chạy một mình).

MỤC TIÊU (V7c1 trong ba gói gỡ pixel; user 27/10: "V7 đổi mặc định sang vector, chạy ổn rồi gỡ bộ vẽ pixel"): xong khi (a) mọi phanh đang so PIXEL có phanh VECTOR thay thế đã tự chứng minh bắt lỗi (lỗi giả đỏ); (b) mọi LOGIC đang nằm trong tệp pixel đã tách ra chỗ không phụ thuộc pixel, kèm máy kiểm chứng minh kết quả y như trước; (c) công tắc pixel gỡ: game luôn vector (bat() luôn true, `<body class="ve-vector">` có sẵn, bỏ hàng Cài đặt "Kiểu vẽ", `?ve=pixel` không còn tác dụng). Mã pixel còn nằm đó (chết) cho V7c2 xoá; CSS / phông / bảng màu để V7c3. Game chạy y như ở vector trước gói này; máy kiểm đạt.

VIỆC (theo thứ tự, mỗi việc một commit; dò lại số dòng vì V7b đã đổi):
  c0. CHỤP trước khi đổi gì: dữ liệu logic đang sinh từ mã pixel (Part.ghep: câu báo lỗi ghép cho MỌI tổ hợp thân × tay × cảm biến × ổ, hamGoc từng bộ phận, HuyHieu.DS + bí danh, SON / DS_SON nếu còn dùng) ghi thành tệp dữ liệu chụp trong hoc/ (vd hoc/du-lieu-chup-pixel.json), kèm ghi rõ commit chụp.
  c1. Phanh vector mới: kiem-ve-vector 13a ("phát lại PIXEL khớp nền a962f7b") → "phát lại VECTOR khớp nền <SHA nhánh chính sau V7b>" (so lệnh vẽ vector từng khung như 13a đang làm cho pixel); kiem-huy-hieu-phim-vector A3 / B5 và kiem-nut-mo-dau-phim-vector mục C → so bản vector với nền đó; kiem-bang-mau mục 4 / 5 (8528 ảnh bộ phận pixel) → bỏ hoặc đổi theo đề xuất V7b; mỗi phanh mới có lỗi giả đỏ. Phanh pixel cũ GIỮ tới khi phanh vector tương ứng đạt.
  c2. Tách logic: luật ghép (part.js; lap-rap.js gọi lúc chơi) → VeVector.kiemGhep (đã có, cùng câu báo, V3) hay một tệp luật không vẽ; hamGoc → dữ liệu; HuyHieu.DS + bí danh → dữ liệu (huy-hieu-vector.js hay tệp riêng); SON / DS_SON + hàng sơn + Luu.son: bỏ (R1 cố định màu đội ở vector, người giao đã quyết); Ve.T = 14 và Ve.MAU giữ (hệ toạ độ, nhánh vector đang dùng). Máy kiểm so với dữ liệu chụp c0: y hệt.
  c3. 26 máy kiểm đang regex `HINH['ma'] = function` trong chữ huy-hieu.js → một hàm chung đọc danh sách mã từ dữ liệu / huy-hieu-vector.js.
  c4. Gỡ công tắc: bat() luôn true; choi.html `<body class="ve-vector">`; bỏ hàng "Kiểu vẽ" trong Cài đặt (cai-dat.js, chu.js khoá chữ không dùng nữa); ve.js svgVec bỏ đường lùi pixel, cỡ icon thành bảng cố định (V7b đo: edit 9×9, star 11×10, lock 12×14 / nhỏ 10×11, mui 10×9, trum 24×24, HINH cột+2 × hàng+2: tự đo lại); phim-vector.js RIENG trum 26 → 24 (V7b: đo thật 24×24). Máy kiểm đang so pixel qua `?ve=pixel` (13a cũ, A3 / B5 cũ…) gỡ ở bước này (đã có phanh vector c1).
  Ba máy nạp ve-robot.js không nạp ve-vector.js (kiem-loi-mua-2, kiem-tay-xoay, kiem-camera-drone) và tools/kiem-tat-ca.mjs đọc thư mục hoc/game/part: xem lại sau c4 (part/ còn, V7c2 mới xoá).

PHẠM VI: được sửa hoc/game/* (trừ luật san-hoc.js / cham.js), choi.html, máy kiểm hoc/kiem-*.mjs, tools/kiem-tat-ca.mjs, tạo tệp dữ liệu chụp. KHÔNG sửa: luật, màn, lộ trình, nội dung chữ / phim. KHÔNG xoá tệp mã pixel (part/*.js, nhánh pixel trong san-ve.js / ve-robot.js…): V7c2; KHÔNG đụng choi.css / phông / bảng màu: V7c3.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài; được phép và được khuyến khích nói ngược lại (có bằng chứng). Kiểm lại từng khẳng định của brief / Scout / V7b bằng code. Quyết định của USER (không tự đi ngược): chuyển hẳn sang vector; gỡ bộ vẽ pixel; màu đội R1 #38BDF8 / R2 #F472B6; chữ không emoji / không gạch dài; luật UI (nút chỉ icon có title + aria-label nói nút làm gì, vùng chạm ≥ 24 px, rê chuột trong @media (hover:hover)).

KIỂM TRA (tại worktree, từng lệnh một, KHÔNG npm test):
  node hoc/kiem-ve-vector.mjs  (+ --loi-gia)
  node hoc/kiem-huy-hieu-phim-vector.mjs  (+ --loi-gia)
  node hoc/kiem-nut-mo-dau-phim-vector.mjs
  node hoc/kiem-giao-dien-vector-b.mjs
  node hoc/kiem-phim-goi.mjs
  node hoc/kiem-bang-mau.mjs
  node hoc/kiem-lap-rap.mjs
  node hoc/kiem-khay.mjs
  node hoc/kiem-dong-goi-artifact.mjs
  node hoc/kiem-hoc.mjs, node hoc/kiem-xuong-ham.mjs (đọc thanh-phan / ung-dung / the-part)
  mọi máy kiểm có regex HINH sau c3 (liệt kê, chạy từng cái)
  Trình duyệt: `node -e "process.env.PORT='4202';import('./server.mjs')"` chạy nền, tắt ngay khi xem xong; gỡ SW + xoá caches trước; soát bằng script trong trang (màn đầu, chọn gói, lưới màn, Lắp robot, màn chơi, phim, Cài đặt): 0 icon / canvas / phông pixel, Lắp robot ghép đúng câu báo lỗi, không lỗi console.

CÁCH GIAO: commit từng việc, message tiếng Việt, cuối message `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge. Tắt server trước khi kết thúc.

BÁO CÁO CUỐI (ghi dần vào D:\Users\tuanla2\AppData\Local\Temp\claude\D--Users-tuanla2-game-doi-robot-chan-hung\d7997ec0-8032-4f94-b87a-00632587e5fe\scratchpad\bao-cao-V7c1.md VÀ trong câu trả lời cuối) — đủ 5 mục: 1 KẾT QUẢ (SHA, tệp đổi, lệnh kiểm + kết quả nguyên văn, bảng phanh: pixel cũ → vector mới · lỗi giả). 2 CÂU HỎI CẦN LÀM RÕ. 3 ĐỀ XUẤT cho V7c2 / V7c3 (danh sách tệp / hàm chết có thể xoá, theo tệp, kèm số dòng). 4 PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE (3–5 câu). 5 RỦI RO CÒN LẠI.
