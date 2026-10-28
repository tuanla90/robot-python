/* ============================================================================
   kiem-dong-goi-artifact.mjs — máy kiểm gói Artifact (hoc/dong-goi-artifact.py) của "Robot Chấn Hưng", gói V7b (28/10).
   Từ V7b mặc định là bộ vẽ VECTOR nên bản Artifact phải có đủ giao diện vector; trước V7b bản gói chỉ có choi.css + phông pixel từ Google Fonts.
   Chạy python -X utf8 -I hoc/dong-goi-artifact.py hoc/game <thư mục tạm> rồi ghép lại các mảnh (window.__DH) và soát:
     a. chạy được, ra index.html + g/*.js, mỗi tệp mảnh < 40 KB (giới hạn EBADF của máy).
     b. CSS ghép lại (đúng thứ tự chỉ số) chứa đủ 3 tệp theo thứ tự choi.html: font/font.css, choi.css, choi-vector.css (V7b việc 10 đã nối giao-dien-vector-b.css vào);
        choi.css / choi-vector.css NGUYÊN VĂN (từng byte).
     c. Phông vector: 6 @font-face Google Sans Flex / Code nhúng data:font/woff2 (đúng số byte base64 của 6 tệp woff2); không còn url(*.woff2) tương đối;
        không @font-face Handjet / VT323; index.html không gọi fonts.googleapis / gstatic.
     d. Script: mọi <script src> của choi.html đều có trong gói, đúng thứ tự, ghép lại y nguyên; có mọi tệp vector (ve-vector*.js, huy-hieu-vector.js).
     e. Nền tĩnh index.html = vecNenSau của bang-mau.js (cùng theme-color / manifest; kiem-bang-mau.mjs ghim).
   Cờ --loi-gia: bỏ choi-vector.css khỏi danh sách CSS, bỏ nhúng phông (giữ url tương đối), thêm link Google Fonts → b, c phải đỏ.
   Chạy: node hoc/kiem-dong-goi-artifact.mjs [--loi-gia]   (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const require = createRequire(import.meta.url);
const BM = require(path.join(GAME, 'bang-mau.js'));
const LOI_GIA = process.argv.includes('--loi-gia');
const doc = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');
const J = (o) => JSON.stringify(o);

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1200) : '')); }
}

/* ---------------------------------------------------------------- chạy gói ra thư mục tạm */
let py = fs.readFileSync(path.join(day, 'dong-goi-artifact.py'), 'utf8');
if (LOI_GIA) {
  console.log('(đang cắm lỗi giả: bỏ choi-vector.css, không nhúng phông, gọi Google Fonts → b, c phải đỏ)');
  py = py.replace("'choi-vector.css', ", '');
  py = py.replace("css = nhung_phong(css)", 'pass');
  py = py.replace('<meta name="theme-color" content="#e8e6f6">', '<link href="https://fonts.googleapis.com/css2?family=Handjet" rel="stylesheet">');
}
const tam = fs.mkdtempSync(path.join(os.tmpdir(), 'dh-artifact-'));
const pyTep = path.join(tam, 'dong-goi-artifact.py'), RA = path.join(tam, 'ra');
fs.writeFileSync(pyTep, py);
let chay = null;
for (const lenh of [['python', ['-X', 'utf8', '-I', pyTep, GAME, RA]], ['py', ['-3', '-X', 'utf8', '-I', pyTep, GAME, RA]], ['python3', ['-X', 'utf8', '-I', pyTep, GAME, RA]]]) {
  const r = spawnSync(lenh[0], lenh[1], { encoding: 'utf8', cwd: tam });
  if (!r.error && r.status === 0) { chay = r; break; }
  if (!r.error) { chay = r; break; }            // python có nhưng gói lỗi: báo ở a
}
console.log('\n== a. chạy dong-goi-artifact.py ==');
kiem('có python và gói chạy xong (mã 0): ' + ((chay && chay.stdout) || '').trim(), !!chay && chay.status === 0, chay ? (chay.stderr || '').slice(0, 800) : 'không tìm thấy python / py / python3');
if (!chay || chay.status !== 0) { console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm'); process.exit(1); }

const index = fs.readFileSync(path.join(RA, 'index.html'), 'utf8');
const manh = fs.readdirSync(path.join(RA, 'g')).filter((f) => /\.js$/.test(f)).sort();
const quaCo = manh.filter((f) => fs.statSync(path.join(RA, 'g', f)).size >= 40000);
kiem('ra index.html + g/*.js (' + manh.length + ' mảnh), mảnh nào cũng < 40 KB', manh.length > 50 && !quaCo.length, J(quaCo));
const thuTuIndex = [...index.matchAll(/<script src="g\/([cj]\d+)\.js"><\/script>/g)].map((m) => m[1]);
kiem('index.html nạp mọi mảnh theo tên, CSS (c) trước JS (j)', thuTuIndex.length === manh.length && thuTuIndex.every((t, i) => t + '.js' === manh[i]) && thuTuIndex.findIndex((t) => t[0] === 'j') > thuTuIndex.filter((t) => t[0] === 'c').length - 1);

/* ghép lại như trình duyệt: chạy từng mảnh trong sandbox có window.__DH */
const sb = {}; sb.window = sb; vm.createContext(sb);
for (const f of manh) vm.runInContext(fs.readFileSync(path.join(RA, 'g', f), 'utf8'), sb, { filename: f });
const DH = sb.__DH;
function ghep(ds) { const g = {}; for (const [i, m] of ds) (g[i] = g[i] || []).push(m); return Object.keys(g).map(Number).sort((a, b) => a - b).map((k) => g[k].join('')); }
const cssDs = ghep(DH.c), jsDs = ghep(DH.j);

/* ---------------------------------------------------------------- b. CSS */
console.log('\n== b. CSS: đủ 3 tệp đúng thứ tự choi.html, choi.css / choi-vector.css nguyên văn ==');
const CSS_HTML = [...doc('choi.html').matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
kiem('choi.html nạp 3 CSS: font/font.css, choi.css, choi-vector.css (giao-dien-vector-b.css đã nối vào choi-vector.css, V7b việc 10)', J(CSS_HTML) === J(['font/font.css', 'choi.css', 'choi-vector.css']) && !fs.existsSync(path.join(GAME, 'giao-dien-vector-b.css')), J(CSS_HTML));
const tenCss = cssDs.map((c) => (c.match(/^\/\* ([^*]+) \*\//) || [])[1] || '?');
kiem('gói CSS ' + cssDs.length + ' tệp, đúng thứ tự choi.html: ' + tenCss.join(' → '), J(tenCss) === J(CSS_HTML), J(tenCss));
for (const f of ['choi.css', 'choi-vector.css']) {
  const i = tenCss.indexOf(f), nguyen = i >= 0 && cssDs[i] === '/* ' + f + ' */\n' + doc(f) + '\n';
  kiem(f + ' trong gói NGUYÊN VĂN (từng byte)', nguyen, i < 0 ? 'thiếu' : 'khác nguồn');
}

/* ---------------------------------------------------------------- c. phông */
console.log('\n== c. phông: Google Sans Flex / Code nhúng data:, không Handjet / VT323, không Google Fonts ==');
{
  const i = tenCss.indexOf('font/font.css'), fontCss = i >= 0 ? cssDs[i] : '';
  const ff = fontCss.match(/@font-face\s*\{[^}]*\}/g) || [];
  const ho = ff.map((b) => (b.match(/font-family:\s*'([^']+)'/) || [])[1]);
  const nhung = ff.filter((b) => /url\(data:font\/woff2;base64,[A-Za-z0-9+/=]+\)/.test(b)).length;
  const tuongDoi = (fontCss.match(/url\([a-z0-9-]+\.woff2\)/g) || []).length;
  kiem('6 @font-face, đều Google Sans Flex / Code, đều nhúng data:font/woff2 (có: ' + ff.length + ', nhúng ' + nhung + ', url tương đối còn ' + tuongDoi + ')', ff.length === 6 && nhung === 6 && tuongDoi === 0 && ho.every((h) => /^Google Sans (Flex|Code)$/.test(h)), J(ho));
  const doi = [];
  for (const f of fs.readdirSync(path.join(GAME, 'font')).filter((f) => /^gs(flex|code)-.*\.woff2$/.test(f))) {
    const b64 = fs.readFileSync(path.join(GAME, 'font', f)).toString('base64');
    if (!fontCss.includes('url(data:font/woff2;base64,' + b64 + ')')) doi.push(f);
  }
  kiem('6 tệp gsflex-* / gscode-*.woff2 có trong font.css gói đúng từng byte base64', doi.length === 0, 'khác / thiếu: ' + J(doi));
  kiem('không @font-face Handjet / VT323 (phông pixel) trong gói; nguồn font.css đúng 6 @font-face (V7c3: Handjet / VT323 + 6 woff2 đã xoá)', !/Handjet|VT323/.test(ho.join()) && (doc('font/font.css').match(/@font-face/g) || []).length === 6, J(ho));
  kiem('index.html không gọi Google Fonts (fonts.googleapis / fonts.gstatic)', !/fonts\.g(oogleapis|static)\.com/.test(index));
}

/* ---------------------------------------------------------------- d. script */
console.log('\n== d. script: mọi <script src> của choi.html, đúng thứ tự, y nguyên ==');
{
  const srcs = [...doc('choi.html').matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  const khac = [];
  srcs.forEach((s, i) => { const goc = fs.readFileSync(path.normalize(path.join(GAME, s)), 'utf8'); if (jsDs[i] !== goc + '\n//# sourceURL=' + s.replace(/\.\.\//g, '') + '\n') khac.push(s); });
  kiem(srcs.length + ' script của choi.html đều có trong gói theo đúng chỉ số, nội dung y nguyên (+ sourceURL)', jsDs.length === srcs.length && !khac.length, J(khac.slice(0, 5)));
  const vec = srcs.filter((s) => /ve-vector|huy-hieu-vector/.test(s));
  kiem('có mọi tệp vector (' + vec.length + ': ve-vector*.js, huy-hieu-vector.js) và ve-vector-icon.js', vec.length >= 12 && vec.includes('ve-vector-icon.js') && vec.includes('huy-hieu-vector.js'), J(vec));
}

/* ---------------------------------------------------------------- e. nền tĩnh */
console.log('\n== e. nền tĩnh ==');
{
  const m = index.match(/<style>html,body\{height:100%;background:(#[0-9a-f]+)\}<\/style>/);
  kiem('nền trang Artifact trước khi JS nạp = vecNenSau ' + BM.vecNenSau + ' (cùng theme-color choi.html / manifest)', !!m && m[1] === BM.vecNenSau && new RegExp('<meta name="theme-color" content="' + BM.vecNenSau + '">').test(doc('choi.html')), m && m[1]);
}

fs.rmSync(tam, { recursive: true, force: true });
console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm');
if (hong) process.exit(1);
