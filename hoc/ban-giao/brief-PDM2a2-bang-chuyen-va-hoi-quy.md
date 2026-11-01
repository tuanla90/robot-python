# Brief PDM2a2: mùa 2 gói 4 chương băng chuyền (thùng trên băng) + sửa hồi quy của PDM2a

**NHỊP (đọc trước): commit đầu tiên trong ~20 phút; tối đa 40 phút phải có commit. Làm phần A (hồi quy) TRƯỚC, commit, rồi phần B.**

LOẠI: Ship          MODEL: opus (điểm: quy mô 2, choke 1, giá sai 1, mơ hồ 1, suy luận 1 = 6)

MỤC TIÊU: xong khi (A) năm máy kiểm hỏng do PDM2a ĐẠT lại, và (B) chương `bang-chuyen` (gói 4 mùa 2) 10 màn trên xe cứu hỏa,
`node hoc/kiem-part-mua.mjs --chi-tiet` không còn dòng mùa 2 nào của gói 1–4.

BỐI CẢNH: đọc `hoc/ban-giao/brief-PDM2a-mua-2-goi-1-4.md` (bối cảnh mùa 2, luật học, cách làm, kiểm tra). PDM2a đã làm 70/80 màn gói 1–4 (git log 5e2d407..bcfdf57).
Người giao đã chạy `npm test` cả bộ sau PDM2a và tự sửa phần do mình (commit 6010d10). Còn 5 bộ hỏng, đều là HỒI QUY của PDM2a (tại 817f81d chúng ĐẠT):
- `hoc/kiem-doi-nam-cham.mjs` HỎNG 5: doi-nam-cham.4 / .10, che-doi-nam-cham.1 / .10 lời sai "chờ mãi" giờ ra vong-vo-han thay vì qua-nhieu-nhip;
  doi-nam-cham.7 lời sai #3 gọi fetch_back (PDM2a bỏ màn dạy fetch_back) → ham-chua-co.
- `hoc/kiem-doi-omni.mjs` HỎNG 1: che-doi-omni.9 → ham-chua-co.
- `hoc/kiem-goi-doi.mjs` HỎNG 1: "hàm của màn không trùng tên hàm của em" → che-doi-nam-cham.11 step, che-doi-nam-cham.12 step (PDM2a tạo hàm của em `step`?).
- `hoc/kiem-man-mua-4.mjs` HỎNG 2: che-doi-nam-cham.11 / .12 chẩn đoán ham-man-che-ham-em (cùng gốc `step`).
- `hoc/kiem-may-son.mjs` HỎNG 1: che-may-son.8 chẩn đoán ham-man-che-ham-em.
Cách sửa ưu tiên: đổi TÊN hàm của em mới của mùa 2 cho khỏi trùng hàm của màn mùa sau (giữ được nghĩa), hoặc cấp bản cũ làm hàm của màn cho lời sai của màn mùa sau
(như PDM2a đã làm cho màn ẩn). Không đổi ý màn mùa 3, 4 (sắp dựng lại). Tự tìm nguyên nhân vong-vo-han, đừng đoán.

PHẦN B — chương bang-chuyen (gói 4 "Băng chuyền", chương 1, 10 màn, mã bang-chuyen.1–10 giữ):
- LÕI MỚI (6010d10): `man.thungThem = [{ x, y }]` đặt thùng nặng ở bất kỳ ô sàn nào, KỂ CẢ ô băng chuyền (> < ^ v); màn nhiều sân thì mảng song song với man.san.
  Băng chuyền đẩy thùng nằm trên nó đủ 2 nhịp liên tiếp (luật san-hoc.js); băng KHÔNG đẩy xích. Van (nút N) bật / tắt băng (cfg.noi nhóm băng).
- Ý chương (tên chương đổi theo quy tắc tên): băng chở thùng tới ô đích; xích bám chắc đi ngang / ngược băng mà không trôi; phun van bật tắt băng cho thùng dừng đúng chỗ
  hay đi tiếp. Gói 4 chưa có xichDay (gói 5) và chưa có phun mạnh (gói 6): xe chỉ điều khiển băng qua van, đứng chắn / tránh đường thùng (thùng không vào ô có xe).
  Mục tiêu 'day-thung' (mọi thùng nặng nằm trên ô đích). Màn 1 trình diễn (chiChay), màn 2 ép khối mới, màn 10 trùm (huy hiệu như trùm chương cũ).
- Soát trên giao diện: nếu `node hoc/kiem-ve-vector.mjs` / kiem-bang-chuyen báo gì về vẽ thùng trên băng thì báo lại (không sửa hoc/game/ ngoài phạm vi nhỏ).

PHẢN BIỆN, CÁCH GIAO, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: y như brief PDM2a (làm thẳng trên nhánh claude/part-dung-mua; KHÔNG npm test cả bộ;
không chạy `tools/do-lo-trinh.mjs --ghi-sao`). Kiểm thêm năm máy kiểm hồi quy ở trên + kiem-bang-chuyen, kiem-lo-trinh (+ --loi-gia-mua-2), kiem-part-mua, kiem-lach-mua-2.
