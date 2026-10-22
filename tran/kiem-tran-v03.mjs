/* ============================================================================
   kiem-tran-v03.mjs — MÁY CHECK cho "Luật trận v0.3" (một khe chọn đề).

   Chạy:  node tran/kiem-tran-v03.mjs

   Điều đáng kiểm nhất: mỗi phương án phải BỎ một khả năng và THÊM một khả năng,
   phải ĐỔI HÌNH DẠNG bài toán, và KHÔNG phương án nào trội trên mọi đề.
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

const L = TD.LUAT_V03;
const DE_BIET = L.de.thang;                                            // khối (4,3)
const DE_KHONG_BIET = { ten: 'hai chỗ (4,1) và (6,5)', khoi: [{ x: 6, y: 5 }] };

/** Đo một chuyến: tick R1 giao tới trạm, và tick giao xong về nhà. */
function doMot(de, bo) {
  const r = TD.chamTranV03(de, bo, CT.V03_IDLE);
  let tickTram = null, tickDiem = null;
  for (const f of r.khung) {
    if (tickTram === null && f.conLai.some((k) => k.x === 3 && k.y === 3 && k.quaTram)) tickTram = f.tick;
    if (tickDiem === null && f.diem.A > 0) tickDiem = f.tick;
  }
  return { tickTram, tickDiem, diem: r.diemA, ketThuc: r.ketThuc, chanDoan: r.chanDoan, xong: r.xong, khung: r.khung };
}

console.log('\n== 1. Khe chọn đề: hai phương án, cùng bộ cho hai đội, cùng trần ==');
{
  kiem('khe có đúng 2 phương án', L.khe.phuongAn.length === 2, L.khe.phuongAn.join(','));
  kiem('KHÔNG có hạn riêng nào theo phương án trong luật (trần không tăng)',
    !('gioiHanTheoPhuongAn' in L) && L.dongHo === 1800 && L.baoHiemTick === 4000,
    `dongHo=${L.dongHo} baoHiem=${L.baoHiemTick}`);
  kiem('sân v0.3 vẫn đối xứng', L.nha.A.x + L.nha.B.x === 2 * L.truc && L.tram.A.x + L.tram.B.x === 2 * L.truc);
}

console.log('\n== 2. Phương án MỞ API khác nhau (bỏ một khả năng) ==');
{
  const td = TD.apiTheoPhuongAn('TAY_DAI'), cn = TD.apiTheoPhuongAn('CHAN_NHANH');
  kiem('TAY_DAI có item_here()', !!td.item_here);
  kiem('CHAN_NHANH KHÔNG có item_here() (mù)', !cn.item_here);
  kiem('cả hai đều có phần còn lại (move/turn/pick/drop/wait/pos_x/pos_y)',
    ['move', 'turn_left', 'turn_right', 'pick', 'drop', 'wait', 'pos_x', 'pos_y']
      .every((t) => td[t] && cn[t]));
  kiem('số hàm: TAY_DAI nhiều hơn CHAN_NHANH đúng 1',
    Object.keys(td).length === Object.keys(cn).length + 1,
    Object.keys(td).length + ' / ' + Object.keys(cn).length);

  // Chương trình dùng item_here đem chạy dưới CHAN_NHANH → phải lộ locked-command
  const r = TD.chamTranV03(DE_BIET,
    { thongTin: 1, ...CT.V03_TD_NHUNG_DUNG_ITEM, phuongAn: 'CHAN_NHANH' }, CT.V03_IDLE);
  const r1 = r.xong.find((x) => x.ten === 'A-R1');
  kiem('dùng item_here() dưới CHAN_NHANH → locked-command', r1.loi && r1.loi.loai === 'locked-command',
    JSON.stringify(r1.loi));
  kiem('lời nhắn nói rõ phương án nào không có', /CHAN_NHANH/.test((r1.loi || {}).thongDiep || ''),
    (r1.loi || {}).thongDiep);
}

console.log('\n== 3. Phương án THÊM một khả năng: gắp ô trước mặt ==');
{
  // Cùng đứng ở (6,4) quay Nam, khối ở (6,5)
  const gomTayDai = { phuongAn: 'TAY_DAI', R1: 'go_to(6, 4)\nquay_ve(2)\npick()\nfor i in range(8):\n    wait()', R2: 'for i in range(4):\n    wait()' };
  const gomChanNhanh = { phuongAn: 'CHAN_NHANH', R1: 'go_to(6, 4)\nquay_ve(2)\npick()\nfor i in range(8):\n    wait()', R2: 'for i in range(4):\n    wait()' };
  const a = TD.chamTranV03(DE_KHONG_BIET, gomTayDai, CT.V03_IDLE);
  const b = TD.chamTranV03(DE_KHONG_BIET, gomChanNhanh, CT.V03_IDLE);
  kiem('TAY_DAI gắp được khối ở ô trước mặt → hết khối trên sân',
    a.khung[a.khung.length - 1].conLai.length === 0, JSON.stringify(a.khung[a.khung.length - 1].conLai));
  kiem('CHAN_NHANH ở đúng tư thế đó thì hụt',
    b.khung[b.khung.length - 1].conLai.length === 1 && b.chanDoan.some((c) => /pick-hut@6,4/.test(c)),
    b.chanDoan.slice(0, 3).join(' | '));
}

console.log('\n== 4. Phương án BỎ một khả năng: chân nhanh đi 1 tick, tay gắp dài đi 2 tick ==');
{
  const a = doMot(DE_BIET, CT.V03_TD_BIET);
  const b = doMot(DE_BIET, CT.V03_CN_BIET);
  kiem('cùng chuyến đó: TAY_DAI tới trạm ở tick 10', a.tickTram === 10, String(a.tickTram));
  kiem('CHAN_NHANH tới trạm ở tick 7 (nhanh hơn)', b.tickTram === 7, String(b.tickTram));
  kiem('cả hai đều giao được khối (đường ống bàn giao chạy với cả hai phương án)',
    a.diem === 1 && b.diem === 1, `${a.diem} / ${b.diem}`);
}

console.log('\n== 5. KHÔNG PHƯƠNG ÁN NÀO TRỘI: mỗi đề một bên thắng ==');
{
  const biet_td = doMot(DE_BIET, CT.V03_TD_BIET);
  const biet_cn = doMot(DE_BIET, CT.V03_CN_BIET);
  kiem('ĐỀ "biết trước" → CHAN_NHANH thắng', biet_cn.tickDiem < biet_td.tickDiem,
    `tay dài ${biet_td.tickDiem} · chân nhanh ${biet_cn.tickDiem}`);

  const khong_td = doMot(DE_KHONG_BIET, CT.V03_TD_KHONG_BIET);
  const khong_cn = doMot(DE_KHONG_BIET, CT.V03_CN_KHONG_BIET);
  kiem('ĐỀ "không biết chỗ" → TAY_DAI thắng', khong_td.tickDiem < khong_cn.tickDiem,
    `tay dài ${khong_td.tickDiem} · chân nhanh ${khong_cn.tickDiem}`);
  kiem('và bên mù phải đi thử chỗ sai trước (có pick-hut ở (4,1))',
    khong_cn.chanDoan.some((c) => /pick-hut@4,1/.test(c)), khong_cn.chanDoan.slice(0, 3).join(' | '));
  kiem('cả hai phương án đều giao được trên cả hai đề (không phương án nào hỏng)',
    biet_td.diem === 1 && biet_cn.diem === 1 && khong_td.diem === 1 && khong_cn.diem === 1,
    [biet_td.diem, biet_cn.diem, khong_td.diem, khong_cn.diem].join(','));
}

console.log('\n== 6. Tất định ==');
{
  const a = doMot(DE_KHONG_BIET, CT.V03_CN_KHONG_BIET);
  const b = doMot(DE_KHONG_BIET, CT.V03_CN_KHONG_BIET);
  kiem('chạy hai lần cho cùng số tick và cùng điểm',
    a.tickTram === b.tickTram && a.tickDiem === b.tickDiem,
    `${a.tickTram}/${a.tickDiem} vs ${b.tickTram}/${b.tickDiem}`);
  kiem('bản ghi giống nhau', JSON.stringify(a.khung) === JSON.stringify(b.khung));
}

console.log('\n== 7. Đổi hình dạng bài toán, không chỉ đổi con số ==');
{
  // Chương trình MÙ chạy được ở cả hai phương án, nhưng chậm hơn dưới TAY_DAI
  const mu = { R1: CT.V03_CN_BIET.R1, R2: CT.V03_CN_BIET.R2 };
  const duoiCn = doMot(DE_BIET, { ...mu, phuongAn: 'CHAN_NHANH' });
  const duoiTd = doMot(DE_BIET, { ...mu, phuongAn: 'TAY_DAI' });
  kiem('chương trình mù chạy được dưới CẢ HAI phương án',
    duoiCn.diem === 1 && duoiTd.diem === 1, `${duoiCn.diem} / ${duoiTd.diem}`);
  kiem('nhưng dưới TAY_DAI thì chậm hơn (mỗi bước đi 2 tick)', duoiTd.tickDiem > duoiCn.tickDiem,
    `${duoiCn.tickDiem} vs ${duoiTd.tickDiem}`);

  // Còn chương trình có cảm biến thì KHÔNG chạy được dưới chân nhanh (đã kiểm ở §2)
  kiem('vậy hai phương án cần HAI LOẠI chương trình khác nhau — đúng "đổi hình dạng"', true);
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);
