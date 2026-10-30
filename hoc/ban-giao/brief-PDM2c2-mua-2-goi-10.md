# Brief PDM2c2: mùa 2 gói 10 "Xe cứu hỏa R1 xuất xưởng" chạy một mình, nhiều sân

**NHỊP: commit đầu tiên trong ~20 phút; tối đa 40 phút phải có commit; mỗi 3–4 màn một commit.**

LOẠI: Ship          MODEL: fable

MỤC TIÊU: xong khi 20 màn gói 10 mùa 2 (tong-hop-2, trum-mua-2) đều MỘT robot (xe cứu hỏa đầy đủ), 2–3 sân, một chương trình tổng quát thắng 3 sao mọi sân, một lời viết cứng
thua ở ít nhất một sân; không còn beSung, không còn CAP_HAM_CU / capCu; 'mua-2' vào XONG của `hoc/kiem-part-mua.mjs` mà máy kiểm ĐẠT; `npm test` cả bộ ĐẠT hết.

QUYẾT ĐỊNH CỦA NGƯỜI GIAO (phương án B của PDM2c): giữ khung "Dập lửa" (lửa cfg.lua + van + cửa + thùng nặng) của gói 10, mỗi màn thành 2–3 sân ("ngày làm việc":
lửa / van / thùng ở chỗ khác); bỏ cfg.beSung và mọi hàm của Bệ vòi xích (go_spray, spray_left, valve_left, valve_on, valve_row, visit, push_spray…): dùng hàm mùa 2 đã dạy
(squirt_left, auto_spray, put_out…) hay hàm của màn mới; ba màn đội (tong-hop-2.8, .9, trum-mua-2.5) thành màn MỘT robot giữ mã. Sau đó xoá CAP_HAM_CU và phần bỏ qua capCu
ở các máy kiểm nếu không còn cần. Bệ vòi xích (đã cất) giữ nguyên trong ngân hàng, phim be-sung giữ (chưa xoá).

BỐI CẢNH: `hoc/ban-giao/brief-PDM2c-mua-2-goi-9-10.md` (mục gói 10), sổ `hoc/ban-giao/can-trao-doi-part-dung-mua.md` mục 7–9, git log từ 5e2d407; mẫu nhiều sân đã làm ở mùa 1
(PDM1: kiem-lo-trinh GOI_NHIEU_SAN; nhịp màn thường theo sân dài nhất, trùm theo tổng). kiem-trum-mua-2 hiện đỏ 1 mục (tong-hop-2.1 "thêm 2 điều mới: lua, be sung"): đổi
trông đợi recall theo gói 8 Góc kho cũ và gói 9 Đội mới. Lời mùa 2 không chữ vũ khí.

CÁCH GIAO, PHẢN BIỆN, KIỂM TRA, DỪNG VÀ HỎI, BÁO CÁO CUỐI: như brief PDM2a (làm thẳng trên nhánh claude/part-dung-mua; không đổi nhánh, không checkout/reset/stash).
`npm test` cả bộ ĐƯỢC chạy (nền, ghi ra tệp) ở lần cuối; báo cáo ghi dòng kết quả nguyên văn.
