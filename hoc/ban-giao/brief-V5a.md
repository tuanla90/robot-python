NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút một commit; mỗi vùng giao diện một commit. CẤM làm hết rồi mới xem: sửa vùng nào xem trình duyệt vùng đó. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ. npm test (~10 phút) chỉ chạy MỘT lần ở cuối, ghi ra tệp. (Phiên giao việc có thể khởi động lại giữa chừng: commit sớm.)

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 2, suy luận 1 = 7)

MỤC TIÊU: xong khi ở chế độ vector (`?ve=vector`) **toàn bộ giao diện MÀN CHƠI** (mọi thứ quanh sân) là giao diện phẳng kiểu diem10code, cùng tông "lab trắng" với sân vector: không còn vân gỗ, bảng phấn, khối lệnh hình gạch có núm, viền vát nhiều lớp, phông pixel, hoạt cảnh giật `steps()`; chơi được đủ ở máy tính lẫn khổ điện thoại 360 × 640; chế độ pixel y nguyên; `npm test` xanh.

BỐI CẢNH:
- Yêu cầu user 27/10: "còn phải làm lại cả các phần UI khác như khung code, rìa ngoài, các button". Kế hoạch: hoc/KE-HOACH-GOP-DIEM10CODE.md (đầu tệp mục 0, mục 2a / 2c, dòng "V5 làm lại TOÀN BỘ giao diện ngoài sân" → V5a là màn chơi; V5b là các màn khác — KHÔNG làm V5b ở gói này). Đọc chú thích đầu hoc/game/choi.css (1187 dòng, kiểu pixel: font Handjet / VT323 qua hoc/game/font/font.css, vân gỗ `--wood*`, `.chalk`, `.brick` + `--stud`, ~51 `steps()`, icon `.pxi`), choi.html, các tệp dựng khung code / khay (thanh-phan.js `TP.*`, man-choi.js, xuong-ham.js, thanh-cuon.js, cai-dat.js, huong-dan*.js).
- Ngôn ngữ thiết kế diem10code (ĐỌC): D:\Users\tuanla2\tin_hoc\public\css\tokens.css (màu thương hiệu tím chàm `--brand`, bề mặt, `--code-*`, bóng `--elev-1..3`, bán kính `--r-sm/md/lg/full` = 10 / 16 / 24 / tròn, phông `--font-sans` Google Sans Flex và `--font-mono` Google Sans Code) và styles.css cùng thư mục (nút, thẻ, ô mã). Lấy giá trị về làm vai `vec*` / biến CSS trong hoc/game/bang-mau.js (CHỈ THÊM vai), không link sang repo kia.
- Sân vector đã xong (V1–V4, gộp a2f1ed1): ô trắng bo góc, sàn bàn cờ hai tông xám nhẹ, viền chàm đậm, đèn cyan, R1 xanh `#38BDF8`, R2 hồng `#F472B6`. Giao diện phải hợp tông đó: nền lavender / trắng rất nhạt, thẻ trắng bo góc bóng mềm, chữ chàm đậm, nút chính tím chàm, điểm nhấn cyan; R1 / R2 dùng đúng màu đội.
- Phông: tải Google Sans Flex (biến thiên 300..800) và Google Sans Code (400..700) từ Google Fonts (giấy phép OFL; CSS2 API `fonts.googleapis.com/css2?family=Google+Sans+Code:wght@400..700&family=Google+Sans+Flex:wght@300..800` → tệp .woff2 ở fonts.gstatic.com, lấy bộ latin + latin-ext + vietnamese), CẤT vào hoc/game/font/ và khai trong font/font.css như Handjet / VT323 (game chạy offline qua sw.js, sw.js đã tự đọc font.css). Không tải được thì dừng và báo, không lấy phông nguồn khác.
- Chế độ: giao diện mới chỉ áp khi vector (body có lớp / thuộc tính đánh dấu chế độ, ví dụ `body.ve-vector` hay `[data-ve=vector]` — chọn một, đặt ở chỗ đã đọc `VeVector` chế độ); CSS mới đặt trong tệp mới hoc/game/choi-vector.css (khuyên) phủ lên choi.css bằng bộ chọn có lớp đó; pixel giữ y choi.css cũ. (Gói V7 sau này mới đổi mặc định và gỡ pixel.)

VÙNG CẦN LÀM (mỗi vùng một commit, thứ tự gợi ý):
  1. Nền tảng: phông mới + biến (`--px` / `--mono` ở vector trỏ phông mới, bỏ hệ số `--kp` / `--km` / `--wm` cho phông pixel), nền trang, rìa / khung ngoài `.screen` `.deco .surf`, nền điện thoại `body.dien-thoai`, bỏ `image-rendering: pixelated` ở vector.
  2. Thanh trên `.top` (tên màn, sao, nút menu) + cột nút sân (Chạy / Nhịp / Lại / Gợi ý / tốc độ / Đề bài) + bảng nhịp + khung ôm sân `.khung-san` / `.ffr` (thẻ trắng bo góc thay gỗ).
  3. KHUNG CODE: `.pan` `.row` `.strip` `.tab`, số dòng, dòng chọn (`.row.sel`), dòng lỗi / chớp đỏ, dòng trống nét đứt, tab R1 / R2, nút xoá, thanh cuộn — kiểu ô mã diem10code (`--code-surface`, `--code-line`, Google Sans Code), dễ đọc, tương phản đủ (WCAG AA).
  4. KHỐI LỆNH `.brick` (mọi biến thể màu: cy, yl, gr, pu, or, tay, vong, bien, chan, truot, dk, dem, wh, ls…) thành THẺ PHẲNG bo góc: giữ màu theo nhóm lệnh (dải màu trái hoặc nền nhạt + viền đậm cùng màu), bỏ núm `::before`, ô tham số `.num` / `.chip` thành viên thuốc; trạng thái lit / nháy / kéo dùng chuyển động mượt.
  5. Khay lệnh / bảng chọn (`.pal` `.pal-the` `.hop*` trong màn chơi, `.ds-*`, `.chon-*`), hộp gợi ý / đề bài (`.hd-*`, `.gt-*` nếu hiện trong màn chơi), toast, hộp thoại `.md*` (kết quả màn: sao, nút Tiếp / Chơi lại), menu.
  6. MỌI NÚT (`.bt`, `.cbtn`, nút trong hộp…): thường / rê / nhấn / tắt / đang chọn — phẳng, bo `--r-sm`, bóng `--elev-1`, nhấn thì lún nhẹ (transform mượt), vòng focus thấy rõ khi dùng bàn phím. Nút chính tím chàm, nút phụ trắng viền.
  7. Bỏ `steps()` ở vector: mọi animation / transition dùng ease mượt; tôn trọng `prefers-reduced-motion`.
  8. Chữ trên canvas ở vector (bong bóng "…" / "?", chữ thanh pin / thẻ đạn trong ve-vector-hieu-ung.js) dùng Google Sans Flex / Code thay VT323 (đề xuất của V4).
  9. Robot ngoài sân to hơn: V4 làm `VeRobot.veCo` lấy pxCss = cạnh ô nên robot vector nhỏ hơn bản pixel ~17%; người giao chốt: ở vector phóng ×1,2 (hằng số trong ve-robot.js) cho bằng bản pixel ở Lắp robot / thẻ Bộ phận mới.
  10. Mục Cài đặt (cai-dat.js): thêm công tắc "Kiểu vẽ: Nét mới (vector) / Điểm ảnh (pixel)", lưu qua `VeVector.luuCheDo`, đổi xong tải lại trang. Chữ hiển thị theo luật diem10code: không emoji, không dấu gạch dài.
  11. Cỡ ô sân: kiểm sân lớn / nhỏ ở khổ điện thoại và máy tính, khung không vỡ khi `Field.canhO` đổi; ghi lại cỡ ô nhỏ nhất thực tế.

PHẠM VI: được tạo tệp mới trong hoc/game/ (choi-vector.css, phông), sửa choi.html (link css / phông), font/font.css (thêm phông), bang-mau.js (chỉ THÊM vai `vec*`), cai-dat.js, ve-robot.js (hằng phóng ×1,2), ve-vector-hieu-ung.js (chỉ phông chữ canvas), các tệp JS màn chơi khi cần thêm lớp / thuộc tính cho CSS (không đổi hành vi), hoc/kiem-ve-vector.mjs, hoc/kiem-bang-mau.mjs (chỉ thêm tệp vào SUA_SAU_NEN nếu bắt buộc, nói rõ), hoc/hinh-mau/xem-vector.html (mục V5a: bảng mẫu nút / khối lệnh / khung code ở các trạng thái). KHÔNG sửa luật (san-hoc.js, cham.js), màn, lộ trình, các màn ngoài màn chơi (màn đầu, bản đồ gói, Lắp robot, sổ lệnh, phim, huy hiệu — V5b / V6), choi.css cũ (pixel giữ nguyên; chỉ được thêm bộ chọn nếu không cách nào khác, nói rõ). Chế độ pixel đổi một điểm ảnh → sai.

CÁCH GIAO: nhánh claude/ve-vector-giao-dien-a trong worktree riêng, tạo từ HEAD nhánh claude/tay-gap-xoay-comparison-00c53c (`git log -1`); commit từng vùng, message tiếng Việt, cuối message dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. KHÔNG push, KHÔNG merge, KHÔNG đụng nhánh khác. Tắt mọi server tạm trước khi kết thúc. Ô Trình duyệt dùng chung với phiên khác: chỉ dùng tab của mình, không reload / sửa tab khác.

KIỂM TRA:
  node hoc/kiem-ve-vector.mjs          ← thêm mục: ở vector trang nạp đủ phông mới + choi-vector.css, không còn `steps(` / `pixelated` / phông Handjet-VT323 áp vào phần tử màn chơi (đếm bằng cách đọc CSS + bộ chọn), công tắc Cài đặt lưu đúng; `--loi-gia` có lỗi giả mới phải đỏ
  node hoc/kiem-bang-mau.mjs           ← pixel y nguyên
  npm test                              ← MỘT lần cuối, ghi ra tệp; nền 81/81
  Trình duyệt: server tạm `node -e "process.env.PORT='4199';import('./server.mjs')"`; `choi.html?ve=vector&debug=1&man=<mã>` vào thẳng màn. Xem ở khổ máy tính VÀ 360 × 640 (resize_window): một màn đơn (vd vong-lap.3), một màn có tham số / hàm (omni.3), một màn hai robot (hai-robot.2: tab R1 / R2), hộp kết quả sau khi thắng (gõ lời giải ngắn), hộp Bộ phận mới, Cài đặt. So với `?ve=pixel` cùng màn: pixel không đổi. Ghi màn đã xem; tả bằng lời từng vùng trước / sau.
  Shell là Git Bash trên Windows; `cat > file` không có stdin sẽ treo — ghi tệp bằng công cụ Write.

BÁO CÁO CUỐI — đủ 5 mục:
  1. KẾT QUẢ: nhánh + SHA, file đổi, lệnh kiểm + kết quả nguyên văn, bảng vùng giao diện: vùng · trước (pixel) · sau (vector) · tệp; màn đã xem; cỡ ô nhỏ nhất thực tế.
  2. CÂU HỎI CẦN LÀM RÕ.
  3. ĐỀ XUẤT (cho V5b các màn khác, V6 huy hiệu + phim).
  4. PHẦN CHO NGƯỜI KHÔNG ĐỌC CODE: 3–5 câu.
  5. RỦI RO CÒN LẠI.
