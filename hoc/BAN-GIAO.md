# Bàn giao phiên (28/10/2026 sáng) — đọc đầu tiên khi mở phiên mới

Phiên trước (27–28/10) chạy qua đêm. Máy ngủ khoảng 01:20 → 08:00 nên agent V5a dừng giữa chừng; phần dở đã cất thành commit WIP.
Tệp này đủ để phiên sau làm tiếp mà không cần đọc lại hội thoại cũ.

## 1. Chỗ làm việc

- Repo: `D:\Users\tuanla2\game\doi-robot-chan-hung`. Worktree làm việc chính: `.claude\worktrees\tay-gap-xoay-comparison-00c53c`,
  nhánh **`claude/tay-gap-xoay-comparison-00c53c`** (HEAD lúc bàn giao: commit bàn giao này, ngay sau 0e1f4a8). **Chưa push gì.**
- Xem game: cấu hình preview `game-mua-1` cổng **4181** (`preview_start name game-mua-1` sau mỗi lần khởi động lại phiên).
  Vào thẳng màn: `http://localhost:4181/hoc/game/choi.html?ve=vector&debug=1&man=<mã>` (vd `omni.3`, `hai-robot.2`); `?ve=pixel` để so.
  Trang xem bộ vẽ vector: `http://localhost:4181/hoc/hinh-mau/xem-vector.html`.
- Kiểm: `npm test` (81 bộ, ~10 phút, chạy nền, ghi ra tệp). Nhanh: `node hoc/kiem-ve-vector.mjs` (85), `node hoc/kiem-bang-mau.mjs` (19).

## 2. Luật làm việc (user dặn, giữ nguyên)

- **Không push** trừ khi user bảo. Hỏi trước khi tiêu tiền (retro-diffusion, PixelLab…).
- Claude (phiên chính) lập kế hoạch + nghiệm thu; **agent con viết**. Chạy **TUẦN TỰ** từng agent, canh thường xuyên:
  quá 40 phút không commit → nhắc (SendMessage: báo trạng thái một dòng, commit WIP); nhắc 20 phút vẫn im / 90 phút không tiến → dừng, thu hồi, giao lại gói hẹp.
- **Phân việc (user 28/10):** gói **VẼ / giao diện** (V5a → V7) → agent con Claude (opus). Gói **NỘI DUNG / màn** (gói 8, 9, 10 mùa 2 và các mùa sau) → **Gemini qua agy**,
  Claude chỉ nghiệm thu. Lệnh agy và bẫy: memory `noi-dung-giao-gemini` (model `gemini-4-argon-high`, `--print`, chạy nền, cwd = worktree riêng; không nhận tin giữa chừng;
  có thể tự commit, có thể bịa báo cáo → tự chạy máy kiểm + do-duong + npm test + xem trình duyệt trước khi gộp; dặn tắt server trước khi kết thúc).
- Nghiệm thu một gói: gộp `--no-ff` vào nhánh chính → `npm test` 81/81 → xem trình duyệt 4181 → ghi dòng trạng thái vào kế hoạch → commit → giao gói kế.
- Brief theo khuôn có sẵn (NHỊP · LOẠI / MODEL · MỤC TIÊU · BỐI CẢNH · CÁCH LÀM · PHẠM VI · CÁCH GIAO · KIỂM TRA · BÁO CÁO 5 mục). Mẫu: `hoc/ban-giao/brief-V4.md`.
- Máy 16 GB: không chạy hai `npm test` cùng lúc. Trước khi để chạy qua đêm: `request_keep_awake` VÀ nhắc user tắt chế độ ngủ của Windows (đêm 28/10 máy vẫn ngủ).

## 3. Hàng đợi (theo thứ tự)

| # | Gói | Ai làm | Trạng thái |
|---|---|---|---|
| 1 | **V5a** giao diện màn chơi phẳng diem10code | agent Claude | **DỞ** — xem mục 4 |
| 2 | V5b các màn khác (màn đầu, bản đồ gói / màn, Lắp robot, sổ lệnh, hộp mở khóa / part, màn xong, giới thiệu part, khung thẻ phim) + icon `.pxi` sang vector + robot màn đầu có mắt biểu cảm | agent Claude | chưa giao, chưa có brief |
| 3 | V6 huy hiệu + phim vector (`huy-hieu.js` đang gọi thẳng `Part.ghep` nên luôn pixel; `phim-mua-1.js` hằng VAT = 57 chưa theo `VeRobot.veCo`; phim dùng được biểu cảm mắt) | agent Claude | chưa giao |
| 4 | V7 đổi mặc định sang vector, chạy ổn rồi gỡ bộ vẽ pixel (user chốt 27/10: giữ pixel tới hết V6) | agent Claude | chưa giao |
| 5 | Gói 8 mùa 2 **Đội** (xích + súng hơi, `warm()` thấy robot) | Gemini (agy) | chưa giao |
| 6 | Gói 9 mùa 2 **Combo Bệ súng xích** (`cfg.beSung`, bắn tụ không giật) | Gemini (agy) | chưa giao |
| 7 | Gói 10 mùa 2 **Tổng hợp + trùm "Nhà máy chạy lại"** | Gemini (agy) | chưa giao |
| 8 | Phim mùa 2 | (chưa chốt) | sau gói 10 |

Kế hoạch chi tiết: `hoc/KE-HOACH-GOP-DIEM10CODE.md` (gói V, mục 2c + các dòng trạng thái V1–V4, phạm vi V5a / V5b), `hoc/KE-HOACH-MUA-2.md` (bảng 10 gói, trạng thái gói 1–7),
`hoc/KE-HOACH-7-MUA.md` (bảng 7 mùa; mục "Ý tưởng gói nội dung sau": drone gắp + phun sơn xuống ô dưới, chốt khi lập kế hoạch mùa 4).

## 4. V5a đang dở — cách làm tiếp

- Worktree: `D:\Users\tuanla2\game\doi-robot-chan-hung\.claude\worktrees\agent-a2b177d2cde83df28`, nhánh **`claude/ve-vector-giao-dien-a`** (từ 0e1f4a8). Brief: `hoc/ban-giao/brief-V5a.md`.
- Đã commit: 32daa0b vùng 1 (phông Google Sans Flex / Code cất ở `hoc/game/font/gsflex-*.woff2`, `gscode-*.woff2`; `choi-vector.css` áp khi `body.ve-vector`; vai `vec*`),
  7a8c0cc vùng 6 + 2 (mọi nút phẳng, thanh trên, cột nút sân, bảng nhịp, khung sân, toast), 0f3298d vùng 3 (khung code: ô mã, số dòng, dòng chọn / chạy / lỗi, tô màu cú pháp, thẻ R1 / R2),
  **91b81ae WIP** (vùng 2 làm thêm dở: thanh trên, đồng hồ, khung sân, toast — agent dừng do máy ngủ).
- Còn: xem lại vùng 2 → vùng 4 khối lệnh `.brick` thành thẻ phẳng → 5 khay / hộp / gợi ý / hộp kết quả / menu → 7 bỏ `steps()` → 8 phông chữ canvas (bong bóng, pin) →
  9 robot ngoài sân ×1,2 ở vector → 10 công tắc Cài đặt "Kiểu vẽ" → 11 cỡ ô sân + khổ 360 × 640 → máy kiểm + trang xem mục V5a → npm test một lần → báo cáo.
- Giao lại: agent mới (opus, worktree riêng) với brief V5a + câu "tiếp nối nhánh claude/ve-vector-giao-dien-a từ 91b81ae: `git checkout claude/ve-vector-giao-dien-a`,
  đọc `git log 0e1f4a8..` và choi-vector.css, làm tiếp từ vùng 2 (soát) và 4". Hoặc dùng lại worktree cũ nếu còn.

## 5. Đã xong trong phiên (để biết bối cảnh)

- Mùa 2 gói 1–7 xong (gói 3, 5, 6 chương 2, 7 viết mới; lõi S1, S2). A1 bảng màu (`hoc/game/bang-mau.js`, `--g-*` / `BM.*`).
- Chuyển hẳn sang **vector** (user 27/10): một hình mỗi bộ phận, quay mặt xuống, xoay cả nhóm; thân A vỏ trắng; **màu đội ở kính + mắt + chấm ăng-ten** (R1 `#38BDF8`, R2 `#F472B6`).
  Bật bằng `?ve=vector` (mặc định vẫn pixel tới V7).
  - V1 bộ vẽ (`ve-vector.js`), V2 mọi ô / vật, V3 mọi thân / tay / cảm biến (luật ghép như pixel, 1680 tổ hợp), V4 hoạt cảnh (`ve-vector-hieu-ung.js`), gộp tới 0e1f4a8, npm test 81/81.
  - Theo user ở V4: mắt biểu cảm (chớp theo thời gian, đâm X, va nhau "> <", vui "^ ^", ngạc nhiên, buồn, lim dim, chờ, liếc; nét dày), cảm xúc khi robot tương tác,
    cờ gợn bay, sàn bàn cờ hai tông xám nhẹ, **camera là khối ống kính trên trụ ở ĐUÔI** (mắt chỉ để biểu cảm), cảm biến dính vỏ từng thân.
- Luật chơi giữ: drone chỉ gắn nam châm + cảm biến khoảng cách / màu / camera-bay (ý tưởng mở rộng ghi ở KE-HOACH-7-MUA).

## 6. Tự quyết trong đêm (chưa báo user — báo khi mở phiên)

- Robot vector ở màn ngoài sân nhỏ hơn pixel ~17% → phóng ×1,2 (nằm trong V5a vùng 9).
- Cảm biến hông đặt trên vỏ, không chờm mép bánh → giữ.
- Nòng sau súng hơi lệch trái ăng-ten ~0,12 ô → giữ.
- Màn nhiều robot: kính + chấm ăng-ten đủ phân biệt R1 / R2 → không thêm dải màu đội.

## 7. Rủi ro / việc treo

- Biểu cảm mắt ở ô 24 px rất nhỏ (dải kính ~4 px), chưa soi trên điện thoại thật.
- Bộ đệm hình vector tối đa 600 hình rồi xoá làm lại; chưa đo hiệu năng máy yếu.
- Lỗi console "An unknown error occurred when fetching the script" ở choi.html / xem-vector.html: mọi script vẫn nạp đủ, chưa rõ nguồn.
- Máy kiểm `kiem-ve-vector.mjs` mục 13a cần git + commit a962f7b (so lệnh vẽ pixel với nền).
- Các worktree agent cũ (agent-a…) còn trên đĩa; dọn khi chắc không cần (`git worktree list`).
