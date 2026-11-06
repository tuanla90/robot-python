# diem10code-python

Game dạy Python bằng robot, tách từ [doi-robot-chan-hung](../doi-robot-chan-hung) ngày 5/11 theo
yêu cầu: lớp 12 ôn thi đại học không cần `tuple`, `dict`/`set`, mảng 2 chiều — những ý đó (mùa
Bến sông, Mỏ đá, Hang động của bản gốc) bị cắt hẳn. Trang tĩnh, không cần build.

```bash
npm start   # http://localhost:4180
```

## Đã mang sang (cơ chế, không mang màn)

- Lõi chạy code + vật lý sân + chấm bài: `nhan/san-robot-core.js`, `hoc/san-hoc.js`, `hoc/cham.js`,
  `hoc/khung-code.js`, `hoc/kho-ham.js`.
- Khay lệnh, giới thiệu bộ phận, lắp ráp: `hoc/so-lenh.js`, `hoc/gioi-thieu-part.js`,
  `hoc/bang-ghep.js`, `hoc/co-may.js`, `hoc/lap-rap.js`.
- Toàn bộ giao diện chơi + vẽ vector robot/vật/sân: `hoc/game/*` (đã bỏ phim giới thiệu / phim mùa
  cũ — xem mục "Đã bỏ" dưới).
- Sổ màn (khung đăng ký, KHÔNG kèm nội dung): `hoc/man-co-so.js` (tách từ `man-chuoi-1.js` bản gốc).

## Mùa cốt lõi giữ lại

| Mùa | Thân | Ý Python |
|---|---|---|
| 1 Kho hàng | Hai bánh | `def`, `for`, `if`/`while` |
| 2 Bãi tái chế | Nhện | chuỗi, logic `and`/`or`/`elif` |
| 3 Bến sông | Xuồng | biến, tham số |
| 4 Nông trại | Drone | `list`, `for x in a`, `append` |

**Cả 4 mùa đã có đủ 32 màn mỗi mùa, tổng 128 màn,** theo khuôn 4 cột × 8 hàng (`hoc/KE-HOACH-4-MUA-COT-LOI.md`, `hoc/man-m1-*.js` … `hoc/man-m4-*.js`; kiểm bằng
`node hoc/kiem-khuon.mjs`).

## Việc còn lại (xem KE-HOACH-7-MUA.md ở bản gốc để tra cứu cơ chế mùa cũ)

1. **Cảng sông (cần cẩu)**: chưa đưa vào — cần cẩu dùng toạ độ cực (`batDau.nac`, `tam`) khác hẳn
   lưới `x,y` của các thân khác (xem `hoc/san-hoc.js` phần CẢNG SÔNG) và màn gốc dùng luật
   "bóng mờ" (`mucTieu: 'bong-mo'`) + xếp container — cần thiết kế lại luật thắng trước khi viết
   màn, không copy máy móc từ bản gốc. Số âm/`abs()`/`%`/`//` quan trọng cho đề thi nên mùa này nên
   làm sớm.
2. **Mùa Tổng kết**: chưa thiết kế (bản gốc gộp cả 8 nơi + lắp robot tổ hợp — quá rộng so với 4–5
   mùa cốt lõi ở đây; cần làm lại bố cục).
3. **Độ khó thao tác nhập lệnh** (user phản ánh 5/11): đây là lý do chính khiến game "khó" hiện
   nay, nhiều hơn tư duy giải màn. Trước khi viết màn mới, nên khảo sát lại UI nhập lệnh
   (`hoc/game/man-choi.js`, `hoc/game/man-so-lenh.js`, khay lệnh kéo-thả/gõ tay) — sửa thao tác
   trước, rồi thiết kế màn mới sẽ đỡ phải vá lại nhiều lần.
5. **Icon mùa / world-map nền** bị thiếu (đã bỏ `phim-clb` ảnh nặng ~1.7 GB của bản gốc) — cosmetic,
   không chặn chơi, cần ảnh nền mới hoặc đổi màn hình chọn mùa sang kiểu đơn giản hơn.

## Đã bỏ khỏi bản gốc (cố ý)

- Toàn bộ 142 tệp `hoc/man-*.js` (≈1128+ màn cũ) và `hoc/lo-trinh-hoc.js`/`hoc/thu-tu-chuong.js` cũ
  — màn sẽ viết lại từ đầu, không copy nguyên.
  Mùa Bến sông (`tuple`), Mỏ đá (mảng 2 chiều), Hang động (`dict`/`set`) không mang sang mùa nào.
- Phim/cutscene (`phim-mua-*.js`, `phim-goi.js`, `phim-vector.js`, `mo-dau.js`, `gioi-thieu.js`,
  `thu-mua-9.js`, `man-lap.js`, `man-chon-doi.js`, thư mục `hoc/game/phim-clb/`) — gắn với cốt
  truyện 9-mùa cũ, viết lại sau nếu cần.
- Thư mục gốc `phim-clb/` (1.7 GB video) và `review-man/` (895 MB) — không liên quan cơ chế.
- Mọi tài liệu kế hoạch (`hoc/*.md`, `hoc/ban-giao/`), script kiểm tra cũ (`hoc/kiem-*.mjs`),
  `tools/`, `docs/` — gắn với nội dung cũ của bản gốc, không áp dụng ở đây.
