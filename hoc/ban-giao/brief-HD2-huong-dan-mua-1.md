# Brief HD2: vá tiếp hướng dẫn mùa 1 (lách là thua, che-cam-bien.10, vong-lap.1, màn trình diễn gói 4–8)

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 2 (máy chấm `hoc/cham.js` dùng chung + dữ liệu lộ trình), giá sai 1, mơ hồ 1, suy luận 1 = 7)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút: việc 2 (vong-lap.1) là việc nhỏ nhất, làm trước.
- Mỗi việc xong là một commit (kèm máy kiểm liên quan xanh). Tối đa 40 phút phải có commit.
- Hết sức thì dừng và báo còn gì: thà 2 việc làm đúng còn hơn 4 việc không commit nào.
- Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: (1) ở mọi màn ÉP của mùa 1, lời giải lách (đếm cứng thay if / while) THUA chứ không còn qua màn với 1–2 sao;
(2) che-cam-bien.10 hết là lỗ chấp nhận; (3) vong-lap.1 là màn trình diễn `for`; (4) gói 4–8 mỗi gói có màn trình diễn
(`chiChay`) cho khối / lệnh / cơ chế mới ở đầu gói, đúng khuôn trình diễn → ép → thả.

## BỐI CẢNH
Đọc trước: `hoc/ban-giao/bao-cao-HD1.md` (đợt trước, cùng mục tiêu, agent khác làm, đã gộp 45af133) và `hoc/ban-giao/bang-hd1.md`.
Lời user 29/10 (QUYẾT ĐỊNH CỦA USER, nguyên văn): "Mindset giới thiệu khối mới và tutorial nên là show don't tell. mấy màn đầu có thể ko cho sửa. bấm là thấy tác dụng luôn, gói 1 tôi thấy làm khá ổn, sau đó có thể làm các màn kiểu giấu bớt các hàm đi, buộc dùng hàm mới với hỗ trợ tooltip rồi mới thả".
User đã chọn "Giao HD2 đủ" cho bốn đề xuất người giao đưa ra từ báo cáo HD1:
- che-cam-bien.10 hai kho dài ngắn khác nhau (phương án 3b-B của HD1);
- vong-lap.1 thành màn trình diễn `for` (3c);
- `chiChay` cho màn đầu gói 4–8 (3d);
- ở các màn ép, húc tường thì THUA (mới, xem việc 1).
KHÔNG làm 3a (màn trình diễn "hàm có if" ở che-cam-bien): người giao và agent HD1 cùng khuyên giữ nguyên.

Gói mùa 1 (mỗi gói 2 chương × 10 màn): 1 hai-banh / xuong-ham · 2 tay-gap / vong-lap · 3 khoang-cach / che-cam-bien · 4 nut-de / kho-hang ·
5 banh-lui / che-banh-lui · 6 tay-xoay / che-tay-xoay · 7 cam-bien-ben / me-cung · 8 hai-robot / che-hai-robot · 9 combo / che-combo · 10 robot-hoan-thien / trum-mua-1.
(Kiểm lại bằng `hoc/lo-trinh-hoc.js`, đừng tin bảng này.)

## VIỆC (thứ tự làm: 2 → 3 → 1 → 4)

### Việc 1. Húc tường là thua ở màn ép
Luật hiện tại: đâm tường chỉ mất nhịp (sự kiện lõi `dam-tuong`, chẩn đoán `dam-tuong` trong `hoc/cham.js` ~dòng 555–603), nên ở màn hai sân, `move()` ×4 vẫn thắng 1 sao (kc.12), `for` vẫn 2 sao (kc.13).
- Thêm một cờ màn (gợi ý tên `damLaThua: true`; chọn tên hợp với repo) khiến một sân có `dam-tuong` (mọi loại vật: tường, mép sân, cửa, thùng, vật) là sân đó KHÔNG thắng → cả màn không thắng.
- Hình phải nói thật điều xảy ra (show don't tell): khi chạy, robot ĐỪNG lại ở cú đâm (không chạy tiếp các nhịp sau như thể không sao), sân báo thua, và lời chẩn đoán nói rõ "màn này đâm tường là thua" kèm dòng gây ra. Cách gợi ý: tiền lệ "vật vỡ thì chương trình dừng ngay cuối nhịp đó" (cham.js đầu tệp, san-hoc.js). Nếu dừng sớm buộc phải sửa `hoc/san-hoc.js`, chỉ thêm một tuỳ chọn cfg mặc định tắt (giống `xichDay`, `beSung`), không đổi hành vi khi không khai.
- Người chơi phải BIẾT luật trước khi chạy: một dấu hiệu nhỏ trên màn (nhãn cạnh tên màn, hoặc dòng trong đề bài, hoặc bong bóng hướng dẫn bước đầu): tự chọn cách gọn nhất có sẵn trong `hoc/game/man-choi.js` / `huong-dan-man.js`; chuỗi qua `hoc/game/chu.js`.
- Gắn cờ cho đúng các màn ÉP mà máy dò `hoc/kiem-lach-mua-1.mjs` định nghĩa (khái niệm cấu trúc mới, màn ≤ 4 của chương; thân hàm phải dùng lại được; taoHam), CHỈ khi lời giải chuẩn của màn không đâm tường lần nào trên mọi sân. Màn mà lời giải chuẩn có đâm: không gắn, ghi vào báo cáo.
- Máy dò lách: đổi tiêu chí lỗ cho màn có cờ: lách phải THUA (không chỉ thiếu sao). In bảng trước / sau: màn · lách · kết quả cũ (sao) · kết quả mới.
- Kiểm `hoc/cham.js`: thêm ca vào máy kiểm của cham (tìm `grep -l "dam-tuong" hoc/kiem-*.mjs`), có ca cờ tắt (hành vi cũ y nguyên) và cờ bật; cắm lỗi giả cho đỏ rồi gỡ.
- Luật chơi lõi đổi chỉ cho màn có cờ. Màn mùa 2 trở đi KHÔNG gắn cờ (phiên khác làm mùa 2, đã được báo; họ tự quyết sau).

### Việc 2. vong-lap.1 thành màn trình diễn `for`
Theo đề xuất 3c của HD1: `chiChay: true, chinhCoDinh: true`, mã mẫu dùng `for` thắng ngay khi bấm Chạy (gợi ý `range(6)`); việc "đổi số" dời sang vong-lap.2 cùng bước tự chèn for (hướng dẫn đã có bước đổi số: kiểm lại). Mẫu: cách HD1 làm kc.1 / kc.2 trong `hoc/lo-trinh-hoc.js` (khối HD1 ~dòng 314) và `huong-dan-man.js`; tăng `HuongDanManPhienBan` của màn có hướng dẫn đổi.

### Việc 3. che-cam-bien.10 "Kho hàng" (gói 9): hai kho dài ngắn khác nhau
Theo 3b-B của HD1: thêm sân thứ hai để `fetch_back` (hoặc hàm của màn) viết đếm cứng không thắng cả hai; đo lại sao (`node tools/do-lo-trinh.mjs --ghi-sao`); gỡ khỏi danh sách CHAP_NHAN của máy dò; giữ phanh đường cong của `kiem-combo-mua-1.mjs` xanh.

### Việc 4. Màn trình diễn cho gói 4–8
Với mỗi gói 4, 5, 6, 7, 8: xác định cái MỚI của gói (bảng `bang-hd1.md` cột "mới" + đọc dữ liệu màn: nút đè / thùng giữ cửa, bánh lùi, tay xoay, cảm biến bên `right_clear` / `left_clear`, hai robot). Màn giới thiệu nó trở thành (hoặc được thêm) một màn `chiChay`: bấm Chạy là thấy cái mới làm gì, có bong bóng ngắn chỉ nút Chạy và điều cần nhìn.
- Ưu tiên biến màn đầu sẵn có thành chiChay nếu mã mẫu của nó đã gần đúng; nếu không, chọn cách giữ đủ 10 màn / chương (cất một màn trùng ý như HD1 cất kc.4, giữ mã trong ngân hàng để sao đã lưu không mất).
- Màn kế tiếp phải ép dùng cái mới (máy dò lách hoặc lý lẽ: lệnh mới là cách duy nhất). Cơ chế không phải lệnh (nút đè) thì màn trình diễn cho thấy cơ chế; ghi rõ cách bạn hiểu "cái mới" của gói đó.
- Gói 8 hai robot: màn chấm `chamDoi` khác dạng; kiểm `chiChay` có chạy đúng với màn đội không (cham.js `ganCoDinh`, man-choi.js), không chạy được thì báo, đừng ép.
- Cập nhật bảng (`node hoc/kiem-lach-mua-1.mjs --bang` sinh lại `bang-hd1.md`).

## PHẠM VI
Được sửa: dữ liệu màn và lộ trình MÙA 1 (`hoc/lo-trinh-hoc.js`, `hoc/lo-trinh-sao.js`, `hoc/man-*.js` của mùa 1), `hoc/cham.js` (cờ việc 1, nhỏ, cộng thêm), `hoc/san-hoc.js` (chỉ tuỳ chọn cfg mặc định tắt nếu bắt buộc), `hoc/game/man-choi.js` / `hoc/game/chu.js` / `hoc/game/huong-dan-man.js` (nhãn, chuỗi, hướng dẫn), máy kiểm `hoc/kiem-*.mjs` và `tools/do-lo-trinh.mjs` nếu cần.
KHÔNG sửa: mùa 2 trở đi (nhánh `claude/mua-2-xong` của phiên khác đang sửa cùng các tệp cham.js, lo-trinh, man-choi.js: giữ diff gọn, chỉ thêm dòng cần thiết, CẤM định dạng lại tệp), lõi Python `nhan/`, hình vẽ (`ve-vector*.js`, phần vẽ `san-ve.js`), phim.
Giữ: 10 màn / chương, mã màn đã phát hành (tiến độ lưu theo mã), sao đã lưu.

## CÁCH GIAO
Worktree riêng đã dựng: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\hd2-huong-dan-mua-1`, nhánh `claude/hd2-huong-dan-mua-1` (từ 3fdcc42 + commit brief này).
Làm mọi lệnh trong worktree đó. Commit từng bước. KHÔNG push, KHÔNG merge, KHÔNG đụng `main`. Bạn là agent duy nhất lúc này.

## PHẢN BIỆN (bắt buộc đọc)
Brief là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Kiểm lại từng khẳng định trong brief bằng code, đừng tin.
Được phép và được khuyến khích nói ngược lại (bằng chứng đọc sai, cách đơn giản hơn, việc thừa, lỗ bị sót).
Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Quyết định của USER (không tự đi ngược): lời user ở BỐI CẢNH, bốn việc đã chọn, luật đường cong (trong chương màn 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm, mỗi màn thêm tối đa MỘT điều mới, không nhảy vọt độ dài lời giải / nhịp / cỡ sân; gói 9–10 recall), đồ hoạ vector, màu đội R1 #38BDF8 / R2 #F472B6, chữ hiển thị không emoji, không gạch dài (em dash). Nút chỉ có icon phải có title + aria-label, vùng chạm ≥ 24 px.

## KIỂM TRA (máy yếu RAM)
- CẤM `npm test` cả bộ (người giao chạy sau khi gộp). Chạy từng máy kiểm liên quan, tuần tự:
  `node hoc/kiem-lach-mua-1.mjs` (và `--loi-gia`), `node hoc/kiem-lo-trinh.mjs`, `node hoc/kiem-huong-dan.mjs`, `node hoc/kiem-cam-bien-them.mjs`,
  `node hoc/kiem-che-cam-bien.mjs`, `node hoc/kiem-combo-mua-1.mjs`, máy kiểm của cham (`grep -l "dam-tuong\|chinhCoDinh" hoc/kiem-*.mjs`),
  máy kiểm của từng chương đã đổi (`grep -l "<mã chương>" hoc/kiem-*.mjs`), `node tools/do-lo-trinh.mjs --ghi-sao` khi đổi màn.
- Mỗi máy kiểm mới / tiêu chí mới phải tự chứng minh bắt được lỗi thật (cắm lỗi giả, thấy đỏ, gỡ).
- Xem bằng mắt: server cổng KHÁC 4181 (4181 của người giao), vd `PORT=4192 node server.mjs` chạy nền; localStorage trống; chơi kc.12 bằng `move()` ×4 (phải thấy xe dừng ở cú đâm và thua, có lời nói luật), vong-lap.1, che-cam-bien.10, và màn trình diễn của từng gói 4–8. Lệnh trong trang: `GoLoi.datMoHet(true)`, `App.vaoMan('<mã>')`. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Cờ "đâm là thua" làm đổi kết quả của màn mùa 2 hoặc màn không gắn cờ; phải đổi mã màn đã phát hành mà không giữ được tiến độ; một chương cần quá 10 màn; lời giải chuẩn của nhiều màn ép có đâm tường (luật không hợp với thiết kế cũ).

## BÁO CÁO CUỐI (ghi `hoc/ban-giao/bao-cao-HD2.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, danh sách màn gắn cờ đâm-là-thua, bảng lách trước / sau, màn trình diễn mới của từng gói, lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT cần user quyết: vấn đề (cơ chế thật, file:dòng), bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · UI trước → sau · người chơi thấy khác gì · lợi · rủi ro), ưu tiên và nghiêng về đâu.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 – 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
