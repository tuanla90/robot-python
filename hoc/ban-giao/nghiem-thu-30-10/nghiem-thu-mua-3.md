# Nghiệm thu độc lập mùa 3 (mua-3), 30/10

Repo: worktree tay-gap-xoay-comparison-00c53c, nhánh claude/gracious-babbage-587856. Chỉ đọc, không sửa tệp nào trong repo.

## 0. Lưu ý về dữ liệu (quan trọng cho người giao)

Script `xem-goi.cjs` đọc thẳng `thu-tu-chuong.js` mà KHÔNG nạp `lo-trinh-hoc.js`, nên in ra mùa 3 CŨ (Vòi phun, Cảm biến màu, Máy sơn, Lắp ráp Thân + Não, Nam châm).
Lộ trình thật được dựng lại trong `hoc/lo-trinh-hoc.js` (khối `MUA_3`, dòng 871 trở đi): 10 gói Nhện, Nam châm, Cảm biến từ, Bãi từ, Nhảy, Đảo cực, Đọc cực,
Đội xích và nhện, Nam châm bụng nhện, Tổng hợp. Mùa 2 cũng bị dựng lại như vậy (`MUA_2`), nên nếu nghiệm thu mùa 2 bằng cùng script thì cũng sai.
Bản sửa (chỉ đổi dòng nạp thành `require('lo-trinh-hoc.js')`) ở scratchpad: `xem-goi-lt.cjs`, kết quả `m3lt.txt`. Báo cáo này chấm theo lộ trình thật.
Đã đối chiếu với công cụ `xem-goi.cjs` do người giao sửa lại: đầu ra trùng khớp từng dòng (1317 dòng), nên mọi nhận xét dưới đây đều dựa trên lộ trình xuất bản, không có nhận xét nào lấy từ bản cũ.
Cả 200 màn: lời giải chính thắng, 3 sao (trừ không màn nào lỗi chấm). Chương 1 của 9 gói đầu đều có màn trình diễn `chiChay` (che-nhen không cần vì chỉ ghép khối đã biết).

Mục tiêu đối chiếu (KE-HOACH-7-MUA.md, KE-HOACH-MUA-3.md): Python A = chuỗi làm dữ liệu, Python B = `and` / `or` (elif là nhắc lại);
thân nhện → nhảy, nam châm một cực → đảo cực, cảm biến từ sắt → đọc cực; sân: sắt, nam châm điện, hố, đệm từ ("dùng đủ ba part: cảm biến từ đọc cực của đệm, nam châm đảo cực chọn hút hay đẩy").

## 1. Đường cong học tập

Ký hiệu: (ô / nhịp) theo thứ tự hiển thị 1 tới 10.

### Trong mùa, giữa các gói
- Thứ tự khái niệm dựa đúng vào cái đã học: gói 3 dùng `and` của gói 2 (cam-ung-tu.5 `while front_clear() and not front_metal()`); gói 5 dùng go(c) / chuỗi của gói 1 (nhen.5);
  gói 6 chương 2 dùng front_metal của gói 3 và `and` của gói 2 (che-dao-cuc.9); gói 7 dùng biến chuỗi của gói 1 (`p = front_pole()`), elif của mùa 1;
  gói 8 dùng crawl / jump / walk của gói 5; gói 9 dùng trail (gói 1), crouch (gói 5), magnet_s (gói 6), tham số chuỗi (gói 7). Khay bớt lệnh theo gói (front_metal trước gói 3, crouch trước gói 5, magnet_s trước gói 6, front_pole trước gói 7) đúng "gốc → nâng cấp".
- Rò khái niệm trước khi dạy: luật cực (cùng cực đẩy, khác cực hút) đã dùng ở gói 2 (nam-cham.4 "Cùng cực thì đẩy", nam-cham.15) và gói 4 (bai-tu.3, bai-tu.7 "Bật N thì khác cực, đệm vẫn HÚT") trước gói 6 Đảo cực; che-nam-cham.8 ở gói 2 nói "Cực S của nam châm hỏng" khi em chưa biết có cực S. Không sai luật, nhưng gói 6 mất bớt phần "mới".
- Ý chính của bảng 7 mùa cho đệm từ (đọc cực của đệm rồi chọn cực, `if pole == "N": magnet_n()`) không có màn nào làm: gói 4 đứng trước gói 6 / 7 nên chỉ bật N; tong-hop-3.4 và tong-hop-3.10 có đổi cực qua đệm nhưng viết cứng, không đọc cảm biến.
- Bậc thang cỡ màn giữa gói: gói 7 (ô 5 tới 29) sang gói 8 (ô 20 tới 72, hai chương trình) rồi gói 9 lại về 7 tới 31. Gói 8 nặng gấp 2 đến 3 lần gói kề (che-doi-xich.20: 72 ô, 46 nhịp, lớn nhất mùa). Chấp nhận được vì là gói thử thách, nhưng là đỉnh nhọn.

### Trong từng chương (chỗ nhảy vọt, chỗ chững)
- nhen: (7/14, 4/12, 6/14, 4/16, 6/22, 8/24, 6/24, 4/12, 9/18, 11/32). Mượt; trùm nhen.18 nhịp 18 → 32.
- chuoi-nhen: (6/10 ... 16/32). Mượt, mỗi màn thêm một ý: for c in chuỗi → sửa chuỗi → thêm nhánh elif → tự viết go(d) → biến giữ chuỗi → hàm trail(path) → sửa chuỗi → trùm. Tốt nhất mùa.
- nam-cham: (4/2, 9/4, 11/4, 10/4, 10/6, 17/10, 22/15, 20/22, 23/22, 26/11). Mượt. Nhưng nam-cham.4 (hàng luyện) mở luật mới "vật nam châm, cùng cực đẩy" không có màn trình diễn; nam-cham.1 (màn 3) giới thiệu lại magnet_n sau hai màn đã dạy.
- logic-nam-cham: (10/6, 5/2, 10/5, 15/8, 9/11, 14/12, 20/11, 15/9, 14/13, 14/12). `or` mở ở logic-nam-cham.4 (hàng luyện) không có trình diễn, trong khi `and` có (logic-nam-cham.1).
  Chững: logic-nam-cham.6 lời giải trùng hệt logic-nam-cham.3 (chỉ thêm sân); trùm logic-nam-cham.8 lời giải trùng hệt logic-nam-cham.5 (cùng `while front_clear() or right_clear(): ... kick()`, cùng 14 ô / 12 nhịp). Trùm không khó hơn màn 5.
  che-nam-cham.8 (màn 7, 20 ô) là đỉnh lạc của chương, không có and / or.
- cam-ung-tu: (5/2, 12/4, 15/4, 13/7, 17/8, 18/12, 15/13, 17/9, 14/5, 20/13). Mượt. cam-ung-tu.8 trùng lời giải cam-ung-tu.5 (màn sửa or → and, chấp nhận được vì là màn đố).
- che-cam-ung-tu: (14/6 ... 25/13). Mượt, mỗi màn gói một hàm mới rồi ghép. Tốt.
- bai-tu: (5/4, 12/7, 6/4, 6/4, 11/4, 14/8, 13/11, 12/5, 15/9, 27/16). Dồn cơ chế: 5 màn đầu mỗi màn một luật mới, màn 4 và 5 mỗi màn HAI luật (nút đè bật + đệm kéo vật; nút đè TẮT + vật bị đệm giữ không lấy được). Màn 8 thêm "đè một nhịp rồi rời nút" (luật thời gian). Trùm 15 → 27 ô (gần gấp đôi), là ghép bai-tu.8 + bai-tu.9.
- che-bai-tu: (15/8, 21/13, 22/15, 14/14, 24/20, 12/10, 19/14, 29/19, 23/21, 35/26). Răng cưa nhưng chấp nhận; trùm 35 ô là ghép che-bai-tu.8 + che-bai-tu.5.
- nhay: (6/10, 5/6, 5/9, 6/10, 9/9, 8/12, 10/18, 17/24, 19/27, 18/56). Trùm nhen.10 56 nhịp, gấp đôi màn 9 (27). nhen.5 (màn 8) nhảy 10 → 17 ô.
- che-nhen: (14/5 ... 25/28). Mượt.
- dao-cuc: (9/4, 9/5, 11/4, 7/3, 10/4, 12/5, 18/9, 12/5, 7/3, 21/10). Răng cưa: nam-cham.2 (màn 7, 18 ô) đỉnh lạc; dao-cuc.7 (màn 9) dễ nhất chương (7 ô / 3 nhịp) rồi trùm dao-cuc.8 21 ô, 16 dòng tuần tự (gấp 3 màn 9). nam-cham.3 (màn 3) giới thiệu lại vật nam châm sau dao-cuc.1, .2.
- che-dao-cuc: (5/2, 8/3, 5/2, 8/3, 17/6, 15/8, 15/3, 11/4, 9/3, 20/7). Màn 9 che-dao-cuc.7 (fling hai lần, 9 ô / 3 nhịp) là dốc xuống ngay trước trùm 20 ô.
- doc-cuc: (5/2, 5/1, 10/3, 16/6, 17/5, 17/3, 22/3, 19/3, 27/7, 23/31). nam-cham.6 (màn 4) dồn ba thứ: while so chuỗi "none" + tạo grip() có if / else + front_pole. Trùm nam-cham.10 nhịp 7 → 31.
- che-doc-cuc: (11/3, 18/3, 23/7, 9/2, 11/3, 15/4, 18/4, 20/6, 22/9, 29/44). Màn 4 che-nam-cham.2 (reel, 9 ô / 2 nhịp) tụt sau màn 3 (23 ô). Trùm 9 → 44 nhịp (do đi qua ba vật), ô 22 → 29 ổn.
- doi-xich: (20/5, 27/7, 24/10, 22/12, 40/14, 46/20, 54/28, 47/42, 47/60, 60/30). Nhảy 22 → 40 ô ở doi-xich.15 (màn 5) vì cùng lúc thêm chuyền hộp giữa hai robot, gắp / thả và đếm nhịp chờ (6 wait).
- che-doi-xich: (25/10 ... 72/46). Mượt so với chính nó, nhưng trị tuyệt đối lớn nhất mùa.
- bung-nhen: (7/8, 8/10, 10/10, 9/12, 9/14, 15/16, 7/12, 10/14, 12/12, 25/38). Trùm gấp đôi ô, gấp ba nhịp màn 9; bung-nhen.10 là ghép ba màn trước.
- che-bung-nhen: (8/8 ... 20/20, 20/20, 31/44). che-bung-nhen.9 trùng hệt lời giải che-bung-nhen.8 (màn sửa chuỗi), trùm 20 → 44 nhịp.
- tong-hop-3, trum-mua-3: cỡ màn nhảy theo gói được ôn (9 ô tới 62 ô), đúng tính chất ôn tập; trum-mua-3.4 (48 ô) ở hàng luyện.

## 2. Liên kết chương 1 và chương 2 trong gói, màn lạc đề

- Gói 1 Nhện: nối tốt. Chương 1 dạy đi 4 hướng + hàm step_down / stairs(n); chương 2 biến đường đi thành chuỗi, trùm chuoi-nhen.8 dùng lại băng chuyền của chương 1. Không lạc đề.
- Gói 2 Nam châm: nối vừa. Chương 2 "Logic cho nam châm" phần lớn là dò đường bằng front_clear / right_clear; nam châm chỉ là cớ (logic-nam-cham.1, .2, .4, .7 không dùng nam châm). Chỗ nối tốt: logic-nam-cham.5 và .8 dùng kick() vừa chế ở che-nam-cham.1.
  Lạc đề: che-nam-cham.8 "Chỉ còn cực N" (không có and / or, nhắc cực S chưa học).
- Gói 3 Cảm biến từ: nối rất tốt. Chương 2 gói lại đúng các màn chương 1 thành seek_iron / take_iron / face_iron / seek_safe, đề ghi rõ "như màn Sắt hay gỗ / Ba hướng / Gặp gỗ thì rẽ". Không lạc đề.
- Gói 4 Bãi từ: nối tốt về sân (get_iron, fetch_iron(n), pull_iron, loop_right(k) đều là đường đi của chương 1). Nhưng cả gói không dùng cảm biến từ, and / or hay chuỗi dù khay có front_metal; mọi màn một sân, viết cứng số bước. Chương 2 là tham số (mùa 2) chứ không phải Python mùa 3.
- Gói 5 Nhảy: nối tốt (crawl, jump, leap, crawl_jump). Lặp: nhen.6 bắt tạo walk(path) có thân y hệt trail(path) đã tạo ở chuoi-nhen.6. Hơi lạc: che-nhen.6 "Nhện giao hàng" (tay kẹp, không nhảy, không chui).
- Gói 6 Đảo cực: nối tốt (pull_n, pull_s, fling, haul_n(k), push_off). Chương 2 có recall đẹp: che-dao-cuc.8 và che-dao-cuc.9 dùng front_metal + and. Lặp: nam-cham.3 dạy lại vật nam châm.
- Gói 7 Đọc cực: chương 1 tốt (đọc chuỗi, if / else, biến p, if / elif / else ba nhánh, sửa chữ hoa "s"). Chương 2 đứt mạch: ba màn mới tạo sort_drop(p) (nhận chuỗi), rồi bảy màn cũ che-nam-cham chuyển sang họ hàm khác (reel, lane, sort) không dùng sort_drop; che-nam-cham.9 "Đường về" (put_back bằng magnet_n) và che-nam-cham.3 "Dọn đường" (kick + grip) không cần đọc cực, lạc đề.
  Phần cứng không khớp: các màn cũ dùng front_pole (nam-cham.6, nam-cham.10, che-nam-cham.2 tới .10) khai robot chỉ có cảm biến khoảng cách, không có part 'tu' vừa giới thiệu ở gói 3 (lõi chỉ nhìn hamGoc nên vẫn chạy, nhưng hình robot nói khác bài học).
- Gói 8 Đội xích và nhện: hai chương nối rất chặt (che-doi-xich.11 "Màn Xích qua trước, viết gọn hơn", che-doi-xich.17 / .19 viết lại doi-xich.16 / .18 bằng hàm). Không dùng part mùa 3 nào ngoài nhảy.
- Gói 9 Nam châm bụng nhện: nối tốt (hook / unhook / hook_for(p) / tote(path)). Nhện không gắn được cảm biến nên mọi quyết định cực là hằng ("N" / "S" viết tay), không có if theo cảm biến.
- Gói 10 Tổng hợp: tong-hop-3 ôn từng gói (gói 3: .2, .8; gói 4: .3; gói 5: .1; gói 6 + 4: .4, .10; gói 7: .5; gói 8: .7; gói 9: .6, .9). Gói 1 (chuỗi làm dữ liệu) chỉ thoáng qua qua trail; gói 2 (and / or) bị giấu trong seek_safe() dù đề tong-hop-3.8 ghi "Ôn and / or".
  trum-mua-3: .1 là màn duy nhất đọc cực; không màn nào viết and / or hay biến chuỗi; 9 / 10 màn một sân (viết cứng được).

## 3. Mỗi gói có đạt mục tiêu không

- Gói 1 Nhện (thân gốc + Python A chuỗi): đạt. Xong gói em viết được `for c in path`, biến giữ chuỗi, hàm nhận chuỗi; trùm chuoi-nhen.8 đòi biến chuỗi + trail + nhớ luật băng. Trùm nhen.18 kiểm đúng stairs(n) + băng.
- Gói 2 Nam châm (tay gốc + Python B and / or): đạt phần tay; phần logic đạt nhưng mỏng. and có trình diễn và bộ dò ép; or không trình diễn; trùm logic-nam-cham.8 chỉ là logic-nam-cham.5 thêm một sân, không kiểm ghép and với or hay and trong hàm.
- Gói 3 Cảm biến từ (front_metal bool): đạt. Ép dùng cảm biến bằng 2 tới 3 sân, trùm che-cam-ung-tu.10 ghép ba hàm em chế, có and từ gói 2.
- Gói 4 Bãi từ (đệm từ, nút đè, hố, sắt bị giữ): đạt về cơ chế, nhưng dạy dồn và không gắn với cảm biến / Python mùa 3; trùm đúng mục tiêu (đè nút, đệm N, đệm S) nhưng là ghép hai màn trước.
- Gói 5 Nhảy: đạt. Em dùng được crouch / stand, nhảy hố, hàm crawl / jump / leap; trùm che-nhen.10 giới hạn 3 hàm, kiểm đúng.
- Gói 6 Đảo cực: đạt. Chọn cực theo việc kéo / đẩy / bắn; trùm che-dao-cuc.9 có while + and + if front_metal + fling (tốt). Trùm dao-cuc.8 kiểm đúng nhưng chỉ là 16 dòng tuần tự một sân.
- Gói 7 Đọc cực (front_pole chuỗi): chương 1 dạy đạt; trùm nam-cham.10 không kiểm cái mới (biến p, so chuỗi, elif): grip() giấu front_pole, phần còn lại là `while not right_clear()`. doc-cuc.8 (màn 9) kiểm đúng hơn chính trùm.
- Gói 8 Đội xích và nhện: đạt theo bảng (đội: làm quen / thử thách), em phối hợp được hai chương trình bằng wait_n và hàm; nhưng số ô quá lớn so với cả mùa.
- Gói 9 Nam châm bụng nhện (combo): đạt; trùm ghép đủ cực, nhảy, trail. Không có quyết định theo cảm biến.
- Gói 10 Tổng hợp + Trùm mùa: chưa đạt. Trùm mùa trum-mua-3.10 gần như bản sao che-doi-xich.19 (cùng khung go_wall / pass_box / tr_right / go_wall / pick / spin / wait_n / back / drop và wait_n / hop_drop / walk / walk) thêm một đệm S bị tắt bằng nút; không robot nào gắn nam châm hay cảm biến từ, không đọc cực, không and / or, không chuỗi làm dữ liệu, một sân. Trùm tong-hop-3.10 cũng một sân, viết cứng for range(4) / range(3).

## Kết luận từng gói

| Gói | Kết luận |
|---|---|
| 1 Nhện | Đạt |
| 2 Nam châm | Đạt có góp ý (or không trình diễn; trùm trùng màn 5; che-nam-cham.8 lạc đề) |
| 3 Cảm biến từ | Đạt |
| 4 Bãi từ | Đạt có góp ý (dồn 2 luật mỗi màn ở bai-tu.4, .5; trùm 15 → 27 ô; không dùng cảm biến / logic) |
| 5 Nhảy | Đạt có góp ý (trùm nhen.10 56 nhịp gấp đôi màn 9; walk trùng trail) |
| 6 Đảo cực | Đạt có góp ý (nam-cham.3 lặp; màn 9 tụt rồi trùm gấp 3) |
| 7 Đọc cực | Đạt có góp ý (trùm nam-cham.10 lệch mục tiêu; chương 2 đứt mạch; robot màn cũ thiếu part 'tu') |
| 8 Đội xích và nhện | Đạt có góp ý (ô 40 tới 72, nhảy 22 → 40 ở doi-xich.15) |
| 9 Nam châm bụng nhện | Đạt có góp ý (trùm gấp 2 đến 3 màn 9; che-bung-nhen.9 trùng .8) |
| 10 Tổng hợp | Chưa đạt (trùm mùa không kiểm Python / part của mùa; and / or và chuỗi không được ôn rõ) |

## Đề xuất sửa ưu tiên (8)

1. trum-mua-3.10 (Trùm mùa): làm lại để kiểm lõi mùa 3: ba sân, xe nam châm + cảm biến từ, `p = front_pole()` + if / elif / else, while có and / or, đệm từ phải chọn cực theo cực đọc được (đúng ý bảng 7 mùa). Màn đội hiện tại lùi về vị trí 8 hoặc 9. Cho thêm 2 tới 3 màn trum-mua-3 nhiều sân để không viết cứng được.
2. tong-hop-3.8 và một màn mới ở tong-hop-3: bắt viết and / or trong chương trình chính (không qua seek_safe), và một màn ôn chuỗi làm dữ liệu của gói 1 (biến chuỗi + `for c in path`, ví dụ nhện đi theo chuỗi lưu trong biến qua hố).
3. Gói 7: đổi trùm doc-cuc thành bản nâng của doc-cuc.8 (ba sân, đọc p, ba nhánh, có while), dời nam-cham.10 lên màn 8. Ở che-doc-cuc thay che-nam-cham.9 "Đường về" và che-nam-cham.3 "Dọn đường" bằng màn dùng sort_drop(p) cho cả vật sắt (thêm nhánh elif) để mạch sort_drop → sort → trùm liền.
   Thêm part `{ ma: 'tu', o: 'hong' }` vào robot các màn cũ dùng front_pole (nam-cham.6, nam-cham.10, che-nam-cham.2 tới .10).
4. Gói 2: logic-nam-cham.4 thành màn trình diễn `or` (chiChay) hoặc chèn một màn trình diễn or trước nó; viết lại trùm logic-nam-cham.8 cho khác logic-nam-cham.5 (ví dụ to_turn() rồi bám tường bằng or rồi kick(), hoặc and và or cùng lúc); chuyển che-nam-cham.8 "Chỉ còn cực N" sang che-dao-cuc (gói 6, khi đã có cực S).
5. Gói 4 bai-tu: tách bai-tu.4 và .5 thành mỗi màn một luật (nút bật trước, đệm kéo vật sau; nút tắt trước, vật bị giữ sau) và chèn một màn trước trùm để ô đi 15 → khoảng 20 → 27. Cân nhắc một màn che-bai-tu dùng front_metal hoặc and để gói có Python mùa 3.
6. Gói 5: nhen.6 dùng lại trail(path) của gói 1 thay vì tạo walk(path) trùng thân (hoặc đổi đề thành bài "đặt tên mới cho hàm cũ"); rút trùm nhen.10 xuống khoảng 35 tới 40 nhịp hoặc đặt một màn khoảng 40 nhịp ở vị trí 9.
7. Gói 6: thay nam-cham.3 (lặp lời giới thiệu) bằng màn mới hoặc đưa nó thành màn ôn ở hàng biến thể; đổi chỗ dao-cuc.7 và che-dao-cuc.7 (màn dễ nhất chương) lên hàng luyện để màn 9 dẫn vào trùm.
8. Gói 9: thay che-bung-nhen.9 (trùng lời giải che-bung-nhen.8) bằng màn nối Python A, ví dụ `for p in "NS": hook_for(p) ...`; chèn bậc trung gian hoặc cắt bớt bung-nhen.10 và che-bung-nhen.10 để trùm không gấp 2 đến 3 lần màn 9.

Ghi nhận thêm (không ưu tiên): doi-xich.15 nhảy 22 → 40 ô vì thêm cùng lúc chuyền hộp và đếm nhịp, có thể tách; mùa 3 trong thu-tu-chuong.js của worktree này vẫn tên "Công cụ" trong khi ghi chú trao đổi nói "Mỏ quặng" (worktree có thể chậm hơn main).
