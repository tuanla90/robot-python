# Brief PDM1: mùa 1 gói 10 "chạy một mình" (mọi màn nhiều sân)

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi 2–3 màn xong một commit; tối đa 40 phút phải có commit. CẤM khảo sát toàn bộ rồi mới sửa.
Hết sức thì dừng và báo còn gì: thà 10 màn đúng còn hơn 20 màn không commit.**

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (lo-trinh-hoc.js), giá sai 1, mơ hồ 1, suy luận 1 = 5)

MỤC TIÊU: xong khi 20 màn của gói 10 mùa 1 (chương `robot-hoan-thien` và `trum-mua-1`) đều có 2–3 sân, một lời giải tổng quát thắng 3 sao mọi sân,
và `node hoc/kiem-part-mua.mjs` không còn dòng nào của mùa 1 khi thêm 'mua-1' vào XONG.

BỐI CẢNH:
- User chốt 31/10 khuôn mới mỗi mùa: `hoc/KE-HOACH-PART-DUNG-MUA.md` (đọc mục 1 và 2). Gói 10 = "R1 chạy một mình": cỗ máy xuất xưởng ở lại kho làm việc bằng mật lệnh
  đã viết, Sola và Luna đi tiếp. Mỗi màn nhiều sân, mỗi sân là một "ngày làm việc" (thùng / hốc / cửa ở chỗ khác), chương trình viết cứng cho một sân KHÔNG qua.
- Hiện trạng: `node hoc/kiem-part-mua.mjs --chi-tiet` in 18 dòng mùa 1: robot-hoan-thien.1–8, trum-mua-1.1–9 chỉ một sân; trum-mua-1.4 là màn hai robot (gói 10 không còn đội).
  cam-bien-ben.10, robot-hoan-thien.11, trum-mua-1.10 đã ba sân.
- Màn ở: `hoc/man-robot-hoan-thien.js` (ngân hàng gốc; một số màn được sửa lại ở `hoc/lo-trinh-hoc.js` qua sua() / khối riêng: grep mã màn), `hoc/man-trum-mua-1.js`.
  Lộ trình: `hoc/lo-trinh-hoc.js` dòng ~427–470 (TRUM_1, TRUM_2, KIEU_TONG_HOP) và khối 31/10 "lenTayXoay": từ gói 7 mùa 1 R1 tay kẹp đã được nâng thành tay xoay.
- Mẫu màn nhiều sân đã có: trum-mua-1.10, robot-hoan-thien.11, che-cam-bien.10 (khối trong lo-trinh-hoc.js, có loiSai "đếm cứng" chứng minh bài ép tổng quát).
  Luật sân / nhiều sân: đầu `hoc/san-hoc.js`; các trường song song với san (batDau, bongMo, noi, vatMau…) khi san là mảng sân: xem hàm motSan() ở đầu lo-trinh-hoc.js.
- Luật học (memory user): đường cong mượt trong chương (màn 1–3 làm quen, 4–6 luyện, 7–9 biến thể, 10 trùm; không nhảy vọt độ dài lời giải / nhịp / cỡ sân);
  không hai màn liền nhau cùng kiểu bài (kiem-trum-mua-1.mjs); gói 9 + 10 nhắc lại các gói 1–8 (bảng recall của kiem-trum-mua-1.mjs).

PHẠM VI: được sửa `hoc/man-trum-mua-1.js`, `hoc/man-robot-hoan-thien.js` (chỉ màn của gói 10; màn ngân hàng dùng ở nơi khác thì KHÔNG sửa ngân hàng mà sửa ở lộ trình),
`hoc/lo-trinh-hoc.js` (khối gói 10 mùa 1, danh sách NHIEU_SAN/kiểu bài nếu cần), các máy kiểm mùa 1 (`hoc/kiem-trum-mua-1.mjs`, `hoc/kiem-robot-hoan-thien.mjs`,
`hoc/kiem-lo-trinh.mjs` mục nhiều sân / mùa 1, `hoc/kiem-lach-mua-1.mjs` nếu có mục dính), `hoc/kiem-part-mua.mjs` (chỉ thêm 'mua-1' vào XONG ở commit cuối).
KHÔNG sửa: lõi `hoc/san-hoc.js`, `hoc/cham.js`, `nhan/`, giao diện `hoc/game/`, mùa 2–4, mã màn (`ma` là khoá lưu sao: không đổi, không xoá).

CÁCH LÀM:
1. Mỗi màn một sân → thêm 1–2 sân "ngày khác" (thùng / hốc / chiều dài hành lang khác) sao cho lời giải chuẩn (tổng quát: while / if với cảm biến) thắng mọi sân,
   và một lời giải đếm cứng thua ở ít nhất một sân: thêm vào loiSai với phaiCoMa đúng (như che-cam-bien.10). Lời giải chuẩn hiện đếm cứng (for range(3)…) thì sửa
   lời giải / sân cho cần cảm biến, giữ ý bài. Sân thêm cùng khổ, cùng độ khó, không làm lời giải dài hơn màn sau.
2. trum-mua-1.4 (hai robot): thay bằng màn MỘT robot nhiều sân cùng ý "trao hàng" (ví dụ: R1 tự chuyển hàng qua hai trạm), giữ mã trum-mua-1.4.
   Gỡ chỗ máy kiểm trông đợi trum-mua-1.4 là đội (kieuBai 'hai-robot' trong kiem-trum-mua-1.mjs): bảng kiểu bài phải vẫn đạt "không hai màn liền nhau cùng kiểu".
3. Đề bài / gợi ý nói rõ "mỗi ngày kho xếp khác, viết một chương trình chạy đúng mọi ngày" (giữ giọng chữ đang có của chương). Tên màn được đổi nếu cần.
4. Đo lại sao (sao.o / sao.nhip) bằng cham.js theo lời giải (kiem-trum-mua-1.mjs, kiem-lo-trinh.mjs so khớp: m.phienBanNoiDung 2 thì r.soNhip / r.soO phải khớp).
5. Máy kiểm "nhiều sân chỉ ở màn trùm" (kiem-lo-trinh.mjs dòng ~70, NHIEU_SAN_KHONG_TRUM): thêm luật "gói 10 mùa 1 mọi màn được nhiều sân" thay vì liệt kê.
6. Commit cuối: thêm 'mua-1' vào XONG của `hoc/kiem-part-mua.mjs`.

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn người giao. Được và nên nói ngược brief (bằng chứng sai, cách đơn giản hơn,
màn nào không thể nhiều sân mà vẫn giữ ý). Bất đồng chặn đường → dừng, commit WIP, báo ngay. Bất đồng không chặn → làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Quyết định của USER (không tự đi ngược): gói 10 mọi màn nhiều sân, một robot; R1 tay xoay từ gói 7. Kiểm lại từng khẳng định trong brief bằng code, đừng tin.

CÁCH GIAO: nhánh `claude/pdm-1` trong worktree `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\pdm-1` (đã dựng sẵn); commit từng bước; KHÔNG push, KHÔNG merge.
Mọi lệnh chạy với cwd = worktree đó.

KIỂM TRA (chạy sau mỗi nhóm commit; CẤM `npm test` cả bộ vì RAM, người giao chạy):
  node hoc/kiem-lo-trinh.mjs > /tmp-không-dùng → ghi ra tệp trong scratchpad của bạn rồi đọc dòng cuối "ĐẠT … kiểm tra lộ trình xuất bản."
  node hoc/kiem-trum-mua-1.mjs
  node hoc/kiem-robot-hoan-thien.mjs
  node hoc/kiem-lach-mua-1.mjs
  node hoc/kiem-combo-mua-1.mjs
  node hoc/kiem-part-mua.mjs --chi-tiet        (mùa 1 phải còn 0 dòng)
  Lọc riêng: npm test -- mua-1   (chỉ các máy kiểm có "mua-1" trong tên; được phép)
Nền: tại commit giao việc, mọi bộ trên ĐẠT (kiem-part-mua ở chế độ theo dõi).

DỪNG VÀ HỎI KHI: phải sửa lõi san-hoc.js / cham.js; phải đổi mã màn; một màn không thể nhiều sân mà giữ ý (báo, đề xuất thay màn).

BÁO CÁO CUỐI — 5 mục, mục trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, tệp đổi, lệnh kiểm + dòng kết quả nguyên văn, việc dở. Bảng 20 màn: mã · số sân · lời giải mới (1 dòng) · lời đếm cứng nào thua ở sân nào.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai/thừa/thiếu).
  3. ĐỀ XUẤT (nếu có việc cần user quyết): vấn đề → bảng phương án → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI.
