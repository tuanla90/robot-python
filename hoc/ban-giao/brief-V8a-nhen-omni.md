# Brief V8a: thân nhện đẹp hơn + dáng bò thật, thân omni / nhện cùng độ bo với thân gốc

LOẠI: Ship          MODEL: opus (điểm: quy mô 1, choke 1 (đường vẽ robot chung VeVector / san-ve), giá sai 1, mơ hồ 1, suy luận 1 = 5)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút (việc 1 nhỏ nhất làm trước). Tối đa 40 phút phải có một commit.
- Hết sức thì dừng và báo còn gì: thà 2 việc làm đúng còn hơn 3 việc không commit nào.
- Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào mục CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi: (1) thân omni và thân nhện có độ bo góc cùng họ với thân gốc hai bánh (khối vuông bo, không tròn vo);
(2) chân nhện trông chắc, đẹp, ra dáng chân robot nhện; (3) khi nhện đi một ô, người xem thấy rõ nó đang BÒ
(chân nhấc, đặt luân phiên, thân nhún nhẹ), không phải hai khung giật qua lại.

## BỐI CẢNH (lời user 29/10, nguyên văn)
"thân nhện hơi xấu, đặc biệt animation di chuyển không ổn lắm. ko tạo cảm giác đang bò? thân của omni với nhện hình như cũng hơi tròn hơn thân gốc nhỉ?"

Người giao đã đo (kiểm lại, đừng tin):
- Thân gốc `hoc/game/ve-vector-than-hai-banh.js:25` vỏ `H.bo(g, 20, 23, 60, 58, 20)`: bán kính bo / cạnh ngắn ≈ 0,34.
- Omni `ve-vector-than-omni.js:19` `H.bo(g, 23, 24, 54, 59, 22)` ≈ 0,41. Nhện `ve-vector-than-nhen.js:38` `H.bo(g, 25, 29, 50, 52, 23)` ≈ 0,46 (gần tròn); dáng co chân dòng 26.
- Dáng bước hiện tại: `s.buoc` chỉ 0 / 1 (`ve-robot.js:95` `buoc: chay && tt.ph ? 1 : 0`), nhện chỉ dời cặp chân sau 5 đơn vị (`ve-vector-than-nhen.js` `var d = s && s.buoc ? 5 : 0`). `san-ve.js:993` đặt `v.chan` (1 = nhấc chân ở nhịp chuẩn bị, 2 = chân bước luân phiên) và `phC`; `san-ve.js:2015` sự kiện 'chuan-bi'. Hãy tự lần theo đường trạng thái từ san-ve → VeRobot → VeVector để biết pha di chuyển nào có sẵn (tiến độ trong nhịp, thời gian `now`).
- Xem hình nhanh: `hinh-mau/xem-vector-v6.html` (nếu còn), hoặc mở game cổng của bạn rồi gọi `VeRobot.veCo({than:'nhen',tay:null,camBien:[]}, {wl:0,wr:0,ph:0,tay:null}, 2, 160)`.

## PHẠM VI
Được sửa: `hoc/game/ve-vector-than-nhen.js`, `hoc/game/ve-vector-than-omni.js`; đường truyền trạng thái pha bước của NHỆN trong `hoc/game/ve-robot.js` và `hoc/game/san-ve.js` (chỉ phần nhện); `hoc/game/bang-mau.js` (chỉ THÊM vai màu nếu cần); máy kiểm `hoc/kiem-*.mjs` (xem mục KIỂM TRA).
KHÔNG sửa: luật chạy / lõi (`nhan/`, `hoc/san-hoc.js`, `cham.js`), dữ liệu màn `hoc/man-*.js`, thân khác (hai bánh, xích, drone), giao diện ngoài sân.
Giữ nguyên: mọi ổ gắn `oGan` / `oCam` / `vo` của hai thân (tay, cảm biến phải ở đúng chỗ; kiem-ve-vector mục 13c kiểm tia cảm biến đúng ổ), dáng co chân (crouch) vẫn phải nhận ra được, chế độ Cài đặt "Biểu cảm mắt" / giảm chuyển động (nếu có cờ giảm động thì dáng bò tối giản).

## CÁCH GIAO
Nhánh `claude/v8a-nhen-omni` trong worktree riêng (đã dựng sẵn cho bạn). Commit từng bước. KHÔNG push, KHÔNG merge, KHÔNG đụng `main`.
Hai agent không chạy song song: bạn là agent duy nhất lúc này.

## PHẢN BIỆN (bắt buộc đọc)
Brief này là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được phép và được khuyến khích nói ngược lại brief
(đọc sai bằng chứng, có cách đơn giản hơn, việc thừa, lỗ bị sót). Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo brief rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Quyết định của USER (không tự đi ngược): đồ hoạ vector (không pixel), màu đội R1 #38BDF8 / R2 #F472B6, chữ hiển thị không emoji, không gạch dài (em dash).

## KIỂM TRA (máy yếu RAM)
- CẤM chạy `npm test` cả bộ. Chỉ chạy từng máy kiểm liên quan, tuần tự:
  `node hoc/kiem-ve-vector.mjs`, `node hoc/kiem-nhen.mjs`, `node hoc/kiem-che-nhen.mjs`, `node hoc/kiem-omni.mjs`, `node hoc/kiem-che-omni.mjs`, `node hoc/kiem-doi-omni.mjs`, `node hoc/kiem-huy-hieu-phim-vector.mjs`, `node hoc/kiem-nut-mo-dau-phim-vector.mjs`
  (và `grep -l "nhen\|omni" hoc/kiem-*.mjs` để tìm máy kiểm khác có liên quan).
- Bốn PHANH so lệnh vẽ với bản nền `NEN_VEC` (13a-v trong kiem-ve-vector, A3-v / B5-v trong kiem-huy-hieu-phim-vector, C3-v trong kiem-nut-mo-dau-phim-vector) SẼ đỏ vì bạn cố ý đổi hình. Không được tắt chúng. Cách làm đúng:
  1. commit thay đổi vẽ;
  2. CHỨNG MINH chỗ đỏ chỉ do hai thân này: tạm hoàn riêng các tệp của bạn về bản trước (`git show <sha trước>:<tệp> > <tệp>`) rồi chạy lại các phanh, phải xanh; khôi phục;
  3. dời `const NEN_VEC` ở cả ba tệp kiểm sang SHA commit vẽ của bạn, kèm chú thích (xem mẫu ở các dòng NEN_VEC hiện tại), commit riêng;
  4. ghi rõ bước 2 (lệnh + kết quả) vào báo cáo.
- Nếu đổi đường trạng thái (buoc → pha liên tục), viết thêm kiểm trong kiem-ve-vector (mục 13 hoặc 14) chứng minh: các pha khác nhau ra hình khác nhau, và hình ở pha 0 / cuối nhịp khớp tư thế đứng; tự cắm lỗi giả cho kiểm đỏ rồi gỡ.
- Xem bằng mắt: chạy server cổng KHÁC 4181 (4181 của người giao), ví dụ `PORT=4190 node server.mjs` chạy nền; vào một màn nhện (gói `nhen`, `App.vaoMan('nhen.1')` sau `GoLoi.datMoHet(true)`) và omni; chụp nhiều khung khi đang đi. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Phải đổi luật chạy / dữ liệu màn; ổ gắn buộc phải dời; phạm vi phình sang thân khác.

## BÁO CÁO CUỐI (ghi ra `hoc/ban-giao/bao-cao-V8a.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT (nếu có việc cần user quyết): vấn đề, bảng phương án, ưu tiên.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 – 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
