# Kế hoạch: lập trình kết hợp hai robot (22/10)

User chốt 22/10: **hai khung code riêng** (R1, R2); **không thêm lệnh tín hiệu**: hai robot "báo" nhau bằng cảm biến sẵn có
(thấy đồng đội / thấy vật ở trước thì mới làm tiếp). Làm theo thứ tự: lõi → giao diện → màn.

## Ba dòng
- **Must keep:** mọi màn một robot chạy y như cũ (54 bộ kiểm xanh, `SanHoc.chay(cfg, code)` không đổi kết quả); luật nhịp, mỗi bộ phận
  một lệnh mỗi nhịp; khung 10 ô; hàm của em dùng chung cho cả hai robot.
- **Must improve:** lõi chạy hai chương trình trên CÙNG một sân theo nhịp chung; đồng đội là vật cản (đi, cảm biến, thả vật, cửa, thùng, bóng);
  luật va chạm công bằng (không phụ thuộc robot nào chạy trước); mục tiêu tới cờ cho từng robot; máy chấm + chẩn đoán ghi tên robot.
- **Done when:** máy kiểm lõi hai robot (khớp nhịp, va chạm, cảm biến thấy đồng đội, bàn giao vật, chờ nhau bằng cảm biến, kết thúc / lỗi);
  một robot vẫn y như cũ; toàn bộ máy kiểm xanh. (Giao diện và 10 màn là bước sau.)

## Luật (lõi)
- **Cấu hình:** `cfg.doi = [rc1, rc2]`, mỗi `rc` là phần riêng của robot: `batDau, loaiRobot, hamGoc, phanCung?, camBien?, pin?, daoChieu?, danToiDa?, roBanDau?`.
  Sân, vật, đích, cửa, nút, mục tiêu… dùng chung trong `cfg`. Gọi `SanHoc.chay(cfg, [code1, code2], opt)`; `opt.nguonDong` có thể là mảng (mỗi robot một hàm).
- **Nhịp chung:** mỗi robot chạy chương trình của mình tới ranh nhịp (`wait()`, bước `go_*`) rồi DỪNG CHỜ. Đủ mọi robot thì sân chạy một nhịp.
  Lệnh không tốn nhịp (cảm biến, `aim`) chạy ngay. Robot đã hết chương trình (hay đã tới cờ) đứng yên ở các nhịp sau, sân vẫn tác động lên nó (băng chuyền).
- **Thứ tự trong một nhịp** (một robot thì đúng như cũ): (1) mỗi robot: hành động, băng chuyền đẩy xe, vật theo xe → (2) băng đẩy thùng →
  (3) mỗi robot: nam châm hút → (4) cửa đổi → (5) mỗi robot: pin, ô đi qua, đích, ghi vết.
- **Va chạm (công bằng):** trước nhịp, tính ô mỗi robot ĐỊNH tới (tiến / lùi / trượt / bước / bay / giật súng). Robot không vào được ô đồng đội
  đang đứng, cũng không vào ô đồng đội định tới. Hai robot cùng nhắm một ô thì cả hai đứng yên; đổi chỗ xuyên qua nhau cũng bị chặn.
  Đâm thì ghi `dam-tuong` với `vat: 'dong-doi'`. Drone và xe dưới đất không chặn nhau (khác độ cao); hai drone chặn nhau.
- **Đồng đội là vật cản:** `front_clear()` / `left_clear()` / `right_clear()` trả False, camera trả "none", cảm biến từ không nhìn xuyên qua;
  không thả / ném / đẩy vật vào ô có đồng đội; thùng trượt dừng trước đồng đội; bóng súng hơi dừng ở đồng đội; cửa không đóng xuống ô có xe.
- **Bàn giao:** dùng luật vật sẵn có: R1 thả vật xuống ô trước mặt, R2 kẹp vật ở ô trước mặt nó. Cảm biến cho R2 biết lúc nào có vật
  (`while front_clear(): wait()` khi vật nằm ngay trước mặt; camera `color()`).
- **Mục tiêu:** `toi-co`: mỗi robot phải tới một ô cờ F (mỗi cờ một robot); tới cờ thì robot dừng chương trình, đứng yên trên cờ. Thắng khi mọi
  robot đã tới cờ. `dua-vat`, `day-thung`: chung cho cả đội (như cũ). `bong-mo` chưa dùng cho hai robot.
- **Dừng:** một robot lỗi (cú pháp, lỗi chạy, vòng lặp đọc cảm biến mãi) thì cả trận dừng, lỗi ghi `robot: i`. Vật vỡ, rơi hố, hết pin, thùng kẹt: dừng.
  Quá `nhipToiDa` nhịp: `qua-nhieu-nhip` (vd hai robot chờ nhau mãi).
- **Kết quả:** như một robot cho phần sân (`thang, nhip, loi, vat, cua, nut, thung…`) + `doi: [{ robot, vet, suKien, lenhTon, tay, … , toiCo, xong }]`.
  Các trường riêng của robot ở cấp ngoài (robot, vet, suKien…) là của R1 để mã cũ đọc được.

## Cách làm trong lõi (san-hoc.js)
- Giữ nguyên toàn bộ luật. Các biến riêng của một robot (vị trí, tay, nam châm, lệnh chờ, vết…) được CẤT / NẠP theo robot (đổi ngữ cảnh);
  biến của sân (vật, thùng, cửa, nút, băng, nhịp) dùng chung.
- `motNhip` tách thành năm pha như trên (`taoNhip`); một robot gọi lần lượt đủ năm pha nên kết quả không đổi.
