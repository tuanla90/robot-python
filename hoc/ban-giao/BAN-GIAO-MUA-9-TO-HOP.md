# Bàn giao mùa 9 Về CLB: 200 màn tổ hợp part (17/11)

Nhánh `claude/mua-9-tiep` (worktree `.claude/worktrees/mua-9-tiep`). Main d6e023a đã có nhánh tới d86bcb4 (G1–G7, G8 dở).
Lần gộp sau mang các commit từ cd06da8 tới đầu nhánh: kiem-part-mua, G8 lap-hang-dong.5–.10, G9, G10.

## Đã xong

| Gói | Tệp | Commit |
|---|---|---|
| G1–G7 | man-cuu-kho-hang … man-cuu-mo-da | đã trên main d6e023a |
| G8 Hang động | man-cuu-hang-dong.js | 88f0071 … ab7dc69, b4c1ef8 |
| G9 CLB sau bão | man-cuu-clb.js | 89afc63 … 85ebaad |
| G10 Ngày hội | man-ngay-hoi-clb.js | b5eaedc … bd8242e |
| máy kiểm part | kiem-part-mua.mjs | cd06da8 (camera trước / camera bụng là part mùa 9, R2 mang được) |

Máy kiểm sau G10 (chạy từng cái): kiem-loi-giai ĐẠT 68/68 · kiem-cau-do-mua-9 ĐẠT 34 · HỎNG 0 · CHƯA KIỂM ĐƯỢC 103 ·
kiem-chon-doi 49/0 · kiem-hinh-to-hop 26/0 · kiem-lai-mua-9 234/0 · kiem-may-nem 190/0 · kiem-part-mua ĐẠT.
kiem-lo-trinh dừng ở che-chinh-luc.8 (mùa 7). Bản "ghi lỗi rồi chạy tiếp" chỉ còn hai mục có sẵn từ trước:
che-chinh-luc.8 nhiều sân chưa miễn, và (a) thứ tự gói mùa 1 ('combo' / 'hai-robot'). ĐẠT 2396.
Thử tay: mọi lời giải / đội tốt / cách lắp chính 3 sao, mọi cách lắp thắng mọi sân, mọi loiSai thua đúng mã; mọi cách chọn đội không ném lỗi.

## Chờ user quyết

1. Sao: cách lắp rẻ được ít sao hơn (sao theo cách chính + 15–25 %), như G1–G4. Giữ vậy hay mọi cách lắp đều 3 sao?
2. Song ca: bè đoạn 7 (G7) và đoạn 9 (G9: 5 5 4 4 3 3 2 2 | 7 7 6 6 5 5 4 4) do agent chọn.
3. Lõi màn đội, làm được đúng bảng nếu sửa:
   - tự lắp hai robot một màn (G9 #20, G10 #9, #19: hiện một đặt sẵn + một tự lắp);
   - màn hát đội có cờ / "vừa đi vừa hát" (lõi chỉ ghi tới cờ khi mục tiêu toi-co);
   - màn hát đội ba robot (G10 #20: R3 đánh trống bị khoá → hiện R2 tự lắp đánh trống beat());
   - người đi theo tiếng nốt (G9 #8).
4. Lõi loa: robot có loa không phát trong một nhịp đưa độ ngân mọi đá chuông chưa vỡ về 0 (đá dày chỉ vỡ khi đội có một loa). Ý định hay lỗi?
5. G5: #17 cách rẻ không cần phao; #14 / #15 có bắt def … return.
6. Bộ dò cho 103 mẹo "chưa kiểm được" (đọc rồi chọn, song song, đổi vai, nhiều sân).
7. G6: cho gắn pin lên khe xe?

## Việc để sau

- duLieuSan cho màn đội (lõi chamDoi + giao diện man-choi): lap-cang-song.6, lap-mo-da.6 còn một sân.
- `and` chỉ có ở G10 #13 dạng `or`; chưa màn nào bắt `and` (gợi ý: thêm sân có vật gỗ ở trum-mua-clb.3).
- Đưa LapRap.kiemCanMan / kiemCanManDoi vào máy kiểm (lap-clb.4 thiếu 1 xu chỉ lộ khi chạy tay).
- che-chinh-luc.8 (mùa 7) vào NHIEU_SAN_KHONG_TRUM để kiem-lo-trinh chạy hết.
- Soát 200 màn trên trình duyệt (hình robot ghép, sông có dòng chảy, xe bờ, đá ướt, ngách hang). Khung trình duyệt không vẽ khi cửa sổ ẩn;
  phim mở đầu mùa che bảng chọn đội khi vào thẳng màn bằng ?man=.
- Mùa 9 còn ẩn (thu-tu-chuong.js an: true) cho tới khi user mở.
