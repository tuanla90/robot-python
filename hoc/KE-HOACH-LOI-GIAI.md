# Kế hoạch: lời giải tham khảo cho người chơi

Ngày 30/10. Trạng thái: **đề xuất, chờ user duyệt** (chưa làm giao diện người chơi).

## Đã có (bảng Gỡ lỗi, `hoc/game/go-loi.js`)

- `GoLoi.cachGiai(m)`: gom mọi lời giải đã lưu của một màn thành một danh sách:
  - `chuan` = `loiGiai` (máy kiểm của từng mùa ép 3 sao),
  - `khac` = `loiGiaiKhac` (thường 2 sao: nhiều ô hơn hay chậm hơn),
  - `ct1`, `ct2`… = `congThucKhac`,
  - màn lắp ráp: `lap1`, `lap2`… = `lapRap.cachLap[i].loiGiai`, kèm cách lắp.
- `GoLoi.khoChoCach(m, c)`: kho hàm để chạy cách đó (kho tham chiếu lúc tới màn + hàm mới của lời giải).
- `GoLoi.chamCach(m, c)`: chấm thử, ra số sao và nhịp.
- `GoLoi.napLoiGiai(ma, hoi)`: đưa hàm vào kho, đưa bài vào khung code (`Choi.napBai`). Nếu bài đang viết hay hàm trong kho sẽ bị thay thì hỏi trước.
- Địa chỉ `choi.html?debug=1&man=<mã>&loigiai=1` (hoặc `loigiai=khac`, `ct2`…) vào màn rồi nạp luôn.
- Máy kiểm `hoc/kiem-loi-giai.mjs` chạy trên lộ trình xuất bản (`lo-trinh-hoc.js`, như `choi.html`), đủ 1128 màn (4 mùa đang mở, 40 gói, cùng mùa 5 ẩn): lời giải đầu tiên của mọi màn đều thắng 3 sao. 1011/1012 cách khác cũng thắng.

Phần người chơi dùng lại đúng các hàm này. Không cần dữ liệu mới để chạy được.

## Đề xuất cho người chơi

### 1. Khi nào được xem

| Tình huống | Đề xuất |
|---|---|
| Đã thắng màn (1 sao trở lên) | Bảng thắng có nút **Lời giải tham khảo**. Xem được lời giải chuẩn và các cách khác, mỗi cách ghi số sao, nhịp, ô. Chưa đủ 3 sao thì ghi rõ thiếu sao nào (nhanh / gọn). |
| Chưa thắng, đã thua nhiều lần | Sau **5 lần Chạy thua** và đã xem hết gợi ý (`goiY`) thì hiện nút **Mở từng dòng**. Mỗi lần chạm mở thêm một dòng của lời giải chuẩn, các dòng khác bị che. Màn đó tối đa 2 sao cho tới khi chơi lại không mở dòng nào. |
| Màn trùm (`hang: 'trum'`) | Không mở dòng trước khi thắng (trùm là bài kiểm tra cả gói). Thắng rồi thì xem như màn thường. |
| Màn trình diễn (`chiChay`), màn mã khóa (`chinhCoDinh`) | Không cần nút (chương trình đã có sẵn). |

Lời giải chỉ để **xem**. Không tự ghi đè bài của người chơi. Sau khi thắng mới có thêm nút **Chép vào bài** (hỏi trước, như bảng Gỡ lỗi).

### 2. Trường dữ liệu mới (các session mùa điền dần, không bắt buộc)

```js
giaiThich: {
  y: 'Một câu nói ý chính của lời giải.',          // hiện trên đầu bảng
  dong: { 2: 'Lặp 3 lần vì có 3 ô trống.', 5: '...' } // chú thích theo số dòng của loiGiai.chinh (đếm từ 1)
}
```

- Thiếu `giaiThich` thì bảng chỉ hiện code và `moTa` của các cách khác. Không lỗi.
- Các cách khác đã có `moTa`, dùng lại luôn, không thêm trường mới.
- Máy kiểm chung kiểm `giaiThich` (nếu có): đúng dạng, số dòng nằm trong `loiGiai.chinh`, không emoji, không gạch dài, mỗi câu không quá 120 ký tự.

### 3. Lưu

- `Luu.datDaXem('giai:<ma>')` khi đã xem lời giải sau khi thắng. Chỉ để thống kê, không ảnh hưởng sao.
- `Luu.datDaXem('mo-dong:<ma>')` cùng số dòng đã mở khi chưa thắng. Máy chấm dựa vào đó để giới hạn 2 sao.

## Phát hiện khi kiểm (chờ quyết)

- **Kho hàm vượt trần (mùa 5 ẩn).** Lộ trình hiện có 253 hàm cốt truyện, còn `KhoHam` chỉ chứa tối đa 200 hàm (`SO_HAM_MAC_DINH`). Bốn mùa đang mở chưa chạm trần. Từ `che-xich.5` (85.3, mùa 5) kho tham chiếu vượt 200: 286 màn. Đo bằng cách giữ 200 hàm đầu: 163 màn mùa 5 không còn thắng 3 sao bằng lời giải chuẩn. `kiem-hoc` chỉ kiểm trần trên ngân hàng bài, nên không bắt được. Phải xử lý trước khi mở mùa 5: nâng trần (vd 400), hoặc để lộ trình không bắt giữ mọi hàm cũ. Bảng Gỡ lỗi khi gặp kho đầy vẫn nạp bài và báo đỏ.

## Câu hỏi cho user

1. Mở dòng khi chưa thắng: đồng ý mốc 5 lần thua và giới hạn 2 sao không? Hay chỉ cho xem sau khi thắng?
2. Có làm trường `giaiThich` không? Có thì các session mùa điền theo gói, bắt đầu từ mùa 1.
3. Màn trùm có cấm mở dòng hẳn không?
