/* ============================================================================
   kiem-bang-mau.mjs — máy kiểm BẢNG MÀU THEO VAI (game/bang-mau.js, gói A1) của "Robot Chấn Hưng".
     1. Bảng màu: mọi giá trị là mã màu hợp lệ; tên vai đúng dạng; gốc của mỗi biến thể (BT) có trong G; A1 chưa gộp (GOP_HET tắt).
     2. Không còn mã màu gõ thẳng trong hoc/game (JS: chuỗi; CSS: giá trị; HTML: <style>, <script>, thuộc tính),
        trừ NGOAI_LE (tệp tĩnh không đọc được bảng màu; giá trị phải bằng đúng một vai).
     3. Token: mọi BM.<vai> / var(--g-<vai>) có trong bảng; vai nào cũng có chỗ dùng; tệp dùng BM có dòng lấy bảng màu ở đầu;
        choi.html nạp bang-mau.js trong <head> trước mọi script; xem-part.html nạp trước part.js.
     4. TƯƠNG ĐƯƠNG TỪNG CHỖ với commit nền NEN (trước khi gom màu): thay mọi token bằng giá trị trong bảng
        → ra ĐÚNG từng byte tệp cũ (chỉ chuẩn hoá nháy kép / nháy đơn quanh chuỗi màu).
     5. TƯƠNG ĐƯƠNG ĐIỂM ẢNH: Part.ghep mọi thân × tay × cảm biến × ổ × sơn × trạng thái, Part._veMot, veVatNho, veMat,
        bảng K / SON / DS_SON / LOP_SON: bản nền (git show NEN) và bản mới cho ra buffer y hệt.
   Mục 4–5 là phép chứng minh của gói A1 (không đổi màu). Từ gói A2 (đổi giá trị bảng màu / sửa code các tệp màu)
   đặt NEN = null để chỉ giữ mục 1–3.
   Cờ --loi-gia: đổi giá trị một vai (vienDam) và một biến thể trong bộ nhớ → mục 4–5 phải đỏ.
   Chạy: node hoc/kiem-bang-mau.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const NEN = '13b8a97';   // commit nền của gói A1 (trước khi gom màu)
/* Tệp các gói SAU A1 đã sửa vì việc khác màu (thêm dòng, đổi dòng): mục 4 không so được từng byte với bản nền nữa nên bỏ qua (mục 2–3 vẫn giữ: không mã gõ thẳng, token có trong bảng).
   Mỗi mục ghi gói + lý do; đổi màu thật (A2) thì đặt NEN = null. */
const SUA_SAU_NEN = {
  'san-ve.js': 'V1 (27/10): chế độ vector — canvas theo pixel thiết bị, ô / vật vector',
  've-robot.js': 'V1 (27/10): chế độ vector — tiLeChoO / vatKep / REACH / ve() theo VeVector',
  'man-dau.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)', 'man-lap.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)',
  'mo-dau.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)', 'phim-goi.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)',
  'the-part.js': 'V4 (27/10): robot ngoài sân theo cỡ hiển thị (VeRobot.veCo)',
  'man-choi.js': 'V5a (28/10): thẻ R1 / R2 thêm thuộc tính data-son cho CSS giao diện vector (màu đội)',
  'thanh-phan.js': 'V5a (28/10): giao diện vector — dòng code đổi chỗ trượt mượt (không steps), tôn trọng prefers-reduced-motion; pixel giữ steps(3)',
  've.js': 'V5a (28/10): giao diện vector — mk() phóng sẵn icon điểm ảnh (bỏ image-rendering: pixelated), viền icon mặc định chàm; pixel giữ nhánh cũ'
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
if (LOI_GIA) { BM.vienDam = '#1b120b'; const bt = BM._tang.BT[0]; BM[bt] = '#000001'; console.log('(đang cắm lỗi giả: vienDam và ' + bt + ' đổi giá trị, mục 4–5 phải đỏ)'); }
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
  'choi.html': ['<!-- bảng màu theo vai (gói A1): nạp TRƯỚC mọi tệp dùng màu; ghi biến CSS --g-<vai> cho choi.css -->\n<script src="bang-mau.js"></script>\n'],
  'part/xem-part.html': ['<script src="../bang-mau.js"></script>', ALIAS.trang]
};
// mã màu được phép gõ thẳng: tệp tĩnh không chạy JS; giá trị phải bằng đúng vai ghi kèm
const VAI_NEN_TRANG = 'goToiV11';
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
const doc = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');

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
  const thua = KEYS.filter((k) => !dung.has(k) && k !== VAI_NEN_TRANG);
  kiem('vai nào cũng có chỗ dùng (' + dung.size + ' vai được dùng)', thua.length === 0, thua.slice(0, 20).join(', '));
  kiem('tệp JS dùng BM có dòng lấy bảng màu ở dòng 1 (window.BangMau, ở Node thì require, ngữ cảnh giả thì {})', khongAlias.length === 0, khongAlias.join(', '));
  const html = doc('choi.html'), dau = html.indexOf('<script src="bang-mau.js"></script>');
  kiem('choi.html: bang-mau.js nạp trong <head>, trước choi.css và trước mọi <script src> khác',
    dau > 0 && dau < html.indexOf('</head>') && dau < html.indexOf('href="choi.css"') && dau === html.indexOf('<script src='));
  const xp = doc('part/xem-part.html');
  kiem('part/xem-part.html: ../bang-mau.js nạp trước part.js; script nội tuyến lấy BM = window.BangMau',
    xp.indexOf('<script src="../bang-mau.js"></script>') >= 0 && xp.indexOf('<script src="../bang-mau.js"></script>') < xp.indexOf('<script src="part.js">') && xp.includes('<script>' + ALIAS.trang));
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

/* ================================================================= 5. tương đương điểm ảnh của bộ PART */
if (NEN_OK) {
  console.log('\n== 5. Tương đương điểm ảnh: bộ PART bản nền và bản mới ==');
  const TEP_PART = fs.readdirSync(path.join(GAME, 'part')).filter((f) => /^part.*\.js$/.test(f));
  const tam = fs.mkdtempSync(path.join(os.tmpdir(), 'kiem-bang-mau-'));
  fs.mkdirSync(path.join(tam, 'part'));
  for (const f of TEP_PART) { const s = gitShow('hoc/game/part/' + f); if (s !== null) fs.writeFileSync(path.join(tam, 'part', f), s); }
  const thuTu = ['hai-banh', 'xich', 'nhen', 'omni', 'drone', 'kep', 'tay-xoay', 'nam-cham', 'nem', 'hoi', 'son', 'khoang-cach', 'mau', 'cham', 'camera', 'camera-bay', 'hong-ngoai'];
  const nap = (d) => { const P = require(path.join(d, 'part.js')); for (const x of thuTu) if (fs.existsSync(path.join(d, 'part-' + x + '.js'))) require(path.join(d, 'part-' + x + '.js')); return P; };
  const PC = nap(path.join(tam, 'part')), PM = nap(path.join(GAME, 'part'));
  const J = JSON.stringify;
  kiem('bảng K / SON / DS_SON / LOP_SON giống bản nền', ['K', 'SON', 'DS_SON', 'LOP_SON'].every((k) => J(PC[k]) === J(PM[k])), ['K', 'SON', 'DS_SON', 'LOP_SON'].filter((k) => J(PC[k]) !== J(PM[k])).join(', '));
  const anh = (P, f) => { try { const p = f(P); return J(p.buf || p); } catch (e) { return 'LỖI ' + e.message; } };
  const TRANG_THAI = [{}, { bat: true }, { mat: true }, { tuThe: 'duoi', kep: 'dong', cam: true }, { xoay: 'trai', quay: true, banh: true }, { xoay: 'phai', cuc: 'N', doc: true, ngam: 2 },
    { dangNem: true, dangBanTruoc: true, dangBanSau: true, cuc: 'S' }, { low: true, sang: true, duoi: true }];
  let so = 0; const khac = [];
  const thans = PM.ds('than').map((d) => d.ma), tays = [null].concat(PM.ds('tay').map((d) => d.ma));
  const cams = [[]]; for (const d of PM.ds('cam-bien')) for (const o of (Array.isArray(d.gan) ? d.gan : [d.gan])) cams.push([{ ma: d.ma, o }]);
  cams.push([{ ma: 'khoang-cach', o: 'hong' }, { ma: 'camera', o: 'tren' }]);
  const sons = [undefined].concat(Object.keys(PM.SON));
  for (const than of thans) for (const tay of tays) for (const cb of cams) {
    const thu = (cfg, st) => { so++; const a = anh(PC, (P) => P.ghep(cfg, st)), b = anh(PM, (P) => P.ghep(cfg, st)); if (a !== b) khac.push(J(cfg) + ' ' + J(st)); };
    for (const st of TRANG_THAI) thu({ than, tay, camBien: cb }, st);
    for (const son of sons) thu({ than, tay, camBien: cb, son }, {});
  }
  for (const loai of ['than', 'tay', 'cam-bien']) for (const d of PM.ds(loai)) for (const st of TRANG_THAI) {
    so++; const a = anh(PC, (P) => P._veMot(P.lay(loai, d.ma), st)), b = anh(PM, (P) => P._veMot(P.lay(loai, d.ma), st)); if (a !== b) khac.push(loai + '/' + d.ma + ' ' + J(st));
  }
  for (const n of [4, 6, 8, 10]) for (const chat of [undefined, 'go', 'sat']) for (const mau of [undefined, 'red', 'green', 'blue', 'yellow']) {
    const ve = (P) => { const p = new P.Painter(16, 16); P.veVatNho(p, 1, 1, n, chat, mau); return p; };
    so++; if (anh(PC, ve) !== anh(PM, ve)) khac.push('veVatNho ' + n + ' ' + chat + ' ' + mau);
  }
  for (const sang of [false, true]) { const ve = (P) => { const p = new P.Painter(24, 24); P.veMat(p, 4, 4, 6, 3, sang); return p; }; so++; if (anh(PC, ve) !== anh(PM, ve)) khac.push('veMat ' + sang); }
  kiem(so + ' ảnh (ghép thân × tay × cảm biến × ổ × sơn × trạng thái, từng part, vật nhỏ, mắt): buffer bản mới y hệt bản nền', khac.length === 0, khac.length + ' ảnh khác, ví dụ ' + khac.slice(0, 4).join(' | '));
  fs.rmSync(tam, { recursive: true, force: true });
}

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT ' + dat + ' · HỎNG 0') + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);
