/* ============================================================================
   kiem-tran-v04.mjs — MÁY CHECK cho "Luật trận v0.4":
   (1) Ô NHỚ CHƯƠNG TRÌNH — đếm đúng, chặn trước khi chạy, và đề "ô nhớ hẹp"
       dạy viết HÀM (bản copy-paste bị chặn, bản dùng hàm chạy được).
   (2) KHE THỨ HAI · BÁNH XE — OMNI đi chậm/quay nhanh, XICH đi nhanh/quay chậm,
       và KHÔNG bánh nào trội trên mọi đề.

   Chạy: node tran/kiem-tran-v04.mjs
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const TD = require(path.join(day, 'tran-dau.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? ' → ' + chiTiet : '')); }
}

const L = TD.LUAT_V04;
const CHI_PHI = L.chiPhiThuVien;
const KHOI_4 = [{ x: 4, y: 1 }, { x: 6, y: 1 }, { x: 4, y: 5 }, { x: 6, y: 5 }];
const IDLE = { R1: 'for i in range(2):\n    wait()', R2: 'for i in range(2):\n    wait()' };

/** Chạy trận A (chỉ R1 làm việc) và trả về tick đầu tiên A-R1 cầm được khối. */
function tickCam(khoi, tayGap, banhXe, codeR1, hanO) {
  const r = TD.chamTranV04({ ten: 'đo', khoi, hanO },
    { tayGap, banhXe, R1: codeR1, R2: 'for i in range(2):\n    wait()' },
    { tayGap: 'CHAN_NHANH', banhXe: 'XICH', ...IDLE }, { dongHo: 400 });
  let t = null;
  for (const f of r.khung) if (f.robot['A-R1'].cam) { t = f.tick; break; }
  return { tick: t, kq: r, r1: r.xong.find((x) => x.ten === 'A-R1') };
}

console.log('\n== 1. Ô NHỚ CHƯƠNG TRÌNH: đếm đúng ==');
{
  kiem('đếm theo dòng lệnh', TD.demO('move(2)\npick()') === 2, String(TD.demO('move(2)\npick()')));
  kiem('bỏ dòng trống và dòng chỉ có chú thích', TD.demO('move(1)\n\n   \n# ghi chú\npick()') === 2,
    String(TD.demO('move(1)\n\n   \n# ghi chú\npick()')));
  kiem('thụt lề không thành ô riêng', TD.demO('while True:\n    wait()') === 2,
    String(TD.demO('while True:\n    wait()')));
  kiem('dùng hàm thư viện thì trả ô cho hàm đó (go_to = 6)',
    TD.demO('go_to(4, 3)', CHI_PHI) === 1 + CHI_PHI.go_to, String(TD.demO('go_to(4, 3)', CHI_PHI)));
  kiem('dùng hai hàm thư viện thì trả cả hai',
    TD.demO('go_to(1, 1)\nquay_ve(0)', CHI_PHI) === 2 + CHI_PHI.go_to + CHI_PHI.quay_ve);
  kiem('không dùng thì không trả', TD.demO('move(1)', CHI_PHI) === 1);
  kiem('chương trình rỗng = 0 ô', TD.demO('') === 0 && TD.demO(null) === 0);
}

console.log('\n== 2. Vượt hạn ô nhớ thì robot KHÔNG ĐƯỢC NẠP (memory-full) ==');
{
  const dai = 'move(2)\npick()\nwait()\nwait()\nwait()';
  const { r1, kq } = tickCam([{ x: 4, y: 3 }], 'CHAN_NHANH', 'XICH', dai, 3);
  kiem('báo đúng mã memory-full', r1.loi && r1.loi.loai === 'memory-full', JSON.stringify(r1.loi));
  kiem('lời nhắn nói rõ số ô và hạn', /5 ô/.test(r1.loi.thongDiep) && /3 ô/.test(r1.loi.thongDiep), r1.loi.thongDiep);
  kiem('robot đứng yên suốt trận (không chạy một bước nào)',
    kq.khung.every((f) => f.robot['A-R1'].x === 2 && f.robot['A-R1'].y === 3),
    JSON.stringify(kq.khung[kq.khung.length - 1].robot['A-R1']));
  kiem('báo cả số ô đã dùng cho giao diện', r1.oNho === 5 && r1.hanO === 3, r1.oNho + '/' + r1.hanO);
  kiem('không vượt hạn thì chạy bình thường', tickCam([{ x: 4, y: 3 }], 'CHAN_NHANH', 'XICH', dai, 5).r1.loi === null);
}

console.log('\n== 3. ĐỀ "Ô NHỚ HẸP" DẠY VIẾT HÀM ==');
{
  // Bản COPY-PASTE: lặp lại đường đi cho từng khối, không dùng hàm
  const copyPaste = KHOI_4.map((k) =>
    `go_to(${k.x}, ${k.y})\npick()\ngo_to(3, 3)\nwhile item_here():\n    wait()\ndrop()`).join('\n');
  // Bản VIẾT HÀM: một hàm rồi gọi bốn lần
  const vietHam = [
    'def chuyen(x, y):', '    go_to(x, y)', '    pick()', '    go_to(3, 3)',
    '    while item_here():', '        wait()', '    drop()', '',
    'chuyen(4, 1)', 'chuyen(6, 1)', 'chuyen(4, 5)', 'chuyen(6, 5)'
  ].join('\n');
  const HAN = 24;
  console.log('       copy-paste: ' + TD.demO(copyPaste, CHI_PHI) + ' ô · viết hàm: ' + TD.demO(vietHam, CHI_PHI) + ' ô · hạn ' + HAN);

  const cp = tickCam(KHOI_4, 'TAY_DAI', 'XICH', copyPaste, HAN);
  kiem('bản copy-paste VƯỢT hạn → memory-full', cp.r1.loi && cp.r1.loi.loai === 'memory-full',
    JSON.stringify(cp.r1.loi && cp.r1.loi.loai));
  const vh = tickCam(KHOI_4, 'TAY_DAI', 'XICH', vietHam, HAN);
  kiem('bản viết hàm VỪA hạn → chạy được, lấy được khối', vh.r1.loi === null && vh.tick !== null,
    JSON.stringify(vh.r1.loi || vh.tick));
  kiem('và viết hàm tiết kiệm hẳn ô nhớ (chênh ít nhất 10 ô)',
    TD.demO(copyPaste, CHI_PHI) - TD.demO(vietHam, CHI_PHI) >= 10,
    TD.demO(vietHam, CHI_PHI) + ' vs ' + TD.demO(copyPaste, CHI_PHI));
}

console.log('\n== 4. KHE BÁNH XE: OMNI quay nhanh, XICH đi nhanh ==');
{
  const thang = 'move(2)\npick()';                  // 2 bước, 0 lần quay
  const nhieuGoc = 'turn_left()\nturn_left()\nturn_left()\nturn_left()\nmove(2)\npick()';  // 2 bước, 4 lần quay

  const tXich = tickCam([{ x: 4, y: 3 }], 'CHAN_NHANH', 'XICH', thang, null).tick;
  const tOmni = tickCam([{ x: 4, y: 3 }], 'CHAN_NHANH', 'OMNI', thang, null).tick;
  kiem('đề ĐI THẲNG: XICH tới trước (2 bước + 1 nhặt)', tXich === 3 && tOmni === 5, `${tXich} vs ${tOmni}`);

  const gXich = tickCam([{ x: 4, y: 3 }], 'CHAN_NHANH', 'XICH', nhieuGoc, null).tick;
  const gOmni = tickCam([{ x: 4, y: 3 }], 'CHAN_NHANH', 'OMNI', nhieuGoc, null).tick;
  kiem('đề NHIỀU GÓC: OMNI tới trước (4 quay + 2 bước)', gOmni === 9 && gXich === 11, `${gOmni} vs ${gXich}`);
  kiem('KHÔNG bánh nào trội trên mọi đề', tXich < tOmni && gOmni < gXich);
}

console.log('\n== 5. Hai khe ĐỘC LẬP: bốn tổ hợp đều chạy được ==');
{
  const ma = 'def chuyen(x, y):\n    go_to(x, y)\n    pick()\n    go_to(3, 3)\n    drop()\n\nchuyen(4, 3)';
  // R2 có cảm biến (hỏi rồi mới nhặt) — chỉ dùng được khi KHÔNG chọn chân nhanh
  const r2Cam = 'go_to(3, 3)\nn = 0\nwhile not item_here() and n < 40:\n    wait()\n    n = n + 1\npick()\ngo_to(0, 3)\ndrop()';
  // R2 MÙ (chờ theo lịch) — dùng cho chân nhanh
  const r2Mu = 'go_to(3, 3)\nfor k in range(9):\n    wait()\npick()\ngo_to(0, 3)\ndrop()';
  let soToHopChay = 0;
  for (const tg of ['TAY_DAI', 'CHAN_NHANH']) {
    for (const bx of ['OMNI', 'XICH']) {
      const r = TD.chamTranV04({ ten: 'thử', khoi: [{ x: 4, y: 3 }], hanO: null },
        { tayGap: tg, banhXe: bx, R1: ma, R2: tg === 'CHAN_NHANH' ? r2Mu : r2Cam },
        { tayGap: 'TAY_DAI', banhXe: 'OMNI', ...IDLE }, { dongHo: 400 });
      const loi = r.xong.filter((x) => x.loi).map((x) => x.ten + ':' + x.loi.loai);
      if (loi.length === 0 && r.diemA > 0) soToHopChay++;
      else console.log('       ' + tg + '+' + bx + ' → ' + (loi.join(' ') || 'không giao được khối'));
    }
  }
  kiem('cả 4 tổ hợp (2 tay gắp × 2 bánh) đều giao được khối, không lỗi', soToHopChay === 4, String(soToHopChay));
}

console.log('\n== 6. Trần không tăng theo phương án · tất định ==');
{
  kiem('luật KHÔNG có hạn riêng nào theo phương án',
    !('gioiHanTheoPhuongAn' in L) && L.dongHo === 1800 && L.baoHiemTick === 4000 && !('hanO' in L),
    'hanO đến từ ĐỀ, không từ phương án');
  kiem('hạn ô nhớ do ĐỀ quyết định, hai đội cùng hạn',
    L.khe.length === 2 && L.de && typeof L.de.thang === 'object');
  const a = tickCam(KHOI_4, 'TAY_DAI', 'OMNI', 'move(2)\npick()', null).kq;
  const b = tickCam(KHOI_4, 'TAY_DAI', 'OMNI', 'move(2)\npick()', null).kq;
  kiem('chạy hai lần cho cùng điểm và cùng số tick',
    a.diemA === b.diemA && a.tick === b.tick && JSON.stringify(a.khung) === JSON.stringify(b.khung));
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);
