# Kế hoạch 4 mùa cốt lõi (diem10code-python)

Chốt qua hội thoại 5–6/11/2026. Tài liệu này thay cho mọi ghi chú rời rạc trước đó — khi làm nội
dung, bám đúng tài liệu này; nếu có mâu thuẫn với trao đổi cũ, tài liệu này thắng.

## Mục tiêu

Ôn thi đại học lớp 12: `def`, `for`, `if`/`while`, biến, tham số, chuỗi, logic, `list`. KHÔNG
dùng `tuple`, `dict`/`set`, mảng 2 chiều (list lồng list) ở bất cứ màn nào, kể cả màn khó nhất.

## 5 mùa (4 cốt lõi + 1 Tổ hợp làm sau)

4 mùa cốt lõi **chỉ giới thiệu cơ chế/part mới**, không đào sâu phối hợp nhiều thiết bị — việc đó
dành cho **mùa thứ 5 "Tổ hợp"**, làm SAU, chưa thiết kế, không chặn tiến độ 4 mùa đầu.

| Mùa | Tên | Thân | Tay | Cảm biến | Môi trường | Ý Python |
|---|---|---|---|---|---|---|
| 1 | Kho hàng | Hai bánh (`banh`) | Kẹp | Khoảng cách | Thùng gỗ, Ô đích, Nút đè | `def`, `for`, `if`/`while` |
| 2 | Bãi tái chế | Nhện (`nhen`) | Nam châm | Cảm ứng từ | Thùng sắt, Hố VUÔNG (lấp bằng thùng sắt mà nam châm mang tới — lấp bằng thùng gỗ/loại khác để dành mùa Tổ hợp), Đệm từ | chuỗi, logic `and`/`or`/`elif` |
| 3 | Bến sông | Xuồng (`xuong`) | Dây phao kéo | Camera màu | Bè nổi có màu (kéo đúng màu), Dòng nước, Cống thủy lợi | biến, tham số |
| 4 | Nông trại | Drone (`drone`) | Vòi phun | Hồng ngoại (mới) + Camera màu (ôn lại từ mùa 3) | Đất màu (gieo hạt đúng màu bằng Camera), Đất khô/nóng (tưới bằng Hồng ngoại) | `list` |

Đã loại khỏi 4 mùa: Xích, Cần cẩu, Omni, Bánh gai (thân); Súng hơi-nguyên-gốc tên cũ, Máy ném, Loa
(tay, trừ máy ném đã cân nhắc rồi bỏ); Chong chóng dòng chảy (trả tuple), Radar tròn, Âm thanh
(cảm biến). Máy ném bị loại vì đứng một mình (không Omni/Radar) thì tương tác nông.

## Chuỗi chuyển part giữa các mùa (nguyên tắc: mỗi bước chỉ đổi ĐÚNG 1 part)

Mỗi mùa (trừ mùa 1) bắt đầu bằng thân mới + 2 part quen từ mùa trước, rồi đổi dần từng part một,
kết thúc đúng combo "nhà" của mùa đó (bảng trên). Luôn có 2 phần quen + 1 phần lạ, không bao giờ
3 phần lạ cùng lúc.

- **Mùa 1** (không có mùa trước nên không đổi part, mà XÂY DẦN từ số 0): thân → +tay → +cảm biến → +sân.
- **Mùa 2**: Nhện+Kẹp+Khoảng cách → Nhện+Nam châm+Khoảng cách → **Nhện+Nam châm+Cảm ứng từ**
- **Mùa 3**: Xuồng+Nam châm+Cảm ứng từ → Xuồng+Dây phao kéo+Cảm ứng từ → **Xuồng+Dây phao kéo+Camera màu**
- **Mùa 4**: Drone+Dây phao kéo+Camera màu → Drone+Vòi phun+Camera màu → **Drone+Vòi phun+Hồng ngoại**

## Cấu trúc mỗi mùa: lưới 4×8 = 32 màn

**4 cột (chiều ngang, biết rộng — lần lượt theo đúng chuỗi chuyển part ở trên):**
1. Thân mới (dùng tạm tay + cảm biến mùa trước; riêng mùa 1: thân một mình, chưa có tay/cảm biến)
2. Tay mới (thân mới + tay mới + cảm biến mùa trước; riêng mùa 1: +tay, chưa có cảm biến)
3. Cảm biến mới (combo "nhà" đầy đủ của mùa)
4. Sân/môi trường riêng của mùa (dùng combo đầy đủ; hàng 8 của cột này = trùm mùa, không cần cột Trùm riêng)

**8 hàng (chiều dọc, hiểu sâu — áp dụng CÙNG một khuôn cho mọi cột, mọi mùa, để học sinh quen kiểu
bài, không phải đoán lại mỗi chương):**
1. Chỉ xem — code mẫu chạy sẵn, bấm Chạy để quan sát, không sửa
2. Dự đoán rồi chạy — đoán robot/ kết quả trước khi bấm Chạy, rồi xác nhận
3. Điền chỗ trống — code có sẵn phần lớn, thiếu 1–2 dòng
4. Sắp xếp lại — đúng lệnh nhưng xáo thứ tự / khối, kéo thả cho đúng
5. Sửa lỗi — code có sẵn, sai đúng 1 chỗ, tìm và sửa
6. Viết từ đầu (có gợi ý) — màn trống, có gợi ý hướng dẫn
7. Viết hàm (`def`) — rút thao tác lặp lại thành hàm riêng, tự đặt tên
8. Tự lực — không gợi ý, khó nhất của cột đó

Tổng mỗi mùa: 4 × 8 = **32 màn**. Tổng 4 mùa: **128 màn**.

**Mùa 1 đã DỰNG LẠI theo khuôn 4×8 này** (thay bản 45 màn, 9 chương trước đó), **Mùa 2 đã dựng** cùng khuôn. Mùa 3–4 dựng theo cùng cách:

- Dùng `ManHoc.khuon(so, m)` (`hoc/man-co-so.js`): truyền số hàng 1–8, hàm tự đặt dạng bài và các cờ của hàng đó.
- Mỗi cột là một chương + một gói (`m1-c1-than`, `m1-c2-tay`, `m1-c3-cam-bien`, `m1-c4-san` trong `hoc/thu-tu-chuong.js`).
- Kiểm bằng `node hoc/kiem-khuon.mjs`: mỗi màn thắng 3 sao bằng hàm của chính nó, code mẫu đúng dạng bài của hàng, đúng bộ part của cột. Dựng mùa mới thì thêm mùa đó vào bảng `MUA` trong tệp này.

Quyết định khi dựng (có thể đổi nếu muốn):

- Hàng 2: đoán sai vẫn qua màn nhưng bị trừ 1 sao, chơi lại để đoán lại được.
- Hàng 7: tên hàm do em tự đặt (`hamTuDat`, `canHamTuDat`), không viết hàm thì chưa thắng. Hàm tự đặt không chuyển sang màn sau bắt buộc: mỗi màn thắng được với hàm của chính nó.
- Khung chính vẽ tối đa 10 dòng mà nhặt + đặt đủ lệnh gốc đã hết 10, nên hàng 1–6 ở cột có tay cho sẵn hàm của màn `pick()`/`drop()`.
- Gói sau mở theo luật sao có sẵn (½ số sao tối đa của các gói trước, làm tròn xuống bội 5), nên chưa cần xong hết 8 hàng của cột trước.

Quyết định riêng của Mùa 2 (có thể đổi nếu muốn):

- **Lấp hố**: nhện đang dính thùng sắt bước vào hố thì không rơi nhưng chưa bước ra được; `magnet_off()` thả thùng lấp hố, ô thành sàn. Không mang gì, hay mang vật nam châm, thì rơi. Nhờ vậy mang thùng không phải cách đi xuyên qua hố.
- **Hố vẽ vuông** để khớp thùng sắt (hình `ho` trong `hoc/game/ve-vector-o2.js`).
- **Cảm biến trên nhện nhìn cố định**: khoảng cách thì `front` là phía trên sân, `left` trái, `right` phải; cảm ứng từ của Bãi tái chế nhìn sang phải (`batDau.huong = 1`). Vật nằm đất làm `front_clear()` thành False dù nhện đứng trùm lên được.
- **Nhện gắn kẹp đứng trùm lên vật được**, như nhện gắn nam châm, vì tay làm ở ô đang đứng.
- **Nhập `and`/`or`**: màn khai `vaHoac: true`; chạm vào điều kiện rồi chọn `+ and`/`+ or`, tối đa hai vế. Chạm chữ bên phải của `c == "R"` hay `front_pole() == "N"` để đổi chữ.
- **Biến chưa dạy ở Mùa 2**: chuỗi chỉ đi qua `for c in "..."`, chưa gán vào biến; biến và tham số để Mùa 3.

## Quy tắc engine (đã áp dụng một phần khi dựng mùa 1 lần đầu, giữ nguyên khi dựng lại)

- **Hai bánh (`banh`) và Xuồng (`xuong`)**: dùng `up()` / `down()` / `turn_left()` / `turn_right()`.
  KHÔNG dùng `left_move()` / `right_move()` / `wait()` kiểu hai bánh độc lập cũ. Mỗi lệnh tự chiếm
  đúng 1 nhịp, không cần gọi `wait()` riêng để chốt.
- **Nhện (`nhen`) và Drone (`drone`)**: giữ nguyên `go_up()`/`go_down()`/`go_left()`/`go_right()`/`wait()`
  — không có hướng mặt, không quay.
- **Mọi tổ hợp thân+tay đều được phép** (không giới hạn tay theo đúng thân "gốc" của nó nữa, vì chuỗi
  chuyển part ở trên cố ý ghép tay cũ lên thân mới).
- **Ô mục tiêu của tay, quy tắc DÙNG CHUNG cho mọi tay** (không viết riêng từng tay):
  - Thân CÓ hướng mặt (Hai bánh, Xuồng): tay tác động Ô PHÍA TRƯỚC MŨI.
  - Thân KHÔNG có hướng mặt (Nhện, Drone): tay tác động Ô ROBOT ĐANG ĐỨNG ("tại chỗ").
  - Tay có tầm xa (vd Dây phao kéo, tầm 2–3 ô) giữ nguyên tầm xa của nó; trên thân không hướng thì
    được reach cả 4 hướng quanh robot (vì không có "phía trước" để giới hạn còn một hướng) — đây là
    lý do Dây phao kéo trên Drone KHÔNG trùng cơ chế với Kẹp (tầm ngắn, mang dính người) dù cả hai
    đều "tại chỗ": khác nhau ở tầm xa và kiểu mang (dính người / kéo lê trễ 1 nhịp).
- Không dùng `tuple`/`dict`/`set`/list-lồng-list trong bất kỳ cú pháp màn nào.

## Việc còn lại

1. Dựng Mùa 3, 4 theo đúng khuôn 4×8 + chuỗi chuyển part ở trên (chưa làm; Bến sông, Nông trại đang có 1 màn demo).
2. Mùa Tổ hợp (mùa 5): chưa thiết kế, làm sau khi xong 4 mùa cốt lõi.
3. Thao tác nhập lệnh (UI khay lệnh/gõ code): đã đơn giản hoá một phần qua up/down/turn_left/turn_right;
   chưa xem lại toàn bộ UI nhập lệnh — vẫn là việc treo từ đầu buổi.
