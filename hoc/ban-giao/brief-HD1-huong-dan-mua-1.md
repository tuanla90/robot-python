# Brief HD1: vá hướng dẫn mùa 1 theo "show don't tell" (khối mới phải được thấy, rồi bị ép dùng)

LOẠI: Ship (có phần dò trước)          MODEL: fable (điểm: quy mô 2, choke 1 (dữ liệu màn + bộ hướng dẫn), giá sai 1, mơ hồ 2, suy luận 1 = 7)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút: máy dò "lời giải lách" chạy được trên gói 3 là đủ cho commit đầu.
- Mỗi CHƯƠNG sửa xong là một commit (kèm máy kiểm của chương xanh). Tối đa 40 phút phải có commit.
- CẤM dựng kiểm kê toàn bộ 200 màn bằng tay trước khi sửa màn đầu tiên: máy dò làm kiểm kê, bạn sửa theo thứ tự ưu tiên.
- Hết sức thì dừng và báo còn gì: thà 3 chương làm đúng còn hơn 10 chương không commit nào.

## MỤC TIÊU
Xong khi: ở mọi chương mùa 1 giới thiệu một khối / khái niệm mới, (1) màn đầu cho THẤY khối đó chạy (bấm Chạy là thấy tác dụng, không cần sửa);
(2) màn kế tiếp ÉP dùng khối mới (lời giải lách không dùng khối đó thì THUA hoặc không đủ sao), có hướng dẫn từng bước chỉ đúng chỗ thao tác mới;
(3) sau đó mới thả tự do; và một máy kiểm chứng minh (2) cho từng chương.

## LỜI USER (29/10, nguyên văn, là QUYẾT ĐỊNH CỦA USER)
- "phần hướng dẫn các màn tôi thấy hơi lủng nhỉ? VD tôi chơi phần cảm biến nếu trống thì đi. đang cần dùng hàm for mà chưa thấy dạy lùi dòng, ko cần hàm if vẫn qua? phần hàm while tạo hàm đi đến tường cũng k thấy nói phải kéo hàm ra, ko thấy có nhiều bản đồ để bắt buộc dùng while?"
- "Mindset giới thiệu khối mới và tutorial nên là show don't tell. mấy màn đầu có thể ko cho sửa. bấm là thấy tác dụng luôn, gói 1 tôi thấy làm khá ổn, sau đó có thể làm các màn kiểu giấu bớt các hàm đi, buộc dùng hàm mới với hỗ trợ tooltip rồi mới thả"
- Luật cũ vẫn giữ (memory user 26/10): đường cong học mượt, trong chương màn 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm, mỗi màn thêm tối đa MỘT điều mới, không nhảy vọt độ dài lời giải / nhịp / cỡ sân; gói 9–10 recall các gói trước. Phanh đường cong đã có trong `hoc/kiem-lo-trinh.mjs`.

## BẰNG CHỨNG NGƯỜI GIAO ĐÃ THẤY (kiểm lại, đừng tin)
Chạy thật trong game (cổng 4181, Luu.ghiNhap + App.vaoMan + bấm Chạy):
- `khoang-cach.1` "Hỏi trước khi đi" (sân `###/#F#/#.#/#.#/#.#`): `move()` ×3, không if → THẮNG 3 sao. `for i in range(3): move()` → 3 sao.
- `khoang-cach.2` "Đi tới tường" (một hành lang 4 ô): `for i in range(4): move()`, không while → THẮNG 3 sao.
- Các màn while của chương `khoang-cach` (2, 3, 4, 8, 11, 5, 9) đều MỘT sân; chỉ trùm `khoang-cach.10` có 3 sân. Mùa 1 chỉ có 12 màn nhiều sân (danh sách: duyệt `App.dsGoi()` lọc `mua==='mua-1'`, `Array.isArray(m.san[0])`).
- Hướng dẫn từng bước (`hoc/game/huong-dan-man.js`, `H['<mã màn>']`) của gói 3 chỉ có `khoang-cach.1`, `.2`, `.10` (và `che-cam-bien.5` không thuộc lộ trình mùa 1: kiểm xem có chết không). Màn tạo hàm `khoang-cach.5` (go_wall), `che-cam-bien.1` (safe_move), `che-cam-bien.2` (face_open) KHÔNG có hướng dẫn: không chỗ nào chỉ bấm "Hàm mới" rồi ghép thân ở Xưởng.
- Thụt dòng ĐÃ được dạy (vong-lap.2 / .3 / .8 và khoang-cach.1 có bước ⇥ / ⇤), nhưng hướng dẫn tắt khi thắng màn một lần. Không phải lỗ chính, nhưng màn đầu dùng for lồng if phải nhắc lại bằng hướng dẫn.
- Gói 1 là MẪU ỔN theo user: `hai-banh.1` mã mẫu đã đúng (bấm Chạy là thắng); `xuong-ham.1` cho sẵn hàm move và khung 10 ô khiến viết tay (12 dòng) không vừa, buộc dùng hàm; `xuong-ham.2` tạo hàm có hướng dẫn `buocTaoHam`.

## CÔNG CỤ SẴN CÓ ĐỂ ÉP / KHOÁ (tự đọc code, chọn cái hợp)
- Trong dữ liệu màn (`hoc/man-*.js` / nơi định nghĩa chương): `maMau` (chương trình có sẵn), `khung.chinh` (số ô), `hamGoc` (lệnh gốc có trên khay: giấu bớt), `camHamCuaEm` (ẩn hàm của em), `hamCuaEmCan`, `taoHam`, `cauTruc` / `khung.cauTruc` (khối Logic được dùng), `khung.chanWhile`, `khung.chanBien`, sân nhiều bản (`san: [[...],[...]]`, `batDau` mảng), `sao` (ngưỡng ô / nhịp).
- Dòng khoá / chương trình chỉ đọc: tìm `chiDoc`, `baoChinhCoDinh`, `khiChiDoc`, "Dòng này bị khóa" (che-xe.1) trong `hoc/game/man-choi.js` / `thanh-phan.js` / dữ liệu màn. Nếu CHƯA có cách khoá cả chương trình cho màn trình diễn, thêm một cờ màn (vd `chiChay: true`: không kéo / sửa / xoá, chỉ Chạy) nhỏ gọn, có kiểm. Ghi rõ trong báo cáo.
- Hướng dẫn từng bước: `hoc/game/huong-dan-man.js` (các hàm dựng bước `buocTaoHam`, `buocThanHam`, `khoiTheo`, `buocThutVao`, `buocBacDong`, `buocChay`, `buocThuVeChay`, bước `dich: 'nut:...'`), phiên bản `HuongDanManPhienBan` (tăng số khi đổi hướng dẫn của màn đã có để người chơi cũ thấy lại).
- Bộ dò đường / chấm: các `tools/do-duong-*.mjs`, `hoc/kiem-*.mjs` chạy lõi trong Node: dùng lại cách nạp lõi của chúng cho máy dò lách.

## VIỆC (thứ tự)
1. **Máy dò lời giải lách** `hoc/kiem-lach-mua-1.mjs` (hoặc tên hợp hơn, có trong `tools/kiem-tat-ca.mjs` theo cách repo gom kiểm): với mỗi màn mùa 1, dựng lời giải lách:
   (a) DUỖI THẲNG: chạy lời giải chuẩn, lấy chuỗi lệnh gốc thực sự đã chạy trên từng sân, viết lại thành chương trình chỉ gồm lệnh gốc (không for / if / while / hàm); (b) DỠ ĐIỀU KIỆN: thay `while cond:` bằng `for` đếm cứng theo số lượt thật ở sân 1, thay `if cond:` bằng nội dung luôn chạy / luôn bỏ tuỳ sân 1.
   Lời giải lách THẮNG mọi sân và đạt đủ sao của màn mà màn đó lại là màn "ép" một khái niệm (xác định bằng: chương / cauTruc mới so với chương trước, taoHam, hamCuaEmCan) → báo LỖ. In bảng: màn · khái niệm cần ép · cách lách thắng · sao.
   Tự kiểm máy dò: `khoang-cach.1` và `khoang-cach.2` PHẢI bị báo lỗ trước khi sửa (đó là lỗi giả tự nhiên). Commit.
2. **Bảng hướng dẫn** (in kèm máy dò hoặc tệp `hoc/ban-giao/bang-hd1.md`): mỗi chương mùa 1, màn nào giới thiệu thao tác / khối mới (Hàm mới + ghép thân, kéo hàm vào main, for, thụt dòng, if, else, while, not, biến, tham số, nhiều sân, hai robot, bộ phận mới), màn đó có `H[...]` chưa, có màn trình diễn chưa, có màn ép chưa.
3. **Sửa gói 3 (cam-bien: chương khoang-cach, che-cam-bien) TRƯỚC** (user vừa chơi gói này): khuôn 3 bước cho if, while, tạo hàm có while / if; dùng nhiều sân để đếm cứng không qua; hướng dẫn từng bước cho màn tạo hàm đầu (bấm Hàm mới, ghép thân ở Xưởng, gọi hàm trong main) và nhắc thụt dòng ở màn for lồng if. Commit theo chương.
4. Rồi gói 2 (tay-gap: vong-lap), 4–10 theo bảng ở bước 2, ưu tiên chương giới thiệu khái niệm mới. Gói 1 chỉ soát, ít sửa.
5. Sau mỗi chương: chạy máy kiểm của chương + `node hoc/kiem-lo-trinh.mjs` (phanh đường cong) + máy dò lách; lỗ của chương phải về 0 (hoặc ghi rõ vì sao chấp nhận).

## PHẠM VI
Được sửa: dữ liệu màn và chương MÙA 1 (`hoc/man-*.js` / tệp định nghĩa chương của 10 gói mùa 1), `hoc/game/huong-dan-man.js`, cờ khoá chương trình nếu cần (`hoc/game/man-choi.js` / `thanh-phan.js`, nhỏ gọn), máy kiểm mới + sửa máy kiểm cũ của các chương đã đổi (`hoc/kiem-*.mjs`), `tools/kiem-tat-ca.mjs` nếu cần thêm bộ.
KHÔNG sửa: mùa 2 trở đi (một phiên khác đang làm nhánh `claude/mua-2-xong`), lõi chạy Python (`nhan/`), hình vẽ (`hoc/game/ve-vector*.js`, `san-ve.js` phần vẽ; agent khác vừa làm V8a), phim.
Thứ tự màn trong chương có thể đổi; giữ đúng 10 màn mỗi chương, 2 chương mỗi gói; mã màn đã có thể giữ (tiến độ người chơi lưu theo mã) — đổi mã thì phải có ánh xạ / kiểm `Luu`.

## CÁCH GIAO
Nhánh `claude/hd1-huong-dan-mua-1` trong worktree riêng (người giao dựng sẵn, ghi đường dẫn trong lời giao). Commit từng bước. KHÔNG push, KHÔNG merge, KHÔNG đụng `main`.

## PHẢN BIỆN (bắt buộc đọc)
Brief là phán đoán từ bên ngoài; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại (bằng chứng đọc sai, cách đơn giản hơn, việc thừa, lỗ bị sót).
Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Không tự đi ngược quyết định của user (mục LỜI USER, luật đường cong). Chữ hiển thị: không emoji, không gạch dài (em dash); màu đội R1 #38BDF8, R2 #F472B6; nút chỉ có icon phải có title + aria-label, vùng chạm ≥ 24 px.

## KIỂM TRA (máy yếu RAM)
- CẤM `npm test` cả bộ. Chạy từng máy kiểm liên quan, tuần tự: máy kiểm của chương đã sửa (`grep -l "<mã chương>" hoc/kiem-*.mjs`), `node hoc/kiem-lo-trinh.mjs`, máy dò lách, `node hoc/kiem-huong-dan*.mjs` nếu có (tìm máy kiểm của huong-dan-man.js).
- Mỗi máy kiểm mới phải tự chứng minh bắt được lỗi thật (cắm lỗi giả, thấy đỏ, gỡ).
- Xem bằng mắt: server cổng KHÁC 4181 (vd `PORT=4191 node server.mjs` chạy nền), chơi thử các màn đã sửa từ đầu chương (bỏ cờ đã thắng bằng localStorage của cổng đó), chụp hướng dẫn từng bước. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Phải đổi luật chạy / lõi; phải đổi mã màn đã phát hành mà không giữ được tiến độ; một chương cần quá 10 màn để giữ đường cong; phạm vi phình sang mùa 2.

## BÁO CÁO CUỐI (ghi `hoc/ban-giao/bao-cao-HD1.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, bảng lỗ trước / sau theo chương, tệp đổi, lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT cần user quyết: vấn đề, bảng phương án (mỗi cột một phương án, hàng: làm gì · mất bao lâu · ảnh hưởng · UI trước → sau · người chơi thấy khác gì · lợi · rủi ro), ưu tiên.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 – 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
