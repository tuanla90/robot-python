# Bàn giao: viết lại phim gói CLB cho mùa 2–9 theo khuôn mùa 1 (2/11/2026)

Mùa 1 (`phim-clb/src/doc/m1.tsx`) là **bản mẫu đã được user duyệt từng góp ý**. Session nhận một mùa thì đọc tệp này, rồi đọc đúng ba tệp:
`hoc/LUAT-SUA-PHIM-CLB.md` (luật, mục 1–8), `hoc/KE-HOACH-SUA-PHIM-GOI.md` (quyết định của user và bảng mẫu mùa 1), `phim-clb/src/doc/m1.tsx` (mã mẫu).
Không hỏi lại user những gì ba tệp đó đã chốt.

## 1. Phân việc, tệp được sửa

| Mùa game | Tệp phim | Mã phim | Hình robot / ô | Công cụ xuất hình |
|---|---|---|---|---|
| mua-2 Nhà máy | `src/doc/m2.tsx` | `M2G<n>-Mo/Ket` | `public/robot/m2/` | `tools/xuat-m2.mjs` |
| mua-3 Bãi tái chế | `m3.tsx` | `M3G<n>` | `robot/m3/` | `xuat-m3.mjs` |
| mua-4 Cảng sông | `cang.tsx` | `MCG<n>` | `robot/cang/` | `xuat-cang.mjs` |
| mua-5 Bến sông | `m4.tsx` | `M4G<n>` | `robot/m4/` | `xuat-m4.mjs` |
| mua-6 Nông trại | `m5.tsx` | `M5G<n>` | `robot/m5/` | `xuat-m5.mjs` |
| mua-7 Mỏ đá | `m6.tsx` | `M6G<n>` | `robot/m6/` | `xuat-m6.mjs` |
| mua-8 Hang động | `m7.tsx` | `M7G<n>` | `robot/m7/` | `xuat-m7.mjs` |
| mua-9 Về CLB | `m8.tsx` | `M8G<n>` | `robot/m8/` | `xuat-m8.mjs` |

- **Mỗi session một mùa, chỉ sửa tệp phim của mùa đó** và thêm ảnh vào thư mục robot của mùa đó. Ảnh part riêng mới (nếu mùa có part chưa có) thêm vào `tools/xuat-part.mjs` bảng `PART` và chạy lại; ảnh ra `public/robot/part/`.
- **Tệp dùng chung KHÔNG sửa** trong session mùa: `src/doc/kit-doc.tsx`, `src/doc/sa-ban.tsx`, `src/d10.tsx`, `src/may-phim.tsx`, `src/web/entry.tsx`, `src/PhimTayKep.tsx` (R1Ngang), `src/PhimMoDau.tsx`. Thiếu gì ở đó thì ghi vào mục "Cần thêm ở lõi" cuối báo cáo, không tự vá.
- Nhánh: worktree riêng `claude/phim-mua-<n>`, commit theo gói hoặc theo nhóm gói, không push lên main; xong mùa báo user gộp.

## 2. Khuôn một phim mở gói (bắt buộc, đúng thứ tự)

| # | Cảnh | Khung | Nội dung | Hàm mẫu trong m1.tsx |
|---|---|---|---|---|
| 0 | Kết gói trước (gói ≥ 2) | 180 | nền tối, bảng việc của người nhờ gạch một dòng, người nhờ một câu `out: 999` | `ThanhTuu`, `tt()` |
| 1 | Hiện trường: thử cách cũ, không được | 240 | sân của nơi chốn, **mọi vật ở tâm ô**, lỗi đúng vật lý game; người nhờ 1 câu + Sola/Luna 1 câu | `G2Thu`, `G4Thu` |
| 2 | Trong xe: Luna hỏi, Sola đáp, CẠCH | 160 | chỉ khi gói có part mới / nâng cấp; part thật trượt vào (`TrongXe`) | `xe()` |
| 3 | Sa bàn Lab: cơ chế, từng lệnh làm gì | 240 × 1–2 | sân thật của màn đầu gói, lệnh đúng tên game, bảng code sáng dòng theo nhịp, thử sai nhanh một lần rồi đúng | `G2Hut`+`G2Dung`, `G3Hoi`, `G4Nut`, `G7Hoi` |
| 4 | Câu treo | 100 | Sola 1 câu ≤ 8 chữ | `treo()` |

Gói 10: cảnh 1 = màn nhiều sân của game (`san` là mảng), một mật lệnh đếm cứng đạt sân 1, hỏng sân 2–3; cảnh Lab = một mật lệnh cảm biến qua mọi sân (`BaSan`, `TheSan`). Kết gói 10 riêng: thành tựu → tem Xuất xưởng → ngoài đời (1 thẻ, 1 câu) → nhá mùa sau (1 câu người nhờ mùa sau).

**Chuẩn gói cuối mùa:** 8 = tổng duyệt mọi yếu tố map (của mùa trước + mùa này) với xe mới; 9 = hai thiết bị (R2) với môi trường mới; 10 = tự động nhiều map. Kiểm thứ tự gói trong game (`lo-trinh-hoc.js` MUA_<n>) trước khi viết; lệch chuẩn thì **đổi game**, không đổi phim, và báo trong báo cáo.

## 3. Luật nội dung (rút từ user, chi tiết ở LUAT mục 1–8)

1. **Chữ**: bóng thoại ≤ 10 chữ, ≤ 2 bóng / cảnh, `bubbleTop={1180}`. Không nhãn tiếng Anh kỹ thuật (QUEST, STAGE, ONLINE, Test Case, hardcode). Luna chỉ hỏi, Sola đưa giải pháp, người nhờ không giảng luật.
2. **Nhịp**: 8 s / cảnh có thoại; "show ra từng lệnh làm gì, nói nhanh" (user khen gói 2). Phim tự phát liền mạch, không trông chờ nút Tiếp.
3. **Lệnh và hình phải thuộc gói**: chạy script ở mục 5 lấy danh sách lệnh / ký hiệu sân của 20 màn; trong phim không có lệnh hay vật lạ.
4. **Vật lý giống game**: đâm = khựng + sao choáng (không văng, không đổ), xoay tại chỗ luôn được, tay hạ mà bước = vướng, nút đè giữ cửa khi có xe/vật trên nút, đi từng ô một nhịp. Dùng `SaBan` của `sa-ban.tsx` cho mọi hoạt cảnh trên lưới; toạ độ ô **nguyên**.
5. **Góc máy**: cơ chế mặt bằng (đi, rẽ, cảm biến, nút, xoay tay) → nhìn từ trên; cơ chế đổi độ cao (hạ / nâng, cúi, nhảy, bay, co chân) → **góc ngang** với robot vẽ SVG kiểu `R1Ngang` (`PhimTayKep.tsx`). Mùa có thân mới cần bản ngang riêng thì ghi "Cần thêm ở lõi".
6. **Ghép part**: ảnh part riêng (`public/robot/part/`), không cắt từ ảnh xe đủ. Robot cùng cỡ ở mọi chế độ của `TrongXe` (ảnh 922 px dùng S9).
7. **Chuyển cảnh**: `Whip` đã cắt cảnh cũ; đừng để hai cảnh liền nhau cùng vị trí robot khác nhau mà không có lý do.
8. **Tên người nhờ**: Tùng (kho), Hạnh, Sơn (bãi), Mai (cảng), Bình (bến sông), Lan, Dũng, Phong, thầy hiệu trưởng. Không gọi thứ kiểu miền Nam.
9. **Hướng robot**: `huong` 0 lên, 1 phải, 2 xuống, 3 trái (như game); ảnh robot mũi quay phải, `SaBan` tự xoay. Chỉ bánh trái lăn → xe quay phải.

## 4. Quy trình một session

1. `git worktree add .claude/worktrees/phim-mua-<n> -b claude/phim-mua-<n> main`, làm trong đó; `cd phim-clb && npm i` nếu thiếu `node_modules`.
2. Chạy script mục 5 → bảng lệnh / ký hiệu / sân màn đầu của 10 gói; dán vào đầu tệp phim làm chú thích.
3. `node tools/xuat-m<n>.mjs` xuất lại hình robot / ô của mùa từ bộ vẽ game (cần Chrome). Part mới → `tools/xuat-part.mjs`.
4. Viết lại 20 phim theo khuôn mục 2, gói 2 trước (gói part tay) làm chuẩn, rồi 3–10, gói 1 cuối.
5. `npx tsc --noEmit -p tsconfig.json` (bỏ qua lỗi `react-dom/client` có sẵn) → `node tools/web/dong-goi.mjs`.
6. Soát ảnh: `node tools/chup-khung.mjs <mã gói>…` (khung giữa câu + khung dừng mỗi cảnh) và `CANH=<id> KHUNG=a,b,c node tools/chup-khung.mjs <mã gói>` cho hoạt cảnh; `python tools/ghep-soat.py out/soat/<mã>` ra bảng. Soát theo LUAT mục 7: chữ ≤ 10, không che nhãn / mặt, robot trên ô nguyên, không chữ ở dải nút đáy (y 1776–1920). Khung trống lẻ tẻ là ảnh chụp chưa kịp vẽ, chụp lại khung lân cận trước khi kết luận lỗi.
7. `node hoc/kiem-phim-goi.mjs`, `node hoc/kiem-dong-goi-artifact.mjs`, bộ kiểm của mùa (`hoc/kiem-*.mjs` liên quan) phải xanh.
8. Báo cáo `hoc/ban-giao/bao-cao-phim-mua-<n>.md`: bảng 10 gói (lệnh dùng, ký hiệu, cảnh, câu treo), ảnh bảng soát, mục "Cần thêm ở lõi", mục "Đổi game" (nếu đổi thứ tự gói).

## 5. Script lấy lệnh / ký hiệu / sân màn đầu từng gói (chạy ở gốc repo, đổi `mua-2`)

```bash
node -e "
const M=require('./hoc/lo-trinh-hoc.js'); const TT=require('./hoc/thu-tu-chuong.js');
const re=/([a-z_][a-z0-9_]*)\s*\(/g;
for (const g of TT.goi.filter(g=>g.mua==='mua-2')) {
  const chs=g.chuong.map(c=>Array.isArray(c)?c[0]:c), ms=M.danhSach.filter(m=>chs.includes(m.chuong));
  const lenh=new Set(), ky=new Set();
  for (const m of ms) { const all=[...(m.maMau?.chinh||[]), ...(m.loiGiai?.chinh||[]), ...((m.loiGiai?.hamCuaEmMoi||[]).flatMap(h=>h.than||[]))];
    for (const d of all) for (const x of String(d).matchAll(re)) lenh.add(x[1]); (m.hamCuaEmCan||[]).forEach(x=>lenh.add(x));
    const san=Array.isArray(m.san[0])?m.san.flat():m.san; for (const r of san) for (const c of r) if (c!=='.') ky.add(c); }
  const d=ms.sort((a,b)=>a.so-b.so)[0];
  console.log('==', g.ma, '|', g.ten, '| lenh:', [...lenh].sort().join(' '), '| ky:', [...ky].sort().join(''), '| man dau:', d.ma, JSON.stringify(d.san), JSON.stringify(d.batDau), JSON.stringify(d.loiGiai?.chinh));
}"
```

## 6. Những gì KHÔNG làm

- Không thêm người ngoài danh sách người nhờ; không nhân vật lạ, không thẻ mô tả dài, không "Test Case".
- Không dựng sân theo trí nhớ: sân Lab lấy đúng `san` + `batDau` của màn đầu gói.
- Không đổi lõi game ngoài việc đổi thứ tự gói 8/9/10 cho khớp chuẩn (báo rõ).
- Không xuất mp4; không dùng ảnh người thật; không bịa lệnh.
