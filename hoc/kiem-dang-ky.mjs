/* ============================================================================
   kiem-dang-ky.mjs — máy kiểm "TỆP MÀN ĐÃ ĐĂNG KÝ ĐỦ CHỖ" của "Robot Chấn Hưng".
   Không có bundler: mỗi tệp màn hoc/man-*.js phải được đăng ký TAY ở hai chỗ, quên một chỗ thì chương lặng lẽ biến mất:
     1. game/choi.html: một thẻ <script src="../man-….js">, đứng sau lap-rap.js và trước lo-trinh-hoc.js (lộ trình đọc ngân hàng màn lúc nạp);
     2. lo-trinh-hoc.js: tên tệp trong danh sách require của nhánh Node (máy kiểm và công cụ đọc nội dung qua điểm vào này).
   Kèm: mọi <script src> của choi.html trỏ tới tệp có thật, không nạp trùng; mọi chương trong ThuTuChuong.thuTu có màn trong lộ trình xuất bản.
   (kiem-lo-trinh.mjs đã so danh sách màn của HTML với Node, nhưng không bắt được tệp quên ở CẢ HAI chỗ.)
   Chạy: node hoc/kiem-dang-ky.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}

const tepMan = fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f)).sort();
const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
const src = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const loTrinh = fs.readFileSync(path.join(day, 'lo-trinh-hoc.js'), 'utf8');

console.log('== 1. choi.html ==');
{
  const thieuTep = src.filter((s) => !fs.existsSync(path.resolve(day, 'game', s)));
  kiem('mọi <script src> trỏ tới tệp có thật', !thieuTep.length, thieuTep.join(', '));
  const trung = src.filter((s, i) => src.indexOf(s) !== i);
  kiem('không nạp trùng tệp nào', !trung.length, trung.join(', '));
  const thieu = tepMan.filter((f) => !src.includes('../' + f));
  kiem('mọi tệp hoc/man-*.js có thẻ <script> trong choi.html', !thieu.length, thieu.join(', '));
  const viTri = (f) => src.indexOf('../' + f);
  const lapRap = viTri('lap-rap.js'), lt = viTri('lo-trinh-hoc.js'), sao = viTri('lo-trinh-sao.js');
  const sai = tepMan.filter((f) => viTri(f) >= 0 && (viTri(f) < lapRap || viTri(f) > lt));
  kiem('tệp màn nạp sau lap-rap.js và trước lo-trinh-hoc.js', lapRap >= 0 && lt >= 0 && !sai.length, sai.join(', '));
  kiem('lo-trinh-sao.js nạp trước lo-trinh-hoc.js', sao >= 0 && sao < lt);
}

console.log('\n== 2. lo-trinh-hoc.js (nhánh Node) ==');
{
  const ds = new Set([...loTrinh.matchAll(/require\('\.\/(man-[^']+\.js)'\)/g)].map((m) => m[1]));
  const khoi = /\[([^\]]*)\]\.forEach\(function \(n\) \{ require\('\.\/man-' \+ n \+ '\.js'\); \}\)/.exec(loTrinh);
  kiem('tìm thấy danh sách require tệp màn', !!khoi);
  if (khoi) [...khoi[1].matchAll(/'([^']+)'/g)].forEach((m) => ds.add('man-' + m[1] + '.js'));
  const thieu = tepMan.filter((f) => !ds.has(f));
  kiem('mọi tệp hoc/man-*.js có trong danh sách require của lo-trinh-hoc.js', !thieu.length, thieu.join(', '));
  const khongCo = [...ds].filter((f) => !tepMan.includes(f));
  kiem('danh sách require không trỏ tới tệp không còn', !khongCo.length, khongCo.join(', '));
}

console.log('\n== 3. Chương có màn ==');
{
  const TT = require(path.join(day, 'thu-tu-chuong.js'));
  const M = require(path.join(day, 'lo-trinh-hoc.js'));
  const rong = TT.thuTu.filter((c) => !M.danhSach.some((m) => m.chuong === c));
  kiem('mọi chương trong ThuTuChuong.thuTu có màn trong lộ trình xuất bản', !rong.length, rong.join(', '));
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
