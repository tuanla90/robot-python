// Dò "MỘT ROBOT LÀM HẾT" cho các gói đội: node tools/do-mot-robot.mjs [mẫu chương, vd doi-xich] [--nhanh]
// Mỗi màn 1–9 mục tiêu dua-vat / day-thung: robot j đi một mình (đồng đội không khóa đứng yên; đồng đội khóa chạy chương trình của nó),
// bộ dò BFS chạy thật SanHoc.chay (do-duong-rap-du.mjs) tìm đường, rồi chấm lại bằng máy chấm đủ cả đội (bỏ giới hạn khung 10 ô vì người chơi
// có thể gói lại bằng hàm / vòng lặp). In "MỘT ROBOT" khi thắng được: màn đó không cần cả đội — sửa sân, hoặc khai choPhepMotRobot kèm lý do.
// Bộ dò coi đồng đội là ô chắn ở chỗ xuất phát; vật trong rổ của đồng đội bị bỏ khi dò nhưng có lại khi chấm, nên chỉ báo trường hợp chấm thật thắng.
// "chưa rõ" = dò hết hạn mà chưa tìm được (không phải bằng chứng là cần cả đội).
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { nhipNganNhat } = await import(new URL('../hoc/do-duong-rap-du.mjs', import.meta.url));
const M = require(path.resolve('hoc/lo-trinh-hoc.js'));
const Cham = require(path.resolve('hoc/cham.js'));
const clone = (x) => JSON.parse(JSON.stringify(x));
const mau = new RegExp('^(che-)?' + (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2].replace(/^che-/, '') : 'doi-') + (process.argv[2] ? '$' : ''));
const han = process.argv.includes('--nhanh') ? { toiDaNhip: 40, toiDaTrangThai: 15000, toiDaGiay: 5 } : { toiDaNhip: 60, toiDaTrangThai: 60000, toiDaGiay: 20 };
const kho = new Map(), khoTruoc = new Map();
for (const m of M.danhSach) { khoTruoc.set(m.ma, clone([...kho.values()])); if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h)); }
let soMotRobot = 0;
for (const man of M.danhSach) {
  if (!mau.test(man.chuong) || !man.doi || man.so === 10 || !['dua-vat', 'day-thung'].includes(man.mucTieu) || man.choPhepMotRobot) continue;
  for (let j = 0; j < man.doi.length; j++) {
    if (man.doi[j].coDinh) continue;                                   // robot khóa không do người chơi viết
    const m = Object.assign({}, man, man.doi[j]); delete m.doi;
    const rows = man.san.slice();
    man.doi.forEach((d, k) => {
      if (k === j || d.loaiRobot === 'drone' || m.loaiRobot === 'drone') return;
      const b = d.batDau; rows[b.y] = rows[b.y].slice(0, b.x) + '#' + rows[b.y].slice(b.x + 1);
    });
    m.san = rows;
    let r; try { r = nhipNganNhat(m, 0, han); } catch (e) { r = { loi: e.message }; }
    if (!r.chuoi) { if (r.catNgang || r.loi) console.log('chưa rõ   ', man.ma, 'R' + (j + 1), r.loi || 'dò hết hạn'); continue; }
    const doi = man.doi.map((d, k) => ({ chinh: k === j ? r.chuoi.trim().split('\n') : (d.coDinh ? man.maMau.doi[k].chinh : []) }));
    const kq = Cham.cham(Object.assign({}, man, { khung: { chinh: 999, moiHam: 999 } }), { chinh: [], hamCuaMan: man.loiGiai.hamCuaMan || [], doi }, khoTruoc.get(man.ma));
    if (kq.thang) { soMotRobot++; console.log('MỘT ROBOT ', man.ma, man.ten, '— R' + (j + 1) + ' một mình ' + kq.soNhip + ' nhịp, ' + kq.sao + ' sao (cả đội ' + man.sao.nhip + ' nhịp)'); }
  }
}
console.log(soMotRobot ? 'Có ' + soMotRobot + ' trường hợp một robot làm hết.' : 'Không thấy màn nào một robot làm hết (trong hạn dò).');
process.exitCode = soMotRobot ? 1 : 0;
