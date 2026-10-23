// Đo offline khi tác giả đổi bài; không được gọi khi người chơi mở game.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../hoc/lo-trinh-hoc.js');
const Cham = require('../hoc/cham.js');
const clone = x => JSON.parse(JSON.stringify(x));
const kho = new Map();
const nguong = {};
let hong = 0;
for (const m of M.danhSach) {
  const lg = m.loiGiai;
  const hienTai = new Map(kho);
  for (const h of lg.hamCuaEmMoi || []) hienTai.set(h.ten, clone(h));
  const r = Cham.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hienTai.values()]);
  if (!r.thang) {
    hong++;
    console.log(JSON.stringify({ ma: m.ma, id: m.id, sao: r.sao, chanDoan: r.chanDoan, san: r.theoSan?.map(x => ({ thang: x.thang, nhip: x.soNhip })) }));
  }
  if (m.phienBanNoiDung === 2 && r.thang) nguong[m.ma] = { o: r.soO, nhip: r.soNhip };
  if (!m.tietKiemNhip) for (const h of lg.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}
if (hong) { console.log('FAILED ' + hong); process.exitCode = 1; }
else {
  console.log('PASS ' + M.danhSach.length + ' canonical solutions; ' + Object.keys(nguong).length + ' revised star thresholds.');
  if (process.argv.includes('--ghi-sao')) {
    fs.writeFileSync(new URL('../hoc/lo-trinh-sao.js', import.meta.url),
      '/* Đo bằng node tools/do-lo-trinh.mjs --ghi-sao; chạy lại sau khi đổi bài. */\n(function () {\n  var ds = ' + JSON.stringify(nguong, null, 2) + ';\n  if (typeof module !== "undefined" && module.exports) module.exports = ds;\n  if (typeof window !== "undefined") window.NguongSaoLoTrinh = ds;\n})();\n');
  }
}
