# Brief P1 mùa 3: lõi mới (đệm từ thật, nam châm bụng nhện, xe rơi hố, cảm biến từ là part riêng)

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 2 (hoc/san-hoc.js + hoc/cham.js + bộ vẽ sân dùng chung), giá sai 1 (vỡ màn cũ), mơ hồ 1, suy luận 2 = 8)

## NHỊP (đọc trước tiên)
- Commit đầu tiên trong ~20 phút: việc 1 (đưa lõi đệm từ của bản thử vào nhánh + luật nhảy / bay miễn) là commit đầu.
- Mỗi việc một commit (kèm máy kiểm của việc đó xanh). Tối đa 40 phút phải có commit.
- CẤM khảo sát toàn bộ lõi trước khi viết dòng đầu tiên. Hết sức thì dừng và báo còn gì: thà 2 việc đúng còn hơn 4 việc không commit.
- Vướng câu hỏi mà tự quyết có thể sai hướng: DỪNG, commit WIP, ghi vào CÂU HỎI CẦN LÀM RÕ.

## MỤC TIÊU
Xong khi lõi (san-hoc.js / cham.js), hình vector và máy kiểm có đủ những thứ màn mùa 3 (P2) cần, mỗi thứ có máy kiểm tự chứng minh bắt lỗi (lỗi giả đỏ):
1. ĐỆM TỪ thật (từ bản thử, đổi luật nhảy / bay theo user).
2. NAM CHÂM BỤNG NHỆN (gói 9).
3. XE RƠI HỐ (hố hiện chỉ cho nhện; đệm kéo xe vào hố phải có kết quả rõ).
4. CẢM BIẾN TỪ là part riêng (front_metal / front_pole), tên hiển thị "Cảm biến từ".
Và một ĐỀ XUẤT (không làm) cho "nam châm điện".

## BỐI CẢNH
Đọc trước: `hoc/KE-HOACH-MUA-3.md` (mục 1 rà lõi, mục 2 mười gói, mục 4 câu hỏi), `hoc/ban-giao/brief-dem-tu-thu.md` (luật bản thử), báo cáo bản thử nếu có trên nhánh `claude/dem-tu-thu` (`hoc/ban-giao/bao-cao-dem-tu-thu.md`).
QUYẾT ĐỊNH CỦA USER (29/10, nguyên văn):
- Đệm từ, sau khi chơi bản thử: "cho tôi nhảy và bay k bị hút. chiều kg cao hơn" (người giao hiểu: nhện đang NHẢY và drone đang BAY ở trên cao nên đệm KHÔNG hút / đẩy; robot trên mặt đất như bản thử. Nếu code cho thấy cách hiểu khác hợp lý hơn, ghi vào câu hỏi).
- "thân robot để nhện đi. cua chỉ là chân nhện kết hợp tay nam châm thì trông giống con nhện thôi": mùa 3 dùng thân nhện, KHÔNG vẽ thân cua.
- "còn tên thì đổi thành cảm biến từ": part / gói 3 tên "Cảm biến từ" (đổi tên GÓI trong lo-trinh-hoc.js do phiên "Kế hoạch mùa 2" làm; bạn chỉ lo tên part).
- Gói 9 Combo: "nam châm bụng nhện" (KE-HOACH-MUA-3 mục 4.1): nhện hút / thả vật sắt ở ô ngay dưới, mang theo khi đi và khi nhảy hố.
- Show don't tell (memory user): mọi khối mới có màn trình diễn `chiChay` trước màn ép; cờ `chiChay` / `damLaThua` đã có trên main.

## VIỆC (thứ tự)
### 1. Đệm từ vào nhánh (lấy từ `claude/dem-tu-thu`, đừng viết lại)
- Nhánh bản thử có 4 commit trên nền cũ (san-hoc.js, cham.js, san-ve.js, ve-vector-o2.js, man-dem-tu-thu.js, kiem-dem-tu.mjs, lo-trinh-hoc.js đăng ký gói thử, choi.html). Gộp / cherry-pick phần LÕI + HÌNH + MÁY KIỂM vào nhánh này; giải xung đột với main (main đã có HD1–3, gói T mùa 2, khung mùa 3).
- Gói "Thử đệm từ" của bản thử: giữ làm màn thử (ẩn) hay bỏ: tự chọn, nói lý do; màn thật của đệm từ làm ở P2 gói 4.
- Đổi luật: nhện trong nhịp nhảy (jump / nhảy hố, kể cả đang bay qua hố) và drone (mọi lúc trên không) KHÔNG bị đệm tác động. Ghi luật đầy đủ vào chú thích đầu san-hoc.js (phần ĐỆM TỪ) và cham.js; thêm ca vào kiem-dem-tu.mjs (nhện nhảy ngang đệm không bị dời; nhện đi bộ ngang đệm bị dời; drone không bị dời), có lỗi giả.
### 2. Nam châm bụng nhện
- Gỡ luật cấm "nhện KHÔNG gắn nam châm" chỉ cho ổ BỤNG (ổ `duoi`, như cách drone treo nam châm dưới bụng: đọc phần DRONE nam châm của san-hoc.js / cham.js và tay drone). Nhện vẫn không gắn nam châm ở mũi.
- Lệnh: dùng lại magnet_n / magnet_s / magnet_off (hút / thả vật sắt ở ô ngay dưới nhện; cực nào cũng hút sắt như drone); vật dính đi theo khi go_* và khi nhảy hố; thả trên hố thì tự chọn luật hợp lý (vd vật rơi mất), nói lý do.
- Với đệm từ: nhện có nam châm bụng đang bật thì chọn hút / đẩy theo cực như xe (luật bản thử); đang nhảy thì miễn (việc 1).
- Hình vector: nam châm bụng nhện (theo hệ ve-vector-than-nhen.js / tay nam châm sẵn có; thân nhện KHÔNG đổi hình), vật sắt dính dưới bụng. Thẻ bộ phận (gioi-thieu-part.js) + chữ (chu.js).
- Máy kiểm lõi + vẽ (mở rộng kiem-nhen.mjs / kiem-nam-cham.mjs hoặc tệp mới), có lỗi giả.
### 3. Xe rơi hố
- Hố hiện chỉ có nghĩa với nhện. Cho xe (hai bánh, xích, omni) đi / bị đệm kéo / bị đẩy vào ô hố: xe rơi, chương trình dừng, sân không thắng, lời chẩn đoán tiếng Việt rõ ("xe rơi xuống hố ở ô ..."), hoạt cảnh rơi (dùng lại hoạt cảnh nhện rơi nếu có). Màn cũ có hố + xe (nếu có) phải giữ kết quả cũ: kiểm bằng máy kiểm hiện có, liệt kê màn bị ảnh hưởng; có màn đổi kết quả thì DỪNG và hỏi.
### 4. Cảm biến từ là part riêng
- Hiện front_metal / front_pole đi kèm cảm biến khoảng cách khi có tay nam châm (cham.js đầu tệp, phần NAM CHÂM). Mùa 3 cần cảm biến từ là bộ phận riêng (gói 3) có thẻ bộ phận "Cảm biến từ" và hình riêng; kiểm `gioi-thieu-part.js` mã 'tu' đã có gì. Màn cũ dùng front_metal / front_pole không được đổi kết quả.
### 5. Đề xuất "nam châm điện" (KHÔNG làm, chỉ đề xuất)
KE-HOACH-7-MUA ghi vật mùa 3 là "sắt + nam châm (nam châm điện)", gói 4 "Bãi từ". Chưa ai định nghĩa. Đề xuất 2–3 cách (vd vật nam châm bật / tắt theo nút đè, theo nhịp, hay khi robot chạm), bảng phương án theo khung ở BÁO CÁO mục 3, kèm cách nó phối với đệm từ và hố.

## PHẠM VI
Được sửa: `hoc/san-hoc.js`, `hoc/cham.js` (chỉ cộng thêm luật / lời; màn cũ giữ kết quả), `hoc/game/san-ve.js` (hoạt cảnh đệm / rơi hố / vật dưới bụng), `hoc/game/ve-vector-*.js` (hình mới: ô đệm, nam châm bụng nhện, cảm biến từ; KHÔNG đổi hình thân nhện / tay kẹp), `hoc/game/bang-mau.js` (chỉ THÊM vai), `hoc/gioi-thieu-part.js`, `hoc/game/chu.js`, `hoc/game/choi.html` (thẻ script), máy kiểm `hoc/kiem-*.mjs`, `hoc/man-dem-tu-thu.js` (bản thử).
KHÔNG sửa: lõi Python `nhan/`; dữ liệu màn mùa 1 / 2; khối MÙA 1 / MÙA 2 / khối đặt tên trong `hoc/lo-trinh-hoc.js` (phiên "Kế hoạch mùa 2" đang chèn khối đặt tên trước dòng "// Ngưỡng sao được đo offline" và sửa `hoc/thu-tu-chuong.js`, `hoc/game/chu.js` md.3 / md.6: bạn chỉ THÊM dòng của mình, CẤM định dạng lại tệp); màn mới mùa 3 (để P2).

## CÁCH GIAO
Worktree riêng đã dựng: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\p1-loi-mua-3`, nhánh `claude/p1-loi-mua-3` (từ main 0478170 + commit brief này). Làm mọi lệnh trong worktree đó.
Commit từng bước, message tiếng Việt. KHÔNG push, KHÔNG merge vào main, KHÔNG đụng nhánh / worktree khác (gộp TỪ `claude/dem-tu-thu` vào nhánh của bạn thì được). Bạn là agent duy nhất lúc này.

## PHẢN BIỆN (bắt buộc đọc)
Brief là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Kiểm lại từng khẳng định trong brief bằng code, đừng tin. Được phép và được khuyến khích nói ngược lại (bằng chứng đọc sai, cách đơn giản hơn, việc thừa, lỗ bị sót).
Bất đồng chặn đường: dừng, commit WIP, báo ngay. Bất đồng không chặn: làm theo rồi ghi vào CÂU HỎI CẦN LÀM RÕ.
Không tự đi ngược quyết định của user (mục BỐI CẢNH), đồ hoạ vector, màu đội R1 #38BDF8 / R2 #F472B6, chữ hiển thị không emoji, không gạch dài (em dash). Nút chỉ có icon có title + aria-label, vùng chạm ≥ 24 px.

## KIỂM TRA (máy yếu RAM)
- CẤM `npm test` cả bộ (người giao chạy sau khi gộp). Chạy từng máy kiểm, tuần tự, sau mỗi việc:
  `node hoc/kiem-dem-tu.mjs` (và `--loi-gia`), `node hoc/kiem-nhen.mjs`, `node hoc/kiem-che-nhen.mjs`, `node hoc/kiem-nam-cham.mjs`, `node hoc/kiem-che-nam-cham.mjs`, `node hoc/kiem-drone.mjs`, `node hoc/kiem-che-drone.mjs`,
  `node hoc/kiem-bang-chuyen.mjs`, `node hoc/kiem-nut-bat-san.mjs`, `node hoc/kiem-loi-mua-2.mjs`, `node hoc/kiem-gioi-thieu-part.mjs`, `node hoc/kiem-lo-trinh.mjs`, `node hoc/kiem-hoc.mjs`, `node hoc/kiem-ve-vector.mjs`, `node hoc/kiem-bang-mau.mjs`, `node nhan/kiem-core-san-robot.mjs`,
  và máy kiểm có tên chương / lệnh bạn đụng (`grep -l "front_metal\|ho\b\|nhen\|nam-cham" hoc/kiem-*.mjs`). Máy kiểm đỏ: chạy lại ĐÚNG máy đó ở main để tách đỏ sẵn khỏi đỏ mới; ghi cả hai.
- Phanh so hình (13a-v trong kiem-ve-vector, A3-v / B5-v trong kiem-huy-hieu-phim-vector, C3-v trong kiem-nut-mo-dau-phim-vector) so với `NEN_VEC`. Thêm hình MỚI không được làm đỏ hình cũ; nếu đỏ vì bạn cố ý đổi hình cũ: commit vẽ, CHỨNG MINH chỗ đỏ chỉ do tệp của bạn (tạm hoàn riêng các tệp vẽ về 0478170, chạy lại phanh, phải xanh, khôi phục), rồi dời `const NEN_VEC` ở cả ba tệp sang SHA commit vẽ, commit riêng, ghi vào báo cáo.
- Xem bằng mắt: server cổng KHÁC 4181 và 4186 (vd `PORT=4197 node server.mjs` chạy nền); `GoLoi.datMoHet(true)`; xem đệm từ (xe bị hút / đẩy, nhện nhảy qua không bị hút), nhện nam châm bụng nhặt / mang / thả, xe rơi hố. Dựng sân thử bằng màn thử hoặc Xưởng nếu chưa có màn. TẮT server trước khi kết thúc.

## DỪNG VÀ HỎI KHI
Màn cũ (mùa 1–3 đang có) đổi kết quả; phải đổi lõi Python `nhan/`; phải đổi hình thân nhện / tay kẹp; luật nhảy / bay miễn đệm mâu thuẫn với màn bản thử mà user đã chơi.

## BÁO CÁO CUỐI (ghi `hoc/ban-giao/bao-cao-P1-loi-mua-3.md`, commit; tóm tắt trong câu trả lời cuối)
1. KẾT QUẢ: nhánh + SHA từng commit, luật đã chốt từng chi tiết (đệm từ, nam châm bụng, rơi hố, cảm biến từ), tệp đổi, lệnh kiểm + kết quả nguyên văn, việc dở.
2. CÂU HỎI CẦN LÀM RÕ (kể cả chỗ brief sai / thừa / thiếu; "brief không có chỗ nào sai" nếu thật vậy).
3. ĐỀ XUẤT cần user quyết (nam châm điện + mọi chỗ khác): vấn đề (cơ chế thật, file:dòng), bảng phương án (mỗi cột một phương án, có "để nguyên" nếu hợp; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi · rủi ro), ưu tiên và nghiêng về đâu.
4. PHẦN CHO NGƯỜI KINH DOANH: 5 – 8 câu không thuật ngữ.
5. RỦI RO CÒN LẠI và cách kiểm.
