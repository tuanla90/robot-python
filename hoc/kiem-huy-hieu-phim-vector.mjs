/* ============================================================================
   kiem-huy-hieu-phim-vector.mjs — máy kiểm gói V6: HUY HIỆU và PHIM vẽ bằng bộ vẽ vector ("Robot Chấn Hưng").
   Chạy game THẬT trong ngữ cảnh vm (bang-mau, chu, ve, part/*, ve-vector*, huy-hieu-vector, ve-robot, huy-hieu, phim-vector, phim-goi, phim-mua-*) với DOM + canvas giả
   ghi lệnh. V7c1 (28/10): game luôn vector; ngữ cảnh pixel và phanh pixel A3 / B5 (so nền fa3702f) đã gỡ, thay bằng A3-v / B5-v so nền vector NEN_VEC (nay 32513bf, xem dòng khai báo).
   A. HUY HIỆU
     A1 mọi mã HuyHieu.DS × ba trạng thái (khoa / mo / xong) vẽ được (HuyHieu.ve, HuyHieu.mk), không ném lỗi.
     A2 vector: mã có bản vector (HuyHieu.maVec) ra canvas .laVector (V7c2: bộ pixel part/ đã xoá, không còn Part.* để gọi); mã chưa có bản vector (liệt kê).
     A3-v (V7c1) vector y nguyên: HuyHieu.mk bản mới = bản nền vector NEN_VEC từng lệnh vẽ, mọi mã của nền còn.
     A4 vector: cầu nối Ve.mk(HuyHieu.ve(…), s) ra canvas vector cỡ 36·s px CSS; Ve.hydrate điền [data-i="huyhieu"] bằng bản vector; mã lạ vẫn ra hình pixel.
     A5 phủ: huy hiệu của mọi gói mùa 1 (ThuTuChuong.goi: hinh / chương đầu) và các huy hiệu bay trong phim "robot" đều có bản vector.
     A6 (gói V7a) phủ hết: MỌI mã của HuyHieu.DS (V7c1: = VeVector.HUY_HIEU.dsTatCa(), hình riêng + bí danh; không danh sách cứng) có bản vector (HuyHieu.maVec).
     A7 (V7c1) danh sách mã + bí danh là DỮ LIỆU ở huy-hieu-vector.js: HuyHieu.DS (tập) và BI_DANH y hệt dữ liệu chụp từ bộ pixel (hoc/du-lieu-chup-pixel.json, c0);
        huy-hieu.js không còn HINH['x'] = function nào (V7c2: bộ pixel đã xoá); maVec(bí danh) = mã gốc.
   B. PHIM (mọi phim ở PhimGoi, chạy đủ khung và mọi hẹn giờ)
     B1 vector: mọi khung vẽ được, không lỗi / cảnh báo.
     B2 vector: mọi canvas trong khung tranh là hình vector (.laVector: ô, cờ, nút đè, cửa, sao, icon bộ phận, robot, huy hiệu); không gọi Ve.tiles / Ve.makeNutDe / Ve.veCua.
     B3 vector: thùng nằm đúng trong kẹp — tâm thùng = tâm thân + VeRobot.vatKep (1/100 ô) × cạnh ô veCo, không theo hằng pixel 57 (tay-gap.3, kho-hang.3, hai-robot.3);
        cạnh thùng theo vatKep.n.
     B4 vector: robot trong phim dùng mắt biểu cảm (VeRobot.veCo nhận trangThai.mat) ở ≥ 8 phim, có cả 'vui' lẫn 'ngac'.
     B5-v (V7c1) vector y nguyên: cây DOM + lệnh vẽ của từng khung (sau mọi hẹn giờ) của mọi phim bản mới = bản nền vector NEN_VEC.
   Cờ --loi-gia: cắm bảy lỗi (hình tay-gap vẽ khác nền, HuyHieu.mk lệch 1 px, hình xich ném lỗi, VAT về 57, PhimVector bỏ ô tường, xe().mat không đổi gì,
   V7a: bỏ bản vector của be-sung) → máy kiểm phải ĐỎ.
   Chạy: node hoc/kiem-huy-hieu-phim-vector.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const NEN_VEC = '013ec5d';                             // 29/10 vòi phun hình (Xe cứu hỏa R1): nền VECTOR = 013ec5d (part 'hoi' vẽ thành vòi phun hai đầu, vật 'bong' thành khối nước tóe giọt, tia nước / vũng trên sân, thẻ đạn giọt nước, icon denSung vòi phun, huy hiệu có tia nước, phim mùa 2 dùng PhimVector.voiPhun + tia .pg-nuoc; so aaeee1f chỉ lệch đúng chỗ có súng / bóng: 13a-v sung-hoi.3 (giải + sai), luc-ban.8; A3-v 8 huy hiệu vẽ 'hoi' / 'bong' (sung-hoi, luc-ban, che-sung-hoi, che-luc-ban, be-sung, che-be-sung, tong-hop-2, nha-may-chay) × 3 trạng thái; B5-v 33 khung phim mùa 2 có robot gắn 'hoi' / bắn nước (mọi khung từ sung-hoi.1 tới nha-may-chay.4; xich.1–4 và phim mùa 1 y nguyên)). Trước đó: 29/10 gộp nhánh điều phối vào main: nền VECTOR = aaeee1f (hợp một tay kẹp V8c + phim xuất xưởng / xich.1 của main; so fbc976e chỉ lệch robot.2, xich.1; so 32513bf chỉ lệch tay kẹp). Trước đó: 29/10 V8c một tay kẹp: nền VECTOR = fbc976e (tay kẹp vẽ y hệt tay xoay ở nấc trước: cụm giữa tâm (50, 84), khớp tròn vành bạc + đèn, hàm khop dùng chung; chứng minh: hoàn ve-vector-tay-kep.js + ve-vector-tay-xoay.js về ad0899a thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 V8b tay xoay cùng hình tay kẹp: nền VECTOR = fa7637a (tay xoay vẽ bằng càng / cụm / đèn của tay kẹp, thêm khớp tròn vành bạc; chứng minh: hoàn ve-vector-tay-kep.js + ve-vector-tay-xoay.js về e4b3e11 thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 mắt theo đội: nền VECTOR = 6a4276d (lõi / quầng mắt R2 hồng, mắt trái tim cùng màu mắt đội; chứng minh: hoàn bang-mau.js + ve-vector.js về b38c6be thì 13a-v / A3-v / B5-v / C3-v xanh). Trước đó: 29/10 gộp V8a: nền VECTOR = 3fe6fa8 (thân omni / nhện vuông bo, chân nhện ba khúc, dáng bò; trước đó 8d930ae: mắt vui cung tròn mảnh, mắt tim viền trắng thắng màn; trước đó f8331e9, trước đó eb553bd, huy hiệu mắt thường, phim mở đầu hình bộ phận thật; trước đó 6e04104 = V7c3 e3 (đo chữ bằng phông vector, bỏ fillStyle thừa; trước đó 8780764 gộp V7c2, c830c12 gộp V7b); A3-v / B5-v so bản vector mới với nền này (phanh thay A3 / B5 khi gỡ pixel)
const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const goc = path.resolve(day, '..');
const require = createRequire(import.meta.url);
const LOI_GIA = process.argv.includes('--loi-gia');

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
  console.log('(đang cắm lỗi giả: bảy lỗi, các mục A1 A2 A3 A6 B2 B3 B4 phải đỏ)');
  SUA['huy-hieu-vector.js'] = (s) => s.replace("dk('be-sung',", "dk('be-sung-loi-gia',");
  SUA['huy-hieu.js'] = (s) => s.replace("e.style.width = e.style.height = CO_GOC * s + 'px';", "e.style.width = e.style.height = (CO_GOC * s + 1) + 'px';");     // V7c2: mk lệch 1 px CSS (trước: vePixel dời sao, bộ pixel đã xoá) → A3-v đỏ
  SUA['phim-mua-1.js'] = (s) => s.replace('var VAT = VEC ? kepPx(3).vat : 57;', 'var VAT = 57;');
  SUA['phim-vector.js'] = (s) => s.replace("if (ten === 'wall')", "if (ten === 'wallX')");
  SUA['phim-goi.js'] = (s) => s.replace('bao.mat = function (kieu) { if (!vec) return bao;', 'bao.mat = function (kieu) { if (true) return bao;');
}
const nguon = (f) => { const s = doc(f); return SUA[f] ? SUA[f](s) : s; };

/* ---------------------------------------------------------------- DOM + canvas giả */
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
class Cls { constructor(el) { this.s = new Set(); } add(...c) { c.forEach((x) => x && this.s.add(x)); } remove(...c) { c.forEach((x) => this.s.delete(x)); } toggle(c, b) { if (b === undefined ? !this.s.has(c) : b) this.s.add(c); else this.s.delete(c); return this.s.has(c); } contains(c) { return this.s.has(c); } }
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
    toDataURL() { return 'data:,'; }
    set className(v) { this.classList = new Cls(); String(v || '').split(/\s+/).filter(Boolean).forEach((c) => this.classList.add(c)); }
    get className() { return [...this.classList.s].join(' '); }
    set textContent(v) { this._text = String(v); this.children = []; }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    set innerHTML(v) {
      this.children.forEach((c) => { c.parent = null; }); this.children = []; this._text = '';
      const re = /<(\w+)([^>]*)><\/\1>/g; let m;                                          // đủ cho mẫu <span data-i=…></span> của máy kiểm
      while ((m = re.exec(String(v)))) { const e = new El(m[1]); for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) e.setAttribute(a[1], a[2]); this.appendChild(e); }
    }
    get firstChild() { return this.children[0] || null; }
    appendChild(e) { if (e.parent) e.remove(); e.parent = this; this.children.push(e); return e; }
    insertBefore(e, ref) { if (e.parent) e.remove(); e.parent = this; const i = this.children.indexOf(ref); this.children.splice(i < 0 ? this.children.length : i, 0, e); return e; }
    remove() { if (this.parent) { this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; } }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
    addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
    click() { (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {} })); }
    tim(f) { const kq = []; const walk = (n) => { for (const k of n.children) { if (f(k)) kq.push(k); walk(k); } }; walk(this); return kq; }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
    querySelectorAll(sel) {
      const m = /^\[data-i="(\w+)"\]$/.exec(sel); if (m) return this.tim((k) => k.attrs['data-i'] === m[1]);
      if (sel === '[data-i]') return this.tim((k) => k.attrs['data-i'] !== undefined);
      const c = sel.replace(/^\./, ''); return this.tim((k) => k.classList.contains(c));
    }
  }
  return El;
}

/* ---------------------------------------------------------------- nạp game vào một ngữ cảnh */
const dsTep = (html) => [...html.matchAll(/<script src="([\w./-]+\.js)"/g)].map((m) => m[1])
  .filter((f) => /^(bang-mau|chu|ve|ve-vector[\w-]*|huy-hieu-vector|ve-robot|huy-hieu|phim-vector|phim-goi|phim-mua-\d+|part\/[\w-]+)\.js$/.test(f));
const DS_TEP = dsTep(doc('choi.html'));
/** nen: undefined = bản mới; 'vec' = MỌI tệp của NEN_VEC (nền vector, V7c1). cheDo chỉ còn 'vector' (V7c1: game luôn vector; ?ve= không còn tác dụng). */
function napGame(cheDo, nen) {
  const El = taoDom(), stage = new El('div'), body = new El('body'), hen = [], canhBao = [];
  const ctx = {
    console: { log() {}, info() {}, warn: (s) => canhBao.push(String(s)), error: (s) => canhBao.push(String(s)) },
    document: { createElement: (t) => new El(t), getElementById: (id) => (id === 'stage' ? stage : null), querySelector: () => null, body, documentElement: { style: { setProperty() {} } } },
    location: { search: cheDo === 'vector' ? '?ve=vector' : '?ve=pixel' }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    devicePixelRatio: 2, setTimeout: (f) => { hen.push(f); return hen.length; }, clearTimeout() {}, requestAnimationFrame: () => 0,
    Luu: { daXem: () => false, datDaXem: () => true, docCaiDat: () => ({}) }, AmThanh: { phat() {} },
    Math, JSON, Object, Array, String, Number, Boolean, Date, Error, RegExp, Map, Set, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Uint8ClampedArray
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext('var TP = { h: function (tag, cls, chu) { var e = document.createElement(tag); if (cls) e.className = cls; if (chu !== undefined && chu !== null) e.textContent = chu; return e; } };', ctx);
  for (const f of (nen === 'vec' ? dsTep(docNenVec('choi.html')) : DS_TEP)) {
    if (nen === 'vec') { vm.runInContext(docNenVec(f), ctx, { filename: 'nen-vec:' + f }); continue; }
    vm.runInContext(nguon(f), ctx, { filename: f });
  }
  if (LOI_GIA && !nen && ctx.VeVector && ctx.VeVector.HUY_HIEU) {
    ctx.VeVector.HUY_HIEU.dangKy('tay-gap', function (g) { g.fillRect(0, 0, 1, 1); });     // V7c2: hình tay-gap vẽ khác nền (trước: gọi Part.ghep của bộ pixel, nay đã xoá) → A3-v đỏ
    ctx.VeVector.HUY_HIEU.dangKy('xich', function () { throw new Error('lỗi giả: hình xich ném'); });
  }
  return { ctx, El, stage, hen, canhBao };
}

/* ---------------------------------------------------------------- A. HUY HIỆU */
console.log('== A. Huy hiệu (huy-hieu.js + huy-hieu-vector.js) ==');
const VE = napGame('vector'), NEN_V = docNenVec('huy-hieu.js') ? napGame('vector', 'vec') : null;
const DS = VE.ctx.HuyHieu.DS, TT = ['khoa', 'mo', 'xong'];
/* canvas / cây DOM → chuỗi (so từng lệnh vẽ, từng điểm ảnh, từng thuộc tính; canvas nguồn đánh số theo thứ tự gặp) — dùng cho A3-v, B5, B5-v */
let _ma2 = new Map(), _so = 0;
const tuan = (cv, sau) => {
  if (!_ma2.has(cv)) _ma2.set(cv, 'C' + (++_so));
  if (sau > 3) return _ma2.get(cv);
  return cv._w + 'x' + cv._h + '[' + (cv._data ? cv._data.length + ':' + cv._data.slice(0, 80) : '') + '|' + JSON.stringify(cv.__ctx.lenh).replace(/cv#\d+/g, 'cv') + '|' + cv.nguon.map((x) => tuan(x, sau + 1)).join(';') + ']';
};
const cay = (e) => (e.__cv ? 'canvas{' + JSON.stringify(e.style) + tuan(e, 0) + '}' : e.tag + '.' + e.className + JSON.stringify(e.style) + JSON.stringify(e.attrs) + (e._text || '') + '(' + e.children.map(cay).join(',') + ')');
const chuoiCua = (e) => { _ma2 = new Map(); _so = 0; return cay(e); };
const lechO = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return 'lệch ở ký tự ' + i + ': …' + a.slice(Math.max(0, i - 60), i + 60) + ' / …' + b.slice(Math.max(0, i - 60), i + 60); };
{
  const loi = [];
  for (const g of [VE]) for (const ma of DS) for (const tt of TT) {
    try { const cv = g.ctx.HuyHieu.ve(ma, tt); if (!cv || !cv.__cv) loi.push(ma + '/' + tt + ': không ra canvas'); const e = g.ctx.HuyHieu.mk(ma, tt, 2); if (!e || !e.__cv) loi.push(ma + '/' + tt + ': mk không ra canvas'); }
    catch (e) { loi.push(ma + '/' + tt + ': ' + e.message); }
  }
  kiem('(A1) ' + DS.length + ' mã × 3 trạng thái vẽ được (HuyHieu.ve, HuyHieu.mk)', !loi.length, loi.slice(0, 6).join(' | '));
}
const conPixel = [];
{
  const P = VE.ctx.Part || null, dem = { n: 0 }, goc0 = {};        // V7c2: bộ pixel part/ đã xoá → ctx.Part không có (không còn gì để đếm)
  if (P) ['ghep', '_veMot', 'veVatNho', 'rot90', 'lay'].forEach((k) => { goc0[k] = P[k]; P[k] = function () { dem.n++; return goc0[k].apply(this, arguments); }; });
  const sai = [];
  for (const ma of DS) {
    const mv = VE.ctx.HuyHieu.maVec(ma);
    if (!mv) { conPixel.push(ma); continue; }
    for (const tt of TT) {
      dem.n = 0; let cv, e;
      try { cv = VE.ctx.HuyHieu.ve(ma, tt); e = VE.ctx.HuyHieu.mk(ma, tt, 3); } catch (x) { sai.push(ma + '/' + tt + ' ném: ' + x.message); continue; }
      if (dem.n) sai.push(ma + '/' + tt + ': gọi Part.* ' + dem.n + ' lần');
      if (!cv.laVector || !e.laVector) sai.push(ma + '/' + tt + ': không phải canvas vector');
    }
  }
  if (P) Object.assign(P, goc0);
  const sai2 = conPixel.filter((ma) => { const cv = VE.ctx.HuyHieu.ve(ma, 'mo'); return cv.laVector || !cv._data; });
  kiem('(A2) vector: ' + (DS.length - conPixel.length) + ' mã có bản vector không gọi Part.*, ra canvas .laVector; ' + conPixel.length + ' mã chưa có bản vector rơi về pixel',
    !sai.length && !sai2.length, sai.concat(sai2.map((m) => m + ': không rơi về pixel')).slice(0, 6).join(' | '));
  console.log('      còn pixel: ' + (conPixel.join(', ') || '(không)'));
}
{
  if (!NEN_V) kiem('(A3-v) cần git và commit nền vector ' + NEN_VEC, false, 'git show lỗi');
  else {
    const khac = [], DS_NEN = NEN_V.ctx.HuyHieu.DS;
    for (const ma of DS_NEN) for (const tt of TT) {
      let a, b;
      try { a = chuoiCua(VE.ctx.HuyHieu.mk(ma, tt, 2)); } catch (e) { khac.push(ma + '/' + tt + ' mới ném ' + e.message); continue; }
      try { b = chuoiCua(NEN_V.ctx.HuyHieu.mk(ma, tt, 2)); } catch (e) { b = 'ném'; }
      if (a !== b) khac.push(ma + '/' + tt + ' ' + lechO(a, b));
    }
    const thieu = DS_NEN.filter((m) => !DS.includes(m));
    kiem('(A3-v) V7c1 VECTOR y nguyên: HuyHieu.mk(ma, tt, 2) bản mới = bản nền vector ' + NEN_VEC + ' từng lệnh vẽ (' + DS_NEN.length + ' mã × 3); mọi mã của nền vẫn còn',
      !khac.length && !thieu.length, khac.slice(0, 4).join(' | ') + (thieu.length ? ' | mất mã: ' + thieu.join(', ') : ''));
  }
}
{
  const V = VE.ctx, sai = [], ma = DS.find((m) => V.HuyHieu.maVec(m) === m && m !== 'xich' && m !== 'tay-gap') || DS[0];
  const e = V.HuyHieu.mk(ma, 'mo', 3);
  if (!e.laVector || e.style.width !== '108px') sai.push('HuyHieu.mk(' + ma + ', mo, 3): ' + e.style.width + ' vector=' + !!e.laVector);
  if (e.width !== Math.round(36 * 3 * 2 * 2)) sai.push('rasterise ' + e.width + ' px (cần 36·3·dpr 2·2 = 432)');
  const b = new VE.El('div'); b.innerHTML = '<span data-i="huyhieu" data-s="1" data-ma="' + ma + '" data-tt="xong"></span><span data-i="huyhieu" data-s="2" data-ma="khong-co-ma"></span>';
  V.Ve.hydrate(b);
  const [h1, h2] = b.children.map((c) => c.firstChild);
  if (!h1 || !h1.laVector || h1.style.width !== '36px') sai.push('hydrate data-ma=' + ma + ': ' + (h1 && h1.style.width) + ' vector=' + !!(h1 && h1.laVector));
  if (!h2 || !h2.laVector || h2.style.width !== '72px' || h2.__ctx.lenh.length) sai.push('hydrate mã lạ: phải ra canvas trống 72 px, cờ laVector (V7c2: hết hình pixel): ' + (h2 && h2.style.width));
  kiem('(A4) vector: HuyHieu.mk(ma, tt, s) → canvas vector 36·s px CSS (rasterise × dpr × 2); Ve.hydrate [data-i="huyhieu"] gọi HuyHieu.mk → bản vector, mã lạ ra canvas trống cùng cỡ (V7c2); V7b: không còn bọc Ve.mk / Ve.hydrate', !sai.length, sai.join(' | '));
}
{
  const TTC = require(path.join(day, 'thu-tu-chuong.js'));
  const can = new Set(TTC.goi.filter((g) => g.mua === 'mua-1' || !g.mua).map((g) => g.hinh || g.chuong[0]));
  for (const m of ['hai-banh', 'tay-gap', 'khoang-cach', 'che-tay', 'che-xe', 'tay-xoay', 'cam-bien-ben', 'hai-robot']) can.add(m);
  const thieu = [...can].filter((m) => DS.includes(m) && !VE.ctx.HuyHieu.maVec(m));
  kiem('(A5) huy hiệu mọi gói mùa 1 và huy hiệu bay trong phim "robot" có bản vector (' + can.size + ' mã)', !thieu.length, thieu.join(', '));
}
{
  // CHO_V7B: mã của gói 10 mùa 2 (gộp song song với V7a), bản vector do V7b vẽ; V7b vẽ xong thì xoá khỏi danh sách (máy kiểm in mã đã có vector mà còn trong danh sách)
  const CHO_V7B = [];   // V7b (28/10) đã vẽ tong-hop-2, nha-may-chay; danh sách để trống: mọi mã HINH phải có vector
  const thieu = DS.filter((m) => !VE.ctx.HuyHieu.maVec(m) && !CHO_V7B.includes(m)), cho = CHO_V7B.filter((m) => DS.includes(m) && !VE.ctx.HuyHieu.maVec(m)), thua = CHO_V7B.filter((m) => VE.ctx.HuyHieu.maVec(m));
  if (cho.length) console.log('  (A6) chờ V7b vẽ bản vector: ' + cho.join(', '));
  if (thua.length) console.log('  (A6) đã có bản vector, xoá khỏi CHO_V7B: ' + thua.join(', '));
  kiem('(A6) gói V7a: mọi mã huy hiệu (' + DS.length + ' mã, đọc từ HuyHieu.DS = VeVector.HUY_HIEU.dsTatCa()) có bản vector, không mã nào rơi về pixel (trừ CHO_V7B)', !thieu.length, 'thiếu: ' + thieu.join(', '));
}
{
  const CHUP = JSON.parse(fs.readFileSync(path.join(day, 'du-lieu-chup-pixel.json'), 'utf8')).huyHieu, HH = VE.ctx.VeVector.HUY_HIEU, sai = [];
  const tap = (a) => JSON.stringify([...a].sort());
  // Mã huy hiệu VẼ MỚI sau khi gỡ pixel (không có trong bản chụp): phải có hình vector riêng; mọi mã khác vẫn y hệt bản chụp.
  const MOI_SAU_CHUP = ['bien-xich'];                     // mùa 2 xong (29/10): trùm bien-xich.10
  for (const m of MOI_SAU_CHUP) if (!HH.co(m) || CHUP.DS.includes(m)) sai.push('mã mới sau chụp ' + m + ': ' + (HH.co(m) ? 'đã có trong bản chụp, bỏ khỏi MOI_SAU_CHUP' : 'chưa có hình vector riêng'));
  const DS_CHUP = DS.filter((m) => !MOI_SAU_CHUP.includes(m));
  if (tap(DS_CHUP) !== tap(CHUP.DS)) sai.push('DS ≠ chụp: thiếu ' + CHUP.DS.filter((m) => !DS_CHUP.includes(m)).join(',') + ' / thừa ' + DS_CHUP.filter((m) => !CHUP.DS.includes(m)).join(','));
  if (JSON.stringify(HH.BI_DANH) !== JSON.stringify(CHUP.biDanh)) sai.push('BI_DANH ≠ chụp');
  for (const a of Object.keys(CHUP.biDanh)) if (VE.ctx.HuyHieu.maVec(a) !== CHUP.biDanh[a]) sai.push('maVec(' + a + ') = ' + VE.ctx.HuyHieu.maVec(a) + ' ≠ ' + CHUP.biDanh[a]);
  const rieng = [...nguon('huy-hieu.js').matchAll(/^\s*HINH\['([\w-]+)'\] = function/gm)].map((m) => m[1]).filter((m) => !DS.includes(m));
  if (rieng.length) sai.push('HINH pixel không có trong DS: ' + rieng.join(','));
  if (DS.some((m) => !HH.co(m) && !HH.BI_DANH[m])) sai.push('mã trong DS không có hình riêng lẫn bí danh');
  kiem('(A7) V7c1: HuyHieu.DS (' + DS.length + ' mã) + BI_DANH (' + Object.keys(HH.BI_DANH).length + ') là dữ liệu của huy-hieu-vector.js, y hệt dữ liệu chụp ' + JSON.parse(fs.readFileSync(path.join(day, 'du-lieu-chup-pixel.json'), 'utf8')).commit + '; mọi HINH pixel còn lại có trong DS; maVec(bí danh) = mã gốc', !sai.length, sai.join(' | '));
}

/* ---------------------------------------------------------------- B. PHIM */
console.log('\n== B. Phim gói (phim-goi.js + phim-vector.js + phim-mua-*.js) ==');
/** Chiếu một khung n của phim ma (chạy mọi hẹn giờ), trả lớp khung tranh. */
function chieu(G, ma, n) {
  const PG = G.ctx.PhimGoi; G.hen.length = 0;
  const cu = G.stage.querySelector('pg'); if (cu) cu.remove();
  PG.mo(ma, () => {});
  const lop = G.stage.querySelector('pg'), tiep = lop.querySelector('md-tiep');
  for (let i = 1; i < n; i++) { G.hen.length = 0; tiep.click(); }
  let vong = 0; while (G.hen.length && vong++ < 50) G.hen.splice(0).forEach((f) => f());
  return lop.querySelector('md-khung');
}
const PHIM_DS = VE.ctx.PhimGoi.ds();
const kho = (G, ma) => G.ctx.PhimGoi.soKhung(ma);
{
  const loi = []; const cb0 = VE.canhBao.length;
  for (const ma of PHIM_DS) for (let n = 1; n <= kho(VE, ma); n++) { try { chieu(VE, ma, n); } catch (e) { loi.push(ma + '.' + n + ': ' + e.message); } }
  VE.canhBao.slice(cb0).forEach((s) => loi.push(s));
  kiem('(B1) vector: mọi khung của ' + PHIM_DS.length + ' phim vẽ được (cả hẹn giờ), không lỗi / cảnh báo', !loi.length, loi.slice(0, 5).join(' | '));
}
{
  const V = VE.ctx, dem = { tiles: 0, nutDe: 0, cua: 0 }, g0 = { tiles: V.Ve.tiles, makeNutDe: V.Ve.makeNutDe, veCua: V.Ve.veCua };
  V.Ve.tiles = function () { dem.tiles++; return g0.tiles.apply(this, arguments); };
  V.Ve.makeNutDe = function () { dem.nutDe++; return g0.makeNutDe.apply(this, arguments); };
  V.Ve.veCua = function () { dem.cua++; return g0.veCua.apply(this, arguments); };
  const sai = [];
  for (const ma of PHIM_DS) for (let n = 1; n <= kho(VE, ma); n++) {
    const k = chieu(VE, ma, n);
    const px = k.tim((e) => e.__cv && !e.laVector);
    if (px.length) sai.push(ma + '.' + n + ': ' + px.length + ' canvas pixel (' + px.slice(0, 2).map((e) => e.style.width + '×' + e.style.height).join(', ') + ')');
  }
  Object.assign(V.Ve, g0);
  kiem('(B2) vector: mọi canvas trong khung tranh là hình vector; không gọi Ve.tiles / Ve.makeNutDe / Ve.veCua',
    !sai.length && !dem.tiles && !dem.nutDe && !dem.cua, sai.slice(0, 5).join(' | ') + ' · Ve.tiles ' + dem.tiles + ', makeNutDe ' + dem.nutDe + ', veCua ' + dem.cua);
}
{
  const V = VE.ctx, KEP = { than: 'hai-banh', tay: 'kep', camBien: [] }, sai = [];
  const oPx = (tl) => tl * V.VeRobot.PX_O_PART * V.VeRobot.PHONG_NGOAI_SAN, vk = V.VeRobot.vatKep(KEP, 'tren');
  const lech = (a, b) => Math.abs(a - b) > 0.6;
  const tam = (e) => ({ x: parseFloat(e.style.left) + parseFloat(e.style.width || 0) / 2, y: parseFloat(e.style.top) + parseFloat(e.style.height || 0) / 2 });
  // tay-gap.3: robot (110, Y) hướng phải, thùng tâm (110 + VAT, Y); cạnh thùng (thân) = vatKep.n × ô / 100
  {
    const k = chieu(VE, 'tay-gap', 3), xe = k.tim((e) => e.classList.contains('pg-xe'))[0], tg = k.children.find((e) => e.__cv && e.classList.contains('md-a') && !e.classList.contains('pg-xe'));
    if (!xe || !tg) sai.push('tay-gap.3: không thấy xe / thùng');
    else {
      const t = tam(tg), muon = parseFloat(xe.style.left) + vk.ahead * oPx(3) / 100, than = parseFloat(tg.style.width) * 0.76, canThan = vk.n * oPx(3) / 100;
      if (lech(t.x, muon) || lech(t.y, parseFloat(xe.style.top))) sai.push('tay-gap.3: tâm thùng (' + t.x.toFixed(1) + ', ' + t.y.toFixed(1) + ') ≠ (' + muon.toFixed(1) + ', ' + xe.style.top + ')');
      if (lech(than, canThan)) sai.push('tay-gap.3: cạnh thân thùng ' + than.toFixed(1) + ' ≠ vatKep.n ' + canThan.toFixed(1));
    }
  }
  // kho-hang.3: robot hướng lên ở tỉ lệ 2 cầm thùng: lúc đầu thùng tâm (x, y − VAT2)
  {
    const PG = V.PhimGoi; VE.hen.length = 0; const cu = VE.stage.querySelector('pg'); if (cu) cu.remove();
    PG.mo('kho-hang', () => {}); const lop = VE.stage.querySelector('pg'); lop.querySelector('md-tiep').click(); VE.hen.length = 0; lop.querySelector('md-tiep').click();
    const k = lop.querySelector('md-khung'), xe = k.tim((e) => e.classList.contains('pg-xe'))[0], tg = k.children.filter((e) => e.__cv && e.classList.contains('md-a') && !e.classList.contains('pg-xe')).pop();
    if (!xe || !tg) sai.push('kho-hang.3: không thấy xe / thùng');
    else { const t = tam(tg), muon = parseFloat(xe.style.top) - vk.ahead * oPx(2) / 100; if (lech(t.y, muon) || lech(t.x, parseFloat(xe.style.left))) sai.push('kho-hang.3: tâm thùng y ' + t.y.toFixed(1) + ' ≠ ' + muon.toFixed(1)); }
    VE.hen.length = 0;
  }
  // hai-robot.3 (cuối): R2 hướng phải đặt thùng vào giữa ô đích (tâm x 282), thùng ngay trước kẹp R2 (R2 cách thùng đúng VAT)
  {
    const k = chieu(VE, 'hai-robot', 3), tg = k.children.find((e) => e.__cv && e.classList.contains('md-a') && !e.classList.contains('pg-xe')), xe = k.tim((e) => e.classList.contains('pg-xe'))[1];
    const VAT = vk.ahead * oPx(3) / 100;
    if (!tg || !xe || lech(tam(tg).x, 282) || lech(parseFloat(xe.style.left) + VAT, 282)) sai.push('hai-robot.3: tâm thùng x ' + (tg ? tam(tg).x.toFixed(1) : '?') + ', R2 ' + (xe ? xe.style.left : '?') + ' (cần thùng 282, R2 282 − VAT)');
  }
  // tay-gap.4: cả nhóm (robot + thùng) đi --d để thùng vào giữa ô đích (tâm 268)
  {
    const k = chieu(VE, 'tay-gap', 4), nhom = k.tim((e) => e.classList.contains('md-di'))[0];
    const d = nhom ? parseFloat(nhom.style['--d']) : NaN, VAT = vk.ahead * oPx(3) / 100;
    if (lech(110 + d + VAT, 268)) sai.push('tay-gap.4: thùng tới x ' + (110 + d + VAT).toFixed(1) + ' ≠ tâm ô đích 268');
  }
  kiem('(B3) vector: thùng nằm đúng trong kẹp theo VeRobot.vatKep × cạnh ô veCo (VAT = ' + (vk.ahead * oPx(3) / 100).toFixed(1) + ' px thay hằng pixel 57; tay-gap.3, kho-hang.3) và vào giữa ô đích (tay-gap.4, hai-robot.3)', !sai.length, sai.join(' | '));
}
{
  const V = VE.ctx, g0 = V.VeRobot.veCo, mat = {}; let phim = null;
  V.VeRobot.veCo = function (cfg, tt) { if (tt && tt.mat) (mat[phim] = mat[phim] || new Set()).add(tt.mat); return g0.apply(this, arguments); };
  for (const ma of PHIM_DS) { phim = ma; for (let n = 1; n <= kho(VE, ma); n++) chieu(VE, ma, n); }
  V.VeRobot.veCo = g0;
  const co = Object.keys(mat), kieu = new Set(co.flatMap((m) => [...mat[m]]));
  kiem('(B4) vector: robot trong phim có mắt biểu cảm ở ' + co.length + ' / ' + PHIM_DS.length + ' phim (cần ≥ 8, có vui và ngac): ' + [...kieu].join(', '), co.length >= Math.min(8, PHIM_DS.length) && kieu.has('vui') && kieu.has('ngac'), PHIM_DS.filter((m) => !mat[m]).join(', '));
}
{
  if (!NEN_V) kiem('(B5-v) cần git và commit nền vector ' + NEN_VEC, false, 'git show lỗi');
  else {
    const VE2 = napGame('vector'), khac = [], PHIM_NEN = NEN_V.ctx.PhimGoi.ds(), mat = PHIM_NEN.filter((m) => !PHIM_DS.includes(m));
    let soKhung = 0;
    for (const ma of PHIM_NEN) for (let n = 1; n <= kho(NEN_V, ma); n++) {
      soKhung++;
      let a, b;
      try { a = chuoiCua(chieu(VE2, ma, n)); } catch (e) { khac.push(ma + '.' + n + ' mới ném ' + e.message); continue; }
      b = chuoiCua(chieu(NEN_V, ma, n));
      if (a !== b) khac.push(ma + '.' + n + ' ' + lechO(a, b));
    }
    kiem('(B5-v) V7c1 VECTOR y nguyên: cây DOM + lệnh vẽ của ' + soKhung + ' khung (sau mọi hẹn giờ) của ' + PHIM_NEN.length + ' phim bản nền vector ' + NEN_VEC + ' = bản mới; không mất phim', !khac.length && !mat.length, khac.slice(0, 2).join('\n      ') + (mat.length ? ' | mất phim: ' + mat.join(', ') : ''));
  }
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm');
if (hong) process.exit(1);
