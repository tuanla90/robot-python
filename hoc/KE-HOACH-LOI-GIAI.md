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

- **Kho hàm vượt trần (đã sửa 30/10).** Lộ trình có 253 hàm cốt truyện, quá trần 200 của `KhoHam` từ `che-xich.5` (mùa 5). Lý do nhiều: mỗi màn chế lệnh bắt tạo một hàm tên riêng. 61 hàm không màn nào dùng lại, 75 hàm chỉ dùng trong chương / gói của nó, 64 hàm dùng trong cùng mùa, 53 hàm dùng sang mùa sau. Hàm cốt truyện bị khóa tên nên người chơi không xóa được, kho đầy là kẹt hẳn. Sửa: trần 200 nay chỉ tính hàm tự đặt tên (xóa được); hàm cốt truyện không chiếm trần (`kho-ham.js`, `soHamTuDat`). Dung lượng: 241 hàm cốt truyện là 23 KB localStorage, không cần đổi cách lưu. Máy kiểm `kiem-loi-giai.mjs` mục 2 và 4 giữ luật này.

## Câu hỏi cho user

1. Mở dòng khi chưa thắng: đồng ý mốc 5 lần thua và giới hạn 2 sao không? Hay chỉ cho xem sau khi thắng?
2. Có làm trường `giaiThich` không? Có thì các session mùa điền theo gói, bắt đầu từ mùa 1.
3. Màn trùm có cấm mở dòng hẳn không?
