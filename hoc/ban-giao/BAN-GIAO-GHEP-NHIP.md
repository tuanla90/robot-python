# Biên bản bàn giao: ghép nhịp mùa 2, 4, 5, 7 (14/11/2026)

Kế hoạch gốc: `hoc/KE-HOACH-GHEP-NHIP.md` (user chốt 13/11, mục 7). Máy đo: `node tools/do-ghep-nhip.mjs`.
User dặn tối 13/11: "xong 1 mùa thì commit, làm dần các mùa khác r merge main đẩy git sáng mai t chơi thử". Thứ tự: mùa 5 → 2 → 4 → 7. Cách làm: phiên chính lập kế hoạch và nghiệm thu, agent viết (skill /giao-viec), mỗi lúc một agent.

## 1. Trạng thái từng mùa

| Mùa | Trạng thái | Ở đâu | Số đo (màn có ghép ngoài cặp hai bánh) |
|---|---|---|---|
| 5 Bến sông (xuồng) | XONG | main | 69/200 (gói 5: 18, 6: 17, 7: 10, 8: 10, 9: 4, 10: 10); trước đợt là 0 |
| 2 Nhà máy (xe cứu hỏa) | XONG, hụt chỉ tiêu | main 5107a78 | 11/200 (gói 6: 7/20, cần 15; gói 10: 4/20, cần 5) |
| 4 Cảng sông (cần cẩu) | ĐANG LÀM gói F1 (cẩu 4 hướng) | nhánh `claude/mua-4-cau-4-huong`, worktree `.claude/worktrees/agent-aa9ddb5dd10ec4f8a` | chưa đo |
| 7 Mỏ đá (xe omni) | CHƯA BẮT ĐẦU | — | 0/200 |

**Đã đẩy GitHub** (origin/main d7c4e52, 14/11). Sáng 14/11 các lần đẩy trước đó lỗi `HTTP 503` phía GitHub lúc gửi gói (đăng nhập vẫn qua); thử lại sau ~1 giờ thì được. Mỗi mùa xong: `git push origin main` (user cho phép đợt này).

## 2. Mùa 5 Bến sông: đã làm

- Lõi: tời cuộn `reel_in()` / `reel_out()` thay `set_length` (f9bb5c3, 85f69e4, 1915467). Mỗi nhịp cuộn hoặc nhả 1 ô. Bật bằng hamGoc hoặc cờ `cuonDay`. Hết nấc thì có sự kiện `day-het-thu` / `day-het-nha`.
- Gói 5 Mỏ neo: `lift_anchor()` bỏ `wait()`. Nhổ neo, rồ máy, quay / lùi chạy cùng nhịp. Neo + tung lưới cùng nhịp có hàm `anchor_net(d)`. Commit 0ab2362, 2e70ae5, 9b41142, 27e717b, 180c87c.
- Gói 6 Buộc đuôi: `tether_grab()` nay là `reel_in()`, có hàm mới `reel_home(n)`. Màn ép dùng lục bình trôi chắn đường lùi. Gói 7–10 bật tời cuộn và hạ ngưỡng sao. Commit 5d435a2, c4a385e, 5c7d173, 4e450a1.
- Mùa 9: xuồng R1 có tời cuộn (c02bbaa). Hai chỗ phải thêm `reel_in` / `reel_out` vào hamGoc là `hoc/co-may.js` và `hoc/man-cuu-ben-song.js`.

## 3. Mùa 2 Nhà máy: đã làm

- Lõi (bea67c3, 36803b0) có hai cờ:
  - `cfg.ghiXich` (cần `lucBan`): phun mạnh cùng nhịp với hai xích. Tổng 0 thì đứng yên (`ghi-xich`), tổng ±2 thì phóng 2 ô (`phong`).
  - `cfg.phunKhiChay`: phun nhẹ cùng nhịp với đi thẳng thì đi 1 ô rồi phun từ ô mới.
- Màn (agent E rồi E2, commit d6be3ac…f4962aa):
  - Ghì xích: luc-ban.6 trình diễn, .7 ép, .9 hàm `brace_spray()`; dùng lại ở che-luc-ban.5, .10 và tong-hop-2.9.
  - Phun khi chạy: che-luc-ban.6 trình diễn, .9 ép. Màn ép dùng cửa nhịp chắn TIA NƯỚC. Chắn xe thì không ép được, vì lõi giữ cửa mở khi xe đứng trong ô cửa (`cua-ket`).
  - Phóng: trum-mua-2.8 trình diễn, .9 hàm `boost()` ép, .10 trùm.
  - Bỏ hàm `close_spray` và `far_push` (hai màn cũ bị thay).
  - Phim gói 6 thêm khung 4 ghì xích.
- Nghiệm thu: phiên chính chạy lại trên nhánh, mọi máy kiểm xanh (dòng kết quả nguyên văn):
  - kiem-luc-ban 145/0, kiem-che-luc-ban 58/0;
  - kiem-sung-hoi 210, kiem-che-sung-hoi 211, kiem-xich 137;
  - kiem-loi-mua-2 93, kiem-lach-mua-2 0 lỗ;
  - kiem-trum-mua-2 108, kiem-doi-sung-hoi 67, kiem-doi-mua-2 107;
  - kiem-loi-giai 67/67, kiem-huong-dan 40, kiem-phim-goi 55;
  - kiem-hoc 6716/0.

### Chờ user quyết (mùa 2)
1. **Gói 6 mới 7/20 (chỉ tiêu 15).** Sáu màn chọn lực (che-luc-ban.1–4, .7, .8) dùng chính cú giật làm bước đi, và trùm luc-ban.10 thì `brace_spray()` làm xe lệch cột. Agent nghiêng về:
   - nếu 15/20 là chỉ tiêu cứng: thêm một trạm ghì vào chương trình chính khoá của từng màn, khoảng 1 phiên;
   - nếu chỉ là ước lượng: để nguyên, hạ chỉ tiêu xuống 8–10.
2. **Gói 10 mới 4/20 (chỉ tiêu 5): đề xuất để nguyên.** Bật `ghiXich` sớm hơn trong gói thì bộ dò tìm ra một dãy lệnh cố định thắng mọi sân, phá ép cảm biến (trum-mua-2.7).
3. Màn trình diễn phun-khi-chạy (che-luc-ban.6) cách màn ép (.9) hai màn: đề xuất để nguyên. Màn 7, 8 tạo hàm mà gói sau còn gọi.

### Rủi ro còn lại (mùa 2)
- Chưa xem trên trình duyệt: che-luc-ban.6 (sân xoắn), .9 (hai cửa nhịp), trum-mua-2.8–.10 (sân .10 rộng 17 ô), khung phim 4. Lần thử sáng 14/11 bị các hộp "Bộ phận mới" che liên tục, chưa xem được sân.
- Cửa nhịp lần đầu xuất hiện ở mùa 2.
- Bản lưu cũ: sao lưu ở các màn bị thay nay ứng với bài khác; kho hàm có thể còn `close_spray` / `far_push`. Còn tên cũ trong `HAM_DEMO_MOT_LAN` (`hoc/man-chuoi-1.js`) và ánh xạ ở `hoc/game/luu.js`, vô hại.
- `kiem-che-luc-ban.mjs --loi-gia` báo "THIẾU: che-luc-ban.10: bộ dò". Lỗi này có từ trước đợt.

## 4. Mùa 4 Cảng sông: đang làm

Thứ tự gói theo kế hoạch mục 3, 6:
- **F1** cẩu quay 4 hướng (3e). Đang chạy: agent fable, nhánh `claude/mua-4-cau-4-huong`. Brief nằm ở `hoc/ban-giao/brief-ghep-nhip-F1-cau-4-huong.md`.
  - Lúc ghi biên bản, agent đã có commit cho gói 9, gói 10 và 20 màn cẩu mùa 9 (7bdf14a).
  - Agent tự ghi việc còn dở: doi-cang.2, .5, .7, .9, che-doi-cang.10 lệch nhịp phối hợp; tong-hop-cang.7, trum-mua-cang.8 dùng cọc phụ ở nấc chéo.
  - Nền máy kiểm cẩu ở main: kiem-mua-cang 126/0, kiem-man-mua-cang 200/200, kiem-ve-mua-song-cang 35/0, kiem-cau-do-mua-9 27/0, kiem-lai-mua-9 170/0.
- **F2** cần gạt đôi (3a): cờ `canGatDoi` từ gói 5. Lệnh cẩu vào hàng chờ, `wait()` gom thành một nhịp. Thứ tự trong nhịp: ray → quay → vươn → móc.
- **F3** xếp chồng theo luật màu + số (3c): `bongMo.chongLuat`, máy kiểm `hoc/kiem-chong-luat.mjs`, màn ở gói 2 / 6 / 8 / 10. Màu = `so % 4`, đã có sẵn trong hình.
- **F4** gồm hai phần:
  - min/max theo hàng ngang (3f), chỉ làm màn;
  - hàng tàu nối đuôi (3d): lõi mới, làm lại gói 4 chương 2.

Nghiệm thu F1: chạy lại các máy kiểm trong brief ở main sau khi ff-merge. Xem cần quay trên trình duyệt (`hoc/game/choi.html?debug=1`, cổng 4193 cấu hình "game-main"). Mở màn bằng JS: `GoLoi.vaoNgay(ManHoc.timMa('<mã>')); GoLoi.napLoiGiai(null,false)`; lớp phủ `.pclb` che màn thì ẩn đi.

## 5. Mùa 7 Mỏ đá: chưa làm

Theo kế hoạch mục 5:
- Lõi: cờ `cheoGhep` (trượt + đi thẳng = chéo 1 ô) và cờ `nemDa` (ngắm 1–2, ném + tiến = tầm + 1, sự kiện `khong-co-da`).
- Màn gói 5: hàm em `dir_fl` / `dir_fr` / `dir_bl` / `dir_br` thay `diag_*`.
- Màn gói 6: ném đà.
- Sửa các màn đang dùng aim(3): gói 6 có 8 màn, gói 8 và gói 9 mỗi gói 1, mùa ẩn 7. Sửa thêm 11 màn chéo ở các gói sau.

## 6. Nền đỏ có sẵn (không do đợt này)
- `hoc/kiem-lo-trinh.mjs`: AssertionError ở thứ tự gói mùa 1 ('combo' / 'hai-robot'). Lỗi dừng ở mục đầu nên các mục mùa 2 phía sau của máy kiểm này KHÔNG chạy. Agent E2 phải kiểm bằng một bản tạm.
- `hoc/kiem-ve-vector.mjs`: HỎNG 1/101, mục 13a-v, từ commit 2f0cac4 "mắt ba vòng".

## 7. Luật làm việc đã áp
- Agent không chạy `npm test` cả bộ (từng hết RAM); chạy từng máy kiểm ở tiền cảnh với `timeout 300`.
- Agent không push, không merge main, không dùng `git checkout --` / `reset --hard` / `stash`.
- Gói fail một lần thì giao lại ở model cao hơn một bậc. Agent E (opus) treo lúc chờ máy kiểm chạy nền, nên E2 giao cho fable.
- Ngưỡng sao sửa tay ở `hoc/lo-trinh-sao.js`, không chạy `--ghi-sao`.
- Còn sót worktree `.claude/worktrees/nghiem-thu`: xoá bị "Permission denied".
