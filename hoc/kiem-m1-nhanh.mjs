// kiem-m1-nhanh.mjs — chấm nhanh lời giải mẫu của mọi màn Mùa 1 vừa viết (chạy: node hoc/kiem-m1-nhanh.mjs)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));

var kho = [];
var dat = 0, hong = 0;
ManHoc.danhSach.filter(function (m) { return m.chuong.indexOf('m1-') === 0; }).forEach(function (m) {
  var kq;
  var khoThu = kho.slice();
  (m.loiGiai.hamCuaEmMoi || []).forEach(function (f) {
    var i = khoThu.findIndex(function (k) { return k.ten === f.ten; });
    if (i >= 0) khoThu[i] = f; else khoThu.push(f);
  });
  try { kq = ChamHoc.cham(m, m.loiGiai, khoThu); }
  catch (e) { console.log('LỖI NÉM:', m.ma, m.ten, '->', e.message); hong++; return; }
  if (kq.thang) {
    dat++;
    (m.loiGiai.hamCuaEmMoi || []).forEach(function (f) {
      var i = kho.findIndex(function (k) { return k.ten === f.ten; });
      if (i >= 0) kho[i] = f; else kho.push(f);
    });
  } else {
    hong++;
    console.log('TRƯỢT:', m.ma, '-', m.ten, '| chanDoan:', JSON.stringify((kq.chanDoan || []).slice(0, 2)));
  }
});
console.log('---');
console.log('Đạt:', dat, '/ Hỏng:', hong, '/ Tổng:', dat + hong);
process.exit(hong ? 1 : 0);
