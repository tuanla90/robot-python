/* ============================================================================
   kiem-bang-mau.mjs — máy kiểm BẢNG MÀU THEO VAI (game/bang-mau.js, gói A1) của "Robot Chấn Hưng".
     1. Bảng màu: mọi giá trị là mã màu hợp lệ; tên vai đúng dạng; gốc của mỗi biến thể (BT) có trong G; A1 chưa gộp (GOP_HET tắt).
     2. Không còn mã màu gõ thẳng trong hoc/game (JS: chuỗi; CSS: giá trị; HTML: <style>, <script>, thuộc tính),
        trừ NGOAI_LE (tệp tĩnh không đọc được bảng màu; giá trị phải bằng đúng một vai).
     3. Token: mọi BM.<vai> / var(--g-<vai>) có trong bảng; vai nào cũng có chỗ dùng; tệp dùng BM có dòng lấy bảng màu ở đầu;
        choi.html nạp bang-mau.js trong <head> trước mọi script; xem-part.html nạp trước part.js.
     4. TƯƠNG ĐƯƠNG TỪNG CHỖ với commit nền NEN (trước khi gom màu): thay mọi token bằng giá trị trong bảng
        → ra ĐÚNG từng byte tệp cũ (chỉ chuẩn hoá nháy kép / nháy đơn quanh chuỗi màu).
     (5. tương đương điểm ảnh bộ PART pixel: đã bỏ ở V7c1, game luôn vector.)
   Mục 4 là phép chứng minh của gói A1 (không đổi màu). Từ gói A2 (đổi giá trị bảng màu / sửa code các tệp màu)
   đặt NEN = null để chỉ giữ mục 1–3.
   Cờ --loi-gia: đổi giá trị một vai (vienDam) và một biến thể trong bộ nhớ → mục 4 phải đỏ.
   Chạy: node hoc/kiem-bang-mau.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const NEN = '13b8a97';   // commit nền của gói A1 (trước khi gom màu)
/* Tệp các gói SAU A1 đã sửa vì việc khác màu (thêm dòng, đổi dòng): mục 4 không so được từng byte với bản nền nữa nên bỏ qua (mục 2–3 vẫn giữ: không mã gõ thẳng, token có trong bảng).
   Mỗi mục ghi gói + lý do; đổi màu thật (A2) thì đặt NEN = null. */
const SUA_SAU_NEN = {
  'phim-mua-1.js': 'V6 (28/10): thùng trong kẹp theo VeRobot.vatKep ở vector, mắt biểu cảm; pixel y nguyên (kiem-huy-hieu-phim-vector.mjs B5)',
  'huy-hieu.js': 'V6 (28/10): ve cũ đổi tên vePixel (thân y nguyên), thêm nhánh vector + HuyHieu.mk; điểm ảnh pixel so ở kiem-huy-hieu-phim-vector.mjs A3; gói 8 mùa 2 Đội (28/10) thêm HINH doi-mua-2, che-doi-mua-2 (màu qua token BM); gói 9 Bệ súng xích (28/10) thêm HINH be-sung, che-be-sung kiểu pixel (chỉ thêm dòng); gói 10 Nhà máy chạy lại (28/10) thêm HINH tong-hop-2, nha-may-chay kiểu pixel (chỉ thêm dòng); V7c2 (28/10): viết lại thành lớp mỏng trên VeVector.HUY_HIEU, bỏ HINH pixel (khác nền hẳn)',
  'san-ve.js': 'V1 (27/10): chế độ vector — canvas theo pixel thiết bị, ô / vật vector; V7c2 (28/10): bỏ nhánh pixel; V7c3 e2 / e3 (29/10): bỏ imageRendering thừa, đo chữ bằng phông vector, bỏ fillStyle bóng thân thừa',
  've-robot.js': 'V1 (27/10): chế độ vector — tiLeChoO / vatKep / REACH / ve() theo VeVector; V7c1 (28/10): bỏ sonChon (sơn mở khoá), sonHieuLuc luôn vang; V7c2 (28/10): chỉ còn vector',
  'man-dau.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)', 'man-lap.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)',
  'mo-dau.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)', 'phim-goi.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)',
  'the-part.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)',
  'man-choi.js': 'V5a (28/10): thẻ R1 / R2 thêm thuộc tính data-son cho CSS giao diện vector (màu đội)',
  'cai-dat.js': 'V5a (28/10): Cài đặt thêm hàng Kiểu vẽ (Nét mới / Điểm ảnh, VeVector.luuCheDo + tải lại); màu icon là token có sẵn; V7c1 (28/10): bỏ hàng Màu sơn R1 (hangSon + bảng sơn dự phòng) và hàng Kiểu vẽ (hangKieuVe)',
  'thanh-phan.js': 'V5a (28/10): giao diện vector — dòng code đổi chỗ trượt mượt (không steps), tôn trọng prefers-reduced-motion; pixel giữ steps(3)',
  've.js': 'V5a (28/10): giao diện vector — mk() phóng sẵn icon điểm ảnh (bỏ image-rendering: pixelated), viền icon mặc định chàm; pixel giữ nhánh cũ; V7c2 (28/10): viết lại còn icon svg + mk + MAU (khác nền hẳn)',
  'xuong-ham.js': 'V6b (28/10): bốn nút chỉ icon (về sân, lấy lại, xoá hàm, xoá hết) thêm title trùng aria-label, cả hai chế độ; màu icon là token có sẵn',
  'bang-mo-khoa.js': 'V7b (28/10): huy hiệu gọi thẳng HuyHieu.mk(ma, tt, s) thay Ve.mk(HuyHieu.ve(…)) (gỡ cầu C4); màu không đổi',
  'gioi-thieu.js': 'V7b (28/10): huy hiệu gọi thẳng HuyHieu.mk (gỡ cầu C4); màu không đổi',
  'man-chon.js': 'V7b (28/10): huy hiệu gọi thẳng HuyHieu.mk (gỡ cầu C4); màu không đổi',
  'man-goi.js': 'V7b (28/10): huy hiệu gọi thẳng HuyHieu.mk (gỡ cầu C4); màu không đổi',
  'huong-dan.js': '29/10 (897fa26): bong bóng hướng dẫn tránh sân, đuôi không kẹp mép / không băng qua nút khác, neo đuôi khối rộng; màu không đổi',
  'choi.css': 'V7c3 e2 (29/10): bỏ khai báo pixel (vân gỗ / bảng phấn / núm --wood* --chalk --stud, image-rendering pixelated, steps(), clip-path răng cưa, .deco .surf / .bev / canvas); màu còn lại không đổi (máy đo kiểu tính tools/do-kieu-tinh.mjs: 0 khác)',
};
const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const goc = path.resolve(day, '..');
const require = createRequire(import.meta.url);
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1500) : '')); }
}

const BM = require(path.join(GAME, 'bang-mau.js'));
if (LOI_GIA) { BM.vienDam = '#1b120b'; const bt = BM._tang.BT[0]; BM[bt] = '#000001'; BM.vaiThuaGia = '#123457'; console.log('(đang cắm lỗi giả: vienDam và ' + bt + ' đổi giá trị, mục 4 phải đỏ; V7c3: thêm vai vaiThuaGia không ai dùng → "vai nào cũng có chỗ dùng" đỏ; choi.css chèn color:#123456 → "không có mã màu gõ thẳng" đỏ)'); }
const KEYS = Object.keys(BM);

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[\d.]+\s*)?\)$/;
const TRIP = /^\d{1,3},\d{1,3},\d{1,3}$/;
const laMau = (s) => HEX.test(s) || RGB.test(s) || TRIP.test(s);
const NHUNG = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}|(?<=rgba?\()\d{1,3},\d{1,3},\d{1,3}(?=,$)/;

const ALIAS = {
  game: "var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)",
  part: "var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('../bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)",
  trang: 'var BM = window.BangMau;'
};
const CHEN = {   // phần gói A1 chèn thêm (bỏ đi khi so với bản nền)
  'choi.html': ['<!-- bảng màu theo vai (gói A1): nạp TRƯỚC mọi tệp dùng màu; ghi biến CSS --g-<vai> cho choi.css -->\n<script src="bang-mau.js"></script>\n']
};   // V7c2 (28/10): part/xem-part.html đã xoá cùng bộ pixel game/part
// mã màu được phép gõ thẳng: tệp tĩnh không chạy JS; giá trị phải bằng đúng vai ghi kèm
const VAI_NEN_TRANG = 'vecNenSau';   // V7b (28/10): mặc định vector → nền tĩnh là nền trang vector (chàm nhạt), không còn nâu gỗ goToiV11
const NGOAI_LE = [
  { tep: 'hoc/game/choi.html', re: /<meta name="theme-color" content="(#[0-9a-f]+)">/, vai: VAI_NEN_TRANG, ly: 'thẻ meta theme-color (thanh trình duyệt) đọc trước khi chạy JS' },
  { tep: 'hoc/game/manifest.webmanifest', re: /"background_color": "(#[0-9a-f]+)"/, vai: VAI_NEN_TRANG, ly: 'manifest PWA là JSON tĩnh' },
  { tep: 'hoc/game/manifest.webmanifest', re: /"theme_color": "(#[0-9a-f]+)"/, vai: VAI_NEN_TRANG, ly: 'manifest PWA là JSON tĩnh' },
  { tep: 'hoc/dong-goi-artifact.py', re: /background:(#[0-9a-f]+)\}/, vai: VAI_NEN_TRANG, ly: 'nền trang Artifact trước khi gói JS nạp' }
];

/* ---------------------------------------------------------------- quét chuỗi JS (bỏ chú thích, regex) */
function chuoiJS(src) {
  const out = []; let i = 0, last = '';
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (c === "'" || c === '"' || c === '`') { let j = i + 1; while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; j++; } out.push({ s: src.slice(i + 1, j), i }); i = j + 1; last = 's'; continue; }
    if (c === '/' && /[(,=:[!&|?{};+\-*%<>~^]|^$/.test(last)) { let j = i + 1, k = false; while (j < src.length && src[j] !== '\n') { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '[') k = true; else if (src[j] === ']') k = false; else if (src[j] === '/' && !k) break; j++; } i = j + 1; last = 'r'; continue; }
    if (/[\w$]/.test(c)) { let j = i; while (/[\w$]/.test(src[j])) j++; const w = src.slice(i, j); last = w === 'return' || w === 'typeof' ? '' : 'w'; i = j; continue; }
    if (!/\s/.test(c)) last = c === ')' || c === ']' ? 'w' : c;
    i++;
  }
  return out;
}
const dong = (src, i) => src.slice(0, i).split('\n').length;
function mauGoThangJS(src) { return chuoiJS(src).filter((x) => laMau(x.s) || NHUNG.test(x.s)).map((x) => 'dòng ' + dong(src, x.i) + ': ' + x.s.slice(0, 60)); }
function mauGoThangCSS(src) {
  const s = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); const out = []; const re = /:([^;{}]*)/g; let m;
  while ((m = re.exec(s))) { const v = m[1]; const r = new RegExp(NHUNG.source, 'g'); let k; while ((k = r.exec(v))) out.push('dòng ' + dong(s, m.index) + ': ' + k[0]); }
  return out;
}

/* ---------------------------------------------------------------- danh sách tệp */
const TEP = [];
(function di(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (!/^(font|icon)$/.test(f)) di(p); }
    else if (/\.(js|css|html)$/.test(f) && f !== 'bang-mau.js') TEP.push(path.relative(GAME, p).split(path.sep).join('/'));
  }
})(GAME);
const doc = (f) => fs.readFileSync(path.join(GAME, f), 'utf8') + (LOI_GIA && f === 'choi.css' ? '\n.loi-gia-v7c3{color:#123456}\n' : '');

/* ================================================================= 1. bảng màu */
console.log('== 1. Bảng màu (game/bang-mau.js) ==');
{
  const T = BM._tang || {};
  const sai = KEYS.filter((k) => typeof BM[k] !== 'string' || !laMau(BM[k]));
  kiem('có bốn tầng G / DOI / LUAT / BT, tổng ' + KEYS.length + ' vai (G ' + (T.G || []).length + ', DOI ' + (T.DOI || []).length + ', LUAT ' + (T.LUAT || []).length + ', BT ' + (T.BT || []).length + ')',
    T.G && T.DOI && T.LUAT && T.BT && T.G.length + T.DOI.length + T.LUAT.length + T.BT.length === KEYS.length);
  kiem('mọi giá trị là mã màu (#rgb / #rrggbb / #rrggbbaa / rgb() / rgba() / bộ ba "r,g,b")', LOI_GIA || sai.length === 0, sai.slice(0, 10).join(', '));
  kiem('tên vai dạng chữ thường đầu, không dấu (dùng được làm biến CSS --g-<vai>)', KEYS.every((k) => /^[a-z][A-Za-z0-9_]*$/.test(k)));
  kiem('gốc của mỗi biến thể có trong G; luật chơi đều tên luat*', Object.keys(BM._gocCua).every((k) => T.G.includes(BM._gocCua[k])) && T.LUAT.every((k) => /^luat/.test(k)));
  const nguon = fs.readFileSync(path.join(GAME, 'bang-mau.js'), 'utf8');
  kiem('gói A1: GOP_HET = false (biến thể giữ mã cũ)', /var GOP_HET = false;/.test(nguon));
}

/* ================================================================= 2. không còn mã gõ thẳng */
console.log('\n== 2. Không còn mã màu gõ thẳng ngoài bang-mau.js ==');
{
  const loi = [];
  for (const f of TEP) {
    const s = doc(f);
    if (f.endsWith('.js')) mauGoThangJS(s).forEach((x) => loi.push(f + ' ' + x));
    else if (f.endsWith('.css')) mauGoThangCSS(s).forEach((x) => loi.push(f + ' ' + x));
    else {
      let rest = s.replace(/<style>([\s\S]*?)<\/style>/g, (m, c) => { mauGoThangCSS(c).forEach((x) => loi.push(f + ' <style> ' + x)); return ''; })
        .replace(/<script>([\s\S]*?)<\/script>/g, (m, c) => { mauGoThangJS(c).forEach((x) => loi.push(f + ' <script> ' + x)); return ''; });
      for (const n of NGOAI_LE.filter((x) => x.tep === 'hoc/game/' + f)) rest = rest.replace(n.re, '');
      const r = new RegExp(NHUNG.source, 'g'); let m; while ((m = r.exec(rest))) loi.push(f + ' (HTML) ' + m[0]);
    }
  }
  kiem('hoc/game/**/*.{js,css,html} (' + TEP.length + ' tệp): không có mã màu gõ thẳng', loi.length === 0, loi.slice(0, 20).join('\n      '));
  for (const n of NGOAI_LE) {
    const m = n.re.exec(fs.readFileSync(path.join(goc, n.tep), 'utf8'));
    kiem('ngoại lệ ' + n.tep + ' (' + n.ly + '): mã ' + (m && m[1]) + ' = BangMau.' + n.vai, LOI_GIA || (!!m && m[1] === BM[n.vai]));
  }
}

/* ================================================================= 3. token, dòng lấy bảng màu, thứ tự nạp */
console.log('\n== 3. Token và thứ tự nạp ==');
{
  const dung = new Set(), thieu = [], khongAlias = [];
  for (const f of TEP) {
    const s = doc(f);
    for (const m of s.matchAll(/(?<![\w$.])BM\.([A-Za-z_$][\w$]*)/g)) { dung.add(m[1]); if (!(m[1] in BM)) thieu.push(f + ': BM.' + m[1]); }
    for (const m of s.matchAll(/var\(--g-([\w-]+)\)/g)) { dung.add(m[1]); if (!(m[1] in BM)) thieu.push(f + ': --g-' + m[1]); }
    if (f.endsWith('.js') && /(?<![\w$.])BM\./.test(s) && s.split('\n')[0] !== (f.startsWith('part/') ? ALIAS.part : ALIAS.game)) khongAlias.push(f);
  }
  kiem('mọi BM.<vai> / var(--g-<vai>) có trong bảng màu', thieu.length === 0, thieu.slice(0, 10).join(', '));
  /* V7c3 e4 (29/10): danh sách VAI_CHO_V7C3 (524 vai: V7c1 cai-dat 11, V7c2 san-ve 45 / part + ve-robot 117 / huy-hieu 89 / ve.js 257, V7c3 e2-e3 choi.css + san-ve 5) xử lý xong:
     500 vai xoá khỏi bang-mau.js; GIỮ 19 vai còn CHỖ DÙNG ĐỘNG (tên vai là chuỗi trong bảng tra rồi đọc BM[tên]: ve-vector-tay-son MAU luatSon*, ve-vector-vat / ve-vector-o
     MAU_DAI + CUC luatVat*, ve-vector.js SON_DOI sonDoToi / sonTimToi — V7c2 tưởng thừa vì mục này chỉ đọc BM.<vai>) và 5 gốc G của biến thể còn dùng
     (kemToi, sanDoSang, sanLamToi, sanXanhLoToi, sanNau: A2 gộp biến thể về gốc qua GOP_HET nên gốc là chỗ dùng). Hai luật sau đưa hai kiểu chỗ dùng đó vào phép đếm. */
  for (const f of TEP) if (f.endsWith('.js') && f !== 'bang-mau.js') for (const m of doc(f).replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/'([A-Za-z][\w]*)'/g)) if (m[1] in BM) dung.add(m[1]);   // tên vai trong chuỗi (bảng tra BM[tên])
  for (const k of [...dung]) if (BM._gocCua[k]) dung.add(BM._gocCua[k]);                                                                                     // gốc của biến thể đang dùng
  const thua = KEYS.filter((k) => !dung.has(k) && k !== VAI_NEN_TRANG);
  kiem('vai nào cũng có chỗ dùng (' + dung.size + ' vai được dùng)', thua.length === 0, thua.slice(0, 20).join(', '));
  kiem('tệp JS dùng BM có dòng lấy bảng màu ở dòng 1 (window.BangMau, ở Node thì require, ngữ cảnh giả thì {})', khongAlias.length === 0, khongAlias.join(', '));
  const html = doc('choi.html'), dau = html.indexOf('<script src="bang-mau.js"></script>');
  kiem('choi.html: bang-mau.js nạp trong <head>, trước choi.css và trước mọi <script src> khác',
    dau > 0 && dau < html.indexOf('</head>') && dau < html.indexOf('href="choi.css"') && dau === html.indexOf('<script src='));
  /* V7c2 (28/10): mục "part/xem-part.html nạp ../bang-mau.js" bỏ (bộ pixel game/part xoá ở V7c2; phanh "không còn part/" nằm ở kiem-ve-vector mục 15) */
}

/* ================================================================= 4. tương đương từng chỗ với bản nền */
function coGit() { try { execFileSync('git', ['-C', goc, 'cat-file', '-e', NEN + '^{commit}'], { stdio: 'ignore' }); return true; } catch (e) { return false; } }
const NEN_OK = NEN && coGit();
const gitShow = (p) => { try { return execFileSync('git', ['-C', goc, 'show', NEN + ':' + p], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return null; } };
if (NEN && !NEN_OK) console.log('\n(không có git hoặc commit ' + NEN + ': bỏ qua mục 4–5)');
if (NEN_OK) {
  console.log('\n== 4. Tương đương từng chỗ với bản nền ' + NEN + ' (thay token bằng giá trị → đúng từng byte tệp cũ) ==');
  const chuanNhay = (s) => s.replace(/"(#[0-9a-fA-F]{3,8}|rgba?\([^"()]*\)|\d{1,3},\d{1,3},\d{1,3})"/g, "'$1'");
  const gt = (t) => { if (!(t in BM)) throw new Error('không có vai ' + t); return BM[t]; };
  let soTep = 0, soToken = 0; const khac = [], boQua = [];
  for (const f of TEP) {
    const cu = gitShow('hoc/game/' + f); if (cu === null) continue;
    let s = doc(f);
    if (!/BM\.|var\(--g-/.test(s)) continue;
    if (SUA_SAU_NEN[f]) { boQua.push(f); continue; }
    soTep++;
    for (const c of CHEN[f] || []) s = s.split(c).join('');
    if (s.startsWith(ALIAS.game + '\n')) s = s.slice(ALIAS.game.length + 1); else if (s.startsWith(ALIAS.part + '\n')) s = s.slice(ALIAS.part.length + 1);
    s = s.replace(/(['"]) \+ BM\.([A-Za-z_$][\w$]*) \+ \1/g, (m, q, t) => { soToken++; return gt(t); })
      .replace(/(?<![\w$.])BM\.([A-Za-z_$][\w$]*)/g, (m, t) => { soToken++; return "'" + gt(t) + "'"; })
      .replace(/var\(--g-([\w-]+)\)/g, (m, t) => { soToken++; return gt(t); });
    const a = chuanNhay(s), b = chuanNhay(cu);
    if (a !== b) {
      const la = a.split('\n'), lb = b.split('\n'); let i = 0; while (i < la.length && la[i] === lb[i]) i++;
      khac.push(f + ' dòng ' + (i + 1) + ':\n        mới→ ' + (la[i] || '').slice(0, 160) + '\n        cũ → ' + (lb[i] || '').slice(0, 160));
    }
  }
  kiem(soTep + ' tệp, ' + soToken + ' token: thay token bằng giá trị bảng màu ra đúng từng byte bản nền', khac.length === 0, khac.slice(0, 5).join('\n      '));
  for (const f of boQua) console.log('  (bỏ qua ' + f + ': đã sửa sau nền — ' + SUA_SAU_NEN[f] + ')');
  kiem('danh sách SUA_SAU_NEN chỉ gồm tệp có thật và thật sự khác bản nền', Object.keys(SUA_SAU_NEN).every((f) => TEP.includes(f) && gitShow('hoc/game/' + f) !== null && gitShow('hoc/game/' + f) !== doc(f)), Object.keys(SUA_SAU_NEN).join(', '));
}

/* (V7c1, 28/10) mục 5 "tương đương điểm ảnh bộ PART" (8528 ảnh Part.ghep bản nền / bản mới) đã bỏ: game luôn vector, part/ là mã chết chờ V7c2; hình vector so ở kiem-ve-vector 12 / 13a-v. */

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT ' + dat + ' · HỎNG 0') + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);
