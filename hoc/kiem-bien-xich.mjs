/* ============================================================================
   kiem-bien-xich.mjs — máy kiểm TRÙM chương `bien-xich` "Biến cho xích" (mùa 2 gói 1 chương 2; màn mới bien-xich.1 của man-bien-xich.js, thành màn 10).
   1. Vị trí: chương bien-xich đúng 10 màn trong lộ trình; màn 10 là bien-xich.1, hạng trum, huy hiệu { ma: 'bien-xich' } có hình vector riêng (coHinhRieng);
      chín màn đầu là chín màn có sẵn (che-xich.1, .2, .6, .8, che-cam-bien.6, .5, .9, robot-hoan-thien.9, che-xich.9) đúng thứ tự; thẻ <script> trong game/choi.html.
   2. Chấm (kho hàm của em lúc tới màn, mỗi màn trước tạo / sửa hàm theo lời giải): lời giải 3 sao, đúng sao.o / sao.nhip; mã mẫu thua; lời giải khác đúng 2 sao;
      công thức khác thắng; lời sai thua và có đủ mã phaiCoMa; lời giải dùng biến (n = …); hàm cần (hamCuaEmCan) đều có trong kho.
   3. CẦN BIẾN:
      - ba sân cùng MỘT phòng (sân y hệt nhau), chỉ hàng xuất phát / hàng xe mờ khác nhau; ô ◆ ở đầu làn trái;
      - BFS chung ba sân (bộ dò do-duong-che-xich.mjs, nhịp xích thật): KHÔNG có dãy lệnh gốc cố định nào (dài bao nhiêu cũng vậy) thắng cả ba sân, nên phải đọc front_clear();
      - các lời KHÔNG dùng biến tiêu biểu (không lên, không đếm, đếm cứng, phân nhánh if lồng viết cứng theo từng sân) không được 3 sao (thua hoặc thừa ô).
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
const D = await import('./do-duong-che-xich.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); } else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const tatCa = M.danhSach;
const ds = tatCa.filter((m) => m.chuong === 'bien-xich').sort((a, b) => a.so - b.so);
const trum = M.timMa('bien-xich.1');

/* ---------------------------------------------------------------- 1. vị trí, huy hiệu */
const CO_SAN = ['che-xich.1', 'che-xich.2', 'che-xich.6', 'che-xich.8', 'che-cam-bien.6', 'che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9', 'che-xich.9'];
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

/* ---------------------------------------------------------------- 3. cần biến */
kiem('ba sân y hệt nhau, chỉ hàng xuất phát / xe mờ khác nhau', trum.san.length === 3 && trum.san.every((s) => J(s) === J(trum.san[0]))
  && new Set(trum.batDau.map((b) => b.y)).size === 3 && trum.batDau.every((b, i) => b.y === trum.bongMo[i].y));
kiem('mỗi sân có ô ◆ ở đầu làn trái', trum.bongMo.every((b) => J(b.diQua) === J([{ x: 1, y: 0 }])));
{
  const ctxs = trum.san.map((s, i) => D.dungNguCanh(Object.assign({}, trum, { san: s, batDau: trum.batDau[i], bongMo: trum.bongMo[i] })));
  const hd = ctxs[0].hanhDong;
  const khoa = (T) => T.map((S) => S.x + ',' + S.y + ',' + S.h + ',' + S.q + ',' + S.mask).join('|');
  let lop = [ctxs.map((c) => D.trangThaiDau(c))];
  const thay = new Set([khoa(lop[0])]);
  let thang = null, so = 1;
  while (lop.length && !thang && so < 2000000) {
    const sau = [];
    for (const T of lop) for (const a of hd) {
      const N = T.map((S, i) => D.buocMotNhip(ctxs[i], S, a));
      const k = khoa(N);
      if (thay.has(k)) continue;
      thay.add(k); so++;
      if (N.every((S, i) => D.laThang(ctxs[i], S))) { thang = N; break; }
      sau.push(N);
    }
    lop = sau;
  }
  kiem('BFS chung ba sân: không dãy lệnh gốc cố định nào thắng cả ba sân (duyệt hết ' + so + ' trạng thái)', !thang && !lop.length, thang ? 'có dãy thắng' : 'chưa duyệt hết');
}
{
  const B = (chinh) => ({ chinh, hamCuaMan: [] });
  const LEN = ['while front_clear():', '    move()'];
  const VE = (n, t = '') => [t + 'sidestep()', t + 'spin()', t + 'for i in range(' + n + '):', t + '    move()'];
  const KHONG_BIEN = [
    ['không lên, chỉ né rồi quay (bỏ ô ◆)', B(['sidestep()', 'spin()'])],
    ['lên tới tường, né, quay, đi tới đáy', B(LEN.concat(['sidestep()', 'spin()'], LEN))],
    ['lên tới tường, về cứng 2 ô', B(LEN.concat(VE(2)))],
    ['lên tới tường, về cứng 3 ô', B(LEN.concat(VE(3)))],
    ['lên tới tường, về cứng 4 ô', B(LEN.concat(VE(4)))],
    ['đi tới đáy rồi lên cứng 1 ô', B(LEN.concat(['sidestep()', 'spin()'], LEN, ['spin()', 'move()', 'spin()']))],
    ['phân nhánh if lồng, viết cứng theo từng sân', B(['move()', 'move()', 'if front_clear():', '    move()', '    if front_clear():', '        move()'].concat(VE(4, '        '),
      ['    else:'], VE(3, '        '), ['else:'], VE(2, '    ')))]
  ];
  for (const [ten, b] of KHONG_BIEN) {
    const r = cham(b);
    kiem('lời không biến không 3 sao: ' + ten + ' (' + (r.thang ? r.sao + ' sao, ' + r.soO + ' ô, ' + r.soNhip + ' nhịp' : 'thua: ' + ma(r).join(',')) + ')', !b.chinh.some((l) => /=/.test(l)) && r.sao < 3, r.sao);
  }
}

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG' : 'ĐẠT') + ' ' + dat + ' · HỎNG ' + hong + ' kiểm');
process.exit(hong ? 1 : 0);
