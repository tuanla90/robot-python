# Kế hoạch: gói List + chương Flycam (Việc 2, user chốt 17/10)

Nguồn: Y-TUONG-TIEP-THEO.md mục B2, C và "Ba dòng từng việc".

## Ba dòng
- **Must keep:** chuỗi ở gói Nhện giữ nguyên; bộ chạy Python cũ chạy y như cũ (mọi máy kiểm cũ xanh, kể cả mockup sân robot dùng chung `docs/mockups/san-robot-core.js`); luật nhịp, thẻ Logic, `wait()` ghim, khuôn chương (10 màn, hàng làm quen · luyện · biến thể · trùm, sao theo nhịp + ô, BFS chứng minh không đường tắt).
- **Must improve:** bộ chạy có list; khay có khối list chạm sửa được trên điện thoại (không phải gõ chữ); gói List hai chương ngay sau gói Nhện; chương Flycam (drone gắn camera nhìn xuống) trong gói Drone.
- **Done when:** máy kiểm lõi list + máy kiểm từng chương mới xanh; lời giải mọi màn chạy thật, BFS không đường tắt; mọi lời giải nhập được bằng chạm trên khung 375×812; chơi tay ≥ 3 màn mỗi chương; toàn bộ `node kiem-*.mjs` + `node game/part/kiem-part.mjs` xanh.

## 1. Lõi list (bộ chạy Python `docs/mockups/san-robot-core.js`)
Tập con, đủ cho lớp 5–7:
- list literal số / chuỗi / rỗng: `[2, 3, 1]`, `["red", "blue"]`, `[]`; gán `a = [2, 3, 1]`; truyền làm đối số `weave([2, 3, 1])`, tham số hàm nhận list.
- `for x in a:` (và `for x in [2, 3]:`); `a[i]` với 0 ≤ i < len(a) (chỉ số âm, ngoài tầm: lỗi lời Việt dễ hiểu, chỉ rõ chỉ số và độ dài); `len(a)`; `a.append(x)`; `x in a` / `x not in a`.
- KHÔNG làm: slice, `a[i] = x`, list lồng list, phương thức khác (`pop`, `sort`…), list comprehension. Gõ thì lỗi lời Việt "game chưa dạy …".
- `print` không cần. Lỗi kiểu (cộng list với số, `for` qua số…) có lời Việt.
- Khung (`khung-code.js`): cấu trúc mới `'list'` trong `cauTruc`; màn có khai `cauTruc` mà không có `'list'` thì dòng dùng list báo `cau-truc-chua-hoc`. Mỗi dòng vẫn một ô.

## 2. Khay + khung chương trình (giao diện)
- Khối list ở thẻ **Logic**, nhóm "DANH SÁCH": `a = [1, 2]`, `for n in a:`, `for n in [1, 2]:`, `a.append(1)`. Tên biến list mặc định `a` (chạm tên để chọn tên khác trong vài tên gợi ý như ô biến hiện có).
- Trong dòng code, list hiện thành các ô số / ô chữ chạm được: chạm một phần tử → bảng chọn (số 1–9 hay màu / chữ như bảng hiện có) + nút **thêm ô** (chèn phần tử sau ô này) + **bỏ ô**; list rỗng có nút thêm.
- Chỗ cần một số (đối số `forward(n)`, `range(n)`) chọn được `a[0]`, `a[i]`, `len(a)` khi màn có list (mở rộng bảng chọn số / biến hiện có).
- Sân thử Xưởng: đối số list của hàm đang thử nằm ở thanh tên hàm như đối số số (chạm sửa phần tử).

## 3. Gói List (ngay sau gói Nhện trong `thu-tu-chuong.js`)
- Hai chương: `list` (làm quen) và `che-list` (chế lệnh), mỗi chương 10 màn. Gói tên "Danh sách", hình gói riêng.
- Robot: xe hai bánh (có `forward(n)`, `turn_right()`… của các chương trước) hoặc nhện; chọn sao cho lý do cần list là THẬT: mỗi bước mang một con số khác nhau (đoạn đường dài khác nhau), chuỗi chữ không làm được.
- `list`: literal → `for n in a` → `a[i]` → `len(a)` → list làm đối số. `che-list`: chế hàm nhận list (`route(steps)`…), và `append` (đo bằng cảm biến khoảng cách rồi ghi lại, dùng lại sau trong cùng lượt chạy).
- Lời đề tối đa 3 câu, giọng như các chương trước; màn gặp khó: trước gói List, cho 1–2 màn chương trước có đường nhiều đoạn dài khác nhau (lời giải giữ nguyên) để người chơi thấy viết dài.

## 4. Camera cho drone + chương Flycam (gói Drone: drone → che-drone → flycam)
- Part mới: camera nhìn xuống gắn bụng drone. `look()` trả màu ô ngay dưới drone (`"red"`, `"green"`, `"blue"`, `"yellow"`) hoặc `"none"`; không tốn nhịp (như cảm biến khác); đèn bộ phận: sáng đèn cảm biến khi đọc.
- Vẽ: camera dưới bụng drone; khi `look()` thì tia nhìn xuống ô (như cảm biến màu ở xe).
- Flycam 10 màn chủ đề "nhìn trước, làm sau": bay trinh sát, `seen.append(look())`, rồi làm theo thứ đã ghi (chở hộp bằng nam châm treo đúng thứ tự, quay về đúng ô màu…). Có pin như chương drone khi hợp lý.
- Sửa máy kiểm cũ cho phép camera trên drone ở chương flycam (kiem-hoc "color() phụ thuộc phần cứng" hiện cấm camera trên drone).

## 5. Thứ tự làm
1. Song song: (A) lõi list + khung + khay / khung chương trình; (B) camera drone (lõi `san-hoc.js`, part, vẽ, đèn) — chưa có màn.
2. Sau khi A xong: (C) gói List hai chương. Sau khi A và B xong: (D) chương Flycam.
3. Ráp, chạy mọi máy kiểm, chơi tay, commit, đăng Artifact.
