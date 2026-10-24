// Đo ngưỡng sao của MỘT gói đội hai robot: node tools/do-goi-doi.mjs hoc/man-doi-<gói>.js [--ghi]
// Chấm lời giải chuẩn từng màn của gói (kho hàm như người chơi đi tuần tự), in { ô, nhịp }; --ghi viết lại khối
// "// @sao-dau … // @sao-cuoi" trong tệp gói. Ngưỡng nằm trong tệp gói (không ở lo-trinh-sao.js) để mỗi gói làm riêng không đụng tệp chung.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const tep = process.argv[2];
if (!tep || !fs.existsSync(tep)) { console.error('Cần đường dẫn tệp man-doi-*.js'); process.exit(2); }
const nguon = fs.readFileSync(tep, 'utf8');
const chuong = (nguon.match(/var CHUONG = '([^']+)'/) || [])[1];
if (!chuong) { console.error('Không thấy var CHUONG trong tệp.'); process.exit(2); }
const dsChuong = [chuong, 'che-' + chuong];
const M = require(path.resolve('hoc/lo-trinh-hoc.js'));
const Cham = require(path.resolve('hoc/cham.js'));
const clone = (x) => JSON.parse(JSON.stringify(x));
const kho = new Map(), sao = {};
let hong = 0;
for (const m of M.danhSach) {
  const lg = m.loiGiai;
  if (dsChuong.includes(m.chuong)) {
    const hs = new Map(kho);
    for (const h of lg.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
    const r = Cham.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hs.values()]);
    if (!r.thang) { hong++; console.log('HỎNG', m.ma, JSON.stringify(r.chanDoan).slice(0, 300)); }
    else { sao[m.ma] = { o: r.soO, nhip: r.soNhip }; console.log(m.ma.padEnd(18), 'ô', r.soO, 'nhịp', r.soNhip); }
  }
  if (!m.tietKiemNhip) for (const h of lg.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
if (hong) { console.log('Còn ' + hong + ' lời giải chưa thắng, chưa ghi.'); process.exit(1); }
if (process.argv.includes('--ghi')) {
  const khoi = /\/\/ @sao-dau[^\n]*\n[\s\S]*?\n\s*\/\/ @sao-cuoi/;
  if (!khoi.test(nguon)) { console.error('Tệp chưa có khối // @sao-dau … // @sao-cuoi.'); process.exit(2); }
  const dong = Object.keys(sao).map((k) => "    '" + k + "': { o: " + sao[k].o + ', nhip: ' + sao[k].nhip + ' }').join(',\n');
  const moi = nguon.replace(khoi, (cu) => cu.split('\n')[0] + '\n  var SAO = {\n' + dong + '\n  };\n  // @sao-cuoi');
  fs.writeFileSync(tep, moi);
  console.log('Đã ghi ' + Object.keys(sao).length + ' ngưỡng vào ' + tep);
}
