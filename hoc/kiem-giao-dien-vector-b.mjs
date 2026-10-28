/* ============================================================================
   kiem-giao-dien-vector-b.mjs — máy kiểm gói V5b của "Robot Chấn Hưng": GIAO DIỆN PHẲNG các màn NGOÀI màn chơi ở chế độ vector
   (hoc/game/giao-dien-vector-b.css) và ICON VECTOR (hoc/game/ve-vector-icon.js). Chạy ở Node, không trình duyệt, không nặng.
     a. phần V5b (giao-dien-vector-b, V7b việc 10 nối NGUYÊN VĂN vào cuối choi-vector.css sau dòng mốc; máy kiểm tách theo mốc) nằm SAU phần V5a, ve-vector-icon.js sau ve-vector.js và trước mọi tệp dựng màn hình.
     b. Pixel y nguyên: mọi bộ chọn của giao-dien-vector-b.css bắt đầu bằng body.ve-vector; tệp không có steps( / pixelated / Handjet / VT323 /
        vân gỗ (--wood*) / bảng phấn (--chalk) / ảnh nền url( trong khai báo; rê chuột (:hover) chỉ nằm trong @media (hover:hover).
     c. Các màn ngoài màn chơi (màn đầu .d-, chọn gói .g-, lưới màn .c-, Lắp robot .lr-, Sổ lệnh .so-, khung phim .md / .md-loi / .md-cham / .md-tiep / .md-bo-qua /
        .md-khung): mọi luật của choi.css có vân gỗ / bảng phấn / steps() / bóng chữ đều có luật phủ ở vector (giao-dien-vector-b.css hoặc choi-vector.css) đặt lại
        đúng thuộc tính đó (background / background-image, animation / transition, text-shadow); phần tử JS dựng với lớp `chalk` ở các màn đó có luật phủ nền.
     d. Icon: mọi tên icon các màn đó dùng (data-i, Ve.ico, đèn bộ phận den-bo-phan.js) có bản vector trong VeIcon.HINH; taoSvg (DOM giả) cho <svg viewBox 24>
        mà mọi nét / mảng tô đều là currentColor (màu theo vai đặt bằng CSS); ve.js ghi nhãn _vi ở Ve.ico / Ve.sao / Ve.khoa; phạm vi thay KHÔNG gồm #sc-choi.
     e. Tương phản WCAG AA: mọi cặp chữ / nền khai cùng luật trong giao-dien-vector-b.css ≥ 4,5:1 (màu là vai bảng màu); chữ trắng trên nền đặc cũng đo.
     f. Robot màn đầu: man-dau.js luôn đặt trangThai.mat (V7c2), có chớp / cười / liếc, tôn trọng prefers-reduced-motion.
     g. Luật UI: nút chỉ có icon của màn chơi (menu, xoá hết, thụt lề, cuộn khay, ẩn bong bóng) có title; ve-vector-icon.js thêm title cho nút chỉ icon thiếu title.
     h. Trang xem hinh-mau/xem-vector.html có mục V5b nạp giao-dien-vector-b.css và ve-vector-icon.js.
     i. Cài đặt (user 28/10 "Ẩn ở vector"): CaiDat.mo() chạy trong DOM giả: ở vector KHÔNG có mục "Màu sơn R1" (R1 cố định màu đội), ở pixel CÓ như cũ.
   Cờ --loi-gia: cắm bảy lỗi giả trong bộ nhớ (luật ngoài body.ve-vector có steps(), bỏ luật phủ bảng phấn của .d-san, bỏ icon book, cặp chữ 1,7:1,
   :hover ngoài @media, màn đầu quên đặt mắt, Cài đặt vector vẫn có mục sơn) → phải đỏ đúng các mục b, c, d, e, b, f, i.
   Chạy: node hoc/kiem-giao-dien-vector-b.mjs [--loi-gia]   (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const require = createRequire(import.meta.url);
const LOI_GIA = process.argv.includes('--loi-gia');
const BM = require(path.join(GAME, 'bang-mau.js'));
const doc = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');
const J = (o) => JSON.stringify(o);

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1500) : '')); }
}

const MOC_B = /\n\/\* =+ V7b \(28\/10\): từ đây là NGUYÊN VĂN giao-dien-vector-b\.css[^\n]*\n/;   // V7b việc 10: giao-dien-vector-b.css nối NGUYÊN VĂN vào cuối choi-vector.css sau dòng mốc này
const cssGop = doc('choi-vector.css'), viTriMoc = cssGop.search(MOC_B);
let cssB = viTriMoc >= 0 ? cssGop.slice(viTriMoc).replace(MOC_B, '') : '', cssV = viTriMoc >= 0 ? cssGop.slice(0, viTriMoc) : cssGop;
const cssP = doc('choi.css'), html = doc('choi.html'), veJs = doc('ve.js'), xem = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector.html'), 'utf8');
let iconSrc = doc('ve-vector-icon.js'), manDau = doc('man-dau.js');
const manChoi = doc('man-choi.js'), thanhPhan = doc('thanh-phan.js');
if (LOI_GIA) {
  console.log('(đang cắm lỗi giả: bảy lỗi, các mục b, c, d, e, f, i phải đỏ)');
  cssB += '\n.g-the.nope{animation:shake .25s steps(2) 2}\n';                                                  // b: luật ngoài body.ve-vector có steps(
  cssB = cssB.replace(/body\.ve-vector \.d-san,body\.ve-vector \.d-san\.chalk\{[^}]*\}/, '');                  // c: bỏ luật phủ bảng phấn của tấm sân màn đầu
  iconSrc = iconSrc.replace(/\n {4}book: \[[^\n]*\n/, '\n');                                                    // d: mất icon book (Sổ lệnh)
  cssB += '\nbody.ve-vector .g-mota{color:var(--g-vecKeDam);background:var(--g-vecThe)}\n';                   // e: chữ 1,7:1
  cssB += '\nbody.ve-vector .c-man:hover{transform:none}\n';                                                    // b: rê chuột ngoài @media (hover:hover)
  manDau = manDau.replace('tt.mat = matDau();', '');                                                            // f: màn đầu quên đặt mắt
}

function tachLuat(src) {
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');
  const kq = [];
  (function duyet(s, trong) {
    let i = 0;
    while (i < s.length) {
      const mo = s.indexOf('{', i); if (mo < 0) break;
      const dau = s.slice(i, mo).trim();
      let sau = mo + 1, bac = 1; while (sau < s.length && bac) { if (s[sau] === '{') bac++; else if (s[sau] === '}') bac--; sau++; }
      const than = s.slice(mo + 1, sau - 1);
      if (/^@media/.test(dau)) duyet(than, dau);
      else if (!/^@(-webkit-)?keyframes/.test(dau) && !/^@font-face/.test(dau)) kq.push({ sel: dau, than, trong });
      i = sau;
    }
  })(src, '');
  return kq;
}
const luatB = tachLuat(cssB), luatV = tachLuat(cssV), luatP = tachLuat(cssP);

/* ================================================================= a. nạp */
console.log('== a. choi.html nạp tệp của gói ==');
{
  const link = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
  const scr = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const iB = viTriMoc >= 0 ? link.indexOf('choi-vector.css') + 1 : -1, iV = link.indexOf('choi-vector.css');   // V7b: phần B nằm sau phần V trong cùng tệp (mốc có thật)
  const iI = scr.indexOf('ve-vector-icon.js'), iVV = scr.indexOf('ve-vector.js'), iDau = scr.indexOf('man-dau.js');
  const dung = ['man-dau.js', 'man-goi.js', 'man-chon.js', 'man-lap.js', 'mo-dau.js', 'ung-dung.js'].map((f) => scr.indexOf(f)).filter((k) => k >= 0);
  kiem('phần giao-dien-vector-b (V7b: nối vào cuối choi-vector.css sau dòng mốc, choi.html không còn link riêng) nằm sau phần V5a; ve-vector-icon.js sau ve-vector.js, trước mọi tệp dựng màn hình (' + dung.length + ' tệp)',
    iB > iV && iV >= 0 && iI > iVV && iVV >= 0 && dung.every((k) => k > iI) && iDau > iI, J({ iB, iV, iI, iVV, iDau }));
}

/* ================================================================= b. pixel y nguyên */
console.log('\n== b. Pixel y nguyên: chỉ áp ở body.ve-vector, không hình điểm ảnh ==');
{
  const ngoai = []; for (const r of luatB) for (const s of r.sel.split(',')) if (!/^body\.ve-vector[\s.:>[]|^body\.ve-vector$/.test(s.trim())) ngoai.push(s.trim());
  const nguon = cssB.replace(/\/\*[\s\S]*?\*\//g, '');
  const cam = ['steps(', 'pixelated', 'Handjet', 'VT323', 'var(--wood', 'var(--chalk', 'url('].filter((w) => luatB.some((r) => r.than.includes(w)) || (w === 'steps(' && /steps\(/.test(nguon)));
  kiem('giao-dien-vector-b.css: ' + luatB.length + ' luật, mọi bộ chọn bắt đầu bằng body.ve-vector (pixel không có lớp này)', !ngoai.length, J(ngoai.slice(0, 6)));
  kiem('không steps( / pixelated / Handjet / VT323 / vân gỗ --wood / bảng phấn --chalk / ảnh nền url( trong khai báo', !cam.length, J(cam));
  const roChuot = luatB.filter((r) => /:hover/.test(r.sel) && !/hover:\s*hover/.test(r.trong)).map((r) => r.sel.slice(0, 60));
  kiem('mọi luật :hover nằm trong @media (hover:hover) (máy cảm ứng không dính trạng thái rê)', !roChuot.length, J(roChuot));
}

/* ================================================================= c. phủ các màn ngoài màn chơi */
console.log('\n== c. Luật phủ cho mọi vân gỗ / bảng phấn / steps() / bóng chữ của các màn ngoài màn chơi ==');
{
  const TIEN_TO = /^\.(d-|g-|c-|lr-|so-|md$|md-loi|md-cham|md-tiep|md-bo-qua|md-khung)/;
  const KHONG = /^\.(g-gr|g-yl|g-bl|g-pu|g-rd|g-cy|g-or|g-wd|g-am|g-te|g-pk)$/;      // lớp màu nút dùng chung (choi-vector.css mục 6)
  const phu = new Map();
  for (const r of luatB.concat(luatV)) for (const s of r.sel.split(',')) { const k = s.trim().replace(/^body\.ve-vector\s+/, ''); phu.set(k, (phu.get(k) || '') + ';' + r.than); }
  const thieu = []; let soCan = 0;
  for (const r of luatP) {
    const can = [];
    if (/var\(--(wood|chalk)/.test(r.than) || /background(-image)?\s*:[^;]*repeating-linear-gradient/.test(r.than)) can.push(/background-image/.test(r.than) ? 'background-image' : 'background');
    if (/steps\(/.test(r.than)) can.push(/animation/.test(r.than) ? 'animation' : 'transition');
    if (/text-shadow\s*:\s*(?!none)/.test(r.than)) can.push('text-shadow');
    if (!can.length) continue;
    for (const s of r.sel.split(',')) {
      const t = s.trim(); if (!TIEN_TO.test(t) || KHONG.test(t)) continue;
      soCan++;
      const p = phu.get(t) || '';
      for (const thuoc of can) {
        const ok = thuoc === 'background-image' ? /background(-image)?\s*:/.test(p) : thuoc === 'background' ? /background(-color|-image)?\s*:/.test(p) : new RegExp('(^|;)\\s*' + thuoc + '\\s*:').test(p);
        const conSteps = thuoc === 'animation' || thuoc === 'transition' ? /steps\(/.test(p) : false;
        if (!ok || conSteps) thieu.push(t + ' (' + thuoc + ')');
      }
    }
  }
  kiem(soCan + ' bộ chọn của choi.css (màn đầu, chọn gói, lưới màn, Lắp robot, Sổ lệnh, khung phim) có vân gỗ / bảng phấn / steps() / bóng chữ: đều có luật phủ ở vector',
    soCan > 20 && !thieu.length, J(thieu.slice(0, 12)));
  // lớp chalk gắn bằng JS ở các màn đó
  const TEP = ['man-dau.js', 'man-goi.js', 'man-chon.js', 'man-lap.js', 'man-so-lenh.js'];
  const chalk = []; for (const f of TEP) for (const m of doc(f).matchAll(/h\('div', '([\w-]+) chalk'\)/g)) chalk.push(m[1]);
  const chalkThieu = chalk.filter((c) => !luatB.some((r) => r.sel.split(',').some((s) => s.trim() === 'body.ve-vector .' + c + '.chalk' || s.trim() === 'body.ve-vector #sc-lap.cao .' + c) && /background-image\s*:\s*(none|repeating-conic-gradient)/.test(r.than) && !/var\(--(wood|chalk)/.test(r.than)));
  kiem('phần tử dựng với lớp chalk (' + chalk.join(', ') + ') có luật phủ nền ở vector (không bảng phấn)', chalk.length >= 4 && !chalkThieu.length, J(chalkThieu));
}

/* ================================================================= d. icon */
console.log('\n== d. Icon vector ==');
{
  const ctx = { BangMau: BM };
  const m = { exports: {} };
  new Function('window', 'module', 'require', iconSrc)(ctx, m, require);
  const VI = ctx.VeIcon;
  const TEP = ['man-dau.js', 'man-goi.js', 'man-chon.js', 'man-lap.js', 'man-so-lenh.js', 'bang-mo-khoa.js', 'gioi-thieu.js', 'the-part.js', 'cai-dat.js'];
  const ten = new Set();
  for (const f of TEP) {
    const s = doc(f);
    for (const x of s.matchAll(/setAttribute\('data-i', '(\w+)'\)/g)) ten.add(x[1]);
    for (const x of s.matchAll(/data-i="(\w+)"/g)) ten.add(x[1]);
    for (const x of s.matchAll(/Ve\.ico\('(\w+)'/g)) ten.add(x[1]);
    for (const x of s.matchAll(/Ve\.ico\(\w+ \? '(\w+)' : '(\w+)'/g)) { ten.add(x[1]); ten.add(x[2]); }
    if (/Ve\.sao\(/.test(s)) ten.add('star');
    if (/Ve\.khoa\(/.test(s)) ten.add('lock');
  }
  for (const x of doc('den-bo-phan.js').matchAll(/'(den[A-Z]\w*)'/g)) ten.add(x[1]);
  ['huyhieu', 'trum'].forEach((t) => ten.delete(t));                                     // huy hiệu: gói V6; trùm: ô màn trùm dùng huy hiệu
  const thieu = [...ten].filter((t) => !VI || !VI.HINH[t]);
  kiem((VI ? Object.keys(VI.HINH).length : 0) + ' icon vector; ' + ten.size + ' tên icon các màn ngoài màn chơi dùng đều có bản vector', !!VI && !thieu.length, J(thieu));
  // DOM giả: taoSvg ra svg viewBox 24, mọi phần tô / nét currentColor (hay none)
  function El(tag) { this.tagName = tag; this.attrs = {}; this.con = []; this.style = {}; }
  El.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); };
  El.prototype.appendChild = function (c) { this.con.push(c); return c; };
  const D = { createElementNS: (ns, tag) => new El(tag) };
  const sai = [];
  if (VI) for (const t of Object.keys(VI.HINH)) {
    const svg = VI.taoSvg(t, 20, 20, D);
    if (!svg || svg.attrs.viewBox !== '0 0 24 24' || !svg.con.length) { sai.push(t + ': không dựng được'); continue; }
    for (const e of svg.con) {
      const f = e.attrs.fill, st = e.attrs.stroke;
      if (!(f === 'currentColor' || f === 'none') || (st && st !== 'currentColor')) sai.push(t + ': màu ' + f + ' / ' + st);
      if (e.tagName === 'path' && !/^M[\d.\s,-]/.test(e.attrs.d || '')) sai.push(t + ': đường lạ');
    }
  }
  kiem('VeIcon.taoSvg: mọi icon là <svg viewBox="0 0 24 24">, mọi mảng tô / nét là currentColor (màu theo vai đặt bằng CSS), không mã màu', !sai.length, J(sai.slice(0, 8)));
  const svgVec = /function svgVec\(ten, s, tuyChon, phu, nho\)/.test(veJs) && /function ico\(ten, s, tuyChon\) \{ return svgVec\(ten, s, tuyChon\) \|\|/.test(veJs) && /function sao\(bat, s\) \{ return svgVec\('star'/.test(veJs) && /function khoa\(s, tran\) \{ return svgVec\('lock'/.test(veJs) && /function mui\(mau, s\) \{ return svgVec\('mui'/.test(veJs);
  const phamVi = VI && VI.PHAM_VI;
  kiem('V7b: ve.js Ve.ico / sao / khoa / mui ở vector trả thẳng svg (svgVec → VeIcon.svg), pixel vẫn canvas có nhãn _vi; một phạm vi VeIcon.PHAM_VI = #stage (cả khung game, kể cả #sc-choi) cho datTitle',
    svgVec && phamVi === '#stage' && !!VI.svg && !('PHAM_VI_CHOI' in VI));
  const css8 = ['.vi-star', '.vi-star.tat', '.vi-xu', '.vi-lock', '.vi .vi2'].filter((s) => !luatB.some((r) => r.sel.split(',').some((x) => x.trim() === 'body.ve-vector ' + s) && /color\s*:\s*var\(--g-vec\w+\)/.test(r.than)));
  kiem('màu icon đặt theo vai vec* ở giao-dien-vector-b.css (sao, sao tắt, xu, khoá, chi tiết phụ)', !css8.length, J(css8));
}

/* ================================================================= e. tương phản */
console.log('\n== e. Tương phản chữ WCAG AA ==');
{
  const lum = (hex) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const tl = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const vai = (than, thuoc) => { const m = than.match(new RegExp('(?:^|;)\\s*' + thuoc + '\\s*:\\s*var\\(--g-(\\w+)\\)\\s*(?:;|$)')); return m && /^#[0-9a-f]{6}$/i.test(BM[m[1]] || '') ? m[1] : null; };
  const NEN_CHA = { '.lr-xong .lx-phu': 'vecBrand' };                                     // chữ nằm trên nền đặc của phần tử cha (khai ở luật khác)
  const sai = []; let soCap = 0;
  for (const r of luatB) {
    const c = vai(r.than, 'color'); if (!c) continue;
    const n = vai(r.than, 'background') || vai(r.than, 'background-color');
    if (!n && c === 'vecThe') continue;                                                   // chữ trắng không khai nền cùng luật: nền đặc ở luật khác
    if (/\.vi\b|\.vi-|\.vi2/.test(r.sel)) continue;                                       // màu icon (hình, không phải chữ)
    const nen = n || NEN_CHA[r.sel.split(',')[0].replace(/^body\.ve-vector\s+/, '')] || 'vecThe'; soCap++;
    const k = tl(BM[c], BM[nen]);
    if (k < 4.5) sai.push(r.sel.split(',')[0] + ': ' + c + ' / ' + nen + ' = ' + k.toFixed(2));
  }
  kiem(soCap + ' cặp chữ / nền của giao-dien-vector-b.css (luật chỉ có màu chữ đo trên thẻ trắng vecThe) đều ≥ 4,5:1', soCap > 40 && !sai.length, sai.slice(0, 8).join('; '));
}

/* ================================================================= f. mắt robot màn đầu */
console.log('\n== f. Robot màn đầu: mắt biểu cảm chỉ ở vector ==');
{
  const ok = /\n\s*tt\.mat = matDau\(\);/.test(manDau) && (manDau.match(/tt\.mat\s*=/g) || []).length === 1 && !/VeVector\.bat\(\)\) tt\.mat/.test(manDau);
  const kieu = ['chop1', 'chop2', 'vui', "'thuong:'"].every((k) => manDau.includes(k)) && /prefers-reduced-motion: reduce/.test(manDau) && !/Math\.random/.test(manDau.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, ''));
  kiem('man-dau.js luôn đặt trangThai.mat = matDau() (V7c2: game luôn vector, hết điều kiện VeVector.bat())', ok);
  kiem('mắt có chớp (chop1 / chop2), cười ở mép (vui), liếc về hướng sắp đi (thuong:±1); giảm chuyển động không chớp; không Math.random', kieu);
}

/* ================================================================= g. luật UI: title */
console.log('\n== g. Nút chỉ có icon có title ==');
{
  const can = [
    ['menu (man-choi.js)', /data-nut="menu" aria-label="' \+ t\('choi\.menu'\) \+ '" title="' \+ t\('choi\.menu'\)/.test(manChoi)],
    ['xoá hết (man-choi.js)', /data-nut="xoa-het" aria-label="' \+ t\('choi\.xoaHet'\) \+ '" title=/.test(manChoi)],
    ['thụt lề (thanh-phan.js)', /b\.setAttribute\('aria-label', t\(c\[2\]\)\); b\.title = t\(c\[2\]\);/.test(thanhPhan)],
    ['cuộn khay (thanh-phan.js)', /b\.setAttribute\('aria-label', t\(nhanChu\)\); b\.title = t\(nhanChu\);/.test(thanhPhan)],
    ['ẩn bong bóng (thanh-phan.js)', /nx\.setAttribute\('aria-label', t\('choi\.anBong'\)\); nx\.title = /.test(thanhPhan)],
    ['sửa / khoá khối hàm (thanh-phan.js)', /e\.title = e\.getAttribute\('aria-label'\);/.test(thanhPhan)],
    ['Cài đặt màn đầu (man-dau.js)', /bc\.title = t\('caiDat\.nut'\)/.test(manDau)],
    ['nút chỉ icon thiếu title ở các màn ngoài màn chơi (ve-vector-icon.js datTitle)', /function datTitle\(b\)/.test(iconSrc) && /button\[aria-label\]:not\(\[title\]\)/.test(iconSrc)]
  ];
  const thieu = can.filter((x) => !x[1]).map((x) => x[0]);
  kiem(can.length + ' chỗ dựng nút chỉ có icon có title cùng chữ aria-label', !thieu.length, J(thieu));
}

/* ================================================================= i. Cài đặt: mục Màu sơn R1 ẩn ở vector */
console.log('\n== i. Cài đặt (V7c1): không còn "Màu sơn R1" lẫn "Kiểu vẽ", còn Biểu cảm mắt ==');
{
  let caiDat = doc('cai-dat.js');
  if (LOI_GIA) caiDat = caiDat.replace('hop.than.appendChild(hangMat());', "hop.than.appendChild(hangMat()); var _s = h('div'); _s.setAttribute('data-cd', 'son'); hop.than.appendChild(_s);");   // lỗi giả: Cài đặt lại có mục sơn (V7c1 đã bỏ)
  // DOM giả tối thiểu: đủ cho CaiDat.mo dựng cây phần tử
  function El(tag, cls, chu) { this.tagName = tag; this.className = cls || ''; this.attrs = {}; this.con = []; this.style = { setProperty() {} }; this.textContent = chu || ''; this.dataset = {};
    this.classList = { add() {}, remove() {}, toggle() {}, contains: () => false }; }
  El.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); };
  El.prototype.getAttribute = function (k) { return k in this.attrs ? this.attrs[k] : null; };
  El.prototype.appendChild = function (c) { this.con.push(c); return c; };
  El.prototype.addEventListener = function () {};
  El.prototype.querySelector = function () { return null; };
  El.prototype.querySelectorAll = function () { return []; };
  const tim = (e, k, v) => !!e && (e.attrs && e.attrs[k] === v || (e.con || []).some((c) => tim(c, k, v)));
  function dung() {
    const than = new El('div', 'hop-than');
    const w = {
      BangMau: BM, TP: { h: (tag, cls, chu) => new El(tag, cls, chu), Hop: { mo: () => ({ hop: new El('div', 'hop'), than }), nut: (c, chu) => new El('button', c, chu), dong() {} } },
      Ve: { hydrate() {}, ico: () => new El('canvas'), khoa: () => new El('canvas'), sao: () => new El('canvas') },
      VeVector: { bat: () => true }, VeRobot: { sonHieuLuc: () => '' },
      Luu: { docCaiDat: () => ({ mat: true }), ghiCaiDat() {}, daXem: () => true }, App: { tongSao: () => 0 },
      SanVe: { coMatDong: () => true }, location: { href: 'http://x/choi.html', search: '' }
    };
    w.window = w;
    w.t = (k) => k; w.require = require;
    try { vm.runInNewContext(caiDat, w); w.CaiDat.mo(); }
    catch (e) { return { loi: String(e && e.message || e) }; }
    return { son: tim(than, 'data-cd', 'son'), kieuVe: tim(than, 'data-cd', 'kieu-ve'), mat: tim(than, 'data-cd', 'mat') };
  }
  const v = dung();
  kiem('CaiDat.mo() (V7c1): KHÔNG có mục Màu sơn R1 (data-cd="son") lẫn Kiểu vẽ (data-cd="kieu-ve"), vẫn có Biểu cảm mắt; cai-dat.js hết hangSon / DS_SON / hangKieuVe / luuCheDo',
    !v.loi && v.son === false && v.kieuVe === false && v.mat && !/hangSon|DS_SON|hangKieuVe|luuCheDo/.test(caiDat), J(v));
}

/* ================================================================= h. trang xem */
console.log('\n== h. Trang xem ==');
{
  const ok = /id="v5b"/.test(xem) && /href="\.\.\/game\/choi-vector\.css"/.test(xem) && !/href="\.\.\/game\/giao-dien-vector-b\.css"/.test(xem) && /<script src="\.\.\/game\/ve-vector-icon\.js"><\/script>/.test(xem) && /VeIcon\.taoSvg/.test(xem);   // V7b: trang con chỉ nạp choi-vector.css (đã gồm phần V5b)
  kiem('hinh-mau/xem-vector.html có mục V5b (nạp choi-vector.css đã gồm phần V5b, không còn link giao-dien-vector-b.css; ve-vector-icon.js; bảng mọi icon, mẫu màn đầu / hộp gói / lưới màn / Lắp robot / Sổ lệnh)', ok);
}

console.log('\n---------------------------------------------');
console.log((hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT ' + dat + ' · HỎNG 0') + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);
