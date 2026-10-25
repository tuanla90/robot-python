# Rà soát độ khó Học lập trình — 23/10/2026

Trạng thái: báo cáo dưới đây ghi nhận **bản trước khi sửa** (370 màn / 37 chương). Phương án đã được triển khai trong `hoc/lo-trinh-hoc.js`: bản xuất bản có **380 màn / 38 chương**, gói Mê cung riêng sau Cảm biến, không còn màn nhiều map ở vị trí 1–9. Số màn trong các bảng bên dưới là số cũ, mã cố định dùng để đối chiếu thay đổi.

Các chương Cảm biến và Chế lệnh cảm biến đã đổi thứ tự các bài sửa lỗi/luyện tập mà giữ nguyên khóa lưu `ma`. 71 bài luyện nhiều map chuyển về một map; thêm 10 bài Mê cung; viết lại trùm cảm biến, máy ném, drone, chế lệnh drone và lắp ráp đủ bộ. Đã đo lại 86 ngưỡng sao trên kho hàm thật, sửa thêm ngưỡng ô trùm Nam châm cho phiên bản `u_turn()` người chơi đã học. Giữ sao cũ; nháp của nhiệm vụ được biên soạn lại không tự nạp vào nhiệm vụ mới. Không nâng ngưỡng sao các gói cũ khi thêm gói Mê cung. Người đã hoàn thành `che-cam-bien.6` ở bản cũ được chuyển chứng nhận học `follow_right()` sang `me-cung.6` một lần, tránh khóa lại chương sau.

Ngân hàng `man-*.js` vẫn giữ dữ liệu bài gốc để kiểm tra luật và tái sử dụng các biến thể. Game và công cụ nội dung phải dùng điểm vào xuất bản `lo-trinh-hoc.js`; HTML nạp nó sau ngân hàng và trước giao diện. `kiem-lo-trinh.mjs` kiểm tra toàn bộ lời giải trên bản xuất bản, các cấu hình lắp ráp mẫu, phụ thuộc mở khóa, bản lưu và tính tương đương giữa Node/trình duyệt.

## Kết luận

Phản ánh về 8.7 là đúng về thiết kế lộ trình: bài học cảm biến đã chuyển sang thuật toán tìm đường mà chưa có đủ bước đệm. Đây không chỉ là bài có đường dài hơn. Người học phải hiểu ưu tiên rẽ phải, tiến thẳng, quay trái, xử lý ngõ cụt và lặp hành vi đó trên ba mê cung. Sau đó 8.8 lại quay về sửa `while True`, khiến độ khó tụt rõ rệt.

Toàn bộ lộ trình có 81 màn ba sân, trong đó **69 màn nằm trước màn 10**, trải trên 16 chương. Có thêm hai màn hai sân: 28.7 và 31.7. Bốn chương có bài ba sân ở giữa nhưng trùm chỉ một sân: 31, 34, 35 và 37.

Số sân là yêu cầu khái quát hóa, không tự nó chứng minh bài khó hơn về mọi mặt. Các kết luận dưới đây dựa thêm vào đề, lời giải, phần code cho sẵn và kiến thức người học phải tự nghĩ ra. Chưa có dữ liệu thử nghiệm với học sinh để định lượng thời gian hoặc tỷ lệ bỏ cuộc.

## Các điểm cần sửa trước

| Ưu tiên | Màn / mã cố định | Vấn đề | Cách xử lý |
| --- | --- | --- | --- |
| P1 | 8.7 `khoang-cach.7` | Cảm biến phải/trái mới, ưu tiên ba nhánh, ngõ cụt, lặp và ba map cùng lúc. Khó hơn đáng kể bài sửa while ở 8.8. | Chuyển nội dung thuật toán sang gói Mê cung. Thay 8.7 bằng bài một map nhận biết lối bên phải; không yêu cầu tự nghĩ thuật toán bám tường. |
| P1 | 8.10 `khoang-cach.10` | Tên Mê cung nhưng lời giải đi hết hành lang rồi mới chọn hướng. Khác bài 8.7 phải xét lối rẽ sau từng bước; đặt sau không bảo đảm khó hơn. | Chuyển nội dung tìm đường sang gói mới. Trùm cảm biến là ba biến thể hành lang của cùng một nhiệm vụ đã luyện. |
| P1 | 9.6 `che-cam-bien.6` | Lặp lại bám tường ở giữa chương, sau đó 9.7 chỉ sửa điều kiện đảo. | Chuyển nhiệm vụ chế `follow_right()` sang gói Mê cung; giữ bài cảm biến ở mức kiểm tra/đi tới lối mở. |
| P1 | 9.5 `che-cam-bien.5` | Biến đếm mới + while + for dùng biến + đi/về + ba map. Nhiều yêu cầu mới trong một bài. | Có bài đệm đếm bước trên một map trước; sau đó luyện đi/về một map; khái quát hóa chỉ ở trùm. |
| P1 | 37.10 `rap-du.10` | Trùm một map, trong khi 37.8 và 37.9 là ba map. Lời giải mẫu giống hệt 37.4: `jet_back(); turn_right(); forward(4)`. Năm lối trên map không đồng nghĩa phải giải năm bài toán. | Thiết kế lại trùm ba tình huống buộc lựa chọn phần cứng/chương trình phù hợp, tránh một lối dễ bỏ qua toàn bộ phần tổng hợp. |
| P2 | 31.6–31.10 `may-nem` | 31.6 cần chương trình thích nghi ba map; 31.7 thêm camera và hai map; trùm một map dùng tầm `3 - i`, có thể giải theo quy luật cố định. | 31.6–31.7 luyện trên một map; trùm tổng hợp chọn tầm với ba biến thể. Không chỉ đổi chỗ vì còn phụ thuộc hàm/tham số. |
| P2 | 34.6–34.10 `drone` | Kiểm tra ba mức pin ở 34.6, rồi trở về một map. Trùm có giao hàng và sạc nhưng không kiểm tra thích nghi nhiều cấu hình. | Luyện kiểm tra pin trên một cấu hình; trùm ba cấu hình pin/sạc kết hợp giao hàng. |
| P2 | 35.5–35.10 `che-drone` | 35.5 kiểm tra pin trên ba sân; lời giải trùm chủ yếu ghép `hurdle`, `glide`, `airlift`, không gọi logic pin đó. | Trùm cần dùng cả bài học thích nghi pin, hoặc tách thử thách pin thành chương riêng có màn 10. |
| P2 | 9.1–9.3, 10.1–10.3, 25.1–25.3, 36.1–36.3 | Cả hàng làm quen đã yêu cầu đúng ba map; chưa cho người học xác nhận hiểu cơ chế trên một tình huống. | Hàng làm quen chỉ một map và một khái niệm mới mỗi bài. |
| P2 | 36.3 `flycam.3` | Nhãn làm quen nhưng phải hiểu ghi danh sách qua tham số rồi dùng dữ liệu để điều khiển đường bay; kèm ba map. | Tách đọc màu → ghi một màu → ghi dãy → thực thi dãy; phần ba map dành cho trùm. |
| P2 | 26.5–26.6, 26.9 và 37.3 | Vừa chọn phần cứng/ngân sách vừa xử lý chương trình thích nghi ba map. | Tập chọn phần cứng trên một map trước; chỉ trùm kết hợp các ràng buộc. 26.6 có vạch màu chỉ đường nên không đồng nhất với thuật toán bám tường của 8.7. |

1.5 và 1.10 cũng có lời giải đúng giống nhau, nhưng 1.10 là xếp lại chương trình sai có sẵn. Không đánh dấu là lỗi chỉ vì trùng code: phải xét thao tác người học thực sự làm. Ngược lại, 37.10 cần xem lại cả yêu cầu tổng hợp và đường giải dễ nhất.

## Gói riêng: Mê cung

Đề xuất đặt sau phần cảm biến và chế lệnh cảm biến cơ bản. Gói này dạy thuật toán tìm đường, không chen thuật toán đó vào gói giới thiệu phần cứng. Màn 1–9 đều một map.

| Màn | Nội dung | Kiến thức thêm |
| --- | --- | --- |
| 1 | Đọc cảm biến bên phải tại một góc đơn giản | Hướng tương đối của robot |
| 2 | Bên phải trống thì rẽ rồi tiến | Đọc điều kiện trước khi đổi hướng |
| 3 | Phải bị chặn thì tiến thẳng | Hai trường hợp |
| 4 | Phải và trước đều bị chặn thì quay trái | Trường hợp bị chặn |
| 5 | Ngã ba: có cả lối phải và lối trước | Vì sao phải ưu tiên một nhánh; if/elif |
| 6 | Ghép một bước thành `follow_right()` | Đóng gói quy tắc đã học |
| 7 | Lặp quy tắc qua một hành lang có nhánh | Từ một bước thành thuật toán |
| 8 | Ngõ cụt và quay ra | Hai lần quay trái khi cần quay đầu |
| 9 | Sửa thuật toán sai thứ tự ưu tiên | Hiểu quy tắc, không chép máy móc |
| 10 | Một chương trình giải ba mê cung | Khái quát hóa và chinh phục |

Tái sử dụng map của 8.7 và 9.6 cho phần cuối gói sau khi kiểm tra từng map phù hợp quy tắc đã dạy. Không đưa ngay một mê cung hoàn chỉnh vào màn 1. Chỉ chọn cấu trúc mê cung mà quy tắc bám tường đã kiểm chứng giải được; không ngầm hứa giải mọi mê cung.

## Quy tắc thống nhất khi sửa lộ trình

- Màn 1–3: làm quen, một map, mỗi lần thêm một ý mới.
- Màn 4–6: luyện/ghép các ý đã biết, vẫn một map.
- Màn 7–9: biến thể và sửa lỗi trên một map; tránh biến thể thành bài thuật toán mới khó hơn trùm.
- Màn 10: nhiệm vụ tổng hợp; nếu chương có yêu cầu chạy trên ba map, đặt yêu cầu đó ở đây. Không đồng nghĩa mọi chương đều bắt buộc có ba map.
- Các biến thể map còn lại có thể dùng làm luyện thêm tự chọn. Không chỉ giấu hai map nhưng vẫn bắt máy chấm chạy cả ba.
- Trùm phải kiểm tra các năng lực chính đã luyện; không cần nhồi mọi phụ kiện, nhưng không được có đường tắt bỏ qua năng lực cốt lõi.
- Đánh giá cả phần code cần tự viết/sửa, nhánh điều kiện, kiến thức mới, lựa chọn phần cứng, ngân sách và số map; không dùng độ dài đường hay số dòng code làm thước đo duy nhất.

## Danh sách đầy đủ các bài ba map trước màn 10

| Chương | Màn cần chuyển phần nhiều map về thử thách / luyện thêm | Map ở trùm hiện tại |
| --- | --- | --- |
| 8 — Cảm biến khoảng cách | 8.4–8.9 (6 bài) | 3 |
| 9 — Chế lệnh có if, while | 9.1–9.9 (9 bài) | 3 |
| 10 — Robot hoàn thiện | 10.1–10.9 (9 bài) | 3 |
| 11 — Đội hai robot | 11.4–11.7, 11.9 (5 bài) | 3 |
| 17 — Chế lệnh danh sách | 17.4–17.6, 17.8–17.9 (5 bài) | 3 |
| 24 — Cảm biến màu | 24.4–24.9 (6 bài) | 3 |
| 25 — Chế lệnh màu | 25.1–25.9 (9 bài) | 3 |
| 26 — Lắp ráp: Thân + Não | 26.5–26.6, 26.9 (3 bài) | 3 |
| 27 — Nam châm | 27.6 (1 bài) | 3 |
| 28 — Chế lệnh nam châm | 28.5 (1 bài) | 3 |
| 31 — Máy ném | 31.6 (1 bài) | 1 |
| 32 — Chế lệnh máy ném | 32.6 (1 bài) | 3 |
| 34 — Drone | 34.6 (1 bài) | 1 |
| 35 — Chế lệnh drone | 35.5 (1 bài) | 1 |
| 36 — Flycam | 36.1–36.8 (8 bài) | 3 |
| 37 — Lắp ráp: Đủ bộ | 37.3, 37.8–37.9 (3 bài) | 1 |
| **Tổng** | **69 bài** | |

Áp dụng cùng nguyên tắc cho hai bài hai map 28.7 và 31.7, để không tạo ngoại lệ gây spike tương tự.

21 chương còn lại không có bài ba map trước màn 10: 1–7, 12–16, 18–23, 29–30, 33. Điều này chỉ loại trừ spike do nhiều map; không xác nhận mọi màn ở những chương đó đã cân bằng qua chơi thử.

## Yêu cầu triển khai và kiểm chứng

1. Giữ mã `ma` cố định và tiến độ cũ; không đổi số rồi vô tình gán sao cũ cho một bài khác. Nếu chuyển sang chương mới, cần chính sách chuyển tiến độ rõ ràng.
2. Giữ thứ tự mở hàm trong kho. `go_wall`, `to_gap`, `bounce`, `follow_right`, `fetch_back` có quan hệ với màn sau; không hoán đổi hàng loạt theo số map. Kiểm tra cả mẫu có sẵn, gợi ý, Sổ lệnh và khóa mở gói khi tách gói.
3. Khi đổi từ ba sân thành một sân, phải đồng bộ vị trí xuất phát, màu, vật, pin, bóng mờ và các trường cấu hình song song; tính lại sao nhịp, không giữ tổng ba sân cũ.
4. Thiết kế ba map trùm thật sự khác tình huống cần quyết định; đổi hình trang trí không đủ. Xác định rõ một bộ phần cứng/chương trình dùng chung hay được chọn lại phần cứng, nhất là gói lắp ráp.
5. Chạy lời giải chuẩn và lời giải sai trên từng sân; cập nhật kiểm tra cấu trúc chương và các giả định ba sân cũ. Kiểm tra mở khóa bằng tiến độ mới và tiến độ đã lưu.
6. Chơi thử với người chưa biết lời giải, ghi thời gian, lần chạy và điểm bị kẹt để xác nhận trùm khó hơn bài luyện về năng lực cần vận dụng.

Kiểm kê bản xuất bản bằng `node hoc/ra-soat-do-kho.mjs`; dùng thêm `--goc` để đối chiếu số liệu gốc của báo cáo. Công cụ chỉ đọc định nghĩa màn và in số liệu, không thay đổi game và không tự kết luận độ khó từ số map. Đo lại sao sau khi biên soạn bằng `node tools/do-lo-trinh.mjs --ghi-sao`; xác nhận bằng `node hoc/kiem-lo-trinh.mjs`.
