/* ============================================================================
   kiem-core-san-robot.mjs — test cho ĐỢT 1 của dòng "Đội Robot Chấn Hưng".

   Chạy:  node nhan/kiem-core-san-robot.mjs

   Kiểm những bất biến đã ghi ở GDD v0.2 §17 (phần áp dụng được cho đợt 1):
     1. Tất định: cùng (sân, chương trình) → cùng bản ghi.
     3. Mọi bài đều có lời giải trong tập lệnh đã mở  → lời giải mẫu phải đạt hạng A.
     8. Không treo máy: vòng lặp vô tận phải bị chặn.
   Và các tính chất sư phạm:
     - Code đi thừa bước phải TRƯỢT hạng A (không được tha).
     - Nhân chạy code phải báo lỗi đúng dòng.
   ========================================================================== */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const day = path.dirname(fileURLToPath(import.meta.url));
const R = require(path.join(day, 'san-robot-core.js'));

let dat = 0, hong = 0;
const hongChiTiet = [];

function kiem(ten, dieuKien, chiTiet) {
  if (dieuKien) { dat++; console.log('  ok   ' + ten); }
  else { hong++; hongChiTiet.push(ten + (chiTiet ? ' → ' + chiTiet : '')); console.log('  HỎNG ' + ten + (chiTiet ? ' → ' + chiTiet : '')); }
}

console.log('\n== 1. Mỗi bài phải có lời giải mẫu đạt hạng A ==');
for (const bai of R.BAI) {
  const kq = R.chamBai(bai, bai.loiGiai);
  const soTick = kq.chinh.tick;
  kiem(`bài ${bai.so} "${bai.ten}" lời giải mẫu đạt hạng A`,
    kq.hang === 'A',
    `hạng=${kq.hang} chẩn đoán=[${kq.chanDoan}]${kq.chinh.loi ? ' lỗi: ' + kq.chinh.loi.thongDiep : ''}`);
  kiem(`bài ${bai.so} chạy trong hạn tick (${soTick}/${bai.gioiHanTick})`, soTick <= bai.gioiHanTick);
  kiem(`bài ${bai.so} có ≥ 2 sân ẩn`, (bai.sanAn || []).length >= 2);
}

console.log('\n== 2. Code đi thừa bước phải trượt hạng A ==');
{
  const bai1 = R.BAI[0];
  const kq = R.chamBai(bai1, 'move(9)');
  kiem('bài 1 · move(9) không đạt hạng A', kq.hang !== 'A', `hạng=${kq.hang}`);
  kiem('bài 1 · move(9) có chẩn đoán hit-wall', kq.chanDoan.includes('hit-wall'));

  const bai3 = R.BAI[2];
  const thuaMotBuoc = 'move(2)\npick()\nmove(3)\nturn_right()\nmove(4)';
  const kq3 = R.chamBai(bai3, thuaMotBuoc);
  kiem('bài 3 · đi thừa 1 bước coi như chưa xong', kq3.hang === null, `hạng=${kq3.hang} chẩn đoán=[${kq3.chanDoan}]`);
}

console.log('\n== 3. Tất định (bất biến 1) ==');
{
  const bai = R.BAI[4];
  const a = R.chayTrenSan(bai, bai.san, bai.loiGiai);
  const b = R.chayTrenSan(bai, bai.san, bai.loiGiai);
  kiem('hai lần chạy cho cùng khung phát lại', JSON.stringify(a.khung) === JSON.stringify(b.khung));
}

console.log('\n== 4. Nhân chạy code: vòng lặp, hàm, điều kiện ==');
{
  const bai1 = R.BAI[0];
  kiem('for i in range(4): move()  → 4 tick',
    R.chayTrenSan(bai1, bai1.san, 'for i in range(4):\n    move()').tick === 4);
  kiem('while đếm lùi hoạt động',
    R.chayTrenSan(bai1, bai1.san, 'n = 4\nwhile n > 0:\n    move()\n    n = n - 1').ok === true);
  kiem('def + gọi hàm hoạt động',
    R.chayTrenSan(bai1, bai1.san, 'def di(n):\n    move(n)\ndi(4)').ok === true);
  const b6 = R.BAI[5];
  kiem('if/else hoạt động (dùng cảm biến đã mở ở chặng 2)',
    R.chayTrenSan(b6, b6.san, 'if at_goal():\n    wait()\nelse:\n    move(7)').ok === true);
  kiem('cú pháp KHÔNG bị khoá: while/for chạy được cả ở bài 1 (ai biết thì dùng)',
    R.chayTrenSan(bai1, bai1.san, 'n = 0\nwhile n < 4:\n    move()\n    n = n + 1').ok === true);
  kiem('print thu được kết quả',
    R.chayTrenSan(bai1, bai1.san, 'print(1 + 2)').ra[0] === '3');
  kiem('biến nhớ giá trị qua vòng lặp',
    R.chayTrenSan(bai1, bai1.san, 's = 0\nfor i in range(3):\n    s = s + i\nprint(s)').ra[0] === '3');
}

console.log('\n== 5. Chẩn đoán lỗi ==');
{
  const bai1 = R.BAI[0];
  const r1 = R.chayTrenSan(bai1, bai1.san, 'move(4');
  kiem('thiếu dấu ")" → syntax-error', r1.chanDoan.includes('syntax-error'), JSON.stringify(r1.loi));

  const r2 = R.chayTrenSan(bai1, bai1.san, 'move(4)\n  move()');
  kiem('thụt lề lạ → indent-error', r2.chanDoan.includes('indent-error'), JSON.stringify(r2.loi));

  const r3 = R.chayTrenSan(bai1, bai1.san, 'while True:\n    pass');
  kiem('while True: pass → infinite-loop (không treo máy)', r3.chanDoan.includes('infinite-loop'), `chẩn đoán=[${r3.chanDoan}]`);

  const r3b = R.chayTrenSan(bai1, bai1.san, 'while True:\n    wait()');
  kiem('while True: wait() vẫn bị chặn (timeout) và lời nhắn nhắc tới vòng lặp',
    r3b.chanDoan.includes('timeout') && /vòng lặp/.test(r3b.loi.thongDiep),
    `chẩn đoán=[${r3b.chanDoan}] lời=${r3b.loi && r3b.loi.thongDiep}`);

  const r4 = R.chayTrenSan(bai1, bai1.san, 'move(10 / 0)');
  kiem('chia cho 0 → runtime-error', r4.chanDoan.includes('runtime-error'), JSON.stringify(r4.loi));

  const r5 = R.chayTrenSan(bai1, bai1.san, 'bay_luon()');
  kiem('gọi hàm không có → runtime-error', r5.chanDoan.includes('runtime-error'));

  const r6 = R.chayTrenSan(bai1, bai1.san, 'x = "abc');
  kiem('chuỗi chưa đóng nháy → syntax-error, đúng dòng 1', r6.chanDoan.includes('syntax-error') && r6.loi.dong === 1, JSON.stringify(r6.loi));
  const r6b = R.chayTrenSan(bai1, bai1.san, 'x = "abc"\nmove(4)\nprint(x)');
  kiem('chuỗi hợp lệ chạy được (chi tiết ở hoc/kiem-chuoi.mjs)', r6b.ok && r6b.ra[0] === 'abc', JSON.stringify(r6b.loi));

  const r7 = R.chayTrenSan(bai1, bai1.san, 'for i in range(50):\n    turn_left()');
  kiem('quay 50 lần → timeout', r7.chanDoan.includes('timeout'), `chẩn đoán=[${r7.chanDoan}] tick=${r7.tick}`);

  const r8 = R.chayTrenSan(bai1, bai1.san, 'turn_left()\nturn_left()');
  kiem('chạy xong mà chưa tới đích → unfinished', r8.chanDoan.includes('unfinished'));

  const r9 = (() => { const b = R.BAI[1]; return R.chayTrenSan(b, b.san, 'move(4)'); })();
  kiem('về đích khi còn vật → missed-item', r9.chanDoan.includes('missed-item'), `chẩn đoán=[${r9.chanDoan}]`);
}

console.log('\n== 6. Mọi sân đọc được ==');
for (const bai of R.BAI) {
  const tatCa = [bai.san].concat(bai.sanAn || []);
  let okHet = true;
  for (const s of tatCa) { try { R.docSan(s); } catch (e) { okHet = false; hongChiTiet.push(`bài ${bai.so}: ${e.message}`); } }
  kiem(`bài ${bai.so} · ${tatCa.length} sân hợp lệ`, okHet);
}

console.log('\n== 7. Thẻ lệnh ↔ Python (mỗi dòng thẻ là 1 dòng code) ==');
{
  const bai4 = R.BAI[3];
  const theLenh = ['move(3)', 'pick()', 'turn_right()', 'move(3)', 'pick()', 'turn_left()', 'move(4)'];
  kiem('chương trình ghép từ thẻ cho kết quả giống lời giải mẫu',
    R.chamBai(bai4, theLenh.join('\n')).hang === R.chamBai(bai4, bai4.loiGiai).hang);
}

console.log('\n== 8. Bài 6 (chặng 2): dạy while bằng màn độ dài thay đổi + thẻ CÓ SẴN trên khay ==');
{
  const b6 = R.BAI[5];
  kiem('bài 6 thuộc chặng 2 và có thẻ mới "while"', b6.chang === 2 && b6.theMoi === 'while');
  kiem('khay bài 6 có at_goal() (thẻ while cần nó)', b6.khay.includes('at_goal'));
  kiem('khối bài 6 có while', b6.khoi.includes('while'));
  kiem('khay bài 6 KHÔNG có turn_left (khay hẹp có chủ ý, không nhiễu)',
    !b6.khay.includes('turn_left'), b6.khay.join(','));

  const dai = [b6.san].concat(b6.sanAn).map((s) => R.docSan(s).rong);
  kiem('ba sân DÀI KHÁC NHAU: ' + dai.join(' / '), new Set(dai).size === 3, dai.join(','));

  // Kiểu "đếm bước": qua sân chính nhưng không thể qua cả ba sân
  const demBuoc = R.chamBai(b6, 'move(7)');
  kiem('đếm bước (move(7)) qua sân chính nhưng trượt sân ẩn → hạng B', demBuoc.hang === 'B', `hạng=${demBuoc.hang}`);
  kiem('move(7) húc tường ở sân ẩn ngắn', demBuoc.sanAn[0].vaTuong > 0, `vaTuong=${demBuoc.sanAn[0].vaTuong}`);
  kiem('move(7) chưa tới đích ở sân ẩn dài', demBuoc.sanAn[1].ok === false);

  // Kiểu "lặp chừng nào chưa tới đích"
  const kq = R.chamBai(b6, 'while not at_goal():\n    move()');
  kiem('while not at_goal(): move() đạt hạng A', kq.hang === 'A', `hạng=${kq.hang}`);
  kiem('tick đúng bằng độ dài từng sân (7 / 3 / 10)',
    kq.chinh.tick === 7 && kq.sanAn[0].tick === 3 && kq.sanAn[1].tick === 10,
    `${kq.chinh.tick} / ${kq.sanAn[0].tick} / ${kq.sanAn[1].tick}`);

  const chiThe = ['move(7)', 'move(4)', 'move(11)', 'turn_left()', 'move(7)'];
  kiem('mọi chương trình chỉ-đếm-bước đều trượt hạng A', chiThe.every((c) => R.chamBai(b6, c).hang !== 'A'));

  // Thân rỗng: thẻ while chưa có gì trong thân → pass → lặp mãi. `pass` tốn 0 tick
  // nên nó chạm ngưỡng số lệnh (infinite-loop) trước ngưỡng tick — cả hai đều là
  // "bị chặn, không treo máy", nhưng lời chẩn đoán đúng ở đây là infinite-loop.
  const rong = R.chayTrenSan(b6, b6.san, 'while not at_goal():\n    pass');
  kiem('thân rỗng (pass) bị chặn bằng infinite-loop, không treo máy',
    rong.chanDoan.includes('infinite-loop'), `chẩn đoán=[${rong.chanDoan}]`);
}

console.log('\n== 9. LUẬT KHAY THEO BÀI: không bài học nào được cần thứ chưa dạy ==');
{
  const LENH_CHANG_1 = ['move', 'turn_left', 'turn_right', 'pick', 'wait'];
  const CAM_BIEN = ['at_goal', 'front_is_wall', 'steps'];

  for (const bai of R.BAI) {
    if (bai.chang === 1) {
      const ngoai = bai.khay.filter((k) => !LENH_CHANG_1.includes(k));
      kiem(`bài ${bai.so} (chặng 1) khay chỉ có lệnh chặng 1`, ngoai.length === 0, ngoai.join(', '));
    } else {
      const la = bai.khay.every((k) => LENH_CHANG_1.includes(k) || CAM_BIEN.includes(k));
      kiem(`bài ${bai.so} (chặng ${bai.chang}) khay chỉ gồm lệnh đã học + cảm biến`, la, bai.khay.join(', '));
    }
    // lời giải mẫu không được dùng lệnh ngoài khay
    const dung = [];
    for (const m of bai.loiGiai.matchAll(/([a-z_]+)\s*\(/g)) if (!dung.includes(m[1])) dung.push(m[1]);
    const thua = dung.filter((d) => !bai.khay.includes(d));
    kiem(`bài ${bai.so} lời giải mẫu chỉ dùng lệnh trong khay`, thua.length === 0, thua.join(', '));
  }

  kiem('tất cả 6 bài đều là BÀI HỌC (không còn bài "đố không giải được")',
    R.BAI.length === 6 && R.BAI.every((b) => !b.laPhongThiNghiem));

  // gọi lệnh chưa mở phải ra locked-command kèm lời giải thích
  const b1 = R.BAI[0];
  const r = R.chayTrenSan(b1, b1.san, 'at_goal()');
  kiem('gọi at_goal() ở bài 1 → locked-command', r.chanDoan.includes('locked-command'), `chẩn đoán=[${r.chanDoan}]`);
  kiem('và lời nhắn nói rõ chưa mở, kèm khay đang có',
    /chưa mở/.test(r.loi.thongDiep) && /move\(\)/.test(r.loi.thongDiep), r.loi.thongDiep);

  // ở chặng 2 thì at_goal() đã mở
  const b6 = R.BAI[5];
  const r6 = R.chayTrenSan(b6, b6.san, 'at_goal()');
  kiem('sang chặng 2 thì at_goal() đã mở', !r6.chanDoan.includes('locked-command'), `chẩn đoán=[${r6.chanDoan}]`);
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
if (hong) { console.log('\nChi tiết hỏng:'); hongChiTiet.forEach(h => console.log(' - ' + h)); }
process.exit(hong ? 1 : 0);
