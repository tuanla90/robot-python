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

**Mùa 1 đã DỰNG LẠI theo khuôn 4×8 này** (thay bản 45 màn, 9 chương trước đó), **Mùa 2, Mùa 3, Mùa 4 đã dựng** cùng khuôn, theo cùng cách:

- Dùng `ManHoc.khuon(so, m)` (`hoc/man-co-so.js`): truyền số hàng 1–8, hàm tự đặt dạng bài và các cờ của hàng đó.
- Mỗi cột là một chương + một gói (`m1-c1-than`, `m1-c2-tay`, `m1-c3-cam-bien`, `m1-c4-san` trong `hoc/thu-tu-chuong.js`).
- Kiểm bằng `node hoc/kiem-khuon.mjs`: mỗi màn thắng 3 sao bằng hàm của chính nó, code mẫu đúng dạng bài của hàng, đúng bộ part của cột. Dựng mùa mới thì thêm mùa đó vào bảng `MUA` trong tệp này.

Quyết định khi dựng (có thể đổi nếu muốn):

- Hàng 2: đoán sai vẫn qua màn nhưng bị trừ 1 sao, chơi lại để đoán lại được.
- Hàng 7: tên hàm do em tự đặt (`hamTuDat`, `canHamTuDat`), không viết hàm thì chưa thắng. Hàm tự đặt không chuyển sang màn sau bắt buộc: mỗi màn thắng được với hàm của chính nó.
- Khung chính vẽ tối đa 10 dòng mà nhặt + đặt đủ lệnh gốc đã hết 10, nên hàng 1–6 ở cột có tay cho sẵn hàm của màn `pick()`/`drop()`.
- Gói sau mở theo luật sao có sẵn (½ số sao tối đa của các gói trước, làm tròn xuống bội 5), nên chưa cần xong hết 8 hàng của cột trước.

Quyết định riêng của Mùa 1 (có thể đổi nếu muốn):

- **Chưa có `for` ở cột 1**: cột 1 chỉ dùng lệnh thường để em quen lệnh, nhịp và hướng xe; hàng 7 vẫn dạy hàm, gọi hàm 3 lần thay vì đặt trong `for`. `for` giới thiệu ở cột 2: hàng 1 xem, hàng 2 đoán, hàng 3 thấy lại, hàng 6 tự viết (dùng `for` mới đạt đủ sao).

- **Mùa 1 không có `wait()`**: mỗi lệnh tay trên xe tự chiếm 1 nhịp như lệnh bánh, nhặt thùng là `arm_down()`, `grab()`, `arm_up()`, 3 nhịp. Không nâng tay trong lúc đang đi được nữa. Nhện vẫn ra lệnh rồi `wait()`, nên màn 5.2 (Mùa 2, cột Nhện, hàng 2) là lần đầu em gặp `wait()`. Hàm em viết ở Mùa 1 không có `wait()`, sang nhện phải thêm vào; game báo rõ dòng nào bị bỏ qua.

Quyết định riêng của Mùa 2 (có thể đổi nếu muốn):

- **Lấp hố**: nhện đang dính thùng sắt bước vào hố thì không rơi; `magnet_off()` thả thùng lấp hố, ô thành sàn. Không mang gì, hay mang vật nam châm, thì rơi.
- **Thùng dưới hố giữ nhện**: nam châm còn bật mà thùng sắt ở dưới hố ngay chân nhện (đang mang tới hay đã lấp từ trước) thì nhện không bước đi được, vẫn mất 2 nhịp; tắt nam châm mới đi. Thùng không bị hút lên. Nhờ vậy mang thùng không phải cách đi xuyên qua hố.
- **Hoạt cảnh bước của nhện**: mỗi nhịp đi nửa ô, nhịp 1 nửa đầu, nhịp 2 nửa sau. Bước không đi được thì nhịp 1 đứng tại chỗ nhấc chân, nhịp 2 rung. Luật vẫn tính nhện đổi ô ở nhịp 2 (`front_clear()` đọc ở nhịp 1 vẫn theo ô cũ).
- **Hố vẽ vuông** để khớp thùng sắt (hình `ho` trong `hoc/game/ve-vector-o2.js`).
- **Cảm biến trên nhện nhìn cố định**: khoảng cách thì `front` là phía trên sân, `left` trái, `right` phải; cảm ứng từ của Bãi tái chế nhìn sang phải (`batDau.huong = 1`). Vật nằm đất làm `front_clear()` thành False dù nhện đứng trùm lên được.
- **Nhện gắn kẹp đứng trùm lên vật được**, như nhện gắn nam châm, vì tay làm ở ô đang đứng.
- **Nhập `and`/`or`**: màn khai `vaHoac: true`; chạm vào điều kiện rồi chọn `+ and`/`+ or`, tối đa hai vế. Chạm chữ bên phải của `c == "R"` hay `front_pole() == "N"` để đổi chữ.
- **Biến chưa dạy ở Mùa 2**: chuỗi chỉ đi qua `for c in "..."`, chưa gán vào biến; biến và tham số để Mùa 3.

Quyết định riêng của Mùa 3 (có thể đổi nếu muốn):

- **Cột dạy gì**: cột 1 biến (`n = 4`, `n = n + 1`), cột 2 tham số số (`lui(n)`), cột 3 biến ghi màu và tham số chữ (`c = color()`, `giao(c)`), cột 4 biến đếm và hàm hai tham số (`bac(a, b)`).
- **"Dây phao kéo" chính là tay lưới có sẵn** (`day-keo`): `cast_net()` / `drop_net()`, trong lời đề bài gọi là lưới phao cho khớp tên lệnh. Lưới bắt vật cách ĐÚNG 2 ô, vật đi theo đường xuồng và luôn cách xuồng 2 ô. Không dùng `set_length`.
- **Phải thả mới tính giao**: vật còn trong lưới nằm trên bến thì chưa thắng, phải `drop_net()` rồi `wait()`.
- **Thùng sắt nổi**: cột 1, 2 dùng `B` + lớp `vatChat` (`s` sắt, `N`/`S` nam châm, `g` gỗ). Xuồng gắn được nam châm (thả xuống ô nước trước mũi) hay tay lưới, không cả hai.
- **Tầm nhìn**: thùng sắt thấy và hút trong 2 ô, thùng nam châm trong 3 ô. Vì lưới bắt ở 2 ô nên `while not front_metal(): forward()` dừng đúng tầm lưới.
- **Camera chỉ thấy ô kề trước mũi** và thấy cả màu bến, nên phải `c = color()` rồi mới lùi ra tung lưới: đây là lý do cần biến. Xuồng xuất phát sau các bến (phía bè) để `while color() == "none"` không dừng nhầm ở bến.
- **Bến và bè có màu**: lớp `mau` cho bến, `vatMau` cho bè, có dấu hình như các vật màu khác để người mù màu vẫn phân biệt.
- **Van không khai `noi`** thì điều khiển mọi cống, mọi dòng của sân: tung lưới trúng van thì cống mở, dòng tắt (`cast_net("left")`, van cách 1 hay 2 ô đều được).
- **Hàng 7 cột 2–4 có `canThamSo`**: hàm của em phải có tham số mới thắng. Màn khai `khaiDoiSo` thì hộp Hàm mới có ô đối số.
- **Nhập lệnh**: tham số so với tên màu thì lời gọi có bảng chọn màu kèm biến (`giao(c)`); `cast_net("left")` có bảng chọn bốn hướng.
- **Bỏ màn demo Bến sông** trong `hoc/man-demo.js`.
- **Thẻ part của xuồng** đổi sang bộ lệnh `forward`/`backward`/`turn_left`/`turn_right`.

Quyết định riêng của Mùa 4 (có thể đổi nếu muốn):

- **Cột dạy gì**: cột 1 danh sách số (`a = [2, 3, 1]`, `for n in a`, `a[0]`), cột 2 danh sách chữ (`a[i]`, `len(a)`, `a.append(color())`, hàm nhận danh sách `gieo(a)`), cột 3 nhớ kết quả đo (`a.append(warm())`, `for k in a: if k:`), cột 4 phối hợp với hai cảm biến. Hàng 8 cột 4 là trùm cả 4 mùa.
- **Mục tiêu mới `cham-dat`**: thắng khi hết đất khô và mọi ô cần gieo đúng màu. Lớp sân `datKho` (số 1..3 là số lần tưới cần, `m` là luống đo), `datRom` (`x` là ô phủ rơm), `hinh` (ô cần gieo, vẽ hoa mờ).
- **Vòi phun trên drone làm ở ô dưới bụng**: `spray()` tưới, `seed(c)` gieo. Lệnh làm ở nhịp `wait()`/`go_*()` kế, trước khi bay, nên `spray()` rồi `go_right()` là 1 nhịp. Tưới đất không khô thì úng, gieo ngoài ô cần gieo thì hỏng, đều dừng ngay. Gieo sai màu thì gieo lại được.
- **Hồng ngoại trên drone**: `warm()` đo ô dưới bụng, không tốn nhịp. Không đọc xuyên rơm. Luống đo (`m`) báo nóng nhưng không cần tưới, nên muốn tưới luống phủ rơm phải đo luống đo, nhớ vào danh sách rồi mới bay xuống: đây là lý do cần danh sách.
- **Camera trên drone** đọc ô dưới bụng: vật trước, rồi tới màu đất. Lớp `hinh` là ô cần gieo, không phải màu đất, nên camera đọc ra `"none"`.
- **Lưới trên drone** (`luoiBay: true`): `cast_net(d)` theo màn hình (`front` lên trên), bắt vật đất cách đúng 2 ô, vật đi theo đường bay. Bay về phía vật trong lưới thì bị chặn.
- **Danh sách**: khung nhập đã có sẵn, hàng 6, 8 khai `canList: true` (không dùng danh sách thì chưa thắng). Vẫn không dùng gán `a[0] = x`, tuple, dict, set, list lồng list.
- **Hoa phân biệt bằng số cánh, không dùng dấu hình**: xanh lá 3, xanh dương 4, đỏ 5, vàng 8 (`SO_CANH` trong `hoc/game/ve-vector-nong-trai.js`), để người mù màu đếm cánh là biết màu. Áp dụng cho luống hoa, hoa vừa gieo, hoa mờ cần gieo và bao hạt. Các mùa khác vẫn giữ dấu hình.
- **Bỏ màn demo Nông trại**: `hoc/man-demo.js` không còn màn nào.

## Quy tắc engine (đã áp dụng một phần khi dựng mùa 1 lần đầu, giữ nguyên khi dựng lại)

- **Hai bánh (`banh`) và Xuồng (`xuong`)**: dùng `forward()` / `backward()` / `turn_left()` / `turn_right()`. Tên theo mũi xe, không theo màn hình; `go_up()` của nhện, drone và hướng `color("up")` mới theo màn hình.
  KHÔNG dùng `left_move()` / `right_move()` / `wait()` kiểu hai bánh độc lập cũ. Mỗi lệnh tự chiếm
  đúng 1 nhịp, không cần gọi `wait()` riêng để chốt. Lệnh tay kẹp trên hai thân này cũng vậy.
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

1. Mùa Tổ hợp (mùa 5): chưa thiết kế, làm sau khi xong 4 mùa cốt lõi.
2. Thao tác nhập lệnh (UI khay lệnh/gõ code): đã đơn giản hoá một phần qua forward/backward/turn_left/turn_right;
   chưa xem lại toàn bộ UI nhập lệnh — vẫn là việc treo từ đầu buổi.
