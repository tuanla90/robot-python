NHỊP LÀM VIỆC (đọc trước tiên): commit đầu tiên trong ~20 phút (lõi 4 hướng + ca kiểm), tối đa 40 phút phải có commit mới; mỗi gói màn một commit. CHẠY MÁY KIỂM Ở TIỀN CẢNH với `timeout 300 node …`, KHÔNG chạy nền rồi ngồi chờ (agent trước treo đúng kiểu đó). CẤM kiểm kê toàn bộ 200 màn trước khi sửa dòng đầu tiên: sửa lõi trước, rồi để máy kiểm chỉ ra màn nào gãy. Hết sức thì dừng và báo còn gì — thà 6 gói làm đúng còn hơn 10 gói không commit. Vướng câu hỏi mà tự quyết có thể sai hướng → DỪNG, commit WIP, trả về CÂU HỎI CẦN LÀM RÕ.

LOẠI: Ship          MODEL: fable (điểm: quy mô 2, choke 2 (lõi san-hoc + vẽ san-ve), giá sai 1, mơ hồ 1, suy luận 1 = 7)

MỤC TIÊU: xong khi cần cẩu (loaiRobot 'cau', mùa 4 Cảng sông + màn cẩu mùa 9) chỉ còn 4 hướng — `nac` 0–3 (0 lên, 1 phải, 2 xuống, 3 trái), `swing_left()` / `swing_right()` quay 90° — và cả 200 màn mùa 4 cùng mọi màn cẩu mùa 9 có lời giải thắng, máy kiểm xanh, hình vẽ cần đúng 4 hướng.

BỐI CẢNH:
- Kế hoạch: hoc/KE-HOACH-GHEP-NHIP.md mục 3e (đọc kỹ) — user chốt 13/11: "nên … chỉ quay 4 hướng thay vì cả chéo để đảm bảo độ dài của cẩu ko đổi và các câu xoay xa giải quyết được". Đổi hẳn (mùa 4 đang ẩn), KHÔNG giữ đường 8 nấc song song.
- Lõi: hoc/san-hoc.js NAC_VEC / SO_NAC (:696–697), tài liệu đầu tệp (:64, :466–482), kiểm batDau.nac (:1115, :1319–1322), bongMo.nac (:1451–1455, :2136), swing (:3647–3662), :3751, oDauCan (:1983).
- Vẽ: hoc/game/ve-vector-than-cau.js (NAC_CAU, veCanCau :131), hoc/game/san-ve.js (vis.cau :654, :960–962, :997 `% 8`, :1342, tween quay :2770, :2836), hoc/game/phim-mua-cang.js (26 chỗ nac). Cách gọn gợi ý: lõi 0–3, hình đổi góc theo 90° (hoặc nhân 2 vào hệ góc 8 nấc của hình) — tự chọn, miễn quay hiện đúng và nội suy quay vòng 3 → 0 không quay ngược cả vòng.
- Đã đo 13/11: móc / hạ ở nấc chéo trong 41 màn (gói 2: 12, gói 3: 14, gói 4: 13, gói 7: 2) → SỬA SÂN (dời container / boong / tàu lên ô chữ thập của bệ, giữ ý bài). Gói 5, 6, 8, 9, 10 và màn cẩu mùa 9 chỉ quay QUA nấc chéo → lời giải bớt lệnh quay.
- hoc/man-moc-cau.js dạy `(b - a) % 8` (T_TURN_CW :56, màn :448–458, :521–542): đổi sang vòng 4 hướng `% 4` (lời đề, maMau, loiGiai, loiSai, goiY, hàm em turn_cw). Bài Python `%` với số âm giữ nguyên ý: (1 - 3) % 4 = 2.
- Tầm với gói 1–4: bệ đứng yên chỉ với 12 ô chữ thập (nay 24). Nếu có lời dạy / gợi ý nói "8 hướng" / "nấc chéo" thì sửa; ở đầu gói 5 (ray) thêm một câu lý do: "ô chéo cần không với tới, bệ phải chạy" nếu chỗ hợp.
- Mùa 4 tệp màn: hoc/man-can-cau.js man-moc-cau.js man-quet-ma.js man-ben-tau.js man-duong-ray.js man-can-tai.js man-cang-cu.js man-nhac-doi.js man-doi-cang.js man-trum-mua-cang.js man-cuu-cang-song.js. Mùa 9 có cẩu: man-cuu-clb.js, man-ngay-hoi-clb.js (và màn lap-* nào có loaiRobot 'cau' — grep).
- Node phải đi qua hoc/lo-trinh-hoc.js (lộ trình xuất bản), không require man-*.js thô.

PHẠM VI: được sửa hoc/san-hoc.js (CHỈ phần cần cẩu: NAC_VEC, SO_NAC, kiểm nac, tài liệu đầu tệp phần cẩu), hoc/cham.js (chỉ câu chẩn đoán nhắc "nấc 0–7" nếu có), các tệp vẽ cẩu nói trên, các tệp màn cẩu mùa 4 / mùa 9 nói trên, hoc/lo-trinh-sao.js (ngưỡng sao màn cẩu, SỬA TAY), máy kiểm cẩu (kiem-mua-cang, kiem-man-mua-cang, kiem-ve-mua-song-cang, kiem-cau-do-mua-9, kiem-lai-mua-9: đổi ca 8 nấc sang 4 hướng, thêm ca mới cho 4 hướng; KHÔNG nới tiêu chí). KHÔNG sửa: các loại robot khác, mùa khác, gộp nhịp cần gạt đôi (3a — gói sau F2 làm, đừng làm trước), chongLuat / hàng tàu.

CÁCH GIAO: nhánh claude/mua-4-cau-4-huong trong worktree riêng (từ main). Commit từng bước. KHÔNG push, KHÔNG merge main. KHÔNG dùng `git checkout -- <tệp>` / `git reset --hard` / `git stash` (từng mất việc chưa commit); so với gốc bằng `git show main:<tệp> > <scratchpad>/...`.

PHẢN BIỆN (bắt buộc): brief là phán đoán từ bên ngoài, viết trong ít phút; bạn ở trong code sâu hơn. Được và nên nói ngược brief (con số 41 màn sai, cách đơn giản hơn, lỗ bỏ sót). Kiểm lại từng khẳng định trong brief bằng code, đừng tin. Bất đồng CHẶN → dừng, commit WIP, báo ngay. Không chặn → làm theo, ghi vào CÂU HỎI CẦN LÀM RÕ kèm lý do. Quyết định của USER (không tự đi ngược): cẩu 4 hướng, đổi hẳn; khuôn 10 gói × 2 chương × 10 màn; mỗi lệnh cẩu vẫn một nhịp ở gói 1–4.

LUẬT NỘI DUNG khi sửa sân / lời giải: giữ ý bài và vị trí màn trong đường cong độ khó (1–3 làm quen / 4–6 luyện / 7–9 biến thể / 10 trùm); không nhảy vọt độ dài lời giải; màn ép vẫn phải ép (loiSai vẫn thua). Lời Việt cho trẻ: câu ngắn, mỗi câu một việc; nhân vật Sola / Luna. KHÔNG chạy `tools/do-lo-trinh.mjs --ghi-sao` — sửa tay ngưỡng sao.

KIỂM TRA — chạy TIỀN CẢNH, tuần tự, `timeout 300`, ghi ra tệp rồi đọc; sau mỗi nhóm commit. CẤM `npm test` cả bộ, cấm chạy song song. Nền ở main (người giao đã chạy):
  timeout 300 node hoc/kiem-mua-cang.mjs          → "ĐẠT 126 · HỎNG 0"
  timeout 300 node hoc/kiem-man-mua-cang.mjs      → "ĐẠT 200/200 màn mùa cảng sông."
  timeout 300 node hoc/kiem-ve-mua-song-cang.mjs  → "ĐẠT 35 · HỎNG 0"
  timeout 300 node hoc/kiem-cau-do-mua-9.mjs      → "ĐẠT 27 · HỎNG 0"
  timeout 300 node hoc/kiem-lai-mua-9.mjs         → "ĐẠT 170 · HỎNG 0"
  timeout 300 node hoc/kiem-loi-giai.mjs          → "ĐẠT 67/67"
  timeout 300 node hoc/kiem-hoc.mjs               → "ĐẠT 6713 · HỎNG 0" (~60 s)
  timeout 300 node tools/do-ghep-nhip.mjs         → (chỉ để biết, gói này chưa cần tăng)
  Ngoài ra: grep -rln "loaiRobot: *'cau'\|than: *'cau'" hoc/ để chắc không sót màn cẩu nào; nếu có máy kiểm khác chạm cẩu (grep "'cau'" hoc/kiem-*.mjs tools/*.mjs) thì chạy cả nó.
  NỀN ĐỎ SẴN (chỉ báo nếu có lỗi KHÁC): hoc/kiem-lo-trinh.mjs (AssertionError thứ tự gói mùa 1 'combo' / 'hai-robot'); hoc/kiem-ve-vector.mjs (HỎNG 1/101 mục 13a-v).

DỪNG VÀ HỎI KHI: phải sửa phần lõi không phải cẩu; một màn không thể giữ ý bài trong 4 hướng (ghi lại, đề xuất cách, làm tiếp màn khác); phạm vi phình sang mùa khác.

BÁO CÁO CUỐI — đủ 5 mục, mục nào trống ghi "không có":
  1. KẾT QUẢ: nhánh + SHA từng commit, tệp đổi, bảng màn đổi sân (mã · đổi gì), số màn chỉ bớt lệnh quay, lệnh kiểm + dòng kết quả nguyên văn, việc dở.
  2. CÂU HỎI CẦN LÀM RÕ: còn mở; đã tự quyết (thế nào, vì sao, đảo lại được không); chỗ brief sai/thừa/thiếu (ghi "brief không có chỗ nào sai" nếu thật vậy).
  3. ĐỀ XUẤT: mỗi mục cần user quyết: vấn đề → bảng phương án (mỗi cột một phương án, có "để nguyên"; hàng: làm gì · mất bao lâu · ảnh hưởng · người chơi thấy khác gì · lợi ích · rủi ro) → nghiêng về đâu.
  4. PHẦN CHO NGƯỜI KINH DOANH: 5–8 câu không thuật ngữ.
  5. RỦI RO CÒN LẠI: điều chưa kiểm được (vd hình trên trình duyệt) và cách kiểm.
