/* ============================================================================
   kiem-moi-truong.mjs — máy kiểm "YẾU TỐ MÔI TRƯỜNG CÓ TRƯỚC BỘ PHẬN GỠ NÓ" của "Học lập trình" (user chốt 15/10).
   Mỗi yếu tố (vật chắn, gầm thấp, hố, hàng rào, bậc thang, băng chuyền, thùng nặng, cửa, nút, sàn màu, vật sắt, vật nam châm) phải XUẤT HIỆN LẦN ĐẦU
   ở một GÓI đứng TRƯỚC gói của bộ phận gỡ nỗi đau đó (vd băng chuyền có trước bánh xích): người chơi gặp khó trước, rồi mới có bộ phận giải quyết.
   Gói theo ThuTuChuong.goi (thứ tự gói = thứ tự chương). Chỉ xét chương CÓ màn. Không cần lõi (đọc ký hiệu sân và lớp vatChat).
   Thêm yếu tố mới: thêm một dòng vào YEU_TO.
   Chạy: node hoc/kiem-moi-truong.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const TT = require(path.join(day, 'thu-tu-chuong.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort()) require(path.join(day, f));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}

const phang = (x) => (Array.isArray(x) && Array.isArray(x[0]) ? x.flat() : x || []).join('');
const sanChu = (m) => phang(m.san);
const chatChu = (m) => phang(m.vatChat) + JSON.stringify(m.vatThem || []);

/** yếu tố → chương bộ phận gỡ nó (chương ĐẦU TIÊN của bộ phận). */
const YEU_TO = [
  { ten: 'vật nằm chắn đường (o)', co: (m) => /[oX]/.test(sanChu(m)), boPhan: 'tay-gap' },
  { ten: 'gầm thấp (n)', co: (m) => /n/.test(sanChu(m)), boPhan: 'nhen' },
  { ten: 'hố (u)', co: (m) => /u/.test(sanChu(m)), boPhan: 'nhen' },
  { ten: 'hàng rào thấp (=)', co: (m) => /=/.test(sanChu(m)), boPhan: 'nhen' },
  { ten: 'bậc thang (S)', co: (m) => /S/.test(sanChu(m)), boPhan: 'nhen' },
  { ten: 'băng chuyền (< > ^ v)', co: (m) => /[<>^v]/.test(sanChu(m)), boPhan: 'xich' },
  { ten: 'thùng nặng (H)', co: (m) => /[Hh]/.test(sanChu(m)), boPhan: 'sung-hoi' },
  { ten: 'cửa (C / c)', co: (m) => /[Cc]/.test(sanChu(m)), boPhan: 'sung-hoi' },
  { ten: 'nút trên tường (N)', co: (m) => /N/.test(sanChu(m)), boPhan: 'sung-hoi' },
  { ten: 'sàn màu (r g b y)', co: (m) => /[rgby]/.test(sanChu(m)) || /[rgby]/.test(phang(m.mau)), boPhan: 'mau' },
  { ten: 'vật sắt', co: (m) => /s|"sat"/.test(chatChu(m)), boPhan: 'nam-cham' },
  { ten: 'vật nam châm (N / S)', co: (m) => /[NS]|"nam-cham"/.test(chatChu(m)), boPhan: 'nam-cham' }
];

const goiCua = {};
(TT.goi || []).forEach((g, i) => g.chuong.forEach((c) => { goiCua[c] = i; }));
const coMan = (c) => ManHoc.danhSach.some((m) => m.chuong === c);
const thuTu = TT.thuTu.filter(coMan);

console.log('== Yếu tố môi trường có trước bộ phận gỡ nó ==');
kiem('mọi chương có màn đều thuộc một gói', thuTu.every((c) => goiCua[c] !== undefined), thuTu.filter((c) => goiCua[c] === undefined).join(', '));
for (const yt of YEU_TO) {
  const dauTien = ManHoc.danhSach.find((m) => yt.co(m));
  if (!coMan(yt.boPhan)) { console.log('  --   ' + yt.ten + ': chương ' + yt.boPhan + ' chưa có màn (bỏ qua)'); continue; }
  if (!dauTien) { kiem(yt.ten + ': có xuất hiện trong game', false, 'không màn nào có'); continue; }
  const gDau = goiCua[dauTien.chuong], gBp = goiCua[yt.boPhan];
  kiem(yt.ten + ': gặp lần đầu ở ' + dauTien.ma + ' (gói ' + (gDau + 1) + ' ' + TT.goi[gDau].ten + '), trước gói ' + (gBp + 1) + ' ' + TT.goi[gBp].ten,
    gDau < gBp, 'gặp lần đầu ở gói ' + (gDau + 1) + ', bộ phận ở gói ' + (gBp + 1));
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
