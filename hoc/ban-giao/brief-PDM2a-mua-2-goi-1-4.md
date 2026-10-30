# Brief PDM2a: mùa 2 gói 1–4 trên xe cứu hỏa (xích + vòi phun + hồng ngoại)

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi chương (10 màn) ít nhất 2 commit; tối đa 40 phút phải có commit. CẤM khảo sát toàn bộ rồi mới sửa.
Làm theo thứ tự gói 1 → 2 → 3 → 4. Hết sức thì dừng và báo còn gì: thà 2 gói đúng còn hơn 4 gói không commit.**

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 1, suy luận 1 = 6)

MỤC TIÊU: xong khi mọi màn của gói 1–4 mùa 2 có R1 đúng luật part mùa 2 (`node hoc/kiem-part-mua.mjs --chi-tiet` không còn dòng mùa 2 nào của gói 1–4),
lời giải thắng 3 sao, ngưỡng sao đo lại, đường cong trong chương mượt, và mọi máy kiểm liên quan ĐẠT.

BỐI CẢNH:
- User chốt 31/10: `hoc/KE-HOACH-PART-DUNG-MUA.md` (đọc mục 1 và 3). Mùa 2 Nhà máy, cỗ máy = Xe cứu hỏa R1: thân XÍCH, tay VÒI PHUN (spray / spray_back),
  cảm biến HỒNG NGOẠI (distance(); warm() là nâng cấp gói 7). R1 KHÔNG được mang tay kẹp, tay xoay, cảm biến khoảng cách (front_clear / left_clear / right_clear) hay thân hai bánh.
  Gói 1: chỉ xích. Gói 2: xích + vòi. Gói 3–4: xích + vòi + hồng ngoại (được bớt part chưa cần).
- Hiện trạng (`node hoc/kiem-part-mua.mjs --chi-tiet`, mục mua-2): xich.7, xich.10 có kẹp; bien-xich có 4 màn hai bánh (che-cam-bien.5, .6, .9, robot-hoan-thien.9) và
  cảm biến khoảng cách; sung-hoi, tham-so, hong-ngoai, che-hong-ngoai, bang-chuyen, che-sung-hoi chạy xe hai bánh (một số có kẹp).
- Luật lõi có sẵn (đầu `hoc/san-hoc.js`): xích dùng đúng lệnh bánh của xe hai bánh nhưng QUAY CHẬM (2 nhịp liên tiếp cùng tổ hợp mới quay 90°), nên hàm quay của
  xích là `tr_right` / `tr_left` (hàm của em, tạo ở chương xich), KHÔNG phải turn_right / turn_left (hàm hai bánh 1 nhịp). Xích gắn vòi: không khai cfg.beSung thì
  phun mạnh vẫn giật như xe khác. **BĂNG CHUYỀN KHÔNG ĐẨY ĐƯỢC XÍCH** (bám chắc), chỉ đẩy thùng nặng / vật. Hồng ngoại: distance() đếm ô tới vật cản đầu tiên.
- Gói 4 "Nhà máy" chương 1 bang-chuyen hiện là "Trôi theo băng" (xe hai bánh bị băng đẩy). Trên xích ý đó mất: dựng lại chương thành **băng chở thùng / xích bám
  chắc đi ngang băng / van bật tắt băng** (tên chương đổi theo quy tắc: tên chương = việc em làm, không trùng tên gói). Có thể dùng lại sân cũ khi hợp.
- Python mùa 2: gói 1 chương 2 dạy BIẾN (đếm), gói 2 chương 2 dạy HÀM CÓ THAM SỐ (tham-so); gói 1–2 chưa có cảm biến nên bài không dựa if / while cảm biến.
  Ràng buộc mùa 2 ở `hoc/kiem-lo-trinh.mjs` mục MÙA 2 (biến chỉ từ gói 1 chương 2, tham số chỉ từ gói 2 chương 2, hàm của em phải tạo ở màn trước).
- Luật học (memory user): đường cong mượt (màn 1–3 làm quen, 4–6 luyện, 7–9 biến thể, 10 trùm; mỗi màn thêm tối đa một điều mới; không nhảy độ dài lời giải /
  nhịp / cỡ sân); màn đầu của khối mới là màn TRÌNH DIỄN (chiChay, chương trình khoá, bấm Chạy là thắng), màn sau ÉP dùng khối mới (bộ dò / loiSai chứng minh).
- Lời mùa 2: giọng hiện có của chương (phun, van; không chữ vũ khí: không "bắn", "súng"). Kiểm chữ: `hoc/kiem-loi-mua-2.mjs`.
- Màn ở các tệp ngân hàng (`hoc/man-<chương>.js`, `hoc/man-che-*.js`, tệp mùa 2 TEP_MUA_2) và khối MÙA 2 của `hoc/lo-trinh-hoc.js` (dòng ~643–870: MUA_2, THU_TU_*, sua()).
  Màn ngân hàng còn dùng ở mùa khác / ẩn thì KHÔNG sửa ngân hàng: sửa ở lộ trình (sua(ma, {...}) như các màn mùa 2 khác) hay viết màn mới mã mới trong tệp mùa 2.

CÁCH LÀM:
1. Mỗi màn: đổi R1 sang xích (+ vòi / hồng ngoại theo gói), bỏ kẹp và cảm biến khoảng cách; giữ ý bài nếu còn hợp, không thì viết màn mới cùng vị trí trong đường cong.
   Lời giải dùng tr_right / tr_left; nhịp đổi nên ĐO LẠI sao.o / sao.nhip (phienBanNoiDung 2 thì kiem-lo-trinh so khớp từng số).
2. Màn nào lấy hàm của em hai bánh (turn_right, pick, drop, go_wall…) thì thay bằng hàm xích tương ứng đã có (tr_right, tr_left, spin, sidestep, forward(n)…) hay
   cho tạo hàm mới ở màn đứng trước (taoHam). Không để hàm cần (hamCuaEmCan) chưa được học.
3. Màn dính gói đội / mùa ẩn: không đụng.
4. Cập nhật máy kiểm trông đợi cấu hình cũ (kiem-sung-hoi, kiem-tham-so, kiem-hong-ngoai, kiem-bang-chuyen, kiem-che-sung-hoi, kiem-bien-xich, kiem-xich, kiem-lach-mua-2,
   kiem-lo-trinh mục mùa 2…): sửa trông đợi theo luật mới, KHÔNG xoá phanh (lỗi giả của --loi-gia-mua-2 phải vẫn đỏ đủ).

PHẢN BIỆN: brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn người giao. Được và nên nói ngược brief. Bất đồng chặn đường → dừng,
commit WIP, báo ngay. Bất đồng không chặn → làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ. Quyết định của USER (không tự đi ngược): R1 chỉ part mùa 2; tự lắp tuỳ ý để mùa 7.
Kiểm lại từng khẳng định trong brief bằng code, đừng tin.

CÁCH GIAO: nhánh `claude/pdm-2a` trong worktree `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\pdm-2a` (đã dựng sẵn); commit từng bước; KHÔNG push, KHÔNG merge.
Mọi lệnh chạy với cwd = worktree đó.

KIỂM TRA (sau mỗi nhóm commit; CẤM `npm test` cả bộ vì RAM; người giao chạy cả bộ):
  node hoc/kiem-lo-trinh.mjs   (ghi ra tệp trong scratchpad của bạn rồi đọc; dòng cuối "ĐẠT … kiểm tra lộ trình xuất bản.")
  node hoc/kiem-lo-trinh.mjs --loi-gia-mua-2   (phải ĐỎ đủ các mục như trước khi sửa)
  node hoc/kiem-part-mua.mjs --chi-tiet
  node hoc/kiem-lach-mua-2.mjs ; node hoc/kiem-loi-mua-2.mjs
  và máy kiểm riêng của chương vừa sửa: kiem-xich, kiem-bien-xich, kiem-che-xich, kiem-sung-hoi, kiem-tham-so, kiem-hong-ngoai, kiem-bang-chuyen, kiem-che-sung-hoi.
  Lọc: npm test -- <chuỗi trong tên tệp> (chỉ các tệp khớp; được phép).
Nền: tại commit giao việc, mọi bộ ĐẠT (kiem-part-mua ở chế độ theo dõi, mùa 2 chưa chặt).

DỪNG VÀ HỎI KHI: phải sửa lõi san-hoc.js / cham.js / nhan/; phải đổi hay xoá mã màn đã xuất bản; một chương không thể giữ đủ 10 màn.

BÁO CÁO CUỐI — 5 mục, mục trống ghi "không có":
  1. KẾT QUẢ: SHA từng commit, tệp đổi, lệnh kiểm + dòng kết quả nguyên văn, việc dở. Bảng mỗi chương: mã màn · đổi gì (giữ ý / màn mới) · số dòng lời giải · nhịp.
  2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu).
  3. ĐỀ XUẤT (việc cần user quyết): vấn đề → bảng phương án → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI.
