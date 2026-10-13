/* ============================================================================
   kiem-tran-dau.mjs — MÁY CHECK cho "Luật trận v0.1".

   Chạy:  node robotics/kiem-tran-dau.mjs

   Kiểm 6 điều kiện "pass" ở docs/thiet-ke/luat-tran-v0.1.md §7,
   cộng hai bất biến kỹ thuật (bảo hiểm chống treo, lộ trình độc lập).
   ========================================================================== */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const TD = require(path.join(day, 'tran-dau.js'));
const CT = require(path.join(day, 'chuong-trinh.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? ' → ' + chiTiet : '')); }
}

const L = TD.LUAT;
const tr = (a, b) => TD.chamTran(L, a, b);

console.log('\n== 1. Sân đối xứng (không thiên vị bên nào) ==');
{
  const co = new Set(L.khoi.map((k) => k.x + ',' + k.y));
  const thieu = L.khoi.filter((k) => !co.has((2 * L.truc - k.x) + ',' + k.y));
  kiem('mọi khối đều có khối đối xứng qua trục x=' + L.truc, thieu.length === 0,
    thieu.map((k) => k.x + ',' + k.y).join(' '));
  kiem('không khối nào nằm trên trục giữa', L.khoi.every((k) => k.x !== L.truc));
  kiem('hai ô xuất phát đối xứng',
    L.xuatPhat.A.x + L.xuatPhat.B.x === 2 * L.truc && L.xuatPhat.A.y === L.xuatPhat.B.y);
  kiem('số khối chẵn', L.khoi.length % 2 === 0, String(L.khoi.length));
}

console.log('\n== 2. Tất định ==');
{
  const kq = [tr(CT.LAY_HET_A, CT.HAI_GIUA_B), tr(CT.LAY_HET_A, CT.HAI_GIUA_B), tr(CT.LAY_HET_A, CT.HAI_GIUA_B)];
  const cung = kq.every((r) => r.diemA === kq[0].diemA && r.diemB === kq[0].diemB && r.thang === kq[0].thang);
  kiem('chạy 3 lần cho cùng điểm và cùng đội thắng', cung,
    kq.map((r) => r.diemA + '-' + r.diemB).join(' | '));
  kiem('bản ghi (khung) giống nhau', JSON.stringify(kq[0].khung) === JSON.stringify(kq[1].khung));
}

console.log('\n== 3. Logic đối xứng → hòa (chứng minh sân công bằng) ==');
{
  const r = tr(CT.LAY_HET_A, CT.LAY_HET_B);
  kiem('"lấy hết" vs bản gương của nó → hòa', r.thang === 'hòa', r.lyDo);
  const r2 = tr(CT.HAI_GIUA_A, CT.HAI_GIUA_B);
  kiem('"hai khối giữa" vs bản gương của nó → hòa', r2.thang === 'hòa', r2.lyDo);
  const r3 = tr(CT.CUOP_A, CT.CUOP_B);
  kiem('"cướp" vs bản gương của nó → hòa', r3.thang === 'hòa', r3.lyDo);
}

console.log('\n== 4. HAI LOGIC KHÁC NHAU → KẾT QUẢ KHÁC NHAU  (điều kiện pass chính) ==');
{
  const r = tr(CT.LAY_HET_A, CT.HAI_GIUA_B);
  kiem('"lấy hết" vs "hai khối giữa" có đội thắng', r.thang !== 'hòa', r.lyDo);
  kiem('CẢ HAI đội đều giao được khối (không phải đội kia hỏng)',
    r.diemA > 0 && r.diemB > 0, r.lyDo);
  kiem('cả hai chương trình chạy xong bình thường', r.xong.A && r.xong.B, JSON.stringify(r.loi));

  const g = tr(CT.HAI_GIUA_A, CT.LAY_HET_B);
  kiem('đổi chỗ hai logic → điểm ĐẢO (sân không thiên vị)',
    g.diemA === r.diemB && g.diemB === r.diemA,
    `xuôi ${r.diemA}-${r.diemB} · đảo ${g.diemA}-${g.diemB}`);
}

console.log('\n== 5. Cùng robot · cùng sân · ba logic → ba kết quả ==');
{
  const bang = [
    ['"lấy hết"  vs "lấy hết" (gương)', tr(CT.LAY_HET_A, CT.LAY_HET_B)],
    ['"lấy hết"  vs "hai khối giữa"', tr(CT.LAY_HET_A, CT.HAI_GIUA_B)],
    ['"lấy hết"  vs "cướp bên kia"', tr(CT.LAY_HET_A, CT.CUOP_B)],
    ['"cướp"     vs "hai khối giữa"', tr(CT.CUOP_A, CT.HAI_GIUA_B)]
  ];
  bang.forEach(([ten, r]) => console.log('       ' + ten.padEnd(34) + ' → ' + r.diemA + '-' + r.diemB + '  (' + r.thang + ')'));
  const diem = new Set(bang.map(([, r]) => r.diemA + '-' + r.diemB));
  kiem('các cặp logic khác nhau cho kết quả KHÁC NHAU (' + diem.size + ' kết quả khác nhau)', diem.size >= 3,
    [...diem].join(' | '));
}

console.log('\n== 6. Bảo toàn khối ==');
{
  const r = tr(CT.LAY_HET_A, CT.HAI_GIUA_B);
  kiem('điểm + còn trên sân + đang cầm = ' + L.khoi.length, r.baoToan === L.khoi.length, String(r.baoToan));
  const r2 = tr(CT.LAY_HET_A, CT.LAY_HET_B);
  kiem('vẫn bảo toàn ở trận hòa', r2.baoToan === L.khoi.length, String(r2.baoToan));
}

console.log('\n== 7. Bảo hiểm chống treo máy (không phải luật) ==');
{
  const r = tr(CT.LAP_VO_TAN, CT.LAY_HET_B);
  kiem('chương trình lặp vô tận bị chặn, trận vẫn kết thúc',
    r.xong.A === false && r.loi.A !== null, JSON.stringify(r.loi.A));
  kiem('chẩn đoán ghi rõ qua-tick', r.loi.A && r.loi.A.loai === 'qua-tick', JSON.stringify(r.loi.A));
  kiem('vẫn ra được kết luận thắng thua', !!r.thang, r.lyDo);
}

console.log('\n== 8. Lộ trình độc lập (nền của cách mô phỏng này) ==');
{
  const a1 = TD.chayLoTrinh(L, 'A', CT.LAY_HET_A);
  const a2 = tr(CT.LAY_HET_A, CT.CUOP_B).nhatKy.A;
  const a3 = tr(CT.LAY_HET_A, CT.LAY_HET_B).nhatKy.A;
  kiem('nhật ký của A không đổi dù đối thủ khác nhau',
    JSON.stringify(a1.nhatKy) === JSON.stringify(a2) && JSON.stringify(a2) === JSON.stringify(a3),
    `${a1.nhatKy.length} / ${a2.length} / ${a3.length} hành động`);
  kiem('A chạy một mình cũng ra đúng nhật ký đó', a1.xong === true);
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);
