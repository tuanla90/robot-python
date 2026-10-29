/* ============================================================================
   kiem-nut-mo-dau-phim-vector.mjs — máy kiểm gói V6c ("Robot Chấn Hưng"): MỌI NÚT, CẢNH MỞ MÀN, PHIM sang vector.
   Chạy game THẬT trong ngữ cảnh vm (bang-mau, chu, ve, part/*, ve-vector*, huy-hieu-vector, ve-robot, huy-hieu, mo-dau, phim-vector, phim-goi, phim-mua-*)
   với DOM + canvas giả (không trình duyệt, nhẹ), cộng đọc nguồn CSS.
     A. Một bộ icon: mọi tên icon game dùng (Ve.ico, data-i, đèn bộ phận, thẻ khay, vật Xưởng hàm, thụt lề, mũi tên bong bóng, trùm) có trong VeIcon.HINH;
        phim-vector.js không còn bộ ICON riêng (không tên trùng), PhimVector.ico vẽ MỌI tên của VeIcon.HINH lên canvas vector bằng VeIcon.veCanvas (không NaN).
     B. Icon (V7b, gỡ cầu C1 / C5): một phạm vi VeIcon.PHAM_VI = #stage; Ve.ico / sao / khoa / mui trả THẲNG <svg class="pxi vi vi-<tên>"> cỡ = cạnh lớn của bảng
        CO_ICON (V7c1: bảng số cố định trong ve.js, không đọc lưới pixel) × s, có nhãn _vi; VeIcon.thay trong DOM giả chỉ còn thêm title cho nút chỉ icon trong #stage.
     C. Cảnh mở màn (mo-dau.js): mọi canvas trong 6 khung là hình vector, không gọi Painter pixel / Ve.tiles / Ve.ico khi chiếu; R1 có mắt biểu cảm;
        (C3-v, V7c1) cây DOM + lệnh vẽ của 6 khung y như bản nền vector NEN_VEC (3fe6fa8) (phanh pixel C3 so 4ac900f đã gỡ).
     D. Phim .md / .pg-*: choi-vector.css không còn giữ mực / kem pixel cho .md, giảm chuyển động áp cả phim; mọi luật .md-* / .pg-* của choi.css có steps() /
        bóng chữ đều có luật vector đặt lại (giao-dien-vector-b.css hoặc choi-vector.css); luật vector của phim không phông pixel, không màu kem / mực pixel,
        nền ô cảnh không còn ảnh bảng phấn.
     E. Trang xem hinh-mau/xem-vector-v6.html có mục V6c.
   Cờ --loi-gia: cắm sáu lỗi (bỏ #sc-choi khỏi phạm vi, phim-vector thêm bộ ICON trùng tên, mo-dau dùng ô pixel, choi-vector giữ lại mực / kem + :not(.md),
   mất icon mui, bỏ luật .md-ram) → các mục A1 A2 B1 C1 D1 D2 phải ĐỎ (B2, D3 đỏ theo vì cùng lỗi).
   Chạy: node hoc/kiem-nut-mo-dau-phim-vector.mjs [--loi-gia]   (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const NEN_VEC = 'aaeee1f';                             // 29/10 gộp nhánh điều phối vào main: nền VECTOR = aaeee1f (hợp một tay kẹp V8c + phim xuất xưởng / xich.1 của main; so fbc976e chỉ lệch robot.2, xich.1; so 32513bf chỉ lệch tay kẹp). Trước đó: 29/10 V8c một tay kẹp: nền VECTOR = fbc976e (tay kẹp vẽ y hệt tay xoay ở nấc trước: cụm giữa tâm (50, 84), khớp tròn vành bạc + đèn, hàm khop dùng chung; chứng minh: hoàn ve-vector-tay-kep.js + ve-vector-tay-xoay.js về ad0899a thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 V8b tay xoay cùng hình tay kẹp: nền VECTOR = fa7637a (tay xoay vẽ bằng càng / cụm / đèn của tay kẹp, thêm khớp tròn vành bạc; chứng minh: hoàn ve-vector-tay-kep.js + ve-vector-tay-xoay.js về e4b3e11 thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 mắt theo đội: nền VECTOR = 6a4276d (lõi / quầng mắt R2 hồng, mắt trái tim cùng màu mắt đội; chứng minh: hoàn bang-mau.js + ve-vector.js về b38c6be thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 gộp V8a: nền VECTOR = 3fe6fa8 (thân omni / nhện vuông bo, chân nhện ba khúc, dáng bò; trước đó 8d930ae: mắt vui cung tròn mảnh, mắt tim viền trắng thắng màn; trước đó f8331e9, trước đó eb553bd, huy hiệu mắt thường, phim mở đầu hình bộ phận thật; trước đó 6e04104 = V7c3 e3 (đo chữ bằng phông vector, bỏ fillStyle thừa; trước đó 8780764 gộp V7c2, c830c12 gộp V7b); C3-v so 6 khung mở đầu vector với nền này (phanh thay C3 khi gỡ pixel)
const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const goc = path.resolve(day, '..');
const LOI_GIA = process.argv.includes('--loi-gia');
const J = (o) => JSON.stringify(o);

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1200) : '')); }
}
const doc = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');
const docTai = (sha) => (f) => { try { return execFileSync('git', ['-C', goc, 'show', sha + ':hoc/game/' + f], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return null; } };
const docNenVec = docTai(NEN_VEC);

/* ---------------------------------------------------------------- lỗi giả (đổi nguồn trong bộ nhớ) */
const SUA = {};
if (LOI_GIA) {
  console.log('(đang cắm lỗi giả: sáu lỗi, các mục A1 A2 B1 B2 B3 C3-v D1 D2 phải đỏ, D3 đỏ theo)');
  SUA['ve-vector-icon.js'] = (s) => s.replace("var PHAM_VI = '#stage';", "var PHAM_VI = '#sc-dau';").replace(/\n {4}mui: \[[^\n]*\n/, '\n');   // V7b: phạm vi thiếu → B1 (và B3: nút ở #sc-choi không có title) đỏ
  SUA['phim-vector.js'] = (s) => s.replace('var MAU_VEC = [', 'var ICON = { denCam: function () {} }; var MAU_VEC = [').replace('mauVec: mauVec, the: the };', 'mauVec: mauVec, the: the, ICON: ICON };');
  SUA['mo-dau.js'] = (s) => s.replace("function o(ten, s) { return (PV() && PhimVector.o(ten, s, 0)) || h('div'); }", "function o(ten, s) { return h('div'); }");   // V7c3: chuỗi cũ 'var v = PV() && PhimVector.o(…)' hết từ V7c2 nên lỗi giả này không cắm được (C1 / C3-v không đỏ); nay cắm vào hàm o thật
  SUA['choi-vector.css'] = (s) => s.replace(/body\.ve-vector \.md-ram\{[^}]*\}/, '') + '\nbody.ve-vector .md{--ink:var(--g-vienDam);--cream:var(--g-kemSang)}\n@media (prefers-reduced-motion:reduce){body.ve-vector #stage>:not(.md){animation-duration:.01ms!important}}\n';   // V7b: + bỏ luật .md-ram (phần B nay trong cùng tệp)
}
const nguon = (f) => { const s = doc(f); return SUA[f] ? SUA[f](s) : s; };

/* ---------------------------------------------------------------- DOM + canvas giả (như kiem-huy-hieu-phim-vector.mjs) */
let soCv = 0;
class Gr { constructor(k, a) { this.k = k; this.a = a; this.s = []; } addColorStop(o, c) { this.s.push([o, c]); } toJSON() { return { g: this.k, a: this.a, s: this.s }; } }
class Ctx {
  constructor(cv) { this.canvas = cv; this.lenh = []; this.t = {}; }
  ghi(ten, a) { this.lenh.push([ten].concat(Array.from(a).map((x) => (x && x.__cv ? 'cv#' + x.ma() : x && x.data ? 'id' : x)))); }
  createLinearGradient() { return new Gr('l', Array.from(arguments)); }
  createRadialGradient() { return new Gr('r', Array.from(arguments)); }
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  putImageData(id) { this.canvas._data = Array.from(id.data).join(','); this.ghi('putImageData', []); }
  getImageData(x, y, w, h) { const d = new Uint8ClampedArray(w * h * 4); if (this.canvas._data) this.canvas._data.split(',').forEach((v, i) => { if (i < d.length) d[i] = +v; }); return { width: w, height: h, data: d }; }
  getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; }
  measureText(s) { return { width: String(s).length * 6 }; }
  drawImage(src) { this.ghi('drawImage', arguments); if (src && src.__cv) this.canvas.nguon.push(src); }
}
['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha', 'globalCompositeOperation', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'font', 'textAlign', 'textBaseline', 'miterLimit']
  .forEach((k) => Object.defineProperty(Ctx.prototype, k, { get() { return this.t[k]; }, set(v) { this.t[k] = v; this.ghi('=' + k, [v && v.toJSON ? JSON.stringify(v) : v]); } }));
['save', 'restore', 'translate', 'rotate', 'scale', 'setTransform', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'setLineDash', 'clip', 'fillText', 'strokeText']
  .forEach((k) => { Ctx.prototype[k] = function () { this.ghi(k, arguments); }; });
class Cls { constructor() { this.s = new Set(); } add(...c) { c.forEach((x) => x && this.s.add(x)); } remove(...c) { c.forEach((x) => this.s.delete(x)); } toggle(c, b) { if (b === undefined ? !this.s.has(c) : b) this.s.add(c); else this.s.delete(c); return this.s.has(c); } contains(c) { return this.s.has(c); } }
function taoDom() {
  class El {
    constructor(tag) {
      this.tag = tag; this.children = []; this.parent = null; this.classList = new Cls(); this.attrs = {}; this.handlers = {}; this._text = '';
      this.style = { setProperty(k, v) { this[k] = v; }, removeProperty(k) { delete this[k]; } };
      if (tag === 'canvas') { this.__cv = true; this._w = 300; this._h = 150; this.nguon = []; this.__ctx = new Ctx(this); this._id = ++soCv; }
    }
    ma() { return this._id; }
    get width() { return this._w; } set width(v) { this._w = Math.max(0, Math.floor(v)); if (this.__ctx) { this.__ctx.lenh.length = 0; this.nguon = []; this._data = null; } }
    get height() { return this._h; } set height(v) { this._h = Math.max(0, Math.floor(v)); if (this.__ctx) { this.__ctx.lenh.length = 0; this.nguon = []; this._data = null; } }
    getContext() { return this.__ctx; }
    set className(v) { this.classList = new Cls(); String(v || '').split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c)); }
    get className() { return [...this.classList.s].join(' '); }
    set textContent(v) { this._text = String(v); this.children = []; }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    set innerHTML(v) { this.children.forEach((c) => { c.parent = null; }); this.children = []; this._text = ''; }
    get firstChild() { return this.children[0] || null; }
    appendChild(e) { if (e.parent) e.remove(); e.parent = this; this.children.push(e); return e; }
    remove() { if (this.parent) { this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; } }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
    addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
    click() { (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {} })); }
    tim(f) { const kq = []; const walk = (n) => { for (const k of n.children) { if (f(k)) kq.push(k); walk(k); } }; walk(this); return kq; }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
    querySelectorAll(sel) { const c = sel.replace(/^\./, ''); return this.tim((k) => k.classList.contains(c)); }
  }
  return El;
}
const dsTep = (html) => [...html.matchAll(/<script src="([\w./-]+\.js)"/g)].map((m) => m[1])
  .filter((f) => /^(bang-mau|chu|ve|ve-vector[\w-]*|huy-hieu-vector|ve-robot|huy-hieu|mo-dau|phim-vector|phim-goi|phim-mua-\d+|part\/[\w-]+)\.js$/.test(f));
const DS_TEP = dsTep(doc('choi.html'));
/** nenMoDau: 'vec' = MỌI tệp của NEN_VEC (nền vector, V7c1). cheDo chỉ còn 'vector' (game luôn vector). */
function napGame(cheDo, nenMoDau) {
  const El = taoDom(), stage = new El('div'), body = new El('body'), hen = [], canhBao = [];
  const ctx = {
    console: { log() {}, info() {}, warn: (s) => canhBao.push(String(s)), error: (s) => canhBao.push(String(s)) },
    document: { createElement: (t) => new El(t), createElementNS: (ns, t) => new El(t), getElementById: (id) => (id === 'stage' ? stage : null), querySelector: () => null, body, documentElement: { style: { setProperty() {} } } },   // createElementNS: V7b Ve.ico trả svg thẳng ở vector
    location: { search: cheDo === 'vector' ? '?ve=vector' : '?ve=pixel' }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    devicePixelRatio: 2, setTimeout: (f) => { hen.push(f); return hen.length; }, clearTimeout() {}, requestAnimationFrame: () => 0,
    Luu: { daXem: () => false, datDaXem: () => true, docCaiDat: () => ({}) }, AmThanh: { phat() {} },
    Math, JSON, Object, Array, String, Number, Boolean, Date, Error, RegExp, Map, Set, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Uint8ClampedArray
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext('var TP = { h: function (tag, cls, chu) { var e = document.createElement(tag); if (cls) e.className = cls; if (chu !== undefined && chu !== null) e.textContent = chu; return e; } };', ctx);
  for (const f of (nenMoDau === 'vec' ? dsTep(docNenVec('choi.html')) : DS_TEP)) {
    if (nenMoDau === 'vec') { vm.runInContext(docNenVec(f), ctx, { filename: 'nen-vec:' + f }); continue; }
    vm.runInContext(nguon(f), ctx, { filename: f });
  }
  return { ctx, El, stage, hen, canhBao };
}
const VE = napGame('vector'), NEN_V = docNenVec('mo-dau.js') ? napGame('vector', 'vec') : null;

/* ================================================================= A. một bộ icon */
console.log('== A. Một bộ icon (ve-vector-icon.js) ==');
const VI = VE.ctx.VeIcon;
{
  const ten = new Set();
  for (const f of fs.readdirSync(GAME).filter((x) => /\.js$/.test(x))) {
    const s = doc(f);
    for (const x of s.matchAll(/Ve\.ico\('(\w+)'/g)) ten.add(x[1]);
    for (const x of s.matchAll(/Ve\.ico\(\w+ \? '(\w+)' : '(\w+)'/g)) { ten.add(x[1]); ten.add(x[2]); }
    for (const x of s.matchAll(/data-i="(\w+)"/g)) ten.add(x[1]);
    for (const x of s.matchAll(/setAttribute\('data-i', '(\w+)'\)/g)) ten.add(x[1]);
    if (/Ve\.sao\(/.test(s)) ten.add('star');
    if (/Ve\.khoa\(/.test(s)) ten.add('lock');
  }
  for (const x of doc('den-bo-phan.js').matchAll(/'(den[A-Z]\w*)'/g)) ten.add(x[1]);
  for (const x of doc('thanh-phan.js').matchAll(/'(den[A-Z]\w*)'/g)) ten.add(x[1]);                        // icon tiêu đề thẻ khay (icThe)
  for (const x of doc('thanh-phan.js').matchAll(/\['(\w+)', '[\w-]+', 'choi\.thut/g)) ten.add(x[1]);         // nút thụt lề
  for (const x of doc('xuong-ham.js').matchAll(/bieu: '(\w+)'/g)) ten.add(x[1]);                             // bảng vật Xưởng hàm
  ten.add('mui'); ten.add('trum');                                                                           // Ve.mui (bong bóng), [data-i="trum"] (ve.js hydrate)
  ten.delete('huyhieu');                                                                                     // huy hiệu: gói V6 (HuyHieu.mk)
  const thieu = [...ten].filter((t) => !VI || !VI.HINH[t]);
  kiem('(A1) ' + ten.size + ' tên icon game dùng (mọi màn, kể cả màn chơi, Xưởng hàm, bong bóng, trùm) đều có trong VeIcon.HINH (' + (VI ? Object.keys(VI.HINH).length : 0) + ' hình)', !!VI && !thieu.length, J(thieu));
}
{
  const PV = VE.ctx.PhimVector, src = nguon('phim-vector.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const rieng = /\bICON\s*=|\bICON\.\w+\s*=/.test(src) || (PV && PV.ICON !== undefined);
  const goi = /VI\.veCanvas\(/.test(src);
  const sai = [];
  if (PV && VI) for (const t of Object.keys(VI.HINH)) {
    let cv; try { cv = PV.ico(t, 2, VE.ctx.BangMau.vang); } catch (e) { sai.push(t + ' ném ' + e.message); continue; }
    if (!cv || !cv.laVector) { sai.push(t + ': không ra canvas vector'); continue; }
    const l = cv.__ctx.lenh; if (l.length < 6) sai.push(t + ': ít lệnh vẽ'); if (l.some((x) => x.some((v) => typeof v === 'number' && !isFinite(v)))) sai.push(t + ': NaN');
  }
  kiem('(A2) một bộ icon: phim-vector.js không còn bộ ICON riêng (không tên trùng với VeIcon.HINH), PhimVector.ico gọi VeIcon.veCanvas, vẽ được mọi tên ra canvas vector',
    !rieng && goi && !sai.length, J({ rieng, goi, sai: sai.slice(0, 6) }));
}

/* ================================================================= B. icon trả thẳng svg (V7b) */
console.log('\n== B. Icon: Ve.ico / sao / khoa / mui trả thẳng svg ở vector (V7b gỡ C1), một phạm vi #stage (C5), nút chỉ icon có title ==');
{
  const pv = VI ? VI.PHAM_VI : '';
  kiem('(B1) V7b: một hằng phạm vi VeIcon.PHAM_VI = #stage (cả khung game: mọi màn, #lop-hop, phim .md), không còn PHAM_VI_CHOI', !!VI && pv === '#stage' && !('PHAM_VI_CHOI' in VI), J(pv));
}
{
  const V = VE.ctx.Ve, sai = [];
  const CO = { menu: [12, 10], edit: [9, 9], xu: [13, 13], star: [11, 10], lock: [12, 14], lockNho: [10, 11], mui: [10, 9] };   // V7c1: cỡ bản pixel đã chốt thành bảng (ve.js CO_ICON); đây là bản chép để máy kiểm độc lập
  const lop = (e) => ((e && e.getAttribute && e.getAttribute('class')) || '').split(/\s+/);
  const la = (e, ten, phu) => !!e && e.tag === 'svg' && lop(e).includes('pxi') && lop(e).includes('vi') && lop(e).includes('vi-' + ten) && (!phu || lop(e).includes(phu));
  const cap = [['ico menu', V.ico('menu', 2), 2, 'menu'], ['ico edit', V.ico('edit', 2), 2, 'edit'], ['ico xu tắt', V.ico('xu', 1, { fill: VE.ctx.BangMau.xamToi2V4 }), 1, 'xu', 'tat'],
    ['sao tắt', V.sao(false, 2), 2, 'star', 'tat'], ['sao bật', V.sao(true, 4), 4, 'star'], ['khoa nhỏ', V.khoa(1, true), 1, 'lock', '', 'lockNho'], ['khoa', V.khoa(2), 2, 'lock'], ['mui', V.mui('#f00', 2), 2, 'mui']];
  for (const [ten, v, s, hinh, phu, bang] of cap) {
    if (!la(v, hinh, phu)) sai.push(ten + ': vector không ra svg pxi vi vi-' + hinh + (phu ? '.' + phu : '') + ' (' + (v && v.tag) + ' ' + lop(v).join('.') + ')');
    const k = Math.max(...CO[bang || hinh]) * s + 'px';
    if (v && (v.style.width !== k || v.style.height !== k)) sai.push(ten + ': cỡ svg ' + v.style.width + ' × ' + v.style.height + ' ≠ cạnh lớn bản pixel ' + k);
    if (v && (!v._vi || v._vi.ten !== hinh)) sai.push(ten + ': svg thiếu nhãn _vi');
  }
  const src = nguon('ve-vector-icon.js'), veJs = doc('ve.js');
  if (!/function svg\(ten, k, tuyChon, phu\)/.test(src)) sai.push('ve-vector-icon.js thiếu VeIcon.svg');
  if (!/function svgVec\(ten, s, tuyChon, phu, nho\)/.test(veJs) || !/else if \(ten === 'trum'\) node = svgVec\('trum', s, null,/.test(veJs)) sai.push('ve.js thiếu svgVec / hydrate trum chưa qua svgVec');
  if (!/var CO_ICON = \{/.test(veJs) || !/function coIcon\(ten, nho\) \{ return \(nho && ten === 'lock' \? CO_ICON\.lockNho : CO_ICON\[ten\]\) \|\| null; \}/.test(veJs) || /!giaoDienVec\(\) \|\| !VI/.test(veJs)) sai.push('ve.js svgVec chưa dùng bảng CO_ICON / còn rẽ theo body.ve-vector (V7c1)');
  if (!/root\.Ve\.CO_ICON\[ten\]/.test(nguon('phim-vector.js')) || /Ve\.HINH/.test(nguon('phim-vector.js').replace(/\/\*[\s\S]*?\*\//g, ''))) sai.push('phim-vector.js coIco chưa đọc bảng Ve.CO_ICON (V7c2: hết lưới Ve.HINH / bảng RIENG)');
  kiem('(B2) V7b / V7c1: Ve.ico / sao / khoa / mui trả thẳng <svg class="pxi vi vi-<tên>"> (sao / xu tắt thêm .tat), cỡ = cạnh lớn bảng CO_ICON × s, có nhãn _vi; ve.js không đọc lưới pixel / không rẽ theo chế độ; phim-vector trùm 24; hydrate trum qua svgVec', !sai.length, sai.join(' | '));
}
{
  // DOM giả nhỏ có closest / querySelectorAll để chạy VeIcon.thay như trình duyệt: V7b chỉ còn quét title cho nút chỉ icon, KHÔNG thay canvas có nhãn nữa
  class N {
    constructor(tag, cls, id) { this.tagName = tag.toUpperCase(); this.attrs = {}; this.con = []; this.cha = null; this.id = id || ''; if (cls) this.attrs.class = cls; this.style = { cssText: '' }; this.nodeType = 1; }
    get classList() { const e = this; return { contains: (c) => (e.attrs.class || '').split(/\s+/).includes(c), add: (c) => { e.attrs.class = ((e.attrs.class || '') + ' ' + c).trim(); } }; }
    get parentNode() { return this.cha; }
    setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; } hasAttribute(k) { return k in this.attrs; }
    appendChild(c) { c.cha = this; this.con.push(c); return c; }
    replaceChild(moi, cu) { const i = this.con.indexOf(cu); this.con[i] = moi; moi.cha = this; cu.cha = null; }
    get textContent() { return this._chu || this.con.map((c) => c.textContent || '').join(''); }
    set textContent(v) { this._chu = String(v); }
    khop(sel) { return sel.split(',').some((s) => { s = s.trim(); return s[0] === '#' ? this.id === s.slice(1) : s[0] === '.' ? this.classList.contains(s.slice(1)) : false; }); }
    closest(sel) { let e = this; while (e) { if (e.khop && e.khop(sel)) return e; e = e.cha; } return null; }
    tat() { const kq = []; const di = (n) => n.con.forEach((c) => { kq.push(c); di(c); }); di(this); return kq; }
    querySelectorAll(sel) { if (sel === 'canvas.pxi') return this.tat().filter((e) => e.tagName === 'CANVAS' && e.classList.contains('pxi')); if (/^button/.test(sel)) return this.tat().filter((e) => e.tagName === 'BUTTON' && e.hasAttribute('aria-label') && !e.hasAttribute('title')); return []; }
  }
  const doc2 = { body: new N('body', 've-vector'), createElementNS: (ns, tag) => new N(tag), getElementById: () => null };
  const ctx2 = { BangMau: VE.ctx.BangMau, document: doc2 };
  ctx2.window = ctx2;
  new Function('window', 'module', 'require', nguon('ve-vector-icon.js'))(ctx2, undefined, undefined);
  const V2 = ctx2.VeIcon, sai = [];
  const stage = doc2.body.appendChild(new N('div', '', 'stage')), choi = stage.appendChild(new N('div', 'screen', 'sc-choi')), ngoai = doc2.body.appendChild(new N('div', 'ngoai'));
  const nut = choi.appendChild(new N('button', 'bt menu')); nut.setAttribute('aria-label', 'Menu'); const c2 = nut.appendChild(new N('canvas', 'pxi')); c2._vi = { ten: 'menu', tuyChon: {}, phu: '' }; c2.style = { cssText: 'width:20px', width: '20px', height: '16px' };
  const nutChu = choi.appendChild(new N('button', 'bt')); nutChu.setAttribute('aria-label', 'Chạy'); nutChu.appendChild(new N('span')).textContent = 'Chạy';
  const nutNgoai = ngoai.appendChild(new N('button', 'bt')); nutNgoai.setAttribute('aria-label', 'Ngoài');
  let n = -1; try { n = V2.thay(doc2.body); } catch (e) { sai.push('thay ném ' + e.message); }
  if (nut.getAttribute('title') !== 'Menu') sai.push('nút chỉ icon trong #stage thiếu title');
  if (nutChu.hasAttribute('title')) sai.push('nút có chữ bị thêm title');
  if (nutNgoai.hasAttribute('title')) sai.push('nút ngoài #stage bị thêm title');
  if (nut.con[0] !== c2) sai.push('canvas có nhãn bị thay (V7b: ve.js đã trả svg thẳng, thay() không đụng icon)');
  kiem('(B3) VeIcon.thay (DOM giả, V7b): chỉ thêm title cho nút chỉ icon có aria-label trong #stage (nút có chữ / ngoài #stage không), không thay canvas icon nữa; không còn MutationObserver / móc drawImage', !sai.length && n === 1 && !/new root\.MutationObserver|prototype\.drawImage = |var DAU_PART|function noiPart|function thayPart|function noiVe/.test(nguon('ve-vector-icon.js')), sai.join(' | ') + ' · thay ' + n);
}

/* ================================================================= C. cảnh mở màn */
console.log('\n== C. Cảnh mở màn (mo-dau.js) ==');
function chieuMoDau(G, n) {
  G.hen.length = 0; const cu = G.stage.querySelector('md'); if (cu) cu.remove();
  G.ctx.MoDau.mo(() => {});
  const lop = G.stage.querySelector('md'), tiep = lop.querySelector('md-tiep');
  for (let i = 1; i < n; i++) { G.hen.length = 0; tiep.click(); }
  let vong = 0; while (G.hen.length && vong++ < 50) G.hen.splice(0).forEach((f) => f());
  return lop.querySelector('md-khung');
}
const SO = VE.ctx.MoDau.SO_KHUNG;
{
  const V = VE.ctx, dem = { painter: 0, tiles: 0, ico: 0 }, g0 = { ico: V.Ve.ico };          // V7c2: Ve.Painter / Ve.tiles đã xoá khỏi ve.js (phải KHÔNG còn), chỉ còn đếm Ve.ico (đường lùi icon ngoài bộ phim)
  if (V.Ve.Painter || V.Ve.tiles) dem.painter++;
  V.Ve.ico = function () { dem.ico++; return g0.ico.apply(this, arguments); };
  const sai = [], soHinh = [], loi = [];
  const cb0 = VE.canhBao.length;
  for (let n = 1; n <= SO; n++) {
    let k; try { k = chieuMoDau(VE, n); } catch (e) { loi.push(n + ': ' + e.message); continue; }
    const px = k.tim((e) => e.__cv && !e.laVector);
    if (px.length) sai.push('khung ' + n + ': ' + px.length + ' canvas pixel');
    soHinh.push(k.tim((e) => e.classList.contains('md-a')).length);
  }
  V.Ve.ico = g0.ico;
  VE.canhBao.slice(cb0).forEach((s) => loi.push(s));
  kiem('(C1) vector: ' + SO + ' khung mở đầu mọi canvas là hình vector, không gọi Painter pixel / Ve.tiles / Ve.ico khi chiếu; số hình mỗi khung 3 7 7 2 3 3 (' + soHinh.join(' ') + ')',
    !sai.length && !loi.length && !dem.painter && !dem.tiles && !dem.ico && J(soHinh) === J([3, 7, 7, 2, 3, 3]), sai.concat(loi).slice(0, 5).join(' | ') + ' · Painter ' + dem.painter + ', tiles ' + dem.tiles + ', ico ' + dem.ico);
}
{
  const V = VE.ctx, g0 = V.VeRobot.veCo, mat = [];
  V.VeRobot.veCo = function (cfg, tt) { if (tt && tt.mat) mat.push(tt.mat); return g0.apply(this, arguments); };
  for (let n = 1; n <= SO; n++) chieuMoDau(VE, n);
  V.VeRobot.veCo = g0;
  const ks = [...new Set(mat)];
  kiem('(C2) vector: R1 của cảnh mở màn có mắt biểu cảm (' + ks.join(', ') + ')', ks.includes('ngac') && ks.includes('vui') && ks.includes('xoay'), J({ ks }));
}
{
  if (!NEN_V) kiem('(C3-v) cần git và commit nền vector ' + NEN_VEC, false, 'git show lỗi');
  else {
    const ma2 = new Map(); let so = 0;
    const tuan = (cv, sau) => { if (!ma2.has(cv)) ma2.set(cv, 'C' + (++so)); if (sau > 3) return ma2.get(cv); return cv._w + 'x' + cv._h + '[' + (cv._data ? cv._data.length + ':' + cv._data.slice(0, 80) : '') + '|' + J(cv.__ctx.lenh).replace(/cv#\d+/g, 'cv') + '|' + cv.nguon.map((x) => tuan(x, sau + 1)).join(';') + ']'; };
    const boNhan = (st) => { const o = Object.assign({}, st); delete o.setProperty; delete o.removeProperty; return o; };
    const cay = (e) => (e.__cv ? 'canvas{' + J(boNhan(e.style)) + tuan(e, 0) + '}' : e.tag + '.' + e.className + J(boNhan(e.style)) + J(e.attrs) + (e._text || '') + '(' + e.children.map(cay).join(',') + ')');
    const khac = [], VE2 = napGame('vector'), SO_NEN = NEN_V.ctx.MoDau.SO_KHUNG;
    for (let n = 1; n <= SO_NEN; n++) {
      let a; try { ma2.clear(); so = 0; a = cay(chieuMoDau(VE2, n)); } catch (e) { khac.push('khung ' + n + ' mới ném ' + e.message); continue; }
      ma2.clear(); so = 0; const b = cay(chieuMoDau(NEN_V, n));
      if (a !== b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; khac.push('khung ' + n + ' lệch ở ký tự ' + i + ': …' + a.slice(Math.max(0, i - 60), i + 60) + ' / …' + b.slice(Math.max(0, i - 60), i + 60)); }
    }
    kiem('(C3-v) V7c1 VECTOR y nguyên: cây DOM + lệnh vẽ của ' + SO_NEN + ' khung mở đầu (sau mọi hẹn giờ) bản mới = bản nền vector ' + NEN_VEC + '; cùng số khung', !khac.length && SO === SO_NEN, khac.slice(0, 2).join('\n      ') + (SO !== SO_NEN ? ' | số khung ' + SO + ' ≠ ' + SO_NEN : ''));
  }
}

/* ================================================================= D. phim: CSS */
console.log('\n== D. Phim .md / .pg-*: nền, chữ, hoạt cảnh vector ==');
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
const MOC_B = /\n\/\* =+ V7b \(28\/10\): từ đây là NGUYÊN VĂN giao-dien-vector-b\.css[^\n]*\n/, cssGop = nguon('choi-vector.css'), viTriMoc = cssGop.search(MOC_B);   // V7b việc 10: hai phần trong một tệp
const cssV = viTriMoc >= 0 ? cssGop.slice(0, viTriMoc) : cssGop, cssB = viTriMoc >= 0 ? cssGop.slice(viTriMoc).replace(MOC_B, '') : '', cssP = doc('choi.css');
const luatV = tachLuat(cssV).concat(tachLuat(cssB)), luatP = tachLuat(cssP);
{
  const giu = luatV.filter((r) => r.sel.split(',').some((s) => /^body\.ve-vector \.md$/.test(s.trim())) && /--(ink|cream)\s*:\s*var\(--g-(vienDam|kem)/.test(r.than));
  const giam = luatV.filter((r) => /prefers-reduced-motion:\s*reduce/.test(r.trong));
  const truPhim = giam.some((r) => /:not\(\.md\)/.test(r.sel)), coPhim = giam.some((r) => r.sel.split(',').some((s) => s.trim() === 'body.ve-vector #stage>* *') && /animation-delay:0s!important/.test(r.than));
  kiem('(D1) choi-vector.css không còn giữ mực / kem pixel cho .md; giảm chuyển động áp cả phim (không :not(.md)), hình hiện ngay (animation-delay 0)', !giu.length && !truPhim && coPhim, J({ giu: giu.map((r) => r.sel), truPhim, coPhim }));
}
{
  const phu = new Map();
  for (const r of luatV) for (const s of r.sel.split(',')) { const t = s.trim().replace(/^body\.ve-vector\s+/, ''); phu.set(t, (phu.get(t) || '') + ';' + r.than); }
  const thieu = [];
  for (const r of luatP) for (const s0 of r.sel.split(',')) {
    const s = s0.trim(); if (!/^\.(md|pg)[-.\s]|^\.md$|^\.pg$/.test(s)) continue;
    const p = phu.get(s) || '';
    if (/steps\(/.test(r.than) && !/(^|;)\s*(animation|animation-timing-function|transition|transition-timing-function)\s*:/.test(p)) thieu.push(s + ' (steps)');
    if (/steps\(/.test(r.than) && /steps\(/.test(p)) thieu.push(s + ' (vector vẫn steps)');
    if (/text-shadow\s*:\s*[^;n]/.test(r.than) && !/text-shadow\s*:\s*none/.test(p)) thieu.push(s + ' (bóng chữ)');
  }
  kiem('(D2) mọi luật .md-* / .pg-* của choi.css có steps() / bóng chữ đều có luật vector đặt lại (hoạt cảnh mượt, không bóng mực)', !thieu.length, J(thieu.slice(0, 12)));
}
{
  const phim = luatV.filter((r) => r.sel.split(',').some((s) => /\.(md|pg)\b|\.md-|\.pg-/.test(s)));
  const sai = [];
  for (const r of phim) {
    if (/Handjet|VT323/.test(r.than)) sai.push(r.sel + ': phông pixel');
    if (/var\(--g-(kem\w*|vienDam|go\w*|bang\w*|moToi\w*|moSang\w*)\)|var\(--(chalk|wood\w*)\)/.test(r.than)) sai.push(r.sel + ': màu / nền pixel');
    if (/steps\(|pixelated|url\(/.test(r.than)) sai.push(r.sel + ': steps / pixelated / url(');
  }
  const khung = phim.find((r) => r.sel.split(',').some((s) => s.trim() === 'body.ve-vector .md-khung.chalk') && /background-image\s*:\s*linear-gradient/.test(r.than) && /background-size\s*:\s*auto/.test(r.than));
  kiem('(D3) ' + phim.length + ' luật vector của phim không phông pixel, không màu / nền pixel, không steps / url(; ô cảnh .md-khung.chalk thay ảnh bảng phấn bằng nền vector', !sai.length && !!khung, J(sai.slice(0, 6)) + (khung ? '' : ' · thiếu luật nền .md-khung.chalk'));
}

/* ================================================================= E. trang xem */
console.log('\n== E. Trang xem ==');
{
  const xem = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector-v6.html'), 'utf8');
  const ok = /id="v6c"/.test(xem) && /<script src="\.\.\/game\/ve-vector-icon\.js"><\/script>/.test(xem) && /<script src="\.\.\/game\/phim-vector\.js"><\/script>/.test(xem) && /VeIcon\.veCanvas/.test(xem) && /PhimVector\.xeTai/.test(xem) && /MoDau\.mo/.test(xem);
  kiem('(E1) hinh-mau/xem-vector-v6.html có mục V6c (bảng mọi icon: svg giao diện | canvas phim, xe tải, phim mở đầu vector | pixel)', ok);
}

console.log('\n---------------------------------------------\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'ĐẠT ' + dat + ' · HỎNG 0') + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);
