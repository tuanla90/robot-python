/* ============================================================================
   kiem-huy-hieu-phim-vector.mjs — máy kiểm gói V6: HUY HIỆU và PHIM vẽ bằng bộ vẽ vector ("Robot Chấn Hưng").
   Chạy game THẬT trong ngữ cảnh vm (bang-mau, chu, ve, part/*, ve-vector*, huy-hieu-vector, ve-robot, huy-hieu, phim-vector, phim-goi, phim-mua-*) với DOM + canvas giả
   ghi lệnh, hai chế độ: pixel (không ?ve=) và vector (?ve=vector).
   A. HUY HIỆU
     A1 mọi mã HuyHieu.DS × ba trạng thái (khoa / mo / xong) vẽ được ở CẢ HAI chế độ (HuyHieu.ve, HuyHieu.mk), không ném lỗi.
     A2 vector: mã có bản vector (HuyHieu.maVec) KHÔNG gọi Part.* (ghep, _veMot, veVatNho, rot90, lay) và ra canvas .laVector; mã chưa có bản vector rơi về pixel (liệt kê).
     A3 pixel y nguyên: HuyHieu.vePixel bản mới = HuyHieu.ve bản nền (commit NEN) từng điểm ảnh; ở pixel HuyHieu.ve = vePixel; Ve.mk / Ve.hydrate không bị bọc.
     A4 vector: cầu nối Ve.mk(HuyHieu.ve(…), s) ra canvas vector cỡ 36·s px CSS; Ve.hydrate điền [data-i="huyhieu"] bằng bản vector; mã lạ vẫn ra hình pixel.
     A5 phủ: huy hiệu của mọi gói mùa 1 (ThuTuChuong.goi: hinh / chương đầu) và các huy hiệu bay trong phim "robot" đều có bản vector.
     A6 (gói V7a) phủ hết: MỌI mã HINH của huy-hieu.js (HuyHieu.DS = Object.keys(HINH), không danh sách cứng: gói sau thêm mã là thấy thiếu) có bản vector (HuyHieu.maVec).
   B. PHIM (mọi phim ở PhimGoi, chạy đủ khung và mọi hẹn giờ)
     B1 vector: mọi khung vẽ được, không lỗi / cảnh báo.
     B2 vector: mọi canvas trong khung tranh là hình vector (.laVector: ô, cờ, nút đè, cửa, sao, icon bộ phận, robot, huy hiệu); không gọi Ve.tiles / Ve.makeNutDe / Ve.veCua.
     B3 vector: thùng nằm đúng trong kẹp — tâm thùng = tâm thân + VeRobot.vatKep (1/100 ô) × cạnh ô veCo, không theo hằng pixel 57 (tay-gap.3, kho-hang.3, hai-robot.3);
        cạnh thùng theo vatKep.n.
     B4 vector: robot trong phim dùng mắt biểu cảm (VeRobot.veCo nhận trangThai.mat) ở ≥ 8 phim, có cả 'vui' lẫn 'ngac'.
     B5 pixel y nguyên: cây DOM của từng khung (sau mọi hẹn giờ) bản mới = bản nền (phim-goi.js, phim-mua-1.js, huy-hieu.js của NEN).
   Cờ --loi-gia: cắm bảy lỗi (hình tay-gap gọi Part.ghep, vePixel dời sao, hình xich ném lỗi, VAT về 57, PhimVector bỏ ô tường, xe().mat không đổi gì,
   V7a: bỏ bản vector của be-sung) → máy kiểm phải ĐỎ.
   Chạy: node hoc/kiem-huy-hieu-phim-vector.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const NEN = 'fa3702f';                                 // nhánh V6 tạo từ đây: huy-hieu.js / phim-goi.js / phim-mua-1.js trước V6
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
const docNen = (f) => { try { return execFileSync('git', ['-C', goc, 'show', NEN + ':hoc/game/' + f], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return null; } };

/* ---------------------------------------------------------------- lỗi giả (đổi nguồn trong bộ nhớ) */
const SUA = {};
if (LOI_GIA) {
  console.log('(đang cắm lỗi giả: bảy lỗi, các mục A1 A2 A3 A6 B2 B3 B4 phải đỏ)');
  SUA['huy-hieu-vector.js'] = (s) => s.replace("dk('be-sung',", "dk('be-sung-loi-gia',");
  SUA['huy-hieu.js'] = (s) => s.replace("if (tt === 'xong') veSao(p, 28, 30);", "if (tt === 'xong') veSao(p, 27, 30);");
  SUA['phim-mua-1.js'] = (s) => s.replace('var VAT = VEC ? kepPx(3).vat : 57;', 'var VAT = 57;');
  SUA['phim-vector.js'] = (s) => s.replace("if (ten === 'wall')", "if (ten === 'wallX')");
  SUA['phim-goi.js'] = (s) => s.replace('bao.mat = function (kieu) { if (!vec) return bao;', 'bao.mat = function (kieu) { if (true) return bao;');
}
const nguon = (f, nen) => { const s = nen ? docNen(f) : doc(f); return !nen && SUA[f] ? SUA[f](s) : s; };

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
const DS_TEP = [...doc('choi.html').matchAll(/<script src="([\w./-]+\.js)"/g)].map((m) => m[1])
  .filter((f) => /^(bang-mau|chu|ve|ve-vector[\w-]*|huy-hieu-vector|ve-robot|huy-hieu|phim-vector|phim-goi|phim-mua-\d+|part\/[\w-]+)\.js$/.test(f));
function napGame(cheDo, nen) {
  const El = taoDom(), stage = new El('div'), body = new El('body'), hen = [], canhBao = [];
  const ctx = {
    console: { log() {}, info() {}, warn: (s) => canhBao.push(String(s)), error: (s) => canhBao.push(String(s)) },
    document: { createElement: (t) => new El(t), getElementById: (id) => (id === 'stage' ? stage : null), querySelector: () => null, body, documentElement: { style: { setProperty() {} } } },
    location: { search: cheDo === 'vector' ? '?ve=vector' : '' }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    devicePixelRatio: 2, setTimeout: (f) => { hen.push(f); return hen.length; }, clearTimeout() {}, requestAnimationFrame: () => 0,
    Luu: { daXem: () => false, datDaXem: () => true, docCaiDat: () => ({}) }, AmThanh: { phat() {} },
    Math, JSON, Object, Array, String, Number, Boolean, Date, Error, RegExp, Map, Set, Symbol, Promise, parseFloat, parseInt, isFinite, isNaN, Uint8ClampedArray
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext('var TP = { h: function (tag, cls, chu) { var e = document.createElement(tag); if (cls) e.className = cls; if (chu !== undefined && chu !== null) e.textContent = chu; return e; } };', ctx);
  for (const f of DS_TEP) {
    const laNen = nen && ['huy-hieu.js', 'phim-goi.js', 'phim-mua-1.js'].includes(f);
    if (nen && ['huy-hieu-vector.js', 'phim-vector.js'].includes(f)) continue;          // bản nền chưa có tệp V6
    vm.runInContext(laNen ? docNen(f) : nguon(f), ctx, { filename: f });
  }
  if (LOI_GIA && !nen && ctx.VeVector && ctx.VeVector.HUY_HIEU) {
    const P = ctx.Part;
    ctx.VeVector.HUY_HIEU.dangKy('tay-gap', function () { P.ghep({ than: 'hai-banh', tay: 'kep', camBien: [] }, {}, 0); });
    ctx.VeVector.HUY_HIEU.dangKy('xich', function () { throw new Error('lỗi giả: hình xich ném'); });
  }
  return { ctx, El, stage, hen, canhBao };
}

/* ---------------------------------------------------------------- A. HUY HIỆU */
console.log('== A. Huy hiệu (huy-hieu.js + huy-hieu-vector.js) ==');
const PX = napGame('pixel'), VE = napGame('vector'), NEN_G = docNen('huy-hieu.js') ? napGame('pixel', true) : null;
const DS = PX.ctx.HuyHieu.DS, TT = ['khoa', 'mo', 'xong'];
{
  const loi = [];
  for (const g of [PX, VE]) for (const ma of DS) for (const tt of TT) {
    try { const cv = g.ctx.HuyHieu.ve(ma, tt); if (!cv || !cv.__cv) loi.push(ma + '/' + tt + ': không ra canvas'); const e = g.ctx.HuyHieu.mk(ma, tt, 2); if (!e || !e.__cv) loi.push(ma + '/' + tt + ': mk không ra canvas'); }
    catch (e) { loi.push((g === PX ? 'pixel ' : 'vector ') + ma + '/' + tt + ': ' + e.message); }
  }
  kiem('(A1) ' + DS.length + ' mã × 3 trạng thái vẽ được ở pixel và vector (HuyHieu.ve, HuyHieu.mk)', !loi.length, loi.slice(0, 6).join(' | '));
}
const conPixel = [];
{
  const P = VE.ctx.Part, dem = { n: 0 }, goc0 = {};
  ['ghep', '_veMot', 'veVatNho', 'rot90', 'lay'].forEach((k) => { goc0[k] = P[k]; P[k] = function () { dem.n++; return goc0[k].apply(this, arguments); }; });
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
  Object.assign(P, goc0);
  const sai2 = conPixel.filter((ma) => { const cv = VE.ctx.HuyHieu.ve(ma, 'mo'); return cv.laVector || !cv._data; });
  kiem('(A2) vector: ' + (DS.length - conPixel.length) + ' mã có bản vector không gọi Part.*, ra canvas .laVector; ' + conPixel.length + ' mã chưa có bản vector rơi về pixel',
    !sai.length && !sai2.length, sai.concat(sai2.map((m) => m + ': không rơi về pixel')).slice(0, 6).join(' | '));
  console.log('      còn pixel: ' + (conPixel.join(', ') || '(không)'));
}
{
  if (!NEN_G) kiem('(A3) cần git và commit nền ' + NEN, false, 'git show lỗi');
  else {
    const khac = [];
    for (const ma of DS) for (const tt of TT) {
      let a, b, c;
      try { a = PX.ctx.HuyHieu.vePixel(ma, tt)._data; c = PX.ctx.HuyHieu.ve(ma, tt)._data; } catch (e) { khac.push(ma + '/' + tt + ' mới ném ' + e.message); continue; }
      try { b = NEN_G.ctx.HuyHieu.DS.indexOf(ma) >= 0 ? NEN_G.ctx.HuyHieu.ve(ma, tt)._data : a; } catch (e) { b = 'ném'; }
      if (a !== b) khac.push(ma + '/' + tt + ' khác bản nền');
      if (a !== c) khac.push(ma + '/' + tt + ' HuyHieu.ve ≠ vePixel ở pixel');
    }
    const boc = !/phongVec/.test(PX.ctx.Ve.mk.toString()) || !/querySelectorAll\('\[data-i\]'\)/.test(PX.ctx.Ve.hydrate.toString());
    kiem('(A3) pixel y nguyên: vePixel mới = HuyHieu.ve bản ' + NEN + ' từng điểm ảnh (' + DS.length + ' × 3), ở pixel HuyHieu.ve = vePixel, Ve.mk / Ve.hydrate không bọc',
      !khac.length && !boc, khac.slice(0, 6).join(' | ') + (boc ? ' | Ve.mk / hydrate bị bọc ở pixel' : ''));
  }
}
{
  const V = VE.ctx, sai = [], ma = DS.find((m) => V.HuyHieu.maVec(m) === m && m !== 'xich' && m !== 'tay-gap') || DS[0];
  const e = V.Ve.mk(V.HuyHieu.ve(ma, 'mo'), 3);
  if (!e.laVector || e.style.width !== '108px') sai.push('Ve.mk(HuyHieu.ve(' + ma + '), 3): ' + e.style.width + ' vector=' + !!e.laVector);
  if (e.width !== Math.round(36 * 3 * 2 * 2)) sai.push('rasterise ' + e.width + ' px (cần 36·3·dpr 2·2 = 432)');
  const b = new VE.El('div'); b.innerHTML = '<span data-i="huyhieu" data-s="1" data-ma="' + ma + '" data-tt="xong"></span><span data-i="huyhieu" data-s="2" data-ma="khong-co-ma"></span>';
  V.Ve.hydrate(b);
  const [h1, h2] = b.children.map((c) => c.firstChild);
  if (!h1 || !h1.laVector || h1.style.width !== '36px') sai.push('hydrate data-ma=' + ma + ': ' + (h1 && h1.style.width) + ' vector=' + !!(h1 && h1.laVector));
  if (!h2 || h2.laVector) sai.push('hydrate mã lạ: phải ra hình pixel');
  kiem('(A4) vector: Ve.mk(HuyHieu.ve(…), s) → canvas vector 36·s px CSS (rasterise × dpr × 2); Ve.hydrate [data-i="huyhieu"] điền bản vector, mã lạ vẫn pixel', !sai.length, sai.join(' | '));
}
{
  const TTC = require(path.join(day, 'thu-tu-chuong.js'));
  const can = new Set(TTC.goi.filter((g) => g.mua === 'mua-1' || !g.mua).map((g) => g.hinh || g.chuong[0]));
  for (const m of ['hai-banh', 'tay-gap', 'khoang-cach', 'che-tay', 'che-xe', 'tay-xoay', 'cam-bien-ben', 'hai-robot']) can.add(m);
  const thieu = [...can].filter((m) => DS.includes(m) && !VE.ctx.HuyHieu.maVec(m));
  kiem('(A5) huy hiệu mọi gói mùa 1 và huy hiệu bay trong phim "robot" có bản vector (' + can.size + ' mã)', !thieu.length, thieu.join(', '));
}
{
  const thieu = DS.filter((m) => !VE.ctx.HuyHieu.maVec(m));
  kiem('(A6) gói V7a: mọi mã HINH của huy-hieu.js (' + DS.length + ' mã, đọc từ HuyHieu.DS) có bản vector, không mã nào rơi về pixel', !thieu.length, 'thiếu: ' + thieu.join(', '));
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
const PHIM_DS = PX.ctx.PhimGoi.ds();
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
  if (!NEN_G) kiem('(B5) cần git và commit nền ' + NEN, false, 'git show lỗi');
  else {
    const PX2 = napGame('pixel');
    const ma2 = new Map(); let so = 0;
    const tuan = (cv, sau) => {                                                         // canvas → chuỗi: cỡ, lệnh (canvas nguồn đánh số theo thứ tự gặp), dữ liệu điểm ảnh
      if (!ma2.has(cv)) ma2.set(cv, 'C' + (++so));
      if (sau > 3) return ma2.get(cv);
      return cv._w + 'x' + cv._h + '[' + (cv._data ? cv._data.length + ':' + cv._data.slice(0, 80) : '') + '|' + JSON.stringify(cv.__ctx.lenh).replace(/cv#\d+/g, 'cv') + '|' + cv.nguon.map((x) => tuan(x, sau + 1)).join(';') + ']';
    };
    const cay = (e) => (e.__cv ? 'canvas{' + JSON.stringify(e.style) + tuan(e, 0) + '}' : e.tag + '.' + e.className + JSON.stringify(e.style) + JSON.stringify(e.attrs) + (e._text || '') + '(' + e.children.map(cay).join(',') + ')');
    const khac = [];
    for (const ma of PHIM_DS) for (let n = 1; n <= kho(PX2, ma); n++) {
      ma2.clear(); so = 0; const a = cay(chieu(PX2, ma, n));
      ma2.clear(); so = 0; const b = cay(chieu(NEN_G, ma, n));
      if (a !== b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; khac.push(ma + '.' + n + ' lệch ở ký tự ' + i + ': …' + a.slice(Math.max(0, i - 60), i + 60) + ' / …' + b.slice(Math.max(0, i - 60), i + 60)); }
    }
    kiem('(B5) pixel y nguyên: cây DOM + lệnh vẽ của mọi khung (sau mọi hẹn giờ) bản mới = bản ' + NEN, !khac.length, khac.slice(0, 2).join('\n      '));
  }
}

console.log('\n---------------------------------------------\nĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm');
if (hong) process.exit(1);
