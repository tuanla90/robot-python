# Brief PDM3a: mùa 3 gói 2–4 trên robot phân loại (nhện + nam châm bụng + cảm biến từ)

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; mỗi chương (10 màn) ít nhất 2 commit; tối đa 40 phút phải có commit. CẤM khảo sát toàn bộ rồi mới sửa.
Thứ tự gói 2 → 3 → 4. Hết sức thì dừng và báo còn gì: thà 2 gói đúng còn hơn 3 gói không commit.**

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 2, suy luận 2 = 8)

MỤC TIÊU: xong khi mọi màn gói 2–4 mùa 3 có R1 = nhện (+ nam châm bụng từ gói 2, + cảm biến từ từ gói 3), `node hoc/kiem-part-mua.mjs --chi-tiet` không còn dòng
mùa 3 nào của gói 1–4, lời giải 3 sao, sao đo lại, đường cong mượt, mọi máy kiểm liên quan ĐẠT.

BỐI CẢNH:
- `hoc/KE-HOACH-PART-DUNG-MUA.md` mục 1 và 4 (user chốt 31/10). Mùa 3 Bãi tái chế, cỗ máy Robot phân loại phế liệu R1 (dáng cua: chân nhện + nam châm).
  R1 KHÔNG được mang thân hai bánh / xích, tay kẹp, cảm biến khoảng cách. Hiện gói 2, 3, 4 (60 màn) chạy xe hai bánh + nam châm mũi + cảm biến khoảng cách (+ từ).
- Mùa 1, mùa 2 đã làm theo cùng luật (git log từ 73b5b91; sổ `hoc/ban-giao/can-trao-doi-part-dung-mua.md`): học cách đổi thân, đo sao sửa tay trong hoc/lo-trinh-sao.js
  (KHÔNG `tools/do-lo-trinh.mjs --ghi-sao`), cấp hàm cũ cho màn ẩn (mùa sau) khi hàm của em bị đổi / bỏ.
- LUẬT LÕI (đầu `hoc/san-hoc.js`, phần CHÂN NHỆN, NAM CHÂM, mục "NAM CHÂM BỤNG NHỆN", ĐỆM TỪ):
  · Nhện: go_up / go_down / go_left / go_right, mỗi bước 2 nhịp; KHÔNG có hướng mặt (đi 4 hướng tuyệt đối); wait() 1 nhịp.
  · Nam châm bụng (gói 2): magnet_n / magnet_off (magnet_s mở ở gói 6 Đảo cực): hút / thả ở Ô NGAY DƯỚI nhện; nhện có nam châm đứng trùm lên vật được; vật dính đi theo.
    Lệnh nam châm làm ở nhịp wait() hay nhịp đầu của bước kế tiếp.
  · Cảm biến từ trên nhện (lõi mới 31/10, commit 817f81d): khai `robot.camBien [{ ma: 'tu', o: 'hong' }]` + hamGoc front_metal (front_pole mở ở gói 7);
    đo theo CẠNH TRƯỚC CỐ ĐỊNH = hướng xuất phát `batDau.huong` (3 ô, vật đầu tiên; front_metal True nếu là sắt cách ≤ 2 ô). Thiết kế sân cho hướng đó có ý nghĩa
    (vd nhện quay phải, dãy vật bên phải; đi xuống từng hàng rồi đo).
  · Đệm từ (gói 4): nhện có nam châm bụng bật thì bị đệm hút / đẩy theo cực như xe; đang nhảy thì miễn (nhảy là gói 5, chưa có ở gói 4).
- Python mùa 3: gói 1 chuỗi, gói 2 chương 2 dạy and / or / elif. Gói 2 CHƯA có cảm biến: điều kiện của chương logic lấy từ CHUỖI DỮ LIỆU trong mã (vd duyệt
  `for c in "SGSN":` rồi `if c == "S" or c == "N":` hút, `elif c == "G":` bỏ qua) hay từ biến; không dùng front_clear. Ràng buộc mùa 3 ở kiem-lo-trinh.mjs mục mùa 3:
  sửa phần "thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ" cho đúng luật mới (R1 chỉ part mùa 3) — đừng xoá phanh, siết lại.
- Gói 9 cũ "Nam châm bụng nhện" (bung-nhen, che-bung-nhen) có sẵn nhiều màn nhện + nam châm bụng: DÙNG LẠI ý / sân làm nguồn cho gói 2 khi hợp (gói 9 sẽ thành đội ở PDM3c;
  màn bung-nhen dời đi thì giữ mã, mã chỉ đổi chương qua lộ trình).
- Lời mùa 3 (Bãi tái chế, giọng Sola / Luna: "Giúp Sola…", "Luna: …", sắt vụn, "bạn") đổi Ở LỘ TRÌNH (lo-trinh-hoc.js chuBaiTaiChe / loiBaiTaiChe) chồng lên ngân hàng:
  màn mới viết thẳng giọng này; nhớ hàm đó còn chạy chồng.
- Luật học: đường cong mượt (màn 1–3 làm quen, 4–6 luyện, 7–9 biến thể, 10 trùm; mỗi màn tối đa một điều mới); màn đầu của khối mới là TRÌNH DIỄN (chiChay, khoá),
  màn sau ÉP (bộ dò / loiSai chứng minh). Máy kiểm mùa 3: kiem-man-mua-3, kiem-lach-mua-3, kiem-dem-tu, kiem-cam-bien-tu, kiem-nam-cham, kiem-bung-nhen, kiem-lo-trinh (h) (i).

PHẠM VI: màn và lộ trình mùa 3 gói 2–4 (tệp ngân hàng mùa 3: man-nam-cham-n.js, man-cam-ung-tu.js, man-bai-tu.js, man-bung-nhen.js, khối MÙA 3 của lo-trinh-hoc.js),
lo-trinh-sao.js (đúng mục), máy kiểm mùa 3. KHÔNG sửa lõi san-hoc.js / cham.js / nhan/ (cần thì DỪNG, báo), không sửa mùa 1, 2, 4.

PHẢN BIỆN, CÁCH GIAO, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: y như brief PDM2a (`hoc/ban-giao/brief-PDM2a-mua-2-goi-1-4.md`): làm thẳng trên nhánh claude/part-dung-mua,
không npm test cả bộ, máy kiểm chạy lần lượt; hàm của em mới không trùng tên bất kỳ hàm của em / hàm của màn đã có (kiem-goi-doi, kiem-man-mua-4 bắt).
