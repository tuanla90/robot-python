# Mùa 4 Cảng sông và Mùa 5 Bến sông: luật lõi và hình (31/10/2026)

Bảng 9 mùa: [KE-HOACH-7-MUA.md](KE-HOACH-7-MUA.md). Tài liệu này là đặc tả để dựng **lõi** (`hoc/san-hoc.js`, `nhan/san-robot-core.js`, `hoc/cham.js`) và **hình** (`hoc/game/ve-vector-*.js`, `hoc/game/san-ve.js`) của hai mùa mới. Chưa dựng màn.

Quyết định của user ngày 31/10 (trả lời 4 câu hỏi):
1. Cần cẩu quay **8 nấc** một vòng (có hướng chéo).
2. Lệnh cần cẩu **mỗi lệnh một nhịp** (tự trôi nhịp như `go_up()` của nhện, drone).
3. Chong chóng mùa sông trả hướng dòng **theo mũi xuồng** (`"front"` / `"back"` / `"left"` / `"right"` / `"none"`), như camera 4 hướng.
4. Vật đang kéo bằng dây phao **chiếm ô** (ở mũi thì vướng khi quay; buộc đuôi thì nối đuôi, không vướng).

Mã mùa trong code: hai mùa mới chưa có trong lộ trình; lõi và hình làm trước, màn làm sau. Mọi luật mới chỉ bật khi màn dùng đúng loại robot / ký hiệu / lớp mới, nên **màn cũ không đổi**.

---

## 1. Review đặc tả Bến sông (bản 31/10 trên nhánh `claude/phim-clb`)

Bản đặc tả có khung tốt (xuồng, neo, dây phao, buộc đuôi, chong chóng, cống). Những chỗ phải sửa trước khi dựng lõi:

| # | Chỗ trong bản cũ | Vấn đề | Sửa |
|---|---|---|---|
| 1 | Ô dòng chảy ký hiệu `^ > v <` | Trùng ký hiệu **băng chuyền** đang dùng ở mùa 1–2 | Nước là ký hiệu `~`; dòng chảy là **lớp** `cfg.dong` trên ô nước (như `cfg.lua`) |
| 2 | "Cuối mỗi nhịp dòng đẩy xuồng suc ô; ngược dòng phải đi bù hoặc bật động cơ vượt dòng" | "Động cơ vượt dòng" không có lệnh nào; xuồng đi 1 ô / nhịp nên ngược dòng sức 1 là đứng im, sức 2 là lùi: "đi bù" không làm được | Bỏ "động cơ vượt dòng". Luật rõ: ngược dòng sức 1 đứng im, sức 2 bị đẩy lùi 1; muốn đứng vững thì **thả neo**; muốn qua thì vòng nhánh khác, hoặc tắt dòng bằng **van cống** |
| 3 | Số âm `-1`, `+1` "bù bước" là Python A | Số âm đã chuyển sang mùa Cảng (bảng 9 mùa) | Python A Bến sông là `return` |
| 4 | `for h, s in ...` | Duyệt danh sách là Python của mùa 6 (Nông trại), Bến sông chưa có list | Bỏ; tuple chỉ tạo, lấy `t[0]`, `t[1]`, so sánh, gỡ cặp khi gán |
| 5 | `flow_dir()` trả `"up"` / `"down"` / … theo bản đồ, đọc "ô trước mũi (hoặc ô hiện tại)" | Hai khung lẫn nhau (xuồng có mũi), và chưa chốt đọc ô nào | User chốt: theo mũi xuồng. Đọc **ô trước mũi** (như mọi cảm biến có mũi), để ở ngã ba quay mũi đọc từng nhánh (bài `min` / `max` gói 7) |
| 6 | Cần gạt van cống "xuồng áp sát hoặc quăng dây gạt" | Hai cách, chưa rõ cách nào | Một cách: **`tow()` quăng dây trúng van** thì kéo cần gạt, van đổi (như tia nước trúng van hơi mùa 2). Tay của mùa làm việc với cơ chế của mùa |
| 7 | Cống "đảo chiều hoặc bật / tắt dòng chảy" | Đảo chiều cần thêm một luật, khó vẽ, khó đoán | Chỉ **bật / tắt**: van nối cửa cống và các ô dòng (như nút nối cửa và băng chuyền) |
| 8 | Bảng ghi thêm "Âu tàu (mực nước)" | Mực nước là một chiều mới, không có trong đặc tả lõi | Bỏ khỏi mùa này |
| 9 | Bè "ghép làm cầu phao" cho xe cạn | Chưa nói bè trôi thì xe trên bè ra sao | Bè chỉ làm cầu khi nằm trên **nước êm** (ô không có dòng đang chạy); xe cạn đi qua như sàn |
| 10 | Vật kéo ở mũi "vướng tường khi quay" | Lõi hiện chưa có khái niệm vật kéo chiếm ô cạnh xe | Giữ (user chốt), đặc tả đủ ở mục 2.5–2.6 |
| 11 | Ô phao đích, bến nhận bè | Cờ `F` và ô đích `D` là sàn cạn | Thêm `Q` (phao đích: cờ trên nước) và `q` (ô đích trên nước cho bè) |
| 12 | Xuồng "có mũi hướng 0..3", lệnh trong tool phim là `left_move` / `right_move` / `wait` | Đúng, nhưng chưa nói luật chạy | Xuồng dùng **luật xe hai bánh** (hai chân vịt = hai bánh): `move()`, `turn_right()` mùa 1 chạy đúng |

---

## 2. Luật Bến sông (mùa 5): Tàu thủy lợi R1

### 2.1 Ký hiệu sân mới
| Ký hiệu | Ô | Ghi chú |
|---|---|---|
| `~` | Mặt nước | Chỉ xuồng đi được; drone bay qua; xe cạn và nhện **đâm như tường** (`dam-tuong` vat `'nuoc'`, không chìm) |
| `Q` | Phao đích | Ô nước có cờ: xuồng tới là thắng (`toi-co`) |
| `q` | Bến nhận bè | Ô nước là ô đích cho vật nổi (mục tiêu `dua-vat`) |
| `B` | Bè hàng nổi trên nước | Vật nổi, ô dưới là nước |
| `L` | Đám lục bình trên nước | Vật nổi, cùng luật bè (khác hình) |
| `K` / `k` | Cống đóng / cống mở | Ô nước có cửa cống. Đóng: chặn xuồng, chặn vật nổi trôi, chặn dây phao (như cửa `C`). Mở: như nước |
| `V` | Van cống | Cần gạt trên bờ, chiếm ô như tường (như nút `N`); dây phao trúng thì đổi |

Lớp mới `cfg.dong = [{ x, y, huong, suc }]` (màn nhiều sân: mảng song song với `san`): ô phải là `~` / `q` / `Q` / `k`; `huong` 0–3, `suc` 1 (dòng thường) hay 2 (dòng xiết).

### 2.2 Xuồng (thân gốc, gói 1)
- `loaiRobot: 'xuong'`, lệnh gốc như xe hai bánh: `left_move`, `right_move`, `left_back`, `right_back`, `wait` (ra lệnh, `wait()` trôi nhịp, tiến / lùi 1 ô, quay 90°). Mọi luật bánh (đấu dây ngược, xe mờ…) dùng lại.
- Chỉ vào được ô nước (`~` `Q` `q` `k`, ô có dòng). Vào bờ (mọi ô khác), cống đóng, ô có vật nổi, robot khác: đâm, `dam-tuong` với vat `'bo'` / `'cong'` / `'vat'`.

### 2.3 Dòng chảy (sàn, gói 4)
- Pha (d) của nhịp, chỗ băng chuyền: xuồng **không neo** đứng trên ô dòng **đang chạy** bị đẩy `suc` ô theo `huong`, **mỗi nhịp** (nước chảy liên tục, khác băng chuyền 2 nhịp). Đẩy từng ô; ô kế không vào được (bờ, cống đóng, vật nổi, robot) thì dừng ở ô cuối đi được.
- Chỉ xét ô xuồng đứng **sau khi chạy**; trôi sang ô khác trong cùng nhịp thì không xét tiếp ô mới.
- Hệ quả: xuôi dòng 1 + sức; ngược dòng sức 1 đứng im, sức 2 lùi 1; đi ngang dòng thì trôi chéo.
- Vật nổi tự do (không bị kéo) trên ô dòng đang chạy cũng trôi cùng luật. Thứ tự: **vật nổi trôi trước** (theo thứ tự id), rồi xuồng.
- Sự kiện: `'troi'` `{ nhip, ai: 'robot'|'vat', id?, tu, den, huong, soO }`, `'troi-chan'` (đẩy 0 ô vì bị chặn, kèm `vat`).

### 2.4 Thả neo (nâng cấp thân, gói 5)
- `anchor()` / `unanchor()` ra lệnh, làm ở nhịp `wait()` kế tiếp (như lệnh tay). Cặp ngược trong `LENH_NGUOC`.
- Đang neo: dòng không đẩy xuồng (`'neo-giu'`); lệnh bánh bị bỏ (`'dang-neo'`, lỗi, như `'dang-dau'` của drone); dây phao vẫn dùng được.
- Vết nhịp: `robot.neo` true / false.

### 2.5 Dây phao kéo (tay gốc, gói 2)
- `tow()` ra lệnh, làm ở pha (b) của nhịp (trước bánh). Dây bay thẳng theo mũi tối đa **3 ô** (`TAM_KEO`), dừng ở thứ đầu tiên:
  - vật nổi: kéo về **ô trước mũi** (vật ngay trước mũi thì chỉ móc); sự kiện `'keo-vat'` `{ id, tu, den, soO }`.
  - van cống `V`: van đổi (`'van-doi'`), cửa cống / dòng của nhóm đổi như nút (mục 2.8).
  - bờ, cống đóng, robot, mép sân, hết tầm: hụt (`'keo-hut'` thông tin, kèm `vat`).
- Vật đang kéo ở mũi (**chiếm ô trước mũi**): tiến thì vật đi trước, ô trước vật phải vào được (nước, không có gì), không thì cả hai đứng im (`'mui-vuong'`, lỗi); lùi thì vật theo sau mũi; **quay** thì vật chuyển sang ô trước mũi mới, ô đó phải là nước trống, không thì lệnh quay bị bỏ (`'mui-vuong'`). Dòng đẩy xuồng thì cả cụm cùng đi, ô kế của xuồng hay của vật bị chặn thì cụm dừng.
- `drop_tow()` thả vật tại ô nó đang nằm. `tow()` khi đang kéo: `'dang-keo'` (lỗi).
- Vật đang kéo không tự trôi.

### 2.6 Buộc dắt theo đuôi (nâng cấp tay, gói 6)
- `tether()`: vật đang kéo ở mũi chuyển ra **ô sau đuôi** (ô đó phải là nước trống, không thì `'duoi-vuong'`); không kéo gì mà ô sau đuôi có vật nổi thì móc luôn. `untether()` thả vật tại ô nó nằm.
- Luật nối đuôi: xuồng dời 1 ô (tiến, lùi, trôi) thì vật **vào đúng ô xuồng vừa rời** (như toa tàu), nên quay xong tiến qua khúc cua không bao giờ vướng. Xuồng dời **vào chính ô vật** (lùi thẳng vào bè) thì bị chặn (`'duoi-vuong'`). Quay tại chỗ thì vật đứng yên.
- Vết nhịp: `robot.keo = { id, cho: 'mui'|'duoi' } | null`.

### 2.7 Chong chóng dòng chảy (cảm biến gốc gói 3, nâng cấp gói 7)
- Part `{ ma: 'dong-chay', o: 'tren' }`. Đọc **ô trước mũi**, không tốn nhịp (như mọi cảm biến; chung bộ đếm 1000 lần đọc liên tiếp).
- `flow_dir()` trả chuỗi theo mũi xuồng: `"front"` (nước chảy cùng chiều mũi, ra xa xuồng), `"back"` (chảy ngược về phía mũi), `"left"`, `"right"`, `"none"` (nước êm, dòng tắt, bờ, ngoài sân).
- `flow()` (nâng cấp) trả **tuple** `(huong, suc)`, vd `("back", 2)`, `("none", 0)`.
- Sự kiện `'doc-cam-bien'` với `cam: 'dong-chay'`.

### 2.8 Cống thủy lợi (cơ chế, gói 4)
- Van `V` nối nhóm như nút: `cfg.noi = [{ nut: {x,y}, cua: [{x,y}], dong: [{x,y}] }]`; không khai `noi` thì mỗi van điều khiển mọi cống và mọi ô dòng (như nút với cửa và băng).
- Van đổi thì: ô dòng của nhóm bật ↔ tắt **ngay** (như băng chuyền); cống đổi đóng ↔ mở ở **cuối nhịp** (như cửa; không đóng xuống ô có xuồng / vật: `'cong-ket'`).
- Kết quả: `dongTat` [{x,y}], `cong` [{x,y,mo}], `van` [{x,y,bat}].

### 2.9 Vật nổi, cầu phao, mục tiêu
- Vật nổi chỉ nằm trên ô nước; chiếm ô (xuồng không vào).
- **Cầu phao**: xe cạn (hai bánh, xích, omni, nhện) đi vào ô nước có vật nổi **khi ô đó không có dòng đang chạy** thì đi được như sàn; đang có xe đứng trên thì `tow()` không kéo vật đó (`'keo-hut'` vat `'co-xe'`) và vật không trôi.
- Mục tiêu `'dua-vat'`: thắng khi mọi vật nổi nằm trên ô `q`. Mục tiêu `'toi-co'`: xuồng tới `Q` (hay `F` với xe cạn).

### 2.10 Python Bến sông
- Python A `return`, Python B `tuple`, gói 7 `min` / `max` (chi tiết ở KE-HOACH-7-MUA.md).
- Nhân phải thêm: **tuple** (literal `(a, b)`, `t[0]` `t[1]`, `len(t)`, `==` `!=` `<` `>` so từng phần tử như Python, gỡ cặp `h, s = flow()`, `print` / `str` ra `("back", 2)`), hàm dựng sẵn **`min`, `max`** (2 đối số trở lên, số hay tuple; một danh sách khi mùa 6 dùng). Gán vào phần tử tuple là lỗi lời Việt.

---

## 3. Luật Cảng sông (mùa 4): Cần cẩu container R1

### 3.1 Ký hiệu và lớp
| Ký hiệu / lớp | Ô | Ghi chú |
|---|---|---|
| `.` | Bãi container (sàn) | Container đặt được |
| `~` | Nước | Không đặt container (trừ ô tàu khi tàu có mặt) |
| `T` | Ô boong tàu | Trên nước; đặt container được **khi tàu có mặt** |
| `R` | Ray | Sàn có ray (nâng cấp thân); xe khác đi qua như sàn |
| `D` | Ô đích trên bãi | Dùng lại |
| `cfg.chong = [{ x, y, cont: [{ so, tan? }] }]` | Chồng container | Đáy → đỉnh; `so` 1–99, `tan` 1–4 (mặc định 1); ô ghi `.` / `D` / `T`; cao tối đa `CHONG_TOI_DA = 4` |
| `cfg.tau = [{ o: [{x,y}], co, vang, pha? }]` | Tàu cập / rời | Tàu có mặt khi `(t + pha) mod (co + vang) < co` (như cửa nhịp) |

### 3.2 Cần cẩu (thân gốc, gói 1)
- `loaiRobot: 'cau'`. **Bệ** đứng ở ô xuất phát, chiếm ô như tường với robot khác. Cần có **nấc** 0–7 (0 lên, 1 lên-phải, 2 phải, 3 xuống-phải, 4 xuống, 5 xuống-trái, 6 trái, 7 lên-trái) và **tầm** 1–3 (`cfg.batDau.nac`, `cfg.batDau.tam`; mặc định 0 và 1).
- **Đầu cần** ở ô `bệ + tam × (dx, dy)` của nấc (nấc chéo: `(±tam, ±tam)`).
- Lệnh gốc, **mỗi lệnh một nhịp** (tự trôi): `swing_left()` (nấc − 1, mod 8) / `swing_right()` (nấc + 1, mod 8), `extend()` / `retract()` (tầm ± 1), `wait()`. Cặp ngược: swing_left ↔ swing_right, extend ↔ retract.
- Cần **cao hơn mọi thứ**: quay / vươn qua tường, chồng container, robot. Vươn quá tầm 3, thu dưới 1, hay đầu cần ra ngoài sân: không làm, mất nhịp (`'can-het-tam'` lỗi, kèm `lenh`).
- Vết nhịp: `robot.nac`, `robot.tam`, `robot.dau` (ô đầu cần), `robot.treo` (mảng container đang treo, đáy → đỉnh).

### 3.3 Móc cẩu (tay gốc gói 2, nâng cấp gói 6)
- Tên lệnh (chốt khi làm lõi 31/10): `pick_up()` / `set_down()` / `pick_up2()`, không dùng `hook()` / `unhook()` vì mùa 3 (gói Bụng nhện, màn 2–3) dạy em tự đặt hàm tên `hook()` / `unhook()`: lệnh gốc trùng tên thì kho hàm của em bị cấm.
- `pick_up()` (1 nhịp): nhấc container **trên cùng** ở ô đầu cần (`'moc-cont'`). Không có container: `'moc-hut'`; đang treo: `'dang-treo'` (lỗi).
- `set_down()` (1 nhịp): hạ container đang treo lên **đỉnh chồng** ở ô đầu cần (`'ha-cont'`). Không hạ được (tường, nước, ô tàu khi tàu vắng, chồng đầy, ô bệ / robot): `'ha-bi-chan'` `{ vat }`, container vẫn treo.
- **Nhấc đôi** (gói 6): `pick_up2()` nhấc **hai** container trên cùng một lần, giữ thứ tự; `set_down()` hạ cả hai. Chồng chỉ có 1: `'moc-thieu'` (lỗi, không nhấc).
- Container treo đi theo đầu cần.

### 3.4 Máy quét mã (cảm biến gốc gói 3, nâng cấp gói 7)
- Part `{ ma: 'quet-ma', o: 'tren' }`, đọc không tốn nhịp.
- `read_code()` trả **số** của container trên cùng ở ô đầu cần; không có container thì **`-1`** (số âm: dạy ngay ở gói 3).
- **Cân tải** (nâng cấp): `weight()` trả số tấn: của container đang treo (tổng nếu treo đôi), không treo thì của container trên cùng ở đầu cần; không có gì thì `0`.
- **Luật tải** (màn khai `cfg.taiToiDa = M`, từ gói 7): tổng tấn đang treo × tầm phải ≤ M. `pick_up()` / `pick_up2()` ở tầm làm vượt M: không nhấc (`'qua-tai'`, lỗi); `extend()` khi đang treo mà làm vượt M: không vươn (`'qua-tai'`). Đúng biểu đồ tải của cẩu thật, và dạy nhân: `if weight() * tam <= 12`.

### 3.5 Chạy trên ray (nâng cấp thân, gói 5)
- `rail(n)`: `n` số nguyên khác 0, `abs(n) ≤ 9`; bệ chạy `abs(n)` ô dọc ray, **tốn `abs(n)` nhịp** (mỗi nhịp 1 ô); `n > 0` chạy về phía phải (ray ngang) / xuống (ray dọc), `n < 0` ngược lại. Ô kế không phải ray hay có robot: dừng (`'het-ray'`, lỗi), phần còn lại bỏ. Container treo đi theo. `n` sai: lỗi chạy lời Việt.
- Bệ đứng trên ray lúc xuất phát mới chạy được.

### 3.6 Tàu cập / rời bến (cơ chế, gói 4)
- Tàu có mặt: ô `T` là boong, hạ container được. Tàu vắng: ô `T` là nước.
- Cuối nhịp tàu chuyển từ có mặt sang vắng: mọi container trên boong **được giao** theo tàu (`'tau-roi'` `{ nhip, tau, cont: [so] }`), boong trống; lượt sau tàu về boong trống.
- Mục tiêu `'giao-tau'`: `cfg.giao = [{ tau: i, so: [..] }]`; thắng khi mọi container yêu cầu đã giao đúng tàu. Giao container không có trong danh sách của tàu đó: thua ngay (`dungSom = 'giao-nham'`).
- Mục tiêu xếp chồng (`'bong-mo'` mở rộng): `bongMo.chong = [{ x, y, so: [..] }]` lúc xong mọi chồng phải đúng (bài sắp xếp, Tháp Hà Nội). Màn Tháp Hà Nội khai `cfg.luatThap = true`: hạ container số lớn lên container số nhỏ hơn bị từ chối (`'thap-sai'`).

### 3.7 Python Cảng sông
- Python A **số âm, `abs()`**, Python B **`%`, `//`**. Nhân có số âm, `//`, `abs` (31/10); `%` đã sửa theo Python (`-5 % 8 = 3`, cùng dấu số chia) để `(b - a) % 8` đúng với số âm.
- Bài số học gợi ý: quay từ nấc `a` tới nấc `b` hết `(b - a) % 8` lần `swing_right()`; mã container `so // 10` là tàu, `so % 10` là vị trí; `rail(dich - x)` với số âm; `abs(dich - x)` là số nhịp; luật tải `tan * tam <= M`.

---

## 4. Hình cần vẽ

Mọi hình vẽ theo hệ 100 qua `VeVector.dangKy` như các part đang có (`ve-vector-than-*.js`, `ve-vector-tay-*.js`, `ve-vector-o2.js`, `ve-vector-vat.js`), cùng nét viền, bảng màu `BangMau`, gia đình thân A (vỏ trắng, kính + mắt Sola).

**Bến sông**: hình đã vẽ cho phim ở `phim-clb/tools/xuat-m4.mjs` (nhánh `claude/phim-clb`): chép sang game rồi sửa theo luật trên.
- Thân `xuong` (trạng thái: `neo`, `dat` đang buộc đuôi), tay `day-keo` (trạng thái `day`: dây đang quăng), cảm biến `dong-chay` (`bat`).
- Ô: `nuoc` (`~`), dòng chảy (lớp `dong`: hướng, `xiet`, `tat`), `cong-thuy-loi` (`K` / `k`), van cống `V` (`bat`), phao đích `Q`, bến nhận bè `q`.
- Vật: `be-go` (`B`), `luc-binh` (`L`).
- Hoạt cảnh: dây phao bay ra / kéo về, vật kéo ở mũi / đuôi (dây nối), gợn trôi theo dòng, mỏ neo hạ.

**Cảng sông**: vẽ mới.
- Thân `cau`: bệ cẩu (chân đế, ổ quay, cabin vỏ trắng + kính + mắt), vẽ ở ô bệ; **cần** là lớp vẽ riêng theo toạ độ sân, từ bệ tới đầu cần (theo `nac`, `tam`), có cáp + móc ở đầu cần, container treo dưới móc (nhìn từ trên: hơi to hơn, có bóng đổ). Trạng thái: `treo`, `ray` (bánh ray dưới bệ).
- Tay `moc-cau` (`doi`: móc đôi), cảm biến `quet-ma` (`bat`: tia quét đỏ), nâng cấp cân tải (đồng hồ cân).
- Ô: bãi container (bê tông kẻ vạch vàng), `T` boong tàu (có mặt / vắng: thân tàu hiện / mặt nước), `R` ray.
- Vật: container (màu theo `so % 4` hay theo tàu, **số in to** trên nóc), chồng container (thấy **số tầng**: lệch nhẹ + vạch tầng + số nhỏ ở góc).
- Hoạt cảnh: quay cần, vươn / thu, móc nhấc / hạ, tàu vào / ra.

Thẻ part (`hoc/gioi-thieu-part.js`, `hoc/game/the-part.js`) và icon: thêm cho 6 part mới (3 mỗi mùa) + nâng cấp.

---

## 5. Thứ tự làm và kiểm

1. Hình hai mùa + trang xem thử `hoc/game/xem-mua-moi.html` (mọi hình, mọi trạng thái).
2. Lõi Bến sông + nhân Python (tuple, `min`, `max`, `abs`); máy kiểm `hoc/kiem-mua-song.mjs`, `nhan/kiem-tuple.mjs`.
3. Lõi Cảng sông; máy kiểm `hoc/kiem-mua-cang.mjs`.
4. Nối hình với lõi trong `san-ve.js` (vẽ theo vết nhịp), sân chơi thử trong trang xem thử.
5. `npm test` cả bộ (mọi máy kiểm cũ phải đạt: màn cũ không đổi).
