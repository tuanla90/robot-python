// Dò đường tắt cho gói Đua đối kháng và Đọ sức part mạnh (hoc/do-duong-dua-robot.mjs): node tools/do-tat-dua.mjs [mã màn, cách nhau bằng dấu phẩy]
// Màn một sân: dò tới sao.nhip - 1; tìm thấy = có đường thắng nhanh hơn ngưỡng (in ra chuỗi hành động để xem có né chiến thuật của màn không,
// hay chỉ là gộp nâng tay vào nhịp đi mà nhipTheoLoiGiai chấp nhận). Màn nhiều sân: dò từng sân, tổng là CẬN DƯỚI.
// Chạy tay khi đổi màn (cả gói khoảng một phút, quá chậm để nằm trong npm test). Giới hạn thời gian mỗi sân: biến môi trường MS (mặc định 30000).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const M = require('../hoc/lo-trinh-hoc.js');
const D = await import('../hoc/do-duong-dua-robot.mjs');
const chi = process.argv[2] ? process.argv[2].split(',') : null;
for (const m of M.danhSach.filter((x) => (x.chuong === 'dua-robot' || x.chuong === 'che-dua-robot' || x.chuong === 'doi-thu-manh') && (!chi || chi.includes(x.ma)))) {
  const n = Array.isArray(m.san[0]) ? m.san.length : 1, t = Date.now(), ks = [];
  for (let i = 0; i < n; i++) ks.push(D.nhipDuaSan(m, i, { toiDa: n > 1 ? m.sao.nhip : m.sao.nhip - 1, toiDaMs: Number(process.env.MS || 30000) }));
  console.log(m.ma.padEnd(18), 'sao.nhip', String(m.sao.nhip).padStart(2), '| tìm được:', ks.map((k) => (k.nhip === null ? (k.catNgang ? 'cắt' : 'không') : k.nhip)).join('+'),
    '| nhánh', ks.map((k) => k.soNhanh).join('+'), '|', Date.now() - t, 'ms', ks.some((k) => k.chuoi && n === 1) ? '| ĐƯỜNG: ' + JSON.stringify(ks[0].chuoi) : '');
}
