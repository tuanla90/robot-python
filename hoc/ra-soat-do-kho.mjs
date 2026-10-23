// Kiểm kê nội dung, không suy ra độ khó nhận thức chỉ từ số dòng/nhịp.
// Chạy: node hoc/ra-soat-do-kho.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const day = new URL('./', import.meta.url);
for (const f of fs.readdirSync(day).filter(f => /^man-.*\.js$/.test(f))) require(fileURLToPath(new URL(f, day)));
const ManHoc = require(process.argv.includes('--goc') ? './man-chuoi-1.js' : './lo-trinh-hoc.js');
const soSan = m => Array.isArray(m.san[0]) ? m.san.length : 1;
const cacChuong = ManHoc.chuong().map(c => {
  const ds = ManHoc.danhSach.filter(m => m.chuong === c.ma);
  const trum = ds.find(m => m.hang === 'trum');
  const baSanGiua = ds.filter(m => soSan(m) === 3 && m.so !== 10);
  return {
    chuong: c.ma,
    ten: c.ten,
    baSanGiua: baSanGiua.map(m => ({ id: m.id, ma: m.ma, ten: m.ten })),
    soSanTrum: trum ? soSan(trum) : null,
    giamSoSanOTrum: !!trum && soSan(trum) === 1 && baSanGiua.length > 0,
    // Chỉ là dấu hiệu cần đọc đề/map: code giống nhau có thể là bài sửa lỗi.
    trungLoiGiaiTrum: trum ? ds.filter(m => m !== trum && JSON.stringify(m.loiGiai) === JSON.stringify(trum.loiGiai)).map(m => m.id) : []
  };
});
console.log(JSON.stringify({
  tongMan: ManHoc.danhSach.length,
  tongChuong: cacChuong.length,
  baSan: ManHoc.danhSach.filter(m => soSan(m) === 3).length,
  baSanTruocMan10: cacChuong.reduce((n, c) => n + c.baSanGiua.length, 0),
  haiSan: ManHoc.danhSach.filter(m => soSan(m) === 2).map(m => m.id),
  chuong: cacChuong
}, null, 2));
