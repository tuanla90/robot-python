/* ============================================================================
   dom-gia-khay.mjs — DOM GIẢ cho máy kiểm khay (game/thanh-phan.js) chạy bằng Node. Không phải máy kiểm.
   Đủ cho Palette, Editor và các bảng chọn: phần tử El (class, data-*, con, click), document giả, #stage.
   napKhay(them): nạp chu.js, huong-dan.js, thanh-phan.js vào một vm riêng → { TP, ctx, stage, El, khayMoi, noiDung, quetThe, dungEditor }.
   Rút từ kiem-list.mjs (giữ y cách làm ở đó).
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const day = path.dirname(fileURLToPath(import.meta.url));

function unesc(s) { return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&'); }
function khop(el, sel) {                                                   // một phần chọn đơn: tag.a.b[data-x="y"][data-z]
  const tag = /^[a-z]+/.exec(sel);
  if (tag && el.tag !== tag[0]) return false;
  const m = sel.match(/\.[\w-]+|\[[\w-]+(?:="[^"]*")?\]/g) || [];
  return m.every((p) => {
    if (p[0] === '.') return el._cls.has(p.slice(1));
    const a = /\[([\w-]+)(?:="([^"]*)")?\]/.exec(p);
    return a[2] === undefined ? el.attrs[a[1]] !== undefined : el.attrs[a[1]] === a[2];
  });
}
export class El {
  constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.handlers = {}; this._cls = new Set(); this.style = {}; this.parentNode = null; this._text = ''; this._html = ''; this.disabled = false; this.scrollTop = 0; this.clientHeight = 400; this.scrollHeight = 300; this.clientWidth = 40; this.scrollWidth = 40; this.offsetHeight = 40; this.offsetWidth = 100; }
  get className() { return [...this._cls].join(' '); }
  set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() {
    const s = this._cls;
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), contains: (c) => s.has(c), toggle: (c, f) => { const on = f === undefined ? !s.has(c) : !!f; if (on) s.add(c); else s.delete(c); return on; } };
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref) { c.parentNode = this; const i = this.children.indexOf(ref); if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; }
  get firstChild() { return this.children[0] || null; }
  get nextSibling() { const p = this.parentNode; if (!p) return null; const i = p.children.indexOf(this); return p.children[i + 1] || null; }
  set innerHTML(v) {                                                      // chỉ các <span class=".." data-..>…</span> (kể cả lồng nhau) được dựng lại thành phần tử: đủ cho dòng code
    this.children = []; this._html = String(v); this._text = '';
    const re = /<span class="([^"]*)"((?:\s+[\w-]+="[^"]*")*)>|<\/span>|([^<]+)/g, pila = [this];
    let m;
    while ((m = re.exec(this._html))) {
      const top = pila[pila.length - 1];
      if (m[3] !== undefined) { if (top !== this) top._text += unesc(m[3]); continue; }
      if (m[0] === '</span>') { if (pila.length > 1) pila.pop(); continue; }
      const e = new El('span'); e.className = m[1];
      (m[2].match(/[\w-]+="[^"]*"/g) || []).forEach((a) => { const q = /([\w-]+)="([^"]*)"/.exec(a); e.attrs[q[1]] = unesc(q[2]); });
      e.parentNode = top; top.children.push(e); pila.push(e);
    }
  }
  get innerHTML() { return this._html; }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] === undefined ? null : this.attrs[k]; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); }
  click() { if (this.disabled) return; (this.handlers.click || []).forEach((fn) => fn({ stopPropagation() {}, preventDefault() {}, target: this })); }
  contains(el) { for (let n = el; n; n = n.parentNode) if (n === this) return true; return false; }
  closest(sel) { for (let n = this; n; n = n.parentNode) if (n._cls && khop(n, sel)) return n; return null; }
  querySelectorAll(sel) {
    const phan = sel.trim().split(/\s+/), kq = [];
    const di = (n, ngu) => { for (const k of n.children) { const du = ngu < phan.length && khop(k, phan[ngu]); if (du && ngu === phan.length - 1) kq.push(k); di(k, du ? ngu + 1 : ngu); } };
    di(this, 0);
    return kq;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  getBoundingClientRect() { return { left: 50, right: 80, top: 100, bottom: 120, width: 30, height: 20 }; }
}

/** Nạp khay vào vm riêng. them: biến toàn cục thêm (SanHoc, KhungCode, ManHoc…). */
export function napKhay(them = {}) {
  const stage = new El('div'); stage.id = 'stage'; stage.offsetWidth = 360; stage.offsetHeight = 640; stage.getBoundingClientRect = () => ({ left: 0, top: 0, right: 360, bottom: 640, width: 360, height: 640 });
  const doc = {
    addEventListener() {}, createElement: (tag) => new El(tag), createTextNode: (s) => { const e = new El('#text'); e._text = String(s); return e; },
    getElementById: (id) => (id === 'stage' ? stage : null), body: new El('body')
  };
  const luuGia = { co: {}, daXem(k) { return !!this.co[k]; }, datDaXem(k) { this.co[k] = true; return true; } };
  const ctx = vm.createContext(Object.assign({
    console, document: doc, getComputedStyle: () => ({ fontSize: '11px' }), Ve: { ico: () => new El('i'), khoa: () => new El('i') }, Luu: luuGia,
    setTimeout: (f, ms) => { const h = setTimeout(f, ms); if (h && h.unref) h.unref(); return h; }, clearTimeout, addEventListener() {}, removeEventListener() {}
  }, them));
  ctx.window = ctx;
  for (const f of ['chu.js', 'huong-dan.js', 'thanh-phan.js']) vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctx, { filename: f });
  const TP = ctx.TP;

  function khayMoi(cb) {
    const bang = new El('div'), bh = new El('div'); bh.className = 'bh';
    const tt = new El('span'); tt.className = 'tt'; bh.appendChild(tt);
    const host = new El('div'); host.className = 'pal';
    bang.appendChild(bh); bang.appendChild(host);
    const pal = new TP.Palette(host, Object.assign({ khiChen() {}, khiSua() {}, khiBien() {}, khiMoi() {} }, cb || {}));
    return { pal, host, bh };
  }
  /** Các nhóm / khối đang hiện trong khay: "## NHÃN NHÓM" / data-ten của khối. */
  function noiDung(host) {
    const kq = [];
    (function di(n) { for (const c of n.children) { if (c._cls.has('gl')) kq.push('## ' + c.children[0].textContent); else if (c._cls.has('brick')) kq.push(c.getAttribute('data-ten')); else di(c); } })(host);
    return kq;
  }
  /** Nội dung từng thẻ của khay: { than: [...], tay: [...], cam: [...] }. */
  function quetThe(k) {
    const kq = {}, ds = k.pal.dsThe();
    if (ds.length < 2) { kq[k.pal.theHienTai()] = noiDung(k.host); return kq; }
    const nhan = (c) => k.bh.querySelector('.pal-the').children.filter((x) => x._cls.has('cuon-b'))[c];
    for (let i = 0; i < ds.length; i++) { kq[k.pal.theHienTai()] = noiDung(k.host); nhan(1).click(); }
    return kq;
  }
  /** Khối có data-ten = khoa trong khay đang hiện (null nếu không có). */
  function khoi(k, khoa) { let b = null; (function di(n) { for (const c of n.children) { if (c.getAttribute && c.getAttribute('data-ten') === khoa) b = b || c; else di(c); } })(k.host); return b; }
  /** Một Editor trên DOM giả. Trả { ed, arr, nDoi, host, hang(i), o(i, sel), cham(i, sel), bang(), nut(sel), dongBang() }. */
  function dungEditor(dong, tuyChon) {
    const arr = dong.slice(), host = new El('div'), st = { nDoi: 0 };
    const ed = new TP.Editor(host, Object.assign({ tong: 10, dung: 10, lay: () => arr, khiDoi: () => { st.nDoi++; }, thutLe: () => true }, tuyChon || {}));
    const hang = (i) => ed.hangEl(i), strip = (i) => hang(i).children[1];
    const o = (i, sel) => strip(i).querySelector(sel);
    const bang = () => stage.children.filter((c) => c._cls.has('chon-so'))[0] || null;
    const nut = (sel) => { const b = bang(); return b ? b.querySelector(sel) : null; };
    const cham = (i, sel) => { const so = o(i, sel); if (!so) throw new Error('không có ô ' + sel + ' ở dòng ' + i); hang(i).handlers.click[0]({ target: { closest: (s) => (s === '.num' ? so : null) }, pointerType: 'mouse' }); };
    const dongBang = () => { TP.dongChonSo(); };
    return Object.assign(st, { ed, arr, host, hang, o, bang, nut, cham, dongBang });
  }
  return { TP, ctx, stage, El, khayMoi, noiDung, quetThe, khoi, dungEditor };
}
