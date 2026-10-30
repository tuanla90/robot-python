/* ============================================================================
   kiem-bien-xich.mjs — máy kiểm TRÙM chương `bien-xich` "Biến cho xích" (mùa 2 gói 1 chương 2; màn mới bien-xich.1 của man-bien-xich.js, thành màn 10).
   1. Vị trí: chương bien-xich đúng 10 màn trong lộ trình; màn 10 là bien-xich.1, hạng trum, huy hiệu { ma: 'bien-xich' } có hình vector riêng (coHinhRieng);
      chín màn đầu là chín màn có sẵn (che-xich.1, .2, .6, .8, che-cam-bien.6, .5, .9, robot-hoan-thien.9, che-xich.9) đúng thứ tự; thẻ <script> trong game/choi.html.
   2. Chấm (kho hàm của em lúc tới màn, mỗi màn trước tạo / sửa hàm theo lời giải): lời giải 3 sao, đúng sao.o / sao.nhip; mã mẫu thua; lời giải khác đúng 2 sao;
      công thức khác thắng; lời sai thua và có đủ mã phaiCoMa; lời giải dùng biến (n = …); hàm cần (hamCuaEmCan) đều có trong kho.
   3. CẦN BIẾN (PDM2a 31/10: gói 1 R1 chỉ thân xích, chưa cảm biến; trùm "Xoắn ốc đôi" một sân, đoạn 1, 1, 2, 2, 3, 3):
      - một sân, R1 không tay / cảm biến; xe mờ có ba góc ◆;
      - các lời KHÔNG dùng biến tiêu biểu (viết cứng từng đoạn, từng cặp, hằng thay n) không được 3 sao (thua hoặc thừa ô).
   Chạy: node hoc/kiem-bien-xich.mjs   (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { coHinhRieng } from './huy-hieu-ds.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const M = require(path.join(day, 'lo-trinh-hoc.js'));
const Cham = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); } else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const tatCa = M.danhSach;
const ds = tatCa.filter((m) => m.chuong === 'bien-xich').sort((a, b) => a.so - b.so);
const trum = M.timMa('bien-xich.1');

/* ---------------------------------------------------------------- 1. vị trí, huy hiệu */
const CO_SAN = ['che-xich.1', 'che-xich.2', 'che-xich.8', 'che-xich.6', 'che-cam-bien.6', 'che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9', 'che-xich.9'];
kiem('chương bien-xich đúng 10 màn', ds.length === 10, ds.length);
kiem('chín màn đầu là chín màn có sẵn đúng thứ tự', J(ds.slice(0, 9).map((m) => m.ma)) === J(CO_SAN), ds.slice(0, 9).map((m) => m.ma).join(' '));
kiem('màn 10 là bien-xich.1, hạng trum', !!trum && ds[9] === trum && trum.so === 10 && trum.hang === 'trum', trum && trum.so + ' ' + trum.hang);
kiem('trùm mang huy hiệu bien-xich có hình vector riêng', !!trum && trum.huyHieu && trum.huyHieu.ma === 'bien-xich' && coHinhRieng('bien-xich'), trum && J(trum.huyHieu));
kiem('màn khác của chương không mang huy hiệu', ds.slice(0, 9).every((m) => !m.huyHieu));
kiem('game/choi.html có thẻ script man-bien-xich.js', /<script[^>]+src="[^"]*man-bien-xich\.js"/.test(fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8')));

/* ---------------------------------------------------------------- 2. chấm */
const tenCot = [...new Set(tatCa.flatMap((m) => m.taoHam || []))];
function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCot });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi || []) { if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam }); kho.sua(h.ten, h.than); }
  }
  return kho.ds();
}
const kho = khoTruoc(trum.id);
const cham = (b) => Cham.cham(trum, b, kho);
const ma = (r) => r.chanDoan.map((c) => c.ma);
kiem('hàm cần (hamCuaEmCan) đều đã có trong kho', trum.hamCuaEmCan.every((t) => kho.some((h) => h.ten === t)), trum.hamCuaEmCan.filter((t) => !kho.some((h) => h.ten === t)).join(','));
const lg = cham(trum.loiGiai);
kiem('lời giải 3 sao, đúng sao.o / sao.nhip', lg.thang && lg.sao === 3 && lg.soO === trum.sao.o && lg.soNhip === trum.sao.nhip, lg.sao + ' sao, ' + lg.soO + ' ô, ' + lg.soNhip + ' nhịp ≠ ' + J(trum.sao));
kiem('lời giải dùng biến (n = …)', trum.loiGiai.chinh.some((l) => /^\s*n = /.test(l)));
const mm = cham(trum.maMau);
kiem('mã mẫu thua', !mm.thang, ma(mm).join(','));
const lk = cham(trum.loiGiaiKhac.baiLam);
kiem('lời giải khác đúng 2 sao', lk.thang && lk.sao === 2, lk.sao);
(trum.congThucKhac || []).forEach((c, i) => { const r = cham(c.baiLam); kiem('công thức khác ' + i + ' thắng', r.thang, ma(r).join(',')); });
trum.loiSai.forEach((c, i) => { const r = cham(c.baiLam); kiem('lời sai ' + i + ' thua, có ' + c.phaiCoMa.join(','), !r.thang && c.phaiCoMa.every((x) => ma(r).includes(x)), ma(r).join(',')); });

/* ---------------------------------------------------------------- 3. cần biến (PDM2a 31/10: gói 1 chưa có cảm biến, biến đếm ĐỘ DÀI ĐOẠN của xoắn ốc) */
kiem('một sân, R1 chỉ thân xích (không tay, không cảm biến), khay chỉ lệnh bánh xích', !Array.isArray(trum.san[0]) && trum.robot.than === 'xich' && !trum.robot.tay
  && !(trum.robot.camBien || []).length && trum.hamGoc.every((t) => ['left_move', 'right_move', 'left_back', 'right_back', 'wait'].includes(t)), J(trum.robot) + ' ' + trum.hamGoc.join(','));
kiem('xe mờ có ba góc ◆ của xoắn ốc', trum.bongMo.diQua.length === 3, J(trum.bongMo));
{
  const B = (chinh) => ({ chinh, hamCuaMan: [] });
  const doan = (n, t = '') => (n === 1 ? [t + 'move()'] : [t + 'for j in range(' + n + '):', t + '    move()']).concat([t + 'tr_right()']);
  const KHONG_BIEN = [
    ['viết cứng sáu đoạn 1, 1, 2, 2, 3, 3', B([1, 1, 2, 2, 3, 3].flatMap((n) => doan(n)))],
    ['ba cặp, mỗi cặp một vòng range(2) viết cứng', B([1, 2, 3].flatMap((n) => ['for k in range(2):'].concat(doan(n, '    '))))],
    ['đoạn đều 1 ô (hằng thay n)', B(['for i in range(3):', '    for k in range(2):'].concat(doan(1, '        ')))],
    ['đoạn đều 2 ô (hằng thay n)', B(['for i in range(3):', '    for k in range(2):'].concat(doan(2, '        ')))],
    ['đoạn đều 3 ô (hằng thay n)', B(['for i in range(3):', '    for k in range(2):'].concat(doan(3, '        ')))]
  ];
  for (const [ten, b] of KHONG_BIEN) {
    const r = cham(b);
    kiem('lời không biến không 3 sao: ' + ten + ' (' + (r.thang ? r.sao + ' sao, ' + r.soO + ' ô, ' + r.soNhip + ' nhịp' : 'thua: ' + ma(r).join(',')) + ')', !b.chinh.some((l) => /=/.test(l)) && r.sao < 3, r.sao);
  }
}

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG' : 'ĐẠT') + ' ' + dat + ' · HỎNG ' + hong + ' kiểm');
process.exit(hong ? 1 : 0);
