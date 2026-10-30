/* ============================================================================
   kiem-phim-goi.mjs — máy kiểm "PHIM NGẮN MỞ MỖI GÓI" của "Robot Chấn Hưng" (game/phim-goi.js + game/phim-mua-*.js). Kế hoạch: KE-HOACH-PHIM-GOI.md.
   Không DOM thật. Kiểm:
     1. dữ liệu: mọi gói mùa 1 trừ 'xe' có phim ('xe' dùng phim mở đầu, không có phim gói); mỗi phim 3–4 khung (hàm);
        mã gói của phim có thật trong ThuTuChuong.goi (trừ gói khai sẵn chưa có màn: 'combo');
        khung cuối của phim gói bộ phận (loai 'bo-phan') có bảng code lệnh mới (c.code);
     2. chữ (chu.js): mọi khóa 'pg.<gói>.<n>' của mọi khung có, không rỗng, ≤ 14 từ; không khóa 'pg.<x>.<n>' thừa; đủ khóa nút;
     3. nối luồng (đọc nguồn): choi.html nạp phim-goi.js rồi phim-mua-1.js, trước ung-dung.js; man-goi.js chiếu phim trước App.vaoGoi khi chưa xem,
        nút ▶ có cả aria-label lẫn title; cai-dat.js có "Xem lại phim các gói"; mo-dau.js không dùng khóa pg.*;
     4. chạy thử bộ máy trên DOM giả: gói không phim gọi khiXong ngay; mỗi phim chiếu đủ khung (chạy cả hẹn giờ), không hàm khung nào ném lỗi,
        lời từng khung đúng khóa, nút khung cuối "Vào gói" (hay nutCuoi), Bỏ qua ghi cờ 'phim-goi:<gói>' và gọi khiXong một lần.
     MÙA 3 (30/10, phim-mua-3.js; mục 1c, đứng trước mục 3): gói theo M.mua3; mọi gói có phim ở phim-mua-3.js, gói bộ phận có code ở khung cuối, nạp ngay sau phim-mua-2.js.
     MÙA 2 (28/10, phim-mua-2.js; mục 1b): danh sách gói lấy từ mảng MUA_2 của lo-trinh-hoc.js (đọc nguồn: gói chưa có màn chưa vào ThuTuChuong.goi,
        vd gói 10 nha-may-chay đang viết, nên coi là gói khai sẵn); mọi gói mùa 2 có phim, nằm ở phim-mua-2.js, mỗi phim của tệp này mang mã một gói MUA_2;
        khung cuối phim gói bộ phận mùa 2 có bảng code; choi.html nạp phim-mua-2.js ngay sau phim-mua-1.js; mục 2 và 4 tự gồm phim mùa 2.
   Cờ --loi-gia: cắm sáu lỗi trong bộ nhớ (bỏ phim do-nhiet, phim xich 5 khung, lời pg.be-sung.2 16 từ, thiếu khóa pg.luc-ban.3, phim mã "goi-la"
        trong phim-mua-2.js, choi.html mất thẻ phim-mua-2.js) → các mục tương ứng phải ĐỎ.
   Chạy: node hoc/kiem-phim-goi.mjs [--loi-gia]        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const game = path.join(day, 'game');
const require = createRequire(import.meta.url);

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const nguon = (f) => fs.readFileSync(path.join(game, f), 'utf8');

const SO_TU_TOI_DA = 14;
const LOI_GIA = process.argv.includes('--loi-gia');
// Gói mùa 2 theo mảng MUA_2 (lo-trinh-hoc.js, đọc nguồn): [{ ma, loai }]
const nguonLo = fs.readFileSync(path.join(day, 'lo-trinh-hoc.js'), 'utf8');
const khoiMua2 = (/var MUA_2 = \[([\s\S]*?)\n  \];/.exec(nguonLo) || [])[1] || '';
const GOI_MUA_2 = [...khoiMua2.matchAll(/\{ ma: '([^']+)', ten: '[^']*'(?:, loai: '([^']+)')?/g)].map((m) => ({ ma: m[1], loai: m[2] || '' }));
const CHUA_CO_GOI = [];                       // phim khai sẵn cho gói chưa có màn (27/10: gói combo đã có, mọi phim mùa 1 đều khớp gói thật)
const KHONG_PHIM = ['xe'];                     // gói dùng phim mở đầu (mo-dau.js)

// ---------------------------------------------------------------- nạp
const TT = require(path.join(day, 'thu-tu-chuong.js'));
require(path.join(day, 'lo-trinh-hoc.js'));
const tepPhim = fs.readdirSync(game).filter((f) => /^phim-mua-\d+\.js$/.test(f)).sort();
const PHIM = {}, TEP_CUA = {};
for (const f of tepPhim) { const P = require(path.join(game, f)); Object.assign(PHIM, P); Object.keys(P).forEach((m) => { TEP_CUA[m] = f; }); }

const ctxChu = vm.createContext({});
ctxChu.window = ctxChu;
vm.runInContext(nguon('chu.js'), ctxChu, { filename: 'chu.js' });
const CHU = ctxChu.CHU.vi;

if (LOI_GIA) {
  console.log('(đang cắm 6 lỗi giả: bỏ phim do-nhiet, phim xich 5 khung, lời pg.be-sung.2 16 từ, thiếu pg.luc-ban.3, phim mã "goi-la", choi.html mất phim-mua-2.js)');
  delete PHIM['do-nhiet'];
  PHIM['xich'] = PHIM['xich'].concat([PHIM['xich'][0]]); CHU['pg.xich.5'] = 'Khung thừa.';
  CHU['pg.be-sung.2'] = 'một hai ba bốn năm sáu bảy tám chín mười mười một mười hai mười ba';
  delete CHU['pg.luc-ban.3'];
  PHIM['goi-la'] = PHIM['be-sung']; TEP_CUA['goi-la'] = 'phim-mua-2.js'; ['1', '2', '3'].forEach((n) => { CHU['pg.goi-la.' + n] = CHU['pg.be-sung.' + n] || 'x'; });
}

console.log('== 1. Dữ liệu phim (' + tepPhim.join(', ') + ') ==');
const goiMua1 = TT.goi.filter((g) => g.mua === 'mua-1');
const maCo = new Set(TT.goi.map((g) => g.ma));
{
  kiem('có tệp phim-mua-1.js', tepPhim.includes('phim-mua-1.js'));
  kiem('mùa 1 có gói (ThuTuChuong.goi)', goiMua1.length >= 9, goiMua1.length);
  const thieu = goiMua1.filter((g) => !KHONG_PHIM.includes(g.ma) && !PHIM[g.ma]).map((g) => g.ma);
  kiem('mọi gói mùa 1 trừ ' + KHONG_PHIM.join(', ') + ' có phim', !thieu.length, thieu.join(', '));
  const thua = KHONG_PHIM.filter((m) => PHIM[m]);
  kiem('gói ' + KHONG_PHIM.join(', ') + ' không có phim gói (đã có phim mở đầu)', !thua.length, thua.join(', '));
  const saiSo = Object.keys(PHIM).filter((m) => !Array.isArray(PHIM[m]) || PHIM[m].length < 3 || PHIM[m].length > 4 || PHIM[m].some((f) => typeof f !== 'function'));
  kiem('mỗi phim 3–4 khung, mỗi khung là một hàm vẽ', !saiSo.length, saiSo.map((m) => m + ':' + (PHIM[m] && PHIM[m].length)).join(', '));
  GOI_MUA_2.filter((g) => !maCo.has(g.ma)).forEach((g) => CHUA_CO_GOI.push(g.ma));          // gói mùa 2 chưa có màn (chưa hiện): phim khai sẵn
  const la = Object.keys(PHIM).filter((m) => !maCo.has(m) && !CHUA_CO_GOI.includes(m));
  kiem('mã gói của mọi phim có thật trong ThuTuChuong.goi (trừ gói khai sẵn ' + CHUA_CO_GOI.join(', ') + ')', !la.length, la.join(', '));
  const boPhan = goiMua1.filter((g) => g.loai === 'bo-phan' && PHIM[g.ma]);
  const khongCode = boPhan.filter((g) => !/\bc\.code\(/.test(PHIM[g.ma][PHIM[g.ma].length - 1].toString())).map((g) => g.ma);
  kiem('khung cuối phim gói bộ phận có bảng code lệnh mới (' + boPhan.map((g) => g.ma).join(', ') + ')', boPhan.length >= 5 && !khongCode.length, khongCode.join(', '));
}

console.log('\n== 1b. Phim mùa 2 (gói theo MUA_2 của lo-trinh-hoc.js) ==');
{
  kiem('có tệp phim-mua-2.js', tepPhim.includes('phim-mua-2.js'));
  kiem('MUA_2 có 10 gói (đọc nguồn lo-trinh-hoc.js)', GOI_MUA_2.length === 10, GOI_MUA_2.map((g) => g.ma).join(', '));
  const thieu = GOI_MUA_2.filter((g) => !PHIM[g.ma]).map((g) => g.ma);
  kiem('mọi gói mùa 2 có phim (' + GOI_MUA_2.map((g) => g.ma).join(', ') + ')', !thieu.length, thieu.join(', '));
  const saiTep = GOI_MUA_2.filter((g) => PHIM[g.ma] && TEP_CUA[g.ma] !== 'phim-mua-2.js').map((g) => g.ma + '@' + TEP_CUA[g.ma]);
  kiem('phim gói mùa 2 nằm ở phim-mua-2.js', !saiTep.length, saiTep.join(', '));
  const maMua2 = new Set(GOI_MUA_2.map((g) => g.ma));
  const la = Object.keys(PHIM).filter((m) => TEP_CUA[m] === 'phim-mua-2.js' && !maMua2.has(m));
  kiem('mỗi phim của phim-mua-2.js mang đúng mã một gói của MUA_2 (cờ phim-goi:<mã>)', !la.length, la.join(', '));
  const hien = GOI_MUA_2.filter((g) => maCo.has(g.ma));
  kiem('gói MUA_2 đã hiện (' + hien.length + ' / ' + GOI_MUA_2.length + ') đều thuộc mùa 2 trong ThuTuChuong.goi; gói chưa có màn là gói khai sẵn (' +
    GOI_MUA_2.filter((g) => !maCo.has(g.ma)).map((g) => g.ma).join(', ') + ')', hien.length >= 9 && hien.every((g) => TT.goi.find((x) => x.ma === g.ma).mua === 'mua-2'));
  const boPhan = GOI_MUA_2.filter((g) => g.loai === 'bo-phan' && PHIM[g.ma]);
  const khongCode = boPhan.filter((g) => !/\bc\.code\(/.test(PHIM[g.ma][PHIM[g.ma].length - 1].toString())).map((g) => g.ma);
  kiem('khung cuối phim gói bộ phận mùa 2 có bảng code lệnh mới (' + boPhan.map((g) => g.ma).join(', ') + ')', boPhan.length >= 3 && !khongCode.length, khongCode.join(', '));
}

console.log('\n== 2. Chữ (chu.js) ==');
{
  const can = [];
  Object.keys(PHIM).forEach((m) => PHIM[m].forEach((f, i) => can.push('pg.' + m + '.' + (i + 1))));
  const thieu = can.filter((k) => typeof CHU[k] !== 'string' || !CHU[k].trim());
  kiem('mọi khung có lời ở chu.js (' + can.length + ' khóa pg.<gói>.<n>)', !thieu.length, thieu.join(', '));
  const dai = can.filter((k) => typeof CHU[k] === 'string' && CHU[k].trim().split(/\s+/).length > SO_TU_TOI_DA);
  kiem('mỗi lời ≤ ' + SO_TU_TOI_DA + ' từ', !dai.length, dai.map((k) => k + ' (' + CHU[k].trim().split(/\s+/).length + ' từ)').join(', '));
  const thua = Object.keys(CHU).filter((k) => /^pg\.[^.]+\.\d+$/.test(k) && !can.includes(k));
  kiem('không có khóa pg.<gói>.<n> thừa (không ứng với khung nào)', !thua.length, thua.join(', '));
  const nut = ['pg.boQua', 'pg.tiep', 'pg.vaoGoi', 'pg.xong', 'pg.xemLai', 'caiDat.phimGoi', 'caiDat.phimGoiRong'];
  const thieuNut = nut.filter((k) => typeof CHU[k] !== 'string' || !CHU[k].trim());
  kiem('đủ khóa nút / nhãn (' + nut.join(', ') + ')', !thieuNut.length, thieuNut.join(', '));
  kiem('nút khung cuối là "Vào gói"', CHU['pg.vaoGoi'] === 'Vào gói', CHU['pg.vaoGoi']);
}

console.log('\n== 1c. Phim mùa 3 "Mỏ quặng" (gói theo MUA_3 của lo-trinh-hoc.js, 30/10) ==');
{
  // Mùa 3 (phim-mua-3.js): mọi gói của M.mua3 có phim nằm ở phim-mua-3.js, tệp không có phim lạ, gói bộ phận có bảng code ở khung cuối,
  // choi.html nạp phim-mua-3.js ngay sau phim-mua-2.js. Lỗi giả (--loi-gia): bỏ phim dao-cuc → mục "mọi gói mùa 3 có phim" đỏ.
  const GOI_MUA_3 = require(path.join(day, 'lo-trinh-hoc.js')).mua3.map((g) => ({ ma: g.ma, loai: g.loai || '' }));
  const P3 = Object.assign({}, PHIM); if (LOI_GIA) delete P3['dao-cuc'];
  kiem('có tệp phim-mua-3.js', tepPhim.includes('phim-mua-3.js'));
  kiem('MUA_3 có 10 gói', GOI_MUA_3.length === 10, GOI_MUA_3.map((g) => g.ma).join(', '));
  const thieu = GOI_MUA_3.filter((g) => !P3[g.ma] || TEP_CUA[g.ma] !== 'phim-mua-3.js').map((g) => g.ma + '@' + (TEP_CUA[g.ma] || '-'));
  kiem('mọi gói mùa 3 có phim, nằm ở phim-mua-3.js', !thieu.length, thieu.join(', '));
  const ma3 = new Set(GOI_MUA_3.map((g) => g.ma));
  const la = Object.keys(PHIM).filter((m) => TEP_CUA[m] === 'phim-mua-3.js' && !ma3.has(m));
  kiem('mỗi phim của phim-mua-3.js mang đúng mã một gói của MUA_3 và gói đó thuộc mùa 3 trong ThuTuChuong.goi', !la.length && GOI_MUA_3.every((g) => (TT.goi.find((x) => x.ma === g.ma) || {}).mua === 'mua-3'), la.join(', '));
  const boPhan = GOI_MUA_3.filter((g) => g.loai === 'bo-phan' && P3[g.ma]);
  const khongCode = boPhan.filter((g) => !/\bc\.code\(/.test(P3[g.ma][P3[g.ma].length - 1].toString())).map((g) => g.ma);
  kiem('khung cuối phim gói bộ phận mùa 3 có bảng code lệnh mới (' + boPhan.map((g) => g.ma).join(', ') + ')', boPhan.length >= 5 && !khongCode.length, khongCode.join(', '));
  const src = [...nguon('choi.html').matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  kiem('choi.html nạp phim-mua-3.js ngay sau phim-mua-2.js', src.indexOf('phim-mua-3.js') === src.indexOf('phim-mua-2.js') + 1, src.indexOf('phim-mua-3.js'));
}

console.log('\n== 3. Nối luồng (đọc nguồn) ==');
{
  let html = nguon('choi.html');
  if (LOI_GIA) html = html.replace('<script src="phim-mua-2.js"></script>', '');
  const src = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  const v = (f) => src.indexOf(f);
  kiem('choi.html nạp phim-goi.js sau chu.js, trước phim-mua-1.js, cả hai trước ung-dung.js',
    v('chu.js') >= 0 && v('phim-goi.js') > v('chu.js') && v('phim-mua-1.js') > v('phim-goi.js') && v('ung-dung.js') > v('phim-mua-1.js'),
    ['chu.js', 'phim-goi.js', 'phim-mua-1.js', 'ung-dung.js'].map((f) => f + '@' + v(f)).join(' '));
  kiem('choi.html nạp phim-mua-2.js ngay sau phim-mua-1.js', v('phim-mua-2.js') === v('phim-mua-1.js') + 1, 'phim-mua-1.js@' + v('phim-mua-1.js') + ' phim-mua-2.js@' + v('phim-mua-2.js'));
  const thieuMua = tepPhim.filter((f) => v(f) < 0);
  kiem('mọi tệp phim-mua-*.js có thẻ <script> trong choi.html', !thieuMua.length, thieuMua.join(', '));
  const mg = nguon('man-goi.js');
  kiem('man-goi.js: chạm hộp gói đã mở mà chưa xem phim → PhimGoi.mo(g.ma, … App.vaoGoi(g.ma)), đã xem thì vào thẳng',
    /PhimGoi\.co\(g\.ma\) && !PhimGoi\.daXem\(g\.ma\)\) \{ PhimGoi\.mo\(g\.ma, function \(\) \{ App\.vaoGoi\(g\.ma\); \}\); return; \}[^\n]*\n\s*App\.vaoGoi\(g\.ma\);/.test(mg));
  kiem('man-goi.js: nút ▶ xem lại chỉ ở hộp đã xem phim, có cả aria-label lẫn title t(\'pg.xemLai\'), không lan sự kiện lên hộp',
    /PhimGoi\.daXem\(g\.ma\)\)/.test(mg) && /setAttribute\('aria-label', t\('pg\.xemLai'\)\)/.test(mg) && /setAttribute\('title', t\('pg\.xemLai'\)\)/.test(mg) && /ev\.stopPropagation\(\)/.test(mg) && /data-i', 'play'/.test(mg));
  const css = nguon('choi.css');
  const m = /\.g-phim\{[^}]*width:(\d+)px;height:(\d+)px/.exec(css);
  kiem('nút ▶ (.g-phim) có vùng chạm ≥ 24×24', !!m && +m[1] >= 24 && +m[2] >= 24, m ? m[1] + '×' + m[2] : 'không thấy .g-phim');
  const cd = nguon('cai-dat.js');
  kiem('cai-dat.js: nút "Xem lại phim các gói" mở danh sách gói đã mở có phim',
    /t\('caiDat\.phimGoi'\)/.test(cd) && /App\.goiMo\(g\) && PhimGoi\.co\(g\.ma\)/.test(cd) && /PhimGoi\.mo\(g\.ma,/.test(cd));
  kiem('mo-dau.js không dùng khóa pg.* (phim mở đầu giữ nguyên)', !/'pg\./.test(nguon('mo-dau.js')));
  const pg = nguon('phim-goi.js');
  kiem('phim-goi.js: cờ đã xem là "phim-goi:<mã gói>" (Luu.daXem / Luu.datDaXem)', /return 'phim-goi:' \+ ma;/.test(pg) && /Luu\.datDaXem\(CO\(ma\)\)/.test(pg) && /Luu\.daXem\(CO\(ma\)\)/.test(pg));
  kiem('phim-goi.js: chữ hiển thị qua t(), không viết cứng', /t\('pg\.boQua'\)/.test(pg) && /t\('pg\.' \+ ma \+ '\.' \+ n\)/.test(pg) && /t\(tuyChon\.nutCuoi \|\| 'pg\.vaoGoi'\)/.test(pg));
}

console.log('\n== 4. Chạy thử bộ máy trên DOM giả ==');
{
  class Cls { constructor() { this.s = new Set(); } add(...c) { c.forEach((x) => this.s.add(x)); } remove(...c) { c.forEach((x) => this.s.delete(x)); } toggle(c, b) { if (b === undefined ? !this.s.has(c) : b) this.s.add(c); else this.s.delete(c); } contains(c) { return this.s.has(c); } }
  class El {
    constructor(tag) { this.tag = tag; this.children = []; this.parent = null; this.classList = new Cls(); this.attrs = {}; this.handlers = {}; this._text = ''; this.width = 10; this.height = 10;
      this.style = { setProperty(k, v) { this[k] = v; } }; }
    set className(v) { this.classList = new Cls(); String(v || '').split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c)); }
    get className() { return [...this.classList.s].join(' '); }
    set textContent(v) { this._text = String(v); this.children = []; }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    set innerHTML(v) { this.children.forEach((c) => { c.parent = null; }); this.children = []; this._text = ''; }
    get firstChild() { return this.children[0] || null; }
    appendChild(e) { if (e.parent) e.remove(); e.parent = this; this.children.push(e); return e; }
    insertBefore(e, ref) { if (e.parent) e.remove(); e.parent = this; const i = this.children.indexOf(ref); this.children.splice(i < 0 ? this.children.length : i, 0, e); return e; }
    remove() { if (this.parent) { this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; } }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
    addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
    click() { (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {} })); }
    querySelector(sel) { const c = sel.replace(/^\./, ''); const walk = (n) => { for (const k of n.children) { if (k.classList.contains(c)) return k; const r = walk(k); if (r) return r; } return null; }; return walk(this); }
    getContext() { return { drawImage() {}, fillRect() {}, getImageData: () => ({ data: [] }) }; }
  }
  const canvas = () => new El('canvas');
  const stage = new El('div');
  const co = {};
  const hen = [];
  const canhBao = [];
  const ctx = vm.createContext({
    console: { log() {}, warn: (s) => canhBao.push(String(s)), error: (s) => canhBao.push(String(s)) },
    document: { createElement: (tag) => new El(tag), getElementById: (id) => (id === 'stage' ? stage : null) },
    setTimeout: (f) => { hen.push(f); return hen.length; }, clearTimeout() {},
    Luu: { daXem: (k) => !!co[k], datDaXem: (k) => { co[k] = true; return true; } },
    AmThanh: { phat() {} },
    Ve: { T: 14, mk: () => canvas(), ico: () => canvas(), sao: () => canvas(), makeNutDe: () => canvas(), veCua() {},
      tiles: () => ({ rug: [1, 2, 3, 4], flags: [1, 2, 3, 4], wall: 1, crate: 1, thung: 1, pad: 1 }) },
    VeRobot: { ve: () => canvas(), vatXoay: () => ({ f: 22, l: 0, n: 10 }), vatKep: () => ({ ahead: 18, n: 10 }) },
    HuyHieu: { DS: ['hai-banh', 'tay-gap'], ve: () => canvas() }
  });
  ctx.window = ctx;
  vm.runInContext(nguon('chu.js'), ctx, { filename: 'chu.js' });
  vm.runInContext('var TP = { h: function (tag, cls, chu) { var e = document.createElement(tag); if (cls) e.className = cls; if (chu !== undefined && chu !== null) e.textContent = chu; return e; } };', ctx);
  vm.runInContext(nguon('phim-goi.js'), ctx, { filename: 'phim-goi.js' });
  for (const f of tepPhim) vm.runInContext(nguon(f), ctx, { filename: f });
  const PG = ctx.PhimGoi;
  kiem('window.PhimGoi có mo / co / daXem / CO / soKhung / them', PG && ['mo', 'co', 'daXem', 'CO', 'soKhung', 'them'].every((k) => typeof PG[k] === 'function'));
  kiem('PhimGoi nhận đủ phim từ phim-mua-*.js', PG && Object.keys(PHIM).every((m) => PG.co(m) && PG.soKhung(m) === PHIM[m].length), PG && PG.ds().join(','));
  kiem('PhimGoi.CO(gói) = "phim-goi:<gói>"', PG && PG.CO('tay-gap') === 'phim-goi:tay-gap');

  let goi = 0;
  PG.mo('xe', () => { goi++; });
  kiem('gói không có phim (xe): gọi khiXong ngay, không dựng lớp phim', goi === 1 && !stage.querySelector('md') && !co['phim-goi:xe']);

  const loiKhung = [], saiLoi = [], saiNut = [], saiCham = [];
  for (const m of Object.keys(PHIM)) {
    let xong = 0; hen.length = 0; canhBao.length = 0;
    PG.mo(m, () => { xong++; });
    const lop = stage.querySelector('pg');
    if (!lop) { loiKhung.push(m + ': không dựng lớp phim'); continue; }
    const loi = lop.querySelector('md-loi'), tiep = lop.querySelector('md-tiep'), khung = lop.querySelector('md-khung'), cham = lop.querySelector('md-cham');
    if (cham.children.length !== PHIM[m].length) saiCham.push(m + ':' + cham.children.length);
    for (let n = 1; n <= PHIM[m].length; n++) {
      const chay = hen.splice(0); chay.forEach((f) => { try { f(); } catch (e) { loiKhung.push(m + '.' + n + ' (hẹn giờ): ' + e.message); } });
      if (loi.textContent !== CHU['pg.' + m + '.' + n]) saiLoi.push(m + '.' + n);
      if (khung.children.length === 0) loiKhung.push(m + '.' + n + ': khung trống');
      const nutDung = n < PHIM[m].length ? CHU['pg.tiep'] : CHU['pg.vaoGoi'];
      if (tiep.textContent !== nutDung) saiNut.push(m + '.' + n + '="' + tiep.textContent + '"');
      if (n < PHIM[m].length) (n % 2 ? khung : tiep).click();                 // xen kẽ chạm khung tranh và nút Tiếp
    }
    canhBao.forEach((s) => loiKhung.push(m + ': ' + s));
    if (xong !== 0 || co['phim-goi:' + m]) loiKhung.push(m + ': xong trước khi bấm nút cuối');
    khung.click();                                                          // khung cuối: chạm tranh không đóng phim
    if (xong !== 0) loiKhung.push(m + ': chạm tranh ở khung cuối đã đóng phim');
    tiep.click(); tiep.click();
    if (xong !== 1 || !co['phim-goi:' + m] || stage.querySelector('pg')) loiKhung.push(m + ': nút cuối không ghi cờ / gỡ lớp / gọi khiXong đúng một lần (' + xong + ')');
  }
  kiem('mọi khung của mọi phim vẽ được (cả hẹn giờ), không lỗi', !loiKhung.length, loiKhung.slice(0, 6).join(' | '));
  kiem('lời từng khung đúng khóa pg.<gói>.<n>', !saiLoi.length, saiLoi.join(', '));
  kiem('nút: "Tiếp" ở các khung đầu, "Vào gói" ở khung cuối', !saiNut.length, saiNut.join(', '));
  kiem('số chấm = số khung', !saiCham.length, saiCham.join(', '));

  // Bỏ qua ngay khung 1; nutCuoi riêng (Cài đặt)
  delete co['phim-goi:tay-gap'];
  let x2 = 0;
  PG.mo('tay-gap', () => { x2++; }, { nutCuoi: 'pg.xong' });
  const lop = stage.querySelector('pg');
  const boQua = lop && lop.querySelector('md-bo-qua');
  kiem('nút Bỏ qua có ở khung 1, không bị ẩn', !!boQua && boQua.style.visibility !== 'hidden');
  for (let n = 1; n < PHIM['tay-gap'].length; n++) lop.querySelector('md-tiep').click();
  kiem('tuyChon.nutCuoi đổi chữ nút khung cuối (Cài đặt: "Xong")', lop.querySelector('md-tiep').textContent === CHU['pg.xong'], lop.querySelector('md-tiep').textContent);
  kiem('Bỏ qua vẫn hiện ở khung cuối (luôn bấm được)', boQua.style.visibility !== 'hidden');
  boQua.click(); boQua.click();
  kiem('Bỏ qua: ghi cờ phim-goi:tay-gap, gỡ lớp phim, gọi khiXong một lần', x2 === 1 && co['phim-goi:tay-gap'] === true && !stage.querySelector('pg') && PG.daXem('tay-gap'));
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
