# Kế hoạch gói "Đọ sức part mạnh": R1 part cơ bản thắng R2 part mạnh nhờ logic (26/10/2026, ĐÃ DUYỆT, ĐÃ LÀM: man-doi-thu-manh.js)

User 26/10: "Làm 10 màn đối kháng: R2 gắn part mạnh hơn (omni, xích, drone, súng hơi…), R1 chỉ part cơ bản mùa 1 nhưng thắng nhờ logic. Lên kế hoạch trước."

Ý dạy (mùa 4 Kỹ sư, KE-HOACH-MUA.md mục 4): **đọc code của đối thủ để tìm điểm yếu của part**. Part mạnh luôn có giá phải trả
(quay chậm, đi chậm, tốn pin, phải nạp, bị băng đẩy, bị chặn cú giật…). R1 không cần part xịn: chỉ cần đọc chương trình khóa của R2, đếm nhịp và chọn cách đi đúng.

## 1. Khuôn chung

- **R1** (người chơi): hai bánh + tay kẹp + cảm biến khoảng cách (part mùa 1), mọi hàm cần dùng đã học ở mùa 1. Giống gói Đua đối kháng.
- **R2** (đối thủ): MỘT part mạnh mỗi màn, chương trình khóa (`coDinh`), chạy bằng lệnh gốc của part đó cùng bộ hàm riêng `khoDoiThu`
  (không mượn kho của người chơi). Chương trình R2 có cảm biến khi cần, và vòng chờ **có giới hạn** (`for i in range(n)` + `if front_clear()`) để R2 bỏ cuộc thay vì treo.
- **Luật thắng** như gói Đua đối kháng: R1 xong mục tiêu (`toi-co` hay `dua-vat`) trước khi R2 chạm cờ F; về cùng nhịp thì R1 thua.
- **Chỗ đứng:** gói thử thách riêng 10 màn **"Đọ sức part mạnh"** (`doi-thu-manh`), ngay sau gói Đua đối kháng, cuối mùa 4. Mùa 4: 170 → 180 màn.
- Màn 1–9 một sân, màn 10 trùm ba sân.

### Đã kiểm trên lõi hiện tại (26/10)
| Điều cần | Kết quả |
|---|---|
| R2 thân xích / omni / nhện / drone tới cờ thì R1 thua (`doi-thu-thang`) | chạy đúng cả bốn |
| R2 tay súng hơi / nam châm / máy ném tới cờ thì R1 thua | chạy đúng cả ba |
| R1 đứng chắn đường thì R2 (xe dưới đất) dừng | đúng (đã thử với xích) |
| R1 chắn được drone không | **không**: drone và xe dưới đất ở hai tầng khác nhau |
| Nam châm của R2 hút được vật R1 đang kẹp không | **không**: vật đang cầm không bị hút |

## 2. Mười màn

| # | Tên dự kiến | Part của R2 | R2 mạnh ở | Điểm yếu R1 khai thác | Chiến thuật R1 | Mục tiêu |
|---|---|---|---|---|---|---|
| 1 | Xích quay chậm | xích | leo bậc thang đi thẳng | mỗi lần quay mất 2 nhịp | đếm số lần R2 quay trong code: đường dài mà thẳng của R1 nhanh hơn | tới cờ |
| 2 | Omni gặp băng chuyền | omni | trượt ngang, khỏi quay | đứng trên băng 1 nhịp là bị đẩy (xe hai bánh phải 2 nhịp) | R1 vượt băng bằng cách đi liền, R2 trượt ngang qua băng thì bị đẩy lùi | tới cờ |
| 3 | Nhện chậm chân | nhện | nhảy hố, leo bậc, khỏi quay | 2 nhịp mỗi ô | đường vòng xa của R1 vẫn nhanh hơn đường tắt qua hố của R2 | tới cờ |
| 4 | Bịt khe leo | xích | leo bậc thang S lên khe hẹp sát cờ | không đi qua được vật nằm trên đường; chờ 3 nhịp mới chạy | R1 nhặt hộp, quay đầu thả bịt khe ra của bậc thang, rồi chạy tới cờ | tới cờ |
| 5 | Chắn đường đạn | súng hơi | bắn nút N từ xa để mở cửa | bóng bay thẳng, gặp xe là dừng | R1 đứng chờ đúng trên đường đạn để nút không bị bắn, rồi mới chạy | tới cờ |
| 6 | Drone phải sạc | drone + pin | bay qua tường thấp, hố, rào | pin ít, phải ghé ô sạc P | đọc code R2 đếm nhịp sạc; chọn đường (có cổng dịch chuyển) nhanh hơn | tới cờ |
| 7 | Nhặt trước nam châm | nam châm | hút vật sắt từ xa 2 ô | không hút được vật đang bị kẹp | đọc nhịp R2 bật nam châm: nhặt hộp trước nhịp đó rồi giao | giao hàng |
| 8 | Máy ném lấp lối | máy ném | ném hộp qua tường tới đúng ô theo `aim(n)` | phải `load()` rồi mới `throw()`, mất nhịp | tính ô rơi từ `aim(n)` trong code R2, chạy qua ô đó trước khi hộp rơi chắn lối | tới cờ |
| 9 | Omni lách cửa | omni | mặt nhìn lên mà trượt ngang dọc hành lang tới cờ | cửa c đóng khi nút đè M có hộp | nhặt hộp trước mặt, quay đầu thả lên M sau lưng (đóng cửa), rồi chạy đường vòng. Sân riêng, không dùng lại sân dua-robot.4 | tới cờ |
| 10 | Trùm: Ba đối thủ một chương trình | xích ở cả ba sân | leo bậc ở mỗi sân một chỗ khác | quay chậm, khe hẹp | một chương trình dùng cảm biến: thấy R2 chắn trước mặt thì đổi lối (`left_clear()` / `right_clear()`) | tới cờ |

Ghi chú:
- Màn 10 dùng **một** loại part cho R2 vì mỗi robot gắn một bộ part cho cả màn (`doi[i].robot`), không đổi theo sân.
- Màn 6: R1 không chặn được drone, nên thắng hoàn toàn nhờ **chọn đường và đếm nhịp**. Đây là màn duy nhất không có tương tác chặn.
- Màn 8 cần kiểm thêm khi làm: vật ném rơi trúng ô có xe thì lõi xử lý ra sao. Nếu chưa rõ thì dựng sân sao cho ô rơi không trùng đường của R1 lúc vật rơi.

### Kết quả đo (máy chấm, bộ dò `tools/do-tat-dua.mjs`)
| # | Ngưỡng 3 sao (ô / nhịp) | R2 một mình tới cờ ở nhịp | Bộ dò: nhịp ngắn nhất |
|---|---|---|---|
| 1 | 17 / 7 | 8 | không có đường nhanh hơn |
| 2 | 20 / 7 | 8 | không có |
| 3 | 17 / 6 | 8 | không có |
| 4 | 35 / 17 | 8 | 14 (cùng chiến thuật, gộp nâng tay vào nhịp đi) |
| 5 | 25 / 13 | 6 | không có |
| 6 | 17 / 7 | 9 | không có |
| 7 | 33 / 8 | 10 | 6 (cùng chiến thuật, gộp nhịp) |
| 8 | 18 / 4 | 9 | không có |
| 9 | 32 / 17 | 10 | 15 (cùng chiến thuật, gộp nhịp) |
| 10 | 21 / 21 (ba sân) | | cận dưới 7+8+6 |

## 3. Ý Python và cách chơi

- Mọi màn: mở thẻ R2 đọc chương trình (có `slide_right()`, `shoot()`, `go_right()`, `aim(2)`… của part mà R1 không có). Đề bài nói rõ part của R2 mạnh ở đâu, gợi ý nói điểm yếu.
- Màn 1–3 làm quen: một điểm yếu, đếm nhịp. Màn 4–6 luyện: chặn đường, chọn đường. Màn 7–9 biến thể: đọc tham số / thời điểm trong code R2.
- Trùm: chương trình dùng cảm biến để phản ứng với đối thủ, không cứng nhịp.

## 4. Kiểm và đo (như gói Đua đối kháng)

- Máy kiểm `kiem-doi-thu-manh.mjs` (hay thêm phần vào `kiem-dua-robot.mjs`): lời giải 3 sao không chẩn đoán, mẫu chưa thắng, hai lời sai thua đúng mã,
  lời giải khác 2 sao, hàm cần đã học ở mùa 1, R1 chỉ dùng part mùa 1, R2 có part mạnh, R2 không phụ thuộc kho, R2 không treo (vòng có giới hạn).
- Bộ dò `tools/do-tat-dua.mjs` mở rộng cho chương mới: mọi đường nhanh hơn ngưỡng chỉ được là gộp nâng tay vào nhịp đi, **không** được né chiến thuật của màn.
  Thêm một kiểm "part mạnh có thật": thay R2 bằng R2 hai bánh cùng đường thì R2 chậm hơn hẳn (chứng minh part làm R2 mạnh).
- Ngưỡng sao đo bằng máy chấm.

## 5. Giao diện

- Thẻ R2 đã có (ổ khóa, chương trình chỉ đọc), sân vẽ được mọi thân, R2 sơn đỏ.
- **Đã làm:** thẻ **ĐỐI THỦ** (`ThePart.doiThu`, the-part.js) hiện khi vào màn có `m.doiThu = { part, manh, yeu }`, thay cho thẻ bộ phận của R2:
  hình R2 sơn đỏ, tên part, mục "Mạnh ở" / "Yếu ở" ở đầu thẻ, rồi các lệnh của part mà R2 dùng. Mỗi màn hiện một lần (cờ `doi-thu:<mã màn>`).
  Không đánh dấu `part:<mã>` là đã gặp, nên khi người chơi tự gắn part đó sau này vẫn có thẻ "Bộ phận mới" đầy đủ.
  Người chỉ mua mùa 4 có thể chưa học xích / omni / nhện / súng hơi / nam châm, nên thẻ này giúp họ đọc được code R2.
- Huy hiệu `doi-thu-manh` (huy-hieu.js): xe hai bánh vàng đi trước xe xích đỏ, cờ đích phía trước.

## 6. User đã chốt (26/10)
Gói thử thách riêng 10 màn sau Đua đối kháng; danh sách part như mục 2; làm luôn thẻ giới thiệu part của đối thủ.

## 7. Máy kiểm
`kiem-doi-thu-manh.mjs` (16 kiểm, nằm trong `npm test`). Chưa có kiểm "part mạnh có thật" (thay R2 bằng xe hai bánh cùng đường thì R2 chậm hơn).
lo-trinh-hoc.js chèn gói thêm theo nhiều lượt: gói neo sau chương của một gói thêm khác (doi-thu-manh sau che-dua-robot) vẫn đúng chỗ dù tệp màn nạp theo vần.
