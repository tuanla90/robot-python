# Brief HD3: màn trình diễn cho gói 5 (bánh lùi) và gói 8 (hai robot)

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (máy chấm `hoc/cham.js` dùng chung), giá sai 1, mơ hồ 1, suy luận 1 = 5)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút. Tối đa 40 phút phải có commit. Mỗi việc xong là một commit kèm máy kiểm liên quan xanh.
- Hết sức thì dừng và báo còn gì: thà một việc làm đúng còn hơn hai việc không commit nào.
- Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: gói 5 và gói 8 của mùa 1 mỗi gói có một màn trình diễn `chiChay` cho cái mới của gói (bấm Chạy là thấy, không sửa được),
màn kế tiếp người chơi tự làm, đúng khuôn trình diễn → ép → thả như các gói khác đã làm ở HD1 / HD2; mọi máy kiểm liên quan xanh.

## BỐI CẢNH
Đọc trước: `hoc/ban-giao/bao-cao-HD2.md` mục 3a và 3b (agent HD2 đã đọc code và đề xuất; user chọn phương án A cho cả hai, 29/10: "Làm cả hai").
Mẫu đã làm: `hoc/lo-trinh-hoc.js` khối HD1 / HD2 (kc.1, vong-lap.1, nut-de.1, tay-xoay.1, cam-bien-ben.1 có `chiChay: true, chinhCoDinh: true`), `hoc/game/huong-dan-man.js`, `hoc/kiem-lach-mua-1.mjs` (`--bang` sinh `hoc/ban-giao/bang-hd1.md`).
Lời user (QUYẾT ĐỊNH CỦA USER, nguyên văn): "Mindset giới thiệu khối mới và tutorial nên là show don't tell. mấy màn đầu có thể ko cho sửa. bấm là thấy tác dụng luôn ... sau đó có thể làm các màn kiểu giấu bớt các hàm đi, buộc dùng hàm mới với hỗ trợ tooltip rồi mới thả".
Giữ luật cờ `damLaThua` (đâm tường là thua) như HD2 đặt; màn trình diễn không cần cờ.

## VIỆC
### Việc 1. Gói 5 bánh lùi (3a phương án A)
Chương banh-lui: màn 1 `che-xe.4` là màn CHẾ `back()` (taoHam), các màn sau dùng `back()`, nên không khoá được. Thêm một màn trình diễn MỚI đặt TRƯỚC che-xe.4:
main khoá, chỉ dùng lệnh gốc `left_back()` / `right_back()` / `wait()`, bấm Chạy thấy xe lùi tới xe mờ (bong-mo), có bong bóng ngắn chỉ nút Chạy và nói "xe lùi".
Giữ 10 màn / chương: cất một màn trùng ý (HD2 gợi ý che-xe.8 hoặc banh-lui.2: đọc cả hai, chọn màn ít mất nhất cho đường cong, nói lý do), giữ mã trong ngân hàng để sao đã lưu không mất (như HD1 cất kc.4).
Mã màn mới đặt theo cách repo đặt (gợi ý trong `hoc/man-banh-lui-them.js`); đo sao (`node tools/do-lo-trinh.mjs --ghi-sao`); cập nhật THU_TU / đường cong của `hoc/kiem-banh-lui-them.mjs`.

### Việc 2. Gói 8 hai robot (3b phương án A)
- `hoc/cham.js` `ganCoDinh` (~dòng 1144) chỉ thay `baiLam.chinh` bằng `maMau.chinh`; màn đội chấm theo `maMau.doi[i]`. Mở rộng: màn `chiChay` có `maMau.doi` thì máy chấm cũng dùng `maMau.doi[i]` thay bài gửi lên (cộng thêm vài dòng, không đổi hành vi màn khác). Kiểm giao diện `hoc/game/man-choi.js` khoá đủ mọi robot (khay R1 / R2) khi chiChay, nhãn "Chỉ chạy" hiện.
- `hai-robot.1` thành chiChay (R2 có sẵn chương trình, ví dụ go_wall như HD2 gợi ý; bấm Chạy thấy hai robot chạy cùng lúc); bước "chạm R2" trong hướng dẫn dời sang `hai-robot.2`; tăng `HuongDanManPhienBan` cho màn đổi hướng dẫn.
- Thêm ca vào máy kiểm (`hoc/kiem-hai-robot-man.mjs` hoặc máy kiểm cham phù hợp): bài gửi lên khác mã mẫu ở màn đội chiChay vẫn bị thay bằng mã mẫu; màn đội không chiChay giữ y nguyên. Cắm lỗi giả cho đỏ rồi gỡ.
- Máy dò lách bỏ qua màn hai robot (HD1 ghi): giữ nguyên, chỉ ghi vào báo cáo.

Cuối cùng: `node hoc/kiem-lach-mua-1.mjs --bang` sinh lại bảng.

## PHẠM VI
Được sửa: dữ liệu và lộ trình MÙA 1 (`hoc/lo-trinh-hoc.js` khối mùa 1, `hoc/lo-trinh-sao.js`, `hoc/man-*.js` của gói 5 và 8), `hoc/cham.js` (chỉ ganCoDinh, cộng thêm), `hoc/game/man-choi.js` (nếu khoá đội thiếu), `hoc/game/huong-dan-man.js`, `hoc/game/chu.js`, máy kiểm `hoc/kiem-*.mjs`, `tools/do-lo-trinh.mjs` nếu cần.
KHÔNG sửa: khối MÙA 2 / MÙA 3 trong lo-trinh-hoc.js (phiên khác đang làm mùa 3: chỉ thêm dòng cần thiết, CẤM định dạng lại tệp), lõi Python `nhan/`, `hoc/san-hoc.js`, hình vẽ, phim.
Giữ: 10 màn / chương, mã màn đã phát hành, sao đã lưu.

## CÁCH GIAO
Worktree riêng đã dựng: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\hd3-trinh-dien-goi-5-8`, nhánh `claude/hd3-trinh-dien-goi-5-8` (từ main f6d514c + commit brief này).
Làm mọi lệnh trong worktree đó. Commit từng bước. KHÔNG push, KHÔNG merge, KHÔNG đụng `main`. Bạn là agent duy nhất lúc này.

## PHẢN BIỆN (bắt buộc đọc)
Brief là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Kiểm lại từng khẳng định trong brief bằng code, đừng tin.
Được phép và được khuyến khích nói ngược lại (bằng chứng đọc sai, cách đơn giản hơn, việc thừa, lỗ bị sót).
Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Quyết định của USER (không tự đi ngược): lời user ở BỐI CẢNH, phương án A cho cả hai việc, luật đường cong (trong chương màn 1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm, mỗi màn thêm tối đa MỘT điều mới, không nhảy vọt độ dài lời giải / nhịp / cỡ sân), đồ hoạ vector, màu đội R1 #38BDF8 / R2 #F472B6, chữ hiển thị không emoji, không gạch dài (em dash). Nút chỉ có icon phải có title + aria-label, vùng chạm ≥ 24 px.

## KIỂM TRA (máy yếu RAM)
- CẤM `npm test` cả bộ (người giao chạy sau khi gộp). Chạy từng máy kiểm liên quan, tuần tự:
  `node hoc/kiem-lach-mua-1.mjs`, `node hoc/kiem-lo-trinh.mjs`, `node hoc/kiem-huong-dan.mjs`, `node hoc/kiem-banh-lui-them.mjs`, `node hoc/kiem-che-xe.mjs`,
  `node hoc/kiem-hai-robot-man.mjs`, `node hoc/kiem-doi-mua-1.mjs`, `node hoc/kiem-hoc.mjs`, máy kiểm khác có tên chương đã đổi (`grep -l "banh-lui\|che-xe\|hai-robot" hoc/kiem-*.mjs`), `node tools/do-lo-trinh.mjs --ghi-sao` khi đổi màn.
- Mỗi ca kiểm mới phải tự chứng minh bắt được lỗi thật (cắm lỗi giả, thấy đỏ, gỡ).
- Xem bằng mắt: server cổng KHÁC 4181, vd `PORT=4193 node server.mjs` chạy nền; localStorage trống; `GoLoi.datMoHet(true)`, `App.vaoMan('<mã>')`; bấm Chạy ở hai màn trình diễn (phải thắng, không sửa được khay nào) và xem màn kế tiếp; xem ở khổ 360 × 640. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Phải đổi mã màn đã phát hành mà không giữ được tiến độ; một chương cần quá 10 màn; sửa ganCoDinh làm đổi kết quả màn không chiChay.

## BÁO CÁO CUỐI (ghi `hoc/ban-giao/bao-cao-HD3.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, màn mới / màn cất, lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT cần user quyết: vấn đề (cơ chế thật, file:dòng), bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · UI trước → sau · người chơi thấy khác gì · lợi · rủi ro), ưu tiên và nghiêng về đâu.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 – 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
